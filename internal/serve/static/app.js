const state = {
  config: null,
  tree: null,
  details: {},
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
  expandedMarkdownFiles: new Set(),
  preview: null,
  diff: null,
  modalEnter: "",
  sessionMenu: null,
  taskOperationalStateKey: "",
  settings: {
    open: false,
    tab: "workspace",
    data: null,
    agentDirty: false,
    expandedAgents: new Set(),
    suppressDraftSync: false,
    workspacePath: "",
    createWorkspace: false,
    saving: false,
    newProfile: {
      key: "",
      description: "",
      agentName: "",
    },
  },
  createDialog: {
    open: false,
    type: "",
    projectId: "",
    templateName: "",
    title: "",
    description: "",
    detail: "",
    slug: "",
    autorun: false,
    preferredAgentProfiles: [],
    prompt: "",
    submitting: false,
  },
  uploadDialog: {
    open: false,
    runId: "",
    items: [],
    nextId: 1,
  },
  autoRefreshTimer: null,
  autoRefreshInFlight: false,
  autoRefreshVersion: 0,
  treeRequestVersion: 0,
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
    skipTTYDraftSync: false,
    agentName: "",
    optionsOpen: false,
    agentChooserOpen: false,
    historyOpen: false,
    autoRunExpanded: false,
    autoRunStarting: false,
    newSessionStarting: false,
    sessionActionsOpen: false,
    eventsHasMore: false,
    historyBeforeId: 0,
    loadingOlder: false,
    sendingInput: false,
    toolGroupOpen: new Map(),
    approvalDrafts: new Map(),
    renderDeferredForSelection: false,
  },
  tty: [
    { type: "system", text: "Forge GUI initialized." },
    { type: "system", text: "Workspace data is loaded through forge CLI." },
  ],
};

const $ = (id) => document.getElementById(id);
const AUTO_REFRESH_INTERVAL_MS = 5000;
const TASK_OUTPUT_FRESH_WINDOW_MS = 60 * 1000;
const PANE_SIZE_KEY = "forge.gui.paneSizes";
const MOBILE_IMMERSIVE_KEY = "forge.gui.mobileImmersive";
const AGENT_OLDER_RAW_PAGE_LIMIT = 250;
const AGENT_MANUAL_VISIBLE_EVENT_COUNT = 5;
const AGENT_MANUAL_RAW_PAGE_LIMIT = 500;
const AGENT_MANUAL_AUTO_PAGE_LIMIT = 8;
const AGENT_DRAFT_STORAGE_PREFIX = "forge.gui.agentDraft.v1";
const AGENT_DRAFT_STORAGE_VERSION = 1;
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
const MARKDOWN_PREVIEW_CHAR_LIMIT = 2200;
const MARKDOWN_PREVIEW_LINE_LIMIT = 38;

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
  const input = $("ttyInput");
  if (!input || !state.agent.ttyDraftKey || input.dataset.agentDraftKey !== state.agent.ttyDraftKey) return;
  updateAgentDraft(input.value);
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
    throw new Error(message);
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
    await loadUIState();
    if (!route.resourceId && state.lastResourceId) {
      state.selectedId = state.lastResourceId;
    }
    await loadTree({ replaceURL: true });
  } else {
    state.tree = null;
    state.details = {};
    state.workspaceAgents = null;
    state.preview = null;
    state.diff = null;
    resetAgentState();
    renderAll();
  }
}

async function loadTree(options = {}) {
  if (!state.activeWorkspaceId) return;
  state.tree = await api(`/api/workspaces/${state.activeWorkspaceId}/tree`);
  state.details = {};
  state.workspaceAgents = null;
  state.preview = null;
  state.diff = null;
  ensureValidSelection();
  ensureSelectedProjectExpanded(false);
  if (state.selectedId === "workspace") {
    await loadWorkspaceAgents();
  } else if (state.selectedId) {
    await loadDetail(state.selectedId);
  }
  await loadAgentRuns();
  renderAll();
  if (options.updateURL !== false) {
    syncURL({ replace: Boolean(options.replaceURL) });
  }
}

async function loadDetail(id, options = {}) {
  if (!id || id === "workspace" || (state.details[id] && !options.force)) return;
  state.details[id] = await fetchDetail(id);
}

function fetchDetail(id) {
  return api(`/api/workspaces/${state.activeWorkspaceId}/resources/${encodeURIComponent(id)}`);
}

async function loadWorkspaceAgents(options = {}) {
  if (!state.activeWorkspaceId || (state.workspaceAgents && !options.force)) return;
  try {
    state.workspaceAgents = await api(`/api/workspaces/${state.activeWorkspaceId}/files?path=${encodeURIComponent("AGENTS.md")}`);
  } catch (err) {
    state.workspaceAgents = {
      path: "AGENTS.md",
      name: "AGENTS.md",
      error: err.message,
    };
  }
}

async function loadUIState() {
  const uiState = await api(`/api/workspaces/${state.activeWorkspaceId}/ui-state`);
  state.expandedProjects = new Set(uiState.expandedProjects || []);
  state.lastResourceId = uiState.lastResourceId || "";
  state.projectOrder = Array.isArray(uiState.projectOrder) ? uiState.projectOrder : [];
  state.taskOrder = uiState.taskOrder && typeof uiState.taskOrder === "object" ? uiState.taskOrder : {};
  state.sessionOrder = Array.isArray(uiState.sessionOrder) ? uiState.sessionOrder : [];
}

