import { mount, unmount, type Component } from "svelte";

import AppShell from "./islands/AppShell.svelte";
import BrandVersion from "./islands/BrandVersion.svelte";
import ChatComposer from "./islands/ChatComposer.svelte";
import CreateDialog from "./islands/CreateDialog.svelte";
import DetailPanel from "./islands/DetailPanel.svelte";
import EventTimeline from "./islands/EventTimeline.svelte";
import SelfDrivingDialog from "./islands/SelfDrivingDialog.svelte";
import SessionSwitcher from "./islands/SessionSwitcher.svelte";
import SettingsModal from "./islands/SettingsModal.svelte";
import UploadDialog from "./islands/UploadDialog.svelte";
import { createIslandChannel } from "./islands/channel";
import { replaceIsland, unmountAllIslands, unmountIsland } from "./islands/lifecycle";
import type { AppShellModel, ComposerModel, CreateDialogModel, DetailPanelModel, EventTimelineModel, ForgeSvelteBridge, SelfDrivingDialogModel, SessionSwitcherModel, SettingsModel, UploadDialogModel } from "./islands/models";

const BRAND_VERSION_ISLAND = "brand-version";
const noop = () => undefined;
const noopAsync = async () => undefined;
const iconOptions = [{ id: "", label: "Forge default", src: "/favicon.svg" }];
const appShellChannel = createIslandChannel<AppShellModel>({
  identity: "", loading: true, error: "", version: "v0.1.0", activeWorkspaceId: "", workspaces: [], projects: [], sessions: [],
  paneSizes: { sidebarWidth: 280, chatWidth: 420, sidebarSessionHeight: 210 }, mobile: { sidebarOpen: false, view: "details", immersive: false },
  route: { path: "", revision: 0, replace: true },
  onSwitchWorkspace: noopAsync, onAddWorkspace: noop, onCreateProject: noop, onOpenSettings: noop, onToggleProject: noopAsync, onSelectResource: noopAsync,
  onReorder: noopAsync, onDragState: noop, onPanePreview: noop, onPaneCommit: noop, onPaneViewport: noop, onMobileSidebar: noop, onMobileView: noop,
  onMobileImmersive: noop, onToast: noop, onIconsChanged: noop,
  onHistoryNavigation: noopAsync,
});

const createChannel = createIslandChannel<CreateDialogModel>({
  open: false, identity: "", workspaceId: "", draft: { type: "project", projectId: "", templateName: "", templateFields: {}, title: "", titleOverride: false, description: "", detail: "", slug: "", selfDriving: false, agentName: "", agentProfiles: "", prompt: "", completionCriteria: "", activeTab: "edit", editedMarkdown: null, showOptions: false },
  templates: [], agents: [], profileKeys: [], preview: null, previewKey: "", previewing: false, previewError: "", templateDigest: "", submitting: false,
  onClose: noop, onPreview: noopAsync, onSubmit: noopAsync, previewRequestKey: () => "", onConfirmTemplateSwitch: () => true, onIconsChanged: noop,
});
const settingsChannel = createIslandChannel<SettingsModel>({
  open: false, identity: "", dataVersion: 0, initialTab: "workspace", workspaces: [], activeWorkspaceId: "", workspaceIcons: iconOptions, workspaceIconSavingId: "", userName: "User",
  agentHub: { configuredEndpoint: "", connected: false, compatible: false, error: "", apiVersion: "", version: "", capabilities: [], providers: [], agents: [] }, profiles: [], agents: [],
  notifications: { browser: false, sound: false, permission: "default", permissionError: "", soundError: "" },
  onClose: noop, onAddWorkspace: noopAsync, onRemoveWorkspace: noopAsync, onWorkspaceIcon: noopAsync, onSaveUser: async (name) => name, onSaveAgentHub: noopAsync,
  onBrowserNotifications: noop, onCompletionSound: noop, onToast: noop, onIconsChanged: noop,
});
const selfDrivingChannel = createIslandChannel<SelfDrivingDialogModel>({ open: false, identity: "", resourceId: "", reuseCurrentSession: false, agents: [], draft: { agentName: "", runInstructions: "" }, submitting: false, error: "", unknown: false, onClose: noop, onSubmit: noopAsync, onIconsChanged: noop });
const uploadChannel = createIslandChannel<UploadDialogModel>({ open: false, identity: "", workspaceId: "", runId: "", onDone: noop, onIconsChanged: noop });
const composerChannel = createIslandChannel<ComposerModel>({ identity: "", workspaceId: "", resourceId: "", runId: "", runStatus: "", live: false, canResume: false, draft: "", draftKey: "", draftResetVersion: 0, unavailableReason: "", sending: false, externalLocked: false, internalLocked: false, agents: [], selectedAgentId: "", chooserOpen: false, sessionStarting: false, actionsOpen: false, canEndTurn: false, endingTurn: false, closingSession: false, selfDrivingRemainsEnabled: false, selfDrivingDisabling: false, onDraft: noop, onSend: async () => ({ accepted: false, clear: false }), onOpenUpload: noop, onToggleChooser: noop, onChooseAgent: noop, onToggleActions: noop, onResume: noop, onEndTurn: noop, onCloseSession: noop, onIconsChanged: noop });
const detailChannel = createIslandChannel<DetailPanelModel>({ identity: "", workspaceId: "", workspaceName: "", resourceId: "", resourceType: "", resourceTitle: "", parent: null, loading: false, detail: null, wiki: null, workspaceAgents: null, logs: { hasMore: false, loading: false, error: "" }, onNavigate: noop, onCreateTask: noop, onArchive: noop, onLoadMoreLogs: noopAsync, onSaveWorkspaceAgents: async () => ({ path: "AGENTS.md" }), onToast: noop, onIconsChanged: noop });
const sessionChannel = createIslandChannel<SessionSwitcherModel>({ identity: "", workspaceId: "", resourceId: "", activeRunId: "", runs: [], switchingRunId: "", onSelect: noopAsync, onToast: noop, onIconsChanged: noop });
const timelineChannel = createIslandChannel<EventTimelineModel>({ identity: "", workspaceId: "", activeRunId: "", activeRun: null, runCount: 0, agentName: "Agent", project: () => [], onEvent: noop, onNotice: noop, onApproval: noopAsync, onToast: noop, onIconsChanged: noop });

