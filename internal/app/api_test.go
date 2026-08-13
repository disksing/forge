package app_test

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sync"
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

func TestCreatorProvenancePersistsAcrossWorkspaceProjectAndTask(t *testing.T) {
	root := t.TempDir()
	creator, err := app.ResourceCreator("ws-source", "project7.task3")
	if err != nil {
		t.Fatal(err)
	}
	workspace, err := app.InitializeWithOptions(root, app.InitializeOptions{Language: "en", Creator: creator})
	if err != nil {
		t.Fatal(err)
	}
	runtime, err := workspace.RuntimeConfig()
	if err != nil || runtime.Creator == nil || *runtime.Creator != creator {
		t.Fatalf("Workspace creator = %#v, %v", runtime.Creator, err)
	}
	project, err := workspace.CreateProjectWithInput(app.CreateProjectInput{Description: "Delegated project", Slug: "delegated", Creator: creator})
	if err != nil || project.Creator == nil || *project.Creator != creator {
		t.Fatalf("project creator = %#v, %v", project.Creator, err)
	}
	task, err := workspace.CreateTask(app.CreateTaskInput{ProjectID: project.ID, Title: "Delegated task", Slug: "delegated", Creator: creator})
	if err != nil || task.Creator == nil || *task.Creator != creator {
		t.Fatalf("task creator = %#v, %v", task.Creator, err)
	}
	reloaded, err := app.OpenWorkspace(root)
	if err != nil {
		t.Fatal(err)
	}
	value, err := reloaded.ResourceValue(task.ID)
	if err != nil || value.Task == nil || value.Task.Creator == nil || *value.Task.Creator != creator {
		t.Fatalf("reloaded task creator = %#v, %v", value.Task, err)
	}
	if _, err := reloaded.ArchiveResource(task.ID); err != nil {
		t.Fatal(err)
	}
	archived, err := reloaded.ResourceValue(task.ID)
	if err != nil || !archived.Archived || archived.Task == nil || archived.Task.Creator == nil || *archived.Task.Creator != creator {
		t.Fatalf("archived task creator = %#v, %v", archived, err)
	}
}

func TestConcurrentResourceCreationAllocatesUniqueAtomicIDs(t *testing.T) {
	workspace, err := app.Initialize(t.TempDir(), "en")
	if err != nil {
		t.Fatal(err)
	}
	const count = 12
	projects := make(chan app.Project, count)
	errors := make(chan error, count)
	var wait sync.WaitGroup
	for index := 0; index < count; index++ {
		wait.Add(1)
		go func(index int) {
			defer wait.Done()
			project, createErr := workspace.CreateProject(fmt.Sprintf("Concurrent project %d", index), fmt.Sprintf("concurrent-%d", index))
			if createErr != nil {
				errors <- createErr
				return
			}
			projects <- project
		}(index)
	}
	wait.Wait()
	close(errors)
	for createErr := range errors {
		t.Fatal(createErr)
	}
	close(projects)
	seen := make(map[string]bool)
	for project := range projects {
		if seen[project.ID] {
			t.Fatalf("duplicate project id %s", project.ID)
		}
		seen[project.ID] = true
		if project.Creator == nil || project.Creator.Kind != app.CreatorKindUser {
			t.Fatalf("default creator missing from %#v", project)
		}
	}
	if len(seen) != count {
		t.Fatalf("created %d projects, want %d", len(seen), count)
	}
	matches, err := filepath.Glob(filepath.Join(workspace.Root(), ".forge-create-*"))
	if err != nil || len(matches) != 0 {
		t.Fatalf("partial staging directories = %#v, %v", matches, err)
	}
}

func TestInterruptedInitializationPreservesOriginalCreator(t *testing.T) {
	root := t.TempDir()
	if err := os.MkdirAll(filepath.Join(root, ".forge"), 0o755); err != nil {
		t.Fatal(err)
	}
	creator, err := app.ResourceCreator("ws-source", "project1.task1")
	if err != nil {
		t.Fatal(err)
	}
	marker, _ := json.Marshal(map[string]any{"version": 1, "creator": creator})
	if err := os.WriteFile(filepath.Join(root, ".forge", "initializing.json"), append(marker, '\n'), 0o644); err != nil {
		t.Fatal(err)
	}
	if _, err := app.OpenWorkspace(root); err == nil {
		t.Fatal("incomplete Workspace unexpectedly opened")
	}
	if _, err := app.InitializeWithOptions(root, app.InitializeOptions{Language: "en", Creator: app.UserCreator()}); err == nil {
		t.Fatal("recovery changed creator provenance")
	}
	workspace, err := app.InitializeWithOptions(root, app.InitializeOptions{Language: "en", Creator: creator})
	if err != nil {
		t.Fatal(err)
	}
	runtime, err := workspace.RuntimeConfig()
	if err != nil || runtime.Creator == nil || *runtime.Creator != creator {
		t.Fatalf("recovered creator = %#v, %v", runtime.Creator, err)
	}
}

