package serve

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/disksing/forge/internal/app"
)

type runnableTaskCandidate struct {
	ID                     string                      `json:"id"`
	Path                   string                      `json:"path"`
	Title                  string                      `json:"title"`
	Revision               int                         `json:"revision"`
	Condition              string                      `json:"condition"`
	AgentName              string                      `json:"agentName,omitempty"`
	Prompt                 string                      `json:"prompt"`
	PreferredAgentProfiles []string                    `json:"preferredAgentProfiles,omitempty"`
	CompletionCriteria     string                      `json:"completionCriteria,omitempty"`
	WakeContext            *app.SelfDrivingWakeContext `json:"wakeContext,omitempty"`
}

type selfDrivingAgentSelection struct {
	AgentName string
	Profile   string
	Reason    string
}

type runnableTaskDispatchResult string

const (
	runnableTaskStarted        runnableTaskDispatchResult = "started"
	runnableTaskSkippedActive  runnableTaskDispatchResult = "skipped_active"
	runnableTaskNotRunnable    runnableTaskDispatchResult = "not_runnable"
	runnableTaskDispatchFailed runnableTaskDispatchResult = "failed"
	selfDrivingSuspensionLimit                            = 30 * time.Minute
)

func (s *server) runTaskScheduler(ctx context.Context) {
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			if err := s.scheduleRunnableTasks(ctx); err != nil {
				log.Printf("schedule runnable tasks: %v", err)
			}
		}
	}
}

func selfDrivingWaitingDue(wake *app.SelfDrivingWakeContext) bool {
	if wake == nil || strings.TrimSpace(wake.WaitingAt) == "" {
		return true
	}
	t, err := time.Parse(time.RFC3339, strings.TrimSpace(wake.WaitingAt))
	return err != nil || time.Since(t) >= selfDrivingSuspensionLimit
}

func (s *server) scheduleRunnableTasks(ctx context.Context) error {
	cfg, err := s.loadConfig()
	if err != nil {
		return err
	}
	var failures []error
	for _, workspace := range cfg.Workspaces {
		if !s.ownsWorkspace(workspace.Path) {
			continue
		}
		forgeWorkspace, openErr := app.OpenWorkspace(workspace.Path)
		if openErr != nil {
			failures = append(failures, openErr)
			continue
		}
		tree, treeErr := forgeWorkspace.Tree()
		if treeErr != nil {
			failures = append(failures, treeErr)
			continue
		}
		started := false
		for _, project := range tree.Projects {
			ready, listErr := forgeWorkspace.Tasks(app.TaskListOptions{ProjectID: project.ID, Runnable: true})
			if listErr != nil {
				failures = append(failures, listErr)
				continue
			}
			for _, task := range runnableTaskCandidatesFromApp(ready.Runnable) {
				if task.Condition == "waiting" && task.WakeContext != nil {
					if !selfDrivingWaitingDue(task.WakeContext) {
						continue
					}
					woken, wakeErr := forgeWorkspace.WakeSelfDriving(task.ID, task.Revision)
					if wakeErr != nil {
						failures = append(failures, fmt.Errorf("wake runnable task %s: %w", task.ID, wakeErr))
						continue
					}
					task = runnableTaskCandidateFromTask(woken)
				}
				result, dispatchErr := s.startRunnableTask(ctx, workspace, task)
				if result == runnableTaskStarted {
					started = true
				}
				if result == runnableTaskDispatchFailed {
					failures = append(failures, fmt.Errorf("start runnable task %s: %w", task.ID, dispatchErr))
				}
				if started {
					break
				}
			}
			if started {
				break
			}
		}
	}
	return errors.Join(failures...)
}

