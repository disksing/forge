# Forge

Forge is a local, filesystem-first workspace manager for people and AI coding agents. It combines a deterministic CLI with a responsive web UI for organizing projects and tasks, running interactive agent sessions, and reviewing the resulting files and Git changes.

The workspace is the source of truth. Contracts are Markdown, structured state is JSON, history is JSONL, generated output is stored as artifacts, and code changes live in task-owned Git worktrees. The GUI is a control plane over those files rather than a separate project database.

## Highlights

- **Transparent local state.** Projects, tasks, logs, artifacts, templates, and Wiki pages remain ordinary files that can be inspected, versioned, backed up, or repaired without the GUI.
- **Purpose-built agent context.** Durable scope and acceptance criteria, short-lived recovery state, and chronological history have distinct files so a new agent can resume without reconstructing the task from chat.
- **Isolated code changes.** Repositories under `repos/` are shared source caches; each coding task records its own branch and worktree under `task.../worktree/`.
- **Explicit file ownership.** Generated agent instructions allow writes only in the starting resource and its task worktrees, while keeping other Workspace resources read-only.
- **Interactive agents through AgentHub.** Forge GUI uses AgentHub as its only execution and session surface, including streaming chat, resumable history, file uploads, approvals, and mid-run user intervention.
- **A workspace-oriented UI.** Switch between workspaces, browse projects and tasks, inspect Markdown and artifacts, preview Wiki pages, review worktree diffs, monitor sessions, and use the details/chat layout on desktop or mobile. The layout adapts to the window width: three columns (sidebar, details, chat) on wide screens, two columns with a tabbed details/chat pane below 1440px, and a single-column mobile layout below 980px. A layout switcher in the brand band (or the slim toolbar when the sidebar is collapsed) lets users override the responsive choice manually: three columns, tabbed two columns, or a split view that collapses the sidebar into a drawer with details and chat side by side; the preference is stored in the browser.

## Design

Forge separates concerns deliberately:

```text
forge CLI ───── internal/app ─┐
                              ├── AgentWorkspace files (source of truth)
forge serve ─── internal/app ─┤
  (Web UI)  ├── AgentHub client │
            └── Git diff viewer ┘

AgentHub ── provider processes and durable agent sessions

shared checkout in repos/ ── git worktree ── task-owned branch in worktree/
```

- The **CLI** owns flag parsing and compatibility output; deterministic workspace mutations and typed views live in the reusable `internal/app` API.
- **`forge serve`** renders workspace state in the web UI, routes interactive sessions through AgentHub, and calls `internal/app` directly for workspace operations.
- **AgentHub** owns provider discovery, provider process lifecycle, provider-native configuration, and durable agent sessions.
- **Agents** may read other Workspace resources for context, but write only files owned by their starting resource and its task worktrees. Host files outside the Workspace follow user scope and host permissions.

Resource-level Session Locks are not part of Forge. Multiple sessions can run against the same resource; generated instructions provide the non-recursive coordination boundary.

## Requirements

- Go 1.22 or newer
- Git
- A compatible AgentHub service for GUI chat

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

The single binary provides the workspace CLI and web service (`forge serve`). Pass another output directory to `scripts/build` if needed. Add that directory to `PATH`, or invoke the binary by its absolute path.

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

