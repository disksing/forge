const state = {
  config: null,
  tree: null,
  details: {},
  workspaceAgents: null,
  activeWorkspaceId: "",
  selectedId: "",
  expandedProjects: new Set(),
  expandedPaths: new Set(),
  preview: null,
  diff: null,
  sessionMenu: null,
  settings: {
    open: false,
    tab: "workspace",
    data: null,
    workspacePath: "",
    createWorkspace: false,
    saving: false,
  },
  createDialog: {
    open: false,
    type: "",
    projectId: "",
    title: "",
    description: "",
    detail: "",
    slug: "",
    submitting: false,
  },
  autoRefreshTimer: null,
  autoRefreshInFlight: false,
  iconRefreshScheduled: false,
  agent: {
    runs: [],
    activeRunId: "",
    events: [],
    stream: null,
    streamRunId: "",
    renderTimer: null,
    draftPrompt: "",
    ttyDraft: "",
    agentId: "",
    model: "",
    sandbox: "workspace-write",
    approval: "on-request",
    optionsOpen: false,
    historyOpen: false,
    eventsHasMore: false,
    loadingOlder: false,
  },
  tty: [
    { type: "system", text: "Forge GUI initialized." },
    { type: "system", text: "Workspace data is loaded through forge CLI." },
  ],
};

