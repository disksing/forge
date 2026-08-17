<script lang="ts">
  import "./TaskWizard.css";

  import { onDestroy, tick } from "svelte";

  import AgentBindingSelector from "./AgentBindingSelector.svelte";
  import Icon from "./Icon.svelte";
  import TemplateFieldGroup from "./TemplateFieldGroup.svelte";
  import TemplatePicker from "./TemplatePicker.svelte";
  import type { CreateDialogModel, CreateDraft, ResourceAgentBindingModel, TemplateField } from "./models";

  let { draft, model }: { draft: CreateDraft; model: CreateDialogModel } = $props();

  let step = $state(0);
  let previewTimer: ReturnType<typeof setTimeout> | undefined;

  const selectedTemplate = $derived(model.templates.find((item) => item.name === draft.templateName));
  // Templates with a taskTitle pattern generate the title from their fields;
  // the wizard hides the manual title input in that case.
  const hasGeneratedTitle = $derived(Boolean(selectedTemplate?.taskTitle));
  const generatedTitle = $derived(model.preview?.title || "");
  const requiredFields = $derived((selectedTemplate?.fields || []).filter((field) => field.required));
  const optionalFields = $derived((selectedTemplate?.fields || []).filter((field) => !field.required));
  const missingRequired = $derived(requiredFields.filter((field) => field.type !== "boolean" && !String(draft.templateFields[field.name] ?? "").trim()));
  const previewStale = $derived(!model.preview || model.previewKey !== model.previewRequestKey(draft));
  // A freshly opened dialog carries an empty start binding; preselect the
  // binding the new task would resolve to (project task default, else the
  // workspace task default) once the model provides it.
  const bindingInitialized = $derived(Boolean(draft.startBinding.name));
  const bindingDiffers = $derived(Boolean(draft.startBinding.name && model.defaultTaskBinding.name) &&
    (draft.startBinding.kind !== model.defaultTaskBinding.kind ||
      draft.startBinding.name.trim().toLowerCase() !== model.defaultTaskBinding.name.trim().toLowerCase()));

  const stepLabels = $derived(["Template", "Title & slug", selectedTemplate ? "Template fields" : "Details", "Start options"]);
  const lastStep = $derived(stepLabels.length - 1);
  const summaryTitle = $derived(hasGeneratedTitle ? generatedTitle || "(generated on create)" : draft.title.trim() || "—");

  $effect(() => {
    if (!bindingInitialized && model.defaultTaskBinding.name) draft.startBinding = { ...model.defaultTaskBinding };
  });

  onDestroy(() => {
    if (previewTimer) clearTimeout(previewTimer);
  });

  function cloneDraft(): CreateDraft {
    return { ...draft, templateFields: { ...draft.templateFields }, startBinding: { ...draft.startBinding } };
  }

  function initialFieldValue(field: TemplateField): string | boolean {
    if (field.hasDefault) return field.default ?? "";
    return field.type === "boolean" ? false : "";
  }

  function schedulePreview(delay = 450): void {
    if (previewTimer) clearTimeout(previewTimer);
    previewTimer = setTimeout(() => {
      previewTimer = undefined;
      if (draft.templateName && previewStale && !model.submitting) void model.onPreview(cloneDraft());
    }, delay);
  }

  function templateDirty(): boolean {
    if (Boolean(draft.title.trim()) || Boolean(draft.detail.trim())) return true;
    // Untouched template defaults do not count as edits, so picking a
    // template and immediately switching to another one stays silent.
    return (selectedTemplate?.fields || []).some((field) => {
      const initial = initialFieldValue(field);
      return (draft.templateFields[field.name] ?? initial) !== initial;
    });
  }

  async function changeTemplate(next: string): Promise<void> {
    if (model.submitting || next === draft.templateName) return;
    if (templateDirty() && !(await model.onConfirmTemplateSwitch())) return;
    const template = model.templates.find((item) => item.name === next);
    draft.templateName = next;
    draft.templateFields = {};
    for (const field of template?.fields || []) draft.templateFields[field.name] = initialFieldValue(field);
    draft.title = "";
    draft.detail = "";
    schedulePreview(150);
  }

  function setField(field: TemplateField, value: string | boolean): void {
    draft.templateFields[field.name] = value;
    schedulePreview();
  }

  function updateTitle(value: string): void {
    draft.title = value;
    schedulePreview();
  }

  function canProceed(): boolean {
    if (model.submitting) return false;
    if (step === 1 && !hasGeneratedTitle) return Boolean(draft.title.trim());
    if (step === 2) return missingRequired.length === 0;
    if (step === 3 && draft.startAfterCreate) return Boolean(draft.startPrompt.trim());
    return true;
  }

  function back(): void {
    if (model.submitting || step === 0) return;
    step--;
  }

  function next(): void {
    if (!canProceed()) return;
    if (step < lastStep) {
      step++;
    }
  }

  async function create(): Promise<void> {
    if (model.submitting || !canProceed()) return;
    await model.onSubmit(cloneDraft());
  }

  function submitForm(event: SubmitEvent): void {
    event.preventDefault();
    // Enter in a single-line input advances the wizard; on the final step it
    // confirms the dialog.
    if (step < lastStep) next();
    else void create();
  }

  function selectStartMode(startAfterCreate: boolean): void {
    draft.startAfterCreate = startAfterCreate;
  }

  function selectStartBinding(binding: ResourceAgentBindingModel): void {
    draft.startBinding = binding;
  }
