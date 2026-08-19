<script lang="ts">
  import "./AgentHubSettingsPanel.css";

  import Icon from "./Icon.svelte";
  import type { SettingsDraft, SettingsModel } from "./models";
  import { cloneSettingsDraft, settingsErrorMessage } from "./settings-draft";

  let {
    agentHub,
    draft = $bindable(),
    pending = $bindable(),
    onDirty,
    onSaveAgentHub,
    onToast,
  }: {
    agentHub: SettingsModel["agentHub"];
    draft: SettingsDraft;
    pending: string;
    onDirty: () => void;
    onSaveAgentHub: SettingsModel["onSaveAgentHub"];
    onToast: SettingsModel["onToast"];
  } = $props();

  async function saveAgentHub(): Promise<void> {
    if (!draft.dirty || pending) return;
    pending = "agenthub";
    try {
      await onSaveAgentHub(cloneSettingsDraft(draft));
      draft.dirty = false;
    } catch (error) {
      onToast(settingsErrorMessage(error));
    } finally {
      pending = "";
    }
  }
</script>

<div class="settings-panel settings-agent-panel" data-component-owner="agenthub-settings-panel" data-settings-panel data-settings-section="agenthub">
  <div class="settings-panel-header"><h2>AgentHub</h2><p>PUA connects to AgentHub for providers, agents, and durable sessions. Provider and agent definitions are read-only here.</p></div>
  <section class="settings-agent-section">
    <div class="settings-section-heading"><h3>Connection</h3><span class="settings-pill">{agentHub.connected && agentHub.compatible ? "Compatible" : agentHub.connected ? "Incompatible" : "Unavailable"}</span></div>
    <label class="settings-default-agent"><span>Endpoint</span><input id="settingsAgentHubEndpoint" bind:value={draft.endpoint} oninput={onDirty} readonly /></label>
    <small>Mode: {agentHub.mode || "embedded"}. Change the mode or endpoint with <code>pua serve</code> flags and restart the service.</small>
    <small>{agentHub.error || `API ${agentHub.apiVersion || "unknown"} · AgentHub ${agentHub.version || "unknown"}`}</small>
    <div class="settings-provider-list">{#each agentHub.capabilities as capability}<span class="settings-pill">{capability}</span>{/each}</div>
  </section>
  <section class="settings-agent-section">
    <div class="settings-section-heading"><h3>Catalog</h3><span>{agentHub.agents.length} agents · {agentHub.providers.length} providers</span></div>
    <div class="settings-agent-list">
      {#each agentHub.agents as agent (agent.name)}
        <div class="settings-service-row"><div class="settings-provider-main"><span class="settings-agent-mark">{(agent.name || "A").slice(0, 1).toUpperCase()}</span><span><strong>{agent.name}</strong><small>{agent.providerId || ""} · {agent.available === false ? agent.unavailableReason || "Unavailable" : "Available"}</small></span></div></div>
      {:else}
        <div class="settings-empty">No AgentHub agents available.</div>
      {/each}
    </div>
  </section>
  <div class="settings-form-actions settings-save-bar"><span class:visible={draft.dirty} class="settings-save-hint">{draft.dirty ? "Unsaved changes" : ""}</span><button id="settingsSaveButton" type="button" disabled={!draft.dirty || Boolean(pending)} onclick={saveAgentHub}><Icon name="save" /><span>Save All</span></button></div>
</div>
