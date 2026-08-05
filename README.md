# Forge

Forge is a local, filesystem-first workspace manager for people and AI coding agents. It combines a deterministic CLI with a responsive web UI for organizing projects and tasks, running interactive agent sessions, scheduling autonomous work, and reviewing the resulting files and Git changes.

The workspace is the source of truth. Contracts are Markdown, structured state is JSON, history is JSONL, generated output is stored as artifacts, and code changes live in task-owned Git worktrees. The GUI is a control plane over those files rather than a separate project database.

## Highlights

- **Transparent local state.** Projects, tasks, logs, artifacts, templates, and Wiki pages remain ordinary files that can be inspected, versioned, backed up, or repaired without the GUI.
- **Purpose-built agent context.** Durable scope and acceptance criteria, short-lived recovery state, and chronological history have distinct files so a new agent can resume without reconstructing the task from chat.
- **Isolated code changes.** Repositories under `repos/` are shared source caches; each coding task records its own branch and worktree under `task.../worktree/`.
- **Coordinated writers.** Sessions lock the project or task they control. PID, heartbeat, and GUI-run liveness allow stale sessions and locks to be pruned safely.
- **Interactive and autonomous agents through AgentHub.** Forge GUI uses AgentHub as its only execution and session surface, including streaming chat, resumable history, file uploads, approvals, and mid-run user intervention.
- **Dependency-aware AutoRun.** Tasks can be queued with preferred Agent Profiles and prerequisite task generations. The GUI scheduler resumes ready work, records retries, and exposes queued, running, waiting, paused, completed, and failed states.
- **A workspace-oriented UI.** Switch between workspaces, browse projects and tasks, inspect Markdown and artifacts, preview Wiki pages, review worktree diffs, monitor sessions, and use the details/chat layout on desktop or mobile.

## Design

Forge separates concerns deliberately:

```text
forge CLI / forge start ──────┐
                              ├── AgentWorkspace files (source of truth)
forge serve ── invokes CLI ───┤
  (Web UI)  ├── AgentHub client │
            └── Git diff viewer ┘

AgentHub ── provider processes and durable agent sessions

shared checkout in repos/ ── git worktree ── task-owned branch in worktree/
```

- The **CLI** owns deterministic workspace mutations and JSON views used by other tools.
- **`forge start`** launches a terminal agent inside one resource with a managed session and lock.
- **`forge serve`** renders workspace state in the web UI, routes chat and AutoRun through AgentHub, and schedules workspace state transitions through the CLI.
- **AgentHub** owns provider discovery, provider process lifecycle, provider-native configuration, and durable agent sessions.
- **Agents** read the workspace contract, operate within the selected resource, and write code only in the task's worktree.

The workspace root itself is not lockable. Project and task resources are independently lockable, so unrelated tasks can progress concurrently.

## Requirements

- Go 1.22 or newer
- Git
- A compatible AgentHub service for GUI chat and AutoRun

## Build

Clone the repository and build the `forge` binary with branch and commit metadata embedded:

```bash
git clone https://github.com/disksing/forge.git
cd forge
scripts/build
```

This creates:

```text
bin/forge
```

The single binary provides the workspace CLI, the agent launcher (`forge start`), and the web service (`forge serve`). Pass another output directory to `scripts/build` if needed. Add that directory to `PATH`, or invoke the binary by its absolute path.

## Quick Start

Create a workspace and its first project:

```bash
mkdir AgentWorkspace
cd AgentWorkspace

forge init --language=en
forge project create --slug forge-dev "Develop Forge"
forge repo add forge https://github.com/disksing/forge.git
forge task create --project=project1 --slug first-change \
  --detail "Implement and verify the first change." \
  "First change"
```

Open the GUI for that workspace:

```bash
forge serve --workspace "$PWD"
```

