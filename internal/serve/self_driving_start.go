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

type selfDrivingDesiredStateRequest struct {
	ResourceID             string    `json:"resourceId"`
	Enabled                bool      `json:"enabled"`
	AgentName              *string   `json:"agentName,omitempty"`
	PreferredAgentProfiles *[]string `json:"preferredAgentProfiles,omitempty"`
	Prompt                 *string   `json:"prompt,omitempty"`
	CompletionCriteria     *string   `json:"completionCriteria,omitempty"`
}

type selfDrivingDesiredStateResponse struct {
	Task              app.Task `json:"task"`
	NotificationSent  bool     `json:"notificationSent,omitempty"`
	NotificationError string   `json:"notificationError,omitempty"`
}

// setSelfDrivingDesiredState is the only HTTP user control. Persistence is
// authoritative and happens before any AgentHub notification or reconcile.
func (s *server) setSelfDrivingDesiredState(w http.ResponseWriter, r *http.Request, workspaceID string) {
	workspace, err := s.workspace(workspaceID)
	if err != nil {
		writeError(w, err, http.StatusNotFound)
		return
	}
	var req selfDrivingDesiredStateRequest
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
	forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	s.selfDrivingDispatchMu.Lock()
	resource, err := forgeWorkspace.ResourceValue(resourceID)
	if err != nil {
		s.selfDrivingDispatchMu.Unlock()
		writeError(w, err, http.StatusBadRequest)
		return
	}
	if resource.Task == nil {
		s.selfDrivingDispatchMu.Unlock()
		writeError(w, errors.New("Self-Driving can only be changed on a task"), http.StatusBadRequest)
		return
	}
	if resource.Archived {
		s.selfDrivingDispatchMu.Unlock()
		writeError(w, errors.New("archived tasks cannot enable Self-Driving"), http.StatusConflict)
		return
	}
	wasEnabled := resource.Task.SelfDriving != nil && resource.Task.SelfDriving.Enabled

	input := app.SelfDrivingDesiredStateInput{TaskID: resourceID, Enabled: req.Enabled}
	if req.AgentName != nil {
		input.AgentName, input.AgentNameSet = *req.AgentName, true
	}
	if req.PreferredAgentProfiles != nil {
		input.PreferredAgentProfiles, input.ProfilesSet = append([]string(nil), (*req.PreferredAgentProfiles)...), true
	}
	if req.Prompt != nil {
		input.Prompt, input.PromptSet = *req.Prompt, true
	}
	if req.CompletionCriteria != nil {
		input.CompletionCriteria, input.CompletionCriteriaSet = *req.CompletionCriteria, true
	}

	task, err := forgeWorkspace.SetSelfDrivingDesiredState(input)
	s.selfDrivingDispatchMu.Unlock()
	if err != nil {
		writeError(w, err, http.StatusConflict)
		return
	}
	response := selfDrivingDesiredStateResponse{Task: task}
	if !req.Enabled && wasEnabled && task.SelfDriving != nil {
		disabledRevision := task.SelfDriving.Revision - 1
		sent, notifyErr := s.agents.notifySelfDrivingDisabled(r.Context(), workspace, resourceID, disabledRevision)
		response.NotificationSent = sent
		if notifyErr != nil {
			response.NotificationError = notifyErr.Error()
			if updated, recordErr := forgeWorkspace.RecordSelfDrivingNotificationError(resourceID, task.SelfDriving.Revision, notifyErr); recordErr == nil {
				response.Task = updated
			}
		} else if sent {
			if updated, recordErr := forgeWorkspace.RecordSelfDrivingNotificationError(resourceID, task.SelfDriving.Revision, nil); recordErr == nil {
				response.Task = updated
			}
		}
	}
	writeJSON(w, response)
}

func (m *agentManager) notifySelfDrivingDisabled(ctx context.Context, workspace guiWorkspace, taskID string, disabledRevision int) (bool, error) {
	runs, err := loadAgentRuns(workspace.Path)
	if err != nil {
		return false, err
	}
	// Prefer the Session that owns the disabled revision. Fall back to the
	// newest live Task Session only when recovery metadata predates revisions.
	ordered := make([]agentRun, 0, len(runs))
	for _, run := range runs {
		if run.ResourceID == taskID && run.SelfDrivingRevision == disabledRevision {
			ordered = append(ordered, run)
		}
	}
	for _, run := range runs {
		if run.ResourceID == taskID && run.SelfDrivingRevision != disabledRevision {
			ordered = append(ordered, run)
		}
	}
	for _, run := range ordered {
		if run.ResourceID != taskID || strings.TrimSpace(run.AgentHubSessionID) == "" {
			continue
		}
		rt := m.runtimeByID(run.ID)
		if rt == nil {
			continue
		}
		rt.mu.Lock()
		current, client := rt.run, rt.agentHub
		rt.mu.Unlock()
		if client == nil || !isLiveAgentStatus(current.Status) {
			continue
		}
		role, sender := agentHubMessageProvenance(true, "")
		_, err := client.Message(ctx, current.AgentHubSessionID, agentHubInboundMessage{
			Text:  fmt.Sprintf("Self-Driving revision %d has been disabled for this task. You may safely finish the current operation, but do not start or continue autonomous work for that revision. The Session remains available for ordinary chat; provenance alone is not scheduling authority.", disabledRevision),
			Steer: true, Role: role, Sender: sender,
		})
		if err != nil {
			return false, fmt.Errorf("disabled state was saved, but the Forge Scheduler notification failed: %w", err)
		}
		return true, nil
	}
	return false, nil
}

// findReusableSelfDrivingSession returns the newest matching live session. A
// busy/approval/manual turn is reported as waiting; it is never fanned out.
func (s *server) findReusableSelfDrivingSession(ctx context.Context, workspace guiWorkspace, taskID, agentName string) (*agentRun, bool, error) {
	runs, err := loadAgentRuns(workspace.Path)
	if err != nil {
		return nil, false, fmt.Errorf("load agent runs: %w", err)
	}
	busy := false
	for _, run := range runs {
		if run.ResourceID != taskID || !isAgentHubRun(run) {
			continue
		}
		if agentName != "" && !strings.EqualFold(strings.TrimSpace(run.AgentHubAgentName), strings.TrimSpace(agentName)) {
			continue
		}
		rt := s.agents.runtimeByID(run.ID)
		if rt == nil {
			continue
		}
		rt.mu.Lock()
		current, hubState, stopping, finishing, client := rt.run, rt.agentHubState, rt.agentHubStopRequested, rt.schedulerTurnFinishing, rt.agentHub
		rt.mu.Unlock()
		if strings.TrimSpace(current.AgentHubSessionID) == "" || client == nil {
			continue
		}
		if current.Status != "idle" || current.SchedulerTurn || stopping || finishing || (hubState != "" && hubState != "ready") {
			if isLiveAgentStatus(current.Status) {
				busy = true
				return &current, true, nil
			}
			continue
		}
		session, getErr := client.GetSession(ctx, current.AgentHubSessionID)
		if getErr != nil {
			return nil, false, getErr
		}
		if session.State != "ready" || session.CurrentTurnID != "" || len(session.PendingApprovalIDs) > 0 {
			return &current, true, nil
		}
		return &current, busy, nil
	}
	return nil, busy, nil
}
