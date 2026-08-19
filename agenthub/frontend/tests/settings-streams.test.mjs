import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const frontendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("opening Settings releases long-lived AgentHub streams before config fetch", async () => {
  const app = await readFile(path.join(frontendRoot, "src", "App.jsx"), "utf8");
  const companion = await readFile(path.join(frontendRoot, "src", "companion", "Companion.jsx"), "utf8");

  assert.ok(app.includes("if (settingsOpen) return undefined;"), "session EventSource must stop while Settings is open");
  assert.ok(app.includes("[activeId, eventReloadKey, settingsOpen]"), "session stream must resume when Settings closes");
  assert.ok(app.includes("pauseLiveUpdates={settingsOpen}"), "the companion must receive the Settings pause state");
  assert.ok(companion.includes("if (pauseLiveUpdates || !companion.showActivity)"), "activity EventSource must stop while Settings is open");
  assert.ok(companion.includes("quotaRequest.current?.abort()"), "queued quota fetches must be cancelled while Settings is open");
});
