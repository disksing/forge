<script lang="ts">
  import "./ForgeNotice.css";

  import Icon from "./Icon.svelte";
  import type { AgentNotice } from "./models";

  let { notice }: { notice: AgentNotice } = $props();
  let error = $derived(notice.data?.level === "error");
</script>

<div data-component-owner="event-timeline" class={`agent-event ${error ? "error" : "system"}`}><div><Icon name={error ? "triangle-alert" : "info"} /><strong>Forge</strong></div><p>{String(notice.data?.text || "")}</p></div>
