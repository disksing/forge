// Package workspacepath resolves PUA's private per-Workspace control directory.
package workspacepath

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
)

const (
	CurrentControlDirName = ".pua"
	LegacyControlDirName  = ".forge"
)

// ControlDir returns the selected control directory without doing I/O that can
// fail. Call ResolveControlDir at Workspace open and lock boundaries to reject
// ambiguous layouts before using this helper deeper in an operation.
func ControlDir(root string) string {
	current := filepath.Join(root, CurrentControlDirName)
	if directoryExists(current) {
		return current
	}
	legacy := filepath.Join(root, LegacyControlDirName)
	if directoryExists(legacy) {
		return legacy
	}
	return current
}

// ResolveControlDir selects .pua for new Workspaces and preserves .forge for
// existing ones. Both directories at once are rejected so state is never split
// silently between two stores.
func ResolveControlDir(root string) (string, error) {
	current := filepath.Join(root, CurrentControlDirName)
	legacy := filepath.Join(root, LegacyControlDirName)
	currentExists, err := pathExistsAsDirectory(current)
	if err != nil {
		return "", err
	}
	legacyExists, err := pathExistsAsDirectory(legacy)
	if err != nil {
		return "", err
	}
	if currentExists && legacyExists {
		return "", fmt.Errorf("Workspace contains both %s and %s; merge or remove one control directory before continuing", CurrentControlDirName, LegacyControlDirName)
	}
	if currentExists {
		return current, nil
	}
	if legacyExists {
		return legacy, nil
	}
	return current, nil
}

func pathExistsAsDirectory(path string) (bool, error) {
	info, err := os.Stat(path)
	if errors.Is(err, os.ErrNotExist) {
		return false, nil
	}
	if err != nil {
		return false, err
	}
	if !info.IsDir() {
		return false, fmt.Errorf("PUA control path %s exists but is not a directory", path)
	}
	return true, nil
}

func directoryExists(path string) bool {
	info, err := os.Stat(path)
	return err == nil && info.IsDir()
}
