package serve

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/disksing/forge/internal/app"
)

func (m *agentManager) agentHubRuntimeConfig() (config, *agentHubClient, error) {
	cfg, err := m.server.loadConfig()
	if err != nil {
		return config{}, nil, err
	}
	if cfg.Version < agentHubConfigVersion {
		return config{}, nil, errors.New("Forge chat requires current AgentHub settings; save AgentHub settings before starting a new run")
	}
	if strings.TrimSpace(cfg.AgentHubInstanceID) == "" {
		return config{}, nil, errors.New("AgentHub instance id is not configured")
	}
	endpoint, err := effectiveAgentHubEndpoint(cfg.AgentHubEndpoint)
	if err != nil {
		return config{}, nil, err
	}
	client, err := newAgentHubClient(endpoint, nil)
	if err != nil {
		return config{}, nil, err
	}
	return cfg, client, nil
}

func resolveAgentHubRunAgent(cfg config, req startAgentRequest) (string, error) {
	name := strings.TrimSpace(req.AgentName)
	if profile := strings.ToLower(strings.TrimSpace(req.AgentProfile)); name == "" && profile != "" {
		name = configuredAgentProfileName(cfg.AgentProfiles, profile)
	}
	if name == "" {
		name = configuredAgentProfileName(cfg.AgentProfiles, "default")
	}
	if name == "" {
		return "", errors.New("no AgentHub agent is configured")
	}
	return name, nil
}

// validateAgentHubRunAgent runs before Forge creates a session or changes the
// task. AgentHub may reject an unavailable configured target during session
// creation, but validating against the catalog first keeps a manual AutoRun
// start atomic: an unavailable selection cannot leave a queued generation or
// a Forge lock behind.
func validateAgentHubRunAgent(ctx context.Context, client *agentHubClient, requested string) (string, error) {
	requested = strings.TrimSpace(requested)
	if requested == "" {
		return "", errors.New("no AgentHub agent is configured")
	}
	catalog, err := client.Agents(ctx)
	if err != nil {
		return "", fmt.Errorf("query AgentHub agents: %w", err)
	}
	for _, agent := range catalog.Agents {
		if !strings.EqualFold(strings.TrimSpace(agent.Name), requested) {
			continue
		}
		if !agent.Available {
			reason := strings.TrimSpace(agent.UnavailableReason)
			if reason == "" {
				reason = "the AgentHub agent is unavailable"
			}
			return "", fmt.Errorf("AgentHub agent %q is unavailable: %s", agent.Name, reason)
		}
		return strings.TrimSpace(agent.Name), nil
	}
	return "", fmt.Errorf("AgentHub agent %q is unavailable or not present in the catalog", requested)
}

func (m *agentManager) startRun(w http.ResponseWriter, r *http.Request, workspaceID string) {
	workspace, err := m.server.workspace(workspaceID)
	if err != nil {
		writeError(w, err, http.StatusNotFound)
		return
	}
	var req startAgentRequest
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(&req); err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	if err := m.server.requireResourceNotExternallyLocked(workspace, req.ResourceID); err != nil {
		writeResourceOperationError(w, err, http.StatusBadRequest)
		return
	}
	cfg, client, err := m.agentHubRuntimeConfig()
	if err != nil {
		writeError(w, err, http.StatusServiceUnavailable)
		return
	}
	agentName, err := resolveAgentHubRunAgent(cfg, req)
	if err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	agentName, err = validateAgentHubRunAgent(r.Context(), client, agentName)
	if err != nil {
		writeError(w, err, http.StatusBadGateway)
		return
	}
	cwd, err := m.agentRunCwd(r.Context(), workspace, req.ResourceID, req.Cwd)
	if err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	now := time.Now().Format(time.RFC3339)
	run := agentRun{
		ID:                    newRunID(),
		WorkspaceID:           workspace.ID,
		ResourceID:            strings.TrimSpace(req.ResourceID),
		AgentProfile:          strings.TrimSpace(req.AgentProfile),
		AgentSelectionReason:  strings.TrimSpace(req.AgentSelectionReason),
		AgentHubAgentName:     agentName,
		Title:                 strings.TrimSpace(req.Title),
		Cwd:                   cwd,
		Status:                "starting",
		CreatedAt:             now,
		UpdatedAt:             now,
		SchedulerTurn:         req.SchedulerTurn,
		AutoRunGeneration:     req.AutoRunGeneration,
		PendingInitialMessage: strings.TrimSpace(req.Prompt),
	}
	if run.Title == "" {
		run.Title = agentName + " run"
	}
	run.SourceExternalID = workspace.ID + "/" + run.ID
	rt := newAgentHubRuntime(m, workspace, run, client)

	forgeSessionID, err := m.createForgeSession(r.Context(), workspace, run, cfg)
	if err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	run.ForgeSessionID = forgeSessionID
	rt.setRun(run)
	m.registerRuntime(rt)
	cleanup := true
	defer func() {
		if cleanup {
			m.removeRuntime(run.ID)
			removeForgeSessionContextFile(run.ForgeSessionContextPath, run.ForgeSessionID)
			_ = m.endForgeSession(context.Background(), workspace, forgeSessionID)
		}
	}()
	if err := m.lockForgeSession(r.Context(), workspace, forgeSessionID, run.ResourceID); err != nil {
		if externalErr := m.server.requireResourceNotExternallyLocked(workspace, run.ResourceID); isExternalResourceLockError(externalErr) {
			writeResourceOperationError(w, externalErr, http.StatusConflict)
			return
		}
		writeResourceOperationError(w, err, http.StatusBadRequest)
		return
	}
	if run.SchedulerTurn {
		if req.QueueAutoRun {
			task, queueErr := m.server.queueChatAutoRunForSession(workspace, run.ResourceID, req.ExpectedAutoRunState, app.AutoRunQueueInput{
				TaskID:    run.ResourceID,
				AgentName: req.AutoRunAgentName, AgentNameSet: req.AutoRunAgentNameSet,
				Prompt: req.AutoRunPrompt, PromptSet: req.AutoRunPromptSet,
				CompletionCriteria: req.AutoRunCompletionCriteria, CompletionCriteriaSet: req.AutoRunCompletionCriteriaSet,
			})
			if queueErr != nil {
				writeResourceOperationError(w, queueErr, http.StatusConflict)
				return
			}
			if task.AutoRun == nil {
				writeError(w, errors.New("AutoRun state update did not produce a generation"), http.StatusInternalServerError)
				return
			}
			run.AutoRunGeneration = task.AutoRun.Generation
			rt.setRun(run)
		}
		if err := m.startAutoRun(r.Context(), workspace, run); err != nil {
			writeResourceOperationError(w, err, http.StatusBadRequest)
			return
		}
	}
	contextPath, err := m.writeForgeSessionContext(r.Context(), workspace, run)
	if err != nil {
		writeError(w, err, http.StatusInternalServerError)
		return
	}
	run.ForgeSessionContextPath = contextPath
	rt.setRun(run)
	if err := saveAgentRun(workspace.Path, run); err != nil {
		writeError(w, err, http.StatusInternalServerError)
		return
	}

	source := agentHubSource{
		App: agentHubSourceApp, InstanceID: cfg.AgentHubInstanceID, ExternalID: run.SourceExternalID,
	}
	session, err := m.findOrCreateAgentHubSession(r.Context(), client, source, agentHubCreateSessionRequest{
		Title: run.Title, Cwd: run.Cwd, AgentName: agentName,
		LaunchEnvironment: map[string]string{"FORGE_SESSION_ID": forgeSessionID},
		Source:            &source,
		InitialMessage:    agentHubInitialMessage(strings.TrimSpace(req.Prompt)),
	})
	if err != nil {
		cleanup = false
		rt.setRecoveryError(m, err)
		writeError(w, err, http.StatusBadGateway)
		return
	}
	run.AgentHubSessionID = session.ID
	run.PendingInitialMessage = ""
	run.AgentHubAgentName = session.AgentName
	if run.AgentHubAgentName == "" {
		run.AgentHubAgentName = agentName
	}
	run.CompletionSessionID = session.ID
	run.CompletionCursor = session.LastEventID
	rt.setRun(run)
	cleanup = false
	if err := m.bindForgeSessionAgentHub(r.Context(), workspace, forgeSessionID, session.ID); err != nil {
		rt.setRecoveryError(m, fmt.Errorf("persist AgentHub session binding: %w", err))
		writeError(w, err, http.StatusInternalServerError)
		return
	}
	if err := saveAgentRun(workspace.Path, run); err != nil {
		rt.setRecoveryError(m, err)
		writeError(w, err, http.StatusInternalServerError)
		return
	}
	rt.applyAgentHubSessionState(m, session)
	writeJSON(w, agentRunDetail{Run: rt.snapshotRun()})
}

