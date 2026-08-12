import { ApiClient, StaleResponseError } from "../api/client";
import type { AgentEvent, AgentNotice, AgentRun, AgentTurn, AgentTurnItem, ChatContextSnapshot } from "./models";
import { compactTimelineEvents, mergeCanonicalEventBatch, mergeCanonicalEvents } from "./timeline-events";

const PAGE_LIMIT = 250;
const STREAM_BATCH_WINDOW_MS = 80;
const HIDDEN_EVENT_TYPES = new Set(["session.launch-environment"]);

type EventSourceFactory = (url: string) => EventSource;
type SnapshotListener = (snapshot: ChatContextSnapshot) => void;

interface EventPage {
  events?: AgentEvent[];
  page?: { hasMore?: boolean; hasMoreBefore?: boolean; nextAfter?: number };
}

interface TurnPage extends EventPage {
  turns?: AgentTurn[];
  latestEventId?: number;
}

interface SingleTurnPage {
  turn?: AgentTurn;
  latestEventId?: number;
}

interface ChatContext {
  key: string;
  workspaceId: string;
  runId: string;
  acceptedSessionIds: Set<string>;
  run: AgentRun | null;
  generation: number;
  streamGeneration: number;
  events: AgentEvent[];
  notices: AgentNotice[];
  beforeId: number;
  latestEventId: number;
  historyMode: "turns" | "events";
  hasMoreBefore: boolean;
  loading: boolean;
  loadingOlder: boolean;
  loaded: boolean;
  error: string;
  stream: EventSource | null;
  pendingEvents: AgentEvent[];
  flushTimer: ReturnType<typeof setTimeout> | null;
}

export interface ChatSessionControllerOptions {
  api?: ApiClient;
  eventSourceFactory?: EventSourceFactory;
  onEvent?: (workspaceId: string, runId: string, event: AgentEvent) => void;
  onNotice?: (workspaceId: string, runId: string, notice: AgentNotice) => void;
  streamBatchWindowMs?: number;
}

export class ChatSessionController {
  private readonly api: ApiClient;
  private readonly eventSourceFactory: EventSourceFactory;
  private readonly contexts = new Map<string, ChatContext>();
  private readonly listeners = new Set<SnapshotListener>();
  private readonly onEvent?: ChatSessionControllerOptions["onEvent"];
  private readonly onNotice?: ChatSessionControllerOptions["onNotice"];
  private readonly streamBatchWindowMs: number;
  private activeKey = "";
  private disposed = false;

  constructor(options: ChatSessionControllerOptions = {}) {
    this.api = options.api ?? new ApiClient();
    this.eventSourceFactory = options.eventSourceFactory ?? ((url) => new EventSource(url));
    this.onEvent = options.onEvent;
    this.onNotice = options.onNotice;
    this.streamBatchWindowMs = Math.max(0, options.streamBatchWindowMs ?? STREAM_BATCH_WINDOW_MS);
  }

  subscribe(listener: SnapshotListener): () => void {
    this.listeners.add(listener);
    listener(this.snapshot());
    return () => this.listeners.delete(listener);
  }

  activate(workspaceId: string, run: AgentRun | null): void {
    if (this.disposed) return;
    const runId = String(run?.id || "").trim();
    const nextKey = contextKey(workspaceId, runId);
    const contextChanged = this.activeKey !== nextKey;
    if (this.activeKey && this.activeKey !== nextKey) this.deactivate(this.contexts.get(this.activeKey));
    this.activeKey = nextKey;
    if (!workspaceId || !runId) {
      this.emit();
      return;
    }
    const context = this.contexts.get(nextKey) ?? this.createContext(workspaceId, runId);
    context.run = run;
    context.acceptedSessionIds = sessionIdentities(run);
    context.notices = context.notices.filter((notice) => notice.data?.method !== "resource/profile");
    if (run?.agentConfigError) this.appendNotice(context, {
      source: "forge", type: "forge.notice",
      data: { level: "warning", method: "resource/profile", runId, text: run.agentConfigError },
    });
    if (!isLiveRun(run) && context.stream) {
      context.streamGeneration++;
      context.stream.close();
      context.stream = null;
    }
    if (contextChanged) this.emit();
    if (!context.loaded && !context.loading) void this.loadInitial(context);
    else this.connect(context);
  }

