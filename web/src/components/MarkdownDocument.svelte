<script lang="ts">
  import "./MarkdownDocument.css";

  import { isMarkdownFile } from "./detail";
  import { markdownHTML, markdownResourceNavigation, type ResourceTitleResolver } from "./markdown";
  import type { FilePreviewModel, ResourceFileModel } from "./models";
  import Icon from "./Icon.svelte";
  import LazyMarkdownEditor from "./LazyMarkdownEditor.svelte";

  let { file, workspaceId, editable = false, resolveResourceTitle, onNavigate, onOpenFile, onSave = async (path) => ({ path }), onToast = () => undefined, onIconsChanged = () => undefined }: { file: ResourceFileModel; workspaceId: string; editable?: boolean; resolveResourceTitle: ResourceTitleResolver; onNavigate: (resourceId: string) => void; onOpenFile?: (path: string) => void; onSave?: (path: string, content: string, expectedContentHash: string) => Promise<FilePreviewModel>; onToast?: (message: string) => void; onIconsChanged?: () => void } = $props();
  const markdown = $derived(isMarkdownFile(file.name));
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
  {:else if markdown}<div class="markdown-document-actions">{#if editable}<button type="button" class="secondary-button" onclick={() => editing = true}><Icon name="pencil" /><span>Edit / Annotate</span></button>{/if}</div><div class="markdown-preview"><div class="markdown-view markdown-rendered" use:markdownResourceNavigation={{ resolveResourceTitle, onNavigate, onOpenFile }}>{@html markdownHTML(file.content || "", { workspaceId, resolveResourceTitle })}</div></div>
  {:else}<pre class="markdown-view">{file.content || ""}</pre>{/if}
</div>
