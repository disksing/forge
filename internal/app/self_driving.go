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
	selfDrivingStateQueued        = "queued"
	selfDrivingStateRunning       = "running"
	selfDrivingStateSuspended     = "suspended"
	selfDrivingStatePaused        = "paused"
	selfDrivingStateCompleted     = "completed"
	selfDrivingStateFailed        = "failed"
	selfDrivingStateCancelled     = "cancelled"
	selfDrivingSuspensionLimit    = 30 * time.Minute
	selfDrivingSuspensionFallback = "Re-check whether the blocking condition has changed"
)

type selfDrivingCommandOptions struct {
	TaskID                 string
	AgentName              string
	AgentNameSet           bool
	PreferredAgentProfiles []string
	Prompt                 string
	PromptSet              bool
	CompletionCriteria     string
	CompletionCriteriaSet  bool
	Summary                string
	WakeCondition          string
	Reason                 string
	ExpectedGeneration     int
	ExpectedState          string
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
	WakeCondition          string   `json:"wakeCondition,omitempty"`
	SuspendedAt            string   `json:"suspendedAt,omitempty"`
	SuspensionSummary      string   `json:"suspensionSummary,omitempty"`
}

func runTaskSelfDriving(args []string) error {
	if len(args) == 0 {
		return errors.New(selfDrivingUsage(""))
	}
	command := args[0]
	opts, err := parseSelfDrivingCommandArgs(command, args[1:])
	if err != nil {
		return err
	}
	switch command {
	case "queue":
		return selfDrivingQueue(opts)
	case "start":
		return selfDrivingStart(opts)
	case "retry":
		return selfDrivingRetry(opts)
	case "resume":
		return selfDrivingResume(opts)
	case "complete", "suspend", "pause", "fail", "cancel":
		return selfDrivingAction(command, opts)
	default:
		return fmt.Errorf("unknown task self-driving subcommand %q", command)
	}
}

func selfDrivingUsage(command string) string {
	base := "usage: forge task self-driving "
	switch command {
	case "queue":
		return base + "queue [--project=<project>] [--task=<task>] [--agent=<agent>] [--agent-profile=<profile>...] [--prompt=<prompt>] [--completion-criteria=<text>]"
	case "start", "resume":
		return base + command + " [--project=<project>] [--task=<task>]"
	case "complete":
		return base + "complete [--project=<project>] [--task=<task>] [--summary=<text>]"
	case "suspend":
		return base + "suspend [--project=<project>] [--task=<task>] [--summary=<text>] [--wake-condition=<text>] [--reason=<text>] [--expected-generation=<n>] [--expected-state=<state>]"
	case "cancel":
		return base + "cancel [--project=<project>] [--task=<task>] [--reason=<text>] [--expected-generation=<n>] [--expected-state=<state>]"
	case "pause", "fail":
		return base + command + " [--project=<project>] [--task=<task>] [--reason=<text>] [--expected-generation=<n>] [--expected-state=<state>]"
	case "retry":
		return base + "retry [--project=<project>] [--task=<task>] [--reason=<text>] [--expected-generation=<n>] [--expected-state=<state>]"
	default:
		return base + "<queue|start|retry|suspend|pause|resume|complete|fail|cancel>"
	}
}

func parseSelfDrivingCommandArgs(command string, args []string) (selfDrivingCommandOptions, error) {
	var opts selfDrivingCommandOptions
	var project, task string
	usage := selfDrivingUsage(command)
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
		case "wake-condition":
			opts.WakeCondition = value
		case "expected-generation":
			generation, parseErr := strconv.Atoi(value)
			if parseErr != nil || generation <= 0 {
				return opts, fmt.Errorf("expected generation must be a positive integer")
			}
			opts.ExpectedGeneration = generation
		case "expected-state":
			opts.ExpectedState = value
		default:
			return opts, errors.New(usage)
		}
	}
	var err error
	if task == "" {
		opts.TaskID, err = resolveTaskArg(nil, "self-driving "+command)
	} else {
		projectID, normalizeErr := normalizeProjectArg(project)
		if normalizeErr != nil {
			return opts, normalizeErr
		}
		opts.TaskID, err = normalizeTaskArg(projectID, task)
	}
	return opts, err
}