Then visit [http://127.0.0.1:4936](http://127.0.0.1:4936). Configure the AgentHub endpoint and Agent Profiles in Settings.

The GUI has no built-in authentication. Its default loopback address is appropriate for local use; do not expose it to an untrusted network.

## Forge GUI

The main UI is split into navigation, resource details, and agent chat:

- **Navigation:** switch workspaces, expand the project/task tree, and monitor active or external sessions.
- **Details:** render `project.md`, `task.md`, `work.md`, and logs; browse templates and artifacts; preview the workspace Wiki; inspect repository/worktree metadata; and render tracked plus untracked Git diffs.
- **Chat:** select a Workspace, Project, or Task and send a message directly; Forge lazily creates or reuses that work subject's current generation. The resource timeline continues across generation boundaries, shows explicit history gaps, and pages older Turns without exposing Session lifecycle controls. Waiting mailbox messages appear above the composer and can be inserted into the active Turn without changing message ID when steer is supported.
- **Settings:** set the browser-local user name used for chat provenance, add or remove workspaces, choose one of the bundled workspace icons, edit the user-owned portion of workspace `AGENTS.md`, inspect the read-only AgentHub catalog, map Profiles to catalog agents, and choose the one-time Profile defaults for newly created Workspaces, Projects, and Tasks. The user name defaults to `User` and is not written to server configuration or workspace data.

The desktop panes and session list are resizable. On smaller screens, navigation becomes a drawer and details/chat become switchable views.

### AgentHub execution

Forge does not import provider adapters, spawn provider CLIs, probe provider health, or keep a direct-runner fallback. Agent and provider definitions in the AgentHub catalog are read-only in Forge. Every Workspace, Project, and Task stores an explicit binding to either a Forge Profile or an AgentHub Agent. Profile bindings resolve to an `agentName`; a missing custom Profile preserves that explicit binding and falls back through the resource-type default and then global `default`, exposing the unresolved binding and actual fallback on the generation. Changing or restoring a route retires an obsolete generation at a turn boundary and creates the next generation lazily.

Every user message is sent to AgentHub with provenance `role=user` and the browser-local name configured in Settings. The timeline shows that name with a `USER` label; missing or invalid names fall back to `User`.

Forge persists generation projections in `<workspace>/.forge/runtime/generations.json` and a Workspace-wide, resource-owned mailbox in `<workspace>/.forge/runtime/mailbox.json`. Accepted messages are fsynced before success is returned and retain stable IDs, provenance, requested/actual mode, downgrade reason, delivery state, timestamps, diagnostics, and any generation/Session/Turn association. Upgrading migrates stage-one `pendingMessages` by writing the mailbox first, deduplicating by stable ID, and only then clearing legacy generation queues, so an interrupted migration can be repeated without loss. AgentHub assumes durable at-least-once delivery responsibility before Forge marks an item delivered; a delivered item means accepted by AgentHub, not that its Turn is complete.

Resource messages use `steer` (default), `enqueue`, or `interrupt`. A supported active Turn receives steer immediately; an unsupported steer is durably downgraded to enqueue. Enqueue waits for a ready boundary. Interrupt first persists its mailbox item, records the exact active Turn, interrupts only that Turn, waits for terminal state, and then opens a new Turn. Already-delivering messages resolve first; otherwise interrupt outranks steer, and steer outranks queued enqueue, with acceptance order preserved inside each class. A live steer or interrupt may therefore bypass older enqueue work. Generation replacement never moves mailbox ownership: delivered steer remains with the old Turn, enqueue waits for the new generation, and interrupt terminates the old Turn before replacement delivery. The periodic reconciler recovers all modes after Server or AgentHub failures. Archived resources reject new messages: items not yet sent become `undeliverable`, while an already-attempted item whose AgentHub outcome cannot be confirmed becomes `delivery_unknown`; both remain queryable by message ID.

Public work-subject state is `idle`, `working`, `attention_required`, `unavailable`, or `archived`. Waiting is a message state and count, never a Task state: the persisted internal `queued` value is exposed as `waiting`. Promoting a waiting message to the current Turn records `promotedAt` and changes its actual mode to steer on the same durable mailbox item.

Commands address Workspace, Project, and Task directly without exposing a separate Agent subject or requiring run/Session IDs:

```bash
forge task status --project=project1 --task=task2
forge task history --project=project1 --task=task2
forge history turn show --ref=<opaque-turn-reference>
forge history event show --ref=<opaque-event-reference>
forge message send --to=project1.task2 "Please review the current API design."
forge message send --to=project1.task2 --mode=enqueue "Handle this in a new Turn."
forge message send --to=project1.task2 --mode=interrupt "Stop the current approach and investigate this instead."
forge message show --id=msg-run-0123456789abcdef
```

These commands infer the sending resource from the current directory, attach `role=agent` and its stable resource ID as provenance, and contact the owning `forge serve` address discovered from `.forge/serve.lock`. `--server=<url>` is an explicit override. They never write `mailbox.json` directly or start a second Server. Provenance is metadata only, not authentication, authorization, or instruction priority. `forge session list` and `forge session show` remain read-only local diagnostics and never contact AgentHub.

Useful overrides:

```text
FORGE_AGENTHUB_URL  AgentHub endpoint override
FORGE_GUI_CONFIG    GUI configuration file
```

`forge serve` no longer reads the former `FORGE_CLI` override. Remove that setting when upgrading; Workspace operations use the in-process typed API and the configured Workspace path.

Each running GUI instance exclusively locks its configuration file, and every managed Workspace is additionally owned by exactly one `forge serve` process through an OS advisory lock at `<workspace>/.forge/serve.lock`. A second instance with a different `FORGE_GUI_CONFIG` cannot recover sessions or write a Workspace owned by another instance: startup fails with the canonical Workspace path and owner diagnostics before session recovery begins, and dynamically adding an owned Workspace is rejected. Path aliases such as relative paths, `..`, and symlinks resolve to the same canonical Workspace and cannot bypass ownership. The OS releases the lock automatically when the owning process exits, so a later instance can take over. Use a separate config path, address, and workspace for an isolated test instance. See [internal/serve/README.md](internal/serve/README.md) for the AgentHub boundary, current settings behavior, and isolated validation.

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

## Interactive Agent Sessions

Interactive agents are launched through the Forge web UI and AgentHub. A resource-managed conversation has one current generation; explicit diagnostic Sessions may still coexist. Archiving a resource does not delete a running session record synchronously; `forge serve` requests the corresponding AgentHub stop and removes the transient record only after safe terminal-state reconciliation.

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

Use `forge template list/show/validate/render/create/migrate` to inspect and manage templates. `forge template show <name>` defaults to human-readable metadata, every field requirement, diagnostics, and the complete Markdown body. Use `--raw` for the original template file, `--json` for structured template data, or `--schema` for schema metadata and diagnostics; these output modes are mutually exclusive. `forge task create --template=<name> --field name=value` creates from one, while `--dry-run` previews without filesystem side effects. `--fields` accepts a YAML or JSON object and repeated `--field` values override the file. Execution settings are not part of V2 content templates.

Templates without `schema-version` remain visible as legacy V1 templates with deprecation warnings. Their old execution properties are ignored. `forge template migrate <name>` previews a static V2 conversion and `--write` atomically applies it without inventing fields or changing the Markdown body. Created tasks store only the template name, schema version, and digest in `task.json`; later template edits do not modify them.

## Workspace Layout

```text
AgentWorkspace/
  AGENTS.md                   global human and agent instructions
  forge.json                  workspace configuration
  forge-sessions.json         transient AgentHub Session projections for forge serve
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
      task.json               task and repository metadata
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

forge workspace status [--server=<url>]
forge workspace history [--cursor=<cursor>] [--limit=<n>] [--server=<url>]
forge project status [--project=<project>] [--server=<url>]
forge project history [--project=<project>] [--cursor=<cursor>] [--limit=<n>] [--server=<url>]
forge task status [--project=<project>] [--task=<task>] [--server=<url>]
forge task history [--project=<project>] [--task=<task>] [--cursor=<cursor>] [--limit=<n>] [--server=<url>]
forge history turn show --ref=<reference> [--server=<url>]
forge history event show --ref=<reference> [--server=<url>]
forge message send --to=<resource> [--mode=steer|enqueue|interrupt] [--server=<url>] <message>
forge message show --id=<message-id> [--server=<url>]
forge resource archive --id=<resource>

forge task create [<title>] [--project=<project>] [--slug <slug>]
                  [--detail <detail>|--task-markdown <markdown>|--template=<name>]
                  [--field <name>=<value>...] [--fields <file>] [--dry-run] [--json]
forge task list [--project=<project>] [--all]
forge task show|archive ...
forge task log add|list ...
forge task repo add|list|remove ...

forge session list
forge session show --id=<id>

forge workspace tree --json
forge workspace resource --id=<resource> --json

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
go test -race ./...
go vet ./...
cd web && npm ci && npm run check && npm test && npm run test:e2e && cd ..
scripts/build
```

`scripts/build` validates and builds the Svelte frontend before embedding the generated assets in the single Forge binary. Node is required only for development and builds; the shipped binary has no Node runtime dependency. For frontend development against an isolated Workspace, run `scripts/frontend-dev /path/to/isolated/AgentWorkspace` and open the Vite URL. See [web/README.md](web/README.md) for the frontend ownership, lifecycle, and performance contracts.

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
