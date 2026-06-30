package forge

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

func runInit(args []string) error {
	if len(args) != 0 {
		return fmt.Errorf("usage: forge init")
	}

	root, err := os.Getwd()
	if err != nil {
		return err
	}
	if existingRoot, err := findEnclosingWorkspaceRoot(root); err != nil {
		return err
	} else if existingRoot != "" {
		return fmt.Errorf("cannot initialize workspace inside existing workspace: %s", existingRoot)
	}

	if err := os.MkdirAll(filepath.Join(root, reposDir), 0o755); err != nil {
		return err
	}
	if err := os.MkdirAll(filepath.Join(root, archiveDir), 0o755); err != nil {
		return err
	}
	config := Config{Version: 1}
	if err := readJSON(filepath.Join(root, configFile), &config); err != nil && !os.IsNotExist(err) {
		return err
	}
	config.Version = 1
	if err := writeJSON(filepath.Join(root, configFile), config); err != nil {
		return err
	}
	if err := ensureWorkflowFiles(root, false); err != nil {
		return err
	}
	if err := updateAgentsMD(filepath.Join(root, "AGENTS.md")); err != nil {
		return err
	}
	if err := updateOpenTaskAgentsMD(root); err != nil {
		return err
	}

	fmt.Printf("initialized AgentWorkspace at %s\n", root)
	return nil
}

func runWorkspaceMigrate(args []string) error {
	if len(args) != 0 {
		return fmt.Errorf("usage: forge migrate")
	}
	root, err := findWorkspaceRoot()
	if err != nil {
		return err
	}
	if err := ensureWorkflowFiles(root, true); err != nil {
		return err
	}
	if err := updateAgentsMD(filepath.Join(root, "AGENTS.md")); err != nil {
		return err
	}
	if err := updateOpenTaskAgentsMD(root); err != nil {
		return err
	}
	fmt.Printf("migrated AgentWorkspace at %s\n", root)
	return nil
}

func ensureWorkflowFiles(root string, reset bool) error {
	dir := filepath.Join(root, workflowDir)
	if !reset && isDir(dir) {
		return nil
	}
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return err
	}
	for name, content := range builtinWorkflows {
		path := filepath.Join(dir, name+".md")
		if !reset && pathExists(path) {
			continue
		}
		if err := os.WriteFile(path, []byte(content), 0o644); err != nil {
			return err
		}
	}
	return nil
}