  async loadOlder(): Promise<boolean> {
    const context = this.activeContext();
    if (!context || context.loadingOlder || !context.hasMoreBefore || !context.beforeId) return false;
    const generation = context.generation;
    const before = context.beforeId;
    context.loadingOlder = true;
    context.error = "";
    this.emit();
    try {
      const path = context.historyMode === "turns" ? turnsPath(context, `before=${encodeURIComponent(before)}&limit=${PAGE_LIMIT}`) : eventsPath(context, `before=${encodeURIComponent(before)}&limit=${PAGE_LIMIT}`);
      const page = await this.api.latest<TurnPage>(path, {
        scope: requestScope(context, "older"),
      });
      if (!this.isCurrent(context, generation)) return false;
      if (context.historyMode === "turns") {
        const turns = normalizeTurns(page.turns);
        const nextBefore = oldestTurnCursor(turns);
        if (turns.length && (!nextBefore || nextBefore >= before)) {
          context.hasMoreBefore = false;
          return false;
        }
        context.events = compactTimelineEvents(mergeCanonicalEvents([...turns.flatMap(turnEvents), ...context.events]));
        if (nextBefore) context.beforeId = nextBefore;
        context.hasMoreBefore = Boolean(page.page?.hasMoreBefore && nextBefore);
        return turns.length > 0;
      }
      const older = normalizeEvents(page.events);
      const nextBefore = oldestEventId(older);
      if (older.length && (!nextBefore || nextBefore >= before)) {
        context.hasMoreBefore = false;
        return false;
      }
      context.events = compactTimelineEvents(mergeCanonicalEvents([...older, ...context.events]));
      if (nextBefore) context.beforeId = nextBefore;
      context.hasMoreBefore = Boolean(page.page?.hasMoreBefore && nextBefore);
      return older.length > 0;
    } catch (error) {
      if (error instanceof StaleResponseError || !this.isCurrent(context, generation)) return false;
      context.error = errorMessage(error);
      return false;
    } finally {
      if (this.isCurrent(context, generation)) {
        context.loadingOlder = false;
        this.emit();
      }
    }
  }

  async expandRange(start: number, end: number): Promise<void> {
    const context = this.activeContext();
    if (!context || start <= 0 || end < start) return;
    const generation = context.generation;
    let after = start - 1;
    let events: AgentEvent[] = [];
    try {
      while (after < end) {
        const query = `start=${start}&end=${end}&after=${after}&limit=${PAGE_LIMIT}`;
        const page = await this.api.latest<EventPage>(eventsPath(context, query), { scope: requestScope(context, `range:${start}:${end}`) });
        if (!this.isCurrent(context, generation)) return;
        const batch = normalizeEvents(page.events).filter((event) => this.eventBelongsToContext(context, event));
        events = mergeCanonicalEvents([...events, ...batch]);
        const next = Number(page.page?.nextAfter) || latestEventId(batch);
        if (!page.page?.hasMore || !next || next <= after) break;
        after = next;
      }
      if (!this.isCurrent(context, generation)) return;
      context.events = compactTimelineEvents(mergeCanonicalEvents([...context.events, ...events]));
      this.emit();
    } catch (error) {
      if (error instanceof StaleResponseError || !this.isCurrent(context, generation)) return;
      context.error = errorMessage(error);
      this.emit();
    }
  }

