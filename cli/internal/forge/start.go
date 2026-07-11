package forge

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/disksing/forge/internal/buildinfo"
)

const startUsage = "usage: forge-start [--project=<project>] [--task=<task>] [-- <agent command...>]"

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
		return errors.New("no agent command provided; use forge-start [--project=<project>] [--task=<task>] -- <command> or set agentCommand in forge.json")
	}
	var task Task
	var nonInteractive bool
	if err := readTaskAtDir(taskPath, &task); err == nil && task.Run != nil && task.Run.Mode == taskRunModeNonInteractive {
		ready, reason := taskRunReady(root, task)
		if !ready && reason != "stale_execution" {
			return fmt.Errorf("task is not runnable: %s", reason)
		}
		nonInteractive = true
		command = nonInteractiveStartCommand(command, task.Run.Prompt)
	}

	sessionID, err := createSession(root, SessionLiveness{Type: "pid", PID: os.Getpid()})
	if err != nil {
		return err
	}
	if _, err := lockSessionResource(root, sessionID, resourceID); err != nil {
		_, _ = endSession(root, sessionID)
		return err
	}
	if nonInteractive {
		if err := taskRunStart(taskRunCommandOptions{TaskID: resourceID, Generation: task.Run.Generation, SessionID: sessionID, Executor: "forge-start", Recover: task.Run.State == taskRunStateRunning}); err != nil {
			_, _ = endSession(root, sessionID)
			return err
		}
	}
	contextPath, err := writeStartSessionContext(taskPath, root, resourceID, sessionID, nonInteractive, task.Run)
	if err != nil {
		_, _ = endSession(root, sessionID)
		return err
	}
	defer removeStartSessionContext(contextPath, sessionID)

	runErr := runStartCommand(command, taskPath, sessionID, nonInteractive, task.Run)
	if nonInteractive {
		turnResult := "completed"
		summary := "forge-start command completed"
		if runErr != nil {
			turnResult = "failed"
			summary = runErr.Error()
		}
		settleErr := taskRunSettle(taskRunCommandOptions{TaskID: resourceID, Generation: task.Run.Generation, SessionID: sessionID, TurnResult: turnResult, Summary: summary})
		if runErr == nil && settleErr != nil {
			runErr = settleErr
		}
	}
	_, endErr := endSession(root, sessionID)
	if runErr != nil {
		return runErr
	}
	return endErr
}

func runStartCommand(command []string, taskPath, sessionID string, nonInteractive bool, run *TaskRun) error {
	mode := "interactive"
	if nonInteractive {
		mode = "non_interactive"
	}
	command = startCommandWithSessionContext(command, sessionID, mode, run)
	cmd := exec.Command(command[0], command[1:]...)
	cmd.Dir = taskPath
	cmd.Env = appendSessionEnv(os.Environ(), sessionID)
	cmd.Env = appendRunModeEnv(cmd.Env, mode, run)
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

// RunStart runs the standalone forge-start executor.
func RunStart(args []string) error {
	if len(args) == 1 && args[0] == "--version" {
		fmt.Print(buildinfo.Text("forge-start"))
		return nil
	}
	return startTask(args)
}

func nonInteractiveStartCommand(command []string, prompt string) []string {
	if len(command) == 0 || !isCodexCommand(command[0]) {
		return command
	}
	for _, arg := range command[1:] {
		if arg == "exec" {
			return append(append([]string(nil), command...), nonInteractivePrompt(prompt))
		}
	}
	result := append([]string(nil), command...)
	result = append(result, "exec", nonInteractivePrompt(prompt))
	return result
}

func nonInteractivePrompt(prompt string) string {
	return "Forge interaction mode: non_interactive. This is a single-turn run. Before ending, call exactly one of forge task run complete, forge task run wait, forge task run pause, or forge task run fail. Do not end the Forge session yourself.\n\nTask request:\n" + strings.TrimSpace(prompt)
}

func appendRunModeEnv(env []string, mode string, run *TaskRun) []string {
	filtered := make([]string, 0, len(env)+2)
	for _, entry := range env {
		if strings.HasPrefix(entry, "FORGE_INTERACTION_MODE=") || strings.HasPrefix(entry, "FORGE_TASK_RUN_GENERATION=") {
			continue
		}
		filtered = append(filtered, entry)
	}
	filtered = append(filtered, "FORGE_INTERACTION_MODE="+mode)
	if run != nil && mode == "non_interactive" {
		filtered = append(filtered, fmt.Sprintf("FORGE_TASK_RUN_GENERATION=%d", run.Generation))
		filtered = append(filtered, "FORGE_TASK_RUN_PROMPT="+run.Prompt)
	}
	return filtered
}

type startSessionContext struct {
	Version         int                `json:"version"`
	WorkspacePath   string             `json:"workspacePath"`
	ResourceID      string             `json:"resourceId"`
	ForgeSessionID  string             `json:"forgeSessionId"`
	Cwd             string             `json:"cwd"`
	InteractionMode string             `json:"interactionMode"`
	TaskRun         *forgeStartTaskRun `json:"taskRun,omitempty"`
}

type forgeStartTaskRun struct {
	Generation int    `json:"generation"`
	Executor   string `json:"executor"`
}

func writeStartSessionContext(taskPath, root, resourceID, sessionID string, nonInteractive bool, run *TaskRun) (string, error) {
	mode := "interactive"
	if nonInteractive {
		mode = "non_interactive"
	}
	context := startSessionContext{Version: 2, WorkspacePath: root, ResourceID: resourceID, ForgeSessionID: sessionID, Cwd: taskPath, InteractionMode: mode}
	if nonInteractive && run != nil {
		context.TaskRun = &forgeStartTaskRun{Generation: run.Generation, Executor: "forge-start"}
	}
	data, err := json.MarshalIndent(context, "", "  ")
	if err != nil {
		return "", err
	}
	data = append(data, '\n')
	dir := filepath.Join(taskPath, ".forge")
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return "", err
	}
	path := filepath.Join(dir, "codex-session.json")
	if err := os.WriteFile(path, data, 0o600); err != nil {
		return "", err
	}
	return path, nil
}

func removeStartSessionContext(path, sessionID string) {
	data, err := os.ReadFile(path)
	if err != nil {
		return
	}
	var context startSessionContext
	if json.Unmarshal(data, &context) != nil || context.ForgeSessionID != sessionID {
		return
	}
	_ = os.Remove(path)
}

func startCommandWithSessionContext(command []string, sessionID, mode string, run *TaskRun) []string {
	if len(command) == 0 || !isCodexCommand(command[0]) {
		return command
	}
	configs := []string{
		fmt.Sprintf("shell_environment_policy.set.FORGE_SESSION_ID=%q", sessionID),
		fmt.Sprintf("shell_environment_policy.set.FORGE_INTERACTION_MODE=%q", mode),
	}
	if run != nil && mode == "non_interactive" {
		configs = append(configs, fmt.Sprintf("shell_environment_policy.set.FORGE_TASK_RUN_GENERATION=%q", strconv.Itoa(run.Generation)))
	}
	withContext := make([]string, 0, len(command)+len(configs)*2)
	withContext = append(withContext, command[0])
	for _, config := range configs {
		withContext = append(withContext, "-c", config)
	}
	withContext = append(withContext, command[1:]...)
	return withContext
}

func isCodexCommand(command string) bool {
	return filepath.Base(strings.TrimSpace(command)) == "codex"
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
		return "", errors.New("could not infer current project or task; use forge-start --project=<project> [--task=<task>]")
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
