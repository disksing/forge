import type { AgentOption } from "./common";

export interface UploadDialogModel {
  open: boolean;
  identity: string;
  workspaceId: string;
  runId: string;
  onDone: (paths: string[], context: { workspaceId: string; runId: string }) => void;
  onIconsChanged: () => void;
}

export interface ComposerModel {
  identity: string;
  workspaceId: string;
  resourceId: string;
  runId: string;
  runStatus: string;
  live: boolean;
  canResume: boolean;
  draft: string;
  draftKey: string;
  draftResetVersion: number;
  unavailableReason: string;
  sending: boolean;
  externalLocked: boolean;
  internalLocked: boolean;
  agents: AgentOption[];
  selectedAgentId: string;
  chooserOpen: boolean;
  sessionStarting: boolean;
  actionsOpen: boolean;
  canEndTurn: boolean;
  endingTurn: boolean;
  closingSession: boolean;
  onDraft: (text: string, context: ComposerContext) => void;
  onSend: (text: string, context: ComposerContext) => Promise<{ accepted: boolean; clear: boolean }>;
  onOpenUpload: () => void;
  onToggleChooser: () => void;
  onChooseAgent: (id: string) => void;
  onToggleActions: () => void;
  onResume: () => void;
  onEndTurn: () => void;
  onCloseSession: () => void;
  onIconsChanged: () => void;
}

export interface ComposerContext {
  workspaceId: string;
  resourceId: string;
  runId: string;
  draftKey: string;
}

export interface AgentRun {
  id: string;
  workspaceId?: string;
  resourceId?: string;
  agentHubSessionId?: string;
  sourceExternalId?: string;
  agentHubAgentName?: string;
  title?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  completionMarker?: string;
  completionSessionId?: string;
  completionEventId?: number;
  completionState?: string;
  agentRunCompletionMarker?: string;
  agentRunCompletionState?: string;
}

export interface AgentEvent {
  id: number;
  type: string;
  time?: string;
  startTime?: string;
  sessionId?: string;
  turnId?: string;
  data?: Record<string, unknown> & { text?: string; append?: boolean; state?: string };
}

export interface AgentNotice {
  source?: string;
  type?: string;
  data?: Record<string, unknown> & {
    level?: string;
    method?: string;
    kind?: string;
    lifecycle?: string;
    runId?: string;
    resourceId?: string;
    text?: string;
  };
}

export interface TimelineItem {
  kind: string;
  key?: string | number;
  role?: string;
  text?: string;
  time?: string;
  startTime?: string;
  active?: boolean;
  steer?: boolean;
  sender?: { name?: string; id?: string; sessionId?: string };
  tone?: string;
  type?: string;
  preview?: string;
  calls?: Array<Record<string, unknown> & { key?: string | number; callId?: string; name?: string; summary?: string; status?: string; output?: string; error?: string; method?: string; rawPreview?: string }>;
  approvalId?: string;
  title?: string;
  detail?: string;
  question?: string;
  options?: Array<{ optionId: string; name?: string; kind?: string }>;
  status?: string;
  decision?: string;
  reply?: string;
}

export interface ChatContextSnapshot {
  identity: string;
  workspaceId: string;
  runId: string;
  events: AgentEvent[];
  notices: AgentNotice[];
  hasMoreBefore: boolean;
  loading: boolean;
  loadingOlder: boolean;
  loaded: boolean;
  error: string;
}

export interface SessionSwitcherModel {
  identity: string;
  workspaceId: string;
  resourceId: string;
  activeRunId: string;
  runs: AgentRun[];
  switchingRunId: string;
  onSelect: (runId: string) => Promise<void>;
  onToast: (message: string) => void;
  onIconsChanged: () => void;
}

export interface EventTimelineModel {
  identity: string;
  workspaceId: string;
  activeRunId: string;
  activeRun: AgentRun | null;
  runCount: number;
  agentName: string;
  project: (events: AgentEvent[]) => TimelineItem[];
  onEvent: (workspaceId: string, runId: string, event: AgentEvent) => void;
  onNotice: (workspaceId: string, runId: string, notice: AgentNotice) => void;
  onApproval: (runId: string, approvalId: string, reply: { decision?: string; optionId?: string; text?: string }) => Promise<void>;
  onToast: (message: string) => void;
  onIconsChanged: () => void;
}