  snapshot(): ChatContextSnapshot {
    const context = this.activeContext();
    if (!context) return emptySnapshot();
    return {
      identity: context.key,
      workspaceId: context.workspaceId,
      runId: context.runId,
      events: context.events.filter((event) => !HIDDEN_EVENT_TYPES.has(event.type)),
      notices: [...context.notices],
      hasMoreBefore: context.hasMoreBefore,
      loading: context.loading,
      loadingOlder: context.loadingOlder,
      loaded: context.loaded,
      error: context.error,
    };
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    for (const context of this.contexts.values()) this.deactivate(context);
    this.api.dispose();
    this.contexts.clear();
    this.listeners.clear();
    this.activeKey = "";
  }

  private createContext(workspaceId: string, runId: string): ChatContext {
    const context: ChatContext = {
      key: contextKey(workspaceId, runId), workspaceId, runId, acceptedSessionIds: new Set([runId]), run: null,
      generation: 1, streamGeneration: 0, events: [], notices: [], beforeId: 0, latestEventId: 0, historyMode: "turns",
      hasMoreBefore: false, loading: false, loadingOlder: false, loaded: false, error: "", stream: null,
      pendingEvents: [], flushTimer: null,
    };
    this.contexts.set(context.key, context);
    return context;
  }

  private async loadInitial(context: ChatContext): Promise<void> {
    const generation = context.generation;
    context.loading = true;
    context.error = "";
    this.emit();
    try {
      const page = await this.api.latest<TurnPage>(turnsPath(context, `latest=true&limit=${PAGE_LIMIT}`), {
        scope: requestScope(context, "initial"),
      });
      if (!this.isCurrent(context, generation)) return;
      if (Array.isArray(page.turns)) {
        const turns = normalizeTurns(page.turns);
        context.historyMode = "turns";
        context.events = compactTimelineEvents(mergeCanonicalEvents(turns.flatMap(turnEvents)));
        context.beforeId = oldestTurnCursor(turns);
        context.hasMoreBefore = Boolean(page.page?.hasMoreBefore && context.beforeId);
        context.latestEventId = Math.max(0, Number(page.latestEventId) || 0);
        const open = turns.at(-1);
        if (open && !open.closed) {
          const liveEvents = await this.loadTurnRange(context, open, generation);
          if (!this.isCurrent(context, generation)) return;
          context.events = replaceTurnEvents(context.events, open.id, liveEvents);
        }
        context.loaded = true;
        this.connect(context);
        return;
      }
      // Keep rolling upgrades usable if the proxy still returns the former
      // Event page while AgentHub and Forge are being updated independently.
      context.historyMode = "events";
      const events = normalizeEvents(page.events).filter((event) => this.eventBelongsToContext(context, event));
      context.events = compactTimelineEvents(mergeCanonicalEvents(events));
      context.beforeId = oldestEventId(events);
      context.latestEventId = latestEventId(events);
      context.hasMoreBefore = Boolean(page.page?.hasMoreBefore && context.beforeId);
      context.loaded = true;
      this.connect(context);
    } catch (error) {
      if (error instanceof StaleResponseError || !this.isCurrent(context, generation)) return;
      context.error = errorMessage(error);
    } finally {
      if (this.isCurrent(context, generation)) {
        context.loading = false;
        this.emit();
      }
    }
  }

