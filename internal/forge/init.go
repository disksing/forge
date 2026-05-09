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

	fmt.Printf("initialized AgentWorkspace at %s\n", root)
	return nil
}

func updateAgentsMD(path string) error {
	content := ""
	if data, err := os.ReadFile(path); err == nil {
		content = string(data)
	} else if !os.IsNotExist(err) {
		return err
	}

	updated, err := upsertManagedBlock(content, forgePromptBlock())
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

const (
	forgePromptStart = "<!-- managed by forge cli -->"
	forgePromptEnd   = "<!-- end of forge cli prompt -->"
)

const workspaceAgentsPrompt = `# AgentWorkspace

This directory is an AgentWorkspace managed by forge.

- Open tasks live directly under this workspace as ` + "`taskN/`" + ` directories.
- Archived tasks live under ` + "`archive/`" + `.
- Bare Git repositories live under ` + "`repos/`" + `.
- Do not modify bare repositories directly.
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
forge repo add <name> <url>
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
- ` + "`forge repo add`" + ` creates a bare repository with ` + "`git clone --bare`" + `.
- ` + "`forge task create`" + ` creates a new open task directory in the workspace.
- ` + "`forge task archive`" + ` moves an open task into ` + "`archive/`" + `.
- ` + "`forge task repo add`" + ` records an involved repository in a task's ` + "`task.json`" + `.
- ` + "`forge subtask create`" + ` creates a direct child task directory under the parent task.
`
