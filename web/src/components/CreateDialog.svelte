<script lang="ts">
  import "./CreateDialog.css";

  import { onMount } from "svelte";

  import type { ModelChannel } from "./model-channel";
  import Icon from "./Icon.svelte";
  import type { CreateDialogModel, CreateDraft, TaskTemplate, TemplateField } from "./models";

  let { channel }: { channel: ModelChannel<CreateDialogModel> } = $props();
  // svelte-ignore state_referenced_locally
  let model = $state(channel.current());
  // svelte-ignore state_referenced_locally
  let draft = $state(cloneDraft(model.draft));
  let identity = $state("");
  let dialogElement: HTMLElement | undefined = $state();
  let previewTimer: ReturnType<typeof setTimeout> | undefined;

  const isTask = $derived(draft.type === "task");
  const selectedTemplate = $derived(model.templates.find((item) => item.name === draft.templateName));
  const generatedTitle = $derived(model.preview?.title || "");
  const shownTitle = $derived(draft.titleOverride ? draft.title : generatedTitle);
  const requiredFields = $derived((selectedTemplate?.fields || []).filter((field) => field.required));
  const optionalFields = $derived((selectedTemplate?.fields || []).filter((field) => !field.required));
  const previewEdited = $derived(draft.editedMarkdown != null && Boolean(model.preview) && draft.editedMarkdown !== model.preview?.markdown);
  const previewStale = $derived(!model.preview || model.previewKey !== model.previewRequestKey(draft));

  onMount(() => channel.subscribe((next) => {
    const previousPreview = model.preview;
    model = next;
    if (next.identity !== identity) {
      identity = next.identity;
      draft = cloneDraft(next.draft);
    } else if (next.preview && next.preview !== previousPreview && draft.editedMarkdown == null) {
      draft.editedMarkdown = next.preview.markdown;
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
    return () => {
      document.removeEventListener("keydown", keydown);
      if (previewTimer) clearTimeout(previewTimer);
    };
  });

  function cloneDraft(value: CreateDraft): CreateDraft {
    return { ...value, templateFields: { ...value.templateFields } };
  }

  function initialFieldValue(field: TemplateField): string | boolean {
    if (field.hasDefault) return field.default ?? "";
    return field.type === "boolean" ? false : "";
  }

  function schedulePreview(delay = 450): void {
    if (previewTimer) clearTimeout(previewTimer);
    previewTimer = setTimeout(() => {
      previewTimer = undefined;
      if (draft.templateName && previewStale && !model.submitting) void model.onPreview(cloneDraft(draft));
    }, delay);
  }

  async function changeTemplate(next: string): Promise<void> {
    if (model.submitting) return;
    if (next === draft.templateName) return;
    if ((Object.values(draft.templateFields).some((value) => Boolean(value)) || draft.titleOverride || draft.editedMarkdown != null) && !model.onConfirmTemplateSwitch()) return;
    const template = model.templates.find((item) => item.name === next);
    draft.templateName = next;
    draft.templateFields = {};
    for (const field of template?.fields || []) draft.templateFields[field.name] = initialFieldValue(field);
    draft.title = "";
    draft.titleOverride = false;
    draft.editedMarkdown = null;
    schedulePreview(150);
  }

  function setField(field: TemplateField, event: Event): void {
    const target = event.currentTarget as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    draft.templateFields[field.name] = field.type === "boolean" && target instanceof HTMLInputElement ? target.checked : target.value;
    schedulePreview();
  }

  async function submit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    if (!model.submitting) await model.onSubmit(cloneDraft(draft));
  }

  async function refreshPreview(): Promise<void> {
    if (!model.previewing && !model.submitting) await model.onPreview(cloneDraft(draft));
  }

  function updateTitle(event: Event): void {
    draft.title = (event.currentTarget as HTMLInputElement).value;
    if (draft.templateName) draft.titleOverride = true;
    schedulePreview();
  }

  function templateLabel(template: TaskTemplate): string {
    return `${template.title || template.name}${template.valid ? "" : " (invalid)"}`;
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
        {#if isTask}
          <div class="create-task-split">
            <div class="create-task-form-col">
              {#if model.templates.length}
                <section class="create-section" aria-label="Template">
                  <div class="create-section-title">Choose a template</div>
                  <div class="template-cards" role="listbox" aria-label="Templates">
                    <button type="button" role="option" aria-selected={draft.templateName === ""} class="template-card" class:selected={draft.templateName === ""} disabled={model.submitting} onclick={() => changeTemplate("")}>
                      <strong>Blank task</strong>
                      <small>Start from an empty task and write the detail yourself.</small>
                      <span class="template-card-check"><Icon name="check" /></span>
                    </button>
                    {#each model.templates as template (template.name)}
                      <button type="button" role="option" aria-selected={draft.templateName === template.name} class="template-card" class:selected={draft.templateName === template.name} disabled={!template.valid || model.submitting} onclick={() => changeTemplate(template.name)}>
                        <strong>{templateLabel(template)}</strong>
                        {#if template.description}<small>{template.description}</small>{/if}
                        <span class="template-card-check"><Icon name="check" /></span>
                      </button>
                    {/each}
                  </div>
                </section>
              {/if}

              <section class="create-section" aria-label="Basic information">
                <div class="create-section-title">Basic information</div>
                <div class="create-title-slug-row">
                  <label>
                    <span>Task title {#if selectedTemplate?.taskTitle && !draft.titleOverride}<small>(generated by template)</small>{:else}<small class="create-required">*</small>{/if}</span>
                    <span class="template-title-control">
                      <input name="title" required={!selectedTemplate?.taskTitle} value={selectedTemplate?.taskTitle ? shownTitle : draft.title} placeholder={selectedTemplate?.taskTitle ? "Auto-generated from the template fields — type to override" : "Task title"} oninput={updateTitle} />
                      {#if selectedTemplate?.taskTitle && draft.titleOverride}<button type="button" class="secondary compact" onclick={() => { draft.title = ""; draft.titleOverride = false; schedulePreview(); }}>Use generated</button>{/if}
                    </span>
                  </label>
                  <label class="create-task-slug-field">
                    <span>Slug <small>(optional)</small></span>
                    <span class="create-task-slug-wrap">
                      <span class="create-task-slug-prefix" aria-hidden="true">#</span>
                      <input name="slug" bind:value={draft.slug} placeholder="optional-slug" oninput={() => schedulePreview()} />
                    </span>
                  </label>
                </div>
              </section>

              {#if selectedTemplate}
                <section class="create-section" aria-label="Template fields">
                  <div class="create-section-title">Template fields</div>
                  {#each [requiredFields, optionalFields] as fields, group (group)}
                    {#if fields.length}
                      <div class="template-fields" aria-label={group === 0 ? "Required template fields" : "Optional template fields"}>
                        {#each fields as field (field.name)}
                          <label class:template-boolean={field.type === "boolean"}>
                            {#if field.type === "boolean"}
                              <input type="checkbox" checked={draft.templateFields[field.name] === true} onchange={(event) => setField(field, event)} /><span>{field.label}{field.required ? " *" : ""}</span>
                            {:else}<span>{field.label}{field.required ? " *" : ""}</span>{/if}
                            {#if field.type === "textarea"}<textarea required={field.required} placeholder={field.placeholder || ""} value={String(draft.templateFields[field.name] ?? "")} oninput={(event) => setField(field, event)}></textarea>{/if}
                            {#if field.type === "select"}<select required={field.required} value={String(draft.templateFields[field.name] ?? "")} onchange={(event) => setField(field, event)}><option value="">Select...</option>{#each field.options || [] as option}<option value={option}>{option}</option>{/each}</select>{/if}
                            {#if field.type === "text"}<input required={field.required} placeholder={field.placeholder || ""} value={String(draft.templateFields[field.name] ?? "")} oninput={(event) => setField(field, event)} />{/if}
                            {#if field.description}<small>{field.description}</small>{/if}
                          </label>
                        {/each}
                      </div>
                    {/if}
                  {/each}
                </section>
              {:else}
                <section class="create-section" aria-label="Details">
                  <div class="create-section-title">Details</div>
                  <textarea name="detail" bind:value={draft.detail} placeholder="Task detail"></textarea>
                </section>
              {/if}

              <section class="create-section" aria-label="Automation">
                <div class="create-section-title">Automation</div>
                <label class="create-task-automation-toggle"><input name="selfDriving" type="checkbox" bind:checked={draft.selfDriving} onchange={() => schedulePreview()} /><span><strong>Enable Self-Driving</strong><small>Persist the Task-level desired state and let the Scheduler reconcile one autonomous Turn at a time.</small></span></label>
                {#if draft.selfDriving}
                  <div class="create-task-automation-fields">
                    <label><span>Agent <small>(optional)</small></span><select name="agentName" bind:value={draft.agentName} onchange={() => schedulePreview()}><option value="">Workspace default</option>{#each model.agents as agent (agent.id)}<option value={agent.id}>{agent.label} — {agent.summary}</option>{/each}</select></label>
                    <label><span>Run instructions</span><textarea name="prompt" bind:value={draft.prompt} placeholder="Instructions for the automated run" oninput={() => schedulePreview()}></textarea></label>
                    <label><span>Preferred Agent Profiles</span><input name="agentProfiles" bind:value={draft.agentProfiles} placeholder="Workspace default, or kimi, codex" oninput={() => schedulePreview()} /><small>{model.profileKeys.length ? `Available: ${model.profileKeys.join(", ")}` : "No Profiles configured; the workspace default will be used."}</small></label>
                    <label><span>Completion criteria</span><textarea name="completionCriteria" bind:value={draft.completionCriteria} placeholder="Natural-language completion criteria" oninput={() => schedulePreview()}></textarea></label>
                  </div>
                {/if}
              </section>
            </div>

            <aside class="create-task-preview-col" aria-label="Task preview">
              <div class="create-section-title create-preview-title">
                <span>Task preview</span>
                {#if selectedTemplate}<button type="button" class="secondary compact" disabled={model.previewing || model.submitting} onclick={refreshPreview}>{model.previewing ? "Rendering..." : "Refresh"}</button>{/if}
              </div>
              {#if selectedTemplate}
                {#if model.previewError}<p class="create-task-preview-error" role="alert">{model.previewError}</p>{/if}
                {#if !model.previewError && previewStale && model.preview}<p class="create-task-preview-hint">Updating preview...</p>{/if}
                {#if model.preview}
                  <section class="template-preview" aria-label="Rendered task content">
                    <h4>{model.preview.title}</h4>
                    <textarea name="previewMarkdown" class="create-task-preview-editor" aria-label="Task markdown" spellcheck="false" bind:value={draft.editedMarkdown}></textarea>
                    {#if previewEdited}
                      <div class="template-preview-actions" data-preview-edited-note>
                        <small>Modified — the task will be created with this edited content instead of the template output.</small>
                        <button type="button" class="secondary compact" onclick={() => draft.editedMarkdown = model.preview?.markdown ?? null}>Reset edits</button>
                      </div>
                    {:else}<small data-preview-edit-hint>Edit the content above to override the template output for this task.</small>{/if}
                    {#if model.preview.slug}<small>Slug: {model.preview.slug}</small>{/if}
                    <small>Self-Driving: {model.preview.selfDriving ? `on with ${model.preview.selfDriving.agentName || "workspace default"}` : "off"}</small>
                    {#if model.templateDigest}<small>Template {draft.templateName} · {model.templateDigest}</small>{/if}
                  </section>
                {:else if model.previewing}<p class="create-task-preview-hint">Rendering preview...</p>
                {:else if !model.previewError}<p class="create-task-preview-hint">Fill in the template fields and the preview renders automatically.</p>{/if}
              {:else}
                <section class="template-preview create-task-blank-preview" aria-label="Task content preview">
                  <h4>{draft.title.trim() || "Untitled task"}</h4>
                  {#if draft.detail.trim()}<p class="create-task-blank-detail">{draft.detail}</p>
                  {:else}<p class="create-task-preview-hint">Write the task detail and the preview updates as you type.</p>{/if}
                  {#if draft.slug.trim()}<small>Slug: {draft.slug.trim()}</small>{/if}
                  <small>Self-Driving: {draft.selfDriving ? `on with ${draft.agentName || "workspace default"}` : "off"}</small>
                </section>
              {/if}
            </aside>
          </div>
        {:else}
          <textarea name="description" required bind:value={draft.description} placeholder="Describe the project"></textarea>
          <input name="slug" bind:value={draft.slug} placeholder="optional-slug" />
        {/if}
        <div class="form-actions">
          <button type="submit" disabled={model.submitting}>{model.submitting ? "Creating..." : "Create"}</button>
          <button type="button" class="secondary" disabled={model.submitting} onclick={model.onClose}>Cancel</button>
        </div>
      </form>
    </div>
  </div>
{/if}
