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

// This file reconciles local run projections with AgentHub session state by
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

// startAgentRecovery rebuilds run projections in the background so the HTTP
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
		SourceApp: agentHubSourceApp, SourceInstanceID: cfg.AgentHubInstanceID,
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
			if isTask && archiveState.err != nil {
				// A missing or unreadable resource is not proof that Forge
				// intentionally reclaimed the task. Keep the AgentHub session
				// open and surface the failed inspection instead.
				failures = append(failures, fmt.Sprintf("%s run %s resource %s: %v", workspace.ID, run.ID, resourceID, archiveState.err))
			} else if isTask && archiveState.archived {
				// Reclaim only the session id already bound to this run. Source
				// lookup is deliberately not used here: duplicate or stale
				// external ids must never make archival stop the wrong session.
				if session, found := byID[strings.TrimSpace(run.AgentHubSessionID)]; found &&
					m.stopAgentHubSessionForArchivedTask(ctx, cfg, workspace, run, session, client) {
					continue
				}
			}
			m.reconcileAgentHubRun(ctx, workspace, run, byExternalID, byID, client)
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

// stopAgentHubSessionForArchivedTask starts a single fail-closed stop for an
// active AgentHub session whose owning Forge task is archived. It returns true
// when normal reconciliation should be skipped for this poll.
func (m *agentManager) stopAgentHubSessionForArchivedTask(ctx context.Context, cfg config, workspace guiWorkspace, run agentRun, session agentHubSession, client *agentHubClient) bool {
	if !activeAgentHubSessionState(session.State) || !agentHubSessionExactlyMatchesRun(cfg, run, session) {
		return false
	}
	rt := m.runtimeByID(run.ID)
	if rt == nil {
		rt = newAgentHubRuntime(m, workspace, run, client)
		m.registerRuntime(rt)
	}

	rt.mu.Lock()
	if rt.agentHubStopRequested || rt.run.ArchivedTaskStopRequested {
		rt.mu.Unlock()
		// An earlier request still has no durable terminal observation. Keep
		// the run's stopping/recovering projection and do not let an active
		// list result hide the ambiguous outcome.
		return true
	}
	previous := rt.run
	rt.run.Status = "stopping"
	rt.run.UpdatedAt = time.Now().Format(time.RFC3339)
	rt.run.ArchivedTaskStopRequested = true
	rt.agentHub = client
	rt.agentHubStopRequested = true
	updated := rt.run
	rt.mu.Unlock()
	if err := saveAgentRun(workspace.Path, updated); err != nil {
		// Do not issue a non-idempotent stop unless the guard was persisted.
		rt.mu.Lock()
		rt.run = previous
		rt.agentHubStopRequested = false
		rt.mu.Unlock()
		rt.addForgeNotice(m, "error", "agenthub/task-reclaim", fmt.Sprintf("persist archived-task session stop guard: %v", err))
		return false
	}

	go func() {
		stopped, err := client.Stop(ctx, session.ID)
		if err != nil {
			rt.setRecoveryError(m, fmt.Errorf("stop AgentHub session for archived task %s: %w", run.ResourceID, err))
			return
		}
		if !agentHubSessionExactlyMatchesRun(cfg, run, stopped) {
			rt.setRecoveryError(m, fmt.Errorf("AgentHub stop response for archived task %s did not match the persisted Forge run source; stop outcome will not be retried", run.ResourceID))
			return
		}
		rt.applyAgentHubSessionState(m, stopped)
	}()
	return true
}

