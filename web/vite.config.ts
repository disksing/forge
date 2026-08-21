import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";

const root = fileURLToPath(new URL(".", import.meta.url));

// Dev-server API proxy target: the running PUA backend the dev frontend
// talks to. Override with PUA_DEV_API_TARGET when the backend is not on the
// desktop default loopback address (e.g. the LAN-serving instance).
const apiTarget = process.env.PUA_DEV_API_TARGET ?? "http://127.0.0.1:4936";

export default defineConfig({
  root: resolve(root, "static"),
  cacheDir: resolve(root, ".vite"),
  plugins: [
    {
      name: "pua-svelte-development-entry",
      enforce: "pre",
      async resolveId(id, importer) {
        if (id === "/assets/pua-app.js") {
          return resolve(root, "src/entry.ts");
        }
        if ((id === "svelte" || id.startsWith("svelte/")) && !importer?.includes("/node_modules/svelte/")) {
          return this.resolve(id, resolve(root, "src/entry.ts"), { skipSelf: true });
        }
        return null;
      },
    },
    {
      // index.html links the built bundle stylesheet; in dev that file is a
      // stale build artifact while every style comes from the module graph.
      // Serve an empty sheet instead so stale rules cannot shadow dev CSS.
      name: "pua-dev-no-stale-bundle-css",
      apply: "serve",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url?.split("?")[0] === "/assets/pua-app.css") {
            res.setHeader("content-type", "text/css");
            res.end("/* dev mode: styles load through the Vite module graph, not the built bundle */");
            return;
          }
          next();
        });
      },
    },
    svelte({ configFile: resolve(root, "svelte.config.js") }),
  ],
  build: {
    emptyOutDir: true,
    outDir: resolve(root, "static/assets"),
    sourcemap: false,
    lib: {
      entry: resolve(root, "src/entry.ts"),
      formats: ["es"],
      fileName: () => "pua-app.js",
      cssFileName: "pua-app",
    },
    rollupOptions: {
      output: {
        assetFileNames: "pua-app.[ext]",
      },
    },
  },
  server: {
    fs: {
      allow: [root, resolve(root, "static")],
    },
    proxy: {
      "/api": apiTarget,
    },
  },
  optimizeDeps: {
    exclude: ["svelte"],
  },
  ssr: {
    optimizeDeps: {
      exclude: ["svelte"],
    },
  },
});
