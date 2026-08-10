# Forge web application

This directory owns the complete Forge web application: Svelte 5 and TypeScript source, frontend tests and build tooling, the static HTML/vendor tree, generated Vite assets, and the Go embed boundary. `src/entry.ts` is the only production application entry point, and all components use runes mode. Vite emits deterministic `forge-app.js` and `forge-app.css` assets into `static/assets`; `assets.go` embeds `static/` so the released Forge binary has no Node runtime dependency.

The directory layers are intentional:

- `src/` contains editable application source.
- `tests/` contains Vitest fixtures/component tests and Playwright flows.
- `static/` contains the HTML shell, immutable vendor/icon assets, and generated `assets/forge-app.{js,css}` files served at runtime.
- `assets.go` exposes the complete static tree to the Go server through `go:embed`.

## Architecture and ownership

- `app-controller.ts` owns server synchronization, session orchestration, persistence, and the projection of backend state into typed view models. It does not render application DOM.
- `components/` owns the entire interactive UI. Components receive typed models and callbacks through `ModelChannel`, and keep form, focus, selection, expansion, and pending-action state locally when that state belongs to the view.
- `entry.ts` creates the channels and component roots. The static HTML document provides mount points and vendor scripts only.
- `api/client.ts` owns scoped request cancellation and stale-response rejection. Detail previews, Diff requests, uploads, and chat history are keyed by Workspace, Resource, Session, path, or mode identity as appropriate.
- `app.css` is the global style entry and imports only `styles/tokens.css`, browser defaults from `styles/base.css`, deliberately shared UI primitives, and the `.markdown-rendered` rich-content boundary. It must not contain component selectors.
- Every visual Svelte component owns an adjacent `ComponentName.css` module imported by that component. Selectors are bounded by the component's `data-component-owner`; top-level mount roots receive the attribute from `entry.ts`, while nested rich UI components declare it on their root element. `:where(...)` keeps the boundary from increasing the original selector specificity.
- A rule belongs in `styles/primitives.css` only when multiple independent component roots intentionally share the same class contract. Component-specific responsive rules, forced-colors behavior, reduced-motion behavior, state selectors, and keyframes stay with their component.
- Dynamic status classes remain inside their owning component boundary. Marked/DOMPurify output is styled only below `.markdown-rendered`, and Diff2Html vendor classes are styled only below the `DiffModal` owner and `.diff-viewer`; unbounded vendor selectors are not allowed.

When adding or changing styles, prefer the nearest component module. Promote a rule to a shared layer only after identifying multiple current consumers; do not add a component selector to `app.css` or move an unbounded global selector into another file. `tests/unit/css-ownership.test.ts` enforces the entry imports, component imports, ownership markers, and rich-content wrapper contract.

Application state is never rendered by assembling HTML strings or mutating component-owned DOM. `DiffModal.svelte` is the single explicit rich-HTML boundary: Diff2Html converts a backend diff string to its vendor-defined presentation inside a dedicated viewer element. Markdown passes through Marked and DOMPurify before Svelte inserts the sanitized output.

The shell has one canonical Workspace and Resource selection. That selection drives tree highlight, Session highlight, title, unread state, and History API projection. Project, Task, Session, log, and timeline rows use stable keys so unrelated refreshes retain their DOM identity. A drag transaction suppresses refresh until persistence succeeds or rolls back.

Form state is keyed by explicit identity, not refresh frequency. Republishing a model with the same identity preserves edits, focus, selection, scroll, uploads, and pending sends. Changing identity resets local state and invalidates work from the previous context. Document identity includes Workspace, Resource, path, display mode, and `contentHash`; AGENTS.md saves carry the baseline hash and preserve the local draft on HTTP 409.

## Lifecycle contract

- The component registry gives every mounted root exactly one cleanup and tears down the previous instance before replacement.
- `pagehide` stops the controller and unmounts all component roots; `pageshow` mounts and starts a fresh application instance.
- `ResourceScope` owns controller DOM listeners, intervals, animation frames, and custom cleanup. Controller shutdown also closes EventSource and BroadcastChannel instances, clears delayed renders, aborts pending preview work, and flushes the active draft.
- Components release subscriptions, viewport timers, request controllers, streams, and upload XHRs from their Svelte teardown paths.
- Late HTTP responses, stream events, and send acknowledgements are rejected after their identity or generation changes.

## Performance gates

`tests/fixtures/performance.ts` provides deterministic stress fixtures. The unit suite enforces these deliberately generous CI budgets to catch order-of-magnitude regressions and unbounded DOM growth:

| Scenario | Fixture | Budget |
| --- | ---: | ---: |
| Project/Task tree | 720 rows | 5,000 ms and fewer than 15,000 elements |
| Resource log | 750 entries | 4,000 ms and fewer than 10,000 elements |
| Markdown document | 3,000 sections | 1,000 ms |
| Session event canonicalization | 10,000 events with an overlapping delta | 1,000 ms |
| Continuous Session updates | 1,000 deltas applied after 10,000 events | 1,500 ms |

These gates complement component stability tests and Playwright flows; they are regression alarms rather than user-facing latency targets.

## Commands

```sh
npm ci
npm run check
npm test
npm run build
npm run test:e2e
```

`npm run dev` proxies `/api` to Forge on `127.0.0.1:4936`. Run development and browser tests only against an isolated Workspace.
