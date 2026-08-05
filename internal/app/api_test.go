package app_test

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"testing"

	"github.com/disksing/forge/internal/app"
)

func openTestWorkspace(t *testing.T) *app.Workspace {
	t.Helper()
	root := t.TempDir()
	workspace, err := app.Initialize(root, "en")
	if err != nil {
		t.Fatalf("initialize workspace: %v", err)
	}
	return workspace
}

func TestWorkspaceAPIUsesExplicitRootAcrossWorkingDirectoryChanges(t *testing.T) {
	first := openTestWorkspace(t)
	second := openTestWorkspace(t)
	firstProject, err := first.CreateProject("First workspace", "first")
	if err != nil {
		t.Fatalf("create first project: %v", err)
	}
	secondProject, err := second.CreateProject("Second workspace", "second")
	if err != nil {
		t.Fatalf("create second project: %v", err)
	}
	secondTask, err := second.CreateTask(app.CreateTaskInput{ProjectID: secondProject.ID, Title: "Second task", Slug: "second-task"})
	if err != nil {
		t.Fatalf("create second task: %v", err)
	}

	original, err := os.Getwd()
	if err != nil {
		t.Fatal(err)
	}
	other := t.TempDir()
	if err := os.Chdir(other); err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = os.Chdir(original) })

	firstTree, err := first.Tree()
	if err != nil {
		t.Fatalf("read first tree: %v", err)
	}
	secondTree, err := second.Tree()
	if err != nil {
		t.Fatalf("read second tree: %v", err)
	}
	if firstTree.Root != filepath.ToSlash(first.Root()) || secondTree.Root != filepath.ToSlash(second.Root()) {
		t.Fatalf("tree roots do not preserve explicit handles: %q %q", firstTree.Root, secondTree.Root)
	}
	if len(firstTree.Projects) != 1 || firstTree.Projects[0].ID != firstProject.ID {
		t.Fatalf("first tree selected the wrong workspace: %#v", firstTree.Projects)
	}
	if len(secondTree.Projects) != 1 || secondTree.Projects[0].ID != secondProject.ID {
		t.Fatalf("second tree selected the wrong workspace: %#v", secondTree.Projects)
	}
	if _, err := first.Resource(secondTask.ID); err == nil {
		t.Fatal("first workspace unexpectedly resolved a resource from the second workspace")
	}
}

func TestWorkspaceAPIReturnsStructuredErrors(t *testing.T) {
	if _, err := app.OpenWorkspace(t.TempDir()); err == nil {
		t.Fatal("opening a non-workspace should fail")
	} else {
		var apiErr *app.APIError
		if !errors.As(err, &apiErr) || apiErr.Kind != "workspace" || apiErr.Path == "" {
			t.Fatalf("expected structured workspace error, got %T %#v", err, err)
		}
		if !app.IsKind(err, "workspace") {
			t.Fatalf("IsKind did not identify workspace error: %v", err)
		}
	}

	workspace := openTestWorkspace(t)
	if _, err := workspace.Resource("project999"); err == nil {
		t.Fatal("missing resource should fail")
	} else if !app.IsKind(err, "resource") {
		t.Fatalf("expected resource error kind, got %T %v", err, err)
	}
	if _, err := workspace.CreateTask(app.CreateTaskInput{Title: "missing project"}); err == nil || !app.IsKind(err, "task") {
		t.Fatalf("expected typed task validation error, got %v", err)
	}
}

