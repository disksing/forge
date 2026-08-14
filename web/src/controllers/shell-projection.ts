import type { ShellStatusPresentation } from "../models/shell";
import type { ResourceRecord, ResourceRuntime, WorkspaceTree } from "../models/workspace";

export interface TaskStatusState {
  kind: string;
  className: string;
  iconName: string;
  label: string;
  dimension: string;
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
    if (!runtime?.status || runtime.status === "archived" ||
      (["stopped", "idle-suspended"].includes(runtime.status) && runtime.resumable !== true)) return null;
    const recentOutput = hasRecentAgentOutput(runtime);
    switch (runtime.status) {
      case "starting": return { kind: "resource-starting", className: "task-status-session-running", iconName: "loader-circle", label: "Resource starting", dimension: "resource", recentOutput };
      case "running": return { kind: "resource-running", className: "task-status-session-running", iconName: "loader-circle", label: "Resource working", dimension: "resource", recentOutput };
      case "waiting_approval": return { kind: "resource-approval", className: "task-status-attention", iconName: "shield-question", label: "Resource waiting for approval", dimension: "resource", recentOutput };
      case "stopping": return { kind: "resource-stopping", className: "task-status-session-stopping", iconName: "loader-circle", label: "Resource stopping", dimension: "resource", recentOutput };
      case "recovering": return { kind: "resource-recovering", className: "task-status-attention", iconName: "rotate-ccw", label: "Resource recovering", dimension: "resource", recentOutput };
      case "idle": return { kind: "resource-idle", className: "task-status-info", iconName: "message-square", label: "Resource ready", dimension: "resource", recentOutput };
      case "idle-suspended":
      case "stopped": return { kind: "resource-suspended", className: "task-status-info", iconName: "pause-circle", label: "Resource sleeping", dimension: "resource", recentOutput };
      default: return { kind: "resource-active", className: "task-status-neutral", iconName: "circle-dot", label: `Resource ${runtime.status}`, dimension: "resource", recentOutput };
    }
  }

  function taskStatusState(kind: string, className: string, iconName: string, label: string, dimension: string, runtime?: ResourceRuntime): TaskStatusState {
    return { kind, className, iconName, label, dimension, recentOutput: Boolean(runtime && hasRecentAgentOutput(runtime)) };
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
    const hideRestingTaskStatus = item.type === "task" && ["resource-idle", "resource-suspended"].includes(status?.kind || "");
    const statusPresentation = operationalStatusPresentation(hideRestingTaskStatus ? [] : [status]);
    return { session: status, statusPresentation, className: statusPresentation.className, label };
  }

  function noTaskOperationalState(): TaskOperationalState {
    return { session: null, className: "", label: "", statusPresentation: operationalStatusPresentation([]) };
  }

  function projectTaskSummary(project: ResourceRecord): ProjectTaskSummary {
    const tasks = (project.children || []).filter((task) => task.archived !== true);
    const running = tasks.filter((task) => RUNNING_RESOURCE_STATES.has(task.runtime?.status || "")).length;
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
    if (tree.scheduler) {
      const schedulerState = taskOperationalState(tree.scheduler);
      parts.push(`scheduler:resource=${taskStatusKey(schedulerState.session)}:${schedulerState.label}`);
    }
    for (const project of tree.projects) {
      const state = taskOperationalState(project);
      const summary = projectTaskSummary(project);
      parts.push(`${project.id}:resource=${taskStatusKey(state.session)}:${state.label}:tasks=${summary.taskCount}:${summary.runningCount}`);
      for (const task of project.children || []) {
        const taskState = taskOperationalState(task);
        parts.push(`${task.id}:resource=${taskStatusKey(taskState.session)}:${taskState.label}`);
      }
    }
    return parts.join("|");
  }

  return {
    applyCustomOrder,
    moveIdInList,
    noTaskOperationalState,
    operationalStatusPresentation,
    projectTaskSummary,
    resourceRefText,
    resourceStatusState,
    statusModel,
    taskOperationalState,
    taskOperationalStateKey,
    taskStatusState,
  };
}
