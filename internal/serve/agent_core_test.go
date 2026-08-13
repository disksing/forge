package serve

import (
	"context"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/disksing/forge/internal/app"
)

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
	if err := rewriteTestAgentRuns(workspace, []agentRun{run}); err != nil {
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
