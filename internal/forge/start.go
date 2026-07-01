package forge

import (
	"errors"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

type exitCodeError struct {
	code int
}

func (err exitCodeError) Error() string {
	return fmt.Sprintf("command exited with status %d", err.code)
}

func (err exitCodeError) ExitCode() int {
	return err.code
}

func startTask(args []string) error {
	taskID, command, err := parseStartArgs(args)
	if err != nil {
		return err
	}

	root, err := findWorkspaceRoot()
	if err != nil {
		return err
	}
	taskPath, err := findTaskDir(root, cleanID(taskID))
	if err != nil {
		return err
	}

	if len(command) == 0 {
		config, err := readConfig(root)
		if err != nil {
			return err
		}
		command = []string(config.AgentCommand)
	}
	if len(command) == 0 {
		return errors.New("no agent command provided; use forge start <task-id> -- <command> or set agentCommand in forge.json")
	}

	sessionID, err := createSession(root, SessionLiveness{Type: "pid", PID: os.Getpid()})
	if err != nil {
		return err
	}

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

func parseStartArgs(args []string) (string, []string, error) {
	if len(args) == 0 {
		return "", nil, errors.New("usage: forge start <task-id> [-- <agent command...>]")
	}
	if len(args) == 1 {
		return args[0], nil, nil
	}
	if args[1] != "--" {
		return "", nil, errors.New("usage: forge start <task-id> [-- <agent command...>]")
	}
	if len(args) == 2 {
		return "", nil, errors.New("agent command after -- cannot be empty")
	}
	return args[0], args[2:], nil
}

func readConfig(root string) (Config, error) {
	var config Config
	if err := readJSON(filepath.Join(root, configFile), &config); err != nil {
		return Config{}, err
	}
	return config, nil
}
