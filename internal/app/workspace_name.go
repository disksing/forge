package app

import (
	"path/filepath"
	"strings"
)

// WorkspaceName resolves the display name for the Workspace rooted at root:
// the name configured in workspace.json when set, otherwise the directory
// base name. It falls back to the base name when the config cannot be read.
func WorkspaceName(root string) string {
	if cfg, err := readWorkspaceConfig(root); err == nil {
		if name := strings.TrimSpace(cfg.Name); name != "" {
			return name
		}
	}
	name := filepath.Base(filepath.Clean(root))
	if name == "." || name == string(filepath.Separator) || name == "" {
		return "AgentWorkspace"
	}
	return name
}

// SetName updates the Workspace display name stored in workspace.json,
// mirroring the Project and Task title kept in their resource metadata. An
// empty name clears the setting so the Workspace falls back to its directory
// base name. It returns the resolved display name.
func (w *Workspace) SetName(name string) (string, error) {
	if err := w.require(); err != nil {
		return "", err
	}
	name = strings.TrimSpace(name)
	err := withWorkspaceMutationLock(w.root, func() error {
		cfg, err := readWorkspaceConfig(w.root)
		if err != nil {
			return err
		}
		cfg.Name = name
		return writeWorkspaceConfig(w.root, cfg)
	})
	if err != nil {
		return "", &APIError{Operation: "set workspace name", Kind: "name", Workspace: w.root, Err: err}
	}
	return WorkspaceName(w.root), nil
}
