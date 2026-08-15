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
    expect(target.querySelector(".history-turn-meta .history-status-pill")?.textContent).toContain("cancelled · no final reply");
    expect(target.querySelector(".history-turn-preview")?.textContent).toBe("No final reply");
  });

  it("shows the Trigger preview alongside the final reply", async () => {
    const generation = {
      generation: 1, generationId: "gen-trigger", title: "Trigger", status: "completed",
      createdAt: "2026-08-15T01:00:00Z", updatedAt: "2026-08-15T01:00:03Z", agentName: "fake-agent",
      provider: "Fake", model: "fake-model",
    };
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({
      resourceId: "project-trigger",
      segments: [{ generation, turns: [{
        reference: "turn-trigger", turnId: "turn-trigger", status: "completed", closed: true,
        startedAt: "2026-08-15T01:00:00Z", durationMs: 3000, triggerPreview: "please fix the build",
        finalReplyPreview: "build fixed", eventCount: 3, toolEventCount: 1, startEventId: 1, lastEventId: 3,
        generation,
      }] }],
      page: { limit: 20, hasMore: false },
    }), { headers: { "content-type": "application/json" } })));

    const target = document.body.appendChild(document.createElement("div"));
    const component = mount(HistoryTimeline, { target, props: {
      workspaceId: "workspace-trigger", resourceId: "project-trigger", artifacts: [],
      resolveResourceTitle: () => null, onNavigate: () => undefined,
      onOpenLegacy: () => undefined, onIconsChanged: () => undefined,
    } });
    cleanups.push(() => unmount(component));
    await tick();

    await vi.waitFor(() => expect(target.querySelectorAll(".history-turn")).toHaveLength(1));
    expect(target.querySelector(".history-turn-trigger-label")?.textContent).toBe("Trigger");
    expect(target.querySelector(".history-turn-trigger-text")?.textContent).toBe("please fix the build");
    expect(target.querySelector(".history-turn-preview")?.textContent).toBe("build fixed");
  });

  it("collapses an expanded Turn on a second click and reopens it on a third", async () => {
    const generation = {
      generation: 1, generationId: "gen-toggle", title: "Toggle", status: "completed",
      createdAt: "2026-08-15T01:00:00Z", updatedAt: "2026-08-15T01:00:03Z", agentName: "fake-agent",
      provider: "Fake", model: "fake-model",
    };
    const turn = {
      reference: "turn-toggle", turnId: "turn-toggle", status: "completed", closed: true,
      startedAt: "2026-08-15T01:00:00Z", durationMs: 2000, triggerPreview: "hello",
      finalReplyPreview: "done", eventCount: 2, toolEventCount: 0, startEventId: 1, lastEventId: 2,
      generation,
    };
    const historyPage = {
      resourceId: "project-toggle",
      segments: [{ generation, turns: [turn] }],
      page: { limit: 20, hasMore: false },
    };
    const detail = {
      turn,
      items: [{ type: "message", role: "assistant", text: "done", startEventId: 2, endEventId: 2, startedAt: "2026-08-15T01:00:02Z", endedAt: "2026-08-15T01:00:02Z", durationMs: 0, count: 1 }],
      deliveries: [],
      latestEventId: 2,
    };
    vi.stubGlobal("fetch", vi.fn(async (url: unknown) => {
      const path = String(url);
      const body = path.includes("/history/turns/turn-toggle") ? detail : historyPage;
      return new Response(JSON.stringify(body), { headers: { "content-type": "application/json" } });
    }));

    const target = document.body.appendChild(document.createElement("div"));
    const component = mount(HistoryTimeline, { target, props: {
      workspaceId: "workspace-toggle", resourceId: "project-toggle", artifacts: [],
      resolveResourceTitle: () => null, onNavigate: () => undefined,
      onOpenLegacy: () => undefined, onIconsChanged: () => undefined,
    } });
    cleanups.push(() => unmount(component));
    await tick();

    await vi.waitFor(() => expect(target.querySelectorAll(".history-turn")).toHaveLength(1));
    const header = target.querySelector(".history-turn-header") as HTMLElement;
    const chevron = () => target.querySelector(".history-turn-chevron");
    expect(target.querySelector(".history-items")).toBeNull();
    expect(chevron()?.classList.contains("expanded")).toBe(false);

    header.click();
    await vi.waitFor(() => expect(target.querySelector(".history-items")).toBeTruthy());
    expect(chevron()?.classList.contains("expanded")).toBe(true);

    header.click();
    await tick();
    expect(target.querySelector(".history-items")).toBeNull();
    expect(chevron()?.classList.contains("expanded")).toBe(false);

    header.click();
    await vi.waitFor(() => expect(target.querySelector(".history-items")).toBeTruthy());
    expect(chevron()?.classList.contains("expanded")).toBe(true);
  });
});
