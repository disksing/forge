# Forge CLI adapter

`internal/forge` owns the `forge` command surface: argument parsing, current-directory selection, compatibility error wording, and stdout formatting.

Workspace discovery and resource selector normalization are exposed by `internal/app`; all resource creation, reads, archive operations, logs, repository binding, Workspace snapshots, initialization, and migration execute through an `app.Workspace`. The CLI package must not add a second filesystem model, resource schema, migration path, or business mutation fallback.

The only process-global behavior kept here is intentional CLI adaptation, such as reading the current working directory or stdin and writing command output. `internal/app` remains explicitly rooted and returns typed values without user-facing output.
