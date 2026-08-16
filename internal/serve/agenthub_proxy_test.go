package serve

import (
	"bufio"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"testing"
	"time"
)

type proxyFakeAgentHub struct {
	mu                 sync.Mutex
	eventsBody         string
	eventsStatus       int
	eventsQueries      []url.Values
	turnsBody          string
	turnsPaths         []string
	turnsQueries       []url.Values
	streamQueries      []url.Values
	streamLastEventIDs []string
	streamBlock        bool
	streamStarted      chan struct{}
	streamClientGone   chan struct{}
}

func (f *proxyFakeAgentHub) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if !strings.HasPrefix(r.URL.Path, "/v1/sessions/") {
		http.NotFound(w, r)
		return
	}
	if strings.Contains(r.URL.Path, "/turns") {
		f.mu.Lock()
		f.turnsPaths = append(f.turnsPaths, r.URL.Path)
		f.turnsQueries = append(f.turnsQueries, r.URL.Query())
		body := f.turnsBody
		f.mu.Unlock()
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprint(w, body)
		return
	}
	if !strings.HasSuffix(r.URL.Path, "/events") {
		http.NotFound(w, r)
		return
	}
	if r.URL.Query().Get("stream") == "true" {
		f.serveStream(w, r)
		return
	}
	f.mu.Lock()
	f.eventsQueries = append(f.eventsQueries, r.URL.Query())
	body, status := f.eventsBody, f.eventsStatus
	f.mu.Unlock()
	if status == 0 {
		status = http.StatusOK
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	fmt.Fprint(w, body)
}

func (f *proxyFakeAgentHub) serveStream(w http.ResponseWriter, r *http.Request) {
	f.mu.Lock()
	f.streamQueries = append(f.streamQueries, r.URL.Query())
	f.streamLastEventIDs = append(f.streamLastEventIDs, r.Header.Get("Last-Event-ID"))
	block := f.streamBlock
	f.mu.Unlock()
	if f.streamStarted != nil {
		select {
		case f.streamStarted <- struct{}{}:
		default:
		}
	}
	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "no flusher", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "text/event-stream")
	fmt.Fprint(w, "id: 1\ndata: {\"id\":1,\"type\":\"session.state\",\"sessionId\":\"ses_one\",\"data\":{\"state\":\"ready\"}}\n\n")
	flusher.Flush()
	if block {
		<-r.Context().Done()
		if f.streamClientGone != nil {
			select {
			case f.streamClientGone <- struct{}{}:
			default:
			}
		}
	}
}

func newProxyTestManager(t *testing.T, hubURL string) (*agentManager, serveWorkspace) {
	t.Helper()
	workspace := serveWorkspace{ID: "workspace-one", Path: t.TempDir()}
	configPath := filepath.Join(t.TempDir(), "serve.json")
	data, err := json.Marshal(agentHubServeConfig{
		Version: agentHubConfigVersion, Workspaces: []serveWorkspace{workspace},
		AgentHubEndpoint: hubURL, AgentHubInstanceID: "pua-proxy-test",
		AgentProfiles: []agentHubProfileRoute{{Key: "default", AgentName: "fake-agent"}},
	})
	if err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(configPath, data, 0o600); err != nil {
		t.Fatal(err)
	}
	srv := &server{config: configPath}
	manager := newAgentManager(srv)
	srv.agents = manager
	return manager, workspace
}

func registerProxyTestRun(manager *agentManager, workspace serveWorkspace, run agentRun) {
	manager.registerRuntime(&agentRuntime{workspace: workspace, run: run})
}

func (f *proxyFakeAgentHub) eventsQuery(t *testing.T, index int) url.Values {
	t.Helper()
	f.mu.Lock()
	defer f.mu.Unlock()
	if len(f.eventsQueries) <= index {
		t.Fatalf("AgentHub received %d events requests, want at least %d", len(f.eventsQueries), index+1)
	}
	return f.eventsQueries[index]
}

