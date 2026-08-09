package serve

import (
	"context"
	"encoding/json"
	"fmt"
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

func newChatSelfDrivingTestServer(t *testing.T, hubURL string) (*server, guiWorkspace, app.Task) {
	t.Helper()
	workspacePath := t.TempDir()
	forgeWorkspace, err := app.Initialize(workspacePath, "en")
	if err != nil {
		t.Fatal(err)
	}
	project, err := forgeWorkspace.CreateProject("Self-Driving test project", "self-driving")
	if err != nil {
		t.Fatal(err)
	}
	task, err := forgeWorkspace.CreateTask(app.CreateTaskInput{ProjectID: project.ID, Title: "Self-Driving task", Slug: "self-driving"})
	if err != nil {
		t.Fatal(err)
	}
	workspace := guiWorkspace{ID: "workspace-one", Name: "Test", Path: workspacePath}
	configPath := filepath.Join(t.TempDir(), "gui.json")
	configData, _ := json.Marshal(agentHubGUIConfig{
		Version: agentHubConfigVersion, Workspaces: []guiWorkspace{workspace},
		AgentHubEndpoint: hubURL, AgentHubInstanceID: "forge-self-driving-test",
		AgentProfiles: []agentHubProfileRoute{{Key: "default", AgentName: "fake-agent"}},
	})
	if err := os.WriteFile(configPath, configData, 0o600); err != nil {
		t.Fatal(err)
	}
	s := &server{config: configPath}
	s.agents = newAgentManager(s)
	return s, workspace, task
}

func chatSelfDrivingStart(t *testing.T, s *server, workspaceID, body string) *httptest.ResponseRecorder {
	t.Helper()
	var raw map[string]any
	if err := json.Unmarshal([]byte(body), &raw); err != nil {
		t.Fatal(err)
	}
	raw["enabled"] = true
	encoded, _ := json.Marshal(raw)
	req := httptest.NewRequest(http.MethodPut, "/api/workspaces/"+workspaceID+"/self-driving", strings.NewReader(string(encoded)))
	rec := httptest.NewRecorder()
	s.handleWorkspace(rec, req)
	return rec
}

func setSelfDrivingForTest(t *testing.T, s *server, workspaceID string, enabled bool, taskID string) *httptest.ResponseRecorder {
	t.Helper()
	body := fmt.Sprintf(`{"resourceId":%q,"enabled":%t,"agentName":"fake-agent"}`, taskID, enabled)
	req := httptest.NewRequest(http.MethodPut, "/api/workspaces/"+workspaceID+"/self-driving", strings.NewReader(body))
	rec := httptest.NewRecorder()
	s.handleWorkspace(rec, req)
	return rec
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

func TestSelfDrivingDesiredStateHTTPIsIdempotentAndOldRoutesAreGone(t *testing.T) {
	s, workspace, task := newChatSelfDrivingTestServer(t, "")
	first := setSelfDrivingForTest(t, s, workspace.ID, true, task.ID)
	if first.Code != http.StatusOK {
		t.Fatalf("enable returned %d: %s", first.Code, first.Body.String())
	}
	var response selfDrivingDesiredStateResponse
	if err := json.Unmarshal(first.Body.Bytes(), &response); err != nil {
		t.Fatal(err)
	}
	if response.Task.SelfDriving == nil || !response.Task.SelfDriving.Enabled || response.Task.SelfDriving.Revision != 1 {
		t.Fatalf("enable response = %#v", response.Task.SelfDriving)
	}
	second := setSelfDrivingForTest(t, s, workspace.ID, true, task.ID)
	var duplicate selfDrivingDesiredStateResponse
	_ = json.Unmarshal(second.Body.Bytes(), &duplicate)
	if second.Code != http.StatusOK || duplicate.Task.SelfDriving.Revision != 1 {
		t.Fatalf("duplicate enable = %d %#v", second.Code, duplicate.Task.SelfDriving)
	}
	for _, route := range []string{"/self-driving/start", "/self-driving/cancel", "/autorun/start"} {
		req := httptest.NewRequest(http.MethodPost, "/api/workspaces/"+workspace.ID+route, strings.NewReader(`{"resourceId":"project1.task1"}`))
		rec := httptest.NewRecorder()
		s.handleWorkspace(rec, req)
		if rec.Code != http.StatusNotFound {
			t.Fatalf("retired route %s returned %d", route, rec.Code)
		}
	}
}

func TestSelfDrivingTemporaryGUIAgentHubEndToEnd(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	s, workspace, task := newChatSelfDrivingTestServer(t, hub.URL)
	gui := httptest.NewServer(http.HandlerFunc(s.handleWorkspace))
	defer gui.Close()
	s.addr = gui.URL

	setDesired := func(enabled bool) selfDrivingDesiredStateResponse {
		body := fmt.Sprintf(`{"resourceId":%q,"enabled":%t,"agentName":"fake-agent"}`, task.ID, enabled)
		request, err := http.NewRequest(http.MethodPut, gui.URL+"/api/workspaces/"+workspace.ID+"/self-driving", strings.NewReader(body))
		if err != nil {
			t.Fatal(err)
		}
		request.Header.Set("Content-Type", "application/json")
		response, err := http.DefaultClient.Do(request)
		if err != nil {
			t.Fatal(err)
		}
		defer response.Body.Close()
		var decoded selfDrivingDesiredStateResponse
		if err := json.NewDecoder(response.Body).Decode(&decoded); err != nil {
			t.Fatal(err)
		}
		if response.StatusCode != http.StatusOK {
			t.Fatalf("set desired state returned %d: %#v", response.StatusCode, decoded)
		}
		return decoded
	}

	enabled := setDesired(true)
	if enabled.Task.SelfDriving == nil || !enabled.Task.SelfDriving.Enabled || enabled.Task.SelfDriving.Revision != 1 {
		t.Fatalf("GUI Enable response = %#v", enabled.Task.SelfDriving)
	}
	if err := s.scheduleRunnableTasks(context.Background()); err != nil {
		t.Fatal(err)
	}
	fake.mu.Lock()
	created := fake.nextSession
	events := append([]agentHubEvent(nil), fake.events["ses_1"]...)
	fake.mu.Unlock()
	var schedulerInput struct {
		Role   string                 `json:"role"`
		Sender *agentHubMessageSender `json:"sender"`
	}
	for _, event := range events {
		if event.Type == "message.input" {
			_ = json.Unmarshal(event.Data, &schedulerInput)
			break
		}
	}
	if created != 1 || schedulerInput.Role != "system" || schedulerInput.Sender == nil || schedulerInput.Sender.Name != agentHubSchedulerSenderName {
		t.Fatalf("Scheduler dispatch = sessions %d provenance %#v", created, schedulerInput)
	}
	runs, err := loadAgentRuns(workspace.Path)
	if err != nil || len(runs) != 1 || !runs[0].SchedulerTurn || runs[0].SelfDrivingRevision != 1 {
		t.Fatalf("durable autonomous run projection = %#v, err=%v", runs, err)
	}

	disabled := setDesired(false)
	if disabled.Task.SelfDriving == nil || disabled.Task.SelfDriving.Enabled || disabled.Task.SelfDriving.Revision != 2 {
		t.Fatalf("GUI Disable response = %#v", disabled.Task.SelfDriving)
	}
	if err := s.scheduleRunnableTasks(context.Background()); err != nil {
		t.Fatal(err)
	}
	fake.mu.Lock()
	created = fake.nextSession
	actions := strings.Join(fake.actions, ",")
	roles := append([]string(nil), fake.messageRoles...)
	steers := append([]bool(nil), fake.messageSteers...)
	fake.mu.Unlock()
	if created != 1 || strings.Contains(actions, "interrupt") || strings.Contains(actions, "stop") {
		t.Fatalf("Disable changed Session lifecycle: sessions=%d actions=%q", created, actions)
	}
	if len(roles) != 1 || roles[0] != "system" || len(steers) != 1 || !steers[0] {
		t.Fatalf("Disable steer provenance = roles %v steers %v", roles, steers)
	}
	forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := forgeWorkspace.CompleteSelfDriving(app.SelfDrivingActionInput{TaskID: task.ID, ExpectedRevision: 1, Summary: "late"}); err == nil {
		t.Fatal("stale autonomous callback changed the disabled task")
	}
}

func TestDisablePersistsBeforeBestEffortSystemSteer(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	recorder, _ := startRuntimeTestRun(t, manager, workspace, `{"resourceId":"project1.task1","agentName":"fake-agent"}`)
	if recorder.Code != http.StatusOK {
		t.Fatalf("start run returned %d: %s", recorder.Code, recorder.Body.String())
	}
	rec := setSelfDrivingForTest(t, manager.server, workspace.ID, false, "project1.task1")
	if rec.Code != http.StatusOK {
		t.Fatalf("disable returned %d: %s", rec.Code, rec.Body.String())
	}
	got := reloadTestTask(t, workspace.Path, "project1.task1")
	if got.SelfDriving == nil || got.SelfDriving.Enabled || got.SelfDriving.Condition != "disabled" {
		t.Fatalf("disable was not durable: %#v", got.SelfDriving)
	}
	fake.mu.Lock()
	actions := strings.Join(fake.actions, ",")
	roles := append([]string(nil), fake.messageRoles...)
	steers := append([]bool(nil), fake.messageSteers...)
	fake.mu.Unlock()
	if strings.Contains(actions, "interrupt") || strings.Contains(actions, "stop") {
		t.Fatalf("disable performed a Session action: %q", actions)
	}
	if len(roles) != 1 || roles[0] != "system" || len(steers) != 1 || !steers[0] {
		t.Fatalf("disable provenance = roles %v steers %v", roles, steers)
	}
	retry := setSelfDrivingForTest(t, manager.server, workspace.ID, false, "project1.task1")
	if retry.Code != http.StatusOK {
		t.Fatalf("idempotent disable returned %d: %s", retry.Code, retry.Body.String())
	}
	fake.mu.Lock()
	messageCount := len(fake.messageSteers)
	fake.mu.Unlock()
	if messageCount != 1 {
		t.Fatalf("idempotent Disable retried a non-idempotent steer: %d", messageCount)
	}
}

func TestDisableNotificationFailureDoesNotRollback(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	recorder, _ := startRuntimeTestRun(t, manager, workspace, `{"resourceId":"project1.task1","agentName":"fake-agent"}`)
	if recorder.Code != http.StatusOK {
		t.Fatalf("start run returned %d: %s", recorder.Code, recorder.Body.String())
	}
	fake.mu.Lock()
	fake.failNextMessage = true
	fake.mu.Unlock()
	rec := setSelfDrivingForTest(t, manager.server, workspace.ID, false, "project1.task1")
	if rec.Code != http.StatusOK {
		t.Fatalf("disable returned %d: %s", rec.Code, rec.Body.String())
	}
	got := reloadTestTask(t, workspace.Path, "project1.task1")
	if got.SelfDriving.Enabled || got.SelfDriving.NotificationError == nil {
		t.Fatalf("notification failure was not exposed without rollback: %#v", got.SelfDriving)
	}
}

func TestConcurrentIdempotentDisableSendsOneSteer(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	recorder, _ := startRuntimeTestRun(t, manager, workspace, `{"resourceId":"project1.task1","agentName":"fake-agent"}`)
	if recorder.Code != http.StatusOK {
		t.Fatalf("start run returned %d: %s", recorder.Code, recorder.Body.String())
	}

	const requests = 12
	codes := make(chan int, requests)
	var wg sync.WaitGroup
	for i := 0; i < requests; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			response := setSelfDrivingForTest(t, manager.server, workspace.ID, false, "project1.task1")
			codes <- response.Code
		}()
	}
	wg.Wait()
	close(codes)
	for code := range codes {
		if code != http.StatusOK {
			t.Fatalf("concurrent idempotent Disable returned %d", code)
		}
	}
	fake.mu.Lock()
	steers := append([]bool(nil), fake.messageSteers...)
	fake.mu.Unlock()
	if len(steers) != 1 || !steers[0] {
		t.Fatalf("concurrent idempotent Disable steers = %v, want one", steers)
	}
}

