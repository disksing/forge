package serve

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"testing"

	"github.com/disksing/forge/internal/app"
)

// newChatSelfDrivingTestServer builds a server whose internal endpoint is a real
// mux backed by the same handlers, so the unified Chat start endpoint runs the
// full session-creation and scheduler-turn paths against a fake AgentHub.
func newChatSelfDrivingTestServer(t *testing.T, hubURL string) (*server, guiWorkspace, app.Task) {
	t.Helper()
	workspacePath := t.TempDir()
	forgeWorkspace, err := app.Initialize(workspacePath, "en")
	if err != nil {
		t.Fatal(err)
	}
	project, err := forgeWorkspace.CreateProject("Chat Self-Driving test project", "chat-self-driving")
	if err != nil {
		t.Fatal(err)
	}
	task, err := forgeWorkspace.CreateTask(app.CreateTaskInput{
		ProjectID: project.ID, Title: "Chat Self-Driving task", Slug: "chat-self-driving",
	})
	if err != nil {
		t.Fatal(err)
	}
	workspace := guiWorkspace{ID: "workspace-one", Name: "Test", Path: workspacePath}
	configPath := filepath.Join(t.TempDir(), "gui.json")
	configData, _ := json.Marshal(agentHubGUIConfig{
		Version: agentHubConfigVersion, Workspaces: []guiWorkspace{workspace},
		AgentHubEndpoint: hubURL, AgentHubInstanceID: "forge-chat-test",
		AgentProfiles: []agentHubProfileRoute{{Key: "default", AgentName: "fake-agent"}},
	})
	if err := os.WriteFile(configPath, configData, 0o600); err != nil {
		t.Fatal(err)
	}
	s := &server{config: configPath}
	s.agents = newAgentManager(s)
	mux := http.NewServeMux()
	mux.HandleFunc("/api/workspaces/", s.handleWorkspace)
	httpServer := httptest.NewServer(mux)
	t.Cleanup(httpServer.Close)
	s.addr = httpServer.URL
	return s, workspace, task
}

func chatSelfDrivingStart(t *testing.T, s *server, workspaceID, body string) *httptest.ResponseRecorder {
	t.Helper()
	req := httptest.NewRequest(http.MethodPost, "/api/workspaces/"+workspaceID+"/self-driving/start", strings.NewReader(body))
	rec := httptest.NewRecorder()
	s.handleWorkspace(rec, req)
	return rec
}

func chatSelfDrivingCancel(t *testing.T, s *server, workspaceID, body string) *httptest.ResponseRecorder {
	t.Helper()
	req := httptest.NewRequest(http.MethodPost, "/api/workspaces/"+workspaceID+"/self-driving/cancel", strings.NewReader(body))
	rec := httptest.NewRecorder()
	s.handleWorkspace(rec, req)
	return rec
}

func TestLegacySelfDrivingHTTPRouteIsUnavailable(t *testing.T) {
	s, workspace, _ := newChatSelfDrivingTestServer(t, "")
	req := httptest.NewRequest(http.MethodPost, "/api/workspaces/"+workspace.ID+"/autorun/start", strings.NewReader(`{"resourceId":"project1.task1"}`))
	rec := httptest.NewRecorder()
	s.handleWorkspace(rec, req)
	if rec.Code != http.StatusNotFound {
		t.Fatalf("retired HTTP route must be unavailable, got %d: %s", rec.Code, rec.Body.String())
	}
}

func decodeChatSelfDrivingResponse(t *testing.T, rec *httptest.ResponseRecorder) chatSelfDrivingStartResponse {
	t.Helper()
	var response chatSelfDrivingStartResponse
	if err := json.Unmarshal(rec.Body.Bytes(), &response); err != nil {
		t.Fatalf("decode response: %v (%s)", err, rec.Body.String())
	}
	return response
}

func reloadTestTask(t *testing.T, workspacePath, taskID string) app.Task {
	t.Helper()
	forgeWorkspace, err := app.OpenWorkspace(workspacePath)
	if err != nil {
		t.Fatal(err)
	}
	resource, err := forgeWorkspace.ResourceValue(taskID)
	if err != nil || resource.Task == nil {
		t.Fatalf("reload %s: %v", taskID, err)
	}
	return *resource.Task
}

func fakeEventText(event agentHubEvent) string {
	var data map[string]any
	if err := json.Unmarshal(event.Data, &data); err != nil {
		return ""
	}
	text, _ := data["text"].(string)
	return text
}

func fakeEventRole(event agentHubEvent) string {
	var data map[string]any
	if err := json.Unmarshal(event.Data, &data); err != nil {
		return ""
	}
	role, _ := data["role"].(string)
	return role
}

func fakeEventSenderName(event agentHubEvent) string {
	var data map[string]any
	if err := json.Unmarshal(event.Data, &data); err != nil {
		return ""
	}
	sender, _ := data["sender"].(map[string]any)
	name, _ := sender["name"].(string)
	return name
}

func fakeSessionHasMessage(events []agentHubEvent, marker string) bool {
	for _, event := range events {
		if event.Type == "message.input" && strings.Contains(fakeEventText(event), marker) {
			return true
		}
	}
	return false
}

