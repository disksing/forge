package forge

import (
	"errors"
	"fmt"
	"strconv"
	"strings"

	"github.com/disksing/forge/internal/app"
)

type selfDrivingCommandOptions struct {
	TaskID                 string
	AgentName              string
	AgentNameSet           bool
	PreferredAgentProfiles []string
	ProfilesSet            bool
	Prompt                 string
	PromptSet              bool
	CompletionCriteria     string
	CompletionCriteriaSet  bool
	Summary                string
	WakeCondition          string
	Reason                 string
	ExpectedRevision       int
}

type runnableTask struct {
	ID                     string                      `json:"id"`
	Path                   string                      `json:"path"`
	Title                  string                      `json:"title"`
	Revision               int                         `json:"revision"`
	Condition              string                      `json:"condition"`
	Ready                  bool                        `json:"ready"`
	Reason                 string                      `json:"reason"`
	AgentName              string                      `json:"agentName,omitempty"`
	Prompt                 string                      `json:"prompt,omitempty"`
	PreferredAgentProfiles []string                    `json:"preferredAgentProfiles,omitempty"`
	CompletionCriteria     string                      `json:"completionCriteria,omitempty"`
	WakeContext            *app.SelfDrivingWakeContext `json:"wakeContext,omitempty"`
}

func runTaskSelfDriving(args []string) error {
	if len(args) == 0 {
		return errors.New(selfDrivingUsage(""))
	}
	command := args[0]
	switch command {
	case "enable", "disable", "complete", "suspend", "pause", "fail":
	default:
		return fmt.Errorf("unknown task self-driving subcommand %q", command)
	}
	opts, err := parseSelfDrivingCommandArgs(command, args[1:])
	if err != nil {
		return err
	}
	switch command {
	case "enable":
		return applicationSelfDrivingEnable(opts)
	case "disable":
		return applicationSelfDrivingDisable(opts)
	case "complete", "suspend", "pause", "fail":
		return applicationSelfDrivingAction(command, opts)
	}
	return nil
}

func selfDrivingUsage(command string) string {
	base := "usage: forge task self-driving "
	switch command {
	case "enable":
		return base + "enable [--project=<project>] [--task=<task>] [--agent=<agent>] [--agent-profile=<profile>...] [--prompt=<prompt>] [--completion-criteria=<text>]"
	case "disable":
		return base + "disable [--project=<project>] [--task=<task>]"
	case "complete":
		return base + "complete [--project=<project>] [--task=<task>] --revision=<n> [--summary=<text>]"
	case "suspend":
		return base + "suspend [--project=<project>] [--task=<task>] --revision=<n> [--summary=<text>] [--wake-condition=<text>] [--reason=<text>]"
	case "pause", "fail":
		return base + command + " [--project=<project>] [--task=<task>] --revision=<n> [--reason=<text>]"
	default:
		return base + "<enable|disable|complete|suspend|pause|fail>"
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
			opts.AgentName, opts.AgentNameSet = value, true
		case "agent-profile":
			opts.PreferredAgentProfiles = append(opts.PreferredAgentProfiles, value)
			opts.ProfilesSet = true
		case "prompt":
			opts.Prompt, opts.PromptSet = value, true
		case "completion-criteria":
			opts.CompletionCriteria, opts.CompletionCriteriaSet = value, true
		case "summary":
			opts.Summary = value
		case "reason":
			opts.Reason = value
		case "wake-condition":
			opts.WakeCondition = value
		case "revision":
			revision, parseErr := strconv.Atoi(value)
			if parseErr != nil || revision <= 0 {
				return opts, errors.New("revision must be a positive integer")
			}
			opts.ExpectedRevision = revision
		default:
			return opts, errors.New(usage)
		}
	}
	if command != "enable" && command != "disable" && opts.ExpectedRevision <= 0 {
		return opts, errors.New(usage)
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
