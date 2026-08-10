# Forge frontend migration infrastructure

This directory contains Svelte 5 islands that coexist with the legacy page during the staged migration. New Svelte code must use runes mode. Vite emits deterministic assets into `../web/static/svelte`, where the Go server embeds them in the Forge binary.

## Ownership and lifecycle

- Legacy markup owns each island root; Svelte exclusively owns the root's children after `replaceIsland` clears the fallback.
- Legacy render functions must not write inside an active island, and Svelte components must not query or mutate legacy-owned DOM.
- Every island mount has one registered cleanup. Replacing an island first awaits its previous cleanup; `pagehide` unmounts all islands.
- Timers, DOM listeners, streams, and requests created by a component must be disposed from the component teardown path.
- Shared state crosses the boundary through typed properties, callbacks, or the API client, never by scraping DOM.

The first island owns only the brand version text. It deliberately preserves the current page appearance while proving build, embed, mount, replacement, and unmount behavior.

## Commands

```sh
npm ci
npm run check
npm test
npm run build
npm run test:e2e
```

`npm run dev` proxies `/api` to the default Forge server on `127.0.0.1:4936`. Production requires only the Go binary; Node is a build and test dependency.
