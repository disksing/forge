package serve

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func TestAgentHubRecoveryProjectsSessionsWithoutEventsOrStreams(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	seedPollerRun(t, fake, workspace, agentRun{
		ID: "run-live", WorkspaceID: workspace.ID, ResourceID: "project1", AgentHubSessionID: "ses_live",
		SourceExternalID: workspace.ID + "/run-live", ForgeSessionID: "session-live",
		Status: "running", CreatedAt: "2026-08-01T00:00:01Z", UpdatedAt: "2026-08-01T00:00:01Z",
	}, agentHubSession{ID: "ses_live", State: "ready", UpdatedAt: "2026-08-01T00:00:10Z"})
	seedPollerRun(t, fake, workspace, agentRun{
		ID: "run-stopped", WorkspaceID: workspace.ID, ResourceID: "project1.task1", AgentHubSessionID: "ses_stopped",
		SourceExternalID: workspace.ID + "/run-stopped", Status: "stopped",
		AgentHubStoppedObserved: true,
		CreatedAt:               "2026-08-01T00:00:01Z", UpdatedAt: "2026-08-01T00:00:01Z",
	}, agentHubSession{ID: "ses_stopped", State: "stopped", UpdatedAt: "2026-08-01T00:00:11Z"})

	if err := manager.recoverAgentHubRuns(context.Background()); err != nil {
		t.Fatal(err)
	}
	fake.mu.Lock()
	listCalls, eventsCalls, streamCalls := fake.listCalls, fake.eventsCalls, fake.streamCalls
	fake.mu.Unlock()
	if listCalls != 1 {
		t.Fatalf("recovery must issue exactly one session list, got %d", listCalls)
	}
	if eventsCalls != 0 || streamCalls != 0 {
		t.Fatalf("recovery must not read event history or open streams: events=%d streams=%d", eventsCalls, streamCalls)
	}
	fake.mu.Lock()
	for _, action := range fake.actions {
		if action == "resume" {
			fake.mu.Unlock()
			t.Fatal("stopped Session without mailbox demand was resumed during startup")
		}
	}
	fake.mu.Unlock()
	live := manager.runtimeByID("run-live")
	if live == nil {
		t.Fatal("live run was not recovered")
	}
	waitForRuntimeTest(t, func() bool {
		run := pollerRunState(live)
		return run.CompletionSessionID == "ses_live" && !run.CompletionPending
	})
	live.mu.Lock()
	liveRun, liveState := live.run, live.agentHubState
	live.mu.Unlock()
	if liveRun.Status != "idle" || liveState != "ready" {
		t.Fatalf("live run projection mismatch: %#v state=%q", liveRun, liveState)
	}
	stopped := manager.runtimeByID("run-stopped")
	if stopped == nil {
		t.Fatal("stopped run was not recovered")
	}
	stoppedRun := pollerRunState(stopped)
	if stoppedRun.Status != "stopped" || !stoppedRun.AgentHubStoppedObserved {
		t.Fatalf("stopped run projection mismatch: %#v", stoppedRun)
	}
	if response := closeRuntimeTestRun(t, manager, workspace, "run-live"); response.Code != http.StatusOK {
		t.Fatalf("test cleanup close failed: %d %s", response.Code, response.Body.String())
	}
	waitForRuntimeTest(t, func() bool { return len(testForgeSessions(t, workspace.Path)) == 0 })
}

func TestAgentHubRecoverySingleListForManyStoppedRuns(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	now := "2026-08-01T00:00:01Z"
	const stoppedRuns = 8
	runs := make([]agentRun, 0, stoppedRuns)
	fake.mu.Lock()
	for index := 0; index < stoppedRuns; index++ {
		id := fmt.Sprintf("run-%03d", index)
		sessionID := "ses_" + id
		runs = append(runs, agentRun{
			ID: id, WorkspaceID: workspace.ID, ResourceID: fmt.Sprintf("project1.task%d", index+1), AgentHubSessionID: sessionID,
			SourceExternalID: workspace.ID + "/" + id, Status: "stopped",
			AgentHubStoppedObserved: true, CreatedAt: now, UpdatedAt: now,
		})
		fake.sessions[sessionID] = agentHubSession{
			ID: sessionID, State: "stopped", UpdatedAt: now,
			Source: &agentHubSource{App: agentHubSourceApp, InstanceID: "forge-runtime-test", ExternalID: workspace.ID + "/" + id},
		}
	}
	fake.mu.Unlock()
	if err := rewriteTestAgentRuns(workspace.Path, runs); err != nil {
		t.Fatal(err)
	}

	if err := manager.recoverAgentHubRuns(context.Background()); err != nil {
		t.Fatal(err)
	}
	fake.mu.Lock()
	listCalls, eventsCalls, streamCalls := fake.listCalls, fake.eventsCalls, fake.streamCalls
	fake.mu.Unlock()
	if listCalls != 1 {
		t.Fatalf("%d stopped runs must recover with exactly one session list, got %d", stoppedRuns, listCalls)
	}
	if eventsCalls != 0 || streamCalls != 0 {
		t.Fatalf("stopped runs must not read events or open streams: events=%d streams=%d", eventsCalls, streamCalls)
	}
	if rt := manager.runtimeByID("run-007"); rt == nil {
		t.Fatal("stopped runs were not registered as lightweight runtimes")
	}
}

