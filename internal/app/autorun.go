package app

import (
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
	autoRunStateQueued    = "queued"
	autoRunStateRunning   = "running"
	autoRunStateWaiting   = "waiting"
	autoRunStatePaused    = "paused"
	autoRunStateCompleted = "completed"
	autoRunStateFailed    = "failed"
)

type autoRunCommandOptions struct {
	TaskID                 string
	PreferredAgentProfiles []string
	Prompt                 string
	After                  []string
	Summary                string
	Reason                 string
}

type runnableTask struct {
	ID                     string              `json:"id"`
	Path                   string              `json:"path"`
	Title                  string              `json:"title"`
	Generation             int                 `json:"generation"`
	State                  string              `json:"state"`
	Ready                  bool                `json:"ready"`
	Reason                 string              `json:"reason"`
	Prompt                 string              `json:"prompt,omitempty"`
	PreferredAgentProfiles []string            `json:"preferredAgentProfiles,omitempty"`
	After                  []AutoRunDependency `json:"after,omitempty"`
}

func runTaskAutoRun(args []string) error {
	if len(args) == 0 {
		return errors.New(autoRunUsage(""))
	}
	command := args[0]
	opts, err := parseAutoRunCommandArgs(command, args[1:])
	if err != nil {
		return err
	}
	switch command {
	case "queue":
		return autoRunQueue(opts)
	case "start":
		return autoRunStart(opts)
	case "retry":
		return autoRunRetry(opts)
	case "resume":
		return autoRunResume(opts)
	case "complete", "wait", "pause", "fail":
		return autoRunAction(command, opts)
	default:
		return fmt.Errorf("unknown task autorun subcommand %q", command)
	}
}

func autoRunUsage(command string) string {
	base := "usage: forge task autorun "
	switch command {
	case "queue":
		return base + "queue [--project=<project>] [--task=<task>] [--agent-profile=<profile>...] [--prompt=<prompt>] [--after=<task@generation>...]"
	case "start", "resume":
		return base + command + " [--project=<project>] [--task=<task>]"
	case "complete":
		return base + "complete [--project=<project>] [--task=<task>] [--summary=<text>]"
	case "wait":
		return base + "wait [--project=<project>] [--task=<task>] --after=<task@generation> [--after=<task@generation>...] [--summary=<text>]"
	case "pause", "fail":
		return base + command + " [--project=<project>] [--task=<task>] [--reason=<text>]"
	case "retry":
		return base + "retry [--project=<project>] [--task=<task>] [--reason=<text>]"
	default:
		return base + "<queue|start|retry|wait|pause|resume|complete|fail>"
	}
}

func parseAutoRunCommandArgs(command string, args []string) (autoRunCommandOptions, error) {
	var opts autoRunCommandOptions
	var project, task string
	usage := autoRunUsage(command)
	for i := 0; i < len(args); i++ {
		arg := args[i]
		if !strings.HasPrefix(arg, "--") {
			return opts, errors.New(usage)
		}
		name, value, hasValue := strings.Cut(strings.TrimPrefix(arg, "--"), "=")
		if !hasValue {
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
		case "agent-profile":
			opts.PreferredAgentProfiles = append(opts.PreferredAgentProfiles, value)
		case "prompt":
			opts.Prompt = value
		case "after":
			opts.After = append(opts.After, value)
		case "summary":
			opts.Summary = value
		case "reason":
			opts.Reason = value
		default:
			return opts, errors.New(usage)
		}
	}
	var err error
	if task == "" {
		opts.TaskID, err = resolveTaskArg(nil, "autorun "+command)
	} else {
		projectID, normalizeErr := normalizeProjectArg(project)
		if normalizeErr != nil {
			return opts, normalizeErr
		}
		opts.TaskID, err = normalizeTaskArg(projectID, task)
	}
	return opts, err
}

func autoRunQueue(opts autoRunCommandOptions) error {
	return updateAutoRun(opts.TaskID, func(root, dir string, task *Task) error {
		generation := 1
		prompt := opts.Prompt
		preferredAgentProfiles, err := normalizeAgentProfiles(opts.PreferredAgentProfiles)
		if err != nil {
			return err
		}
		if task.AutoRun != nil {
			if task.AutoRun.State != autoRunStateCompleted && task.AutoRun.State != autoRunStateFailed {
				return fmt.Errorf("cannot queue AutoRun in %s state", task.AutoRun.State)
			}
			generation = task.AutoRun.Generation + 1
			if len(preferredAgentProfiles) == 0 {
				preferredAgentProfiles = append([]string(nil), task.AutoRun.PreferredAgentProfiles...)
			}
			if prompt == "" {
				prompt = task.AutoRun.Prompt
			}
		}
		probe := *task
		probe.AutoRun = &AutoRun{Generation: generation}
		after, err := resolveAutoRunDependencies(root, &probe, opts.After)
		if err != nil {
			return err
		}
		state := autoRunStateQueued
		if len(after) > 0 {
			state = autoRunStateWaiting
		}
		task.AutoRun = &AutoRun{Generation: generation, State: state, PreferredAgentProfiles: preferredAgentProfiles, Prompt: prompt, After: after}
		if err := prependLogEntry(dir, newAutoRunLogEntry("Auto Run queued", "", generation)); err != nil {
			return err
		}
		if state == autoRunStateWaiting {
			return prependLogEntry(dir, newAutoRunLogEntry("Auto Run waiting", "waiting for prerequisites", generation))
		}
		return nil
	})
}

