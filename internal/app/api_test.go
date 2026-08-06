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

func TestWorkspaceAPIQueueAutoRunGenerationParameters(t *testing.T) {
	workspace := openTestWorkspace(t)
	project, err := workspace.CreateProject("Parameter project", "parameters")
	if err != nil {
		t.Fatal(err)
	}
	task, err := workspace.CreateTask(app.CreateTaskInput{ProjectID: project.ID, Title: "Parameter task", Slug: "parameters"})
	if err != nil {
		t.Fatal(err)
	}
	queued, err := workspace.QueueAutoRun(app.AutoRunQueueInput{
		TaskID: task.ID, AgentName: "agent-one", AgentNameSet: true,
		Prompt: "Inspect the change", PromptSet: true,
		CompletionCriteria: "The focused tests pass.", CompletionCriteriaSet: true,
	})
	if err != nil || queued.AutoRun == nil {
		t.Fatalf("queue with generation parameters failed: task=%+v err=%v", queued, err)
	}
	if queued.AutoRun.AgentName != "agent-one" || queued.AutoRun.Prompt != "Inspect the change" || queued.AutoRun.CompletionCriteria != "The focused tests pass." {
		t.Fatalf("generation parameters were not persisted: %+v", queued.AutoRun)
	}
	if _, err := workspace.StartAutoRun(task.ID); err != nil {
		t.Fatal(err)
	}
	if _, err := workspace.CompleteAutoRun(app.AutoRunActionInput{TaskID: task.ID}); err != nil {
		t.Fatal(err)
	}
	inherited, err := workspace.QueueAutoRun(app.AutoRunQueueInput{TaskID: task.ID})
	if err != nil || inherited.AutoRun == nil {
		t.Fatalf("terminal queue failed: task=%+v err=%v", inherited, err)
	}
	if inherited.AutoRun.Generation != 2 || inherited.AutoRun.AgentName != "agent-one" || inherited.AutoRun.Prompt != "Inspect the change" || inherited.AutoRun.CompletionCriteria != "The focused tests pass." {
		t.Fatalf("terminal generation did not inherit parameters: %+v", inherited.AutoRun)
	}
	cleared, err := workspace.CompleteAutoRun(app.AutoRunActionInput{TaskID: task.ID})
	if err != nil {
		// The generation is queued after the previous assertion; move it through
		// the state machine before testing explicit empty values.
		if _, startErr := workspace.StartAutoRun(task.ID); startErr != nil {
			t.Fatal(startErr)
		}
		cleared, err = workspace.CompleteAutoRun(app.AutoRunActionInput{TaskID: task.ID})
	}
	if err != nil || cleared.AutoRun == nil {
		t.Fatalf("prepare explicit clear failed: task=%+v err=%v", cleared, err)
	}
	cleared, err = workspace.QueueAutoRun(app.AutoRunQueueInput{
		TaskID: task.ID, AgentName: "agent-two", AgentNameSet: true,
		Prompt: "", PromptSet: true, CompletionCriteria: "", CompletionCriteriaSet: true,
	})
	if err != nil || cleared.AutoRun == nil {
		t.Fatalf("queue with explicit empty values failed: task=%+v err=%v", cleared, err)
	}
	if cleared.AutoRun.AgentName != "agent-two" || cleared.AutoRun.Prompt != "" || cleared.AutoRun.CompletionCriteria != "" {
		t.Fatalf("explicit empty values were inherited unexpectedly: %+v", cleared.AutoRun)
	}
}

