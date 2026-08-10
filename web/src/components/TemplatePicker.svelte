<script lang="ts">
  import "./TemplatePicker.css";

  import Icon from "./Icon.svelte";
  import type { TaskTemplate } from "./models";

  let { templates, selectedName, disabled, onSelect }: {
    templates: TaskTemplate[];
    selectedName: string;
    disabled: boolean;
    onSelect: (name: string) => void;
  } = $props();

  function templateLabel(template: TaskTemplate): string {
    return `${template.title || template.name}${template.valid ? "" : " (invalid)"}`;
  }
</script>

<section class="template-picker create-section" aria-label="Template" data-component-owner="template-picker">
  <div class="create-section-title">Choose a template</div>
  <div class="template-cards" role="listbox" aria-label="Templates">
    <button type="button" role="option" aria-selected={selectedName === ""} class="template-card" class:selected={selectedName === ""} {disabled} onclick={() => onSelect("")}>
      <strong>Blank task</strong>
      <small>Start from an empty task and write the detail yourself.</small>
      <span class="template-card-check"><Icon name="check" /></span>
    </button>
    {#each templates as template (template.name)}
      <button type="button" role="option" aria-selected={selectedName === template.name} class="template-card" class:selected={selectedName === template.name} disabled={!template.valid || disabled} onclick={() => onSelect(template.name)}>
        <strong>{templateLabel(template)}</strong>
        {#if template.description}<small>{template.description}</small>{/if}
        <span class="template-card-check"><Icon name="check" /></span>
      </button>
    {/each}
  </div>
</section>
