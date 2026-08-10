<script lang="ts">
  import "./ProjectTree.css";

  import { onDestroy } from "svelte";

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

  onDestroy(finishDrag);

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
  }

  async function activate(event: MouseEvent, item: ShellResourceItem): Promise<void> {
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest(".drag-handle")) return;
    try {
      if (item.type === "project" && target?.closest("[data-project-toggle]")) await onToggle(item.id);
      else await onSelect(item.id);
    } catch (reason) {
      onToast(reason instanceof Error ? reason.message : String(reason));
    }
  }
</script>

<section class="tree-section" data-component-owner="project-tree">
  <div class="section-title"><span>Projects</span><button id="newProjectButton" type="button" title="New project" onclick={onCreate}><Icon name="plus" /></button></div>
  <nav id="projectTree" class="project-tree" data-navigation-identity={identity}>
    {#if loading}
      <div class="empty-state"><Icon name="loader-circle" className="empty-state-icon" /><strong>Loading workspace</strong><span>Refreshing navigation...</span></div>
    {:else if error}
      <div class="empty-state" role="alert"><Icon name="circle-alert" className="empty-state-icon" /><strong>Workspace unavailable</strong><span>{error}</span></div>
    {:else if projects.length === 0}
      <div class="empty-state"><Icon name="folder-search" className="empty-state-icon" /><strong>No workspace yet</strong><span>Add a workspace path to begin.</span></div>
    {:else}
      {#each projects as project (project.id)}
        <button type="button" class={`tree-item ${statusClass(project.status)} ${project.active ? "active" : ""} ${drag?.id === project.id ? "drag-source" : ""} ${rowDropClass(project.id)}`} aria-label={project.ariaLabel || undefined} title={project.statusLabel || undefined} onclick={(event) => activate(event, project)} ondragover={(event) => updateDrop(event, { kind: "project", id: project.id, projectId: "" })} ondrop={(event) => commitDrop(event, { kind: "project", id: project.id, projectId: "" })}>
          <span class="chevron" data-project-toggle={project.children.length ? project.id : undefined}>{#if project.children.length}<Icon name={project.expanded ? "chevron-down" : "chevron-right"} />{/if}</span>
          <StatusPresentation status={project.status} />
          <Icon name="folder" className="tree-icon" />
          <span class="name"><span class="name-text">{project.title}</span><span class="resource-ref">{project.ref}</span>{#if project.summary && !project.expanded}<span class="project-task-summary" aria-hidden="true"><span class="project-task-summary-count">{project.summary.taskLabel}</span><span class="project-task-summary-separator">·</span><span class="project-task-summary-running">{project.summary.runningLabel}</span></span>{/if}</span>
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <span class="drag-handle" draggable="true" title="Drag to reorder" ondragstart={(event) => beginDrag(event, { kind: "project", id: project.id, projectId: "" })} ondragend={finishDrag}><Icon name="grip-vertical" className="drag-handle-icon" /></span>
        </button>
        {#if project.expanded}
          <div class="task-group">
            {#each project.children as task (task.id)}
              <button type="button" class={`tree-item task-item ${statusClass(task.status)} ${task.active ? "active" : ""} ${drag?.id === task.id ? "drag-source" : ""} ${rowDropClass(task.id)}`} aria-label={task.ariaLabel || undefined} title={task.statusLabel || undefined} onclick={(event) => activate(event, task)} ondragover={(event) => updateDrop(event, { kind: "task", id: task.id, projectId: project.id })} ondrop={(event) => commitDrop(event, { kind: "task", id: task.id, projectId: project.id })}>
                <span class="chevron"></span>
                <StatusPresentation status={task.status} />
                <Icon name="file-text" className="tree-icon" /><span class="name"><span class="name-text">{task.title}</span><span class="resource-ref">{task.ref}</span></span>
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <span class="drag-handle" draggable="true" title="Drag to reorder" ondragstart={(event) => beginDrag(event, { kind: "task", id: task.id, projectId: project.id })} ondragend={finishDrag}><Icon name="grip-vertical" className="drag-handle-icon" /></span>
              </button>
            {/each}
          </div>
        {/if}
      {/each}
    {/if}
  </nav>
</section>
