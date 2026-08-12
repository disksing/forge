package app

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"
)

func defaultAgentBinding() AgentBinding {
	return AgentBinding{Kind: "profile", Name: "default"}
}

func normalizeDefaultProfile(value string) string {
	value = strings.ToLower(strings.TrimSpace(value))
	if value == "" {
		return "default"
	}
	return value
}

func normalizeResourceDefaults(value ResourceAgentDefaults) ResourceAgentDefaults {
	return ResourceAgentDefaults{
		Workspace: normalizeDefaultProfile(value.Workspace),
		Project:   normalizeDefaultProfile(value.Project),
		Task:      normalizeDefaultProfile(value.Task),
	}
}

// NormalizeAgentBinding validates one explicit resource binding. An empty
// legacy binding is normalized to the default Profile during migration.
func NormalizeAgentBinding(value AgentBinding) (AgentBinding, error) {
	value.Kind = strings.ToLower(strings.TrimSpace(value.Kind))
	value.Name = strings.TrimSpace(value.Name)
	if value.Kind == "" && value.Name == "" {
		return defaultAgentBinding(), nil
	}
	if value.Kind != "profile" && value.Kind != "agent" {
		return AgentBinding{}, errors.New("agent binding kind must be profile or agent")
	}
	if value.Name == "" {
		return AgentBinding{}, errors.New("agent binding name is required")
	}
	if len(value.Name) > 80 || strings.ContainsRune(value.Name, '\x00') {
		return AgentBinding{}, errors.New("agent binding name is invalid")
	}
	if value.Kind == "profile" {
		value.Name = strings.ToLower(value.Name)
	}
	return value, nil
}

func newWorkspaceInstanceID() (string, error) {
	var random [16]byte
	if _, err := rand.Read(random[:]); err != nil {
		return "", err
	}
	return "ws-" + hex.EncodeToString(random[:]), nil
}

// EnsureResourceRuntime performs the minimal, lossless stage-one conversion:
// it assigns a stable Workspace instance id and explicit bindings to every
// open resource that predates bindings. Existing files and worktrees are not
// otherwise changed.
func (w *Workspace) EnsureResourceRuntime(defaults ResourceAgentDefaults) (WorkspaceRuntimeConfig, error) {
	if err := w.require(); err != nil {
		return WorkspaceRuntimeConfig{}, err
	}
	var result WorkspaceRuntimeConfig
	err := withWorkspaceMutationLock(w.root, func() error {
		cfg, err := readWorkspaceConfig(w.root)
		if err != nil {
			return err
		}
		changed := false
		normalizedDefaults := normalizeResourceDefaults(defaults)
		if cfg.ResourceDefaults != normalizedDefaults {
			cfg.ResourceDefaults = normalizedDefaults
			changed = true
		}
		if strings.TrimSpace(cfg.InstanceID) == "" {
			cfg.InstanceID, err = newWorkspaceInstanceID()
			if err != nil {
				return err
			}
			changed = true
		}
		if strings.TrimSpace(cfg.AgentBinding.Name) == "" {
			cfg.AgentBinding = AgentBinding{Kind: "profile", Name: normalizeDefaultProfile(defaults.Workspace)}
			changed = true
		}
		binding, err := NormalizeAgentBinding(cfg.AgentBinding)
		if err != nil {
			return err
		}
		if cfg.AgentBinding != binding {
			cfg.AgentBinding = binding
			changed = true
		}
		if changed {
			if err := writeJSON(filepath.Join(w.root, configFile), cfg); err != nil {
				return err
			}
		}
		if err := ensureOpenResourceBindings(w.root, defaults); err != nil {
			return err
		}
		if err := os.MkdirAll(filepath.Join(w.root, ".forge", "runtime"), 0o700); err != nil {
			return err
		}
		result = WorkspaceRuntimeConfig{InstanceID: cfg.InstanceID, Creator: cfg.Creator, AgentBinding: cfg.AgentBinding, ResourceDefaults: cfg.ResourceDefaults}
		return nil
	})
	if err != nil {
		return WorkspaceRuntimeConfig{}, &APIError{Operation: "initialize resource runtime", Kind: "runtime", Workspace: w.root, Err: err}
	}
	return result, nil
}

