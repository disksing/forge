<script lang="ts">
  import "./LogTimeline.css";

  import Icon from "./Icon.svelte";
  import { compareLogTimeDesc, markdownHTML, relativeTime } from "./detail";
  import type { ResourceLogModel } from "./models";

  let { resourceId, logs, hasMore, loading, error, onLoadMore, onIconsChanged }: { resourceId: string; logs: ResourceLogModel[]; hasMore: boolean; loading: boolean; error: string; onLoadMore: () => Promise<void>; onIconsChanged: () => void } = $props();
  const ordered = $derived([...(logs || [])].sort(compareLogTimeDesc));
  let loadingLocally = $state(false);

  async function loadMore(): Promise<void> {
    if (loading || loadingLocally) return;
    loadingLocally = true;
    try { await onLoadMore(); } finally { loadingLocally = false; queueMicrotask(onIconsChanged); }
  }
</script>

{#if ordered.length || error || hasMore}
  <div class="content-section" data-component-owner="log-timeline" data-log-resource={resourceId}>
    <div class="log-timeline">
      {#each ordered as entry (entry.id)}
        <details class="log-entry" data-log-id={entry.id}>
          <summary>
            <span class="log-time" title={entry.time}><strong>{relativeTime(entry.time)}</strong><small>{entry.time}</small></span>
            <span class="log-title">{entry.title || "Untitled log entry"}</span>
            <span class="log-chevron" aria-hidden="true"><Icon name="chevron-right" /></span>
          </summary>
          <div class:empty={!entry.details} class="log-details">{#if entry.details}<div class="markdown-rendered">{@html markdownHTML(entry.details)}</div>{:else}No details.{/if}</div>
        </details>
      {/each}
    </div>
    {#if error}<p class="log-load-error" role="alert">{error}</p>{/if}
    {#if hasMore}<div class="log-load-actions"><button type="button" class="secondary-button log-load-more" class:busy={loading || loadingLocally} disabled={loading || loadingLocally} aria-busy={loading || loadingLocally} onclick={loadMore}><span class="log-load-icon log-load-icon-idle"><Icon name="chevron-down" /></span><span class="log-load-icon log-load-icon-busy"><Icon name="loader-circle" className="spin" /></span><span>{loading || loadingLocally ? "Loading older logs..." : error ? "Retry" : "Load More"}</span></button></div>{/if}
  </div>
{/if}
