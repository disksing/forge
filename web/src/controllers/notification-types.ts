export interface NotificationSource {
  id?: string;
  source?: string;
  title?: string;
  resourceId?: string;
  runId?: string;
  agentRunId?: string;
  forgeSessionId?: string;
  sessionId?: string;
  agentHubSessionId?: string;
  completionSessionId?: string;
  completionMarker?: string;
  agentRunCompletionMarker?: string;
  completionState?: string;
  agentRunCompletionState?: string;
  completionEventId?: number;
}

export interface NotificationResource {
  id?: string;
  title?: string;
  type?: string;
}

export interface NotificationEvent {
  id: number;
  type: string;
  sessionId?: string;
}

export interface NotificationRecord {
  workspaceId: string;
  sessionId: string;
  runId: string;
  resourceId: string;
  marker: string;
  completionState: string;
  title: string;
  resourceType: string;
  resourceTitle: string;
  at: number;
}

export interface NotificationStore {
  version: number;
  seen: Array<{ marker: string; at: number }>;
  pending: NotificationRecord[];
  unread: NotificationRecord[];
  effects: Array<{ key: string; at: number }>;
}

export interface NotificationSettings {
  browser: boolean;
  sound: boolean;
}

export interface NotificationBroadcast {
  type?: "effect" | "record" | "clear-marker" | "clear-resource";
  workspaceId?: string;
  sourceTabId?: string;
  effectKey?: string;
  marker?: string;
  resourceId?: string;
  record?: unknown;
  at?: number;
}
