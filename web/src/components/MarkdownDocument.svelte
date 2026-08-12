<script lang="ts">
  import "./MarkdownDocument.css";

  import { isMarkdownFile, markdownHTML } from "./detail";
  import type { ResourceFileModel } from "./models";

  let { file, workspaceId }: { file: ResourceFileModel; workspaceId: string } = $props();
  const markdown = $derived(isMarkdownFile(file.name));
</script>

<div class="content-section" data-component-owner="markdown-document" data-doc-file={file.name} data-document-identity={`${workspaceId}:${file.path || file.name}:preview:${file.contentHash || "unversioned"}`}>
  {#if markdown}<div class="markdown-preview"><div class="markdown-view markdown-rendered">{@html markdownHTML(file.content || "")}</div></div>
  {:else}<pre class="markdown-view">{file.content || ""}</pre>{/if}
</div>