func TestChatSelfDrivingStartCreatesSessionWithSelectedAgent(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	s, workspace, task := newChatSelfDrivingTestServer(t, hub.URL)

	rec := chatSelfDrivingStart(t, s, workspace.ID, fmt.Sprintf(`{"resourceId":%q,"agentName":"fake-agent","runInstructions":"Inspect the selected files","completionCriteria":"The focused Self-Driving test passes."}`, task.ID))
	if rec.Code != http.StatusOK {
		t.Fatalf("start failed: %d %s", rec.Code, rec.Body.String())
	}
	response := decodeChatSelfDrivingResponse(t, rec)
	if response.Action != "started" || response.Reused || response.Run == nil {
		t.Fatalf("unexpected response: %+v", response)
	}
	if response.AgentName != "fake-agent" || response.Run.AgentHubAgentName != "fake-agent" {
		t.Fatalf("response did not surface the actual agent: %+v", response)
	}
	if response.Run.AgentSelectionReason == "" {
		t.Fatalf("new session did not record the explicit selection reason: %+v", response.Run)
	}
	if !response.Run.SchedulerTurn || response.Run.SelfDrivingGeneration != 1 {
		t.Fatalf("new session is not marked as the Self-Driving scheduler turn: %+v", response.Run)
	}
	if response.Task.SelfDriving == nil || response.Task.SelfDriving.State != "running" || response.Task.SelfDriving.Generation != 1 {
		t.Fatalf("task did not reach running generation 1: %+v", response.Task.SelfDriving)
	}
	if response.Task.SelfDriving.AgentName != "fake-agent" || response.Task.SelfDriving.Prompt != "Inspect the selected files" || response.Task.SelfDriving.CompletionCriteria != "The focused Self-Driving test passes." {
		t.Fatalf("start parameters were not persisted: %+v", response.Task.SelfDriving)
	}

	fake.mu.Lock()
	defer fake.mu.Unlock()
	if len(fake.sessions) != 1 {
		t.Fatalf("expected exactly one AgentHub session, got %d", len(fake.sessions))
	}
	for _, events := range fake.events {
		if !fakeSessionHasMessage(events, "This is a Self-Driving scheduler turn") {
			t.Fatalf("new session did not receive the standard Self-Driving start message")
		}
		if !fakeSessionHasMessage(events, "The focused Self-Driving test passes.") {
			t.Fatalf("new session did not receive the completion criteria")
		}
		for _, event := range events {
			if event.Type != "message.input" {
				continue
			}
			if role := fakeEventRole(event); role != "system" {
				t.Fatalf("Self-Driving start message persisted with role %q, want system", role)
			}
			if name := fakeEventSenderName(event); name != agentHubSchedulerSenderName {
				t.Fatalf("Self-Driving start message sender = %q, want %q", name, agentHubSchedulerSenderName)
			}
		}
	}
}

func TestChatSelfDrivingStartRequiresExplicitAgentWithoutReusableSession(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	s, workspace, task := newChatSelfDrivingTestServer(t, hub.URL)

	rec := chatSelfDrivingStart(t, s, workspace.ID, fmt.Sprintf(`{"resourceId":%q}`, task.ID))
	if rec.Code != http.StatusBadRequest || !strings.Contains(rec.Body.String(), "select an agent") {
		t.Fatalf("missing Agent should be rejected by the manual endpoint, got %d %s", rec.Code, rec.Body.String())
	}
	if reloaded := reloadTestTask(t, workspace.Path, task.ID); reloaded.SelfDriving != nil {
		t.Fatalf("missing Agent changed the task projection: %+v", reloaded.SelfDriving)
	}
	fake.mu.Lock()
	defer fake.mu.Unlock()
	if fake.nextSession != 0 || len(fake.sessions) != 0 {
		t.Fatalf("missing Agent created an AgentHub session: next=%d sessions=%#v", fake.nextSession, fake.sessions)
	}
}

func TestChatSelfDrivingStartDoesNotReuseAnotherTasksIdleSession(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	s, workspace, currentTask := newChatSelfDrivingTestServer(t, hub.URL)
	forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		t.Fatal(err)
	}
	otherTask, err := forgeWorkspace.CreateTask(app.CreateTaskInput{
		ProjectID: "project1", Title: "Other task", Slug: "other-task",
	})
	if err != nil {
		t.Fatal(err)
	}
	recorder, _ := startRuntimeTestRun(t, s.agents, workspace, fmt.Sprintf(`{"resourceId":%q,"agentName":"fake-agent","title":"Other task chat"}`, otherTask.ID))
	if recorder.Code != http.StatusOK {
		t.Fatalf("other task session start failed: %d %s", recorder.Code, recorder.Body.String())
	}

	rec := chatSelfDrivingStart(t, s, workspace.ID, fmt.Sprintf(`{"resourceId":%q}`, currentTask.ID))
	if rec.Code != http.StatusBadRequest || !strings.Contains(rec.Body.String(), "select an agent") {
		t.Fatalf("another Task's idle session should not satisfy current Task resume: %d %s", rec.Code, rec.Body.String())
	}
	fake.mu.Lock()
	defer fake.mu.Unlock()
	if fake.nextSession != 1 || len(fake.sessions) != 1 {
		t.Fatalf("cross-Task start created or reused the wrong session set: next=%d sessions=%#v", fake.nextSession, fake.sessions)
	}
}

func TestChatSelfDrivingStartResumesWithoutSessionUsingExplicitAgentAndSameGeneration(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	fake.extraAgents = []string{"other-agent"}
	hub := httptest.NewServer(fake)
	defer hub.Close()
	s, workspace, task := newChatSelfDrivingTestServer(t, hub.URL)
	forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := forgeWorkspace.QueueSelfDriving(app.SelfDrivingQueueInput{
		TaskID: task.ID, AgentName: "fake-agent", AgentNameSet: true,
		Prompt: "Original resume instructions", PromptSet: true,
		CompletionCriteria: "Original resume criteria", CompletionCriteriaSet: true,
	}); err != nil {
		t.Fatal(err)
	}
	if _, err := forgeWorkspace.StartSelfDriving(task.ID); err != nil {
		t.Fatal(err)
	}
	if _, err := forgeWorkspace.SuspendSelfDriving(app.SelfDrivingActionInput{
		TaskID: task.ID, Summary: "waiting for review", WakeCondition: "reviewer approves",
		ExpectedGeneration: 1, ExpectedState: "running",
	}); err != nil {
		t.Fatal(err)
	}

	rec := chatSelfDrivingStart(t, s, workspace.ID, fmt.Sprintf(`{"resourceId":%q,"agentName":"other-agent","expectedGeneration":1,"expectedState":"suspended","runInstructions":"must stay unchanged","completionCriteria":"must stay unchanged"}`, task.ID))
	if rec.Code != http.StatusOK {
		t.Fatalf("explicit no-session resume failed: %d %s", rec.Code, rec.Body.String())
	}
	response := decodeChatSelfDrivingResponse(t, rec)
	if response.Action != "started" || response.Reused || response.AgentName != "other-agent" || response.Run == nil || response.Run.AgentHubAgentName != "other-agent" {
		t.Fatalf("unexpected explicit resume response: %+v", response)
	}
	if response.Task.SelfDriving == nil || response.Task.SelfDriving.Generation != 1 || response.Task.SelfDriving.State != "running" ||
		response.Task.SelfDriving.AgentName != "other-agent" || response.Task.SelfDriving.Prompt != "Original resume instructions" ||
		response.Task.SelfDriving.CompletionCriteria != "Original resume criteria" || response.Task.SelfDriving.SuspensionSummary != "waiting for review" ||
		response.Task.SelfDriving.WakeCondition != "reviewer approves" {
		t.Fatalf("explicit resume changed generation parameters: %+v", response.Task.SelfDriving)
	}
	fake.mu.Lock()
	defer fake.mu.Unlock()
	if fake.nextSession != 1 || len(fake.sessions) != 1 {
		t.Fatalf("explicit resume created the wrong number of AgentHub sessions: next=%d sessions=%#v", fake.nextSession, fake.sessions)
	}
}

