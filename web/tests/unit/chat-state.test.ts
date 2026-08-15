import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiClient } from "../../src/api/client";
import { ChatSessionController } from "../../src/components/chat-state";
import type { AgentEvent, ChatContextSnapshot, ResourceHistoryGeneration, ResourceHistoryTurnSummary, ResourceMessageStatus } from "../../src/components/models";

const controllers: ChatSessionController[] = [];
afterEach(() => controllers.splice(0).forEach((controller) => controller.dispose()));

function response(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } });
}

function deferredResponse(): { promise: Promise<Response>; resolve: (value: Response) => void } {
  let resolve!: (value: Response) => void;
  const promise = new Promise<Response>((done) => { resolve = done; });
  return { promise, resolve };
}

function generation(number: number): ResourceHistoryGeneration {
  return { generation: number, generationId: `gen-${number}`, title: `Generation ${number}`, status: number === 3 ? "idle" : "archived", createdAt: "2026-08-12T00:00:00Z", updatedAt: "2026-08-12T00:00:00Z" };
}

function turn(gen: number, id: string, first: number, last: number, closed = true): ResourceHistoryTurnSummary {
  return { reference: `ref-${gen}-${id}`, turnId: id, status: closed ? "completed" : "active", closed, startedAt: "2026-08-12T00:00:00Z", durationMs: 10, triggerPreview: id, eventCount: last - first + 1, toolEventCount: 0, startEventId: first, lastEventId: last, endEventId: closed ? last : undefined, generation: generation(gen) };
}

function status(gen = 3): ResourceMessageStatus {
  return { resourceId: "task-a", state: "idle", acceptsMessages: true, canSteerWaiting: false, waitingMessages: [], generation: { generation: gen, generationId: `gen-${gen}`, status: "idle" }, session: { id: `session-${gen}`, state: "idle" } };
}

function detail(summary: ResourceHistoryTurnSummary) {
  return { turn: summary, latestEventId: summary.lastEventId, items: [{ type: "message", role: "user", text: `detail ${summary.turnId}`, startEventId: summary.startEventId, endEventId: summary.startEventId, startedAt: summary.startedAt, endedAt: summary.startedAt }] };
}

class FakeEventSource {
  static instances: FakeEventSource[] = [];
  readonly url: string;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  closed = false;
  readyState = 0;
  private readonly listeners = new Map<string, (event: MessageEvent) => void>();
  constructor(url: string) { this.url = url; FakeEventSource.instances.push(this); }
  addEventListener(type: string, listener: EventListenerOrEventListenerObject): void { this.listeners.set(type, listener as (event: MessageEvent) => void); }
  close(): void { this.closed = true; this.readyState = 2; }
  emit(event: AgentEvent): void { this.onmessage?.(new MessageEvent("message", { data: JSON.stringify(event) })); }
  failPermanently(): void { this.readyState = 2; this.onerror?.(new Event("error")); }
}

function controller(fetchImpl: typeof fetch, callbacks: ConstructorParameters<typeof ChatSessionController>[0] = {}) {
  FakeEventSource.instances = [];
  const value = new ChatSessionController({ api: new ApiClient(fetchImpl), eventSourceFactory: (url) => new FakeEventSource(url) as unknown as EventSource, ...callbacks });
  controllers.push(value);
  return value;
}

