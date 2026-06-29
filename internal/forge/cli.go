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
	case "start":
		return startTask(args[1:])
	case "project":
		return runProject(args[1:])
	case "task":
		return runTask(args[1:])
	case "subtask":
		return runSubtask(args[1:])
	case "migrate":
		return runMigrate(args[1:])
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

func runProject(args []string) error {
	if len(args) == 0 {
		return errors.New("project requires a subcommand")
	}
	switch args[0] {
	case "create":
		if len(args) < 2 {
			return errors.New("usage: forge project create [--workflow=<name>] <description>")
		}
		workflow, explicitWorkflow, description, err := parseProjectCreateArgs(args[1:])
		if err != nil {
			return err
		}
		return projectCreate(description, workflow, !explicitWorkflow)
	case "list":
		options, err := parseProjectListArgs(args[1:])
		if err != nil {
			return err
		}
		return projectList(options)
	case "show":
		if len(args) != 2 {
			return errors.New("usage: forge project show <project-id>")
		}
		return taskShow(args[1])
	case "archive":
		if len(args) != 2 {
			return errors.New("usage: forge project archive <project-id>")
		}
		return taskArchive(args[1])
	case "repo":
		return runProjectRepo(args[1:])
	default:
		return fmt.Errorf("unknown project subcommand %q", args[0])
	}
}

