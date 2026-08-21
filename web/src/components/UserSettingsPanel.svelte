<script lang="ts">
  import "./UserSettingsPanel.css";

  import { sanitizeUserNameInput } from "../controllers/user-settings-controller";
  import Icon from "./Icon.svelte";
  import type { SettingsDraft, SettingsModel } from "./models";
  import { settingsErrorMessage } from "./settings-draft";

  let {
    userName,
    onUserNameInput,
    pending = $bindable(),
    onSaveUser,
    onToast,
  }: {
    userName: string;
    onUserNameInput: (value: string) => void;
    pending: string;
    onSaveUser: SettingsModel["onSaveUser"];
    onToast: SettingsModel["onToast"];
  } = $props();

  async function saveUser(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    if (pending) return;
    pending = "user";
    try {
      onUserNameInput(await onSaveUser(userName));
    } catch (error) {
      onToast(settingsErrorMessage(error));
    } finally {
      pending = "";
    }
  }

  function updateUserNameInput(event: Event): void {
    const input = event.currentTarget as HTMLInputElement;
    const normalized = sanitizeUserNameInput(input.value);
    if (input.value !== normalized) input.value = normalized;
    onUserNameInput(normalized);
  }
</script>

<div class="settings-panel" data-component-owner="user-settings-panel" data-settings-panel>
  <div class="settings-panel-header"><h2>User</h2><p>Choose the name shown for messages you send from this browser.</p></div>
  <form id="settingsUserForm" class="settings-user-form" onsubmit={saveUser}>
    <label>
      <span>Name</span>
      <input id="settingsUserName" value={userName} oninput={updateUserNameInput} maxlength="80" pattern="[A-Za-z0-9_-]+" placeholder="User" />
      <small>Use letters, numbers, underscores, or hyphens. Other characters are removed as you type. Leave blank to use User. The selection is stored in this browser and registered in the active Workspace.</small>
    </label>
    <div class="settings-form-actions"><button type="submit" class="primary-button" disabled={pending === "user"}><Icon name="save" /><span>Save</span></button></div>
  </form>
</div>
