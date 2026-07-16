package main

import (
	"bytes"
	"context"
	"encoding/json"
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
	ID         string                   `json:"id"`
	Path       string                   `json:"path"`
	Title      string                   `json:"title"`
	Generation int                      `json:"generation"`
	State      string                   `json:"state"`
	Prompt     string                   `json:"prompt"`
	AgentID    string                   `json:"agentId"`
	After      []runnableTaskDependency `json:"after,omitempty"`
}

type runnableTaskDependency struct {
	TaskID     string `json:"taskId"`
	Generation int    `json:"generation"`
}

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
	for _, workspace := range cfg.Workspaces {
		out, err := s.runForge(ctx, workspace.Path, "workspace", "tree", "--json")
		if err != nil {
			return err
		}
		var tree workspaceTree
		if err := json.Unmarshal(out, &tree); err != nil {
			return err
		}
		started := false
		for _, project := range tree.Projects {
			out, err := s.runForge(ctx, workspace.Path, "task", "list", "--project="+project.ID, "--runnable", "--json")
			if err != nil {
				return err
			}
			var ready runnableTaskResponse
			if err := json.Unmarshal(out, &ready); err != nil {
				return err
			}
			for _, task := range ready.Tasks {
				if err := s.startRunnableTask(ctx, workspace, task); err != nil {
					log.Printf("start runnable task %s: %v", task.ID, err)
					continue
				}
				started = true
				break
			}
			if started {
				break
			}
		}
	}
	return nil
}

func (s *server) startRunnableTask(ctx context.Context, workspace guiWorkspace, task runnableTaskCandidate) error {
	if task.State == "waiting" {
		selector, err := forgeTaskSelectorArgs(task.ID)
		if err != nil {
			return err
		}
		args := []string{"task", "autorun", "resume"}
		args = append(args, selector...)
		if _, err := s.runForge(ctx, workspace.Path, args...); err != nil {
			return err
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
	req := startAgentRequest{
		AgentID:           strings.TrimSpace(task.AgentID),
		ResourceID:        task.ID,
		Title:             task.Title,
		Prompt:            prompt,
		SchedulerTurn:     true,
		AutoRunGeneration: task.Generation,
	}
	if runs, err := loadAgentRuns(workspace.Path); err == nil {
		for _, run := range runs {
			if run.ResourceID != task.ID || !s.agentRunActive(run.ID) {
				continue
			}
			if task.AgentID != "" && run.AgentID != task.AgentID {
				return nil
			}
			if run.Status != "idle" {
				return nil
			}
			return s.startAutoRunInOpenSession(ctx, workspace, run.ID, task.Generation, prompt)
		}
		for _, run := range runs {
			if run.ResourceID != task.ID || s.agentRunActive(run.ID) {
				continue
			}
			if task.AgentID != "" && run.AgentID != task.AgentID {
				break
			}
			if strings.TrimSpace(run.ProviderSessionID) != "" || strings.TrimSpace(run.CodexThreadID) != "" {
				req.ResumeRunID = run.ID
			}
			break
		}
	}
	body, err := json.Marshal(req)
	if err != nil {
		return err
	}
	endpoint := strings.TrimRight(s.internalEndpoint(), "/") + "/api/workspaces/" + workspace.ID + "/agent/runs"
	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, bytes.NewReader(body))
	if err != nil {
		return err
	}
	httpReq.Header.Set("Content-Type", "application/json")
	response, err := (&http.Client{Timeout: 30 * time.Second}).Do(httpReq)
	if err != nil {
		return err
	}
	defer response.Body.Close()
	responseBody, _ := io.ReadAll(response.Body)
	if response.StatusCode < 200 || response.StatusCode >= 300 {
		return fmt.Errorf("agent run start returned %d: %s", response.StatusCode, strings.TrimSpace(string(responseBody)))
	}
	return nil
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
