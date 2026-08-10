import type {
  AppShellModel,
  ComposerModel,
  CreateDraft,
  CreateDialogModel,
  DetailPanelModel,
  EventTimelineModel,
  SelfDrivingBarModel,
  SelfDrivingDialogModel,
  SessionSwitcherModel,
  SettingsModel,
  ShellDragTarget,
  TaskTemplate,
  TimelineItem,
  ToastModel,
  UploadDialogModel,
} from "./components/models";
import { createAgentDraftStore, agentDraftResourceScope, agentDraftSessionIdentity, type AgentDraftContext } from "./controllers/agent-draft-store";
import { createAgentOperationController } from "./controllers/agent-operation-controller";
import { createAgentSessionController, type AgentRunRecord } from "./controllers/agent-session-controller";
import { createCreateDialogController } from "./controllers/create-dialog-controller";
import { createNotificationController } from "./controllers/notification-controller";
import { createPaneLayoutController } from "./controllers/pane-layout-controller";
import { createResourceDetailController, type ResourceDetailRecord, type ResourceLogPageState } from "./controllers/resource-detail-controller";
import { createRouteController } from "./controllers/route-controller";
import { createSettingsController, type ForgeSettingsConfig } from "./controllers/settings-controller";
import { createUserSettingsController } from "./controllers/user-settings-controller";
import { ApiError } from "./api/client";
import { errorMessage } from "./runtime/errors";
import { ResourceScope } from "./runtime/resource-scope";

export interface ForgeViewPublisher {
  renderAppShell(model: AppShellModel): void;
  renderCreateDialog(model: CreateDialogModel): void;
  renderSettings(model: SettingsModel): void;
  renderSelfDrivingBar(model: SelfDrivingBarModel): void;
  renderSelfDrivingDialog(model: SelfDrivingDialogModel): void;
  renderUploadDialog(model: UploadDialogModel): void;
  renderComposer(model: ComposerModel): void;
  renderSessionSwitcher(model: SessionSwitcherModel): void;
  renderEventTimeline(model: EventTimelineModel): void;
  renderDetailPanel(model: DetailPanelModel): void;
  renderToast(model: ToastModel): void;
}

let publisher: ForgeViewPublisher;
let lifecycle: ResourceScope | null = null;
interface DomainRecord {
	[key: string]: unknown;
	id: string;
	name: string;
	title: string;
	type: string;
	path: string;
	status: string;
	updatedAt: string;
	resourceId: string;
	runId: string;
	agentName: string;
	key: string;
	description: string;
	icon: string;
	activeId: string;
	error: string;
	condition: string;
	enabled: boolean;
	revision: number;
	notificationError: string;
	providerId: string;
	agentHubSessionId: string;
	sourceExternalId: string;
	source: string;
	children: DomainRecord[];
	projects: DomainRecord[];
	sessions: DomainRecord[];
	workspaces: DomainRecord[];
	agents: DomainRecord[];
	agentProfiles: DomainRecord[];
	templates: TaskTemplate[];
	providers: DomainRecord[];
	controls: DomainRecord[];
	logs: DomainRecord[];
	events: DomainRecord[];
	capabilities: string[];
	agentHubProviders: DomainRecord[];
	preferredAgentProfiles: string[];
	options: { model?: string };
	selfDriving?: DomainRecord;
	lastOutcome?: DomainRecord;
	logPage?: { entries?: DomainRecord[]; hasMore?: boolean; nextCursor?: string };
	data?: DomainRecord;
}

const controllerState = {
	config: null as DomainRecord | null,
	tree: null as DomainRecord | null,
	details: {} as Record<string, DomainRecord>,
	resourceLogPages: {} as Record<string, ResourceLogPageState>,
	workspaceAgents: null as DomainRecord | null,
	workspaceAgentsDraft: "",
	workspaceAgentsDirty: false,
	workspaceAgentsSaving: false,
	activeWorkspaceId: "",
	navigationLoading: true,
	navigationError: "",
	workspaceMenuOpen: false,
	selectedId: "",
	lastResourceId: "",
	expandedProjects: /* @__PURE__ */ new Set<string>(),
	projectOrder: [] as string[],
	taskOrder: {} as Record<string, string[]>,
	sessionOrder: [] as string[],
	listDrag: null as ShellDragTarget | null,
	expandedPaths: /* @__PURE__ */ new Set<string>(),
	preview: null as DomainRecord | null,
	diff: null as DomainRecord | null,
	modalEnter: "",
	sessionMenu: null as DomainRecord | null,
	taskOperationalStateKey: "",
	selfDrivingDialog: {
		open: false,
		identity: 0,
		mode: "",
		resourceId: "",
		reuseRunId: "",
		reuseCurrentSession: false,
		agentName: "",
		expectedRevision: 0,
		expectedCondition: "",
		runInstructions: "",
		completionCriteria: "",
		submitting: false,
		error: "",
		unknown: false,
		returnFocus: null as HTMLElement | null
	},
	uploadDialog: {
		open: false,
		identity: 0,
		runId: "",
		items: [],
		nextId: 1
	},
		autoRefreshTimer: null as number | null,
	autoRefreshInFlight: false,
	autoRefreshVersion: 0,
	agentRunProjectionVersion: 0,
	treeRequestVersion: 0,
	navigationVersion: 0,
	detailRequestVersion: 0,
	workspaceAgentsRequestVersion: 0,
	previewRequestVersion: 0,
	diffRequestVersion: 0,
	agentSessionMutationCount: 0,
	iconRefreshScheduled: false,
	agent: {
		runs: [] as DomainRecord[],
		activeRunId: "",
		events: [] as DomainRecord[],
		notices: [] as DomainRecord[],
		stream: null as EventSource | null,
		streamRunId: "",
		renderTimer: null as number | null,
		draftPrompt: "",
		ttyDraft: "",
		ttyMultiline: false,
		ttyDraftKey: "",
		ttyDraftWorkspaceId: "",
		ttyDraftResourceId: "",
		ttyDraftRunId: "",
		ttyDraftVersion: 0,
		ttyDraftResetVersion: 0,
		skipTTYDraftSync: false,
		agentName: "",
		optionsOpen: false,
		agentChooserOpen: false,
		historyOpen: false,
		selfDrivingExpanded: false,
		sessionActionsOpen: false,
		eventsHasMore: false,
		historyBeforeId: 0,
		loadingOlder: false,
		toolGroupOpen: /* @__PURE__ */ new Map<string, boolean>(),
		approvalDrafts: /* @__PURE__ */ new Map<string, DomainRecord>(),
		selfDrivingFinishNoticeWatermarks: /* @__PURE__ */ new Map<string, number>(),
		renderDeferredForSelection: false
	},
	tty: [{
		type: "system",
		text: "Forge GUI initialized."
	}, {
		type: "system",
		text: "Workspace data is loaded through forge CLI."
	}] as Array<{ type: string; text: string }>
};

function clearResourceDetailState() {
	for (const id of Object.keys(controllerState.details)) delete controllerState.details[id];
	for (const id of Object.keys(controllerState.resourceLogPages)) delete controllerState.resourceLogPages[id];
}

