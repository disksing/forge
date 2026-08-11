import type { SelfDrivingBarModel, SelfDrivingDialogModel } from "../models/chat";
import type { AgentOption } from "../models/common";
import type { AgentConfig, ResourceRecord, SelfDrivingState } from "../models/workspace";
import { errorMessage } from "../runtime/errors";
import type { AgentRunRecord, SelfDrivingMutationOptions } from "./agent-session-controller";

interface DialogState {
  open: boolean;
  identity: number;
  resourceId: string;
  reuseCurrentSession: boolean;
  agentName: string;
  runInstructions: string;
  completionCriteria: string;
  submitting: boolean;
  error: string;
  unknown: boolean;
  returnFocus: HTMLElement | null;
}

export interface SelfDrivingViewDependencies {
  workspaceId(): string;
  selectedId(): string;
  selectedResource(): ResourceRecord | null;
  detail(resourceId: string): ResourceRecord | null;
  currentRun(): AgentRunRecord | null;
  runs(): AgentRunRecord[];
  agents(): AgentConfig[];
  agentOptions(): AgentOption[];
  selectedAgent(): AgentConfig | null;
  expanded(): boolean;
  setExpanded(expanded: boolean): void;
  operationActive(kind: "self-driving-save" | "self-driving-disable"): boolean;
  setDesired(options: SelfDrivingMutationOptions): Promise<void>;
  disable(): Promise<void>;
  publishDialog(model: SelfDrivingDialogModel): void;
  refreshBar(): void;
  refreshIcons(): void;
  toast(message: string): void;
}

export function selfDrivingPresentation(condition: string, enabled = false): { key: string; label: string; icon: string } {
  const presentations: Record<string, { label: string; icon: string }> = {
    disabled: { label: "Off", icon: "circle-dashed" },
    ready: { label: "Ready", icon: "list-start" },
    waiting: { label: "Waiting", icon: "pause" },
    blocked: { label: "Blocked", icon: "octagon-alert" },
    error: { label: "Error", icon: "circle-x" },
    needs_configuration: { label: "Needs configuration", icon: "settings" },
  };
  const state = enabled ? condition.trim().toLowerCase() || "ready" : "disabled";
  return { key: Object.hasOwn(presentations, state) ? state : "unknown", ...(presentations[state] || { label: state || "Unknown", icon: "circle-help" }) };
}