  private connect(context: ChatContext): void {
    if (!this.isActive(context) || context.stream || !isLiveRun(context.run)) return;
    const after = Math.max(context.latestEventId, latestEventId(context.events));
    const query = after ? `?after=${encodeURIComponent(after)}` : "";
    const streamGeneration = ++context.streamGeneration;
    const stream = this.eventSourceFactory(`/api/workspaces/${encodeURIComponent(context.workspaceId)}/agent/runs/${encodeURIComponent(context.runId)}/stream${query}`);
    context.stream = stream;
    stream.onmessage = (message) => {
      if (!this.isActiveStream(context, stream, streamGeneration)) return;
      try {
        const event = JSON.parse(message.data) as AgentEvent;
        if (!this.eventBelongsToContext(context, event)) return;
        context.latestEventId = Math.max(context.latestEventId, Number(event.id) || 0);
        context.pendingEvents.push(event);
        this.onEvent?.(context.workspaceId, context.runId, event);
        this.scheduleEventFlush(context);
        if (isTurnTerminal(event) && event.turnId) void this.compactClosedTurn(context, event.turnId, streamGeneration);
      } catch {
        context.error = "An Agent event could not be decoded.";
        this.emit();
      }
    };
    stream.addEventListener("forge.notice", (message) => {
      if (!this.isActiveStream(context, stream, streamGeneration)) return;
      try {
        const notice = JSON.parse((message as MessageEvent).data) as AgentNotice;
        if (!this.noticeBelongsToContext(context, notice)) return;
        this.flushEvents(context, false);
        this.appendNotice(context, notice);
        this.onNotice?.(context.workspaceId, context.runId, notice);
        this.emit();
      } catch {
        context.error = "A Forge notice could not be decoded.";
        this.emit();
      }
    });
    stream.onerror = () => {
      if (!this.isActiveStream(context, stream, streamGeneration)) {
        stream.close();
        return;
      }
      if (!isLiveRun(context.run)) {
        stream.close();
        context.stream = null;
      }
    };
  }

  private async loadTurnRange(context: ChatContext, turn: AgentTurn, generation: number): Promise<AgentEvent[]> {
    const start = Math.max(1, Number(turn.startEventId || turn.firstEventId) || 1);
    const end = Math.max(start, Number(turn.lastEventId || turn.endEventId) || 0, context.latestEventId);
    let after = start - 1;
    let events: AgentEvent[] = [];
    while (after < end) {
      const query = `start=${start}&end=${end}&after=${after}&limit=${PAGE_LIMIT}`;
      const page = await this.api.latest<EventPage>(eventsPath(context, query), { scope: requestScope(context, "live-turn") });
      if (!this.isCurrent(context, generation)) return [];
      const batch = normalizeEvents(page.events).filter((event) => this.eventBelongsToContext(context, event));
      events = mergeCanonicalEvents([...events, ...batch]);
      const next = Number(page.page?.nextAfter) || latestEventId(batch);
      if (!page.page?.hasMore || !next || next <= after) break;
      after = next;
    }
    const ordered = mergeCanonicalEvents(events);
    for (let index = 0; index < ordered.length; index++) {
      const expected = start + index;
      if (Number(ordered[index].id) !== expected) throw new Error(`Agent event history has a gap at ${expected}.`);
    }
    if (latestEventId(ordered) !== end) throw new Error(`Agent event history stopped before durable event ${end}.`);
    return ordered;
  }

