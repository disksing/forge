const state = {
  config: null,
  tree: null,
  details: {},
  resourceLogPages: {},
  workspaceAgents: null,
  workspaceAgentsDraft: "",
  workspaceAgentsDirty: false,
  workspaceAgentsSaving: false,
  activeWorkspaceId: "",
  workspaceMenuOpen: false,
  selectedId: "",
  lastResourceId: "",
  expandedProjects: new Set(),
  projectOrder: [],
  taskOrder: {},
  sessionOrder: [],
  listDrag: null,
  expandedPaths: new Set(),
  preview: null,
  diff: null,
  modalEnter: "",
  sessionMenu: null,
  taskOperationalStateKey: "",
  paneSizes: {
    sidebarWidth: 280,
    chatWidth: 420,
    sidebarSessionHeight: 210,
  },
  settings: {
    open: false,
    identity: 0,
    dataVersion: 0,
    tab: "workspace",
    data: null,
    agentDirty: false,
    expandedAgents: new Set(),
    suppressDraftSync: false,
    workspacePath: "",
    createWorkspace: false,
    saving: false,
    workspaceIconPickerId: "",
    workspaceIconSavingId: "",
    newProfile: {
      key: "",
      description: "",
      agentName: "",
    },
  },
  user: {
    name: "User",
  },
  notifications: {
    ready: false,
    workspaceId: "",
    store: null,
    settings: null,
    channel: null,
    tabId: "tab-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2),
    audioContext: null,
    soundError: "",
    permissionError: "",
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
    submitting: false,
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
    returnFocus: null,
  },
  uploadDialog: {
    open: false,
    identity: 0,
    runId: "",
    items: [],
    nextId: 1,
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
    immersive: false,
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
    sendingInput: false,
    turnStopping: false,
    turnStoppingRunId: "",
    sessionStopping: false,
    sessionStoppingRunId: "",
    toolGroupOpen: new Map(),
    approvalDrafts: new Map(),
    selfDrivingFinishNoticeWatermarks: new Map(),
    renderDeferredForSelection: false,
  },
  tty: [
    { type: "system", text: "Forge GUI initialized." },
    { type: "system", text: "Workspace data is loaded through forge CLI." },
  ],
};

const $ = (id) => document.getElementById(id);
const AUTO_REFRESH_INTERVAL_MS = 5000;
const RESOURCE_LOG_INITIAL_LIMIT = 10;
const RESOURCE_LOG_MORE_LIMIT = 20;
const TASK_OUTPUT_FRESH_WINDOW_MS = 60 * 1000;
const PANE_SIZE_KEY = "forge.gui.paneSizes";
const MOBILE_IMMERSIVE_KEY = "forge.gui.mobileImmersive";
const AGENT_OLDER_RAW_PAGE_LIMIT = 250;
const AGENT_MANUAL_VISIBLE_EVENT_COUNT = 5;
const AGENT_MANUAL_RAW_PAGE_LIMIT = 500;
const AGENT_MANUAL_AUTO_PAGE_LIMIT = 8;
const EXTERNAL_RESOURCE_LOCK_MESSAGE = "This resource is locked by an external session. New sessions and session input are unavailable until the lock is released; the Self-Driving switch remains available.";
const SELF_DRIVING_FINISH_NOTICE_KIND = "self-driving-finish";
const SELF_DRIVING_FINISH_NOTICE_WAITING_LIFECYCLE = "until-reconcile";
const SELF_DRIVING_RESUMABLE_STATES = new Set(["waiting", "blocked", "error"]);
const AGENT_DRAFT_STORAGE_PREFIX = "forge.gui.agentDraft.v1";
const AGENT_DRAFT_STORAGE_VERSION = 1;
const NOTIFICATION_STORAGE_PREFIX = "forge.gui.notifications.v1";
const NOTIFICATION_SETTINGS_KEY = `${NOTIFICATION_STORAGE_PREFIX}.settings`;
const NOTIFICATION_STORE_VERSION = 1;
const USER_SETTINGS_KEY = "forge.gui.user.v1";
const USER_SETTINGS_VERSION = 1;
const USER_NAME_MAX_LENGTH = 80;
const NOTIFICATION_MAX_SEEN = 2000;
const NOTIFICATION_MAX_UNREAD = 200;
const NOTIFICATION_MAX_EFFECTS = 2000;
const AGENT_DRAFT_MAX_ORPHAN_COUNT = 50;
const AGENT_DRAFT_MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000;
// Auto-fill keeps paging older raw events after the initial tail page until
// the log overflows its viewport (with slack), so a tool-heavy tail does not
// leave the chat area mostly blank. The page cap bounds pathological cases
// where thousands of raw events collapse into a single tool group.
const AGENT_AUTOFILL_OVERFLOW_PX = 160;
const AGENT_AUTOFILL_MAX_PAGES = 16;
const AGENT_HIDDEN_EVENT_TYPES = new Set(["session.launch-environment"]);
const TASK_RUNNING_SESSION_STATES = new Set(["starting", "running", "waiting_approval", "recovering"]);
const SYSTEM_AGENT_PROFILE_KEYS = new Set(["default", "fast", "reasoning", "scheduler"]);
const DEFAULT_WORKSPACE_ICON = { id: "", label: "Forge default", src: "/favicon.svg", type: "image/svg+xml" };
const WORKSPACE_ICONS = [
  { id: "home-base", label: "Home base", src: "/workspace-icons/01-home-base.png" },
  { id: "personal-tasks", label: "Personal tasks", src: "/workspace-icons/02-personal-tasks.png" },
  { id: "product-roadmap", label: "Product roadmap", src: "/workspace-icons/03-product-roadmap.png" },
  { id: "software-engineering", label: "Software engineering", src: "/workspace-icons/04-software-engineering.png" },
  { id: "design-studio", label: "Design studio", src: "/workspace-icons/05-design-studio.png" },
  { id: "marketing-campaign", label: "Marketing campaign", src: "/workspace-icons/06-marketing-campaign.png" },
  { id: "sales-pipeline", label: "Sales pipeline", src: "/workspace-icons/07-sales-pipeline.png" },
  { id: "operations", label: "Operations", src: "/workspace-icons/08-operations.png" },
  { id: "finance", label: "Finance", src: "/workspace-icons/09-finance.png" },
  { id: "research-lab", label: "Research lab", src: "/workspace-icons/10-research-lab.png" },
  { id: "learning-education", label: "Learning and education", src: "/workspace-icons/11-learning-education.png" },
  { id: "customer-support", label: "Customer support", src: "/workspace-icons/12-customer-support.png" },
  { id: "events-calendar", label: "Events and calendar", src: "/workspace-icons/13-events-calendar.png" },
  { id: "documentation-knowledge", label: "Documentation and knowledge", src: "/workspace-icons/14-documentation-knowledge.png" },
  { id: "analytics", label: "Analytics", src: "/workspace-icons/15-analytics.png" },
  { id: "community-team", label: "Community and team", src: "/workspace-icons/16-community-team.png" },
];
const WORKSPACE_ICON_BY_ID = new Map(WORKSPACE_ICONS.map((item) => [item.id, item]));
let createDialogIdentity = 0;
let selfDrivingDialogIdentity = 0;
let uploadDialogIdentity = 0;
let settingsIdentity = 0;
let createPreviewGeneration = 0;
let createPreviewController = null;
let createPreviewPendingKey = "";

function svelteAgentOptions() {
  return enabledAgentConfigs().map((agent) => ({
    id: agent.id || "",
    label: agentDisplayName(agent),
    summary: agentConfigSummary(agent),
  }));
}

function renderMigratedSvelteIslands() {
  renderCreateDialog();
  renderSelfDrivingConfigDialog();
  renderAgentUploadDialog();
  renderTTYComposer();
  renderSettingsModal();
}

if (typeof window !== "undefined") window.ForgeLegacySvelteReady = renderMigratedSvelteIslands;

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
  return normalizeUserName(state.user?.name);
}

function saveStoredUserName(value) {
  const name = normalizeUserName(value);
  try {
    window.localStorage.setItem(USER_SETTINGS_KEY, JSON.stringify({ version: USER_SETTINGS_VERSION, name }));
  } catch (_) {
    return false;
  }
  state.user.name = name;
  return true;
}

function installUserSettingsCrossTabListener() {
  window.addEventListener("storage", (event) => {
    if (event.key !== USER_SETTINGS_KEY) return;
    state.user.name = decodeStoredUserName(event.newValue);
    if (state.settings.open && state.settings.tab === "user") renderSettingsModal();
  });
}

function notificationStateKey(workspaceId = state.notifications.workspaceId) {
  const workspace = String(workspaceId || "").trim();
  return workspace ? `${NOTIFICATION_STORAGE_PREFIX}.state.${encodeURIComponent(workspace)}` : "";
}

function notificationDefaultStore() {
  return { version: NOTIFICATION_STORE_VERSION, seen: [], pending: [], unread: [], effects: [] };
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
    at: Number(raw.at) || Date.now(),
  };
}

function normalizeNotificationStore(raw) {
  if (!raw || raw.version !== NOTIFICATION_STORE_VERSION) return notificationDefaultStore();
  const seen = Array.isArray(raw.seen)
    ? raw.seen.map((item) => ({ marker: String(item?.marker || "").trim(), at: Number(item?.at) || Date.now() })).filter((item) => item.marker)
    : [];
  const pending = Array.isArray(raw.pending) ? raw.pending.map(notificationRecord).filter(Boolean) : [];
  const unread = Array.isArray(raw.unread) ? raw.unread.map(notificationRecord).filter(Boolean) : [];
  const effects = Array.isArray(raw.effects)
    ? raw.effects.map((item) => ({ key: String(item?.key || "").trim(), at: Number(item?.at) || Date.now() })).filter((item) => item.key)
    : [];
  return {
    version: NOTIFICATION_STORE_VERSION,
    seen: seen.slice(-NOTIFICATION_MAX_SEEN),
    pending: pending.slice(-NOTIFICATION_MAX_UNREAD),
    unread: unread.slice(-NOTIFICATION_MAX_UNREAD),
    effects: effects.slice(-NOTIFICATION_MAX_EFFECTS),
  };
}

function readNotificationStore(workspaceId = state.notifications.workspaceId) {
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
  if (!storage || !key || !state.notifications.store) return;
  state.notifications.store = normalizeNotificationStore(state.notifications.store);
  try {
    storage.setItem(key, JSON.stringify(state.notifications.store));
  } catch (_) {
    // Browser storage is optional. The in-memory store continues to protect
    // the current page from duplicate effects when persistence is unavailable.
  }
}

function readNotificationSettings() {
  const defaults = { browser: false, sound: false };
  const storage = notificationStorage();
  if (!storage) return defaults;
  try {
    const parsed = JSON.parse(storage.getItem(NOTIFICATION_SETTINGS_KEY) || "null");
    if (!parsed || parsed.version !== NOTIFICATION_STORE_VERSION) return defaults;
    return { browser: Boolean(parsed.browser), sound: Boolean(parsed.sound) };
  } catch (_) {
    try {
      storage.removeItem(NOTIFICATION_SETTINGS_KEY);
    } catch (_) {}
    return defaults;
  }
}

function writeNotificationSettings() {
  const storage = notificationStorage();
  if (!storage || !state.notifications.settings) return;
  try {
    storage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify({
      version: NOTIFICATION_STORE_VERSION,
      browser: Boolean(state.notifications.settings.browser),
      sound: Boolean(state.notifications.settings.sound),
    }));
  } catch (_) {}
}

function notificationPermission() {
  if (typeof window.Notification === "undefined") return "unsupported";
  const permission = String(window.Notification.permission || "default");
  return ["granted", "default", "denied"].includes(permission) ? permission : "default";
}

function notificationPermissionLabel(permission) {
  switch (permission) {
    case "granted": return "granted";
    case "denied": return "denied — restore permission in Chrome site settings";
    case "unsupported": return "unsupported in this browser";
    default: return "not requested";
  }
}

function initializeNotificationState(workspaceId) {
  const nextWorkspace = String(workspaceId || "").trim();
  if (!nextWorkspace) return;
  closeNotificationChannel();
  state.notifications.workspaceId = nextWorkspace;
  state.notifications.store = readNotificationStore(nextWorkspace);
  state.notifications.settings = readNotificationSettings();
  if (notificationPermission() !== "granted") {
    state.notifications.settings.browser = false;
    writeNotificationSettings();
  }
  state.notifications.ready = false;
  state.notifications.permissionError = "";
  openNotificationChannel(nextWorkspace);
}

function openNotificationChannel(workspaceId) {
  const Channel = window.BroadcastChannel || globalThis.BroadcastChannel;
  if (typeof Channel !== "function") return;
  try {
    const channel = new Channel(`${NOTIFICATION_STORAGE_PREFIX}.${encodeURIComponent(workspaceId)}`);
    channel.onmessage = (event) => handleNotificationBroadcast(event.data);
    state.notifications.channel = channel;
  } catch (_) {
    state.notifications.channel = null;
  }
}

function closeNotificationChannel() {
  try {
    state.notifications.channel?.close();
  } catch (_) {}
  state.notifications.channel = null;
}

function broadcastNotification(message) {
  try {
    state.notifications.channel?.postMessage({ ...message, workspaceId: state.notifications.workspaceId, sourceTabId: state.notifications.tabId });
  } catch (_) {}
}

function handleNotificationBroadcast(message) {
  if (!message || message.workspaceId !== state.notifications.workspaceId || message.sourceTabId === state.notifications.tabId) return;
  const store = state.notifications.store || notificationDefaultStore();
  if (message.type === "effect" && message.effectKey) {
    if (!store.effects.some((item) => item.key === message.effectKey)) {
      store.effects.push({ key: message.effectKey, at: Number(message.at) || Date.now() });
      state.notifications.store = store;
      writeNotificationStore();
    }
    return;
  }
  if (message.type === "record" && message.record) {
    const record = notificationRecord(message.record);
    if (!record) return;
    if (!store.seen.some((item) => item.marker === record.marker)) store.seen.push({ marker: record.marker, at: record.at });
    if (notificationRecordIsCurrentAndVisible(record)) {
      store.unread = store.unread.filter((item) => item.marker !== record.marker);
      store.pending = store.pending.filter((item) => item.marker !== record.marker);
      state.notifications.store = store;
      writeNotificationStore();
      broadcastNotification({ type: "clear-resource", resourceId: record.resourceId });
      if (state.tree) renderSessions();
      return;
    }
    if (!store.unread.some((item) => item.marker === record.marker)) store.unread.push(record);
    state.notifications.store = store;
    writeNotificationStore();
    if (state.tree) {
      renderSessions();
      refreshIcons();
    }
    return;
  }
  if (message.type === "clear-marker" && message.marker) {
    store.unread = store.unread.filter((item) => item.marker !== message.marker);
    store.pending = store.pending.filter((item) => item.marker !== message.marker);
    state.notifications.store = store;
    writeNotificationStore();
    if (state.tree) renderSessions();
    return;
  }
  if (message.type === "clear-resource" && message.resourceId) {
    const resourceId = String(message.resourceId);
    store.unread = store.unread.filter((item) => item.resourceId !== resourceId);
    store.pending = store.pending.filter((item) => item.resourceId !== resourceId);
    state.notifications.store = store;
    writeNotificationStore();
    if (state.tree) renderSessions();
  }
}

function notificationStore() {
  if (!state.notifications.store) state.notifications.store = notificationDefaultStore();
  return state.notifications.store;
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
  if (item?.source === "internal" || item?.source === "external") {
    const navigation = sessionNavigationTarget(item);
    return navigation.primaryResourceId || "";
  }
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
  const isSelfDriving = Boolean(item?.schedulerTurn) || revision > 0;
  if (!isSelfDriving) return { isSelfDriving: false, state: "", final: false, suppressed: false };
  const resource = findResource(resourceId);
  const selfDriving = resource?.selfDriving;
  const stateName = String(selfDriving?.condition || "disabled").trim().toLowerCase();
	const completed = !selfDriving?.enabled && selfDriving?.lastOutcome?.status === "completed";
	const requiresAttention = Boolean(selfDriving?.enabled) && ["blocked", "error", "needs_configuration"].includes(stateName);
	const disabledControl = !selfDriving?.enabled && !completed;
	const final = completed || requiresAttention;
	return { isSelfDriving: true, state: stateName, final, suppressed: !final, disabledControl };
}

function notificationRecordFor(item, marker, completionState = "") {
  const resourceId = notificationResourceIDFor(item);
  const resource = findResource(resourceId);
  const selfDriving = notificationSelfDrivingContext(item, resourceId);
  return notificationRecord({
    workspaceId: state.notifications.workspaceId,
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
    at: Date.now(),
  });
}

function notificationRecordIsCurrentAndVisible(record) {
  if (!record?.resourceId || state.selectedId !== record.resourceId) return false;
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
  const effects = new Map();
  for (const effect of [...persisted.effects, ...store.effects]) {
    if (effect?.key) effects.set(effect.key, effect);
  }
  store.effects = [...effects.values()].slice(-NOTIFICATION_MAX_EFFECTS);
  state.notifications.store = store;
}

function claimNotificationEffect(record, kind) {
  const key = notificationEffectKey(record, kind);
  const store = notificationStore();
  if (store.effects.some((item) => item.key === key)) return false;
  store.effects.push({ key, at: Date.now() });
  state.notifications.store = store;
  writeNotificationStore();
  broadcastNotification({ type: "effect", effectKey: key, at: Date.now() });
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
    Promise.resolve(locks.request(`forge.gui.notification.${state.notifications.workspaceId}.${notificationEffectKey(record, kind)}`, { ifAvailable: true }, (lock) => {
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
  const kind = record.resourceType === "project" ? "Project" : record.resourceType === "task" ? "Task" : "Session";
  return `${kind}: ${record.title || record.resourceId || record.sessionId}`;
}

function notificationDisplayBody(record) {
  if (record.selfDriving) {
    const stateName = record.selfDrivingState || "finished";
    return `Self-Driving ${stateName}.`;
  }
  if (record.completionState === "failed") return "Turn failed.";
  if (record.completionState === "cancelled") return "Turn cancelled.";
  return "Turn completed.";
}

function playCompletionSound() {
  if (!state.notifications.settings?.sound) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (typeof AudioContext !== "function") {
    state.notifications.soundError = "Audio is unavailable in this browser.";
    if (state.settings.open && state.settings.tab === "notifications") renderSettingsModal();
    return;
  }
  try {
    const audio = state.notifications.audioContext || new AudioContext();
    state.notifications.audioContext = audio;
    const start = () => {
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, audio.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(660, audio.currentTime + 0.12);
      gain.gain.setValueAtTime(0.0001, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.08, audio.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.16);
      oscillator.connect(gain);
      gain.connect(audio.destination);
      oscillator.start();
      oscillator.stop(audio.currentTime + 0.18);
    };
    if (audio.state === "suspended") {
      audio.resume().then(start).catch((err) => {
        state.notifications.soundError = "Chrome blocked completion sound until audio is enabled by the page.";
        console.warn("completion sound unavailable", err);
        if (state.settings.open && state.settings.tab === "notifications") renderSettingsModal();
      });
    } else {
      start();
    }
  } catch (err) {
    state.notifications.soundError = "Completion sound is unavailable right now.";
    console.warn("completion sound unavailable", err);
    if (state.settings.open && state.settings.tab === "notifications") renderSettingsModal();
  }
}

function sendBrowserNotification(record, alreadyClaimed = false) {
  if (!state.notifications.settings?.browser || notificationPermission() !== "granted") return;
  if (!alreadyClaimed && !claimNotificationEffect(record, "browser")) return;
  try {
    const notification = new window.Notification(notificationDisplayTitle(record), {
      body: notificationDisplayBody(record),
      tag: `forge-${record.marker}`,
      icon: "/favicon.svg",
    });
    notification.onclick = () => {
      try { window.focus(); } catch (_) {}
      navigateToNotification(record).catch((err) => console.warn("notification navigation failed", err));
    };
  } catch (err) {
    console.warn("browser notification unavailable", err);
  }
}

function deliverCompletionEffects(record) {
  if (state.notifications.settings?.browser && notificationPermission() === "granted") {
    withNotificationEffectClaim(record, "browser", () => sendBrowserNotification(record, true));
  }
  if (state.notifications.settings?.sound) {
    withNotificationEffectClaim(record, "sound", playCompletionSound);
  }
}

function observeCompletion(item, completionState = "") {
  const marker = notificationMarkerFor(item);
  const sessionId = notificationSessionIDFor(item);
  if (!marker || !sessionId || !state.notifications.workspaceId) return false;
  const record = notificationRecordFor(item, marker, completionState);
  if (!record.sessionId) return false;
  const store = notificationStore();
  const seen = store.seen.some((entry) => entry.marker === marker);
  const pendingIndex = store.pending.findIndex((entry) => entry.marker === marker);
  const selfDriving = notificationSelfDrivingContext(item, record.resourceId);
  if (!state.notifications.ready) {
    if (!seen) store.seen.push({ marker, at: Date.now() });
    store.pending = store.pending.filter((entry) => entry.marker !== marker);
    state.notifications.store = store;
    writeNotificationStore();
    return false;
  }
  if (seen && pendingIndex < 0) return false;
  if (selfDriving.isSelfDriving && selfDriving.state === "waiting") {
    if (!seen) store.seen.push({ marker, at: Date.now() });
    store.pending = store.pending.filter((entry) => entry.marker !== marker);
    state.notifications.store = store;
    writeNotificationStore();
    return false;
  }
  if (selfDriving.isSelfDriving && selfDriving.disabledControl) {
    // Disabling Self-Driving is a control-plane action, not a
    // completed/failed turn. Mark any projection as handled without adding
    // unread state or triggering browser/sound effects.
    if (!seen) store.seen.push({ marker, at: Date.now() });
    store.pending = store.pending.filter((entry) => entry.marker !== marker);
    store.unread = store.unread.filter((entry) => entry.marker !== marker);
    state.notifications.store = store;
    writeNotificationStore();
    return false;
  }
  if (selfDriving.isSelfDriving && selfDriving.suppressed && !selfDriving.final) {
    if (!seen) store.seen.push({ marker, at: Date.now() });
    if (pendingIndex < 0) store.pending.push(record);
    state.notifications.store = store;
    writeNotificationStore();
    return false;
  }
  if (!seen) store.seen.push({ marker, at: Date.now() });
  store.pending = store.pending.filter((entry) => entry.marker !== marker);
  if (notificationRecordIsCurrentAndVisible(record)) {
    state.notifications.store = store;
    writeNotificationStore();
    return false;
  }
  store.unread = store.unread.filter((entry) => entry.marker !== marker);
  store.unread.push(record);
  state.notifications.store = store;
  writeNotificationStore();
  broadcastNotification({ type: "record", record });
  deliverCompletionEffects(record);
  if (state.tree) {
    renderSessions();
    refreshIcons();
  }
  return true;
}

function observeCompletionProjections(items) {
  for (const item of items || []) {
    if (notificationMarkerFor(item)) observeCompletion(item, item.completionState || item.agentRunCompletionState || "");
  }
}

function observeCompletionEvent(event, run) {
  const completionState = notificationEventState(event);
  if (!completionState || !event?.sessionId || !Number(event.id)) return;
  const marker = `${event.sessionId}:${event.id}`;
  const item = {
    ...(run || {}),
    completionMarker: marker,
    completionState,
    agentHubSessionId: run?.agentHubSessionId || event.sessionId,
  };
  observeCompletion(item, completionState);
}

function establishNotificationBaseline() {
  if (state.notifications.ready) return;
  observeCompletionProjections(state.tree?.sessions || []);
  observeCompletionProjections(state.agent.runs || []);
  state.notifications.ready = true;
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
  const changed = store.unread.some((record) => record.marker === value) || store.pending.some((record) => record.marker === value);
  if (!changed) return;
  store.unread = store.unread.filter((record) => record.marker !== value);
  store.pending = store.pending.filter((record) => record.marker !== value);
  state.notifications.store = store;
  writeNotificationStore();
  broadcastNotification({ type: "clear-marker", marker: value });
  if (state.tree) renderSessions();
}

function clearUnreadForResource(resourceId) {
  const value = String(resourceId || "").trim();
  if (!value) return;
  const store = notificationStore();
  const changed = store.unread.some((record) => record.resourceId === value) || store.pending.some((record) => record.resourceId === value);
  if (!changed) return;
  store.unread = store.unread.filter((record) => record.resourceId !== value);
  store.pending = store.pending.filter((record) => record.resourceId !== value);
  state.notifications.store = store;
  writeNotificationStore();
  broadcastNotification({ type: "clear-resource", resourceId: value });
  if (state.tree) renderSessions();
}

function notificationSettingsChanged() {
  writeNotificationSettings();
  if (state.settings.open && state.settings.tab === "notifications") renderSettingsModal();
}

async function requestBrowserNotifications() {
  const permission = notificationPermission();
  if (permission === "unsupported") {
    state.notifications.settings.browser = false;
    state.notifications.permissionError = "Browser notifications are not supported here.";
    notificationSettingsChanged();
    return permission;
  }
  if (permission === "denied") {
    state.notifications.settings.browser = false;
    state.notifications.permissionError = "Chrome denied permission. Restore it in Chrome site settings; Forge will not ask again automatically.";
    notificationSettingsChanged();
    return permission;
  }
  let nextPermission = permission;
  if (permission === "default") {
    try {
      nextPermission = await window.Notification.requestPermission();
    } catch (err) {
      state.notifications.permissionError = "Chrome could not request notification permission.";
      console.warn("notification permission request failed", err);
    }
  }
  if (nextPermission === "granted") {
    state.notifications.settings.browser = true;
    state.notifications.permissionError = "";
  } else {
    state.notifications.settings.browser = false;
    state.notifications.permissionError = nextPermission === "denied"
      ? "Chrome denied permission. Restore it in Chrome site settings; Forge will not ask again automatically."
      : "Notification permission is still pending.";
  }
  notificationSettingsChanged();
  return nextPermission;
}

function setBrowserNotificationsEnabled(enabled) {
  state.notifications.settings = state.notifications.settings || readNotificationSettings();
  if (!enabled) {
    state.notifications.settings.browser = false;
    state.notifications.permissionError = "";
    notificationSettingsChanged();
    return;
  }
  requestBrowserNotifications().catch((err) => {
    state.notifications.settings.browser = false;
    state.notifications.permissionError = "Chrome could not request notification permission.";
    console.warn("notification permission request failed", err);
    notificationSettingsChanged();
  });
}

function initializeCompletionAudio() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (typeof AudioContext !== "function") {
    state.notifications.soundError = "Audio is unavailable in this browser.";
    notificationSettingsChanged();
    return Promise.resolve(false);
  }
  try {
    state.notifications.audioContext = state.notifications.audioContext || new AudioContext();
    const resume = state.notifications.audioContext.resume?.();
    return Promise.resolve(resume).then(() => {
      state.notifications.soundError = "";
      notificationSettingsChanged();
      return true;
    }).catch((err) => {
      state.notifications.soundError = "Chrome may block sound until the page receives an audio gesture.";
      console.warn("completion audio initialization failed", err);
      notificationSettingsChanged();
      return false;
    });
  } catch (err) {
    state.notifications.soundError = "Completion sound is unavailable right now.";
    console.warn("completion audio initialization failed", err);
    notificationSettingsChanged();
    return Promise.resolve(false);
  }
}

function setCompletionSoundEnabled(enabled) {
  state.notifications.settings = state.notifications.settings || readNotificationSettings();
  state.notifications.settings.sound = Boolean(enabled);
  state.notifications.soundError = "";
  notificationSettingsChanged();
  if (enabled) initializeCompletionAudio();
}

async function navigateToNotification(record) {
  if (!record?.resourceId) return;
  try {
    await selectResource(record.resourceId, { clearUnread: false, forceDetail: true });
    if (record.runId) {
      const run = state.agent.runs.find((item) => item.id === record.runId);
      if (run) {
        state.agent.activeRunId = run.id;
        await loadCanonicalAgentEvents();
        renderAgent();
        renderTTY();
        bindAgentEvents();
        refreshIcons();
      }
    }
  } finally {
    clearUnreadForMarker(record.marker);
  }
}

function installNotificationCrossTabListeners() {
  window.addEventListener("storage", (event) => {
    if (event.key === notificationStateKey() && event.newValue) {
      state.notifications.store = readNotificationStore();
      if (state.tree) renderSessions();
    }
    if (event.key === NOTIFICATION_SETTINGS_KEY) {
      state.notifications.settings = readNotificationSettings();
      if (notificationPermission() !== "granted") state.notifications.settings.browser = false;
      if (state.settings.open && state.settings.tab === "notifications") renderSettingsModal();
    }
  });
  document.addEventListener("visibilitychange", () => {
    flushAgentDraftOnPageLeave();
    if (notificationPageIsVisibleAndFocused()) clearUnreadForResource(state.selectedId);
  });
  window.addEventListener("focus", () => clearUnreadForResource(state.selectedId));
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

function agentDraftKeyForRun(run, workspaceId = state.activeWorkspaceId) {
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
  const protectedKeys = new Set();
  if (state.agent.ttyDraftWorkspaceId === workspaceId && state.agent.ttyDraftResourceId === resourceId && state.agent.ttyDraftKey) {
    protectedKeys.add(state.agent.ttyDraftKey);
  }
  for (const run of state.agent.runs || []) {
    if (agentDraftResourceScope(run.resourceId) !== resourceId) continue;
    const key = agentDraftKeyForRun(run, workspaceId);
    if (key) protectedKeys.add(key);
  }
  return protectedKeys;
}

function pruneAgentDraftStorage(workspaceId = state.activeWorkspaceId, resourceId = state.agent.ttyDraftResourceId) {
  const storage = agentDraftStorage();
  const workspace = String(workspaceId || "").trim();
  const resource = agentDraftResourceScope(resourceId);
  if (!storage || !workspace || !resource) return;
  const prefix = `${AGENT_DRAFT_STORAGE_PREFIX}.session.${agentDraftStoragePart(workspace)}.`;
  const protectedKeys = agentDraftProtectedKeys(workspace, resource);
  const candidates = [];
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
      candidates.push({ key, updatedAt });
    }
    candidates.sort((left, right) => left.updatedAt - right.updatedAt);
    while (candidates.length > AGENT_DRAFT_MAX_ORPHAN_COUNT) {
      removeAgentDraft(candidates.shift().key);
    }
  } catch (_) {
    // localStorage is optional; pruning must never affect the composer.
  }
}

function writeAgentDraft(key, text, context = {}) {
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
      sessionId: context.sessionId || "",
    }));
  } catch (_) {
    // Quota/security errors fall back to the in-memory draft.
  }
}

function persistAgentDraft() {
  const key = state.agent.ttyDraftKey;
  if (!key) return;
  writeAgentDraft(key, state.agent.ttyDraft, {
    workspaceId: state.agent.ttyDraftWorkspaceId,
    resourceId: state.agent.ttyDraftResourceId,
    runId: state.agent.ttyDraftRunId,
    sessionId: agentDraftSessionIdentity(currentAgentRun()),
  });
  pruneAgentDraftStorage(state.agent.ttyDraftWorkspaceId, state.agent.ttyDraftResourceId);
}

function updateAgentDraft(text, persist = true) {
  const next = String(text ?? "");
  if (state.agent.ttyDraft !== next) {
    state.agent.ttyDraft = next;
    state.agent.ttyDraftVersion++;
  }
  state.agent.ttyMultiline = next.includes("\n");
  if (persist) persistAgentDraft();
}

function clearAgentDraftMemory() {
  state.agent.ttyDraft = "";
  state.agent.ttyMultiline = false;
  state.agent.ttyDraftKey = "";
  state.agent.ttyDraftWorkspaceId = "";
  state.agent.ttyDraftResourceId = "";
  state.agent.ttyDraftRunId = "";
  state.agent.ttyDraftVersion++;
}

function restoreAgentDraftForRun(run, workspaceId = state.activeWorkspaceId) {
  const key = agentDraftKeyForRun(run, workspaceId);
  if (!key) {
    clearAgentDraftMemory();
    return;
  }
  if (state.agent.ttyDraftKey === key) return;
  state.agent.ttyDraftKey = key;
  state.agent.ttyDraftWorkspaceId = String(workspaceId || "").trim();
  state.agent.ttyDraftResourceId = agentDraftResourceScope(run.resourceId);
  state.agent.ttyDraftRunId = String(run.id || "");
  state.agent.ttyDraft = readAgentDraft(key);
  state.agent.ttyMultiline = state.agent.ttyDraft.includes("\n");
  state.agent.ttyDraftVersion++;
  pruneAgentDraftStorage(state.agent.ttyDraftWorkspaceId, state.agent.ttyDraftResourceId);
}

function syncAgentDraftFromDOM() {
  // The Svelte composer publishes every edit into the draft store. Reading
  // the DOM here would create a second owner and can resurrect stale input.
}

function flushAgentDraft() {
  syncAgentDraftFromDOM();
  persistAgentDraft();
}

function clearAgentDraftAfterAccepted({ workspaceId, runId, key, text, version }) {
  if (
    state.activeWorkspaceId !== workspaceId ||
    state.agent.activeRunId !== runId ||
    state.agent.ttyDraftKey !== key ||
    state.agent.ttyDraft !== text ||
    state.agent.ttyDraftVersion !== version
  ) {
    return false;
  }
  removeAgentDraft(key);
  updateAgentDraft("", false);
  return true;
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!response.ok) {
    let message = `${response.status} ${response.statusText}`;
    try {
      const body = await response.json();
      message = body.error || message;
    } catch (_) {}
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  if (response.status === 204) return null;
  return response.json();
}

async function load() {
  const route = parseRoute();
  const [base, agentHub] = await Promise.all([api("/api/workspaces"), api("/api/settings/agenthub")]);
  state.config = configWithAgentHubCatalog(base, agentHub);
  applyAgentConfig();
  state.activeWorkspaceId = workspaceExists(route.workspaceId) ? route.workspaceId : state.config.activeId || state.config.workspaces[0]?.id || "";
  state.selectedId = route.resourceId || "workspace";
  renderWorkspaceSelect();
  if (state.activeWorkspaceId) {
    initializeNotificationState(state.activeWorkspaceId);
    await loadUIState();
    if (!route.resourceId && state.lastResourceId) {
      state.selectedId = state.lastResourceId;
    }
    await loadTree({ replaceURL: true });
  } else {
    state.tree = null;
    state.details = {};
    state.resourceLogPages = {};
    state.workspaceAgents = null;
    state.preview = null;
    state.diff = null;
    resetAgentState();
    renderAll();
  }
}

