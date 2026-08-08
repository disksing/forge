package app

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

func runInit(args []string) error {
	_ = args
	return fmt.Errorf("application API init requires Initialize(root, language)")
}

func runWorkspaceMigrate(args []string) error {
	_ = args
	return fmt.Errorf("application API migrate requires Workspace.Migrate(language)")
}

func ensureWorkspaceWiki(root, language string) error {
	dir := filepath.Join(root, wikiDir)
	info, err := os.Lstat(dir)
	switch {
	case os.IsNotExist(err):
		if err := os.Mkdir(dir, 0o755); err != nil {
			return err
		}
	case err != nil:
		return err
	case info.Mode()&os.ModeSymlink != 0:
		return fmt.Errorf("workspace wiki path must not be a symbolic link: %s", dir)
	case !info.IsDir():
		return fmt.Errorf("workspace wiki path is not a directory: %s", dir)
	}

	indexPath := filepath.Join(dir, "index.md")
	if _, err := os.Lstat(indexPath); err == nil {
		return nil
	} else if !os.IsNotExist(err) {
		return err
	}
	file, err := os.OpenFile(indexPath, os.O_WRONLY|os.O_CREATE|os.O_EXCL, 0o644)
	if err != nil {
		if os.IsExist(err) {
			return nil
		}
		return err
	}
	if _, err := file.WriteString(defaultWikiIndexForLanguage(language)); err != nil {
		file.Close()
		return err
	}
	return file.Close()
}

func updateAgentsMD(path, language string) error {
	return updateAgentsMDWithBlock(path, forgePromptBlock(language))
}

func updateAgentsMDWithBlock(path, block string) error {
	content := ""
	if data, err := os.ReadFile(path); err == nil {
		content = string(data)
	} else if !os.IsNotExist(err) {
		return err
	}

	updated, err := upsertManagedBlock(content, block)
	if err != nil {
		return err
	}
	return os.WriteFile(path, []byte(updated), 0o644)
}

func upsertManagedBlock(content, block string) (string, error) {
	start := strings.Index(content, forgePromptStart)
	end := strings.Index(content, forgePromptEnd)
	if (start == -1) != (end == -1) {
		return "", fmt.Errorf("AGENTS.md has only one forge managed marker; fix markers before running init again")
	}
	if start != -1 && end < start {
		return "", fmt.Errorf("AGENTS.md forge managed end marker appears before start marker")
	}
	if start != -1 {
		end += len(forgePromptEnd)
		return content[:start] + block + content[end:], nil
	}

	content = strings.TrimRight(content, " \t\r\n")
	if content == "" {
		return block + "\n", nil
	}
	return content + "\n\n" + block + "\n", nil
}

func forgePromptBlock(language string) string {
	return forgePromptStart + "\n" + workspaceAgentsPromptForLanguage(language) + forgePromptEnd
}

func findEnclosingWorkspaceRoot(start string) (string, error) {
	cwd, err := filepath.Abs(start)
	if err != nil {
		return "", err
	}
	for {
		if pathExists(filepath.Join(cwd, configFile)) || isDir(filepath.Join(cwd, reposDir)) {
			return cwd, nil
		}
		parent := filepath.Dir(cwd)
		if parent == cwd {
			return "", nil
		}
		cwd = parent
	}
}

const (
	forgePromptStart = "<!-- managed by forge cli -->"
	forgePromptEnd   = "<!-- end of forge cli prompt -->"
)

const defaultWikiIndex = `# Workspace Wiki

This index is the entry point for long-lived workspace knowledge. Add links to topic pages with short summaries as the Wiki grows.
`

