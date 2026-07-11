# forge

forge is a small CLI for a local AgentWorkspace: a filesystem-based project/task workflow for AI agents, shared Git checkouts, and per-task Git worktrees.

The design is intentionally simple. All workspace data lives on the filesystem as project/task directories, JSON/Markdown files, logs, artifacts, and task worktrees. Agents coordinate writes with sessions that lock the project or task they update; stale locks are pruned from session liveness. Agents may read other projects and tasks freely for context, but should only update resources they have locked. When an agent is started through `forge-start`, Forge creates a PID-liveness session, locks the selected resource, injects `FORGE_SESSION_ID`, and ends the session when the command exits. The workspace root does not require a lock.

## Workspace Layout

```text
AgentWorkspace/
  AGENTS.md
  forge.json
  repos/
    owner/repo/
  project1/
    AGENTS.md
    project.json
    project.md
    log.jsonl
    artifacts/
    templates/
    task1/
      AGENTS.md
      task.json
      task.md
      work.md
      log.jsonl
      artifacts/
      worktree/
  archive/
```

Open projects live directly under the workspace with names such as `project1/` or `project1-forge-dev/`. Open project tasks live directly under their project directories with short names such as `task1/` or `task1-develop-forge/`, while their resource ids remain full ids such as `project1.task1`. Archived projects live under `archive/`. Archived project tasks live under their project directory's `archive/` directory. Open/archive state is represented by location; an optional `task.json.run` object records non-interactive execution state.

## Commands

```bash
forge --version

forge init
forge migrate

forge repo add [--bare] <name> <url>
forge repo list

forge project create [--slug <slug>] <description>
forge project list [--all]
forge project show [--project=<project>]
forge project archive [--project=<project>]

forge task create [--project=<project>] [--slug <slug>] [--detail <detail>] [--non-interactive] [--agent=<agent>] [--prompt=<prompt>] [--after=<task>...] <title>
forge task list [--project=<project>] [--all] [--runnable [--include-blocked] [--json]]
forge task show [--project=<project>] [--task=<task>]
forge task archive [--project=<project>] [--task=<task>]
forge task repo add [--project=<project>] [--task=<task>] <repo-name> [--worktree <path>] [--branch <branch>] [--target <branch>] [--base <branch>]
forge task repo list [--project=<project>] [--task=<task>]
forge task repo remove [--project=<project>] [--task=<task>] <repo-name>
forge task run configure|queue|start|complete|wait|pause|fail|settle ...

forge session new [--heartbeat [--timeout <duration>] | --pid <pid> | --gui-run --workspace-id <id> --run-id <id> --endpoint <url>]
forge session heartbeat --id=<id>
forge session lock --id=<id> [--project=<project>] [--task=<task>]
forge session unlock --id=<id> [--project=<project>] [--task=<task>]
forge session list
forge session show --id=<id>

forge workspace tree --json
forge workspace resource --id=<resource> --json

forge-start [--project=<project>] [--task=<task>] [-- <agent command...>]
```

`forge --version` prints the build-time git branch and sha.

`forge init` initializes the current directory as a new AgentWorkspace. It must be run outside any existing workspace, and creates `forge.json`, `repos/`, `archive/`, and a forge-managed block in `AGENTS.md`.

`forge repo add <name> <url>` clones a normal checkout into `repos/<name>`. Repository names may include path segments such as `disksing/forge`. Use `--bare` to create a legacy bare repository at `repos/<name>.git`.

`forge repo list` lists repositories known to the workspace.

`forge-start [--project=<project>] [--task=<task>] [-- <agent command...>]` creates a PID-liveness session, locks the selected project/task resource, injects `FORGE_SESSION_ID` into the agent environment, runs an agent command in the selected directory, and ends the session when the command exits. If `forge-start` exits abnormally, later session operations prune the stale lock by PID liveness. When selectors are omitted, Forge uses the current task, otherwise the current project. With only `--task`, Forge uses the current project. Explicit command arguments after `--` override the workspace `forge.json` default. Configure the default as `agentCommand`, either as a string such as `"codex --dangerously-bypass-approvals-and-sandbox"` or an argument array such as `["codex", "--dangerously-bypass-approvals-and-sandbox"]`.

