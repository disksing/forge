# Forge

Forge is a local, filesystem-first workspace manager for people and AI coding agents. It combines a deterministic CLI with a responsive web UI for organizing projects and tasks, running interactive agent sessions, and reviewing the resulting files and Git changes.

The workspace is the source of truth. Contracts are Markdown, structured state is JSON, resource History is the canonical conversation projection, generated output is stored as artifacts, and code changes live in task-owned Git worktrees. The GUI is a control plane over those files rather than a separate project database.

## Highlights

- **Transparent local state.** Projects, tasks, resource History, artifacts, templates, and Wiki pages remain inspectable workspace data that can be backed up or repaired without the GUI.
- **Purpose-built agent context.** Durable scope and acceptance criteria are paired with bounded resource History so a new agent can resume without reconstructing the task from an obsolete manual timeline.
- **Isolated code changes.** Repositories under `repos/` are shared source caches; each coding task records its own branch and worktree under `task.../worktree/`.
- **Explicit file ownership.** Generated agent instructions allow writes only in the starting resource and its task worktrees, while keeping other Workspace resources read-only.
- **Interactive agents through AgentHub.** Forge GUI uses AgentHub as its only execution and conversation surface, including streaming chat, resumable history, file uploads, approvals, and mid-turn user intervention.
- **A workspace-oriented UI.** Switch between workspaces, browse projects and tasks, inspect Markdown and artifacts, preview Wiki pages, review worktree diffs, monitor resource runtime state, and use the details/chat layout on desktop or mobile. The layout adapts to the window width: three columns (sidebar, details, chat) on wide screens, two columns with a tabbed details/chat pane below 1440px, and a single-column mobile layout below 980px. The Appearance tab in System Settings lets users override the responsive choice manually — auto, three columns, tabbed two columns, or a split view that collapses the sidebar into a drawer with details and chat side by side — and scale the text of the sidebar, details, and chat columns independently; both preferences are stored in the browser.
- **Agent-interpreted scheduling.** Every Workspace has a Forge-managed Scheduler resource that evaluates natural-language conditions and sends ordinary resource messages without introducing a second execution protocol.

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

- **Navigation:** switch workspaces, open the fixed Scheduler entry, expand the project/task tree, and monitor each resource's current runtime state.
- **Details:** render Scheduler context, schedules, `project.md`, `task.md`, and resource History; browse templates and artifacts; preview the workspace Wiki; inspect repository/worktree metadata; and render tracked plus untracked Git diffs.
- **Chat:** select a Workspace, Scheduler, Project, or Task and send a message directly; Forge lazily creates or reuses that work subject's current generation. The resource timeline continues across generation boundaries, shows explicit history gaps, and pages older Turns without exposing Session lifecycle controls. A new generation recovers from the brief, bounded recent resource history, task-worktree Git state, and artifacts rather than a second permanent progress file. Waiting mailbox messages appear above the composer and can be inserted into the active Turn without changing message ID when steer is supported.
- **Settings:** set the browser-local user name used for chat provenance, add or remove workspaces, choose one of the bundled workspace icons, edit the user-owned portion of workspace `AGENTS.md`, inspect the read-only AgentHub catalog, map Profiles to catalog agents, and choose the one-time Profile defaults for newly created Workspaces, Projects, and Tasks. The user name defaults to `User` and is not written to server configuration or workspace data.

The desktop panes are resizable. On smaller screens, navigation becomes a drawer and details/chat become switchable views.

### AgentHub execution

