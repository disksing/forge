<script lang="ts">
  import "./ProjectCreateForm.css";

  import type { CreateDraft } from "./models";

  let { draft }: { draft: CreateDraft } = $props();
</script>

<div class="project-create-form" data-component-owner="project-create-form">
  <textarea name="description" required value={draft.description} placeholder="Describe the project" oninput={(event) => draft.description = event.currentTarget.value}></textarea>
  <input name="slug" value={draft.slug} placeholder="optional-slug" oninput={(event) => draft.slug = event.currentTarget.value} />
</div>
