import { normalizeNotificationRecord } from "./notification-store";
import type { NotificationEvent, NotificationRecord, NotificationResource, NotificationSource } from "./notification-types";

export function notificationMarkerFor(item: NotificationSource): string {
  const explicit = String(item.completionMarker || "").trim();
  if (explicit) return explicit;
  const generationId = String(item.generationId || "").trim();
  const eventId = Number(item.completionEventId) || 0;
  return generationId && eventId > 0 ? `${generationId}:${eventId}` : "";
}

export function notificationGenerationIdFor(item: NotificationSource): string {
  return String(item.generationId || item.id || "").trim();
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
  findResource(id: string): NotificationResource | null | undefined;
  now?: () => number;
}): NotificationRecord | null {
  const resourceId = String(item.resourceId || "").trim();
  const resource = context.findResource(resourceId);
  const generationId = notificationGenerationIdFor(item);
  if (!resourceId || !generationId) return null;
  return normalizeNotificationRecord({
    workspaceId: context.workspaceId,
    generationId,
    resourceId,
    marker: context.marker,
    completionState: context.completionState || item.completionState || "completed",
    title: resource?.title || item.title || generationId,
    resourceType: resource?.type || "",
    resourceTitle: resource?.title || "",
    at: context.now?.() ?? Date.now(),
  });
}
