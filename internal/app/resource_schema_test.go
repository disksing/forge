package app

import (
	"encoding/json"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

func validTestResource(id, kind string, parent *string) Task {
	now := time.Now().Format(time.RFC3339)
	return Task{
		ResourceMeta: ResourceMeta{
			SchemaVersion: resourceSchemaVersion,
			ID:            id,
			Type:          kind,
			Title:         "Resource",
			CreatedAt:     now,
			UpdatedAt:     now,
		},
		Parent: func() string {
			if parent == nil {
				return ""
			}
			return *parent
		}(),
	}
}

func TestValidateResourceRejectsKindSpecificInvalidStates(t *testing.T) {
	project := newProject("project1", "Project", "")
	project.Type = resourceTypeTask
	if err := validateResource(&project); err == nil || !strings.Contains(err.Error(), "project type") {
		t.Fatalf("expected incorrect project type to be rejected, got %v", err)
	}

	parent := "project1"
	task := validTestResource("project1.task1.1", resourceTypeTask, &parent)
	if err := validateResource(&task); err == nil || !strings.Contains(err.Error(), "must match project1.taskN") {
		t.Fatalf("expected nested task id to be rejected, got %v", err)
	}

	task = validTestResource("project1.task1", resourceTypeTask, nil)
	if err := validateResource(&task); err == nil || !strings.Contains(err.Error(), "task parent is required") {
		t.Fatalf("expected missing task parent to be rejected, got %v", err)
	}
}

func TestProjectAndTaskJSONShapesRemainCompatible(t *testing.T) {
	project := newProject("project1", "Project", "Description")
	projectData, err := json.Marshal(project)
	if err != nil {
		t.Fatal(err)
	}
	var projectJSON map[string]any
	if err := json.Unmarshal(projectData, &projectJSON); err != nil {
		t.Fatal(err)
	}
	if parent, exists := projectJSON["parent"]; !exists || parent != nil {
		t.Fatalf("project parent must remain explicit null: %#v", projectJSON)
	}
	if _, exists := projectJSON["repos"]; exists {
		t.Fatalf("project JSON must not contain repos: %#v", projectJSON)
	}

	task := newTask("project1.task1", "project1", "Task", "")
	taskData, err := json.Marshal(task)
	if err != nil {
		t.Fatal(err)
	}
	var taskJSON map[string]any
	if err := json.Unmarshal(taskData, &taskJSON); err != nil {
		t.Fatal(err)
	}
	if taskJSON["parent"] != "project1" {
		t.Fatalf("task parent changed shape: %#v", taskJSON)
	}
}

func TestReadResourceRequiresCurrentSchema(t *testing.T) {
	dir := t.TempDir()
	project := newProject("project1", "Project", "")
	project.SchemaVersion = 0
	if err := writeJSON(filepath.Join(dir, projectJSONFile), project); err != nil {
		t.Fatal(err)
	}
	_, err := readResourceAtDir(dir)
	if err == nil || !strings.Contains(err.Error(), "unsupported schemaVersion") {
		t.Fatalf("expected unsupported schema error, got %v", err)
	}
}
