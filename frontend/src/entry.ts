import { mount, unmount, type Component } from "svelte";

import "./app.css";

import { startForgeApp, stopForgeApp, type ForgeViewPublisher } from "./app-controller";
import AppShell from "./components/AppShell.svelte";
import ChatComposer from "./components/ChatComposer.svelte";
import CreateDialog from "./components/CreateDialog.svelte";
import DetailPanel from "./components/DetailPanel.svelte";
import EventTimeline from "./components/EventTimeline.svelte";
import SelfDrivingBar from "./components/SelfDrivingBar.svelte";
import SelfDrivingDialog from "./components/SelfDrivingDialog.svelte";
import SessionSwitcher from "./components/SessionSwitcher.svelte";
import SettingsModal from "./components/SettingsModal.svelte";
import Toast from "./components/Toast.svelte";
import UploadDialog from "./components/UploadDialog.svelte";
import { replaceComponent, unmountAllComponents } from "./components/component-registry";
import { createModelChannel } from "./components/model-channel";
import type { AppShellModel, ComposerModel, CreateDialogModel, DetailPanelModel, EventTimelineModel, SelfDrivingBarModel, SelfDrivingDialogModel, SessionSwitcherModel, SettingsModel, ToastModel, UploadDialogModel } from "./components/models";

const noop = () => undefined;
const noopAsync = async () => undefined;
const iconOptions = [{ id: "", label: "Forge default", src: "/favicon.svg" }];
const appShellChannel = createModelChannel<AppShellModel>({
  identity: "", loading: true, error: "", version: "v0.1.0", activeWorkspaceId: "", workspaces: [], projects: [], sessions: [],
  paneSizes: { sidebarWidth: 280, chatWidth: 420, sidebarSessionHeight: 210 }, mobile: { sidebarOpen: false, view: "details", immersive: false },
  route: { path: "", revision: 0, replace: true },
  onSwitchWorkspace: noopAsync, onAddWorkspace: noop, onCreateProject: noop, onOpenSettings: noop, onToggleProject: noopAsync, onSelectResource: noopAsync,
  onReorder: noopAsync, onDragState: noop, onPanePreview: noop, onPaneCommit: noop, onPaneViewport: noop, onMobileSidebar: noop, onMobileView: noop,
  onMobileImmersive: noop, onToast: noop, onIconsChanged: noop,
  onHistoryNavigation: noopAsync,
});

const createChannel = createModelChannel<CreateDialogModel>({
  open: false, identity: "", workspaceId: "", draft: { type: "project", projectId: "", templateName: "", templateFields: {}, title: "", titleOverride: false, description: "", detail: "", slug: "", selfDriving: false, agentName: "", agentProfiles: "", prompt: "", completionCriteria: "", activeTab: "edit", editedMarkdown: null, showOptions: false },
  templates: [], agents: [], profileKeys: [], preview: null, previewKey: "", previewing: false, previewError: "", templateDigest: "", submitting: false,
  onClose: noop, onPreview: noopAsync, onSubmit: noopAsync, previewRequestKey: () => "", onConfirmTemplateSwitch: () => true, onIconsChanged: noop,
});
const settingsChannel = createModelChannel<SettingsModel>({
  open: false, identity: "", dataVersion: 0, initialTab: "workspace", workspaces: [], activeWorkspaceId: "", workspaceIcons: iconOptions, workspaceIconSavingId: "", userName: "User",
  agentHub: { configuredEndpoint: "", connected: false, compatible: false, error: "", apiVersion: "", version: "", capabilities: [], providers: [], agents: [] }, profiles: [], agents: [],
  notifications: { browser: false, sound: false, permission: "default", permissionError: "", soundError: "" },
  onClose: noop, onAddWorkspace: noopAsync, onRemoveWorkspace: noopAsync, onWorkspaceIcon: noopAsync, onSaveUser: async (name) => name, onSaveAgentHub: noopAsync,
  onBrowserNotifications: noop, onCompletionSound: noop, onToast: noop, onIconsChanged: noop,
});
const selfDrivingChannel = createModelChannel<SelfDrivingDialogModel>({ open: false, identity: "", resourceId: "", reuseCurrentSession: false, agents: [], draft: { agentName: "", runInstructions: "" }, submitting: false, error: "", unknown: false, onClose: noop, onSubmit: noopAsync, onIconsChanged: noop });
const selfDrivingBarChannel = createModelChannel<SelfDrivingBarModel>({ identity: "", visible: false, status: { key: "disabled", label: "Off", icon: "circle-dashed" }, summary: "", expanded: false, hasProjection: false, revision: 0, enabled: false, preferredProfiles: [], actualAgent: "", actualReason: "", waitingSummary: "", wakeCondition: "", wakeFallback: false, lastOutcome: null, statusReason: null, pending: false, onToggleEnabled: noop, onToggleDetails: noop, onIconsChanged: noop });
const toastChannel = createModelChannel<ToastModel>({ message: "", revision: 0 });
const uploadChannel = createModelChannel<UploadDialogModel>({ open: false, identity: "", workspaceId: "", runId: "", onDone: noop, onIconsChanged: noop });
const composerChannel = createModelChannel<ComposerModel>({ identity: "", workspaceId: "", resourceId: "", runId: "", runStatus: "", live: false, canResume: false, draft: "", draftKey: "", draftResetVersion: 0, unavailableReason: "", sending: false, externalLocked: false, internalLocked: false, agents: [], selectedAgentId: "", chooserOpen: false, sessionStarting: false, actionsOpen: false, canEndTurn: false, endingTurn: false, closingSession: false, selfDrivingRemainsEnabled: false, selfDrivingDisabling: false, onDraft: noop, onSend: async () => ({ accepted: false, clear: false }), onOpenUpload: noop, onToggleChooser: noop, onChooseAgent: noop, onToggleActions: noop, onResume: noop, onEndTurn: noop, onCloseSession: noop, onIconsChanged: noop });
const detailChannel = createModelChannel<DetailPanelModel>({ identity: "", workspaceId: "", workspaceName: "", resourceId: "", resourceType: "", resourceTitle: "", parent: null, loading: false, detail: null, wiki: null, workspaceAgents: null, logs: { hasMore: false, loading: false, error: "" }, onNavigate: noop, onCreateTask: noop, onArchive: noop, onLoadMoreLogs: noopAsync, onSaveWorkspaceAgents: async () => ({ path: "AGENTS.md" }), onToast: noop, onIconsChanged: noop });
const sessionChannel = createModelChannel<SessionSwitcherModel>({ identity: "", workspaceId: "", resourceId: "", activeRunId: "", runs: [], switchingRunId: "", onSelect: noopAsync, onToast: noop, onIconsChanged: noop });
const timelineChannel = createModelChannel<EventTimelineModel>({ identity: "", workspaceId: "", activeRunId: "", activeRun: null, runCount: 0, agentName: "Agent", project: () => [], onEvent: noop, onNotice: noop, onApproval: noopAsync, onToast: noop, onIconsChanged: noop });

