<script lang="ts">
  import "./EventTimeline.css";

  import { onDestroy, onMount, tick } from "svelte";

  import { ApiClient } from "../api/client";
  import ApprovalCard from "./ApprovalCard.svelte";
  import { ChatSessionController } from "./chat-state";
  import { effectiveGenerationStatus } from "./generation-status";
  import FilePreviewModal from "./FilePreviewModal.svelte";
  import LifecycleNotice from "./LifecycleNotice.svelte";
  import type { ModelChannel } from "./model-channel";
  import Icon from "./Icon.svelte";
  import type { ChatContextSnapshot, ConversationBlock, EventTimelineModel, FilePreviewModel, TimelineItem } from "./models";
  import ThinkingBlock from "./ThinkingBlock.svelte";
  import TimelineMessage from "./TimelineMessage.svelte";
  import TimelineNotice from "./TimelineNotice.svelte";
  import { formatClock, markTurnAgentRuns, markTurnFinalAssistant } from "./timeline-events";
  import { toolGroupKey } from "./tool-group";
  import ToolGroup from "./ToolGroup.svelte";
  import UnknownEvent from "./UnknownEvent.svelte";

  let { channel }: { channel: ModelChannel<EventTimelineModel> } = $props();
  // svelte-ignore state_referenced_locally
  let model = $state(channel.current());
  // svelte-ignore state_referenced_locally
  let projector = $state(channel.current().project);
  let snapshot = $state<ChatContextSnapshot>(emptySnapshot());
  let root: HTMLDivElement | undefined = $state();
  let controller: ChatSessionController | undefined;
  let deferredSnapshot: ChatContextSnapshot | null = null;
  let followAfterUpdate = false;
  let contextChanged = false;
  // Sticky pinned-to-bottom state. Transient layout changes outside the
  // scroller (composer send feedback, growing textarea, message queue) shrink
  // its clientHeight without firing a scroll event, so an instantaneous
  // isNearBottom probe at update time would falsely report that the user
  // scrolled away and permanently drop follow. Only user scrolls may change
  // this flag; layout shifts re-pin through the ResizeObserver below.
  let follow = true;
  let preview = $state<{ section: string; path: string } | null>(null);
  const client = new ApiClient();
  const openCache = new Map<string, Map<string, boolean>>();
  let openTools = $state(new Map<string, boolean>());

  onMount(() => {
    const scroll = scroller();
    const trackFollow = () => { follow = isNearBottom(scroller()); };
    scroll?.addEventListener("scroll", trackFollow, { passive: true });
    const followResize = typeof ResizeObserver === "undefined" || !scroll ? null : new ResizeObserver(() => {
      if (follow && !hasActiveSelection()) scrollToBottom();
    });
    if (scroll && followResize) followResize.observe(scroll);
    controller = new ChatSessionController({
      onEvent: (workspaceId, resourceId, event) => model.onEvent(workspaceId, resourceId, event),
      onNotice: (workspaceId, resourceId, notice) => model.onNotice(workspaceId, resourceId, notice),
    });
    const unsubscribeSnapshot = controller.subscribe(receive);
    const unsubscribeModel = channel.subscribe((next) => {
      const previousIdentity = model.identity;
      const workingChanged = turnIsWorking(model.status) !== turnIsWorking(next.status);
      const followWorkingChange = workingChanged && follow;
      model = next;
      if (next.project !== projector) projector = next.project;
      if (next.identity !== previousIdentity) {
        contextChanged = true;
        deferredSnapshot = null;
        preview = null;
        openTools = new Map(openCache.get(next.identity) ?? []);
      }
      controller?.activate(next.workspaceId, next.resourceId, next.status);
      void tick().then(() => {
        if (followWorkingChange && !hasActiveSelection()) scrollToBottom();
        next.onIconsChanged();
      });
    });
    const selectionChanged = () => {
      if (!deferredSnapshot || hasActiveSelection()) return;
      const next = deferredSnapshot;
      deferredSnapshot = null;
      applySnapshot(next);
    };
    const keydown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || !preview) return;
      event.preventDefault();
      preview = null;
    };
    document.addEventListener("selectionchange", selectionChanged);
    document.addEventListener("keydown", keydown);
    return () => {
      unsubscribeSnapshot();
      unsubscribeModel();
      document.removeEventListener("selectionchange", selectionChanged);
      document.removeEventListener("keydown", keydown);
      scroll?.removeEventListener("scroll", trackFollow);
      followResize?.disconnect();
      controller?.dispose();
      controller = undefined;
      if (scroll) scroll.removeAttribute("data-agent-resource-id");
    };
  });

  onDestroy(() => client.dispose());

  function receive(next: ChatContextSnapshot): void {
    if (snapshot.identity && next.identity === snapshot.identity && hasActiveSelection()) {
      deferredSnapshot = next;
      return;
    }
    applySnapshot(next);
  }

  function applySnapshot(next: ChatContextSnapshot): void {
    const scroll = scroller();
    const changed = next.identity !== snapshot.identity;
    if (changed || contextChanged) follow = true;
    followAfterUpdate = follow;
    contextChanged = false;
    snapshot = next;
    if (scroll) scroll.dataset.agentResourceId = next.resourceId;
    void tick().then(() => {
      if (followAfterUpdate && !hasActiveSelection()) scrollToBottom();
      model.onIconsChanged();
      if (next.loaded && next.hasMoreBefore) void autoFill(next.identity);
    });
  }

  function observeTurn(node: HTMLElement, reference: string) {
    let current = reference;
    if (typeof IntersectionObserver === "undefined") {
      if (current) void controller?.loadTurn(current);
      return { update(next: string) { current = next; if (current) void controller?.loadTurn(current); }, destroy() {} };
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting) && current) void controller?.loadTurn(current);
    }, { root: scroller(), rootMargin: "240px 0px" });
    observer.observe(node);
    return {
      update(next: string) { current = next; },
      destroy() { observer.disconnect(); },
    };
  }

  function blockItems(block: ConversationBlock): TimelineItem[] {
    const items = block.events ? projector(block.events).map((item) => ({ ...item, generationId: block.generation.generationId })) : block.items || [];
    return markTurnAgentRuns(markTurnFinalAssistant(items));
  }

  function blockAgentName(block: ConversationBlock): string {
    return block.generation.agentName || block.generation.resolvedProfile || block.generation.binding?.name || model.agentName || "Agent";
  }

  async function autoFill(identity: string): Promise<void> {
    let pages = 0;
    while (pages < 16 && snapshot.identity === identity && snapshot.hasMoreBefore) {
      const scroll = scroller();
      if (!scroll || scroll.scrollHeight > scroll.clientHeight + 160 || hasActiveSelection()) return;
      if (!await controller?.loadOlder()) return;
      pages++;
      await tick();
      scrollToBottom();
    }
  }

  async function loadOlder(): Promise<void> {
    const scroll = scroller();
    if (!scroll || snapshot.loadingOlder) return;
    const anchor = firstVisibleItem(scroll);
    const anchorTop = anchor?.getBoundingClientRect().top ?? 0;
    const previousHeight = scroll.scrollHeight;
    const previousTop = scroll.scrollTop;
    const identity = snapshot.identity;
    await controller?.loadOlder();
    await tick();
    if (snapshot.identity !== identity) return;
    if (anchor?.isConnected) scroll.scrollTop = previousTop + (anchor.getBoundingClientRect().top - anchorTop);
    else scroll.scrollTop = previousTop + (scroll.scrollHeight - previousHeight);
    model.onIconsChanged();
  }

  function rememberToolOpen(item: TimelineItem, open: boolean): void {
    const key = timelineKey(item);
    openTools = new Map(openTools).set(key, open);
    openCache.set(snapshot.identity, new Map(openTools));
    if (open) void expandCompact(item);
  }

  function expandCompact(item: TimelineItem): Promise<void> | undefined {
    if (!item.compact || !item.generationId || !item.rangeStartEventId || !item.rangeEndEventId) return;
    return controller?.expandRange(item.generationId, item.rangeStartEventId, item.rangeEndEventId);
  }

  function toolOpen(item: TimelineItem): boolean {
    return openTools.get(timelineKey(item)) ?? false;
  }

  function openLinkedFile(path: string): void {
    preview = { section: "Files", path };
  }

  function rejectReadOnlySave(): Promise<FilePreviewModel> {
    return Promise.reject(new Error("Chat file previews are read-only."));
  }

  function scroller(): HTMLElement | null { return root?.parentElement ?? null; }

  function hasActiveSelection(): boolean {
    const scroll = scroller();
    const selection = window.getSelection?.();
    return Boolean(scroll && selection && !selection.isCollapsed && selection.rangeCount && selection.getRangeAt(0).intersectsNode(scroll));
  }

  function isNearBottom(scroll: HTMLElement | null): boolean {
    return Boolean(scroll && scroll.scrollHeight - scroll.scrollTop - scroll.clientHeight <= 32);
  }

  function turnIsWorking(status: EventTimelineModel["status"]): boolean {
    return status?.session?.state === "running" && Boolean(status.session.currentTurnId);
  }

  function scrollToBottom(): void {
    const scroll = scroller();
    if (scroll) scroll.scrollTop = scroll.scrollHeight;
  }

  function firstVisibleItem(scroll: HTMLElement): HTMLElement | null {
    const top = scroll.getBoundingClientRect().top;
    return [...scroll.querySelectorAll<HTMLElement>("[data-timeline-key]")].find((item) => item.getBoundingClientRect().bottom >= top) ?? null;
  }

  function timelineKey(item: TimelineItem): string {
    const key = item.kind === "tools" ? toolGroupKey(item) : String(item.key ?? item.approvalId ?? item.time ?? item.type ?? "event");
    return `${item.generationId || snapshot.generationId}:${item.kind}:${key}`;
  }

  function emptySnapshot(): ChatContextSnapshot {
    return { identity: "", workspaceId: "", resourceId: "", generationId: "", blocks: [], notices: [], hasMoreBefore: false, loading: false, loadingOlder: false, loaded: false, error: "" };
  }
