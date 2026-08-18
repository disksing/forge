<script lang="ts">
  import "./ProjectCreateForm.css";

  import type { CreateDraft } from "./models";

  let { draft }: { draft: CreateDraft } = $props();

  const descriptionMissing = $derived(!draft.description.trim());
</script>

<div class="project-create-form" data-component-owner="project-create-form">
  <textarea
    name="description"
    required
    aria-invalid={descriptionMissing}
    aria-describedby={descriptionMissing ? "project-description-error" : undefined}
    value={draft.description}
    placeholder="Describe the project"
    oninput={(event) => draft.description = event.currentTarget.value}
  ></textarea>
  {#if descriptionMissing}<p id="project-description-error" class="project-field-error" role="alert">Project description is required.</p>{/if}
  <input name="slug" value={draft.slug} placeholder="optional-slug" oninput={(event) => draft.slug = event.currentTarget.value} />
</div>
