package app

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

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
` + crossResourceReadGuidanceEnglish + resourceCommunicationGuidanceEnglish + `- Workspace file boundaries are coordinated through these instructions; they are not a host filesystem sandbox.
- Open projects live directly under this workspace as ` + "`projectN/`" + ` or ` + "`projectN-slug/`" + ` directories.
- Project tasks live directly under their project directories as short ` + "`taskM/`" + ` or ` + "`taskM-slug/`" + ` directories; resource ids remain full ids like ` + "`projectN.taskM`" + `.
- Archived projects live under ` + "`archive/`" + `. Archived project tasks live under their project directory's ` + "`archive/`" + ` directory.
- Project content templates live under each project's ` + "`templates/`" + ` directory.
- When creating a task in a project, check that project's ` + "`templates/`" + ` directory and prefer an existing suitable template whenever one is available.
- When creating a task from a template, preserve all existing template rules by default. Do not delete, weaken, bypass, or accidentally override them; override a particular rule only when the user explicitly asks for that override.
- Git repositories live under ` + "`repos/`" + ` as normal checkouts by default.
- Treat repositories under ` + "`repos/`" + ` as shared source caches; make code changes in task worktrees.
- Projects own ` + "`project.json`" + `, ` + "`project.md`" + `, ` + "`log.jsonl`" + `, ` + "`AGENTS.md`" + `, and ` + "`artifacts/`" + `.
- Tasks own ` + "`task.json`" + `, ` + "`task.md`" + `, ` + "`work.md`" + `, ` + "`log.jsonl`" + `, ` + "`AGENTS.md`" + `, ` + "`artifacts/`" + `, and ` + "`worktree/`" + `.
- Projects do not store repository metadata and do not manage worktrees. For code changes, create Git worktrees under the current task's ` + "`worktree/`" + ` directory.
- Read-only inspection of other task directories is allowed without an extra lock; use the state files and Forge commands described above.
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
- Project and task ` + "`AGENTS.md`" + ` files are short launch cards. Keep global operating rules here, background context in ` + "`project.md`" + `/` + "`task.md`" + `, task recovery state in task ` + "`work.md`" + `, and timeline history in ` + "`log.jsonl`" + `.

## forge CLI

Use forge for deterministic workspace operations:

` + "```bash" + `
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

forge template list|show|validate|render|create|migrate ...

forge task create [<title>] [--project=<project>] [--slug <slug>] [--creator=user|agent] [--detail <detail>|--task-markdown <markdown>|--template=<name>] [--field <name>=<value>...] [--fields <file>] [--dry-run]
forge task list [--project=<project>] [--all]
forge task show [--project=<project>] [--task=<task>]
forge task archive [--project=<project>] [--task=<task>]
forge task log add [--project=<project>] [--task=<task>] [--details <text>|--details -] <title>
forge task log list [--project=<project>] [--task=<task>] [--json]
forge task repo add [--project=<project>] [--task=<task>] <repo-name> [--worktree <path>] [--branch <branch>] [--target <branch>] [--base <branch>]
forge task repo list [--project=<project>] [--task=<task>]
forge task repo remove [--project=<project>] [--task=<task>] <repo-name>
forge workspace status [--server=<url>]
forge project status [--project=<project>] [--server=<url>]
forge task status [--project=<project>] [--task=<task>] [--server=<url>]
forge workspace history [--cursor=<cursor>] [--limit=<n>] [--server=<url>] [--json]
forge project history [--project=<project>] [--cursor=<cursor>] [--limit=<n>] [--server=<url>] [--json]
forge task history [--project=<project>] [--task=<task>] [--cursor=<cursor>] [--limit=<n>] [--server=<url>] [--json]
forge history turn show --ref=<reference> [--server=<url>] [--json]
forge history event show --ref=<reference> [--server=<url>] [--json]
forge message send --to=<resource> [--mode=steer|enqueue|interrupt] [--server=<url>] <message>
forge message show --id=<message-id> [--server=<url>]
forge session list
forge session show --id=<generationId>

forge workspace tree --json
forge workspace resource --id=<resource> --json

forge serve [--addr=<address>] [--workspace=<path>] [--version]
` + "```" + `

Notes:

