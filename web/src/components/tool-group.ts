import type { TimelineItem } from "./models";

export function normalizeToolCallCount(value: unknown, fallback: number): number {
  const count = Number(value);
  if (Number.isFinite(count) && count > 0) return Math.floor(count);
  return Math.max(0, Math.floor(Number(fallback) || 0));
}

export function toolCallCount(item: TimelineItem): number {
  return item.compact
    ? normalizeToolCallCount(item.toolCallCount, item.calls?.length || 0)
    : item.calls?.length || 0;
}

export function formatToolCallCount(count: number): string {
  const normalized = normalizeToolCallCount(count, 0);
  return `${normalized} tool ${normalized === 1 ? "call" : "calls"}`;
}

export function toolGroupKey(item: TimelineItem): string {
  if (item.rangeStartEventId && item.rangeStartEventId > 0) return String(item.rangeStartEventId);
  return String(item.key ?? item.time ?? "tools");
}
