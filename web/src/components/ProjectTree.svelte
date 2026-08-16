<script lang="ts">
  import "./ProjectTree.css";

  import { onDestroy, onMount } from "svelte";

  import Icon from "./Icon.svelte";
  import StatusPresentation from "./StatusPresentation.svelte";
  import type { ShellDragTarget, ShellResourceItem, ShellStatusPresentation } from "./models";

  let {
    identity,
    loading,
    error,
    projects,
    onCreate,
    onToggle,
    onSelect,
    onReorder,
    onDragState,
    onToggleAttention,
    onToast,
  }: {
    identity: string;
    loading: boolean;
    error: string;
    projects: ShellResourceItem[];
    onCreate: () => void;
    onToggle: (id: string) => Promise<void>;
    onSelect: (id: string) => Promise<void>;
    onReorder: (drag: ShellDragTarget, target: ShellDragTarget, after: boolean) => Promise<void>;
    onDragState: (drag: ShellDragTarget | null) => void;
    onToggleAttention: (id: string, followed: boolean) => Promise<void>;
    onToast: (message: string) => void;
  } = $props();
  let drag = $state<ShellDragTarget | null>(null);
  let drop = $state<{ id: string; after: boolean } | null>(null);
  let stateTooltip = $state<{ text: string; left: number; top: number; pinned: boolean } | null>(null);
  // svelte-ignore state_referenced_locally
  let previousIdentity = $state(identity);

  $effect(() => {
    if (identity === previousIdentity) return;
    previousIdentity = identity;
    hideStateTooltip();
    finishDrag();
  });

  onMount(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!stateTooltip?.pinned) return;
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest(".task-state-tooltip") || target?.closest(".task-state-icon")) return;
      hideStateTooltip();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") hideStateTooltip();
    };
    const onViewportChange = () => hideStateTooltip();
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onViewportChange);
    window.addEventListener("scroll", onViewportChange, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onViewportChange);
      window.removeEventListener("scroll", onViewportChange, true);
    };
  });

  onDestroy(() => {
    hideStateTooltip();
    finishDrag();
  });

  function statusClass(status: ShellStatusPresentation): string {
    return [status.layoutClassName, status.className].filter(Boolean).join(" ");
  }

  function rowDropClass(id: string): string {
    if (!drop || drop.id !== id) return "";
    return drop.after ? "drop-after" : "drop-before";
  }

  function compatibleDrop(target: ShellDragTarget): boolean {
    if (!drag || drag.id === target.id || drag.kind !== target.kind) return false;
    return target.kind !== "task" || drag.projectId === target.projectId;
  }

  function beginDrag(event: DragEvent, target: ShellDragTarget): void {
    event.stopPropagation();
    drag = target;
    drop = null;
    onDragState(target);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", target.id);
    }
  }

  function updateDrop(event: DragEvent, target: ShellDragTarget): void {
    if (!compatibleDrop(target)) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    drop = { id: target.id, after: event.clientY > rect.top + rect.height / 2 };
  }

  async function commitDrop(event: DragEvent, target: ShellDragTarget): Promise<void> {
    event.preventDefault();
    if (!drag || !compatibleDrop(target)) return;
    const current = drag;
    const after = drop?.id === target.id ? drop.after : false;
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
    hideStateTooltip();
  }

  function hideStateTooltip(): void {
    stateTooltip = null;
  }

  function positionStateTooltip(anchor: Element, text: string, pinned: boolean): void {
    const rect = anchor.getBoundingClientRect();
    const margin = 8;
    const maxWidth = Math.min(280, window.innerWidth - margin * 2);
    const left = Math.min(Math.max(rect.left, margin), window.innerWidth - maxWidth - margin);
    const below = rect.bottom + 6;
    const estimatedHeight = 44;
    const top = below + estimatedHeight > window.innerHeight - margin
      ? Math.max(margin, rect.top - estimatedHeight - 6)
      : below;
    stateTooltip = { text, left, top, pinned };
  }

  function showStateTooltip(event: MouseEvent, item: ShellResourceItem): void {
    if (!item.statusLabel || drag) return;
    positionStateTooltip(event.currentTarget as Element, item.statusLabel, false);
  }

  function toggleStateTooltip(event: MouseEvent, item: ShellResourceItem): void {
    event.preventDefault();
    event.stopPropagation();
    if (!item.statusLabel) return;
    const alreadyPinned = stateTooltip?.pinned && stateTooltip.text === item.statusLabel;
    if (alreadyPinned) {
      hideStateTooltip();
      return;
    }
    positionStateTooltip(event.currentTarget as Element, item.statusLabel, true);
  }

  async function activate(event: MouseEvent, item: ShellResourceItem): Promise<void> {
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest(".drag-handle") || target?.closest(".task-state-icon")) return;
    hideStateTooltip();
    try {
      if (item.type === "project" && target?.closest("[data-project-toggle]")) {
        // Pointer clicks on the chevron focus the row button, and the
        // tree-item:focus-within rule would then pin the follow star
        // visible even after the pointer leaves the row. Drop that focus.
        (event.currentTarget as HTMLElement | null)?.blur();
        await onToggle(item.id);
      }
      else {
        // Pointer clicks on the row itself focus the row button, and the
        // tree-item:focus-within rule would then pin the follow star
        // visible even after the pointer leaves the row. Drop that focus;
        // keyboard activation (detail === 0) keeps it.
        if (event.detail > 0) (event.currentTarget as HTMLElement | null)?.blur();
        await onSelect(item.id);
      }
    } catch (reason) {
      onToast(reason instanceof Error ? reason.message : String(reason));
    }
  }

  async function toggleAttention(event: Event, item: ShellResourceItem): Promise<void> {
    event.preventDefault();
    event.stopPropagation();
    // Pointer clicks focus the star (tabindex="0"), and the
    // tree-item:focus-within rule would then pin it visible even after the
    // pointer leaves the row. Drop that focus; keyboard toggles keep it.
    if (event instanceof MouseEvent) (event.currentTarget as HTMLElement | null)?.blur();
    try {
      await onToggleAttention(item.id, !item.followed);
    } catch (reason) {
      onToast(reason instanceof Error ? reason.message : String(reason));
    }
  }

  function attentionKeydown(event: KeyboardEvent, item: ShellResourceItem): void {
    if (event.key !== "Enter" && event.key !== " ") return;
    void toggleAttention(event, item);
  }
