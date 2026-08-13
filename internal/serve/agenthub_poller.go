package serve

import (
	"context"
	"errors"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/disksing/forge/internal/app"
)

// This file reconciles local generation records with AgentHub session state by
// polling one session list per interval instead of replaying event history.
// Run status follows session state. Forge session release is owned here and
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
// every interval as the fallback for any run the recovery pass missed.
func (m *agentManager) startAgentRecovery(ctx context.Context) {
	go func() {
		if err := m.recoverAgentHubRuns(ctx); err != nil {
			log.Printf("recover AgentHub runs: %v", err)
		}
	}()
	m.startAgentHubPoller(ctx)
}

// startAgentHubPoller polls AgentHub session state in the background until
// ctx is cancelled.
func (m *agentManager) startAgentHubPoller(ctx context.Context) {
	go func() {
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
	}()
}

// pollAgentHubSessions lists this instance's live AgentHub sessions once and
// reconciles every local run against the result.
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
		forgeWorkspace, openErr := app.OpenWorkspace(workspace.Path)
		if openErr != nil {
			failures = append(failures, fmt.Sprintf("%s: inspect resources: %v", workspace.ID, openErr))
			continue
		}
		runs, loadErr := loadAgentRuns(workspace.Path)
		if loadErr != nil {
			failures = append(failures, fmt.Sprintf("%s: %v", workspace.ID, loadErr))
			continue
		}
		taskArchiveStates := inspectTaskArchiveStates(forgeWorkspace, runs)
		for _, run := range runs {
			if !isAgentHubRun(run) {
				continue
			}
			resourceID := strings.TrimSpace(run.ResourceID)
			archiveState, isTask := taskArchiveStates[resourceID]
			archiveManaged := resourceID != "" && resourceID != "workspace" && resourceID != app.SchedulerResourceID
			if !isTask && archiveManaged {
				resource, resourceErr := forgeWorkspace.ResourceValue(resourceID)
				archiveState = taskArchiveState{archived: resource.Archived, err: resourceErr}
			}
			if isTask && archiveState.err != nil {
				// A missing or unreadable resource is not proof that Forge
				// intentionally reclaimed the task. Keep the AgentHub session
				// open and surface the failed inspection instead.
				failures = append(failures, fmt.Sprintf("%s run %s resource %s: %v", workspace.ID, run.ID, resourceID, archiveState.err))
			} else if !isTask && archiveManaged && archiveState.err != nil {
				failures = append(failures, fmt.Sprintf("%s run %s resource %s: %v", workspace.ID, run.ID, resourceID, archiveState.err))
			} else if archiveState.archived {
				// Reclaim only the session id already bound to this run. Source
				// lookup is deliberately not used here: duplicate or stale
				// external ids must never make archival stop the wrong session.
				if session, found := byID[strings.TrimSpace(run.AgentHubSessionID)]; found &&
					m.stopAgentHubSessionForArchivedResource(ctx, cfg, workspace, run, session, client) {
					continue
				}
			}
			m.reconcileAgentHubRun(ctx, cfg, workspace, run, byExternalID, byID, client)
		}
	}
	profileConfig := agentHubGUIConfig{
		Workspaces: cfg.Workspaces, ResourceDefaults: cfg.ResourceDefaults,
		AgentProfiles: make([]agentHubProfileRoute, 0, len(cfg.AgentProfiles)),
	}
	for _, route := range cfg.AgentProfiles {
		profileConfig.AgentProfiles = append(profileConfig.AgentProfiles, agentHubProfileRoute{Key: route.Key, Description: route.Description, AgentName: route.AgentName})
	}
	if err := m.profileRoutesChanged(ctx, profileConfig, profileConfig); err != nil {
		failures = append(failures, err.Error())
	}
	m.resourceMu.Lock()
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
	m.resourceMu.Unlock()
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
// ResourceValue for every retained run would repeatedly scan the same task
// directory on every two-second poll, which gets expensive precisely when a
// Workspace has accumulated many sessions.
func inspectTaskArchiveStates(workspace *app.Workspace, runs []agentRun) map[string]taskArchiveState {
	projectTasks := make(map[string]map[string]struct{})
	for _, run := range runs {
		if !isAgentHubRun(run) {
			continue
		}
		resourceID := strings.TrimSpace(run.ResourceID)
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
// active AgentHub session whose owning Forge resource is archived. Resource
// generations are also archived after the durable stopped edge. It returns true
// when normal reconciliation should be skipped for this poll.
func (m *agentManager) stopAgentHubSessionForArchivedResource(ctx context.Context, cfg config, workspace guiWorkspace, run agentRun, session agentHubSession, client *agentHubClient) bool {
	if !agentHubSessionExactlyMatchesRun(cfg, run, session) {
		return false
	}
	if session.State == "stopped" && run.GenerationID != "" {
		go func() {
			if _, err := client.Archive(context.WithoutCancel(ctx), session.ID); err != nil {
				if rt := m.runtimeByID(run.ID); rt != nil {
					rt.addForgeNotice(m, "warning", "agenthub/resource-reclaim", "Archive stopped resource generation: "+err.Error())
				}
			}
		}()
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
	rt := m.runtimeByID(run.ID)
	if rt == nil {
		rt = newAgentHubRuntime(m, workspace, run, client)
		m.registerRuntime(rt)
	}

	guarded := false
	_, persistErr := rt.mutateRuntime(func(runtime *agentRuntime) {
		if runtime.agentHubStopRequested {
			guarded = true
			return
		}
		runtime.run.Status = "stopping"
		runtime.run.UpdatedAt = time.Now().Format(time.RFC3339)
		runtime.run.ArchivedTaskStopRequested = true
		runtime.agentHubStopRequested = true
	})
	if guarded {
		// An earlier request still has no durable terminal observation. Keep
		// the run's stopping/recovering projection and do not let an active
		// list result hide the ambiguous outcome.
		return true
	}
	if persistErr != nil {
		// Do not issue a non-idempotent stop unless the guard was persisted.
		rt.addForgeNotice(m, "error", "agenthub/task-reclaim", fmt.Sprintf("persist archived-resource session stop guard: %v", persistErr))
		return false
	}
	rt.mu.Lock()
	rt.agentHub = client
	rt.mu.Unlock()

	go func() {
		stopped, err := client.Stop(ctx, session.ID)
		if err != nil {
			rt.mu.Lock()
			rt.agentHubStopRequested = false
			rt.mu.Unlock()
			rt.setRecoveryError(m, fmt.Errorf("stop AgentHub session for archived task %s: %w", run.ResourceID, err))
			return
		}
		if !agentHubSessionExactlyMatchesRun(cfg, run, stopped) {
			rt.mu.Lock()
			rt.agentHubStopRequested = false
			rt.mu.Unlock()
			rt.setRecoveryError(m, fmt.Errorf("AgentHub stop response for archived task %s did not match the persisted Forge run source", run.ResourceID))
			return
		}
		rt.applyAgentHubSessionState(m, stopped)
		if stopped.State == "stopped" && run.GenerationID != "" {
			if _, err := client.Archive(context.WithoutCancel(ctx), stopped.ID); err != nil {
				rt.addForgeNotice(m, "warning", "agenthub/resource-reclaim", "Archive stopped resource generation: "+err.Error())
			}
		}
	}()
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

func agentHubSessionExactlyMatchesRun(cfg config, run agentRun, session agentHubSession) bool {
	sessionID := strings.TrimSpace(run.AgentHubSessionID)
	externalID := strings.TrimSpace(run.SourceExternalID)
	return sessionID != "" && externalID != "" && session.ID == sessionID && session.Source != nil &&
		session.Source.App == agentHubSourceApp &&
		session.Source.InstanceID == runSourceInstanceID(cfg, run) &&
		session.Source.ExternalID == externalID
}

// reconcileAgentHubRun projects one AgentHub session onto a local run. Runs
// are matched by source external id, falling back to the bound AgentHub
// session id. Sessions absent from the non-archived list are re-checked once
// on demand by their bound id: an archived session drives the
// archived-after-stopped reconciliation, while a session that is truly gone
// conservatively moves live runs to recovering and keeps terminal runs
// untouched.
func (m *agentManager) reconcileAgentHubRun(ctx context.Context, cfg config, workspace guiWorkspace, run agentRun, byExternalID, byID map[string]agentHubSession, client *agentHubClient) {
	session, found := byExternalID[sourceLookupKey(runSourceInstanceID(cfg, run), run.SourceExternalID)]
	if !found {
		session, found = byID[strings.TrimSpace(run.AgentHubSessionID)]
	}
	rt := m.runtimeByID(run.ID)
	if rt == nil {
		rt = newAgentHubRuntime(m, workspace, run, client)
		m.registerRuntime(rt)
	}
	if !found {
		// The live list excludes archived sessions. Re-check the bound session
		// on demand before failing closed: a session that stopped and was
		// archived between polls is the missed stopped edge this
		// reconciliation owns.
		if id := strings.TrimSpace(run.AgentHubSessionID); id != "" {
			if fetched, err := client.GetSession(ctx, id); err == nil {
				if agentHubSourceConflicts(cfg, run, fetched) {
					rt.setRecoveryError(m, fmt.Errorf("AgentHub session %s source does not match the persisted Forge run source; transient Forge session retained", id))
					return
				}
				session, found = fetched, true
			}
		}
	}
	if !found {
		if run.GenerationID != "" && isLiveAgentStatus(run.Status) {
			if err := m.recoverAgentHubRun(context.WithoutCancel(ctx), cfg, client, workspace, run, nil); err != nil {
				rt.addForgeNotice(m, "warning", "agenthub/recovery", "Recreate missing resource generation: "+err.Error())
			}
			return
		}
		_, _ = rt.mutateRun(func(run *agentRun) {
			if run.Status != "recovering" && isLiveAgentStatus(run.Status) {
				run.Status = "recovering"
				run.UpdatedAt = time.Now().Format(time.RFC3339)
			}
		})
		// A durable stopped edge observed locally permits the release even
		// after the session disappeared upstream; the call is a no-op for
		// every other run.
		go rt.releaseForgeSessionAfterStopped(m)
		return
	}
	if session.State == "archived" {
		rt.reconcileArchivedAgentHubSession(m, client, session)
		return
	}

	turnFinished := false
	turnStarted := false
	updated, persistErr := rt.mutateRuntime(func(runtime *agentRuntime) {
		previousState := runtime.agentHubState
		if previousState == "" {
			previousState = agentHubStateForForgeStatus(runtime.run.Status)
		}
		turnFinished = (previousState == "running" || previousState == "waiting_approval") &&
			(session.State == "ready" || session.State == "stopped")
		runtime.run.Status = forgeStatusForAgentHubState(session.State)
		runtime.run.AgentHubStoppedObserved = runtime.run.AgentHubStoppedObserved || session.State == "stopped"
		if session.State == "stopped" {
			// The durable terminal state resolves any ambiguity around the stop
			// action. Clear the guard so an explicit out-of-band resume can be
			// reclaimed again while the resource remains archived.
			runtime.run.ArchivedTaskStopRequested = false
			runtime.agentHubStopRequested = false
		}
		if session.State == "ready" || session.State == "starting" {
			runtime.run.AgentHubStoppedObserved = false
		}
		if strings.TrimSpace(session.ID) != "" {
			if runtime.run.CompletionSessionID != session.ID && !turnFinished {
				// A new AgentHub session starts a new cursor. Baseline it unless
				// this response is the active -> ready/stopped edge whose terminal
				// history must be inspected from the beginning.
				runtime.run.CompletionSessionID = session.ID
				runtime.run.CompletionCursor = session.LastEventID
				runtime.run.CompletionEventID = 0
				runtime.run.CompletionMarker = ""
				runtime.run.CompletionState = ""
				runtime.run.CompletionTurnID = ""
				runtime.run.CompletionAt = ""
				runtime.run.CompletionPending = false
			}
			runtime.run.AgentHubSessionID = session.ID
		}
		turnID := activeAgentHubTurnID(session)
		if turnID == "" {
			runtime.run.CurrentTurnID = ""
		} else {
			if runtime.run.LastTurnID != turnID {
				turnStarted = true
				runtime.run.LastTurnID = turnID
			}
			runtime.run.CurrentTurnID = turnID
		}
		// LastOutputAt degenerates to the AgentHub session update time: without a
		// server-side event pipeline it is the closest available recency signal.
		if updatedAt := agentRunTime(session.UpdatedAt); !updatedAt.IsZero() {
			if agentRunTime(runtime.run.UpdatedAt).Before(updatedAt) {
				runtime.run.UpdatedAt = session.UpdatedAt
			}
			if agentRunTime(runtime.run.LastOutputAt).Before(updatedAt) {
				runtime.run.LastOutputAt = session.UpdatedAt
			}
		}
		runtime.agentHubState = session.State
	})
	if persistErr != nil {
		rt.addForgeNotice(m, "warning", "agenthub/reconcile", "Persist session reconciliation: "+persistErr.Error())
		return
	}
	if turnStarted && m.server != nil {
		resourceID := normalizedResourceID(updated.ResourceID)
		turnNumber, err := m.server.allocateResourceTurnNumber(workspace.Path, resourceID)
		if err != nil {
			rt.addForgeNotice(m, "warning", "agenthub/reconcile", "Persist resource turn ordinal: "+err.Error())
		} else {
			updated, persistErr = rt.mutateRun(func(run *agentRun) { run.TurnNumber = turnNumber })
			if persistErr != nil {
				rt.addForgeNotice(m, "warning", "agenthub/reconcile", "Persist generation turn ordinal: "+persistErr.Error())
			}
		}
	}
	rt.mu.Lock()
	if rt.agentHub == nil {
		rt.agentHub = client
	}
	rt.mu.Unlock()

	// A turn ends when the session leaves running/waiting_approval for ready or
	// stopped. Record the durable completion before publishing the final state.
	if turnFinished {
		go func() {
			rt.handleTurnFinished(m, session)
			if session.State == "stopped" && updated.AgentHubStoppedObserved && strings.TrimSpace(updated.ForgeSessionID) != "" {
				rt.releaseForgeSessionAfterStopped(m)
			}
		}()
	}
	if !turnFinished && (session.State == "ready" || session.State == "stopped") && rt.completionHistoryPending(session) {
		go func() {
			rt.recordTurnCompletion(session)
			if session.State == "stopped" && updated.AgentHubStoppedObserved && strings.TrimSpace(updated.ForgeSessionID) != "" {
				rt.releaseForgeSessionAfterStopped(m)
			}
		}()
	} else if !turnFinished && session.State == "stopped" && updated.AgentHubStoppedObserved && strings.TrimSpace(updated.ForgeSessionID) != "" {
		// Idempotent: releases the Forge session on the stopped edge and
		// retries a release that failed on an earlier poll.
		go rt.releaseForgeSessionAfterStopped(m)
	}
	if updated.ReplacementPending && (session.State == "ready" || session.State == "stopped") {
		go m.retireResourceGeneration(context.Background(), rt)
	} else if (session.State == "ready" || session.State == "running" || session.State == "waiting_approval") && len(updated.PendingMessages) > 0 {
		go func() {
			if err := rt.deliverPendingResourceMessages(context.Background(), m); err != nil {
				rt.addForgeNotice(m, "warning", "resource/message", "Queued message retry failed: "+err.Error())
			}
		}()
	}
}

// agentHubStateForForgeStatus approximates the AgentHub state behind a Forge
// run status, for runtimes that have not observed a session yet.
func agentHubStateForForgeStatus(status string) string {
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
	default:
		return ""
	}
}

// activeAgentHubTurnID ignores stale currentTurnId values on non-active
// session snapshots. AgentHub may retain the just-finished Turn ID after the
// session has already returned to ready; the state transition is authoritative
// for whether Forge should project an active Turn.
func activeAgentHubTurnID(session agentHubSession) string {
	if session.State != "running" && session.State != "waiting_approval" {
		return ""
	}
	return strings.TrimSpace(session.CurrentTurnID)
}

// applyAgentHubSessionState projects an AgentHub action or session response
// onto the local run. A running/waiting_approval -> ready/stopped edge is the
// only status signal that schedules durable canonical terminal inspection.
func (rt *agentRuntime) applyAgentHubSessionState(m *agentManager, session agentHubSession) {
	turnFinished := false
	turnStarted := false
	run, persistErr := rt.mutateRuntime(func(runtime *agentRuntime) {
		previousState := runtime.agentHubState
		if previousState == "" {
			previousState = agentHubStateForForgeStatus(runtime.run.Status)
		}
		turnFinished = (previousState == "running" || previousState == "waiting_approval") &&
			(session.State == "ready" || session.State == "stopped")
		if strings.TrimSpace(session.ID) != "" {
			if runtime.run.CompletionSessionID != session.ID && !turnFinished {
				// A new AgentHub session has a new event cursor. Establish its
				// baseline without carrying historical completion state across it.
				runtime.run.CompletionSessionID = session.ID
				runtime.run.CompletionCursor = session.LastEventID
				runtime.run.CompletionEventID = 0
				runtime.run.CompletionMarker = ""
				runtime.run.CompletionState = ""
				runtime.run.CompletionTurnID = ""
				runtime.run.CompletionAt = ""
				runtime.run.CompletionPending = false
			}
			runtime.run.AgentHubSessionID = session.ID
		}
		turnID := activeAgentHubTurnID(session)
		if turnID == "" {
			runtime.run.CurrentTurnID = ""
		} else {
			if runtime.run.LastTurnID != turnID {
				turnStarted = true
				runtime.run.LastTurnID = turnID
			}
			runtime.run.CurrentTurnID = turnID
		}
		runtime.agentHubState = session.State
		runtime.run.Status = forgeStatusForAgentHubState(session.State)
		if session.State == "stopped" {
			runtime.run.AgentHubStoppedObserved = true
			runtime.run.ArchivedTaskStopRequested = false
			runtime.agentHubStopRequested = false
		}
		if session.State == "ready" || session.State == "starting" {
			// A resumed session proves the stopped observation is stale.
			runtime.run.AgentHubStoppedObserved = false
		}
		if updatedAt := agentRunTime(session.UpdatedAt); !updatedAt.IsZero() {
			runtime.run.UpdatedAt = session.UpdatedAt
			if agentRunTime(runtime.run.LastOutputAt).Before(updatedAt) {
				runtime.run.LastOutputAt = session.UpdatedAt
			}
		} else {
			runtime.run.UpdatedAt = time.Now().Format(time.RFC3339)
		}
	})
	if persistErr != nil {
		rt.addForgeNotice(m, "warning", "agenthub/action", "Persist AgentHub response: "+persistErr.Error())
		return
	}
	if turnStarted && m != nil && m.server != nil {
		resourceID := normalizedResourceID(run.ResourceID)
		turnNumber, err := m.server.allocateResourceTurnNumber(rt.workspace.Path, resourceID)
		if err != nil {
			rt.addForgeNotice(m, "warning", "agenthub/action", "Persist resource turn ordinal: "+err.Error())
		} else {
			run, persistErr = rt.mutateRun(func(run *agentRun) { run.TurnNumber = turnNumber })
			if persistErr != nil {
				rt.addForgeNotice(m, "warning", "agenthub/action", "Persist generation turn ordinal: "+persistErr.Error())
			}
		}
	}
	if turnFinished {
		go func() {
			rt.handleTurnFinished(m, session)
			if session.State == "stopped" {
				rt.releaseForgeSessionAfterStopped(m)
			}
		}()
	} else if (session.State == "ready" || session.State == "stopped") && rt.completionHistoryPending(session) {
		go func() {
			rt.recordTurnCompletion(session)
			if session.State == "stopped" {
				rt.releaseForgeSessionAfterStopped(m)
			}
		}()
	} else if run.Status == "stopped" && run.AgentHubStoppedObserved {
		go rt.releaseForgeSessionAfterStopped(m)
	}
	if run.ReplacementPending && (session.State == "ready" || session.State == "stopped") {
		go m.retireResourceGeneration(context.Background(), rt)
	} else if (session.State == "ready" || session.State == "running" || session.State == "waiting_approval") && len(run.PendingMessages) > 0 {
		go func() {
			if err := rt.deliverPendingResourceMessages(context.Background(), m); err != nil {
				rt.addForgeNotice(m, "warning", "resource/message", "Queued message retry failed: "+err.Error())
			}
		}()
	}
}

func (rt *agentRuntime) agentHubStopped() bool {
	rt.mu.Lock()
	defer rt.mu.Unlock()
	return rt.run.Status == "stopped" && rt.run.AgentHubStoppedObserved
}
