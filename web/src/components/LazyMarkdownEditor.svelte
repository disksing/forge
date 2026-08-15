<script lang="ts">
  import type { FilePreviewModel } from "./models";

  const editorModule = import("./MarkdownEditor.svelte");
  let { identity, file, onSave, onDone, onToast, onIconsChanged }: {
    identity: string;
    file: FilePreviewModel;
    onSave: (content: string, expectedContentHash: string) => Promise<FilePreviewModel>;
    onDone: () => void;
    onToast: (message: string) => void;
    onIconsChanged: () => void;
  } = $props();
</script>

{#await editorModule}
  <div class="file-modal-empty"><strong>Loading Markdown editor…</strong></div>
{:then module}
  <module.default {identity} {file} {onSave} {onDone} {onToast} {onIconsChanged} />
{:catch reason}
  <div class="file-modal-empty error-preview"><strong>Markdown editor unavailable</strong><span>{reason instanceof Error ? reason.message : String(reason)}</span></div>
{/await}
