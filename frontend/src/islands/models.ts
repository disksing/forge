import type { IslandChannel } from "./channel";

export interface AgentOption {
  id: string;
  label: string;
  summary: string;
}

export interface TemplateField {
  name: string;
  type: "text" | "textarea" | "select" | "boolean";
  label: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  hasDefault?: boolean;
  default?: string | boolean;
}

export interface TaskTemplate {
  name: string;
  path?: string;
  title?: string;
  description?: string;
  valid: boolean;
  taskTitle?: string;
  schemaVersion?: number;
  digest?: string;
  legacy?: boolean;
  errors?: Array<{ message?: string }>;
  fields?: TemplateField[];
}

export interface TaskPreview {
  title: string;
  markdown: string;
  slug?: string;
  selfDriving?: { agentName?: string } | null;
  template?: { digest?: string };
}

export interface CreateDraft {
  type: "project" | "task";
  projectId: string;
  templateName: string;
  templateFields: Record<string, string | boolean>;
  title: string;
  titleOverride: boolean;
  description: string;
  detail: string;
  slug: string;
  selfDriving: boolean;
  agentName: string;
  agentProfiles: string;
  prompt: string;
  completionCriteria: string;
  activeTab: "edit" | "preview";
  editedMarkdown: string | null;
  showOptions: boolean;
}

export interface CreateDialogModel {
  open: boolean;
  identity: string;
  workspaceId: string;
  draft: CreateDraft;
  templates: TaskTemplate[];
  agents: AgentOption[];
  profileKeys: string[];
  preview: TaskPreview | null;
  previewKey: string;
  previewing: boolean;
  previewError: string;
  templateDigest: string;
  submitting: boolean;
  onClose: () => void;
  onPreview: (draft: CreateDraft) => Promise<void>;
  onSubmit: (draft: CreateDraft) => Promise<void>;
  previewRequestKey: (draft: CreateDraft) => string;
  onConfirmTemplateSwitch: () => boolean;
  onIconsChanged: () => void;
}

export interface WorkspaceOption {
  id: string;
  name: string;
  path: string;
  icon?: string;
}

export interface ProfileDraft {
  key: string;
  description: string;
  agentName: string;
}

export interface NotificationPreferences {
  browser: boolean;
  sound: boolean;
  permission: string;
  permissionError: string;
  soundError: string;
}

export interface AgentHubSettings {
  configuredEndpoint: string;
  connected: boolean;
  compatible: boolean;
  error: string;
  apiVersion: string;
  version: string;
  capabilities: string[];
  providers: Array<{ id: string; name?: string }>;
  agents: Array<{ name: string; providerId?: string; available?: boolean; unavailableReason?: string }>;
}

export interface SettingsDraft {
  tab: "workspace" | "user" | "agenthub" | "profiles" | "notifications";
  workspacePath: string;
  createWorkspace: boolean;
  userName: string;
  endpoint: string;
  profiles: ProfileDraft[];
  newProfile: ProfileDraft;
  dirty: boolean;
}

export interface SettingsModel {
  open: boolean;
  identity: string;
  dataVersion: number;
  initialTab: SettingsDraft["tab"];
  workspaces: WorkspaceOption[];
  activeWorkspaceId: string;
  workspaceIcons: Array<{ id: string; label: string; src: string }>;
  workspaceIconSavingId: string;
  userName: string;
  agentHub: AgentHubSettings;
  profiles: ProfileDraft[];
  agents: AgentOption[];
  notifications: NotificationPreferences;
  onClose: (dirty: boolean) => void;
  onAddWorkspace: (draft: SettingsDraft) => Promise<void>;
  onRemoveWorkspace: (id: string, draft: SettingsDraft) => Promise<void>;
  onWorkspaceIcon: (id: string, icon: string, draft: SettingsDraft) => Promise<void>;
  onSaveUser: (name: string) => Promise<string>;
  onSaveAgentHub: (draft: SettingsDraft) => Promise<void>;
  onBrowserNotifications: (enabled: boolean) => void;
  onCompletionSound: (enabled: boolean) => void;
  onToast: (message: string) => void;
  onIconsChanged: () => void;
}

export interface SelfDrivingDraft {
  agentName: string;
  runInstructions: string;
}

export interface SelfDrivingDialogModel {
  open: boolean;
  identity: string;
  resourceId: string;
  reuseCurrentSession: boolean;
  agents: AgentOption[];
  draft: SelfDrivingDraft;
  submitting: boolean;
  error: string;
  unknown: boolean;
  onClose: () => void;
  onSubmit: (draft: SelfDrivingDraft) => Promise<void>;
  onIconsChanged: () => void;
}

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
  selfDrivingRemainsEnabled: boolean;
  selfDrivingDisabling: boolean;
  onDraft: (text: string, context: { workspaceId: string; resourceId: string; runId: string; draftKey: string }) => void;
  onSend: (text: string, context: { workspaceId: string; resourceId: string; runId: string; draftKey: string }) => Promise<{ accepted: boolean; clear: boolean }>;
  onOpenUpload: () => void;
  onToggleChooser: () => void;
  onChooseAgent: (id: string) => void;
  onToggleActions: () => void;
  onResume: () => void;
  onEndTurn: () => void;
  onCloseSession: () => void;
  onIconsChanged: () => void;
}

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

export interface ForgeSvelteBridge {
  mountBrandVersion(): Promise<void>;
  renderCreateDialog(model: CreateDialogModel): void;
  renderSettings(model: SettingsModel): void;
  renderSelfDrivingDialog(model: SelfDrivingDialogModel): void;
  renderUploadDialog(model: UploadDialogModel): void;
  renderComposer(model: ComposerModel): void;
  renderDetailPanel(model: DetailPanelModel): void;
  unmount(name: string): Promise<void>;
  unmountAll(): Promise<void>;
}

export interface IslandChannels {
  create: IslandChannel<CreateDialogModel>;
  settings: IslandChannel<SettingsModel>;
  selfDriving: IslandChannel<SelfDrivingDialogModel>;
  upload: IslandChannel<UploadDialogModel>;
  composer: IslandChannel<ComposerModel>;
  detail: IslandChannel<DetailPanelModel>;
}
