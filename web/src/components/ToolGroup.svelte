<script lang="ts">
  import "./ToolGroup.css";

  import Icon from "./Icon.svelte";
  import type { TimelineItem } from "./models";
  import { formatToolCallCount, toolCallCount, toolGroupKey } from "./tool-group";
  import ToolItem from "./ToolItem.svelte";

  type ToolCall = NonNullable<TimelineItem["calls"]>[number];
  let { item, generationId, open, onToggle }: { item: TimelineItem; generationId: string; open: boolean; onToggle: (open: boolean) => void } = $props();
  let calls = $derived(item.calls || []);
  let count = $derived(toolCallCount(item));
  let summaries = $derived(calls.map(summary));

  function summary(call: ToolCall): string {
    return [call.name, call.summary].filter(Boolean).join(" · ") || "Tool call";
  }
</script>

<details data-component-owner="event-timeline" class="agent-tool-group" data-tool-group-key={`${generationId}:${toolGroupKey(item)}`} {open} ontoggle={(event) => onToggle(event.currentTarget.open)}>
  <summary><span class="agent-tool-group-icon"><Icon name="wrench" /></span><span class="agent-tool-group-title">{formatToolCallCount(count)}</span><span class="agent-tool-group-preview">{summaries.slice(0, 2).join(" · ")}{summaries.length > 2 ? ` · +${summaries.length - 2} more` : ""}</span><span class="agent-tool-group-chevron"><Icon name="chevron-right" /></span></summary>
  <div class="agent-tool-list">
    {#each calls as call (String(call.callId || call.key))}<ToolItem {call} />{/each}
  </div>
</details>