async function saveUIState() {
  if (!state.activeWorkspaceId) return;
  await api(`/api/workspaces/${state.activeWorkspaceId}/ui-state`, {
    method: "PUT",
    body: JSON.stringify({
      version: 1,
      expandedProjects: [...state.expandedProjects],
      lastResourceId: state.selectedId,
      projectOrder: state.projectOrder,
      taskOrder: state.taskOrder,
      sessionOrder: state.sessionOrder,
    }),
  });
  state.lastResourceId = state.selectedId;
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
  if (!state.activeWorkspaceId || state.autoRefreshInFlight || state.agentSessionMutationCount > 0 || state.listDrag || document.hidden) return;
  const refreshVersion = state.autoRefreshVersion;
  state.autoRefreshInFlight = true;
  try {
    const tree = await fetchCurrentTree();
    if (!tree || refreshVersion !== state.autoRefreshVersion) return;
    let changed = !sameJSON(state.tree, tree);
    if (changed) {
      state.tree = tree;
    }
    if (changed && state.preview?.section === "Wiki" && !state.preview.loading) {
      await refreshFilePreview("Wiki", state.preview.path);
    }
    if (ensureValidSelection()) {
      syncURL({ replace: true });
      changed = true;
    }
    const expandedCount = state.expandedProjects.size;
    ensureSelectedProjectExpanded(false);
    changed = changed || expandedCount !== state.expandedProjects.size;
    if (state.selectedId === "workspace") {
      const previousAgents = state.workspaceAgents;
      await loadWorkspaceAgents({ force: true });
      if (!sameJSON(previousAgents, state.workspaceAgents)) {
        changed = true;
      }
    } else if (state.selectedId) {
      const detail = await fetchDetail(state.selectedId);
      if (refreshVersion !== state.autoRefreshVersion) return;
      if (!sameJSON(state.details[state.selectedId], detail)) {
        state.details[state.selectedId] = detail;
        changed = true;
      }
    }
    const runs = await fetchAgentRuns();
    if (refreshVersion !== state.autoRefreshVersion) return;
    const runsChanged = !sameJSON(state.agent.runs, runs);
    if (runsChanged) {
      state.agent.runs = runs;
      changed = true;
    }
    if (reconcileActiveAgentRun(runs)) {
      await loadCanonicalAgentEvents();
      if (refreshVersion !== state.autoRefreshVersion) return;
      connectAgentStream();
      changed = true;
    }
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
  bindWorkspaceAgentsEvents();
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
  // Background refreshes render the main workspace frequently. Keep an open
  // settings modal mounted so its scroll position and in-progress controls
  // are not reset; settings actions render it explicitly when needed.
  if (!state.settings.open) renderSettingsModal();
}

function renderSelectionPanels() {
  renderTree();
  renderSessions();
  renderDetails();
  bindWorkspaceAgentsEvents();
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
}

const WORKSPACE_AVATAR_PALETTE = [
  ["#dbeafe", "#1d4ed8"],
  ["#ede9fe", "#6d28d9"],
  ["#fee2e2", "#b91c1c"],
  ["#ffedd5", "#c2410c"],
  ["#dcfce7", "#15803d"],
  ["#cffafe", "#0e7490"],
];

function workspaceAvatarColors(workspace) {
  const key = (workspace?.id || workspace?.name || "").trim();
  let hash = 0;
  for (const ch of key) hash = (hash * 31 + ch.codePointAt(0)) >>> 0;
  return WORKSPACE_AVATAR_PALETTE[hash % WORKSPACE_AVATAR_PALETTE.length];
}

function applyWorkspaceAvatarColor(element, workspace) {
  const [bg, fg] = workspaceAvatarColors(workspace);
  element.style.background = bg;
  element.style.color = fg;
}

function renderWorkspaceSelect() {
  const active = state.config.workspaces.find((workspace) => workspace.id === state.activeWorkspaceId);
  const avatar = $("workspaceAvatar");
  avatar.textContent = (active?.name || "A").trim().slice(0, 1).toUpperCase();
  applyWorkspaceAvatarColor(avatar, active);
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
    const initial = (workspace.name || "?").trim().slice(0, 1).toUpperCase();
    const [bg, fg] = workspaceAvatarColors(workspace);
    const active = workspace.id === activeId;
    return `
      <button type="button" class="workspace-menu-row" role="option" aria-selected="${active}" data-workspace-id="${escapeHTML(workspace.id)}">
        <span class="workspace-avatar" style="background:${bg};color:${fg}">${escapeHTML(initial)}</span>
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
  // Record the page open in the workspace being left so it can be restored later.
  await saveUIState().catch((err) => console.warn("failed to save UI state", err));
  state.activeWorkspaceId = id;
  state.selectedId = "workspace";
  state.sessionMenu = null;
  resetWorkspaceAgentsDraft();
  closeCreateDialog();
  resetAgentState();
  renderWorkspaceSelect();
  await loadUIState();
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
    if (task.autoRun?.state === "running" || taskAgentSessions(task.id).some(taskSessionCountsAsRunning)) {
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
  const statuses = [taskState.autoRun, taskState.session].filter(Boolean);
  const hasTaskState = statuses.length > 0 || Boolean(taskState.lock);
  const statusClassName = statuses.map((status) => status.className).filter(Boolean).join(" ");
  const taskStatusLayoutClass = hasTaskState
    ? (statuses.length > 1 ? "has-task-status-dual" : "has-task-status")
    : "";
  const taskStatusMarkup = hasTaskState ? `
    <span class="task-status-slot ${taskState.lock && statuses.length === 0 ? "task-status-lock-only" : ""} ${statuses.length === 1 ? "task-status-single" : ""} ${statuses.length > 1 ? "task-status-dual" : ""}" aria-hidden="true">
      ${statuses.map((status) => `<span class="task-status-indicator ${status.className} ${status.recentOutput ? "task-status-fresh" : ""}">${icon(status.iconName, "task-status-icon")}</span>`).join("")}
      ${taskState.lock ? `<span class="task-lock-indicator ${taskState.lock.className}">${icon("lock", "task-lock-icon")}</span>` : ""}
    </span>` : "";
  button.className = `tree-item ${kind === "task" ? "task-item" : ""} ${taskStatusLayoutClass} ${statusClassName} ${state.selectedId === item.id ? "active" : ""}`;
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
  return { autoRun: null, session: null, className: "", label: "", lock: null };
}

function taskOperationalState(item) {
  const sessions = taskAgentSessions(item.id);
  const locks = taskLocks(item.id);
  const autoRun = deriveTaskAutoRunState(item.autoRun, sessions);
  const session = deriveTaskSessionState(sessions);
  const lock = deriveTaskLockState(locks);
  const statuses = [autoRun, session].filter(Boolean);
  return {
    autoRun,
    session,
    className: statuses.map((status) => status.className).filter(Boolean).join(" "),
    lock,
    label: taskOperationalLabel(item.autoRun, sessions, lock, { autoRun, session }),
  };
}

function deriveTaskAutoRunState(autoRun, sessions) {
  if (!autoRun) return null;
  const autoRunState = autoRun?.state || "";
  if (autoRunState === "running") {
    const scheduler = sessions.find((session) => session.schedulerTurn && session.autoRunGeneration === autoRun.generation && ["starting", "running", "waiting_approval", "stopping", "recovering"].includes(session.agentRunStatus));
    if (scheduler) {
      return taskStatusState("auto-running", "task-status-auto-running", "workflow", "AutoRun running", "auto-run");
    }
    return taskStatusState("auto-recovering", "task-status-attention", "rotate-ccw", "AutoRun waiting for scheduler recovery", "auto-run");
  }
  if (autoRunState === "failed") {
    return taskStatusState("failed", "task-status-danger", "triangle-alert", "AutoRun failed", "auto-run");
  }
  if (autoRunState === "paused") {
    return taskStatusState("paused", "task-status-attention", "square", "AutoRun paused", "auto-run");
  }
  if (autoRunState === "suspended") {
    return taskStatusState("suspended", "task-status-attention", "pause", "AutoRun suspended, waiting for timed wake-up", "auto-run");
  }
  if (autoRunState === "queued") {
    return taskStatusState("queued", "task-status-queued", "clock", "AutoRun queued", "auto-run");
  }
  if (autoRunState === "completed") {
    return taskStatusState("completed", "task-status-completed", "check-circle-2", "AutoRun completed", "auto-run");
  }
  return taskStatusState("unknown", "task-status-neutral", "circle-help", `AutoRun ${autoRunState || "unknown"}`, "auto-run");
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

function taskLocks(resourceId) {
  if (!resourceId) return [];
  return (state.tree?.sessions || []).filter((session) => sessionControls(session).some((control) => control.resourceId === resourceId));
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

function taskOperationalLabel(autoRun, sessions, lock, statuses) {
  const parts = [];
  if (autoRun) {
    parts.push(`AutoRun ${autoRun.state}, generation ${autoRun.generation}`);
  }
  if (sessions.length === 1) {
    parts.push(taskAgentSessionLabel(sessions[0]));
  } else if (sessions.length > 1) {
    const sessionStatuses = [...new Set(sessions.map((session) => session.agentRunStatus || "open"))].join(", ");
    parts.push(`${sessions.length} agent sessions: ${sessionStatuses}`);
  }
  if (statuses.autoRun?.kind === "auto-recovering") {
    parts.push("No matching active scheduler session");
  }
  if (lock) parts.push(lock.label);
  return parts.join(" · ");
}

function taskAgentSessionLabel(session) {
  const role = session.schedulerTurn ? "AutoRun session" : "Agent session";
  const status = session.agentRunStatus || "open";
  return `${role} ${status.replace("waiting_approval", "waiting for approval")}`;
}

function taskOperationalStateKey() {
  if (!state.tree) return "";
  const parts = [];
  for (const project of state.tree.projects || []) {
    const projectState = taskOperationalState(project);
    const summary = projectTaskSummary(project);
    parts.push(`${project.id}:auto=${taskStatusKey(projectState.autoRun)}:session=${taskStatusKey(projectState.session)}:${projectState.lock?.kind || "none"}:${projectState.label}:tasks=${summary.taskCount}:${summary.runningCount}`);
    for (const task of project.children || []) {
      const taskState = taskOperationalState(task);
      parts.push(`${task.id}:auto=${taskStatusKey(taskState.autoRun)}:session=${taskStatusKey(taskState.session)}:${taskState.lock?.kind || "none"}:${taskState.label}`);
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
  if (selectionChanged) {
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
    id === "workspace" ? loadWorkspaceAgents({ force: Boolean(options.forceDetail) }) : loadDetail(id, { force: Boolean(options.forceDetail) }),
    selectionChanged ? loadAgentRuns() : Promise.resolve(),
  ]);
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
    const controls = sessionControls(session);
    const resourceId = session.resourceId || controls[0]?.resourceId || "";
    const isInternal = session.source === "internal";
    const status = isInternal
      ? sessionStatusPresentation(session)
      : taskStatusState("session-external", "session-status-external", "message-square", "External session active", "session");
    const clickable = controls.length > 0 || resourceId;
    const selectedId = state.selectedId;
    const isCurrent = Boolean(selectedId) && selectedId !== "workspace" &&
      (resourceId === selectedId || controls.some((control) => control.resourceId === selectedId));
    const row = document.createElement(clickable ? "button" : "div");
    row.className = `session-row ${isInternal ? "internal-session" : "external-session"} ${status.className} ${clickable ? "clickable-session" : ""} ${isCurrent ? "current-session" : ""}`;
    if (clickable) row.type = "button";
    const agent = isInternal
      ? (state.config?.agents || []).find((item) => item.id === session.agentRunAgentName)
      : null;
    const providerLabel = isInternal ? "AgentHub" : "External";
    const label = isInternal ? agent?.name || session.agentRunAgentName || "AgentHub" : "External";
    const title = sessionDisplayTitle(session, resourceId);
    const metaParts = [providerLabel];
    if (controls.length > 1) {
      metaParts.push(`${controls.length} locks`);
    } else if (resourceId) {
      metaParts.push(resourceId);
    }
    if (session.updatedAt) metaParts.push(relativeTime(session.updatedAt));
    row.title = status.label;
    if (clickable) {
      row.setAttribute("aria-label", `${title}. ${status.label}. ${providerLabel}`);
    }
    row.innerHTML = `
      <span class="session-status-icon task-status-indicator ${status.className} ${status.recentOutput ? "task-status-fresh" : ""}" aria-hidden="true">${icon(status.iconName, "session-status-glyph")}</span>
      <div>
        <strong>${escapeHTML(title)}</strong>
        <span>${escapeHTML(metaParts.join(" · "))}</span>
      </div>
      <span class="session-badge ${isInternal ? "internal" : "external"}">${escapeHTML(label)}</span>
      <span class="drag-handle" draggable="true" title="Drag to reorder">${icon("grip-vertical", "drag-handle-icon")}</span>
    `;
    if (clickable) {
      row.addEventListener("click", () => handleSessionClick(session));
    }
    bindListDrag(row, { kind: "session", id: session.id, projectId: "" });
    list.appendChild(row);
    if (state.sessionMenu?.sessionId === session.id && controls.length > 1) {
      list.appendChild(sessionResourceMenu(session, controls));
    }
  }
}

function sessionDisplayTitle(session, resourceId) {
  const resourceTitle = findResource(resourceId)?.title || "";
  if (session.source === "internal") {
    return session.agentRunTitle || resourceTitle || resourceId || session.id;
  }
  return resourceTitle || resourceId || session.id;
}

function sessionControls(session) {
  const controls = (session.controls || []).filter((control) => control.resourceId);
  if (controls.length === 0 && session.resourceId) {
    return [{ resourceId: session.resourceId, path: "" }];
  }
  return controls;
}

function handleSessionClick(session) {
  const controls = sessionControls(session);
  if (controls.length === 0) return;
  if (controls.length === 1) {
    state.sessionMenu = null;
    selectResource(controls[0].resourceId).catch((err) => toast(err.message));
    return;
  }
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
      state.sessionMenu = null;
      selectResource(button.dataset.sessionResource).catch((err) => toast(err.message));
    });
  });
  return menu;
}

// Replaces the details panel content while keeping the scroll position
// stable. Auto-refresh re-renders the panel in place, so the previous
// scroll offset is restored when the same resource is still selected;
// switching to another resource resets the panel to the top. The panel
// also sets `overflow-anchor: none` in CSS so the browser's scroll
// anchoring cannot drift the restored offset after the DOM swap.
function setDetailsHTML(panel, html) {
  const resourceKey = state.selectedId || "";
  const sameResource = panel.dataset.detailsResource === resourceKey;
  const scrollTop = panel.scrollTop;
  panel.innerHTML = html;
  panel.dataset.detailsResource = resourceKey;
  panel.scrollTop = sameResource ? scrollTop : 0;
}

function renderDetails() {
  const panel = $("detailsPanel");
  const workspaceEditorState = captureWorkspaceAgentsEditorState();
  const previewScrollState = captureFilePreviewScrollState();
  if (!state.tree) {
    setDetailsHTML(panel, emptyDetails());
    return;
  }
  if (state.selectedId === "workspace") {
    setDetailsHTML(panel, workspaceDetails());
    restoreWorkspaceAgentsEditorState(workspaceEditorState);
    restoreFilePreviewScrollState(previewScrollState);
    return;
  }
  const selected = findResource(state.selectedId) || state.tree.projects[0];
  if (!selected) {
    setDetailsHTML(panel, workspaceDetails());
    restoreWorkspaceAgentsEditorState(workspaceEditorState);
    restoreFilePreviewScrollState(previewScrollState);
    return;
  }
  const detail = state.details[selected.id];
  if (!detail) {
    setDetailsHTML(panel, `
      <div class="details-header">
        ${breadcrumb(selected, selected.title)}
        <div class="title-row"><h1>${escapeHTML(selected.title)}${resourceRefBadge(selected.id)}</h1></div>
      </div>
      <div class="empty-state">${icon("loader-circle", "empty-state-icon")}<strong>Loading details...</strong></div>
    `);
    return;
  }
  setDetailsHTML(panel, `
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
    ${fileSection(detail)}
    ${selected.type === "project" ? templateSection(detail) : ""}
    ${artifactSection("Artifacts", detail.artifacts)}
    ${selected.type === "project" ? "" : worktreeSection(detail.repos)}
    ${fileModal()}
    ${diffModal()}
  `);
  restoreFilePreviewScrollState(previewScrollState);
  $("archiveButton")?.addEventListener("click", () => archiveResource(selected.id));
  $("newTaskButton")?.addEventListener("click", () => showTaskForm(selected.id));
  bindTemplateEvents();
}

function templateSection(item) {
  const templates = item.templates || [];
  return `
    <div class="content-section">
      <h3>${icon("layout-template")}<span>Task Templates</span></h3>
      <div class="template-list">
        ${templates.length ? templates.map((template) => `
          <button type="button" class="template-row" data-template-preview="${escapeHTML(template.path)}">
            ${icon("file-text")}
            <span><strong>${escapeHTML(template.title)}</strong><small>${escapeHTML(template.name)}${template.autorun ? " · automatic" : ""}</small></span>
            ${icon("chevron-right")}
          </button>
        `).join("") : emptyListRow("No task templates in templates/*.md.", "layout-template")}
      </div>
    </div>
  `;
}

function bindTemplateEvents() {
  document.querySelectorAll("[data-template-preview]").forEach((button) => {
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
  if (!logs.length) return "";
  return `
    <div class="content-section">
      <h3>${icon("history")}<span>Log</span></h3>
      <div class="log-timeline">
        ${logs.map((entry) => logTimelineEntry(entry)).join("")}
      </div>
    </div>
  `;
}

function logTimelineEntry(entry) {
  const title = entry.title || "Untitled log entry";
  const details = entry.details || "";
  return `
    <details class="log-entry">
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
  let insertedLog = false;
  const sections = files.map((file) => {
    const path = file.path || resourceFilePath(item.path, file.name);
    const section = `
      <div class="content-section">
        <h3>${icon("file-text")}<span>${escapeHTML(file.name)}</span>${openFileAction(file.name, path)}</h3>
        ${renderFileContent(file.name, file.content)}
      </div>
    `;
    if (file.name === "work.md") {
      insertedLog = true;
      return section + logSection(item);
    }
    return section;
  });
  if (!insertedLog) {
    sections.push(logSection(item));
  }
  return sections.join("");
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
  const key = markdownFileKey(name);
  const canCollapse = isLongMarkdownContent(content);
  const expanded = !canCollapse || state.expandedMarkdownFiles.has(key);
  return `
    <div class="markdown-preview ${expanded ? "expanded" : "collapsed"}">
      <div class="markdown-view markdown-rendered">${renderMarkdown(content)}</div>
      ${expanded ? "" : `
        <button type="button" class="markdown-show-all" data-markdown-toggle="${escapeHTML(key)}" aria-expanded="false">
          show all
        </button>
      `}
    </div>
  `;
}

function markdownFileKey(name) {
  return `${state.activeWorkspaceId}:${state.selectedId || "workspace"}:${name}`;
}

function isLongMarkdownContent(content) {
  const text = String(content ?? "");
  return text.length > MARKDOWN_PREVIEW_CHAR_LIMIT || text.split(/\r\n|\r|\n/).length > MARKDOWN_PREVIEW_LINE_LIMIT;
}

function expandMarkdownPreview(button) {
  const key = button.dataset.markdownToggle;
  if (key) {
    state.expandedMarkdownFiles.add(key);
  }
  const preview = button.closest(".markdown-preview");
  if (!preview) {
    renderDetails();
    return;
  }
  preview.classList.remove("collapsed");
  preview.classList.add("expanded");
  button.remove();
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
    button.addEventListener("click", closePreview);
  });
}

