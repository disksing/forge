package forge

import (
	"errors"
	"fmt"
	"io"
	"os"
	"strings"
)

type logAddOptions struct {
	projectID string
	task      string
	title     string
	details   string
}

type logListOptions struct {
	projectID string
	task      string
	json      bool
}

func runResourceLog(kind string, args []string) error {
	if len(args) == 0 {
		return fmt.Errorf("%s log requires a subcommand", kind)
	}
	switch args[0] {
	case "add":
		return resourceLogAdd(kind, args[1:])
	case "list":
		return resourceLogList(kind, args[1:])
	default:
		return fmt.Errorf("unknown %s log subcommand %q", kind, args[0])
	}
}

func resourceLogAdd(kind string, args []string) error {
	opts, err := parseLogAddArgs(kind, args)
	if err != nil {
		return err
	}
	return applicationLogAdd(kind, opts.projectID, opts.task, opts.title, opts.details)
}

func resourceLogList(kind string, args []string) error {
	opts, err := parseLogListArgs(kind, args)
	if err != nil {
		return err
	}
	return applicationLogList(kind, opts.projectID, opts.task, opts.json)
}

func parseLogAddArgs(kind string, args []string) (logAddOptions, error) {
	usage := logAddUsage(kind)
	var opts logAddOptions
	var title []string
	for i := 0; i < len(args); i++ {
		arg := args[i]
		switch {
		case strings.HasPrefix(arg, "--project="):
			value := strings.TrimPrefix(arg, "--project=")
			if value == "" {
				return logAddOptions{}, errors.New("project cannot be empty")
			}
			if opts.projectID != "" {
				return logAddOptions{}, errors.New(usage)
			}
			normalized, err := normalizeProjectArg(value)
			if err != nil {
				return logAddOptions{}, err
			}
			opts.projectID = normalized
		case arg == "--project":
			value, ok := nextLogArg(args, &i)
			if !ok || opts.projectID != "" {
				return logAddOptions{}, errors.New(usage)
			}
			normalized, err := normalizeProjectArg(value)
			if err != nil {
				return logAddOptions{}, err
			}
			opts.projectID = normalized
		case strings.HasPrefix(arg, "--task="):
			value := strings.TrimPrefix(arg, "--task=")
			if kind != "task" {
				return logAddOptions{}, fmt.Errorf("unknown project log add option %q", arg)
			}
			if value == "" {
				return logAddOptions{}, errors.New("task cannot be empty")
			}
			if opts.task != "" {
				return logAddOptions{}, errors.New(usage)
			}
			opts.task = value
		case arg == "--task":
			if kind != "task" {
				return logAddOptions{}, fmt.Errorf("unknown project log add option %q", arg)
			}
			value, ok := nextLogArg(args, &i)
			if !ok || opts.task != "" {
				return logAddOptions{}, errors.New(usage)
			}
			opts.task = value
		case strings.HasPrefix(arg, "--details="):
			value := strings.TrimPrefix(arg, "--details=")
			if opts.details != "" {
				return logAddOptions{}, errors.New(usage)
			}
			details, err := resolveLogDetails(value)
			if err != nil {
				return logAddOptions{}, err
			}
			opts.details = details
		case arg == "--details":
			value, ok := nextLogArg(args, &i)
			if !ok || opts.details != "" {
				return logAddOptions{}, errors.New(usage)
			}
			details, err := resolveLogDetails(value)
			if err != nil {
				return logAddOptions{}, err
			}
			opts.details = details
		case strings.HasPrefix(arg, "--"):
			return logAddOptions{}, fmt.Errorf("unknown %s log add option %q", kind, arg)
		default:
			title = append(title, arg)
		}
	}
	opts.title = strings.TrimSpace(strings.Join(title, " "))
	if opts.title == "" {
		return logAddOptions{}, errors.New(usage)
	}
	return opts, nil
}

func parseLogListArgs(kind string, args []string) (logListOptions, error) {
	usage := logListUsage(kind)
	var opts logListOptions
	for i := 0; i < len(args); i++ {
		arg := args[i]
		switch {
		case arg == "--json":
			if opts.json {
				return logListOptions{}, errors.New(usage)
			}
			opts.json = true
		case strings.HasPrefix(arg, "--project="):
			value := strings.TrimPrefix(arg, "--project=")
			if value == "" {
				return logListOptions{}, errors.New("project cannot be empty")
			}
			if opts.projectID != "" {
				return logListOptions{}, errors.New(usage)
			}
			normalized, err := normalizeProjectArg(value)
			if err != nil {
				return logListOptions{}, err
			}
			opts.projectID = normalized
		case arg == "--project":
			value, ok := nextLogArg(args, &i)
			if !ok || opts.projectID != "" {
				return logListOptions{}, errors.New(usage)
			}
			normalized, err := normalizeProjectArg(value)
			if err != nil {
				return logListOptions{}, err
			}
			opts.projectID = normalized
		case strings.HasPrefix(arg, "--task="):
			value := strings.TrimPrefix(arg, "--task=")
			if kind != "task" {
				return logListOptions{}, fmt.Errorf("unknown project log list option %q", arg)
			}
			if value == "" {
				return logListOptions{}, errors.New("task cannot be empty")
			}
			if opts.task != "" {
				return logListOptions{}, errors.New(usage)
			}
			opts.task = value
		case arg == "--task":
			if kind != "task" {
				return logListOptions{}, fmt.Errorf("unknown project log list option %q", arg)
			}
			value, ok := nextLogArg(args, &i)
			if !ok || opts.task != "" {
				return logListOptions{}, errors.New(usage)
			}
			opts.task = value
		default:
			return logListOptions{}, errors.New(usage)
		}
	}
	return opts, nil
}

func resolveLogDetails(value string) (string, error) {
	if value != "-" {
		return value, nil
	}
	data, err := io.ReadAll(os.Stdin)
	if err != nil {
		return "", err
	}
	return string(data), nil
}

func resolveLogResource(kind, projectID, task string) (string, error) {
	if kind == "project" {
		if task != "" {
			return "", errors.New("project log does not accept --task")
		}
		if projectID != "" {
			return projectID, nil
		}
		inferred, ok, err := inferCurrentProjectID()
		if err != nil {
			return "", err
		}
		if !ok {
			return "", errors.New("could not infer current project; use forge project log <subcommand> --project=<project>")
		}
		return inferred, nil
	}
	if task == "" {
		if projectID != "" {
			return "", errors.New("task log requires --task when --project is provided")
		}
		inferred, ok, err := inferCurrentTaskID()
		if err != nil {
			return "", err
		}
		if ok {
			return inferred, nil
		}
		return "", errors.New("could not infer current task; use forge task log <subcommand> --task=<task>")
	}
	return normalizeTaskArg(projectID, task)
}

func nextLogArg(args []string, index *int) (string, bool) {
	if *index+1 >= len(args) || strings.HasPrefix(args[*index+1], "--") {
		return "", false
	}
	*index = *index + 1
	return args[*index], true
}

func logAddUsage(kind string) string {
	if kind == "project" {
		return "usage: forge project log add [--project=<project>] [--details <text>|--details -] <title>"
	}
	return "usage: forge task log add [--project=<project>] [--task=<task>] [--details <text>|--details -] <title>"
}

func logListUsage(kind string) string {
	if kind == "project" {
		return "usage: forge project log list [--project=<project>] [--json]"
	}
	return "usage: forge task log list [--project=<project>] [--task=<task>] [--json]"
}
