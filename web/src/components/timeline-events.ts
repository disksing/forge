import { buildTimeline } from "../../vendor/agenthub-event-timeline";

import type { AgentEvent, TimelineItem } from "./models";

const HIDDEN_CONVERSATION_EVENT_TYPES = new Set([
  "session.created",
  "session.provider",
  "session.launch-environment",
  "turn.started",
  "turn.completed",
]);

const HIDDEN_CONVERSATION_LIFECYCLE_TEXT = new Set([
  ...HIDDEN_CONVERSATION_EVENT_TYPES,
  "Session created",
  "Turn started",
  "Turn completed",
]);

export function visibleConversationTimelineItems(events: AgentEvent[], items: TimelineItem[]): TimelineItem[] {
  const hiddenKeys = new Set(
    events
      .filter((event) => HIDDEN_CONVERSATION_EVENT_TYPES.has(event.type))
      .map((event) => String(event.id)),
  );
  return items.filter((item) => item.key === undefined || !hiddenKeys.has(String(item.key)));
}

// projectConversationEvents turns canonical events into conversation timeline
// items, hiding routine lifecycle noise and annotating compact ranges so
// callers can lazily expand them. Shared by the live Chat timeline and the
// read-only History view.
export function projectConversationEvents(events: AgentEvent[]): TimelineItem[] {
  const sourceEvents = events || [];
  const items = visibleConversationTimelineItems(sourceEvents, buildTimeline(sourceEvents) as TimelineItem[]);
  const byID = new Map(sourceEvents.map((event) => [Number(event.id), event]));
  for (const item of items) {
    const event = byID.get(Number(item.key));
    const range = event?.data?.compactRange as { start?: number; end?: number } | undefined;
    if (!range) continue;
    item.compact = true;
    item.rangeStartEventId = Number(range.start) || Number(event?.id) || 0;
    item.rangeEndEventId = Number(range.end) || item.rangeStartEventId;
  }
  return items;
}

export function isHiddenConversationLifecycleText(value: string | undefined): boolean {
  const text = String(value || "");
  return HIDDEN_CONVERSATION_LIFECYCLE_TEXT.has(text) || text === "Agent connected" || text.startsWith("Agent connected ·");
}

// markTurnFinalAssistant annotates the assistant messages of a single turn's
// item list: the last assistant message is the turn's final reply
// (turnFinal=true) while earlier mid-turn progress updates get
// turnFinal=false, so the UI can mute their rail. Items of other roles pass
// through untouched. Blocks are already turn-scoped, so the last assistant
// message within a block is the turn's last message.
export function markTurnFinalAssistant(items: TimelineItem[]): TimelineItem[] {
  let lastAssistant = -1;
  for (let index = items.length - 1; index >= 0; index--) {
    if (items[index]?.kind === "message" && items[index]?.role === "assistant") {
      lastAssistant = index;
      break;
    }
  }
  return items.map((item, index) => {
    if (item.kind !== "message" || item.role !== "assistant") return item;
    const turnFinal = index === lastAssistant;
    return item.turnFinal === turnFinal ? item : { ...item, turnFinal };
  });
}

// markTurnAgentRuns annotates where the turn's bound agent starts talking.
// Reasoning and tool calls often precede the first assistant progress
// update; without this annotation the agent's name only rendered on the
// first message, visually attaching it to the progress update instead of
// the first event of the turn. The head of each uninterrupted run of
// agent-attributed activity (thinking, tools, approvals) gets agentStart
// and renders a header carrying the agent's name and the run's start time.
// Assistant messages belong to the run but always render their own meta
// row with the name and timestamp, so only non-message run heads carry the
// annotation. Runs break on user, system, and other-agent messages and on
// non-agent notices. Blocks are already turn-scoped, so runs never cross
// blocks.
export function markTurnAgentRuns(items: TimelineItem[]): TimelineItem[] {
  let inRun = false;
  return items.map((item) => {
    const attributed = item.kind === "activity" || item.kind === "thinking" || item.kind === "tools" || item.kind === "approval" ||
      (item.kind === "message" && item.role === "assistant");
    if (!attributed) {
      inRun = false;
      return item.agentStart ? { ...item, agentStart: false } : item;
    }
    const agentStart = !inRun && item.kind !== "message";
    inRun = true;
    return (item.agentStart ?? false) === agentStart ? item : { ...item, agentStart };
  });
}