Then visit [http://127.0.0.1:4936](http://127.0.0.1:4936). Configure the AgentHub endpoint and the system or custom Agent Profiles in Settings. The GUI can also create or add workspaces, create projects and tasks, and apply project task templates.

The GUI has no built-in authentication. Its default loopback address is appropriate for local use; do not expose it to an untrusted network.

## Forge GUI

The main UI is split into navigation, resource details, and agent chat:

- **Navigation:** switch workspaces, expand the project/task tree, see AutoRun and lock state, and monitor active or external sessions with their controlled resource titles.
- **Details:** render `project.md`, `task.md`, `work.md`, and logs; browse templates and artifacts; preview the workspace Wiki; inspect repository/worktree metadata; and render tracked plus untracked Git diffs.
- **Chat:** start, stop, resume, or revisit agent sessions; stream responses and tool activity; answer approval requests; upload files into the session artifact directory; and send new instructions while an AutoRun is active.
- **Settings:** add or remove workspaces, edit the user-owned portion of workspace `AGENTS.md`, inspect the read-only AgentHub catalog, and map system or custom Agent Profiles to catalog agents.

The desktop panes and session list are resizable. On smaller screens, navigation becomes a drawer and details/chat become switchable views.

### AgentHub execution

Forge does not import provider adapters, spawn provider CLIs, probe provider health, or keep a direct-runner fallback. Agent and provider definitions in the AgentHub catalog are read-only in Forge. A new chat or AutoRun resolves a Forge Profile to an AgentHub `agentName`, creates or resumes a durable AgentHub session, and projects canonical AgentHub events into the GUI.

Forge retains workspace/task/session-lock/Profile control. A resource lock is released only after AgentHub confirms durable `stopped`; an unreachable or unknown AgentHub state keeps the lock. Historical pre-AgentHub runs and their local event logs are no longer read or migrated; input, approval, interrupt, stop, and resume operations are unavailable for those files.

Useful overrides:

```text
FORGE_CLI           forge executable used by forge serve for workspace operations (defaults to the running binary)
FORGE_AGENTHUB_URL  AgentHub endpoint override
FORGE_GUI_CONFIG    GUI configuration file
```

Each running GUI instance exclusively locks its configuration file. Use a separate config path, address, and workspace for an isolated test instance. See [internal/serve/README.md](internal/serve/README.md) for the AgentHub boundary, current settings behavior, and isolated validation.

## Task Worktrees

Forge records worktree metadata but leaves Git operations explicit. A typical coding task looks like this:

```bash
repo="$PWD/repos/forge"
task="$PWD/project1-forge-dev/task1-first-change"

git -C "$repo" worktree add \
  -b task1-first-change \
  "$task/worktree/forge" \
  master

forge task repo add \
  --project=project1 \
  --task=task1 \
  --worktree "$task/worktree/forge" \
  --branch task1-first-change \
  --target master \
  --base master \
  forge
```

Use an absolute destination with `git worktree add`, especially when combining it with `git -C`; otherwise Git may resolve the destination relative to the shared checkout.

## Interactive Agent Launches

`forge start` runs a command in the selected project or task directory. It creates a PID-liveness session, locks that resource, injects `FORGE_SESSION_ID`, writes launch context under `.forge/`, and releases the session when the command exits.

```bash
forge start --project=project1 --task=task1 -- codex
```

Selectors may be omitted when the current directory already identifies the task or project. A default command can be stored in `forge.json` as either a string or argument array:

```json
{
  "version": 1,
  "language": "en",
  "agentCommand": ["codex", "--dangerously-bypass-approvals-and-sandbox"]
}
```

Agents launched by `forge start` or the Forge web UI must reuse the injected session id. Directly launched agents should create and later end their own session, and should temporarily lock other resources only when work genuinely crosses the current task boundary.
The first resource locked by a session is its primary resource; later controls are temporary. Archiving the primary resource ends the session, while archiving a temporarily controlled resource removes only the archived controls and preserves the primary session.

## AutoRun

AutoRun adds a generation-numbered state machine to a task. The GUI scheduler finds runnable tasks, resolves preferred Agent Profiles to AgentHub catalog agents, starts or resumes an AgentHub session, and keeps the task's current state in `task.json` while writing state transitions and retries to `log.jsonl`.

Create an autonomous task:

```bash
forge task create \
  --project=project1 \
  --autorun \
  --agent-profile=fast \
  --agent-profile=codex \
  --prompt="Read task.md, implement the change, and verify it." \
  "Implement the change"
```

Preferred profiles are ordered and portable. The GUI maps keys such as `fast`, `reasoning`, `review`, or `codex` to AgentHub agent names; if none are configured, the scheduler falls back to the `default` system Profile. A configured but unavailable target is sent to AgentHub and reported as a runtime error.

Tasks can wait for exact generations of other tasks:

```bash
forge task create \
  --project=project1 \
  --autorun \
  --after=project1.task1@1 \
  --prompt="Integrate the completed prerequisite." \
  "Integration"
```

A scheduler-started turn must finish with exactly one result action:

```bash
forge task autorun complete --summary="Implemented and verified"
forge task autorun wait --after=project1.task3@1 --summary="Waiting for dependency"
forge task autorun pause --reason="User decision required"
forge task autorun fail --reason="Verification cannot pass"
```

If a running turn exits without reporting a result, the scheduler records a retry and continues within a shared three-attempt budget before pausing the task. A completed or failed task can be queued again as a new generation.

## Task Templates

Project-local templates live in `templates/*.md`. YAML front matter controls task creation and the remainder becomes the new task's complete `task.md`:

```markdown
---
title: Daily inspection
autorun: true
agent-profiles: [fast, codex]
prompt: Inspect the project and report findings.
---
# Daily inspection

## Background

Inspect the current project state and report anything that needs attention.
```

Supported front matter fields are `title`, `autorun`, `agent-profiles`, and `prompt`. Agent Profiles and prompts apply only to AutoRun templates.

## Workspace Layout

```text
AgentWorkspace/
  AGENTS.md                   global human and agent instructions
  forge.json                  workspace configuration
  forge-sessions.json         active session and lock registry
  wiki/
    index.md                  long-lived workspace knowledge
  repos/
    forge/                    shared normal checkout
  project1-forge-dev/
    AGENTS.md                 generated project launch card
    project.json              structured project metadata
    project.md                durable project contract
    log.jsonl                 append-only project timeline
    templates/                reusable task templates
    artifacts/                project outputs
    task1-first-change/
      AGENTS.md               generated task launch card
      task.json               task, repository, and AutoRun metadata
      task.md                 durable task contract
      work.md                 replaceable recovery checkpoint
      log.jsonl               append-only task timeline
      artifacts/              reports, screenshots, uploads, patches
      worktree/               task-owned Git worktrees
    archive/                  archived tasks
  archive/                    archived projects
```

Open/archive state is represented by directory location. Human-readable directory suffixes do not change resource ids: `project1-forge-dev/task1-first-change/` is still `project1.task1`.

### File Roles

| File | Role |
| --- | --- |
| `project.md`, `task.md` | Durable contracts: background, scope, acceptance criteria, stable constraints, decisions, and contract-changing questions. |
| task `work.md` | Current focus, next actions, blockers, and just enough transient state to resume. It is replaced as work advances. |
| `log.jsonl` | Append-only chronological events and completed-step history, written with `forge project log` or `forge task log`. |
| `project.json`, `task.json` | Versioned structured facts Forge understands. Arbitrary notes belong in Markdown. |
| `AGENTS.md` | Workspace operating rules plus generated project/task launch cards. Forge rewrites only its marked managed block. |
| `wiki/` | Long-lived knowledge shared across projects and tasks, with `wiki/index.md` as the entry point. |
| `artifacts/` | Generated reports, screenshots, patches, uploaded files, and other outputs. |

## CLI Reference

Run `forge help` for full command descriptions. The current command surface is:

```text
forge --version
forge init [--language=<language>]
forge migrate [--language=<language>]

forge repo add [--bare] <name> <url>
forge repo list

forge project create [--slug <slug>] <description>
forge project list [--all]
forge project show [--project=<project>]
forge project archive [--project=<project>]
forge project log add|list ...

forge resource archive --id=<resource>

forge task create [--project=<project>] [--slug <slug>]
                  [--detail <detail>|--task-markdown <markdown>]
                  [--autorun] [--agent-profile=<profile>...]
                  [--prompt=<prompt>]
                  [--after=<task@generation>...] <title>
forge task list [--project=<project>] [--all]
                [--runnable [--include-blocked] [--json]]
forge task show|archive ...
forge task log add|list ...
forge task repo add|list|remove ...
forge task autorun queue|start|retry|wait|pause|resume|complete|fail ...

forge session new|heartbeat|lock|unlock|end|list|show ...

forge workspace tree --json
forge workspace resource --id=<resource> --json

forge start [--project=<project>] [--task=<task>] [-- <agent command...>]
forge serve [--addr=<address>] [--workspace=<path>] [--version]
```

`forge init` and `forge migrate` accept `--language=en` or `--language=zh-CN`.
The selected language is stored in `forge.json` and controls generated Markdown
templates and Forge-managed `AGENTS.md` prompts. Existing workspaces without a
language setting default to English. Use `forge migrate --language=zh-CN` (or
`--language=en`) to switch languages.

`forge migrate` upgrades supported resource metadata, removes obsolete project recovery files, restores a missing Wiki index, and refreshes Forge-managed `AGENTS.md` blocks. It is safe to run repeatedly and preserves content outside these markers:

```markdown
<!-- managed by forge cli -->
...
<!-- end of forge cli prompt -->
```

## Development

Run the full test suite and build all binaries:

```bash
go test ./...
scripts/build
```

Useful focused commands:

```bash
go test ./cli/internal/forge
go test ./internal/serve/...
go run ./cli/cmd/forge help
go run ./cli/cmd/forge serve --workspace /path/to/AgentWorkspace
```

When testing a second GUI instance, isolate all mutable state:

```bash
FORGE_GUI_CONFIG=/tmp/forge-gui-test/gui.json \
  go run ./cli/cmd/forge serve \
  --addr 127.0.0.1:4999 \
  --workspace /tmp/forge-workspace-test
```

## Companion Tools

- [Forge serve AgentHub guide](internal/serve/README.md): the execution boundary, current settings, environment variables, and isolated testing.
- [iTerm2 Toolbelt](contrib/iterm2/README.md): browse AgentWorkspace tasks and launch shells or Codex sessions from an iTerm2 Toolbelt panel.

## License

[MIT](LICENSE)
