package app_test

import (
	"path/filepath"
	"testing"

	"github.com/disksing/pua/internal/app"
)

func TestWorkspaceNameFallsBackToDirectoryBaseName(t *testing.T) {
	root := filepath.Join(t.TempDir(), "my-workspace")
	workspace, err := app.Initialize(root, "en")
	if err != nil {
		t.Fatal(err)
	}
	if got := app.WorkspaceName(root); got != "my-workspace" {
		t.Fatalf("workspace name = %q, want directory base name", got)
	}
	if got := app.WorkspaceName(workspace.Root()); got != "my-workspace" {
		t.Fatalf("workspace name from canonical root = %q, want directory base name", got)
	}
}

func TestSetWorkspaceNamePersistsAndClears(t *testing.T) {
	root := filepath.Join(t.TempDir(), "my-workspace")
	workspace, err := app.Initialize(root, "en")
	if err != nil {
		t.Fatal(err)
	}

	if got, err := workspace.SetName("  Forge Workspace  "); err != nil || got != "Forge Workspace" {
		t.Fatalf("set workspace name: got=%q err=%v", got, err)
	}
	if got := app.WorkspaceName(root); got != "Forge Workspace" {
		t.Fatalf("configured workspace name = %q", got)
	}

	reloaded, err := app.OpenWorkspace(root)
	if err != nil {
		t.Fatal(err)
	}
	if got, err := reloaded.SetName(""); err != nil || got != "my-workspace" {
		t.Fatalf("clear workspace name: got=%q err=%v", got, err)
	}
	if got := app.WorkspaceName(root); got != "my-workspace" {
		t.Fatalf("workspace name after clearing = %q, want directory base name", got)
	}
}
