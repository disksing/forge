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
      agentId: "",
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
    legacyAgentId: "",
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
    agentId: "",
    optionsOpen: false,
    agentChooserOpen: false,
    historyOpen: false,
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
const AGENT_OLDER_RAW_PAGE_LIMIT = 250;
const AGENT_MANUAL_VISIBLE_EVENT_COUNT = 1;
const AGENT_MANUAL_RAW_PAGE_LIMIT = 500;
const AGENT_MANUAL_AUTO_PAGE_LIMIT = 8;
const AGENT_HIDDEN_EVENT_TYPES = new Set(["session.launch-environment"]);
const MARKDOWN_PREVIEW_CHAR_LIMIT = 2200;
const MARKDOWN_PREVIEW_LINE_LIMIT = 38;

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
}

async function saveUIState() {
  if (!state.activeWorkspaceId) return;
  await api(`/api/workspaces/${state.activeWorkspaceId}/ui-state`, {
    method: "PUT",
    body: JSON.stringify({
      version: 1,
      expandedProjects: [...state.expandedProjects],
      lastResourceId: state.selectedId,
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
  if (!state.activeWorkspaceId || state.autoRefreshInFlight || state.agentSessionMutationCount > 0 || document.hidden) return;
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
  for (const project of state.tree.projects) {
    tree.appendChild(treeButton(project, "project"));
    if (isProjectExpanded(project.id)) {
      const group = document.createElement("div");
      group.className = "task-group";
      for (const task of project.children || []) {
        group.appendChild(treeButton(task, "task"));
      }
      tree.appendChild(group);
    }
  }
  state.taskOperationalStateKey = taskOperationalStateKey();
}

function treeButton(item, kind) {
  const button = document.createElement("button");
  const taskState = taskOperationalState(item);
  const hasTaskState = Boolean(taskState.iconName || taskState.lock);
  button.className = `tree-item ${kind === "task" ? "task-item" : ""} ${hasTaskState ? "has-task-status" : ""} ${taskState.className} ${state.selectedId === item.id ? "active" : ""}`;
  const children = item.children || [];
  const expanded = kind === "project" && isProjectExpanded(item.id);
  const title = item.title || item.id;
  if (taskState.label) {
    button.setAttribute("aria-label", `${title}. ${taskState.label}`);
    bindTaskStatusTooltip(button, taskState.label);
  }
  button.innerHTML = `
    <span class="chevron" ${kind === "project" && children.length ? `data-project-toggle="${escapeHTML(item.id)}"` : ""}>${kind === "project" && children.length ? icon(expanded ? "chevron-down" : "chevron-right") : ""}</span>
    <span class="task-status-slot ${taskState.lock && !taskState.iconName ? "task-status-lock-only" : ""}" aria-hidden="true">
      ${taskState.iconName ? `<span class="task-status-indicator ${taskState.recentOutput ? "task-status-fresh" : ""}">${icon(taskState.iconName, "task-status-icon")}</span>` : ""}
      ${taskState.lock ? `<span class="task-lock-indicator ${taskState.lock.className}">${icon("lock", "task-lock-icon")}</span>` : ""}
    </span>
    ${icon(kind === "project" ? "folder" : "file-text", "tree-icon")}
    <span class="name">${escapeHTML(title)}</span>
  `;
  button.onclick = (event) => {
    if (event.target.closest("[data-project-toggle]")) {
      toggleProject(item.id).catch((err) => toast(err.message));
      return;
    }
    selectResource(item.id).catch((err) => toast(err.message));
  };
  return button;
}

function noTaskOperationalState() {
  return { kind: "none", className: "", iconName: "", label: "", lock: null, recentOutput: false };
}

function taskOperationalState(item) {
  const sessions = taskAgentSessions(item.id);
  const locks = taskLocks(item.id);
  const primary = deriveTaskPrimaryState(item.autoRun, sessions);
  const lock = deriveTaskLockState(locks);
  return {
    ...primary,
    lock,
    label: taskOperationalLabel(item.autoRun, sessions, lock, primary),
  };
}

function deriveTaskPrimaryState(autoRun, sessions) {
  const autoRunState = autoRun?.state || "";
  const approval = sessions.find((session) => session.agentRunStatus === "waiting_approval");
  const active = sessions.find((session) => ["starting", "running", "stopping", "recovering"].includes(session.agentRunStatus));
  const idle = sessions.find((session) => session.agentRunStatus === "idle");

  if (autoRunState === "failed") {
    return taskPrimaryState("failed", "task-status-danger", "triangle-alert", "AutoRun failed");
  }
  if (approval) {
    return taskPrimaryState("approval", "task-status-attention", "shield-question", "Session waiting for approval", approval);
  }
  if (autoRunState === "running") {
    const scheduler = sessions.find((session) => session.schedulerTurn && session.autoRunGeneration === autoRun.generation && ["starting", "running", "stopping", "recovering"].includes(session.agentRunStatus));
    if (scheduler) {
      return taskPrimaryState("auto-running", "task-status-auto-running", "loader-circle", "AutoRun running", scheduler);
    }
    return taskPrimaryState("recovering", "task-status-attention", "rotate-ccw", "AutoRun waiting for scheduler recovery");
  }
  if (active) {
    return taskPrimaryState("session-running", "task-status-session-running", "bot", "Agent session running", active);
  }
  if (autoRunState === "paused") {
    return taskPrimaryState("paused", "task-status-attention", "square", "AutoRun paused");
  }
  if (idle) {
    return taskPrimaryState("session-idle", "task-status-info", "message-square", "Session waiting for input", idle);
  }
  if (autoRunState === "waiting") {
    return taskPrimaryState("waiting", "task-status-attention", "git-branch", "AutoRun waiting for dependencies");
  }
  if (autoRunState === "queued") {
    return taskPrimaryState("queued", "task-status-queued", "clock", "AutoRun queued");
  }
  if (autoRunState === "completed") {
    return taskPrimaryState("completed", "task-status-completed", "check-circle-2", "AutoRun completed");
  }
  return noTaskOperationalState();
}

function taskPrimaryState(kind, className, iconName, primaryLabel, session = null) {
  return {
    kind,
    className,
    iconName,
    primaryLabel,
    recentOutput: Boolean(session && hasRecentAgentOutput(session)),
  };
}

function taskAgentSessions(resourceId) {
  if (!resourceId) return [];
  return (state.tree?.sessions || []).filter((session) => session.resourceId === resourceId);
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
  const agent = (state.config?.agents || []).find((item) => item.id === session.agentRunAgentId);
  return `${agent?.name || session.agentRunAgentId || "Forge GUI"} session`;
}

function taskOperationalLabel(autoRun, sessions, lock, primary) {
  const parts = [];
  if (autoRun) {
    parts.push(`AutoRun ${autoRun.state}, generation ${autoRun.generation}`);
  }
  if (sessions.length === 1) {
    parts.push(taskAgentSessionLabel(sessions[0]));
  } else if (sessions.length > 1) {
    const statuses = [...new Set(sessions.map((session) => session.agentRunStatus || "open"))].join(", ");
    parts.push(`${sessions.length} agent sessions: ${statuses}`);
  }
  if (primary.kind === "recovering") {
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
    parts.push(`${project.id}:${projectState.kind}:${projectState.iconName}:${projectState.recentOutput}:${projectState.lock?.kind || "none"}:${projectState.label}`);
    for (const task of project.children || []) {
      const taskState = taskOperationalState(task);
      parts.push(`${task.id}:${taskState.kind}:${taskState.iconName}:${taskState.recentOutput}:${taskState.lock?.kind || "none"}:${taskState.label}`);
    }
  }
  return parts.join("|");
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
    discardAgentUploadDialog();
    state.preview = null;
    state.diff = null;
    closeAgentStream();
    state.agent.runs = [];
    state.agent.activeRunId = "";
    state.agent.events = [];
    state.agent.notices = [];
    state.agent.historyBeforeId = 0;
    state.agent.ttyDraft = "";
    state.agent.ttyMultiline = false;
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

function renderSessions() {
  const list = $("sessionList");
  list.innerHTML = "";
  const sessions = state.tree?.sessions || [];
  if (sessions.length === 0) {
    list.innerHTML = `<div class="session-row muted-row">${icon("message-square")}<div><strong>No active sessions</strong><span>Start one from a task directory.</span></div></div>`;
    return;
  }
  for (const session of sessions) {
    const controls = sessionControls(session);
    const resourceId = session.resourceId || controls[0]?.resourceId || "";
    const isInternal = session.source === "internal";
    const clickable = controls.length > 0 || resourceId;
    const row = document.createElement(clickable ? "button" : "div");
    row.className = `session-row ${isInternal ? "internal-session" : "external-session"} ${clickable ? "clickable-session" : ""}`;
    if (clickable) row.type = "button";
    const agent = isInternal
      ? (state.config?.agents || []).find((item) => item.id === session.agentRunAgentId)
      : null;
    const providerLabel = isInternal ? "AgentHub" : "External";
    const label = isInternal ? agent?.name || session.agentRunAgentId || "AgentHub" : "External";
    const title = sessionDisplayTitle(session, resourceId);
    const metaParts = [providerLabel];
    if (controls.length > 1) {
      metaParts.push(`${controls.length} locks`);
    } else if (resourceId) {
      metaParts.push(resourceId);
    }
    if (session.updatedAt) metaParts.push(relativeTime(session.updatedAt));
    row.innerHTML = `
      ${icon(isInternal ? "bot" : "message-square")}
      <div>
        <strong>${escapeHTML(title)}</strong>
        <span>${escapeHTML(metaParts.join(" · "))}</span>
      </div>
      <span class="session-badge ${isInternal ? "internal" : "external"}">${escapeHTML(label)}</span>
    `;
    if (clickable) {
      row.addEventListener("click", () => handleSessionClick(session));
    }
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

function renderDetails() {
  const panel = $("detailsPanel");
  const workspaceEditorState = captureWorkspaceAgentsEditorState();
  const previewScrollState = captureFilePreviewScrollState();
  if (!state.tree) {
    panel.innerHTML = emptyDetails();
    return;
  }
  if (state.selectedId === "workspace") {
    panel.innerHTML = workspaceDetails();
    restoreWorkspaceAgentsEditorState(workspaceEditorState);
    restoreFilePreviewScrollState(previewScrollState);
    return;
  }
  const selected = findResource(state.selectedId) || state.tree.projects[0];
  if (!selected) {
    panel.innerHTML = workspaceDetails();
    restoreWorkspaceAgentsEditorState(workspaceEditorState);
    restoreFilePreviewScrollState(previewScrollState);
    return;
  }
  const detail = state.details[selected.id];
  if (!detail) {
    panel.innerHTML = `
      <div class="details-header">
        ${breadcrumb(selected, selected.title)}
        <div class="title-row"><h1>${escapeHTML(selected.title)}</h1></div>
      </div>
      <div class="empty-state">${icon("loader-circle", "empty-state-icon")}<strong>Loading details...</strong></div>
    `;
    return;
  }
  panel.innerHTML = `
    <div class="details-header">
      ${breadcrumb(selected, detail.title)}
      <div class="title-row">
        <h1>${escapeHTML(detail.title)}</h1>
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
  `;
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
  if (state.agent.activeRunId === nextRunId) return false;
  state.agent.activeRunId = nextRunId;
  state.agent.events = [];
  state.agent.notices = [];
  state.agent.eventsHasMore = false;
  state.agent.historyBeforeId = 0;
  state.agent.ttyDraft = "";
  state.agent.ttyMultiline = false;
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
  closeAgentStream();
  state.agent.activeRunId = "";
  state.agent.events = [];
  state.agent.notices = [];
  state.agent.historyBeforeId = 0;
  state.agent.ttyDraft = "";
  state.agent.ttyMultiline = false;
  await loadAgentRuns();
}

function resetAgentState() {
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
  state.agent.ttyDraft = "";
  state.agent.ttyMultiline = false;
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
      state.agent.events[existingIndex] = {
        ...existing,
        time: event.time || existing.time,
        data: { ...existing.data, text: currentText + fragment },
      };
    } else {
      // Full replacement: history replay or the reconnect cursor re-send.
      state.agent.events[existingIndex] = event;
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
  const dependencyItems = detail.autoRunDependencies || (run.after || []);
  const dependencies = dependencyItems.map((dep) => `${dep.taskId}@${dep.generation}${dep.state ? ` (${dep.state})` : ""}`).join(", ");
  const blocked = dependencyItems.some((dep) => dep.state === "failed");
  const profiles = run.preferredAgentProfiles || [];
  const actual = currentAgentRun();
  const actualSelection = actual?.schedulerTurn && actual.resourceId === detail.id
    ? `${actual.agentProfile ? `${actual.agentProfile} → ` : ""}${actual.agentId || ""}`
    : "";
  return `
    <section class="autorun-status autorun-status-${presentation.key}" role="status" aria-label="AutoRun: ${escapeHTML(presentation.label)}">
      <div class="autorun-status-heading">
        <div class="autorun-status-title"><i data-lucide="workflow" class="autorun-title-icon" aria-hidden="true"></i><strong>AutoRun</strong></div>
        <span class="autorun-state autorun-state-${presentation.key}">
          <i data-lucide="${presentation.icon}" class="autorun-state-icon" aria-hidden="true"></i>
          <span>${escapeHTML(presentation.label)}</span>
        </span>
      </div>
      <small>Generation ${escapeHTML(String(run.generation))}${profiles.length ? ` · Preferred: ${escapeHTML(profiles.join(" → "))}` : run.agentId ? ` · Legacy Agent: ${escapeHTML(run.agentId)}` : " · Workspace default"}</small>
      ${actualSelection ? `<p>Actual Agent: ${escapeHTML(actualSelection)}${actual.agentSelectionReason ? ` · ${escapeHTML(actual.agentSelectionReason)}` : ""}</p>` : ""}
      ${dependencies ? `<p>${blocked ? "Blocked by" : "Waiting for"} ${escapeHTML(dependencies)}</p>` : ""}
      ${latest?.details ? `<p>${escapeHTML(latest.details)}</p>` : ""}
    </section>
  `;
}

function autoRunPresentation(state) {
  const presentations = {
    queued: { label: "Queued", icon: "list-start" },
    running: { label: "Running", icon: "activity" },
    waiting: { label: "Waiting", icon: "clock-3" },
    paused: { label: "Paused", icon: "pause" },
    completed: { label: "Completed", icon: "circle-check" },
    failed: { label: "Failed", icon: "circle-x" },
  };
  const key = Object.hasOwn(presentations, state) ? state : "unknown";
  return { key, ...(presentations[key] || { label: state || "Unknown", icon: "circle-help" }) };
}

function agentSelectOptions(agents) {
  return agents.map((agent) => `
    <option value="${escapeHTML(agent.id)}" ${state.agent.agentId === agent.id ? "selected" : ""}>${escapeHTML(agent.name || agent.id)}</option>
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

function renderTTYComposer() {
  const composer = $("ttyComposer");
  if (!composer) return;
  const activeRun = currentAgentRun();
  if (!activeRun) {
    state.agent.ttyDraft = "";
    state.agent.ttyMultiline = false;
    const key = `none:${state.agent.agentId}:${state.agent.agentChooserOpen ? "chooser" : "closed"}`;
    if (composer.dataset.composerKey === key) return;
    composer.dataset.composerKey = key;
    composer.innerHTML = agentComposerActions();
    return;
  }
  if (isLiveAgentRun(activeRun)) {
    const sessionReady = isAgentSessionReady(activeRun);
    const unavailableReason = agentInputUnavailableReason(activeRun, sessionReady);
    const key = `live:${activeRun.id}:${state.agent.agentId}:${sessionReady ? "ready" : "starting"}:${unavailableReason}:${state.agent.sendingInput ? "sending" : "idle"}:${state.agent.agentChooserOpen ? "chooser" : "closed"}`;
    if (composer.dataset.composerKey === key && $("ttyInput")) return;
    composer.dataset.composerKey = key;
    const inputDisabled = state.agent.sendingInput || unavailableReason ? " disabled" : "";
    const sendIcon = state.agent.sendingInput ? icon("loader-circle") : icon("send");
    const placeholder = unavailableReason || "Send input to the selected agent session";
    const sendTitle = state.agent.sendingInput ? "Sending..." : unavailableReason || "Send input";
    composer.innerHTML = `
      <form id="ttyForm" class="tty-input">
        <span>&gt;</span>
        <textarea id="ttyInput" rows="1" autocomplete="off" placeholder="${escapeHTML(placeholder)}"${inputDisabled}>${escapeHTML(state.agent.ttyDraft)}</textarea>
        <button type="submit" class="tty-send-button" title="${escapeHTML(sendTitle)}" aria-label="${escapeHTML(sendTitle)}"${inputDisabled}>${sendIcon}</button>
        <button type="button" id="agentUploadButton" class="tty-upload-button" title="Upload files" aria-label="Upload files">${icon("plus")}</button>
      </form>
      ${agentComposerActions({ includeClose: true })}
    `;
    $("ttyInput")?.addEventListener("input", (event) => {
      state.agent.ttyDraft = event.target.value;
      if (event.target.value.includes("\n")) {
        state.agent.ttyMultiline = true;
      }
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
  const key = `closed:${activeRun.id}:${canResume ? "resumable" : "final"}:${state.agent.agentId}:${state.agent.agentChooserOpen ? "chooser" : "closed"}`;
  if (composer.dataset.composerKey === key) return;
  composer.dataset.composerKey = key;
  state.agent.ttyDraft = "";
  state.agent.ttyMultiline = false;
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
  const agentLabel = selectedAgent ? agentDisplayName(selectedAgent) : "No agent";
  return `
    <div class="tty-session-actions">
      ${options.includeResume ? `<button type="button" id="agentResumeButton" class="tty-primary-action">${icon("rotate-ccw")}<span>Resume Session</span></button>` : ""}
      <div class="tty-new-session-control">
        <button type="button" id="agentStartButton" class="tty-new-session-main" ${selectedAgent ? "" : "disabled"}>
          <span class="tty-new-session-prompt">&gt;</span>
          <span>New Session</span>
        </button>
        <button type="button" id="agentChooserButton" class="tty-new-session-agent" aria-expanded="${chooserOpen ? "true" : "false"}" ${selectedAgent ? "" : "disabled"}>
          <span>with ${escapeHTML(agentLabel)}</span>
          ${icon(chooserOpen ? "chevron-up" : "chevron-down")}
        </button>
        ${chooserOpen ? `
          <div class="tty-agent-menu">
            ${agents.map((agent) => `
              <button type="button" class="${agent.id === selectedAgent?.id ? "active" : ""}" data-agent-choice="${escapeHTML(agent.id)}">
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
    defaultAgentName: state.config?.defaultAgentName || "",
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
        ${settingsDefaultChatAgentSection(data)}
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
        <h2>AutoRun Profiles</h2>
        <p>Portable profile names map AutoRun preferences to AgentHub agent names. Keys must be unique.</p>
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
  const draftAgentId = agents.some((agent) => agent.id === state.settings.newProfile.agentId)
    ? state.settings.newProfile.agentId
    : agents[0]?.id || "";
  state.settings.newProfile.agentId = draftAgentId;
  const targetOptions = (selected) => agents.map((agent) => `<option value="${escapeHTML(agent.id)}" ${agent.id === selected ? "selected" : ""}>${escapeHTML(agent.name || agent.id)}</option>`).join("");
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
        ${profiles.map((profile, index) => `
          <div class="settings-profile-row" data-profile-index="${index}">
            <input data-profile-field="key" value="${escapeHTML(profile.key || "")}" placeholder="kimi" aria-label="Profile key" />
            <input data-profile-field="description" value="${escapeHTML(profile.description || "")}" placeholder="Kimi coding agent" aria-label="Summary" />
            <select data-profile-field="agentId" aria-label="AgentHub Agent">${targetOptions(profile.agentId)}</select>
            <button type="button" class="settings-danger-button" data-remove-profile="${index}" title="Delete Profile">${icon("trash-2")}</button>
          </div>
        `).join("")}
        <div class="settings-profile-row settings-profile-new">
          <input id="settingsNewProfileKey" value="${escapeHTML(state.settings.newProfile.key)}" placeholder="New key" aria-label="New profile key" />
          <input id="settingsNewProfileDescription" value="${escapeHTML(state.settings.newProfile.description)}" placeholder="New profile summary" aria-label="New profile summary" />
          <select id="settingsNewProfileAgent" aria-label="New profile agent" ${agents.length ? "" : "disabled"}>${targetOptions(draftAgentId) || `<option value="">No Agents</option>`}</select>
          <button type="button" id="settingsAddProfileButton" ${agents.length ? "" : "disabled"}>${icon("plus")}<span>Add</span></button>
        </div>
      </div>
    </section>
  `;
}

function settingsDefaultChatAgentSection(data) {
  const agents = settingsEnabledAgents(data);
  const defaultID = agents.some((agent) => agent.id === data.defaultAgentName)
    ? data.defaultAgentName
    : agents[0]?.id || "";
  return `
    <section class="settings-agent-section">
      <div class="settings-section-heading">
        <h3>Default Chat Agent</h3>
        <span id="settingsDefaultChatAgentLabel">${defaultID ? escapeHTML(agentDisplayName(agents.find((agent) => agent.id === defaultID))) : "None"}</span>
      </div>
      <label class="settings-default-agent">
        <span>Agent</span>
        <select id="settingsDefaultChatAgent" ${agents.length ? "" : "disabled"}>
          ${agents.map((agent) => `<option value="${escapeHTML(agent.id)}" ${agent.id === defaultID ? "selected" : ""}>${escapeHTML(agentDisplayName(agent))}</option>`).join("") || `<option value="">No enabled agents</option>`}
        </select>
      </label>
    </section>
  `;
}

function settingsEnabledAgents(data) {
  return (data.agents || []).filter((agent) => agent.available !== false);
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
  $("settingsNewProfileAgent")?.addEventListener("change", (event) => { state.settings.newProfile.agentId = event.target.value; });
  $("settingsDefaultChatAgent")?.addEventListener("change", (event) => {
    state.settings.data = { ...(state.settings.data || {}), defaultAgentName: event.target.value };
    const label = $("settingsDefaultChatAgentLabel");
    if (label) label.textContent = event.target.selectedOptions[0]?.textContent || "None";
    markAgentSettingsDirty();
  });
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
  const configured = agents.find((agent) => agent.id === run?.agentId);
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
  if (startButton) startButton.onclick = () => {
    startAgentRun().catch((err) => toast(err.message));
  };
  const chooserButton = $("agentChooserButton");
  if (chooserButton) chooserButton.onclick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    state.agent.agentChooserOpen = !state.agent.agentChooserOpen;
    renderTTYComposer();
    bindAgentEvents();
    refreshIcons();
  };
  document.querySelectorAll("[data-agent-choice]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      state.agent.agentId = button.dataset.agentChoice;
      state.agent.agentChooserOpen = false;
      renderTTYComposer();
      bindAgentEvents();
      refreshIcons();
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
  const uploadButton = $("agentUploadButton");
  if (uploadButton) uploadButton.onclick = openAgentUploadDialog;
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

async function startAgentRun() {
  return mutateAgentSession(async () => {
    if (!state.activeWorkspaceId) throw new Error("Select a workspace first.");
    const selected = findResource(state.selectedId);
    const agent = selectedAgentConfig();
    if (!agent) throw new Error("Select an enabled agent first.");
    const response = await api(`/api/workspaces/${state.activeWorkspaceId}/agent/runs`, {
      method: "POST",
      body: JSON.stringify({
        agentId: agent.id,
        resourceId: selected?.id || "",
        title: selected?.title || workspaceName(),
        prompt: "",
        cwd: agentDefaultCwd(),
      }),
    });
    state.agent.draftPrompt = "";
    state.agent.ttyDraft = "";
    state.agent.ttyMultiline = false;
    state.agent.optionsOpen = false;
    state.agent.agentChooserOpen = false;
    state.agent.historyOpen = false;
    state.agent.activeRunId = response.run.id;
    await Promise.all([loadAgentRuns(), refreshTreeAfterAgentSessionMutation()]);
    renderAll();
    toast("Agent session started.");
  });
}

async function sendAgentInput(text) {
  if (!state.agent.activeRunId) throw new Error("Start or select an agent run first.");
  await api(`/api/workspaces/${state.activeWorkspaceId}/agent/runs/${state.agent.activeRunId}/input`, {
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
  if (input) state.agent.ttyDraft = input.value;
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
    state.agent.ttyDraft = appendUploadedPaths(state.agent.ttyDraft, paths);
    state.agent.ttyMultiline = state.agent.ttyDraft.includes("\n");
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
    const previousRun = currentAgentRun();
    if (previousRun && isLiveAgentRun(previousRun) && !previousRun.schedulerTurn) {
      await closeAgentRun(previousRun.id);
    }
    state.agent.activeRunId = runId;
    state.agent.ttyDraft = "";
    state.agent.ttyMultiline = false;
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
    const response = await api(`/api/workspaces/${state.activeWorkspaceId}/agent/runs/${state.agent.activeRunId}/resume`, { method: "POST" });
    state.agent.activeRunId = response.run.id;
    state.agent.ttyDraft = "";
    state.agent.ttyMultiline = false;
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
  let restoreInputFocus = document.activeElement === input;
  const cancelInputFocusRestore = () => {
    restoreInputFocus = false;
  };
  if (restoreInputFocus) {
    document.addEventListener("focusin", cancelInputFocusRestore, true);
  }
  state.agent.ttyDraft = rawText;
  state.agent.sendingInput = true;
  renderTTYComposer();
  refreshIcons();
  try {
    await sendAgentInput(rawText);
    state.agent.ttyDraft = "";
    state.agent.ttyMultiline = false;
  } catch (err) {
    toast(err.message);
  } finally {
    document.removeEventListener("focusin", cancelInputFocusRestore, true);
    state.agent.sendingInput = false;
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
    legacyAgentId: "",
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
    legacyAgentId: "",
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
          ` : `
            <textarea name="description" required placeholder="${descriptionPlaceholder}">${escapeHTML(dialog.description)}</textarea>
          `}
          <input name="slug" value="${escapeHTML(dialog.slug)}" placeholder="optional-slug" />
          <div class="form-actions">
            <button type="submit" ${dialog.submitting ? "disabled" : ""}>${dialog.submitting ? "Creating..." : "Create"}</button>
            <button type="button" class="secondary" data-create-dialog-close="true" ${dialog.submitting ? "disabled" : ""}>Cancel</button>
          </div>
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
    dialog.legacyAgentId = template.agentId || "";
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
          agentId: dialog.autorun && !dialog.preferredAgentProfiles.length ? dialog.legacyAgentId : "",
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
  const defaultAgentId = defaultChatAgentID();
  if (!agents.some((agent) => agent.id === state.agent.agentId)) {
    state.agent.agentId = defaultAgentId;
  }
}

function selectedAgentConfig() {
  const agents = enabledAgentConfigs();
  const agentId = state.agent.agentId || defaultChatAgentID();
  return agents.find((agent) => agent.id === agentId) || agents[0] || null;
}

function enabledAgentConfigs() {
  return (state.config?.agents || []).filter((agent) => agent.available !== false);
}

function defaultChatAgentID() {
  const agents = enabledAgentConfigs();
  const configured = state.config?.defaultAgentName || state.settings.data?.defaultAgentName || "";
  if (agents.some((agent) => agent.id === configured)) {
    return configured;
  }
  return agents[0]?.id || "";
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
    agentProfiles: (agentHub.config?.agentProfiles || []).map((profile) => ({ ...profile, agentId: profile.agentName })),
    defaultAgentName: agentHub.config?.defaultAgentHubAgentName || "",
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
    defaultAgentName: agentHub.config?.defaultAgentHubAgentName || "",
    agentProfiles: agentHub.config?.agentProfiles || [],
  };
}

function snapshotAgentDraft() {
  const data = state.settings.data || {};
  return {
    agents: data.agents || [],
    agentProfiles: data.agentProfiles || [],
    defaultAgentName: data.defaultAgentName || "",
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
    next.defaultAgentName = $("settingsDefaultChatAgent")?.value || data.defaultAgentName || "";
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
      defaultAgentName: data.defaultAgentName || "",
      agentProfiles: (data.agentProfiles || []).map((profile) => ({
        key: profile.key,
        description: profile.description,
        agentName: profile.agentId,
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
    return { key: field("key"), description: field("description"), agentId: field("agentId") };
  });
}

function addSettingsProfile() {
  const key = state.settings.newProfile.key.trim().toLowerCase();
  const agentId = state.settings.newProfile.agentId;
  if (!key) {
    toast("Profile key is required.");
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
    agentProfiles: [...current, { key, description: state.settings.newProfile.description.trim(), agentId }],
  };
  state.settings.newProfile = { key: "", description: "", agentId };
  markAgentSettingsDirty();
  state.settings.suppressDraftSync = true;
  renderSettingsModal();
}

function removeSettingsProfile(index) {
  syncSettingsDraftFromDOM();
  const current = state.settings.data?.agentProfiles || [];
  if (!Number.isInteger(index) || index < 0 || index >= current.length) return;
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
    const width = clamp(startWidth + moveEvent.clientX - startX, 220, 420);
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
  if ((state.agent.optionsOpen || state.agent.agentChooserOpen || state.agent.historyOpen) && target && !target.closest(".agent-actions") && !target.closest(".agent-sessions") && !target.closest(".tty-composer")) {
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

window.addEventListener("popstate", async () => {
  const route = parseRoute();
  if (!workspaceExists(route.workspaceId)) {
    return;
  }
  const workspaceChanged = state.activeWorkspaceId !== route.workspaceId;
  const previousSelectedId = state.selectedId;
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
