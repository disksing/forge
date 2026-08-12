import type { AgentEvent, AgentNotice, ComposerContext, ComposerModel, EventTimelineModel, SessionSwitcherModel, TimelineItem, UploadDialogModel } from "./models/chat";
import type { ToastModel } from "./models/common";
import type { CreateDialogModel, TaskTemplate } from "./models/create";
import type { DetailPanelModel } from "./models/detail";
import type { SettingsModel } from "./models/settings";
import type { AppShellModel, ShellDragTarget, ShellResourceItem, ShellStatusPresentation } from "./models/shell";
import type { AgentConfig, AgentProfile, DiffRecord, ResourceRecord, WorkspaceConfig, WorkspaceFileRecord, WorkspaceSession, WorkspaceTree } from "./models/workspace";
import { createAgentDraftController } from "./controllers/agent-draft-controller";
import { createAgentOperationController } from "./controllers/agent-operation-controller";
import { createAgentSessionController, type AgentRunRecord } from "./controllers/agent-session-controller";
import { createCreateDialogController } from "./controllers/create-dialog-controller";
import { createNotificationController } from "./controllers/notification-controller";
import { createPaneLayoutController } from "./controllers/pane-layout-controller";
import { createResourceDetailController, type ResourceLogPageState } from "./controllers/resource-detail-controller";
import { createRouteController } from "./controllers/route-controller";
import { createSettingsController, type AgentHubData } from "./controllers/settings-controller";
import { createShellProjection, type TaskOperationalState, type TaskStatusState } from "./controllers/shell-projection";
import { createUserSettingsController } from "./controllers/user-settings-controller";
import { ApiError } from "./api/client";
import { errorMessage } from "./runtime/errors";
import { ResourceScope } from "./runtime/resource-scope";

export interface ForgeViewPublisher {
  renderAppShell(model: AppShellModel): void;
  renderCreateDialog(model: CreateDialogModel): void;
  renderSettings(model: SettingsModel): void;
  renderUploadDialog(model: UploadDialogModel): void;
  renderComposer(model: ComposerModel): void;
  renderSessionSwitcher(model: SessionSwitcherModel): void;
  renderEventTimeline(model: EventTimelineModel): void;
  renderDetailPanel(model: DetailPanelModel): void;
  renderToast(model: ToastModel): void;
}

let publisher: ForgeViewPublisher;
let lifecycle: ResourceScope | null = null;

interface ControllerState {
	config: WorkspaceConfig | null;
	tree: WorkspaceTree | null;
	details: Record<string, ResourceRecord>;
	resourceLogPages: Record<string, ResourceLogPageState>;
	workspaceAgents: WorkspaceFileRecord | null;
	workspaceAgentsDraft: string;
	workspaceAgentsDirty: boolean;
	workspaceAgentsSaving: boolean;
	activeWorkspaceId: string;
	navigationLoading: boolean;
	navigationError: string;
	workspaceMenuOpen: boolean;
	selectedId: string;
	lastResourceId: string;
	expandedProjects: Set<string>;
	projectOrder: string[];
	taskOrder: Record<string, string[]>;
	sessionOrder: string[];
	listDrag: ShellDragTarget | null;
	expandedPaths: Set<string>;
	preview: (WorkspaceFileRecord & { section?: string }) | null;
	diff: DiffRecord | null;
	modalEnter: string;
	sessionMenu: WorkspaceSession | null;
	taskOperationalStateKey: string;
	uploadDialog: { open: boolean; identity: number; runId: string; items: unknown[]; nextId: number };
	autoRefreshTimer: number | null;
	autoRefreshInFlight: boolean;
	autoRefreshVersion: number;
	agentRunProjectionVersion: number;
	treeRequestVersion: number;
	navigationVersion: number;
	detailRequestVersion: number;
	workspaceAgentsRequestVersion: number;
	previewRequestVersion: number;
	diffRequestVersion: number;
	agentSessionMutationCount: number;
	iconRefreshScheduled: boolean;
	agent: {
		runs: AgentRunRecord[];
		activeRunId: string;
		events: AgentEvent[];
		notices: AgentNotice[];
		stream: EventSource | null;
		streamRunId: string;
		renderTimer: number | null;
		draftPrompt: string;
		ttyDraft: string;
		ttyMultiline: boolean;
		ttyDraftKey: string;
		ttyDraftWorkspaceId: string;
		ttyDraftResourceId: string;
		ttyDraftRunId: string;
		ttyDraftVersion: number;
		ttyDraftResetVersion: number;
		skipTTYDraftSync: boolean;
		agentName: string;
		optionsOpen: boolean;
		agentChooserOpen: boolean;
		historyOpen: boolean;
		sessionActionsOpen: boolean;
		eventsHasMore: boolean;
		historyBeforeId: number;
		loadingOlder: boolean;
		toolGroupOpen: Map<string, boolean>;
		approvalDrafts: Map<string, Record<string, unknown>>;
		renderDeferredForSelection: boolean;
	};
	tty: Array<{ type: string; text: string }>;
}

