package serve

import (
	"context"
	"errors"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/disksing/pua/internal/app"
)

// This file reconciles local generation records with AgentHub session state by
// polling one session list per interval instead of replaying event history.
// Run status follows session state. PUA session release is owned here and
// nowhere else: durable
// stopped sessions release directly, while archived sessions require the
// archived-after-stopped proof in agenthub_reconcile.go, which is the only
// code path that reads event history. Only changed projections are
// persisted.

const agentHubPollInterval = 2 * time.Second

// Stop confirmation stays fail-closed: after the stop action returns, the
// control path polls the session until it reports a durable stopped state.
// The bounds are variables so tests can shrink them.
var (
	agentHubStopConfirmTimeout  = 30 * time.Second
	agentHubStopConfirmInterval = 200 * time.Millisecond
)

// startAgentRecovery rebuilds generation records in the background so the HTTP
// listener can serve immediately; the session poller runs right away and then
// every interval as the fallback for any generation the recovery pass missed.
func (m *agentManager) startAgentRecovery(ctx context.Context) {
	m.runBackground(func() {
		if err := m.recoverAgentHubGenerations(ctx); err != nil {
			log.Printf("recover AgentHub runs: %v", err)
		}
	})
	m.startAgentHubPoller(ctx)
}

// startAgentHubPoller polls AgentHub session state in the background until
// ctx is cancelled.
func (m *agentManager) startAgentHubPoller(ctx context.Context) {
	m.runBackground(func() {
		if err := m.pollAgentHubSessions(ctx); err != nil {
			log.Printf("poll AgentHub sessions: %v", err)
		}
		ticker := time.NewTicker(agentHubPollInterval)
		defer ticker.Stop()
		for {
			select {
			case <-ctx.Done():
				return
			case <-ticker.C:
				if err := m.pollAgentHubSessions(ctx); err != nil {
					log.Printf("poll AgentHub sessions: %v", err)
				}
			}
		}
	})
}