func normalizeAgentProfiles(values []string) ([]string, error) {
	normalized := make([]string, 0, len(values))
	seen := make(map[string]bool, len(values))
	for _, value := range values {
		profile := strings.ToLower(strings.TrimSpace(value))
		if profile == "" {
			return nil, errors.New("agent profile cannot be empty")
		}
		for _, r := range profile {
			if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') || r == '.' || r == '_' || r == '-' {
				continue
			}
			return nil, fmt.Errorf("invalid agent profile %q: use lowercase letters, numbers, '.', '_', or '-'", value)
		}
		if seen[profile] {
			continue
		}
		seen[profile] = true
		normalized = append(normalized, profile)
	}
	return normalized, nil
}

func autoRunStart(opts autoRunCommandOptions) error {
	return updateAutoRun(opts.TaskID, func(root, dir string, task *Task) error {
		if task.AutoRun != nil && task.AutoRun.State == autoRunStateRunning {
			return nil
		}
		if task.AutoRun == nil || task.AutoRun.State != autoRunStateQueued {
			return errors.New("AutoRun is not queued")
		}
		ready, reason := autoRunReady(root, *task)
		if !ready {
			return fmt.Errorf("AutoRun is not ready: %s", reason)
		}
		task.AutoRun.State = autoRunStateRunning
		task.AutoRun.After = nil
		return prependLogEntry(dir, newAutoRunLogEntry("Auto Run started", "", task.AutoRun.Generation))
	})
}

func autoRunRetry(opts autoRunCommandOptions) error {
	return updateAutoRun(opts.TaskID, func(root, dir string, task *Task) error {
		if task.AutoRun == nil || task.AutoRun.State != autoRunStateRunning {
			return errors.New("AutoRun is not running")
		}
		generation := task.AutoRun.Generation
		entries, err := readLogEntries(dir)
		if err != nil {
			return err
		}
		retries := 0
		for _, entry := range entries {
			if !entry.AutoRun || entry.AutoRunGeneration != generation {
				continue
			}
			if entry.Title == "Auto Run started" {
				break
			}
			if entry.Title == "Auto Run retry" {
				retries++
			}
		}
		details := strings.TrimSpace(opts.Reason)
		if err := prependLogEntry(dir, newAutoRunLogEntry("Auto Run retry", details, generation)); err != nil {
			return err
		}
		if retries+1 >= 3 {
			task.AutoRun.State = autoRunStatePaused
			return prependLogEntry(dir, newAutoRunLogEntry("Auto Run paused", "retry limit reached", generation))
		}
		return nil
	})
}

func autoRunResume(opts autoRunCommandOptions) error {
	return updateAutoRun(opts.TaskID, func(root, dir string, task *Task) error {
		if task.AutoRun == nil || (task.AutoRun.State != autoRunStatePaused && task.AutoRun.State != autoRunStateWaiting) {
			return errors.New("AutoRun is not paused or waiting")
		}
		details := "resumed"
		if task.AutoRun.State == autoRunStateWaiting {
			ready, reason := autoRunReady(root, *task)
			if !ready {
				return fmt.Errorf("AutoRun dependencies are not ready: %s", reason)
			}
			details = "prerequisites completed"
		}
		task.AutoRun.State = autoRunStateQueued
		task.AutoRun.After = nil
		return prependLogEntry(dir, newAutoRunLogEntry("Auto Run queued", details, task.AutoRun.Generation))
	})
}

func autoRunAction(action string, opts autoRunCommandOptions) error {
	return updateAutoRun(opts.TaskID, func(root, dir string, task *Task) error {
		if task.AutoRun == nil {
			return errors.New("task has no AutoRun")
		}
		details := strings.TrimSpace(opts.Summary)
		if details == "" {
			details = strings.TrimSpace(opts.Reason)
		}
		title := ""
		switch action {
		case "complete":
			task.AutoRun.State = autoRunStateCompleted
			task.AutoRun.After = nil
			title = "Auto Run completed"
		case "fail":
			task.AutoRun.State = autoRunStateFailed
			task.AutoRun.After = nil
			title = "Auto Run failed"
		case "pause":
			task.AutoRun.State = autoRunStatePaused
			task.AutoRun.After = nil
			title = "Auto Run paused"
		case "wait":
			if len(opts.After) == 0 {
				return errors.New(autoRunUsage("wait"))
			}
			after, err := resolveAutoRunDependencies(root, task, opts.After)
			if err != nil {
				return err
			}
			task.AutoRun.State = autoRunStateWaiting
			task.AutoRun.After = after
			title = "Auto Run waiting"
		}
		return prependLogEntry(dir, newAutoRunLogEntry(title, details, task.AutoRun.Generation))
	})
}

