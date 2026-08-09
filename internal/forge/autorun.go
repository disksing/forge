package forge

import (
	"errors"
	"fmt"
	"strconv"
	"strings"
)

const (
	autoRunStateQueued        = "queued"
	autoRunStateRunning       = "running"
	autoRunStateSuspended     = "suspended"
	autoRunStatePaused        = "paused"
	autoRunStateCompleted     = "completed"
	autoRunStateFailed        = "failed"
	autoRunStateCancelled     = "cancelled"
	autoRunSuspensionFallback = "Re-check whether the blocking condition has changed"
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
	case "complete", "suspend", "pause", "fail", "cancel":
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
		case "wake-condition":
			opts.WakeCondition = value
		case "reason":
			opts.Reason = value
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
	return applicationAutoRunQueue(opts)
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
	return applicationAutoRunStart(opts)
}

func autoRunRetry(opts autoRunCommandOptions) error {
	return applicationAutoRunRetry(opts)
}

func autoRunResume(opts autoRunCommandOptions) error {
	return applicationAutoRunResume(opts)
}

func autoRunAction(action string, opts autoRunCommandOptions) error {
	return applicationAutoRunAction(action, opts)
}