async function loadTree(options = {}) {
  if (!state.activeWorkspaceId) return;
  const workspaceId = state.activeWorkspaceId;
  const navigationVersion = state.navigationVersion;
  const treeRequestVersion = ++state.treeRequestVersion;
  state.detailRequestVersion++;
  state.workspaceAgentsRequestVersion++;
  state.previewRequestVersion++;
  state.diffRequestVersion++;
  const tree = await api(`/api/workspaces/${workspaceId}/tree`);
  if (!isCurrentWorkspaceView(workspaceId, navigationVersion, treeRequestVersion)) return;
  state.tree = tree;
  state.details = {};
  state.resourceLogPages = {};
  state.workspaceAgents = null;
  state.workspaceAgentsSaving = false;
  state.preview = null;
  state.diff = null;
  ensureValidSelection();
  ensureSelectedProjectExpanded(false);
  if (state.selectedId === "workspace") {
    await loadWorkspaceAgents();
  } else if (state.selectedId) {
    await loadDetail(state.selectedId);
  }
  if (!isCurrentWorkspaceView(workspaceId, navigationVersion, treeRequestVersion)) return;
  await loadAgentRuns();
  if (!isCurrentWorkspaceView(workspaceId, navigationVersion, treeRequestVersion)) return;
  if (!state.notifications.ready) establishNotificationBaseline();
  renderAll();
  if (options.updateURL !== false) {
    syncURL({ replace: Boolean(options.replaceURL) });
  }
}

async function loadDetail(id, options = {}) {
  if (!id || id === "workspace" || (state.details[id] && !options.force)) return;
  if (options.force) {
    resetResourceLogState(id);
    delete state.details[id];
  }
  const workspaceId = state.activeWorkspaceId;
  const navigationVersion = state.navigationVersion;
  const detailRequestVersion = ++state.detailRequestVersion;
  const detail = await fetchDetail(id, workspaceId, { logsLimit: RESOURCE_LOG_INITIAL_LIMIT });
  if (
    !isCurrentWorkspaceView(workspaceId, navigationVersion) ||
    state.selectedId !== id ||
    detailRequestVersion !== state.detailRequestVersion
  ) {
    return null;
  }
  return applyResourceDetail(detail, "replace");
}

function fetchDetail(id, workspaceId = state.activeWorkspaceId, options = {}) {
  const params = new URLSearchParams();
  const cursor = options.logsCursor === undefined ? options.cursor : options.logsCursor;
  const limit = options.logsLimit === undefined ? (options.limit === undefined ? RESOURCE_LOG_INITIAL_LIMIT : options.limit) : options.logsLimit;
  params.set("logsLimit", String(limit));
  if (cursor !== undefined && cursor !== null && String(cursor) !== "") {
    params.set("logsCursor", String(cursor));
  }
  return api(`/api/workspaces/${workspaceId}/resources/${encodeURIComponent(id)}?${params.toString()}`);
}

function resetResourceLogState(resourceId) {
  if (!state.resourceLogPages) state.resourceLogPages = {};
  if (resourceId) delete state.resourceLogPages[resourceId];
}

function resourceLogPage(resourceId) {
  if (!state.resourceLogPages) state.resourceLogPages = {};
  if (!state.resourceLogPages[resourceId]) {
    state.resourceLogPages[resourceId] = {
      loaded: false,
      hasMore: false,
      nextCursor: "",
      loading: false,
      error: "",
      requestVersion: 0,
    };
  }
  return state.resourceLogPages[resourceId];
}

function resourceLogEntries(detail) {
  if (Array.isArray(detail?.logs) && detail.logs.length) return detail.logs;
  if (Array.isArray(detail?.logPage?.entries)) return detail.logPage.entries;
  return Array.isArray(detail?.logs) ? detail.logs : [];
}

function mergeResourceLogs(existing, incoming, prepend) {
  const next = [];
  const byID = new Map();
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
  const page = state.resourceLogPages?.[resourceId];
  return {
    detail: state.details[resourceId] || null,
    page: page ? {
      loaded: page.loaded,
      hasMore: page.hasMore,
      nextCursor: page.nextCursor,
      loading: page.loading,
      error: page.error,
    } : null,
  };
}

function applyResourceDetail(detail, mode = "head") {
  if (!detail?.id) return null;
  const resourceId = detail.id;
  const incoming = resourceLogEntries(detail);
  const incomingPage = detail.logPage || null;
  const page = resourceLogPage(resourceId);
  const replace = mode === "replace" || !page.loaded || !state.details[resourceId];
  if (replace) {
    page.loaded = true;
    page.hasMore = Boolean(incomingPage?.hasMore);
    page.nextCursor = String(incomingPage?.nextCursor || "");
    page.error = "";
    const logs = mergeResourceLogs([], incoming, true);
    state.details[resourceId] = { ...detail, logs, logPage: { hasMore: page.hasMore, nextCursor: page.nextCursor } };
    return state.details[resourceId];
  }

  const current = state.details[resourceId];
  const logs = mergeResourceLogs(current.logs || [], incoming, mode !== "older");
  if (mode === "older" && incomingPage) {
    page.hasMore = Boolean(incomingPage.hasMore);
    page.nextCursor = String(incomingPage.nextCursor || "");
  }
  page.loaded = true;
  page.error = "";
  const nextDetail = mode === "older" ? current : { ...current, ...detail };
  state.details[resourceId] = {
    ...nextDetail,
    logs,
    logPage: { hasMore: page.hasMore, nextCursor: page.nextCursor },
  };
  return state.details[resourceId];
}

async function loadMoreLogs(resourceId = state.selectedId) {
  if (!resourceId || resourceId === "workspace" || state.selectedId !== resourceId) return;
  const page = resourceLogPage(resourceId);
  if (!page.loaded || !page.hasMore || page.loading) return;
  const cursor = String(page.nextCursor || "");
  if (!cursor) {
    page.error = "The log page did not provide a continuation cursor.";
    renderDetails();
    bindLogEvents();
    return;
  }
  const workspaceId = state.activeWorkspaceId;
  const navigationVersion = state.navigationVersion;
  const requestVersion = ++page.requestVersion;
  page.loading = true;
  page.error = "";
  renderDetails();
  bindLogEvents();
  try {
    const detail = await fetchDetail(resourceId, workspaceId, {
      logsCursor: cursor,
      logsLimit: RESOURCE_LOG_MORE_LIMIT,
    });
    if (!isCurrentWorkspaceView(workspaceId, navigationVersion) ||
        state.selectedId !== resourceId ||
        state.resourceLogPages[resourceId] !== page ||
        requestVersion !== page.requestVersion) return;
    applyResourceDetail(detail, "older");
  } catch (err) {
    if (isCurrentWorkspaceView(workspaceId, navigationVersion) &&
        state.selectedId === resourceId &&
        state.resourceLogPages[resourceId] === page &&
        requestVersion === page.requestVersion) {
      page.error = err.message || "Could not load older logs.";
    }
  } finally {
    if (isCurrentWorkspaceView(workspaceId, navigationVersion) &&
        state.selectedId === resourceId &&
        state.resourceLogPages[resourceId] === page &&
        requestVersion === page.requestVersion) {
      page.loading = false;
      renderDetails();
      bindLogEvents();
      refreshIcons();
    }
  }
}

async function loadWorkspaceAgents(options = {}) {
  if (!state.activeWorkspaceId || (state.workspaceAgents && !options.force)) return;
  const workspaceId = state.activeWorkspaceId;
  const navigationVersion = state.navigationVersion;
  const requestVersion = ++state.workspaceAgentsRequestVersion;
  try {
    const agents = await api(`/api/workspaces/${workspaceId}/files?path=${encodeURIComponent("AGENTS.md")}`);
    if (!isCurrentWorkspaceView(workspaceId, navigationVersion) || requestVersion !== state.workspaceAgentsRequestVersion) return null;
    state.workspaceAgents = agents;
  } catch (err) {
    if (!isCurrentWorkspaceView(workspaceId, navigationVersion) || requestVersion !== state.workspaceAgentsRequestVersion) return null;
    state.workspaceAgents = {
      path: "AGENTS.md",
      name: "AGENTS.md",
      error: err.message,
    };
  }
  return state.workspaceAgents;
}

async function loadUIState(workspaceId = state.activeWorkspaceId, navigationVersion = state.navigationVersion) {
  const uiState = await api(`/api/workspaces/${workspaceId}/ui-state`);
  if (!isCurrentWorkspaceView(workspaceId, navigationVersion)) return false;
  state.expandedProjects = new Set(uiState.expandedProjects || []);
  state.lastResourceId = uiState.lastResourceId || "";
  state.projectOrder = Array.isArray(uiState.projectOrder) ? uiState.projectOrder : [];
  state.taskOrder = uiState.taskOrder && typeof uiState.taskOrder === "object" ? uiState.taskOrder : {};
  state.sessionOrder = Array.isArray(uiState.sessionOrder) ? uiState.sessionOrder : [];
  return true;
}

async function saveUIState() {
  if (!state.activeWorkspaceId) return;
  const workspaceId = state.activeWorkspaceId;
  const navigationVersion = state.navigationVersion;
  const selectedId = state.selectedId;
  await api(`/api/workspaces/${workspaceId}/ui-state`, {
    method: "PUT",
    body: JSON.stringify({
      version: 1,
      expandedProjects: [...state.expandedProjects],
      lastResourceId: selectedId,
      projectOrder: state.projectOrder,
      taskOrder: state.taskOrder,
      sessionOrder: state.sessionOrder,
    }),
  });
  if (isCurrentWorkspaceView(workspaceId, navigationVersion)) {
    state.lastResourceId = selectedId;
  }
}

function startAutoRefresh() {
  if (state.autoRefreshTimer) return;
  state.autoRefreshTimer = setInterval(() => {
    autoRefresh().catch((err) => {
      console.warn("auto refresh failed", err);
    });
  }, AUTO_REFRESH_INTERVAL_MS);
}

async function autoRefresh() {
  if (!state.activeWorkspaceId || state.autoRefreshInFlight || state.agentSessionMutationCount > 0 || state.listDrag) return;
  const refreshVersion = state.autoRefreshVersion;
  const workspaceId = state.activeWorkspaceId;
  const navigationVersion = state.navigationVersion;
  let selectedId = state.selectedId;
  state.autoRefreshInFlight = true;
  try {
    const tree = await fetchCurrentTree(workspaceId);
    if (!tree || !isCurrentAutoRefresh(workspaceId, navigationVersion, refreshVersion)) return;
    let changed = !sameJSON(state.tree, tree);
    if (changed) {
      state.tree = tree;
    }
    if (typeof observeCompletionProjections === "function") observeCompletionProjections(tree.sessions || []);
    if (changed && state.preview?.section === "Wiki" && !state.preview.loading) {
      await refreshFilePreview("Wiki", state.preview.path);
      if (!isCurrentAutoRefresh(workspaceId, navigationVersion, refreshVersion)) return;
    }
    if (ensureValidSelection()) {
      syncURL({ replace: true });
      changed = true;
      selectedId = state.selectedId;
    }
    const expandedCount = state.expandedProjects.size;
    ensureSelectedProjectExpanded(false);
    changed = changed || expandedCount !== state.expandedProjects.size;
    if (state.selectedId === "workspace") {
      const previousAgents = state.workspaceAgents;
      await loadWorkspaceAgents({ force: true });
      if (!isCurrentAutoRefresh(workspaceId, navigationVersion, refreshVersion)) return;
      if (!sameJSON(previousAgents, state.workspaceAgents)) {
        changed = true;
      }
    } else if (selectedId) {
      const detailRequestVersion = ++state.detailRequestVersion;
      const detail = await fetchDetail(selectedId, workspaceId, { logsLimit: RESOURCE_LOG_INITIAL_LIMIT });
      if (
        !isCurrentAutoRefresh(workspaceId, navigationVersion, refreshVersion) ||
        state.selectedId !== selectedId ||
        detailRequestVersion !== state.detailRequestVersion
      ) return;
      const previousDetail = resourceDetailSnapshot(selectedId);
      applyResourceDetail(detail, "head");
      if (!sameJSON(previousDetail, resourceDetailSnapshot(selectedId))) {
        changed = true;
      }
    }
    state.agentRunProjectionVersion = (Number(state.agentRunProjectionVersion) || 0) + 1;
    const agentRunProjectionVersion = state.agentRunProjectionVersion;
    const runs = await fetchAgentRuns();
    if (!isCurrentAutoRefresh(workspaceId, navigationVersion, refreshVersion) ||
        agentRunProjectionVersion !== state.agentRunProjectionVersion) return;
    const runsChanged = !sameJSON(state.agent.runs, runs);
    if (runsChanged) {
      state.agent.runs = runs;
      changed = true;
    }
    if (typeof observeCompletionProjections === "function") observeCompletionProjections(runs);
    if (typeof reconcileAgentNotices === "function") reconcileAgentNotices(runs);
    if (reconcileActiveAgentRun(runs)) {
      await loadCanonicalAgentEvents({ projectionVersion: agentRunProjectionVersion });
      if (!isCurrentAutoRefresh(workspaceId, navigationVersion, refreshVersion) ||
          agentRunProjectionVersion !== state.agentRunProjectionVersion) return;
      connectAgentStream();
      changed = true;
    }
    if (typeof reconcileAgentNotices === "function") reconcileAgentNotices(state.agent.runs);
    if (taskOperationalStateKey() !== state.taskOperationalStateKey) {
      changed = true;
    }
    if (changed) {
      renderAll();
    }
  } finally {
    state.autoRefreshInFlight = false;
  }
}

function renderAll() {
  renderTree();
  renderSessions();
  renderDetails();
  bindLogEvents();
  bindWorkspaceAgentsEvents();
  bindTemplateEvents();
  bindArtifactBrowserEvents();
  bindFileModalEvents();
  bindDiffEvents();
  bindDiffModalEvents();
  renderAgent();
  renderTTY();
  bindAgentEvents();
  refreshIcons();
  renderDiffContent();
  renderCreateDialog();
  renderSelfDrivingConfigDialog();
  renderSettingsModal();
}

function renderSelectionPanels() {
  renderTree();
  renderSessions();
  renderDetails();
  bindLogEvents();
  bindWorkspaceAgentsEvents();
  bindTemplateEvents();
  bindArtifactBrowserEvents();
  bindFileModalEvents();
  bindDiffEvents();
  bindDiffModalEvents();
  renderAgent();
  renderTTY();
  bindAgentEvents();
  refreshIcons();
  renderDiffContent();
  renderCreateDialog();
  renderSelfDrivingConfigDialog();
}

function isCurrentWorkspaceView(workspaceId, navigationVersion, treeRequestVersion = null) {
  return workspaceId === state.activeWorkspaceId &&
    navigationVersion === state.navigationVersion &&
    (treeRequestVersion == null || treeRequestVersion === state.treeRequestVersion);
}

function isCurrentAutoRefresh(workspaceId, navigationVersion, refreshVersion) {
  return isCurrentWorkspaceView(workspaceId, navigationVersion) && refreshVersion === state.autoRefreshVersion;
}

function workspaceIconOption(workspace) {
  return WORKSPACE_ICON_BY_ID.get(String(workspace?.icon || "").trim()) || DEFAULT_WORKSPACE_ICON;
}

function workspaceIconMarkup(workspace, className = "") {
  const option = workspaceIconOption(workspace);
  return `<img src="${escapeHTML(option.src)}" alt="" aria-hidden="true"${className ? ` class="${escapeHTML(className)}"` : ""} />`;
}

function updateWorkspaceFavicon(workspace) {
  const option = workspaceIconOption(workspace);
  let link = document.querySelector('link[rel="icon"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.type = option.type || "image/png";
  link.href = option.src;
}

function renderWorkspaceSelect() {
  const active = state.config.workspaces.find((workspace) => workspace.id === state.activeWorkspaceId);
  const avatar = $("workspaceAvatar");
  avatar.innerHTML = workspaceIconMarkup(active);
  updateWorkspaceFavicon(active);
  $("workspaceSwitcherName").textContent = active?.name || "Workspace";
  $("workspaceSwitcher").setAttribute("aria-expanded", String(state.workspaceMenuOpen));
  const menu = $("workspaceMenu");
  if (!state.workspaceMenuOpen) {
    menu.hidden = true;
    menu.innerHTML = "";
  } else {
    menu.hidden = false;
    menu.innerHTML = workspaceMenuMarkup(active?.id || "");
  }
  refreshIcons();
}

function workspaceMenuMarkup(activeId) {
  const rows = state.config.workspaces.map((workspace) => {
    const active = workspace.id === activeId;
    return `
      <button type="button" class="workspace-menu-row" role="option" aria-selected="${active}" data-workspace-id="${escapeHTML(workspace.id)}">
        <span class="workspace-avatar">${workspaceIconMarkup(workspace)}</span>
        <span class="workspace-menu-main">
          <strong>${escapeHTML(workspace.name || workspace.id)}</strong>
          <small>${escapeHTML(workspace.path || "")}</small>
        </span>
        ${active ? icon("check", "workspace-menu-check") : ""}
      </button>
    `;
  }).join("");
  return `
    <div class="workspace-menu-title">Switch Workspace</div>
    ${rows}
    <div class="workspace-menu-footer">
      <button type="button" id="workspaceMenuAdd">${icon("plus")}<span>Add workspace...</span></button>
    </div>
  `;
}

async function switchWorkspace(id) {
  if (!workspaceExists(id)) return;
  state.workspaceMenuOpen = false;
  if (id === state.activeWorkspaceId) {
    renderWorkspaceSelect();
    return;
  }
  setMobileSidebar(false);
  flushAgentDraft();
  state.navigationVersion++;
  state.autoRefreshVersion++;
  state.treeRequestVersion++;
  state.detailRequestVersion++;
  state.workspaceAgentsRequestVersion++;
  state.previewRequestVersion++;
  state.diffRequestVersion++;
  const navigationVersion = state.navigationVersion;
  // Record the page open in the workspace being left so it can be restored later.
  await saveUIState().catch((err) => console.warn("failed to save UI state", err));
  state.activeWorkspaceId = id;
  state.selectedId = "workspace";
  state.details = {};
  state.resourceLogPages = {};
  initializeNotificationState(id);
  state.sessionMenu = null;
  resetWorkspaceAgentsDraft();
  state.workspaceAgentsSaving = false;
  closeCreateDialog();
  if (state.selfDrivingDialog.open && !state.selfDrivingDialog.submitting) closeSelfDrivingConfigDialog();
  resetAgentState();
  renderWorkspaceSelect();
  if (!await loadUIState(id, navigationVersion)) return;
  state.selectedId = state.lastResourceId || "workspace";
  await loadTree();
}

function renderTree() {
  hideTaskStatusTooltip();
  const tree = $("projectTree");
  tree.innerHTML = "";
  if (!state.tree) {
    tree.innerHTML = `<div class="empty-state">${icon("folder-search", "empty-state-icon")}<strong>No workspace yet</strong><span>Add a workspace path to begin.</span></div>`;
    state.taskOperationalStateKey = "";
    return;
  }
  for (const project of applyCustomOrder(state.tree.projects, state.projectOrder)) {
    tree.appendChild(treeButton(project, "project"));
    if (isProjectExpanded(project.id)) {
      const group = document.createElement("div");
      group.className = "task-group";
      for (const task of applyCustomOrder(project.children || [], state.taskOrder[project.id])) {
        group.appendChild(treeButton(task, "task", project.id));
      }
      tree.appendChild(group);
    }
  }
  state.taskOperationalStateKey = taskOperationalStateKey();
}

function resourceRefBadge(id) {
  if (!id) return "";
  const segment = id.includes(".") ? id.slice(id.lastIndexOf(".") + 1) : id;
  const match = segment.match(/^(?:project|task)(\d+)$/);
  const ref = match ? `#${match[1]}` : `#${segment}`;
  return `<span class="resource-ref">${escapeHTML(ref)}</span>`;
}

function projectTaskSummary(project) {
  const tasks = (Array.isArray(project?.children) ? project.children : [])
    .filter((task) => task && task.archived !== true);
  const runningTaskIds = new Set();
  for (const task of tasks) {
    if (taskAgentSessions(task.id).some(taskSessionCountsAsRunning)) {
      runningTaskIds.add(task.id);
    }
  }
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
    ariaLabel: `Open tasks: ${taskLabel}; ${runningLabel}`,
  };
}

function taskSessionCountsAsRunning(session) {
  return session?.source === "internal" && TASK_RUNNING_SESSION_STATES.has(session.agentRunStatus);
}

function projectTaskSummaryMarkup(summary) {
  if (!summary) return "";
  return `
    <span class="project-task-summary" aria-hidden="true">
      <span class="project-task-summary-count">${escapeHTML(summary.taskLabel)}</span>
      <span class="project-task-summary-separator" aria-hidden="true">·</span>
      <span class="project-task-summary-running">${escapeHTML(summary.runningLabel)}</span>
    </span>`;
}

function treeButton(item, kind, projectId = "") {
  const button = document.createElement("button");
  const taskState = taskOperationalState(item);
  const taskStatusMarkup = operationalStatusMarkup(taskState.statusPresentation);
  button.className = `tree-item ${kind === "task" ? "task-item" : ""} ${taskState.statusPresentation.layoutClassName} ${taskState.statusPresentation.className} ${state.selectedId === item.id ? "active" : ""}`;
  const children = item.children || [];
  const expanded = kind === "project" && isProjectExpanded(item.id);
  const title = item.title || item.id;
  const summary = kind === "project" ? projectTaskSummary(item) : null;
  const summaryMarkup = summary && !expanded ? projectTaskSummaryMarkup(summary) : "";
  const accessibleLabel = [title, summary?.ariaLabel, taskState.label].filter(Boolean).join(". ");
  if (kind === "project" || taskState.label) {
    button.setAttribute("aria-label", accessibleLabel);
  }
  if (taskState.label) {
    bindTaskStatusTooltip(button, taskState.label);
  }
  button.innerHTML = `
    <span class="chevron" ${kind === "project" && children.length ? `data-project-toggle="${escapeHTML(item.id)}"` : ""}>${kind === "project" && children.length ? icon(expanded ? "chevron-down" : "chevron-right") : ""}</span>
    ${taskStatusMarkup}
    ${icon(kind === "project" ? "folder" : "file-text", "tree-icon")}
    <span class="name"><span class="name-text">${escapeHTML(title)}</span>${resourceRefBadge(item.id)}${summaryMarkup}</span>
    <span class="drag-handle" draggable="true" title="Drag to reorder">${icon("grip-vertical", "drag-handle-icon")}</span>
  `;
  button.onclick = (event) => {
    if (event.target.closest("[data-project-toggle]")) {
      toggleProject(item.id).catch((err) => toast(err.message));
      return;
    }
    selectResource(item.id).catch((err) => toast(err.message));
  };
  bindListDrag(button, { kind, id: item.id, projectId });
  return button;
}

function bindListDrag(row, target) {
  const handle = row.querySelector(".drag-handle");
  if (!handle) return;
  handle.addEventListener("click", (event) => {
    event.stopPropagation();
    event.preventDefault();
  });
  handle.addEventListener("dragstart", (event) => {
    event.stopPropagation();
    state.listDrag = target;
    row.classList.add("drag-source");
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", target.id);
    }
  });
  handle.addEventListener("dragend", () => {
    state.listDrag = null;
    clearListDragIndicators();
  });
  row.addEventListener("dragover", (event) => {
    if (!canDropListDrag(target)) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
    showListDropIndicator(row, event);
  });
  row.addEventListener("dragleave", () => {
    row.classList.remove("drop-before", "drop-after");
  });
  row.addEventListener("drop", (event) => {
    event.preventDefault();
    if (!canDropListDrag(target)) return;
    const drag = state.listDrag;
    const after = listDropAfter(row, event);
    state.listDrag = null;
    clearListDragIndicators();
    commitListDrag(drag, target, after);
  });
}

function canDropListDrag(target) {
  const drag = state.listDrag;
  if (!drag || drag.id === target.id || drag.kind !== target.kind) return false;
  if (target.kind === "task" && drag.projectId !== target.projectId) return false;
  return true;
}

function listDropAfter(row, event) {
  const rect = row.getBoundingClientRect();
  return event.clientY > rect.top + rect.height / 2;
}

function showListDropIndicator(row, event) {
  const after = listDropAfter(row, event);
  row.classList.toggle("drop-before", !after);
  row.classList.toggle("drop-after", after);
}

function clearListDragIndicators() {
  document.querySelectorAll(".drag-source, .drop-before, .drop-after").forEach((el) => {
    el.classList.remove("drag-source", "drop-before", "drop-after");
  });
}

function commitListDrag(drag, target, after) {
  if (drag.kind === "session") {
    const sessions = applyCustomOrder(sortedSessionsForDisplay(state.tree?.sessions || []), state.sessionOrder);
    state.sessionOrder = moveIdInList(sessions.map((session) => session.id), drag.id, target.id, after);
    renderSessions();
    refreshIcons();
  } else if (drag.kind === "task") {
    const project = findResource(drag.projectId);
    if (!project) return;
    const tasks = applyCustomOrder(project.children || [], state.taskOrder[drag.projectId]);
    state.taskOrder = {
      ...state.taskOrder,
      [drag.projectId]: moveIdInList(tasks.map((task) => task.id), drag.id, target.id, after),
    };
    renderTree();
    refreshIcons();
  } else if (drag.kind === "project") {
    const projects = applyCustomOrder(state.tree?.projects || [], state.projectOrder);
    state.projectOrder = moveIdInList(projects.map((project) => project.id), drag.id, target.id, after);
    renderTree();
    refreshIcons();
  } else {
    return;
  }
  saveUIState().catch((err) => toast(err.message));
}

function noTaskOperationalState() {
  return {
    selfDriving: null,
    session: null,
    className: "",
    label: "",
    lock: null,
    statusPresentation: operationalStatusPresentation([], null),
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
    label: taskOperationalLabel(item.selfDriving, sessions, lock, { selfDriving, session }),
  };
}

// operationalStatusPresentation is shared by the tree and Session list. The
// status objects themselves come from the existing Self-Driving and Session
// presentation helpers, so both views keep the same icon, tone, animation,
// ordering, and single/dual layout semantics.
function operationalStatusPresentation(statuses, lock = null) {
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
      visibleStatuses.length > 1 ? "task-status-dual" : "",
    ].filter(Boolean).join(" "),
  };
}

function operationalStatusMarkup(presentation, options = {}) {
  if (!presentation?.hasTaskState) return "";
  const slotClassName = options.slotClassName ? ` ${options.slotClassName}` : "";
  return `
    <span class="task-status-slot ${presentation.slotClassName}${slotClassName}" aria-hidden="true">
      ${presentation.statuses.map((status) => `<span class="task-status-indicator ${status.className} ${status.recentOutput ? "task-status-fresh" : ""}">${icon(status.iconName, "task-status-icon")}</span>`).join("")}
      ${presentation.lock ? `<span class="task-lock-indicator ${presentation.lock.className}">${icon("lock", "task-lock-icon")}</span>` : ""}
    </span>`;
}

function deriveTaskSelfDrivingState(selfDriving) {
  if (!selfDriving) return null;
  if (!selfDriving.enabled) return null;
  const selfDrivingState = selfDriving?.condition || "ready";
  if (selfDrivingState === "error") {
    return taskStatusState("error", "task-status-danger", "triangle-alert", "Self-Driving error", "self-driving");
  }
  if (selfDrivingState === "blocked" || selfDrivingState === "needs_configuration") {
    return taskStatusState(selfDrivingState, "task-status-attention", "square", `Self-Driving ${selfDrivingState.replace(/_/g, " ")}`, "self-driving");
  }
  if (selfDrivingState === "waiting") {
    return taskStatusState("waiting", "task-status-attention", "pause", "Self-Driving waiting", "self-driving");
  }
  if (selfDrivingState === "ready") {
    return taskStatusState("ready", "task-status-queued", "clock", "Self-Driving ready", "self-driving");
  }
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
    case "starting":
      return taskStatusState("session-starting", "task-status-session-running", "loader-circle", "Session starting", "session", session);
    case "running":
      return taskStatusState("session-running", "task-status-session-running", "loader-circle", "Session running", "session", session);
    case "waiting_approval":
      return taskStatusState("session-approval", "task-status-attention", "shield-question", "Session waiting for approval", "session", session);
    case "stopping":
      return taskStatusState("session-stopping", "task-status-session-stopping", "loader-circle", "Session stopping", "session", session);
    case "recovering":
      return taskStatusState("session-recovering", "task-status-attention", "rotate-ccw", "Session recovering", "session", session);
    case "idle":
      return taskStatusState("session-idle", "task-status-info", "message-square", "Session waiting for input", "session", session);
    default:
      return taskStatusState("session-active", "task-status-neutral", "circle-dot", status ? `Session ${status}` : "Session active", "session", session);
  }
}

function taskStatusState(kind, className, iconName, label, dimension, session = null) {
  return {
    kind,
    className,
    iconName,
    label,
    dimension,
    recentOutput: Boolean(session && hasRecentAgentOutput(session)),
  };
}

function taskAgentSessions(resourceId) {
  if (!resourceId) return [];
  return (state.tree?.sessions || []).filter((session) =>
    session.resourceId === resourceId ||
    sessionControls(session).some((control) => control.resourceId === resourceId),
  );
}

function resourceLocks(resourceId) {
  if (!resourceId) return [];
  return (state.tree?.sessions || []).filter((session) => sessionControls(session).some((control) => control.resourceId === resourceId));
}

function selectedLockableResource() {
  const selected = findResource(state.selectedId);
  if (!selected || (selected.type !== "project" && selected.type !== "task")) return null;
  const detail = state.details?.[selected.id];
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
  if (selectedResourceHasNewSessionLock()) state.agent.agentChooserOpen = false;
}

function externalResourceLockNotice() {
  return `<div class="tty-external-lock-notice" role="alert">${icon("lock")}<span>${escapeHTML(EXTERNAL_RESOURCE_LOCK_MESSAGE)}</span></div>`;
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
    label: count > 1 ? `Locked by ${count} sessions including ${ownerLabel}` : `Locked by ${ownerLabel}`,
  };
}

function taskLockOwnerLabel(session) {
  if (session.source === "external") return "an external session";
  const agent = (state.config?.agents || []).find((item) => item.id === session.agentRunAgentName);
  return `${agent?.name || session.agentRunAgentName || "Forge GUI"} session`;
}

function taskOperationalLabel(selfDriving, sessions, lock, statuses) {
  const parts = [];
  if (selfDriving) {
    parts.push(`Self-Driving ${selfDriving.enabled ? "on" : "off"}, ${selfDriving.condition}, revision ${selfDriving.revision}`);
  }
  if (sessions.length === 1) {
    parts.push(taskAgentSessionLabel(sessions[0]));
  } else if (sessions.length > 1) {
    const sessionStatuses = [...new Set(sessions.map((session) => session.agentRunStatus || "open"))].join(", ");
    parts.push(`${sessions.length} agent sessions: ${sessionStatuses}`);
  }
  if (lock) parts.push(lock.label);
  return parts.join(" · ");
}

function taskAgentSessionLabel(session) {
  const role = session.schedulerTurn ? "Self-Driving session" : "Agent session";
  const status = session.agentRunStatus || "open";
  return `${role} ${status.replace("waiting_approval", "waiting for approval")}`;
}

function taskOperationalStateKey() {
  if (!state.tree) return "";
  const parts = [];
  for (const project of state.tree.projects || []) {
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
  if (Number.isFinite(outputAt)) {
    return Date.now() - outputAt <= TASK_OUTPUT_FRESH_WINDOW_MS;
  }
  if (!["running", "starting"].includes(session.agentRunStatus)) return false;
  const updatedAt = new Date(session.agentRunUpdatedAt || "").getTime();
  return Number.isFinite(updatedAt) && Date.now() - updatedAt <= TASK_OUTPUT_FRESH_WINDOW_MS;
}

function bindTaskStatusTooltip(button, label) {
  const tooltip = taskStatusTooltip();
  button.setAttribute("aria-describedby", tooltip.id);
  button.addEventListener("mouseenter", () => showTaskStatusTooltip(button, label));
  button.addEventListener("mouseleave", hideTaskStatusTooltip);
  button.addEventListener("focus", () => showTaskStatusTooltip(button, label));
  button.addEventListener("blur", hideTaskStatusTooltip);
}

function taskStatusTooltip() {
  let tooltip = $("taskStatusTooltip");
  if (tooltip) return tooltip;
  tooltip = document.createElement("div");
  tooltip.id = "taskStatusTooltip";
  tooltip.className = "task-status-tooltip";
  tooltip.setAttribute("role", "tooltip");
  tooltip.hidden = true;
  document.body.appendChild(tooltip);
  return tooltip;
}

function showTaskStatusTooltip(button, label) {
  const tooltip = taskStatusTooltip();
  tooltip.textContent = label;
  tooltip.hidden = false;
  const rect = button.getBoundingClientRect();
  const left = Math.min(rect.right + 8, window.innerWidth - tooltip.offsetWidth - 8);
  const top = Math.max(8, Math.min(rect.top + (rect.height - tooltip.offsetHeight) / 2, window.innerHeight - tooltip.offsetHeight - 8));
  tooltip.style.left = `${Math.max(8, left)}px`;
  tooltip.style.top = `${top}px`;
}

function hideTaskStatusTooltip() {
  const tooltip = $("taskStatusTooltip");
  if (tooltip) tooltip.hidden = true;
}

async function selectResource(id, options = {}) {
  const selectionChanged = state.selectedId !== id;
  if (options.clearUnread !== false) clearUnreadForResource(id);
  const forceDetail = selectionChanged || Boolean(options.forceDetail);
  if (forceDetail) {
    state.navigationVersion++;
    state.autoRefreshVersion++;
    state.treeRequestVersion++;
    state.detailRequestVersion++;
    state.workspaceAgentsRequestVersion++;
    state.previewRequestVersion++;
    state.diffRequestVersion++;
    if (id !== "workspace") {
      resetResourceLogState(id);
      delete state.details[id];
    }
  }
  if (selectionChanged) {
    if (state.selfDrivingDialog.open && !state.selfDrivingDialog.submitting) closeSelfDrivingConfigDialog();
    state.workspaceAgentsSaving = false;
    flushAgentDraft();
    discardAgentUploadDialog();
    state.preview = null;
    state.diff = null;
    closeAgentStream();
    state.agent.runs = [];
    state.agent.activeRunId = "";
    state.agent.events = [];
    state.agent.notices = [];
    state.agent.historyBeforeId = 0;
    clearAgentDraftMemory();
  }
  state.selectedId = id;
  state.sessionMenu = null;
  setMobileSidebar(false);
  ensureSelectedProjectExpanded(false);
  syncURL();
  saveUIState().catch((err) => console.warn("failed to save UI state", err));
  renderSelectionPanels();
  await Promise.all([
    id === "workspace" ? loadWorkspaceAgents({ force: Boolean(options.forceDetail) }) : loadDetail(id, { force: forceDetail }),
    selectionChanged ? loadAgentRuns() : Promise.resolve(),
  ]);
  if (!isCurrentWorkspaceView(state.activeWorkspaceId, state.navigationVersion)) return;
  renderSelectionPanels();
}

async function toggleProject(id) {
  if (state.expandedProjects.has(id)) {
    state.expandedProjects.delete(id);
  } else {
    state.expandedProjects.add(id);
  }
  renderAll();
  await saveUIState();
}

function applyCustomOrder(items, orderedIds) {
  if (!Array.isArray(items)) return [];
  if (!Array.isArray(orderedIds) || orderedIds.length === 0) return items;
  const rank = new Map();
  orderedIds.forEach((id, index) => {
    if (!rank.has(id)) rank.set(id, index);
  });
  return items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const left = rank.has(a.item.id) ? rank.get(a.item.id) : rank.size + a.index;
      const right = rank.has(b.item.id) ? rank.get(b.item.id) : rank.size + b.index;
      if (left !== right) return left - right;
      return a.index - b.index;
    })
    .map((entry) => entry.item);
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
  return sessions
    .map((session, index) => ({ session, index }))
    .sort((a, b) => {
      const left = Date.parse(a.session.startedAt || "");
      const right = Date.parse(b.session.startedAt || "");
      const leftOK = Number.isFinite(left);
      const rightOK = Number.isFinite(right);
      if (leftOK && rightOK && left !== right) return left - right;
      if (leftOK !== rightOK) return leftOK ? -1 : 1;
      if (a.session.id !== b.session.id) return a.session.id < b.session.id ? -1 : 1;
      return a.index - b.index;
    })
    .map((entry) => entry.session);
}

