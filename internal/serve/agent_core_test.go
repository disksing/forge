package serve

import (
	"context"
	"path/filepath"
	"testing"

	"github.com/disksing/pua/internal/app"
)

func TestEnrichTreeResourceRuntimeUsesGenerationIdentity(t *testing.T) {
	workspace := t.TempDir()
	record := generationRecord{
		ID: "gen-one", WorkspaceID: "workspace-one", ResourceID: "project1.task1",
		Generation: 1, GenerationID: "gen-one", AgentHubAgentName: "review-agent", AgentHubSessionID: "ses_one",
		Title: "Run One", Cwd: workspace, Status: "running",
		CreatedAt: "2026-01-01T00:00:00Z", UpdatedAt: "2026-01-01T00:00:01Z",
		LastOutputAt: "2026-01-01T00:00:02Z",
	}
	if err := rewriteTestGenerationRecords(workspace, []generationRecord{record}); err != nil {
		t.Fatal(err)
	}
	tree := workspaceTree{Projects: []resourceSnapshot{{ID: "project1", Children: []resourceSnapshot{{ID: "project1.task1"}}}}}
	if err := (&server{}).enrichTreeResourceRuntime(workspace, &tree); err != nil {
		t.Fatal(err)
	}
	runtime := tree.Projects[0].Children[0].Runtime
	if runtime == nil || runtime.GenerationID != record.GenerationID || runtime.AgentName != record.AgentHubAgentName ||
		runtime.Status != record.Status || runtime.LastOutputAt != record.LastOutputAt {
		t.Fatalf("resource runtime was not enriched: %#v", runtime)
	}
}

func TestEnrichTreeResourceRuntimeIncludesWorkspaceSessionState(t *testing.T) {
	workspace := t.TempDir()
	record := generationRecord{
		ID: "gen-workspace", WorkspaceID: "workspace-one", ResourceID: "workspace",
		Generation: 1, GenerationID: "gen-workspace", AgentHubSessionID: "ses_workspace",
		Title: "Workspace run", Cwd: workspace, Status: "running",
		CreatedAt: "2026-01-01T00:00:00Z", UpdatedAt: "2026-01-01T00:00:01Z",
	}
	if err := rewriteTestGenerationRecords(workspace, []generationRecord{record}); err != nil {
		t.Fatal(err)
	}
	tree := workspaceTree{Workspace: resourceSnapshot{ID: "workspace", Type: "workspace"}}
	if err := (&server{}).enrichTreeResourceRuntime(workspace, &tree); err != nil {
		t.Fatal(err)
	}
	if tree.Workspace.Runtime == nil || tree.Workspace.Runtime.GenerationID != record.GenerationID || tree.Workspace.Runtime.SessionState != "working" {
		t.Fatalf("Workspace runtime was not enriched: %#v", tree.Workspace.Runtime)
	}
}

func TestGenerationCwdDefaultsToResourceDirectory(t *testing.T) {
	workspace := t.TempDir()
	puaWorkspace, err := app.Initialize(workspace, "en")
	if err != nil {
		t.Fatal(err)
	}
	project, err := puaWorkspace.CreateProject("Cwd project", "cwd")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := puaWorkspace.CreateTask(app.CreateTaskInput{ProjectID: project.ID, Title: "Cwd task", Slug: "cwd"}); err != nil {
		t.Fatal(err)
	}
	manager := newAgentManager(&server{})
	got, err := manager.generationCwd(context.Background(), serveWorkspace{Path: workspace}, "project1.task1", "")
	if err != nil {
		t.Fatal(err)
	}
	detail, err := puaWorkspace.Resource("project1.task1")
	if err != nil {
		t.Fatal(err)
	}
	want, _ := filepath.Abs(filepath.Join(workspace, filepath.FromSlash(detail.Path)))
	if got != want {
		t.Fatalf("expected resource cwd %s, got %s", want, got)
	}
}