// groupTimelineActivities is the compatibility seam between AgentHub Turn
// projection generations. Event-timeline v2 and new compact Turns already
// provide activity items; legacy compact Turns expose adjacent thinking/tool
// items. Grouping here gives both inputs the same one-level UI without
// rewriting old materialized history or requiring a canonical Event scan.
export function groupTimelineActivities(items: TimelineItem[]): TimelineItem[] {
  const grouped: TimelineItem[] = [];
  let run: TimelineItem[] = [];
  const flush = () => {
    if (!run.length) return;
    if (run.length === 1 && run[0].kind === "activity") grouped.push(run[0]);
    else grouped.push(activityFromRun(run));
    run = [];
  };
  for (const item of items) {
    if (item.kind === "activity" || item.kind === "thinking" || item.kind === "tools") run.push(item);
    else {
      flush();
      grouped.push(item);
    }
  }
  flush();
  return grouped;
}

function activityFromRun(run: TimelineItem[]): TimelineItem {
  const first = run[0];
  const last = run[run.length - 1];
  const children = run.flatMap((item) => item.kind === "activity" ? item.items || [] : [item]);
  const thinkingCount = run.reduce((total, item) => total + activityThinkingCount(item), 0);
  const reasoningUpdateCount = run.reduce((total, item) => total + activityReasoningUpdateCount(item), 0);
  const toolCallCount = run.reduce((total, item) => total + activityToolCallCount(item), 0);
  const starts = run.map((item) => Number(item.rangeStartEventId) || 0).filter((value) => value > 0);
  const ends = run.map((item) => Number(item.rangeEndEventId) || 0).filter((value) => value > 0);
  return {
    kind: "activity",
    key: first.key,
    generationId: first.generationId,
    items: children,
    time: last.time || first.time,
    startTime: first.startTime || first.time,
    active: run.some((item) => Boolean(item.active)) || children.some((item) => Boolean(item.active)),
    compact: run.some((item) => Boolean(item.compact)),
    rangeStartEventId: starts.length ? Math.min(...starts) : undefined,
    rangeEndEventId: ends.length ? Math.max(...ends) : undefined,
    thinkingCount,
    reasoningUpdateCount,
    toolCallCount,
  };
}

function activityThinkingCount(item: TimelineItem): number {
  if (item.kind === "thinking") return 1;
  if (item.kind !== "activity") return 0;
  if (item.thinkingCount !== undefined) return Math.max(0, Number(item.thinkingCount) || 0);
  return (item.items || []).filter((child) => child.kind === "thinking").length;
}

function activityReasoningUpdateCount(item: TimelineItem): number {
  if (item.kind === "thinking") return Math.max(1, Number(item.count) || 1);
  if (item.kind !== "activity") return 0;
  if (item.reasoningUpdateCount !== undefined) return Math.max(0, Number(item.reasoningUpdateCount) || 0);
  return (item.items || []).filter((child) => child.kind === "thinking").reduce((total, child) => total + Math.max(1, Number(child.count) || 1), 0);
}

function activityToolCallCount(item: TimelineItem): number {
  if (item.kind === "tools") return Math.max(0, Number(item.toolCallCount) || item.calls?.length || 0);
  if (item.kind !== "activity") return 0;
  if (item.toolCallCount !== undefined) return Math.max(0, Number(item.toolCallCount) || 0);
  return (item.items || []).filter((child) => child.kind === "tools").reduce((total, child) => total + Math.max(0, Number(child.toolCallCount) || child.calls?.length || 0), 0);
}

// formatClock renders the short wall-clock label shared by message meta
// rows and agent run headers.
export function formatClock(value?: string): string {
  const date = new Date(value || "");
  return Number.isNaN(date.valueOf()) ? "" : date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
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
