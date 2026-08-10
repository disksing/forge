<script lang="ts">
  import "./EventTimeline.css";

  import { onMount, tick } from "svelte";

  import ApprovalCard from "./ApprovalCard.svelte";
  import { ChatSessionController } from "./chat-state";
  import ErrorNotice from "./ErrorNotice.svelte";
  import ForgeNotice from "./ForgeNotice.svelte";
  import LifecycleNotice from "./LifecycleNotice.svelte";
  import type { ModelChannel } from "./model-channel";
  import Icon from "./Icon.svelte";
  import type { ChatContextSnapshot, EventTimelineModel, TimelineItem } from "./models";
  import ThinkingBlock from "./ThinkingBlock.svelte";
  import TimelineMessage from "./TimelineMessage.svelte";
  import ToolGroup from "./ToolGroup.svelte";
  import UnknownEvent from "./UnknownEvent.svelte";

  let { channel }: { channel: ModelChannel<EventTimelineModel> } = $props();
  // svelte-ignore state_referenced_locally
  let model = $state(channel.current());
  // Keep projection independent from model metadata updates. The application
  // republishes the model when tree or run metadata changes, but its projector
  // is stable and the event history has not necessarily changed.
  // svelte-ignore state_referenced_locally
  let projector = $state(channel.current().project);
  let snapshot = $state<ChatContextSnapshot>(emptySnapshot());
  let projected = $derived(projector(snapshot.events));
  let root: HTMLDivElement | undefined = $state();
  let controller: ChatSessionController | undefined;
  let deferredSnapshot: ChatContextSnapshot | null = null;
  let followAfterUpdate = false;
  let contextChanged = false;
  const openCache = new Map<string, Map<string, boolean>>();
  let openTools = $state(new Map<string, boolean>());

  onMount(() => {
    const scroll = scroller();
    controller = new ChatSessionController({
      onEvent: (workspaceId, runId, event) => model.onEvent(workspaceId, runId, event),
      onNotice: (workspaceId, runId, notice) => model.onNotice(workspaceId, runId, notice),
    });
    const unsubscribeSnapshot = controller.subscribe((next) => receive(next));
    const unsubscribeModel = channel.subscribe((next) => {
      const previousIdentity = model.identity;
      model = next;
      if (next.project !== projector) projector = next.project;
      if (next.identity !== previousIdentity) {
        contextChanged = true;
        deferredSnapshot = null;
        openTools = new Map(openCache.get(next.identity) ?? []);
      }
      controller?.activate(next.workspaceId, next.activeRun);
      queueMicrotask(next.onIconsChanged);
    });
    const selectionChanged = () => {
      if (!deferredSnapshot || hasActiveSelection()) return;
      const next = deferredSnapshot;
      deferredSnapshot = null;
      applySnapshot(next);
    };
    document.addEventListener("selectionchange", selectionChanged);
    return () => {
      unsubscribeSnapshot();
      unsubscribeModel();
      document.removeEventListener("selectionchange", selectionChanged);
      controller?.dispose();
      controller = undefined;
      if (scroll) scroll.removeAttribute("data-agent-run-id");
    };
  });

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
    followAfterUpdate = changed || contextChanged || isNearBottom(scroll);
    contextChanged = false;
    snapshot = next;
    if (scroll) scroll.dataset.agentRunId = next.runId;
    void tick().then(() => {
      if (followAfterUpdate && !hasActiveSelection()) scrollToBottom();
      model.onIconsChanged();
      if (next.loaded && next.hasMoreBefore) void autoFill(next.identity);
    });
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
  }

  function toolOpen(item: TimelineItem, index: number): boolean {
    const saved = openTools.get(timelineKey(item));
    if (typeof saved === "boolean") return saved;
    return index === projected.length - 1 || Boolean(item.calls?.some((call) => call.status === "running"));
  }

  function scroller(): HTMLElement | null {
    return root?.parentElement ?? null;
  }

  function hasActiveSelection(): boolean {
    const scroll = scroller();
    const selection = window.getSelection?.();
    return Boolean(scroll && selection && !selection.isCollapsed && selection.rangeCount && selection.getRangeAt(0).intersectsNode(scroll));
  }

  function isNearBottom(scroll: HTMLElement | null): boolean {
    return Boolean(scroll && scroll.scrollHeight - scroll.scrollTop - scroll.clientHeight <= 32);
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
    return `${item.kind}:${String(item.key ?? item.approvalId ?? item.time ?? item.type ?? "event")}`;
  }

  function emptySnapshot(): ChatContextSnapshot {
    return { identity: "", workspaceId: "", runId: "", events: [], notices: [], hasMoreBefore: false, loading: false, loadingOlder: false, loaded: false, error: "" };
  }
</script>

<div bind:this={root} data-component-owner="event-timeline" class="event-timeline-root" data-chat-context={snapshot.identity}>
  {#if snapshot.runId}
    {#if snapshot.hasMoreBefore}
      <button type="button" class="load-older-events" disabled={snapshot.loadingOlder} onclick={loadOlder}>
        <Icon name={snapshot.loadingOlder ? "loader-circle" : "chevrons-up"} /><span>{snapshot.loadingOlder ? "Loading..." : "Load older messages"}</span>
      </button>
    {/if}
    {#each projected as item, index (timelineKey(item))}
      <div data-timeline-key={timelineKey(item)}>
        {#if item.kind === "message"}
          <TimelineMessage {item} agentName={model.agentName} />
        {:else if item.kind === "thinking"}
          <ThinkingBlock {item} />
        {:else if item.kind === "tools"}
          <ToolGroup {item} runId={snapshot.runId} open={toolOpen(item, index)} onToggle={(open) => rememberToolOpen(item, open)} />
        {:else if item.kind === "approval"}
          <ApprovalCard {item} runId={snapshot.runId} contextIdentity={snapshot.identity} onApproval={model.onApproval} onToast={model.onToast} />
        {:else if item.kind === "lifecycle"}
          <LifecycleNotice {item} />
        {:else if item.kind === "error"}
          <ErrorNotice title="Provider error" text={item.text || ""} />
        {:else}
          <UnknownEvent {item} />
        {/if}
      </div>
    {/each}
    {#each snapshot.notices as notice, index (`notice:${snapshot.identity}:${index}:${String(notice.data?.schedulerTurnSequence || notice.data?.text || "")}`)}
      <div data-timeline-key={`notice:${index}`}><ForgeNotice {notice} /></div>
    {/each}
    {#if snapshot.error}<ErrorNotice title="Timeline error" text={snapshot.error} alert />{/if}
    {#if snapshot.loading && !projected.length}<div class="tty-empty"><Icon name="loader-circle" /><strong>Loading agent events</strong></div>{/if}
    {#if snapshot.loaded && !snapshot.loading && !projected.length && !snapshot.notices.length}<div class="tty-empty"><Icon name="loader-circle" /><strong>Waiting for agent events</strong></div>{/if}
  {:else}
    <div class="tty-empty"><Icon name="bot" /><strong>No agent run selected</strong><span>{model.runCount ? "Select an Agent Run to view its events." : "Start an agent session."}</span></div>
  {/if}
</div>
