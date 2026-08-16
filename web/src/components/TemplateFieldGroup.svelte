<script lang="ts">
  import "./TemplateFieldGroup.css";

  import type { TemplateField } from "./models";

  let { fields, values, label, onChange }: {
    fields: TemplateField[];
    values: Record<string, string | boolean>;
    label: string;
    onChange: (field: TemplateField, value: string | boolean) => void;
  } = $props();

  function change(field: TemplateField, event: Event): void {
    const target = event.currentTarget as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    onChange(field, field.type === "boolean" && target instanceof HTMLInputElement ? target.checked : target.value);
  }
</script>

<div class="template-fields" aria-label={label} data-component-owner="template-field-group">
  {#each fields as field (field.name)}
    <label class="template-field" class:template-boolean={field.type === "boolean"}>
      {#if field.type === "boolean"}
        <input type="checkbox" checked={values[field.name] === true} onchange={(event) => change(field, event)} />
      {/if}
      <span class="template-field-label">{field.label}{#if field.required}{" "}<small class="template-required">*</small>{/if}{#if field.description}{" "}<small>{field.description}</small>{/if}</span>
      {#if field.type === "textarea"}<textarea required={field.required} placeholder={field.placeholder || ""} value={String(values[field.name] ?? "")} oninput={(event) => change(field, event)}></textarea>{/if}
      {#if field.type === "select"}<select required={field.required} value={String(values[field.name] ?? "")} onchange={(event) => change(field, event)}><option value="">Select...</option>{#each field.options || [] as option}<option value={option}>{option}</option>{/each}</select>{/if}
      {#if field.type === "text"}<input required={field.required} placeholder={field.placeholder || ""} value={String(values[field.name] ?? "")} oninput={(event) => change(field, event)} />{/if}
    </label>
  {/each}
</div>
