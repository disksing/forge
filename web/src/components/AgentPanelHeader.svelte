<script lang="ts">
  import "./AgentPanelHeader.css";

  import { onMount } from "svelte";

  import type { ModelChannel } from "./model-channel";
  import type { AgentPanelHeaderModel } from "../models/chat";

  let { channel }: { channel: ModelChannel<AgentPanelHeaderModel> } = $props();
  // svelte-ignore state_referenced_locally
  let model = $state(channel.current());
  let now = $state(Date.now());

  onMount(() => channel.subscribe((next) => {
    model = next;
  }));

  const stateKey = $derived(!model.resourceId ? "empty" : model.submitting ? "submitting" : model.status?.sessionState || "loading");
  const stateLabel = $derived(stateKey === "submitting" ? "Submitting"
    : stateKey === "working" ? "Working"
    : stateKey === "idle" ? "Idle"
    : stateKey === "attention_required" ? "Attention required"
    : stateKey === "unavailable" ? "Unavailable"
    : stateKey === "archived" ? "Archived"
    : stateKey === "loading" ? "Loading"
    : "No resource selected");
  const queuedCount = $derived(model.status?.waitingMessages?.length || 0);
  const turnStart = $derived(Date.parse(model.turnStartedAt || ""));
  const timerActive = $derived(stateKey === "working" && Number.isFinite(turnStart));

  // Live elapsed clock for the running turn; ticks once per second while working.
  $effect(() => {
    if (!timerActive) return;
    now = Date.now();
    const interval = window.setInterval(() => { now = Date.now(); }, 1000);
    return () => window.clearInterval(interval);
  });

  function formatElapsed(totalSeconds: number): string {
    const seconds = Math.max(0, totalSeconds);
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const pad = (value: number) => String(value).padStart(2, "0");
    return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  }

  function completionLabel(value: string): string {
    switch (value) {
      case "cancelled":
      case "canceled":
        return "cancelled";
      case "interrupted":
        return "interrupted";
      case "failed":
        return "failed";
      default:
        return "completed";
    }
  }

  const turnText = $derived.by(() => {
    const turn = model.turnNumber;
    if (stateKey === "submitting") return "Message pending";
    if (stateKey === "idle") {
      if (turn <= 0) return "";
      const state = String(model.status?.generation?.completionState || "").trim().toLowerCase();
      const label = completionLabel(state);
      const noReply = label !== "completed" && model.status?.generation?.completionHasFinalReply === false ? " · no final reply" : "";
      return `Idle · Turn ${turn} ${label}${noReply}`;
    }
    if (stateKey === "empty" || stateKey === "loading") return "";
    if (Number.isFinite(turnStart)) {
      const elapsed = formatElapsed(Math.floor((now - turnStart) / 1000));
      return turn > 0 ? `Turn ${turn} · ${elapsed}` : elapsed;
    }
    return turn > 0 ? `Turn ${turn}` : "";
  });
</script>

<header class="agent-panel-header" data-component-owner="agent-panel-header" data-state={stateKey}>
  <div class="agent-header-left">
    <span class="agent-status-dot" aria-hidden="true"></span>
    <span class="agent-header-name">{model.agentName}</span>
    <span class="agent-header-state">{stateLabel}</span>
    {#if queuedCount > 0}<span class="agent-header-queued">· {queuedCount} queued</span>{/if}
  </div>
  <div class="agent-header-right">
    {#if model.modelSummary}<span class="agent-header-model">{model.modelSummary}</span>{/if}
    {#if turnText}<span class="agent-header-turn">{turnText}</span>{/if}
  </div>
</header>
