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
		root = existingRoot
	}

	if err := os.MkdirAll(filepath.Join(root, reposDir), 0o755); err != nil {
		return err
	}
	if err := os.MkdirAll(filepath.Join(root, archiveDir), 0o755); err != nil {
		return err
	}
	if err := writeJSON(filepath.Join(root, configFile), Config{Version: 1}); err != nil {
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

- Open tasks live directly under this workspace as ` + "`taskN/`" + ` directories.
- Archived tasks live under ` + "`archive/`" + `.
- Git repositories live under ` + "`repos/`" + ` as normal checkouts by default.
- Treat repositories under ` + "`repos/`" + ` as shared source caches; make code changes in task worktrees.
- For code changes, create Git worktrees under the current task's ` + "`worktree/`" + ` directory.
- Each task owns its own ` + "`task.json`" + `, ` + "`task.md`" + `, ` + "`work.md`" + `, ` + "`log.md`" + `, ` + "`artifacts/`" + `, and ` + "`worktree/`" + `.
- Agents may read other task directories for reference.
- Agents should only update files inside the task they are currently handling and its worktrees.
- ` + "`task.json`" + ` records structured facts only, not workflow status.
- ` + "`task.md`" + ` is free-form task context.
- ` + "`work.md`" + ` records current state for interruption recovery.
- Before starting any meaningful step, update the current task's ` + "`work.md`" + ` with the step you are about to take.
- Immediately after completing any meaningful step, update ` + "`work.md`" + ` with what changed and the next step, so an interrupted task can always resume.
- ` + "`log.md`" + ` records append-oriented execution history.
- Prefer forge commands for creating, listing, and archiving tasks.

## forge CLI

Use forge for deterministic workspace operations:

` + "```bash" + `
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
` + "```" + `

Notes:

- ` + "`forge init`" + ` is safe to run multiple times. It updates only the forge-managed block in ` + "`AGENTS.md`" + `.
- ` + "`forge repo add`" + ` creates a normal checkout by default; pass ` + "`--bare`" + ` for legacy bare repositories.
- ` + "`forge task create`" + ` creates a new open task directory in the workspace.
- ` + "`forge task archive`" + ` moves an open top-level task into workspace ` + "`archive/`" + `, or an open subtask into its parent task's ` + "`archive/`" + `.
- ` + "`forge task repo add`" + ` records an involved repository in a task's ` + "`task.json`" + `.
- ` + "`forge subtask create`" + ` creates a direct child task directory under the parent task.
`
