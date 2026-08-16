<script lang="ts">
  import "./WorkspaceSettingsPanel.css";

  import Icon from "./Icon.svelte";
  import type { SettingsDraft, SettingsModel } from "./models";
  import { cloneSettingsDraft, settingsErrorMessage } from "./settings-draft";

  let {
    workspaces,
    activeWorkspaceId,
    workspaceIcons,
    users,
    currentUserName,
    draft = $bindable(),
    pending = $bindable(),
    onAddWorkspace,
    onRemoveWorkspace,
    onWorkspaceIcon,
    onSaveWorkspaceName,
    onSaveUserPreference,
    onDeleteUser,
    onToast,
  }: {
    workspaces: SettingsModel["workspaces"];
    activeWorkspaceId: string;
    workspaceIcons: SettingsModel["workspaceIcons"];
    users: SettingsModel["users"];
    currentUserName: string;
    draft: SettingsDraft;
    pending: string;
    onAddWorkspace: SettingsModel["onAddWorkspace"];
    onRemoveWorkspace: SettingsModel["onRemoveWorkspace"];
    onWorkspaceIcon: SettingsModel["onWorkspaceIcon"];
    onSaveWorkspaceName: SettingsModel["onSaveWorkspaceName"];
    onSaveUserPreference: SettingsModel["onSaveUserPreference"];
    onDeleteUser: SettingsModel["onDeleteUser"];
    onToast: SettingsModel["onToast"];
  } = $props();

  let iconPicker = $state("");
  let nameEditing = $state("");
  let nameDraft = $state("");
  let nameInput = $state<HTMLInputElement | null>(null);
  let preferenceDrafts = $state<Record<string, string>>({});

  $effect(() => {
    if (nameEditing && nameInput) nameInput.focus();
  });

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

  function startNameEdit(workspace: SettingsModel["workspaces"][number]): void {
    if (pending) return;
    iconPicker = "";
    nameDraft = workspace.name;
    nameEditing = workspace.id;
  }

  function cancelNameEdit(): void {
    nameEditing = "";
    nameDraft = "";
  }

  async function saveName(workspace: SettingsModel["workspaces"][number]): Promise<void> {
    const name = nameDraft.trim();
    if (name === workspace.name) {
      cancelNameEdit();
      return;
    }
    pending = `name:${workspace.id}`;
    try {
      await onSaveWorkspaceName(workspace.id, name, cloneSettingsDraft(draft));
      cancelNameEdit();
    } catch (error) {
      onToast(settingsErrorMessage(error));
    } finally {
      pending = "";
    }
  }

  function nameKeydown(event: KeyboardEvent, workspace: SettingsModel["workspaces"][number]): void {
    if (event.key === "Enter") {
      event.preventDefault();
      void saveName(workspace);
    } else if (event.key === "Escape") {
      event.preventDefault();
      cancelNameEdit();
    }
  }

  function workspaceIcon(id: string): { id: string; label: string; src: string } {
    const workspace = workspaces.find((item) => item.id === id);
    return workspaceIcons.find((item) => item.id === (workspace?.icon || "")) || workspaceIcons[0];
  }

  async function savePreference(name: string, fallback: string): Promise<void> {
    if (pending) return;
    pending = `user:${name}`;
    try {
      await onSaveUserPreference(name, preferenceDrafts[name] ?? fallback);
      delete preferenceDrafts[name];
    } catch (error) {
      onToast(settingsErrorMessage(error));
    } finally {
      pending = "";
    }
  }

  async function deleteUser(name: string): Promise<void> {
    if (pending) return;
    pending = `delete-user:${name}`;
    try {
      await onDeleteUser(name);
    } catch (error) {
      onToast(settingsErrorMessage(error));
    } finally {
      pending = "";
    }
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
              onclick={() => { nameEditing = ""; iconPicker = iconPicker === workspace.id ? "" : workspace.id; }}
            >
              <img src={shownIcon.src} alt="" />
              <span>{pending === `icon:${workspace.id}` ? "Saving..." : shownIcon.label}</span>
              <Icon name="chevron-down" />
            </button>
            <button type="button" class="settings-workspace-rename-button" title="Rename workspace" aria-label={`Rename ${workspace.name}`} disabled={Boolean(pending)} onclick={() => startNameEdit(workspace)}><Icon name="pencil" /></button>
            <button type="button" class="settings-danger-button" title="Remove workspace" disabled={Boolean(pending)} onclick={() => removeWorkspace(workspace.id)}><Icon name="trash-2" /></button>
          </div>
        </div>
        {#if nameEditing === workspace.id}
          <form class="settings-workspace-name-form" onsubmit={(event) => { event.preventDefault(); void saveName(workspace); }}>
            <input bind:this={nameInput} bind:value={nameDraft} placeholder={workspace.path} aria-label={`Name for ${workspace.name}`} disabled={pending === `name:${workspace.id}`} onkeydown={(event) => nameKeydown(event, workspace)} />
            <button type="submit" disabled={Boolean(pending)}><Icon name="check" /><span>{pending === `name:${workspace.id}` ? "Saving..." : "Save"}</span></button>
            <button type="button" disabled={Boolean(pending)} onclick={cancelNameEdit}><Icon name="x" /><span>Cancel</span></button>
            <small class="settings-workspace-name-hint">Leave empty to use the directory name.</small>
          </form>
        {/if}
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
  <div class="settings-panel-header settings-users-header">
    <h2>Workspace users</h2>
    <p>Manage the users registered in the active Workspace and the preferences Agents can query with the CLI.</p>
  </div>
  <div class="settings-users-list">
    {#each users as user (user.name)}
      <div class="settings-user-entry">
        <div class="settings-user-heading">
          <strong>{user.name}</strong>
          <div class="settings-row-actions">
            {#if user.name === currentUserName}<span class="settings-pill">Current</span>{/if}
            <button type="button" class="settings-danger-button" title={user.name === currentUserName ? "Switch to another user before deleting this user" : `Delete ${user.name}`} disabled={Boolean(pending) || user.name === currentUserName} onclick={() => deleteUser(user.name)}><Icon name="trash-2" /></button>
          </div>
        </div>
        <label>
          <span>Preference</span>
          <textarea value={preferenceDrafts[user.name] ?? user.preference} oninput={(event) => preferenceDrafts[user.name] = (event.currentTarget as HTMLTextAreaElement).value} placeholder="How should Agents address this user or shape their replies?"></textarea>
        </label>
        <div class="settings-form-actions"><button type="button" disabled={Boolean(pending)} onclick={() => savePreference(user.name, user.preference)}><Icon name="save" /><span>{pending === `user:${user.name}` ? "Saving..." : "Save preference"}</span></button></div>
      </div>
    {:else}
      <div class="settings-empty">No users registered in this Workspace.</div>
    {/each}
  </div>
</div>