Forge does not import provider adapters, spawn provider CLIs, probe provider health, or keep a direct-runner fallback. Agent and provider definitions in the AgentHub catalog are read-only in Forge. Every Workspace, Scheduler, Project, and Task stores an explicit binding to either a Forge Profile or an AgentHub Agent. The chat composer options bar presents Profiles and direct Agents in one selector and saves a new binding as soon as it is picked: Profile entries show their current Agent, while Agent entries list every Profile that targets them. Profile bindings resolve to an `agentName`; a missing custom Profile preserves that explicit binding and falls back through the resource-type default and then global `default`, exposing the unresolved binding and actual fallback on the generation. Changing or restoring a route retires an obsolete generation at a turn boundary and creates the next generation lazily. The Scheduler defaults to Profile `fast` and then the global `default` fallback if `fast` is unavailable.

Every user message is sent to AgentHub with provenance `role=user` and the browser-local name configured in Settings. The timeline shows that name with a `USER` label; missing or invalid names fall back to `User`.

Forge persists each resource generation under `<workspace>/.forge/runtime/resources/<resource-key>/`: one mutable `current.json` and immutable retired manifests in `generations/`. The resource key is derived from the stable Workspace instance ID and normalized resource ID, so it is unambiguous and independent of the Workspace path. A versioned `generation-store.json` marker and staging directory make migration from the old `.forge/runtime/generations.json` and `.forge/gui-agent/runs.json` repeatable; those legacy files remain as rollback evidence, while records without a generation ID are isolated as cold history. The same resource directory contains the atomic mailbox `hot.json`, `receipts.json`, `outbox.json`, `scheduler.json`, and `commit.json`: hot state retains complete messages while delivery, recovery, notification, or Scheduler turn-boundary work is unresolved; terminal messages become minimal receipts without body text. Receipts retain at most 2,048 entries and seven days, and their bounded expired index returns `message_receipt_expired` (HTTP 410) before the ID is eventually forgotten. Accepted messages are fsynced before success is returned and retain stable IDs, provenance, requested/actual mode, downgrade reason, delivery state, timestamps, diagnostics, and any generation/Turn association. Generated notification bodies are kept in the recoverable outbox only until target acceptance; source and target retain bounded summaries while AgentHub history remains canonical. Upgrading stages generation records, mailbox schema v1/v2, and legacy `pendingMessages` by stable resource, writes the new stores first, deduplicates by stable ID, and only then clears legacy queues, so an interrupted migration can be repeated without loss. AgentHub assumes durable at-least-once delivery responsibility before Forge marks an item delivered; a delivered item means accepted by AgentHub, not that its Turn is complete.

A ready current generation is automatically slept after 30 minutes of continuous idle when there is no active Turn or approval, pending mailbox delivery, or lifecycle convergence. Forge persists the ready boundary and Stop-confirms the exact AgentHub Session, then retains that same generation and Session as an addressable idle-suspended resource. A later user, agent, system, or Scheduler message resumes that exact Session on demand and only delivers after the Session is ready; a stopped current Session observed after a Forge or AgentHub restart follows the same path. With no pending message, a stopped Session stays stopped and no provider work starts. Only a binding/profile change, resource archive, archived/missing Session, explicit provider/native resume failure, or other replacement intent archives and retires the generation. Polling and Server restarts do not reset the deadline, and the resource history remains continuous across the retained generation.

Resource messages use `steer` (default), `enqueue`, or `interrupt`. A supported active Turn receives steer immediately; an unsupported steer is durably downgraded to enqueue. Enqueue waits for a ready boundary. Interrupt first persists its mailbox item, records the exact active Turn, interrupts only that Turn, waits for terminal state, and then opens a new Turn. Already-delivering messages resolve first; otherwise interrupt outranks steer, and steer outranks queued enqueue, with acceptance order preserved inside each class. A live steer or interrupt may therefore bypass older enqueue work. Generation replacement never moves mailbox ownership: delivered steer remains with the old Turn, enqueue waits for the new generation, and interrupt terminates the old Turn before replacement delivery. The periodic reconciler recovers all modes after Server or AgentHub failures. Archived resources reject new messages: items not yet sent become `undeliverable`, while an already-attempted item whose AgentHub outcome cannot be confirmed becomes `delivery_unknown`; both remain queryable by message ID.

