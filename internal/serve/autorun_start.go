package serve

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/disksing/forge/internal/app"
)

// chatAutoRunStartRequest is the single Chat entry point for manually starting
// or resuming AutoRun on a task. AgentName is required when no reusable
// session exists: a new session always runs the agent the user explicitly
// selected in the composer.
type chatAutoRunStartRequest struct {
	ResourceID string `json:"resourceId"`
	AgentName  string `json:"agentName,omitempty"`
}

// chatAutoRunStartResponse reports what the unified start operation did.
// Action is "started" when the scheduler turn message was dispatched, or
// "queued" when the generation was queued/resumed but the session turned busy
// before the message could be sent (the background driver delivers it later).
type chatAutoRunStartResponse struct {
	Action    string    `json:"action"`
	Reused    bool      `json:"reused"`
	Task      app.Task  `json:"task"`
	Run       *agentRun `json:"run,omitempty"`
	AgentName string    `json:"agentName,omitempty"`
	Reason    string    `json:"reason,omitempty"`
}

// startChatAutoRun coordinates the whole manual AutoRun start in one server
// operation so the frontend never stitches "update AutoRun" and "send message"
// together. The dispatch mutex is shared with the background driver, so a
// manual start, a timed wake-up, and a scheduler scan can never start the same
// generation twice or send duplicate AgentHub messages.
func (s *server) startChatAutoRun(w http.ResponseWriter, r *http.Request, workspaceID string) {
	workspace, err := s.workspace(workspaceID)
	if err != nil {
		writeError(w, err, http.StatusNotFound)
		return
	}
	var req chatAutoRunStartRequest
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
	agentName := strings.TrimSpace(req.AgentName)

	s.autoRunDispatchMu.Lock()
	defer s.autoRunDispatchMu.Unlock()

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
		writeError(w, errors.New("AutoRun can only be started on a task"), http.StatusBadRequest)
		return
	}

	// Re-validate everything at execution time; the button state the frontend
	// rendered may be stale by the time the click arrives.
	reusable, busyLive, reusableErr := s.findReusableAutoRunSession(workspace, resourceID)
	if reusableErr != nil {
		writeError(w, reusableErr, http.StatusInternalServerError)
		return
	}
	if reusable == nil && agentName == "" {
		if busyLive {
			writeError(w, errors.New("the task's session is busy; wait until it is idle to start AutoRun"), http.StatusConflict)
			return
		}
		writeError(w, errors.New("no active session can be reused; select an agent to start AutoRun"), http.StatusBadRequest)
		return
	}

	state := ""
	if resource.Task.AutoRun != nil {
		state = resource.Task.AutoRun.State
	}
	var task app.Task
	switch state {
	case "":
		task, err = forgeWorkspace.QueueAutoRun(app.AutoRunQueueInput{TaskID: resourceID})
	case "completed", "failed":
		task, err = forgeWorkspace.QueueAutoRun(app.AutoRunQueueInput{TaskID: resourceID})
	case "suspended", "paused":
		task, err = forgeWorkspace.ResumeAutoRun(resourceID)
	case "queued":
		err = errors.New("AutoRun is already queued")
	case "running":
		err = errors.New("AutoRun is already running")
	default:
		err = fmt.Errorf("AutoRun cannot be started from %s state", state)
	}
	if err != nil {
		writeError(w, err, http.StatusConflict)
		return
	}
	if task.AutoRun == nil {
		writeError(w, errors.New("AutoRun state update did not produce a generation"), http.StatusInternalServerError)
		return
	}

	candidate := runnableTaskCandidate{
		ID:                     resourceID,
		Title:                  task.Title,
		Generation:             task.AutoRun.Generation,
		State:                  "queued",
		Prompt:                 task.AutoRun.Prompt,
		PreferredAgentProfiles: task.AutoRun.PreferredAgentProfiles,
		SuspensionSummary:      task.AutoRun.SuspensionSummary,
	}
	prompt := buildAutoRunPrompt(workspace.Path, candidate)

	if reusable != nil {
		// The state and log are durably updated before the standard scheduler
		// turn message is sent, so a lost message never loses the transition.
		if err := s.startAutoRunInOpenSession(r.Context(), workspace, reusable.ID, candidate.Generation, prompt); err != nil {
			if errors.Is(err, errAutoRunSessionBusy) {
				writeJSON(w, chatAutoRunStartResponse{
					Action: "queued", Reused: true, Task: task,
					Run:       reusable,
					AgentName: reusable.AgentHubAgentName,
					Reason:    "the session became busy; AutoRun is queued and starts when the session is idle",
				})
				return
			}
			writeError(w, fmt.Errorf("AutoRun generation %d was updated but the start message failed: %w", candidate.Generation, err), http.StatusBadGateway)
			return
		}
		if refreshed, refreshErr := loadAgentRun(workspace.Path, reusable.ID); refreshErr == nil {
			reusable = &refreshed
		}
		task = reloadAutoRunTask(forgeWorkspace, resourceID, task)
		writeJSON(w, chatAutoRunStartResponse{
			Action: "started", Reused: true, Task: task, Run: reusable, AgentName: reusable.AgentHubAgentName,
		})
		return
	}

	run, err := s.createChatAutoRunSession(r.Context(), workspace, candidate, agentName, prompt)
	if err != nil {
		writeError(w, fmt.Errorf("AutoRun generation %d was queued but the session could not be started: %w", candidate.Generation, err), http.StatusBadGateway)
		return
	}
	task = reloadAutoRunTask(forgeWorkspace, resourceID, task)
	writeJSON(w, chatAutoRunStartResponse{
		Action: "started", Reused: false, Task: task, Run: run, AgentName: run.AgentHubAgentName,
	})
}

