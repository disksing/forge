package serve

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/disksing/forge/internal/app"
)

func TestActiveAgentRunDetailReturnsMetadataOnly(t *testing.T) {
	workspace := t.TempDir()
	manager := coreTestManager(t, workspace)
	manager.registerRuntime(&agentRuntime{
		workspace: guiWorkspace{ID: "workspace-one", Path: workspace},
		run:       agentRun{ID: "run-one", WorkspaceID: "workspace-one", AgentHubSessionID: "ses_one", Status: "idle"},
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
	if detail.Run.ID != "run-one" || detail.Run.AgentHubSessionID != "ses_one" || detail.Run.Status != "idle" {
		t.Fatalf("unexpected run metadata: %#v", detail.Run)
	}
	// Event history is served by the AgentHub proxy, never embedded in the
	// detail response.
	for _, forbidden := range []string{`"events"`, `"eventsTruncated"`, `"eventsHasMore"`} {
		if strings.Contains(recorder.Body.String(), forbidden) {
			t.Fatalf("run detail must not embed event history, found %s in %s", forbidden, recorder.Body.String())
		}
	}
}

func TestLoadAgentRunsRejectsTrailingGarbage(t *testing.T) {
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
	if _, err := loadAgentRuns(workspace); err == nil {
		t.Fatal("expected malformed run index to be rejected")
	}
	unchanged := mustReadFile(t, indexPath)
	if !strings.Contains(string(unchanged), "trailing") {
		t.Fatalf("malformed run index was rewritten: %s", unchanged)
	}
}

func TestEnrichTreeResourceRuntimeUsesGenerationIdentity(t *testing.T) {
	workspace := t.TempDir()
	run := agentRun{
		ID: "run-one", WorkspaceID: "workspace-one", ResourceID: "project1.task1",
		Generation: 1, GenerationID: "gen-one", AgentHubAgentName: "review-agent", AgentHubSessionID: "ses_one",
		Title: "Run One", Cwd: workspace, Status: "running",
		CreatedAt: "2026-01-01T00:00:00Z", UpdatedAt: "2026-01-01T00:00:01Z",
		LastOutputAt: "2026-01-01T00:00:02Z",
	}
	if err := rewriteAgentRuns(workspace, []agentRun{run}); err != nil {
		t.Fatal(err)
	}
	tree := workspaceTree{Projects: []resourceSnapshot{{ID: "project1", Children: []resourceSnapshot{{ID: "project1.task1"}}}}}
	if err := (&server{}).enrichTreeResourceRuntime(workspace, &tree); err != nil {
		t.Fatal(err)
	}
	runtime := tree.Projects[0].Children[0].Runtime
	if runtime == nil || runtime.GenerationID != run.GenerationID || runtime.AgentName != run.AgentHubAgentName ||
		runtime.Status != run.Status || runtime.LastOutputAt != run.LastOutputAt {
		t.Fatalf("resource runtime was not enriched: %#v", runtime)
	}
}

func TestListRunsFiltersWorkspaceScope(t *testing.T) {
	workspace := t.TempDir()
	now := "2026-01-01T00:00:00Z"
	runs := []agentRun{
		{ID: "workspace-run", WorkspaceID: "workspace-one", AgentHubSessionID: "ses_workspace", Title: "Workspace", Cwd: workspace, Status: "stopped", CreatedAt: now, UpdatedAt: now},
		{ID: "task-run", WorkspaceID: "workspace-one", ResourceID: "project1.task1", AgentHubSessionID: "ses_task", Title: "Task", Cwd: workspace, Status: "stopped", CreatedAt: now, UpdatedAt: now},
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

func TestListRunsSortsRFC3339TimestampsByInstant(t *testing.T) {
	workspace := t.TempDir()
	runs := []agentRun{
		{
			ID: "older", WorkspaceID: "workspace-one", ResourceID: "project1",
			AgentHubSessionID: "ses_older", Status: "stopped",
			CreatedAt: "2026-07-27T15:02:26+08:00", UpdatedAt: "2026-07-27T16:19:55+08:00",
		},
		{
			ID: "newer", WorkspaceID: "workspace-one", ResourceID: "project1",
			AgentHubSessionID: "ses_newer", Status: "idle",
			CreatedAt: "2026-07-27T17:01:15+08:00", UpdatedAt: "2026-07-27T09:01:45.789913Z",
		},
	}
	if err := rewriteAgentRuns(workspace, runs); err != nil {
		t.Fatal(err)
	}
	manager := coreTestManager(t, workspace)
	recorder := httptest.NewRecorder()
	manager.listRuns(recorder, httptest.NewRequest(http.MethodGet, "/runs?resourceId=project1", nil), "workspace-one")
	var response struct {
		Runs []agentRun `json:"runs"`
	}
	if err := json.Unmarshal(recorder.Body.Bytes(), &response); err != nil {
		t.Fatal(err)
	}
	if recorder.Code != http.StatusOK || len(response.Runs) != 2 || response.Runs[0].ID != "newer" {
		t.Fatalf("expected parsed RFC3339 instant ordering, code=%d runs=%#v", recorder.Code, response.Runs)
	}
}

func TestCreateForgeSessionUsesAgentHubLiveness(t *testing.T) {
	workspace := t.TempDir()
	if _, err := app.Initialize(workspace, "en"); err != nil {
		t.Fatal(err)
	}
	manager := newAgentManager(&server{})
	id, err := manager.createForgeSession(context.Background(), guiWorkspace{ID: "workspace-one", Path: workspace},
		agentRun{ID: "run-one", SourceExternalID: "workspace-one/run-one"},
		config{AgentHubEndpoint: defaultAgentHubEndpoint, AgentHubInstanceID: "forge-one"})
	if err != nil || id == "" {
		t.Fatalf("create Forge session: id=%q err=%v", id, err)
	}
	if !strings.HasPrefix(id, "legacy-session-") {
		t.Fatalf("legacy compatibility id = %q", id)
	}
	if _, err := os.Stat(filepath.Join(workspace, "forge-sessions.json")); !os.IsNotExist(err) {
		t.Fatalf("legacy Forge Session projection was created: %v", err)
	}
}

func TestAgentRunCwdDefaultsToResourceDirectory(t *testing.T) {
	workspace := t.TempDir()
	forgeWorkspace, err := app.Initialize(workspace, "en")
	if err != nil {
		t.Fatal(err)
	}
	project, err := forgeWorkspace.CreateProject("Cwd project", "cwd")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := forgeWorkspace.CreateTask(app.CreateTaskInput{ProjectID: project.ID, Title: "Cwd task", Slug: "cwd"}); err != nil {
		t.Fatal(err)
	}
	manager := newAgentManager(&server{})
	got, err := manager.agentRunCwd(context.Background(), guiWorkspace{Path: workspace}, "project1.task1", "")
	if err != nil {
		t.Fatal(err)
	}
	detail, err := forgeWorkspace.Resource("project1.task1")
	if err != nil {
		t.Fatal(err)
	}
	want, _ := filepath.Abs(filepath.Join(workspace, filepath.FromSlash(detail.Path)))
	if got != want {
		t.Fatalf("expected resource cwd %s, got %s", want, got)
	}
}

func TestEndForgeSessionIgnoresAlreadyPrunedSession(t *testing.T) {
	workspace := t.TempDir()
	if _, err := app.Initialize(workspace, "en"); err != nil {
		t.Fatal(err)
	}
	manager := newAgentManager(&server{})
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
