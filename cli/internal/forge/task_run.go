package forge

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"syscall"
	"time"
)

const (
	taskRunModeNonInteractive = "non_interactive"
	taskRunStateQueued        = "queued"
	taskRunStateWaiting       = "waiting"
	taskRunStateRunning       = "running"
	taskRunStatePaused        = "paused"
	taskRunStateCompleted     = "completed"
	taskRunStateFailed        = "failed"
)

type taskRunCommandOptions struct {
	TaskID     string
	Mode       string
	AgentID    string
	Prompt     string
	After      []string
	Generation int
	SessionID  string
	Executor   string
	Summary    string
	Reason     string
	TurnResult string
	Recover    bool
}

type runnableTask struct {
	ID         string              `json:"id"`
	Path       string              `json:"path"`
	Title      string              `json:"title"`
	Generation int                 `json:"generation"`
	State      string              `json:"state"`
	Ready      bool                `json:"ready"`
	Reason     string              `json:"reason"`
	Prompt     string              `json:"prompt,omitempty"`
	AgentID    string              `json:"agentId,omitempty"`
	After      []TaskRunDependency `json:"after,omitempty"`
}

func runTaskRun(args []string) error {
	if len(args) == 0 {
		return errors.New("task run requires a subcommand")
	}
	command := args[0]
	opts, err := parseTaskRunCommandArgs(command, args[1:])
	if err != nil {
		return err
	}
	switch command {
	case "configure":
		return taskRunConfigure(opts)
	case "queue":
		return taskRunQueue(opts)
	case "start":
		return taskRunStart(opts)
	case "complete", "wait", "pause", "fail":
		return taskRunRequestAction(command, opts)
	case "settle":
		return taskRunSettle(opts)
	default:
		return fmt.Errorf("unknown task run subcommand %q", command)
	}
}

func taskRunUsage(command string) string {
	switch command {
	case "configure":
		return "usage: forge task run configure [--project=<project>] [--task=<task>] --mode=non-interactive [--agent=<agent>] [--prompt=<prompt>] [--after=<task>...]"
	case "queue":
		return "usage: forge task run queue [--project=<project>] [--task=<task>] [--agent=<agent>] [--prompt=<prompt>] [--after=<task>...]"
	case "start":
		return "usage: forge task run start [--project=<project>] [--task=<task>] --generation=<n> --session-id=<id> --executor=<name> [--recover-stale]"
	case "complete":
		return "usage: forge task run complete [--project=<project>] [--task=<task>] [--summary=<text>]"
	case "wait":
		return "usage: forge task run wait [--project=<project>] [--task=<task>] --after=<task> [--after=<task>...] [--summary=<text>]"
	case "pause", "fail":
		return fmt.Sprintf("usage: forge task run %s [--project=<project>] [--task=<task>] [--reason=<text>]", command)
	case "settle":
		return "usage: forge task run settle [--project=<project>] [--task=<task>] --generation=<n> --session-id=<id> --turn-result=completed|failed [--summary=<text>]"
	default:
		return "usage: forge task run <configure|queue|start|complete|wait|pause|fail|settle>"
	}
}

func parseTaskRunCommandArgs(command string, args []string) (taskRunCommandOptions, error) {
	var opts taskRunCommandOptions
	var project, task string
	usage := taskRunUsage(command)
	for i := 0; i < len(args); i++ {
		arg := args[i]
		name, value, hasValue := strings.Cut(strings.TrimPrefix(arg, "--"), "=")
		if !strings.HasPrefix(arg, "--") {
			return opts, errors.New(usage)
		}
		if !hasValue && name != "recover-stale" {
			if i+1 >= len(args) || strings.HasPrefix(args[i+1], "--") {
				return opts, errors.New(usage)
			}
			i++
			value = args[i]
		}
		value = strings.TrimSpace(value)
		switch name {
		case "project":
			project = value
		case "task":
			task = value
		case "mode":
			opts.Mode = strings.ReplaceAll(value, "-", "_")
		case "agent":
			opts.AgentID = value
		case "prompt":
			opts.Prompt = value
		case "after":
			opts.After = append(opts.After, value)
		case "generation":
			n, err := strconv.Atoi(value)
			if err != nil || n <= 0 {
				return opts, fmt.Errorf("generation must be a positive integer")
			}
			opts.Generation = n
		case "session-id":
			opts.SessionID = value
		case "executor":
			opts.Executor = value
		case "summary":
			opts.Summary = value
		case "reason":
			opts.Reason = value
		case "turn-result":
			opts.TurnResult = value
		case "recover-stale":
			opts.Recover = true
		default:
			return opts, errors.New(usage)
		}
	}
	var err error
	if task == "" {
		opts.TaskID, err = resolveTaskArg(nil, command)
	} else {
		projectID, normalizeErr := normalizeProjectArg(project)
		if normalizeErr != nil {
			return opts, normalizeErr
		}
		opts.TaskID, err = normalizeTaskArg(projectID, task)
	}
	if err != nil {
		return opts, err
	}
	return opts, nil
}