function renderSessions() {
  const list = $("sessionList");
  list.innerHTML = "";
  const sessions = applyCustomOrder(sortedSessionsForDisplay(state.tree?.sessions || []), state.sessionOrder);
  if (sessions.length === 0) {
    list.innerHTML = `<div class="session-row muted-row">${icon("message-square")}<div><strong>No active sessions</strong><span>Start one from a task directory.</span></div></div>`;
    return;
  }
  for (const session of sessions) {
    const navigation = sessionNavigationTarget(session);
    const controls = navigation.controls;
    const resourceId = navigation.displayResourceId;
    const isInternal = session.source === "internal";
    const status = isInternal
      ? sessionStatusPresentation(session)
      : taskStatusState("session-external", "session-status-external", "message-square", "External session active", "session");
    const taskResource = sessionTaskResource(session);
    const taskState = taskResource ? taskOperationalState(taskResource) : noTaskOperationalState();
    const statusPresentation = operationalStatusPresentation(
      isInternal && taskState.selfDriving ? [taskState.selfDriving, status] : [status],
    );
    const statusLabel = sessionOperationalLabel(session, taskResource, taskState, status);
    const clickable = Boolean(navigation.navigationResourceId || navigation.menu);
    const selectedId = state.selectedId;
    const isCurrent = Boolean(selectedId) && selectedId !== "workspace" &&
      navigation.selectedResourceIds.includes(selectedId);
    const unread = hasUnreadNotificationForSession(session.id);
    const row = document.createElement(clickable ? "button" : "div");
    row.className = `session-row ${isInternal ? "internal-session" : "external-session"} ${statusPresentation.layoutClassName} ${statusPresentation.className} ${clickable ? "clickable-session" : ""} ${isCurrent ? "current-session" : ""} ${unread ? "session-unread" : ""}`;
    if (clickable) row.type = "button";
    const agent = isInternal
      ? (state.config?.agents || []).find((item) => item.id === session.agentRunAgentName)
      : null;
    const providerLabel = isInternal ? "AgentHub" : "External";
    const label = isInternal ? agent?.name || session.agentRunAgentName || "AgentHub" : "External";
    const title = sessionDisplayTitle(session, navigation);
    const metaParts = [providerLabel];
    if (controls.length > 1) {
      metaParts.push(`${controls.length} locks`);
    } else if (resourceId) {
      metaParts.push(resourceId);
    }
    if (session.updatedAt) metaParts.push(relativeTime(session.updatedAt));
    const accessibleStatusLabel = unread ? `${statusLabel}. Unread turn completion.` : statusLabel;
    row.title = accessibleStatusLabel;
    bindTaskStatusTooltip(row, accessibleStatusLabel);
    row.setAttribute("aria-label", `${title}. ${accessibleStatusLabel}. ${providerLabel}`);
    row.innerHTML = `
      ${operationalStatusMarkup(statusPresentation, { slotClassName: "session-status-icon" })}
      <div class="session-title">
        <strong>${escapeHTML(title)}</strong>
        <span>${escapeHTML(metaParts.join(" · "))}</span>
      </div>
      <span class="session-badge ${isInternal ? "internal" : "external"}">${escapeHTML(label)}</span>
      ${unread ? `<span class="session-unread-badge" aria-label="Unread turn completion">New</span>` : ""}
      <span class="drag-handle" draggable="true" title="Drag to reorder">${icon("grip-vertical", "drag-handle-icon")}</span>
    `;
    if (clickable) {
      row.addEventListener("click", () => handleSessionClick(session));
    }
    bindListDrag(row, { kind: "session", id: session.id, projectId: "" });
    list.appendChild(row);
    if (state.sessionMenu?.sessionId === session.id && navigation.menu) {
      list.appendChild(sessionResourceMenu(session, controls));
    }
  }
}

function sessionDisplayTitle(session, resourceId) {
  const navigation = resourceId && typeof resourceId === "object"
    ? resourceId
    : arguments.length > 1
      ? { displayResourceId: resourceId || "" }
      : sessionNavigationTarget(session);
  const displayResourceId = navigation.displayResourceId || "";
  const resourceTitle = findResource(displayResourceId)?.title || "";
  if (session.source === "internal") {
    return session.agentRunTitle || resourceTitle || displayResourceId || session.id;
  }
  return resourceTitle || displayResourceId || session.id;
}

function sessionControls(session) {
  const controls = (session?.controls || [])
    .map((control) => ({
      resourceId: String(control?.resourceId || "").trim(),
      path: String(control?.path || ""),
    }))
    .filter((control) => control.resourceId);
  if (controls.length === 0) {
    const resourceId = String(session?.resourceId || "").trim();
    if (resourceId) return [{ resourceId, path: "" }];
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
  if (session?.source === "internal" && runResourceId) {
    return {
      kind: "run",
      primaryResourceId: runResourceId,
      displayResourceId: runResourceId,
      navigationResourceId: sessionNavigableResourceId(runResourceId),
      selectedResourceIds: [runResourceId],
      controls,
      menu: false,
    };
  }
  if (controls.length === 1) {
    const resourceId = controls[0].resourceId;
    return {
      kind: "single-control",
      primaryResourceId: resourceId,
      displayResourceId: resourceId,
      navigationResourceId: sessionNavigableResourceId(resourceId),
      selectedResourceIds: [resourceId],
      controls,
      menu: false,
    };
  }
  return {
    kind: controls.length > 1 ? "controls" : "none",
    primaryResourceId: "",
    displayResourceId: controls[0]?.resourceId || "",
    navigationResourceId: "",
    selectedResourceIds: controls.map((control) => control.resourceId),
    controls,
    menu: controls.length > 1,
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
  const parts = [];
  if (taskResource?.selfDriving && taskState?.selfDriving) {
    const rawState = taskResource.selfDriving.condition || "unknown";
    const stateLabel = `Self-Driving ${rawState}`;
    const revision = Number.isFinite(taskResource.selfDriving.revision) ? taskResource.selfDriving.revision : "unknown";
    parts.push(`${stateLabel}, revision ${revision}`);
  }
  if (sessionStatus) parts.push(sessionStatus.label);
  if (parts.length > 0) return parts.join(" · ");
  return session?.source === "external" ? "External session active" : "Session active";
}

function handleSessionClick(session) {
  const navigation = sessionNavigationTarget(session);
  if (navigation.navigationResourceId) {
    state.sessionMenu = null;
    clearUnreadForResource(navigation.navigationResourceId);
    selectResource(navigation.navigationResourceId).catch((err) => toast(err.message));
    return;
  }
  if (!navigation.menu) return;
  state.sessionMenu = state.sessionMenu?.sessionId === session.id ? null : { sessionId: session.id };
  renderSessions();
  refreshIcons();
}

function sessionResourceMenu(session, controls) {
  const menu = document.createElement("div");
  menu.className = "session-resource-menu";
  menu.dataset.sessionMenu = session.id;
  menu.innerHTML = controls.map((control) => `
    <button type="button" data-session-resource="${escapeHTML(control.resourceId)}">
      ${icon("corner-down-right")}
      <span>
        <strong>${escapeHTML(control.resourceId)}</strong>
        <small>${escapeHTML(control.path || "")}</small>
      </span>
    </button>
  `).join("");
  menu.querySelectorAll("[data-session-resource]").forEach((button) => {
    button.addEventListener("click", () => {
      const resourceId = sessionNavigableResourceId(button.dataset.sessionResource);
      if (!resourceId) return;
      state.sessionMenu = null;
      clearUnreadForResource(resourceId);
      selectResource(resourceId).catch((err) => toast(err.message));
    });
  });
  return menu;
}

// Replaces the details shell while keeping its scroll position stable. The
// shell changes only when the selected resource/view changes; its child
// regions are updated independently so an unchanged Markdown region keeps
// the same DOM nodes, selection, scroll offset, and open details elements.
function setDetailsHTML(panel, html) {
  const resourceKey = state.selectedId || "";
  const sameResource = panel.dataset.detailsResource === resourceKey;
  const scrollTop = panel.scrollTop;
  panel.innerHTML = html;
  panel.dataset.detailsResource = resourceKey;
  panel.dataset.detailsShellKey = "";
  panel.scrollTop = sameResource ? scrollTop : 0;
}

// Resource details are grouped into tabs; each tab simply shows/hides the
// regions it owns. Document tabs additionally own individual files inside
// the shared documents region. Rendering logic and data flow stay unchanged.
const DETAILS_RESOURCE_TABS = [
  { id: "project", label: "Project", regions: ["documents"], files: ["project.md"] },
  { id: "task", label: "Task", regions: ["documents"], files: ["task.md"] },
  { id: "work", label: "Work", regions: ["documents"], files: ["work.md"] },
  { id: "template", label: "Template", regions: ["templates"] },
  { id: "logs", label: "Logs", regions: ["logs"] },
  { id: "artifacts", label: "Artifacts", regions: ["artifacts"] },
  { id: "worktrees", label: "Worktrees", regions: ["worktrees"] },
];

// Tabs are only offered when they have content: document tabs require the
// matching file, the Template tab requires template content, and projects
// never get a Worktrees tab. Unknown document files fall back to the first
// available document tab.
function detailsResourceTabs(resourceType, detail) {
  const fileNames = new Set(visibleResourceFiles(detail || {}).map((file) => String(file.name || "")));
  const hasTemplate = resourceType === "project" || Boolean(detail?.template);
  const has = (tab) => {
    if (tab.id === "worktrees") return resourceType !== "project";
    if (tab.id === "template") return hasTemplate;
    if (tab.files) return tab.files.some((name) => fileNames.has(name));
    return true;
  };
  const tabs = DETAILS_RESOURCE_TABS.filter(has);
  return tabs;
}

// Remembers the last selected tab per resource (in-memory only).
const detailsTabMemory = new Map();

function detailsPanelShell(kind, resourceType, detail) {
  const regions = kind === "workspace"
    ? ["header", "workspace-agents", "wiki", "file-modal", "diff-modal"]
    : ["header", "documents", "logs", "templates", "artifacts", "worktrees", "file-modal", "diff-modal"];
  const tabs = kind === "resource" ? `
    <div class="details-tabs" role="tablist" data-details-tabs>
      ${detailsResourceTabs(resourceType, detail).map((tab) => `
        <button type="button" class="details-tab" role="tab" data-details-tab="${tab.id}" aria-selected="false">
          <span>${tab.label}</span>${tab.id === "logs" ? `<span class="details-tab-count" data-details-tab-count="logs" hidden></span>` : ""}
        </button>`).join("")}
    </div>` : "";
  return regions.map((name) => {
    const div = `<div data-detail-region="${name}"></div>`;
    // The tab bar sits directly under the header region.
    return name === "header" ? div + tabs : div;
  }).join("");
}

function applyDetailsTab(panel, resourceKey) {
  const tabBar = panel.querySelector("[data-details-tabs]");
  if (!tabBar) return;
  const available = DETAILS_RESOURCE_TABS.filter((tab) => tabBar.querySelector(`[data-details-tab="${tab.id}"]`));
  if (!available.length) return;
  const saved = detailsTabMemory.get(resourceKey);
  const active = available.find((tab) => tab.id === saved) || available[0];
  const visible = new Set(active.regions);
  tabBar.querySelectorAll("[data-details-tab]").forEach((button) => {
    const on = button.dataset.detailsTab === active.id;
    button.classList.toggle("active", on);
    button.setAttribute("aria-selected", on ? "true" : "false");
  });
  for (const tab of DETAILS_RESOURCE_TABS) {
    for (const name of tab.regions) {
      const region = panel.querySelector(`[data-detail-region="${name}"]`);
      if (region) region.hidden = !visible.has(name);
    }
  }
  // Document tabs share the documents region; only the files the active tab
  // owns stay visible. Files no available tab claims go to the first
  // document tab.
  const documentsRegion = panel.querySelector('[data-detail-region="documents"]');
  if (documentsRegion && !documentsRegion.hidden) {
    const docTabs = available.filter((tab) => tab.files);
    const claimed = new Set(docTabs.flatMap((tab) => tab.files));
    const firstDocTab = docTabs[0];
    documentsRegion.querySelectorAll("[data-doc-file]").forEach((section) => {
      const name = String(section.dataset.docFile || "");
      const owner = claimed.has(name) ? docTabs.find((tab) => tab.files.includes(name)) : firstDocTab;
      section.hidden = owner !== active;
    });
  }
}

function bindDetailsTabs(panel, resourceKey) {
  const tabBar = panel.querySelector("[data-details-tabs]");
  if (!tabBar || tabBar.dataset.eventsBound === "true") return;
  tabBar.dataset.eventsBound = "true";
  tabBar.addEventListener("click", (event) => {
    const button = event.target.closest("[data-details-tab]");
    if (!button) return;
    detailsTabMemory.set(resourceKey, button.dataset.detailsTab);
    applyDetailsTab(panel, resourceKey);
  });
}

function updateDetailsTabCounts(panel, detail) {
  const badge = panel.querySelector('[data-details-tab-count="logs"]');
  if (!badge) return;
  const count = (detail?.logs || []).length;
  badge.hidden = count === 0;
  badge.textContent = String(count);
}

function ensureDetailsShell(panel, key, kind, resourceType, detail) {
  if (panel.dataset.detailsShellKey === key) return false;
  setDetailsHTML(panel, detailsPanelShell(kind, resourceType, detail));
  panel.dataset.detailsShellKey = key;
  return true;
}

function updateDetailRegion(panel, name, key, html) {
  const region = panel.querySelector(`[data-detail-region="${name}"]`);
  if (!region) return false;
  const normalizedKey = String(key ?? "");
  if (region.dataset.renderKey === normalizedKey) return false;
  const logState = name === "logs" ? captureLogRegionState(panel, region) : null;
  region.innerHTML = (typeof html === "function" ? html() : html) || "";
  region.dataset.renderKey = normalizedKey;
  if (logState) restoreLogRegionState(panel, region, logState);
  return true;
}

function captureLogRegionState(panel, region) {
  const openIds = [...region.querySelectorAll("details[data-log-id][open]")]
    .map((entry) => String(entry.dataset.logId || ""))
    .filter(Boolean);
  const snapshot = {
    openIds,
    scrollTop: Number(panel?.scrollTop) || 0,
    anchorId: "",
    anchorTop: 0,
  };
  if (!panel || typeof panel.getBoundingClientRect !== "function") return snapshot;
  const panelRect = panel.getBoundingClientRect();
  for (const entry of region.querySelectorAll("details[data-log-id]")) {
    const rect = entry.getBoundingClientRect();
    if (rect.bottom > panelRect.top) {
      snapshot.anchorId = String(entry.dataset.logId || "");
      snapshot.anchorTop = rect.top;
      break;
    }
  }
  return snapshot;
}

function restoreLogRegionState(panel, region, snapshot) {
  const openIds = new Set(snapshot.openIds || []);
  for (const entry of region.querySelectorAll("details[data-log-id]")) {
    if (openIds.has(String(entry.dataset.logId || ""))) entry.open = true;
  }
  if (!panel || snapshot.scrollTop <= 0 || !snapshot.anchorId || typeof panel.getBoundingClientRect !== "function") return;
  const anchor = [...region.querySelectorAll("details[data-log-id]")]
    .find((entry) => String(entry.dataset.logId || "") === snapshot.anchorId);
  if (!anchor) return;
  const delta = anchor.getBoundingClientRect().top - snapshot.anchorTop;
  if (Number.isFinite(delta)) panel.scrollTop = snapshot.scrollTop + delta;
}

function markdownRendererKey() {
  return typeof window !== "undefined" && window.marked && window.DOMPurify ? "sanitized-markdown-v1" : "fallback-markdown-v1";
}

function resourceDocumentsRenderKey(item) {
  const files = visibleResourceFiles(item).map((file) => {
    const content = String(file.content ?? "");
    const contentHash = String(file.contentHash || "");
    const name = String(file.name || "");
    return {
      name,
      path: String(file.path || resourceFilePath(item.path, name)),
      contentHash,
      contentFallback: contentHash ? "" : content,
      mode: isMarkdownFile(name) ? "markdown-preview" : "plain-text",
    };
  });
  return JSON.stringify({
    workspaceId: state.activeWorkspaceId,
    resourceId: item.id,
    resourceType: item.type,
    renderer: markdownRendererKey(),
    files,
  });
}

function artifactRenderKey(section, entries, extra = {}) {
  const prefix = `${section}:`;
  return JSON.stringify({
    section,
    entries: entries || [],
    expanded: [...state.expandedPaths].filter((key) => key.startsWith(prefix)).sort(),
    ...extra,
  });
}

function detailLogsRenderKey(item) {
  const page = state.resourceLogPages?.[item.id] || {};
  return JSON.stringify({
    logs: item.logs || [],
    hasMore: Boolean(page.hasMore ?? item.logPage?.hasMore),
    nextCursor: String(page.nextCursor ?? item.logPage?.nextCursor ?? ""),
    loading: Boolean(page.loading),
    error: String(page.error || ""),
  });
}

function workspaceAgentsRenderKey(agents) {
  const content = String(agents?.content || "");
  return JSON.stringify({
    workspaceId: state.activeWorkspaceId,
    loaded: Boolean(agents),
    path: agents?.path || "AGENTS.md",
    contentHash: state.workspaceAgentsDirty ? "dirty" : agents?.contentHash || "",
    content: state.workspaceAgentsDirty ? state.workspaceAgentsDraft : workspaceAgentsUserContent(content),
    mode: state.workspaceAgentsDirty ? "edit-draft" : "edit-clean",
    error: state.workspaceAgentsDirty ? "" : agents?.error || "",
  });
}

function syncWorkspaceAgentsRenderKey() {
  const region = document.querySelector('[data-detail-region="workspace-agents"]');
  if (region) region.dataset.renderKey = workspaceAgentsRenderKey(state.workspaceAgents);
}

function fileModalRenderKey(preview) {
  if (!preview) return "closed";
  const content = String(preview.content || "");
  return JSON.stringify({
    section: preview.section || "",
    path: preview.path || "",
    name: preview.name || "",
    contentHash: preview.contentHash || "",
    contentFallback: preview.contentHash ? "" : content,
    loading: Boolean(preview.loading),
    error: preview.error || "",
    binary: Boolean(preview.binary),
    image: Boolean(preview.image),
    truncated: Boolean(preview.truncated),
    mode: isMarkdownFile(preview.path || preview.name) ? "markdown-preview" : "plain-preview",
    renderer: markdownRendererKey(),
  });
}

function diffModalRenderKey(diff) {
  if (!diff) return "closed";
  return JSON.stringify({
    path: diff.path || "",
    branch: diff.branch || "",
    base: diff.base || "",
    diff: diff.diff || "",
    loading: Boolean(diff.loading),
    error: diff.error || "",
  });
}

function workspaceDetailsHeader() {
  return `
    <div class="details-header">
      <nav class="breadcrumb" aria-label="Location">
        <button type="button" class="breadcrumb-link current" data-breadcrumb-resource="workspace">${escapeHTML(workspaceName())}</button>
      </nav>
      <div class="title-row"><h1>${escapeHTML(workspaceName())}</h1></div>
    </div>
  `;
}

function resourceDetailsHeader(selected, detail) {
  return `
    <div class="details-header">
      ${breadcrumb(selected, detail.title)}
      <div class="title-row">
        <h1>${escapeHTML(detail.title)}${resourceRefBadge(selected.id)}</h1>
        <div class="details-actions">
          ${selected.type === "project" ? `<button id="newTaskButton">${icon("plus")}<span>New Task</span></button>` : ""}
          <button class="danger" id="archiveButton">${icon("archive")}<span>Archive</span></button>
        </div>
      </div>
    </div>
  `;
}

function loadingDetails(selected) {
  return `
    <div class="details-header">
      ${breadcrumb(selected, selected.title)}
      <div class="title-row"><h1>${escapeHTML(selected.title)}${resourceRefBadge(selected.id)}</h1></div>
    </div>
    <div class="empty-state">${icon("loader-circle", "empty-state-icon")}<strong>Loading details...</strong></div>
  `;
}

function bindDetailHeaderEvents(selected) {
  const archiveButton = $("archiveButton");
  if (archiveButton && archiveButton.dataset.detailBound !== "true") {
    archiveButton.dataset.detailBound = "true";
    archiveButton.addEventListener("click", () => archiveResource(selected.id));
  }
  const newTaskButton = $("newTaskButton");
  if (newTaskButton && newTaskButton.dataset.detailBound !== "true") {
    newTaskButton.dataset.detailBound = "true";
    newTaskButton.addEventListener("click", () => showTaskForm(selected.id));
  }
}

function updateWorkspaceAgentsSavingControls() {
  const form = $("workspaceAgentsForm");
  if (!form) return;
  const textarea = $("workspaceAgentsContent");
  const button = form.querySelector('button[type="submit"]');
  if (textarea) textarea.disabled = state.workspaceAgentsSaving;
  if (button) {
    button.disabled = state.workspaceAgentsSaving;
    const label = button.querySelector("span");
    if (label) label.textContent = state.workspaceAgentsSaving ? "Saving" : "Save";
  }
}

function renderDetails() {
  const panel = $("detailsPanel");
  const previewScrollState = captureFilePreviewScrollState();
  if (!state.tree) {
    setDetailsHTML(panel, emptyDetails());
    return;
  }
  if (state.selectedId === "workspace") {
    ensureDetailsShell(panel, `workspace:${state.activeWorkspaceId}`, "workspace");
    updateDetailRegion(panel, "header", JSON.stringify({ workspaceId: state.activeWorkspaceId, name: workspaceName() }), () => workspaceDetailsHeader());
    updateDetailRegion(panel, "workspace-agents", workspaceAgentsRenderKey(state.workspaceAgents), () => workspaceAgentsSection());
    updateDetailRegion(panel, "wiki", artifactRenderKey("Wiki", state.tree.wiki?.entries, {
      exists: Boolean(state.tree.wiki?.exists),
      error: state.tree.wiki?.error || "",
    }), () => workspaceWikiSection());
    updateWorkspaceAgentsSavingControls();
    updateDetailRegion(panel, "file-modal", fileModalRenderKey(state.preview), () => fileModal());
    updateDetailRegion(panel, "diff-modal", diffModalRenderKey(state.diff), () => diffModal());
    restoreFilePreviewScrollState(previewScrollState);
    return;
  }
  const selected = findResource(state.selectedId) || state.tree.projects[0];
  if (!selected) {
    ensureDetailsShell(panel, `workspace:${state.activeWorkspaceId}`, "workspace");
    updateDetailRegion(panel, "header", JSON.stringify({ workspaceId: state.activeWorkspaceId, name: workspaceName() }), () => workspaceDetailsHeader());
    updateDetailRegion(panel, "workspace-agents", workspaceAgentsRenderKey(state.workspaceAgents), () => workspaceAgentsSection());
    updateDetailRegion(panel, "wiki", artifactRenderKey("Wiki", state.tree.wiki?.entries, {
      exists: Boolean(state.tree.wiki?.exists),
      error: state.tree.wiki?.error || "",
    }), () => workspaceWikiSection());
    updateWorkspaceAgentsSavingControls();
    updateDetailRegion(panel, "file-modal", fileModalRenderKey(state.preview), () => fileModal());
    updateDetailRegion(panel, "diff-modal", diffModalRenderKey(state.diff), () => diffModal());
    restoreFilePreviewScrollState(previewScrollState);
    return;
  }
  const detail = state.details[selected.id];
  if (!detail) {
    setDetailsHTML(panel, loadingDetails(selected));
    return;
  }
  const resourceShellKey = `resource:${state.activeWorkspaceId}:${selected.id}:${selected.type}`;
  ensureDetailsShell(panel, resourceShellKey, "resource", selected.type, detail);
  bindDetailsTabs(panel, resourceShellKey);
  updateDetailRegion(panel, "header", JSON.stringify({
    workspaceId: state.activeWorkspaceId,
    id: selected.id,
    type: selected.type,
    title: detail.title,
    path: detail.path,
    archived: detail.archived,
  }), () => resourceDetailsHeader(selected, detail));
  updateDetailRegion(panel, "documents", resourceDocumentsRenderKey(detail), () => fileSection(detail));
  // Apply after the documents region renders: the re-render resets the
  // per-file visibility the active tab owns.
  applyDetailsTab(panel, resourceShellKey);
  updateDetailRegion(panel, "logs", detailLogsRenderKey(detail), () => logSection(detail));
  updateDetailRegion(panel, "templates", JSON.stringify({ templates: detail.templates || [], template: detail.template || null }), () => selected.type === "project" ? templateSection(detail) : taskTemplateSection(detail));
  updateDetailRegion(panel, "artifacts", artifactRenderKey("Artifacts", detail.artifacts), () => artifactSection("Artifacts", detail.artifacts));
  updateDetailRegion(panel, "worktrees", JSON.stringify(detail.repos || []), () => selected.type === "project" ? "" : worktreeSection(detail.repos));
  updateDetailRegion(panel, "file-modal", fileModalRenderKey(state.preview), () => fileModal());
  updateDetailRegion(panel, "diff-modal", diffModalRenderKey(state.diff), () => diffModal());
  updateDetailsTabCounts(panel, detail);
  restoreFilePreviewScrollState(previewScrollState);
  bindDetailHeaderEvents(selected);
}

function templateSection(item) {
  const templates = item.templates || [];
  return `
    <div class="content-section">
      <h3>${icon("layout-template")}<span>Task Templates</span></h3>
      <div class="template-list">
        ${templates.length ? templates.map((template) => `
          <button type="button" class="template-row${template.valid ? "" : " invalid"}" data-template-preview="${escapeHTML(template.path)}">
            ${icon("file-text")}
            <span><strong>${escapeHTML(template.title || template.name)}</strong><small>${escapeHTML(template.name)} · v${escapeHTML(template.schemaVersion || "?")} · ${template.valid ? `${(template.fields || []).length} fields` : `invalid${template.errors?.[0] ? `: ${template.errors[0].message}` : ""}`}${template.legacy ? " · legacy" : ""}</small></span>
            ${icon("chevron-right")}
          </button>
        `).join("") : emptyListRow("No task templates in templates/*.md.", "layout-template")}
      </div>
    </div>
  `;
}

function taskTemplateSection(item) {
  const template = item.template;
  if (!template) return "";
  return `
    <div class="content-section">
      <h3>${icon("layout-template")}<span>Template</span></h3>
      <div class="template-list">
        <div class="template-row">
          ${icon("file-text")}
          <span><strong>${escapeHTML(template.name)}</strong><small>Created from template · v${escapeHTML(template.schemaVersion)} · ${escapeHTML(template.digest)}</small></span>
        </div>
      </div>
    </div>
  `;
}

function bindTemplateEvents() {
  document.querySelectorAll("[data-template-preview]").forEach((button) => {
    if (button.dataset.eventsBound === "true") return;
    button.dataset.eventsBound = "true";
    button.addEventListener("click", () => previewFile("Templates", button.dataset.templatePreview).catch((err) => toast(err.message)));
  });
}

function breadcrumb(selected, currentLabel) {
  const parent = parentProject(selected.id);
  const parts = [
    { id: "workspace", label: workspaceName(), current: selected.id === "workspace" },
  ];
  if (parent && parent.id !== selected.id) {
    parts.push({ id: parent.id, label: parent.title || parent.id, current: false });
  }
  parts.push({ id: selected.id, label: currentLabel || selected.title || selected.id, current: true });
  return `
    <nav class="breadcrumb" aria-label="Location">
      ${parts.map((part, index) => `
        ${index > 0 ? `<span class="breadcrumb-separator">/</span>` : ""}
        <button
          type="button"
          class="breadcrumb-link ${part.current ? "current" : ""}"
          data-breadcrumb-resource="${escapeHTML(part.id)}">
          ${escapeHTML(part.label)}
        </button>
      `).join("")}
    </nav>
  `;
}

function emptyDetails() {
  return `
    <div class="empty-state">
      ${icon("folder-search", "empty-state-icon")}
      <strong>No workspace selected</strong>
      <span>Add an AgentWorkspace path in the sidebar.</span>
    </div>
  `;
}

function workspaceDetails() {
  return `
    <div class="details-header">
      <nav class="breadcrumb" aria-label="Location">
        <button type="button" class="breadcrumb-link current" data-breadcrumb-resource="workspace">${escapeHTML(workspaceName())}</button>
      </nav>
      <div class="title-row"><h1>${escapeHTML(workspaceName())}</h1></div>
    </div>
    ${workspaceAgentsSection()}
    ${workspaceWikiSection()}
    ${fileModal()}
  `;
}

function workspaceWikiSection() {
  const wiki = state.tree?.wiki;
  if (wiki?.error) {
    return `
      <div class="content-section">
        <h3>${icon("book-open")}<span>Wiki</span></h3>
        <div class="file-modal-empty error-preview wiki-status">
          ${icon("triangle-alert")}
          <strong>Wiki unavailable</strong>
          <span>${escapeHTML(wiki.error)}</span>
        </div>
      </div>
    `;
  }
  if (!wiki?.exists) {
    return `
      <div class="content-section">
        <h3>${icon("book-open")}<span>Wiki</span></h3>
        <div class="file-modal-empty wiki-status">
          ${icon("book-open")}
          <strong>Wiki not initialized</strong>
          <span>Run forge migrate to create wiki/index.md.</span>
        </div>
      </div>
    `;
  }
  return artifactSection("Wiki", wiki.entries, "No Wiki files yet.");
}

function workspaceAgentsSection() {
  const agents = state.workspaceAgents;
  let body = `<div class="empty-state">${icon("loader-circle", "empty-state-icon")}<strong>Loading AGENTS.md...</strong></div>`;
  if (agents?.error) {
    body = `
      <div class="file-modal-empty error-preview">
        ${icon("triangle-alert")}
        <strong>AGENTS.md unavailable</strong>
        <span>${escapeHTML(agents.error)}</span>
      </div>
    `;
  } else if (agents) {
    body = workspaceAgentsEditor(agents.content || "");
  }
  return `
    <div class="content-section">
      <h3>${icon("file-text")}<span>Workspace AGENTS.md</span></h3>
      ${body}
    </div>
  `;
}

function workspaceAgentsEditor(content) {
  const userContent = workspaceAgentsEditorContent(content);
  return `
    <form id="workspaceAgentsForm" class="details-form workspace-agents-form">
      <textarea id="workspaceAgentsContent" rows="10" spellcheck="false" ${state.workspaceAgentsSaving ? "disabled" : ""}>${escapeHTML(userContent)}</textarea>
      <div class="form-actions">
        <button type="submit" ${state.workspaceAgentsSaving ? "disabled" : ""}>
          ${icon(state.workspaceAgentsSaving ? "loader-circle" : "save")}
          <span>${state.workspaceAgentsSaving ? "Saving" : "Save"}</span>
        </button>
      </div>
    </form>
  `;
}

async function openBreadcrumbResource(id) {
  const forceDetail = id === state.selectedId && id !== "workspace";
  await selectResource(id, { forceDetail });
}

function logSection(item) {
  const logs = [...(item.logs || [])].sort((a, b) => compareLogTimeDesc(a, b));
  const page = state.resourceLogPages?.[item.id] || {
    hasMore: Boolean(item.logPage?.hasMore),
    nextCursor: String(item.logPage?.nextCursor || ""),
    loading: false,
    error: "",
  };
  if (!logs.length && !page.error && !page.hasMore) return "";
  const loadMore = page.hasMore ? `
        <button
          type="button"
          class="secondary-button log-load-more"
          data-log-load-more
          data-log-resource="${escapeHTML(item.id)}"
          ${page.loading ? "disabled" : ""}
          aria-busy="${page.loading ? "true" : "false"}">
          ${icon(page.loading ? "loader-circle" : "chevron-down", page.loading ? "spin" : "")}
          <span>${page.loading ? "Loading older logs..." : page.error ? "Retry" : "Load More"}</span>
        </button>` : "";
  return `
    <div class="content-section">
      <h3>${icon("history")}<span>Log</span></h3>
      <div class="log-timeline">
        ${logs.map((entry) => logTimelineEntry(entry)).join("")}
      </div>
      ${page.error ? `<p class="log-load-error" role="alert">${escapeHTML(page.error)}</p>` : ""}
      ${loadMore ? `<div class="log-load-actions">${loadMore}</div>` : ""}
    </div>
  `;
}

function bindLogEvents() {
  document.querySelectorAll("[data-log-load-more]").forEach((button) => {
    if (button.dataset.eventsBound === "true") return;
    button.dataset.eventsBound = "true";
    button.addEventListener("click", () => {
      loadMoreLogs(button.dataset.logResource).catch((err) => toast(err.message));
    });
  });
}

function logTimelineEntry(entry) {
  const title = entry.title || "Untitled log entry";
  const details = entry.details || "";
  return `
    <details class="log-entry" data-log-id="${escapeHTML(entry.id || "")}">
      <summary>
        <span class="log-time" title="${escapeHTML(entry.time || "")}">
          <strong>${escapeHTML(relativeTime(entry.time))}</strong>
          <small>${escapeHTML(entry.time || "")}</small>
        </span>
        <span class="log-title">${escapeHTML(title)}</span>
        <span class="log-chevron" aria-hidden="true">${icon("chevron-right")}</span>
      </summary>
      <div class="log-details ${details ? "" : "empty"}">
        ${details ? renderMarkdown(details) : "No details."}
      </div>
    </details>
  `;
}

function compareLogTimeDesc(a, b) {
  const left = Date.parse(a?.time || "");
  const right = Date.parse(b?.time || "");
  if (Number.isFinite(left) && Number.isFinite(right) && left !== right) {
    return right - left;
  }
  return String(b?.time || "").localeCompare(String(a?.time || ""));
}

function relativeTime(value) {
  const timestamp = Date.parse(value || "");
  if (!Number.isFinite(timestamp)) return "unknown";
  const diffSeconds = Math.round((Date.now() - timestamp) / 1000);
  const future = diffSeconds < 0;
  const seconds = Math.abs(diffSeconds);
  if (seconds < 45) return future ? "soon" : "just now";
  const units = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["min", 60],
  ];
  for (const [unit, size] of units) {
    if (seconds >= size) {
      const amount = Math.floor(seconds / size);
      const label = unit === "min" ? "min" : `${unit}${amount === 1 ? "" : "s"}`;
      return future ? `in ${amount} ${label}` : `${amount} ${label} ago`;
    }
  }
  return future ? "in 1 min" : "1 min ago";
}

function fileSection(item) {
  const files = visibleResourceFiles(item);
  return files.map((file) => {
    const path = file.path || resourceFilePath(item.path, file.name);
    return `
      <div class="content-section" data-doc-file="${escapeHTML(file.name)}">
        <h3>${icon("file-text")}<span>${escapeHTML(file.name)}</span>${openFileAction(file.name, path)}</h3>
        ${renderFileContent(file.name, file.content)}
      </div>
    `;
  }).join("");
}

function visibleResourceFiles(item) {
  return (item.files || []).filter((file) => file.name !== "AGENTS.md");
}

function renderFileContent(name, content) {
  if (name === "AGENTS.md") {
    return renderAgentsFileContent(content);
  }
  if (isMarkdownFile(name)) {
    return renderMarkdownFileContent(name, content);
  }
  return `<pre class="markdown-view">${escapeHTML(content)}</pre>`;
}

function openFileAction(name, path) {
  if (!path || !isMarkdownFile(name)) {
    return "";
  }
  return `
    <a class="markdown-open-file" href="${escapeHTML(rawFileURL(path))}" target="_blank" rel="noopener" title="Open file in new window" aria-label="Open ${escapeHTML(name)} in new window">
      ${icon("external-link")}<span>Open</span>
    </a>
  `;
}

function renderAgentsFileContent(content) {
  const userContent = stripForgeManagedBlocks(content).trim();
  if (!userContent) {
    return `
      <div class="file-modal-empty">
        ${icon("file-text")}
        <strong>No user AGENTS.md content</strong>
        <span>Forge-managed instructions are hidden in this view.</span>
      </div>
    `;
  }
  return renderMarkdownFileContent("AGENTS.md", userContent);
}

function renderMarkdownFileContent(name, content) {
  return `
    <div class="markdown-preview">
      <div class="markdown-view markdown-rendered">${renderMarkdown(content)}</div>
    </div>
  `;
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
    const end = content.indexOf(endMarker, start + startMarker.length);
    if (end < 0) {
      result += content.slice(cursor);
      break;
    }
    result += content.slice(cursor, start);
    cursor = end + endMarker.length;
  }
  return result;
}

