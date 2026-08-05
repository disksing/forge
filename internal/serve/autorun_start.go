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
// selected in the composer. The pointer fields preserve the difference
// between an omitted value (inherit the previous generation) and an explicit
// empty value (clear it for a new generation).
type chatAutoRunStartRequest struct {
	ResourceID         string  `json:"resourceId"`
	AgentName          string  `json:"agentName,omitempty"`
	RunInstructions    *string `json:"runInstructions,omitempty"`
	Prompt             *string `json:"prompt,omitempty"` // legacy alias
	CompletionCriteria *string `json:"completionCriteria,omitempty"`
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

func chatAutoRunTextOption(primary, legacy *string, primaryName, legacyName string) (string, bool, error) {
	if primary != nil && legacy != nil {
		return "", false, fmt.Errorf("%s and %s cannot both be provided", primaryName, legacyName)
	}
	if primary != nil {
		return strings.TrimSpace(*primary), true, nil
	}
	if legacy != nil {
		return strings.TrimSpace(*legacy), true, nil
	}
	return "", false, nil
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
	runInstructions, runInstructionsSet, err := chatAutoRunTextOption(req.RunInstructions, req.Prompt, "runInstructions", "prompt")
	if err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	completionCriteria := ""
	completionCriteriaSet := req.CompletionCriteria != nil
	if completionCriteriaSet {
		completionCriteria = strings.TrimSpace(*req.CompletionCriteria)
	}
	queueInput := app.AutoRunQueueInput{
		TaskID: resourceID, AgentName: agentName, AgentNameSet: agentName != "",
		Prompt: runInstructions, PromptSet: runInstructionsSet,
		CompletionCriteria: completionCriteria, CompletionCriteriaSet: completionCriteriaSet,
	}

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
	if err := s.requireResourceNotExternallyLocked(workspace, resourceID); err != nil {
		writeResourceOperationError(w, err, http.StatusBadRequest)
		return
	}
	autoRunState := ""
	if resource.Task.AutoRun != nil {
		autoRunState = resource.Task.AutoRun.State
	}

	// Re-validate everything at execution time; the button state the frontend
	// rendered may be stale by the time the click arrives.
	reusable, busyLive, reusableErr := s.findReusableAutoRunSession(workspace, resourceID)
	if reusableErr != nil {
		writeError(w, reusableErr, http.StatusInternalServerError)
		return
	}
	if busyLive {
		writeError(w, errors.New("the task's session is busy; wait until it is idle to start AutoRun"), http.StatusConflict)
		return
	}
	if reusable == nil && agentName == "" && (autoRunState == "suspended" || autoRunState == "paused") {
		// Resume does not open the configuration dialog. If the original
		// AgentHub session is gone, recover the generation's persisted agent or
		// profile selection instead of requiring the current composer choice.
		candidate, _, candidateErr := chatAutoRunCandidate(resourceID, *resource.Task, queueInput)
		if candidateErr != nil {
			writeError(w, candidateErr, http.StatusConflict)
			return
		}
		cfg, configErr := s.loadConfig()
		if configErr != nil {
			writeError(w, configErr, http.StatusServiceUnavailable)
			return
		}
		selection, selectionErr := resolveAutoRunAgent(cfg, candidate)
		if selectionErr != nil {
			writeError(w, selectionErr, http.StatusBadRequest)
			return
		}
		agentName = selection.AgentName
	}
	if reusable == nil && agentName == "" {
		writeError(w, errors.New("no active session can be reused; select an agent to start AutoRun"), http.StatusBadRequest)
		return
	}
	if reusable != nil && agentName != "" && !strings.EqualFold(agentName, strings.TrimSpace(reusable.AgentHubAgentName)) {
		writeError(w, errors.New("the selected agent does not match the idle session; close the session or select its agent"), http.StatusConflict)
		return
	}

	// A new Chat AutoRun session must acquire the task lock before it changes
	// the AutoRun generation. This closes the race between the optimistic lock
	// check above and an external session acquiring the task control.
	if reusable == nil {
		candidate, expectedState, candidateErr := chatAutoRunCandidate(resourceID, *resource.Task, queueInput)
		if candidateErr != nil {
			writeError(w, candidateErr, http.StatusConflict)
			return
		}
		prompt := buildAutoRunPrompt(workspace.Path, candidate)
		run, startErr := s.createChatAutoRunSession(r.Context(), workspace, candidate, agentName, prompt, queueInput, true, expectedState)
		if startErr != nil {
			if isExternalResourceLockError(startErr) {
				writeResourceOperationError(w, startErr, http.StatusConflict)
				return
			}
			writeError(w, fmt.Errorf("AutoRun generation %d could not be started: %w", candidate.Generation, startErr), http.StatusBadGateway)
			return
		}
		task := reloadAutoRunTask(forgeWorkspace, resourceID, *resource.Task)
		writeJSON(w, chatAutoRunStartResponse{
			Action: "started", Reused: false, Task: task, Run: run, AgentName: run.AgentHubAgentName,
		})
		return
	}

	state := ""
	if resource.Task.AutoRun != nil {
		state = resource.Task.AutoRun.State
	}
	var task app.Task
	switch state {
	case "":
		queueInput.AgentName = strings.TrimSpace(reusable.AgentHubAgentName)
		queueInput.AgentNameSet = queueInput.AgentName != ""
		task, err = forgeWorkspace.QueueAutoRun(queueInput)
	case "completed", "failed", "cancelled":
		queueInput.AgentName = strings.TrimSpace(reusable.AgentHubAgentName)
		queueInput.AgentNameSet = queueInput.AgentName != ""
		task, err = forgeWorkspace.QueueAutoRun(queueInput)
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
		AgentName:              task.AutoRun.AgentName,
		Prompt:                 task.AutoRun.Prompt,
		PreferredAgentProfiles: task.AutoRun.PreferredAgentProfiles,
		CompletionCriteria:     task.AutoRun.CompletionCriteria,
		WakeCondition:          task.AutoRun.WakeCondition,
		SuspensionSummary:      task.AutoRun.SuspensionSummary,
	}
	prompt := buildAutoRunPrompt(workspace.Path, candidate)

	if reusable != nil {
		// The state and log are durably updated before the standard scheduler
		// turn message is sent, so a lost message never loses the transition.
		if err := s.startAutoRunInOpenSession(r.Context(), workspace, reusable.ID, candidate.Generation, prompt); err != nil {
			if isExternalResourceLockError(err) {
				writeResourceOperationError(w, err, http.StatusConflict)
				return
			}
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

	writeError(w, errors.New("AutoRun session selection changed while starting"), http.StatusConflict)
}

func chatAutoRunCandidate(resourceID string, task app.Task, inputs ...app.AutoRunQueueInput) (runnableTaskCandidate, string, error) {
	var input app.AutoRunQueueInput
	if len(inputs) > 0 {
		input = inputs[0]
	}
	candidate := runnableTaskCandidate{
		ID: resourceID, Title: task.Title, Generation: 1, State: "queued",
		AgentName: strings.TrimSpace(input.AgentName), Prompt: strings.TrimSpace(input.Prompt),
		CompletionCriteria: strings.TrimSpace(input.CompletionCriteria),
	}
	if task.AutoRun == nil {
		return candidate, "", nil
	}
	candidate.Generation = task.AutoRun.Generation
	candidate.State = task.AutoRun.State
	candidate.AgentName = task.AutoRun.AgentName
	candidate.Prompt = task.AutoRun.Prompt
	candidate.PreferredAgentProfiles = append([]string(nil), task.AutoRun.PreferredAgentProfiles...)
	candidate.CompletionCriteria = task.AutoRun.CompletionCriteria
	candidate.WakeCondition = task.AutoRun.WakeCondition
	candidate.SuspensionSummary = task.AutoRun.SuspensionSummary
	switch task.AutoRun.State {
	case "completed", "failed", "cancelled":
		candidate.Generation++
		// A terminal generation starts with a fresh status history. The
		// previous suspension summary may remain persisted on the old task
		// projection, but it must not be injected into the next generation's
		// prompt.
		candidate.SuspensionSummary = ""
		if input.AgentNameSet {
			candidate.AgentName = strings.TrimSpace(input.AgentName)
		}
		if input.PromptSet {
			candidate.Prompt = strings.TrimSpace(input.Prompt)
		}
		if input.CompletionCriteriaSet {
			candidate.CompletionCriteria = strings.TrimSpace(input.CompletionCriteria)
		}
	case "suspended", "paused":
		// Resume the current generation after the new Forge session owns the
		// task lock.
	case "", "queued", "running":
		if task.AutoRun.State == "" {
			return candidate, "", nil
		}
		return runnableTaskCandidate{}, "", fmt.Errorf("AutoRun is already %s", task.AutoRun.State)
	default:
		return runnableTaskCandidate{}, "", fmt.Errorf("AutoRun cannot be started from %s state", task.AutoRun.State)
	}
	return candidate, task.AutoRun.State, nil
}

// queueChatAutoRunForSession performs the state transition only after the
// newly created Forge session has successfully locked the task. The expected
// state check prevents a stale internal dispatch request from changing a
// generation another actor already advanced.
func (s *server) queueChatAutoRunForSession(workspace guiWorkspace, resourceID, expectedState string, inputs ...app.AutoRunQueueInput) (app.Task, error) {
	forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		return app.Task{}, err
	}
	resource, err := forgeWorkspace.ResourceValue(resourceID)
	if err != nil {
		return app.Task{}, err
	}
	if resource.Task == nil {
		return app.Task{}, errors.New("AutoRun can only be started on a task")
	}
	state := ""
	if resource.Task.AutoRun != nil {
		state = resource.Task.AutoRun.State
	}
	if state != expectedState {
		return app.Task{}, fmt.Errorf("AutoRun state changed from %q to %q before the session was locked", expectedState, state)
	}
	switch state {
	case "", "completed", "failed", "cancelled":
		input := app.AutoRunQueueInput{TaskID: resourceID}
		if len(inputs) > 0 {
			input = inputs[0]
			input.TaskID = resourceID
		}
		return forgeWorkspace.QueueAutoRun(input)
	case "suspended", "paused":
		return forgeWorkspace.ResumeAutoRun(resourceID)
	default:
		return app.Task{}, fmt.Errorf("AutoRun cannot be started from %s state", state)
	}
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
func (s *server) createChatAutoRunSession(ctx context.Context, workspace guiWorkspace, task runnableTaskCandidate, agentName, prompt string, queueInput app.AutoRunQueueInput, queueAutoRun bool, expectedState string) (*agentRun, error) {
	req := startAgentRequest{
		AgentName:                    agentName,
		AgentSelectionReason:         "selected in chat for manual AutoRun start",
		ResourceID:                   task.ID,
		Title:                        task.Title,
		Prompt:                       prompt,
		SchedulerTurn:                true,
		AutoRunGeneration:            task.Generation,
		QueueAutoRun:                 queueAutoRun,
		ExpectedAutoRunState:         expectedState,
		AutoRunAgentName:             queueInput.AgentName,
		AutoRunAgentNameSet:          queueInput.AgentNameSet,
		AutoRunPrompt:                queueInput.Prompt,
		AutoRunPromptSet:             queueInput.PromptSet,
		AutoRunCompletionCriteria:    queueInput.CompletionCriteria,
		AutoRunCompletionCriteriaSet: queueInput.CompletionCriteriaSet,
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
		if response.StatusCode == http.StatusConflict && strings.Contains(string(responseBody), externalResourceLockMessage) {
			return nil, &externalResourceLockError{ResourceID: task.ID}
		}
		return nil, fmt.Errorf("agent run start returned %d: %s", response.StatusCode, strings.TrimSpace(string(responseBody)))
	}
	var detail agentRunDetail
	if err := json.Unmarshal(responseBody, &detail); err != nil {
		return nil, fmt.Errorf("decode agent run start response: %w", err)
	}
	return &detail.Run, nil
}
