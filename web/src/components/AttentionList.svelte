<script lang="ts">
  import "./AttentionList.css";

  import Icon from "./Icon.svelte";
  import StatusPresentation from "./StatusPresentation.svelte";
  import type { ShellAttentionItem, ShellStatusPresentation } from "./models";

  let {
    items,
    onSelect,
    onToggleAttention,
    onDismiss,
    onToast,
  }: {
    items: ShellAttentionItem[];
    onSelect: (id: string) => Promise<void>;
    onToggleAttention: (id: string, followed: boolean) => Promise<void>;
    onDismiss: (id: string) => Promise<void>;
    onToast: (message: string) => void;
  } = $props();

  function statusClass(status: ShellStatusPresentation): string {
    return [status.layoutClassName, status.className].filter(Boolean).join(" ");
  }

  function iconName(item: ShellAttentionItem): string {
    if (item.type === "project") return "folder";
    if (item.type === "task") return "file-text";
    if (item.type === "scheduler") return "calendar-clock";
    return "home";
  }

  function resourceKind(item: ShellAttentionItem): string {
    if (item.type === "project") return "Project";
    if (item.type === "task") return "Task";
    if (item.type === "scheduler") return "Scheduler";
    return "Workspace";
  }

  function canFollow(item: ShellAttentionItem): boolean {
    return item.type === "project" || item.type === "task";
  }

  function metadata(item: ShellAttentionItem): string {
    return [
      item.ref || item.id,
      item.agentName ? `Agent ${item.agentName}` : "",
      item.turnNumber > 0 ? `Turn ${item.turnNumber}` : "No turns",
      item.statusLabel,
    ].filter(Boolean).join(" · ");
  }

  async function select(item: ShellAttentionItem): Promise<void> {
    try {
      await onSelect(item.id);
    } catch (reason) {
      onToast(reason instanceof Error ? reason.message : String(reason));
    }
  }

  async function toggleAttention(event: Event, item: ShellAttentionItem): Promise<void> {
    event.preventDefault();
    event.stopPropagation();
    try {
      await onToggleAttention(item.id, !item.followed);
    } catch (reason) {
      onToast(reason instanceof Error ? reason.message : String(reason));
    }
  }

  async function dismiss(event: Event, item: ShellAttentionItem): Promise<void> {
    event.preventDefault();
    event.stopPropagation();
    try {
      await onDismiss(item.id);
    } catch (reason) {
      onToast(reason instanceof Error ? reason.message : String(reason));
    }
  }

  function controlKeydown(event: KeyboardEvent, action: (event: KeyboardEvent) => Promise<void>): void {
    if (event.key !== "Enter" && event.key !== " ") return;
    void action(event);
  }
</script>

<section class="attention-section" data-component-owner="attention-list">
  <div class="section-title"><span>Activity</span></div>
  <nav class="attention-list" aria-label="Activity list">
    {#if items.length === 0}
      <div class="activity-row empty-attention"><Icon name="message-square" /><div><strong>No activity</strong><span>Follow a resource or start a turn.</span></div></div>
    {:else}
      {#each items as item (item.id)}
        <button type="button" class={`activity-row ${statusClass(item.status)} ${item.selected ? "selected" : ""}`} aria-current={item.selected ? "page" : undefined} data-active-turn={item.activeTurn || undefined} aria-label={`${item.title}. ${metadata(item)}`} title={item.statusLabel || undefined} onclick={() => select(item)}>
          <span class="activity-status" aria-hidden="true">
            <span class="activity-status-fallback-slot" hidden={item.status.hasTaskState}><Icon name={iconName(item)} className="activity-status-fallback" /></span>
            <span class="activity-status-runtime-slot" hidden={!item.status.hasTaskState}><StatusPresentation status={item.status} className="activity-status-icon" /></span>
          </span>
          <span class="activity-title"><strong>{item.title}</strong><span class="activity-meta">{metadata(item)}</span></span>
          <span class="activity-badge">{resourceKind(item)}</span>
          <span class="activity-actions">
            {#if canFollow(item)}
              <!-- svelte-ignore a11y_no_static_element_interactions -->
              <span class:followed={item.followed} class="attention-star" role="button" tabindex="0" aria-label={item.followed ? `Unfollow ${item.title}` : `Follow ${item.title}`} title={item.followed ? "Unfollow" : "Follow"} onclick={(event) => toggleAttention(event, item)} onkeydown={(event) => controlKeydown(event, (keyEvent) => toggleAttention(keyEvent, item))}><Icon name="star" /></span>
            {/if}
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <span class="attention-dismiss" role="button" tabindex="0" aria-label={`Dismiss ${item.title}`} title="Dismiss" onclick={(event) => dismiss(event, item)} onkeydown={(event) => controlKeydown(event, (keyEvent) => dismiss(keyEvent, item))}><Icon name="x" /></span>
          </span>
        </button>
      {/each}
    {/if}
  </nav>
</section>
