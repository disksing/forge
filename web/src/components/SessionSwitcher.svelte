<script lang="ts">
  import "./SessionSwitcher.css";

  import { onMount } from "svelte";

  import type { ModelChannel } from "./model-channel";
  import Icon from "./Icon.svelte";
  import type { AgentRun, SessionSwitcherModel } from "./models";

  let { channel }: { channel: ModelChannel<SessionSwitcherModel> } = $props();
  // svelte-ignore state_referenced_locally
  let model = $state(channel.current());
  let open = $state(false);
  let pendingRunId = $state("");
  let error = $state("");
  const activeRun = $derived(model.runs.find((run) => run.id === model.activeRunId) ?? model.runs[0] ?? null);

  onMount(() => {
    const unsubscribe = channel.subscribe((next) => {
      const contextChanged = next.identity !== model.identity;
      model = next;
      if (contextChanged) {
        open = false;
        pendingRunId = "";
        error = "";
      }
      queueMicrotask(next.onIconsChanged);
    });
    const outside = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      if (open && !target?.closest(".agent-session-switcher")) open = false;
    };
    document.addEventListener("click", outside);
    return () => {
      unsubscribe();
      document.removeEventListener("click", outside);
    };
  });

  async function select(runId: string): Promise<void> {
    if (!runId || pendingRunId || runId === model.activeRunId) {
      if (runId === model.activeRunId) open = !open;
      return;
    }
    pendingRunId = runId;
    error = "";
    open = false;
    try {
      await model.onSelect(runId);
    } catch (reason) {
      error = reason instanceof Error ? reason.message : String(reason);
      model.onToast(error);
    } finally {
      pendingRunId = "";
    }
  }

  function statusTone(status = ""): string {
    if (["starting", "running"].includes(status)) return "running";
    if (["waiting_approval", "stopping", "recovering"].includes(status)) return "attention";
    if (status === "completed") return "done";
    if (status === "failed") return "danger";
    return "muted";
  }

  function relativeTime(value?: string): string {
    const time = new Date(value || "").getTime();
    if (!Number.isFinite(time)) return "";
    const seconds = Math.max(0, Math.round((Date.now() - time) / 1000));
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.round(hours / 24)}d ago`;
  }

  function title(run: AgentRun): string {
    return run.title || run.id;
  }
</script>

<div id="agentSessions" class="agent-session-switcher" data-session-context={model.identity}>
  {#if activeRun}
    <div class="agent-current-session">
      <button type="button" class="agent-current-run active" data-agent-run={activeRun.id} aria-expanded={open} title="Switch session" onclick={(event) => { event.stopPropagation(); open = !open; }}>
        <span>
          <strong>{title(activeRun)}</strong>
          <small>
            <span class={`run-badge run-badge-${statusTone(activeRun.status)}`}><span class:run-badge-pulse={["running", "attention"].includes(statusTone(activeRun.status))} class="run-badge-dot"></span>{(activeRun.status || "unknown").replaceAll("_", " ")}</span>
            <span class="run-badge-time">{relativeTime(activeRun.updatedAt)}</span>
          </small>
        </span>
        <Icon name={pendingRunId ? "loader-circle" : "chevrons-up-down"} className="session-select-icon" />
      </button>
    </div>
    {#if open}
      <div class="agent-session-menu">
        {#each model.runs as run (run.id)}
          <button type="button" class:active={model.activeRunId === run.id} class="agent-session-menu-row" data-agent-run={run.id} disabled={Boolean(pendingRunId)} onclick={() => select(run.id)}>
            <span>
              <strong>{title(run)}</strong>
              <small>
                <span class={`run-badge run-badge-${statusTone(run.status)}`}><span class:run-badge-pulse={["running", "attention"].includes(statusTone(run.status))} class="run-badge-dot"></span>{(run.status || "unknown").replaceAll("_", " ")}</span>
                <span class="run-badge-time">{relativeTime(run.updatedAt)}</span>
              </small>
            </span>
          </button>
        {/each}
      </div>
    {/if}
  {:else}
    <div class="session-pill"><strong>No sessions yet</strong><span>Start an agent session from the selected task.</span></div>
  {/if}
  {#if error}<div class="agent-session-error" role="alert">{error}</div>{/if}
</div>
