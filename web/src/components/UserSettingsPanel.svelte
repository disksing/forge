<script lang="ts">
  import "./UserSettingsPanel.css";

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
</script>

<div class="settings-panel" data-component-owner="user-settings-panel" data-settings-panel>
  <div class="settings-panel-header"><h2>User</h2><p>Choose the name shown for messages you send from this browser.</p></div>
  <form id="settingsUserForm" class="settings-user-form" onsubmit={saveUser}>
    <label>
      <span>Name</span>
      <input id="settingsUserName" value={userName} oninput={(event) => onUserNameInput((event.currentTarget as HTMLInputElement).value)} maxlength="80" placeholder="User" />
      <small>Stored only in this browser. Empty values use User.</small>
    </label>
    <div class="settings-form-actions"><button type="submit" disabled={pending === "user"}><Icon name="save" /><span>Save</span></button></div>
  </form>
</div>