</script>

<div bind:this={root} data-component-owner="event-timeline" class="event-timeline-root" data-chat-context={snapshot.identity}>
  {#if snapshot.resourceId}
    {#if snapshot.hasMoreBefore}
      <button type="button" class="load-older-events" class:busy={snapshot.loadingOlder} disabled={snapshot.loadingOlder} onclick={loadOlder}>
        <span class="load-older-icon load-older-icon-idle"><Icon name="chevrons-up" /></span><span class="load-older-icon load-older-icon-busy"><Icon name="loader-circle" /></span><span>{snapshot.loadingOlder ? "Loading..." : "Load older messages"}</span>
      </button>
    {/if}
    {#each snapshot.blocks as block, index (block.key)}
      {#if index === 0 || snapshot.blocks[index - 1].generation.generationId !== block.generation.generationId}
        <div class="conversation-generation" data-generation-id={block.generation.generationId}>
          <span>Generation {block.generation.generation}</span><strong>{block.generation.agentName || block.generation.resolvedProfile || block.generation.binding?.name || "Agent"}</strong><small data-generation-status={effectiveGenerationStatus(block, model.status)}>{effectiveGenerationStatus(block, model.status)}</small>
        </div>
      {/if}
      {#if block.kind === "gap"}
        <div class="conversation-gap" data-timeline-key={block.key}><Icon name="triangle-alert" /><span><strong>History unavailable</strong><small>{block.gap?.message || "This generation could not be read."}</small></span>{#if block.gap?.retryable}<button type="button" class="secondary-button" onclick={() => controller?.retryHistory()}>Retry</button>{/if}</div>
      {:else}
        <section class="conversation-turn" class:conversation-turn-loading={block.loading} data-timeline-key={block.key} use:observeTurn={block.turn?.reference || ""}>
          {#if block.turn?.triggerPreview && !block.items && !block.events}<div class="turn-summary-preview">{block.turn.triggerPreview}</div>{/if}
          {#each blockItems(block) as item (timelineKey(item))}
            <div data-timeline-key={timelineKey(item)}>
              {#if item.agentStart}
                <!-- Reasoning, tool calls, and approvals render without their own
                     author label, so a run that starts with them gets a header
                     carrying the agent's name and the run's start time;
                     otherwise both would first appear on the initial progress
                     update instead of the turn's first event. -->
                <div data-component-owner="event-timeline" class="agent-run-header"><strong>{blockAgentName(block)}</strong>{#if formatClock(item.time)}<span>{formatClock(item.time)}</span>{/if}</div>
              {/if}
              {#if item.kind === "message"}
                <TimelineMessage {item} agentName={blockAgentName(block)} workspaceId={model.workspaceId} resolveResourceTitle={model.resolveResourceTitle} onNavigate={model.onNavigate} onOpenFile={openLinkedFile} />
              {:else if item.kind === "thinking"}
                <ThinkingBlock {item} onExpand={() => expandCompact(item)} />
              {:else if item.kind === "tools"}
                <ToolGroup {item} generationId={block.generation.generationId} open={toolOpen(item)} onToggle={(open) => rememberToolOpen(item, open)} />
              {:else if item.kind === "approval"}
                <ApprovalCard {item} generationId={block.generation.generationId} contextIdentity={snapshot.identity} onApproval={model.onApproval} onToast={model.onToast} />
              {:else if item.kind === "lifecycle"}
                <LifecycleNotice {item} />
              {:else if item.kind === "error"}
                <TimelineNotice title="Provider error" text={item.text || ""} error />
              {:else}
                <UnknownEvent {item} />
              {/if}
            </div>
          {/each}
          {#if block.loading && !block.items && !block.events}<div class="turn-loading"><Icon name="loader-circle" /><span>Loading turn details</span></div>{/if}
          {#if block.error}<TimelineNotice title="Turn unavailable" text={block.error} error />{/if}
        </section>
      {/if}
    {/each}
    {#each snapshot.notices as notice, index (`notice:${snapshot.identity}:${index}:${String(notice.data?.text || "")}`)}
      <div data-timeline-key={`notice:${index}`}><TimelineNotice title="PUA" text={String(notice.data?.text || "")} error={notice.data?.level === "error"} /></div>
    {/each}
    {#if snapshot.error}<TimelineNotice title="Timeline error" text={snapshot.error} error alert />{/if}
    {#if turnIsWorking(model.status)}
      <div class="turn-working-indicator" role="status" aria-live="polite" data-timeline-key="turn-working">
        <Icon name="loader-circle" /><span>working...</span>
      </div>
    {/if}
    {#if snapshot.loading && !snapshot.blocks.length}<div class="chat-timeline-empty"><Icon name="loader-circle" /><strong>Loading resource history</strong></div>{/if}
    {#if snapshot.loaded && !snapshot.loading && !snapshot.blocks.length && !snapshot.notices.length && !turnIsWorking(model.status)}<div class="chat-timeline-empty"><Icon name="bot" /><strong>No conversation yet</strong><span>Send a message to start this resource's conversation.</span></div>{/if}
  {:else}
    <div class="chat-timeline-empty"><Icon name="bot" /><strong>No resource selected</strong></div>
  {/if}
</div>

<FilePreviewModal {client} workspaceId={model.workspaceId} resourceId={model.resourceId} selection={preview} editable={false} resolveResourceTitle={model.resolveResourceTitle} onNavigate={model.onNavigate} onOpenFile={openLinkedFile} onSaveMarkdown={rejectReadOnlySave} onClose={() => preview = null} onError={model.onToast} onIconsChanged={model.onIconsChanged} />
