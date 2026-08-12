package serve

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"
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
// creation, but validating against the catalog first prevents an unavailable
// selection from leaving a Forge lock behind.
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
			_ = m.endForgeSession(context.Background(), workspace, forgeSessionID)
		}
	}()
	if err := saveAgentRun(workspace.Path, run); err != nil {
		writeError(w, err, http.StatusInternalServerError)
		return
	}

	source := agentHubSource{
		App: agentHubSourceApp, InstanceID: cfg.AgentHubInstanceID, ExternalID: run.SourceExternalID,
	}
	session, err := m.findOrCreateAgentHubSession(r.Context(), client, source, agentHubCreateSessionRequest{
		Title: run.Title, Cwd: run.Cwd, AgentName: agentName,
		Source:         &source,
		InitialMessage: agentHubInitialMessage(strings.TrimSpace(req.Prompt), req.UserName),
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

const (
	agentHubDefaultUserName   = "User"
	agentHubUserNameMaxLength = 80
)

func normalizeAgentHubUserName(value string) string {
	name := strings.TrimSpace(value)
	if name == "" {
		return agentHubDefaultUserName
	}
	runes := []rune(name)
	if len(runes) > agentHubUserNameMaxLength {
		name = string(runes[:agentHubUserNameMaxLength])
	}
	return name
}

// agentHubMessageProvenance maps browser-local user identity onto AgentHub's
// provenance envelope. The role records provenance only, never a privilege level.
func agentHubMessageProvenance(userName string) (string, *agentHubMessageSender) {
	return "user", &agentHubMessageSender{Name: normalizeAgentHubUserName(userName)}
}

func agentHubInitialMessage(text string, userName string) *agentHubInboundMessage {
	if text == "" {
		return nil
	}
	role, sender := agentHubMessageProvenance(userName)
	return &agentHubInboundMessage{Text: text, Role: role, Sender: sender}
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
	return fmt.Errorf("multiple AgentHub sessions match source %s/%s/%s: %s; resolve the duplicate source before retrying",
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

// releaseForgeSessionAfterStopped synchronously removes the transient Forge
// session record before reporting success to a caller. Background poller and
// recovery paths may call the same function; the mutex makes those calls
// idempotent without racing a close response or a second poll.
func (rt *agentRuntime) releaseForgeSessionAfterStopped(m *agentManager) error {
	rt.forgeSessionReleaseMu.Lock()
	defer rt.forgeSessionReleaseMu.Unlock()

	rt.mu.Lock()
	run := rt.run
	rt.mu.Unlock()
	if !run.AgentHubStoppedObserved || run.Status != "stopped" || strings.TrimSpace(run.ForgeSessionID) == "" {
		return nil
	}
	sessionID := strings.TrimSpace(run.ForgeSessionID)
	if err := m.endForgeSession(context.Background(), rt.workspace, sessionID); err != nil {
		releaseErr := fmt.Errorf("durable stopped observed but Forge session release failed: %w", err)
		rt.addForgeNotice(m, "error", "forge/session/end", releaseErr.Error())
		return releaseErr
	}
	rt.mu.Lock()
	if rt.run.ForgeSessionID == sessionID && rt.run.AgentHubStoppedObserved && rt.run.Status == "stopped" {
		updated := rt.run
		updated.ForgeSessionID = ""
		updated.UpdatedAt = time.Now().Format(time.RFC3339)
		err := saveAgentRun(rt.workspace.Path, updated)
		if err == nil {
			rt.run = updated
		}
		rt.mu.Unlock()
		if err != nil {
			releaseErr := fmt.Errorf("durable stopped observed but Forge run cleanup could not be persisted: %w", err)
			rt.addForgeNotice(m, "error", "forge/run/save", releaseErr.Error())
			return releaseErr
		}
		return nil
	}
	rt.mu.Unlock()
	// A resume or another lifecycle transition replaced this Forge session while
	// the idempotent release was in flight. Never overwrite the newer runtime projection.
	return nil
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

	steer := state == "busy" || state == "waiting_approval"
	role, sender := agentHubMessageProvenance(req.UserName)
	session, err := client.Message(r.Context(), run.AgentHubSessionID, agentHubInboundMessage{
		Text: text, Steer: steer, Role: role, Sender: sender,
	})
	if err != nil {
		// Message/steer is non-idempotent. Never repeat it; the session poller
		// reconciles the projection. Mark the local run recovering so timed
		// dispatch cannot mistake the stale idle projection for a safe retry.
		unknownErr := fmt.Errorf("AgentHub message outcome may be unknown; it was not retried: %w", err)
		rt.setRecoveryError(m, unknownErr)
		writeError(w, unknownErr, http.StatusBadGateway)
		return
	}
	rt.applyAgentHubSessionState(m, session)
	writeJSON(w, map[string]any{"status": "accepted"})
}

func (m *agentManager) stopAgentHubRun(w http.ResponseWriter, r *http.Request, rt *agentRuntime) {
	m.stopAgentHubRuntime(w, r, rt)
}

// stopAgentHubRuntime chooses the attached or unattached close path only after
// holding both coordination locks. This prevents recovery/resume from
// attaching a session between stopRun's classification and its cleanup.
func (m *agentManager) stopAgentHubRuntime(w http.ResponseWriter, r *http.Request, rt *agentRuntime) {
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
		if err := rt.releaseForgeSessionAfterStopped(m); err != nil {
			writeError(w, err, http.StatusInternalServerError)
			return
		}
		writeJSON(w, map[string]any{"status": "stopped"})
		return
	}
	if rt.agentHubStopRequested {
		rt.mu.Unlock()
		writeError(w, errors.New("AgentHub stop outcome is still being reconciled; the stop was not retried"), http.StatusConflict)
		return
	}
	rt.mu.Unlock()
	rt.mu.Lock()
	if strings.TrimSpace(rt.run.AgentHubSessionID) == "" {
		run = rt.run
		rt.mu.Unlock()
		m.stopUnattachedAgentHubRunLocked(w, r, rt.workspace, run, rt)
		return
	}
	// A poller may have observed a durable stopped edge while the run metadata
	// was being checked. Do not send a second non-idempotent stop.
	if rt.run.Status == "stopped" && rt.run.AgentHubStoppedObserved {
		rt.mu.Unlock()
		if err := rt.releaseForgeSessionAfterStopped(m); err != nil {
			writeError(w, err, http.StatusInternalServerError)
			return
		}
		writeJSON(w, map[string]any{"status": "stopped"})
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
				rt.reconcileArchivedAgentHubSession(m, client, session)
			} else {
				rt.applyAgentHubSessionState(m, session)
			}
		}
	}
	if err := rt.releaseForgeSessionAfterStopped(m); err != nil {
		writeError(w, err, http.StatusInternalServerError)
		return
	}
	writeJSON(w, map[string]any{"status": "stopped"})
}

// stopUnattachedAgentHubRun is the escape hatch for runs that never attached
// to AgentHub, for example a dispatch whose session creation failed and left
// the run in recovering. There is no AgentHub session to stop, so the transient
// Forge session is ended directly and the run is persisted with a terminal status.
// Stop is idempotent: a run that already reached a terminal status returns
// success without repeating cleanup.
func (m *agentManager) stopUnattachedAgentHubRun(w http.ResponseWriter, r *http.Request, workspace guiWorkspace, run agentRun, rt *agentRuntime) {
	if rt != nil {
		m.stopAgentHubRuntime(w, r, rt)
		return
	}
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
	if !isLiveAgentStatus(run.Status) {
		writeJSON(w, map[string]any{"status": run.Status})
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
	run.Status = "stopped"
	run.ForgeSessionID = ""
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
	writeJSON(w, map[string]any{"status": "stopped"})
}

func (m *agentManager) interruptRun(w http.ResponseWriter, r *http.Request, workspaceID, runID string) {
	_, rt, err := m.workspaceRuntime(workspaceID, runID)
	if err != nil || rt == nil {
		writeError(w, errors.New("run is not active"), http.StatusBadRequest)
		return
	}
	// Serialize End Turn with dispatch and Close Session on this Session only;
	// Task desired-state persistence must remain independent.
	rt.turnActionMu.Lock()
	defer rt.turnActionMu.Unlock()
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
	session, err := client.Interrupt(r.Context(), currentSession.ID)
	if err != nil {
		// The non-idempotent interrupt result is ambiguous. Keep the Session and let
		// the poller reconcile its state;
		// never retry the interrupt from this path.
		rt.setRecoveryError(m, fmt.Errorf("AgentHub interrupt outcome may be unknown; it was not retried: %w", err))
		writeError(w, fmt.Errorf("AgentHub interrupt outcome may be unknown; it was not retried: %w", err), http.StatusBadGateway)
		return
	}
	rt.applyAgentHubSessionState(m, session)
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
// transient Forge session is gone. It creates a replacement Forge session
// record before resuming so the Workspace session projection remains complete.
func (m *agentManager) resumeStoppedAgentHubRun(w http.ResponseWriter, r *http.Request, rt *agentRuntime) {
	rt.turnActionMu.Lock()
	defer rt.turnActionMu.Unlock()
	m.resumeStoppedAgentHubRunLocked(w, r, rt)
}

func (m *agentManager) resumeStoppedAgentHubRunLocked(w http.ResponseWriter, r *http.Request, rt *agentRuntime) {
	// Serialize replacement creation with asynchronous stopped-session release.
	// A delayed release must never remove the replacement while resume is in flight.
	rt.forgeSessionReleaseMu.Lock()
	defer rt.forgeSessionReleaseMu.Unlock()

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
	// Release the previous transient Forge session if the stopped run still
	// holds it, mirroring the durable stopped release path.
	if previousID := strings.TrimSpace(run.ForgeSessionID); previousID != "" {
		if err := m.endForgeSession(r.Context(), workspace, previousID); err != nil {
			writeError(w, fmt.Errorf("release previous Forge session: %w", err), http.StatusInternalServerError)
			return
		}
		run.ForgeSessionID = ""
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
		_ = m.endForgeSession(context.Background(), workspace, forgeSessionID)
		rt.mu.Lock()
		if rt.run.ForgeSessionID == forgeSessionID {
			rt.run.ForgeSessionID = ""
			rt.run.UpdatedAt = time.Now().Format(time.RFC3339)
			run = rt.run
		}
		rt.mu.Unlock()
		_ = saveAgentRun(workspace.Path, run)
	}()
	if err := saveAgentRun(workspace.Path, run); err != nil {
		writeError(w, err, http.StatusInternalServerError)
		return
	}
	if err := m.bindForgeSessionAgentHub(r.Context(), workspace, forgeSessionID, run.AgentHubSessionID); err != nil {
		writeError(w, err, http.StatusInternalServerError)
		return
	}
	session, err := client.Resume(r.Context(), run.AgentHubSessionID, nil)
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
// carries the sessions found by the single instance-wide startup query.
// Live runs may recreate a missing AgentHub session from the source tuple.
func (m *agentManager) recoverAgentHubRun(ctx context.Context, cfg config, client *agentHubClient, workspace guiWorkspace, run agentRun, candidates []agentHubSession) error {
	source := agentHubSource{App: agentHubSourceApp, InstanceID: cfg.AgentHubInstanceID, ExternalID: run.SourceExternalID}
	live := isLiveAgentStatus(run.Status)
	if len(candidates) == 0 && live {
		recovered, createErr := m.findOrCreateAgentHubSession(ctx, client, source, agentHubCreateSessionRequest{
			Title: run.Title, Cwd: run.Cwd, AgentName: run.AgentHubAgentName,
			Source:         &source,
			InitialMessage: agentHubInitialMessage(run.PendingInitialMessage, ""),
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
	if strings.TrimSpace(run.ForgeSessionID) == "" && activeAgentHubSessionState(session.State) {
		forgeSessionID, err := m.createForgeSession(ctx, workspace, run, cfg)
		if err != nil {
			rt.setRecoveryError(m, err)
			return err
		}
		run.ForgeSessionID = forgeSessionID
		rt.setRun(run)
		if err := saveAgentRun(workspace.Path, run); err != nil {
			_ = m.endForgeSession(context.Background(), workspace, forgeSessionID)
			rt.setRecoveryError(m, err)
			return err
		}
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
		go rt.reconcileArchivedAgentHubSession(m, client, session)
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
