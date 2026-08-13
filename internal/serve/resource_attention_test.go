package serve

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"slices"
	"testing"

	"github.com/disksing/forge/internal/app"
)

func attentionTestServer(t *testing.T) (*server, string) {
	t.Helper()
	workspace := t.TempDir()
	forgeWorkspace, err := app.Initialize(workspace, "en")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := forgeWorkspace.CreateProject("Attention project", "attention"); err != nil {
		t.Fatal(err)
	}
	server := &server{config: filepath.Join(t.TempDir(), "gui.json")}
	if err := server.saveConfig(config{Version: agentHubConfigVersion, Workspaces: []guiWorkspace{{ID: "workspace-one", Path: workspace}}, AgentHubEndpoint: "http://127.0.0.1:1"}); err != nil {
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

func TestResourceAttentionAPIDismissesUntilNextTurn(t *testing.T) {
	server, workspace := attentionTestServer(t)
	now := "2026-08-13T00:00:00Z"
	run := agentRun{
		ID: "run-attention", WorkspaceID: "workspace-one", ResourceID: "project1",
		Generation: 1, GenerationID: "gen-attention", AgentHubSessionID: "session-attention",
		Status: "idle", TurnNumber: 3, Title: "Attention", Cwd: workspace, CreatedAt: now, UpdatedAt: now,
	}
	if err := rewriteTestAgentRuns(workspace, []agentRun{run}); err != nil {
		t.Fatal(err)
	}

	recorder := attentionRequest(t, server, http.MethodPut, "/api/workspaces/workspace-one/resources/project1/attention", `{"followed":true}`)
	if recorder.Code != http.StatusOK {
		t.Fatalf("follow returned %d: %s", recorder.Code, recorder.Body.String())
	}
	var state resourceAttentionSnapshot
	if err := json.Unmarshal(recorder.Body.Bytes(), &state); err != nil {
		t.Fatal(err)
	}
	if !state.Followed || state.DismissedTurn != nil {
		t.Fatalf("unexpected followed state: %#v", state)
	}

	recorder = attentionRequest(t, server, http.MethodPost, "/api/workspaces/workspace-one/resources/project1/attention/dismiss", "")
	if recorder.Code != http.StatusOK {
		t.Fatalf("dismiss returned %d: %s", recorder.Code, recorder.Body.String())
	}
	if err := json.Unmarshal(recorder.Body.Bytes(), &state); err != nil {
		t.Fatal(err)
	}
	if state.DismissedTurn == nil || *state.DismissedTurn != 3 {
		t.Fatalf("dismiss did not record current turn: %#v", state)
	}

	tree, err := server.treeAt(context.Background(), workspace)
	if err != nil {
		t.Fatal(err)
	}
	if len(tree.AttentionList) != 0 {
		t.Fatalf("dismissed idle resource should be hidden: %#v", tree.AttentionList)
	}
	if tree.Projects[0].Attention == nil || !tree.Projects[0].Attention.Followed {
		t.Fatalf("tree did not expose project attention state: %#v", tree.Projects[0].Attention)
	}

	run.TurnNumber = 4
	if err := rewriteTestAgentRuns(workspace, []agentRun{run}); err != nil {
		t.Fatal(err)
	}
	tree, err = server.treeAt(context.Background(), workspace)
	if err != nil {
		t.Fatal(err)
	}
	if len(tree.AttentionList) != 1 || tree.AttentionList[0].ID != "project1" {
		t.Fatalf("resource should reappear after next turn: %#v", tree.AttentionList)
	}
}

func TestResourceAttentionActiveTurnAlwaysVisibleAndUIStatePreservesIt(t *testing.T) {
	server, workspace := attentionTestServer(t)
	now := "2026-08-13T00:00:00Z"
	if err := rewriteTestAgentRuns(workspace, []agentRun{{
		ID: "run-active-attention", WorkspaceID: "workspace-one", ResourceID: "project1",
		Generation: 1, GenerationID: "gen-active-attention", AgentHubSessionID: "session-active-attention",
		Status: "running", CurrentTurnID: "turn-active", TurnNumber: 2, Title: "Active", Cwd: workspace, CreatedAt: now, UpdatedAt: now,
	}}); err != nil {
		t.Fatal(err)
	}
	if _, err := server.mutateResourceAttentionAtPath(workspace, "project1", func(state *resourceAttentionState) {
		state.DismissedTurn = cloneIntPointer(intPointer(2))
	}); err != nil {
		t.Fatal(err)
	}
	tree, err := server.treeAt(context.Background(), workspace)
	if err != nil {
		t.Fatal(err)
	}
	if len(tree.AttentionList) != 1 || !tree.AttentionList[0].Runtime.ActiveTurn {
		t.Fatalf("active turn must be visible despite dismiss: %#v", tree.AttentionList)
	}

	recorder := attentionRequest(t, server, http.MethodPut, "/api/workspaces/workspace-one/ui-state", `{"version":1,"expandedProjects":["project1"],"lastResourceId":"project1"}`)
	if recorder.Code != http.StatusOK {
		t.Fatalf("ui-state update returned %d: %s", recorder.Code, recorder.Body.String())
	}
	state, err := server.loadUIState("workspace-one")
	if err != nil {
		t.Fatal(err)
	}
	if state.Attention["project1"].DismissedTurn == nil || *state.Attention["project1"].DismissedTurn != 2 {
		t.Fatalf("ui-state update overwrote attention state: %#v", state.Attention)
	}
}

func TestResourceActiveTurnIgnoresStaleTurnIDOnIdleGeneration(t *testing.T) {
	run := agentRun{Status: "idle", CurrentTurnID: "turn-already-completed"}
	if resourceRunHasActiveTurn(run) {
		t.Fatalf("idle generation with a stale Turn ID must not remain active: %#v", run)
	}
}

func TestResourceAttentionPrefersAnActiveOlderGeneration(t *testing.T) {
	server, workspace := attentionTestServer(t)
	now := "2026-08-13T00:00:00Z"
	if err := rewriteTestAgentRuns(workspace, []agentRun{
		{ID: "run-old-active", WorkspaceID: "workspace-one", ResourceID: "project1", Generation: 1, GenerationID: "gen-old-active", AgentHubSessionID: "session-old-active", Status: "running", CurrentTurnID: "turn-old", TurnNumber: 4, Title: "Old", Cwd: workspace, CreatedAt: now, UpdatedAt: now},
		{ID: "run-new-idle", WorkspaceID: "workspace-one", ResourceID: "project1", Generation: 2, GenerationID: "gen-new-idle", AgentHubSessionID: "session-new-idle", Status: "idle", TurnNumber: 4, Title: "New", Cwd: workspace, CreatedAt: now, UpdatedAt: now},
	}); err != nil {
		t.Fatal(err)
	}
	tree, err := server.treeAt(context.Background(), workspace)
	if err != nil {
		t.Fatal(err)
	}
	if len(tree.AttentionList) != 0 {
		t.Fatalf("retired older generation must be excluded from lifecycle attention: %#v", tree.AttentionList)
	}
}

func TestResourceAttentionSortsByTurnBoundariesInsteadOfRuntimeUpdates(t *testing.T) {
	server, workspace := attentionTestServer(t)
	forgeWorkspace, err := app.OpenWorkspace(workspace)
	if err != nil {
		t.Fatal(err)
	}
	resourceIDs := []string{"project1"}
	for _, title := range []string{"Running older", "Idle older", "Idle newer"} {
		task, createErr := forgeWorkspace.CreateTask(app.CreateTaskInput{ProjectID: "project1", Title: title})
		if createErr != nil {
			t.Fatal(createErr)
		}
		resourceIDs = append(resourceIDs, task.ID)
	}
	for _, resourceID := range resourceIDs {
		if _, err := server.mutateResourceAttentionAtPath(workspace, resourceID, func(state *resourceAttentionState) {
			state.Followed = true
		}); err != nil {
			t.Fatal(err)
		}
	}
	runs := []agentRun{
		{ID: "run-running-newer", ResourceID: resourceIDs[0], Generation: 1, GenerationID: "gen-running-newer", AgentHubSessionID: "session-running-newer", Status: "running", CurrentTurnID: "turn-running-newer", TurnStartedAt: "2026-08-13T00:00:20Z", UpdatedAt: "2026-08-13T00:00:21Z"},
		{ID: "run-running-older", ResourceID: resourceIDs[1], Generation: 1, GenerationID: "gen-running-older", AgentHubSessionID: "session-running-older", Status: "running", CurrentTurnID: "turn-running-older", TurnStartedAt: "2026-08-13T00:00:10Z", UpdatedAt: "2026-08-13T00:00:59Z"},
		{ID: "run-idle-older", ResourceID: resourceIDs[2], Generation: 1, GenerationID: "gen-idle-older", AgentHubSessionID: "session-idle-older", Status: "idle", CompletionAt: "2026-08-13T00:00:30Z", UpdatedAt: "2026-08-13T00:01:00Z"},
		{ID: "run-idle-newer", ResourceID: resourceIDs[3], Generation: 1, GenerationID: "gen-idle-newer", AgentHubSessionID: "session-idle-newer", Status: "idle", CompletionAt: "2026-08-13T00:00:40Z", UpdatedAt: "2026-08-13T00:00:41Z"},
	}
	if err := rewriteTestAgentRuns(workspace, runs); err != nil {
		t.Fatal(err)
	}

	tree, err := server.treeAt(context.Background(), workspace)
	if err != nil {
		t.Fatal(err)
	}
	got := make([]string, 0, len(tree.AttentionList))
	for _, item := range tree.AttentionList {
		got = append(got, item.ID)
	}
	want := []string{resourceIDs[0], resourceIDs[1], resourceIDs[3], resourceIDs[2]}
	if !slices.Equal(got, want) {
		t.Fatalf("Activity order = %v, want %v", got, want)
	}
}

func TestAcceptResourceMessageAutomaticallyFollowsResource(t *testing.T) {
	server, workspace := attentionTestServer(t)
	manager := newAgentManager(server)
	server.agents = manager
	message, err := manager.acceptResourceMessage(context.Background(), guiWorkspace{ID: "workspace-one", Path: workspace}, "project1", resourceMessageRequest{Text: "hello", Role: "user"})
	if err != nil {
		t.Fatal(err)
	}
	if message.ResourceID != "project1" {
		t.Fatalf("message resource id = %q", message.ResourceID)
	}
	state, err := server.attentionForResource(workspace, "project1")
	if err != nil {
		t.Fatal(err)
	}
	if !state.Followed || state.DismissedTurn != nil {
		t.Fatalf("message did not auto-follow resource: %#v", state)
	}
}

func TestCreateProjectAndTaskAutomaticallyFollowResources(t *testing.T) {
	workspace := t.TempDir()
	if _, err := app.Initialize(workspace, "en"); err != nil {
		t.Fatal(err)
	}
	server := &server{config: filepath.Join(t.TempDir(), "gui.json")}
	if err := server.saveConfig(config{Version: agentHubConfigVersion, Workspaces: []guiWorkspace{{ID: "workspace-one", Path: workspace}}, AgentHubEndpoint: "http://127.0.0.1:1"}); err != nil {
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
	state, err := server.attentionForResource(workspace, project.ID)
	if err != nil {
		t.Fatal(err)
	}
	if !state.Followed {
		t.Fatalf("created project was not followed: %#v", state)
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
	state, err = server.attentionForResource(workspace, task.ID)
	if err != nil {
		t.Fatal(err)
	}
	if !state.Followed {
		t.Fatalf("created task was not followed: %#v", state)
	}
}

func TestTurnOrdinalChangesOnlyForNewAgentHubTurn(t *testing.T) {
	workspace := t.TempDir()
	manager := newAgentManager(&server{})
	runtime := &agentRuntime{
		workspace: guiWorkspace{ID: "workspace-one", Path: workspace},
		manager:   manager,
		run:       agentRun{ID: "run-turn-ordinal", WorkspaceID: "workspace-one", ResourceID: "project1", GenerationID: "gen-turn-ordinal", Status: "idle"},
	}
	runtime.applyAgentHubSessionState(manager, agentHubSession{ID: "session-turns", State: "running", CurrentTurnID: "turn-one"})
	if got := runtime.snapshotRun().TurnNumber; got != 1 {
		t.Fatalf("first turn ordinal = %d, want 1", got)
	}
	runtime.applyAgentHubSessionState(manager, agentHubSession{ID: "session-turns", State: "running", CurrentTurnID: "turn-one"})
	if got := runtime.snapshotRun().TurnNumber; got != 1 {
		t.Fatalf("duplicate turn ordinal = %d, want 1", got)
	}
	runtime.applyAgentHubSessionState(manager, agentHubSession{ID: "session-turns", State: "ready", CurrentTurnID: "turn-one"})
	if run := runtime.snapshotRun(); run.CurrentTurnID != "" || resourceRunHasActiveTurn(run) {
		t.Fatalf("ready session retained stale active Turn state: %#v", run)
	}
	runtime.applyAgentHubSessionState(manager, agentHubSession{ID: "session-turns", State: "running", CurrentTurnID: "turn-two"})
	if got := runtime.snapshotRun().TurnNumber; got != 2 {
		t.Fatalf("second turn ordinal = %d, want 2", got)
	}
	stored, err := loadAgentRun(workspace, runtime.snapshotRun().ID)
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
