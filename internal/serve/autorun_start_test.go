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

// newChatAutoRunTestServer builds a server whose internal endpoint is a real
// mux backed by the same handlers, so the unified Chat start endpoint runs the
// full session-creation and scheduler-turn paths against a fake AgentHub.
func newChatAutoRunTestServer(t *testing.T, hubURL string) (*server, guiWorkspace, app.Task) {
	t.Helper()
	workspacePath := t.TempDir()
	forgeWorkspace, err := app.Initialize(workspacePath, "en")
	if err != nil {
		t.Fatal(err)
	}
	project, err := forgeWorkspace.CreateProject("Chat AutoRun test project", "chat-autorun")
	if err != nil {
		t.Fatal(err)
	}
	task, err := forgeWorkspace.CreateTask(app.CreateTaskInput{
		ProjectID: project.ID, Title: "Chat AutoRun task", Slug: "chat-autorun",
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

func chatAutoRunStart(t *testing.T, s *server, workspaceID, body string) *httptest.ResponseRecorder {
	t.Helper()
	req := httptest.NewRequest(http.MethodPost, "/api/workspaces/"+workspaceID+"/autorun/start", strings.NewReader(body))
	rec := httptest.NewRecorder()
	s.handleWorkspace(rec, req)
	return rec
}

func chatAutoRunCancel(t *testing.T, s *server, workspaceID, body string) *httptest.ResponseRecorder {
	t.Helper()
	req := httptest.NewRequest(http.MethodPost, "/api/workspaces/"+workspaceID+"/autorun/cancel", strings.NewReader(body))
	rec := httptest.NewRecorder()
	s.handleWorkspace(rec, req)
	return rec
}

func decodeChatAutoRunResponse(t *testing.T, rec *httptest.ResponseRecorder) chatAutoRunStartResponse {
	t.Helper()
	var response chatAutoRunStartResponse
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

func fakeSessionHasMessage(events []agentHubEvent, marker string) bool {
	for _, event := range events {
		if event.Type == "message.user" && strings.Contains(fakeEventText(event), marker) {
			return true
		}
	}
	return false
}

func TestChatAutoRunStartCreatesSessionWithSelectedAgent(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	s, workspace, task := newChatAutoRunTestServer(t, hub.URL)

	rec := chatAutoRunStart(t, s, workspace.ID, fmt.Sprintf(`{"resourceId":%q,"agentName":"fake-agent","runInstructions":"Inspect the selected files","completionCriteria":"The focused AutoRun test passes."}`, task.ID))
	if rec.Code != http.StatusOK {
		t.Fatalf("start failed: %d %s", rec.Code, rec.Body.String())
	}
	response := decodeChatAutoRunResponse(t, rec)
	if response.Action != "started" || response.Reused || response.Run == nil {
		t.Fatalf("unexpected response: %+v", response)
	}
	if response.AgentName != "fake-agent" || response.Run.AgentHubAgentName != "fake-agent" {
		t.Fatalf("response did not surface the actual agent: %+v", response)
	}
	if response.Run.AgentSelectionReason == "" {
		t.Fatalf("new session did not record the explicit selection reason: %+v", response.Run)
	}
	if !response.Run.SchedulerTurn || response.Run.AutoRunGeneration != 1 {
		t.Fatalf("new session is not marked as the AutoRun scheduler turn: %+v", response.Run)
	}
	if response.Task.AutoRun == nil || response.Task.AutoRun.State != "running" || response.Task.AutoRun.Generation != 1 {
		t.Fatalf("task did not reach running generation 1: %+v", response.Task.AutoRun)
	}
	if response.Task.AutoRun.AgentName != "fake-agent" || response.Task.AutoRun.Prompt != "Inspect the selected files" || response.Task.AutoRun.CompletionCriteria != "The focused AutoRun test passes." {
		t.Fatalf("start parameters were not persisted: %+v", response.Task.AutoRun)
	}

	fake.mu.Lock()
	defer fake.mu.Unlock()
	if len(fake.sessions) != 1 {
		t.Fatalf("expected exactly one AgentHub session, got %d", len(fake.sessions))
	}
	for _, events := range fake.events {
		if !fakeSessionHasMessage(events, "This is an AutoRun scheduler turn") {
			t.Fatalf("new session did not receive the standard AutoRun start message")
		}
		if !fakeSessionHasMessage(events, "The focused AutoRun test passes.") {
			t.Fatalf("new session did not receive the completion criteria")
		}
	}
}

func TestChatAutoRunCancelDurablyStopsTurnAndRetainsSession(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	s, workspace, task := newChatAutoRunTestServer(t, hub.URL)

	start := chatAutoRunStart(t, s, workspace.ID, fmt.Sprintf(`{"resourceId":%q,"agentName":"fake-agent","runInstructions":"Cancel me safely"}`, task.ID))
	if start.Code != http.StatusOK {
		t.Fatalf("start failed: %d %s", start.Code, start.Body.String())
	}
	started := decodeChatAutoRunResponse(t, start)
	if started.Run == nil || !started.Run.SchedulerTurn {
		t.Fatalf("start did not create a scheduler run: %+v", started)
	}
	stale := chatAutoRunCancel(t, s, workspace.ID, fmt.Sprintf(`{"resourceId":%q,"runId":%q,"expectedGeneration":99,"expectedState":"running"}`, task.ID, started.Run.ID))
	if stale.Code != http.StatusConflict {
		t.Fatalf("stale cancellation should fail CAS, got %d %s", stale.Code, stale.Body.String())
	}
	if taskState := reloadTestTask(t, workspace.Path, task.ID); taskState.AutoRun == nil || taskState.AutoRun.State != "running" {
		t.Fatalf("stale cancellation changed AutoRun state: %+v", taskState.AutoRun)
	}

	cancel := chatAutoRunCancel(t, s, workspace.ID, fmt.Sprintf(`{"resourceId":%q,"runId":%q,"expectedGeneration":1,"expectedState":"running","reason":"cancel from UI"}`, task.ID, started.Run.ID))
	if cancel.Code != http.StatusOK {
		t.Fatalf("cancel failed: %d %s", cancel.Code, cancel.Body.String())
	}
	var response autoRunCancelResponse
	if err := json.Unmarshal(cancel.Body.Bytes(), &response); err != nil {
		t.Fatalf("decode cancel response: %v (%s)", err, cancel.Body.String())
	}
	if response.Task.AutoRun == nil || response.Task.AutoRun.State != "cancelled" || !response.Interrupted || !response.SessionRetained {
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
	if sessions := testForgeSessions(t, workspace.Path); len(sessions) != 1 {
		t.Fatalf("explicit cancellation released the Agent Session: %#v", sessions)
	}
	reloaded := reloadTestTask(t, workspace.Path, task.ID)
	if reloaded.AutoRun == nil || reloaded.AutoRun.State != "cancelled" {
		t.Fatalf("cancelled state was not durable: %+v", reloaded.AutoRun)
	}
	logs, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		t.Fatal(err)
	}
	entries, err := logs.Logs(task.ID)
	if err != nil {
		t.Fatal(err)
	}
	if !hasAutoRunLog(entries, "Auto Run cancelled", "cancel from UI") {
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
		if event.Type == "message.user" {
			userMessages++
		}
	}
	if userMessages != 1 {
		t.Fatalf("cancelled scheduler turn was continued: %d user messages", userMessages)
	}
}

func TestChatAutoRunStartRequiresAgentWithoutSession(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	s, workspace, task := newChatAutoRunTestServer(t, hub.URL)

	rec := chatAutoRunStart(t, s, workspace.ID, fmt.Sprintf(`{"resourceId":%q}`, task.ID))
	if rec.Code != http.StatusBadRequest || !strings.Contains(rec.Body.String(), "select an agent") {
		t.Fatalf("expected agent selection error, got %d %s", rec.Code, rec.Body.String())
	}
	reloaded := reloadTestTask(t, workspace.Path, task.ID)
	if reloaded.AutoRun != nil {
		t.Fatalf("a rejected start must not queue a generation: %+v", reloaded.AutoRun)
	}
	fake.mu.Lock()
	defer fake.mu.Unlock()
	if len(fake.sessions) != 0 {
		t.Fatalf("a rejected start must not create AgentHub sessions")
	}
}

func TestChatAutoRunStartUnavailableAgentHasNoSideEffects(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	fake.rejectAgentName = "fake-agent"
	hub := httptest.NewServer(fake)
	defer hub.Close()
	s, workspace, task := newChatAutoRunTestServer(t, hub.URL)

	rec := chatAutoRunStart(t, s, workspace.ID, fmt.Sprintf(`{"resourceId":%q,"agentName":"fake-agent","runInstructions":"Do not queue","completionCriteria":"Do not start"}`, task.ID))
	if rec.Code != http.StatusBadGateway || !strings.Contains(rec.Body.String(), "unavailable") {
		t.Fatalf("expected unavailable AgentHub agent, got %d %s", rec.Code, rec.Body.String())
	}
	reloaded := reloadTestTask(t, workspace.Path, task.ID)
	if reloaded.AutoRun != nil {
		t.Fatalf("unavailable agent must not create an AutoRun generation: %+v", reloaded.AutoRun)
	}
	fake.mu.Lock()
	defer fake.mu.Unlock()
	if len(fake.sessions) != 0 {
		t.Fatalf("unavailable agent must not create an AgentHub session: %d", len(fake.sessions))
	}
}

func TestChatAutoRunStartReusesIdleSession(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	s, workspace, task := newChatAutoRunTestServer(t, hub.URL)

	// Open a normal (non AutoRun) chat session on the task first.
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
	rec := chatAutoRunStart(t, s, workspace.ID, fmt.Sprintf(`{"resourceId":%q}`, task.ID))
	if rec.Code != http.StatusOK {
		t.Fatalf("reuse start failed: %d %s", rec.Code, rec.Body.String())
	}
	response := decodeChatAutoRunResponse(t, rec)
	if response.Action != "started" || !response.Reused || response.Run == nil || response.Run.ID != detail.Run.ID {
		t.Fatalf("expected idle session reuse, got %+v", response)
	}
	if response.AgentName != "fake-agent" {
		t.Fatalf("reuse must surface the session's agent, got %q", response.AgentName)
	}
	reloaded := reloadTestTask(t, workspace.Path, task.ID)
	if reloaded.AutoRun == nil || reloaded.AutoRun.State != "running" || reloaded.AutoRun.Generation != 1 {
		t.Fatalf("reused session did not start generation 1: %+v", reloaded.AutoRun)
	}
	rt.mu.Lock()
	reused := rt.run
	rt.mu.Unlock()
	if !reused.SchedulerTurn || reused.AutoRunGeneration != 1 {
		t.Fatalf("reused session was not marked as the scheduler turn: %+v", reused)
	}

	fake.mu.Lock()
	defer fake.mu.Unlock()
	if len(fake.sessions) != 1 {
		t.Fatalf("reuse must not create a second AgentHub session, got %d", len(fake.sessions))
	}
	if !fakeSessionHasMessage(fake.events[detail.Run.AgentHubSessionID], "This is an AutoRun scheduler turn") {
		t.Fatalf("reused session did not receive the standard AutoRun start message")
	}
}

func TestChatAutoRunStartBusySessionStaysQueued(t *testing.T) {
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
	if err := s.saveConfig(config{Version: agentHubConfigVersion, Workspaces: []guiWorkspace{workspace}}); err != nil {
		t.Fatal(err)
	}
	registerSchedulerRun(t, s, workspacePath, agentRun{
		ID: "run-idle", WorkspaceID: workspace.ID, ResourceID: task.ID,
		AgentHubAgentName: "agent-one", Status: "idle",
	}, true)

	rec := chatAutoRunStart(t, s, workspace.ID, fmt.Sprintf(`{"resourceId":%q}`, task.ID))
	if rec.Code != http.StatusOK {
		t.Fatalf("busy race should be reported as queued, got %d %s", rec.Code, rec.Body.String())
	}
	response := decodeChatAutoRunResponse(t, rec)
	if response.Action != "queued" || !response.Reused || !strings.Contains(response.Reason, "became busy") {
		t.Fatalf("unexpected busy-race response: %+v", response)
	}
	reloaded := reloadTestTask(t, workspacePath, task.ID)
	if reloaded.AutoRun == nil || reloaded.AutoRun.State != "queued" || reloaded.AutoRun.Generation != 1 {
		t.Fatalf("busy race must leave the generation queued, got %+v", reloaded.AutoRun)
	}
}

func TestChatAutoRunStartStateMatrix(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()

	newServerWithTask := func(t *testing.T) (*server, guiWorkspace, app.Task) {
		t.Helper()
		s, workspace, task := newChatAutoRunTestServer(t, hub.URL)
		return s, workspace, task
	}

	t.Run("queued and running reject a repeated start", func(t *testing.T) {
		s, workspace, task := newServerWithTask(t)
		forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
		if err != nil {
			t.Fatal(err)
		}
		if _, err := forgeWorkspace.QueueAutoRun(app.AutoRunQueueInput{TaskID: task.ID}); err != nil {
			t.Fatal(err)
		}
		rec := chatAutoRunStart(t, s, workspace.ID, fmt.Sprintf(`{"resourceId":%q,"agentName":"fake-agent"}`, task.ID))
		if rec.Code != http.StatusConflict || !strings.Contains(rec.Body.String(), "already queued") {
			t.Fatalf("queued start should be rejected, got %d %s", rec.Code, rec.Body.String())
		}
		if _, err := forgeWorkspace.StartAutoRun(task.ID); err != nil {
			t.Fatal(err)
		}
		rec = chatAutoRunStart(t, s, workspace.ID, fmt.Sprintf(`{"resourceId":%q,"agentName":"fake-agent"}`, task.ID))
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
		if _, err := forgeWorkspace.QueueAutoRun(app.AutoRunQueueInput{TaskID: task.ID}); err != nil {
			t.Fatal(err)
		}
		if _, err := forgeWorkspace.StartAutoRun(task.ID); err != nil {
			t.Fatal(err)
		}
		if _, err := forgeWorkspace.CompleteAutoRun(app.AutoRunActionInput{TaskID: task.ID, Summary: "done"}); err != nil {
			t.Fatal(err)
		}
		rec := chatAutoRunStart(t, s, workspace.ID, fmt.Sprintf(`{"resourceId":%q,"agentName":"fake-agent","runInstructions":"Start the next generation","completionCriteria":"The next generation is verified."}`, task.ID))
		if rec.Code != http.StatusOK {
			t.Fatalf("restart after completion failed: %d %s", rec.Code, rec.Body.String())
		}
		response := decodeChatAutoRunResponse(t, rec)
		if response.Task.AutoRun == nil || response.Task.AutoRun.Generation != 2 || response.Task.AutoRun.State != "running" {
			t.Fatalf("expected running generation 2, got %+v", response.Task.AutoRun)
		}
		if response.Task.AutoRun.Prompt != "Start the next generation" || response.Task.AutoRun.CompletionCriteria != "The next generation is verified." {
			t.Fatalf("terminal generation lost submitted parameters: %+v", response.Task.AutoRun)
		}
	})

	t.Run("cancelled state starts a clean next generation", func(t *testing.T) {
		s, workspace, task := newServerWithTask(t)
		forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
		if err != nil {
			t.Fatal(err)
		}
		if _, err := forgeWorkspace.QueueAutoRun(app.AutoRunQueueInput{
			TaskID: task.ID, AgentName: "fake-agent", AgentNameSet: true,
			Prompt: "Persisted cancelled instructions", PromptSet: true,
			CompletionCriteria: "Persisted cancelled criteria", CompletionCriteriaSet: true,
		}); err != nil {
			t.Fatal(err)
		}
		if _, err := forgeWorkspace.StartAutoRun(task.ID); err != nil {
			t.Fatal(err)
		}
		if _, err := forgeWorkspace.CancelAutoRun(app.AutoRunActionInput{TaskID: task.ID, Reason: "cancelled before restart"}); err != nil {
			t.Fatal(err)
		}
		rec := chatAutoRunStart(t, s, workspace.ID, fmt.Sprintf(`{"resourceId":%q,"agentName":"fake-agent","runInstructions":"Fresh generation instructions","completionCriteria":"Fresh generation criteria"}`, task.ID))
		if rec.Code != http.StatusOK {
			t.Fatalf("restart after cancellation failed: %d %s", rec.Code, rec.Body.String())
		}
		response := decodeChatAutoRunResponse(t, rec)
		if response.Task.AutoRun == nil || response.Task.AutoRun.Generation != 2 || response.Task.AutoRun.State != "running" {
			t.Fatalf("expected running generation 2 after cancellation, got %+v", response.Task.AutoRun)
		}
		if response.Task.AutoRun.Prompt != "Fresh generation instructions" || response.Task.AutoRun.CompletionCriteria != "Fresh generation criteria" || response.Task.AutoRun.SuspensionSummary != "" || response.Task.AutoRun.WakeCondition != "" {
			t.Fatalf("cancelled restart retained old generation data: %+v", response.Task.AutoRun)
		}
	})

	t.Run("suspended resumes the same generation with its summary", func(t *testing.T) {
		s, workspace, task := newServerWithTask(t)
		forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
		if err != nil {
			t.Fatal(err)
		}
		if _, err := forgeWorkspace.QueueAutoRun(app.AutoRunQueueInput{
			TaskID: task.ID, AgentName: "fake-agent", AgentNameSet: true,
			Prompt: "Original resume instructions", PromptSet: true,
			CompletionCriteria: "Original resume criteria", CompletionCriteriaSet: true,
		}); err != nil {
			t.Fatal(err)
		}
		if _, err := forgeWorkspace.StartAutoRun(task.ID); err != nil {
			t.Fatal(err)
		}
		if _, err := forgeWorkspace.SuspendAutoRun(app.AutoRunActionInput{TaskID: task.ID, Summary: "waiting for review"}); err != nil {
			t.Fatal(err)
		}
		recorder, detail := startRuntimeTestRun(t, s.agents, workspace,
			fmt.Sprintf(`{"resourceId":%q,"agentName":"fake-agent","title":"Chat"}`, task.ID))
		if recorder.Code != http.StatusOK {
			t.Fatalf("session start failed: %s", recorder.Body.String())
		}
		rec := chatAutoRunStart(t, s, workspace.ID, fmt.Sprintf(`{"resourceId":%q,"runInstructions":"Ignored new instructions","completionCriteria":"Ignored new criteria"}`, task.ID))
		if rec.Code != http.StatusOK {
			t.Fatalf("resume from suspended failed: %d %s", rec.Code, rec.Body.String())
		}
		response := decodeChatAutoRunResponse(t, rec)
		if response.Task.AutoRun == nil || response.Task.AutoRun.Generation != 1 || response.Task.AutoRun.State != "running" {
			t.Fatalf("suspended resume must keep generation 1, got %+v", response.Task.AutoRun)
		}
		if response.Task.AutoRun.Prompt != "Original resume instructions" || response.Task.AutoRun.CompletionCriteria != "Original resume criteria" {
			t.Fatalf("suspended resume must preserve generation parameters: %+v", response.Task.AutoRun)
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
		if _, err := forgeWorkspace.QueueAutoRun(app.AutoRunQueueInput{
			TaskID: task.ID, AgentName: "fake-agent", AgentNameSet: true,
			Prompt: "Persisted paused instructions", PromptSet: true,
			CompletionCriteria: "Persisted paused criteria", CompletionCriteriaSet: true,
		}); err != nil {
			t.Fatal(err)
		}
		if _, err := forgeWorkspace.StartAutoRun(task.ID); err != nil {
			t.Fatal(err)
		}
		if _, err := forgeWorkspace.PauseAutoRun(app.AutoRunActionInput{TaskID: task.ID, Reason: "manual"}); err != nil {
			t.Fatal(err)
		}
		rec := chatAutoRunStart(t, s, workspace.ID, fmt.Sprintf(`{"resourceId":%q}`, task.ID))
		if rec.Code != http.StatusOK {
			t.Fatalf("resume from paused failed: %d %s", rec.Code, rec.Body.String())
		}
		response := decodeChatAutoRunResponse(t, rec)
		if response.Task.AutoRun == nil || response.Task.AutoRun.Generation != 1 || response.Task.AutoRun.State != "running" {
			t.Fatalf("paused resume must keep generation 1, got %+v", response.Task.AutoRun)
		}
		if response.Task.AutoRun.AgentName != "fake-agent" || response.Task.AutoRun.Prompt != "Persisted paused instructions" || response.Task.AutoRun.CompletionCriteria != "Persisted paused criteria" {
			t.Fatalf("paused resume must preserve generation parameters: %+v", response.Task.AutoRun)
		}
	})
}

func TestChatAutoRunStartConcurrentClicksStartOnce(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	s, workspace, task := newChatAutoRunTestServer(t, hub.URL)

	const clicks = 4
	codes := make([]int, clicks)
	bodies := make([]string, clicks)
	var wg sync.WaitGroup
	for index := 0; index < clicks; index++ {
		wg.Add(1)
		go func(index int) {
			defer wg.Done()
			rec := chatAutoRunStart(t, s, workspace.ID, fmt.Sprintf(`{"resourceId":%q,"agentName":"fake-agent"}`, task.ID))
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
	if reloaded.AutoRun == nil || reloaded.AutoRun.Generation != 1 {
		t.Fatalf("concurrent clicks produced generation %+v, want generation 1", reloaded.AutoRun)
	}
}

func TestChatAutoRunStartRejectsNonTaskResources(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	s, workspace, task := newChatAutoRunTestServer(t, hub.URL)
	projectID, _, _ := strings.Cut(task.ID, ".task")

	for _, body := range []string{
		`{"resourceId":"project-missing.task1","agentName":"fake-agent"}`,
		fmt.Sprintf(`{"resourceId":%q,"agentName":"fake-agent"}`, projectID),
		`{"agentName":"fake-agent"}`,
		`{"resourceId":"", "agentName":"fake-agent"}`,
	} {
		rec := chatAutoRunStart(t, s, workspace.ID, body)
		if rec.Code != http.StatusBadRequest {
			t.Fatalf("request %s should be rejected with 400, got %d %s", body, rec.Code, rec.Body.String())
		}
	}
	rec := chatAutoRunStart(t, s, workspace.ID, fmt.Sprintf(`{"resourceId":%q,"agentName":"fake-agent","after":["x"]}`, task.ID))
	if rec.Code != http.StatusBadRequest {
		t.Fatalf("unknown fields must be rejected, got %d %s", rec.Code, rec.Body.String())
	}
}

func TestChatAutoRunStartBusyLiveSessionHasClearReason(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	s, workspace, task := newChatAutoRunTestServer(t, hub.URL)

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

	rec := chatAutoRunStart(t, s, workspace.ID, fmt.Sprintf(`{"resourceId":%q,"agentName":"fake-agent"}`, task.ID))
	if rec.Code != http.StatusConflict || !strings.Contains(rec.Body.String(), "session is busy") {
		t.Fatalf("expected a clear busy-session rejection, got %d %s", rec.Code, rec.Body.String())
	}
	reloaded := reloadTestTask(t, workspace.Path, task.ID)
	if reloaded.AutoRun != nil {
		t.Fatalf("a busy-session rejection must not queue a generation: %+v", reloaded.AutoRun)
	}
}

func TestChatAutoRunComposerUI(t *testing.T) {
	data, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	source := string(data)
	for _, want := range []string{
		`function autoRunComposerAction() {`,
		`id="autoRunStartButton"`,
		`label = "Start AutoRun";`,
		`label = "Start New AutoRun";`,
		`label = "Resume Now";`,
		`label = "Resume AutoRun";`,
		`label = "AutoRun Queued";`,
		`label = "AutoRun Running";`,
		"disabledReason = `AutoRun generation ${autoRun.generation} is already queued.`;",
		`disabledReason = "Select an agent below to start AutoRun without an active session.";`,
		`"The current session is busy; wait until it is idle to start AutoRun."`,
		`"Resolve the pending approval before starting AutoRun in this session."`,
		`/api/workspaces/${state.activeWorkspaceId}/autorun/start`,
		`body.runInstructions = String(options.runInstructions || "");`,
		`body.completionCriteria = String(options.completionCriteria || "");`,
		`function openAutoRunConfigDialog() {`,
		`name="runInstructions"`,
		`name="completionCriteria"`,
		`Start New AutoRun`,
		`function submitAutoRunConfigDialog`,
		`The agent must finish with exactly one final side-effecting protocol action`,
		`if (event.key === "Tab")`,
		`if (state.agent.autoRunStarting) return;`,
		`state.agent.autoRunStarting = true;`,
		`function autoRunComposerKey() {`,
		"${autoRunComposerKey()}",
	} {
		if !strings.Contains(source, want) {
			t.Fatalf("Chat AutoRun composer is missing %q", want)
		}
	}
	// The AutoRun action must participate in every composer render-cache key.
	keys := strings.Count(source, "${autoRunComposerKey()}`")
	if keys != 3 {
		t.Fatalf("expected autoRunComposerKey in all three composer keys, got %d", keys)
	}
	styles, err := staticFiles.ReadFile("static/styles.css")
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(string(styles), ".tty-autorun-action {") {
		t.Fatal("Chat AutoRun action styling is missing")
	}
}
