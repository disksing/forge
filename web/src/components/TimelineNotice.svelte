<script lang="ts">
  import "./TimelineNotice.css";

  import Icon from "./Icon.svelte";

  let { title, text, error = false, alert = false, onDismiss }: { title: string; text: string; error?: boolean; alert?: boolean; onDismiss?: () => void } = $props();
</script>

<div data-component-owner="event-timeline" class:timeline-notice-error={error} class="timeline-notice" role={alert ? "alert" : undefined}>
  <div><Icon name={error ? "triangle-alert" : "info"} /><strong>{title}</strong>{#if onDismiss}<button type="button" class="timeline-notice-dismiss" title="Dismiss" aria-label={`Dismiss ${title} notice`} onclick={onDismiss}><Icon name="x" /></button>{/if}</div>
  <p>{text}</p>
</div>