  private async compactClosedTurn(context: ChatContext, turnId: string, streamGeneration: number): Promise<void> {
    this.flushEvents(context, false);
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const result = await this.api.latest<SingleTurnPage>(turnPath(context, turnId), { scope: requestScope(context, `turn:${turnId}`) });
        if (!context.stream || !this.isActiveStream(context, context.stream, streamGeneration)) return;
        if (!result.turn?.closed) throw new Error("Turn projection is not closed yet");
        context.pendingEvents = context.pendingEvents.filter((event) => event.turnId !== turnId);
        context.events = replaceTurnEvents(context.events, turnId, turnEvents(result.turn));
        context.latestEventId = Math.max(context.latestEventId, Number(result.latestEventId) || 0);
        this.emit();
        return;
      } catch (error) {
        if (!this.isActive(context)) return;
        if (attempt === 2) {
          context.error = errorMessage(error);
          this.emit();
          return;
        }
        await delay(50 * (attempt + 1));
      }
    }
  }

  private appendNotice(context: ChatContext, notice: AgentNotice): void {
    if (context.notices.some((candidate) => noticeIdentity(candidate) === noticeIdentity(notice))) return;
    context.notices.push(notice);
    if (context.notices.length > 20) context.notices.splice(0, context.notices.length - 20);
  }

  private scheduleEventFlush(context: ChatContext): void {
    if (context.flushTimer) return;
    context.flushTimer = setTimeout(() => {
      context.flushTimer = null;
      if (!this.isActive(context)) return;
      this.flushEvents(context, true);
    }, this.streamBatchWindowMs);
  }

  private flushEvents(context: ChatContext, publish: boolean): void {
    if (!context.pendingEvents.length) return;
    const pending = context.pendingEvents;
    context.pendingEvents = [];
    context.events = compactTimelineEvents(mergeCanonicalEventBatch(context.events, pending));
    if (publish && this.isActive(context)) this.emit();
  }

  private deactivate(context?: ChatContext): void {
    if (!context) return;
    if (context.flushTimer) clearTimeout(context.flushTimer);
    context.flushTimer = null;
    this.flushEvents(context, false);
    context.generation++;
    context.streamGeneration++;
    context.stream?.close();
    context.stream = null;
    context.loading = false;
    context.loadingOlder = false;
    this.api.requests.abort(requestScope(context, "initial"));
    this.api.requests.abort(requestScope(context, "older"));
    this.api.requests.abort(requestScope(context, "live-turn"));
  }

  private eventBelongsToContext(context: ChatContext, event: AgentEvent): boolean {
    const sessionId = String(event.sessionId || "").trim();
    return !sessionId || context.acceptedSessionIds.has(sessionId);
  }

  private noticeBelongsToContext(context: ChatContext, notice: AgentNotice): boolean {
    if (notice.source && notice.source !== "forge") return false;
    const runId = String(notice.data?.runId || "").trim();
    return !runId || runId === context.runId;
  }

  private isCurrent(context: ChatContext, generation: number): boolean {
    return !this.disposed && this.isActive(context) && context.generation === generation;
  }

  private isActive(context: ChatContext): boolean {
    return this.activeKey === context.key;
  }

  private isActiveStream(context: ChatContext, stream: EventSource, generation: number): boolean {
    return !this.disposed && this.isActive(context) && context.stream === stream && context.streamGeneration === generation;
  }

  private activeContext(): ChatContext | undefined {
    return this.activeKey ? this.contexts.get(this.activeKey) : undefined;
  }

  private emit(): void {
    const snapshot = this.snapshot();
    for (const listener of this.listeners) listener(snapshot);
  }
}

function normalizeEvents(events?: AgentEvent[]): AgentEvent[] {
  return Array.isArray(events) ? events.filter((event) => Number(event?.id) > 0) : [];
}

function normalizeTurns(turns?: AgentTurn[]): AgentTurn[] {
  return Array.isArray(turns) ? turns.filter((turn) => Boolean(turn?.id) && Number(turn.firstEventId || turn.startEventId) > 0) : [];
}

function turnEvents(turn: AgentTurn): AgentEvent[] {
  const turnId = String(turn.turnId || turn.id);
  return (Array.isArray(turn.items) ? turn.items : []).flatMap((item) => turnItemEvents(turnId, item));
}