func agentHubInitialMessage(text string) *struct {
	Text string `json:"text"`
} {
	if text == "" {
		return nil
	}
	return &struct {
		Text string `json:"text"`
	}{Text: text}
}

func (m *agentManager) findOrCreateAgentHubSession(ctx context.Context, client *agentHubClient, source agentHubSource, request agentHubCreateSessionRequest) (agentHubSession, error) {
	found, err := findAgentHubSourceSessions(ctx, client, source)
	if err != nil {
		return agentHubSession{}, fmt.Errorf("query AgentHub source before create: %w", err)
	}
	switch len(found) {
	case 1:
		return found[0], nil
	case 0:
	default:
		return agentHubSession{}, duplicateAgentHubSourceError(source, found)
	}
	created, createErr := client.CreateSession(ctx, request)
	if createErr == nil {
		return created, nil
	}
	// Create is non-idempotent. Any response or transport failure can be
	// ambiguous, so always query the complete source tuple before deciding.
	recovered, queryErr := findAgentHubSourceSessions(context.WithoutCancel(ctx), client, source)
	if queryErr != nil {
		return agentHubSession{}, fmt.Errorf("AgentHub create outcome is unknown (%v); source recovery failed: %w", createErr, queryErr)
	}
	switch len(recovered) {
	case 1:
		return recovered[0], nil
	case 0:
		return agentHubSession{}, fmt.Errorf("create AgentHub session: %w", createErr)
	default:
		return agentHubSession{}, duplicateAgentHubSourceError(source, recovered)
	}
}

func findAgentHubSourceSessions(ctx context.Context, client *agentHubClient, source agentHubSource) ([]agentHubSession, error) {
	sessions, err := client.ListSessions(ctx, agentHubSessionFilter{
		IncludeArchived: true, SourceApp: source.App, SourceInstanceID: source.InstanceID, SourceExternalID: source.ExternalID,
	})
	if err != nil {
		return nil, err
	}
	filtered := sessions[:0]
	for _, session := range sessions {
		if session.Source != nil && session.Source.App == source.App &&
			session.Source.InstanceID == source.InstanceID && session.Source.ExternalID == source.ExternalID {
			filtered = append(filtered, session)
		}
	}
	return filtered, nil
}

func duplicateAgentHubSourceError(source agentHubSource, sessions []agentHubSession) error {
	ids := make([]string, 0, len(sessions))
	for _, session := range sessions {
		ids = append(ids, session.ID)
	}
	return fmt.Errorf("multiple AgentHub sessions match source %s/%s/%s: %s; Forge will keep the resource lock until the conflict is resolved",
		source.App, source.InstanceID, source.ExternalID, strings.Join(ids, ", "))
}

func newAgentHubRuntime(m *agentManager, workspace guiWorkspace, run agentRun, client *agentHubClient) *agentRuntime {
	return &agentRuntime{
		workspace: workspace, manager: m, run: run,
		agentHub: client,
	}
}

func forgeStatusForAgentHubState(state string) string {
	switch state {
	case "starting":
		return "starting"
	case "ready":
		return "idle"
	case "busy":
		return "running"
	case "waiting_approval":
		return "waiting_approval"
	case "stopping":
		return "stopping"
	case "stopped":
		return "stopped"
	case "archived":
		return "recovering"
	case "failed":
		return "recovering"
	default:
		return "recovering"
	}
}

