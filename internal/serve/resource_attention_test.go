package serve

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"slices"
	"testing"

	"github.com/disksing/pua/internal/app"
)

func attentionTestServer(t *testing.T) (*server, string) {
	t.Helper()
	workspace := t.TempDir()
	puaWorkspace, err := app.Initialize(workspace, "en")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := puaWorkspace.CreateProject("Attention project", "attention"); err != nil {
		t.Fatal(err)
	}
	server := &server{config: filepath.Join(t.TempDir(), "serve.json")}
	if err := server.saveConfig(config{Version: agentHubConfigVersion, Workspaces: []serveWorkspace{{ID: "workspace-one", Path: workspace}}, AgentHubEndpoint: "http://127.0.0.1:1"}); err != nil {
		t.Fatal(err)
	}
	return server, workspace
}

func attentionRequest(t *testing.T, server *server, method, path, body string) *httptest.ResponseRecorder {
	t.Helper()
	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(method, path, bytes.NewBufferString(body))
	server.handleWorkspace(recorder, request)
	return recorder
}

func TestResourceFavoriteAndReadAPIAreIndependent(t *testing.T) {
	server, workspace := attentionTestServer(t)
	now := "2026-08-13T00:00:00Z"
	record := generationRecord{
		ID: "gen-attention", WorkspaceID: "workspace-one", ResourceID: "project1",
		Generation: 1, GenerationID: "gen-attention", AgentHubSessionID: "session-attention",
		Status: "idle", TurnNumber: 3, Title: "Attention", Cwd: workspace, CreatedAt: now, UpdatedAt: now,
	}
	if err := rewriteTestGenerationRecords(workspace, []generationRecord{record}); err != nil {
		t.Fatal(err)
	}

	recorder := attentionRequest(t, server, http.MethodPut, "/api/workspaces/workspace-one/resources/project1/favorite", `{"favorite":true}`)
	if recorder.Code != http.StatusOK {
		t.Fatalf("favorite returned %d: %s", recorder.Code, recorder.Body.String())
	}
	var state resourceUserStateSnapshot
	if err := json.Unmarshal(recorder.Body.Bytes(), &state); err != nil {
		t.Fatal(err)
	}
	if !state.Favorite || state.ReadTurnNumber != nil {
		t.Fatalf("unexpected favorite state: %#v", state)
	}

	recorder = attentionRequest(t, server, http.MethodPut, "/api/workspaces/workspace-one/resources/project1/read", `{"throughTurnNumber":3}`)
	if recorder.Code != http.StatusOK {
		t.Fatalf("read returned %d: %s", recorder.Code, recorder.Body.String())
	}
	if err := json.Unmarshal(recorder.Body.Bytes(), &state); err != nil {
		t.Fatal(err)
	}
	if state.ReadTurnNumber == nil || *state.ReadTurnNumber != 3 {
		t.Fatalf("read did not record current Turn: %#v", state)
	}
	if !state.Favorite {
		t.Fatalf("reading unexpectedly removed favorite: %#v", state)
	}

	tree, err := server.treeAt(context.Background(), workspace)
	if err != nil {
		t.Fatal(err)
	}
	if len(tree.Activity.Favorites) != 1 || tree.Activity.Favorites[0].ID != "project1" {
		t.Fatalf("read favorite should remain in Favorites: %#v", tree.Activity.Favorites)
	}
	if len(tree.Activity.Unread) != 0 || tree.Projects[0].UnreadCount != 0 {
		t.Fatalf("read resource remained unread: %#v", tree.Activity.Unread)
	}

	record.TurnNumber = 4
	if err := rewriteTestGenerationRecords(workspace, []generationRecord{record}); err != nil {
		t.Fatal(err)
	}
	tree, err = server.treeAt(context.Background(), workspace)
	if err != nil {
		t.Fatal(err)
	}
	if len(tree.Activity.Unread) != 1 || tree.Activity.Unread[0].ID != "project1" || tree.Projects[0].UnreadCount != 1 {
		t.Fatalf("resource should become unread after next Turn: %#v", tree.Activity.Unread)
	}

	recorder = attentionRequest(t, server, http.MethodPut, "/api/workspaces/workspace-one/resources/project1/favorite", `{"favorite":false}`)
	if recorder.Code != http.StatusOK {
		t.Fatalf("unfavorite returned %d: %s", recorder.Code, recorder.Body.String())
	}
	if err := json.Unmarshal(recorder.Body.Bytes(), &state); err != nil {
		t.Fatal(err)
	}
	if state.Favorite || state.ReadTurnNumber == nil || *state.ReadTurnNumber != 3 {
		t.Fatalf("unfavorite changed the read cursor: %#v", state)
	}
}

