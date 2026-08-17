import type { NotificationPreferences } from "../models/settings";
import type { ResourceScope } from "../runtime/resource-scope";
import { createNotificationDelivery, notificationPermission } from "./notification-delivery";
import { createNotificationRecord, notificationEventState, notificationMarkerFor } from "./notification-projection";
import { createNotificationRepository, defaultNotificationStore, normalizeNotificationRecord, notificationStateKey, NOTIFICATION_SETTINGS_KEY, NOTIFICATION_STORAGE_PREFIX } from "./notification-store";
import type { NotificationBroadcast, NotificationEvent, NotificationRecord, NotificationResource, NotificationSettings, NotificationSource, NotificationStore } from "./notification-types";

export type { NotificationResource, NotificationSource } from "./notification-types";

export interface NotificationControllerDependencies {
  scope: ResourceScope;
  storage?: Storage | null;
  selectedResourceId(): string;
  resourceProjections(): NotificationSource[];
  findResource(id: string): NotificationResource | null | undefined;
  selectResource(id: string, options: { clearUnread: boolean; forceDetail: boolean }): Promise<void>;
  notificationsSettingsVisible(): boolean;
  renderSettings(): void;
  flushDraft(): void;
}

function resolveStorage(dependencies: NotificationControllerDependencies): Storage | null {
  if ("storage" in dependencies) return dependencies.storage || null;
  try { return window.localStorage; } catch (_) { return null; }
}