describe("resource conversation controller", () => {
  it("loads summaries first and materializes a visible closed turn on demand", async () => {
    const summary = turn(3, "turn-a", 1, 3);
    const fetchImpl = vi.fn<typeof fetch>(async (url) => String(url).includes("/history/turns/ref-") ? response(detail(summary)) : response({ resourceId: "task-a", segments: [{ generation: generation(3), turns: [summary] }], page: { limit: 20, hasMore: false } }));
    const value = controller(fetchImpl);
    let latest = {} as ChatContextSnapshot;
    value.subscribe((snapshot) => { latest = snapshot; });
    value.activate("workspace-a", "task-a", null);
    await vi.waitFor(() => expect(latest.blocks).toHaveLength(1));
    expect(latest.blocks[0].items).toBeUndefined();
    await value.loadTurn(summary.reference);
    expect(latest.blocks[0].items?.find((item) => item.kind === "message")?.text).toBe("detail turn-a");
    expect(fetchImpl.mock.calls[0][0].toString()).toContain("/resources/task-a/history/turns?limit=20");
  });

  it("keeps generation boundaries and explicit gaps while paging older history", async () => {
    const newest = turn(3, "new", 4, 6);
    const oldest = turn(1, "old", 1, 3);
    const fetchImpl = vi.fn<typeof fetch>(async (url) => String(url).includes("cursor=older")
      ? response({ resourceId: "task-a", segments: [{ generation: generation(1), turns: [oldest] }], page: { limit: 20, hasMore: false } })
      : response({ resourceId: "task-a", segments: [{ generation: generation(3), turns: [newest] }, { generation: generation(2), turns: [], gap: { code: "session_missing", message: "missing", retryable: false } }], page: { limit: 20, nextCursor: "older", hasMore: true } }));
    const value = controller(fetchImpl);
    let latest = {} as ChatContextSnapshot;
    value.subscribe((snapshot) => { latest = snapshot; });
    value.activate("workspace-a", "task-a", null);
    await vi.waitFor(() => expect(latest.hasMoreBefore).toBe(true));
    await value.loadOlder();
    expect(latest.blocks.map((block) => block.key)).toEqual(["gen-1:old", "gap:gen-2", "gen-3:new"]);
  });

  it("uses resource-scoped raw events and SSE only for the current open turn", async () => {
    const open = turn(3, "open", 5, 7, false);
    const fetchImpl = vi.fn<typeof fetch>(async (url) => {
      const path = String(url);
      if (path.includes("/history/turns/ref-")) return response({ ...detail(open), latestEventId: 8 });
      if (path.includes("/events?")) return response({ events: [{ id: 5, type: "turn.started", turnId: "open", sessionId: "session-3" }, { id: 6, type: "message.input", turnId: "open", sessionId: "session-3", data: { text: "raw" } }, { id: 8, type: "message.assistant.delta", turnId: "open", sessionId: "session-3", data: { text: "reply" } }], page: { hasMore: false, nextAfter: 8 } });
      return response({ resourceId: "task-a", segments: [{ generation: generation(3), turns: [open] }], page: { limit: 20, hasMore: false } });
    });
    const value = controller(fetchImpl);
    let latest = {} as ChatContextSnapshot;
    value.subscribe((snapshot) => { latest = snapshot; });
    value.activate("workspace-a", "task-a", status());
    await vi.waitFor(() => expect(latest.blocks).toHaveLength(1));
    await value.loadTurn(open.reference);
    await vi.waitFor(() => expect(latest.blocks[0].events?.map((event) => event.id)).toEqual([5, 6, 8]));
    expect(FakeEventSource.instances[0].url).toContain("/resources/task-a/stream?");
    expect(FakeEventSource.instances[0].url).toContain("generationId=gen-3");
    expect(fetchImpl.mock.calls.some(([url]) => String(url).includes("/resources/task-a/events?"))).toBe(true);
  });

  it("expands a compact tool with the complete bounded Turn event range", async () => {
    const closed = turn(3, "closed", 5, 8);
    const compact = {
      turn: closed,
      latestEventId: 8,
      items: [
        { type: "message", role: "user", text: "run it", startEventId: 5, endEventId: 5, startedAt: closed.startedAt, endedAt: closed.startedAt },
        { type: "tool", startEventId: 6, endEventId: 7, startedAt: closed.startedAt, endedAt: closed.startedAt, count: 1 },
        { type: "message", role: "assistant", text: "done", startEventId: 8, endEventId: 8, startedAt: closed.startedAt, endedAt: closed.startedAt },
      ],
    };
    const fetchImpl = vi.fn<typeof fetch>(async (url) => {
      const path = String(url);
      if (path.includes("/history/turns/ref-")) return response(compact);
      if (path.includes("/events?")) return response({ events: [
        { id: 5, type: "message.input", turnId: "closed", sessionId: "session-3", data: { text: "run it", role: "user" } },
        { id: 6, type: "tool.event", turnId: "closed", sessionId: "session-3", data: { method: "item/started", raw: { item: { type: "commandExecution", id: "call-1", command: ["true"] } } } },
        { id: 7, type: "tool.event", turnId: "closed", sessionId: "session-3", data: { method: "item/completed", raw: { item: { type: "commandExecution", id: "call-1", command: ["true"], status: "completed" } } } },
        { id: 8, type: "message.assistant.delta", turnId: "closed", sessionId: "session-3", data: { text: "done" } },
      ], page: { hasMore: false, nextAfter: 8 } });
      return response({ resourceId: "task-a", segments: [{ generation: generation(3), turns: [closed] }], page: { limit: 20, hasMore: false } });
    });
    const value = controller(fetchImpl);
    let latest = {} as ChatContextSnapshot;
    value.subscribe((snapshot) => { latest = snapshot; });
    value.activate("workspace-a", "task-a", status());
    await vi.waitFor(() => expect(latest.blocks).toHaveLength(1));
    await value.loadTurn(closed.reference);
    expect(latest.blocks[0].items?.find((item) => item.kind === "tools")?.compact).toBe(true);

    await value.expandRange("gen-3", 6, 7);

    expect(latest.blocks[0].events?.map((event) => event.id)).toEqual([5, 6, 7, 8]);
    const rangeRequest = fetchImpl.mock.calls.find(([url]) => String(url).includes("/events?"));
    expect(String(rangeRequest?.[0])).toContain("start=5");
    expect(String(rangeRequest?.[0])).toContain("end=8");
  });

  it("expands a compact tool from a non-current generation", async () => {
    const closed = turn(2, "closed", 5, 8);
    const compact = {
      turn: closed,
      latestEventId: 8,
      items: [
        { type: "tool", startEventId: 6, endEventId: 7, startedAt: closed.startedAt, endedAt: closed.startedAt, count: 1 },
      ],
    };
    const fetchImpl = vi.fn<typeof fetch>(async (url) => {
      const path = String(url);
      if (path.includes("/history/turns/ref-")) return response(compact);
      if (path.includes("/events?")) return response({ events: [
        { id: 6, type: "tool.event", turnId: "closed", sessionId: "session-2", data: { method: "item/started", raw: { item: { type: "commandExecution", id: "call-1", command: ["true"] } } } },
        { id: 7, type: "tool.event", turnId: "closed", sessionId: "session-2", data: { method: "item/completed", raw: { item: { type: "commandExecution", id: "call-1", command: ["true"], status: "completed" } } } },
      ], page: { hasMore: false, nextAfter: 7 } });
      return response({ resourceId: "task-a", segments: [{ generation: generation(3), turns: [] }, { generation: generation(2), turns: [closed] }], page: { limit: 20, hasMore: false } });
    });
    const value = controller(fetchImpl);
    let latest = {} as ChatContextSnapshot;
    value.subscribe((snapshot) => { latest = snapshot; });
    // The read-only History view activates without a runtime status, so the
    // context has no current generation; expansion must still resolve the
    // owning generation from the compact item itself.
    value.activate("workspace-a", "task-a", null);
    await vi.waitFor(() => expect(latest.blocks).toHaveLength(1));
    await value.loadTurn(closed.reference);
    expect(latest.blocks[0].items?.find((item) => item.kind === "tools")?.compact).toBe(true);

    await value.expandRange("gen-2", 6, 7);

    expect(latest.blocks[0].events?.map((event) => event.id)).toEqual([6, 7]);
    const rangeRequest = fetchImpl.mock.calls.find(([url]) => String(url).includes("/events?"));
    expect(String(rangeRequest?.[0])).toContain("generationId=gen-2");
  });

  it("coalesces repeated terminal events while the canonical Turn is materializing", async () => {
    const open = turn(3, "turn-a", 5, 7, false);
    const closed = turn(3, "turn-a", 5, 8);
    const terminalHead = deferredResponse();
    let historyCalls = 0;
    const fetchImpl = vi.fn<typeof fetch>(async (url) => {
      const path = String(url);
      if (path.includes("/history/turns/ref-")) return response(detail(closed));
      historyCalls++;
      if (historyCalls === 1) return response({ resourceId: "task-a", segments: [{ generation: generation(3), turns: [open] }], page: { limit: 20, hasMore: false } });
      return terminalHead.promise;
    });
    const value = controller(fetchImpl, { streamBatchWindowMs: 0 });
    let latest = {} as ChatContextSnapshot;
    value.subscribe((snapshot) => { latest = snapshot; });
    value.activate("workspace-a", "task-a", status());
    await vi.waitFor(() => expect(FakeEventSource.instances).toHaveLength(1));

    const terminal = { id: 8, type: "turn.completed", turnId: "turn-a", sessionId: "session-3" };
    FakeEventSource.instances[0].emit(terminal);
    FakeEventSource.instances[0].emit(terminal);
    await vi.waitFor(() => expect(historyCalls).toBe(2));
    terminalHead.resolve(response({ resourceId: "task-a", segments: [{ generation: generation(3), turns: [closed] }], page: { limit: 20, hasMore: false } }));

    await vi.waitFor(() => expect(latest.blocks[0].items?.find((item) => item.kind === "message")?.text).toBe("detail turn-a"));
    expect(historyCalls).toBe(2);
    expect(fetchImpl.mock.calls.filter(([url]) => String(url).includes("/history/turns/ref-")).length).toBe(1);
    expect(latest.error).toBe("");
  });

  it("still surfaces a real terminal history failure after bounded retries", async () => {
    const open = turn(3, "turn-a", 5, 7, false);
    let historyCalls = 0;
    const fetchImpl = vi.fn<typeof fetch>(async () => {
      historyCalls++;
      if (historyCalls === 1) return response({ resourceId: "task-a", segments: [{ generation: generation(3), turns: [open] }], page: { limit: 20, hasMore: false } });
      return new Response(JSON.stringify({ error: "history unavailable" }), { status: 503, headers: { "content-type": "application/json" } });
    });
    const value = controller(fetchImpl, { streamBatchWindowMs: 0 });
    let latest = {} as ChatContextSnapshot;
    value.subscribe((snapshot) => { latest = snapshot; });
    value.activate("workspace-a", "task-a", status());
    await vi.waitFor(() => expect(FakeEventSource.instances).toHaveLength(1));

    FakeEventSource.instances[0].emit({ id: 8, type: "turn.completed", turnId: "turn-a", sessionId: "session-3" });

    await vi.waitFor(() => expect(latest.error).toBe("history unavailable"));
    expect(historyCalls).toBe(4);
  });

  it("invalidates the old resource immediately and closes its stream", async () => {
    const fetchImpl = vi.fn<typeof fetch>(async (url) => response({ resourceId: String(url).includes("task-b") ? "task-b" : "task-a", segments: [], page: { limit: 20, hasMore: false } }));
    const value = controller(fetchImpl);
    let latest = {} as ChatContextSnapshot;
    value.subscribe((snapshot) => { latest = snapshot; });
    value.activate("workspace-a", "task-a", status());
    await vi.waitFor(() => expect(FakeEventSource.instances).toHaveLength(1));
    const first = FakeEventSource.instances[0];
    value.activate("workspace-a", "task-b", { ...status(), resourceId: "task-b" });
    expect(first.closed).toBe(true);
    expect(latest.identity).toBe("workspace-a:task-b");
    expect(latest.blocks).toEqual([]);
  });

  it("reconnects after a fatal stream failure when the same generation resumes", async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () => response({ resourceId: "task-a", segments: [{ generation: generation(3), turns: [] }], page: { limit: 20, hasMore: false } }));
    const value = controller(fetchImpl);
    value.activate("workspace-a", "task-a", {
      ...status(),
      generation: { ...status().generation!, status: "idle-suspended", resumable: true },
      session: { ...status().session, state: "stopped" },
    });
    await vi.waitFor(() => expect(FakeEventSource.instances).toHaveLength(1));

    const failed = FakeEventSource.instances[0];
    failed.failPermanently();
    value.activate("workspace-a", "task-a", {
      ...status(),
      state: "working",
      generation: { ...status().generation!, status: "running", resumable: false },
      session: { ...status().session, state: "running", currentTurnId: "turn-resumed" },
    });

    expect(FakeEventSource.instances).toHaveLength(2);
    expect(FakeEventSource.instances[1].url).toContain("generationId=gen-3");
  });

  it("loads a replacement generation after the old live stream closes", async () => {
    const oldTurn = turn(1, "old", 1, 2);
    const newTurn = turn(2, "new", 3, 4);
    let currentGeneration = 1;
    const fetchImpl = vi.fn<typeof fetch>(async (url) => {
      const path = String(url);
      if (path.endsWith("/status")) return response(status(currentGeneration));
      return response({
        resourceId: "task-a",
        segments: currentGeneration === 1
          ? [{ generation: generation(1), turns: [oldTurn] }]
          : [{ generation: generation(1), turns: [oldTurn] }, { generation: generation(2), turns: [newTurn] }],
        page: { limit: 20, hasMore: false },
      });
    });
    const value = controller(fetchImpl);
    let latest = {} as ChatContextSnapshot;
    value.subscribe((snapshot) => { latest = snapshot; });
    value.activate("workspace-a", "task-a", status(1));
    await vi.waitFor(() => expect(FakeEventSource.instances).toHaveLength(1));

    currentGeneration = 2;
    FakeEventSource.instances[0].failPermanently();

    await vi.waitFor(() => expect(latest.generationId).toBe("gen-2"));
    await vi.waitFor(() => expect(latest.blocks.map((block) => block.key)).toEqual(["gen-1:old", "gen-2:new"]));
    expect(FakeEventSource.instances).toHaveLength(2);
    expect(FakeEventSource.instances[1].url).toContain("generationId=gen-2");
  });

  it("syncs a replacement generation while the previous live stream stays open", async () => {
    const oldTurn = turn(1, "old", 1, 2);
    const newTurn = turn(2, "new", 3, 4);
    let currentGeneration = 1;
    const fetchImpl = vi.fn<typeof fetch>(async (url) => {
      const path = String(url);
      if (path.endsWith("/status")) return response(status(currentGeneration));
      return response({
        resourceId: "task-a",
        segments: currentGeneration === 1
          ? [{ generation: generation(1), turns: [oldTurn] }]
          : [{ generation: generation(1), turns: [oldTurn] }, { generation: generation(2), turns: [newTurn] }],
        page: { limit: 20, hasMore: false },
      });
    });
    const value = controller(fetchImpl, { statusSyncIntervalMs: 10 });
    let latest = {} as ChatContextSnapshot;
    value.subscribe((snapshot) => { latest = snapshot; });
    value.activate("workspace-a", "task-a", status(1));
    await vi.waitFor(() => expect(FakeEventSource.instances).toHaveLength(1));
    const oldStream = FakeEventSource.instances[0];

    currentGeneration = 2;

    await vi.waitFor(() => expect(latest.blocks.map((block) => block.key)).toEqual(["gen-1:old", "gen-2:new"]));
    expect(oldStream.closed).toBe(true);
    expect(FakeEventSource.instances).toHaveLength(2);
    expect(FakeEventSource.instances[1].url).toContain("generationId=gen-2");

    // A parent view-model refresh can still carry the previous Generation
    // while its own status request catches up; it must not roll Chat back.
    value.activate("workspace-a", "task-a", status(1));
    expect(latest.generationId).toBe("gen-2");
    expect(latest.blocks.map((block) => block.key)).toEqual(["gen-1:old", "gen-2:new"]);
  });

  it("keeps an in-flight status sync alive across a parent view refresh", async () => {
    const oldTurn = turn(1, "old", 1, 2);
    const newTurn = turn(2, "new", 3, 4);
    const pendingStatus = deferredResponse();
    let statusCalls = 0;
    const fetchImpl = vi.fn<typeof fetch>(async (url) => {
      const path = String(url);
      if (path.endsWith("/status")) {
        statusCalls++;
        return statusCalls === 1 ? pendingStatus.promise : response(status(1));
      }
      return response({
        resourceId: "task-a",
        segments: [{ generation: generation(1), turns: [oldTurn] }, { generation: generation(2), turns: [newTurn] }],
        page: { limit: 20, hasMore: false },
      });
    });
    const value = controller(fetchImpl, { statusSyncIntervalMs: 10 });
    let latest = {} as ChatContextSnapshot;
    value.subscribe((snapshot) => { latest = snapshot; });
    value.activate("workspace-a", "task-a", status(1));
    await vi.waitFor(() => expect(statusCalls).toBe(1));

    // The app-level status model can be republished while the controller's
    // own request is still waiting on the AgentHub session. It must not cancel
    // that request before it observes the replacement Generation.
    value.activate("workspace-a", "task-a", status(1));
    pendingStatus.resolve(response(status(2)));

    await vi.waitFor(() => expect(latest.generationId).toBe("gen-2"));
    expect(latest.blocks.map((block) => block.key)).toEqual(["gen-1:old", "gen-2:new"]);
  });

  it("discards stale history responses across rapid multi-generation switches", async () => {
    const pending = [deferredResponse(), deferredResponse(), deferredResponse()];
    let historyCalls = 0;
    const fetchImpl = vi.fn<typeof fetch>(async () => pending[historyCalls++].promise);
    const value = controller(fetchImpl);
    let latest = {} as ChatContextSnapshot;
    value.subscribe((snapshot) => { latest = snapshot; });

    value.activate("workspace-a", "task-a", status(1));
    await vi.waitFor(() => expect(historyCalls).toBe(1));
    value.activate("workspace-a", "task-a", status(2));
    await vi.waitFor(() => expect(historyCalls).toBe(2));
    value.activate("workspace-a", "task-a", status(3));
    await vi.waitFor(() => expect(historyCalls).toBe(3));

    pending[2].resolve(response({ resourceId: "task-a", segments: [{ generation: generation(3), turns: [turn(3, "latest", 7, 8)] }], page: { limit: 20, hasMore: false } }));
    pending[0].resolve(response({ resourceId: "task-a", segments: [{ generation: generation(1), turns: [turn(1, "stale", 1, 2)] }], page: { limit: 20, hasMore: false } }));
    pending[1].resolve(response({ resourceId: "task-a", segments: [{ generation: generation(2), turns: [turn(2, "stale", 3, 4)] }], page: { limit: 20, hasMore: false } }));

    await vi.waitFor(() => expect(latest.blocks.map((block) => block.key)).toEqual(["gen-3:latest"]));
    expect(latest.generationId).toBe("gen-3");
  });

  it("keeps streamed events of the open turn inside its block instead of a transient orphan block", async () => {
    const open = turn(3, "turn-a", 5, 7, false);
    let historyCalls = 0;
    const fetchImpl = vi.fn<typeof fetch>(async () => {
      historyCalls++;
      return response({ resourceId: "task-a", segments: [{ generation: generation(3), turns: [open] }], page: { limit: 20, hasMore: false } });
    });
    const value = controller(fetchImpl, { streamBatchWindowMs: 0 });
    let latest = {} as ChatContextSnapshot;
    value.subscribe((snapshot) => { latest = snapshot; });
    value.activate("workspace-a", "task-a", status());
    await vi.waitFor(() => expect(FakeEventSource.instances).toHaveLength(1));
    const stream = FakeEventSource.instances[0];
    // The open summary still ends at event 7; both streamed events are newer
    // than the fetched head but clearly belong to the open turn.
    stream.emit({ id: 8, type: "tool.event", turnId: "turn-a", sessionId: "session-3", data: { method: "item/started", raw: { item: { type: "commandExecution", id: "call-1", command: ["ls"] } } } });
    stream.emit({ id: 9, type: "tool.event", turnId: "turn-a", sessionId: "session-3", data: { method: "item/completed", raw: { item: { type: "commandExecution", id: "call-1", command: ["ls"], status: "completed" } } } });
    await vi.waitFor(() => expect(latest.blocks[0].events?.map((event) => event.id)).toEqual([8, 9]));
    expect(latest.blocks).toHaveLength(1);
    expect(latest.blocks[0].key).toBe("gen-3:turn-a");
    // Events placed directly in the turn no longer detour through the orphan
    // path, so no extra head refresh is needed.
    expect(historyCalls).toBe(1);
  });

  it("still orphans and head-refreshes streamed events of an unknown turn", async () => {
    const open = turn(3, "turn-a", 5, 7, false);
    let historyCalls = 0;
    const fetchImpl = vi.fn<typeof fetch>(async () => {
      historyCalls++;
      return response({ resourceId: "task-a", segments: [{ generation: generation(3), turns: [open] }], page: { limit: 20, hasMore: false } });
    });
    const value = controller(fetchImpl, { streamBatchWindowMs: 0 });
    let latest = {} as ChatContextSnapshot;
    value.subscribe((snapshot) => { latest = snapshot; });
    value.activate("workspace-a", "task-a", status());
    await vi.waitFor(() => expect(FakeEventSource.instances).toHaveLength(1));
    FakeEventSource.instances[0].emit({ id: 8, type: "tool.event", turnId: "turn-b", sessionId: "session-3", data: { method: "item/started", raw: { item: { type: "commandExecution", id: "call-1", command: ["ls"] } } } });
    await vi.waitFor(() => expect(latest.blocks).toHaveLength(2));
    expect(latest.blocks.map((block) => block.key)).toEqual(["gen-3:turn-a", "gen-3:turn-b:8"]);
    await vi.waitFor(() => expect(historyCalls).toBe(2));
  });

  it("omits routine session startup events while retaining notable session lifecycle events", async () => {
    const closedTurn = turn(3, "turn-a", 4, 7);
    const fetchImpl = vi.fn<typeof fetch>(async () => response({ resourceId: "task-a", segments: [{ generation: generation(3), turns: [closedTurn] }], page: { limit: 20, hasMore: false } }));
    const value = controller(fetchImpl, { streamBatchWindowMs: 0 });
    let latest = {} as ChatContextSnapshot;
    value.subscribe((snapshot) => { latest = snapshot; });
    value.activate("workspace-a", "task-a", status());
    await vi.waitFor(() => expect(latest.blocks).toHaveLength(1));
    const stream = FakeEventSource.instances[0];
    stream.emit({ id: 1, type: "session.created", sessionId: "session-3" });
    stream.emit({ id: 2, type: "session.provider", sessionId: "session-3", data: { agentName: "Fixture Agent", provider: "codex" } });
    stream.emit({ id: 8, type: "session.state", sessionId: "session-3", data: { state: "stopped", reason: "completed" } });
    await vi.waitFor(() => expect(latest.blocks).toHaveLength(2));
    expect(latest.blocks.map((block) => block.key)).toEqual(["gen-3:turn-a", "gen-3:current:8"]);
    expect(latest.blocks[1].events?.map((event) => event.id)).toEqual([8]);
  });
});