async function mountAppShell(): Promise<void> {
  await mountPersistentComponent("app-shell", "app", AppShell, { channel: appShellChannel });
}

async function mountPersistentComponent<Props extends Record<string, unknown>>(name: string, targetId: string, component: Component<Props>, props: Props): Promise<void> {
  const target = document.getElementById(targetId);
  if (!target) return;
  await replaceComponent(name, target, (componentTarget) => {
    componentTarget.dataset.componentOwner = name;
    const instance = mount(component, { target: componentTarget, props });
    return async () => {
      delete componentTarget.dataset.componentOwner;
      await unmount(instance);
    };
  });
}

async function mountComponents(): Promise<void> {
  await Promise.all([
    mountPersistentComponent("create-dialog", "createDialogRoot", CreateDialog, { channel: createChannel }),
    mountPersistentComponent("settings", "settingsRoot", SettingsModal, { channel: settingsChannel }),
    mountPersistentComponent("self-driving-dialog", "selfDrivingDialogRoot", SelfDrivingDialog, { channel: selfDrivingChannel }),
    mountPersistentComponent("self-driving-bar", "selfDrivingBarWrap", SelfDrivingBar, { channel: selfDrivingBarChannel }),
    mountPersistentComponent("upload-dialog", "uploadDialogRoot", UploadDialog, { channel: uploadChannel }),
    mountPersistentComponent("chat-composer", "ttyComposer", ChatComposer, { channel: composerChannel }),
    mountPersistentComponent("session-switcher", "agentSessionsWrap", SessionSwitcher, { channel: sessionChannel }),
    mountPersistentComponent("event-timeline", "ttyLog", EventTimeline, { channel: timelineChannel }),
    mountPersistentComponent("detail-panel", "detailsPanel", DetailPanel, { channel: detailChannel }),
    mountPersistentComponent("toast", "toastRoot", Toast, { channel: toastChannel }),
  ]);
}

const publisher: ForgeViewPublisher = {
  renderAppShell: (model) => appShellChannel.publish(model),
  renderCreateDialog: (model) => createChannel.publish(model),
  renderSettings: (model) => settingsChannel.publish(model),
  renderSelfDrivingDialog: (model) => selfDrivingChannel.publish(model),
  renderSelfDrivingBar: (model) => selfDrivingBarChannel.publish(model),
  renderUploadDialog: (model) => uploadChannel.publish(model),
  renderComposer: (model) => composerChannel.publish(model),
  renderSessionSwitcher: (model) => sessionChannel.publish(model),
  renderEventTimeline: (model) => timelineChannel.publish(model),
  renderDetailPanel: (model) => detailChannel.publish(model),
  renderToast: (model) => toastChannel.publish(model),
};

window.addEventListener("pagehide", () => {
  stopForgeApp();
  void unmountAllComponents();
});
window.addEventListener("pageshow", (event) => {
  if (!event.persisted) return;
  void (async () => {
    await mountAppShell();
    await mountComponents();
    startForgeApp(publisher);
  })();
});

void (async () => {
  await mountAppShell();
  await mountComponents();
  startForgeApp(publisher);
})().catch((error) => console.error("Failed to start the Forge application", error));