func selfDrivingQueue(opts selfDrivingCommandOptions) error {
	return updateSelfDriving(opts.TaskID, func(_ string, dir string, task *Task) error {
		generation := 1
		prompt := opts.Prompt
		agentName := opts.AgentName
		completionCriteria := opts.CompletionCriteria
		preferredAgentProfiles, err := normalizeAgentProfiles(opts.PreferredAgentProfiles)
		if err != nil {
			return err
		}
		if task.SelfDriving != nil {
			if task.SelfDriving.State != selfDrivingStateCompleted && task.SelfDriving.State != selfDrivingStateFailed && task.SelfDriving.State != selfDrivingStateCancelled {
				return fmt.Errorf("cannot queue Self-Driving in %s state", task.SelfDriving.State)
			}
			generation = task.SelfDriving.Generation + 1
			if len(preferredAgentProfiles) == 0 {
				preferredAgentProfiles = append([]string(nil), task.SelfDriving.PreferredAgentProfiles...)
			}
			if !opts.AgentNameSet && agentName == "" {
				agentName = task.SelfDriving.AgentName
			}
			if !opts.PromptSet && prompt == "" {
				prompt = task.SelfDriving.Prompt
			}
			if !opts.CompletionCriteriaSet && completionCriteria == "" {
				completionCriteria = task.SelfDriving.CompletionCriteria
			}
		}
		task.SelfDriving = &SelfDriving{
			Generation: generation, State: selfDrivingStateQueued, AgentName: strings.TrimSpace(agentName),
			PreferredAgentProfiles: preferredAgentProfiles, Prompt: strings.TrimSpace(prompt),
			CompletionCriteria: strings.TrimSpace(completionCriteria),
		}
		return prependLogEntry(dir, newSelfDrivingLogEntry("Self-Driving queued", "", generation))
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

func selfDrivingStart(opts selfDrivingCommandOptions) error {
	return updateSelfDriving(opts.TaskID, func(_ string, dir string, task *Task) error {
		if task.SelfDriving != nil && task.SelfDriving.State == selfDrivingStateRunning {
			task.SelfDriving.SuspendedAt = ""
			return nil
		}
		if task.SelfDriving == nil || task.SelfDriving.State != selfDrivingStateQueued {
			return errors.New("Self-Driving is not queued")
		}
		task.SelfDriving.SuspendedAt = ""
		task.SelfDriving.State = selfDrivingStateRunning
		task.SelfDriving.StatusReason = ""
		return prependLogEntry(dir, newSelfDrivingLogEntry("Self-Driving started", "", task.SelfDriving.Generation))
	})
}

func selfDrivingRetry(opts selfDrivingCommandOptions) error {
	return updateSelfDriving(opts.TaskID, func(_ string, dir string, task *Task) error {
		if task.SelfDriving == nil || task.SelfDriving.State != selfDrivingStateRunning {
			return errors.New("Self-Driving is not running")
		}
		task.SelfDriving.SuspendedAt = ""
		generation := task.SelfDriving.Generation
		entries, err := readLogEntries(dir)
		if err != nil {
			return err
		}
		retries := 0
		for _, entry := range entries {
			if !entry.SelfDriving || entry.SelfDrivingGeneration != generation {
				continue
			}
			if entry.Title == "Self-Driving started" {
				break
			}
			if entry.Title == "Self-Driving retry" {
				retries++
			}
		}
		details := strings.TrimSpace(opts.Reason)
		task.SelfDriving.StatusReason = details
		if err := prependLogEntry(dir, newSelfDrivingLogEntry("Self-Driving retry", details, generation)); err != nil {
			return err
		}
		if retries+1 >= 3 {
			task.SelfDriving.State = selfDrivingStatePaused
			task.SelfDriving.StatusReason = "retry limit reached"
			return prependLogEntry(dir, newSelfDrivingLogEntry("Self-Driving paused", "retry limit reached", generation))
		}
		return nil
	})
}

func selfDrivingResume(opts selfDrivingCommandOptions) error {
	return updateSelfDriving(opts.TaskID, func(_ string, dir string, task *Task) error {
		if task.SelfDriving == nil || (task.SelfDriving.State != selfDrivingStatePaused && task.SelfDriving.State != selfDrivingStateSuspended) {
			return errors.New("Self-Driving is not paused or suspended")
		}
		task.SelfDriving.State = selfDrivingStateQueued
		task.SelfDriving.SuspendedAt = ""
		task.SelfDriving.StatusReason = ""
		// SuspensionSummary is intentionally preserved so a woken agent can
		// re-check the recorded reason before continuing or suspending again.
		return prependLogEntry(dir, newSelfDrivingLogEntry("Self-Driving queued", "resumed", task.SelfDriving.Generation))
	})
}

func selfDrivingAction(action string, opts selfDrivingCommandOptions) error {
	return updateSelfDriving(opts.TaskID, func(_ string, dir string, task *Task) error {
		if task.SelfDriving == nil {
			return errors.New("task has no Self-Driving")
		}
		if opts.ExpectedGeneration > 0 && task.SelfDriving.Generation != opts.ExpectedGeneration {
			return fmt.Errorf("Self-Driving generation changed from %d to %d", opts.ExpectedGeneration, task.SelfDriving.Generation)
		}
		if action == "cancel" && task.SelfDriving.State == selfDrivingStateCancelled {
			return nil
		}
		if expectedState := strings.TrimSpace(opts.ExpectedState); expectedState != "" && task.SelfDriving.State != expectedState {
			return fmt.Errorf("Self-Driving state changed from %q to %q", expectedState, task.SelfDriving.State)
		}
		if action == "cancel" && (task.SelfDriving.State == selfDrivingStateCompleted || task.SelfDriving.State == selfDrivingStateFailed) {
			return fmt.Errorf("cannot cancel Self-Driving in %s state", task.SelfDriving.State)
		}
		details := strings.TrimSpace(opts.Summary)
		if details == "" {
			details = strings.TrimSpace(opts.Reason)
		}
		title := ""
		switch action {
		case "complete":
			task.SelfDriving.State = selfDrivingStateCompleted
			task.SelfDriving.SuspendedAt = ""
			task.SelfDriving.StatusReason = ""
			title = "Self-Driving completed"
		case "fail":
			task.SelfDriving.State = selfDrivingStateFailed
			task.SelfDriving.SuspendedAt = ""
			task.SelfDriving.StatusReason = details
			title = "Self-Driving failed"
		case "pause":
			task.SelfDriving.State = selfDrivingStatePaused
			task.SelfDriving.SuspendedAt = ""
			task.SelfDriving.StatusReason = details
			title = "Self-Driving paused"
		case "suspend":
			task.SelfDriving.State = selfDrivingStateSuspended
			task.SelfDriving.SuspendedAt = time.Now().Format(time.RFC3339)
			if details == "" {
				details = selfDrivingSuspensionFallback
			}
			task.SelfDriving.SuspensionSummary = details
			task.SelfDriving.WakeCondition = strings.TrimSpace(opts.WakeCondition)
			fallback := task.SelfDriving.WakeCondition == ""
			if fallback {
				task.SelfDriving.WakeCondition = details
			}
			task.SelfDriving.StatusReason = details
			task.SelfDriving.WakeConditionFallback = fallback
			title = "Self-Driving suspended"
			return prependLogEntry(dir, newSelfDrivingSuspensionLogEntry(title, details, task.SelfDriving.WakeCondition, fallback, task.SelfDriving.Generation))
		case "cancel":
			task.SelfDriving.State = selfDrivingStateCancelled
			task.SelfDriving.SuspendedAt = ""
			if details == "" {
				details = "Self-Driving cancelled by user"
			}
			task.SelfDriving.StatusReason = details
			title = "Self-Driving cancelled"
		}
		return prependLogEntry(dir, newSelfDrivingLogEntry(title, details, task.SelfDriving.Generation))
	})
}

func updateSelfDriving(taskID string, update func(root, dir string, task *Task) error) error {
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
	lock, err := os.OpenFile(filepath.Join(lockDir, "self-driving.lock"), os.O_CREATE|os.O_RDWR, 0644)
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