func taskRunConfigure(opts taskRunCommandOptions) error {
	if opts.Mode == "" {
		opts.Mode = taskRunModeNonInteractive
	}
	if opts.Mode != taskRunModeNonInteractive {
		return fmt.Errorf("unsupported task run mode %q", opts.Mode)
	}
	return updateTaskRun(opts.TaskID, func(root, dir string, task *Task) error {
		after, err := resolveTaskRunDependencies(root, task, opts.After)
		if err != nil {
			return err
		}
		now := time.Now().Format(time.RFC3339)
		task.Run = &TaskRun{Mode: opts.Mode, AgentID: opts.AgentID, Prompt: opts.Prompt, Generation: 1, State: taskRunStateQueued, After: after, UpdatedAt: now}
		if len(after) > 0 {
			task.Run.State = taskRunStateWaiting
		}
		return nil
	})
}

func taskRunQueue(opts taskRunCommandOptions) error {
	return updateTaskRun(opts.TaskID, func(root, dir string, task *Task) error {
		if task.Run == nil || task.Run.Mode != taskRunModeNonInteractive {
			return errors.New("task is not configured for non-interactive runs")
		}
		if task.Run.State == taskRunStateRunning && task.Run.Current != nil && sessionIDActive(root, task.Run.Current.SessionID) {
			return errors.New("cannot queue a task with a live run")
		}
		after, err := resolveTaskRunDependencies(root, task, opts.After)
		if err != nil {
			return err
		}
		task.Run.Generation++
		if opts.Prompt != "" {
			task.Run.Prompt = opts.Prompt
		}
		if opts.AgentID != "" {
			task.Run.AgentID = opts.AgentID
		}
		task.Run.After = after
		task.Run.Current = nil
		task.Run.NextAction = nil
		task.Run.LastResult = nil
		task.Run.State = taskRunStateQueued
		if len(after) > 0 {
			task.Run.State = taskRunStateWaiting
		}
		task.Run.UpdatedAt = time.Now().Format(time.RFC3339)
		return nil
	})
}

func taskRunStart(opts taskRunCommandOptions) error {
	if opts.Generation <= 0 || opts.SessionID == "" || opts.Executor == "" {
		return errors.New(taskRunUsage("start"))
	}
	return updateTaskRun(opts.TaskID, func(root, dir string, task *Task) error {
		if task.Run == nil || task.Run.Generation != opts.Generation {
			return errors.New("task run generation changed")
		}
		if !sessionControlsResource(root, opts.SessionID, task.ID) {
			return fmt.Errorf("session %s does not control %s", opts.SessionID, task.ID)
		}
		ready, reason := taskRunReady(root, *task)
		if !ready {
			if reason != "live_session" && !(opts.Recover && reason == "stale_execution") {
				return fmt.Errorf("task is not runnable: %s", reason)
			}
		}
		task.Run.State = taskRunStateRunning
		task.Run.Current = &TaskRunCurrent{SessionID: opts.SessionID, Executor: opts.Executor, StartedAt: time.Now().Format(time.RFC3339)}
		task.Run.NextAction = nil
		task.Run.UpdatedAt = time.Now().Format(time.RFC3339)
		return nil
	})
}

func taskRunRequestAction(action string, opts taskRunCommandOptions) error {
	sessionID := currentForgeSessionID(opts.SessionID)
	if sessionID == "" {
		return errors.New("FORGE_SESSION_ID or --session-id is required")
	}
	return updateTaskRun(opts.TaskID, func(root, dir string, task *Task) error {
		if task.Run == nil || task.Run.State != taskRunStateRunning || task.Run.Current == nil {
			return errors.New("task has no active non-interactive run")
		}
		if task.Run.Current.SessionID != sessionID || !sessionControlsResource(root, sessionID, task.ID) {
			return errors.New("current session does not own this task run")
		}
		next := &TaskRunNextAction{Type: action, RequestedBySessionID: sessionID, Summary: strings.TrimSpace(opts.Summary)}
		if next.Summary == "" {
			next.Summary = strings.TrimSpace(opts.Reason)
		}
		if action == "wait" {
			if len(opts.After) == 0 {
				return errors.New(taskRunUsage("wait"))
			}
			after, err := resolveTaskRunDependencies(root, task, opts.After)
			if err != nil {
				return err
			}
			next.After = after
		}
		task.Run.NextAction = next
		task.Run.UpdatedAt = time.Now().Format(time.RFC3339)
		return nil
	})
}

