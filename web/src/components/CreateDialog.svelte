<script lang="ts">
  import "./CreateDialog.css";

  import { onMount, tick } from "svelte";

  import type { ModelChannel } from "./model-channel";
  import Icon from "./Icon.svelte";
  import type { CreateDialogModel, CreateDraft, TaskTemplate, TemplateField } from "./models";

  let { channel }: { channel: ModelChannel<CreateDialogModel> } = $props();
  // svelte-ignore state_referenced_locally
  let model = $state(channel.current());
  // svelte-ignore state_referenced_locally
  let draft = $state(cloneDraft(model.draft));
  let identity = $state("");
  let switchingTemplate = $state(false);

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
      if (model.open && event.key === "Escape" && !model.submitting) {
        event.preventDefault();
        model.onClose();
      }
    };
    document.addEventListener("keydown", keydown);
    return () => document.removeEventListener("keydown", keydown);
  });

  function cloneDraft(value: CreateDraft): CreateDraft {
    return { ...value, templateFields: { ...value.templateFields } };
  }

  function initialFieldValue(field: TemplateField): string | boolean {
    if (field.hasDefault) return field.default ?? "";
    return field.type === "boolean" ? false : "";
  }

  async function changeTemplate(event: Event): Promise<void> {
    if (switchingTemplate) return;
    const next = (event.currentTarget as HTMLSelectElement).value;
    if (next === draft.templateName) return;
    if ((Object.values(draft.templateFields).some((value) => Boolean(value)) || draft.titleOverride || draft.editedMarkdown != null) && !model.onConfirmTemplateSwitch()) {
      switchingTemplate = true;
      await tick();
      switchingTemplate = false;
      return;
    }
    const template = model.templates.find((item) => item.name === next);
    draft.templateName = next;
    draft.templateFields = {};
    for (const field of template?.fields || []) draft.templateFields[field.name] = initialFieldValue(field);
    draft.title = "";
    draft.titleOverride = false;
    draft.activeTab = "edit";
    draft.editedMarkdown = null;
    draft.showOptions = false;
  }

  function setField(field: TemplateField, event: Event): void {
    const target = event.currentTarget as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    draft.templateFields[field.name] = field.type === "boolean" && target instanceof HTMLInputElement ? target.checked : target.value;
  }

  async function selectTab(tab: "edit" | "preview"): Promise<void> {
    draft.activeTab = tab;
    if (tab === "preview" && draft.templateName && previewStale) await model.onPreview(cloneDraft(draft));
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
  }

  function templateLabel(template: TaskTemplate): string {
    return `${template.title || template.name}${template.valid ? "" : " (invalid)"}`;
  }
</script>