func TestWorkspaceResourceMarkdownHashesTrackContentOnly(t *testing.T) {
	workspace := openTestWorkspace(t)
	project, err := workspace.CreateProject("Hash project", "hashes")
	if err != nil {
		t.Fatal(err)
	}

	findFile := func(detail app.ResourceDetailView, name string) app.ResourceFile {
		t.Helper()
		for _, file := range detail.Files {
			if file.Name == name {
				return file
			}
		}
		t.Fatalf("resource detail is missing %s: %+v", name, detail.Files)
		return app.ResourceFile{}
	}

	first, err := workspace.Resource(project.ID)
	if err != nil {
		t.Fatal(err)
	}
	projectFile := findFile(first, "project.md")
	if projectFile.ContentHash == "" {
		t.Fatal("resource Markdown file is missing its content hash")
	}
	digest := sha256.Sum256([]byte(projectFile.Content))
	if projectFile.ContentHash != hex.EncodeToString(digest[:]) {
		t.Fatalf("resource content hash = %q, want SHA-256 %q", projectFile.ContentHash, hex.EncodeToString(digest[:]))
	}

	if _, err := workspace.AddLog(project.ID, "Refresh metadata", "The Markdown content is unchanged."); err != nil {
		t.Fatal(err)
	}
	second, err := workspace.Resource(project.ID)
	if err != nil {
		t.Fatal(err)
	}
	if got := findFile(second, "project.md").ContentHash; got != projectFile.ContentHash {
		t.Fatalf("log-only resource refresh changed Markdown hash from %q to %q", projectFile.ContentHash, got)
	}

	changedContent := "# Hash project\n\nChanged content.\n"
	if err := os.WriteFile(filepath.Join(workspace.Root(), filepath.FromSlash(projectFile.Path)), []byte(changedContent), 0o644); err != nil {
		t.Fatal(err)
	}
	third, err := workspace.Resource(project.ID)
	if err != nil {
		t.Fatal(err)
	}
	changedFile := findFile(third, "project.md")
	if changedFile.ContentHash == projectFile.ContentHash || changedFile.Content != changedContent {
		t.Fatalf("Markdown content change was not reflected: before=%+v after=%+v", projectFile, changedFile)
	}
}

func TestWorkspaceAPIConcurrentHandlesSerializeResourceCreation(t *testing.T) {
	workspace := openTestWorkspace(t)
	project, err := workspace.CreateProject("Concurrent project", "concurrent")
	if err != nil {
		t.Fatal(err)
	}
	const workers = 16
	created := make(chan app.Task, workers)
	errorsCh := make(chan error, workers)
	var group sync.WaitGroup
	for i := 0; i < workers; i++ {
		group.Add(1)
		go func(index int) {
			defer group.Done()
			task, err := workspace.CreateTask(app.CreateTaskInput{
				ProjectID: project.ID,
				Title:     fmt.Sprintf("Task %02d", index),
				Slug:      fmt.Sprintf("task-%02d", index),
			})
			if err != nil {
				errorsCh <- err
				return
			}
			created <- task
		}(i)
	}
	group.Wait()
	close(created)
	close(errorsCh)
	for err := range errorsCh {
		t.Errorf("concurrent task creation: %v", err)
	}
	seen := make(map[string]bool)
	for task := range created {
		if seen[task.ID] {
			t.Fatalf("duplicate task id %s", task.ID)
		}
		seen[task.ID] = true
	}
	if len(seen) != workers {
		t.Fatalf("created %d tasks, want %d", len(seen), workers)
	}
	listed, err := workspace.Tasks(app.TaskListOptions{ProjectID: project.ID})
	if err != nil {
		t.Fatal(err)
	}
	if len(listed.Tasks) != workers {
		t.Fatalf("workspace lost concurrent tasks: got %d, want %d", len(listed.Tasks), workers)
	}
}

func TestWorkspaceAPISessionFileLockAndResourceConflict(t *testing.T) {
	workspace := openTestWorkspace(t)
	project, err := workspace.CreateProject("Session project", "sessions")
	if err != nil {
		t.Fatal(err)
	}
	task, err := workspace.CreateTask(app.CreateTaskInput{ProjectID: project.ID, Title: "Locked task", Slug: "locked"})
	if err != nil {
		t.Fatal(err)
	}
	const workers = 12
	ids := make(chan string, workers)
	errorsCh := make(chan error, workers)
	var group sync.WaitGroup
	for i := 0; i < workers; i++ {
		group.Add(1)
		go func() {
			defer group.Done()
			session, err := workspace.CreateSession(app.SessionLiveness{Type: "heartbeat", Timeout: "1h"})
			if err != nil {
				errorsCh <- err
				return
			}
			ids <- session.ID
		}()
	}
	group.Wait()
	close(ids)
	close(errorsCh)
	for err := range errorsCh {
		t.Errorf("concurrent session creation: %v", err)
	}
	if got := len(ids); got != workers {
		t.Fatalf("session store lost concurrent sessions: got %d, want %d", got, workers)
	}

	firstID := <-ids
	secondID := <-ids
	if _, err := workspace.LockSession(firstID, task.ID); err != nil {
		t.Fatalf("first session lock: %v", err)
	}
	if _, err := workspace.LockSession(secondID, task.ID); err == nil || !app.IsKind(err, "session") || !strings.Contains(err.Error(), "already controlled") {
		t.Fatalf("expected structured lock conflict, got %v", err)
	}
}

