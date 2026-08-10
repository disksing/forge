<script lang="ts">
  import "./ThinkingBlock.css";

  import Icon from "./Icon.svelte";
  import type { TimelineItem } from "./models";

  let { item }: { item: TimelineItem } = $props();

  function title(): string {
    if (item.active) return "Thinking…";
    if (!item.startTime || !item.time) return "Thought";
    const seconds = Math.round((new Date(item.time).getTime() - new Date(item.startTime).getTime()) / 1000);
    if (!Number.isFinite(seconds) || seconds < 0) return "Thought";
    return seconds < 60 ? `Thought for ${seconds} ${seconds === 1 ? "second" : "seconds"}` : `Thought for ${Math.floor(seconds / 60)}m${seconds % 60}s`;
  }
</script>

<details data-component-owner="event-timeline" class="agent-reasoning-note" open={item.active}>
  <summary><Icon name="brain-circuit" /><span>{title()}</span><span class="agent-reasoning-chevron"><Icon name="chevron-right" /></span></summary>
  <p>{item.text || ""}</p>
</details>
