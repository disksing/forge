package forge

import (
	"errors"
	"fmt"
	"strings"
)

const (
	projectCreateUsage = "usage: forge project create [--workflow=<name>] [--slug <slug>] <description>"
	taskCreateUsage    = "usage: forge task create [--project=<project>] [--slug <slug>] <description>"
	taskListUsage      = "usage: forge task list [--project=<project>] [--all]"
	taskShowUsage      = "usage: forge task show [--project=<project>] [--task=<task>]"
	taskArchiveUsage   = "usage: forge task archive [--project=<project>] [--task=<task>]"
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
		projectID, err := resolveProjectArg(args[1:], "show")
		if err != nil {
			return err
		}
		return taskShow(projectID)
	case "archive":
		projectID, err := resolveProjectArg(args[1:], "archive")
		if err != nil {
			return err
		}
		return taskArchive(projectID)
	case "repo":
		return errors.New("projects do not manage repositories or worktrees; use forge task repo <subcommand> [--project=<project>] [--task=<task>] ...")
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
		options, err := parseTaskCreateArgs(args[1:])
		if err != nil {
			return err
		}
		parentID := options.ParentID
		if parentID == "" {
			var ok bool
			parentID, ok, err = inferCurrentProjectID()
			if err != nil {
				return err
			}
			if !ok {
				return errors.New("could not infer current project; use forge task create --project=<project> <description>")
			}
		}
		return projectTaskCreate(parentID, options.Description, options.Slug)
	case "list":
		projectID, all, err := resolveTaskListArgs(args[1:])
		if err != nil {
			return err
		}
		return projectTaskList(projectID, all)
	case "show":
		taskID, err := resolveTaskArg(args[1:], "show")
		if err != nil {
			return err
		}
		return taskShow(taskID)
	case "archive":
		taskID, err := resolveTaskArg(args[1:], "archive")
		if err != nil {
			return err
		}
		return taskArchive(taskID)
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
		return taskRepoList(args[1:])
	case "remove":
		return taskRepoRemove(args[1:])
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
  forge migrate

  forge repo add [--bare] <name> <url>
  forge repo list

  forge project create [--workflow=<name>] [--slug <slug>] <description>
  forge project list [--all]
  forge project show [--project=<project>]
  forge project archive [--project=<project>]

  forge task create [--project=<project>] [--slug <slug>] <description>
  forge task list [--project=<project>] [--all]
  forge task show [--project=<project>] [--task=<task>]
  forge task archive [--project=<project>] [--task=<task>]
  forge task repo add [--project=<project>] [--task=<task>] <repo-name> [--worktree <path>] [--branch <branch>] [--target <branch>] [--base <branch>]
  forge task repo list [--project=<project>] [--task=<task>]
  forge task repo remove [--project=<project>] [--task=<task>] <repo-name>

  forge start <resource-id> [-- <agent command...>]

Commands:
  forge init
    Initialize the current directory as a new AgentWorkspace. Fails when run
    from inside an existing workspace.

  forge migrate
    Refresh built-in workflow templates and forge-managed AGENTS.md blocks in
    the enclosing workspace.

  forge repo add [--bare] <name> <url>
    Clone <url> into repos/<name> as a normal checkout by default. <name> may
    include path segments, for example disksing/forge. Use --bare to clone into
    repos/<name>.git as a bare repository.

  forge repo list
    List repositories known to the workspace.

  forge project create [--workflow=<name>] [--slug <slug>] <description>
    Create the next top-level project directory, including project.json,
    project.md, work.md, log.md, artifacts/, and project-local AGENTS.md. By
    default, AGENTS.md uses workflow/default.md for project workflow guidance.
    Use --workflow=<name> to select workflow/<name>.md. Use --slug <slug> to
    append a human-readable suffix to the directory name.

  forge project list [--all]
    List open projects. Use --all to include archived projects.

  forge project show [--project=<project>]
    Print a project's project.json as formatted JSON. <project> may be a full
    id such as project22 or just a number such as 22. When omitted, Forge uses
    the project containing the current working directory.

  forge project archive [--project=<project>]
    Move a project into workspace archive/. <project> may be a full id such as
    project22 or just a number such as 22. When omitted, Forge uses the project
    containing the current working directory.

  forge task create [--project=<project>] [--slug <slug>] <description>
    Create the next task under the project in a short taskN/ or taskN-<slug>/
    directory, including task.json, task.md, work.md, log.md, artifacts/,
    worktree/, and task-local AGENTS.md. <project> may be a full id such as
    project22 or just a number such as 22. When omitted, Forge uses the
    project containing the current working directory.

  forge task list [--project=<project>] [--all]
    List open tasks in a project. Use --all to include archived tasks.
    <project> may be a full id such as project22 or just a number such as 22.
    When omitted, Forge uses the project containing the current working
    directory.

  forge task show [--project=<project>] [--task=<task>]
    Print a task's task.json as formatted JSON. <task> may be a short id such
    as task4, or just a number such as 4. Forge combines it with --project when
    provided, otherwise the current directory's project. When <task> is omitted,
    Forge uses the task containing the current working directory.

  forge task archive [--project=<project>] [--task=<task>]
    Move an open task into its project archive. <task> follows the same rules
    as forge task show.

  forge task repo add [--project=<project>] [--task=<task>] <repo-name> [--worktree <path>] [--branch <branch>] [--target <branch>] [--base <branch>]
    Add or update a repository entry in a task's task.json. By default, forge
    records repos/<repo-name> and <task>/worktree/<repo-leaf>. Optional flags
    let agents record the actual worktree path and branch metadata. Task
    selection follows forge task show.

  forge task repo list [--project=<project>] [--task=<task>]
    List repositories recorded in a task's task.json. Task selection follows
    forge task show.

  forge task repo remove [--project=<project>] [--task=<task>] <repo-name>
    Remove a repository entry from a task's task.json. Task selection follows
    forge task show.

  forge start <resource-id> [-- <agent command...>]
    Run an agent command in the project or task directory. Explicit command arguments
    after -- override the workspace forge.json agentCommand default.`)
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
	if len(args) == 0 {
		return taskCreateOptions{}, errors.New(taskCreateUsage)
	}
	var options taskCreateOptions
	var description []string
	for i := 0; i < len(args); i++ {
		arg := args[i]
		if strings.HasPrefix(arg, "--project=") {
			value := strings.TrimPrefix(arg, "--project=")
			if value == "" {
				return taskCreateOptions{}, errors.New("project cannot be empty")
			}
			if options.ParentID != "" {
				return taskCreateOptions{}, errors.New(taskCreateUsage)
			}
			projectID, err := normalizeProjectArg(value)
			if err != nil {
				return taskCreateOptions{}, err
			}
			options.ParentID = projectID
			continue
		}
		if arg == "--project" {
			if i+1 >= len(args) || strings.HasPrefix(args[i+1], "--") {
				return taskCreateOptions{}, errors.New(taskCreateUsage)
			}
			if options.ParentID != "" {
				return taskCreateOptions{}, errors.New(taskCreateUsage)
			}
			projectID, err := normalizeProjectArg(args[i+1])
			if err != nil {
				return taskCreateOptions{}, err
			}
			options.ParentID = projectID
			i++
			continue
		}
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
				return taskListOptions{}, errors.New("usage: forge project list [--all]")
			}
			options.IncludeArchived = true
		default:
			return taskListOptions{}, errors.New("usage: forge project list [--all]")
		}
	}
	return options, nil
}

func resolveProjectArg(args []string, command string) (string, error) {
	projectID, err := parseProjectArg(args, command)
	if err != nil {
		return "", err
	}
	if projectID != "" {
		return projectID, nil
	}
	inferred, ok, err := inferCurrentProjectID()
	if err != nil {
		return "", err
	}
	if !ok {
		return "", fmt.Errorf("could not infer current project; use forge project %s --project=<project>", command)
	}
	return inferred, nil
}

func parseProjectArg(args []string, command string) (string, error) {
	usage := fmt.Sprintf("usage: forge project %s [--project=<project>]", command)
	var project string
	for i := 0; i < len(args); i++ {
		arg := args[i]
		if strings.HasPrefix(arg, "--project=") {
			value := strings.TrimPrefix(arg, "--project=")
			if value == "" {
				return "", errors.New("project cannot be empty")
			}
			if project != "" {
				return "", errors.New(usage)
			}
			project = value
			continue
		}
		if arg == "--project" {
			if i+1 >= len(args) || strings.HasPrefix(args[i+1], "--") {
				return "", errors.New(usage)
			}
			if project != "" {
				return "", errors.New(usage)
			}
			project = args[i+1]
			i++
			continue
		}
		return "", errors.New(usage)
	}
	return normalizeProjectArg(project)
}

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

func resolveTaskListArgs(args []string) (string, bool, error) {
	projectID, includeArchived, err := parseTaskListArgs(args)
	if err != nil {
		return "", false, err
	}
	if projectID != "" {
		return projectID, includeArchived, nil
	}
	inferred, ok, err := inferCurrentProjectID()
	if err != nil {
		return "", false, err
	}
	if !ok {
		return "", false, errors.New("could not infer current project; use forge task list --project=<project>")
	}
	return inferred, includeArchived, nil
}

func resolveTaskArg(args []string, command string) (string, error) {
	projectID, task, err := parseTaskArg(args, command)
	if err != nil {
		return "", err
	}
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

func parseTaskArg(args []string, command string) (string, string, error) {
	usage := taskShowUsage
	if command == "archive" {
		usage = taskArchiveUsage
	}
	var projectID string
	var task string
	for i := 0; i < len(args); i++ {
		arg := args[i]
		switch {
		case strings.HasPrefix(arg, "--project="):
			value := strings.TrimPrefix(arg, "--project=")
			if value == "" {
				return "", "", errors.New("project cannot be empty")
			}
			if projectID != "" {
				return "", "", errors.New(usage)
			}
			normalized, err := normalizeProjectArg(value)
			if err != nil {
				return "", "", err
			}
			projectID = normalized
		case arg == "--project":
			if i+1 >= len(args) || strings.HasPrefix(args[i+1], "--") {
				return "", "", errors.New(usage)
			}
			if projectID != "" {
				return "", "", errors.New(usage)
			}
			normalized, err := normalizeProjectArg(args[i+1])
			if err != nil {
				return "", "", err
			}
			projectID = normalized
			i++
		case strings.HasPrefix(arg, "--task="):
			value := strings.TrimPrefix(arg, "--task=")
			if value == "" {
				return "", "", errors.New("task cannot be empty")
			}
			if task != "" {
				return "", "", errors.New(usage)
			}
			task = value
		case arg == "--task":
			if i+1 >= len(args) || strings.HasPrefix(args[i+1], "--") {
				return "", "", errors.New(usage)
			}
			if task != "" {
				return "", "", errors.New(usage)
			}
			task = args[i+1]
			i++
		default:
			return "", "", errors.New(usage)
		}
	}
	return projectID, strings.TrimSpace(task), nil
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
	if legacyTopTaskName.MatchString(task) {
		return projectID + "." + task, nil
	}
	if isASCIIInteger(task) {
		return projectID + ".task" + task, nil
	}
	return "", fmt.Errorf("invalid task %q: use taskM or M", task)
}

func parseTaskListArgs(args []string) (string, bool, error) {
	var projectID string
	includeArchived := false
	for i := 0; i < len(args); i++ {
		arg := args[i]
		switch {
		case arg == "--all":
			if includeArchived {
				return "", false, errors.New(taskListUsage)
			}
			includeArchived = true
		case strings.HasPrefix(arg, "--project="):
			value := strings.TrimPrefix(arg, "--project=")
			if value == "" {
				return "", false, errors.New("project cannot be empty")
			}
			if projectID != "" {
				return "", false, errors.New(taskListUsage)
			}
			normalized, err := normalizeProjectArg(value)
			if err != nil {
				return "", false, err
			}
			projectID = normalized
		case arg == "--project":
			if i+1 >= len(args) || strings.HasPrefix(args[i+1], "--") {
				return "", false, errors.New(taskListUsage)
			}
			if projectID != "" {
				return "", false, errors.New(taskListUsage)
			}
			normalized, err := normalizeProjectArg(args[i+1])
			if err != nil {
				return "", false, err
			}
			projectID = normalized
			i++
		default:
			return "", false, errors.New(taskListUsage)
		}
	}
	return projectID, includeArchived, nil
}