func (rt *agentRuntime) setRecoveryError(m *agentManager, err error) {
	rt.mu.Lock()
	if rt.run.Status != "stopped" {
		rt.run.Status = "recovering"
	}
	rt.run.UpdatedAt = time.Now().Format(time.RFC3339)
	run := rt.run
	rt.mu.Unlock()
	_ = saveAgentRun(rt.workspace.Path, run)
	if err != nil {
		rt.addForgeNotice(m, "error", "agenthub/recovery", err.Error())
	}
}

func (rt *agentRuntime) releaseForgeSessionAfterStopped(m *agentManager) {
	rt.mu.Lock()
	run := rt.run
	rt.mu.Unlock()
	if !run.AgentHubStoppedObserved || run.Status != "stopped" || strings.TrimSpace(run.ForgeSessionID) == "" {
		return
	}
	if err := m.endForgeSession(context.Background(), rt.workspace, run.ForgeSessionID); err != nil {
		rt.addForgeNotice(m, "error", "forge/session/end", "durable stopped observed but Forge session release failed: "+err.Error())
		return
	}
	removeForgeSessionContextFile(run.ForgeSessionContextPath, run.ForgeSessionID)
	rt.mu.Lock()
	if rt.run.ForgeSessionID == run.ForgeSessionID && rt.run.AgentHubStoppedObserved {
		rt.run.ForgeSessionID = ""
		rt.run.ForgeSessionContextPath = ""
		rt.run.UpdatedAt = time.Now().Format(time.RFC3339)
		run = rt.run
	}
	rt.mu.Unlock()
	_ = saveAgentRun(rt.workspace.Path, run)
}

func (rt *agentRuntime) addForgeNotice(m *agentManager, level, method, text string) {
	rt.mu.Lock()
	runID := rt.run.ID
	rt.mu.Unlock()
	notice := forgeNotice{
		Source: "forge",
		Type:   "forge.notice",
		Time:   time.Now().Format(time.RFC3339),
		Data: forgeNoticeData{
			Level:  level,
			Method: method,
			Text:   text,
		},
	}
	m.publishNotice(runID, notice)
}

func (m *agentManager) sendAgentHubInput(w http.ResponseWriter, r *http.Request, rt *agentRuntime, req agentInputRequest, text string) {
	rt.turnActionMu.Lock()
	defer rt.turnActionMu.Unlock()
	rt.mu.Lock()
	run, state, client := rt.run, rt.agentHubState, rt.agentHub
	rt.mu.Unlock()
	if req.SchedulerTurn {
		if run.Status != "idle" {
			writeError(w, errors.New("session is busy"), http.StatusConflict)
			return
		}
		run.SchedulerTurn = true
		run.AutoRunGeneration = req.AutoRunGeneration
		if err := m.startAutoRun(r.Context(), rt.workspace, run); err != nil {
			writeError(w, err, http.StatusBadRequest)
			return
		}
		rt.setRun(run)
		_ = saveAgentRun(rt.workspace.Path, run)
	}
	steer := state == "busy" || state == "waiting_approval"
	session, err := client.Message(r.Context(), run.AgentHubSessionID, text, steer)
	if err != nil {
		// Message/steer is non-idempotent. Never repeat it; the session poller
		// reconciles the projection. Report the ambiguous outcome to the caller.
		writeError(w, fmt.Errorf("AgentHub message outcome may be unknown; it was not retried: %w", err), http.StatusBadGateway)
		return
	}
	rt.applyAgentHubSessionState(m, session)
	writeJSON(w, map[string]string{"status": "accepted"})
}

func (m *agentManager) stopAgentHubRun(w http.ResponseWriter, r *http.Request, rt *agentRuntime) {
	m.stopAgentHubRuntime(w, r, rt)
}

// stopAgentHubRuntime chooses the attached or unattached close path only after
// holding both coordination locks. This prevents recovery/resume from
// attaching a session between stopRun's classification and its cleanup.
func (m *agentManager) stopAgentHubRuntime(w http.ResponseWriter, r *http.Request, rt *agentRuntime) {
	// AutoRun dispatch and manual start/resume use this mutex as their decision
	// boundary. Acquire it before turnActionMu so a suspended generation cannot
	// be resumed between the pause CAS and the AgentHub stop.
	m.server.autoRunDispatchMu.Lock()
	defer m.server.autoRunDispatchMu.Unlock()
	rt.turnActionMu.Lock()
	defer rt.turnActionMu.Unlock()
	m.stopAgentHubRunLocked(w, r, rt)
}

