import { normalizeNotificationRecord } from "./notification-store";
import type { NotificationEvent, NotificationRecord, NotificationResource, NotificationSource } from "./notification-types";

export function notificationMarkerFor(item: NotificationSource): string {
  const explicit = String(item.completionMarker || item.agentRunCompletionMarker || "").trim();
  if (explicit) return explicit;
  const sessionId = String(item.agentHubSessionId || item.completionSessionId || "").trim();
  const eventId = Number(item.completionEventId) || 0;
  return sessionId && eventId > 0 ? `${sessionId}:${eventId}` : "";
}

export function notificationSessionIdFor(item: NotificationSource): string {
  return String(item.forgeSessionId || item.sessionId || item.agentHubSessionId || item.id || "").trim();
}

export function notificationResourceIdFor(item: NotificationSource, navigationTarget: (item: NotificationSource) => { resourceId?: string }): string {
  if (item.source === "internal" || item.source === "external") return navigationTarget(item).resourceId || "";
  if (item.resourceId) return String(item.resourceId).trim();
  return "";
}

export function notificationEventState(event: NotificationEvent): string {
  if (event.type === "turn.failed") return "failed";
  if (event.type === "turn.cancelled") return "cancelled";
  if (event.type === "turn.completed") return "completed";
  return "";
}

export function createNotificationRecord(item: NotificationSource, context: {
  workspaceId: string;
  marker: string;
  completionState?: string;
  navigationTarget(item: NotificationSource): { resourceId?: string };
  findResource(id: string): NotificationResource | null | undefined;
  now?: () => number;
}): NotificationRecord | null {
  const resourceId = notificationResourceIdFor(item, context.navigationTarget);
  const resource = context.findResource(resourceId);
  return normalizeNotificationRecord({
    workspaceId: context.workspaceId,
    sessionId: notificationSessionIdFor(item),
    runId: String(item.runId || item.agentRunId || item.id || "").trim(),
    resourceId,
    marker: context.marker,
    completionState: context.completionState || item.completionState || "completed",
    title: resource?.title || item.title || item.id || "Session",
    resourceType: resource?.type || "",
    resourceTitle: resource?.title || "",
    at: context.now?.() ?? Date.now(),
  });
}
