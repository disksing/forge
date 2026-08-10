import { mount, tick, unmount } from "svelte";
import { afterEach, describe, expect, it, vi } from "vitest";

import EventTimeline from "../../src/components/EventTimeline.svelte";
import { createModelChannel } from "../../src/components/model-channel";
import type { AgentEvent, EventTimelineModel, TimelineItem } from "../../src/components/models";

const cleanups: Array<() => Promise<void>> = [];
afterEach(async () => {
  while (cleanups.length) await cleanups.pop()?.();
  document.body.replaceChildren();
  vi.unstubAllGlobals();
});

class FakeEventSource {
  static instances: FakeEventSource[] = [];
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  closed = false;
  private listeners = new Map<string, (event: MessageEvent) => void>();

  constructor(readonly url: string) {
    FakeEventSource.instances.push(this);
  }

  addEventListener(type: string, listener: EventListenerOrEventListenerObject): void {
    this.listeners.set(type, listener as (event: MessageEvent) => void);
  }

  close(): void { this.closed = true; }
  emit(event: AgentEvent): void { this.onmessage?.(new MessageEvent("message", { data: JSON.stringify(event) })); }
}

function project(events: AgentEvent[]): TimelineItem[] {
  return events.map((event) => event.type === "tool"
    ? { kind: "tools", key: event.id, calls: [{ key: event.id, callId: `call-${event.id}`, name: "Read", summary: "fixture", status: String(event.data?.status || "running") }] }
    : { kind: "message", key: event.id, role: "user", text: String(event.data?.text || ""), time: event.time });
}

function model(runId: string): EventTimelineModel {
  return {
    identity: `workspace-a:${runId}`, workspaceId: "workspace-a", activeRunId: runId,
    activeRun: { id: runId, agentHubSessionId: `session-${runId}`, status: "idle" }, runCount: 2, agentName: "Test Agent",
    project, onEvent: vi.fn(), onNotice: vi.fn(), onApproval: vi.fn(async () => undefined), onToast: vi.fn(), onIconsChanged: vi.fn(),
  };
}

describe("EventTimeline", () => {
  it("does not reproject unchanged events when only model metadata is republished", async () => {
    FakeEventSource.instances = [];
    vi.stubGlobal("EventSource", FakeEventSource);
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({
      events: [{ id: 1, type: "message", sessionId: "session-run-a", data: { text: "message A" } }],
      page: { hasMoreBefore: false },
    }), { status: 200, headers: { "content-type": "application/json" } })));
    const projector = vi.fn(project);
    const initial = { ...model("run-a"), project: projector };
    const channel = createModelChannel(initial);
    const target = document.body.appendChild(document.createElement("div"));
    target.className = "tty-log";
    const component = mount(EventTimeline, { target, props: { channel } });
    cleanups.push(() => unmount(component));

    await vi.waitFor(() => expect(target.textContent).toContain("message A"));
    const projections = projector.mock.calls.length;
    channel.publish({ ...initial, agentName: "Renamed Agent", runCount: 3 });
    await tick();
    expect(projector).toHaveBeenCalledTimes(projections);
  });

  it("keeps keyed nodes and expansion stable, while a session switch invalidates the old view immediately", async () => {
    FakeEventSource.instances = [];
    vi.stubGlobal("EventSource", FakeEventSource);
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      const path = String(input);
      const runId = path.includes("run-b") ? "run-b" : "run-a";
      return new Response(JSON.stringify({
        events: runId === "run-a"
          ? [{ id: 1, type: "message", sessionId: "session-run-a", data: { text: "message A" } }, { id: 2, type: "tool", sessionId: "session-run-a", data: { status: "running" } }]
          : [{ id: 10, type: "message", sessionId: "session-run-b", data: { text: "message B" } }],
        page: { hasMoreBefore: false },
      }), { status: 200, headers: { "content-type": "application/json" } });
    }));

    const channel = createModelChannel(model("run-a"));
    const target = document.body.appendChild(document.createElement("div"));
    target.className = "tty-log";
    const component = mount(EventTimeline, { target, props: { channel } });
    cleanups.push(() => unmount(component));

    await vi.waitFor(() => expect(target.textContent).toContain("message A"));
    const message = target.querySelector<HTMLElement>('[data-timeline-key="message:1"]')!;
    message.dataset.identityProbe = "stable";
    const tools = target.querySelector<HTMLDetailsElement>('[data-timeline-key="tools:2"] .agent-tool-group')!;
    tools.open = true;
    tools.dispatchEvent(new Event("toggle"));
    await tick();

    const oldStream = FakeEventSource.instances[0];
    oldStream.emit({ id: 3, type: "message", sessionId: "session-run-a", data: { text: "live A" } });
    await vi.waitFor(() => expect(target.textContent).toContain("live A"));
    expect(target.querySelector('[data-timeline-key="message:1"]')).toBe(message);
    expect(message.dataset.identityProbe).toBe("stable");
    expect(tools.open).toBe(true);

    channel.publish(model("run-b"));
    await tick();
    expect(target.querySelector('[data-chat-context="workspace-a:run-b"]')).not.toBeNull();
    expect(target.textContent).not.toContain("message A");
    await vi.waitFor(() => expect(target.textContent).toContain("message B"));
    expect(oldStream.closed).toBe(true);
    oldStream.emit({ id: 4, type: "message", sessionId: "session-run-a", data: { text: "late A" } });
    await tick();
    expect(target.textContent).not.toContain("late A");

    channel.publish(model("run-a"));
    await vi.waitFor(() => expect(target.textContent).toContain("message A"));
    expect(target.querySelector<HTMLDetailsElement>('[data-timeline-key="tools:2"] .agent-tool-group')?.open).toBe(true);
  });
});