func (s *server) startRunnableTask(ctx context.Context, workspace guiWorkspace, task runnableTaskCandidate) (runnableTaskDispatchResult, error) {
	dispatchKey := workspace.ID + "/" + task.ID
	s.selfDrivingDispatchMu.Lock()
	if s.selfDrivingDispatches == nil {
		s.selfDrivingDispatches = make(map[string]bool)
	}
	if s.selfDrivingDispatches[dispatchKey] {
		s.selfDrivingDispatchMu.Unlock()
		return runnableTaskSkippedActive, nil
	}
	forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		s.selfDrivingDispatchMu.Unlock()
		return runnableTaskDispatchFailed, err
	}
	resource, err := forgeWorkspace.ResourceValue(task.ID)
	if err != nil || resource.Task == nil || resource.Task.SelfDriving == nil {
		s.selfDrivingDispatchMu.Unlock()
		return runnableTaskNotRunnable, err
	}
	current := resource.Task.SelfDriving
	if !current.Enabled || current.Revision != task.Revision {
		s.selfDrivingDispatchMu.Unlock()
		return runnableTaskNotRunnable, nil
	}
	task = runnableTaskCandidateFromTask(*resource.Task)
	s.selfDrivingDispatches[dispatchKey] = true
	s.selfDrivingDispatchMu.Unlock()
	defer func() {
		s.selfDrivingDispatchMu.Lock()
		delete(s.selfDrivingDispatches, dispatchKey)
		s.selfDrivingDispatchMu.Unlock()
	}()

	cfg, err := s.loadConfig()
	if err != nil {
		return runnableTaskDispatchFailed, err
	}
	selection, err := resolveSelfDrivingAgent(cfg, task)
	if err != nil {
		_, _ = forgeWorkspace.SetSelfDrivingCondition(app.SelfDrivingConditionInput{
			TaskID: task.ID, ExpectedRevision: task.Revision, Condition: "needs_configuration", Reason: err.Error(),
		})
		return runnableTaskNotRunnable, nil
	}
	if err := s.recoverSelfDrivingSessions(ctx, workspace, task.ID); err != nil {
		return runnableTaskDispatchFailed, err
	}
	reusable, busy, err := s.findReusableSelfDrivingSession(ctx, workspace, task.ID, selection.AgentName)
	if err != nil {
		return runnableTaskDispatchFailed, err
	}
	if reusable != nil && busy {
		return runnableTaskSkippedActive, nil
	}
	prompt := buildSelfDrivingPrompt(workspace.Path, task)
	if reusable != nil {
		if err := s.startSelfDrivingInOpenSession(ctx, workspace, reusable.ID, task.Revision, prompt); err != nil {
			if errors.Is(err, errSelfDrivingSessionBusy) {
				return runnableTaskSkippedActive, nil
			}
			return runnableTaskDispatchFailed, err
		}
		return runnableTaskStarted, nil
	}

	req := startAgentRequest{
		AgentName: selection.AgentName, AgentProfile: selection.Profile, AgentSelectionReason: selection.Reason,
		ResourceID: task.ID, Title: task.Title, Prompt: prompt, SchedulerTurn: true, SelfDrivingRevision: task.Revision,
	}
	body, err := json.Marshal(req)
	if err != nil {
		return runnableTaskDispatchFailed, err
	}
	endpoint := strings.TrimRight(s.internalEndpoint(), "/") + "/api/workspaces/" + workspace.ID + "/agent/runs"
	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, bytes.NewReader(body))
	if err != nil {
		return runnableTaskDispatchFailed, err
	}
	httpReq.Header.Set("Content-Type", "application/json")
	response, err := (&http.Client{Timeout: 30 * time.Second}).Do(httpReq)
	if err != nil {
		return runnableTaskDispatchFailed, err
	}
	defer response.Body.Close()
	responseBody, _ := io.ReadAll(response.Body)
	if response.StatusCode == http.StatusConflict {
		return runnableTaskSkippedActive, nil
	}
	if response.StatusCode < 200 || response.StatusCode >= 300 {
		_, _ = forgeWorkspace.SetSelfDrivingCondition(app.SelfDrivingConditionInput{TaskID: task.ID, ExpectedRevision: task.Revision, Condition: "error", Reason: strings.TrimSpace(string(responseBody))})
		return runnableTaskDispatchFailed, fmt.Errorf("agent run start returned %d: %s", response.StatusCode, strings.TrimSpace(string(responseBody)))
	}
	return runnableTaskStarted, nil
}

