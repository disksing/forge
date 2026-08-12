<script lang="ts">
  import "./ProfilesSettingsPanel.css";

  import Icon from "./Icon.svelte";
  import type { ProfileDraft, SettingsDraft, SettingsModel } from "./models";
  import { cloneSettingsDraft, settingsErrorMessage } from "./settings-draft";

  let {
    agents,
    draft = $bindable(),
    pending = $bindable(),
    onDirty,
    onSaveAgentHub,
    onToast,
  }: {
    agents: SettingsModel["agents"];
    draft: SettingsDraft;
    pending: string;
    onDirty: () => void;
    onSaveAgentHub: SettingsModel["onSaveAgentHub"];
    onToast: SettingsModel["onToast"];
  } = $props();

  const systemProfiles = new Set(["default", "fast", "reasoning"]);

  function updateProfile(index: number, field: keyof ProfileDraft, value: string): void {
    draft.profiles[index][field] = value;
    onDirty();
  }

  function addProfile(): void {
    const key = draft.newProfile.key.trim().toLowerCase();
    if (!key) return onToast("Profile key is required.");
    if (systemProfiles.has(key)) return onToast(`${key} is a reserved system profile.`);
    if (draft.profiles.some((profile) => profile.key.trim().toLowerCase() === key)) return onToast(`Profile ${key} already exists.`);
    draft.profiles = [...draft.profiles, { key, description: draft.newProfile.description.trim(), agentName: draft.newProfile.agentName }];
    draft.newProfile = { key: "", description: "", agentName: agents[0]?.id || "" };
    onDirty();
  }

  function removeProfile(index: number): void {
    const profile = draft.profiles[index];
    if (!profile || systemProfiles.has(profile.key.trim().toLowerCase())) return onToast("System profiles cannot be deleted.");
    draft.profiles = draft.profiles.filter((_, itemIndex) => index !== itemIndex);
    onDirty();
  }

  function profileAgentOptions(selected: string): Array<{ id: string; label: string }> {
    const options = agents.map((agent) => ({ id: agent.id, label: agent.label }));
    return selected && !options.some((item) => item.id === selected) ? [{ id: selected, label: `${selected} (Unavailable)` }, ...options] : options;
  }

  function updateResourceDefault(kind: "workspace" | "project" | "task", value: string): void {
    draft.resourceDefaults[kind] = value;
    onDirty();
  }

  function resourceDefaultOptions(kind: "workspace" | "project" | "task"): ProfileDraft[] {
    const selected = draft.resourceDefaults[kind];
    return selected && !draft.profiles.some((profile) => profile.key === selected)
      ? [{ key: selected, description: "Missing Profile", agentName: "" }, ...draft.profiles]
      : draft.profiles;
  }

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

<div class="settings-panel settings-agent-panel" data-component-owner="profiles-settings-panel" data-settings-panel data-settings-section="profiles">
  <div class="settings-panel-header"><h2>Agent Profiles</h2><p>Profiles map Forge workflows to AgentHub agents. System profiles are reserved; custom profile keys must be unique.</p></div>
  <section class="settings-agent-section">
    <div class="settings-section-heading"><h3>New Resource Defaults</h3><span>Applied once at creation</span></div>
    <div class="settings-resource-defaults">
      {#each [["workspace", "Workspace"], ["project", "Project"], ["task", "Task"]] as item}
        {@const kind = item[0] as "workspace" | "project" | "task"}
        <label><span>{item[1]}</span><select value={draft.resourceDefaults[kind]} aria-label={`${item[1]} default profile`} onchange={(event) => updateResourceDefault(kind, event.currentTarget.value)}>{#each resourceDefaultOptions(kind) as profile}<option value={profile.key}>{profile.key}{profile.agentName ? "" : " (Missing)"}</option>{/each}</select></label>
      {/each}
    </div>
    <p class="settings-resource-default-note">Existing resources keep their explicit binding. Changing a profile route replaces its referenced resource generations at a safe turn boundary.</p>
  </section>
  <section class="settings-agent-section">
    <div class="settings-section-heading"><h3>Profile Routes</h3><span>{draft.profiles.length} routes</span></div>
    <div class="settings-profile-table">
      <div class="settings-profile-row settings-profile-head"><span>Profile key</span><span>Summary</span><span>AgentHub Agent</span><span></span></div>
      {#each draft.profiles as profile, index (index)}
        {@const system = systemProfiles.has(profile.key.trim().toLowerCase())}
        <div class:settings-profile-system={system} class="settings-profile-row">
          <input value={profile.key} disabled={system} aria-label="Profile key" oninput={(event) => updateProfile(index, "key", event.currentTarget.value)} />
          <input value={profile.description} disabled={system} aria-label="Summary" oninput={(event) => updateProfile(index, "description", event.currentTarget.value)} />
          <select value={profile.agentName} aria-label="AgentHub Agent" onchange={(event) => updateProfile(index, "agentName", event.currentTarget.value)}>{#each profileAgentOptions(profile.agentName) as agent}<option value={agent.id}>{agent.label}</option>{/each}</select>
          {#if system}<span class="settings-profile-system-label">System</span>{:else}<button type="button" class="settings-danger-button" title="Delete Profile" onclick={() => removeProfile(index)}><Icon name="trash-2" /></button>{/if}
        </div>
      {/each}
      <div class="settings-profile-row settings-profile-new">
        <input id="settingsNewProfileKey" bind:value={draft.newProfile.key} placeholder="New key" aria-label="New profile key" />
        <input id="settingsNewProfileDescription" bind:value={draft.newProfile.description} placeholder="New profile summary" aria-label="New profile summary" />
        <select id="settingsNewProfileAgent" bind:value={draft.newProfile.agentName} disabled={!agents.length} aria-label="New profile agent">{#each agents as agent}<option value={agent.id}>{agent.label}</option>{/each}</select>
        <button id="settingsAddProfileButton" type="button" disabled={!agents.length} onclick={addProfile}><Icon name="plus" /><span>Add</span></button>
      </div>
    </div>
  </section>
  <div class="settings-form-actions settings-save-bar"><span class:visible={draft.dirty} class="settings-save-hint">{draft.dirty ? "Unsaved changes" : ""}</span><button type="button" disabled={!draft.dirty || Boolean(pending)} onclick={saveAgentHub}><Icon name="save" /><span>Save All</span></button></div>
</div>
