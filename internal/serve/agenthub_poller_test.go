package serve

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/disksing/forge/internal/app"
)

// seedPollerRun registers an AgentHub session in the fake and persists the
// matching local run projection for the poller to reconcile.
func seedPollerRun(t *testing.T, fake *runtimeFakeAgentHub, workspace guiWorkspace, run agentRun, session agentHubSession) {
	t.Helper()
	if run.ForgeSessionID != "" {
		run.ForgeSessionID = seedTestForgeSession(t, workspace, run.SourceExternalID)
	}
	if session.Source == nil {
		session.Source = &agentHubSource{
			App: agentHubSourceApp, InstanceID: "forge-runtime-test", ExternalID: run.SourceExternalID,
		}
	}
	fake.mu.Lock()
	fake.sessions[session.ID] = session
	fake.mu.Unlock()
	if err := saveAgentRun(workspace.Path, run); err != nil {
		t.Fatal(err)
	}
	if run.SchedulerTurn {
		forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
		if err != nil {
			t.Fatal(err)
		}
		if _, err := forgeWorkspace.StartSelfDriving(run.ResourceID); err != nil {
			t.Fatal(err)
		}
	}
}

func pollerRunState(rt *agentRuntime) agentRun {
	rt.mu.Lock()
	defer rt.mu.Unlock()
	return rt.run
}

func TestAgentHubPollerReconcilesMultipleRunsWithSingleList(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	seedPollerRun(t, fake, workspace, agentRun{
		ID: "run-a", WorkspaceID: workspace.ID, AgentHubSessionID: "ses_a",
		SourceExternalID: workspace.ID + "/run-a", Status: "running",
		CreatedAt: "2026-08-01T00:00:01Z", UpdatedAt: "2026-08-01T00:00:01Z",
	}, agentHubSession{ID: "ses_a", State: "ready", UpdatedAt: "2026-08-01T00:00:10Z"})
	seedPollerRun(t, fake, workspace, agentRun{
		ID: "run-b", WorkspaceID: workspace.ID, AgentHubSessionID: "ses_b",
		SourceExternalID: workspace.ID + "/run-b", Status: "starting",
		CreatedAt: "2026-08-01T00:00:01Z", UpdatedAt: "2026-08-01T00:00:01Z",
	}, agentHubSession{ID: "ses_b", State: "stopped", UpdatedAt: "2026-08-01T00:00:11Z"})
	// Give run-a a visible durable cursor so the test can wait for the
	// completion worker's final save instead of observing its brief setup
	// window under -race.
	fake.mu.Lock()
	fake.events["ses_a"] = []agentHubEvent{{
		ID: 1, Time: "2026-08-01T00:00:10Z", Type: "session.state", SessionID: "ses_a",
		Data: []byte(`{"state":"ready"}`),
	}}
	sessionA := fake.sessions["ses_a"]
	sessionA.LastEventID = 1
	fake.sessions["ses_a"] = sessionA
	fake.mu.Unlock()

	if err := manager.pollAgentHubSessions(context.Background()); err != nil {
		t.Fatal(err)
	}
	fake.mu.Lock()
	listCalls := fake.listCalls
	fake.mu.Unlock()
	if listCalls != 1 {
		t.Fatalf("one poll must issue exactly one session list, got %d", listCalls)
	}
	runA := pollerRunState(manager.runtimeByID("run-a"))
	waitForRuntimeTest(t, func() bool {
		run := pollerRunState(manager.runtimeByID("run-a"))
		// CompletionSessionID is established before the completion worker marks
		// the durable event cursor. Wait for that cursor too so TempDir cleanup
		// cannot race the worker's final save under -race.
		return run.CompletionSessionID == "ses_a" && run.CompletionCursor >= 1 && !run.CompletionPending
	})
	runA = pollerRunState(manager.runtimeByID("run-a"))
	if runA.Status != "idle" || runA.UpdatedAt != "2026-08-01T00:00:10Z" || runA.LastOutputAt != "2026-08-01T00:00:10Z" {
		t.Fatalf("run-a projection not reconciled: %#v", runA)
	}
	rtA := manager.runtimeByID("run-a")
	rtA.mu.Lock()
	stateA := rtA.agentHubState
	rtA.mu.Unlock()
	if stateA != "ready" {
		t.Fatalf("run-a AgentHub state = %q, want ready", stateA)
	}
	runB := pollerRunState(manager.runtimeByID("run-b"))
	if runB.Status != "stopped" || !runB.AgentHubStoppedObserved {
		t.Fatalf("run-b projection not reconciled: %#v", runB)
	}
	if response := closeRuntimeTestRun(t, manager, workspace, "run-a"); response.Code != http.StatusOK {
		t.Fatalf("test cleanup close failed: %d %s", response.Code, response.Body.String())
	}
	waitForRuntimeTest(t, func() bool { return len(testForgeSessions(t, workspace.Path)) == 0 })
}

