package serve

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"testing"
	"time"

	"github.com/disksing/forge/internal/app"
)

func TestScheduleRunnableTasksScansPastActiveAndFailedCandidates(t *testing.T) {
	workspace := t.TempDir()
	tasks := []runnableTaskCandidate{
		{ID: "project1.task1", Title: "Already running", Generation: 1, State: "running"},
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
		ID:                "run-active",
		WorkspaceID:       "workspace-one",
		ResourceID:        "project1.task1",
		AgentHubAgentName: "agent-one",
		Status:            "running",
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

func TestScheduleRunnableTasksUsesSavedGenerationAgentWithoutProfileFallback(t *testing.T) {
	workspace := t.TempDir()
	var request startAgentRequest
	s := newSchedulerTestServer(t, workspace, []runnableTaskCandidate{
		{ID: "project1.task1", Generation: 1, State: "queued", AgentName: "saved-agent"},
	}, func(w http.ResponseWriter, r *http.Request) {
		if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
			t.Errorf("decode start request: %v", err)
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		w.WriteHeader(http.StatusOK)
	})
	cfg, err := s.loadConfig()
	if err != nil {
		t.Fatal(err)
	}
	cfg.AgentProfiles = nil
	if err := s.saveConfig(cfg); err != nil {
		t.Fatal(err)
	}

	if err := s.scheduleRunnableTasks(context.Background()); err != nil {
		t.Fatalf("saved generation Agent should remain schedulable without profiles: %v", err)
	}
	if request.ResourceID != "project1.task1" || request.AgentName != "saved-agent" || request.SelfDrivingAgentName != "saved-agent" || request.SelfDrivingAgentNameSet {
		t.Fatalf("scheduler silently changed or duplicated the saved Agent selection: %#v", request)
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
		ID:                "run-active",
		WorkspaceID:       "workspace-one",
		ResourceID:        "project1.task1",
		AgentHubAgentName: "agent-one",
		Status:            "running",
	}, true)

	result, err := s.startRunnableTask(context.Background(), guiWorkspace{ID: "workspace-one", Path: workspace}, runnableTaskCandidate{
		ID: "project1.task1", Generation: 1, State: "running",
	})
	if err != nil || result != runnableTaskSkippedActive {
		t.Fatalf("expected active run to be skipped, got result=%q err=%v", result, err)
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
		ID:                "run-orphaned",
		WorkspaceID:       "workspace-one",
		ResourceID:        "project1.task1",
		AgentHubAgentName: "agent-one",
		Status:            "stopped",
	}, false)

	result, err := s.startRunnableTask(context.Background(), guiWorkspace{ID: "workspace-one", Path: workspace}, runnableTaskCandidate{
		ID: "project1.task1", Title: "Recover", Generation: 3, State: "running", PreferredAgentProfiles: []string{"codex"}, Prompt: "Continue work",
	})
	if err != nil || result != runnableTaskStarted {
		t.Fatalf("expected orphaned task recovery to start, got result=%q err=%v", result, err)
	}
	if request.ResourceID != "project1.task1" || request.SelfDrivingGeneration != 3 {
		t.Fatalf("unexpected recovery request: %#v", request)
	}
	if request.AgentName != "agent-one" || request.AgentProfile != "codex" || !strings.Contains(request.AgentSelectionReason, "matched") {
		t.Fatalf("unexpected Profile resolution: %#v", request)
	}
	if !strings.Contains(request.Prompt, "Recover and continue") {
		t.Fatalf("recovery prompt is missing orphan context: %q", request.Prompt)
	}
}