func TestWorkspaceAPIAutoRunStateTransitionsNormalizeSuspensionMetadata(t *testing.T) {
	workspace := openTestWorkspace(t)
	project, err := workspace.CreateProject("AutoRun state project", "autorun-state")
	if err != nil {
		t.Fatal(err)
	}
	task, err := workspace.CreateTask(app.CreateTaskInput{ProjectID: project.ID, Title: "State task", Slug: "state", AutoRun: true})
	if err != nil {
		t.Fatal(err)
	}
	if _, err := workspace.StartAutoRun(task.ID); err != nil {
		t.Fatal(err)
	}
	suspended, err := workspace.SuspendAutoRun(app.AutoRunActionInput{TaskID: task.ID, Summary: "waiting for review"})
	if err != nil || suspended.AutoRun == nil {
		t.Fatalf("suspend failed: task=%+v err=%v", suspended, err)
	}
	if suspended.AutoRun.State != "suspended" || suspended.AutoRun.SuspendedAt == "" || suspended.AutoRun.SuspensionSummary != "waiting for review" {
		t.Fatalf("unexpected suspended metadata: %+v", suspended.AutoRun)
	}

	resumed, err := workspace.ResumeAutoRun(task.ID)
	if err != nil || resumed.AutoRun == nil {
		t.Fatalf("resume failed: task=%+v err=%v", resumed, err)
	}
	if resumed.AutoRun.State != "queued" || resumed.AutoRun.SuspendedAt != "" || resumed.AutoRun.SuspensionSummary != "waiting for review" {
		t.Fatalf("resume must clear only suspended metadata, got: %+v", resumed.AutoRun)
	}
	if _, err := workspace.StartAutoRun(task.ID); err != nil {
		t.Fatal(err)
	}
	completed, err := workspace.CompleteAutoRun(app.AutoRunActionInput{
		TaskID: task.ID, ExpectedGeneration: 1, ExpectedState: "running", Summary: "done",
	})
	if err != nil || completed.AutoRun == nil {
		t.Fatalf("complete failed: task=%+v err=%v", completed, err)
	}
	if completed.AutoRun.State != "completed" || completed.AutoRun.SuspendedAt != "" || completed.AutoRun.SuspensionSummary != "waiting for review" {
		t.Fatalf("completion must not resurrect or erase prompt context: %+v", completed.AutoRun)
	}

	generationTwo, err := workspace.QueueAutoRun(app.AutoRunQueueInput{TaskID: task.ID})
	if err != nil || generationTwo.AutoRun == nil {
		t.Fatalf("queue generation 2 failed: task=%+v err=%v", generationTwo, err)
	}
	if generationTwo.AutoRun.Generation != 2 || generationTwo.AutoRun.State != "queued" || generationTwo.AutoRun.SuspensionSummary != "" || generationTwo.AutoRun.SuspendedAt != "" {
		t.Fatalf("new generation inherited stale status metadata: %+v", generationTwo.AutoRun)
	}
	if _, err := workspace.StartAutoRun(task.ID); err != nil {
		t.Fatal(err)
	}
	suspendedAgain, err := workspace.SuspendAutoRun(app.AutoRunActionInput{TaskID: task.ID, Summary: "waiting for dependency"})
	if err != nil || suspendedAgain.AutoRun == nil || suspendedAgain.AutoRun.SuspendedAt == "" {
		t.Fatalf("second suspend failed: task=%+v err=%v", suspendedAgain, err)
	}
	completedFromSuspended, err := workspace.CompleteAutoRun(app.AutoRunActionInput{
		TaskID: task.ID, ExpectedGeneration: 2, ExpectedState: "suspended",
	})
	if err != nil || completedFromSuspended.AutoRun == nil {
		t.Fatalf("completion from suspended state failed: task=%+v err=%v", completedFromSuspended, err)
	}
	if completedFromSuspended.AutoRun.State != "completed" || completedFromSuspended.AutoRun.SuspendedAt != "" {
		t.Fatalf("terminal transition left suspendedAt behind: %+v", completedFromSuspended.AutoRun)
	}

	generationThree, err := workspace.QueueAutoRun(app.AutoRunQueueInput{TaskID: task.ID})
	if err != nil || generationThree.AutoRun == nil {
		t.Fatalf("queue generation 3 failed: task=%+v err=%v", generationThree, err)
	}
	if generationThree.AutoRun.Generation != 3 || generationThree.AutoRun.SuspensionSummary != "" || generationThree.AutoRun.SuspendedAt != "" {
		t.Fatalf("generation 3 inherited generation 2 status metadata: %+v", generationThree.AutoRun)
	}
	if _, err := workspace.StartAutoRun(task.ID); err != nil {
		t.Fatal(err)
	}
	paused, err := workspace.PauseAutoRun(app.AutoRunActionInput{TaskID: task.ID, Summary: "manual review"})
	if err != nil || paused.AutoRun == nil {
		t.Fatalf("pause failed: task=%+v err=%v", paused, err)
	}
	if paused.AutoRun.State != "paused" || paused.AutoRun.SuspendedAt != "" || paused.AutoRun.SuspensionSummary != "" || paused.AutoRun.WakeCondition != "" {
		t.Fatalf("pause metadata is incorrect: %+v", paused.AutoRun)
	}
	if _, err := workspace.ResumeAutoRun(task.ID); err != nil {
		t.Fatal(err)
	}
	if _, err := workspace.StartAutoRun(task.ID); err != nil {
		t.Fatal(err)
	}
	failed, err := workspace.FailAutoRun(app.AutoRunActionInput{TaskID: task.ID, Reason: "provider failed"})
	if err != nil || failed.AutoRun == nil {
		t.Fatalf("fail failed: task=%+v err=%v", failed, err)
	}
	if failed.AutoRun.State != "failed" || failed.AutoRun.SuspendedAt != "" {
		t.Fatalf("failure left suspended metadata behind: %+v", failed.AutoRun)
	}
}

