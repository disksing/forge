import type { AgentEvent, AgentNotice, AgentRun } from "./chat";
import type { TaskTemplate } from "./create";
import type { FileTreeModel, ResourceCreatorModel, ResourceFileModel, ResourceRepoModel } from "./detail";

export interface ResourceLogRecord {
  id?: string;
  time?: string;
  title?: string;
  details?: string;
  value?: unknown;
}

export interface ResourceRecord {
  id: string;
  type?: string;
  title?: string;
  path?: string;
  description?: string;
  status?: string;
  archived?: boolean;
  creator?: ResourceCreatorModel;
  agentBinding?: { kind: "profile" | "agent"; name: string };
  updatedAt?: string;
  children?: ResourceRecord[];
  files?: ResourceFileModel[];
  logs?: ResourceLogRecord[];
  logPage?: { entries?: ResourceLogRecord[]; hasMore?: boolean; nextCursor?: string };
  artifacts?: FileTreeModel[];
  repos?: ResourceRepoModel[];
  templates?: TaskTemplate[];
  template?: { name: string; schemaVersion?: number; digest?: string } | null;
  wiki?: { exists?: boolean; error?: string; entries?: FileTreeModel[] };
  scheduler?: SchedulerConfigRecord;
}

export interface ScheduleRecord {
  id: string;
  description: string;
  condition: string;
  target: string;
  createdBy?: ResourceCreatorModel;
  createdAt: string;
  updatedAt: string;
}

export interface SchedulerConfigRecord {
  schemaVersion: number;
  agentBinding: { kind: "profile" | "agent"; name: string };
  wakeIntervalMinutes: number;
  schedules: ScheduleRecord[];
}

export interface WorkspaceSession extends AgentRun {
  source?: "internal" | "external" | string;
  runId?: string;
  forgeSessionId?: string;
  startedAt?: string;
  agentRunTitle?: string;
  agentRunAgentName?: string;
  agentRunStatus?: string;
  agentRunUpdatedAt?: string;
  agentRunLastOutputAt?: string;
  completionSessionId?: string;
}

export interface WorkspaceTree {
  creator?: ResourceCreatorModel;
  agentBinding?: { kind: "profile" | "agent"; name: string };
  scheduler?: ResourceRecord;
  projects: ResourceRecord[];
  sessions: WorkspaceSession[];
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

export interface AgentRuntimeState {
  runs: WorkspaceSession[];
  events: AgentEvent[];
  notices: AgentNotice[];
}