export function createNotificationController(dependencies: NotificationControllerDependencies) {
  const repository = createNotificationRepository(resolveStorage(dependencies));
  const state: {
    ready: boolean;
    workspaceId: string;
    store: NotificationStore | null;
    settings: NotificationSettings | null;
    channel: BroadcastChannel | null;
    tabId: string;
  } = {
    ready: false,
    workspaceId: "",
    store: null,
    settings: null,
    channel: null,
    tabId: `tab-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,
  };

  function store(): NotificationStore {
    state.store ||= defaultNotificationStore();
    return state.store;
  }

  function settings(): NotificationSettings {
    state.settings ||= repository.readSettings();
    return state.settings;
  }

  function updateSettings(next: NotificationSettings): void {
    state.settings = next;
  }

  function writeStore(): void {
    if (!state.workspaceId || !state.store) return;
    state.store = repository.writeStore(state.workspaceId, state.store);
  }

  function settingsChanged(): void {
    repository.writeSettings(settings());
    if (dependencies.notificationsSettingsVisible()) dependencies.renderSettings();
  }

  function pageVisibleAndFocused(): boolean {
    const visible = document.visibilityState ? document.visibilityState === "visible" : !document.hidden;
    const focused = typeof document.hasFocus !== "function" || document.hasFocus();
    return visible && !document.hidden && focused;
  }

  function recordIsCurrentAndVisible(record: NotificationRecord): boolean {
    return Boolean(record.resourceId && dependencies.selectedResourceId() === record.resourceId && pageVisibleAndFocused());
  }

  function broadcast(message: NotificationBroadcast): void {
    try { state.channel?.postMessage({ ...message, workspaceId: state.workspaceId, sourceTabId: state.tabId }); } catch (_) {}
  }

  function effectKey(record: NotificationRecord, kind: "browser" | "sound"): string {
    return `${record.marker}:${kind}`;
  }

  function mergeEffectsFromStorage(): void {
    const persisted = repository.readStore(state.workspaceId);
    const current = store();
    const effects = new Map([...persisted.effects, ...current.effects].map((effect) => [effect.key, effect]));
    current.effects = [...effects.values()].slice(-2e3);
  }

  function claimEffect(record: NotificationRecord, kind: "browser" | "sound"): boolean {
    const key = effectKey(record, kind);
    const current = store();
    if (current.effects.some((item) => item.key === key)) return false;
    current.effects.push({ key, at: Date.now() });
    writeStore();
    broadcast({ type: "effect", effectKey: key, at: Date.now() });
    return true;
  }

  function withEffectClaim(record: NotificationRecord, kind: "browser" | "sound", action: () => void): void {
    const run = () => {
      mergeEffectsFromStorage();
      if (claimEffect(record, kind)) action();
    };
    const locks = typeof navigator !== "undefined" ? navigator.locks : null;
    if (!locks || typeof locks.request !== "function") return run();
    try {
      void locks.request(`pua.web.notification.${state.workspaceId}.${effectKey(record, kind)}`, { ifAvailable: true }, (lock) => {
        if (lock) run();
      }).catch((error) => {
        console.warn("notification effect lock unavailable", error);
        run();
      });
    } catch (error) {
      console.warn("notification effect lock unavailable", error);
      run();
    }
  }

  async function navigate(record: NotificationRecord): Promise<void> {
    if (!record.resourceId) return;
    try {
      await dependencies.selectResource(record.resourceId, { clearUnread: false, forceDetail: true });
    } finally {
      clearUnreadForMarker(record.marker);
    }
  }

  const delivery = createNotificationDelivery({ settings, updateSettings, settingsChanged, claim: withEffectClaim, navigate });

  function closeChannel(): void {
    try { state.channel?.close(); } catch (_) {}
    state.channel = null;
  }

  function openChannel(workspaceId: string): void {
    const Channel = window.BroadcastChannel || globalThis.BroadcastChannel;
    if (typeof Channel !== "function") return;
    try {
      const channel = new Channel(`${NOTIFICATION_STORAGE_PREFIX}.${encodeURIComponent(workspaceId)}`);
      channel.onmessage = (event: MessageEvent<NotificationBroadcast>) => handleBroadcast(event.data);
      state.channel = channel;
    } catch (_) {
      state.channel = null;
    }
  }

  function initialize(workspaceId: string): void {
    const nextWorkspace = workspaceId.trim();
    if (!nextWorkspace) return;
    closeChannel();
    state.workspaceId = nextWorkspace;
    state.store = repository.readStore(nextWorkspace);
    state.settings = repository.readSettings();
    if (notificationPermission() !== "granted") {
      state.settings.browser = false;
      repository.writeSettings(state.settings);
    }
    state.ready = false;
    openChannel(nextWorkspace);
  }

  function handleBroadcast(message: NotificationBroadcast): void {
    if (!message || message.workspaceId !== state.workspaceId || message.sourceTabId === state.tabId) return;
    const current = store();
    if (message.type === "effect" && message.effectKey) {
      if (!current.effects.some((item) => item.key === message.effectKey)) {
        current.effects.push({ key: message.effectKey, at: Number(message.at) || Date.now() });
        writeStore();
      }
      return;
    }
    if (message.type === "record" && message.record) {
      const record = normalizeNotificationRecord(message.record);
      if (!record) return;
      if (!current.seen.some((item) => item.marker === record.marker)) current.seen.push({ marker: record.marker, at: record.at });
      if (recordIsCurrentAndVisible(record)) {
        current.unread = current.unread.filter((item) => item.marker !== record.marker);
        current.pending = current.pending.filter((item) => item.marker !== record.marker);
        writeStore();
        broadcast({ type: "clear-resource", resourceId: record.resourceId });
      } else {
        if (!current.unread.some((item) => item.marker === record.marker)) current.unread.push(record);
        writeStore();
      }
      return;
    }
    if (message.type === "clear-marker" && message.marker) {
      current.unread = current.unread.filter((item) => item.marker !== message.marker);
      current.pending = current.pending.filter((item) => item.marker !== message.marker);
    } else if (message.type === "clear-resource" && message.resourceId) {
      current.unread = current.unread.filter((item) => item.resourceId !== message.resourceId);
      current.pending = current.pending.filter((item) => item.resourceId !== message.resourceId);
    } else return;
    writeStore();
  }

  function observeCompletion(item: NotificationSource, completionState = ""): boolean {
    const marker = notificationMarkerFor(item);
    if (!marker || !state.workspaceId) return false;
    const record = createNotificationRecord(item, {
      workspaceId: state.workspaceId,
      marker,
      completionState,
      findResource: dependencies.findResource,
    });
    if (!record) return false;
    const current = store();
    const seen = current.seen.some((entry) => entry.marker === marker);
    const pendingIndex = current.pending.findIndex((entry) => entry.marker === marker);
		if (!state.ready) {
      if (!seen) current.seen.push({ marker, at: Date.now() });
      current.pending = current.pending.filter((entry) => entry.marker !== marker);
      writeStore();
      return false;
    }
    if (seen && pendingIndex < 0) return false;
    if (!seen) current.seen.push({ marker, at: Date.now() });
    current.pending = current.pending.filter((entry) => entry.marker !== marker);
    if (recordIsCurrentAndVisible(record)) {
      writeStore();
      return false;
    }
    current.unread = current.unread.filter((entry) => entry.marker !== marker);
    current.unread.push(record);
    writeStore();
    broadcast({ type: "record", record });
    delivery.deliver(record);
    return true;
  }

  function observeProjections(items: NotificationSource[]): void {
    for (const item of items) if (notificationMarkerFor(item)) observeCompletion(item, item.completionState || "");
  }

  function observeEvent(event: NotificationEvent, source: NotificationSource): void {
    const completionState = notificationEventState(event);
    if (!completionState || !Number(event.id)) return;
    observeCompletion({
      ...source,
      completionMarker: `${source.generationId || event.sessionId || "generation"}:${event.id}`,
      completionState,
    }, completionState);
  }

  function establishBaseline(): void {
    if (state.ready) return;
    observeProjections(dependencies.resourceProjections());
    state.ready = true;
    writeStore();
  }

  function clearUnreadForMarker(marker: string): void {
    const value = marker.trim();
    if (!value) return;
    const current = store();
    if (!(current.unread.some((record) => record.marker === value) || current.pending.some((record) => record.marker === value))) return;
    current.unread = current.unread.filter((record) => record.marker !== value);
    current.pending = current.pending.filter((record) => record.marker !== value);
    writeStore();
    broadcast({ type: "clear-marker", marker: value });
  }

  function clearResource(resourceId: string): void {
    const value = resourceId.trim();
    if (!value) return;
    const current = store();
    if (!(current.unread.some((record) => record.resourceId === value) || current.pending.some((record) => record.resourceId === value))) return;
    current.unread = current.unread.filter((record) => record.resourceId !== value);
    current.pending = current.pending.filter((record) => record.resourceId !== value);
    writeStore();
    broadcast({ type: "clear-resource", resourceId: value });
  }

  function install(): void {
    dependencies.scope.listen(window, "storage", (event) => {
      if (event.key === notificationStateKey(state.workspaceId) && event.newValue) {
        state.store = repository.readStore(state.workspaceId);
      }
      if (event.key === NOTIFICATION_SETTINGS_KEY) {
        state.settings = repository.readSettings();
        if (notificationPermission() !== "granted") state.settings.browser = false;
        if (dependencies.notificationsSettingsVisible()) dependencies.renderSettings();
      }
    });
    dependencies.scope.listen(document, "visibilitychange", () => {
      dependencies.flushDraft();
      if (pageVisibleAndFocused()) clearResource(dependencies.selectedResourceId());
    });
    dependencies.scope.listen(window, "focus", () => clearResource(dependencies.selectedResourceId()));
  }

  function preferences(): NotificationPreferences {
    settings();
    return delivery.preferences();
  }

  function dispose(): void {
    closeChannel();
    delivery.dispose();
  }

  return {
    initialize,
    install,
    dispose,
    establishBaseline,
    observeProjections,
    observeEvent,
    clearResource,
    preferences,
    setBrowserEnabled: delivery.setBrowserEnabled,
    setSoundEnabled: delivery.setSoundEnabled,
  };
}
