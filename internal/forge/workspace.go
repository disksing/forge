package forge

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

const (
	configFile = "forge.json"
	reposDir   = "repos"
	archiveDir = "archive"
)

func findWorkspaceRoot() (string, error) {
	cwd, err := os.Getwd()
	if err != nil {
		return "", err
	}
	for {
		if pathExists(filepath.Join(cwd, configFile)) || isDir(filepath.Join(cwd, reposDir)) {
			return cwd, nil
		}
		parent := filepath.Dir(cwd)
		if parent == cwd {
			return "", errors.New("could not find AgentWorkspace root; run forge init first")
		}
		cwd = parent
	}
}

func pathExists(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}

func isDir(path string) bool {
	info, err := os.Stat(path)
	return err == nil && info.IsDir()
}

func writeJSON(path string, value any) error {
	data, err := json.MarshalIndent(value, "", "  ")
	if err != nil {
		return err
	}
	data = append(data, '\n')
	return os.WriteFile(path, data, 0o644)
}

func readJSON(path string, value any) error {
	data, err := os.ReadFile(path)
	if err != nil {
		return err
	}
	return json.Unmarshal(data, value)
}

func writeFileIfMissing(path, content string) error {
	if pathExists(path) {
		return nil
	}
	return os.WriteFile(path, []byte(content), 0o644)
}

func cleanID(id string) string {
	return strings.TrimSpace(id)
}

func slash(path string) string {
	return filepath.ToSlash(path)
}

func relPath(base, target string) string {
	rel, err := filepath.Rel(base, target)
	if err != nil {
		return slash(target)
	}
	return slash(rel)
}

func ensureInsideName(name string) error {
	if name == "" {
		return errors.New("name cannot be empty")
	}
	if filepath.IsAbs(name) {
		return fmt.Errorf("name %q must be relative", name)
	}
	for _, part := range strings.Split(filepath.ToSlash(name), "/") {
		if part == "" || part == "." || part == ".." {
			return fmt.Errorf("invalid name %q", name)
		}
	}
	return nil
}
