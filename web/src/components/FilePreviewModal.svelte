<script lang="ts">
  import "./FilePreviewModal.css";

  import { onDestroy } from "svelte";

  import type { ApiClient } from "../api/client";
  import Icon from "./Icon.svelte";
  import { formatBytes, isMarkdownFile, markdownHTML } from "./detail";
  import type { FilePreviewModel } from "./models";

  let { client, workspaceId, resourceId, selection, onClose, onError, onIconsChanged }: { client: ApiClient; workspaceId: string; resourceId: string; selection: { section: string; path: string } | null; onClose: () => void; onError: (message: string) => void; onIconsChanged: () => void } = $props();
  let preview = $state<FilePreviewModel | null>(null);
  let loading = $state(false);
  let error = $state("");
  const scope = $derived(`detail-preview:${workspaceId}:${resourceId}`);
  const rawURL = $derived(selection ? `/api/workspaces/${encodeURIComponent(workspaceId)}/${selection.section === "Wiki" ? "wiki/files/raw" : "files/raw"}?path=${encodeURIComponent(selection.path)}` : "");

  $effect(() => {
    const current = selection;
    const requestScope = scope;
    preview = null;
    error = "";
    if (!current) { client.requests.abort(requestScope); return; }
    loading = true;
    const base = current.section === "Wiki" ? "wiki/files" : "files";
    void client.latest<FilePreviewModel>(`/api/workspaces/${encodeURIComponent(workspaceId)}/${base}?path=${encodeURIComponent(current.path)}`, { scope: requestScope })
      .then((value) => { if (selection?.section === current.section && selection.path === current.path) preview = value; })
      .catch((reason) => {
        if (selection?.section !== current.section || selection.path !== current.path || reason?.name === "StaleResponseError") return;
        error = reason instanceof Error ? reason.message : String(reason);
        onError(error);
      })
      .finally(() => { if (selection?.section === current.section && selection.path === current.path) { loading = false; queueMicrotask(onIconsChanged); } });
  });

  onDestroy(() => client.requests.abort(scope));
</script>

{#if selection}
  <div class="file-modal-layer" data-component-owner="file-preview-modal" role="presentation">
    <button class="file-modal-backdrop modal-enter" type="button" aria-label="Close file preview" onclick={onClose}></button>
    <div class="file-modal modal-enter" role="dialog" aria-modal="true" aria-label="File preview" data-preview-identity={`${workspaceId}:${resourceId}:${selection.section}:${selection.path}:${preview?.contentHash || "pending"}`}>
      <header class="file-modal-header"><div><strong>{preview?.name || selection.path.split("/").pop() || "File preview"}</strong><span>{selection.path}{preview?.size != null ? ` · ${formatBytes(preview.size)}` : ""}{preview?.truncated ? " · truncated" : ""}</span></div><div class="file-modal-actions"><a class="secondary-button file-modal-open" href={rawURL} target="_blank" rel="noopener" title="Open file in new window"><Icon name="external-link" /><span>Open</span></a><button class="icon-button" type="button" title="Close" aria-label="Close" onclick={onClose}><Icon name="x" /></button></div></header>
      {#if loading}<div class="file-modal-empty"><Icon name="loader-circle" /><strong>Loading preview</strong><span>{selection.path}</span></div>
      {:else if error}<div class="file-modal-empty error-preview"><Icon name="triangle-alert" /><strong>Preview unavailable</strong><span>{error}</span></div>
      {:else if preview?.image}<div class="image-preview" data-preview-scroll><img src={rawURL} alt={preview.name || selection.path} /></div>
      {:else if preview?.binary}<div class="file-modal-empty"><Icon name="file-warning" /><strong>{preview.name || selection.path}</strong><span>Binary file, {formatBytes(preview.size || 0)}.</span></div>
      {:else if isMarkdownFile(preview?.path || selection.path)}<div class="modal-markdown markdown-rendered" data-preview-scroll>{@html markdownHTML(preview?.content || "")}</div>
      {:else}<pre class="modal-preview-content" data-preview-scroll>{preview?.content || ""}</pre>{/if}
    </div>
  </div>
{/if}