func ensureOpenResourceBindings(root string, defaults ResourceAgentDefaults) error {
	projects, err := readProjectEntriesInDirs([]string{root})
	if err != nil {
		return err
	}
	for _, entry := range projects {
		project := entry.Project
		if strings.TrimSpace(project.AgentBinding.Name) == "" {
			project.AgentBinding = AgentBinding{Kind: "profile", Name: normalizeDefaultProfile(defaults.Project)}
			project.UpdatedAt = time.Now().Format(time.RFC3339)
			if err := writeResourceMetadata(entry.Path, &project); err != nil {
				return err
			}
		}
		tasks, err := readTaskEntriesInDirs([]string{entry.Path}, projectTaskName(project.ID))
		if err != nil {
			return err
		}
		for _, taskEntry := range tasks {
			task := taskEntry.Task
			if strings.TrimSpace(task.AgentBinding.Name) != "" {
				continue
			}
			task.AgentBinding = AgentBinding{Kind: "profile", Name: normalizeDefaultProfile(defaults.Task)}
			task.UpdatedAt = time.Now().Format(time.RFC3339)
			if err := writeResourceMetadata(taskEntry.Path, &task); err != nil {
				return err
			}
		}
	}
	return nil
}

func (w *Workspace) RuntimeConfig() (WorkspaceRuntimeConfig, error) {
	if err := w.require(); err != nil {
		return WorkspaceRuntimeConfig{}, err
	}
	cfg, err := readWorkspaceConfig(w.root)
	if err != nil {
		return WorkspaceRuntimeConfig{}, err
	}
	binding, err := NormalizeAgentBinding(cfg.AgentBinding)
	if err != nil {
		return WorkspaceRuntimeConfig{}, err
	}
	if strings.TrimSpace(cfg.InstanceID) == "" {
		return WorkspaceRuntimeConfig{}, fmt.Errorf("Workspace resource runtime is not initialized")
	}
	return WorkspaceRuntimeConfig{InstanceID: cfg.InstanceID, Creator: cfg.Creator, AgentBinding: binding, ResourceDefaults: normalizeResourceDefaults(cfg.ResourceDefaults)}, nil
}

func (w *Workspace) ResourceAgentBinding(id string) (AgentBinding, error) {
	if strings.TrimSpace(id) == "" || strings.TrimSpace(id) == "workspace" {
		cfg, err := w.RuntimeConfig()
		return cfg.AgentBinding, err
	}
	if strings.TrimSpace(id) == SchedulerResourceID {
		cfg, err := w.Scheduler()
		return cfg.AgentBinding, err
	}
	result, err := w.ResourceValue(id)
	if err != nil {
		return AgentBinding{}, err
	}
	binding, err := NormalizeAgentBinding(result.Resource().resourceMeta().AgentBinding)
	if err != nil {
		return AgentBinding{}, &APIError{Operation: "read resource agent binding", Kind: "binding", Workspace: w.root, ResourceID: id, Err: err}
	}
	return binding, nil
}

func (w *Workspace) SetResourceAgentBinding(id string, binding AgentBinding) (AgentBinding, error) {
	binding, err := NormalizeAgentBinding(binding)
	if err != nil {
		return AgentBinding{}, &APIError{Operation: "set resource agent binding", Kind: "binding", Workspace: w.root, ResourceID: id, Err: err}
	}
	err = withWorkspaceMutationLock(w.root, func() error {
		if strings.TrimSpace(id) == "" || strings.TrimSpace(id) == "workspace" {
			cfg, err := readWorkspaceConfig(w.root)
			if err != nil {
				return err
			}
			cfg.AgentBinding = binding
			return writeJSON(filepath.Join(w.root, configFile), cfg)
		}
		if strings.TrimSpace(id) == SchedulerResourceID {
			cfg, err := readSchedulerJSON(schedulerJSONPath(w.root))
			if err != nil {
				return err
			}
			cfg.AgentBinding = binding
			return writeSchedulerJSON(schedulerJSONPath(w.root), cfg)
		}
		path, resource, err := loadOpenResource(w.root, strings.TrimSpace(id))
		if err != nil {
			return err
		}
		resource.resourceMeta().AgentBinding = binding
		resource.resourceMeta().UpdatedAt = time.Now().Format(time.RFC3339)
		return writeResourceMetadata(path, resource)
	})
	if err != nil {
		return AgentBinding{}, &APIError{Operation: "set resource agent binding", Kind: "binding", Workspace: w.root, ResourceID: id, Err: err}
	}
	return binding, nil
}
