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

export interface SelfDrivingBarModel {
  identity: string;
  visible: boolean;
  status: { key: string; label: string; icon: string };
  summary: string;
  expanded: boolean;
  hasProjection: boolean;
  revision: number;
  enabled: boolean;
  preferredProfiles: string[];
  actualAgent: string;
  actualReason: string;
  waitingSummary: string;
  wakeCondition: string;
  wakeFallback: boolean;
  lastOutcome: { status: string; reason: string } | null;
  statusReason: { label: string; text: string } | null;
  pending: boolean;
  onToggleEnabled: () => void;
  onToggleDetails: () => void;
  onIconsChanged: () => void;
}

export interface ToastModel {
  message: string;
  revision: number;
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
  schedulerTurn?: boolean;
  schedulerTurnId?: string;
  schedulerTurnSequence?: number;
  selfDrivingRevision?: number;
}

export interface AgentEvent {
  id: number;
  type: string;
  time?: string;
  startTime?: string;
  sessionId?: string;
  turnId?: string;
  data?: Record<string, unknown> & { text?: string; append?: boolean };
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
    selfDrivingRevision?: number;
    schedulerTurnId?: string;
    schedulerTurnSequence?: number;
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

export interface ShellStatusItem {
  key: string;
  className: string;
  iconName: string;
  recentOutput: boolean;
}

export interface ShellStatusPresentation {
  hasTaskState: boolean;
  className: string;
  layoutClassName: string;
  slotClassName: string;
  statuses: ShellStatusItem[];
  lock: { className: string } | null;
}

export interface ShellProjectSummary {
  taskLabel: string;
  runningLabel: string;
  ariaLabel: string;
}

export interface ShellResourceItem {
  id: string;
  type: "project" | "task";
  title: string;
  ref: string;
  active: boolean;
  expanded: boolean;
  ariaLabel: string;
  statusLabel: string;
  status: ShellStatusPresentation;
  summary: ShellProjectSummary | null;
  children: ShellResourceItem[];
}

export interface ShellSessionControl {
  resourceId: string;
  path: string;
  navigable: boolean;
}

export interface ShellSessionItem {
  id: string;
  source: "internal" | "external" | string;
  title: string;
  meta: string;
  label: string;
  statusLabel: string;
  status: ShellStatusPresentation;
  unread: boolean;
  current: boolean;
  clickable: boolean;
  navigationResourceId: string;
  menu: boolean;
  controls: ShellSessionControl[];
}

export interface ShellWorkspaceItem extends WorkspaceOption {
  iconSrc: string;
}

export interface ShellDragTarget {
  kind: "project" | "task" | "session";
  id: string;
  projectId: string;
}

export interface AppShellModel {
  identity: string;
  loading: boolean;
  error: string;
  version: string;
  activeWorkspaceId: string;
  workspaces: ShellWorkspaceItem[];
  projects: ShellResourceItem[];
  sessions: ShellSessionItem[];
  paneSizes: { sidebarWidth: number; chatWidth: number; sidebarSessionHeight: number };
  mobile: { sidebarOpen: boolean; view: "details" | "chat"; immersive: boolean };
  route: { path: string; revision: number; replace: boolean };
  onSwitchWorkspace: (id: string) => Promise<void>;
  onAddWorkspace: () => void;
  onCreateProject: () => void;
  onOpenSettings: () => void;
  onToggleProject: (id: string) => Promise<void>;
  onSelectResource: (id: string) => Promise<void>;
  onReorder: (drag: ShellDragTarget, target: ShellDragTarget, after: boolean) => Promise<void>;
  onDragState: (drag: ShellDragTarget | null) => void;
  onPanePreview: (name: keyof AppShellModel["paneSizes"], value: number) => void;
  onPaneCommit: (name: keyof AppShellModel["paneSizes"]) => void;
  onPaneViewport: () => void;
  onMobileSidebar: (open: boolean) => void;
  onMobileView: (view: "details" | "chat") => void;
  onMobileImmersive: (immersive: boolean) => void;
  onHistoryNavigation: (pathname: string) => Promise<void>;
  onToast: (message: string) => void;
  onIconsChanged: () => void;
}
