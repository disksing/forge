package forge

import (
	"fmt"
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
		if typed.SelfDriving != nil {
			if typed.SelfDriving.Revision <= 0 {
				return fmt.Errorf("Self-Driving revision must be positive")
			}
			switch typed.SelfDriving.Condition {
			case "disabled", "ready", "reconciling", "waiting", "blocked", "error", "needs_configuration":
			default:
				return fmt.Errorf("invalid Self-Driving condition %q", typed.SelfDriving.Condition)
			}
			if !typed.SelfDriving.Enabled && typed.SelfDriving.Condition != "disabled" {
				return fmt.Errorf("disabled Self-Driving must use condition %q", "disabled")
			}
			if typed.SelfDriving.Enabled && typed.SelfDriving.Condition == "disabled" {
				return fmt.Errorf("enabled Self-Driving cannot use condition %q", "disabled")
			}
		}
	default:
		return fmt.Errorf("unsupported resource type %T", resource)
	}
	return nil
}
