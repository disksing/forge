import type { ShellStatusPresentation } from "../models/shell";
import type { ResourceRecord, ResourceRuntime, WorkspaceTree } from "../models/workspace";

export interface TaskStatusState {
  kind: string;
  className: string;
  iconName: string;
  label: string;
  recentOutput: boolean;
}

export interface OperationalStatusPresentation {
  statuses: TaskStatusState[];
  hasTaskState: boolean;
  className: string;
  layoutClassName: string;
  slotClassName: string;
}

export interface TaskOperationalState {
  session: TaskStatusState | null;
  className: string;
  label: string;
  statusPresentation: OperationalStatusPresentation;
}

export interface ProjectTaskSummary {
  taskCount: number;
  runningCount: number;
  taskLabel: string;
  runningLabel: string;
  text: string;
  ariaLabel: string;
}

export interface ShellProjectionDependencies {
  tree(): WorkspaceTree | null;
  findResource(id: string): ResourceRecord | null;
  agentName(agentId: string | undefined): string;
  now?(): number;
}

const RUNNING_RESOURCE_STATES = new Set(["starting", "running", "waiting_approval", "recovering", "stopping"]);
const OUTPUT_FRESH_WINDOW_MS = 60_000;

export function createShellProjection(dependencies: ShellProjectionDependencies) {
  const now = dependencies.now || Date.now;

  function resourceRefText(id: string): string {
    if (!id) return "";
    const segment = id.includes(".") ? id.slice(id.lastIndexOf(".") + 1) : id;
    const match = segment.match(/^(?:project|task)(\d+)$/);
    return `#${match ? match[1] : segment}`;
  }

  function statusModel(presentation: OperationalStatusPresentation): ShellStatusPresentation {
    return {
      hasTaskState: presentation.hasTaskState,
      className: presentation.className,
      layoutClassName: presentation.layoutClassName,
      slotClassName: presentation.slotClassName,
      statuses: presentation.statuses.map((status, index) => ({
        key: `${status.kind || status.iconName || "status"}:${index}`,
        className: status.className,
        iconName: status.iconName || "circle",
        recentOutput: status.recentOutput,
      })),
    };
  }

  function applyCustomOrder<Item extends { id: string }>(items: Item[], orderedIds: string[] | undefined): Item[] {
    if (!orderedIds?.length) return items;
    const rank = new Map<string, number>();
    orderedIds.forEach((id, index) => { if (!rank.has(id)) rank.set(id, index); });
    return items.map((item, index) => ({ item, index })).sort((leftEntry, rightEntry) => {
      const left = rank.get(leftEntry.item.id) ?? rank.size + leftEntry.index;
      const right = rank.get(rightEntry.item.id) ?? rank.size + rightEntry.index;
      return left === right ? leftEntry.index - rightEntry.index : left - right;
    }).map((entry) => entry.item);
  }

  function moveIdInList(ids: string[], dragId: string, targetId: string, after: boolean): string[] {
    if (dragId === targetId) return ids;
    const next = ids.filter((id) => id !== dragId);
    let index = next.indexOf(targetId);
    if (index < 0) return ids;
    if (after) index += 1;
    next.splice(index, 0, dragId);
    return next;
  }

  function hasRecentAgentOutput(runtime: ResourceRuntime): boolean {
    const outputAt = new Date(runtime.lastOutputAt || "").getTime();
    if (Number.isFinite(outputAt)) return now() - outputAt <= OUTPUT_FRESH_WINDOW_MS;
    if (!RUNNING_RESOURCE_STATES.has(runtime.status || "")) return false;
    const updatedAt = new Date(runtime.updatedAt || "").getTime();
    return Number.isFinite(updatedAt) && now() - updatedAt <= OUTPUT_FRESH_WINDOW_MS;
  }

  function resourceStatusState(runtime: ResourceRuntime | undefined): TaskStatusState | null {
    if (!runtime?.status || runtime.status === "archived") return null;
    const recentOutput = hasRecentAgentOutput(runtime);
    switch (runtime.status) {
      case "running": return { kind: "resource-running", className: "task-status-session-running", iconName: "loader-circle", label: "Resource working", recentOutput };
      case "waiting_approval": return { kind: "resource-approval", className: "task-status-attention", iconName: "shield-question", label: "Resource waiting for approval", recentOutput };
      case "starting":
      case "stopping":
      case "recovering":
      case "idle":
      case "idle-suspended":
      case "stopped":
        return null;
      default: return { kind: "resource-active", className: "task-status-neutral", iconName: "circle-dot", label: `Resource ${runtime.status}`, recentOutput };
    }
  }

  function operationalStatusPresentation(statuses: Array<TaskStatusState | null>): OperationalStatusPresentation {
    const visible = statuses.filter((status): status is TaskStatusState => Boolean(status));
    const hasTaskState = visible.length > 0;
    return {
      statuses: visible,
      hasTaskState,
      className: visible.map((status) => status.className).filter(Boolean).join(" "),
      layoutClassName: !hasTaskState ? "" : visible.length > 1 ? "has-task-status-dual" : "has-task-status",
      slotClassName: [visible.length === 1 ? "task-status-single" : "", visible.length > 1 ? "task-status-dual" : ""].filter(Boolean).join(" "),
    };
  }

  function taskOperationalState(item: ResourceRecord): TaskOperationalState {
    const status = resourceStatusState(item.runtime);
    const label = status?.label || "";
    const statusPresentation = operationalStatusPresentation(status ? [status] : []);
    return { session: status, statusPresentation, className: statusPresentation.className, label };
  }

  function taskWorkflowState(item: ResourceRecord): TaskOperationalState {
    const note = String(item.stateNote || "").trim();
    let status: TaskStatusState;
    switch (item.state) {
      case "not_started": status = { kind: "task-not-started", className: "task-state-not-started", iconName: "circle", label: "Not started", recentOutput: false }; break;
      case "in_progress": status = { kind: "task-in-progress", className: "task-state-in-progress", iconName: "loader-circle", label: "In progress", recentOutput: false }; break;
      case "waiting": status = { kind: "task-waiting", className: "task-state-waiting", iconName: "clock-3", label: "Waiting", recentOutput: false }; break;
      case "blocked": status = { kind: "task-blocked", className: "task-state-blocked", iconName: "circle-alert", label: "Blocked", recentOutput: false }; break;
      case "paused": status = { kind: "task-paused", className: "task-state-paused", iconName: "pause-circle", label: "Paused", recentOutput: false }; break;
      case "completed": status = { kind: "task-completed", className: "task-state-completed", iconName: "check-circle", label: "Completed", recentOutput: false }; break;
      case "error": status = { kind: "task-error", className: "task-state-error", iconName: "octagon-x", label: "Error", recentOutput: false }; break;
      default: status = { kind: "task-unknown", className: "task-state-unknown", iconName: "help-circle", label: "State unknown", recentOutput: false };
    }
    const label = note ? `${status.label}: ${note}` : status.label;
    const statusPresentation = operationalStatusPresentation([status]);
    return { session: status, statusPresentation, className: statusPresentation.className, label };
  }

  function noTaskOperationalState(): TaskOperationalState {
    return { session: null, className: "", label: "", statusPresentation: operationalStatusPresentation([]) };
  }

  function projectTaskSummary(project: ResourceRecord): ProjectTaskSummary {
    const tasks = (project.children || []).filter((task) => task.archived !== true);
    const running = tasks.filter((task) => task.state === "in_progress").length;
    const taskLabel = `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}`;
    const runningLabel = `${running} working`;
    return { taskCount: tasks.length, runningCount: running, taskLabel, runningLabel, text: `${taskLabel} · ${runningLabel}`, ariaLabel: `Open tasks: ${taskLabel}; ${runningLabel}` };
  }

  function taskStatusKey(status: TaskStatusState | null): string {
    return status ? `${status.kind}:${status.iconName}:${status.recentOutput}` : "none";
  }

  function taskOperationalStateKey(): string {
    const tree = dependencies.tree();
    if (!tree) return "";
    const parts: string[] = [];
    for (const project of tree.projects) {
      const summary = projectTaskSummary(project);
      parts.push(`${project.id}:tasks=${summary.taskCount}:${summary.runningCount}`);
      for (const task of project.children || []) {
        const taskState = taskWorkflowState(task);
        parts.push(`${task.id}:state=${taskStatusKey(taskState.session)}:${taskState.label}`);
      }
    }
    return parts.join("|");
  }

  // archiveRedirectTarget resolves the resource that should become selected after
  // archiving resourceId. It follows the tree view ordering (custom project/task
  // order applied on top of the tree), matching what the user sees in the sidebar.
  function archiveRedirectTarget(resourceId: string, projectOrder: string[], taskOrder: Record<string, string[]>): string {
    const tree = dependencies.tree();
    if (!tree) return "workspace";
    const projects = applyCustomOrder(tree.projects || [], projectOrder);
    for (const project of projects) {
      const tasks = applyCustomOrder(project.children || [], taskOrder[project.id]);
      const taskIndex = tasks.findIndex((task) => task.id === resourceId);
      if (taskIndex < 0) continue;
      if (taskIndex + 1 < tasks.length) return tasks[taskIndex + 1].id;
      if (taskIndex - 1 >= 0) return tasks[taskIndex - 1].id;
      return project.id;
    }
    const projectIndex = projects.findIndex((project) => project.id === resourceId);
    if (projectIndex >= 0) {
      if (projectIndex + 1 < projects.length) return projects[projectIndex + 1].id;
      if (projectIndex - 1 >= 0) return projects[projectIndex - 1].id;
    }
    return "workspace";
  }

  return {
    applyCustomOrder,
    archiveRedirectTarget,
    moveIdInList,
    noTaskOperationalState,
    operationalStatusPresentation,
    projectTaskSummary,
    resourceRefText,
    resourceStatusState,
    statusModel,
    taskOperationalState,
    taskWorkflowState,
    taskOperationalStateKey,
  };
}
