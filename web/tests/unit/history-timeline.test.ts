import { mount, tick, unmount } from "svelte";
import { afterEach, describe, expect, it, vi } from "vitest";

import HistoryTimeline from "../../src/components/HistoryTimeline.svelte";

const cleanups: Array<() => Promise<void>> = [];
afterEach(async () => {
  while (cleanups.length) await cleanups.pop()?.();
  document.body.replaceChildren();
  vi.unstubAllGlobals();
});

describe("HistoryTimeline", () => {
  it("labels a cancelled Turn without a final reply instead of showing the trigger as its reply", async () => {
    const generation = {
      generation: 1, generationId: "gen-cancelled", title: "Cancelled", status: "idle",
      createdAt: "2026-08-15T01:00:00Z", updatedAt: "2026-08-15T01:00:03Z", agentName: "fake-agent",
      provider: "Fake", model: "fake-model",
    };
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({
      resourceId: "project-cancelled",
      segments: [{ generation, turns: [{
        reference: "turn-cancelled", turnId: "turn-cancelled", status: "cancelled", closed: true,
        startedAt: "2026-08-15T01:00:00Z", durationMs: 3000, triggerPreview: "sleep 20",
        finalReplyPreview: "", eventCount: 4, toolEventCount: 1, startEventId: 1, lastEventId: 4,
        generation,
      }] }],
      page: { limit: 20, hasMore: false },
    }), { headers: { "content-type": "application/json" } })));

    const target = document.body.appendChild(document.createElement("div"));
    const component = mount(HistoryTimeline, { target, props: {
      workspaceId: "workspace-cancelled", resourceId: "project-cancelled", artifacts: [],
      resolveResourceTitle: () => null, onNavigate: () => undefined,
      onOpenLegacy: () => undefined, onIconsChanged: () => undefined,
    } });
    cleanups.push(() => unmount(component));
    await tick();

    await vi.waitFor(() => expect(target.querySelectorAll(".history-turn")).toHaveLength(1));
    expect(target.querySelector(".history-turn-title")?.textContent).toContain("cancelled · no final reply");
    expect(target.querySelector(".history-turn-preview")?.textContent).toBe("No final reply");
  });
});
