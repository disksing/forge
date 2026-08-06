package serve

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"net/url"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/disksing/forge/internal/app"
)

type runtimeFakeAgentHub struct {
	mu                 sync.Mutex
	sessions           map[string]agentHubSession
	events             map[string][]agentHubEvent
	nextSession        int
	abortNextCreate    bool
	duplicateSource    bool
	gapAfter           int64
	failEvents         bool
	stopAtStopping     bool
	failNextInterrupt  bool
	failNextResume     bool
	failNextMessage    bool
	rejectAgentName    string
	stopHook           func(string)
	messageSteers      []bool
	actions            []string
	resumeEnvironments []map[string]string
	listCalls          int
	eventsAttempts     int
	eventsCalls        int
	streamCalls        int
}

func newRuntimeFakeAgentHub() *runtimeFakeAgentHub {
	return &runtimeFakeAgentHub{
		sessions: make(map[string]agentHubSession),
		events:   make(map[string][]agentHubEvent),
	}
}

func (f *runtimeFakeAgentHub) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path == "/v1/agents" && r.Method == http.MethodGet {
		f.mu.Lock()
		rejected := f.rejectAgentName
		f.mu.Unlock()
		agents := []map[string]any{{"name": "fake-agent", "providerId": "fake", "available": rejected != "fake-agent"}}
		if rejected != "" && rejected != "fake-agent" {
			agents = append(agents, map[string]any{"name": rejected, "providerId": "fake", "available": false, "unavailableReason": "configured AgentHub agent is unavailable"})
		}
		writeRuntimeFakeJSON(w, map[string]any{
			"providers": []any{map[string]any{"id": "fake", "name": "Fake", "type": "fake", "enabled": true}},
			"agents":    agents, "probes": []any{},
		})
		return
	}
	if r.URL.Path == "/v1/sessions" {
		if r.Method == http.MethodGet {
			f.list(w, r)
			return
		}
		if r.Method == http.MethodPost {
			f.create(w, r)
			return
		}
	}
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	if len(parts) < 3 || parts[0] != "v1" || parts[1] != "sessions" {
		http.NotFound(w, r)
		return
	}
	id, _ := url.PathUnescape(parts[2])
	if len(parts) == 3 && r.Method == http.MethodGet {
		f.mu.Lock()
		session, ok := f.sessions[id]
		f.mu.Unlock()
		if !ok {
			w.WriteHeader(http.StatusNotFound)
			return
		}
		writeRuntimeFakeJSON(w, map[string]any{"session": session})
		return
	}
	if len(parts) == 4 && parts[3] == "events" {
		f.serveEvents(w, r, id)
		return
	}
	if len(parts) == 4 && parts[3] == "messages" {
		var body struct {
			Text  string `json:"text"`
			Steer bool   `json:"steer"`
		}
		_ = json.NewDecoder(r.Body).Decode(&body)
		f.mu.Lock()
		f.messageSteers = append(f.messageSteers, body.Steer)
		eventType := "message.user"
		if body.Steer {
			eventType = "message.user.steer"
		}
		f.appendLocked(id, eventType, map[string]any{"text": body.Text})
		f.appendLocked(id, "turn.started", map[string]any{"text": body.Text})
		session := f.sessions[id]
		session.State = "busy"
		f.sessions[id] = session
		fail := f.failNextMessage
		f.failNextMessage = false
		f.mu.Unlock()
		if fail {
			w.WriteHeader(http.StatusBadGateway)
			writeRuntimeFakeJSON(w, map[string]any{"error": map[string]any{
				"code": "message_outcome_unknown", "message": "synthetic ambiguous message failure",
			}})
			return
		}
		writeRuntimeFakeJSON(w, map[string]any{"session": session})
		return
	}
	if len(parts) == 5 && parts[3] == "approvals" {
		approvalID, _ := url.PathUnescape(parts[4])
		var body agentHubApprovalReply
		_ = json.NewDecoder(r.Body).Decode(&body)
		answer := body.Decision
		if body.OptionID != "" {
			answer = "option=" + body.OptionID
		}
		if body.Text != "" {
			answer = "text=" + body.Text
		}
		f.mu.Lock()
		f.actions = append(f.actions, "approval:"+approvalID+":"+answer)
		f.appendLocked(id, "approval.resolved", map[string]any{
			"approvalId": approvalID,
			"decision":   body.Decision,
			"optionId":   body.OptionID,
			"text":       body.Text,
		})
		session := f.sessions[id]
		session.State = "busy"
		session.PendingApprovalIDs = nil
		f.sessions[id] = session
		f.mu.Unlock()
		writeRuntimeFakeJSON(w, map[string]any{"session": session})
		return
	}
	if len(parts) == 4 && r.Method == http.MethodPost {
		action := parts[3]
		var stopHook func(string)
		var resumeRequest agentHubResumeRequest
		if action == "resume" {
			_ = json.NewDecoder(r.Body).Decode(&resumeRequest)
		}
		f.mu.Lock()
		if action == "resume" {
			f.resumeEnvironments = append(f.resumeEnvironments, resumeRequest.LaunchEnvironment)
			if f.failNextResume {
				f.failNextResume = false
				f.mu.Unlock()
				w.WriteHeader(http.StatusInternalServerError)
				writeRuntimeFakeJSON(w, map[string]any{"error": map[string]any{
					"code": "resume_failed", "message": "synthetic resume failure",
				}})
				return
			}
		}
		if action == "interrupt" && f.failNextInterrupt {
			f.failNextInterrupt = false
			f.mu.Unlock()
			w.WriteHeader(http.StatusBadGateway)
			writeRuntimeFakeJSON(w, map[string]any{"error": map[string]any{
				"code": "interrupt_unknown", "message": "synthetic interrupt failure",
			}})
			return
		}
		f.actions = append(f.actions, action)
		session := f.sessions[id]
		switch action {
		case "interrupt":
			f.appendLocked(id, "turn.cancelled", map[string]any{"reason": "requested"})
			f.appendLocked(id, "session.state", map[string]any{"state": "ready"})
			session.State = "ready"
		case "stop":
			stopHook = f.stopHook
			f.appendLocked(id, "session.state", map[string]any{"state": "stopping"})
			session.State = "stopping"
			if !f.stopAtStopping {
				f.appendLocked(id, "session.state", map[string]any{"state": "stopped", "reason": "requested"})
				session.State = "stopped"
				session.StopReason = "requested"
			}
		case "resume":
			if len(resumeRequest.LaunchEnvironment) > 0 {
				if session.LaunchEnvironment == nil {
					session.LaunchEnvironment = make(map[string]string, len(resumeRequest.LaunchEnvironment))
				}
				for key, value := range resumeRequest.LaunchEnvironment {
					session.LaunchEnvironment[key] = value
				}
			}
			f.appendLocked(id, "session.state", map[string]any{"state": "starting"})
			f.appendLocked(id, "session.state", map[string]any{"state": "ready"})
			session.State = "ready"
		}
		session.LastEventID = int64(len(f.events[id]))
		f.sessions[id] = session
		f.mu.Unlock()
		if stopHook != nil {
			stopHook(id)
		}
		writeRuntimeFakeJSON(w, map[string]any{"session": session})
		return
	}
	http.NotFound(w, r)
}

func writeRuntimeFakeJSON(w http.ResponseWriter, value any) {
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(value)
}

func (f *runtimeFakeAgentHub) create(w http.ResponseWriter, r *http.Request) {
	var request agentHubCreateSessionRequest
	_ = json.NewDecoder(r.Body).Decode(&request)
	f.mu.Lock()
	if f.rejectAgentName != "" && request.AgentName == f.rejectAgentName {
		f.mu.Unlock()
		w.WriteHeader(http.StatusBadRequest)
		writeRuntimeFakeJSON(w, map[string]any{"error": map[string]any{
			"code": "agent_unavailable", "message": "configured AgentHub agent is unavailable",
		}})
		return
	}
	f.nextSession++
	id := fmt.Sprintf("ses_%d", f.nextSession)
	session := agentHubSession{
		ID: id, Title: request.Title, Cwd: request.Cwd, AgentName: request.AgentName,
		LaunchEnvironment: request.LaunchEnvironment, Source: request.Source, Provider: "fake",
		State: "ready", CreatedAt: time.Now().Format(time.RFC3339), UpdatedAt: time.Now().Format(time.RFC3339),
	}
	f.sessions[id] = session
	f.appendLocked(id, "session.created", session)
	f.appendLocked(id, "session.state", map[string]any{"state": "ready"})
	if request.InitialMessage != nil {
		f.appendLocked(id, "message.user", map[string]any{"text": request.InitialMessage.Text})
		f.appendLocked(id, "turn.started", map[string]any{"text": request.InitialMessage.Text})
		session.State = "busy"
	}
	session.LastEventID = int64(len(f.events[id]))
	f.sessions[id] = session
	abort := f.abortNextCreate
	f.abortNextCreate = false
	f.mu.Unlock()
	if abort {
		panic(http.ErrAbortHandler)
	}
	w.WriteHeader(http.StatusCreated)
	writeRuntimeFakeJSON(w, map[string]any{"session": session})
}

func TestAgentHubRuntimeReportsUnavailableConfiguredProfile(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	fake.rejectAgentName = "missing-agent"
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, configPath := newRuntimeTestManager(t, hub.URL)
	configData, err := json.Marshal(agentHubGUIConfig{
		Version: agentHubConfigVersion, Workspaces: []guiWorkspace{workspace},
		AgentHubEndpoint: hub.URL, AgentHubInstanceID: "forge-runtime-unavailable",
		AgentProfiles: []agentHubProfileRoute{
			{Key: "default", AgentName: "missing-agent"},
			{Key: "fast", AgentName: "missing-agent"},
			{Key: "reasoning", AgentName: "missing-agent"},
		},
	})
	if err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(configPath, configData, 0o600); err != nil {
		t.Fatal(err)
	}
	recorder, _ := startRuntimeTestRun(t, manager, workspace, `{"agentProfile":"default"}`)
	if recorder.Code != http.StatusBadGateway || !strings.Contains(recorder.Body.String(), "unavailable") {
		t.Fatalf("expected unavailable AgentHub target to fail at runtime, got %d: %s", recorder.Code, recorder.Body.String())
	}
}

func TestUnavailableAgentDoesNotCreateRunOrForgeSession(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	fake.rejectAgentName = "fake-agent"
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	recorder, _ := startRuntimeTestRun(t, manager, workspace, `{"agentProfile":"default"}`)
	if recorder.Code != http.StatusBadGateway {
		t.Fatalf("expected unavailable AgentHub target, got %d: %s", recorder.Code, recorder.Body.String())
	}
	runs, err := loadAgentRuns(workspace.Path)
	if err != nil || len(runs) != 0 {
		t.Fatalf("unavailable target must not persist a run: runs=%#v err=%v", runs, err)
	}
	if sessions := testForgeSessions(t, workspace.Path); len(sessions) != 0 {
		t.Fatalf("unavailable target must not create a Forge session: %#v", sessions)
	}
}

func TestUnavailableAgentDoesNotCreateRunAfterManagerRestart(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	fake.rejectAgentName = "fake-agent"
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	recorder, _ := startRuntimeTestRun(t, manager, workspace, `{"agentProfile":"default"}`)
	if recorder.Code != http.StatusBadGateway {
		t.Fatalf("expected unavailable AgentHub target, got %d: %s", recorder.Code, recorder.Body.String())
	}
	runs, err := loadAgentRuns(workspace.Path)
	if err != nil || len(runs) != 0 {
		t.Fatalf("unavailable target must not persist a run: runs=%#v err=%v", runs, err)
	}
	if sessions := testForgeSessions(t, workspace.Path); len(sessions) != 0 {
		t.Fatalf("unavailable target must not create a Forge session: %#v", sessions)
	}

	// A GUI restart still sees no run or lock to clean up.
	restarted := newAgentManager(manager.server)
	if restarted.runtimeByID("missing-run") != nil {
		t.Fatal("fresh manager unexpectedly has a runtime for an unavailable target")
	}
}

