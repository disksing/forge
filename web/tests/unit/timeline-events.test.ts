import { describe, expect, it } from "vitest";

import type { AgentEvent } from "../../src/components/models";
import { compactTimelineEvents, mergeCanonicalEventBatch, mergeCanonicalEvents } from "../../src/components/timeline-events";

function toolUpdate(id: number, callId: string, text: string): AgentEvent {
  return {
    id, type: "tool.event", data: {
      method: "session/update",
      raw: { update: { sessionUpdate: "tool_call_update", toolCallId: callId, content: [{ type: "text", text }] } },
    },
  };
}

describe("timeline event algorithms", () => {
  it("merges overlap, out-of-order events, append deltas, and full healing deterministically", () => {
    const events = mergeCanonicalEvents([
      { id: 4, type: "message.assistant.delta", time: "t1", data: { text: "hel" } },
      { id: 2, type: "message.input", data: { text: "earlier" } },
      { id: 4, type: "message.assistant.delta", time: "t2", startTime: "t0", data: { text: "lo", append: true } },
      { id: 3, type: "tool.started", data: { text: "tool" } },
      { id: 4, type: "message.assistant.delta", time: "t3", data: { text: "hello" } },
    ]);

    expect(events.map((event) => event.id)).toEqual([2, 3, 4]);
    expect(events[2]).toMatchObject({ time: "t3", startTime: "t0", data: { text: "hello" } });
  });

  it("inserts a batch by canonical id without mutating the published input", () => {
    const current: AgentEvent[] = [{ id: 2, type: "message.input" }, { id: 5, type: "message.input", data: { text: "old" } }];
    const merged = mergeCanonicalEventBatch(current, [
      { id: 4, type: "message.input" },
      { id: 5, type: "message.input", data: { text: "new" } },
      { id: 3, type: "message.input", data: { text: "delta", append: true } },
      { id: 0, type: "ignored" },
    ]);

    expect(merged.map((event) => event.id)).toEqual([2, 3, 4, 5]);
    expect(merged[1].data).toMatchObject({ text: "delta", append: false });
    expect(merged[3].data?.text).toBe("new");
    expect(current.map((event) => event.id)).toEqual([2, 5]);
  });

  it("returns the existing reference for an empty batch", () => {
    const events: AgentEvent[] = [{ id: 1, type: "message.input" }];
    expect(mergeCanonicalEventBatch(events, [])).toBe(events);
  });

  it("compacts cumulative ACP updates per call without crossing event boundaries", () => {
    const compacted = compactTimelineEvents([
      toolUpdate(1, "call-a", "a1"),
      toolUpdate(2, "call-b", "b1"),
      toolUpdate(3, "call-a", "a2"),
      { id: 4, type: "message.assistant.delta", data: { text: "boundary" } },
      toolUpdate(5, "call-a", "a3"),
      toolUpdate(6, "call-a", "a4"),
    ]);

    expect(compacted.map((event) => event.id)).toEqual([2, 3, 4, 6]);
    expect(compacted[1].data?.raw).toMatchObject({ update: { toolCallId: "call-a", content: [{ text: "a2" }] } });
    expect(compacted[3].data?.raw).toMatchObject({ update: { toolCallId: "call-a", content: [{ text: "a4" }] } });
  });
});
