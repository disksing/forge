package serve

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"path/filepath"
	"strings"
	"time"

	"github.com/disksing/forge/internal/app"
)

type resourceEndGenerationResponse struct {
	Status       string `json:"status"`
	GenerationID string `json:"generationId,omitempty"`
}

func (m *agentManager) currentResourceRun(workspace serveWorkspace, resourceID string) (agentRun, error) {
	resourceID = normalizedResourceID(resourceID)
	if err := validateResourceHistoryTarget(workspace, resourceID); err != nil {
		return agentRun{}, err
	}
	run, found, err := currentResourceGeneration(workspace.Path, resourceID)
	if err != nil {
		return agentRun{}, err
	}
	if !found || strings.TrimSpace(run.GenerationID) == "" || strings.TrimSpace(run.AgentHubSessionID) == "" {
		return agentRun{}, &resourceAPIError{Code: "generation_unavailable", Message: "resource has no current AgentHub generation"}
	}
	return run, nil
}

func (m *agentManager) resolveResourceLiveTarget(workspaceID, resourceID, expectedGeneration string) (serveWorkspace, agentRun, error) {
	workspace, err := m.server.workspace(workspaceID)
	if err != nil {
		return serveWorkspace{}, agentRun{}, &resourceAPIError{Code: "workspace_not_owned", Message: err.Error()}
	}
	run, err := m.currentResourceRun(workspace, resourceID)
	if err != nil {
		return serveWorkspace{}, agentRun{}, err
	}
	if expected := strings.TrimSpace(expectedGeneration); expected != "" && expected != run.GenerationID {
		return serveWorkspace{}, agentRun{}, &resourceAPIError{Code: "generation_changed", Message: "resource current generation changed; refresh resource status and history head"}
	}
	return workspace, run, nil
}

func (m *agentManager) handleResourceEvents(w http.ResponseWriter, r *http.Request, workspaceID, resourceID string) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	workspace, err := m.server.workspace(workspaceID)
	if err != nil {
		writeError(w, &resourceAPIError{Code: "workspace_not_owned", Message: err.Error()}, http.StatusNotFound)
		return
	}
	var run agentRun
	if generationID := strings.TrimSpace(r.URL.Query().Get("generationId")); generationID != "" {
		// Events are read-only: any generation recorded in the resource History
		// may be paged, so the History view can expand compact Turn ranges from
		// older generations too.
		run, err = resourceHistoryRunByGeneration(workspace, resourceID, generationID)
	} else {
		run, err = m.currentResourceRun(workspace, resourceID)
	}
	if err != nil {
		writeError(w, err, resourceErrorStatus(err))
		return
	}
	w.Header().Set("X-Forge-Generation-ID", run.GenerationID)
	m.proxyAgentHubEvents(w, r, workspaceID, run.ID)
}

func (m *agentManager) handleResourceStream(w http.ResponseWriter, r *http.Request, workspaceID, resourceID string) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	_, run, err := m.resolveResourceLiveTarget(workspaceID, resourceID, r.URL.Query().Get("generationId"))
	if err != nil {
		writeError(w, err, resourceErrorStatus(err))
		return
	}
	if !isResourceEventStreamable(run) {
		err := &resourceAPIError{Code: "generation_unavailable", Message: "resource current generation is not live"}
		writeError(w, err, http.StatusConflict)
		return
	}
	w.Header().Set("X-Forge-Generation-ID", run.GenerationID)
	m.proxyAgentHubStream(w, r, workspaceID, run.ID)
}

func isResourceEventStreamable(run agentRun) bool {
	if isLiveAgentStatus(run.Status) {
		return true
	}
	return (run.Status == "idle-suspended" || run.Status == "stopped") &&
		strings.TrimSpace(run.AgentHubSessionID) != "" &&
		!run.SessionResumeUnavailable && !run.ReplacementPending && !run.ArchivedTaskStopRequested
}