func (f *runtimeFakeAgentHub) list(w http.ResponseWriter, r *http.Request) {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.listCalls++
	var sessions []agentHubSession
	if f.duplicateSource {
		source := &agentHubSource{
			App: r.URL.Query().Get("sourceApp"), InstanceID: r.URL.Query().Get("sourceInstanceId"),
			ExternalID: r.URL.Query().Get("sourceExternalId"),
		}
		sessions = append(sessions,
			agentHubSession{ID: "ses_duplicate_1", Source: source},
			agentHubSession{ID: "ses_duplicate_2", Source: source},
		)
		writeRuntimeFakeJSON(w, map[string]any{"sessions": sessions})
		return
	}
	// Mirror real AgentHub semantics: archived sessions are hidden from the
	// default list and only returned when includeArchived is requested.
	includeArchived := r.URL.Query().Get("includeArchived") == "true" || r.URL.Query().Get("archived") == "true"
	for _, session := range f.sessions {
		if session.State == "archived" && !includeArchived {
			continue
		}
		if sourceMatchesQuery(session.Source, r.URL.Query()) {
			sessions = append(sessions, session)
		}
	}
	writeRuntimeFakeJSON(w, map[string]any{"sessions": sessions})
}

func sourceMatchesQuery(source *agentHubSource, query url.Values) bool {
	if query.Get("sourceApp") == "" && query.Get("sourceInstanceId") == "" && query.Get("sourceExternalId") == "" {
		return true
	}
	return source != nil &&
		(query.Get("sourceApp") == "" || source.App == query.Get("sourceApp")) &&
		(query.Get("sourceInstanceId") == "" || source.InstanceID == query.Get("sourceInstanceId")) &&
		(query.Get("sourceExternalId") == "" || source.ExternalID == query.Get("sourceExternalId"))
}

func (f *runtimeFakeAgentHub) serveEvents(w http.ResponseWriter, r *http.Request, id string) {
	after, _ := strconv.ParseInt(r.URL.Query().Get("after"), 10, 64)
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	if limit <= 0 {
		limit = 200
	}
	f.mu.Lock()
	f.eventsAttempts++
	if f.failEvents {
		f.mu.Unlock()
		w.WriteHeader(http.StatusInternalServerError)
		writeRuntimeFakeJSON(w, map[string]any{"error": map[string]any{
			"code": "events_unavailable", "message": "synthetic events failure",
		}})
		return
	}
	all := append([]agentHubEvent(nil), f.events[id]...)
	gapAfter := f.gapAfter
	if strings.Contains(r.Header.Get("Accept"), "text/event-stream") || r.URL.Query().Get("stream") == "true" {
		f.streamCalls++
	} else {
		f.eventsCalls++
	}
	f.mu.Unlock()
	var events []agentHubEvent
	for _, event := range all {
		if event.ID <= after {
			continue
		}
		if gapAfter > 0 && after < gapAfter && event.ID == gapAfter {
			continue
		}
		events = append(events, event)
		if len(events) == limit {
			break
		}
	}
	if strings.Contains(r.Header.Get("Accept"), "text/event-stream") || r.URL.Query().Get("stream") == "true" {
		w.Header().Set("Content-Type", "text/event-stream")
		for _, event := range events {
			data, _ := json.Marshal(event)
			fmt.Fprintf(w, "id: %d\ndata: %s\n\n", event.ID, data)
		}
		return
	}
	next := after
	if len(events) > 0 {
		next = events[len(events)-1].ID
	}
	writeRuntimeFakeJSON(w, map[string]any{
		"events": events,
		"page": map[string]any{
			"after": after, "limit": limit, "nextAfter": next, "hasMore": next < int64(len(all)),
		},
		"latestCursor": len(all),
	})
}

func (f *runtimeFakeAgentHub) appendLocked(sessionID, eventType string, data any) agentHubEvent {
	raw, _ := json.Marshal(data)
	event := agentHubEvent{
		ID: int64(len(f.events[sessionID]) + 1), Time: time.Now().Format(time.RFC3339),
		Type: eventType, SessionID: sessionID, Data: raw,
	}
	f.events[sessionID] = append(f.events[sessionID], event)
	session := f.sessions[sessionID]
	session.LastEventID = event.ID
	session.UpdatedAt = event.Time
	f.sessions[sessionID] = session
	return event
}

func newRuntimeTestManager(t *testing.T, hubURL string) (*agentManager, guiWorkspace, string) {
	t.Helper()
	workspacePath := t.TempDir()
	forgeWorkspace, err := app.Initialize(workspacePath, "en")
	if err != nil {
		t.Fatal(err)
	}
	project, err := forgeWorkspace.CreateProject("Runtime test project", "runtime-test")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := forgeWorkspace.CreateTask(app.CreateTaskInput{ProjectID: project.ID, Title: "Runtime test task", Slug: "runtime-test", AutoRun: true}); err != nil {
		t.Fatal(err)
	}
	workspace := guiWorkspace{ID: "workspace-test", Name: "Test", Path: workspacePath}
	configPath := filepath.Join(t.TempDir(), "gui.json")
	configData, _ := json.Marshal(agentHubGUIConfig{
		Version: agentHubConfigVersion, Workspaces: []guiWorkspace{workspace},
		AgentHubEndpoint: hubURL, AgentHubInstanceID: "forge-runtime-test",
		AgentProfiles: []agentHubProfileRoute{{Key: "default", AgentName: "fake-agent"}},
	})
	if err := os.WriteFile(configPath, configData, 0o600); err != nil {
		t.Fatal(err)
	}
	server := &server{config: configPath, addr: "127.0.0.1:4936"}
	manager := newAgentManager(server)
	server.agents = manager
	return manager, workspace, configPath
}

func startRuntimeTestRun(t *testing.T, manager *agentManager, workspace guiWorkspace, body string) (*httptest.ResponseRecorder, agentRunDetail) {
	t.Helper()
	request := httptest.NewRequest(http.MethodPost, "/api/workspaces/"+workspace.ID+"/agent/runs", strings.NewReader(body))
	recorder := httptest.NewRecorder()
	manager.startRun(recorder, request, workspace.ID)
	var detail agentRunDetail
	_ = json.Unmarshal(recorder.Body.Bytes(), &detail)
	return recorder, detail
}

func seedSuspendedChatInputRun(t *testing.T, manager *agentManager, fake *runtimeFakeAgentHub, workspace guiWorkspace) (*agentRuntime, app.Task) {
	t.Helper()
	forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		t.Fatal(err)
	}
	resource, err := forgeWorkspace.ResourceValue("project1.task1")
	if err != nil || resource.Task == nil {
		t.Fatalf("load AutoRun task: resource=%+v err=%v", resource, err)
	}
	if _, err := forgeWorkspace.StartAutoRun(resource.Task.ID); err != nil {
		t.Fatal(err)
	}
	suspended, err := forgeWorkspace.SuspendAutoRun(app.AutoRunActionInput{
		TaskID: resource.Task.ID, Summary: "waiting for human input", WakeCondition: "the user sends a message",
		ExpectedGeneration: 1, ExpectedState: "running",
	})
	if err != nil || suspended.AutoRun == nil || suspended.AutoRun.State != "suspended" {
		t.Fatalf("seed suspended task: task=%+v err=%v", suspended, err)
	}

	run := agentRun{
		ID: "run-chat-resume", WorkspaceID: workspace.ID, ResourceID: resource.Task.ID,
		AgentHubSessionID: "ses_chat_resume", AgentHubAgentName: "fake-agent",
		SourceExternalID: workspace.ID + "/run-chat-resume", Cwd: workspace.Path, Status: "idle",
		AutoRunGeneration: 1, CreatedAt: time.Now().Format(time.RFC3339), UpdatedAt: time.Now().Format(time.RFC3339),
	}
	if err := saveAgentRun(workspace.Path, run); err != nil {
		t.Fatal(err)
	}
	fake.mu.Lock()
	fake.sessions[run.AgentHubSessionID] = agentHubSession{
		ID: run.AgentHubSessionID, State: "ready", AgentName: "fake-agent",
		Source:    &agentHubSource{App: agentHubSourceApp, InstanceID: "forge-runtime-test", ExternalID: run.SourceExternalID},
		CreatedAt: run.CreatedAt, UpdatedAt: run.UpdatedAt,
	}
	fake.mu.Unlock()
	_, client, err := manager.agentHubRuntimeConfig()
	if err != nil {
		t.Fatal(err)
	}
	rt := newAgentHubRuntime(manager, workspace, run, client)
	manager.registerRuntime(rt)
	return rt, suspended
}

func sendRuntimeAgentInput(t *testing.T, manager *agentManager, workspace guiWorkspace, runID, body string) *httptest.ResponseRecorder {
	t.Helper()
	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodPost, "/input", strings.NewReader(body))
	manager.handle(recorder, request, workspace.ID, []string{"runs", runID, "input"})
	return recorder
}

func TestAgentHubChatInputResumesExactSuspendedAutoRunGeneration(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	rt, seeded := seedSuspendedChatInputRun(t, manager, fake, workspace)

	recorder := sendRuntimeAgentInput(t, manager, workspace, rt.run.ID, `{"text":"resume manually","resourceId":"project1.task1","resumeSuspendedAutoRun":true,"autoRunProjectionSet":true,"expectedAutoRunGeneration":1,"expectedAutoRunState":"suspended"}`)
	if recorder.Code != http.StatusOK {
		t.Fatalf("suspended Chat input failed: %d %s", recorder.Code, recorder.Body.String())
	}
	var response map[string]any
	if err := json.Unmarshal(recorder.Body.Bytes(), &response); err != nil {
		t.Fatalf("decode accepted input: %v (%s)", err, recorder.Body.String())
	}
	if response["status"] != "accepted" || response["autoRunResumed"] != true {
		t.Fatalf("input did not report an AutoRun resume: %#v", response)
	}

	reloaded := reloadTestTask(t, workspace.Path, seeded.ID)
	if reloaded.AutoRun == nil || reloaded.AutoRun.State != "running" || reloaded.AutoRun.Generation != 1 ||
		reloaded.AutoRun.SuspensionSummary != "waiting for human input" || reloaded.AutoRun.WakeCondition != "the user sends a message" {
		t.Fatalf("Chat resume lost the suspended generation context: %+v", reloaded.AutoRun)
	}
	projected := pollerRunState(rt)
	if projected.Status != "running" || !projected.SchedulerTurn || projected.AutoRunGeneration != 1 {
		t.Fatalf("Chat resume did not restore the scheduler-turn projection: %#v", projected)
	}

	fake.mu.Lock()
	events := append([]agentHubEvent(nil), fake.events[projected.AgentHubSessionID]...)
	steers := append([]bool(nil), fake.messageSteers...)
	fake.mu.Unlock()
	messageCount := 0
	for _, event := range events {
		if event.Type == "message.user" && fakeEventText(event) == "resume manually" {
			messageCount++
		}
	}
	if messageCount != 1 || len(steers) != 1 || steers[0] {
		t.Fatalf("resume message was duplicated or sent as a steer: messages=%d steers=%v events=%#v", messageCount, steers, events)
	}
}

