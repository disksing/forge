package serve

import (
	"context"
	"errors"
	"fmt"
	"log"
	"strings"
	"time"
)

// This file reconciles local run projections with AgentHub session state by
// polling one session list per interval instead of replaying event history.
// Run status follows session state and turn terminal edges drive AutoRun
// recovery. Forge session release is owned here and nowhere else: durable
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
		// Reconciliation only controls sessions in owned Workspaces.
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
			m.reconcileAgentHubRun(ctx, workspace, run, byExternalID, byID, client)
		}
	}
	if len(failures) > 0 {
		return errors.New(strings.Join(failures, "; "))
	}
	return nil
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
					rt.setRecoveryError(m, fmt.Errorf("AgentHub session %s source does not match the persisted Forge run source; Forge session lock retained", id))
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
		rt.mu.Lock()
		previousStatus := rt.run.Status
		rt.mu.Unlock()
		rt.reconcileArchivedAgentHubSession(m, client, session, previousStatus)
		return
	}

	rt.mu.Lock()
	current := rt.run
	previousState := rt.agentHubState
	if previousState == "" {
		previousState = agentHubStateForForgeStatus(current.Status)
	}
	stoppedObserved := current.AgentHubStoppedObserved || session.State == "stopped"
	if session.State == "ready" || session.State == "starting" {
		// A resumed session proves the stopped observation is stale.
		stoppedObserved = false
	}
	newStatus := forgeStatusForAgentHubState(session.State)
	updated := current
	updated.Status = newStatus
	updated.AgentHubStoppedObserved = stoppedObserved
	if strings.TrimSpace(session.ID) != "" {
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
	if rt.agentHub == nil {
		rt.agentHub = client
	}
	rt.mu.Unlock()
	if changed {
		_ = saveAgentRun(workspace.Path, updated)
	}

	// A scheduler turn ends when the session leaves busy/waiting_approval for
	// ready or stopped. finishSchedulerTurn is idempotent against duplicate
	// triggers from the event pipeline and later polls.
	turnFinished := (previousState == "busy" || previousState == "waiting_approval") &&
		(session.State == "ready" || session.State == "stopped")
	if turnFinished && updated.SchedulerTurn {
		go rt.finishSchedulerTurn(m)
	}
	if session.State == "stopped" && updated.AgentHubStoppedObserved && strings.TrimSpace(updated.ForgeSessionID) != "" {
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
// onto the local run without reading any event history.
func (rt *agentRuntime) applyAgentHubSessionState(m *agentManager, session agentHubSession) {
	rt.mu.Lock()
	rt.agentHubState = session.State
	rt.run.Status = forgeStatusForAgentHubState(session.State)
	if session.State == "stopped" {
		rt.run.AgentHubStoppedObserved = true
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
	if run.Status == "stopped" && run.AgentHubStoppedObserved {
		go rt.releaseForgeSessionAfterStopped(m)
	}
}

func (rt *agentRuntime) agentHubStopped() bool {
	rt.mu.Lock()
	defer rt.mu.Unlock()
	return rt.run.Status == "stopped" && rt.run.AgentHubStoppedObserved
}
