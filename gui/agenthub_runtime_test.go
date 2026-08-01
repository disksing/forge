package main

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
)

type runtimeFakeAgentHub struct {
	mu              sync.Mutex
	sessions        map[string]agentHubSession
	events          map[string][]agentHubEvent
	nextSession     int
	abortNextCreate bool
	duplicateSource bool
	gapAfter        int64
	stopAtStopping  bool
	messageSteers   []bool
	actions         []string
}

func newRuntimeFakeAgentHub() *runtimeFakeAgentHub {
	return &runtimeFakeAgentHub{
		sessions: make(map[string]agentHubSession),
		events:   make(map[string][]agentHubEvent),
	}
}

func (f *runtimeFakeAgentHub) ServeHTTP(w http.ResponseWriter, r *http.Request) {
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
		f.mu.Unlock()
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
		f.mu.Lock()
		f.actions = append(f.actions, action)
		session := f.sessions[id]
		switch action {
		case "interrupt":
			f.appendLocked(id, "turn.cancelled", map[string]any{"reason": "requested"})
			f.appendLocked(id, "session.state", map[string]any{"state": "ready"})
			session.State = "ready"
		case "stop":
			f.appendLocked(id, "session.state", map[string]any{"state": "stopping"})
			session.State = "stopping"
			if !f.stopAtStopping {
				f.appendLocked(id, "session.state", map[string]any{"state": "stopped", "reason": "requested"})
				session.State = "stopped"
				session.StopReason = "requested"
			}
		case "resume":
			f.appendLocked(id, "session.state", map[string]any{"state": "starting"})
			f.appendLocked(id, "session.state", map[string]any{"state": "ready"})
			session.State = "ready"
		}
		session.LastEventID = int64(len(f.events[id]))
		f.sessions[id] = session
		f.mu.Unlock()
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

func (f *runtimeFakeAgentHub) list(w http.ResponseWriter, r *http.Request) {
	f.mu.Lock()
	defer f.mu.Unlock()
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
	for _, session := range f.sessions {
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
	return source != nil && source.App == query.Get("sourceApp") &&
		source.InstanceID == query.Get("sourceInstanceId") && source.ExternalID == query.Get("sourceExternalId")
}

func (f *runtimeFakeAgentHub) serveEvents(w http.ResponseWriter, r *http.Request, id string) {
	after, _ := strconv.ParseInt(r.URL.Query().Get("after"), 10, 64)
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	if limit <= 0 {
		limit = agentHubEventsPageSize
	}
	f.mu.Lock()
	all := append([]agentHubEvent(nil), f.events[id]...)
	gapAfter := f.gapAfter
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
	workspace := guiWorkspace{ID: "workspace-test", Name: "Test", Path: workspacePath}
	configPath := filepath.Join(t.TempDir(), "gui.json")
	configData, _ := json.Marshal(agentHubGUIConfig{
		Version: agentHubConfigVersion, Workspaces: []guiWorkspace{workspace},
		AgentHubEndpoint: hubURL, AgentHubInstanceID: "forge-runtime-test",
		DefaultAgentHubAgentName: "fake-agent",
	})
	if err := os.WriteFile(configPath, configData, 0o600); err != nil {
		t.Fatal(err)
	}
	forgePath := filepath.Join(t.TempDir(), "forge-fake")
	script := `#!/bin/sh
printf '%s\n' "$*" >> "$FORGE_RUNTIME_LOG"
if [ "$1" = "session" ] && [ "$2" = "new" ]; then
  printf '%s\n' "session-test"
  exit 0
fi
if [ "$1" = "session" ] && { [ "$2" = "lock" ] || [ "$2" = "end" ] || [ "$2" = "bind-agenthub" ]; }; then
  printf '{}\n'
  exit 0
fi
if [ "$1" = "task" ] && [ "$2" = "autorun" ]; then
  printf '{}\n'
  exit 0
fi
if [ "$1" = "task" ] && [ "$2" = "show" ]; then
  printf '{"autoRun":{"state":"%s"}}\n' "${FORGE_RUNTIME_AUTORUN_STATE:-running}"
  exit 0
fi
if [ "$1" = "workspace" ] && [ "$2" = "resource" ]; then
  printf '{"path":"project1/task1"}\n'
  exit 0
fi
echo "unexpected forge args: $*" >&2
exit 1
`
	if err := os.WriteFile(forgePath, []byte(script), 0o755); err != nil {
		t.Fatal(err)
	}
	t.Setenv("FORGE_RUNTIME_LOG", filepath.Join(filepath.Dir(configPath), "forge.log"))
	server := &server{config: configPath, forgePath: forgePath, addr: "127.0.0.1:4936"}
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

func stopRuntimeTestStream(rt *agentRuntime) {
	if rt == nil {
		return
	}
	rt.mu.Lock()
	cancel, done := rt.agentHubCancel, rt.agentHubStreamDone
	rt.mu.Unlock()
	if cancel != nil {
		cancel()
	}
	if done != nil {
		<-done
	}
}

func TestAgentHubRuntimeCreateLostResponseRecoveryAndProjectionOnly(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	fake.abortNextCreate = true
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	recorder, detail := startRuntimeTestRun(t, manager, workspace, `{"title":"Lost response","agentId":"fake-agent"}`)
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
		session.LaunchEnvironment["FORGE_SESSION_ID"] != "session-test" {
		t.Fatalf("source or launch environment missing: %#v", session)
	}
	legacyEventPath := filepath.Join(workspace.Path, ".forge", "gui-agent", "runs", detail.Run.ID+".jsonl")
	if _, err := os.Stat(legacyEventPath); !os.IsNotExist(err) {
		t.Fatalf("AgentHub run must not create a local event fact log: %v", err)
	}
	stopRuntimeTestStream(manager.runtimeByID(detail.Run.ID))
}

func TestAgentHubRuntimeDuplicateSourceKeepsRunRecovering(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	fake.duplicateSource = true
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	recorder, _ := startRuntimeTestRun(t, manager, workspace, `{"title":"Conflict","agentId":"fake-agent"}`)
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

func TestAgentHubRuntimePaginationUnknownGapAndSSE(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	fake.mu.Lock()
	fake.sessions["ses_page"] = agentHubSession{ID: "ses_page", State: "ready"}
	for index := 0; index < 505; index++ {
		eventType := "provider.event"
		if index == 500 {
			eventType = "future.event"
		}
		fake.appendLocked("ses_page", eventType, map[string]any{"index": index})
	}
	fake.mu.Unlock()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	client, _ := newAgentHubClient(hub.URL, hub.Client())
	run := agentRun{ID: "run-page", WorkspaceID: workspace.ID, AgentHubSessionID: "ses_page", Status: "idle"}
	rt := newAgentHubRuntime(manager, workspace, run, client, nil)
	if err := rt.catchUpAgentHub(context.Background(), manager, 505); err != nil {
		t.Fatal(err)
	}
	projected, events, _ := rt.snapshotDetail()
	if projected.AgentHubEventCursor != 505 || len(events) != agentHubEventMaxCount {
		t.Fatalf("pagination failed: cursor=%d events=%d", projected.AgentHubEventCursor, len(events))
	}
	unknown := events[len(events)-5]
	if unknown.Type != "future.event" || unknown.SessionID != "ses_page" || unknown.ID != 501 {
		t.Fatalf("unknown canonical event was not retained unchanged: %#v", unknown)
	}
	fake.mu.Lock()
	fake.appendLocked("ses_page", "message.assistant.delta", map[string]any{"text": "live"})
	fake.mu.Unlock()
	var live []agentHubEvent
	if err := client.StreamEvents(context.Background(), "ses_page", 505, func(event agentHubEvent) error {
		live = append(live, event)
		return nil
	}); err != nil {
		t.Fatal(err)
	}
	if len(live) != 1 || live[0].ID != 506 {
		t.Fatalf("unexpected SSE replay: %#v", live)
	}

	gapRun := agentRun{ID: "run-gap", WorkspaceID: workspace.ID, AgentHubSessionID: "ses_page", Status: "idle"}
	gapRT := newAgentHubRuntime(manager, workspace, gapRun, client, nil)
	fake.mu.Lock()
	fake.gapAfter = 250
	fake.mu.Unlock()
	err := gapRT.catchUpAgentHub(context.Background(), manager, 506)
	if err == nil || !strings.Contains(err.Error(), "cursor gap") {
		t.Fatalf("expected gap error, got %v", err)
	}
	gapRT.mu.Lock()
	cursor := gapRT.run.AgentHubEventCursor
	gapRT.mu.Unlock()
	if cursor != 249 {
		t.Fatalf("projection advanced across gap to %d", cursor)
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
			AgentHubEventCursor: canonical.ID, Status: "running",
		},
		events: []agentHubEvent{canonical},
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
	recorder, detail := startRuntimeTestRun(t, manager, workspace, `{"title":"Controls","agentId":"fake-agent"}`)
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
	last := session.LastEventID
	fake.mu.Unlock()
	if err := rt.catchUpAgentHub(context.Background(), manager, last); err != nil {
		t.Fatal(err)
	}
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
	if resumeRec.Code != http.StatusConflict || !strings.Contains(resumeRec.Body.String(), "original Forge session is no longer active") {
		t.Fatalf("resume without Forge session should fail before AgentHub resume: %d %s", resumeRec.Code, resumeRec.Body.String())
	}
	fake.mu.Lock()
	steers := append([]bool(nil), fake.messageSteers...)
	actions := strings.Join(fake.actions, ",")
	fake.mu.Unlock()
	if len(steers) != 2 || steers[0] || !steers[1] {
		t.Fatalf("message/steer routing mismatch: %#v", steers)
	}
	for _, expected := range []string{
		"approval:approve-1:accept",
		"approval:approve-2:option=option-a",
		"approval:approve-3:text=another answer",
		"interrupt",
		"stop",
	} {
		if !strings.Contains(actions, expected) {
			t.Fatalf("missing control %q in %q", expected, actions)
		}
	}
	if strings.Contains(actions, "resume") {
		t.Fatalf("AgentHub resumed after its Forge session was released: %q", actions)
	}

	stopRuntimeTestStream(rt)
	restartedServer := &server{config: configPath, forgePath: manager.server.forgePath, addr: manager.server.addr}
	restarted := newAgentManager(restartedServer)
	restartedServer.agents = restarted
	if err := restarted.recoverAgentHubRuns(context.Background()); err != nil {
		t.Fatal(err)
	}
	recovered := restarted.runtimeByID(runID)
	if recovered == nil {
		t.Fatal("GUI restart did not recover AgentHub runtime")
	}
	recoveredRun, recoveredEvents, _ := recovered.snapshotDetail()
	fake.mu.Lock()
	eventCount := len(fake.events[detail.Run.AgentHubSessionID])
	fake.mu.Unlock()
	if recoveredRun.AgentHubEventCursor != int64(eventCount) || len(recoveredEvents) == 0 {
		t.Fatalf("restart did not rebuild history: run=%#v events=%d durable=%d", recoveredRun, len(recoveredEvents), eventCount)
	}
	stopRuntimeTestStream(recovered)
}

func TestAgentHubRuntimeAppliesDeltaMergeReplacement(t *testing.T) {
	manager, workspace, _ := newRuntimeTestManager(t, "http://127.0.0.1:1")
	run := agentRun{ID: "run-merge", WorkspaceID: workspace.ID, AgentHubSessionID: "ses_merge", Status: "running"}
	rt := newAgentHubRuntime(manager, workspace, run, nil, nil)
	delta := func(id int64, text string) agentHubEvent {
		raw, _ := json.Marshal(map[string]any{"text": text})
		return agentHubEvent{
			ID: id, Time: "2026-07-31T15:00:00Z", Type: "message.assistant.delta",
			SessionID: "ses_merge", TurnID: "turn_1", Data: raw,
		}
	}
	if err := rt.applyAgentHubEvent(manager, delta(1, "Hello")); err != nil {
		t.Fatal(err)
	}
	if err := rt.applyAgentHubEvent(manager, delta(1, "Hello!")); err != nil {
		t.Fatal(err)
	}
	rt.mu.Lock()
	if rt.run.AgentHubEventCursor != 1 {
		t.Fatalf("replacement moved the cursor to %d", rt.run.AgentHubEventCursor)
	}
	if len(rt.events) != 1 {
		t.Fatalf("replacement appended instead of swapping: %+v", rt.events)
	}
	var payload map[string]any
	if err := json.Unmarshal(rt.events[0].Data, &payload); err != nil {
		t.Fatal(err)
	}
	rt.mu.Unlock()
	if payload["text"] != "Hello!" {
		t.Fatalf("replacement content = %v, want merged text", payload["text"])
	}
	if err := rt.applyAgentHubEvent(manager, delta(2, "next")); err != nil {
		t.Fatal(err)
	}
	rt.mu.Lock()
	defer rt.mu.Unlock()
	if rt.run.AgentHubEventCursor != 2 || len(rt.events) != 2 {
		t.Fatalf("new event after replacement failed: cursor=%d events=%d", rt.run.AgentHubEventCursor, len(rt.events))
	}
}

func TestAgentHubRuntimeAppliesDeltaMergePatch(t *testing.T) {
	manager, workspace, _ := newRuntimeTestManager(t, "http://127.0.0.1:1")
	run := agentRun{ID: "run-patch", WorkspaceID: workspace.ID, AgentHubSessionID: "ses_patch", Status: "running"}
	rt := newAgentHubRuntime(manager, workspace, run, nil, nil)
	messages := make(chan agentStreamMessage, 4)
	manager.subscribe(run.ID, messages)
	defer manager.unsubscribe(run.ID, messages)
	delta := func(id int64, text string, patch bool) agentHubEvent {
		payload := map[string]any{"text": text, "method": "item/agentMessage/delta"}
		if patch {
			payload["append"] = true
		}
		raw, _ := json.Marshal(payload)
		return agentHubEvent{
			ID: id, Time: "2026-07-31T15:00:00Z", Type: "message.assistant.delta",
			SessionID: "ses_patch", TurnID: "turn_1", Data: raw,
		}
	}
	if err := rt.applyAgentHubEvent(manager, delta(1, "Hello", false)); err != nil {
		t.Fatal(err)
	}
	<-messages
	if err := rt.applyAgentHubEvent(manager, delta(1, "!", true)); err != nil {
		t.Fatal(err)
	}
	// The stored event accumulates the fragment...
	rt.mu.Lock()
	if rt.run.AgentHubEventCursor != 1 {
		t.Fatalf("patch moved the cursor to %d", rt.run.AgentHubEventCursor)
	}
	if len(rt.events) != 1 {
		t.Fatalf("patch appended instead of extending: %+v", rt.events)
	}
	var stored map[string]any
	if err := json.Unmarshal(rt.events[0].Data, &stored); err != nil {
		t.Fatal(err)
	}
	rt.mu.Unlock()
	if stored["text"] != "Hello!" {
		t.Fatalf("stored text after patch = %v, want %q", stored["text"], "Hello!")
	}
	// ...while subscribers receive only the patch frame.
	broadcast := (<-messages).Event
	if broadcast == nil {
		t.Fatal("expected a published patch frame")
	}
	var patch map[string]any
	if err := json.Unmarshal(broadcast.Data, &patch); err != nil {
		t.Fatal(err)
	}
	if patch["append"] != true || patch["text"] != "!" {
		t.Fatalf("published frame = %+v, want append patch with only the fragment", patch)
	}
	// A full replacement frame still swaps the whole event (reconnect heal).
	if err := rt.applyAgentHubEvent(manager, delta(1, "Hello world!", false)); err != nil {
		t.Fatal(err)
	}
	rt.mu.Lock()
	defer rt.mu.Unlock()
	var healed map[string]any
	if err := json.Unmarshal(rt.events[0].Data, &healed); err != nil {
		t.Fatal(err)
	}
	if healed["text"] != "Hello world!" {
		t.Fatalf("stored text after replacement = %v", healed["text"])
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
	fake := newRuntimeFakeAgentHub()
	fake.stopAtStopping = true
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, configPath := newRuntimeTestManager(t, hub.URL)
	rec, detail := startRuntimeTestRun(t, manager, workspace, `{"agentId":"fake-agent","resourceId":"project1.task1","prompt":"work"}`)
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
	logPath := filepath.Join(filepath.Dir(configPath), "forge.log")
	if logData := string(mustReadFile(t, logPath)); strings.Contains(logData, "session end") {
		t.Fatalf("Forge session ended while AgentHub was only stopping:\n%s", logData)
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
	highWater := session.LastEventID
	fake.mu.Unlock()
	if err := rt.catchUpAgentHub(context.Background(), manager, highWater); err != nil {
		t.Fatal(err)
	}
	waitForRuntimeTest(t, func() bool {
		rt.mu.Lock()
		defer rt.mu.Unlock()
		return rt.run.ForgeSessionID == ""
	})
	if logData := string(mustReadFile(t, logPath)); !strings.Contains(logData, "session end --id session-test") {
		t.Fatalf("durable stopped did not release Forge session:\n%s", logData)
	}
	stopRuntimeTestStream(rt)
}

func TestAgentHubAutoRunRetryUsesMissingStateReason(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, configPath := newRuntimeTestManager(t, hub.URL)
	t.Setenv("FORGE_RUNTIME_AUTORUN_STATE", "running")
	rec, detail := startRuntimeTestRun(t, manager, workspace, `{"agentId":"fake-agent","resourceId":"project1.task1","prompt":"generation one","schedulerTurn":true,"autoRunGeneration":1}`)
	if rec.Code != http.StatusOK {
		t.Fatalf("start failed: %s", rec.Body.String())
	}
	rt := manager.runtimeByID(detail.Run.ID)
	sessionID := detail.Run.AgentHubSessionID
	fake.mu.Lock()
	fake.appendLocked(sessionID, "turn.completed", map[string]any{"summary": "stale turn summary"})
	session := fake.sessions[sessionID]
	session.State = "ready"
	fake.sessions[sessionID] = session
	highWater := session.LastEventID
	fake.mu.Unlock()
	if err := rt.catchUpAgentHub(context.Background(), manager, highWater); err != nil {
		t.Fatal(err)
	}
	logPath := filepath.Join(filepath.Dir(configPath), "forge.log")
	waitForRuntimeTest(t, func() bool {
		data, err := os.ReadFile(logPath)
		return err == nil && strings.Contains(string(data), "--reason=agent did not set AutoRun state")
	})
	logData := string(mustReadFile(t, logPath))
	if strings.Contains(logData, "stale turn summary") {
		t.Fatalf("AutoRun retry reused the previous turn summary:\n%s", logData)
	}
	stopRuntimeTestStream(rt)
}

func TestAgentHubAutoRunTerminalRetainsSession(t *testing.T) {
	for _, terminalState := range []string{"completed", "failed"} {
		t.Run(terminalState, func(t *testing.T) {
			fake := newRuntimeFakeAgentHub()
			hub := httptest.NewServer(fake)
			defer hub.Close()
			manager, workspace, configPath := newRuntimeTestManager(t, hub.URL)
			t.Setenv("FORGE_RUNTIME_AUTORUN_STATE", "waiting")
			rec, detail := startRuntimeTestRun(t, manager, workspace, `{"agentId":"fake-agent","resourceId":"project1.task1","prompt":"generation one","schedulerTurn":true,"autoRunGeneration":1}`)
			if rec.Code != http.StatusOK {
				t.Fatalf("start failed: %s", rec.Body.String())
			}
			rt := manager.runtimeByID(detail.Run.ID)
			sessionID := detail.Run.AgentHubSessionID
			fake.mu.Lock()
			fake.appendLocked(sessionID, "turn.completed", map[string]any{"summary": "waiting"})
			session := fake.sessions[sessionID]
			session.State = "ready"
			fake.sessions[sessionID] = session
			highWater := session.LastEventID
			fake.mu.Unlock()
			if err := rt.catchUpAgentHub(context.Background(), manager, highWater); err != nil {
				t.Fatal(err)
			}
			waitForRuntimeTest(t, func() bool {
				rt.mu.Lock()
				defer rt.mu.Unlock()
				return rt.run.Status == "idle" && !rt.run.SchedulerTurn
			})

			t.Setenv("FORGE_RUNTIME_AUTORUN_STATE", terminalState)
			inputReq := httptest.NewRequest(http.MethodPost, "/input", strings.NewReader(`{"text":"resume generation","schedulerTurn":true,"autoRunGeneration":1}`))
			inputRec := httptest.NewRecorder()
			manager.sendAgentHubInput(inputRec, inputReq, rt, agentInputRequest{
				Text: "resume generation", SchedulerTurn: true, AutoRunGeneration: 1,
			}, "resume generation")
			if inputRec.Code != http.StatusOK {
				t.Fatalf("resume failed: %d %s", inputRec.Code, inputRec.Body.String())
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
			highWater = session.LastEventID
			fake.mu.Unlock()
			if err := rt.catchUpAgentHub(context.Background(), manager, highWater); err != nil {
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
			if forgeSessionID != "session-test" {
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
			logPath := filepath.Join(filepath.Dir(configPath), "forge.log")
			if logData := string(mustReadFile(t, logPath)); strings.Contains(logData, "session end") {
				t.Fatalf("terminal AutoRun released the Forge session:\n%s", logData)
			}
			stopRuntimeTestStream(rt)
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
		AgentID: "fake-agent", AgentHubAgentName: "fake-agent",
		SourceExternalID: workspace.ID + "/run-crashed", ForgeSessionID: "session-test",
		Title: "Recovered AutoRun", Cwd: workspace.Path, Status: "starting",
		SchedulerTurn: true, AutoRunGeneration: 4, PendingInitialMessage: "recover after SIGKILL",
		CreatedAt: time.Now().Format(time.RFC3339), UpdatedAt: time.Now().Format(time.RFC3339),
	}
	if err := saveAgentRun(workspace.Path, run); err != nil {
		t.Fatal(err)
	}
	// This models a GUI/SIGKILL after persisting the Forge session and run
	// projection but before receiving AgentHub's create response.
	if err := manager.recoverAgentHubRun(context.Background(), cfg, client, workspace, run); err != nil {
		t.Fatal(err)
	}
	first := manager.runtimeByID(run.ID)
	stopRuntimeTestStream(first)
	manager.removeRuntime(run.ID)
	reloaded, err := loadAgentRuns(workspace.Path)
	if err != nil || len(reloaded) != 1 {
		t.Fatalf("reload projection: runs=%#v err=%v", reloaded, err)
	}
	// A repeated scheduler/recovery pass must reconcile by full source and
	// attach the same AgentHub session instead of creating another one.
	if err := manager.recoverAgentHubRun(context.Background(), cfg, client, workspace, reloaded[0]); err != nil {
		t.Fatal(err)
	}
	second := manager.runtimeByID(run.ID)
	defer stopRuntimeTestStream(second)
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
	if session.LaunchEnvironment["FORGE_SESSION_ID"] != "session-test" {
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
