const state = {
  config: null,
  tree: null,
  details: {},
  workspaceAgents: null,
  workspaceAgentsDraft: "",
  workspaceAgentsDirty: false,
  workspaceAgentsSaving: false,
  activeWorkspaceId: "",
  selectedId: "",
  expandedProjects: new Set(),
  expandedPaths: new Set(),
  expandedMarkdownFiles: new Set(),
  preview: null,
  diff: null,
  sessionMenu: null,
  taskOperationalStateKey: "",
  settings: {
    open: false,
    tab: "workspace",
    data: null,
    workspacePath: "",
    createWorkspace: false,
    saving: false,
    newAgent: {
      name: "",
      providerId: "codex",
      options: {},
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
    agentId: "",
    prompt: "",
    submitting: false,
  },
  autoRefreshTimer: null,
  autoRefreshInFlight: false,
  iconRefreshScheduled: false,
  mobile: {
    sidebarOpen: false,
    view: "details",
  },
  agent: {
    runs: [],
    activeRunId: "",
    events: [],
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
    loadingOlder: false,
    sendingInput: false,
    toolGroupOpen: new Map(),
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
const AGENT_INITIAL_VISIBLE_EVENT_COUNT = 80;
const AGENT_OLDER_VISIBLE_EVENT_COUNT = 50;
const AGENT_OLDER_RAW_PAGE_LIMIT = 500;
const AGENT_INITIAL_AUTO_PAGE_LIMIT = 8;
const AGENT_MANUAL_AUTO_PAGE_LIMIT = 16;
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
  state.config = await api("/api/workspaces");
  applyAgentConfig();
  state.activeWorkspaceId = workspaceExists(route.workspaceId) ? route.workspaceId : state.config.activeId || state.config.workspaces[0]?.id || "";
  state.selectedId = route.resourceId || "";
  renderWorkspaceSelect();
  if (state.activeWorkspaceId) {
    await loadUIState();
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
  if (state.selectedId && state.selectedId !== "workspace" && !findResource(state.selectedId)) {
    state.selectedId = "";
  }
  if (!state.selectedId) {
    state.selectedId = state.tree.projects[0]?.id || "workspace";
  }
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
}

async function saveUIState() {
  if (!state.activeWorkspaceId) return;
  await api(`/api/workspaces/${state.activeWorkspaceId}/ui-state`, {
    method: "PUT",
    body: JSON.stringify({
      version: 1,
      expandedProjects: [...state.expandedProjects],
    }),
  });
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
  if (!state.activeWorkspaceId || state.autoRefreshInFlight || document.hidden) return;
  state.autoRefreshInFlight = true;
  try {
    const tree = await api(`/api/workspaces/${state.activeWorkspaceId}/tree`);
    let changed = !sameJSON(state.tree, tree);
    if (changed) {
      state.tree = tree;
    }
    if (state.selectedId && state.selectedId !== "workspace" && !findResource(state.selectedId)) {
      state.selectedId = tree.projects[0]?.id || "workspace";
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
      if (!sameJSON(state.details[state.selectedId], detail)) {
        state.details[state.selectedId] = detail;
        changed = true;
      }
    }
    const runs = await fetchAgentRuns();
    const runsChanged = !sameJSON(state.agent.runs, runs);
    if (runsChanged) {
      state.agent.runs = runs;
      changed = true;
    }
    if (reconcileActiveAgentRun(runs)) {
      await loadAgentEvents();
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
  renderSettingsModal();
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

function renderWorkspaceSelect() {
  const select = $("workspaceSelect");
  select.innerHTML = "";
  for (const workspace of state.config.workspaces) {
    const option = document.createElement("option");
    option.value = workspace.id;
    option.textContent = workspace.name;
    select.appendChild(option);
  }
  select.value = state.activeWorkspaceId;
  const active = state.config.workspaces.find((workspace) => workspace.id === state.activeWorkspaceId);
  $("workspaceAvatar").textContent = (active?.name || "A").trim().slice(0, 1).toUpperCase();
  refreshIcons();
}

function renderTree() {
  hideTaskStatusTooltip();
  const tree = $("projectTree");
  tree.innerHTML = "";
  if (!state.tree) {
    tree.innerHTML = `<div class="empty-state"><div>Add a workspace path to begin.</div></div>`;
    state.taskOperationalStateKey = "";
    return;
  }
  for (const project of state.tree.projects) {
    tree.appendChild(treeButton(project, "project"));
    if (isProjectExpanded(project.id)) {
      for (const task of project.children || []) {
        tree.appendChild(treeButton(task, "task"));
      }
    }
  }
  state.taskOperationalStateKey = taskOperationalStateKey();
}

function treeButton(item, kind) {
  const button = document.createElement("button");
  const taskState = kind === "task" ? taskOperationalState(item) : noTaskOperationalState();
  const hasTaskState = Boolean(taskState.iconName || taskState.lock);
  button.className = `tree-item ${kind === "task" ? "task-item" : ""} ${hasTaskState ? "has-task-status" : ""} ${taskState.className} ${state.selectedId === item.id ? "active" : ""}`;
  const children = item.children || [];
  const expanded = kind === "project" && isProjectExpanded(item.id);
  const title = item.title || item.id;
  if (kind === "task" && taskState.label) {
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
  const active = sessions.find((session) => ["starting", "running"].includes(session.agentRunStatus));
  const idle = sessions.find((session) => session.agentRunStatus === "idle");

  if (autoRunState === "failed") {
    return taskPrimaryState("failed", "task-status-danger", "triangle-alert", "AutoRun failed");
  }
  if (approval) {
    return taskPrimaryState("approval", "task-status-attention", "shield-question", "Session waiting for approval", approval);
  }
  if (autoRunState === "running") {
    const scheduler = sessions.find((session) => session.schedulerTurn && session.autoRunGeneration === autoRun.generation && ["starting", "running"].includes(session.agentRunStatus));
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
  return `${agent?.name || session.agentRunAgentId || providerName(session.agentRunProvider) || "Forge GUI"} session`;
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
    state.preview = null;
    state.diff = null;
    closeAgentStream();
    state.agent.runs = [];
    state.agent.activeRunId = "";
    state.agent.events = [];
    state.agent.ttyDraft = "";
    state.agent.ttyMultiline = false;
  }
  state.selectedId = id;
  state.sessionMenu = null;
  setMobileSidebar(false);
  ensureSelectedProjectExpanded(false);
  syncURL();
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
    const providerLabel = isInternal ? providerName(session.agentRunProvider || "codex") : "External";
    const label = isInternal ? agent?.name || session.agentRunAgentId || providerLabel : "External";
    const title = isInternal ? session.agentRunTitle || resourceId || session.id : session.id;
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
    return;
  }
  const selected = findResource(state.selectedId) || state.tree.projects[0];
  if (!selected) {
    panel.innerHTML = workspaceDetails();
    return;
  }
  const detail = state.details[selected.id];
  if (!detail) {
    panel.innerHTML = `
      <div class="details-header">
        ${breadcrumb(selected, selected.title)}
        <div class="title-row"><h1>${escapeHTML(selected.title)}</h1></div>
      </div>
      <div class="empty-state"><div>Loading details...</div></div>
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
        `).join("") : `<div class="empty-list-row">No task templates in templates/*.md.</div>`}
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
      <div>
        <h1>No workspace selected</h1>
        <p>Add an AgentWorkspace path in the sidebar.</p>
      </div>
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
  `;
}

function workspaceAgentsSection() {
  const agents = state.workspaceAgents;
  let body = `<div class="empty-state"><div>Loading AGENTS.md...</div></div>`;
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
    const section = `
      <div class="content-section">
        <h3>${icon("file-text")}<span>${escapeHTML(file.name)}</span></h3>
        ${renderFileContent(file.name, file.content, file.path || resourceFilePath(item.path, file.name))}
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

function renderFileContent(name, content, path = "") {
  if (name === "AGENTS.md") {
    return renderAgentsFileContent(content);
  }
  if (isMarkdownFile(name)) {
    return renderMarkdownFileContent(name, content, path);
  }
  return `<pre class="markdown-view">${escapeHTML(content)}</pre>`;
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

function renderMarkdownFileContent(name, content, path = "") {
  const key = markdownFileKey(name);
  const canCollapse = isLongMarkdownContent(content);
  const expanded = !canCollapse || state.expandedMarkdownFiles.has(key);
  const openAction = path ? `
    <div class="markdown-preview-toolbar">
      <a class="markdown-open-file" href="${escapeHTML(rawFileURL(path))}" target="_blank" rel="noopener" title="Open file in new window" aria-label="Open ${escapeHTML(name)} in new window">
        ${icon("external-link")}<span>Open</span>
      </a>
    </div>
  ` : "";
  return `
    <div class="markdown-preview ${expanded ? "expanded" : "collapsed"}">
      ${openAction}
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

function artifactSection(title, entries = []) {
  const safeEntries = Array.isArray(entries) ? entries : [];
  return `
    <div class="content-section">
      <h3>${icon(title === "Worktrees" ? "folder-git-2" : "paperclip")}<span>${title}</span></h3>
      <div class="artifact-browser">
        <div class="artifact-tree" role="tree">
          ${safeEntries.length > 0 ? safeEntries.map((entry) => artifactRow(entry, title, 0)).join("") : emptyListRow("No artifacts.")}
        </div>
      </div>
    </div>
  `;
}

function artifactRow(entry, section, depth) {
  const key = artifactKey(section, entry.path);
  const isDirectory = entry.type === "directory";
  const expanded = state.expandedPaths.has(key);
  const active = state.preview?.section === section && state.preview?.path === entry.path;
  const children = isDirectory && expanded ? (entry.children || []).map((child) => artifactRow(child, section, depth + 1)).join("") : "";
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
          ${icon(isDirectory ? (expanded ? "folder-open" : "folder") : "file", "artifact-icon")}
          <span class="artifact-name" title="${escapeHTML(entry.path)}">${escapeHTML(entry.name)}</span>
        </span>
        <small>${isDirectory ? `${(entry.children || []).length} items` : formatBytes(entry.size || 0)}</small>
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
        ${safeRepos.length > 0 ? safeRepos.map(worktreeRow).join("") : emptyListRow("No worktrees.")}
      </div>
    </div>
  `;
}

function emptyListRow(message) {
  return `<div class="empty-list-row">${escapeHTML(message)}</div>`;
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
  const body = fileModalBody(preview);
  return `
    <div class="file-modal-layer" role="presentation">
      <div class="file-modal-backdrop" data-modal-close="true"></div>
      <section class="file-modal" role="dialog" aria-modal="true" aria-label="File preview">
        <header class="file-modal-header">
          <div>
            <strong>${escapeHTML(preview.name || fileNameFromPath(preview.path))}</strong>
            <span>${escapeHTML(preview.path || "")}${preview.size != null ? ` · ${formatBytes(preview.size)}` : ""}${preview.truncated ? " · truncated" : ""}</span>
          </div>
          <div class="file-modal-actions">
            <a class="secondary-button file-modal-open" href="${escapeHTML(rawFileURL(preview.path))}" target="_blank" rel="noopener" title="Open file in new window">
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
  const title = diff.branch || diff.name || "Diff";
  return `
    <div class="diff-modal-layer" role="presentation">
      <div class="file-modal-backdrop" data-diff-close="true"></div>
      <section class="diff-modal" role="dialog" aria-modal="true" aria-label="Worktree diff">
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
        <img src="${escapeHTML(rawFileURL(preview.path))}" alt="${escapeHTML(preview.name || preview.path)}" />
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
    button.addEventListener("click", () => {
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
  state.preview = { section, path, loading: true };
  renderAll();
  try {
    const preview = await api(`/api/workspaces/${state.activeWorkspaceId}/files?path=${encodeURIComponent(path)}`);
    state.preview = { section, ...preview };
  } catch (err) {
    state.preview = { section, path, error: err.message };
    throw err;
  } finally {
    renderAll();
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

function rawFileURL(path) {
  return `/api/workspaces/${state.activeWorkspaceId}/files/raw?path=${encodeURIComponent(path)}`;
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
    await loadAgentEvents();
  } else {
    state.agent.events = [];
  }
  connectAgentStream();
}

function reconcileActiveAgentRun(runs) {
  const nextRunId = preferredAgentRunID(runs);
  if (state.agent.activeRunId === nextRunId) return false;
  state.agent.activeRunId = nextRunId;
  state.agent.events = [];
  state.agent.eventsHasMore = false;
  state.agent.ttyDraft = "";
  state.agent.ttyMultiline = false;
  return true;
}

function preferredAgentRunID(runs) {
  const autoRun = runs.find((run) => run.schedulerTurn && isLiveAgentRun(run));
  if (autoRun) return autoRun.id;
  if (runs.some((run) => run.id === state.agent.activeRunId)) return state.agent.activeRunId;
  return runs[0]?.id || "";
}

async function refreshTreeSessions() {
  if (!state.activeWorkspaceId || !state.tree) return;
  const tree = await api(`/api/workspaces/${state.activeWorkspaceId}/tree`);
  state.tree.sessions = tree.sessions || [];
}

async function loadAgentEvents() {
  if (!state.activeWorkspaceId || !state.agent.activeRunId) {
    state.agent.events = [];
    state.agent.eventsHasMore = false;
    return;
  }
  const detail = await api(`/api/workspaces/${state.activeWorkspaceId}/agent/runs/${state.agent.activeRunId}`);
  state.agent.events = coalesceAgentEvents(detail.events || []);
  state.agent.eventsHasMore = Boolean(detail.eventsHasMore || detail.eventsTruncated);
  await ensureVisibleAgentEvents(AGENT_INITIAL_VISIBLE_EVENT_COUNT, { maxPages: AGENT_INITIAL_AUTO_PAGE_LIMIT });
  const index = state.agent.runs.findIndex((run) => run.id === detail.run.id);
  if (index >= 0) {
    state.agent.runs[index] = detail.run;
  }
	}

async function loadOlderAgentEvents() {
  if (!state.activeWorkspaceId || !state.agent.activeRunId || state.agent.loadingOlder) return;
  if (!oldestAgentEventID()) return;
  const log = $("ttyLog");
  const previousHeight = log?.scrollHeight || 0;
  const targetVisibleCount = visibleAgentEventCount() + AGENT_OLDER_VISIBLE_EVENT_COUNT;
  state.agent.loadingOlder = true;
  renderTTY({ stickToBottom: false });
  try {
    await ensureVisibleAgentEvents(targetVisibleCount, { maxPages: AGENT_MANUAL_AUTO_PAGE_LIMIT });
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
  const maxPages = options.maxPages || AGENT_INITIAL_AUTO_PAGE_LIMIT;
  let pages = 0;
  while (state.agent.eventsHasMore && visibleAgentEventCount() < targetCount && pages < maxPages) {
    const loaded = await loadOlderAgentEventsPage();
    if (!loaded) break;
    pages++;
  }
}

async function loadOlderAgentEventsPage() {
  const before = oldestAgentEventID();
  if (!before) return false;
  const body = await api(`/api/workspaces/${state.activeWorkspaceId}/agent/runs/${state.agent.activeRunId}/events?before=${encodeURIComponent(before)}&limit=${AGENT_OLDER_RAW_PAGE_LIMIT}`);
  const older = body.events || [];
  state.agent.events = coalesceAgentEvents([...older, ...state.agent.events]);
  state.agent.eventsHasMore = Boolean(body.hasMore);
  return older.length > 0;
}

function visibleAgentEventCount() {
  return displayAgentEvents(state.agent.events).length;
}

function oldestAgentEventID() {
  return state.agent.events.find((event) => event.id > 0)?.id || 0;
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
  state.agent.ttyDraft = "";
  state.agent.ttyMultiline = false;
  await loadAgentRuns();
}

function resetAgentState() {
  closeAgentStream();
  state.agent.runs = [];
  state.agent.activeRunId = "";
  state.agent.events = [];
  state.agent.eventsHasMore = false;
  state.agent.loadingOlder = false;
  state.agent.optionsOpen = false;
  state.agent.agentChooserOpen = false;
  state.agent.historyOpen = false;
  state.agent.ttyDraft = "";
  state.agent.ttyMultiline = false;
  state.agent.toolGroupOpen.clear();
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
  const stream = new EventSource(`/api/workspaces/${state.activeWorkspaceId}/agent/runs/${runId}/stream`);
  stream.onmessage = (event) => {
    try {
      appendAgentEvent(JSON.parse(event.data));
    } catch (err) {
      console.warn("agent event parse failed", err);
    }
  };
  stream.onerror = () => {
    stream.close();
    if (state.agent.stream === stream) {
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

function appendAgentEvent(event) {
  if (!event || isKnownAgentEvent(event)) return;
  event = normalizeAgentEvent(event);
  const last = state.agent.events[state.agent.events.length - 1];
  if (canMergeAgentDelta(last, event)) {
    last.id = event.id;
    last.time = event.time || last.time;
    last.text = `${last.text ?? agentDeltaText(last)}${event.text ?? agentDeltaText(event)}`;
    last.data = event.data || last.data;
  } else {
    state.agent.events.push(event);
  }
  if (["turn/completed", "turn/failed", "error"].includes(event.method) || event.type === "approval_requested") {
    loadAgentRuns().then(renderAll).catch((err) => console.warn("agent refresh failed", err));
  } else {
    scheduleAgentRender();
  }
}

function isKnownAgentEvent(event) {
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

function coalesceAgentEvents(events) {
  const result = [];
  for (const sourceEvent of events) {
    const event = normalizeAgentEvent(sourceEvent);
    const last = result[result.length - 1];
    if (canMergeAgentDelta(last, event)) {
      last.id = event.id;
      last.time = event.time || last.time;
      last.text = `${last.text ?? agentDeltaText(last)}${event.text ?? agentDeltaText(event)}`;
      last.data = event.data || last.data;
    } else {
      result.push(event);
    }
  }
  return result;
}

function normalizeAgentEvent(event) {
  if (!isAgentDelta(event)) return { ...event };
  return { ...event, text: agentNormalizedText(event) };
}

function isAgentDelta(event) {
  return event?.type === "assistant_delta" || event?.type === "reasoning_delta";
}

function agentNormalizedText(event) {
  if (typeof event.text === "string" && event.text !== event.method) {
    return event.text;
  }
  return agentDeltaText(event);
}

function agentDeltaText(event) {
  const delta = agentEventDeltaValue(event);
  if (delta.found) return delta.value;
  if (event.text === event.method) return "";
  return event.text || "";
}

function canMergeAgentDelta(previous, next) {
  if (!isAgentDelta(previous) || !isAgentDelta(next) || previous.type !== next.type) {
    return false;
  }
  const previousItemId = agentEventItemId(previous);
  const nextItemId = agentEventItemId(next);
  if (previousItemId && nextItemId) {
    return previousItemId === nextItemId;
  }
  return previous.method === next.method;
}

function displayAgentEvents(events) {
  const coalesced = markTransientAgentStatus(markFinalAgentResponses(coalesceAgentEvents(events)));
  const completedItems = new Map();
  for (const event of coalesced) {
    if (event.type === "tool" && event.method === "item/completed") {
      const id = agentEventItemId(event);
      if (id) completedItems.set(id, event);
    }
  }
  const visible = coalesced.filter((event) => shouldDisplayAgentEvent(event, completedItems));
  return groupToolEvents(visible);
}

function markTransientAgentStatus(events) {
  const result = events.map((event) => ({ ...event }));
  let activeStatus = -1;
  for (let index = 0; index < result.length; index++) {
    const event = result[index];
    if (isTransientAgentStatus(event)) {
      activeStatus = index;
    } else if (clearsTransientAgentStatus(event)) {
      activeStatus = -1;
    }
  }
  if (activeStatus >= 0) result[activeStatus].isActiveTransientStatus = true;
  return result;
}

function isTransientAgentStatus(event) {
  return ["session/resume", "thread/start", "thread/resume", "thread/goal/cleared", "session/ready"].includes(event?.method) ||
    (event?.type === "system" && /^Starting .+ provider\.$/i.test(event.text || ""));
}

function clearsTransientAgentStatus(event) {
  if (["user", "assistant_delta", "reasoning_delta", "tool", "approval_requested", "error"].includes(event?.type)) return true;
  return ["turn/started", "turn/completed", "turn/failed", "session/prompt"].includes(event?.method);
}

function markFinalAgentResponses(events) {
  const result = events.map((event) => ({ ...event }));
  let lastAssistant = -1;
  for (let index = 0; index < result.length; index++) {
    const event = result[index];
    if (event.type === "assistant_delta") lastAssistant = index;
    if (isAgentTurnStart(event) || event.type === "user") lastAssistant = -1;
    if (isAgentTurnCompletion(event) && lastAssistant >= 0) {
      result[lastAssistant].isFinalResponse = true;
      lastAssistant = -1;
    }
  }
  return result;
}

function isAgentTurnStart(event) {
  return event?.method === "turn/started";
}

function isAgentTurnCompletion(event) {
  return event?.method === "turn/completed" ||
    (event?.method === "session/prompt" && /^OpenCode turn finished:/i.test(event.text || ""));
}

function groupToolEvents(events) {
  const result = [];
  for (const event of events) {
    if (event.type !== "tool") {
      const previous = result[result.length - 1];
      if (event.type === "assistant_delta" && previous?.type === "tool_group") {
        previous.collapsed = true;
      }
      result.push(event);
      continue;
    }
    const last = result[result.length - 1];
    if (last?.type === "tool_group") {
      const previous = last.events[last.events.length - 1];
      const previousID = agentEventItemId(previous);
      const nextID = agentEventItemId(event);
      if (previousID && previousID === nextID) {
        last.events[last.events.length - 1] = event;
      } else {
        last.events.push(event);
      }
    } else {
      result.push({ type: "tool_group", events: [event], collapsed: false });
    }
  }
  return result;
}

function shouldDisplayAgentEvent(event, completedItems = new Map()) {
  if (isTransientAgentStatus(event)) return Boolean(event.isActiveTransientStatus);
  if (event.type === "assistant_delta" || event.type === "reasoning_delta" || event.type === "approval_requested" || event.type === "error") return true;
  if (event.type === "metadata") return false;
  if (event.method === "session/ready" || event.method === "turn/failed") return true;
  if (event.type === "user") return true;
  if (event.type === "tool") {
    const itemType = agentEventItemType(event);
    if (itemType === "userMessage" || itemType === "agentMessage" || itemType === "reasoning") return false;
    if (event.method === "item/commandExecution/outputDelta" || event.method === "command/exec/outputDelta") return false;
    if (event.method === "item/completed") return true;
    if (event.method !== "item/started") return event.method === "session/update";
    const itemId = agentEventItemId(event);
    return !itemId || !completedItems.has(itemId);
  }
  return ![
    "remoteControl/status/changed",
    "mcpServer/startupStatus/updated",
    "thread/status/changed",
    "thread/tokenUsage/updated",
    "account/rateLimits/updated",
    "thread/started",
    "thread/start",
    "turn/started",
    "turn/diff/updated",
    "turn/completed",
    "item/commandExecution/terminalInteraction",
    "forge/session/new",
    "forge/session/end",
    "forge/session/heartbeat",
  ].includes(event.method);
}

function agentEventItemType(event) {
  const data = agentEventData(event);
  return data?.item?.type || data?.sessionUpdate || data?.update?.sessionUpdate || "";
}

function agentEventItemId(event) {
  const data = agentEventData(event);
  return data?.messageId || data?.itemId || data?.item?.id || data?.toolCallId || data?.toolCall?.id || "";
}

function agentEventData(event) {
  try {
    return typeof event?.data === "string" ? JSON.parse(event.data) : event?.data || {};
  } catch (_) {
    return {};
  }
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
  return `
    <section class="autorun-status autorun-status-${presentation.key}" role="status" aria-label="AutoRun: ${escapeHTML(presentation.label)}">
      <div class="autorun-status-heading">
        <div class="autorun-status-title"><i data-lucide="workflow" class="autorun-title-icon" aria-hidden="true"></i><strong>AutoRun</strong></div>
        <span class="autorun-state autorun-state-${presentation.key}">
          <i data-lucide="${presentation.icon}" class="autorun-state-icon" aria-hidden="true"></i>
          <span>${escapeHTML(presentation.label)}</span>
        </span>
      </div>
      <small>Generation ${escapeHTML(String(run.generation))}${run.agentId ? ` · ${escapeHTML(run.agentId)}` : ""}</small>
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
  const options = normalizedProviderAgentOptions(agent.providerId, agent.options);
  const parts = [providerName(agent.providerId)];
  if (agentProviderType(agent.providerId) === "opencode") {
    parts.push(options.mode === "plan" ? "Plan" : "Build");
  } else {
    parts.push(sandboxLabel(options.sandbox), approvalLabel(options.approval));
  }
  if (options.model) parts.push(options.model);
  return parts.filter(Boolean).join(" · ");
}

function providerName(providerId) {
  const provider = (state.config?.agentProviders || state.settings.data?.agentProviders || []).find((item) => item.id === providerId);
  return provider?.name || providerId || "Provider";
}

function agentProviderType(providerId) {
  const provider = (state.config?.agentProviders || state.settings.data?.agentProviders || []).find((item) => item.id === providerId);
  return provider?.type || providerId || "codex";
}

function sandboxLabel(value) {
  if (value === "danger-full-access") return "Full Access";
  if (value === "read-only") return "Read-only";
  return "Workspace";
}

function approvalLabel(value) {
  if (value === "never") return "Never";
  if (value === "untrusted") return "Untrusted";
  return "On request";
}

function agentCurrentSessionRow(run) {
  return `
    <div class="agent-current-session">
      <button type="button" class="agent-current-run ${state.agent.activeRunId === run.id ? "active" : ""}" data-agent-run="${escapeHTML(run.id)}" aria-expanded="${state.agent.historyOpen ? "true" : "false"}" title="Switch session">
        <span>
          <strong>${escapeHTML(run.title || run.id)}</strong>
          <small>${escapeHTML(run.status)} · ${escapeHTML(relativeTime(run.updatedAt))}</small>
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
        <small>${escapeHTML(run.status)} · ${escapeHTML(relativeTime(run.updatedAt))}</small>
      </span>
    </button>
  `;
}

function agentRunRow(run) {
  return `
    <button class="agent-run-row ${state.agent.activeRunId === run.id ? "active" : ""}" data-agent-run="${escapeHTML(run.id)}">
      <span>
        <strong>${escapeHTML(run.title || run.id)}</strong>
        <small>${escapeHTML(run.status)} · ${escapeHTML(relativeTime(run.updatedAt))}</small>
      </span>
    </button>
  `;
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
  if (state.agent.activeRunId) {
    const events = displayAgentEvents(state.agent.events);
    const olderButton = state.agent.eventsHasMore
      ? `<button type="button" id="loadOlderAgentEventsButton" class="load-older-events">${state.agent.loadingOlder ? icon("loader-circle") : icon("chevrons-up")}<span>${state.agent.loadingOlder ? "Loading..." : "Load older messages"}</span></button>`
      : "";
    log.innerHTML = events.length || olderButton
      ? `${olderButton}${events.map(agentEventRow).join("")}`
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
  const key = `resume:${activeRun.id}:${state.agent.agentId}:${state.agent.agentChooserOpen ? "chooser" : "closed"}`;
  if (composer.dataset.composerKey === key) return;
  composer.dataset.composerKey = key;
  state.agent.ttyDraft = "";
  state.agent.ttyMultiline = false;
  composer.innerHTML = `
    ${agentComposerActions({ includeResume: true })}
  `;
}

function isAgentSessionReady(run) {
  if (!isLiveAgentRun(run)) return false;
  if (run.status !== "starting") return true;
  if (state.agent.events.some((event) => event.method === "session/ready")) return true;
  return state.agent.eventsHasMore && run.status !== "starting";
}

function agentInputUnavailableReason(run, sessionReady = isAgentSessionReady(run)) {
  if (!sessionReady) return "Agent session is starting.";
  if (run.status === "waiting_approval") return "Resolve the pending approval before sending input.";
  if (run.schedulerTurn && run.provider === "codex" && !run.codexTurnId) return "AutoRun turn is starting.";
  if (run.schedulerTurn && run.provider === "opencode" && run.status === "running") return "OpenCode cannot accept input during an active turn.";
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
  const data = state.settings.data || {
    workspaces: state.config?.workspaces || [],
    activeId: state.activeWorkspaceId,
    defaultChatAgentId: state.config?.defaultChatAgentId || "",
    agentProviders: state.config?.agentProviders || [],
    agents: state.config?.agents || [],
    codex: { running: false },
    opencode: { running: false },
  };
  root.innerHTML = `
    <div class="settings-overlay" data-settings-close></div>
    <section class="settings-modal" role="dialog" aria-modal="true" aria-label="System Settings">
      <aside class="settings-tabs">
        <div class="settings-title">System Settings</div>
        ${settingsTabButton("workspace", "hard-drive", "Workspace")}
        ${settingsTabButton("agent", "bot", "Agent")}
      </aside>
      <div class="settings-content">
        <button type="button" class="settings-close" data-settings-close title="Close">${icon("x")}</button>
        ${state.settings.tab === "workspace" ? settingsWorkspacePanel(data) : settingsAgentPanel(data)}
      </div>
    </section>
  `;
  bindSettingsEvents();
  refreshIcons();
}

function settingsTabButton(id, iconName, label) {
  return `
    <button type="button" class="settings-tab ${state.settings.tab === id ? "active" : ""}" data-settings-tab="${id}">
      ${icon(iconName)}
      <span>${escapeHTML(label)}</span>
    </button>
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

function settingsAgentPanel(data) {
  const providers = data.agentProviders || [];
  const agents = data.agents || [];
  const codex = data.codex || { running: false };
  const opencode = data.opencode || { running: false };
  return `
    <div class="settings-panel">
      <div class="settings-panel-header">
        <h2>Agents</h2>
        <p>Providers define available runtimes. Agents package provider options for session start.</p>
      </div>
      <section class="settings-agent-section">
        <div class="settings-section-heading">
          <h3>Providers</h3>
          <span>${providers.filter((provider) => provider.enabled).length}/${providers.length} enabled</span>
        </div>
        <div class="settings-provider-list">
          ${providers.map((provider) => settingsProviderRow(provider, codex, opencode)).join("")}
        </div>
      </section>
      ${settingsDefaultChatAgentSection(data)}
      <form id="agentConfigForm" class="settings-agent-form">
        <section class="settings-agent-section">
          <div class="settings-section-heading">
            <h3>Configured Agents</h3>
            <span>${agents.length} total</span>
          </div>
          <div class="settings-agent-list">
            ${agents.map((agent, index) => settingsAgentRow(agent, providers, index)).join("")}
          </div>
        </section>
        ${settingsNewAgentCard(providers)}
        <div class="settings-form-actions">
          <button type="submit">${icon("save")}<span>Save Agents</span></button>
        </div>
      </form>
    </div>
  `;
}

function settingsDefaultChatAgentSection(data) {
  const agents = settingsEnabledAgents(data);
  const defaultID = agents.some((agent) => agent.id === data.defaultChatAgentId)
    ? data.defaultChatAgentId
    : agents[0]?.id || "";
  return `
    <section class="settings-agent-section">
      <div class="settings-section-heading">
        <h3>Default Chat Agent</h3>
        <span>${defaultID ? escapeHTML(agentDisplayName(agents.find((agent) => agent.id === defaultID))) : "None"}</span>
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
  const enabledProviders = new Set((data.agentProviders || []).filter((provider) => provider.enabled).map((provider) => provider.id));
  return (data.agents || []).filter((agent) => enabledProviders.has(agent.providerId));
}

function settingsProviderRow(provider, codex, opencode) {
  const enabled = Boolean(provider.enabled);
  let status = enabled ? "Enabled" : "Disabled";
  if (provider.id === "codex" && codex?.running) {
    status = `Enabled · PID ${escapeHTML(String(codex.pid || ""))}`;
  } else if (provider.id === "opencode" && opencode?.running) {
    status = `Enabled · PID ${escapeHTML(String(opencode.pid || ""))}`;
  }
  const iconName = provider.id === "codex" ? "terminal" : provider.id === "opencode" ? "code-2" : "box";
  return `
    <div class="settings-service-row">
      <div class="settings-provider-main">
        <span class="settings-provider-mark">${icon(iconName)}</span>
        <span>
          <strong>${escapeHTML(provider.name || provider.id)}</strong>
          <small>${escapeHTML(provider.type || provider.id)} · ${status}</small>
        </span>
      </div>
      <button type="button" data-toggle-provider="${escapeHTML(provider.id)}" class="${enabled ? "settings-secondary-button" : ""}">
        ${icon(enabled ? "toggle-right" : "toggle-left")}
        <span>${enabled ? "Disable" : "Enable"}</span>
      </button>
    </div>
  `;
}

function settingsAgentRow(agent, providers, index) {
  const normalized = { ...agent, options: normalizedProviderAgentOptions(agent.providerId, agent.options) };
  return `
    <div class="settings-agent-card settings-agent-row" data-agent-index="${index}">
      <div class="settings-agent-card-head">
        <span class="settings-agent-mark">${escapeHTML((agent.name || agent.id || "A").slice(0, 1).toUpperCase())}</span>
        <label class="settings-agent-name-field">
          <span>Name</span>
          <input data-agent-field="name" value="${escapeHTML(agent.name || "")}" placeholder="Agent name" />
        </label>
        <button type="button" class="settings-danger-button" data-remove-agent="${escapeHTML(agent.id)}" title="Delete agent">${icon("trash-2")}</button>
      </div>
      <div class="settings-agent-summary">${escapeHTML(agentConfigSummary(normalized))}</div>
      <div class="settings-agent-fields">
        <label>
          <span>Provider</span>
          <select data-agent-field="providerId">
            ${providers.map((provider) => `<option value="${escapeHTML(provider.id)}" ${normalized.providerId === provider.id ? "selected" : ""}>${escapeHTML(provider.name || provider.id)}</option>`).join("")}
          </select>
        </label>
        ${settingsProviderOptionFields(normalized.providerId, normalized.options, "data-agent-option")}
      </div>
    </div>
  `;
}

function settingsNewAgentCard(providers) {
  const draft = normalizedNewAgentDraft(providers);
  return `
    <section class="settings-agent-section">
      <div class="settings-section-heading">
        <h3>New Agent</h3>
      </div>
      <div class="settings-agent-card settings-agent-new">
        <div class="settings-agent-card-head">
          <span class="settings-agent-mark muted">${icon("plus")}</span>
          <label class="settings-agent-name-field">
            <span>Name</span>
            <input id="settingsNewAgentName" value="${escapeHTML(draft.name)}" placeholder="Agent name" />
          </label>
          <button type="button" id="settingsAddAgentButton">${icon("plus")}<span>Add</span></button>
        </div>
        <div class="settings-agent-fields">
          <label>
            <span>Provider</span>
            <select id="settingsNewAgentProvider">
              ${providers.map((provider) => `<option value="${escapeHTML(provider.id)}" ${draft.providerId === provider.id ? "selected" : ""}>${escapeHTML(provider.name || provider.id)}</option>`).join("")}
            </select>
          </label>
          ${settingsProviderOptionFields(draft.providerId, draft.options, "data-new-agent-option")}
        </div>
      </div>
    </section>
  `;
}

function settingsProviderOptionFields(providerId, options, attribute) {
  if (agentProviderType(providerId) === "opencode") {
    return `
      <label>
        <span>Mode</span>
        <select ${attribute}="mode">
          <option value="build" ${options.mode === "build" ? "selected" : ""}>Build</option>
          <option value="plan" ${options.mode === "plan" ? "selected" : ""}>Plan</option>
        </select>
      </label>
      <label>
        <span>Model</span>
        <input ${attribute}="model" value="${escapeHTML(options.model || "")}" placeholder="OpenCode default" />
      </label>
    `;
  }
  return `
    <label>
      <span>Sandbox</span>
      <select ${attribute}="sandbox">${sandboxOptions(options.sandbox)}</select>
    </label>
    <label>
      <span>Approval</span>
      <select ${attribute}="approval">${approvalOptions(options.approval)}</select>
    </label>
    <label>
      <span>Model</span>
      <input ${attribute}="model" value="${escapeHTML(options.model || "")}" placeholder="Codex default" />
    </label>
  `;
}

function normalizedProviderAgentOptions(providerId, options = {}) {
  const model = String(options?.model || "").trim();
  if (agentProviderType(providerId) === "opencode") {
    return {
      mode: options?.mode === "plan" ? "plan" : "build",
      ...(model ? { model } : {}),
    };
  }
  return {
    sandbox: ["workspace-write", "read-only", "danger-full-access"].includes(options?.sandbox)
      ? options.sandbox
      : "workspace-write",
    approval: ["on-request", "never", "untrusted"].includes(options?.approval)
      ? options.approval
      : "on-request",
    ...(model ? { model } : {}),
  };
}

function normalizedNewAgentDraft(providers) {
  const available = providers || [];
  const configured = state.settings.newAgent || {};
  const providerId = available.some((provider) => provider.id === configured.providerId)
    ? configured.providerId
    : available[0]?.id || "codex";
  const draft = {
    name: configured.name || "",
    providerId,
    options: normalizedProviderAgentOptions(providerId, configured.options),
  };
  state.settings.newAgent = draft;
  return draft;
}

function sandboxOptions(value) {
  return `
    <option value="workspace-write" ${value === "workspace-write" ? "selected" : ""}>Workspace</option>
    <option value="read-only" ${value === "read-only" ? "selected" : ""}>Read-only</option>
    <option value="danger-full-access" ${value === "danger-full-access" ? "selected" : ""}>Full Access</option>
  `;
}

function approvalOptions(value) {
  return `
    <option value="on-request" ${value === "on-request" ? "selected" : ""}>On request</option>
    <option value="never" ${value === "never" ? "selected" : ""}>Never</option>
    <option value="untrusted" ${value === "untrusted" ? "selected" : ""}>Untrusted</option>
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
  document.querySelectorAll("[data-toggle-provider]").forEach((button) => {
    button.addEventListener("click", () => toggleAgentProvider(button.dataset.toggleProvider).catch((err) => toast(err.message)));
  });
  $("agentConfigForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    saveAgents().catch((err) => toast(err.message));
  });
  $("settingsDefaultChatAgent")?.addEventListener("change", (event) => {
    saveDefaultChatAgent(event.target.value).catch((err) => toast(err.message));
  });
  $("settingsAddAgentButton")?.addEventListener("click", () => {
    addSettingsAgent().catch((err) => toast(err.message));
  });
  document.querySelectorAll("[data-remove-agent]").forEach((button) => {
    button.addEventListener("click", () => removeSettingsAgent(button.dataset.removeAgent).catch((err) => toast(err.message)));
  });
  document.querySelectorAll('.settings-agent-row [data-agent-field="providerId"]').forEach((select) => {
    select.addEventListener("change", () => changeSettingsAgentProvider(Number(select.closest("[data-agent-index]")?.dataset.agentIndex), select.value));
  });
  $("settingsNewAgentName")?.addEventListener("input", (event) => {
    state.settings.newAgent.name = event.target.value;
  });
  $("settingsNewAgentProvider")?.addEventListener("change", (event) => {
    state.settings.newAgent = {
      name: $("settingsNewAgentName")?.value || "",
      providerId: event.target.value,
      options: normalizedProviderAgentOptions(event.target.value),
    };
    renderSettingsModal();
  });
  document.querySelectorAll("[data-new-agent-option]").forEach((field) => {
    field.addEventListener("input", () => {
      state.settings.newAgent.options[field.dataset.newAgentOption] = field.value;
    });
  });
}

function agentEventRow(event) {
  if (event.type === "tool_group") return agentToolGroupRow(event);
  const method = event.method && event.type !== "assistant_delta" ? `<small>${escapeHTML(event.method)}</small>` : "";
  const text = agentDisplayText(event);
  if (event.type === "assistant_delta" || event.type === "user") {
    const isAssistant = event.type === "assistant_delta";
    const responseClass = isAssistant ? (event.isFinalResponse ? " final" : " progress") : "";
    const content = isAssistant
      ? `<div class="agent-message-content markdown-rendered">${renderMarkdown(text)}</div>`
      : `<p>${escapeHTML(text)}</p>`;
    return `
      <div class="agent-message-row ${escapeHTML(event.type === "user" ? "user" : "assistant")}${responseClass}">
        <div class="agent-message-bubble">
          ${content}
        </div>
      </div>
    `;
  }
  if (event.type === "reasoning_delta") {
    return `
      <details class="agent-reasoning-note">
        <summary>${icon("brain-circuit")}<span>Reasoning</span><span class="agent-reasoning-chevron">${icon("chevron-right")}</span></summary>
        <p>${escapeHTML(text)}</p>
      </details>
    `;
  }
  if (event.type === "system" || event.type === "event") {
    return `<div class="agent-system-note">${escapeHTML(text)}</div>`;
  }
  if (event.type === "tool") {
    return `<div class="agent-activity-note">${agentEventIcon(event)}<span>${escapeHTML(toolEventSummary(event))}</span></div>`;
  }
  if (event.type === "approval_requested") {
    return `
      <div class="agent-event approval">
        <div>${icon("shield-question")}<strong>${escapeHTML(text)}</strong>${method}</div>
        <div class="approval-actions">
          <button data-agent-approval="${escapeHTML(event.pendingRequestId)}" data-decision="accept">${icon("check")}<span>Approve</span></button>
          <button data-agent-approval="${escapeHTML(event.pendingRequestId)}" data-decision="decline" class="secondary-button">${icon("x")}<span>Deny</span></button>
        </div>
      </div>
    `;
  }
  return `
    <div class="agent-event ${escapeHTML(event.type)}">
      <div>${agentEventIcon(event)}<strong>${escapeHTML(agentEventTitle(event))}</strong>${method}</div>
      <p>${escapeHTML(text)}</p>
    </div>
  `;
}

function agentToolGroupRow(group) {
  const events = group.events || [];
  const key = agentToolGroupKey(group);
  const userOpen = state.agent.toolGroupOpen.get(key);
  const open = typeof userOpen === "boolean" ? userOpen : !group.collapsed;
  const summaries = events.map(toolEventSummary);
  const preview = summaries.slice(0, 2).join(" · ");
  const remaining = Math.max(0, summaries.length - 2);
  return `
    <details class="agent-tool-group" data-tool-group-key="${escapeHTML(key)}"${open ? " open" : ""}>
      <summary>
        <span class="agent-tool-group-icon">${icon("wrench")}</span>
        <span class="agent-tool-group-title">${events.length} tool ${events.length === 1 ? "call" : "calls"}</span>
        <span class="agent-tool-group-preview">${escapeHTML(preview)}${remaining ? ` · +${remaining} more` : ""}</span>
        <span class="agent-tool-group-chevron">${icon("chevron-right")}</span>
      </summary>
      <div class="agent-tool-list">
        ${events.map(agentToolEventRow).join("")}
      </div>
    </details>
  `;
}

function agentToolGroupKey(group) {
  const first = group.events?.[0] || {};
  const eventKey = agentEventItemId(first) || first.id || first.time || "tool";
  return `${state.agent.activeRunId || "run"}:${eventKey}`;
}

function agentToolEventRow(event) {
  return `
    <details class="agent-tool-item">
      <summary>
        ${agentEventIcon(event)}
        <span>${escapeHTML(toolEventSummary(event))}</span>
        <small>${escapeHTML(event.method || "tool")}</small>
      </summary>
      <pre>${escapeHTML(toolEventDetails(event))}</pre>
    </details>
  `;
}

function toolEventSummary(event) {
  const data = agentEventData(event);
  const item = data?.item || data?.toolCall || data?.update?.toolCall || data;
  const itemType = agentEventItemType(event);
  const command = firstAgentToolValue(item, ["command", "cmd"]);
  const paths = agentToolPaths(item);
  const toolName = firstAgentToolValue(item, ["name", "tool", "title"]);
  if (itemType === "commandExecution") return toolSummaryWithDetail("Command", command);
  if (itemType === "fileChange") return toolSummaryWithDetail("File change", paths.join(", "));
  if (itemType === "mcpToolCall") {
    const server = firstAgentToolValue(item, ["server", "serverName"]);
    return toolSummaryWithDetail("MCP", [server, toolName].filter(Boolean).join(" / "));
  }
  if (itemType === "webSearch") return toolSummaryWithDetail("Web search", firstAgentToolValue(item, ["query"]));
  if (itemType === "tool_call" || itemType === "tool_call_update") return toolSummaryWithDetail("Tool", toolName || command);
  return toolSummaryWithDetail(readableAgentToolType(itemType) || "Tool", toolName || command || paths.join(", "));
}

function toolSummaryWithDetail(label, detail) {
  const compact = String(detail || "").replace(/\s+/g, " ").trim();
  if (!compact) return label;
  return `${label} · ${compact.length > 88 ? `${compact.slice(0, 85)}…` : compact}`;
}

function firstAgentToolValue(item, keys) {
  for (const key of keys) {
    const value = item?.[key] ?? item?.rawInput?.[key] ?? item?.input?.[key] ?? item?.arguments?.[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (Array.isArray(value) && value.length) return value.join(" ");
  }
  return "";
}

function agentToolPaths(item) {
  const values = [item?.path, item?.filePath, item?.rawInput?.path, item?.input?.path];
  for (const change of item?.changes || []) values.push(change?.path, change?.filePath);
  return [...new Set(values.filter((value) => typeof value === "string" && value.trim()).map((value) => value.trim()))];
}

function readableAgentToolType(value) {
  return String(value || "")
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (letter) => letter.toUpperCase());
}

function toolEventDetails(event) {
  const data = agentEventData(event);
  const serialized = Object.keys(data).length ? JSON.stringify(data, null, 2) : agentDisplayText(event);
  if (serialized.length <= 12000) return serialized;
  return `${serialized.slice(0, 12000)}\n… details truncated`;
}

function agentDisplayText(event) {
  if (isAgentDelta(event)) {
    return agentDeltaDisplayText(event);
  }
  return event.text || event.method || event.type;
}

function agentDeltaDisplayText(event) {
  if (typeof event.text === "string" && event.text !== event.method) {
    return event.text;
  }
  return agentDeltaText(event);
}

function agentEventDeltaValue(event) {
  try {
    const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
    if (data && Object.prototype.hasOwnProperty.call(data, "delta") && typeof data.delta === "string") {
      return { found: true, value: data.delta };
    }
    if (typeof data?.content?.text === "string") {
      return { found: true, value: data.content.text };
    }
    for (const key of ["text", "message"]) {
      if (typeof data?.[key] === "string" && data[key].trim() !== "") {
        return { found: true, value: data[key] };
      }
    }
  } catch (_) {
    return { found: false, value: "" };
  }
  return { found: false, value: "" };
}

function agentEventIcon(event) {
  if (event.type === "assistant_delta") return icon("bot");
  if (event.type === "reasoning_delta") return icon("brain-circuit");
  if (event.type === "user") return icon("user");
  if (event.type === "error") return icon("triangle-alert");
  if (event.type === "tool") return icon("terminal");
  return icon("circle-dot");
}

function agentEventTitle(event) {
  if (event.type === "assistant_delta") return "Codex";
  if (event.type === "reasoning_delta") return "Reasoning";
  if (event.type === "user") return "You";
  if (event.type === "error") return "Error";
  if (event.type === "tool") return "Tool";
  return "Event";
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
      resolveAgentApproval(button.dataset.agentApproval, button.dataset.decision).catch((err) => toast(err.message));
    });
  });
}

async function startAgentRun() {
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
  await Promise.all([loadAgentRuns(), refreshTreeSessions()]);
  renderAll();
  toast("Agent session started.");
}

async function sendAgentInput(text) {
  if (!state.agent.activeRunId) throw new Error("Start or select an agent run first.");
  await api(`/api/workspaces/${state.activeWorkspaceId}/agent/runs/${state.agent.activeRunId}/input`, {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

async function stopAgentRun() {
  if (!state.agent.activeRunId) return;
  await closeAgentRun(state.agent.activeRunId);
  await Promise.all([loadAgentRuns(), refreshTreeSessions()]);
  renderAll();
  toast("Agent session closed.");
}

async function switchAgentRun(runId) {
  if (!runId || runId === state.agent.activeRunId) return;
  const previousRun = currentAgentRun();
  if (previousRun && isLiveAgentRun(previousRun) && !previousRun.schedulerTurn) {
    await closeAgentRun(previousRun.id);
  }
  state.agent.activeRunId = runId;
  state.agent.ttyDraft = "";
  state.agent.ttyMultiline = false;
  state.agent.historyOpen = false;
  await Promise.all([loadAgentRuns(), refreshTreeSessions()]);
  renderAll();
}

async function closeAgentRun(runId) {
  if (!runId) return;
  await api(`/api/workspaces/${state.activeWorkspaceId}/agent/runs/${runId}/stop`, { method: "POST" });
}

async function resumeAgentRun() {
  if (!state.agent.activeRunId) return;
  const response = await api(`/api/workspaces/${state.activeWorkspaceId}/agent/runs/${state.agent.activeRunId}/resume`, { method: "POST" });
  state.agent.activeRunId = response.run.id;
  state.agent.ttyDraft = "";
  state.agent.ttyMultiline = false;
  state.agent.historyOpen = false;
  await Promise.all([loadAgentRuns(), refreshTreeSessions()]);
  renderAll();
  toast("Agent session resumed.");
}

async function resolveAgentApproval(requestId, decision) {
  if (!state.agent.activeRunId || !requestId) return;
  await api(`/api/workspaces/${state.activeWorkspaceId}/agent/runs/${state.agent.activeRunId}/approval`, {
    method: "POST",
    body: JSON.stringify({ requestId, decision }),
  });
  await loadAgentRuns();
  renderAll();
}

function currentAgentRun() {
  return state.agent.runs.find((run) => run.id === state.agent.activeRunId) || null;
}

function isLiveAgentRun(run) {
  return ["starting", "running", "waiting_approval", "idle"].includes(run?.status);
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
    agentId: defaultChatAgentID(),
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
    agentId: "",
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
  const agents = enabledAgentConfigs();
  const templates = isTask ? (state.details[dialog.projectId]?.templates || []) : [];
  const renderKey = `${dialog.type}:${dialog.projectId}:${dialog.templateName}:${dialog.autorun}:${dialog.submitting}`;
  if (root.dataset.createDialogKey === renderKey && root.querySelector("#createDialogForm")) return;
  root.dataset.createDialogKey = renderKey;
  root.innerHTML = `
    <div class="create-dialog-layer" role="presentation">
      <div class="create-dialog-backdrop" data-create-dialog-close="true"></div>
      <section class="create-dialog${isTask ? " create-task-dialog" : ""}" role="dialog" aria-modal="true" aria-label="${title}">
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
                  <span>Agent</span>
                  <select name="agentId">
                    <option value="">Workspace default</option>
                    ${agents.map((agent) => `<option value="${escapeHTML(agent.id)}" ${dialog.agentId === agent.id ? "selected" : ""}>${escapeHTML(agent.name || agent.id)}</option>`).join("")}
                  </select>
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
    if (target.name === "agentId") state.createDialog.agentId = target.value;
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
    dialog.agentId = template.agentId || defaultChatAgentID();
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
  dialog.agentId = String(form.get("agentId") || "");
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
      state.selectedId = "";
    } else {
      await api(`/api/workspaces/${state.activeWorkspaceId}/tasks`, {
        method: "POST",
        body: JSON.stringify({
          project: dialog.projectId,
          title: dialog.title,
          ...(dialog.templateName ? { taskMarkdown: dialog.detail } : { detail: dialog.detail }),
          slug: dialog.slug,
          autorun: dialog.autorun,
          agentId: dialog.autorun ? dialog.agentId : "",
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

async function archiveResource(resourceId) {
  if (!confirm(`Archive ${resourceId}?`)) return;
  await api(`/api/workspaces/${state.activeWorkspaceId}/archive`, {
    method: "POST",
    body: JSON.stringify({ resourceId }),
  });
  toast("Archived.");
  state.selectedId = "";
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
  const providers = state.config?.agentProviders || [];
  const enabledProviders = new Set(providers.filter((provider) => provider.enabled).map((provider) => provider.id));
  return (state.config?.agents || []).filter((agent) => enabledProviders.has(agent.providerId));
}

function defaultChatAgentID() {
  const agents = enabledAgentConfigs();
  const configured = state.config?.defaultChatAgentId || state.settings.data?.defaultChatAgentId || "";
  if (agents.some((agent) => agent.id === configured)) {
    return configured;
  }
  return agents[0]?.id || "";
}

async function openSettings(tab = "workspace") {
  state.settings.open = true;
  state.settings.tab = tab;
  await refreshSettings();
  renderSettingsModal();
}

function closeSettings() {
  state.settings.open = false;
  renderSettingsModal();
}

async function refreshSettings() {
  state.settings.data = await api("/api/settings");
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
  await refreshSettings();
  renderSettingsModal();
  toast(created ? "Workspace created." : "Workspace added.");
}

async function removeSettingsWorkspace(id) {
  if (!id) return;
  await api(`/api/workspaces/${encodeURIComponent(id)}`, { method: "DELETE" });
  state.config = await api("/api/workspaces");
  if (state.activeWorkspaceId === id) {
    state.activeWorkspaceId = state.config.activeId || state.config.workspaces[0]?.id || "";
    state.selectedId = "";
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
  await refreshSettings();
  renderSettingsModal();
  toast("Workspace removed from Forge GUI.");
}

async function toggleAgentProvider(providerId) {
  const providers = state.settings.data?.agentProviders || [];
  const provider = providers.find((item) => item.id === providerId);
  if (!provider) return;
  const enabled = Boolean(provider.enabled);
  if (provider.id === "codex") {
    await api(`/api/settings/codex/${enabled ? "stop" : "start"}`, { method: "POST" });
  } else if (provider.id === "opencode") {
    await api(`/api/settings/opencode/${enabled ? "stop" : "start"}`, { method: "POST" });
  }
  await api("/api/settings/agent/providers", {
    method: "PUT",
    body: JSON.stringify(providers.map((item) => item.id === provider.id ? { ...item, enabled: !enabled } : item)),
  });
  state.settings.data = await api("/api/settings");
  state.config = await api("/api/workspaces");
  applyAgentConfig();
  renderAgent();
  renderTTYComposer();
  bindAgentEvents();
  renderSettingsModal();
  refreshIcons();
  toast(enabled ? "Agent provider disabled." : "Agent provider enabled.");
}

async function saveAgents() {
  const saved = await api("/api/settings/agents", {
    method: "PUT",
    body: JSON.stringify(collectSettingsAgents()),
  });
  if (state.config) state.config.agents = saved;
  await refreshSettings();
  if (state.config) {
    state.config.agents = state.settings.data?.agents || saved;
    state.config.defaultChatAgentId = state.settings.data?.defaultChatAgentId || "";
  }
  applyAgentConfig();
  renderAgent();
  renderTTYComposer();
  bindAgentEvents();
  renderSettingsModal();
  refreshIcons();
  toast("Agents saved.");
}

async function saveDefaultChatAgent(agentId) {
  const saved = await api("/api/settings/agent/default-chat", {
    method: "PUT",
    body: JSON.stringify({ agentId }),
  });
  const defaultChatAgentId = saved.defaultChatAgentId || "";
  if (state.config) state.config.defaultChatAgentId = defaultChatAgentId;
  state.settings.data = { ...(state.settings.data || {}), defaultChatAgentId };
  state.agent.agentId = defaultChatAgentId;
  state.agent.agentChooserOpen = false;
  applyAgentConfig();
  renderAgent();
  renderTTYComposer();
  bindAgentEvents();
  renderSettingsModal();
  refreshIcons();
  toast("Default chat agent saved.");
}

function collectSettingsAgents() {
  const existing = state.settings.data?.agents || [];
  return Array.from(document.querySelectorAll(".settings-agent-row")).map((row, index) => {
    const source = existing[index] || {};
    const field = (name) => row.querySelector(`[data-agent-field="${name}"]`)?.value.trim() || "";
    const providerId = field("providerId");
    const rawOptions = {};
    row.querySelectorAll("[data-agent-option]").forEach((optionField) => {
      rawOptions[optionField.dataset.agentOption] = optionField.value.trim();
    });
    return {
      id: source.id || slugID(field("name")),
      name: field("name"),
      providerId,
      options: normalizedProviderAgentOptions(providerId, rawOptions),
    };
  });
}

function changeSettingsAgentProvider(index, providerId) {
  if (!Number.isInteger(index) || index < 0) return;
  const agents = collectSettingsAgents();
  if (!agents[index]) return;
  agents[index] = {
    ...agents[index],
    providerId,
    options: normalizedProviderAgentOptions(providerId, agents[index].options),
  };
  state.settings.data = { ...(state.settings.data || {}), agents };
  renderSettingsModal();
}

async function addSettingsAgent() {
  const draft = normalizedNewAgentDraft(state.settings.data?.agentProviders || []);
  const name = $("settingsNewAgentName")?.value.trim() || draft.name.trim();
  if (!name) throw new Error("Agent name is required.");
  const current = collectSettingsAgents();
  const next = {
    id: uniqueAgentID(name, current),
    name,
    providerId: draft.providerId,
    options: normalizedProviderAgentOptions(draft.providerId, draft.options),
  };
  state.settings.data = {
    ...(state.settings.data || {}),
    agents: [...current, next],
  };
  state.settings.newAgent = { name: "", providerId: draft.providerId, options: normalizedProviderAgentOptions(draft.providerId) };
  renderSettingsModal();
}

async function removeSettingsAgent(id) {
  if (!id) return;
  const current = collectSettingsAgents();
  state.settings.data = {
    ...(state.settings.data || {}),
    agents: current.filter((agent) => agent.id !== id),
  };
  renderSettingsModal();
}

function uniqueAgentID(name, agents) {
  const base = slugID(name) || "agent";
  const used = new Set(agents.map((agent) => agent.id));
  if (!used.has(base)) return base;
  for (let i = 2; ; i += 1) {
    const candidate = `${base}-${i}`;
    if (!used.has(candidate)) return candidate;
  }
}

function slugID(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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

$("workspaceSelect").onchange = async (event) => {
  setMobileSidebar(false);
  state.activeWorkspaceId = event.target.value;
  state.selectedId = "";
  state.sessionMenu = null;
  resetWorkspaceAgentsDraft();
  closeCreateDialog();
  resetAgentState();
  await loadUIState();
  await loadTree();
};

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
  if (event.key === "Escape" && state.mobile.sidebarOpen) {
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
  state.selectedId = route.resourceId || "";
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
    await loadTree({ updateURL: false });
  } else {
    if (state.selectedId && state.selectedId !== "workspace" && !findResource(state.selectedId)) {
      state.selectedId = "";
    }
    if (state.selectedId && state.selectedId !== "workspace") {
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