async function mountBrandVersion(): Promise<void> {
  const target = document.getElementById("brandVersionIsland");
  if (!target) return;
  const fallback = target.dataset.version || "v0.1.0";
  try {
    await replaceIsland(BRAND_VERSION_ISLAND, target, (islandTarget) => {
      const component = mount(BrandVersion, {
        target: islandTarget,
        props: { version: fallback },
      });
      return () => unmount(component);
    });
  } catch (error) {
    target.textContent = fallback;
    throw error;
  }
}

async function mountAppShell(): Promise<void> {
  await mountPersistentIsland("app-shell", "app", AppShell, { channel: appShellChannel });
}

async function mountPersistentIsland<Props extends Record<string, unknown>>(name: string, targetId: string, component: Component<Props>, props: Props): Promise<void> {
  const target = document.getElementById(targetId);
  if (!target) return;
  await replaceIsland(name, target, (islandTarget) => {
    islandTarget.dataset.svelteOwned = name;
    const instance = mount(component, { target: islandTarget, props });
    return async () => {
      delete islandTarget.dataset.svelteOwned;
      await unmount(instance);
    };
  });
}

async function mountMigratedIslands(): Promise<void> {
  await Promise.all([
    mountPersistentIsland("create-dialog", "createDialogRoot", CreateDialog, { channel: createChannel }),
    mountPersistentIsland("settings", "settingsRoot", SettingsModal, { channel: settingsChannel }),
    mountPersistentIsland("self-driving-dialog", "selfDrivingDialogRoot", SelfDrivingDialog, { channel: selfDrivingChannel }),
    mountPersistentIsland("upload-dialog", "uploadDialogRoot", UploadDialog, { channel: uploadChannel }),
    mountPersistentIsland("chat-composer", "ttyComposer", ChatComposer, { channel: composerChannel }),
    mountPersistentIsland("session-switcher", "agentSessionsWrap", SessionSwitcher, { channel: sessionChannel }),
    mountPersistentIsland("event-timeline", "ttyLog", EventTimeline, { channel: timelineChannel }),
    mountPersistentIsland("detail-panel", "detailsPanel", DetailPanel, { channel: detailChannel }),
  ]);
}

const bridge: ForgeSvelteBridge = {
  renderAppShell: (model) => appShellChannel.publish(model),
  mountBrandVersion,
  renderCreateDialog: (model) => createChannel.publish(model),
  renderSettings: (model) => settingsChannel.publish(model),
  renderSelfDrivingDialog: (model) => selfDrivingChannel.publish(model),
  renderUploadDialog: (model) => uploadChannel.publish(model),
  renderComposer: (model) => composerChannel.publish(model),
  renderSessionSwitcher: (model) => sessionChannel.publish(model),
  renderEventTimeline: (model) => timelineChannel.publish(model),
  renderDetailPanel: (model) => detailChannel.publish(model),
  unmount: unmountIsland,
  unmountAll: unmountAllIslands,
};

declare global {
  interface Window {
    ForgeSvelteIslands?: ForgeSvelteBridge;
    ForgeSveltePageLifecycleInstalled?: boolean;
    ForgeLegacySvelteReady?: () => void;
  }
}

const previousBridge = window.ForgeSvelteIslands;
window.ForgeSvelteIslands = bridge;
if (!window.ForgeSveltePageLifecycleInstalled) {
  window.ForgeSveltePageLifecycleInstalled = true;
  window.addEventListener("pagehide", () => {
    void window.ForgeSvelteIslands?.unmountAll();
  });
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) void (async () => {
      await mountAppShell();
      await Promise.all([window.ForgeSvelteIslands?.mountBrandVersion(), mountMigratedIslands()]);
      window.ForgeLegacySvelteReady?.();
    })();
  });
}

void (async () => {
  await previousBridge?.unmountAll();
  await mountAppShell();
  await Promise.all([mountBrandVersion(), mountMigratedIslands()]);
  window.ForgeLegacySvelteReady?.();
})().catch((error) => console.error("Failed to mount the Forge Svelte island", error));
