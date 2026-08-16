# PUA CLI adapter

`internal/pua` owns the `pua` command surface: argument parsing, current-directory selection, error wording, and stdout formatting.

Workspace discovery and resource selector normalization are exposed by `internal/app`; all resource creation, reads, archive operations, Resource History access, repository binding, Workspace snapshots, initialization, and migration execute through an `app.Workspace`. The CLI package must not add a second filesystem model, resource schema, migration path, or business mutation fallback.

The only process-global behavior kept here is intentional CLI adaptation, such as reading the current working directory or stdin and writing command output. `internal/app` remains explicitly rooted and returns typed values without user-facing output.

Creation commands call `internal/app` directly and do not persist creator metadata. Resource generations inject `PUA_WORKSPACE_ROOT`, `PUA_WORKSPACE_INSTANCE_ID`, and `PUA_RESOURCE_ID` so Agent message provenance can be validated. Creation never contacts PUA Server, sends an initial message, or creates a generation. Agents send the first input separately with `pua message send`; message requests include the stable sender Workspace instance ID as provenance and default to result subscription, with `--subscribe-result=false` available when needed.
