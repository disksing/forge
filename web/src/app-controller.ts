import type { AgentEvent, ComposerContext, ComposerModel, EventTimelineModel, ResourceMessageStatus, TimelineItem, UploadDialogModel } from "./models/chat";
import type { ToastModel } from "./models/common";
import type { CreateDialogModel, TaskTemplate } from "./models/create";
import type { DetailPanelModel } from "./models/detail";
import type { SettingsModel } from "./models/settings";
import type { AppShellModel, ShellAttentionItem, ShellDragTarget, ShellResourceItem, ShellStatusPresentation } from "./models/shell";
import type { AgentConfig, AgentProfile, DiffRecord, ResourceRecord, WorkspaceConfig, WorkspaceFileRecord, WorkspaceTree } from "./models/workspace";
import type { ArchiveResponse } from "./api/types";
import { createAgentDraftController } from "./controllers/agent-draft-controller";
import { createAgentOperationController } from "./controllers/agent-operation-controller";
import { createCreateDialogController } from "./controllers/create-dialog-controller";
import { createNotificationController, type NotificationSource } from "./controllers/notification-controller";
import { createPaneLayoutController } from "./controllers/pane-layout-controller";
import { createResourceDetailController } from "./controllers/resource-detail-controller";
import { createRouteController } from "./controllers/route-controller";
import { createSettingsController, type AgentHubData } from "./controllers/settings-controller";
import { createShellProjection } from "./controllers/shell-projection";
import { createUserSettingsController } from "./controllers/user-settings-controller";
import { ApiError } from "./api/client";
import { errorMessage } from "./runtime/errors";
import { ResourceScope } from "./runtime/resource-scope";
import { buildTimeline as buildAgentHubTimeline } from "../vendor/agenthub-event-timeline";

