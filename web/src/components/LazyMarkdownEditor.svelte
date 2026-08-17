<script lang="ts">
  import type { FilePreviewModel } from "./models";

  const editorModule = import("./MarkdownEditor.svelte");
  let { identity, file, mode, onSave, onToast }: {
    identity: string;
    file: FilePreviewModel;
    mode: "edit" | "annotate";
    onSave: (content: string, expectedContentHash: string) => Promise<FilePreviewModel>;
    onToast: (message: string) => void;
  } = $props();
</script>

{#await editorModule}
  <div class="file-modal-empty"><strong>Loading Markdown editor…</strong></div>
{:then module}
  <module.default {identity} {file} {mode} {onSave} {onToast} />
{:catch reason}
  <div class="file-modal-empty error-preview"><strong>Markdown editor unavailable</strong><span>{reason instanceof Error ? reason.message : String(reason)}</span></div>
{/await}