{#if model.open}
  <div class="create-dialog-layer" role="presentation">
    <button class="create-dialog-backdrop modal-enter" type="button" aria-label="Close" onclick={model.onClose}></button>
    <div class:create-task-dialog={isTask} class="create-dialog modal-enter" role="dialog" aria-modal="true" aria-label={isTask ? "Create task" : "Create project"}>
      <header class="create-dialog-header">
        <div>
          <strong>{isTask ? "Create task" : "Create project"}</strong>
          {#if isTask}<span>{draft.projectId}</span>{/if}
        </div>
        <button class="icon-button" type="button" title="Close" aria-label="Close" disabled={model.submitting} onclick={model.onClose}><Icon name="x" /></button>
      </header>
      <form id="createDialogForm" class="details-form create-dialog-form" onsubmit={submit}>
        {#if isTask}
          <div class="create-task-dialog-body">
            {#if model.templates.length}
              <label>
                <span>Template</span>
                <select name="templateName" value={draft.templateName} onchange={changeTemplate}>
                  <option value="">Blank task</option>
                  {#each model.templates as template (template.name)}
                    <option value={template.name} disabled={!template.valid}>{templateLabel(template)}</option>
                  {/each}
                </select>
              </label>
            {/if}
            {#if selectedTemplate?.description}<p class="template-description">{selectedTemplate.description}</p>{/if}
            {#if selectedTemplate}
              <div class="create-dialog-tabs" role="tablist" aria-label="Task content">
                <button type="button" role="tab" class:active={draft.activeTab === "edit"} class="create-dialog-tab" aria-selected={draft.activeTab === "edit"} onclick={() => selectTab("edit")}>Edit</button>
                <button type="button" role="tab" class:active={draft.activeTab === "preview"} class="create-dialog-tab" aria-selected={draft.activeTab === "preview"} onclick={() => selectTab("preview")}>Preview</button>
              </div>
            {/if}

            {#if selectedTemplate && draft.activeTab === "preview"}
              <div class="create-task-preview-pane" role="tabpanel" aria-label="Task preview">
                <div class="template-preview-actions">
                  <button type="button" class="secondary compact" disabled={model.previewing || model.submitting} onclick={refreshPreview}>{model.previewing ? "Rendering..." : "Refresh"}</button>
                  {#if model.templateDigest}<small>Template {draft.templateName} · {model.templateDigest}</small>{/if}
                </div>
                {#if model.previewError}<p class="create-task-preview-error" role="alert">{model.previewError}</p>{/if}
                {#if !model.previewError && previewStale && model.preview}<p class="create-task-preview-hint">Fields changed since this preview was rendered. Refresh to update.</p>{/if}
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
                  </section>
                {:else if model.previewing}<p class="create-task-preview-hint">Rendering preview...</p>{/if}
              </div>
            {:else}
              <div class="create-title-slug-row">
                <label>
                  <span>Task title {#if selectedTemplate?.taskTitle && !draft.titleOverride}<small>(generated by template)</small>{/if}</span>
                  <span class="template-title-control">
                    <input name="title" required={!selectedTemplate?.taskTitle} value={selectedTemplate?.taskTitle ? shownTitle : draft.title} placeholder={selectedTemplate?.taskTitle ? "Auto-generated from the template fields — type to override" : "Task title"} oninput={updateTitle} />
                    {#if selectedTemplate?.taskTitle && draft.titleOverride}<button type="button" class="secondary compact" onclick={() => { draft.title = ""; draft.titleOverride = false; }}>Use generated</button>{/if}
                  </span>
                </label>
                <label class="create-task-slug-field"><span>Slug <small>(optional)</small></span><input name="slug" bind:value={draft.slug} placeholder="optional-slug" /></label>
              </div>
              {#if selectedTemplate}
                {#if requiredFields.length}
                  <div class="template-fields" aria-label="Required template fields">
                    {#each requiredFields as field (field.name)}
                      <label class:template-boolean={field.type === "boolean"}>
                        {#if field.type === "boolean"}
                          <input type="checkbox" checked={draft.templateFields[field.name] === true} onchange={(event) => setField(field, event)} /><span>{field.label}</span>
                        {:else}<span>{field.label}{field.required ? " *" : ""}</span>{/if}
                        {#if field.type === "textarea"}<textarea required={field.required} placeholder={field.placeholder || ""} value={String(draft.templateFields[field.name] ?? "")} oninput={(event) => setField(field, event)}></textarea>{/if}
                        {#if field.type === "select"}<select required={field.required} value={String(draft.templateFields[field.name] ?? "")} onchange={(event) => setField(field, event)}><option value="">Select...</option>{#each field.options || [] as option}<option value={option}>{option}</option>{/each}</select>{/if}
                        {#if field.type === "text"}<input required={field.required} placeholder={field.placeholder || ""} value={String(draft.templateFields[field.name] ?? "")} oninput={(event) => setField(field, event)} />{/if}
                        {#if field.description}<small>{field.description}</small>{/if}
                      </label>
                    {/each}
                  </div>
                {/if}
              {:else}<textarea name="detail" bind:value={draft.detail} placeholder="Task detail"></textarea>{/if}

              <details class="create-task-more-options" bind:open={draft.showOptions}>
                <summary>More options{draft.selfDriving ? " · Self-Driving on" : ""}</summary>
                <div class="create-task-more-options-body">
                  {#if optionalFields.length}
                    <div class="template-fields" aria-label="Optional template fields">
                      {#each optionalFields as field (field.name)}
                        <label class:template-boolean={field.type === "boolean"}>
                          {#if field.type === "boolean"}<input type="checkbox" checked={draft.templateFields[field.name] === true} onchange={(event) => setField(field, event)} /><span>{field.label}</span>{:else}<span>{field.label}</span>{/if}
                          {#if field.type === "textarea"}<textarea placeholder={field.placeholder || ""} value={String(draft.templateFields[field.name] ?? "")} oninput={(event) => setField(field, event)}></textarea>{/if}
                          {#if field.type === "select"}<select value={String(draft.templateFields[field.name] ?? "")} onchange={(event) => setField(field, event)}><option value="">Select...</option>{#each field.options || [] as option}<option value={option}>{option}</option>{/each}</select>{/if}
                          {#if field.type === "text"}<input placeholder={field.placeholder || ""} value={String(draft.templateFields[field.name] ?? "")} oninput={(event) => setField(field, event)} />{/if}
                          {#if field.description}<small>{field.description}</small>{/if}
                        </label>
                      {/each}
                    </div>
                  {/if}
                  <label class="create-task-automation-toggle"><input name="selfDriving" type="checkbox" bind:checked={draft.selfDriving} /><span><strong>Enable Self-Driving</strong><small>Persist the Task-level desired state and let the Scheduler reconcile one autonomous Turn at a time.</small></span></label>
                  {#if draft.selfDriving}
                    <div class="create-task-automation-fields">
                      <label><span>Agent <small>(optional)</small></span><select name="agentName" bind:value={draft.agentName}><option value="">Workspace default</option>{#each model.agents as agent (agent.id)}<option value={agent.id}>{agent.label} — {agent.summary}</option>{/each}</select></label>
                      <label><span>Run instructions</span><textarea name="prompt" bind:value={draft.prompt} placeholder="Instructions for the automated run"></textarea></label>
                      <label><span>Preferred Agent Profiles</span><input name="agentProfiles" bind:value={draft.agentProfiles} placeholder="Workspace default, or kimi, codex" /><small>{model.profileKeys.length ? `Available: ${model.profileKeys.join(", ")}` : "No Profiles configured; the workspace default will be used."}</small></label>
                      <label><span>Completion criteria</span><textarea name="completionCriteria" bind:value={draft.completionCriteria} placeholder="Natural-language completion criteria"></textarea></label>
                    </div>
                  {/if}
                </div>
              </details>
            {/if}
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
