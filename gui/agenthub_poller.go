package main

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
// The poller never reads events: run status follows session state, turn
// terminal edges drive AutoRun recovery, and durable stopped sessions drive
// Forge session release. Only changed projections are persisted.

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
		runs, loadErr := loadAgentRuns(workspace.Path)
		if loadErr != nil {
			failures = append(failures, fmt.Sprintf("%s: %v", workspace.ID, loadErr))
			continue
		}
		for _, run := range runs {
			if !isAgentHubRun(run) {
				continue
			}
			m.reconcileAgentHubRun(workspace, run, byExternalID, byID, client)
		}
	}
	if len(failures) > 0 {
		return errors.New(strings.Join(failures, "; "))
	}
	return nil
}

// reconcileAgentHubRun projects one AgentHub session onto a local run. Runs
// are matched by source external id, falling back to the bound AgentHub
// session id. Sessions absent from the non-archived list were archived or
// deleted upstream: live runs conservatively move to recovering while stopped
// runs keep their terminal state.
func (m *agentManager) reconcileAgentHubRun(workspace guiWorkspace, run agentRun, byExternalID, byID map[string]agentHubSession, client *agentHubClient) {
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
		return
	}

	rt.mu.Lock()
	current := rt.run
	previousState := rt.agentHubState
	if previousState == "" {
		previousState = agentHubStateForForgeStatus(current.Status)
	}
	stoppedObserved := current.AgentHubStoppedObserved || session.State == "stopped"
	newStatus := forgeStatusForAgentHubState(session.State)
	if session.State == "archived" && !stoppedObserved {
		// An archived session that never reached durable stopped keeps the
		// strict recovering semantics.
		newStatus = "recovering"
	}
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
	if session.State == "stopped" && !current.AgentHubStoppedObserved {
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