func TestChatSelfDrivingStartRejectsStaleResumeWithoutSideEffects(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	s, workspace, task := newChatSelfDrivingTestServer(t, hub.URL)
	forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := forgeWorkspace.QueueSelfDriving(app.SelfDrivingQueueInput{TaskID: task.ID, AgentName: "fake-agent", AgentNameSet: true}); err != nil {
		t.Fatal(err)
	}
	if _, err := forgeWorkspace.StartSelfDriving(task.ID); err != nil {
		t.Fatal(err)
	}
	if _, err := forgeWorkspace.SuspendSelfDriving(app.SelfDrivingActionInput{TaskID: task.ID, ExpectedGeneration: 1, ExpectedState: "running", Summary: "waiting"}); err != nil {
		t.Fatal(err)
	}
	if _, err := forgeWorkspace.CancelSelfDriving(app.SelfDrivingActionInput{TaskID: task.ID, ExpectedGeneration: 1, ExpectedState: "suspended", Reason: "superseded"}); err != nil {
		t.Fatal(err)
	}

	rec := chatSelfDrivingStart(t, s, workspace.ID, fmt.Sprintf(`{"resourceId":%q,"agentName":"fake-agent","expectedGeneration":1,"expectedState":"suspended"}`, task.ID))
	if rec.Code != http.StatusConflict {
		t.Fatalf("stale resume should conflict, got %d %s", rec.Code, rec.Body.String())
	}
	if reloaded := reloadTestTask(t, workspace.Path, task.ID); reloaded.SelfDriving == nil || reloaded.SelfDriving.State != "cancelled" || reloaded.SelfDriving.Generation != 1 {
		t.Fatalf("stale resume changed the terminal generation: %+v", reloaded.SelfDriving)
	}
	fake.mu.Lock()
	defer fake.mu.Unlock()
	if fake.nextSession != 0 || len(fake.sessions) != 0 {
		t.Fatalf("stale resume created an AgentHub session: next=%d sessions=%#v", fake.nextSession, fake.sessions)
	}
}

func TestChatSelfDrivingCancelDurablyStopsTurnAndRetainsSession(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	s, workspace, task := newChatSelfDrivingTestServer(t, hub.URL)

	start := chatSelfDrivingStart(t, s, workspace.ID, fmt.Sprintf(`{"resourceId":%q,"agentName":"fake-agent","runInstructions":"Cancel me safely"}`, task.ID))
	if start.Code != http.StatusOK {
		t.Fatalf("start failed: %d %s", start.Code, start.Body.String())
	}
	started := decodeChatSelfDrivingResponse(t, start)
	if started.Run == nil || !started.Run.SchedulerTurn {
		t.Fatalf("start did not create a scheduler run: %+v", started)
	}
	stale := chatSelfDrivingCancel(t, s, workspace.ID, fmt.Sprintf(`{"resourceId":%q,"runId":%q,"expectedGeneration":99,"expectedState":"running"}`, task.ID, started.Run.ID))
	if stale.Code != http.StatusConflict {
		t.Fatalf("stale cancellation should fail CAS, got %d %s", stale.Code, stale.Body.String())
	}
	if taskState := reloadTestTask(t, workspace.Path, task.ID); taskState.SelfDriving == nil || taskState.SelfDriving.State != "running" {
		t.Fatalf("stale cancellation changed Self-Driving state: %+v", taskState.SelfDriving)
	}

	cancel := chatSelfDrivingCancel(t, s, workspace.ID, fmt.Sprintf(`{"resourceId":%q,"runId":%q,"expectedGeneration":1,"expectedState":"running","reason":"cancel from UI"}`, task.ID, started.Run.ID))
	if cancel.Code != http.StatusOK {
		t.Fatalf("cancel failed: %d %s", cancel.Code, cancel.Body.String())
	}
	var response selfDrivingCancelResponse
	if err := json.Unmarshal(cancel.Body.Bytes(), &response); err != nil {
		t.Fatalf("decode cancel response: %v (%s)", err, cancel.Body.String())
	}
	if response.Task.SelfDriving == nil || response.Task.SelfDriving.State != "cancelled" || !response.Interrupted || !response.SessionRetained {
		t.Fatalf("unexpected cancellation response: %+v", response)
	}
	waitForRuntimeTest(t, func() bool {
		run := s.agents.runtimeByID(started.Run.ID)
		if run == nil {
			return false
		}
		projected := pollerRunState(run)
		return !projected.SchedulerTurn && projected.Status == "idle"
	})
	// The finish worker marks the in-memory projection idle before its final
	// agent-run index save. Wait for the worker itself so TempDir cleanup cannot
	// race that durable write under -race.
	waitForRuntimeTest(t, func() bool {
		run := s.agents.runtimeByID(started.Run.ID)
		if run == nil {
			return false
		}
		run.mu.Lock()
		defer run.mu.Unlock()
		return !run.schedulerTurnFinishing
	})
	if sessions := testForgeSessions(t, workspace.Path); len(sessions) != 1 {
		t.Fatalf("explicit cancellation released the Agent Session: %#v", sessions)
	}
	reloaded := reloadTestTask(t, workspace.Path, task.ID)
	if reloaded.SelfDriving == nil || reloaded.SelfDriving.State != "cancelled" {
		t.Fatalf("cancelled state was not durable: %+v", reloaded.SelfDriving)
	}
	logs, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		t.Fatal(err)
	}
	entries, err := logs.Logs(task.ID)
	if err != nil {
		t.Fatal(err)
	}
	if !hasSelfDrivingLog(entries, "Self-Driving cancelled", "cancel from UI") {
		t.Fatalf("cancel reason was not logged: %#v", entries)
	}
	fake.mu.Lock()
	actions := append([]string(nil), fake.actions...)
	events := append([]agentHubEvent(nil), fake.events[started.Run.AgentHubSessionID]...)
	fake.mu.Unlock()
	if strings.Count(strings.Join(actions, ","), "interrupt") != 1 {
		t.Fatalf("cancellation did not issue exactly one interrupt: %v", actions)
	}
	userMessages := 0
	for _, event := range events {
		if event.Type == "message.input" {
			userMessages++
		}
	}
	if userMessages != 1 {
		t.Fatalf("cancelled scheduler turn was continued: %d user messages", userMessages)
	}
}

