<script lang="ts">
  import "./MobileToolbar.css";

  import Icon from "./Icon.svelte";

  let {
    sidebarOpen,
    view,
    immersive,
    onSidebar,
    onView,
    onImmersive,
  }: {
    sidebarOpen: boolean;
    view: "details" | "chat";
    immersive: boolean;
    onSidebar: (open: boolean) => void;
    onView: (view: "details" | "chat") => void;
    onImmersive: (immersive: boolean) => void;
  } = $props();
</script>

<header class="mobile-toolbar" data-component-owner="mobile-toolbar">
  <button id="mobileMenuButton" class="mobile-icon-button" type="button" aria-label="Open navigation" aria-controls="mobileSidebar" aria-expanded={sidebarOpen} onclick={() => onSidebar(!sidebarOpen)}><Icon name="menu" /></button>
  <div class="mobile-view-switcher" role="tablist" aria-label="Workspace view">
    <button id="mobileDetailsButton" type="button" role="tab" aria-controls="detailsPanel" aria-selected={view === "details"} onclick={() => onView("details")}>Details</button>
    <button id="mobileChatButton" type="button" role="tab" aria-controls="agentPanel" aria-selected={view === "chat"} onclick={() => onView("chat")}>Chat</button>
  </div>
  <button id="mobileImmersiveButton" class="mobile-icon-button mobile-immersive-button" type="button" aria-label="Toggle immersive chat" aria-pressed={immersive} onclick={() => onImmersive(!immersive)}><Icon name={immersive ? "minimize-2" : "maximize-2"} /></button>
</header>
<button id="mobileSidebarBackdrop" class="mobile-sidebar-backdrop" data-component-owner="mobile-toolbar" type="button" aria-label="Close navigation" onclick={() => onSidebar(false)}></button>
