<script lang="ts">
  import "./DoctorDialog.css";

  import Icon from "./Icon.svelte";
  import type { DoctorSnapshotModel } from "../models/shell";

  let { snapshot, onClose, onRefresh }: {
    snapshot: DoctorSnapshotModel;
    onClose: () => void;
    onRefresh: () => Promise<void>;
  } = $props();

  let refreshing = $state(false);

  async function refresh() {
    if (refreshing) return;
    refreshing = true;
    try {
      await onRefresh();
    } finally {
      refreshing = false;
    }
  }
</script>

<div data-component-owner="doctor-dialog" class="doctor-backdrop" role="presentation" onclick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
  <div class="doctor-dialog" role="dialog" aria-modal="true" aria-labelledby="doctorTitle">
    <header>
      <div>
        <h2 id="doctorTitle">Workspace problems</h2>
        <p>{snapshot.summary.errors} errors · {snapshot.summary.warnings} warnings</p>
      </div>
      <div class="doctor-header-actions">
        <button type="button" class="doctor-refresh" disabled={refreshing || snapshot.checking} onclick={() => void refresh()} aria-label="Refresh workspace checks"><Icon name={refreshing || snapshot.checking ? "loader-circle" : "refresh-cw"} /> Refresh</button>
        <button type="button" class="doctor-close" onclick={onClose} aria-label="Close workspace problems"><Icon name="x" /></button>
      </div>
    </header>
    <div class="doctor-content">
      {#if snapshot.error}
        <div class="doctor-global-error"><strong>Doctor could not run</strong><span>{snapshot.error}</span></div>
      {/if}
      {#if snapshot.checking && !snapshot.checkedAt}
        <div class="doctor-empty"><Icon name="loader-circle" /><span>Checking configured Workspaces…</span></div>
      {:else if snapshot.workspaces.length === 0}
        <div class="doctor-empty"><Icon name="circle-check" /><span>No configured Workspace problems.</span></div>
      {:else}
        {#each snapshot.workspaces as workspace (workspace.id)}
          {#if workspace.report.issues.length > 0}
            <section class="doctor-workspace">
              <div class="doctor-workspace-heading">
                <div><h3>{workspace.name || workspace.id}</h3><code>{workspace.path}</code></div>
                <span>{workspace.report.summary.errors + workspace.report.summary.warnings}</span>
              </div>
              <div class="doctor-issues">
                {#each workspace.report.issues as issue, index (`${issue.code}:${issue.path || ""}:${issue.resourceId || ""}:${index}`)}
                  <article class:error={issue.severity === "error"} class:warning={issue.severity !== "error"}>
                    <div class="doctor-issue-icon"><Icon name={issue.severity === "error" ? "circle-x" : "triangle-alert"} /></div>
                    <div class="doctor-issue-copy">
                      <div class="doctor-issue-title"><strong>{issue.message}</strong><span>{issue.code}</span></div>
                      {#if issue.path}<code>{issue.path}</code>{/if}
                      {#if issue.suggestion}<p>{issue.suggestion}</p>{/if}
                    </div>
                  </article>
                {/each}
              </div>
            </section>
          {/if}
        {/each}
      {/if}
    </div>
  </div>
</div>
