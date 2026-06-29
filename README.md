# forge

forge is a small CLI for a local AgentWorkspace: a filesystem-based project/task workflow for AI agents, shared Git checkouts, and per-task Git worktrees.

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
  project1/
    AGENTS.md
    task.json
    task.md
    work.md
    log.md
    artifacts/
    worktree/
    project1.task1/
      AGENTS.md
      task.json
      task.md
      work.md
      log.md
      artifacts/
      worktree/
  archive/
```

Open projects live directly under the workspace. Open project tasks live directly under their project directories. Archived projects live under `archive/`. Archived project tasks live under their project directory's `archive/` directory. State is represented by location rather than a status field in `task.json`.

## Commands

```bash
forge init [--reset-workflows]
forge repo add [--bare] <name> <url>
forge repo list
forge start <resource-id> [-- <agent command...>]
forge project create [--workflow=<name>] <description>
forge project list [--all] [--tree]
forge project show <project-id>
forge project archive <project-id>
forge project repo add <project-id> <repo-name> [--worktree <path>] [--branch <branch>] [--target <branch>] [--base <branch>]
forge project repo list <project-id>
forge project repo remove <project-id> <repo-name>
forge task create <project-id> <description>
forge task list <project-id> [--all]
forge task show <id>
forge task archive <id>
forge task repo add <task-id> <repo-name> [--worktree <path>] [--branch <branch>] [--target <branch>] [--base <branch>]
forge task repo list <task-id>
forge task repo remove <task-id> <repo-name>
forge migrate project-tasks
```

`forge init` initializes the current directory as an AgentWorkspace, or refreshes the enclosing workspace when run from inside an existing project/task. It creates `forge.json`, `repos/`, `archive/`, `workflow/`, and forge-managed blocks in `AGENTS.md` files. It is safe to rerun. Use `--reset-workflows` to rewrite Forge's built-in `workflow/default.md` and `workflow/project.md` while preserving custom workflow files.

`forge repo add <name> <url>` clones a normal checkout into `repos/<name>`. Repository names may include path segments such as `disksing/forge`. Use `--bare` to create a legacy bare repository at `repos/<name>.git`.

`forge repo list` lists repositories known to the workspace.

`forge start <resource-id> [-- <agent command...>]` runs an agent command in the project or task directory. Explicit command arguments after `--` override the workspace `forge.json` default. Configure the default as `agentCommand`, either as a string such as `"codex --dangerously-bypass-approvals-and-sandbox"` or an argument array such as `["codex", "--dangerously-bypass-approvals-and-sandbox"]`.

`forge project create [--workflow=<name>] <description>` creates the next top-level project directory with its task files, `artifacts/`, and `worktree/`. By default, Forge inserts `workflow/default.md` into the generated project `AGENTS.md` workflow guidance section; `--workflow=<name>` uses `workflow/<name>.md`. Generated `task.md` contains only the project title and description.

`forge project list` lists open projects. Use `--all` to include archived projects. Use `--tree` to include open tasks under each project.

`forge task create <project-id> <description>` creates the next task under a project, using IDs such as `project1.task1`.

`forge task list <project-id>` lists open tasks under a project. Use `--all` to include archived tasks.

`forge task show <id>` prints a project or task's `task.json`.

`forge task archive <id>` moves an open task into its project archive. Use `forge project archive <project-id>` to archive a project into workspace `archive/`.

`forge task repo add <task-id> <repo-name>` adds or updates a repository entry in the task's `task.json`. Optional `--worktree`, `--branch`, `--target`, and `--base` flags record the exact worktree and branch metadata.

`forge task repo list <task-id>` lists repositories recorded in a task's `task.json`.

`forge task repo remove <task-id> <repo-name>` removes a repository entry from a task's `task.json`.

`forge migrate project-tasks` rewrites an old task/subtask workspace into the two-level project/task layout: old `taskN/` directories become `projectN/`, and old child task directories are promoted to direct project tasks such as `projectN.taskM/`.

`forge init` is safe to run multiple times. It creates or updates workspace scaffolding, writes built-in workflow files only when `workflow/` does not already exist, rewrites only the forge-managed prompt block in the workspace `AGENTS.md`, and refreshes forge-managed prompt blocks for open project/task `AGENTS.md` files:

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

Each project and task directory contains:

- `task.json`: structured facts such as id, type, parent id, description, selected workflow, and involved repositories.
- `task.md`: background context generated from the resource title and description.
- `work.md`: mutable recovery snapshot containing only the current step, current state, blockers, and next step.
- `log.md`: append-oriented execution log for chronological events, command results, and completed-step history.
- `artifacts/`: generated reports, screenshots, patches, and other outputs.
- `worktree/`: Git worktrees for code changes.

Agents may update the current task's `task.json` when they discover new involved repositories.

Use `forge task repo add` for those structured updates:

```bash
forge task repo add project3.task1 disksing/forge --branch agent/project3-task1-repos --target master
```

If `--worktree` is omitted, forge records `<resource-id>/worktree/<repo>` by default for projects and `<project-id>/<task-id>/worktree/<repo>` for tasks. If `--branch` or `--target` is omitted, forge tries to infer the current worktree branch and repository default branch.

## Development

```bash
go test ./...
go run ./cmd/forge help
```

## Companion Tools

- [iTerm2 Toolbelt](contrib/iterm2/README.md): browse AgentWorkspace tasks and launch shells or Codex sessions from an iTerm2 Toolbelt panel.