func TestWorkspaceAPIResumeAutoRunWithAgentPersistsCurrentGenerationCAS(t *testing.T) {
	for _, state := range []string{"suspended", "paused"} {
		t.Run(state, func(t *testing.T) {
			workspace := openTestWorkspace(t)
			project, err := workspace.CreateProject("Resume Agent project", "resume-agent")
			if err != nil {
				t.Fatal(err)
			}
			task, err := workspace.CreateTask(app.CreateTaskInput{
				ProjectID: project.ID, Title: "Resume Agent task", Slug: "resume-agent", AutoRun: true,
				AgentName: "saved-agent", PreferredAgentProfiles: []string{"preferred"},
				Prompt: "Keep these instructions", CompletionCriteria: "Keep this completion rule",
			})
			if err != nil {
				t.Fatal(err)
			}
			if _, err := workspace.StartAutoRun(task.ID); err != nil {
				t.Fatal(err)
			}
			if _, err := workspace.SuspendAutoRun(app.AutoRunActionInput{
				TaskID: task.ID, Summary: "waiting for a reviewer", WakeCondition: "reviewer approves",
				ExpectedGeneration: 1, ExpectedState: "running",
			}); err != nil {
				t.Fatal(err)
			}
			if state == "paused" {
				if _, err := workspace.ResumeAutoRun(task.ID); err != nil {
					t.Fatal(err)
				}
				if _, err := workspace.StartAutoRun(task.ID); err != nil {
					t.Fatal(err)
				}
				if _, err := workspace.PauseAutoRun(app.AutoRunActionInput{
					TaskID: task.ID, Reason: "manual review", ExpectedGeneration: 1, ExpectedState: "running",
				}); err != nil {
					t.Fatal(err)
				}
			}

			resumed, err := workspace.ResumeAutoRunWithAgent(app.AutoRunResumeInput{
				TaskID: task.ID, AgentName: "explicit-agent", AgentNameSet: true,
				ExpectedGeneration: 1, ExpectedState: state,
			})
			if err != nil || resumed.AutoRun == nil {
				t.Fatalf("resume with explicit Agent failed: task=%+v err=%v", resumed, err)
			}
			got := resumed.AutoRun
			if got.Generation != 1 || got.State != "queued" || got.AgentName != "explicit-agent" || got.SuspendedAt != "" ||
				got.PreferredAgentProfiles[0] != "preferred" || got.Prompt != "Keep these instructions" ||
				got.CompletionCriteria != "Keep this completion rule" || got.SuspensionSummary != "waiting for a reviewer" ||
				got.WakeCondition != "reviewer approves" {
				t.Fatalf("resume changed more than the selected Agent and state: %+v", got)
			}

			beforeStale, err := workspace.ResourceValue(task.ID)
			if err != nil || beforeStale.Task == nil || beforeStale.Task.AutoRun == nil {
				t.Fatalf("reload resumed task: resource=%+v err=%v", beforeStale, err)
			}
			if _, err := workspace.ResumeAutoRunWithAgent(app.AutoRunResumeInput{
				TaskID: task.ID, AgentName: "stale-agent", AgentNameSet: true,
				ExpectedGeneration: 1, ExpectedState: state,
			}); err == nil {
				t.Fatal("stale state CAS unexpectedly succeeded after resume")
			}
			afterStale, err := workspace.ResourceValue(task.ID)
			if err != nil || afterStale.Task == nil || afterStale.Task.AutoRun == nil {
				t.Fatalf("reload after stale resume: resource=%+v err=%v", afterStale, err)
			}
			if afterStale.Task.AutoRun.AgentName != "explicit-agent" || afterStale.Task.AutoRun.State != "queued" {
				t.Fatalf("stale resume mutated the generation: %+v", afterStale.Task.AutoRun)
			}

			if _, err := workspace.ResumeAutoRunWithAgent(app.AutoRunResumeInput{
				TaskID: task.ID, AgentNameSet: true, ExpectedGeneration: 1, ExpectedState: "queued",
			}); err == nil {
				t.Fatal("an explicit empty Agent unexpectedly succeeded")
			}
			final, err := workspace.ResourceValue(task.ID)
			if err != nil || final.Task == nil || final.Task.AutoRun == nil || final.Task.AutoRun.AgentName != "explicit-agent" {
				t.Fatalf("empty Agent attempt mutated persisted choice: resource=%+v err=%v", final, err)
			}
		})
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

func TestWorkspaceAPIResumeAndStartAutoRunUsesGenerationStateCAS(t *testing.T) {
	workspace := openTestWorkspace(t)
	project, err := workspace.CreateProject("Atomic resume project", "atomic-resume")
	if err != nil {
		t.Fatal(err)
	}
	task, err := workspace.CreateTask(app.CreateTaskInput{
		ProjectID: project.ID, Title: "Atomic resume task", Slug: "atomic-resume", AutoRun: true,
	})
	if err != nil {
		t.Fatal(err)
	}
	if _, err := workspace.StartAutoRun(task.ID); err != nil {
		t.Fatal(err)
	}
	if _, err := workspace.SuspendAutoRun(app.AutoRunActionInput{
		TaskID: task.ID, Summary: "waiting for a human", WakeCondition: "human sends a message",
		ExpectedGeneration: 1, ExpectedState: "running",
	}); err != nil {
		t.Fatal(err)
	}

	resumed, err := workspace.ResumeAndStartAutoRun(app.AutoRunActionInput{
		TaskID: task.ID, ExpectedGeneration: 1, ExpectedState: "suspended",
	})
	if err != nil || resumed.AutoRun == nil {
		t.Fatalf("atomic resume failed: task=%+v err=%v", resumed, err)
	}
	if resumed.AutoRun.State != "running" || resumed.AutoRun.Generation != 1 || resumed.AutoRun.SuspendedAt != "" ||
		resumed.AutoRun.SuspensionSummary != "waiting for a human" || resumed.AutoRun.WakeCondition != "human sends a message" {
		t.Fatalf("atomic resume changed the wrong projection: %+v", resumed.AutoRun)
	}

	if _, err := workspace.ResumeAndStartAutoRun(app.AutoRunActionInput{
		TaskID: task.ID, ExpectedGeneration: 1, ExpectedState: "suspended",
	}); err == nil {
		t.Fatal("stale suspended CAS unexpectedly succeeded after the generation became running")
	}
	if _, err := workspace.ResumeAndStartAutoRun(app.AutoRunActionInput{
		TaskID: task.ID, ExpectedGeneration: 2, ExpectedState: "suspended",
	}); err == nil {
		t.Fatal("stale generation CAS unexpectedly succeeded")
	}

	logs, err := workspace.Logs(task.ID)
	if err != nil {
		t.Fatal(err)
	}
	queued, started := 0, 0
	for _, entry := range logs {
		if !entry.AutoRun || entry.AutoRunGeneration != 1 {
			continue
		}
		switch {
		case entry.Title == "Auto Run queued" && entry.Details == "resumed":
			queued++
		case entry.Title == "Auto Run started":
			started++
		}
	}
	if queued != 1 || started != 2 {
		t.Fatalf("atomic resume logged duplicate or incomplete transitions: queued=%d started=%d logs=%#v", queued, started, logs)
	}

	paused, err := workspace.PauseAutoRun(app.AutoRunActionInput{
		TaskID: task.ID, ExpectedGeneration: 1, ExpectedState: "running",
	})
	if err != nil || paused.AutoRun == nil || paused.AutoRun.State != "paused" {
		t.Fatalf("pause setup failed: task=%+v err=%v", paused, err)
	}
	if _, err := workspace.ResumeAndStartAutoRun(app.AutoRunActionInput{
		TaskID: task.ID, ExpectedGeneration: 1, ExpectedState: "suspended",
	}); err == nil {
		t.Fatal("paused AutoRun was implicitly accepted as suspended")
	}
}

func TestWorkspaceAPIResumeAndStartAutoRunConcurrentCASIsSingleWinner(t *testing.T) {
	workspace := openTestWorkspace(t)
	project, err := workspace.CreateProject("Atomic race project", "atomic-race")
	if err != nil {
		t.Fatal(err)
	}
	task, err := workspace.CreateTask(app.CreateTaskInput{ProjectID: project.ID, Title: "Atomic race task", Slug: "atomic-race", AutoRun: true})
	if err != nil {
		t.Fatal(err)
	}
	if _, err := workspace.StartAutoRun(task.ID); err != nil {
		t.Fatal(err)
	}
	if _, err := workspace.SuspendAutoRun(app.AutoRunActionInput{TaskID: task.ID, ExpectedGeneration: 1, ExpectedState: "running"}); err != nil {
		t.Fatal(err)
	}

	const workers = 10
	results := make(chan error, workers)
	var group sync.WaitGroup
	for i := 0; i < workers; i++ {
		group.Add(1)
		go func() {
			defer group.Done()
			_, err := workspace.ResumeAndStartAutoRun(app.AutoRunActionInput{
				TaskID: task.ID, ExpectedGeneration: 1, ExpectedState: "suspended",
			})
			results <- err
		}()
	}
	group.Wait()
	close(results)
	winners := 0
	for err := range results {
		if err == nil {
			winners++
		}
	}
	if winners != 1 {
		t.Fatalf("atomic resume had %d winners, want 1", winners)
	}
	resource, err := workspace.ResourceValue(task.ID)
	if err != nil || resource.Task == nil || resource.Task.AutoRun == nil {
		t.Fatalf("reload resumed task: resource=%+v err=%v", resource, err)
	}
	if resource.Task.AutoRun.State != "running" || resource.Task.AutoRun.Generation != 1 {
		t.Fatalf("concurrent resume final state: %+v", resource.Task.AutoRun)
	}
}

func TestWorkspaceAPIAutoRunCancellationCASAndNewGeneration(t *testing.T) {
	workspace := openTestWorkspace(t)
	project, err := workspace.CreateProject("Cancellation project", "cancellation")
	if err != nil {
		t.Fatal(err)
	}
	task, err := workspace.CreateTask(app.CreateTaskInput{
		ProjectID: project.ID, Title: "Cancellation task", Slug: "cancellation", AutoRun: true,
		AgentName: "agent-one", PreferredAgentProfiles: []string{"codex"}, Prompt: "Inspect the change",
		CompletionCriteria: "The focused tests pass.",
	})
	if err != nil {
		t.Fatal(err)
	}
	if _, err := workspace.StartAutoRun(task.ID); err != nil {
		t.Fatal(err)
	}
	suspended, err := workspace.SuspendAutoRun(app.AutoRunActionInput{
		TaskID: task.ID, Summary: "waiting for the upstream merge", WakeCondition: "the merge is in origin/master",
		ExpectedGeneration: 1, ExpectedState: "running",
	})
	if err != nil || suspended.AutoRun == nil || suspended.AutoRun.WakeCondition != "the merge is in origin/master" {
		t.Fatalf("suspend did not persist separate wake condition: task=%+v err=%v", suspended, err)
	}
	if _, err := workspace.CancelAutoRun(app.AutoRunActionInput{TaskID: task.ID, Reason: "user cancelled this generation", ExpectedGeneration: 1, ExpectedState: "queued"}); err == nil {
		t.Fatal("expected stale-state cancellation CAS to fail")
	}
	cancelled, err := workspace.CancelAutoRun(app.AutoRunActionInput{TaskID: task.ID, Reason: "user cancelled this generation", ExpectedGeneration: 1, ExpectedState: "suspended"})
	if err != nil || cancelled.AutoRun == nil || cancelled.AutoRun.State != "cancelled" {
		t.Fatalf("cancel did not persist terminal state: task=%+v err=%v", cancelled, err)
	}
	if cancelled.AutoRun.WakeCondition != "the merge is in origin/master" || cancelled.AutoRun.SuspendedAt != "" {
		t.Fatalf("cancellation changed retained suspension metadata unexpectedly: %+v", cancelled.AutoRun)
	}
	logs, err := workspace.Logs(task.ID)
	if err != nil {
		t.Fatal(err)
	}
	cancelLogs := 0
	for _, entry := range logs {
		if entry.Title == "Auto Run cancelled" {
			cancelLogs++
			if entry.Details != "user cancelled this generation" || entry.Time == "" {
				t.Fatalf("cancellation log did not retain reason/time: %+v", entry)
			}
		}
	}
	if cancelLogs != 1 {
		t.Fatalf("expected one cancellation log, got %d: %+v", cancelLogs, logs)
	}
	if _, err := workspace.CancelAutoRun(app.AutoRunActionInput{TaskID: task.ID, ExpectedGeneration: 1, ExpectedState: "running"}); err != nil {
		t.Fatalf("cancel should be idempotent: %v", err)
	}
	logs, err = workspace.Logs(task.ID)
	if err != nil {
		t.Fatal(err)
	}
	cancelLogs = 0
	for _, entry := range logs {
		if entry.Title == "Auto Run cancelled" {
			cancelLogs++
		}
	}
	if cancelLogs != 1 {
		t.Fatalf("idempotent cancellation appended a log: %+v", logs)
	}
	if _, err := workspace.ResumeAutoRun(task.ID); err == nil {
		t.Fatal("cancelled generation must not be resumable")
	}
	next, err := workspace.QueueAutoRun(app.AutoRunQueueInput{TaskID: task.ID})
	if err != nil || next.AutoRun == nil {
		t.Fatalf("cancelled generation could not start a new generation: task=%+v err=%v", next, err)
	}
	if next.AutoRun.Generation != 2 || next.AutoRun.State != "queued" || next.AutoRun.AgentName != "agent-one" || next.AutoRun.Prompt != "Inspect the change" || next.AutoRun.CompletionCriteria != "The focused tests pass." {
		t.Fatalf("new generation did not inherit editable configuration: %+v", next.AutoRun)
	}
	if next.AutoRun.SuspensionSummary != "" || next.AutoRun.WakeCondition != "" || next.AutoRun.SuspendedAt != "" {
		t.Fatalf("new generation retained cancelled suspension metadata: %+v", next.AutoRun)
	}
}

func TestWorkspaceAPIMigratesSuspendedWakeConditionIdempotently(t *testing.T) {
	root := t.TempDir()
	workspace, err := app.Initialize(root, "en")
	if err != nil {
		t.Fatal(err)
	}
	project, err := workspace.CreateProject("Wake migration project", "wake-migration")
	if err != nil {
		t.Fatal(err)
	}
	task, err := workspace.CreateTask(app.CreateTaskInput{ProjectID: project.ID, Title: "Legacy suspended", Slug: "legacy-suspended", AutoRun: true})
	if err != nil {
		t.Fatal(err)
	}
	resource, err := workspace.ResourceValue(task.ID)
	if err != nil || resource.Task == nil {
		t.Fatalf("load task: %v", err)
	}
	taskPath := filepath.Join(root, filepath.FromSlash(resource.Path), "task.json")
	data, err := os.ReadFile(taskPath)
	if err != nil {
		t.Fatal(err)
	}
	var metadata map[string]any
	if err := json.Unmarshal(data, &metadata); err != nil {
		t.Fatal(err)
	}
	metadata["autoRun"] = map[string]any{"generation": 1, "state": "suspended"}
	data, err = json.MarshalIndent(metadata, "", "  ")
	if err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(taskPath, data, 0o644); err != nil {
		t.Fatal(err)
	}
	migrated, err := workspace.ResourceValue(task.ID)
	if err != nil || migrated.Task == nil || migrated.Task.AutoRun == nil {
		t.Fatalf("read suspended migration: %v", err)
	}
	autoRun := migrated.Task.AutoRun
	if autoRun.State != "suspended" || autoRun.SuspendedAt == "" || autoRun.SuspensionSummary != "Re-check whether the blocking condition has changed" || autoRun.WakeCondition != autoRun.SuspensionSummary {
		t.Fatalf("suspended wake migration did not fill safe fallback: %+v", autoRun)
	}
	logs, err := workspace.Logs(task.ID)
	if err != nil {
		t.Fatal(err)
	}
	migrationLogs := 0
	for _, entry := range logs {
		if entry.Title == "Auto Run wake condition migrated" && entry.AutoRunWakeConditionFallback {
			migrationLogs++
		}
	}
	if migrationLogs != 1 {
		t.Fatalf("wake migration did not record one compatibility fallback: %+v", logs)
	}
	stableAt := autoRun.SuspendedAt
	second, err := workspace.ResourceValue(task.ID)
	if err != nil || second.Task == nil || second.Task.AutoRun == nil {
		t.Fatalf("second migration read: %v", err)
	}
	if second.Task.AutoRun.SuspendedAt != stableAt || second.Task.AutoRun.WakeCondition != autoRun.WakeCondition {
		t.Fatalf("suspended wake migration is not idempotent: first=%+v second=%+v", autoRun, second.Task.AutoRun)
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