const controllerState: ControllerState = {
	config: null,
	tree: null,
	details: {},
	resourceLogPages: {} as Record<string, ResourceLogPageState>,
	workspaceAgents: null,
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
	preview: null,
	diff: null,
	modalEnter: "",
	sessionMenu: null,
	taskOperationalStateKey: "",
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
		runs: [],
		activeRunId: "",
		events: [],
		notices: [],
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
		sessionActionsOpen: false,
		eventsHasMore: false,
		historyBeforeId: 0,
		loadingOlder: false,
		toolGroupOpen: /* @__PURE__ */ new Map<string, boolean>(),
		approvalDrafts: /* @__PURE__ */ new Map<string, Record<string, unknown>>(),
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

const agentDraftController = createAgentDraftController({
	runtime: controllerState.agent,
	workspaceId: () => controllerState.activeWorkspaceId,
	runs: () => controllerState.agent.runs,
	currentRun: () => currentAgentRun(),
});
const clearAgentDraftAfterAccepted = agentDraftController.clearAfterAccepted;
const clearAgentDraftMemory = agentDraftController.clearMemory;
const flushAgentDraft = agentDraftController.flush;
const restoreAgentDraftForRun = agentDraftController.restore;
const updateAgentDraft = agentDraftController.update;

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
	isLive: isLiveAgentRun,
	isTurnInterruptible: isAgentTurnInterruptible,
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
	details: controllerState.details,
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
const AGENT_HIDDEN_EVENT_TYPES = /* @__PURE__ */ new Set(["session.launch-environment"]);
interface LoadTreeOptions { updateURL?: boolean; replaceURL?: boolean }
interface LoadDetailOptions { force?: boolean }
interface FetchDetailOptions { logsCursor?: string | number; cursor?: string | number; logsLimit?: number; limit?: number }
interface WorkspaceAgentsOptions { force?: boolean }
interface SelectResourceOptions { clearUnread?: boolean; forceDetail?: boolean }
interface FilePreviewOptions { workspaceId?: string; requestVersion?: number; rethrow?: boolean }
interface RenderOptions { skipDraftSync?: boolean }
interface UploadContext { workspaceId?: string; runId?: string }
interface WorkspaceIconOption { id: string; label: string; src: string; type?: string }
interface SessionNavigationTarget {
	kind: string;
	resourceId: string;
	displayResourceId: string;
	navigationResourceId: string;
	selectedResourceIds: string[];
}
const DEFAULT_WORKSPACE_ICON: WorkspaceIconOption = {
	id: "",
	label: "Forge default",
	src: "/favicon.svg",
	type: "image/svg+xml"
};
const WORKSPACE_ICONS: WorkspaceIconOption[] = [
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
const {
	applyCustomOrder,
	moveIdInList,
	noTaskOperationalState,
	operationalStatusPresentation,
	projectTaskSummary,
	resourceRefText,
	sessionOperationalLabel,
	sessionStatusPresentation,
	sortedSessionsForDisplay,
	statusModel: appShellStatusModel,
	taskOperationalState,
	taskOperationalStateKey,
	taskStatusState,
} = createShellProjection({
	tree: () => controllerState.tree,
	findResource: (id) => findResource(id),
	agentName: (agentId) => (controllerState.config?.agents || []).find((agent) => agent.id === agentId)?.name || agentId || "Forge GUI",
});
let uploadDialogIdentity = 0;
const settingsController = createSettingsController({
	config: () => controllerState.config || { workspaces: [], agents: [], agentProfiles: [] },
	setConfig: (config) => { controllerState.config = config; },
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
	renderAgentUploadDialog();
	renderTTYComposer();
	renderAgent();
	renderTTY();
	renderSettingsModal();
}
let notificationController: ReturnType<typeof createNotificationController> | null = null;
let userSettingsController: ReturnType<typeof createUserSettingsController> | null = null;
function initializeNotificationState(workspaceId: string): void {
	notificationController?.initialize(workspaceId);
}
function establishNotificationBaseline() {
	notificationController?.establishBaseline();
}
function observeCompletionProjections(items: Array<WorkspaceSession | AgentRunRecord>): void {
	notificationController?.observeProjections(items);
}
function observeCompletionEvent(event: AgentEvent, run: AgentRunRecord | null): void {
	if (run) notificationController?.observeEvent(event, run);
}
function hasUnreadNotificationForSession(sessionId: string): boolean {
	return notificationController?.hasUnreadForSession(sessionId) ?? false;
}
function clearUnreadForResource(resourceId: string): void {
	notificationController?.clearResource(resourceId);
}
function currentUserName() {
	return userSettingsController?.current() || "User";
}
async function api<Response>(path: string, options: RequestInit = {}): Promise<Response> {
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
	if (response.status === 204) return null as Response;
	return response.json() as Promise<Response>;
}
async function load() {
	const route = parseRoute();
	const [base, agentHub] = await Promise.all([api<WorkspaceConfig>("/api/workspaces"), api<AgentHubData>("/api/settings/agenthub")]);
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
	let tree: WorkspaceTree;
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
async function loadDetail(id: string, options: LoadDetailOptions = {}): Promise<ResourceRecord | null | undefined> {
	return resourceDetailController.load(id, options);
}
function fetchDetail(id: string, workspaceId = controllerState.activeWorkspaceId, options: FetchDetailOptions = {}): Promise<ResourceRecord> {
	return resourceDetailController.fetch(id, workspaceId, options);
}
function resetResourceLogState(resourceId: string): void {
	resourceDetailController.reset(resourceId);
}
function resourceLogPage(resourceId: string): ResourceLogPageState {
	return resourceDetailController.page(resourceId);
}
function resourceDetailSnapshot(resourceId: string): ReturnType<typeof resourceDetailController.snapshot> {
	return resourceDetailController.snapshot(resourceId);
}
function applyResourceDetail(detail: ResourceRecord, mode: "head" | "replace" | "older" = "head"): ResourceRecord | null {
	return resourceDetailController.apply(detail, mode);
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
		const agents = await api<WorkspaceFileRecord>(`/api/workspaces/${workspaceId}/files?path=${encodeURIComponent("AGENTS.md")}`);
		if (!isCurrentWorkspaceView(workspaceId, navigationVersion) || requestVersion !== controllerState.workspaceAgentsRequestVersion) return null;
		controllerState.workspaceAgents = agents;
	} catch (err) {
		if (!isCurrentWorkspaceView(workspaceId, navigationVersion) || requestVersion !== controllerState.workspaceAgentsRequestVersion) return null;
		controllerState.workspaceAgents = {
			path: "AGENTS.md",
			name: "AGENTS.md",
			error: errorMessage(err)
		};
	}
	return controllerState.workspaceAgents;
}
async function loadUIState(workspaceId = controllerState.activeWorkspaceId, navigationVersion = controllerState.navigationVersion) {
	const uiState = await api<{ expandedProjects?: string[]; lastResourceId?: string; projectOrder?: string[]; taskOrder?: Record<string, string[]>; sessionOrder?: string[] }>(`/api/workspaces/${workspaceId}/ui-state`);
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
		if (reconcileActiveAgentRun(runs)) {
			if (!isCurrentAutoRefresh(workspaceId, navigationVersion, refreshVersion) || agentRunProjectionVersion !== controllerState.agentRunProjectionVersion) return;
			changed = true;
		}
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
	renderSettingsModal();
}
function renderSelectionPanels() {
	renderAppShell();
	renderDetails();
	renderAgent();
	renderTTY();
	refreshIcons();
	renderCreateDialog();
}
function isCurrentWorkspaceView(workspaceId: string, navigationVersion: number, treeRequestVersion: number | null = null): boolean {
	return workspaceId === controllerState.activeWorkspaceId && navigationVersion === controllerState.navigationVersion && (treeRequestVersion == null || treeRequestVersion === controllerState.treeRequestVersion);
}
function isCurrentAutoRefresh(workspaceId: string, navigationVersion: number, refreshVersion: number): boolean {
	return isCurrentWorkspaceView(workspaceId, navigationVersion) && refreshVersion === controllerState.autoRefreshVersion;
}
function workspaceIconOption(workspace: { icon?: string } | null | undefined): WorkspaceIconOption {
	return WORKSPACE_ICON_BY_ID.get(String(workspace?.icon || "").trim()) || DEFAULT_WORKSPACE_ICON;
}
function updateWorkspaceFavicon(workspace: { icon?: string } | null | undefined): void {
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
function appShellResourceModel(item: ResourceRecord, kind: "project" | "task", projectId = ""): ShellResourceItem {
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
function appShellSessionModel(session: WorkspaceSession): AppShellModel["sessions"][number] {
	const navigation = sessionNavigationTarget(session);
	const resourceId = navigation.displayResourceId;
	const isInternal = session.source === "internal";
	const status = isInternal ? sessionStatusPresentation(session) : taskStatusState("session-external", "session-status-external", "message-square", "External session active", "session");
	const taskResource = sessionTaskResource(session);
	const taskState = taskResource ? taskOperationalState(taskResource) : noTaskOperationalState();
	const presentation = operationalStatusPresentation([status]);
	const unread = hasUnreadNotificationForSession(session.id);
	const statusLabel = `${sessionOperationalLabel(session, taskResource, taskState, status)}${unread ? ". Unread turn completion." : ""}`;
	const agent = isInternal ? (controllerState.config?.agents || []).find((item) => item.id === session.agentRunAgentName) : null;
	const metaParts = [isInternal ? "AgentHub" : "External"];
	if (resourceId) metaParts.push(resourceId);
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
		clickable: Boolean(navigation.navigationResourceId),
		navigationResourceId: navigation.navigationResourceId,
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
		onLayoutCycle: () => paneLayoutController.cycleLayoutPreference(),
		onHistoryNavigation: (pathname) => handleHistoryNavigation(pathname),
		onToast: toast,
		onIconsChanged: refreshIcons
	});
}
async function switchWorkspace(id: string): Promise<void> {
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
	resetAgentState();
	renderWorkspaceSelect();
	if (!await loadUIState(id, navigationVersion)) return;
	controllerState.selectedId = controllerState.lastResourceId || "workspace";
	await loadTree();
}
async function commitListDrag(drag: ShellDragTarget, target: ShellDragTarget, after: boolean): Promise<void> {
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
async function selectResource(id: string, options: SelectResourceOptions = {}): Promise<void> {
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
async function toggleProject(id: string): Promise<void> {
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
function renderSessions() {
	renderAppShell();
}
function sessionDisplayTitle(session: WorkspaceSession, resource: SessionNavigationTarget | string = sessionNavigationTarget(session)): string {
	const displayResourceId = (typeof resource === "string" ? resource : resource.displayResourceId) || "";
	const resourceTitle = findResource(displayResourceId)?.title || "";
	if (session.source === "internal") return session.agentRunTitle || resourceTitle || displayResourceId || session.id;
	return resourceTitle || displayResourceId || session.id;
}
function sessionNavigableResourceId(resourceId: string): string {
	const value = String(resourceId || "").trim();
	if (!value) return "";
	const resource = findResource(value);
	return resource && resource.archived !== true ? value : "";
}
function sessionNavigationTarget(session: WorkspaceSession): SessionNavigationTarget {
	const runResourceId = String(session?.resourceId || "").trim();
	if (session?.source === "internal" && runResourceId) return {
		kind: "run",
		resourceId: runResourceId,
		displayResourceId: runResourceId,
		navigationResourceId: sessionNavigableResourceId(runResourceId),
		selectedResourceIds: [runResourceId]
	};
	return {
		kind: "none",
		resourceId: "",
		displayResourceId: "",
		navigationResourceId: "",
		selectedResourceIds: []
	};
}
function sessionTaskResource(session: WorkspaceSession): ResourceRecord | null {
	if (!session || session.source !== "internal") return null;
	const explicitResourceId = String(session.resourceId || "").trim();
	if (explicitResourceId) return activeTaskResource(explicitResourceId);
	return null;
}
function activeTaskResource(resourceId: string): ResourceRecord | null {
	const resource = findResource(resourceId);
	return resource && resource.type === "task" && !resource.archived ? resource : null;
}
function detailPanelModel(): DetailPanelModel {
	const workspaceId = controllerState.activeWorkspaceId || "";
	const base: DetailPanelModel = {
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
		agentBinding: controllerState.selectedId === "workspace"
			? controllerState.tree?.agentBinding || { kind: "profile", name: "default" }
			: findResource(controllerState.selectedId)?.agentBinding || { kind: "profile", name: "default" },
		agentProfiles: (controllerState.config?.agentProfiles || []).map((profile) => ({ key: profile.key, description: profile.description })),
		agents: svelteAgentOptions(),
		logs: {
			hasMore: false,
			loading: false,
			error: ""
		},
		onNavigate: (resourceId: string) => openBreadcrumbResource(resourceId).catch((err) => toast(errorMessage(err))),
		onCreateTask: (projectId: string) => showTaskForm(projectId),
		onArchive: (resourceId: string) => archiveResource(resourceId).catch((err) => toast(errorMessage(err))),
		onLoadMoreLogs: (resourceId: string) => loadMoreLogs(resourceId),
		onSaveWorkspaceAgents: (content: string, expectedContentHash: string) => saveWorkspaceAgentsFromDetail(content, expectedContentHash),
		onSaveAgentBinding: async (binding) => {
			const resourceId = controllerState.selectedId || "workspace";
			await api(`/api/workspaces/${encodeURIComponent(workspaceId)}/resources/${encodeURIComponent(resourceId)}/agent-binding`, {
				method: "PUT", body: JSON.stringify(binding)
			});
			await loadTree({ updateURL: false });
			if (resourceId !== "workspace") await loadDetail(resourceId, { force: true });
			publishViewModels();
			toast("Resource agent binding saved.");
		},
		onToast: toast,
		onIconsChanged: refreshIcons
	};
	if (!controllerState.tree) return base;
	if (controllerState.selectedId === "workspace") return {
		...base,
		resourceId: "workspace",
		resourceType: "workspace",
		resourceTitle: workspaceName()
		};
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
		detail: resourceDetailView(detail),
		logs: {
			hasMore: Boolean(page.hasMore ?? detail?.logPage?.hasMore),
			loading: Boolean(page.loading),
			error: String(page.error || "")
		}
	};
}
function resourceDetailView(detail: ResourceRecord | null): DetailPanelModel["detail"] {
	if (!detail || (detail.type !== "project" && detail.type !== "task")) return null;
	return {
		...detail,
		type: detail.type,
		title: detail.title || detail.id,
		path: detail.path || "",
		logs: (detail.logs || []).map((entry, index) => ({
			id: entry.id || `${detail.id}:log:${index}`,
			time: entry.time || "",
			title: entry.title,
			details: entry.details,
		})),
	};
}
function renderDetails(): void {
	publisher.renderDetailPanel(detailPanelModel());
}
async function openBreadcrumbResource(id: string): Promise<void> {
	await selectResource(id, { forceDetail: id === controllerState.selectedId && id !== "workspace" });
}
function stripForgeManagedBlocks(content: string): string {
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
function workspaceAgentsUserContent(content: string): string {
	return stripForgeManagedBlocks(content || "").trim();
}
function resetWorkspaceAgentsDraft(): void {
	controllerState.workspaceAgentsDraft = "";
	controllerState.workspaceAgentsDirty = false;
}
async function refreshFilePreview(section: string, path: string, options: FilePreviewOptions = {}): Promise<WorkspaceFileRecord | null> {
	const workspaceId = options.workspaceId || controllerState.activeWorkspaceId;
	const requestVersion = options.requestVersion || ++controllerState.previewRequestVersion;
	try {
		const preview = await api<WorkspaceFileRecord>(filePreviewURL(section, path, workspaceId));
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
		};
		if (options.rethrow && current) throw err;
		return null;
	}
}
async function saveWorkspaceAgentsFromDetail(content: string, expectedContentHash: string): Promise<WorkspaceFileRecord> {
	if (!controllerState.activeWorkspaceId) throw new Error("No workspace is selected.");
	const workspaceId = controllerState.activeWorkspaceId;
	const navigationVersion = controllerState.navigationVersion;
	const saved = await api<WorkspaceFileRecord>(`/api/workspaces/${workspaceId}/files?path=${encodeURIComponent("AGENTS.md")}`, {
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
function closePreview(): void {
	controllerState.previewRequestVersion++;
	controllerState.preview = null;
	publishViewModels();
}
function closeDiff(): void {
	controllerState.diffRequestVersion++;
	controllerState.diff = null;
	publishViewModels();
}
function filePreviewURL(section: string, path: string, workspaceId = controllerState.activeWorkspaceId): string {
	return `/api/workspaces/${workspaceId}/${section === "Wiki" ? "wiki/files" : "files"}?path=${encodeURIComponent(path)}`;
}
async function loadAgentRuns(): Promise<boolean | void> {
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
	if (!controllerState.agent.activeRunId) controllerState.agent.historyBeforeId = 0;
	if (projectionVersion !== controllerState.agentRunProjectionVersion) return false;
	return true;
}
async function refreshAgentRunMetadata(): Promise<boolean | void> {
	if (!controllerState.activeWorkspaceId) return;
	controllerState.agentRunProjectionVersion = (Number(controllerState.agentRunProjectionVersion) || 0) + 1;
	const projectionVersion = controllerState.agentRunProjectionVersion;
	const workspaceId = controllerState.activeWorkspaceId;
	const runs = await fetchAgentRuns();
	if (projectionVersion !== controllerState.agentRunProjectionVersion || controllerState.activeWorkspaceId !== workspaceId) return false;
	controllerState.agent.runs = runs;
	observeCompletionProjections(runs);
	if (reconcileActiveAgentRun(runs)) {
		if (projectionVersion !== controllerState.agentRunProjectionVersion || controllerState.activeWorkspaceId !== workspaceId) return false;
	}
	return true;
}
function reconcileActiveAgentRun(runs: AgentRunRecord[]): boolean {
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
function preferredAgentRunID(runs: AgentRunRecord[]): string {
	if (runs.some((run) => run.id === controllerState.agent.activeRunId)) return controllerState.agent.activeRunId;
	return runs[0]?.id || "";
}
async function fetchCurrentTree(workspaceId = controllerState.activeWorkspaceId): Promise<WorkspaceTree | null> {
	const requestVersion = ++controllerState.treeRequestVersion;
	const navigationVersion = controllerState.navigationVersion;
	const tree = await api<WorkspaceTree>(`/api/workspaces/${workspaceId}/tree`);
	return isCurrentWorkspaceView(workspaceId, navigationVersion, requestVersion) ? tree : null;
}
async function refreshTreeAfterAgentSessionMutation(): Promise<void> {
	if (!controllerState.activeWorkspaceId || !controllerState.tree) return;
	const tree = await fetchCurrentTree(controllerState.activeWorkspaceId);
	if (tree) controllerState.tree = tree;
}
async function refreshAgentInputProjection(workspaceId: string, resourceId: string): Promise<void> {
	if (!workspaceId || controllerState.activeWorkspaceId !== workspaceId) return;
	await Promise.all([
		loadAgentRuns(),
		refreshTreeAfterAgentSessionMutation(),
		resourceId && resourceId !== "workspace" ? fetchDetail(resourceId, workspaceId, { logsLimit: RESOURCE_LOG_INITIAL_LIMIT }).then((detail) => {
			if (controllerState.activeWorkspaceId === workspaceId && detail) applyResourceDetail(detail, "head");
		}) : Promise.resolve()
	]);
	if (controllerState.activeWorkspaceId === workspaceId) {
		publishViewModels();
	}
}
async function mutateAgentSession<Result>(action: () => Promise<Result>): Promise<Result> {
	controllerState.agentSessionMutationCount++;
	controllerState.autoRefreshVersion++;
	controllerState.treeRequestVersion++;
	try {
		return await action();
	} finally {
		controllerState.agentSessionMutationCount--;
	}
}
function fetchAgentRuns(): Promise<AgentRunRecord[]> {
	const resourceId = selectedAgentResourceId();
	const query = resourceId ? `?resourceId=${encodeURIComponent(resourceId)}` : "";
	return api<{ runs?: AgentRunRecord[] }>(`/api/workspaces/${controllerState.activeWorkspaceId}/agent/runs${query}`).then((body) => body.runs || []);
}
async function reloadAgentRunsForSelection(): Promise<void> {
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
function resetAgentState(): void {
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
	controllerState.agent.renderDeferredForSelection = false;
	clearAgentRenderTimer();
}
function closeAgentStream(): void {
	if (controllerState.agent.stream) controllerState.agent.stream.close();
	controllerState.agent.stream = null;
	controllerState.agent.streamRunId = "";
}
function handleSvelteAgentEvent(workspaceId: string, runId: string, event: AgentEvent): void {
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
	].includes(event.type)) refreshAgentRunMetadata().then(publishViewModels).catch((err) => console.warn("agent refresh failed", err));
}
function handleSvelteForgeNotice(_workspaceId: string, _runId: string, _notice: AgentNotice): void {}
function clearAgentRenderTimer(): void {
	if (controllerState.agent.renderTimer) window.clearTimeout(controllerState.agent.renderTimer);
	controllerState.agent.renderTimer = null;
}
function projectAgentEvents(events: AgentEvent[]): TimelineItem[] {
	if (!window.AgentHubEventTimeline?.buildTimeline) throw new Error("AgentHub Event Timeline library is unavailable");
	const visibleEvents = (events || []).filter((event) => !AGENT_HIDDEN_EVENT_TYPES.has(event?.type));
	return window.AgentHubEventTimeline.buildTimeline(visibleEvents) as TimelineItem[];
}
function renderAgent(): void {
	const activeRun = currentAgentRun();
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
function agentConfigSummary(agent: AgentConfig | null | undefined): string {
	if (!agent) return "";
	const parts = [providerName(agent.providerId)];
	if (agent.options?.model) parts.push(agent.options.model);
	return parts.filter(Boolean).join(" · ");
}
function providerName(providerId: string | undefined): string {
	return (controllerState.config?.agentHubProviders || settingsController.providers()).find((item) => item.id === providerId)?.name || providerId || "Provider";
}
function ttyLogHasActiveSelection(log: HTMLElement): boolean {
	const selection = window.getSelection?.();
	if (!selection || selection.isCollapsed || selection.rangeCount === 0) return false;
	return selection.getRangeAt(0).intersectsNode(log);
}
function renderTTY(_options: RenderOptions = {}): void {
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
function agentSessionMutationKey(workspaceId: string, runId: string): string {
	return `${workspaceId || "workspace"}:${runId || "run"}`;
}
function renderTTYComposer(_options: RenderOptions = {}): void {
	controllerState.agent.skipTTYDraftSync = false;
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
		unavailableReason: live && activeRun ? agentInputUnavailableReason(activeRun, isAgentSessionReady(activeRun)) : "",
		sending: Boolean(activeRun && agentOperations.isSending(agentSessionMutationKey(controllerState.activeWorkspaceId, activeRun.id))),
		agents: svelteAgentOptions(),
		selectedAgentId: selectedAgentConfig()?.id || "",
		chooserOpen: Boolean(controllerState.agent.agentChooserOpen),
		sessionStarting: agentOperations.active("session-start"),
		actionsOpen: Boolean(controllerState.agent.sessionActionsOpen),
		canEndTurn: Boolean(activeRun && (isAgentTurnInterruptible(activeRun) || stopTurnPending)),
		endingTurn: stopTurnPending,
		closingSession: sessionStopping,
		onDraft: (text, draftContext) => updateAgentDraftFromSvelte(text, draftContext),
		onSend: submitTTYInput,
		onOpenUpload: openAgentUploadDialog,
		onToggleChooser: () => {
			if (agentOperations.active("session-start") || !enabledAgentConfigs().length) return;
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
function isAgentSessionReady(run: AgentRunRecord | null): boolean {
	if (!run || !isLiveAgentRun(run)) return false;
	if (run.status !== "starting") return true;
	if (controllerState.agent.events.some((event) => event.type === "session.state" && event.data?.state === "ready")) return true;
	return controllerState.agent.eventsHasMore && run.status !== "starting";
}
function agentInputUnavailableReason(run: AgentRunRecord, sessionReady = isAgentSessionReady(run)): string {
	if (isAgentTurnStopping(run)) return "Ending the current turn.";
	if (!sessionReady) return "Agent session is starting.";
	if (run.status === "stopping") return "AgentHub is stopping the provider.";
	if (run.status === "recovering") return "AgentHub event recovery is in progress.";
	if (run.status === "waiting_approval") return "Resolve the pending approval before sending input.";
	return "";
}
function agentDisplayName(agent: AgentConfig | null | undefined): string {
	return agent?.name || agent?.id || "Agent";
}
function renderSettingsModal(): void {
	settingsController.render();
}
function updateAgentDraftFromSvelte(text: string, context: ComposerContext): void {
	if (!context || context.workspaceId !== controllerState.activeWorkspaceId || context.runId !== controllerState.agent.activeRunId || context.draftKey !== controllerState.agent.ttyDraftKey) return;
	updateAgentDraft(text);
}
function closeCurrentAgentSession(): void {
	stopAgentRun().catch((err) => toast(err.message));
}
async function startAgentRun(agentName = "") {
	return agentSessionController.start(agentName);
}
function openAgentUploadDialog(): void {
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
function closeAgentUploadDialog(paths: string[] = [], context: UploadContext = {}): void {
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
function discardAgentUploadDialog(): void {
	controllerState.uploadDialog = {
		open: false,
		identity: ++uploadDialogIdentity,
		runId: "",
		items: [],
		nextId: 1
	};
	renderAgentUploadDialog();
}
function appendUploadedPaths(draft: string, paths: string[]): string {
	const block = paths.filter(Boolean).join("\n");
	if (!block) return draft;
	if (!draft) return block;
	return `${draft}${draft.endsWith("\n") ? "" : "\n"}${block}`;
}
function renderAgentUploadDialog(): void {
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
async function stopAgentRun(): Promise<void> {
	return agentSessionController.stopSession();
}
async function stopAgentTurn(): Promise<void> {
	return agentSessionController.stopTurn();
}
async function switchAgentRun(runId: string): Promise<void> {
	return agentSessionController.switchRun(runId);
}
async function closeAgentRun(runId: string): Promise<void> {
	await agentSessionController.closeRun(runId);
}
async function resumeAgentRun(): Promise<void> {
	return agentSessionController.resume();
}
async function resolveAgentApprovalForRun(runId: string, requestId: string, reply: Parameters<EventTimelineModel["onApproval"]>[2]): Promise<void> {
	return agentSessionController.resolveApproval(runId, requestId, reply);
}
function currentAgentRun(): AgentRunRecord | null {
	return controllerState.agent.runs.find((run) => run.id === controllerState.agent.activeRunId) || null;
}
function isLiveAgentRun(run: AgentRunRecord | null): boolean {
	return [
		"starting",
		"running",
		"waiting_approval",
		"idle",
		"stopping",
		"recovering"
	].includes(run?.status || "");
}
function isAgentTurnInterruptible(run: AgentRunRecord | null): boolean {
	return ["running", "waiting_approval"].includes(run?.status || "");
}
function isAgentTurnStopping(run: AgentRunRecord | null): boolean {
	return agentOperations.active("turn-stop") && agentOperations.key("turn-stop") === run?.id;
}
function isAgentSessionStopping(run: AgentRunRecord | null): boolean {
	return agentOperations.active("session-stop") && agentOperations.key("session-stop") === run?.id;
}
async function submitTTYInput(rawText: string, context: ComposerContext): Promise<{ accepted: boolean; clear: boolean }> {
	return agentSessionController.send(rawText, context);
}
function agentDefaultCwd(): string {
	const selected = findResource(controllerState.selectedId);
	if (!selected) return "";
	return selected.path || "";
}
function selectedAgentResourceId(): string {
	if (controllerState.selectedId === "workspace") return "workspace";
	return findResource(controllerState.selectedId)?.id || "";
}
function relativeTime(value: string | undefined): string {
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
function showProjectForm(): void {
	openCreateDialog("project");
}
function showTaskForm(projectId: string): void {
	openCreateDialog("task", projectId);
}
function openCreateDialog(type: "project" | "task", projectId = ""): void {
	createDialogController.open(type === "task" ? "task" : "project", projectId);
}
function closeCreateDialog(): void {
	createDialogController.close();
}
function renderCreateDialog(): void {
	createDialogController.render();
}
async function archiveResource(resourceId: string): Promise<void> {
	if (!confirm(`Archive ${resourceId}?`)) return;
	await api<void>(`/api/workspaces/${controllerState.activeWorkspaceId}/archive`, {
		method: "POST",
		body: JSON.stringify({ resourceId })
	});
	toast("Archived.");
	controllerState.selectedId = "workspace";
	await loadTree();
}
function findResource(id: string): ResourceRecord | null {
	if (!controllerState.tree) return null;
	for (const project of controllerState.tree.projects) {
		if (project.id === id) return project;
		for (const task of project.children || []) if (task.id === id) return task;
	}
	return null;
}
function ensureValidSelection(): boolean {
	if (controllerState.selectedId === "workspace" || findResource(controllerState.selectedId)) return false;
	controllerState.selectedId = "workspace";
	return true;
}
function parentProject(id: string): ResourceRecord | null {
	if (!controllerState.tree) return null;
	for (const project of controllerState.tree.projects) {
		if (project.id === id) return project;
		if ((project.children || []).some((task) => task.id === id)) return project;
	}
	return null;
}
function isProjectExpanded(id: string): boolean {
	return controllerState.expandedProjects.has(id);
}
function ensureSelectedProjectExpanded(persist = false): void {
	const parent = parentProject(controllerState.selectedId);
	if (!parent || parent.id === controllerState.selectedId || controllerState.expandedProjects.has(parent.id)) return;
	controllerState.expandedProjects.add(parent.id);
	if (persist) saveUIState().catch((err) => toast(err.message));
}
function parseRoute(pathname = window.location.pathname): ReturnType<typeof routeController.parse> {
	return routeController.parse(pathname);
}
function workspaceExists(id: string | undefined): boolean {
	return Boolean(id && controllerState.config?.workspaces.some((workspace) => workspace.id === id));
}
function syncURL(options: { replace?: boolean } = {}): void {
	routeController.project(controllerState.activeWorkspaceId, controllerState.selectedId, options);
}
function workspaceName(): string {
	return controllerState.config?.workspaces.find((w) => w.id === controllerState.activeWorkspaceId)?.name || "Workspace";
}
function applyAgentConfig(): void {
	const agents = enabledAgentConfigs();
	const defaultAgentName = defaultChatAgentName();
	if (!agents.some((agent) => agent.id === controllerState.agent.agentName)) controllerState.agent.agentName = defaultAgentName;
}
function selectedAgentConfig(): AgentConfig | null {
	const agents = enabledAgentConfigs();
	const agentName = controllerState.agent.agentName || defaultChatAgentName();
	return agents.find((agent) => agent.id === agentName) || agents[0] || null;
}
function enabledAgentConfigs(): AgentConfig[] {
	return (controllerState.config?.agents || []).filter((agent) => agent.available !== false);
}
function defaultChatAgentName(): string {
	const agents = enabledAgentConfigs();
	const configured = configuredAgentProfileName(controllerState.config?.agentProfiles, "default") || configuredAgentProfileName(settingsController.profiles(), "default");
	if (configured) return configured;
	return agents[0]?.id || "";
}
function configuredAgentProfileName(profiles: AgentProfile[] | undefined, key: string): string {
	const normalizedKey = String(key || "").trim().toLowerCase();
	const profile = (profiles || []).find((item) => String(item.key || "").trim().toLowerCase() === normalizedKey);
	return String(profile?.agentName || "").trim();
}
async function openSettings(tab: SettingsModel["initialTab"] = "workspace"): Promise<void> {
	return settingsController.open(tab);
}
function closeSettings(dirty = false): void {
	settingsController.close(dirty);
}
async function refreshSettings(): Promise<void> {
	await settingsController.refresh();
}
function configWithAgentHubCatalog(base: WorkspaceConfig, agentHub: AgentHubData): WorkspaceConfig {
	return settingsController.withAgentHubCatalog(base, agentHub);
}
function sameJSON(a: unknown, b: unknown): boolean {
	return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}
let toastRevision = 0;
function toast(message: unknown): void {
	publisher.renderToast({ message: String(message || ""), revision: ++toastRevision });
}
function refreshIcons(): void {
	const lucide = window.lucide;
	if (!lucide || controllerState.iconRefreshScheduled) return;
	controllerState.iconRefreshScheduled = true;
	lifecycle?.animationFrame(() => {
		controllerState.iconRefreshScheduled = false;
		lucide.createIcons({ attrs: { "stroke-width": 2 } });
	});
}
function optionalAssetLoaded(asset: string): void {
	refreshIcons();
	if (asset === "markdown" && window.marked && window.DOMPurify) {
		renderDetails();
		refreshIcons();
	}
	if (asset === "diff") renderDetails();
}
window.forgeAssetLoaded = optionalAssetLoaded;
function initPaneResize(): void {
	paneLayoutController.initialize();
}
function setPaneSize(name: keyof AppShellModel["paneSizes"], value: number): void {
	paneLayoutController.previewPane(name, value);
}
function savePaneSize(name: keyof AppShellModel["paneSizes"]): void {
	paneLayoutController.commitPane(name);
}
function syncPaneViewport(): void {
	paneLayoutController.syncViewport();
}
function setMobileSidebar(open: boolean): void {
	paneLayoutController.setMobileSidebar(open);
}
function setMobileView(view: AppShellModel["mobile"]["view"]): void {
	paneLayoutController.setMobileView(view);
}
function setMobileImmersive(immersive: boolean): void {
	paneLayoutController.setMobileImmersive(immersive);
}
function installControllerListeners(): void {
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
		openBreadcrumbResource(breadcrumbButton.dataset.breadcrumbResource || "workspace").catch((err) => toast(errorMessage(err)));
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
export function startForgeApp(nextPublisher: ForgeViewPublisher): void {
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
function flushAgentDraftOnPageLeave(): void {
	flushAgentDraft();
}
export function stopForgeApp(): void {
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
async function handleHistoryNavigation(pathname: string): Promise<void> {
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
		if (!await loadUIState(route.workspaceId || "", navigationVersion)) return;
		if (!route.resourceId && controllerState.lastResourceId) controllerState.selectedId = controllerState.lastResourceId;
		await loadTree({ updateURL: false });
		if (isCurrentWorkspaceView(route.workspaceId || "", navigationVersion)) syncURL({ replace: true });
	} else {
		const selectionCorrected = ensureValidSelection();
		if (controllerState.selectedId === "workspace") await loadWorkspaceAgents();
		else {
			ensureSelectedProjectExpanded(false);
			await loadDetail(controllerState.selectedId);
		}
		if (!isCurrentWorkspaceView(route.workspaceId || "", navigationVersion)) return;
		if (previousSelectedId !== controllerState.selectedId) await reloadAgentRunsForSelection();
		publishViewModels();
		if (selectionCorrected) syncURL({ replace: true });
	}
}
