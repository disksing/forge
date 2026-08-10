import { ApiClient, StaleResponseError } from "../api/client";
import type { AgentEvent, AgentNotice, AgentRun, ChatContextSnapshot } from "./models";

const PAGE_LIMIT = 250;
const STREAM_BATCH_WINDOW_MS = 80;
const HIDDEN_EVENT_TYPES = new Set(["session.launch-environment"]);

type EventSourceFactory = (url: string) => EventSource;
type SnapshotListener = (snapshot: ChatContextSnapshot) => void;

interface EventPage {
  events?: AgentEvent[];
  page?: { hasMoreBefore?: boolean };
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
  noticeWatermarks: Map<string, number>;
  beforeId: number;
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
    const noticesChanged = this.reconcileNotices(context);
    if (!isLiveRun(run) && context.stream) {
      context.streamGeneration++;
      context.stream.close();
      context.stream = null;
    }
    if (contextChanged || noticesChanged) this.emit();
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
      const page = await this.api.latest<EventPage>(eventsPath(context, `before=${encodeURIComponent(before)}&limit=${PAGE_LIMIT}`), {
        scope: requestScope(context, "older"),
      });
      if (!this.isCurrent(context, generation)) return false;
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
      generation: 1, streamGeneration: 0, events: [], notices: [], noticeWatermarks: new Map(), beforeId: 0,
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
      const page = await this.api.latest<EventPage>(eventsPath(context, `latest=true&limit=${PAGE_LIMIT}`), {
        scope: requestScope(context, "initial"),
      });
      if (!this.isCurrent(context, generation)) return;
      const events = normalizeEvents(page.events).filter((event) => this.eventBelongsToContext(context, event));
      context.events = compactTimelineEvents(mergeCanonicalEvents(events));
      context.beforeId = oldestEventId(events);
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
    const after = latestEventId(context.events);
    const query = after ? `?after=${encodeURIComponent(after)}` : "";
    const streamGeneration = ++context.streamGeneration;
    const stream = this.eventSourceFactory(`/api/workspaces/${encodeURIComponent(context.workspaceId)}/agent/runs/${encodeURIComponent(context.runId)}/stream${query}`);
    context.stream = stream;
    stream.onmessage = (message) => {
      if (!this.isActiveStream(context, stream, streamGeneration)) return;
      try {
        const event = JSON.parse(message.data) as AgentEvent;
        if (!this.eventBelongsToContext(context, event)) return;
        context.pendingEvents.push(event);
        this.onEvent?.(context.workspaceId, context.runId, event);
        this.scheduleEventFlush(context);
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

  private appendNotice(context: ChatContext, notice: AgentNotice): void {
    const key = waitingNoticeKey(notice);
    if (key) {
      const sequence = Number(notice.data?.schedulerTurnSequence) || 0;
      const watermark = context.noticeWatermarks.get(key) || 0;
      if (watermark && sequence <= watermark) return;
      context.noticeWatermarks.set(key, Math.max(watermark, sequence));
      context.notices = context.notices.filter((candidate) => waitingNoticeKey(candidate) !== key);
    } else if (context.notices.some((candidate) => noticeIdentity(candidate) === noticeIdentity(notice))) {
      return;
    }
    context.notices.push(notice);
    if (context.notices.length > 20) context.notices.splice(0, context.notices.length - 20);
  }

  private reconcileNotices(context: ChatContext): boolean {
    const run = context.run;
    const previous = context.notices;
    const next = previous.filter((notice) => {
      if (!waitingNoticeKey(notice)) return true;
      const data = notice.data || {};
      if (!run || String(data.runId || "") !== run.id || String(data.resourceId || "") !== String(run.resourceId || "")) return false;
      if (Number(data.selfDrivingRevision) !== Number(run.selfDrivingRevision)) return false;
      const noticeSequence = Number(data.schedulerTurnSequence) || 0;
      const runSequence = Number(run.schedulerTurnSequence) || 0;
      if (runSequence > noticeSequence) return false;
      if (run.schedulerTurn && (!noticeSequence || runSequence >= noticeSequence)) return false;
      return true;
    });
    context.notices = next;
    return next.length !== previous.length || next.some((notice, index) => notice !== previous[index]);
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

export function mergeCanonicalEvents(events: AgentEvent[]): AgentEvent[] {
  const byId = new Map<number, AgentEvent>();
  for (const incoming of events) {
    const id = Number(incoming?.id) || 0;
    if (!id) continue;
    const existing = byId.get(id);
    byId.set(id, existing ? mergeEvent(existing, incoming) : normalizeAppendEvent(incoming));
  }
  return [...byId.values()].sort((left, right) => Number(left.id) - Number(right.id));
}

export function mergeCanonicalEvent(events: AgentEvent[], incoming: AgentEvent): AgentEvent[] {
  return mergeCanonicalEventBatch(events, [incoming]);
}

export function mergeCanonicalEventBatch(events: AgentEvent[], incomingEvents: AgentEvent[]): AgentEvent[] {
  if (!incomingEvents.length) return events;
  const next = [...events];
  for (const incoming of incomingEvents) mergeCanonicalEventInto(next, incoming);
  return next;
}

function mergeCanonicalEventInto(events: AgentEvent[], incoming: AgentEvent): void {
  const id = Number(incoming?.id) || 0;
  if (!id) return;
  let low = 0;
  let high = events.length;
  while (low < high) {
    const middle = (low + high) >>> 1;
    if (Number(events[middle].id) < id) low = middle + 1;
    else high = middle;
  }
  const index = low < events.length && Number(events[low].id) === id ? low : -1;
  if (index < 0) {
    events.splice(low, 0, normalizeAppendEvent(incoming));
    return;
  }
  events[index] = mergeEvent(events[index], incoming);
}

export function compactTimelineEvents(events: AgentEvent[]): AgentEvent[] {
  const compacted: AgentEvent[] = [];
  let toolUpdates = new Map<string, AgentEvent>();

  const flushToolUpdates = () => {
    if (!toolUpdates.size) return;
    compacted.push(...[...toolUpdates.values()].sort((left, right) => Number(left.id) - Number(right.id)));
    toolUpdates = new Map();
  };

  for (const event of events) {
    // ACP tool_call_update frames carry a cumulative snapshot rather than a
    // delta. Retain only the latest snapshot per call within an uninterrupted
    // update segment; a non-update event remains a hard ordering boundary.
    const callId = acpToolCallUpdateId(event);
    if (callId) {
      const previous = toolUpdates.get(callId);
      toolUpdates.set(callId, previous ? mergeACPToolCallUpdate(previous, event) : event);
      continue;
    }
    flushToolUpdates();
    compacted.push(event);
  }
  flushToolUpdates();
  return compacted;
}

function acpToolCallUpdateId(event: AgentEvent): string {
  if (event.type !== "tool.event") return "";
  const raw = objectValue(event.data?.raw);
  const update = raw.update && typeof raw.update === "object" && !Array.isArray(raw.update) ? objectValue(raw.update) : raw;
  if (update.sessionUpdate !== "tool_call_update") return "";
  return stringValue(update.toolCallId) || stringValue(update.id);
}

function mergeACPToolCallUpdate(previous: AgentEvent, incoming: AgentEvent): AgentEvent {
  const previousData = previous.data || {};
  const incomingData = incoming.data || {};
  const previousRaw = objectValue(previousData.raw);
  const incomingRaw = objectValue(incomingData.raw);
  const previousUpdate = previousRaw.update && typeof previousRaw.update === "object" && !Array.isArray(previousRaw.update) ? objectValue(previousRaw.update) : previousRaw;
  const incomingUpdate = incomingRaw.update && typeof incomingRaw.update === "object" && !Array.isArray(incomingRaw.update) ? objectValue(incomingRaw.update) : incomingRaw;
  return {
    ...previous,
    ...incoming,
    data: {
      ...previousData,
      ...incomingData,
      raw: {
        ...previousRaw,
        ...incomingRaw,
        update: { ...previousUpdate, ...incomingUpdate },
      },
    },
  };
}

function objectValue(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function mergeEvent(existing: AgentEvent, incoming: AgentEvent): AgentEvent {
  if (incoming.data?.append !== true) return { ...incoming, startTime: incoming.startTime || existing.startTime };
  const currentText = typeof existing.data?.text === "string" ? existing.data.text : "";
  const fragment = typeof incoming.data.text === "string" ? incoming.data.text : "";
  return {
    ...existing,
    ...incoming,
    startTime: incoming.startTime || existing.startTime,
    data: { ...existing.data, ...incoming.data, append: false, text: currentText + fragment },
  };
}

function normalizeAppendEvent(event: AgentEvent): AgentEvent {
  if (event.data?.append !== true) return event;
  return { ...event, data: { ...event.data, append: false } };
}

function normalizeEvents(events?: AgentEvent[]): AgentEvent[] {
  return Array.isArray(events) ? events.filter((event) => Number(event?.id) > 0) : [];
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

function oldestEventId(events: AgentEvent[]): number {
  return events.reduce((oldest, event) => {
    const id = Number(event.id) || 0;
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

function waitingNoticeKey(notice: AgentNotice): string {
  const data = notice.data || {};
  if (data.kind !== "self-driving-finish" || data.lifecycle !== "until-reconcile") return "";
  return [data.kind, data.runId, data.resourceId, data.selfDrivingRevision].map((value) => String(value ?? "")).join(":");
}

function noticeIdentity(notice: AgentNotice): string {
  const data = notice.data || {};
  return [notice.type, data.method, data.kind, data.lifecycle, data.runId, data.schedulerTurnSequence, data.text].map((value) => String(value ?? "")).join(":");
}

function emptySnapshot(): ChatContextSnapshot {
  return { identity: "", workspaceId: "", runId: "", events: [], notices: [], hasMoreBefore: false, loading: false, loadingOlder: false, loaded: false, error: "" };
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