func TestAgentHubChatInputDoesNotImplicitlyResumePausedAutoRun(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	rt, seeded := seedSuspendedChatInputRun(t, manager, fake, workspace)
	forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := forgeWorkspace.ResumeAutoRun(seeded.ID); err != nil {
		t.Fatal(err)
	}
	if _, err := forgeWorkspace.StartAutoRun(seeded.ID); err != nil {
		t.Fatal(err)
	}
	paused, err := forgeWorkspace.PauseAutoRun(app.AutoRunActionInput{TaskID: seeded.ID, ExpectedGeneration: 1, ExpectedState: "running"})
	if err != nil || paused.AutoRun == nil || paused.AutoRun.State != "paused" {
		t.Fatalf("pause setup failed: task=%+v err=%v", paused, err)
	}

	conflict := sendRuntimeAgentInput(t, manager, workspace, rt.run.ID, `{"text":"must not resume","resourceId":"project1.task1","resumeSuspendedAutoRun":true,"autoRunProjectionSet":true,"expectedAutoRunGeneration":1,"expectedAutoRunState":"paused"}`)
	if conflict.Code != http.StatusConflict {
		t.Fatalf("paused resume intent should conflict, got %d %s", conflict.Code, conflict.Body.String())
	}
	if countFakeUserMessages(fake) != 0 {
		t.Fatal("paused resume intent sent a message")
	}

	ordinary := sendRuntimeAgentInput(t, manager, workspace, rt.run.ID, `{"text":"ordinary paused chat","resourceId":"project1.task1","autoRunProjectionSet":true,"expectedAutoRunGeneration":1,"expectedAutoRunState":"paused"}`)
	if ordinary.Code != http.StatusOK {
		t.Fatalf("ordinary paused Chat input failed: %d %s", ordinary.Code, ordinary.Body.String())
	}
	reloaded := reloadTestTask(t, workspace.Path, seeded.ID)
	if reloaded.AutoRun == nil || reloaded.AutoRun.State != "paused" {
		t.Fatalf("ordinary Chat input implicitly changed paused AutoRun: %+v", reloaded.AutoRun)
	}
	projected := pollerRunState(rt)
	if projected.SchedulerTurn || projected.AutoRunGeneration != 1 {
		t.Fatalf("ordinary paused Chat input changed scheduler metadata: %#v", projected)
	}
	if countFakeUserMessages(fake) != 1 {
		t.Fatalf("ordinary paused Chat input message count = %d, want 1", countFakeUserMessages(fake))
	}
}

func TestAgentHubChatInputRejectsStaleGenerationAndAmbiguousMessageWithoutRetry(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	rt, seeded := seedSuspendedChatInputRun(t, manager, fake, workspace)

	fake.mu.Lock()
	session := fake.sessions[rt.run.AgentHubSessionID]
	session.Source.ExternalID = "another-run"
	fake.sessions[session.ID] = session
	fake.mu.Unlock()
	wrongSource := sendRuntimeAgentInput(t, manager, workspace, rt.run.ID, `{"text":"wrong session","resourceId":"project1.task1","resumeSuspendedAutoRun":true,"autoRunProjectionSet":true,"expectedAutoRunGeneration":1,"expectedAutoRunState":"suspended"}`)
	if wrongSource.Code != http.StatusConflict {
		t.Fatalf("session with a mismatched source should conflict, got %d %s", wrongSource.Code, wrongSource.Body.String())
	}
	if countFakeUserMessages(fake) != 0 {
		t.Fatal("mismatched source sent a message")
	}
	fake.mu.Lock()
	session.Source.ExternalID = rt.run.SourceExternalID
	fake.sessions[session.ID] = session
	fake.mu.Unlock()

	stale := sendRuntimeAgentInput(t, manager, workspace, rt.run.ID, `{"text":"stale generation","resourceId":"project1.task1","resumeSuspendedAutoRun":true,"autoRunProjectionSet":true,"expectedAutoRunGeneration":2,"expectedAutoRunState":"suspended"}`)
	if stale.Code != http.StatusConflict {
		t.Fatalf("stale generation should conflict, got %d %s", stale.Code, stale.Body.String())
	}
	if countFakeUserMessages(fake) != 0 {
		t.Fatal("stale generation sent a message")
	}
	if task := reloadTestTask(t, workspace.Path, seeded.ID); task.AutoRun == nil || task.AutoRun.State != "suspended" || task.AutoRun.Generation != 1 {
		t.Fatalf("stale generation changed task state: %+v", task.AutoRun)
	}

	fake.mu.Lock()
	fake.failNextMessage = true
	fake.mu.Unlock()
	ambiguous := sendRuntimeAgentInput(t, manager, workspace, rt.run.ID, `{"text":"possibly delivered","resourceId":"project1.task1","resumeSuspendedAutoRun":true,"autoRunProjectionSet":true,"expectedAutoRunGeneration":1,"expectedAutoRunState":"suspended"}`)
	if ambiguous.Code != http.StatusBadGateway || !strings.Contains(ambiguous.Body.String(), "not retried") {
		t.Fatalf("ambiguous message should fail closed without retry, got %d %s", ambiguous.Code, ambiguous.Body.String())
	}
	projected := pollerRunState(rt)
	if projected.Status != "recovering" || !projected.SchedulerTurn || projected.AutoRunGeneration != 1 {
		t.Fatalf("ambiguous message lost the durable scheduler projection: %#v", projected)
	}
	if task := reloadTestTask(t, workspace.Path, seeded.ID); task.AutoRun == nil || task.AutoRun.State != "running" {
		t.Fatalf("ambiguous message rolled back a durable AutoRun resume: %+v", task.AutoRun)
	}
	if countFakeUserMessages(fake) != 1 {
		t.Fatalf("ambiguous message was retried or dropped: count=%d", countFakeUserMessages(fake))
	}

	second := sendRuntimeAgentInput(t, manager, workspace, rt.run.ID, `{"text":"duplicate retry","resourceId":"project1.task1","resumeSuspendedAutoRun":true,"autoRunProjectionSet":true,"expectedAutoRunGeneration":1,"expectedAutoRunState":"suspended"}`)
	if second.Code != http.StatusConflict {
		t.Fatalf("duplicate submission after ambiguous result should conflict, got %d %s", second.Code, second.Body.String())
	}
	if countFakeUserMessages(fake) != 1 {
		t.Fatal("duplicate submission sent a second message")
	}
}

func TestAgentHubChatInputDuplicateResumeSubmissionHasOneWinner(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	rt, _ := seedSuspendedChatInputRun(t, manager, fake, workspace)
	body := `{"text":"race resume","resourceId":"project1.task1","resumeSuspendedAutoRun":true,"autoRunProjectionSet":true,"expectedAutoRunGeneration":1,"expectedAutoRunState":"suspended"}`
	results := make(chan int, 2)
	var group sync.WaitGroup
	for i := 0; i < 2; i++ {
		group.Add(1)
		go func() {
			defer group.Done()
			results <- sendRuntimeAgentInput(t, manager, workspace, rt.run.ID, body).Code
		}()
	}
	group.Wait()
	close(results)
	accepted, conflicts := 0, 0
	for code := range results {
		switch code {
		case http.StatusOK:
			accepted++
		case http.StatusConflict:
			conflicts++
		}
	}
	if accepted != 1 || conflicts != 1 {
		t.Fatalf("duplicate resume results: accepted=%d conflicts=%d", accepted, conflicts)
	}
	if countFakeUserMessages(fake) != 1 {
		t.Fatalf("duplicate resume sent %d messages", countFakeUserMessages(fake))
	}
}

func countFakeUserMessages(fake *runtimeFakeAgentHub) int {
	fake.mu.Lock()
	defer fake.mu.Unlock()
	count := 0
	for _, events := range fake.events {
		for _, event := range events {
			if event.Type == "message.user" {
				count++
			}
		}
	}
	return count
}

func TestAgentHubRuntimeCreateLostResponseRecoveryAndProjectionOnly(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	fake.abortNextCreate = true
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	recorder, detail := startRuntimeTestRun(t, manager, workspace, `{"title":"Lost response","agentName":"fake-agent"}`)
	if recorder.Code != http.StatusOK {
		t.Fatalf("start failed: %d %s", recorder.Code, recorder.Body.String())
	}
	if detail.Run.AgentHubSessionID != "ses_1" || detail.Run.SourceExternalID != workspace.ID+"/"+detail.Run.ID {
		t.Fatalf("unexpected recovered projection: %#v", detail.Run)
	}
	fake.mu.Lock()
	session := fake.sessions["ses_1"]
	fake.mu.Unlock()
	if session.Source == nil || session.Source.App != "forge" || session.Source.InstanceID != "forge-runtime-test" ||
		session.LaunchEnvironment["FORGE_SESSION_ID"] != detail.Run.ForgeSessionID {
		t.Fatalf("source or launch environment missing: %#v", session)
	}
	localEventPath := filepath.Join(workspace.Path, ".forge", "gui-agent", "runs", detail.Run.ID+".jsonl")
	if _, err := os.Stat(localEventPath); !os.IsNotExist(err) {
		t.Fatalf("AgentHub run must not create a local event fact log: %v", err)
	}
}

func TestAgentHubRuntimeDuplicateSourceKeepsRunRecovering(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	fake.duplicateSource = true
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	recorder, _ := startRuntimeTestRun(t, manager, workspace, `{"title":"Conflict","agentName":"fake-agent"}`)
	if recorder.Code != http.StatusBadGateway || !strings.Contains(recorder.Body.String(), "multiple AgentHub sessions") {
		t.Fatalf("expected duplicate source failure, got %d %s", recorder.Code, recorder.Body.String())
	}
	runs, err := loadAgentRuns(workspace.Path)
	if err != nil || len(runs) != 1 {
		t.Fatalf("conflicted run projection missing: runs=%#v err=%v", runs, err)
	}
	if runs[0].Status != "recovering" || runs[0].ForgeSessionID == "" {
		t.Fatalf("duplicate conflict did not conservatively retain lock projection: %#v", runs[0])
	}
	if _, err := os.Stat(runs[0].ForgeSessionContextPath); err != nil {
		t.Fatalf("Forge session context was removed after ambiguous conflict: %v", err)
	}
}

func TestAgentHubRunDetailOmitsEventsAndNoticeKeepsEnvelope(t *testing.T) {
	workspace := guiWorkspace{ID: "workspace-one", Path: t.TempDir()}
	configPath := filepath.Join(t.TempDir(), "gui.json")
	writeCurrentTestConfig(t, configPath, workspace.Path)
	manager := newAgentManager(&server{config: configPath})
	canonical := agentHubEvent{
		ID: 7, Time: "2026-07-27T00:00:00Z", Type: "tool.event",
		SessionID: "ses_canonical", TurnID: "turn_one",
		Data: json.RawMessage(`{"method":"item/started","raw":{"item":{"id":"call_one","type":"commandExecution"}}}`),
	}
	rt := &agentRuntime{
		workspace: workspace,
		run: agentRun{
			ID: "run-one", WorkspaceID: workspace.ID, AgentHubSessionID: canonical.SessionID,
			Status: "running",
		},
	}
	manager.registerRuntime(rt)

	detailRecorder := httptest.NewRecorder()
	manager.getRun(detailRecorder, httptest.NewRequest(http.MethodGet, "/runs/run-one", nil), workspace.ID, "run-one")
	if detailRecorder.Code != http.StatusOK {
		t.Fatalf("detail failed: %d %s", detailRecorder.Code, detailRecorder.Body.String())
	}
	var detail agentRunDetail
	if err := json.Unmarshal(detailRecorder.Body.Bytes(), &detail); err != nil {
		t.Fatal(err)
	}
	if detail.Run.AgentHubSessionID != canonical.SessionID || detail.Run.Status != "running" {
		t.Fatalf("detail lost run metadata: %#v", detail.Run)
	}
	// Canonical events now flow exclusively through the AgentHub proxy; the
	// detail response must not embed them.
	if strings.Contains(detailRecorder.Body.String(), `"events"`) ||
		strings.Contains(detailRecorder.Body.String(), "tool.event") {
		t.Fatalf("run detail must not embed event history: %s", detailRecorder.Body.String())
	}

	noticeRecorder := httptest.NewRecorder()
	writeForgeNoticeSSE(noticeRecorder, forgeNotice{
		Source: "forge", Type: "forge.notice", Time: canonical.Time,
		Data: forgeNoticeData{Level: "error", Method: "agenthub/recovery", Text: "synthetic"},
	})
	noticeBody := noticeRecorder.Body.String()
	if !strings.HasPrefix(noticeBody, "event: forge.notice\n") ||
		strings.Contains(noticeBody, "\nid:") ||
		!strings.Contains(noticeBody, `"source":"forge"`) {
		t.Fatalf("Forge notice did not use its independent SSE envelope: %s", noticeBody)
	}
}

