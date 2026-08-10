import type { NotificationPreferences } from "../components/models";
import type { ResourceScope } from "../runtime/resource-scope";

export interface NotificationSource {
	[key: string]: unknown;
}

export interface NotificationResource extends NotificationSource {
	id?: string;
	title?: string;
	type?: string;
	selfDriving?: {
		enabled?: boolean;
		condition?: string;
		lastOutcome?: { status?: string };
	};
}

interface NotificationRecord {
	workspaceId: string;
	sessionId: string;
	runId: string;
	resourceId: string;
	marker: string;
	completionState: string;
	selfDriving: boolean;
	selfDrivingState: string;
	title: string;
	resourceType: string;
	resourceTitle: string;
	at: number;
}

interface NotificationStore {
	version: number;
	seen: Array<{ marker: string; at: number }>;
	pending: NotificationRecord[];
	unread: NotificationRecord[];
	effects: Array<{ key: string; at: number }>;
}

interface NotificationSettings {
	browser: boolean;
	sound: boolean;
}

export interface NotificationControllerDependencies {
	scope: ResourceScope;
	storage?: Storage | null;
	selectedResourceId(): string;
	treeSessions(): NotificationSource[];
	agentRuns(): NotificationSource[];
	hasTree(): boolean;
	findResource(id: string): NotificationResource | null | undefined;
	sessionNavigationTarget(item: NotificationSource): { primaryResourceId?: string };
	selectResource(id: string, options: { clearUnread: boolean; forceDetail: boolean }): Promise<void>;
	activateRun(runId: string): void;
	notificationsSettingsVisible(): boolean;
	renderSettings(): void;
	renderSessions(): void;
	refreshIcons(): void;
	flushDraft(): void;
}

const NOTIFICATION_STORAGE_PREFIX = "forge.gui.notifications.v1";
const NOTIFICATION_SETTINGS_KEY = `${NOTIFICATION_STORAGE_PREFIX}.settings`;
const NOTIFICATION_STORE_VERSION = 1;