func TestAgentHubProxyEventsPassesQueryBodyAndCacheHeader(t *testing.T) {
	fake := &proxyFakeAgentHub{eventsBody: `{"events":[{"id":7,"type":"provider.event"}],"page":{"before":8,"nextBefore":1,"hasMoreBefore":true}}`}
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace := newProxyTestManager(t, hub.URL)
	registerProxyTestRun(manager, workspace, agentRun{
		ID: "run-one", WorkspaceID: workspace.ID, AgentHubSessionID: "ses_one", Status: "idle",
	})

	request := httptest.NewRequest(http.MethodGet,
		"/api/workspaces/workspace-one/agent/runs/run-one/events?before=8&limit=250", nil)
	recorder := httptest.NewRecorder()
	manager.proxyAgentHubEvents(recorder, request, workspace.ID, "run-one")
	if recorder.Code != http.StatusOK {
		t.Fatalf("proxy events failed: %d %s", recorder.Code, recorder.Body.String())
	}
	if got := recorder.Header().Get("Cache-Control"); got != "no-store" {
		t.Fatalf("events proxy must disable caching, got Cache-Control %q", got)
	}
	if recorder.Body.String() != fake.eventsBody {
		t.Fatalf("events body was not forwarded verbatim:\nwant: %s\ngot:  %s", fake.eventsBody, recorder.Body.String())
	}
	query := fake.eventsQuery(t, 0)
	if query.Get("before") != "8" || query.Get("limit") != "250" || query.Get("after") != "" || query.Get("latest") != "" {
		t.Fatalf("events query was not forwarded verbatim: %s", query.Encode())
	}

	second := httptest.NewRequest(http.MethodGet,
		"/api/workspaces/workspace-one/agent/runs/run-one/events?latest=true&limit=250", nil)
	secondRecorder := httptest.NewRecorder()
	manager.proxyAgentHubEvents(secondRecorder, second, workspace.ID, "run-one")
	if secondRecorder.Code != http.StatusOK {
		t.Fatalf("proxy latest events failed: %d %s", secondRecorder.Code, secondRecorder.Body.String())
	}
	latestQuery := fake.eventsQuery(t, 1)
	if latestQuery.Get("latest") != "true" || latestQuery.Get("limit") != "250" || latestQuery.Get("before") != "" {
		t.Fatalf("latest query was not forwarded verbatim: %s", latestQuery.Encode())
	}
}

func TestAgentHubProxyBoundedEvents(t *testing.T) {
	fake := &proxyFakeAgentHub{eventsBody: `{"events":[]}`}
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace := newProxyTestManager(t, hub.URL)
	registerProxyTestRun(manager, workspace, agentRun{ID: "run-one", WorkspaceID: workspace.ID, AgentHubSessionID: "ses_one", Status: "idle"})

	bounded := httptest.NewRecorder()
	manager.proxyAgentHubEvents(bounded, httptest.NewRequest(http.MethodGet, "/runs/run-one/events?start=2&end=9&after=5&limit=3", nil), workspace.ID, "run-one")
	if bounded.Code != http.StatusOK {
		t.Fatalf("bounded Event proxy = %d %s", bounded.Code, bounded.Body.String())
	}
	query := fake.eventsQuery(t, 0)
	if query.Get("start") != "2" || query.Get("end") != "9" || query.Get("after") != "5" || query.Get("limit") != "3" {
		t.Fatalf("bounded Event query = %s", query.Encode())
	}
}

