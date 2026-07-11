package forge

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

func validTestResource(id, kind string, parent *string) Task {
	now := time.Now().Format(time.RFC3339)
	return Task{
		SchemaVersion: resourceSchemaVersion,
		ID:            id,
		Type:          kind,
		Parent:        parent,
		Title:         "Resource",
		Workflow:      defaultWorkflowName,
		CreatedAt:     now,
		UpdatedAt:     now,
	}
}

func TestValidateResourceRejectsKindSpecificInvalidStates(t *testing.T) {
	project := validTestResource("project1", resourceTypeProject, nil)
	project.Run = &TaskRun{}
	if err := validateResource(project); err == nil || !strings.Contains(err.Error(), "project cannot contain run") {
		t.Fatalf("expected project run to be rejected, got %v", err)
	}

	parent := "project1"
	task := validTestResource("project1.task1.1", resourceTypeTask, &parent)
	if err := validateResource(task); err == nil || !strings.Contains(err.Error(), "must match project1.taskN") {
		t.Fatalf("expected nested task id to be rejected, got %v", err)
	}

	task = validTestResource("project1.task1", resourceTypeTask, nil)
	if err := validateResource(task); err == nil || !strings.Contains(err.Error(), "task parent is required") {
		t.Fatalf("expected missing task parent to be rejected, got %v", err)
	}
}

func TestReadResourceRequiresCurrentSchema(t *testing.T) {
	dir := t.TempDir()
	project := validTestResource("project1", resourceTypeProject, nil)
	project.SchemaVersion = 0
	if err := writeJSON(filepath.Join(dir, projectJSONFile), project); err != nil {
		t.Fatal(err)
	}
	var loaded Task
	err := readResourceAtDir(dir, &loaded)
	if err == nil || !strings.Contains(err.Error(), "run forge migrate") {
		t.Fatalf("expected migration instruction, got %v", err)
	}
}

func TestMigrateResourceSchemasAddsVersionAndPreservesUnknownFields(t *testing.T) {
	root := t.TempDir()
	projectDir := filepath.Join(root, "project1")
	if err := os.MkdirAll(projectDir, 0o755); err != nil {
		t.Fatal(err)
	}
	project := validTestResource("project1", resourceTypeProject, nil)
	project.SchemaVersion = 0
	data, err := json.Marshal(project)
	if err != nil {
		t.Fatal(err)
	}
	var raw map[string]any
	if err := json.Unmarshal(data, &raw); err != nil {
		t.Fatal(err)
	}
	delete(raw, "schemaVersion")
	raw["futureField"] = "preserved"
	path := filepath.Join(projectDir, projectJSONFile)
	if err := writeJSON(path, raw); err != nil {
		t.Fatal(err)
	}

	updated, err := migrateResourceSchemas(root)
	if err != nil {
		t.Fatal(err)
	}
	if updated != 1 {
		t.Fatalf("expected one update, got %d", updated)
	}
	var migrated map[string]any
	if err := readJSON(path, &migrated); err != nil {
		t.Fatal(err)
	}
	if migrated["schemaVersion"] != float64(resourceSchemaVersion) || migrated["futureField"] != "preserved" {
		t.Fatalf("unexpected migrated metadata: %#v", migrated)
	}
	var loaded Task
	if err := readResourceAtDir(projectDir, &loaded); err != nil {
		t.Fatalf("migrated resource should load: %v", err)
	}
}
