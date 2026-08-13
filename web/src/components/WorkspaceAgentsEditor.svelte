<script lang="ts">
  import "./WorkspaceAgentsEditor.css";

  import type { WorkspaceAgentsModel } from "./models";
  import { stripForgeManagedBlocks } from "./detail";
  import Icon from "./Icon.svelte";

  let { identity, file, onSave, onToast, onIconsChanged }: { identity: string; file: WorkspaceAgentsModel | null; onSave: (content: string, expectedContentHash: string) => Promise<WorkspaceAgentsModel>; onToast: (message: string) => void; onIconsChanged: () => void } = $props();
  let currentIdentity = $state("");
  let draft = $state("");
  let baseline = $state("");
  let baselineHash = $state("");
  let incomingHash = $state("");
  let saving = $state(false);
  let error = $state("");
  const dirty = $derived(draft !== baseline);
  const conflict = $derived(Boolean(dirty && incomingHash && baselineHash && incomingHash !== baselineHash));

  $effect(() => {
    const nextContent = stripForgeManagedBlocks(file?.content || "");
    const nextHash = file?.contentHash || "";
    incomingHash = nextHash;
    if (identity !== currentIdentity) {
      currentIdentity = identity;
      draft = nextContent;
      baseline = nextContent;
      baselineHash = nextHash;
      error = "";
      saving = false;
    } else if (!dirty && nextHash !== baselineHash) {
      draft = nextContent;
      baseline = nextContent;
      baselineHash = nextHash;
    }
  });

  async function save(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    if (saving || !dirty) return;
    const requestIdentity = currentIdentity;
    saving = true;
    error = "";
    try {
      const saved = await onSave(draft, baselineHash);
      if (currentIdentity !== requestIdentity) return;
      baseline = stripForgeManagedBlocks(saved.content || draft);
      draft = baseline;
      baselineHash = saved.contentHash || "";
      incomingHash = baselineHash;
      onToast("Workspace AGENTS.md saved.");
    } catch (reason) {
      if (currentIdentity === requestIdentity) error = reason instanceof Error ? reason.message : String(reason);
    } finally {
      if (currentIdentity === requestIdentity) { saving = false; queueMicrotask(onIconsChanged); }
    }
  }
</script>

<div class="content-section" data-component-owner="workspace-agents-editor">
  <h3><Icon name="file-text" /><span>Workspace AGENTS.md</span></h3>
  {#if !file}<div class="empty-state"><Icon name="loader-circle" className="empty-state-icon" /><strong>Loading AGENTS.md...</strong></div>
  {:else if file.error}<div class="file-modal-empty error-preview"><Icon name="triangle-alert" /><strong>AGENTS.md unavailable</strong><span>{file.error}</span></div>
  {:else}
    <form id="workspaceAgentsForm" class="details-form workspace-agents-form" onsubmit={save}>
      <textarea id="workspaceAgentsContent" rows="10" spellcheck="false" disabled={saving} bind:value={draft}></textarea>
      {#if conflict}<p class="log-load-error" role="alert">AGENTS.md changed on disk while you were editing. Your draft is preserved; saving now will report a conflict.</p>{/if}
      {#if error}<p class="log-load-error" role="alert">{error}</p>{/if}
      <div class="form-actions"><button type="submit" class:busy={saving} disabled={saving || !dirty}><span class="workspace-agents-icon workspace-agents-icon-idle"><Icon name="save" /></span><span class="workspace-agents-icon workspace-agents-icon-busy"><Icon name="loader-circle" /></span><span>{saving ? "Saving" : "Save"}</span></button></div>
    </form>
  {/if}
</div>
