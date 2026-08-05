package serve

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"

	"github.com/disksing/forge/internal/app"
)

type autoRunCancelRequest struct {
	ResourceID         string `json:"resourceId"`
	Reason             string `json:"reason,omitempty"`
	RunID              string `json:"runId,omitempty"`
	ExpectedGeneration int    `json:"expectedGeneration,omitempty"`
	ExpectedState      string `json:"expectedState,omitempty"`
}

type autoRunCancelResponse struct {
	Task            app.Task `json:"task"`
	Interrupted     bool     `json:"interrupted"`
	SessionRetained bool     `json:"sessionRetained"`
}

// cancelChatAutoRun is the control-plane cancellation endpoint. The task
// state is written before an AgentHub interrupt is attempted, so an
// ambiguous/non-idempotent interrupt can never reopen the generation through
// the driver.
func (s *server) cancelChatAutoRun(w http.ResponseWriter, r *http.Request, workspaceID string) {
	workspace, err := s.workspace(workspaceID)
	if err != nil {
		writeError(w, err, http.StatusNotFound)
		return
	}
	var req autoRunCancelRequest
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(&req); err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	resourceID := strings.TrimSpace(req.ResourceID)
	if resourceID == "" {
		writeError(w, errors.New("resourceId is required"), http.StatusBadRequest)
		return
	}
	if req.ExpectedGeneration < 0 {
		writeError(w, errors.New("expectedGeneration must not be negative"), http.StatusBadRequest)
		return
	}

	s.autoRunDispatchMu.Lock()
	defer s.autoRunDispatchMu.Unlock()
	if err := s.requireResourceNotExternallyLocked(workspace, resourceID); err != nil {
		writeResourceOperationError(w, err, http.StatusConflict)
		return
	}
	forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	resource, err := forgeWorkspace.ResourceValue(resourceID)
	if err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	if resource.Task == nil {
		writeError(w, errors.New("AutoRun can only be cancelled on a task"), http.StatusBadRequest)
		return
	}

	task, err := forgeWorkspace.CancelAutoRun(app.AutoRunActionInput{
		TaskID:             resourceID,
		Reason:             strings.TrimSpace(req.Reason),
		ExpectedGeneration: req.ExpectedGeneration,
		ExpectedState:      strings.TrimSpace(req.ExpectedState),
	})
	if err != nil {
		writeError(w, err, http.StatusConflict)
		return
	}
	if task.AutoRun == nil {
		writeError(w, errors.New("AutoRun cancellation did not return a generation"), http.StatusInternalServerError)
		return
	}

	interrupted := false
	var interruptErrors []error
	for _, rt := range s.agents.autoRunRuntimes(resourceID, task.AutoRun.Generation, strings.TrimSpace(req.RunID)) {
		if err := s.agents.interruptCancelledAutoRunRun(r.Context(), rt); err != nil {
			interruptErrors = append(interruptErrors, err)
			continue
		}
		interrupted = true
	}
	if len(interruptErrors) > 0 {
		writeError(w, fmt.Errorf("AutoRun was cancelled durably, but its active turn could not be interrupted safely: %w", errors.Join(interruptErrors...)), http.StatusBadGateway)
		return
	}
	writeJSON(w, autoRunCancelResponse{Task: task, Interrupted: interrupted, SessionRetained: true})
}

func (m *agentManager) autoRunRuntimes(resourceID string, generation int, runID string) []*agentRuntime {
	m.mu.Lock()
	runtimes := make([]*agentRuntime, 0, len(m.runtimes))
	for _, rt := range m.runtimes {
		runtimes = append(runtimes, rt)
	}
	m.mu.Unlock()
	result := make([]*agentRuntime, 0, len(runtimes))
	for _, rt := range runtimes {
		run := rt.snapshotRun()
		if strings.TrimSpace(runID) != "" && run.ID != runID {
			continue
		}
		if run.ResourceID != resourceID || !run.SchedulerTurn || run.AutoRunGeneration != generation {
			continue
		}
		result = append(result, rt)
	}
	return result
}

// interruptCancelledAutoRunRun acts only after CancelAutoRun has committed.
// A session that is already ready/stopped needs no interrupt; its scheduler
// turn is still finished so it cannot be retried or continued.
func (m *agentManager) interruptCancelledAutoRunRun(ctx context.Context, rt *agentRuntime) error {
	rt.turnActionMu.Lock()
	defer rt.turnActionMu.Unlock()
	run := rt.snapshotRun()
	if !run.SchedulerTurn || run.AutoRunGeneration <= 0 || strings.TrimSpace(run.AgentHubSessionID) == "" || rt.agentHub == nil {
		return nil
	}
	current, err := m.interruptibleAgentHubSession(ctx, run, rt.agentHub)
	if err != nil {
		var conflictErr *agentHubTurnConflictError
		if errors.As(err, &conflictErr) && strings.Contains(conflictErr.Error(), "not interruptible") {
			go rt.finishSchedulerTurn(m)
			return nil
		}
		recoveryErr := fmt.Errorf("AgentHub turn state could not be confirmed after AutoRun cancellation: %w", err)
		rt.setRecoveryError(m, recoveryErr)
		return recoveryErr
	}
	session, err := rt.agentHub.Interrupt(ctx, current.ID)
	if err != nil {
		// Cancelled is already durable. Never retry this non-idempotent action.
		recoveryErr := fmt.Errorf("AgentHub interrupt outcome may be unknown; it was not retried: %w", err)
		rt.setRecoveryError(m, recoveryErr)
		return recoveryErr
	}
	rt.applyAgentHubSessionState(m, session)
	if session.State == "ready" || session.State == "stopped" {
		go rt.finishSchedulerTurn(m)
	}
	return nil
}
