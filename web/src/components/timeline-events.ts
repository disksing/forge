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

export function isHiddenConversationLifecycleText(value: string | undefined): boolean {
  const text = String(value || "");
  return HIDDEN_CONVERSATION_LIFECYCLE_TEXT.has(text) || text === "Agent connected" || text.startsWith("Agent connected ·");
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
