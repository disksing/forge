package app

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"syscall"
	"time"
)

const (
	autoRunStateQueued     = "queued"
	autoRunStateRunning    = "running"
	autoRunStateSuspended  = "suspended"
	autoRunStatePaused     = "paused"
	autoRunStateCompleted  = "completed"
	autoRunStateFailed     = "failed"
	autoRunSuspensionLimit = 30 * time.Minute
)

type autoRunCommandOptions struct {
	TaskID                 string
	AgentName              string
	AgentNameSet           bool
	PreferredAgentProfiles []string
	Prompt                 string
	PromptSet              bool
	CompletionCriteria     string
	CompletionCriteriaSet  bool
	Summary                string
	Reason                 string
}

type runnableTask struct {
	ID                     string   `json:"id"`
	Path                   string   `json:"path"`
	Title                  string   `json:"title"`
	Generation             int      `json:"generation"`
	State                  string   `json:"state"`
	Ready                  bool     `json:"ready"`
	Reason                 string   `json:"reason"`
	AgentName              string   `json:"agentName,omitempty"`
	Prompt                 string   `json:"prompt,omitempty"`
	PreferredAgentProfiles []string `json:"preferredAgentProfiles,omitempty"`
	CompletionCriteria     string   `json:"completionCriteria,omitempty"`
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
	case "complete", "suspend", "pause", "fail":
		return autoRunAction(command, opts)
	default:
		return fmt.Errorf("unknown task autorun subcommand %q", command)
	}
}

func autoRunUsage(command string) string {
	base := "usage: forge task autorun "
	switch command {
	case "queue":
		return base + "queue [--project=<project>] [--task=<task>] [--agent=<agent>] [--agent-profile=<profile>...] [--prompt=<prompt>] [--completion-criteria=<text>]"
	case "start", "resume":
		return base + command + " [--project=<project>] [--task=<task>]"
	case "complete":
		return base + "complete [--project=<project>] [--task=<task>] [--summary=<text>]"
	case "suspend":
		return base + "suspend [--project=<project>] [--task=<task>] [--summary=<text>] [--reason=<text>]"
	case "pause", "fail":
		return base + command + " [--project=<project>] [--task=<task>] [--reason=<text>]"
	case "retry":
		return base + "retry [--project=<project>] [--task=<task>] [--reason=<text>]"
	default:
		return base + "<queue|start|retry|suspend|pause|resume|complete|fail>"
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
		case "agent":
			opts.AgentName = value
			opts.AgentNameSet = true
		case "agent-profile":
			opts.PreferredAgentProfiles = append(opts.PreferredAgentProfiles, value)
		case "prompt":
			opts.Prompt = value
			opts.PromptSet = true
		case "completion-criteria":
			opts.CompletionCriteria = value
			opts.CompletionCriteriaSet = true
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
	return updateAutoRun(opts.TaskID, func(_ string, dir string, task *Task) error {
		generation := 1
		prompt := opts.Prompt
		agentName := opts.AgentName
		completionCriteria := opts.CompletionCriteria
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
			if !opts.AgentNameSet && agentName == "" {
				agentName = task.AutoRun.AgentName
			}
			if !opts.PromptSet && prompt == "" {
				prompt = task.AutoRun.Prompt
			}
			if !opts.CompletionCriteriaSet && completionCriteria == "" {
				completionCriteria = task.AutoRun.CompletionCriteria
			}
		}
		task.AutoRun = &AutoRun{
			Generation: generation, State: autoRunStateQueued, AgentName: strings.TrimSpace(agentName),
			PreferredAgentProfiles: preferredAgentProfiles, Prompt: strings.TrimSpace(prompt),
			CompletionCriteria: strings.TrimSpace(completionCriteria),
		}
		return prependLogEntry(dir, newAutoRunLogEntry("Auto Run queued", "", generation))
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
	return updateAutoRun(opts.TaskID, func(_ string, dir string, task *Task) error {
		if task.AutoRun != nil && task.AutoRun.State == autoRunStateRunning {
			return nil
		}
		if task.AutoRun == nil || task.AutoRun.State != autoRunStateQueued {
			return errors.New("AutoRun is not queued")
		}
		task.AutoRun.State = autoRunStateRunning
		return prependLogEntry(dir, newAutoRunLogEntry("Auto Run started", "", task.AutoRun.Generation))
	})
}

func autoRunRetry(opts autoRunCommandOptions) error {
	return updateAutoRun(opts.TaskID, func(_ string, dir string, task *Task) error {
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
	return updateAutoRun(opts.TaskID, func(_ string, dir string, task *Task) error {
		if task.AutoRun == nil || (task.AutoRun.State != autoRunStatePaused && task.AutoRun.State != autoRunStateSuspended) {
			return errors.New("AutoRun is not paused or suspended")
		}
		task.AutoRun.State = autoRunStateQueued
		task.AutoRun.SuspendedAt = ""
		// SuspensionSummary is intentionally preserved so a woken agent can
		// re-check the recorded reason before continuing or suspending again.
		return prependLogEntry(dir, newAutoRunLogEntry("Auto Run queued", "resumed", task.AutoRun.Generation))
	})
}

func autoRunAction(action string, opts autoRunCommandOptions) error {
	return updateAutoRun(opts.TaskID, func(_ string, dir string, task *Task) error {
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
			title = "Auto Run completed"
		case "fail":
			task.AutoRun.State = autoRunStateFailed
			title = "Auto Run failed"
		case "pause":
			task.AutoRun.State = autoRunStatePaused
			if details != "" {
				task.AutoRun.SuspensionSummary = details
			}
			title = "Auto Run paused"
		case "suspend":
			task.AutoRun.State = autoRunStateSuspended
			task.AutoRun.SuspendedAt = time.Now().Format(time.RFC3339)
			task.AutoRun.SuspensionSummary = details
			title = "Auto Run suspended"
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
