import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vitest/config";

// Performance and bounded-DOM gates are intentionally opt-in. They mount large
// stress fixtures and assert wall-clock budgets, so they are flaky on shared CI
// runners and too expensive to run on every commit. Run them on demand with
// `npm run test:perf` when performance-sensitive components change.
export default defineConfig({
  plugins: [svelte()],
  resolve: {
    conditions: ["browser"],
  },
  test: {
    environment: "jsdom",
    include: ["tests/perf/**/*.test.ts"],
    restoreMocks: true,
  },
});
