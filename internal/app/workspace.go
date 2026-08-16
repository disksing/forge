package app

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

const (
	workspaceConfigFile = "workspace.json"
	reposDir            = "repos"
	archiveDir          = "archive"
	wikiDir             = "wiki"
)

func workspaceConfigPath(root string) string {
	return filepath.Join(root, workspaceConfigFile)
}

func hasWorkspaceConfig(root string) bool {
	return pathExists(filepath.Join(root, workspaceConfigFile))
}

func writeWorkspaceConfig(root string, config Config) error {
	canonical := filepath.Join(root, workspaceConfigFile)
	if err := writeJSON(canonical, config); err != nil {
		return err
	}
	return nil
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
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return err
	}
	tmp, err := os.CreateTemp(filepath.Dir(path), ".pua-json-*.tmp")
	if err != nil {
		return err
	}
	tmpPath := tmp.Name()
	defer os.Remove(tmpPath)
	if err := tmp.Chmod(0o644); err != nil {
		tmp.Close()
		return err
	}
	if _, err := tmp.Write(data); err != nil {
		tmp.Close()
		return err
	}
	if err := tmp.Close(); err != nil {
		return err
	}
	return os.Rename(tmpPath, path)
}

func readJSON(path string, value any) error {
	data, err := os.ReadFile(path)
	if err != nil {
		return err
	}
	return json.Unmarshal(data, value)
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
