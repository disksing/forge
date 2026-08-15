import { mount, tick, unmount } from "svelte";
import { afterEach, describe, expect, it, vi } from "vitest";

import EventTimeline from "../../src/components/EventTimeline.svelte";
import { createModelChannel } from "../../src/components/model-channel";
import type { AgentEvent, EventTimelineModel, ResourceMessageStatus, TimelineItem } from "../../src/components/models";

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

function status(resourceId: string, generationId = `gen-${resourceId}`, generation = 1, state: ResourceMessageStatus["state"] = "idle", generationStatus = "idle", sessionState = "idle"): ResourceMessageStatus {
  return {
    resourceId, state, acceptsMessages: true, canSteerWaiting: false, waitingMessages: [],
    generation: { generation, generationId, status: generationStatus },
    session: { id: `session-${resourceId}`, state: sessionState, currentTurnId: sessionState === "running" ? "turn-1" : undefined },
  };
}

function model(resourceId: string, nextStatus = status(resourceId)): EventTimelineModel {
  return {
    identity: `workspace-a:${resourceId}`, workspaceId: "workspace-a", resourceId,
    status: nextStatus,
    agentName: "Test Agent", resolveResourceTitle: () => null, onNavigate: vi.fn(), project, onEvent: vi.fn(), onNotice: vi.fn(), onApproval: vi.fn(async () => undefined), onToast: vi.fn(), onIconsChanged: vi.fn(),
  };
}

function history(resourceId: string) {
  const generation = { generation: 1, generationId: `gen-${resourceId}`, title: resourceId, status: "idle", createdAt: "2026-08-12T00:00:00Z", updatedAt: "2026-08-12T00:00:00Z" };
  const turn = { reference: `ref-${resourceId}`, turnId: "turn-1", status: "completed", closed: true, startedAt: "2026-08-12T00:00:00Z", durationMs: 10, triggerPreview: `summary ${resourceId}`, eventCount: 2, toolEventCount: 0, startEventId: 1, lastEventId: 2, endEventId: 2, generation };
  return { generation, turn, page: { resourceId, segments: [{ generation, turns: [turn] }], page: { limit: 20, hasMore: false } }, detail: { turn, latestEventId: 2, items: [{ type: "message", role: "user", text: `message ${resourceId}`, startEventId: 1, endEventId: 1, startedAt: turn.startedAt, endedAt: turn.startedAt }] } };
}

function generationModel(resourceId: string, generation: number, generationId: string, agentName: string): EventTimelineModel {
  const value = model(resourceId);
  value.agentName = agentName;
  value.status = {
    ...value.status!,
    resolvedAgent: agentName,
    generation: { ...value.status!.generation!, generation, generationId },
  };
  return value;
}

function multiGenerationHistory(resourceId: string) {
  const agents = ["deepseek", "codex", "deepseek"];
  const generations = agents.map((agentName, index) => ({
    generation: index + 1,
    generationId: `gen-${index + 1}`,
    title: `${resourceId} generation ${index + 1}`,
    agentName,
    status: "idle",
    createdAt: `2026-08-1${2 + index}T00:00:00Z`,
    updatedAt: `2026-08-1${2 + index}T00:00:00Z`,
  }));
  const turns = generations.map((generation, index) => ({
    reference: `ref-${index + 1}`,
    turnId: `turn-${index + 1}`,
    status: "completed",
    closed: true,
    startedAt: generation.createdAt,
    durationMs: 10,
    triggerPreview: `summary ${index + 1}`,
    eventCount: 2,
    toolEventCount: 0,
    startEventId: index * 2 + 1,
    lastEventId: index * 2 + 2,
    endEventId: index * 2 + 2,
    generation,
  }));
  const details = turns.map((turn, index) => ({
    turn,
    latestEventId: turn.lastEventId,
    items: [{ type: "message", role: "assistant", text: `${agents[index]} reply`, startEventId: turn.startEventId, endEventId: turn.lastEventId, startedAt: turn.startedAt, endedAt: turn.startedAt }],
  }));
  return {
    page: { resourceId, segments: generations.map((generation, index) => ({ generation, turns: [turns[index]] })), page: { limit: 20, hasMore: false } },
    details,
  };
}

