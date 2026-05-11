package forge

import (
	"errors"
	"fmt"
	"strings"
)

func Run(args []string) error {
	if len(args) == 0 {
		printUsage()
		return nil
	}

	switch args[0] {
	case "init":
		return runInit(args[1:])
	case "repo":
		return runRepo(args[1:])
	case "task":
		return runTask(args[1:])
	case "subtask":
		return runSubtask(args[1:])
	case "help", "-h", "--help":
		printUsage()
		return nil
	default:
		return fmt.Errorf("unknown command %q", args[0])
	}
}

func runRepo(args []string) error {
	if len(args) == 0 {
		return errors.New("repo requires a subcommand")
	}
	switch args[0] {
	case "add":
		return repoAdd(args[1:])
	case "list":
		if len(args) != 1 {
			return errors.New("usage: forge repo list")
		}
		return repoList()
	default:
		return fmt.Errorf("unknown repo subcommand %q", args[0])
	}
}

func runTask(args []string) error {
	if len(args) == 0 {
		return errors.New("task requires a subcommand")
	}
	switch args[0] {
	case "create":
		if len(args) < 2 {
			return errors.New("usage: forge task create <description>")
		}
		return taskCreate(strings.Join(args[1:], " "))
	case "list":
		if len(args) != 1 {
			return errors.New("usage: forge task list")
		}
		return taskList()
	case "show":
		if len(args) != 2 {
			return errors.New("usage: forge task show <id>")
		}
		return taskShow(args[1])
	case "archive":
		if len(args) != 2 {
			return errors.New("usage: forge task archive <id>")
		}
		return taskArchive(args[1])
	case "repo":
		return runTaskRepo(args[1:])
	default:
		return fmt.Errorf("unknown task subcommand %q", args[0])
	}
}

func runTaskRepo(args []string) error {
	if len(args) == 0 {
		return errors.New("task repo requires a subcommand")
	}
	switch args[0] {
	case "add":
		return taskRepoAdd(args[1:])
	case "list":
		if len(args) != 2 {
			return errors.New("usage: forge task repo list <task-id>")
		}
		return taskRepoList(args[1])
	case "remove":
		if len(args) != 3 {
			return errors.New("usage: forge task repo remove <task-id> <repo-name>")
		}
		return taskRepoRemove(args[1], args[2])
	default:
		return fmt.Errorf("unknown task repo subcommand %q", args[0])
	}
}

func runSubtask(args []string) error {
	if len(args) == 0 {
		return errors.New("subtask requires a subcommand")
	}
	switch args[0] {
	case "create":
		if len(args) < 3 {
			return errors.New("usage: forge subtask create <task-id> <description>")
		}
		return subtaskCreate(args[1], strings.Join(args[2:], " "))
	case "list":
		if len(args) != 2 {
			return errors.New("usage: forge subtask list <task-id>")
		}
		return subtaskList(args[1])
	default:
		return fmt.Errorf("unknown subtask subcommand %q", args[0])
	}
}

func printUsage() {
	fmt.Println(`forge manages a local AgentWorkspace.

Usage:
  forge init
  forge repo add [--bare] <name> <url>
  forge repo list
  forge task create <description>
  forge task list
  forge task show <id>
  forge task archive <id>
  forge task repo add <task-id> <repo-name> [--worktree <path>] [--branch <branch>] [--target <branch>] [--base <branch>]
  forge task repo list <task-id>
  forge task repo remove <task-id> <repo-name>
  forge subtask create <task-id> <description>
  forge subtask list <task-id>

Commands:
  forge init
    Initialize the current directory as an AgentWorkspace. Creates forge.json,
    repos/, archive/, and a forge-managed block in AGENTS.md. Safe to rerun.

  forge repo add [--bare] <name> <url>
    Clone <url> into repos/<name> as a normal checkout by default. <name> may
    include path segments, for example disksing/forge. Use --bare to clone into
    repos/<name>.git as a bare repository.

  forge repo list
    List repositories known to the workspace.

  forge task create <description>
    Create the next top-level task directory, including task.json, task.md,
    work.md, log.md, artifacts/, worktree/, and task-local AGENTS.md.

  forge task list
    List open top-level tasks.

  forge task show <id>
    Print the task.json for a task or subtask as formatted JSON.

  forge task archive <id>
    Move an open task into its archive. Top-level tasks move to archive/taskN/.
    Subtasks move to their parent task's archive directory.

  forge task repo add <task-id> <repo-name> [--worktree <path>] [--branch <branch>] [--target <branch>] [--base <branch>]
    Add or update a repository entry in a task's task.json. By default, forge
    records repos/<repo-name> and <task>/worktree/<repo-leaf>. Optional flags
    let agents record the actual worktree path and branch metadata.

  forge task repo list <task-id>
    List repositories recorded in a task's task.json.

  forge task repo remove <task-id> <repo-name>
    Remove a repository entry from a task's task.json.

  forge subtask create <task-id> <description>
    Create the next direct child task directory under the parent task.

  forge subtask list <task-id>
    List direct subtasks of a task.`)
}