// reloadAutoRunTask reports the post-dispatch AutoRun state (typically
// queued→running) instead of the pre-dispatch snapshot.
func reloadAutoRunTask(forgeWorkspace *app.Workspace, resourceID string, fallback app.Task) app.Task {
	resource, err := forgeWorkspace.ResourceValue(resourceID)
	if err != nil || resource.Task == nil {
		return fallback
	}
	return *resource.Task
}

// findReusableAutoRunSession returns the newest live AgentHub-attached session
// of the task whose status is strictly idle. A pending approval, an active
// normal or AutoRun turn, or an unfinished scheduler turn all make the session
// non-reusable; the second return value reports such a busy live session so
// the caller can reject with a clear reason. The result is re-checked by the
// input endpoint at send time.
func (s *server) findReusableAutoRunSession(workspace guiWorkspace, taskID string) (*agentRun, bool, error) {
	runs, err := loadAgentRuns(workspace.Path)
	if err != nil {
		return nil, false, fmt.Errorf("load agent runs: %w", err)
	}
	busyLive := false
	for _, run := range runs {
		if run.ResourceID != taskID || !isAgentHubRun(run) {
			continue
		}
		rt := s.agents.runtimeByID(run.ID)
		if rt == nil {
			continue
		}
		rt.mu.Lock()
		run = rt.run
		rt.mu.Unlock()
		if strings.TrimSpace(run.AgentHubSessionID) == "" {
			continue
		}
		if run.Status != "idle" || run.SchedulerTurn {
			if isLiveAgentStatus(run.Status) {
				busyLive = true
			}
			continue
		}
		return &run, busyLive, nil
	}
	return nil, busyLive, nil
}

// createChatAutoRunSession starts a new agent run for the generation with the
// agent the user explicitly selected, through the same internal endpoint the
// background driver uses.
func (s *server) createChatAutoRunSession(ctx context.Context, workspace guiWorkspace, task runnableTaskCandidate, agentName, prompt string) (*agentRun, error) {
	req := startAgentRequest{
		AgentName:            agentName,
		AgentSelectionReason: "selected in chat for manual AutoRun start",
		ResourceID:           task.ID,
		Title:                task.Title,
		Prompt:               prompt,
		SchedulerTurn:        true,
		AutoRunGeneration:    task.Generation,
	}
	body, err := json.Marshal(req)
	if err != nil {
		return nil, err
	}
	endpoint := strings.TrimRight(s.internalEndpoint(), "/") + "/api/workspaces/" + workspace.ID + "/agent/runs"
	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	httpReq.Header.Set("Content-Type", "application/json")
	response, err := (&http.Client{Timeout: 60 * time.Second}).Do(httpReq)
	if err != nil {
		return nil, err
	}
	defer response.Body.Close()
	responseBody, _ := io.ReadAll(response.Body)
	if response.StatusCode < 200 || response.StatusCode >= 300 {
		return nil, fmt.Errorf("agent run start returned %d: %s", response.StatusCode, strings.TrimSpace(string(responseBody)))
	}
	var detail agentRunDetail
	if err := json.Unmarshal(responseBody, &detail); err != nil {
		return nil, fmt.Errorf("decode agent run start response: %w", err)
	}
	return &detail.Run, nil
}