function bindWorkspaceAgentsEvents() {
  $("workspaceAgentsContent")?.addEventListener("input", (event) => {
    syncWorkspaceAgentsDraftFromInput(event.target.value);
  });
  $("workspaceAgentsForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    saveWorkspaceAgents().catch((err) => toast(err.message));
  });
}

function bindDiffEvents() {
  document.querySelectorAll("[data-diff-path]").forEach((button) => {
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
    button.addEventListener("click", closeDiff);
  });
}

async function previewFile(section, path) {
  state.modalEnter = "preview";
  state.preview = { section, path, loading: true };
  renderAll();
  try {
    await refreshFilePreview(section, path, { rethrow: true });
  } catch (err) {
    throw err;
  } finally {
    renderAll();
  }
}

async function refreshFilePreview(section, path, options = {}) {
  try {
    const preview = await api(filePreviewURL(section, path));
    state.preview = { section, ...preview };
  } catch (err) {
    state.preview = { section, path, error: err.message };
    if (options.rethrow) throw err;
  }
}

async function saveWorkspaceAgents() {
  if (!state.activeWorkspaceId || state.workspaceAgentsSaving) return;
  const content = $("workspaceAgentsContent")?.value || "";
  state.workspaceAgentsSaving = true;
  renderAll();
  try {
    state.workspaceAgents = await api(`/api/workspaces/${state.activeWorkspaceId}/files?path=${encodeURIComponent("AGENTS.md")}`, {
      method: "PUT",
      body: JSON.stringify({ content }),
    });
    state.workspaceAgentsDraft = workspaceAgentsUserContent(state.workspaceAgents.content || "");
    state.workspaceAgentsDirty = false;
    toast("Workspace AGENTS.md saved.");
  } finally {
    state.workspaceAgentsSaving = false;
    renderAll();
  }
}