func (m *agentManager) stopAgentHubRunLocked(w http.ResponseWriter, r *http.Request, rt *agentRuntime) {
	rt.mu.Lock()
	run, client := rt.run, rt.agentHub
	if strings.TrimSpace(run.AgentHubSessionID) == "" {
		rt.mu.Unlock()
		m.stopUnattachedAgentHubRunLocked(w, r, rt.workspace, run, rt)
		return
	}
	if run.Status == "stopped" && run.AgentHubStoppedObserved {
		rt.mu.Unlock()
		paused, err := pauseAutoRunBeforeStopping(rt.workspace, run, autoRunStopSession)
		if err != nil {
			writeError(w, fmt.Errorf("pause AutoRun before closing session: %w", err), http.StatusConflict)
			return
		}
		writeJSON(w, map[string]any{"status": "stopped", "autoRunPaused": paused.Transitioned})
		return
	}
	if rt.agentHubStopRequested {
		rt.mu.Unlock()
		writeError(w, errors.New("AgentHub stop outcome is still being reconciled; the stop was not retried"), http.StatusConflict)
		return
	}
	rt.mu.Unlock()
	paused, err := pauseAutoRunBeforeStopping(rt.workspace, run, autoRunStopSession)
	if err != nil {
		writeError(w, fmt.Errorf("pause AutoRun before closing session: %w", err), http.StatusConflict)
		return
	}
	rt.mu.Lock()
	if strings.TrimSpace(rt.run.AgentHubSessionID) == "" {
		run = rt.run
		rt.mu.Unlock()
		m.stopUnattachedAgentHubRunLocked(w, r, rt.workspace, run, rt)
		return
	}
	// A poller may have observed a durable stopped edge while the AutoRun
	// metadata was being checked. Do not send a second non-idempotent stop.
	if rt.run.Status == "stopped" && rt.run.AgentHubStoppedObserved {
		rt.mu.Unlock()
		writeJSON(w, map[string]any{"status": "stopped", "autoRunPaused": paused.Transitioned})
		return
	}
	rt.run.Status = "stopping"
	rt.run.UpdatedAt = time.Now().Format(time.RFC3339)
	run, client = rt.run, rt.agentHub
	rt.agentHubStopRequested = true
	rt.mu.Unlock()
	_ = saveAgentRun(rt.workspace.Path, run)
	session, err := client.Stop(r.Context(), run.AgentHubSessionID)
	if err != nil {
		rt.setRecoveryError(m, err)
		if paused.Transitioned {
			err = fmt.Errorf("AutoRun was paused, but AgentHub stop outcome may be unknown; it was not retried: %w", err)
		}
		writeError(w, err, http.StatusBadGateway)
		return
	}
	rt.applyAgentHubSessionState(m, session)
	// Stop stays fail-closed: confirm the durable stopped state with short
	// session polls before releasing the caller.
	deadline := time.Now().Add(agentHubStopConfirmTimeout)
	for !rt.agentHubStopped() {
		if !time.Now().Before(deadline) {
			err := errors.New("AgentHub stop did not reach a durable stopped state within the confirmation window")
			rt.setRecoveryError(m, err)
			if paused.Transitioned {
				err = fmt.Errorf("AutoRun was paused, but AgentHub stop outcome may be unknown; it was not retried: %w", err)
			}
			writeError(w, err, http.StatusBadGateway)
			return
		}
		timer := time.NewTimer(agentHubStopConfirmInterval)
		select {
		case <-r.Context().Done():
			timer.Stop()
			return
		case <-timer.C:
		}
		session, err := client.GetSession(r.Context(), run.AgentHubSessionID)
		if err == nil {
			if session.State == "archived" {
				// The session stopped and was archived during the confirmation
				// window. Apply the same archived-after-stopped proof instead
				// of waiting for the timeout to fail closed.
				rt.reconcileArchivedAgentHubSession(m, client, session, "stopping")
			} else {
				rt.applyAgentHubSessionState(m, session)
			}
		}
	}
	writeJSON(w, map[string]any{"status": "stopped", "autoRunPaused": paused.Transitioned})
}

// stopUnattachedAgentHubRun is the escape hatch for runs that never attached
// to AgentHub, for example a dispatch whose session creation failed and left
// the run in recovering. There is no AgentHub session to stop, so the run's
// Forge session is ended directly to release its resource lock, the session
// context file is removed, and the run is persisted with a terminal status.
// Stop is idempotent: a run that already reached a terminal status returns
// success without repeating cleanup.
func (m *agentManager) stopUnattachedAgentHubRun(w http.ResponseWriter, r *http.Request, workspace guiWorkspace, run agentRun, rt *agentRuntime) {
	if rt != nil {
		m.stopAgentHubRuntime(w, r, rt)
		return
	}
	m.server.autoRunDispatchMu.Lock()
	defer m.server.autoRunDispatchMu.Unlock()
	m.stopUnattachedAgentHubRunLocked(w, r, workspace, run, nil)
}

func (m *agentManager) stopUnattachedAgentHubRunLocked(w http.ResponseWriter, r *http.Request, workspace guiWorkspace, run agentRun, rt *agentRuntime) {
	if rt != nil {
		run = rt.snapshotRun()
		if strings.TrimSpace(run.AgentHubSessionID) != "" {
			m.stopAgentHubRunLocked(w, r, rt)
			return
		}
	}
	// Recovery can attach a session without taking turnActionMu. Check again
	// immediately before the direct Forge cleanup so a newly attached session
	// is stopped through AgentHub instead of being orphaned.
	if rt != nil {
		latest := rt.snapshotRun()
		if strings.TrimSpace(latest.AgentHubSessionID) != "" {
			m.stopAgentHubRunLocked(w, r, rt)
			return
		}
		run = latest
	}
	paused, err := pauseAutoRunBeforeStopping(workspace, run, autoRunStopSession)
	if err != nil {
		writeError(w, fmt.Errorf("pause AutoRun before closing session: %w", err), http.StatusConflict)
		return
	}
	if !isLiveAgentStatus(run.Status) {
		writeJSON(w, map[string]any{"status": run.Status, "autoRunPaused": paused.Transitioned})
		return
	}
	if sessionID := strings.TrimSpace(run.ForgeSessionID); sessionID != "" {
		if err := m.endForgeSession(r.Context(), workspace, sessionID); err != nil {
			if rt != nil {
				rt.setRecoveryError(m, err)
			}
			writeError(w, fmt.Errorf("release Forge session: %w", err), http.StatusInternalServerError)
			return
		}
	}
	removeForgeSessionContextFile(run.ForgeSessionContextPath, run.ForgeSessionID)
	run.Status = "stopped"
	run.ForgeSessionID = ""
	run.ForgeSessionContextPath = ""
	run.UpdatedAt = time.Now().Format(time.RFC3339)
	if err := saveAgentRun(workspace.Path, run); err != nil {
		writeError(w, err, http.StatusInternalServerError)
		return
	}
	// The runtime stays registered with the terminal status, mirroring the
	// post-restart projection of a stopped run.
	if rt != nil {
		rt.setRun(run)
	}
	writeJSON(w, map[string]any{"status": "stopped", "autoRunPaused": paused.Transitioned})
}

