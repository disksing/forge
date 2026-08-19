<script lang="ts">
  import "./ProjectCreateForm.css";

  import { isValidResourceSlug, type CreateDraft } from "./models";

  let { draft }: { draft: CreateDraft } = $props();

  const descriptionMissing = $derived(!draft.description.trim());
  const slugInvalid = $derived(Boolean(draft.slug.trim()) && !isValidResourceSlug(draft.slug));
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
  <input
    name="slug"
    value={draft.slug}
    placeholder="optional-slug"
    aria-invalid={slugInvalid}
    aria-describedby={slugInvalid ? "project-slug-error" : undefined}
    oninput={(event) => draft.slug = event.currentTarget.value}
  />
  {#if slugInvalid}<p id="project-slug-error" class="project-field-error" role="alert">Project slug must use only letters, numbers, dot, underscore, or hyphen, and start with a letter or number.</p>{/if}
</div>
