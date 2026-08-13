package forge

import (
	"errors"
	"fmt"
	"strings"

	"github.com/disksing/forge/internal/app"
	"github.com/disksing/forge/internal/buildinfo"
	"github.com/disksing/forge/internal/serve"
)

const (
	projectCreateUsage = "usage: forge project create [--slug <slug>] [--creator=user|agent] <description>"
	taskCreateUsage    = "usage: forge task create [<title>] [--project=<project>] [--slug <slug>] [--creator=user|agent] [--detail <detail>|--task-markdown <markdown>|--template=<name> [--field <name>=<value>...] [--fields <file>]] [--title <title>] [--dry-run] [--json]"
	taskListUsage      = "usage: forge task list [--project=<project>] [--all]"
	taskShowUsage      = "usage: forge task show [--project=<project>] [--task=<task>]"
	taskArchiveUsage   = "usage: forge task archive [--project=<project>] [--task=<task>]"
)

type createResourceOptions struct {
	Slug        string
	Description string
	Creator     string
}

type taskListOptions struct {
	ProjectID       string
	IncludeArchived bool
}

func Run(args []string) error {
	if len(args) == 0 {
		printUsage()
		return nil
	}

	switch args[0] {
	case "--version":
		if len(args) != 1 {
			return errors.New("usage: forge --version")
		}
		fmt.Print(buildinfo.Text("forge"))
		return nil
	case "init":
		return runInit(args[1:])
	case "repo":
		return runRepo(args[1:])
	case "project":
		return runProject(args[1:])
	case "task":
		return runTask(args[1:])
	case "scheduler":
		return runScheduler(args[1:])
	case "template":
		return runTemplate(args[1:])
	case "resource":
		return runResource(args[1:])
	case "message":
		return runMessage(args[1:])
	case "history":
		return runHistory(args[1:])
	case "session":
		return runSession(args[1:])
	case "workspace":
		return runWorkspace(args[1:])
	case "migrate":
		return runMigrate(args[1:])
	case "serve":
		return serve.Main(args[1:])
	case "help", "-h", "--help":
		printUsage()
		return nil
	default:
		return fmt.Errorf("unknown command %q", args[0])
	}
}

func runResource(args []string) error {
	if len(args) == 0 {
		return errors.New("resource requires a subcommand")
	}
	switch args[0] {
	case "archive":
		if len(args) != 2 || !strings.HasPrefix(args[1], "--id=") {
			return errors.New("usage: forge resource archive --id=<resource>")
		}
		id := strings.TrimSpace(strings.TrimPrefix(args[1], "--id="))
		if id == "" {
			return errors.New("resource id cannot be empty")
		}
		return applicationArchiveResource(id)
	default:
		return fmt.Errorf("unknown resource subcommand %q", args[0])
	}
}

