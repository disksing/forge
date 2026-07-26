package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestActiveAgentRunDetailReturnsOnlyRecentEvents(t *testing.T) {
	workspace := t.TempDir()
	manager := coreTestManager(t, workspace)
	events := make([]agentEvent, agentEventMaxCount+20)
	for index := range events {
		events[index] = agentEvent{ID: int64(index + 1), Type: "event", Text: fmt.Sprintf("event-%d", index+1)}
	}
	manager.registerRuntime(&agentRuntime{
		workspace: guiWorkspace{ID: "workspace-one", Path: workspace},
		run:       agentRun{ID: "run-one", WorkspaceID: "workspace-one", Status: "idle"},
		events:    events,
	})

	recorder := httptest.NewRecorder()
	manager.getRun(recorder, httptest.NewRequest(http.MethodGet, "/runs/run-one", nil), "workspace-one", "run-one")
	if recorder.Code != http.StatusOK {
		t.Fatalf("expected OK, got %d: %s", recorder.Code, recorder.Body.String())
	}
	var detail agentRunDetail
	if err := json.Unmarshal(recorder.Body.Bytes(), &detail); err != nil {
		t.Fatal(err)
	}
	if len(detail.Events) != agentEventMaxCount || detail.Events[0].ID != 21 ||
		detail.Events[len(detail.Events)-1].ID != int64(len(events)) || !detail.EventsTruncated || !detail.EventsHasMore {
		t.Fatalf("unexpected active event tail: %#v", detail)
	}
}

func TestAgentRuntimeRetainsBoundedEventTail(t *testing.T) {
	workspace := t.TempDir()
	initial := make([]agentEvent, agentEventMaxCount)
	for index := range initial {
		initial[index] = agentEvent{ID: int64(index + 1), Type: "event"}
	}
	runtime := &agentRuntime{
		workspace:   guiWorkspace{ID: "workspace-one", Path: workspace},
		run:         agentRun{ID: "run-one", WorkspaceID: "workspace-one", Status: "idle"},
		events:      initial,
		nextEventID: int64(agentEventMaxCount + 1),
	}
	runtime.addEvent(newAgentManager(&server{}), "event", "test", "new event", nil, "")
	events := runtime.snapshotEvents()
	if len(events) != agentEventMaxCount || events[0].ID != 2 || events[len(events)-1].ID != int64(agentEventMaxCount+1) {
		t.Fatalf("runtime did not retain bounded tail: %#v", events)
	}
}

func TestAgentStreamStartsAfterClientCursor(t *testing.T) {
	workspace := t.TempDir()
	manager := coreTestManager(t, workspace)
	events := make([]agentEvent, 5)
	for index := range events {
		events[index] = agentEvent{ID: int64(index + 1), Type: "event", Text: fmt.Sprintf("event-%d", index+1)}
	}
	manager.registerRuntime(&agentRuntime{
		workspace: guiWorkspace{ID: "workspace-one", Path: workspace},
		run:       agentRun{ID: "run-one", WorkspaceID: "workspace-one", Status: "idle"},
		events:    events,
	})
	ctx, cancel := context.WithCancel(context.Background())
	cancel()
	request := httptest.NewRequest(http.MethodGet, "/runs/run-one/stream?after=3", nil).WithContext(ctx)
	request.Header.Set("Last-Event-ID", "4")
	recorder := httptest.NewRecorder()
	manager.stream(recorder, request, "workspace-one", "run-one")
	if recorder.Code != http.StatusOK || strings.Contains(recorder.Body.String(), "id: 4\n") ||
		!strings.Contains(recorder.Body.String(), "id: 5\n") {
		t.Fatalf("stream did not honor newest cursor: code=%d body=%q", recorder.Code, recorder.Body.String())
	}
}

func TestLoadAgentRunsRepairsTrailingGarbageAndDropsLegacyFields(t *testing.T) {
	workspace := t.TempDir()
	indexPath := agentIndexPath(workspace)
	if err := os.MkdirAll(filepath.Dir(indexPath), 0o755); err != nil {
		t.Fatal(err)
	}
	corrupt := `[{"id":"run-one","workspaceId":"workspace-one","provider":"codex","title":"Old","cwd":"` +
		filepath.ToSlash(workspace) + `","status":"stopped","createdAt":"2026-01-01T00:00:00Z","updatedAt":"2026-01-01T00:00:00Z"}] trailing`
	if err := os.WriteFile(indexPath, []byte(corrupt), 0o644); err != nil {
		t.Fatal(err)
	}
	runs, err := loadAgentRuns(workspace)
	if err != nil || len(runs) != 1 || runs[0].ID != "run-one" {
		t.Fatalf("unexpected repaired runs: runs=%#v err=%v", runs, err)
	}
	repaired := mustReadFile(t, indexPath)
	if strings.Contains(string(repaired), `"provider"`) {
		t.Fatalf("repair rewrote a legacy field:\n%s", repaired)
	}
	var decoded []agentRun
	if err := json.Unmarshal(repaired, &decoded); err != nil {
		t.Fatalf("repaired index is invalid JSON: %v", err)
	}
}

