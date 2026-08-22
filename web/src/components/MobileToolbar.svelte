<script lang="ts">
  import "./MobileToolbar.css";

  import Icon from "./Icon.svelte";

  let {
    sidebarOpen,
    onSidebar,
  }: {
    sidebarOpen: boolean;
    onSidebar: (open: boolean) => void;
  } = $props();
</script>

<header class="mobile-toolbar" data-component-owner="mobile-toolbar">
  <button id="mobileMenuButton" class="mobile-icon-button" type="button" aria-label="Open navigation" aria-controls="mobileSidebar" aria-expanded={sidebarOpen} onclick={() => onSidebar(!sidebarOpen)}><Icon name="menu" /></button>
</header>
<button id="mobileSidebarBackdrop" class="mobile-sidebar-backdrop" data-component-owner="mobile-toolbar" type="button" aria-label="Close navigation" onclick={() => onSidebar(false)}></button>