func TestChatSelfDrivingStartRequiresAgentWithoutSession(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	s, workspace, task := newChatSelfDrivingTestServer(t, hub.URL)

	rec := chatSelfDrivingStart(t, s, workspace.ID, fmt.Sprintf(`{"resourceId":%q}`, task.ID))
	if rec.Code != http.StatusBadRequest || !strings.Contains(rec.Body.String(), "select an agent") {
		t.Fatalf("expected agent selection error, got %d %s", rec.Code, rec.Body.String())
	}
	reloaded := reloadTestTask(t, workspace.Path, task.ID)
	if reloaded.SelfDriving != nil {
		t.Fatalf("a rejected start must not queue a generation: %+v", reloaded.SelfDriving)
	}
	fake.mu.Lock()
	defer fake.mu.Unlock()
	if len(fake.sessions) != 0 {
		t.Fatalf("a rejected start must not create AgentHub sessions")
	}
}

func TestChatSelfDrivingStartUnavailableAgentHasNoSideEffects(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	fake.rejectAgentName = "fake-agent"
	hub := httptest.NewServer(fake)
	defer hub.Close()
	s, workspace, task := newChatSelfDrivingTestServer(t, hub.URL)

	rec := chatSelfDrivingStart(t, s, workspace.ID, fmt.Sprintf(`{"resourceId":%q,"agentName":"fake-agent","runInstructions":"Do not queue","completionCriteria":"Do not start"}`, task.ID))
	if rec.Code != http.StatusBadGateway || !strings.Contains(rec.Body.String(), "unavailable") {
		t.Fatalf("expected unavailable AgentHub agent, got %d %s", rec.Code, rec.Body.String())
	}
	reloaded := reloadTestTask(t, workspace.Path, task.ID)
	if reloaded.SelfDriving != nil {
		t.Fatalf("unavailable agent must not create a Self-Driving generation: %+v", reloaded.SelfDriving)
	}
	fake.mu.Lock()
	defer fake.mu.Unlock()
	if len(fake.sessions) != 0 {
		t.Fatalf("unavailable agent must not create an AgentHub session: %d", len(fake.sessions))
	}
}

func TestChatSelfDrivingStartReusesIdleSession(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	s, workspace, task := newChatSelfDrivingTestServer(t, hub.URL)

	// Open a normal (non Self-Driving) chat session on the task first.
	manager := s.agents
	recorder, detail := startRuntimeTestRun(t, manager, workspace,
		fmt.Sprintf(`{"resourceId":%q,"agentName":"fake-agent","title":"Chat"}`, task.ID))
	if recorder.Code != http.StatusOK {
		t.Fatalf("session start failed: %s", recorder.Body.String())
	}
	rt := manager.runtimeByID(detail.Run.ID)
	rt.mu.Lock()
	if rt.run.Status != "idle" {
		t.Fatalf("expected the fresh session to be idle, got %s", rt.run.Status)
	}
	rt.mu.Unlock()

	// Reuse must not require an explicit agent: the session's agent is kept.
	rec := chatSelfDrivingStart(t, s, workspace.ID, fmt.Sprintf(`{"resourceId":%q}`, task.ID))
	if rec.Code != http.StatusOK {
		t.Fatalf("reuse start failed: %d %s", rec.Code, rec.Body.String())
	}
	response := decodeChatSelfDrivingResponse(t, rec)
	if response.Action != "started" || !response.Reused || response.Run == nil || response.Run.ID != detail.Run.ID {
		t.Fatalf("expected idle session reuse, got %+v", response)
	}
	if response.AgentName != "fake-agent" {
		t.Fatalf("reuse must surface the session's agent, got %q", response.AgentName)
	}
	reloaded := reloadTestTask(t, workspace.Path, task.ID)
	if reloaded.SelfDriving == nil || reloaded.SelfDriving.State != "running" || reloaded.SelfDriving.Generation != 1 {
		t.Fatalf("reused session did not start generation 1: %+v", reloaded.SelfDriving)
	}
	rt.mu.Lock()
	reused := rt.run
	rt.mu.Unlock()
	if !reused.SchedulerTurn || reused.SelfDrivingGeneration != 1 {
		t.Fatalf("reused session was not marked as the scheduler turn: %+v", reused)
	}

	fake.mu.Lock()
	defer fake.mu.Unlock()
	if len(fake.sessions) != 1 {
		t.Fatalf("reuse must not create a second AgentHub session, got %d", len(fake.sessions))
	}
	if !fakeSessionHasMessage(fake.events[detail.Run.AgentHubSessionID], "This is a Self-Driving scheduler turn") {
		t.Fatalf("reused session did not receive the standard Self-Driving start message")
	}
	if len(fake.messageRoles) != 1 || fake.messageRoles[0] != "system" {
		t.Fatalf("reused-session scheduler turn message roles = %v, want exactly one system message", fake.messageRoles)
	}
}