func TestAgentHubPollerStopsSessionForArchivedTask(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	seedPollerRun(t, fake, workspace, agentRun{
		ID: "run-archived-task", WorkspaceID: workspace.ID, ResourceID: "project1.task1",
		AgentHubSessionID: "ses_archived_task", SourceExternalID: workspace.ID + "/run-archived-task",
		ForgeSessionID: "session-test", Status: "idle",
		CreatedAt: "2026-08-01T00:00:01Z", UpdatedAt: "2026-08-01T00:00:01Z",
	}, agentHubSession{ID: "ses_archived_task", State: "ready", UpdatedAt: "2026-08-01T00:00:10Z"})
	forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := forgeWorkspace.ArchiveResource("project1.task1"); err != nil {
		t.Fatal(err)
	}

	if err := manager.pollAgentHubSessions(context.Background()); err != nil {
		t.Fatal(err)
	}
	waitForRuntimeTest(t, func() bool {
		fake.mu.Lock()
		defer fake.mu.Unlock()
		return fake.sessions["ses_archived_task"].State == "stopped"
	})
	fake.mu.Lock()
	actions := append([]string(nil), fake.actions...)
	fake.mu.Unlock()
	if strings.Count(strings.Join(actions, ","), "stop") != 1 {
		t.Fatalf("archived task must stop its AgentHub session exactly once: %#v", actions)
	}
	waitForRuntimeTest(t, func() bool {
		run := pollerRunState(manager.runtimeByID("run-archived-task"))
		return run.Status == "stopped" && run.AgentHubStoppedObserved && run.ForgeSessionID == ""
	})
}

func TestAgentHubPollerKeepsSessionForOpenTask(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	seedPollerRun(t, fake, workspace, agentRun{
		ID: "run-open-task", WorkspaceID: workspace.ID, ResourceID: "project1.task1",
		AgentHubSessionID: "ses_open_task", SourceExternalID: workspace.ID + "/run-open-task", Status: "idle",
		CreatedAt: "2026-08-01T00:00:01Z", UpdatedAt: "2026-08-01T00:00:01Z",
	}, agentHubSession{ID: "ses_open_task", State: "ready", UpdatedAt: "2026-08-01T00:00:10Z"})

	if err := manager.pollAgentHubSessions(context.Background()); err != nil {
		t.Fatal(err)
	}
	fake.mu.Lock()
	defer fake.mu.Unlock()
	if fake.sessions["ses_open_task"].State != "ready" || len(fake.actions) != 0 {
		t.Fatalf("open task session must remain ready: session=%#v actions=%#v", fake.sessions["ses_open_task"], fake.actions)
	}
}

