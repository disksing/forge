import type { NotificationRecord, NotificationSettings, NotificationStore } from "./notification-types";

export const NOTIFICATION_STORAGE_PREFIX = "forge.gui.notifications.v1";
export const NOTIFICATION_SETTINGS_KEY = `${NOTIFICATION_STORAGE_PREFIX}.settings`;
export const NOTIFICATION_STORE_VERSION = 1;

function objectRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? value as Record<string, unknown> : null;
}

export function normalizeNotificationRecord(raw: unknown): NotificationRecord | null {
  const record = objectRecord(raw);
  if (!record) return null;
  const marker = String(record.marker || "").trim();
  const generationId = String(record.generationId || "").trim();
  if (!marker || !generationId) return null;
  return {
    workspaceId: String(record.workspaceId || "").trim(),
    generationId,
    resourceId: String(record.resourceId || "").trim(),
    marker,
    completionState: String(record.completionState || "completed").trim(),
    title: String(record.title || "").trim(),
    resourceType: String(record.resourceType || "").trim(),
    resourceTitle: String(record.resourceTitle || "").trim(),
    at: Number(record.at) || Date.now(),
  };
}

export function defaultNotificationStore(): NotificationStore {
  return { version: NOTIFICATION_STORE_VERSION, seen: [], pending: [], unread: [], effects: [] };
}

export function normalizeNotificationStore(raw: unknown): NotificationStore {
  const record = objectRecord(raw);
  if (!record || record.version !== NOTIFICATION_STORE_VERSION) return defaultNotificationStore();
  const seen = Array.isArray(record.seen) ? record.seen.map((value) => {
    const item = objectRecord(value);
    return { marker: String(item?.marker || "").trim(), at: Number(item?.at) || Date.now() };
  }).filter((item) => item.marker) : [];
  const pending = Array.isArray(record.pending) ? record.pending.map(normalizeNotificationRecord).filter((item): item is NotificationRecord => Boolean(item)) : [];
  const unread = Array.isArray(record.unread) ? record.unread.map(normalizeNotificationRecord).filter((item): item is NotificationRecord => Boolean(item)) : [];
  const effects = Array.isArray(record.effects) ? record.effects.map((value) => {
    const item = objectRecord(value);
    return { key: String(item?.key || "").trim(), at: Number(item?.at) || Date.now() };
  }).filter((item) => item.key) : [];
  return { version: NOTIFICATION_STORE_VERSION, seen: seen.slice(-2e3), pending: pending.slice(-200), unread: unread.slice(-200), effects: effects.slice(-2e3) };
}

export function notificationStateKey(workspaceId: string): string {
  const workspace = workspaceId.trim();
  return workspace ? `${NOTIFICATION_STORAGE_PREFIX}.state.${encodeURIComponent(workspace)}` : "";
}

export function createNotificationRepository(storage: Storage | null) {
  function readStore(workspaceId: string): NotificationStore {
    const key = notificationStateKey(workspaceId);
    if (!storage || !key) return defaultNotificationStore();
    try {
      const raw = storage.getItem(key);
      if (!raw) return defaultNotificationStore();
      const parsed: unknown = JSON.parse(raw);
      const normalized = normalizeNotificationStore(parsed);
      if (normalized.version !== NOTIFICATION_STORE_VERSION) storage.removeItem(key);
      return normalized;
    } catch (_) {
      try { storage.removeItem(key); } catch (_) {}
      return defaultNotificationStore();
    }
  }

  function writeStore(workspaceId: string, store: NotificationStore): NotificationStore {
    const normalized = normalizeNotificationStore(store);
    const key = notificationStateKey(workspaceId);
    if (storage && key) try { storage.setItem(key, JSON.stringify(normalized)); } catch (_) {}
    return normalized;
  }

  function readSettings(): NotificationSettings {
    if (!storage) return { browser: false, sound: false };
    try {
      const parsed = objectRecord(JSON.parse(storage.getItem(NOTIFICATION_SETTINGS_KEY) || "null"));
      if (!parsed || parsed.version !== NOTIFICATION_STORE_VERSION) return { browser: false, sound: false };
      return { browser: Boolean(parsed.browser), sound: Boolean(parsed.sound) };
    } catch (_) {
      try { storage.removeItem(NOTIFICATION_SETTINGS_KEY); } catch (_) {}
      return { browser: false, sound: false };
    }
  }

  function writeSettings(settings: NotificationSettings): void {
    if (!storage) return;
    try { storage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify({ version: NOTIFICATION_STORE_VERSION, ...settings })); } catch (_) {}
  }

  return { readStore, writeStore, readSettings, writeSettings };
}