function workspaceAgentsUserContent(content) {
  return stripForgeManagedBlocks(content || "").trim();
}

function workspaceAgentsEditorContent(content) {
  if (state.workspaceAgentsDirty) return state.workspaceAgentsDraft;
  return workspaceAgentsUserContent(content);
}

function syncWorkspaceAgentsDraftFromInput(value) {
  state.workspaceAgentsDraft = value;
  state.workspaceAgentsDirty = value !== workspaceAgentsUserContent(state.workspaceAgents?.content || "");
  syncWorkspaceAgentsRenderKey();
}

function resetWorkspaceAgentsDraft() {
  state.workspaceAgentsDraft = "";
  state.workspaceAgentsDirty = false;
}

function captureWorkspaceAgentsEditorState() {
  const textarea = $("workspaceAgentsContent");
  if (!textarea || textarea.disabled) return null;
  syncWorkspaceAgentsDraftFromInput(textarea.value);
  if (document.activeElement !== textarea) return null;
  return {
    selectionStart: textarea.selectionStart,
    selectionEnd: textarea.selectionEnd,
    scrollTop: textarea.scrollTop,
  };
}

function restoreWorkspaceAgentsEditorState(snapshot) {
  if (!snapshot || state.selectedId !== "workspace") return;
  const textarea = $("workspaceAgentsContent");
  if (!textarea || textarea.disabled) return;
  textarea.focus({ preventScroll: true });
  const length = textarea.value.length;
  textarea.selectionStart = Math.min(snapshot.selectionStart ?? length, length);
  textarea.selectionEnd = Math.min(snapshot.selectionEnd ?? length, length);
  textarea.scrollTop = snapshot.scrollTop || 0;
}

function artifactSection(title, entries = [], emptyMessage = "No artifacts.") {
  const safeEntries = Array.isArray(entries) ? entries : [];
  const sectionIcon = title === "Worktrees" ? "folder-git-2" : title === "Wiki" ? "book-open" : "paperclip";
  return `
    <div class="content-section">
      <h3>${icon(sectionIcon)}<span>${title}</span></h3>
      <div class="artifact-browser">
        <div class="artifact-tree" role="tree">
          ${safeEntries.length > 0 ? safeEntries.map((entry) => artifactRow(entry, title, 0)).join("") : emptyListRow(emptyMessage, title === "Artifacts" ? "archive" : "inbox")}
        </div>
      </div>
    </div>
  `;
}

const ARTIFACT_ICON_TONES = {
  code: ["file-code", "artifact-icon-code"],
  doc: ["file-text", "artifact-icon-doc"],
  media: ["image", "artifact-icon-media"],
  archive: ["archive", "artifact-icon-archive"],
  default: ["file", ""],
};

function artifactFileIcon(name = "") {
  const ext = name.includes(".") ? name.split(".").pop().toLowerCase() : "";
  if (["js", "jsx", "ts", "tsx", "mjs", "cjs", "go", "py", "rs", "java", "kt", "c", "cc", "cpp", "h", "hpp", "cs", "rb", "php", "swift", "sh", "bash", "zsh", "sql", "html", "css", "scss", "vue", "svelte", "json", "jsonc", "yaml", "yml", "toml", "xml", "proto", "graphql"].includes(ext)) return ARTIFACT_ICON_TONES.code;
  if (["md", "markdown", "txt", "rst", "adoc", "pdf", "log"].includes(ext)) return ARTIFACT_ICON_TONES.doc;
  if (["png", "jpg", "jpeg", "gif", "svg", "webp", "ico", "bmp", "avif"].includes(ext)) return ARTIFACT_ICON_TONES.media;
  if (["zip", "tar", "gz", "tgz", "bz2", "xz", "7z", "rar"].includes(ext)) return ARTIFACT_ICON_TONES.archive;
  return ARTIFACT_ICON_TONES.default;
}

function artifactRow(entry, section, depth) {
  const key = artifactKey(section, entry.path);
  const isDirectory = entry.type === "directory";
  const expanded = state.expandedPaths.has(key);
  const active = state.preview?.section === section && state.preview?.path === entry.path;
  const children = isDirectory && expanded ? (entry.children || []).map((child) => artifactRow(child, section, depth + 1)).join("") : "";
  const [fileIconName, fileIconTone] = isDirectory ? [null, ""] : artifactFileIcon(entry.name);
  const downloadButton = isDirectory ? "" : `
    <a
      class="artifact-download"
      href="${escapeHTML(artifactDownloadURL(entry.path, section))}"
      download="${escapeHTML(entry.name)}"
      title="Download ${escapeHTML(entry.name)}"
      aria-label="Download ${escapeHTML(entry.name)}"
      data-artifact-download>${icon("download", "artifact-download-icon")}</a>`;
  return `
    <div class="artifact-node">
      <button
        class="artifact-row ${isDirectory ? "directory" : "file"} ${active ? "active" : ""}"
        style="--depth: ${depth}"
        data-file-action="${isDirectory ? "toggle" : "preview"}"
        data-section="${escapeHTML(section)}"
        data-path="${escapeHTML(entry.path)}">
        <span class="artifact-main">
          <span class="artifact-chevron">${isDirectory ? icon(expanded ? "chevron-down" : "chevron-right") : ""}</span>
          ${isDirectory
            ? icon(expanded ? "folder-open" : "folder", "artifact-icon artifact-icon-dir")
            : icon(fileIconName, `artifact-icon ${fileIconTone}`.trim())}
          <span class="artifact-name" title="${escapeHTML(entry.path)}">${escapeHTML(entry.name)}</span>
        </span>
        <span class="artifact-side">
          ${downloadButton}
          <small>${isDirectory ? `${(entry.children || []).length} items` : formatBytes(entry.size || 0)}</small>
        </span>
      </button>
      ${children ? `<div class="artifact-children">${children}</div>` : ""}
    </div>
  `;
}

function worktreeSection(repos = []) {
  const safeRepos = Array.isArray(repos) ? repos : [];
  return `
    <div class="content-section">
      <h3>${icon("folder-git-2")}<span>Worktrees</span></h3>
      <div class="worktree-list">
        ${safeRepos.length > 0 ? safeRepos.map(worktreeRow).join("") : emptyListRow("No worktrees.", "git-branch")}
      </div>
    </div>
  `;
}

function emptyListRow(message, iconName = "inbox") {
  return `<div class="empty-list-row">${icon(iconName)}<span>${escapeHTML(message)}</span></div>`;
}

function worktreeRow(repo) {
  const branch = repo.branch || "HEAD";
  const base = repo.targetBranch || repo.baseBranch || "";
  const path = repo.worktreePath || "";
  return `
    <div class="worktree-row">
      <div class="worktree-main">
        ${icon("git-branch", "worktree-icon")}
        <div>
          <strong>${escapeHTML(branch)}</strong>
          <span>${escapeHTML(repo.name || "repository")}${base ? ` · base ${escapeHTML(base)}` : ""}</span>
          <small>${escapeHTML(path)}</small>
        </div>
      </div>
      <button
        class="secondary-button"
        data-diff-path="${escapeHTML(path)}"
        data-diff-name="${escapeHTML(repo.name || branch)}"
        data-diff-branch="${escapeHTML(branch)}"
        data-diff-base="${escapeHTML(base)}">
        ${icon("git-compare-arrows")}<span>View Diff</span>
      </button>
    </div>
  `;
}

function fileModal() {
  const preview = state.preview;
  if (!preview) {
    return "";
  }
  const entering = state.modalEnter === "preview";
  if (entering) state.modalEnter = "";
  const body = fileModalBody(preview);
  return `
    <div class="file-modal-layer" role="presentation">
      <div class="file-modal-backdrop${entering ? " modal-enter" : ""}" data-modal-close="true"></div>
      <section class="file-modal${entering ? " modal-enter" : ""}" role="dialog" aria-modal="true" aria-label="File preview">
        <header class="file-modal-header">
          <div>
            <strong>${escapeHTML(preview.name || fileNameFromPath(preview.path))}</strong>
            <span>${escapeHTML(preview.path || "")}${preview.size != null ? ` · ${formatBytes(preview.size)}` : ""}${preview.truncated ? " · truncated" : ""}</span>
          </div>
          <div class="file-modal-actions">
            <a class="secondary-button file-modal-open" href="${escapeHTML(rawFileURL(preview.path, preview.section))}" target="_blank" rel="noopener" title="Open file in new window">
              ${icon("external-link")}<span>Open</span>
            </a>
            <button class="icon-button" data-modal-close="true" title="Close" aria-label="Close">${icon("x")}</button>
          </div>
        </header>
        ${body}
      </section>
    </div>
  `;
}

function diffModal() {
  const diff = state.diff;
  if (!diff) return "";
  const entering = state.modalEnter === "diff";
  if (entering) state.modalEnter = "";
  const title = diff.branch || diff.name || "Diff";
  return `
    <div class="diff-modal-layer" role="presentation">
      <div class="file-modal-backdrop${entering ? " modal-enter" : ""}" data-diff-close="true"></div>
      <section class="diff-modal${entering ? " modal-enter" : ""}" role="dialog" aria-modal="true" aria-label="Worktree diff">
        <header class="file-modal-header diff-modal-header">
          <div>
            <strong>${escapeHTML(title)}</strong>
            <span>${escapeHTML(diff.path || "")}${diff.base ? ` · base ${escapeHTML(diff.base)}` : ""}</span>
          </div>
          <button class="icon-button" data-diff-close="true" title="Close" aria-label="Close">${icon("x")}</button>
        </header>
        ${diffModalBody(diff)}
      </section>
    </div>
  `;
}

function diffModalBody(diff) {
  if (diff.loading) {
    return `
      <div class="file-modal-empty">
        ${icon("loader-circle")}
        <strong>Loading diff</strong>
        <span>${escapeHTML(diff.path)}</span>
      </div>
    `;
  }
  if (diff.error) {
    return `
      <div class="file-modal-empty error-preview">
        ${icon("triangle-alert")}
        <strong>Diff unavailable</strong>
        <span>${escapeHTML(diff.error)}</span>
      </div>
    `;
  }
  if (!diff.hasChanges || !String(diff.diff || "").trim()) {
    return `
      <div class="file-modal-empty">
        ${icon("check-circle-2")}
        <strong>No changes</strong>
        <span>This worktree has no diff to show.</span>
      </div>
    `;
  }
  return `<div id="diffViewer" class="diff-viewer"></div>`;
}

function fileModalBody(preview) {
  if (preview.loading) {
    return `
      <div class="file-modal-empty">
        ${icon("loader-circle")}
        <strong>Loading preview</strong>
        <span>${escapeHTML(preview.path)}</span>
      </div>
    `;
  }
  if (preview.error) {
    return `
      <div class="file-modal-empty error-preview">
        ${icon("triangle-alert")}
        <strong>Preview unavailable</strong>
        <span>${escapeHTML(preview.error)}</span>
      </div>
    `;
  }
  if (preview.image) {
    return `
      <div class="image-preview" data-preview-scroll>
        <img src="${escapeHTML(rawFileURL(preview.path, preview.section))}" alt="${escapeHTML(preview.name || preview.path)}" />
      </div>
    `;
  }
  if (preview.binary) {
    return `
      <div class="file-modal-empty">
        ${icon("file-warning")}
        <strong>${escapeHTML(preview.name || preview.path)}</strong>
        <span>Binary file, ${formatBytes(preview.size || 0)}.</span>
      </div>
    `;
  }
  if (isMarkdownFile(preview.path || preview.name)) {
    return `<div class="modal-markdown markdown-rendered" data-preview-scroll>${renderMarkdown(preview.content || "")}</div>`;
  }
  return `
    <pre class="modal-preview-content" data-preview-scroll>${escapeHTML(preview.content || "")}</pre>
  `;
}

function captureFilePreviewScrollState() {
  const scroller = document.querySelector("[data-preview-scroll]");
  if (!scroller || !state.preview?.path) return null;
  return {
    key: artifactKey(state.preview.section || "", state.preview.path),
    scrollTop: scroller.scrollTop,
    scrollLeft: scroller.scrollLeft,
  };
}

function restoreFilePreviewScrollState(snapshot) {
  if (!snapshot || !state.preview?.path) return;
  if (snapshot.key !== artifactKey(state.preview.section || "", state.preview.path)) return;
  const scroller = document.querySelector("[data-preview-scroll]");
  if (!scroller) return;
  scroller.scrollTop = snapshot.scrollTop;
  scroller.scrollLeft = snapshot.scrollLeft;
}

function bindArtifactBrowserEvents() {
  document.querySelectorAll("[data-file-action]").forEach((button) => {
    if (button.dataset.eventsBound === "true") return;
    button.dataset.eventsBound = "true";
    button.addEventListener("click", (event) => {
      if (event.target.closest("[data-artifact-download]")) return;
      const section = button.dataset.section;
      const path = button.dataset.path;
      if (button.dataset.fileAction === "toggle") {
        const key = artifactKey(section, path);
        if (state.expandedPaths.has(key)) {
          state.expandedPaths.delete(key);
        } else {
          state.expandedPaths.add(key);
        }
        renderAll();
        return;
      }
      previewFile(section, path).catch((err) => toast(err.message));
    });
  });
}

function bindFileModalEvents() {
  document.querySelectorAll("[data-modal-close]").forEach((button) => {
    if (button.dataset.eventsBound === "true") return;
    button.dataset.eventsBound = "true";
    button.addEventListener("click", closePreview);
  });
}

function bindWorkspaceAgentsEvents() {
  const input = $("workspaceAgentsContent");
  if (input && input.dataset.eventsBound !== "true") {
    input.dataset.eventsBound = "true";
    input.addEventListener("input", (event) => {
      syncWorkspaceAgentsDraftFromInput(event.target.value);
    });
  }
  const form = $("workspaceAgentsForm");
  if (form && form.dataset.eventsBound !== "true") {
    form.dataset.eventsBound = "true";
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      saveWorkspaceAgents().catch((err) => toast(err.message));
    });
  }
}

function bindDiffEvents() {
  document.querySelectorAll("[data-diff-path]").forEach((button) => {
    if (button.dataset.eventsBound === "true") return;
    button.dataset.eventsBound = "true";
    button.addEventListener("click", () => {
      openDiff({
        path: button.dataset.diffPath,
        name: button.dataset.diffName,
        branch: button.dataset.diffBranch,
        base: button.dataset.diffBase,
      }).catch((err) => toast(err.message));
    });
  });
}

function bindDiffModalEvents() {
  document.querySelectorAll("[data-diff-close]").forEach((button) => {
    if (button.dataset.eventsBound === "true") return;
    button.dataset.eventsBound = "true";
    button.addEventListener("click", closeDiff);
  });
}

async function previewFile(section, path) {
  state.modalEnter = "preview";
  const requestVersion = ++state.previewRequestVersion;
  const workspaceId = state.activeWorkspaceId;
  state.preview = { section, path, loading: true };
  renderAll();
  try {
    await refreshFilePreview(section, path, { rethrow: true, requestVersion, workspaceId });
  } catch (err) {
    throw err;
  } finally {
    renderAll();
  }
}

async function refreshFilePreview(section, path, options = {}) {
  const workspaceId = options.workspaceId || state.activeWorkspaceId;
  const requestVersion = options.requestVersion || ++state.previewRequestVersion;
  try {
    const preview = await api(filePreviewURL(section, path, workspaceId));
    if (
      workspaceId !== state.activeWorkspaceId ||
      requestVersion !== state.previewRequestVersion ||
      state.preview?.section !== section ||
      state.preview?.path !== path
    ) return null;
    state.preview = { section, ...preview };
    return state.preview;
  } catch (err) {
    const current =
      workspaceId === state.activeWorkspaceId &&
      requestVersion === state.previewRequestVersion &&
      state.preview?.section === section &&
      state.preview?.path === path;
    if (current) {
      state.preview = { section, path, error: err.message };
    }
    if (options.rethrow && current) throw err;
    return null;
  }
}

async function saveWorkspaceAgents() {
  if (!state.activeWorkspaceId || state.workspaceAgentsSaving) return;
  const workspaceId = state.activeWorkspaceId;
  const navigationVersion = state.navigationVersion;
  const content = $("workspaceAgentsContent")?.value || "";
  state.workspaceAgentsSaving = true;
  renderAll();
  try {
    const saved = await api(`/api/workspaces/${workspaceId}/files?path=${encodeURIComponent("AGENTS.md")}`, {
      method: "PUT",
      body: JSON.stringify({ content }),
    });
    if (!isCurrentWorkspaceView(workspaceId, navigationVersion)) return;
    state.workspaceAgents = saved;
    state.workspaceAgentsDraft = workspaceAgentsUserContent(state.workspaceAgents.content || "");
    state.workspaceAgentsDirty = false;
    toast("Workspace AGENTS.md saved.");
  } finally {
    if (isCurrentWorkspaceView(workspaceId, navigationVersion)) {
      state.workspaceAgentsSaving = false;
      renderAll();
    }
  }
}

async function openDiff(repo) {
  state.modalEnter = "diff";
  const requestVersion = ++state.diffRequestVersion;
  const workspaceId = state.activeWorkspaceId;
  const navigationVersion = state.navigationVersion;
  state.diff = { ...repo, loading: true };
  renderAll();
  try {
    const params = new URLSearchParams({ path: repo.path || "" });
    if (repo.base) params.set("base", repo.base);
    const diff = await api(`/api/workspaces/${workspaceId}/diff?${params.toString()}`);
    if (
      !isCurrentWorkspaceView(workspaceId, navigationVersion) ||
      requestVersion !== state.diffRequestVersion ||
      state.diff?.path !== repo.path
    ) return;
    state.diff = { ...repo, ...diff };
  } catch (err) {
    const current =
      isCurrentWorkspaceView(workspaceId, navigationVersion) &&
      requestVersion === state.diffRequestVersion &&
      state.diff?.path === repo.path;
    if (current) {
      state.diff = { ...repo, error: err.message };
    }
    if (current) throw err;
  } finally {
    renderAll();
  }
}

function renderDiffContent() {
  const viewer = document.getElementById("diffViewer");
  if (!viewer || !state.diff?.diff) return;
  if (!window.Diff2Html) {
    viewer.innerHTML = `<div class="file-modal-empty">${icon("loader-circle")}<strong>Loading diff renderer...</strong><span>The diff will render when Diff2Html finishes loading.</span></div>`;
    refreshIcons();
    return;
  }
  viewer.innerHTML = window.Diff2Html.html(state.diff.diff, {
    drawFileList: true,
    matching: "lines",
    outputFormat: "side-by-side",
    renderNothingWhenEmpty: false,
  });
}

function artifactKey(section, path) {
  return `${section}:${path}`;
}

function resourceFilePath(resourcePath = "", name = "") {
  return [resourcePath, name].filter(Boolean).join("/");
}

function closePreview() {
  state.previewRequestVersion++;
  state.preview = null;
  renderAll();
}

function closeDiff() {
  state.diffRequestVersion++;
  state.diff = null;
  renderAll();
}

function filePreviewURL(section, path, workspaceId = state.activeWorkspaceId) {
  const base = section === "Wiki" ? "wiki/files" : "files";
  return `/api/workspaces/${workspaceId}/${base}?path=${encodeURIComponent(path)}`;
}

function rawFileURL(path, section = "") {
  const base = section === "Wiki" ? "wiki/files/raw" : "files/raw";
  return `/api/workspaces/${state.activeWorkspaceId}/${base}?path=${encodeURIComponent(path)}`;
}

function artifactDownloadURL(path, section = "") {
  return `${rawFileURL(path, section)}&download=1`;
}

function fileNameFromPath(path = "") {
  return path.split("/").filter(Boolean).pop() || "File preview";
}

function isMarkdownFile(path = "") {
  return /\.(md|markdown|mdown|mkdn)$/i.test(path);
}

function renderMarkdown(content) {
  if (window.marked && window.DOMPurify) {
    window.marked.setOptions({
      breaks: true,
      gfm: true,
    });
    return window.DOMPurify.sanitize(window.marked.parse(String(content ?? "")));
  }
  return `<pre>${escapeHTML(content)}</pre>`;
}

