package forge

import (
	"io/fs"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
	"testing"
)

func TestRetiredRunNameIsConfinedToMigrationAndFixtures(t *testing.T) {
	t.Parallel()

	root := filepath.Clean(filepath.Join("..", ".."))
	retiredName := regexp.MustCompile(`(?i)auto[-_ ]?run`)
	allowed := map[string]bool{
		"internal/app/api_test.go":                      true,
		"internal/app/self_driving_migration.go":        true,
		"internal/app/template_legacy_migration.go":     true,
		"internal/app/template_test.go":                 true,
		"internal/forge/cli_test.go":                    true,
		"internal/forge/legacy_name_audit_test.go":      true,
		"internal/forge/self_driving_migration.go":      true,
		"internal/serve/self_driving_migration.go":      true,
		"internal/serve/self_driving_migration_test.go": true,
		"internal/serve/self_driving_start_test.go":     true,
		"internal/serve/template_api_test.go":           true,
	}
	textExtensions := map[string]bool{
		".css": true, ".go": true, ".html": true, ".js": true,
		".json": true, ".md": true, ".sh": true, ".yaml": true, ".yml": true,
	}

	var unexpected []string
	err := filepath.WalkDir(root, func(path string, entry fs.DirEntry, walkErr error) error {
		if walkErr != nil {
			return walkErr
		}
		if entry.IsDir() {
			switch entry.Name() {
			case ".git", "bin", "node_modules", "tests":
				return filepath.SkipDir
			}
			return nil
		}
		if !textExtensions[strings.ToLower(filepath.Ext(path))] {
			return nil
		}
		data, readErr := os.ReadFile(path)
		if readErr != nil {
			return readErr
		}
		if !retiredName.Match(data) {
			return nil
		}
		rel, relErr := filepath.Rel(root, path)
		if relErr != nil {
			return relErr
		}
		rel = filepath.ToSlash(rel)
		if !allowed[rel] {
			unexpected = append(unexpected, rel)
		}
		return nil
	})
	if err != nil {
		t.Fatalf("audit retired run name: %v", err)
	}
	if len(unexpected) != 0 {
		sort.Strings(unexpected)
		t.Fatalf("retired run name escaped migration/test allowlist:\n%s", strings.Join(unexpected, "\n"))
	}
}

func TestRemovedAutomationSurfaceDoesNotAppearInProductionFiles(t *testing.T) {
	t.Parallel()

	root := filepath.Clean(filepath.Join("..", ".."))
	retired := regexp.MustCompile(`(?i)self[-_ ]?driving|autorun|auto[-_ ]?run|schedulerTurn|schedulerSequence|scheduleRunnableTasks`)
	textExtensions := map[string]bool{
		".css": true, ".go": true, ".html": true, ".js": true,
		".json": true, ".md": true, ".sh": true, ".yaml": true, ".yml": true,
	}

	var unexpected []string
	err := filepath.WalkDir(root, func(path string, entry fs.DirEntry, walkErr error) error {
		if walkErr != nil {
			return walkErr
		}
		if entry.IsDir() {
			switch entry.Name() {
			case ".git", "bin", "node_modules", "tests":
				return filepath.SkipDir
			}
			return nil
		}
		if strings.HasSuffix(path, "_test.go") || !textExtensions[strings.ToLower(filepath.Ext(path))] {
			return nil
		}
		data, readErr := os.ReadFile(path)
		if readErr != nil {
			return readErr
		}
		if !retired.Match(data) {
			return nil
		}
		rel, relErr := filepath.Rel(root, path)
		if relErr != nil {
			return relErr
		}
		rel = filepath.ToSlash(rel)
		unexpected = append(unexpected, rel)
		return nil
	})
	if err != nil {
		t.Fatalf("audit removed automation surface: %v", err)
	}
	if len(unexpected) != 0 {
		sort.Strings(unexpected)
		t.Fatalf("removed automation surface appears in production files:\n%s", strings.Join(unexpected, "\n"))
	}
}
