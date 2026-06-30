package forge

import (
	"errors"
	"fmt"
	"strings"
)

const (
	projectCreateUsage = "usage: forge project create [--workflow=<name>] [--slug <slug>] <description>"
	taskCreateUsage    = "usage: forge task create [<project-id>] <description> [--slug <slug>]"
)

type createResourceOptions struct {
	Workflow         string
	ExplicitWorkflow bool
	Slug             string
	Description      string
}

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
			return errors.New(projectCreateUsage)
		}
		options, err := parseProjectCreateArgs(args[1:])
		if err != nil {
			return err
		}
		return projectCreate(options.Description, options.Workflow, !options.ExplicitWorkflow, options.Slug)
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
		return errors.New("projects do not manage repositories or worktrees; use forge task repo <subcommand> <task-id> ...")
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
			return errors.New(taskCreateUsage)
		}
		if looksLikeProjectID(args[1]) || strings.Contains(args[1], ".") {
			if len(args) < 3 {
				return errors.New(taskCreateUsage)
			}
			options, err := parseTaskCreateArgs(args[1:])
			if err != nil {
				return err
			}
			return projectTaskCreate(options.ParentID, options.Description, options.Slug)
		}
		parentID, ok, err := inferCurrentProjectID()
		if err != nil {
			return err
		}
		if ok {
			options, err := parseTaskCreateArgsForParent(parentID, args[1:])
			if err != nil {
				return err
			}
			return projectTaskCreate(options.ParentID, options.Description, options.Slug)
		}
		options, err := parseProjectCreateArgs(args[1:])
		if err != nil {
			return err
		}
		return projectCreate(options.Description, options.Workflow, !options.ExplicitWorkflow, options.Slug)
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

func runMigrate(args []string) error {
	return runWorkspaceMigrate(args)
}

func printUsage() {
	fmt.Println(`forge manages a local AgentWorkspace.

Usage:
  forge init
  forge repo add [--bare] <name> <url>
  forge repo list
  forge start <resource-id> [-- <agent command...>]
  forge project create [--workflow=<name>] [--slug <slug>] <description>
  forge project list [--all] [--tree]
  forge project show <project-id>
  forge project archive <project-id>
  forge task create [<project-id>] <description> [--slug <slug>]
  forge task list <project-id> [--all]
  forge task show <id>
  forge task archive <id>
  forge task repo add <task-id> <repo-name> [--worktree <path>] [--branch <branch>] [--target <branch>] [--base <branch>]
  forge task repo list <task-id>
  forge task repo remove <task-id> <repo-name>
  forge migrate

Commands:
  forge init
    Initialize the current directory as a new AgentWorkspace. Fails when run
    from inside an existing workspace.

  forge repo add [--bare] <name> <url>
    Clone <url> into repos/<name> as a normal checkout by default. <name> may
    include path segments, for example disksing/forge. Use --bare to clone into
    repos/<name>.git as a bare repository.

  forge repo list
    List repositories known to the workspace.

  forge start <resource-id> [-- <agent command...>]
    Run an agent command in the project or task directory. Explicit command arguments
    after -- override the workspace forge.json agentCommand default.

  forge project create [--workflow=<name>] [--slug <slug>] <description>
    Create the next top-level project directory, including project.json,
    project.md, work.md, log.md, artifacts/, and project-local AGENTS.md. By
    default, AGENTS.md uses workflow/default.md for project workflow guidance.
    Use --workflow=<name> to select workflow/<name>.md. Use --slug <slug> to
    append a human-readable suffix to the directory name.

  forge project list [--all] [--tree]
    List open projects. Use --all to include archived projects. Use --tree
    to include project tasks.

  forge task create [<project-id>] <description> [--slug <slug>]
    Create the next task under the project in a short taskN/ or taskN-<slug>/
    directory, including task.json, task.md, work.md, log.md, artifacts/,
    worktree/, and task-local AGENTS.md. When run from inside a project or
    task directory, <project-id> may be omitted.

  forge task list <project-id> [--all]
    List open tasks in a project. Use --all to include archived tasks.

  forge task show <id>
    Print project.json or task.json for a resource as formatted JSON.

  forge task archive <id>
    Move an open task into its project archive. Use forge project archive
    <project-id> to archive a project into workspace archive/.

  forge task repo add <task-id> <repo-name> [--worktree <path>] [--branch <branch>] [--target <branch>] [--base <branch>]
    Add or update a repository entry in a task's task.json. By default, forge
    records repos/<repo-name> and <task>/worktree/<repo-leaf>. Optional flags
    let agents record the actual worktree path and branch metadata.

  forge task repo list <task-id>
    List repositories recorded in a task's task.json.

  forge task repo remove <task-id> <repo-name>
    Remove a repository entry from a task's task.json.

  forge migrate
    Refresh built-in workflow templates and forge-managed AGENTS.md blocks in
    the enclosing workspace.`)
}