Public work-subject state is `idle`, `working`, `attention_required`, `unavailable`, or `archived`. Waiting is a message state and count, never a Task state: the persisted internal `queued` value is exposed as `waiting`. Promoting a waiting message to the current Turn records `promotedAt` and changes its actual mode to steer on the same durable mailbox item.

The Web sidebar has a server-owned Attention list below the resource tree. Project and Task rows expose a hollow star on hover/focus and a filled star when followed. Following and unfollowing use stable resource IDs. The list always includes resources with an active Turn; after a Turn ends, a resource remains only when it is followed and its resource-wide turn ordinal is newer than its recorded dismiss ordinal. Active resources sort before idle resources; active rows sort by current Turn start time, while idle rows sort by latest Turn end time. Both groups use newest first and stable title/resource-ID tie breakers, so output-driven runtime updates do not reorder the list. Hovering an idle list row exposes dismiss (`x`), which records that ordinal and hides the row until a later Turn begins. Active-Turn rows do not expose dismiss because they must remain visible, and the control returns as soon as the AgentHub session leaves its active state even if its ready snapshot still carries the previous Turn ID. Creating a Project/Task or sending any resource message automatically follows that resource. The persisted focus map lives in `<workspace>/.forge/gui-state.json`; it is independent of the removed Forge Session lifecycle projection.

### Scheduler

`forge init` and `forge migrate` non-destructively create the special `scheduler/` resource. Its formatted `scheduler.json` contains `schemaVersion`, an independent Agent/Profile binding, `wakeIntervalMinutes` (30 by default), and a `schedules` array. A schedule intentionally has only `id`, `description`, `condition`, `target`, `createdAt`, and `updatedAt`; conditions are natural language, not cron expressions. `scheduler.md` is optional durable judgment context maintained by the Scheduler Agent, while `AGENTS.md` explains the parent instructions, allowed files, duplicate-message behavior, and required target-message fields.

The Server sends enqueue-only `scheduler_tick` system messages. It does not interpret conditions itself. An empty schedule list produces no Turn; adding or changing a schedule requests an immediate coalesced tick. Otherwise the interval is measured from the end of the previous completed Server-triggered Scheduler Turn, so user chat with the Scheduler does not postpone its next wake. Restart recovery checks durable mailbox and canonical AgentHub Turn state before deciding whether one recovery tick is needed. Messages to schedule targets may repeat, and receivers use the schedule ID to handle duplicates.

The Scheduler may target only `workspace`, `scheduler`, or an open Project/Task in the same Workspace. Use the fixed GUI entry to bind its Agent/Profile, change the interval, maintain schedules, inspect context, and chat. The CLI exposes schedule data only:

```text
forge scheduler list [--json]
forge scheduler show --id=<schedule>
forge scheduler add --description=<text> --condition=<text> --target=<resource>
forge scheduler update --id=<schedule> [--description=<text>] [--condition=<text>] [--target=<resource>]
forge scheduler remove --id=<schedule>
```

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

These commands infer the sending resource from the current directory, attach `role=agent` and its stable resource ID as provenance, and contact the owning `forge serve` address discovered from `.forge/serve.lock`. `--server=<url>` is an explicit override. History lists and Turn/Event details default to formatted text for direct reading; pass `--json` for the complete structured response. `forge message show` returns a body only while the message is hot; a retained cold receipt is explicitly marked as a receipt and remains queryable by its status and provenance, while an aged-out ID returns `message_receipt_expired`/HTTP 410 and an ID beyond the expired-index window returns `message_not_found`. These commands never write mailbox files directly or start a second Server. Provenance is metadata only, not authentication, authorization, or instruction priority.

Useful overrides:

```text
FORGE_AGENTHUB_URL  AgentHub endpoint override
FORGE_GUI_CONFIG    GUI configuration file
```