export function createNotificationController(dependencies: NotificationControllerDependencies) {
	const state: {
		ready: boolean;
		workspaceId: string;
		store: NotificationStore | null;
		settings: NotificationSettings | null;
		channel: BroadcastChannel | null;
		tabId: string;
		audioContext: AudioContext | null;
		soundError: string;
		permissionError: string;
	} = {
		ready: false,
		workspaceId: "",
		store: null,
		settings: null,
		channel: null,
		tabId: "tab-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2),
		audioContext: null,
		soundError: "",
		permissionError: ""
	};
function notificationStorage() {
	if ("storage" in dependencies) return dependencies.storage || null;
	try {
		return window.localStorage;
	} catch (_) {
		return null;
	}
}
function notificationStateKey(workspaceId = state.workspaceId) {
	const workspace = String(workspaceId || "").trim();
	return workspace ? `${NOTIFICATION_STORAGE_PREFIX}.state.${encodeURIComponent(workspace)}` : "";
}
function notificationDefaultStore() {
	return {
		version: NOTIFICATION_STORE_VERSION,
		seen: [],
		pending: [],
		unread: [],
		effects: []
	};
}
function notificationRecord(raw) {
	if (!raw || typeof raw !== "object") return null;
	const marker = String(raw.marker || "").trim();
	const sessionId = String(raw.sessionId || "").trim();
	if (!marker || !sessionId) return null;
	return {
		workspaceId: String(raw.workspaceId || "").trim(),
		sessionId,
		runId: String(raw.runId || "").trim(),
		resourceId: String(raw.resourceId || "").trim(),
		marker,
		completionState: String(raw.completionState || "completed").trim(),
		selfDriving: Boolean(raw.selfDriving),
		selfDrivingState: String(raw.selfDrivingState || "").trim(),
		title: String(raw.title || "").trim(),
		resourceType: String(raw.resourceType || "").trim(),
		resourceTitle: String(raw.resourceTitle || "").trim(),
		at: Number(raw.at) || Date.now()
	};
}
function normalizeNotificationStore(raw) {
	if (!raw || raw.version !== NOTIFICATION_STORE_VERSION) return notificationDefaultStore();
	const seen = Array.isArray(raw.seen) ? raw.seen.map((item) => ({
		marker: String(item?.marker || "").trim(),
		at: Number(item?.at) || Date.now()
	})).filter((item) => item.marker) : [];
	const pending = Array.isArray(raw.pending) ? raw.pending.map(notificationRecord).filter(Boolean) : [];
	const unread = Array.isArray(raw.unread) ? raw.unread.map(notificationRecord).filter(Boolean) : [];
	const effects = Array.isArray(raw.effects) ? raw.effects.map((item) => ({
		key: String(item?.key || "").trim(),
		at: Number(item?.at) || Date.now()
	})).filter((item) => item.key) : [];
	return {
		version: NOTIFICATION_STORE_VERSION,
		seen: seen.slice(-2e3),
		pending: pending.slice(-200),
		unread: unread.slice(-200),
		effects: effects.slice(-2e3)
	};
}
function readNotificationStore(workspaceId = state.workspaceId) {
	const storage = notificationStorage();
	const key = notificationStateKey(workspaceId);
	if (!storage || !key) return notificationDefaultStore();
	try {
		const raw = storage.getItem(key);
		if (!raw) return notificationDefaultStore();
		const parsed = JSON.parse(raw);
		if (!parsed || parsed.version !== NOTIFICATION_STORE_VERSION) {
			storage.removeItem(key);
			return notificationDefaultStore();
		}
		return normalizeNotificationStore(parsed);
	} catch (_) {
		try {
			storage.removeItem(key);
		} catch (_) {}
		return notificationDefaultStore();
	}
}
function writeNotificationStore() {
	const storage = notificationStorage();
	const key = notificationStateKey();
	if (!storage || !key || !state.store) return;
	state.store = normalizeNotificationStore(state.store);
	try {
		storage.setItem(key, JSON.stringify(state.store));
	} catch (_) {}
}
function readNotificationSettings() {
	const defaults = {
		browser: false,
		sound: false
	};
	const storage = notificationStorage();
	if (!storage) return defaults;
	try {
		const parsed = JSON.parse(storage.getItem(NOTIFICATION_SETTINGS_KEY) || "null");
		if (!parsed || parsed.version !== NOTIFICATION_STORE_VERSION) return defaults;
		return {
			browser: Boolean(parsed.browser),
			sound: Boolean(parsed.sound)
		};
	} catch (_) {
		try {
			storage.removeItem(NOTIFICATION_SETTINGS_KEY);
		} catch (_) {}
		return defaults;
	}
}
function writeNotificationSettings() {
	const storage = notificationStorage();
	if (!storage || !state.settings) return;
	try {
		storage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify({
			version: NOTIFICATION_STORE_VERSION,
			browser: Boolean(state.settings.browser),
			sound: Boolean(state.settings.sound)
		}));
	} catch (_) {}
}
function notificationPermission() {
	if (typeof window.Notification === "undefined") return "unsupported";
	const permission = String(window.Notification.permission || "default");
	return [
		"granted",
		"default",
		"denied"
	].includes(permission) ? permission : "default";
}
function initializeNotificationState(workspaceId) {
	const nextWorkspace = String(workspaceId || "").trim();
	if (!nextWorkspace) return;
	closeNotificationChannel();
	state.workspaceId = nextWorkspace;
	state.store = readNotificationStore(nextWorkspace);
	state.settings = readNotificationSettings();
	if (notificationPermission() !== "granted") {
		state.settings.browser = false;
		writeNotificationSettings();
	}
	state.ready = false;
	state.permissionError = "";
	openNotificationChannel(nextWorkspace);
}
function openNotificationChannel(workspaceId) {
	const Channel = window.BroadcastChannel || globalThis.BroadcastChannel;
	if (typeof Channel !== "function") return;
	try {
		const channel = new Channel(`${NOTIFICATION_STORAGE_PREFIX}.${encodeURIComponent(workspaceId)}`);
		channel.onmessage = (event) => handleNotificationBroadcast(event.data);
		state.channel = channel;
	} catch (_) {
		state.channel = null;
	}
}
function closeNotificationChannel() {
	try {
		state.channel?.close();
	} catch (_) {}
	state.channel = null;
}
function broadcastNotification(message) {
	try {
		state.channel?.postMessage({
			...message,
			workspaceId: state.workspaceId,
			sourceTabId: state.tabId
		});
	} catch (_) {}
}
function handleNotificationBroadcast(message) {
	if (!message || message.workspaceId !== state.workspaceId || message.sourceTabId === state.tabId) return;
	const store = state.store || notificationDefaultStore();
	if (message.type === "effect" && message.effectKey) {
		if (!store.effects.some((item) => item.key === message.effectKey)) {
			store.effects.push({
				key: message.effectKey,
				at: Number(message.at) || Date.now()
			});
			state.store = store;
			writeNotificationStore();
		}
		return;
	}
	if (message.type === "record" && message.record) {
		const record = notificationRecord(message.record);
		if (!record) return;
		if (!store.seen.some((item) => item.marker === record.marker)) store.seen.push({
			marker: record.marker,
			at: record.at
		});
		if (notificationRecordIsCurrentAndVisible(record)) {
			store.unread = store.unread.filter((item) => item.marker !== record.marker);
			store.pending = store.pending.filter((item) => item.marker !== record.marker);
			state.store = store;
			writeNotificationStore();
			broadcastNotification({
				type: "clear-resource",
				resourceId: record.resourceId
			});
			if (dependencies.hasTree()) dependencies.renderSessions();
			return;
		}
		if (!store.unread.some((item) => item.marker === record.marker)) store.unread.push(record);
		state.store = store;
		writeNotificationStore();
		if (dependencies.hasTree()) {
			dependencies.renderSessions();
			dependencies.refreshIcons();
		}
		return;
	}
	if (message.type === "clear-marker" && message.marker) {
		store.unread = store.unread.filter((item) => item.marker !== message.marker);
		store.pending = store.pending.filter((item) => item.marker !== message.marker);
		state.store = store;
		writeNotificationStore();
		if (dependencies.hasTree()) dependencies.renderSessions();
		return;
	}
	if (message.type === "clear-resource" && message.resourceId) {
		const resourceId = String(message.resourceId);
		store.unread = store.unread.filter((item) => item.resourceId !== resourceId);
		store.pending = store.pending.filter((item) => item.resourceId !== resourceId);
		state.store = store;
		writeNotificationStore();
		if (dependencies.hasTree()) dependencies.renderSessions();
	}
}
function notificationStore() {
	if (!state.store) state.store = notificationDefaultStore();
	return state.store;
}
function notificationMarkerFor(item) {
	const explicit = String(item?.completionMarker || item?.agentRunCompletionMarker || "").trim();
	if (explicit) return explicit;
	const sessionID = String(item?.agentHubSessionId || item?.completionSessionId || "").trim();
	const eventID = Number(item?.completionEventId) || 0;
	return sessionID && eventID > 0 ? `${sessionID}:${eventID}` : "";
}
function notificationSessionIDFor(item) {
	return String(item?.forgeSessionId || item?.sessionId || item?.agentHubSessionId || item?.id || "").trim();
}
function notificationResourceIDFor(item) {
	if (item?.source === "internal" || item?.source === "external") return dependencies.sessionNavigationTarget(item).primaryResourceId || "";
	if (item?.resourceId) return String(item.resourceId).trim();
	if (Array.isArray(item?.controls) && item.controls.length === 1) return String(item.controls[0]?.resourceId || "").trim();
	return "";
}
function notificationEventState(event) {
	switch (event?.type) {
		case "turn.failed": return "failed";
		case "turn.cancelled": return "cancelled";
		case "turn.completed": return "completed";
		default: return "";
	}
}
function notificationSelfDrivingContext(item, resourceId) {
	const revision = Number(item?.selfDrivingRevision) || 0;
	if (!(Boolean(item?.schedulerTurn) || revision > 0)) return {
		isSelfDriving: false,
		state: "",
		final: false,
		suppressed: false
	};
	const selfDriving = dependencies.findResource(resourceId)?.selfDriving;
	const stateName = String(selfDriving?.condition || "disabled").trim().toLowerCase();
	const completed = !selfDriving?.enabled && selfDriving?.lastOutcome?.status === "completed";
	const requiresAttention = Boolean(selfDriving?.enabled) && [
		"blocked",
		"error",
		"needs_configuration"
	].includes(stateName);
	const disabledControl = !selfDriving?.enabled && !completed;
	const final = completed || requiresAttention;
	return {
		isSelfDriving: true,
		state: stateName,
		final,
		suppressed: !final,
		disabledControl
	};
}
function notificationRecordFor(item, marker, completionState = "") {
	const resourceId = notificationResourceIDFor(item);
	const resource = dependencies.findResource(resourceId);
	const selfDriving = notificationSelfDrivingContext(item, resourceId);
	return notificationRecord({
		workspaceId: state.workspaceId,
		sessionId: notificationSessionIDFor(item),
		runId: String(item?.runId || item?.agentRunId || item?.id || "").trim(),
		resourceId,
		marker,
		completionState: completionState || item?.completionState || "completed",
		selfDriving: selfDriving.isSelfDriving,
		selfDrivingState: selfDriving.state,
		title: resource?.title || item?.title || item?.agentRunTitle || item?.id || "Session",
		resourceType: resource?.type || "",
		resourceTitle: resource?.title || "",
		at: Date.now()
	});
}
function notificationRecordIsCurrentAndVisible(record) {
	if (!record?.resourceId || dependencies.selectedResourceId() !== record.resourceId) return false;
	return notificationPageIsVisibleAndFocused();
}
function notificationPageIsVisibleAndFocused() {
	const visible = document.visibilityState ? document.visibilityState === "visible" : !document.hidden;
	const focused = typeof document.hasFocus !== "function" || document.hasFocus();
	return visible && !document.hidden && focused;
}
function notificationEffectKey(record, kind) {
	return `${record.marker}:${kind}`;
}
function mergeNotificationEffectsFromStorage() {
	const persisted = readNotificationStore();
	const store = notificationStore();
	const effects = /* @__PURE__ */ new Map();
	for (const effect of [...persisted.effects, ...store.effects]) if (effect?.key) effects.set(effect.key, effect);
	store.effects = [...effects.values()].slice(-2e3);
	state.store = store;
}
function claimNotificationEffect(record, kind) {
	const key = notificationEffectKey(record, kind);
	const store = notificationStore();
	if (store.effects.some((item) => item.key === key)) return false;
	store.effects.push({
		key,
		at: Date.now()
	});
	state.store = store;
	writeNotificationStore();
	broadcastNotification({
		type: "effect",
		effectKey: key,
		at: Date.now()
	});
	return true;
}
function withNotificationEffectClaim(record, kind, action) {
	const locks = typeof navigator !== "undefined" ? navigator.locks : null;
	const run = () => {
		mergeNotificationEffectsFromStorage();
		if (claimNotificationEffect(record, kind)) action();
	};
	if (!locks || typeof locks.request !== "function") {
		run();
		return;
	}
	try {
		Promise.resolve(locks.request(`forge.gui.notification.${state.workspaceId}.${notificationEffectKey(record, kind)}`, { ifAvailable: true }, (lock) => {
			if (!lock) return;
			run();
		})).catch((err) => {
			console.warn("notification effect lock unavailable", err);
			run();
		});
	} catch (err) {
		console.warn("notification effect lock unavailable", err);
		run();
	}
}
function notificationDisplayTitle(record) {
	return `${record.resourceType === "project" ? "Project" : record.resourceType === "task" ? "Task" : "Session"}: ${record.title || record.resourceId || record.sessionId}`;
}
function notificationDisplayBody(record) {
	if (record.selfDriving) return `Self-Driving ${record.selfDrivingState || "finished"}.`;
	if (record.completionState === "failed") return "Turn failed.";
	if (record.completionState === "cancelled") return "Turn cancelled.";
	return "Turn completed.";
}
function playCompletionSound() {
	if (!state.settings?.sound) return;
	const AudioContext = window.AudioContext || window.webkitAudioContext;
	if (typeof AudioContext !== "function") {
		state.soundError = "Audio is unavailable in this browser.";
		if (dependencies.notificationsSettingsVisible()) dependencies.renderSettings();
		return;
	}
	try {
		const audio = state.audioContext || new AudioContext();
		state.audioContext = audio;
		const start = () => {
			const oscillator = audio.createOscillator();
			const gain = audio.createGain();
			oscillator.type = "sine";
			oscillator.frequency.setValueAtTime(880, audio.currentTime);
			oscillator.frequency.exponentialRampToValueAtTime(660, audio.currentTime + .12);
			gain.gain.setValueAtTime(1e-4, audio.currentTime);
			gain.gain.exponentialRampToValueAtTime(.08, audio.currentTime + .01);
			gain.gain.exponentialRampToValueAtTime(1e-4, audio.currentTime + .16);
			oscillator.connect(gain);
			gain.connect(audio.destination);
			oscillator.start();
			oscillator.stop(audio.currentTime + .18);
		};
		if (audio.state === "suspended") audio.resume().then(start).catch((err) => {
			state.soundError = "Chrome blocked completion sound until audio is enabled by the page.";
			console.warn("completion sound unavailable", err);
			if (dependencies.notificationsSettingsVisible()) dependencies.renderSettings();
		});
		else start();
	} catch (err) {
		state.soundError = "Completion sound is unavailable right now.";
		console.warn("completion sound unavailable", err);
		if (dependencies.notificationsSettingsVisible()) dependencies.renderSettings();
	}
}
function sendBrowserNotification(record, alreadyClaimed = false) {
	if (!state.settings?.browser || notificationPermission() !== "granted") return;
	if (!alreadyClaimed && !claimNotificationEffect(record, "browser")) return;
	try {
		const notification = new window.Notification(notificationDisplayTitle(record), {
			body: notificationDisplayBody(record),
			tag: `forge-${record.marker}`,
			icon: "/favicon.svg"
		});
		notification.onclick = () => {
			try {
				window.focus();
			} catch (_) {}
			navigateToNotification(record).catch((err) => console.warn("notification navigation failed", err));
		};
	} catch (err) {
		console.warn("browser notification unavailable", err);
	}
}
function deliverCompletionEffects(record) {
	if (state.settings?.browser && notificationPermission() === "granted") withNotificationEffectClaim(record, "browser", () => sendBrowserNotification(record, true));
	if (state.settings?.sound) withNotificationEffectClaim(record, "sound", playCompletionSound);
}
function observeCompletion(item, completionState = "") {
	const marker = notificationMarkerFor(item);
	const sessionId = notificationSessionIDFor(item);
	if (!marker || !sessionId || !state.workspaceId) return false;
	const record = notificationRecordFor(item, marker, completionState);
	if (!record?.sessionId) return false;
	const store = notificationStore();
	const seen = store.seen.some((entry) => entry.marker === marker);
	const pendingIndex = store.pending.findIndex((entry) => entry.marker === marker);
	const selfDriving = notificationSelfDrivingContext(item, record.resourceId);
	if (!state.ready) {
		if (!seen) store.seen.push({
			marker,
			at: Date.now()
		});
		store.pending = store.pending.filter((entry) => entry.marker !== marker);
		state.store = store;
		writeNotificationStore();
		return false;
	}
	if (seen && pendingIndex < 0) return false;
	if (selfDriving.isSelfDriving && selfDriving.state === "waiting") {
		if (!seen) store.seen.push({
			marker,
			at: Date.now()
		});
		store.pending = store.pending.filter((entry) => entry.marker !== marker);
		state.store = store;
		writeNotificationStore();
		return false;
	}
	if (selfDriving.isSelfDriving && selfDriving.disabledControl) {
		if (!seen) store.seen.push({
			marker,
			at: Date.now()
		});
		store.pending = store.pending.filter((entry) => entry.marker !== marker);
		store.unread = store.unread.filter((entry) => entry.marker !== marker);
		state.store = store;
		writeNotificationStore();
		return false;
	}
	if (selfDriving.isSelfDriving && selfDriving.suppressed && !selfDriving.final) {
		if (!seen) store.seen.push({
			marker,
			at: Date.now()
		});
		if (pendingIndex < 0) store.pending.push(record);
		state.store = store;
		writeNotificationStore();
		return false;
	}
	if (!seen) store.seen.push({
		marker,
		at: Date.now()
	});
	store.pending = store.pending.filter((entry) => entry.marker !== marker);
	if (notificationRecordIsCurrentAndVisible(record)) {
		state.store = store;
		writeNotificationStore();
		return false;
	}
	store.unread = store.unread.filter((entry) => entry.marker !== marker);
	store.unread.push(record);
	state.store = store;
	writeNotificationStore();
	broadcastNotification({
		type: "record",
		record
	});
	deliverCompletionEffects(record);
	if (dependencies.hasTree()) {
		dependencies.renderSessions();
		dependencies.refreshIcons();
	}
	return true;
}
function observeCompletionProjections(items) {
	for (const item of items || []) if (notificationMarkerFor(item)) observeCompletion(item, item.completionState || item.agentRunCompletionState || "");
}
function observeCompletionEvent(event, run) {
	const completionState = notificationEventState(event);
	if (!completionState || !event?.sessionId || !Number(event.id)) return;
	const marker = `${event.sessionId}:${event.id}`;
	observeCompletion({
		...run || {},
		completionMarker: marker,
		completionState,
		agentHubSessionId: run?.agentHubSessionId || event.sessionId
	}, completionState);
}
function establishNotificationBaseline() {
	if (state.ready) return;
	observeCompletionProjections(dependencies.treeSessions());
	observeCompletionProjections(dependencies.agentRuns());
	state.ready = true;
	writeNotificationStore();
}
function hasUnreadNotificationForSession(sessionId) {
	const normalized = String(sessionId || "").trim();
	return Boolean(normalized && notificationStore().unread.some((record) => record.sessionId === normalized));
}
function clearUnreadForMarker(marker) {
	const value = String(marker || "").trim();
	if (!value) return;
	const store = notificationStore();
	if (!(store.unread.some((record) => record.marker === value) || store.pending.some((record) => record.marker === value))) return;
	store.unread = store.unread.filter((record) => record.marker !== value);
	store.pending = store.pending.filter((record) => record.marker !== value);
	state.store = store;
	writeNotificationStore();
	broadcastNotification({
		type: "clear-marker",
		marker: value
	});
	if (dependencies.hasTree()) dependencies.renderSessions();
}
function clearUnreadForResource(resourceId) {
	const value = String(resourceId || "").trim();
	if (!value) return;
	const store = notificationStore();
	if (!(store.unread.some((record) => record.resourceId === value) || store.pending.some((record) => record.resourceId === value))) return;
	store.unread = store.unread.filter((record) => record.resourceId !== value);
	store.pending = store.pending.filter((record) => record.resourceId !== value);
	state.store = store;
	writeNotificationStore();
	broadcastNotification({
		type: "clear-resource",
		resourceId: value
	});
	if (dependencies.hasTree()) dependencies.renderSessions();
}
function notificationSettingsChanged() {
	writeNotificationSettings();
	if (dependencies.notificationsSettingsVisible()) dependencies.renderSettings();
}
async function requestBrowserNotifications() {
	state.settings = state.settings || readNotificationSettings();
	const permission = notificationPermission();
	if (permission === "unsupported") {
		state.settings.browser = false;
		state.permissionError = "Browser notifications are not supported here.";
		notificationSettingsChanged();
		return permission;
	}
	if (permission === "denied") {
		state.settings.browser = false;
		state.permissionError = "Chrome denied permission. Restore it in Chrome site settings; Forge will not ask again automatically.";
		notificationSettingsChanged();
		return permission;
	}
	let nextPermission = permission;
	if (permission === "default") try {
		nextPermission = await window.Notification.requestPermission();
	} catch (err) {
		state.permissionError = "Chrome could not request notification permission.";
		console.warn("notification permission request failed", err);
	}
	if (nextPermission === "granted") {
		state.settings.browser = true;
		state.permissionError = "";
	} else {
		state.settings.browser = false;
		state.permissionError = nextPermission === "denied" ? "Chrome denied permission. Restore it in Chrome site settings; Forge will not ask again automatically." : "Notification permission is still pending.";
	}
	notificationSettingsChanged();
	return nextPermission;
}
function setBrowserNotificationsEnabled(enabled) {
	state.settings = state.settings || readNotificationSettings();
	if (!enabled) {
		state.settings.browser = false;
		state.permissionError = "";
		notificationSettingsChanged();
		return;
	}
	requestBrowserNotifications().catch((err) => {
		if (state.settings) state.settings.browser = false;
		state.permissionError = "Chrome could not request notification permission.";
		console.warn("notification permission request failed", err);
		notificationSettingsChanged();
	});
}
function initializeCompletionAudio() {
	const AudioContext = window.AudioContext || window.webkitAudioContext;
	if (typeof AudioContext !== "function") {
		state.soundError = "Audio is unavailable in this browser.";
		notificationSettingsChanged();
		return Promise.resolve(false);
	}
	try {
		state.audioContext = state.audioContext || new AudioContext();
		const resume = state.audioContext.resume?.();
		return Promise.resolve(resume).then(() => {
			state.soundError = "";
			notificationSettingsChanged();
			return true;
		}).catch((err) => {
			state.soundError = "Chrome may block sound until the page receives an audio gesture.";
			console.warn("completion audio initialization failed", err);
			notificationSettingsChanged();
			return false;
		});
	} catch (err) {
		state.soundError = "Completion sound is unavailable right now.";
		console.warn("completion audio initialization failed", err);
		notificationSettingsChanged();
		return Promise.resolve(false);
	}
}
function setCompletionSoundEnabled(enabled) {
	state.settings = state.settings || readNotificationSettings();
	state.settings.sound = Boolean(enabled);
	state.soundError = "";
	notificationSettingsChanged();
	if (enabled) initializeCompletionAudio();
}
async function navigateToNotification(record) {
	if (!record?.resourceId) return;
	try {
		await dependencies.selectResource(record.resourceId, {
			clearUnread: false,
			forceDetail: true
		});
		if (record.runId) dependencies.activateRun(record.runId);
	} finally {
		clearUnreadForMarker(record.marker);
	}
}
function installNotificationCrossTabListeners() {
	dependencies.scope.listen(window, "storage", (event) => {
		if (event.key === notificationStateKey() && event.newValue) {
			state.store = readNotificationStore();
			if (dependencies.hasTree()) dependencies.renderSessions();
		}
		if (event.key === NOTIFICATION_SETTINGS_KEY) {
			state.settings = readNotificationSettings();
			if (notificationPermission() !== "granted") state.settings.browser = false;
			if (dependencies.notificationsSettingsVisible()) dependencies.renderSettings();
		}
	});
	dependencies.scope.listen(document, "visibilitychange", () => {
		dependencies.flushDraft();
		if (notificationPageIsVisibleAndFocused()) clearUnreadForResource(dependencies.selectedResourceId());
	});
	dependencies.scope.listen(window, "focus", () => clearUnreadForResource(dependencies.selectedResourceId()));
}

	function preferences(): NotificationPreferences {
		const settings = state.settings || readNotificationSettings();
		state.settings = settings;
		return {
			browser: settings.browser,
			sound: settings.sound,
			permission: notificationPermission(),
			permissionError: state.permissionError,
			soundError: state.soundError
		};
	}
	function dispose() {
		closeNotificationChannel();
		try {
			void state.audioContext?.close();
		} catch (_) {}
		state.audioContext = null;
	}
	return {
		initialize: initializeNotificationState,
		install: installNotificationCrossTabListeners,
		dispose,
		establishBaseline: establishNotificationBaseline,
		observeProjections: observeCompletionProjections,
		observeEvent: observeCompletionEvent,
		hasUnreadForSession: hasUnreadNotificationForSession,
		clearResource: clearUnreadForResource,
		preferences,
		setBrowserEnabled: setBrowserNotificationsEnabled,
		setSoundEnabled: setCompletionSoundEnabled
	};
}
