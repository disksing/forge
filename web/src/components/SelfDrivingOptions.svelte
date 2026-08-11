<script lang="ts">
  import "./SelfDrivingOptions.css";

  import type { AgentOption, CreateDraft } from "./models";

  let { draft, agents, profileKeys, onChange }: {
    draft: CreateDraft;
    agents: AgentOption[];
    profileKeys: string[];
    onChange: () => void;
  } = $props();
  // svelte-ignore state_referenced_locally
  let enabled = $state(draft.selfDriving);

  function updateSelfDriving(event: Event): void {
    enabled = (event.currentTarget as HTMLInputElement).checked;
    draft.selfDriving = enabled;
    onChange();
  }

  function update(field: "agentName" | "prompt" | "agentProfiles" | "completionCriteria", value: string): void {
    draft[field] = value;
    onChange();
  }
</script>

<section class="self-driving-options create-section" aria-label="Automation" data-component-owner="self-driving-options">
  <div class="create-section-title">Automation</div>
  <label class="create-task-automation-toggle"><input name="selfDriving" type="checkbox" checked={enabled} onchange={updateSelfDriving} /><span><strong>Enable Self-Driving</strong><small>Persist the Task-level desired state and let the Scheduler reconcile one autonomous Turn at a time.</small></span></label>
  {#if enabled}
    <div class="create-task-automation-fields">
      <label><span>Agent <small>(optional)</small></span><select name="agentName" value={draft.agentName} onchange={(event) => update("agentName", event.currentTarget.value)}><option value="">Workspace default</option>{#each agents as agent (agent.id)}<option value={agent.id}>{agent.label} — {agent.summary}</option>{/each}</select></label>
      <label><span>Run instructions</span><textarea name="prompt" value={draft.prompt} placeholder="Instructions for the automated run" oninput={(event) => update("prompt", event.currentTarget.value)}></textarea></label>
      <label><span>Preferred Agent Profiles</span><input name="agentProfiles" value={draft.agentProfiles} placeholder="Workspace default, or kimi, codex" oninput={(event) => update("agentProfiles", event.currentTarget.value)} /><small>{profileKeys.length ? `Available: ${profileKeys.join(", ")}` : "No Profiles configured; the workspace default will be used."}</small></label>
      <label><span>Completion criteria</span><textarea name="completionCriteria" value={draft.completionCriteria} placeholder="Natural-language completion criteria" oninput={(event) => update("completionCriteria", event.currentTarget.value)}></textarea></label>
    </div>
  {/if}
</section>
