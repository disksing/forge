<script lang="ts">
  import "./TimelineMessage.css";

  import type { TimelineItem } from "./models";
  import { formatClock } from "./timeline-events";
  import { markdownHTML, markdownResourceNavigation, type ResourceTitleResolver } from "./markdown";

  let { item, agentName, workspaceId = "", resolveResourceTitle = () => null, onNavigate = () => {}, onOpenFile }: { item: TimelineItem; agentName: string; workspaceId?: string; resolveResourceTitle?: ResourceTitleResolver; onNavigate?: (resourceId: string) => void; onOpenFile?: (path: string) => void } = $props();
  let role = $derived(["assistant", "system", "agent"].includes(String(item.role)) ? String(item.role) : "user");
  // The `final` class marks the turn's last assistant message and keeps the
  // ink rail; mid-turn progress updates (turnFinal === false) fall back to
  // the muted gray rail. Standalone items without the annotation stay final.
  let rowClass = $derived(role === "assistant" ? (item.turnFinal === false ? "assistant" : "assistant final") : role);

  function senderName(): string {
    if (item.role === "assistant") return agentName || "Agent";
    const name = String(item.sender?.name || item.sender?.id || "").trim();
    if (name) return name;
    return item.role === "system" ? "System" : item.role === "agent" ? "Agent" : "User";
  }

  function clock(): string {
    return formatClock(item.time);
  }

  function markdown(): string {
    const source = String(item.text || "");
    if (!window.marked || !window.DOMPurify) return escapeHTML(source).replaceAll("\n", "<br>");
    return markdownHTML(source, { workspaceId, resolveResourceTitle });
  }

  function escapeHTML(value: string): string {
    return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
  }
</script>

<div data-component-owner="event-timeline" class={`agent-message-row ${rowClass}`}>
  <div class="agent-message-main">
    {#if role !== "assistant" || !item.agentContinuation}
      <!-- Assistant messages continuing a run drop the whole meta row: the
           run header above the run's first event already carries the name
           and the run's start time. -->
      <div class="agent-message-meta">
        <strong>{senderName()}</strong>
        {#if role !== "assistant"}<span class="agent-message-tag agent-message-role-tag">{role}</span>{/if}
        {#if item.steer}<span class="agent-message-tag">steer</span>{/if}
        {#if role === "agent" && item.sender?.sessionId}<span class="agent-message-source" title={item.sender.sessionId}>from session {item.sender.sessionId}</span>{/if}
        <span>{clock()}</span>
      </div>
    {/if}
    <div class="agent-message-bubble">
      {#if role === "assistant" || role === "agent"}<div class="agent-message-content markdown-rendered" use:markdownResourceNavigation={{ resolveResourceTitle, onNavigate, onOpenFile }}>{@html markdown()}</div>{:else}<p>{item.text || ""}</p>{/if}
    </div>
  </div>
</div>
