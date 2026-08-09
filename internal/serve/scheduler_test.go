package serve

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/disksing/forge/internal/app"
)

func newSchedulerTestServer(t *testing.T, workspacePath string, tasks []runnableTaskCandidate, handler http.HandlerFunc) *server {
	t.Helper()
	forgeWorkspace, err := app.Initialize(workspacePath, "en")
	if err != nil {
		t.Fatal(err)
	}
	project, err := forgeWorkspace.CreateProject("Scheduler project", "scheduler")
	if err != nil {
		t.Fatal(err)
	}
	if len(tasks) == 0 {
		tasks = []runnableTaskCandidate{{ID: project.ID + ".task1", Title: "Task", Revision: 1, Condition: "ready", AgentName: "fake-agent"}}
	}
	for index, candidate := range tasks {
		created, createErr := forgeWorkspace.CreateTask(app.CreateTaskInput{
			ProjectID: project.ID, Title: candidate.Title, Slug: "task-" + string(rune('a'+index)), SelfDriving: true, AgentName: candidate.AgentName,
			PreferredAgentProfiles: candidate.PreferredAgentProfiles, Prompt: candidate.Prompt,
		})
		if createErr != nil {
			t.Fatal(createErr)
		}
		if candidate.Condition != "" && candidate.Condition != "ready" {
			_, _ = forgeWorkspace.SetSelfDrivingCondition(app.SelfDrivingConditionInput{TaskID: created.ID, ExpectedRevision: 1, Condition: candidate.Condition})
		}
	}
	workspace := guiWorkspace{ID: "workspace-one", Name: "Test", Path: workspacePath}
	configPath := filepath.Join(t.TempDir(), "gui.json")
	configData, _ := json.Marshal(agentHubGUIConfig{
		Version: agentHubConfigVersion, Workspaces: []guiWorkspace{workspace},
		AgentHubEndpoint: "http://127.0.0.1:1", AgentHubInstanceID: "scheduler-test",
		AgentProfiles: []agentHubProfileRoute{{Key: "default", AgentName: "fake-agent"}},
	})
	if err := os.WriteFile(configPath, configData, 0o600); err != nil {
		t.Fatal(err)
	}
	s := &server{config: configPath}
	s.agents = newAgentManager(s)
	if handler != nil {
		httpServer := httptest.NewServer(handler)
		t.Cleanup(httpServer.Close)
		s.addr = httpServer.URL
	}
	return s
}

func registerSchedulerRun(t *testing.T, s *server, workspacePath string, run agentRun, active bool) {
	t.Helper()
	if run.CreatedAt == "" {
		run.CreatedAt = time.Now().Format(time.RFC3339Nano)
	}
	if run.UpdatedAt == "" {
		run.UpdatedAt = run.CreatedAt
	}
	if err := saveAgentRun(workspacePath, run); err != nil {
		t.Fatal(err)
	}
	if active {
		s.agents.registerRuntime(&agentRuntime{manager: s.agents, workspace: guiWorkspace{ID: run.WorkspaceID, Path: workspacePath}, run: run})
	}
}

func TestSelfDrivingWaitingDue(t *testing.T) {
	if !selfDrivingWaitingDue(nil) {
		t.Fatal("waiting without a wake timestamp must be reconsidered")
	}
	recent := &app.SelfDrivingWakeContext{WaitingAt: time.Now().Add(-time.Minute).Format(time.RFC3339)}
	if selfDrivingWaitingDue(recent) {
		t.Fatal("recent external wait caused a busy loop")
	}
	old := &app.SelfDrivingWakeContext{WaitingAt: time.Now().Add(-31 * time.Minute).Format(time.RFC3339)}
	if !selfDrivingWaitingDue(old) {
		t.Fatal("fallback wait did not become eligible")
	}
}

func TestResolveSelfDrivingAgentConfiguration(t *testing.T) {
	cfg := config{Version: agentHubConfigVersion, AgentProfiles: []agentProfileRoute{{Key: "review", AgentName: "review-agent"}, {Key: "default", AgentName: "default-agent"}}}
	selection, err := resolveSelfDrivingAgent(cfg, runnableTaskCandidate{AgentName: "sticky-agent", PreferredAgentProfiles: []string{"review"}})
	if err != nil || selection.AgentName != "sticky-agent" {
		t.Fatalf("explicit Agent selection = %#v, %v", selection, err)
	}
	selection, err = resolveSelfDrivingAgent(cfg, runnableTaskCandidate{PreferredAgentProfiles: []string{"missing", "review"}})
	if err != nil || selection.AgentName != "review-agent" || selection.Profile != "review" {
		t.Fatalf("Profile selection = %#v, %v", selection, err)
	}
	if _, err := resolveSelfDrivingAgent(config{Version: agentHubConfigVersion}, runnableTaskCandidate{}); err == nil {
		t.Fatal("missing configuration was accepted")
	}
}

