package main

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestScheduleRunnableTasksScansPastActiveAndFailedCandidates(t *testing.T) {
	workspace := t.TempDir()
	tasks := []runnableTaskCandidate{
		{ID: "project1.task1", Title: "Already running", Generation: 1, State: "running", AgentID: "agent-one"},
		{ID: "project1.task2", Title: "Broken configuration", Generation: 1, State: "queued"},
		{ID: "project1.task3", Title: "Temporary start failure", Generation: 1, State: "queued"},
		{ID: "project1.task4", Title: "Independent work", Generation: 1, State: "queued"},
		{ID: "project1.task5", Title: "More independent work", Generation: 1, State: "queued"},
	}
	var started []string
	s := newSchedulerTestServer(t, workspace, tasks, func(w http.ResponseWriter, r *http.Request) {
		var req startAgentRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			t.Errorf("decode start request: %v", err)
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		started = append(started, req.ResourceID)
		if req.ResourceID == "project1.task2" {
			http.Error(w, "agent provider not found", http.StatusBadRequest)
			return
		}
		if req.ResourceID == "project1.task3" {
			http.Error(w, "provider temporarily unavailable", http.StatusServiceUnavailable)
			return
		}
		w.WriteHeader(http.StatusOK)
	})
	registerSchedulerRun(t, s, workspace, agentRun{
		ID:          "run-active",
		WorkspaceID: "workspace-one",
		ResourceID:  "project1.task1",
		AgentID:     "agent-one",
		Status:      "running",
	}, true)

	err := s.scheduleRunnableTasks(context.Background())
	if err == nil || !strings.Contains(err.Error(), "project1.task2") || !strings.Contains(err.Error(), "agent provider not found") ||
		!strings.Contains(err.Error(), "project1.task3") || !strings.Contains(err.Error(), "temporarily unavailable") {
		t.Fatalf("expected permanent and temporary candidate failures to be reported, got %v", err)
	}
	want := []string{"project1.task2", "project1.task3", "project1.task4"}
	if strings.Join(started, ",") != strings.Join(want, ",") {
		t.Fatalf("scheduler did not scan past active and failed candidates: got %v, want %v", started, want)
	}
	registerSchedulerRun(t, s, workspace, agentRun{
		ID:          "run-independent",
		WorkspaceID: "workspace-one",
		ResourceID:  "project1.task4",
		Status:      "running",
	}, true)

	err = s.scheduleRunnableTasks(context.Background())
	if err == nil || !strings.Contains(err.Error(), "project1.task2") || !strings.Contains(err.Error(), "project1.task3") {
		t.Fatalf("expected failed candidates to remain reported, got %v", err)
	}
	want = []string{"project1.task2", "project1.task3", "project1.task4", "project1.task2", "project1.task3", "project1.task5"}
	if strings.Join(started, ",") != strings.Join(want, ",") {
		t.Fatalf("scheduler did not advance past multiple active runs: got %v, want %v", started, want)
	}
}

func TestStartRunnableTaskReturnsExplicitNonStartResults(t *testing.T) {
	workspace := t.TempDir()
	requests := 0
	s := newSchedulerTestServer(t, workspace, nil, func(w http.ResponseWriter, r *http.Request) {
		requests++
		w.WriteHeader(http.StatusOK)
	})
	registerSchedulerRun(t, s, workspace, agentRun{
		ID:          "run-active",
		WorkspaceID: "workspace-one",
		ResourceID:  "project1.task1",
		AgentID:     "agent-one",
		Status:      "running",
	}, true)

	result, err := s.startRunnableTask(context.Background(), guiWorkspace{ID: "workspace-one", Path: workspace}, runnableTaskCandidate{
		ID: "project1.task1", Generation: 1, State: "running", AgentID: "agent-one",
	})
	if err != nil || result != runnableTaskSkippedActive {
		t.Fatalf("expected active run to be skipped, got result=%q err=%v", result, err)
	}

	result, err = s.startRunnableTask(context.Background(), guiWorkspace{ID: "workspace-one", Path: workspace}, runnableTaskCandidate{
		ID: "project1.task1", Generation: 1, State: "running", AgentID: "agent-two",
	})
	if err == nil || result != runnableTaskDispatchFailed || !strings.Contains(err.Error(), "uses agent agent-one") {
		t.Fatalf("expected agent mismatch failure, got result=%q err=%v", result, err)
	}

	result, err = s.startRunnableTask(context.Background(), guiWorkspace{ID: "workspace-one", Path: workspace}, runnableTaskCandidate{
		ID: "project1.task1", Generation: 1, State: "running", PreferredAgentProfiles: []string{"kimi"},
	})
	if err != nil || result != runnableTaskSkippedActive {
		t.Fatalf("expected Profile preference to reuse an active task session, got result=%q err=%v", result, err)
	}

	result, err = s.startRunnableTask(context.Background(), guiWorkspace{ID: "workspace-one", Path: workspace}, runnableTaskCandidate{
		ID: "project1.task2", Generation: 1, State: "paused",
	})
	if err != nil || result != runnableTaskNotRunnable {
		t.Fatalf("expected paused task to be not runnable, got result=%q err=%v", result, err)
	}
	if requests != 0 {
		t.Fatalf("non-start results unexpectedly made %d HTTP requests", requests)
	}
}