function repoSection(item) {
  if (!item.repos || item.repos.length === 0) return "";
  return `
    <div class="content-section">
      <h3>${icon("folder-git-2")}<span>Repositories</span></h3>
      <div class="file-tree">
        ${item.repos.map((repo) => `
          <div class="file-row">
            <span>${icon("git-branch")} ${escapeHTML(repo.name)}</span>
            <small>${escapeHTML(repo.branch || repo.targetBranch || "")}</small>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function isSelfDrivingWaitingFinishNotice(notice) {
  const data = notice?.data;
  return data?.method === "forge/self-driving/finish" &&
    data?.kind === SELF_DRIVING_FINISH_NOTICE_KIND &&
    data?.lifecycle === SELF_DRIVING_FINISH_NOTICE_WAITING_LIFECYCLE &&
    data?.level !== "error" &&
    String(data.runId || "").trim() !== "" &&
    String(data.resourceId || "").trim() !== "" &&
    Number(data.selfDrivingRevision) > 0;
}

function selfDrivingWaitingNoticeKey(notice) {
  const data = notice?.data || {};
  return `${String(data.runId || "").trim()}:${String(data.resourceId || "").trim()}:${Number(data.selfDrivingRevision) || 0}`;
}

function selfDrivingWaitingNoticeSequence(notice) {
  return Number(notice?.data?.schedulerTurnSequence) || 0;
}

function selfDrivingProjectionForRun(run) {
  const resourceId = String(run?.resourceId || "").trim();
  if (!resourceId) return null;
  const candidates = [
    state.details?.[resourceId],
    findResource(resourceId),
  ].map((resource) => resource?.selfDriving).filter(Boolean).map((selfDriving) => ({
    revision: Number(selfDriving.revision) || 0,
    state: String(selfDriving.condition || "").trim().toLowerCase(),
  }));
  if (!candidates.length) return null;
  const statePriority = (stateName) => SELF_DRIVING_RESUMABLE_STATES.has(stateName) ? 0 : 1;
  candidates.sort((left, right) => right.revision - left.revision || statePriority(right.state) - statePriority(left.state));
  return candidates[0];
}

function currentSelfDrivingWaitingNotice(notice, runs = state.agent.runs) {
  if (!isSelfDrivingWaitingFinishNotice(notice)) return true;
  const data = notice.data;
  if (!state.agent.activeRunId || String(data.runId).trim() !== state.agent.activeRunId) return false;
  const run = (runs || []).find((candidate) => candidate.id === state.agent.activeRunId);
  if (!run || String(run.resourceId || "").trim() !== String(data.resourceId).trim() ||
      Number(run.selfDrivingRevision) !== Number(data.selfDrivingRevision)) return false;

  const noticeSequence = selfDrivingWaitingNoticeSequence(notice);
  const runSequence = Number(run.schedulerTurnSequence) || 0;
  if (runSequence > noticeSequence && runSequence > 0) return false;
  if (runSequence === noticeSequence && run.schedulerTurnId && data.schedulerTurnId &&
      run.schedulerTurnId !== data.schedulerTurnId) return false;
  if (run.schedulerTurn && (runSequence === 0 || runSequence >= noticeSequence)) return false;

  const projection = selfDrivingProjectionForRun(run);
  if (!projection) return true;
  if (projection.revision !== Number(data.selfDrivingRevision)) return false;
  return SELF_DRIVING_RESUMABLE_STATES.has(projection.state);
}

function reconcileAgentNotices(runs = state.agent.runs) {
  const before = state.agent.notices.length;
  state.agent.notices = state.agent.notices.filter((notice) => currentSelfDrivingWaitingNotice(notice, runs));
  return state.agent.notices.length !== before;
}

function recordSelfDrivingWaitingNoticeWatermark(notice) {
  if (!isSelfDrivingWaitingFinishNotice(notice)) return;
  if (!(state.agent.selfDrivingFinishNoticeWatermarks instanceof Map)) state.agent.selfDrivingFinishNoticeWatermarks = new Map();
  const key = selfDrivingWaitingNoticeKey(notice);
  const sequence = selfDrivingWaitingNoticeSequence(notice);
  const previous = state.agent.selfDrivingFinishNoticeWatermarks.get(key) || 0;
  if (sequence > previous) state.agent.selfDrivingFinishNoticeWatermarks.set(key, sequence);
}

function isStaleSelfDrivingWaitingNotice(notice) {
  if (!isSelfDrivingWaitingFinishNotice(notice)) return false;
  if (!(state.agent.selfDrivingFinishNoticeWatermarks instanceof Map)) state.agent.selfDrivingFinishNoticeWatermarks = new Map();
  const sequence = selfDrivingWaitingNoticeSequence(notice);
  const previous = state.agent.selfDrivingFinishNoticeWatermarks.get(selfDrivingWaitingNoticeKey(notice)) || 0;
  return previous > 0 && sequence <= previous;
}

async function loadAgentRuns() {
  if (!state.activeWorkspaceId) {
    resetAgentState();
    return;
  }
  state.agentRunProjectionVersion = (Number(state.agentRunProjectionVersion) || 0) + 1;
  const projectionVersion = state.agentRunProjectionVersion;
  const runs = await fetchAgentRuns();
  if (projectionVersion !== state.agentRunProjectionVersion || !state.activeWorkspaceId) return false;
  state.agent.runs = runs;
  observeCompletionProjections(state.agent.runs);
  reconcileActiveAgentRun(state.agent.runs);
  if (typeof reconcileAgentNotices === "function") reconcileAgentNotices(state.agent.runs);
  if (state.agent.activeRunId) {
    await loadCanonicalAgentEvents({ projectionVersion });
  } else {
    state.agent.events = [];
    state.agent.notices = [];
    state.agent.historyBeforeId = 0;
  }
  if (projectionVersion !== state.agentRunProjectionVersion) return false;
  if (typeof reconcileAgentNotices === "function") reconcileAgentNotices(state.agent.runs);
  connectAgentStream();
  return true;
}

async function refreshAgentRunMetadata(options = {}) {
  if (!state.activeWorkspaceId) return;
  state.agentRunProjectionVersion = (Number(state.agentRunProjectionVersion) || 0) + 1;
  const projectionVersion = state.agentRunProjectionVersion;
  const workspaceId = state.activeWorkspaceId;
  const runs = await fetchAgentRuns();
  if (projectionVersion !== state.agentRunProjectionVersion || state.activeWorkspaceId !== workspaceId) return false;
  state.agent.runs = runs;
  observeCompletionProjections(runs);
  if (typeof reconcileAgentNotices === "function") reconcileAgentNotices(runs);
  if (reconcileActiveAgentRun(runs)) {
    await loadCanonicalAgentEvents({ projectionVersion });
    if (projectionVersion !== state.agentRunProjectionVersion || state.activeWorkspaceId !== workspaceId) return false;
    connectAgentStream();
  }
  if (options.refreshSelfDrivingProjection && state.agent.activeRunId) {
    const activeRun = currentAgentRun();
    const resourceId = String(activeRun?.resourceId || "").trim();
    const [tree, detail] = await Promise.all([
      fetchCurrentTree(workspaceId),
      resourceId ? fetchDetail(resourceId, workspaceId, { logsLimit: RESOURCE_LOG_INITIAL_LIMIT }) : Promise.resolve(null),
    ]);
    if (projectionVersion !== state.agentRunProjectionVersion || state.activeWorkspaceId !== workspaceId) return false;
    if (tree) state.tree = tree;
    if (detail && state.activeWorkspaceId === workspaceId) applyResourceDetail(detail, "head");
  }
  if (typeof reconcileAgentNotices === "function") reconcileAgentNotices(state.agent.runs);
  return true;
}

function reconcileActiveAgentRun(runs) {
  const nextRunId = preferredAgentRunID(runs);
  if (state.agent.activeRunId === nextRunId) {
    const activeRun = runs.find((run) => run.id === nextRunId);
    if (activeRun) restoreAgentDraftForRun(activeRun);
    return false;
  }
  flushAgentDraft();
  state.agent.activeRunId = nextRunId;
  state.agent.events = [];
  state.agent.notices = [];
  state.agent.eventsHasMore = false;
  state.agent.historyBeforeId = 0;
  clearAgentDraftMemory();
  const activeRun = runs.find((run) => run.id === nextRunId);
  if (activeRun) restoreAgentDraftForRun(activeRun);
  state.agent.approvalDrafts.clear();
  return true;
}

function preferredAgentRunID(runs) {
  const selfDriving = runs.find((run) => run.schedulerTurn && isLiveAgentRun(run));
  if (selfDriving) return selfDriving.id;
  if (runs.some((run) => run.id === state.agent.activeRunId)) return state.agent.activeRunId;
  return runs[0]?.id || "";
}

async function fetchCurrentTree(workspaceId = state.activeWorkspaceId) {
  const requestVersion = ++state.treeRequestVersion;
  const navigationVersion = state.navigationVersion;
  const tree = await api(`/api/workspaces/${workspaceId}/tree`);
  return isCurrentWorkspaceView(workspaceId, navigationVersion, requestVersion) ? tree : null;
}

async function refreshTreeAfterAgentSessionMutation() {
  if (!state.activeWorkspaceId || !state.tree) return;
  const tree = await fetchCurrentTree(state.activeWorkspaceId);
  if (tree) state.tree = tree;
}

async function refreshAgentInputProjection(workspaceId, resourceId) {
  if (!workspaceId || state.activeWorkspaceId !== workspaceId) return;
  await Promise.all([
    loadAgentRuns(),
    refreshTreeAfterAgentSessionMutation(),
    resourceId && resourceId !== "workspace"
      ? fetchDetail(resourceId, workspaceId, { logsLimit: RESOURCE_LOG_INITIAL_LIMIT }).then((detail) => {
        if (state.activeWorkspaceId === workspaceId && detail) applyResourceDetail(detail, "head");
      })
      : Promise.resolve(),
  ]);
  if (state.activeWorkspaceId === workspaceId) {
    if (typeof reconcileAgentNotices === "function") reconcileAgentNotices(state.agent.runs);
    renderAll();
  }
}

async function mutateAgentSession(action) {
  state.agentSessionMutationCount++;
  state.autoRefreshVersion++;
  state.treeRequestVersion++;
  try {
    return await action();
  } finally {
    state.agentSessionMutationCount--;
  }
}

async function loadCanonicalAgentEvents() {
  const options = arguments[0] || {};
  if (!state.activeWorkspaceId || !state.agent.activeRunId) {
    state.agent.events = [];
    state.agent.notices = [];
    state.agent.eventsHasMore = false;
    state.agent.historyBeforeId = 0;
    return;
  }
  const workspaceId = state.activeWorkspaceId;
  const runId = state.agent.activeRunId;
  const projectionVersion = options.projectionVersion ?? state.agentRunProjectionVersion;
  const detail = await api(`/api/workspaces/${workspaceId}/agent/runs/${runId}`);
  if (projectionVersion !== state.agentRunProjectionVersion || state.activeWorkspaceId !== workspaceId || state.agent.activeRunId !== runId) return false;
  // Event history comes from the AgentHub proxy; the detail response only
  // carries run metadata. Open with exactly one durable tail page; older
  // pages load only when the user clicks "Load older messages".
  const body = await api(`/api/workspaces/${workspaceId}/agent/runs/${runId}/events?latest=true&limit=${AGENT_OLDER_RAW_PAGE_LIMIT}`);
  if (projectionVersion !== state.agentRunProjectionVersion || state.activeWorkspaceId !== workspaceId || state.agent.activeRunId !== runId) return false;
  const events = body.events || [];
  state.agent.historyBeforeId = oldestRawAgentEventID(events);
  state.agent.events = mergeCanonicalAgentEvents(events);
  state.agent.eventsHasMore = Boolean(body.page?.hasMoreBefore);
  const index = state.agent.runs.findIndex((run) => run.id === detail.run.id);
  const current = index >= 0 ? state.agent.runs[index] : null;
  const currentSequence = Number(current?.schedulerTurnSequence) || 0;
  const detailSequence = Number(detail.run.schedulerTurnSequence) || 0;
  const currentTime = current ? Date.parse(current.updatedAt || "") : 0;
  const detailTime = Date.parse(detail.run.updatedAt || "");
  if (index >= 0 && detailSequence >= currentSequence &&
      (!current || !Number.isFinite(currentTime) || !Number.isFinite(detailTime) || detailTime >= currentTime)) {
    state.agent.runs[index] = detail.run;
  }
  if (typeof reconcileAgentNotices === "function") reconcileAgentNotices(state.agent.runs);
  scheduleAgentLogAutoFill();
  return true;
}

// scheduleAgentLogAutoFill defers the viewport check until after the caller's
// render pass so scrollHeight reflects the freshly loaded tail page.
function scheduleAgentLogAutoFill() {
  const runId = state.agent.activeRunId;
  if (!runId || !state.agent.eventsHasMore) return;
  setTimeout(() => {
    autoFillAgentLog(runId).catch((err) => toast(err.message));
  }, 0);
}

async function autoFillAgentLog(runId) {
  if (state.agent.activeRunId !== runId) return;
  if (!state.agent.eventsHasMore || state.agent.loadingOlder) return;
  const log = $("ttyLog");
  if (!log || log.dataset.agentRunId !== runId) return;
  if (log.scrollHeight > log.clientHeight + AGENT_AUTOFILL_OVERFLOW_PX) return;
  state.agent.loadingOlder = true;
  renderTTY({ stickToBottom: false });
  let completed = false;
  try {
    let pages = 0;
    while (pages < AGENT_AUTOFILL_MAX_PAGES) {
      if (state.agent.activeRunId !== runId || !state.agent.eventsHasMore) break;
      const currentLog = $("ttyLog");
      if (!currentLog) break;
      if (currentLog.scrollHeight > currentLog.clientHeight + AGENT_AUTOFILL_OVERFLOW_PX) break;
      const loaded = await loadOlderAgentEventsPage(AGENT_OLDER_RAW_PAGE_LIMIT);
      if (!loaded) break;
      pages++;
      // Re-render so the next iteration measures up-to-date content. A
      // deferred render (active text selection) leaves stale measurements,
      // so stop instead of paging blindly. Stick-to-bottom follows the
      // default near-bottom rule so a user scroll is not yanked back.
      renderTTY();
      if (state.agent.renderDeferredForSelection) break;
    }
    completed = state.agent.activeRunId === runId;
  } finally {
    state.agent.loadingOlder = false;
    if (completed) {
      renderTTY();
      refreshIcons();
    } else if (state.agent.activeRunId) {
      // The active run changed mid-fill; let the new run fill its own log.
      scheduleAgentLogAutoFill();
    }
  }
}

async function loadOlderAgentEvents() {
  if (!state.activeWorkspaceId || !state.agent.activeRunId || state.agent.loadingOlder) return;
  if (!state.agent.historyBeforeId) return;
  const log = $("ttyLog");
  const previousHeight = log?.scrollHeight || 0;
  // Raw session events can contain thousands of reasoning/tool updates
  // between two chat messages. Keep paging until the button reveals at least
  // one earlier conversation message, not merely another tool group.
  const targetVisibleCount = visibleAgentMessageCount() + AGENT_MANUAL_VISIBLE_EVENT_COUNT;
  state.agent.loadingOlder = true;
  renderTTY({ stickToBottom: false });
  try {
    await ensureVisibleAgentEvents(targetVisibleCount, {
      maxPages: AGENT_MANUAL_AUTO_PAGE_LIMIT,
      pageLimit: AGENT_MANUAL_RAW_PAGE_LIMIT,
      visibleCount: visibleAgentMessageCount,
    });
  } finally {
    state.agent.loadingOlder = false;
    renderTTY({ stickToBottom: false });
    const nextLog = $("ttyLog");
    if (nextLog) {
      nextLog.scrollTop = nextLog.scrollHeight - previousHeight;
    }
    refreshIcons();
  }
}

async function ensureVisibleAgentEvents(targetCount, options = {}) {
  const maxPages = options.maxPages || AGENT_MANUAL_AUTO_PAGE_LIMIT;
  const pageLimit = options.pageLimit || AGENT_MANUAL_RAW_PAGE_LIMIT;
  const visibleCount = options.visibleCount || visibleAgentEventCount;
  let pages = 0;
  while (state.agent.eventsHasMore && visibleCount() < targetCount && pages < maxPages) {
    const loaded = await loadOlderAgentEventsPage(pageLimit);
    if (!loaded) break;
    pages++;
  }
}

async function loadOlderAgentEventsPage(pageLimit = AGENT_OLDER_RAW_PAGE_LIMIT) {
  const before = state.agent.historyBeforeId;
  if (!before) return false;
  const body = await api(`/api/workspaces/${state.activeWorkspaceId}/agent/runs/${state.agent.activeRunId}/events?before=${encodeURIComponent(before)}&limit=${encodeURIComponent(pageLimit)}`);
  const older = body.events || [];
  const nextBefore = oldestRawAgentEventID(older);
  if (older.length > 0 && (!nextBefore || nextBefore >= before)) {
    state.agent.eventsHasMore = false;
    return false;
  }
  if (nextBefore) state.agent.historyBeforeId = nextBefore;
  state.agent.events = mergeCanonicalAgentEvents([...older, ...state.agent.events]);
  state.agent.eventsHasMore = Boolean(body.page?.hasMoreBefore);
  return older.length > 0;
}

function visibleAgentEventCount() {
  return projectAgentTimeline().length;
}

function visibleAgentMessageCount() {
  return projectAgentTimeline().filter((item) =>
    ["message", "error", "approval"].includes(item.kind)
  ).length;
}

function oldestRawAgentEventID(events) {
  return events.reduce((oldest, event) => {
    const id = Number(event?.id) || 0;
    return id > 0 && (!oldest || id < oldest) ? id : oldest;
  }, 0);
}

function latestAgentEventID() {
  return state.agent.events.reduce((max, event) => Math.max(max, event.id || 0), 0);
}

function fetchAgentRuns() {
  const resourceId = selectedAgentResourceId();
  const query = resourceId ? `?resourceId=${encodeURIComponent(resourceId)}` : "";
  return api(`/api/workspaces/${state.activeWorkspaceId}/agent/runs${query}`).then((body) => body.runs || []);
}

async function reloadAgentRunsForSelection() {
  flushAgentDraft();
  closeAgentStream();
  state.agent.turnStopping = false;
  state.agent.turnStoppingRunId = "";
  state.agent.sessionStopping = false;
  state.agent.sessionStoppingRunId = "";
  state.agent.activeRunId = "";
  state.agent.events = [];
  state.agent.notices = [];
  state.agent.historyBeforeId = 0;
  clearAgentDraftMemory();
  await loadAgentRuns();
}

function resetAgentState() {
  if (state.selfDrivingDialog.open && !state.selfDrivingDialog.submitting) closeSelfDrivingConfigDialog();
  flushAgentDraft();
  discardAgentUploadDialog();
  closeAgentStream();
  state.agent.runs = [];
  state.agentRunProjectionVersion = (Number(state.agentRunProjectionVersion) || 0) + 1;
  state.agent.activeRunId = "";
  state.agent.events = [];
  state.agent.notices = [];
  state.agent.eventsHasMore = false;
  state.agent.historyBeforeId = 0;
  state.agent.loadingOlder = false;
  state.agent.optionsOpen = false;
  state.agent.agentChooserOpen = false;
  state.agent.historyOpen = false;
  clearAgentDraftMemory();
  state.agent.newSessionStarting = false;
  state.agent.turnStopping = false;
  state.agent.turnStoppingRunId = "";
  state.agent.sessionStopping = false;
  state.agent.sessionStoppingRunId = "";
  state.agent.toolGroupOpen.clear();
  state.agent.approvalDrafts.clear();
  if (state.agent.selfDrivingFinishNoticeWatermarks instanceof Map) state.agent.selfDrivingFinishNoticeWatermarks.clear();
  state.agent.renderDeferredForSelection = false;
  clearAgentRenderTimer();
}

function connectAgentStream() {
  if (!state.activeWorkspaceId || !state.agent.activeRunId) {
    closeAgentStream();
    return;
  }
  if (state.agent.streamRunId === state.agent.activeRunId && state.agent.stream) return;
  closeAgentStream();
  const runId = state.agent.activeRunId;
  const after = latestAgentEventID();
  const query = after > 0 ? `?after=${encodeURIComponent(after)}` : "";
  const stream = new EventSource(`/api/workspaces/${state.activeWorkspaceId}/agent/runs/${runId}/stream${query}`);
  stream.onmessage = (event) => {
    if (state.agent.stream !== stream || state.agent.activeRunId !== runId) return;
    try {
      appendCanonicalAgentEvent(JSON.parse(event.data));
    } catch (err) {
      console.warn("agent event parse failed", err);
    }
  };
  stream.addEventListener("forge.notice", (event) => {
    if (state.agent.stream !== stream || state.agent.activeRunId !== runId) return;
    try {
      appendForgeNotice(JSON.parse(event.data));
    } catch (err) {
      console.warn("Forge notice parse failed", err);
    }
  });
  stream.onerror = () => {
    if (state.agent.stream !== stream) {
      stream.close();
      return;
    }
    // Live EventSource connections reconnect automatically and send their
    // Last-Event-ID. Closed runs have no future events, so stop retrying them.
    if (!isLiveAgentRun(currentAgentRun())) {
      stream.close();
      state.agent.stream = null;
      state.agent.streamRunId = "";
    }
  };
  state.agent.stream = stream;
  state.agent.streamRunId = runId;
}

function closeAgentStream() {
  if (state.agent.stream) {
    state.agent.stream.close();
  }
  state.agent.stream = null;
  state.agent.streamRunId = "";
}

function appendCanonicalAgentEvent(event) {
  if (!event) return;
  const existingIndex = state.agent.events.findIndex((existing) => existing.id === event.id);
  if (existingIndex >= 0) {
    const existing = state.agent.events[existingIndex];
    if (event.data?.append === true) {
      // Live delta-merge patch: extend the stored event with the fragment
      // instead of re-receiving the accumulated content.
      const currentText = typeof existing.data?.text === "string" ? existing.data.text : "";
      const fragment = typeof event.data?.text === "string" ? event.data.text : "";
      const startTime = event.startTime || existing.startTime || "";
      state.agent.events[existingIndex] = {
        ...existing,
        time: event.time || existing.time,
        ...(startTime ? { startTime } : {}),
        data: { ...existing.data, text: currentText + fragment },
      };
    } else {
      // Full replacement: history replay or the reconnect cursor re-send.
      const startTime = event.startTime || existing.startTime || "";
      state.agent.events[existingIndex] = startTime ? { ...event, startTime } : event;
    }
    scheduleAgentRender();
    return;
  }
  if (isKnownCanonicalAgentEvent(event)) return;
  state.agent.events.push(event);
  if (["turn.completed", "turn.failed", "turn.cancelled"].includes(event.type)) {
    observeCompletionEvent(event, currentAgentRun());
  }
  if (["turn.completed", "turn.failed", "turn.cancelled", "session.state", "approval.requested", "approval.resolved"].includes(event.type)) {
    refreshAgentRunMetadata({
      refreshSelfDrivingProjection: ["turn.completed", "turn.failed", "turn.cancelled", "session.state"].includes(event.type),
    }).then(renderAll).catch((err) => console.warn("agent refresh failed", err));
  } else {
    scheduleAgentRender();
  }
}

function appendForgeNotice(notice) {
  if (notice?.source !== "forge" || notice?.type !== "forge.notice") return;
  const scopedRunID = String(notice?.data?.runId || "").trim();
  if (scopedRunID && scopedRunID !== state.agent.activeRunId) return;
  if (isStaleSelfDrivingWaitingNotice(notice)) return;
  if (isSelfDrivingWaitingFinishNotice(notice)) {
    recordSelfDrivingWaitingNoticeWatermark(notice);
    const key = selfDrivingWaitingNoticeKey(notice);
    state.agent.notices = state.agent.notices.filter((existing) =>
      !isSelfDrivingWaitingFinishNotice(existing) || selfDrivingWaitingNoticeKey(existing) !== key
    );
  }
  state.agent.notices.push(notice);
  if (state.agent.notices.length > 20) state.agent.notices.shift();
  if (typeof reconcileAgentNotices === "function") reconcileAgentNotices(state.agent.runs);
  scheduleAgentRender();
  if (isSelfDrivingWaitingFinishNotice(notice) && typeof refreshAgentRunMetadata === "function") {
    refreshAgentRunMetadata({ refreshSelfDrivingProjection: true })
      .then(() => {
        if (state.activeWorkspaceId && state.agent.activeRunId === scopedRunID) renderAll();
      })
      .catch((err) => console.warn("Self-Driving notice projection refresh failed", err));
  }
}

function isKnownCanonicalAgentEvent(event) {
  if (!event?.id) return false;
  if (state.agent.events.some((existing) => existing.id === event.id)) return true;
  const maxLoadedId = state.agent.events.reduce((max, existing) => Math.max(max, existing.id || 0), 0);
  return maxLoadedId > 0 && event.id <= maxLoadedId;
}

function scheduleAgentRender() {
  if (state.agent.renderTimer) return;
  state.agent.renderTimer = window.setTimeout(() => {
    state.agent.renderTimer = null;
    renderTTY();
    refreshIcons();
  }, 80);
}

function clearAgentRenderTimer() {
  if (state.agent.renderTimer) {
    window.clearTimeout(state.agent.renderTimer);
  }
  state.agent.renderTimer = null;
}

function mergeCanonicalAgentEvents(events) {
  const byID = new Map();
  for (const event of events || []) {
    if (Number(event?.id) > 0) byID.set(Number(event.id), event);
  }
  return [...byID.values()].sort((left, right) => Number(left.id) - Number(right.id));
}

function projectAgentTimeline() {
  if (!window.AgentHubEventTimeline?.buildTimeline) {
    throw new Error("AgentHub Event Timeline library is unavailable");
  }
  const visibleEvents = state.agent.events.filter((event) => !AGENT_HIDDEN_EVENT_TYPES.has(event?.type));
  return window.AgentHubEventTimeline.buildTimeline(visibleEvents);
}

function renderAgent() {
  if (typeof reconcileAgentNotices === "function") reconcileAgentNotices(state.agent.runs);
  const controls = $("agentControls");
  const barWrap = $("selfDrivingBarWrap");
  const wrap = $("agentSessionsWrap");
  const activeRun = currentAgentRun();
  const visibleRun = activeRun || state.agent.runs[0] || null;
  controls.hidden = true;
  controls.innerHTML = "";
  const detail = state.details[state.selectedId];
  barWrap.innerHTML = selfDrivingTopBar(detail);
  wrap.innerHTML = `
    <div id="agentSessions" class="agent-session-switcher">
      ${visibleRun ? agentCurrentSessionRow(visibleRun) : `<div class="session-pill"><strong>No sessions yet</strong><span>Start an agent session from the selected task.</span></div>`}
      ${state.agent.historyOpen && state.agent.runs.length ? `
        <div class="agent-session-menu">
          ${state.agent.runs.map(agentSessionMenuRow).join("")}
        </div>
      ` : ""}
    </div>
  `;
}

function selfDrivingStatusReason(run, logs = []) {
  if (!run) return null;
  const text = String(run.conditionReason || run.notificationError?.message || "").trim();
  return text ? { label: "Status", text } : null;
}

// selfDrivingTopBar renders the single, always-visible Self-Driving status and control
// entry at the top of a Task chat. Every open Task gets a persistent On/Off
// switch plus a controller condition that is independent from Session state.
// chip, a one-line truncated summary and the currently legal actions. Longer
// context (revision, profiles, actual Agent, reasons, wake condition) stays
// behind the details toggle so the bar never crowds the chat.
function selfDrivingTopBar(detail) {
  const selected = findResource(state.selectedId);
  if (!selected || selected.type !== "task" || !detail) return "";
  const run = detail.selfDriving || null;
  const presentation = selfDrivingPresentation(run?.condition || "disabled", Boolean(run?.enabled));
  const expanded = Boolean(run && state.agent.selfDrivingExpanded);
  const summary = selfDrivingBarSummary(run, detail);
  const actions = selfDrivingBarActions(detail);
  const toggleLabel = expanded ? "Hide Self-Driving details" : "Show Self-Driving details";
  return `
    <section class="self-driving-bar self-driving-bar-${presentation.key}${expanded ? " expanded" : ""}" role="status" aria-label="Self-Driving: ${escapeHTML(presentation.label)}">
      <div class="self-driving-bar-row">
        <span class="self-driving-bar-title"><i data-lucide="workflow" class="self-driving-title-icon" aria-hidden="true"></i><strong>Self-Driving</strong></span>
        <span class="self-driving-state self-driving-state-${presentation.key}">
          <i data-lucide="${presentation.icon}" class="self-driving-state-icon" aria-hidden="true"></i>
          <span>${escapeHTML(presentation.label)}</span>
        </span>
        ${summary ? `<span class="self-driving-bar-summary" title="${escapeHTML(summary)}">${escapeHTML(summary)}</span>` : ""}
        <span class="self-driving-bar-actions">
          ${actions}
          ${run ? `<button type="button" class="self-driving-bar-toggle" data-self-driving-toggle aria-expanded="${expanded ? "true" : "false"}" aria-controls="selfDrivingBarDetails" title="${toggleLabel}" aria-label="${toggleLabel}">${icon(expanded ? "chevron-up" : "chevron-down", "self-driving-expand-icon")}</button>` : ""}
        </span>
      </div>
      ${run ? `<div class="self-driving-bar-details" id="selfDrivingBarDetails"${expanded ? "" : " hidden"}>${selfDrivingBarDetails(detail)}</div>` : ""}
    </section>
  `;
}

// selfDrivingBarSummary picks the single most useful line of context for the
// collapsed bar; CSS truncates it with an ellipsis and the full text stays
// available via the title attribute and the expanded details.
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

function selfDrivingBarDetails(detail) {
  const run = detail?.selfDriving;
  if (!run) return "";
  const reason = selfDrivingStatusReason(run, detail?.logs);
  const profiles = run.preferredAgentProfiles || [];
  const actual = currentAgentRun();
  const actualSelection = actual?.schedulerTurn && actual.resourceId === detail.id
    ? `${actual.agentProfile ? `${actual.agentProfile} → ` : ""}${actual.agentHubAgentName || ""}`
    : "";
  return `
    <small>Revision ${escapeHTML(String(run.revision))} · Desired state: ${run.enabled ? "On" : "Off"}${profiles.length ? ` · Preferred: ${escapeHTML(profiles.join(" → "))}` : " · Workspace default"}</small>
    ${actualSelection ? `<p>Actual Agent: ${escapeHTML(actualSelection)}${actual.agentSelectionReason ? ` · ${escapeHTML(actual.agentSelectionReason)}` : ""}</p>` : ""}
    ${run.wakeContext?.summary ? `<p>Waiting context: ${escapeHTML(run.wakeContext.summary)}</p>` : ""}
    ${run.wakeContext?.condition ? `<p>Wake condition: ${escapeHTML(run.wakeContext.condition)}${run.wakeContext.fallback ? " (compatibility fallback)" : ""}</p>` : ""}
    ${run.lastOutcome ? `<p>Last outcome: ${escapeHTML(run.lastOutcome.status)}${run.lastOutcome.reason ? ` · ${escapeHTML(run.lastOutcome.reason)}` : ""}</p>` : ""}
    ${reason ? `<p>${escapeHTML(reason.label)}: ${escapeHTML(reason.text)}</p>` : ""}
  `;
}

function selfDrivingPresentation(condition, enabled = false) {
  const presentations = {
    disabled: { label: "Off", icon: "circle-dashed" },
    ready: { label: "Ready", icon: "list-start" },
    waiting: { label: "Waiting", icon: "pause" },
    blocked: { label: "Blocked", icon: "octagon-alert" },
    error: { label: "Error", icon: "circle-x" },
    needs_configuration: { label: "Needs configuration", icon: "settings" },
  };
  const stateName = enabled ? String(condition || "ready").trim().toLowerCase() : "disabled";
  const key = Object.hasOwn(presentations, stateName) ? stateName : "unknown";
  return { key, ...(presentations[key] || { label: stateName || "Unknown", icon: "circle-help" }) };
}

function agentSelectOptions(agents) {
  return agents.map((agent) => `
    <option value="${escapeHTML(agent.id)}" ${state.agent.agentName === agent.id ? "selected" : ""}>${escapeHTML(agent.name || agent.id)}</option>
  `).join("") || `<option value="">No enabled agents</option>`;
}

function agentConfigSummary(agent) {
  if (!agent) return "";
  const parts = [providerName(agent.providerId)];
  if (agent.options?.model) parts.push(agent.options.model);
  return parts.filter(Boolean).join(" · ");
}

function providerName(providerId) {
  const provider = (state.config?.agentHubProviders || state.settings.data?.agentHub?.catalog?.providers || []).find((item) => item.id === providerId);
  return provider?.name || providerId || "Provider";
}

const RUN_STATUS_TONES = {
  starting: "running",
  running: "running",
  waiting_approval: "attention",
  stopping: "attention",
  recovering: "attention",
  stopped: "muted",
  failed: "danger",
  completed: "done",
};

function runStatusBadge(status = "") {
  const tone = RUN_STATUS_TONES[status] || "muted";
  const pulse = tone === "running" || tone === "attention" ? " run-badge-pulse" : "";
  const label = status.replace(/_/g, " ") || "unknown";
  return `<span class="run-badge run-badge-${tone}"><span class="run-badge-dot${pulse}"></span>${escapeHTML(label)}</span>`;
}

function agentCurrentSessionRow(run) {
  return `
    <div class="agent-current-session">
      <button type="button" class="agent-current-run ${state.agent.activeRunId === run.id ? "active" : ""}" data-agent-run="${escapeHTML(run.id)}" aria-expanded="${state.agent.historyOpen ? "true" : "false"}" title="Switch session">
        <span>
          <strong>${escapeHTML(run.title || run.id)}</strong>
          <small>${runStatusBadge(run.status)}<span class="run-badge-time">${escapeHTML(relativeTime(run.updatedAt))}</span></small>
        </span>
        ${icon("chevrons-up-down", "session-select-icon")}
      </button>
    </div>
  `;
}

function agentSessionMenuRow(run) {
  return `
    <button type="button" class="agent-session-menu-row ${state.agent.activeRunId === run.id ? "active" : ""}" data-agent-run="${escapeHTML(run.id)}">
      <span>
        <strong>${escapeHTML(run.title || run.id)}</strong>
        <small>${runStatusBadge(run.status)}<span class="run-badge-time">${escapeHTML(relativeTime(run.updatedAt))}</span></small>
      </span>
    </button>
  `;
}

function agentRunRow(run) {
  return `
    <button class="agent-run-row ${state.agent.activeRunId === run.id ? "active" : ""}" data-agent-run="${escapeHTML(run.id)}">
      <span>
        <strong>${escapeHTML(run.title || run.id)}</strong>
        <small>${runStatusBadge(run.status)}<span class="run-badge-time">${escapeHTML(relativeTime(run.updatedAt))}</span></small>
      </span>
    </button>
  `;
}

function ttyLogHasActiveSelection(log) {
  const selection = window.getSelection?.();
  if (!selection || selection.isCollapsed || selection.rangeCount === 0) return false;
  return selection.getRangeAt(0).intersectsNode(log);
}

function renderTTY(options = {}) {
  const log = $("ttyLog");
  const previousRunId = log.dataset.agentRunId || "";
  const nextRunId = state.agent.activeRunId || "";
  const previousScrollTop = log.scrollTop;
  const explicitStickToBottom = typeof options.stickToBottom === "boolean";
  const stickToBottom = explicitStickToBottom
    ? options.stickToBottom
    : previousRunId !== nextRunId || isTTYNearBottom(log);
  renderTTYComposer();
  // Re-rendering replaces the log DOM and destroys any in-progress text
  // selection. Defer the render while the user is selecting text in the
  // current session log; the selectionchange listener flushes it later.
  if (previousRunId === nextRunId && ttyLogHasActiveSelection(log)) {
    state.agent.renderDeferredForSelection = true;
    return;
  }
  state.agent.renderDeferredForSelection = false;
  if (state.agent.activeRunId) {
    const items = projectAgentTimeline();
    const notices = state.agent.notices.map(forgeNoticeRow).join("");
    const olderButton = state.agent.eventsHasMore
      ? `<button type="button" id="loadOlderAgentEventsButton" class="load-older-events">${state.agent.loadingOlder ? icon("loader-circle") : icon("chevrons-up")}<span>${state.agent.loadingOlder ? "Loading..." : "Load older messages"}</span></button>`
      : "";
    log.innerHTML = items.length || notices || olderButton
      ? `${olderButton}${items.map((item, index) => agentTimelineItemRow(item, index, items)).join("")}${notices}`
      : `<div class="tty-empty">${icon("loader-circle")}<strong>Waiting for agent events</strong></div>`;
  } else {
    const text = state.agent.runs.length ? "Select an Agent Run to view its events." : "Start an agent session.";
    log.innerHTML = `<div class="tty-empty">${icon("bot")}<strong>No agent run selected</strong><span>${escapeHTML(text)}</span></div>`;
  }
  log.dataset.agentRunId = nextRunId;
  $("loadOlderAgentEventsButton")?.addEventListener("click", () => {
    loadOlderAgentEvents().catch((err) => toast(err.message));
  });
  bindAgentToolGroupEvents();
  if (stickToBottom) {
    log.scrollTop = log.scrollHeight;
  } else {
    log.scrollTop = previousScrollTop;
  }
}

function bindAgentToolGroupEvents() {
  document.querySelectorAll(".agent-tool-group[data-tool-group-key]").forEach((details) => {
    details.querySelector(":scope > summary")?.addEventListener("click", () => {
      state.agent.toolGroupOpen.set(details.dataset.toolGroupKey, !details.open);
    });
  });
}

function isTTYNearBottom(log) {
  const distanceFromBottom = log.scrollHeight - log.scrollTop - log.clientHeight;
  return distanceFromBottom <= 32;
}

function agentComposerAgentKey() {
  return JSON.stringify(enabledAgentConfigs().map((agent) => ({
    id: agent.id || "",
    name: agent.name || "",
    model: agent.model || "",
  })));
}

function renderTTYComposer(options = {}) {
  state.agent.skipTTYDraftSync = false;
  closeNewSessionChooserForResourceLock();
  const activeRun = currentAgentRun();
  if (activeRun) restoreAgentDraftForRun(activeRun);
  const live = isLiveAgentRun(activeRun);
  const resourceId = activeRun?.resourceId || selectedAgentResourceId();
  const stopTurnPending = isAgentTurnStopping(activeRun);
  const sessionStopping = isAgentSessionStopping(activeRun) || activeRun?.status === "stopping";
  window.ForgeSvelteIslands?.renderComposer({
    identity: `${state.activeWorkspaceId}:${resourceId}:${activeRun?.id || "none"}:${state.agent.ttyDraftKey || ""}`,
    workspaceId: state.activeWorkspaceId,
    resourceId,
    runId: activeRun?.id || "",
    runStatus: activeRun?.status || "",
    live,
    canResume: Boolean(activeRun && !live && (activeRun.agentHubSessionId || activeRun.sourceExternalId)),
    draft: state.agent.ttyDraft || "",
    draftKey: state.agent.ttyDraftKey || "",
    draftResetVersion: state.agent.ttyDraftResetVersion || 0,
    unavailableReason: live ? agentInputUnavailableReason(activeRun, isAgentSessionReady(activeRun)) : "",
    sending: Boolean(state.agent.sendingInput),
    externalLocked: selectedResourceHasExternalLock(),
    internalLocked: selectedResourceHasInternalLock(),
    agents: svelteAgentOptions(),
    selectedAgentId: selectedAgentConfig()?.id || "",
    chooserOpen: Boolean(state.agent.agentChooserOpen),
    sessionStarting: Boolean(state.agent.newSessionStarting),
    actionsOpen: Boolean(state.agent.sessionActionsOpen),
    canEndTurn: Boolean(activeRun && (isAgentTurnInterruptible(activeRun) || stopTurnPending)),
    endingTurn: stopTurnPending,
    closingSession: sessionStopping,
    selfDrivingRemainsEnabled: isSelfDrivingSessionCloseTarget(activeRun),
    selfDrivingDisabling: Boolean(state.agent.selfDrivingDisabling),
    onDraft: (text, draftContext) => updateAgentDraftFromSvelte(text, draftContext),
    onSend: submitTTYInput,
    onOpenUpload: openAgentUploadDialog,
    onToggleChooser: () => {
      if (state.agent.newSessionStarting || !enabledAgentConfigs().length || selectedResourceHasExternalLock()) return;
      state.agent.agentChooserOpen = !state.agent.agentChooserOpen;
      renderTTYComposer();
    },
    onChooseAgent: (id) => startAgentRun(id).catch((err) => toast(err.message)),
    onToggleActions: () => { state.agent.sessionActionsOpen = !state.agent.sessionActionsOpen; renderTTYComposer(); },
    onResume: () => resumeAgentRun().catch((err) => toast(err.message)),
    onEndTurn: () => stopAgentTurn().catch((err) => toast(err.message)),
    onCloseSession: closeCurrentAgentSession,
    onIconsChanged: refreshIcons,
  });
}

function isAgentSessionReady(run) {
  if (!isLiveAgentRun(run)) return false;
  if (run.status !== "starting") return true;
  if (state.agent.events.some((event) => event.type === "session.state" && event.data?.state === "ready")) return true;
  return state.agent.eventsHasMore && run.status !== "starting";
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

function agentComposerActions(options = {}) {
  const externalResourceLocked = selectedResourceHasExternalLock();
  const internalResourceLocked = selectedResourceHasInternalLock();
  const collapsible = Boolean(options.collapsible);
  const standalone = Boolean(options.standalone);
  const actionsClass = `tty-session-actions${collapsible ? " collapsible" : ""}${standalone ? " tty-standalone-actions" : ""}${externalResourceLocked || !collapsible || state.agent.sessionActionsOpen ? " open" : ""}`;
  if (externalResourceLocked) {
    return `
      <div class="${actionsClass}">
        ${externalResourceLockNotice()}
      </div>
    `;
  }
  const selectedAgent = selectedAgentConfig();
  const agents = enabledAgentConfigs();
  const chooserOpen = state.agent.agentChooserOpen && agents.length > 0 && !internalResourceLocked;
  const sessionStarting = Boolean(state.agent.newSessionStarting);
  const noAgentReason = "No enabled agents are available. Configure an AgentHub Agent in Settings.";
  const sessionButtonTitle = sessionStarting
    ? "Creating a new AgentHub session..."
    : agents.length === 0
      ? noAgentReason
      : "Choose an Agent to start a new session.";
  const sessionButtonDisabled = sessionStarting || agents.length === 0;
  const sessionButtonDisabledAttribute = sessionButtonDisabled ? " disabled" : "";
  const resumeMarkup = options.includeResume ? `<button type="button" id="agentResumeButton" class="tty-primary-action" title="Resume Session" aria-label="Resume Session">${icon("rotate-ccw")}<span>Resume Session</span></button>` : "";
  const newSessionMarkup = internalResourceLocked ? "" : `
    <div class="tty-new-session-control">
      <button type="button" id="agentStartButton" class="tty-new-session-button" title="${escapeHTML(sessionButtonTitle)}" aria-label="${escapeHTML(sessionButtonTitle)}" aria-haspopup="menu" aria-expanded="${chooserOpen ? "true" : "false"}" aria-controls="ttyAgentMenu"${sessionStarting ? ` aria-busy="true"` : ""}${sessionButtonDisabledAttribute}>
        ${icon(sessionStarting ? "loader-circle" : "plus")}<span>${sessionStarting ? "Creating Session..." : "New Session"}</span>
      </button>
      ${chooserOpen ? `
        <div id="ttyAgentMenu" class="tty-agent-menu" role="menu" aria-label="Choose an Agent"${sessionStarting ? ` aria-busy="true"` : ""}>
          ${agents.map((agent) => `
            <button type="button" role="menuitem" class="${agent.id === selectedAgent?.id ? "active" : ""}" data-agent-choice="${escapeHTML(agent.id)}" aria-label="${escapeHTML(`${agentDisplayName(agent)} — ${agentConfigSummary(agent)}`)}"${sessionStarting ? " disabled" : ""}>
              <span>${escapeHTML(agentDisplayName(agent))}</span>
              <small>${escapeHTML(agentConfigSummary(agent))}</small>
            </button>
          `).join("")}
        </div>
      ` : ""}
    </div>
  `;
  const content = [resumeMarkup, newSessionMarkup].filter(Boolean).join("");
  if (!content) return "";
  return `
    <div class="${actionsClass}"${standalone ? ` role="toolbar" aria-label="Session actions"` : ""}>
      ${content}
    </div>
  `;
}

// sessionControlComposerActions renders the end-turn and close-session
// buttons that control the live AgentHub session.
function sessionControlComposerActions(options = {}) {
  const includeEndTurn = Boolean(options.includeEndTurn);
  const endingTurn = Boolean(options.endingTurn);
  const includeClose = Boolean(options.includeClose);
  const closingSession = Boolean(options.closingSession);
  const selfDrivingRemainsEnabled = Boolean(options.selfDrivingRemainsEnabled);
  const selfDrivingDisabling = Boolean(options.selfDrivingDisabling);
  const endTurnPending = endingTurn || closingSession || selfDrivingDisabling;
  const endTurnLabel = endingTurn
    ? "Ending turn…"
    : closingSession
      ? "Closing session…"
      : selfDrivingDisabling
        ? "Disabling Self-Driving…"
        : "End current turn; keep the Session open.";
  const closePending = endingTurn || closingSession || selfDrivingDisabling;
  const closeLabel = closingSession
    ? "Closing session…"
    : endingTurn
      ? "Ending turn…"
      : selfDrivingDisabling
        ? "Disabling Self-Driving…"
        : selfDrivingRemainsEnabled
          ? "Close this Session; Self-Driving stays On and may create a replacement."
          : "Close session; end the entire AgentHub Session.";
  const endTurnMarkup = includeEndTurn ? `
    <button type="button" id="agentEndTurnButton" class="tty-composer-action tty-end-turn-button"${endTurnPending ? " disabled aria-busy=\"true\"" : ""} title="${escapeHTML(endTurnLabel)}" aria-label="${escapeHTML(endTurnLabel)}">
      ${icon(endTurnPending ? "loader-circle" : "pause")}
    </button>` : "";
  const closeSessionMarkup = includeClose ? `
    <button type="button" id="agentCloseSessionButton" class="tty-composer-action tty-close-session-button"${closePending ? " disabled aria-busy=\"true\"" : ""} title="${escapeHTML(closeLabel)}" aria-label="${escapeHTML(closeLabel)}">
      ${icon(closingSession || selfDrivingDisabling ? "loader-circle" : "square")}
    </button>` : "";
  return `${endTurnMarkup}${closeSessionMarkup}`;
}

function agentDisplayName(agent) {
  return agent?.name || agent?.id || "Agent";
}

// selfDrivingBarActions renders the persistent desired-state switch. Session
// state never disables it; only an in-flight persistence request does.
function selfDrivingBarActions(detail) {
  if (!detail || detail.type !== "task") return "";
  const selfDriving = detail.selfDriving || null;
  const enabled = Boolean(selfDriving?.enabled);
  const pending = Boolean(state.agent.selfDrivingSaving || state.agent.selfDrivingDisabling);
  const label = enabled ? "Turn Self-Driving off" : "Turn Self-Driving on";
  return `<button type="button" id="selfDrivingSwitch" class="self-driving-switch" role="switch" aria-checked="${enabled ? "true" : "false"}" aria-label="${label}" title="${label}"${pending ? " disabled aria-busy=\"true\"" : ""}><span class="self-driving-switch-track"><span class="self-driving-switch-thumb"></span></span><span>${enabled ? "On" : "Off"}</span></button>`;
}

function selectedResourceLockComposerKey() {
  const selected = selectedLockableResource();
  if (!selected) return "no-resource";
  const external = selectedResourceHasExternalLock() ? "external-lock" : "unlocked";
  const internal = selectedResourceHasInternalLock() ? "internal-lock" : "unlocked";
  return `${selected.type}:${selected.id}:${external}:${internal}`;
}

function selfDrivingNeedsConfiguration(detail) {
  return !detail?.selfDriving?.agentName && !(detail?.selfDriving?.preferredAgentProfiles || []).length;
}

async function setChatSelfDrivingDesiredState(options = {}) {
  return mutateAgentSession(async () => {
    const selected = findResource(state.selectedId);
    const detail = selected ? (state.details[selected.id] || selected) : null;
    if (!detail || detail.type !== "task") throw new Error("Select a task first.");
    const enabled = options.enabled === undefined ? true : Boolean(options.enabled);
    state.agent.selfDrivingSaving = true;
    renderAgent();
    renderTTYComposer();
    bindAgentEvents();
    refreshIcons();
    try {
      const body = {
        resourceId: selected.id,
        enabled,
      };
      if (options.configured) {
        body.agentName = String(options.agentName || "").trim();
        body.prompt = String(options.runInstructions || "");
        body.completionCriteria = String(options.completionCriteria || "");
      }
      const response = await api(`/api/workspaces/${state.activeWorkspaceId}/self-driving`, {
        method: "PUT",
        body: JSON.stringify(body),
      });
      await Promise.all([
        loadAgentRuns(),
        refreshTreeAfterAgentSessionMutation(),
        fetchDetail(selected.id, state.activeWorkspaceId, { logsLimit: RESOURCE_LOG_INITIAL_LIMIT }).then((fresh) => {
          if (fresh && state.activeWorkspaceId) applyResourceDetail(fresh, "head");
        }),
      ]);
      renderAll();
      toast(enabled ? "Self-Driving enabled. The Scheduler will reconcile asynchronously." : response.notificationError ? `Self-Driving disabled. ${response.notificationError}` : "Self-Driving disabled. The current Turn and Session were left open.");
    } finally {
      state.agent.selfDrivingSaving = false;
      renderAgent();
      renderTTYComposer();
      bindAgentEvents();
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
    returnFocus: null,
  };
}

function selfDrivingIdleSessionForResource(resourceId) {
  return state.agent.runs.find((run) =>
    run.resourceId === resourceId && isLiveAgentRun(run) && run.status === "idle" &&
    !run.schedulerTurn && String(run.agentHubSessionId || "").trim(),
  ) || null;
}

function openSelfDrivingConfigDialog() {
  const selected = findResource(state.selectedId);
  const detail = selected ? (state.details[selected.id] || selected) : null;
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
  state.modalEnter = "selfDriving";
  state.selfDrivingDialog = {
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
    returnFocus: document.activeElement instanceof HTMLElement ? document.activeElement : null,
  };
  renderSelfDrivingConfigDialog();
}

function closeSelfDrivingConfigDialog() {
  const dialog = state.selfDrivingDialog;
  if (!dialog.open || dialog.submitting) return;
  const returnFocus = dialog.returnFocus;
  state.selfDrivingDialog = selfDrivingDialogInitialState();
  renderSelfDrivingConfigDialog();
  if (returnFocus && document.contains(returnFocus)) returnFocus.focus({ preventScroll: true });
}

function renderSelfDrivingConfigDialog() {
  const dialog = state.selfDrivingDialog;
  window.ForgeSvelteIslands?.renderSelfDrivingDialog({
    open: Boolean(dialog.open),
    identity: `${dialog.identity || 0}:${dialog.resourceId || ""}`,
    resourceId: dialog.resourceId || "",
    reuseCurrentSession: Boolean(dialog.reuseCurrentSession),
    agents: svelteAgentOptions(),
    draft: { agentName: dialog.agentName || "", runInstructions: dialog.runInstructions || "" },
    submitting: Boolean(dialog.submitting),
    error: dialog.error || "",
    unknown: Boolean(dialog.unknown),
    onClose: closeSelfDrivingConfigDialog,
    onSubmit: submitSelfDrivingConfigDialog,
    onIconsChanged: refreshIcons,
  });
}

function bindSelfDrivingConfigDialogEvents() {
  const form = $("selfDrivingConfigForm");
  if (!form) return;
  form.addEventListener("input", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement)) return;
    if (target.name === "agentName" && !state.selfDrivingDialog.reuseCurrentSession) state.selfDrivingDialog.agentName = target.value;
    if (target.name === "runInstructions") state.selfDrivingDialog.runInstructions = target.value;
    state.selfDrivingDialog.error = "";
  });
  form.addEventListener("submit", submitSelfDrivingConfigDialog);
  document.querySelectorAll("[data-self-driving-dialog-close]").forEach((node) => node.addEventListener("click", closeSelfDrivingConfigDialog));
  if (!state.selfDrivingDialog.submitting) {
    (form.elements.agentName || form.elements.runInstructions)?.focus({ preventScroll: true });
  }
}

async function submitSelfDrivingConfigDialog(draft) {
  const dialog = state.selfDrivingDialog;
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
  const workspaceId = state.activeWorkspaceId;
  const resourceId = dialog.resourceId;
  renderSelfDrivingConfigDialog();
  try {
    await setChatSelfDrivingDesiredState({
      configured: true,
      agentName: dialog.agentName,
      runInstructions: dialog.runInstructions,
      completionCriteria: dialog.completionCriteria,
    });
    if (dialogIdentity !== state.selfDrivingDialog.identity || workspaceId !== state.activeWorkspaceId || resourceId !== state.selectedId) return;
    const returnFocus = dialog.returnFocus;
    state.selfDrivingDialog = selfDrivingDialogInitialState();
    renderSelfDrivingConfigDialog();
    if (returnFocus && document.contains(returnFocus)) returnFocus.focus({ preventScroll: true });
  } catch (err) {
    if (dialogIdentity !== state.selfDrivingDialog.identity) return;
    dialog.submitting = false;
    const message = String(err?.message || err || "Self-Driving could not be enabled.");
    dialog.error = message;
    dialog.unknown = !Number.isFinite(Number(err?.status)) || Number(err.status) >= 500 || message.includes("outcome may be unknown") || message.includes("was updated but the start message failed");
    renderSelfDrivingConfigDialog();
  }
}

function renderSettingsModal() {
  const data = state.settings.data || {
    workspaces: state.config?.workspaces || [],
    activeId: state.activeWorkspaceId,
    agents: state.config?.agents || [],
    agentProfiles: state.config?.agentProfiles || [],
  };
  const hub = data.agentHub || {};
  const status = hub.status || {};
  const catalog = hub.catalog || { providers: [], agents: [] };
  const preferences = state.notifications.settings || readNotificationSettings();
  state.notifications.settings = preferences;
  window.ForgeSvelteIslands?.renderSettings({
    open: Boolean(state.settings.open),
    identity: `${state.settings.identity || 0}`,
    dataVersion: state.settings.dataVersion || 0,
    initialTab: state.settings.tab || "workspace",
    workspaces: data.workspaces || [],
    activeWorkspaceId: data.activeId || state.activeWorkspaceId,
    workspaceIcons: [DEFAULT_WORKSPACE_ICON, ...WORKSPACE_ICONS],
    workspaceIconSavingId: state.settings.workspaceIconSavingId || "",
    userName: currentUserName(),
    agentHub: {
      configuredEndpoint: hub.configuredEndpoint || "http://127.0.0.1:4646",
      connected: Boolean(hub.connected), compatible: Boolean(hub.compatible), error: hub.error || "",
      apiVersion: status.apiVersion || "", version: status.version || "", capabilities: status.capabilities || [],
      providers: catalog.providers || [], agents: catalog.agents || [],
    },
    profiles: (data.agentProfiles || []).map((profile) => ({ key: profile.key || "", description: profile.description || "", agentName: profile.agentName || "" })),
    agents: svelteAgentOptions(),
    notifications: { browser: Boolean(preferences.browser), sound: Boolean(preferences.sound), permission: notificationPermission(), permissionError: state.notifications.permissionError || "", soundError: state.notifications.soundError || "" },
    onClose: closeSettings,
    onAddWorkspace: async (draft) => { syncSettingsDraftFromSvelte(draft); await submitSettingsWorkspace(); },
    onRemoveWorkspace: async (id, draft) => { syncSettingsDraftFromSvelte(draft); await removeSettingsWorkspace(id); },
    onWorkspaceIcon: async (id, iconId, draft) => { syncSettingsDraftFromSvelte(draft); await updateSettingsWorkspaceIcon(id, iconId); },
    onSaveUser: async (name) => {
      const normalized = normalizeUserName(name);
      if (!saveStoredUserName(normalized)) throw new Error("User name could not be saved in this browser.");
      toast(normalized === "User" ? "User name reset to User." : `User name saved as ${normalized}.`);
      return normalized;
    },
    onSaveAgentHub: async (draft) => { syncSettingsDraftFromSvelte(draft); await saveAgentSettings(); },
    onBrowserNotifications: setBrowserNotificationsEnabled,
    onCompletionSound: setCompletionSoundEnabled,
    onToast: toast,
    onIconsChanged: refreshIcons,
  });
}

function settingsTabButton(id, iconName, label) {
  const draftTab = id === "agents" || id === "profiles";
  const dirty = draftTab && state.settings.agentDirty;
  return `
    <button type="button" class="settings-tab ${state.settings.tab === id ? "active" : ""}${dirty ? " dirty" : ""}" data-settings-tab="${id}">
      ${icon(iconName)}
      <span>${escapeHTML(label)}</span>
      ${draftTab ? `<span class="settings-tab-dot" aria-hidden="true"></span>` : ""}
    </button>
  `;
}

function settingsActivePanel(data) {
  if (state.settings.tab === "user") return settingsUserPanel();
  if (state.settings.tab === "agenthub") return settingsAgentHubPanel(data);
  if (state.settings.tab === "profiles") return settingsProfilesPanel(data);
  if (state.settings.tab === "notifications") return settingsNotificationsPanel();
  return settingsWorkspacePanel(data);
}

function settingsUserPanel() {
  return `
    <div class="settings-panel settings-user-panel" data-settings-section="user">
      <div class="settings-panel-header">
        <h2>User</h2>
        <p>Your name belongs to this browser and device. Forge sends it with your messages, but never stores it in the workspace or server settings.</p>
      </div>
      <section class="settings-agent-section">
        <form id="settingsUserForm" class="settings-user-form">
          <label for="settingsUserName">Name</label>
          <input id="settingsUserName" value="${escapeHTML(currentUserName())}" maxlength="${USER_NAME_MAX_LENGTH}" autocomplete="name" placeholder="User" />
          <small>Messages are identified as this name with the USER role. Leaving the field empty restores the default name, User.</small>
          <div class="settings-form-actions">
            <button type="submit">${icon("save")}<span>Save</span></button>
          </div>
        </form>
      </section>
    </div>
  `;
}

function settingsNotificationsPanel() {
  const preferences = state.notifications.settings || readNotificationSettings();
  state.notifications.settings = preferences;
  const permission = notificationPermission();
  const browserDisabled = permission === "unsupported" || permission === "denied";
  return `
    <div class="settings-panel settings-notifications-panel" data-settings-section="notifications">
      <div class="settings-panel-header">
        <h2>Notifications</h2>
        <p>These preferences belong to this browser and device. They are stored locally and are not sent to Forge Server.</p>
      </div>
      <section class="settings-agent-section">
        <label class="settings-notification-option">
          <span class="settings-notification-copy"><strong>Browser notifications</strong><small>Show a Chrome notification when a turn completes outside the visible, focused resource.</small></span>
          <input id="settingsBrowserNotifications" type="checkbox" ${preferences.browser ? "checked" : ""} ${browserDisabled ? "disabled" : ""} />
        </label>
        <div class="settings-notification-status">Chrome permission: <strong>${escapeHTML(notificationPermissionLabel(permission))}</strong></div>
        ${permission === "denied" ? `<small class="settings-notification-help">Restore permission in Chrome site settings. Forge will not repeatedly request a denied permission.</small>` : ""}
        ${state.notifications.permissionError ? `<small class="settings-notification-help">${escapeHTML(state.notifications.permissionError)}</small>` : ""}
      </section>
      <section class="settings-agent-section">
        <label class="settings-notification-option">
          <span class="settings-notification-copy"><strong>Completion sound</strong><small>Play one short local sound for each new notification. This setting is independent from browser notifications.</small></span>
          <input id="settingsCompletionSound" type="checkbox" ${preferences.sound ? "checked" : ""} />
        </label>
        ${state.notifications.soundError ? `<small class="settings-notification-help">${escapeHTML(state.notifications.soundError)}</small>` : `<small class="settings-notification-help">Chrome may require the enable action to happen from a user gesture.</small>`}
      </section>
    </div>
  `;
}

function settingsAgentHubPanel(data) {
  const hub = data.agentHub || {};
  const status = hub.status || {};
  const catalog = hub.catalog || { providers: [], agents: [], probes: [] };
  const connected = Boolean(hub.connected);
  const compatible = Boolean(hub.compatible);
  return `
    <div class="settings-panel settings-agent-panel" data-settings-section="agenthub">
      <div class="settings-panel-header">
        <h2>AgentHub</h2>
        <p>Forge connects to AgentHub for providers, agents, and durable sessions. Provider and agent definitions are read-only here.</p>
      </div>
      <section class="settings-agent-section">
        <div class="settings-section-heading">
          <h3>Connection</h3>
          <span class="settings-pill">${connected && compatible ? "Compatible" : connected ? "Incompatible" : "Unavailable"}</span>
        </div>
        <label class="settings-default-agent">
          <span>Endpoint</span>
          <input id="settingsAgentHubEndpoint" value="${escapeHTML(hub.configuredEndpoint || "http://127.0.0.1:4646")}" />
        </label>
        <small>${escapeHTML(hub.error || `API ${status.apiVersion || "unknown"} · AgentHub ${status.version || "unknown"}`)}</small>
        <div class="settings-provider-list">
          ${(status.capabilities || []).map((capability) => `<span class="settings-pill">${escapeHTML(capability)}</span>`).join("")}
        </div>
      </section>
      <section class="settings-agent-section">
        <div class="settings-section-heading">
          <h3>Catalog</h3>
          <span>${catalog.agents?.length || 0} agents · ${catalog.providers?.length || 0} providers</span>
        </div>
        <div class="settings-agent-list">
          ${(catalog.agents || []).map((agent) => `
            <div class="settings-service-row">
              <div class="settings-provider-main">
                <span class="settings-agent-mark">${escapeHTML((agent.name || "A").slice(0, 1).toUpperCase())}</span>
                <span><strong>${escapeHTML(agent.name)}</strong><small>${escapeHTML(agent.providerId)} · ${agent.available ? "Available" : escapeHTML(agent.unavailableReason || "Unavailable")}</small></span>
              </div>
            </div>
          `).join("") || `<div class="settings-empty">No AgentHub agents available.</div>`}
        </div>
      </section>
      ${settingsAgentSaveBar()}
    </div>
  `;
}

function settingsWorkspacePanel(data) {
  return `
    <div class="settings-panel">
      <div class="settings-panel-header">
        <h2>Workspaces</h2>
        <p>Add existing AgentWorkspace folders or create and initialize a new Forge workspace.</p>
      </div>
      <form id="settingsWorkspaceForm" class="settings-path-form">
        <input id="settingsWorkspacePath" value="${escapeHTML(state.settings.workspacePath)}" placeholder="/Users/me/Documents/AgentWorkspace" />
        <label class="settings-check">
          <input id="settingsWorkspaceCreate" type="checkbox" ${state.settings.createWorkspace ? "checked" : ""} />
          <span>Create directory and run forge init</span>
        </label>
        <button type="submit">${icon("plus")}<span>${state.settings.createWorkspace ? "Create" : "Add"}</span></button>
      </form>
      <div class="settings-list">
        ${(data.workspaces || []).map((workspace) => {
          const option = workspaceIconOption(workspace);
          const pickerOpen = state.settings.workspaceIconPickerId === workspace.id;
          const saving = state.settings.workspaceIconSavingId === workspace.id;
          return `
          <div class="settings-workspace-entry">
            <div class="settings-list-row">
              <div class="settings-row-main">
                <span class="settings-workspace-mark">${workspaceIconMarkup(workspace)}</span>
                <span>
                  <strong>${escapeHTML(workspace.name)}</strong>
                  <small>${escapeHTML(workspace.path)}</small>
                </span>
              </div>
              <div class="settings-row-actions">
                ${workspace.id === data.activeId ? `<span class="settings-pill">Active</span>` : ""}
                <button type="button" class="settings-workspace-icon-button" data-workspace-icon-picker="${escapeHTML(workspace.id)}" aria-expanded="${pickerOpen}" title="Change workspace icon" ${saving ? "disabled" : ""}>
                  ${workspaceIconMarkup(workspace)}<span>${saving ? "Saving..." : escapeHTML(option.label)}</span>${icon("chevron-down")}
                </button>
                <button type="button" class="settings-danger-button" data-remove-workspace="${escapeHTML(workspace.id)}" title="Remove workspace" ${saving ? "disabled" : ""}>${icon("trash-2")}</button>
              </div>
            </div>
            ${pickerOpen ? settingsWorkspaceIconPicker(workspace) : ""}
          </div>
        `;
        }).join("") || `<div class="settings-empty">No workspaces managed by Forge GUI.</div>`}
      </div>
    </div>
  `;
}

function settingsWorkspaceIconPicker(workspace) {
  const selected = workspaceIconOption(workspace).id;
  return `
    <div class="settings-workspace-icon-picker" role="radiogroup" aria-label="Icon for ${escapeHTML(workspace.name || "workspace")}">
      ${[DEFAULT_WORKSPACE_ICON, ...WORKSPACE_ICONS].map((option) => `
        <button type="button" role="radio" aria-checked="${option.id === selected}" class="${option.id === selected ? "selected" : ""}" data-workspace-icon="${escapeHTML(option.id)}" data-workspace-id="${escapeHTML(workspace.id)}" title="${escapeHTML(option.label)}">
          <img src="${escapeHTML(option.src)}" alt="" aria-hidden="true" />
          <span>${escapeHTML(option.label)}</span>
          ${option.id === selected ? icon("check") : ""}
        </button>
      `).join("")}
    </div>
  `;
}

function settingsProfilesPanel(data) {
  return `
    <div class="settings-panel settings-agent-panel" data-settings-section="profiles">
      <div class="settings-panel-header">
        <h2>Agent Profiles</h2>
        <p>Profiles map chat and Self-Driving preferences to AgentHub agents. System profiles are reserved; the scheduler profile is a future scheduling route and does not start a Scheduler Agent. Custom profile keys must be unique.</p>
      </div>
      ${settingsAgentProfilesSection(data)}
      ${settingsAgentSaveBar()}
    </div>
  `;
}

function settingsAgentSaveBar() {
  const dirty = Boolean(state.settings.agentDirty);
  return `
    <div class="settings-form-actions settings-save-bar">
      <span class="settings-save-hint${dirty ? " visible" : ""}" id="settingsSaveHint">${dirty ? "Unsaved changes" : ""}</span>
      <button type="button" id="settingsSaveButton" ${dirty ? "" : "disabled"}>${icon("save")}<span>Save All</span></button>
    </div>
  `;
}

function settingsAgentProfilesSection(data) {
  const profiles = data.agentProfiles || [];
  const agents = data.agents || [];
	const draftAgentName = agents.some((agent) => agent.id === state.settings.newProfile.agentName)
	  ? state.settings.newProfile.agentName
	  : agents[0]?.id || "";
	  state.settings.newProfile.agentName = draftAgentName;
	  const targetOptions = (selected) => {
	    const selectedValue = String(selected || "");
	    const known = agents.some((agent) => agent.id === selectedValue);
	    const unknown = selectedValue && !known
	      ? `<option value="${escapeHTML(selectedValue)}" selected>${escapeHTML(selectedValue)} (Unavailable)</option>`
	      : "";
	    const options = agents.map((agent) => {
	      const name = agent.name || agent.id;
	      const suffix = agent.available === false ? ` (${agent.unavailableReason || "Unavailable"})` : "";
	      return `<option value="${escapeHTML(agent.id)}" ${agent.id === selectedValue ? "selected" : ""}>${escapeHTML(name + suffix)}</option>`;
	    }).join("");
	    return unknown + options;
	  };
  return `
    <section class="settings-agent-section">
      <div class="settings-section-heading">
        <h3>Profile Routes</h3>
        <span>${profiles.length} routes</span>
      </div>
      <div class="settings-profile-table">
        <div class="settings-profile-row settings-profile-head">
          <span>Profile key</span><span>Summary</span><span>AgentHub Agent</span><span></span>
        </div>
	        ${profiles.map((profile, index) => {
	          const system = SYSTEM_AGENT_PROFILE_KEYS.has(String(profile.key || "").trim().toLowerCase());
	          return `
	          <div class="settings-profile-row${system ? " settings-profile-system" : ""}" data-profile-index="${index}">
	            <input data-profile-field="key" value="${escapeHTML(profile.key || "")}" placeholder="kimi" aria-label="Profile key" ${system ? "disabled" : ""} />
	            <input data-profile-field="description" value="${escapeHTML(profile.description || "")}" placeholder="Kimi coding agent" aria-label="Summary" ${system ? "disabled" : ""} />
	            <select data-profile-field="agentName" aria-label="AgentHub Agent">${targetOptions(profile.agentName)}</select>
	            ${system ? `<span class="settings-profile-system-label">System</span>` : `<button type="button" class="settings-danger-button" data-remove-profile="${index}" title="Delete Profile">${icon("trash-2")}</button>`}
	          </div>
	        `;
        }).join("")}
        <div class="settings-profile-row settings-profile-new">
          <input id="settingsNewProfileKey" value="${escapeHTML(state.settings.newProfile.key)}" placeholder="New key" aria-label="New profile key" />
          <input id="settingsNewProfileDescription" value="${escapeHTML(state.settings.newProfile.description)}" placeholder="New profile summary" aria-label="New profile summary" />
          <select id="settingsNewProfileAgent" aria-label="New profile agent" ${agents.length ? "" : "disabled"}>${targetOptions(draftAgentName) || `<option value="">No Agents</option>`}</select>
          <button type="button" id="settingsAddProfileButton" ${agents.length ? "" : "disabled"}>${icon("plus")}<span>Add</span></button>
        </div>
      </div>
    </section>
  `;
}

function bindSettingsEvents() {
  document.querySelectorAll("[data-settings-close]").forEach((node) => {
    node.addEventListener("click", closeSettings);
  });
  document.querySelectorAll("[data-settings-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      state.settings.tab = button.dataset.settingsTab;
      renderSettingsModal();
    });
  });
  $("settingsWorkspacePath")?.addEventListener("input", (event) => {
    state.settings.workspacePath = event.target.value;
  });
  $("settingsWorkspaceCreate")?.addEventListener("change", (event) => {
    state.settings.createWorkspace = event.target.checked;
    renderSettingsModal();
  });
  $("settingsWorkspaceForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    submitSettingsWorkspace().catch((err) => toast(err.message));
  });
  $("settingsUserForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = normalizeUserName($("settingsUserName")?.value);
    if (!saveStoredUserName(name)) {
      toast("User name could not be saved in this browser.");
      return;
    }
    const input = $("settingsUserName");
    if (input) input.value = name;
    toast(name === "User" ? "User name reset to User." : `User name saved as ${name}.`);
  });
  document.querySelectorAll("[data-remove-workspace]").forEach((button) => {
    button.addEventListener("click", () => removeSettingsWorkspace(button.dataset.removeWorkspace).catch((err) => toast(err.message)));
  });
  document.querySelectorAll("[data-workspace-icon-picker]").forEach((button) => {
    button.addEventListener("click", () => {
      state.settings.workspaceIconPickerId = state.settings.workspaceIconPickerId === button.dataset.workspaceIconPicker ? "" : button.dataset.workspaceIconPicker;
      renderSettingsModal();
    });
  });
  document.querySelectorAll("[data-workspace-icon]").forEach((button) => {
    button.addEventListener("click", () => {
      updateSettingsWorkspaceIcon(button.dataset.workspaceId, button.dataset.workspaceIcon).catch((err) => toast(err.message));
    });
  });
  $("settingsSaveButton")?.addEventListener("click", () => {
    saveAgentSettings().catch((err) => toast(err.message));
  });
  $("settingsBrowserNotifications")?.addEventListener("change", (event) => {
    setBrowserNotificationsEnabled(event.target.checked);
  });
  $("settingsCompletionSound")?.addEventListener("change", (event) => {
    setCompletionSoundEnabled(event.target.checked);
  });
  $("settingsAddProfileButton")?.addEventListener("click", addSettingsProfile);
  document.querySelectorAll("[data-remove-profile]").forEach((button) => {
    button.addEventListener("click", () => removeSettingsProfile(Number(button.dataset.removeProfile)));
  });
  $("settingsNewProfileKey")?.addEventListener("input", (event) => { state.settings.newProfile.key = event.target.value; });
  $("settingsNewProfileDescription")?.addEventListener("input", (event) => { state.settings.newProfile.description = event.target.value; });
	  $("settingsNewProfileAgent")?.addEventListener("change", (event) => { state.settings.newProfile.agentName = event.target.value; });
  $("settingsAgentHubEndpoint")?.addEventListener("input", markAgentSettingsDirty);
  document.querySelectorAll(".settings-profile-row [data-profile-field]").forEach((field) => {
    field.addEventListener("input", markAgentSettingsDirty);
    field.addEventListener("change", markAgentSettingsDirty);
  });
}