func TestChatSelfDrivingStartBusySessionStaysQueued(t *testing.T) {
	workspacePath := t.TempDir()
	forgeWorkspace, err := app.Initialize(workspacePath, "en")
	if err != nil {
		t.Fatal(err)
	}
	project, err := forgeWorkspace.CreateProject("Busy test project", "busy")
	if err != nil {
		t.Fatal(err)
	}
	task, err := forgeWorkspace.CreateTask(app.CreateTaskInput{ProjectID: project.ID, Title: "Busy task", Slug: "busy"})
	if err != nil {
		t.Fatal(err)
	}
	workspace := guiWorkspace{ID: "workspace-one", Path: workspacePath}
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	// The internal endpoint reports the session busy at send time, simulating
	// the race where a session turns busy after the click.
	internal := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.HasSuffix(r.URL.Path, "/input") {
			w.WriteHeader(http.StatusConflict)
			_ = json.NewEncoder(w).Encode(map[string]string{"error": "session is busy"})
			return
		}
		w.WriteHeader(http.StatusNotFound)
	}))
	defer internal.Close()
	s := &server{addr: internal.URL, config: filepath.Join(t.TempDir(), "gui.json")}
	s.agents = newAgentManager(s)
	if err := s.saveConfig(config{
		Version: agentHubConfigVersion, Workspaces: []guiWorkspace{workspace},
		AgentHubEndpoint: hub.URL, AgentHubInstanceID: "forge-chat-test",
	}); err != nil {
		t.Fatal(err)
	}
	registerSchedulerRun(t, s, workspacePath, agentRun{
		ID: "run-idle", WorkspaceID: workspace.ID, ResourceID: task.ID,
		AgentHubSessionID: "ses-run-idle", SourceExternalID: workspace.ID + "/run-idle",
		AgentHubAgentName: "agent-one", Status: "idle",
	}, true)
	_, client, err := s.agents.agentHubRuntimeConfig()
	if err != nil {
		t.Fatal(err)
	}
	rt := s.agents.runtimeByID("run-idle")
	rt.mu.Lock()
	rt.agentHub = client
	rt.agentHubState = "ready"
	rt.mu.Unlock()
	fake.mu.Lock()
	fake.sessions["ses-run-idle"] = agentHubSession{
		ID: "ses-run-idle", State: "ready", AgentName: "agent-one",
		Source: &agentHubSource{App: agentHubSourceApp, InstanceID: "forge-chat-test", ExternalID: workspace.ID + "/run-idle"},
	}
	fake.mu.Unlock()

	rec := chatSelfDrivingStart(t, s, workspace.ID, fmt.Sprintf(`{"resourceId":%q}`, task.ID))
	if rec.Code != http.StatusOK {
		t.Fatalf("busy race should be reported as queued, got %d %s", rec.Code, rec.Body.String())
	}
	response := decodeChatSelfDrivingResponse(t, rec)
	if response.Action != "queued" || !response.Reused || !strings.Contains(response.Reason, "became busy") {
		t.Fatalf("unexpected busy-race response: %+v", response)
	}
	reloaded := reloadTestTask(t, workspacePath, task.ID)
	if reloaded.SelfDriving == nil || reloaded.SelfDriving.State != "queued" || reloaded.SelfDriving.Generation != 1 {
		t.Fatalf("busy race must leave the generation queued, got %+v", reloaded.SelfDriving)
	}
}

