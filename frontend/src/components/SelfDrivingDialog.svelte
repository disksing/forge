<script lang="ts">
  import { onMount } from "svelte";

  import type { ModelChannel } from "./model-channel";
  import Icon from "./Icon.svelte";
  import type { SelfDrivingDialogModel, SelfDrivingDraft } from "./models";

  let { channel }: { channel: ModelChannel<SelfDrivingDialogModel> } = $props();
  // svelte-ignore state_referenced_locally
  let model = $state(channel.current());
  // svelte-ignore state_referenced_locally
  let draft = $state<SelfDrivingDraft>({ ...model.draft });
  let identity = $state("");
  let localError = $state("");
  let dialogElement: HTMLElement | undefined = $state();

  const disabled = $derived(model.submitting || model.unknown || (!model.reuseCurrentSession && (!draft.agentName || model.agents.length === 0)));

  onMount(() => channel.subscribe((next) => {
    model = next;
    if (next.identity !== identity) {
      identity = next.identity;
      draft = { ...next.draft };
      localError = "";
    }
    queueMicrotask(next.onIconsChanged);
  }));

  onMount(() => {
    const keydown = (event: KeyboardEvent) => {
      if (!model.open) return;
      if (event.key === "Escape" && !model.submitting) {
        event.preventDefault();
        model.onClose();
        return;
      }
      if (event.key !== "Tab" || !dialogElement) return;
      const focusable = [...dialogElement.querySelectorAll<HTMLElement>("button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled])")];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", keydown);
    return () => document.removeEventListener("keydown", keydown);
  });

  async function submit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    if (disabled) return;
    if (!model.reuseCurrentSession && !draft.agentName) {
      localError = "Select an Agent before enabling Self-Driving.";
      return;
    }
    localError = "";
    await model.onSubmit({ ...draft });
  }
</script>

{#if model.open}
  <div class="self-driving-dialog-layer" role="presentation">
    <button class="self-driving-dialog-backdrop modal-enter" type="button" aria-label="Close" onclick={model.onClose}></button>
    <div bind:this={dialogElement} class="self-driving-dialog modal-enter" role="dialog" aria-modal="true" aria-labelledby="selfDrivingDialogTitle">
      <header class="self-driving-dialog-header">
        <strong id="selfDrivingDialogTitle">Configure Self-Driving</strong>
        <button class="icon-button" type="button" title="Close" aria-label="Close" disabled={model.submitting} onclick={model.onClose}><Icon name="x" /></button>
      </header>
      <form id="selfDrivingConfigForm" class="details-form self-driving-dialog-form" onsubmit={submit}>
        <label>
          <span>Agent</span>
          {#if model.reuseCurrentSession}
            <input name="agentName" bind:value={draft.agentName} readonly aria-readonly="true" />
          {:else}
            <select name="agentName" bind:value={draft.agentName} required disabled={model.agents.length === 0 || model.submitting} oninput={() => localError = ""}>
              <option value="">Select an Agent</option>
              {#each model.agents as agent (agent.id)}<option value={agent.id}>{agent.label} — {agent.summary}</option>{/each}
            </select>
          {/if}
        </label>
        <label>
          <span>Run instructions <small>(optional)</small></span>
          <textarea name="runInstructions" rows="4" placeholder="Additional Self-Driving instructions" disabled={model.submitting} bind:value={draft.runInstructions} oninput={() => localError = ""}></textarea>
        </label>
        {#if localError || model.error}<p class="self-driving-dialog-error" role="alert">{localError || model.error}</p>{/if}
        {#if model.unknown}<p class="self-driving-dialog-error" role="alert">The result may be unknown. Refresh the task and session state before trying again.</p>{/if}
        <div class="form-actions">
          <button type="submit" disabled={disabled} aria-busy={model.submitting}>{model.submitting ? "Enabling…" : "Save and Enable"}</button>
          <button type="button" class="secondary" disabled={model.submitting} onclick={model.onClose}>Cancel</button>
        </div>
      </form>
    </div>
  </div>
{/if}