func TestDisableSessionStateMatrixNeverInterruptsOrStops(t *testing.T) {
	for _, test := range []struct {
		name, runStatus, hubState string
		schedulerTurn             bool
	}{{"autonomous turn", "running", "busy", true}, {"manual turn", "running", "busy", false}, {"approval", "waiting_approval", "waiting_approval", true}} {
		t.Run(test.name, func(t *testing.T) {
			fake := newRuntimeFakeAgentHub()
			hub := httptest.NewServer(fake)
			defer hub.Close()
			manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
			client, err := newAgentHubClient(hub.URL, nil)
			if err != nil {
				t.Fatal(err)
			}
			run := agentRun{
				ID: "run-state", WorkspaceID: workspace.ID, ResourceID: "project1.task1",
				AgentHubSessionID: "session-state", AgentHubAgentName: "fake-agent", Status: test.runStatus,
				SchedulerTurn: test.schedulerTurn, SelfDrivingRevision: 1,
			}
			if err := saveAgentRun(workspace.Path, run); err != nil {
				t.Fatal(err)
			}
			fake.mu.Lock()
			fake.sessions[run.AgentHubSessionID] = agentHubSession{ID: run.AgentHubSessionID, State: test.hubState}
			fake.mu.Unlock()
			rt := newAgentHubRuntime(manager, workspace, run, client)
			rt.agentHubState = test.hubState
			manager.registerRuntime(rt)

			rec := setSelfDrivingForTest(t, manager.server, workspace.ID, false, run.ResourceID)
			if rec.Code != http.StatusOK {
				t.Fatalf("disable returned %d: %s", rec.Code, rec.Body.String())
			}
			fake.mu.Lock()
			actions := strings.Join(fake.actions, ",")
			steers := append([]bool(nil), fake.messageSteers...)
			fake.mu.Unlock()
			if strings.Contains(actions, "interrupt") || strings.Contains(actions, "stop") || len(steers) != 1 || !steers[0] {
				t.Fatalf("Disable matrix actions=%q steers=%v", actions, steers)
			}
			got := reloadTestTask(t, workspace.Path, run.ResourceID)
			if got.SelfDriving.Enabled || rt.snapshotRun().Status != test.runStatus {
				t.Fatalf("Disable changed desired/session state: task=%#v run=%#v", got.SelfDriving, rt.snapshotRun())
			}
		})
	}
}