func TestChatSelfDrivingStartStateMatrix(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()

	newServerWithTask := func(t *testing.T) (*server, guiWorkspace, app.Task) {
		t.Helper()
		s, workspace, task := newChatSelfDrivingTestServer(t, hub.URL)
		return s, workspace, task
	}

	t.Run("queued and running reject a repeated start", func(t *testing.T) {
		s, workspace, task := newServerWithTask(t)
		forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
		if err != nil {
			t.Fatal(err)
		}
		if _, err := forgeWorkspace.QueueSelfDriving(app.SelfDrivingQueueInput{TaskID: task.ID}); err != nil {
			t.Fatal(err)
		}
		rec := chatSelfDrivingStart(t, s, workspace.ID, fmt.Sprintf(`{"resourceId":%q,"agentName":"fake-agent"}`, task.ID))
		if rec.Code != http.StatusConflict || !strings.Contains(rec.Body.String(), "already queued") {
			t.Fatalf("queued start should be rejected, got %d %s", rec.Code, rec.Body.String())
		}
		if _, err := forgeWorkspace.StartSelfDriving(task.ID); err != nil {
			t.Fatal(err)
		}
		rec = chatSelfDrivingStart(t, s, workspace.ID, fmt.Sprintf(`{"resourceId":%q,"agentName":"fake-agent"}`, task.ID))
		if rec.Code != http.StatusConflict || !strings.Contains(rec.Body.String(), "already running") {
			t.Fatalf("running start should be rejected, got %d %s", rec.Code, rec.Body.String())
		}
		fake.mu.Lock()
		sessions := len(fake.sessions)
		fake.mu.Unlock()
		if sessions != 0 {
			t.Fatalf("rejected starts must not create sessions, got %d", sessions)
		}
	})

	t.Run("terminal state starts the next generation", func(t *testing.T) {
		s, workspace, task := newServerWithTask(t)
		forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
		if err != nil {
			t.Fatal(err)
		}
		if _, err := forgeWorkspace.QueueSelfDriving(app.SelfDrivingQueueInput{TaskID: task.ID}); err != nil {
			t.Fatal(err)
		}
		if _, err := forgeWorkspace.StartSelfDriving(task.ID); err != nil {
			t.Fatal(err)
		}
		if _, err := forgeWorkspace.CompleteSelfDriving(app.SelfDrivingActionInput{TaskID: task.ID, Summary: "done"}); err != nil {
			t.Fatal(err)
		}
		rec := chatSelfDrivingStart(t, s, workspace.ID, fmt.Sprintf(`{"resourceId":%q,"agentName":"fake-agent","runInstructions":"Start the next generation","completionCriteria":"The next generation is verified."}`, task.ID))
		if rec.Code != http.StatusOK {
			t.Fatalf("restart after completion failed: %d %s", rec.Code, rec.Body.String())
		}
		response := decodeChatSelfDrivingResponse(t, rec)
		if response.Task.SelfDriving == nil || response.Task.SelfDriving.Generation != 2 || response.Task.SelfDriving.State != "running" {
			t.Fatalf("expected running generation 2, got %+v", response.Task.SelfDriving)
		}
		if response.Task.SelfDriving.Prompt != "Start the next generation" || response.Task.SelfDriving.CompletionCriteria != "The next generation is verified." {
			t.Fatalf("terminal generation lost submitted parameters: %+v", response.Task.SelfDriving)
		}
	})

	t.Run("cancelled state starts a clean next generation", func(t *testing.T) {
		s, workspace, task := newServerWithTask(t)
		forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
		if err != nil {
			t.Fatal(err)
		}
		if _, err := forgeWorkspace.QueueSelfDriving(app.SelfDrivingQueueInput{
			TaskID: task.ID, AgentName: "fake-agent", AgentNameSet: true,
			Prompt: "Persisted cancelled instructions", PromptSet: true,
			CompletionCriteria: "Persisted cancelled criteria", CompletionCriteriaSet: true,
		}); err != nil {
			t.Fatal(err)
		}
		if _, err := forgeWorkspace.StartSelfDriving(task.ID); err != nil {
			t.Fatal(err)
		}
		if _, err := forgeWorkspace.CancelSelfDriving(app.SelfDrivingActionInput{TaskID: task.ID, Reason: "cancelled before restart"}); err != nil {
			t.Fatal(err)
		}
		rec := chatSelfDrivingStart(t, s, workspace.ID, fmt.Sprintf(`{"resourceId":%q,"agentName":"fake-agent","runInstructions":"Fresh generation instructions","completionCriteria":"Fresh generation criteria"}`, task.ID))
		if rec.Code != http.StatusOK {
			t.Fatalf("restart after cancellation failed: %d %s", rec.Code, rec.Body.String())
		}
		response := decodeChatSelfDrivingResponse(t, rec)
		if response.Task.SelfDriving == nil || response.Task.SelfDriving.Generation != 2 || response.Task.SelfDriving.State != "running" {
			t.Fatalf("expected running generation 2 after cancellation, got %+v", response.Task.SelfDriving)
		}
		if response.Task.SelfDriving.Prompt != "Fresh generation instructions" || response.Task.SelfDriving.CompletionCriteria != "Fresh generation criteria" || response.Task.SelfDriving.SuspensionSummary != "" || response.Task.SelfDriving.WakeCondition != "" {
			t.Fatalf("cancelled restart retained old generation data: %+v", response.Task.SelfDriving)
		}
	})

	t.Run("suspended resumes the same generation with its summary", func(t *testing.T) {
		s, workspace, task := newServerWithTask(t)
		forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
		if err != nil {
			t.Fatal(err)
		}
		if _, err := forgeWorkspace.QueueSelfDriving(app.SelfDrivingQueueInput{
			TaskID: task.ID, AgentName: "fake-agent", AgentNameSet: true,
			Prompt: "Original resume instructions", PromptSet: true,
			CompletionCriteria: "Original resume criteria", CompletionCriteriaSet: true,
		}); err != nil {
			t.Fatal(err)
		}
		if _, err := forgeWorkspace.StartSelfDriving(task.ID); err != nil {
			t.Fatal(err)
		}
		if _, err := forgeWorkspace.SuspendSelfDriving(app.SelfDrivingActionInput{TaskID: task.ID, Summary: "waiting for review"}); err != nil {
			t.Fatal(err)
		}
		recorder, detail := startRuntimeTestRun(t, s.agents, workspace,
			fmt.Sprintf(`{"resourceId":%q,"agentName":"fake-agent","title":"Chat"}`, task.ID))
		if recorder.Code != http.StatusOK {
			t.Fatalf("session start failed: %s", recorder.Body.String())
		}
		rec := chatSelfDrivingStart(t, s, workspace.ID, fmt.Sprintf(`{"resourceId":%q,"runInstructions":"Ignored new instructions","completionCriteria":"Ignored new criteria"}`, task.ID))
		if rec.Code != http.StatusOK {
			t.Fatalf("resume from suspended failed: %d %s", rec.Code, rec.Body.String())
		}
		response := decodeChatSelfDrivingResponse(t, rec)
		if response.Task.SelfDriving == nil || response.Task.SelfDriving.Generation != 1 || response.Task.SelfDriving.State != "running" {
			t.Fatalf("suspended resume must keep generation 1, got %+v", response.Task.SelfDriving)
		}
		if response.Task.SelfDriving.Prompt != "Original resume instructions" || response.Task.SelfDriving.CompletionCriteria != "Original resume criteria" {
			t.Fatalf("suspended resume must preserve generation parameters: %+v", response.Task.SelfDriving)
		}
		fake.mu.Lock()
		defer fake.mu.Unlock()
		if !fakeSessionHasMessage(fake.events[detail.Run.AgentHubSessionID], "waiting for review") || !fakeSessionHasMessage(fake.events[detail.Run.AgentHubSessionID], "Original resume criteria") {
			t.Fatalf("resumed start message must carry the suspension summary")
		}
	})

	t.Run("paused resumes the same generation", func(t *testing.T) {
		s, workspace, task := newServerWithTask(t)
		forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
		if err != nil {
			t.Fatal(err)
		}
		if _, err := forgeWorkspace.QueueSelfDriving(app.SelfDrivingQueueInput{
			TaskID: task.ID, AgentName: "fake-agent", AgentNameSet: true,
			Prompt: "Persisted paused instructions", PromptSet: true,
			CompletionCriteria: "Persisted paused criteria", CompletionCriteriaSet: true,
		}); err != nil {
			t.Fatal(err)
		}
		if _, err := forgeWorkspace.StartSelfDriving(task.ID); err != nil {
			t.Fatal(err)
		}
		if _, err := forgeWorkspace.PauseSelfDriving(app.SelfDrivingActionInput{TaskID: task.ID, Reason: "manual"}); err != nil {
			t.Fatal(err)
		}
		rec := chatSelfDrivingStart(t, s, workspace.ID, fmt.Sprintf(`{"resourceId":%q,"agentName":"fake-agent"}`, task.ID))
		if rec.Code != http.StatusOK {
			t.Fatalf("resume from paused failed: %d %s", rec.Code, rec.Body.String())
		}
		response := decodeChatSelfDrivingResponse(t, rec)
		if response.Task.SelfDriving == nil || response.Task.SelfDriving.Generation != 1 || response.Task.SelfDriving.State != "running" {
			t.Fatalf("paused resume must keep generation 1, got %+v", response.Task.SelfDriving)
		}
		if response.Task.SelfDriving.AgentName != "fake-agent" || response.Task.SelfDriving.Prompt != "Persisted paused instructions" || response.Task.SelfDriving.CompletionCriteria != "Persisted paused criteria" {
			t.Fatalf("paused resume must preserve generation parameters: %+v", response.Task.SelfDriving)
		}
	})
}

func TestChatSelfDrivingStartConcurrentClicksStartOnce(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	s, workspace, task := newChatSelfDrivingTestServer(t, hub.URL)

	const clicks = 4
	codes := make([]int, clicks)
	bodies := make([]string, clicks)
	var wg sync.WaitGroup
	for index := 0; index < clicks; index++ {
		wg.Add(1)
		go func(index int) {
			defer wg.Done()
			rec := chatSelfDrivingStart(t, s, workspace.ID, fmt.Sprintf(`{"resourceId":%q,"agentName":"fake-agent"}`, task.ID))
			codes[index] = rec.Code
			bodies[index] = rec.Body.String()
		}(index)
	}
	wg.Wait()

	started := 0
	for index, code := range codes {
		if code == http.StatusOK {
			started++
			continue
		}
		if code != http.StatusConflict {
			t.Fatalf("concurrent click %d returned %d %s", index, code, bodies[index])
		}
	}
	if started != 1 {
		t.Fatalf("expected exactly one successful start out of %d clicks, got %d (%v)", clicks, started, codes)
	}
	fake.mu.Lock()
	defer fake.mu.Unlock()
	if len(fake.sessions) != 1 {
		t.Fatalf("concurrent clicks created %d AgentHub sessions, want 1", len(fake.sessions))
	}
	reloaded := reloadTestTask(t, workspace.Path, task.ID)
	if reloaded.SelfDriving == nil || reloaded.SelfDriving.Generation != 1 {
		t.Fatalf("concurrent clicks produced generation %+v, want generation 1", reloaded.SelfDriving)
	}
}

