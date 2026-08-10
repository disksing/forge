<script lang="ts">
  import { onMount, tick } from "svelte";

  import { ChatSessionController } from "./chat-state";
  import type { IslandChannel } from "./channel";
  import Icon from "./Icon.svelte";
  import type { ChatContextSnapshot, EventTimelineModel, TimelineItem } from "./models";

  let { channel }: { channel: IslandChannel<EventTimelineModel> } = $props();
  // svelte-ignore state_referenced_locally
  let model = $state(channel.current());
  let snapshot = $state<ChatContextSnapshot>(emptySnapshot());
  let projected = $derived(model.project(snapshot.events));
  let root: HTMLDivElement | undefined = $state();
  let controller: ChatSessionController | undefined;
  let deferredSnapshot: ChatContextSnapshot | null = null;
  let followAfterUpdate = false;
  let contextChanged = false;
  let approvalDrafts = $state(new Map<string, string>());
  let pendingApprovals = $state(new Set<string>());
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

  async function approve(item: TimelineItem, reply: { decision?: string; optionId?: string; text?: string }): Promise<void> {
    const approvalId = String(item.approvalId || "");
    if (!approvalId || pendingApprovals.has(approvalId)) return;
    pendingApprovals = new Set(pendingApprovals).add(approvalId);
    try {
      await model.onApproval(snapshot.runId, approvalId, reply);
      const next = new Map(approvalDrafts);
      next.delete(approvalKey(approvalId));
      approvalDrafts = next;
    } catch (reason) {
      model.onToast(reason instanceof Error ? reason.message : String(reason));
    } finally {
      const next = new Set(pendingApprovals);
      next.delete(approvalId);
      pendingApprovals = next;
    }
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

  function updateApprovalDraft(approvalId: string, text: string): void {
    approvalDrafts = new Map(approvalDrafts).set(approvalKey(approvalId), text);
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

  function approvalKey(id: string): string {
    return `${snapshot.identity}:${id}`;
  }

  function senderName(item: TimelineItem): string {
    if (item.role === "assistant") return model.agentName || "Agent";
    const name = String(item.sender?.name || item.sender?.id || "").trim();
    if (name) return name;
    return item.role === "system" ? "System" : item.role === "agent" ? "Agent" : "User";
  }

  function clock(value?: string): string {
    const date = new Date(value || "");
    return Number.isNaN(date.valueOf()) ? "" : date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  }

  function thinkingTitle(item: TimelineItem): string {
    if (item.active) return "Thinking…";
    if (!item.startTime || !item.time) return "Thought";
    const seconds = Math.round((new Date(item.time).getTime() - new Date(item.startTime).getTime()) / 1000);
    if (!Number.isFinite(seconds) || seconds < 0) return "Thought";
    return seconds < 60 ? `Thought for ${seconds} ${seconds === 1 ? "second" : "seconds"}` : `Thought for ${Math.floor(seconds / 60)}m${seconds % 60}s`;
  }

  function markdown(text?: string): string {
    const source = String(text || "");
    if (!window.marked || !window.DOMPurify) return escapeHTML(source).replaceAll("\n", "<br>");
    return window.DOMPurify.sanitize(window.marked.parse(source));
  }

  function escapeHTML(value: string): string {
    return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
  }

  function toolSummary(call: NonNullable<TimelineItem["calls"]>[number]): string {
    return [call.name, call.summary].filter(Boolean).join(" · ") || "Tool call";
  }

  function toolDetails(call: NonNullable<TimelineItem["calls"]>[number]): string {
    return [call.error, call.output, call.rawPreview].filter(Boolean).join("\n\n");
  }

  function optionLabel(option: NonNullable<TimelineItem["options"]>[number]): string {
    return option.name || String(option.kind || "").replace(/[_-]+/g, " ").trim() || option.optionId;
  }

  function emptySnapshot(): ChatContextSnapshot {
    return { identity: "", workspaceId: "", runId: "", events: [], notices: [], hasMoreBefore: false, loading: false, loadingOlder: false, loaded: false, error: "" };
  }
</script>

<div bind:this={root} class="event-timeline-root" data-chat-context={snapshot.identity}>
  {#if snapshot.runId}
    {#if snapshot.hasMoreBefore}
      <button type="button" class="load-older-events" disabled={snapshot.loadingOlder} onclick={loadOlder}>
        <Icon name={snapshot.loadingOlder ? "loader-circle" : "chevrons-up"} /><span>{snapshot.loadingOlder ? "Loading..." : "Load older messages"}</span>
      </button>
    {/if}
    {#each projected as item, index (timelineKey(item))}
      <div data-timeline-key={timelineKey(item)}>
        {#if item.kind === "message"}
          {@const role = ["assistant", "system", "agent"].includes(String(item.role)) ? String(item.role) : "user"}
          <div class={`agent-message-row ${role === "assistant" ? "assistant final" : role}`}>
            <div class="agent-message-main">
              <div class="agent-message-meta">
                <strong>{senderName(item)}</strong>
                {#if role !== "assistant"}<span class="agent-message-tag agent-message-role-tag">{role}</span>{/if}
                {#if item.steer}<span class="agent-message-tag">steer</span>{/if}
                {#if role === "agent" && item.sender?.sessionId}<span class="agent-message-source" title={item.sender.sessionId}>from session {item.sender.sessionId}</span>{/if}
                <span>{clock(item.time)}</span>
              </div>
              <div class="agent-message-bubble">
                {#if role === "assistant"}<div class="agent-message-content markdown-rendered">{@html markdown(item.text)}</div>{:else}<p>{item.text || ""}</p>{/if}
              </div>
            </div>
          </div>
        {:else if item.kind === "thinking"}
          <details class="agent-reasoning-note" open={item.active}>
            <summary><Icon name="brain-circuit" /><span>{thinkingTitle(item)}</span><span class="agent-reasoning-chevron"><Icon name="chevron-right" /></span></summary>
            <p>{item.text || ""}</p>
          </details>
        {:else if item.kind === "tools"}
          {@const calls = item.calls || []}
          {@const summaries = calls.map(toolSummary)}
          <details class="agent-tool-group" data-tool-group-key={`${snapshot.runId}:${String(item.key || item.time || "tools")}`} open={toolOpen(item, index)} ontoggle={(event) => rememberToolOpen(item, event.currentTarget.open)}>
            <summary><span class="agent-tool-group-icon"><Icon name="wrench" /></span><span class="agent-tool-group-title">{calls.length} tool {calls.length === 1 ? "call" : "calls"}</span><span class="agent-tool-group-preview">{summaries.slice(0, 2).join(" · ")}{summaries.length > 2 ? ` · +${summaries.length - 2} more` : ""}</span><span class="agent-tool-group-chevron"><Icon name="chevron-right" /></span></summary>
            <div class="agent-tool-list">
              {#each calls as call (String(call.callId || call.key))}
                <details class={`agent-tool-item agent-tool-${String(call.status || "completed")}`}>
                  <summary><Icon name={call.status === "running" ? "loader-circle" : call.status === "failed" ? "x-circle" : "check-circle"} /><span>{toolSummary(call)}</span><small>{String(call.method || "tool")}</small></summary>
                  {#if toolDetails(call)}<pre>{toolDetails(call)}</pre>{/if}
                </details>
              {/each}
            </div>
          </details>
        {:else if item.kind === "approval"}
          {@const approvalId = String(item.approvalId || "")}
          {@const draft = approvalDrafts.get(approvalKey(approvalId)) || ""}
          <div class="agent-event approval">
            <div><Icon name="shield-question" /><strong>{item.title || "Approval requested"}</strong></div>
            {#if item.question}<p class="approval-question">{item.question}</p>{/if}
            {#if item.detail}<p>{item.detail}</p>{/if}
            {#if item.status === "pending"}
              {#if item.options?.length}
                <div class="approval-options">{#each item.options as option (option.optionId)}<button class:secondary-button={String(option.kind || "").startsWith("reject")} disabled={pendingApprovals.has(approvalId)} onclick={() => approve(item, { optionId: option.optionId })}>{optionLabel(option)}</button>{/each}</div>
              {:else}
                <div class="approval-actions"><button disabled={pendingApprovals.has(approvalId)} onclick={() => approve(item, { decision: "accept" })}><Icon name="check" /><span>Allow once</span></button><button class="secondary-button" disabled={pendingApprovals.has(approvalId)} onclick={() => approve(item, { decision: "decline" })}><Icon name="x" /><span>Decline</span></button></div>
              {/if}
              {#if item.question}<form class="approval-reply" onsubmit={(event) => { event.preventDefault(); if (draft.trim()) void approve(item, { text: draft.trim() }); }}><input value={draft} placeholder="Reply with a custom answer…" aria-label="Custom reply" oninput={(event) => updateApprovalDraft(approvalId, event.currentTarget.value)}><button type="submit" disabled={!draft.trim() || pendingApprovals.has(approvalId)}>Send</button></form>{/if}
            {:else}
              <p>{item.decision || (item.status === "accepted" ? "Allowed" : "Declined")}{item.reply ? `: ${item.reply}` : ""}</p>
            {/if}
          </div>
        {:else if item.kind === "lifecycle"}
          {@const iconName = item.tone === "ok" ? "check-circle" : item.tone === "danger" ? "triangle-alert" : item.tone === "info" ? "info" : "clock"}
          <div class={`agent-system-note agent-lifecycle-${item.tone || "muted"}`}><Icon name={iconName} /><span>{item.text || ""}</span><span class="agent-note-time">{clock(item.time)}</span></div>
        {:else if item.kind === "error"}
          <div class="agent-event error"><div><Icon name="triangle-alert" /><strong>Provider error</strong></div><p>{item.text || ""}</p></div>
        {:else}
          <details class="agent-tool-item agent-unknown-event"><summary><Icon name="info" /><span>Unhandled event: {item.type || item.kind}</span></summary><pre>{item.preview || "This event carries no payload."}</pre></details>
        {/if}
      </div>
    {/each}
    {#each snapshot.notices as notice, index (`notice:${snapshot.identity}:${index}:${String(notice.data?.schedulerTurnSequence || notice.data?.text || "")}`)}
      <div data-timeline-key={`notice:${index}`} class={`agent-event ${notice.data?.level === "error" ? "error" : "system"}`}><div><Icon name={notice.data?.level === "error" ? "triangle-alert" : "info"} /><strong>Forge</strong></div><p>{String(notice.data?.text || "")}</p></div>
    {/each}
    {#if snapshot.error}<div class="agent-event error" role="alert"><div><Icon name="triangle-alert" /><strong>Timeline error</strong></div><p>{snapshot.error}</p></div>{/if}
    {#if snapshot.loading && !projected.length}<div class="tty-empty"><Icon name="loader-circle" /><strong>Loading agent events</strong></div>{/if}
    {#if snapshot.loaded && !snapshot.loading && !projected.length && !snapshot.notices.length}<div class="tty-empty"><Icon name="loader-circle" /><strong>Waiting for agent events</strong></div>{/if}
  {:else}
    <div class="tty-empty"><Icon name="bot" /><strong>No agent run selected</strong><span>{model.runCount ? "Select an Agent Run to view its events." : "Start an agent session."}</span></div>
  {/if}
</div>
