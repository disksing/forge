import { createModelChannel, type ModelChannel } from "./components/model-channel";
import type { EventTimelineModel, SessionSwitcherModel, UploadDialogModel, ComposerModel } from "./models/chat";
import type { ToastModel } from "./models/common";
import type { CreateDialogModel } from "./models/create";
import type { DetailPanelModel } from "./models/detail";
import type { SettingsModel } from "./models/settings";
import type { AppShellModel } from "./models/shell";

export interface ForgeAppChannels {
  appShell: ModelChannel<AppShellModel>;
  create: ModelChannel<CreateDialogModel>;
  settings: ModelChannel<SettingsModel>;
  upload: ModelChannel<UploadDialogModel>;
  composer: ModelChannel<ComposerModel>;
  detail: ModelChannel<DetailPanelModel>;
  sessions: ModelChannel<SessionSwitcherModel>;
  timeline: ModelChannel<EventTimelineModel>;
  toast: ModelChannel<ToastModel>;
}

const noop = () => undefined;
const noopAsync = async () => undefined;

export function createForgeAppChannels(): ForgeAppChannels {
  return {
    appShell: createModelChannel<AppShellModel>({
      identity: "", loading: true, error: "", version: "v0.1.0", activeWorkspaceId: "", workspaces: [], projects: [], sessions: [],
      paneSizes: { sidebarWidth: 280, chatWidth: 420, sidebarSessionHeight: 210 }, mobile: { sidebarOpen: false, view: "details", immersive: false },
      layout: { preference: "auto", effective: "three" },
      route: { path: "", revision: 0, replace: true },
      onSwitchWorkspace: noopAsync, onAddWorkspace: noop, onCreateProject: noop, onOpenSettings: noop, onToggleProject: noopAsync, onSelectResource: noopAsync,
      onReorder: noopAsync, onDragState: noop, onPanePreview: noop, onPaneCommit: noop, onPaneViewport: noop, onMobileSidebar: noop, onMobileView: noop,
      onMobileImmersive: noop, onLayoutCycle: noop, onToast: noop, onIconsChanged: noop, onHistoryNavigation: noopAsync,
    }),
    create: createModelChannel<CreateDialogModel>({
      open: false, identity: "", workspaceId: "", draft: { type: "project", projectId: "", templateName: "", templateFields: {}, title: "", titleOverride: false, description: "", detail: "", slug: "", activeTab: "edit", editedMarkdown: null, showOptions: false },
      templates: [], preview: null, previewKey: "", previewing: false, previewError: "", templateDigest: "", submitting: false,
      onClose: noop, onPreview: noopAsync, onSubmit: noopAsync, previewRequestKey: () => "", onConfirmTemplateSwitch: () => true, onIconsChanged: noop,
    }),
    settings: createModelChannel<SettingsModel>({
      open: false, identity: "", dataVersion: 0, initialTab: "workspace", workspaces: [], activeWorkspaceId: "", workspaceIcons: [{ id: "", label: "Forge default", src: "/favicon.svg" }], workspaceIconSavingId: "", userName: "User",
      agentHub: { configuredEndpoint: "", connected: false, compatible: false, error: "", apiVersion: "", version: "", capabilities: [], providers: [], agents: [], resourceDefaults: { workspace: "default", project: "default", task: "default" } }, profiles: [], agents: [],
      notifications: { browser: false, sound: false, permission: "default", permissionError: "", soundError: "" },
      onClose: noop, onAddWorkspace: noopAsync, onRemoveWorkspace: noopAsync, onWorkspaceIcon: noopAsync, onSaveUser: async (name) => name, onSaveAgentHub: noopAsync,
      onBrowserNotifications: noop, onCompletionSound: noop, onToast: noop, onIconsChanged: noop,
    }),
    upload: createModelChannel<UploadDialogModel>({ open: false, identity: "", workspaceId: "", runId: "", onDone: noop, onIconsChanged: noop }),
    composer: createModelChannel<ComposerModel>({ identity: "", workspaceId: "", resourceId: "", runId: "", runStatus: "", live: false, canResume: false, draft: "", draftKey: "", draftResetVersion: 0, unavailableReason: "", sending: false, agents: [], selectedAgentId: "", chooserOpen: false, sessionStarting: false, actionsOpen: false, canEndTurn: false, endingTurn: false, closingSession: false, onDraft: noop, onSend: async () => ({ accepted: false, clear: false }), onOpenUpload: noop, onToggleChooser: noop, onChooseAgent: noop, onToggleActions: noop, onResume: noop, onEndTurn: noop, onCloseSession: noop, onIconsChanged: noop }),
    detail: createModelChannel<DetailPanelModel>({ identity: "", workspaceId: "", workspaceName: "", resourceId: "", resourceType: "", resourceTitle: "", parent: null, loading: false, detail: null, wiki: null, workspaceAgents: null, agentBinding: { kind: "profile", name: "default" }, agentProfiles: [], agents: [], logs: { hasMore: false, loading: false, error: "" }, onNavigate: noop, onCreateTask: noop, onArchive: noop, onLoadMoreLogs: noopAsync, onSaveWorkspaceAgents: async () => ({ path: "AGENTS.md" }), onSaveAgentBinding: noopAsync, onToast: noop, onIconsChanged: noop }),
    sessions: createModelChannel<SessionSwitcherModel>({ identity: "", workspaceId: "", resourceId: "", activeRunId: "", runs: [], switchingRunId: "", onSelect: noopAsync, onToast: noop, onIconsChanged: noop }),
    timeline: createModelChannel<EventTimelineModel>({ identity: "", workspaceId: "", activeRunId: "", activeRun: null, runCount: 0, agentName: "Agent", project: () => [], onEvent: noop, onNotice: noop, onApproval: noopAsync, onToast: noop, onIconsChanged: noop }),
    toast: createModelChannel<ToastModel>({ message: "", revision: 0 }),
  };
}
