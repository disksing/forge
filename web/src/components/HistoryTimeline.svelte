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
  import { projectConversationEvents } from "./timeline-events";
  import ToolGroup from "./ToolGroup.svelte";
  import UnknownEvent from "./UnknownEvent.svelte";
  import type { ConversationBlock, FileTreeModel, TimelineItem, ChatContextSnapshot } from "./models";

  let { workspaceId, resourceId, artifacts = [], onOpenLegacy, onIconsChanged }: {
    workspaceId: string;
    resourceId: string;
    artifacts?: FileTreeModel[];
    onOpenLegacy: (path: string) => void;
    onIconsChanged: () => void;
  } = $props();

  let snapshot = $state<ChatContextSnapshot>(emptySnapshot());
  let controller: ChatSessionController | undefined;
  let notice = $state("");
  let openTools = $state(new Map<string, boolean>());
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
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
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

  function loadTurn(block: ConversationBlock): void {
    if (block.kind === "turn" && block.turn?.reference) void controller?.loadTurn(block.turn.reference);
  }

  function blockLoaded(block: ConversationBlock): boolean {
    return Boolean(block.items || block.events);
  }

  // Expanded Turns render through the same item components as the live Chat
  // timeline so History stays readable instead of dumping raw text rows.
  function blockItems(block: ConversationBlock): TimelineItem[] {
    return block.events ? projectConversationEvents(block.events) : block.items || [];
  }

  function timelineKey(item: TimelineItem): string {
    return `${item.generationId || snapshot.generationId}:${item.kind}:${String(item.key ?? item.approvalId ?? item.time ?? item.type ?? "event")}`;
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
    {#each snapshot.blocks as block, index (block.key)}
      {#if index === 0 || snapshot.blocks[index - 1].generation.generationId !== block.generation.generationId}
        <div class="history-generation" data-generation-id={block.generation.generationId}>
          <div><span>Generation {block.generation.generation}</span><strong>{valueOrUnknown(block.generation.agentName, "agent")}</strong></div>
          <div class="history-generation-meta"><span>Provider: {valueOrUnknown(block.generation.provider || block.generation.providerId, "provider")}</span><span>Model: {valueOrUnknown(block.generation.model, "model")}</span><span>Status: {block.generation.status || "unknown"}</span></div>
        </div>
      {/if}
      {#if block.kind === "gap"}
        <div class="history-gap" data-timeline-key={block.key}><Icon name="triangle-alert" /><span><strong>History gap</strong><small>{block.gap?.message || "This generation could not be read."}</small></span>{#if block.gap?.retryable}<button type="button" class="secondary-button" onclick={() => controller?.retryHistory()}>Retry</button>{/if}</div>
      {:else if block.turn}
        <section class="history-turn" class:history-turn-loading={block.loading} data-timeline-key={turnKey(block)}>
          <button type="button" class="history-turn-header" onclick={() => loadTurn(block)} aria-expanded={blockLoaded(block)}>
            <span class="history-turn-title"><strong>Turn</strong><small>{formatTime(block.turn.startedAt)} · {formatDuration(block.turn.durationMs)} · {block.turn.status || "unknown"}</small></span>
            <span class="history-turn-preview">{block.turn.finalReplyPreview || block.turn.triggerPreview || "Select to load conversation detail"}</span>
            <span class="history-turn-count">{block.turn.eventCount} events · {block.turn.toolEventCount} tools <Icon name={blockLoaded(block) ? "chevron-up" : "chevron-down"} /></span>
          </button>
          {#if block.loading}<div class="history-detail-state"><Icon name="loader-circle" className="spin" />Loading Turn detail...</div>{/if}
          {#if block.error}<div class="history-detail-state history-error"><Icon name="triangle-alert" />{block.error}</div>{/if}
          {#if blockLoaded(block)}
            <div class="history-items">
              {#each blockItems(block) as item (timelineKey(item))}
                <div class="history-item" data-history-kind={item.kind}>
                  {#if item.kind === "message"}
                    <TimelineMessage {item} agentName={block.generation.agentName || block.generation.resolvedProfile || block.generation.binding?.name || "Agent"} />
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
  {/if}
</div>