func TestAgentHubRuntimeControlsAndRestartRecovery(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, configPath := newRuntimeTestManager(t, hub.URL)
	recorder, detail := startRuntimeTestRun(t, manager, workspace, `{"title":"Controls","agentName":"fake-agent"}`)
	if recorder.Code != http.StatusOK {
		t.Fatalf("start failed: %s", recorder.Body.String())
	}
	runID := detail.Run.ID

	call := func(path, body string) *httptest.ResponseRecorder {
		request := httptest.NewRequest(http.MethodPost, path, strings.NewReader(body))
		rec := httptest.NewRecorder()
		parts := strings.Split(strings.TrimPrefix(path, "/"), "/")
		manager.handle(rec, request, workspace.ID, parts[4:])
		return rec
	}
	if rec := call("/api/workspaces/"+workspace.ID+"/agent/runs/"+runID+"/input", `{"text":"hello"}`); rec.Code != http.StatusOK {
		t.Fatalf("message failed: %d %s", rec.Code, rec.Body.String())
	}
	if rec := call("/api/workspaces/"+workspace.ID+"/agent/runs/"+runID+"/input", `{"text":"steer"}`); rec.Code != http.StatusOK {
		t.Fatalf("steer failed: %d %s", rec.Code, rec.Body.String())
	}
	rt := manager.runtimeByID(runID)
	fake.mu.Lock()
	fake.appendLocked(detail.Run.AgentHubSessionID, "approval.requested", map[string]any{"approvalId": "approve-1", "method": "tool"})
	session := fake.sessions[detail.Run.AgentHubSessionID]
	session.State = "waiting_approval"
	fake.sessions[detail.Run.AgentHubSessionID] = session
	fake.mu.Unlock()
	rt.applyAgentHubSessionState(manager, session)
	if rec := call("/api/workspaces/"+workspace.ID+"/agent/runs/"+runID+"/approval", `{"requestId":"approve-1","decision":"accept"}`); rec.Code != http.StatusOK {
		t.Fatalf("approval failed: %d %s", rec.Code, rec.Body.String())
	}
	if rec := call("/api/workspaces/"+workspace.ID+"/agent/runs/"+runID+"/approval", `{"requestId":"approve-2","optionId":"option-a"}`); rec.Code != http.StatusOK {
		t.Fatalf("option approval failed: %d %s", rec.Code, rec.Body.String())
	}
	if rec := call("/api/workspaces/"+workspace.ID+"/agent/runs/"+runID+"/approval", `{"requestId":"approve-3","text":"another answer"}`); rec.Code != http.StatusOK {
		t.Fatalf("text approval failed: %d %s", rec.Code, rec.Body.String())
	}
	if rec := call("/api/workspaces/"+workspace.ID+"/agent/runs/"+runID+"/interrupt", `{}`); rec.Code != http.StatusOK {
		t.Fatalf("interrupt failed: %d %s", rec.Code, rec.Body.String())
	}
	if rec := call("/api/workspaces/"+workspace.ID+"/agent/runs/"+runID+"/stop", `{}`); rec.Code != http.StatusOK {
		t.Fatalf("stop failed: %d %s", rec.Code, rec.Body.String())
	}
	rt.mu.Lock()
	stopped := rt.run.Status
	rt.mu.Unlock()
	if stopped != "stopped" {
		t.Fatalf("run stopped without durable projection: %s", stopped)
	}
	waitForRuntimeTest(t, func() bool {
		rt.mu.Lock()
		defer rt.mu.Unlock()
		return rt.run.ForgeSessionID == ""
	})
	resumeRec := call("/api/workspaces/"+workspace.ID+"/agent/runs/"+runID+"/resume", `{}`)
	if resumeRec.Code != http.StatusOK {
		t.Fatalf("stopped resume should create a replacement Forge session: %d %s", resumeRec.Code, resumeRec.Body.String())
	}
	var resumeDetail agentRunDetail
	if err := json.Unmarshal(resumeRec.Body.Bytes(), &resumeDetail); err != nil {
		t.Fatal(err)
	}
	if resumeDetail.Run.Status != "idle" || resumeDetail.Run.AgentHubStoppedObserved ||
		resumeDetail.Run.ForgeSessionID == "" {
		t.Fatalf("stopped resume did not rebuild a live projection: %#v", resumeDetail.Run)
	}
	rt.mu.Lock()
	stopRequestedAfterResume := rt.agentHubStopRequested
	rt.mu.Unlock()
	if stopRequestedAfterResume {
		t.Fatal("successful stopped-session resume retained the stale stop-requested guard")
	}
	fake.mu.Lock()
	resumeEnvs := append([]map[string]string(nil), fake.resumeEnvironments...)
	steers := append([]bool(nil), fake.messageSteers...)
	actions := strings.Join(fake.actions, ",")
	fake.mu.Unlock()
	if len(resumeEnvs) != 1 || resumeEnvs[0]["FORGE_SESSION_ID"] != resumeDetail.Run.ForgeSessionID {
		t.Fatalf("stopped resume did not pass the replacement Forge session overlay: %#v", resumeEnvs)
	}
	if len(steers) != 2 || steers[0] || !steers[1] {
		t.Fatalf("message/steer routing mismatch: %#v", steers)
	}
	for _, expected := range []string{
		"approval:approve-1:accept",
		"approval:approve-2:option=option-a",
		"approval:approve-3:text=another answer",
		"interrupt",
		"stop",
		"resume",
	} {
		if !strings.Contains(actions, expected) {
			t.Fatalf("missing control %q in %q", expected, actions)
		}
	}

	fake.mu.Lock()
	eventsCallsBeforeRestart := fake.eventsCalls
	streamCallsBeforeRestart := fake.streamCalls
	fake.mu.Unlock()
	restartedServer := &server{config: configPath, addr: manager.server.addr}
	restarted := newAgentManager(restartedServer)
	restartedServer.agents = restarted
	if err := restarted.recoverAgentHubRuns(context.Background()); err != nil {
		t.Fatal(err)
	}
	recovered := restarted.runtimeByID(runID)
	if recovered == nil {
		t.Fatal("GUI restart did not recover AgentHub runtime")
	}
	recovered.mu.Lock()
	recoveredRun := recovered.run
	recoveredState := recovered.agentHubState
	recovered.mu.Unlock()
	if recoveredRun.Status != "idle" || recoveredRun.AgentHubStoppedObserved || recoveredState != "ready" {
		t.Fatalf("restart did not rebuild a lightweight session projection: run=%#v state=%q", recoveredRun, recoveredState)
	}
	fake.mu.Lock()
	eventsCalls := fake.eventsCalls
	streamCalls := fake.streamCalls
	fake.mu.Unlock()
	if eventsCalls != eventsCallsBeforeRestart || streamCalls != streamCallsBeforeRestart {
		t.Fatalf("restart must not read event history or open streams: before=%d/%d after=%d/%d", eventsCallsBeforeRestart, streamCallsBeforeRestart, eventsCalls, streamCalls)
	}
}

func TestNormalizeAgentHubApprovalReply(t *testing.T) {
	tests := []struct {
		name    string
		request agentApprovalRequest
		want    agentHubApprovalReply
		wantErr bool
	}{
		{name: "decision", request: agentApprovalRequest{Decision: "accept"}, want: agentHubApprovalReply{Decision: "accept"}},
		{name: "option", request: agentApprovalRequest{OptionID: " option-a "}, want: agentHubApprovalReply{OptionID: "option-a"}},
		{name: "text", request: agentApprovalRequest{Text: " another answer "}, want: agentHubApprovalReply{Text: "another answer"}},
		{name: "missing", request: agentApprovalRequest{}, wantErr: true},
		{name: "combined", request: agentApprovalRequest{Decision: "accept", OptionID: "option-a"}, wantErr: true},
		{name: "unknown decision", request: agentApprovalRequest{Decision: "yes"}, wantErr: true},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			got, err := normalizeAgentHubApprovalReply(test.request)
			if test.wantErr {
				if err == nil {
					t.Fatalf("expected error, got %#v", got)
				}
				return
			}
			if err != nil || got != test.want {
				t.Fatalf("got %#v, %v; want %#v", got, err, test.want)
			}
		})
	}
}

func TestAgentHubStopRetainsForgeLockUntilDurableStopped(t *testing.T) {
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
	rec, detail := startRuntimeTestRun(t, manager, workspace, `{"agentName":"fake-agent","resourceId":"project1.task1","prompt":"work"}`)
	if rec.Code != http.StatusOK {
		t.Fatalf("start failed: %s", rec.Body.String())
	}
	rt := manager.runtimeByID(detail.Run.ID)
	stopReq := httptest.NewRequest(http.MethodPost, "/stop", strings.NewReader(`{}`))
	stopRec := httptest.NewRecorder()
	manager.stopAgentHubRun(stopRec, stopReq, rt)
	if stopRec.Code != http.StatusBadGateway {
		t.Fatalf("stop without durable stopped should fail closed, got %d: %s", stopRec.Code, stopRec.Body.String())
	}
	if sessions := testForgeSessions(t, workspace.Path); len(sessions) != 1 {
		t.Fatalf("Forge session ended while AgentHub was only stopping: %#v", sessions)
	}
	rt.mu.Lock()
	if rt.run.ForgeSessionID == "" {
		rt.mu.Unlock()
		t.Fatal("Forge session id cleared before durable stopped")
	}
	sessionID := rt.run.AgentHubSessionID
	rt.mu.Unlock()

	fake.mu.Lock()
	fake.appendLocked(sessionID, "session.state", map[string]any{"state": "stopped", "reason": "provider-exited"})
	session := fake.sessions[sessionID]
	session.State = "stopped"
	session.StopReason = "provider-exited"
	fake.sessions[sessionID] = session
	fake.mu.Unlock()
	if err := manager.pollAgentHubSessions(context.Background()); err != nil {
		t.Fatal(err)
	}
	waitForRuntimeTest(t, func() bool {
		rt.mu.Lock()
		defer rt.mu.Unlock()
		return rt.run.ForgeSessionID == ""
	})
	if sessions := testForgeSessions(t, workspace.Path); len(sessions) != 0 {
		t.Fatalf("durable stopped did not release Forge session: %#v", sessions)
	}
}