// pollAgentHubSessions lists this instance's live AgentHub sessions once and
// reconciles every local generation record against the result.
func (m *agentManager) pollAgentHubSessions(ctx context.Context) error {
	cfg, client, err := m.agentHubRuntimeConfig()
	if err != nil {
		return err
	}
	sessions, err := client.ListSessions(ctx, agentHubSessionFilter{
		SourceApp: agentHubSourceApp,
	})
	if err != nil {
		return err
	}
	byExternalID := make(map[string]agentHubSession, len(sessions))
	byID := make(map[string]agentHubSession, len(sessions))
	for _, session := range sessions {
		byID[session.ID] = session
		if session.Source != nil && strings.TrimSpace(session.Source.ExternalID) != "" {
			byExternalID[sourceLookupKey(session.Source.InstanceID, session.Source.ExternalID)] = session
		}
	}
	var failures []string
	for _, workspace := range cfg.Workspaces {
		// Reconciliation only manages sessions in owned Workspaces.
		if !m.server.ownsWorkspace(workspace.Path) {
			continue
		}
		puaWorkspace, openErr := app.OpenWorkspace(workspace.Path)
		if openErr != nil {
			failures = append(failures, fmt.Sprintf("%s: inspect resources: %v", workspace.ID, openErr))
			continue
		}
		runtimeConfig, runtimeErr := puaWorkspace.RuntimeConfig()
		if runtimeErr != nil {
			failures = append(failures, fmt.Sprintf("%s: read Workspace runtime: %v", workspace.ID, runtimeErr))
			continue
		}
		records, loadErr := loadCurrentGenerationRecords(workspace.Path)
		if loadErr != nil {
			failures = append(failures, fmt.Sprintf("%s: %v", workspace.ID, loadErr))
			continue
		}
		taskArchiveStates := inspectTaskArchiveStates(puaWorkspace, records)
		for _, record := range records {
			if !isAgentHubGeneration(record) {
				continue
			}
			resourceID := strings.TrimSpace(record.ResourceID)
			archiveState, isTask := taskArchiveStates[resourceID]
			archiveManaged := resourceID != "" && resourceID != "workspace" && resourceID != app.SchedulerResourceID
			if !isTask && archiveManaged {
				resource, resourceErr := puaWorkspace.ResourceValue(resourceID)
				archiveState = taskArchiveState{archived: resource.Archived, err: resourceErr}
			}
			if isTask && archiveState.err != nil {
				// A missing or unreadable resource is not proof that PUA
				// intentionally reclaimed the task. Keep the AgentHub session
				// open and surface the failed inspection instead.
				failures = append(failures, fmt.Sprintf("%s run %s resource %s: %v", workspace.ID, record.ID, resourceID, archiveState.err))
			} else if !isTask && archiveManaged && archiveState.err != nil {
				failures = append(failures, fmt.Sprintf("%s run %s resource %s: %v", workspace.ID, record.ID, resourceID, archiveState.err))
			} else if archiveState.archived {
				// Reclaim only the session id already bound to this generation. Source
				// lookup is deliberately not used here: duplicate or stale
				// external ids must never make archival stop the wrong session.
				if session, found := byID[strings.TrimSpace(record.AgentHubSessionID)]; found {
					handled := false
					controllerErr := m.withResourceController(ctx, workspace, resourceID, func() error {
						handled = m.stopAgentHubSessionForArchivedResource(ctx, cfg, workspace, record, session, client)
						return nil
					})
					if controllerErr != nil {
						failures = append(failures, fmt.Sprintf("%s run %s resource %s: %v", workspace.ID, record.ID, resourceID, controllerErr))
					} else if handled {
						continue
					}
				}
			}
			m.reconcileAgentHubGeneration(ctx, cfg, workspace, record, byExternalID, byID, client, runtimeConfig.GenerationPolicy)
		}
	}
	profileConfig := agentHubServeConfig{
		Workspaces:    cfg.Workspaces,
		AgentProfiles: make([]agentHubProfileRoute, 0, len(cfg.AgentProfiles)),
	}
	for _, route := range cfg.AgentProfiles {
		profileConfig.AgentProfiles = append(profileConfig.AgentProfiles, agentHubProfileRoute{Key: route.Key, Description: route.Description, AgentName: route.AgentName})
	}
	if err := m.profileRoutesChanged(ctx, profileConfig, profileConfig); err != nil {
		failures = append(failures, err.Error())
	}
	for _, workspace := range cfg.Workspaces {
		if !m.server.ownsWorkspace(workspace.Path) {
			continue
		}
		if err := m.reconcileSchedulerLocked(ctx, workspace, client); err != nil {
			failures = append(failures, fmt.Sprintf("%s Scheduler: %v", workspace.ID, err))
		}
		if err := m.reconcileWorkspaceMailboxes(ctx, workspace); err != nil {
			failures = append(failures, fmt.Sprintf("%s mailbox: %v", workspace.ID, err))
		}
		if err := m.reconcileWorkspaceNotifications(ctx, workspace, client); err != nil {
			failures = append(failures, fmt.Sprintf("%s notifications: %v", workspace.ID, err))
		}
	}
	if len(failures) > 0 {
		return errors.New(strings.Join(failures, "; "))
	}
	return nil
}

type taskArchiveState struct {
	archived bool
	err      error
}