func (m *agentManager) interruptRun(w http.ResponseWriter, r *http.Request, workspaceID, runID string) {
	workspace, rt, err := m.workspaceRuntime(workspaceID, runID)
	if err != nil || rt == nil {
		writeError(w, errors.New("run is not active"), http.StatusBadRequest)
		return
	}
	rt.turnActionMu.Lock()
	defer rt.turnActionMu.Unlock()
	if err := m.server.requireResourceNotExternallyLocked(workspace, rt.snapshotRun().ResourceID); err != nil {
		writeResourceOperationError(w, err, http.StatusConflict)
		return
	}
	rt.mu.Lock()
	run, client := rt.run, rt.agentHub
	rt.mu.Unlock()
	if run.WorkspaceID != workspaceID {
		writeError(w, errors.New("run belongs to another workspace"), http.StatusNotFound)
		return
	}
	if client == nil || strings.TrimSpace(run.AgentHubSessionID) == "" {
		writeError(w, errors.New("run is not attached to AgentHub"), http.StatusBadRequest)
		return
	}
	currentSession, err := m.interruptibleAgentHubSession(r.Context(), run, client)
	if err != nil {
		var conflictErr *agentHubTurnConflictError
		if errors.As(err, &conflictErr) {
			writeError(w, err, http.StatusConflict)
			return
		}
		// A failed read leaves the current turn unknown. Retain the Forge and
		// AgentHub sessions and let reconciliation establish the next state;
		// do not guess and send a non-idempotent interrupt.
		recoveryErr := fmt.Errorf("AgentHub turn state could not be confirmed; interrupt was not sent: %w", err)
		rt.setRecoveryError(m, recoveryErr)
		writeError(w, recoveryErr, http.StatusBadGateway)
		return
	}
	if run.SchedulerTurn {
		if _, err := pauseAutoRunBeforeStopping(workspace, run, autoRunStopTurn); err != nil {
			writeError(w, fmt.Errorf("pause AutoRun before interrupt: %w", err), http.StatusConflict)
			return
		}
	}
	session, err := client.Interrupt(r.Context(), currentSession.ID)
	if err != nil {
		// The AutoRun pause is durable, but the non-idempotent interrupt result
		// is ambiguous. Keep the Session and let the poller reconcile its state;
		// never retry the interrupt from this path.
		rt.setRecoveryError(m, fmt.Errorf("AgentHub interrupt outcome may be unknown; it was not retried: %w", err))
		writeError(w, fmt.Errorf("AgentHub interrupt outcome may be unknown; it was not retried: %w", err), http.StatusBadGateway)
		return
	}
	rt.applyAgentHubSessionState(m, session)
	if run.SchedulerTurn && (session.State == "ready" || session.State == "stopped") {
		// The direct action response already carries the terminal turn state,
		// so do not wait for the poller's previous-state edge to finish the
		// paused SchedulerTurn. The runtime mutex keeps this behind the
		// interrupt request and prevents an AutoRun retry.
		go rt.finishSchedulerTurn(m)
	}
	writeJSON(w, map[string]string{"status": "interrupted"})
}

func isAgentHubTurnInterruptible(state string) bool {
	switch strings.TrimSpace(state) {
	case "busy", "waiting_approval":
		return true
	default:
		return false
	}
}

type agentHubTurnConflictError struct {
	message string
}

func (e *agentHubTurnConflictError) Error() string {
	return e.message
}

// interruptibleAgentHubSession re-reads the AgentHub projection immediately
// before the non-idempotent interrupt. This closes the stale-page window and
// refuses to act on a session that no longer belongs to this Forge run.
func (m *agentManager) interruptibleAgentHubSession(ctx context.Context, run agentRun, client *agentHubClient) (agentHubSession, error) {
	cfg, _, err := m.agentHubRuntimeConfig()
	if err != nil {
		return agentHubSession{}, err
	}
	session, err := client.GetSession(ctx, run.AgentHubSessionID)
	if err != nil {
		return agentHubSession{}, fmt.Errorf("read current AgentHub turn state: %w", err)
	}
	source := session.Source
	expectedExternalID := strings.TrimSpace(run.SourceExternalID)
	if source == nil || source.App != agentHubSourceApp || source.InstanceID != cfg.AgentHubInstanceID ||
		expectedExternalID == "" || source.ExternalID != expectedExternalID {
		return agentHubSession{}, &agentHubTurnConflictError{message: "AgentHub session does not belong to the current Forge run"}
	}
	if strings.TrimSpace(session.ID) == "" || session.ID != strings.TrimSpace(run.AgentHubSessionID) {
		return agentHubSession{}, &agentHubTurnConflictError{message: "AgentHub session identity changed before interrupt"}
	}
	if !isAgentHubTurnInterruptible(session.State) {
		return agentHubSession{}, &agentHubTurnConflictError{message: fmt.Sprintf("AgentHub session is not interruptible in %s state", session.State)}
	}
	return session, nil
}

const (
	userStoppedActiveTurnReason    = "user stopped the active turn"
	userClosedAutoRunSessionReason = "user closed the AutoRun session"
)

type autoRunStopAction string

const (
	autoRunStopTurn    autoRunStopAction = "turn"
	autoRunStopSession autoRunStopAction = "session"
)

type autoRunPauseResult struct {
	Transitioned bool
}

