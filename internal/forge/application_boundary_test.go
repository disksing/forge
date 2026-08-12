package forge

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestCLIHasNoDuplicateApplicationImplementation(t *testing.T) {
	for _, removed := range []string{"i18n.go", "resource_paths.go", "resource_schema.go", "types.go"} {
		if _, err := os.Stat(removed); !os.IsNotExist(err) {
			t.Errorf("duplicate application file still exists: %s", removed)
		}
	}
	entries, err := os.ReadDir(".")
	if err != nil {
		t.Fatal(err)
	}
	for _, entry := range entries {
		if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".go") || strings.HasSuffix(entry.Name(), "_test.go") {
			continue
		}
		data, err := os.ReadFile(filepath.Clean(entry.Name()))
		if err != nil {
			t.Fatal(err)
		}
		source := string(data)
		for _, forbidden := range []string{"legacyResourceLog", "readResourceAtDir", "writeResourceMetadata", "buildWorkspaceTree", "ensureWorkspaceWiki", "AgentCommand", "agentCommand"} {
			if strings.Contains(source, forbidden) {
				t.Errorf("%s contains duplicate application implementation marker %q", entry.Name(), forbidden)
			}
		}
	}
}