func TestStartRunnableTaskCreatesFreshSessionAfterDurableStopped(t *testing.T) {
	workspace := t.TempDir()
	var request startAgentRequest
	s := newSchedulerTestServer(t, workspace, nil, func(w http.ResponseWriter, r *http.Request) {
		if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
			t.Errorf("decode start request: %v", err)
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		w.WriteHeader(http.StatusOK)
	})
	registerSchedulerRun(t, s, workspace, agentRun{
		ID:          "run-orphaned",
		WorkspaceID: "workspace-one",
		ResourceID:  "project1.task1",
		AgentID:     "agent-one",
		Status:      "stopped",
	}, false)

	result, err := s.startRunnableTask(context.Background(), guiWorkspace{ID: "workspace-one", Path: workspace}, runnableTaskCandidate{
		ID: "project1.task1", Title: "Recover", Generation: 3, State: "running", PreferredAgentProfiles: []string{"codex"}, Prompt: "Continue work",
	})
	if err != nil || result != runnableTaskStarted {
		t.Fatalf("expected orphaned task recovery to start, got result=%q err=%v", result, err)
	}
	if request.ResourceID != "project1.task1" || request.AutoRunGeneration != 3 {
		t.Fatalf("unexpected recovery request: %#v", request)
	}
	if request.AgentID != "agent-one" || request.AgentProfile != "codex" || !strings.Contains(request.AgentSelectionReason, "matched") {
		t.Fatalf("unexpected Profile resolution: %#v", request)
	}
	if !strings.Contains(request.Prompt, "Recover and continue") {
		t.Fatalf("recovery prompt is missing orphan context: %q", request.Prompt)
	}
}

func TestBuildAutoRunPromptUsesWorkspaceLanguage(t *testing.T) {
	task := runnableTaskCandidate{
		State:  "running",
		Prompt: "保留用户 prompt",
		After: []runnableTaskDependency{
			{TaskID: "project1.task2", Generation: 3},
			{TaskID: "project1.task4", Generation: 5},
		},
	}

	t.Run("simplified Chinese", func(t *testing.T) {
		workspace := t.TempDir()
		if err := os.WriteFile(filepath.Join(workspace, "forge.json"), []byte(`{"language":"zh-CN"}`), 0o644); err != nil {
			t.Fatal(err)
		}
		got := buildAutoRunPrompt(workspace, task)
		for _, want := range []string{
			"恢复并继续当前 AutoRun generation",
			"保留用户 prompt",
			"以下前置任务运行已完成：project1.task2@3, project1.task4@5",
			"这是一个 AutoRun 调度器回合",
			"最后一个有副作用的命令必须且只能是 forge task autorun complete、wait、pause 或 fail 之一",
		} {
			if !strings.Contains(got, want) {
				t.Fatalf("Chinese prompt does not contain %q:\n%s", want, got)
			}
		}
		if strings.Contains(got, "This is an AutoRun scheduler turn") {
			t.Fatalf("Chinese prompt retained an English scheduler instruction:\n%s", got)
		}
	})

	t.Run("English and fallback", func(t *testing.T) {
		for _, language := range []string{"en", "fr", "", "malformed"} {
			workspace := t.TempDir()
			switch language {
			case "":
			case "malformed":
				if err := os.WriteFile(filepath.Join(workspace, "forge.json"), []byte(`{`), 0o644); err != nil {
					t.Fatal(err)
				}
			default:
				data := []byte(`{"language":"` + language + `"}`)
				if err := os.WriteFile(filepath.Join(workspace, "forge.json"), data, 0o644); err != nil {
					t.Fatal(err)
				}
			}
			got := buildAutoRunPrompt(workspace, task)
			for _, want := range []string{
				"Recover and continue the current AutoRun generation",
				"保留用户 prompt",
				"The following prerequisite task runs completed: project1.task2@3, project1.task4@5",
				"This is an AutoRun scheduler turn",
			} {
				if !strings.Contains(got, want) {
					t.Fatalf("prompt for language %q does not contain %q:\n%s", language, want, got)
				}
			}
		}
	})
}