func (m *agentManager) handleResourceApproval(w http.ResponseWriter, r *http.Request, workspaceID, resourceID string) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	_, run, err := m.resolveResourceLiveTarget(workspaceID, resourceID, r.URL.Query().Get("generationId"))
	if err != nil {
		writeError(w, err, resourceErrorStatus(err))
		return
	}
	m.resolveApproval(w, r, workspaceID, run.ID)
}

func (m *agentManager) handleResourceEndTurn(w http.ResponseWriter, r *http.Request, workspaceID, resourceID string) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	_, run, err := m.resolveResourceLiveTarget(workspaceID, resourceID, r.URL.Query().Get("generationId"))
	if err != nil {
		writeError(w, err, resourceErrorStatus(err))
		return
	}
	response, interruptErr := m.interruptRunWithPostAction(r.Context(), workspaceID, run.ID, func(workspace serveWorkspace, targetResourceID string) (cancelledResourceMessages, error) {
		return cancelPendingSteerMessages(workspace.Path, targetResourceID)
	})
	if interruptErr != nil {
		writeInterruptRunError(w, interruptErr)
		return
	}
	writeJSON(w, response)
}

func (m *agentManager) handleResourceEndGeneration(w http.ResponseWriter, r *http.Request, workspaceID, resourceID string) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	workspace, err := m.server.workspace(workspaceID)
	if err != nil {
		writeError(w, &resourceAPIError{Code: "workspace_not_owned", Message: err.Error()}, http.StatusNotFound)
		return
	}
	resourceID = normalizedResourceID(resourceID)
	expectedGenerationID := strings.TrimSpace(r.URL.Query().Get("generationId"))
	var response resourceEndGenerationResponse
	var retire *agentRuntime
	err = m.withResourceController(r.Context(), workspace, resourceID, func() error {
		var requestErr error
		response, retire, requestErr = m.requestEndResourceGenerationLocked(r.Context(), workspace, resourceID, expectedGenerationID)
		return requestErr
	})
	if err != nil {
		writeError(w, err, resourceErrorStatus(err))
		return
	}
	if retire != nil {
		if err := m.enqueueResourceController(workspace, resourceID, func() error {
			m.retireResourceGenerationLocked(context.Background(), retire)
			return nil
		}); err != nil {
			writeError(w, err, http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusAccepted)
		_ = json.NewEncoder(w).Encode(response)
		return
	}
	writeJSON(w, response)
}