func closeRuntimeTestRun(t *testing.T, manager *agentManager, workspace guiWorkspace, runID string) *httptest.ResponseRecorder {
	t.Helper()
	response := httptest.NewRecorder()
	manager.handle(response, httptest.NewRequest(http.MethodPost, "/stop", strings.NewReader(`{}`)), workspace.ID, []string{"runs", runID, "stop"})
	return response
}

func decodeAgentHubStopResponse(t *testing.T, response *httptest.ResponseRecorder) (string, bool, bool) {
	t.Helper()
	var payload struct {
		Status           string `json:"status"`
		AutoRunPaused    bool   `json:"autoRunPaused"`
		AutoRunCancelled bool   `json:"autoRunCancelled"`
	}
	if err := json.Unmarshal(response.Body.Bytes(), &payload); err != nil {
		t.Fatalf("decode stop response: %v; body=%s", err, response.Body.String())
	}
	return payload.Status, payload.AutoRunPaused, payload.AutoRunCancelled
}

func TestAgentHubCloseCancelsRunningAutoRunBeforeStop(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	observedState := make(chan string, 1)
	fake.stopHook = func(_ string) {
		forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
		if err != nil {
			observedState <- "error: " + err.Error()
			return
		}
		resource, err := forgeWorkspace.Resource("project1.task1")
		if err != nil || resource.AutoRun == nil {
			observedState <- fmt.Sprintf("error: resource=%#v err=%v", resource, err)
			return
		}
		observedState <- resource.AutoRun.State
	}
	recorder, detail := startRuntimeTestRun(t, manager, workspace, `{"agentName":"fake-agent","resourceId":"project1.task1","prompt":"generation one","schedulerTurn":true,"autoRunGeneration":1}`)
	if recorder.Code != http.StatusOK {
		t.Fatalf("start failed: %d %s", recorder.Code, recorder.Body.String())
	}
	response := closeRuntimeTestRun(t, manager, workspace, detail.Run.ID)
	if response.Code != http.StatusOK {
		t.Fatalf("close failed: %d %s", response.Code, response.Body.String())
	}
	status, autoRunPaused, autoRunCancelled := decodeAgentHubStopResponse(t, response)
	if status != "stopped" || autoRunPaused || !autoRunCancelled {
		t.Fatalf("close response = status %q autoRunPaused=%v autoRunCancelled=%v; body=%s", status, autoRunPaused, autoRunCancelled, response.Body.String())
	}
	if state := <-observedState; state != "cancelled" {
		t.Fatalf("AgentHub Stop observed AutoRun state %q; want cancelled", state)
	}
	forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		t.Fatal(err)
	}
	resource, err := forgeWorkspace.Resource("project1.task1")
	if err != nil {
		t.Fatal(err)
	}
	if resource.AutoRun == nil || resource.AutoRun.State != "cancelled" {
		t.Fatalf("close did not persist the AutoRun cancellation: %#v", resource.AutoRun)
	}
	if !hasAutoRunLog(resource.Logs, "Auto Run cancelled", userClosedAutoRunSessionReason) {
		t.Fatalf("close cancellation was not recorded: %#v", resource.Logs)
	}
	fake.mu.Lock()
	actions := append([]string(nil), fake.actions...)
	fake.mu.Unlock()
	if strings.Count(strings.Join(actions, ","), "stop") != 1 {
		t.Fatalf("close repeated AgentHub Stop: %v", actions)
	}
	waitForRuntimeTest(t, func() bool { return len(testForgeSessions(t, workspace.Path)) == 0 })
}

func TestAgentHubCloseCancelsSuspendedAutoRun(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	recorder, detail := startRuntimeTestRun(t, manager, workspace, `{"agentName":"fake-agent","resourceId":"project1.task1","prompt":"generation one","schedulerTurn":true,"autoRunGeneration":1}`)
	if recorder.Code != http.StatusOK {
		t.Fatalf("start failed: %d %s", recorder.Code, recorder.Body.String())
	}
	forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := forgeWorkspace.SuspendAutoRun(app.AutoRunActionInput{TaskID: "project1.task1", Summary: "waiting for an external event"}); err != nil {
		t.Fatal(err)
	}
	rt := manager.runtimeByID(detail.Run.ID)
	fake.mu.Lock()
	session := fake.sessions[detail.Run.AgentHubSessionID]
	session.State = "ready"
	fake.sessions[session.ID] = session
	fake.mu.Unlock()
	rt.applyAgentHubSessionState(manager, session)
	waitForRuntimeTest(t, func() bool {
		run := pollerRunState(rt)
		return run.Status == "idle" && !run.SchedulerTurn
	})
	response := closeRuntimeTestRun(t, manager, workspace, detail.Run.ID)
	if response.Code != http.StatusOK {
		t.Fatalf("close failed: %d %s", response.Code, response.Body.String())
	}
	_, autoRunPaused, autoRunCancelled := decodeAgentHubStopResponse(t, response)
	if autoRunPaused || !autoRunCancelled {
		t.Fatal("closing a suspended AutoRun session must report the cancellation transition")
	}
	resource, err := forgeWorkspace.Resource("project1.task1")
	if err != nil {
		t.Fatal(err)
	}
	if resource.AutoRun == nil || resource.AutoRun.State != "cancelled" || resource.AutoRun.SuspensionSummary != "waiting for an external event" {
		t.Fatalf("suspended AutoRun was not cancelled: %#v", resource.AutoRun)
	}
	if !hasAutoRunLog(resource.Logs, "Auto Run cancelled", userClosedAutoRunSessionReason) {
		t.Fatalf("suspended AutoRun cancellation was not logged: %#v", resource.Logs)
	}
	ready, err := forgeWorkspace.Tasks(app.TaskListOptions{ProjectID: "project1", Runnable: true})
	if err != nil {
		t.Fatal(err)
	}
	if len(ready.Runnable) != 0 {
		t.Fatalf("closed suspended AutoRun remained runnable: %#v", ready.Runnable)
	}
	waitForRuntimeTest(t, func() bool { return len(testForgeSessions(t, workspace.Path)) == 0 })
}

func TestAgentHubCloseLeavesOrdinaryChatAutoRunUnchanged(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	recorder, detail := startRuntimeTestRun(t, manager, workspace, `{"agentName":"fake-agent","resourceId":"project1.task1","prompt":"ordinary chat"}`)
	if recorder.Code != http.StatusOK {
		t.Fatalf("start failed: %d %s", recorder.Code, recorder.Body.String())
	}
	response := closeRuntimeTestRun(t, manager, workspace, detail.Run.ID)
	if response.Code != http.StatusOK {
		t.Fatalf("close failed: %d %s", response.Code, response.Body.String())
	}
	_, autoRunPaused, autoRunCancelled := decodeAgentHubStopResponse(t, response)
	if autoRunPaused || autoRunCancelled {
		t.Fatal("ordinary Chat Session close must not report an AutoRun transition")
	}
	forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		t.Fatal(err)
	}
	resource, err := forgeWorkspace.Resource("project1.task1")
	if err != nil {
		t.Fatal(err)
	}
	if resource.AutoRun == nil || resource.AutoRun.State != "queued" {
		t.Fatalf("ordinary Chat Session changed the task AutoRun state: %#v", resource.AutoRun)
	}
	if hasAutoRunLog(resource.Logs, "Auto Run cancelled", userClosedAutoRunSessionReason) {
		t.Fatal("ordinary Chat Session close recorded an AutoRun cancellation")
	}
	waitForRuntimeTest(t, func() bool { return len(testForgeSessions(t, workspace.Path)) == 0 })
}

func TestAgentHubClosePreservesTerminalAndHistoricalAutoRun(t *testing.T) {
	tests := []struct {
		name      string
		setup     func(*app.Workspace) error
		state     string
		gen       int
		cancelled bool
	}{
		{name: "paused", state: "cancelled", gen: 1, cancelled: true, setup: func(workspace *app.Workspace) error {
			_, err := workspace.PauseAutoRun(app.AutoRunActionInput{TaskID: "project1.task1", Summary: "already paused"})
			return err
		}},
		{name: "completed", state: "completed", gen: 1, setup: func(workspace *app.Workspace) error {
			_, err := workspace.CompleteAutoRun(app.AutoRunActionInput{TaskID: "project1.task1"})
			return err
		}},
		{name: "failed", state: "failed", gen: 1, setup: func(workspace *app.Workspace) error {
			_, err := workspace.FailAutoRun(app.AutoRunActionInput{TaskID: "project1.task1"})
			return err
		}},
		{name: "historical generation", state: "queued", gen: 2, setup: func(workspace *app.Workspace) error {
			if _, err := workspace.CompleteAutoRun(app.AutoRunActionInput{TaskID: "project1.task1"}); err != nil {
				return err
			}
			_, err := workspace.QueueAutoRun(app.AutoRunQueueInput{TaskID: "project1.task1"})
			return err
		}},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			fake := newRuntimeFakeAgentHub()
			hub := httptest.NewServer(fake)
			defer hub.Close()
			manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
			recorder, detail := startRuntimeTestRun(t, manager, workspace, `{"agentName":"fake-agent","resourceId":"project1.task1","prompt":"generation one","schedulerTurn":true,"autoRunGeneration":1}`)
			if recorder.Code != http.StatusOK {
				t.Fatalf("start failed: %d %s", recorder.Code, recorder.Body.String())
			}
			forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
			if err != nil {
				t.Fatal(err)
			}
			if err := test.setup(forgeWorkspace); err != nil {
				t.Fatal(err)
			}
			response := closeRuntimeTestRun(t, manager, workspace, detail.Run.ID)
			if response.Code != http.StatusOK {
				t.Fatalf("close failed: %d %s", response.Code, response.Body.String())
			}
			_, autoRunPaused, autoRunCancelled := decodeAgentHubStopResponse(t, response)
			if autoRunPaused || autoRunCancelled != test.cancelled {
				t.Fatalf("unexpected close transition: paused=%v cancelled=%v want cancelled=%v", autoRunPaused, autoRunCancelled, test.cancelled)
			}
			resource, err := forgeWorkspace.Resource("project1.task1")
			if err != nil {
				t.Fatal(err)
			}
			if resource.AutoRun == nil || resource.AutoRun.State != test.state || resource.AutoRun.Generation != test.gen {
				t.Fatalf("close changed the current AutoRun generation: %#v", resource.AutoRun)
			}
			if test.cancelled {
				if !hasAutoRunLog(resource.Logs, "Auto Run cancelled", userClosedAutoRunSessionReason) {
					t.Fatal("close did not record cancellation for the paused generation")
				}
			} else if hasAutoRunLog(resource.Logs, "Auto Run cancelled", userClosedAutoRunSessionReason) {
				t.Fatal("close recorded a cancellation for a terminal or historical generation")
			}
			waitForRuntimeTest(t, func() bool { return len(testForgeSessions(t, workspace.Path)) == 0 })
		})
	}
}