- ` + "`forge init`" + ` creates a new workspace in the current directory and fails when run inside an existing workspace. Use ` + "`--language`" + ` to select ` + "`en`" + ` or ` + "`zh-CN`" + `.
- ` + "`forge migrate`" + ` refreshes forge-managed ` + "`AGENTS.md`" + ` prompt blocks in the enclosing workspace. Use ` + "`--language`" + ` to switch the workspace language.
- ` + "`forge repo add`" + ` creates a normal checkout by default; pass ` + "`--bare`" + ` for a bare repository layout.
- ` + "`forge init`" + `, ` + "`forge project create`" + `, and ` + "`forge task create`" + ` accept ` + "`--creator=user|agent`" + `. A verified Forge resource environment defaults to Agent provenance; all other invocations default to user. Creator metadata records provenance only, not authority.
- Resource creation is local and creates neither an initial message nor a generation. After creation, send the first message separately with ` + "`forge message send --to=<resource> ...`" + `; that accepted message creates a generation lazily. If create output is ambiguous, query the resource before attempting another create.
- ` + "`forge project create`" + ` creates a new open project directory in the workspace. Use ` + "`--slug <slug>`" + ` to append a readable suffix to the directory name without changing the project id.
- ` + "`forge project list`" + ` lists open projects, or open and archived projects with ` + "`--all`" + `. It never includes tasks; use ` + "`forge task list [--project=<project>]`" + ` for project tasks.
- ` + "`forge project show`" + ` and ` + "`forge project archive`" + ` accept ` + "`--project=<project>`" + ` where project is a full id like ` + "`project22`" + ` or just a number like ` + "`22`" + `. When omitted, Forge uses the current directory's project.
- ` + "`forge template list/show/validate/render/create/migrate`" + ` manages schema V2 project content templates. ` + "`forge template show <name>`" + ` defaults to human-readable metadata, field requirements, diagnostics, and the complete Markdown body; use ` + "`--raw`" + ` for the original file, ` + "`--json`" + ` for structured data, or ` + "`--schema`" + ` for schema metadata and diagnostics. Templates describe task content only.
- ` + "`forge task create`" + ` creates a new open task directory under a project. Use ` + "`--template`" + ` with typed fields to render content, and ` + "`--dry-run`" + ` to preview without side effects. Existing ` + "`--detail`" + ` and ` + "`--task-markdown`" + ` forms remain supported.
- ` + "`forge task list`" + ` lists open tasks under a project, or open and archived tasks with ` + "`--all`" + `. Use ` + "`--project=<project>`" + ` to select a project, or omit it to use the current directory's project.
- ` + "`forge task show`" + ` and ` + "`forge task archive`" + ` accept ` + "`--project=<project>`" + ` plus ` + "`--task=<task>`" + `. Task can be a short id like ` + "`task4`" + ` or just a number like ` + "`4`" + `. When omitted, Forge uses the current directory's task.
- ` + "`forge task archive`" + ` moves an open task into its project archive; ` + "`forge project archive`" + ` moves an open project into workspace ` + "`archive/`" + `.
- ` + "`forge task log add/list`" + ` and ` + "`forge project log add/list`" + ` write and read structured ` + "`log.jsonl`" + ` entries. Logs are displayed newest first, and ` + "`--details -`" + ` reads multiline details from standard input.
- ` + "`forge task repo add/list/remove`" + ` records, lists, or removes involved repositories in a task's ` + "`task.json`" + `. Task selection follows ` + "`forge task show`" + `. Projects do not store repository metadata.
- ` + "`forge session list`" + ` and ` + "`forge session show --id=<generationId>`" + ` provide read-only diagnostics derived from resource generations. They do not create, modify, end, take over, or contact AgentHub Sessions.
- ` + "`forge workspace tree --json`" + ` prints a lightweight JSON tree of open projects, open tasks, and their resource runtime state for GUI and tool integrations.
- ` + "`forge workspace resource --id=<resource> --json`" + ` prints detail JSON for one project or task.
- Creator Turn results and terminal delivery notices arrive as durable structured system messages in the resource mailbox. Use ` + "`forge message show`" + ` and ` + "`forge history turn show`" + ` with their stable references for diagnosis.
`