`forge serve` no longer reads the former `FORGE_CLI` override. Remove that setting when upgrading; Workspace operations use the in-process typed API and the configured Workspace path.

Each running GUI instance exclusively locks its configuration file, and every managed Workspace is additionally owned by exactly one `forge serve` process through an OS advisory lock at `<workspace>/.forge/serve.lock`. A second instance with a different `FORGE_GUI_CONFIG` cannot write a Workspace owned by another instance: startup fails with the canonical Workspace path and owner diagnostics before runtime recovery begins, and dynamically adding an owned Workspace is rejected. Path aliases such as relative paths, `..`, and symlinks resolve to the same canonical Workspace and cannot bypass ownership. The OS releases the lock automatically when the owning process exits, so a later instance can take over. Use a separate config path, address, and workspace for an isolated test instance. See [internal/serve/README.md](internal/serve/README.md) for the AgentHub boundary, current settings behavior, and isolated validation.

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

Interactive agents are launched through the Forge web UI and AgentHub. A resource-managed conversation has one current generation, addressed by the resource ID and generation ID. AgentHub Session IDs are retained only as provider-correlation facts in durable generation records and history; they are not Forge resource addresses or lifecycle controls. Archiving a resource reconciles its generation with AgentHub and preserves the durable history.

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
  .forge/runtime/generation-store.json  generation store schema/migration marker
  .forge/runtime/resources/<resource-key>/  current/retired generations plus mailbox bundle
    current.json                    mutable current generation record
    generations/                    immutable retired generation manifests
    hot.json                         unresolved complete mailbox messages only
    receipts.json                    bounded terminal receipts and expired-ID index
    outbox.json                      recoverable notification operations
    scheduler.json                   latest Scheduler tick checkpoint
    commit.json                      mailbox multi-document recovery marker
  .forge/runtime/resources/.mailbox-migration.json  durable mailbox migration marker
  .forge/runtime/resources/.message-locations/       rebuildable message lookup index
  wiki/
    index.md                  long-lived workspace knowledge
  scheduler/
    scheduler.json            formatted configuration and natural-language schedules
    scheduler.md              Scheduler Agent durable judgment context
    AGENTS.md                 generated Scheduler resource instructions
  repos/
    forge/                    shared normal checkout
  project1-forge-dev/
    AGENTS.md                 generated project launch card
    project.json              structured project metadata
    project.md                durable project contract
    templates/                reusable task templates
    artifacts/                project outputs
    task1-first-change/
      AGENTS.md               generated task launch card
      task.json               task and repository metadata
      task.md                 durable task contract
      artifacts/              reports, screenshots, uploads, patches
      worktree/               task-owned Git worktrees
    archive/                  archived tasks
  archive/                    archived projects
