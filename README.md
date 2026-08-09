# Forge

Forge is a local, filesystem-first workspace manager for people and AI coding agents. It combines a deterministic CLI with a responsive web UI for organizing projects and tasks, running interactive agent sessions, scheduling autonomous work, and reviewing the resulting files and Git changes.

The workspace is the source of truth. Contracts are Markdown, structured state is JSON, history is JSONL, generated output is stored as artifacts, and code changes live in task-owned Git worktrees. The GUI is a control plane over those files rather than a separate project database.

## Highlights

- **Transparent local state.** Projects, tasks, logs, artifacts, templates, and Wiki pages remain ordinary files that can be inspected, versioned, backed up, or repaired without the GUI.
- **Purpose-built agent context.** Durable scope and acceptance criteria, short-lived recovery state, and chronological history have distinct files so a new agent can resume without reconstructing the task from chat.
- **Isolated code changes.** Repositories under `repos/` are shared source caches; each coding task records its own branch and worktree under `task.../worktree/`.
- **Coordinated writers.** Sessions lock the project or task they control. PID, heartbeat, and GUI-run liveness allow stale sessions and locks to be pruned safely.
- **Interactive and autonomous agents through AgentHub.** Forge GUI uses AgentHub as its only execution and session surface, including streaming chat, resumable history, file uploads, approvals, and mid-run user intervention.
- **Simplified Self-Driving.** Tasks can be queued with preferred Agent Profiles and run as a self-contained state machine. The GUI driver starts queued work, wakes suspended work after a fixed delay, records retries, and exposes queued, running, suspended, paused, completed, failed, and cancelled states.
- **A workspace-oriented UI.** Switch between workspaces, browse projects and tasks, inspect Markdown and artifacts, preview Wiki pages, review worktree diffs, monitor sessions, and use the details/chat layout on desktop or mobile.

## Design

Forge separates concerns deliberately:

```text
forge CLI / forge start ──────┐
                              ├── AgentWorkspace files (source of truth)
forge serve ── internal/app ──┤
  (Web UI)  ├── AgentHub client │
            └── Git diff viewer ┘

AgentHub ── provider processes and durable agent sessions

shared checkout in repos/ ── git worktree ── task-owned branch in worktree/
```

- The **CLI** owns flag parsing and compatibility output; deterministic workspace mutations and typed views live in the reusable `internal/app` API.
- **`forge start`** launches a terminal agent inside one resource with a managed session and lock.
- **`forge serve`** renders workspace state in the web UI, routes chat and Self-Driving through AgentHub, and calls `internal/app` with each Workspace root directly. It does not spawn `forge` for workspace operations.
- **AgentHub** owns provider discovery, provider process lifecycle, provider-native configuration, and durable agent sessions.
- **Agents** read the workspace contract, operate within the selected resource, and write code only in the task's worktree.

The workspace root itself is not lockable. Project and task resources are independently lockable, so unrelated tasks can progress concurrently.

## Requirements

- Go 1.22 or newer
- Git
- A compatible AgentHub service for GUI chat and Self-Driving

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

