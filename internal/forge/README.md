# Forge CLI adapter

`internal/forge` owns the `forge` command surface: argument parsing, current-directory selection, compatibility error wording, and stdout formatting.

Workspace discovery and resource selector normalization are exposed by `internal/app`; all resource creation, reads, archive operations, Resource History access, repository binding, Workspace snapshots, initialization, and migration execute through an `app.Workspace`. The CLI package must not add a second filesystem model, resource schema, migration path, or business mutation fallback.

The only process-global behavior kept here is intentional CLI adaptation, such as reading the current working directory or stdin and writing command output. `internal/app` remains explicitly rooted and returns typed values without user-facing output.

Creation commands call `internal/app` directly and accept `--creator=user|agent`. Resource generations inject `FORGE_WORKSPACE_ROOT`, `FORGE_WORKSPACE_INSTANCE_ID`, and `FORGE_RESOURCE_ID`; a complete verified context makes an omitted flag select Agent provenance, while ordinary local use selects user. Explicit user always records user, and explicit Agent fails closed when the context is incomplete or stale. Creation never contacts Forge Server, sends an initial message, or creates a generation. Agents send the first input separately with `forge message send`; message requests include the stable sender Workspace instance ID as provenance.
