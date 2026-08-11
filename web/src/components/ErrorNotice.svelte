<script lang="ts">
  import "./ErrorNotice.css";

  import Icon from "./Icon.svelte";

  let { title, text, alert = false }: { title: string; text: string; alert?: boolean } = $props();
</script>

<div data-component-owner="event-timeline" class="agent-event error" role={alert ? "alert" : undefined}><div><Icon name="triangle-alert" /><strong>{title}</strong></div><p>{text}</p></div>
