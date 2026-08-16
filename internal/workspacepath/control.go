// Package workspacepath resolves PUA's private per-Workspace control directory.
package workspacepath

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
)

const ControlDirName = ".pua"

// ControlDir returns the canonical PUA control directory.
func ControlDir(root string) string {
	return filepath.Join(root, ControlDirName)
}

// ResolveControlDir validates and returns the canonical PUA control directory.
func ResolveControlDir(root string) (string, error) {
	control := ControlDir(root)
	_, err := pathExistsAsDirectory(control)
	return control, err
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
