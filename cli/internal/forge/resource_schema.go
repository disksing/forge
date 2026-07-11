package forge

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

const (
	resourceSchemaVersion = 1
	resourceTypeProject   = "project"
	resourceTypeTask      = "task"
)

func validateResource(resource Resource) error {
	meta := resource.resourceMeta()
	if meta.SchemaVersion != resourceSchemaVersion {
		return fmt.Errorf("unsupported schemaVersion %d; expected %d", meta.SchemaVersion, resourceSchemaVersion)
	}
	if strings.TrimSpace(meta.Title) == "" {
		return fmt.Errorf("title cannot be empty")
	}
	if strings.TrimSpace(meta.Workflow) == "" {
		return fmt.Errorf("workflow cannot be empty")
	}
	if strings.TrimSpace(meta.CreatedAt) == "" || strings.TrimSpace(meta.UpdatedAt) == "" {
		return fmt.Errorf("createdAt and updatedAt cannot be empty")
	}

	switch typed := resource.(type) {
	case *Project:
		if meta.Type != resourceTypeProject {
			return fmt.Errorf("project type must be %q, got %q", resourceTypeProject, meta.Type)
		}
		if !topProjectName.MatchString(meta.ID) {
			return fmt.Errorf("project id must match projectN, got %q", meta.ID)
		}
	case *Task:
		if meta.Type != resourceTypeTask {
			return fmt.Errorf("task type must be %q, got %q", resourceTypeTask, meta.Type)
		}
		if strings.TrimSpace(typed.Parent) == "" {
			return fmt.Errorf("task parent is required")
		}
		if !topProjectName.MatchString(typed.Parent) {
			return fmt.Errorf("task parent must match projectN, got %q", typed.Parent)
		}
		if !projectTaskName(typed.Parent).MatchString(meta.ID) {
			return fmt.Errorf("task id %q must match %s.taskN", meta.ID, typed.Parent)
		}
	default:
		return fmt.Errorf("unsupported resource type %T", resource)
	}
	return nil
}

func migrateResourceSchemas(root string) (int, error) {
	updated := 0
	err := filepath.WalkDir(root, func(path string, entry os.DirEntry, walkErr error) error {
		if walkErr != nil {
			return walkErr
		}
		if entry.IsDir() && path != root {
			switch entry.Name() {
			case ".git", ".forge", reposDir, "worktree", "artifacts":
				return filepath.SkipDir
			}
			return nil
		}
		if entry.IsDir() || (entry.Name() != projectJSONFile && entry.Name() != taskJSONFile) {
			return nil
		}

		data, err := os.ReadFile(path)
		if err != nil {
			return err
		}
		var raw map[string]any
		if err := json.Unmarshal(data, &raw); err != nil {
			return fmt.Errorf("read resource metadata %s: %w", path, err)
		}
		var header ResourceMeta
		if err := json.Unmarshal(data, &header); err != nil {
			return fmt.Errorf("read resource metadata %s: %w", path, err)
		}
		expectedType := resourceTypeTask
		if entry.Name() == projectJSONFile {
			expectedType = resourceTypeProject
		}
		if header.Type != expectedType {
			return fmt.Errorf("invalid resource metadata %s: file requires type %q, got %q", path, expectedType, header.Type)
		}
		if header.SchemaVersion != 0 && header.SchemaVersion != resourceSchemaVersion {
			return fmt.Errorf("cannot migrate resource metadata %s: unsupported schemaVersion %d", path, header.SchemaVersion)
		}
		header.SchemaVersion = resourceSchemaVersion
		var resource Resource
		if header.Type == resourceTypeProject {
			var project Project
			if err := json.Unmarshal(data, &project); err != nil {
				return fmt.Errorf("read resource metadata %s: %w", path, err)
			}
			project.ResourceMeta = header
			resource = &project
		} else {
			var task Task
			if err := json.Unmarshal(data, &task); err != nil {
				return fmt.Errorf("read resource metadata %s: %w", path, err)
			}
			task.ResourceMeta = header
			resource = &task
		}
		if err := validateResource(resource); err != nil {
			return fmt.Errorf("cannot migrate resource metadata %s: %w", path, err)
		}
		if _, exists := raw["schemaVersion"]; exists {
			return nil
		}
		raw["schemaVersion"] = resourceSchemaVersion
		if err := writeJSON(path, raw); err != nil {
			return err
		}
		updated++
		return nil
	})
	return updated, err
}