func TestChatSelfDrivingStartRejectsNonTaskResources(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	s, workspace, task := newChatSelfDrivingTestServer(t, hub.URL)
	projectID, _, _ := strings.Cut(task.ID, ".task")

	for _, body := range []string{
		`{"resourceId":"project-missing.task1","agentName":"fake-agent"}`,
		fmt.Sprintf(`{"resourceId":%q,"agentName":"fake-agent"}`, projectID),
		`{"agentName":"fake-agent"}`,
		`{"resourceId":"", "agentName":"fake-agent"}`,
	} {
		rec := chatSelfDrivingStart(t, s, workspace.ID, body)
		if rec.Code != http.StatusBadRequest {
			t.Fatalf("request %s should be rejected with 400, got %d %s", body, rec.Code, rec.Body.String())
		}
	}
	rec := chatSelfDrivingStart(t, s, workspace.ID, fmt.Sprintf(`{"resourceId":%q,"agentName":"fake-agent","after":["x"]}`, task.ID))
	if rec.Code != http.StatusBadRequest {
		t.Fatalf("unknown fields must be rejected, got %d %s", rec.Code, rec.Body.String())
	}
}

func TestChatSelfDrivingStartBusyLiveSessionHasClearReason(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	s, workspace, task := newChatSelfDrivingTestServer(t, hub.URL)

	// A session with a pending approval is live but never reusable.
	recorder, detail := startRuntimeTestRun(t, s.agents, workspace,
		fmt.Sprintf(`{"resourceId":%q,"agentName":"fake-agent","title":"Chat"}`, task.ID))
	if recorder.Code != http.StatusOK {
		t.Fatalf("session start failed: %s", recorder.Body.String())
	}
	rt := s.agents.runtimeByID(detail.Run.ID)
	rt.mu.Lock()
	rt.run.Status = "waiting_approval"
	rt.mu.Unlock()

	rec := chatSelfDrivingStart(t, s, workspace.ID, fmt.Sprintf(`{"resourceId":%q,"agentName":"fake-agent"}`, task.ID))
	if rec.Code != http.StatusConflict || !strings.Contains(rec.Body.String(), "session is busy") {
		t.Fatalf("expected a clear busy-session rejection, got %d %s", rec.Code, rec.Body.String())
	}
	reloaded := reloadTestTask(t, workspace.Path, task.ID)
	if reloaded.SelfDriving != nil {
		t.Fatalf("a busy-session rejection must not queue a generation: %+v", reloaded.SelfDriving)
	}
}

func TestChatSelfDrivingStartRejectsAgentHubBusyProjectionEvenWhenLocalRunIsIdle(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	s, workspace, task := newChatSelfDrivingTestServer(t, hub.URL)
	recorder, detail := startRuntimeTestRun(t, s.agents, workspace, fmt.Sprintf(`{"resourceId":%q,"agentName":"fake-agent","title":"Chat"}`, task.ID))
	if recorder.Code != http.StatusOK {
		t.Fatalf("session start failed: %s", recorder.Body.String())
	}
	rt := s.agents.runtimeByID(detail.Run.ID)
	rt.mu.Lock()
	rt.run.Status = "idle"
	rt.agentHubState = "ready"
	rt.mu.Unlock()
	fake.mu.Lock()
	session := fake.sessions[detail.Run.AgentHubSessionID]
	session.State = "busy"
	session.CurrentTurnID = "turn-busy"
	fake.sessions[detail.Run.AgentHubSessionID] = session
	fake.mu.Unlock()

	rec := chatSelfDrivingStart(t, s, workspace.ID, fmt.Sprintf(`{"resourceId":%q}`, task.ID))
	if rec.Code != http.StatusConflict || !strings.Contains(rec.Body.String(), "session is busy") {
		t.Fatalf("stale idle projection should be rejected as busy, got %d %s", rec.Code, rec.Body.String())
	}
	if reloaded := reloadTestTask(t, workspace.Path, task.ID); reloaded.SelfDriving != nil {
		t.Fatalf("busy AgentHub projection changed the task: %+v", reloaded.SelfDriving)
	}
	fake.mu.Lock()
	defer fake.mu.Unlock()
	if fake.nextSession != 1 || len(fake.sessions) != 1 {
		t.Fatalf("busy projection caused a second session: next=%d sessions=%#v", fake.nextSession, fake.sessions)
	}
}