function agentTimelineItemRow(item, index, items) {
  if (item.kind === "message") {
    const role = item.role === "assistant" || item.role === "system" || item.role === "agent" ? item.role : "user";
    const isAssistant = role === "assistant";
    const content = isAssistant
      ? `<div class="agent-message-content markdown-rendered">${renderMarkdown(item.text)}</div>`
      : `<p>${escapeHTML(item.text)}</p>`;
    const steerTag = item.steer ? `<span class="agent-message-tag">steer</span>` : "";
    const roleTag = !isAssistant ? `<span class="agent-message-tag agent-message-role-tag">${role}</span>` : "";
    const sourceSession = role === "agent" && item.sender?.sessionId
      ? `<span class="agent-message-source" title="${escapeHTML(item.sender.sessionId)}">from session ${escapeHTML(item.sender.sessionId)}</span>`
      : "";
    return `
      <div class="agent-message-row ${isAssistant ? "assistant final" : role}">
        <div class="agent-message-main">
          <div class="agent-message-meta">
            <strong>${escapeHTML(agentMessageSenderName(item))}</strong>
            ${roleTag}
            ${steerTag}
            ${sourceSession}
            <span>${escapeHTML(agentClockTime(item.time))}</span>
          </div>
          <div class="agent-message-bubble">${content}</div>
        </div>
      </div>
    `;
  }
  if (item.kind === "thinking") {
    return `
      <details class="agent-reasoning-note"${item.active ? " open" : ""}>
        <summary>${icon("brain-circuit")}<span>${escapeHTML(agentThinkingTitle(item))}</span><span class="agent-reasoning-chevron">${icon("chevron-right")}</span></summary>
        <p>${escapeHTML(item.text)}</p>
      </details>
    `;
  }
  if (item.kind === "tools") return agentTimelineToolsRow(item, index === items.length - 1);
  if (item.kind === "approval") return agentTimelineApprovalRow(item);
  if (item.kind === "lifecycle") {
    const tone = item.tone || "muted";
    const iconName = tone === "ok" ? "check-circle" : tone === "danger" ? "triangle-alert" : tone === "info" ? "info" : "clock";
    return `<div class="agent-system-note agent-lifecycle-${escapeHTML(tone)}">${icon(iconName)}<span>${escapeHTML(item.text)}</span><span class="agent-note-time">${escapeHTML(agentClockTime(item.time))}</span></div>`;
  }
  if (item.kind === "error") {
    return `<div class="agent-event error"><div>${icon("triangle-alert")}<strong>Provider error</strong></div><p>${escapeHTML(item.text)}</p></div>`;
  }
  if (item.kind === "unknown") {
    return `
      <details class="agent-tool-item agent-unknown-event">
        <summary>${icon("info")}<span>Unhandled event: ${escapeHTML(item.type)}</span><small>${escapeHTML(relativeTime(item.time))}</small></summary>
        <pre>${escapeHTML(item.preview || "This event carries no payload.")}</pre>
      </details>
    `;
  }
  return "";
}

function agentTimelineToolsRow(group, isLast) {
  const calls = group.calls || [];
  const key = agentTimelineToolGroupKey(group);
  const userOpen = state.agent.toolGroupOpen.get(key);
  const open = typeof userOpen === "boolean"
    ? userOpen
    : isLast || calls.some((call) => call.status === "running");
  const summaries = calls.map(agentTimelineToolSummary);
  const preview = summaries.slice(0, 2).join(" · ");
  const remaining = Math.max(0, summaries.length - 2);
  return `
    <details class="agent-tool-group" data-tool-group-key="${escapeHTML(key)}"${open ? " open" : ""}>
      <summary>
        <span class="agent-tool-group-icon">${icon("wrench")}</span>
        <span class="agent-tool-group-title">${calls.length} tool ${calls.length === 1 ? "call" : "calls"}</span>
        <span class="agent-tool-group-preview">${escapeHTML(preview)}${remaining ? ` · +${remaining} more` : ""}</span>
        <span class="agent-tool-group-chevron">${icon("chevron-right")}</span>
      </summary>
      <div class="agent-tool-list">
        ${calls.map(agentTimelineToolCallRow).join("")}
      </div>
    </details>
  `;
}

function agentTimelineToolGroupKey(group) {
  return `${state.agent.activeRunId || "run"}:${group.key || group.time || "tools"}`;
}

function agentTimelineToolCallRow(call) {
  const statusIcon = call.status === "running"
    ? icon("loader-circle")
    : call.status === "failed" ? icon("x-circle") : icon("check-circle");
  const details = [call.error, call.output, call.rawPreview].filter(Boolean).join("\n\n");
  return `
    <details class="agent-tool-item agent-tool-${escapeHTML(call.status || "completed")}">
      <summary>
        ${statusIcon}
        <span>${escapeHTML(agentTimelineToolSummary(call))}</span>
        <small>${escapeHTML(call.method || "tool")}</small>
      </summary>
      ${details ? `<pre>${escapeHTML(details)}</pre>` : ""}
    </details>
  `;
}

function agentTimelineToolSummary(call) {
  return [call.name, call.summary].filter(Boolean).join(" · ") || "Tool call";
}

function agentTimelineApprovalRow(item) {
  const detail = item.detail ? `<p>${escapeHTML(item.detail)}</p>` : "";
  const question = item.question ? `<p class="approval-question">${escapeHTML(item.question)}</p>` : "";
  const options = Array.isArray(item.options) ? item.options : [];
  const draftKey = agentApprovalDraftKey(item.approvalId);
  const draft = state.agent.approvalDrafts.get(draftKey) || "";
  const optionActions = options.map((option) => {
    const label = option.name || humanizeApprovalKind(option.kind) || option.optionId;
    const rejectClass = String(option.kind || "").startsWith("reject") ? " secondary-button" : "";
    return `<button data-agent-approval="${escapeHTML(item.approvalId)}" data-option-id="${escapeHTML(option.optionId)}" class="approval-option${rejectClass}">${escapeHTML(label)}</button>`;
  }).join("");
  const answerActions = options.length
    ? `<div class="approval-options">${optionActions}</div>`
    : `
      <div class="approval-actions">
        <button data-agent-approval="${escapeHTML(item.approvalId)}" data-decision="accept">${icon("check")}<span>Allow once</span></button>
        <button data-agent-approval="${escapeHTML(item.approvalId)}" data-decision="decline" class="secondary-button">${icon("x")}<span>Decline</span></button>
      </div>
    `;
  const customReply = item.question
    ? `
      <form class="approval-reply" data-agent-approval-reply-form="${escapeHTML(item.approvalId)}">
        <input data-agent-approval-reply="${escapeHTML(item.approvalId)}" value="${escapeHTML(draft)}" placeholder="Reply with a custom answer…" aria-label="Custom reply">
        <button type="submit"${draft.trim() ? "" : " disabled"}>Send</button>
      </form>
    `
    : "";
  const actions = item.status === "pending"
    ? `${answerActions}${customReply}`
    : `<p>${escapeHTML(`${item.decision || (item.status === "accepted" ? "Allowed" : "Declined")}${item.reply ? `: ${item.reply}` : ""}`)}</p>`;
  return `
    <div class="agent-event approval">
      <div>${icon("shield-question")}<strong>${escapeHTML(item.title)}</strong></div>
      ${question}
      ${detail}
      ${actions}
    </div>
  `;
}

function agentApprovalDraftKey(approvalId) {
  return `${state.agent.activeRunId || "run"}:${approvalId || "approval"}`;
}

function humanizeApprovalKind(kind) {
  return String(kind || "").replace(/[_-]+/g, " ").trim();
}

function agentMessageSenderName(item) {
  if (item.role === "assistant") {
    const run = currentAgentRun();
    const agents = state.config?.agents || [];
    const configured = agents.find((agent) => agent.id === run?.agentHubAgentName);
    return agentDisplayName(configured || selectedAgentConfig());
  }
  if (item.role === "system" || item.role === "agent") {
    const name = String(item.sender?.name || item.sender?.id || "").trim();
    if (name) return name;
    return item.role === "system" ? "System" : "Agent";
  }
  const name = String(item.sender?.name || item.sender?.id || "").trim();
  return name || "User";
}

function agentClockTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return "";
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function agentThinkingTitle(item) {
  if (item.active) return "Thinking…";
  const duration = agentThinkingDuration(item.startTime, item.time);
  return duration ? `Thought for ${duration}` : "Thought";
}

function agentThinkingDuration(start, end) {
  if (!start || !end) return "";
  const from = new Date(start).getTime();
  const to = new Date(end).getTime();
  if (!Number.isFinite(from) || !Number.isFinite(to) || to < from) return "";
  const seconds = Math.round((to - from) / 1000);
  if (seconds < 60) return `${seconds} ${seconds === 1 ? "second" : "seconds"}`;
  return `${Math.floor(seconds / 60)}m${seconds % 60}s`;
}

function forgeNoticeRow(notice) {
  const level = notice?.data?.level === "error" ? "error" : "system";
  return `<div class="agent-event ${level}"><div>${icon(level === "error" ? "triangle-alert" : "info")}<strong>Forge</strong></div><p>${escapeHTML(notice?.data?.text || "")}</p></div>`;
}

function updateAgentDraftFromSvelte(text, context) {
  if (!context || context.workspaceId !== state.activeWorkspaceId || context.runId !== state.agent.activeRunId || context.draftKey !== state.agent.ttyDraftKey) return;
  updateAgentDraft(text);
}

function closeCurrentAgentSession() {
  const run = currentAgentRun();
  if (!isSelfDrivingSessionCloseTarget(run)) {
    stopAgentRun().catch((err) => toast(err.message));
    return;
  }
  if (window.confirm("Self-Driving is On. Close this Session while keeping Self-Driving On? The Scheduler may create a replacement Session.")) {
    stopAgentRun().catch((err) => toast(err.message));
    return;
  }
  if (window.confirm("Disable Self-Driving and close this Session instead?")) {
    disableSelectedSelfDriving().then(() => stopAgentRun()).catch((err) => toast(err.message));
  }
}

