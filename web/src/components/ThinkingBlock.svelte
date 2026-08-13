<script lang="ts">
  import "./ThinkingBlock.css";

  import Icon from "./Icon.svelte";
  import type { TimelineItem } from "./models";

  let { item, onExpand = () => {} }: { item: TimelineItem; onExpand?: () => void } = $props();

  // Keep the details open state local. Timeline items are rebuilt on every
  // incoming event, so binding `open` directly to `item.active` would reset
  // a block the user toggled. Only an actual active-state transition (stream
  // start/finish) drives the open state.
  // svelte-ignore state_referenced_locally
  let open = $state(Boolean(item.active));
  // svelte-ignore state_referenced_locally
  let lastActive = Boolean(item.active);
  $effect(() => {
    const active = Boolean(item.active);
    if (active === lastActive) return;
    lastActive = active;
    open = active;
  });

  function title(): string {
    if (item.active) return "Thinking…";
    if (!item.startTime || !item.time) return "Thought";
    const seconds = Math.round((new Date(item.time).getTime() - new Date(item.startTime).getTime()) / 1000);
    if (!Number.isFinite(seconds) || seconds < 0) return "Thought";
    return seconds < 60 ? `Thought for ${seconds} ${seconds === 1 ? "second" : "seconds"}` : `Thought for ${Math.floor(seconds / 60)}m${seconds % 60}s`;
  }
</script>

<details data-component-owner="event-timeline" class="agent-reasoning-note" open={open} ontoggle={(event) => { open = event.currentTarget.open; if (event.currentTarget.open) onExpand(); }}>
  <summary><Icon name="brain-circuit" /><span>{title()}</span><span class="agent-reasoning-chevron"><Icon name="chevron-right" /></span></summary>
  <p>{item.text || ""}</p>
</details>
