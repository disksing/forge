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
}