const workspaceAgentsPrompt = `# AgentWorkspace

This directory is an AgentWorkspace managed by forge.

- All workspace data lives on the filesystem as project/task directories, JSON/Markdown files, logs, artifacts, and task worktrees.
- Long-lived knowledge about the workspace's code, projects, and work history lives in ` + "`wiki/`" + `.
- Before starting work in this workspace, read ` + "`wiki/index.md`" + `.
- Follow the index and read only the Wiki pages relevant to the current task; do not load the entire Wiki indiscriminately.
- When the user asks to analyze code, projects, or work records and update the Wiki, maintain the relevant pages, cross-links, and ` + "`wiki/index.md`" + ` summaries.
- Agents coordinate writes with sessions that lock the project or task they are updating; stale locks are pruned from session liveness.
- Agents may read other projects and tasks freely for context, but should only update the resource they have locked and any task worktrees owned by that resource.
- When started through ` + "`forge start`" + ` or the Forge web service, Forge creates the session, locks the selected resource, injects ` + "`FORGE_SESSION_ID`" + ` through the environment or explicit Forge session context, and releases the session when the agent exits; agents should reuse that id and should not lock/unlock the starting resource themselves.
- When started directly without ` + "`FORGE_SESSION_ID`" + ` in the environment or injected session context, agents should detect their own PID, run ` + "`forge session new --pid <pid>`" + `, export ` + "`FORGE_SESSION_ID`" + `, lock the current project/task resource once, and end that session when the agent exits.
- Agents should only use extra lock/unlock pairs for temporary access to other project/task resources outside their starting resource.
- The workspace root does not require a lock.
- Open projects live directly under this workspace as ` + "`projectN/`" + ` or ` + "`projectN-slug/`" + ` directories.
- Project tasks live directly under their project directories as short ` + "`taskM/`" + ` or ` + "`taskM-slug/`" + ` directories; resource ids remain full ids like ` + "`projectN.taskM`" + `.
- Archived projects live under ` + "`archive/`" + `. Archived project tasks live under their project directory's ` + "`archive/`" + ` directory.
- Project content templates live under each project's ` + "`templates/`" + ` directory.
- Git repositories live under ` + "`repos/`" + ` as normal checkouts by default.
- Treat repositories under ` + "`repos/`" + ` as shared source caches; make code changes in task worktrees.
- Projects own ` + "`project.json`" + `, ` + "`project.md`" + `, ` + "`log.jsonl`" + `, ` + "`AGENTS.md`" + `, and ` + "`artifacts/`" + `.
- Tasks own ` + "`task.json`" + `, ` + "`task.md`" + `, ` + "`work.md`" + `, ` + "`log.jsonl`" + `, ` + "`AGENTS.md`" + `, ` + "`artifacts/`" + `, and ` + "`worktree/`" + `.
- Projects do not store repository metadata and do not manage worktrees. For code changes, create Git worktrees under the current task's ` + "`worktree/`" + ` directory.
- Agents may read other task directories for reference.
- Agents should only update files inside the project/task they are currently handling and its task-owned worktrees.
- ` + "`project.json`" + ` and ` + "`task.json`" + ` record structured facts only, not progress notes.
- Treat ` + "`project.md`" + ` and ` + "`task.md`" + ` as durable contracts. Keep why the work exists, scope and non-scope, acceptance criteria, stable constraints, durable decisions, and contract-changing open questions there.
- Treat task ` + "`work.md`" + ` as a replaceable recovery checkpoint. Keep only the current focus, next actions, blockers, and state needed to resume; do not restate the task contract.
- Use optional ` + "`work.md`" + ` modules such as ` + "`Todo`" + `, ` + "`Blockers`" + `, ` + "`Active Work`" + `, ` + "`Paused Work`" + `, ` + "`Resume Plan`" + `, ` + "`Context`" + `, ` + "`Resources`" + `, ` + "`Verification`" + `, and ` + "`Notes`" + ` only when useful. Delete empty modules, and keep arbitrary links or external ids in ` + "`Resources`" + `.
- Before starting risky, long-running, or interruptible task work, update the task's ` + "`work.md`" + ` with the current focus and any useful optional modules.
- Immediately after completing a coherent task step, update the task's ` + "`work.md`" + ` with the new focus and any useful optional modules; remove empty optional modules.
- Treat ` + "`log.jsonl`" + ` as the append-only timeline. Put important chronological events and completed-step history there; keep current state out of the log and history out of ` + "`work.md`" + `.
- Keep questions that may change scope, acceptance criteria, or stable constraints in the relevant brief. Keep short-lived execution questions in ` + "`work.md`" + `; promote durable answers to the brief and remove the temporary note.
- Use ` + "`forge task log add <title> --details <details>`" + ` or ` + "`forge project log add <title> --details <details>`" + ` to record important execution events.
- Prefer forge commands for creating, listing, and archiving tasks.
` + autoRunAgentGuidanceEnglish + `- When a GUI scheduler starts an AutoRun turn, finish it by calling exactly one of ` + "`forge task autorun complete`" + `, ` + "`forge task autorun suspend`" + `, ` + "`forge task autorun pause`" + `, or ` + "`forge task autorun fail`" + ` as the turn's last side-effecting command. ` + "`cancel`" + ` is a control-plane action for ending a generation and is not a scheduler-turn result.
- To delegate AutoRun work, create a child with ` + "`forge task create --autorun [--agent-profile=<profile>...] --prompt=<prompt> <title>`" + `. Use Agent Profiles supplied by the GUI session context rather than GUI-private Agent IDs. When suspending the current AutoRun, record a natural-language context with ` + "`--summary=<text>`" + ` and a separate wake condition with ` + "`--wake-condition=<text>`" + `; Forge stores the condition for the next agent but does not interpret it. For compatibility, an old summary-only suspend is treated as both fields and is marked as a fallback.
- Project and task ` + "`AGENTS.md`" + ` files are short launch cards. Keep global operating rules here, background context in ` + "`project.md`" + `/` + "`task.md`" + `, task recovery state in task ` + "`work.md`" + `, and timeline history in ` + "`log.jsonl`" + `.

## forge CLI

Use forge for deterministic workspace operations:

` + "```bash" + `
forge init [--language=<language>]
forge migrate [--language=<language>]

forge repo add [--bare] <name> <url>
forge repo list

forge project create [--slug <slug>] <description>
forge project list [--all]
forge project show [--project=<project>]
forge project archive [--project=<project>]
forge project log add [--project=<project>] [--details <text>|--details -] <title>
forge project log list [--project=<project>] [--json]

forge template list|show|validate|render|create|migrate ...

forge task create [<title>] [--project=<project>] [--slug <slug>] [--detail <detail>|--task-markdown <markdown>|--template=<name>] [--field <name>=<value>...] [--fields <file>] [--dry-run] [--autorun] ...
forge task list [--project=<project>] [--all] [--runnable [--json]]
forge task show [--project=<project>] [--task=<task>]
forge task archive [--project=<project>] [--task=<task>]
forge task log add [--project=<project>] [--task=<task>] [--details <text>|--details -] <title>
forge task log list [--project=<project>] [--task=<task>] [--json]
forge task repo add [--project=<project>] [--task=<task>] <repo-name> [--worktree <path>] [--branch <branch>] [--target <branch>] [--base <branch>]
forge task repo list [--project=<project>] [--task=<task>]
forge task repo remove [--project=<project>] [--task=<task>] <repo-name>
forge task autorun queue|start|retry|suspend|pause|resume|complete|fail|cancel ...

forge session new [--heartbeat [--timeout <duration>] | --pid <pid> | --agenthub --endpoint <url> --source-instance-id <id> --source-external-id <id> [--agenthub-session-id <id>]]
forge session bind-agenthub --id=<id> --agenthub-session-id=<id>
forge session heartbeat --id=<id>
forge session lock --id=<id> [--project=<project>] [--task=<task>]
forge session unlock --id=<id> [--project=<project>] [--task=<task>]
forge session end --id=<id>
forge session list
forge session show --id=<id>

forge workspace tree --json
forge workspace resource --id=<resource> --json

forge start [--project=<project>] [--task=<task>] [-- <agent command...>]
forge serve [--addr=<address>] [--workspace=<path>] [--version]
` + "```" + `

Notes:

- ` + "`forge init`" + ` creates a new workspace in the current directory and fails when run inside an existing workspace. Use ` + "`--language`" + ` to select ` + "`en`" + ` or ` + "`zh-CN`" + `.
- ` + "`forge migrate`" + ` refreshes forge-managed ` + "`AGENTS.md`" + ` prompt blocks in the enclosing workspace. Use ` + "`--language`" + ` to switch the workspace language.
- ` + "`forge repo add`" + ` creates a normal checkout by default; pass ` + "`--bare`" + ` for a bare repository layout.
- ` + "`forge project create`" + ` creates a new open project directory in the workspace. Use ` + "`--slug <slug>`" + ` to append a readable suffix to the directory name without changing the project id.
- ` + "`forge project list`" + ` lists open projects, or open and archived projects with ` + "`--all`" + `. It never includes tasks; use ` + "`forge task list [--project=<project>]`" + ` for project tasks.
- ` + "`forge project show`" + ` and ` + "`forge project archive`" + ` accept ` + "`--project=<project>`" + ` where project is a full id like ` + "`project22`" + ` or just a number like ` + "`22`" + `. When omitted, Forge uses the current directory's project.
- ` + "`forge template list/show/validate/render/create/migrate`" + ` manages schema V2 project content templates. Templates never select AutoRun or agents; choose execution settings explicitly at task creation.
- ` + "`forge task create`" + ` creates a new open task directory under a project. Use ` + "`--template`" + ` with typed fields to render content, and ` + "`--dry-run`" + ` to preview without side effects. Existing ` + "`--detail`" + ` and ` + "`--task-markdown`" + ` forms remain supported.
- ` + "`forge task list`" + ` lists open tasks under a project, or open and archived tasks with ` + "`--all`" + `. Use ` + "`--project=<project>`" + ` to select a project, or omit it to use the current directory's project.
- ` + "`forge task show`" + ` and ` + "`forge task archive`" + ` accept ` + "`--project=<project>`" + ` plus ` + "`--task=<task>`" + `. Task can be a short id like ` + "`task4`" + ` or just a number like ` + "`4`" + `. When omitted, Forge uses the current directory's task.
- ` + "`forge task archive`" + ` moves an open task into its project archive; ` + "`forge project archive`" + ` moves an open project into workspace ` + "`archive/`" + `.
- ` + "`forge task log add/list`" + ` and ` + "`forge project log add/list`" + ` write and read structured ` + "`log.jsonl`" + ` entries. Logs are displayed newest first, and ` + "`--details -`" + ` reads multiline details from standard input.
- ` + "`forge task repo add/list/remove`" + ` records, lists, or removes involved repositories in a task's ` + "`task.json`" + `. Task selection follows ` + "`forge task show`" + `. Projects do not store repository metadata.
- ` + "`forge session new`" + ` creates a session and prints a unique id. Use heartbeat liveness by default or explicitly with ` + "`--heartbeat [--timeout <duration>]`" + `; use ` + "`--pid <pid>`" + ` for process liveness. Forge GUI uses AgentHub liveness with a persisted endpoint and complete source, then ` + "`forge session bind-agenthub`" + ` records the final AgentHub session id. Plain CLI commands never contact AgentHub: an AgentHub-managed session stays active until ` + "`forge serve`" + ` reconciles a durable AgentHub terminal state (stopped, or archived provably after stopped) or the user explicitly ends it. While the service is stopped or AgentHub is unreachable, those sessions and their locks are conservatively retained. ` + "`forge session heartbeat --id=<id>`" + ` refreshes a heartbeat session timestamp. ` + "`forge session lock/unlock --id=<id>`" + ` records or releases project/task control, inferring the current task or project when selectors are omitted; workspace root does not need a lock. ` + "`forge session end --id=<id>`" + ` removes an active session immediately and releases all of its locks; it is the manual escape hatch for AgentHub-managed sessions. ` + "`forge session list`" + ` lists active sessions after pruning stale sessions, and ` + "`forge session show --id=<id>`" + ` prints one session as JSON.
- ` + "`forge workspace tree --json`" + ` prints a lightweight JSON tree of open projects, open tasks, and active sessions for GUI and tool integrations.
- ` + "`forge workspace resource --id=<resource> --json`" + ` prints detail JSON for one project or task.
- ` + "`forge start [--project=<project>] [--task=<task>] [-- <agent command...>]`" + ` is a plain Session launcher. It creates a session, locks the selected resource, runs the agent, and ends the session; it does not schedule or update AutoRun.
`