// pauseAutoRunBeforeStopping is the single generation/state boundary shared
// by End Turn and Close Session. The initial read is only a classification;
// PauseAutoRun repeats the generation and expected-state CAS while holding the
// task AutoRun file lock. A concurrent actor that already moved the same
// generation to a safe state is accepted, but a still-runnable CAS failure is
// returned and the AgentHub action is not sent.
func pauseAutoRunBeforeStopping(workspace guiWorkspace, run agentRun, action autoRunStopAction) (autoRunPauseResult, error) {
	var result autoRunPauseResult
	if !run.SchedulerTurn && run.AutoRunGeneration <= 0 {
		return result, nil
	}
	if strings.TrimSpace(run.ResourceID) == "" || run.AutoRunGeneration <= 0 {
		if !run.SchedulerTurn {
			return result, nil
		}
		return result, errors.New("SchedulerTurn has no valid AutoRun resource or generation")
	}
	forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		return result, err
	}
	resource, err := forgeWorkspace.ResourceValue(run.ResourceID)
	if err != nil {
		return result, err
	}
	if resource.Task == nil || resource.Task.AutoRun == nil {
		if !run.SchedulerTurn {
			return result, nil
		}
		return result, errors.New("SchedulerTurn has no matching AutoRun generation")
	}
	autoRun := resource.Task.AutoRun
	if autoRun.Generation != run.AutoRunGeneration {
		// The Session belongs to an older generation. Closing it must not pause
		// a newer generation that may already be runnable.
		return result, nil
	}
	if autoRun.State == "paused" || autoRun.State == "completed" || autoRun.State == "failed" {
		return result, nil
	}
	if autoRun.State == "suspended" && action == autoRunStopTurn {
		// Preserve the End Turn behavior: a suspended generation is already
		// outside an active turn. Close Session has different semantics and
		// converts this runnable timed-wake state to paused below.
		return result, nil
	}
	if autoRun.State == "queued" && action == autoRunStopTurn {
		return result, fmt.Errorf("AutoRun generation %d is queued, not running", run.AutoRunGeneration)
	}
	if autoRun.State != "queued" && autoRun.State != "running" && autoRun.State != "suspended" {
		return result, fmt.Errorf("AutoRun generation %d is %s, not safely stoppable", run.AutoRunGeneration, autoRun.State)
	}
	reason := userStoppedActiveTurnReason
	if action == autoRunStopSession {
		reason = userClosedAutoRunSessionReason
	}
	_, err = forgeWorkspace.PauseAutoRun(app.AutoRunActionInput{
		TaskID:             run.ResourceID,
		Summary:            reason,
		ExpectedGeneration: run.AutoRunGeneration,
		ExpectedState:      autoRun.State,
	})
	if err == nil {
		result.Transitioned = true
		return result, nil
	}
	// Natural completion, another pause, or a generation advance may have won
	// the race. Re-read the durable state before deciding whether Close/End
	// Turn can proceed; never overwrite a still-runnable state after a failed
	// CAS or uncertain local persistence result.
	latest, readErr := forgeWorkspace.ResourceValue(run.ResourceID)
	if readErr == nil && latest.Task != nil && latest.Task.AutoRun != nil {
		latestAutoRun := latest.Task.AutoRun
		if latestAutoRun.Generation != run.AutoRunGeneration || latestAutoRun.State == "paused" || latestAutoRun.State == "completed" || latestAutoRun.State == "failed" {
			return result, nil
		}
	}
	if readErr != nil {
		return result, fmt.Errorf("pause AutoRun CAS failed (%v); could not re-read current state: %w", err, readErr)
	}
	return result, fmt.Errorf("pause AutoRun CAS failed: %w", err)
}

func (m *agentManager) resolveAgentHubApproval(w http.ResponseWriter, r *http.Request, rt *agentRuntime, req agentApprovalRequest) {
	rt.turnActionMu.Lock()
	defer rt.turnActionMu.Unlock()
	if strings.TrimSpace(req.RequestID) == "" {
		writeError(w, errors.New("requestId is required"), http.StatusBadRequest)
		return
	}
	reply, err := normalizeAgentHubApprovalReply(req)
	if err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	rt.mu.Lock()
	run, client := rt.run, rt.agentHub
	rt.mu.Unlock()
	session, err := client.Approval(r.Context(), run.AgentHubSessionID, req.RequestID, reply)
	if err != nil {
		writeError(w, fmt.Errorf("AgentHub approval outcome may be unknown; it was not retried: %w", err), http.StatusBadGateway)
		return
	}
	rt.applyAgentHubSessionState(m, session)
	writeJSON(w, map[string]string{"status": "resolved"})
}

func normalizeAgentHubApprovalReply(req agentApprovalRequest) (agentHubApprovalReply, error) {
	reply := agentHubApprovalReply{
		Decision: strings.TrimSpace(req.Decision),
		OptionID: strings.TrimSpace(req.OptionID),
		Text:     strings.TrimSpace(req.Text),
	}
	modes := 0
	if reply.Decision != "" {
		modes++
	}
	if reply.OptionID != "" {
		modes++
	}
	if reply.Text != "" {
		modes++
	}
	if modes != 1 {
		return agentHubApprovalReply{}, errors.New("exactly one of decision, optionId, or text is required")
	}
	if reply.Decision != "" {
		switch reply.Decision {
		case "accept", "acceptForSession", "decline", "cancel":
		default:
			return agentHubApprovalReply{}, errors.New("decision must be accept, acceptForSession, decline, or cancel")
		}
	}
	return reply, nil
}

func (m *agentManager) resumeAttachedAgentHubRun(w http.ResponseWriter, r *http.Request, rt *agentRuntime) {
	rt.turnActionMu.Lock()
	defer rt.turnActionMu.Unlock()
	m.resumeAttachedAgentHubRunLocked(w, r, rt)
}

func (m *agentManager) resumeAttachedAgentHubRunLocked(w http.ResponseWriter, r *http.Request, rt *agentRuntime) {
	rt.mu.Lock()
	run, client := rt.run, rt.agentHub
	rt.mu.Unlock()
	if err := m.server.requireResourceNotExternallyLocked(rt.workspace, run.ResourceID); err != nil {
		writeResourceOperationError(w, err, http.StatusBadRequest)
		return
	}
	if run.AgentHubStoppedObserved || strings.TrimSpace(run.ForgeSessionID) == "" {
		m.resumeStoppedAgentHubRunLocked(w, r, rt)
		return
	}
	session, err := client.Resume(r.Context(), run.AgentHubSessionID, nil)
	if err != nil {
		rt.setRecoveryError(m, err)
		writeError(w, err, http.StatusBadGateway)
		return
	}
	rt.mu.Lock()
	rt.agentHubStopRequested = false
	rt.mu.Unlock()
	rt.applyAgentHubSessionState(m, session)
	writeJSON(w, agentRunDetail{Run: rt.snapshotRun()})
}

// resumeStoppedAgentHubRun resumes a stopped AgentHub session whose original
// Forge session is gone. It safely creates a replacement Forge session first
// and passes its id to AgentHub as a launchEnvironment overlay so the resumed
// provider process receives a valid FORGE_SESSION_ID. Any failure before the
// AgentHub resume succeeds releases the replacement session and context.
func (m *agentManager) resumeStoppedAgentHubRun(w http.ResponseWriter, r *http.Request, rt *agentRuntime) {
	rt.turnActionMu.Lock()
	defer rt.turnActionMu.Unlock()
	m.resumeStoppedAgentHubRunLocked(w, r, rt)
}

