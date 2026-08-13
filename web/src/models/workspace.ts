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
  runtime?: ResourceRuntime;
  attention?: ResourceAttention;
}

export interface ResourceAttention {
  followed?: boolean;
  dismissedTurn?: number;
}

export interface ResourceRuntime {
  generation?: number;
  generationId?: string;
  status?: string;
  agentName?: string;
  updatedAt?: string;
  lastOutputAt?: string;
  completionMarker?: string;
  completionState?: string;
  completionAt?: string;
  replacementPending?: boolean;
  turnNumber?: number;
  activeTurn?: boolean;
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

export interface WorkspaceTree {
  creator?: ResourceCreatorModel;
  agentBinding?: { kind: "profile" | "agent"; name: string };
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