func TestAgentHubProxyEventsSingleUpstreamRequestPerClientPage(t *testing.T) {
	fake := &proxyFakeAgentHub{eventsBody: `{"events":[],"page":{"hasMoreBefore":true}}`}
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace := newProxyTestManager(t, hub.URL)
	registerProxyTestRun(manager, workspace, agentRun{
		ID: "run-one", WorkspaceID: workspace.ID, AgentHubSessionID: "ses_one", Status: "idle",
	})

	latest := httptest.NewRecorder()
	manager.proxyAgentHubEvents(latest, httptest.NewRequest(http.MethodGet, "/runs/run-one/events?latest=true&limit=250", nil),
		workspace.ID, "run-one")
	if latest.Code != http.StatusOK {
		t.Fatalf("latest page failed: %d %s", latest.Code, latest.Body.String())
	}
	fake.mu.Lock()
	queries := len(fake.eventsQueries)
	fake.mu.Unlock()
	if queries != 1 {
		t.Fatalf("one client page must fan out to exactly one upstream events request, got %d", queries)
	}
}

func TestAgentHubProxyEventsWithoutRuntimeLoadsRunFromDisk(t *testing.T) {
	fake := &proxyFakeAgentHub{eventsBody: `{"events":[],"page":{"after":3,"nextAfter":3,"hasMore":false},"latestCursor":3}`}
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace := newProxyTestManager(t, hub.URL)
	now := time.Now().Format(time.RFC3339)
	if err := saveAgentRun(workspace.Path, agentRun{
		ID: "run-disk", WorkspaceID: workspace.ID, AgentHubSessionID: "ses_disk",
		Title: "Disk", Cwd: workspace.Path, Status: "stopped", CreatedAt: now, UpdatedAt: now,
	}); err != nil {
		t.Fatal(err)
	}

	request := httptest.NewRequest(http.MethodGet,
		"/api/workspaces/workspace-one/agent/runs/run-disk/events?after=3&limit=10", nil)
	recorder := httptest.NewRecorder()
	manager.proxyAgentHubEvents(recorder, request, workspace.ID, "run-disk")
	if recorder.Code != http.StatusOK {
		t.Fatalf("proxy disk-run events failed: %d %s", recorder.Code, recorder.Body.String())
	}
	if recorder.Body.String() != fake.eventsBody {
		t.Fatalf("disk-run events body mismatch: %s", recorder.Body.String())
	}
	query := fake.eventsQuery(t, 0)
	if query.Get("after") != "3" || query.Get("limit") != "10" {
		t.Fatalf("disk-run query mismatch: %s", query.Encode())
	}
}

func TestAgentHubProxyEventsRunLookupFailures(t *testing.T) {
	fake := &proxyFakeAgentHub{eventsBody: `{"events":[]}`}
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace := newProxyTestManager(t, hub.URL)
	registerProxyTestRun(manager, workspace, agentRun{
		ID: "run-unbound", WorkspaceID: workspace.ID, Status: "idle",
	})

	missing := httptest.NewRecorder()
	manager.proxyAgentHubEvents(missing, httptest.NewRequest(http.MethodGet, "/runs/run-missing/events", nil),
		workspace.ID, "run-missing")
	if missing.Code != http.StatusNotFound {
		t.Fatalf("unknown run must return 404, got %d: %s", missing.Code, missing.Body.String())
	}

	unbound := httptest.NewRecorder()
	manager.proxyAgentHubEvents(unbound, httptest.NewRequest(http.MethodGet, "/runs/run-unbound/events", nil),
		workspace.ID, "run-unbound")
	if unbound.Code != http.StatusConflict || !strings.Contains(unbound.Body.String(), "not attached to AgentHub") {
		t.Fatalf("unbound run must return 409, got %d: %s", unbound.Code, unbound.Body.String())
	}

	streamUnbound := httptest.NewRecorder()
	manager.proxyAgentHubStream(streamUnbound, httptest.NewRequest(http.MethodGet, "/runs/run-unbound/stream", nil),
		workspace.ID, "run-unbound")
	if streamUnbound.Code != http.StatusConflict {
		t.Fatalf("unbound stream must return 409, got %d: %s", streamUnbound.Code, streamUnbound.Body.String())
	}
	if len(fake.eventsQueries) != 0 {
		t.Fatalf("lookup failures must not reach AgentHub: %#v", fake.eventsQueries)
	}
}

