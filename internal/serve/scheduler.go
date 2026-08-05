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

type runnableTaskResponse struct {
	Tasks []runnableTaskCandidate `json:"tasks"`
}

type runnableTaskCandidate struct {
	ID                     string   `json:"id"`
	Path                   string   `json:"path"`
	Title                  string   `json:"title"`
	Generation             int      `json:"generation"`
	State                  string   `json:"state"`
	Prompt                 string   `json:"prompt"`
	PreferredAgentProfiles []string `json:"preferredAgentProfiles,omitempty"`
	SuspendedAt            string   `json:"suspendedAt,omitempty"`
	SuspensionSummary      string   `json:"suspensionSummary,omitempty"`
}

type autoRunAgentSelection struct {
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
)

// autoRunSuspensionLimit is the fixed wake-up threshold for suspended AutoRun
// generations. Every new suspend resets the timer.
const autoRunSuspensionLimit = 30 * time.Minute

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

// autoRunSuspendedDue reports whether a suspended generation has waited past
// the fixed suspension limit. An unparsable timestamp is treated as due so a
// suspended task can never stall forever after a schema or clock problem; the
// agent may suspend again to reset the timer.
func autoRunSuspendedDue(suspendedAt string) bool {
	if strings.TrimSpace(suspendedAt) == "" {
		return true
	}
	t, err := time.Parse(time.RFC3339, strings.TrimSpace(suspendedAt))
	if err != nil {
		return true
	}
	return time.Since(t) >= autoRunSuspensionLimit
}

