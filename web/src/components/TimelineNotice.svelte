<script lang="ts">
  import "./TimelineNotice.css";

  import Icon from "./Icon.svelte";

  let { title, text, error = false, alert = false }: { title: string; text: string; error?: boolean; alert?: boolean } = $props();
</script>

<div data-component-owner="event-timeline" class:timeline-notice-error={error} class="timeline-notice" role={alert ? "alert" : undefined}>
  <div><Icon name={error ? "triangle-alert" : "info"} /><strong>{title}</strong></div>
  <p>{text}</p>
</div>
