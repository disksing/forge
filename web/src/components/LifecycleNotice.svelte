<script lang="ts">
  import "./LifecycleNotice.css";

  import Icon from "./Icon.svelte";
  import type { TimelineItem } from "./models";

  let { item }: { item: TimelineItem } = $props();
  let iconName = $derived(item.tone === "ok" ? "check-circle" : item.tone === "danger" ? "triangle-alert" : item.tone === "info" ? "info" : "clock");

  function clock(): string {
    const date = new Date(item.time || "");
    return Number.isNaN(date.valueOf()) ? "" : date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  }
</script>

<div data-component-owner="event-timeline" class={`agent-system-note agent-lifecycle-${item.tone || "muted"}`}><Icon name={iconName} /><span>{item.text || ""}</span><span class="agent-note-time">{clock()}</span></div>
