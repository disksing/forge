import type { TaskTemplate } from "./create";

export interface ResourceFileModel {
  name: string;
  path?: string;
  content: string;
  contentHash?: string;
}

export interface FileTreeModel {
  name: string;
  path: string;
  type: "file" | "directory" | string;
  size?: number;
  modified?: string;
  children?: FileTreeModel[];
}

export interface ResourceLogModel {
  id: string;
  time: string;
  title?: string;
  details?: string;
}

export interface ResourceRepoModel {
  name?: string;
  worktreePath?: string;
  branch?: string;
  targetBranch?: string;
  baseBranch?: string;
}

export interface ResourceDetailModel {
  id: string;
  type: "project" | "task";
  title: string;
  description?: string;
  path: string;
  archived?: boolean;
  files?: ResourceFileModel[];
  logs?: ResourceLogModel[];
  logPage?: { hasMore?: boolean; nextCursor?: string };
  artifacts?: FileTreeModel[];
  repos?: ResourceRepoModel[];
  templates?: TaskTemplate[];
  template?: { name: string; schemaVersion?: number; digest?: string } | null;
}

export interface FilePreviewModel {
  path: string;
  name?: string;
  size?: number;
  content?: string;
  contentHash?: string;
  truncated?: boolean;
  binary?: boolean;
  image?: boolean;
  mimeType?: string;
}

export interface DiffPreviewModel {
  path: string;
  name?: string;
  branch?: string;
  base?: string;
  diff?: string;
  hasChanges?: boolean;
}

export interface WorkspaceAgentsModel extends Partial<FilePreviewModel> {
  path: string;
  content?: string;
  error?: string;
}

export interface DetailPanelModel {
  identity: string;
  workspaceId: string;
  workspaceName: string;
  resourceId: string;
  resourceType: "workspace" | "project" | "task" | "";
  resourceTitle: string;
  parent?: { id: string; title: string } | null;
  loading: boolean;
  detail: ResourceDetailModel | null;
  wiki: { exists?: boolean; error?: string; entries?: FileTreeModel[] } | null;
  workspaceAgents: WorkspaceAgentsModel | null;
  logs: { hasMore: boolean; loading: boolean; error: string };
  onNavigate: (resourceId: string) => void;
  onCreateTask: (projectId: string) => void;
  onArchive: (resourceId: string) => void;
  onLoadMoreLogs: (resourceId: string) => Promise<void>;
  onSaveWorkspaceAgents: (content: string, expectedContentHash: string) => Promise<WorkspaceAgentsModel>;
  onToast: (message: string) => void;
  onIconsChanged: () => void;
}