func runTask(args []string) error {
	if len(args) == 0 {
		return errors.New("task requires a subcommand")
	}
	switch args[0] {
	case "create":
		if len(args) < 2 {
			return errors.New("usage: forge task create <project-id> <description>")
		}
		if looksLikeProjectID(args[1]) || strings.Contains(args[1], ".") {
			if len(args) < 3 {
				return errors.New("usage: forge task create <project-id> <description>")
			}
			return projectTaskCreate(args[1], strings.Join(args[2:], " "))
		}
		workflow, explicitWorkflow, description, err := parseProjectCreateArgs(args[1:])
		if err != nil {
			return err
		}
		return projectCreate(description, workflow, !explicitWorkflow)
	case "list":
		if len(args) > 1 && looksLikeProjectID(args[1]) {
			projectID, all, err := parseTaskListArgs(args[1:])
			if err != nil {
				return err
			}
			return projectTaskList(projectID, all)
		}
		options, err := parseProjectListArgs(args[1:])
		if err != nil {
			return err
		}
		return projectList(options)
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

func runProjectRepo(args []string) error {
	if len(args) == 0 {
		return errors.New("project repo requires a subcommand")
	}
	switch args[0] {
	case "add":
		return taskRepoAdd(args[1:])
	case "list":
		if len(args) != 2 {
			return errors.New("usage: forge project repo list <project-id>")
		}
		return taskRepoList(args[1])
	case "remove":
		if len(args) != 3 {
			return errors.New("usage: forge project repo remove <project-id> <repo-name>")
		}
		return taskRepoRemove(args[1], args[2])
	default:
		return fmt.Errorf("unknown project repo subcommand %q", args[0])
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
		return projectTaskCreate(args[1], strings.Join(args[2:], " "))
	case "list":
		parentID, all, err := parseSubtaskListArgs(args[1:])
		if err != nil {
			return err
		}
		return projectTaskList(parentID, all)
	default:
		return fmt.Errorf("unknown subtask subcommand %q", args[0])
	}
}

func runMigrate(args []string) error {
	if len(args) != 1 || args[0] != "project-tasks" {
		return errors.New("usage: forge migrate project-tasks")
	}
	return migrateProjectTasks()
}

func printUsage() {
	fmt.Println(`forge manages a local AgentWorkspace.

Usage:
  forge init [--reset-workflows]
  forge repo add [--bare] <name> <url>
  forge repo list
  forge start <resource-id> [-- <agent command...>]
  forge project create [--workflow=<name>] <description>
  forge project list [--all] [--tree]
  forge project show <project-id>
  forge project archive <project-id>
  forge project repo add <project-id> <repo-name> [--worktree <path>] [--branch <branch>] [--target <branch>] [--base <branch>]
  forge project repo list <project-id>
  forge project repo remove <project-id> <repo-name>
  forge task create <project-id> <description>
  forge task list <project-id> [--all]
  forge task show <id>
  forge task archive <id>
  forge task repo add <task-id> <repo-name> [--worktree <path>] [--branch <branch>] [--target <branch>] [--base <branch>]
  forge task repo list <task-id>
  forge task repo remove <task-id> <repo-name>
  forge migrate project-tasks

Commands:
  forge init [--reset-workflows]
    Initialize the current directory as an AgentWorkspace, or refresh the
    enclosing workspace when run inside an existing project/task. Creates
    forge.json, repos/, archive/, workflow/, and forge-managed AGENTS.md blocks.
    Safe to rerun. Use --reset-workflows to rewrite the built-in workflow files.

  forge repo add [--bare] <name> <url>
    Clone <url> into repos/<name> as a normal checkout by default. <name> may
    include path segments, for example disksing/forge. Use --bare to clone into
    repos/<name>.git as a bare repository.

  forge repo list
    List repositories known to the workspace.

  forge start <resource-id> [-- <agent command...>]
    Run an agent command in the project or task directory. Explicit command arguments
    after -- override the workspace forge.json agentCommand default.

  forge project create [--workflow=<name>] <description>
    Create the next top-level project directory, including task.json, task.md,
    work.md, log.md, artifacts/, worktree/, and task-local AGENTS.md. By
    default, AGENTS.md uses workflow/default.md for project workflow guidance.
    Use --workflow=<name> to select workflow/<name>.md.

  forge project list [--all] [--tree]
    List open projects. Use --all to include archived projects. Use --tree
    to include project tasks.

  forge task create <project-id> <description>
    Create the next task directory under the project.

  forge task list <project-id> [--all]
    List open tasks in a project. Use --all to include archived tasks.

  forge task show <id>
    Print the task.json for a project or task as formatted JSON.

  forge task archive <id>
    Move an open project or task into its archive. Projects move to archive/projectN/.
    Tasks move to their project archive directory.

  forge task repo add <task-id> <repo-name> [--worktree <path>] [--branch <branch>] [--target <branch>] [--base <branch>]
    Add or update a repository entry in a task's task.json. By default, forge
    records repos/<repo-name> and <task>/worktree/<repo-leaf>. Optional flags
    let agents record the actual worktree path and branch metadata.

  forge task repo list <task-id>
    List repositories recorded in a task's task.json.

  forge task repo remove <task-id> <repo-name>
    Remove a repository entry from a task's task.json.

  forge migrate project-tasks
    Rewrite an old task/subtask workspace into the two-level project/task layout.`)
}

func parseProjectCreateArgs(args []string) (string, bool, string, error) {
	workflow := defaultWorkflowName
	explicitWorkflow := false
	var description []string
	for _, arg := range args {
		if strings.HasPrefix(arg, "--workflow=") {
			value := strings.TrimPrefix(arg, "--workflow=")
			if value == "" {
				return "", false, "", errors.New("workflow cannot be empty")
			}
			workflow = value
			explicitWorkflow = true
			continue
		}
		if arg == "--workflow" || strings.HasPrefix(arg, "--workflow") {
			return "", false, "", errors.New("usage: forge project create [--workflow=<name>] <description>")
		}
		description = append(description, arg)
	}
	if len(description) == 0 {
		return "", false, "", errors.New("usage: forge project create [--workflow=<name>] <description>")
	}
	return workflow, explicitWorkflow, strings.Join(description, " "), nil
}

func parseProjectListArgs(args []string) (taskListOptions, error) {
	var options taskListOptions
	for _, arg := range args {
		switch arg {
		case "--all":
			if options.IncludeArchived {
				return taskListOptions{}, errors.New("usage: forge project list [--all] [--tree]")
			}
			options.IncludeArchived = true
		case "--tree":
			if options.Tree {
				return taskListOptions{}, errors.New("usage: forge project list [--all] [--tree]")
			}
			options.Tree = true
		default:
			return taskListOptions{}, errors.New("usage: forge project list [--all] [--tree]")
		}
	}
	return options, nil
}

func parseTaskListArgs(args []string) (string, bool, error) {
	switch len(args) {
	case 1:
		return args[0], false, nil
	case 2:
		if args[1] == "--all" {
			return args[0], true, nil
		}
	}
	return "", false, errors.New("usage: forge task list <project-id> [--all]")
}

func parseSubtaskListArgs(args []string) (string, bool, error) {
	switch len(args) {
	case 1:
		return args[0], false, nil
	case 2:
		if args[1] == "--all" {
			return args[0], true, nil
		}
	}
	return "", false, errors.New("usage: forge subtask list <task-id> [--all]")
}