`forge project create [--slug <slug>] <description>` creates the next top-level project directory with `project.json`, `project.md`, `log.jsonl`, `AGENTS.md`, `artifacts/`, and `templates/`. Projects do not store repository metadata, recovery snapshots, or `worktree/` directories. Use `--slug <slug>` to create a directory such as `project1-forge-dev/` while keeping the resource id as `project1`. Generated `project.md` contains only the project title and description. Task templates are Markdown files under `templates/`; their YAML front matter supports `title`, `nonInteractive`, `agent`, and `prompt`.

`forge project list` lists open projects. Use `--all` to include archived projects. It never includes tasks; use `forge task list [--project=<project>]` for project tasks.

`forge project show [--project=<project>]` prints a project's `project.json`. `<project>` may be a full id such as `project22` or just a number such as `22`. When omitted, Forge uses the project containing the current working directory.

`forge project archive [--project=<project>]` moves a project into workspace `archive/`. `<project>` follows the same rules as `forge project show`.

`forge task create` creates the next task under a project. `<title>` is stored in `task.json` and shown by `forge task list`; `--detail` writes the initial `task.md` body. Add `--non-interactive`, `--prompt`, optional `--agent`, and repeatable `--after` flags to declare a one-turn automated task without starting it. The task id is full, such as `project1.task1`, while the directory name is short, such as `project1/task1/` or `project1/task1-develop-forge/`.

`forge task list [--project=<project>] [--all]` lists tasks. Add `--runnable --json` for a side-effect-free query of non-interactive tasks whose generation and prerequisites are ready. `--include-blocked` includes configured tasks with their blocking reason.

`forge task run` manages the structured non-interactive state in `task.json`. Executors call `start` after acquiring the task session lock and `settle` after the turn ends. An agent running in non-interactive mode must call exactly one of `complete`, `wait`, `pause`, or `fail` before ending its response; the command records a next action and the executor owns session shutdown.

`forge task show [--project=<project>] [--task=<task>]` prints a task's `task.json`. `<task>` may be a short id such as `task4` or just a number such as `4`. Forge combines it with `--project` when provided, otherwise the current directory's project. When `--task` is omitted, Forge uses the task containing the current working directory.

`forge task archive [--project=<project>] [--task=<task>]` moves an open task into its project archive. `<task>` follows the same rules as `forge task show`.

`forge task repo add [--project=<project>] [--task=<task>] <repo-name>` adds or updates a repository entry in the task's `task.json`. Optional `--worktree`, `--branch`, `--target`, and `--base` flags record the exact worktree and branch metadata. Task selection follows `forge task show`.

`forge task repo list [--project=<project>] [--task=<task>]` lists repositories recorded in a task's `task.json`. Task selection follows `forge task show`.

`forge task repo remove [--project=<project>] [--task=<task>] <repo-name>` removes a repository entry from a task's `task.json`. Task selection follows `forge task show`.

`forge session new [--heartbeat [--timeout <duration>] | --pid <pid> | --gui-run --workspace-id <id> --run-id <id> --endpoint <url>]` creates a session in `forge-sessions.json` and prints its unique id. Heartbeat liveness is the default and uses a default timeout unless `--timeout` is provided. PID liveness stays active while the process exists. GUI run liveness stays active while the Forge GUI local endpoint reports that its managed run is active. `forge session heartbeat --id=<id>` refreshes a heartbeat session timestamp. Session commands prune stale sessions before acting, except that `forge session end --id=<id>` first removes the explicit target if it exists.

`forge session lock --id=<id> [--project=<project>] [--task=<task>]` records project or task control for a session. With no selector, Forge locks the current task when run under a task directory, otherwise the current project. With only `--project`, Forge locks that project. With only `--task`, Forge uses the current project and locks that task. Workspace root does not need a lock. `forge session unlock` uses the same selector rules to release control.

