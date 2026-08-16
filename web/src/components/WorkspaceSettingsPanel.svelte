<script lang="ts">
  import "./WorkspaceSettingsPanel.css";

  import Icon from "./Icon.svelte";
  import type { SettingsDraft, SettingsModel } from "./models";
  import { cloneSettingsDraft, settingsErrorMessage } from "./settings-draft";

  let {
    workspaces,
    activeWorkspaceId,
    workspaceIcons,
    draft = $bindable(),
    pending = $bindable(),
    onAddWorkspace,
    onRemoveWorkspace,
    onWorkspaceIcon,
    onToast,
  }: {
    workspaces: SettingsModel["workspaces"];
    activeWorkspaceId: string;
    workspaceIcons: SettingsModel["workspaceIcons"];
    draft: SettingsDraft;
    pending: string;
    onAddWorkspace: SettingsModel["onAddWorkspace"];
    onRemoveWorkspace: SettingsModel["onRemoveWorkspace"];
    onWorkspaceIcon: SettingsModel["onWorkspaceIcon"];
    onToast: SettingsModel["onToast"];
  } = $props();

  let iconPicker = $state("");

  async function addWorkspace(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    if (!draft.workspacePath.trim() || pending) return;
    pending = "workspace";
    try {
      await onAddWorkspace(cloneSettingsDraft(draft));
      draft.workspacePath = "";
      draft.createWorkspace = false;
    } catch (error) {
      onToast(settingsErrorMessage(error));
    } finally {
      pending = "";
    }
  }

  async function removeWorkspace(id: string): Promise<void> {
    if (pending) return;
    pending = `remove:${id}`;
    try {
      await onRemoveWorkspace(id, cloneSettingsDraft(draft));
    } catch (error) {
      onToast(settingsErrorMessage(error));
    } finally {
      pending = "";
    }
  }

  async function saveIcon(id: string, icon: string): Promise<void> {
    if (pending) return;
    pending = `icon:${id}`;
    iconPicker = "";
    try {
      await onWorkspaceIcon(id, icon, cloneSettingsDraft(draft));
    } catch (error) {
      onToast(settingsErrorMessage(error));
    } finally {
      pending = "";
    }
  }

  function workspaceIcon(id: string): { id: string; label: string; src: string } {
    const workspace = workspaces.find((item) => item.id === id);
    return workspaceIcons.find((item) => item.id === (workspace?.icon || "")) || workspaceIcons[0];
  }
</script>

<div class="settings-panel" data-component-owner="workspace-settings-panel" data-settings-panel>
  <div class="settings-panel-header">
    <h2>Workspaces</h2>
    <p>Add existing AgentWorkspace folders or create and initialize a new PUA workspace.</p>
  </div>
  <form id="settingsWorkspaceForm" class="settings-path-form" onsubmit={addWorkspace}>
    <input id="settingsWorkspacePath" bind:value={draft.workspacePath} placeholder="/Users/me/Documents/AgentWorkspace" />
    <label class="settings-check">
      <input id="settingsWorkspaceCreate" type="checkbox" bind:checked={draft.createWorkspace} />
      <span>Create directory and run pua init</span>
    </label>
    <button type="submit" disabled={Boolean(pending)}><Icon name="plus" /><span>{draft.createWorkspace ? "Create" : "Add"}</span></button>
  </form>
  <div class="settings-list">
    {#each workspaces as workspace (workspace.id)}
      {@const shownIcon = workspaceIcon(workspace.id)}
      <div class="settings-workspace-entry">
        <div class="settings-list-row">
          <div class="settings-row-main">
            <span class="settings-workspace-mark"><img src={shownIcon.src} alt="" aria-hidden="true" /></span>
            <span><strong>{workspace.name}</strong><small>{workspace.path}</small></span>
          </div>
          <div class="settings-row-actions">
            {#if workspace.id === activeWorkspaceId}<span class="settings-pill">Active</span>{/if}
            <button
              type="button"
              class="settings-workspace-icon-button"
              aria-expanded={iconPicker === workspace.id}
              title="Change workspace icon"
              disabled={Boolean(pending)}
              onclick={() => iconPicker = iconPicker === workspace.id ? "" : workspace.id}
            >
              <img src={shownIcon.src} alt="" />
              <span>{pending === `icon:${workspace.id}` ? "Saving..." : shownIcon.label}</span>
              <Icon name="chevron-down" />
            </button>
            <button type="button" class="settings-danger-button" title="Remove workspace" disabled={Boolean(pending)} onclick={() => removeWorkspace(workspace.id)}><Icon name="trash-2" /></button>
          </div>
        </div>
        {#if iconPicker === workspace.id}
          <div class="settings-workspace-icon-picker" role="radiogroup" aria-label={`Icon for ${workspace.name}`}>
            {#each workspaceIcons as option (option.id)}
              <button type="button" role="radio" aria-checked={option.id === shownIcon.id} class:selected={option.id === shownIcon.id} title={option.label} onclick={() => saveIcon(workspace.id, option.id)}>
                <img src={option.src} alt="" /><span>{option.label}</span>{#if option.id === shownIcon.id}<Icon name="check" />{/if}
              </button>
            {/each}
          </div>
        {/if}
      </div>
    {:else}
      <div class="settings-empty">No workspaces managed by PUA.</div>
    {/each}
  </div>
</div>