func TestWorkspaceAPILogMutationLockPreservesConcurrentEntries(t *testing.T) {
	workspace := openTestWorkspace(t)
	project, err := workspace.CreateProject("Log project", "logs")
	if err != nil {
		t.Fatal(err)
	}
	const workers = 12
	errorsCh := make(chan error, workers)
	var group sync.WaitGroup
	for i := 0; i < workers; i++ {
		group.Add(1)
		go func(index int) {
			defer group.Done()
			_, err := workspace.AddLog(project.ID, fmt.Sprintf("entry %d", index), "details")
			if err != nil {
				errorsCh <- err
			}
		}(i)
	}
	group.Wait()
	close(errorsCh)
	for err := range errorsCh {
		t.Errorf("concurrent log update: %v", err)
	}
	entries, err := workspace.Logs(project.ID)
	if err != nil {
		t.Fatal(err)
	}
	if len(entries) != workers+1 {
		t.Fatalf("log mutation lost entries: got %d, want %d", len(entries), workers+1)
	}
}

func TestWorkspaceAPIAutoRunFileLockPreservesConcurrentLogUpdates(t *testing.T) {
	workspace := openTestWorkspace(t)
	project, err := workspace.CreateProject("AutoRun project", "autorun")
	if err != nil {
		t.Fatal(err)
	}
	task, err := workspace.CreateTask(app.CreateTaskInput{ProjectID: project.ID, Title: "AutoRun task", Slug: "autorun", AutoRun: true})
	if err != nil {
		t.Fatal(err)
	}
	if _, err := workspace.StartAutoRun(task.ID); err != nil {
		t.Fatal(err)
	}
	const workers = 10
	errorsCh := make(chan error, workers)
	var group sync.WaitGroup
	for i := 0; i < workers; i++ {
		group.Add(1)
		go func(index int) {
			defer group.Done()
			_, err := workspace.CompleteAutoRun(app.AutoRunActionInput{TaskID: task.ID, Summary: fmt.Sprintf("completion %d", index)})
			if err != nil {
				errorsCh <- err
			}
		}(i)
	}
	group.Wait()
	close(errorsCh)
	for err := range errorsCh {
		t.Errorf("concurrent AutoRun update: %v", err)
	}
	entries, err := workspace.Logs(task.ID)
	if err != nil {
		t.Fatal(err)
	}
	completed := 0
	for _, entry := range entries {
		if entry.Title == "Auto Run completed" {
			completed++
		}
	}
	if completed != workers {
		t.Fatalf("AutoRun lock lost log updates: got %d completion entries, want %d", completed, workers)
	}
}

func TestWorkspaceAPIResumeAutoRunConcurrentWakeIsIdempotent(t *testing.T) {
	workspace := openTestWorkspace(t)
	project, err := workspace.CreateProject("AutoRun wake project", "wake")
	if err != nil {
		t.Fatal(err)
	}
	task, err := workspace.CreateTask(app.CreateTaskInput{ProjectID: project.ID, Title: "Wake task", Slug: "wake", AutoRun: true})
	if err != nil {
		t.Fatal(err)
	}
	if _, err := workspace.StartAutoRun(task.ID); err != nil {
		t.Fatal(err)
	}
	if _, err := workspace.SuspendAutoRun(app.AutoRunActionInput{TaskID: task.ID, Summary: "waiting for upstream"}); err != nil {
		t.Fatal(err)
	}
	const workers = 12
	errorsCh := make(chan error, workers)
	var group sync.WaitGroup
	for i := 0; i < workers; i++ {
		group.Add(1)
		go func() {
			defer group.Done()
			// Manual resume, timed wake-up, and scheduler scans race here; only
			// one may transition and log the generation.
			if _, err := workspace.ResumeAutoRun(task.ID); err != nil {
				errorsCh <- err
			}
		}()
	}
	group.Wait()
	close(errorsCh)
	for err := range errorsCh {
		t.Errorf("concurrent resume: %v", err)
	}
	resource, err := workspace.ResourceValue(task.ID)
	if err != nil || resource.Task == nil || resource.Task.AutoRun == nil {
		t.Fatalf("load task: %v", err)
	}
	if resource.Task.AutoRun.State != "queued" {
		t.Fatalf("expected queued after concurrent resume, got %s", resource.Task.AutoRun.State)
	}
	entries, err := workspace.Logs(task.ID)
	if err != nil {
		t.Fatal(err)
	}
	resumes := 0
	for _, entry := range entries {
		if entry.AutoRun && entry.AutoRunGeneration == resource.Task.AutoRun.Generation && entry.Title == "Auto Run queued" && entry.Details == "resumed" {
			resumes++
		}
	}
	if resumes != 1 {
		t.Fatalf("concurrent resume double-transitioned: got %d resume log entries, want 1", resumes)
	}
}

