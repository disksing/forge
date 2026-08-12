<script lang="ts">
  import "./GlobalSessionList.css";

  import Icon from "./Icon.svelte";
  import StatusPresentation from "./StatusPresentation.svelte";
  import type { ShellDragTarget, ShellSessionItem, ShellStatusPresentation } from "./models";

  let {
    identity,
    sessions,
    onSelect,
    onReorder,
    onDragState,
    onToast,
  }: {
    identity: string;
    sessions: ShellSessionItem[];
    onSelect: (id: string) => Promise<void>;
    onReorder: (drag: ShellDragTarget, target: ShellDragTarget, after: boolean) => Promise<void>;
    onDragState: (drag: ShellDragTarget | null) => void;
    onToast: (message: string) => void;
  } = $props();
  let drag = $state<ShellDragTarget | null>(null);
  let drop = $state<{ id: string; after: boolean } | null>(null);
  // svelte-ignore state_referenced_locally
  let previousIdentity = $state(identity);

  $effect(() => {
    if (identity === previousIdentity) return;
    previousIdentity = identity;
    finishDrag();
  });

  function statusClass(status: ShellStatusPresentation): string {
    return [status.layoutClassName, status.className].filter(Boolean).join(" ");
  }

  function rowDropClass(id: string): string {
    if (!drop || drop.id !== id) return "";
    return drop.after ? "drop-after" : "drop-before";
  }

  function beginDrag(event: DragEvent, id: string): void {
    event.stopPropagation();
    drag = { kind: "session", id, projectId: "" };
    drop = null;
    onDragState(drag);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", id);
    }
  }

  function updateDrop(event: DragEvent, id: string): void {
    if (!drag || drag.id === id) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    drop = { id, after: event.clientY > rect.top + rect.height / 2 };
  }

  async function commitDrop(event: DragEvent, id: string): Promise<void> {
    event.preventDefault();
    if (!drag || drag.id === id) return;
    const current = drag;
    const target: ShellDragTarget = { kind: "session", id, projectId: "" };
    const after = drop?.id === id ? drop.after : false;
    finishDrag();
    try {
      await onReorder(current, target, after);
    } catch (reason) {
      onToast(reason instanceof Error ? reason.message : String(reason));
    }
  }

  function finishDrag(): void {
    if (drag) onDragState(null);
    drag = null;
    drop = null;
  }

  async function selectResource(id: string): Promise<void> {
    if (!id) return;
    try {
      await onSelect(id);
    } catch (reason) {
      onToast(reason instanceof Error ? reason.message : String(reason));
    }
  }

  function activate(event: MouseEvent, session: ShellSessionItem): void {
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest(".drag-handle")) return;
    if (session.navigationResourceId) void selectResource(session.navigationResourceId);
  }
</script>

<section class="session-section" data-component-owner="global-session-list">
  <div class="section-title"><span>Sessions</span></div>
  <div id="sessionList" class="session-list">
    {#if sessions.length === 0}
      <div class="session-row muted-row"><Icon name="message-square" /><div><strong>No active sessions</strong><span>Start one from a task directory.</span></div></div>
    {:else}
      {#each sessions as session (session.id)}
        <button type="button" class={`session-row ${session.source === "internal" ? "internal-session" : "external-session"} ${statusClass(session.status)} ${session.clickable ? "clickable-session" : ""} ${session.current ? "current-session" : ""} ${session.unread ? "session-unread" : ""} ${drag?.id === session.id ? "drag-source" : ""} ${rowDropClass(session.id)}`} aria-label={`${session.title}. ${session.statusLabel}`} title={session.statusLabel} onclick={(event) => activate(event, session)} ondragover={(event) => updateDrop(event, session.id)} ondrop={(event) => commitDrop(event, session.id)}>
          <StatusPresentation status={session.status} className="session-status-icon" />
          <div class="session-title"><strong>{session.title}</strong><span>{session.meta}</span></div>
          <span class={`session-badge ${session.source === "internal" ? "internal" : "external"}`}>{session.label}</span>
          {#if session.unread}<span class="session-unread-badge" aria-label="Unread turn completion">New</span>{/if}
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <span class="drag-handle" draggable="true" title="Drag to reorder" ondragstart={(event) => beginDrag(event, session.id)} ondragend={finishDrag}><Icon name="grip-vertical" className="drag-handle-icon" /></span>
        </button>
      {/each}
    {/if}
  </div>
</section>
