# Forge frontend migration infrastructure

This directory contains Svelte 5 islands that coexist with the legacy page during the staged migration. New Svelte code must use runes mode. Vite emits deterministic assets into `../web/static/svelte`, where the Go server embeds them in the Forge binary.

## Ownership and lifecycle

- Legacy markup owns each island root; Svelte exclusively owns the root's children after `replaceIsland` clears the fallback.
- Legacy render functions must not write inside an active island, and Svelte components must not query or mutate legacy-owned DOM.
- Every island mount has one registered cleanup. Replacing an island first awaits its previous cleanup; `pagehide` unmounts all islands.
- Timers, DOM listeners, streams, and requests created by a component must be disposed from the component teardown path.
- Shared state crosses the boundary through typed properties, callbacks, or the API client, never by scraping DOM.

The migrated islands now own the create-project/create-task flow (including template preview), settings, Self-Driving configuration, upload dialog, chat composer, and the complete Detail panel. Detail delegates documents, logs, Artifact/Wiki browsers, file preview, Diff, and the Workspace AGENTS.md editor to persistent child boundaries. Their roots expose `data-svelte-owned` for ownership diagnostics. Legacy JavaScript remains responsible for global navigation and the resource query projection, then publishes typed models and callbacks through the bridge; it must not render or read controls inside those roots. Detail-owned preview and Diff requests use the shared API client directly and are aborted when their Workspace, Resource, path, or mode identity changes.

Form state is keyed by an explicit identity rather than by refresh frequency. Publishing a new model for the same identity preserves user edits, focus, selection, scroll position, uploads, and pending sends. A changed identity resets the local state and invalidates or aborts work from the previous context.

Detail document identity includes the Workspace, Resource, file path, display mode, and backend `contentHash`. Keyed log rows and persistent hidden tab panels keep unchanged DOM nodes, selections, expanded entries, and scroll state intact while metadata polling or pagination updates other boundaries. Workspace AGENTS.md saves send the baseline content hash; a concurrent disk change returns HTTP 409 while the local draft remains untouched.

## Commands

```sh
npm ci
npm run check
npm test
npm run build
npm run test:e2e
```

`npm run dev` proxies `/api` to the default Forge server on `127.0.0.1:4936`. Production requires only the Go binary; Node is a build and test dependency.
