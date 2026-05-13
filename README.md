# forge

forge is a small CLI for a local AgentWorkspace: a filesystem-based task workflow for AI agents, shared Git checkouts, and per-task Git worktrees.

The design is intentionally simple. forge creates and moves task directories; agents decide how to plan and execute work inside those directories.

## Workspace Layout

```text
AgentWorkspace/
  AGENTS.md
  forge.json
  workflow/
    default.md
    project.md
  repos/
    owner/repo/
  task1/
    AGENTS.md
    task.json
    task.md
    work.md
    log.md
    artifacts/
    worktree/
  archive/
```

Open top-level tasks live directly under the workspace. Archived top-level tasks live under `archive/`. Archived subtasks live under their parent task's `archive/` directory. Task state is represented by location rather than a status field in `task.json`.

## Commands

```bash
forge init [--reset-workflows]
forge repo add [--bare] <name> <url>
forge repo list
forge task create [--workflow=<name>] <description>
forge task list [--all]
forge task show <id>
forge task archive <id>
forge task repo add <task-id> <repo-name> [--worktree <path>] [--branch <branch>] [--target <branch>] [--base <branch>]
forge task repo list <task-id>
forge task repo remove <task-id> <repo-name>
forge subtask create <task-id> <description>
forge subtask list <task-id> [--all]
```

`forge init` initializes the current directory as an AgentWorkspace, or refreshes the enclosing workspace when run from inside an existing task/subtask. It creates `forge.json`, `repos/`, `archive/`, `workflow/`, and forge-managed blocks in `AGENTS.md` files. It is safe to rerun. Use `--reset-workflows` to rewrite Forge's built-in `workflow/default.md` and `workflow/project.md` while preserving custom workflow files.

`forge repo add <name> <url>` clones a normal checkout into `repos/<name>`. Repository names may include path segments such as `disksing/forge`. Use `--bare` to create a legacy bare repository at `repos/<name>.git`.

`forge repo list` lists repositories known to the workspace.

`forge task create [--workflow=<name>] <description>` creates the next top-level task directory with its task files, `artifacts/`, and `worktree/`. By default, Forge inserts `workflow/default.md` into the generated task `AGENTS.md` workflow guidance section; `--workflow=<name>` uses `workflow/<name>.md`. Generated `task.md` contains only the task title and description.

`forge task list` lists open top-level tasks. Use `--all` to include archived tasks.

`forge task show <id>` prints a task or subtask's `task.json`.

`forge task archive <id>` moves an open task into its archive. Top-level tasks move into workspace `archive/`; subtasks move into their parent task's `archive/` directory.

`forge task repo add <task-id> <repo-name>` adds or updates a repository entry in the task's `task.json`. Optional `--worktree`, `--branch`, `--target`, and `--base` flags record the exact worktree and branch metadata.

`forge task repo list <task-id>` lists repositories recorded in a task's `task.json`.

`forge task repo remove <task-id> <repo-name>` removes a repository entry from a task's `task.json`.

`forge subtask create <task-id> <description>` creates the next direct child task under the parent task.

`forge subtask list <task-id>` lists open direct subtasks of a task. Use `--all` to include archived subtasks.

`forge init` is safe to run multiple times. It creates or updates workspace scaffolding, writes built-in workflow files only when `workflow/` does not already exist, rewrites only the forge-managed prompt block in the workspace `AGENTS.md`, and refreshes forge-managed prompt blocks for open task/subtask `AGENTS.md` files:

```md
<!-- managed by forge cli -->
...
<!-- end of forge cli prompt -->
```

Content outside that block belongs to people and agents and is preserved.

`forge repo add` uses normal `git clone` by default so source code is readable under `repos/`. forge does not create mirror repositories. Use `--bare` only when a bare repository is explicitly needed.

Repository names may include path segments:

```bash
forge repo add disksing/forge https://github.com/disksing/forge.git
```

This creates:

```text
repos/disksing/forge/
```

The legacy bare form is still available:

```bash
forge repo add --bare disksing/forge https://github.com/disksing/forge.git
```

That creates:

```text
repos/disksing/forge.git
```

## Task Files

Each task directory contains:

- `task.json`: structured facts such as task id, parent id, description, selected workflow, and involved repositories.
- `task.md`: task background context generated from the task title and description.
- `work.md`: mutable recovery snapshot containing only the current step, current state, blockers, and next step.
- `log.md`: append-oriented execution log for chronological events, command results, and completed-step history.
- `artifacts/`: generated reports, screenshots, patches, and other outputs.
- `worktree/`: Git worktrees for code changes.

Agents may update the current task's `task.json` when they discover new involved repositories.

Use `forge task repo add` for those structured updates:

```bash
forge task repo add task3 disksing/forge --branch agent/task3-task-repos --target master
```

If `--worktree` is omitted, forge records `taskN/worktree/<repo>` by default. If `--branch` or `--target` is omitted, forge tries to infer the current worktree branch and repository default branch.

## Development

```bash
go test ./...
go run ./cmd/forge help
```
