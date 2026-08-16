package serve

import (
	"context"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/disksing/pua/internal/app"
	"github.com/disksing/pua/internal/generation"
)

// seedPollerRun registers an AgentHub session in the fake and persists the
// matching local run projection for the poller to reconcile.
func seedPollerRun(t *testing.T, fake *runtimeFakeAgentHub, workspace serveWorkspace, run agentRun, session agentHubSession) {
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
		ID: "run-a", WorkspaceID: workspace.ID, ResourceID: "project1", AgentHubSessionID: "ses_a",
		SourceExternalID: workspace.ID + "/run-a", Status: "running",
		CreatedAt: "2026-08-01T00:00:01Z", UpdatedAt: "2026-08-01T00:00:01Z",
	}, agentHubSession{ID: "ses_a", State: "ready", UpdatedAt: "2026-08-01T00:00:10Z"})
	seedPollerRun(t, fake, workspace, agentRun{
		ID: "run-b", WorkspaceID: workspace.ID, ResourceID: "project1.task1", AgentHubSessionID: "ses_b",
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

func TestAgentHubPollerProjectsTurnStartAndClearsStaleTurnIDAtReady(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	manager.now = func() time.Time { return time.Date(2026, 8, 1, 0, 0, 20, 0, time.UTC) }
	cfg, _, err := manager.agentHubRuntimeConfig()
	if err != nil {
		t.Fatal(err)
	}
	resolved, err := manager.resolveResourceAgent(workspace, "project1", cfg)
	if err != nil {
		t.Fatal(err)
	}
	seedPollerRun(t, fake, workspace, agentRun{
		ID: "run-activity-turn", WorkspaceID: workspace.ID, ResourceID: "project1", Generation: 1,
		GenerationID: "gen-activity-turn", AgentHubSessionID: "ses_activity_turn",
		SourceExternalID: workspace.ID + "/run-activity-turn", Status: "idle", AgentHubAgentName: resolved.AgentName,
		BindingKind: resolved.Binding.Kind, BindingName: resolved.Binding.Name,
		ProfileRevision: resolved.ProfileRevision, ResolvedProfile: resolved.ResolvedProfile,
		CreatedAt: "2026-08-01T00:00:01Z", UpdatedAt: "2026-08-01T00:00:01Z",
	}, agentHubSession{
		ID: "ses_activity_turn", State: "running", CurrentTurnID: "turn-activity",
		UpdatedAt: "2026-08-01T00:00:10Z",
	})
	if _, err := manager.server.mutateResourceAttentionAtPath(workspace.Path, "project1", func(state *resourceAttentionState) {
		state.Followed = true
	}); err != nil {
		t.Fatal(err)
	}
	fake.mu.Lock()
	fake.turns["ses_activity_turn"] = map[string]agentHubTurn{
		"turn-activity": {ID: "turn-activity", TurnID: "turn-activity", Status: "running", StartedAt: "2026-08-01T00:00:05Z"},
	}
	fake.mu.Unlock()

	if err := manager.pollAgentHubSessions(context.Background()); err != nil {
		t.Fatal(err)
	}
	waitForRuntimeTest(t, func() bool {
		return pollerRunState(manager.runtimeByID("run-activity-turn")).TurnStartedAt == "2026-08-01T00:00:05Z"
	})
	run := pollerRunState(manager.runtimeByID("run-activity-turn"))
	if run.Status != "running" || run.CurrentTurnID != "turn-activity" || run.LastTurnID != "turn-activity" || run.TurnNumber != 1 || run.TurnStartedAt != "2026-08-01T00:00:05Z" {
		t.Fatalf("poller did not project the started Turn: %#v", run)
	}

	// AgentHub may return to ready before clearing currentTurnId from its
	// session projection. Forge must treat ready as authoritative so Activity
	// stops presenting the resource as active and restores its dismiss action.
	fake.mu.Lock()
	session := fake.sessions["ses_activity_turn"]
	session.State = "ready"
	session.CurrentTurnID = "turn-activity"
	session.UpdatedAt = "2026-08-01T00:00:20Z"
	fake.sessions[session.ID] = session
	fake.mu.Unlock()

	if err := manager.pollAgentHubSessions(context.Background()); err != nil {
		t.Fatal(err)
	}
	run = pollerRunState(manager.runtimeByID("run-activity-turn"))
	if run.Status != "idle" || run.CurrentTurnID != "" || resourceRunHasActiveTurn(run) {
		t.Fatalf("ready session retained a stale active Turn: %#v", run)
	}
	tree, err := manager.server.treeAt(context.Background(), workspace.Path)
	if err != nil {
		t.Fatal(err)
	}
	if len(tree.AttentionList) != 1 || tree.AttentionList[0].Runtime == nil || tree.AttentionList[0].Runtime.ActiveTurn {
		t.Fatalf("Activity did not converge to an idle dismissible row: %#v", tree.AttentionList)
	}
}

func TestAgentHubPollerSkipsArchiveLookupForSchedulerResource(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	seedPollerRun(t, fake, workspace, agentRun{
		ID: "run-scheduler", WorkspaceID: workspace.ID, ResourceID: app.SchedulerResourceID,
		AgentHubSessionID: "ses_scheduler", SourceExternalID: workspace.ID + "/scheduler/1", Status: "idle",
		CreatedAt: "2026-08-01T00:00:01Z", UpdatedAt: "2026-08-01T00:00:01Z",
	}, agentHubSession{ID: "ses_scheduler", State: "ready", UpdatedAt: "2026-08-01T00:00:10Z"})

	if err := manager.pollAgentHubSessions(context.Background()); err != nil {
		t.Fatalf("Scheduler poll must not inspect the special resource as a Project/Task: %v", err)
	}
	if run := pollerRunState(manager.runtimeByID("run-scheduler")); run.Status != "idle" {
		t.Fatalf("Scheduler run projection changed unexpectedly: %#v", run)
	}
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
	if sessions := testForgeSessions(t, workspace.Path); len(sessions) != 1 {
		t.Fatalf("archiving must retain the transient session record until AgentHub reconciliation: %#v", sessions)
	}

	if err := manager.pollAgentHubSessions(context.Background()); err != nil {
		t.Fatal(err)
	}
	waitForRuntimeTest(t, func() bool {
		fake.mu.Lock()
		defer fake.mu.Unlock()
		state := fake.sessions["ses_archived_task"].State
		return state == "stopped" || state == "archived"
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
	if sessions := testForgeSessions(t, workspace.Path); len(sessions) != 0 {
		t.Fatalf("terminal reconciliation did not remove the transient session record: %#v", sessions)
	}
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

func TestArchiveResourceAllowsActiveTurnAndConvergesAsynchronously(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	seedPollerRun(t, fake, workspace, agentRun{
		ID: "run-active-archive", WorkspaceID: workspace.ID, ResourceID: "project1.task1", Generation: 1, GenerationID: "gen-active-archive",
		AgentHubSessionID: "ses_active_archive", SourceExternalID: "project1.task1/1", Status: "idle",
		CreatedAt: "2026-08-01T00:00:01Z", UpdatedAt: "2026-08-01T00:00:01Z",
	}, agentHubSession{ID: "ses_active_archive", State: "running", CurrentTurnID: "turn-active", UpdatedAt: "2026-08-01T00:00:10Z"})

	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodPost, "/api/workspaces/workspace-test/archive", strings.NewReader(`{"resourceId":"project1.task1"}`))
	manager.server.archiveResource(recorder, request, workspace.ID)
	if recorder.Code != http.StatusOK || !strings.Contains(recorder.Body.String(), "archive") {
		t.Fatalf("active Turn archive = %d %s", recorder.Code, recorder.Body.String())
	}
	forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		t.Fatal(err)
	}
	value, err := forgeWorkspace.ResourceValue("project1.task1")
	if err != nil || !value.Archived {
		t.Fatalf("active resource was not archived before runtime convergence: %#v, %v", value, err)
	}
}

func TestAgentHubPollerStopsProjectSessionWhenProjectArchived(t *testing.T) {
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
	waitForRuntimeTest(t, func() bool {
		fake.mu.Lock()
		defer fake.mu.Unlock()
		state := fake.sessions["ses_project"].State
		return state == "stopped" || state == "archived"
	})
	fake.mu.Lock()
	defer fake.mu.Unlock()
	state := fake.sessions["ses_project"].State
	if (state != "stopped" && state != "archived") || strings.Count(strings.Join(fake.actions, ","), "stop") != 1 {
		t.Fatalf("archived project session was not reclaimed: session=%#v actions=%#v", fake.sessions["ses_project"], fake.actions)
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

func TestAgentHubPollerRetriesAmbiguousArchivedTaskStop(t *testing.T) {
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
		return !rt.agentHubStopRequested && rt.run.ArchivedTaskStopRequested &&
			rt.run.Status == "recovering" && rt.run.ForgeSessionID != ""
	})
	if err := manager.pollAgentHubSessions(context.Background()); err != nil {
		t.Fatal(err)
	}
	waitForRuntimeTest(t, func() bool {
		fake.mu.Lock()
		defer fake.mu.Unlock()
		return fake.stopCalls == 2 && (fake.sessions["ses_stop_failure"].State == "stopped" || fake.sessions["ses_stop_failure"].State == "archived")
	})
	fake.mu.Lock()
	stopCalls := fake.stopCalls
	session := fake.sessions["ses_stop_failure"]
	fake.mu.Unlock()
	if stopCalls != 2 || (session.State != "stopped" && session.State != "archived") {
		t.Fatalf("ambiguous stop did not converge through retry: session=%#v stopCalls=%d", session, stopCalls)
	}
	run := pollerRunState(manager.runtimeByID("run-stop-failure"))
	if run.Status != "stopped" || !run.AgentHubStoppedObserved {
		t.Fatalf("retried stop did not persist terminal observation: %#v", run)
	}

	// Replacing the manager simulates a Forge restart. The converged archived
	// generation remains idempotent and needs no additional Stop request.
	restarted := newAgentManager(manager.server)
	if err := restarted.pollAgentHubSessions(context.Background()); err != nil {
		t.Fatal(err)
	}
	fake.mu.Lock()
	defer fake.mu.Unlock()
	if fake.stopCalls != 2 {
		t.Fatalf("converged stop repeated after manager restart: stopCalls=%d", fake.stopCalls)
	}
	restartedRun := pollerRunState(restarted.runtimeByID("run-stop-failure"))
	if restartedRun.Status != "stopped" || !restartedRun.AgentHubStoppedObserved {
		t.Fatalf("restart lost terminal reconciliation: %#v", restartedRun)
	}
}

func TestAgentHubPollerRunningToStoppedFinishesTurnAndReleasesForgeSession(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	seedPollerRun(t, fake, workspace, agentRun{
		ID: "run-sched", WorkspaceID: workspace.ID, ResourceID: "project1.task1",
		AgentHubSessionID: "ses_sched", SourceExternalID: workspace.ID + "/run-sched",
		ForgeSessionID: "session-test", Status: "running",
		CreatedAt: "2026-08-01T00:00:01Z", UpdatedAt: "2026-08-01T00:00:01Z",
	}, agentHubSession{ID: "ses_sched", State: "stopped", UpdatedAt: "2026-08-01T00:00:10Z"})

	if err := manager.pollAgentHubSessions(context.Background()); err != nil {
		t.Fatal(err)
	}
	rt := manager.runtimeByID("run-sched")
	waitForRuntimeTest(t, func() bool {
		run := pollerRunState(rt)
		return run.ForgeSessionID == "" && run.Status == "stopped"
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
		ForgeSessionID: "session-test", Status: "waiting_approval",
		CreatedAt: "2026-08-01T00:00:01Z", UpdatedAt: "2026-08-01T00:00:01Z",
	}, agentHubSession{ID: "ses_sched", State: "running", UpdatedAt: "2026-08-01T00:00:10Z"})

	if err := manager.pollAgentHubSessions(context.Background()); err != nil {
		t.Fatal(err)
	}
	run := pollerRunState(manager.runtimeByID("run-sched"))
	if run.Status != "running" {
		t.Fatalf("waiting_approval to running projection mismatch: %#v", run)
	}
}

func TestAgentHubPollerMissingSessionMarksLiveRunRecovering(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	now := "2026-08-01T00:00:01Z"
	for _, run := range []agentRun{
		{ID: "run-live", WorkspaceID: workspace.ID, ResourceID: "project1", AgentHubSessionID: "ses_gone_live", Status: "running", CreatedAt: now, UpdatedAt: now},
		{ID: "run-stopped", WorkspaceID: workspace.ID, ResourceID: "project1.task1", AgentHubSessionID: "ses_gone_stopped", Status: "stopped", AgentHubStoppedObserved: true, CreatedAt: now, UpdatedAt: now},
		{ID: "run-recovering", WorkspaceID: workspace.ID, ResourceID: app.SchedulerResourceID, AgentHubSessionID: "ses_gone_recovering", Status: "recovering", CreatedAt: now, UpdatedAt: now},
	} {
		if err := saveAgentRun(workspace.Path, run); err != nil {
			t.Fatal(err)
		}
	}

	if err := manager.pollAgentHubSessions(context.Background()); err != nil {
		t.Fatal(err)
	}
	// Generation IDs are required for lifecycle ownership. These legacy-shaped
	// records have no generation ID and therefore remain cold, isolated history
	// rather than being reconciled or recreated by the poller.
	current, err := loadAgentRunsCurrent(workspace.Path)
	if err != nil {
		t.Fatal(err)
	}
	if len(current) != 0 {
		t.Fatalf("records without generation IDs must stay out of current lifecycle state: %#v", current)
	}
	all, err := loadAgentRuns(workspace.Path)
	if err != nil || len(all) != 3 {
		t.Fatalf("legacy records were not retained as history: runs=%#v err=%v", all, err)
	}
	for _, runID := range []string{"run-live", "run-stopped", "run-recovering"} {
		if manager.runtimeByID(runID) != nil {
			t.Fatalf("cold legacy run %s unexpectedly entered lifecycle reconciliation", runID)
		}
	}
}

func TestAgentHubPollerReadyClearsStoppedObserved(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	seedPollerRun(t, fake, workspace, agentRun{
		ID: "run-resumed", WorkspaceID: workspace.ID, ResourceID: "workspace", AgentHubSessionID: "ses_resumed",
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
		IdleSinceAt:         "2026-08-01T00:00:10Z",
		IdleDeadlineAt:      "2026-08-01T00:30:10Z",
		CreatedAt:           "2026-08-01T00:00:01Z", UpdatedAt: "2026-08-01T00:00:10Z",
		LastOutputAt: "2026-08-01T00:00:10Z",
	}, agentHubSession{ID: "ses_idle", State: "ready", UpdatedAt: "2026-08-01T00:00:10Z"})
	forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		t.Fatal(err)
	}
	runtimeConfig, err := forgeWorkspace.RuntimeConfig()
	if err != nil {
		t.Fatal(err)
	}
	key, err := generation.ResourceKey(runtimeConfig.InstanceID, "workspace")
	if err != nil {
		t.Fatal(err)
	}
	indexPath := filepath.Join(workspace.Path, ".pua", "runtime", "resources", key, "current.json")
	before := mustReadFile(t, indexPath)

	if err := manager.pollAgentHubSessions(context.Background()); err != nil {
		t.Fatal(err)
	}
	if err := manager.pollAgentHubSessions(context.Background()); err != nil {
		t.Fatal(err)
	}
	after := mustReadFile(t, indexPath)
	if string(before) != string(after) {
		t.Fatalf("unchanged projection must not rewrite resource generation files:\nbefore:\n%s\nafter:\n%s", before, after)
	}
}
