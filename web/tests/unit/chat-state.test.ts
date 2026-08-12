import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiClient } from "../../src/api/client";
import { ChatSessionController } from "../../src/components/chat-state";
import type { AgentEvent, ChatContextSnapshot, ResourceHistoryGeneration, ResourceHistoryTurnSummary, ResourceMessageStatus } from "../../src/components/models";

const controllers: ChatSessionController[] = [];
afterEach(() => controllers.splice(0).forEach((controller) => controller.dispose()));

function response(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } });
}

function generation(number: number): ResourceHistoryGeneration {
  return { generation: number, generationId: `gen-${number}`, title: `Generation ${number}`, status: number === 3 ? "idle" : "archived", createdAt: "2026-08-12T00:00:00Z", updatedAt: "2026-08-12T00:00:00Z" };
}

function turn(gen: number, id: string, first: number, last: number, closed = true): ResourceHistoryTurnSummary {
  return { reference: `ref-${gen}-${id}`, turnId: id, status: closed ? "completed" : "active", closed, startedAt: "2026-08-12T00:00:00Z", durationMs: 10, triggerPreview: id, eventCount: last - first + 1, toolEventCount: 0, startEventId: first, lastEventId: last, endEventId: closed ? last : undefined, generation: generation(gen) };
}

function status(gen = 3): ResourceMessageStatus {
  return { resourceId: "task-a", state: "idle", acceptsMessages: true, canSteerWaiting: false, waitingMessages: [], generation: { runId: "internal-run", generation: gen, generationId: `gen-${gen}`, status: "idle" }, session: { id: `session-${gen}`, state: "idle" } };
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
  private readonly listeners = new Map<string, (event: MessageEvent) => void>();
  constructor(url: string) { this.url = url; FakeEventSource.instances.push(this); }
  addEventListener(type: string, listener: EventListenerOrEventListenerObject): void { this.listeners.set(type, listener as (event: MessageEvent) => void); }
  close(): void { this.closed = true; }
  emit(event: AgentEvent): void { this.onmessage?.(new MessageEvent("message", { data: JSON.stringify(event) })); }
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
});
