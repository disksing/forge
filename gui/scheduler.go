package main

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
)

type runnableTaskResponse struct {
	Tasks []runnableTaskCandidate `json:"tasks"`
}

type runnableTaskCandidate struct {
	ID                     string                   `json:"id"`
	Path                   string                   `json:"path"`
	Title                  string                   `json:"title"`
	Generation             int                      `json:"generation"`
	State                  string                   `json:"state"`
	Prompt                 string                   `json:"prompt"`
	PreferredAgentProfiles []string                 `json:"preferredAgentProfiles,omitempty"`
	AgentID                string                   `json:"agentId"`
	After                  []runnableTaskDependency `json:"after,omitempty"`
}

type autoRunAgentSelection struct {
	AgentID string
	Profile string
	Reason  string
}

type runnableTaskDependency struct {
	TaskID     string `json:"taskId"`
	Generation int    `json:"generation"`
}

type runnableTaskDispatchResult string

const (
	runnableTaskStarted        runnableTaskDispatchResult = "started"
	runnableTaskSkippedActive  runnableTaskDispatchResult = "skipped_active"
	runnableTaskNotRunnable    runnableTaskDispatchResult = "not_runnable"
	runnableTaskDispatchFailed runnableTaskDispatchResult = "failed"
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

func (s *server) scheduleRunnableTasks(ctx context.Context) error {
	cfg, err := s.loadConfig()
	if err != nil {
		return err
	}
	hasEnabledProvider := false
	for _, provider := range cfg.AgentProviders {
		if provider.Enabled {
			hasEnabledProvider = true
			break
		}
	}
	if !hasEnabledProvider {
		return nil
	}
	var failures []error
	for _, workspace := range cfg.Workspaces {
		out, err := s.runForge(ctx, workspace.Path, "workspace", "tree", "--json")
		if err != nil {
			failures = append(failures, fmt.Errorf("list workspace %s: %w", workspace.ID, err))
			continue
		}
		var tree workspaceTree
		if err := json.Unmarshal(out, &tree); err != nil {
			failures = append(failures, fmt.Errorf("decode workspace %s: %w", workspace.ID, err))
			continue
		}
		started := false
		for _, project := range tree.Projects {
			out, err := s.runForge(ctx, workspace.Path, "task", "list", "--project="+project.ID, "--runnable", "--json")
			if err != nil {
				failures = append(failures, fmt.Errorf("list runnable tasks for %s: %w", project.ID, err))
				continue
			}
			var ready runnableTaskResponse
			if err := json.Unmarshal(out, &ready); err != nil {
				failures = append(failures, fmt.Errorf("decode runnable tasks for %s: %w", project.ID, err))
				continue
			}
			for _, task := range ready.Tasks {
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
	switch task.State {
	case "queued", "running", "waiting":
	default:
		return runnableTaskNotRunnable, nil
	}
	if task.State == "waiting" {
		selector, err := forgeTaskSelectorArgs(task.ID)
		if err != nil {
			return runnableTaskDispatchFailed, err
		}
		args := []string{"task", "autorun", "resume"}
		args = append(args, selector...)
		if _, err := s.runForge(ctx, workspace.Path, args...); err != nil {
			return runnableTaskDispatchFailed, err
		}
	}
	prompt := strings.TrimSpace(task.Prompt)
	if prompt == "" {
		prompt = "Read task.md and complete the task."
	}
	if task.State == "running" {
		prompt = "Recover and continue the current AutoRun generation. Read task.md, work.md, and the relevant AutoRun entries in log.jsonl before continuing.\n\n" + prompt
	}
	if len(task.After) > 0 {
		var completed []string
		for _, dep := range task.After {
			completed = append(completed, fmt.Sprintf("%s@%d", dep.TaskID, dep.Generation))
		}
		prompt += "\n\nThe following prerequisite task runs completed: " + strings.Join(completed, ", ") + ". Read their task files and results before continuing."
	}
	prompt += "\n\nThis is an AutoRun scheduler turn. Before ending, call exactly one of forge task autorun complete, wait, pause, or fail as your last side-effecting command."
	runs, err := loadAgentRuns(workspace.Path)
	if err != nil {
		return runnableTaskDispatchFailed, fmt.Errorf("load agent runs: %w", err)
	}
	for _, run := range runs {
		if run.ResourceID != task.ID || !s.agentRunActive(run.ID) {
			continue
		}
		if len(task.PreferredAgentProfiles) == 0 && task.AgentID != "" && run.AgentID != task.AgentID {
			return runnableTaskDispatchFailed, fmt.Errorf("active run %s uses agent %s, AutoRun requires %s", run.ID, run.AgentID, task.AgentID)
		}
		if run.Status != "idle" {
			return runnableTaskSkippedActive, nil
		}
		if err := s.startAutoRunInOpenSession(ctx, workspace, run.ID, task.Generation, prompt); err != nil {
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
		AgentID:              selection.AgentID,
		AgentProfile:         selection.Profile,
		AgentSelectionReason: selection.Reason,
		ResourceID:           task.ID,
		Title:                task.Title,
		Prompt:               prompt,
		SchedulerTurn:        true,
		AutoRunGeneration:    task.Generation,
	}
	for _, run := range runs {
		if run.ResourceID != task.ID || s.agentRunActive(run.ID) {
			continue
		}
		if run.AgentID != selection.AgentID {
			break
		}
		if strings.TrimSpace(run.ProviderSessionID) != "" || strings.TrimSpace(run.CodexThreadID) != "" {
			req.ResumeRunID = run.ID
		}
		break
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
	if len(task.PreferredAgentProfiles) > 0 {
		seen := make(map[string]bool, len(task.PreferredAgentProfiles))
		for _, raw := range task.PreferredAgentProfiles {
			profile := strings.ToLower(strings.TrimSpace(raw))
			if profile == "" || seen[profile] {
				continue
			}
			seen[profile] = true
			route, ok := findAgentProfileRoute(cfg.AgentProfiles, profile)
			if !ok || !agentConfigAvailable(cfg, route.AgentID) {
				continue
			}
			return autoRunAgentSelection{AgentID: route.AgentID, Profile: profile, Reason: "matched preferred Agent Profile " + profile}, nil
		}
		fallback, ok := defaultAvailableAgent(cfg)
		if !ok {
			return autoRunAgentSelection{}, fmt.Errorf("no configured Agent Profile is available for %s and no enabled fallback Agent exists", strings.Join(task.PreferredAgentProfiles, ", "))
		}
		return autoRunAgentSelection{AgentID: fallback.ID, Reason: "preferred Agent Profiles unavailable; using fallback " + fallback.ID}, nil
	}
	if legacyID := strings.TrimSpace(task.AgentID); legacyID != "" {
		if !agentConfigAvailable(cfg, legacyID) {
			return autoRunAgentSelection{}, fmt.Errorf("legacy AutoRun agentId %s is unavailable; restore that GUI Agent or migrate the task to preferredAgentProfiles", legacyID)
		}
		return autoRunAgentSelection{AgentID: legacyID, Reason: "using legacy AutoRun agentId"}, nil
	}
	fallback, ok := defaultAvailableAgent(cfg)
	if !ok {
		return autoRunAgentSelection{}, errors.New("no enabled Agent is configured for AutoRun")
	}
	return autoRunAgentSelection{AgentID: fallback.ID, Reason: "using default Agent"}, nil
}

func agentConfigAvailable(cfg config, agentID string) bool {
	agent, ok := findAgentConfig(cfg.Agents, agentID)
	if !ok {
		return false
	}
	provider, ok := findAgentProvider(cfg.AgentProviders, agent.ProviderID)
	return ok && provider.Enabled && (provider.Type == codexProviderID || isACPProviderType(provider.Type))
}

func defaultAvailableAgent(cfg config) (agentConfig, bool) {
	if agent, ok := findAgentConfig(cfg.Agents, cfg.DefaultChatAgentID); ok && agentConfigAvailable(cfg, agent.ID) {
		return agent, true
	}
	for _, agent := range cfg.Agents {
		if agentConfigAvailable(cfg, agent.ID) {
			return agent, true
		}
	}
	return agentConfig{}, false
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
	if response.StatusCode < 200 || response.StatusCode >= 300 {
		return fmt.Errorf("agent input returned %d: %s", response.StatusCode, strings.TrimSpace(string(responseBody)))
	}
	return nil
}
