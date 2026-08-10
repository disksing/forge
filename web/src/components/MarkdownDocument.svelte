<script lang="ts">
  import "./MarkdownDocument.css";

  import Icon from "./Icon.svelte";
  import { isMarkdownFile, markdownHTML } from "./detail";
  import type { ResourceFileModel } from "./models";

  let { file, workspaceId }: { file: ResourceFileModel; workspaceId: string } = $props();
  const markdown = $derived(isMarkdownFile(file.name));
  const rawURL = $derived(`/api/workspaces/${encodeURIComponent(workspaceId)}/files/raw?path=${encodeURIComponent(file.path || "")}`);
</script>

<div class="content-section" data-component-owner="markdown-document" data-doc-file={file.name} data-document-identity={`${workspaceId}:${file.path || file.name}:preview:${file.contentHash || "unversioned"}`}>
  <h3>
    <Icon name="file-text" /><span>{file.name}</span>
    {#if markdown && file.path}<a class="markdown-open-file" href={rawURL} target="_blank" rel="noopener" title="Open file in new window" aria-label={`Open ${file.name} in new window`}><Icon name="external-link" /><span>Open</span></a>{/if}
  </h3>
  {#if markdown}<div class="markdown-preview"><div class="markdown-view markdown-rendered">{@html markdownHTML(file.content || "")}</div></div>
  {:else}<pre class="markdown-view">{file.content || ""}</pre>{/if}
</div>