// inspectTaskArchiveStates batches resource inspection by project. Calling
// ResourceValue for every retained generation would repeatedly scan the same task
// directory on every two-second poll, which gets expensive precisely when a
// Workspace has accumulated many sessions.
func inspectTaskArchiveStates(workspace *app.Workspace, records []generationRecord) map[string]taskArchiveState {
	projectTasks := make(map[string]map[string]struct{})
	for _, record := range records {
		if !isAgentHubGeneration(record) {
			continue
		}
		resourceID := strings.TrimSpace(record.ResourceID)
		projectID, _, isTask := strings.Cut(resourceID, ".task")
		if !isTask || projectID == "" {
			continue
		}
		if projectTasks[projectID] == nil {
			projectTasks[projectID] = make(map[string]struct{})
		}
		projectTasks[projectID][resourceID] = struct{}{}
	}

	states := make(map[string]taskArchiveState)
	for projectID, wanted := range projectTasks {
		listed, err := workspace.Tasks(app.TaskListOptions{ProjectID: projectID, IncludeArchived: true})
		if err != nil {
			for resourceID := range wanted {
				states[resourceID] = taskArchiveState{err: err}
			}
			continue
		}
		for resourceID := range wanted {
			states[resourceID] = taskArchiveState{err: fmt.Errorf("resource not found: %s", resourceID)}
		}
		seen := make(map[string]bool)
		for _, entry := range listed.Tasks {
			resourceID := strings.TrimSpace(entry.Task.ID)
			if _, ok := wanted[resourceID]; !ok {
				continue
			}
			if seen[resourceID] {
				states[resourceID] = taskArchiveState{err: fmt.Errorf("multiple task resources found: %s", resourceID)}
				continue
			}
			seen[resourceID] = true
			states[resourceID] = taskArchiveState{archived: entry.Archived}
		}
	}
	return states
}

// stopAgentHubSessionForArchivedResource starts a single fail-closed stop for an
// active AgentHub session whose owning PUA resource is archived. Resource
// generations are also archived after the durable stopped edge. It returns true
// when normal reconciliation should be skipped for this poll.
func (m *agentManager) stopAgentHubSessionForArchivedResource(ctx context.Context, cfg config, workspace serveWorkspace, record generationRecord, session agentHubSession, client *agentHubClient) bool {
	if !agentHubSessionExactlyMatchesGeneration(cfg, record, session) {
		return false
	}
	mailbox, mailboxErr := loadHotResourceMailbox(workspace.Path, record.ResourceID)
	if mailboxErr == nil {
		lifecyclePlan := PlanGeneration(AdaptLegacyGenerationFacts(LegacyGenerationLifecycleInput{
			Generation: record, Session: &session, ResourceArchived: true, Mailbox: mailbox, Revision: record.UpdatedAt,
		}))
		switch lifecyclePlan.Operation {
		case GenerationOperationFinalizeArchivedMailbox:
			_ = markResourceMailboxArchived(workspace.Path, record.ResourceID)
			return true
		case GenerationOperationWaitForTurnTerminal, GenerationOperationWaitForSession,
			GenerationOperationWaitForMessageReceipt, GenerationOperationRetireGeneration:
			return true
		case GenerationOperationNone:
			return false
		}
	}
	effectContext := context.WithoutCancel(ctx)
	if session.State == "stopped" && record.GenerationID != "" {
		if _, err := client.Archive(effectContext, session.ID); err != nil {
			if rt := m.runtimeByID(record.ID); rt != nil {
				rt.addPUANotice(m, "warning", "agenthub/resource-reclaim", "Archive stopped resource generation: "+err.Error())
			}
		}
		return true
	}
	if session.State == "running" || session.State == "waiting_approval" {
		// An archive performed outside this Server may race an active Turn. Do
		// not silently interrupt it: the reconciler waits for the natural Turn
		// boundary, then the next poll performs Stop -> stopped -> Archive.
		return true
	}
	if !activeAgentHubSessionState(session.State) {
		return false
	}
	rt := m.runtimeByID(record.ID)
	if rt == nil {
		rt = newAgentHubRuntime(m, workspace, record, client)
		m.registerRuntime(rt)
	}

	guarded := false
	_, persistErr := rt.mutateRuntime(func(runtime *agentRuntime) {
		if runtime.agentHubStopRequested {
			guarded = true
			return
		}
		runtime.record.Status = "stopping"
		runtime.record.UpdatedAt = time.Now().Format(time.RFC3339)
		runtime.record.ArchivedTaskStopRequested = true
		runtime.agentHubStopRequested = true
	})
	if guarded {
		// An earlier request still has no durable terminal observation. Keep
		// the generation's stopping/recovering projection and do not let an active
		// list result hide the ambiguous outcome.
		return true
	}
	if persistErr != nil {
		// Do not issue a non-idempotent stop unless the guard was persisted.
		rt.addPUANotice(m, "error", "agenthub/task-reclaim", fmt.Sprintf("persist archived-resource session stop guard: %v", persistErr))
		return false
	}
	rt.mu.Lock()
	rt.agentHub = client
	rt.mu.Unlock()

	stopped, err := client.Stop(effectContext, session.ID)
	if err != nil {
		rt.mu.Lock()
		rt.agentHubStopRequested = false
		rt.mu.Unlock()
		rt.setRecoveryError(m, fmt.Errorf("stop AgentHub session for archived task %s: %w", record.ResourceID, err))
		return true
	}
	if !agentHubSessionExactlyMatchesGeneration(cfg, record, stopped) {
		rt.mu.Lock()
		rt.agentHubStopRequested = false
		rt.mu.Unlock()
		rt.setRecoveryError(m, fmt.Errorf("AgentHub stop response for archived task %s did not match the persisted PUA run source", record.ResourceID))
		return true
	}
	rt.applyAgentHubSessionState(m, stopped)
	if stopped.State == "stopped" && record.GenerationID != "" {
		if _, err := client.Archive(effectContext, stopped.ID); err != nil {
			rt.addPUANotice(m, "warning", "agenthub/resource-reclaim", "Archive stopped resource generation: "+err.Error())
		}
	}
	return true
}