func TestResourceReadAPIRejectsFutureTurnsAndNeverRegresses(t *testing.T) {
	server, workspace := attentionTestServer(t)
	now := "2026-08-13T00:00:00Z"
	if err := rewriteTestGenerationRecords(workspace, []generationRecord{{
		ID: "gen-read-boundary", WorkspaceID: "workspace-one", ResourceID: "project1",
		Generation: 1, GenerationID: "gen-read-boundary", AgentHubSessionID: "session-read-boundary",
		Status: "idle", TurnNumber: 3, Title: "Read boundary", Cwd: workspace, CreatedAt: now, UpdatedAt: now,
	}}); err != nil {
		t.Fatal(err)
	}

	for _, through := range []int{2, 1} {
		recorder := attentionRequest(t, server, http.MethodPut, "/api/workspaces/workspace-one/resources/project1/read", fmt.Sprintf(`{"throughTurnNumber":%d}`, through))
		if recorder.Code != http.StatusOK {
			t.Fatalf("read through Turn %d returned %d: %s", through, recorder.Code, recorder.Body.String())
		}
		var state resourceUserStateSnapshot
		if err := json.Unmarshal(recorder.Body.Bytes(), &state); err != nil {
			t.Fatal(err)
		}
		if state.ReadTurnNumber == nil || *state.ReadTurnNumber != 2 {
			t.Fatalf("read cursor regressed after Turn %d request: %#v", through, state)
		}
	}

	recorder := attentionRequest(t, server, http.MethodPut, "/api/workspaces/workspace-one/resources/project1/read", `{"throughTurnNumber":4}`)
	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("future read returned %d: %s", recorder.Code, recorder.Body.String())
	}
	state, err := server.resourceUserStateForResource(workspace, "project1")
	if err != nil {
		t.Fatal(err)
	}
	if state.ReadTurnNumber == nil || *state.ReadTurnNumber != 2 {
		t.Fatalf("future read changed cursor: %#v", state)
	}
}

func TestActiveTurnCanBeMarkedReadAndUIStatePreservesResourceState(t *testing.T) {
	server, workspace := attentionTestServer(t)
	now := "2026-08-13T00:00:00Z"
	if err := rewriteTestGenerationRecords(workspace, []generationRecord{{
		ID: "gen-active-attention", WorkspaceID: "workspace-one", ResourceID: "project1",
		Generation: 1, GenerationID: "gen-active-attention", AgentHubSessionID: "session-active-attention",
		Status: "running", CurrentTurnID: "turn-active", TurnNumber: 2, Title: "Active", Cwd: workspace, CreatedAt: now, UpdatedAt: now,
	}}); err != nil {
		t.Fatal(err)
	}
	recorder := attentionRequest(t, server, http.MethodPut, "/api/workspaces/workspace-one/resources/project1/read", `{"throughTurnNumber":2}`)
	if recorder.Code != http.StatusOK {
		t.Fatalf("read active Turn returned %d: %s", recorder.Code, recorder.Body.String())
	}
	tree, err := server.treeAt(context.Background(), workspace)
	if err != nil {
		t.Fatal(err)
	}
	if len(tree.Activity.Running) != 1 || !tree.Activity.Running[0].Runtime.ActiveTurn {
		t.Fatalf("active Turn must remain in Running after read: %#v", tree.Activity.Running)
	}
	if len(tree.Activity.Unread) != 0 {
		t.Fatalf("read active Turn remained unread: %#v", tree.Activity.Unread)
	}

	recorder = attentionRequest(t, server, http.MethodPut, "/api/workspaces/workspace-one/ui-state", `{"version":2,"expandedProjects":["project1"],"lastResourceId":"project1"}`)
	if recorder.Code != http.StatusOK {
		t.Fatalf("ui-state update returned %d: %s", recorder.Code, recorder.Body.String())
	}
	state, err := server.loadUIState("workspace-one")
	if err != nil {
		t.Fatal(err)
	}
	if state.ResourceStates["project1"].ReadTurnNumber == nil || *state.ResourceStates["project1"].ReadTurnNumber != 2 {
		t.Fatalf("ui-state update overwrote resource state: %#v", state.ResourceStates)
	}
}