func TestDisableIsNotBlockedByConcurrentSessionClose(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	recorder, detail := startRuntimeTestRun(t, manager, workspace, `{"resourceId":"project1.task1","agentName":"fake-agent"}`)
	if recorder.Code != http.StatusOK {
		t.Fatalf("start run returned %d: %s", recorder.Code, recorder.Body.String())
	}

	entered := make(chan struct{})
	release := make(chan struct{})
	var once sync.Once
	fake.mu.Lock()
	fake.stopHook = func(string) {
		once.Do(func() { close(entered) })
		<-release
	}
	fake.mu.Unlock()
	closeDone := make(chan *httptest.ResponseRecorder, 1)
	go func() {
		request := httptest.NewRequest(http.MethodPost, "/stop", strings.NewReader(`{}`))
		response := httptest.NewRecorder()
		manager.handle(response, request, workspace.ID, []string{"runs", detail.Run.ID, "stop"})
		closeDone <- response
	}()
	select {
	case <-entered:
	case <-time.After(time.Second):
		close(release)
		t.Fatal("Close Session did not reach the blocked AgentHub stop")
	}

	disableDone := make(chan *httptest.ResponseRecorder, 1)
	go func() {
		body := `{"resourceId":"project1.task1","enabled":false,"agentName":"fake-agent"}`
		request := httptest.NewRequest(http.MethodPut, "/api/workspaces/"+workspace.ID+"/self-driving", strings.NewReader(body))
		response := httptest.NewRecorder()
		manager.server.handleWorkspace(response, request)
		disableDone <- response
	}()
	select {
	case response := <-disableDone:
		if response.Code != http.StatusOK {
			close(release)
			t.Fatalf("Disable returned %d while Close Session was blocked: %s", response.Code, response.Body.String())
		}
	case <-time.After(time.Second):
		close(release)
		t.Fatal("Disable was blocked by the Session lifecycle operation")
	}
	if got := reloadTestTask(t, workspace.Path, "project1.task1"); got.SelfDriving == nil || got.SelfDriving.Enabled {
		close(release)
		t.Fatalf("Disable was not durable while Close Session was blocked: %#v", got.SelfDriving)
	}
	close(release)
	if response := <-closeDone; response.Code != http.StatusOK {
		t.Fatalf("Close Session returned %d: %s", response.Code, response.Body.String())
	}
}