func (m *agentManager) resumeStoppedAgentHubRunLocked(w http.ResponseWriter, r *http.Request, rt *agentRuntime) {
	workspace := rt.workspace
	cfg, client, err := m.agentHubRuntimeConfig()
	if err != nil {
		writeError(w, err, http.StatusServiceUnavailable)
		return
	}
	rt.mu.Lock()
	run := rt.run
	rt.mu.Unlock()
	if strings.TrimSpace(run.AgentHubSessionID) == "" {
		writeError(w, errors.New("run is not attached to AgentHub"), http.StatusBadRequest)
		return
	}
	if err := m.server.requireResourceNotExternallyLocked(workspace, run.ResourceID); err != nil {
		writeResourceOperationError(w, err, http.StatusBadRequest)
		return
	}
	// Release the previous Forge session and context if the stopped run still
	// holds them, mirroring the durable stopped release path.
	if previousID := strings.TrimSpace(run.ForgeSessionID); previousID != "" {
		if err := m.endForgeSession(r.Context(), workspace, previousID); err != nil {
			writeError(w, fmt.Errorf("release previous Forge session: %w", err), http.StatusInternalServerError)
			return
		}
		removeForgeSessionContextFile(run.ForgeSessionContextPath, previousID)
		run.ForgeSessionID = ""
		run.ForgeSessionContextPath = ""
		run.UpdatedAt = time.Now().Format(time.RFC3339)
		rt.setRun(run)
		_ = saveAgentRun(workspace.Path, run)
	}
	forgeSessionID, err := m.createForgeSession(r.Context(), workspace, run, cfg)
	if err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	run.ForgeSessionID = forgeSessionID
	rt.setRun(run)
	cleanup := true
	defer func() {
		if !cleanup {
			return
		}
		removeForgeSessionContextFile(run.ForgeSessionContextPath, forgeSessionID)
		_ = m.endForgeSession(context.Background(), workspace, forgeSessionID)
		rt.mu.Lock()
		if rt.run.ForgeSessionID == forgeSessionID {
			rt.run.ForgeSessionID = ""
			rt.run.ForgeSessionContextPath = ""
			rt.run.UpdatedAt = time.Now().Format(time.RFC3339)
			run = rt.run
		}
		rt.mu.Unlock()
		_ = saveAgentRun(workspace.Path, run)
	}()
	if err := m.lockForgeSession(r.Context(), workspace, forgeSessionID, run.ResourceID); err != nil {
		if externalErr := m.server.requireResourceNotExternallyLocked(workspace, run.ResourceID); isExternalResourceLockError(externalErr) {
			writeResourceOperationError(w, externalErr, http.StatusConflict)
			return
		}
		writeError(w, err, http.StatusBadRequest)
		return
	}
	contextPath, err := m.writeForgeSessionContext(r.Context(), workspace, run)
	if err != nil {
		writeError(w, err, http.StatusInternalServerError)
		return
	}
	run.ForgeSessionContextPath = contextPath
	rt.setRun(run)
	if err := saveAgentRun(workspace.Path, run); err != nil {
		writeError(w, err, http.StatusInternalServerError)
		return
	}
	if err := m.bindForgeSessionAgentHub(r.Context(), workspace, forgeSessionID, run.AgentHubSessionID); err != nil {
		writeError(w, err, http.StatusInternalServerError)
		return
	}
	session, err := client.Resume(r.Context(), run.AgentHubSessionID, map[string]string{"FORGE_SESSION_ID": forgeSessionID})
	if err != nil {
		rt.setRecoveryError(m, err)
		writeError(w, err, http.StatusBadGateway)
		return
	}
	cleanup = false
	rt.mu.Lock()
	rt.agentHubStopRequested = false
	rt.mu.Unlock()
	rt.applyAgentHubSessionState(m, session)
	writeJSON(w, agentRunDetail{Run: rt.snapshotRun()})
}

func (m *agentManager) resumeAgentHubRun(w http.ResponseWriter, r *http.Request, workspace guiWorkspace, run agentRun) {
	if err := m.server.requireResourceNotExternallyLocked(workspace, run.ResourceID); err != nil {
		writeResourceOperationError(w, err, http.StatusBadRequest)
		return
	}
	cfg, client, err := m.agentHubRuntimeConfig()
	if err != nil {
		writeError(w, err, http.StatusServiceUnavailable)
		return
	}
	if run.AgentHubStoppedObserved || strings.TrimSpace(run.ForgeSessionID) == "" {
		rt := newAgentHubRuntime(m, workspace, run, client)
		m.registerRuntime(rt)
		m.resumeStoppedAgentHubRun(w, r, rt)
		return
	}
	source := agentHubSource{App: agentHubSourceApp, InstanceID: cfg.AgentHubInstanceID, ExternalID: run.SourceExternalID}
	sessions, err := findAgentHubSourceSessions(r.Context(), client, source)
	if err != nil {
		writeError(w, err, http.StatusBadGateway)
		return
	}
	if len(sessions) != 1 {
		if len(sessions) > 1 {
			err = duplicateAgentHubSourceError(source, sessions)
		} else {
			err = errors.New("AgentHub session for this Forge run was not found by source")
		}
		writeError(w, err, http.StatusConflict)
		return
	}
	session := sessions[0]
	run.AgentHubSessionID = session.ID
	rt := newAgentHubRuntime(m, workspace, run, client)
	m.registerRuntime(rt)
	session, err = client.Resume(r.Context(), session.ID, nil)
	if err != nil {
		rt.setRecoveryError(m, err)
		writeError(w, err, http.StatusBadGateway)
		return
	}
	rt.mu.Lock()
	rt.agentHubStopRequested = false
	rt.mu.Unlock()
	rt.applyAgentHubSessionState(m, session)
	writeJSON(w, agentRunDetail{Run: rt.snapshotRun()})
}