```

Open/archive state is represented by directory location. Human-readable directory suffixes do not change resource ids: `project1-forge-dev/task1-first-change/` is still `project1.task1`.

Archive is a reversible, non-destructive directory move. Archiving a Project moves its complete subtree, including open Tasks, in one top-level rename; `--all`, resource lookup, history, and the Web API continue to find the archived resources. Forge performs only read-only best-effort Git checks before the move. Dirty or unmerged worktrees, missing target branches, unverifiable Git state, open child Tasks, and post-move worktree repair failures are returned as structured warnings; Forge never resets, cleans, stashes, deletes, or commits source code for archive. Runtime Session stop/archive and pending mailbox convergence continue asynchronously after the directory move, and a warning does not roll back a completed move.

### File Roles

| File | Role |
| --- | --- |
| `project.md`, `task.md` | Durable contracts: background, scope, acceptance criteria, stable constraints, decisions, and contract-changing questions. |
| Resource History | Bounded generation/Turn conversation history, exposed by the History API and CLI. |
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
forge template list|show|validate|render|create|migrate ...

forge scheduler list [--json]
forge scheduler show --id=<schedule>
forge scheduler add --description=<text> --condition=<text> --target=<resource>
forge scheduler update --id=<schedule> [--description=<text>] [--condition=<text>] [--target=<resource>]
forge scheduler remove --id=<schedule>

forge workspace status [--server=<url>]
forge workspace history [--cursor=<cursor>] [--limit=<n>] [--server=<url>] [--json]
forge project status [--project=<project>] [--server=<url>]
forge project history [--project=<project>] [--cursor=<cursor>] [--limit=<n>] [--server=<url>] [--json]
forge task status [--project=<project>] [--task=<task>] [--server=<url>]
forge task history [--project=<project>] [--task=<task>] [--cursor=<cursor>] [--limit=<n>] [--server=<url>] [--json]
forge history turn show --ref=<reference> [--server=<url>] [--json]
forge history event show --ref=<reference> [--server=<url>] [--json]
forge message send --to=<resource> [--mode=steer|enqueue|interrupt] [--server=<url>] <message>
forge message show --id=<message-id> [--server=<url>]
forge resource archive --id=<resource>

forge task create [<title>] [--project=<project>] [--slug <slug>]
                  [--detail <detail>|--task-markdown <markdown>|--template=<name>]
                  [--field <name>=<value>...] [--fields <file>] [--dry-run] [--json]
forge task list [--project=<project>] [--all]
forge task show|archive ...
forge task repo add|list|remove ...

forge workspace tree --json
forge workspace resource --id=<resource> --json

forge serve [--addr=<address>] [--workspace=<path>] [--version]
```

`forge init` and `forge migrate` accept `--language=en` or `--language=zh-CN`.
The selected language is stored in `forge.json` and controls generated Markdown
templates and Forge-managed `AGENTS.md` prompts. Existing workspaces without a
language setting default to English. Use `forge migrate --language=zh-CN` (or
`--language=en`) to switch languages.

Workspace, Project, and Task creation is local and uses the shared `internal/app` application boundary. Creation no longer persists resource creator metadata; Agent sender provenance remains on messages and is validated from the injected generation environment. Creation sends no initial message and creates no generation; call `forge message send` separately, which lazily creates the first generation. Each message defaults to `subscribeResult=true`; pass `--subscribe-result=false` to disable the Turn result for that input. If a create command commits but its output is lost, query the resource before deciding whether to issue a new create operation.

Subscribed terminal Turn results and terminal cross-resource delivery failures return through the source resource's recoverable outbox as structured system messages with stable `type`, `causation`, and receipt metadata. Same-sender messages in one Turn are grouped with their source IDs; different senders are independent. The generated body is retained only until the target mailbox accepts it; after that, source and target retain bounded summaries while AgentHub canonical history remains the content source. Generated messages force `subscribeResult=false` and never recursively generate another notification. Use `forge message show` for delivery diagnostics and `forge history turn show` for Turn references.

`forge migrate` upgrades supported resource metadata, performs the one-time versioned migration of generation records and mailbox `pendingMessages` into staged resource stores, isolates upgrade-incompatible legacy `forge-sessions.json` and `.forge-sessions.lock` files under `.forge/legacy/`, migrates meaningful legacy task `work.md` content into a digest-marked chapter in `task.md` before removing the source, migrates pre-History resource `log.jsonl` into `artifacts/legacy-log.md` before removing the source, removes obsolete project recovery files, restores a missing Wiki index, creates or validates the Scheduler resource, and refreshes Forge-managed `AGENTS.md` blocks. Known default explanatory comments are stripped only on exact deterministic matches; conflicts and uncertain content fail closed. Mailbox stores are committed before migrated queues are cleared, retries deduplicate by stable message ID, and retained legacy files provide rollback evidence. An older Forge that does not understand the new resource stores must not write the Workspace after migration; stop the new Server and use a compatible version or restore from backup. It is safe to run repeatedly and preserves generation, mailbox, Scheduler, and user content outside these markers:

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
