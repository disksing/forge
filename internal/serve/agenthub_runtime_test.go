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
	failNextStop       bool
	failNextInterrupt  bool
	failNextResume     bool
	failNextMessage    bool
	rejectAgentName    string
	extraAgents        []string
	stopHook           func(string)
	resumeHook         func(string)
	messageSteers      []bool
	messageRoles       []string
	messageSenders     []*agentHubMessageSender
	messageIDs         []string
	actions            []string
	resumeEnvironments []map[string]string
	listCalls          int
	stopCalls          int
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
		extraAgents := append([]string(nil), f.extraAgents...)
		f.mu.Unlock()
		agents := []map[string]any{{"name": "fake-agent", "providerId": "fake", "available": rejected != "fake-agent"}}
		if rejected != "" && rejected != "fake-agent" {
			agents = append(agents, map[string]any{"name": rejected, "providerId": "fake", "available": false, "unavailableReason": "configured AgentHub agent is unavailable"})
		}
		for _, extra := range extraAgents {
			extra = strings.TrimSpace(extra)
			if extra == "" || extra == "fake-agent" || extra == rejected {
				continue
			}
			agents = append(agents, map[string]any{"name": extra, "providerId": "fake", "available": true})
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
	if len(parts) == 3 && r.Method == http.MethodDelete {
		f.mu.Lock()
		session, ok := f.sessions[id]
		if ok && session.State == "stopped" {
			session.State = "archived"
			f.sessions[id] = session
		}
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
		var body agentHubInboundMessage
		_ = json.NewDecoder(r.Body).Decode(&body)
		f.mu.Lock()
		f.messageSteers = append(f.messageSteers, body.Steer)
		f.messageRoles = append(f.messageRoles, body.Role)
		f.messageSenders = append(f.messageSenders, body.Sender)
		f.messageIDs = append(f.messageIDs, body.MessageID)
		f.appendLocked(id, "message.input", fakeMessageInputData(body.Text, body.Role, body.Sender, body.Steer))
		f.appendLocked(id, "turn.started", map[string]any{"text": body.Text})
		session := f.sessions[id]
		session.State = "running"
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
		session.State = "running"
		session.PendingApprovalIDs = nil
		f.sessions[id] = session
		f.mu.Unlock()
		writeRuntimeFakeJSON(w, map[string]any{"session": session})
		return
	}
	if len(parts) == 4 && r.Method == http.MethodPost {
		action := parts[3]
		var stopHook func(string)
		var resumeHook func(string)
		var resumeRequest agentHubResumeRequest
		if action == "resume" {
			_ = json.NewDecoder(r.Body).Decode(&resumeRequest)
		}
		f.mu.Lock()
		if action == "resume" {
			resumeHook = f.resumeHook
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
		if action == "stop" {
			f.stopCalls++
			if f.failNextStop {
				f.failNextStop = false
				f.mu.Unlock()
				w.WriteHeader(http.StatusBadGateway)
				writeRuntimeFakeJSON(w, map[string]any{"error": map[string]any{
					"code": "stop_outcome_unknown", "message": "synthetic ambiguous stop failure",
				}})
				return
			}
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
		if resumeHook != nil {
			resumeHook(id)
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

// fakeMessageInputData mirrors the canonical message.input event a real
// AgentHub daemon persists: the role defaults to user and the sender, when
// present, is stored alongside the text.
func fakeMessageInputData(text, role string, sender *agentHubMessageSender, steer bool) map[string]any {
	if role == "" {
		role = "user"
	}
	data := map[string]any{"text": text, "role": role, "steer": steer}
	if sender != nil {
		data["sender"] = sender
	}
	return data
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
		f.appendLocked(id, "message.input", fakeMessageInputData(
			request.InitialMessage.Text, request.InitialMessage.Role, request.InitialMessage.Sender, request.InitialMessage.Steer))
		f.appendLocked(id, "turn.started", map[string]any{"text": request.InitialMessage.Text})
		session.State = "running"
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
	if _, err := forgeWorkspace.CreateTask(app.CreateTaskInput{ProjectID: project.ID, Title: "Runtime test task", Slug: "runtime-test"}); err != nil {
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

func TestResourceGenerationCreatesLazilyAndRecoversQueuedMessage(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)

	firstRecorder, first := startRuntimeTestRun(t, manager, workspace, `{"resourceId":"project1.task1","title":"Resource chat","prompt":"first","userName":"Ada"}`)
	if firstRecorder.Code != http.StatusOK {
		t.Fatalf("first resource message failed: %d %s", firstRecorder.Code, firstRecorder.Body.String())
	}
	if first.Run.Generation != 1 || first.Run.GenerationID == "" || first.Run.BindingKind != "profile" || first.Run.BindingName != "default" || first.Run.SourceInstanceID == "" {
		t.Fatalf("resource generation metadata mismatch: %#v", first.Run)
	}
	if len(first.Run.PendingMessages) != 0 {
		t.Fatalf("ready generation did not deliver first message: %#v", first.Run.PendingMessages)
	}

	secondRecorder, second := startRuntimeTestRun(t, manager, workspace, `{"resourceId":"project1.task1","title":"Resource chat","prompt":"second","userName":"Ada"}`)
	if secondRecorder.Code != http.StatusOK || second.Run.ID != first.Run.ID || len(second.Run.PendingMessages) != 1 {
		t.Fatalf("running non-steer generation did not retain the durable message: code=%d run=%#v", secondRecorder.Code, second.Run)
	}
	fake.mu.Lock()
	if len(fake.messageIDs) != 1 || fake.messageIDs[0] == "" {
		fake.mu.Unlock()
		t.Fatalf("first resource message lacked a stable id: %#v", fake.messageIDs)
	}
	session := fake.sessions[first.Run.AgentHubSessionID]
	session.InputCapabilities.Steer = true
	fake.sessions[session.ID] = session
	fake.mu.Unlock()

	restarted := newAgentManager(manager.server)
	manager.server.agents = restarted
	if err := restarted.recoverAgentHubRuns(context.Background()); err != nil {
		t.Fatal(err)
	}
	var recovered agentRun
	deadline := time.Now().Add(2 * time.Second)
	for time.Now().Before(deadline) {
		runs, err := loadAgentRuns(workspace.Path)
		if err != nil {
			t.Fatal(err)
		}
		for _, run := range runs {
			if run.ID == first.Run.ID {
				recovered = run
			}
		}
		if len(recovered.PendingMessages) == 0 {
			break
		}
		time.Sleep(10 * time.Millisecond)
	}
	if len(recovered.PendingMessages) != 0 {
		t.Fatalf("restart did not drain queued message: %#v", recovered.PendingMessages)
	}
	fake.mu.Lock()
	defer fake.mu.Unlock()
	if len(fake.messageIDs) != 2 || fake.messageIDs[1] == "" || fake.messageIDs[1] == fake.messageIDs[0] || !fake.messageSteers[1] {
		t.Fatalf("queued message delivery metadata mismatch: ids=%#v steers=%#v", fake.messageIDs, fake.messageSteers)
	}
}

func TestGenerationMutationSerializesMailboxWithConcurrentStateUpdates(t *testing.T) {
	manager, workspace, _ := newRuntimeTestManager(t, "http://127.0.0.1:1")
	now := time.Now().Format(time.RFC3339Nano)
	run := agentRun{ID: "run-atomic", WorkspaceID: workspace.ID, ResourceID: "project1.task1", Generation: 1, GenerationID: "gen-atomic", Status: "idle", CreatedAt: now, UpdatedAt: now}
	if err := saveAgentRun(workspace.Path, run); err != nil {
		t.Fatal(err)
	}
	rt := newAgentHubRuntime(manager, workspace, run, nil)
	manager.registerRuntime(rt)
	const messages = 80
	var group sync.WaitGroup
	for index := 0; index < messages; index++ {
		index := index
		group.Add(2)
		go func() {
			defer group.Done()
			if err := rt.enqueueResourceMessage(resourceInboundMessage{ID: fmt.Sprintf("msg-%03d", index), Text: "queued"}); err != nil {
				t.Errorf("enqueue %d: %v", index, err)
			}
		}()
		go func() {
			defer group.Done()
			if _, err := rt.mutateRun(func(run *agentRun) { run.CompletionCursor++ }); err != nil {
				t.Errorf("state update %d: %v", index, err)
			}
		}()
	}
	group.Wait()
	persisted, err := loadAgentRun(workspace.Path, run.ID)
	if err != nil {
		t.Fatal(err)
	}
	if len(persisted.PendingMessages) != messages || persisted.CompletionCursor != messages {
		t.Fatalf("serialized generation lost an update: messages=%d cursor=%d", len(persisted.PendingMessages), persisted.CompletionCursor)
	}
}

func TestGenerationMutationRollsBackMailboxWhenDiskWriteFails(t *testing.T) {
	manager, workspace, _ := newRuntimeTestManager(t, "http://127.0.0.1:1")
	now := time.Now().Format(time.RFC3339Nano)
	run := agentRun{ID: "run-disk-failure", WorkspaceID: workspace.ID, Generation: 1, Status: "idle", CreatedAt: now, UpdatedAt: now,
		PendingMessages: []resourceInboundMessage{{ID: "msg-kept", Text: "keep me"}}}
	if err := saveAgentRun(workspace.Path, run); err != nil {
		t.Fatal(err)
	}
	rt := newAgentHubRuntime(manager, workspace, run, nil)
	runtimeDir := agentRoot(workspace.Path)
	backupDir := runtimeDir + "-backup"
	if err := os.Rename(runtimeDir, backupDir); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(runtimeDir, []byte("blocks directory creation"), 0o600); err != nil {
		t.Fatal(err)
	}
	if _, err := rt.mutateRun(func(run *agentRun) { run.PendingMessages = nil }); err == nil {
		t.Fatal("expected generation persistence failure")
	}
	if got := rt.snapshotRun().PendingMessages; len(got) != 1 || got[0].ID != "msg-kept" {
		t.Fatalf("failed write advanced in-memory mailbox: %#v", got)
	}
	if err := os.Remove(runtimeDir); err != nil {
		t.Fatal(err)
	}
	if err := os.Rename(backupDir, runtimeDir); err != nil {
		t.Fatal(err)
	}
	persisted, err := loadAgentRun(workspace.Path, run.ID)
	if err != nil || len(persisted.PendingMessages) != 1 {
		t.Fatalf("failed write removed durable mailbox: %#v, %v", persisted.PendingMessages, err)
	}
}

func TestAgentRunIndexMigratesWithoutDeletingLegacyProjection(t *testing.T) {
	workspacePath := t.TempDir()
	legacyDir := filepath.Join(workspacePath, ".forge", "gui-agent")
	if err := os.MkdirAll(legacyDir, 0o755); err != nil {
		t.Fatal(err)
	}
	legacy := []agentRun{{ID: "run-legacy", WorkspaceID: "workspace", Title: "Legacy", Status: "idle"}}
	data, _ := json.Marshal(legacy)
	legacyPath := filepath.Join(legacyDir, "runs.json")
	if err := os.WriteFile(legacyPath, data, 0o600); err != nil {
		t.Fatal(err)
	}
	runs, err := loadAgentRuns(workspacePath)
	if err != nil || len(runs) != 1 || runs[0].ID != "run-legacy" {
		t.Fatalf("migrated runs=%#v err=%v", runs, err)
	}
	if _, err := os.Stat(agentIndexPath(workspacePath)); err != nil {
		t.Fatalf("new runtime index missing: %v", err)
	}
	if _, err := os.Stat(legacyPath); err != nil {
		t.Fatalf("legacy rollback copy was removed: %v", err)
	}
}

func TestResourceBindingChangeWaitsForTurnBoundaryAndTransfersQueue(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	fake.extraAgents = []string{"replacement-agent"}
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	firstRecorder, first := startRuntimeTestRun(t, manager, workspace, `{"resourceId":"project1.task1","prompt":"first"}`)
	if firstRecorder.Code != http.StatusOK {
		t.Fatalf("first message failed: %d %s", firstRecorder.Code, firstRecorder.Body.String())
	}
	forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		t.Fatal(err)
	}
	binding := app.AgentBinding{Kind: "agent", Name: "replacement-agent"}
	if _, err := forgeWorkspace.SetResourceAgentBinding("project1.task1", binding); err != nil {
		t.Fatal(err)
	}
	if err := manager.resourceBindingChanged(context.Background(), workspace, "project1.task1", binding); err != nil {
		t.Fatal(err)
	}
	queuedRecorder, queued := startRuntimeTestRun(t, manager, workspace, `{"resourceId":"project1.task1","prompt":"after binding change"}`)
	if queuedRecorder.Code != http.StatusOK || queued.Run.ID != first.Run.ID || len(queued.Run.PendingMessages) != 1 || !queued.Run.ReplacementPending {
		t.Fatalf("message crossed the replacement boundary early: code=%d run=%#v", queuedRecorder.Code, queued.Run)
	}
	fake.mu.Lock()
	oldSession := fake.sessions[first.Run.AgentHubSessionID]
	oldSession.State = "ready"
	fake.sessions[oldSession.ID] = oldSession
	fake.mu.Unlock()
	if err := manager.pollAgentHubSessions(context.Background()); err != nil {
		t.Fatal(err)
	}

	deadline := time.Now().Add(3 * time.Second)
	var runs []agentRun
	for time.Now().Before(deadline) {
		runs, err = loadAgentRuns(workspace.Path)
		if err != nil {
			t.Fatal(err)
		}
		if len(runs) >= 2 && runs[0].Generation == 2 && len(runs[0].PendingMessages) == 0 {
			transferred := true
			for _, candidate := range runs {
				if candidate.Generation == 1 && len(candidate.PendingMessages) != 0 {
					transferred = false
				}
			}
			if transferred {
				break
			}
		}
		time.Sleep(10 * time.Millisecond)
	}
	if len(runs) < 2 || runs[0].Generation != 2 || runs[0].AgentHubAgentName != "replacement-agent" || len(runs[0].PendingMessages) != 0 {
		t.Fatalf("replacement generation mismatch: %#v", runs)
	}
	if len(runs[1].PendingMessages) != 0 || runs[1].Status != "stopped" {
		t.Fatalf("old generation retained transferred work: %#v", runs[1])
	}
	replacementID := ""
	for _, run := range runs {
		if run.Generation == 2 {
			replacementID = run.ID
		}
	}
	late := sendRuntimeAgentInput(t, manager, workspace, first.Run.ID, `{"text":"late old-run input"}`)
	var lateResult struct {
		RunID string `json:"runId"`
	}
	if err := json.Unmarshal(late.Body.Bytes(), &lateResult); err != nil {
		t.Fatal(err)
	}
	if late.Code != http.StatusOK || lateResult.RunID != replacementID {
		t.Fatalf("late old-generation input was not redirected to %s (runs=%#v): %d %s", replacementID, runs, late.Code, late.Body.String())
	}
	redirected, err := loadAgentRuns(workspace.Path)
	newPending, oldPending := -1, -1
	for _, run := range redirected {
		if run.Generation == 2 {
			newPending = len(run.PendingMessages)
		} else if run.Generation == 1 {
			oldPending = len(run.PendingMessages)
		}
	}
	if err != nil || len(redirected) < 2 || newPending != 1 || oldPending != 0 {
		t.Fatalf("redirected queue mismatch: runs=%#v err=%v", redirected, err)
	}
	fake.mu.Lock()
	defer fake.mu.Unlock()
	if fake.sessions[first.Run.AgentHubSessionID].State != "archived" || len(fake.messageIDs) != 2 {
		t.Fatalf("replacement lifecycle mismatch: old=%#v messageIDs=%#v", fake.sessions[first.Run.AgentHubSessionID], fake.messageIDs)
	}
}

func sendRuntimeAgentInput(t *testing.T, manager *agentManager, workspace guiWorkspace, runID, body string) *httptest.ResponseRecorder {
	t.Helper()
	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodPost, "/input", strings.NewReader(body))
	manager.handle(recorder, request, workspace.ID, []string{"runs", runID, "input"})
	return recorder
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

func TestAgentHubManualMessagesCarryBrowserUserProvenance(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	recorder, detail := startRuntimeTestRun(t, manager, workspace, `{"agentName":"fake-agent","resourceId":"project1.task1","prompt":"hello","userName":"  Ada Lovelace  "}`)
	if recorder.Code != http.StatusOK {
		t.Fatalf("start failed: %d %s", recorder.Code, recorder.Body.String())
	}

	fake.mu.Lock()
	initialEvents := append([]agentHubEvent(nil), fake.events[detail.Run.AgentHubSessionID]...)
	fake.mu.Unlock()
	var initial agentHubEvent
	for _, event := range initialEvents {
		if event.Type == "message.input" && fakeEventText(event) == "hello" {
			initial = event
			break
		}
	}
	if initial.Type == "" || fakeEventRole(initial) != "user" || fakeEventSenderName(initial) != "Ada Lovelace" {
		t.Fatalf("initial user provenance = role %q sender %q; events=%#v", fakeEventRole(initial), fakeEventSenderName(initial), initialEvents)
	}
	storedRuns, err := loadAgentRuns(workspace.Path)
	if err != nil || len(storedRuns) != 1 {
		t.Fatalf("load stored runs: runs=%#v err=%v", storedRuns, err)
	}
	storedJSON, err := json.Marshal(storedRuns[0])
	if err != nil {
		t.Fatal(err)
	}
	if strings.Contains(string(storedJSON), "Ada Lovelace") {
		t.Fatalf("browser-local user name leaked into persisted run: %s", storedJSON)
	}

	for _, input := range []struct {
		body string
		name string
	}{
		{body: `{"text":"named follow-up","userName":"Grace Hopper"}`, name: "Grace Hopper"},
		{body: `{"text":"default follow-up"}`, name: "User"},
	} {
		response := sendRuntimeAgentInput(t, manager, workspace, detail.Run.ID, input.body)
		if response.Code != http.StatusOK {
			t.Fatalf("input failed: %d %s", response.Code, response.Body.String())
		}
		fake.mu.Lock()
		role := fake.messageRoles[len(fake.messageRoles)-1]
		sender := fake.messageSenders[len(fake.messageSenders)-1]
		fake.mu.Unlock()
		if role != "user" || sender == nil || sender.Name != input.name {
			t.Fatalf("follow-up provenance = role %q sender %#v; want user/%q", role, sender, input.name)
		}
	}

	if response := closeRuntimeTestRun(t, manager, workspace, detail.Run.ID); response.Code != http.StatusOK {
		t.Fatalf("close failed: %d %s", response.Code, response.Body.String())
	}
}

func TestNormalizeAgentHubUserName(t *testing.T) {
	longName := strings.Repeat("名", agentHubUserNameMaxLength+5)
	for _, test := range []struct {
		name string
		in   string
		want string
	}{
		{name: "missing", want: "User"},
		{name: "blank", in: "  \n ", want: "User"},
		{name: "trim", in: "  Ada Lovelace  ", want: "Ada Lovelace"},
		{name: "unicode limit", in: longName, want: strings.Repeat("名", agentHubUserNameMaxLength)},
	} {
		t.Run(test.name, func(t *testing.T) {
			if got := normalizeAgentHubUserName(test.in); got != test.want {
				t.Fatalf("normalizeAgentHubUserName(%q) = %q, want %q", test.in, got, test.want)
			}
		})
	}
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
	if session.Source == nil || session.Source.App != "forge" || session.Source.InstanceID != "forge-runtime-test" || len(session.LaunchEnvironment) != 0 {
		t.Fatalf("source metadata or launch environment mismatch: %#v", session)
	}
	localEventPath := filepath.Join(workspace.Path, ".forge", "runtime", "runs", detail.Run.ID+".jsonl")
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
		t.Fatalf("duplicate conflict did not retain the transient session projection: %#v", runs[0])
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

func TestAgentHubRuntimeSessionsAndRestartRecovery(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, configPath := newRuntimeTestManager(t, hub.URL)
	recorder, detail := startRuntimeTestRun(t, manager, workspace, `{"title":"Sessions","agentName":"fake-agent"}`)
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
	if len(resumeEnvs) != 1 || len(resumeEnvs[0]) != 0 {
		t.Fatalf("stopped resume must not pass a launch environment overlay: %#v", resumeEnvs)
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

func TestAgentHubRuntimeAllowsMultipleSessionsForOneResource(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)

	firstRecorder, first := startRuntimeTestRun(t, manager, workspace, `{"title":"First","agentName":"fake-agent","resourceId":"project1.task1"}`)
	secondRecorder, second := startRuntimeTestRun(t, manager, workspace, `{"title":"Second","agentName":"fake-agent","resourceId":"project1.task1"}`)
	if firstRecorder.Code != http.StatusOK || secondRecorder.Code != http.StatusOK {
		t.Fatalf("same-resource sessions must both start: first=%d %s second=%d %s", firstRecorder.Code, firstRecorder.Body.String(), secondRecorder.Code, secondRecorder.Body.String())
	}
	if first.Run.ID == second.Run.ID || first.Run.AgentHubSessionID == second.Run.AgentHubSessionID {
		t.Fatalf("same-resource starts did not create independent sessions: first=%#v second=%#v", first.Run, second.Run)
	}
	if sessions := testForgeSessions(t, workspace.Path); len(sessions) != 2 {
		t.Fatalf("expected two transient session records for one resource, got %#v", sessions)
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

func TestAgentHubCloseResponseReleasesForgeProjectionBeforeReturn(t *testing.T) {
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
	if sessions := testForgeSessions(t, workspace.Path); len(sessions) != 0 {
		t.Fatalf("close response returned before Forge session release: %#v", sessions)
	}
	runs, err := loadAgentRuns(workspace.Path)
	if err != nil || len(runs) != 1 {
		t.Fatalf("load closed run: runs=%#v err=%v", runs, err)
	}
	if runs[0].Status != "stopped" || runs[0].ForgeSessionID != "" {
		t.Fatalf("close response returned a stale run projection: %#v", runs[0])
	}
	tree, err := manager.server.tree(context.Background(), workspace.ID)
	if err != nil {
		t.Fatal(err)
	}
	if len(tree.Sessions) != 0 {
		t.Fatalf("workspace tree still exposed the stopped run's transient session: %#v", tree.Sessions)
	}
}

func TestAgentHubCloseFailsClosedWhenForgeReleaseFails(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	recorder, detail := startRuntimeTestRun(t, manager, workspace, `{"agentName":"fake-agent","resourceId":"project1.task1","prompt":"ordinary chat"}`)
	if recorder.Code != http.StatusOK {
		t.Fatalf("start failed: %d %s", recorder.Code, recorder.Body.String())
	}
	lockPath := filepath.Join(workspace.Path, ".forge-sessions.lock")
	if err := os.Remove(lockPath); err != nil {
		t.Fatal(err)
	}
	if err := os.Mkdir(lockPath, 0o755); err != nil {
		t.Fatal(err)
	}
	response := closeRuntimeTestRun(t, manager, workspace, detail.Run.ID)
	if response.Code == http.StatusOK || !strings.Contains(response.Body.String(), "Forge session release failed") {
		t.Fatalf("Forge release failure must not report success: %d %s", response.Code, response.Body.String())
	}
	if err := os.Remove(lockPath); err != nil {
		t.Fatal(err)
	}
	file, err := os.OpenFile(lockPath, os.O_CREATE|os.O_RDWR, 0o644)
	if err != nil {
		t.Fatal(err)
	}
	file.Close()
	sessions := testForgeSessions(t, workspace.Path)
	if len(sessions) != 1 {
		t.Fatalf("failed close must retain the active Forge session for recovery: %#v", sessions)
	}
	runs, err := loadAgentRuns(workspace.Path)
	if err != nil || len(runs) != 1 || runs[0].ForgeSessionID == "" {
		t.Fatalf("failed close must retain a recoverable run projection: runs=%#v err=%v", runs, err)
	}
	retry := closeRuntimeTestRun(t, manager, workspace, detail.Run.ID)
	if retry.Code != http.StatusOK {
		t.Fatalf("retry after Forge release recovery failed: %d %s", retry.Code, retry.Body.String())
	}
	if sessions := testForgeSessions(t, workspace.Path); len(sessions) != 0 {
		t.Fatalf("successful retry did not finish Forge release: %#v", sessions)
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
	resumeEnvs := append([]map[string]string(nil), fake.resumeEnvironments...)
	fake.mu.Unlock()
	if len(resumeEnvs) != 1 || len(resumeEnvs[0]) != 0 {
		t.Fatalf("stopped resume must not pass a launch environment overlay: %#v", resumeEnvs)
	}
	if sessions := testForgeSessions(t, workspace.Path); len(sessions) != 1 || sessions[0].ID != detail.Run.ForgeSessionID {
		t.Fatalf("stale Forge session was not replaced exactly once: %#v", sessions)
	}
	persisted, err := loadAgentRuns(workspace.Path)
	if err != nil || len(persisted) != 1 {
		t.Fatalf("reload run: runs=%#v err=%v", persisted, err)
	}
	if persisted[0].ForgeSessionID != detail.Run.ForgeSessionID || persisted[0].AgentHubStoppedObserved || persisted[0].Status != "idle" {
		t.Fatalf("persisted run mismatch: %#v", persisted[0])
	}
}

func TestAgentHubStoppedResumeSerializesDelayedForgeSessionRelease(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	resumeEntered := make(chan struct{})
	resumeRelease := make(chan struct{})
	var releaseResumeOnce sync.Once
	unblockResume := func() { releaseResumeOnce.Do(func() { close(resumeRelease) }) }
	var hookOnce sync.Once
	fake.resumeHook = func(_ string) {
		hookOnce.Do(func() { close(resumeEntered) })
		<-resumeRelease
	}
	hub := httptest.NewServer(fake)
	defer hub.Close()
	defer unblockResume()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	run := seedStoppedResumeRun(t, fake, workspace, agentRun{
		ID: "run-stopped-release-race", ResourceID: "project1.task1",
		AgentHubSessionID: "ses_stopped_release_race",
	})

	resumeDone := make(chan *httptest.ResponseRecorder, 1)
	go func() { resumeDone <- resumeRunRequest(manager, workspace, run.ID) }()
	select {
	case <-resumeEntered:
	case <-time.After(2 * time.Second):
		t.Fatal("resume request did not reach AgentHub")
	}
	rt := manager.runtimeByID(run.ID)
	if rt == nil {
		t.Fatal("resume did not register the runtime")
	}
	resumedWhileStopped := pollerRunState(rt)
	if resumedWhileStopped.ForgeSessionID == "" || !resumedWhileStopped.AgentHubStoppedObserved || resumedWhileStopped.Status != "stopped" {
		t.Fatalf("test did not reach the replacement-before-resume-response window: %#v", resumedWhileStopped)
	}

	releaseDone := make(chan error, 1)
	go func() { releaseDone <- rt.releaseForgeSessionAfterStopped(manager) }()
	select {
	case err := <-releaseDone:
		t.Fatalf("stale release completed while resume owned the replacement: %v", err)
	case <-time.After(100 * time.Millisecond):
	}
	unblockResume()

	var response *httptest.ResponseRecorder
	select {
	case response = <-resumeDone:
	case <-time.After(2 * time.Second):
		t.Fatal("resume request did not finish")
	}
	if response.Code != http.StatusOK {
		t.Fatalf("resume failed: %d %s", response.Code, response.Body.String())
	}
	select {
	case err := <-releaseDone:
		if err != nil {
			t.Fatalf("delayed release failed: %v", err)
		}
	case <-time.After(2 * time.Second):
		t.Fatal("delayed release did not finish after resume")
	}

	updated := pollerRunState(rt)
	if updated.Status != "idle" || updated.AgentHubStoppedObserved || updated.ForgeSessionID == "" {
		t.Fatalf("delayed release removed the resumed run projection: %#v", updated)
	}
	sessions := testForgeSessions(t, workspace.Path)
	if len(sessions) != 1 || sessions[0].ID != updated.ForgeSessionID {
		t.Fatalf("delayed release removed the replacement Forge session: %#v", sessions)
	}
	tree, err := manager.server.tree(context.Background(), workspace.ID)
	if err != nil {
		t.Fatal(err)
	}
	if len(tree.Sessions) != 1 || tree.Sessions[0].AgentRunID != run.ID || tree.Sessions[0].AgentRunStatus != "idle" {
		t.Fatalf("resumed run is missing from the workspace tree: %#v", tree.Sessions)
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
	persisted, err := loadAgentRuns(workspace.Path)
	if err != nil || len(persisted) != 1 {
		t.Fatalf("reload run: runs=%#v err=%v", persisted, err)
	}
	if persisted[0].ForgeSessionID != "" || persisted[0].Status != "stopped" {
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
