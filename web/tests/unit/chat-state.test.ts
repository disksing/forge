import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiClient } from "../../src/api/client";
import { ChatSessionController } from "../../src/components/chat-state";
import type { AgentEvent, AgentRun, ChatContextSnapshot } from "../../src/components/models";

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

  it("publishes a same-session activation when run metadata dismisses a notice", async () => {
    const value = controller(vi.fn<typeof fetch>(async () => response({ events: [], page: {} })));
    let latest = {} as ChatContextSnapshot;
    value.subscribe((snapshot) => { latest = snapshot; });
    const activeRun = { ...run("run-a"), selfDrivingRevision: 2, schedulerTurnSequence: 3, schedulerTurn: false };
    value.activate("workspace-a", activeRun);
    await vi.waitFor(() => expect(FakeEventSource.instances).toHaveLength(1));
    FakeEventSource.instances[0].notice({
      source: "forge", type: "forge.notice", data: {
        kind: "self-driving-finish", lifecycle: "until-reconcile", runId: "run-a", resourceId: "task-a",
        selfDrivingRevision: 2, schedulerTurnSequence: 3,
      },
    });
    expect(latest.notices).toHaveLength(1);

    value.activate("workspace-a", { ...activeRun, schedulerTurn: true });
    expect(latest.notices).toEqual([]);
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
