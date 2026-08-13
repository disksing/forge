<script lang="ts">
  import "./ToolItem.css";

  import Icon from "./Icon.svelte";
  import type { TimelineItem } from "./models";

  type ToolCall = NonNullable<TimelineItem["calls"]>[number];
  let { call }: { call: ToolCall } = $props();

  function summary(): string {
    return [call.name, call.summary].filter(Boolean).join(" · ") || "Tool call";
  }

  function details(): string {
    return [call.error, call.output, call.rawPreview].filter(Boolean).join("\n\n");
  }
</script>

<details data-component-owner="event-timeline" class={`agent-tool-item agent-tool-${String(call.status || "completed")}`}>
  <summary><span class="tool-status-icon tool-status-icon-running"><Icon name="loader-circle" /></span><span class="tool-status-icon tool-status-icon-failed"><Icon name="x-circle" /></span><span class="tool-status-icon tool-status-icon-completed"><Icon name="check-circle" /></span><span>{summary()}</span><small>{String(call.method || "tool")}</small></summary>
  {#if details()}<pre>{details()}</pre>{/if}
</details>