</script>

<section class="tree-section" data-component-owner="project-tree">
  <div class="section-title"><span class="section-label">Projects</span><button id="newProjectButton" type="button" title="New project" onclick={onCreate}><Icon name="plus" /></button></div>
  <nav id="projectTree" class="project-tree" data-navigation-identity={identity}>
    {#if loading}
      <div class="empty-state"><Icon name="loader-circle" className="empty-state-icon" /><strong>Loading workspace</strong><span>Refreshing navigation...</span></div>
    {:else if error}
      <div class="empty-state" role="alert"><Icon name="circle-alert" className="empty-state-icon" /><strong>Workspace unavailable</strong><span>{error}</span></div>
    {:else if projects.length === 0}
      <div class="empty-state"><Icon name="folder-search" className="empty-state-icon" /><strong>No workspace yet</strong><span>Add a workspace path to begin.</span></div>
    {:else}
      {#each projects as project (project.id)}
        <button type="button" class={`tree-item ${statusClass(project.status)} ${project.active ? "active" : ""} ${drag?.id === project.id ? "drag-source" : ""} ${rowDropClass(project.id)}`} aria-label={project.ariaLabel || undefined} onclick={(event) => activate(event, project)} ondragover={(event) => updateDrop(event, { kind: "project", id: project.id, projectId: "" })} ondrop={(event) => commitDrop(event, { kind: "project", id: project.id, projectId: "" })}>
          <span class="chevron" class:expanded={project.expanded} data-project-toggle={project.children.length ? project.id : undefined}>{#if project.children.length}<Icon name="chevron-right" />{/if}</span>
          <Icon name="folder" className="tree-icon" />
          <span class="name"><span class="name-text">{project.title}</span><span class="resource-ref">{project.ref}</span>{#if project.summary && !project.expanded}<span class="project-task-summary" aria-hidden="true"><span class="project-task-summary-count">{project.summary.taskLabel}</span><span class="project-task-summary-separator">·</span><span class="project-task-summary-running">{project.summary.runningLabel}</span></span>{/if}</span>
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <span class:followed={project.followed} class="attention-star" role="checkbox" aria-checked={project.followed} tabindex="0" aria-label={project.followed ? `Unfollow ${project.title}` : `Follow ${project.title}`} title={project.followed ? "Unfollow" : "Follow"} onclick={(event) => toggleAttention(event, project)} onkeydown={(event) => attentionKeydown(event, project)}><Icon name="star" /></span>
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <span class="drag-handle" draggable="true" title="Drag to reorder" ondragstart={(event) => beginDrag(event, { kind: "project", id: project.id, projectId: "" })} ondragend={finishDrag}><Icon name="grip-vertical" className="drag-handle-icon" /></span>
        </button>
        {#if project.expanded}
          <div class="task-group">
            {#each project.children as task (task.id)}
              <button type="button" class={`tree-item task-item ${statusClass(task.status)} ${task.active ? "active" : ""} ${drag?.id === task.id ? "drag-source" : ""} ${rowDropClass(task.id)}`} aria-label={task.ariaLabel || undefined} onmouseenter={(event) => showStateTooltip(event, task)} onmouseleave={() => { if (!stateTooltip?.pinned) hideStateTooltip(); }} onclick={(event) => activate(event, task)} ondragover={(event) => updateDrop(event, { kind: "task", id: task.id, projectId: project.id })} ondrop={(event) => commitDrop(event, { kind: "task", id: task.id, projectId: project.id })}>
                <span class="chevron"></span>
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <span class="task-state-icon" onclick={(event) => toggleStateTooltip(event, task)}><StatusPresentation status={task.status} /></span>
                <span class="name"><span class="name-text">{task.title}</span><span class="resource-ref">{task.ref}</span></span>
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <span class:followed={task.followed} class="attention-star" role="checkbox" aria-checked={task.followed} tabindex="0" aria-label={task.followed ? `Unfollow ${task.title}` : `Follow ${task.title}`} title={task.followed ? "Unfollow" : "Follow"} onclick={(event) => toggleAttention(event, task)} onkeydown={(event) => attentionKeydown(event, task)}><Icon name="star" /></span>
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <span class="drag-handle" draggable="true" title="Drag to reorder" ondragstart={(event) => beginDrag(event, { kind: "task", id: task.id, projectId: project.id })} ondragend={finishDrag}><Icon name="grip-vertical" className="drag-handle-icon" /></span>
              </button>
            {/each}
          </div>
        {/if}
      {/each}
    {/if}
  </nav>
  {#if stateTooltip}
    <div class="task-state-tooltip" role="tooltip" style={`left:${stateTooltip.left}px;top:${stateTooltip.top}px`}>{stateTooltip.text}</div>
  {/if}
</section>
