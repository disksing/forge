<script lang="ts">
  import "./SelfDrivingBar.css";

  import { onMount } from "svelte";

  import type { ModelChannel } from "./model-channel";
  import Icon from "./Icon.svelte";
  import type { SelfDrivingBarModel } from "./models";

  let { channel }: { channel: ModelChannel<SelfDrivingBarModel> } = $props();
  // svelte-ignore state_referenced_locally
  let model = $state(channel.current());

  onMount(() => channel.subscribe((next) => {
    model = next;
    queueMicrotask(next.onIconsChanged);
  }));

  const toggleLabel = $derived(model.expanded ? "Hide Self-Driving details" : "Show Self-Driving details");
  const switchLabel = $derived(model.enabled ? "Turn Self-Driving off" : "Turn Self-Driving on");
</script>

{#if model.visible}
  <section class={`self-driving-bar self-driving-bar-${model.status.key}${model.expanded ? " expanded" : ""}`} role="status" aria-label={`Self-Driving: ${model.status.label}`}>
    <div class="self-driving-bar-row">
      <span class="self-driving-bar-title"><Icon name="workflow" className="self-driving-title-icon" /><strong>Self-Driving</strong></span>
      <span class={`self-driving-state self-driving-state-${model.status.key}`}><Icon name={model.status.icon} className="self-driving-state-icon" /><span>{model.status.label}</span></span>
      {#if model.summary}<span class="self-driving-bar-summary" title={model.summary}>{model.summary}</span>{/if}
      <span class="self-driving-bar-actions">
        <button type="button" id="selfDrivingSwitch" class="self-driving-switch" role="switch" aria-checked={model.enabled} aria-label={switchLabel} title={switchLabel} disabled={model.pending} aria-busy={model.pending || undefined} onclick={model.onToggleEnabled}><span class="self-driving-switch-track"><span class="self-driving-switch-thumb"></span></span><span>{model.enabled ? "On" : "Off"}</span></button>
        {#if model.hasProjection}<button type="button" class="self-driving-bar-toggle" aria-expanded={model.expanded} aria-controls="selfDrivingBarDetails" title={toggleLabel} aria-label={toggleLabel} onclick={model.onToggleDetails}><Icon name={model.expanded ? "chevron-up" : "chevron-down"} className="self-driving-expand-icon" /></button>{/if}
      </span>
    </div>
    {#if model.hasProjection && model.expanded}
      <div class="self-driving-bar-details" id="selfDrivingBarDetails">
        <small>Revision {model.revision} · Desired state: {model.enabled ? "On" : "Off"}{model.preferredProfiles.length ? ` · Preferred: ${model.preferredProfiles.join(" → ")}` : " · Workspace default"}</small>
        {#if model.actualAgent}<p>Actual Agent: {model.actualAgent}{model.actualReason ? ` · ${model.actualReason}` : ""}</p>{/if}
        {#if model.waitingSummary}<p>Waiting context: {model.waitingSummary}</p>{/if}
        {#if model.wakeCondition}<p>Wake condition: {model.wakeCondition}{model.wakeFallback ? " (compatibility fallback)" : ""}</p>{/if}
        {#if model.lastOutcome}<p>Last outcome: {model.lastOutcome.status}{model.lastOutcome.reason ? ` · ${model.lastOutcome.reason}` : ""}</p>{/if}
        {#if model.statusReason}<p>{model.statusReason.label}: {model.statusReason.text}</p>{/if}
      </div>
    {/if}
  </section>
{/if}