func TestAgentHubPollerDoesNotStopProjectSessionWhenProjectArchived(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	seedPollerRun(t, fake, workspace, agentRun{
		ID: "run-project", WorkspaceID: workspace.ID, ResourceID: "project1",
		AgentHubSessionID: "ses_project", SourceExternalID: workspace.ID + "/run-project", Status: "idle",
		CreatedAt: "2026-08-01T00:00:01Z", UpdatedAt: "2026-08-01T00:00:01Z",
	}, agentHubSession{ID: "ses_project", State: "ready", UpdatedAt: "2026-08-01T00:00:10Z"})
	forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := forgeWorkspace.ArchiveResource("project1.task1"); err != nil {
		t.Fatal(err)
	}
	if _, err := forgeWorkspace.ArchiveResource("project1"); err != nil {
		t.Fatal(err)
	}

	if err := manager.pollAgentHubSessions(context.Background()); err != nil {
		t.Fatal(err)
	}
	fake.mu.Lock()
	defer fake.mu.Unlock()
	if fake.sessions["ses_project"].State != "ready" || len(fake.actions) != 0 {
		t.Fatalf("project-level session must not be reclaimed with task sessions: session=%#v actions=%#v", fake.sessions["ses_project"], fake.actions)
	}
}

func TestAgentHubPollerDoesNotStopArchivedTaskSessionWithMismatchedSource(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	run := agentRun{
		ID: "run-source-mismatch", WorkspaceID: workspace.ID, ResourceID: "project1.task1",
		AgentHubSessionID: "ses_source_mismatch", SourceExternalID: workspace.ID + "/run-source-mismatch", Status: "idle",
		CreatedAt: "2026-08-01T00:00:01Z", UpdatedAt: "2026-08-01T00:00:01Z",
	}
	seedPollerRun(t, fake, workspace, run, agentHubSession{
		ID: "ses_source_mismatch", State: "ready", UpdatedAt: "2026-08-01T00:00:10Z",
		Source: &agentHubSource{App: agentHubSourceApp, InstanceID: "another-forge", ExternalID: run.SourceExternalID},
	})
	forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := forgeWorkspace.ArchiveResource("project1.task1"); err != nil {
		t.Fatal(err)
	}

	if err := manager.pollAgentHubSessions(context.Background()); err != nil {
		t.Fatal(err)
	}
	fake.mu.Lock()
	defer fake.mu.Unlock()
	if fake.sessions["ses_source_mismatch"].State != "ready" || fake.stopCalls != 0 {
		t.Fatalf("source mismatch must fail closed without stop: session=%#v stopCalls=%d", fake.sessions["ses_source_mismatch"], fake.stopCalls)
	}
}

func TestAgentHubPollerDoesNotStopSessionForMissingTask(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	seedPollerRun(t, fake, workspace, agentRun{
		ID: "run-missing-task", WorkspaceID: workspace.ID, ResourceID: "project1.task99",
		AgentHubSessionID: "ses_missing_task", SourceExternalID: workspace.ID + "/run-missing-task", Status: "idle",
		CreatedAt: "2026-08-01T00:00:01Z", UpdatedAt: "2026-08-01T00:00:01Z",
	}, agentHubSession{ID: "ses_missing_task", State: "ready", UpdatedAt: "2026-08-01T00:00:10Z"})

	if err := manager.pollAgentHubSessions(context.Background()); err == nil || !strings.Contains(err.Error(), "resource not found: project1.task99") {
		t.Fatalf("missing task inspection error = %v", err)
	}
	fake.mu.Lock()
	defer fake.mu.Unlock()
	if fake.sessions["ses_missing_task"].State != "ready" || fake.stopCalls != 0 {
		t.Fatalf("missing task must fail closed without stop: session=%#v stopCalls=%d", fake.sessions["ses_missing_task"], fake.stopCalls)
	}
}

