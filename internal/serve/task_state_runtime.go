package serve

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"strings"
	"time"

	"github.com/disksing/pua/internal/app"
	"github.com/disksing/pua/internal/localize"
)

const maxTaskStateRecoveryAttempts = 3

func taskStateContinuationText(language string) string {
	return strings.TrimSpace(localize.MustRender(language, "task-continuation.md", nil))
}

func taskStateContinuationExhaustedNote(language string) string {
	return strings.TrimSpace(localize.MustRender(language, "task-continuation-exhausted.txt", nil))
}

func taskStateContinuationMessageID(resourceID, generationID, chainID, marker string, attempt int) string {
	digest := sha256.Sum256([]byte(fmt.Sprintf("%s\x00%s\x00%s\x00%s\x00%d", resourceID, generationID, chainID, marker, attempt)))
	return "task-state-" + hex.EncodeToString(digest[:12])
}

func taskDetail(workspacePath, resourceID string) (app.ResourceDetailView, bool, error) {
	puaWorkspace, err := app.OpenWorkspace(workspacePath)
	if err != nil {
		return app.ResourceDetailView{}, false, err
	}
	detail, err := puaWorkspace.Resource(resourceID)
	if err != nil {
		return app.ResourceDetailView{}, false, err
	}
	return detail, detail.Type == "task", nil
}

func (m *agentManager) recordTaskStartFailure(workspace serveWorkspace, message resourceMailboxMessage, cause error) (bool, error) {
	if cause == nil || !strings.Contains(normalizedResourceID(message.ResourceID), ".task") || message.GenerationID != "" {
		return false, nil
	}
	updated, err := updateMailboxMessage(workspace.Path, message.ID, func(current *resourceMailboxMessage) {
		current.TaskStartFailureCount++
		if current.TaskStartFailureCount < maxTaskStateRecoveryAttempts {
			return
		}
		now := time.Now().Format(time.RFC3339Nano)
		current.Status = resourceMessageUndeliverable
		current.TerminalAt = now
		current.UpdatedAt = now
		current.LastErrorCode = "task_state_retry_exhausted"
		current.LastError = cause.Error()
	})
	if err != nil || updated.TaskStartFailureCount < maxTaskStateRecoveryAttempts {
		return false, err
	}
	puaWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		return false, err
	}
	note := strings.Join(strings.Fields(cause.Error()), " ")
	if _, err := puaWorkspace.SetTaskState(message.ResourceID, app.TaskStateError, note); err != nil {
		return false, err
	}
	return true, nil
}

// prepareTaskWorkChain runs at the durable delivery boundary. Ordinary input
// starts a fresh budget; a generated continuation keeps the current budget.
func (m *agentManager) prepareTaskWorkChain(workspace serveWorkspace, message resourceMailboxMessage, rt *agentRuntime) error {
	if !strings.Contains(normalizedResourceID(message.ResourceID), ".task") {
		return nil
	}
	detail, task, err := taskDetail(workspace.Path, message.ResourceID)
	if err != nil || !task {
		return err
	}
	puaWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		return err
	}
	if _, err := puaWorkspace.SetTaskState(detail.ID, app.TaskStateInProgress, ""); err != nil {
		return err
	}
	if message.Type == resourceMessageTypeTaskContinuation {
		return nil
	}
	_, err = rt.mutateGeneration(func(record *generationRecord) {
		record.TaskStateChainID = message.ID
		record.TaskStateContinuationCount = 0
	})
	return err
}

func (m *agentManager) scheduleTaskTurnCompletion(rt *agentRuntime, record generationRecord) {
	if rt == nil || strings.TrimSpace(record.CompletionMarker) == "" {
		return
	}
	// Most terminal events do not require another Turn. Handle those inline so
	// startup recovery cannot leave an unnecessary background write racing with
	// shutdown or test Workspace cleanup. Only an in-progress Task needs to
	// re-enter the resource controller to enqueue a continuation.
	detail, task, err := taskDetail(rt.workspace.Path, record.ResourceID)
	if err == nil && (!task || detail.State != app.TaskStateInProgress) {
		_ = markTaskTurnCompletionHandled(rt, record.CompletionMarker)
		return
	}
	m.runBackground(func() {
		_ = m.withResourceController(context.Background(), rt.workspace, record.ResourceID, func() error {
			return m.handleTaskTurnCompletionLocked(context.Background(), rt)
		})
	})
}

func markTaskTurnCompletionHandled(rt *agentRuntime, marker string) error {
	_, err := rt.mutateGeneration(func(current *generationRecord) {
		if current.CompletionMarker == marker {
			current.TaskStateCompletionMarker = marker
		}
	})
	return err
}

func (m *agentManager) handleTaskTurnCompletionLocked(ctx context.Context, rt *agentRuntime) error {
	record := rt.snapshotGeneration()
	if !strings.Contains(normalizedResourceID(record.ResourceID), ".task") {
		return nil
	}
	marker := strings.TrimSpace(record.CompletionMarker)
	if marker == "" || marker == record.TaskStateCompletionMarker {
		return nil
	}
	detail, task, err := taskDetail(rt.workspace.Path, record.ResourceID)
	if err != nil || !task {
		return err
	}
	if detail.State != app.TaskStateInProgress {
		return markTaskTurnCompletionHandled(rt, marker)
	}
	puaWorkspace, err := app.OpenWorkspace(rt.workspace.Path)
	if err != nil {
		return err
	}
	language, err := puaWorkspace.Language()
	if err != nil {
		return err
	}
	if record.TaskStateContinuationCount >= maxTaskStateRecoveryAttempts {
		note := taskStateContinuationExhaustedNote(language)
		if _, err := puaWorkspace.SetTaskState(record.ResourceID, app.TaskStateError, note); err != nil {
			return err
		}
		return markTaskTurnCompletionHandled(rt, marker)
	}
	attempt := record.TaskStateContinuationCount + 1
	instanceID, err := workspaceInstanceID(rt.workspace.Path)
	if err != nil {
		return err
	}
	messageID := taskStateContinuationMessageID(record.ResourceID, record.GenerationID, record.TaskStateChainID, marker, attempt)
	generated := resourceMailboxMessage{
		ID: messageID, ResourceID: record.ResourceID, Text: taskStateContinuationText(language),
		RequestedMode: resourceMessageModeEnqueue, ActualMode: resourceMessageModeEnqueue,
		Type: resourceMessageTypeTaskContinuation,
		Causation: &resourceMessageCausation{
			Type: resourceMessageTypeTaskContinuation, SourceWorkspaceInstanceID: instanceID,
			SourceResourceID: record.ResourceID, MessageID: record.TaskStateChainID, GenerationID: record.GenerationID,
			TurnID: record.CompletionTurnID, TurnReference: marker, Reason: "task_state_in_progress",
		},
	}
	if _, err := acceptGeneratedMailboxMessage(rt.workspace.Path, generated); err != nil {
		return err
	}
	if _, err := rt.mutateGeneration(func(current *generationRecord) {
		if current.CompletionMarker == marker {
			current.TaskStateContinuationCount = attempt
			current.TaskStateCompletionMarker = marker
		}
	}); err != nil {
		return err
	}
	return m.reconcileResourceMailboxLocked(ctx, rt.workspace, record.ResourceID)
}
