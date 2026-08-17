<script lang="ts">
  import "./DiffModal.css";

  import { onDestroy, tick } from "svelte";

  import type { ApiClient } from "../api/client";
  import Icon from "./Icon.svelte";
  import type { DiffPreviewModel, ResourceRepoModel } from "./models";

  let { client, workspaceId, resourceId, repo, onClose, onError }: { client: ApiClient; workspaceId: string; resourceId: string; repo: ResourceRepoModel | null; onClose: () => void; onError: (message: string) => void } = $props();
  let diff = $state<DiffPreviewModel | null>(null);
  let loading = $state(false);
  let error = $state("");
  let viewer: HTMLDivElement | undefined = $state();
  const scope = $derived(`detail-diff:${workspaceId}:${resourceId}`);

  $effect(() => {
    const current = repo;
    const requestScope = scope;
    diff = null;
    error = "";
    if (!current) { client.requests.abort(requestScope); return; }
    loading = true;
    const path = current.worktreePath || "";
    const base = current.targetBranch || "";
    const params = new URLSearchParams({ path });
    if (base) params.set("base", base);
    void client.latest<DiffPreviewModel>(`/api/workspaces/${encodeURIComponent(workspaceId)}/diff?${params}`, { scope: requestScope })
      .then(async (value) => { if (repo === current) { diff = value; await tick(); renderDiff(); } })
      .catch((reason) => { if (repo !== current || reason?.name === "StaleResponseError") return; error = reason instanceof Error ? reason.message : String(reason); onError(error); })
      .finally(() => { if (repo === current) { loading = false; } });
  });

  $effect(() => { diff?.diff; viewer; renderDiff(); });
  onDestroy(() => client.requests.abort(scope));

  function renderDiff(): void {
    if (!viewer || !diff?.diff || !window.Diff2Html) return;
    viewer.innerHTML = window.Diff2Html.html(diff.diff, { drawFileList: true, matching: "lines", outputFormat: "side-by-side", renderNothingWhenEmpty: false });
  }
</script>

{#if repo}
  <div class="diff-modal-layer" data-component-owner="diff-modal" role="presentation">
    <button class="file-modal-backdrop modal-enter" type="button" aria-label="Close worktree diff" onclick={onClose}></button>
    <div class="diff-modal modal-enter" role="dialog" aria-modal="true" aria-label="Worktree diff">
      <header class="file-modal-header diff-modal-header"><div><strong>{diff?.branch || repo.branch || repo.name || "Diff"}</strong><span>{repo.worktreePath || ""}{repo.targetBranch ? ` · base ${repo.targetBranch}` : ""}</span></div><button class="icon-button" type="button" title="Close" aria-label="Close" onclick={onClose}><Icon name="x" /></button></header>
      {#if loading}<div class="file-modal-empty"><Icon name="loader-circle" /><strong>Loading diff</strong><span>{repo.worktreePath || ""}</span></div>
      {:else if error}<div class="file-modal-empty error-preview"><Icon name="triangle-alert" /><strong>Diff unavailable</strong><span>{error}</span></div>
      {:else if !diff?.hasChanges || !diff.diff?.trim()}<div class="file-modal-empty"><Icon name="check-circle-2" /><strong>No changes</strong><span>This worktree has no diff to show.</span></div>
      {:else}<div class="diff-viewer" bind:this={viewer}></div>{/if}
    </div>
  </div>
{/if}
