package serve

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/disksing/forge/internal/app"
)

func createExternalResourceLockForTest(t *testing.T, workspacePath, resourceID string) app.Session {
	t.Helper()
	forgeWorkspace, err := app.OpenWorkspace(workspacePath)
	if err != nil {
		t.Fatal(err)
	}
	session, err := forgeWorkspace.CreateSession(app.SessionLiveness{
		Type: "agenthub", SourceApp: "external-test", SourceInstanceID: "external-instance",
		SourceExternalID: "external-test/" + resourceID,
	})
	if err != nil {
		t.Fatal(err)
	}
	if _, err := forgeWorkspace.LockSession(session.ID, resourceID); err != nil {
		t.Fatal(err)
	}
	return session
}

func TestExternalResourceLockBlocksNewAgentRunBeforeForgeOrAgentHubSession(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	const taskID = "project1.task1"
	createExternalResourceLockForTest(t, workspace.Path, taskID)

	recorder, _ := startRuntimeTestRun(t, manager, workspace, fmt.Sprintf(`{"resourceId":%q,"agentName":"fake-agent"}`, taskID))
	if recorder.Code != http.StatusConflict || !strings.Contains(recorder.Body.String(), externalResourceLockMessage) {
		t.Fatalf("expected external resource lock conflict, got %d %s", recorder.Code, recorder.Body.String())
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

func TestExternalProjectLockBlocksNewAgentRunBeforeForgeOrAgentHubSession(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	const projectID = "project1"
	createExternalResourceLockForTest(t, workspace.Path, projectID)

	recorder, _ := startRuntimeTestRun(t, manager, workspace, fmt.Sprintf(`{"resourceId":%q,"agentName":"fake-agent"}`, projectID))
	if recorder.Code != http.StatusConflict || !strings.Contains(recorder.Body.String(), externalResourceLockMessage) {
		t.Fatalf("expected external project lock conflict, got %d %s", recorder.Code, recorder.Body.String())
	}
	runs, err := loadAgentRuns(workspace.Path)
	if err != nil {
		t.Fatal(err)
	}
	if len(runs) != 0 {
		t.Fatalf("blocked project session wrote AgentHub run metadata: %#v", runs)
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
		t.Fatalf("blocked project session changed Forge sessions: %#v", sessions)
	}
	fake.mu.Lock()
	defer fake.mu.Unlock()
	if len(fake.sessions) != 0 {
		t.Fatalf("blocked project session contacted AgentHub: %d sessions", len(fake.sessions))
	}
}

func TestExternalResourceLockBlocksAgentInputAndResume(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	const taskID = "project1.task1"
	createExternalResourceLockForTest(t, workspace.Path, taskID)
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
	if inputRecorder.Code != http.StatusConflict || !strings.Contains(inputRecorder.Body.String(), externalResourceLockMessage) {
		t.Fatalf("expected input lock conflict, got %d %s", inputRecorder.Code, inputRecorder.Body.String())
	}

	resumeRecorder := httptest.NewRecorder()
	resumeRequest := httptest.NewRequest(http.MethodPost, "/resume", nil)
	manager.resumeRun(resumeRecorder, resumeRequest, workspace.ID, run.ID)
	if resumeRecorder.Code != http.StatusConflict || !strings.Contains(resumeRecorder.Body.String(), externalResourceLockMessage) {
		t.Fatalf("expected resume lock conflict, got %d %s", resumeRecorder.Code, resumeRecorder.Body.String())
	}
	fake.mu.Lock()
	defer fake.mu.Unlock()
	if len(fake.sessions) != 0 {
		t.Fatalf("blocked input/resume contacted AgentHub: %d sessions", len(fake.sessions))
	}
}

func TestExternalResourceLockBlocksAgentInterrupt(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	const taskID = "project1.task1"
	createExternalResourceLockForTest(t, workspace.Path, taskID)
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
	if response.Code != http.StatusConflict || !strings.Contains(response.Body.String(), externalResourceLockMessage) {
		t.Fatalf("expected interrupt lock conflict, got %d %s", response.Code, response.Body.String())
	}
	fake.mu.Lock()
	actions := strings.Join(fake.actions, ",")
	fake.mu.Unlock()
	if strings.Contains(actions, "interrupt") {
		t.Fatalf("blocked interrupt reached AgentHub: %q", actions)
	}
}

func TestExternalResourceLockErrorJSONIsStable(t *testing.T) {
	data, err := json.Marshal(map[string]string{"error": (&externalResourceLockError{ResourceID: "project1.task1"}).Error()})
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(string(data), externalResourceLockMessage) {
		t.Fatalf("unexpected lock error JSON: %s", data)
	}
}