function bindAgentEvents() {
  document.querySelector(".agent-session-menu")?.addEventListener("click", (event) => {
    event.stopPropagation();
  });
  const selfDrivingSwitch = $("selfDrivingSwitch");
  if (selfDrivingSwitch) selfDrivingSwitch.onclick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (state.agent.selfDrivingSaving || state.agent.selfDrivingDisabling) return;
    const selected = findResource(state.selectedId);
    const detail = selected ? (state.details[selected.id] || selected) : null;
    const enabled = Boolean(detail?.selfDriving?.enabled);
    if (enabled) disableSelectedSelfDriving().catch((err) => toast(err.message));
    else if (selfDrivingNeedsConfiguration(detail)) openSelfDrivingConfigDialog();
    else setChatSelfDrivingDesiredState({ enabled: true }).catch((err) => toast(err.message));
  };
  document.querySelectorAll("[data-self-driving-toggle]").forEach((toggle) => {
    toggle.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      state.agent.selfDrivingExpanded = !state.agent.selfDrivingExpanded;
      renderAgent();
      bindAgentEvents();
      refreshIcons();
    });
  });
  document.querySelectorAll("[data-agent-run]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const runId = button.dataset.agentRun;
      if (runId === state.agent.activeRunId && button.classList.contains("agent-current-run")) {
        state.agent.historyOpen = !state.agent.historyOpen;
        state.agent.optionsOpen = false;
        state.agent.agentChooserOpen = false;
        renderAgent();
        bindAgentEvents();
        refreshIcons();
        return;
      }
      switchAgentRun(runId).catch((err) => toast(err.message));
    });
  });
  document.querySelectorAll("[data-agent-approval]").forEach((button) => {
    button.addEventListener("click", () => {
      const reply = button.dataset.optionId
        ? { optionId: button.dataset.optionId }
        : { decision: button.dataset.decision };
      resolveAgentApproval(button.dataset.agentApproval, reply).catch((err) => toast(err.message));
    });
  });
  document.querySelectorAll("[data-agent-approval-reply]").forEach((input) => {
    input.addEventListener("input", () => {
      state.agent.approvalDrafts.set(agentApprovalDraftKey(input.dataset.agentApprovalReply), input.value);
      const submit = input.form?.querySelector('button[type="submit"]');
      if (submit) submit.disabled = !input.value.trim();
    });
  });
  document.querySelectorAll("[data-agent-approval-reply-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const requestId = form.dataset.agentApprovalReplyForm;
      const input = form.querySelector("[data-agent-approval-reply]");
      const text = input?.value.trim() || "";
      if (!text) return;
      resolveAgentApproval(requestId, { text }).catch((err) => toast(err.message));
    });
  });
}

function focusAgentChoice() {
  const choices = Array.from(document.querySelectorAll("[data-agent-choice]"));
  const choice = choices.find((button) => button.dataset.agentChoice === state.agent.agentName) || choices[0];
  choice?.focus({ preventScroll: true });
}

async function startAgentRun(agentName = "") {
  if (state.agent.newSessionStarting) return;
  return mutateAgentSession(async () => {
    if (!state.activeWorkspaceId) throw new Error("Select a workspace first.");
    const selected = findResource(state.selectedId);
    if (typeof selectedResourceHasExternalLock === "function" && selectedResourceHasExternalLock()) {
      throw new Error(EXTERNAL_RESOURCE_LOCK_MESSAGE);
    }
    const requestedAgentName = String(agentName || "").trim();
    const agent = requestedAgentName
      ? enabledAgentConfigs().find((candidate) => candidate.id === requestedAgentName)
      : selectedAgentConfig();
    if (!agent) throw new Error("Select an enabled agent first.");
    state.agent.agentName = agent.id;
    state.agent.newSessionStarting = true;
    renderTTYComposer();
    bindAgentEvents();
    refreshIcons();
    try {
      const response = await api(`/api/workspaces/${state.activeWorkspaceId}/agent/runs`, {
        method: "POST",
        body: JSON.stringify({
          agentName: agent.id,
          userName: currentUserName(),
          resourceId: selected?.id || "",
          title: selected?.title || workspaceName(),
          prompt: "",
          cwd: agentDefaultCwd(),
        }),
      });
      state.agent.draftPrompt = "";
      state.agent.ttyDraft = "";
      state.agent.ttyMultiline = false;
      state.agent.ttyDraftKey = "";
      state.agent.ttyDraftWorkspaceId = "";
      state.agent.ttyDraftResourceId = "";
      state.agent.ttyDraftRunId = "";
      state.agent.ttyDraftVersion++;
      state.agent.optionsOpen = false;
      state.agent.agentChooserOpen = false;
      state.agent.historyOpen = false;
      state.agent.activeRunId = response.run.id;
      await Promise.all([loadAgentRuns(), refreshTreeAfterAgentSessionMutation()]);
      renderAll();
      toast("Agent session started.");
    } finally {
      state.agent.newSessionStarting = false;
      renderTTYComposer();
      bindAgentEvents();
      refreshIcons();
    }
  });
}

function agentInputSelfDrivingProjection(run) {
  const selected = findResource(state.selectedId);
  const detail = selected ? (state.details[selected.id] || selected) : null;
  if (!selected || selected.type !== "task" || !run || run.resourceId !== selected.id) return null;
  const selfDriving = detail?.selfDriving || null;
  return {
    resourceId: selected.id,
    selfDrivingProjectionSet: true,
    expectedSelfDrivingRevision: Number(selfDriving?.revision) || 0,
    expectedSelfDrivingCondition: String(selfDriving?.condition || "").trim().toLowerCase(),
  };
}

async function sendAgentInput(text) {
  const run = currentAgentRun();
  return sendAgentInputForContext(text, {
    workspaceId: state.activeWorkspaceId,
    resourceId: run?.resourceId || "",
    runId: state.agent.activeRunId,
    draftKey: state.agent.ttyDraftKey,
  });
}

async function sendAgentInputForContext(text, context) {
  if (!context?.runId) throw new Error("Start or select an agent run first.");
  if (typeof selectedResourceHasExternalLock === "function" && selectedResourceHasExternalLock()) {
    throw new Error(EXTERNAL_RESOURCE_LOCK_MESSAGE);
  }
  const run = currentAgentRun();
  if (context.workspaceId !== state.activeWorkspaceId || context.runId !== run?.id || context.resourceId !== (run.resourceId || "") || context.draftKey !== state.agent.ttyDraftKey) {
    throw new Error("The selected Workspace or Session changed before the message could be sent.");
  }
  const projection = agentInputSelfDrivingProjection(run);
  const body = { text, userName: currentUserName() };
  if (projection) {
    Object.assign(body, projection);
  }
  return api(`/api/workspaces/${context.workspaceId}/agent/runs/${context.runId}/input`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

function openAgentUploadDialog() {
  const run = currentAgentRun();
  if (!run || !isLiveAgentRun(run)) {
    toast("Start or resume an agent session before uploading files.");
    return;
  }
  const input = $("ttyInput");
  if (input) updateAgentDraft(input.value);
  state.modalEnter = "upload";
  state.uploadDialog = {
    open: true,
    identity: ++uploadDialogIdentity,
    runId: run.id,
    items: [],
    nextId: 1,
  };
  renderAgentUploadDialog();
}

function closeAgentUploadDialog(paths = [], context = {}) {
  if (!state.uploadDialog.open) return;
  const sameContext = context.workspaceId === state.activeWorkspaceId && context.runId === state.agent.activeRunId;
  const shouldSkipDraftSync = paths.length > 0 && sameContext && state.uploadDialog.runId === state.agent.activeRunId;
  if (shouldSkipDraftSync) {
    updateAgentDraft(appendUploadedPaths(state.agent.ttyDraft, paths));
    state.agent.ttyDraftResetVersion++;
  }
  discardAgentUploadDialog();
  const composer = $("ttyComposer");
  if (composer) delete composer.dataset.composerKey;
  renderTTYComposer({ skipDraftSync: shouldSkipDraftSync });
  bindAgentEvents();
  $("ttyInput")?.focus({ preventScroll: true });
  refreshIcons();
}

function discardAgentUploadDialog() {
  state.uploadDialog = {
    open: false,
    identity: ++uploadDialogIdentity,
    runId: "",
    items: [],
    nextId: 1,
  };
  renderAgentUploadDialog();
}

function appendUploadedPaths(draft, paths) {
  const block = paths.filter(Boolean).join("\n");
  if (!block) return draft;
  if (!draft) return block;
  return `${draft}${draft.endsWith("\n") ? "" : "\n"}${block}`;
}

function uploadInProgress() {
  return state.uploadDialog.items.some((item) => item.status === "queued" || item.status === "uploading");
}

function renderAgentUploadDialog() {
  const dialog = state.uploadDialog;
  window.ForgeSvelteIslands?.renderUploadDialog({
    open: Boolean(dialog.open),
    identity: `${dialog.identity || 0}:${state.activeWorkspaceId}:${dialog.runId || ""}`,
    workspaceId: state.activeWorkspaceId,
    runId: dialog.runId || "",
    onDone: closeAgentUploadDialog,
    onIconsChanged: refreshIcons,
  });
}

function uploadItemRow(item) {
  const presentation = {
    queued: { icon: "clock-3", label: "Queued" },
    uploading: { icon: "loader-circle", label: `Uploading ${item.progress}%` },
    success: { icon: "circle-check", label: "Uploaded" },
    error: { icon: "triangle-alert", label: "Failed" },
  }[item.status] || { icon: "file", label: item.status };
  return `
    <div class="upload-item upload-item-${escapeHTML(item.status)}">
      <div class="upload-item-heading">
        ${icon(presentation.icon)}
        <span><strong>${escapeHTML(item.name)}</strong><small>${formatBytes(item.size)}</small></span>
        <em>${escapeHTML(presentation.label)}</em>
      </div>
      <div class="upload-progress" role="progressbar" aria-label="${escapeHTML(item.name)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${item.progress}">
        <span style="width: ${item.progress}%"></span>
      </div>
      ${item.status === "success" ? `<small class="upload-result-path">${escapeHTML(item.path)}</small>` : ""}
      ${item.status === "error" ? `<small class="upload-error">${escapeHTML(item.error || "Upload failed")}</small>` : ""}
    </div>
  `;
}

function uploadSummary(items) {
  if (items.length === 0) return "No files selected.";
  const succeeded = items.filter((item) => item.status === "success").length;
  const failed = items.filter((item) => item.status === "error").length;
  return `${succeeded} uploaded${failed ? ` · ${failed} failed` : ""}. Successful paths will be added to the chat input.`;
}

function bindAgentUploadDialogEvents() {
  const input = $("agentUploadInput");
  const choose = $("agentUploadChooseButton");
  if (choose && input) choose.onclick = () => input.click();
  if (input) input.onchange = () => enqueueAgentUploads(input.files);
  const dropZone = $("agentUploadDropZone");
  if (dropZone) {
    dropZone.ondragover = (event) => {
      event.preventDefault();
      dropZone.classList.add("dragging");
    };
    dropZone.ondragleave = () => dropZone.classList.remove("dragging");
    dropZone.ondrop = (event) => {
      event.preventDefault();
      enqueueAgentUploads(event.dataTransfer?.files);
    };
    dropZone.onkeydown = (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        input?.click();
      }
    };
  }
  document.querySelectorAll("[data-upload-close]").forEach((node) => {
    node.addEventListener("click", closeAgentUploadDialog);
  });
}

function clipboardUploadFiles(clipboardData) {
  const itemFiles = Array.from(clipboardData?.items || [])
    .filter((item) => item.kind === "file")
    .map((item) => item.getAsFile())
    .filter(Boolean);
  return itemFiles.length ? itemFiles : Array.from(clipboardData?.files || []);
}

function enqueueAgentUploads(files) {
  const selected = Array.from(files || []);
  if (!state.uploadDialog.open || selected.length === 0) return;
  const items = selected.map((file, index) => ({
    id: state.uploadDialog.nextId++,
    file,
    name: file.name || clipboardUploadName(file, index),
    size: file.size || 0,
    progress: 0,
    status: "queued",
    path: "",
    error: "",
  }));
  state.uploadDialog.items.push(...items);
  renderAgentUploadDialog();
  items.forEach(uploadAgentFile);
}

function clipboardUploadName(file, index) {
  const extensions = { "image/png": "png", "image/jpeg": "jpg", "image/gif": "gif", "image/webp": "webp", "application/pdf": "pdf" };
  const extension = extensions[file.type] || "bin";
  return `clipboard-${Date.now()}-${index + 1}.${extension}`;
}

function uploadAgentFile(item) {
  item.status = "uploading";
  renderAgentUploadDialog();
  const request = new XMLHttpRequest();
  const endpoint = `/api/workspaces/${encodeURIComponent(state.activeWorkspaceId)}/agent/runs/${encodeURIComponent(state.uploadDialog.runId)}/uploads`;
  request.open("POST", endpoint);
  request.responseType = "json";
  request.upload.addEventListener("progress", (event) => {
    if (!event.lengthComputable) return;
    item.progress = Math.min(99, Math.round((event.loaded / event.total) * 100));
    renderAgentUploadDialog();
  });
  request.addEventListener("load", () => {
    const response = request.response || {};
    if (request.status >= 200 && request.status < 300) {
      item.status = "success";
      item.progress = 100;
      item.path = response.path || "";
      item.name = response.name || item.name;
    } else {
      item.status = "error";
      item.error = response.error || `${request.status} ${request.statusText}`;
    }
    renderAgentUploadDialog();
  });
  request.addEventListener("error", () => {
    item.status = "error";
    item.error = "Network error while uploading.";
    renderAgentUploadDialog();
  });
  const body = new FormData();
  body.append("file", item.file, item.name);
  request.send(body);
}

async function stopAgentRun() {
  if (!state.agent.activeRunId || state.agent.sessionStopping || state.agent.turnStopping) return;
  const run = currentAgentRun();
  if (!isLiveAgentRun(run) || run.status === "stopping") return;
  return mutateAgentSession(async () => {
    const runId = state.agent.activeRunId;
    state.agent.sessionStopping = true;
    state.agent.sessionStoppingRunId = runId;
    renderTTYComposer();
    bindAgentEvents();
    refreshIcons();
    try {
      const result = await closeAgentRun(runId);
      await Promise.all([loadAgentRuns(), refreshTreeAfterAgentSessionMutation()]);
      renderAll();
      toast("Agent session closed. Self-Driving desired state was not changed.");
    } catch (err) {
      // A failed or ambiguous close must re-read the run and tree before the
      // control becomes available again; never clear a draft as a side effect.
      try {
        await Promise.all([loadAgentRuns(), refreshTreeAfterAgentSessionMutation()]);
        renderAll();
      } catch (_) {
        // Preserve the original close error for the user.
      }
      throw err;
    } finally {
      state.agent.sessionStopping = false;
      state.agent.sessionStoppingRunId = "";
      renderTTYComposer();
      bindAgentEvents();
      refreshIcons();
    }
  });
}

async function disableSelectedSelfDriving() {
  if (state.agent.selfDrivingDisabling) return;
  const selected = findResource(state.selectedId);
  const detail = selected ? (state.details[selected.id] || selected) : null;
  if (!detail || detail.type !== "task") return;
  return mutateAgentSession(async () => {
    state.agent.selfDrivingDisabling = true;
    renderAgent();
    renderTTYComposer();
    bindAgentEvents();
    refreshIcons();
    try {
      const response = await api(`/api/workspaces/${state.activeWorkspaceId}/self-driving`, {
        method: "PUT",
        body: JSON.stringify({ resourceId: detail.id, enabled: false }),
      });
      await Promise.all([loadAgentRuns(), refreshTreeAfterAgentSessionMutation()]);
      renderAll();
      toast(response.notificationError ? `Self-Driving disabled. ${response.notificationError}` : "Self-Driving disabled. The Agent Session remains open.");
    } catch (err) {
      try {
        await Promise.all([loadAgentRuns(), refreshTreeAfterAgentSessionMutation()]);
        renderAll();
      } catch (_) {
        // Preserve the original cancellation error for the user.
      }
      throw err;
    } finally {
      state.agent.selfDrivingDisabling = false;
      renderAgent();
      renderTTYComposer();
      bindAgentEvents();
      refreshIcons();
    }
  });
}

async function stopAgentTurn() {
  if (!state.agent.activeRunId || state.agent.turnStopping || state.agent.sessionStopping) return;
  const run = currentAgentRun();
  if (!isAgentTurnInterruptible(run)) return;
  return mutateAgentSession(async () => {
    const runId = state.agent.activeRunId;
    state.agent.turnStopping = true;
    state.agent.turnStoppingRunId = runId;
    renderTTYComposer();
    bindAgentEvents();
    refreshIcons();
    try {
      await api(`/api/workspaces/${state.activeWorkspaceId}/agent/runs/${runId}/interrupt`, { method: "POST" });
      await Promise.all([loadAgentRuns(), refreshTreeAfterAgentSessionMutation()]);
      renderAll();
      toast("Turn ended. The AgentHub Session remains open.");
    } catch (err) {
      // A stale status or ambiguous AgentHub response must converge to the
      // server projection before the button becomes available again.
      try {
        await Promise.all([loadAgentRuns(), refreshTreeAfterAgentSessionMutation()]);
        renderAll();
      } catch (_) {
        // Preserve the original interrupt error for the user.
      }
      throw err;
    } finally {
      state.agent.turnStopping = false;
      state.agent.turnStoppingRunId = "";
      renderTTYComposer();
      bindAgentEvents();
      refreshIcons();
    }
  });
}

async function switchAgentRun(runId) {
  if (!runId || runId === state.agent.activeRunId) return;
  return mutateAgentSession(async () => {
    flushAgentDraft();
    const previousRun = currentAgentRun();
    if (previousRun && isLiveAgentRun(previousRun) && !previousRun.schedulerTurn) {
      await closeAgentRun(previousRun.id);
    }
    state.agent.activeRunId = runId;
    clearAgentDraftMemory();
    state.agent.historyOpen = false;
    state.agent.approvalDrafts.clear();
    await Promise.all([loadAgentRuns(), refreshTreeAfterAgentSessionMutation()]);
    renderAll();
  });
}

async function closeAgentRun(runId) {
  if (!runId) return;
  return api(`/api/workspaces/${state.activeWorkspaceId}/agent/runs/${runId}/stop`, { method: "POST" });
}

async function resumeAgentRun() {
  if (!state.agent.activeRunId) return;
  return mutateAgentSession(async () => {
    if (typeof selectedResourceHasExternalLock === "function" && selectedResourceHasExternalLock()) {
      throw new Error(EXTERNAL_RESOURCE_LOCK_MESSAGE);
    }
    flushAgentDraft();
    const response = await api(`/api/workspaces/${state.activeWorkspaceId}/agent/runs/${state.agent.activeRunId}/resume`, { method: "POST" });
    state.agent.activeRunId = response.run.id;
    restoreAgentDraftForRun(response.run);
    state.agent.historyOpen = false;
    await Promise.all([loadAgentRuns(), refreshTreeAfterAgentSessionMutation()]);
    renderAll();
    toast("Agent session resumed.");
  });
}

async function resolveAgentApproval(requestId, reply) {
  if (!state.agent.activeRunId || !requestId) return;
  await api(`/api/workspaces/${state.activeWorkspaceId}/agent/runs/${state.agent.activeRunId}/approval`, {
    method: "POST",
    body: JSON.stringify({ requestId, ...reply }),
  });
  state.agent.approvalDrafts.delete(agentApprovalDraftKey(requestId));
  await loadAgentRuns();
  renderAll();
}

function currentAgentRun() {
  return state.agent.runs.find((run) => run.id === state.agent.activeRunId) || null;
}

function isLiveAgentRun(run) {
  return ["starting", "running", "waiting_approval", "idle", "stopping", "recovering"].includes(run?.status);
}

function isAgentTurnInterruptible(run) {
  return ["running", "waiting_approval"].includes(run?.status);
}

function isSelfDrivingSessionCloseTarget(run) {
  const resourceID = String(run?.resourceId || "").trim();
  if (!resourceID) return false;
  const resource = findResource(resourceID);
  const selfDriving = resource?.selfDriving;
  return Boolean(selfDriving?.enabled);
}

function isAgentTurnStopping(run) {
  return Boolean(state.agent.turnStopping && state.agent.turnStoppingRunId === run?.id);
}

function isAgentSessionStopping(run) {
  return Boolean(state.agent.sessionStopping && state.agent.sessionStoppingRunId === run?.id);
}

async function submitTTYInput(rawText, context) {
  if (state.agent.sendingInput) return { accepted: false, clear: false };
  if (!String(rawText || "").trim()) return { accepted: false, clear: false };
  const sendingRun = currentAgentRun();
  if (!sendingRun) return { accepted: false, clear: false };
  restoreAgentDraftForRun(sendingRun);
  if (context.workspaceId !== state.activeWorkspaceId || context.runId !== state.agent.activeRunId || context.draftKey !== state.agent.ttyDraftKey) {
    throw new Error("The selected Workspace or Session changed before the message could be sent.");
  }
	updateAgentDraft(rawText);
  const sendWorkspaceId = context.workspaceId;
  const sendRunId = context.runId;
  const sendResourceId = context.resourceId;
  const sendDraftKey = context.draftKey;
  const sendDraftVersion = state.agent.ttyDraftVersion;
  state.agent.sendingInput = true;
  try {
    const result = await sendAgentInputForContext(rawText, context);
    let clearedDraft = false;
    if (result?.status === "accepted") {
      clearedDraft = clearAgentDraftAfterAccepted({
        workspaceId: sendWorkspaceId,
        runId: sendRunId,
        key: sendDraftKey,
        text: rawText,
        version: sendDraftVersion,
      });
      if (clearedDraft) {
        state.agent.ttyDraftResetVersion++;
      }
			try {
				if (typeof refreshAgentInputProjection === "function") {
					await refreshAgentInputProjection(sendWorkspaceId, sendResourceId);
				}
			} catch (refreshError) {
				toast(`Message accepted, but the view could not refresh: ${refreshError.message}`);
			}
		}
    return { accepted: result?.status === "accepted", clear: clearedDraft };
  } finally {
    state.agent.sendingInput = false;
    renderTTYComposer();
    refreshIcons();
  }
}

function resizeTTYInput(input) {
  if (!input) return;
  const maxHeight = 160;
  input.style.height = "auto";
  const nextHeight = Math.min(input.scrollHeight, maxHeight);
  input.style.height = `${nextHeight}px`;
  input.style.overflowY = input.scrollHeight > maxHeight ? "auto" : "hidden";
}

function defaultAgentPrompt() {
  const selected = findResource(state.selectedId);
  if (selected) {
    return `Work on ${selected.id}: ${selected.title}. Inspect the task context, make the necessary code changes, and verify them.`;
  }
  return "Inspect this Forge workspace and suggest the next useful implementation step.";
}

function agentDefaultCwd() {
  const selected = findResource(state.selectedId);
  if (!selected) return "";
  return selected.path || "";
}

function selectedAgentResourceId() {
  if (state.selectedId === "workspace") return "workspace";
  return findResource(state.selectedId)?.id || "";
}

function relativeTime(value) {
  if (!value) return "unknown";
  const time = new Date(value).getTime();
  if (!Number.isFinite(time)) return value;
  const seconds = Math.max(0, Math.round((Date.now() - time) / 1000));
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
  state.modalEnter = "create";
  state.createDialog = {
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
    submitting: false,
  };
  renderCreateDialog();
}

function closeCreateDialog() {
  if (state.createDialog.submitting) return;
  createPreviewGeneration++;
  createPreviewController?.abort();
  createPreviewController = null;
  createPreviewPendingKey = "";
  state.createDialog = {
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
    submitting: false,
  };
  renderCreateDialog();
}

function renderCreateDialog() {
  const dialog = state.createDialog;
  window.ForgeSvelteIslands?.renderCreateDialog({
    open: Boolean(dialog.open),
    identity: `${dialog.identity || 0}:${dialog.type}:${dialog.projectId}`,
    workspaceId: state.activeWorkspaceId,
    draft: createDialogDraft(dialog),
    templates: dialog.type === "task" ? (state.details[dialog.projectId]?.templates || []) : [],
    agents: svelteAgentOptions(),
    profileKeys: (state.config?.agentProfiles || []).map((profile) => profile.key),
    preview: dialog.preview,
    previewKey: dialog.previewKey || "",
    previewing: Boolean(dialog.previewing),
    previewError: dialog.previewError || "",
    templateDigest: dialog.templateDigest || "",
    submitting: Boolean(dialog.submitting),
    onClose: closeCreateDialog,
    onPreview: refreshCreateTaskPreview,
    onSubmit: submitCreateDialog,
    previewRequestKey: (draft) => JSON.stringify(createTaskRequest({ ...dialog, ...createDialogStateFromDraft(draft), templateDigest: "" })),
    onConfirmTemplateSwitch: () => window.confirm("Discard edited template fields and switch templates?"),
    onIconsChanged: refreshIcons,
  });
}

function createDialogDraft(dialog) {
  return {
    type: dialog.type === "task" ? "task" : "project",
    projectId: dialog.projectId || "",
    templateName: dialog.templateName || "",
    templateFields: { ...(dialog.templateFields || {}) },
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
    showOptions: Boolean(dialog.showOptions),
  };
}

function createDialogStateFromDraft(draft) {
  return {
    type: draft.type,
    projectId: draft.projectId,
    templateName: draft.templateName,
    templateFields: { ...(draft.templateFields || {}) },
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
    showOptions: Boolean(draft.showOptions),
  };
}

function syncCreateDialogDraft(draft) {
  if (!draft || !state.createDialog.open) return;
  if (String(draft.templateName || "") !== String(state.createDialog.templateName || "")) {
    state.createDialog.preview = null;
    state.createDialog.templateDigest = "";
    state.createDialog.previewError = "";
    state.createDialog.previewKey = "";
    state.createDialog.previewing = false;
    createPreviewGeneration++;
    createPreviewController?.abort();
    createPreviewController = null;
    createPreviewPendingKey = "";
  }
  Object.assign(state.createDialog, createDialogStateFromDraft(draft));
}

function createDialogPreviewRequestKey(dialog) {
  return JSON.stringify(createTaskRequest({ ...dialog, templateDigest: "" }));
}

function createDialogPreviewStale(dialog) {
  if (!dialog.templateName) return false;
  if (!dialog.preview || !dialog.previewKey) return true;
  return dialog.previewKey !== createDialogPreviewRequestKey(dialog);
}

function createTaskPreviewPane(dialog) {
  const stale = createDialogPreviewStale(dialog);
  const edited = dialog.editedMarkdown != null && dialog.preview && dialog.editedMarkdown !== dialog.preview.markdown;
  return `
    <div class="create-task-preview-pane" role="tabpanel" aria-label="Task preview">
      <div class="template-preview-actions">
        <button type="button" class="secondary compact" data-create-preview="true" ${dialog.previewing || dialog.submitting ? "disabled" : ""}>${dialog.previewing ? "Rendering..." : "Refresh"}</button>
        ${dialog.templateDigest ? `<small>Template ${escapeHTML(dialog.templateName)} · ${escapeHTML(dialog.templateDigest)}</small>` : ""}
      </div>
      ${dialog.previewError ? `<p class="create-task-preview-error">${escapeHTML(dialog.previewError)}</p>` : ""}
      ${!dialog.previewError && stale && dialog.preview ? `<p class="create-task-preview-hint">Fields changed since this preview was rendered. Refresh to update.</p>` : ""}
      ${dialog.preview ? `
        <section class="template-preview" aria-label="Rendered task content">
          <h4>${escapeHTML(dialog.preview.title)}</h4>
          <textarea name="previewMarkdown" class="create-task-preview-editor" aria-label="Task markdown" spellcheck="false">${escapeHTML(dialog.editedMarkdown ?? dialog.preview.markdown)}</textarea>
          <div class="template-preview-actions" data-preview-edited-note ${edited ? "" : "hidden"}>
            <small>Modified — the task will be created with this edited content instead of the template output.</small>
            <button type="button" class="secondary compact" data-reset-preview-edits="true">Reset edits</button>
          </div>
          <small data-preview-edit-hint ${edited ? "hidden" : ""}>Edit the content above to override the template output for this task.</small>
          ${dialog.preview.slug ? `<small>Slug: ${escapeHTML(dialog.preview.slug)}</small>` : ""}
          <small>Self-Driving: ${dialog.preview.selfDriving ? `on with ${escapeHTML(dialog.preview.selfDriving.agentName || "workspace default")}` : "off"}</small>
        </section>
      ` : dialog.previewing ? `<p class="create-task-preview-hint">Rendering preview...</p>` : ""}
    </div>
  `;
}

function templateFieldControl(field, value) {
  const name = `templateField:${field.name}`;
  const description = field.description ? `<small>${escapeHTML(field.description)}</small>` : "";
  const required = field.required ? "required" : "";
  if (field.type === "textarea") {
    return `<label><span>${escapeHTML(field.label)}${field.required ? " *" : ""}</span><textarea name="${escapeHTML(name)}" ${required} placeholder="${escapeHTML(field.placeholder || "")}">${escapeHTML(value ?? "")}</textarea>${description}</label>`;
  }
  if (field.type === "select") {
    return `<label><span>${escapeHTML(field.label)}${field.required ? " *" : ""}</span><select name="${escapeHTML(name)}" ${required}><option value="">Select...</option>${(field.options || []).map((option) => `<option value="${escapeHTML(option)}" ${value === option ? "selected" : ""}>${escapeHTML(option)}</option>`).join("")}</select>${description}</label>`;
  }
  if (field.type === "boolean") {
    return `<label class="template-boolean"><input type="checkbox" name="${escapeHTML(name)}" ${value === true ? "checked" : ""} /><span>${escapeHTML(field.label)}</span>${description}</label>`;
  }
  return `<label><span>${escapeHTML(field.label)}${field.required ? " *" : ""}</span><input name="${escapeHTML(name)}" value="${escapeHTML(value ?? "")}" ${required} placeholder="${escapeHTML(field.placeholder || "")}" />${description}</label>`;
}

function bindCreateDialogEvents(entering = false) {
  const form = $("createDialogForm");
  if (!form) return;
  const dialog = state.createDialog;
  form.addEventListener("input", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement)) return;
    if (target.name === "title") {
      state.createDialog.title = target.value;
      if (state.createDialog.templateName) state.createDialog.titleOverride = true;
    }
    if (target.name === "templateName") {
      applyCreateDialogTemplate(target.value);
      return;
    }
    if (target.name === "description") state.createDialog.description = target.value;
    if (target.name === "detail") state.createDialog.detail = target.value;
		if (target.name.startsWith("templateField:")) {
			const name = target.name.slice("templateField:".length);
			state.createDialog.templateFields[name] = target.type === "checkbox" ? target.checked : target.value;
			state.createDialog.templateDirty = true;
		}
		if (target.name === "previewMarkdown") {
			state.createDialog.editedMarkdown = target.value;
			// Typing must not re-render the dialog (it would drop the caret), so
			// update the modified note and reset button in place instead.
			const editedNow = state.createDialog.preview && target.value !== state.createDialog.preview.markdown;
			const editedNote = document.querySelector("[data-preview-edited-note]");
			const editHint = document.querySelector("[data-preview-edit-hint]");
			if (editedNote) editedNote.hidden = !editedNow;
			if (editHint) editHint.hidden = Boolean(editedNow);
		}
    if (target.name === "slug") state.createDialog.slug = target.value;
    if (target.name === "prompt") state.createDialog.prompt = target.value;
    if (target.name === "agentName") state.createDialog.agentName = target.value;
    if (target.name === "completionCriteria") state.createDialog.completionCriteria = target.value;
    if (target.name === "agentProfiles") state.createDialog.preferredAgentProfiles = parseAgentProfiles(target.value);
    if (target.name === "selfDriving") {
      state.createDialog.selfDriving = target.checked;
      renderCreateDialog();
    }
  });
  form.addEventListener("submit", submitCreateDialog);
  document.querySelectorAll("[data-create-dialog-close]").forEach((node) => {
    node.addEventListener("click", closeCreateDialog);
  });
	document.querySelector("[data-clear-title-override]")?.addEventListener("click", () => {
		dialog.title = "";
		dialog.titleOverride = false;
		renderCreateDialog();
	});
	document.querySelectorAll("[data-create-tab]").forEach((node) => {
		node.addEventListener("click", () => {
			const tab = node.dataset.createTab;
			if (!state.createDialog.open || state.createDialog.activeTab === tab) return;
			state.createDialog.activeTab = tab;
			renderCreateDialog();
			if (tab === "preview" && state.createDialog.templateName && !state.createDialog.previewing && createDialogPreviewStale(state.createDialog)) {
				refreshCreateTaskPreview();
			}
		});
	});
  document.querySelector("[data-create-preview]")?.addEventListener("click", () => refreshCreateTaskPreview());
	document.querySelector(".create-task-more-options")?.addEventListener("toggle", (event) => {
		// Native <details> toggles itself; only persist the state so later
		// re-renders keep the disclosure open.
		state.createDialog.showOptions = event.target.open;
	});
	document.querySelector("[data-reset-preview-edits]")?.addEventListener("click", () => {
		state.createDialog.editedMarkdown = null;
		// editedMarkdown is intentionally excluded from the dialog render key
		// (typing in the editor must not re-render), so force this explicit
		// reset to repaint.
		const root = $("createDialogRoot");
		if (root) delete root.dataset.createDialogKey;
		renderCreateDialog();
	});
  if (entering && !state.createDialog.submitting) {
    (form.elements.title || form.elements.description)?.focus();
  }
}

function applyCreateDialogTemplate(name) {
  const dialog = state.createDialog;
	if (name !== dialog.templateName && (dialog.templateDirty || dialog.titleOverride || dialog.editedMarkdown != null)) {
		if (!window.confirm("Discard edited template fields and switch templates?")) {
			renderCreateDialog();
			return;
		}
	}
  dialog.templateName = name;
  const template = (state.details[dialog.projectId]?.templates || []).find((item) => item.name === name);
  if (template) {
		dialog.templateFields = {};
		(template.fields || []).forEach((field) => {
			if (field.hasDefault) dialog.templateFields[field.name] = field.default;
			else if (field.type === "boolean") dialog.templateFields[field.name] = false;
			else dialog.templateFields[field.name] = "";
		});
		dialog.title = "";
		dialog.titleOverride = false;
		dialog.templateDirty = false;
	} else {
		dialog.templateFields = {};
		dialog.title = "";
		dialog.titleOverride = false;
		dialog.templateDirty = false;
  }
	dialog.preview = null;
	dialog.templateDigest = "";
	dialog.previewError = "";
	dialog.previewKey = "";
	dialog.editedMarkdown = null;
	dialog.activeTab = "edit";
	dialog.showOptions = false;
  renderCreateDialog();
}

function createTaskRequest(dialog) {
  return {
		project: dialog.projectId,
		title: dialog.templateName ? (dialog.titleOverride ? dialog.title : "") : dialog.title,
		...(dialog.templateName ? {
			templateName: dialog.templateName,
			templateFields: dialog.templateFields,
			...(dialog.templateDigest ? { expectedTemplateDigest: dialog.templateDigest } : {}),
		} : { detail: dialog.detail }),
		slug: dialog.slug,
		selfDriving: dialog.selfDriving,
		agentName: dialog.selfDriving ? dialog.agentName : "",
		preferredAgentProfiles: dialog.selfDriving ? dialog.preferredAgentProfiles : [],
		prompt: dialog.selfDriving ? dialog.prompt : "",
		completionCriteria: dialog.selfDriving ? dialog.completionCriteria : "",
	};
}