func TestEnrichTreeSessionsIncludesAgentHubRunState(t *testing.T) {
	workspace := t.TempDir()
	run := agentRun{
		ID: "run-one", WorkspaceID: "workspace-one", ResourceID: "project1.task1",
		AgentID: "review-agent", ForgeSessionID: "session-one", AgentHubSessionID: "ses_one",
		Title: "Run One", Cwd: workspace, Status: "running",
		CreatedAt: "2026-01-01T00:00:00Z", UpdatedAt: "2026-01-01T00:00:01Z",
		LastOutputAt: "2026-01-01T00:00:02Z", SchedulerTurn: true, AutoRunGeneration: 4,
	}
	if err := rewriteAgentRuns(workspace, []agentRun{run}); err != nil {
		t.Fatal(err)
	}
	tree := workspaceTree{Sessions: []guiSession{
		{ID: "session-one", Controls: []guiSessionControl{{ResourceID: "project1.task1"}}},
		{ID: "external", Controls: []guiSessionControl{{ResourceID: "project1.task2"}}},
	}}
	if err := (&server{}).enrichTreeSessions(workspace, &tree); err != nil {
		t.Fatal(err)
	}
	internal := tree.Sessions[0]
	if internal.Source != "internal" || internal.AgentRunID != run.ID || internal.AgentRunAgentID != run.AgentID ||
		internal.AgentRunStatus != run.Status || internal.AgentRunLastOutputAt != run.LastOutputAt ||
		!internal.SchedulerTurn || internal.AutoRunGeneration != 4 {
		t.Fatalf("internal session was not enriched: %#v", internal)
	}
	if tree.Sessions[1].Source != "external" {
		t.Fatalf("external session was misclassified: %#v", tree.Sessions[1])
	}
}

func TestListRunsFiltersWorkspaceScope(t *testing.T) {
	workspace := t.TempDir()
	now := "2026-01-01T00:00:00Z"
	runs := []agentRun{
		{ID: "workspace-run", WorkspaceID: "workspace-one", Title: "Workspace", Cwd: workspace, Status: "stopped", CreatedAt: now, UpdatedAt: now},
		{ID: "task-run", WorkspaceID: "workspace-one", ResourceID: "project1.task1", Title: "Task", Cwd: workspace, Status: "stopped", CreatedAt: now, UpdatedAt: now},
	}
	if err := rewriteAgentRuns(workspace, runs); err != nil {
		t.Fatal(err)
	}
	manager := coreTestManager(t, workspace)
	recorder := httptest.NewRecorder()
	manager.listRuns(recorder, httptest.NewRequest(http.MethodGet, "/runs?resourceId=workspace", nil), "workspace-one")
	var response struct {
		Runs []agentRun `json:"runs"`
	}
	if err := json.Unmarshal(recorder.Body.Bytes(), &response); err != nil {
		t.Fatal(err)
	}
	if recorder.Code != http.StatusOK || len(response.Runs) != 1 || response.Runs[0].ID != "workspace-run" {
		t.Fatalf("unexpected workspace run filter: code=%d runs=%#v", recorder.Code, response.Runs)
	}
}

func TestCreateForgeSessionUsesAgentHubLiveness(t *testing.T) {
	workspace := t.TempDir()
	temp := t.TempDir()
	argsPath := filepath.Join(temp, "args.txt")
	forgePath := filepath.Join(temp, "forge-fake")
	script := "#!/bin/sh\nprintf '%s\\n' \"$*\" > \"$FORGE_FAKE_ARGS\"\nprintf 'session-created\\n'\n"
	if err := os.WriteFile(forgePath, []byte(script), 0o755); err != nil {
		t.Fatal(err)
	}
	t.Setenv("FORGE_FAKE_ARGS", argsPath)
	manager := newAgentManager(&server{forgePath: forgePath})
	id, err := manager.createForgeSession(context.Background(), guiWorkspace{ID: "workspace-one", Path: workspace},
		agentRun{ID: "run-one", SourceExternalID: "workspace-one/run-one"},
		config{AgentHubEndpoint: defaultAgentHubEndpoint, AgentHubInstanceID: "forge-one"})
	if err != nil || id != "session-created" {
		t.Fatalf("create Forge session: id=%q err=%v", id, err)
	}
	expected := "session new --agenthub --endpoint http://127.0.0.1:4646 --source-instance-id forge-one --source-external-id workspace-one/run-one --starting-grace 30s\n"
	if got := string(mustReadFile(t, argsPath)); got != expected {
		t.Fatalf("unexpected session args: %q", got)
	}
}

