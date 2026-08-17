<script lang="ts">
  import "./ActivityGroup.css";

  import Icon from "./Icon.svelte";
  import type { TimelineItem } from "./models";
  import { formatToolCallCount } from "./tool-group";
  import ToolItem from "./ToolItem.svelte";

  type ToolCall = NonNullable<TimelineItem["calls"]>[number];
  let { item, onExpand = () => {} }: { item: TimelineItem; onExpand?: () => void } = $props();
  let children = $derived(item.items || []);
  let thoughts = $derived(Math.max(0, Number(item.thinkingCount) || 0));
  let tools = $derived(Math.max(0, Number(item.toolCallCount) || 0));
  // svelte-ignore state_referenced_locally
  let open = $state(false);
  // svelte-ignore state_referenced_locally
  let lastActive = Boolean(item.active);

  // Live activity has a separate flat rendering. Reset the settled disclosure
  // before it replaces that live view; manual toggles remain local otherwise.
  $effect(() => {
    const active = Boolean(item.active);
    if (active === lastActive) return;
    lastActive = active;
    if (!active) open = false;
  });

  function title(): string {
    const parts = [];
    if (thoughts) parts.push(`${thoughts} ${thoughts === 1 ? "thought" : "thoughts"}`);
    if (tools) parts.push(formatToolCallCount(tools));
    return parts.join(" · ") || (item.active ? "Agent activity…" : "Agent activity");
  }

  function preview(): string {
    const summaries = children
      .filter((child) => child.kind === "tools")
      .flatMap((child) => child.calls || [])
      .map(callSummary)
      .filter(Boolean);
    return `${summaries.slice(0, 2).join(" · ")}${summaries.length > 2 ? ` · +${summaries.length - 2} more` : ""}`;
  }

  function callSummary(call: ToolCall): string {
    return [call.name, call.summary].filter(Boolean).join(" · ") || "Tool call";
  }

  function thoughtTitle(child: TimelineItem): string {
    if (child.active) return "Thinking…";
    if (!child.startTime || !child.time) return "Thought";
    const seconds = Math.round((new Date(child.time).getTime() - new Date(child.startTime).getTime()) / 1000);
    if (!Number.isFinite(seconds) || seconds < 0) return "Thought";
    return seconds < 60
      ? `Thought for ${seconds} ${seconds === 1 ? "second" : "seconds"}`
      : `Thought for ${Math.floor(seconds / 60)}m${seconds % 60}s`;
  }

  function toolCount(child: TimelineItem): number {
    return Math.max(0, Number(child.toolCallCount) || child.calls?.length || 0);
  }
</script>

{#if item.active}
  <div data-component-owner="event-timeline" class="agent-activity-group agent-activity-live">
    <div class="agent-activity-list">
      {#if !children.length}
        <div class="agent-activity-loading">Loading activity details…</div>
      {/if}
      {#each children as child, index (`${String(child.key ?? index)}:${child.kind}`)}
        {#if child.kind === "thinking"}
          <section class="agent-activity-thought"><header><Icon name="brain-circuit" /><span>{thoughtTitle(child)}</span></header><p>{child.text || ""}</p></section>
        {:else if child.kind === "tools"}
          <div class="agent-activity-tool-list">{#each child.calls || [] as call (String(call.callId || call.key))}<ToolItem {call} />{/each}</div>
        {/if}
      {/each}
    </div>
  </div>
{:else}
  <details data-component-owner="event-timeline" class="agent-activity-group" {open} ontoggle={(event) => { open = event.currentTarget.open; if (open) onExpand(); }}>
    <summary><span class="agent-activity-icon"><Icon name="activity" /></span><span class="agent-activity-title">{title()}</span>{#if preview()}<span class="agent-activity-preview">{preview()}</span>{/if}<span class="agent-activity-chevron"><Icon name="chevron-right" /></span></summary>
  <div class="agent-activity-list">
    {#if !children.length}
      <div class="agent-activity-loading">Loading activity details…</div>
    {/if}
    {#each children as child, index (`${String(child.key ?? index)}:${child.kind}`)}
      {#if child.kind === "thinking"}
        <section class="agent-activity-thought"><header><Icon name="brain-circuit" /><span>{thoughtTitle(child)}</span></header><p>{child.text || ""}</p></section>
      {:else if child.kind === "tools"}
        <section class="agent-activity-tools"><header><Icon name="wrench" /><span>{formatToolCallCount(toolCount(child))}</span></header><div class="agent-activity-tool-list">{#each child.calls || [] as call (String(call.callId || call.key))}<ToolItem {call} />{/each}</div></section>
      {/if}
    {/each}
  </div>
  </details>
{/if}
