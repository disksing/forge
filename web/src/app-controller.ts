import type {
  AppShellModel,
  ComposerModel,
  CreateDraft,
  CreateDialogModel,
  DetailPanelModel,
  EventTimelineModel,
  SelfDrivingBarModel,
  SelfDrivingDialogModel,
  SessionSwitcherModel,
  SettingsModel,
  ToastModel,
  UploadDialogModel,
} from "./components/models";
import { ResourceScope } from "./runtime/resource-scope";

export interface ForgeViewPublisher {
  renderAppShell(model: AppShellModel): void;
  renderCreateDialog(model: CreateDialogModel): void;
  renderSettings(model: SettingsModel): void;
  renderSelfDrivingBar(model: SelfDrivingBarModel): void;
  renderSelfDrivingDialog(model: SelfDrivingDialogModel): void;
  renderUploadDialog(model: UploadDialogModel): void;
  renderComposer(model: ComposerModel): void;
  renderSessionSwitcher(model: SessionSwitcherModel): void;
  renderEventTimeline(model: EventTimelineModel): void;
  renderDetailPanel(model: DetailPanelModel): void;
  renderToast(model: ToastModel): void;
}

let publisher: ForgeViewPublisher;
let lifecycle: ResourceScope | null = null;
const initialControllerState = {
	config: null,
	tree: null,
	details: {},
	resourceLogPages: {},
	workspaceAgents: null,
	workspaceAgentsDraft: "",
	workspaceAgentsDirty: false,
	workspaceAgentsSaving: false,
	activeWorkspaceId: "",
	navigationLoading: true,
	navigationError: "",
	routeProjection: {
		path: "",
		revision: 0,
		replace: true
	},
	workspaceMenuOpen: false,
	selectedId: "",
	lastResourceId: "",
	expandedProjects: /* @__PURE__ */ new Set(),
	projectOrder: [],
	taskOrder: {},
	sessionOrder: [],
	listDrag: null,
	expandedPaths: /* @__PURE__ */ new Set(),
	preview: null,
	diff: null,
	modalEnter: "",
	sessionMenu: null,
	taskOperationalStateKey: "",
	paneSizes: {
		sidebarWidth: 280,
		chatWidth: 420,
		sidebarSessionHeight: 210
	},
	settings: {
		open: false,
		identity: 0,
		dataVersion: 0,
		tab: "workspace",
		data: null,
		agentDirty: false,
		expandedAgents: /* @__PURE__ */ new Set(),
		suppressDraftSync: false,
		workspacePath: "",
		createWorkspace: false,
		saving: false,
		workspaceIconPickerId: "",
		workspaceIconSavingId: "",
		newProfile: {
			key: "",
			description: "",
			agentName: ""
		}
	},
	user: { name: "User" },
	notifications: {
		ready: false,
		workspaceId: "",
		store: null,
		settings: null,
		channel: null,
		tabId: "tab-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2),
		audioContext: null,
		soundError: "",
		permissionError: ""
	},
	createDialog: {
		open: false,
		identity: 0,
		type: "",
		projectId: "",
		templateName: "",
		templateFields: {},
		templateDirty: false,
		titleOverride: false,
		templateDigest: "",
		preview: null,
		previewing: false,
		title: "",
		description: "",
		detail: "",
		slug: "",
		selfDriving: false,
		agentName: "",
		preferredAgentProfiles: [],
		prompt: "",
		completionCriteria: "",
		submitting: false
	},
	selfDrivingDialog: {
		open: false,
		identity: 0,
		mode: "",
		resourceId: "",
		reuseRunId: "",
		reuseCurrentSession: false,
		agentName: "",
		expectedRevision: 0,
		expectedCondition: "",
		runInstructions: "",
		completionCriteria: "",
		submitting: false,
		error: "",
		unknown: false,
		returnFocus: null
	},
	uploadDialog: {
		open: false,
		identity: 0,
		runId: "",
		items: [],
		nextId: 1
	},
	autoRefreshTimer: null,
	autoRefreshInFlight: false,
	autoRefreshVersion: 0,
	agentRunProjectionVersion: 0,
	treeRequestVersion: 0,
	navigationVersion: 0,
	detailRequestVersion: 0,
	workspaceAgentsRequestVersion: 0,
	previewRequestVersion: 0,
	diffRequestVersion: 0,
	agentSessionMutationCount: 0,
	iconRefreshScheduled: false,
	mobile: {
		sidebarOpen: false,
		view: "details",
		immersive: false
	},
	agent: {
		runs: [],
		activeRunId: "",
		events: [],
		notices: [],
		stream: null,
		streamRunId: "",
		renderTimer: null,
		draftPrompt: "",
		ttyDraft: "",
		ttyMultiline: false,
		ttyDraftKey: "",
		ttyDraftWorkspaceId: "",
		ttyDraftResourceId: "",
		ttyDraftRunId: "",
		ttyDraftVersion: 0,
		ttyDraftResetVersion: 0,
		skipTTYDraftSync: false,
		agentName: "",
		optionsOpen: false,
		agentChooserOpen: false,
		historyOpen: false,
		selfDrivingExpanded: false,
		selfDrivingSaving: false,
		selfDrivingDisabling: false,
		newSessionStarting: false,
		sessionActionsOpen: false,
		eventsHasMore: false,
		historyBeforeId: 0,
		loadingOlder: false,
		sendingInputRunIds: /* @__PURE__ */ new Set(),
		turnStopping: false,
		turnStoppingRunId: "",
		sessionStopping: false,
		sessionStoppingRunId: "",
		switchingRunId: "",
		toolGroupOpen: /* @__PURE__ */ new Map(),
		approvalDrafts: /* @__PURE__ */ new Map(),
		selfDrivingFinishNoticeWatermarks: /* @__PURE__ */ new Map(),
		renderDeferredForSelection: false
	},
	tty: [{
		type: "system",
		text: "Forge GUI initialized."
	}, {
		type: "system",
		text: "Workspace data is loaded through forge CLI."
	}]
};
type ControllerState = { [Key in keyof typeof initialControllerState]: any };
const controllerState: ControllerState = initialControllerState;
const elementById = <ElementType extends HTMLElement = HTMLElement>(id: string): ElementType | null => document.getElementById(id) as ElementType | null;
const AUTO_REFRESH_INTERVAL_MS = 5e3;
const RESOURCE_LOG_INITIAL_LIMIT = 10;
const RESOURCE_LOG_MORE_LIMIT = 20;
const TASK_OUTPUT_FRESH_WINDOW_MS = 6e4;
const PANE_SIZE_KEY = "forge.gui.paneSizes";
const MOBILE_IMMERSIVE_KEY = "forge.gui.mobileImmersive";
const EXTERNAL_RESOURCE_LOCK_MESSAGE = "This resource is locked by an external session. New sessions and session input are unavailable until the lock is released; the Self-Driving switch remains available.";
const SELF_DRIVING_FINISH_NOTICE_KIND = "self-driving-finish";
const SELF_DRIVING_FINISH_NOTICE_WAITING_LIFECYCLE = "until-reconcile";
const SELF_DRIVING_RESUMABLE_STATES = /* @__PURE__ */ new Set([
	"waiting",
	"blocked",
	"error"
]);
const AGENT_DRAFT_STORAGE_PREFIX = "forge.gui.agentDraft.v1";
const AGENT_DRAFT_STORAGE_VERSION = 1;
const NOTIFICATION_STORAGE_PREFIX = "forge.gui.notifications.v1";
const NOTIFICATION_SETTINGS_KEY = `${NOTIFICATION_STORAGE_PREFIX}.settings`;
const NOTIFICATION_STORE_VERSION = 1;
const USER_SETTINGS_KEY = "forge.gui.user.v1";
const USER_SETTINGS_VERSION = 1;
const USER_NAME_MAX_LENGTH = 80;
const AGENT_DRAFT_MAX_ORPHAN_COUNT = 50;
const AGENT_DRAFT_MAX_AGE_MS = 7776e6;
const AGENT_HIDDEN_EVENT_TYPES = /* @__PURE__ */ new Set(["session.launch-environment"]);
const TASK_RUNNING_SESSION_STATES = /* @__PURE__ */ new Set([
	"starting",
	"running",
	"waiting_approval",
	"recovering"
]);
const DEFAULT_WORKSPACE_ICON = {
	id: "",
	label: "Forge default",
	src: "/favicon.svg",
	type: "image/svg+xml"
};
const WORKSPACE_ICONS = [
	{
		id: "home-base",
		label: "Home base",
		src: "/workspace-icons/01-home-base.png"
	},
	{
		id: "personal-tasks",
		label: "Personal tasks",
		src: "/workspace-icons/02-personal-tasks.png"
	},
	{
		id: "product-roadmap",
		label: "Product roadmap",
		src: "/workspace-icons/03-product-roadmap.png"
	},
	{
		id: "software-engineering",
		label: "Software engineering",
		src: "/workspace-icons/04-software-engineering.png"
	},
	{
		id: "design-studio",
		label: "Design studio",
		src: "/workspace-icons/05-design-studio.png"
	},
	{
		id: "marketing-campaign",
		label: "Marketing campaign",
		src: "/workspace-icons/06-marketing-campaign.png"
	},
	{
		id: "sales-pipeline",
		label: "Sales pipeline",
		src: "/workspace-icons/07-sales-pipeline.png"
	},
	{
		id: "operations",
		label: "Operations",
		src: "/workspace-icons/08-operations.png"
	},
	{
		id: "finance",
		label: "Finance",
		src: "/workspace-icons/09-finance.png"
	},
	{
		id: "research-lab",
		label: "Research lab",
		src: "/workspace-icons/10-research-lab.png"
	},
	{
		id: "learning-education",
		label: "Learning and education",
		src: "/workspace-icons/11-learning-education.png"
	},
	{
		id: "customer-support",
		label: "Customer support",
		src: "/workspace-icons/12-customer-support.png"
	},
	{
		id: "events-calendar",
		label: "Events and calendar",
		src: "/workspace-icons/13-events-calendar.png"
	},
	{
		id: "documentation-knowledge",
		label: "Documentation and knowledge",
		src: "/workspace-icons/14-documentation-knowledge.png"
	},
	{
		id: "analytics",
		label: "Analytics",
		src: "/workspace-icons/15-analytics.png"
	},
	{
		id: "community-team",
		label: "Community and team",
		src: "/workspace-icons/16-community-team.png"
	}
];
const WORKSPACE_ICON_BY_ID = new Map(WORKSPACE_ICONS.map((item) => [item.id, item]));
let createDialogIdentity = 0;
let selfDrivingDialogIdentity = 0;
let uploadDialogIdentity = 0;
let settingsIdentity = 0;
let createPreviewGeneration = 0;
let createPreviewController: AbortController | null = null;
let createPreviewPendingKey = "";
function svelteAgentOptions() {
	return enabledAgentConfigs().map((agent) => ({
		id: agent.id || "",
		label: agentDisplayName(agent),
		summary: agentConfigSummary(agent)
	}));
}
function publishAllViewModels() {
	renderAppShell();
	renderDetails();
	renderCreateDialog();
	renderSelfDrivingConfigDialog();
	renderAgentUploadDialog();
	renderTTYComposer();
	renderAgent();
	renderTTY();
	renderSettingsModal();
}
function notificationStorage() {
	try {
		return window.localStorage;
	} catch (_) {
		return null;
	}
}
function normalizeUserName(value) {
	const trimmed = String(value || "").trim();
	if (!trimmed) return "User";
	return Array.from(trimmed).slice(0, USER_NAME_MAX_LENGTH).join("") || "User";
}

