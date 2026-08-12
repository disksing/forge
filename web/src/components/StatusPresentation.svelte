<script lang="ts">
  import "./StatusPresentation.css";

  import Icon from "./Icon.svelte";
  import type { ShellStatusPresentation } from "./models";

  let { status, className = "" }: { status: ShellStatusPresentation; className?: string } = $props();
</script>

{#if status.hasTaskState}
  <span class={`task-status-slot ${className} ${status.slotClassName}`} data-component-owner="status-presentation" aria-hidden="true">
    {#each status.statuses as item (item.key)}<span class={`task-status-indicator ${item.className} ${item.recentOutput ? "task-status-fresh" : ""}`}><Icon name={item.iconName} className="task-status-icon" /></span>{/each}
  </span>
{/if}