`forge session list` lists active sessions after automatically pruning stale sessions. `forge session show --id=<id>` prints one active session as formatted JSON.

`forge workspace tree --json` prints a lightweight JSON tree of open projects, open tasks, and active sessions for GUI and tool integrations.

`forge workspace resource --id=<resource> --json` prints detail JSON for one project or task, including common Markdown files, artifacts, worktrees, and task repository metadata.

Agents started through `forge-start` or Forge GUI should reuse the injected `FORGE_SESSION_ID`; the launcher already registered the session and locked the starting resource, and will release it when the agent session exits. Agents should not create another session, lock/unlock the starting resource, or end a launcher-owned session. Agents started directly without `FORGE_SESSION_ID` should detect their current process PID, run `forge session new --pid <pid>`, export the printed id as `FORGE_SESSION_ID`, lock the current project/task resource once, and end that session when the agent exits. Agents should use temporary `forge session lock`/`unlock` pairs only for additional project/task resources outside the starting resource.

`forge migrate` upgrades project/task metadata to the current resource schema and refreshes the workspace and open resource `AGENTS.md` managed blocks. Run it once after installing a Forge version that reports resource metadata needs migration.

`forge migrate` is safe to run multiple times. It rewrites only forge-managed prompt blocks and preserves content outside managed blocks:

```md
<!-- managed by forge cli -->
...
<!-- end of forge cli prompt -->
```

Content outside that block belongs to people and agents and is preserved.

The Forge GUI treats the workspace `AGENTS.md` as the user-editable instructions surface and hides Forge-managed content while editing it. Project and task `AGENTS.md` files are generated launch cards for agents and are hidden from project/task detail views.

## Building

Build all three binaries with git metadata embedded:

```bash
scripts/build
```

The output defaults to `bin/forge`, `bin/forge-start`, and `bin/forge-gui`. Pass a directory to override it, for example `scripts/build /tmp/forge-build`.

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

- `AGENTS.md`: a short launch card that points agents to workspace rules and local context files, and documents the task template format.
- `project.json`: versioned structured project facts such as schema version, id, type, and description.
- `project.md`: durable project contract generated with default `Background`, `Scope`, and `Acceptance Criteria` modules. It records why the project exists, its boundaries, stable constraints and decisions, and how success is judged. Add optional modules such as `Out of Scope`, `Constraints`, `Decisions`, and contract-changing `Open Questions` only when useful.
- `log.jsonl`: append-only timeline for important chronological events and completed-step history. Use `forge project log add/list` to write or read project log entries; do not use it as a current-state snapshot.
- `artifacts/`: generated reports, screenshots, patches, and other outputs.

Each task directory contains:

- `AGENTS.md`: a short launch card that points agents to workspace rules, local context files, and parent project context.
- `task.json`: versioned structured facts such as schema version, id, type, parent id, title, and involved repositories.
- `task.md`: durable task contract generated with default `Background`, `Scope`, and `Acceptance Criteria` modules. It answers why the task exists, what is in or out of scope, which constraints and decisions remain valid, and how completion is judged. Questions that may change that contract belong here.
- `work.md`: replaceable recovery checkpoint generated with default `Focus` only, plus hidden examples for optional modules such as `Todo`, `Blockers`, `Active Work`, `Paused Work`, `Resume Plan`, `Context`, `Resources`, `Verification`, and `Notes`. Keep only the current focus, next actions, blockers, and state needed to resume. Do not repeat the task contract or accumulate completed history. Short-lived execution questions and arbitrary PR, CI, image, deployment, or related-task references belong here when useful.
- `log.jsonl`: append-only timeline for important chronological events and completed-step history. Use `forge task log add/list` to write or read task log entries; do not use it as the current recovery state.
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
go run ./cli/cmd/forge help
```

## Companion Tools

- [iTerm2 Toolbelt](contrib/iterm2/README.md): browse AgentWorkspace tasks and launch shells or Codex sessions from an iTerm2 Toolbelt panel.
