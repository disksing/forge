import { mount, tick, unmount } from "svelte";
import type { Component } from "svelte";
import { afterEach, describe, expect, it, vi } from "vitest";

import ApprovalCard from "../../src/components/ApprovalCard.svelte";
import LifecycleNotice from "../../src/components/LifecycleNotice.svelte";
import ThinkingBlock from "../../src/components/ThinkingBlock.svelte";
import TimelineMessage from "../../src/components/TimelineMessage.svelte";
import TimelineNotice from "../../src/components/TimelineNotice.svelte";
import ToolGroup from "../../src/components/ToolGroup.svelte";
import ToolItem from "../../src/components/ToolItem.svelte";
import UnknownEvent from "../../src/components/UnknownEvent.svelte";

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

    const agent = mounted(TimelineMessage, { item: { kind: "message", role: "agent", text: "delegated", sender: { name: "Builder", sessionId: "session-2" }, steer: true }, agentName: "Codex" });
    expect(agent.textContent).toMatch(/Builder\s+agent\s+steer\s+from session session-2/);
  });

  it("renders active and completed thinking duration states", () => {
    const active = mounted(ThinkingBlock, { item: { kind: "thinking", active: true, text: "working" } });
    expect(active.querySelector("details")?.open).toBe(true);
    expect(active.textContent).toContain("Thinking…");

    const completed = mounted(ThinkingBlock, { item: { kind: "thinking", startTime: "2026-01-01T00:00:00Z", time: "2026-01-01T00:01:05Z" } });
    expect(completed.textContent).toContain("Thought for 1m5s");
  });

  it("renders tool groups and tool items with stable summaries, statuses, details, and toggle callbacks", async () => {
    const onToggle = vi.fn();
    const group = mounted(ToolGroup, { item: { kind: "tools", key: "group-a", calls: [
      { callId: "call-a", name: "Read", summary: "task.md", status: "running", method: "fs/read", output: "partial" },
      { callId: "call-b", name: "Build", status: "failed", error: "boom" },
    ] }, runId: "run-a", open: true, onToggle });
    expect(group.querySelector(".agent-tool-group")?.getAttribute("data-tool-group-key")).toBe("run-a:group-a");
    expect(group.textContent).toContain("2 tool calls");
    expect(group.querySelectorAll(".agent-tool-item")).toHaveLength(2);
    group.querySelector<HTMLDetailsElement>(".agent-tool-group")?.dispatchEvent(new Event("toggle"));
    await tick();
    expect(onToggle).toHaveBeenCalledWith(true);

    const item = mounted(ToolItem, { call: { callId: "call-c", name: "Test", status: "completed", method: "shell", output: "ok", rawPreview: "raw" } });
    expect(item.querySelector("summary span")?.textContent).toBe("Test");
    expect(item.querySelector("small")?.textContent).toBe("shell");
    expect(item.querySelector("pre")?.textContent).toBe("ok\n\nraw");
  });

  it("keeps approval drafts local, gates duplicate actions, and reports callback failures", async () => {
    let resolve!: () => void;
    const pending = new Promise<void>((done) => { resolve = done; });
    const onApproval = vi.fn(() => pending);
    const onToast = vi.fn();
    const card = mounted(ApprovalCard, { item: {
      kind: "approval", approvalId: "approval-a", title: "Permission", question: "Continue?", status: "pending",
      options: [{ optionId: "allow", name: "Allow" }, { optionId: "reject", kind: "reject_once" }],
    }, runId: "run-a", contextIdentity: "workspace:run-a", onApproval, onToast });
    const buttons = card.querySelectorAll<HTMLButtonElement>(".approval-options button");
    buttons[0].click();
    await tick();
    expect(onApproval).toHaveBeenCalledWith("run-a", "approval-a", { optionId: "allow" });
    expect([...buttons].every((button) => button.disabled)).toBe(true);
    buttons[1].click();
    expect(onApproval).toHaveBeenCalledTimes(1);
    resolve();
    await pending;
    await tick();
    expect([...buttons].every((button) => !button.disabled)).toBe(true);

    const failing = mounted(ApprovalCard, { item: { kind: "approval", approvalId: "approval-b", status: "pending" }, runId: "run-a", contextIdentity: "workspace:run-a", onApproval: vi.fn(async () => { throw new Error("denied"); }), onToast });
    failing.querySelector<HTMLButtonElement>(".approval-actions button")?.click();
    await vi.waitFor(() => expect(onToast).toHaveBeenCalledWith("denied"));
  });

  it("renders lifecycle, provider error, Forge notice, and unknown-event fallbacks directly", () => {
    expect(mounted(LifecycleNotice, { item: { kind: "lifecycle", tone: "ok", text: "Completed" } }).querySelector(".agent-lifecycle-ok")?.textContent).toContain("Completed");
    expect(mounted(TimelineNotice, { title: "Provider error", text: "failed", error: true, alert: true }).querySelector('[role="alert"]')?.textContent).toContain("Provider error failed");
    expect(mounted(TimelineNotice, { title: "Forge", text: "Coordinator failed", error: true }).querySelector(".timeline-notice-error")?.textContent).toContain("Forge Coordinator failed");
    expect(mounted(UnknownEvent, { item: { kind: "mystery", type: "provider.mystery", preview: "raw payload" } }).textContent).toContain("Unhandled event: provider.mysteryraw payload");
  });
});
