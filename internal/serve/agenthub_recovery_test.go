package serve

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/disksing/forge/internal/app"
)

func TestAgentHubRecoveryProjectsSessionsWithoutEventsOrStreams(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	seedPollerRun(t, fake, workspace, agentRun{
		ID: "run-live", WorkspaceID: workspace.ID, AgentHubSessionID: "ses_live",
		SourceExternalID: workspace.ID + "/run-live", ForgeSessionID: "session-live",
		Status: "running", CreatedAt: "2026-08-01T00:00:01Z", UpdatedAt: "2026-08-01T00:00:01Z",
	}, agentHubSession{ID: "ses_live", State: "ready", UpdatedAt: "2026-08-01T00:00:10Z"})
	seedPollerRun(t, fake, workspace, agentRun{
		ID: "run-stopped", WorkspaceID: workspace.ID, AgentHubSessionID: "ses_stopped",
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

func TestAgentHubRecoveryFinishesSchedulerTurnEndedWhileDown(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	seedPollerRun(t, fake, workspace, agentRun{
		ID: "run-sched", WorkspaceID: workspace.ID, ResourceID: "project1.task1",
		AgentHubSessionID: "ses_sched", SourceExternalID: workspace.ID + "/run-sched",
		ForgeSessionID: "session-test", Status: "running", SchedulerTurn: true,
		AutoRunGeneration: 1,
		CreatedAt:         "2026-08-01T00:00:01Z", UpdatedAt: "2026-08-01T00:00:01Z",
	}, agentHubSession{ID: "ses_sched", State: "ready", UpdatedAt: "2026-08-01T00:00:10Z"})

	// The turn ended while the GUI was down: busy on disk, ready upstream.
	if err := manager.recoverAgentHubRuns(context.Background()); err != nil {
		t.Fatal(err)
	}
	waitForRuntimeTest(t, func() bool {
		forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
		if err != nil {
			return false
		}
		resource, err := forgeWorkspace.Resource("project1.task1")
		if err != nil || resource.AutoRun == nil {
			return false
		}
		for _, entry := range resource.Logs {
			if entry.Title == "Auto Run retry" && entry.Details == "agent did not set AutoRun state" {
				return true
			}
		}
		return false
	})
	rt := manager.runtimeByID("run-sched")
	if rt == nil {
		t.Fatal("scheduler run was not recovered")
	}
	// The recovery branch immediately sends the continuation prompt. Wait for
	// that asynchronous finish to complete before TempDir cleanup removes the
	// workspace underneath it.
	waitForRuntimeTest(t, func() bool {
		fake.mu.Lock()
		defer fake.mu.Unlock()
		return len(fake.messageSteers) == 1
	})
	waitForRuntimeTest(t, func() bool {
		rt.mu.Lock()
		defer rt.mu.Unlock()
		return !rt.schedulerTurnFinishing
	})
}

func TestAgentHubRecoverySingleListForManyStoppedRuns(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	now := "2026-08-01T00:00:01Z"
	runs := make([]agentRun, 0, 100)
	fake.mu.Lock()
	for index := 0; index < 100; index++ {
		id := fmt.Sprintf("run-%03d", index)
		sessionID := "ses_" + id
		runs = append(runs, agentRun{
			ID: id, WorkspaceID: workspace.ID, AgentHubSessionID: sessionID,
			SourceExternalID: workspace.ID + "/" + id, Status: "stopped",
			AgentHubStoppedObserved: true, CreatedAt: now, UpdatedAt: now,
		})
		fake.sessions[sessionID] = agentHubSession{
			ID: sessionID, State: "stopped", UpdatedAt: now,
			Source: &agentHubSource{App: agentHubSourceApp, InstanceID: "forge-runtime-test", ExternalID: workspace.ID + "/" + id},
		}
	}
	fake.mu.Unlock()
	if err := rewriteAgentRuns(workspace.Path, runs); err != nil {
		t.Fatal(err)
	}

	if err := manager.recoverAgentHubRuns(context.Background()); err != nil {
		t.Fatal(err)
	}
	fake.mu.Lock()
	listCalls, eventsCalls, streamCalls := fake.listCalls, fake.eventsCalls, fake.streamCalls
	fake.mu.Unlock()
	if listCalls != 1 {
		t.Fatalf("100 stopped runs must recover with exactly one session list, got %d", listCalls)
	}
	if eventsCalls != 0 || streamCalls != 0 {
		t.Fatalf("stopped runs must not read events or open streams: events=%d streams=%d", eventsCalls, streamCalls)
	}
	if rt := manager.runtimeByID("run-099"); rt == nil {
		t.Fatal("stopped runs were not registered as lightweight runtimes")
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