func TestBuildSelfDrivingPromptUsesWorkspaceLanguage(t *testing.T) {
	task := runnableTaskCandidate{
		State:              "running",
		Prompt:             "保留用户 prompt",
		CompletionCriteria: "验证 focused tests 全部通过",
		SuspensionSummary:  "等待 task197 合入并安装",
		WakeCondition:      "task197 已合入并安装",
	}

	t.Run("simplified Chinese", func(t *testing.T) {
		workspace := t.TempDir()
		if err := os.WriteFile(filepath.Join(workspace, "forge.json"), []byte(`{"language":"zh-CN"}`), 0o644); err != nil {
			t.Fatal(err)
		}
		got := buildSelfDrivingPrompt(workspace, task)
		for _, want := range []string{
			"恢复并继续当前 Self-Driving generation",
			"保留用户 prompt",
			"验证 focused tests 全部通过",
			"此 Self-Driving generation 之前被挂起。请先检查唤醒条件",
			"挂起上下文：\n等待 task197 合入并安装",
			"唤醒条件：\ntask197 已合入并安装",
			"这是一个 Self-Driving 调度器回合",
			"最后一个有副作用的命令必须且只能是 forge task self-driving complete、suspend、pause 或 fail 之一",
			"只有在任务无法继续推进、剩余唯一有意义的动作是反复轮询一个具体且可观察的外部条件时，才可以使用 suspend",
			"只要还有任何范围内的实现、测试、调查、评审、文档、修复或验证工作可做，就必须在当前回合继续",
			"--summary=<上下文>",
			"--wake-condition=<条件>",
			"只有 task.md 要求和适当验证完成后才使用 complete",
		} {
			if !strings.Contains(got, want) {
				t.Fatalf("Chinese prompt does not contain %q:\n%s", want, got)
			}
		}
		if strings.Contains(got, "This is a Self-Driving scheduler turn") {
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
			got := buildSelfDrivingPrompt(workspace, task)
			for _, want := range []string{
				"Recover and continue the current Self-Driving generation",
				"保留用户 prompt",
				"验证 focused tests 全部通过",
				"This Self-Driving generation was previously suspended. Check the wake condition first.",
				"Suspension context:\n等待 task197 合入并安装",
				"Wake condition:\ntask197 已合入并安装",
				"This is a Self-Driving scheduler turn",
				"Use suspend only when the task cannot make meaningful progress and the only remaining action would be repeated polling of a specific, observable external condition",
				"If any in-scope implementation, testing, investigation, review, documentation, repair, or verification remains, continue this turn.",
				"In --summary=<context>, record completed work, current status, and blocking context",
				"--wake-condition=<condition>",
				"Use complete only after task requirements and appropriate verification are done",
			} {
				if !strings.Contains(got, want) {
					t.Fatalf("prompt for language %q does not contain %q:\n%s", language, want, got)
				}
			}
		}
	})
}

func TestSelfDrivingPromptDoesNotCarryTerminalGenerationSummary(t *testing.T) {
	workspace := t.TempDir()
	completed := app.Task{
		ResourceMeta: app.ResourceMeta{ID: "project1.task1", Title: "Terminal generation"},
		SelfDriving: &app.SelfDriving{
			Generation: 4, State: "completed", Prompt: "old instructions",
			SuspensionSummary: "old generation suspension",
		},
	}
	candidate, expectedState, err := chatSelfDrivingCandidate(completed.ID, completed, app.SelfDrivingQueueInput{
		Prompt: "fresh instructions", PromptSet: true,
	})
	if err != nil {
		t.Fatal(err)
	}
	if expectedState != "completed" || candidate.Generation != 5 || candidate.SuspensionSummary != "" {
		t.Fatalf("terminal generation carried stale suspension context: state=%q candidate=%+v", expectedState, candidate)
	}
	prompt := buildSelfDrivingPrompt(workspace, candidate)
	if strings.Contains(prompt, "old generation suspension") || !strings.Contains(prompt, "fresh instructions") {
		t.Fatalf("new generation prompt contains stale suspension context or lost instructions:\n%s", prompt)
	}
	failed := completed
	failed.SelfDriving = &app.SelfDriving{
		Generation: 4, State: "failed", Prompt: "failed generation instructions",
		SuspensionSummary: "failed generation suspension",
	}
	failedCandidate, expectedState, err := chatSelfDrivingCandidate(failed.ID, failed)
	if err != nil {
		t.Fatal(err)
	}
	if expectedState != "failed" || failedCandidate.Generation != 5 || failedCandidate.SuspensionSummary != "" {
		t.Fatalf("failed generation carried stale suspension context: state=%q candidate=%+v", expectedState, failedCandidate)
	}

	suspended := app.Task{
		ResourceMeta: app.ResourceMeta{ID: "project1.task2", Title: "Resumed generation"},
		SelfDriving: &app.SelfDriving{
			Generation: 2, State: "suspended", Prompt: "continue instructions",
			SuspensionSummary: "current generation suspension",
		},
	}
	resumedCandidate, expectedState, err := chatSelfDrivingCandidate(suspended.ID, suspended)
	if err != nil {
		t.Fatal(err)
	}
	if expectedState != "suspended" || resumedCandidate.SuspensionSummary != "current generation suspension" {
		t.Fatalf("resumed generation lost its prompt recovery context: state=%q candidate=%+v", expectedState, resumedCandidate)
	}
	if prompt := buildSelfDrivingPrompt(workspace, resumedCandidate); !strings.Contains(prompt, "current generation suspension") {
		t.Fatalf("resumed generation prompt omitted suspension context:\n%s", prompt)
	}
}

