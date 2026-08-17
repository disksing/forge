package serve

import (
	"context"
	"testing"
	"time"

	"github.com/disksing/pua/internal/app"
)

func TestTaskTurnCompletionStopsAfterThreeAutomaticContinuations(t *testing.T) {
	manager, workspace, _ := newRuntimeTestManager(t, "http://127.0.0.1:1")
	puaWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := puaWorkspace.SetTaskState("project1.task1", app.TaskStateInProgress, ""); err != nil {
		t.Fatal(err)
	}
	record := generationRecord{
		ID: "task-state-gen", WorkspaceID: workspace.ID, ResourceID: "project1.task1",
		Generation: 1, GenerationID: "gen-task-state", Status: "idle", Title: "Task state",
		CreatedAt: time.Now().Format(time.RFC3339Nano), UpdatedAt: time.Now().Format(time.RFC3339Nano),
		CompletionMarker: "session:4", CompletionTurnID: "turn-4", TaskStateContinuationCount: 3,
	}
	if err := saveGenerationRecord(workspace.Path, record); err != nil {
		t.Fatal(err)
	}
	rt := newAgentHubRuntime(manager, workspace, record, nil)
	if err := manager.handleTaskTurnCompletionLocked(context.Background(), rt); err != nil {
		t.Fatal(err)
	}
	detail, err := puaWorkspace.Resource("project1.task1")
	if err != nil || detail.State != app.TaskStateError {
		t.Fatalf("task state after retry exhaustion = %#v, %v", detail, err)
	}
	updated := rt.snapshotGeneration()
	if updated.TaskStateCompletionMarker != record.CompletionMarker {
		t.Fatalf("completion marker was not handled: %#v", updated)
	}
	// Duplicate terminal observations are no-ops.
	if err := manager.handleTaskTurnCompletionLocked(context.Background(), rt); err != nil {
		t.Fatal(err)
	}
}

func TestTaskContinuationMessageIDIsStablePerAttempt(t *testing.T) {
	first := taskStateContinuationMessageID("project1.task1", "gen-1", "msg-chain", "session:2", 1)
	if first != taskStateContinuationMessageID("project1.task1", "gen-1", "msg-chain", "session:2", 1) {
		t.Fatal("stable continuation input produced different message ids")
	}
	if first == taskStateContinuationMessageID("project1.task1", "gen-1", "msg-chain", "session:2", 2) {
		t.Fatal("different continuation attempts shared a message id")
	}
}

func TestPauseTaskAfterManualTurnStopIgnoresNonTasks(t *testing.T) {
	_, workspace, _ := newRuntimeTestManager(t, "http://127.0.0.1:1")
	state, err := pauseTaskAfterManualTurnStop(workspace, "project1")
	if err != nil || state != "" {
		t.Fatalf("Project manual stop tried to set Task state: state=%q err=%v", state, err)
	}
	state, err = pauseTaskAfterManualTurnStop(workspace, "workspace")
	if err != nil || state != "" {
		t.Fatalf("Workspace manual stop tried to set Task state: state=%q err=%v", state, err)
	}
}

func TestTaskTurnCompletionOutsideInProgressIsHandledSynchronously(t *testing.T) {
	manager, workspace, _ := newRuntimeTestManager(t, "http://127.0.0.1:1")
	record := generationRecord{
		ID: "task-state-idle-gen", WorkspaceID: workspace.ID, ResourceID: "project1.task1",
		Generation: 1, GenerationID: "gen-task-state-idle", Status: "idle", Title: "Task state idle",
		CreatedAt: time.Now().Format(time.RFC3339Nano), UpdatedAt: time.Now().Format(time.RFC3339Nano),
		CompletionMarker: "session:2", CompletionTurnID: "turn-2",
	}
	if err := saveGenerationRecord(workspace.Path, record); err != nil {
		t.Fatal(err)
	}
	rt := newAgentHubRuntime(manager, workspace, record, nil)

	manager.scheduleTaskTurnCompletion(rt, record)

	updated := rt.snapshotGeneration()
	if updated.TaskStateCompletionMarker != record.CompletionMarker {
		t.Fatalf("completion marker was not handled synchronously: %#v", updated)
	}
}

func TestTaskStartFailureExhaustionIsDurable(t *testing.T) {
	manager, workspace, _ := newRuntimeTestManager(t, "http://127.0.0.1:1")
	puaWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := puaWorkspace.SetTaskState("project1.task1", app.TaskStateInProgress, ""); err != nil {
		t.Fatal(err)
	}
	message, err := acceptMailboxMessage(workspace.Path, "project1.task1", resourceMessageRequest{Text: "start", Role: "user", Mode: resourceMessageModeEnqueue})
	if err != nil {
		t.Fatal(err)
	}
	for attempt := 1; attempt <= maxTaskStateRecoveryAttempts; attempt++ {
		exhausted, err := manager.recordTaskStartFailure(workspace, message, &resourceAPIError{Code: "binding_unavailable", Message: "provider unavailable"})
		if err != nil {
			t.Fatal(err)
		}
		if exhausted != (attempt == maxTaskStateRecoveryAttempts) {
			t.Fatalf("attempt %d exhausted = %v", attempt, exhausted)
		}
	}
	stored, found, err := mailboxMessageByID(workspace.Path, message.ID)
	if err != nil || !found || stored.Status != resourceMessageUndeliverable || stored.LastErrorCode != "task_state_retry_exhausted" {
		t.Fatalf("stored start failure = %#v, found=%v, err=%v", stored, found, err)
	}
	detail, err := puaWorkspace.Resource("project1.task1")
	if err != nil || detail.State != app.TaskStateError {
		t.Fatalf("task state after start failures = %#v, %v", detail, err)
	}
}
