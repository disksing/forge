import type { TaskTemplate } from "./create";
import type { FileTreeModel, ResourceFileModel, ResourceRepoModel } from "./detail";

export interface ResourceRecord {
  id: string;
  type?: string;
  title?: string;
  path?: string;
  description?: string;
  state?: "not_started" | "in_progress" | "waiting" | "blocked" | "paused" | "completed" | "error";
  stateNote?: string;
  stateUpdatedAt?: string;
  archived?: boolean;
  agentBinding?: { kind: "profile" | "agent"; name: string };
  taskDefault?: { kind: "profile" | "agent"; name: string };
  updatedAt?: string;
  children?: ResourceRecord[];
  files?: ResourceFileModel[];
  artifacts?: FileTreeModel[];
  repos?: ResourceRepoModel[];
  templates?: TaskTemplate[];
  template?: { name: string; schemaVersion?: number; digest?: string } | null;
  wiki?: { exists?: boolean; error?: string; entries?: FileTreeModel[] };
  scheduler?: SchedulerConfigRecord;
  runtime?: ResourceRuntime;
  attention?: ResourceAttention;
}

export interface ResourceAttention {
  followed?: boolean;
  readTurnNumber?: number;
}

export interface ResourceRuntime {
  generation?: number;
  generationId?: string;
  status?: string;
  sessionState?: "idle" | "working" | "attention_required" | "unavailable" | "archived";
  agentName?: string;
  updatedAt?: string;
  lastOutputAt?: string;
  completionMarker?: string;
  completionState?: string;
  completionAt?: string;
  replacementPending?: boolean;
  resumable?: boolean;
  idleSuspended?: boolean;
  resumeUnavailable?: boolean;
  turnNumber?: number;
  activeTurn?: boolean;
  turnStartedAt?: string;
}

export interface ScheduleRecord {
  id: string;
  description: string;
  condition: string;
  target: string;
  createdAt: string;
  updatedAt: string;
}

export interface SchedulerConfigRecord {
  schemaVersion: number;
  agentBinding: { kind: "profile" | "agent"; name: string };
  wakeIntervalMinutes: number;
  schedules: ScheduleRecord[];
}

export interface ResourceAgentDefaultsRecord {
  project: { kind: "profile" | "agent"; name: string };
  task: { kind: "profile" | "agent"; name: string };
}

export interface GenerationPolicyRecord {
  enabled: boolean;
  maxTurns: number;
  maxAccumulatedTurnMinutes: number;
}

export interface WorkspaceTree {
	agentBinding?: { kind: "profile" | "agent"; name: string };
	resourceDefaults?: ResourceAgentDefaultsRecord;
	generationPolicy?: GenerationPolicyRecord;
  workspace?: ResourceRecord;
  scheduler?: ResourceRecord;
  projects: ResourceRecord[];
  attentionList?: ResourceRecord[];
  wiki?: { exists?: boolean; error?: string; entries?: FileTreeModel[] };
}

export interface WorkspaceFileRecord {
  path: string;
  name?: string;
  section?: string;
  size?: number;
  content?: string;
  contentHash?: string;
  truncated?: boolean;
  binary?: boolean;
  image?: boolean;
  mimeType?: string;
  loading?: boolean;
  error?: string;
}

export interface DiffRecord {
  path?: string;
  name?: string;
  branch?: string;
  base?: string;
  diff?: string;
  hasChanges?: boolean;
}

export interface AgentConfig {
  id: string;
  name?: string;
  available?: boolean;
  providerId?: string;
  options?: { model?: string };
}

export interface AgentProfile {
  key: string;
  description: string;
  agentName: string;
}

export interface WorkspaceConfig {
  activeId?: string;
  workspaces: Array<{ id: string; name: string; path: string; icon?: string }>;
  agents: AgentConfig[];
  agentProfiles: AgentProfile[];
  agentHubProviders?: Array<{ id: string; name?: string }>;
}

export interface WorkspaceUser {
  version: number;
  name: string;
  preference: string;
}
