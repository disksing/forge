<script lang="ts">
  import "./MarkdownDocument.css";

  import { isMarkdownFile } from "./detail";
  import { markdownHTML, markdownResourceNavigation, type ResourceTitleResolver } from "./markdown";
  import type { FilePreviewModel, ResourceFileModel } from "./models";
  import Icon from "./Icon.svelte";
  import LazyMarkdownEditor from "./LazyMarkdownEditor.svelte";

  let { file, workspaceId, editable = false, resolveResourceTitle, onNavigate, onOpenFile, onSave = async (path) => ({ path }), onToast = () => undefined, onIconsChanged = () => undefined }: { file: ResourceFileModel; workspaceId: string; editable?: boolean; resolveResourceTitle: ResourceTitleResolver; onNavigate: (resourceId: string) => void; onOpenFile?: (path: string) => void; onSave?: (path: string, content: string, expectedContentHash: string) => Promise<FilePreviewModel>; onToast?: (message: string) => void; onIconsChanged?: () => void } = $props();
  const markdown = $derived(isMarkdownFile(file.name));
  const rawURL = $derived(`/api/workspaces/${encodeURIComponent(workspaceId)}/files/raw?path=${encodeURIComponent(file.path || file.name)}`);
  let editing = $state(false);
  let currentIdentity = $state("");

  $effect(() => {
    const nextIdentity = `${workspaceId}:${file.path || file.name}`;
    if (currentIdentity && currentIdentity !== nextIdentity) editing = false;
    currentIdentity = nextIdentity;
  });
</script>

<div class="content-section" data-component-owner="markdown-document" data-doc-file={file.name} data-document-identity={`${workspaceId}:${file.path || file.name}:preview:${file.contentHash || "unversioned"}`}>
  {#if markdown && editing}<LazyMarkdownEditor identity={currentIdentity} file={{ ...file, path: file.path || file.name }} onSave={(content, expectedContentHash) => onSave(file.path || file.name, content, expectedContentHash)} onDone={() => editing = false} {onToast} {onIconsChanged} />
  {:else if markdown}<div class="markdown-document-actions">{#if editable}<button type="button" class="secondary-button" onclick={() => editing = true}><Icon name="pencil" /><span>Edit / Annotate</span></button>{/if}<a class="secondary-button markdown-open-file" href={rawURL} target="_blank" rel="noopener" title="Open file in new window" aria-label={`Open ${file.name} in new window`}><Icon name="external-link" /><span>Open</span></a></div><div class="markdown-preview"><div class="markdown-view markdown-rendered" use:markdownResourceNavigation={{ resolveResourceTitle, onNavigate, onOpenFile }}>{@html markdownHTML(file.content || "", { workspaceId, resolveResourceTitle })}</div></div>
  {:else}<pre class="markdown-view">{file.content || ""}</pre>{/if}
</div>
