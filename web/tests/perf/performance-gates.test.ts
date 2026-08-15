import { mount, tick, unmount } from "svelte";
import { afterEach, describe, expect, it, vi } from "vitest";

import AppShell from "../../src/components/AppShell.svelte";
import MarkdownDocument from "../../src/components/MarkdownDocument.svelte";
import { createModelChannel } from "../../src/components/model-channel";
import type { AgentEvent } from "../../src/components/models";
import { compactTimelineEvents, mergeCanonicalEvent, mergeCanonicalEvents } from "../../src/components/timeline-events";
import { continuousEvents, largeMarkdown, largeTreeModel, performanceBudgets } from "../fixtures/performance";

const cleanups: Array<() => Promise<void>> = [];
afterEach(async () => {
  while (cleanups.length) await cleanups.pop()?.();
  document.body.replaceChildren();
  document.body.className = "";
});

describe("performance and bounded-DOM gates", () => {
  it("renders a 720-row project/task tree within the budget and a bounded DOM", async () => {
    const target = document.body.appendChild(document.createElement("div"));
    const started = performance.now();
    const component = mount(AppShell, { target, props: { channel: createModelChannel(largeTreeModel()) } });
    cleanups.push(() => unmount(component));
    await tick();
    const elapsed = performance.now() - started;

    expect(target.querySelectorAll(".tree-item")).toHaveLength(720);
    expect(target.querySelectorAll("*").length).toBeLessThan(performanceBudgets.maximumTreeElements);
    expect(elapsed).toBeLessThan(performanceBudgets.treeRenderMs);
  });

  it("renders a multi-thousand-section Markdown document within the budget", async () => {
    const target = document.body.appendChild(document.createElement("div"));
    const content = largeMarkdown();
    const started = performance.now();
    const component = mount(MarkdownDocument, { target, props: {
      workspaceId: "performance-workspace",
      resolveResourceTitle: () => null, onNavigate: () => undefined,
      file: { name: "large.md", path: "large.md", content, contentHash: "fixture" },
    } });
    cleanups.push(() => unmount(component));
    await tick();
    const elapsed = performance.now() - started;

    expect(target.textContent).toContain("Section 2999");
    expect(elapsed).toBeLessThan(performanceBudgets.markdownRenderMs);
  });

  it("canonicalizes 10,000 streamed events without quadratic bulk work", () => {
    const events = continuousEvents();
    events.push({ ...events[4999], data: { text: " replacement" } });
    const started = performance.now();
    const merged = mergeCanonicalEvents(events);
    const elapsed = performance.now() - started;

    expect(merged).toHaveLength(10_000);
    expect(merged[4_999].data?.text).toBe(" replacement");
    expect(elapsed).toBeLessThan(performanceBudgets.eventMergeMs);
  });

  it("applies 1,000 continuous deltas to a large Session within the update budget", () => {
    let merged = mergeCanonicalEvents(continuousEvents());
    const started = performance.now();
    for (let index = 0; index < 1_000; index++) {
      merged = mergeCanonicalEvent(merged, {
        id: 10_001 + index, type: "message", sessionId: "performance-session", data: { text: `live ${index}` },
      });
    }
    const elapsed = performance.now() - started;

    expect(merged).toHaveLength(11_000);
    expect(elapsed).toBeLessThan(performanceBudgets.continuousDeltaMs);
  });

  it("bounds a sustained stream of cumulative ACP tool updates", () => {
    const events: AgentEvent[] = [{
      id: 1, type: "tool.event", data: {
        method: "session/update",
        raw: { update: { sessionUpdate: "tool_call", toolCallId: "call-a", status: "in_progress" } },
      },
    }];
    for (let index = 0; index < 30_000; index++) {
      events.push({
        id: index + 2, type: "tool.event", data: {
          method: "session/update",
          raw: { update: {
            sessionUpdate: "tool_call_update", toolCallId: "call-a", status: "in_progress",
            content: [{ type: "text", text: `cumulative output ${index}` }],
          } },
        },
      });
    }
    const started = performance.now();
    const compacted = compactTimelineEvents(events);
    const elapsed = performance.now() - started;

    expect(compacted).toHaveLength(2);
    expect(compacted[1].id).toBe(30_001);
    expect(elapsed).toBeLessThan(performanceBudgets.eventMergeMs);
  });
});