func TestChatSelfDrivingTopBarUI(t *testing.T) {
	data, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	source := string(data)
	for _, want := range []string{
		`function selfDrivingTopBar(detail) {`,
		`function selfDrivingBarActions(detail) {`,
		`barWrap.innerHTML = selfDrivingTopBar(detail);`,
		`id="selfDrivingStartButton"`,
		`id="selfDrivingCancelButton"`,
		`data-self-driving-action=`,
		`"Start Self-Driving"`,
		`"Start New Self-Driving"`,
		`"Resume Self-Driving now"`,
		`"Resume Self-Driving"`,
		`"Cancel Self-Driving"`,
		`"Cancel Self-Driving and keep the Agent Session open."`,
		`const startableStates = ["", "completed", "failed", "cancelled"];`,
		`const resumableStates = ["suspended", "paused"];`,
		`const cancellableStates = ["queued", "running", "suspended", "paused"];`,
		`"The current session is busy; wait until it is idle to start Self-Driving."`,
		`"Resolve the pending approval before starting Self-Driving in this session."`,
		`run.resourceId === detail.id && isLiveAgentRun(run)`,
		`/api/workspaces/${state.activeWorkspaceId}/self-driving/start`,
		`body.runInstructions = String(options.runInstructions || "");`,
		`body.completionCriteria = String(options.completionCriteria || "");`,
		`function openSelfDrivingConfigDialog() {`,
		`name="runInstructions"`,
		`Start New Self-Driving`,
		`function submitSelfDrivingConfigDialog`,
		`expectedGeneration: dialog.expectedGeneration`,
		`expectedState: dialog.expectedState`,
		`const expectedState = options.expectedState === undefined ? stateName`,
		`const directResume = ["paused", "suspended"].includes(expectedState);`,
		`if (event.key === "Tab")`,
		`if (state.agent.selfDrivingStarting) return;`,
		`state.agent.selfDrivingStarting = true;`,
		`function selectedResourceLockComposerKey() {`,
		"${selectedResourceLockComposerKey()}",
	} {
		if !strings.Contains(source, want) {
			t.Fatalf("Chat Self-Driving top bar is missing %q", want)
		}
	}
	// The lock key must participate in every composer render-cache key.
	keys := strings.Count(source, "${selectedResourceLockComposerKey()}`")
	if keys != 3 {
		t.Fatalf("expected selectedResourceLockComposerKey in all three composer keys, got %d", keys)
	}
	styles, err := staticFiles.ReadFile("static/styles.css")
	if err != nil {
		t.Fatal(err)
	}
	for _, want := range []string{
		`.tty-standalone-actions`,
		`.self-driving-bar-button`,
		`.self-driving-bar-start-action`,
		`.self-driving-bar-resume-action`,
		`.self-driving-bar-cancel-action`,
		`.self-driving-bar-button:focus-visible`,
		`flex-wrap: wrap;`,
		`.tty-standalone-actions {`,
		`@media (max-width: 420px)`,
	} {
		if !strings.Contains(string(styles), want) {
			t.Fatalf("Chat Self-Driving top bar styling is missing %q", want)
		}
	}

	// The composer and the standalone action row must not render duplicate
	// Self-Driving controls; the top bar is the only entry.
	composerStart := strings.Index(source, `function renderTTYComposer(options = {}) {`)
	composerEnd := -1
	if composerStart >= 0 {
		composerEnd = strings.Index(source[composerStart:], `function isAgentSessionReady(run) {`)
	}
	if composerStart < 0 || composerEnd < 0 {
		t.Fatal("TTY composer renderer boundary is missing")
	}
	composer := source[composerStart : composerStart+composerEnd]
	for _, removed := range []string{`selfDrivingActionsMarkup`, `selfDrivingBarActions`, `id="selfDrivingStartButton"`, `id="selfDrivingCancelButton"`} {
		if strings.Contains(composer, removed) {
			t.Fatalf("TTY composer still renders the moved Self-Driving control %q", removed)
		}
	}

	actionsStart := strings.Index(source, `function agentComposerActions(options = {}) {`)
	actionsEnd := -1
	if actionsStart >= 0 {
		actionsEnd = strings.Index(source[actionsStart:], `function sessionControlComposerActions(options = {}) {`)
	}
	if actionsStart < 0 || actionsEnd < 0 {
		t.Fatal("Session actions renderer boundary is missing")
	}
	actions := source[actionsStart : actionsStart+actionsEnd]
	for _, removed := range []string{`selfDrivingBarActions`, `includeSelfDriving`, `id="selfDrivingStartButton"`, `id="selfDrivingCancelButton"`} {
		if strings.Contains(actions, removed) {
			t.Fatalf("standalone Session actions still render the moved Self-Driving control %q", removed)
		}
	}
}

func TestChatSelfDrivingStartDialogShowsOnlyAgentAndPrompt(t *testing.T) {
	data, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	source := string(data)

	// The start/new-generation dialog is intentionally minimal: the Agent
	// selector and the optional Run instructions prompt are the only visible
	// business fields. Task info, descriptions, completion criteria, and the
	// protocol explanations were removed from the dialog body.
	dialogStart := strings.Index(source, `function renderSelfDrivingConfigDialog() {`)
	dialogEnd := -1
	if dialogStart >= 0 {
		dialogEnd = strings.Index(source[dialogStart:], `function bindSelfDrivingConfigDialogEvents() {`)
	}
	if dialogStart < 0 || dialogEnd < 0 {
		t.Fatal("Self-Driving config dialog renderer boundary is missing")
	}
	dialog := source[dialogStart : dialogStart+dialogEnd]
	for _, want := range []string{
		`role="dialog" aria-modal="true" aria-labelledby="selfDrivingDialogTitle"`,
		`name="agentName"`,
		`name="runInstructions"`,
		`<span>Agent</span>`,
		`<span>Run instructions <small>(optional)</small></span>`,
		`data-self-driving-dialog-close="true"`,
		`>Cancel</button>`,
		`${dialog.submitting ? "Starting…" : submitLabel}`,
		`role="alert"`,
	} {
		if !strings.Contains(dialog, want) {
			t.Fatalf("minimal Self-Driving start dialog is missing %q", want)
		}
	}
	for _, removed := range []string{
		`name="completionCriteria"`,
		`Completion criteria`,
		`selfDrivingDialogDescription`,
		`aria-describedby`,
		`self-driving-dialog-description`,
		`self-driving-dialog-protocol`,
		`agentSource`,
		`dialog.title`,
		`${escapeHTML(dialog.resourceId)} · ${escapeHTML(dialog.title)}`,
		`Using the current idle AgentHub session.`,
		`The agent must finish with exactly one final side-effecting protocol action`,
	} {
		if strings.Contains(dialog, removed) {
			t.Fatalf("Self-Driving start dialog still renders removed content %q", removed)
		}
	}

	// Completion criteria stay part of the start request and keep their
	// inherit-from-previous-generation default; only the textarea is gone.
	for _, want := range []string{
		`body.completionCriteria = String(options.completionCriteria || "");`,
		`completionCriteria: String(selfDriving?.completionCriteria || ""),`,
		`runInstructions: String(selfDriving?.prompt || ""),`,
	} {
		if !strings.Contains(source, want) {
			t.Fatalf("Self-Driving start request lost its parameter default %q", want)
		}
	}

	styles, err := staticFiles.ReadFile("static/styles.css")
	if err != nil {
		t.Fatal(err)
	}
	for _, removed := range []string{`.self-driving-dialog-description`, `.self-driving-dialog-protocol`, `.self-driving-dialog-header span`} {
		if strings.Contains(string(styles), removed) {
			t.Fatalf("removed Self-Driving dialog styles are still present: %q", removed)
		}
	}
}
