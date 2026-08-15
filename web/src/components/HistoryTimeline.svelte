<script lang="ts">
  import "./HistoryTimeline.css";

  import { onMount } from "svelte";

  import ApprovalCard from "./ApprovalCard.svelte";
  import { ChatSessionController } from "./chat-state";
  import Icon from "./Icon.svelte";
  import LifecycleNotice from "./LifecycleNotice.svelte";
  import ThinkingBlock from "./ThinkingBlock.svelte";
  import TimelineMessage from "./TimelineMessage.svelte";
  import TimelineNotice from "./TimelineNotice.svelte";
  import { toolGroupKey } from "./tool-group";
  import { markTurnAgentRuns, markTurnFinalAssistant, projectConversationEvents } from "./timeline-events";
  import ToolGroup from "./ToolGroup.svelte";
  import UnknownEvent from "./UnknownEvent.svelte";
  import type { ConversationBlock, FileTreeModel, TimelineItem, ChatContextSnapshot } from "./models";
  import type { ResourceTitleResolver } from "./markdown";

  let { workspaceId, resourceId, artifacts = [], resolveResourceTitle, onNavigate, onOpenFile, onOpenLegacy, onIconsChanged }: {
    workspaceId: string;
    resourceId: string;
    artifacts?: FileTreeModel[];
    resolveResourceTitle: ResourceTitleResolver;
    onNavigate: (resourceId: string) => void;
    onOpenFile: (path: string) => void;
    onOpenLegacy: (path: string) => void;
    onIconsChanged: () => void;
  } = $props();

  let snapshot = $state<ChatContextSnapshot>(emptySnapshot());
  let controller: ChatSessionController | undefined;
  let notice = $state("");
  let openTools = $state(new Map<string, boolean>());
  let expandedTurns = $state(new Set<string>());
  const legacyArtifact = $derived(findArtifact(artifacts, "legacy-log.md"));

  onMount(() => {
    controller = new ChatSessionController({ realtime: false });
    const unsubscribe = controller.subscribe((next) => {
      snapshot = next;
      queueMicrotask(onIconsChanged);
    });
    controller.activate(workspaceId, resourceId, null);
    return () => {
      unsubscribe();
      controller?.dispose();
      controller = undefined;
    };
  });

  function emptySnapshot(): ChatContextSnapshot {
    return { identity: "", workspaceId: "", resourceId: "", generationId: "", blocks: [], notices: [], hasMoreBefore: false, loading: false, loadingOlder: false, loaded: false, error: "" };
  }

  function findArtifact(entries: FileTreeModel[], name: string): string {
    for (const entry of entries || []) {
      if (entry.type === "file" && entry.name === name) return entry.path;
      const nested = findArtifact(entry.children || [], name);
      if (nested) return nested;
    }
    return "";
  }

  function formatTime(value?: string): string {
    if (!value) return "Unknown time";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString(undefined, { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  }

  function formatDuration(milliseconds?: number): string {
    const seconds = Math.max(0, Math.round(Number(milliseconds || 0) / 1000));
    if (!seconds) return "<1s";
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  }

  function valueOrUnknown(value: string | undefined, label: string): string {
    return value?.trim() || `Unknown ${label}`;
  }

  type StatusTone = "completed" | "active" | "cancelled" | "failed" | "neutral";

  const ACTIVE_STATUSES = new Set(["starting", "running", "waiting_approval", "stopping", "recovering", "active"]);
  const CANCELLED_STATUSES = new Set(["cancelled", "canceled", "interrupted"]);

  function statusTone(status?: string): StatusTone {
    const normalized = (status || "").trim().toLowerCase();
    if (normalized === "completed" || normalized === "stopped") return "completed";
    if (ACTIVE_STATUSES.has(normalized)) return "active";
    if (CANCELLED_STATUSES.has(normalized)) return "cancelled";
    if (normalized === "failed") return "failed";
    return "neutral";
  }

  function loadTurn(block: ConversationBlock): void {
    if (block.kind === "turn" && block.turn?.reference) void controller?.loadTurn(block.turn.reference);
  }

  function blockLoaded(block: ConversationBlock): boolean {
    return Boolean(block.items || block.events);
  }

  // Toggle the expanded conversation detail: the first click expands and
  // loads the Turn, the next click collapses it again without dropping the
  // already-loaded detail so reopening is instant.
  function isTurnExpanded(block: ConversationBlock): boolean {
    return expandedTurns.has(turnKey(block)) && blockLoaded(block);
  }

  function toggleTurn(block: ConversationBlock): void {
    const key = turnKey(block);
    if (expandedTurns.has(key)) {
      const next = new Set(expandedTurns);
      next.delete(key);
      expandedTurns = next;
      return;
    }
    expandedTurns = new Set(expandedTurns).add(key);
    loadTurn(block);
  }

  // Expanded Turns render through the same item components as the live Chat
  // timeline so History stays readable instead of dumping raw text rows.
  function blockItems(block: ConversationBlock): TimelineItem[] {
    const items = block.events
      ? projectConversationEvents(block.events).map((item) => ({ ...item, generationId: block.generation.generationId }))
      : block.items || [];
    return markTurnAgentRuns(markTurnFinalAssistant(items));
  }

  function blockAgentName(block: ConversationBlock): string {
    return block.generation.agentName || block.generation.resolvedProfile || block.generation.binding?.name || "Agent";
  }

  function timelineKey(item: TimelineItem): string {
    const key = item.kind === "tools" ? toolGroupKey(item) : String(item.key ?? item.approvalId ?? item.time ?? item.type ?? "event");
    return `${item.generationId || snapshot.generationId}:${item.kind}:${key}`;
  }

  function toolOpen(item: TimelineItem): boolean {
    return openTools.get(timelineKey(item)) ?? false;
  }

  function rememberToolOpen(item: TimelineItem, open: boolean): void {
    openTools = new Map(openTools).set(timelineKey(item), open);
    if (open) void expandCompact(item);
  }

  function expandCompact(item: TimelineItem): Promise<void> | undefined {
    if (!item.compact || !item.generationId || !item.rangeStartEventId || !item.rangeEndEventId) return;
    return controller?.expandRange(item.generationId, item.rangeStartEventId, item.rangeEndEventId);
  }

  function readOnlyApproval(): Promise<void> {
    return Promise.reject(new Error("This is a read-only History view. Answer pending approvals from the Chat tab."));
  }

  function turnKey(block: ConversationBlock): string {
    return block.turn?.reference || block.key;
  }

  function turnHasNoFinalReply(block: ConversationBlock): boolean {
    const turn = block.turn;
    if (!turn) return false;
    const status = (turn.status || "").toLowerCase();
    return ["cancelled", "canceled", "interrupted", "failed"].includes(status) && !turn.finalReplyPreview?.trim();
  }

  function turnStatusText(block: ConversationBlock): string {
    const turn = block.turn;
    if (!turn) return "unknown";
    const status = turn.status || "unknown";
    return turnHasNoFinalReply(block) ? `${status} · no final reply` : status;
  }

  function turnTriggerText(block: ConversationBlock): string {
    return block.turn?.triggerPreview?.trim() || "";
  }

  function turnPreviewText(block: ConversationBlock): string {
    if (turnHasNoFinalReply(block)) return "No final reply";
    return block.turn?.finalReplyPreview?.trim() || "Select to load conversation detail";
  }

  interface GenerationGroup {
    generation: ConversationBlock["generation"];
    blocks: ConversationBlock[];
  }

  const generationGroups = $derived(groupByGeneration(snapshot.blocks));

  // Blocks arrive ordered; consecutive blocks sharing a generation render as
  // one labeled section with a single timeline track.
  function groupByGeneration(blocks: ConversationBlock[]): GenerationGroup[] {
    const groups: GenerationGroup[] = [];
    for (const block of blocks) {
      const last = groups[groups.length - 1];
      if (last && last.generation.generationId === block.generation.generationId) last.blocks.push(block);
      else groups.push({ generation: block.generation, blocks: [block] });
    }
    return groups;
  }
</script>

<div data-component-owner="history-timeline" class="history-timeline-root">
  {#if snapshot.loading && !snapshot.loaded}
    <div class="history-state"><Icon name="loader-circle" className="spin" /><span>Loading resource History...</span></div>
  {:else if snapshot.error && !snapshot.loaded}
    <div class="history-state history-error"><Icon name="triangle-alert" /><strong>History unavailable</strong><span>{snapshot.error}</span><button type="button" class="secondary-button" onclick={() => controller?.retryHistory()}>Retry</button></div>
  {:else}
    {#if snapshot.hasMoreBefore}<button type="button" class="secondary-button history-load-older" disabled={snapshot.loadingOlder} onclick={() => controller?.loadOlder()}><Icon name="chevrons-up" />{snapshot.loadingOlder ? "Loading older History..." : "Load older History"}</button>{/if}
    {#if notice}<TimelineNotice title="History" text={notice} error />{/if}
    {#if snapshot.loaded && !snapshot.blocks.length && legacyArtifact}
      <div class="history-legacy"><Icon name="archive-restore" /><span><strong>Legacy history</strong><small>Conversation history from before resource History was available was migrated to Artifacts.</small></span><button type="button" class="secondary-button" onclick={() => onOpenLegacy(legacyArtifact)}>Open legacy history</button></div>
    {:else if snapshot.loaded && !snapshot.blocks.length}
      <div class="history-state"><Icon name="history" /><span>No resource History yet.</span></div>
    {/if}
    {#each generationGroups as group (group.generation.generationId)}
      <div class="history-generation" data-generation-id={group.generation.generationId}>
        <span class="history-generation-label">Generation {group.generation.generation}</span>
        <strong>{valueOrUnknown(group.generation.agentName, "agent")}</strong>
        <span class="history-generation-meta">
          <span>{valueOrUnknown(group.generation.provider || group.generation.providerId, "provider")}</span>
          <span>{valueOrUnknown(group.generation.model, "model")}</span>
          <span class="history-status-pill" data-tone={statusTone(group.generation.status)}>{group.generation.status || "unknown"}</span>
        </span>
      </div>
      <div class="history-track">
        {#each group.blocks as block (block.key)}
          {#if block.kind === "gap"}
            <div class="history-gap" data-timeline-key={block.key}><Icon name="triangle-alert" /><span><strong>History gap</strong> — {block.gap?.message || "This generation could not be read."}</span>{#if block.gap?.retryable}<button type="button" class="secondary-button" onclick={() => controller?.retryHistory()}>Retry</button>{/if}</div>
          {:else if block.turn}
            <section class="history-turn" class:history-turn-loading={block.loading} data-timeline-key={turnKey(block)}>
              <span class="history-turn-dot" data-tone={statusTone(block.turn.status)}></span>
              <button type="button" class="history-turn-header" onclick={() => toggleTurn(block)} aria-expanded={isTurnExpanded(block)}>
                <span class="history-turn-meta">
                  <span class="history-turn-time">{formatTime(block.turn.startedAt)}</span>
                  <span class="history-status-pill" data-tone={statusTone(block.turn.status)}>{turnStatusText(block)}</span>
                  <span class="history-turn-duration">{formatDuration(block.turn.durationMs)}</span>
                  <span class="history-turn-count">{block.turn.eventCount} events · {block.turn.toolEventCount} tools <span class="history-turn-chevron" class:expanded={isTurnExpanded(block)}><Icon name="chevron-down" /></span></span>
                </span>
                {#if turnTriggerText(block)}
                  <span class="history-turn-trigger"><span class="history-turn-trigger-label">Trigger</span><span class="history-turn-trigger-text">{turnTriggerText(block)}</span></span>
                {/if}
                <span class="history-turn-preview" class:history-turn-preview-empty={turnHasNoFinalReply(block)}>{turnPreviewText(block)}</span>
              </button>
              {#if block.loading}<div class="history-detail-state"><Icon name="loader-circle" className="spin" />Loading Turn detail...</div>{/if}
              {#if block.error}<div class="history-detail-state history-error"><Icon name="triangle-alert" />{block.error}</div>{/if}
              {#if isTurnExpanded(block)}
                <div class="history-items">
                  {#each blockItems(block) as item (timelineKey(item))}
                    <div class="history-item" data-history-kind={item.kind}>
                      {#if item.agentStart && item.kind !== "message"}
                        <div data-component-owner="event-timeline" class="agent-run-header"><strong>{blockAgentName(block)}</strong></div>
                      {/if}
                      {#if item.kind === "message"}
                        <TimelineMessage {item} agentName={blockAgentName(block)} {workspaceId} {resolveResourceTitle} {onNavigate} {onOpenFile} />
                      {:else if item.kind === "thinking"}
                        <ThinkingBlock {item} onExpand={() => expandCompact(item)} />
                      {:else if item.kind === "tools"}
                        <ToolGroup {item} generationId={block.generation.generationId} open={toolOpen(item)} onToggle={(open) => rememberToolOpen(item, open)} />
                      {:else if item.kind === "approval"}
                        <ApprovalCard {item} generationId={block.generation.generationId} contextIdentity={snapshot.identity} onApproval={readOnlyApproval} onToast={(message) => (notice = message)} />
                      {:else if item.kind === "lifecycle"}
                        <LifecycleNotice {item} />
                      {:else if item.kind === "error"}
                        <TimelineNotice title="Provider error" text={item.text || ""} error />
                      {:else}
                        <UnknownEvent {item} />
                      {/if}
                    </div>
                  {/each}
                </div>
              {/if}
            </section>
          {/if}
        {/each}
      </div>
    {/each}
  {/if}
</div>