func TestAgentHubRecoveryDoesNotReplayConfirmedActiveTurnAfterDaemonRestart(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	run := agentRun{
		ID: "run-active-restart", WorkspaceID: workspace.ID, ResourceID: "project1.task1",
		AgentHubSessionID: "ses-active-restart", SourceExternalID: workspace.ID + "/run-active-restart",
		Generation: 1, GenerationID: "gen-active-restart", AgentHubAgentName: "fake-agent",
		Status: "running", LastTurnID: "turn-active-restart", CurrentTurnID: "turn-active-restart",
		CreatedAt: "2026-08-01T00:00:01Z", UpdatedAt: "2026-08-01T00:00:01Z",
	}
	seedPollerRun(t, fake, workspace, run, agentHubSession{
		ID: run.AgentHubSessionID, State: "stopped", StopReason: "daemon_recovery",
		UpdatedAt: "2026-08-01T00:00:10Z",
	})
	fake.mu.Lock()
	fake.appendLocked(run.AgentHubSessionID, "message.input", map[string]any{
		"messageId": "msg-confirmed-restart", "text": "already delivered", "role": "user",
	})
	fake.appendLocked(run.AgentHubSessionID, "turn.started", map[string]any{"text": "already delivered"})
	terminal := fake.appendLocked(run.AgentHubSessionID, "turn.cancelled", map[string]any{"reason": "daemon_recovery"})
	terminal.TurnID = run.LastTurnID
	fake.events[run.AgentHubSessionID][len(fake.events[run.AgentHubSessionID])-1] = terminal
	session := fake.sessions[run.AgentHubSessionID]
	session.State = "stopped"
	session.StopReason = "daemon_recovery"
	session.CurrentTurnID = ""
	fake.sessions[session.ID] = session
	fake.mu.Unlock()

	restarted := newAgentManager(manager.server)
	manager.server.agents = restarted
	if err := restarted.recoverAgentHubRuns(context.Background()); err != nil {
		t.Fatal(err)
	}
	waitForRuntimeTest(t, func() bool {
		rt := restarted.runtimeByID(run.ID)
		if rt == nil {
			return false
		}
		current := pollerRunState(rt)
		return current.Status == "stopped" && !current.CompletionPending
	})
	fake.mu.Lock()
	messageIDs := append([]string(nil), fake.messageIDs...)
	actions := append([]string(nil), fake.actions...)
	fake.mu.Unlock()
	if len(messageIDs) != 0 {
		t.Fatalf("restart replayed a confirmed prompt: message ids=%#v", messageIDs)
	}
	for _, action := range actions {
		if action == "resume" {
			t.Fatalf("daemon recovery resumed a terminal stopped Session without mailbox demand: actions=%#v", actions)
		}
	}
}

func TestAgentHubRecoveryDoesNotBlockStartup(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	gate := make(chan struct{})
	blocking := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/v1/sessions" && r.Method == http.MethodGet {
			<-gate
		}
		fake.ServeHTTP(w, r)
	})
	hub := httptest.NewServer(blocking)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	seedPollerRun(t, fake, workspace, agentRun{
		ID: "run-live", WorkspaceID: workspace.ID, AgentHubSessionID: "ses_live",
		SourceExternalID: workspace.ID + "/run-live", ForgeSessionID: "session-live",
		Status: "running", CreatedAt: "2026-08-01T00:00:01Z", UpdatedAt: "2026-08-01T00:00:01Z",
	}, agentHubSession{ID: "ses_live", State: "ready", UpdatedAt: "2026-08-01T00:00:10Z"})

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	start := time.Now()
	manager.startAgentRecovery(ctx)
	if elapsed := time.Since(start); elapsed > time.Second {
		t.Fatalf("startup recovery blocked the caller for %s while AgentHub was unresponsive", elapsed)
	}
	close(gate)
	waitForRuntimeTest(t, func() bool {
		rt := manager.runtimeByID("run-live")
		if rt == nil {
			return false
		}
		rt.mu.Lock()
		defer rt.mu.Unlock()
		return rt.run.Status == "idle"
	})
	// Let the background recovery pass finish its Forge session bind and
	// projection saves before the deferred cancel and TempDir cleanup race it.
	waitForRuntimeTest(t, func() bool {
		sessions := testForgeSessions(t, workspace.Path)
		for _, session := range sessions {
			if session.Liveness.AgentHubSessionID == "ses_live" {
				return true
			}
		}
		return false
	})
	time.Sleep(100 * time.Millisecond)
}
