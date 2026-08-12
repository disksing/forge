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
  constructor(readonly url: string) { FakeEventSource.instances.push(this); }
  addEventListener(): void {}
  close(): void { this.closed = true; }
}

function project(events: AgentEvent[]): TimelineItem[] {
  return events.map((event) => ({ kind: "message", key: event.id, role: "assistant", text: String(event.data?.text || "") }));
}

function model(resourceId: string): EventTimelineModel {
  return {
    identity: `workspace-a:${resourceId}`, workspaceId: "workspace-a", resourceId,
    status: { resourceId, state: "idle", acceptsMessages: true, canSteerWaiting: false, waitingMessages: [], generation: { runId: "run", generation: 1, generationId: `gen-${resourceId}`, status: "idle" }, session: { id: `session-${resourceId}`, state: "idle" } },
    agentName: "Test Agent", project, onEvent: vi.fn(), onNotice: vi.fn(), onApproval: vi.fn(async () => undefined), onToast: vi.fn(), onIconsChanged: vi.fn(),
  };
}

function history(resourceId: string) {
  const generation = { generation: 1, generationId: `gen-${resourceId}`, title: resourceId, status: "idle", createdAt: "2026-08-12T00:00:00Z", updatedAt: "2026-08-12T00:00:00Z" };
  const turn = { reference: `ref-${resourceId}`, turnId: "turn-1", status: "completed", closed: true, startedAt: "2026-08-12T00:00:00Z", durationMs: 10, triggerPreview: `summary ${resourceId}`, eventCount: 2, toolEventCount: 0, startEventId: 1, lastEventId: 2, endEventId: 2, generation };
  return { generation, turn, page: { resourceId, segments: [{ generation, turns: [turn] }], page: { limit: 20, hasMore: false } }, detail: { turn, latestEventId: 2, items: [{ type: "message", role: "user", text: `message ${resourceId}`, startEventId: 1, endEventId: 1, startedAt: turn.startedAt, endedAt: turn.startedAt }] } };
}

describe("EventTimeline", () => {
  it("shows working only while a Turn is actively running", async () => {
    FakeEventSource.instances = [];
    vi.stubGlobal("EventSource", FakeEventSource);
    const fixture = history("task-a");
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => new Response(JSON.stringify(String(input).includes("/history/turns/ref-") ? fixture.detail : fixture.page), { status: 200, headers: { "content-type": "application/json" } })));
    const active = model("task-a");
    active.status!.state = "working";
    active.status!.session = { ...active.status!.session, state: "running", currentTurnId: "turn-1" };
    const channel = createModelChannel(active);
    const target = document.body.appendChild(document.createElement("div"));
    target.className = "tty-log";
    const component = mount(EventTimeline, { target, props: { channel } });
    cleanups.push(() => unmount(component));

    await vi.waitFor(() => expect(target.querySelector(".turn-working-indicator")?.textContent).toBe("working..."));
    expect(target.querySelector(".turn-working-indicator")?.getAttribute("role")).toBe("status");
    expect(target.querySelector(".turn-working-indicator [data-lucide='loader-circle']")).not.toBeNull();

    const awaitingApproval = model("task-a");
    awaitingApproval.status!.state = "attention_required";
    awaitingApproval.status!.session = { ...awaitingApproval.status!.session, state: "waiting_approval", currentTurnId: "turn-1" };
    channel.publish(awaitingApproval);
    await tick();
    expect(target.querySelector(".turn-working-indicator")).toBeNull();

    channel.publish(model("task-a"));
    await tick();
    expect(target.querySelector(".turn-working-indicator")).toBeNull();
  });

  it("renders resource history with a generation boundary and visible Turn detail", async () => {
    FakeEventSource.instances = [];
    vi.stubGlobal("EventSource", FakeEventSource);
    const fixture = history("task-a");
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => new Response(JSON.stringify(String(input).includes("/history/turns/ref-") ? fixture.detail : fixture.page), { status: 200, headers: { "content-type": "application/json" } })));
    const channel = createModelChannel(model("task-a"));
    const target = document.body.appendChild(document.createElement("div"));
    target.className = "tty-log";
    const component = mount(EventTimeline, { target, props: { channel } });
    cleanups.push(() => unmount(component));

    await vi.waitFor(() => expect(target.textContent).toContain("message task-a"));
    expect(target.textContent).toContain("Generation 1");
    expect(target.querySelector("[data-generation-id='gen-task-a']")).not.toBeNull();
    expect(FakeEventSource.instances[0].url).toContain("/resources/task-a/stream?");
  });

  it("invalidates the old resource view and stream immediately on resource switch", async () => {
    FakeEventSource.instances = [];
    vi.stubGlobal("EventSource", FakeEventSource);
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      const resource = String(input).includes("task-b") ? "task-b" : "task-a";
      const fixture = history(resource);
      return new Response(JSON.stringify(String(input).includes("/history/turns/ref-") ? fixture.detail : fixture.page), { status: 200, headers: { "content-type": "application/json" } });
    }));
    const channel = createModelChannel(model("task-a"));
    const target = document.body.appendChild(document.createElement("div"));
    target.className = "tty-log";
    const component = mount(EventTimeline, { target, props: { channel } });
    cleanups.push(() => unmount(component));
    await vi.waitFor(() => expect(target.textContent).toContain("message task-a"));
    const oldStream = FakeEventSource.instances[0];

    channel.publish(model("task-b"));
    await tick();
    expect(target.querySelector('[data-chat-context="workspace-a:task-b"]')).not.toBeNull();
    expect(target.textContent).not.toContain("message task-a");
    await vi.waitFor(() => expect(target.textContent).toContain("message task-b"));
    expect(oldStream.closed).toBe(true);
  });
});