export function createSelfDrivingViewController(dependencies: SelfDrivingViewDependencies) {
  let identity = 0;
  let dialog = emptyDialog();

  function emptyDialog(): DialogState {
    return { open: false, identity: ++identity, resourceId: "", reuseCurrentSession: false, agentName: "", runInstructions: "", completionCriteria: "", submitting: false, error: "", unknown: false, returnFocus: null };
  }

  function statusReason(state: SelfDrivingState | null): SelfDrivingBarModel["statusReason"] {
    if (!state) return null;
    const notificationError = typeof state.notificationError === "string" ? state.notificationError : state.notificationError?.message;
    const text = String(state.conditionReason || notificationError || "").trim();
    return text ? { label: "Status", text } : null;
  }

  function summary(state: SelfDrivingState | null, detail: ResourceRecord): string {
    if (!state) return "Self-Driving is off.";
    const reason = statusReason(state);
    if (reason) return `${reason.label}: ${reason.text}`;
    if (state.wakeContext?.condition) return `Wake condition: ${state.wakeContext.condition}`;
    const actual = dependencies.currentRun();
    if (actual?.schedulerTurn && actual.resourceId === detail.id) {
      const selection = `${actual.agentProfile ? `${actual.agentProfile} → ` : ""}${actual.agentHubAgentName || ""}`.trim();
      if (selection) return `Agent: ${selection}`;
    }
    return `Revision ${Number(state.revision) || 0}`;
  }

  function needsConfiguration(detail: ResourceRecord): boolean {
    return !detail.selfDriving?.agentName && !(detail.selfDriving?.preferredAgentProfiles || []).length;
  }

  function barModel(detail: ResourceRecord | null | undefined): SelfDrivingBarModel {
    const selected = dependencies.selectedResource();
    if (!selected || selected.type !== "task" || !detail) return {
      identity: `${dependencies.workspaceId()}:${dependencies.selectedId()}:hidden`, visible: false, status: selfDrivingPresentation("disabled"), summary: "", expanded: false, hasProjection: false,
      revision: 0, enabled: false, preferredProfiles: [], actualAgent: "", actualReason: "", waitingSummary: "", wakeCondition: "", wakeFallback: false, lastOutcome: null, statusReason: null, pending: false,
      onToggleEnabled: () => undefined, onToggleDetails: () => undefined, onIconsChanged: dependencies.refreshIcons,
    };
    const state = detail.selfDriving || null;
    const actual = dependencies.currentRun();
    const actualAgent = actual?.schedulerTurn && actual.resourceId === detail.id ? `${actual.agentProfile ? `${actual.agentProfile} → ` : ""}${actual.agentHubAgentName || ""}` : "";
    const pending = dependencies.operationActive("self-driving-save") || dependencies.operationActive("self-driving-disable");
    return {
      identity: `${dependencies.workspaceId()}:${selected.id}:${Number(state?.revision) || 0}`,
      visible: true,
      status: selfDrivingPresentation(state?.condition || "disabled", Boolean(state?.enabled)),
      summary: summary(state, detail),
      expanded: Boolean(state && dependencies.expanded()),
      hasProjection: Boolean(state),
      revision: Number(state?.revision) || 0,
      enabled: Boolean(state?.enabled),
      preferredProfiles: state?.preferredAgentProfiles || [],
      actualAgent,
      actualReason: actualAgent ? actual?.agentSelectionReason || "" : "",
      waitingSummary: state?.wakeContext?.summary || "",
      wakeCondition: state?.wakeContext?.condition || "",
      wakeFallback: Boolean(state?.wakeContext?.fallback),
      lastOutcome: state?.lastOutcome ? { status: state.lastOutcome.status || "", reason: state.lastOutcome.reason || "" } : null,
      statusReason: statusReason(state),
      pending,
      onToggleEnabled: () => {
        if (pending) return;
        if (state?.enabled) void dependencies.disable().catch((reason) => dependencies.toast(errorMessage(reason)));
        else if (needsConfiguration(detail)) openDialog();
        else void dependencies.setDesired({ enabled: true }).catch((reason) => dependencies.toast(errorMessage(reason)));
      },
      onToggleDetails: () => {
        dependencies.setExpanded(!dependencies.expanded());
        dependencies.refreshBar();
      },
      onIconsChanged: dependencies.refreshIcons,
    };
  }

  function idleSession(resourceId: string): AgentRunRecord | null {
    return dependencies.runs().find((run) => run.resourceId === resourceId && run.status === "idle" && !run.schedulerTurn && Boolean(run.agentHubSessionId?.trim())) || null;
  }

  function openDialog(): void {
    const selected = dependencies.selectedResource();
    const detail = selected ? dependencies.detail(selected.id) || selected : null;
    if (!selected || detail?.type !== "task") return dependencies.toast("Select a task first.");
    const reuseRun = idleSession(selected.id);
    const agents = dependencies.agents();
    const savedName = detail.selfDriving?.agentName?.trim() || "";
    const savedAgent = agents.find((agent) => agent.id.toLowerCase() === savedName.toLowerCase());
    dialog = {
      open: true,
      identity: ++identity,
      resourceId: selected.id,
      reuseCurrentSession: Boolean(reuseRun),
      agentName: reuseRun?.agentHubAgentName || savedAgent?.id || dependencies.selectedAgent()?.id || "",
      runInstructions: detail.selfDriving?.prompt || "",
      completionCriteria: detail.selfDriving?.completionCriteria || "",
      submitting: false,
      error: agents.length ? "" : "No enabled AgentHub agents are available. Self-Driving can still be enabled and will report Needs configuration.",
      unknown: false,
      returnFocus: document.activeElement instanceof HTMLElement ? document.activeElement : null,
    };
    renderDialog();
  }

  function closeDialog(): void {
    if (!dialog.open || dialog.submitting) return;
    const returnFocus = dialog.returnFocus;
    dialog = emptyDialog();
    renderDialog();
    if (returnFocus && document.contains(returnFocus)) returnFocus.focus({ preventScroll: true });
  }

  function closeIfIdle(): void {
    if (dialog.open && !dialog.submitting) closeDialog();
  }

  function renderDialog(): void {
    dependencies.publishDialog({
      open: dialog.open,
      identity: `${dialog.identity}:${dialog.resourceId}`,
      resourceId: dialog.resourceId,
      reuseCurrentSession: dialog.reuseCurrentSession,
      agents: dependencies.agentOptions(),
      draft: { agentName: dialog.agentName, runInstructions: dialog.runInstructions },
      submitting: dialog.submitting,
      error: dialog.error,
      unknown: dialog.unknown,
      onClose: closeDialog,
      onSubmit: submitDialog,
      onIconsChanged: dependencies.refreshIcons,
    });
  }

  async function submitDialog(draft: SelfDrivingDialogModel["draft"]): Promise<void> {
    if (!dialog.open || dialog.submitting || dialog.unknown) return;
    dialog.agentName = String(draft.agentName || dialog.agentName).trim();
    dialog.runInstructions = String(draft.runInstructions || "");
    if (!dialog.reuseCurrentSession && !dialog.agentName) {
      dialog.error = "Select an Agent before enabling Self-Driving.";
      return renderDialog();
    }
    dialog.submitting = true;
    dialog.error = "";
    const dialogIdentity = dialog.identity;
    const workspaceId = dependencies.workspaceId();
    const resourceId = dialog.resourceId;
    renderDialog();
    try {
      await dependencies.setDesired({ configured: true, agentName: dialog.agentName, runInstructions: dialog.runInstructions, completionCriteria: dialog.completionCriteria });
      if (dialogIdentity !== dialog.identity || workspaceId !== dependencies.workspaceId() || resourceId !== dependencies.selectedId()) return;
      const returnFocus = dialog.returnFocus;
      dialog = emptyDialog();
      renderDialog();
      if (returnFocus && document.contains(returnFocus)) returnFocus.focus({ preventScroll: true });
    } catch (reason) {
      if (dialogIdentity !== dialog.identity) return;
      dialog.submitting = false;
      const apiError = reason as { status?: unknown } | null;
      const message = errorMessage(reason, "Self-Driving could not be enabled.");
      dialog.error = message;
      dialog.unknown = !Number.isFinite(Number(apiError?.status)) || Number(apiError?.status) >= 500 || message.includes("outcome may be unknown") || message.includes("was updated but the start message failed");
      renderDialog();
    }
  }

  return { barModel, closeIfIdle, openDialog, renderDialog };
}