func activeAgentHubSessionState(state string) bool {
	switch state {
	case "starting", "ready", "running", "waiting_approval":
		return true
	default:
		return false
	}
}

func agentHubSessionExactlyMatchesGeneration(cfg config, record generationRecord, session agentHubSession) bool {
	sessionID := strings.TrimSpace(record.AgentHubSessionID)
	externalID := strings.TrimSpace(record.SourceExternalID)
	return sessionID != "" && externalID != "" && session.ID == sessionID && session.Source != nil &&
		session.Source.App == agentHubSourceApp &&
		session.Source.InstanceID == generationSourceInstanceID(cfg, record) &&
		session.Source.ExternalID == externalID
}

// reconcileAgentHubGeneration projects one AgentHub session onto a local
// generation record. Records are matched by source external id, falling back
// to the bound AgentHub session id. Sessions absent from the non-archived
// list are re-checked once on demand by their bound id: an archived session
// drives the archived-after-stopped reconciliation, while a session that is
// truly gone conservatively moves live generations to recovering and keeps
// terminal generations untouched.
func (m *agentManager) reconcileAgentHubGeneration(ctx context.Context, cfg config, workspace serveWorkspace, record generationRecord, byExternalID, byID map[string]agentHubSession, client *agentHubClient, policy app.GenerationPolicy) {
	_ = m.withResourceController(ctx, workspace, record.ResourceID, func() error {
		m.reconcileAgentHubGenerationLocked(ctx, cfg, workspace, record, byExternalID, byID, client, policy)
		return nil
	})
}

