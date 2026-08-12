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
forge CLI ────────────────────┐
                              ├── AgentWorkspace files (source of truth)
forge serve ── internal/app ──┤
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
- **Chat:** start, close, resume, or revisit sessions; end the current turn while keeping the Session open; stream responses and tool activity; answer approvals; and upload files.
- **Settings:** set the browser-local user name used for chat provenance, add or remove workspaces, choose one of the bundled workspace icons, edit the user-owned portion of workspace `AGENTS.md`, inspect the read-only AgentHub catalog, and map system or custom Agent Profiles—including the reserved `scheduler` route—to catalog agents. The user name defaults to `User` and is not written to server configuration or workspace data.

The desktop panes and session list are resizable. On smaller screens, navigation becomes a drawer and details/chat become switchable views.

### AgentHub execution

Forge does not import provider adapters, spawn provider CLIs, probe provider health, or keep a direct-runner fallback. Agent and provider definitions in the AgentHub catalog are read-only in Forge. New chat sessions resolve a Forge Profile to an AgentHub `agentName` and project canonical AgentHub events into the GUI.

Every user message is sent to AgentHub with provenance `role=user` and the browser-local name configured in Settings. The timeline shows that name with a `USER` label; missing or invalid names fall back to `User`.

Forge retains workspace/task/Profile control and a minimal transient record for active GUI sessions. `forge serve` owns AgentHub session reconciliation: it removes that record only after observing a durable terminal state, or proving through continuous durable event history that an archived session passed through `stopped`. An unreachable or unknown AgentHub state keeps the record for later reconciliation. Plain CLI commands (`forge session list/show/new/heartbeat/end`, `forge workspace tree`, and resource archival) never contact AgentHub. Historical pre-AgentHub runs and their local event logs are no longer read or migrated; input, approval, interrupt, stop, and resume operations are unavailable for those files.

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

Interactive agents are launched through the Forge web UI and AgentHub. A resource may have multiple active sessions. Archiving a resource does not delete a running session record synchronously; `forge serve` requests the corresponding AgentHub stop and removes the transient record only after safe terminal-state reconciliation.

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

forge resource archive --id=<resource>

forge task create [<title>] [--project=<project>] [--slug <slug>]
                  [--detail <detail>|--task-markdown <markdown>|--template=<name>]
                  [--field <name>=<value>...] [--fields <file>] [--dry-run] [--json]
forge task list [--project=<project>] [--all]
forge task show|archive ...
forge task log add|list ...
forge task repo add|list|remove ...

forge session new|heartbeat|end|list|show ...

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
