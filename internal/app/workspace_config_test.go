package app

import (
	"os"
	"path/filepath"
	"testing"
)

func TestInitializeWritesWorkspaceJSON(t *testing.T) {
	root := t.TempDir()
	if _, err := Initialize(root, "en"); err != nil {
		t.Fatal(err)
	}
	if _, err := os.Stat(filepath.Join(root, workspaceConfigFile)); err != nil {
		t.Fatalf("workspace config was not created at canonical path: %v", err)
	}
	if _, err := os.Stat(filepath.Join(root, legacyWorkspaceConfigFile)); !os.IsNotExist(err) {
		t.Fatalf("legacy workspace config exists after initialization: %v", err)
	}
}

func TestMigrateRenamesLegacyWorkspaceConfig(t *testing.T) {
	root := t.TempDir()
	if _, err := Initialize(root, "en"); err != nil {
		t.Fatal(err)
	}
	canonical := filepath.Join(root, workspaceConfigFile)
	legacy := filepath.Join(root, legacyWorkspaceConfigFile)
	if err := os.Rename(canonical, legacy); err != nil {
		t.Fatal(err)
	}

	workspace, err := OpenWorkspace(root)
	if err != nil {
		t.Fatal(err)
	}
	if err := workspace.Migrate(""); err != nil {
		t.Fatal(err)
	}
	if _, err := os.Stat(canonical); err != nil {
		t.Fatalf("canonical workspace config was not restored: %v", err)
	}
	if _, err := os.Stat(legacy); !os.IsNotExist(err) {
		t.Fatalf("legacy workspace config remains after migration: %v", err)
	}
}
