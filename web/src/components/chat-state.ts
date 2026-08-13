import { ApiClient, StaleResponseError } from "../api/client";
import type {
  AgentEvent, AgentNotice, AgentTurnItem, ChatContextSnapshot, ConversationBlock,
  ResourceHistoryGeneration, ResourceHistoryPage, ResourceHistorySegment,
  ResourceHistoryTurnDetail, ResourceHistoryTurnSummary, ResourceMessageStatus, TimelineItem,
} from "./models";
import { compactTimelineEvents, mergeCanonicalEventBatch, mergeCanonicalEvents } from "./timeline-events";

const HISTORY_LIMIT = 20;
const EVENT_LIMIT = 250;
const STREAM_BATCH_WINDOW_MS = 80;
const HIDDEN_EVENT_TYPES = new Set(["session.launch-environment"]);

type EventSourceFactory = (url: string) => EventSource;
type SnapshotListener = (snapshot: ChatContextSnapshot) => void;

interface EventPage {
  events?: AgentEvent[];
  page?: { hasMore?: boolean; nextAfter?: number };
}

interface ResourceChatContext {
  key: string;
  workspaceId: string;
  resourceId: string;
  status: ResourceMessageStatus | null;
  generationId: string;
  requestGeneration: number;
  streamGeneration: number;
  segments: Map<string, ResourceHistorySegment>;
  details: Map<string, ResourceHistoryTurnDetail>;
  detailLoading: Set<string>;
  detailErrors: Map<string, string>;
  liveEvents: Map<string, AgentEvent[]>;
  orphanEvents: Map<string, AgentEvent[]>;
  notices: AgentNotice[];
  nextCursor: string;
  hasMoreBefore: boolean;
  loading: boolean;
  loadingOlder: boolean;
  loaded: boolean;
  error: string;
  stream: EventSource | null;
  pendingEvents: AgentEvent[];
  headRefreshing: boolean;
  terminalMaterializing: Set<string>;
  flushTimer: ReturnType<typeof setTimeout> | null;
}

export interface ChatSessionControllerOptions {
  api?: ApiClient;
  eventSourceFactory?: EventSourceFactory;
  onEvent?: (workspaceId: string, resourceId: string, event: AgentEvent) => void;
  onNotice?: (workspaceId: string, resourceId: string, notice: AgentNotice) => void;
  streamBatchWindowMs?: number;
}

// The public name is retained to avoid churn in embedders. Its identity and
// transport are resource-scoped; AgentHub Sessions are an implementation detail.
export class ChatSessionController {
  private readonly api: ApiClient;
  private readonly eventSourceFactory: EventSourceFactory;
  private readonly contexts = new Map<string, ResourceChatContext>();
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

  activate(workspaceId: string, resourceId: string, status: ResourceMessageStatus | null): void {
    if (this.disposed) return;
    const nextKey = contextKey(workspaceId, resourceId);
    const contextChanged = this.activeKey !== nextKey;
    if (this.activeKey && contextChanged) this.deactivate(this.contexts.get(this.activeKey));
    this.activeKey = nextKey;
    if (!nextKey) {
      this.emit();
      return;
    }
    const context = this.contexts.get(nextKey) ?? this.createContext(workspaceId, resourceId);
    const nextGeneration = String(status?.generation?.generationId || "");
    const generationChanged = Boolean(context.generationId && nextGeneration && context.generationId !== nextGeneration);
    context.status = status;
    context.generationId = nextGeneration;
    if (generationChanged) {
      this.closeStream(context);
      context.loaded = false;
      context.nextCursor = "";
      context.hasMoreBefore = false;
      void this.loadInitial(context);
    } else if (!context.loaded && !context.loading) {
      void this.loadInitial(context);
    } else {
      this.connect(context);
    }
    if (contextChanged || generationChanged) this.emit();
  }