func TestSelfDrivingLocalizedDefaultAndContinuePrompts(t *testing.T) {
	workspace := t.TempDir()
	if err := os.WriteFile(filepath.Join(workspace, "forge.json"), []byte(`{"language":"zh_CN"}`), 0o644); err != nil {
		t.Fatal(err)
	}
	got := buildSelfDrivingPrompt(workspace, runnableTaskCandidate{State: "queued"})
	if !strings.Contains(got, "读取 task.md 并完成任务。") {
		t.Fatalf("Chinese default task prompt is missing:\n%s", got)
	}
	continuePrompt := selfDrivingContinuePrompt(workspace)
	if !strings.Contains(continuePrompt, "继续当前 Self-Driving") ||
		!strings.Contains(continuePrompt, "forge task self-driving complete、suspend、pause 或 fail") {
		t.Fatalf("unexpected Chinese continuation prompt: %q", continuePrompt)
	}
}

func TestSelfDrivingContinuePromptsUseStrictSuspendGuidance(t *testing.T) {
	cases := []struct {
		name      string
		language  string
		strict    string
		suspended string
		summary   string
		wake      string
	}{
		{
			name:      "English",
			language:  "en",
			strict:    "Use suspend only when the task cannot make meaningful progress",
			suspended: "This Self-Driving generation was previously suspended. Check the wake condition first.",
			summary:   "waiting for external review",
			wake:      "the review is approved",
		},
		{
			name:      "Simplified Chinese",
			language:  "zh-CN",
			strict:    "只有在任务无法继续推进、剩余唯一有意义的动作是反复轮询一个具体且可观察的外部条件时，才可以使用 suspend",
			suspended: "此 Self-Driving generation 之前被挂起。请先检查唤醒条件",
			summary:   "等待外部评审",
			wake:      "评审已通过",
		},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			workspace := t.TempDir()
			if err := os.WriteFile(filepath.Join(workspace, "forge.json"), []byte(`{"language":"`+tc.language+`"}`), 0o644); err != nil {
				t.Fatal(err)
			}
			candidate := runnableTaskCandidate{
				State:              "suspended",
				Prompt:             "Continue the task",
				CompletionCriteria: "The work is verified",
				SuspensionSummary:  tc.summary,
				WakeCondition:      tc.wake,
			}
			for name, prompt := range map[string]string{
				"retry":          selfDrivingContinuePrompt(workspace),
				"suspended wake": selfDrivingContinuePrompt(workspace, candidate),
			} {
				if !strings.Contains(prompt, tc.strict) {
					t.Fatalf("%s prompt is missing strict suspend guidance %q:\n%s", name, tc.strict, prompt)
				}
			}
			wakePrompt := selfDrivingContinuePrompt(workspace, candidate)
			for _, want := range []string{tc.suspended, tc.summary, tc.wake} {
				if !strings.Contains(wakePrompt, want) {
					t.Fatalf("suspended wake prompt is missing %q:\n%s", want, wakePrompt)
				}
			}
		})
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
		ID:                "run-idle",
		WorkspaceID:       "workspace-one",
		ResourceID:        "project1.task1",
		AgentHubAgentName: "agent-one",
		Status:            "idle",
	}, true)

	result, err := s.startRunnableTask(context.Background(), guiWorkspace{ID: "workspace-one", Path: workspace}, runnableTaskCandidate{
		ID: "project1.task1", Generation: 5, State: "queued", Prompt: "Next turn",
	})
	if err != nil || result != runnableTaskStarted {
		t.Fatalf("expected idle session reuse to start, got result=%q err=%v", result, err)
	}
	if path != "/api/workspaces/workspace-one/agent/runs/run-idle/input" || !input.SchedulerTurn || input.SelfDrivingGeneration != 5 {
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
	forgeWorkspace, err := app.Initialize(workspace, "en")
	if err != nil {
		t.Fatal(err)
	}
	project, err := forgeWorkspace.CreateProject("Scheduler test project", "scheduler")
	if err != nil {
		t.Fatal(err)
	}
	maxTask := 1
	for _, candidate := range tasks {
		_, suffix, ok := strings.Cut(candidate.ID, ".task")
		if !ok {
			continue
		}
		if number, err := strconv.Atoi(suffix); err == nil && number > maxTask {
			maxTask = number
		}
	}
	byID := make(map[string]runnableTaskCandidate, len(tasks))
	for _, candidate := range tasks {
		byID[candidate.ID] = candidate
	}
	for number := 1; number <= maxTask; number++ {
		id := project.ID + ".task" + strconv.Itoa(number)
		candidate := byID[id]
		title := candidate.Title
		if title == "" {
			title = "Scheduler task " + strconv.Itoa(number)
		}
		task, err := forgeWorkspace.CreateTask(app.CreateTaskInput{
			ProjectID: project.ID, Title: title, Slug: "task" + strconv.Itoa(number),
			SelfDriving: true, AgentName: candidate.AgentName, PreferredAgentProfiles: candidate.PreferredAgentProfiles,
			Prompt: candidate.Prompt,
		})
		if err != nil {
			t.Fatal(err)
		}
		switch candidate.State {
		case "running":
			if _, err := forgeWorkspace.StartSelfDriving(task.ID); err != nil {
				t.Fatal(err)
			}
		case "paused":
			if _, err := forgeWorkspace.StartSelfDriving(task.ID); err != nil {
				t.Fatal(err)
			}
			if _, err := forgeWorkspace.PauseSelfDriving(app.SelfDrivingActionInput{TaskID: task.ID, Reason: "test"}); err != nil {
				t.Fatal(err)
			}
		case "suspended":
			if _, err := forgeWorkspace.StartSelfDriving(task.ID); err != nil {
				t.Fatal(err)
			}
			if _, err := forgeWorkspace.SuspendSelfDriving(app.SelfDrivingActionInput{TaskID: task.ID, Summary: candidate.SuspensionSummary}); err != nil {
				t.Fatal(err)
			}
		}
	}
	httpServer := httptest.NewServer(handler)
	t.Cleanup(httpServer.Close)
	s := &server{
		addr:   httpServer.URL,
		config: filepath.Join(t.TempDir(), "gui.json"),
	}
	s.agents = newAgentManager(s)
	if err := s.saveConfig(config{
		Version:    agentHubConfigVersion,
		Workspaces: []guiWorkspace{{ID: "workspace-one", Path: workspace}},
		AgentProfiles: []agentProfileRoute{
			{Key: "default", AgentName: "agent-one"},
			{Key: "codex", AgentName: "agent-one"},
			{Key: "kimi", AgentName: "agent-two"},
		},
	}); err != nil {
		t.Fatal(err)
	}
	return s
}