func TestAutoRunLocalizedDefaultAndContinuePrompts(t *testing.T) {
	workspace := t.TempDir()
	if err := os.WriteFile(filepath.Join(workspace, "forge.json"), []byte(`{"language":"zh_CN"}`), 0o644); err != nil {
		t.Fatal(err)
	}
	got := buildAutoRunPrompt(workspace, runnableTaskCandidate{State: "queued"})
	if !strings.Contains(got, "读取 task.md 并完成任务。") {
		t.Fatalf("Chinese default task prompt is missing:\n%s", got)
	}
	continuePrompt := autoRunContinuePrompt(workspace)
	if !strings.Contains(continuePrompt, "继续当前 AutoRun") ||
		!strings.Contains(continuePrompt, "forge task autorun complete、wait、pause 或 fail") {
		t.Fatalf("unexpected Chinese continuation prompt: %q", continuePrompt)
	}
}

func TestStartRunnableTaskReusesIdleSession(t *testing.T) {
	workspace := t.TempDir()
	var input agentInputRequest
	var path string
	s := newSchedulerTestServer(t, workspace, nil, func(w http.ResponseWriter, r *http.Request) {
		path = r.URL.Path
		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			t.Errorf("decode input request: %v", err)
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		w.WriteHeader(http.StatusOK)
	})
	registerSchedulerRun(t, s, workspace, agentRun{
		ID:          "run-idle",
		WorkspaceID: "workspace-one",
		ResourceID:  "project1.task1",
		AgentID:     "agent-one",
		Status:      "idle",
	}, true)

	result, err := s.startRunnableTask(context.Background(), guiWorkspace{ID: "workspace-one", Path: workspace}, runnableTaskCandidate{
		ID: "project1.task1", Generation: 5, State: "queued", AgentID: "agent-one", Prompt: "Next turn",
	})
	if err != nil || result != runnableTaskStarted {
		t.Fatalf("expected idle session reuse to start, got result=%q err=%v", result, err)
	}
	if path != "/api/workspaces/workspace-one/agent/runs/run-idle/input" || !input.SchedulerTurn || input.AutoRunGeneration != 5 {
		t.Fatalf("unexpected idle-session input: path=%q request=%#v", path, input)
	}
}

