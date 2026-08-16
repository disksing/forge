package workspacepath

import (
	"os"
	"path/filepath"
	"testing"
)

func TestResolveControlDir(t *testing.T) {
	root := t.TempDir()
	current := filepath.Join(root, ControlDirName)

	if got, err := ResolveControlDir(root); err != nil || got != current {
		t.Fatalf("new Workspace control dir = %q, %v; want %q", got, err, current)
	}
	if err := os.WriteFile(current, []byte("not a directory"), 0o644); err != nil {
		t.Fatal(err)
	}
	if _, err := ResolveControlDir(root); err == nil {
		t.Fatal("expected a non-directory control path to fail")
	}
}