func TestResourceActiveTurnIgnoresStaleTurnIDOnIdleGeneration(t *testing.T) {
	record := generationRecord{Status: "idle", CurrentTurnID: "turn-already-completed"}
	if generationHasActiveTurn(record) {
		t.Fatalf("idle generation with a stale Turn ID must not remain active: %#v", record)
	}
}

func TestActivityUsesLatestTurnAcrossRetiredGenerations(t *testing.T) {
	server, workspace := attentionTestServer(t)
	now := "2026-08-13T00:00:00Z"
	if err := rewriteTestGenerationRecords(workspace, []generationRecord{
		{ID: "gen-old-active", WorkspaceID: "workspace-one", ResourceID: "project1", Generation: 1, GenerationID: "gen-old-active", AgentHubSessionID: "session-old-active", Status: "running", CurrentTurnID: "turn-old", TurnNumber: 4, Title: "Old", Cwd: workspace, CreatedAt: now, UpdatedAt: now},
		{ID: "gen-new-idle", WorkspaceID: "workspace-one", ResourceID: "project1", Generation: 2, GenerationID: "gen-new-idle", AgentHubSessionID: "session-new-idle", Status: "idle", TurnNumber: 4, Title: "New", Cwd: workspace, CreatedAt: now, UpdatedAt: now},
	}); err != nil {
		t.Fatal(err)
	}
	tree, err := server.treeAt(context.Background(), workspace)
	if err != nil {
		t.Fatal(err)
	}
	if len(tree.Activity.Running) != 0 {
		t.Fatalf("retired older generation must be excluded from Running: %#v", tree.Activity.Running)
	}
	if len(tree.Activity.Unread) != 1 || tree.Activity.Unread[0].LatestTurnNumber != 4 {
		t.Fatalf("latest historical Turn must remain unread: %#v", tree.Activity.Unread)
	}
}

func TestResourceActivityListsAndSortsIndependentCategories(t *testing.T) {
	server, workspace := attentionTestServer(t)
	puaWorkspace, err := app.OpenWorkspace(workspace)
	if err != nil {
		t.Fatal(err)
	}
	resourceIDs := []string{"project1"}
	for _, title := range []string{"Running older", "Idle older", "Idle newer"} {
		task, createErr := puaWorkspace.CreateTask(app.CreateTaskInput{ProjectID: "project1", Title: title})
		if createErr != nil {
			t.Fatal(createErr)
		}
		resourceIDs = append(resourceIDs, task.ID)
	}
	for _, resourceID := range resourceIDs {
		if _, err := server.mutateResourceUserStateAtPath(workspace, resourceID, func(state *resourceUserState) {
			state.Favorite = true
		}); err != nil {
			t.Fatal(err)
		}
	}
	records := []generationRecord{
		{ID: "gen-running-newer", ResourceID: resourceIDs[0], Generation: 1, GenerationID: "gen-running-newer", AgentHubSessionID: "session-running-newer", Status: "running", CurrentTurnID: "turn-running-newer", TurnNumber: 1, TurnStartedAt: "2026-08-13T00:00:20Z", UpdatedAt: "2026-08-13T00:00:21Z"},
		{ID: "gen-running-older", ResourceID: resourceIDs[1], Generation: 1, GenerationID: "gen-running-older", AgentHubSessionID: "session-running-older", Status: "running", CurrentTurnID: "turn-running-older", TurnNumber: 1, TurnStartedAt: "2026-08-13T00:00:10Z", UpdatedAt: "2026-08-13T00:00:59Z"},
		{ID: "gen-idle-older", ResourceID: resourceIDs[2], Generation: 1, GenerationID: "gen-idle-older", AgentHubSessionID: "session-idle-older", Status: "idle", TurnNumber: 1, CompletionAt: "2026-08-13T00:00:30Z", UpdatedAt: "2026-08-13T00:01:00Z"},
		{ID: "gen-idle-newer", ResourceID: resourceIDs[3], Generation: 1, GenerationID: "gen-idle-newer", AgentHubSessionID: "session-idle-newer", Status: "idle", TurnNumber: 1, CompletionAt: "2026-08-13T00:00:40Z", UpdatedAt: "2026-08-13T00:00:41Z"},
	}
	if err := rewriteTestGenerationRecords(workspace, records); err != nil {
		t.Fatal(err)
	}

	tree, err := server.treeAt(context.Background(), workspace)
	if err != nil {
		t.Fatal(err)
	}
	got := make([]string, 0, len(tree.Activity.Favorites))
	for _, item := range tree.Activity.Favorites {
		got = append(got, item.ID)
	}
	want := []string{resourceIDs[3], resourceIDs[2], resourceIDs[0], resourceIDs[1]}
	if !slices.Equal(got, want) {
		t.Fatalf("Favorites order = %v, want %v", got, want)
	}
	running := []string{}
	for _, item := range tree.Activity.Running {
		running = append(running, item.ID)
	}
	if wantRunning := []string{resourceIDs[0], resourceIDs[1]}; !slices.Equal(running, wantRunning) {
		t.Fatalf("Running order = %v, want %v", running, wantRunning)
	}
}

