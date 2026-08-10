import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  root: resolve(root, "../web/static"),
  cacheDir: resolve(root, ".vite"),
  plugins: [
    {
      name: "forge-svelte-development-entry",
      enforce: "pre",
      async resolveId(id, importer) {
        if (id === "/svelte/forge-svelte.js") {
          return resolve(root, "src/entry.ts");
        }
        if ((id === "svelte" || id.startsWith("svelte/")) && !importer?.includes("/node_modules/svelte/")) {
          return this.resolve(id, resolve(root, "src/entry.ts"), { skipSelf: true });
        }
        return null;
      },
    },
    svelte({ configFile: resolve(root, "svelte.config.js") }),
  ],
  build: {
    emptyOutDir: true,
    outDir: resolve(root, "../web/static/svelte"),
    sourcemap: false,
    lib: {
      entry: resolve(root, "src/entry.ts"),
      formats: ["es"],
      fileName: () => "forge-svelte.js",
    },
    rollupOptions: {
      output: {
        assetFileNames: "forge-svelte.[ext]",
      },
    },
  },
  server: {
    fs: {
      allow: [root, resolve(root, "../web/static")],
    },
    proxy: {
      "/api": "http://127.0.0.1:4936",
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