func TestAgentHubClosePauseFailureDoesNotStopSession(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	recorder, detail := startRuntimeTestRun(t, manager, workspace, `{"agentName":"fake-agent","resourceId":"project1.task1","prompt":"generation one","schedulerTurn":true,"autoRunGeneration":1}`)
	if recorder.Code != http.StatusOK {
		t.Fatalf("start failed: %d %s", recorder.Code, recorder.Body.String())
	}
	forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		t.Fatal(err)
	}
	resource, err := forgeWorkspace.ResourceValue("project1.task1")
	if err != nil {
		t.Fatal(err)
	}
	lockPath := filepath.Join(workspace.Path, filepath.FromSlash(resource.Path), ".forge", "autorun.lock")
	if err := os.Remove(lockPath); err != nil {
		t.Fatal(err)
	}
	if err := os.Mkdir(lockPath, 0o755); err != nil {
		t.Fatal(err)
	}
	response := closeRuntimeTestRun(t, manager, workspace, detail.Run.ID)
	if response.Code != http.StatusConflict || !strings.Contains(response.Body.String(), "cancel AutoRun before closing session") {
		t.Fatalf("cancel failure should block close, got %d %s", response.Code, response.Body.String())
	}
	fake.mu.Lock()
	actions := append([]string(nil), fake.actions...)
	fake.mu.Unlock()
	if strings.Contains(strings.Join(actions, ","), "stop") {
		t.Fatalf("AgentHub Stop was sent after AutoRun cancellation failure: %v", actions)
	}
	if run := pollerRunState(manager.runtimeByID(detail.Run.ID)); run.Status == "stopping" || run.Status == "stopped" {
		t.Fatalf("cancel failure changed the run to a stopping/terminal state: %#v", run)
	}
	if err := os.Remove(lockPath); err != nil {
		t.Fatal(err)
	}
	if file, err := os.OpenFile(lockPath, os.O_CREATE|os.O_RDWR, 0o644); err != nil {
		t.Fatal(err)
	} else {
		file.Close()
	}
	if response := closeRuntimeTestRun(t, manager, workspace, detail.Run.ID); response.Code != http.StatusOK {
		t.Fatalf("cleanup close failed after restoring AutoRun lock: %d %s", response.Code, response.Body.String())
	}
	waitForRuntimeTest(t, func() bool { return len(testForgeSessions(t, workspace.Path)) == 0 })
}

func TestAgentHubCloseAmbiguousStopCancelsOnceAndDoesNotRetry(t *testing.T) {
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
	recorder, detail := startRuntimeTestRun(t, manager, workspace, `{"agentName":"fake-agent","resourceId":"project1.task1","prompt":"generation one","schedulerTurn":true,"autoRunGeneration":1}`)
	if recorder.Code != http.StatusOK {
		t.Fatalf("start failed: %d %s", recorder.Code, recorder.Body.String())
	}
	response := closeRuntimeTestRun(t, manager, workspace, detail.Run.ID)
	if response.Code != http.StatusBadGateway || !strings.Contains(response.Body.String(), "AutoRun was cancelled") {
		t.Fatalf("ambiguous close should retain cancelled recovery state, got %d %s", response.Code, response.Body.String())
	}
	forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		t.Fatal(err)
	}
	resource, err := forgeWorkspace.Resource("project1.task1")
	if err != nil {
		t.Fatal(err)
	}
	if resource.AutoRun == nil || resource.AutoRun.State != "cancelled" {
		t.Fatalf("ambiguous close did not durably cancel AutoRun: %#v", resource.AutoRun)
	}
	retry := closeRuntimeTestRun(t, manager, workspace, detail.Run.ID)
	if retry.Code != http.StatusConflict || !strings.Contains(retry.Body.String(), "was not retried") {
		t.Fatalf("ambiguous close retry should be rejected, got %d %s", retry.Code, retry.Body.String())
	}
	fake.mu.Lock()
	actions := append([]string(nil), fake.actions...)
	fake.mu.Unlock()
	if strings.Count(strings.Join(actions, ","), "stop") != 1 {
		t.Fatalf("ambiguous close repeated AgentHub Stop: %v", actions)
	}
	fake.mu.Lock()
	session := fake.sessions[detail.Run.AgentHubSessionID]
	session.State = "stopped"
	session.StopReason = "provider-exited"
	fake.sessions[session.ID] = session
	fake.appendLocked(session.ID, "session.state", map[string]any{"state": "stopped", "reason": "provider-exited"})
	fake.mu.Unlock()
	if err := manager.pollAgentHubSessions(context.Background()); err != nil {
		t.Fatal(err)
	}
	waitForRuntimeTest(t, func() bool { return len(testForgeSessions(t, workspace.Path)) == 0 })
}

func TestAgentHubCloseDuplicateClicksSendOneStop(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	recorder, detail := startRuntimeTestRun(t, manager, workspace, `{"agentName":"fake-agent","resourceId":"project1.task1","prompt":"generation one","schedulerTurn":true,"autoRunGeneration":1}`)
	if recorder.Code != http.StatusOK {
		t.Fatalf("start failed: %d %s", recorder.Code, recorder.Body.String())
	}
	entered := make(chan struct{})
	release := make(chan struct{})
	var hookOnce sync.Once
	fake.stopHook = func(_ string) {
		hookOnce.Do(func() { close(entered) })
		<-release
	}
	responses := make(chan *httptest.ResponseRecorder, 2)
	for range 2 {
		go func() { responses <- closeRuntimeTestRun(t, manager, workspace, detail.Run.ID) }()
	}
	select {
	case <-entered:
	case <-time.After(time.Second):
		close(release)
		t.Fatal("duplicate close did not reach AgentHub Stop")
	}
	close(release)
	first := <-responses
	second := <-responses
	if first.Code != http.StatusOK || second.Code != http.StatusOK {
		t.Fatalf("duplicate close responses = %d and %d; bodies=%s / %s", first.Code, second.Code, first.Body.String(), second.Body.String())
	}
	fake.mu.Lock()
	actions := append([]string(nil), fake.actions...)
	fake.mu.Unlock()
	if strings.Count(strings.Join(actions, ","), "stop") != 1 {
		t.Fatalf("duplicate close repeated AgentHub Stop: %v", actions)
	}
	waitForRuntimeTest(t, func() bool { return len(testForgeSessions(t, workspace.Path)) == 0 })
}

func TestAgentHubInterruptPausesAutoRunAndRetainsSession(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	recorder, detail := startRuntimeTestRun(t, manager, workspace, `{"agentName":"fake-agent","resourceId":"project1.task1","prompt":"generation one","schedulerTurn":true,"autoRunGeneration":1}`)
	if recorder.Code != http.StatusOK {
		t.Fatalf("start failed: %d %s", recorder.Code, recorder.Body.String())
	}
	runID := detail.Run.ID
	request := httptest.NewRequest(http.MethodPost, "/interrupt", strings.NewReader(`{}`))
	response := httptest.NewRecorder()
	manager.handle(response, request, workspace.ID, []string{"runs", runID, "interrupt"})
	if response.Code != http.StatusOK {
		t.Fatalf("interrupt failed: %d %s", response.Code, response.Body.String())
	}
	rt := manager.runtimeByID(runID)
	waitForRuntimeTest(t, func() bool {
		run := pollerRunState(rt)
		return run.Status == "idle" && !run.SchedulerTurn
	})
	run := pollerRunState(rt)
	if run.ForgeSessionID == "" || run.AgentHubStoppedObserved {
		t.Fatalf("Stop Turn must retain the live Forge session: %#v", run)
	}
	forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		t.Fatal(err)
	}
	resource, err := forgeWorkspace.Resource("project1.task1")
	if err != nil {
		t.Fatal(err)
	}
	if resource.AutoRun == nil || resource.AutoRun.State != "paused" || resource.AutoRun.SuspensionSummary != "" {
		t.Fatalf("Stop Turn did not pause the active AutoRun generation: %#v", resource.AutoRun)
	}
	if !hasAutoRunLog(resource.Logs, "Auto Run paused", userStoppedActiveTurnReason) {
		t.Fatalf("Stop Turn pause was not recorded: %#v", resource.Logs)
	}
	if sessions := testForgeSessions(t, workspace.Path); len(sessions) != 1 || len(sessions[0].Controls) != 1 {
		t.Fatalf("Stop Turn released the Forge Session or task lock: %#v", sessions)
	}
	fake.mu.Lock()
	actions := strings.Join(fake.actions, ",")
	events := append([]agentHubEvent(nil), fake.events[detail.Run.AgentHubSessionID]...)
	fake.mu.Unlock()
	if strings.Contains(actions, "stop") || strings.Count(actions, "interrupt") != 1 {
		t.Fatalf("Stop Turn used the wrong AgentHub action or retried: %q", actions)
	}
	messageCount := 0
	for _, event := range events {
		if event.Type == "message.user" {
			messageCount++
		}
	}
	if messageCount != 1 {
		t.Fatalf("paused AutoRun was immediately continued: %d user messages in %#v", messageCount, events)
	}
}

func TestAgentHubInterruptAllowsWaitingApproval(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	recorder, detail := startRuntimeTestRun(t, manager, workspace, `{"agentName":"fake-agent","resourceId":"project1.task1"}`)
	if recorder.Code != http.StatusOK {
		t.Fatalf("start failed: %d %s", recorder.Code, recorder.Body.String())
	}
	rt := manager.runtimeByID(detail.Run.ID)
	fake.mu.Lock()
	session := fake.sessions[detail.Run.AgentHubSessionID]
	session.State = "waiting_approval"
	fake.sessions[session.ID] = session
	fake.mu.Unlock()
	rt.applyAgentHubSessionState(manager, session)
	response := httptest.NewRecorder()
	manager.handle(response, httptest.NewRequest(http.MethodPost, "/interrupt", strings.NewReader(`{}`)), workspace.ID, []string{"runs", detail.Run.ID, "interrupt"})
	if response.Code != http.StatusOK {
		t.Fatalf("waiting approval interrupt failed: %d %s", response.Code, response.Body.String())
	}
	if run := pollerRunState(rt); run.Status != "idle" || run.ForgeSessionID == "" {
		t.Fatalf("waiting approval interrupt did not preserve the Session: %#v", run)
	}
	fake.mu.Lock()
	actions := strings.Join(fake.actions, ",")
	fake.mu.Unlock()
	if strings.Count(actions, "interrupt") != 1 || strings.Contains(actions, "stop") {
		t.Fatalf("waiting approval used an unexpected action sequence: %q", actions)
	}
	if closeResponse := closeRuntimeTestRun(t, manager, workspace, detail.Run.ID); closeResponse.Code != http.StatusOK {
		t.Fatalf("test cleanup close failed: %d %s", closeResponse.Code, closeResponse.Body.String())
	}
	waitForRuntimeTest(t, func() bool { return len(testForgeSessions(t, workspace.Path)) == 0 })
}

func TestAgentHubInterruptDoesNotChangeAutoRunForChatTurn(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := forgeWorkspace.StartAutoRun("project1.task1"); err != nil {
		t.Fatal(err)
	}
	recorder, detail := startRuntimeTestRun(t, manager, workspace, `{"agentName":"fake-agent","resourceId":"project1.task1","prompt":"ordinary turn"}`)
	if recorder.Code != http.StatusOK {
		t.Fatalf("start failed: %d %s", recorder.Code, recorder.Body.String())
	}
	response := httptest.NewRecorder()
	manager.handle(response, httptest.NewRequest(http.MethodPost, "/interrupt", strings.NewReader(`{}`)), workspace.ID, []string{"runs", detail.Run.ID, "interrupt"})
	if response.Code != http.StatusOK {
		t.Fatalf("ordinary interrupt failed: %d %s", response.Code, response.Body.String())
	}
	run := pollerRunState(manager.runtimeByID(detail.Run.ID))
	if run.SchedulerTurn || run.ForgeSessionID == "" {
		t.Fatalf("ordinary Chat Stop Turn changed scheduler/session state: %#v", run)
	}
	resource, err := forgeWorkspace.Resource("project1.task1")
	if err != nil {
		t.Fatal(err)
	}
	if resource.AutoRun == nil || resource.AutoRun.State != "running" {
		t.Fatalf("ordinary Chat Stop Turn changed AutoRun state: %#v", resource.AutoRun)
	}
	if hasAutoRunLog(resource.Logs, "Auto Run paused", userStoppedActiveTurnReason) {
		t.Fatal("ordinary Chat Stop Turn recorded an AutoRun pause")
	}
}

