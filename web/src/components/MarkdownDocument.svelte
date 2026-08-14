<script lang="ts">
  import "./MarkdownDocument.css";

  import { isMarkdownFile } from "./detail";
  import { markdownHTML, markdownResourceNavigation, type ResourceTitleResolver } from "./markdown";
  import type { ResourceFileModel } from "./models";

  let { file, workspaceId, resolveResourceTitle, onNavigate }: { file: ResourceFileModel; workspaceId: string; resolveResourceTitle: ResourceTitleResolver; onNavigate: (resourceId: string) => void } = $props();
  const markdown = $derived(isMarkdownFile(file.name));
</script>

<div class="content-section" data-component-owner="markdown-document" data-doc-file={file.name} data-document-identity={`${workspaceId}:${file.path || file.name}:preview:${file.contentHash || "unversioned"}`}>
  {#if markdown}<div class="markdown-preview"><div class="markdown-view markdown-rendered" use:markdownResourceNavigation={{ resolveResourceTitle, onNavigate }}>{@html markdownHTML(file.content || "", { workspaceId, resolveResourceTitle })}</div></div>
  {:else}<pre class="markdown-view">{file.content || ""}</pre>{/if}
</div>
