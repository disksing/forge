<script lang="ts">
  import "./AppShell.css";

  import { onMount, type Snippet } from "svelte";

  import Icon from "./Icon.svelte";
  import DoctorDialog from "./DoctorDialog.svelte";
  import AttentionList from "./AttentionList.svelte";
  import MobileToolbar from "./MobileToolbar.svelte";
  import type { ModelChannel } from "./model-channel";
  import type { AppShellModel } from "./models";
  import PaneResizeHandle from "./PaneResizeHandle.svelte";
  import ProjectTree from "./ProjectTree.svelte";
  import SchedulerNav from "./SchedulerNav.svelte";
  import WorkspaceSwitcher from "./WorkspaceSwitcher.svelte";

  let { channel, details, timeline, composer, agentHeader }: {
    channel: ModelChannel<AppShellModel>;
    details?: Snippet;
    timeline?: Snippet;
    composer?: Snippet;
    agentHeader?: Snippet;
  } = $props();
  // svelte-ignore state_referenced_locally
  let model = $state(channel.current());
  let appliedRouteRevision = $state(0);
  let doctorOpen = $state(false);

  onMount(() => {
    const unsubscribe = channel.subscribe((next) => {
      model = next;
      queueMicrotask(next.onIconsChanged);
    });
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && model.mobile.sidebarOpen) model.onMobileSidebar(false);
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
</script>

<div data-component-owner="app-shell" class="app-shell">
<MobileToolbar sidebarOpen={model.mobile.sidebarOpen} view={model.mobile.view} immersive={model.mobile.immersive} onSidebar={model.onMobileSidebar} onView={model.onMobileView} onImmersive={model.onMobileImmersive} />
<aside id="mobileSidebar" class="sidebar">
  <div class="brand-band"><div class="brand-mark">F</div><div class="brand-copy"><strong>Forge</strong><span>{model.version}</span></div>{#if model.doctor.summary.errors + model.doctor.summary.warnings > 0 || model.doctor.error}<button id="doctorButton" class:has-errors={model.doctor.summary.errors > 0} class="brand-doctor" type="button" title="Workspace problems" aria-label={`${model.doctor.summary.errors} errors and ${model.doctor.summary.warnings} warnings`} onclick={() => { model.onMobileSidebar(false); doctorOpen = true; }}><Icon name={model.doctor.summary.errors > 0 ? "circle-alert" : "triangle-alert"} /><span>{model.doctor.summary.errors + model.doctor.summary.warnings}</span></button>{/if}<button id="systemSettingsButton" class="brand-settings" type="button" title="Settings" aria-label="Settings" onclick={() => { model.onMobileSidebar(false); model.onOpenSettings(); }}><Icon name="settings" /></button></div>
  <WorkspaceSwitcher identity={model.identity} mobileSidebarOpen={model.mobile.sidebarOpen} activeWorkspaceId={model.activeWorkspaceId} workspaces={model.workspaces} onSwitch={model.onSwitchWorkspace} onAdd={model.onAddWorkspace} onToast={model.onToast} />
  <SchedulerNav item={model.scheduler || null} onSelect={model.onSelectResource} onToast={model.onToast} />
  <ProjectTree identity={model.identity} loading={model.loading} error={model.error} projects={model.projects} onCreate={model.onCreateProject} onToggle={model.onToggleProject} onSelect={model.onSelectResource} onReorder={model.onReorder} onDragState={model.onDragState} onToggleAttention={model.onToggleAttention} onToast={model.onToast} />
  <PaneResizeHandle id="activityResize" kind="sidebarAttentionHeight" className="horizontal-resize sidebar-activity-resize" label="Resize activity panel" onPreview={model.onPanePreview} onCommit={model.onPaneCommit} />
  <AttentionList items={model.attentionList} onSelect={model.onSelectResource} onToggleAttention={model.onToggleAttention} onDismiss={model.onDismissAttention} onToast={model.onToast} />
</aside>
<PaneResizeHandle id="sidebarResize" kind="sidebarWidth" className="sidebar-resize" label="Resize sidebar" onPreview={model.onPanePreview} onCommit={model.onPaneCommit} />
<main class="workspace-panel">
  <div class="workspace-toolbar">
    <button id="splitMenuButton" class="workspace-menu-button" type="button" aria-label="Open navigation" aria-controls="mobileSidebar" aria-expanded={model.mobile.sidebarOpen} onclick={() => model.onMobileSidebar(true)}><Icon name="menu" /></button>
  </div>
  <div class="workspace-view-tabs">
    <div class="workspace-view-switcher" role="tablist" aria-label="Workspace view">
      <button id="paneDetailsTab" type="button" role="tab" aria-controls="detailsPanel" aria-selected={model.mobile.view === "details"} onclick={() => model.onMobileView("details")}>Details</button>
      <button id="paneChatTab" type="button" role="tab" aria-controls="agentPanel" aria-selected={model.mobile.view === "chat"} onclick={() => model.onMobileView("chat")}>Chat</button>
    </div>
  </div>
  <section id="detailsPanel" class="details-panel" data-component-owner="detail-panel">{#if details}{@render details()}{/if}</section>
  <PaneResizeHandle id="detailsResize" kind="chatWidth" className="details-resize" label="Resize chat panel" onPreview={model.onPanePreview} onCommit={model.onPaneCommit} />
  <aside id="agentPanel" class="agent-panel"><div class="chat-panel">{#if agentHeader}{@render agentHeader()}{/if}<div id="chatTimeline" class="chat-timeline" data-component-owner="event-timeline">{#if timeline}{@render timeline()}{/if}</div><div id="chatComposer" class="chat-composer" data-component-owner="chat-composer">{#if composer}{@render composer()}{/if}</div></div></aside>
</main>
</div>
{#if doctorOpen}<DoctorDialog snapshot={model.doctor} onClose={() => { doctorOpen = false; }} onRefresh={model.onRefreshDoctor} onIconsChanged={model.onIconsChanged} />{/if}