func TestSchedulerRejectsStaleRevisionBeforeDispatch(t *testing.T) {
	workspacePath := t.TempDir()
	requests := 0
	s := newSchedulerTestServer(t, workspacePath, nil, func(w http.ResponseWriter, r *http.Request) {
		requests++
		w.WriteHeader(http.StatusOK)
	})
	result, err := s.startRunnableTask(context.Background(), guiWorkspace{ID: "workspace-one", Path: workspacePath}, runnableTaskCandidate{
		ID: "project1.task1", Revision: 99, Condition: "ready", AgentName: "fake-agent",
	})
	if err != nil || result != runnableTaskNotRunnable || requests != 0 {
		t.Fatalf("stale dispatch = result %q requests %d err %v", result, requests, err)
	}
}

func TestConcurrentSchedulerScansCreateOneSessionAndTurn(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	gui := httptest.NewServer(http.HandlerFunc(manager.server.handleWorkspace))
	defer gui.Close()
	manager.server.addr = gui.URL
	candidate := runnableTaskCandidateFromTask(reloadTestTask(t, workspace.Path, "project1.task1"))

	type result struct {
		status runnableTaskDispatchResult
		err    error
	}
	results := make(chan result, 2)
	var wg sync.WaitGroup
	for i := 0; i < 2; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			status, err := manager.server.startRunnableTask(context.Background(), workspace, candidate)
			results <- result{status: status, err: err}
		}()
	}
	wg.Wait()
	close(results)
	started, skipped := 0, 0
	for got := range results {
		if got.err != nil {
			t.Errorf("concurrent Scheduler dispatch failed: status=%q err=%v", got.status, got.err)
		}
		switch got.status {
		case runnableTaskStarted:
			started++
		case runnableTaskSkippedActive:
			skipped++
		default:
			t.Errorf("concurrent Scheduler status = %q", got.status)
		}
	}
	if started != 1 || skipped != 1 {
		t.Fatalf("concurrent Scheduler results = started %d skipped %d", started, skipped)
	}
	fake.mu.Lock()
	created := fake.nextSession
	fake.mu.Unlock()
	if created != 1 {
		t.Fatalf("concurrent Scheduler created %d AgentHub Sessions", created)
	}
	runs, err := loadAgentRuns(workspace.Path)
	if err != nil {
		t.Fatal(err)
	}
	autonomous := 0
	for _, run := range runs {
		if isLiveAgentStatus(run.Status) && run.SchedulerTurn && run.SelfDrivingRevision == candidate.Revision {
			autonomous++
		}
	}
	if autonomous != 1 {
		t.Fatalf("concurrent Scheduler autonomous Turns = %d, runs=%#v", autonomous, runs)
	}
	current := reloadTestTask(t, workspace.Path, candidate.ID)
	if current.SelfDriving == nil || !current.SelfDriving.Enabled || current.SelfDriving.Condition != "reconciling" {
		t.Fatalf("losing Scheduler scan overwrote controller state: %#v", current.SelfDriving)
	}
}

func TestSchedulerMissingConfigurationStopsWithoutLoop(t *testing.T) {
	workspacePath := t.TempDir()
	s := newSchedulerTestServer(t, workspacePath, []runnableTaskCandidate{{Title: "Task", Revision: 1, Condition: "ready"}}, func(w http.ResponseWriter, r *http.Request) {
		t.Fatal("missing configuration reached dispatch")
	})
	cfg, err := s.loadConfig()
	if err != nil {
		t.Fatal(err)
	}
	cfg.AgentProfiles = nil
	if err := s.saveConfig(cfg); err != nil {
		t.Fatal(err)
	}
	result, err := s.startRunnableTask(context.Background(), guiWorkspace{ID: "workspace-one", Path: workspacePath}, runnableTaskCandidate{
		ID: "project1.task1", Revision: 1, Condition: "ready",
	})
	if err != nil || result != runnableTaskNotRunnable {
		t.Fatalf("missing configuration = result %q err %v", result, err)
	}
	got := reloadTestTask(t, workspacePath, "project1.task1")
	if !got.SelfDriving.Enabled || got.SelfDriving.Condition != "needs_configuration" {
		t.Fatalf("missing configuration state = %#v", got.SelfDriving)
	}
	listed, err := app.OpenWorkspace(workspacePath)
	if err != nil {
		t.Fatal(err)
	}
	runnable, err := listed.Tasks(app.TaskListOptions{ProjectID: "project1", Runnable: true})
	if err != nil || len(runnable.Runnable) != 0 {
		t.Fatalf("needs-configuration task remained in scan: %#v %v", runnable.Runnable, err)
	}
}