func updateAutoRun(taskID string, update func(root, dir string, task *Task) error) error {
	root, err := findWorkspaceRoot()
	if err != nil {
		return err
	}
	dir, task, err := loadOpenTask(root, taskID)
	if err != nil {
		return err
	}
	lockDir := filepath.Join(dir, ".forge")
	if err := os.MkdirAll(lockDir, 0755); err != nil {
		return err
	}
	lock, err := os.OpenFile(filepath.Join(lockDir, "autorun.lock"), os.O_CREATE|os.O_RDWR, 0644)
	if err != nil {
		return err
	}
	defer lock.Close()
	if err := syscall.Flock(int(lock.Fd()), syscall.LOCK_EX); err != nil {
		return err
	}
	defer syscall.Flock(int(lock.Fd()), syscall.LOCK_UN)
	if err := readTaskAtDir(dir, &task); err != nil {
		return err
	}
	if err := update(root, dir, &task); err != nil {
		return err
	}
	task.UpdatedAt = time.Now().Format(time.RFC3339)
	if err := writeResourceMetadata(dir, &task); err != nil {
		return err
	}
	return printTaskJSON(task)
}

func resolveAutoRunDependencies(root string, current *Task, values []string) ([]AutoRunDependency, error) {
	deps := make([]AutoRunDependency, 0, len(values))
	seen := map[string]bool{}
	currentGeneration := 1
	if current.AutoRun != nil && current.AutoRun.Generation > 0 {
		currentGeneration = current.AutoRun.Generation
	}
	for _, raw := range values {
		raw = strings.TrimSpace(raw)
		id, generationText, ok := strings.Cut(raw, "@")
		if !ok {
			return nil, fmt.Errorf("dependency must include generation: %s", raw)
		}
		if !strings.Contains(id, ".task") {
			var err error
			id, err = normalizeTaskArg(current.Parent, strings.TrimSpace(id))
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
		generation, err := strconv.Atoi(strings.TrimSpace(generationText))
		if err != nil || generation <= 0 {
			return nil, fmt.Errorf("invalid dependency generation %q", raw)
		}
		if depTask.AutoRun == nil {
			return nil, fmt.Errorf("dependency task has no AutoRun: %s", id)
		}
		if generation > depTask.AutoRun.Generation {
			return nil, fmt.Errorf("dependency generation does not exist: %s", raw)
		}
		if autoRunDependencyReaches(root, depTask, generation, current.ID, currentGeneration, map[string]bool{}) {
			return nil, fmt.Errorf("AutoRun dependency cycle: %s reaches %s", depTask.ID, current.ID)
		}
		key := fmt.Sprintf("%s@%d", id, generation)
		if !seen[key] {
			seen[key] = true
			deps = append(deps, AutoRunDependency{TaskID: id, Generation: generation})
		}
	}
	return deps, nil
}

func autoRunDependencyReaches(root string, task Task, generation int, target string, targetGeneration int, seen map[string]bool) bool {
	if task.ID == target && generation == targetGeneration {
		return true
	}
	key := fmt.Sprintf("%s@%d", task.ID, generation)
	if seen[key] || task.AutoRun == nil || task.AutoRun.Generation != generation {
		return false
	}
	seen[key] = true
	for _, dep := range task.AutoRun.After {
		_, next, err := loadTask(root, dep.TaskID)
		if err == nil && autoRunDependencyReaches(root, next, dep.Generation, target, targetGeneration, seen) {
			return true
		}
	}
	return false
}

func autoRunReady(root string, task Task) (bool, string) {
	if task.AutoRun == nil {
		return false, "no_autorun"
	}
	switch task.AutoRun.State {
	case autoRunStateRunning:
		return true, "running"
	case autoRunStateQueued:
		return true, "queued"
	case autoRunStateWaiting:
		for _, dep := range task.AutoRun.After {
			state := autoRunDependencyState(root, dep)
			if state == autoRunStateFailed {
				return false, "failed_prerequisite"
			}
			if state != autoRunStateCompleted {
				return false, "waiting_prerequisite"
			}
		}
		return true, "prerequisites_completed"
	default:
		return false, task.AutoRun.State
	}
}

func autoRunDependencyState(root string, dep AutoRunDependency) string {
	dir, task, err := loadTask(root, dep.TaskID)
	if err != nil {
		return "missing"
	}
	if task.AutoRun != nil && task.AutoRun.Generation == dep.Generation {
		return task.AutoRun.State
	}
	entries, err := readLogEntries(dir)
	if err != nil {
		return "missing"
	}
	for _, entry := range entries {
		if !entry.AutoRun || entry.AutoRunGeneration != dep.Generation {
			continue
		}
		switch entry.Title {
		case "Auto Run completed":
			return autoRunStateCompleted
		case "Auto Run failed":
			return autoRunStateFailed
		}
	}
	return "missing"
}