func TestAgentRunCwdDefaultsToResourceDirectory(t *testing.T) {
	workspace := t.TempDir()
	resourceDir := filepath.Join(workspace, "project1", "task1")
	if err := os.MkdirAll(resourceDir, 0o755); err != nil {
		t.Fatal(err)
	}
	forgePath := filepath.Join(t.TempDir(), "forge-fake")
	script := "#!/bin/sh\nprintf '{\"path\":\"project1/task1\"}\\n'\n"
	if err := os.WriteFile(forgePath, []byte(script), 0o755); err != nil {
		t.Fatal(err)
	}
	manager := newAgentManager(&server{forgePath: forgePath})
	got, err := manager.agentRunCwd(context.Background(), guiWorkspace{Path: workspace}, "project1.task1", "")
	if err != nil {
		t.Fatal(err)
	}
	want, _ := filepath.Abs(resourceDir)
	if got != want {
		t.Fatalf("expected resource cwd %s, got %s", want, got)
	}
}

func TestHandleSessionLivenessUsesAgentHubRuntimeWithoutLegacyFields(t *testing.T) {
	workspace := t.TempDir()
	manager := coreTestManager(t, workspace)
	manager.registerRuntime(&agentRuntime{
		workspace: guiWorkspace{ID: "workspace-one", Path: workspace},
		run: agentRun{
			ID: "run-one", WorkspaceID: "workspace-one", ForgeSessionID: "session-one",
			AgentHubSessionID: "ses_one", Status: "idle",
		},
	})
	request := httptest.NewRequest(http.MethodGet,
		"/api/internal/session-liveness?workspaceId=workspace-one&runId=run-one&forgeSessionId=session-one", nil)
	recorder := httptest.NewRecorder()
	manager.handleSessionLiveness(recorder, request)
	var response map[string]any
	if err := json.Unmarshal(recorder.Body.Bytes(), &response); err != nil {
		t.Fatal(err)
	}
	if recorder.Code != http.StatusOK || response["active"] != true || response["status"] != "idle" {
		t.Fatalf("unexpected liveness response: %d %#v", recorder.Code, response)
	}
	if len(response) != 2 {
		t.Fatalf("liveness response leaked legacy fields: %#v", response)
	}
}

func TestForgeSessionContextFileCarriesAgentHubLaunchIdentity(t *testing.T) {
	workspace := t.TempDir()
	resourceDir := filepath.Join(workspace, "project1", "task1")
	if err := os.MkdirAll(resourceDir, 0o755); err != nil {
		t.Fatal(err)
	}
	temp := t.TempDir()
	forgePath := filepath.Join(temp, "forge-fake")
	if err := os.WriteFile(forgePath, []byte("#!/bin/sh\nprintf '{\"path\":\"project1/task1\"}\\n'\n"), 0o755); err != nil {
		t.Fatal(err)
	}
	server := &server{forgePath: forgePath, config: filepath.Join(temp, "gui.json")}
	if err := server.saveConfig(config{
		Version: agentHubConfigVersion, AgentHubEndpoint: defaultAgentHubEndpoint, AgentHubInstanceID: "forge-test",
		DefaultAgentName: "default-agent",
	}); err != nil {
		t.Fatal(err)
	}
	manager := newAgentManager(server)
	run := agentRun{
		ID: "run-one", WorkspaceID: "workspace-one", ResourceID: "project1.task1",
		ForgeSessionID: "session-one", AgentHubSessionID: "ses_one", Cwd: resourceDir,
		SchedulerTurn: true, AutoRunGeneration: 3,
	}
	contextPath, err := manager.writeForgeSessionContext(context.Background(), guiWorkspace{Path: workspace}, run)
	if err != nil {
		t.Fatal(err)
	}
	var saved forgeSessionContext
	if err := json.Unmarshal(mustReadFile(t, contextPath), &saved); err != nil {
		t.Fatal(err)
	}
	if saved.ForgeSessionID != "session-one" || saved.RunID != "run-one" ||
		saved.ResourceID != "project1.task1" || saved.AutoRunGeneration != 3 {
		t.Fatalf("unexpected Forge session context: %#v", saved)
	}
}

func TestEndForgeSessionIgnoresAlreadyPrunedSession(t *testing.T) {
	workspace := t.TempDir()
	forgePath := filepath.Join(workspace, "forge-fake")
	if err := os.WriteFile(forgePath, []byte("#!/bin/sh\necho 'forge: session not found' >&2\nexit 1\n"), 0o755); err != nil {
		t.Fatal(err)
	}
	manager := newAgentManager(&server{forgePath: forgePath})
	if err := manager.endForgeSession(context.Background(), guiWorkspace{Path: workspace}, "session-pruned"); err != nil {
		t.Fatalf("already-pruned session should be treated as ended: %v", err)
	}
}

func coreTestManager(t *testing.T, workspace string) *agentManager {
	t.Helper()
	configPath := filepath.Join(t.TempDir(), "gui.json")
	writeCurrentTestConfig(t, configPath, workspace)
	return newAgentManager(&server{config: configPath})
}