func TestAgentHubInterruptRejectsStaleStateAndDuplicateClicks(t *testing.T) {
	t.Run("idle state", func(t *testing.T) {
		fake := newRuntimeFakeAgentHub()
		hub := httptest.NewServer(fake)
		defer hub.Close()
		manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
		recorder, detail := startRuntimeTestRun(t, manager, workspace, `{"agentName":"fake-agent","resourceId":"project1.task1"}`)
		if recorder.Code != http.StatusOK {
			t.Fatalf("start failed: %d %s", recorder.Code, recorder.Body.String())
		}
		response := httptest.NewRecorder()
		manager.handle(response, httptest.NewRequest(http.MethodPost, "/interrupt", strings.NewReader(`{}`)), workspace.ID, []string{"runs", detail.Run.ID, "interrupt"})
		if response.Code != http.StatusConflict || !strings.Contains(response.Body.String(), "not interruptible") {
			t.Fatalf("idle interrupt should be a conflict, got %d %s", response.Code, response.Body.String())
		}
		fake.mu.Lock()
		actions := strings.Join(fake.actions, ",")
		fake.mu.Unlock()
		if strings.Contains(actions, "interrupt") {
			t.Fatalf("stale idle interrupt reached AgentHub: %q", actions)
		}
	})

	t.Run("duplicate clicks", func(t *testing.T) {
		fake := newRuntimeFakeAgentHub()
		hub := httptest.NewServer(fake)
		defer hub.Close()
		manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
		recorder, detail := startRuntimeTestRun(t, manager, workspace, `{"agentName":"fake-agent","resourceId":"project1.task1","prompt":"work"}`)
		if recorder.Code != http.StatusOK {
			t.Fatalf("start failed: %d %s", recorder.Code, recorder.Body.String())
		}
		codes := make(chan int, 2)
		var wg sync.WaitGroup
		for index := 0; index < 2; index++ {
			wg.Add(1)
			go func() {
				defer wg.Done()
				response := httptest.NewRecorder()
				manager.handle(response, httptest.NewRequest(http.MethodPost, "/interrupt", strings.NewReader(`{}`)), workspace.ID, []string{"runs", detail.Run.ID, "interrupt"})
				codes <- response.Code
			}()
		}
		wg.Wait()
		close(codes)
		successes, conflicts := 0, 0
		for code := range codes {
			switch code {
			case http.StatusOK:
				successes++
			case http.StatusConflict:
				conflicts++
			default:
				t.Fatalf("duplicate interrupt returned unexpected status %d", code)
			}
		}
		if successes != 1 || conflicts != 1 {
			t.Fatalf("duplicate interrupt results = success %d, conflict %d", successes, conflicts)
		}
		fake.mu.Lock()
		actions := strings.Join(fake.actions, ",")
		fake.mu.Unlock()
		if strings.Count(actions, "interrupt") != 1 {
			t.Fatalf("duplicate clicks repeated AgentHub interrupt: %q", actions)
		}
	})
}

func TestAgentHubInterruptFailureRetainsSessionWithoutRetry(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	fake.failNextInterrupt = true
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	recorder, detail := startRuntimeTestRun(t, manager, workspace, `{"agentName":"fake-agent","resourceId":"project1.task1","prompt":"work"}`)
	if recorder.Code != http.StatusOK {
		t.Fatalf("start failed: %d %s", recorder.Code, recorder.Body.String())
	}
	response := httptest.NewRecorder()
	manager.handle(response, httptest.NewRequest(http.MethodPost, "/interrupt", strings.NewReader(`{}`)), workspace.ID, []string{"runs", detail.Run.ID, "interrupt"})
	if response.Code != http.StatusBadGateway {
		t.Fatalf("ambiguous interrupt should fail with bad gateway, got %d %s", response.Code, response.Body.String())
	}
	run := pollerRunState(manager.runtimeByID(detail.Run.ID))
	if run.Status != "recovering" || run.ForgeSessionID == "" {
		t.Fatalf("ambiguous interrupt did not retain a recovering Session: %#v", run)
	}
	if sessions := testForgeSessions(t, workspace.Path); len(sessions) != 1 {
		t.Fatalf("ambiguous interrupt released the Forge Session: %#v", sessions)
	}
	fake.mu.Lock()
	actions := strings.Join(fake.actions, ",")
	fake.mu.Unlock()
	if strings.Contains(actions, "interrupt") || strings.Contains(actions, "stop") {
		t.Fatalf("ambiguous interrupt was retried or closed: %q", actions)
	}
}

func TestAgentHubInterruptRejectsMismatchedSource(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	recorder, detail := startRuntimeTestRun(t, manager, workspace, `{"agentName":"fake-agent","resourceId":"project1.task1","prompt":"work"}`)
	if recorder.Code != http.StatusOK {
		t.Fatalf("start failed: %d %s", recorder.Code, recorder.Body.String())
	}
	fake.mu.Lock()
	session := fake.sessions[detail.Run.AgentHubSessionID]
	session.Source = &agentHubSource{App: agentHubSourceApp, InstanceID: "forge-runtime-test", ExternalID: "another-run"}
	fake.sessions[session.ID] = session
	fake.mu.Unlock()
	response := httptest.NewRecorder()
	manager.handle(response, httptest.NewRequest(http.MethodPost, "/interrupt", strings.NewReader(`{}`)), workspace.ID, []string{"runs", detail.Run.ID, "interrupt"})
	if response.Code != http.StatusConflict || !strings.Contains(response.Body.String(), "does not belong") {
		t.Fatalf("mismatched source should be rejected, got %d %s", response.Code, response.Body.String())
	}
	fake.mu.Lock()
	actions := strings.Join(fake.actions, ",")
	fake.mu.Unlock()
	if strings.Contains(actions, "interrupt") {
		t.Fatalf("mismatched source reached AgentHub: %q", actions)
	}
}

func hasAutoRunLog(logs []app.LogEntry, title, details string) bool {
	for _, entry := range logs {
		if entry.Title == title && entry.Details == details {
			return true
		}
	}
	return false
}

func TestAgentHubAutoRunRetryUsesMissingStateReason(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	rec, detail := startRuntimeTestRun(t, manager, workspace, `{"agentName":"fake-agent","resourceId":"project1.task1","prompt":"generation one","schedulerTurn":true,"autoRunGeneration":1}`)
	if rec.Code != http.StatusOK {
		t.Fatalf("start failed: %s", rec.Body.String())
	}
	sessionID := detail.Run.AgentHubSessionID
	fake.mu.Lock()
	fake.appendLocked(sessionID, "turn.completed", map[string]any{"summary": "stale turn summary"})
	session := fake.sessions[sessionID]
	session.State = "ready"
	fake.sessions[sessionID] = session
	fake.mu.Unlock()
	if err := manager.pollAgentHubSessions(context.Background()); err != nil {
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
	forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		t.Fatal(err)
	}
	resource, err := forgeWorkspace.Resource("project1.task1")
	if err != nil {
		t.Fatal(err)
	}
	foundReason := false
	for _, entry := range resource.Logs {
		if entry.Title == "Auto Run retry" && entry.Details == "agent did not set AutoRun state" {
			foundReason = true
		}
		if strings.Contains(entry.Details, "stale turn summary") {
			t.Fatalf("AutoRun retry reused the previous turn summary: %#v", entry)
		}
	}
	if !foundReason {
		t.Fatalf("AutoRun retry reason was not persisted: %#v", resource.Logs)
	}
}

func TestAgentHubAutoRunTerminalRetainsSession(t *testing.T) {
	for _, terminalState := range []string{"completed", "failed"} {
		t.Run(terminalState, func(t *testing.T) {
			fake := newRuntimeFakeAgentHub()
			hub := httptest.NewServer(fake)
			defer hub.Close()
			manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
			rec, detail := startRuntimeTestRun(t, manager, workspace, `{"agentName":"fake-agent","resourceId":"project1.task1","prompt":"generation one","schedulerTurn":true,"autoRunGeneration":1}`)
			if rec.Code != http.StatusOK {
				t.Fatalf("start failed: %s", rec.Body.String())
			}
			rt := manager.runtimeByID(detail.Run.ID)
			sessionID := detail.Run.AgentHubSessionID
			forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
			if err != nil {
				t.Fatal(err)
			}
			if _, err := forgeWorkspace.PauseAutoRun(app.AutoRunActionInput{TaskID: "project1.task1", Reason: "wait for the next turn"}); err != nil {
				t.Fatal(err)
			}
			fake.mu.Lock()
			fake.appendLocked(sessionID, "turn.completed", map[string]any{"summary": "waiting"})
			session := fake.sessions[sessionID]
			session.State = "ready"
			fake.sessions[sessionID] = session
			fake.mu.Unlock()
			if err := manager.pollAgentHubSessions(context.Background()); err != nil {
				t.Fatal(err)
			}
			waitForRuntimeTest(t, func() bool {
				rt.mu.Lock()
				defer rt.mu.Unlock()
				return rt.run.Status == "idle" && !rt.run.SchedulerTurn
			})

			if _, err := forgeWorkspace.ResumeAutoRun("project1.task1"); err != nil {
				t.Fatal(err)
			}
			inputReq := httptest.NewRequest(http.MethodPost, "/input", strings.NewReader(`{"text":"resume generation","schedulerTurn":true,"autoRunGeneration":1}`))
			inputRec := httptest.NewRecorder()
			manager.sendAgentHubInput(inputRec, inputReq, rt, agentInputRequest{
				Text: "resume generation", SchedulerTurn: true, AutoRunGeneration: 1,
			}, "resume generation")
			if inputRec.Code != http.StatusOK {
				t.Fatalf("resume failed: %d %s", inputRec.Code, inputRec.Body.String())
			}
			forgeWorkspace, err = app.OpenWorkspace(workspace.Path)
			if err != nil {
				t.Fatal(err)
			}
			if terminalState == "completed" {
				if _, err := forgeWorkspace.CompleteAutoRun(app.AutoRunActionInput{TaskID: "project1.task1", Summary: terminalState}); err != nil {
					t.Fatal(err)
				}
			} else if _, err := forgeWorkspace.FailAutoRun(app.AutoRunActionInput{TaskID: "project1.task1", Summary: terminalState}); err != nil {
				t.Fatal(err)
			}
			fake.mu.Lock()
			eventType := "turn.completed"
			if terminalState == "failed" {
				eventType = "turn.failed"
			}
			fake.appendLocked(sessionID, eventType, map[string]any{"summary": terminalState})
			session = fake.sessions[sessionID]
			session.State = "ready"
			fake.sessions[sessionID] = session
			fake.mu.Unlock()
			if err := manager.pollAgentHubSessions(context.Background()); err != nil {
				t.Fatal(err)
			}
			waitForRuntimeTest(t, func() bool {
				rt.mu.Lock()
				defer rt.mu.Unlock()
				return rt.run.Status == "idle" && !rt.run.SchedulerTurn
			})
			rt.mu.Lock()
			forgeSessionID := rt.run.ForgeSessionID
			rt.mu.Unlock()
			if forgeSessionID == "" {
				t.Fatalf("terminal AutoRun changed Forge session id: %q", forgeSessionID)
			}
			fake.mu.Lock()
			created := fake.nextSession
			launchID := fake.sessions[sessionID].LaunchEnvironment["FORGE_SESSION_ID"]
			actions := strings.Join(fake.actions, ",")
			fake.mu.Unlock()
			if created != 1 || launchID != forgeSessionID {
				t.Fatalf("terminal AutoRun changed session identity: created=%d launch=%q forge=%q", created, launchID, forgeSessionID)
			}
			if strings.Contains(actions, "stop") {
				t.Fatalf("terminal AutoRun stopped AgentHub: %s", actions)
			}
			if sessions := testForgeSessions(t, workspace.Path); len(sessions) != 1 {
				t.Fatalf("terminal AutoRun released the Forge session: %#v", sessions)
			}
		})
	}
}

