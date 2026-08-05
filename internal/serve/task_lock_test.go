package serve

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/disksing/forge/internal/app"
)

func createExternalTaskLockForTest(t *testing.T, workspacePath, taskID string) app.Session {
	t.Helper()
	forgeWorkspace, err := app.OpenWorkspace(workspacePath)
	if err != nil {
		t.Fatal(err)
	}
	session, err := forgeWorkspace.CreateSession(app.SessionLiveness{
		Type: "agenthub", SourceApp: "external-test", SourceInstanceID: "external-instance",
		SourceExternalID: "external-test/" + taskID,
	})
	if err != nil {
		t.Fatal(err)
	}
	if _, err := forgeWorkspace.LockSession(session.ID, taskID); err != nil {
		t.Fatal(err)
	}
	return session
}

func TestExternalTaskLockBlocksNewAgentRunBeforeForgeOrAgentHubSession(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	const taskID = "project1.task1"
	createExternalTaskLockForTest(t, workspace.Path, taskID)

	recorder, _ := startRuntimeTestRun(t, manager, workspace, fmt.Sprintf(`{"resourceId":%q,"agentName":"fake-agent"}`, taskID))
	if recorder.Code != http.StatusConflict || !strings.Contains(recorder.Body.String(), externalTaskLockMessage) {
		t.Fatalf("expected external task lock conflict, got %d %s", recorder.Code, recorder.Body.String())
	}
	runs, err := loadAgentRuns(workspace.Path)
	if err != nil {
		t.Fatal(err)
	}
	if len(runs) != 0 {
		t.Fatalf("blocked new session wrote AgentHub run metadata: %#v", runs)
	}
	forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		t.Fatal(err)
	}
	sessions, err := forgeWorkspace.Sessions()
	if err != nil {
		t.Fatal(err)
	}
	if len(sessions) != 1 {
		t.Fatalf("blocked new session changed Forge sessions: %#v", sessions)
	}
	fake.mu.Lock()
	defer fake.mu.Unlock()
	if len(fake.sessions) != 0 {
		t.Fatalf("blocked new session contacted AgentHub: %d sessions", len(fake.sessions))
	}
}

func TestExternalTaskLockBlocksChatAutoRunWithoutAdvancingGeneration(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	server, workspace, task := newChatAutoRunTestServer(t, hub.URL)
	externalSession := createExternalTaskLockForTest(t, workspace.Path, task.ID)

	recorder := chatAutoRunStart(t, server, workspace.ID, fmt.Sprintf(`{"resourceId":%q,"agentName":"fake-agent"}`, task.ID))
	if recorder.Code != http.StatusConflict || !strings.Contains(recorder.Body.String(), externalTaskLockMessage) {
		t.Fatalf("expected Chat AutoRun lock conflict, got %d %s", recorder.Code, recorder.Body.String())
	}
	reloaded := reloadTestTask(t, workspace.Path, task.ID)
	if reloaded.AutoRun != nil {
		t.Fatalf("blocked Chat AutoRun advanced the task generation: %#v", reloaded.AutoRun)
	}
	fake.mu.Lock()
	if len(fake.sessions) != 0 {
		fake.mu.Unlock()
		t.Fatalf("blocked Chat AutoRun contacted AgentHub: %d sessions", len(fake.sessions))
	}
	fake.mu.Unlock()
	forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := forgeWorkspace.EndSession(externalSession.ID); err != nil {
		t.Fatal(err)
	}
	restarted := chatAutoRunStart(t, server, workspace.ID, fmt.Sprintf(`{"resourceId":%q,"agentName":"fake-agent"}`, task.ID))
	if restarted.Code != http.StatusOK {
		t.Fatalf("AutoRun did not recover after external lock release: %d %s", restarted.Code, restarted.Body.String())
	}
}

func TestExternalTaskLockStopsSchedulerDispatchWithoutStateChange(t *testing.T) {
	workspace := t.TempDir()
	requests := 0
	server := newSchedulerTestServer(t, workspace, nil, func(w http.ResponseWriter, r *http.Request) {
		requests++
		w.WriteHeader(http.StatusOK)
	})
	createExternalTaskLockForTest(t, workspace, "project1.task1")

	result, err := server.startRunnableTask(context.Background(), guiWorkspace{ID: "workspace-one", Path: workspace}, runnableTaskCandidate{
		ID: "project1.task1", Generation: 1, State: "queued",
	})
	if err != nil || result != runnableTaskNotRunnable {
		t.Fatalf("external task lock should stop scheduler dispatch, got result=%q err=%v", result, err)
	}
	if requests != 0 {
		t.Fatalf("scheduler dispatched %d requests while an external lock was held", requests)
	}
	forgeWorkspace, err := app.OpenWorkspace(workspace)
	if err != nil {
		t.Fatal(err)
	}
	resource, err := forgeWorkspace.ResourceValue("project1.task1")
	if err != nil || resource.Task == nil || resource.Task.AutoRun == nil {
		t.Fatalf("reload locked scheduler task: %v", err)
	}
	if resource.Task.AutoRun.State != "queued" || resource.Task.AutoRun.Generation != 1 {
		t.Fatalf("external lock changed scheduler AutoRun state: %#v", resource.Task.AutoRun)
	}
}

