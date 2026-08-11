<script lang="ts">
  import "./CreateDialog.css";

  import { onMount } from "svelte";

  import type { ModelChannel } from "./model-channel";
  import Icon from "./Icon.svelte";
  import ProjectCreateForm from "./ProjectCreateForm.svelte";
  import TaskCreateForm from "./TaskCreateForm.svelte";
  import type { CreateDialogModel, CreateDraft } from "./models";

  let { channel }: { channel: ModelChannel<CreateDialogModel> } = $props();
  // svelte-ignore state_referenced_locally
  let model = $state(channel.current());
  // svelte-ignore state_referenced_locally
  let draft = $state(cloneDraft(model.draft));
  let identity = $state("");
  let dialogElement: HTMLElement | undefined = $state();

  const isTask = $derived(draft.type === "task");

  onMount(() => channel.subscribe((next) => {
    model = next;
    if (next.identity !== identity) {
      identity = next.identity;
      draft = cloneDraft(next.draft);
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

  function cloneDraft(value: CreateDraft): CreateDraft {
    return { ...value, templateFields: { ...value.templateFields } };
  }

  async function submit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    if (!model.submitting) await model.onSubmit(cloneDraft(draft));
  }
</script>

{#if model.open}
  <div class="create-dialog-layer" role="presentation">
    <button class="create-dialog-backdrop modal-enter" type="button" aria-label="Close" onclick={model.onClose}></button>
    <div bind:this={dialogElement} class:create-task-dialog={isTask} class="create-dialog modal-enter" role="dialog" aria-modal="true" aria-label={isTask ? "Create task" : "Create project"}>
      <header class="create-dialog-header">
        <div>
          <strong>{isTask ? "Create task" : "Create project"}</strong>
          {#if isTask}<span>{draft.projectId}</span>{/if}
        </div>
        <button class="icon-button" type="button" title="Close" aria-label="Close" disabled={model.submitting} onclick={model.onClose}><Icon name="x" /></button>
      </header>
      <form id="createDialogForm" class="details-form create-dialog-form" onsubmit={submit}>
        {#key model.identity}
          {#if isTask}<TaskCreateForm {draft} {model} />
          {:else}<ProjectCreateForm {draft} />{/if}
        {/key}
        <div class="form-actions">
          <button type="submit" disabled={model.submitting}>{model.submitting ? "Creating..." : "Create"}</button>
          <button type="button" class="secondary" disabled={model.submitting} onclick={model.onClose}>Cancel</button>
        </div>
      </form>
    </div>
  </div>
{/if}