</script>

<form class="task-wizard" data-component-owner="task-wizard" aria-label="Create task wizard" onsubmit={submitForm}>
  <ol class="wizard-steps">
    {#each stepLabels as label, index (label)}
      <li class:active={index === step} class:done={index < step} aria-current={index === step ? "step" : undefined}>
        <span class="wizard-step-num">{#if index < step}<Icon name="check" />{:else}{index + 1}{/if}</span>
        <span class="wizard-step-label">{label}</span>
      </li>
    {/each}
  </ol>

  <div class="wizard-body">
    {#if step === 0}
      {#if model.templates.length}
        <TemplatePicker templates={model.templates} selectedName={draft.templateName} disabled={model.submitting} onSelect={changeTemplate} />
      {:else}
        <section class="create-section" aria-label="Template">
          <div class="create-section-title">Choose a template</div>
          <p class="wizard-hint">This project has no templates yet — the task starts blank and you can write the detail in the next steps.</p>
        </section>
      {/if}
    {/if}

    {#if step === 1}
      <section class="create-section create-task-basic" aria-label="Basic information">
        <div class="create-section-title">Basic information</div>
        {#if hasGeneratedTitle}
          <div class="wizard-generated-title" data-generated-title>
            <span class="wizard-generated-title-tag">Generated by template</span>
            <span class="wizard-generated-title-value" class:empty={!generatedTitle}>{generatedTitle || "Filled in from the template fields"}</span>
          </div>
          {#if model.previewError}<p class="wizard-field-error">{model.previewError}</p>{/if}
        {:else}
          <label class="wizard-field">
            <span>Task title <small class="create-required">*</small></span>
            <input name="title" required value={draft.title} placeholder="Task title" oninput={(event) => updateTitle(event.currentTarget.value)} />
          </label>
        {/if}
        <label class="wizard-field create-task-slug-field">
          <span>Slug <small>(optional)</small></span>
          <span class="create-task-slug-wrap">
            <span class="create-task-slug-prefix" aria-hidden="true">#</span>
            <input name="slug" value={draft.slug} placeholder="optional-slug" oninput={(event) => { draft.slug = event.currentTarget.value; schedulePreview(); }} />
          </span>
        </label>
      </section>
    {/if}

    {#if step === 2}
      {#if selectedTemplate}
        <section class="create-section create-template-fields" aria-label="Template fields">
          <div class="create-section-title">{selectedTemplate.title || selectedTemplate.name} fields</div>
          {#if requiredFields.length}<TemplateFieldGroup fields={requiredFields} values={draft.templateFields} label="Required template fields" onChange={setField} />{/if}
          {#if optionalFields.length}<TemplateFieldGroup fields={optionalFields} values={draft.templateFields} label="Optional template fields" onChange={setField} />{/if}
          {#if missingRequired.length}<p class="wizard-field-error" data-missing-required>Missing required: {missingRequired.map((field) => field.label).join(", ")}</p>{/if}
        </section>
      {:else}
        <section class="create-section create-task-details" aria-label="Details">
          <div class="create-section-title">Details</div>
          <textarea name="detail" value={draft.detail} placeholder="Task detail" oninput={(event) => draft.detail = event.currentTarget.value}></textarea>
        </section>
      {/if}
    {/if}

    {#if step === 3}
      <section class="create-section" aria-label="Start options">
        <div class="create-section-title">Start options</div>
        <div class="wizard-start-cards" role="radiogroup" aria-label="Start options">
          <button type="button" role="radio" aria-checked={!draft.startAfterCreate} class="wizard-start-card" class:selected={!draft.startAfterCreate} disabled={model.submitting} onclick={() => selectStartMode(false)}>
            <span class="wizard-start-card-dot"></span>
            <span><strong>Create only</strong><small>Create the task and select it in the tree; start it later yourself.</small></span>
          </button>
          <button type="button" role="radio" aria-checked={draft.startAfterCreate} class="wizard-start-card" class:selected={draft.startAfterCreate} disabled={model.submitting} onclick={() => selectStartMode(true)}>
            <span class="wizard-start-card-dot"></span>
            <span><strong>Create and start</strong><small>Pick an agent, send a prompt, and the task starts running right away.</small></span>
          </button>
        </div>

        {#if draft.startAfterCreate}
          <div class="wizard-start-config">
            <div class="wizard-field">
              <span>Agent</span>
              <AgentBindingSelector value={draft.startBinding} profiles={model.agentProfiles} agents={model.agents} disabled={model.submitting} ariaLabel="Start agent" openUp={false} onSelect={selectStartBinding} />
            </div>
            <label class="wizard-field">
              <span>Prompt <small>(sent as the first message)</small></span>
              <textarea name="startPrompt" value={draft.startPrompt} oninput={(event) => draft.startPrompt = event.currentTarget.value}></textarea>
            </label>
            {#if bindingDiffers}
              <p class="wizard-binding-note" data-binding-note>The selected agent differs from the default — the task's agent binding will be switched before the prompt is sent.</p>
            {/if}
          </div>
        {/if}

        <dl class="wizard-summary" data-summary>
          <div><dt>Template</dt><dd>{selectedTemplate ? selectedTemplate.title || selectedTemplate.name : "Blank task"}</dd></div>
          <div><dt>Title</dt><dd>{summaryTitle}</dd></div>
          <div><dt>Slug</dt><dd>{draft.slug.trim() || "(auto)"}</dd></div>
        </dl>
      </section>
    {/if}
  </div>

  <div class="wizard-footer">
    <span class="wizard-step-pos">Step {step + 1} of {stepLabels.length}</span>
    <span class="wizard-footer-spacer"></span>
    {#if step > 0}<button type="button" class="secondary-button" disabled={model.submitting} onclick={back}>Back</button>{/if}
    <button type="button" class="secondary-button" disabled={model.submitting} onclick={model.onClose}>Cancel</button>
    <button type="submit" class="wizard-primary" disabled={!canProceed()}>{model.submitting ? "Creating..." : step === lastStep ? (draft.startAfterCreate ? "Create & start" : "Create task") : "Next"}</button>
  </div>
</form>
