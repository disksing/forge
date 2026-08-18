<script lang="ts">
  import "./MobileToolbar.css";

  import Icon from "./Icon.svelte";

  let {
    sidebarOpen,
    view,
    onSidebar,
    onView,
  }: {
    sidebarOpen: boolean;
    view: "details" | "chat";
    onSidebar: (open: boolean) => void;
    onView: (view: "details" | "chat") => void;
  } = $props();
</script>

<header class="mobile-toolbar" data-component-owner="mobile-toolbar">
  <button id="mobileMenuButton" class="mobile-icon-button" type="button" aria-label="Open navigation" aria-controls="mobileSidebar" aria-expanded={sidebarOpen} onclick={() => onSidebar(!sidebarOpen)}><Icon name="menu" /></button>
  <div class="mobile-view-switcher" role="tablist" aria-label="Workspace view">
    <button id="mobileDetailsButton" type="button" role="tab" aria-controls="detailsPanel" aria-selected={view === "details"} onclick={() => onView("details")}>Details</button>
    <button id="mobileChatButton" type="button" role="tab" aria-controls="agentPanel" aria-selected={view === "chat"} onclick={() => onView("chat")}>Chat</button>
  </div>
</header>
<button id="mobileSidebarBackdrop" class="mobile-sidebar-backdrop" data-component-owner="mobile-toolbar" type="button" aria-label="Close navigation" onclick={() => onSidebar(false)}></button>