func TestStartRunnableTaskFailsClosedWhenRunIndexCannotBeRead(t *testing.T) {
	workspace := t.TempDir()
	if err := os.MkdirAll(agentRoot(workspace), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(agentIndexPath(workspace), []byte("not json"), 0o644); err != nil {
		t.Fatal(err)
	}
	requests := 0
	s := newSchedulerTestServer(t, workspace, nil, func(w http.ResponseWriter, r *http.Request) {
		requests++
		w.WriteHeader(http.StatusOK)
	})

	result, err := s.startRunnableTask(context.Background(), guiWorkspace{ID: "workspace-one", Path: workspace}, runnableTaskCandidate{
		ID: "project1.task1", Generation: 1, State: "queued",
	})
	if err == nil || result != runnableTaskDispatchFailed || !strings.Contains(err.Error(), "load agent runs") {
		t.Fatalf("expected run-index failure, got result=%q err=%v", result, err)
	}
	if requests != 0 {
		t.Fatalf("scheduler started a run after index failure")
	}
}

func newSchedulerTestServer(t *testing.T, workspace string, tasks []runnableTaskCandidate, handler http.HandlerFunc) *server {
	t.Helper()
	treeData, err := json.Marshal(workspaceTree{Projects: []resourceSnapshot{{ID: "project1"}}})
	if err != nil {
		t.Fatal(err)
	}
	taskData, err := json.Marshal(runnableTaskResponse{Tasks: tasks})
	if err != nil {
		t.Fatal(err)
	}
	t.Setenv("FORGE_SCHEDULER_TEST_TREE", string(treeData))
	t.Setenv("FORGE_SCHEDULER_TEST_TASKS", string(taskData))
	forgePath := filepath.Join(t.TempDir(), "forge-fake")
	script := `#!/bin/sh
case "$1 $2" in
  "workspace tree") printf '%s\n' "$FORGE_SCHEDULER_TEST_TREE" ;;
  "task list") printf '%s\n' "$FORGE_SCHEDULER_TEST_TASKS" ;;
  "task autorun") printf '{}\n' ;;
  *) printf 'unexpected forge command: %s\n' "$*" >&2; exit 1 ;;
esac
`
	if err := os.WriteFile(forgePath, []byte(script), 0o755); err != nil {
		t.Fatal(err)
	}
	httpServer := httptest.NewServer(handler)
	t.Cleanup(httpServer.Close)
	s := &server{
		addr:      httpServer.URL,
		config:    filepath.Join(t.TempDir(), "gui.json"),
		forgePath: forgePath,
	}
	s.agents = newAgentManager(s)
	if err := s.saveConfig(config{
		Version:          agentHubConfigVersion,
		Workspaces:       []guiWorkspace{{ID: "workspace-one", Path: workspace}},
		DefaultAgentName: "agent-one",
		AgentProfiles: []agentProfileRoute{
			{Key: "codex", AgentName: "agent-one"},
			{Key: "kimi", AgentName: "agent-two"},
		},
	}); err != nil {
		t.Fatal(err)
	}
	return s
}

func TestResolveAutoRunAgentRejectsLegacyDirectConfiguration(t *testing.T) {
	cfg := config{Version: 1}
	if _, err := resolveAutoRunAgent(cfg, runnableTaskCandidate{PreferredAgentProfiles: []string{"kimi", "review"}}); err == nil || !strings.Contains(err.Error(), "AgentHub settings") {
		t.Fatalf("expected direct configuration migration error, got %v", err)
	}
}

func TestResolveAutoRunAgentUsesAgentHubProfileNames(t *testing.T) {
	cfg := config{
		Version:          agentHubConfigVersion,
		DefaultAgentName: "kimi-k3",
		AgentProfiles: []agentProfileRoute{
			{Key: "deep", AgentName: "gpt-5.6-sol"},
			{Key: "fast", AgentName: "gpt-5.3-codex-spark"},
		},
	}
	selection, err := resolveAutoRunAgent(cfg, runnableTaskCandidate{PreferredAgentProfiles: []string{"missing", "deep"}})
	if err != nil || selection.AgentID != "gpt-5.6-sol" || selection.Profile != "deep" {
		t.Fatalf("expected AgentHub Profile route, got selection=%+v err=%v", selection, err)
	}
	selection, err = resolveAutoRunAgent(cfg, runnableTaskCandidate{PreferredAgentProfiles: []string{"missing"}})
	if err != nil || selection.AgentID != "kimi-k3" || selection.Profile != "" {
		t.Fatalf("expected AgentHub default fallback, got selection=%+v err=%v", selection, err)
	}
}

func registerSchedulerRun(t *testing.T, s *server, workspace string, run agentRun, active bool) {
	t.Helper()
	if run.AgentHubSessionID == "" {
		run.AgentHubSessionID = "ses_" + run.ID
	}
	if err := saveAgentRun(workspace, run); err != nil {
		t.Fatal(err)
	}
	if active {
		s.agents.registerRuntime(&agentRuntime{run: run})
	}
}