function turnItemEvents(turnId: string, item: AgentTurnItem): AgentEvent[] {
  const id = Number(item.startEventId) || 0;
  if (!id) return [];
  const time = item.endedAt || item.startedAt;
  const startTime = item.startedAt;
  const base = { id, time, startTime, turnId };
  const data = item.data && typeof item.data === "object" ? item.data : {};
  switch (item.type) {
    case "message":
      if (["assistant", "agent"].includes(String(item.role || ""))) {
        return [{ ...base, type: "message.assistant.delta", data: { text: item.text || "" } }];
      }
      return [{ ...base, type: "message.input", data: { role: item.role || "user", sender: item.sender, steer: item.steer === true, text: item.text || "" } }];
    case "thinking": {
      const count = Math.max(1, Number(item.count) || 1);
      const duration = Math.max(0, Number(item.durationMs) || 0);
      return [{ ...base, type: "message.reasoning.delta", data: { text: `Reasoning details omitted from compact history · ${count} update${count === 1 ? "" : "s"}${duration ? ` · ${duration} ms` : ""}`, compactRange: { start: id, end: Number(item.endEventId) || id } } }];
    }
    case "tool": {
      const count = Math.max(1, Number(item.count) || 1);
      return [{ ...base, type: "tool.event", data: { method: "turn/compact", compactRange: { start: id, end: Number(item.endEventId) || id }, raw: { update: { sessionUpdate: "tool_call", toolCallId: `compact:${turnId}:${id}`, kind: "tool", status: "completed", title: `${count} tool call${count === 1 ? "" : "s"} · details omitted` } } } }];
    }
    case "approval":
      return [{ ...base, type: typeof data.decision === "string" ? "approval.resolved" : "approval.requested", data }];
    case "error":
      return [{ ...base, type: "provider.error", data: { ...data, message: item.text || data.message } }];
    case "lifecycle":
      return item.text ? [{ ...base, type: item.text, data }] : [];
    case "unknown":
      return [{ ...base, type: item.text || "unknown", data }];
    default:
      return [{ ...base, type: item.type || "turn.item", data }];
  }
}

function replaceTurnEvents(events: AgentEvent[], turnId: string, replacement: AgentEvent[]): AgentEvent[] {
  return compactTimelineEvents(mergeCanonicalEvents([...events.filter((event) => event.turnId !== turnId), ...replacement]));
}

function contextKey(workspaceId: string, runId: string): string {
  return workspaceId && runId ? `${workspaceId}:${runId}` : "";
}

function requestScope(context: ChatContext, kind: string): string {
  return `chat:${context.key}:${kind}`;
}

function eventsPath(context: ChatContext, query: string): string {
  return `/api/workspaces/${encodeURIComponent(context.workspaceId)}/agent/runs/${encodeURIComponent(context.runId)}/events?${query}`;
}

function turnsPath(context: ChatContext, query: string): string {
  return `/api/workspaces/${encodeURIComponent(context.workspaceId)}/agent/runs/${encodeURIComponent(context.runId)}/turns?${query}`;
}

function turnPath(context: ChatContext, turnId: string): string {
  return `/api/workspaces/${encodeURIComponent(context.workspaceId)}/agent/runs/${encodeURIComponent(context.runId)}/turns/${encodeURIComponent(turnId)}`;
}

function oldestEventId(events: AgentEvent[]): number {
  return events.reduce((oldest, event) => {
    const id = Number(event.id) || 0;
    return id && (!oldest || id < oldest) ? id : oldest;
  }, 0);
}

function oldestTurnCursor(turns: AgentTurn[]): number {
  return turns.reduce((oldest, turn) => {
    const id = Number(turn.firstEventId || turn.startEventId) || 0;
    return id && (!oldest || id < oldest) ? id : oldest;
  }, 0);
}

function latestEventId(events: AgentEvent[]): number {
  return events.reduce((latest, event) => Math.max(latest, Number(event.id) || 0), 0);
}

function sessionIdentities(run: AgentRun | null): Set<string> {
  return new Set([run?.id, run?.agentHubSessionId, run?.sourceExternalId].map((value) => String(value || "").trim()).filter(Boolean));
}

function isLiveRun(run: AgentRun | null): boolean {
  return ["starting", "running", "waiting_approval", "idle", "stopping", "recovering"].includes(String(run?.status || ""));
}

function isTurnTerminal(event: AgentEvent): boolean {
  return ["turn.completed", "turn.failed", "turn.cancelled"].includes(event.type);
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function noticeIdentity(notice: AgentNotice): string {
  const data = notice.data || {};
  return [notice.type, data.method, data.kind, data.lifecycle, data.runId, data.text].map((value) => String(value ?? "")).join(":");
}

function emptySnapshot(): ChatContextSnapshot {
  return { identity: "", workspaceId: "", runId: "", events: [], notices: [], hasMoreBefore: false, loading: false, loadingOlder: false, loaded: false, error: "" };
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