async function openDiff(repo) {
  state.modalEnter = "diff";
  state.diff = { ...repo, loading: true };
  renderAll();
  try {
    const params = new URLSearchParams({ path: repo.path || "" });
    if (repo.base) params.set("base", repo.base);
    const diff = await api(`/api/workspaces/${state.activeWorkspaceId}/diff?${params.toString()}`);
    state.diff = { ...repo, ...diff };
  } catch (err) {
    state.diff = { ...repo, error: err.message };
    throw err;
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
  state.preview = null;
  renderAll();
}

function closeDiff() {
  state.diff = null;
  renderAll();
}

function filePreviewURL(section, path) {
  const base = section === "Wiki" ? "wiki/files" : "files";
  return `/api/workspaces/${state.activeWorkspaceId}/${base}?path=${encodeURIComponent(path)}`;
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

async function loadAgentRuns() {
  if (!state.activeWorkspaceId) {
    resetAgentState();
    return;
  }
  state.agent.runs = await fetchAgentRuns();
  reconcileActiveAgentRun(state.agent.runs);
  if (state.agent.activeRunId) {
    await loadCanonicalAgentEvents();
  } else {
    state.agent.events = [];
    state.agent.notices = [];
    state.agent.historyBeforeId = 0;
  }
  connectAgentStream();
}

async function refreshAgentRunMetadata() {
  if (!state.activeWorkspaceId) return;
  const runs = await fetchAgentRuns();
  state.agent.runs = runs;
  if (reconcileActiveAgentRun(runs)) {
    await loadCanonicalAgentEvents();
    connectAgentStream();
  }
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
  const autoRun = runs.find((run) => run.schedulerTurn && isLiveAgentRun(run));
  if (autoRun) return autoRun.id;
  if (runs.some((run) => run.id === state.agent.activeRunId)) return state.agent.activeRunId;
  return runs[0]?.id || "";
}

async function fetchCurrentTree() {
  const requestVersion = ++state.treeRequestVersion;
  const tree = await api(`/api/workspaces/${state.activeWorkspaceId}/tree`);
  return requestVersion === state.treeRequestVersion ? tree : null;
}

async function refreshTreeAfterAgentSessionMutation() {
  if (!state.activeWorkspaceId || !state.tree) return;
  const tree = await fetchCurrentTree();
  if (tree) state.tree = tree;
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
  if (!state.activeWorkspaceId || !state.agent.activeRunId) {
    state.agent.events = [];
    state.agent.notices = [];
    state.agent.eventsHasMore = false;
    state.agent.historyBeforeId = 0;
    return;
  }
  const detail = await api(`/api/workspaces/${state.activeWorkspaceId}/agent/runs/${state.agent.activeRunId}`);
  // Event history comes from the AgentHub proxy; the detail response only
  // carries run metadata. Open with exactly one durable tail page; older
  // pages load only when the user clicks "Load older messages".
  const body = await api(`/api/workspaces/${state.activeWorkspaceId}/agent/runs/${state.agent.activeRunId}/events?latest=true&limit=${AGENT_OLDER_RAW_PAGE_LIMIT}`);
  const events = body.events || [];
  state.agent.historyBeforeId = oldestRawAgentEventID(events);
  state.agent.events = mergeCanonicalAgentEvents(events);
  state.agent.eventsHasMore = Boolean(body.page?.hasMoreBefore);
  const index = state.agent.runs.findIndex((run) => run.id === detail.run.id);
  if (index >= 0) {
    state.agent.runs[index] = detail.run;
  }
  scheduleAgentLogAutoFill();
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
  state.agent.activeRunId = "";
  state.agent.events = [];
  state.agent.notices = [];
  state.agent.historyBeforeId = 0;
  clearAgentDraftMemory();
  await loadAgentRuns();
}

function resetAgentState() {
  flushAgentDraft();
  discardAgentUploadDialog();
  closeAgentStream();
  state.agent.runs = [];
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
  state.agent.toolGroupOpen.clear();
  state.agent.approvalDrafts.clear();
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
    try {
      appendCanonicalAgentEvent(JSON.parse(event.data));
    } catch (err) {
      console.warn("agent event parse failed", err);
    }
  };
  stream.addEventListener("forge.notice", (event) => {
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
  if (["turn.completed", "turn.failed", "turn.cancelled", "session.state", "approval.requested", "approval.resolved"].includes(event.type)) {
    refreshAgentRunMetadata().then(renderAll).catch((err) => console.warn("agent refresh failed", err));
  } else {
    scheduleAgentRender();
  }
}

function appendForgeNotice(notice) {
  if (notice?.source !== "forge" || notice?.type !== "forge.notice") return;
  state.agent.notices.push(notice);
  if (state.agent.notices.length > 20) state.agent.notices.shift();
  scheduleAgentRender();
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
  const controls = $("agentControls");
  const wrap = $("agentSessionsWrap");
  const activeRun = currentAgentRun();
  const visibleRun = activeRun || state.agent.runs[0] || null;
  controls.hidden = true;
  controls.innerHTML = "";
  const detail = state.details[state.selectedId];
  wrap.innerHTML = `
    ${autoRunStatus(detail)}
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

function autoRunStatus(detail) {
  const run = detail?.autoRun;
  if (!run) return "";
  const presentation = autoRunPresentation(run.state);
  const latest = (detail.logs || []).find((entry) => entry.autoRun && entry.autoRunGeneration === run.generation && ["Auto Run paused", "Auto Run failed", "Auto Run retry"].includes(entry.title));
  const profiles = run.preferredAgentProfiles || [];
  const actual = currentAgentRun();
  const actualSelection = actual?.schedulerTurn && actual.resourceId === detail.id
    ? `${actual.agentProfile ? `${actual.agentProfile} → ` : ""}${actual.agentHubAgentName || ""}`
    : "";
  return `
    <section class="autorun-status autorun-status-${presentation.key} autorun-collapsible${state.agent.autoRunExpanded ? " expanded" : ""}" role="status" aria-label="AutoRun: ${escapeHTML(presentation.label)}">
      <div class="autorun-status-heading" data-autorun-toggle role="button" tabindex="0" aria-expanded="${state.agent.autoRunExpanded ? "true" : "false"}">
        <div class="autorun-status-title"><i data-lucide="workflow" class="autorun-title-icon" aria-hidden="true"></i><strong>AutoRun</strong></div>
        <span class="autorun-state autorun-state-${presentation.key}">
          <i data-lucide="${presentation.icon}" class="autorun-state-icon" aria-hidden="true"></i>
          <span>${escapeHTML(presentation.label)}</span>
        </span>
        ${icon(state.agent.autoRunExpanded ? "chevron-up" : "chevron-down", "autorun-expand-icon")}
      </div>
      <small>Generation ${escapeHTML(String(run.generation))}${profiles.length ? ` · Preferred: ${escapeHTML(profiles.join(" → "))}` : " · Workspace default"}</small>
      ${actualSelection ? `<p>Actual Agent: ${escapeHTML(actualSelection)}${actual.agentSelectionReason ? ` · ${escapeHTML(actual.agentSelectionReason)}` : ""}</p>` : ""}
      ${run.suspensionSummary ? `<p>Suspend reason: ${escapeHTML(run.suspensionSummary)}</p>` : ""}
      ${latest?.details ? `<p>${escapeHTML(latest.details)}</p>` : ""}
    </section>
  `;
}

function autoRunPresentation(state) {
  const presentations = {
    queued: { label: "Queued", icon: "list-start" },
    running: { label: "Running", icon: "activity" },
    suspended: { label: "Suspended", icon: "pause" },
    paused: { label: "Paused", icon: "pause" },
    completed: { label: "Completed", icon: "circle-check" },
    failed: { label: "Failed", icon: "circle-x" },
  };
  const key = Object.hasOwn(presentations, state) ? state : "unknown";
  return { key, ...(presentations[key] || { label: state || "Unknown", icon: "circle-help" }) };
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

function renderTTYComposer(options = {}) {
  const skipDraftSync = options.skipDraftSync || state.agent.skipTTYDraftSync;
  state.agent.skipTTYDraftSync = false;
  if (!skipDraftSync) syncAgentDraftFromDOM();
  const composer = $("ttyComposer");
  if (!composer) return;
  const activeRun = currentAgentRun();
  if (!activeRun) {
    const key = `none:${state.agent.agentName}:${state.agent.agentChooserOpen ? "chooser" : "closed"}:${state.agent.newSessionStarting ? "starting" : "idle"}:${autoRunComposerKey()}`;
    if (composer.dataset.composerKey === key) return;
    composer.dataset.composerKey = key;
    composer.innerHTML = agentComposerActions();
    return;
  }
  restoreAgentDraftForRun(activeRun);
  if (isLiveAgentRun(activeRun)) {
    const sessionReady = isAgentSessionReady(activeRun);
    const unavailableReason = agentInputUnavailableReason(activeRun, sessionReady);
    const key = `live:${activeRun.id}:${state.agent.agentName}:${sessionReady ? "ready" : "starting"}:${unavailableReason}:${state.agent.sendingInput ? "sending" : "idle"}:${state.agent.agentChooserOpen ? "chooser" : "closed"}:${state.agent.newSessionStarting ? "starting" : "idle"}:${state.agent.sessionActionsOpen ? "actions" : "compact"}:${autoRunComposerKey()}`;
    if (composer.dataset.composerKey === key && $("ttyInput")) return;
    composer.dataset.composerKey = key;
    const inputDisabled = state.agent.sendingInput || unavailableReason ? " disabled" : "";
    const sendIcon = state.agent.sendingInput ? icon("loader-circle") : icon("send");
    const placeholder = unavailableReason || "Send input to the selected agent session";
    const sendTitle = state.agent.sendingInput ? "Sending..." : unavailableReason || "Send input";
    composer.innerHTML = `
      <form id="ttyForm" class="tty-input">
        <span>&gt;</span>
        <textarea id="ttyInput" rows="1" autocomplete="off" data-agent-draft-key="${escapeHTML(state.agent.ttyDraftKey)}" placeholder="${escapeHTML(placeholder)}"${inputDisabled}>${escapeHTML(state.agent.ttyDraft)}</textarea>
        <button type="submit" class="tty-send-button" title="${escapeHTML(sendTitle)}" aria-label="${escapeHTML(sendTitle)}"${inputDisabled}>${sendIcon}</button>
        <button type="button" id="agentUploadButton" class="tty-upload-button" title="Upload files" aria-label="Upload files">${icon("plus")}</button>
        <button type="button" id="agentActionsToggle" class="tty-actions-toggle" title="Session actions" aria-label="Session actions" aria-expanded="${state.agent.sessionActionsOpen ? "true" : "false"}">${icon("ellipsis")}</button>
      </form>
      ${agentComposerActions({ includeClose: true, collapsible: true })}
    `;
    $("ttyInput")?.addEventListener("input", (event) => {
      updateAgentDraft(event.target.value);
      resizeTTYInput(event.target);
    });
    $("ttyInput")?.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" || event.isComposing || event.keyCode === 229) return;
      if (event.metaKey || event.ctrlKey) {
        event.preventDefault();
        $("ttyForm")?.requestSubmit();
        return;
      }
      if (event.shiftKey) {
        state.agent.ttyMultiline = true;
        return;
      }
      if (state.agent.ttyMultiline) return;
      event.preventDefault();
      $("ttyForm")?.requestSubmit();
    });
    resizeTTYInput($("ttyInput"));
    $("ttyForm")?.addEventListener("submit", submitTTYInput);
    return;
  }
  // A stopped AgentHub session resumes with a freshly created Forge session,
  // so the button only needs the AgentHub attachment, not a live Forge session.
  const canResume = Boolean(activeRun.agentHubSessionId || activeRun.sourceExternalId);
  const key = `closed:${activeRun.id}:${canResume ? "resumable" : "final"}:${state.agent.agentName}:${state.agent.agentChooserOpen ? "chooser" : "closed"}:${state.agent.newSessionStarting ? "starting" : "idle"}:${autoRunComposerKey()}`;
  if (composer.dataset.composerKey === key) return;
  composer.dataset.composerKey = key;
  composer.innerHTML = `
    ${agentComposerActions({ includeResume: canResume })}
  `;
}

function isAgentSessionReady(run) {
  if (!isLiveAgentRun(run)) return false;
  if (run.status !== "starting") return true;
  if (state.agent.events.some((event) => event.type === "session.state" && event.data?.state === "ready")) return true;
  return state.agent.eventsHasMore && run.status !== "starting";
}

function agentInputUnavailableReason(run, sessionReady = isAgentSessionReady(run)) {
  if (!sessionReady) return "Agent session is starting.";
  if (run.status === "stopping") return "AgentHub is stopping the provider.";
  if (run.status === "recovering") return "AgentHub event recovery is in progress.";
  if (run.status === "waiting_approval") return "Resolve the pending approval before sending input.";
  return "";
}

function agentComposerActions(options = {}) {
  const selectedAgent = selectedAgentConfig();
  const agents = enabledAgentConfigs();
  const chooserOpen = state.agent.agentChooserOpen && agents.length > 0;
  const sessionStarting = Boolean(state.agent.newSessionStarting);
  const noAgentReason = "No enabled agents are available. Configure an AgentHub Agent in Settings.";
  const sessionButtonTitle = sessionStarting
    ? "Creating a new AgentHub session..."
    : agents.length === 0
      ? noAgentReason
      : "Choose an Agent to start a new session.";
  const sessionButtonDisabled = sessionStarting || agents.length === 0;
  const sessionButtonDisabledAttribute = sessionButtonDisabled ? " disabled" : "";
  const collapsible = Boolean(options.collapsible);
  const actionsClass = `tty-session-actions${collapsible ? " collapsible" : ""}${!collapsible || state.agent.sessionActionsOpen ? " open" : ""}`;
  return `
    <div class="${actionsClass}">
      ${autoRunComposerAction()}
      ${options.includeResume ? `<button type="button" id="agentResumeButton" class="tty-primary-action">${icon("rotate-ccw")}<span>Resume Session</span></button>` : ""}
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
      ${options.includeClose ? `<button type="button" id="agentStopButton" class="secondary-button agent-stop-button">${icon("square")}<span>Close Session</span></button>` : ""}
    </div>
  `;
}

function agentDisplayName(agent) {
  return agent?.name || agent?.id || "Agent";
}

// autoRunComposerAction renders the stateful AutoRun primary action at the
// bottom of a task chat composer. The server re-validates every condition at
// execution time; the matrix below only decides which action is offered and
// which disabled reason is shown.
function autoRunComposerAction() {
  const selected = findResource(state.selectedId);
  const detail = selected ? state.details[selected.id] : null;
  if (!detail || detail.type !== "task") return "";
  const autoRun = detail.autoRun || null;
  const stateName = autoRun?.state || "";
  const liveRuns = state.agent.runs.filter((run) => isLiveAgentRun(run));
  const idleRun = liveRuns.find((run) => run.status === "idle");
  const liveSession = liveRuns.length > 0;
  const starting = state.agent.autoRunStarting;
  let label = "Start AutoRun";
  let iconName = "play";
  let disabledReason = "";
  if (stateName === "queued") {
    label = "AutoRun Queued";
    iconName = "clock";
    disabledReason = `AutoRun generation ${autoRun.generation} is already queued.`;
  } else if (stateName === "running") {
    label = "AutoRun Running";
    iconName = "activity";
    disabledReason = `AutoRun generation ${autoRun.generation} is already running.`;
  } else if (stateName === "suspended") {
    label = "Resume Now";
  } else if (stateName === "paused") {
    label = "Resume AutoRun";
  } else if (stateName === "completed" || stateName === "failed") {
    label = "Start New AutoRun";
  } else if (stateName) {
    label = `AutoRun ${stateName}`;
    disabledReason = `AutoRun cannot be started from the ${stateName} state.`;
  }
  if (!disabledReason && liveRuns.length && !idleRun) {
    disabledReason = liveRuns[0].status === "waiting_approval"
      ? "Resolve the pending approval before starting AutoRun in this session."
      : "The current session is busy; wait until it is idle to start AutoRun.";
  }
  if (!disabledReason && !liveRuns.length && !selectedAgentConfig()) {
    disabledReason = "Select an agent below to start AutoRun without an active session.";
  }
  const disabled = starting || disabledReason;
  const title = starting
    ? "Starting AutoRun..."
    : disabledReason || (liveSession
      ? `${label}: reuse the current idle session.`
      : `${label}: start a new session with ${agentDisplayName(selectedAgentConfig())}.`);
  return `
    <button type="button" id="autoRunStartButton" class="tty-primary-action tty-autorun-action"
      title="${escapeHTML(title)}" aria-label="${escapeHTML(title)}" aria-disabled="${disabled ? "true" : "false"}"${disabled ? " disabled" : ""}>
      ${icon(starting ? "loader-circle" : iconName)}<span>${escapeHTML(starting ? "Starting AutoRun..." : label)}</span>
    </button>
  `;
}

// autoRunComposerKey is the render-cache signature of the composer AutoRun
// action, appended to every composer key so state transitions re-render it.
function autoRunComposerKey() {
  const selected = findResource(state.selectedId);
  const detail = selected ? state.details[selected.id] : null;
  if (!detail || detail.type !== "task") return "no-task";
  const autoRun = detail.autoRun;
  const liveRuns = state.agent.runs.filter((run) => isLiveAgentRun(run));
  const sessionKey = liveRuns.length
    ? (liveRuns.some((run) => run.status === "idle") ? "idle" : "busy")
    : "no-session";
  return `${autoRun?.state || "none"}:${autoRun?.generation || 0}:${sessionKey}:${state.agent.autoRunStarting ? "starting" : "idle"}`;
}

async function startChatAutoRun() {
  return mutateAgentSession(async () => {
    const selected = findResource(state.selectedId);
    const detail = selected ? state.details[selected.id] : null;
    if (!detail || detail.type !== "task") throw new Error("Select a task first.");
    const liveSession = state.agent.runs.some((run) => isLiveAgentRun(run));
    let agentName = "";
    if (!liveSession) {
      const agent = selectedAgentConfig();
      if (!agent) throw new Error("Select an agent to start AutoRun without an active session.");
      agentName = agent.id;
    }
    state.agent.autoRunStarting = true;
    renderTTYComposer();
    bindAgentEvents();
    refreshIcons();
    try {
      const response = await api(`/api/workspaces/${state.activeWorkspaceId}/autorun/start`, {
        method: "POST",
        body: JSON.stringify({ resourceId: selected.id, agentName }),
      });
      if (response.run?.id) state.agent.activeRunId = response.run.id;
      await Promise.all([
        loadAgentRuns(),
        refreshTreeAfterAgentSessionMutation(),
        fetchDetail(selected.id).then((fresh) => { state.details[selected.id] = fresh; }),
      ]);
      renderAll();
      const agent = response.agentName ? ` with ${response.agentName}` : "";
      if (response.action === "queued") {
        toast(response.reason || `AutoRun generation ${response.task?.autoRun?.generation} is queued.`);
      } else {
        toast(`${response.reused ? "AutoRun resumed in the current session" : "AutoRun started"}${agent}.`);
      }
    } finally {
      state.agent.autoRunStarting = false;
      renderTTYComposer();
      bindAgentEvents();
      refreshIcons();
    }
  });
}

function renderSettingsModal() {
  const root = $("settingsRoot");
  if (!root) return;
  if (!state.settings.open) {
    root.innerHTML = "";
    return;
  }
  if (!state.settings.suppressDraftSync) syncSettingsDraftFromDOM();
  state.settings.suppressDraftSync = false;
  const data = state.settings.data || {
    workspaces: state.config?.workspaces || [],
    activeId: state.activeWorkspaceId,
    agents: state.config?.agents || [],
    agentProfiles: state.config?.agentProfiles || [],
  };
  const entering = state.modalEnter === "settings";
  if (entering) state.modalEnter = "";
  root.innerHTML = `
    <div class="settings-overlay${entering ? " modal-enter" : ""}" data-settings-close></div>
    <section class="settings-modal${entering ? " modal-enter" : ""}" role="dialog" aria-modal="true" aria-label="System Settings">
      <aside class="settings-tabs">
        <div class="settings-title">System Settings</div>
        ${settingsTabButton("workspace", "hard-drive", "Workspace")}
        ${settingsTabButton("agenthub", "network", "AgentHub")}
        ${settingsTabButton("profiles", "route", "Profiles")}
      </aside>
      <div class="settings-content">
        <button type="button" class="settings-close" data-settings-close title="Close">${icon("x")}</button>
        ${settingsActivePanel(data)}
      </div>
    </section>
  `;
  bindSettingsEvents();
  refreshIcons();
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
  if (state.settings.tab === "agenthub") return settingsAgentHubPanel(data);
  if (state.settings.tab === "profiles") return settingsProfilesPanel(data);
  return settingsWorkspacePanel(data);
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
        ${(data.workspaces || []).map((workspace) => `
          <div class="settings-list-row">
            <div class="settings-row-main">
              <span class="settings-workspace-mark">${escapeHTML((workspace.name || "W").slice(0, 1).toUpperCase())}</span>
              <span>
                <strong>${escapeHTML(workspace.name)}</strong>
                <small>${escapeHTML(workspace.path)}</small>
              </span>
            </div>
            <div class="settings-row-actions">
              ${workspace.id === data.activeId ? `<span class="settings-pill">Active</span>` : ""}
              <button type="button" class="settings-danger-button" data-remove-workspace="${escapeHTML(workspace.id)}">${icon("trash-2")}</button>
            </div>
          </div>
        `).join("") || `<div class="settings-empty">No workspaces managed by Forge GUI.</div>`}
      </div>
    </div>
  `;
}

function settingsProfilesPanel(data) {
  return `
    <div class="settings-panel settings-agent-panel" data-settings-section="profiles">
      <div class="settings-panel-header">
        <h2>Agent Profiles</h2>
        <p>Profiles map chat and AutoRun preferences to AgentHub agents. System profiles are reserved; the scheduler profile is a future scheduling route and does not start a Scheduler Agent. Custom profile keys must be unique.</p>
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
  document.querySelectorAll("[data-remove-workspace]").forEach((button) => {
    button.addEventListener("click", () => removeSettingsWorkspace(button.dataset.removeWorkspace).catch((err) => toast(err.message)));
  });
  $("settingsSaveButton")?.addEventListener("click", () => {
    saveAgentSettings().catch((err) => toast(err.message));
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
    const isAssistant = item.role === "assistant";
    const content = isAssistant
      ? `<div class="agent-message-content markdown-rendered">${renderMarkdown(item.text)}</div>`
      : `<p>${escapeHTML(item.text)}</p>`;
    const steerTag = item.steer ? `<span class="agent-message-tag">steer</span>` : "";
    return `
      <div class="agent-message-row ${isAssistant ? "assistant final" : "user"}">
        <div class="agent-message-main">
          <div class="agent-message-meta">
            <strong>${escapeHTML(agentMessageSenderName(item))}</strong>
            ${steerTag}
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
  if (item.role !== "assistant") return "You";
  const run = currentAgentRun();
  const agents = state.config?.agents || [];
  const configured = agents.find((agent) => agent.id === run?.agentHubAgentName);
  return agentDisplayName(configured || selectedAgentConfig());
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

function bindAgentEvents() {
  document.querySelector(".agent-session-menu")?.addEventListener("click", (event) => {
    event.stopPropagation();
  });
  const startButton = $("agentStartButton");
  if (startButton) startButton.onclick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (state.agent.newSessionStarting || enabledAgentConfigs().length === 0) return;
    state.agent.agentChooserOpen = !state.agent.agentChooserOpen;
    renderTTYComposer();
    bindAgentEvents();
    refreshIcons();
    if (state.agent.agentChooserOpen) focusAgentChoice();
  };
  document.querySelectorAll("[data-agent-choice]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (state.agent.newSessionStarting) return;
      const agentName = button.dataset.agentChoice || "";
      if (!agentName) return;
      startAgentRun(agentName).catch((err) => toast(err.message));
    });
  });
  const stopButton = $("agentStopButton");
  if (stopButton) stopButton.onclick = () => {
    stopAgentRun().catch((err) => toast(err.message));
  };
  const resumeButton = $("agentResumeButton");
  if (resumeButton) resumeButton.onclick = () => {
    resumeAgentRun().catch((err) => toast(err.message));
  };
  const autoRunButton = $("autoRunStartButton");
  if (autoRunButton) autoRunButton.onclick = () => {
    if (state.agent.autoRunStarting) return;
    startChatAutoRun().catch((err) => toast(err.message));
  };
  const uploadButton = $("agentUploadButton");
  if (uploadButton) uploadButton.onclick = openAgentUploadDialog;
  const actionsToggle = $("agentActionsToggle");
  if (actionsToggle) actionsToggle.onclick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    state.agent.sessionActionsOpen = !state.agent.sessionActionsOpen;
    renderTTYComposer();
    bindAgentEvents();
    refreshIcons();
  };
  document.querySelectorAll("[data-autorun-toggle]").forEach((heading) => {
    const toggle = (event) => {
      if (event.type === "keydown" && event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      event.stopPropagation();
      state.agent.autoRunExpanded = !state.agent.autoRunExpanded;
      renderAgent();
      bindAgentEvents();
      refreshIcons();
    };
    heading.addEventListener("click", toggle);
    heading.addEventListener("keydown", toggle);
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

async function sendAgentInput(text) {
  if (!state.agent.activeRunId) throw new Error("Start or select an agent run first.");
  return api(`/api/workspaces/${state.activeWorkspaceId}/agent/runs/${state.agent.activeRunId}/input`, {
    method: "POST",
    body: JSON.stringify({ text }),
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
    runId: run.id,
    items: [],
    nextId: 1,
  };
  renderAgentUploadDialog();
  $("agentUploadDropZone")?.focus({ preventScroll: true });
}

function closeAgentUploadDialog() {
  if (!state.uploadDialog.open || uploadInProgress()) return;
  const paths = state.uploadDialog.items
    .filter((item) => item.status === "success" && item.path)
    .map((item) => item.path);
  if (paths.length > 0 && state.uploadDialog.runId === state.agent.activeRunId) {
    updateAgentDraft(appendUploadedPaths(state.agent.ttyDraft, paths));
  }
  discardAgentUploadDialog();
  const composer = $("ttyComposer");
  if (composer) delete composer.dataset.composerKey;
  renderTTYComposer();
  bindAgentEvents();
  $("ttyInput")?.focus({ preventScroll: true });
  refreshIcons();
}

function discardAgentUploadDialog() {
  state.uploadDialog = {
    open: false,
    runId: "",
    items: [],
    nextId: 1,
  };
  const root = $("uploadDialogRoot");
  if (root) root.innerHTML = "";
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
  const root = $("uploadDialogRoot");
  if (!root) return;
  if (!state.uploadDialog.open) {
    root.innerHTML = "";
    return;
  }
  const busy = uploadInProgress();
  const items = state.uploadDialog.items;
  const entering = state.modalEnter === "upload";
  if (entering) state.modalEnter = "";
  root.innerHTML = `
    <div class="upload-dialog-layer" role="presentation">
      <div class="upload-dialog-backdrop${entering ? " modal-enter" : ""}" data-upload-close="true"></div>
      <section class="upload-dialog${entering ? " modal-enter" : ""}" role="dialog" aria-modal="true" aria-label="Upload files">
        <header class="upload-dialog-header">
          <div>
            <strong>Upload files</strong>
            <span>Files are saved in this session's artifacts/upload/ directory.</span>
          </div>
          <button class="icon-button" type="button" data-upload-close="true" title="Close" aria-label="Close" ${busy ? "disabled" : ""}>${icon("x")}</button>
        </header>
        <div class="upload-dialog-content">
          <input id="agentUploadInput" type="file" multiple hidden />
          <div id="agentUploadDropZone" class="upload-drop-zone" tabindex="0">
            ${icon("clipboard-paste")}
            <strong>Paste files from the clipboard</strong>
            <span>or choose one or more files from this device</span>
            <button id="agentUploadChooseButton" type="button" class="secondary-button">${icon("folder-open")}<span>Choose files</span></button>
          </div>
          <div class="upload-list" aria-live="polite">
            ${items.length ? items.map(uploadItemRow).join("") : `<div class="upload-empty">Selected or pasted files upload automatically.</div>`}
          </div>
        </div>
        <footer class="upload-dialog-footer">
          <span>${busy ? "Wait for uploads to finish before closing." : uploadSummary(items)}</span>
          <button type="button" data-upload-close="true" ${busy ? "disabled" : ""}>Done</button>
        </footer>
      </section>
    </div>
  `;
  bindAgentUploadDialogEvents();
  refreshIcons();
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
  if (!state.agent.activeRunId) return;
  return mutateAgentSession(async () => {
    await closeAgentRun(state.agent.activeRunId);
    await Promise.all([loadAgentRuns(), refreshTreeAfterAgentSessionMutation()]);
    renderAll();
    toast("Agent session closed.");
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
  await api(`/api/workspaces/${state.activeWorkspaceId}/agent/runs/${runId}/stop`, { method: "POST" });
}

async function resumeAgentRun() {
  if (!state.agent.activeRunId) return;
  return mutateAgentSession(async () => {
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

async function submitTTYInput(event) {
  event.preventDefault();
  if (state.agent.sendingInput) return;
  const input = $("ttyInput");
  const rawText = input?.value || "";
  if (!rawText.trim()) return;
  const sendingRun = currentAgentRun();
  if (!sendingRun) return;
  restoreAgentDraftForRun(sendingRun);
  updateAgentDraft(rawText);
  const sendWorkspaceId = state.activeWorkspaceId;
  const sendRunId = state.agent.activeRunId;
  const sendDraftKey = state.agent.ttyDraftKey;
  const sendDraftVersion = state.agent.ttyDraftVersion;
  let restoreInputFocus = document.activeElement === input;
  const cancelInputFocusRestore = () => {
    restoreInputFocus = false;
  };
  if (restoreInputFocus) {
    document.addEventListener("focusin", cancelInputFocusRestore, true);
  }
  state.agent.sendingInput = true;
  renderTTYComposer();
  refreshIcons();
  try {
    const result = await sendAgentInput(rawText);
    if (result?.status === "accepted") {
      clearAgentDraftAfterAccepted({
        workspaceId: sendWorkspaceId,
        runId: sendRunId,
        key: sendDraftKey,
        text: rawText,
        version: sendDraftVersion,
      });
    }
  } catch (err) {
    toast(err.message);
  } finally {
    document.removeEventListener("focusin", cancelInputFocusRestore, true);
    state.agent.sendingInput = false;
    state.agent.skipTTYDraftSync = true;
    renderTTYComposer();
    if (restoreInputFocus) {
      $("ttyInput")?.focus({ preventScroll: true });
    }
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
  state.modalEnter = "create";
  state.createDialog = {
    open: true,
    type,
    projectId,
    templateName: "",
    title: "",
    description: "",
    detail: "",
    slug: "",
    autorun: false,
    preferredAgentProfiles: [],
    prompt: "",
    submitting: false,
  };
  renderCreateDialog();
}

function closeCreateDialog() {
  if (state.createDialog.submitting) return;
  state.createDialog = {
    open: false,
    type: "",
    projectId: "",
    templateName: "",
    title: "",
    description: "",
    detail: "",
    slug: "",
    autorun: false,
    preferredAgentProfiles: [],
    prompt: "",
    submitting: false,
  };
  renderCreateDialog();
}

function renderCreateDialog() {
  const root = $("createDialogRoot");
  if (!root) return;
  const dialog = state.createDialog;
  if (!dialog.open) {
    root.innerHTML = "";
    delete root.dataset.createDialogKey;
    return;
  }
  const isTask = dialog.type === "task";
  const title = isTask ? "Create task" : "Create project";
  const descriptionPlaceholder = "Describe the project";
  const detailPlaceholder = "Task detail";
  const profiles = state.config?.agentProfiles || [];
  const templates = isTask ? (state.details[dialog.projectId]?.templates || []) : [];
  const renderKey = `${dialog.type}:${dialog.projectId}:${dialog.templateName}:${dialog.autorun}:${dialog.submitting}`;
  if (root.dataset.createDialogKey === renderKey && root.querySelector("#createDialogForm")) return;
  root.dataset.createDialogKey = renderKey;
  const entering = state.modalEnter === "create";
  if (entering) state.modalEnter = "";
  root.innerHTML = `
    <div class="create-dialog-layer" role="presentation">
      <div class="create-dialog-backdrop${entering ? " modal-enter" : ""}" data-create-dialog-close="true"></div>
      <section class="create-dialog${isTask ? " create-task-dialog" : ""}${entering ? " modal-enter" : ""}" role="dialog" aria-modal="true" aria-label="${title}">
        <header class="create-dialog-header">
          <div>
            <strong>${title}</strong>
            ${isTask ? `<span>${escapeHTML(dialog.projectId)}</span>` : ""}
          </div>
          <button class="icon-button" type="button" data-create-dialog-close="true" title="Close" aria-label="Close">${icon("x")}</button>
        </header>
        <form id="createDialogForm" class="details-form create-dialog-form">
          ${isTask ? `
            <div class="create-task-dialog-body">
            ${templates.length ? `
              <label>
                <span>Template</span>
                <select name="templateName">
                  <option value="">Blank task</option>
                  ${templates.map((template) => `<option value="${escapeHTML(template.name)}" ${dialog.templateName === template.name ? "selected" : ""}>${escapeHTML(template.title)}</option>`).join("")}
                </select>
              </label>
            ` : ""}
            <input name="title" required value="${escapeHTML(dialog.title)}" placeholder="Task title" />
            <textarea name="detail" placeholder="${detailPlaceholder}">${escapeHTML(dialog.detail)}</textarea>
            <label class="create-task-automation-toggle">
              <input name="autorun" type="checkbox" ${dialog.autorun ? "checked" : ""} />
              <span><strong>Run automatically</strong><small>Queue a one-turn task for the GUI scheduler.</small></span>
            </label>
            ${dialog.autorun ? `
              <div class="create-task-automation-fields">
                <label>
                  <span>Run prompt</span>
                  <textarea name="prompt" placeholder="Instructions for the automated run">${escapeHTML(dialog.prompt)}</textarea>
                </label>
                <label>
                  <span>Preferred Agent Profiles</span>
                  <input name="agentProfiles" value="${escapeHTML((dialog.preferredAgentProfiles || []).join(", "))}" placeholder="Workspace default, or kimi, codex" />
                  <small>${profiles.length ? `Available: ${profiles.map((profile) => escapeHTML(profile.key)).join(", ")}` : "No Profiles configured; the workspace default will be used."}</small>
                </label>
              </div>
            ` : ""}
            <input name="slug" value="${escapeHTML(dialog.slug)}" placeholder="optional-slug" />
            </div>
            <div class="form-actions">
              <button type="submit" ${dialog.submitting ? "disabled" : ""}>${dialog.submitting ? "Creating..." : "Create"}</button>
              <button type="button" class="secondary" data-create-dialog-close="true" ${dialog.submitting ? "disabled" : ""}>Cancel</button>
            </div>
          ` : `
            <textarea name="description" required placeholder="${descriptionPlaceholder}">${escapeHTML(dialog.description)}</textarea>
            <input name="slug" value="${escapeHTML(dialog.slug)}" placeholder="optional-slug" />
            <div class="form-actions">
              <button type="submit" ${dialog.submitting ? "disabled" : ""}>${dialog.submitting ? "Creating..." : "Create"}</button>
              <button type="button" class="secondary" data-create-dialog-close="true" ${dialog.submitting ? "disabled" : ""}>Cancel</button>
            </div>
          `}
        </form>
      </section>
    </div>
  `;
  bindCreateDialogEvents();
  refreshIcons();
}

function bindCreateDialogEvents() {
  const form = $("createDialogForm");
  if (!form) return;
  form.addEventListener("input", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement)) return;
    if (target.name === "title") state.createDialog.title = target.value;
    if (target.name === "templateName") {
      applyCreateDialogTemplate(target.value);
      return;
    }
    if (target.name === "description") state.createDialog.description = target.value;
    if (target.name === "detail") state.createDialog.detail = target.value;
    if (target.name === "slug") state.createDialog.slug = target.value;
    if (target.name === "prompt") state.createDialog.prompt = target.value;
    if (target.name === "agentProfiles") state.createDialog.preferredAgentProfiles = parseAgentProfiles(target.value);
    if (target.name === "autorun") {
      state.createDialog.autorun = target.checked;
      renderCreateDialog();
    }
  });
  form.addEventListener("submit", submitCreateDialog);
  document.querySelectorAll("[data-create-dialog-close]").forEach((node) => {
    node.addEventListener("click", closeCreateDialog);
  });
  if (!state.createDialog.submitting) {
    (form.elements.title || form.elements.description)?.focus();
  }
}

function applyCreateDialogTemplate(name) {
  const dialog = state.createDialog;
  dialog.templateName = name;
  const template = (state.details[dialog.projectId]?.templates || []).find((item) => item.name === name);
  if (template) {
    dialog.title = template.title || "";
    dialog.detail = template.detail || "";
    dialog.autorun = Boolean(template.autorun);
    dialog.preferredAgentProfiles = template.preferredAgentProfiles || [];
    dialog.prompt = template.prompt || "";
  }
  renderCreateDialog();
}

async function submitCreateDialog(event) {
  event.preventDefault();
  const dialog = state.createDialog;
  if (!dialog.open || dialog.submitting) return;
  const form = new FormData(event.currentTarget);
  dialog.title = String(form.get("title") || "");
  dialog.templateName = String(form.get("templateName") || "");
  dialog.description = String(form.get("description") || "");
  dialog.detail = String(form.get("detail") || "");
  dialog.slug = String(form.get("slug") || "");
  dialog.autorun = form.get("autorun") === "on";
  dialog.preferredAgentProfiles = parseAgentProfiles(String(form.get("agentProfiles") || ""));
  dialog.prompt = String(form.get("prompt") || "");
  dialog.submitting = true;
  renderCreateDialog();
  try {
    if (dialog.type === "project") {
      await api(`/api/workspaces/${state.activeWorkspaceId}/projects`, {
        method: "POST",
        body: JSON.stringify({
          description: dialog.description,
          slug: dialog.slug,
        }),
      });
      toast("Project created.");
      state.selectedId = "workspace";
    } else {
      await api(`/api/workspaces/${state.activeWorkspaceId}/tasks`, {
        method: "POST",
        body: JSON.stringify({
          project: dialog.projectId,
          title: dialog.title,
          ...(dialog.templateName ? { taskMarkdown: dialog.detail } : { detail: dialog.detail }),
          slug: dialog.slug,
          autorun: dialog.autorun,
          preferredAgentProfiles: dialog.autorun ? dialog.preferredAgentProfiles : [],
          prompt: dialog.autorun ? dialog.prompt : "",
        }),
      });
      toast("Task created.");
    }
    state.createDialog.open = false;
    await loadTree();
  } catch (err) {
    dialog.submitting = false;
    renderCreateDialog();
    toast(err.message);
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
  state.settings.tab = tab;
  state.settings.agentDirty = false;
  state.settings.expandedAgents = new Set();
  await refreshSettings();
  renderSettingsModal();
}

function closeSettings() {
  if (state.settings.open && state.settings.agentDirty && !window.confirm("Discard unsaved agent settings changes?")) {
    return;
  }
  state.settings.open = false;
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

function syncSettingsDraftFromDOM() {
  if (!state.settings.open) return;
  const data = state.settings.data || {};
  const next = { ...data };
  let touched = false;
  // Agent settings are split across tabs; only collect sections currently rendered
  // so drafts on other tabs survive tab switches.
  if (document.querySelector('[data-settings-section="profiles"]')) {
    next.agentProfiles = collectSettingsAgentProfiles();
    touched = true;
  }
  if (document.querySelector('[data-settings-section="agenthub"]')) {
    next.agentHub = {
      ...(data.agentHub || {}),
      configuredEndpoint: $("settingsAgentHubEndpoint")?.value.trim() || data.agentHub?.configuredEndpoint || "",
    };
    touched = true;
  }
  if (touched) state.settings.data = next;
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
  const saved = loadPaneSizes();
  if (saved.sidebarWidth) {
    setCSSPixels("--sidebar-width", saved.sidebarWidth);
  }
  if (saved.detailsWidth) {
    setCSSPixels("--details-width", saved.detailsWidth);
  }
  if (saved.sidebarSessionHeight) {
    setCSSPixels("--sidebar-session-height", saved.sidebarSessionHeight);
  }
  $("sidebarResize")?.addEventListener("pointerdown", (event) => startSidebarResize(event));
  $("detailsResize")?.addEventListener("pointerdown", (event) => startDetailsResize(event));
  $("sessionResize")?.addEventListener("pointerdown", (event) => startSessionResize(event));
}

function startSidebarResize(event) {
  event.preventDefault();
  const startX = event.clientX;
  const startWidth = $("app").querySelector(".sidebar").getBoundingClientRect().width;
  startDrag(event.currentTarget, (moveEvent) => {
    // No upper bound: long task names must remain fully visible when widened.
    const width = Math.max(220, startWidth + moveEvent.clientX - startX);
    setCSSPixels("--sidebar-width", width);
  }, saveCurrentPaneSizes);
}

function startDetailsResize(event) {
  event.preventDefault();
  const panel = document.querySelector(".workspace-panel");
  const startX = event.clientX;
  const startWidth = $("detailsPanel").getBoundingClientRect().width;
  startDrag(event.currentTarget, (moveEvent) => {
    const panelWidth = panel.getBoundingClientRect().width;
    const width = clamp(startWidth + moveEvent.clientX - startX, 360, Math.max(360, panelWidth - 328));
    setCSSPixels("--details-width", width);
  }, saveCurrentPaneSizes);
}

function startSessionResize(event) {
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
    setCSSPixels("--sidebar-session-height", height);
  }, saveCurrentPaneSizes, "y");
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

function saveCurrentPaneSizes() {
  const sidebar = document.querySelector(".sidebar")?.getBoundingClientRect().width;
  const details = $("detailsPanel")?.getBoundingClientRect().width;
  const sessionSection = document.querySelector(".session-section")?.getBoundingClientRect().height;
  localStorage.setItem(PANE_SIZE_KEY, JSON.stringify({
    sidebarWidth: Math.round(sidebar || 0),
    detailsWidth: Math.round(details || 0),
    sidebarSessionHeight: Math.round(sessionSection || 0),
  }));
}

function loadPaneSizes() {
  try {
    return JSON.parse(localStorage.getItem(PANE_SIZE_KEY) || "{}");
  } catch (_) {
    return {};
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
  if (event.key === "Escape" && state.uploadDialog.open) {
    closeAgentUploadDialog();
  } else if (event.key === "Escape" && state.mobile.sidebarOpen) {
    setMobileSidebar(false);
  } else if (event.key === "Escape" && state.diff) {
    closeDiff();
  } else if (event.key === "Escape" && state.preview) {
    closePreview();
  } else if (event.key === "Escape" && state.createDialog.open) {
    closeCreateDialog();
  } else if (event.key === "Escape" && state.sessionMenu) {
    state.sessionMenu = null;
    renderSessions();
    refreshIcons();
  } else if (event.key === "Escape" && state.settings.open) {
    closeSettings();
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

document.addEventListener("paste", (event) => {
  if (!state.uploadDialog.open) return;
  const files = clipboardUploadFiles(event.clipboardData);
  if (files.length === 0) return;
  event.preventDefault();
  enqueueAgentUploads(files);
});

document.addEventListener("click", (event) => {
  const target = event.target instanceof Element ? event.target : null;
  const markdownToggle = target?.closest("[data-markdown-toggle]");
  if (markdownToggle) {
    event.preventDefault();
    expandMarkdownPreview(markdownToggle);
    return;
  }
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
  state.activeWorkspaceId = route.workspaceId;
  state.selectedId = route.resourceId || "workspace";
  state.preview = null;
  state.diff = null;
  state.sessionMenu = null;
  if (workspaceChanged) {
    resetWorkspaceAgentsDraft();
    closeCreateDialog();
  }
  if (workspaceChanged) {
    resetAgentState();
  }
  renderWorkspaceSelect();
  if (workspaceChanged) {
    await loadUIState();
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