func TestConcurrentWorkspaceInitializationConvergesOnOneInstance(t *testing.T) {
	root := filepath.Join(t.TempDir(), "workspace")
	type result struct {
		workspace *app.Workspace
		err       error
	}
	results := make(chan result, 2)
	start := make(chan struct{})
	for index := 0; index < 2; index++ {
		go func() {
			<-start
			workspace, err := app.Initialize(root, "en")
			results <- result{workspace: workspace, err: err}
		}()
	}
	close(start)
	instanceIDs := make(map[string]bool)
	for index := 0; index < 2; index++ {
		current := <-results
		if current.err != nil {
			continue
		}
		runtime, err := current.workspace.RuntimeConfig()
		if err != nil {
			t.Fatal(err)
		}
		instanceIDs[runtime.InstanceID] = true
	}
	opened, err := app.OpenWorkspace(root)
	if err != nil {
		t.Fatal(err)
	}
	runtime, err := opened.RuntimeConfig()
	if err != nil {
		t.Fatal(err)
	}
	instanceIDs[runtime.InstanceID] = true
	if len(instanceIDs) != 1 {
		t.Fatalf("concurrent initialization created multiple logical instances: %#v", instanceIDs)
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

func TestMigrateIsolatesLegacySessionProjectionWithoutTouchingRuntime(t *testing.T) {
	root := t.TempDir()
	workspace, err := app.Initialize(root, "en")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := workspace.EnsureResourceRuntime(app.ResourceAgentDefaults{Workspace: "default", Project: "default", Task: "default"}); err != nil {
		t.Fatal(err)
	}
	if err := workspace.Migrate(""); err != nil {
		t.Fatal(err)
	}
	legacy := []byte(`{"version":1,"sessions":[{"id":"legacy","liveness":{"type":"pid","pid":1}}]}` + "\n")
	legacyPath := filepath.Join(root, "forge-sessions.json")
	if err := os.WriteFile(legacyPath, legacy, 0o600); err != nil {
		t.Fatal(err)
	}
	legacyLock := []byte("legacy-lock")
	legacyLockPath := filepath.Join(root, ".forge-sessions.lock")
	if err := os.WriteFile(legacyLockPath, legacyLock, 0o600); err != nil {
		t.Fatal(err)
	}
	generationPath := filepath.Join(root, ".forge", "runtime", "generations.json")
	if err := os.WriteFile(generationPath, []byte("[]\n"), 0o600); err != nil {
		t.Fatal(err)
	}
	generationBefore, err := os.ReadFile(generationPath)
	if err != nil {
		t.Fatal(err)
	}
	schedulerPath := filepath.Join(root, "scheduler", "scheduler.json")
	schedulerBefore, err := os.ReadFile(schedulerPath)
	if err != nil {
		t.Fatal(err)
	}
	if err := workspace.Migrate(""); err != nil {
		t.Fatal(err)
	}
	if _, err := os.Stat(legacyPath); !os.IsNotExist(err) {
		t.Fatalf("legacy Session projection still visible after migration: %v", err)
	}
	if _, err := os.Stat(legacyLockPath); !os.IsNotExist(err) {
		t.Fatalf("legacy Session lock still visible after migration: %v", err)
	}
	backup, err := os.ReadFile(filepath.Join(root, ".forge", "legacy", "forge-sessions.json"))
	if err != nil || string(backup) != string(legacy) {
		t.Fatalf("legacy Session backup = %q, %v", backup, err)
	}
	lockBackup, err := os.ReadFile(filepath.Join(root, ".forge", "legacy", ".forge-sessions.lock"))
	if err != nil || string(lockBackup) != string(legacyLock) {
		t.Fatalf("legacy Session lock backup = %q, %v", lockBackup, err)
	}
	generationAfter, _ := os.ReadFile(generationPath)
	schedulerAfter, _ := os.ReadFile(schedulerPath)
	if string(generationAfter) != string(generationBefore) || string(schedulerAfter) != string(schedulerBefore) {
		t.Fatal("migration changed the generation index or Scheduler content")
	}
	if err := workspace.Migrate(""); err != nil {
		t.Fatalf("repeat migration was not idempotent: %v", err)
	}
}
