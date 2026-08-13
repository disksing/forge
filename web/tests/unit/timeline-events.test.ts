import { describe, expect, it } from "vitest";

import { buildTimeline as buildAgentHubTimeline } from "../../vendor/agenthub-event-timeline";
import type { AgentEvent, TimelineItem } from "../../src/components/models";
import { compactTimelineEvents, mergeCanonicalEventBatch, mergeCanonicalEvents, visibleConversationTimelineItems } from "../../src/components/timeline-events";

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

  it("hides routine session and turn boundaries without breaking terminal tool settlement", () => {
    const events: AgentEvent[] = [
      { id: 1, type: "session.created" },
      { id: 2, type: "session.provider", data: { agentName: "gpt-5.6-sol", provider: "codex" } },
      { id: 3, type: "message.input", turnId: "turn-1", data: { text: "hello" } },
      { id: 4, type: "turn.started", turnId: "turn-1" },
      { id: 5, type: "tool.event", turnId: "turn-1", data: { method: "item/started", raw: { item: { id: "call-1", type: "commandExecution", command: ["make"], status: "inProgress" } } } },
      { id: 6, type: "turn.completed", turnId: "turn-1" },
      { id: 7, type: "session.state", data: { state: "stopped", reason: "completed" } },
    ];

    const items = visibleConversationTimelineItems(events, buildAgentHubTimeline(events) as TimelineItem[]);

    expect(items.map((item) => item.text)).not.toContain("Session created");
    expect(items.map((item) => item.text)).not.toContain("Agent connected · gpt-5.6-sol · via codex");
    expect(items.map((item) => item.text)).not.toContain("Turn started");
    expect(items.map((item) => item.text)).not.toContain("Turn completed");
    expect(items.find((item) => item.kind === "message")?.text).toBe("hello");
    expect(items.find((item) => item.kind === "tools")?.calls?.[0].status).toBe("completed");
    expect(items.find((item) => item.kind === "lifecycle")?.text).toBe("Session stopped · provider completed");
  });
});
