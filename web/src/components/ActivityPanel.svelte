<script lang="ts">
  import "./AttentionList.css";

  import Icon from "./Icon.svelte";
  import StatusPresentation from "./StatusPresentation.svelte";
  import type { ShellActivityItem, ShellActivityLists, ShellStatusPresentation } from "./models";

  let {
    activity,
    onSelect,
    onToggleFavorite,
    onToast,
  }: {
    activity: ShellActivityLists;
    onSelect: (id: string) => Promise<void>;
    onToggleFavorite: (id: string, favorite: boolean) => Promise<void>;
    onToast: (message: string) => void;
  } = $props();

  type ActivityTab = keyof ShellActivityLists;
  let activeTab = $state<ActivityTab>("running");
  // Short labels keep every category visible within the narrow sidebar; the
  // full name stays available via tooltip (title) and the tabpanel aria-label.
  const tabs: Array<{ key: ActivityTab; label: string; fullLabel: string }> = [
    { key: "running", label: "Running", fullLabel: "Running" },
    { key: "favorites", label: "Favs", fullLabel: "Favorites" },
    { key: "unread", label: "Unread", fullLabel: "Unread" },
    { key: "problems", label: "Issues", fullLabel: "Problems" },
  ];

  function statusClass(status: ShellStatusPresentation): string {
    return [status.layoutClassName, status.className].filter(Boolean).join(" ");
  }

  function iconName(item: ShellActivityItem): string {
    if (item.type === "project") return "folder";
    if (item.type === "task") return "file-text";
    if (item.type === "scheduler") return "calendar-clock";
    return "home";
  }

  function canFavorite(item: ShellActivityItem): boolean {
    return item.type === "project" || item.type === "task";
  }

  function metadata(item: ShellActivityItem): string {
    return [
      item.ref || item.id,
      item.agentName ? `Agent ${item.agentName}` : "",
      item.turnNumber > 0 ? `Turn ${item.turnNumber}` : "No turns",
      item.statusLabel,
    ].filter(Boolean).join(" · ");
  }

  function emptyMessage(tab: ActivityTab): string {
    if (tab === "favorites") return "Favorite a project or task to keep it here.";
    if (tab === "unread") return "All resource Turns have been read.";
    if (tab === "problems") return "No blocked or error Tasks.";
    return "No resources are currently running.";
  }

  async function select(item: ShellActivityItem): Promise<void> {
    try {
      await onSelect(item.id);
    } catch (reason) {
      onToast(reason instanceof Error ? reason.message : String(reason));
    }
  }

  async function toggleFavorite(event: Event, item: ShellActivityItem): Promise<void> {
    event.preventDefault();
    event.stopPropagation();
    if (event instanceof MouseEvent) (event.currentTarget as HTMLElement | null)?.blur();
    try {
      await onToggleFavorite(item.id, !item.favorite);
    } catch (reason) {
      onToast(reason instanceof Error ? reason.message : String(reason));
    }
  }

  function favoriteKeydown(event: KeyboardEvent, item: ShellActivityItem): void {
    if (event.key !== "Enter" && event.key !== " ") return;
    void toggleFavorite(event, item);
  }
</script>

<section class="attention-section" data-component-owner="attention-list">
  <div class="activity-tabs" role="tablist" aria-label="Activity categories">
    {#each tabs as tab}
      <button type="button" role="tab" title={tab.fullLabel} aria-selected={activeTab === tab.key} aria-controls={`activity-panel-${tab.key}`} class:active={activeTab === tab.key} onclick={() => { activeTab = tab.key; }}>{tab.label} <span class="activity-tab-count">{activity[tab.key].length}</span></button>
    {/each}
  </div>
  <div id={`activity-panel-${activeTab}`} class="attention-list" role="tabpanel" aria-label={`${tabs.find((tab) => tab.key === activeTab)?.fullLabel || "Activity"} resources`}>
    {#if activity[activeTab].length === 0}
      <div class="activity-row empty-attention"><Icon name="message-square" /><div><strong>No items</strong><span>{emptyMessage(activeTab)}</span></div></div>
    {:else}
      {#each activity[activeTab] as item (item.id)}
        <button type="button" class={`activity-row ${statusClass(item.status)} ${item.selected ? "selected" : ""}`} aria-current={item.selected ? "page" : undefined} data-active-turn={item.activeTurn || undefined} aria-label={`${item.title}. ${metadata(item)}`} title={item.statusLabel || undefined} onclick={() => select(item)}>
          <span class="activity-status" aria-hidden="true">
            <span class="activity-status-fallback-slot" hidden={item.status.hasTaskState}><Icon name={iconName(item)} className="activity-status-fallback" /></span>
            <span class="activity-status-runtime-slot" hidden={!item.status.hasTaskState}><StatusPresentation status={item.status} className="activity-status-icon" /></span>
          </span>
          <span class="activity-title"><strong>{item.title}</strong><span class="activity-meta">{metadata(item)}</span></span>
          <span class="activity-actions">
            {#if canFavorite(item)}
              <!-- svelte-ignore a11y_no_static_element_interactions -->
              <span class:favorite={item.favorite} class="favorite-star" role="checkbox" aria-checked={item.favorite} tabindex="0" aria-label={item.favorite ? `Remove ${item.title} from favorites` : `Add ${item.title} to favorites`} title={item.favorite ? "Remove from favorites" : "Add to favorites"} onclick={(event) => toggleFavorite(event, item)} onkeydown={(event) => favoriteKeydown(event, item)}><Icon name="star" /></span>
            {/if}
          </span>
        </button>
      {/each}
    {/if}
  </div>
</section>