function errorMessage(error: unknown, fallback = "Unexpected error"): string {
	if (error instanceof Error && error.message) return error.message;
	if (error && typeof error === "object" && "message" in error) return String(error.message || fallback);
	return String(error || fallback);
}
function decodeStoredUserName(raw) {
	if (!raw) return "User";
	try {
		const stored = JSON.parse(raw);
		if (!stored || stored.version !== USER_SETTINGS_VERSION) return "User";
		return normalizeUserName(stored.name);
	} catch (_) {
		return "User";
	}
}
function readStoredUserName() {
	try {
		return decodeStoredUserName(window.localStorage.getItem(USER_SETTINGS_KEY));
	} catch (_) {
		return "User";
	}
}
function currentUserName() {
	return normalizeUserName(controllerState.user?.name);
}
function saveStoredUserName(value) {
	const name = normalizeUserName(value);
	try {
		window.localStorage.setItem(USER_SETTINGS_KEY, JSON.stringify({
			version: USER_SETTINGS_VERSION,
			name
		}));
	} catch (_) {
		return false;
	}
	controllerState.user.name = name;
	return true;
}
function installUserSettingsCrossTabListener() {
	lifecycle?.listen(window, "storage", (event) => {
		if (event.key !== USER_SETTINGS_KEY) return;
		controllerState.user.name = decodeStoredUserName(event.newValue);
		if (controllerState.settings.open && controllerState.settings.tab === "user") renderSettingsModal();
	});
}
function notificationStateKey(workspaceId = controllerState.notifications.workspaceId) {
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
function readNotificationStore(workspaceId = controllerState.notifications.workspaceId) {
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
	if (!storage || !key || !controllerState.notifications.store) return;
	controllerState.notifications.store = normalizeNotificationStore(controllerState.notifications.store);
	try {
		storage.setItem(key, JSON.stringify(controllerState.notifications.store));
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
	if (!storage || !controllerState.notifications.settings) return;
	try {
		storage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify({
			version: NOTIFICATION_STORE_VERSION,
			browser: Boolean(controllerState.notifications.settings.browser),
			sound: Boolean(controllerState.notifications.settings.sound)
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
	controllerState.notifications.workspaceId = nextWorkspace;
	controllerState.notifications.store = readNotificationStore(nextWorkspace);
	controllerState.notifications.settings = readNotificationSettings();
	if (notificationPermission() !== "granted") {
		controllerState.notifications.settings.browser = false;
		writeNotificationSettings();
	}
	controllerState.notifications.ready = false;
	controllerState.notifications.permissionError = "";
	openNotificationChannel(nextWorkspace);
}
function openNotificationChannel(workspaceId) {
	const Channel = window.BroadcastChannel || globalThis.BroadcastChannel;
	if (typeof Channel !== "function") return;
	try {
		const channel = new Channel(`${NOTIFICATION_STORAGE_PREFIX}.${encodeURIComponent(workspaceId)}`);
		channel.onmessage = (event) => handleNotificationBroadcast(event.data);
		controllerState.notifications.channel = channel;
	} catch (_) {
		controllerState.notifications.channel = null;
	}
}
function closeNotificationChannel() {
	try {
		controllerState.notifications.channel?.close();
	} catch (_) {}
	controllerState.notifications.channel = null;
}
function broadcastNotification(message) {
	try {
		controllerState.notifications.channel?.postMessage({
			...message,
			workspaceId: controllerState.notifications.workspaceId,
			sourceTabId: controllerState.notifications.tabId
		});
	} catch (_) {}
}
function handleNotificationBroadcast(message) {
	if (!message || message.workspaceId !== controllerState.notifications.workspaceId || message.sourceTabId === controllerState.notifications.tabId) return;
	const store = controllerState.notifications.store || notificationDefaultStore();
	if (message.type === "effect" && message.effectKey) {
		if (!store.effects.some((item) => item.key === message.effectKey)) {
			store.effects.push({
				key: message.effectKey,
				at: Number(message.at) || Date.now()
			});
			controllerState.notifications.store = store;
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
			controllerState.notifications.store = store;
			writeNotificationStore();
			broadcastNotification({
				type: "clear-resource",
				resourceId: record.resourceId
			});
			if (controllerState.tree) renderSessions();
			return;
		}
		if (!store.unread.some((item) => item.marker === record.marker)) store.unread.push(record);
		controllerState.notifications.store = store;
		writeNotificationStore();
		if (controllerState.tree) {
			renderSessions();
			refreshIcons();
		}
		return;
	}
	if (message.type === "clear-marker" && message.marker) {
		store.unread = store.unread.filter((item) => item.marker !== message.marker);
		store.pending = store.pending.filter((item) => item.marker !== message.marker);
		controllerState.notifications.store = store;
		writeNotificationStore();
		if (controllerState.tree) renderSessions();
		return;
	}
	if (message.type === "clear-resource" && message.resourceId) {
		const resourceId = String(message.resourceId);
		store.unread = store.unread.filter((item) => item.resourceId !== resourceId);
		store.pending = store.pending.filter((item) => item.resourceId !== resourceId);
		controllerState.notifications.store = store;
		writeNotificationStore();
		if (controllerState.tree) renderSessions();
	}
}
function notificationStore() {
	if (!controllerState.notifications.store) controllerState.notifications.store = notificationDefaultStore();
	return controllerState.notifications.store;
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
	if (item?.source === "internal" || item?.source === "external") return sessionNavigationTarget(item).primaryResourceId || "";
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
	const selfDriving = findResource(resourceId)?.selfDriving;
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
	const resource = findResource(resourceId);
	const selfDriving = notificationSelfDrivingContext(item, resourceId);
	return notificationRecord({
		workspaceId: controllerState.notifications.workspaceId,
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
	if (!record?.resourceId || controllerState.selectedId !== record.resourceId) return false;
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
	controllerState.notifications.store = store;
}
function claimNotificationEffect(record, kind) {
	const key = notificationEffectKey(record, kind);
	const store = notificationStore();
	if (store.effects.some((item) => item.key === key)) return false;
	store.effects.push({
		key,
		at: Date.now()
	});
	controllerState.notifications.store = store;
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
		Promise.resolve(locks.request(`forge.gui.notification.${controllerState.notifications.workspaceId}.${notificationEffectKey(record, kind)}`, { ifAvailable: true }, (lock) => {
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
	if (!controllerState.notifications.settings?.sound) return;
	const AudioContext = window.AudioContext || window.webkitAudioContext;
	if (typeof AudioContext !== "function") {
		controllerState.notifications.soundError = "Audio is unavailable in this browser.";
		if (controllerState.settings.open && controllerState.settings.tab === "notifications") renderSettingsModal();
		return;
	}
	try {
		const audio = controllerState.notifications.audioContext || new AudioContext();
		controllerState.notifications.audioContext = audio;
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
			controllerState.notifications.soundError = "Chrome blocked completion sound until audio is enabled by the page.";
			console.warn("completion sound unavailable", err);
			if (controllerState.settings.open && controllerState.settings.tab === "notifications") renderSettingsModal();
		});
		else start();
	} catch (err) {
		controllerState.notifications.soundError = "Completion sound is unavailable right now.";
		console.warn("completion sound unavailable", err);
		if (controllerState.settings.open && controllerState.settings.tab === "notifications") renderSettingsModal();
	}
}
function sendBrowserNotification(record, alreadyClaimed = false) {
	if (!controllerState.notifications.settings?.browser || notificationPermission() !== "granted") return;
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
	if (controllerState.notifications.settings?.browser && notificationPermission() === "granted") withNotificationEffectClaim(record, "browser", () => sendBrowserNotification(record, true));
	if (controllerState.notifications.settings?.sound) withNotificationEffectClaim(record, "sound", playCompletionSound);
}
function observeCompletion(item, completionState = "") {
	const marker = notificationMarkerFor(item);
	const sessionId = notificationSessionIDFor(item);
	if (!marker || !sessionId || !controllerState.notifications.workspaceId) return false;
	const record = notificationRecordFor(item, marker, completionState);
	if (!record?.sessionId) return false;
	const store = notificationStore();
	const seen = store.seen.some((entry) => entry.marker === marker);
	const pendingIndex = store.pending.findIndex((entry) => entry.marker === marker);
	const selfDriving = notificationSelfDrivingContext(item, record.resourceId);
	if (!controllerState.notifications.ready) {
		if (!seen) store.seen.push({
			marker,
			at: Date.now()
		});
		store.pending = store.pending.filter((entry) => entry.marker !== marker);
		controllerState.notifications.store = store;
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
		controllerState.notifications.store = store;
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
		controllerState.notifications.store = store;
		writeNotificationStore();
		return false;
	}
	if (selfDriving.isSelfDriving && selfDriving.suppressed && !selfDriving.final) {
		if (!seen) store.seen.push({
			marker,
			at: Date.now()
		});
		if (pendingIndex < 0) store.pending.push(record);
		controllerState.notifications.store = store;
		writeNotificationStore();
		return false;
	}
	if (!seen) store.seen.push({
		marker,
		at: Date.now()
	});
	store.pending = store.pending.filter((entry) => entry.marker !== marker);
	if (notificationRecordIsCurrentAndVisible(record)) {
		controllerState.notifications.store = store;
		writeNotificationStore();
		return false;
	}
	store.unread = store.unread.filter((entry) => entry.marker !== marker);
	store.unread.push(record);
	controllerState.notifications.store = store;
	writeNotificationStore();
	broadcastNotification({
		type: "record",
		record
	});
	deliverCompletionEffects(record);
	if (controllerState.tree) {
		renderSessions();
		refreshIcons();
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
	if (controllerState.notifications.ready) return;
	observeCompletionProjections(controllerState.tree?.sessions || []);
	observeCompletionProjections(controllerState.agent.runs || []);
	controllerState.notifications.ready = true;
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
	controllerState.notifications.store = store;
	writeNotificationStore();
	broadcastNotification({
		type: "clear-marker",
		marker: value
	});
	if (controllerState.tree) renderSessions();
}
function clearUnreadForResource(resourceId) {
	const value = String(resourceId || "").trim();
	if (!value) return;
	const store = notificationStore();
	if (!(store.unread.some((record) => record.resourceId === value) || store.pending.some((record) => record.resourceId === value))) return;
	store.unread = store.unread.filter((record) => record.resourceId !== value);
	store.pending = store.pending.filter((record) => record.resourceId !== value);
	controllerState.notifications.store = store;
	writeNotificationStore();
	broadcastNotification({
		type: "clear-resource",
		resourceId: value
	});
	if (controllerState.tree) renderSessions();
}
function notificationSettingsChanged() {
	writeNotificationSettings();
	if (controllerState.settings.open && controllerState.settings.tab === "notifications") renderSettingsModal();
}
async function requestBrowserNotifications() {
	const permission = notificationPermission();
	if (permission === "unsupported") {
		controllerState.notifications.settings.browser = false;
		controllerState.notifications.permissionError = "Browser notifications are not supported here.";
		notificationSettingsChanged();
		return permission;
	}
	if (permission === "denied") {
		controllerState.notifications.settings.browser = false;
		controllerState.notifications.permissionError = "Chrome denied permission. Restore it in Chrome site settings; Forge will not ask again automatically.";
		notificationSettingsChanged();
		return permission;
	}
	let nextPermission = permission;
	if (permission === "default") try {
		nextPermission = await window.Notification.requestPermission();
	} catch (err) {
		controllerState.notifications.permissionError = "Chrome could not request notification permission.";
		console.warn("notification permission request failed", err);
	}
	if (nextPermission === "granted") {
		controllerState.notifications.settings.browser = true;
		controllerState.notifications.permissionError = "";
	} else {
		controllerState.notifications.settings.browser = false;
		controllerState.notifications.permissionError = nextPermission === "denied" ? "Chrome denied permission. Restore it in Chrome site settings; Forge will not ask again automatically." : "Notification permission is still pending.";
	}
	notificationSettingsChanged();
	return nextPermission;
}
function setBrowserNotificationsEnabled(enabled) {
	controllerState.notifications.settings = controllerState.notifications.settings || readNotificationSettings();
	if (!enabled) {
		controllerState.notifications.settings.browser = false;
		controllerState.notifications.permissionError = "";
		notificationSettingsChanged();
		return;
	}
	requestBrowserNotifications().catch((err) => {
		controllerState.notifications.settings.browser = false;
		controllerState.notifications.permissionError = "Chrome could not request notification permission.";
		console.warn("notification permission request failed", err);
		notificationSettingsChanged();
	});
}
function initializeCompletionAudio() {
	const AudioContext = window.AudioContext || window.webkitAudioContext;
	if (typeof AudioContext !== "function") {
		controllerState.notifications.soundError = "Audio is unavailable in this browser.";
		notificationSettingsChanged();
		return Promise.resolve(false);
	}
	try {
		controllerState.notifications.audioContext = controllerState.notifications.audioContext || new AudioContext();
		const resume = controllerState.notifications.audioContext.resume?.();
		return Promise.resolve(resume).then(() => {
			controllerState.notifications.soundError = "";
			notificationSettingsChanged();
			return true;
		}).catch((err) => {
			controllerState.notifications.soundError = "Chrome may block sound until the page receives an audio gesture.";
			console.warn("completion audio initialization failed", err);
			notificationSettingsChanged();
			return false;
		});
	} catch (err) {
		controllerState.notifications.soundError = "Completion sound is unavailable right now.";
		console.warn("completion audio initialization failed", err);
		notificationSettingsChanged();
		return Promise.resolve(false);
	}
}
function setCompletionSoundEnabled(enabled) {
	controllerState.notifications.settings = controllerState.notifications.settings || readNotificationSettings();
	controllerState.notifications.settings.sound = Boolean(enabled);
	controllerState.notifications.soundError = "";
	notificationSettingsChanged();
	if (enabled) initializeCompletionAudio();
}
async function navigateToNotification(record) {
	if (!record?.resourceId) return;
	try {
		await selectResource(record.resourceId, {
			clearUnread: false,
			forceDetail: true
		});
		if (record.runId) {
			const run = controllerState.agent.runs.find((item) => item.id === record.runId);
			if (run) {
				controllerState.agent.activeRunId = run.id;
				renderAgent();
				renderTTY();
				refreshIcons();
			}
		}
	} finally {
		clearUnreadForMarker(record.marker);
	}
}
function installNotificationCrossTabListeners() {
	lifecycle?.listen(window, "storage", (event) => {
		if (event.key === notificationStateKey() && event.newValue) {
			controllerState.notifications.store = readNotificationStore();
			if (controllerState.tree) renderSessions();
		}
		if (event.key === NOTIFICATION_SETTINGS_KEY) {
			controllerState.notifications.settings = readNotificationSettings();
			if (notificationPermission() !== "granted") controllerState.notifications.settings.browser = false;
			if (controllerState.settings.open && controllerState.settings.tab === "notifications") renderSettingsModal();
		}
	});
	lifecycle?.listen(document, "visibilitychange", () => {
		flushAgentDraftOnPageLeave();
		if (notificationPageIsVisibleAndFocused()) clearUnreadForResource(controllerState.selectedId);
	});
	lifecycle?.listen(window, "focus", () => clearUnreadForResource(controllerState.selectedId));
}
function agentDraftStorage() {
	try {
		return window.localStorage;
	} catch (_) {
		return null;
	}
}
function agentDraftStoragePart(value) {
	return encodeURIComponent(String(value || "").trim());
}
function agentDraftSessionIdentity(run) {
	return String(run?.agentHubSessionId || run?.sourceExternalId || run?.id || "").trim();
}
function agentDraftResourceScope(resourceId) {
	return String(resourceId || "").trim() || "workspace";
}
function agentDraftKeyForRun(run, workspaceId = controllerState.activeWorkspaceId) {
	const workspace = String(workspaceId || "").trim();
	const session = agentDraftSessionIdentity(run);
	if (!workspace || !session) return "";
	return `${AGENT_DRAFT_STORAGE_PREFIX}.session.${agentDraftStoragePart(workspace)}.${agentDraftStoragePart(session)}`;
}
function agentDraftRecord(raw) {
	try {
		const record = JSON.parse(raw);
		if (!record || record.version !== AGENT_DRAFT_STORAGE_VERSION || typeof record.text !== "string") return null;
		return record;
	} catch (_) {
		return null;
	}
}
function readAgentDraftRecord(key) {
	const storage = agentDraftStorage();
	if (!storage || !key) return null;
	let raw = "";
	try {
		raw = storage.getItem(key) || "";
	} catch (_) {
		return null;
	}
	if (!raw) return null;
	const record = agentDraftRecord(raw);
	if (record) return record;
	try {
		storage.removeItem(key);
	} catch (_) {}
	return null;
}
function readAgentDraft(key) {
	const record = readAgentDraftRecord(key);
	if (!record) return "";
	if (!record.text) {
		removeAgentDraft(key);
		return "";
	}
	return record.text;
}
function removeAgentDraft(key) {
	const storage = agentDraftStorage();
	if (!storage || !key) return;
	try {
		storage.removeItem(key);
	} catch (_) {}
}
function agentDraftProtectedKeys(workspaceId, resourceId) {
	const protectedKeys = /* @__PURE__ */ new Set();
	if (controllerState.agent.ttyDraftWorkspaceId === workspaceId && controllerState.agent.ttyDraftResourceId === resourceId && controllerState.agent.ttyDraftKey) protectedKeys.add(controllerState.agent.ttyDraftKey);
	for (const run of controllerState.agent.runs || []) {
		if (agentDraftResourceScope(run.resourceId) !== resourceId) continue;
		const key = agentDraftKeyForRun(run, workspaceId);
		if (key) protectedKeys.add(key);
	}
	return protectedKeys;
}
function pruneAgentDraftStorage(workspaceId = controllerState.activeWorkspaceId, resourceId = controllerState.agent.ttyDraftResourceId) {
	const storage = agentDraftStorage();
	const workspace = String(workspaceId || "").trim();
	const resource = agentDraftResourceScope(resourceId);
	if (!storage || !workspace || !resource) return;
	const prefix = `${AGENT_DRAFT_STORAGE_PREFIX}.session.${agentDraftStoragePart(workspace)}.`;
	const protectedKeys = agentDraftProtectedKeys(workspace, resource);
	const candidates: Array<{ key: string; updatedAt: number }> = [];
	const now = Date.now();
	try {
		for (let index = 0; index < storage.length; index++) {
			const key = storage.key(index);
			if (!key || !key.startsWith(prefix)) continue;
			const record = readAgentDraftRecord(key);
			if (!record || agentDraftResourceScope(record.resourceId) !== resource || protectedKeys.has(key)) continue;
			if (!record.text) {
				storage.removeItem(key);
				continue;
			}
			const updatedAt = Number(record.updatedAt) || 0;
			if (updatedAt > 0 && now - updatedAt > AGENT_DRAFT_MAX_AGE_MS) {
				storage.removeItem(key);
				continue;
			}
			candidates.push({
				key,
				updatedAt
			});
		}
		candidates.sort((left, right) => left.updatedAt - right.updatedAt);
		while (candidates.length > AGENT_DRAFT_MAX_ORPHAN_COUNT) {
			const candidate = candidates.shift();
			if (candidate) removeAgentDraft(candidate.key);
		}
	} catch (_) {}
}
function writeAgentDraft(key, text, context: any = {}) {
	if (!key) return;
	if (!text) {
		removeAgentDraft(key);
		return;
	}
	const storage = agentDraftStorage();
	if (!storage) return;
	try {
		storage.setItem(key, JSON.stringify({
			version: AGENT_DRAFT_STORAGE_VERSION,
			text,
			updatedAt: Date.now(),
			workspaceId: context.workspaceId || "",
			resourceId: context.resourceId || "",
			runId: context.runId || "",
			sessionId: context.sessionId || ""
		}));
	} catch (_) {}
}
function persistAgentDraft() {
	const key = controllerState.agent.ttyDraftKey;
	if (!key) return;
	writeAgentDraft(key, controllerState.agent.ttyDraft, {
		workspaceId: controllerState.agent.ttyDraftWorkspaceId,
		resourceId: controllerState.agent.ttyDraftResourceId,
		runId: controllerState.agent.ttyDraftRunId,
		sessionId: agentDraftSessionIdentity(currentAgentRun())
	});
	pruneAgentDraftStorage(controllerState.agent.ttyDraftWorkspaceId, controllerState.agent.ttyDraftResourceId);
}
function updateAgentDraft(text, persist = true) {
	const next = String(text ?? "");
	if (controllerState.agent.ttyDraft !== next) {
		controllerState.agent.ttyDraft = next;
		controllerState.agent.ttyDraftVersion++;
	}
	controllerState.agent.ttyMultiline = next.includes("\n");
	if (persist) persistAgentDraft();
}
function clearAgentDraftMemory() {
	controllerState.agent.ttyDraft = "";
	controllerState.agent.ttyMultiline = false;
	controllerState.agent.ttyDraftKey = "";
	controllerState.agent.ttyDraftWorkspaceId = "";
	controllerState.agent.ttyDraftResourceId = "";
	controllerState.agent.ttyDraftRunId = "";
	controllerState.agent.ttyDraftVersion++;
}
function restoreAgentDraftForRun(run, workspaceId = controllerState.activeWorkspaceId) {
	const key = agentDraftKeyForRun(run, workspaceId);
	if (!key) {
		clearAgentDraftMemory();
		return;
	}
	if (controllerState.agent.ttyDraftKey === key) return;
	controllerState.agent.ttyDraftKey = key;
	controllerState.agent.ttyDraftWorkspaceId = String(workspaceId || "").trim();
	controllerState.agent.ttyDraftResourceId = agentDraftResourceScope(run.resourceId);
	controllerState.agent.ttyDraftRunId = String(run.id || "");
	controllerState.agent.ttyDraft = readAgentDraft(key);
	controllerState.agent.ttyMultiline = controllerState.agent.ttyDraft.includes("\n");
	controllerState.agent.ttyDraftVersion++;
	pruneAgentDraftStorage(controllerState.agent.ttyDraftWorkspaceId, controllerState.agent.ttyDraftResourceId);
}
function flushAgentDraft() {
	persistAgentDraft();
}
function clearAgentDraftAfterAccepted({ workspaceId, runId, key, text, version }) {
	if (controllerState.activeWorkspaceId !== workspaceId || controllerState.agent.activeRunId !== runId || controllerState.agent.ttyDraftKey !== key || controllerState.agent.ttyDraft !== text || controllerState.agent.ttyDraftVersion !== version) return false;
	removeAgentDraft(key);
	updateAgentDraft("", false);
	return true;
}
async function api(path, options: any = {}) {
	const response = await fetch(path, {
		headers: { "Content-Type": "application/json" },
		...options
	});
	if (!response.ok) {
		let message = `${response.status} ${response.statusText}`;
		try {
			message = (await response.json()).error || message;
		} catch (_) {}
		const error: any = new Error(message);
		error.status = response.status;
		throw error;
	}
	if (response.status === 204) return null;
	return response.json();
}
async function load() {
	const route = parseRoute();
	const [base, agentHub] = await Promise.all([api("/api/workspaces"), api("/api/settings/agenthub")]);
	controllerState.config = configWithAgentHubCatalog(base, agentHub);
	applyAgentConfig();
	controllerState.activeWorkspaceId = workspaceExists(route.workspaceId) ? route.workspaceId : controllerState.config.activeId || controllerState.config.workspaces[0]?.id || "";
	controllerState.selectedId = route.resourceId || "workspace";
	renderWorkspaceSelect();
	if (controllerState.activeWorkspaceId) {
		initializeNotificationState(controllerState.activeWorkspaceId);
		await loadUIState();
		if (!route.resourceId && controllerState.lastResourceId) controllerState.selectedId = controllerState.lastResourceId;
		await loadTree({ replaceURL: true });
	} else {
		controllerState.navigationLoading = false;
		controllerState.tree = null;
		controllerState.details = {};
		controllerState.resourceLogPages = {};
		controllerState.workspaceAgents = null;
		controllerState.preview = null;
		controllerState.diff = null;
		resetAgentState();
		publishViewModels();
	}
}
async function loadTree(options: any = {}) {
	if (!controllerState.activeWorkspaceId) return;
	const workspaceId = controllerState.activeWorkspaceId;
	const navigationVersion = controllerState.navigationVersion;
	const treeRequestVersion = ++controllerState.treeRequestVersion;
	controllerState.navigationLoading = true;
	controllerState.navigationError = "";
	renderAppShell();
	controllerState.detailRequestVersion++;
	controllerState.workspaceAgentsRequestVersion++;
	controllerState.previewRequestVersion++;
	controllerState.diffRequestVersion++;
	let tree;
	try {
		tree = await api(`/api/workspaces/${workspaceId}/tree`);
	} catch (err) {
		if (isCurrentWorkspaceView(workspaceId, navigationVersion, treeRequestVersion)) {
			controllerState.navigationLoading = false;
			controllerState.navigationError = errorMessage(err);
			renderAppShell();
		}
		throw err;
	}
	if (!isCurrentWorkspaceView(workspaceId, navigationVersion, treeRequestVersion)) return;
	controllerState.tree = tree;
	controllerState.details = {};
	controllerState.resourceLogPages = {};
	controllerState.workspaceAgents = null;
	controllerState.workspaceAgentsSaving = false;
	controllerState.preview = null;
	controllerState.diff = null;
	ensureValidSelection();
	ensureSelectedProjectExpanded(false);
	if (controllerState.selectedId === "workspace") await loadWorkspaceAgents();
	else if (controllerState.selectedId) await loadDetail(controllerState.selectedId);
	if (!isCurrentWorkspaceView(workspaceId, navigationVersion, treeRequestVersion)) return;
	await loadAgentRuns();
	if (!isCurrentWorkspaceView(workspaceId, navigationVersion, treeRequestVersion)) return;
	if (!controllerState.notifications.ready) establishNotificationBaseline();
	controllerState.navigationLoading = false;
	controllerState.navigationError = "";
	publishViewModels();
	if (options.updateURL !== false) syncURL({ replace: Boolean(options.replaceURL) });
}
async function loadDetail(id, options: any = {}) {
	if (!id || id === "workspace" || controllerState.details[id] && !options.force) return;
	if (options.force) {
		resetResourceLogState(id);
		delete controllerState.details[id];
	}
	const workspaceId = controllerState.activeWorkspaceId;
	const navigationVersion = controllerState.navigationVersion;
	const detailRequestVersion = ++controllerState.detailRequestVersion;
	const detail = await fetchDetail(id, workspaceId, { logsLimit: RESOURCE_LOG_INITIAL_LIMIT });
	if (!isCurrentWorkspaceView(workspaceId, navigationVersion) || controllerState.selectedId !== id || detailRequestVersion !== controllerState.detailRequestVersion) return null;
	return applyResourceDetail(detail, "replace");
}
function fetchDetail(id, workspaceId = controllerState.activeWorkspaceId, options: any = {}) {
	const params = new URLSearchParams();
	const cursor = options.logsCursor === void 0 ? options.cursor : options.logsCursor;
	const limit = options.logsLimit === void 0 ? options.limit === void 0 ? RESOURCE_LOG_INITIAL_LIMIT : options.limit : options.logsLimit;
	params.set("logsLimit", String(limit));
	if (cursor !== void 0 && cursor !== null && String(cursor) !== "") params.set("logsCursor", String(cursor));
	return api(`/api/workspaces/${workspaceId}/resources/${encodeURIComponent(id)}?${params.toString()}`);
}
function resetResourceLogState(resourceId) {
	if (!controllerState.resourceLogPages) controllerState.resourceLogPages = {};
	if (resourceId) delete controllerState.resourceLogPages[resourceId];
}
function resourceLogPage(resourceId) {
	if (!controllerState.resourceLogPages) controllerState.resourceLogPages = {};
	if (!controllerState.resourceLogPages[resourceId]) controllerState.resourceLogPages[resourceId] = {
		loaded: false,
		hasMore: false,
		nextCursor: "",
		loading: false,
		error: "",
		requestVersion: 0
	};
	return controllerState.resourceLogPages[resourceId];
}
function resourceLogEntries(detail) {
	if (Array.isArray(detail?.logs) && detail.logs.length) return detail.logs;
	if (Array.isArray(detail?.logPage?.entries)) return detail.logPage.entries;
	return Array.isArray(detail?.logs) ? detail.logs : [];
}
function mergeResourceLogs(existing, incoming, prepend) {
	const next: any[] = [];
	const byID = /* @__PURE__ */ new Map();
	const add = (entry, replaceDuplicate) => {
		const id = String(entry?.id || "");
		if (id && byID.has(id)) {
			if (replaceDuplicate) next[byID.get(id)] = entry;
			return;
		}
		if (id) byID.set(id, next.length);
		next.push(entry);
	};
	const first = prepend ? incoming : existing;
	const second = prepend ? existing : incoming;
	for (const entry of first || []) add(entry, false);
	for (const entry of second || []) add(entry, !prepend);
	return next.sort(compareLogTimeDesc);
}
function resourceDetailSnapshot(resourceId) {
	const page = controllerState.resourceLogPages?.[resourceId];
	return {
		detail: controllerState.details[resourceId] || null,
		page: page ? {
			loaded: page.loaded,
			hasMore: page.hasMore,
			nextCursor: page.nextCursor,
			loading: page.loading,
			error: page.error
		} : null
	};
}
function applyResourceDetail(detail, mode = "head") {
	if (!detail?.id) return null;
	const resourceId = detail.id;
	const incoming = resourceLogEntries(detail);
	const incomingPage = detail.logPage || null;
	const page = resourceLogPage(resourceId);
	if (mode === "replace" || !page.loaded || !controllerState.details[resourceId]) {
		page.loaded = true;
		page.hasMore = Boolean(incomingPage?.hasMore);
		page.nextCursor = String(incomingPage?.nextCursor || "");
		page.error = "";
		const logs = mergeResourceLogs([], incoming, true);
		controllerState.details[resourceId] = {
			...detail,
			logs,
			logPage: {
				hasMore: page.hasMore,
				nextCursor: page.nextCursor
			}
		};
		return controllerState.details[resourceId];
	}
	const current = controllerState.details[resourceId];
	const logs = mergeResourceLogs(current.logs || [], incoming, mode !== "older");
	if (mode === "older" && incomingPage) {
		page.hasMore = Boolean(incomingPage.hasMore);
		page.nextCursor = String(incomingPage.nextCursor || "");
	}
	page.loaded = true;
	page.error = "";
	const nextDetail = mode === "older" ? current : {
		...current,
		...detail
	};
	controllerState.details[resourceId] = {
		...nextDetail,
		logs,
		logPage: {
			hasMore: page.hasMore,
			nextCursor: page.nextCursor
		}
	};
	return controllerState.details[resourceId];
}
async function loadMoreLogs(resourceId = controllerState.selectedId) {
	if (!resourceId || resourceId === "workspace" || controllerState.selectedId !== resourceId) return;
	const page = resourceLogPage(resourceId);
	if (!page.loaded || !page.hasMore || page.loading) return;
	const cursor = String(page.nextCursor || "");
	if (!cursor) {
		page.error = "The log page did not provide a continuation cursor.";
		renderDetails();
		return;
	}
	const workspaceId = controllerState.activeWorkspaceId;
	const navigationVersion = controllerState.navigationVersion;
	const requestVersion = ++page.requestVersion;
	page.loading = true;
	page.error = "";
	renderDetails();
	try {
		const detail = await fetchDetail(resourceId, workspaceId, {
			logsCursor: cursor,
			logsLimit: RESOURCE_LOG_MORE_LIMIT
		});
		if (!isCurrentWorkspaceView(workspaceId, navigationVersion) || controllerState.selectedId !== resourceId || controllerState.resourceLogPages[resourceId] !== page || requestVersion !== page.requestVersion) return;
		applyResourceDetail(detail, "older");
	} catch (err) {
		if (isCurrentWorkspaceView(workspaceId, navigationVersion) && controllerState.selectedId === resourceId && controllerState.resourceLogPages[resourceId] === page && requestVersion === page.requestVersion) page.error = errorMessage(err, "Could not load older logs.");
	} finally {
		if (isCurrentWorkspaceView(workspaceId, navigationVersion) && controllerState.selectedId === resourceId && controllerState.resourceLogPages[resourceId] === page && requestVersion === page.requestVersion) {
			page.loading = false;
			renderDetails();
			refreshIcons();
		}
	}
}
async function loadWorkspaceAgents(options: any = {}) {
	if (!controllerState.activeWorkspaceId || controllerState.workspaceAgents && !options.force) return;
	const workspaceId = controllerState.activeWorkspaceId;
	const navigationVersion = controllerState.navigationVersion;
	const requestVersion = ++controllerState.workspaceAgentsRequestVersion;
	try {
		const agents = await api(`/api/workspaces/${workspaceId}/files?path=${encodeURIComponent("AGENTS.md")}`);
		if (!isCurrentWorkspaceView(workspaceId, navigationVersion) || requestVersion !== controllerState.workspaceAgentsRequestVersion) return null;
		controllerState.workspaceAgents = agents;
	} catch (err) {
		if (!isCurrentWorkspaceView(workspaceId, navigationVersion) || requestVersion !== controllerState.workspaceAgentsRequestVersion) return null;
		controllerState.workspaceAgents = {
			path: "AGENTS.md",
			name: "AGENTS.md",
			error: errorMessage(err)
		};
	}
	return controllerState.workspaceAgents;
}
async function loadUIState(workspaceId = controllerState.activeWorkspaceId, navigationVersion = controllerState.navigationVersion) {
	const uiState = await api(`/api/workspaces/${workspaceId}/ui-state`);
	if (!isCurrentWorkspaceView(workspaceId, navigationVersion)) return false;
	controllerState.expandedProjects = new Set(uiState.expandedProjects || []);
	controllerState.lastResourceId = uiState.lastResourceId || "";
	controllerState.projectOrder = Array.isArray(uiState.projectOrder) ? uiState.projectOrder : [];
	controllerState.taskOrder = uiState.taskOrder && typeof uiState.taskOrder === "object" ? uiState.taskOrder : {};
	controllerState.sessionOrder = Array.isArray(uiState.sessionOrder) ? uiState.sessionOrder : [];
	return true;
}
async function saveUIState() {
	if (!controllerState.activeWorkspaceId) return;
	const workspaceId = controllerState.activeWorkspaceId;
	const navigationVersion = controllerState.navigationVersion;
	const selectedId = controllerState.selectedId;
	await api(`/api/workspaces/${workspaceId}/ui-state`, {
		method: "PUT",
		body: JSON.stringify({
			version: 1,
			expandedProjects: [...controllerState.expandedProjects],
			lastResourceId: selectedId,
			projectOrder: controllerState.projectOrder,
			taskOrder: controllerState.taskOrder,
			sessionOrder: controllerState.sessionOrder
		})
	});
	if (isCurrentWorkspaceView(workspaceId, navigationVersion)) controllerState.lastResourceId = selectedId;
}
function startAutoRefresh() {
	if (controllerState.autoRefreshTimer) return;
	controllerState.autoRefreshTimer = lifecycle?.interval(() => {
		autoRefresh().catch((err) => {
			console.warn("auto refresh failed", err);
		});
	}, AUTO_REFRESH_INTERVAL_MS);
}
async function autoRefresh() {
	if (!controllerState.activeWorkspaceId || controllerState.autoRefreshInFlight || controllerState.agentSessionMutationCount > 0 || controllerState.listDrag) return;
	const refreshVersion = controllerState.autoRefreshVersion;
	const workspaceId = controllerState.activeWorkspaceId;
	const navigationVersion = controllerState.navigationVersion;
	let selectedId = controllerState.selectedId;
	controllerState.autoRefreshInFlight = true;
	try {
		const tree = await fetchCurrentTree(workspaceId);
		if (!tree || !isCurrentAutoRefresh(workspaceId, navigationVersion, refreshVersion)) return;
		let changed = !sameJSON(controllerState.tree, tree);
		if (changed) controllerState.tree = tree;
		if (typeof observeCompletionProjections === "function") observeCompletionProjections(tree.sessions || []);
		if (changed && controllerState.preview?.section === "Wiki" && !controllerState.preview.loading) {
			await refreshFilePreview("Wiki", controllerState.preview.path);
			if (!isCurrentAutoRefresh(workspaceId, navigationVersion, refreshVersion)) return;
		}
		if (ensureValidSelection()) {
			syncURL({ replace: true });
			changed = true;
			selectedId = controllerState.selectedId;
		}
		const expandedCount = controllerState.expandedProjects.size;
		ensureSelectedProjectExpanded(false);
		changed = changed || expandedCount !== controllerState.expandedProjects.size;
		if (controllerState.selectedId === "workspace") {
			const previousAgents = controllerState.workspaceAgents;
			await loadWorkspaceAgents({ force: true });
			if (!isCurrentAutoRefresh(workspaceId, navigationVersion, refreshVersion)) return;
			if (!sameJSON(previousAgents, controllerState.workspaceAgents)) changed = true;
		} else if (selectedId) {
			const detailRequestVersion = ++controllerState.detailRequestVersion;
			const detail = await fetchDetail(selectedId, workspaceId, { logsLimit: RESOURCE_LOG_INITIAL_LIMIT });
			if (!isCurrentAutoRefresh(workspaceId, navigationVersion, refreshVersion) || controllerState.selectedId !== selectedId || detailRequestVersion !== controllerState.detailRequestVersion) return;
			const previousDetail = resourceDetailSnapshot(selectedId);
			applyResourceDetail(detail, "head");
			if (!sameJSON(previousDetail, resourceDetailSnapshot(selectedId))) changed = true;
		}
		controllerState.agentRunProjectionVersion = (Number(controllerState.agentRunProjectionVersion) || 0) + 1;
		const agentRunProjectionVersion = controllerState.agentRunProjectionVersion;
		const runs = await fetchAgentRuns();
		if (!isCurrentAutoRefresh(workspaceId, navigationVersion, refreshVersion) || agentRunProjectionVersion !== controllerState.agentRunProjectionVersion) return;
		if (!sameJSON(controllerState.agent.runs, runs)) {
			controllerState.agent.runs = runs;
			changed = true;
		}
		if (typeof observeCompletionProjections === "function") observeCompletionProjections(runs);
		if (typeof reconcileAgentNotices === "function") reconcileAgentNotices(runs);
		if (reconcileActiveAgentRun(runs)) {
			if (!isCurrentAutoRefresh(workspaceId, navigationVersion, refreshVersion) || agentRunProjectionVersion !== controllerState.agentRunProjectionVersion) return;
			changed = true;
		}
		if (typeof reconcileAgentNotices === "function") reconcileAgentNotices(controllerState.agent.runs);
		if (taskOperationalStateKey() !== controllerState.taskOperationalStateKey) changed = true;
		if (changed) publishViewModels();
	} finally {
		controllerState.autoRefreshInFlight = false;
	}
}
function publishViewModels() {
	renderAppShell();
	renderDetails();
	renderAgent();
	renderTTY();
	refreshIcons();
	renderCreateDialog();
	renderSelfDrivingConfigDialog();
	renderSettingsModal();
}
function renderSelectionPanels() {
	renderAppShell();
	renderDetails();
	renderAgent();
	renderTTY();
	refreshIcons();
	renderCreateDialog();
	renderSelfDrivingConfigDialog();
}
function isCurrentWorkspaceView(workspaceId, navigationVersion, treeRequestVersion: number | null = null) {
	return workspaceId === controllerState.activeWorkspaceId && navigationVersion === controllerState.navigationVersion && (treeRequestVersion == null || treeRequestVersion === controllerState.treeRequestVersion);
}
function isCurrentAutoRefresh(workspaceId, navigationVersion, refreshVersion) {
	return isCurrentWorkspaceView(workspaceId, navigationVersion) && refreshVersion === controllerState.autoRefreshVersion;
}
function workspaceIconOption(workspace) {
	return WORKSPACE_ICON_BY_ID.get(String(workspace?.icon || "").trim()) || DEFAULT_WORKSPACE_ICON;
}
function updateWorkspaceFavicon(workspace) {
	const option = workspaceIconOption(workspace);
	let link = document.querySelector<HTMLLinkElement>("link[rel=\"icon\"]");
	if (!link) {
		link = document.createElement("link");
		link.rel = "icon";
		document.head.appendChild(link);
	}
	link.type = (option as any).type || "image/png";
	link.href = option.src;
}
function renderWorkspaceSelect() {
	const active = controllerState.config?.workspaces?.find((workspace) => workspace.id === controllerState.activeWorkspaceId);
	updateWorkspaceFavicon(active);
	renderAppShell();
}
function resourceRefText(id) {
	if (!id) return "";
	const segment = id.includes(".") ? id.slice(id.lastIndexOf(".") + 1) : id;
	const match = segment.match(/^(?:project|task)(\d+)$/);
	return `#${match ? match[1] : segment}`;
}
function appShellStatusModel(presentation) {
	const statuses = (presentation?.statuses || []).map((status, index) => ({
		key: `${status.kind || status.iconName || "status"}:${index}`,
		className: status.className || "",
		iconName: status.iconName || "circle",
		recentOutput: Boolean(status.recentOutput)
	}));
	return {
		hasTaskState: Boolean(presentation?.hasTaskState),
		className: presentation?.className || "",
		layoutClassName: presentation?.layoutClassName || "",
		slotClassName: presentation?.slotClassName || "",
		statuses,
		lock: presentation?.lock ? { className: presentation.lock.className || "" } : null
	};
}
function appShellResourceModel(item, kind, projectId = "") {
	const taskState = taskOperationalState(item);
	const expanded = kind === "project" && isProjectExpanded(item.id);
	const summary = kind === "project" ? projectTaskSummary(item) : null;
	const title = item.title || item.id;
	return {
		id: item.id,
		type: kind,
		title,
		ref: resourceRefText(item.id),
		active: controllerState.selectedId === item.id,
		expanded,
		ariaLabel: [
			title,
			summary?.ariaLabel,
			taskState.label
		].filter(Boolean).join(". "),
		statusLabel: taskState.label || "",
		status: appShellStatusModel(taskState.statusPresentation),
		summary: summary ? {
			taskLabel: summary.taskLabel,
			runningLabel: summary.runningLabel,
			ariaLabel: summary.ariaLabel
		} : null,
		children: kind === "project" ? applyCustomOrder(item.children || [], controllerState.taskOrder[item.id]).map((task) => appShellResourceModel(task, "task", item.id)) : [],
		projectId
	};
}
function appShellSessionModel(session) {
	const navigation = sessionNavigationTarget(session);
	const resourceId = navigation.displayResourceId;
	const isInternal = session.source === "internal";
	const status = isInternal ? sessionStatusPresentation(session) : taskStatusState("session-external", "session-status-external", "message-square", "External session active", "session");
	const taskResource = sessionTaskResource(session);
	const taskState = taskResource ? taskOperationalState(taskResource) : noTaskOperationalState();
	const presentation = operationalStatusPresentation(isInternal && taskState.selfDriving ? [taskState.selfDriving, status] : [status]);
	const unread = hasUnreadNotificationForSession(session.id);
	const statusLabel = `${sessionOperationalLabel(session, taskResource, taskState, status)}${unread ? ". Unread turn completion." : ""}`;
	const agent = isInternal ? (controllerState.config?.agents || []).find((item) => item.id === session.agentRunAgentName) : null;
	const metaParts = [isInternal ? "AgentHub" : "External"];
	if (navigation.controls.length > 1) metaParts.push(`${navigation.controls.length} locks`);
	else if (resourceId) metaParts.push(resourceId);
	if (session.updatedAt) metaParts.push(relativeTime(session.updatedAt));
	return {
		id: session.id,
		source: session.source || "external",
		title: sessionDisplayTitle(session, navigation),
		meta: metaParts.join(" · "),
		label: isInternal ? agent?.name || session.agentRunAgentName || "AgentHub" : "External",
		statusLabel,
		status: appShellStatusModel(presentation),
		unread,
		current: Boolean(controllerState.selectedId && controllerState.selectedId !== "workspace" && navigation.selectedResourceIds.includes(controllerState.selectedId)),
		clickable: Boolean(navigation.navigationResourceId || navigation.menu),
		navigationResourceId: navigation.navigationResourceId,
		menu: navigation.menu,
		controls: navigation.controls.map((control) => ({
			resourceId: control.resourceId,
			path: control.path || "",
			navigable: Boolean(sessionNavigableResourceId(control.resourceId))
		}))
	};
}
function renderAppShell() {
	const projects = controllerState.tree ? applyCustomOrder(controllerState.tree.projects || [], controllerState.projectOrder).map((project) => appShellResourceModel(project, "project")) : [];
	const sessions = applyCustomOrder(sortedSessionsForDisplay(controllerState.tree?.sessions || []), controllerState.sessionOrder).map(appShellSessionModel);
	if (controllerState.tree) controllerState.taskOperationalStateKey = taskOperationalStateKey();
	publisher.renderAppShell({
		identity: controllerState.activeWorkspaceId || "no-workspace",
		loading: Boolean(controllerState.navigationLoading),
		error: controllerState.navigationError || "",
		version: "v0.1.0",
		activeWorkspaceId: controllerState.activeWorkspaceId,
		workspaces: (controllerState.config?.workspaces || []).map((workspace) => ({
			id: workspace.id,
			name: workspace.name || workspace.id,
			path: workspace.path || "",
			icon: workspace.icon || "",
			iconSrc: workspaceIconOption(workspace).src
		})),
		projects,
		sessions,
		paneSizes: { ...controllerState.paneSizes },
		mobile: { ...controllerState.mobile },
		route: { ...controllerState.routeProjection },
		onSwitchWorkspace: (id) => switchWorkspace(id),
		onAddWorkspace: () => openSettings("workspace").catch((err) => toast(err.message)),
		onCreateProject: () => showProjectForm(),
		onOpenSettings: () => openSettings().catch((err) => toast(err.message)),
		onToggleProject: (id) => toggleProject(id),
		onSelectResource: (id) => selectResource(id),
		onReorder: (drag, target, after) => commitListDrag(drag, target, after),
		onDragState: (drag) => {
			controllerState.listDrag = drag;
		},
		onPanePreview: (name, value) => setPaneSize(name, value),
		onPaneCommit: (name) => savePaneSize(name),
		onPaneViewport: () => syncPaneViewport(),
		onMobileSidebar: (open) => setMobileSidebar(open),
		onMobileView: (view) => setMobileView(view),
		onMobileImmersive: (immersive) => setMobileImmersive(immersive),
		onHistoryNavigation: (pathname) => handleHistoryNavigation(pathname),
		onToast: toast,
		onIconsChanged: refreshIcons
	});
}
async function switchWorkspace(id) {
	if (!workspaceExists(id)) return;
	controllerState.workspaceMenuOpen = false;
	if (id === controllerState.activeWorkspaceId) {
		renderWorkspaceSelect();
		return;
	}
	setMobileSidebar(false);
	flushAgentDraft();
	controllerState.navigationVersion++;
	controllerState.autoRefreshVersion++;
	controllerState.treeRequestVersion++;
	controllerState.detailRequestVersion++;
	controllerState.workspaceAgentsRequestVersion++;
	controllerState.previewRequestVersion++;
	controllerState.diffRequestVersion++;
	const navigationVersion = controllerState.navigationVersion;
	await saveUIState().catch((err) => console.warn("failed to save UI state", err));
	controllerState.activeWorkspaceId = id;
	controllerState.selectedId = "workspace";
	controllerState.tree = null;
	controllerState.navigationLoading = true;
	controllerState.navigationError = "";
	controllerState.details = {};
	controllerState.resourceLogPages = {};
	initializeNotificationState(id);
	controllerState.sessionMenu = null;
	resetWorkspaceAgentsDraft();
	controllerState.workspaceAgentsSaving = false;
	closeCreateDialog();
	if (controllerState.selfDrivingDialog.open && !controllerState.selfDrivingDialog.submitting) closeSelfDrivingConfigDialog();
	resetAgentState();
	renderWorkspaceSelect();
	if (!await loadUIState(id, navigationVersion)) return;
	controllerState.selectedId = controllerState.lastResourceId || "workspace";
	await loadTree();
}
function projectTaskSummary(project) {
	const tasks = (Array.isArray(project?.children) ? project.children : []).filter((task) => task && task.archived !== true);
	const runningTaskIds = /* @__PURE__ */ new Set();
	for (const task of tasks) if (taskAgentSessions(task.id).some(taskSessionCountsAsRunning)) runningTaskIds.add(task.id);
	const taskCount = tasks.length;
	const runningCount = runningTaskIds.size;
	const taskLabel = `${taskCount} ${taskCount === 1 ? "task" : "tasks"}`;
	const runningLabel = `${runningCount} running`;
	return {
		taskCount,
		runningCount,
		taskLabel,
		runningLabel,
		text: `${taskLabel} · ${runningLabel}`,
		ariaLabel: `Open tasks: ${taskLabel}; ${runningLabel}`
	};
}
function taskSessionCountsAsRunning(session) {
	return session?.source === "internal" && TASK_RUNNING_SESSION_STATES.has(session.agentRunStatus);
}
async function commitListDrag(drag, target, after) {
	const previous = {
		projectOrder: [...controllerState.projectOrder],
		taskOrder: Object.fromEntries(Object.entries(controllerState.taskOrder).map(([id, order]) => [id, [...(order as any[])]])),
		sessionOrder: [...controllerState.sessionOrder]
	};
	if (drag.kind === "session") {
		const sessions = applyCustomOrder(sortedSessionsForDisplay(controllerState.tree?.sessions || []), controllerState.sessionOrder);
		controllerState.sessionOrder = moveIdInList(sessions.map((session) => session.id), drag.id, target.id, after);
	} else if (drag.kind === "task") {
		const project = findResource(drag.projectId);
		if (!project) return;
		const tasks = applyCustomOrder(project.children || [], controllerState.taskOrder[drag.projectId]);
		controllerState.taskOrder = {
			...controllerState.taskOrder,
			[drag.projectId]: moveIdInList(tasks.map((task) => task.id), drag.id, target.id, after)
		};
	} else if (drag.kind === "project") {
		const projects = applyCustomOrder(controllerState.tree?.projects || [], controllerState.projectOrder);
		controllerState.projectOrder = moveIdInList(projects.map((project) => project.id), drag.id, target.id, after);
	} else return;
	renderAppShell();
	try {
		await saveUIState();
	} catch (err) {
		controllerState.projectOrder = previous.projectOrder;
		controllerState.taskOrder = previous.taskOrder;
		controllerState.sessionOrder = previous.sessionOrder;
		renderAppShell();
		throw err;
	}
}
function noTaskOperationalState() {
	return {
		selfDriving: null,
		session: null,
		className: "",
		label: "",
		lock: null,
		statusPresentation: operationalStatusPresentation([], null)
	};
}
function taskOperationalState(item) {
	const sessions = taskAgentSessions(item.id);
	const locks = resourceLocks(item.id);
	const selfDriving = deriveTaskSelfDrivingState(item.selfDriving);
	const session = deriveTaskSessionState(sessions);
	const lock = deriveTaskLockState(locks);
	const statusPresentation = operationalStatusPresentation([selfDriving, session], lock);
	return {
		selfDriving,
		session,
		className: statusPresentation.className,
		lock,
		statusPresentation,
		label: taskOperationalLabel(item.selfDriving, sessions, lock, {
			selfDriving,
			session
		})
	};
}
function operationalStatusPresentation(statuses, lock: any = null) {
	const visibleStatuses = (statuses || []).filter(Boolean);
	const hasTaskState = visibleStatuses.length > 0 || Boolean(lock);
	return {
		statuses: visibleStatuses,
		lock,
		hasTaskState,
		className: visibleStatuses.map((status) => status.className).filter(Boolean).join(" "),
		layoutClassName: !hasTaskState ? "" : visibleStatuses.length > 1 ? "has-task-status-dual" : "has-task-status",
		slotClassName: [
			visibleStatuses.length === 0 && lock ? "task-status-lock-only" : "",
			visibleStatuses.length === 1 ? "task-status-single" : "",
			visibleStatuses.length > 1 ? "task-status-dual" : ""
		].filter(Boolean).join(" ")
	};
}
function deriveTaskSelfDrivingState(selfDriving) {
	if (!selfDriving) return null;
	if (!selfDriving.enabled) return null;
	const selfDrivingState = selfDriving?.condition || "ready";
	if (selfDrivingState === "error") return taskStatusState("error", "task-status-danger", "triangle-alert", "Self-Driving error", "self-driving");
	if (selfDrivingState === "blocked" || selfDrivingState === "needs_configuration") return taskStatusState(selfDrivingState, "task-status-attention", "square", `Self-Driving ${selfDrivingState.replace(/_/g, " ")}`, "self-driving");
	if (selfDrivingState === "waiting") return taskStatusState("waiting", "task-status-attention", "pause", "Self-Driving waiting", "self-driving");
	if (selfDrivingState === "ready") return taskStatusState("ready", "task-status-queued", "clock", "Self-Driving ready", "self-driving");
	return taskStatusState("unknown", "task-status-neutral", "circle-help", `Self-Driving ${selfDrivingState || "unknown"}`, "self-driving");
}
function deriveTaskSessionState(sessions) {
	const approval = sessions.find((session) => session.agentRunStatus === "waiting_approval");
	if (approval) return sessionStatusPresentation(approval);
	const starting = sessions.find((session) => session.agentRunStatus === "starting");
	if (starting) return sessionStatusPresentation(starting);
	const running = sessions.find((session) => session.agentRunStatus === "running");
	if (running) return sessionStatusPresentation(running);
	const stopping = sessions.find((session) => session.agentRunStatus === "stopping");
	if (stopping) return sessionStatusPresentation(stopping);
	const recovering = sessions.find((session) => session.agentRunStatus === "recovering");
	if (recovering) return sessionStatusPresentation(recovering);
	const idle = sessions.find((session) => session.agentRunStatus === "idle");
	if (idle) return sessionStatusPresentation(idle);
	return sessions.length > 0 ? sessionStatusPresentation(sessions[0]) : null;
}
function sessionStatusPresentation(session) {
	const status = session?.agentRunStatus || "";
	switch (status) {
		case "starting": return taskStatusState("session-starting", "task-status-session-running", "loader-circle", "Session starting", "session", session);
		case "running": return taskStatusState("session-running", "task-status-session-running", "loader-circle", "Session running", "session", session);
		case "waiting_approval": return taskStatusState("session-approval", "task-status-attention", "shield-question", "Session waiting for approval", "session", session);
		case "stopping": return taskStatusState("session-stopping", "task-status-session-stopping", "loader-circle", "Session stopping", "session", session);
		case "recovering": return taskStatusState("session-recovering", "task-status-attention", "rotate-ccw", "Session recovering", "session", session);
		case "idle": return taskStatusState("session-idle", "task-status-info", "message-square", "Session waiting for input", "session", session);
		default: return taskStatusState("session-active", "task-status-neutral", "circle-dot", status ? `Session ${status}` : "Session active", "session", session);
	}
}
function taskStatusState(kind, className, iconName, label, dimension, session = null) {
	return {
		kind,
		className,
		iconName,
		label,
		dimension,
		recentOutput: Boolean(session && hasRecentAgentOutput(session))
	};
}
function taskAgentSessions(resourceId) {
	if (!resourceId) return [];
	return (controllerState.tree?.sessions || []).filter((session) => session.resourceId === resourceId || sessionControls(session).some((control) => control.resourceId === resourceId));
}
function resourceLocks(resourceId) {
	if (!resourceId) return [];
	return (controllerState.tree?.sessions || []).filter((session) => sessionControls(session).some((control) => control.resourceId === resourceId));
}
function selectedLockableResource() {
	const selected = findResource(controllerState.selectedId);
	if (!selected || selected.type !== "project" && selected.type !== "task") return null;
	const detail = controllerState.details?.[selected.id];
	if (detail && detail.type !== selected.type) return null;
	return selected;
}
function selectedResourceHasExternalLock() {
	const selected = selectedLockableResource();
	return Boolean(selected && resourceLocks(selected.id).some((session) => session.source === "external"));
}
function selectedResourceHasInternalLock() {
	const selected = selectedLockableResource();
	return Boolean(selected && resourceLocks(selected.id).some((session) => session.source === "internal"));
}
function selectedResourceHasNewSessionLock() {
	return selectedResourceHasExternalLock() || selectedResourceHasInternalLock();
}
function closeNewSessionChooserForResourceLock() {
	if (selectedResourceHasNewSessionLock()) controllerState.agent.agentChooserOpen = false;
}
function deriveTaskLockState(locks) {
	if (locks.length === 0) return null;
	const external = locks.find((session) => session.source === "external");
	const owner = external || locks[0];
	const count = locks.length;
	const ownerLabel = taskLockOwnerLabel(owner);
	return {
		kind: external ? "external" : "internal",
		className: external ? "task-lock-external" : "task-lock-internal",
		label: count > 1 ? `Locked by ${count} sessions including ${ownerLabel}` : `Locked by ${ownerLabel}`
	};
}
function taskLockOwnerLabel(session) {
	if (session.source === "external") return "an external session";
	return `${(controllerState.config?.agents || []).find((item) => item.id === session.agentRunAgentName)?.name || session.agentRunAgentName || "Forge GUI"} session`;
}
function taskOperationalLabel(selfDriving, sessions, lock, statuses) {
	const parts: string[] = [];
	if (selfDriving) parts.push(`Self-Driving ${selfDriving.enabled ? "on" : "off"}, ${selfDriving.condition}, revision ${selfDriving.revision}`);
	if (sessions.length === 1) parts.push(taskAgentSessionLabel(sessions[0]));
	else if (sessions.length > 1) {
		const sessionStatuses = [...new Set(sessions.map((session) => session.agentRunStatus || "open"))].join(", ");
		parts.push(`${sessions.length} agent sessions: ${sessionStatuses}`);
	}
	if (lock) parts.push(lock.label);
	return parts.join(" · ");
}
function taskAgentSessionLabel(session) {
	return `${session.schedulerTurn ? "Self-Driving session" : "Agent session"} ${(session.agentRunStatus || "open").replace("waiting_approval", "waiting for approval")}`;
}
function taskOperationalStateKey() {
	if (!controllerState.tree) return "";
	const parts: string[] = [];
	for (const project of controllerState.tree.projects || []) {
		const projectState = taskOperationalState(project);
		const summary = projectTaskSummary(project);
		parts.push(`${project.id}:auto=${taskStatusKey(projectState.selfDriving)}:session=${taskStatusKey(projectState.session)}:${projectState.lock?.kind || "none"}:${projectState.label}:tasks=${summary.taskCount}:${summary.runningCount}`);
		for (const task of project.children || []) {
			const taskState = taskOperationalState(task);
			parts.push(`${task.id}:auto=${taskStatusKey(taskState.selfDriving)}:session=${taskStatusKey(taskState.session)}:${taskState.lock?.kind || "none"}:${taskState.label}`);
		}
	}
	return parts.join("|");
}
function taskStatusKey(status) {
	if (!status) return "none";
	return `${status.kind}:${status.iconName}:${status.recentOutput}`;
}
function hasRecentAgentOutput(session) {
	const outputAt = new Date(session.agentRunLastOutputAt || "").getTime();
	if (Number.isFinite(outputAt)) return Date.now() - outputAt <= TASK_OUTPUT_FRESH_WINDOW_MS;
	if (!["running", "starting"].includes(session.agentRunStatus)) return false;
	const updatedAt = new Date(session.agentRunUpdatedAt || "").getTime();
	return Number.isFinite(updatedAt) && Date.now() - updatedAt <= TASK_OUTPUT_FRESH_WINDOW_MS;
}
async function selectResource(id, options: any = {}) {
	const selectionChanged = controllerState.selectedId !== id;
	if (options.clearUnread !== false) clearUnreadForResource(id);
	const forceDetail = selectionChanged || Boolean(options.forceDetail);
	if (forceDetail) {
		controllerState.navigationVersion++;
		controllerState.autoRefreshVersion++;
		controllerState.treeRequestVersion++;
		controllerState.detailRequestVersion++;
		controllerState.workspaceAgentsRequestVersion++;
		controllerState.previewRequestVersion++;
		controllerState.diffRequestVersion++;
		if (id !== "workspace") {
			resetResourceLogState(id);
			delete controllerState.details[id];
		}
	}
	if (selectionChanged) {
		if (controllerState.selfDrivingDialog.open && !controllerState.selfDrivingDialog.submitting) closeSelfDrivingConfigDialog();
		controllerState.workspaceAgentsSaving = false;
		flushAgentDraft();
		discardAgentUploadDialog();
		controllerState.preview = null;
		controllerState.diff = null;
		closeAgentStream();
		controllerState.agent.runs = [];
		controllerState.agent.activeRunId = "";
		controllerState.agent.events = [];
		controllerState.agent.notices = [];
		controllerState.agent.historyBeforeId = 0;
		clearAgentDraftMemory();
	}
	controllerState.selectedId = id;
	controllerState.sessionMenu = null;
	setMobileSidebar(false);
	ensureSelectedProjectExpanded(false);
	syncURL();
	saveUIState().catch((err) => console.warn("failed to save UI state", err));
	renderSelectionPanels();
	await Promise.all([id === "workspace" ? loadWorkspaceAgents({ force: Boolean(options.forceDetail) }) : loadDetail(id, { force: forceDetail }), selectionChanged ? loadAgentRuns() : Promise.resolve()]);
	if (!isCurrentWorkspaceView(controllerState.activeWorkspaceId, controllerState.navigationVersion)) return;
	renderSelectionPanels();
}
async function toggleProject(id) {
	if (controllerState.expandedProjects.has(id)) controllerState.expandedProjects.delete(id);
	else controllerState.expandedProjects.add(id);
	renderAppShell();
	try {
		await saveUIState();
	} catch (err) {
		if (controllerState.expandedProjects.has(id)) controllerState.expandedProjects.delete(id);
		else controllerState.expandedProjects.add(id);
		renderAppShell();
		throw err;
	}
}
function applyCustomOrder(items, orderedIds) {
	if (!Array.isArray(items)) return [];
	if (!Array.isArray(orderedIds) || orderedIds.length === 0) return items;
	const rank = /* @__PURE__ */ new Map();
	orderedIds.forEach((id, index) => {
		if (!rank.has(id)) rank.set(id, index);
	});
	return items.map((item, index) => ({
		item,
		index
	})).sort((a, b) => {
		const left = rank.has(a.item.id) ? rank.get(a.item.id) : rank.size + a.index;
		const right = rank.has(b.item.id) ? rank.get(b.item.id) : rank.size + b.index;
		if (left !== right) return left - right;
		return a.index - b.index;
	}).map((entry) => entry.item);
}
function moveIdInList(ids, dragId, targetId, after) {
	if (!Array.isArray(ids) || dragId === targetId) return ids;
	const next = ids.filter((id) => id !== dragId);
	let index = next.indexOf(targetId);
	if (index < 0) return ids;
	if (after) index += 1;
	next.splice(index, 0, dragId);
	return next;
}
function sortedSessionsForDisplay(sessions) {
	return sessions.map((session, index) => ({
		session,
		index
	})).sort((a, b) => {
		const left = Date.parse(a.session.startedAt || "");
		const right = Date.parse(b.session.startedAt || "");
		const leftOK = Number.isFinite(left);
		const rightOK = Number.isFinite(right);
		if (leftOK && rightOK && left !== right) return left - right;
		if (leftOK !== rightOK) return leftOK ? -1 : 1;
		if (a.session.id !== b.session.id) return a.session.id < b.session.id ? -1 : 1;
		return a.index - b.index;
	}).map((entry) => entry.session);
}
function renderSessions() {
	renderAppShell();
}
function sessionDisplayTitle(session, resourceId) {
	const displayResourceId = (resourceId && typeof resourceId === "object" ? resourceId : arguments.length > 1 ? { displayResourceId: resourceId || "" } : sessionNavigationTarget(session)).displayResourceId || "";
	const resourceTitle = findResource(displayResourceId)?.title || "";
	if (session.source === "internal") return session.agentRunTitle || resourceTitle || displayResourceId || session.id;
	return resourceTitle || displayResourceId || session.id;
}
function sessionControls(session) {
	const controls = (session?.controls || []).map((control) => ({
		resourceId: String(control?.resourceId || "").trim(),
		path: String(control?.path || "")
	})).filter((control) => control.resourceId);
	if (controls.length === 0) {
		const resourceId = String(session?.resourceId || "").trim();
		if (resourceId) return [{
			resourceId,
			path: ""
		}];
	}
	return controls;
}
function sessionNavigableResourceId(resourceId) {
	const value = String(resourceId || "").trim();
	if (!value) return "";
	const resource = findResource(value);
	return resource && resource.archived !== true ? value : "";
}
function sessionNavigationTarget(session) {
	const controls = sessionControls(session);
	const runResourceId = String(session?.resourceId || "").trim();
	if (session?.source === "internal" && runResourceId) return {
		kind: "run",
		primaryResourceId: runResourceId,
		displayResourceId: runResourceId,
		navigationResourceId: sessionNavigableResourceId(runResourceId),
		selectedResourceIds: [runResourceId],
		controls,
		menu: false
	};
	if (controls.length === 1) {
		const resourceId = controls[0].resourceId;
		return {
			kind: "single-control",
			primaryResourceId: resourceId,
			displayResourceId: resourceId,
			navigationResourceId: sessionNavigableResourceId(resourceId),
			selectedResourceIds: [resourceId],
			controls,
			menu: false
		};
	}
	return {
		kind: controls.length > 1 ? "controls" : "none",
		primaryResourceId: "",
		displayResourceId: controls[0]?.resourceId || "",
		navigationResourceId: "",
		selectedResourceIds: controls.map((control) => control.resourceId),
		controls,
		menu: controls.length > 1
	};
}
function sessionTaskResource(session) {
	if (!session || session.source !== "internal") return null;
	const explicitResourceId = String(session.resourceId || "").trim();
	if (explicitResourceId) return taskResourceForSelfDriving(explicitResourceId);
	const controls = sessionControls(session);
	if (controls.length !== 1) return null;
	return taskResourceForSelfDriving(controls[0].resourceId);
}
function taskResourceForSelfDriving(resourceId) {
	const resource = findResource(resourceId);
	return resource && resource.type === "task" && !resource.archived ? resource : null;
}
function sessionOperationalLabel(session, taskResource, taskState, sessionStatus) {
	const parts: string[] = [];
	if (taskResource?.selfDriving && taskState?.selfDriving) {
		const stateLabel = `Self-Driving ${taskResource.selfDriving.condition || "unknown"}`;
		const revision = Number.isFinite(taskResource.selfDriving.revision) ? taskResource.selfDriving.revision : "unknown";
		parts.push(`${stateLabel}, revision ${revision}`);
	}
	if (sessionStatus) parts.push(sessionStatus.label);
	if (parts.length > 0) return parts.join(" · ");
	return session?.source === "external" ? "External session active" : "Session active";
}
function detailPanelModel() {
	const workspaceId = controllerState.activeWorkspaceId || "";
	const base = {
		identity: workspaceId ? `${workspaceId}:${controllerState.selectedId || "workspace"}` : "empty",
		workspaceId,
		workspaceName: workspaceName(),
		resourceId: controllerState.selectedId || "",
		resourceType: "",
		resourceTitle: "",
		parent: null,
		loading: false,
		detail: null,
		wiki: controllerState.tree?.wiki || null,
		workspaceAgents: controllerState.workspaceAgents,
		logs: {
			hasMore: false,
			loading: false,
			error: ""
		},
		onNavigate: (resourceId) => openBreadcrumbResource(resourceId).catch((err) => toast(err.message)),
		onCreateTask: (projectId) => showTaskForm(projectId),
		onArchive: (resourceId) => archiveResource(resourceId).catch((err) => toast(err.message)),
		onLoadMoreLogs: (resourceId) => loadMoreLogs(resourceId),
		onSaveWorkspaceAgents: (content, expectedContentHash) => saveWorkspaceAgentsFromDetail(content, expectedContentHash),
		onToast: toast,
		onIconsChanged: refreshIcons
	};
	if (!controllerState.tree) return base;
	if (controllerState.selectedId === "workspace") return {
		...base,
		resourceId: "workspace",
		resourceType: "workspace",
		resourceTitle: workspaceName()
	};
	const selected = findResource(controllerState.selectedId) || controllerState.tree.projects[0];
	if (!selected) return {
		...base,
		resourceId: "workspace",
		resourceType: "workspace",
		resourceTitle: workspaceName()
	};
	const detail = controllerState.details[selected.id] || null;
	const parent = parentProject(selected.id);
	const page = controllerState.resourceLogPages?.[selected.id] || {};
	return {
		...base,
		identity: `${workspaceId}:${selected.id}:${selected.type}`,
		resourceId: selected.id,
		resourceType: selected.type,
		resourceTitle: detail?.title || selected.title || selected.id,
		parent: parent && parent.id !== selected.id ? {
			id: parent.id,
			title: parent.title || parent.id
		} : null,
		loading: !detail,
		detail,
		logs: {
			hasMore: Boolean(page.hasMore ?? detail?.logPage?.hasMore),
			loading: Boolean(page.loading),
			error: String(page.error || "")
		}
	};
}
function renderDetails() {
	publisher.renderDetailPanel(detailPanelModel());
}
async function openBreadcrumbResource(id) {
	await selectResource(id, { forceDetail: id === controllerState.selectedId && id !== "workspace" });
}
function compareLogTimeDesc(a, b) {
	const left = Date.parse(a?.time || "");
	const right = Date.parse(b?.time || "");
	if (Number.isFinite(left) && Number.isFinite(right) && left !== right) return right - left;
	return String(b?.time || "").localeCompare(String(a?.time || ""));
}
function stripForgeManagedBlocks(content) {
	const startMarker = "<!-- managed by forge cli -->";
	const endMarker = "<!-- end of forge cli prompt -->";
	let result = "";
	let cursor = 0;
	while (cursor < content.length) {
		const start = content.indexOf(startMarker, cursor);
		if (start < 0) {
			result += content.slice(cursor);
			break;
		}
		const end = content.indexOf(endMarker, start + 29);
		if (end < 0) {
			result += content.slice(cursor);
			break;
		}
		result += content.slice(cursor, start);
		cursor = end + 32;
	}
	return result;
}
function workspaceAgentsUserContent(content) {
	return stripForgeManagedBlocks(content || "").trim();
}
function resetWorkspaceAgentsDraft() {
	controllerState.workspaceAgentsDraft = "";
	controllerState.workspaceAgentsDirty = false;
}
async function refreshFilePreview(section, path, options: any = {}) {
	const workspaceId = options.workspaceId || controllerState.activeWorkspaceId;
	const requestVersion = options.requestVersion || ++controllerState.previewRequestVersion;
	try {
		const preview = await api(filePreviewURL(section, path, workspaceId));
		if (workspaceId !== controllerState.activeWorkspaceId || requestVersion !== controllerState.previewRequestVersion || controllerState.preview?.section !== section || controllerState.preview?.path !== path) return null;
		controllerState.preview = {
			section,
			...preview
		};
		return controllerState.preview;
	} catch (err) {
		const current = workspaceId === controllerState.activeWorkspaceId && requestVersion === controllerState.previewRequestVersion && controllerState.preview?.section === section && controllerState.preview?.path === path;
		if (current) controllerState.preview = {
			section,
			path,
			error: errorMessage(err)
		};
		if (options.rethrow && current) throw err;
		return null;
	}
}
async function saveWorkspaceAgentsFromDetail(content, expectedContentHash) {
	if (!controllerState.activeWorkspaceId) throw new Error("No workspace is selected.");
	const workspaceId = controllerState.activeWorkspaceId;
	const navigationVersion = controllerState.navigationVersion;
	const saved = await api(`/api/workspaces/${workspaceId}/files?path=${encodeURIComponent("AGENTS.md")}`, {
		method: "PUT",
		body: JSON.stringify({
			content,
			expectedContentHash
		})
	});
	if (!isCurrentWorkspaceView(workspaceId, navigationVersion) || controllerState.selectedId !== "workspace") throw new Error("The workspace changed before AGENTS.md finished saving.");
	controllerState.workspaceAgents = saved;
	controllerState.workspaceAgentsDraft = workspaceAgentsUserContent(saved.content || "");
	controllerState.workspaceAgentsDirty = false;
	return saved;
}
function closePreview() {
	controllerState.previewRequestVersion++;
	controllerState.preview = null;
	publishViewModels();
}
function closeDiff() {
	controllerState.diffRequestVersion++;
	controllerState.diff = null;
	publishViewModels();
}
function filePreviewURL(section, path, workspaceId = controllerState.activeWorkspaceId) {
	return `/api/workspaces/${workspaceId}/${section === "Wiki" ? "wiki/files" : "files"}?path=${encodeURIComponent(path)}`;
}
function isSelfDrivingWaitingFinishNotice(notice) {
	const data = notice?.data;
	return data?.method === "forge/self-driving/finish" && data?.kind === SELF_DRIVING_FINISH_NOTICE_KIND && data?.lifecycle === SELF_DRIVING_FINISH_NOTICE_WAITING_LIFECYCLE && data?.level !== "error" && String(data.runId || "").trim() !== "" && String(data.resourceId || "").trim() !== "" && Number(data.selfDrivingRevision) > 0;
}
function selfDrivingWaitingNoticeSequence(notice) {
	return Number(notice?.data?.schedulerTurnSequence) || 0;
}
function selfDrivingProjectionForRun(run) {
	const resourceId = String(run?.resourceId || "").trim();
	if (!resourceId) return null;
	const candidates = [controllerState.details?.[resourceId], findResource(resourceId)].map((resource) => resource?.selfDriving).filter(Boolean).map((selfDriving) => ({
		revision: Number(selfDriving.revision) || 0,
		state: String(selfDriving.condition || "").trim().toLowerCase()
	}));
	if (!candidates.length) return null;
	const statePriority = (stateName) => SELF_DRIVING_RESUMABLE_STATES.has(stateName) ? 0 : 1;
	candidates.sort((left, right) => right.revision - left.revision || statePriority(right.state) - statePriority(left.state));
	return candidates[0];
}
function currentSelfDrivingWaitingNotice(notice, runs = controllerState.agent.runs) {
	if (!isSelfDrivingWaitingFinishNotice(notice)) return true;
	const data = notice.data;
	if (!controllerState.agent.activeRunId || String(data.runId).trim() !== controllerState.agent.activeRunId) return false;
	const run = (runs || []).find((candidate) => candidate.id === controllerState.agent.activeRunId);
	if (!run || String(run.resourceId || "").trim() !== String(data.resourceId).trim() || Number(run.selfDrivingRevision) !== Number(data.selfDrivingRevision)) return false;
	const noticeSequence = selfDrivingWaitingNoticeSequence(notice);
	const runSequence = Number(run.schedulerTurnSequence) || 0;
	if (runSequence > noticeSequence && runSequence > 0) return false;
	if (runSequence === noticeSequence && run.schedulerTurnId && data.schedulerTurnId && run.schedulerTurnId !== data.schedulerTurnId) return false;
	if (run.schedulerTurn && (runSequence === 0 || runSequence >= noticeSequence)) return false;
	const projection = selfDrivingProjectionForRun(run);
	if (!projection) return true;
	if (projection.revision !== Number(data.selfDrivingRevision)) return false;
	return SELF_DRIVING_RESUMABLE_STATES.has(projection.state);
}
function reconcileAgentNotices(runs = controllerState.agent.runs) {
	const before = controllerState.agent.notices.length;
	controllerState.agent.notices = controllerState.agent.notices.filter((notice) => currentSelfDrivingWaitingNotice(notice, runs));
	return controllerState.agent.notices.length !== before;
}
async function loadAgentRuns() {
	if (!controllerState.activeWorkspaceId) {
		resetAgentState();
		return;
	}
	controllerState.agentRunProjectionVersion = (Number(controllerState.agentRunProjectionVersion) || 0) + 1;
	const projectionVersion = controllerState.agentRunProjectionVersion;
	const runs = await fetchAgentRuns();
	if (projectionVersion !== controllerState.agentRunProjectionVersion || !controllerState.activeWorkspaceId) return false;
	controllerState.agent.runs = runs;
	observeCompletionProjections(controllerState.agent.runs);
	reconcileActiveAgentRun(controllerState.agent.runs);
	if (typeof reconcileAgentNotices === "function") reconcileAgentNotices(controllerState.agent.runs);
	if (!controllerState.agent.activeRunId) controllerState.agent.historyBeforeId = 0;
	if (projectionVersion !== controllerState.agentRunProjectionVersion) return false;
	if (typeof reconcileAgentNotices === "function") reconcileAgentNotices(controllerState.agent.runs);
	return true;
}
async function refreshAgentRunMetadata(options: any = {}) {
	if (!controllerState.activeWorkspaceId) return;
	controllerState.agentRunProjectionVersion = (Number(controllerState.agentRunProjectionVersion) || 0) + 1;
	const projectionVersion = controllerState.agentRunProjectionVersion;
	const workspaceId = controllerState.activeWorkspaceId;
	const runs = await fetchAgentRuns();
	if (projectionVersion !== controllerState.agentRunProjectionVersion || controllerState.activeWorkspaceId !== workspaceId) return false;
	controllerState.agent.runs = runs;
	observeCompletionProjections(runs);
	if (typeof reconcileAgentNotices === "function") reconcileAgentNotices(runs);
	if (reconcileActiveAgentRun(runs)) {
		if (projectionVersion !== controllerState.agentRunProjectionVersion || controllerState.activeWorkspaceId !== workspaceId) return false;
	}
	if (options.refreshSelfDrivingProjection && controllerState.agent.activeRunId) {
		const activeRun = currentAgentRun();
		const resourceId = String(activeRun?.resourceId || "").trim();
		const [tree, detail] = await Promise.all([fetchCurrentTree(workspaceId), resourceId ? fetchDetail(resourceId, workspaceId, { logsLimit: RESOURCE_LOG_INITIAL_LIMIT }) : Promise.resolve(null)]);
		if (projectionVersion !== controllerState.agentRunProjectionVersion || controllerState.activeWorkspaceId !== workspaceId) return false;
		if (tree) controllerState.tree = tree;
		if (detail && controllerState.activeWorkspaceId === workspaceId) applyResourceDetail(detail, "head");
	}
	if (typeof reconcileAgentNotices === "function") reconcileAgentNotices(controllerState.agent.runs);
	return true;
}
function reconcileActiveAgentRun(runs) {
	const nextRunId = preferredAgentRunID(runs);
	if (controllerState.agent.activeRunId === nextRunId) {
		const activeRun = runs.find((run) => run.id === nextRunId);
		if (activeRun) restoreAgentDraftForRun(activeRun);
		return false;
	}
	flushAgentDraft();
	controllerState.agent.activeRunId = nextRunId;
	controllerState.agent.events = [];
	controllerState.agent.notices = [];
	controllerState.agent.eventsHasMore = false;
	controllerState.agent.historyBeforeId = 0;
	clearAgentDraftMemory();
	const activeRun = runs.find((run) => run.id === nextRunId);
	if (activeRun) restoreAgentDraftForRun(activeRun);
	controllerState.agent.approvalDrafts.clear();
	return true;
}
function preferredAgentRunID(runs) {
	const selfDriving = runs.find((run) => run.schedulerTurn && isLiveAgentRun(run));
	if (selfDriving) return selfDriving.id;
	if (runs.some((run) => run.id === controllerState.agent.activeRunId)) return controllerState.agent.activeRunId;
	return runs[0]?.id || "";
}
async function fetchCurrentTree(workspaceId = controllerState.activeWorkspaceId) {
	const requestVersion = ++controllerState.treeRequestVersion;
	const navigationVersion = controllerState.navigationVersion;
	const tree = await api(`/api/workspaces/${workspaceId}/tree`);
	return isCurrentWorkspaceView(workspaceId, navigationVersion, requestVersion) ? tree : null;
}
async function refreshTreeAfterAgentSessionMutation() {
	if (!controllerState.activeWorkspaceId || !controllerState.tree) return;
	const tree = await fetchCurrentTree(controllerState.activeWorkspaceId);
	if (tree) controllerState.tree = tree;
}
async function refreshAgentInputProjection(workspaceId, resourceId) {
	if (!workspaceId || controllerState.activeWorkspaceId !== workspaceId) return;
	await Promise.all([
		loadAgentRuns(),
		refreshTreeAfterAgentSessionMutation(),
		resourceId && resourceId !== "workspace" ? fetchDetail(resourceId, workspaceId, { logsLimit: RESOURCE_LOG_INITIAL_LIMIT }).then((detail) => {
			if (controllerState.activeWorkspaceId === workspaceId && detail) applyResourceDetail(detail, "head");
		}) : Promise.resolve()
	]);
	if (controllerState.activeWorkspaceId === workspaceId) {
		if (typeof reconcileAgentNotices === "function") reconcileAgentNotices(controllerState.agent.runs);
		publishViewModels();
	}
}
async function mutateAgentSession(action) {
	controllerState.agentSessionMutationCount++;
	controllerState.autoRefreshVersion++;
	controllerState.treeRequestVersion++;
	try {
		return await action();
	} finally {
		controllerState.agentSessionMutationCount--;
	}
}
function fetchAgentRuns() {
	const resourceId = selectedAgentResourceId();
	const query = resourceId ? `?resourceId=${encodeURIComponent(resourceId)}` : "";
	return api(`/api/workspaces/${controllerState.activeWorkspaceId}/agent/runs${query}`).then((body) => body.runs || []);
}
async function reloadAgentRunsForSelection() {
	flushAgentDraft();
	closeAgentStream();
	controllerState.agent.turnStopping = false;
	controllerState.agent.turnStoppingRunId = "";
	controllerState.agent.sessionStopping = false;
	controllerState.agent.sessionStoppingRunId = "";
	controllerState.agent.activeRunId = "";
	controllerState.agent.events = [];
	controllerState.agent.notices = [];
	controllerState.agent.historyBeforeId = 0;
	clearAgentDraftMemory();
	await loadAgentRuns();
}
function resetAgentState() {
	if (controllerState.selfDrivingDialog.open && !controllerState.selfDrivingDialog.submitting) closeSelfDrivingConfigDialog();
	flushAgentDraft();
	discardAgentUploadDialog();
	closeAgentStream();
	controllerState.agent.runs = [];
	controllerState.agentRunProjectionVersion = (Number(controllerState.agentRunProjectionVersion) || 0) + 1;
	controllerState.agent.activeRunId = "";
	controllerState.agent.events = [];
	controllerState.agent.notices = [];
	controllerState.agent.eventsHasMore = false;
	controllerState.agent.historyBeforeId = 0;
	controllerState.agent.loadingOlder = false;
	controllerState.agent.optionsOpen = false;
	controllerState.agent.agentChooserOpen = false;
	controllerState.agent.historyOpen = false;
	clearAgentDraftMemory();
	controllerState.agent.newSessionStarting = false;
	controllerState.agent.turnStopping = false;
	controllerState.agent.turnStoppingRunId = "";
	controllerState.agent.sessionStopping = false;
	controllerState.agent.sessionStoppingRunId = "";
	controllerState.agent.toolGroupOpen.clear();
	controllerState.agent.approvalDrafts.clear();
	if (controllerState.agent.selfDrivingFinishNoticeWatermarks instanceof Map) controllerState.agent.selfDrivingFinishNoticeWatermarks.clear();
	controllerState.agent.renderDeferredForSelection = false;
	clearAgentRenderTimer();
}
function closeAgentStream() {
	if (controllerState.agent.stream) controllerState.agent.stream.close();
	controllerState.agent.stream = null;
	controllerState.agent.streamRunId = "";
}
function handleSvelteAgentEvent(workspaceId, runId, event) {
	if (workspaceId !== controllerState.activeWorkspaceId || runId !== controllerState.agent.activeRunId || !event) return;
	const run = controllerState.agent.runs.find((candidate) => candidate.id === runId) || null;
	if ([
		"turn.completed",
		"turn.failed",
		"turn.cancelled"
	].includes(event.type)) observeCompletionEvent(event, run);
	if ([
		"turn.completed",
		"turn.failed",
		"turn.cancelled",
		"session.state",
		"approval.requested",
		"approval.resolved"
	].includes(event.type)) refreshAgentRunMetadata({ refreshSelfDrivingProjection: [
		"turn.completed",
		"turn.failed",
		"turn.cancelled",
		"session.state"
	].includes(event.type) }).then(publishViewModels).catch((err) => console.warn("agent refresh failed", err));
}
function handleSvelteForgeNotice(workspaceId, runId, notice) {
	if (workspaceId !== controllerState.activeWorkspaceId || runId !== controllerState.agent.activeRunId) return;
	if (notice?.data?.kind === SELF_DRIVING_FINISH_NOTICE_KIND) refreshAgentRunMetadata({ refreshSelfDrivingProjection: true }).then(publishViewModels).catch((err) => console.warn("Self-Driving notice projection refresh failed", err));
}
function clearAgentRenderTimer() {
	if (controllerState.agent.renderTimer) window.clearTimeout(controllerState.agent.renderTimer);
	controllerState.agent.renderTimer = null;
}
function projectAgentEvents(events) {
	if (!window.AgentHubEventTimeline?.buildTimeline) throw new Error("AgentHub Event Timeline library is unavailable");
	const visibleEvents = (events || []).filter((event) => !AGENT_HIDDEN_EVENT_TYPES.has(event?.type));
	return window.AgentHubEventTimeline.buildTimeline(visibleEvents) as any[];
}
function renderAgent() {
	if (typeof reconcileAgentNotices === "function") reconcileAgentNotices(controllerState.agent.runs);
	const activeRun = currentAgentRun();
	const detail = controllerState.details[controllerState.selectedId];
	publisher.renderSelfDrivingBar(selfDrivingBarModel(detail));
	publisher.renderSessionSwitcher({
		identity: `${controllerState.activeWorkspaceId}:${selectedAgentResourceId()}`,
		workspaceId: controllerState.activeWorkspaceId,
		resourceId: selectedAgentResourceId(),
		activeRunId: activeRun?.id || "",
		runs: controllerState.agent.runs,
		switchingRunId: controllerState.agent.switchingRunId || "",
		onSelect: switchAgentRun,
		onToast: toast,
		onIconsChanged: refreshIcons
	});
}
function selfDrivingBarModel(detail) {
	const selected = findResource(controllerState.selectedId);
	if (!selected || selected.type !== "task" || !detail) return {
		identity: `${controllerState.activeWorkspaceId}:${controllerState.selectedId}:hidden`,
		visible: false,
		status: selfDrivingPresentation("disabled", false),
		summary: "",
		expanded: false,
		hasProjection: false,
		revision: 0,
		enabled: false,
		preferredProfiles: [],
		actualAgent: "",
		actualReason: "",
		waitingSummary: "",
		wakeCondition: "",
		wakeFallback: false,
		lastOutcome: null,
		statusReason: null,
		pending: false,
		onToggleEnabled: () => {},
		onToggleDetails: () => {},
		onIconsChanged: refreshIcons
	};
	const run = detail.selfDriving || null;
	const actual = currentAgentRun();
	const actualAgent = actual?.schedulerTurn && actual.resourceId === detail.id ? `${actual.agentProfile ? `${actual.agentProfile} → ` : ""}${actual.agentHubAgentName || ""}` : "";
	return {
		identity: `${controllerState.activeWorkspaceId}:${selected.id}:${Number(run?.revision) || 0}`,
		visible: true,
		status: selfDrivingPresentation(run?.condition || "disabled", Boolean(run?.enabled)),
		summary: selfDrivingBarSummary(run, detail),
		expanded: Boolean(run && controllerState.agent.selfDrivingExpanded),
		hasProjection: Boolean(run),
		revision: Number(run?.revision) || 0,
		enabled: Boolean(run?.enabled),
		preferredProfiles: run?.preferredAgentProfiles || [],
		actualAgent,
		actualReason: actualAgent ? String(actual?.agentSelectionReason || "") : "",
		waitingSummary: String(run?.wakeContext?.summary || ""),
		wakeCondition: String(run?.wakeContext?.condition || ""),
		wakeFallback: Boolean(run?.wakeContext?.fallback),
		lastOutcome: run?.lastOutcome ? {
			status: String(run.lastOutcome.status || ""),
			reason: String(run.lastOutcome.reason || "")
		} : null,
		statusReason: selfDrivingStatusReason(run, detail?.logs),
		pending: Boolean(controllerState.agent.selfDrivingSaving || controllerState.agent.selfDrivingDisabling),
		onToggleEnabled: () => {
			if (controllerState.agent.selfDrivingSaving || controllerState.agent.selfDrivingDisabling) return;
			if (run?.enabled) disableSelectedSelfDriving().catch((err) => toast(err.message));
			else if (selfDrivingNeedsConfiguration(detail)) openSelfDrivingConfigDialog();
			else setChatSelfDrivingDesiredState({ enabled: true }).catch((err) => toast(err.message));
		},
		onToggleDetails: () => {
			controllerState.agent.selfDrivingExpanded = !controllerState.agent.selfDrivingExpanded;
			renderAgent();
		},
		onIconsChanged: refreshIcons
	};
}
function selfDrivingStatusReason(run, logs = []) {
	if (!run) return null;
	const text = String(run.conditionReason || run.notificationError?.message || "").trim();
	return text ? {
		label: "Status",
		text
	} : null;
}
function selfDrivingBarSummary(run, detail) {
	if (!run) return "Self-Driving is off.";
	const reason = selfDrivingStatusReason(run, detail?.logs);
	if (reason) return `${reason.label}: ${reason.text}`;
	if (run.wakeContext?.condition) return `Wake condition: ${run.wakeContext.condition}`;
	const actual = currentAgentRun();
	if (actual?.schedulerTurn && actual.resourceId === detail.id) {
		const selection = `${actual.agentProfile ? `${actual.agentProfile} → ` : ""}${actual.agentHubAgentName || ""}`.trim();
		if (selection) return `Agent: ${selection}`;
	}
	return `Revision ${Number(run.revision) || 0}`;
}
function selfDrivingPresentation(condition, enabled = false) {
	const presentations = {
		disabled: {
			label: "Off",
			icon: "circle-dashed"
		},
		ready: {
			label: "Ready",
			icon: "list-start"
		},
		waiting: {
			label: "Waiting",
			icon: "pause"
		},
		blocked: {
			label: "Blocked",
			icon: "octagon-alert"
		},
		error: {
			label: "Error",
			icon: "circle-x"
		},
		needs_configuration: {
			label: "Needs configuration",
			icon: "settings"
		}
	};
	const stateName = enabled ? String(condition || "ready").trim().toLowerCase() : "disabled";
	const key = Object.hasOwn(presentations, stateName) ? stateName : "unknown";
	return {
		key,
		...presentations[key] || {
			label: stateName || "Unknown",
			icon: "circle-help"
		}
	};
}
function agentConfigSummary(agent) {
	if (!agent) return "";
	const parts = [providerName(agent.providerId)];
	if (agent.options?.model) parts.push(agent.options.model);
	return parts.filter(Boolean).join(" · ");
}
function providerName(providerId) {
	return (controllerState.config?.agentHubProviders || controllerState.settings.data?.agentHub?.catalog?.providers || []).find((item) => item.id === providerId)?.name || providerId || "Provider";
}
function ttyLogHasActiveSelection(log) {
	const selection = window.getSelection?.();
	if (!selection || selection.isCollapsed || selection.rangeCount === 0) return false;
	return selection.getRangeAt(0).intersectsNode(log);
}
function renderTTY(options: any = {}) {
	renderTTYComposer();
	const run = currentAgentRun();
	const configured = (controllerState.config?.agents || []).find((agent) => agent.id === run?.agentHubAgentName);
	publisher.renderEventTimeline({
		identity: `${controllerState.activeWorkspaceId}:${run?.id || ""}`,
		workspaceId: controllerState.activeWorkspaceId,
		activeRunId: run?.id || "",
		activeRun: run,
		runCount: controllerState.agent.runs.length,
		agentName: agentDisplayName(configured || selectedAgentConfig()),
		project: projectAgentEvents,
		onEvent: handleSvelteAgentEvent,
		onNotice: handleSvelteForgeNotice,
		onApproval: resolveAgentApprovalForRun,
		onToast: toast,
		onIconsChanged: refreshIcons
	});
}
function agentSessionMutationKey(workspaceId, runId) {
	return `${workspaceId || "workspace"}:${runId || "run"}`;
}
function renderTTYComposer(options: any = {}) {
	controllerState.agent.skipTTYDraftSync = false;
	closeNewSessionChooserForResourceLock();
	const activeRun = currentAgentRun();
	if (activeRun) restoreAgentDraftForRun(activeRun);
	const live = isLiveAgentRun(activeRun);
	const resourceId = activeRun?.resourceId || selectedAgentResourceId();
	const stopTurnPending = isAgentTurnStopping(activeRun);
	const sessionStopping = isAgentSessionStopping(activeRun) || activeRun?.status === "stopping";
	publisher.renderComposer({
		identity: `${controllerState.activeWorkspaceId}:${resourceId}:${activeRun?.id || "none"}:${controllerState.agent.ttyDraftKey || ""}`,
		workspaceId: controllerState.activeWorkspaceId,
		resourceId,
		runId: activeRun?.id || "",
		runStatus: activeRun?.status || "",
		live,
		canResume: Boolean(activeRun && !live && (activeRun.agentHubSessionId || activeRun.sourceExternalId)),
		draft: controllerState.agent.ttyDraft || "",
		draftKey: controllerState.agent.ttyDraftKey || "",
		draftResetVersion: controllerState.agent.ttyDraftResetVersion || 0,
		unavailableReason: live ? agentInputUnavailableReason(activeRun, isAgentSessionReady(activeRun)) : "",
		sending: Boolean(activeRun && controllerState.agent.sendingInputRunIds.has(agentSessionMutationKey(controllerState.activeWorkspaceId, activeRun.id))),
		externalLocked: selectedResourceHasExternalLock(),
		internalLocked: selectedResourceHasInternalLock(),
		agents: svelteAgentOptions(),
		selectedAgentId: selectedAgentConfig()?.id || "",
		chooserOpen: Boolean(controllerState.agent.agentChooserOpen),
		sessionStarting: Boolean(controllerState.agent.newSessionStarting),
		actionsOpen: Boolean(controllerState.agent.sessionActionsOpen),
		canEndTurn: Boolean(activeRun && (isAgentTurnInterruptible(activeRun) || stopTurnPending)),
		endingTurn: stopTurnPending,
		closingSession: sessionStopping,
		selfDrivingRemainsEnabled: isSelfDrivingSessionCloseTarget(activeRun),
		selfDrivingDisabling: Boolean(controllerState.agent.selfDrivingDisabling),
		onDraft: (text, draftContext) => updateAgentDraftFromSvelte(text, draftContext),
		onSend: submitTTYInput,
		onOpenUpload: openAgentUploadDialog,
		onToggleChooser: () => {
			if (controllerState.agent.newSessionStarting || !enabledAgentConfigs().length || selectedResourceHasExternalLock()) return;
			controllerState.agent.agentChooserOpen = !controllerState.agent.agentChooserOpen;
			renderTTYComposer();
		},
		onChooseAgent: (id) => startAgentRun(id).catch((err) => toast(err.message)),
		onToggleActions: () => {
			controllerState.agent.sessionActionsOpen = !controllerState.agent.sessionActionsOpen;
			renderTTYComposer();
		},
		onResume: () => resumeAgentRun().catch((err) => toast(err.message)),
		onEndTurn: () => stopAgentTurn().catch((err) => toast(err.message)),
		onCloseSession: closeCurrentAgentSession,
		onIconsChanged: refreshIcons
	});
}
function isAgentSessionReady(run) {
	if (!isLiveAgentRun(run)) return false;
	if (run.status !== "starting") return true;
	if (controllerState.agent.events.some((event) => event.type === "session.state" && event.data?.state === "ready")) return true;
	return controllerState.agent.eventsHasMore && run.status !== "starting";
}
function agentInputUnavailableReason(run, sessionReady = isAgentSessionReady(run)) {
	if (selectedResourceHasExternalLock()) return EXTERNAL_RESOURCE_LOCK_MESSAGE;
	if (isAgentTurnStopping(run)) return "Ending the current turn.";
	if (!sessionReady) return "Agent session is starting.";
	if (run.status === "stopping") return "AgentHub is stopping the provider.";
	if (run.status === "recovering") return "AgentHub event recovery is in progress.";
	if (run.status === "waiting_approval") return "Resolve the pending approval before sending input.";
	return "";
}
function agentDisplayName(agent) {
	return agent?.name || agent?.id || "Agent";
}
function selfDrivingNeedsConfiguration(detail) {
	return !detail?.selfDriving?.agentName && !(detail?.selfDriving?.preferredAgentProfiles || []).length;
}
async function setChatSelfDrivingDesiredState(options: any = {}) {
	return mutateAgentSession(async () => {
		const selected = findResource(controllerState.selectedId);
		const detail = selected ? controllerState.details[selected.id] || selected : null;
		if (!detail || detail.type !== "task") throw new Error("Select a task first.");
		const enabled = options.enabled === void 0 ? true : Boolean(options.enabled);
		controllerState.agent.selfDrivingSaving = true;
		renderAgent();
		renderTTYComposer();
		refreshIcons();
		try {
			const body: any = {
				resourceId: selected.id,
				enabled
			};
			if (options.configured) {
				body.agentName = String(options.agentName || "").trim();
				body.prompt = String(options.runInstructions || "");
				body.completionCriteria = String(options.completionCriteria || "");
			}
			const response = await api(`/api/workspaces/${controllerState.activeWorkspaceId}/self-driving`, {
				method: "PUT",
				body: JSON.stringify(body)
			});
			await Promise.all([
				loadAgentRuns(),
				refreshTreeAfterAgentSessionMutation(),
				fetchDetail(selected.id, controllerState.activeWorkspaceId, { logsLimit: RESOURCE_LOG_INITIAL_LIMIT }).then((fresh) => {
					if (fresh && controllerState.activeWorkspaceId) applyResourceDetail(fresh, "head");
				})
			]);
			publishViewModels();
			toast(enabled ? "Self-Driving enabled. The Scheduler will reconcile asynchronously." : response.notificationError ? `Self-Driving disabled. ${response.notificationError}` : "Self-Driving disabled. The current Turn and Session were left open.");
		} finally {
			controllerState.agent.selfDrivingSaving = false;
			renderAgent();
			renderTTYComposer();
			refreshIcons();
		}
	});
}
function selfDrivingDialogInitialState() {
	return {
		open: false,
		identity: ++selfDrivingDialogIdentity,
		mode: "",
		resourceId: "",
		reuseRunId: "",
		reuseCurrentSession: false,
		agentName: "",
		expectedRevision: 0,
		expectedCondition: "",
		runInstructions: "",
		completionCriteria: "",
		submitting: false,
		error: "",
		unknown: false,
		returnFocus: null
	};
}
function selfDrivingIdleSessionForResource(resourceId) {
	return controllerState.agent.runs.find((run) => run.resourceId === resourceId && isLiveAgentRun(run) && run.status === "idle" && !run.schedulerTurn && String(run.agentHubSessionId || "").trim()) || null;
}
function openSelfDrivingConfigDialog() {
	const selected = findResource(controllerState.selectedId);
	const detail = selected ? controllerState.details[selected.id] || selected : null;
	if (!selected || !detail || detail.type !== "task") {
		toast("Select a task first.");
		return;
	}
	const reuseRun = selfDrivingIdleSessionForResource(selected.id);
	const selfDriving = detail.selfDriving || null;
	const agents = enabledAgentConfigs();
	const savedAgentName = String(selfDriving?.agentName || "").trim();
	const savedAgent = agents.find((agent) => String(agent.id || "").trim().toLowerCase() === savedAgentName.toLowerCase());
	const selectedAgent = selectedAgentConfig();
	const mode = "configure";
	const agentName = String(reuseRun?.agentHubAgentName || savedAgent?.id || selectedAgent?.id || "").trim();
	controllerState.modalEnter = "selfDriving";
	controllerState.selfDrivingDialog = {
		open: true,
		identity: ++selfDrivingDialogIdentity,
		mode,
		resourceId: selected.id,
		reuseRunId: reuseRun?.id || "",
		reuseCurrentSession: Boolean(reuseRun),
		agentName,
		expectedRevision: Number(selfDriving?.revision) || 0,
		expectedCondition: String(selfDriving?.condition || "").trim().toLowerCase(),
		runInstructions: String(selfDriving?.prompt || ""),
		completionCriteria: String(selfDriving?.completionCriteria || ""),
		submitting: false,
		error: agents.length === 0 ? "No enabled AgentHub agents are available. Self-Driving can still be enabled and will report Needs configuration." : "",
		unknown: false,
		returnFocus: document.activeElement instanceof HTMLElement ? document.activeElement : null
	};
	renderSelfDrivingConfigDialog();
}
function closeSelfDrivingConfigDialog() {
	const dialog = controllerState.selfDrivingDialog;
	if (!dialog.open || dialog.submitting) return;
	const returnFocus = dialog.returnFocus;
	controllerState.selfDrivingDialog = selfDrivingDialogInitialState();
	renderSelfDrivingConfigDialog();
	if (returnFocus && document.contains(returnFocus)) returnFocus.focus({ preventScroll: true });
}
function renderSelfDrivingConfigDialog() {
	const dialog = controllerState.selfDrivingDialog;
	publisher.renderSelfDrivingDialog({
		open: Boolean(dialog.open),
		identity: `${dialog.identity || 0}:${dialog.resourceId || ""}`,
		resourceId: dialog.resourceId || "",
		reuseCurrentSession: Boolean(dialog.reuseCurrentSession),
		agents: svelteAgentOptions(),
		draft: {
			agentName: dialog.agentName || "",
			runInstructions: dialog.runInstructions || ""
		},
		submitting: Boolean(dialog.submitting),
		error: dialog.error || "",
		unknown: Boolean(dialog.unknown),
		onClose: closeSelfDrivingConfigDialog,
		onSubmit: submitSelfDrivingConfigDialog,
		onIconsChanged: refreshIcons
	});
}
async function submitSelfDrivingConfigDialog(draft) {
	const dialog = controllerState.selfDrivingDialog;
	if (!dialog.open || dialog.submitting || dialog.unknown) return;
	dialog.agentName = String(draft?.agentName || dialog.agentName || "").trim();
	dialog.runInstructions = String(draft?.runInstructions || "");
	if (!dialog.reuseCurrentSession && !dialog.agentName) {
		dialog.error = "Select an Agent before enabling Self-Driving.";
		renderSelfDrivingConfigDialog();
		return;
	}
	dialog.submitting = true;
	dialog.error = "";
	const dialogIdentity = dialog.identity;
	const workspaceId = controllerState.activeWorkspaceId;
	const resourceId = dialog.resourceId;
	renderSelfDrivingConfigDialog();
	try {
		await setChatSelfDrivingDesiredState({
			configured: true,
			agentName: dialog.agentName,
			runInstructions: dialog.runInstructions,
			completionCriteria: dialog.completionCriteria
		});
		if (dialogIdentity !== controllerState.selfDrivingDialog.identity || workspaceId !== controllerState.activeWorkspaceId || resourceId !== controllerState.selectedId) return;
		const returnFocus = dialog.returnFocus;
		controllerState.selfDrivingDialog = selfDrivingDialogInitialState();
		renderSelfDrivingConfigDialog();
		if (returnFocus && document.contains(returnFocus)) returnFocus.focus({ preventScroll: true });
	} catch (err) {
		if (dialogIdentity !== controllerState.selfDrivingDialog.identity) return;
		dialog.submitting = false;
		const apiError = err as { message?: unknown; status?: unknown } | null;
		const message = errorMessage(err, "Self-Driving could not be enabled.");
		dialog.error = message;
		dialog.unknown = !Number.isFinite(Number(apiError?.status)) || Number(apiError?.status) >= 500 || message.includes("outcome may be unknown") || message.includes("was updated but the start message failed");
		renderSelfDrivingConfigDialog();
	}
}
function renderSettingsModal() {
	const data = controllerState.settings.data || {
		workspaces: controllerState.config?.workspaces || [],
		activeId: controllerState.activeWorkspaceId,
		agents: controllerState.config?.agents || [],
		agentProfiles: controllerState.config?.agentProfiles || []
	};
	const hub = data.agentHub || {};
	const status = hub.status || {};
	const catalog = hub.catalog || {
		providers: [],
		agents: []
	};
	const preferences = controllerState.notifications.settings || readNotificationSettings();
	controllerState.notifications.settings = preferences;
	publisher.renderSettings({
		open: Boolean(controllerState.settings.open),
		identity: `${controllerState.settings.identity || 0}`,
		dataVersion: controllerState.settings.dataVersion || 0,
		initialTab: controllerState.settings.tab || "workspace",
		workspaces: data.workspaces || [],
		activeWorkspaceId: data.activeId || controllerState.activeWorkspaceId,
		workspaceIcons: [DEFAULT_WORKSPACE_ICON, ...WORKSPACE_ICONS],
		workspaceIconSavingId: controllerState.settings.workspaceIconSavingId || "",
		userName: currentUserName(),
		agentHub: {
			configuredEndpoint: hub.configuredEndpoint || "http://127.0.0.1:4646",
			connected: Boolean(hub.connected),
			compatible: Boolean(hub.compatible),
			error: hub.error || "",
			apiVersion: status.apiVersion || "",
			version: status.version || "",
			capabilities: status.capabilities || [],
			providers: catalog.providers || [],
			agents: catalog.agents || []
		},
		profiles: (data.agentProfiles || []).map((profile) => ({
			key: profile.key || "",
			description: profile.description || "",
			agentName: profile.agentName || ""
		})),
		agents: svelteAgentOptions(),
		notifications: {
			browser: Boolean(preferences.browser),
			sound: Boolean(preferences.sound),
			permission: notificationPermission(),
			permissionError: controllerState.notifications.permissionError || "",
			soundError: controllerState.notifications.soundError || ""
		},
		onClose: closeSettings,
		onAddWorkspace: async (draft) => {
			syncSettingsDraftFromSvelte(draft);
			await submitSettingsWorkspace();
		},
		onRemoveWorkspace: async (id, draft) => {
			syncSettingsDraftFromSvelte(draft);
			await removeSettingsWorkspace(id);
		},
		onWorkspaceIcon: async (id, iconId, draft) => {
			syncSettingsDraftFromSvelte(draft);
			await updateSettingsWorkspaceIcon(id, iconId);
		},
		onSaveUser: async (name) => {
			const normalized = normalizeUserName(name);
			if (!saveStoredUserName(normalized)) throw new Error("User name could not be saved in this browser.");
			toast(normalized === "User" ? "User name reset to User." : `User name saved as ${normalized}.`);
			return normalized;
		},
		onSaveAgentHub: async (draft) => {
			syncSettingsDraftFromSvelte(draft);
			await saveAgentSettings();
		},
		onBrowserNotifications: setBrowserNotificationsEnabled,
		onCompletionSound: setCompletionSoundEnabled,
		onToast: toast,
		onIconsChanged: refreshIcons
	});
}
function updateAgentDraftFromSvelte(text, context) {
	if (!context || context.workspaceId !== controllerState.activeWorkspaceId || context.runId !== controllerState.agent.activeRunId || context.draftKey !== controllerState.agent.ttyDraftKey) return;
	updateAgentDraft(text);
}
function closeCurrentAgentSession() {
	if (!isSelfDrivingSessionCloseTarget(currentAgentRun())) {
		stopAgentRun().catch((err) => toast(err.message));
		return;
	}
	if (window.confirm("Self-Driving is On. Close this Session while keeping Self-Driving On? The Scheduler may create a replacement Session.")) {
		stopAgentRun().catch((err) => toast(err.message));
		return;
	}
	if (window.confirm("Disable Self-Driving and close this Session instead?")) disableSelectedSelfDriving().then(() => stopAgentRun()).catch((err) => toast(err.message));
}
async function startAgentRun(agentName = "") {
	if (controllerState.agent.newSessionStarting) return;
	return mutateAgentSession(async () => {
		if (!controllerState.activeWorkspaceId) throw new Error("Select a workspace first.");
		const selected = findResource(controllerState.selectedId);
		if (typeof selectedResourceHasExternalLock === "function" && selectedResourceHasExternalLock()) throw new Error(EXTERNAL_RESOURCE_LOCK_MESSAGE);
		const requestedAgentName = String(agentName || "").trim();
		const agent = requestedAgentName ? enabledAgentConfigs().find((candidate) => candidate.id === requestedAgentName) : selectedAgentConfig();
		if (!agent) throw new Error("Select an enabled agent first.");
		controllerState.agent.agentName = agent.id;
		controllerState.agent.newSessionStarting = true;
		renderTTYComposer();
		refreshIcons();
		try {
			const response = await api(`/api/workspaces/${controllerState.activeWorkspaceId}/agent/runs`, {
				method: "POST",
				body: JSON.stringify({
					agentName: agent.id,
					userName: currentUserName(),
					resourceId: selected?.id || "",
					title: selected?.title || workspaceName(),
					prompt: "",
					cwd: agentDefaultCwd()
				})
			});
			controllerState.agent.draftPrompt = "";
			controllerState.agent.ttyDraft = "";
			controllerState.agent.ttyMultiline = false;
			controllerState.agent.ttyDraftKey = "";
			controllerState.agent.ttyDraftWorkspaceId = "";
			controllerState.agent.ttyDraftResourceId = "";
			controllerState.agent.ttyDraftRunId = "";
			controllerState.agent.ttyDraftVersion++;
			controllerState.agent.optionsOpen = false;
			controllerState.agent.agentChooserOpen = false;
			controllerState.agent.historyOpen = false;
			controllerState.agent.activeRunId = response.run.id;
			await Promise.all([loadAgentRuns(), refreshTreeAfterAgentSessionMutation()]);
			publishViewModels();
			toast("Agent session started.");
		} finally {
			controllerState.agent.newSessionStarting = false;
			renderTTYComposer();
			refreshIcons();
		}
	});
}
function agentInputSelfDrivingProjection(run) {
	const selected = findResource(controllerState.selectedId);
	const detail = selected ? controllerState.details[selected.id] || selected : null;
	if (!selected || selected.type !== "task" || !run || run.resourceId !== selected.id) return null;
	const selfDriving = detail?.selfDriving || null;
	return {
		resourceId: selected.id,
		selfDrivingProjectionSet: true,
		expectedSelfDrivingRevision: Number(selfDriving?.revision) || 0,
		expectedSelfDrivingCondition: String(selfDriving?.condition || "").trim().toLowerCase()
	};
}
async function sendAgentInputForContext(text, context) {
	if (!context?.runId) throw new Error("Start or select an agent run first.");
	if (typeof selectedResourceHasExternalLock === "function" && selectedResourceHasExternalLock()) throw new Error(EXTERNAL_RESOURCE_LOCK_MESSAGE);
	const run = currentAgentRun();
	if (context.workspaceId !== controllerState.activeWorkspaceId || context.runId !== run?.id || context.resourceId !== (run.resourceId || "") || context.draftKey !== controllerState.agent.ttyDraftKey) throw new Error("The selected Workspace or Session changed before the message could be sent.");
	const projection = agentInputSelfDrivingProjection(run);
	const body = {
		text,
		userName: currentUserName()
	};
	if (projection) Object.assign(body, projection);
	return api(`/api/workspaces/${context.workspaceId}/agent/runs/${context.runId}/input`, {
		method: "POST",
		body: JSON.stringify(body)
	});
}
function openAgentUploadDialog() {
	const run = currentAgentRun();
	if (!run || !isLiveAgentRun(run)) {
		toast("Start or resume an agent session before uploading files.");
		return;
	}
	const input = elementById<HTMLInputElement>("ttyInput");
	if (input) updateAgentDraft(input.value);
	controllerState.modalEnter = "upload";
	controllerState.uploadDialog = {
		open: true,
		identity: ++uploadDialogIdentity,
		runId: run.id,
		items: [],
		nextId: 1
	};
	renderAgentUploadDialog();
}
function closeAgentUploadDialog(paths: string[] = [], context: any = {}) {
	if (!controllerState.uploadDialog.open) return;
	const sameContext = context.workspaceId === controllerState.activeWorkspaceId && context.runId === controllerState.agent.activeRunId;
	const shouldSkipDraftSync = paths.length > 0 && sameContext && controllerState.uploadDialog.runId === controllerState.agent.activeRunId;
	if (shouldSkipDraftSync) {
		updateAgentDraft(appendUploadedPaths(controllerState.agent.ttyDraft, paths));
		controllerState.agent.ttyDraftResetVersion++;
	}
	discardAgentUploadDialog();
	const composer = elementById("ttyComposer");
	if (composer) delete composer.dataset.composerKey;
	renderTTYComposer({ skipDraftSync: shouldSkipDraftSync });
	elementById("ttyInput")?.focus({ preventScroll: true });
	refreshIcons();
}
function discardAgentUploadDialog() {
	controllerState.uploadDialog = {
		open: false,
		identity: ++uploadDialogIdentity,
		runId: "",
		items: [],
		nextId: 1
	};
	renderAgentUploadDialog();
}
function appendUploadedPaths(draft, paths) {
	const block = paths.filter(Boolean).join("\n");
	if (!block) return draft;
	if (!draft) return block;
	return `${draft}${draft.endsWith("\n") ? "" : "\n"}${block}`;
}
function renderAgentUploadDialog() {
	const dialog = controllerState.uploadDialog;
	publisher.renderUploadDialog({
		open: Boolean(dialog.open),
		identity: `${dialog.identity || 0}:${controllerState.activeWorkspaceId}:${dialog.runId || ""}`,
		workspaceId: controllerState.activeWorkspaceId,
		runId: dialog.runId || "",
		onDone: closeAgentUploadDialog,
		onIconsChanged: refreshIcons
	});
}
async function stopAgentRun() {
	if (!controllerState.agent.activeRunId || controllerState.agent.sessionStopping || controllerState.agent.turnStopping) return;
	const run = currentAgentRun();
	if (!isLiveAgentRun(run) || run.status === "stopping") return;
	return mutateAgentSession(async () => {
		const runId = controllerState.agent.activeRunId;
		controllerState.agent.sessionStopping = true;
		controllerState.agent.sessionStoppingRunId = runId;
		renderTTYComposer();
		refreshIcons();
		try {
			await closeAgentRun(runId);
			await Promise.all([loadAgentRuns(), refreshTreeAfterAgentSessionMutation()]);
			publishViewModels();
			toast("Agent session closed. Self-Driving desired state was not changed.");
		} catch (err) {
			try {
				await Promise.all([loadAgentRuns(), refreshTreeAfterAgentSessionMutation()]);
				publishViewModels();
			} catch (_) {}
			throw err;
		} finally {
			controllerState.agent.sessionStopping = false;
			controllerState.agent.sessionStoppingRunId = "";
			renderTTYComposer();
			refreshIcons();
		}
	});
}
async function disableSelectedSelfDriving() {
	if (controllerState.agent.selfDrivingDisabling) return;
	const selected = findResource(controllerState.selectedId);
	const detail = selected ? controllerState.details[selected.id] || selected : null;
	if (!detail || detail.type !== "task") return;
	return mutateAgentSession(async () => {
		controllerState.agent.selfDrivingDisabling = true;
		renderAgent();
		renderTTYComposer();
		refreshIcons();
		try {
			const response = await api(`/api/workspaces/${controllerState.activeWorkspaceId}/self-driving`, {
				method: "PUT",
				body: JSON.stringify({
					resourceId: detail.id,
					enabled: false
				})
			});
			await Promise.all([loadAgentRuns(), refreshTreeAfterAgentSessionMutation()]);
			publishViewModels();
			toast(response.notificationError ? `Self-Driving disabled. ${response.notificationError}` : "Self-Driving disabled. The Agent Session remains open.");
		} catch (err) {
			try {
				await Promise.all([loadAgentRuns(), refreshTreeAfterAgentSessionMutation()]);
				publishViewModels();
			} catch (_) {}
			throw err;
		} finally {
			controllerState.agent.selfDrivingDisabling = false;
			renderAgent();
			renderTTYComposer();
			refreshIcons();
		}
	});
}
async function stopAgentTurn() {
	if (!controllerState.agent.activeRunId || controllerState.agent.turnStopping || controllerState.agent.sessionStopping) return;
	if (!isAgentTurnInterruptible(currentAgentRun())) return;
	return mutateAgentSession(async () => {
		const runId = controllerState.agent.activeRunId;
		controllerState.agent.turnStopping = true;
		controllerState.agent.turnStoppingRunId = runId;
		renderTTYComposer();
		refreshIcons();
		try {
			await api(`/api/workspaces/${controllerState.activeWorkspaceId}/agent/runs/${runId}/interrupt`, { method: "POST" });
			await Promise.all([loadAgentRuns(), refreshTreeAfterAgentSessionMutation()]);
			publishViewModels();
			toast("Turn ended. The AgentHub Session remains open.");
		} catch (err) {
			try {
				await Promise.all([loadAgentRuns(), refreshTreeAfterAgentSessionMutation()]);
				publishViewModels();
			} catch (_) {}
			throw err;
		} finally {
			controllerState.agent.turnStopping = false;
			controllerState.agent.turnStoppingRunId = "";
			renderTTYComposer();
			refreshIcons();
		}
	});
}
async function switchAgentRun(runId) {
	if (!runId || runId === controllerState.agent.activeRunId) return;
	return mutateAgentSession(async () => {
		const workspaceId = controllerState.activeWorkspaceId;
		flushAgentDraft();
		const previousRun = currentAgentRun();
		controllerState.agent.activeRunId = runId;
		controllerState.agent.switchingRunId = runId;
		clearAgentDraftMemory();
		const nextRun = controllerState.agent.runs.find((run) => run.id === runId);
		if (nextRun) restoreAgentDraftForRun(nextRun);
		publishViewModels();
		try {
			if (previousRun && isLiveAgentRun(previousRun) && !previousRun.schedulerTurn) try {
				await closeAgentRun(previousRun.id);
			} catch (err) {
				if (workspaceId === controllerState.activeWorkspaceId && controllerState.agent.activeRunId === runId) {
					controllerState.agent.activeRunId = previousRun.id;
					clearAgentDraftMemory();
					restoreAgentDraftForRun(previousRun);
					publishViewModels();
				}
				throw err;
			}
			if (workspaceId !== controllerState.activeWorkspaceId || controllerState.agent.activeRunId !== runId) return;
			await Promise.all([loadAgentRuns(), refreshTreeAfterAgentSessionMutation()]);
			if (workspaceId === controllerState.activeWorkspaceId) publishViewModels();
		} finally {
			if (controllerState.agent.switchingRunId === runId) controllerState.agent.switchingRunId = "";
			renderAgent();
		}
	});
}
async function closeAgentRun(runId) {
	if (!runId) return;
	return api(`/api/workspaces/${controllerState.activeWorkspaceId}/agent/runs/${runId}/stop`, { method: "POST" });
}
async function resumeAgentRun() {
	if (!controllerState.agent.activeRunId) return;
	return mutateAgentSession(async () => {
		if (typeof selectedResourceHasExternalLock === "function" && selectedResourceHasExternalLock()) throw new Error(EXTERNAL_RESOURCE_LOCK_MESSAGE);
		flushAgentDraft();
		const response = await api(`/api/workspaces/${controllerState.activeWorkspaceId}/agent/runs/${controllerState.agent.activeRunId}/resume`, { method: "POST" });
		controllerState.agent.activeRunId = response.run.id;
		restoreAgentDraftForRun(response.run);
		controllerState.agent.historyOpen = false;
		await Promise.all([loadAgentRuns(), refreshTreeAfterAgentSessionMutation()]);
		publishViewModels();
		toast("Agent session resumed.");
	});
}
async function resolveAgentApprovalForRun(runId, requestId, reply) {
	if (!runId || !requestId) return;
	const workspaceId = controllerState.activeWorkspaceId;
	await api(`/api/workspaces/${workspaceId}/agent/runs/${runId}/approval`, {
		method: "POST",
		body: JSON.stringify({
			requestId,
			...reply
		})
	});
	if (workspaceId === controllerState.activeWorkspaceId) {
		await loadAgentRuns();
		publishViewModels();
	}
}
function currentAgentRun() {
	return controllerState.agent.runs.find((run) => run.id === controllerState.agent.activeRunId) || null;
}
function isLiveAgentRun(run) {
	return [
		"starting",
		"running",
		"waiting_approval",
		"idle",
		"stopping",
		"recovering"
	].includes(run?.status);
}
function isAgentTurnInterruptible(run) {
	return ["running", "waiting_approval"].includes(run?.status);
}
function isSelfDrivingSessionCloseTarget(run) {
	const resourceID = String(run?.resourceId || "").trim();
	if (!resourceID) return false;
	const selfDriving = findResource(resourceID)?.selfDriving;
	return Boolean(selfDriving?.enabled);
}
function isAgentTurnStopping(run) {
	return Boolean(controllerState.agent.turnStopping && controllerState.agent.turnStoppingRunId === run?.id);
}
function isAgentSessionStopping(run) {
	return Boolean(controllerState.agent.sessionStopping && controllerState.agent.sessionStoppingRunId === run?.id);
}
async function submitTTYInput(rawText, context) {
	const sendingKey = agentSessionMutationKey(context?.workspaceId, context?.runId);
	if (controllerState.agent.sendingInputRunIds.has(sendingKey)) return {
		accepted: false,
		clear: false
	};
	if (!String(rawText || "").trim()) return {
		accepted: false,
		clear: false
	};
	const sendingRun = currentAgentRun();
	if (!sendingRun) return {
		accepted: false,
		clear: false
	};
	restoreAgentDraftForRun(sendingRun);
	if (context.workspaceId !== controllerState.activeWorkspaceId || context.runId !== controllerState.agent.activeRunId || context.draftKey !== controllerState.agent.ttyDraftKey) throw new Error("The selected Workspace or Session changed before the message could be sent.");
	updateAgentDraft(rawText);
	const sendWorkspaceId = context.workspaceId;
	const sendRunId = context.runId;
	const sendResourceId = context.resourceId;
	const sendDraftKey = context.draftKey;
	const sendDraftVersion = controllerState.agent.ttyDraftVersion;
	controllerState.agent.sendingInputRunIds.add(sendingKey);
	try {
		const result = await sendAgentInputForContext(rawText, context);
		let clearedDraft = false;
		if (result?.status === "accepted") {
			clearedDraft = clearAgentDraftAfterAccepted({
				workspaceId: sendWorkspaceId,
				runId: sendRunId,
				key: sendDraftKey,
				text: rawText,
				version: sendDraftVersion
			});
			if (clearedDraft) controllerState.agent.ttyDraftResetVersion++;
			try {
				if (typeof refreshAgentInputProjection === "function") await refreshAgentInputProjection(sendWorkspaceId, sendResourceId);
			} catch (refreshError) {
				toast(`Message accepted, but the view could not refresh: ${errorMessage(refreshError)}`);
			}
		}
		return {
			accepted: result?.status === "accepted",
			clear: clearedDraft
		};
	} finally {
		controllerState.agent.sendingInputRunIds.delete(sendingKey);
		renderTTYComposer();
		refreshIcons();
	}
}
function agentDefaultCwd() {
	const selected = findResource(controllerState.selectedId);
	if (!selected) return "";
	return selected.path || "";
}
function selectedAgentResourceId() {
	if (controllerState.selectedId === "workspace") return "workspace";
	return findResource(controllerState.selectedId)?.id || "";
}
function relativeTime(value) {
	if (!value) return "unknown";
	const time = new Date(value).getTime();
	if (!Number.isFinite(time)) return value;
	const seconds = Math.max(0, Math.round((Date.now() - time) / 1e3));
	if (seconds < 60) return `${seconds}s ago`;
	const minutes = Math.round(seconds / 60);
	if (minutes < 60) return `${minutes}m ago`;
	const hours = Math.round(minutes / 60);
	if (hours < 24) return `${hours}h ago`;
	return `${Math.round(hours / 24)}d ago`;
}
function showProjectForm() {
	openCreateDialog("project");
}
function showTaskForm(projectId) {
	openCreateDialog("task", projectId);
}
function openCreateDialog(type, projectId = "") {
	createPreviewController?.abort();
	createPreviewController = null;
	createPreviewPendingKey = "";
	controllerState.modalEnter = "create";
	controllerState.createDialog = {
		open: true,
		identity: ++createDialogIdentity,
		type,
		projectId,
		templateName: "",
		templateFields: {},
		templateDirty: false,
		titleOverride: false,
		templateDigest: "",
		preview: null,
		previewing: false,
		previewError: "",
		previewKey: "",
		activeTab: "edit",
		editedMarkdown: null,
		showOptions: false,
		title: "",
		description: "",
		detail: "",
		slug: "",
		selfDriving: false,
		agentName: "",
		preferredAgentProfiles: [],
		prompt: "",
		completionCriteria: "",
		submitting: false
	};
	renderCreateDialog();
}
function closeCreateDialog() {
	if (controllerState.createDialog.submitting) return;
	createPreviewGeneration++;
	createPreviewController?.abort();
	createPreviewController = null;
	createPreviewPendingKey = "";
	controllerState.createDialog = {
		open: false,
		identity: ++createDialogIdentity,
		type: "",
		projectId: "",
		templateName: "",
		templateFields: {},
		templateDirty: false,
		titleOverride: false,
		templateDigest: "",
		preview: null,
		previewing: false,
		previewError: "",
		previewKey: "",
		activeTab: "edit",
		editedMarkdown: null,
		showOptions: false,
		title: "",
		description: "",
		detail: "",
		slug: "",
		selfDriving: false,
		agentName: "",
		preferredAgentProfiles: [],
		prompt: "",
		completionCriteria: "",
		submitting: false
	};
	renderCreateDialog();
}
function renderCreateDialog() {
	const dialog = controllerState.createDialog;
	publisher.renderCreateDialog({
		open: Boolean(dialog.open),
		identity: `${dialog.identity || 0}:${dialog.type}:${dialog.projectId}`,
		workspaceId: controllerState.activeWorkspaceId,
		draft: createDialogDraft(dialog),
		templates: dialog.type === "task" ? controllerState.details[dialog.projectId]?.templates || [] : [],
		agents: svelteAgentOptions(),
		profileKeys: (controllerState.config?.agentProfiles || []).map((profile) => profile.key),
		preview: dialog.preview,
		previewKey: dialog.previewKey || "",
		previewing: Boolean(dialog.previewing),
		previewError: dialog.previewError || "",
		templateDigest: dialog.templateDigest || "",
		submitting: Boolean(dialog.submitting),
		onClose: closeCreateDialog,
		onPreview: refreshCreateTaskPreview,
		onSubmit: submitCreateDialog,
		previewRequestKey: (draft) => JSON.stringify(createTaskRequest({
			...dialog,
			...createDialogStateFromDraft(draft),
			templateDigest: ""
		})),
		onConfirmTemplateSwitch: () => window.confirm("Discard edited template fields and switch templates?"),
		onIconsChanged: refreshIcons
	});
}
function createDialogDraft(dialog): CreateDraft {
	return {
		type: dialog.type === "task" ? "task" : "project",
		projectId: dialog.projectId || "",
		templateName: dialog.templateName || "",
		templateFields: { ...dialog.templateFields || {} },
		title: dialog.title || "",
		titleOverride: Boolean(dialog.titleOverride),
		description: dialog.description || "",
		detail: dialog.detail || "",
		slug: dialog.slug || "",
		selfDriving: Boolean(dialog.selfDriving),
		agentName: dialog.agentName || "",
		agentProfiles: (dialog.preferredAgentProfiles || []).join(", "),
		prompt: dialog.prompt || "",
		completionCriteria: dialog.completionCriteria || "",
		activeTab: dialog.activeTab === "preview" ? "preview" : "edit",
		editedMarkdown: dialog.editedMarkdown == null ? null : String(dialog.editedMarkdown),
		showOptions: Boolean(dialog.showOptions)
	};
}
function createDialogStateFromDraft(draft) {
	return {
		type: draft.type,
		projectId: draft.projectId,
		templateName: draft.templateName,
		templateFields: { ...draft.templateFields || {} },
		title: draft.title,
		titleOverride: Boolean(draft.titleOverride),
		description: draft.description,
		detail: draft.detail,
		slug: draft.slug,
		selfDriving: Boolean(draft.selfDriving),
		agentName: draft.agentName,
		preferredAgentProfiles: parseAgentProfiles(draft.agentProfiles),
		prompt: draft.prompt,
		completionCriteria: draft.completionCriteria,
		activeTab: draft.activeTab,
		editedMarkdown: draft.editedMarkdown,
		showOptions: Boolean(draft.showOptions)
	};
}
function syncCreateDialogDraft(draft) {
	if (!draft || !controllerState.createDialog.open) return;
	if (String(draft.templateName || "") !== String(controllerState.createDialog.templateName || "")) {
		controllerState.createDialog.preview = null;
		controllerState.createDialog.templateDigest = "";
		controllerState.createDialog.previewError = "";
		controllerState.createDialog.previewKey = "";
		controllerState.createDialog.previewing = false;
		createPreviewGeneration++;
		createPreviewController?.abort();
		createPreviewController = null;
		createPreviewPendingKey = "";
	}
	Object.assign(controllerState.createDialog, createDialogStateFromDraft(draft));
}
function createTaskRequest(dialog) {
	return {
		project: dialog.projectId,
		title: dialog.templateName ? dialog.titleOverride ? dialog.title : "" : dialog.title,
		...dialog.templateName ? {
			templateName: dialog.templateName,
			templateFields: dialog.templateFields,
			...dialog.templateDigest ? { expectedTemplateDigest: dialog.templateDigest } : {}
		} : { detail: dialog.detail },
		slug: dialog.slug,
		selfDriving: dialog.selfDriving,
		agentName: dialog.selfDriving ? dialog.agentName : "",
		preferredAgentProfiles: dialog.selfDriving ? dialog.preferredAgentProfiles : [],
		prompt: dialog.selfDriving ? dialog.prompt : "",
		completionCriteria: dialog.selfDriving ? dialog.completionCriteria : ""
	};
}
async function refreshCreateTaskPreview(draft) {
	const dialog = controllerState.createDialog;
	syncCreateDialogDraft(draft);
	if (!dialog.open || !dialog.templateName) return null;
	const request = createTaskRequest({
		...dialog,
		templateDigest: ""
	});
	const requestKey = JSON.stringify(request);
	if (dialog.previewing) {
		if (requestKey === createPreviewPendingKey) return null;
		createPreviewGeneration++;
		createPreviewController?.abort();
		createPreviewController = null;
		createPreviewPendingKey = "";
		dialog.previewing = false;
	}
	const selectedTemplate = (controllerState.details[dialog.projectId]?.templates || []).find((item) => item.name === dialog.templateName);
	if (selectedTemplate && !selectedTemplate.taskTitle && (!dialog.titleOverride || !String(dialog.title).trim())) {
		dialog.previewError = "This template does not generate a title. Enter a task title in the Edit tab to render the preview.";
		renderCreateDialog();
		return null;
	}
	dialog.previewing = true;
	dialog.previewError = "";
	const workspaceId = controllerState.activeWorkspaceId;
	const dialogIdentity = dialog.identity;
	const generation = ++createPreviewGeneration;
	createPreviewController?.abort();
	const controller = new AbortController();
	createPreviewController = controller;
	createPreviewPendingKey = requestKey;
	renderCreateDialog();
	try {
		const preview = await api(`/api/workspaces/${workspaceId}/tasks/preview`, {
			method: "POST",
			body: JSON.stringify(request),
			signal: controller.signal
		});
		if (generation !== createPreviewGeneration || dialogIdentity !== controllerState.createDialog.identity || workspaceId !== controllerState.activeWorkspaceId) return null;
		dialog.preview = preview;
		dialog.templateDigest = preview.template?.digest || "";
		dialog.previewKey = JSON.stringify(request);
		return preview;
	} catch (err) {
		if (controller.signal.aborted || generation !== createPreviewGeneration || dialogIdentity !== controllerState.createDialog.identity) return null;
		dialog.previewError = errorMessage(err);
		return null;
	} finally {
		if (generation === createPreviewGeneration && dialogIdentity === controllerState.createDialog.identity) {
			dialog.previewing = false;
			if (createPreviewController === controller) createPreviewController = null;
			if (createPreviewPendingKey === requestKey) createPreviewPendingKey = "";
			renderCreateDialog();
		}
	}
}
async function submitCreateDialog(draft) {
	const dialog = controllerState.createDialog;
	if (!dialog.open || dialog.submitting) return;
	syncCreateDialogDraft(draft);
	const workspaceId = controllerState.activeWorkspaceId;
	const dialogIdentity = dialog.identity;
	dialog.submitting = true;
	renderCreateDialog();
	try {
		if (dialog.type === "project") {
			await api(`/api/workspaces/${workspaceId}/projects`, {
				method: "POST",
				body: JSON.stringify({
					description: dialog.description,
					slug: dialog.slug
				})
			});
			toast("Project created.");
			controllerState.selectedId = "workspace";
		} else {
			let requestBody;
			const editedMarkdown = dialog.templateName && dialog.editedMarkdown != null && dialog.editedMarkdown !== dialog.preview?.markdown ? dialog.editedMarkdown : null;
			if (editedMarkdown != null) {
				const editedTitle = String(dialog.titleOverride ? dialog.title : dialog.preview?.title || "").trim();
				if (!editedTitle) throw new Error("Task title is required when creating from edited preview content.");
				requestBody = {
					project: dialog.projectId,
					title: editedTitle,
					taskMarkdown: editedMarkdown,
					slug: dialog.slug,
					selfDriving: dialog.selfDriving,
					agentName: dialog.selfDriving ? dialog.agentName : "",
					preferredAgentProfiles: dialog.selfDriving ? dialog.preferredAgentProfiles : [],
					prompt: dialog.selfDriving ? dialog.prompt : "",
					completionCriteria: dialog.selfDriving ? dialog.completionCriteria : ""
				};
			} else {
				if (dialog.templateName && !dialog.templateDigest) {
					await refreshCreateTaskPreview(createDialogDraft(dialog));
					if (!dialog.templateDigest) throw new Error(dialog.previewError || "Could not render the selected template.");
				}
				requestBody = createTaskRequest(dialog);
			}
			await api(`/api/workspaces/${workspaceId}/tasks`, {
				method: "POST",
				body: JSON.stringify(requestBody)
			});
			toast("Task created.");
		}
		if (controllerState.activeWorkspaceId !== workspaceId || controllerState.createDialog.identity !== dialogIdentity) return;
		controllerState.createDialog.open = false;
		controllerState.createDialog.identity = ++createDialogIdentity;
		await loadTree();
	} catch (err) {
		if (controllerState.createDialog.identity === dialogIdentity) {
			dialog.submitting = false;
			renderCreateDialog();
			toast(errorMessage(err));
		}
	}
}
function parseAgentProfiles(value) {
	const seen = /* @__PURE__ */ new Set();
	return String(value || "").split(",").map((item) => item.trim().toLowerCase()).filter((item) => {
		if (!item || seen.has(item)) return false;
		seen.add(item);
		return true;
	});
}
async function archiveResource(resourceId) {
	if (!confirm(`Archive ${resourceId}?`)) return;
	await api(`/api/workspaces/${controllerState.activeWorkspaceId}/archive`, {
		method: "POST",
		body: JSON.stringify({ resourceId })
	});
	toast("Archived.");
	controllerState.selectedId = "workspace";
	await loadTree();
}
function findResource(id) {
	if (!controllerState.tree) return null;
	for (const project of controllerState.tree.projects) {
		if (project.id === id) return project;
		for (const task of project.children || []) if (task.id === id) return task;
	}
	return null;
}
function ensureValidSelection() {
	if (controllerState.selectedId === "workspace" || findResource(controllerState.selectedId)) return false;
	controllerState.selectedId = "workspace";
	return true;
}
function parentProject(id) {
	if (!controllerState.tree) return null;
	for (const project of controllerState.tree.projects) {
		if (project.id === id) return project;
		if ((project.children || []).some((task) => task.id === id)) return project;
	}
	return null;
}
function isProjectExpanded(id) {
	return controllerState.expandedProjects.has(id);
}
function ensureSelectedProjectExpanded(persist = false) {
	const parent = parentProject(controllerState.selectedId);
	if (!parent || parent.id === controllerState.selectedId || controllerState.expandedProjects.has(parent.id)) return;
	controllerState.expandedProjects.add(parent.id);
	if (persist) saveUIState().catch((err) => toast(err.message));
}
function parseRoute(pathname = window.location.pathname) {
	const parts = pathname.split("/").filter(Boolean);
	if (parts[0] !== "w") return {};
	return {
		workspaceId: decodePathPart(parts[1]),
		resourceId: parts[2] === "r" ? decodePathPart(parts[3]) : "workspace"
	};
}
function decodePathPart(value = "") {
	try {
		return decodeURIComponent(value);
	} catch (_) {
		return "";
	}
}
function workspaceExists(id) {
	return Boolean(id && controllerState.config?.workspaces.some((workspace) => workspace.id === id));
}
function syncURL(options: any = {}) {
	if (!controllerState.activeWorkspaceId) return;
	const resourceId = controllerState.selectedId && controllerState.selectedId !== "workspace" ? controllerState.selectedId : "";
	const nextPath = resourceId ? `/w/${encodeURIComponent(controllerState.activeWorkspaceId)}/r/${encodeURIComponent(resourceId)}` : `/w/${encodeURIComponent(controllerState.activeWorkspaceId)}`;
	if (window.location.pathname === nextPath && controllerState.routeProjection.path === nextPath) return;
	controllerState.routeProjection = {
		path: nextPath,
		revision: controllerState.routeProjection.revision + 1,
		replace: Boolean(options.replace)
	};
	renderAppShell();
}
function workspaceName() {
	return controllerState.config?.workspaces.find((w) => w.id === controllerState.activeWorkspaceId)?.name || "Workspace";
}
function applyAgentConfig() {
	const agents = enabledAgentConfigs();
	const defaultAgentName = defaultChatAgentName();
	if (!agents.some((agent) => agent.id === controllerState.agent.agentName)) controllerState.agent.agentName = defaultAgentName;
}
function selectedAgentConfig() {
	const agents = enabledAgentConfigs();
	const agentName = controllerState.agent.agentName || defaultChatAgentName();
	return agents.find((agent) => agent.id === agentName) || agents[0] || null;
}
function enabledAgentConfigs() {
	return (controllerState.config?.agents || []).filter((agent) => agent.available !== false);
}
function defaultChatAgentName() {
	const agents = enabledAgentConfigs();
	const configured = configuredAgentProfileName(controllerState.config?.agentProfiles, "default") || configuredAgentProfileName(controllerState.settings.data?.agentProfiles, "default");
	if (configured) return configured;
	return agents[0]?.id || "";
}
function configuredAgentProfileName(profiles, key) {
	const normalizedKey = String(key || "").trim().toLowerCase();
	const profile = (profiles || []).find((item) => String(item.key || "").trim().toLowerCase() === normalizedKey);
	return String(profile?.agentName || "").trim();
}
async function openSettings(tab = "workspace") {
	controllerState.modalEnter = "settings";
	controllerState.settings.open = true;
	controllerState.settings.identity = ++settingsIdentity;
	controllerState.settings.tab = tab;
	controllerState.settings.agentDirty = false;
	controllerState.settings.expandedAgents = /* @__PURE__ */ new Set();
	controllerState.settings.workspaceIconPickerId = "";
	controllerState.settings.workspaceIconSavingId = "";
	await refreshSettings();
	renderSettingsModal();
}
function closeSettings(dirty = controllerState.settings.agentDirty) {
	if (controllerState.settings.open && dirty && !window.confirm("Discard unsaved agent settings changes?")) return;
	controllerState.settings.open = false;
	controllerState.settings.identity = ++settingsIdentity;
	controllerState.settings.agentDirty = false;
	renderSettingsModal();
}
async function refreshSettings() {
	const [base, agentHub] = await Promise.all([api("/api/settings"), api("/api/settings/agenthub")]);
	const catalogAgents = (agentHub.catalog?.agents || []).map((agent) => ({
		...agent,
		id: agent.name
	}));
	controllerState.settings.data = {
		...base,
		agentHub,
		agents: catalogAgents,
		agentProfiles: agentHub.config?.agentProfiles || []
	};
	controllerState.config = configWithAgentHubCatalog({
		...controllerState.config || {},
		...base
	}, agentHub);
	controllerState.settings.dataVersion = (controllerState.settings.dataVersion || 0) + 1;
}
function configWithAgentHubCatalog(base, agentHub) {
	const agents = (agentHub.catalog?.agents || []).filter((agent) => agent.available !== false).map((agent) => ({
		...agent,
		id: agent.name
	}));
	return {
		...base,
		agents,
		agentHubProviders: agentHub.catalog?.providers || [],
		agentProfiles: agentHub.config?.agentProfiles || []
	};
}
function snapshotAgentDraft() {
	const data = controllerState.settings.data || {};
	return {
		agents: data.agents || [],
		agentProfiles: data.agentProfiles || []
	};
}
async function refreshSettingsPreservingAgentDraft() {
	const draft = controllerState.settings.agentDirty ? snapshotAgentDraft() : null;
	await refreshSettings();
	if (draft) controllerState.settings.data = {
		...controllerState.settings.data || {},
		...draft
	};
}
async function submitSettingsWorkspace() {
	const path = controllerState.settings.workspacePath.trim();
	if (!path) throw new Error("Workspace path is required.");
	const created = controllerState.settings.createWorkspace;
	const workspace = await api("/api/workspaces", {
		method: "POST",
		body: JSON.stringify({
			path,
			create: created
		})
	});
	flushAgentDraft();
	controllerState.settings.workspacePath = "";
	controllerState.settings.createWorkspace = false;
	controllerState.config = await api("/api/workspaces");
	controllerState.activeWorkspaceId = workspace.id;
	resetAgentState();
	renderWorkspaceSelect();
	await loadUIState();
	await loadTree();
	await refreshSettingsPreservingAgentDraft();
	renderSettingsModal();
	toast(created ? "Workspace created." : "Workspace added.");
}
async function removeSettingsWorkspace(id) {
	if (!id) return;
	flushAgentDraft();
	await api(`/api/workspaces/${encodeURIComponent(id)}`, { method: "DELETE" });
	controllerState.config = await api("/api/workspaces");
	if (controllerState.activeWorkspaceId === id) {
		controllerState.activeWorkspaceId = controllerState.config.activeId || controllerState.config.workspaces[0]?.id || "";
		controllerState.selectedId = "workspace";
		resetAgentState();
		if (controllerState.activeWorkspaceId) {
			await loadUIState();
			await loadTree();
		} else {
			controllerState.tree = null;
			controllerState.details = {};
			publishViewModels();
		}
	} else renderWorkspaceSelect();
	await refreshSettingsPreservingAgentDraft();
	renderSettingsModal();
	toast("Workspace removed from Forge GUI.");
}
async function updateSettingsWorkspaceIcon(id, iconId) {
	if (!id || controllerState.settings.workspaceIconSavingId) return;
	controllerState.settings.workspaceIconSavingId = id;
	controllerState.settings.workspaceIconPickerId = "";
	renderSettingsModal();
	try {
		const workspace = await api(`/api/workspaces/${encodeURIComponent(id)}`, {
			method: "PUT",
			body: JSON.stringify({ icon: iconId || "" })
		});
		const replaceWorkspace = (items) => (items || []).map((item) => item.id === workspace.id ? workspace : item);
		controllerState.config = {
			...controllerState.config || {},
			workspaces: replaceWorkspace(controllerState.config?.workspaces)
		};
		controllerState.settings.data = {
			...controllerState.settings.data || {},
			workspaces: replaceWorkspace(controllerState.settings.data?.workspaces)
		};
		controllerState.settings.workspaceIconPickerId = "";
		renderWorkspaceSelect();
		toast(iconId ? "Workspace icon saved." : "Workspace icon reset to the Forge default.");
	} finally {
		controllerState.settings.workspaceIconSavingId = "";
		renderSettingsModal();
	}
}
function syncSettingsDraftFromSvelte(draft) {
	if (!draft || !controllerState.settings.open) return;
	controllerState.settings.tab = draft.tab || controllerState.settings.tab;
	controllerState.settings.workspacePath = String(draft.workspacePath || "");
	controllerState.settings.createWorkspace = Boolean(draft.createWorkspace);
	controllerState.settings.agentDirty = Boolean(draft.dirty);
	controllerState.settings.data = {
		...controllerState.settings.data || {},
		agentHub: {
			...controllerState.settings.data?.agentHub || {},
			configuredEndpoint: String(draft.endpoint || "")
		},
		agentProfiles: (draft.profiles || []).map((profile) => ({
			key: profile.key,
			description: profile.description,
			agentName: profile.agentName
		}))
	};
}
async function saveAgentSettings() {
	const data = controllerState.settings.data || {};
	await api("/api/settings/agenthub", {
		method: "PUT",
		body: JSON.stringify({
			endpoint: data.agentHub?.configuredEndpoint || "http://127.0.0.1:4646",
			agentProfiles: (data.agentProfiles || []).map((profile) => ({
				key: profile.key,
				description: profile.description,
				agentName: profile.agentName
			}))
		})
	});
	await refreshSettings();
	controllerState.config = configWithAgentHubCatalog(await api("/api/workspaces"), controllerState.settings.data.agentHub);
	controllerState.settings.agentDirty = false;
	applyAgentConfig();
	renderAgent();
	renderTTYComposer();
	renderSettingsModal();
	refreshIcons();
	toast("AgentHub settings saved.");
}
function sameJSON(a, b) {
	return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}
let toastRevision = 0;
function toast(message) {
	publisher.renderToast({ message: String(message || ""), revision: ++toastRevision });
}
function refreshIcons() {
	const lucide = window.lucide;
	if (!lucide || controllerState.iconRefreshScheduled) return;
	controllerState.iconRefreshScheduled = true;
	lifecycle?.animationFrame(() => {
		controllerState.iconRefreshScheduled = false;
		lucide.createIcons({ attrs: { "stroke-width": 2 } });
	});
}
function optionalAssetLoaded(asset) {
	refreshIcons();
	if (asset === "markdown" && window.marked && window.DOMPurify) {
		renderDetails();
		refreshIcons();
	}
	if (asset === "diff") renderDetails();
}
window.forgeAssetLoaded = optionalAssetLoaded;
function initPaneResize() {
	const raw = readStoredPaneSizes();
	controllerState.paneSizes = loadPaneSizes(raw, 0);
	applyPaneSizes();
	if (isFinitePaneSize(raw.detailsWidth) && !isFinitePaneSize(raw.chatWidth) && !isMobilePaneLayout()) {
		controllerState.paneSizes = loadPaneSizes(raw, workspacePanelWidth());
		applyPaneSizes();
		saveAllPaneSizes();
	}
}
function setCSSPixels(name, value) {
	document.documentElement.style.setProperty(name, `${Math.round(value)}px`);
}
const PANE_HANDLE_WIDTH = 8;
const SIDEBAR_MIN_WIDTH = 220;
const DETAILS_MIN_WIDTH = 360;
const CHAT_MIN_WIDTH = 320;
const PANE_MAX_SIZE = 1e4;
const PANE_DEFAULTS: Record<string, number> = Object.freeze({
	sidebarWidth: 280,
	chatWidth: 420,
	sidebarSessionHeight: 210
});
const PANE_CSS_VARIABLES = Object.freeze({
	sidebarWidth: "--sidebar-width",
	chatWidth: "--chat-width",
	sidebarSessionHeight: "--sidebar-session-height"
});
function setPaneSize(name, value) {
	if (!Object.hasOwn(PANE_CSS_VARIABLES, name) || !Number.isFinite(value)) return;
	const next = Math.round(clamp(value, name === "sidebarWidth" ? SIDEBAR_MIN_WIDTH : name === "chatWidth" ? CHAT_MIN_WIDTH : 84, PANE_MAX_SIZE));
	controllerState.paneSizes[name] = next;
	setCSSPixels(PANE_CSS_VARIABLES[name], next);
}
function applyPaneSizes() {
	for (const name of Object.keys(PANE_CSS_VARIABLES)) setPaneSize(name, controllerState.paneSizes[name]);
}
function savePaneSize(name) {
	if (!Object.hasOwn(PANE_CSS_VARIABLES, name)) return;
	const saved = readStoredPaneSizes();
	delete saved.detailsWidth;
	for (const paneName of Object.keys(PANE_CSS_VARIABLES)) if (!isFinitePaneSize(saved[paneName])) saved[paneName] = controllerState.paneSizes[paneName];
	saved[name] = controllerState.paneSizes[name];
	localStorage.setItem(PANE_SIZE_KEY, JSON.stringify(saved));
}
function saveAllPaneSizes() {
	localStorage.setItem(PANE_SIZE_KEY, JSON.stringify({ ...controllerState.paneSizes }));
}
function isFinitePaneSize(value) {
	return typeof value === "number" && Number.isFinite(value);
}
function readStoredPaneSizes() {
	try {
		const saved = JSON.parse(localStorage.getItem(PANE_SIZE_KEY) || "{}");
		return saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {};
	} catch (_) {
		return {};
	}
}
function normalizePaneSizes(raw, availableWorkspaceWidth = 0) {
	const source = raw && typeof raw === "object" ? raw : {};
	const sizes = { ...PANE_DEFAULTS };
	if (isFinitePaneSize(source.sidebarWidth)) sizes.sidebarWidth = clamp(source.sidebarWidth, SIDEBAR_MIN_WIDTH, PANE_MAX_SIZE);
	if (isFinitePaneSize(source.chatWidth)) sizes.chatWidth = clamp(source.chatWidth, CHAT_MIN_WIDTH, PANE_MAX_SIZE);
	else if (isFinitePaneSize(source.detailsWidth) && availableWorkspaceWidth >= 688) {
		const detailsWidth = clamp(source.detailsWidth, DETAILS_MIN_WIDTH, availableWorkspaceWidth - PANE_HANDLE_WIDTH - CHAT_MIN_WIDTH);
		sizes.chatWidth = clamp(availableWorkspaceWidth - PANE_HANDLE_WIDTH - detailsWidth, CHAT_MIN_WIDTH, PANE_MAX_SIZE);
	}
	if (isFinitePaneSize(source.sidebarSessionHeight)) sizes.sidebarSessionHeight = clamp(source.sidebarSessionHeight, 84, PANE_MAX_SIZE);
	return sizes;
}
function loadPaneSizes(raw = readStoredPaneSizes(), availableWorkspaceWidth = workspacePanelWidth()) {
	return normalizePaneSizes(raw, availableWorkspaceWidth);
}
function workspacePanelWidth() {
	return document.querySelector(".workspace-panel")?.getBoundingClientRect().width || 0;
}
function isMobilePaneLayout() {
	return typeof MOBILE_LAYOUT_QUERY !== "undefined" && MOBILE_LAYOUT_QUERY.matches;
}
function syncPaneViewport() {
	if (isMobilePaneLayout()) return;
	const raw = readStoredPaneSizes();
	if (isFinitePaneSize(raw.detailsWidth) && !isFinitePaneSize(raw.chatWidth)) {
		controllerState.paneSizes = normalizePaneSizes(raw, workspacePanelWidth());
		applyPaneSizes();
		saveAllPaneSizes();
	}
}
function clamp(value, min, max) {
	return Math.min(max, Math.max(min, value));
}
const MOBILE_LAYOUT_QUERY = window.matchMedia("(max-width: 980px)");
function setMobileSidebar(open) {
	controllerState.mobile.sidebarOpen = Boolean(open);
	document.body.classList.toggle("mobile-sidebar-open", controllerState.mobile.sidebarOpen);
	renderAppShell();
}
function setMobileView(view) {
	controllerState.mobile.view = view === "chat" ? "chat" : "details";
	const chatActive = controllerState.mobile.view === "chat";
	document.body.classList.toggle("mobile-chat-active", chatActive);
	renderAppShell();
}
function loadMobileImmersive() {
	try {
		return localStorage.getItem(MOBILE_IMMERSIVE_KEY) === "1";
	} catch (_) {
		return false;
	}
}
function setMobileImmersive(immersive) {
	controllerState.mobile.immersive = Boolean(immersive);
	document.body.classList.toggle("chat-immersive", controllerState.mobile.immersive);
	try {
		localStorage.setItem(MOBILE_IMMERSIVE_KEY, controllerState.mobile.immersive ? "1" : "0");
	} catch (_) {}
	renderAppShell();
}
function installControllerListeners() {
	lifecycle?.listen(document, "selectionchange", () => {
	if (!controllerState.agent.renderDeferredForSelection) return;
	const log = elementById("ttyLog");
	if (log && ttyLogHasActiveSelection(log)) return;
	controllerState.agent.renderDeferredForSelection = false;
	renderTTY();
	refreshIcons();
	});
	lifecycle?.listen(document, "keydown", (event) => {
	if (event.key === "Escape" && controllerState.diff) closeDiff();
	else if (event.key === "Escape" && controllerState.preview) closePreview();
	else if (event.key === "Escape" && (controllerState.agent.optionsOpen || controllerState.agent.agentChooserOpen || controllerState.agent.historyOpen)) {
		controllerState.agent.optionsOpen = false;
		controllerState.agent.agentChooserOpen = false;
		controllerState.agent.historyOpen = false;
		renderAgent();
		renderTTYComposer();
		refreshIcons();
	}
	});
	lifecycle?.listen(document, "click", (event) => {
	const target = event.target instanceof Element ? event.target : null;
	const breadcrumbButton = target?.closest<HTMLElement>("[data-breadcrumb-resource]");
	if (breadcrumbButton) {
		openBreadcrumbResource(breadcrumbButton.dataset.breadcrumbResource).catch((err) => toast(err.message));
		return;
	}
	const outsideAgentChooser = controllerState.agent.agentChooserOpen && target && !target.closest(".tty-new-session-control");
	const outsideAgentPanelMenu = (controllerState.agent.optionsOpen || controllerState.agent.historyOpen) && target && !target.closest(".agent-actions") && !target.closest(".agent-sessions") && !target.closest(".tty-composer");
	if (outsideAgentChooser || outsideAgentPanelMenu) {
		controllerState.agent.optionsOpen = false;
		controllerState.agent.agentChooserOpen = false;
		controllerState.agent.historyOpen = false;
		renderAgent();
		renderTTYComposer();
		refreshIcons();
	}
	if (!controllerState.sessionMenu) return;
	if (target?.closest(".session-row") || target?.closest(".session-resource-menu")) return;
	controllerState.sessionMenu = null;
	renderSessions();
		refreshIcons();
	});
	lifecycle?.listen(window, "beforeunload", flushAgentDraftOnPageLeave);
	lifecycle?.listen(document, "visibilitychange", () => {
		if (document.hidden || document.visibilityState === "hidden") flushAgentDraftOnPageLeave();
	});
}
let appBooted = false;
function startForgeApp(nextPublisher: ForgeViewPublisher) {
	publisher = nextPublisher;
	if (appBooted) {
		publishAllViewModels();
		return;
	}
	appBooted = true;
	lifecycle = new ResourceScope();
	installControllerListeners();
	initPaneResize();
	installNotificationCrossTabListeners();
	controllerState.user.name = readStoredUserName();
	installUserSettingsCrossTabListener();
	controllerState.mobile.immersive = loadMobileImmersive();
	renderAppShell();
	load().catch((err) => {
		controllerState.navigationLoading = false;
		controllerState.navigationError = err.message;
		toast(err.message);
		publishViewModels();
	});
	startAutoRefresh();
}
function flushAgentDraftOnPageLeave() {
	flushAgentDraft();
}
function stopForgeApp() {
	if (!appBooted) return;
	flushAgentDraftOnPageLeave();
	appBooted = false;
	closeAgentStream();
	closeNotificationChannel();
	clearAgentRenderTimer();
	createPreviewController?.abort();
	createPreviewController = null;
	lifecycle?.dispose();
	lifecycle = null;
	controllerState.autoRefreshTimer = null;
}
async function handleHistoryNavigation(pathname) {
	const route = parseRoute(pathname);
	if (!workspaceExists(route.workspaceId)) {
		syncURL({ replace: true });
		return;
	}
	const workspaceChanged = controllerState.activeWorkspaceId !== route.workspaceId;
	const previousSelectedId = controllerState.selectedId;
	flushAgentDraft();
	controllerState.navigationVersion++;
	controllerState.autoRefreshVersion++;
	controllerState.treeRequestVersion++;
	controllerState.detailRequestVersion++;
	controllerState.workspaceAgentsRequestVersion++;
	controllerState.previewRequestVersion++;
	controllerState.diffRequestVersion++;
	controllerState.workspaceAgentsSaving = false;
	const navigationVersion = controllerState.navigationVersion;
	controllerState.activeWorkspaceId = route.workspaceId;
	controllerState.selectedId = route.resourceId || "workspace";
	if (!workspaceChanged && previousSelectedId !== controllerState.selectedId && controllerState.selectedId !== "workspace") {
		resetResourceLogState(controllerState.selectedId);
		delete controllerState.details[controllerState.selectedId];
	}
	controllerState.preview = null;
	controllerState.diff = null;
	controllerState.sessionMenu = null;
	if (workspaceChanged) {
		controllerState.tree = null;
		controllerState.navigationLoading = true;
		controllerState.navigationError = "";
		resetWorkspaceAgentsDraft();
		controllerState.workspaceAgentsSaving = false;
		closeCreateDialog();
		initializeNotificationState(controllerState.activeWorkspaceId);
	}
	if (workspaceChanged) resetAgentState();
	renderWorkspaceSelect();
	if (workspaceChanged) {
		if (!await loadUIState(route.workspaceId, navigationVersion)) return;
		if (!route.resourceId && controllerState.lastResourceId) controllerState.selectedId = controllerState.lastResourceId;
		await loadTree({ updateURL: false });
		if (isCurrentWorkspaceView(route.workspaceId, navigationVersion)) syncURL({ replace: true });
	} else {
		const selectionCorrected = ensureValidSelection();
		if (controllerState.selectedId === "workspace") await loadWorkspaceAgents();
		else {
			ensureSelectedProjectExpanded(false);
			await loadDetail(controllerState.selectedId);
		}
		if (!isCurrentWorkspaceView(route.workspaceId, navigationVersion)) return;
		if (previousSelectedId !== controllerState.selectedId) await reloadAgentRunsForSelection();
		publishViewModels();
		if (selectionCorrected) syncURL({ replace: true });
	}
}
export { startForgeApp, stopForgeApp };
