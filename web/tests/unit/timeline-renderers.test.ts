import { mount, tick, unmount } from "svelte";
import type { Component } from "svelte";
import { afterEach, describe, expect, it, vi } from "vitest";

import ActivityGroup from "../../src/components/ActivityGroup.svelte";
import ApprovalCard from "../../src/components/ApprovalCard.svelte";
import LifecycleNotice from "../../src/components/LifecycleNotice.svelte";
import ThinkingBlock from "../../src/components/ThinkingBlock.svelte";
import TimelineMessage from "../../src/components/TimelineMessage.svelte";
import TimelineNotice from "../../src/components/TimelineNotice.svelte";
import ToolGroup from "../../src/components/ToolGroup.svelte";
import ToolItem from "../../src/components/ToolItem.svelte";
import ActivityGroupHarness from "../fixtures/ActivityGroupHarness.svelte";
import ThinkingBlockHarness from "../fixtures/ThinkingBlockHarness.svelte";
import UnknownEvent from "../../src/components/UnknownEvent.svelte";
import { formatClock } from "../../src/components/timeline-events";

const cleanups: Array<() => Promise<void>> = [];
afterEach(async () => {
  while (cleanups.length) await cleanups.pop()?.();
  document.body.replaceChildren();
});

function target(): HTMLElement {
  const value = document.body.appendChild(document.createElement("div"));
  value.dataset.componentOwner = "event-timeline";
  return value;
}

function mounted<Props extends Record<string, unknown>>(component: Component<Props>, props: Props): HTMLElement {
  const container = target();
  const instance = mount(component, { target: container, props });
  cleanups.push(() => unmount(instance));
  return container;
}

