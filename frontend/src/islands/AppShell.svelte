<script lang="ts">
  import { onMount } from "svelte";

  import type { IslandChannel } from "./channel";
  import Icon from "./Icon.svelte";
  import type { AppShellModel, ShellDragTarget, ShellResourceItem, ShellSessionItem, ShellStatusPresentation } from "./models";

  let { channel }: { channel: IslandChannel<AppShellModel> } = $props();
  // svelte-ignore state_referenced_locally
  let model = $state(channel.current());
  let workspaceMenuOpen = $state(false);
  let sessionMenuId = $state("");
  let switchingWorkspaceId = $state("");
  let drag = $state<ShellDragTarget | null>(null);
  let drop = $state<{ id: string; after: boolean } | null>(null);
  let resizeCleanup: (() => void) | null = null;
  let appliedRouteRevision = $state(0);

  const activeWorkspace = $derived(model.workspaces.find((workspace) => workspace.id === model.activeWorkspaceId) ?? null);

  onMount(() => {
    const unsubscribe = channel.subscribe((next) => {
      const identityChanged = next.identity !== model.identity;
      model = next;
      if (identityChanged) {
        workspaceMenuOpen = false;
        sessionMenuId = "";
        switchingWorkspaceId = "";
        finishDrag();
      }
      queueMicrotask(next.onIconsChanged);
    });
    const outside = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      if (workspaceMenuOpen && !target?.closest(".workspace-select-row")) workspaceMenuOpen = false;
      if (sessionMenuId && !target?.closest(".session-row") && !target?.closest(".session-resource-menu")) sessionMenuId = "";
    };
    const keydown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (model.mobile.sidebarOpen) model.onMobileSidebar(false);
      else if (workspaceMenuOpen) workspaceMenuOpen = false;
      else if (sessionMenuId) sessionMenuId = "";
    };
    const popstate = () => {
      void model.onHistoryNavigation(window.location.pathname).catch((reason) => {
        model.onToast(reason instanceof Error ? reason.message : String(reason));
      });
    };
    const viewport = window.visualViewport;
    const viewportTimers = new Set<number>();
    const mobileQuery = typeof window.matchMedia === "function"
      ? window.matchMedia("(max-width: 980px)")
      : { matches: false, addEventListener: () => undefined, removeEventListener: () => undefined } as unknown as MediaQueryList;
    const syncViewport = () => {
      const root = document.documentElement;
      if (!mobileQuery.matches || !viewport) {
        root.style.removeProperty("--app-viewport-height");
        root.style.removeProperty("--app-viewport-offset-top");
        root.style.removeProperty("--app-viewport-offset-left");
        return;
      }
      root.style.setProperty("--app-viewport-height", `${viewport.height}px`);
      root.style.setProperty("--app-viewport-offset-top", `${viewport.offsetTop}px`);
      root.style.setProperty("--app-viewport-offset-left", `${viewport.offsetLeft}px`);
    };
    const resetViewport = () => {
      if (window.scrollX !== 0 || window.scrollY !== 0) window.scrollTo(0, 0);
      syncViewport();
    };
    const clearViewportTimers = () => {
      for (const timer of viewportTimers) window.clearTimeout(timer);
      viewportTimers.clear();
    };
    const scheduleViewportReset = (delay: number) => {
      const timer = window.setTimeout(() => {
        viewportTimers.delete(timer);
        resetViewport();
      }, delay);
      viewportTimers.add(timer);
    };
    const settleViewport = () => {
      clearViewportTimers();
      scheduleViewportReset(0);
      scheduleViewportReset(300);
    };
    const resize = () => {
      model.onPaneViewport();
      syncViewport();
    };
    document.addEventListener("mousedown", outside);
    document.addEventListener("keydown", keydown);
    document.addEventListener("focusout", settleViewport);
    window.addEventListener("resize", resize);
    window.addEventListener("orientationchange", settleViewport);
    window.addEventListener("popstate", popstate);
    viewport?.addEventListener("resize", syncViewport);
    viewport?.addEventListener("scroll", syncViewport);
    mobileQuery.addEventListener?.("change", resize);
    syncViewport();
    return () => {
      unsubscribe();
      resizeCleanup?.();
      finishDrag();
      document.removeEventListener("mousedown", outside);
      document.removeEventListener("keydown", keydown);
      document.removeEventListener("focusout", settleViewport);
      window.removeEventListener("resize", resize);
      window.removeEventListener("orientationchange", settleViewport);
      window.removeEventListener("popstate", popstate);
      viewport?.removeEventListener("resize", syncViewport);
      viewport?.removeEventListener("scroll", syncViewport);
      mobileQuery.removeEventListener?.("change", resize);
      clearViewportTimers();
      document.body.classList.remove("mobile-sidebar-open", "mobile-chat-active", "chat-immersive", "resizing-x", "resizing-y");
    };
  });

  $effect(() => {
    document.body.classList.toggle("mobile-sidebar-open", model.mobile.sidebarOpen);
    document.body.classList.toggle("mobile-chat-active", model.mobile.view === "chat");
    document.body.classList.toggle("chat-immersive", model.mobile.immersive);
  });

  $effect(() => {
    const route = model.route;
    if (!route.path || route.revision <= appliedRouteRevision) return;
    appliedRouteRevision = route.revision;
    if (window.location.pathname === route.path) return;
    window.history[route.replace ? "replaceState" : "pushState"]({}, "", route.path);
  });

  function statusClass(status: ShellStatusPresentation): string {
    return [status.layoutClassName, status.className].filter(Boolean).join(" ");
  }

  function rowDropClass(id: string): string {
    if (!drop || drop.id !== id) return "";
    return drop.after ? "drop-after" : "drop-before";
  }

  function compatibleDrop(target: ShellDragTarget): boolean {
    if (!drag || drag.id === target.id || drag.kind !== target.kind) return false;
    return target.kind !== "task" || drag.projectId === target.projectId;
  }

  function beginDrag(event: DragEvent, target: ShellDragTarget): void {
    event.stopPropagation();
    drag = target;
    drop = null;
    model.onDragState(target);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", target.id);
    }
  }

  function updateDrop(event: DragEvent, target: ShellDragTarget): void {
    if (!compatibleDrop(target)) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
    const row = event.currentTarget as HTMLElement;
    const rect = row.getBoundingClientRect();
    drop = { id: target.id, after: event.clientY > rect.top + rect.height / 2 };
  }

  async function commitDrop(event: DragEvent, target: ShellDragTarget): Promise<void> {
    event.preventDefault();
    if (!drag || !compatibleDrop(target)) return;
    const current = drag;
    const after = drop?.id === target.id ? drop.after : false;
    finishDrag();
    try {
      await model.onReorder(current, target, after);
    } catch (reason) {
      model.onToast(reason instanceof Error ? reason.message : String(reason));
    }
  }

  function finishDrag(): void {
    if (drag) model.onDragState(null);
    drag = null;
    drop = null;
  }

  async function switchWorkspace(id: string): Promise<void> {
    if (!id || switchingWorkspaceId) return;
    switchingWorkspaceId = id;
    workspaceMenuOpen = false;
    try {
      await model.onSwitchWorkspace(id);
    } catch (reason) {
      model.onToast(reason instanceof Error ? reason.message : String(reason));
    } finally {
      switchingWorkspaceId = "";
    }
  }

  async function selectResource(id: string): Promise<void> {
    if (!id) return;
    sessionMenuId = "";
    try {
      await model.onSelectResource(id);
    } catch (reason) {
      model.onToast(reason instanceof Error ? reason.message : String(reason));
    }
  }

  async function activateTreeItem(event: MouseEvent, item: ShellResourceItem): Promise<void> {
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest(".drag-handle")) return;
    if (item.type === "project" && target?.closest("[data-project-toggle]")) {
      try {
        await model.onToggleProject(item.id);
      } catch (reason) {
        model.onToast(reason instanceof Error ? reason.message : String(reason));
      }
      return;
    }
    await selectResource(item.id);
  }

  function activateSession(event: MouseEvent, session: ShellSessionItem): void {
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest(".drag-handle")) return;
    if (session.navigationResourceId) {
      void selectResource(session.navigationResourceId);
      return;
    }
    if (session.menu) sessionMenuId = sessionMenuId === session.id ? "" : session.id;
  }

  function beginResize(event: PointerEvent, kind: "sidebarWidth" | "chatWidth" | "sidebarSessionHeight"): void {
    if (window.matchMedia("(max-width: 980px)").matches) return;
    event.preventDefault();
    resizeCleanup?.();
    const handle = event.currentTarget as HTMLElement;
    const app = document.getElementById("app");
    const sidebar = document.getElementById("mobileSidebar");
    const workspace = document.querySelector<HTMLElement>(".workspace-panel");
    const chat = document.getElementById("agentPanel");
    const sessions = document.querySelector<HTMLElement>(".session-section");
    if (!app || !sidebar || !workspace || !chat || !sessions) return;
    const startX = event.clientX;
    const startY = event.clientY;
    const startSidebar = sidebar.getBoundingClientRect().width;
    const startChat = chat.getBoundingClientRect().width;
    const startSessions = sessions.getBoundingClientRect().height;
    const bodyClass = kind === "sidebarSessionHeight" ? "resizing-y" : "resizing-x";
    handle.classList.add("dragging");
    document.body.classList.add(bodyClass);
    const move = (moveEvent: PointerEvent) => {
      if (kind === "sidebarWidth") {
        const max = Math.max(220, app.getBoundingClientRect().width - 8 - 360 - 8 - Math.max(320, chat.getBoundingClientRect().width));
        model.onPanePreview(kind, Math.min(max, Math.max(220, startSidebar + moveEvent.clientX - startX)));
      } else if (kind === "chatWidth") {
        const max = Math.max(320, workspace.getBoundingClientRect().width - 360 - 8);
        model.onPanePreview(kind, Math.min(max, Math.max(320, startChat - (moveEvent.clientX - startX))));
      } else {
        const max = Math.max(120, sidebar.getBoundingClientRect().height - 250);
        model.onPanePreview(kind, Math.min(max, Math.max(84, startSessions - (moveEvent.clientY - startY))));
      }
    };
    const done = () => {
      handle.classList.remove("dragging");
      document.body.classList.remove(bodyClass);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", done);
      window.removeEventListener("pointercancel", done);
      resizeCleanup = null;
      model.onPaneCommit(kind);
    };
    resizeCleanup = done;
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", done, { once: true });
    window.addEventListener("pointercancel", done, { once: true });
  }