func taskRunSettle(opts taskRunCommandOptions) error {
	if opts.Generation <= 0 || opts.SessionID == "" || (opts.TurnResult != "completed" && opts.TurnResult != "failed") {
		return errors.New(taskRunUsage("settle"))
	}
	return updateTaskRun(opts.TaskID, func(root, dir string, task *Task) error {
		run := task.Run
		if run == nil || run.Generation != opts.Generation || run.State != taskRunStateRunning || run.Current == nil || run.Current.SessionID != opts.SessionID {
			return errors.New("task run is not owned by this session")
		}
		outcome := taskRunStateFailed
		summary := strings.TrimSpace(opts.Summary)
		if opts.TurnResult == "completed" {
			if run.NextAction == nil {
				outcome = taskRunStatePaused
				if summary == "" {
					summary = "missing_next_action"
				}
			} else {
				if run.NextAction.RequestedBySessionID != opts.SessionID {
					return errors.New("task run next action belongs to another session")
				}
				summary = run.NextAction.Summary
				switch run.NextAction.Type {
				case "complete":
					outcome = taskRunStateCompleted
				case "wait":
					outcome = taskRunStateWaiting
					run.After = run.NextAction.After
				case "pause":
					outcome = taskRunStatePaused
				case "fail":
					outcome = taskRunStateFailed
				default:
					return fmt.Errorf("unknown next action %q", run.NextAction.Type)
				}
			}
		}
		now := time.Now().Format(time.RFC3339)
		result := TaskRunResult{Generation: run.Generation, Outcome: outcome, Summary: summary, FinishedAt: now}
		run.State = outcome
		run.Current = nil
		run.NextAction = nil
		run.LastResult = &result
		if outcome != taskRunStateWaiting {
			run.History = append(run.History, result)
		}
		run.UpdatedAt = now
		title := "Non-interactive task run " + outcome
		return prependLogEntry(dir, newLogEntry(title, summary))
	})
}

func updateTaskRun(taskID string, update func(root, dir string, task *Task) error) error {
	root, err := findWorkspaceRoot()
	if err != nil {
		return err
	}
	dir, task, err := loadOpenTask(root, taskID)
	if err != nil {
		return err
	}
	lockDir := filepath.Join(dir, ".forge")
	if err := os.MkdirAll(lockDir, 0o755); err != nil {
		return err
	}
	lockPath := filepath.Join(lockDir, "task-run.lock")
	lock, err := os.OpenFile(lockPath, os.O_CREATE|os.O_RDWR, 0o644)
	if err != nil {
		return err
	}
	defer lock.Close()
	if err := syscall.Flock(int(lock.Fd()), syscall.LOCK_EX); err != nil {
		return err
	}
	defer syscall.Flock(int(lock.Fd()), syscall.LOCK_UN)
	if err := readResourceAtDir(dir, &task); err != nil {
		return err
	}
	if err := update(root, dir, &task); err != nil {
		return err
	}
	task.UpdatedAt = time.Now().Format(time.RFC3339)
	if err := writeResourceMetadata(dir, task); err != nil {
		return err
	}
	return printTaskJSON(task)
}

func resolveTaskRunDependencies(root string, current *Task, values []string) ([]TaskRunDependency, error) {
	deps := make([]TaskRunDependency, 0, len(values))
	seen := map[string]bool{}
	for _, raw := range values {
		raw = strings.TrimSpace(raw)
		if raw == "" {
			return nil, errors.New("after task cannot be empty")
		}
		id, generationText, hasGeneration := strings.Cut(raw, "@")
		id = strings.TrimSpace(id)
		if !strings.Contains(id, ".task") {
			projectID := ""
			if current.Parent != nil {
				projectID = *current.Parent
			}
			var err error
			id, err = normalizeTaskArg(projectID, id)
			if err != nil {
				return nil, err
			}
		}
		_, depTask, err := loadTask(root, id)
		if err != nil {
			return nil, err
		}
		if depTask.ID == current.ID {
			return nil, errors.New("task cannot wait for itself")
		}
		if taskRunDependencyReaches(root, depTask, current.ID, map[string]bool{}) {
			return nil, fmt.Errorf("task run dependency cycle: %s reaches %s", depTask.ID, current.ID)
		}
		generation := 0
		if hasGeneration {
			generation, err = strconv.Atoi(generationText)
			if err != nil || generation <= 0 {
				return nil, fmt.Errorf("invalid dependency generation %q", raw)
			}
		} else if depTask.Run != nil {
			generation = depTask.Run.Generation
		}
		if depTask.Run == nil || generation <= 0 {
			return nil, fmt.Errorf("dependency task has no non-interactive run: %s", id)
		}
		key := fmt.Sprintf("%s@%d", id, generation)
		if !seen[key] {
			seen[key] = true
			deps = append(deps, TaskRunDependency{TaskID: id, Generation: generation})
		}
	}
	return deps, nil
}