func parseProjectCreateArgs(args []string) (createResourceOptions, error) {
	options := createResourceOptions{Workflow: defaultWorkflowName}
	var description []string
	for i := 0; i < len(args); i++ {
		arg := args[i]
		if strings.HasPrefix(arg, "--workflow=") {
			value := strings.TrimPrefix(arg, "--workflow=")
			if value == "" {
				return createResourceOptions{}, errors.New("workflow cannot be empty")
			}
			options.Workflow = value
			options.ExplicitWorkflow = true
			continue
		}
		if arg == "--workflow" || strings.HasPrefix(arg, "--workflow") {
			return createResourceOptions{}, errors.New(projectCreateUsage)
		}
		if strings.HasPrefix(arg, "--slug=") {
			value := strings.TrimPrefix(arg, "--slug=")
			if value == "" {
				return createResourceOptions{}, errors.New("slug cannot be empty")
			}
			options.Slug = value
			continue
		}
		if arg == "--slug" {
			if i+1 >= len(args) || strings.HasPrefix(args[i+1], "--") {
				return createResourceOptions{}, errors.New(projectCreateUsage)
			}
			options.Slug = args[i+1]
			i++
			continue
		}
		if strings.HasPrefix(arg, "--slug") {
			return createResourceOptions{}, errors.New(projectCreateUsage)
		}
		description = append(description, arg)
	}
	if len(description) == 0 {
		return createResourceOptions{}, errors.New(projectCreateUsage)
	}
	options.Description = strings.Join(description, " ")
	return options, nil
}

type taskCreateOptions struct {
	ParentID    string
	Description string
	Slug        string
}

func parseTaskCreateArgs(args []string) (taskCreateOptions, error) {
	if len(args) < 2 {
		return taskCreateOptions{}, errors.New(taskCreateUsage)
	}
	return parseTaskCreateArgsForParent(args[0], args[1:])
}

func parseTaskCreateArgsForParent(parentID string, args []string) (taskCreateOptions, error) {
	if len(args) == 0 {
		return taskCreateOptions{}, errors.New(taskCreateUsage)
	}
	options := taskCreateOptions{ParentID: parentID}
	var description []string
	for i := 0; i < len(args); i++ {
		arg := args[i]
		if strings.HasPrefix(arg, "--slug=") {
			value := strings.TrimPrefix(arg, "--slug=")
			if value == "" {
				return taskCreateOptions{}, errors.New("slug cannot be empty")
			}
			options.Slug = value
			continue
		}
		if arg == "--slug" {
			if i+1 >= len(args) || strings.HasPrefix(args[i+1], "--") {
				return taskCreateOptions{}, errors.New(taskCreateUsage)
			}
			options.Slug = args[i+1]
			i++
			continue
		}
		if strings.HasPrefix(arg, "--") {
			return taskCreateOptions{}, errors.New(taskCreateUsage)
		}
		description = append(description, arg)
	}
	if len(description) == 0 {
		return taskCreateOptions{}, errors.New(taskCreateUsage)
	}
	options.Description = strings.Join(description, " ")
	return options, nil
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