  async loadOlder(): Promise<boolean> {
    const context = this.activeContext();
    if (!context || context.loadingOlder || !context.hasMoreBefore || !context.nextCursor) return false;
    const generation = context.requestGeneration;
    const cursor = context.nextCursor;
    context.loadingOlder = true;
    context.error = "";
    this.emit();
    try {
      const page = await this.api.latest<ResourceHistoryPage>(historyPath(context, cursor), { scope: requestScope(context, "older") });
      if (!this.isCurrent(context, generation)) return false;
      this.mergePage(context, page);
      return page.segments.some((segment) => segment.turns?.length || segment.gap);
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

  retryHistory(): void {
    const context = this.activeContext();
    if (!context || context.loading) return;
    context.loaded = false;
    context.nextCursor = "";
    context.hasMoreBefore = false;
    void this.loadInitial(context);
  }

  async loadTurn(reference: string): Promise<void> {
    const context = this.activeContext();
    if (!context || !reference || context.details.has(reference) || context.detailLoading.has(reference)) return;
    const summary = this.findTurn(context, reference);
    if (!summary) return;
    const generation = context.requestGeneration;
    context.detailLoading.add(reference);
    context.detailErrors.delete(reference);
    this.emit();
    try {
      const detail = await this.api.latest<ResourceHistoryTurnDetail>(turnPath(context, reference), { scope: requestScope(context, `turn:${reference}`) });
      if (!this.isCurrent(context, generation)) return;
      context.details.set(reference, detail);
      if (!detail.turn.closed && detail.turn.generation.generationId === context.generationId) {
        const events = await this.loadTurnRange(context, detail, generation);
        if (!this.isCurrent(context, generation)) return;
        context.liveEvents.set(reference, events);
      }
      this.connect(context);
    } catch (error) {
      if (error instanceof StaleResponseError || !this.isCurrent(context, generation)) return;
      context.detailErrors.set(reference, errorMessage(error));
    } finally {
      if (this.isCurrent(context, generation)) {
        context.detailLoading.delete(reference);
        this.emit();
      }
    }
  }

  async expandRange(generationId: string, start: number, end: number): Promise<void> {
    const context = this.activeContext();
    if (!context || generationId !== context.generationId || start <= 0 || end < start) return;
    const generation = context.requestGeneration;
    const events = await this.fetchEventRange(context, start, end, generation, `range:${start}:${end}`);
    if (!this.isCurrent(context, generation)) return;
    const reference = this.turnReferenceForEvent(context, generationId, start);
    if (!reference) return;
    context.liveEvents.set(reference, compactTimelineEvents(mergeCanonicalEvents([...(context.liveEvents.get(reference) || []), ...events])));
    this.emit();
  }

  snapshot(): ChatContextSnapshot {
    const context = this.activeContext();
    if (!context) return emptySnapshot();
    return {
      identity: context.key,
      workspaceId: context.workspaceId,
      resourceId: context.resourceId,
      generationId: context.generationId,
      blocks: this.blocks(context),
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

  private createContext(workspaceId: string, resourceId: string): ResourceChatContext {
    const context: ResourceChatContext = {
      key: contextKey(workspaceId, resourceId), workspaceId, resourceId, status: null, generationId: "",
      requestGeneration: 1, streamGeneration: 0, segments: new Map(), details: new Map(), detailLoading: new Set(),
      detailErrors: new Map(), liveEvents: new Map(), orphanEvents: new Map(), notices: [], nextCursor: "", hasMoreBefore: false,
      loading: false, loadingOlder: false, loaded: false, error: "", stream: null, pendingEvents: [], headRefreshing: false,
      terminalMaterializing: new Set(), flushTimer: null,
    };
    this.contexts.set(context.key, context);
    return context;
  }

  private async loadInitial(context: ResourceChatContext): Promise<void> {
    if (context.loading) return;
    const generation = context.requestGeneration;
    context.loading = true;
    context.error = "";
    this.emit();
    try {
      const page = await this.api.latest<ResourceHistoryPage>(historyPath(context), { scope: requestScope(context, "initial") });
      if (!this.isCurrent(context, generation)) return;
      context.segments.clear();
      context.details.clear();
      context.detailErrors.clear();
      context.liveEvents.clear();
      context.orphanEvents.clear();
      this.mergePage(context, page);
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

  private mergePage(context: ResourceChatContext, page: ResourceHistoryPage): void {
    for (const incoming of page.segments || []) {
      const id = incoming.generation.generationId;
      const existing = context.segments.get(id);
      if (!existing) {
        context.segments.set(id, { ...incoming, turns: [...(incoming.turns || [])] });
        continue;
      }
      const turns = new Map(existing.turns.map((turn) => [turn.reference, turn]));
      for (const turn of incoming.turns || []) turns.set(turn.reference, turn);
      existing.turns = [...turns.values()].sort((left, right) => left.startEventId - right.startEventId);
      existing.generation = incoming.generation;
      existing.gap = incoming.gap || existing.gap;
    }
    for (const segment of page.segments || []) for (const turn of segment.turns || []) {
      const orphan = context.orphanEvents.get(turn.turnId);
      if (!orphan) continue;
      context.liveEvents.set(turn.reference, compactTimelineEvents(mergeCanonicalEvents([...(context.liveEvents.get(turn.reference) || []), ...orphan])));
      context.orphanEvents.delete(turn.turnId);
    }
    context.nextCursor = String(page.page?.nextCursor || "");
    context.hasMoreBefore = Boolean(page.page?.hasMore && context.nextCursor);
  }

  private blocks(context: ResourceChatContext): ConversationBlock[] {
    const blocks: ConversationBlock[] = [];
    const segments = [...context.segments.values()].sort((left, right) => left.generation.generation - right.generation.generation);
    const currentGeneration = segments.find((segment) => segment.generation.generationId === context.generationId)?.generation || statusGeneration(context);
    const orphanBlocks = currentGeneration ? this.orphanEventBlocks(context, currentGeneration) : [];
    for (const segment of segments) {
      if (segment.gap) {
        blocks.push({ kind: "gap", key: `gap:${segment.generation.generationId}`, generation: segment.generation, gap: segment.gap });
        continue;
      }
      const generationBlocks: ConversationBlock[] = [];
      for (const turn of [...(segment.turns || [])].sort((left, right) => left.startEventId - right.startEventId)) {
        const detail = context.details.get(turn.reference);
        const raw = context.liveEvents.get(turn.reference);
        generationBlocks.push({
          kind: "turn", key: `${segment.generation.generationId}:${turn.turnId}`, generation: segment.generation, turn,
          items: detail && !raw ? compactTurnItems(detail, segment.generation.generationId) : undefined,
          events: raw?.filter((event) => !HIDDEN_EVENT_TYPES.has(event.type)),
          loading: context.detailLoading.has(turn.reference), error: context.detailErrors.get(turn.reference),
        });
      }
      if (segment.generation.generationId === context.generationId) generationBlocks.push(...orphanBlocks);
      generationBlocks.sort((left, right) => blockStartEventId(left) - blockStartEventId(right));
      blocks.push(...generationBlocks);
    }
    if (orphanBlocks.length && !segments.some((segment) => segment.generation.generationId === context.generationId)) blocks.push(...orphanBlocks);
    return blocks;
  }

  // orphanEventBlocks turns session-level events (session.created, provider
  // and state transitions carry no turnId) into conversation blocks placed by
  // their durable event id instead of always below every turn. Events are
  // grouped into contiguous id runs so startup notices stay above the first
  // turn while terminal notices stay after the last one.
  private orphanEventBlocks(context: ResourceChatContext, generation: ResourceHistoryGeneration): ConversationBlock[] {
    const blocks: ConversationBlock[] = [];
    for (const [turnId, events] of context.orphanEvents) {
      const visible = events.filter((event) => !HIDDEN_EVENT_TYPES.has(event.type));
      let run: AgentEvent[] = [];
      for (const event of visible) {
        if (run.length && Number(event.id) !== Number(run[run.length - 1].id) + 1) {
          blocks.push(orphanEventBlock(context, turnId, generation, run));
          run = [];
        }
        run.push(event);
      }
      if (run.length) blocks.push(orphanEventBlock(context, turnId, generation, run));
    }
    return blocks.sort((left, right) => blockStartEventId(left) - blockStartEventId(right));
  }

  private connect(context: ResourceChatContext): void {
    if (!this.isActive(context) || context.stream || !context.generationId || !isStreamable(context.status)) return;
    const after = currentGenerationHead(context);
    const query = new URLSearchParams({ generationId: context.generationId });
    if (after) query.set("after", String(after));
    const streamGeneration = ++context.streamGeneration;
    const stream = this.eventSourceFactory(`${resourceBase(context)}/stream?${query}`);
    context.stream = stream;
    stream.onmessage = (message) => {
      if (!this.isActiveStream(context, stream, streamGeneration)) return;
      try {
        const event = JSON.parse(message.data) as AgentEvent;
        if (!this.eventBelongsToContext(context, event)) return;
        context.pendingEvents.push(event);
        this.onEvent?.(context.workspaceId, context.resourceId, event);
        this.scheduleEventFlush(context);
        if (isTurnTerminal(event)) void this.materializeTerminalTurn(context, String(event.turnId || ""), streamGeneration);
      } catch {
        context.error = "An Agent event could not be decoded.";
        this.emit();
      }
    };
    stream.addEventListener("forge.notice", (message) => {
      if (!this.isActiveStream(context, stream, streamGeneration)) return;
      try {
        const notice = JSON.parse((message as MessageEvent).data) as AgentNotice;
        this.flushEvents(context, false);
        this.appendNotice(context, notice);
        this.onNotice?.(context.workspaceId, context.resourceId, notice);
        this.emit();
      } catch {
        context.error = "A Forge notice could not be decoded.";
        this.emit();
      }
    });
    stream.onerror = () => {
      if (!this.isActiveStream(context, stream, streamGeneration)) stream.close();
    };
  }

  private async loadTurnRange(context: ResourceChatContext, detail: ResourceHistoryTurnDetail, generation: number): Promise<AgentEvent[]> {
    const start = Math.max(1, Number(detail.turn.startEventId) || 1);
    const end = Math.max(start, Number(detail.turn.lastEventId) || 0, Number(detail.latestEventId) || 0);
    return this.fetchEventRange(context, start, end, generation, `live-turn:${detail.turn.reference}`);
  }

  private async fetchEventRange(context: ResourceChatContext, start: number, end: number, generation: number, scope: string): Promise<AgentEvent[]> {
    let after = start - 1;
    let events: AgentEvent[] = [];
    while (after < end) {
      const query = new URLSearchParams({ generationId: context.generationId, start: String(start), end: String(end), after: String(after), limit: String(EVENT_LIMIT) });
      const page = await this.api.latest<EventPage>(`${resourceBase(context)}/events?${query}`, { scope: requestScope(context, scope) });
      if (!this.isCurrent(context, generation)) return [];
      const batch = normalizeEvents(page.events).filter((event) => this.eventBelongsToContext(context, event));
      events = mergeCanonicalEvents([...events, ...batch]);
      const next = Number(page.page?.nextAfter) || latestEventId(batch);
      if (!page.page?.hasMore || !next || next <= after) break;
      after = next;
    }
    return events;
  }

  private async materializeTerminalTurn(context: ResourceChatContext, turnId: string, streamGeneration: number): Promise<void> {
    if (!turnId) return;
    const generationId = context.generationId;
    const materializationKey = `${generationId}:${turnId}`;
    if (context.terminalMaterializing.has(materializationKey)) return;
    context.terminalMaterializing.add(materializationKey);
    try {
      this.flushEvents(context, false);
      const existing = this.findTurnById(context, generationId, turnId);
      if (existing?.closed && context.details.has(existing.reference)) {
        context.liveEvents.delete(existing.reference);
        return;
      }
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const page = await this.api.latest<ResourceHistoryPage>(historyPath(context), { scope: requestScope(context, `terminal-head:${generationId}:${turnId}`) });
          if (!context.stream || !this.isActiveStream(context, context.stream, streamGeneration)) return;
          this.mergePage(context, page);
          const summary = this.findTurnById(context, generationId, turnId);
          if (!summary?.closed) throw new Error("Turn projection is not closed yet");
          const detail = await this.api.latest<ResourceHistoryTurnDetail>(turnPath(context, summary.reference), { scope: requestScope(context, `terminal:${generationId}:${turnId}`) });
          if (!context.stream || !this.isActiveStream(context, context.stream, streamGeneration)) return;
          // A repeated terminal frame may arrive while the history requests are
          // in flight. Fold it before replacing the raw live view with the
          // canonical compact detail so a later batch flush cannot regress it.
          this.flushEvents(context, false);
          context.details.set(summary.reference, detail);
          context.liveEvents.delete(summary.reference);
          this.emit();
          return;
        } catch (error) {
          if (error instanceof StaleResponseError) return;
          if (!context.stream || !this.isActiveStream(context, context.stream, streamGeneration)) return;
          if (attempt === 2) {
            context.error = errorMessage(error);
            this.emit();
            return;
          }
          await delay(50 * (attempt + 1));
        }
      }
    } finally {
      context.terminalMaterializing.delete(materializationKey);
    }
  }

  private async refreshHead(context: ResourceChatContext): Promise<void> {
    if (context.headRefreshing) return;
    context.headRefreshing = true;
    const generation = context.requestGeneration;
    try {
      const page = await this.api.latest<ResourceHistoryPage>(historyPath(context), { scope: requestScope(context, "stream-head") });
      if (this.isCurrent(context, generation)) {
        this.mergePage(context, page);
        this.emit();
      }
    } catch (_) {
      // The raw stream remains authoritative for the open Turn. A later event,
      // terminal materialization, or status refresh retries the summary head.
    } finally {
      context.headRefreshing = false;
    }
  }

  private findTurn(context: ResourceChatContext, reference: string): ResourceHistoryTurnSummary | undefined {
    return [...context.segments.values()].flatMap((segment) => segment.turns || []).find((turn) => turn.reference === reference);
  }

  private findTurnById(context: ResourceChatContext, generationId: string, turnId: string): ResourceHistoryTurnSummary | undefined {
    return [...context.segments.values()].flatMap((segment) => segment.turns || [])
      .find((turn) => turn.turnId === turnId && turn.generation.generationId === generationId);
  }

  private turnReferenceForEvent(context: ResourceChatContext, generationId: string, eventId: number): string {
    return [...context.segments.values()].filter((segment) => segment.generation.generationId === generationId)
      .flatMap((segment) => segment.turns || []).find((turn) => eventId >= turn.startEventId && eventId <= turn.lastEventId)?.reference || "";
  }

  // A streamed event of the open Turn usually arrives before the next history
  // refresh advances the summary's lastEventId, so the id range lookup misses
  // it. Falling back to the turnId keeps mid-turn events inside the existing
  // Turn block; otherwise every event bounces through a transient orphan block
  // that renders below the Turn and folds back on the next head refresh, which
  // makes the working indicator jitter on each tool call.
  private openTurnReferenceForEvent(context: ResourceChatContext, event: AgentEvent): string {
    const turnId = String(event.turnId || "");
    if (!turnId) return "";
    const summary = this.findTurnById(context, context.generationId, turnId);
    return summary && !summary.closed ? summary.reference : "";
  }

  private eventBelongsToContext(context: ResourceChatContext, event: AgentEvent): boolean {
    const sessionId = String(event.sessionId || "");
    return !sessionId || !context.status?.session?.id || sessionId === context.status.session.id;
  }

  private appendNotice(context: ResourceChatContext, notice: AgentNotice): void {
    if (context.notices.some((candidate) => noticeIdentity(candidate) === noticeIdentity(notice))) return;
    context.notices.push(notice);
    if (context.notices.length > 20) context.notices.splice(0, context.notices.length - 20);
  }

  private scheduleEventFlush(context: ResourceChatContext): void {
    if (context.flushTimer) return;
    context.flushTimer = setTimeout(() => {
      context.flushTimer = null;
      if (!this.isActive(context)) return;
      this.flushEvents(context, true);
    }, this.streamBatchWindowMs);
  }

  private flushEvents(context: ResourceChatContext, publish: boolean): void {
    if (!context.pendingEvents.length) return;
    const pending = context.pendingEvents;
    context.pendingEvents = [];
    for (const event of pending) {
      const reference = this.turnReferenceForEvent(context, context.generationId, Number(event.id)) || this.openTurnReferenceForEvent(context, event);
      if (reference) context.liveEvents.set(reference, compactTimelineEvents(mergeCanonicalEventBatch(context.liveEvents.get(reference) || [], [event])));
      else {
        const turnId = String(event.turnId || "current");
        context.orphanEvents.set(turnId, compactTimelineEvents(mergeCanonicalEventBatch(context.orphanEvents.get(turnId) || [], [event])));
        // Terminal events have a dedicated materialization path that retries
        // until the canonical Turn projection closes. Starting the generic
        // stream-head refresh as well only duplicates the same request.
        if (!isTurnTerminal(event)) void this.refreshHead(context);
      }
    }
    if (publish && this.isActive(context)) this.emit();
  }

  private closeStream(context: ResourceChatContext): void {
    context.streamGeneration++;
    context.stream?.close();
    context.stream = null;
  }

  private deactivate(context?: ResourceChatContext): void {
    if (!context) return;
    if (context.flushTimer) clearTimeout(context.flushTimer);
    context.flushTimer = null;
    this.flushEvents(context, false);
    context.requestGeneration++;
    this.closeStream(context);
    context.loading = false;
    context.loadingOlder = false;
    this.api.requests.abort(requestScope(context, "initial"));
    this.api.requests.abort(requestScope(context, "older"));
  }

  private isCurrent(context: ResourceChatContext, generation: number): boolean {
    return !this.disposed && this.isActive(context) && context.requestGeneration === generation;
  }

  private isActive(context: ResourceChatContext): boolean {
    return this.activeKey === context.key;
  }

  private isActiveStream(context: ResourceChatContext, stream: EventSource, generation: number): boolean {
    return !this.disposed && this.isActive(context) && context.stream === stream && context.streamGeneration === generation;
  }

  private activeContext(): ResourceChatContext | undefined {
    return this.activeKey ? this.contexts.get(this.activeKey) : undefined;
  }

  private emit(): void {
    const snapshot = this.snapshot();
    for (const listener of this.listeners) listener(snapshot);
  }
}

function compactTurnItems(detail: ResourceHistoryTurnDetail, generationId: string): TimelineItem[] {
  return (detail.items || []).flatMap((item) => compactTurnItem(item, generationId));
}

function compactTurnItem(item: AgentTurnItem, generationId: string): TimelineItem[] {
  const key = `${generationId}:${item.startEventId}:${item.type}`;
  const base = { key, time: item.endedAt || item.startedAt, startTime: item.startedAt, generationId };
  const data = item.data && typeof item.data === "object" ? item.data : {};
  switch (item.type) {
    case "message": return [{ ...base, kind: "message", role: item.role || "user", sender: item.sender, steer: item.steer, text: item.text || "" }];
    case "thinking": return [{ ...base, kind: "thinking", text: `Reasoning details omitted from compact history · ${Math.max(1, Number(item.count) || 1)} update(s)`, compact: true, rangeStartEventId: item.startEventId, rangeEndEventId: item.endEventId }];
    case "tool": return [{ ...base, kind: "tools", compact: true, rangeStartEventId: item.startEventId, rangeEndEventId: item.endEventId, calls: [{ key, callId: key, name: "Tool activity", summary: `${Math.max(1, Number(item.count) || 1)} call(s) · details omitted`, status: "completed" }] }];
    case "approval": return [{ ...base, kind: "approval", approvalId: String(data.requestId || data.approvalId || key), title: String(data.title || "Approval"), question: String(data.question || ""), status: String(data.status || (data.decision ? "resolved" : "pending")), decision: String(data.decision || "") }];
    case "error": return [{ ...base, kind: "error", text: item.text || String(data.message || "Provider error") }];
    case "lifecycle": return item.text ? [{ ...base, kind: "lifecycle", type: item.text, text: item.text }] : [];
    default: return [{ ...base, kind: "unknown", type: item.type, text: item.text || "" }];
  }
}

function contextKey(workspaceId: string, resourceId: string): string {
  return workspaceId && resourceId ? `${workspaceId}:${resourceId}` : "";
}

function orphanEventBlock(context: ResourceChatContext, turnId: string, generation: ResourceHistoryGeneration, events: AgentEvent[]): ConversationBlock {
  const firstEventId = events[0]?.id ?? 0;
  return { kind: "turn", key: `${context.generationId}:${turnId || "current"}:${firstEventId}`, generation, events };
}

function blockStartEventId(block: ConversationBlock): number {
  if (block.turn) return Number(block.turn.startEventId) || 0;
  const first = block.events?.[0];
  return first ? Number(first.id) || 0 : 0;
}

function requestScope(context: ResourceChatContext, kind: string): string {
  return `resource-chat:${context.key}:${kind}`;
}

function resourceBase(context: ResourceChatContext): string {
  return `/api/workspaces/${encodeURIComponent(context.workspaceId)}/resources/${encodeURIComponent(context.resourceId)}`;
}

function historyPath(context: ResourceChatContext, cursor = ""): string {
  const query = new URLSearchParams({ limit: String(HISTORY_LIMIT) });
  if (cursor) query.set("cursor", cursor);
  return `${resourceBase(context)}/history/turns?${query}`;
}

function turnPath(context: ResourceChatContext, reference: string): string {
  return `${resourceBase(context)}/history/turns/${encodeURIComponent(reference)}`;
}

function currentGenerationHead(context: ResourceChatContext): number {
  const summaries = [...context.segments.values()].filter((segment) => segment.generation.generationId === context.generationId).flatMap((segment) => segment.turns || []);
  const raw = [...context.liveEvents.values()].flat();
  return Math.max(0, ...summaries.map((turn) => Number(turn.lastEventId) || 0), ...raw.map((event) => Number(event.id) || 0));
}

function statusGeneration(context: ResourceChatContext): ResourceHistoryGeneration | null {
  const generation = context.status?.generation;
  if (!generation?.generationId) return null;
  return {
    generation: generation.generation,
    generationId: generation.generationId,
    title: "Current generation",
    status: generation.status,
    createdAt: "",
    updatedAt: "",
    agentName: context.status?.resolvedAgent,
    resolvedProfile: context.status?.resolvedProfile,
    replacementPending: generation.replacementPending,
  };
}

function normalizeEvents(events?: AgentEvent[]): AgentEvent[] {
  return Array.isArray(events) ? events.filter((event) => Number(event?.id) > 0) : [];
}

function latestEventId(events: AgentEvent[]): number {
  return events.reduce((latest, event) => Math.max(latest, Number(event.id) || 0), 0);
}

function isStreamable(status: ResourceMessageStatus | null): boolean {
  return Boolean(status?.generation?.generationId && status.session?.id && ["starting", "running", "waiting_approval", "idle", "stopping", "recovering"].includes(String(status.generation.status || "")));
}

function isTurnTerminal(event: AgentEvent): boolean {
  return ["turn.completed", "turn.failed", "turn.cancelled"].includes(event.type);
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function noticeIdentity(notice: AgentNotice): string {
  const data = notice.data || {};
  return [notice.type, data.method, data.kind, data.lifecycle, data.resourceId, data.text].map((value) => String(value ?? "")).join(":");
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function emptySnapshot(): ChatContextSnapshot {
  return { identity: "", workspaceId: "", resourceId: "", generationId: "", blocks: [], notices: [], hasMoreBefore: false, loading: false, loadingOlder: false, loaded: false, error: "" };
}