func TestResourceActivityProblemsIncludeOnlyBlockedAndErrorTasks(t *testing.T) {
	server, workspace := attentionTestServer(t)
	puaWorkspace, err := app.OpenWorkspace(workspace)
	if err != nil {
		t.Fatal(err)
	}
	blocked, err := puaWorkspace.CreateTask(app.CreateTaskInput{ProjectID: "project1", Title: "Blocked task"})
	if err != nil {
		t.Fatal(err)
	}
	errorTask, err := puaWorkspace.CreateTask(app.CreateTaskInput{ProjectID: "project1", Title: "Error task"})
	if err != nil {
		t.Fatal(err)
	}
	waiting, err := puaWorkspace.CreateTask(app.CreateTaskInput{ProjectID: "project1", Title: "Waiting task"})
	if err != nil {
		t.Fatal(err)
	}
	if _, err := puaWorkspace.SetTaskState(blocked.ID, app.TaskStateBlocked, "Needs input"); err != nil {
		t.Fatal(err)
	}
	if _, err := puaWorkspace.SetTaskState(errorTask.ID, app.TaskStateError, ""); err != nil {
		t.Fatal(err)
	}
	if _, err := puaWorkspace.SetTaskState(waiting.ID, app.TaskStateWaiting, "Waiting externally"); err != nil {
		t.Fatal(err)
	}

	tree, err := server.treeAt(context.Background(), workspace)
	if err != nil {
		t.Fatal(err)
	}
	got := make([]string, 0, len(tree.Activity.Problems))
	for _, item := range tree.Activity.Problems {
		got = append(got, item.ID)
	}
	if len(got) != 2 || !slices.Contains(got, blocked.ID) || !slices.Contains(got, errorTask.ID) || slices.Contains(got, waiting.ID) {
		t.Fatalf("Problems = %v, want blocked and error Tasks only", got)
	}
}

func TestAcceptResourceMessageDoesNotFavoriteResource(t *testing.T) {
	server, workspace := attentionTestServer(t)
	manager := newAgentManager(server)
	server.agents = manager
	message, err := manager.acceptResourceMessage(context.Background(), serveWorkspace{ID: "workspace-one", Path: workspace}, "project1", resourceMessageRequest{Text: "hello", Role: "user"})
	if err != nil {
		t.Fatal(err)
	}
	if message.ResourceID != "project1" {
		t.Fatalf("message resource id = %q", message.ResourceID)
	}
	state, err := server.resourceUserStateForResource(workspace, "project1")
	if err != nil {
		t.Fatal(err)
	}
	if state.Favorite {
		t.Fatalf("message unexpectedly favorited resource: %#v", state)
	}
}