func TestCloseSessionLeavesSelfDrivingEnabled(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	recorder, detail := startRuntimeTestRun(t, manager, workspace, `{"resourceId":"project1.task1","agentName":"fake-agent"}`)
	if recorder.Code != http.StatusOK {
		t.Fatalf("start run returned %d: %s", recorder.Code, recorder.Body.String())
	}
	closed := closeRuntimeTestRun(t, manager, workspace, detail.Run.ID)
	if closed.Code != http.StatusOK {
		t.Fatalf("close returned %d: %s", closed.Code, closed.Body.String())
	}
	got := reloadTestTask(t, workspace.Path, "project1.task1")
	if got.SelfDriving == nil || !got.SelfDriving.Enabled || got.SelfDriving.Revision != 1 {
		t.Fatalf("Close Session changed Self-Driving: %#v", got.SelfDriving)
	}
	if strings.Contains(closed.Body.String(), "selfDrivingPaused") || strings.Contains(closed.Body.String(), "selfDrivingCancelled") {
		t.Fatalf("Close response retained old state coupling: %s", closed.Body.String())
	}

	internal := httptest.NewServer(http.HandlerFunc(manager.server.handleWorkspace))
	defer internal.Close()
	manager.server.addr = internal.URL
	result, err := manager.server.startRunnableTask(context.Background(), workspace, runnableTaskCandidateFromTask(got))
	if err != nil || result != runnableTaskStarted {
		t.Fatalf("Scheduler did not rebuild a closed enabled Session: result=%q err=%v", result, err)
	}
	fake.mu.Lock()
	created := fake.nextSession
	fake.mu.Unlock()
	if created != 2 {
		t.Fatalf("close/rebuild created %d AgentHub Sessions, want 2 total", created)
	}
	runs, err := loadAgentRuns(workspace.Path)
	if err != nil {
		t.Fatal(err)
	}
	activeSchedulerTurns := 0
	for _, run := range runs {
		if isLiveAgentStatus(run.Status) && run.SchedulerTurn && run.SelfDrivingRevision == got.SelfDriving.Revision {
			activeSchedulerTurns++
		}
	}
	if activeSchedulerTurns != 1 {
		t.Fatalf("close/rebuild active autonomous Turns = %d, runs=%#v", activeSchedulerTurns, runs)
	}
}