func TestAgentHubPollerDoesNotRetryAmbiguousArchivedTaskStop(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	fake.failNextStop = true
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	seedPollerRun(t, fake, workspace, agentRun{
		ID: "run-stop-failure", WorkspaceID: workspace.ID, ResourceID: "project1.task1",
		AgentHubSessionID: "ses_stop_failure", SourceExternalID: workspace.ID + "/run-stop-failure",
		ForgeSessionID: "session-test", Status: "idle",
		CreatedAt: "2026-08-01T00:00:01Z", UpdatedAt: "2026-08-01T00:00:01Z",
	}, agentHubSession{ID: "ses_stop_failure", State: "ready", UpdatedAt: "2026-08-01T00:00:10Z"})
	forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := forgeWorkspace.ArchiveResource("project1.task1"); err != nil {
		t.Fatal(err)
	}

	if err := manager.pollAgentHubSessions(context.Background()); err != nil {
		t.Fatal(err)
	}
	waitForRuntimeTest(t, func() bool {
		rt := manager.runtimeByID("run-stop-failure")
		rt.mu.Lock()
		defer rt.mu.Unlock()
		return rt.agentHubStopRequested && rt.run.ArchivedTaskStopRequested &&
			rt.run.Status == "recovering" && rt.run.ForgeSessionID != ""
	})
	if err := manager.pollAgentHubSessions(context.Background()); err != nil {
		t.Fatal(err)
	}
	fake.mu.Lock()
	stopCalls := fake.stopCalls
	session := fake.sessions["ses_stop_failure"]
	fake.mu.Unlock()
	if stopCalls != 1 || session.State != "ready" {
		t.Fatalf("ambiguous stop must not be retried: session=%#v stopCalls=%d", session, stopCalls)
	}
	run := pollerRunState(manager.runtimeByID("run-stop-failure"))
	if run.Status != "recovering" || !run.ArchivedTaskStopRequested || run.ForgeSessionID == "" {
		t.Fatalf("ambiguous stop did not remain fail-closed: %#v", run)
	}

	// The guard is durable: replacing the manager simulates a Forge restart
	// and must not turn an unknown prior stop outcome into a duplicate request.
	restarted := newAgentManager(manager.server)
	if err := restarted.pollAgentHubSessions(context.Background()); err != nil {
		t.Fatal(err)
	}
	fake.mu.Lock()
	defer fake.mu.Unlock()
	if fake.stopCalls != 1 {
		t.Fatalf("ambiguous stop was retried after manager restart: stopCalls=%d", fake.stopCalls)
	}
	restartedRun := pollerRunState(restarted.runtimeByID("run-stop-failure"))
	if restartedRun.Status != "recovering" || !restartedRun.ArchivedTaskStopRequested {
		t.Fatalf("restart lost ambiguous stop guard: %#v", restartedRun)
	}
}

func TestAgentHubPollerBusyToReadyTriggersSelfDrivingRetry(t *testing.T) {
	for _, previousStatus := range []string{"running", "waiting_approval"} {
		t.Run(previousStatus, func(t *testing.T) {
			fake := newRuntimeFakeAgentHub()
			hub := httptest.NewServer(fake)
			defer hub.Close()
			manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
			seedPollerRun(t, fake, workspace, agentRun{
				ID: "run-sched", WorkspaceID: workspace.ID, ResourceID: "project1.task1",
				AgentHubSessionID: "ses_sched", SourceExternalID: workspace.ID + "/run-sched",
				ForgeSessionID: "session-test", Status: previousStatus, SchedulerTurn: true,
				SelfDrivingGeneration: 1,
				CreatedAt:             "2026-08-01T00:00:01Z", UpdatedAt: "2026-08-01T00:00:01Z",
			}, agentHubSession{ID: "ses_sched", State: "ready", UpdatedAt: "2026-08-01T00:00:10Z"})

			if err := manager.pollAgentHubSessions(context.Background()); err != nil {
				t.Fatal(err)
			}
			rt := manager.runtimeByID("run-sched")
			waitForRuntimeTest(t, func() bool {
				forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
				if err != nil {
					return false
				}
				resource, err := forgeWorkspace.Resource("project1.task1")
				if err != nil || resource.SelfDriving == nil {
					return false
				}
				hasRetry := false
				for _, entry := range resource.Logs {
					if entry.Title == "Self-Driving retry" && entry.Details == "agent did not set Self-Driving state" {
						hasRetry = true
						break
					}
				}
				if !hasRetry {
					return false
				}
				rt.mu.Lock()
				finishing := rt.schedulerTurnFinishing
				rt.mu.Unlock()
				return !finishing
			})
		})
	}
}

