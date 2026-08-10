import { mount, tick, unmount } from "svelte";
import { afterEach, describe, expect, it } from "vitest";

import AppShell from "../../src/components/AppShell.svelte";
import LogTimeline from "../../src/components/LogTimeline.svelte";
import MarkdownDocument from "../../src/components/MarkdownDocument.svelte";
import { mergeCanonicalEvent, mergeCanonicalEvents } from "../../src/components/chat-state";
import { createModelChannel } from "../../src/components/model-channel";
import { continuousEvents, largeMarkdown, largeTreeModel, longLogs, performanceBudgets } from "../fixtures/performance";

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

  it("renders 750 log records within the budget and a bounded DOM", async () => {
    const target = document.body.appendChild(document.createElement("div"));
    const started = performance.now();
    const component = mount(LogTimeline, { target, props: {
      resourceId: "project-performance", logs: longLogs(), hasMore: false, loading: false, error: "",
      onLoadMore: async () => undefined, onIconsChanged: () => undefined,
    } });
    cleanups.push(() => unmount(component));
    await tick();
    const elapsed = performance.now() - started;

    expect(target.querySelectorAll(".log-entry")).toHaveLength(750);
    expect(target.querySelectorAll("*").length).toBeLessThan(performanceBudgets.maximumLogElements);
    expect(elapsed).toBeLessThan(performanceBudgets.logRenderMs);
  });

  it("renders a multi-thousand-section Markdown document within the budget", async () => {
    const target = document.body.appendChild(document.createElement("div"));
    const content = largeMarkdown();
    const started = performance.now();
    const component = mount(MarkdownDocument, { target, props: {
      workspaceId: "performance-workspace",
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
});
