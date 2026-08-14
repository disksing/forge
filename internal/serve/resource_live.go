package serve

import (
	"errors"
	"fmt"
	"net/http"
	"path/filepath"
	"strings"

	"github.com/disksing/forge/internal/app"
)

func (m *agentManager) currentResourceRun(workspace guiWorkspace, resourceID string) (agentRun, error) {
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

func (m *agentManager) resolveResourceLiveTarget(workspaceID, resourceID, expectedGeneration string) (guiWorkspace, agentRun, error) {
	workspace, err := m.server.workspace(workspaceID)
	if err != nil {
		return guiWorkspace{}, agentRun{}, &resourceAPIError{Code: "workspace_not_owned", Message: err.Error()}
	}
	run, err := m.currentResourceRun(workspace, resourceID)
	if err != nil {
		return guiWorkspace{}, agentRun{}, err
	}
	if expected := strings.TrimSpace(expectedGeneration); expected != "" && expected != run.GenerationID {
		return guiWorkspace{}, agentRun{}, &resourceAPIError{Code: "generation_changed", Message: "resource current generation changed; refresh resource status and history head"}
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
	if !isLiveAgentStatus(run.Status) {
		err := &resourceAPIError{Code: "generation_unavailable", Message: "resource current generation is not live"}
		writeError(w, err, http.StatusConflict)
		return
	}
	w.Header().Set("X-Forge-Generation-ID", run.GenerationID)
	m.proxyAgentHubStream(w, r, workspaceID, run.ID)
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
	m.interruptRun(w, r, workspaceID, run.ID)
}

func resourceUploadCwd(workspace guiWorkspace, resourceID string) (string, error) {
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