func TestAgentHubProxyEventsMapsUpstreamErrors(t *testing.T) {
	fake := &proxyFakeAgentHub{
		eventsStatus: http.StatusBadRequest,
		eventsBody:   `{"error":{"code":"invalid_event_cursor","message":"before and latest are mutually exclusive"}}`,
	}
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace := newProxyTestManager(t, hub.URL)
	registerProxyTestRun(manager, workspace, agentRun{
		ID: "run-one", WorkspaceID: workspace.ID, AgentHubSessionID: "ses_one", Status: "idle",
	})

	recorder := httptest.NewRecorder()
	manager.proxyAgentHubEvents(recorder, httptest.NewRequest(http.MethodGet, "/runs/run-one/events?before=1&latest=true", nil),
		workspace.ID, "run-one")
	if recorder.Code != http.StatusBadRequest || !strings.Contains(recorder.Body.String(), "invalid_event_cursor") {
		t.Fatalf("upstream 400 must keep its status and code, got %d: %s", recorder.Code, recorder.Body.String())
	}

	fake.mu.Lock()
	fake.eventsStatus = http.StatusInternalServerError
	fake.eventsBody = `{"error":{"code":"internal","message":"boom"}}`
	fake.mu.Unlock()
	failing := httptest.NewRecorder()
	manager.proxyAgentHubEvents(failing, httptest.NewRequest(http.MethodGet, "/runs/run-one/events", nil),
		workspace.ID, "run-one")
	if failing.Code != http.StatusBadGateway || !strings.Contains(failing.Body.String(), "boom") {
		t.Fatalf("upstream 500 must map to 502, got %d: %s", failing.Code, failing.Body.String())
	}
}

func proxyServeServer(t *testing.T, manager *agentManager, workspaceID, runID, endpoint string) *httptest.Server {
	t.Helper()
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		manager.proxyAgentHubStream(w, r, workspaceID, runID)
	}))
	t.Cleanup(server.Close)
	return server
}

func readStreamUntil(t *testing.T, reader *bufio.Reader, marker string) string {
	t.Helper()
	var builder strings.Builder
	for !strings.Contains(builder.String(), marker) {
		line, err := reader.ReadString('\n')
		if err != nil {
			t.Fatalf("stream ended before %q: %v; received %q", marker, err, builder.String())
		}
		builder.WriteString(line)
	}
	return builder.String()
}

func TestAgentHubProxyStreamForwardsFramesCursorAndCacheHeader(t *testing.T) {
	fake := &proxyFakeAgentHub{}
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace := newProxyTestManager(t, hub.URL)
	registerProxyTestRun(manager, workspace, agentRun{
		ID: "run-one", WorkspaceID: workspace.ID, AgentHubSessionID: "ses_one", Status: "idle",
	})
	serveServer := proxyServeServer(t, manager, workspace.ID, "run-one", "stream")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	request, err := http.NewRequestWithContext(ctx, http.MethodGet, serveServer.URL+"/stream?after=3", nil)
	if err != nil {
		t.Fatal(err)
	}
	request.Header.Set("Last-Event-ID", "4")
	response, err := serveServer.Client().Do(request)
	if err != nil {
		t.Fatal(err)
	}
	defer response.Body.Close()
	if response.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(response.Body)
		t.Fatalf("stream failed: %d %s", response.StatusCode, body)
	}
	if got := response.Header.Get("Cache-Control"); got != "no-store" {
		t.Fatalf("stream proxy must disable caching, got Cache-Control %q", got)
	}
	if got := response.Header.Get("Content-Type"); !strings.HasPrefix(got, "text/event-stream") {
		t.Fatalf("stream content type = %q", got)
	}
	body, err := io.ReadAll(response.Body)
	if err != nil {
		t.Fatal(err)
	}
	want := "id: 1\ndata: {\"id\":1,\"type\":\"session.state\",\"sessionId\":\"ses_one\",\"data\":{\"state\":\"ready\"}}\n\n"
	if string(body) != want {
		t.Fatalf("stream frames were not forwarded verbatim:\nwant: %q\ngot:  %q", want, body)
	}

	fake.mu.Lock()
	defer fake.mu.Unlock()
	if len(fake.streamQueries) != 1 {
		t.Fatalf("expected one upstream stream request, got %d", len(fake.streamQueries))
	}
	query := fake.streamQueries[0]
	if query.Get("stream") != "true" || query.Get("after") != "4" {
		t.Fatalf("stream query mismatch: %s", query.Encode())
	}
	if fake.streamLastEventIDs[0] != "4" {
		t.Fatalf("Last-Event-ID was not forwarded: %#v", fake.streamLastEventIDs)
	}
}

