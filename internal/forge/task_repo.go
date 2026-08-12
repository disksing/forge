package forge

import (
	"fmt"
	"strings"
)

type taskRepoAddOptions struct {
	taskID       string
	name         string
	worktreePath string
	branch       string
	targetBranch string
	baseBranch   string
}

func taskRepoAdd(args []string) error {
	opts, err := parseTaskRepoAdd(args)
	if err != nil {
		return err
	}
	return applicationTaskRepoAdd(appTaskRepoInput(opts))
}

func parseTaskRepoAdd(args []string) (taskRepoAddOptions, error) {
	const usage = "usage: forge task repo add [--project=<project>] [--task=<task>] <repo-name> [--worktree <path>] [--branch <branch>] [--target <branch>] [--base <branch>]"
	opts := taskRepoAddOptions{}
	projectID, task, err := parseTaskSelectorAndApply(args, usage, func(arg string, next func() (string, bool)) error {
		if !strings.HasPrefix(arg, "--") {
			if opts.name != "" {
				return fmt.Errorf("unexpected positional argument %q", arg)
			}
			opts.name = arg
			return nil
		}
		value, ok := next()
		if !ok {
			return fmt.Errorf("%s requires a value", arg)
		}
		switch arg {
		case "--worktree":
			opts.worktreePath = value
		case "--branch":
			opts.branch = value
		case "--target":
			opts.targetBranch = value
		case "--base":
			opts.baseBranch = value
		default:
			return fmt.Errorf("unknown task repo add option %q", arg)
		}
		return nil
	})
	if err != nil {
		return taskRepoAddOptions{}, err
	}
	if opts.name == "" {
		return taskRepoAddOptions{}, fmt.Errorf(usage)
	}
	opts.taskID, err = resolveTaskSelector(projectID, task, "repo add")
	if err != nil {
		return taskRepoAddOptions{}, err
	}
	return opts, nil
}

func taskRepoList(args []string) error {
	taskID, err := parseTaskRepoTarget(args, "list")
	if err != nil {
		return err
	}
	return applicationTaskRepoList(taskID)
}

func taskRepoRemove(args []string) error {
	const usage = "usage: forge task repo remove [--project=<project>] [--task=<task>] <repo-name>"
	var name string
	projectID, task, err := parseTaskSelectorAndApply(args, usage, func(arg string, _ func() (string, bool)) error {
		if strings.HasPrefix(arg, "--") {
			return fmt.Errorf("unknown task repo remove option %q", arg)
		}
		if name != "" {
			return fmt.Errorf("unexpected positional argument %q", arg)
		}
		name = arg
		return nil
	})
	if err != nil {
		return err
	}
	if name == "" {
		return fmt.Errorf(usage)
	}
	taskID, err := resolveTaskSelector(projectID, task, "repo remove")
	if err != nil {
		return err
	}
	return applicationTaskRepoRemove(taskID, name)
}

func parseTaskRepoTarget(args []string, command string) (string, error) {
	usage := fmt.Sprintf("usage: forge task repo %s [--project=<project>] [--task=<task>]", command)
	projectID, task, err := parseTaskSelectorAndApply(args, usage, func(arg string, _ func() (string, bool)) error {
		return fmt.Errorf("unknown task repo %s option %q", command, arg)
	})
	if err != nil {
		return "", err
	}
	return resolveTaskSelector(projectID, task, "repo "+command)
}

func parseTaskSelectorAndApply(args []string, usage string, apply func(string, func() (string, bool)) error) (string, string, error) {
	var projectID string
	var task string
	for i := 0; i < len(args); i++ {
		arg := args[i]
		next := func() (string, bool) {
			if i+1 >= len(args) || strings.HasPrefix(args[i+1], "--") {
				return "", false
			}
			i++
			return args[i], true
		}
		switch {
		case strings.HasPrefix(arg, "--project="):
			value := strings.TrimPrefix(arg, "--project=")
			if value == "" {
				return "", "", fmt.Errorf("project cannot be empty")
			}
			if projectID != "" {
				return "", "", fmt.Errorf(usage)
			}
			normalized, err := normalizeProjectArg(value)
			if err != nil {
				return "", "", err
			}
			projectID = normalized
		case arg == "--project":
			value, ok := next()
			if !ok {
				return "", "", fmt.Errorf(usage)
			}
			if projectID != "" {
				return "", "", fmt.Errorf(usage)
			}
			normalized, err := normalizeProjectArg(value)
			if err != nil {
				return "", "", err
			}
			projectID = normalized
		case strings.HasPrefix(arg, "--task="):
			value := strings.TrimPrefix(arg, "--task=")
			if value == "" {
				return "", "", fmt.Errorf("task cannot be empty")
			}
			if task != "" {
				return "", "", fmt.Errorf(usage)
			}
			task = value
		case arg == "--task":
			value, ok := next()
			if !ok {
				return "", "", fmt.Errorf(usage)
			}
			if task != "" {
				return "", "", fmt.Errorf(usage)
			}
			task = value
		default:
			if err := apply(arg, next); err != nil {
				return "", "", err
			}
		}
	}
	return projectID, strings.TrimSpace(task), nil
}

func resolveTaskSelector(projectID, task, command string) (string, error) {
	if task == "" {
		inferred, ok, err := inferCurrentTaskID()
		if err != nil {
			return "", err
		}
		if !ok {
			return "", fmt.Errorf("could not infer current task; use forge task %s --task=<task>", command)
		}
		return inferred, nil
	}
	return normalizeTaskArg(projectID, task)
}