func TestAgentHubPollerBusyToStoppedFinishesTurnAndReleasesForgeSession(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	// A terminal Self-Driving state keeps the turn finish deterministic: the turn is
	// reclaimed without sending a continue prompt into the stopped session.
	seedPollerRun(t, fake, workspace, agentRun{
		ID: "run-sched", WorkspaceID: workspace.ID, ResourceID: "project1.task1",
		AgentHubSessionID: "ses_sched", SourceExternalID: workspace.ID + "/run-sched",
		ForgeSessionID: "session-test", Status: "running", SchedulerTurn: true,
		SelfDrivingGeneration: 1,
		CreatedAt:             "2026-08-01T00:00:01Z", UpdatedAt: "2026-08-01T00:00:01Z",
	}, agentHubSession{ID: "ses_sched", State: "stopped", UpdatedAt: "2026-08-01T00:00:10Z"})
	forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := forgeWorkspace.CompleteSelfDriving(app.SelfDrivingActionInput{TaskID: "project1.task1", Summary: "completed before stop"}); err != nil {
		t.Fatal(err)
	}

	if err := manager.pollAgentHubSessions(context.Background()); err != nil {
		t.Fatal(err)
	}
	rt := manager.runtimeByID("run-sched")
	waitForRuntimeTest(t, func() bool {
		run := pollerRunState(rt)
		rt.mu.Lock()
		finishing := rt.schedulerTurnFinishing
		rt.mu.Unlock()
		return run.ForgeSessionID == "" && run.Status == "stopped" && !run.SchedulerTurn && !finishing
	})
	run := pollerRunState(rt)
	if !run.AgentHubStoppedObserved {
		t.Fatalf("stopped observation was not recorded: %#v", run)
	}
	if sessions := testForgeSessions(t, workspace.Path); len(sessions) != 0 {
		t.Fatalf("durable stopped did not release the Forge session: %#v", sessions)
	}
}

func TestAgentHubPollerWaitingApprovalToBusyDoesNotFinishTurn(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	seedPollerRun(t, fake, workspace, agentRun{
		ID: "run-sched", WorkspaceID: workspace.ID, ResourceID: "project1.task1",
		AgentHubSessionID: "ses_sched", SourceExternalID: workspace.ID + "/run-sched",
		ForgeSessionID: "session-test", Status: "waiting_approval", SchedulerTurn: true,
		SelfDrivingGeneration: 1,
		CreatedAt:             "2026-08-01T00:00:01Z", UpdatedAt: "2026-08-01T00:00:01Z",
	}, agentHubSession{ID: "ses_sched", State: "busy", UpdatedAt: "2026-08-01T00:00:10Z"})

	if err := manager.pollAgentHubSessions(context.Background()); err != nil {
		t.Fatal(err)
	}
	run := pollerRunState(manager.runtimeByID("run-sched"))
	if run.Status != "running" || !run.SchedulerTurn {
		t.Fatalf("waiting_approval to busy projection mismatch: %#v", run)
	}
	// The turn is still running: no Self-Driving retry may be issued. Give any stray
	// goroutine a chance to run before checking the forge log.
	time.Sleep(200 * time.Millisecond)
	forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		t.Fatal(err)
	}
	resource, err := forgeWorkspace.Resource("project1.task1")
	if err != nil {
		t.Fatal(err)
	}
	for _, entry := range resource.Logs {
		if entry.Title == "Self-Driving retry" {
			t.Fatalf("waiting_approval to busy must not finish the scheduler turn: %#v", entry)
		}
	}
}