func taskRunDependencyReaches(root string, task Task, targetID string, seen map[string]bool) bool {
	if task.ID == targetID {
		return true
	}
	if seen[task.ID] || task.Run == nil {
		return false
	}
	seen[task.ID] = true
	deps := append([]TaskRunDependency(nil), task.Run.After...)
	if task.Run.NextAction != nil && task.Run.NextAction.Type == "wait" {
		deps = append(deps, task.Run.NextAction.After...)
	}
	for _, dep := range deps {
		_, next, err := loadTask(root, dep.TaskID)
		if err == nil && taskRunDependencyReaches(root, next, targetID, seen) {
			return true
		}
	}
	return false
}

func taskRunReady(root string, task Task) (bool, string) {
	if task.Run == nil || task.Run.Mode != taskRunModeNonInteractive {
		return false, "not_non_interactive"
	}
	if task.Run.State == taskRunStateRunning {
		if task.Run.Current != nil && sessionIDActive(root, task.Run.Current.SessionID) {
			return false, "live_session"
		}
		if taskHasLiveSession(root, task.ID) {
			return false, "live_session"
		}
		return true, "stale_execution"
	}
	if task.Run.State != taskRunStateQueued && task.Run.State != taskRunStateWaiting {
		return false, task.Run.State
	}
	for _, dep := range task.Run.After {
		_, depTask, err := loadTask(root, dep.TaskID)
		if err != nil || !taskGenerationCompleted(depTask, dep.Generation) {
			return false, "waiting_prerequisite"
		}
	}
	if taskHasLiveSession(root, task.ID) {
		return false, "live_session"
	}
	if task.Run.State == taskRunStateWaiting {
		return true, "prerequisites_completed"
	}
	return true, "queued"
}

func taskGenerationCompleted(task Task, generation int) bool {
	if task.Run == nil {
		return false
	}
	if task.Run.Generation == generation && task.Run.State == taskRunStateCompleted {
		return true
	}
	for _, result := range task.Run.History {
		if result.Generation == generation && result.Outcome == taskRunStateCompleted {
			return true
		}
	}
	return false
}

func taskHasLiveSession(root, taskID string) bool {
	store, err := readSessionStore(root)
	if err != nil {
		return false
	}
	pruneStaleSessions(&store)
	for _, session := range store.Sessions {
		for _, control := range session.Controls {
			if control.ResourceID == taskID {
				return true
			}
		}
	}
	return false
}

func sessionIDActive(root, sessionID string) bool {
	store, err := readSessionStore(root)
	if err != nil {
		return false
	}
	pruneStaleSessions(&store)
	return findSessionIndex(store.Sessions, sessionID) >= 0
}

func sessionControlsResource(root, sessionID, taskID string) bool {
	store, err := readSessionStore(root)
	if err != nil {
		return false
	}
	pruneStaleSessions(&store)
	index := findSessionIndex(store.Sessions, sessionID)
	if index < 0 {
		return false
	}
	for _, control := range store.Sessions[index].Controls {
		if control.ResourceID == taskID {
			return true
		}
	}
	return false
}

func currentForgeSessionID(explicit string) string {
	if strings.TrimSpace(explicit) != "" {
		return strings.TrimSpace(explicit)
	}
	if value := strings.TrimSpace(os.Getenv("FORGE_SESSION_ID")); value != "" {
		return value
	}
	data, err := os.ReadFile(filepath.Join(".forge", "codex-session.json"))
	if err != nil {
		return ""
	}
	var context struct {
		ForgeSessionID string `json:"forgeSessionId"`
	}
	if json.Unmarshal(data, &context) != nil {
		return ""
	}
	return strings.TrimSpace(context.ForgeSessionID)
}