func activeAgentHubSessionState(state string) bool {
	switch state {
	case "starting", "ready", "busy", "waiting_approval":
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
		session.Source.InstanceID == cfg.AgentHubInstanceID &&
		session.Source.ExternalID == externalID
}

// reconcileAgentHubRun projects one AgentHub session onto a local run. Runs
// are matched by source external id, falling back to the bound AgentHub
// session id. Sessions absent from the non-archived list are re-checked once
// on demand by their bound id: an archived session drives the
// archived-after-stopped reconciliation, while a session that is truly gone
// conservatively moves live runs to recovering and keeps terminal runs
// untouched.
func (m *agentManager) reconcileAgentHubRun(ctx context.Context, workspace guiWorkspace, run agentRun, byExternalID, byID map[string]agentHubSession, client *agentHubClient) {
	session, found := byExternalID[strings.TrimSpace(run.SourceExternalID)]
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
				if agentHubSourceConflicts(run, fetched) {
					rt.setRecoveryError(m, fmt.Errorf("AgentHub session %s source does not match the persisted Forge run source; transient Forge session retained", id))
					return
				}
				session, found = fetched, true
			}
		}
	}
	if !found {
		rt.mu.Lock()
		if rt.run.Status != "recovering" && isLiveAgentStatus(rt.run.Status) {
			rt.run.Status = "recovering"
			rt.run.UpdatedAt = time.Now().Format(time.RFC3339)
			updated := rt.run
			rt.mu.Unlock()
			_ = saveAgentRun(workspace.Path, updated)
		} else {
			rt.mu.Unlock()
		}
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

	rt.mu.Lock()
	current := rt.run
	previousState := rt.agentHubState
	if previousState == "" {
		previousState = agentHubStateForForgeStatus(current.Status)
	}
	turnFinished := (previousState == "busy" || previousState == "waiting_approval") &&
		(session.State == "ready" || session.State == "stopped")
	stoppedObserved := current.AgentHubStoppedObserved || session.State == "stopped"
	archivedTaskStopRequested := current.ArchivedTaskStopRequested
	if session.State == "stopped" {
		// The durable terminal state resolves any ambiguity around the stop
		// action. Clear the guard so an explicit out-of-band resume can be
		// reclaimed again while the task remains archived.
		archivedTaskStopRequested = false
	}
	if session.State == "ready" || session.State == "starting" {
		// A resumed session proves the stopped observation is stale.
		stoppedObserved = false
	}
	newStatus := forgeStatusForAgentHubState(session.State)
	updated := current
	updated.Status = newStatus
	updated.AgentHubStoppedObserved = stoppedObserved
	updated.ArchivedTaskStopRequested = archivedTaskStopRequested
	if strings.TrimSpace(session.ID) != "" {
		if updated.CompletionSessionID != session.ID && !turnFinished {
			// A new AgentHub session starts a new cursor. Baseline it unless
			// this response is the active -> ready/stopped edge whose terminal
			// history must be inspected from the beginning.
			updated.CompletionSessionID = session.ID
			updated.CompletionCursor = session.LastEventID
			updated.CompletionEventID = 0
			updated.CompletionMarker = ""
			updated.CompletionState = ""
			updated.CompletionTurnID = ""
			updated.CompletionAt = ""
			updated.CompletionPending = false
		}
		updated.AgentHubSessionID = session.ID
	}
	// LastOutputAt degenerates to the AgentHub session update time: without a
	// server-side event pipeline it is the closest available recency signal.
	if updatedAt := agentRunTime(session.UpdatedAt); !updatedAt.IsZero() {
		if agentRunTime(updated.UpdatedAt).Before(updatedAt) {
			updated.UpdatedAt = session.UpdatedAt
		}
		if agentRunTime(updated.LastOutputAt).Before(updatedAt) {
			updated.LastOutputAt = session.UpdatedAt
		}
	}
	changed := updated != current
	rt.run = updated
	rt.agentHubState = session.State
	if session.State == "stopped" {
		rt.agentHubStopRequested = false
	}
	if rt.agentHub == nil {
		rt.agentHub = client
	}
	rt.mu.Unlock()
	if changed {
		_ = saveAgentRun(workspace.Path, updated)
	}

	// A turn ends when the session leaves busy/waiting_approval for ready or
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
}

// agentHubStateForForgeStatus approximates the AgentHub state behind a Forge
// run status, for runtimes that have not observed a session yet.
func agentHubStateForForgeStatus(status string) string {
	switch status {
	case "starting":
		return "starting"
	case "running":
		return "busy"
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

// applyAgentHubSessionState projects an AgentHub action or session response
// onto the local run. A busy/waiting_approval -> ready/stopped edge is the
// only status signal that schedules durable canonical terminal inspection.
func (rt *agentRuntime) applyAgentHubSessionState(m *agentManager, session agentHubSession) {
	rt.mu.Lock()
	previousState := rt.agentHubState
	if previousState == "" {
		previousState = agentHubStateForForgeStatus(rt.run.Status)
	}
	turnFinished := (previousState == "busy" || previousState == "waiting_approval") &&
		(session.State == "ready" || session.State == "stopped")
	if strings.TrimSpace(session.ID) != "" {
		if rt.run.CompletionSessionID != session.ID && !turnFinished {
			// A new AgentHub session has a new event cursor. Establish its
			// baseline without carrying historical completion state across it.
			rt.run.CompletionSessionID = session.ID
			rt.run.CompletionCursor = session.LastEventID
			rt.run.CompletionEventID = 0
			rt.run.CompletionMarker = ""
			rt.run.CompletionState = ""
			rt.run.CompletionTurnID = ""
			rt.run.CompletionAt = ""
			rt.run.CompletionPending = false
		}
		rt.run.AgentHubSessionID = session.ID
	}
	rt.agentHubState = session.State
	rt.run.Status = forgeStatusForAgentHubState(session.State)
	if session.State == "stopped" {
		rt.run.AgentHubStoppedObserved = true
		rt.run.ArchivedTaskStopRequested = false
		rt.agentHubStopRequested = false
	}
	if session.State == "ready" || session.State == "starting" {
		// A resumed session proves the stopped observation is stale.
		rt.run.AgentHubStoppedObserved = false
	}
	if updatedAt := agentRunTime(session.UpdatedAt); !updatedAt.IsZero() {
		rt.run.UpdatedAt = session.UpdatedAt
		if agentRunTime(rt.run.LastOutputAt).Before(updatedAt) {
			rt.run.LastOutputAt = session.UpdatedAt
		}
	} else {
		rt.run.UpdatedAt = time.Now().Format(time.RFC3339)
	}
	run := rt.run
	rt.mu.Unlock()
	_ = saveAgentRun(rt.workspace.Path, run)
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
}

func (rt *agentRuntime) agentHubStopped() bool {
	rt.mu.Lock()
	defer rt.mu.Unlock()
	return rt.run.Status == "stopped" && rt.run.AgentHubStoppedObserved
}
