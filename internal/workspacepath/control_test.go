package workspacepath

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestResolveControlDir(t *testing.T) {
	root := t.TempDir()
	current := filepath.Join(root, CurrentControlDirName)
	legacy := filepath.Join(root, LegacyControlDirName)

	if got, err := ResolveControlDir(root); err != nil || got != current {
		t.Fatalf("new Workspace control dir = %q, %v; want %q", got, err, current)
	}
	if err := os.Mkdir(legacy, 0o755); err != nil {
		t.Fatal(err)
	}
	if got, err := ResolveControlDir(root); err != nil || got != legacy {
		t.Fatalf("legacy Workspace control dir = %q, %v; want %q", got, err, legacy)
	}
	if err := os.Mkdir(current, 0o755); err != nil {
		t.Fatal(err)
	}
	if _, err := ResolveControlDir(root); err == nil || !strings.Contains(err.Error(), "both .pua and .forge") {
		t.Fatalf("expected ambiguous layout error, got %v", err)
	}
}