const $ = (id) => document.getElementById(id);
const AUTO_REFRESH_INTERVAL_MS = 5000;
const TASK_OUTPUT_ACTIVE_WINDOW_MS = 60 * 1000;
const PANE_SIZE_KEY = "forge.gui.paneSizes";
const AGENT_INITIAL_VISIBLE_EVENT_COUNT = 80;
const AGENT_OLDER_VISIBLE_EVENT_COUNT = 50;
const AGENT_OLDER_RAW_PAGE_LIMIT = 500;
const AGENT_INITIAL_AUTO_PAGE_LIMIT = 8;
const AGENT_MANUAL_AUTO_PAGE_LIMIT = 16;

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
    if (!sameJSON(state.agent.runs, runs)) {
      state.agent.runs = runs;
      if (state.agent.activeRunId && !runs.some((run) => run.id === state.agent.activeRunId)) {
        const nextRunId = runs[0]?.id || "";
        if (state.agent.activeRunId !== nextRunId) {
          state.agent.ttyDraft = "";
        }
        state.agent.activeRunId = nextRunId;
        await loadAgentEvents();
        connectAgentStream();
      }
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
  const tree = $("projectTree");
  tree.innerHTML = "";
  if (!state.tree) {
    tree.innerHTML = `<div class="empty-state"><div>Add a workspace path to begin.</div></div>`;
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
}

function treeButton(item, kind) {
  const button = document.createElement("button");
  const sessionState = kind === "task" ? taskSessionState(item.id) : noTaskSessionState();
  button.className = `tree-item ${kind === "task" ? "task-item" : ""} ${sessionState.kind !== "none" ? "has-open-session" : ""} ${sessionState.className} ${state.selectedId === item.id ? "active" : ""}`;
  const children = item.children || [];
  const expanded = kind === "project" && isProjectExpanded(item.id);
  button.innerHTML = `
    <span class="chevron" ${kind === "project" && children.length ? `data-project-toggle="${escapeHTML(item.id)}"` : ""}>${kind === "project" && children.length ? icon(expanded ? "chevron-down" : "chevron-right") : ""}</span>
    <span class="task-session-indicator-slot">${sessionState.iconName ? `<span class="task-session-indicator" title="${escapeHTML(sessionState.label)}" aria-label="${escapeHTML(sessionState.label)}">${icon(sessionState.iconName, "task-session-icon")}</span>` : ""}</span>
    ${icon(kind === "project" ? "folder" : "file-text", "tree-icon")}
    <span class="name">${escapeHTML(item.title || item.id)}</span>
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

function noTaskSessionState() {
  return { kind: "none", className: "", iconName: "", label: "No open sessions" };
}

function taskSessionState(resourceId) {
  const sessions = taskSessions(resourceId);
  if (sessions.length === 0) return noTaskSessionState();

  const recentOutput = sessions.filter((session) => hasRecentAgentOutput(session));
  if (recentOutput.length > 0) {
    return {
      kind: "active",
      className: "task-session-active",
      iconName: "circle-dot",
      label: taskSessionLabel(recentOutput.length, "output in the last minute"),
    };
  }

  const waitingInput = sessions.filter((session) => session.agentRunStatus === "idle");
  if (waitingInput.length > 0) {
    return {
      kind: "waiting",
      className: "task-session-waiting",
      iconName: "message-circle",
      label: taskSessionLabel(waitingInput.length, "waiting for input"),
    };
  }

  return {
    kind: "quiet",
    className: "task-session-quiet",
    iconName: "clock",
    label: taskSessionLabel(sessions.length, "without recent output"),
  };
}

function taskSessions(resourceId) {
  if (!resourceId) return [];
  const matched = [];
  const seen = new Set();
  for (const session of state.tree?.sessions || []) {
    const controls = sessionControls(session);
    const controlsResource = controls.some((control) => control.resourceId === resourceId);
    if (session.resourceId === resourceId || controlsResource) {
      const key = session.id || `${resourceId}:${matched.length}`;
      if (!seen.has(key)) {
        seen.add(key);
        matched.push(session);
      }
    }
  }
  return matched;
}

function hasRecentAgentOutput(session) {
  const outputAt = new Date(session.agentRunLastOutputAt || "").getTime();
  if (Number.isFinite(outputAt)) {
    return Date.now() - outputAt <= TASK_OUTPUT_ACTIVE_WINDOW_MS;
  }
  if (!["running", "starting"].includes(session.agentRunStatus)) return false;
  const updatedAt = new Date(session.agentRunUpdatedAt || "").getTime();
  return Number.isFinite(updatedAt) && Date.now() - updatedAt <= TASK_OUTPUT_ACTIVE_WINDOW_MS;
}

function taskSessionLabel(count, description) {
  return `${count} open ${count === 1 ? "session" : "sessions"} ${description}`;
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
  }
  state.selectedId = id;
  state.sessionMenu = null;
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
    const label = isInternal ? "Internal" : "External";
    const title = isInternal ? session.agentRunTitle || resourceId || session.id : session.id;
    const metaParts = [label];
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
  if (!state.tree) {
    panel.innerHTML = emptyDetails();
    return;
  }
  if (state.selectedId === "workspace") {
    panel.innerHTML = workspaceDetails();
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
    ${metrics(detail)}
    ${selected.type === "project" ? `
      <div class="content-section">
        <h3>${icon("align-left")}<span>Description</span></h3>
        <p>${escapeHTML(detail.description || "No description.")}</p>
      </div>
    ` : ""}
    ${fileSection(detail)}
    ${artifactSection("Artifacts", detail.artifacts)}
    ${worktreeSection(detail.repos)}
    ${fileModal()}
    ${diffModal()}
  `;
  $("archiveButton")?.addEventListener("click", () => archiveResource(selected.id));
  $("newTaskButton")?.addEventListener("click", () => showTaskForm(selected.id));
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
    <div class="meta-grid">
      <div class="metric"><span>Projects</span><strong>${state.tree.projects.length}</strong></div>
      <div class="metric"><span>Tasks</span><strong>${state.tree.projects.reduce((n, p) => n + (p.children || []).length, 0)}</strong></div>
      <div class="metric"><span>Sessions</span><strong>${state.tree.sessions.length}</strong></div>
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
    body = renderFileContent(agents.name || "AGENTS.md", agents.content || "");
  }
  return `
    <div class="content-section">
      <h3>${icon("file-text")}<span>AGENTS.md</span></h3>
      ${body}
    </div>
  `;
}

async function openBreadcrumbResource(id) {
  const forceDetail = id === state.selectedId && id !== "workspace";
  await selectResource(id, { forceDetail });
}