function conversationAuthors(target: HTMLElement): string[] {
  return [...target.querySelectorAll<HTMLElement>("section.conversation-turn .agent-message-meta strong")].map((node) => node.textContent || "");
}

function historyGeneration(resourceId: string, generation: number, generationId: string, generationStatus: string) {
  const generationRecord = { generation, generationId, title: resourceId, status: generationStatus, createdAt: "2026-08-12T00:00:00Z", updatedAt: "2026-08-12T00:00:00Z" };
  const turn = { reference: `ref-${resourceId}-${generation}`, turnId: `turn-${generation}`, status: "completed", closed: true, startedAt: "2026-08-12T00:00:00Z", durationMs: 10, triggerPreview: `summary ${resourceId}`, eventCount: 2, toolEventCount: 0, startEventId: 1, lastEventId: 2, endEventId: 2, generation: generationRecord };
  return {
    generation: generationRecord,
    page: { resourceId, segments: [{ generation: generationRecord, turns: [turn] }], page: { limit: 20, hasMore: false } },
    detail: { turn, latestEventId: 2, items: [{ type: "message", role: "user", text: `message ${resourceId}`, startEventId: 1, endEventId: 1, startedAt: turn.startedAt, endedAt: turn.startedAt }] },
  };
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

  it("keeps the generation boundary while hiding routine lifecycle detail", async () => {
    FakeEventSource.instances = [];
    vi.stubGlobal("EventSource", FakeEventSource);
    const fixture = history("task-a");
    fixture.detail.items.push(
      { type: "lifecycle", role: "", text: "session.created", startEventId: 2, endEventId: 2, startedAt: fixture.turn.startedAt, endedAt: fixture.turn.startedAt },
      { type: "lifecycle", role: "", text: "session.provider", startEventId: 3, endEventId: 3, startedAt: fixture.turn.startedAt, endedAt: fixture.turn.startedAt },
      { type: "lifecycle", role: "", text: "turn.started", startEventId: 4, endEventId: 4, startedAt: fixture.turn.startedAt, endedAt: fixture.turn.startedAt },
      { type: "lifecycle", role: "", text: "turn.completed", startEventId: 5, endEventId: 5, startedAt: fixture.turn.startedAt, endedAt: fixture.turn.startedAt },
      { type: "lifecycle", role: "", text: "Session created", startEventId: 6, endEventId: 6, startedAt: fixture.turn.startedAt, endedAt: fixture.turn.startedAt },
      { type: "lifecycle", role: "", text: "Agent connected · gpt-5.6-sol · via codex", startEventId: 7, endEventId: 7, startedAt: fixture.turn.startedAt, endedAt: fixture.turn.startedAt },
      { type: "lifecycle", role: "", text: "Turn started", startEventId: 8, endEventId: 8, startedAt: fixture.turn.startedAt, endedAt: fixture.turn.startedAt },
      { type: "lifecycle", role: "", text: "Turn completed", startEventId: 9, endEventId: 9, startedAt: fixture.turn.startedAt, endedAt: fixture.turn.startedAt },
    );
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => new Response(JSON.stringify(String(input).includes("/history/turns/ref-") ? fixture.detail : fixture.page), { status: 200, headers: { "content-type": "application/json" } })));
    const channel = createModelChannel(model("task-a"));
    const target = document.body.appendChild(document.createElement("div"));
    target.className = "tty-log";
    const component = mount(EventTimeline, { target, props: { channel } });
    cleanups.push(() => unmount(component));

    await vi.waitFor(() => expect(target.textContent).toContain("message task-a"));
    expect(target.textContent).toContain("Generation 1");
    expect(target.textContent).not.toContain("session.created");
    expect(target.textContent).not.toContain("session.provider");
    expect(target.textContent).not.toContain("turn.started");
    expect(target.textContent).not.toContain("turn.completed");
    expect(target.textContent).not.toContain("Session created");
    expect(target.textContent).not.toContain("Agent connected");
    expect(target.textContent).not.toContain("Turn started");
    expect(target.textContent).not.toContain("Turn completed");
    expect(target.querySelector("[data-generation-id='gen-task-a']")).not.toBeNull();
    expect(FakeEventSource.instances[0].url).toContain("/resources/task-a/stream?");
  });

  it("keeps the current Generation badge aligned through lifecycle, refresh, and Generation changes", async () => {
    FakeEventSource.instances = [];
    vi.stubGlobal("EventSource", FakeEventSource);
    let fixture = historyGeneration("task-a", 1, "gen-task-a", "running");
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => new Response(JSON.stringify(String(input).includes("/history/turns/ref-") ? fixture.detail : fixture.page), { status: 200, headers: { "content-type": "application/json" } })));
    const channel = createModelChannel(model("task-a", status("task-a", "gen-task-a", 1, "working", "starting", "starting")));
    const target = document.body.appendChild(document.createElement("div"));
    target.className = "tty-log";
    const component = mount(EventTimeline, { target, props: { channel } });
    cleanups.push(() => unmount(component));

    const badge = () => target.querySelector<HTMLElement>(".conversation-generation small");
    await vi.waitFor(() => expect(badge()?.textContent).toBe("starting"));

    // A stale generation status must not leave the badge idle while the
    // resource is working.
    channel.publish(model("task-a", status("task-a", "gen-task-a", 1, "working", "idle", "running")));
    await tick();
    expect(badge()?.textContent).toBe("running");

    channel.publish(model("task-a", status("task-a", "gen-task-a", 1, "idle", "idle", "idle")));
    await tick();
    expect(badge()?.textContent).toBe("idle");

    channel.publish(model("task-a", status("task-a", "gen-task-a", 1, "idle", "stopped", "stopped")));
    await tick();
    expect(badge()?.textContent).toBe("stopped");

    fixture = historyGeneration("task-a", 2, "gen-task-a-2", "running");
    channel.publish(model("task-a", status("task-a", "gen-task-a-2", 2, "working", "running", "running")));
    await vi.waitFor(() => expect(target.querySelector("[data-generation-id='gen-task-a-2'] small")?.textContent).toBe("running"));

    // The history page can still contain the old running value after a
    // refresh; the live status must win for the current Generation.
    channel.publish(model("task-a", status("task-a", "gen-task-a-2", 2, "idle", "idle", "idle")));
    await tick();
    expect(target.querySelector("[data-generation-id='gen-task-a-2'] small")?.textContent).toBe("idle");
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

  it("keeps historical assistant authors bound to their Generation across switches and reload", async () => {
    FakeEventSource.instances = [];
    vi.stubGlobal("EventSource", FakeEventSource);
    const fixture = multiGenerationHistory("task-a");
    const fetchImpl = vi.fn<typeof fetch>(async (input) => {
      const path = String(input);
      if (path.includes("/history/turns/ref-")) {
        const index = Number(path.match(/ref-(\d+)/)?.[1] || 0) - 1;
        return new Response(JSON.stringify(fixture.details[index]), { status: 200, headers: { "content-type": "application/json" } });
      }
      return new Response(JSON.stringify(fixture.page), { status: 200, headers: { "content-type": "application/json" } });
    });
    vi.stubGlobal("fetch", fetchImpl);
    const channel = createModelChannel(generationModel("task-a", 3, "gen-3", "deepseek"));
    const target = document.body.appendChild(document.createElement("div"));
    target.className = "tty-log";
    const component = mount(EventTimeline, { target, props: { channel } });

    await vi.waitFor(() => expect(conversationAuthors(target)).toEqual(["deepseek", "codex", "deepseek"]));

    channel.publish(generationModel("task-a", 2, "gen-2", "codex"));
    await vi.waitFor(() => expect(conversationAuthors(target)).toEqual(["deepseek", "codex", "deepseek"]));

    channel.publish(generationModel("task-a", 3, "gen-3", "deepseek"));
    await vi.waitFor(() => expect(conversationAuthors(target)).toEqual(["deepseek", "codex", "deepseek"]));

    unmount(component);
    const reloaded = mount(EventTimeline, { target, props: { channel } });
    cleanups.push(() => unmount(reloaded));
    await vi.waitFor(() => expect(conversationAuthors(target)).toEqual(["deepseek", "codex", "deepseek"]));
  });
});
