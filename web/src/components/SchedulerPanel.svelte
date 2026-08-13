<script lang="ts">
  import "./SchedulerPanel.css";

  import { onDestroy } from "svelte";
  import { ApiClient } from "../api/client";
  import type { ScheduleRecord, SchedulerConfigRecord } from "../models/workspace";
  import Icon from "./Icon.svelte";

  let { workspaceId, config, onChanged, onToast }: {
    workspaceId: string;
    config: SchedulerConfigRecord;
    onChanged: () => Promise<void>;
    onToast: (message: string) => void;
  } = $props();
  const client = new ApiClient();
  onDestroy(() => client.dispose());
  let editingId = $state("");
  let description = $state("");
  let condition = $state("");
  let target = $state("workspace");
  let interval = $state(30);
  let saving = $state(false);
  $effect(() => {
    interval = config.wakeIntervalMinutes;
  });

  function edit(schedule: ScheduleRecord): void {
    editingId = schedule.id;
    description = schedule.description;
    condition = schedule.condition;
    target = schedule.target;
  }

  function clearForm(): void {
    editingId = "";
    description = "";
    condition = "";
    target = "workspace";
  }

  async function saveSchedule(): Promise<void> {
    if (!description.trim() || !condition.trim() || !target.trim() || saving) return;
    saving = true;
    const wasEditing = Boolean(editingId);
    try {
      const path = `/api/workspaces/${encodeURIComponent(workspaceId)}/scheduler${editingId ? `/${encodeURIComponent(editingId)}` : ""}`;
      await client.request(path, {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify({ description, condition, target })
      });
      clearForm();
      await onChanged();
      onToast(wasEditing ? "Schedule updated." : "Schedule added.");
    } catch (reason) {
      onToast(reason instanceof Error ? reason.message : String(reason));
    } finally {
      saving = false;
    }
  }

  async function remove(schedule: ScheduleRecord): Promise<void> {
    if (!window.confirm(`Remove schedule ${schedule.id}?`)) return;
    try {
      await client.request(`/api/workspaces/${encodeURIComponent(workspaceId)}/scheduler/${encodeURIComponent(schedule.id)}`, { method: "DELETE" });
      if (editingId === schedule.id) clearForm();
      await onChanged();
      onToast("Schedule removed.");
    } catch (reason) {
      onToast(reason instanceof Error ? reason.message : String(reason));
    }
  }

  async function saveInterval(): Promise<void> {
    if (!Number.isInteger(interval) || interval < 1 || interval > 10080 || saving) return;
    saving = true;
    try {
      await client.request(`/api/workspaces/${encodeURIComponent(workspaceId)}/scheduler/settings`, {
        method: "PUT",
        body: JSON.stringify({ agentBinding: config.agentBinding, wakeIntervalMinutes: interval })
      });
      await onChanged();
      onToast("Scheduler interval saved.");
    } catch (reason) {
      onToast(reason instanceof Error ? reason.message : String(reason));
    } finally {
      saving = false;
    }
  }
</script>

<div class="scheduler-settings-card">
  <div><strong>Wake interval</strong><span>Minutes after the previous Server-triggered Scheduler Turn completes. Empty schedule lists do not wake.</span></div>
  <label><input type="number" min="1" max="10080" step="1" bind:value={interval} aria-label="Scheduler wake interval in minutes" /><span>minutes</span></label>
  <button type="button" class="secondary-button" disabled={saving || interval === config.wakeIntervalMinutes} onclick={saveInterval}><Icon name="save" /><span>Save</span></button>
</div>

<div class="schedule-editor">
  <div class="schedule-editor-heading"><div><strong>{editingId ? "Edit schedule" : "Add schedule"}</strong><span>Conditions are natural language interpreted by the Scheduler Agent.</span></div>{#if editingId}<button type="button" class="secondary-button" onclick={clearForm}>Cancel edit</button>{/if}</div>
  <label><span>Description</span><input bind:value={description} placeholder="What should the Scheduler understand?" /></label>
  <label><span>Condition</span><textarea bind:value={condition} rows="3" placeholder="For example: when the release branch is green after 09:00 Shanghai time"></textarea></label>
  <label><span>Target resource ID</span><input bind:value={target} placeholder="workspace, scheduler, project1, or project1.task1" /></label>
  <button type="button" class:busy={saving} class:editing={Boolean(editingId)} disabled={saving || !description.trim() || !condition.trim() || !target.trim()} onclick={saveSchedule}><span class="schedule-icon schedule-icon-busy"><Icon name="loader-circle" /></span><span class="schedule-icon schedule-icon-editing"><Icon name="save" /></span><span class="schedule-icon schedule-icon-add"><Icon name="plus" /></span><span>{editingId ? "Update schedule" : "Add schedule"}</span></button>
</div>

<div class="schedule-list">
  {#if config.schedules.length}
    {#each config.schedules as schedule (schedule.id)}
      <article class:editing={editingId === schedule.id}>
        <header><div><strong>{schedule.description}</strong><code>{schedule.id}</code></div><div><button type="button" class="secondary-button" onclick={() => edit(schedule)}><Icon name="pencil" /><span>Edit</span></button><button type="button" class="secondary-button danger" onclick={() => remove(schedule)}><Icon name="trash-2" /><span>Remove</span></button></div></header>
        <dl><div><dt>Condition</dt><dd>{schedule.condition}</dd></div><div><dt>Target</dt><dd><code>{schedule.target}</code></dd></div></dl>
      </article>
    {/each}
  {:else}
    <div class="empty-list-row"><Icon name="calendar-clock" /><span>No schedules. The Server will not create empty Scheduler Turns.</span></div>
  {/if}
</div>