func TestResolveSelfDrivingAgentRejectsOutdatedConfiguration(t *testing.T) {
	cfg := config{Version: 1}
	if _, err := resolveSelfDrivingAgent(cfg, runnableTaskCandidate{PreferredAgentProfiles: []string{"kimi", "review"}}); err == nil || !strings.Contains(err.Error(), "AgentHub settings") {
		t.Fatalf("expected outdated configuration error, got %v", err)
	}
}

func TestResolveSelfDrivingAgentUsesAgentHubProfileNames(t *testing.T) {
	cfg := config{
		Version: agentHubConfigVersion,
		AgentProfiles: []agentProfileRoute{
			{Key: "default", AgentName: "kimi-k3"},
			{Key: "deep", AgentName: "gpt-5.6-sol"},
			{Key: "fast", AgentName: "gpt-5.3-codex-spark"},
		},
	}
	selection, err := resolveSelfDrivingAgent(cfg, runnableTaskCandidate{PreferredAgentProfiles: []string{"missing", "deep"}})
	if err != nil || selection.AgentName != "gpt-5.6-sol" || selection.Profile != "deep" {
		t.Fatalf("expected AgentHub Profile route, got selection=%+v err=%v", selection, err)
	}
	selection, err = resolveSelfDrivingAgent(cfg, runnableTaskCandidate{PreferredAgentProfiles: []string{"missing"}})
	if err != nil || selection.AgentName != "kimi-k3" || selection.Profile != "" {
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

func TestSelfDrivingSuspendedDue(t *testing.T) {
	recent := time.Now().Add(-10 * time.Minute).Format(time.RFC3339)
	if selfDrivingSuspendedDue(recent) {
		t.Fatalf("suspended 10 minutes ago should not be due, but driver woke it")
	}
	overdue := time.Now().Add(-31 * time.Minute).Format(time.RFC3339)
	if !selfDrivingSuspendedDue(overdue) {
		t.Fatalf("suspended 31 minutes ago should be due, but driver left it suspended")
	}
	if !selfDrivingSuspendedDue("") {
		t.Fatalf("empty suspendedAt must be treated as due so tasks never stall")
	}
	if !selfDrivingSuspendedDue("not-a-time") {
		t.Fatalf("unparsable suspendedAt must be treated as due so tasks never stall")
	}
}

func TestScheduleRunnableTasksWakesOverdueSuspended(t *testing.T) {
	workspace := t.TempDir()
	overdue := time.Now().Add(-selfDrivingSuspensionLimit - time.Minute).Format(time.RFC3339)
	var started []string
	s := newSchedulerTestServer(t, workspace, []runnableTaskCandidate{
		{ID: "project1.task1", Title: "Overdue suspended", Generation: 1, State: "suspended", SuspensionSummary: "waiting for merge"},
		{ID: "project1.task2", Title: "Fresh suspended", Generation: 1, State: "suspended"},
	}, func(w http.ResponseWriter, r *http.Request) {
		var req startAgentRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			t.Errorf("decode start request: %v", err)
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		started = append(started, req.ResourceID)
		if req.QueueSelfDriving {
			forgeWorkspace, openErr := app.OpenWorkspace(workspace)
			if openErr != nil {
				t.Errorf("open workspace for queued scheduler request: %v", openErr)
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
			if _, resumeErr := forgeWorkspace.ResumeSelfDriving(req.ResourceID); resumeErr != nil {
				t.Errorf("resume queued scheduler request: %v", resumeErr)
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
		}
		w.WriteHeader(http.StatusOK)
	})

	// Backdate the suspended generation past the wake-up threshold. The server
	// restart scenario re-reads the persisted suspendedAt, so no runtime state
	// needs to change here.
	forgeWorkspace, err := app.OpenWorkspace(workspace)
	if err != nil {
		t.Fatal(err)
	}
	resource, err := forgeWorkspace.ResourceValue("project1.task1")
	if err != nil || resource.Task == nil || resource.Task.SelfDriving == nil {
		t.Fatalf("load task1: %v", err)
	}
	resource.Task.SelfDriving.SuspendedAt = overdue
	if err := rewriteTaskForTest(t, workspace, resource.Task); err != nil {
		t.Fatal(err)
	}

	if err := s.scheduleRunnableTasks(context.Background()); err != nil {
		t.Fatalf("schedule: %v", err)
	}
	want := []string{"project1.task1"}
	if strings.Join(started, ",") != strings.Join(want, ",") {
		t.Fatalf("driver did not wake exactly the overdue suspended task: got %v, want %v", started, want)
	}

	// The woken generation is now queued and carries the suspension summary so
	// the agent can re-check its condition.
	resource, err = forgeWorkspace.ResourceValue("project1.task1")
	if err != nil || resource.Task == nil || resource.Task.SelfDriving == nil {
		t.Fatalf("reload task1: %v", err)
	}
	if resource.Task.SelfDriving.State != "queued" {
		t.Fatalf("expected woken task to be queued, got %s", resource.Task.SelfDriving.State)
	}
	if resource.Task.SelfDriving.SuspensionSummary != "waiting for merge" {
		t.Fatalf("expected suspension summary to be preserved for the agent, got %q", resource.Task.SelfDriving.SuspensionSummary)
	}
}

func TestScheduleRunnableTasksKeepsPausedAndFreshSuspended(t *testing.T) {
	workspace := t.TempDir()
	requests := 0
	s := newSchedulerTestServer(t, workspace, []runnableTaskCandidate{
		{ID: "project1.task1", Title: "Fresh suspended", Generation: 1, State: "suspended"},
		{ID: "project1.task2", Title: "Paused", Generation: 1, State: "paused"},
	}, func(w http.ResponseWriter, r *http.Request) {
		requests++
		w.WriteHeader(http.StatusOK)
	})

	if err := s.scheduleRunnableTasks(context.Background()); err != nil {
		t.Fatalf("schedule: %v", err)
	}
	if requests != 0 {
		t.Fatalf("driver started %d tasks that must stay dormant", requests)
	}
}

func rewriteTaskForTest(t *testing.T, workspace string, task *app.Task) error {
	t.Helper()
	forgeWorkspace, err := app.OpenWorkspace(workspace)
	if err != nil {
		return err
	}
	resource, err := forgeWorkspace.ResourceValue(task.ID)
	if err != nil {
		return err
	}
	// ResourceValue returns a copy; persist through the task directory file
	// directly to simulate a pre-existing on-disk state.
	dir := filepath.Join(workspace, filepath.FromSlash(resource.Path))
	return os.WriteFile(filepath.Join(dir, "task.json"), mustMarshalTask(t, task), 0o644)
}

func mustMarshalTask(t *testing.T, task *app.Task) []byte {
	t.Helper()
	data, err := json.Marshal(task)
	if err != nil {
		t.Fatal(err)
	}
	return data
}
