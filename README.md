# forge

forge is a small CLI for a local AgentWorkspace: a filesystem-based task workflow for AI agents, bare Git repositories, and per-task Git worktrees.

The design is intentionally simple. forge creates and moves task directories; agents decide how to plan and execute work inside those directories.

## Workspace Layout

```text
AgentWorkspace/
  AGENTS.md
  forge.json
  repos/
    owner/repo.git
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

Open tasks live directly under the workspace. Archived tasks live under `archive/`. Task state is represented by location rather than a status field in `task.json`.

## Commands

```bash
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
```

`forge init` initializes the current directory as an AgentWorkspace. It creates `forge.json`, `repos/`, `archive/`, and a forge-managed block in `AGENTS.md`. It is safe to rerun.

`forge repo add <name> <url>` clones a bare repository into `repos/<name>.git`. Repository names may include path segments such as `disksing/forge`.

`forge repo list` lists bare repositories known to the workspace.

`forge task create <description>` creates the next top-level task directory with its task files, `artifacts/`, and `worktree/`.

`forge task list` lists open top-level tasks.

`forge task show <id>` prints a task or subtask's `task.json`.

`forge task archive <id>` moves an open top-level task into `archive/`.

`forge task repo add <task-id> <repo-name>` adds or updates a repository entry in the task's `task.json`. Optional `--worktree`, `--branch`, `--target`, and `--base` flags record the exact worktree and branch metadata.

`forge task repo list <task-id>` lists repositories recorded in a task's `task.json`.

`forge task repo remove <task-id> <repo-name>` removes a repository entry from a task's `task.json`.

`forge subtask create <task-id> <description>` creates the next direct child task under the parent task.

`forge subtask list <task-id>` lists direct subtasks of a task.

`forge init` is safe to run multiple times. It creates or updates workspace scaffolding and rewrites only the forge-managed prompt block in `AGENTS.md`:

```md
<!-- managed by forge cli -->
...
<!-- end of forge cli prompt -->
```

Content outside that block belongs to people and agents and is preserved.

`forge repo add` uses `git clone --bare`. forge does not create mirror repositories.

Repository names may include path segments:

```bash
forge repo add disksing/forge https://github.com/disksing/forge.git
```

This creates:

```text
repos/disksing/forge.git
```

## Task Files

Each task directory contains:

- `task.json`: structured facts such as task id, parent id, description, and involved repositories.
- `task.md`: free-form task context, requirements, plans, and acceptance notes.
- `work.md`: current state for interruption recovery.
- `log.md`: append-oriented execution log.
- `artifacts/`: generated reports, screenshots, patches, and other outputs.
- `worktree/`: Git worktrees for code changes.

Agents may update the current task's `task.json` when they discover new involved repositories.

Use `forge task repo add` for those structured updates:

```bash
forge task repo add task3 disksing/forge --branch agent/task3-task-repos --target master
```

If `--worktree` is omitted, forge records `taskN/worktree/<repo>` by default. If `--branch` or `--target` is omitted, forge tries to infer the current worktree branch and the bare repository default branch.

## Development

```bash
go test ./...
go run ./cmd/forge help
```