func TestReusableSessionMatrixNeverFansOut(t *testing.T) {
	for _, test := range []struct {
		name, runStatus, hubState string
		busy                      bool
	}{{"idle", "idle", "ready", false}, {"manual busy", "running", "busy", true}, {"approval", "waiting_approval", "waiting_approval", true}, {"recovering", "recovering", "busy", true}, {"stopping", "stopping", "stopping", true}} {
		t.Run(test.name, func(t *testing.T) {
			fake := newRuntimeFakeAgentHub()
			hub := httptest.NewServer(fake)
			defer hub.Close()
			manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
			client, err := newAgentHubClient(hub.URL, nil)
			if err != nil {
				t.Fatal(err)
			}
			run := agentRun{ID: "run-one", WorkspaceID: workspace.ID, ResourceID: "project1.task1", AgentHubSessionID: "session-one", AgentHubAgentName: "fake-agent", Status: test.runStatus, CreatedAt: time.Now().Format(time.RFC3339Nano), UpdatedAt: time.Now().Format(time.RFC3339Nano)}
			if err := saveAgentRun(workspace.Path, run); err != nil {
				t.Fatal(err)
			}
			fake.mu.Lock()
			fake.sessions["session-one"] = agentHubSession{ID: "session-one", State: test.hubState}
			fake.mu.Unlock()
			rt := newAgentHubRuntime(manager, workspace, run, client)
			rt.agentHubState = test.hubState
			manager.registerRuntime(rt)
			got, busy, err := manager.server.findReusableSelfDrivingSession(context.Background(), workspace, "project1.task1", "fake-agent")
			if err != nil || got == nil || got.ID != run.ID || busy != test.busy {
				t.Fatalf("matrix result = run %#v busy %v err %v", got, busy, err)
			}
		})
	}
}

func TestReusableSessionIsStickyToNewestMatchingRun(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	client, err := newAgentHubClient(hub.URL, nil)
	if err != nil {
		t.Fatal(err)
	}
	for index, id := range []string{"run-old", "run-new"} {
		sessionID := "session-" + id
		run := agentRun{
			ID: id, WorkspaceID: workspace.ID, ResourceID: "project1.task1", AgentHubSessionID: sessionID,
			AgentHubAgentName: "fake-agent", Status: "idle",
			CreatedAt: time.Date(2026, 8, 1, 0, 0, index, 0, time.UTC).Format(time.RFC3339Nano),
			UpdatedAt: time.Date(2026, 8, 1, 0, 0, index, 0, time.UTC).Format(time.RFC3339Nano),
		}
		if err := saveAgentRun(workspace.Path, run); err != nil {
			t.Fatal(err)
		}
		fake.mu.Lock()
		fake.sessions[sessionID] = agentHubSession{ID: sessionID, State: "ready"}
		fake.mu.Unlock()
		rt := newAgentHubRuntime(manager, workspace, run, client)
		rt.agentHubState = "ready"
		manager.registerRuntime(rt)
	}
	got, busy, err := manager.server.findReusableSelfDrivingSession(context.Background(), workspace, "project1.task1", "fake-agent")
	if err != nil || busy || got == nil || got.ID != "run-new" {
		t.Fatalf("sticky selection = %#v busy=%v err=%v", got, busy, err)
	}
	newest := manager.runtimeByID("run-new")
	newest.mu.Lock()
	newest.run.Status = "running"
	newest.agentHubState = "busy"
	newest.mu.Unlock()
	got, busy, err = manager.server.findReusableSelfDrivingSession(context.Background(), workspace, "project1.task1", "fake-agent")
	if err != nil || !busy || got == nil || got.ID != "run-new" {
		t.Fatalf("busy sticky selection fanned out to older idle run: %#v busy=%v err=%v", got, busy, err)
	}
}

func TestSchedulerPromptCarriesRevisionAuthority(t *testing.T) {
	prompt := buildSelfDrivingPrompt("/tmp/workspace", runnableTaskCandidate{ID: "project1.task1", Revision: 42, Condition: "ready", Prompt: "Do the work"})
	for _, want := range []string{"--revision=42", "revision is the authority", "provenance"} {
		if !strings.Contains(strings.ToLower(prompt), strings.ToLower(want)) {
			t.Fatalf("prompt missing %q:\n%s", want, prompt)
		}
	}
}
