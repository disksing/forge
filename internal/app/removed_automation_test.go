package app_test

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/disksing/pua/internal/app"
)

func TestLegacyTaskExecutionMetadataIsIgnoredAndDroppedOnWrite(t *testing.T) {
	root := t.TempDir()
	workspace, err := app.Initialize(root, "en")
	if err != nil {
		t.Fatal(err)
	}
	project, err := workspace.CreateProject("Project", "project")
	if err != nil {
		t.Fatal(err)
	}
	task, err := workspace.CreateTask(app.CreateTaskInput{ProjectID: project.ID, Title: "Task"})
	if err != nil {
		t.Fatal(err)
	}
	metadataPath := filepath.Join(root, filepath.FromSlash(task.Path), "task.json")
	data, err := os.ReadFile(metadataPath)
	if err != nil {
		t.Fatal(err)
	}
	var metadata map[string]any
	if err := json.Unmarshal(data, &metadata); err != nil {
		t.Fatal(err)
	}
	metadata["selfDriving"] = map[string]any{"enabled": true, "revision": 9}
	data, err = json.MarshalIndent(metadata, "", "  ")
	if err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(metadataPath, append(data, '\n'), 0o644); err != nil {
		t.Fatal(err)
	}

	if _, err := workspace.Resource(task.ID); err != nil {
		t.Fatalf("legacy metadata made the task unreadable: %v", err)
	}
	if err := os.MkdirAll(filepath.Join(root, "repos", "demo", ".git"), 0o755); err != nil {
		t.Fatal(err)
	}
	if _, err := workspace.AddTaskRepo(app.TaskRepoInput{TaskID: task.ID, Name: "demo"}); err != nil {
		t.Fatal(err)
	}
	rewritten, err := os.ReadFile(metadataPath)
	if err != nil {
		t.Fatal(err)
	}
	if strings.Contains(string(rewritten), `"selfDriving"`) {
		t.Fatalf("removed execution metadata survived a task write: %s", rewritten)
	}
}
