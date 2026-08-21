import assert from "node:assert/strict";
import test from "node:test";

import { buildTimeline } from "../src/timeline.js";

test("semantic tool.call updates settle one provider-neutral tool item", () => {
  const items = buildTimeline([
    {
      id: "sem_1_0", type: "tool.call", turnId: "turn_1",
      data: { callId: "call_1", operation: "start", toolKind: "command", name: "Command", summary: "go test ./...", status: "running" },
    },
    {
      id: "sem_2_0", type: "tool.call", turnId: "turn_1",
      data: { callId: "call_1", operation: "finish", status: "completed", output: { mode: "replace", text: "ok\n" } },
    },
  ]);

  assert.equal(items.length, 1);
  assert.equal(items[0].kind, "activity");
  assert.equal(items[0].items[0].kind, "tools");
  assert.deepEqual(items[0].items[0].calls[0], {
    key: "sem_1_0", callId: "call_1", name: "Command", summary: "go test ./...",
    status: "completed", output: "ok", error: "", method: "start", time: "",
  });
});

test("retryable provider errors remain informational", () => {
  const [item] = buildTimeline([{
    id: "sem_3_0", type: "provider.error",
    data: { message: "Connection interrupted", retryable: true },
  }]);

  assert.deepEqual(item, {
    kind: "lifecycle", tone: "info", key: "sem_3_0", time: "", text: "Connection interrupted",
  });
});
