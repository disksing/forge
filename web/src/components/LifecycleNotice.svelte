<script lang="ts">
  import "./LifecycleNotice.css";

  import Icon from "./Icon.svelte";
  import type { TimelineItem } from "./models";
  import { formatClock } from "./timeline-events";

  let { item }: { item: TimelineItem } = $props();
  let iconName = $derived(item.tone === "ok" ? "check-circle" : item.tone === "danger" ? "triangle-alert" : item.tone === "info" ? "info" : "clock");

  function clock(): string {
    return formatClock(item.time);
  }
</script>

<div data-component-owner="event-timeline" class={`agent-system-note agent-lifecycle-${item.tone || "muted"}`}><Icon name={iconName} /><span>{item.text || ""}</span><span class="agent-note-time">{clock()}</span></div>