func runnableTaskCandidateFromTask(task app.Task) runnableTaskCandidate {
	current := task.SelfDriving
	return runnableTaskCandidate{
		ID: task.ID, Title: task.Title, Revision: current.Revision, Condition: current.Condition,
		AgentName: current.AgentName, Prompt: current.Prompt,
		PreferredAgentProfiles: append([]string(nil), current.PreferredAgentProfiles...),
		CompletionCriteria:     current.CompletionCriteria, WakeContext: current.WakeContext,
	}
}

func (s *server) recoverSelfDrivingSessions(ctx context.Context, workspace guiWorkspace, taskID string) error {
	runs, err := loadAgentRuns(workspace.Path)
	if err != nil {
		return err
	}
	for _, run := range runs {
		if run.ResourceID != taskID || s.agentRunActive(run.ID) || !isLiveAgentStatus(run.Status) || (run.AgentHubSessionID == "" && run.SourceExternalID == "") {
			continue
		}
		cfg, client, configErr := s.agents.agentHubRuntimeConfig()
		if configErr != nil {
			return configErr
		}
		if err := s.agents.recoverAgentHubRun(ctx, cfg, client, workspace, run, nil); err != nil {
			return err
		}
	}
	return nil
}

func resolveSelfDrivingAgent(cfg config, task runnableTaskCandidate) (selfDrivingAgentSelection, error) {
	if cfg.Version < agentHubConfigVersion {
		return selfDrivingAgentSelection{}, errors.New("Self-Driving requires current AgentHub settings")
	}
	if agentName := strings.TrimSpace(task.AgentName); agentName != "" {
		return selfDrivingAgentSelection{AgentName: agentName, Reason: "using the task's configured AgentHub agent"}, nil
	}
	seen := map[string]bool{}
	for _, raw := range task.PreferredAgentProfiles {
		profile := strings.ToLower(strings.TrimSpace(raw))
		if profile == "" || seen[profile] {
			continue
		}
		seen[profile] = true
		if route, ok := findAgentProfileRoute(cfg.AgentProfiles, profile); ok && strings.TrimSpace(route.AgentName) != "" {
			return selfDrivingAgentSelection{AgentName: route.AgentName, Profile: profile, Reason: "matched preferred Agent Profile " + profile}, nil
		}
	}
	fallback := configuredAgentProfileName(cfg.AgentProfiles, "default")
	if fallback == "" {
		return selfDrivingAgentSelection{}, errors.New("no Agent or matching Agent Profile is configured for Self-Driving")
	}
	return selfDrivingAgentSelection{AgentName: fallback, Reason: "using default AgentHub agent"}, nil
}

func (s *server) agentRunActive(runID string) bool {
	if s.agents == nil {
		return false
	}
	s.agents.mu.Lock()
	rt := s.agents.runtimes[runID]
	s.agents.mu.Unlock()
	if rt == nil {
		return false
	}
	return isLiveAgentStatus(rt.snapshotRun().Status)
}

var errSelfDrivingSessionBusy = errors.New("session became busy")

func (s *server) startSelfDrivingInOpenSession(ctx context.Context, workspace guiWorkspace, runID string, revision int, prompt string) error {
	body, err := json.Marshal(agentInputRequest{Text: prompt, SchedulerTurn: true, SelfDrivingRevision: revision})
	if err != nil {
		return err
	}
	endpoint := strings.TrimRight(s.internalEndpoint(), "/") + "/api/workspaces/" + workspace.ID + "/agent/runs/" + runID + "/input"
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, bytes.NewReader(body))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	response, err := (&http.Client{Timeout: 30 * time.Second}).Do(req)
	if err != nil {
		return err
	}
	defer response.Body.Close()
	responseBody, _ := io.ReadAll(response.Body)
	if response.StatusCode == http.StatusConflict {
		return errSelfDrivingSessionBusy
	}
	if response.StatusCode < 200 || response.StatusCode >= 300 {
		return fmt.Errorf("agent input returned %d: %s", response.StatusCode, strings.TrimSpace(string(responseBody)))
	}
	return nil
}
