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
    project.json
    project.md
    work.md
    log.md
    artifacts/
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

Open projects live directly under the workspace with names such as `project1/` or `project1-forge-dev/`. Open project tasks live directly under their project directories with short names such as `task1/` or `task1-develop-forge/`, while their resource ids remain full ids such as `project1.task1`. Archived projects live under `archive/`. Archived project tasks live under their project directory's `archive/` directory. State is represented by location rather than a status field in `project.json` or `task.json`.

## Commands

```bash
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
```

`forge init` initializes the current directory as a new AgentWorkspace. It must be run outside any existing workspace, and creates `forge.json`, `repos/`, `archive/`, `workflow/`, and a forge-managed block in `AGENTS.md`.

`forge repo add <name> <url>` clones a normal checkout into `repos/<name>`. Repository names may include path segments such as `disksing/forge`. Use `--bare` to create a legacy bare repository at `repos/<name>.git`.

`forge repo list` lists repositories known to the workspace.

`forge start <resource-id> [-- <agent command...>]` runs an agent command in the project or task directory. Explicit command arguments after `--` override the workspace `forge.json` default. Configure the default as `agentCommand`, either as a string such as `"codex --dangerously-bypass-approvals-and-sandbox"` or an argument array such as `["codex", "--dangerously-bypass-approvals-and-sandbox"]`.

`forge project create [--workflow=<name>] [--slug <slug>] <description>` creates the next top-level project directory with `project.json`, `project.md`, `work.md`, `log.md`, `AGENTS.md`, and `artifacts/`. Projects do not store repository metadata and do not own `worktree/` directories. By default, Forge inserts `workflow/default.md` into the generated project `AGENTS.md` workflow guidance section; `--workflow=<name>` uses `workflow/<name>.md`. Use `--slug <slug>` to create a directory such as `project1-forge-dev/` while keeping the resource id as `project1`. Generated `project.md` contains only the project title and description.

`forge project list` lists open projects. Use `--all` to include archived projects. It never includes tasks; use `forge task list [--project=<project>]` for project tasks.

`forge project show [--project=<project>]` prints a project's `project.json`. `<project>` may be a full id such as `project22` or just a number such as `22`. When omitted, Forge uses the project containing the current working directory.

`forge project archive [--project=<project>]` moves a project into workspace `archive/`. `<project>` follows the same rules as `forge project show`.

`forge task create [--project=<project>] [--slug <slug>] <description>` creates the next task under a project. The task id is full, such as `project1.task1`, while the directory name is short, such as `project1/task1/` or `project1/task1-develop-forge/`. `<project>` may be a full id such as `project22` or just a number such as `22`. When omitted, Forge uses the project containing the current working directory.

`forge task list [--project=<project>] [--all]` lists open tasks under a project. Use `--all` to include archived tasks. `<project>` follows the same rules as `forge task create`; when omitted, Forge uses the project containing the current working directory.

`forge task show [--project=<project>] [--task=<task>]` prints a task's `task.json`. `<task>` may be a short id such as `task4` or just a number such as `4`. Forge combines it with `--project` when provided, otherwise the current directory's project. When `--task` is omitted, Forge uses the task containing the current working directory.

`forge task archive [--project=<project>] [--task=<task>]` moves an open task into its project archive. `<task>` follows the same rules as `forge task show`.

`forge task repo add [--project=<project>] [--task=<task>] <repo-name>` adds or updates a repository entry in the task's `task.json`. Optional `--worktree`, `--branch`, `--target`, and `--base` flags record the exact worktree and branch metadata. Task selection follows `forge task show`.

`forge task repo list [--project=<project>] [--task=<task>]` lists repositories recorded in a task's `task.json`. Task selection follows `forge task show`.

`forge task repo remove [--project=<project>] [--task=<task>] <repo-name>` removes a repository entry from a task's `task.json`. Task selection follows `forge task show`.

`forge migrate` refreshes Forge-managed generated content in the enclosing workspace: built-in workflow templates, the workspace `AGENTS.md` managed block, and open project/task `AGENTS.md` managed blocks.

`forge migrate` is safe to run multiple times. It rewrites built-in workflow templates, rewrites only forge-managed prompt blocks, and preserves content outside managed blocks:

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

## Project And Task Files

Each project directory contains:

- `project.json`: structured project facts such as id, type, description, and selected workflow.
- `project.md`: project background context generated from the project title and description.
- `work.md`: mutable recovery snapshot containing only the current step, current state, blockers, and next step.
- `log.md`: append-oriented execution log for chronological events, command results, and completed-step history.
- `artifacts/`: generated reports, screenshots, patches, and other outputs.

Each task directory contains:

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

If `--worktree` is omitted, forge records `<project-id>/taskN/worktree/<repo>` by default. If `--branch` or `--target` is omitted, forge tries to infer the current worktree branch and repository default branch.

## Development

```bash
go test ./...
go run ./cmd/forge help
```

## Companion Tools

- [iTerm2 Toolbelt](contrib/iterm2/README.md): browse AgentWorkspace tasks and launch shells or Codex sessions from an iTerm2 Toolbelt panel.