func TestAgentHubPollerMissingSessionMarksLiveRunRecovering(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	now := "2026-08-01T00:00:01Z"
	for _, run := range []agentRun{
		{ID: "run-live", WorkspaceID: workspace.ID, AgentHubSessionID: "ses_gone_live", Status: "running", CreatedAt: now, UpdatedAt: now},
		{ID: "run-stopped", WorkspaceID: workspace.ID, AgentHubSessionID: "ses_gone_stopped", Status: "stopped", AgentHubStoppedObserved: true, CreatedAt: now, UpdatedAt: now},
		{ID: "run-recovering", WorkspaceID: workspace.ID, AgentHubSessionID: "ses_gone_recovering", Status: "recovering", CreatedAt: now, UpdatedAt: now},
	} {
		if err := saveAgentRun(workspace.Path, run); err != nil {
			t.Fatal(err)
		}
	}

	if err := manager.pollAgentHubSessions(context.Background()); err != nil {
		t.Fatal(err)
	}
	// An archived session never reached durable stopped and disappears from the
	// non-archived list, so the live run conservatively moves to recovering.
	if got := pollerRunState(manager.runtimeByID("run-live")).Status; got != "recovering" {
		t.Fatalf("live run with a vanished session = %q, want recovering", got)
	}
	if got := pollerRunState(manager.runtimeByID("run-stopped")).Status; got != "stopped" {
		t.Fatalf("stopped run must keep its terminal state, got %q", got)
	}
	if got := pollerRunState(manager.runtimeByID("run-recovering")).Status; got != "recovering" {
		t.Fatalf("recovering run must stay recovering, got %q", got)
	}
}

func TestAgentHubPollerReadyClearsStoppedObserved(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	seedPollerRun(t, fake, workspace, agentRun{
		ID: "run-resumed", WorkspaceID: workspace.ID, AgentHubSessionID: "ses_resumed",
		SourceExternalID: workspace.ID + "/run-resumed", Status: "stopped",
		AgentHubStoppedObserved: true,
		CreatedAt:               "2026-08-01T00:00:01Z", UpdatedAt: "2026-08-01T00:00:01Z",
	}, agentHubSession{ID: "ses_resumed", State: "ready", UpdatedAt: "2026-08-01T00:00:10Z"})

	if err := manager.pollAgentHubSessions(context.Background()); err != nil {
		t.Fatal(err)
	}
	run := pollerRunState(manager.runtimeByID("run-resumed"))
	if run.Status != "idle" || run.AgentHubStoppedObserved {
		t.Fatalf("ready session must clear the stopped observation: %#v", run)
	}
}

func TestAgentHubApplySessionStateStartingClearsStoppedObserved(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	now := time.Now().Format(time.RFC3339)
	run := agentRun{
		ID: "run-starting", WorkspaceID: workspace.ID, AgentHubSessionID: "ses_starting",
		SourceExternalID: workspace.ID + "/run-starting", Status: "stopped",
		AgentHubStoppedObserved: true, Cwd: workspace.Path, CreatedAt: now, UpdatedAt: now,
	}
	if err := saveAgentRun(workspace.Path, run); err != nil {
		t.Fatal(err)
	}
	rt := newAgentHubRuntime(manager, workspace, run, nil)
	manager.registerRuntime(rt)
	rt.applyAgentHubSessionState(manager, agentHubSession{ID: "ses_starting", State: "starting", UpdatedAt: now})
	updated := pollerRunState(rt)
	if updated.Status != "starting" || updated.AgentHubStoppedObserved {
		t.Fatalf("starting session must clear the stopped observation: %#v", updated)
	}
}