func TestAgentHubProxyStreamInterleavesPUANotice(t *testing.T) {
	fake := &proxyFakeAgentHub{
		streamBlock:      true,
		streamStarted:    make(chan struct{}, 1),
		streamClientGone: make(chan struct{}, 1),
	}
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace := newProxyTestManager(t, hub.URL)
	registerProxyTestRun(manager, workspace, agentRun{
		ID: "run-one", WorkspaceID: workspace.ID, AgentHubSessionID: "ses_one", Status: "idle",
	})
	serveServer := proxyServeServer(t, manager, workspace.ID, "run-one", "stream")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	request, err := http.NewRequestWithContext(ctx, http.MethodGet, serveServer.URL+"/stream", nil)
	if err != nil {
		t.Fatal(err)
	}
	response, err := serveServer.Client().Do(request)
	if err != nil {
		t.Fatal(err)
	}
	defer response.Body.Close()
	reader := bufio.NewReader(response.Body)
	if got := readStreamUntil(t, reader, `"state":"ready"`); !strings.Contains(got, "id: 1\n") {
		t.Fatalf("upstream frame missing before notice: %q", got)
	}

	manager.publishNotice("run-one", puaNotice{
		Source: "pua", Type: "pua.notice", Time: "2026-08-01T00:00:00Z",
		Data: puaNoticeData{Level: "error", Method: "agenthub/recovery", Text: "synthetic proxy notice"},
	})
	got := readStreamUntil(t, reader, "event: pua.notice")
	got += readStreamUntil(t, reader, "synthetic proxy notice")
	if strings.Contains(got, "\nid:") {
		t.Fatalf("notice must not carry an AgentHub event id: %q", got)
	}

	cancel()
	select {
	case <-fake.streamClientGone:
	case <-time.After(5 * time.Second):
		t.Fatal("browser disconnect did not cancel the upstream stream")
	}
}

func TestAgentHubProxyStreamDisconnectCancelsUpstream(t *testing.T) {
	fake := &proxyFakeAgentHub{
		streamBlock:      true,
		streamStarted:    make(chan struct{}, 1),
		streamClientGone: make(chan struct{}, 1),
	}
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace := newProxyTestManager(t, hub.URL)
	registerProxyTestRun(manager, workspace, agentRun{
		ID: "run-one", WorkspaceID: workspace.ID, AgentHubSessionID: "ses_one", Status: "idle",
	})
	serveServer := proxyServeServer(t, manager, workspace.ID, "run-one", "stream")

	ctx, cancel := context.WithCancel(context.Background())
	request, err := http.NewRequestWithContext(ctx, http.MethodGet, serveServer.URL+"/stream", nil)
	if err != nil {
		t.Fatal(err)
	}
	response, err := serveServer.Client().Do(request)
	if err != nil {
		t.Fatal(err)
	}
	defer response.Body.Close()
	reader := bufio.NewReader(response.Body)
	readStreamUntil(t, reader, "id: 1")
	cancel()
	select {
	case <-fake.streamClientGone:
	case <-time.After(5 * time.Second):
		t.Fatal("closing the browser stream did not cancel the upstream AgentHub request")
	}
}
