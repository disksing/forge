<script lang="ts">
  import "./TaskPreview.css";

  import type { CreateDraft, TaskPreview as TaskPreviewModel, TaskTemplate } from "./models";

  let { draft, selectedTemplate, preview, previewing, previewError, stale, templateDigest, submitting, onRefresh }: {
    draft: CreateDraft;
    selectedTemplate: TaskTemplate | undefined;
    preview: TaskPreviewModel | null;
    previewing: boolean;
    previewError: string;
    stale: boolean;
    templateDigest: string;
    submitting: boolean;
    onRefresh: () => void;
  } = $props();
  // svelte-ignore state_referenced_locally
  let editorValue = $state(draft.editedMarkdown ?? "");
  let renderedMarkdown: string | null = null;

  const previewEdited = $derived(Boolean(preview) && editorValue !== preview?.markdown);

  $effect(() => {
    const next = preview?.markdown ?? null;
    if (next === renderedMarkdown) return;
    const followsRenderedPreview = draft.editedMarkdown == null || draft.editedMarkdown === renderedMarkdown;
    renderedMarkdown = next;
    if (followsRenderedPreview) {
      editorValue = next ?? "";
      draft.editedMarkdown = next;
    }
  });

  function updateEditor(value: string): void {
    editorValue = value;
    draft.editedMarkdown = value;
  }

  function resetEditor(): void {
    editorValue = preview?.markdown ?? "";
    draft.editedMarkdown = preview?.markdown ?? null;
  }
</script>

<aside class="create-task-preview-col" aria-label="Task preview" data-component-owner="task-preview">
  <div class="create-section-title create-preview-title">
    <span>Task preview</span>
    {#if selectedTemplate}<button type="button" class="secondary compact" disabled={previewing || submitting} onclick={onRefresh}>{previewing ? "Rendering..." : "Refresh"}</button>{/if}
  </div>
  {#if selectedTemplate}
    {#if previewError}<p class="create-task-preview-error" role="alert">{previewError}</p>{/if}
    {#if !previewError && stale && preview}<p class="create-task-preview-hint">Updating preview...</p>{/if}
    {#if preview}
      <section class="template-preview" aria-label="Rendered task content">
        <h4>{preview.title}</h4>
        <textarea name="previewMarkdown" class="create-task-preview-editor" aria-label="Task markdown" spellcheck="false" value={editorValue} oninput={(event) => updateEditor(event.currentTarget.value)}></textarea>
        {#if previewEdited}
          <div class="template-preview-actions" data-preview-edited-note>
            <small>Modified — the task will be created with this edited content instead of the template output.</small>
            <button type="button" class="secondary compact" onclick={resetEditor}>Reset edits</button>
          </div>
        {:else}<small data-preview-edit-hint>Edit the content above to override the template output for this task.</small>{/if}
        {#if preview.slug}<small>Slug: {preview.slug}</small>{/if}
        <small>Self-Driving: {preview.selfDriving ? `on with ${preview.selfDriving.agentName || "workspace default"}` : "off"}</small>
        {#if templateDigest}<small>Template {draft.templateName} · {templateDigest}</small>{/if}
      </section>
    {:else if previewing}<p class="create-task-preview-hint">Rendering preview...</p>
    {:else if !previewError}<p class="create-task-preview-hint">Fill in the template fields and the preview renders automatically.</p>{/if}
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
