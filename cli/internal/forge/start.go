package forge

import (
	"errors"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

const startUsage = "usage: forge start [--project=<project>] [--task=<task>] [-- <agent command...>]"

type exitCodeError struct {
	code int
}

func (err exitCodeError) Error() string {
	return fmt.Sprintf("command exited with status %d", err.code)
}

func (err exitCodeError) ExitCode() int {
	return err.code
}

type startOptions struct {
	Project string
	Task    string
	Command []string
}

func startTask(args []string) error {
	options, err := parseStartArgs(args)
	if err != nil {
		return err
	}

	root, err := findWorkspaceRoot()
	if err != nil {
		return err
	}
	resourceID, err := resolveStartResourceID(options)
	if err != nil {
		return err
	}
	taskPath, err := findTaskDir(root, resourceID)
	if err != nil {
		return err
	}

	command := options.Command
	if len(command) == 0 {
		config, err := readConfig(root)
		if err != nil {
			return err
		}
		command = []string(config.AgentCommand)
	}
	if len(command) == 0 {
		return errors.New("no agent command provided; use forge start [--project=<project>] [--task=<task>] -- <command> or set agentCommand in forge.json")
	}

	sessionID, err := createSession(root, SessionLiveness{Type: "pid", PID: os.Getpid()})
	if err != nil {
		return err
	}
	if _, err := lockSessionResource(root, sessionID, resourceID); err != nil {
		_, _ = endSession(root, sessionID)
		return err
	}

	runErr := runStartCommand(command, taskPath, sessionID)
	_, endErr := endSession(root, sessionID)
	if runErr != nil {
		return runErr
	}
	return endErr
}

func runStartCommand(command []string, taskPath, sessionID string) error {
	cmd := exec.Command(command[0], command[1:]...)
	cmd.Dir = taskPath
	cmd.Env = appendSessionEnv(os.Environ(), sessionID)
	cmd.Stdin = os.Stdin
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	if err := cmd.Start(); err != nil {
		return err
	}
	if err := cmd.Wait(); err != nil {
		var exitErr *exec.ExitError
		if errors.As(err, &exitErr) {
			return exitCodeError{code: exitErr.ExitCode()}
		}
		return err
	}
	return nil
}

func appendSessionEnv(env []string, sessionID string) []string {
	filtered := make([]string, 0, len(env)+1)
	for _, entry := range env {
		if strings.HasPrefix(entry, "FORGE_SESSION_ID=") {
			continue
		}
		filtered = append(filtered, entry)
	}
	return append(filtered, "FORGE_SESSION_ID="+sessionID)
}

func parseStartArgs(args []string) (startOptions, error) {
	var options startOptions
	for i := 0; i < len(args); i++ {
		arg := args[i]
		switch {
		case arg == "--":
			if i+1 >= len(args) {
				return startOptions{}, errors.New("agent command after -- cannot be empty")
			}
			options.Command = args[i+1:]
			return options, nil
		case strings.HasPrefix(arg, "--project="):
			value := strings.TrimSpace(strings.TrimPrefix(arg, "--project="))
			if value == "" || options.Project != "" {
				return startOptions{}, errors.New(startUsage)
			}
			options.Project = value
		case arg == "--project":
			value, ok := nextFlagValue(args, &i)
			if !ok || strings.TrimSpace(value) == "" || options.Project != "" {
				return startOptions{}, errors.New(startUsage)
			}
			options.Project = strings.TrimSpace(value)
		case strings.HasPrefix(arg, "--task="):
			value := strings.TrimSpace(strings.TrimPrefix(arg, "--task="))
			if value == "" || options.Task != "" {
				return startOptions{}, errors.New(startUsage)
			}
			options.Task = value
		case arg == "--task":
			value, ok := nextFlagValue(args, &i)
			if !ok || strings.TrimSpace(value) == "" || options.Task != "" {
				return startOptions{}, errors.New(startUsage)
			}
			options.Task = strings.TrimSpace(value)
		default:
			return startOptions{}, errors.New(startUsage)
		}
	}
	return options, nil
}

func resolveStartResourceID(options startOptions) (string, error) {
	if options.Project == "" && options.Task == "" {
		taskID, ok, err := inferCurrentTaskID()
		if err != nil {
			return "", err
		}
		if ok {
			return taskID, nil
		}
		projectID, ok, err := inferCurrentProjectID()
		if err != nil {
			return "", err
		}
		if ok {
			return projectID, nil
		}
		return "", errors.New("could not infer current project or task; use forge start --project=<project> [--task=<task>]")
	}

	projectID, err := normalizeProjectArg(options.Project)
	if err != nil {
		return "", err
	}
	if options.Task == "" {
		return projectID, nil
	}
	return normalizeTaskArg(projectID, options.Task)
}

func readConfig(root string) (Config, error) {
	var config Config
	if err := readJSON(filepath.Join(root, configFile), &config); err != nil {
		return Config{}, err
	}
	return config, nil
}