func updateAgentsMD(path string) error {
	return updateAgentsMDWithBlock(path, forgePromptBlock())
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

func forgePromptBlock() string {
	return forgePromptStart + "\n" + workspaceAgentsPrompt + forgePromptEnd
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

const workspaceAgentsPrompt = `# AgentWorkspace

This directory is an AgentWorkspace managed by forge.

- Open projects live directly under this workspace as ` + "`projectN/`" + ` or ` + "`projectN-slug/`" + ` directories.
- Project tasks live directly under their project directories as short ` + "`taskM/`" + ` or ` + "`taskM-slug/`" + ` directories; resource ids remain full ids like ` + "`projectN.taskM`" + `.
- Archived projects live under ` + "`archive/`" + `. Archived project tasks live under their project directory's ` + "`archive/`" + ` directory.
- Workflow instruction files live under ` + "`workflow/`" + ` and are inserted into generated project/task ` + "`AGENTS.md`" + ` files.
- Git repositories live under ` + "`repos/`" + ` as normal checkouts by default.
- Treat repositories under ` + "`repos/`" + ` as shared source caches; make code changes in task worktrees.
- Projects own ` + "`project.json`" + `, ` + "`project.md`" + `, ` + "`work.md`" + `, ` + "`log.md`" + `, ` + "`AGENTS.md`" + `, and ` + "`artifacts/`" + `.
- Tasks own ` + "`task.json`" + `, ` + "`task.md`" + `, ` + "`work.md`" + `, ` + "`log.md`" + `, ` + "`AGENTS.md`" + `, ` + "`artifacts/`" + `, and ` + "`worktree/`" + `.
- Projects do not store repository metadata and do not manage worktrees. For code changes, create Git worktrees under the current task's ` + "`worktree/`" + ` directory.
- Agents may read other task directories for reference.
- Agents should only update files inside the task they are currently handling and its worktrees.
- ` + "`project.json`" + ` and ` + "`task.json`" + ` record structured facts only, not progress notes.
- ` + "`project.md`" + ` and ` + "`task.md`" + ` are background context.
- ` + "`work.md`" + ` is a mutable recovery snapshot, not a chronological log. Keep only the current step, current state, blockers, and next step.
- Before starting any meaningful step, replace stale ` + "`work.md`" + ` content with the step you are about to take.
- Immediately after completing any meaningful step, replace stale ` + "`work.md`" + ` content with the updated current state and next step.
- Do not append timeline history to ` + "`work.md`" + `. Put chronological events, command results, and completed-step history in ` + "`log.md`" + `.
- ` + "`log.md`" + ` records append-oriented execution history.
- Prefer forge commands for creating, listing, and archiving tasks.

## forge CLI

Use forge for deterministic workspace operations:

` + "```bash" + `
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
` + "```" + `

Notes:

- ` + "`forge init`" + ` creates a new workspace in the current directory and fails when run inside an existing workspace.
- ` + "`forge migrate`" + ` refreshes built-in workflow templates and forge-managed ` + "`AGENTS.md`" + ` prompt blocks in the enclosing workspace.
- ` + "`forge repo add`" + ` creates a normal checkout by default; pass ` + "`--bare`" + ` for legacy bare repositories.
- ` + "`forge project create`" + ` creates a new open project directory in the workspace. Use ` + "`--workflow=<name>`" + ` to select the workflow instruction file inserted into the project ` + "`AGENTS.md`" + `. Use ` + "`--slug <slug>`" + ` to append a readable suffix to the directory name without changing the project id.
- ` + "`forge project list`" + ` lists open projects, or open and archived projects with ` + "`--all`" + `. It never includes tasks; use ` + "`forge task list [--project=<project>]`" + ` for project tasks.
- ` + "`forge project show`" + ` and ` + "`forge project archive`" + ` accept ` + "`--project=<project>`" + ` where project is a full id like ` + "`project22`" + ` or just a number like ` + "`22`" + `. When omitted, Forge uses the current directory's project.
- ` + "`forge task create`" + ` creates a new open task directory under a project. Use ` + "`--project=<project>`" + ` to select a project, or omit it to use the current directory's project. Use ` + "`--slug <slug>`" + ` to append a readable suffix to the directory name without changing the task id.
- ` + "`forge task list`" + ` lists open tasks under a project, or open and archived tasks with ` + "`--all`" + `. Use ` + "`--project=<project>`" + ` to select a project, or omit it to use the current directory's project.
- ` + "`forge task show`" + ` and ` + "`forge task archive`" + ` accept ` + "`--project=<project>`" + ` plus ` + "`--task=<task>`" + `. Task can be a short id like ` + "`task4`" + ` or just a number like ` + "`4`" + `. When omitted, Forge uses the current directory's task.
- ` + "`forge task archive`" + ` moves an open task into its project archive; ` + "`forge project archive`" + ` moves an open project into workspace ` + "`archive/`" + `.
- ` + "`forge task repo add/list/remove`" + ` records, lists, or removes involved repositories in a task's ` + "`task.json`" + `. Task selection follows ` + "`forge task show`" + `. Projects do not store repository metadata.
- ` + "`forge start <resource-id> [-- <agent command...>]`" + ` runs an agent command in the project or task directory. Without an explicit command, it uses ` + "`agentCommand`" + ` from workspace ` + "`forge.json`" + `.
`