func (s *server) scheduleRunnableTasks(ctx context.Context) error {
	cfg, err := s.loadConfig()
	if err != nil {
		return err
	}
	hasRunnableAgent := cfg.Version >= agentHubConfigVersion && configuredAgentProfileName(cfg.AgentProfiles, "default") != ""
	if cfg.Version >= agentHubConfigVersion && !hasRunnableAgent {
		for _, route := range cfg.AgentProfiles {
			if strings.TrimSpace(route.AgentName) != "" {
				hasRunnableAgent = true
				break
			}
		}
	}
	if !hasRunnableAgent {
		return nil
	}
	var failures []error
	for _, workspace := range cfg.Workspaces {
		// Only dispatch into Workspaces this serve instance owns; a workspace
		// removed concurrently loses its lock and must stop being scheduled.
		if !s.ownsWorkspace(workspace.Path) {
			continue
		}
		forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
		if err != nil {
			failures = append(failures, fmt.Errorf("list workspace %s: %w", workspace.ID, err))
			continue
		}
		typedTree, err := forgeWorkspace.Tree()
		if err != nil {
			failures = append(failures, fmt.Errorf("list workspace %s: %w", workspace.ID, err))
			continue
		}
		tree := workspaceTreeFromApp(typedTree)
		started := false
		for _, project := range tree.Projects {
			ready, err := forgeWorkspace.Tasks(app.TaskListOptions{ProjectID: project.ID, Runnable: true})
			if err != nil {
				failures = append(failures, fmt.Errorf("list runnable tasks for %s: %w", project.ID, err))
				continue
			}
			for _, task := range runnableTaskCandidatesFromApp(ready.Runnable) {
				if task.State == "suspended" {
					// Timed wake-up: dispatch a suspended generation whose
					// suspension limit elapsed. The state transition is deferred
					// until a new session owns the task lock, so an external lock
					// cannot race this scan into advancing AutoRun.
					if !autoRunSuspendedDue(task.SuspendedAt) {
						continue
					}
				}
				result, err := s.startRunnableTask(ctx, workspace, task)
				switch result {
				case runnableTaskStarted:
					started = true
				case runnableTaskDispatchFailed:
					if err == nil {
						err = errors.New("dispatch failed without an error")
					}
					failures = append(failures, fmt.Errorf("start runnable task %s: %w", task.ID, err))
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
	// Serialize with the unified Chat start endpoint: a manual start and a
	// background scan must never dispatch the same generation twice.
	s.autoRunDispatchMu.Lock()
	defer s.autoRunDispatchMu.Unlock()
	switch task.State {
	case "queued", "running", "suspended":
	default:
		return runnableTaskNotRunnable, nil
	}
	if err := s.requireResourceNotExternallyLocked(workspace, task.ID); err != nil {
		if isExternalResourceLockError(err) {
			return runnableTaskNotRunnable, nil
		}
		return runnableTaskDispatchFailed, err
	}
	resumingSuspended := task.State == "suspended"
	prompt := buildAutoRunPrompt(workspace.Path, task)
	runs, err := loadAgentRuns(workspace.Path)
	if err != nil {
		return runnableTaskDispatchFailed, fmt.Errorf("load agent runs: %w", err)
	}
	for _, run := range runs {
		if run.ResourceID != task.ID {
			continue
		}
		if !s.agentRunActive(run.ID) && isLiveAgentStatus(run.Status) &&
			(strings.TrimSpace(run.AgentHubSessionID) != "" || strings.TrimSpace(run.SourceExternalID) != "") {
			cfg, client, recoverErr := s.agents.agentHubRuntimeConfig()
			if recoverErr != nil {
				return runnableTaskDispatchFailed, fmt.Errorf("recover AgentHub AutoRun %s: %w", run.ID, recoverErr)
			}
			if recoverErr = s.agents.recoverAgentHubRun(ctx, cfg, client, workspace, run, nil); recoverErr != nil {
				return runnableTaskDispatchFailed, fmt.Errorf("recover AgentHub AutoRun %s: %w", run.ID, recoverErr)
			}
			if recovered := s.agents.runtimeByID(run.ID); recovered != nil {
				recovered.mu.Lock()
				run = recovered.run
				recovered.mu.Unlock()
			}
		}
		if !s.agentRunActive(run.ID) {
			continue
		}
		if strings.TrimSpace(run.AgentHubSessionID) == "" {
			return runnableTaskDispatchFailed, fmt.Errorf("active run %s is not attached to AgentHub", run.ID)
		}
		if run.Status != "idle" {
			return runnableTaskSkippedActive, nil
		}
		if resumingSuspended {
			forgeWorkspace, openErr := app.OpenWorkspace(workspace.Path)
			if openErr != nil {
				return runnableTaskDispatchFailed, fmt.Errorf("open workspace to resume task %s: %w", task.ID, openErr)
			}
			if _, resumeErr := forgeWorkspace.ResumeAutoRun(task.ID); resumeErr != nil {
				return runnableTaskDispatchFailed, fmt.Errorf("resume suspended task %s: %w", task.ID, resumeErr)
			}
			task.State = "queued"
			prompt = buildAutoRunPrompt(workspace.Path, task)
		}
		if err := s.startAutoRunInOpenSession(ctx, workspace, run.ID, task.Generation, prompt); err != nil {
			if errors.Is(err, errAutoRunSessionBusy) {
				// Lost the race against a manual start or a user message; the
				// generation stays queued for the next scan.
				return runnableTaskSkippedActive, nil
			}
			return runnableTaskDispatchFailed, err
		}
		return runnableTaskStarted, nil
	}
	cfg, err := s.loadConfig()
	if err != nil {
		return runnableTaskDispatchFailed, fmt.Errorf("load Agent Profile configuration: %w", err)
	}
	selection, err := resolveAutoRunAgent(cfg, task)
	if err != nil {
		return runnableTaskDispatchFailed, err
	}
	req := startAgentRequest{
		AgentName:            selection.AgentName,
		AgentProfile:         selection.Profile,
		AgentSelectionReason: selection.Reason,
		ResourceID:           task.ID,
		Title:                task.Title,
		Prompt:               prompt,
		SchedulerTurn:        true,
		AutoRunGeneration:    task.Generation,
		QueueAutoRun:         resumingSuspended,
		ExpectedAutoRunState: func() string {
			if resumingSuspended {
				return "suspended"
			}
			return ""
		}(),
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
	if response.StatusCode < 200 || response.StatusCode >= 300 {
		return runnableTaskDispatchFailed, fmt.Errorf("agent run start returned %d: %s", response.StatusCode, strings.TrimSpace(string(responseBody)))
	}
	return runnableTaskStarted, nil
}

func resolveAutoRunAgent(cfg config, task runnableTaskCandidate) (autoRunAgentSelection, error) {
	if cfg.Version < agentHubConfigVersion {
		return autoRunAgentSelection{}, errors.New("AutoRun requires current AgentHub settings; save AgentHub settings before dispatching this task")
	}
	return resolveAgentHubAutoRunAgent(cfg, task)
}

func resolveAgentHubAutoRunAgent(cfg config, task runnableTaskCandidate) (autoRunAgentSelection, error) {
	if len(task.PreferredAgentProfiles) > 0 {
		seen := make(map[string]bool, len(task.PreferredAgentProfiles))
		for _, raw := range task.PreferredAgentProfiles {
			profile := strings.ToLower(strings.TrimSpace(raw))
			if profile == "" || seen[profile] {
				continue
			}
			seen[profile] = true
			route, ok := findAgentProfileRoute(cfg.AgentProfiles, profile)
			if ok && strings.TrimSpace(route.AgentName) != "" {
				return autoRunAgentSelection{
					AgentName: route.AgentName, Profile: profile, Reason: "matched preferred Agent Profile " + profile,
				}, nil
			}
		}
		fallback := configuredAgentProfileName(cfg.AgentProfiles, "default")
		if fallback == "" {
			return autoRunAgentSelection{}, fmt.Errorf("no configured Agent Profile is available for %s and no default AgentHub agent exists", strings.Join(task.PreferredAgentProfiles, ", "))
		}
		return autoRunAgentSelection{
			AgentName: fallback, Reason: "preferred Agent Profiles unavailable; using default AgentHub agent " + fallback,
		}, nil
	}
	fallback := configuredAgentProfileName(cfg.AgentProfiles, "default")
	if fallback == "" {
		return autoRunAgentSelection{}, errors.New("no default AgentHub agent is configured for AutoRun")
	}
	return autoRunAgentSelection{AgentName: fallback, Reason: "using default AgentHub agent"}, nil
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
	rt.mu.Lock()
	active := isLiveAgentStatus(rt.run.Status)
	rt.mu.Unlock()
	return active
}

// errAutoRunSessionBusy marks the race where a session turned busy between
// the reuse check and the scheduler-turn send. The caller keeps the
// generation queued instead of retrying, so no duplicate message is sent.
var errAutoRunSessionBusy = errors.New("session became busy")

func (s *server) startAutoRunInOpenSession(ctx context.Context, workspace guiWorkspace, runID string, generation int, prompt string) error {
	body, err := json.Marshal(agentInputRequest{Text: prompt, SchedulerTurn: true, AutoRunGeneration: generation})
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
		if strings.Contains(string(responseBody), externalResourceLockMessage) {
			return &externalResourceLockError{}
		}
		return errAutoRunSessionBusy
	}
	if response.StatusCode < 200 || response.StatusCode >= 300 {
		return fmt.Errorf("agent input returned %d: %s", response.StatusCode, strings.TrimSpace(string(responseBody)))
	}
	return nil
}