func (m *agentManager) requestEndResourceGenerationLocked(ctx context.Context, workspace serveWorkspace, resourceID, expectedGenerationID string) (resourceEndGenerationResponse, *agentRuntime, error) {
	exists, archived, _, err := resourceExistsAndArchived(workspace.Path, resourceID)
	if err != nil || !exists {
		if err == nil {
			err = fmt.Errorf("resource not found: %s", resourceID)
		}
		return resourceEndGenerationResponse{}, nil, &resourceAPIError{Code: "resource_not_found", Message: err.Error()}
	}
	if archived {
		return resourceEndGenerationResponse{}, nil, &resourceAPIError{Code: "resource_archived", Message: fmt.Sprintf("resource %s is archived", resourceID)}
	}
	run, found, err := currentResourceGeneration(workspace.Path, resourceID)
	if err != nil {
		return resourceEndGenerationResponse{}, nil, err
	}
	if !found {
		return resourceEndGenerationResponse{}, nil, &resourceAPIError{Code: "generation_unavailable", Message: "resource has no current generation to end"}
	}
	if expectedGenerationID == "" {
		return resourceEndGenerationResponse{}, nil, &resourceAPIError{Code: "generation_changed", Message: "current generation must be confirmed before ending it"}
	}
	if run.GenerationID != expectedGenerationID {
		return resourceEndGenerationResponse{}, nil, &resourceAPIError{Code: "generation_changed", Message: "resource current generation changed; refresh resource status"}
	}
	cfg, client, err := m.agentHubRuntimeConfig()
	if err != nil {
		return resourceEndGenerationResponse{}, nil, err
	}
	rt := m.runtimeByID(run.ID)
	if rt == nil {
		rt = newAgentHubRuntime(m, workspace, run, client)
		m.registerRuntime(rt)
	}
	if strings.TrimSpace(run.AgentHubSessionID) == "" {
		updated, persistErr := rt.mutateRun(func(current *agentRun) {
			current.Status = "stopped"
			current.AgentHubStoppedObserved = true
			current.ReplacementPending = false
			current.ManualStopRequested = true
			current.RetireReason = "manual_generation_stop"
		})
		if persistErr != nil {
			return resourceEndGenerationResponse{}, nil, persistErr
		}
		if err := retireStoredAgentRun(rt, updated, "manual_generation_stop"); err != nil {
			return resourceEndGenerationResponse{}, nil, err
		}
		return resourceEndGenerationResponse{Status: "ended", GenerationID: run.GenerationID}, nil, nil
	}
	session, err := client.GetSession(ctx, run.AgentHubSessionID)
	if err != nil {
		return resourceEndGenerationResponse{}, nil, err
	}
	if !agentHubSessionExactlyMatchesRun(cfg, run, session) {
		return resourceEndGenerationResponse{}, nil, &resourceAPIError{Code: "generation_changed", Message: "AgentHub Session no longer matches the current generation"}
	}
	if session.State == "running" || session.State == "waiting_approval" || len(session.PendingApprovalIDs) > 0 {
		return resourceEndGenerationResponse{}, nil, &resourceAPIError{Code: "active_turn", Message: "end the active turn before ending its generation"}
	}
	updated, err := rt.mutateRun(func(current *agentRun) {
		if current.GenerationID != run.GenerationID {
			return
		}
		current.ReplacementPending = true
		current.ManualStopRequested = true
		current.IdleSleepStopRequested = false
		current.ResumeFailureCount = 0
		current.ResumeRetryAt = ""
		current.ResumeLastError = ""
		current.UpdatedAt = m.resourceNow().Format(time.RFC3339Nano)
	})
	if err != nil {
		return resourceEndGenerationResponse{}, nil, err
	}
	return resourceEndGenerationResponse{Status: "ending", GenerationID: updated.GenerationID}, rt, nil
}

func resourceUploadCwd(workspace serveWorkspace, resourceID string) (string, error) {
	resourceID = normalizedResourceID(resourceID)
	exists, archived, _, err := resourceExistsAndArchived(workspace.Path, resourceID)
	if err != nil || !exists {
		if err == nil {
			err = fmt.Errorf("resource not found: %s", resourceID)
		}
		return "", &resourceAPIError{Code: "resource_not_found", Message: err.Error()}
	}
	if archived {
		return "", &resourceAPIError{Code: "resource_archived", Message: fmt.Sprintf("resource %s is archived", resourceID)}
	}
	if resourceID == "workspace" {
		return workspace.Path, nil
	}
	opened, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		return "", err
	}
	value, err := opened.ResourceValue(resourceID)
	if err != nil {
		return "", err
	}
	cwd := filepath.Join(workspace.Path, filepath.FromSlash(value.Path))
	if err := ensurePathInside(workspace.Path, cwd); err != nil {
		return "", errors.New("resource upload path escapes the Workspace")
	}
	return cwd, nil
}

func (m *agentManager) handleResourceUpload(w http.ResponseWriter, r *http.Request, workspaceID, resourceID string) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	workspace, err := m.server.workspace(workspaceID)
	if err != nil {
		writeError(w, &resourceAPIError{Code: "workspace_not_owned", Message: err.Error()}, http.StatusNotFound)
		return
	}
	cwd, err := resourceUploadCwd(workspace, resourceID)
	if err != nil {
		writeError(w, err, resourceErrorStatus(err))
		return
	}
	storeAgentUpload(w, r, workspace.Path, cwd)
}
