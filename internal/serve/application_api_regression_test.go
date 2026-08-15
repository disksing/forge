package serve

import (
	"context"
	"path/filepath"
	"testing"
)

func TestServeIgnoresDeprecatedForgeCLIEnvironment(t *testing.T) {
	t.Setenv("FORGE_CLI", filepath.Join(t.TempDir(), "not-an-executable"))
	root := t.TempDir()
	openTestForgeWorkspace(t, root, "en")
	server := &server{}
	if _, err := server.treeAt(context.Background(), root); err != nil {
		t.Fatalf("serve tree should use internal app API despite FORGE_CLI: %v", err)
	}
}