func (m *agentManager) reconcileAgentHubGenerationLocked(ctx context.Context, cfg config, workspace serveWorkspace, record generationRecord, byExternalID, byID map[string]agentHubSession, client *agentHubClient, policy app.GenerationPolicy) {
	session, found := byExternalID[sourceLookupKey(generationSourceInstanceID(cfg, record), record.SourceExternalID)]
	if !found {
		session, found = byID[strings.TrimSpace(record.AgentHubSessionID)]
	}
	rt := m.runtimeByID(record.ID)
	if rt == nil {
		rt = newAgentHubRuntime(m, workspace, record, client)
		m.registerRuntime(rt)
	}
	if !found {
		// The live list excludes archived sessions. Re-check the bound session
		// on demand before failing closed: a session that stopped and was
		// archived between polls is the missed stopped edge this
		// reconciliation owns.
		if id := strings.TrimSpace(record.AgentHubSessionID); id != "" {
			if fetched, err := client.GetSession(ctx, id); err == nil {
				if agentHubSourceConflicts(cfg, record, fetched) {
					rt.setRecoveryError(m, fmt.Errorf("AgentHub session %s source does not match the persisted PUA run source; generation retained", id))
					return
				}
				session, found = fetched, true
			}
		}
	}
	if !found {
		if record.GenerationID != "" && isLiveAgentStatus(record.Status) {
			if err := m.recoverAgentHubGenerationLocked(context.WithoutCancel(ctx), cfg, client, workspace, record, nil); err != nil {
				rt.addPUANotice(m, "warning", "agenthub/recovery", "Recreate missing resource generation: "+err.Error())
			}
			return
		}
		_, _ = rt.mutateGeneration(func(record *generationRecord) {
			if record.Status != "recovering" && isLiveAgentStatus(record.Status) {
				record.Status = "recovering"
				record.UpdatedAt = time.Now().Format(time.RFC3339)
			}
		})
		return
	}
	if session.State == "archived" {
		rt.reconcileArchivedAgentHubSession(m, client, session)
		return
	}

	turnFinished := false
	turnStarted := false
	refreshTurnStartedAt := false
	startedTurnID := ""
	updated, persistErr := rt.mutateRuntime(func(runtime *agentRuntime) {
		previousState := runtime.agentHubState
		if previousState == "" {
			previousState = agentHubStateForPUAStatus(runtime.record.Status)
		}
		turnFinished = (previousState == "running" || previousState == "waiting_approval") &&
			(session.State == "ready" || session.State == "stopped")
		runtime.record.Status = puaStatusForAgentHubState(session.State)
		m.projectResourceIdleState(&runtime.record, session, previousState, turnFinished)
		runtime.record.AgentHubStoppedObserved = runtime.record.AgentHubStoppedObserved || session.State == "stopped"
		if session.State == "stopped" {
			if runtime.record.IdleSleepStopRequested {
				// Automatic sleep owns the full Stop -> Archive sequence. A stopped
				// projection alone must not release the PUA session or clear the
				// retry guard before Archive is confirmed.
				runtime.record.AgentHubStoppedObserved = false
			} else {
				// The durable terminal state resolves any ambiguity around the stop
				// action. Clear the guard so an explicit out-of-band resume can be
				// reclaimed again while the resource remains archived.
				runtime.record.ArchivedTaskStopRequested = false
			}
			runtime.agentHubStopRequested = false
		}
		if session.State == "ready" || session.State == "starting" {
			runtime.record.AgentHubStoppedObserved = false
		}
		if strings.TrimSpace(session.ID) != "" {
			if runtime.record.CompletionSessionID != session.ID && !turnFinished {
				// A new AgentHub session starts a new cursor. Baseline it unless
				// this response is the active -> ready/stopped edge whose terminal
				// history must be inspected from the beginning.
				runtime.record.CompletionSessionID = session.ID
				runtime.record.CompletionCursor = session.LastEventID
				runtime.record.CompletionEventID = 0
				runtime.record.CompletionMarker = ""
				runtime.record.CompletionState = ""
				runtime.record.CompletionHasFinalReply = false
				runtime.record.CompletionTurnID = ""
				runtime.record.CompletionAt = ""
				runtime.record.CompletionPending = false
			}
			runtime.record.AgentHubSessionID = session.ID
		}
		turnID := activeAgentHubTurnID(session)
		if turnID == "" {
			runtime.record.CurrentTurnID = ""
		} else {
			if runtime.record.LastTurnID != turnID {
				turnStarted = true
				runtime.record.LastTurnID = turnID
			}
			if turnStarted || strings.TrimSpace(runtime.record.TurnStartedAt) == "" {
				runtime.record.TurnStartedAt = observedAgentHubTurnStartedAt(session)
				refreshTurnStartedAt = true
				startedTurnID = turnID
			}
			runtime.record.CurrentTurnID = turnID
		}
		// LastOutputAt degenerates to the AgentHub session update time: without a
		// server-side event pipeline it is the closest available recency signal.
		if updatedAt := generationTime(session.UpdatedAt); !updatedAt.IsZero() {
			if generationTime(runtime.record.UpdatedAt).Before(updatedAt) {
				runtime.record.UpdatedAt = session.UpdatedAt
			}
			if generationTime(runtime.record.LastOutputAt).Before(updatedAt) {
				runtime.record.LastOutputAt = session.UpdatedAt
			}
		}
		runtime.agentHubState = session.State
	})
	if persistErr != nil {
		rt.addPUANotice(m, "warning", "agenthub/reconcile", "Persist session reconciliation: "+persistErr.Error())
		return
	}
	if turnStarted && m.server != nil {
		resourceID := normalizedResourceID(updated.ResourceID)
		turnNumber, err := m.server.allocateResourceTurnNumber(workspace.Path, resourceID)
		if err != nil {
			rt.addPUANotice(m, "warning", "agenthub/reconcile", "Persist resource turn ordinal: "+err.Error())
		} else {
			updated, persistErr = rt.mutateGeneration(func(record *generationRecord) { record.TurnNumber = turnNumber })
			if persistErr != nil {
				rt.addPUANotice(m, "warning", "agenthub/reconcile", "Persist generation turn ordinal: "+persistErr.Error())
			}
		}
	}
	if refreshTurnStartedAt {
		_ = m.enqueueRuntimeOperation(rt, func() {
			rt.refreshAgentHubTurnStartedAt(session.ID, startedTurnID, client)
		})
	}
	rt.mu.Lock()
	if rt.agentHub == nil {
		rt.agentHub = client
	}
	rt.mu.Unlock()
	if turnFinished {
		// Mark the completion inspection before idle reconciliation can run. The
		// terminal event timestamp, rather than this poll's ready projection,
		// establishes the next durable idle boundary.
		rt.prepareTurnCompletion(session)
		rt.markTurnCompletionPending()
	}

	// A turn ends when the session leaves running/waiting_approval for ready or
	// stopped. Record the durable completion before publishing the final state.
	if turnFinished {
		_ = m.enqueueRuntimeOperation(rt, func() {
			rt.handleTurnFinished(m, session)
		})
	}
	if !turnFinished && (session.State == "ready" || session.State == "stopped") && rt.completionHistoryPending(session) {
		_ = m.enqueueRuntimeOperation(rt, func() {
			rt.recordTurnCompletion(session)
		})
	}
	if updated.ReplacementPending && (session.State == "ready" || session.State == "stopped") {
		_ = m.enqueueResourceController(rt.workspace, updated.ResourceID, func() error {
			m.retireResourceGenerationLocked(context.Background(), rt)
			return nil
		})
	} else if (session.State == "ready" || session.State == "running" || session.State == "waiting_approval") && len(updated.PendingMessages) > 0 {
		_ = m.enqueueRuntimeOperation(rt, func() {
			if err := m.reconcileResourceMailboxLocked(context.Background(), rt.workspace, updated.ResourceID); err != nil {
				rt.addPUANotice(m, "warning", "resource/message", "Queued message retry failed: "+err.Error())
			}
		})
	}
	if updated.GenerationID != "" && (session.State == "ready" || (updated.IdleSleepStopRequested && (session.State == "stopping" || session.State == "stopped"))) {
		if err := m.reconcileIdleGenerationLocked(ctx, workspace, updated, session, client); err != nil {
			rt.addPUANotice(m, "warning", "resource/idle-sleep", err.Error())
		}
	}
	if updated.GenerationID != "" && (session.State == "ready" || session.State == "stopped") {
		if err := m.reconcileGenerationPolicyLocked(ctx, workspace, updated.GenerationID, session, rt, client, policy); err != nil {
			rt.addPUANotice(m, "warning", "generation/policy", err.Error())
		}
	}
}

