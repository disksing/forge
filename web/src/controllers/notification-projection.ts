import { normalizeNotificationRecord } from "./notification-store";
import type { NotificationEvent, NotificationRecord, NotificationResource, NotificationSource } from "./notification-types";

export interface SelfDrivingNotificationContext {
  isSelfDriving: boolean;
  state: string;
  final: boolean;
  suppressed: boolean;
  disabledControl: boolean;
}

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

export function notificationResourceIdFor(item: NotificationSource, navigationTarget: (item: NotificationSource) => { primaryResourceId?: string }): string {
  if (item.source === "internal" || item.source === "external") return navigationTarget(item).primaryResourceId || "";
  if (item.resourceId) return String(item.resourceId).trim();
  if (item.controls?.length === 1) return String(item.controls[0]?.resourceId || "").trim();
  return "";
}

export function notificationEventState(event: NotificationEvent): string {
  if (event.type === "turn.failed") return "failed";
  if (event.type === "turn.cancelled") return "cancelled";
  if (event.type === "turn.completed") return "completed";
  return "";
}

export function notificationSelfDrivingContext(item: NotificationSource, resource: NotificationResource | null | undefined): SelfDrivingNotificationContext {
  const revision = Number(item.selfDrivingRevision) || 0;
  if (!(Boolean(item.schedulerTurn) || revision > 0)) return { isSelfDriving: false, state: "", final: false, suppressed: false, disabledControl: false };
  const selfDriving = resource?.selfDriving;
  const state = String(selfDriving?.condition || "disabled").trim().toLowerCase();
  const completed = !selfDriving?.enabled && selfDriving?.lastOutcome?.status === "completed";
  const requiresAttention = Boolean(selfDriving?.enabled) && ["blocked", "error", "needs_configuration"].includes(state);
  const disabledControl = !selfDriving?.enabled && !completed;
  const final = completed || requiresAttention;
  return { isSelfDriving: true, state, final, suppressed: !final, disabledControl };
}

export function createNotificationRecord(item: NotificationSource, context: {
  workspaceId: string;
  marker: string;
  completionState?: string;
  navigationTarget(item: NotificationSource): { primaryResourceId?: string };
  findResource(id: string): NotificationResource | null | undefined;
  now?: () => number;
}): NotificationRecord | null {
  const resourceId = notificationResourceIdFor(item, context.navigationTarget);
  const resource = context.findResource(resourceId);
  const selfDriving = notificationSelfDrivingContext(item, resource);
  return normalizeNotificationRecord({
    workspaceId: context.workspaceId,
    sessionId: notificationSessionIdFor(item),
    runId: String(item.runId || item.agentRunId || item.id || "").trim(),
    resourceId,
    marker: context.marker,
    completionState: context.completionState || item.completionState || "completed",
    selfDriving: selfDriving.isSelfDriving,
    selfDrivingState: selfDriving.state,
    title: resource?.title || item.title || item.id || "Session",
    resourceType: resource?.type || "",
    resourceTitle: resource?.title || "",
    at: context.now?.() ?? Date.now(),
  });
}
