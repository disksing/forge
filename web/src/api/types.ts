export interface ApiErrorResponse {
  error?: string;
  code?: string;
  [key: string]: unknown;
}

export interface WorkspaceSummary {
  id: string;
  name: string;
  path: string;
  icon?: string;
}

export type ResourceType = "scheduler" | "project" | "task";

export interface ResourceSummary {
  id: string;
  type: ResourceType;
  title: string;
  path: string;
  archived: boolean;
  children?: ResourceSummary[];
}

export interface SessionSummary {
  id: string;
  resourceId?: string;
  agentRunId?: string;
  agentRunStatus?: string;
  updatedAt: string;
}

export interface WorkspaceTreeResponse {
  root: string;
  scheduler?: ResourceSummary;
  projects: ResourceSummary[];
  sessions: SessionSummary[];
}