func TestCreateProjectAndTaskDoNotFavoriteResources(t *testing.T) {
	workspace := t.TempDir()
	if _, err := app.Initialize(workspace, "en"); err != nil {
		t.Fatal(err)
	}
	server := &server{config: filepath.Join(t.TempDir(), "serve.json")}
	if err := server.saveConfig(config{Version: agentHubConfigVersion, Workspaces: []serveWorkspace{{ID: "workspace-one", Path: workspace}}, AgentHubEndpoint: "http://127.0.0.1:1"}); err != nil {
		t.Fatal(err)
	}

	projectResponse := attentionRequest(t, server, http.MethodPost, "/api/workspaces/workspace-one/projects", `{"description":"Created project"}`)
	if projectResponse.Code != http.StatusOK {
		t.Fatalf("project creation returned %d: %s", projectResponse.Code, projectResponse.Body.String())
	}
	var project struct {
		ID string `json:"id"`
	}
	if err := json.Unmarshal(projectResponse.Body.Bytes(), &project); err != nil {
		t.Fatal(err)
	}
	state, err := server.resourceUserStateForResource(workspace, project.ID)
	if err != nil {
		t.Fatal(err)
	}
	if state.Favorite {
		t.Fatalf("created project was unexpectedly favorited: %#v", state)
	}

	taskResponse := attentionRequest(t, server, http.MethodPost, "/api/workspaces/workspace-one/tasks", `{"project":"project1","title":"Created task"}`)
	if taskResponse.Code != http.StatusOK {
		t.Fatalf("task creation returned %d: %s", taskResponse.Code, taskResponse.Body.String())
	}
	var task struct {
		ID string `json:"id"`
	}
	if err := json.Unmarshal(taskResponse.Body.Bytes(), &task); err != nil {
		t.Fatal(err)
	}
	state, err = server.resourceUserStateForResource(workspace, task.ID)
	if err != nil {
		t.Fatal(err)
	}
	if state.Favorite {
		t.Fatalf("created task was unexpectedly favorited: %#v", state)
	}
}

func TestTurnOrdinalChangesOnlyForNewAgentHubTurn(t *testing.T) {
	workspace := t.TempDir()
	manager := newAgentManager(&server{})
	runtime := &agentRuntime{
		workspace: serveWorkspace{ID: "workspace-one", Path: workspace},
		manager:   manager,
		record:    generationRecord{ID: "gen-turn-ordinal", WorkspaceID: "workspace-one", ResourceID: "project1", GenerationID: "gen-turn-ordinal", Status: "idle"},
	}
	runtime.applyAgentHubSessionState(manager, agentHubSession{ID: "session-turns", State: "running", CurrentTurnID: "turn-one"})
	if got := runtime.snapshotGeneration().TurnNumber; got != 1 {
		t.Fatalf("first turn ordinal = %d, want 1", got)
	}
	runtime.applyAgentHubSessionState(manager, agentHubSession{ID: "session-turns", State: "running", CurrentTurnID: "turn-one"})
	if got := runtime.snapshotGeneration().TurnNumber; got != 1 {
		t.Fatalf("duplicate turn ordinal = %d, want 1", got)
	}
	runtime.applyAgentHubSessionState(manager, agentHubSession{ID: "session-turns", State: "ready", CurrentTurnID: "turn-one"})
	if record := runtime.snapshotGeneration(); record.CurrentTurnID != "" || generationHasActiveTurn(record) {
		t.Fatalf("ready session retained stale active Turn state: %#v", record)
	}
	runtime.applyAgentHubSessionState(manager, agentHubSession{ID: "session-turns", State: "running", CurrentTurnID: "turn-two"})
	if got := runtime.snapshotGeneration().TurnNumber; got != 2 {
		t.Fatalf("second turn ordinal = %d, want 2", got)
	}
	stored, err := loadGenerationRecord(workspace, runtime.snapshotGeneration().ID)
	if err != nil {
		t.Fatal(err)
	}
	if stored.TurnNumber != 2 || stored.LastTurnID != "turn-two" {
		t.Fatalf("turn ordinal was not durable: %#v", stored)
	}
}

func intPointer(value int) *int {
	return &value
}