func runWorkspace(args []string) error {
	if len(args) == 0 {
		return errors.New("workspace requires a subcommand")
	}
	switch args[0] {
	case "status":
		return runWorkspaceStatus(args[1:])
	case "history":
		return runWorkspaceHistory(args[1:])
	case "tree":
		if len(args) != 2 || args[1] != "--json" {
			return errors.New("usage: forge workspace tree --json")
		}
		return workspaceTreeJSON()
	case "resource":
		id, err := parseWorkspaceResourceArgs(args[1:])
		if err != nil {
			return err
		}
		return workspaceResourceJSON(id)
	default:
		return fmt.Errorf("unknown workspace subcommand %q", args[0])
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
		creator, err := resolveCreationCreator(options.Creator)
		if err != nil {
			return err
		}
		return applicationProjectCreate(options.Description, options.Slug, creator)
	case "list":
		options, err := parseProjectListArgs(args[1:])
		if err != nil {
			return err
		}
		return applicationProjectList(options.IncludeArchived)
	case "show":
		projectID, err := resolveProjectArg(args[1:], "show")
		if err != nil {
			return err
		}
		return applicationShowResource(projectID)
	case "status":
		return runProjectStatus(args[1:])
	case "history":
		return runProjectHistory(args[1:])
	case "archive":
		projectID, err := resolveProjectArg(args[1:], "archive")
		if err != nil {
			return err
		}
		return applicationArchiveResource(projectID)
	case "log":
		return runResourceLog("project", args[1:])
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
				return errors.New("could not infer current project; use forge task create --project=<project> <title>")
			}
		}
		workspace, err := openApplicationWorkspace()
		if err != nil {
			return err
		}
		var fields map[string]any
		if options.TemplateName != "" {
			fields, err = templateFieldValues(workspace, parentID, options.TemplateName, options.FieldsFile, options.Fields)
			if err != nil {
				return err
			}
		}
		input := appCreateTaskInput(parentID, options.Title, options.Detail, options.TaskMarkdown, options.TaskMarkdownSet, options.Slug)
		input.TemplateName, input.TemplateFields = options.TemplateName, fields
		if options.DryRun {
			preview, err := workspace.PreviewTask(input)
			if err != nil {
				return err
			}
			return printJSON(preview)
		}
		creator, err := resolveCreationCreator(options.Creator)
		if err != nil {
			return err
		}
		input.Creator = creator
		return applicationTaskCreate(input)
	case "list":
		options, err := resolveTaskListArgs(args[1:])
		if err != nil {
			return err
		}
		return applicationTaskList(options)
	case "show":
		taskID, err := resolveTaskArg(args[1:], "show")
		if err != nil {
			return err
		}
		return applicationShowResource(taskID)
	case "status":
		return runTaskStatus(args[1:])
	case "archive":
		taskID, err := resolveTaskArg(args[1:], "archive")
		if err != nil {
			return err
		}
		return applicationArchiveResource(taskID)
	case "history":
		return runTaskHistory(args[1:])
	case "repo":
		return runTaskRepo(args[1:])
	case "log":
		return runResourceLog("task", args[1:])
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

How Forge works:
  All workspace data lives on the filesystem as project/task directories,
  JSON/Markdown files, logs, artifacts, and task worktrees. Agents may inspect
  other resources, but write only the Workspace files owned by their starting
  resource and its task worktrees. The web service is provided by forge serve.

Usage:
  forge --version
  forge init [--language=<language>] [--creator=user|agent]
  forge migrate [--language=<language>]

  forge repo add [--bare] <name> <url>
  forge repo list

  forge project create [--slug <slug>] [--creator=user|agent] <description>
  forge project list [--all]
  forge project show [--project=<project>]
  forge project archive [--project=<project>]
  forge project log add [--project=<project>] [--details <text>|--details -] <title>
  forge project log list [--project=<project>] [--json]

  forge template list [--project=<project>] [--json]
  forge template show [--project=<project>] [--json|--raw|--schema] <name>
  forge template validate [--project=<project>] [<name>|--all] [--json]
  forge template render [--project=<project>] [--field <name>=<value>...] [--fields <file>] [--title <title>] [--json] <name>
  forge template create [--project=<project>] [--title=<title>] <name>
  forge template migrate [--project=<project>] [<name>|--all] [--write] [--json]

  forge workspace status [--server=<url>]
  forge project status [--project=<project>] [--server=<url>]
  forge task status [--project=<project>] [--task=<task>] [--server=<url>]
  forge workspace history [--cursor=<cursor>] [--limit=<n>] [--server=<url>] [--json]
  forge project history [--project=<project>] [--cursor=<cursor>] [--limit=<n>] [--server=<url>] [--json]
  forge task history [--project=<project>] [--task=<task>] [--cursor=<cursor>] [--limit=<n>] [--server=<url>] [--json]
  forge history turn show --ref=<turn-ref> [--server=<url>] [--json]
  forge history event show --ref=<event-ref> [--server=<url>] [--json]
  forge message send --to=<resource> [--mode=steer|enqueue|interrupt] [--server=<url>] <message>
  forge message show --id=<message-id> [--server=<url>]
  forge resource archive --id=<resource>

  forge task create [<title>] [--project=<project>] [--slug <slug>] [--creator=user|agent] [--detail <detail>|--task-markdown <markdown>|--template=<name>] [--field <name>=<value>...] [--fields <file>] [--title <title>] [--dry-run]
  forge task list [--project=<project>] [--all]
  forge task show [--project=<project>] [--task=<task>]
  forge task archive [--project=<project>] [--task=<task>]
  forge task log add [--project=<project>] [--task=<task>] [--details <text>|--details -] <title>
  forge task log list [--project=<project>] [--task=<task>] [--json]
  forge task repo add [--project=<project>] [--task=<task>] <repo-name> [--worktree <path>] [--branch <branch>] [--target <branch>] [--base <branch>]
  forge task repo list [--project=<project>] [--task=<task>]
  forge task repo remove [--project=<project>] [--task=<task>] <repo-name>
  forge scheduler list [--json]
  forge scheduler show --id=<schedule>
  forge scheduler add --description=<text> --condition=<text> --target=<resource> [--creator=user|agent]
  forge scheduler update --id=<schedule> [--description=<text>] [--condition=<text>] [--target=<resource>]
  forge scheduler remove --id=<schedule>
  forge session list
  forge session show --id=<generationId>

  forge workspace tree --json
  forge workspace resource --id=<resource> --json

  forge serve [--addr=<address>] [--workspace=<path>] [--version]