func TestAgentHubCrashRecoveryAndRepeatedDispatchCreateExactlyOnce(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	cfg, client, err := manager.agentHubRuntimeConfig()
	if err != nil {
		t.Fatal(err)
	}
	run := agentRun{
		ID: "run-crashed", WorkspaceID: workspace.ID, ResourceID: "project1.task1",
		AgentHubAgentName: "fake-agent",
		SourceExternalID:  workspace.ID + "/run-crashed", ForgeSessionID: "session-test",
		Title: "Recovered AutoRun", Cwd: workspace.Path, Status: "starting",
		SchedulerTurn: true, AutoRunGeneration: 4, PendingInitialMessage: "recover after SIGKILL",
		CreatedAt: time.Now().Format(time.RFC3339), UpdatedAt: time.Now().Format(time.RFC3339),
	}
	run.ForgeSessionID = seedTestForgeSession(t, workspace, run.SourceExternalID)
	if err := saveAgentRun(workspace.Path, run); err != nil {
		t.Fatal(err)
	}
	// This models a GUI/SIGKILL after persisting the Forge session and run
	// projection but before receiving AgentHub's create response. A nil
	// candidate list makes recovery query the session by source.
	if err := manager.recoverAgentHubRun(context.Background(), cfg, client, workspace, run, nil); err != nil {
		t.Fatal(err)
	}
	first := manager.runtimeByID(run.ID)
	if first == nil {
		t.Fatal("recovery did not register the runtime")
	}
	manager.removeRuntime(run.ID)
	reloaded, err := loadAgentRuns(workspace.Path)
	if err != nil || len(reloaded) != 1 {
		t.Fatalf("reload projection: runs=%#v err=%v", reloaded, err)
	}
	// A repeated scheduler/recovery pass must reconcile by full source and
	// attach the same AgentHub session instead of creating another one.
	if err := manager.recoverAgentHubRun(context.Background(), cfg, client, workspace, reloaded[0], nil); err != nil {
		t.Fatal(err)
	}
	if manager.runtimeByID(run.ID) == nil {
		t.Fatal("repeated recovery did not register the runtime")
	}
	fake.mu.Lock()
	defer fake.mu.Unlock()
	if fake.nextSession != 1 {
		t.Fatalf("repeated recovery created %d AgentHub sessions", fake.nextSession)
	}
	session := fake.sessions["ses_1"]
	if session.Source == nil || session.Source.App != "forge" || session.Source.InstanceID != cfg.AgentHubInstanceID ||
		session.Source.ExternalID != run.SourceExternalID {
		t.Fatalf("recovery used the wrong source: %#v", session.Source)
	}
	if session.LaunchEnvironment["FORGE_SESSION_ID"] != run.ForgeSessionID {
		t.Fatalf("recovery changed launchEnvironment: %#v", session.LaunchEnvironment)
	}
}

func waitForRuntimeTest(t *testing.T, condition func() bool) {
	t.Helper()
	deadline := time.Now().Add(2 * time.Second)
	for time.Now().Before(deadline) {
		if condition() {
			return
		}
		time.Sleep(10 * time.Millisecond)
	}
	t.Fatal("condition was not reached before timeout")
}

func seedStoppedResumeRun(t *testing.T, fake *runtimeFakeAgentHub, workspace guiWorkspace, run agentRun) agentRun {
	t.Helper()
	now := time.Now().Format(time.RFC3339)
	run.WorkspaceID = workspace.ID
	run.AgentHubAgentName = "fake-agent"
	run.Title = "Stopped run"
	run.Cwd = workspace.Path
	run.Status = "stopped"
	run.AgentHubStoppedObserved = true
	run.CreatedAt = now
	run.UpdatedAt = now
	if run.SourceExternalID == "" {
		run.SourceExternalID = workspace.ID + "/" + run.ID
	}
	if run.ForgeSessionID != "" {
		run.ForgeSessionID = seedTestForgeSession(t, workspace, run.SourceExternalID)
	}
	if err := saveAgentRun(workspace.Path, run); err != nil {
		t.Fatal(err)
	}
	fake.mu.Lock()
	fake.sessions[run.AgentHubSessionID] = agentHubSession{
		ID: run.AgentHubSessionID, State: "stopped", StopReason: "requested", AgentName: "fake-agent",
		LaunchEnvironment: map[string]string{"FORGE_SESSION_ID": run.ForgeSessionID},
		Source: &agentHubSource{
			App: agentHubSourceApp, InstanceID: "forge-runtime-test", ExternalID: run.SourceExternalID,
		},
		CreatedAt: now, UpdatedAt: now,
	}
	fake.mu.Unlock()
	return run
}

func resumeRunRequest(manager *agentManager, workspace guiWorkspace, runID string) *httptest.ResponseRecorder {
	recorder := httptest.NewRecorder()
	manager.resumeRun(recorder, httptest.NewRequest(http.MethodPost, "/resume", nil), workspace.ID, runID)
	return recorder
}

func TestAgentHubStoppedResumeReleasesStaleForgeSession(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	run := seedStoppedResumeRun(t, fake, workspace, agentRun{
		ID: "run-stopped", ResourceID: "project1.task1",
		AgentHubSessionID: "ses_old", ForgeSessionID: "session-old",
	})
	forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		t.Fatal(err)
	}
	resource, err := forgeWorkspace.Resource("project1.task1")
	if err != nil {
		t.Fatal(err)
	}
	run.ForgeSessionContextPath = filepath.Join(workspace.Path, filepath.FromSlash(resource.Path), ".forge", "codex-session.json")
	if err := os.MkdirAll(filepath.Dir(run.ForgeSessionContextPath), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(run.ForgeSessionContextPath, []byte(`{"version":2,"forgeSessionId":"`+run.ForgeSessionID+`"}`), 0o600); err != nil {
		t.Fatal(err)
	}
	if err := saveAgentRun(workspace.Path, run); err != nil {
		t.Fatal(err)
	}

	recorder := resumeRunRequest(manager, workspace, run.ID)
	if recorder.Code != http.StatusOK {
		t.Fatalf("stopped resume failed: %d %s", recorder.Code, recorder.Body.String())
	}
	var detail agentRunDetail
	if err := json.Unmarshal(recorder.Body.Bytes(), &detail); err != nil {
		t.Fatal(err)
	}
	if detail.Run.Status != "idle" || detail.Run.AgentHubStoppedObserved || detail.Run.ForgeSessionID == "" || detail.Run.ForgeSessionID == run.ForgeSessionID {
		t.Fatalf("stopped resume projection mismatch: %#v", detail.Run)
	}
	fake.mu.Lock()
	session := fake.sessions["ses_old"]
	resumeEnvs := append([]map[string]string(nil), fake.resumeEnvironments...)
	fake.mu.Unlock()
	if session.LaunchEnvironment["FORGE_SESSION_ID"] != detail.Run.ForgeSessionID {
		t.Fatalf("AgentHub session kept the stale launch environment: %#v", session.LaunchEnvironment)
	}
	if len(resumeEnvs) != 1 || resumeEnvs[0]["FORGE_SESSION_ID"] != detail.Run.ForgeSessionID {
		t.Fatalf("stopped resume did not pass the replacement Forge session overlay: %#v", resumeEnvs)
	}
	if sessions := testForgeSessions(t, workspace.Path); len(sessions) != 1 || sessions[0].ID != detail.Run.ForgeSessionID {
		t.Fatalf("stale Forge session was not replaced exactly once: %#v", sessions)
	}
	contextData, err := os.ReadFile(run.ForgeSessionContextPath)
	if err != nil {
		t.Fatalf("replacement context missing: %v", err)
	}
	if !strings.Contains(string(contextData), `"forgeSessionId": "`+detail.Run.ForgeSessionID+`"`) {
		t.Fatalf("context still references the stale Forge session: %s", contextData)
	}
	persisted, err := loadAgentRuns(workspace.Path)
	if err != nil || len(persisted) != 1 {
		t.Fatalf("reload run: runs=%#v err=%v", persisted, err)
	}
	if persisted[0].ForgeSessionID != detail.Run.ForgeSessionID || persisted[0].AgentHubStoppedObserved || persisted[0].Status != "idle" {
		t.Fatalf("persisted run mismatch: %#v", persisted[0])
	}
}

func TestAgentHubStoppedResumeFailureCleansUpForgeSession(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	fake.failNextResume = true
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	run := seedStoppedResumeRun(t, fake, workspace, agentRun{
		ID: "run-stopped", AgentHubSessionID: "ses_old",
	})

	recorder := resumeRunRequest(manager, workspace, run.ID)
	if recorder.Code != http.StatusBadGateway {
		t.Fatalf("failed AgentHub resume must surface as 502, got %d %s", recorder.Code, recorder.Body.String())
	}
	if sessions := testForgeSessions(t, workspace.Path); len(sessions) != 0 {
		t.Fatalf("failed resume must release the replacement Forge session: %#v", sessions)
	}
	if _, err := os.Stat(filepath.Join(workspace.Path, ".forge", "codex-session.json")); !os.IsNotExist(err) {
		t.Fatalf("replacement context was not removed: %v", err)
	}
	persisted, err := loadAgentRuns(workspace.Path)
	if err != nil || len(persisted) != 1 {
		t.Fatalf("reload run: runs=%#v err=%v", persisted, err)
	}
	if persisted[0].ForgeSessionID != "" || persisted[0].ForgeSessionContextPath != "" || persisted[0].Status != "stopped" {
		t.Fatalf("failed resume left a dangling Forge session projection: %#v", persisted[0])
	}
}

func TestAgentHubLiveResumeDoesNotOverlayLaunchEnvironment(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	recorder, detail := startRuntimeTestRun(t, manager, workspace, `{"title":"Live resume","agentName":"fake-agent"}`)
	if recorder.Code != http.StatusOK {
		t.Fatalf("start failed: %s", recorder.Body.String())
	}
	resumeRec := resumeRunRequest(manager, workspace, detail.Run.ID)
	if resumeRec.Code != http.StatusOK {
		t.Fatalf("live resume failed: %d %s", resumeRec.Code, resumeRec.Body.String())
	}
	fake.mu.Lock()
	resumeEnvs := append([]map[string]string(nil), fake.resumeEnvironments...)
	fake.mu.Unlock()
	if len(resumeEnvs) != 1 || len(resumeEnvs[0]) != 0 {
		t.Fatalf("live resume must not pass a launchEnvironment overlay: %#v", resumeEnvs)
	}
	if sessions := testForgeSessions(t, workspace.Path); len(sessions) != 1 {
		t.Fatalf("live resume must not create a replacement Forge session: %#v", sessions)
	}
}

func TestAgentHubRuntimeStoppingAndRecoveryUI(t *testing.T) {
	data, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	source := string(data)
	for _, expected := range []string{
		`stopping: "attention"`,
		`recovering: "attention"`,
		`AgentHub is stopping the provider.`,
		`AgentHub event recovery is in progress.`,
	} {
		if !strings.Contains(source, expected) {
			t.Fatalf("AgentHub runtime UI is missing %q", expected)
		}
	}
}
