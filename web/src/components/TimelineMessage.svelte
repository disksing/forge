<script lang="ts">
  import "./TimelineMessage.css";

  import type { TimelineItem } from "./models";

  let { item, agentName }: { item: TimelineItem; agentName: string } = $props();
  let role = $derived(["assistant", "system", "agent"].includes(String(item.role)) ? String(item.role) : "user");

  function senderName(): string {
    if (item.role === "assistant") return agentName || "Agent";
    const name = String(item.sender?.name || item.sender?.id || "").trim();
    if (name) return name;
    return item.role === "system" ? "System" : item.role === "agent" ? "Agent" : "User";
  }

  function clock(): string {
    const date = new Date(item.time || "");
    return Number.isNaN(date.valueOf()) ? "" : date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  }

  function markdown(): string {
    const source = String(item.text || "");
    if (!window.marked || !window.DOMPurify) return escapeHTML(source).replaceAll("\n", "<br>");
    return window.DOMPurify.sanitize(window.marked.parse(source));
  }

  function escapeHTML(value: string): string {
    return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
  }
</script>

<div data-component-owner="event-timeline" class={`agent-message-row ${role === "assistant" ? "assistant final" : role}`}>
  <div class="agent-message-main">
    <div class="agent-message-meta">
      <strong>{senderName()}</strong>
      {#if role !== "assistant"}<span class="agent-message-tag agent-message-role-tag">{role}</span>{/if}
      {#if item.steer}<span class="agent-message-tag">steer</span>{/if}
      {#if role === "agent" && item.sender?.sessionId}<span class="agent-message-source" title={item.sender.sessionId}>from session {item.sender.sessionId}</span>{/if}
      <span>{clock()}</span>
    </div>
    <div class="agent-message-bubble">
      {#if role === "assistant" || role === "agent"}<div class="agent-message-content markdown-rendered">{@html markdown()}</div>{:else}<p>{item.text || ""}</p>{/if}
    </div>
  </div>
</div>