const agentOperations = createAgentOperationController(() => {
	if (!appBooted) return;
	renderAgent();
	renderTTYComposer();
	refreshIcons();
});
const agentSessionController = createAgentSessionController({
	operations: agentOperations,
	workspaceId: () => controllerState.activeWorkspaceId,
	selectedResource: () => findResource(controllerState.selectedId),
	taskDetail: () => {
		const selected = findResource(controllerState.selectedId);
		return selected ? controllerState.details[selected.id] || selected : null;
	},
	currentRun: () => currentAgentRun(),
	runs: () => controllerState.agent.runs,
	activeRunId: () => controllerState.agent.activeRunId,
	selectedAgent: () => selectedAgentConfig(),
	enabledAgents: () => enabledAgentConfigs(),
	setAgentName: (name) => { controllerState.agent.agentName = name; },
	setActiveRun: (id) => { controllerState.agent.activeRunId = id; },
	setHistoryOpen: (open) => { controllerState.agent.historyOpen = open; },
	closeAgentMenus: () => {
		controllerState.agent.optionsOpen = false;
		controllerState.agent.agentChooserOpen = false;
		controllerState.agent.historyOpen = false;
	},
	resetDraft: () => {
		controllerState.agent.draftPrompt = "";
		clearAgentDraftMemory();
	},
	flushDraft: flushAgentDraft,
	restoreDraft: (run) => restoreAgentDraftForRun(run),
	currentDraft: () => ({ key: controllerState.agent.ttyDraftKey, text: controllerState.agent.ttyDraft, version: controllerState.agent.ttyDraftVersion }),
	updateDraft: (text) => updateAgentDraft(text),
	clearDraftAfterAccepted: (context) => clearAgentDraftAfterAccepted(context),
	bumpDraftResetVersion: () => { controllerState.agent.ttyDraftResetVersion++; },
	userName: currentUserName,
	workspaceName,
	defaultCwd: agentDefaultCwd,
	hasExternalLock: selectedResourceHasExternalLock,
	externalLockMessage: "This resource is locked by an external session. New sessions and session input are unavailable until the lock is released; the Self-Driving switch remains available.",
	isLive: isLiveAgentRun,
	isTurnInterruptible: isAgentTurnInterruptible,
	inputSelfDrivingProjection: agentInputSelfDrivingProjection,
	mutate: (action) => mutateAgentSession(action),
	request: (path, init) => api(path, init),
	reloadRuns: async () => { await loadAgentRuns(); },
	refreshTree: async () => { await refreshTreeAfterAgentSessionMutation(); },
	fetchDetail: (resourceId, workspaceId) => fetchDetail(resourceId, workspaceId, { logsLimit: RESOURCE_LOG_INITIAL_LIMIT }),
	applyDetail: (detail) => { applyResourceDetail(detail, "head"); },
	refreshInputProjection: async (workspaceId, resourceId) => { await refreshAgentInputProjection(workspaceId, resourceId); },
	publish: publishViewModels,
	renderAgent,
	renderComposer: renderTTYComposer,
	refreshIcons,
	toast
});
const paneLayoutController = createPaneLayoutController(() => renderAppShell());
const routeController = createRouteController(() => renderAppShell());
const resourceDetailController = createResourceDetailController({
	details: controllerState.details as unknown as Record<string, ResourceDetailRecord>,
	pages: controllerState.resourceLogPages,
	context: () => ({
		workspaceId: controllerState.activeWorkspaceId,
		navigationVersion: controllerState.navigationVersion,
		selectedId: controllerState.selectedId,
		detailRequestVersion: controllerState.detailRequestVersion
	}),
	nextDetailRequestVersion: () => ++controllerState.detailRequestVersion,
	isCurrentWorkspace: (workspaceId, navigationVersion) => isCurrentWorkspaceView(workspaceId, navigationVersion),
	request: (path, init) => api(path, init),
	render: renderDetails,
	refreshIcons
});
const createDialogController = createCreateDialogController({
	workspaceId: () => controllerState.activeWorkspaceId,
	templates: (projectId) => controllerState.details[projectId]?.templates || [],
	agents: svelteAgentOptions,
	profileKeys: () => (controllerState.config?.agentProfiles || []).map((profile) => profile.key),
	request: (path, init) => api(path, init),
	publish: (model) => publisher.renderCreateDialog(model),
	toast,
	reloadTree: () => loadTree(),
	selectWorkspaceResource: () => {
		controllerState.selectedId = "workspace";
	},
	onOpen: () => {
		controllerState.modalEnter = "create";
	},
	onIconsChanged: refreshIcons,
	confirmTemplateSwitch: () => window.confirm("Discard edited template fields and switch templates?")
});
const elementById = <ElementType extends HTMLElement = HTMLElement>(id: string): ElementType | null => document.getElementById(id) as ElementType | null;
const AUTO_REFRESH_INTERVAL_MS = 5e3;
const RESOURCE_LOG_INITIAL_LIMIT = 10;
const RESOURCE_LOG_MORE_LIMIT = 20;
const TASK_OUTPUT_FRESH_WINDOW_MS = 6e4;
const EXTERNAL_RESOURCE_LOCK_MESSAGE = "This resource is locked by an external session. New sessions and session input are unavailable until the lock is released; the Self-Driving switch remains available.";
const SELF_DRIVING_FINISH_NOTICE_KIND = "self-driving-finish";
const SELF_DRIVING_FINISH_NOTICE_WAITING_LIFECYCLE = "until-reconcile";
const SELF_DRIVING_RESUMABLE_STATES = /* @__PURE__ */ new Set([
	"waiting",
	"blocked",
	"error"
]);
const AGENT_HIDDEN_EVENT_TYPES = /* @__PURE__ */ new Set(["session.launch-environment"]);
const TASK_RUNNING_SESSION_STATES = /* @__PURE__ */ new Set([
	"starting",
	"running",
	"waiting_approval",
	"recovering"
]);
interface LoadTreeOptions { updateURL?: boolean; replaceURL?: boolean }
interface LoadDetailOptions { force?: boolean }
interface FetchDetailOptions { logsCursor?: string | number; cursor?: string | number; logsLimit?: number; limit?: number }
interface WorkspaceAgentsOptions { force?: boolean }
interface SelectResourceOptions { clearUnread?: boolean; forceDetail?: boolean }
interface FilePreviewOptions { workspaceId?: string; requestVersion?: number; rethrow?: boolean }
interface AgentMetadataOptions { refreshSelfDrivingProjection?: boolean }
interface RenderOptions { skipDraftSync?: boolean }
interface SelfDrivingOptions {
	enabled?: boolean;
	configured?: boolean;
	agentName?: string;
	runInstructions?: string;
	completionCriteria?: string;
}
interface UploadContext { workspaceId?: string; runId?: string }
const DEFAULT_WORKSPACE_ICON = {
	id: "",
	label: "Forge default",
	src: "/favicon.svg",
	type: "image/svg+xml"
};
const WORKSPACE_ICONS = [
	{
		id: "home-base",
		label: "Home base",
		src: "/workspace-icons/01-home-base.png"
	},
	{
		id: "personal-tasks",
		label: "Personal tasks",
		src: "/workspace-icons/02-personal-tasks.png"
	},
	{
		id: "product-roadmap",
		label: "Product roadmap",
		src: "/workspace-icons/03-product-roadmap.png"
	},
	{
		id: "software-engineering",
		label: "Software engineering",
		src: "/workspace-icons/04-software-engineering.png"
	},
	{
		id: "design-studio",
		label: "Design studio",
		src: "/workspace-icons/05-design-studio.png"
	},
	{
		id: "marketing-campaign",
		label: "Marketing campaign",
		src: "/workspace-icons/06-marketing-campaign.png"
	},
	{
		id: "sales-pipeline",
		label: "Sales pipeline",
		src: "/workspace-icons/07-sales-pipeline.png"
	},
	{
		id: "operations",
		label: "Operations",
		src: "/workspace-icons/08-operations.png"
	},
	{
		id: "finance",
		label: "Finance",
		src: "/workspace-icons/09-finance.png"
	},
	{
		id: "research-lab",
		label: "Research lab",
		src: "/workspace-icons/10-research-lab.png"
	},
	{
		id: "learning-education",
		label: "Learning and education",
		src: "/workspace-icons/11-learning-education.png"
	},
	{
		id: "customer-support",
		label: "Customer support",
		src: "/workspace-icons/12-customer-support.png"
	},
	{
		id: "events-calendar",
		label: "Events and calendar",
		src: "/workspace-icons/13-events-calendar.png"
	},
	{
		id: "documentation-knowledge",
		label: "Documentation and knowledge",
		src: "/workspace-icons/14-documentation-knowledge.png"
	},
	{
		id: "analytics",
		label: "Analytics",
		src: "/workspace-icons/15-analytics.png"
	},
	{
		id: "community-team",
		label: "Community and team",
		src: "/workspace-icons/16-community-team.png"
	}
];
const WORKSPACE_ICON_BY_ID = new Map(WORKSPACE_ICONS.map((item) => [item.id, item]));
let selfDrivingDialogIdentity = 0;
let uploadDialogIdentity = 0;
const settingsController = createSettingsController({
	config: () => controllerState.config as unknown as ForgeSettingsConfig || { workspaces: [], agents: [], agentProfiles: [] },
	setConfig: (config) => { controllerState.config = config as unknown as DomainRecord; },
	activeWorkspaceId: () => controllerState.activeWorkspaceId,
	setActiveWorkspaceId: (id) => { controllerState.activeWorkspaceId = id; },
	selectWorkspaceResource: () => { controllerState.selectedId = "workspace"; },
	request: (path, init) => api(path, init),
	publish: (model) => publisher.renderSettings(model),
	agentOptions: svelteAgentOptions,
	workspaceIcons: [DEFAULT_WORKSPACE_ICON, ...WORKSPACE_ICONS],
	userName: currentUserName,
	saveUser: (name) => {
		if (!userSettingsController) throw new Error("User settings are unavailable.");
		return userSettingsController.save(name);
	},
	notificationPreferences: () => notificationController?.preferences() || { browser: false, sound: false, permission: "unsupported", permissionError: "", soundError: "" },
	setBrowserNotifications: (enabled) => notificationController?.setBrowserEnabled(enabled),
	setCompletionSound: (enabled) => notificationController?.setSoundEnabled(enabled),
	flushDraft: flushAgentDraft,
	resetAgentState,
	reloadWorkspaceContext: async () => { await loadUIState(); await loadTree(); },
	clearWorkspaceContext: () => {
		controllerState.tree = null;
		clearResourceDetailState();
		publishViewModels();
	},
	renderWorkspace: renderWorkspaceSelect,
	renderAgentViews: () => { applyAgentConfig(); renderAgent(); renderTTYComposer(); },
	toast,
	onIconsChanged: refreshIcons
});
function svelteAgentOptions() {
	return enabledAgentConfigs().map((agent) => ({
		id: agent.id || "",
		label: agentDisplayName(agent),
		summary: agentConfigSummary(agent)
	}));
}
function publishAllViewModels() {
	renderAppShell();
	renderDetails();
	renderCreateDialog();
	renderSelfDrivingConfigDialog();
	renderAgentUploadDialog();
	renderTTYComposer();
	renderAgent();
	renderTTY();
	renderSettingsModal();
}
let notificationController: ReturnType<typeof createNotificationController> | null = null;
let userSettingsController: ReturnType<typeof createUserSettingsController> | null = null;
function initializeNotificationState(workspaceId) {
	notificationController?.initialize(workspaceId);
}
function establishNotificationBaseline() {
	notificationController?.establishBaseline();
}
function observeCompletionProjections(items) {
	notificationController?.observeProjections(items);
}
function observeCompletionEvent(event, run) {
	notificationController?.observeEvent(event, run);
}
function hasUnreadNotificationForSession(sessionId) {
	return notificationController?.hasUnreadForSession(sessionId) ?? false;
}
function clearUnreadForResource(resourceId) {
	notificationController?.clearResource(resourceId);
}
function currentUserName() {
	return userSettingsController?.current() || "User";
}
const agentDraftStore = createAgentDraftStore();
function agentDraftKeyForRun(run, workspaceId = controllerState.activeWorkspaceId) {
	return agentDraftStore.keyForRun(run, workspaceId);
}
function readAgentDraft(key) {
	return agentDraftStore.read(key);
}
function removeAgentDraft(key) {
	agentDraftStore.remove(key);
}
function agentDraftProtectedKeys(workspaceId, resourceId) {
	const protectedKeys = /* @__PURE__ */ new Set<string>();
	if (controllerState.agent.ttyDraftWorkspaceId === workspaceId && controllerState.agent.ttyDraftResourceId === resourceId && controllerState.agent.ttyDraftKey) protectedKeys.add(controllerState.agent.ttyDraftKey);
	for (const run of controllerState.agent.runs || []) {
		if (agentDraftResourceScope(run.resourceId) !== resourceId) continue;
		const key = agentDraftKeyForRun(run, workspaceId);
		if (key) protectedKeys.add(key);
	}
	return protectedKeys;
}
function pruneAgentDraftStorage(workspaceId = controllerState.activeWorkspaceId, resourceId = controllerState.agent.ttyDraftResourceId) {
	const workspace = String(workspaceId || "").trim();
	const resource = agentDraftResourceScope(resourceId);
	if (!workspace) return;
	agentDraftStore.prune(workspace, resource, agentDraftProtectedKeys(workspace, resource));
}
function writeAgentDraft(key, text, context: AgentDraftContext) {
	agentDraftStore.write(key, text, context);
}
function persistAgentDraft() {
	const key = controllerState.agent.ttyDraftKey;
	if (!key) return;
	writeAgentDraft(key, controllerState.agent.ttyDraft, {
		workspaceId: controllerState.agent.ttyDraftWorkspaceId,
		resourceId: controllerState.agent.ttyDraftResourceId,
		runId: controllerState.agent.ttyDraftRunId,
		sessionId: agentDraftSessionIdentity(currentAgentRun())
	});
	pruneAgentDraftStorage(controllerState.agent.ttyDraftWorkspaceId, controllerState.agent.ttyDraftResourceId);
}
function updateAgentDraft(text, persist = true) {
	const next = String(text ?? "");
	if (controllerState.agent.ttyDraft !== next) {
		controllerState.agent.ttyDraft = next;
		controllerState.agent.ttyDraftVersion++;
	}
	controllerState.agent.ttyMultiline = next.includes("\n");
	if (persist) persistAgentDraft();
}
function clearAgentDraftMemory() {
	controllerState.agent.ttyDraft = "";
	controllerState.agent.ttyMultiline = false;
	controllerState.agent.ttyDraftKey = "";
	controllerState.agent.ttyDraftWorkspaceId = "";
	controllerState.agent.ttyDraftResourceId = "";
	controllerState.agent.ttyDraftRunId = "";
	controllerState.agent.ttyDraftVersion++;
}
function restoreAgentDraftForRun(run, workspaceId = controllerState.activeWorkspaceId) {
	const key = agentDraftKeyForRun(run, workspaceId);
	if (!key) {
		clearAgentDraftMemory();
		return;
	}
	if (controllerState.agent.ttyDraftKey === key) return;
	controllerState.agent.ttyDraftKey = key;
	controllerState.agent.ttyDraftWorkspaceId = String(workspaceId || "").trim();
	controllerState.agent.ttyDraftResourceId = agentDraftResourceScope(run.resourceId);
	controllerState.agent.ttyDraftRunId = String(run.id || "");
	controllerState.agent.ttyDraft = readAgentDraft(key);
	controllerState.agent.ttyMultiline = controllerState.agent.ttyDraft.includes("\n");
	controllerState.agent.ttyDraftVersion++;
	pruneAgentDraftStorage(controllerState.agent.ttyDraftWorkspaceId, controllerState.agent.ttyDraftResourceId);
}
function flushAgentDraft() {
	persistAgentDraft();
}
function clearAgentDraftAfterAccepted({ workspaceId, runId, key, text, version }) {
	if (controllerState.activeWorkspaceId !== workspaceId || controllerState.agent.activeRunId !== runId || controllerState.agent.ttyDraftKey !== key || controllerState.agent.ttyDraft !== text || controllerState.agent.ttyDraftVersion !== version) return false;
	removeAgentDraft(key);
	updateAgentDraft("", false);
	return true;
}
async function api(path: string, options: RequestInit = {}) {
	const response = await fetch(path, {
		headers: { "Content-Type": "application/json" },
		...options
	});
	if (!response.ok) {
		let message = `${response.status} ${response.statusText}`;
		try {
			message = (await response.json()).error || message;
		} catch (_) {}
		throw new ApiError(response.status, message);
	}
	if (response.status === 204) return null;
	return response.json();
}
async function load() {
	const route = parseRoute();
	const [base, agentHub] = await Promise.all([api("/api/workspaces"), api("/api/settings/agenthub")]);
	controllerState.config = configWithAgentHubCatalog(base, agentHub);
	applyAgentConfig();
	controllerState.activeWorkspaceId = workspaceExists(route.workspaceId) ? route.workspaceId || "" : controllerState.config?.activeId || controllerState.config?.workspaces[0]?.id || "";
	controllerState.selectedId = route.resourceId || "workspace";
	renderWorkspaceSelect();
	if (controllerState.activeWorkspaceId) {
		initializeNotificationState(controllerState.activeWorkspaceId);
		await loadUIState();
		if (!route.resourceId && controllerState.lastResourceId) controllerState.selectedId = controllerState.lastResourceId;
		await loadTree({ replaceURL: true });
	} else {
		controllerState.navigationLoading = false;
		controllerState.tree = null;
		clearResourceDetailState();
		controllerState.workspaceAgents = null;
		controllerState.preview = null;
		controllerState.diff = null;
		resetAgentState();
		publishViewModels();
	}
}
async function loadTree(options: LoadTreeOptions = {}) {
	if (!controllerState.activeWorkspaceId) return;
	const workspaceId = controllerState.activeWorkspaceId;
	const navigationVersion = controllerState.navigationVersion;
	const treeRequestVersion = ++controllerState.treeRequestVersion;
	controllerState.navigationLoading = true;
	controllerState.navigationError = "";
	renderAppShell();
	controllerState.detailRequestVersion++;
	controllerState.workspaceAgentsRequestVersion++;
	controllerState.previewRequestVersion++;
	controllerState.diffRequestVersion++;
	let tree;
	try {
		tree = await api(`/api/workspaces/${workspaceId}/tree`);
	} catch (err) {
		if (isCurrentWorkspaceView(workspaceId, navigationVersion, treeRequestVersion)) {
			controllerState.navigationLoading = false;
			controllerState.navigationError = errorMessage(err);
			renderAppShell();
		}
		throw err;
	}
	if (!isCurrentWorkspaceView(workspaceId, navigationVersion, treeRequestVersion)) return;
	controllerState.tree = tree;
	clearResourceDetailState();
	controllerState.workspaceAgents = null;
	controllerState.workspaceAgentsSaving = false;
	controllerState.preview = null;
	controllerState.diff = null;
	ensureValidSelection();
	ensureSelectedProjectExpanded(false);
	if (controllerState.selectedId === "workspace") await loadWorkspaceAgents();
	else if (controllerState.selectedId) await loadDetail(controllerState.selectedId);
	if (!isCurrentWorkspaceView(workspaceId, navigationVersion, treeRequestVersion)) return;
	await loadAgentRuns();
	if (!isCurrentWorkspaceView(workspaceId, navigationVersion, treeRequestVersion)) return;
	establishNotificationBaseline();
	controllerState.navigationLoading = false;
	controllerState.navigationError = "";
	publishViewModels();
	if (options.updateURL !== false) syncURL({ replace: Boolean(options.replaceURL) });
}
async function loadDetail(id, options: LoadDetailOptions = {}) {
	return resourceDetailController.load(id, options) as Promise<DomainRecord | null | undefined>;
}
function fetchDetail(id, workspaceId = controllerState.activeWorkspaceId, options: FetchDetailOptions = {}) {
	return resourceDetailController.fetch(id, workspaceId, options) as Promise<DomainRecord>;
}
function resetResourceLogState(resourceId) {
	resourceDetailController.reset(resourceId);
}
function resourceLogPage(resourceId) {
	return resourceDetailController.page(resourceId);
}
function resourceDetailSnapshot(resourceId) {
	return resourceDetailController.snapshot(resourceId);
}
function applyResourceDetail(detail, mode: "head" | "replace" | "older" = "head") {
	return resourceDetailController.apply(detail as ResourceDetailRecord, mode) as DomainRecord | null;
}
async function loadMoreLogs(resourceId = controllerState.selectedId) {
	await resourceDetailController.loadMore(resourceId);
}
async function loadWorkspaceAgents(options: WorkspaceAgentsOptions = {}) {
	if (!controllerState.activeWorkspaceId || controllerState.workspaceAgents && !options.force) return;
	const workspaceId = controllerState.activeWorkspaceId;
	const navigationVersion = controllerState.navigationVersion;
	const requestVersion = ++controllerState.workspaceAgentsRequestVersion;
	try {
		const agents = await api(`/api/workspaces/${workspaceId}/files?path=${encodeURIComponent("AGENTS.md")}`);
		if (!isCurrentWorkspaceView(workspaceId, navigationVersion) || requestVersion !== controllerState.workspaceAgentsRequestVersion) return null;
		controllerState.workspaceAgents = agents;
	} catch (err) {
		if (!isCurrentWorkspaceView(workspaceId, navigationVersion) || requestVersion !== controllerState.workspaceAgentsRequestVersion) return null;
		controllerState.workspaceAgents = {
			path: "AGENTS.md",
			name: "AGENTS.md",
			error: errorMessage(err)
		} as DomainRecord;
	}
	return controllerState.workspaceAgents;
}
async function loadUIState(workspaceId = controllerState.activeWorkspaceId, navigationVersion = controllerState.navigationVersion) {
	const uiState = await api(`/api/workspaces/${workspaceId}/ui-state`);
	if (!isCurrentWorkspaceView(workspaceId, navigationVersion)) return false;
	controllerState.expandedProjects = new Set(uiState.expandedProjects || []);
	controllerState.lastResourceId = uiState.lastResourceId || "";
	controllerState.projectOrder = Array.isArray(uiState.projectOrder) ? uiState.projectOrder : [];
	controllerState.taskOrder = uiState.taskOrder && typeof uiState.taskOrder === "object" ? uiState.taskOrder : {};
	controllerState.sessionOrder = Array.isArray(uiState.sessionOrder) ? uiState.sessionOrder : [];
	return true;
}
async function saveUIState() {
	if (!controllerState.activeWorkspaceId) return;
	const workspaceId = controllerState.activeWorkspaceId;
	const navigationVersion = controllerState.navigationVersion;
	const selectedId = controllerState.selectedId;
	await api(`/api/workspaces/${workspaceId}/ui-state`, {
		method: "PUT",
		body: JSON.stringify({
			version: 1,
			expandedProjects: [...controllerState.expandedProjects],
			lastResourceId: selectedId,
			projectOrder: controllerState.projectOrder,
			taskOrder: controllerState.taskOrder,
			sessionOrder: controllerState.sessionOrder
		})
	});
	if (isCurrentWorkspaceView(workspaceId, navigationVersion)) controllerState.lastResourceId = selectedId;
}
function startAutoRefresh() {
	if (controllerState.autoRefreshTimer) return;
	controllerState.autoRefreshTimer = lifecycle?.interval(() => {
		autoRefresh().catch((err) => {
			console.warn("auto refresh failed", err);
		});
	}, AUTO_REFRESH_INTERVAL_MS) ?? null;
}
async function autoRefresh() {
	if (!controllerState.activeWorkspaceId || controllerState.autoRefreshInFlight || controllerState.agentSessionMutationCount > 0 || controllerState.listDrag) return;
	const refreshVersion = controllerState.autoRefreshVersion;
	const workspaceId = controllerState.activeWorkspaceId;
	const navigationVersion = controllerState.navigationVersion;
	let selectedId = controllerState.selectedId;
	controllerState.autoRefreshInFlight = true;
	try {
		const tree = await fetchCurrentTree(workspaceId);
		if (!tree || !isCurrentAutoRefresh(workspaceId, navigationVersion, refreshVersion)) return;
		let changed = !sameJSON(controllerState.tree, tree);
		if (changed) controllerState.tree = tree;
		if (typeof observeCompletionProjections === "function") observeCompletionProjections(tree.sessions || []);
		if (changed && controllerState.preview?.section === "Wiki" && !controllerState.preview.loading) {
			await refreshFilePreview("Wiki", controllerState.preview.path);
			if (!isCurrentAutoRefresh(workspaceId, navigationVersion, refreshVersion)) return;
		}
		if (ensureValidSelection()) {
			syncURL({ replace: true });
			changed = true;
			selectedId = controllerState.selectedId;
		}
		const expandedCount = controllerState.expandedProjects.size;
		ensureSelectedProjectExpanded(false);
		changed = changed || expandedCount !== controllerState.expandedProjects.size;
		if (controllerState.selectedId === "workspace") {
			const previousAgents = controllerState.workspaceAgents;
			await loadWorkspaceAgents({ force: true });
			if (!isCurrentAutoRefresh(workspaceId, navigationVersion, refreshVersion)) return;
			if (!sameJSON(previousAgents, controllerState.workspaceAgents)) changed = true;
		} else if (selectedId) {
			const detailRequestVersion = ++controllerState.detailRequestVersion;
			const detail = await fetchDetail(selectedId, workspaceId, { logsLimit: RESOURCE_LOG_INITIAL_LIMIT });
			if (!isCurrentAutoRefresh(workspaceId, navigationVersion, refreshVersion) || controllerState.selectedId !== selectedId || detailRequestVersion !== controllerState.detailRequestVersion) return;
			const previousDetail = resourceDetailSnapshot(selectedId);
			applyResourceDetail(detail, "head");
			if (!sameJSON(previousDetail, resourceDetailSnapshot(selectedId))) changed = true;
		}
		controllerState.agentRunProjectionVersion = (Number(controllerState.agentRunProjectionVersion) || 0) + 1;
		const agentRunProjectionVersion = controllerState.agentRunProjectionVersion;
		const runs = await fetchAgentRuns();
		if (!isCurrentAutoRefresh(workspaceId, navigationVersion, refreshVersion) || agentRunProjectionVersion !== controllerState.agentRunProjectionVersion) return;
		if (!sameJSON(controllerState.agent.runs, runs)) {
			controllerState.agent.runs = runs;
			changed = true;
		}
		if (typeof observeCompletionProjections === "function") observeCompletionProjections(runs);
		if (typeof reconcileAgentNotices === "function") reconcileAgentNotices(runs);
		if (reconcileActiveAgentRun(runs)) {
			if (!isCurrentAutoRefresh(workspaceId, navigationVersion, refreshVersion) || agentRunProjectionVersion !== controllerState.agentRunProjectionVersion) return;
			changed = true;
		}
		if (typeof reconcileAgentNotices === "function") reconcileAgentNotices(controllerState.agent.runs);
		if (taskOperationalStateKey() !== controllerState.taskOperationalStateKey) changed = true;
		if (changed) publishViewModels();
	} finally {
		controllerState.autoRefreshInFlight = false;
	}
}
function publishViewModels() {
	renderAppShell();
	renderDetails();
	renderAgent();
	renderTTY();
	refreshIcons();
	renderCreateDialog();
	renderSelfDrivingConfigDialog();
	renderSettingsModal();
}
function renderSelectionPanels() {
	renderAppShell();
	renderDetails();
	renderAgent();
	renderTTY();
	refreshIcons();
	renderCreateDialog();
	renderSelfDrivingConfigDialog();
}
function isCurrentWorkspaceView(workspaceId, navigationVersion, treeRequestVersion: number | null = null) {
	return workspaceId === controllerState.activeWorkspaceId && navigationVersion === controllerState.navigationVersion && (treeRequestVersion == null || treeRequestVersion === controllerState.treeRequestVersion);
}
function isCurrentAutoRefresh(workspaceId, navigationVersion, refreshVersion) {
	return isCurrentWorkspaceView(workspaceId, navigationVersion) && refreshVersion === controllerState.autoRefreshVersion;
}
function workspaceIconOption(workspace) {
	return WORKSPACE_ICON_BY_ID.get(String(workspace?.icon || "").trim()) || DEFAULT_WORKSPACE_ICON;
}
function updateWorkspaceFavicon(workspace) {
	const option = workspaceIconOption(workspace);
	let link = document.querySelector<HTMLLinkElement>("link[rel=\"icon\"]");
	if (!link) {
		link = document.createElement("link");
		link.rel = "icon";
		document.head.appendChild(link);
	}
	link.type = "type" in option ? String(option.type || "image/png") : "image/png";
	link.href = option.src;
}
function renderWorkspaceSelect() {
	const active = controllerState.config?.workspaces?.find((workspace) => workspace.id === controllerState.activeWorkspaceId);
	updateWorkspaceFavicon(active);
	renderAppShell();
}
function resourceRefText(id) {
	if (!id) return "";
	const segment = id.includes(".") ? id.slice(id.lastIndexOf(".") + 1) : id;
	const match = segment.match(/^(?:project|task)(\d+)$/);
	return `#${match ? match[1] : segment}`;
}
function appShellStatusModel(presentation) {
	const statuses = (presentation?.statuses || []).map((status, index) => ({
		key: `${status.kind || status.iconName || "status"}:${index}`,
		className: status.className || "",
		iconName: status.iconName || "circle",
		recentOutput: Boolean(status.recentOutput)
	}));
	return {
		hasTaskState: Boolean(presentation?.hasTaskState),
		className: presentation?.className || "",
		layoutClassName: presentation?.layoutClassName || "",
		slotClassName: presentation?.slotClassName || "",
		statuses,
		lock: presentation?.lock ? { className: presentation.lock.className || "" } : null
	};
}
function appShellResourceModel(item, kind, projectId = "") {
	const taskState = taskOperationalState(item);
	const expanded = kind === "project" && isProjectExpanded(item.id);
	const summary = kind === "project" ? projectTaskSummary(item) : null;
	const title = item.title || item.id;
	return {
		id: item.id,
		type: kind,
		title,
		ref: resourceRefText(item.id),
		active: controllerState.selectedId === item.id,
		expanded,
		ariaLabel: [
			title,
			summary?.ariaLabel,
			taskState.label
		].filter(Boolean).join(". "),
		statusLabel: taskState.label || "",
		status: appShellStatusModel(taskState.statusPresentation),
		summary: summary ? {
			taskLabel: summary.taskLabel,
			runningLabel: summary.runningLabel,
			ariaLabel: summary.ariaLabel
		} : null,
		children: kind === "project" ? applyCustomOrder(item.children || [], controllerState.taskOrder[item.id]).map((task) => appShellResourceModel(task, "task", item.id)) : [],
		projectId
	};
}
function appShellSessionModel(session) {
	const navigation = sessionNavigationTarget(session);
	const resourceId = navigation.displayResourceId;
	const isInternal = session.source === "internal";
	const status = isInternal ? sessionStatusPresentation(session) : taskStatusState("session-external", "session-status-external", "message-square", "External session active", "session");
	const taskResource = sessionTaskResource(session);
	const taskState = taskResource ? taskOperationalState(taskResource) : noTaskOperationalState();
	const presentation = operationalStatusPresentation(isInternal && taskState.selfDriving ? [taskState.selfDriving, status] : [status]);
	const unread = hasUnreadNotificationForSession(session.id);
	const statusLabel = `${sessionOperationalLabel(session, taskResource, taskState, status)}${unread ? ". Unread turn completion." : ""}`;
	const agent = isInternal ? (controllerState.config?.agents || []).find((item) => item.id === session.agentRunAgentName) : null;
	const metaParts = [isInternal ? "AgentHub" : "External"];
	if (navigation.controls.length > 1) metaParts.push(`${navigation.controls.length} locks`);
	else if (resourceId) metaParts.push(resourceId);
	if (session.updatedAt) metaParts.push(relativeTime(session.updatedAt));
	return {
		id: session.id,
		source: session.source || "external",
		title: sessionDisplayTitle(session, navigation),
		meta: metaParts.join(" · "),
		label: isInternal ? agent?.name || session.agentRunAgentName || "AgentHub" : "External",
		statusLabel,
		status: appShellStatusModel(presentation),
		unread,
		current: Boolean(controllerState.selectedId && controllerState.selectedId !== "workspace" && navigation.selectedResourceIds.includes(controllerState.selectedId)),
		clickable: Boolean(navigation.navigationResourceId || navigation.menu),
		navigationResourceId: navigation.navigationResourceId,
		menu: navigation.menu,
		controls: navigation.controls.map((control) => ({
			resourceId: control.resourceId,
			path: control.path || "",
			navigable: Boolean(sessionNavigableResourceId(control.resourceId))
		}))
	};
}
function renderAppShell() {
	const projects = controllerState.tree ? applyCustomOrder(controllerState.tree.projects || [], controllerState.projectOrder).map((project) => appShellResourceModel(project, "project")) : [];
	const sessions = applyCustomOrder(sortedSessionsForDisplay(controllerState.tree?.sessions || []), controllerState.sessionOrder).map(appShellSessionModel);
	if (controllerState.tree) controllerState.taskOperationalStateKey = taskOperationalStateKey();
	publisher.renderAppShell({
		identity: controllerState.activeWorkspaceId || "no-workspace",
		loading: Boolean(controllerState.navigationLoading),
		error: controllerState.navigationError || "",
		version: "v0.1.0",
		activeWorkspaceId: controllerState.activeWorkspaceId,
		workspaces: (controllerState.config?.workspaces || []).map((workspace) => ({
			id: workspace.id,
			name: workspace.name || workspace.id,
			path: workspace.path || "",
			icon: workspace.icon || "",
			iconSrc: workspaceIconOption(workspace).src
		})),
		projects,
		sessions,
		...paneLayoutController.snapshot(),
		route: routeController.projection(),
		onSwitchWorkspace: (id) => switchWorkspace(id),
		onAddWorkspace: () => openSettings("workspace").catch((err) => toast(err.message)),
		onCreateProject: () => showProjectForm(),
		onOpenSettings: () => openSettings().catch((err) => toast(err.message)),
		onToggleProject: (id) => toggleProject(id),
		onSelectResource: (id) => selectResource(id),
		onReorder: (drag, target, after) => commitListDrag(drag, target, after),
		onDragState: (drag) => {
			controllerState.listDrag = drag;
		},
		onPanePreview: (name, value) => setPaneSize(name, value),
		onPaneCommit: (name) => savePaneSize(name),
		onPaneViewport: () => syncPaneViewport(),
		onMobileSidebar: (open) => setMobileSidebar(open),
		onMobileView: (view) => setMobileView(view),
		onMobileImmersive: (immersive) => setMobileImmersive(immersive),
		onHistoryNavigation: (pathname) => handleHistoryNavigation(pathname),
		onToast: toast,
		onIconsChanged: refreshIcons
	});
}
async function switchWorkspace(id) {
	if (!workspaceExists(id)) return;
	controllerState.workspaceMenuOpen = false;
	if (id === controllerState.activeWorkspaceId) {
		renderWorkspaceSelect();
		return;
	}
	setMobileSidebar(false);
	flushAgentDraft();
	controllerState.navigationVersion++;
	controllerState.autoRefreshVersion++;
	controllerState.treeRequestVersion++;
	controllerState.detailRequestVersion++;
	controllerState.workspaceAgentsRequestVersion++;
	controllerState.previewRequestVersion++;
	controllerState.diffRequestVersion++;
	const navigationVersion = controllerState.navigationVersion;
	await saveUIState().catch((err) => console.warn("failed to save UI state", err));
	controllerState.activeWorkspaceId = id;
	controllerState.selectedId = "workspace";
	controllerState.tree = null;
	controllerState.navigationLoading = true;
	controllerState.navigationError = "";
	clearResourceDetailState();
	initializeNotificationState(id);
	controllerState.sessionMenu = null;
	resetWorkspaceAgentsDraft();
	controllerState.workspaceAgentsSaving = false;
	closeCreateDialog();
	if (controllerState.selfDrivingDialog.open && !controllerState.selfDrivingDialog.submitting) closeSelfDrivingConfigDialog();
	resetAgentState();
	renderWorkspaceSelect();
	if (!await loadUIState(id, navigationVersion)) return;
	controllerState.selectedId = controllerState.lastResourceId || "workspace";
	await loadTree();
}
function projectTaskSummary(project) {
	const tasks = (Array.isArray(project?.children) ? project.children : []).filter((task) => task && task.archived !== true);
	const runningTaskIds = /* @__PURE__ */ new Set();
	for (const task of tasks) if (taskAgentSessions(task.id).some(taskSessionCountsAsRunning)) runningTaskIds.add(task.id);
	const taskCount = tasks.length;
	const runningCount = runningTaskIds.size;
	const taskLabel = `${taskCount} ${taskCount === 1 ? "task" : "tasks"}`;
	const runningLabel = `${runningCount} running`;
	return {
		taskCount,
		runningCount,
		taskLabel,
		runningLabel,
		text: `${taskLabel} · ${runningLabel}`,
		ariaLabel: `Open tasks: ${taskLabel}; ${runningLabel}`
	};
}
function taskSessionCountsAsRunning(session) {
	return session?.source === "internal" && TASK_RUNNING_SESSION_STATES.has(session.agentRunStatus);
}
async function commitListDrag(drag, target, after) {
	const previous = {
		projectOrder: [...controllerState.projectOrder],
		taskOrder: Object.fromEntries(Object.entries(controllerState.taskOrder).map(([id, order]) => [id, Array.isArray(order) ? [...order] : []])),
		sessionOrder: [...controllerState.sessionOrder]
	};
	if (drag.kind === "session") {
		const sessions = applyCustomOrder(sortedSessionsForDisplay(controllerState.tree?.sessions || []), controllerState.sessionOrder);
		controllerState.sessionOrder = moveIdInList(sessions.map((session) => session.id), drag.id, target.id, after);
	} else if (drag.kind === "task") {
		const project = findResource(drag.projectId);
		if (!project) return;
		const tasks = applyCustomOrder(project.children || [], controllerState.taskOrder[drag.projectId]);
		controllerState.taskOrder = {
			...controllerState.taskOrder,
			[drag.projectId]: moveIdInList(tasks.map((task) => task.id), drag.id, target.id, after)
		};
	} else if (drag.kind === "project") {
		const projects = applyCustomOrder(controllerState.tree?.projects || [], controllerState.projectOrder);
		controllerState.projectOrder = moveIdInList(projects.map((project) => project.id), drag.id, target.id, after);
	} else return;
	renderAppShell();
	try {
		await saveUIState();
	} catch (err) {
		controllerState.projectOrder = previous.projectOrder;
		controllerState.taskOrder = previous.taskOrder;
		controllerState.sessionOrder = previous.sessionOrder;
		renderAppShell();
		throw err;
	}
}
function noTaskOperationalState() {
	return {
		selfDriving: null,
		session: null,
		className: "",
		label: "",
		lock: null,
		statusPresentation: operationalStatusPresentation([], null)
	};
}
function taskOperationalState(item) {
	const sessions = taskAgentSessions(item.id);
	const locks = resourceLocks(item.id);
	const selfDriving = deriveTaskSelfDrivingState(item.selfDriving);
	const session = deriveTaskSessionState(sessions);
	const lock = deriveTaskLockState(locks);
	const statusPresentation = operationalStatusPresentation([selfDriving, session], lock);
	return {
		selfDriving,
		session,
		className: statusPresentation.className,
		lock,
		statusPresentation,
		label: taskOperationalLabel(item.selfDriving, sessions, lock, {
			selfDriving,
			session
		})
	};
}
function operationalStatusPresentation(statuses, lock: { kind?: string; className?: string; label?: string } | null = null) {
	const visibleStatuses = (statuses || []).filter(Boolean);
	const hasTaskState = visibleStatuses.length > 0 || Boolean(lock);
	return {
		statuses: visibleStatuses,
		lock,
		hasTaskState,
		className: visibleStatuses.map((status) => status.className).filter(Boolean).join(" "),
		layoutClassName: !hasTaskState ? "" : visibleStatuses.length > 1 ? "has-task-status-dual" : "has-task-status",
		slotClassName: [
			visibleStatuses.length === 0 && lock ? "task-status-lock-only" : "",
			visibleStatuses.length === 1 ? "task-status-single" : "",
			visibleStatuses.length > 1 ? "task-status-dual" : ""
		].filter(Boolean).join(" ")
	};
}
function deriveTaskSelfDrivingState(selfDriving) {
	if (!selfDriving) return null;
	if (!selfDriving.enabled) return null;
	const selfDrivingState = selfDriving?.condition || "ready";
	if (selfDrivingState === "error") return taskStatusState("error", "task-status-danger", "triangle-alert", "Self-Driving error", "self-driving");
	if (selfDrivingState === "blocked" || selfDrivingState === "needs_configuration") return taskStatusState(selfDrivingState, "task-status-attention", "square", `Self-Driving ${selfDrivingState.replace(/_/g, " ")}`, "self-driving");
	if (selfDrivingState === "waiting") return taskStatusState("waiting", "task-status-attention", "pause", "Self-Driving waiting", "self-driving");
	if (selfDrivingState === "ready") return taskStatusState("ready", "task-status-queued", "clock", "Self-Driving ready", "self-driving");
	return taskStatusState("unknown", "task-status-neutral", "circle-help", `Self-Driving ${selfDrivingState || "unknown"}`, "self-driving");
}
function deriveTaskSessionState(sessions) {
	const approval = sessions.find((session) => session.agentRunStatus === "waiting_approval");
	if (approval) return sessionStatusPresentation(approval);
	const starting = sessions.find((session) => session.agentRunStatus === "starting");
	if (starting) return sessionStatusPresentation(starting);
	const running = sessions.find((session) => session.agentRunStatus === "running");
	if (running) return sessionStatusPresentation(running);
	const stopping = sessions.find((session) => session.agentRunStatus === "stopping");
	if (stopping) return sessionStatusPresentation(stopping);
	const recovering = sessions.find((session) => session.agentRunStatus === "recovering");
	if (recovering) return sessionStatusPresentation(recovering);
	const idle = sessions.find((session) => session.agentRunStatus === "idle");
	if (idle) return sessionStatusPresentation(idle);
	return sessions.length > 0 ? sessionStatusPresentation(sessions[0]) : null;
}
function sessionStatusPresentation(session) {
	const status = session?.agentRunStatus || "";
	switch (status) {
		case "starting": return taskStatusState("session-starting", "task-status-session-running", "loader-circle", "Session starting", "session", session);
		case "running": return taskStatusState("session-running", "task-status-session-running", "loader-circle", "Session running", "session", session);
		case "waiting_approval": return taskStatusState("session-approval", "task-status-attention", "shield-question", "Session waiting for approval", "session", session);
		case "stopping": return taskStatusState("session-stopping", "task-status-session-stopping", "loader-circle", "Session stopping", "session", session);
		case "recovering": return taskStatusState("session-recovering", "task-status-attention", "rotate-ccw", "Session recovering", "session", session);
		case "idle": return taskStatusState("session-idle", "task-status-info", "message-square", "Session waiting for input", "session", session);
		default: return taskStatusState("session-active", "task-status-neutral", "circle-dot", status ? `Session ${status}` : "Session active", "session", session);
	}
}
function taskStatusState(kind, className, iconName, label, dimension, session = null) {
	return {
		kind,
		className,
		iconName,
		label,
		dimension,
		recentOutput: Boolean(session && hasRecentAgentOutput(session))
	};
}
function taskAgentSessions(resourceId) {
	if (!resourceId) return [];
	return (controllerState.tree?.sessions || []).filter((session) => session.resourceId === resourceId || sessionControls(session).some((control) => control.resourceId === resourceId));
}
function resourceLocks(resourceId) {
	if (!resourceId) return [];
	return (controllerState.tree?.sessions || []).filter((session) => sessionControls(session).some((control) => control.resourceId === resourceId));
}
function selectedLockableResource() {
	const selected = findResource(controllerState.selectedId);
	if (!selected || selected.type !== "project" && selected.type !== "task") return null;
	const detail = controllerState.details?.[selected.id];
	if (detail && detail.type !== selected.type) return null;
	return selected;
}
function selectedResourceHasExternalLock() {
	const selected = selectedLockableResource();
	return Boolean(selected && resourceLocks(selected.id).some((session) => session.source === "external"));
}
function selectedResourceHasInternalLock() {
	const selected = selectedLockableResource();
	return Boolean(selected && resourceLocks(selected.id).some((session) => session.source === "internal"));
}
function selectedResourceHasNewSessionLock() {
	return selectedResourceHasExternalLock() || selectedResourceHasInternalLock();
}
function closeNewSessionChooserForResourceLock() {
	if (selectedResourceHasNewSessionLock()) controllerState.agent.agentChooserOpen = false;
}
function deriveTaskLockState(locks) {
	if (locks.length === 0) return null;
	const external = locks.find((session) => session.source === "external");
	const owner = external || locks[0];
	const count = locks.length;
	const ownerLabel = taskLockOwnerLabel(owner);
	return {
		kind: external ? "external" : "internal",
		className: external ? "task-lock-external" : "task-lock-internal",
		label: count > 1 ? `Locked by ${count} sessions including ${ownerLabel}` : `Locked by ${ownerLabel}`
	};
}
function taskLockOwnerLabel(session) {
	if (session.source === "external") return "an external session";
	return `${(controllerState.config?.agents || []).find((item) => item.id === session.agentRunAgentName)?.name || session.agentRunAgentName || "Forge GUI"} session`;
}
function taskOperationalLabel(selfDriving, sessions, lock, statuses) {
	const parts: string[] = [];
	if (selfDriving) parts.push(`Self-Driving ${selfDriving.enabled ? "on" : "off"}, ${selfDriving.condition}, revision ${selfDriving.revision}`);
	if (sessions.length === 1) parts.push(taskAgentSessionLabel(sessions[0]));
	else if (sessions.length > 1) {
		const sessionStatuses = [...new Set(sessions.map((session) => session.agentRunStatus || "open"))].join(", ");
		parts.push(`${sessions.length} agent sessions: ${sessionStatuses}`);
	}
	if (lock) parts.push(lock.label);
	return parts.join(" · ");
}
function taskAgentSessionLabel(session) {
	return `${session.schedulerTurn ? "Self-Driving session" : "Agent session"} ${(session.agentRunStatus || "open").replace("waiting_approval", "waiting for approval")}`;
}
function taskOperationalStateKey() {
	if (!controllerState.tree) return "";
	const parts: string[] = [];
	for (const project of controllerState.tree.projects || []) {
		const projectState = taskOperationalState(project);
		const summary = projectTaskSummary(project);
		parts.push(`${project.id}:auto=${taskStatusKey(projectState.selfDriving)}:session=${taskStatusKey(projectState.session)}:${projectState.lock?.kind || "none"}:${projectState.label}:tasks=${summary.taskCount}:${summary.runningCount}`);
		for (const task of project.children || []) {
			const taskState = taskOperationalState(task);
			parts.push(`${task.id}:auto=${taskStatusKey(taskState.selfDriving)}:session=${taskStatusKey(taskState.session)}:${taskState.lock?.kind || "none"}:${taskState.label}`);
		}
	}
	return parts.join("|");
}
function taskStatusKey(status) {
	if (!status) return "none";
	return `${status.kind}:${status.iconName}:${status.recentOutput}`;
}
function hasRecentAgentOutput(session) {
	const outputAt = new Date(session.agentRunLastOutputAt || "").getTime();
	if (Number.isFinite(outputAt)) return Date.now() - outputAt <= TASK_OUTPUT_FRESH_WINDOW_MS;
	if (!["running", "starting"].includes(session.agentRunStatus)) return false;
	const updatedAt = new Date(session.agentRunUpdatedAt || "").getTime();
	return Number.isFinite(updatedAt) && Date.now() - updatedAt <= TASK_OUTPUT_FRESH_WINDOW_MS;
}
async function selectResource(id, options: SelectResourceOptions = {}) {
	const selectionChanged = controllerState.selectedId !== id;
	if (options.clearUnread !== false) clearUnreadForResource(id);
	const forceDetail = selectionChanged || Boolean(options.forceDetail);
	if (forceDetail) {
		controllerState.navigationVersion++;
		controllerState.autoRefreshVersion++;
		controllerState.treeRequestVersion++;
		controllerState.detailRequestVersion++;
		controllerState.workspaceAgentsRequestVersion++;
		controllerState.previewRequestVersion++;
		controllerState.diffRequestVersion++;
		if (id !== "workspace") {
			resetResourceLogState(id);
			delete controllerState.details[id];
		}
	}
	if (selectionChanged) {
		if (controllerState.selfDrivingDialog.open && !controllerState.selfDrivingDialog.submitting) closeSelfDrivingConfigDialog();
		controllerState.workspaceAgentsSaving = false;
		flushAgentDraft();
		discardAgentUploadDialog();
		controllerState.preview = null;
		controllerState.diff = null;
		closeAgentStream();
		controllerState.agent.runs = [];
		controllerState.agent.activeRunId = "";
		controllerState.agent.events = [];
		controllerState.agent.notices = [];
		controllerState.agent.historyBeforeId = 0;
		clearAgentDraftMemory();
	}
	controllerState.selectedId = id;
	controllerState.sessionMenu = null;
	setMobileSidebar(false);
	ensureSelectedProjectExpanded(false);
	syncURL();
	saveUIState().catch((err) => console.warn("failed to save UI state", err));
	renderSelectionPanels();
	await Promise.all([id === "workspace" ? loadWorkspaceAgents({ force: Boolean(options.forceDetail) }) : loadDetail(id, { force: forceDetail }), selectionChanged ? loadAgentRuns() : Promise.resolve()]);
	if (!isCurrentWorkspaceView(controllerState.activeWorkspaceId, controllerState.navigationVersion)) return;
	renderSelectionPanels();
}
async function toggleProject(id) {
	if (controllerState.expandedProjects.has(id)) controllerState.expandedProjects.delete(id);
	else controllerState.expandedProjects.add(id);
	renderAppShell();
	try {
		await saveUIState();
	} catch (err) {
		if (controllerState.expandedProjects.has(id)) controllerState.expandedProjects.delete(id);
		else controllerState.expandedProjects.add(id);
		renderAppShell();
		throw err;
	}
}
function applyCustomOrder(items, orderedIds) {
	if (!Array.isArray(items)) return [];
	if (!Array.isArray(orderedIds) || orderedIds.length === 0) return items;
	const rank = /* @__PURE__ */ new Map();
	orderedIds.forEach((id, index) => {
		if (!rank.has(id)) rank.set(id, index);
	});
	return items.map((item, index) => ({
		item,
		index
	})).sort((a, b) => {
		const left = rank.has(a.item.id) ? rank.get(a.item.id) : rank.size + a.index;
		const right = rank.has(b.item.id) ? rank.get(b.item.id) : rank.size + b.index;
		if (left !== right) return left - right;
		return a.index - b.index;
	}).map((entry) => entry.item);
}
function moveIdInList(ids, dragId, targetId, after) {
	if (!Array.isArray(ids) || dragId === targetId) return ids;
	const next = ids.filter((id) => id !== dragId);
	let index = next.indexOf(targetId);
	if (index < 0) return ids;
	if (after) index += 1;
	next.splice(index, 0, dragId);
	return next;
}
function sortedSessionsForDisplay(sessions) {
	return sessions.map((session, index) => ({
		session,
		index
	})).sort((a, b) => {
		const left = Date.parse(a.session.startedAt || "");
		const right = Date.parse(b.session.startedAt || "");
		const leftOK = Number.isFinite(left);
		const rightOK = Number.isFinite(right);
		if (leftOK && rightOK && left !== right) return left - right;
		if (leftOK !== rightOK) return leftOK ? -1 : 1;
		if (a.session.id !== b.session.id) return a.session.id < b.session.id ? -1 : 1;
		return a.index - b.index;
	}).map((entry) => entry.session);
}
function renderSessions() {
	renderAppShell();
}
function sessionDisplayTitle(session, resourceId) {
	const displayResourceId = (resourceId && typeof resourceId === "object" ? resourceId : arguments.length > 1 ? { displayResourceId: resourceId || "" } : sessionNavigationTarget(session)).displayResourceId || "";
	const resourceTitle = findResource(displayResourceId)?.title || "";
	if (session.source === "internal") return session.agentRunTitle || resourceTitle || displayResourceId || session.id;
	return resourceTitle || displayResourceId || session.id;
}
function sessionControls(session) {
	const controls = (session?.controls || []).map((control) => ({
		resourceId: String(control?.resourceId || "").trim(),
		path: String(control?.path || "")
	})).filter((control) => control.resourceId);
	if (controls.length === 0) {
		const resourceId = String(session?.resourceId || "").trim();
		if (resourceId) return [{
			resourceId,
			path: ""
		}];
	}
	return controls;
}
function sessionNavigableResourceId(resourceId) {
	const value = String(resourceId || "").trim();
	if (!value) return "";
	const resource = findResource(value);
	return resource && resource.archived !== true ? value : "";
}
function sessionNavigationTarget(session) {
	const controls = sessionControls(session);
	const runResourceId = String(session?.resourceId || "").trim();
	if (session?.source === "internal" && runResourceId) return {
		kind: "run",
		primaryResourceId: runResourceId,
		displayResourceId: runResourceId,
		navigationResourceId: sessionNavigableResourceId(runResourceId),
		selectedResourceIds: [runResourceId],
		controls,
		menu: false
	};
	if (controls.length === 1) {
		const resourceId = controls[0].resourceId;
		return {
			kind: "single-control",
			primaryResourceId: resourceId,
			displayResourceId: resourceId,
			navigationResourceId: sessionNavigableResourceId(resourceId),
			selectedResourceIds: [resourceId],
			controls,
			menu: false
		};
	}
	return {
		kind: controls.length > 1 ? "controls" : "none",
		primaryResourceId: "",
		displayResourceId: controls[0]?.resourceId || "",
		navigationResourceId: "",
		selectedResourceIds: controls.map((control) => control.resourceId),
		controls,
		menu: controls.length > 1
	};
}
function sessionTaskResource(session) {
	if (!session || session.source !== "internal") return null;
	const explicitResourceId = String(session.resourceId || "").trim();
	if (explicitResourceId) return taskResourceForSelfDriving(explicitResourceId);
	const controls = sessionControls(session);
	if (controls.length !== 1) return null;
	return taskResourceForSelfDriving(controls[0].resourceId);
}
function taskResourceForSelfDriving(resourceId) {
	const resource = findResource(resourceId);
	return resource && resource.type === "task" && !resource.archived ? resource : null;
}
function sessionOperationalLabel(session, taskResource, taskState, sessionStatus) {
	const parts: string[] = [];
	if (taskResource?.selfDriving && taskState?.selfDriving) {
		const stateLabel = `Self-Driving ${taskResource.selfDriving.condition || "unknown"}`;
		const revision = Number.isFinite(taskResource.selfDriving.revision) ? taskResource.selfDriving.revision : "unknown";
		parts.push(`${stateLabel}, revision ${revision}`);
	}
	if (sessionStatus) parts.push(sessionStatus.label);
	if (parts.length > 0) return parts.join(" · ");
	return session?.source === "external" ? "External session active" : "Session active";
}
function detailPanelModel(): DetailPanelModel {
	const workspaceId = controllerState.activeWorkspaceId || "";
	const base = {
		identity: workspaceId ? `${workspaceId}:${controllerState.selectedId || "workspace"}` : "empty",
		workspaceId,
		workspaceName: workspaceName(),
		resourceId: controllerState.selectedId || "",
		resourceType: "",
		resourceTitle: "",
		parent: null,
		loading: false,
		detail: null,
		wiki: controllerState.tree?.wiki || null,
		workspaceAgents: controllerState.workspaceAgents,
		logs: {
			hasMore: false,
			loading: false,
			error: ""
		},
		onNavigate: (resourceId) => openBreadcrumbResource(resourceId).catch((err) => toast(err.message)),
		onCreateTask: (projectId) => showTaskForm(projectId),
		onArchive: (resourceId) => archiveResource(resourceId).catch((err) => toast(err.message)),
		onLoadMoreLogs: (resourceId) => loadMoreLogs(resourceId),
		onSaveWorkspaceAgents: (content, expectedContentHash) => saveWorkspaceAgentsFromDetail(content, expectedContentHash),
		onToast: toast,
		onIconsChanged: refreshIcons
	};
	if (!controllerState.tree) return base as DetailPanelModel;
	if (controllerState.selectedId === "workspace") return {
		...base,
		resourceId: "workspace",
		resourceType: "workspace",
		resourceTitle: workspaceName()
		} as unknown as DetailPanelModel;
	const selected = findResource(controllerState.selectedId) || controllerState.tree.projects[0];
	if (!selected) return {
		...base,
		resourceId: "workspace",
		resourceType: "workspace",
		resourceTitle: workspaceName()
	} as DetailPanelModel;
	const detail = controllerState.details[selected.id] || null;
	const parent = parentProject(selected.id);
	const page = controllerState.resourceLogPages?.[selected.id] || {};
	return {
		...base,
		identity: `${workspaceId}:${selected.id}:${selected.type}`,
		resourceId: selected.id,
		resourceType: selected.type === "project" || selected.type === "task" ? selected.type : "",
		resourceTitle: detail?.title || selected.title || selected.id,
		parent: parent && parent.id !== selected.id ? {
			id: parent.id,
			title: parent.title || parent.id
		} : null,
		loading: !detail,
		detail,
		logs: {
			hasMore: Boolean(page.hasMore ?? detail?.logPage?.hasMore),
			loading: Boolean(page.loading),
			error: String(page.error || "")
		}
	} as unknown as DetailPanelModel;
}
function renderDetails() {
	publisher.renderDetailPanel(detailPanelModel());
}
async function openBreadcrumbResource(id) {
	await selectResource(id, { forceDetail: id === controllerState.selectedId && id !== "workspace" });
}
function stripForgeManagedBlocks(content) {
	const startMarker = "<!-- managed by forge cli -->";
	const endMarker = "<!-- end of forge cli prompt -->";
	let result = "";
	let cursor = 0;
	while (cursor < content.length) {
		const start = content.indexOf(startMarker, cursor);
		if (start < 0) {
			result += content.slice(cursor);
			break;
		}
		const end = content.indexOf(endMarker, start + 29);
		if (end < 0) {
			result += content.slice(cursor);
			break;
		}
		result += content.slice(cursor, start);
		cursor = end + 32;
	}
	return result;
}
function workspaceAgentsUserContent(content) {
	return stripForgeManagedBlocks(content || "").trim();
}
function resetWorkspaceAgentsDraft() {
	controllerState.workspaceAgentsDraft = "";
	controllerState.workspaceAgentsDirty = false;
}
async function refreshFilePreview(section, path, options: FilePreviewOptions = {}) {
	const workspaceId = options.workspaceId || controllerState.activeWorkspaceId;
	const requestVersion = options.requestVersion || ++controllerState.previewRequestVersion;
	try {
		const preview = await api(filePreviewURL(section, path, workspaceId));
		if (workspaceId !== controllerState.activeWorkspaceId || requestVersion !== controllerState.previewRequestVersion || controllerState.preview?.section !== section || controllerState.preview?.path !== path) return null;
		controllerState.preview = {
			section,
			...preview
		};
		return controllerState.preview;
	} catch (err) {
		const current = workspaceId === controllerState.activeWorkspaceId && requestVersion === controllerState.previewRequestVersion && controllerState.preview?.section === section && controllerState.preview?.path === path;
		if (current) controllerState.preview = {
			section,
			path,
			error: errorMessage(err)
		} as unknown as DomainRecord;
		if (options.rethrow && current) throw err;
		return null;
	}
}
async function saveWorkspaceAgentsFromDetail(content, expectedContentHash) {
	if (!controllerState.activeWorkspaceId) throw new Error("No workspace is selected.");
	const workspaceId = controllerState.activeWorkspaceId;
	const navigationVersion = controllerState.navigationVersion;
	const saved = await api(`/api/workspaces/${workspaceId}/files?path=${encodeURIComponent("AGENTS.md")}`, {
		method: "PUT",
		body: JSON.stringify({
			content,
			expectedContentHash
		})
	});
	if (!isCurrentWorkspaceView(workspaceId, navigationVersion) || controllerState.selectedId !== "workspace") throw new Error("The workspace changed before AGENTS.md finished saving.");
	controllerState.workspaceAgents = saved;
	controllerState.workspaceAgentsDraft = workspaceAgentsUserContent(saved.content || "");
	controllerState.workspaceAgentsDirty = false;
	return saved;
}
function closePreview() {
	controllerState.previewRequestVersion++;
	controllerState.preview = null;
	publishViewModels();
}
function closeDiff() {
	controllerState.diffRequestVersion++;
	controllerState.diff = null;
	publishViewModels();
}
function filePreviewURL(section, path, workspaceId = controllerState.activeWorkspaceId) {
	return `/api/workspaces/${workspaceId}/${section === "Wiki" ? "wiki/files" : "files"}?path=${encodeURIComponent(path)}`;
}
function isSelfDrivingWaitingFinishNotice(notice) {
	const data = notice?.data;
	return data?.method === "forge/self-driving/finish" && data?.kind === SELF_DRIVING_FINISH_NOTICE_KIND && data?.lifecycle === SELF_DRIVING_FINISH_NOTICE_WAITING_LIFECYCLE && data?.level !== "error" && String(data.runId || "").trim() !== "" && String(data.resourceId || "").trim() !== "" && Number(data.selfDrivingRevision) > 0;
}
function selfDrivingWaitingNoticeSequence(notice) {
	return Number(notice?.data?.schedulerTurnSequence) || 0;
}
function selfDrivingProjectionForRun(run) {
	const resourceId = String(run?.resourceId || "").trim();
	if (!resourceId) return null;
	const candidates = [controllerState.details?.[resourceId], findResource(resourceId)].map((resource) => resource?.selfDriving).filter((selfDriving): selfDriving is DomainRecord => Boolean(selfDriving)).map((selfDriving) => ({
		revision: Number(selfDriving.revision) || 0,
		state: String(selfDriving.condition || "").trim().toLowerCase()
	}));
	if (!candidates.length) return null;
	const statePriority = (stateName) => SELF_DRIVING_RESUMABLE_STATES.has(stateName) ? 0 : 1;
	candidates.sort((left, right) => right.revision - left.revision || statePriority(right.state) - statePriority(left.state));
	return candidates[0];
}
function currentSelfDrivingWaitingNotice(notice, runs = controllerState.agent.runs) {
	if (!isSelfDrivingWaitingFinishNotice(notice)) return true;
	const data = notice.data;
	if (!controllerState.agent.activeRunId || String(data.runId).trim() !== controllerState.agent.activeRunId) return false;
	const run = (runs || []).find((candidate) => candidate.id === controllerState.agent.activeRunId);
	if (!run || String(run.resourceId || "").trim() !== String(data.resourceId).trim() || Number(run.selfDrivingRevision) !== Number(data.selfDrivingRevision)) return false;
	const noticeSequence = selfDrivingWaitingNoticeSequence(notice);
	const runSequence = Number(run.schedulerTurnSequence) || 0;
	if (runSequence > noticeSequence && runSequence > 0) return false;
	if (runSequence === noticeSequence && run.schedulerTurnId && data.schedulerTurnId && run.schedulerTurnId !== data.schedulerTurnId) return false;
	if (run.schedulerTurn && (runSequence === 0 || runSequence >= noticeSequence)) return false;
	const projection = selfDrivingProjectionForRun(run);
	if (!projection) return true;
	if (projection.revision !== Number(data.selfDrivingRevision)) return false;
	return SELF_DRIVING_RESUMABLE_STATES.has(projection.state);
}
function reconcileAgentNotices(runs = controllerState.agent.runs) {
	const before = controllerState.agent.notices.length;
	controllerState.agent.notices = controllerState.agent.notices.filter((notice) => currentSelfDrivingWaitingNotice(notice, runs));
	return controllerState.agent.notices.length !== before;
}
async function loadAgentRuns() {
	if (!controllerState.activeWorkspaceId) {
		resetAgentState();
		return;
	}
	controllerState.agentRunProjectionVersion = (Number(controllerState.agentRunProjectionVersion) || 0) + 1;
	const projectionVersion = controllerState.agentRunProjectionVersion;
	const runs = await fetchAgentRuns();
	if (projectionVersion !== controllerState.agentRunProjectionVersion || !controllerState.activeWorkspaceId) return false;
	controllerState.agent.runs = runs;
	observeCompletionProjections(controllerState.agent.runs);
	reconcileActiveAgentRun(controllerState.agent.runs);
	if (typeof reconcileAgentNotices === "function") reconcileAgentNotices(controllerState.agent.runs);
	if (!controllerState.agent.activeRunId) controllerState.agent.historyBeforeId = 0;
	if (projectionVersion !== controllerState.agentRunProjectionVersion) return false;
	if (typeof reconcileAgentNotices === "function") reconcileAgentNotices(controllerState.agent.runs);
	return true;
}
async function refreshAgentRunMetadata(options: AgentMetadataOptions = {}) {
	if (!controllerState.activeWorkspaceId) return;
	controllerState.agentRunProjectionVersion = (Number(controllerState.agentRunProjectionVersion) || 0) + 1;
	const projectionVersion = controllerState.agentRunProjectionVersion;
	const workspaceId = controllerState.activeWorkspaceId;
	const runs = await fetchAgentRuns();
	if (projectionVersion !== controllerState.agentRunProjectionVersion || controllerState.activeWorkspaceId !== workspaceId) return false;
	controllerState.agent.runs = runs;
	observeCompletionProjections(runs);
	if (typeof reconcileAgentNotices === "function") reconcileAgentNotices(runs);
	if (reconcileActiveAgentRun(runs)) {
		if (projectionVersion !== controllerState.agentRunProjectionVersion || controllerState.activeWorkspaceId !== workspaceId) return false;
	}
	if (options.refreshSelfDrivingProjection && controllerState.agent.activeRunId) {
		const activeRun = currentAgentRun();
		const resourceId = String(activeRun?.resourceId || "").trim();
		const [tree, detail] = await Promise.all([fetchCurrentTree(workspaceId), resourceId ? fetchDetail(resourceId, workspaceId, { logsLimit: RESOURCE_LOG_INITIAL_LIMIT }) : Promise.resolve(null)]);
		if (projectionVersion !== controllerState.agentRunProjectionVersion || controllerState.activeWorkspaceId !== workspaceId) return false;
		if (tree) controllerState.tree = tree;
		if (detail && controllerState.activeWorkspaceId === workspaceId) applyResourceDetail(detail, "head");
	}
	if (typeof reconcileAgentNotices === "function") reconcileAgentNotices(controllerState.agent.runs);
	return true;
}
function reconcileActiveAgentRun(runs) {
	const nextRunId = preferredAgentRunID(runs);
	if (controllerState.agent.activeRunId === nextRunId) {
		const activeRun = runs.find((run) => run.id === nextRunId);
		if (activeRun) restoreAgentDraftForRun(activeRun);
		return false;
	}
	flushAgentDraft();
	controllerState.agent.activeRunId = nextRunId;
	controllerState.agent.events = [];
	controllerState.agent.notices = [];
	controllerState.agent.eventsHasMore = false;
	controllerState.agent.historyBeforeId = 0;
	clearAgentDraftMemory();
	const activeRun = runs.find((run) => run.id === nextRunId);
	if (activeRun) restoreAgentDraftForRun(activeRun);
	controllerState.agent.approvalDrafts.clear();
	return true;
}
function preferredAgentRunID(runs) {
	const selfDriving = runs.find((run) => run.schedulerTurn && isLiveAgentRun(run));
	if (selfDriving) return selfDriving.id;
	if (runs.some((run) => run.id === controllerState.agent.activeRunId)) return controllerState.agent.activeRunId;
	return runs[0]?.id || "";
}
async function fetchCurrentTree(workspaceId = controllerState.activeWorkspaceId) {
	const requestVersion = ++controllerState.treeRequestVersion;
	const navigationVersion = controllerState.navigationVersion;
	const tree = await api(`/api/workspaces/${workspaceId}/tree`);
	return isCurrentWorkspaceView(workspaceId, navigationVersion, requestVersion) ? tree : null;
}
async function refreshTreeAfterAgentSessionMutation() {
	if (!controllerState.activeWorkspaceId || !controllerState.tree) return;
	const tree = await fetchCurrentTree(controllerState.activeWorkspaceId);
	if (tree) controllerState.tree = tree;
}
async function refreshAgentInputProjection(workspaceId, resourceId) {
	if (!workspaceId || controllerState.activeWorkspaceId !== workspaceId) return;
	await Promise.all([
		loadAgentRuns(),
		refreshTreeAfterAgentSessionMutation(),
		resourceId && resourceId !== "workspace" ? fetchDetail(resourceId, workspaceId, { logsLimit: RESOURCE_LOG_INITIAL_LIMIT }).then((detail) => {
			if (controllerState.activeWorkspaceId === workspaceId && detail) applyResourceDetail(detail, "head");
		}) : Promise.resolve()
	]);
	if (controllerState.activeWorkspaceId === workspaceId) {
		if (typeof reconcileAgentNotices === "function") reconcileAgentNotices(controllerState.agent.runs);
		publishViewModels();
	}
}
async function mutateAgentSession(action) {
	controllerState.agentSessionMutationCount++;
	controllerState.autoRefreshVersion++;
	controllerState.treeRequestVersion++;
	try {
		return await action();
	} finally {
		controllerState.agentSessionMutationCount--;
	}
}
function fetchAgentRuns() {
	const resourceId = selectedAgentResourceId();
	const query = resourceId ? `?resourceId=${encodeURIComponent(resourceId)}` : "";
	return api(`/api/workspaces/${controllerState.activeWorkspaceId}/agent/runs${query}`).then((body) => body.runs || []);
}
async function reloadAgentRunsForSelection() {
	flushAgentDraft();
	closeAgentStream();
	agentOperations.reset();
	controllerState.agent.activeRunId = "";
	controllerState.agent.events = [];
	controllerState.agent.notices = [];
	controllerState.agent.historyBeforeId = 0;
	clearAgentDraftMemory();
	await loadAgentRuns();
}
function resetAgentState() {
	if (controllerState.selfDrivingDialog.open && !controllerState.selfDrivingDialog.submitting) closeSelfDrivingConfigDialog();
	flushAgentDraft();
	discardAgentUploadDialog();
	closeAgentStream();
	controllerState.agent.runs = [];
	controllerState.agentRunProjectionVersion = (Number(controllerState.agentRunProjectionVersion) || 0) + 1;
	controllerState.agent.activeRunId = "";
	controllerState.agent.events = [];
	controllerState.agent.notices = [];
	controllerState.agent.eventsHasMore = false;
	controllerState.agent.historyBeforeId = 0;
	controllerState.agent.loadingOlder = false;
	controllerState.agent.optionsOpen = false;
	controllerState.agent.agentChooserOpen = false;
	controllerState.agent.historyOpen = false;
	clearAgentDraftMemory();
	agentOperations.reset();
	controllerState.agent.toolGroupOpen.clear();
	controllerState.agent.approvalDrafts.clear();
	if (controllerState.agent.selfDrivingFinishNoticeWatermarks instanceof Map) controllerState.agent.selfDrivingFinishNoticeWatermarks.clear();
	controllerState.agent.renderDeferredForSelection = false;
	clearAgentRenderTimer();
}
function closeAgentStream() {
	if (controllerState.agent.stream) controllerState.agent.stream.close();
	controllerState.agent.stream = null;
	controllerState.agent.streamRunId = "";
}
function handleSvelteAgentEvent(workspaceId, runId, event) {
	if (workspaceId !== controllerState.activeWorkspaceId || runId !== controllerState.agent.activeRunId || !event) return;
	const run = controllerState.agent.runs.find((candidate) => candidate.id === runId) || null;
	if ([
		"turn.completed",
		"turn.failed",
		"turn.cancelled"
	].includes(event.type)) observeCompletionEvent(event, run);
	if ([
		"turn.completed",
		"turn.failed",
		"turn.cancelled",
		"session.state",
		"approval.requested",
		"approval.resolved"
	].includes(event.type)) refreshAgentRunMetadata({ refreshSelfDrivingProjection: [
		"turn.completed",
		"turn.failed",
		"turn.cancelled",
		"session.state"
	].includes(event.type) }).then(publishViewModels).catch((err) => console.warn("agent refresh failed", err));
}
function handleSvelteForgeNotice(workspaceId, runId, notice) {
	if (workspaceId !== controllerState.activeWorkspaceId || runId !== controllerState.agent.activeRunId) return;
	if (notice?.data?.kind === SELF_DRIVING_FINISH_NOTICE_KIND) refreshAgentRunMetadata({ refreshSelfDrivingProjection: true }).then(publishViewModels).catch((err) => console.warn("Self-Driving notice projection refresh failed", err));
}
function clearAgentRenderTimer() {
	if (controllerState.agent.renderTimer) window.clearTimeout(controllerState.agent.renderTimer);
	controllerState.agent.renderTimer = null;
}
function projectAgentEvents(events) {
	if (!window.AgentHubEventTimeline?.buildTimeline) throw new Error("AgentHub Event Timeline library is unavailable");
	const visibleEvents = (events || []).filter((event) => !AGENT_HIDDEN_EVENT_TYPES.has(event?.type));
	return window.AgentHubEventTimeline.buildTimeline(visibleEvents) as TimelineItem[];
}
function renderAgent() {
	if (typeof reconcileAgentNotices === "function") reconcileAgentNotices(controllerState.agent.runs);
	const activeRun = currentAgentRun();
	const detail = controllerState.details[controllerState.selectedId];
	publisher.renderSelfDrivingBar(selfDrivingBarModel(detail));
	publisher.renderSessionSwitcher({
		identity: `${controllerState.activeWorkspaceId}:${selectedAgentResourceId()}`,
		workspaceId: controllerState.activeWorkspaceId,
		resourceId: selectedAgentResourceId(),
		activeRunId: activeRun?.id || "",
		runs: controllerState.agent.runs,
		switchingRunId: agentOperations.key("session-switch"),
		onSelect: switchAgentRun,
		onToast: toast,
		onIconsChanged: refreshIcons
	});
}
function selfDrivingBarModel(detail) {
	const selected = findResource(controllerState.selectedId);
	if (!selected || selected.type !== "task" || !detail) return {
		identity: `${controllerState.activeWorkspaceId}:${controllerState.selectedId}:hidden`,
		visible: false,
		status: selfDrivingPresentation("disabled", false),
		summary: "",
		expanded: false,
		hasProjection: false,
		revision: 0,
		enabled: false,
		preferredProfiles: [],
		actualAgent: "",
		actualReason: "",
		waitingSummary: "",
		wakeCondition: "",
		wakeFallback: false,
		lastOutcome: null,
		statusReason: null,
		pending: false,
		onToggleEnabled: () => {},
		onToggleDetails: () => {},
		onIconsChanged: refreshIcons
	};
	const run = detail.selfDriving || null;
	const actual = currentAgentRun();
	const actualAgent = actual?.schedulerTurn && actual.resourceId === detail.id ? `${actual.agentProfile ? `${actual.agentProfile} → ` : ""}${actual.agentHubAgentName || ""}` : "";
	return {
		identity: `${controllerState.activeWorkspaceId}:${selected.id}:${Number(run?.revision) || 0}`,
		visible: true,
		status: selfDrivingPresentation(run?.condition || "disabled", Boolean(run?.enabled)),
		summary: selfDrivingBarSummary(run, detail),
		expanded: Boolean(run && controllerState.agent.selfDrivingExpanded),
		hasProjection: Boolean(run),
		revision: Number(run?.revision) || 0,
		enabled: Boolean(run?.enabled),
		preferredProfiles: run?.preferredAgentProfiles || [],
		actualAgent,
		actualReason: actualAgent ? String(actual?.agentSelectionReason || "") : "",
		waitingSummary: String(run?.wakeContext?.summary || ""),
		wakeCondition: String(run?.wakeContext?.condition || ""),
		wakeFallback: Boolean(run?.wakeContext?.fallback),
		lastOutcome: run?.lastOutcome ? {
			status: String(run.lastOutcome.status || ""),
			reason: String(run.lastOutcome.reason || "")
		} : null,
		statusReason: selfDrivingStatusReason(run, detail?.logs),
		pending: agentOperations.active("self-driving-save") || agentOperations.active("self-driving-disable"),
		onToggleEnabled: () => {
			if (agentOperations.active("self-driving-save") || agentOperations.active("self-driving-disable")) return;
			if (run?.enabled) disableSelectedSelfDriving().catch((err) => toast(err.message));
			else if (selfDrivingNeedsConfiguration(detail)) openSelfDrivingConfigDialog();
			else setChatSelfDrivingDesiredState({ enabled: true }).catch((err) => toast(err.message));
		},
		onToggleDetails: () => {
			controllerState.agent.selfDrivingExpanded = !controllerState.agent.selfDrivingExpanded;
			renderAgent();
		},
		onIconsChanged: refreshIcons
	};
}
function selfDrivingStatusReason(run, logs = []) {
	if (!run) return null;
	const text = String(run.conditionReason || run.notificationError?.message || "").trim();
	return text ? {
		label: "Status",
		text
	} : null;
}
function selfDrivingBarSummary(run, detail) {
	if (!run) return "Self-Driving is off.";
	const reason = selfDrivingStatusReason(run, detail?.logs);
	if (reason) return `${reason.label}: ${reason.text}`;
	if (run.wakeContext?.condition) return `Wake condition: ${run.wakeContext.condition}`;
	const actual = currentAgentRun();
	if (actual?.schedulerTurn && actual.resourceId === detail.id) {
		const selection = `${actual.agentProfile ? `${actual.agentProfile} → ` : ""}${actual.agentHubAgentName || ""}`.trim();
		if (selection) return `Agent: ${selection}`;
	}
	return `Revision ${Number(run.revision) || 0}`;
}
function selfDrivingPresentation(condition, enabled = false) {
	const presentations = {
		disabled: {
			label: "Off",
			icon: "circle-dashed"
		},
		ready: {
			label: "Ready",
			icon: "list-start"
		},
		waiting: {
			label: "Waiting",
			icon: "pause"
		},
		blocked: {
			label: "Blocked",
			icon: "octagon-alert"
		},
		error: {
			label: "Error",
			icon: "circle-x"
		},
		needs_configuration: {
			label: "Needs configuration",
			icon: "settings"
		}
	};
	const stateName = enabled ? String(condition || "ready").trim().toLowerCase() : "disabled";
	const key = Object.hasOwn(presentations, stateName) ? stateName : "unknown";
	return {
		key,
		...presentations[key] || {
			label: stateName || "Unknown",
			icon: "circle-help"
		}
	};
}
function agentConfigSummary(agent) {
	if (!agent) return "";
	const parts = [providerName(agent.providerId)];
	if (agent.options?.model) parts.push(agent.options.model);
	return parts.filter(Boolean).join(" · ");
}
function providerName(providerId) {
	return (controllerState.config?.agentHubProviders || settingsController.providers()).find((item) => item.id === providerId)?.name || providerId || "Provider";
}
function ttyLogHasActiveSelection(log) {
	const selection = window.getSelection?.();
	if (!selection || selection.isCollapsed || selection.rangeCount === 0) return false;
	return selection.getRangeAt(0).intersectsNode(log);
}
function renderTTY(options: RenderOptions = {}) {
	renderTTYComposer();
	const run = currentAgentRun();
	const configured = (controllerState.config?.agents || []).find((agent) => agent.id === run?.agentHubAgentName);
	publisher.renderEventTimeline({
		identity: `${controllerState.activeWorkspaceId}:${run?.id || ""}`,
		workspaceId: controllerState.activeWorkspaceId,
		activeRunId: run?.id || "",
		activeRun: run,
		runCount: controllerState.agent.runs.length,
		agentName: agentDisplayName(configured || selectedAgentConfig()),
		project: projectAgentEvents,
		onEvent: handleSvelteAgentEvent,
		onNotice: handleSvelteForgeNotice,
		onApproval: resolveAgentApprovalForRun,
		onToast: toast,
		onIconsChanged: refreshIcons
	});
}
function agentSessionMutationKey(workspaceId, runId) {
	return `${workspaceId || "workspace"}:${runId || "run"}`;
}
function renderTTYComposer(options: RenderOptions = {}) {
	controllerState.agent.skipTTYDraftSync = false;
	closeNewSessionChooserForResourceLock();
	const activeRun = currentAgentRun();
	if (activeRun) restoreAgentDraftForRun(activeRun);
	const live = isLiveAgentRun(activeRun);
	const resourceId = activeRun?.resourceId || selectedAgentResourceId();
	const stopTurnPending = isAgentTurnStopping(activeRun);
	const sessionStopping = isAgentSessionStopping(activeRun) || activeRun?.status === "stopping";
	publisher.renderComposer({
		identity: `${controllerState.activeWorkspaceId}:${resourceId}:${activeRun?.id || "none"}:${controllerState.agent.ttyDraftKey || ""}`,
		workspaceId: controllerState.activeWorkspaceId,
		resourceId,
		runId: activeRun?.id || "",
		runStatus: activeRun?.status || "",
		live,
		canResume: Boolean(activeRun && !live && (activeRun.agentHubSessionId || activeRun.sourceExternalId)),
		draft: controllerState.agent.ttyDraft || "",
		draftKey: controllerState.agent.ttyDraftKey || "",
		draftResetVersion: controllerState.agent.ttyDraftResetVersion || 0,
		unavailableReason: live ? agentInputUnavailableReason(activeRun, isAgentSessionReady(activeRun)) : "",
		sending: Boolean(activeRun && agentOperations.isSending(agentSessionMutationKey(controllerState.activeWorkspaceId, activeRun.id))),
		externalLocked: selectedResourceHasExternalLock(),
		internalLocked: selectedResourceHasInternalLock(),
		agents: svelteAgentOptions(),
		selectedAgentId: selectedAgentConfig()?.id || "",
		chooserOpen: Boolean(controllerState.agent.agentChooserOpen),
		sessionStarting: agentOperations.active("session-start"),
		actionsOpen: Boolean(controllerState.agent.sessionActionsOpen),
		canEndTurn: Boolean(activeRun && (isAgentTurnInterruptible(activeRun) || stopTurnPending)),
		endingTurn: stopTurnPending,
		closingSession: sessionStopping,
		selfDrivingRemainsEnabled: isSelfDrivingSessionCloseTarget(activeRun),
		selfDrivingDisabling: agentOperations.active("self-driving-disable"),
		onDraft: (text, draftContext) => updateAgentDraftFromSvelte(text, draftContext),
		onSend: submitTTYInput,
		onOpenUpload: openAgentUploadDialog,
		onToggleChooser: () => {
			if (agentOperations.active("session-start") || !enabledAgentConfigs().length || selectedResourceHasExternalLock()) return;
			controllerState.agent.agentChooserOpen = !controllerState.agent.agentChooserOpen;
			renderTTYComposer();
		},
		onChooseAgent: (id) => startAgentRun(id).catch((err) => toast(err.message)),
		onToggleActions: () => {
			controllerState.agent.sessionActionsOpen = !controllerState.agent.sessionActionsOpen;
			renderTTYComposer();
		},
		onResume: () => resumeAgentRun().catch((err) => toast(err.message)),
		onEndTurn: () => stopAgentTurn().catch((err) => toast(err.message)),
		onCloseSession: closeCurrentAgentSession,
		onIconsChanged: refreshIcons
	});
}
function isAgentSessionReady(run) {
	if (!isLiveAgentRun(run)) return false;
	if (run.status !== "starting") return true;
	if (controllerState.agent.events.some((event) => event.type === "session.state" && event.data?.state === "ready")) return true;
	return controllerState.agent.eventsHasMore && run.status !== "starting";
}
function agentInputUnavailableReason(run, sessionReady = isAgentSessionReady(run)) {
	if (selectedResourceHasExternalLock()) return EXTERNAL_RESOURCE_LOCK_MESSAGE;
	if (isAgentTurnStopping(run)) return "Ending the current turn.";
	if (!sessionReady) return "Agent session is starting.";
	if (run.status === "stopping") return "AgentHub is stopping the provider.";
	if (run.status === "recovering") return "AgentHub event recovery is in progress.";
	if (run.status === "waiting_approval") return "Resolve the pending approval before sending input.";
	return "";
}
function agentDisplayName(agent) {
	return agent?.name || agent?.id || "Agent";
}
function selfDrivingNeedsConfiguration(detail) {
	return !detail?.selfDriving?.agentName && !(detail?.selfDriving?.preferredAgentProfiles || []).length;
}
async function setChatSelfDrivingDesiredState(options: SelfDrivingOptions = {}) {
	return agentSessionController.setSelfDriving(options);
}
function selfDrivingDialogInitialState() {
	return {
		open: false,
		identity: ++selfDrivingDialogIdentity,
		mode: "",
		resourceId: "",
		reuseRunId: "",
		reuseCurrentSession: false,
		agentName: "",
		expectedRevision: 0,
		expectedCondition: "",
		runInstructions: "",
		completionCriteria: "",
		submitting: false,
		error: "",
		unknown: false,
		returnFocus: null
	};
}
function selfDrivingIdleSessionForResource(resourceId) {
	return controllerState.agent.runs.find((run) => run.resourceId === resourceId && isLiveAgentRun(run) && run.status === "idle" && !run.schedulerTurn && String(run.agentHubSessionId || "").trim()) || null;
}
function openSelfDrivingConfigDialog() {
	const selected = findResource(controllerState.selectedId);
	const detail = selected ? controllerState.details[selected.id] || selected : null;
	if (!selected || !detail || detail.type !== "task") {
		toast("Select a task first.");
		return;
	}
	const reuseRun = selfDrivingIdleSessionForResource(selected.id);
	const selfDriving = detail.selfDriving || null;
	const agents = enabledAgentConfigs();
	const savedAgentName = String(selfDriving?.agentName || "").trim();
	const savedAgent = agents.find((agent) => String(agent.id || "").trim().toLowerCase() === savedAgentName.toLowerCase());
	const selectedAgent = selectedAgentConfig();
	const mode = "configure";
	const agentName = String(reuseRun?.agentHubAgentName || savedAgent?.id || selectedAgent?.id || "").trim();
	controllerState.modalEnter = "selfDriving";
	controllerState.selfDrivingDialog = {
		open: true,
		identity: ++selfDrivingDialogIdentity,
		mode,
		resourceId: selected.id,
		reuseRunId: reuseRun?.id || "",
		reuseCurrentSession: Boolean(reuseRun),
		agentName,
		expectedRevision: Number(selfDriving?.revision) || 0,
		expectedCondition: String(selfDriving?.condition || "").trim().toLowerCase(),
		runInstructions: String(selfDriving?.prompt || ""),
		completionCriteria: String(selfDriving?.completionCriteria || ""),
		submitting: false,
		error: agents.length === 0 ? "No enabled AgentHub agents are available. Self-Driving can still be enabled and will report Needs configuration." : "",
		unknown: false,
		returnFocus: document.activeElement instanceof HTMLElement ? document.activeElement : null
	};
	renderSelfDrivingConfigDialog();
}
function closeSelfDrivingConfigDialog() {
	const dialog = controllerState.selfDrivingDialog;
	if (!dialog.open || dialog.submitting) return;
	const returnFocus = dialog.returnFocus;
	controllerState.selfDrivingDialog = selfDrivingDialogInitialState();
	renderSelfDrivingConfigDialog();
	if (returnFocus && document.contains(returnFocus)) returnFocus.focus({ preventScroll: true });
}
function renderSelfDrivingConfigDialog() {
	const dialog = controllerState.selfDrivingDialog;
	publisher.renderSelfDrivingDialog({
		open: Boolean(dialog.open),
		identity: `${dialog.identity || 0}:${dialog.resourceId || ""}`,
		resourceId: dialog.resourceId || "",
		reuseCurrentSession: Boolean(dialog.reuseCurrentSession),
		agents: svelteAgentOptions(),
		draft: {
			agentName: dialog.agentName || "",
			runInstructions: dialog.runInstructions || ""
		},
		submitting: Boolean(dialog.submitting),
		error: dialog.error || "",
		unknown: Boolean(dialog.unknown),
		onClose: closeSelfDrivingConfigDialog,
		onSubmit: submitSelfDrivingConfigDialog,
		onIconsChanged: refreshIcons
	});
}
async function submitSelfDrivingConfigDialog(draft) {
	const dialog = controllerState.selfDrivingDialog;
	if (!dialog.open || dialog.submitting || dialog.unknown) return;
	dialog.agentName = String(draft?.agentName || dialog.agentName || "").trim();
	dialog.runInstructions = String(draft?.runInstructions || "");
	if (!dialog.reuseCurrentSession && !dialog.agentName) {
		dialog.error = "Select an Agent before enabling Self-Driving.";
		renderSelfDrivingConfigDialog();
		return;
	}
	dialog.submitting = true;
	dialog.error = "";
	const dialogIdentity = dialog.identity;
	const workspaceId = controllerState.activeWorkspaceId;
	const resourceId = dialog.resourceId;
	renderSelfDrivingConfigDialog();
	try {
		await setChatSelfDrivingDesiredState({
			configured: true,
			agentName: dialog.agentName,
			runInstructions: dialog.runInstructions,
			completionCriteria: dialog.completionCriteria
		});
		if (dialogIdentity !== controllerState.selfDrivingDialog.identity || workspaceId !== controllerState.activeWorkspaceId || resourceId !== controllerState.selectedId) return;
		const returnFocus = dialog.returnFocus;
		controllerState.selfDrivingDialog = selfDrivingDialogInitialState();
		renderSelfDrivingConfigDialog();
		if (returnFocus && document.contains(returnFocus)) returnFocus.focus({ preventScroll: true });
	} catch (err) {
		if (dialogIdentity !== controllerState.selfDrivingDialog.identity) return;
		dialog.submitting = false;
		const apiError = err as { message?: unknown; status?: unknown } | null;
		const message = errorMessage(err, "Self-Driving could not be enabled.");
		dialog.error = message;
		dialog.unknown = !Number.isFinite(Number(apiError?.status)) || Number(apiError?.status) >= 500 || message.includes("outcome may be unknown") || message.includes("was updated but the start message failed");
		renderSelfDrivingConfigDialog();
	}
}
function renderSettingsModal() {
	settingsController.render();
}
function updateAgentDraftFromSvelte(text, context) {
	if (!context || context.workspaceId !== controllerState.activeWorkspaceId || context.runId !== controllerState.agent.activeRunId || context.draftKey !== controllerState.agent.ttyDraftKey) return;
	updateAgentDraft(text);
}
function closeCurrentAgentSession() {
	if (!isSelfDrivingSessionCloseTarget(currentAgentRun())) {
		stopAgentRun().catch((err) => toast(err.message));
		return;
	}
	if (window.confirm("Self-Driving is On. Close this Session while keeping Self-Driving On? The Scheduler may create a replacement Session.")) {
		stopAgentRun().catch((err) => toast(err.message));
		return;
	}
	if (window.confirm("Disable Self-Driving and close this Session instead?")) disableSelectedSelfDriving().then(() => stopAgentRun()).catch((err) => toast(err.message));
}
async function startAgentRun(agentName = "") {
	return agentSessionController.start(agentName);
}
function agentInputSelfDrivingProjection(run) {
	const selected = findResource(controllerState.selectedId);
	const detail = selected ? controllerState.details[selected.id] || selected : null;
	if (!selected || selected.type !== "task" || !run || run.resourceId !== selected.id) return null;
	const selfDriving = detail?.selfDriving || null;
	return {
		resourceId: selected.id,
		selfDrivingProjectionSet: true,
		expectedSelfDrivingRevision: Number(selfDriving?.revision) || 0,
		expectedSelfDrivingCondition: String(selfDriving?.condition || "").trim().toLowerCase()
	};
}
function openAgentUploadDialog() {
	const run = currentAgentRun();
	if (!run || !isLiveAgentRun(run)) {
		toast("Start or resume an agent session before uploading files.");
		return;
	}
	const input = elementById<HTMLInputElement>("ttyInput");
	if (input) updateAgentDraft(input.value);
	controllerState.modalEnter = "upload";
	controllerState.uploadDialog = {
		open: true,
		identity: ++uploadDialogIdentity,
		runId: run.id,
		items: [],
		nextId: 1
	};
	renderAgentUploadDialog();
}
function closeAgentUploadDialog(paths: string[] = [], context: UploadContext = {}) {
	if (!controllerState.uploadDialog.open) return;
	const sameContext = context.workspaceId === controllerState.activeWorkspaceId && context.runId === controllerState.agent.activeRunId;
	const shouldSkipDraftSync = paths.length > 0 && sameContext && controllerState.uploadDialog.runId === controllerState.agent.activeRunId;
	if (shouldSkipDraftSync) {
		updateAgentDraft(appendUploadedPaths(controllerState.agent.ttyDraft, paths));
		controllerState.agent.ttyDraftResetVersion++;
	}
	discardAgentUploadDialog();
	const composer = elementById("ttyComposer");
	if (composer) delete composer.dataset.composerKey;
	renderTTYComposer({ skipDraftSync: shouldSkipDraftSync });
	elementById("ttyInput")?.focus({ preventScroll: true });
	refreshIcons();
}
function discardAgentUploadDialog() {
	controllerState.uploadDialog = {
		open: false,
		identity: ++uploadDialogIdentity,
		runId: "",
		items: [],
		nextId: 1
	};
	renderAgentUploadDialog();
}
function appendUploadedPaths(draft, paths) {
	const block = paths.filter(Boolean).join("\n");
	if (!block) return draft;
	if (!draft) return block;
	return `${draft}${draft.endsWith("\n") ? "" : "\n"}${block}`;
}
function renderAgentUploadDialog() {
	const dialog = controllerState.uploadDialog;
	publisher.renderUploadDialog({
		open: Boolean(dialog.open),
		identity: `${dialog.identity || 0}:${controllerState.activeWorkspaceId}:${dialog.runId || ""}`,
		workspaceId: controllerState.activeWorkspaceId,
		runId: dialog.runId || "",
		onDone: closeAgentUploadDialog,
		onIconsChanged: refreshIcons
	});
}
async function stopAgentRun() {
	return agentSessionController.stopSession();
}
async function disableSelectedSelfDriving() {
	return agentSessionController.disableSelfDriving();
}
async function stopAgentTurn() {
	return agentSessionController.stopTurn();
}
async function switchAgentRun(runId) {
	return agentSessionController.switchRun(runId);
}
async function closeAgentRun(runId) {
	return agentSessionController.closeRun(runId);
}
async function resumeAgentRun() {
	return agentSessionController.resume();
}
async function resolveAgentApprovalForRun(runId, requestId, reply) {
	return agentSessionController.resolveApproval(runId, requestId, reply);
}
function currentAgentRun() {
	return controllerState.agent.runs.find((run) => run.id === controllerState.agent.activeRunId) || null;
}
function isLiveAgentRun(run) {
	return [
		"starting",
		"running",
		"waiting_approval",
		"idle",
		"stopping",
		"recovering"
	].includes(run?.status);
}
function isAgentTurnInterruptible(run) {
	return ["running", "waiting_approval"].includes(run?.status);
}
function isSelfDrivingSessionCloseTarget(run) {
	const resourceID = String(run?.resourceId || "").trim();
	if (!resourceID) return false;
	const selfDriving = findResource(resourceID)?.selfDriving;
	return Boolean(selfDriving?.enabled);
}
function isAgentTurnStopping(run) {
	return agentOperations.active("turn-stop") && agentOperations.key("turn-stop") === run?.id;
}
function isAgentSessionStopping(run) {
	return agentOperations.active("session-stop") && agentOperations.key("session-stop") === run?.id;
}
async function submitTTYInput(rawText, context) {
	return agentSessionController.send(rawText, context);
}
function agentDefaultCwd() {
	const selected = findResource(controllerState.selectedId);
	if (!selected) return "";
	return selected.path || "";
}
function selectedAgentResourceId() {
	if (controllerState.selectedId === "workspace") return "workspace";
	return findResource(controllerState.selectedId)?.id || "";
}
function relativeTime(value) {
	if (!value) return "unknown";
	const time = new Date(value).getTime();
	if (!Number.isFinite(time)) return value;
	const seconds = Math.max(0, Math.round((Date.now() - time) / 1e3));
	if (seconds < 60) return `${seconds}s ago`;
	const minutes = Math.round(seconds / 60);
	if (minutes < 60) return `${minutes}m ago`;
	const hours = Math.round(minutes / 60);
	if (hours < 24) return `${hours}h ago`;
	return `${Math.round(hours / 24)}d ago`;
}
function showProjectForm() {
	openCreateDialog("project");
}
function showTaskForm(projectId) {
	openCreateDialog("task", projectId);
}
function openCreateDialog(type, projectId = "") {
	createDialogController.open(type === "task" ? "task" : "project", projectId);
}
function closeCreateDialog() {
	createDialogController.close();
}
function renderCreateDialog() {
	createDialogController.render();
}
async function archiveResource(resourceId) {
	if (!confirm(`Archive ${resourceId}?`)) return;
	await api(`/api/workspaces/${controllerState.activeWorkspaceId}/archive`, {
		method: "POST",
		body: JSON.stringify({ resourceId })
	});
	toast("Archived.");
	controllerState.selectedId = "workspace";
	await loadTree();
}
function findResource(id) {
	if (!controllerState.tree) return null;
	for (const project of controllerState.tree.projects) {
		if (project.id === id) return project;
		for (const task of project.children || []) if (task.id === id) return task;
	}
	return null;
}
function ensureValidSelection() {
	if (controllerState.selectedId === "workspace" || findResource(controllerState.selectedId)) return false;
	controllerState.selectedId = "workspace";
	return true;
}
function parentProject(id) {
	if (!controllerState.tree) return null;
	for (const project of controllerState.tree.projects) {
		if (project.id === id) return project;
		if ((project.children || []).some((task) => task.id === id)) return project;
	}
	return null;
}
function isProjectExpanded(id) {
	return controllerState.expandedProjects.has(id);
}
function ensureSelectedProjectExpanded(persist = false) {
	const parent = parentProject(controllerState.selectedId);
	if (!parent || parent.id === controllerState.selectedId || controllerState.expandedProjects.has(parent.id)) return;
	controllerState.expandedProjects.add(parent.id);
	if (persist) saveUIState().catch((err) => toast(err.message));
}
function parseRoute(pathname = window.location.pathname) {
	return routeController.parse(pathname);
}
function workspaceExists(id) {
	return Boolean(id && controllerState.config?.workspaces.some((workspace) => workspace.id === id));
}
function syncURL(options: { replace?: boolean } = {}) {
	routeController.project(controllerState.activeWorkspaceId, controllerState.selectedId, options);
}
function workspaceName() {
	return controllerState.config?.workspaces.find((w) => w.id === controllerState.activeWorkspaceId)?.name || "Workspace";
}
function applyAgentConfig() {
	const agents = enabledAgentConfigs();
	const defaultAgentName = defaultChatAgentName();
	if (!agents.some((agent) => agent.id === controllerState.agent.agentName)) controllerState.agent.agentName = defaultAgentName;
}
function selectedAgentConfig() {
	const agents = enabledAgentConfigs();
	const agentName = controllerState.agent.agentName || defaultChatAgentName();
	return agents.find((agent) => agent.id === agentName) || agents[0] || null;
}
function enabledAgentConfigs() {
	return (controllerState.config?.agents || []).filter((agent) => agent.available !== false);
}
function defaultChatAgentName() {
	const agents = enabledAgentConfigs();
	const configured = configuredAgentProfileName(controllerState.config?.agentProfiles, "default") || configuredAgentProfileName(settingsController.profiles(), "default");
	if (configured) return configured;
	return agents[0]?.id || "";
}
function configuredAgentProfileName(profiles, key) {
	const normalizedKey = String(key || "").trim().toLowerCase();
	const profile = (profiles || []).find((item) => String(item.key || "").trim().toLowerCase() === normalizedKey);
	return String(profile?.agentName || "").trim();
}
async function openSettings(tab: SettingsModel["initialTab"] = "workspace") {
	return settingsController.open(tab);
}
function closeSettings(dirty = false) {
	settingsController.close(dirty);
}
async function refreshSettings() {
	await settingsController.refresh();
}
function configWithAgentHubCatalog(base, agentHub) {
	return settingsController.withAgentHubCatalog(base, agentHub) as unknown as DomainRecord;
}
function sameJSON(a, b) {
	return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}
