package app

import (
	"errors"
	"fmt"
	"strings"
)

func normalizeProjectArg(project string) (string, error) {
	project = strings.TrimSpace(project)
	if project == "" {
		return "", nil
	}
	if topProjectName.MatchString(project) {
		return project, nil
	}
	if isASCIIInteger(project) {
		return "project" + project, nil
	}
	return "", fmt.Errorf("invalid project %q: use projectN or N", project)
}

func isASCIIInteger(value string) bool {
	if value == "" {
		return false
	}
	for _, r := range value {
		if r < '0' || r > '9' {
			return false
		}
	}
	return true
}

func resolveTaskArg(args []string, command string) (string, error) {
	var projectID, task string
	for i := 0; i < len(args); i++ {
		arg := args[i]
		switch {
		case strings.HasPrefix(arg, "--project="):
			if projectID != "" {
				return "", fmt.Errorf("usage: forge task %s [--project=<project>] [--task=<task>]", command)
			}
			var err error
			projectID, err = normalizeProjectArg(strings.TrimPrefix(arg, "--project="))
			if err != nil {
				return "", err
			}
		case strings.HasPrefix(arg, "--task="):
			if task != "" {
				return "", fmt.Errorf("usage: forge task %s [--project=<project>] [--task=<task>]", command)
			}
			task = strings.TrimPrefix(arg, "--task=")
		default:
			return "", fmt.Errorf("usage: forge task %s [--project=<project>] [--task=<task>]", command)
		}
	}
	if task == "" {
		inferred, ok, err := inferCurrentTaskID()
		if err != nil {
			return "", err
		}
		if !ok {
			return "", errors.New("could not infer current task")
		}
		return inferred, nil
	}
	return normalizeTaskArg(projectID, task)
}

func normalizeTaskArg(projectID, task string) (string, error) {
	task = strings.TrimSpace(task)
	if task == "" {
		return "", errors.New("task cannot be empty")
	}
	if strings.Contains(task, ".") {
		return "", fmt.Errorf("invalid task %q: use taskM or M", task)
	}
	if projectID == "" {
		inferred, ok, err := inferCurrentProjectID()
		if err != nil {
			return "", err
		}
		if !ok {
			return "", errors.New("could not infer current project; use --project=<project>")
		}
		projectID = inferred
	}
	if taskDirName.MatchString(task) {
		return projectID + "." + task, nil
	}
	if isASCIIInteger(task) {
		return projectID + ".task" + task, nil
	}
	return "", fmt.Errorf("invalid task %q: use taskM or M", task)
}
