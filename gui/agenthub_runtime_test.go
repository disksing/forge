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
	mu                 sync.Mutex
	sessions           map[string]agentHubSession
	events             map[string][]agentHubEvent
	nextSession        int
	abortNextCreate    bool
	duplicateSource    bool
	gapAfter           int64
	stopAtStopping     bool
	failNextResume     bool
	messageSteers      []bool
	actions            []string
	resumeEnvironments []map[string]string
	listCalls          int
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
		resumeDetail.Run.ForgeSessionID != "session-test" {
		t.Fatalf("stopped resume did not rebuild a live projection: %#v", resumeDetail.Run)
	}
	fake.mu.Lock()
	resumeEnvs := append([]map[string]string(nil), fake.resumeEnvironments...)
	steers := append([]bool(nil), fake.messageSteers...)
	actions := strings.Join(fake.actions, ",")
	fake.mu.Unlock()
	if len(resumeEnvs) != 1 || resumeEnvs[0]["FORGE_SESSION_ID"] != "session-test" {
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
	if eventsCalls != 0 || streamCalls != 0 {
		t.Fatalf("restart must not read event history or open streams: events=%d streams=%d", eventsCalls, streamCalls)
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
	fake.mu.Unlock()
	if err := manager.pollAgentHubSessions(context.Background()); err != nil {
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
	logPath := filepath.Join(filepath.Dir(configPath), "forge.log")
	waitForRuntimeTest(t, func() bool {
		data, err := os.ReadFile(logPath)
		return err == nil && strings.Contains(string(data), "--reason=agent did not set AutoRun state")
	})
	logData := string(mustReadFile(t, logPath))
	if strings.Contains(logData, "stale turn summary") {
		t.Fatalf("AutoRun retry reused the previous turn summary:\n%s", logData)
	}
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
			fake.mu.Unlock()
			if err := manager.pollAgentHubSessions(context.Background()); err != nil {
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

func forgeRuntimeLog(t *testing.T, configPath string) string {
	t.Helper()
	data, err := os.ReadFile(filepath.Join(filepath.Dir(configPath), "forge.log"))
	if err != nil {
		t.Fatal(err)
	}
	return string(data)
}

func TestAgentHubStoppedResumeReleasesStaleForgeSession(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, configPath := newRuntimeTestManager(t, hub.URL)
	run := seedStoppedResumeRun(t, fake, workspace, agentRun{
		ID: "run-stopped", ResourceID: "project1.task1",
		AgentHubSessionID: "ses_old", ForgeSessionID: "session-old",
	})
	run.ForgeSessionContextPath = filepath.Join(workspace.Path, "project1", "task1", ".forge", "codex-session.json")
	if err := os.MkdirAll(filepath.Dir(run.ForgeSessionContextPath), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(run.ForgeSessionContextPath, []byte(`{"version":2,"forgeSessionId":"session-old"}`), 0o600); err != nil {
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
	if detail.Run.Status != "idle" || detail.Run.AgentHubStoppedObserved || detail.Run.ForgeSessionID != "session-test" {
		t.Fatalf("stopped resume projection mismatch: %#v", detail.Run)
	}
	fake.mu.Lock()
	session := fake.sessions["ses_old"]
	resumeEnvs := append([]map[string]string(nil), fake.resumeEnvironments...)
	fake.mu.Unlock()
	if session.LaunchEnvironment["FORGE_SESSION_ID"] != "session-test" {
		t.Fatalf("AgentHub session kept the stale launch environment: %#v", session.LaunchEnvironment)
	}
	if len(resumeEnvs) != 1 || resumeEnvs[0]["FORGE_SESSION_ID"] != "session-test" {
		t.Fatalf("stopped resume did not pass the replacement Forge session overlay: %#v", resumeEnvs)
	}
	log := forgeRuntimeLog(t, configPath)
	releaseIndex := strings.Index(log, "session end --id session-old")
	createIndex := strings.Index(log, "session new")
	if releaseIndex < 0 || createIndex < 0 || releaseIndex > createIndex {
		t.Fatalf("stale Forge session must be released before the replacement is created:\n%s", log)
	}
	for _, want := range []string{
		"session lock --id session-test --project project1 --task 1",
		"session bind-agenthub --id session-test --agenthub-session-id ses_old",
	} {
		if !strings.Contains(log, want) {
			t.Fatalf("replacement Forge session flow is missing %q:\n%s", want, log)
		}
	}
	contextData, err := os.ReadFile(run.ForgeSessionContextPath)
	if err != nil {
		t.Fatalf("replacement context missing: %v", err)
	}
	if !strings.Contains(string(contextData), `"forgeSessionId": "session-test"`) {
		t.Fatalf("context still references the stale Forge session: %s", contextData)
	}
	persisted, err := loadAgentRuns(workspace.Path)
	if err != nil || len(persisted) != 1 {
		t.Fatalf("reload run: runs=%#v err=%v", persisted, err)
	}
	if persisted[0].ForgeSessionID != "session-test" || persisted[0].AgentHubStoppedObserved || persisted[0].Status != "idle" {
		t.Fatalf("persisted run mismatch: %#v", persisted[0])
	}
}

func TestAgentHubStoppedResumeFailureCleansUpForgeSession(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	fake.failNextResume = true
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, configPath := newRuntimeTestManager(t, hub.URL)
	run := seedStoppedResumeRun(t, fake, workspace, agentRun{
		ID: "run-stopped", AgentHubSessionID: "ses_old",
	})

	recorder := resumeRunRequest(manager, workspace, run.ID)
	if recorder.Code != http.StatusBadGateway {
		t.Fatalf("failed AgentHub resume must surface as 502, got %d %s", recorder.Code, recorder.Body.String())
	}
	log := forgeRuntimeLog(t, configPath)
	createIndex := strings.Index(log, "session new")
	cleanupIndex := strings.Index(log, "session end --id session-test")
	if createIndex < 0 || cleanupIndex < 0 || cleanupIndex < createIndex {
		t.Fatalf("failed resume must release the replacement Forge session:\n%s", log)
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

func TestAgentHubLiveResumeKeepsLegacyBehavior(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, configPath := newRuntimeTestManager(t, hub.URL)
	recorder, detail := startRuntimeTestRun(t, manager, workspace, `{"title":"Live resume","agentId":"fake-agent"}`)
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
	if log := forgeRuntimeLog(t, configPath); strings.Count(log, "session new") != 1 {
		t.Fatalf("live resume must not create a replacement Forge session:\n%s", log)
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
