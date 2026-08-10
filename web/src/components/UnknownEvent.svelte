<script lang="ts">
  import "./UnknownEvent.css";

  import Icon from "./Icon.svelte";
  import type { TimelineItem } from "./models";

  let { item }: { item: TimelineItem } = $props();
</script>

<details data-component-owner="event-timeline" class="agent-tool-item agent-unknown-event"><summary><Icon name="info" /><span>Unhandled event: {item.type || item.kind}</span></summary><pre>{item.preview || "This event carries no payload."}</pre></details>