func TestWorkspaceAPIMigratesLegacyWaitingAutoRun(t *testing.T) {
	root := t.TempDir()
	workspace, err := app.Initialize(root, "en")
	if err != nil {
		t.Fatal(err)
	}
	project, err := workspace.CreateProject("Migration project", "migration")
	if err != nil {
		t.Fatal(err)
	}
	task, err := workspace.CreateTask(app.CreateTaskInput{ProjectID: project.ID, Title: "Legacy waiting", Slug: "legacy-waiting", AutoRun: true})
	if err != nil {
		t.Fatal(err)
	}
	resource, err := workspace.ResourceValue(task.ID)
	if err != nil || resource.Task == nil || resource.Task.AutoRun == nil {
		t.Fatalf("load task: %v", err)
	}
	// Rewrite task.json with the pre-simplification waiting + after shape.
	taskPath := filepath.Join(root, filepath.FromSlash(resource.Path))
	legacy := struct {
		SchemaVersion int    `json:"schemaVersion"`
		ID            string `json:"id"`
		Type          string `json:"type"`
		Title         string `json:"title"`
		CreatedAt     string `json:"createdAt"`
		UpdatedAt     string `json:"updatedAt"`
		Parent        string `json:"parent"`
		Description   string `json:"description,omitempty"`
		Repos         []any  `json:"repos,omitempty"`
		AutoRun       struct {
			Generation int    `json:"generation"`
			State      string `json:"state"`
			Prompt     string `json:"prompt,omitempty"`
			After      []struct {
				TaskID     string `json:"taskId"`
				Generation int    `json:"generation"`
			} `json:"after,omitempty"`
		} `json:"autoRun,omitempty"`
	}{
		SchemaVersion: 1, ID: resource.Task.ID, Type: "task", Title: resource.Task.Title,
		CreatedAt: resource.Task.CreatedAt, UpdatedAt: resource.Task.UpdatedAt, Parent: resource.Task.Parent,
	}
	legacy.AutoRun.Generation = 1
	legacy.AutoRun.State = "waiting"
	legacy.AutoRun.Prompt = "integrate the prerequisite"
	legacy.AutoRun.After = []struct {
		TaskID     string `json:"taskId"`
		Generation int    `json:"generation"`
	}{{TaskID: "project1.task7", Generation: 2}, {TaskID: "project1.task9", Generation: 1}}
	data, err := json.Marshal(legacy)
	if err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(taskPath, "task.json"), data, 0o644); err != nil {
		t.Fatal(err)
	}

	resource, err = workspace.ResourceValue(task.ID)
	if err != nil || resource.Task == nil || resource.Task.AutoRun == nil {
		t.Fatalf("reload migrated task: %v", err)
	}
	autoRun := resource.Task.AutoRun
	if autoRun.State != "suspended" {
		t.Fatalf("expected waiting to migrate to suspended, got %s", autoRun.State)
	}
	if autoRun.SuspendedAt == "" {
		t.Fatalf("migrated task must have a suspendedAt timestamp")
	}
	if !strings.Contains(autoRun.SuspensionSummary, "project1.task7@2") || !strings.Contains(autoRun.SuspensionSummary, "project1.task9@1") {
		t.Fatalf("migrated summary must flatten dependencies, got %q", autoRun.SuspensionSummary)
	}
	// Migration is idempotent: reading again keeps the same state.
	resource, err = workspace.ResourceValue(task.ID)
	if err != nil || resource.Task == nil || resource.Task.AutoRun == nil {
		t.Fatalf("reload migrated task again: %v", err)
	}
	if resource.Task.AutoRun.State != "suspended" || resource.Task.AutoRun.SuspendedAt != autoRun.SuspendedAt {
		t.Fatalf("migration is not idempotent: %+v", resource.Task.AutoRun)
	}
}
