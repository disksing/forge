export interface NotificationSource {
  id?: string;
  title?: string;
  resourceId?: string;
  generationId?: string;
  agentHubSessionId?: string;
  completionMarker?: string;
  completionState?: string;
  completionAt?: string;
  completionEventId?: number;
  status?: string;
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
  generationId: string;
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
