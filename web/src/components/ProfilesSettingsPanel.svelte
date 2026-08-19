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

  const systemProfiles = new Set(["default"]);
  const normalizedProfileKey = (profile: ProfileDraft): string => profile.key.trim().toLowerCase();
  const isReservedProfileKey = (profile: ProfileDraft): boolean => systemProfiles.has(normalizedProfileKey(profile));

  // Row ids give each profile card a stable identity so the expanded set and
  // drag/drop targets stay attached to the right card across reorders: adds
  // insert, removes and moves splice, edits never reorder.
  let rowIdCounter = 0;
  let rowIds = $state<number[]>(draft.profiles.map(() => rowIdCounter++));
  // Track system rows by card identity rather than the editable key. Otherwise
  // changing a custom key to "default" would lock that custom field before the
  // user had a chance to correct the duplicate.
  let systemRowIds = $state<Set<number>>(new Set(draft.profiles.flatMap((profile, index) => isReservedProfileKey(profile) ? [rowIds[index]] : [])));
  let expanded = $state<Set<number>>(new Set());
  // dragIndex/dropIndex track an in-flight reorder gesture: dragIndex is the
  // card being dragged and dropIndex the card currently highlighted as the
  // drop target (dropIndex is used only for visual feedback).
  let dragIndex = $state<number | null>(null);
  let dropIndex = $state<number | null>(null);

  // Re-synchronize if the draft was replaced externally (e.g. a settings
  // reload after a data version bump): regenerate ids so lengths stay aligned.
  $effect(() => {
    if (rowIds.length !== draft.profiles.length) {
      rowIds = draft.profiles.map(() => rowIdCounter++);
      systemRowIds = new Set(draft.profiles.flatMap((profile, index) => isReservedProfileKey(profile) ? [rowIds[index]] : []));
      expanded = new Set();
    }
  });

  // Custom profiles may not move above the system block: the backend always
  // normalizes system profiles to the front, so the UI keeps them pinned.
  const firstCustomIndex = $derived(draft.profiles.findIndex((_, index) => !systemRowIds.has(rowIds[index])));
  const systemCount = $derived(firstCustomIndex === -1 ? draft.profiles.length : firstCustomIndex);

  function toggleCard(index: number): void {
    const id = rowIds[index];
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    expanded = next;
  }

  function updateProfile(index: number, field: keyof ProfileDraft, value: string): void {
    draft.profiles[index][field] = value;
    onDirty();
  }

  function moveProfile(from: number, to: number): void {
    if (from === to || to < systemCount || from < systemCount) return;
    if (from < 0 || from >= draft.profiles.length || to >= draft.profiles.length) return;
    rowIds.splice(to, 0, rowIds.splice(from, 1)[0]);
    const profiles = [...draft.profiles];
    profiles.splice(to, 0, profiles.splice(from, 1)[0]);
    draft.profiles = profiles;
    onDirty();
  }

  function removeProfile(index: number): void {
    const profile = draft.profiles[index];
    if (!profile || systemRowIds.has(rowIds[index])) return onToast("System profiles cannot be deleted.");
    expanded.delete(rowIds[index]);
    rowIds.splice(index, 1);
    draft.profiles = draft.profiles.filter((_, itemIndex) => index !== itemIndex);
    onDirty();
  }

  function uniqueProfileKey(): string {
    const taken = new Set(draft.profiles.map(normalizedProfileKey));
    let suffix = 1;
    while (taken.has(`profile-${suffix}`) || systemProfiles.has(`profile-${suffix}`)) suffix++;
    return `profile-${suffix}`;
  }

  function addProfile(): void {
    if (!agents.length) return onToast("Add an AgentHub agent before creating profiles.");
    const insertAt = systemCount;
    const profile: ProfileDraft = { key: uniqueProfileKey(), description: "", agentName: agents[0]?.id || "" };
    draft.profiles = [...draft.profiles.slice(0, insertAt), profile, ...draft.profiles.slice(insertAt)];
    rowIds.splice(insertAt, 0, rowIdCounter++);
    expanded = new Set(expanded).add(rowIds[insertAt]);
    onDirty();
  }

  function agentLabel(name: string): string {
    const normalized = name.trim().toLowerCase();
    return agents.find((agent) => agent.id.trim().toLowerCase() === normalized)?.label || name;
  }

  function profileAgentOptions(selected: string): Array<{ id: string; label: string }> {
    const options = agents.map((agent) => ({ id: agent.id, label: agent.label }));
    return selected && !options.some((item) => item.id === selected) ? [{ id: selected, label: `${selected} (Unavailable)` }, ...options] : options;
  }

  function profileKeyError(index: number): string {
    const profile = draft.profiles[index];
    if (!profile) return "";
    const key = normalizedProfileKey(profile);
    if (!key) return "Profile key is required.";
    if (draft.profiles.some((candidate, candidateIndex) => candidateIndex !== index && normalizedProfileKey(candidate) === key)) {
      return `Profile ${key} already exists.`;
    }
    return "";
  }

  // Keep the field-level feedback and the save guard on the same validation
  // result so edits are reflected immediately while saveAgentHub remains a
  // defensive boundary for callers that invoke it directly.
  const profileKeyErrors = $derived.by(() => draft.profiles.map((_, index) => profileKeyError(index)));
  const hasProfileKeyErrors = $derived(profileKeyErrors.some(Boolean));

  function validateProfiles(): string {
    return profileKeyErrors.find(Boolean) || "";
  }

  async function saveAgentHub(): Promise<void> {
    if (!draft.dirty || pending) return;
    const problem = validateProfiles();
    if (problem) return onToast(problem);
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
  <div class="settings-panel-header"><h2>Agent Profiles</h2><p>Profiles map PUA workflows to AgentHub agents. The default profile is reserved; custom profile keys must be unique. Drag the handle to reorder — the order decides how profiles appear in binding pickers.</p></div>
  <section class="settings-agent-section">
    <div class="settings-section-heading"><h3>Profile Routes</h3><span>{draft.profiles.length} routes</span></div>
    {#each draft.profiles as profile, index (rowIds[index])}
      {@const system = systemRowIds.has(rowIds[index])}
      {@const open = expanded.has(rowIds[index])}
      {@const keyError = profileKeyErrors[index]}
      <article
        class="settings-profile-card"
        class:settings-profile-card-system={system}
        class:dragging={dragIndex === index}
        class:drop-target={dropIndex === index}
        ondragover={(event) => {
          if (dragIndex === null || dragIndex === index || index < systemCount) return;
          event.preventDefault();
          if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
          if (dropIndex !== index) dropIndex = index;
        }}
        ondrop={(event) => {
          event.preventDefault();
          if (dragIndex === null || dragIndex === index) return;
          moveProfile(dragIndex, index);
          dragIndex = null;
          dropIndex = null;
        }}
      >
        <div class="settings-profile-card-head">
          {#if system}
            <span class="settings-drag-placeholder"></span>
          {:else}
            <button
              type="button"
              class="settings-drag-handle"
              aria-label={`Reorder profile ${profile.key || "Unnamed profile"}`}
              title="Drag to reorder (or focus and use Arrow keys)"
              draggable="true"
              ondragstart={(event) => {
                dragIndex = index;
                if (event.dataTransfer) {
                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.setData("text/plain", String(index));
                }
              }}
              ondragend={() => { dragIndex = null; dropIndex = null; }}
              onkeydown={(event) => {
                if (event.key === "ArrowUp" && index > systemCount) {
                  event.preventDefault();
                  moveProfile(index, index - 1);
                } else if (event.key === "ArrowDown" && index < draft.profiles.length - 1) {
                  event.preventDefault();
                  moveProfile(index, index + 1);
                }
              }}
            ><Icon name="grip-vertical" /></button>
          {/if}
          <button
            type="button"
            class="settings-profile-card-toggle"
            aria-expanded={open}
            aria-controls="settings-profile-{index}-body"
            onclick={() => toggleCard(index)}
          >
            <span class="settings-profile-caret" class:open><Icon name="chevron-right" /></span>
            <strong>{profile.key || "Unnamed profile"}</strong>
            <span class="settings-pill pill-muted" title="{profile.description ? `${profile.description} · ` : ''}{agentLabel(profile.agentName)}">
              <span class="settings-pill-text">{profile.description ? `${profile.description} · ` : ""}{agentLabel(profile.agentName)}</span>
            </span>
          </button>
          {#if system}
            <span class="settings-profile-system-label">System</span>
          {:else}
            <button type="button" class="settings-danger-button" title="Delete Profile" aria-label={`Delete profile ${profile.key || "Unnamed profile"}`} onclick={() => removeProfile(index)}><Icon name="trash-2" /></button>
          {/if}
        </div>
        {#if open}
          <div class="settings-profile-card-body" id="settings-profile-{index}-body">
            <label>
              Profile key
              <input
                value={profile.key}
                disabled={system}
                required
                aria-label="Profile key"
                aria-invalid={Boolean(keyError)}
                aria-describedby={keyError ? `settings-profile-${index}-key-error` : undefined}
                oninput={(event) => updateProfile(index, "key", event.currentTarget.value)}
              />
              {#if keyError}<span id="settings-profile-{index}-key-error" class="settings-field-error" role="alert">{keyError}</span>{/if}
            </label>
            <label>Summary<input value={profile.description} disabled={system} aria-label="Summary" oninput={(event) => updateProfile(index, "description", event.currentTarget.value)} /></label>
            <label>AgentHub Agent<select value={profile.agentName} aria-label="AgentHub Agent" onchange={(event) => updateProfile(index, "agentName", event.currentTarget.value)}>{#each profileAgentOptions(profile.agentName) as agent}<option value={agent.id}>{agent.label}</option>{/each}</select></label>
          </div>
        {/if}
      </article>
    {/each}
    <button type="button" class="settings-profile-add" onclick={addProfile} disabled={!agents.length} title={agents.length ? "" : "Add an AgentHub agent first"}><Icon name="plus" /><span>Add profile</span></button>
  </section>
  <div class="settings-form-actions settings-save-bar"><span class:visible={draft.dirty} class="settings-save-hint">{draft.dirty ? "Unsaved changes" : ""}</span><button type="button" disabled={!draft.dirty || Boolean(pending) || hasProfileKeyErrors} onclick={saveAgentHub}><Icon name="save" /><span>Save All</span></button></div>
</div>
