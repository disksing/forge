<script lang="ts">
  import { onMount } from "svelte";

  import type { IslandChannel } from "./channel";
  import Icon from "./Icon.svelte";
  import type { ProfileDraft, SettingsDraft, SettingsModel } from "./models";

  let { channel }: { channel: IslandChannel<SettingsModel> } = $props();
  // svelte-ignore state_referenced_locally
  let model = $state(channel.current());
  let identity = $state("");
  let dataVersion = $state(-1);
  // svelte-ignore state_referenced_locally
  let draft = $state<SettingsDraft>(newDraft(model));
  let pending = $state("");
  let iconPicker = $state("");

  const systemProfiles = new Set(["default", "fast", "reasoning", "scheduler"]);

  onMount(() => channel.subscribe((next) => {
    model = next;
    if (next.identity !== identity) {
      identity = next.identity;
      dataVersion = next.dataVersion;
      draft = newDraft(next);
      pending = "";
      iconPicker = "";
    } else if (next.dataVersion !== dataVersion && !draft.dirty) {
      dataVersion = next.dataVersion;
      draft = newDraft(next);
    }
    queueMicrotask(next.onIconsChanged);
  }));

  onMount(() => {
    const keydown = (event: KeyboardEvent) => {
      if (model.open && event.key === "Escape") {
        event.preventDefault();
        model.onClose(draft.dirty);
      }
    };
    document.addEventListener("keydown", keydown);
    return () => document.removeEventListener("keydown", keydown);
  });

  function newDraft(value: SettingsModel): SettingsDraft {
    return {
      tab: value.initialTab,
      workspacePath: "",
      createWorkspace: false,
      userName: value.userName,
      endpoint: value.agentHub.configuredEndpoint || "http://127.0.0.1:4646",
      profiles: value.profiles.map((profile) => ({ ...profile })),
      newProfile: { key: "", description: "", agentName: value.agents[0]?.id || "" },
      dirty: false,
    };
  }

  function cloneDraft(): SettingsDraft {
    return { ...draft, profiles: draft.profiles.map((profile) => ({ ...profile })), newProfile: { ...draft.newProfile } };
  }

  function markDirty(): void { draft.dirty = true; }

  async function addWorkspace(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    if (!draft.workspacePath.trim() || pending) return;
    pending = "workspace";
    try { await model.onAddWorkspace(cloneDraft()); draft.workspacePath = ""; draft.createWorkspace = false; }
    catch (error) { model.onToast(message(error)); }
    finally { pending = ""; }
  }

  async function removeWorkspace(id: string): Promise<void> {
    if (pending) return;
    pending = `remove:${id}`;
    try { await model.onRemoveWorkspace(id, cloneDraft()); }
    catch (error) { model.onToast(message(error)); }
    finally { pending = ""; }
  }

  async function saveIcon(id: string, icon: string): Promise<void> {
    if (pending) return;
    pending = `icon:${id}`;
    iconPicker = "";
    try { await model.onWorkspaceIcon(id, icon, cloneDraft()); }
    catch (error) { model.onToast(message(error)); }
    finally { pending = ""; }
  }

  async function saveUser(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    if (pending) return;
    pending = "user";
    try { draft.userName = await model.onSaveUser(draft.userName); }
    catch (error) { model.onToast(message(error)); }
    finally { pending = ""; }
  }

  function updateProfile(index: number, field: keyof ProfileDraft, value: string): void {
    draft.profiles[index][field] = value;
    markDirty();
  }

  function addProfile(): void {
    const key = draft.newProfile.key.trim().toLowerCase();
    if (!key) return model.onToast("Profile key is required.");
    if (systemProfiles.has(key)) return model.onToast(`${key} is a reserved system profile.`);
    if (draft.profiles.some((profile) => profile.key.trim().toLowerCase() === key)) return model.onToast(`Profile ${key} already exists.`);
    draft.profiles = [...draft.profiles, { key, description: draft.newProfile.description.trim(), agentName: draft.newProfile.agentName }];
    draft.newProfile = { key: "", description: "", agentName: model.agents[0]?.id || "" };
    markDirty();
  }

  function removeProfile(index: number): void {
    const profile = draft.profiles[index];
    if (!profile || systemProfiles.has(profile.key.trim().toLowerCase())) return model.onToast("System profiles cannot be deleted.");
    draft.profiles = draft.profiles.filter((_, itemIndex) => index !== itemIndex);
    markDirty();
  }

  async function saveAgentHub(): Promise<void> {
    if (!draft.dirty || pending) return;
    pending = "agenthub";
    try { await model.onSaveAgentHub(cloneDraft()); draft.dirty = false; }
    catch (error) { model.onToast(message(error)); }
    finally { pending = ""; }
  }

  function workspaceIcon(id: string): { id: string; label: string; src: string } {
    const workspace = model.workspaces.find((item) => item.id === id);
    return model.workspaceIcons.find((item) => item.id === (workspace?.icon || "")) || model.workspaceIcons[0];
  }

  function profileAgentOptions(selected: string): Array<{ id: string; label: string }> {
    const options = model.agents.map((agent) => ({ id: agent.id, label: agent.label }));
    return selected && !options.some((item) => item.id === selected) ? [{ id: selected, label: `${selected} (Unavailable)` }, ...options] : options;
  }

  function message(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
</script>

{#if model.open}
  <button class="settings-overlay modal-enter" type="button" aria-label="Close settings" onclick={() => model.onClose(draft.dirty)}></button>
  <div class="settings-modal modal-enter" role="dialog" aria-modal="true" aria-label="System Settings">
    <aside class="settings-tabs">
      <div class="settings-title">System Settings</div>
      {#each [["workspace", "hard-drive", "Workspace"], ["user", "user-round", "User"], ["agenthub", "network", "AgentHub"], ["profiles", "route", "Profiles"], ["notifications", "bell", "Notifications"]] as tab}
        <button type="button" class:active={draft.tab === tab[0]} class:dirty={draft.dirty && (tab[0] === "agenthub" || tab[0] === "profiles")} class="settings-tab" onclick={() => draft.tab = tab[0] as SettingsDraft["tab"]}>
          <Icon name={tab[1]} /><span>{tab[2]}</span>{#if tab[0] === "agenthub" || tab[0] === "profiles"}<span class="settings-tab-dot" aria-hidden="true"></span>{/if}
        </button>
      {/each}
    </aside>
    <div class="settings-content">
      <button type="button" class="settings-close" title="Close" aria-label="Close" onclick={() => model.onClose(draft.dirty)}><Icon name="x" /></button>

      {#if draft.tab === "workspace"}
        <div class="settings-panel">
          <div class="settings-panel-header"><h2>Workspaces</h2><p>Add existing AgentWorkspace folders or create and initialize a new Forge workspace.</p></div>
          <form id="settingsWorkspaceForm" class="settings-path-form" onsubmit={addWorkspace}>
            <input id="settingsWorkspacePath" bind:value={draft.workspacePath} placeholder="/Users/me/Documents/AgentWorkspace" />
            <label class="settings-check"><input id="settingsWorkspaceCreate" type="checkbox" bind:checked={draft.createWorkspace} /><span>Create directory and run forge init</span></label>
            <button type="submit" disabled={Boolean(pending)}><Icon name="plus" /><span>{draft.createWorkspace ? "Create" : "Add"}</span></button>
          </form>
          <div class="settings-list">
            {#each model.workspaces as workspace (workspace.id)}
              {@const shownIcon = workspaceIcon(workspace.id)}
              <div class="settings-workspace-entry">
                <div class="settings-list-row">
                  <div class="settings-row-main"><span class="settings-workspace-mark"><img src={shownIcon.src} alt="" aria-hidden="true" /></span><span><strong>{workspace.name}</strong><small>{workspace.path}</small></span></div>
                  <div class="settings-row-actions">
                    {#if workspace.id === model.activeWorkspaceId}<span class="settings-pill">Active</span>{/if}
                    <button type="button" class="settings-workspace-icon-button" aria-expanded={iconPicker === workspace.id} title="Change workspace icon" disabled={Boolean(pending)} onclick={() => iconPicker = iconPicker === workspace.id ? "" : workspace.id}><img src={shownIcon.src} alt="" /><span>{pending === `icon:${workspace.id}` ? "Saving..." : shownIcon.label}</span><Icon name="chevron-down" /></button>
                    <button type="button" class="settings-danger-button" title="Remove workspace" disabled={Boolean(pending)} onclick={() => removeWorkspace(workspace.id)}><Icon name="trash-2" /></button>
                  </div>
                </div>
                {#if iconPicker === workspace.id}
                  <div class="settings-workspace-icon-picker" role="radiogroup" aria-label={`Icon for ${workspace.name}`}>
                    {#each model.workspaceIcons as option (option.id)}
                      <button type="button" role="radio" aria-checked={option.id === shownIcon.id} class:selected={option.id === shownIcon.id} title={option.label} onclick={() => saveIcon(workspace.id, option.id)}><img src={option.src} alt="" /><span>{option.label}</span>{#if option.id === shownIcon.id}<Icon name="check" />{/if}</button>
                    {/each}
                  </div>
                {/if}
              </div>
            {:else}<div class="settings-empty">No workspaces managed by Forge GUI.</div>{/each}
          </div>
        </div>
      {:else if draft.tab === "user"}
        <div class="settings-panel">
          <div class="settings-panel-header"><h2>User</h2><p>Choose the name shown for messages you send from this browser.</p></div>
          <form id="settingsUserForm" class="settings-user-form" onsubmit={saveUser}>
            <label><span>Name</span><input id="settingsUserName" bind:value={draft.userName} maxlength="80" placeholder="User" /><small>Stored only in this browser. Empty values use User.</small></label>
            <div class="settings-form-actions"><button type="submit" disabled={pending === "user"}><Icon name="save" /><span>Save</span></button></div>
          </form>
        </div>
      {:else if draft.tab === "agenthub"}
        <div class="settings-panel settings-agent-panel" data-settings-section="agenthub">
          <div class="settings-panel-header"><h2>AgentHub</h2><p>Forge connects to AgentHub for providers, agents, and durable sessions. Provider and agent definitions are read-only here.</p></div>
          <section class="settings-agent-section">
            <div class="settings-section-heading"><h3>Connection</h3><span class="settings-pill">{model.agentHub.connected && model.agentHub.compatible ? "Compatible" : model.agentHub.connected ? "Incompatible" : "Unavailable"}</span></div>
            <label class="settings-default-agent"><span>Endpoint</span><input id="settingsAgentHubEndpoint" bind:value={draft.endpoint} oninput={markDirty} /></label>
            <small>{model.agentHub.error || `API ${model.agentHub.apiVersion || "unknown"} · AgentHub ${model.agentHub.version || "unknown"}`}</small>
            <div class="settings-provider-list">{#each model.agentHub.capabilities as capability}<span class="settings-pill">{capability}</span>{/each}</div>
          </section>
          <section class="settings-agent-section">
            <div class="settings-section-heading"><h3>Catalog</h3><span>{model.agentHub.agents.length} agents · {model.agentHub.providers.length} providers</span></div>
            <div class="settings-agent-list">
              {#each model.agentHub.agents as agent (agent.name)}<div class="settings-service-row"><div class="settings-provider-main"><span class="settings-agent-mark">{(agent.name || "A").slice(0, 1).toUpperCase()}</span><span><strong>{agent.name}</strong><small>{agent.providerId || ""} · {agent.available === false ? agent.unavailableReason || "Unavailable" : "Available"}</small></span></div></div>{:else}<div class="settings-empty">No AgentHub agents available.</div>{/each}
            </div>
          </section>
          <div class="settings-form-actions settings-save-bar"><span class:visible={draft.dirty} class="settings-save-hint">{draft.dirty ? "Unsaved changes" : ""}</span><button id="settingsSaveButton" type="button" disabled={!draft.dirty || Boolean(pending)} onclick={saveAgentHub}><Icon name="save" /><span>Save All</span></button></div>
        </div>
      {:else if draft.tab === "profiles"}
        <div class="settings-panel settings-agent-panel" data-settings-section="profiles">
          <div class="settings-panel-header"><h2>Agent Profiles</h2><p>Profiles map chat and Self-Driving preferences to AgentHub agents. System profiles are reserved; custom profile keys must be unique.</p></div>
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
                <select id="settingsNewProfileAgent" bind:value={draft.newProfile.agentName} disabled={!model.agents.length} aria-label="New profile agent">{#each model.agents as agent}<option value={agent.id}>{agent.label}</option>{/each}</select>
                <button id="settingsAddProfileButton" type="button" disabled={!model.agents.length} onclick={addProfile}><Icon name="plus" /><span>Add</span></button>
              </div>
            </div>
          </section>
          <div class="settings-form-actions settings-save-bar"><span class:visible={draft.dirty} class="settings-save-hint">{draft.dirty ? "Unsaved changes" : ""}</span><button type="button" disabled={!draft.dirty || Boolean(pending)} onclick={saveAgentHub}><Icon name="save" /><span>Save All</span></button></div>
        </div>
      {:else}
        <div class="settings-panel">
          <div class="settings-panel-header"><h2>Notifications</h2><p>Choose how this browser notifies you when an Agent run finishes.</p></div>
          <section class="settings-agent-section">
            <label class="settings-notification-option"><span class="settings-notification-copy"><strong>Browser notifications</strong><small>Show one notification when a background run finishes.</small></span><input id="settingsBrowserNotifications" type="checkbox" checked={model.notifications.browser} onchange={(event) => model.onBrowserNotifications(event.currentTarget.checked)} /></label>
            {#if model.notifications.permissionError}<small class="settings-notification-help">{model.notifications.permissionError}</small>{/if}
          </section>
          <section class="settings-agent-section">
            <label class="settings-notification-option"><span class="settings-notification-copy"><strong>Completion sound</strong><small>Play one short local sound for each new notification.</small></span><input id="settingsCompletionSound" type="checkbox" checked={model.notifications.sound} onchange={(event) => model.onCompletionSound(event.currentTarget.checked)} /></label>
            <small class="settings-notification-help">{model.notifications.soundError || "Chrome may require the enable action to happen from a user gesture."}</small>
          </section>
        </div>
      {/if}
    </div>
  </div>
{/if}
