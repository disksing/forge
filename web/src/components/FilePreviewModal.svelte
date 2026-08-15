<script lang="ts">
  import "./FilePreviewModal.css";

  import { onDestroy } from "svelte";

  import type { ApiClient } from "../api/client";
  import Icon from "./Icon.svelte";
  import { formatBytes, isMarkdownFile } from "./detail";
  import { markdownHTML, markdownResourceNavigation, type ResourceTitleResolver } from "./markdown";
  import type { FilePreviewModel } from "./models";
  import LazyMarkdownEditor from "./LazyMarkdownEditor.svelte";

  let { client, workspaceId, resourceId, selection, editable, resolveResourceTitle, onNavigate, onOpenFile, onSaveMarkdown, onClose, onError, onIconsChanged }: { client: ApiClient; workspaceId: string; resourceId: string; selection: { section: string; path: string; mode?: "edit" | "annotate" } | null; editable: boolean; resolveResourceTitle: ResourceTitleResolver; onNavigate: (resourceId: string) => void; onOpenFile?: (path: string) => void; onSaveMarkdown: (path: string, content: string, expectedContentHash: string) => Promise<FilePreviewModel>; onClose: () => void; onError: (message: string) => void; onIconsChanged: () => void } = $props();
  let preview = $state<FilePreviewModel | null>(null);
  let loading = $state(false);
  let error = $state("");
  let mode = $state<"preview" | "edit" | "annotate">("preview");
  const scope = $derived(`detail-preview:${workspaceId}:${resourceId}`);
  const selectionKey = $derived(selection ? `${workspaceId}:${resourceId}:${selection.section}:${selection.path}` : "");
  const rawURL = $derived(selection ? `/api/workspaces/${encodeURIComponent(workspaceId)}/files/raw?path=${encodeURIComponent(selection.path)}` : "");
  const downloadURL = $derived(selection ? `/api/workspaces/${encodeURIComponent(workspaceId)}/files/raw?path=${encodeURIComponent(selection.path)}&download=1` : "");
  let activeSelectionKey = "";

  $effect(() => {
    const current = selection;
    const requestScope = scope;
    const currentSelectionKey = selectionKey;
    if (currentSelectionKey === activeSelectionKey) return;
    activeSelectionKey = currentSelectionKey;
    preview = null;
    error = "";
    mode = editable && current?.mode === "annotate" ? "annotate" : editable && current?.mode === "edit" ? "edit" : "preview";
    if (!current) { client.requests.abort(requestScope); return; }
    loading = true;
    void client.latest<FilePreviewModel>(`/api/workspaces/${encodeURIComponent(workspaceId)}/files?path=${encodeURIComponent(current.path)}`, { scope: requestScope })
      .then((value) => { if (selection?.section === current.section && selection.path === current.path) preview = value; })
      .catch((reason) => {
        if (selection?.section !== current.section || selection.path !== current.path || reason?.name === "StaleResponseError") return;
        error = reason instanceof Error ? reason.message : String(reason);
        onError(error);
      })
      .finally(() => { if (selection?.section === current.section && selection.path === current.path) { loading = false; queueMicrotask(onIconsChanged); } });
  });

  onDestroy(() => client.requests.abort(scope));

  async function saveMarkdown(content: string, expectedContentHash: string): Promise<FilePreviewModel> {
    if (!selection) throw new Error("No Markdown file is selected.");
    const saved = await onSaveMarkdown(preview?.path || selection.path, content, expectedContentHash);
    preview = saved;
    return saved;
  }
</script>

{#if selection}
  <div class="file-modal-layer" data-component-owner="file-preview-modal" role="presentation">
    <button class="file-modal-backdrop modal-enter" type="button" aria-label="Close file preview" onclick={onClose}></button>
    <div class="file-modal modal-enter" role="dialog" aria-modal="true" aria-label="File preview" data-preview-identity={`${workspaceId}:${resourceId}:${selection.section}:${selection.path}:${preview?.contentHash || "pending"}`}>
      <header class="file-modal-header"><div><strong>{preview?.name || selection.path.split("/").pop() || "File preview"}</strong><span>{selection.path}{preview?.size != null ? ` · ${formatBytes(preview.size)}` : ""}{preview?.truncated ? " · truncated" : ""}</span></div><div class="file-modal-actions">{#if editable && preview && !preview.truncated && !preview.binary && isMarkdownFile(preview.path || selection.path)}{#if mode === "preview"}<button class="secondary-button" type="button" onclick={() => mode = "edit"}><Icon name="pencil" /><span>Edit</span></button><button class="secondary-button" type="button" onclick={() => mode = "annotate"}><Icon name="message-square-plus" /><span>Annotate</span></button>{:else if mode === "edit"}<button class="secondary-button" type="button" onclick={() => mode = "preview"}><Icon name="eye" /><span>Preview</span></button><button class="secondary-button" type="button" onclick={() => mode = "annotate"}><Icon name="message-square-plus" /><span>Annotate</span></button>{:else}<button class="secondary-button" type="button" onclick={() => mode = "preview"}><Icon name="eye" /><span>Preview</span></button><button class="secondary-button" type="button" onclick={() => mode = "edit"}><Icon name="pencil" /><span>Edit</span></button>{/if}{/if}<a class="secondary-button file-modal-download" href={downloadURL} title="Download file"><Icon name="download" /><span>Download</span></a><a class="secondary-button file-modal-open" href={rawURL} target="_blank" rel="noopener" title="Open file in new window"><Icon name="external-link" /><span>Open</span></a><button class="icon-button" type="button" title="Close" aria-label="Close" onclick={onClose}><Icon name="x" /></button></div></header>
      {#if loading}<div class="file-modal-empty"><Icon name="loader-circle" /><strong>Loading preview</strong><span>{selection.path}</span></div>
      {:else if error}<div class="file-modal-empty error-preview"><Icon name="triangle-alert" /><strong>Preview unavailable</strong><span>{error}</span></div>
      {:else if preview && mode === "edit"}<div class="modal-markdown-editor"><LazyMarkdownEditor identity={`${workspaceId}:${resourceId}:${selection.path}:edit`} file={preview} mode="edit" onSave={saveMarkdown} onToast={onError} {onIconsChanged} /></div>
      {:else if preview && mode === "annotate"}<div class="modal-markdown-editor"><LazyMarkdownEditor identity={`${workspaceId}:${resourceId}:${selection.path}:annotate`} file={preview} mode="annotate" onSave={saveMarkdown} onToast={onError} {onIconsChanged} /></div>
      {:else if preview?.image}<div class="image-preview" data-preview-scroll><img src={rawURL} alt={preview.name || selection.path} /></div>
      {:else if preview?.binary}<div class="file-modal-empty"><Icon name="file-warning" /><strong>Preview unavailable</strong><span>{preview.name || selection.path} · Binary file, {formatBytes(preview.size || 0)}.</span><a class="secondary-button file-modal-download" href={downloadURL} title="Download file"><Icon name="download" /><span>Download</span></a></div>
      {:else if isMarkdownFile(preview?.path || selection.path)}<div class="modal-markdown markdown-rendered" data-preview-scroll use:markdownResourceNavigation={{ resolveResourceTitle, onNavigate, onOpenFile }}>{@html markdownHTML(preview?.content || "", { workspaceId, resolveResourceTitle })}</div>
      {:else}<pre class="modal-preview-content" data-preview-scroll>{preview?.content || ""}</pre>{/if}
    </div>
  </div>
{/if}
