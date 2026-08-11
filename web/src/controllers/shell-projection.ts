import type { ShellStatusPresentation } from "../models/shell";
import type { ResourceRecord, SelfDrivingState, WorkspaceSession, WorkspaceTree } from "../models/workspace";

export interface TaskStatusState {
  kind: string;
  className: string;
  iconName: string;
  label: string;
  dimension: string;
  recentOutput: boolean;
}

export interface TaskLockState { kind: string; className: string; label: string }

export interface OperationalStatusPresentation {
  statuses: TaskStatusState[];
  lock: TaskLockState | null;
  hasTaskState: boolean;
  className: string;
  layoutClassName: string;
  slotClassName: string;
}

export interface TaskOperationalState {
  selfDriving: TaskStatusState | null;
  session: TaskStatusState | null;
  className: string;
  label: string;
  lock: TaskLockState | null;
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
  controls(session: WorkspaceSession): Array<{ resourceId: string; path: string }>;
  findResource(id: string): ResourceRecord | null;
  agentName(agentId: string | undefined): string;
  now?(): number;
}

const RUNNING_SESSION_STATES = new Set(["starting", "running", "waiting_approval", "recovering"]);
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
      lock: presentation.lock ? { className: presentation.lock.className } : null,
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

  function sortedSessionsForDisplay(sessions: WorkspaceSession[]): WorkspaceSession[] {
    return sessions.map((session, index) => ({ session, index })).sort((leftEntry, rightEntry) => {
      const left = Date.parse(leftEntry.session.startedAt || "");
      const right = Date.parse(rightEntry.session.startedAt || "");
      const leftOK = Number.isFinite(left);
      const rightOK = Number.isFinite(right);
      if (leftOK && rightOK && left !== right) return left - right;
      if (leftOK !== rightOK) return leftOK ? -1 : 1;
      if (leftEntry.session.id !== rightEntry.session.id) return leftEntry.session.id < rightEntry.session.id ? -1 : 1;
      return leftEntry.index - rightEntry.index;
    }).map((entry) => entry.session);
  }

  function hasRecentAgentOutput(session: WorkspaceSession): boolean {
    const outputAt = new Date(session.agentRunLastOutputAt || "").getTime();
    if (Number.isFinite(outputAt)) return now() - outputAt <= OUTPUT_FRESH_WINDOW_MS;
    if (!["running", "starting"].includes(session.agentRunStatus || "")) return false;
    const updatedAt = new Date(session.agentRunUpdatedAt || "").getTime();
    return Number.isFinite(updatedAt) && now() - updatedAt <= OUTPUT_FRESH_WINDOW_MS;
  }

  function taskStatusState(kind: string, className: string, iconName: string, label: string, dimension: string, session: WorkspaceSession | null = null): TaskStatusState {
    return { kind, className, iconName, label, dimension, recentOutput: Boolean(session && hasRecentAgentOutput(session)) };
  }

  function sessionStatusPresentation(session: WorkspaceSession): TaskStatusState {
    const status = session.agentRunStatus || "";
    switch (status) {
      case "starting": return taskStatusState("session-starting", "task-status-session-running", "loader-circle", "Session starting", "session", session);
      case "running": return taskStatusState("session-running", "task-status-session-running", "loader-circle", "Session running", "session", session);
      case "waiting_approval": return taskStatusState("session-approval", "task-status-attention", "shield-question", "Session waiting for approval", "session", session);
      case "stopping": return taskStatusState("session-stopping", "task-status-session-stopping", "loader-circle", "Session stopping", "session", session);
      case "recovering": return taskStatusState("session-recovering", "task-status-attention", "rotate-ccw", "Session recovering", "session", session);
      case "idle": return taskStatusState("session-idle", "task-status-info", "message-square", "Session waiting for input", "session", session);
      default: return taskStatusState("session-active", "task-status-neutral", "circle-dot", status ? `Session ${status}` : "Session active", "session", session);
    }
  }

  function deriveTaskSelfDrivingState(selfDriving: SelfDrivingState | null | undefined): TaskStatusState | null {
    if (!selfDriving?.enabled) return null;
    const state = selfDriving.condition || "ready";
    if (state === "error") return taskStatusState("error", "task-status-danger", "triangle-alert", "Self-Driving error", "self-driving");
    if (state === "blocked" || state === "needs_configuration") return taskStatusState(state, "task-status-attention", "square", `Self-Driving ${state.replace(/_/g, " ")}`, "self-driving");
    if (state === "waiting") return taskStatusState("waiting", "task-status-attention", "pause", "Self-Driving waiting", "self-driving");
    if (state === "ready") return taskStatusState("ready", "task-status-queued", "clock", "Self-Driving ready", "self-driving");
    return taskStatusState("unknown", "task-status-neutral", "circle-help", `Self-Driving ${state || "unknown"}`, "self-driving");
  }

  function deriveTaskSessionState(sessions: WorkspaceSession[]): TaskStatusState | null {
    for (const status of ["waiting_approval", "starting", "running", "stopping", "recovering", "idle"]) {
      const session = sessions.find((item) => item.agentRunStatus === status);
      if (session) return sessionStatusPresentation(session);
    }
    return sessions.length ? sessionStatusPresentation(sessions[0]) : null;
  }

  function operationalStatusPresentation(statuses: Array<TaskStatusState | null>, lock: TaskLockState | null = null): OperationalStatusPresentation {
    const visible = statuses.filter((status): status is TaskStatusState => Boolean(status));
    const hasTaskState = visible.length > 0 || Boolean(lock);
    return {
      statuses: visible,
      lock,
      hasTaskState,
      className: visible.map((status) => status.className).filter(Boolean).join(" "),
      layoutClassName: !hasTaskState ? "" : visible.length > 1 ? "has-task-status-dual" : "has-task-status",
      slotClassName: [
        visible.length === 0 && lock ? "task-status-lock-only" : "",
        visible.length === 1 ? "task-status-single" : "",
        visible.length > 1 ? "task-status-dual" : "",
      ].filter(Boolean).join(" "),
    };
  }

  function taskAgentSessions(resourceId: string): WorkspaceSession[] {
    return resourceId ? (dependencies.tree()?.sessions || []).filter((session) => session.resourceId === resourceId || dependencies.controls(session).some((control) => control.resourceId === resourceId)) : [];
  }

  function resourceLocks(resourceId: string): WorkspaceSession[] {
    return resourceId ? (dependencies.tree()?.sessions || []).filter((session) => dependencies.controls(session).some((control) => control.resourceId === resourceId)) : [];
  }

  function deriveTaskLockState(locks: WorkspaceSession[]): TaskLockState | null {
    if (!locks.length) return null;
    const external = locks.find((session) => session.source === "external");
    const owner = external || locks[0];
    const ownerLabel = owner.source === "external" ? "an external session" : `${dependencies.agentName(owner.agentRunAgentName)} session`;
    return {
      kind: external ? "external" : "internal",
      className: external ? "task-lock-external" : "task-lock-internal",
      label: locks.length > 1 ? `Locked by ${locks.length} sessions including ${ownerLabel}` : `Locked by ${ownerLabel}`,
    };
  }

  function taskOperationalLabel(selfDriving: SelfDrivingState | null | undefined, sessions: WorkspaceSession[], lock: TaskLockState | null): string {
    const parts: string[] = [];
    if (selfDriving) parts.push(`Self-Driving ${selfDriving.enabled ? "on" : "off"}, ${selfDriving.condition}, revision ${selfDriving.revision}`);
    if (sessions.length === 1) parts.push(`${sessions[0].schedulerTurn ? "Self-Driving session" : "Agent session"} ${(sessions[0].agentRunStatus || "open").replace("waiting_approval", "waiting for approval")}`);
    else if (sessions.length > 1) parts.push(`${sessions.length} agent sessions: ${[...new Set(sessions.map((session) => session.agentRunStatus || "open"))].join(", ")}`);
    if (lock) parts.push(lock.label);
    return parts.join(" · ");
  }

  function taskOperationalState(item: ResourceRecord): TaskOperationalState {
    const sessions = taskAgentSessions(item.id);
    const selfDriving = deriveTaskSelfDrivingState(item.selfDriving);
    const session = deriveTaskSessionState(sessions);
    const lock = deriveTaskLockState(resourceLocks(item.id));
    const statusPresentation = operationalStatusPresentation([selfDriving, session], lock);
    return { selfDriving, session, lock, statusPresentation, className: statusPresentation.className, label: taskOperationalLabel(item.selfDriving, sessions, lock) };
  }

  function noTaskOperationalState(): TaskOperationalState {
    return { selfDriving: null, session: null, className: "", label: "", lock: null, statusPresentation: operationalStatusPresentation([]) };
  }

  function projectTaskSummary(project: ResourceRecord): ProjectTaskSummary {
    const tasks = (project.children || []).filter((task) => task.archived !== true);
    const running = new Set(tasks.filter((task) => taskAgentSessions(task.id).some((session) => session.source === "internal" && RUNNING_SESSION_STATES.has(session.agentRunStatus || ""))).map((task) => task.id));
    const taskLabel = `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}`;
    const runningLabel = `${running.size} running`;
    return { taskCount: tasks.length, runningCount: running.size, taskLabel, runningLabel, text: `${taskLabel} · ${runningLabel}`, ariaLabel: `Open tasks: ${taskLabel}; ${runningLabel}` };
  }

  function taskStatusKey(status: TaskStatusState | null): string {
    return status ? `${status.kind}:${status.iconName}:${status.recentOutput}` : "none";
  }

  function taskOperationalStateKey(): string {
    const tree = dependencies.tree();
    if (!tree) return "";
    const parts: string[] = [];
    for (const project of tree.projects) {
      const state = taskOperationalState(project);
      const summary = projectTaskSummary(project);
      parts.push(`${project.id}:auto=${taskStatusKey(state.selfDriving)}:session=${taskStatusKey(state.session)}:${state.lock?.kind || "none"}:${state.label}:tasks=${summary.taskCount}:${summary.runningCount}`);
      for (const task of project.children || []) {
        const taskState = taskOperationalState(task);
        parts.push(`${task.id}:auto=${taskStatusKey(taskState.selfDriving)}:session=${taskStatusKey(taskState.session)}:${taskState.lock?.kind || "none"}:${taskState.label}`);
      }
    }
    return parts.join("|");
  }

  function sessionOperationalLabel(session: WorkspaceSession, taskResource: ResourceRecord | null, taskState: TaskOperationalState, sessionStatus: TaskStatusState): string {
    const parts: string[] = [];
    if (taskResource?.selfDriving && taskState.selfDriving) {
      const revision = Number.isFinite(taskResource.selfDriving.revision) ? taskResource.selfDriving.revision : "unknown";
      parts.push(`Self-Driving ${taskResource.selfDriving.condition || "unknown"}, revision ${revision}`);
    }
    if (sessionStatus) parts.push(sessionStatus.label);
    return parts.length ? parts.join(" · ") : session.source === "external" ? "External session active" : "Session active";
  }

  return {
    applyCustomOrder,
    moveIdInList,
    noTaskOperationalState,
    operationalStatusPresentation,
    projectTaskSummary,
    resourceLocks,
    resourceRefText,
    sessionOperationalLabel,
    sessionStatusPresentation,
    sortedSessionsForDisplay,
    statusModel,
    taskAgentSessions,
    taskOperationalState,
    taskOperationalStateKey,
    taskStatusState,
  };
}
