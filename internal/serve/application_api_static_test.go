package serve

import (
	"context"
	"os"
	"path/filepath"
	"regexp"
	"runtime"
	"strings"
	"testing"
)

func TestServeProductionCodeDoesNotUseForgeCLIAsAnInternalProtocol(t *testing.T) {
	_, sourceFile, _, ok := runtime.Caller(0)
	if !ok {
		t.Fatal("runtime.Caller failed")
	}
	entries, err := os.ReadDir(filepath.Dir(sourceFile))
	if err != nil {
		t.Fatal(err)
	}
	forgeCommand := regexp.MustCompile(`exec\.Command(?:Context)?\([^\n]*["']forge["']`)
	for _, entry := range entries {
		if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".go") || strings.HasSuffix(entry.Name(), "_test.go") {
			continue
		}
		path := filepath.Join(filepath.Dir(sourceFile), entry.Name())
		data, err := os.ReadFile(path)
		if err != nil {
			t.Fatal(err)
		}
		source := string(data)
		for _, forbidden := range []string{"FORGE_CLI", "runForge", "forgePath"} {
			if strings.Contains(source, forbidden) {
				t.Errorf("%s reintroduced forbidden Forge self-invocation marker %q", entry.Name(), forbidden)
			}
		}
		if forgeCommand.MatchString(source) {
			t.Errorf("%s invokes forge as a child process", entry.Name())
		}
	}
}

func TestServeIgnoresDeprecatedForgeCLIEnvironment(t *testing.T) {
	t.Setenv("FORGE_CLI", filepath.Join(t.TempDir(), "not-an-executable"))
	root := t.TempDir()
	openTestForgeWorkspace(t, root, "en")
	server := &server{}
	if _, err := server.treeAt(context.Background(), root); err != nil {
		t.Fatalf("serve tree should use internal app API despite FORGE_CLI: %v", err)
	}
}