</script>

<header class="mobile-toolbar">
  <button id="mobileMenuButton" class="mobile-icon-button" type="button" aria-label="Open navigation" aria-controls="mobileSidebar" aria-expanded={model.mobile.sidebarOpen} onclick={() => model.onMobileSidebar(!model.mobile.sidebarOpen)}><Icon name="menu" /></button>
  <div class="mobile-view-switcher" role="tablist" aria-label="Workspace view">
    <button id="mobileDetailsButton" type="button" role="tab" aria-controls="detailsPanel" aria-selected={model.mobile.view === "details"} onclick={() => model.onMobileView("details")}>Details</button>
    <button id="mobileChatButton" type="button" role="tab" aria-controls="agentPanel" aria-selected={model.mobile.view === "chat"} onclick={() => model.onMobileView("chat")}>Chat</button>
  </div>
  <button id="mobileImmersiveButton" class="mobile-icon-button mobile-immersive-button" type="button" aria-label="Toggle immersive chat" aria-pressed={model.mobile.immersive} onclick={() => model.onMobileImmersive(!model.mobile.immersive)}><Icon name={model.mobile.immersive ? "minimize-2" : "maximize-2"} /></button>
</header>
<button id="mobileSidebarBackdrop" class="mobile-sidebar-backdrop" type="button" aria-label="Close navigation" onclick={() => model.onMobileSidebar(false)}></button>
<aside id="mobileSidebar" class="sidebar">
  <div class="brand-band"><div class="brand-mark">F</div><div class="brand-copy"><strong>Forge</strong><span id="brandVersionIsland" data-version={model.version}></span></div></div>
  <section class="workspace-switcher">
    <div class="workspace-select-row">
      <button id="workspaceSwitcher" class="workspace-switcher-button" type="button" aria-haspopup="listbox" aria-expanded={workspaceMenuOpen} onclick={(event) => { event.stopPropagation(); workspaceMenuOpen = !workspaceMenuOpen; }}>
        <span class="workspace-avatar" id="workspaceAvatar"><img src={activeWorkspace?.iconSrc || "/favicon.svg"} alt="" aria-hidden="true" /></span>
        <span class="workspace-switcher-name" id="workspaceSwitcherName">{activeWorkspace?.name || "Workspace"}</span>
        <Icon name={switchingWorkspaceId ? "loader-circle" : "chevrons-up-down"} className="select-icon" />
      </button>
      {#if workspaceMenuOpen}
        <div id="workspaceMenu" class="workspace-menu" role="listbox">
          <div class="workspace-menu-title">Switch Workspace</div>
          {#each model.workspaces as workspace (workspace.id)}
            <button type="button" class="workspace-menu-row" role="option" aria-selected={workspace.id === model.activeWorkspaceId} data-workspace-id={workspace.id} disabled={Boolean(switchingWorkspaceId)} onclick={() => switchWorkspace(workspace.id)}>
              <span class="workspace-avatar"><img src={workspace.iconSrc} alt="" aria-hidden="true" /></span>
              <span class="workspace-menu-main"><strong>{workspace.name || workspace.id}</strong><small>{workspace.path}</small></span>
              {#if workspace.id === model.activeWorkspaceId}<Icon name="check" className="workspace-menu-check" />{/if}
            </button>
          {/each}
          <div class="workspace-menu-footer"><button type="button" id="workspaceMenuAdd" onclick={() => { workspaceMenuOpen = false; model.onAddWorkspace(); }}><Icon name="plus" /><span>Add workspace...</span></button></div>
        </div>
      {/if}
    </div>
  </section>
  <section class="tree-section">
    <div class="section-title"><span>Projects</span><button id="newProjectButton" type="button" title="New project" onclick={model.onCreateProject}><Icon name="plus" /></button></div>
    <nav id="projectTree" class="project-tree" data-navigation-identity={model.identity}>
      {#if model.loading}
        <div class="empty-state"><Icon name="loader-circle" className="empty-state-icon" /><strong>Loading workspace</strong><span>Refreshing navigation...</span></div>
      {:else if model.error}
        <div class="empty-state" role="alert"><Icon name="circle-alert" className="empty-state-icon" /><strong>Workspace unavailable</strong><span>{model.error}</span></div>
      {:else if model.projects.length === 0}
        <div class="empty-state"><Icon name="folder-search" className="empty-state-icon" /><strong>No workspace yet</strong><span>Add a workspace path to begin.</span></div>
      {:else}
        {#each model.projects as project (project.id)}
          <button type="button" class={`tree-item ${statusClass(project.status)} ${project.active ? "active" : ""} ${drag?.id === project.id ? "drag-source" : ""} ${rowDropClass(project.id)}`} aria-label={project.ariaLabel || undefined} title={project.statusLabel || undefined} onclick={(event) => activateTreeItem(event, project)} ondragover={(event) => updateDrop(event, { kind: "project", id: project.id, projectId: "" })} ondrop={(event) => commitDrop(event, { kind: "project", id: project.id, projectId: "" })}>
            <span class="chevron" data-project-toggle={project.children.length ? project.id : undefined}>{#if project.children.length}<Icon name={project.expanded ? "chevron-down" : "chevron-right"} />{/if}</span>
            {#if project.status.hasTaskState}<span class={`task-status-slot ${project.status.slotClassName}`} aria-hidden="true">{#each project.status.statuses as status (status.key)}<span class={`task-status-indicator ${status.className} ${status.recentOutput ? "task-status-fresh" : ""}`}><Icon name={status.iconName} className="task-status-icon" /></span>{/each}{#if project.status.lock}<span class={`task-lock-indicator ${project.status.lock.className}`}><Icon name="lock" className="task-lock-icon" /></span>{/if}</span>{/if}
            <Icon name="folder" className="tree-icon" />
            <span class="name"><span class="name-text">{project.title}</span><span class="resource-ref">{project.ref}</span>{#if project.summary && !project.expanded}<span class="project-task-summary" aria-hidden="true"><span class="project-task-summary-count">{project.summary.taskLabel}</span><span class="project-task-summary-separator">·</span><span class="project-task-summary-running">{project.summary.runningLabel}</span></span>{/if}</span>
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <span class="drag-handle" draggable="true" title="Drag to reorder" ondragstart={(event) => beginDrag(event, { kind: "project", id: project.id, projectId: "" })} ondragend={finishDrag}><Icon name="grip-vertical" className="drag-handle-icon" /></span>
          </button>
          {#if project.expanded}
            <div class="task-group">
              {#each project.children as task (task.id)}
                <button type="button" class={`tree-item task-item ${statusClass(task.status)} ${task.active ? "active" : ""} ${drag?.id === task.id ? "drag-source" : ""} ${rowDropClass(task.id)}`} aria-label={task.ariaLabel || undefined} title={task.statusLabel || undefined} onclick={(event) => activateTreeItem(event, task)} ondragover={(event) => updateDrop(event, { kind: "task", id: task.id, projectId: project.id })} ondrop={(event) => commitDrop(event, { kind: "task", id: task.id, projectId: project.id })}>
                  <span class="chevron"></span>
                  {#if task.status.hasTaskState}<span class={`task-status-slot ${task.status.slotClassName}`} aria-hidden="true">{#each task.status.statuses as status (status.key)}<span class={`task-status-indicator ${status.className} ${status.recentOutput ? "task-status-fresh" : ""}`}><Icon name={status.iconName} className="task-status-icon" /></span>{/each}{#if task.status.lock}<span class={`task-lock-indicator ${task.status.lock.className}`}><Icon name="lock" className="task-lock-icon" /></span>{/if}</span>{/if}
                  <Icon name="file-text" className="tree-icon" /><span class="name"><span class="name-text">{task.title}</span><span class="resource-ref">{task.ref}</span></span>
                  <!-- svelte-ignore a11y_no_static_element_interactions -->
                  <span class="drag-handle" draggable="true" title="Drag to reorder" ondragstart={(event) => beginDrag(event, { kind: "task", id: task.id, projectId: project.id })} ondragend={finishDrag}><Icon name="grip-vertical" className="drag-handle-icon" /></span>
                </button>
              {/each}
            </div>
          {/if}
        {/each}
      {/if}
    </nav>
  </section>
  <div id="sessionResize" class="resize-handle horizontal-resize sidebar-session-resize" role="separator" aria-orientation="horizontal" aria-label="Resize sessions panel" onpointerdown={(event) => beginResize(event, "sidebarSessionHeight")}></div>
  <section class="session-section">
    <div class="section-title"><span>Sessions</span></div>
    <div id="sessionList" class="session-list">
      {#if model.sessions.length === 0}
        <div class="session-row muted-row"><Icon name="message-square" /><div><strong>No active sessions</strong><span>Start one from a task directory.</span></div></div>
      {:else}
        {#each model.sessions as session (session.id)}
          <button type="button" class={`session-row ${session.source === "internal" ? "internal-session" : "external-session"} ${statusClass(session.status)} ${session.clickable ? "clickable-session" : ""} ${session.current ? "current-session" : ""} ${session.unread ? "session-unread" : ""} ${drag?.id === session.id ? "drag-source" : ""} ${rowDropClass(session.id)}`} aria-label={`${session.title}. ${session.statusLabel}`} title={session.statusLabel} onclick={(event) => activateSession(event, session)} ondragover={(event) => updateDrop(event, { kind: "session", id: session.id, projectId: "" })} ondrop={(event) => commitDrop(event, { kind: "session", id: session.id, projectId: "" })}>
            {#if session.status.hasTaskState}<span class={`task-status-slot session-status-icon ${session.status.slotClassName}`} aria-hidden="true">{#each session.status.statuses as status (status.key)}<span class={`task-status-indicator ${status.className} ${status.recentOutput ? "task-status-fresh" : ""}`}><Icon name={status.iconName} className="task-status-icon" /></span>{/each}{#if session.status.lock}<span class={`task-lock-indicator ${session.status.lock.className}`}><Icon name="lock" className="task-lock-icon" /></span>{/if}</span>{/if}
            <div class="session-title"><strong>{session.title}</strong><span>{session.meta}</span></div>
            <span class={`session-badge ${session.source === "internal" ? "internal" : "external"}`}>{session.label}</span>
            {#if session.unread}<span class="session-unread-badge" aria-label="Unread turn completion">New</span>{/if}
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <span class="drag-handle" draggable="true" title="Drag to reorder" ondragstart={(event) => beginDrag(event, { kind: "session", id: session.id, projectId: "" })} ondragend={finishDrag}><Icon name="grip-vertical" className="drag-handle-icon" /></span>
          </button>
          {#if sessionMenuId === session.id && session.menu}
            <div class="session-resource-menu" data-session-menu={session.id}>
              {#each session.controls as control (control.resourceId)}
                <button type="button" disabled={!control.navigable} onclick={() => selectResource(control.resourceId)}><Icon name="corner-down-right" /><span><strong>{control.resourceId}</strong><small>{control.path}</small></span></button>
              {/each}
            </div>
          {/if}
        {/each}
      {/if}
    </div>
  </section>
  <div class="sidebar-footer"><button id="systemSettingsButton" type="button" onclick={() => { model.onMobileSidebar(false); model.onOpenSettings(); }}><Icon name="settings" /><span>Settings</span></button></div>
</aside>
<div id="sidebarResize" class="resize-handle sidebar-resize" role="separator" aria-orientation="vertical" aria-label="Resize sidebar" onpointerdown={(event) => beginResize(event, "sidebarWidth")}></div>
<main class="workspace-panel">
  <section id="detailsPanel" class="details-panel"></section>
  <div id="detailsResize" class="resize-handle details-resize" role="separator" aria-orientation="vertical" aria-label="Resize chat panel" onpointerdown={(event) => beginResize(event, "chatWidth")}></div>
  <aside id="agentPanel" class="agent-panel"><div id="agentControls" class="agent-actions"></div><div id="selfDrivingBarWrap" class="self-driving-bar-wrap"></div><div id="agentSessionsWrap" class="agent-sessions"></div><div class="tty-panel"><div id="ttyLog" class="tty-log"></div><div id="ttyComposer" class="tty-composer"></div></div></aside>
</main>
