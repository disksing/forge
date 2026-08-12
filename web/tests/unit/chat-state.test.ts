import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiClient } from "../../src/api/client";
import { ChatSessionController } from "../../src/components/chat-state";
import type { AgentEvent, AgentRun, AgentTurn, ChatContextSnapshot } from "../../src/components/models";

const controllers: ChatSessionController[] = [];
afterEach(() => {
  controllers.splice(0).forEach((controller) => controller.dispose());
  vi.useRealTimers();
});

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}

function response(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } });
}

function run(id: string): AgentRun {
  return { id, workspaceId: "workspace-a", agentHubSessionId: `session-${id}`, resourceId: "task-a", status: "idle" };
}

function turn(id: string, first: number, last: number, closed: boolean, text: string): AgentTurn {
  return {
    id, turnId: id, closed, status: closed ? "completed" : "active",
    startEventId: first, firstEventId: first, lastEventId: last,
    endEventId: closed ? last : undefined,
    items: [
      { type: "lifecycle", text: "turn.started", startEventId: first, endEventId: first, startedAt: "2026-08-12T00:00:00Z", endedAt: "2026-08-12T00:00:00Z" },
      { type: "message", role: "user", text, startEventId: first + 1, endEventId: first + 1, startedAt: "2026-08-12T00:00:01Z", endedAt: "2026-08-12T00:00:01Z" },
      ...(closed ? [{ type: "lifecycle", text: "turn.completed", startEventId: last, endEventId: last, startedAt: "2026-08-12T00:00:02Z", endedAt: "2026-08-12T00:00:02Z" }] : []),
    ],
  };
}

class FakeEventSource {
  static instances: FakeEventSource[] = [];
  readonly url: string;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  closed = false;
  private readonly listeners = new Map<string, (event: MessageEvent) => void>();

  constructor(url: string) {
    this.url = url;
    FakeEventSource.instances.push(this);
  }

  addEventListener(type: string, listener: EventListenerOrEventListenerObject): void {
    this.listeners.set(type, listener as (event: MessageEvent) => void);
  }

  close(): void {
    this.closed = true;
  }

  emit(event: AgentEvent): void {
    this.onmessage?.(new MessageEvent("message", { data: JSON.stringify(event) }));
  }

  notice(data: unknown): void {
    this.listeners.get("forge.notice")?.(new MessageEvent("forge.notice", { data: JSON.stringify(data) }));
  }
}

function controller(fetchImpl: typeof fetch, callbacks: ConstructorParameters<typeof ChatSessionController>[0] = {}) {
  FakeEventSource.instances = [];
  const value = new ChatSessionController({
    api: new ApiClient(fetchImpl),
    eventSourceFactory: (url) => new FakeEventSource(url) as unknown as EventSource,
    ...callbacks,
  });
  controllers.push(value);
  return value;
}