describe("timeline rendering components", () => {
  it("renders typed messages with sender metadata and escaped assistant fallback markup", () => {
    const assistant = mounted(TimelineMessage, { item: { kind: "message", role: "assistant", text: "<script>unsafe</script>" }, agentName: "Codex" });
    expect(assistant.querySelector("strong")?.textContent).toBe("Codex");
    expect(assistant.querySelector(".markdown-rendered")?.innerHTML).toContain("&lt;script&gt;unsafe&lt;/script&gt;");

    const agent = mounted(TimelineMessage, { item: { kind: "message", role: "agent", text: "delegated `code`", sender: { name: "Builder", sessionId: "session-2" }, steer: true }, agentName: "Codex" });
    expect(agent.textContent).toMatch(/Builder\s+agent\s+steer\s+from session session-2/);
    expect(agent.querySelector(".markdown-rendered")?.innerHTML).toContain("delegated `code`");

    const user = mounted(TimelineMessage, { item: { kind: "message", role: "user", text: "plain `code`", sender: { name: "disksing" } }, agentName: "Codex" });
    expect(user.querySelector(".markdown-rendered")).toBeNull();
    expect(user.querySelector(".agent-message-bubble p")?.textContent).toBe("plain `code`");
  });

  it("scopes the ink rail to the turn's final assistant message", () => {
    const progress = mounted(TimelineMessage, { item: { kind: "message", role: "assistant", text: "working on it", turnFinal: false }, agentName: "Codex" });
    expect(progress.querySelector(".agent-message-row")?.classList.contains("final")).toBe(false);

    const finalReply = mounted(TimelineMessage, { item: { kind: "message", role: "assistant", text: "done", turnFinal: true }, agentName: "Codex" });
    expect(finalReply.querySelector(".agent-message-row")?.classList.contains("final")).toBe(true);

    // Unannotated items keep the previous final styling.
    const plain = mounted(TimelineMessage, { item: { kind: "message", role: "assistant", text: "done" }, agentName: "Codex" });
    expect(plain.querySelector(".agent-message-row")?.classList.contains("final")).toBe(true);

    // Other roles never carry the final class.
    const agent = mounted(TimelineMessage, { item: { kind: "message", role: "agent", text: "note", sender: { name: "Builder" } }, agentName: "Codex" });
    expect(agent.querySelector(".agent-message-row")?.classList.contains("final")).toBe(false);
  });

  it("renders the agent name and time on every assistant message of a run", () => {
    const head = mounted(TimelineMessage, { item: { kind: "message", role: "assistant", text: "first", time: "2026-08-12T00:00:00Z" }, agentName: "Codex" });
    expect(head.querySelector(".agent-message-meta strong")?.textContent).toBe("Codex");
    expect(head.querySelector(".agent-message-meta span")?.textContent).toBe(formatClock("2026-08-12T00:00:00Z"));

    // Progress updates mid-run keep their own meta row: the name and each
    // message's own timestamp repeat on every assistant message.
    const continuation = mounted(TimelineMessage, { item: { kind: "message", role: "assistant", text: "next", time: "2026-08-12T00:00:05Z", agentStart: false }, agentName: "Codex" });
    expect(continuation.querySelector(".agent-message-meta strong")?.textContent).toBe("Codex");
    expect(continuation.textContent).toContain(formatClock("2026-08-12T00:00:05Z"));
    expect(continuation.textContent).toContain("next");

    // Other agents always keep their sender name.
    const delegated = mounted(TimelineMessage, { item: { kind: "message", role: "agent", text: "note", sender: { name: "Builder" } }, agentName: "Codex" });
    expect(delegated.querySelector(".agent-message-meta strong")?.textContent).toBe("Builder");
  });

  it("renders active and completed thinking duration states", () => {
    const active = mounted(ThinkingBlock, { item: { kind: "thinking", active: true, text: "working" } });
    expect(active.querySelector("details")?.open).toBe(true);
    expect(active.textContent).toContain("Thinking…");
    expect(active.querySelector('[data-lucide="brain"]')).not.toBeNull();

    const completed = mounted(ThinkingBlock, { item: { kind: "thinking", startTime: "2026-01-01T00:00:00Z", time: "2026-01-01T00:01:05Z" } });
    expect(completed.textContent).toContain("Thought for 1m5s");
  });

  it("keeps a user-toggled thinking block open when timeline items rebuild", async () => {
    const onExpand = vi.fn();
    const container = target();
    const harness = mount(ThinkingBlockHarness, { target: container, props: { item: { kind: "thinking", text: "draft" }, onExpand } });
    cleanups.push(() => unmount(harness));
    const details = container.querySelector<HTMLDetailsElement>("details");
    expect(details?.open).toBe(false);

    // The user expands the completed block manually.
    details!.open = true;
    details!.dispatchEvent(new Event("toggle"));
    await tick();
    expect(onExpand).toHaveBeenCalledTimes(1);

    // A new event rebuilds the timeline item with a fresh object identity;
    // the manually opened block must stay open.
    harness.replaceItem({ kind: "thinking", text: "draft" });
    await tick();
    expect(details?.open).toBe(true);

    // Active-state transitions still drive the open state.
    harness.replaceItem({ kind: "thinking", text: "draft", active: true });
    await tick();
    expect(details?.open).toBe(true);
    harness.replaceItem({ kind: "thinking", text: "draft", active: false });
    await tick();
    expect(details?.open).toBe(false);
  });

  it("renders a settled activity disclosure and flattens live children until work ends", async () => {
    const onExpand = vi.fn();
    const item = {
      kind: "activity", key: 2, thinkingCount: 2, reasoningUpdateCount: 3, toolCallCount: 1,
      items: [
        { kind: "thinking", key: 2, text: "inspect", startTime: "2026-01-01T00:00:00Z", time: "2026-01-01T00:00:02Z" },
        { kind: "tools", key: 3, calls: [{ callId: "call-a", name: "Read", summary: "task.md", status: "completed", output: "ok" }] },
        { kind: "thinking", key: 4, text: "verify" },
      ],
    };
    const completed = mounted(ActivityGroup, { item, onExpand });
    const details = completed.querySelector<HTMLDetailsElement>(".agent-activity-group")!;
    expect(details.open).toBe(false);
    expect(completed.querySelector(".agent-activity-title")?.textContent).toBe("2 thoughts · 1 tool call");
    expect(completed.querySelectorAll(".agent-activity-group")).toHaveLength(1);

    details.open = true;
    details.dispatchEvent(new Event("toggle"));
    await tick();
    expect(onExpand).toHaveBeenCalledTimes(1);
    expect(completed.querySelectorAll(".agent-activity-thought")).toHaveLength(2);
    const completedTool = completed.querySelector<HTMLDetailsElement>(".agent-tool-item")!;
    expect(completedTool.open).toBe(false);
    expect(completed.textContent).toContain("ok");

    completedTool.open = true;
    completedTool.dispatchEvent(new Event("toggle"));
    await tick();
    expect(completedTool.open).toBe(true);

    const activeTarget = target();
    const activeItem = { ...item, active: true, items: [item.items[0], item.items[1], { ...item.items[2], active: true }] };
    const active = mount(ActivityGroupHarness, { target: activeTarget, props: { item: activeItem, onExpand: vi.fn() } });
    cleanups.push(() => unmount(active));
    expect(activeTarget.querySelector(".agent-activity-group")?.tagName).toBe("DIV");
    expect(activeTarget.querySelector(".agent-activity-title")).toBeNull();
    expect(activeTarget.querySelector(".agent-activity-tools")).toBeNull();
    const completedThought = activeTarget.querySelector<HTMLDetailsElement>("details.agent-activity-thought")!;
    expect(completedThought.open).toBe(false);
    expect(completedThought.querySelector("summary")?.textContent).toContain("Thought for 2 seconds");
    expect(completedThought.querySelector('[data-lucide="brain"]')).not.toBeNull();
    completedThought.open = true;
    completedThought.dispatchEvent(new Event("toggle"));
    await tick();
    expect(completedThought.open).toBe(true);
    expect(activeTarget.querySelectorAll("section.agent-activity-thought")).toHaveLength(1);
    expect(activeTarget.querySelector("section.agent-activity-thought")?.textContent).toContain("Thinking…");
    expect(activeTarget.querySelector<HTMLDetailsElement>(".agent-tool-item")?.open).toBe(false);
    active.replaceItem({ ...item, active: false });
    await tick();
    const settled = activeTarget.querySelector<HTMLDetailsElement>(".agent-activity-group")!;
    expect(settled.tagName).toBe("DETAILS");
    expect(settled.open).toBe(false);
    expect(activeTarget.querySelector(".agent-activity-title")?.textContent).toBe("2 thoughts · 1 tool call");
  });

  it("renders tool groups and tool items with stable summaries, statuses, details, and toggle callbacks", async () => {
    const onToggle = vi.fn();
    const group = mounted(ToolGroup, { item: { kind: "tools", key: "group-a", calls: [
      { callId: "call-a", name: "Read", summary: "task.md", status: "running", method: "fs/read", output: "partial" },
      { callId: "call-b", name: "Build", status: "failed", error: "boom" },
    ] }, generationId: "gen-a", open: true, onToggle });
    expect(group.querySelector(".agent-tool-group")?.getAttribute("data-tool-group-key")).toBe("gen-a:group-a");
    expect(group.textContent).toContain("2 tool calls");
    expect(group.querySelectorAll(".agent-tool-item")).toHaveLength(2);
    group.querySelector<HTMLDetailsElement>(".agent-tool-group")?.dispatchEvent(new Event("toggle"));
    await tick();
    expect(onToggle).toHaveBeenCalledWith(true);

    const item = mounted(ToolItem, { call: { callId: "call-c", name: "Test", status: "completed", method: "shell", output: "ok", rawPreview: "raw" } });
    expect(item.querySelector("summary > span:last-of-type")?.textContent).toBe("Test");
    expect(item.querySelector("small")?.textContent).toBe("shell");
    expect(item.querySelector("pre")?.textContent).toBe("ok\n\nraw");
    // Status icons are all rendered statically; the tool status class picks which one is visible.
    expect(item.querySelector('.tool-status-icon-completed [data-lucide="check-circle"]')).not.toBeNull();
    expect(item.querySelector('.tool-status-icon-running [data-lucide="loader-circle"]')).not.toBeNull();
    expect(item.querySelector('.tool-status-icon-failed [data-lucide="x-circle"]')).not.toBeNull();
  });

  it("uses the compact tool count for single and multiple calls and keeps expansion state", async () => {
    const single = mounted(ToolGroup, { item: {
      kind: "tools", key: "compact-single", compact: true, toolCallCount: 1,
      rangeStartEventId: 4, calls: [{ callId: "compact-single", name: "Tool activity", summary: "1 tool call · details omitted", status: "completed" }],
    }, generationId: "gen-a", open: false, onToggle: vi.fn() });
    expect(single.querySelector(".agent-tool-group-title")?.textContent).toBe("1 tool call");
    expect(single.querySelector(".agent-tool-group-preview")?.textContent).toContain("1 tool call");

    const onToggle = vi.fn();
    const multiple = mounted(ToolGroup, { item: {
      kind: "tools", key: "compact-multiple", compact: true, toolCallCount: 2,
      rangeStartEventId: 8, calls: [{ callId: "compact-multiple", name: "Tool activity", summary: "2 tool calls · details omitted", status: "completed" }],
    }, generationId: "gen-a", open: false, onToggle });
    const details = multiple.querySelector<HTMLDetailsElement>(".agent-tool-group");
    expect(details?.open).toBe(false);
    expect(multiple.querySelector(".agent-tool-group-title")?.textContent).toBe("2 tool calls");
    expect(multiple.querySelector(".agent-tool-group-preview")?.textContent).toContain("2 tool calls");
    expect(multiple.querySelectorAll(".agent-tool-item")).toHaveLength(1);

    details!.open = true;
    details!.dispatchEvent(new Event("toggle"));
    await tick();
    expect(onToggle).toHaveBeenCalledWith(true);
  });

  it("keeps approval drafts local, gates duplicate actions, and reports callback failures", async () => {
    let resolve!: () => void;
    const pending = new Promise<void>((done) => { resolve = done; });
    const onApproval = vi.fn(() => pending);
    const onToast = vi.fn();
    const card = mounted(ApprovalCard, { item: {
      kind: "approval", approvalId: "approval-a", title: "Permission", question: "Continue?", status: "pending",
      options: [{ optionId: "allow", name: "Allow" }, { optionId: "reject", kind: "reject_once" }],
    }, generationId: "gen-a", contextIdentity: "workspace:gen-a", onApproval, onToast });
    const buttons = card.querySelectorAll<HTMLButtonElement>(".approval-options button");
    buttons[0].click();
    await tick();
    expect(onApproval).toHaveBeenCalledWith("gen-a", "approval-a", { optionId: "allow" });
    expect([...buttons].every((button) => button.disabled)).toBe(true);
    buttons[1].click();
    expect(onApproval).toHaveBeenCalledTimes(1);
    resolve();
    await pending;
    await tick();
    expect([...buttons].every((button) => !button.disabled)).toBe(true);

    const failing = mounted(ApprovalCard, { item: { kind: "approval", approvalId: "approval-b", status: "pending" }, generationId: "gen-a", contextIdentity: "workspace:gen-a", onApproval: vi.fn(async () => { throw new Error("denied"); }), onToast });
    failing.querySelector<HTMLButtonElement>(".approval-actions button")?.click();
    await vi.waitFor(() => expect(onToast).toHaveBeenCalledWith("denied"));
  });

  it("renders lifecycle, provider error, PUA notice, and unknown-event fallbacks directly", () => {
    expect(mounted(LifecycleNotice, { item: { kind: "lifecycle", tone: "ok", text: "Completed" } }).querySelector(".agent-lifecycle-ok")?.textContent).toContain("Completed");
    expect(mounted(TimelineNotice, { title: "Provider error", text: "failed", error: true, alert: true }).querySelector('[role="alert"]')?.textContent).toContain("Provider error failed");
    expect(mounted(TimelineNotice, { title: "PUA", text: "Coordinator failed", error: true }).querySelector(".timeline-notice-error")?.textContent).toContain("PUA Coordinator failed");
    expect(mounted(UnknownEvent, { item: { kind: "mystery", type: "provider.mystery", preview: "raw payload" } }).textContent).toContain("Unhandled event: provider.mysteryraw payload");
  });
});