function metrics(item) {
  const taskCount = item.children?.length || 0;
  const artifactCount = countFiles(item.artifacts);
  const repoCount = item.repos?.length || 0;
  return `
    <div class="meta-grid">
      <div class="metric">${icon(item.type === "project" ? "folder" : "file-text")}<div><span>Type</span><strong>${escapeHTML(item.type)}</strong></div></div>
      <div class="metric">${icon(item.type === "project" ? "check-circle-2" : "paperclip")}<div><span>${item.type === "project" ? "Tasks" : "Artifacts"}</span><strong>${item.type === "project" ? taskCount : artifactCount}</strong></div></div>
      <div class="metric">${icon("folder-git-2")}<div><span>Repos</span><strong>${repoCount}</strong></div></div>
    </div>
  `;
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
  const files = item.files || [];
  let insertedLog = false;
  const sections = files.map((file) => {
    const section = `
      <div class="content-section">
        <h3>${icon("file-text")}<span>${escapeHTML(file.name)}</span></h3>
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

function renderFileContent(name, content) {
  if (isMarkdownFile(name)) {
    return `<div class="markdown-view markdown-rendered">${renderMarkdown(content)}</div>`;
  }
  return `<pre class="markdown-view">${escapeHTML(content)}</pre>`;
}

function artifactSection(title, entries = []) {
  if (!entries || entries.length === 0) return "";
  return `
    <div class="content-section">
      <h3>${icon(title === "Worktrees" ? "folder-git-2" : "paperclip")}<span>${title}</span></h3>
      <div class="artifact-browser">
        <div class="artifact-tree" role="tree">
          ${entries.map((entry) => artifactRow(entry, title, 0)).join("")}
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
  if (!repos || repos.length === 0) return "";
  return `
    <div class="content-section">
      <h3>${icon("folder-git-2")}<span>Worktrees</span></h3>
      <div class="worktree-list">
        ${repos.map(worktreeRow).join("")}
      </div>
    </div>
  `;
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
          <button class="icon-button" data-modal-close="true" title="Close" aria-label="Close">${icon("x")}</button>
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
      <div class="image-preview">
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
    return `<div class="modal-markdown markdown-rendered">${renderMarkdown(preview.content || "")}</div>`;
  }
  return `
    <pre class="modal-preview-content">${escapeHTML(preview.content || "")}</pre>
  `;
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
  if (!state.agent.activeRunId || !state.agent.runs.some((run) => run.id === state.agent.activeRunId)) {
    const nextRunId = state.agent.runs[0]?.id || "";
    if (state.agent.activeRunId !== nextRunId) {
      state.agent.ttyDraft = "";
    }
    state.agent.activeRunId = nextRunId;
  }
  if (state.agent.activeRunId) {
    await loadAgentEvents();
  } else {
    state.agent.events = [];
  }
  connectAgentStream();
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
  state.agent.historyOpen = false;
  state.agent.ttyDraft = "";
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
  if (canMergeAssistantDelta(last, event)) {
    last.id = event.id;
    last.time = event.time || last.time;
    last.text = `${last.text ?? assistantDeltaText(last)}${event.text ?? assistantDeltaText(event)}`;
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
    if (canMergeAssistantDelta(last, event)) {
      last.id = event.id;
      last.time = event.time || last.time;
      last.text = `${last.text ?? assistantDeltaText(last)}${event.text ?? assistantDeltaText(event)}`;
      last.data = event.data || last.data;
    } else {
      result.push(event);
    }
  }
  return result;
}

function normalizeAgentEvent(event) {
  if (event?.type !== "assistant_delta") return { ...event };
  return { ...event, text: assistantNormalizedText(event) };
}

function assistantNormalizedText(event) {
  if (typeof event.text === "string" && event.text !== event.method) {
    return event.text;
  }
  return assistantDeltaText(event);
}

function assistantDeltaText(event) {
  const delta = agentEventDeltaValue(event);
  if (delta.found) return delta.value;
  if (event.text === event.method) return "";
  return event.text || "";
}

function canMergeAssistantDelta(previous, next) {
  if (!previous || !next || previous.type !== "assistant_delta" || next.type !== "assistant_delta") {
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
  const completedItems = new Set();
  for (const event of events) {
    if (event.type === "tool" && event.method === "item/completed") {
      const id = agentEventItemId(event);
      if (id) completedItems.add(id);
    }
  }
  return coalesceAgentEvents(events.filter((event) => shouldDisplayAgentEvent(event, completedItems)));
}

function shouldDisplayAgentEvent(event, completedItems = new Set()) {
  if (event.type === "assistant_delta" || event.type === "approval_requested" || event.type === "error") return true;
  if (event.method === "session/ready" || event.method === "turn/failed") return true;
  if (event.type === "user") return true;
  if (event.type === "tool") {
    const itemType = agentEventItemType(event);
    if (itemType === "userMessage" || itemType === "agentMessage") return false;
    if (event.method === "item/commandExecution/outputDelta" || event.method === "command/exec/outputDelta") return false;
    if (event.method !== "item/started") return false;
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
  try {
    const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
    return data?.item?.type || "";
  } catch (_) {
    return "";
  }
}

function agentEventItemId(event) {
  try {
    const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
    return data?.itemId || data?.item?.id || "";
  } catch (_) {
    return "";
  }
}

function renderAgent() {
  const controls = $("agentControls");
  const wrap = $("agentSessionsWrap");
  const activeRun = currentAgentRun();
  const visibleRun = activeRun || state.agent.runs[0] || null;
  const agents = enabledAgentConfigs();
  const selectedAgent = selectedAgentConfig();
  controls.innerHTML = `
    <h2>Agent</h2>
    <div class="agent-start-form">
      <div class="agent-select-stack">
        <select id="agentSelect" ${agents.length ? "" : "disabled"}>
          ${agentSelectOptions(agents)}
        </select>
        <small>${escapeHTML(selectedAgent ? agentConfigSummary(selectedAgent) : "No enabled agents")}</small>
      </div>
    </div>
  `;
  wrap.innerHTML = `
    <div id="agentSessions" class="agent-session-switcher">
      ${visibleRun ? agentCurrentSessionRow(visibleRun) : `<div class="session-pill"><strong>No sessions yet</strong><span>Start a Codex session from the selected task.</span></div>`}
      ${state.agent.historyOpen && state.agent.runs.length ? `
        <div class="agent-session-menu">
          ${state.agent.runs.map(agentSessionMenuRow).join("")}
        </div>
      ` : ""}
    </div>
  `;
}

function agentSelectOptions(agents) {
  return agents.map((agent) => `
    <option value="${escapeHTML(agent.id)}" ${state.agent.agentId === agent.id ? "selected" : ""}>${escapeHTML(agent.name || agent.id)}</option>
  `).join("") || `<option value="">No enabled agents</option>`;
}

function agentConfigSummary(agent) {
  if (!agent) return "";
  const parts = [
    providerName(agent.providerId),
    sandboxLabel(agent.sandbox),
    approvalLabel(agent.approval),
  ];
  if (agent.model) parts.push(agent.model);
  return parts.filter(Boolean).join(" · ");
}

function providerName(providerId) {
  const provider = (state.config?.agentProviders || state.settings.data?.agentProviders || []).find((item) => item.id === providerId);
  return provider?.name || providerId || "Provider";
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
      : `<div class="tty-empty">${icon("loader-circle")}<strong>Waiting for Codex events</strong></div>`;
  } else {
    const text = state.agent.runs.length ? "Select an Agent Run to view its events." : "Start a Codex session.";
    log.innerHTML = `<div class="tty-empty">${icon("bot")}<strong>No agent run selected</strong><span>${escapeHTML(text)}</span></div>`;
  }
  log.dataset.agentRunId = nextRunId;
  $("loadOlderAgentEventsButton")?.addEventListener("click", () => {
    loadOlderAgentEvents().catch((err) => toast(err.message));
  });
  if (stickToBottom) {
    log.scrollTop = log.scrollHeight;
  } else {
    log.scrollTop = previousScrollTop;
  }
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
    const key = `none:${state.agent.agentId}`;
    if (composer.dataset.composerKey === key) return;
    composer.dataset.composerKey = key;
    composer.innerHTML = agentComposerActions();
    return;
  }
  if (isLiveAgentRun(activeRun)) {
    const key = `live:${activeRun.id}:${state.agent.agentId}`;
    if (composer.dataset.composerKey === key && $("ttyInput")) return;
    composer.dataset.composerKey = key;
    composer.innerHTML = `
      <form id="ttyForm" class="tty-input">
        <span>&gt;</span>
        <textarea id="ttyInput" rows="1" autocomplete="off" placeholder="Send input to the selected Codex session">${escapeHTML(state.agent.ttyDraft)}</textarea>
        <button type="submit" class="tty-send-button" title="Send input" aria-label="Send input">${icon("send")}</button>
      </form>
      ${agentComposerActions({ includeClose: true })}
    `;
    $("ttyInput")?.addEventListener("input", (event) => {
      state.agent.ttyDraft = event.target.value;
      resizeTTYInput(event.target);
    });
    $("ttyInput")?.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        $("ttyForm")?.requestSubmit();
      }
    });
    resizeTTYInput($("ttyInput"));
    $("ttyForm")?.addEventListener("submit", submitTTYInput);
    return;
  }
  const key = `resume:${activeRun.id}:${state.agent.agentId}`;
  if (composer.dataset.composerKey === key) return;
  composer.dataset.composerKey = key;
  state.agent.ttyDraft = "";
  composer.innerHTML = `
    ${agentComposerActions({ includeResume: true })}
  `;
}