func TestAgentHubPollerSkipsSaveWhenProjectionUnchanged(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	seedPollerRun(t, fake, workspace, agentRun{
		ID: "run-idle", WorkspaceID: workspace.ID, AgentHubSessionID: "ses_idle",
		SourceExternalID: workspace.ID + "/run-idle", Status: "idle",
		CompletionSessionID: "ses_idle",
		CreatedAt:           "2026-08-01T00:00:01Z", UpdatedAt: "2026-08-01T00:00:10Z",
		LastOutputAt: "2026-08-01T00:00:10Z",
	}, agentHubSession{ID: "ses_idle", State: "ready", UpdatedAt: "2026-08-01T00:00:10Z"})
	indexPath := agentIndexPath(workspace.Path)
	before := mustReadFile(t, indexPath)

	if err := manager.pollAgentHubSessions(context.Background()); err != nil {
		t.Fatal(err)
	}
	if err := manager.pollAgentHubSessions(context.Background()); err != nil {
		t.Fatal(err)
	}
	after := mustReadFile(t, indexPath)
	if string(before) != string(after) {
		t.Fatalf("unchanged projection must not rewrite runs.json:\nbefore:\n%s\nafter:\n%s", before, after)
	}
}

func TestAgentHubStopConfirmsDurableStopped(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	fake.stopAtStopping = true
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	recorder, detail := startRuntimeTestRun(t, manager, workspace, `{"agentName":"fake-agent","prompt":"work"}`)
	if recorder.Code != http.StatusOK {
		t.Fatalf("start failed: %s", recorder.Body.String())
	}
	rt := manager.runtimeByID(detail.Run.ID)
	go func() {
		time.Sleep(150 * time.Millisecond)
		fake.mu.Lock()
		fake.appendLocked(detail.Run.AgentHubSessionID, "session.state", map[string]any{"state": "stopped", "reason": "provider-exited"})
		session := fake.sessions[detail.Run.AgentHubSessionID]
		session.State = "stopped"
		session.StopReason = "provider-exited"
		fake.sessions[detail.Run.AgentHubSessionID] = session
		fake.mu.Unlock()
	}()

	stopRec := httptest.NewRecorder()
	manager.stopAgentHubRun(stopRec, httptest.NewRequest(http.MethodPost, "/stop", strings.NewReader(`{}`)), rt)
	if stopRec.Code != http.StatusOK || !strings.Contains(stopRec.Body.String(), "stopped") {
		t.Fatalf("stop should succeed once the session is durably stopped, got %d: %s", stopRec.Code, stopRec.Body.String())
	}
	waitForRuntimeTest(t, func() bool {
		return pollerRunState(rt).ForgeSessionID == ""
	})
}

func TestAgentHubStopFailsClosedOnConfirmTimeout(t *testing.T) {
	oldTimeout, oldInterval := agentHubStopConfirmTimeout, agentHubStopConfirmInterval
	agentHubStopConfirmTimeout, agentHubStopConfirmInterval = 300*time.Millisecond, 50*time.Millisecond
	defer func() {
		agentHubStopConfirmTimeout, agentHubStopConfirmInterval = oldTimeout, oldInterval
	}()
	fake := newRuntimeFakeAgentHub()
	fake.stopAtStopping = true
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	recorder, detail := startRuntimeTestRun(t, manager, workspace, `{"agentName":"fake-agent","prompt":"work"}`)
	if recorder.Code != http.StatusOK {
		t.Fatalf("start failed: %s", recorder.Body.String())
	}
	rt := manager.runtimeByID(detail.Run.ID)

	stopRec := httptest.NewRecorder()
	manager.stopAgentHubRun(stopRec, httptest.NewRequest(http.MethodPost, "/stop", strings.NewReader(`{}`)), rt)
	if stopRec.Code != http.StatusBadGateway || !strings.Contains(stopRec.Body.String(), "durable stopped") {
		t.Fatalf("stop without a durable stopped state must fail closed, got %d: %s", stopRec.Code, stopRec.Body.String())
	}
	if got := pollerRunState(rt).Status; got != "recovering" {
		t.Fatalf("timed-out stop must mark the run recovering, got %q", got)
	}
}