describe("ChatSessionController", () => {
  it("loads compact turns, expands only the open tail, and hands off at the durable head", async () => {
    const fetchImpl = vi.fn<typeof fetch>(async (url) => {
      const path = String(url);
      if (path.includes("/events?start=5&end=10")) {
        return response({ events: [
          { id: 5, type: "turn.started", turnId: "turn-open", sessionId: "session-run-a", data: {} },
          { id: 6, type: "message.input", turnId: "turn-open", sessionId: "session-run-a", data: { role: "user", text: "live input" } },
          { id: 7, type: "message.reasoning.delta", turnId: "turn-open", sessionId: "session-run-a", data: { text: "thinking" } },
          { id: 8, type: "message.assistant.delta", turnId: "turn-open", sessionId: "session-run-a", data: { text: "live reply" } },
          { id: 9, type: "provider.event", turnId: "turn-open", sessionId: "session-run-a", data: {} },
          { id: 10, type: "session.state", sessionId: "session-run-a", data: { state: "running" } },
        ], page: { hasMore: false, nextAfter: 10 } });
      }
      return response({ turns: [turn("turn-old", 1, 4, true, "compact input"), turn("turn-open", 5, 8, false, "stale compact input")], latestEventId: 10, page: { hasMoreBefore: false } });
    });
    const value = controller(fetchImpl);
    let latest = {} as ChatContextSnapshot;
    value.subscribe((snapshot) => { latest = snapshot; });
    value.activate("workspace-a", run("run-a"));

    await vi.waitFor(() => expect(FakeEventSource.instances).toHaveLength(1));
    expect(latest.events.map((event) => event.id)).toEqual([1, 2, 4, 5, 6, 7, 8, 9, 10]);
    expect(latest.events.find((event) => event.id === 6)?.data?.text).toBe("live input");
    expect(FakeEventSource.instances[0].url).toContain("after=10");
    expect(fetchImpl.mock.calls[0][0].toString()).toContain("/turns?latest=true");
  });

  it("replaces a completed live range with the materialized turn", async () => {
    const open = turn("turn-open", 5, 6, false, "open");
    const closed = turn("turn-open", 5, 9, true, "materialized");
    const fetchImpl = vi.fn<typeof fetch>(async (url) => {
      const path = String(url);
      if (path.endsWith("/turns/turn-open")) return response({ turn: closed, latestEventId: 9 });
      if (path.includes("/events?")) return response({ events: [{ id: 5, type: "turn.started", turnId: "turn-open" }, { id: 6, type: "message.input", turnId: "turn-open", data: { text: "open" } }], page: { hasMore: false } });
      return response({ turns: [open], latestEventId: 6, page: {} });
    });
    const value = controller(fetchImpl, { streamBatchWindowMs: 0 });
    let latest = {} as ChatContextSnapshot;
    value.subscribe((snapshot) => { latest = snapshot; });
    value.activate("workspace-a", run("run-a"));
    await vi.waitFor(() => expect(FakeEventSource.instances).toHaveLength(1));
    FakeEventSource.instances[0].emit({ id: 9, type: "turn.completed", turnId: "turn-open", sessionId: "session-run-a", data: {} });

    await vi.waitFor(() => expect(latest.events.find((event) => event.id === 6)?.data?.text).toBe("materialized"));
    expect(latest.events.map((event) => event.id)).toEqual([5, 6, 9]);
  });

  it("invalidates the old view immediately and ignores a late HTTP response", async () => {
    const first = deferred<Response>();
    const fetchImpl = vi.fn<typeof fetch>((url) => {
      const path = String(url);
      if (path.includes("run-a")) return first.promise;
      return Promise.resolve(response({ events: [{ id: 2, type: "message.input", sessionId: "session-run-b", data: { text: "B" } }], page: { hasMoreBefore: false } }));
    });
    const value = controller(fetchImpl);
    const snapshots: ChatContextSnapshot[] = [];
    value.subscribe((snapshot) => snapshots.push(snapshot));

    value.activate("workspace-a", run("run-a"));
    value.activate("workspace-a", run("run-b"));
    expect(snapshots.at(-1)?.identity).toBe("workspace-a:run-b");
    expect(snapshots.at(-1)?.events).toEqual([]);
    await vi.waitFor(() => expect(snapshots.at(-1)?.events[0]?.data?.text).toBe("B"));

    first.resolve(response({ events: [{ id: 1, type: "message.input", sessionId: "session-run-a", data: { text: "late A" } }], page: {} }));
    await first.promise;
    await Promise.resolve();
    expect(snapshots.at(-1)?.identity).toBe("workspace-a:run-b");
    expect(snapshots.at(-1)?.events.map((event) => event.data?.text)).toEqual(["B"]);
  });

  it("publishes one bounded snapshot for a burst of cumulative tool updates", async () => {
    const value = controller(vi.fn<typeof fetch>(async () => response({ events: [], page: {} })), { streamBatchWindowMs: 20 });
    const snapshots: ChatContextSnapshot[] = [];
    value.subscribe((snapshot) => snapshots.push(snapshot));
    value.activate("workspace-a", run("run-a"));
    await vi.waitFor(() => expect(FakeEventSource.instances).toHaveLength(1));
    const baseline = snapshots.length;
    const stream = FakeEventSource.instances[0];
    stream.emit({
      id: 1, type: "tool.event", sessionId: "session-run-a", data: {
        method: "session/update",
        raw: { update: { sessionUpdate: "tool_call", toolCallId: "call-a", status: "in_progress", title: "Command" } },
      },
    });
    for (let index = 0; index < 1_000; index++) {
      stream.emit({
        id: index + 2, type: "tool.event", sessionId: "session-run-a", data: {
          method: "session/update",
          raw: { update: {
            sessionUpdate: "tool_call_update", toolCallId: "call-a", status: "in_progress",
            content: [{ type: "text", text: `cumulative ${index}` }],
          } },
        },
      });
    }

    expect(snapshots).toHaveLength(baseline);
    await vi.waitFor(() => expect(snapshots.at(-1)?.events.at(-1)?.id).toBe(1_001));
    expect(snapshots).toHaveLength(baseline + 1);
    expect(snapshots.at(-1)?.events).toHaveLength(2);
    expect(snapshots.at(-1)?.events[1].data?.raw).toMatchObject({
      update: { toolCallId: "call-a", content: [{ text: "cumulative 999" }] },
    });
  });

  it("closes the replaced stream and rejects its late event and notice", async () => {
    const onEvent = vi.fn();
    const onNotice = vi.fn();
    const value = controller(vi.fn<typeof fetch>(async () => response({ events: [], page: {} })), { onEvent, onNotice });
    let latest = {} as ChatContextSnapshot;
    value.subscribe((snapshot) => { latest = snapshot; });
    value.activate("workspace-a", run("run-a"));
    await vi.waitFor(() => expect(FakeEventSource.instances).toHaveLength(1));
    const old = FakeEventSource.instances[0];

    value.activate("workspace-a", run("run-b"));
    await vi.waitFor(() => expect(FakeEventSource.instances).toHaveLength(2));
    expect(old.closed).toBe(true);
    old.emit({ id: 7, type: "message.input", sessionId: "session-run-a", data: { text: "stale" } });
    old.notice({ source: "forge", type: "forge.notice", data: { runId: "run-a", text: "stale notice" } });
    expect(latest.identity).toBe("workspace-a:run-b");
    expect(latest.events).toEqual([]);
    expect(latest.notices).toEqual([]);
    expect(onEvent).not.toHaveBeenCalled();
    expect(onNotice).not.toHaveBeenCalled();
  });

  it("closes the current stream as soon as the run projection becomes terminal", async () => {
    const value = controller(vi.fn<typeof fetch>(async () => response({ events: [], page: {} })));
    value.activate("workspace-a", run("run-a"));
    await vi.waitFor(() => expect(FakeEventSource.instances).toHaveLength(1));
    const stream = FakeEventSource.instances[0];
    value.activate("workspace-a", { ...run("run-a"), status: "stopped" });
    expect(stream.closed).toBe(true);
    expect(FakeEventSource.instances).toHaveLength(1);
  });

  it("uses the raw oldest cursor and merges an overlapping older page once", async () => {
    const fetchImpl = vi.fn<typeof fetch>(async (url) => {
      const path = String(url);
      if (path.includes("before=3")) {
        return response({ events: [{ id: 1, type: "message.input" }, { id: 2, type: "message.input" }, { id: 3, type: "message.input" }], page: { hasMoreBefore: false } });
      }
      return response({ events: [{ id: 3, type: "message.input" }, { id: 4, type: "message.assistant.delta" }], page: { hasMoreBefore: true } });
    });
    const value = controller(fetchImpl);
    let latest = {} as ChatContextSnapshot;
    value.subscribe((snapshot) => { latest = snapshot; });
    value.activate("workspace-a", run("run-a"));
    await vi.waitFor(() => expect(latest.events.map((event) => event.id)).toEqual([3, 4]));
    await value.loadOlder();
    expect(latest.events.map((event) => event.id)).toEqual([1, 2, 3, 4]);
    expect(latest.hasMoreBefore).toBe(false);
    expect(fetchImpl.mock.calls.some(([url]) => String(url).includes("before=3"))).toBe(true);
  });
});
