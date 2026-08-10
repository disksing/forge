<script lang="ts">
  import "./NotificationSettingsPanel.css";

  import type { SettingsModel } from "./models";

  let {
    notifications,
    onBrowserNotifications,
    onCompletionSound,
  }: {
    notifications: SettingsModel["notifications"];
    onBrowserNotifications: SettingsModel["onBrowserNotifications"];
    onCompletionSound: SettingsModel["onCompletionSound"];
  } = $props();
</script>

<div class="settings-panel" data-component-owner="notification-settings-panel" data-settings-panel>
  <div class="settings-panel-header"><h2>Notifications</h2><p>Choose how this browser notifies you when an Agent run finishes.</p></div>
  <section class="settings-agent-section">
    <label class="settings-notification-option">
      <span class="settings-notification-copy"><strong>Browser notifications</strong><small>Show one notification when a background run finishes.</small></span>
      <input id="settingsBrowserNotifications" type="checkbox" checked={notifications.browser} onchange={(event) => onBrowserNotifications(event.currentTarget.checked)} />
    </label>
    {#if notifications.permissionError}<small class="settings-notification-help">{notifications.permissionError}</small>{/if}
  </section>
  <section class="settings-agent-section">
    <label class="settings-notification-option">
      <span class="settings-notification-copy"><strong>Completion sound</strong><small>Play one short local sound for each new notification.</small></span>
      <input id="settingsCompletionSound" type="checkbox" checked={notifications.sound} onchange={(event) => onCompletionSound(event.currentTarget.checked)} />
    </label>
    <small class="settings-notification-help">{notifications.soundError || "Chrome may require the enable action to happen from a user gesture."}</small>
  </section>
</div>