Then visit [http://127.0.0.1:4936](http://127.0.0.1:4936). Configure the AgentHub endpoint and the system or custom Agent Profiles in Settings. The reserved `scheduler` system Profile is available for future scheduling work but does not start a Scheduler Agent or change current Self-Driving routing. The GUI can also create or add workspaces, create projects and tasks, and apply project task templates.

The GUI has no built-in authentication. Its default loopback address is appropriate for local use; do not expose it to an untrusted network.

## Forge GUI

The main UI is split into navigation, resource details, and agent chat:

- **Navigation:** switch workspaces with an optional per-workspace icon, expand the project/task tree, see Self-Driving and lock state, and monitor active or external sessions with their controlled resource titles. The active workspace icon is also used as the browser tab icon; workspaces without a selection use the Forge icon.
- **Details:** render `project.md`, `task.md`, `work.md`, and logs; browse templates and artifacts; preview the workspace Wiki; inspect repository/worktree metadata; and render tracked plus untracked Git diffs.
- **Chat:** start, close, resume, or revisit agent sessions; end only the current turn with End Turn while keeping the Session open; stream responses and tool activity; answer approval requests; upload files into the session artifact directory; and send new instructions while Self-Driving is active.
- **Settings:** set the browser-local user name used for chat provenance, add or remove workspaces, choose one of the bundled workspace icons, edit the user-owned portion of workspace `AGENTS.md`, inspect the read-only AgentHub catalog, and map system or custom Agent Profiles—including the reserved `scheduler` route—to catalog agents. The user name defaults to `User` and is not written to server configuration or workspace data.

The desktop panes and session list are resizable. On smaller screens, navigation becomes a drawer and details/chat become switchable views.

### AgentHub execution

Forge does not import provider adapters, spawn provider CLIs, probe provider health, or keep a direct-runner fallback. Agent and provider definitions in the AgentHub catalog are read-only in Forge. A new chat or Self-Driving resolves a Forge Profile to an AgentHub `agentName`, creates or resumes a durable AgentHub session, and projects canonical AgentHub events into the GUI.

Every message typed by a user is sent to AgentHub with provenance `role=user` and the name configured in the Settings **User** tab. The timeline shows that name with a `USER` label. Older clients and browsers without a saved name fall back to `User`; scheduler-generated Self-Driving messages remain `role=system` from `Forge Scheduler`.

Forge retains workspace/task/session-lock/Profile control. `forge serve` is the only owner of AgentHub session reconciliation: a resource lock is released only after the service observes a durable `stopped` state, or proves through continuous durable event history that an archived session passed through `stopped`. An unreachable or unknown AgentHub state keeps the lock. Plain CLI commands (`forge session list/show`, `forge workspace tree`, `forge start`, session create/lock/unlock/heartbeat/end, resource archival) never contact AgentHub; an AgentHub-managed session stays active in the session store until the service reconciles it or `forge session end --id=<id>` releases it manually. While the service is stopped, those sessions and locks are conservatively retained. Historical pre-AgentHub runs and their local event logs are no longer read or migrated; input, approval, interrupt, stop, and resume operations are unavailable for those files.

Useful overrides:

```text
FORGE_AGENTHUB_URL  AgentHub endpoint override
FORGE_GUI_CONFIG    GUI configuration file
```

`forge serve` no longer reads the former `FORGE_CLI` override. Remove that setting when upgrading; Workspace operations use the in-process typed API and the configured Workspace path.

Each running GUI instance exclusively locks its configuration file, and every managed Workspace is additionally owned by exactly one `forge serve` process through an OS advisory lock at `<workspace>/.forge/serve.lock`. A second instance with a different `FORGE_GUI_CONFIG` cannot schedule, recover sessions, or write a Workspace owned by another instance: startup fails with the canonical Workspace path and owner diagnostics before any scheduler or recovery begins, and dynamically adding an owned Workspace is rejected. Path aliases such as relative paths, `..`, and symlinks resolve to the same canonical Workspace and cannot bypass ownership. The OS releases the lock automatically when the owning process exits, so a later instance can take over. Use a separate config path, address, and workspace for an isolated test instance. See [internal/serve/README.md](internal/serve/README.md) for the AgentHub boundary, current settings behavior, and isolated validation.

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

## Self-Driving

Self-Driving adds a generation-numbered state machine to a task. `forge serve` runs a minimal driver: it starts queued work, re-queues suspended work whose suspension limit (30 minutes) elapsed, resolves preferred Agent Profiles to AgentHub catalog agents, starts or resumes an AgentHub session, and keeps the task's current state in `task.json` while writing state transitions and retries to `log.jsonl`. A cancelled generation is terminal: it is never dispatched, retried, or timed-woken, and a new generation must be started explicitly.

Create an autonomous task:

```bash
forge task create \
  --project=project1 \
  --self-driving \
  --agent=codex \
  --agent-profile=fast \
  --agent-profile=codex \
  --prompt="Read task.md, implement the change, and verify it." \
  --completion-criteria="The implementation is verified and the task requirements are complete." \
  "Implement the change"
```

`--agent` records the concrete AgentHub agent for this generation; preferred profiles remain an optional portable fallback. The GUI maps keys such as `fast`, `reasoning`, `review`, or `codex` to AgentHub agent names; if none are configured, the driver falls back to the `default` system Profile. The `scheduler` system Profile is reserved for a future Scheduler Agent and is not selected automatically by the current Self-Driving driver. Forge validates the selected AgentHub target before creating a session or changing Self-Driving state, so an unavailable target has no partial side effects.

A scheduler-started turn must finish with exactly one result action:

`complete` means the task brief, completion criteria, and appropriate verification are done. `suspend` is allowed only when the task cannot make meaningful progress and the only remaining meaningful action would be repeated polling of one specific, observable external condition. If any in-scope implementation, testing, investigation, review, documentation, repair, or verification remains, the agent must continue the current turn. `suspend` is not a phase-completion marker, checkpoint or save-progress step, way to shorten a turn, or way to yield early. `pause` is for a user decision, authorization, or other manual handling and is not an automatically polled wait; `fail` means no feasible safe completion path remains under the current constraints.

Before suspending, the agent must exhaust work that does not depend on the external condition. A valid suspension can wait for a specified change such as an upstream commit appearing in `origin/master`, a named PR review or CI state, a service health check, a specified time, or the result of an already-issued asynchronous operation. It is invalid to suspend after only a milestone, while coding/tests/investigation/review/docs/fixes/verification remain, to save context or prepare the next turn, because the next step is uncertain, or because a child task exists while independent work remains.

When suspending, record completed work, current status, and blocking context in `suspensionSummary`, and record the separate, specific, observable, verifiable external signal in `wakeCondition`. Forge stores natural-language conditions without parsing them. The current server uses a fixed 30-minute fallback re-check; a future Scheduler may observe the condition and wake the task proactively.

```bash
forge task self-driving complete --summary="Implemented and verified"
forge task self-driving suspend \
  --summary="Waiting for the upstream merge" \
  --wake-condition="The upstream merge is present in origin/master"
forge task self-driving pause --reason="User decision required"
forge task self-driving fail --reason="Verification cannot pass"
forge task self-driving cancel --reason="User cancelled this generation"
```

`suspend` records a natural-language `suspensionSummary` (the context) and separate `wakeCondition`, plus a `suspendedAt` timestamp. Forge stores the condition for the next agent but does not parse it; the prompt tells the agent to check it before continuing and to suspend again with both fields if it is unmet. Summary-only clients remain compatible by copying the summary into `wakeCondition` and recording a fallback marker. The server wakes the task after 30 minutes by re-queueing it; every new suspend resets the timer. `pause` is for human intervention and is never auto-woken. `cancel` durably ends the current generation, records the reason in `log.jsonl`, interrupts an active Scheduler turn, and leaves the Agent Session open when cancellation is requested from the UI. If a running turn exits without reporting a result, the driver records a retry and continues within a shared three-attempt budget before pausing the task. A completed, failed, or cancelled task can be started again as a new generation; cancelled generations inherit editable configuration but clear suspension metadata.

### New Session and Manual Self-Driving from Chat

The chat composer has one **New Session** button. Clicking it opens the enabled AgentHub agents with their name and model summary; choosing an agent immediately creates a new session for the selected resource. The button is disabled with an explanation when no enabled agent exists, shows a creating state while the request is in flight, ignores duplicate clicks, and keeps the chooser open when creation fails so the user can retry. The chooser also supports Escape and clicking outside the control.

When the selected Project or Task is controlled by an active external Forge Session, the composer shows a clear resource lock notice and hides New Session, Self-Driving start/resume, and Resume Session controls; input and uploads are paused until a refresh observes that the lock has been released. The server repeats this check at execution time, including direct API and scheduler paths, and returns a conflict before creating an AgentHub session, advancing Self-Driving, or sending a message.

When the selected Project or Task is controlled by an active internal Forge GUI Session, the composer hides New Session and closes any open Agent chooser, even when the currently viewed Agent Run is historical. The current Session's input, approval, Close Session, and idle Task Self-Driving reuse actions remain available; the New Session action returns after the tree refresh observes that the internal lock has been released. Self-Driving remains a Task-only action.

The task chat composer shows a stateful Self-Driving action: **Start Self-Driving** on tasks without Self-Driving, **Start New Self-Driving** after a completed, failed, or cancelled generation (creating the next generation), **Resume Now** while suspended, and **Resume Self-Driving** while paused. The first and next-generation actions open a minimal configuration dialog whose only editable fields are the Agent and the optional Run instructions (prompt); the generation's completion criteria are inherited from the previous generation and are no longer shown in the dialog. A suspended or paused generation resumes directly only when the server can re-validate a strictly idle AgentHub session for the same task; otherwise Resume opens an explicit Agent dialog. A valid Agent saved on the current generation may be preselected, but the user must confirm it, and another task's recent Agent is never used silently. Resume keeps the generation's saved instructions and completion criteria unchanged. Cancelled generations cannot be resumed; they offer Start New Self-Driving. Queued and running generations render as disabled states so they cannot be started twice. **Close Session** cancels an active Self-Driving generation before closing that AgentHub Session, while **End Turn** pauses only the current generation and keeps the Session open.

The action calls one unified server operation (`POST /api/workspaces/<id>/self-driving/start`) that accepts the selected Agent and generation/state expectations, queues or resumes the generation, then either reuses the task's current session or creates a new one, and finally sends the standard Self-Driving start message — the frontend never stitches these steps together. A session is reused only when the server re-validates at execution time that it belongs to the task, is attached to AgentHub, and is strictly idle (no pending approval, active turn, or unfinished scheduler turn); a reused session keeps its own agent. Without a reusable session the dialog selects the agent for the new session, and the request fails without changing task state if none is explicitly selected. If the session is busy, the operation rejects before creating another session. The server serializes this operation with the driver scan, so manual clicks, timed wake-ups, and scheduler passes can never start the same generation twice or send duplicate AgentHub messages.

## Task Templates

Project-local content templates live in `templates/*.md`. Schema V2 declares a dynamic input form and deterministic title/Markdown rendering; it never chooses whether or how the task runs:

When creating a task, prefer an existing suitable project template whenever one is available. When creating a task from a template, preserve all existing template rules by default: do not delete, weaken, bypass, or accidentally override them. Override a particular rule only when the user explicitly asks for that override.

```markdown
---
schema-version: 2
title: Request or bug
description: Capture a concrete change.
task-title: "{{ summary }}"
fields:
  - name: summary
    type: text
    label: Summary
    required: true
  - name: behavior
    type: textarea
    label: Expected behavior
    required: true
  - name: priority
    type: select
    label: Priority
    options: [low, medium, high]
  - name: reproduced
    type: boolean
    label: Reproduced
    default: false
---
# {{ summary }}

{{ behavior }}

Priority: {{ priority }}
Reproduced: {{ reproduced }}
```

Field types are `text`, `textarea`, `select`, and `boolean`. Placeholders may only reference declared fields and are replaced once, so template-like text inside a field value stays literal. Unknown properties, fields, placeholders, type mismatches, and missing required values produce stable structured errors. The normalized template bytes have a SHA-256 digest; previewed creates can submit that digest to detect template changes.

Use `forge template list/show/validate/render/create/migrate` to inspect and manage templates. `forge template show <name>` defaults to human-readable metadata, every field requirement, diagnostics, and the complete Markdown body. Use `--raw` for the original template file, `--json` for structured template data, or `--schema` for schema metadata and diagnostics; these output modes are mutually exclusive. `forge task create --template=<name> --field name=value` creates from one, while `--dry-run` previews without filesystem or Self-Driving side effects. `--fields` accepts a YAML or JSON object and repeated `--field` values override the file. Self-Driving, Agent, Profile, instructions, and completion criteria remain explicit `task create` options and are never read from a V2 content template.

Templates without `schema-version` remain visible as legacy V1 templates with deprecation warnings. Their old execution properties are ignored. `forge template migrate <name>` previews a static V2 conversion and `--write` atomically applies it without inventing fields or changing the Markdown body. Created tasks store only the template name, schema version, and digest in `task.json`; later template edits do not modify them.

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
      task.json               task, repository, and Self-Driving metadata
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

forge template list|show|validate|render|create|migrate ...

forge resource archive --id=<resource>

forge task create [<title>] [--project=<project>] [--slug <slug>]
                  [--detail <detail>|--task-markdown <markdown>|--template=<name>]
                  [--field <name>=<value>...] [--fields <file>] [--dry-run] [--json]
                  [--self-driving] [--agent=<agent>] [--agent-profile=<profile>...]
                  [--prompt=<prompt>] [--completion-criteria=<text>]
forge task list [--project=<project>] [--all]
                [--runnable [--json]]
forge task show|archive ...
forge task log add|list ...
forge task repo add|list|remove ...
forge task self-driving queue|start|retry|suspend|pause|resume|complete|fail|cancel ...

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
go test ./internal/forge
go test ./internal/serve/...
go run ./cli/cmd/forge help
go run ./cli/cmd/forge serve --workspace /path/to/AgentWorkspace
```

When testing a second GUI instance, isolate all mutable state. Each Workspace can only be managed by one `forge serve` process at a time, so a test instance must point at its own isolated Workspace; pointing it at a real Workspace now fails fast with a lock-conflict error instead of corrupting shared state, but tests must still use isolated Workspaces to avoid real business writes:

```bash
FORGE_GUI_CONFIG=/tmp/forge-gui-test/gui.json \
  go run ./cli/cmd/forge serve \
  --addr 127.0.0.1:4999 \
  --workspace /tmp/forge-workspace-test
```

## Companion Tools

- [Forge serve AgentHub guide](internal/serve/README.md): the execution boundary, current settings, environment variables, and isolated testing.

## License

[BSD 3-Clause License](LICENSE)