export interface ForgeViewPublisher {
  renderAppShell(model: AppShellModel): void;
  renderCreateDialog(model: CreateDialogModel): void;
  renderSettings(model: SettingsModel): void;
  renderUploadDialog(model: UploadDialogModel): void;
  renderComposer(model: ComposerModel): void;
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
	listDrag: ShellDragTarget | null;
	expandedPaths: Set<string>;
	preview: (WorkspaceFileRecord & { section?: string }) | null;
	diff: DiffRecord | null;
	modalEnter: string;
	taskOperationalStateKey: string;
	uploadDialog: { open: boolean; identity: number; resourceId: string; items: unknown[]; nextId: number };
	autoRefreshTimer: number | null;
	autoRefreshInFlight: boolean;
	autoRefreshVersion: number;
	treeRequestVersion: number;
	navigationVersion: number;
	detailRequestVersion: number;
	workspaceAgentsRequestVersion: number;
	previewRequestVersion: number;
	diffRequestVersion: number;
	messageStatus: ResourceMessageStatus | null;
	messageStatusKey: string;
	messageStatusRequestVersion: number;
	steeringMessageId: string;
	iconRefreshScheduled: boolean;
	agent: {
		renderTimer: number | null;
		draftPrompt: string;
		ttyDraft: string;
		ttyMultiline: boolean;
		ttyDraftKey: string;
		ttyDraftWorkspaceId: string;
		ttyDraftResourceId: string;
		ttyDraftVersion: number;
		ttyDraftResetVersion: number;
		skipTTYDraftSync: boolean;
		agentName: string;
		optionsOpen: boolean;
		historyOpen: boolean;
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
	listDrag: null as ShellDragTarget | null,
	expandedPaths: /* @__PURE__ */ new Set<string>(),
	preview: null,
	diff: null,
	modalEnter: "",
	taskOperationalStateKey: "",
	uploadDialog: {
		open: false,
		identity: 0,
			resourceId: "",
		items: [],
		nextId: 1
	},
		autoRefreshTimer: null as number | null,
	autoRefreshInFlight: false,
	autoRefreshVersion: 0,
	treeRequestVersion: 0,
	navigationVersion: 0,
	detailRequestVersion: 0,
	workspaceAgentsRequestVersion: 0,
	previewRequestVersion: 0,
	diffRequestVersion: 0,
	messageStatus: null,
	messageStatusKey: "",
	messageStatusRequestVersion: 0,
	steeringMessageId: "",
	iconRefreshScheduled: false,
	agent: {
		renderTimer: null as number | null,
		draftPrompt: "",
		ttyDraft: "",
		ttyMultiline: false,
		ttyDraftKey: "",
		ttyDraftWorkspaceId: "",
		ttyDraftResourceId: "",
		ttyDraftVersion: 0,
		ttyDraftResetVersion: 0,
		skipTTYDraftSync: false,
		agentName: "",
		optionsOpen: false,
		historyOpen: false,
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
}

const agentDraftController = createAgentDraftController({
	runtime: controllerState.agent,
	workspaceId: () => controllerState.activeWorkspaceId,
});
const clearResourceDraftAfterAccepted = agentDraftController.clearResourceAfterAccepted;
const clearAgentDraftMemory = agentDraftController.clearMemory;
const flushAgentDraft = agentDraftController.flush;
const restoreAgentDraftForResource = agentDraftController.restoreResource;
const updateAgentDraft = agentDraftController.update;

const agentOperations = createAgentOperationController(() => {
	if (!appBooted) return;
	renderTTYComposer();
	refreshIcons();
});
const paneLayoutController = createPaneLayoutController(() => renderAppShell());
const routeController = createRouteController(() => renderAppShell());
const resourceDetailController = createResourceDetailController({
	details: controllerState.details,
	context: () => ({
		workspaceId: controllerState.activeWorkspaceId,
		navigationVersion: controllerState.navigationVersion,
		selectedId: controllerState.selectedId,
		detailRequestVersion: controllerState.detailRequestVersion
	}),
	nextDetailRequestVersion: () => ++controllerState.detailRequestVersion,
	isCurrentWorkspace: (workspaceId, navigationVersion) => isCurrentWorkspaceView(workspaceId, navigationVersion),
	request: (path, init) => api(path, init),
});
const createDialogController = createCreateDialogController({
	workspaceId: () => controllerState.activeWorkspaceId,
	templates: (projectId) => controllerState.details[projectId]?.templates || [],
	request: (path, init) => api(path, init),
	publish: (model) => publisher.renderCreateDialog(model),
	toast,
	reloadTree: () => loadTree(),
	selectResource: (resourceId) => selectResource(resourceId),
	onOpen: () => {
		controllerState.modalEnter = "create";
	},
	onIconsChanged: refreshIcons,
	confirmTemplateSwitch: () => window.confirm("Discard edited template fields and switch templates?")
});
const elementById = <ElementType extends HTMLElement = HTMLElement>(id: string): ElementType | null => document.getElementById(id) as ElementType | null;
const AUTO_REFRESH_INTERVAL_MS = 5e3;
const AGENT_HIDDEN_EVENT_TYPES = /* @__PURE__ */ new Set(["session.launch-environment"]);
interface LoadTreeOptions { updateURL?: boolean; replaceURL?: boolean }
interface LoadDetailOptions { force?: boolean }
interface FetchDetailOptions {}
interface WorkspaceAgentsOptions { force?: boolean }
interface SelectResourceOptions { clearUnread?: boolean; forceDetail?: boolean }
interface FilePreviewOptions { workspaceId?: string; requestVersion?: number; rethrow?: boolean }
interface RenderOptions { skipDraftSync?: boolean }
interface UploadContext { workspaceId?: string; resourceId?: string }
interface WorkspaceIconOption { id: string; label: string; src: string; type?: string }
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
	projectTaskSummary,
	resourceRefText,
	statusModel: appShellStatusModel,
	taskOperationalState,
	taskOperationalStateKey,
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
	appearance: () => {
		const snapshot = paneLayoutController.snapshot();
		return { layout: snapshot.layout.preference, fontScales: snapshot.fontScales };
	},
	setLayoutPreference: (preference) => paneLayoutController.setLayoutPreference(preference),
	setFontScale: (column, value) => paneLayoutController.setFontScale(column, value),
	resetFontScales: () => paneLayoutController.resetFontScales(),
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
	renderAgentViews: () => { applyAgentConfig(); renderTTYComposer(); },
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
function resourceNotificationProjections(tree: WorkspaceTree | null = controllerState.tree): NotificationSource[] {
	if (!tree) return [];
	const projections: NotificationSource[] = [];
	const append = (resource: ResourceRecord | null | undefined): void => {
		const runtime = resource?.runtime;
		if (!resource || !runtime?.generationId || !runtime.completionMarker) return;
		projections.push({
			id: runtime.generationId,
			resourceId: resource.id,
			title: resource.title || resource.id,
			generationId: runtime.generationId,
			completionMarker: runtime.completionMarker,
			completionState: runtime.completionState || "completed",
			completionAt: runtime.completionAt,
			status: runtime.status
		});
	};
	append(tree.scheduler);
	for (const project of tree.projects || []) {
		append(project);
		for (const task of project.children || []) append(task);
	}
	return projections;
}
function observeCompletionProjections(items: NotificationSource[]): void {
	notificationController?.observeProjections(items);
}
function observeCompletionEvent(event: AgentEvent, source: NotificationSource | null): void {
	if (source) notificationController?.observeEvent(event, source);
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
	await refreshResourceMessageStatus(workspaceId, selectedAgentResourceId());
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
function fetchDetail(id: string, workspaceId = controllerState.activeWorkspaceId, _options: FetchDetailOptions = {}): Promise<ResourceRecord> {
	return resourceDetailController.fetch(id, workspaceId);
}
function resourceDetailSnapshot(resourceId: string): ReturnType<typeof resourceDetailController.snapshot> {
	return resourceDetailController.snapshot(resourceId);
}
function applyResourceDetail(detail: ResourceRecord): ResourceRecord | null {
	return resourceDetailController.apply(detail);
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
	const uiState = await api<{ expandedProjects?: string[]; lastResourceId?: string; projectOrder?: string[]; taskOrder?: Record<string, string[]> }>(`/api/workspaces/${workspaceId}/ui-state`);
	if (!isCurrentWorkspaceView(workspaceId, navigationVersion)) return false;
	controllerState.expandedProjects = new Set(uiState.expandedProjects || []);
	controllerState.lastResourceId = uiState.lastResourceId || "";
	controllerState.projectOrder = Array.isArray(uiState.projectOrder) ? uiState.projectOrder : [];
	controllerState.taskOrder = uiState.taskOrder && typeof uiState.taskOrder === "object" ? uiState.taskOrder : {};
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
			taskOrder: controllerState.taskOrder
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
	if (!controllerState.activeWorkspaceId || controllerState.autoRefreshInFlight || controllerState.listDrag) return;
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
		observeCompletionProjections(resourceNotificationProjections(tree));
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
			const detail = await fetchDetail(selectedId, workspaceId);
			if (!isCurrentAutoRefresh(workspaceId, navigationVersion, refreshVersion) || controllerState.selectedId !== selectedId || detailRequestVersion !== controllerState.detailRequestVersion) return;
			const previousDetail = resourceDetailSnapshot(selectedId);
			applyResourceDetail(detail);
			if (!sameJSON(previousDetail, resourceDetailSnapshot(selectedId))) changed = true;
		}
		observeCompletionProjections(resourceNotificationProjections(tree));
		if (await refreshResourceMessageStatus(workspaceId, selectedAgentResourceId())) changed = true;
		if (taskOperationalStateKey() !== controllerState.taskOperationalStateKey) changed = true;
		if (changed) publishViewModels();
	} finally {
		controllerState.autoRefreshInFlight = false;
	}
}
function publishViewModels() {
	renderAppShell();
	renderDetails();
	renderTTY();
	refreshIcons();
	renderCreateDialog();
	renderSettingsModal();
}
function renderSelectionPanels() {
	renderAppShell();
	renderDetails();
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
		projectId,
		followed: Boolean(item.attention?.followed)
	};
}
function appShellSchedulerModel(item: ResourceRecord | null | undefined): ShellResourceItem | null {
	if (!item) return null;
	const state = taskOperationalState(item);
	return {
		id: item.id || "scheduler",
		type: "scheduler",
		title: item.title || "Scheduler",
		ref: "",
		active: controllerState.selectedId === (item.id || "scheduler"),
		expanded: false,
		ariaLabel: ["Scheduler", state.label].filter(Boolean).join(". "),
		statusLabel: state.label || "Workspace Scheduler",
		status: appShellStatusModel(state.statusPresentation),
		summary: null,
		children: []
	};
}
function appShellAttentionModel(item: ResourceRecord): ShellAttentionItem {
	const state = taskOperationalState(item);
	const type = item.type === "scheduler" || item.type === "project" || item.type === "task" ? item.type : "workspace";
	const title = item.title || item.id;
	return {
		id: item.id,
		type,
		title,
		ref: type === "project" || type === "task" ? resourceRefText(item.id) : "",
		selected: controllerState.selectedId === item.id,
		activeTurn: Boolean(item.runtime?.activeTurn),
		followed: Boolean(item.attention?.followed),
		turnNumber: Number(item.runtime?.turnNumber) || 0,
		agentName: String(item.runtime?.agentName || "").trim(),
		statusLabel: state.label || (item.attention?.followed ? "Focused resource" : "Active turn"),
		status: appShellStatusModel(state.statusPresentation)
	};
}
function renderAppShell() {
	const projects = controllerState.tree ? applyCustomOrder(controllerState.tree.projects || [], controllerState.projectOrder).map((project) => appShellResourceModel(project, "project")) : [];
	const attentionList = controllerState.tree?.attentionList?.map((item) => appShellAttentionModel(item)) || [];
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
		scheduler: appShellSchedulerModel(controllerState.tree?.scheduler),
		projects,
		attentionList,
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
		onToggleAttention: (id, followed) => toggleResourceAttention(id, followed),
		onDismissAttention: (id) => dismissResourceAttention(id),
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
		taskOrder: Object.fromEntries(Object.entries(controllerState.taskOrder).map(([id, order]) => [id, Array.isArray(order) ? [...order] : []]))
	};
	if (drag.kind === "task") {
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
			resourceDetailController.reset(id);
		}
	}
	if (selectionChanged) {
		controllerState.workspaceAgentsSaving = false;
			flushAgentDraft();
			discardAgentUploadDialog();
			controllerState.preview = null;
			controllerState.diff = null;
			clearAgentDraftMemory();
		controllerState.messageStatus = null;
		controllerState.messageStatusKey = "";
		controllerState.messageStatusRequestVersion++;
		controllerState.steeringMessageId = "";
	}
	controllerState.selectedId = id;
	setMobileSidebar(false);
	ensureSelectedProjectExpanded(false);
	syncURL();
	saveUIState().catch((err) => console.warn("failed to save UI state", err));
	renderSelectionPanels();
	await Promise.all([
		id === "workspace" ? loadWorkspaceAgents({ force: Boolean(options.forceDetail) }) : loadDetail(id, { force: forceDetail }),
		refreshResourceMessageStatus(controllerState.activeWorkspaceId, id)
	]);
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
		agentProfiles: (controllerState.config?.agentProfiles || []).map((profile) => ({ key: profile.key, description: profile.description, agentName: profile.agentName })),
		agents: svelteAgentOptions(),
		onNavigate: (resourceId: string) => openBreadcrumbResource(resourceId).catch((err) => toast(errorMessage(err))),
		onCreateTask: (projectId: string) => showTaskForm(projectId),
		onArchive: (resourceId: string) => archiveResource(resourceId).catch((err) => toast(errorMessage(err))),
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
		onRefreshScheduler: async () => {
			await loadTree({ updateURL: false });
			if (controllerState.selectedId === "scheduler") await loadDetail("scheduler", { force: true });
			publishViewModels();
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
	const selected = findResource(controllerState.selectedId) || controllerState.tree.scheduler || controllerState.tree.projects[0];
	if (!selected) return {
		...base,
		resourceId: "workspace",
		resourceType: "workspace",
		resourceTitle: workspaceName()
	} as DetailPanelModel;
	const detail = controllerState.details[selected.id] || null;
	const parent = parentProject(selected.id);
	return {
		...base,
		identity: `${workspaceId}:${selected.id}:${selected.type}`,
		resourceId: selected.id,
		resourceType: selected.type === "scheduler" || selected.type === "project" || selected.type === "task" ? selected.type : "",
		resourceTitle: detail?.title || selected.title || selected.id,
		parent: parent && parent.id !== selected.id ? {
			id: parent.id,
			title: parent.title || parent.id
		} : null,
		loading: !detail,
		detail: resourceDetailView(detail)
	};
}
function resourceDetailView(detail: ResourceRecord | null): DetailPanelModel["detail"] {
	if (!detail || (detail.type !== "scheduler" && detail.type !== "project" && detail.type !== "task")) return null;
	return {
		...detail,
		type: detail.type,
		title: detail.title || detail.id,
		path: detail.path || ""
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
async function fetchCurrentTree(workspaceId = controllerState.activeWorkspaceId): Promise<WorkspaceTree | null> {
	const requestVersion = ++controllerState.treeRequestVersion;
	const navigationVersion = controllerState.navigationVersion;
	const tree = await api<WorkspaceTree>(`/api/workspaces/${workspaceId}/tree`);
	return isCurrentWorkspaceView(workspaceId, navigationVersion, requestVersion) ? tree : null;
}
async function refreshTreeAfterResourceMutation(): Promise<void> {
	if (!controllerState.activeWorkspaceId || !controllerState.tree) return;
	const tree = await fetchCurrentTree(controllerState.activeWorkspaceId);
	if (tree) controllerState.tree = tree;
}
async function toggleResourceAttention(resourceId: string, followed: boolean): Promise<void> {
	const workspaceId = controllerState.activeWorkspaceId;
	if (!workspaceId || !resourceId) return;
	await api(`/api/workspaces/${encodeURIComponent(workspaceId)}/resources/${encodeURIComponent(resourceId)}/attention`, {
		method: "PUT",
		body: JSON.stringify({ followed })
	});
	await refreshTreeAfterResourceMutation();
	publishViewModels();
}
async function dismissResourceAttention(resourceId: string): Promise<void> {
	const workspaceId = controllerState.activeWorkspaceId;
	if (!workspaceId || !resourceId) return;
	await api(`/api/workspaces/${encodeURIComponent(workspaceId)}/resources/${encodeURIComponent(resourceId)}/attention/dismiss`, { method: "POST" });
	await refreshTreeAfterResourceMutation();
	publishViewModels();
}
async function refreshResourceMessageStatus(workspaceId = controllerState.activeWorkspaceId, resourceId = selectedAgentResourceId()): Promise<boolean> {
	if (!workspaceId || !resourceId) return false;
	const requestVersion = ++controllerState.messageStatusRequestVersion;
	const key = `${workspaceId}:${resourceId}`;
	const status = await api<ResourceMessageStatus>(`/api/workspaces/${encodeURIComponent(workspaceId)}/resources/${encodeURIComponent(resourceId)}/status`);
	if (requestVersion !== controllerState.messageStatusRequestVersion || workspaceId !== controllerState.activeWorkspaceId || resourceId !== selectedAgentResourceId()) return false;
	const changed = controllerState.messageStatusKey !== key || !sameJSON(controllerState.messageStatus, status);
	controllerState.messageStatusKey = key;
	controllerState.messageStatus = status;
	return changed;
}

async function steerWaitingMessage(messageId: string): Promise<void> {
	if (!messageId || controllerState.steeringMessageId) return;
	const workspaceId = controllerState.activeWorkspaceId;
	const resourceId = selectedAgentResourceId();
	controllerState.steeringMessageId = messageId;
	renderTTYComposer();
	try {
		await api(`/api/workspaces/${encodeURIComponent(workspaceId)}/messages/${encodeURIComponent(messageId)}/steer`, { method: "POST" });
		await refreshResourceMessageStatus(workspaceId, resourceId);
		if (workspaceId === controllerState.activeWorkspaceId && resourceId === selectedAgentResourceId()) {
			publishViewModels();
			toast("Message inserted into the current turn.");
		}
	} catch (error) {
		try { await refreshResourceMessageStatus(workspaceId, resourceId); } catch (_) {}
		throw error;
	} finally {
		if (controllerState.steeringMessageId === messageId) {
			controllerState.steeringMessageId = "";
			renderTTYComposer();
		}
	}
}
async function reloadResourceForSelection(): Promise<void> {
	flushAgentDraft();
	agentOperations.reset();
	clearAgentDraftMemory();
	controllerState.messageStatus = null;
	controllerState.messageStatusKey = "";
	controllerState.messageStatusRequestVersion++;
	await refreshResourceMessageStatus();
}
function resetAgentState(): void {
	flushAgentDraft();
	discardAgentUploadDialog();
	controllerState.agent.optionsOpen = false;
	controllerState.agent.historyOpen = false;
	clearAgentDraftMemory();
	agentOperations.reset();
	controllerState.messageStatus = null;
	controllerState.messageStatusKey = "";
	controllerState.messageStatusRequestVersion++;
	controllerState.steeringMessageId = "";
	controllerState.agent.toolGroupOpen.clear();
	controllerState.agent.approvalDrafts.clear();
	controllerState.agent.renderDeferredForSelection = false;
	clearAgentRenderTimer();
}
function handleSvelteAgentEvent(workspaceId: string, resourceId: string, event: AgentEvent): void {
	if (workspaceId !== controllerState.activeWorkspaceId || resourceId !== selectedAgentResourceId() || !event) return;
	const runtime = findResource(resourceId)?.runtime || controllerState.messageStatus?.generation;
	if ([
		"turn.completed",
		"turn.failed",
		"turn.cancelled"
	].includes(event.type)) observeCompletionEvent(event, runtime?.generationId ? {
		id: runtime.generationId,
		resourceId,
		generationId: runtime.generationId,
		completionState: event.type === "turn.failed" ? "failed" : event.type === "turn.cancelled" ? "cancelled" : "completed"
	} : null);
	if ([
		"turn.completed",
		"turn.failed",
		"turn.cancelled",
		"session.state",
		"approval.requested",
		"approval.resolved"
	].includes(event.type)) refreshResourceMessageStatus().then(publishViewModels).catch((err) => console.warn("agent refresh failed", err));
}
function clearAgentRenderTimer(): void {
	if (controllerState.agent.renderTimer) window.clearTimeout(controllerState.agent.renderTimer);
	controllerState.agent.renderTimer = null;
}
function projectAgentEvents(events: AgentEvent[]): TimelineItem[] {
	const visibleEvents = (events || []).filter((event) => !AGENT_HIDDEN_EVENT_TYPES.has(event?.type));
	const items = buildAgentHubTimeline(visibleEvents) as TimelineItem[];
	const byID = new Map(visibleEvents.map((event) => [Number(event.id), event]));
	for (const item of items) {
		const event = byID.get(Number(item.key));
		const range = event?.data?.compactRange as { start?: number; end?: number } | undefined;
		if (!range) continue;
		item.compact = true;
		item.rangeStartEventId = Number(range.start) || Number(event?.id) || 0;
		item.rangeEndEventId = Number(range.end) || item.rangeStartEventId;
	}
	return items;
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
	const resourceId = selectedAgentResourceId();
	const status = controllerState.messageStatusKey === `${controllerState.activeWorkspaceId}:${resourceId}` ? controllerState.messageStatus : null;
	const configured = (controllerState.config?.agents || []).find((agent) => agent.id === status?.resolvedAgent);
	publisher.renderEventTimeline({
		identity: `${controllerState.activeWorkspaceId}:${resourceId}`,
		workspaceId: controllerState.activeWorkspaceId,
		resourceId,
		status,
		agentName: agentDisplayName(configured || selectedAgentConfig()),
		project: projectAgentEvents,
		onEvent: handleSvelteAgentEvent,
		onNotice: () => {},
		onApproval: resolveResourceApproval,
		onToast: toast,
		onIconsChanged: refreshIcons
	});
}
function resourceMutationKey(workspaceId: string, resourceId: string): string {
	return `${workspaceId || "workspace"}:${resourceId || "resource"}`;
}
let agentBindingSavingFor = "";
function renderTTYComposer(_options: RenderOptions = {}): void {
	controllerState.agent.skipTTYDraftSync = false;
	const resourceId = selectedAgentResourceId();
	if (controllerState.activeWorkspaceId && resourceId) restoreAgentDraftForResource(resourceId);
	const stopTurnPending = agentOperations.active("turn-stop") && agentOperations.key("turn-stop") === resourceId;
	const messageStatus = controllerState.messageStatusKey === `${controllerState.activeWorkspaceId}:${resourceId}` ? controllerState.messageStatus : null;
	const workspaceId = controllerState.activeWorkspaceId;
	publisher.renderComposer({
		identity: `${controllerState.activeWorkspaceId}:${resourceId}:${controllerState.agent.ttyDraftKey || ""}`,
		workspaceId: controllerState.activeWorkspaceId,
		resourceId,
		draft: controllerState.agent.ttyDraft || "",
		draftKey: controllerState.agent.ttyDraftKey || "",
		draftResetVersion: controllerState.agent.ttyDraftResetVersion || 0,
		unavailableReason: !messageStatus ? "Loading work status." : !messageStatus.acceptsMessages ? (messageStatus.archived ? "This resource is archived." : messageStatus.configError || "This resource cannot accept messages.") : "",
		sending: agentOperations.isSending(resourceMutationKey(controllerState.activeWorkspaceId, resourceId)),
		canEndTurn: Boolean(stopTurnPending || ["running", "waiting_approval"].includes(String(messageStatus?.session?.state || ""))),
		endingTurn: stopTurnPending,
		waitingMessages: messageStatus?.waitingMessages || [],
		canSteerWaiting: Boolean(messageStatus?.canSteerWaiting),
		steeringMessageId: controllerState.steeringMessageId,
		agentBinding: resourceId === "workspace"
			? controllerState.tree?.agentBinding || { kind: "profile", name: "default" }
			: findResource(resourceId)?.agentBinding || { kind: "profile", name: "default" },
		agentProfiles: (controllerState.config?.agentProfiles || []).map((profile) => ({ key: profile.key, description: profile.description, agentName: profile.agentName })),
		agents: svelteAgentOptions(),
		bindingSaving: agentBindingSavingFor === resourceId,
		onDraft: (text, draftContext) => updateAgentDraftFromSvelte(text, draftContext),
		onSend: submitTTYInput,
		onOpenUpload: openAgentUploadDialog,
		onEndTurn: () => stopAgentTurn().catch((err) => toast(err.message)),
		onSteerWaiting: steerWaitingMessage,
		onSaveAgentBinding: async (binding) => {
			if (resourceId !== selectedAgentResourceId()) return;
			agentBindingSavingFor = resourceId;
			renderTTYComposer();
			try {
				await api(`/api/workspaces/${encodeURIComponent(workspaceId)}/resources/${encodeURIComponent(resourceId)}/agent-binding`, {
					method: "PUT", body: JSON.stringify(binding)
				});
				await loadTree({ updateURL: false });
				if (resourceId !== "workspace") await loadDetail(resourceId, { force: true });
				publishViewModels();
				toast("Resource agent binding saved.");
			} catch (err) {
				toast(errorMessage(err));
			} finally {
				agentBindingSavingFor = "";
				renderTTYComposer();
			}
		},
		onIconsChanged: refreshIcons
	});
}
function agentDisplayName(agent: AgentConfig | null | undefined): string {
	return agent?.name || agent?.id || "Agent";
}
function renderSettingsModal(): void {
	settingsController.render();
}
function updateAgentDraftFromSvelte(text: string, context: ComposerContext): void {
	if (!context || context.workspaceId !== controllerState.activeWorkspaceId || context.resourceId !== selectedAgentResourceId() || context.draftKey !== controllerState.agent.ttyDraftKey) return;
	updateAgentDraft(text);
}
function openAgentUploadDialog(): void {
	const resourceId = selectedAgentResourceId();
	if (!resourceId || controllerState.messageStatus?.archived) {
		toast("Select an active resource before uploading files.");
		return;
	}
	const input = elementById<HTMLInputElement>("ttyInput");
	if (input) updateAgentDraft(input.value);
	controllerState.modalEnter = "upload";
	controllerState.uploadDialog = {
		open: true,
		identity: ++uploadDialogIdentity,
		resourceId,
		items: [],
		nextId: 1
	};
	renderAgentUploadDialog();
}
function closeAgentUploadDialog(paths: string[] = [], context: UploadContext = {}): void {
	if (!controllerState.uploadDialog.open) return;
	const sameResource = controllerState.uploadDialog.resourceId === selectedAgentResourceId();
	const sameWorkspace = !context.workspaceId || context.workspaceId === controllerState.activeWorkspaceId;
	const shouldSkipDraftSync = paths.length > 0 && sameWorkspace && sameResource;
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
		resourceId: "",
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
		identity: `${dialog.identity || 0}:${controllerState.activeWorkspaceId}:${dialog.resourceId || ""}`,
		workspaceId: controllerState.activeWorkspaceId,
		resourceId: dialog.resourceId || "",
		onDone: closeAgentUploadDialog,
		onIconsChanged: refreshIcons
	});
}
async function stopAgentTurn(): Promise<void> {
	const workspaceId = controllerState.activeWorkspaceId;
	const resourceId = selectedAgentResourceId();
	const generationId = controllerState.messageStatus?.generation?.generationId || "";
	const operation = agentOperations.begin("turn-stop", resourceId);
	if (!operation) return;
	try {
		const query = generationId ? `?generationId=${encodeURIComponent(generationId)}` : "";
		await api(`/api/workspaces/${encodeURIComponent(workspaceId)}/resources/${encodeURIComponent(resourceId)}/turn/end${query}`, { method: "POST" });
		await refreshResourceMessageStatus(workspaceId, resourceId);
		publishViewModels();
	} finally {
		agentOperations.finish(operation);
	}
}
async function resolveResourceApproval(generationId: string, requestId: string, reply: Parameters<EventTimelineModel["onApproval"]>[2]): Promise<void> {
	const workspaceId = controllerState.activeWorkspaceId;
	const resourceId = selectedAgentResourceId();
	await api(`/api/workspaces/${encodeURIComponent(workspaceId)}/resources/${encodeURIComponent(resourceId)}/approval?generationId=${encodeURIComponent(generationId)}`, {
		method: "POST", body: JSON.stringify({ requestId, ...reply })
	});
	await refreshResourceMessageStatus(workspaceId, resourceId);
	publishViewModels();
}
async function submitTTYInput(rawText: string, context: ComposerContext): Promise<{ accepted: boolean; clear: boolean }> {
	if (!rawText.trim() || context.workspaceId !== controllerState.activeWorkspaceId || context.resourceId !== selectedAgentResourceId() || context.draftKey !== controllerState.agent.ttyDraftKey) return { accepted: false, clear: false };
	const key = resourceMutationKey(context.workspaceId, context.resourceId);
	if (!agentOperations.startSending(key)) return { accepted: false, clear: false };
	const version = controllerState.agent.ttyDraftVersion;
	try {
		await api(`/api/workspaces/${encodeURIComponent(context.workspaceId)}/resources/${encodeURIComponent(context.resourceId)}/messages`, {
			method: "POST", body: JSON.stringify({ text: rawText, role: "user", sender: { name: currentUserName() } })
		});
		const accepted = true;
		const clear = clearResourceDraftAfterAccepted({ workspaceId: context.workspaceId, resourceId: context.resourceId, key: context.draftKey, text: rawText, version });
		if (clear) controllerState.agent.ttyDraftResetVersion++;
		await Promise.all([refreshResourceMessageStatus(context.workspaceId, context.resourceId), refreshTreeAfterResourceMutation()]);
		publishViewModels();
		return { accepted, clear };
	} finally {
		agentOperations.stopSending(key);
	}
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
	const result = await api<ArchiveResponse>(`/api/workspaces/${controllerState.activeWorkspaceId}/archive`, {
		method: "POST",
		body: JSON.stringify({ resourceId })
	});
	const warnings = result.warnings || [];
	toast(warnings.length > 0
		? [`Archived.`, ...warnings.map((warning) => `Warning: ${warning.message}`)].join("\n")
		: "Archived.");
	controllerState.selectedId = "workspace";
	await loadTree();
}
function findResource(id: string): ResourceRecord | null {
	if (!controllerState.tree) return null;
	if (controllerState.tree.scheduler?.id === id) return controllerState.tree.scheduler;
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
	else if (event.key === "Escape" && (controllerState.agent.optionsOpen || controllerState.agent.historyOpen)) {
		controllerState.agent.optionsOpen = false;
		controllerState.agent.historyOpen = false;
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
	const outsideAgentPanelMenu = (controllerState.agent.optionsOpen || controllerState.agent.historyOpen) && target && !target.closest(".tty-composer");
	if (outsideAgentPanelMenu) {
		controllerState.agent.optionsOpen = false;
		controllerState.agent.historyOpen = false;
		renderTTYComposer();
		refreshIcons();
	}
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
		resourceProjections: () => resourceNotificationProjections(),
		hasTree: () => Boolean(controllerState.tree),
		findResource,
		selectResource,
		notificationsSettingsVisible: () => settingsController.isOpenTab("notifications"),
		renderSettings: renderSettingsModal,
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
		resourceDetailController.reset(controllerState.selectedId);
		delete controllerState.details[controllerState.selectedId];
	}
	controllerState.preview = null;
	controllerState.diff = null;
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
		if (previousSelectedId !== controllerState.selectedId) await reloadResourceForSelection();
		publishViewModels();
		if (selectionCorrected) syncURL({ replace: true });
	}
}