Commands:
  forge --version
    Print the build-time branch and sha.

  forge init [--language=<language>] [--creator=user|agent]
    Initialize the current directory as a new AgentWorkspace. Fails when run
    from inside an existing workspace. Supported languages: en, zh-CN.
    --creator records immutable provenance; a verified injected resource
    context defaults to agent, and every other invocation defaults to user.

  forge migrate [--language=<language>]
    Refresh forge-managed AGENTS.md blocks in the enclosing workspace. Pass
    --language to switch the workspace language between en and zh-CN.

  forge repo add [--bare] <name> <url>
    Clone <url> into repos/<name> as a normal checkout by default. <name> may
    include path segments, for example disksing/forge. Use --bare to clone into
    repos/<name>.git as a bare repository.

  forge repo list
    List repositories known to the workspace.

  forge project create [--slug <slug>] [--creator=user|agent] <description>
    Create the next top-level project directory, including project.json,
    project.md, log.jsonl, artifacts/, templates/, and project-local AGENTS.md.
    Use --slug <slug> to append a human-readable suffix to the directory name.
    Creation is local and does not create a generation or send a message.

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

  forge task create [<title>] [--project=<project>] [--slug <slug>] [--creator=user|agent] [--detail <detail>|--task-markdown <markdown>|--template=<name>] [--field <name>=<value>...] [--fields <file>] [--title <title>] [--dry-run]
    Create the next task under the project in a short taskN/ or taskN-<slug>/
    directory, including task.json, task.md, work.md, log.jsonl, artifacts/,
    worktree/, and task-local AGENTS.md. <title> is written to task.json and
    shown by task list. --detail initializes the Background section in the
    default task.md scaffold. --task-markdown writes the complete task.md file
    and is mutually exclusive with --detail. <project> may be a full id such as
    project22 or just a number such as 22. When omitted, Forge uses the project
    containing the current working directory. Send the first message
    separately with forge message send; that delivery creates a generation
    lazily. If CLI output is ambiguous, query before attempting another create.

  forge template list|show|validate|render|create|migrate ...
    Manage project-local schema V2 content templates. Templates declare typed
    fields and deterministic title/Markdown rendering. list and validate
    include invalid templates. show defaults
    to metadata, field requirements, diagnostics, and the complete Markdown
    body; use --raw for the original file, --json for structured template data,
    or --schema for schema metadata and diagnostics. render and task create
    --dry-run have no side effects. migrate previews legacy V1 conversion
    unless --write is provided.

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

  forge task log add [--project=<project>] [--task=<task>] [--details <text>|--details -] <title>
    Prepend a structured entry to a task's log.jsonl. When --details - is
    provided, details are read from standard input. Task selection follows
    forge task show.

  forge task log list [--project=<project>] [--task=<task>] [--json]
    List a task's structured log entries newest first. Use --json to print
    entries as formatted JSON. Task selection follows forge task show.

  forge project log add [--project=<project>] [--details <text>|--details -] <title>
    Prepend a structured entry to a project's log.jsonl. Project selection
    follows forge project show.

  forge project log list [--project=<project>] [--json]
    List a project's structured log entries newest first. Use --json to print
    entries as formatted JSON. Project selection follows forge project show.

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

  forge workspace|project|task status ... [--server=<url>]
    Query the owning forge serve process for the selected work subject's
    public state, generation and Session diagnostics, message counts, waiting
    messages, steer capability, and recent delivery error. Selection follows
    the corresponding show command; Workspace status selects the Workspace.

  forge workspace|project|task history ... [--cursor=<cursor>] [--limit=<n>] [--server=<url>] [--json]
    Read one bounded newest-first page of the selected resource's long-lived
    conversation through the owning forge serve process. Results are grouped
    into ordered generation segments. Explicit gap segments identify missing,
    unavailable, or damaged AgentHub history without hiding older generations.
    The default output is formatted text; use --json for the complete structured
    response.

  forge history turn|event show --ref=<reference> [--server=<url>] [--json]
    Expand a stable opaque reference returned by a resource history page or
    Turn detail. Turn details contain complete compact messages and Event
    ranges; Event details read one canonical AgentHub Event on demand. Neither
    command requires or accepts a run or AgentHub Session id. The default
    output is formatted text; use --json for the complete structured response.

  forge message send --to=<resource> [--mode=steer|enqueue|interrupt] [--server=<url>] <message>
    Persist a message in the target resource mailbox through the owning
    forge serve process. steer is the default. The current directory's stable
    work-subject id and Workspace instance id are sent as role=agent
    provenance. A valid injected Forge resource environment takes precedence
    over cwd; provenance is not authentication or instruction priority.

  forge message show --id=<message-id> [--server=<url>]
    Query the current delivery record for a stable mailbox message id.
    Status and message commands discover the owner from <workspace>/.forge/serve.lock;
    --server explicitly overrides its diagnostic address.

  forge session list
    List read-only generation diagnostics derived from .forge/runtime/generations.json.
    This diagnostic command never changes generation state or contacts AgentHub.

  forge session show --id=<generationId>
    Print one generation diagnostic as formatted JSON. The stable generationId
    is the only accepted address; this command never contacts AgentHub.

  forge workspace tree --json
    Print a lightweight JSON tree of open projects, open tasks, and resource
    runtime state for GUI and tool integrations.

  forge workspace resource --id=<resource> --json
    Print detail JSON for one project or task, including common Markdown files,
    artifacts, worktrees, and task repository metadata.

  forge serve [--addr=<address>] [--workspace=<path>] [--version]
    Start the Forge web service: Workspace API, AgentHub session orchestration
    and recovery, and the static web UI. Workspace
    operations use the in-process application API; FORGE_AGENTHUB_URL
    overrides the persisted AgentHub endpoint; FORGE_GUI_CONFIG selects the
    GUI configuration file.`)
}

func parseProjectCreateArgs(args []string) (createResourceOptions, error) {
	options := createResourceOptions{}
	var description []string
	for i := 0; i < len(args); i++ {
		arg := args[i]
		if strings.HasPrefix(arg, "--slug=") {
			value := strings.TrimPrefix(arg, "--slug=")
			if value == "" {
				return createResourceOptions{}, errors.New("slug cannot be empty")
			}
			options.Slug = value
			continue
		}
		if strings.HasPrefix(arg, "--creator=") {
			if options.Creator != "" {
				return createResourceOptions{}, errors.New(projectCreateUsage)
			}
			value, err := normalizeCreationCreatorOption(strings.TrimPrefix(arg, "--creator="))
			if err != nil {
				return createResourceOptions{}, err
			}
			options.Creator = value
			continue
		}
		if arg == "--creator" {
			if i+1 >= len(args) || strings.HasPrefix(args[i+1], "--") || options.Creator != "" {
				return createResourceOptions{}, errors.New(projectCreateUsage)
			}
			value, err := normalizeCreationCreatorOption(args[i+1])
			if err != nil {
				return createResourceOptions{}, err
			}
			options.Creator = value
			i++
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
	ParentID        string
	Title           string
	Detail          string
	DetailSet       bool
	TaskMarkdown    string
	TaskMarkdownSet bool
	Slug            string
	TemplateName    string
	FieldsFile      string
	Fields          []string
	DryRun          bool
	TitleSet        bool
	JSON            bool
	Creator         string
}

func parseTaskCreateArgs(args []string) (taskCreateOptions, error) {
	if len(args) == 0 {
		return taskCreateOptions{}, errors.New(taskCreateUsage)
	}
	var options taskCreateOptions
	var title []string
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
		if strings.HasPrefix(arg, "--creator=") {
			if options.Creator != "" {
				return taskCreateOptions{}, errors.New(taskCreateUsage)
			}
			value, err := normalizeCreationCreatorOption(strings.TrimPrefix(arg, "--creator="))
			if err != nil {
				return taskCreateOptions{}, err
			}
			options.Creator = value
			continue
		}
		if arg == "--creator" {
			if i+1 >= len(args) || strings.HasPrefix(args[i+1], "--") || options.Creator != "" {
				return taskCreateOptions{}, errors.New(taskCreateUsage)
			}
			value, err := normalizeCreationCreatorOption(args[i+1])
			if err != nil {
				return taskCreateOptions{}, err
			}
			options.Creator = value
			i++
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
		if strings.HasPrefix(arg, "--detail=") {
			options.Detail = strings.TrimPrefix(arg, "--detail=")
			options.DetailSet = true
			continue
		}
		if arg == "--detail" {
			if i+1 >= len(args) || strings.HasPrefix(args[i+1], "--") {
				return taskCreateOptions{}, errors.New(taskCreateUsage)
			}
			options.Detail = args[i+1]
			options.DetailSet = true
			i++
			continue
		}
		if strings.HasPrefix(arg, "--task-markdown=") {
			options.TaskMarkdown = strings.TrimPrefix(arg, "--task-markdown=")
			options.TaskMarkdownSet = true
			continue
		}
		if strings.HasPrefix(arg, "--template=") {
			if options.TemplateName != "" {
				return taskCreateOptions{}, errors.New(taskCreateUsage)
			}
			options.TemplateName = strings.TrimSpace(strings.TrimPrefix(arg, "--template="))
			if options.TemplateName == "" {
				return taskCreateOptions{}, errors.New(taskCreateUsage)
			}
			continue
		}
		if arg == "--template" {
			if i+1 >= len(args) || strings.HasPrefix(args[i+1], "--") || options.TemplateName != "" {
				return taskCreateOptions{}, errors.New(taskCreateUsage)
			}
			options.TemplateName = strings.TrimSpace(args[i+1])
			i++
			continue
		}
		if strings.HasPrefix(arg, "--fields=") {
			if options.FieldsFile != "" {
				return taskCreateOptions{}, errors.New(taskCreateUsage)
			}
			options.FieldsFile = strings.TrimPrefix(arg, "--fields=")
			if options.FieldsFile == "" {
				return taskCreateOptions{}, errors.New(taskCreateUsage)
			}
			continue
		}
		if arg == "--fields" {
			if i+1 >= len(args) || strings.HasPrefix(args[i+1], "--") || options.FieldsFile != "" {
				return taskCreateOptions{}, errors.New(taskCreateUsage)
			}
			options.FieldsFile = args[i+1]
			i++
			continue
		}
		if strings.HasPrefix(arg, "--field=") {
			options.Fields = append(options.Fields, strings.TrimPrefix(arg, "--field="))
			continue
		}
		if arg == "--field" {
			if i+1 >= len(args) || strings.HasPrefix(args[i+1], "--") {
				return taskCreateOptions{}, errors.New(taskCreateUsage)
			}
			options.Fields = append(options.Fields, args[i+1])
			i++
			continue
		}
		if strings.HasPrefix(arg, "--title=") {
			if options.TitleSet {
				return taskCreateOptions{}, errors.New(taskCreateUsage)
			}
			options.Title, options.TitleSet = strings.TrimPrefix(arg, "--title="), true
			continue
		}
		if arg == "--title" {
			if i+1 >= len(args) || strings.HasPrefix(args[i+1], "--") || options.TitleSet {
				return taskCreateOptions{}, errors.New(taskCreateUsage)
			}
			options.Title, options.TitleSet = args[i+1], true
			i++
			continue
		}
		if arg == "--dry-run" {
			if options.DryRun {
				return taskCreateOptions{}, errors.New(taskCreateUsage)
			}
			options.DryRun = true
			continue
		}
		if arg == "--json" {
			if options.JSON {
				return taskCreateOptions{}, errors.New(taskCreateUsage)
			}
			options.JSON = true
			continue
		}
		if arg == "--task-markdown" {
			if i+1 >= len(args) || strings.HasPrefix(args[i+1], "--") {
				return taskCreateOptions{}, errors.New(taskCreateUsage)
			}
			options.TaskMarkdown = args[i+1]
			options.TaskMarkdownSet = true
			i++
			continue
		}
		if strings.HasPrefix(arg, "--") {
			return taskCreateOptions{}, errors.New(taskCreateUsage)
		}
		title = append(title, arg)
	}
	if len(title) == 0 && options.TemplateName == "" {
		return taskCreateOptions{}, errors.New(taskCreateUsage)
	}
	if len(title) > 0 && options.TitleSet {
		return taskCreateOptions{}, errors.New("positional title and --title are mutually exclusive")
	}
	if !options.TitleSet {
		options.Title = strings.Join(title, " ")
	}
	contentSources := boolCount(options.DetailSet, options.TaskMarkdownSet, options.TemplateName != "")
	if contentSources > 1 {
		return taskCreateOptions{}, errors.New("--template, --detail, and --task-markdown are mutually exclusive")
	}
	if (options.FieldsFile != "" || len(options.Fields) > 0) && options.TemplateName == "" {
		return taskCreateOptions{}, errors.New("--field and --fields require --template")
	}
	if options.DryRun && options.TemplateName == "" {
		return taskCreateOptions{}, errors.New("--dry-run currently requires --template")
	}
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
	return app.NormalizeProjectID(project)
}

func resolveTaskListArgs(args []string) (taskListOptions, error) {
	projectID, includeArchived, err := parseTaskListArgs(args)
	if err != nil {
		return taskListOptions{}, err
	}
	if projectID != "" {
		return taskListOptions{ProjectID: projectID, IncludeArchived: includeArchived}, nil
	}
	inferred, ok, err := inferCurrentProjectID()
	if err != nil {
		return taskListOptions{}, err
	}
	if !ok {
		return taskListOptions{}, errors.New("could not infer current project; use forge task list --project=<project>")
	}
	return taskListOptions{ProjectID: inferred, IncludeArchived: includeArchived}, nil
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
	} else if command == "status" {
		usage = taskStatusUsage
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
	normalizedTask, err := app.NormalizeTaskName(task)
	if err != nil {
		return "", err
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
	return app.NormalizeTaskID(projectID, normalizedTask)
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