// agentHubStateForPUAStatus approximates the AgentHub state behind a PUA
// generation status, for runtimes that have not observed a session yet.
func agentHubStateForPUAStatus(status string) string {
	switch status {
	case "starting":
		return "starting"
	case "running":
		return "running"
	case "waiting_approval":
		return "waiting_approval"
	case "idle":
		return "ready"
	case "stopping":
		return "stopping"
	case "stopped":
		return "stopped"
	case "idle-suspended":
		return "stopped"
	default:
		return ""
	}
}

// activeAgentHubTurnID ignores stale currentTurnId values on non-active
// session snapshots. AgentHub may retain the just-finished Turn ID after the
// session has already returned to ready; the state transition is authoritative
// for whether PUA should project an active Turn.
func activeAgentHubTurnID(session agentHubSession) string {
	if session.State != "running" && session.State != "waiting_approval" {
		return ""
	}
	return strings.TrimSpace(session.CurrentTurnID)
}

func observedAgentHubTurnStartedAt(session agentHubSession) string {
	if !generationTime(session.UpdatedAt).IsZero() {
		return session.UpdatedAt
	}
	return time.Now().Format(time.RFC3339Nano)
}

// refreshAgentHubTurnStartedAt replaces the stable first-observed timestamp
// with AgentHub's canonical Turn start time. It runs once per newly observed
// Turn and never lets a late response overwrite a newer Turn.
func (rt *agentRuntime) refreshAgentHubTurnStartedAt(sessionID, turnID string, client *agentHubClient) {
	sessionID = strings.TrimSpace(sessionID)
	turnID = strings.TrimSpace(turnID)
	if client == nil || sessionID == "" || turnID == "" {
		return
	}
	turn, _, err := client.SessionTurn(context.Background(), sessionID, turnID)
	if err != nil || generationTime(turn.StartedAt).IsZero() {
		return
	}
	_, _ = rt.mutateGeneration(func(record *generationRecord) {
		if strings.TrimSpace(record.AgentHubSessionID) == sessionID && record.LastTurnID == turnID {
			record.TurnStartedAt = turn.StartedAt
		}
	})
}