let toastRevision = 0;
function toast(message) {
	publisher.renderToast({ message: String(message || ""), revision: ++toastRevision });
}
function refreshIcons() {
	const lucide = window.lucide;
	if (!lucide || controllerState.iconRefreshScheduled) return;
	controllerState.iconRefreshScheduled = true;
	lifecycle?.animationFrame(() => {
		controllerState.iconRefreshScheduled = false;
		lucide.createIcons({ attrs: { "stroke-width": 2 } });
	});
}
function optionalAssetLoaded(asset) {
	refreshIcons();
	if (asset === "markdown" && window.marked && window.DOMPurify) {
		renderDetails();
		refreshIcons();
	}
	if (asset === "diff") renderDetails();
}
window.forgeAssetLoaded = optionalAssetLoaded;
function initPaneResize() {
	paneLayoutController.initialize();
}
function setPaneSize(name, value) {
	paneLayoutController.previewPane(name, value);
}
function savePaneSize(name) {
	paneLayoutController.commitPane(name);
}
function syncPaneViewport() {
	paneLayoutController.syncViewport();
}
function setMobileSidebar(open) {
	paneLayoutController.setMobileSidebar(open);
}
function setMobileView(view) {
	paneLayoutController.setMobileView(view);
}
function setMobileImmersive(immersive) {
	paneLayoutController.setMobileImmersive(immersive);
}
function installControllerListeners() {
	lifecycle?.listen(document, "selectionchange", () => {
	if (!controllerState.agent.renderDeferredForSelection) return;
	const log = elementById("ttyLog");
	if (log && ttyLogHasActiveSelection(log)) return;
	controllerState.agent.renderDeferredForSelection = false;
	renderTTY();
	refreshIcons();
	});
	lifecycle?.listen(document, "keydown", (event) => {
	if (event.key === "Escape" && controllerState.diff) closeDiff();
	else if (event.key === "Escape" && controllerState.preview) closePreview();
	else if (event.key === "Escape" && (controllerState.agent.optionsOpen || controllerState.agent.agentChooserOpen || controllerState.agent.historyOpen)) {
		controllerState.agent.optionsOpen = false;
		controllerState.agent.agentChooserOpen = false;
		controllerState.agent.historyOpen = false;
		renderAgent();
		renderTTYComposer();
		refreshIcons();
	}
	});
	lifecycle?.listen(document, "click", (event) => {
	const target = event.target instanceof Element ? event.target : null;
	const breadcrumbButton = target?.closest<HTMLElement>("[data-breadcrumb-resource]");
	if (breadcrumbButton) {
		openBreadcrumbResource(breadcrumbButton.dataset.breadcrumbResource).catch((err) => toast(err.message));
		return;
	}
	const outsideAgentChooser = controllerState.agent.agentChooserOpen && target && !target.closest(".tty-new-session-control");
	const outsideAgentPanelMenu = (controllerState.agent.optionsOpen || controllerState.agent.historyOpen) && target && !target.closest(".agent-actions") && !target.closest(".agent-sessions") && !target.closest(".tty-composer");
	if (outsideAgentChooser || outsideAgentPanelMenu) {
		controllerState.agent.optionsOpen = false;
		controllerState.agent.agentChooserOpen = false;
		controllerState.agent.historyOpen = false;
		renderAgent();
		renderTTYComposer();
		refreshIcons();
	}
	if (!controllerState.sessionMenu) return;
	if (target?.closest(".session-row") || target?.closest(".session-resource-menu")) return;
	controllerState.sessionMenu = null;
	renderSessions();
		refreshIcons();
	});
	lifecycle?.listen(window, "beforeunload", flushAgentDraftOnPageLeave);
	lifecycle?.listen(document, "visibilitychange", () => {
		if (document.hidden || document.visibilityState === "hidden") flushAgentDraftOnPageLeave();
	});
}
let appBooted = false;
function startForgeApp(nextPublisher: ForgeViewPublisher) {
	publisher = nextPublisher;
	if (appBooted) {
		publishAllViewModels();
		return;
	}
	appBooted = true;
	const scope = new ResourceScope();
	lifecycle = scope;
	notificationController = createNotificationController({
		scope,
		selectedResourceId: () => controllerState.selectedId,
		treeSessions: () => controllerState.tree?.sessions || [],
		agentRuns: () => controllerState.agent.runs,
		hasTree: () => Boolean(controllerState.tree),
		findResource,
		sessionNavigationTarget,
		selectResource,
		activateRun: (runId) => {
			const run = controllerState.agent.runs.find((item) => item.id === runId);
			if (!run) return;
			controllerState.agent.activeRunId = run.id;
			renderAgent();
			renderTTY();
			refreshIcons();
		},
		notificationsSettingsVisible: () => settingsController.isOpenTab("notifications"),
		renderSettings: renderSettingsModal,
		renderSessions,
		refreshIcons,
		flushDraft: flushAgentDraftOnPageLeave
	});
	userSettingsController = createUserSettingsController(scope, () => {
		if (settingsController.isOpenTab("user")) renderSettingsModal();
	});
	installControllerListeners();
	initPaneResize();
	notificationController.install();
	renderAppShell();
	load().catch((err) => {
		controllerState.navigationLoading = false;
		controllerState.navigationError = err.message;
		toast(err.message);
		publishViewModels();
	});
	startAutoRefresh();
}
function flushAgentDraftOnPageLeave() {
	flushAgentDraft();
}
function stopForgeApp() {
	if (!appBooted) return;
	flushAgentDraftOnPageLeave();
	appBooted = false;
	closeAgentStream();
	notificationController?.dispose();
	notificationController = null;
	userSettingsController = null;
	agentOperations.reset();
	clearAgentRenderTimer();
	createDialogController.dispose();
	lifecycle?.dispose();
	lifecycle = null;
	controllerState.autoRefreshTimer = null;
}
async function handleHistoryNavigation(pathname) {
	const route = parseRoute(pathname);
	if (!workspaceExists(route.workspaceId)) {
		syncURL({ replace: true });
		return;
	}
	const workspaceChanged = controllerState.activeWorkspaceId !== route.workspaceId;
	const previousSelectedId = controllerState.selectedId;
	flushAgentDraft();
	controllerState.navigationVersion++;
	controllerState.autoRefreshVersion++;
	controllerState.treeRequestVersion++;
	controllerState.detailRequestVersion++;
	controllerState.workspaceAgentsRequestVersion++;
	controllerState.previewRequestVersion++;
	controllerState.diffRequestVersion++;
	controllerState.workspaceAgentsSaving = false;
	const navigationVersion = controllerState.navigationVersion;
	controllerState.activeWorkspaceId = route.workspaceId || "";
	controllerState.selectedId = route.resourceId || "workspace";
	if (!workspaceChanged && previousSelectedId !== controllerState.selectedId && controllerState.selectedId !== "workspace") {
		resetResourceLogState(controllerState.selectedId);
		delete controllerState.details[controllerState.selectedId];
	}
	controllerState.preview = null;
	controllerState.diff = null;
	controllerState.sessionMenu = null;
	if (workspaceChanged) {
		controllerState.tree = null;
		controllerState.navigationLoading = true;
		controllerState.navigationError = "";
		resetWorkspaceAgentsDraft();
		controllerState.workspaceAgentsSaving = false;
		closeCreateDialog();
		initializeNotificationState(controllerState.activeWorkspaceId);
	}
	if (workspaceChanged) resetAgentState();
	renderWorkspaceSelect();
	if (workspaceChanged) {
		if (!await loadUIState(route.workspaceId, navigationVersion)) return;
		if (!route.resourceId && controllerState.lastResourceId) controllerState.selectedId = controllerState.lastResourceId;
		await loadTree({ updateURL: false });
		if (isCurrentWorkspaceView(route.workspaceId, navigationVersion)) syncURL({ replace: true });
	} else {
		const selectionCorrected = ensureValidSelection();
		if (controllerState.selectedId === "workspace") await loadWorkspaceAgents();
		else {
			ensureSelectedProjectExpanded(false);
			await loadDetail(controllerState.selectedId);
		}
		if (!isCurrentWorkspaceView(route.workspaceId, navigationVersion)) return;
		if (previousSelectedId !== controllerState.selectedId) await reloadAgentRunsForSelection();
		publishViewModels();
		if (selectionCorrected) syncURL({ replace: true });
	}
}
export { startForgeApp, stopForgeApp };
