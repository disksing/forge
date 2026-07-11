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

func validateResource(resource Task) error {
	if resource.SchemaVersion != resourceSchemaVersion {
		return fmt.Errorf("unsupported schemaVersion %d; expected %d", resource.SchemaVersion, resourceSchemaVersion)
	}
	if strings.TrimSpace(resource.Title) == "" {
		return fmt.Errorf("title cannot be empty")
	}
	if strings.TrimSpace(resource.Workflow) == "" {
		return fmt.Errorf("workflow cannot be empty")
	}
	if strings.TrimSpace(resource.CreatedAt) == "" || strings.TrimSpace(resource.UpdatedAt) == "" {
		return fmt.Errorf("createdAt and updatedAt cannot be empty")
	}

	switch resource.Type {
	case resourceTypeProject:
		if !topProjectName.MatchString(resource.ID) {
			return fmt.Errorf("project id must match projectN, got %q", resource.ID)
		}
		if resource.Parent != nil {
			return fmt.Errorf("project parent must be null")
		}
		if len(resource.Repos) != 0 {
			return fmt.Errorf("project cannot contain repos")
		}
		if resource.Run != nil {
			return fmt.Errorf("project cannot contain run")
		}
	case resourceTypeTask:
		if resource.Parent == nil || strings.TrimSpace(*resource.Parent) == "" {
			return fmt.Errorf("task parent is required")
		}
		if !topProjectName.MatchString(*resource.Parent) {
			return fmt.Errorf("task parent must match projectN, got %q", *resource.Parent)
		}
		if !projectTaskName(*resource.Parent).MatchString(resource.ID) {
			return fmt.Errorf("task id %q must match %s.taskN", resource.ID, *resource.Parent)
		}
	default:
		return fmt.Errorf("type must be %q or %q, got %q", resourceTypeProject, resourceTypeTask, resource.Type)
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
		var resource Task
		if err := json.Unmarshal(data, &resource); err != nil {
			return fmt.Errorf("read resource metadata %s: %w", path, err)
		}
		expectedType := resourceTypeTask
		if entry.Name() == projectJSONFile {
			expectedType = resourceTypeProject
		}
		if resource.Type != expectedType {
			return fmt.Errorf("invalid resource metadata %s: file requires type %q, got %q", path, expectedType, resource.Type)
		}
		if resource.SchemaVersion != 0 && resource.SchemaVersion != resourceSchemaVersion {
			return fmt.Errorf("cannot migrate resource metadata %s: unsupported schemaVersion %d", path, resource.SchemaVersion)
		}
		resource.SchemaVersion = resourceSchemaVersion
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