function agentComposerActions(options = {}) {
  const selectedAgent = selectedAgentConfig();
  return `
    <div class="tty-session-actions">
      ${options.includeResume ? `<button type="button" id="agentResumeButton" class="tty-primary-action">${icon("rotate-ccw")}<span>Resume Session</span></button>` : ""}
      <button type="button" id="agentStartButton" class="tty-primary-action" ${selectedAgent ? "" : "disabled"}>${icon("play")}<span>New Session</span></button>
      ${options.includeClose ? `<button type="button" id="agentStopButton" class="secondary-button agent-stop-button">${icon("square")}<span>Close Session</span></button>` : ""}
    </div>
  `;
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
    agentDefaults: currentAgentDefaults(),
    agentProviders: state.config?.agentProviders || [],
    agents: state.config?.agents || [],
    codex: { running: false },
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
          ${providers.map((provider) => settingsProviderRow(provider, codex)).join("")}
        </div>
      </section>
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

function settingsProviderRow(provider, codex) {
  const enabled = Boolean(provider.enabled);
  const status = provider.id === "codex" && codex?.running
    ? `Enabled · PID ${escapeHTML(String(codex.pid || ""))}`
    : enabled
      ? "Enabled"
      : "Disabled";
  return `
    <div class="settings-service-row">
      <div class="settings-provider-main">
        <span class="settings-provider-mark">${icon(provider.id === "codex" ? "terminal" : "box")}</span>
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
      <div class="settings-agent-summary">${escapeHTML(agentConfigSummary(agent))}</div>
      <div class="settings-agent-fields">
        <label>
          <span>Provider</span>
          <select data-agent-field="providerId">
            ${providers.map((provider) => `<option value="${escapeHTML(provider.id)}" ${agent.providerId === provider.id ? "selected" : ""}>${escapeHTML(provider.name || provider.id)}</option>`).join("")}
          </select>
        </label>
        <label>
          <span>Sandbox</span>
          <select data-agent-field="sandbox">${sandboxOptions(agent.sandbox)}</select>
        </label>
        <label>
          <span>Approval</span>
          <select data-agent-field="approval">${approvalOptions(agent.approval)}</select>
        </label>
        <label>
          <span>Model</span>
          <input data-agent-field="model" value="${escapeHTML(agent.model || "")}" placeholder="Default" />
        </label>
      </div>
    </div>
  `;
}

function settingsNewAgentCard(providers) {
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
            <input id="settingsNewAgentName" placeholder="Agent name" />
          </label>
          <button type="button" id="settingsAddAgentButton">${icon("plus")}<span>Add</span></button>
        </div>
        <div class="settings-agent-fields">
          <label>
            <span>Provider</span>
            <select id="settingsNewAgentProvider">
              ${providers.map((provider) => `<option value="${escapeHTML(provider.id)}">${escapeHTML(provider.name || provider.id)}</option>`).join("")}
            </select>
          </label>
          <label>
            <span>Sandbox</span>
            <select id="settingsNewAgentSandbox">
              ${sandboxOptions("workspace-write")}
            </select>
          </label>
          <label>
            <span>Approval</span>
            <select id="settingsNewAgentApproval">
              ${approvalOptions("on-request")}
            </select>
          </label>
          <label>
            <span>Model</span>
            <input id="settingsNewAgentModel" placeholder="Default" />
          </label>
        </div>
      </div>
    </section>
  `;
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
  $("settingsAddAgentButton")?.addEventListener("click", () => {
    addSettingsAgent().catch((err) => toast(err.message));
  });
  document.querySelectorAll("[data-remove-agent]").forEach((button) => {
    button.addEventListener("click", () => removeSettingsAgent(button.dataset.removeAgent).catch((err) => toast(err.message)));
  });
}

function agentEventRow(event) {
  const method = event.method && event.type !== "assistant_delta" ? `<small>${escapeHTML(event.method)}</small>` : "";
  const text = agentDisplayText(event);
  if (event.type === "assistant_delta" || event.type === "user") {
    return `
      <div class="agent-message-row ${escapeHTML(event.type === "user" ? "user" : "assistant")}">
        <div class="agent-message-bubble">
          <p>${escapeHTML(text)}</p>
        </div>
      </div>
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

function toolEventSummary(event) {
  const itemType = agentEventItemType(event);
  if (itemType === "reasoning") return "Reasoning...";
  if (itemType === "commandExecution") return "Running command...";
  if (itemType === "fileChange") return "Applying file change...";
  return "Working...";
}

function agentDisplayText(event) {
  if (event.type === "assistant_delta") {
    return assistantDisplayText(event);
  }
  return event.text || event.method || event.type;
}

function assistantDisplayText(event) {
  if (typeof event.text === "string" && event.text !== event.method) {
    return event.text;
  }
  return assistantDeltaText(event);
}

function agentEventDeltaValue(event) {
  try {
    const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
    if (data && Object.prototype.hasOwnProperty.call(data, "delta") && typeof data.delta === "string") {
      return { found: true, value: data.delta };
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
  if (event.type === "user") return icon("user");
  if (event.type === "error") return icon("triangle-alert");
  if (event.type === "tool") return icon("terminal");
  return icon("circle-dot");
}

function agentEventTitle(event) {
  if (event.type === "assistant_delta") return "Codex";
  if (event.type === "user") return "You";
  if (event.type === "error") return "Error";
  if (event.type === "tool") return "Tool";
  return "Event";
}

function bindAgentEvents() {
  document.querySelector(".agent-session-menu")?.addEventListener("click", (event) => {
    event.stopPropagation();
  });
  $("agentSelect")?.addEventListener("change", (event) => {
    state.agent.agentId = event.target.value;
    applySelectedAgentOptions();
    renderAgent();
    renderTTYComposer();
    bindAgentEvents();
    refreshIcons();
  });
  $("agentStartButton")?.addEventListener("click", () => {
    startAgentRun().catch((err) => toast(err.message));
  });
  $("agentStopButton")?.addEventListener("click", () => {
    stopAgentRun().catch((err) => toast(err.message));
  });
  $("agentResumeButton")?.addEventListener("click", () => {
    resumeAgentRun().catch((err) => toast(err.message));
  });
  document.querySelectorAll("[data-agent-run]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const runId = button.dataset.agentRun;
      if (runId === state.agent.activeRunId && button.classList.contains("agent-current-run")) {
        state.agent.historyOpen = !state.agent.historyOpen;
        state.agent.optionsOpen = false;
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
  state.agent.optionsOpen = false;
  state.agent.historyOpen = false;
  state.agent.activeRunId = response.run.id;
  await loadAgentRuns();
  renderAll();
  toast("Codex session started.");
}

async function sendAgentInput(text) {
  if (!state.agent.activeRunId) throw new Error("Start or select a Codex run first.");
  await api(`/api/workspaces/${state.activeWorkspaceId}/agent/runs/${state.agent.activeRunId}/input`, {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

async function stopAgentRun() {
  if (!state.agent.activeRunId) return;
  await closeAgentRun(state.agent.activeRunId);
  await loadAgentRuns();
  renderAll();
  toast("Codex session closed.");
}

async function switchAgentRun(runId) {
  if (!runId || runId === state.agent.activeRunId) return;
  const previousRun = currentAgentRun();
  if (previousRun && isLiveAgentRun(previousRun)) {
    await closeAgentRun(previousRun.id);
  }
  state.agent.activeRunId = runId;
  state.agent.ttyDraft = "";
  state.agent.historyOpen = false;
  await loadAgentRuns();
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
  state.agent.historyOpen = false;
  await loadAgentRuns();
  renderAll();
  toast("Codex session resumed.");
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
  const input = $("ttyInput");
  const rawText = input?.value || "";
  if (!rawText.trim()) return;
  state.agent.ttyDraft = rawText;
  try {
    await sendAgentInput(rawText);
    state.agent.ttyDraft = "";
    input.value = "";
    resizeTTYInput(input);
  } catch (err) {
    toast(err.message);
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
    title: "",
    description: "",
    detail: "",
    slug: "",
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
    title: "",
    description: "",
    detail: "",
    slug: "",
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
  const renderKey = `${dialog.type}:${dialog.projectId}:${dialog.submitting}`;
  if (root.dataset.createDialogKey === renderKey && root.querySelector("#createDialogForm")) return;
  root.dataset.createDialogKey = renderKey;
  root.innerHTML = `
    <div class="create-dialog-layer" role="presentation">
      <div class="create-dialog-backdrop" data-create-dialog-close="true"></div>
      <section class="create-dialog" role="dialog" aria-modal="true" aria-label="${title}">
        <header class="create-dialog-header">
          <div>
            <strong>${title}</strong>
            ${isTask ? `<span>${escapeHTML(dialog.projectId)}</span>` : ""}
          </div>
          <button class="icon-button" type="button" data-create-dialog-close="true" title="Close" aria-label="Close">${icon("x")}</button>
        </header>
        <form id="createDialogForm" class="details-form create-dialog-form">
          ${isTask ? `
            <input name="title" required value="${escapeHTML(dialog.title)}" placeholder="Task title" />
            <textarea name="detail" placeholder="${detailPlaceholder}">${escapeHTML(dialog.detail)}</textarea>
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
    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return;
    if (target.name === "title") state.createDialog.title = target.value;
    if (target.name === "description") state.createDialog.description = target.value;
    if (target.name === "detail") state.createDialog.detail = target.value;
    if (target.name === "slug") state.createDialog.slug = target.value;
  });
  form.addEventListener("submit", submitCreateDialog);
  document.querySelectorAll("[data-create-dialog-close]").forEach((node) => {
    node.addEventListener("click", closeCreateDialog);
  });
  if (!state.createDialog.submitting) {
    (form.elements.title || form.elements.description)?.focus();
  }
}

async function submitCreateDialog(event) {
  event.preventDefault();
  const dialog = state.createDialog;
  if (!dialog.open || dialog.submitting) return;
  const form = new FormData(event.currentTarget);
  dialog.title = String(form.get("title") || "");
  dialog.description = String(form.get("description") || "");
  dialog.detail = String(form.get("detail") || "");
  dialog.slug = String(form.get("slug") || "");
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
          detail: dialog.detail,
          slug: dialog.slug,
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

function currentAgentDefaults() {
  const agent = selectedAgentConfig();
  return {
    sandbox: agent?.sandbox || state.agent.sandbox || "workspace-write",
    approval: agent?.approval || state.agent.approval || "on-request",
    model: agent?.model || state.agent.model || "",
  };
}

function applyAgentConfig() {
  const agents = enabledAgentConfigs();
  if (!agents.some((agent) => agent.id === state.agent.agentId)) {
    state.agent.agentId = agents[0]?.id || "";
  }
  applySelectedAgentOptions();
}

function applySelectedAgentOptions() {
  const agent = selectedAgentConfig();
  state.agent.sandbox = agent?.sandbox || "workspace-write";
  state.agent.approval = agent?.approval || "on-request";
  state.agent.model = agent?.model || "";
}

function selectedAgentConfig() {
  const agents = enabledAgentConfigs();
  return agents.find((agent) => agent.id === state.agent.agentId) || agents[0] || null;
}

function enabledAgentConfigs() {
  const providers = state.config?.agentProviders || [];
  const enabledProviders = new Set(providers.filter((provider) => provider.enabled).map((provider) => provider.id));
  return (state.config?.agents || []).filter((agent) => enabledProviders.has(agent.providerId));
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
  } else {
    await api("/api/settings/agent/providers", {
      method: "PUT",
      body: JSON.stringify(providers.map((item) => item.id === provider.id ? { ...item, enabled: !enabled } : item)),
    });
  }
  await refreshSettings();
  state.config = await api("/api/workspaces");
  applyAgentConfig();
  renderAgent();
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
  state.settings.data = { ...(state.settings.data || {}), agents: saved };
  applyAgentConfig();
  renderAgent();
  bindAgentEvents();
  renderSettingsModal();
  refreshIcons();
  toast("Agents saved.");
}

function collectSettingsAgents() {
  const existing = state.settings.data?.agents || [];
  return Array.from(document.querySelectorAll(".settings-agent-row")).map((row, index) => {
    const source = existing[index] || {};
    const field = (name) => row.querySelector(`[data-agent-field="${name}"]`)?.value.trim() || "";
    return {
      id: source.id || slugID(field("name")),
      name: field("name"),
      providerId: field("providerId"),
      sandbox: field("sandbox") || "workspace-write",
      approval: field("approval") || "on-request",
      model: field("model"),
    };
  });
}

async function addSettingsAgent() {
  const name = $("settingsNewAgentName")?.value.trim() || "";
  if (!name) throw new Error("Agent name is required.");
  const current = collectSettingsAgents();
  const next = {
    id: uniqueAgentID(name, current),
    name,
    providerId: $("settingsNewAgentProvider")?.value || "codex",
    sandbox: $("settingsNewAgentSandbox")?.value || "workspace-write",
    approval: $("settingsNewAgentApproval")?.value || "on-request",
    model: $("settingsNewAgentModel")?.value.trim() || "",
  };
  state.settings.data = {
    ...(state.settings.data || {}),
    agents: [...current, next],
  };
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

function countFiles(entries = []) {
  return entries.reduce((sum, entry) => sum + (entry.type === "file" ? 1 : countFiles(entry.children || [])), 0);
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

$("workspaceSelect").onchange = async (event) => {
  state.activeWorkspaceId = event.target.value;
  state.selectedId = "";
  state.sessionMenu = null;
  closeCreateDialog();
  resetAgentState();
  await loadUIState();
  await loadTree();
};

$("newProjectButton").onclick = () => showProjectForm();

$("systemSettingsButton").onclick = () => {
  openSettings().catch((err) => toast(err.message));
};

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && state.diff) {
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
  } else if (event.key === "Escape" && (state.agent.optionsOpen || state.agent.historyOpen)) {
    state.agent.optionsOpen = false;
    state.agent.historyOpen = false;
    renderAgent();
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
  if ((state.agent.optionsOpen || state.agent.historyOpen) && target && !target.closest(".agent-actions") && !target.closest(".agent-sessions")) {
    state.agent.optionsOpen = false;
    state.agent.historyOpen = false;
    renderAgent();
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
