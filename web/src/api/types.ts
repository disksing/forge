export interface ApiErrorResponse {
  error?: string;
  code?: string;
  [key: string]: unknown;
}

export interface ArchiveWarning {
  severity?: "warning" | string;
  code: string;
  message: string;
  resourceId?: string;
  repo?: string;
  path?: string;
  branch?: string;
  targetBranch?: string;
}

export interface ArchiveResponse {
  path: string;
  warnings?: ArchiveWarning[];
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

export interface WorkspaceTreeResponse {
  root: string;
  scheduler?: ResourceSummary;
  projects: ResourceSummary[];
}