func TestExternalTaskLockBlocksAgentInputAndResume(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	const taskID = "project1.task1"
	createExternalTaskLockForTest(t, workspace.Path, taskID)
	client, err := newAgentHubClient(hub.URL, nil)
	if err != nil {
		t.Fatal(err)
	}
	run := agentRun{
		ID: "guarded-run", WorkspaceID: workspace.ID, ResourceID: taskID,
		AgentHubSessionID: "agenthub-session", ForgeSessionID: "forge-session", Status: "idle",
		SourceExternalID: workspace.ID + "/guarded-run",
	}
	manager.registerRuntime(newAgentHubRuntime(manager, workspace, run, client))

	inputRecorder := httptest.NewRecorder()
	inputRequest := httptest.NewRequest(http.MethodPost, "/input", strings.NewReader(`{"text":"should not be sent"}`))
	manager.sendInput(inputRecorder, inputRequest, workspace.ID, run.ID)
	if inputRecorder.Code != http.StatusConflict || !strings.Contains(inputRecorder.Body.String(), externalTaskLockMessage) {
		t.Fatalf("expected input lock conflict, got %d %s", inputRecorder.Code, inputRecorder.Body.String())
	}

	resumeRecorder := httptest.NewRecorder()
	resumeRequest := httptest.NewRequest(http.MethodPost, "/resume", nil)
	manager.resumeRun(resumeRecorder, resumeRequest, workspace.ID, run.ID)
	if resumeRecorder.Code != http.StatusConflict || !strings.Contains(resumeRecorder.Body.String(), externalTaskLockMessage) {
		t.Fatalf("expected resume lock conflict, got %d %s", resumeRecorder.Code, resumeRecorder.Body.String())
	}
	fake.mu.Lock()
	defer fake.mu.Unlock()
	if len(fake.sessions) != 0 {
		t.Fatalf("blocked input/resume contacted AgentHub: %d sessions", len(fake.sessions))
	}
}

func TestExternalTaskLockBlocksAgentInterrupt(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	const taskID = "project1.task1"
	createExternalTaskLockForTest(t, workspace.Path, taskID)
	client, err := newAgentHubClient(hub.URL, nil)
	if err != nil {
		t.Fatal(err)
	}
	run := agentRun{
		ID: "guarded-run", WorkspaceID: workspace.ID, ResourceID: taskID,
		AgentHubSessionID: "agenthub-session", ForgeSessionID: "forge-session", Status: "running",
		SourceExternalID: workspace.ID + "/guarded-run",
	}
	fake.mu.Lock()
	fake.sessions[run.AgentHubSessionID] = agentHubSession{
		ID: run.AgentHubSessionID, State: "busy", Source: &agentHubSource{
			App: agentHubSourceApp, InstanceID: "forge-runtime-test", ExternalID: run.SourceExternalID,
		},
	}
	fake.mu.Unlock()
	manager.registerRuntime(newAgentHubRuntime(manager, workspace, run, client))

	response := httptest.NewRecorder()
	manager.handle(response, httptest.NewRequest(http.MethodPost, "/interrupt", strings.NewReader(`{}`)), workspace.ID, []string{"runs", run.ID, "interrupt"})
	if response.Code != http.StatusConflict || !strings.Contains(response.Body.String(), externalTaskLockMessage) {
		t.Fatalf("expected interrupt lock conflict, got %d %s", response.Code, response.Body.String())
	}
	fake.mu.Lock()
	actions := strings.Join(fake.actions, ",")
	fake.mu.Unlock()
	if strings.Contains(actions, "interrupt") {
		t.Fatalf("blocked interrupt reached AgentHub: %q", actions)
	}
}

func TestExternalTaskLockComposerProtection(t *testing.T) {
	data, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	source := string(data)
	for _, want := range []string{
		`const EXTERNAL_TASK_LOCK_MESSAGE = "This task is locked by an external session. New sessions and AutoRun are unavailable until the lock is released.";`,
		`function selectedTaskHasExternalLock()`,
		`session.source === "external"`,
		`function externalTaskLockNotice()`,
		`function agentComposerActions(options = {})`,
		`if (externalTaskLocked)`,
		`id="agentStopButton"`,
		`if (selectedTaskHasExternalLock()) return "";`,
		`const lockKey = selectedTaskHasExternalLock() ? "external-lock" : "unlocked";`,
	} {
		if !strings.Contains(source, want) {
			t.Fatalf("external task lock composer protection is missing %q", want)
		}
	}
	styles, err := staticFiles.ReadFile("static/styles.css")
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(string(styles), ".tty-external-lock-notice") {
		t.Fatal("external task lock notice styling is missing")
	}
}

func TestExternalTaskLockErrorJSONIsStable(t *testing.T) {
	data, err := json.Marshal(map[string]string{"error": (&externalTaskLockError{ResourceID: "project1.task1"}).Error()})
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(string(data), externalTaskLockMessage) {
		t.Fatalf("unexpected lock error JSON: %s", data)
	}
}