// recoverAgentHubRuns rebuilds lightweight runtime projections at startup from
// one AgentHub session list and the local run indexes. It never reads event
// history and never opens event streams.
func (m *agentManager) recoverAgentHubRuns(ctx context.Context) error {
	cfg, client, err := m.agentHubRuntimeConfig()
	if err != nil {
		return err
	}
	sessions, err := client.ListSessions(ctx, agentHubSessionFilter{
		IncludeArchived: true, SourceApp: agentHubSourceApp, SourceInstanceID: cfg.AgentHubInstanceID,
	})
	if err != nil {
		return err
	}
	byExternalID := make(map[string]agentHubSession, len(sessions))
	byID := make(map[string]agentHubSession, len(sessions))
	for _, session := range sessions {
		byID[session.ID] = session
		if session.Source != nil && strings.TrimSpace(session.Source.ExternalID) != "" {
			byExternalID[session.Source.ExternalID] = session
		}
	}
	var failures []string
	for _, workspace := range cfg.Workspaces {
		// Recovery and reconciliation only run for owned Workspaces.
		if !m.server.ownsWorkspace(workspace.Path) {
			continue
		}
		runs, loadErr := loadAgentRuns(workspace.Path)
		if loadErr != nil {
			failures = append(failures, fmt.Sprintf("%s: %v", workspace.ID, loadErr))
			continue
		}
		for _, run := range runs {
			if !isAgentHubRun(run) {
				continue
			}
			// An empty non-nil candidate list means the instance-wide list
			// already proved the session is gone, so recoverAgentHubRun must not
			// re-query per run.
			candidates := []agentHubSession{}
			if session, ok := byExternalID[strings.TrimSpace(run.SourceExternalID)]; ok {
				candidates = []agentHubSession{session}
			} else if session, ok := byID[strings.TrimSpace(run.AgentHubSessionID)]; ok {
				candidates = []agentHubSession{session}
			}
			if recoverErr := m.recoverAgentHubRun(ctx, cfg, client, workspace, run, candidates); recoverErr != nil {
				failures = append(failures, fmt.Sprintf("%s/%s: %v", workspace.ID, run.ID, recoverErr))
			}
		}
	}
	if len(failures) > 0 {
		return errors.New(strings.Join(failures, "; "))
	}
	return nil
}

// recoverAgentHubRun rebuilds the lightweight runtime projection for one run
// without eagerly loading event history or opening an event stream. A persisted
// active -> ready/stopped edge, or a pending completion inspection, may replay
// the bounded durable history needed for the completion marker. candidates
// carries the sessions matching the run's source tuple;
// when nil, the candidates are queried on demand (scheduler dispatch path).
// Only live runs with a valid Forge session may recreate a missing AgentHub
// session from the source tuple.
func (m *agentManager) recoverAgentHubRun(ctx context.Context, cfg config, client *agentHubClient, workspace guiWorkspace, run agentRun, candidates []agentHubSession) error {
	source := agentHubSource{App: agentHubSourceApp, InstanceID: cfg.AgentHubInstanceID, ExternalID: run.SourceExternalID}
	if candidates == nil {
		found, err := findAgentHubSourceSessions(ctx, client, source)
		if err != nil {
			m.markAgentRunRecovering(workspace, run)
			return err
		}
		candidates = found
	}
	live := isLiveAgentStatus(run.Status)
	if len(candidates) == 0 && live && strings.TrimSpace(run.ForgeSessionID) != "" {
		recovered, createErr := m.findOrCreateAgentHubSession(ctx, client, source, agentHubCreateSessionRequest{
			Title: run.Title, Cwd: run.Cwd, AgentName: run.AgentHubAgentName,
			LaunchEnvironment: map[string]string{"FORGE_SESSION_ID": run.ForgeSessionID},
			Source:            &source,
			InitialMessage:    agentHubInitialMessage(run.PendingInitialMessage),
		})
		if createErr != nil {
			m.markAgentRunRecovering(workspace, run)
			return createErr
		}
		candidates = []agentHubSession{recovered}
	}
	if len(candidates) != 1 {
		rt := newAgentHubRuntime(m, workspace, run, client)
		m.registerRuntime(rt)
		if live {
			m.markAgentRunRecovering(workspace, rt.snapshotRun())
		}
		if len(candidates) > 1 {
			return duplicateAgentHubSourceError(source, candidates)
		}
		return nil
	}
	session := candidates[0]
	previousStatus := run.Status
	run.AgentHubSessionID = session.ID
	if strings.TrimSpace(session.AgentName) != "" {
		run.AgentHubAgentName = session.AgentName
	}
	run.PendingInitialMessage = ""
	rt := newAgentHubRuntime(m, workspace, run, client)
	// Let applyAgentHubSessionState compare the recovered state with the
	// persisted projection. This preserves a busy -> ready/stopped edge across
	// a Forge restart instead of treating recovery as a fresh idle baseline.
	rt.agentHubState = agentHubStateForForgeStatus(previousStatus)
	m.registerRuntime(rt)
	if strings.TrimSpace(run.ForgeSessionID) == "" && session.State != "stopped" && session.State != "archived" {
		err := errors.New("active AgentHub session has no matching Forge session; refusing to create a replacement because launchEnvironment would retain the old FORGE_SESSION_ID")
		rt.setRecoveryError(m, err)
		return err
	}
	if strings.TrimSpace(run.ForgeSessionID) != "" {
		if err := m.bindForgeSessionAgentHub(ctx, workspace, run.ForgeSessionID, session.ID); err != nil {
			rt.setRecoveryError(m, err)
			return err
		}
	}
	rt.applyAgentHubSessionState(m, session)
	if session.State == "archived" {
		// The service missed the stopped edge while it was down. Release the
		// Forge session only when the archived session provably passed
		// through durable stopped; anything else keeps failing closed. Runs
		// asynchronously so a long event replay never blocks startup.
		go rt.reconcileArchivedAgentHubSession(m, client, session, previousStatus)
	}
	return nil
}

func (m *agentManager) markAgentRunRecovering(workspace guiWorkspace, run agentRun) {
	run.Status = "recovering"
	run.UpdatedAt = time.Now().Format(time.RFC3339)
	if rt := m.runtimeByID(run.ID); rt != nil {
		rt.mu.Lock()
		rt.run.Status = run.Status
		rt.run.UpdatedAt = run.UpdatedAt
		rt.mu.Unlock()
	}
	_ = saveAgentRun(workspace.Path, run)
}
