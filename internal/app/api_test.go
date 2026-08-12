package app_test

import (
	"encoding/json"
	"os"
	"path/filepath"
	"testing"

	"github.com/disksing/forge/internal/app"
)

func TestApplicationAPIProvidesTheResourceLifecycle(t *testing.T) {
	root := t.TempDir()
	workspace, err := app.Initialize(root, "en")
	if err != nil {
		t.Fatal(err)
	}
	project, err := workspace.CreateProject("Application boundary", "application")
	if err != nil {
		t.Fatal(err)
	}
	task, err := workspace.CreateTask(app.CreateTaskInput{ProjectID: project.ID, Title: "Exercise API", Slug: "api"})
	if err != nil {
		t.Fatal(err)
	}

	taskResult, err := workspace.ResourceValue(task.ID)
	if err != nil || taskResult.Task == nil {
		t.Fatalf("resource value = %#v, %v", taskResult, err)
	}
	taskPath := filepath.Join(root, filepath.FromSlash(taskResult.Path))
	nested := filepath.Join(taskPath, "worktree", "example")
	if err := os.MkdirAll(nested, 0o755); err != nil {
		t.Fatal(err)
	}
	discovered, err := app.OpenWorkspaceFrom(nested)
	if err != nil || discovered.Root() != workspace.Root() {
		t.Fatalf("discovered Workspace = %#v, %v", discovered, err)
	}
	if got, ok, err := workspace.InferProjectID(nested); err != nil || !ok || got != project.ID {
		t.Fatalf("inferred project = %q, %v, %v", got, ok, err)
	}
	if got, ok, err := workspace.InferTaskID(nested); err != nil || !ok || got != task.ID {
		t.Fatalf("inferred task = %q, %v, %v", got, ok, err)
	}

	if _, err := workspace.AddLog(task.ID, "API exercised", "typed mutation"); err != nil {
		t.Fatal(err)
	}
	logs, err := workspace.Logs(task.ID)
	if err != nil || len(logs) != 2 || logs[0].Title != "API exercised" {
		t.Fatalf("logs = %#v, %v", logs, err)
	}

	repoPath := filepath.Join(root, "repos", "example")
	if err := os.MkdirAll(filepath.Join(repoPath, ".git"), 0o755); err != nil {
		t.Fatal(err)
	}
	updated, err := workspace.AddTaskRepo(app.TaskRepoInput{TaskID: task.ID, Name: "example", WorktreePath: taskResult.Path + "/worktree/example", Branch: "feature", TargetBranch: "main"})
	if err != nil || len(updated.Repos) != 1 || updated.Repos[0].RepoPath != "repos/example" {
		t.Fatalf("updated task repos = %#v, %v", updated.Repos, err)
	}
	detail, err := workspace.Resource(task.ID)
	if err != nil || len(detail.Repos) != 1 || len(detail.Logs) != 2 {
		t.Fatalf("resource detail = %#v, %v", detail, err)
	}
	tree, err := workspace.Tree()
	if err != nil || len(tree.Projects) != 1 || len(tree.Projects[0].Children) != 1 {
		t.Fatalf("Workspace tree = %#v, %v", tree, err)
	}
	if _, err := workspace.RemoveTaskRepo(task.ID, "example"); err != nil {
		t.Fatal(err)
	}

	archivedTask, err := workspace.ArchiveResource(task.ID)
	if err != nil || archivedTask.Path != "project1-application/archive/task1-api" {
		t.Fatalf("archive task = %#v, %v", archivedTask, err)
	}
	archivedProject, err := workspace.ArchiveResource(project.ID)
	if err != nil || archivedProject.Path != "archive/project1-application" {
		t.Fatalf("archive project = %#v, %v", archivedProject, err)
	}
}

func TestApplicationSelectorsAreExplicitAndCanonical(t *testing.T) {
	if got, err := app.NormalizeProjectID("12"); err != nil || got != "project12" {
		t.Fatalf("NormalizeProjectID = %q, %v", got, err)
	}
	if got, err := app.NormalizeTaskName("7"); err != nil || got != "task7" {
		t.Fatalf("NormalizeTaskName = %q, %v", got, err)
	}
	if got, err := app.NormalizeTaskID("12", "7"); err != nil || got != "project12.task7" {
		t.Fatalf("NormalizeTaskID = %q, %v", got, err)
	}
	if _, err := app.NormalizeTaskID("", "task7"); err == nil {
		t.Fatal("NormalizeTaskID inferred a project instead of requiring one")
	}
}

func TestMigrateDropsRemovedAgentCommandConfig(t *testing.T) {
	root := t.TempDir()
	workspace, err := app.Initialize(root, "en")
	if err != nil {
		t.Fatal(err)
	}
	configPath := filepath.Join(root, "forge.json")
	if err := os.WriteFile(configPath, []byte(`{"version":1,"language":"en","agentCommand":["legacy"]}`+"\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	if err := workspace.Migrate(""); err != nil {
		t.Fatal(err)
	}
	data, err := os.ReadFile(configPath)
	if err != nil {
		t.Fatal(err)
	}
	var config map[string]any
	if err := json.Unmarshal(data, &config); err != nil {
		t.Fatal(err)
	}
	if _, exists := config["agentCommand"]; exists {
		t.Fatalf("removed agentCommand survived migration: %s", data)
	}
}