async function refreshCreateTaskPreview(draft) {
  const dialog = state.createDialog;
  syncCreateDialogDraft(draft);
	if (!dialog.open || !dialog.templateName) return null;
	const request = createTaskRequest({ ...dialog, templateDigest: "" });
	const requestKey = JSON.stringify(request);
	if (dialog.previewing) {
		if (requestKey === createPreviewPendingKey) return null;
		createPreviewGeneration++;
		createPreviewController?.abort();
		createPreviewController = null;
		createPreviewPendingKey = "";
		dialog.previewing = false;
	}
	const selectedTemplate = (state.details[dialog.projectId]?.templates || []).find((item) => item.name === dialog.templateName);
	if (selectedTemplate && !selectedTemplate.taskTitle && (!dialog.titleOverride || !String(dialog.title).trim())) {
		// Templates without a task-title pattern cannot render without an
		// explicit title; fail locally with an actionable message instead of
		// surfacing the server's "rendered task title must not be empty".
		dialog.previewError = "This template does not generate a title. Enter a task title in the Edit tab to render the preview.";
		renderCreateDialog();
		return null;
	}
	dialog.previewing = true;
	dialog.previewError = "";
	const workspaceId = state.activeWorkspaceId;
	const dialogIdentity = dialog.identity;
	const generation = ++createPreviewGeneration;
	createPreviewController?.abort();
	const controller = new AbortController();
	createPreviewController = controller;
	createPreviewPendingKey = requestKey;
	renderCreateDialog();
	try {
		const preview = await api(`/api/workspaces/${workspaceId}/tasks/preview`, { method: "POST", body: JSON.stringify(request), signal: controller.signal });
		if (generation !== createPreviewGeneration || dialogIdentity !== state.createDialog.identity || workspaceId !== state.activeWorkspaceId) return null;
		dialog.preview = preview;
		dialog.templateDigest = preview.template?.digest || "";
		dialog.previewKey = JSON.stringify(request);
		return preview;
	} catch (err) {
		if (controller.signal.aborted || generation !== createPreviewGeneration || dialogIdentity !== state.createDialog.identity) return null;
		dialog.previewError = err.message;
		return null;
	} finally {
		if (generation === createPreviewGeneration && dialogIdentity === state.createDialog.identity) {
			dialog.previewing = false;
			if (createPreviewController === controller) createPreviewController = null;
			if (createPreviewPendingKey === requestKey) createPreviewPendingKey = "";
			renderCreateDialog();
		}
	}
}

async function submitCreateDialog(draft) {
  const dialog = state.createDialog;
  if (!dialog.open || dialog.submitting) return;
  syncCreateDialogDraft(draft);
  const workspaceId = state.activeWorkspaceId;
  const dialogIdentity = dialog.identity;
  dialog.submitting = true;
  renderCreateDialog();
  try {
    if (dialog.type === "project") {
      await api(`/api/workspaces/${workspaceId}/projects`, {
        method: "POST",
        body: JSON.stringify({
          description: dialog.description,
          slug: dialog.slug,
        }),
      });
      toast("Project created.");
      state.selectedId = "workspace";
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
					completionCriteria: dialog.selfDriving ? dialog.completionCriteria : "",
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
        body: JSON.stringify(requestBody),
      });
      toast("Task created.");
    }
    if (state.activeWorkspaceId !== workspaceId || state.createDialog.identity !== dialogIdentity) return;
    state.createDialog.open = false;
    state.createDialog.identity = ++createDialogIdentity;
    await loadTree();
  } catch (err) {
    if (state.createDialog.identity === dialogIdentity) {
      dialog.submitting = false;
      renderCreateDialog();
      toast(err.message);
    }
  }
}

function parseAgentProfiles(value) {
  const seen = new Set();
  return String(value || "").split(",").map((item) => item.trim().toLowerCase()).filter((item) => {
    if (!item || seen.has(item)) return false;
    seen.add(item);
    return true;
  });
}

async function archiveResource(resourceId) {
  if (!confirm(`Archive ${resourceId}?`)) return;
  await api(`/api/workspaces/${state.activeWorkspaceId}/archive`, {
    method: "POST",
    body: JSON.stringify({ resourceId }),
  });
  toast("Archived.");
  state.selectedId = "workspace";
  await loadTree();
}

function findResource(id) {
  if (!state.tree) return null;
  for (const project of state.tree.projects) {
    if (project.id === id) return project;
    for (const task of project.children || []) {
      if (task.id === id) return task;
    }
  }
  return null;
}

function ensureValidSelection() {
  if (state.selectedId === "workspace" || findResource(state.selectedId)) return false;
  state.selectedId = "workspace";
  return true;
}

function parentProject(id) {
  if (!state.tree) return null;
  for (const project of state.tree.projects) {
    if (project.id === id) return project;
    if ((project.children || []).some((task) => task.id === id)) return project;
  }
  return null;
}

function isProjectExpanded(id) {
  return state.expandedProjects.has(id);
}

function ensureSelectedProjectExpanded(persist = false) {
  const parent = parentProject(state.selectedId);
  if (!parent || parent.id === state.selectedId || state.expandedProjects.has(parent.id)) {
    return;
  }
  state.expandedProjects.add(parent.id);
  if (persist) {
    saveUIState().catch((err) => toast(err.message));
  }
}

function parseRoute() {
  const parts = window.location.pathname.split("/").filter(Boolean);
  if (parts[0] !== "w") return {};
  return {
    workspaceId: decodePathPart(parts[1]),
    resourceId: parts[2] === "r" ? decodePathPart(parts[3]) : "workspace",
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
  return Boolean(id && state.config?.workspaces.some((workspace) => workspace.id === id));
}

function syncURL(options = {}) {
  if (!state.activeWorkspaceId) return;
  const resourceId = state.selectedId && state.selectedId !== "workspace" ? state.selectedId : "";
  const nextPath = resourceId
    ? `/w/${encodeURIComponent(state.activeWorkspaceId)}/r/${encodeURIComponent(resourceId)}`
    : `/w/${encodeURIComponent(state.activeWorkspaceId)}`;
  if (window.location.pathname === nextPath) return;
  const method = options.replace ? "replaceState" : "pushState";
  window.history[method]({}, "", nextPath);
}

function workspaceName() {
  return state.config?.workspaces.find((w) => w.id === state.activeWorkspaceId)?.name || "Workspace";
}

function applyAgentConfig() {
  const agents = enabledAgentConfigs();
  const defaultAgentName = defaultChatAgentName();
  if (!agents.some((agent) => agent.id === state.agent.agentName)) {
    state.agent.agentName = defaultAgentName;
  }
}

function selectedAgentConfig() {
  const agents = enabledAgentConfigs();
	  const agentName = state.agent.agentName || defaultChatAgentName();
	  return agents.find((agent) => agent.id === agentName) || agents[0] || null;
}

function enabledAgentConfigs() {
  return (state.config?.agents || []).filter((agent) => agent.available !== false);
}

function defaultChatAgentName() {
  const agents = enabledAgentConfigs();
  const configured = configuredAgentProfileName(state.config?.agentProfiles, "default")
    || configuredAgentProfileName(state.settings.data?.agentProfiles, "default");
  if (configured) return configured;
  return agents[0]?.id || "";
}

function configuredAgentProfileName(profiles, key) {
  const normalizedKey = String(key || "").trim().toLowerCase();
  const profile = (profiles || []).find((item) => String(item.key || "").trim().toLowerCase() === normalizedKey);
  return String(profile?.agentName || "").trim();
}

async function openSettings(tab = "workspace") {
  state.modalEnter = "settings";
  state.settings.open = true;
  state.settings.identity = ++settingsIdentity;
  state.settings.tab = tab;
  state.settings.agentDirty = false;
  state.settings.expandedAgents = new Set();
  state.settings.workspaceIconPickerId = "";
  state.settings.workspaceIconSavingId = "";
  await refreshSettings();
  renderSettingsModal();
}

function closeSettings(dirty = state.settings.agentDirty) {
  if (state.settings.open && dirty && !window.confirm("Discard unsaved agent settings changes?")) {
    return;
  }
  state.settings.open = false;
  state.settings.identity = ++settingsIdentity;
  state.settings.agentDirty = false;
  renderSettingsModal();
}

async function refreshSettings() {
  const [base, agentHub] = await Promise.all([api("/api/settings"), api("/api/settings/agenthub")]);
  const catalogAgents = (agentHub.catalog?.agents || []).map((agent) => ({ ...agent, id: agent.name }));
  state.settings.data = {
    ...base,
    agentHub,
    agents: catalogAgents,
	    agentProfiles: agentHub.config?.agentProfiles || [],
  };
  state.config = configWithAgentHubCatalog({ ...(state.config || {}), ...base }, agentHub);
  state.settings.dataVersion = (state.settings.dataVersion || 0) + 1;
}

function configWithAgentHubCatalog(base, agentHub) {
  const agents = (agentHub.catalog?.agents || [])
    .filter((agent) => agent.available !== false)
    .map((agent) => ({ ...agent, id: agent.name }));
  return {
    ...base,
    agents,
    agentHubProviders: agentHub.catalog?.providers || [],
    agentProfiles: agentHub.config?.agentProfiles || [],
  };
}

function snapshotAgentDraft() {
  const data = state.settings.data || {};
  return {
    agents: data.agents || [],
    agentProfiles: data.agentProfiles || [],
  };
}

// Full settings reloads replace state.settings.data; keep unsaved agent edits.
async function refreshSettingsPreservingAgentDraft() {
  syncSettingsDraftFromDOM();
  const draft = state.settings.agentDirty ? snapshotAgentDraft() : null;
  await refreshSettings();
  if (draft) {
    state.settings.data = { ...(state.settings.data || {}), ...draft };
  }
}

async function submitSettingsWorkspace() {
  const path = state.settings.workspacePath.trim();
  if (!path) throw new Error("Workspace path is required.");
  const created = state.settings.createWorkspace;
  const workspace = await api("/api/workspaces", {
    method: "POST",
    body: JSON.stringify({ path, create: created }),
  });
  flushAgentDraft();
  state.settings.workspacePath = "";
  state.settings.createWorkspace = false;
  state.config = await api("/api/workspaces");
  state.activeWorkspaceId = workspace.id;
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
  state.config = await api("/api/workspaces");
  if (state.activeWorkspaceId === id) {
    state.activeWorkspaceId = state.config.activeId || state.config.workspaces[0]?.id || "";
    state.selectedId = "workspace";
    resetAgentState();
    if (state.activeWorkspaceId) {
      await loadUIState();
      await loadTree();
    } else {
      state.tree = null;
      state.details = {};
      renderAll();
    }
  } else {
    renderWorkspaceSelect();
  }
  await refreshSettingsPreservingAgentDraft();
  renderSettingsModal();
  toast("Workspace removed from Forge GUI.");
}

async function updateSettingsWorkspaceIcon(id, iconId) {
  if (!id || state.settings.workspaceIconSavingId) return;
  state.settings.workspaceIconSavingId = id;
  state.settings.workspaceIconPickerId = "";
  renderSettingsModal();
  try {
    const workspace = await api(`/api/workspaces/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify({ icon: iconId || "" }),
    });
    const replaceWorkspace = (items) => (items || []).map((item) => item.id === workspace.id ? workspace : item);
    state.config = { ...(state.config || {}), workspaces: replaceWorkspace(state.config?.workspaces) };
    state.settings.data = { ...(state.settings.data || {}), workspaces: replaceWorkspace(state.settings.data?.workspaces) };
    state.settings.workspaceIconPickerId = "";
    renderWorkspaceSelect();
    toast(iconId ? "Workspace icon saved." : "Workspace icon reset to the Forge default.");
  } finally {
    state.settings.workspaceIconSavingId = "";
    renderSettingsModal();
  }
}

function syncSettingsDraftFromDOM() {
  // Svelte owns every editable settings field and publishes a typed draft
  // before an action. The legacy layer never reads settings values from DOM.
}

function syncSettingsDraftFromSvelte(draft) {
  if (!draft || !state.settings.open) return;
  state.settings.tab = draft.tab || state.settings.tab;
  state.settings.workspacePath = String(draft.workspacePath || "");
  state.settings.createWorkspace = Boolean(draft.createWorkspace);
  state.settings.agentDirty = Boolean(draft.dirty);
  state.settings.data = {
    ...(state.settings.data || {}),
    agentHub: { ...(state.settings.data?.agentHub || {}), configuredEndpoint: String(draft.endpoint || "") },
    agentProfiles: (draft.profiles || []).map((profile) => ({ key: profile.key, description: profile.description, agentName: profile.agentName })),
  };
}

function markAgentSettingsDirty() {
  if (state.settings.agentDirty) return;
  state.settings.agentDirty = true;
  updateSettingsSaveBar();
  document.querySelectorAll('[data-settings-tab="agenthub"], [data-settings-tab="profiles"]').forEach((tab) => tab.classList.add("dirty"));
}

function updateSettingsSaveBar() {
  const button = $("settingsSaveButton");
  if (button) button.disabled = !state.settings.agentDirty;
  const hint = $("settingsSaveHint");
  if (hint) {
    hint.textContent = state.settings.agentDirty ? "Unsaved changes" : "";
    hint.classList.toggle("visible", state.settings.agentDirty);
  }
}

async function saveAgentSettings() {
  syncSettingsDraftFromDOM();
  const data = state.settings.data || {};
  await api("/api/settings/agenthub", {
    method: "PUT",
    body: JSON.stringify({
      endpoint: data.agentHub?.configuredEndpoint || "http://127.0.0.1:4646",
      agentProfiles: (data.agentProfiles || []).map((profile) => ({
        key: profile.key,
        description: profile.description,
        agentName: profile.agentName,
      })),
    }),
  });
  await refreshSettings();
  state.config = configWithAgentHubCatalog(await api("/api/workspaces"), state.settings.data.agentHub);
  state.settings.agentDirty = false;
  applyAgentConfig();
  renderAgent();
  renderTTYComposer();
  bindAgentEvents();
  renderSettingsModal();
  refreshIcons();
  toast("AgentHub settings saved.");
}

function collectSettingsAgentProfiles() {
  return Array.from(document.querySelectorAll(".settings-profile-row[data-profile-index]")).map((row) => {
    const field = (name) => row.querySelector(`[data-profile-field="${name}"]`)?.value.trim() || "";
    return { key: field("key"), description: field("description"), agentName: field("agentName") };
  });
}

function addSettingsProfile() {
  const key = state.settings.newProfile.key.trim().toLowerCase();
  const agentName = state.settings.newProfile.agentName;
  if (!key) {
    toast("Profile key is required.");
    return;
  }
  if (SYSTEM_AGENT_PROFILE_KEYS.has(key)) {
    toast(`${key} is a reserved system profile.`);
    return;
  }
  syncSettingsDraftFromDOM();
  const current = state.settings.data?.agentProfiles || [];
  if (current.some((profile) => profile.key.trim().toLowerCase() === key)) {
    toast(`Profile ${key} already exists.`);
    return;
  }
  state.settings.data = {
    ...(state.settings.data || {}),
    agentProfiles: [...current, { key, description: state.settings.newProfile.description.trim(), agentName }],
  };
  state.settings.newProfile = { key: "", description: "", agentName };
  markAgentSettingsDirty();
  state.settings.suppressDraftSync = true;
  renderSettingsModal();
}

function removeSettingsProfile(index) {
  syncSettingsDraftFromDOM();
  const current = state.settings.data?.agentProfiles || [];
  if (!Number.isInteger(index) || index < 0 || index >= current.length) return;
  if (SYSTEM_AGENT_PROFILE_KEYS.has(String(current[index].key || "").trim().toLowerCase())) {
    toast("System profiles cannot be deleted.");
    return;
  }
  state.settings.data = { ...(state.settings.data || {}), agentProfiles: current.filter((_, itemIndex) => itemIndex !== index) };
  markAgentSettingsDirty();
  state.settings.suppressDraftSync = true;
  renderSettingsModal();
}

function formatBytes(size) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function sameJSON(a, b) {
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function toast(message) {
  const node = $("toast");
  node.textContent = message;
  node.hidden = false;
  setTimeout(() => {
    node.hidden = true;
  }, 2800);
}

function icon(name, className = "") {
  return `<i data-lucide="${name}" class="${className}"></i>`;
}

function refreshIcons() {
  if (!window.lucide || state.iconRefreshScheduled) return;
  state.iconRefreshScheduled = true;
  window.requestAnimationFrame(() => {
    state.iconRefreshScheduled = false;
    window.lucide.createIcons({ attrs: { "stroke-width": 2 } });
  });
}

function optionalAssetLoaded(asset) {
  refreshIcons();
  if (asset === "markdown" && window.marked && window.DOMPurify) {
    renderDetails();
    bindTemplateEvents();
    bindArtifactBrowserEvents();
    bindFileModalEvents();
    bindDiffEvents();
    bindDiffModalEvents();
    refreshIcons();
  }
  if (asset === "diff") {
    renderDiffContent();
  }
}

window.forgeAssetLoaded = optionalAssetLoaded;

function initPaneResize() {
  const raw = readStoredPaneSizes();
  state.paneSizes = loadPaneSizes(raw, 0);
  applyPaneSizes();
  const legacyDetailsWidth = isFinitePaneSize(raw.detailsWidth) && !isFinitePaneSize(raw.chatWidth);
  if (legacyDetailsWidth && !isMobilePaneLayout()) {
    state.paneSizes = loadPaneSizes(raw, workspacePanelWidth());
    applyPaneSizes();
    saveAllPaneSizes();
  }
  $("sidebarResize")?.addEventListener("pointerdown", (event) => startSidebarResize(event));
  $("detailsResize")?.addEventListener("pointerdown", (event) => startChatResize(event));
  $("sessionResize")?.addEventListener("pointerdown", (event) => startSessionResize(event));
  window.addEventListener("resize", syncPaneViewport);
}

function startSidebarResize(event) {
  if (isMobilePaneLayout()) return;
  event.preventDefault();
  const startX = event.clientX;
  const app = $("app");
  const sidebar = app?.querySelector(".sidebar");
  const chat = $("agentPanel");
  if (!app || !sidebar || !chat) return;
  const startWidth = sidebar.getBoundingClientRect().width;
  const startChatWidth = chat.getBoundingClientRect().width;
  const maxWidth = maxSidebarResizeWidth(app.getBoundingClientRect().width, startChatWidth);
  startDrag(event.currentTarget, (moveEvent) => {
    const width = clamp(startWidth + moveEvent.clientX - startX, SIDEBAR_MIN_WIDTH, maxWidth);
    setPaneSize("sidebarWidth", width);
  }, () => savePaneSize("sidebarWidth"));
}

function startChatResize(event) {
  if (isMobilePaneLayout()) return;
  event.preventDefault();
  const panel = document.querySelector(".workspace-panel");
  const chat = $("agentPanel");
  if (!panel || !chat) return;
  const startX = event.clientX;
  const startWidth = chat.getBoundingClientRect().width;
  const panelWidth = panel.getBoundingClientRect().width;
  const maxWidth = Math.max(CHAT_MIN_WIDTH, panelWidth - DETAILS_MIN_WIDTH - PANE_HANDLE_WIDTH);
  startDrag(event.currentTarget, (moveEvent) => {
    const width = clamp(startWidth - (moveEvent.clientX - startX), CHAT_MIN_WIDTH, maxWidth);
    setPaneSize("chatWidth", width);
  }, () => savePaneSize("chatWidth"));
}

function startSessionResize(event) {
  if (isMobilePaneLayout()) return;
  event.preventDefault();
  const sidebar = document.querySelector(".sidebar");
  const sessionSection = document.querySelector(".session-section");
  if (!sidebar || !sessionSection) return;
  const startY = event.clientY;
  const startHeight = sessionSection.getBoundingClientRect().height;
  startDrag(event.currentTarget, (moveEvent) => {
    const sidebarHeight = sidebar.getBoundingClientRect().height;
    const maxHeight = Math.max(120, sidebarHeight - 250);
    const height = clamp(startHeight - (moveEvent.clientY - startY), 84, maxHeight);
    setPaneSize("sidebarSessionHeight", height);
  }, () => savePaneSize("sidebarSessionHeight"), "y");
}

function startDrag(handle, onMove, onDone, direction = "x") {
  const bodyClass = direction === "y" ? "resizing-y" : "resizing-x";
  handle.classList.add("dragging");
  document.body.classList.add(bodyClass);
  const move = (event) => onMove(event);
  const up = () => {
    handle.classList.remove("dragging");
    document.body.classList.remove(bodyClass);
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", up);
    onDone();
  };
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", up, { once: true });
}

function setCSSPixels(name, value) {
  document.documentElement.style.setProperty(name, `${Math.round(value)}px`);
}

const PANE_HANDLE_WIDTH = 8;
const SIDEBAR_MIN_WIDTH = 220;
const DETAILS_MIN_WIDTH = 360;
const CHAT_MIN_WIDTH = 320;
const PANE_MAX_SIZE = 10000;
const PANE_DEFAULTS = Object.freeze({
  sidebarWidth: 280,
  chatWidth: 420,
  sidebarSessionHeight: 210,
});
const PANE_CSS_VARIABLES = Object.freeze({
  sidebarWidth: "--sidebar-width",
  chatWidth: "--chat-width",
  sidebarSessionHeight: "--sidebar-session-height",
});

function setPaneSize(name, value) {
  if (!Object.hasOwn(PANE_CSS_VARIABLES, name) || !Number.isFinite(value)) return;
  const minimum = name === "sidebarWidth" ? SIDEBAR_MIN_WIDTH : name === "chatWidth" ? CHAT_MIN_WIDTH : 84;
  const next = Math.round(clamp(value, minimum, PANE_MAX_SIZE));
  state.paneSizes[name] = next;
  setCSSPixels(PANE_CSS_VARIABLES[name], next);
}

function applyPaneSizes() {
  for (const name of Object.keys(PANE_CSS_VARIABLES)) {
    setPaneSize(name, state.paneSizes[name]);
  }
}

function savePaneSize(name) {
  if (!Object.hasOwn(PANE_CSS_VARIABLES, name)) return;
  const saved = readStoredPaneSizes();
  delete saved.detailsWidth;
  for (const paneName of Object.keys(PANE_CSS_VARIABLES)) {
    if (!isFinitePaneSize(saved[paneName])) {
      saved[paneName] = state.paneSizes[paneName];
    }
  }
  saved[name] = state.paneSizes[name];
  localStorage.setItem(PANE_SIZE_KEY, JSON.stringify(saved));
}

function saveAllPaneSizes() {
  localStorage.setItem(PANE_SIZE_KEY, JSON.stringify({ ...state.paneSizes }));
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
  if (isFinitePaneSize(source.sidebarWidth)) {
    sizes.sidebarWidth = clamp(source.sidebarWidth, SIDEBAR_MIN_WIDTH, PANE_MAX_SIZE);
  }
  if (isFinitePaneSize(source.chatWidth)) {
    sizes.chatWidth = clamp(source.chatWidth, CHAT_MIN_WIDTH, PANE_MAX_SIZE);
  } else if (isFinitePaneSize(source.detailsWidth) && availableWorkspaceWidth >= DETAILS_MIN_WIDTH + PANE_HANDLE_WIDTH + CHAT_MIN_WIDTH) {
    const detailsWidth = clamp(source.detailsWidth, DETAILS_MIN_WIDTH, availableWorkspaceWidth - PANE_HANDLE_WIDTH - CHAT_MIN_WIDTH);
    sizes.chatWidth = clamp(availableWorkspaceWidth - PANE_HANDLE_WIDTH - detailsWidth, CHAT_MIN_WIDTH, PANE_MAX_SIZE);
  }
  if (isFinitePaneSize(source.sidebarSessionHeight)) {
    sizes.sidebarSessionHeight = clamp(source.sidebarSessionHeight, 84, PANE_MAX_SIZE);
  }
  return sizes;
}

function loadPaneSizes(raw = readStoredPaneSizes(), availableWorkspaceWidth = workspacePanelWidth()) {
  return normalizePaneSizes(raw, availableWorkspaceWidth);
}

function workspacePanelWidth() {
  return document.querySelector(".workspace-panel")?.getBoundingClientRect().width || 0;
}

function maxSidebarResizeWidth(appWidth, chatWidth) {
  const availableWidth = Number.isFinite(appWidth) ? appWidth : 0;
  const currentChatWidth = Number.isFinite(chatWidth) ? Math.max(CHAT_MIN_WIDTH, chatWidth) : CHAT_MIN_WIDTH;
  return Math.max(
    SIDEBAR_MIN_WIDTH,
    availableWidth - PANE_HANDLE_WIDTH - DETAILS_MIN_WIDTH - PANE_HANDLE_WIDTH - currentChatWidth,
  );
}

function isMobilePaneLayout() {
  return typeof MOBILE_LAYOUT_QUERY !== "undefined" && MOBILE_LAYOUT_QUERY.matches;
}

function syncPaneViewport() {
  if (isMobilePaneLayout()) return;
  const raw = readStoredPaneSizes();
  if (isFinitePaneSize(raw.detailsWidth) && !isFinitePaneSize(raw.chatWidth)) {
    state.paneSizes = normalizePaneSizes(raw, workspacePanelWidth());
    applyPaneSizes();
    saveAllPaneSizes();
  }
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

const MOBILE_LAYOUT_QUERY = window.matchMedia("(max-width: 980px)");

// Keep the fixed mobile app shell aligned with the visual viewport. Mobile
// browsers scroll the layout viewport when the software keyboard opens and
// may leave the window scrolled after it closes, which shifts the shell
// off-screen (top controls unreachable, blank area at the bottom).
function syncAppViewport() {
  const root = document.documentElement;
  const viewport = window.visualViewport;
  if (!MOBILE_LAYOUT_QUERY.matches || !viewport) {
    root.style.removeProperty("--app-viewport-height");
    root.style.removeProperty("--app-viewport-offset-top");
    root.style.removeProperty("--app-viewport-offset-left");
    return;
  }
  root.style.setProperty("--app-viewport-height", `${viewport.height}px`);
  root.style.setProperty("--app-viewport-offset-top", `${viewport.offsetTop}px`);
  root.style.setProperty("--app-viewport-offset-left", `${viewport.offsetLeft}px`);
}

function resetAppViewportScroll() {
  if (window.scrollX !== 0 || window.scrollY !== 0) {
    window.scrollTo(0, 0);
  }
  syncAppViewport();
}

if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", syncAppViewport);
  window.visualViewport.addEventListener("scroll", syncAppViewport);
}
if (typeof MOBILE_LAYOUT_QUERY.addEventListener === "function") {
  MOBILE_LAYOUT_QUERY.addEventListener("change", syncAppViewport);
  MOBILE_LAYOUT_QUERY.addEventListener("change", syncPaneViewport);
}
window.addEventListener("orientationchange", () => {
  resetAppViewportScroll();
  setTimeout(resetAppViewportScroll, 300);
});
document.addEventListener("focusout", () => {
  // The software keyboard is dismissing; some mobile browsers leave the
  // window scrolled. Reset the scroll offset and re-sync once the keyboard
  // animation settles.
  setTimeout(resetAppViewportScroll, 0);
  setTimeout(resetAppViewportScroll, 300);
});
syncAppViewport();

function setMobileSidebar(open) {
  state.mobile.sidebarOpen = Boolean(open);
  document.body.classList.toggle("mobile-sidebar-open", state.mobile.sidebarOpen);
  $("mobileMenuButton")?.setAttribute("aria-expanded", String(state.mobile.sidebarOpen));
}

function setMobileView(view) {
  state.mobile.view = view === "chat" ? "chat" : "details";
  const chatActive = state.mobile.view === "chat";
  document.body.classList.toggle("mobile-chat-active", chatActive);
  $("mobileDetailsButton")?.setAttribute("aria-selected", String(!chatActive));
  $("mobileChatButton")?.setAttribute("aria-selected", String(chatActive));
}

function loadMobileImmersive() {
  try {
    return localStorage.getItem(MOBILE_IMMERSIVE_KEY) === "1";
  } catch (_) {
    return false;
  }
}

function setMobileImmersive(immersive) {
  state.mobile.immersive = Boolean(immersive);
  document.body.classList.toggle("chat-immersive", state.mobile.immersive);
  const button = $("mobileImmersiveButton");
  if (button) {
    button.setAttribute("aria-pressed", String(state.mobile.immersive));
    button.innerHTML = `<i data-lucide="${state.mobile.immersive ? "minimize-2" : "maximize-2"}"></i>`;
    refreshIcons();
  }
  try {
    localStorage.setItem(MOBILE_IMMERSIVE_KEY, state.mobile.immersive ? "1" : "0");
  } catch (_) {
    // Persisting the immersive preference is best-effort.
  }
}

$("workspaceSwitcher").onclick = (event) => {
  event.stopPropagation();
  state.workspaceMenuOpen = !state.workspaceMenuOpen;
  renderWorkspaceSelect();
};

$("workspaceMenu").addEventListener("click", (event) => {
  if (event.target.closest("#workspaceMenuAdd")) {
    state.workspaceMenuOpen = false;
    renderWorkspaceSelect();
    openSettings("workspace").catch((err) => toast(err.message));
    return;
  }
  const row = event.target.closest("[data-workspace-id]");
  if (row) {
    switchWorkspace(row.dataset.workspaceId).catch((err) => toast(err.message));
  }
});

document.addEventListener("mousedown", (event) => {
  if (!state.workspaceMenuOpen) return;
  if (event.target.closest(".workspace-select-row")) return;
  state.workspaceMenuOpen = false;
  renderWorkspaceSelect();
});

// Session log renders are deferred while the user selects text there. Flush
// the pending render once the selection collapses so new events appear.
document.addEventListener("selectionchange", () => {
  if (!state.agent.renderDeferredForSelection) return;
  const log = $("ttyLog");
  if (log && ttyLogHasActiveSelection(log)) return;
  state.agent.renderDeferredForSelection = false;
  renderTTY();
  refreshIcons();
});

$("newProjectButton").onclick = () => showProjectForm();

$("systemSettingsButton").onclick = () => {
  setMobileSidebar(false);
  openSettings().catch((err) => toast(err.message));
};

$("mobileMenuButton").onclick = () => setMobileSidebar(!state.mobile.sidebarOpen);
$("mobileSidebarBackdrop").onclick = () => setMobileSidebar(false);
$("mobileDetailsButton").onclick = () => setMobileView("details");
$("mobileChatButton").onclick = () => setMobileView("chat");
$("mobileImmersiveButton").onclick = () => setMobileImmersive(!state.mobile.immersive);
setMobileImmersive(loadMobileImmersive());

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && state.mobile.sidebarOpen) {
    setMobileSidebar(false);
  } else if (event.key === "Escape" && state.diff) {
    closeDiff();
  } else if (event.key === "Escape" && state.preview) {
    closePreview();
  } else if (event.key === "Escape" && state.sessionMenu) {
    state.sessionMenu = null;
    renderSessions();
    refreshIcons();
  } else if (event.key === "Escape" && state.workspaceMenuOpen) {
    state.workspaceMenuOpen = false;
    renderWorkspaceSelect();
  } else if (event.key === "Escape" && (state.agent.optionsOpen || state.agent.agentChooserOpen || state.agent.historyOpen)) {
    state.agent.optionsOpen = false;
    state.agent.agentChooserOpen = false;
    state.agent.historyOpen = false;
    renderAgent();
    renderTTYComposer();
    bindAgentEvents();
    refreshIcons();
  }
});

document.addEventListener("click", (event) => {
  const target = event.target instanceof Element ? event.target : null;
  const breadcrumbButton = target?.closest("[data-breadcrumb-resource]");
  if (breadcrumbButton) {
    openBreadcrumbResource(breadcrumbButton.dataset.breadcrumbResource).catch((err) => toast(err.message));
    return;
  }
  const outsideAgentChooser = state.agent.agentChooserOpen && target && !target.closest(".tty-new-session-control");
  const outsideAgentPanelMenu = (state.agent.optionsOpen || state.agent.historyOpen) && target
    && !target.closest(".agent-actions")
    && !target.closest(".agent-sessions")
    && !target.closest(".tty-composer");
  if (outsideAgentChooser || outsideAgentPanelMenu) {
    state.agent.optionsOpen = false;
    state.agent.agentChooserOpen = false;
    state.agent.historyOpen = false;
    renderAgent();
    renderTTYComposer();
    bindAgentEvents();
    refreshIcons();
  }
  if (!state.sessionMenu) return;
  if (target?.closest(".session-row") || target?.closest(".session-resource-menu")) return;
  state.sessionMenu = null;
  renderSessions();
  refreshIcons();
});

initPaneResize();
installNotificationCrossTabListeners();
state.user.name = readStoredUserName();
installUserSettingsCrossTabListener();

function flushAgentDraftOnPageLeave() {
  flushAgentDraft();
}

window.addEventListener("pagehide", flushAgentDraftOnPageLeave);
window.addEventListener("beforeunload", flushAgentDraftOnPageLeave);
document.addEventListener("visibilitychange", () => {
  if (document.hidden || document.visibilityState === "hidden") flushAgentDraftOnPageLeave();
});

window.addEventListener("popstate", async () => {
  const route = parseRoute();
  if (!workspaceExists(route.workspaceId)) {
    return;
  }
  const workspaceChanged = state.activeWorkspaceId !== route.workspaceId;
  const previousSelectedId = state.selectedId;
  flushAgentDraft();
  state.navigationVersion++;
  state.autoRefreshVersion++;
  state.treeRequestVersion++;
  state.detailRequestVersion++;
  state.workspaceAgentsRequestVersion++;
  state.previewRequestVersion++;
  state.diffRequestVersion++;
  state.workspaceAgentsSaving = false;
  const navigationVersion = state.navigationVersion;
  state.activeWorkspaceId = route.workspaceId;
  state.selectedId = route.resourceId || "workspace";
  if (!workspaceChanged && previousSelectedId !== state.selectedId && state.selectedId !== "workspace") {
    resetResourceLogState(state.selectedId);
    delete state.details[state.selectedId];
  }
  state.preview = null;
  state.diff = null;
  state.sessionMenu = null;
  if (workspaceChanged) {
    resetWorkspaceAgentsDraft();
    state.workspaceAgentsSaving = false;
    closeCreateDialog();
    initializeNotificationState(state.activeWorkspaceId);
  }
  if (workspaceChanged) {
    resetAgentState();
  }
  renderWorkspaceSelect();
  if (workspaceChanged) {
    if (!await loadUIState(route.workspaceId, navigationVersion)) return;
    if (!route.resourceId && state.lastResourceId) {
      state.selectedId = state.lastResourceId;
    }
    await loadTree({ updateURL: false });
  } else {
    ensureValidSelection();
    if (state.selectedId === "workspace") {
      await loadWorkspaceAgents();
    } else {
      ensureSelectedProjectExpanded(false);
      await loadDetail(state.selectedId);
    }
    if (!isCurrentWorkspaceView(route.workspaceId, navigationVersion)) return;
    if (previousSelectedId !== state.selectedId) {
      await reloadAgentRunsForSelection();
    }
    renderAll();
  }
});

load().catch((err) => {
  toast(err.message);
  renderAll();
});

startAutoRefresh();
