<script lang="ts">
  import "./ResourceSettingsPanel.css";

  import { ApiClient } from "../api/client";
  import type { ResourceAgentBindingModel } from "../models/detail";
  import AgentBindingSelector from "./AgentBindingSelector.svelte";
  import Icon from "./Icon.svelte";
  import type { DetailPanelModel } from "./models";

  let { model }: { model: DetailPanelModel } = $props();

  const client = new ApiClient();

  let pending = $state("");
  let interval = $state(30);
  $effect(() => {
    const wake = model.detail?.scheduler?.wakeIntervalMinutes;
    if (typeof wake === "number") interval = wake;
  });

  const schedulerConfig = $derived(model.detail?.scheduler);
  const taskDefault = $derived<ResourceAgentBindingModel>(model.detail?.taskDefault?.name ? { kind: model.detail.taskDefault.kind, name: model.detail.taskDefault.name } : { kind: "profile", name: "" });

  async function run(key: string, action: () => Promise<void>): Promise<void> {
    if (pending) return;
    pending = key;
    try {
      await action();
    } catch (reason) {
      model.onToast(reason instanceof Error ? reason.message : String(reason));
    } finally {
      pending = "";
    }
  }

  function saveOwnBinding(binding: ResourceAgentBindingModel): void {
    void run("binding", () => model.onSaveAgentBinding(binding));
  }

  function saveWorkspaceDefault(kind: "project" | "task", binding: ResourceAgentBindingModel): void {
    const defaults = { ...model.workspaceDefaults, [kind]: binding };
    void run(`default:${kind}`, () => model.onSaveWorkspaceDefaults(defaults));
  }

  function saveTaskDefault(binding: ResourceAgentBindingModel): void {
    void run("taskDefault", () => model.onSaveTaskDefault(model.resourceId, binding.name ? binding : null));
  }

  function saveSchedulerInterval(): void {
    const config = schedulerConfig;
    if (!config || !Number.isInteger(interval) || interval < 1 || interval > 10080) return;
    void run("interval", async () => {
      await client.request(`/api/workspaces/${encodeURIComponent(model.workspaceId)}/scheduler/settings`, {
        method: "PUT",
        body: JSON.stringify({ agentBinding: config.agentBinding, wakeIntervalMinutes: interval }),
      });
      await model.onRefreshScheduler?.();
      model.onToast("Scheduler interval saved.");
    });
  }
</script>

<div class="resource-settings" data-component-owner="resource-settings-panel">
  {#if model.resourceType === "workspace"}
    <section class="resource-settings-card">
      <div><strong>Workspace Agent</strong><span>Runs the Workspace Agent itself. Matches the selector in the chat composer.</span></div>
      <AgentBindingSelector value={model.agentBinding} profiles={model.agentProfiles} agents={model.agents} disabled={Boolean(pending)} openUp={false} ariaLabel="Workspace Agent binding" onSelect={saveOwnBinding} />
    </section>
    <section class="resource-settings-card">
      <div><strong>New Project default</strong><span>Applied once when a Project is created in this Workspace.</span></div>
      <AgentBindingSelector value={model.workspaceDefaults.project} profiles={model.agentProfiles} agents={model.agents} disabled={Boolean(pending)} openUp={false} ariaLabel="New Project default binding" onSelect={(value) => saveWorkspaceDefault("project", value)} />
    </section>
    <section class="resource-settings-card">
      <div><strong>New Task default</strong><span>Applied once when a Task is created, unless its Project overrides it.</span></div>
      <AgentBindingSelector value={model.workspaceDefaults.task} profiles={model.agentProfiles} agents={model.agents} disabled={Boolean(pending)} openUp={false} ariaLabel="New Task default binding" onSelect={(value) => saveWorkspaceDefault("task", value)} />
    </section>
  {:else if model.resourceType === "scheduler"}
    <section class="resource-settings-card">
      <div><strong>Scheduler Agent</strong><span>Runs Scheduler wake-up Turns. Matches the selector in the chat composer.</span></div>
      <AgentBindingSelector value={model.agentBinding} profiles={model.agentProfiles} agents={model.agents} disabled={Boolean(pending)} openUp={false} ariaLabel="Scheduler Agent binding" onSelect={saveOwnBinding} />
    </section>
    {#if schedulerConfig}
      <section class="resource-settings-card">
        <div><strong>Wake interval</strong><span>Minutes after the previous Server-triggered Scheduler Turn completes. Empty schedule lists do not wake.</span></div>
        <div class="resource-settings-interval">
          <label><input type="number" min="1" max="10080" step="1" bind:value={interval} aria-label="Scheduler wake interval in minutes" /><span>minutes</span></label>
          <button type="button" class="secondary-button" disabled={Boolean(pending) || interval === schedulerConfig.wakeIntervalMinutes} onclick={saveSchedulerInterval}><Icon name="save" /><span>Save</span></button>
        </div>
      </section>
    {/if}
  {:else if model.resourceType === "project"}
    <section class="resource-settings-card">
      <div><strong>Project Agent</strong><span>Runs the Project Agent itself. Matches the selector in the chat composer.</span></div>
      <AgentBindingSelector value={model.agentBinding} profiles={model.agentProfiles} agents={model.agents} disabled={Boolean(pending)} openUp={false} ariaLabel="Project Agent binding" onSelect={saveOwnBinding} />
    </section>
    <section class="resource-settings-card">
      <div><strong>New Task default</strong><span>Applied once when a Task is created in this Project. Inherit uses the Workspace default.</span></div>
      <AgentBindingSelector value={taskDefault} profiles={model.agentProfiles} agents={model.agents} disabled={Boolean(pending)} openUp={false} allowInherit={true} inheritLabel="Inherit (Workspace default)" ariaLabel="New Task default binding" onSelect={saveTaskDefault} />
    </section>
  {:else if model.resourceType === "task"}
    <section class="resource-settings-card">
      <div><strong>Task Agent</strong><span>Runs the Task Agent itself. Matches the selector in the chat composer.</span></div>
      <AgentBindingSelector value={model.agentBinding} profiles={model.agentProfiles} agents={model.agents} disabled={Boolean(pending)} openUp={false} ariaLabel="Task Agent binding" onSelect={saveOwnBinding} />
    </section>
  {/if}
</div>