// applyAgentHubSessionState projects an AgentHub action or session response
// onto the local generation record. A running/waiting_approval -> ready/stopped edge is the
// only status signal that schedules durable canonical terminal inspection.
func (rt *agentRuntime) applyAgentHubSessionState(m *agentManager, session agentHubSession) {
	turnFinished := false
	turnStarted := false
	refreshTurnStartedAt := false
	startedTurnID := ""
	record, persistErr := rt.mutateRuntime(func(runtime *agentRuntime) {
		previousState := runtime.agentHubState
		if previousState == "" {
			previousState = agentHubStateForPUAStatus(runtime.record.Status)
		}
		turnFinished = (previousState == "running" || previousState == "waiting_approval") &&
			(session.State == "ready" || session.State == "stopped")
		if strings.TrimSpace(session.ID) != "" {
			if runtime.record.CompletionSessionID != session.ID && !turnFinished {
				// A new AgentHub session has a new event cursor. Establish its
				// baseline without carrying historical completion state across it.
				runtime.record.CompletionSessionID = session.ID
				runtime.record.CompletionCursor = session.LastEventID
				runtime.record.CompletionEventID = 0
				runtime.record.CompletionMarker = ""
				runtime.record.CompletionState = ""
				runtime.record.CompletionHasFinalReply = false
				runtime.record.CompletionTurnID = ""
				runtime.record.CompletionAt = ""
				runtime.record.CompletionPending = false
			}
			runtime.record.AgentHubSessionID = session.ID
		}
		turnID := activeAgentHubTurnID(session)
		if turnID == "" {
			runtime.record.CurrentTurnID = ""
		} else {
			if runtime.record.LastTurnID != turnID {
				turnStarted = true
				runtime.record.LastTurnID = turnID
			}
			if turnStarted || strings.TrimSpace(runtime.record.TurnStartedAt) == "" {
				runtime.record.TurnStartedAt = observedAgentHubTurnStartedAt(session)
				refreshTurnStartedAt = true
				startedTurnID = turnID
			}
			runtime.record.CurrentTurnID = turnID
		}
		runtime.agentHubState = session.State
		runtime.record.Status = puaStatusForAgentHubState(session.State)
		if session.State == "starting" || session.State == "ready" || session.State == "running" || session.State == "waiting_approval" {
			runtime.record.ResumeFailureCount = 0
			runtime.record.ResumeRetryAt = ""
			runtime.record.ResumeLastError = ""
			if runtime.record.LifecycleReceipt != nil && runtime.record.LifecycleReceipt.Operation == GenerationOperationResumeSession {
				receipt := *runtime.record.LifecycleReceipt
				receipt.State = GenerationReceiptSucceeded
				runtime.record.LifecycleReceipt = &receipt
			}
		}
		m.projectResourceIdleState(&runtime.record, session, previousState, turnFinished)
		if session.State == "stopped" {
			if runtime.record.IdleSleepStopRequested {
				runtime.record.AgentHubStoppedObserved = false
			} else {
				runtime.record.AgentHubStoppedObserved = true
				runtime.record.ArchivedTaskStopRequested = false
			}
			runtime.agentHubStopRequested = false
		}
		if session.State == "ready" || session.State == "starting" {
			// A resumed session proves the stopped observation is stale.
			runtime.record.AgentHubStoppedObserved = false
		}
		if updatedAt := generationTime(session.UpdatedAt); !updatedAt.IsZero() {
			runtime.record.UpdatedAt = session.UpdatedAt
			if generationTime(runtime.record.LastOutputAt).Before(updatedAt) {
				runtime.record.LastOutputAt = session.UpdatedAt
			}
		} else {
			runtime.record.UpdatedAt = time.Now().Format(time.RFC3339)
		}
	})
	if persistErr != nil {
		rt.addPUANotice(m, "warning", "agenthub/action", "Persist AgentHub response: "+persistErr.Error())
		return
	}
	if turnStarted && m != nil && m.server != nil {
		resourceID := normalizedResourceID(record.ResourceID)
		turnNumber, err := m.server.allocateResourceTurnNumber(rt.workspace.Path, resourceID)
		if err != nil {
			rt.addPUANotice(m, "warning", "agenthub/action", "Persist resource turn ordinal: "+err.Error())
		} else {
			record, persistErr = rt.mutateGeneration(func(record *generationRecord) { record.TurnNumber = turnNumber })
			if persistErr != nil {
				rt.addPUANotice(m, "warning", "agenthub/action", "Persist generation turn ordinal: "+persistErr.Error())
			}
		}
	}
	if refreshTurnStartedAt {
		rt.mu.Lock()
		client := rt.agentHub
		rt.mu.Unlock()
		_ = m.enqueueRuntimeOperation(rt, func() {
			rt.refreshAgentHubTurnStartedAt(session.ID, startedTurnID, client)
		})
	}
	if turnFinished {
		// Keep the idle sleeper behind the same durable terminal inspection when
		// an action response, rather than the poller, observes the ready edge.
		rt.prepareTurnCompletion(session)
		rt.markTurnCompletionPending()
	}
	if turnFinished {
		_ = m.enqueueRuntimeOperation(rt, func() {
			rt.handleTurnFinished(m, session)
		})
	} else if (session.State == "ready" || session.State == "stopped") && rt.completionHistoryPending(session) {
		_ = m.enqueueRuntimeOperation(rt, func() {
			rt.recordTurnCompletion(session)
		})
	}
	if record.ReplacementPending && (session.State == "ready" || session.State == "stopped") {
		_ = m.enqueueResourceController(rt.workspace, record.ResourceID, func() error {
			m.retireResourceGenerationLocked(context.Background(), rt)
			return nil
		})
	} else if (session.State == "ready" || session.State == "running" || session.State == "waiting_approval") && len(record.PendingMessages) > 0 {
		_ = m.enqueueResourceController(rt.workspace, record.ResourceID, func() error {
			if err := m.reconcileResourceMailboxLocked(context.Background(), rt.workspace, record.ResourceID); err != nil {
				rt.addPUANotice(m, "warning", "resource/message", "Queued message retry failed: "+err.Error())
			}
			return nil
		})
	}
}
