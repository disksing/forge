import type { AgentOption, NotificationPreferences, SettingsDraft, SettingsModel, WorkspaceOption } from "../components/models";
import type { AgentConfig, AgentProfile, WorkspaceConfig } from "../models/workspace";

export type SettingsAgent = AgentConfig;
export type SettingsProfile = AgentProfile;

export type SettingsWorkspace = WorkspaceOption;

export type ForgeSettingsConfig = WorkspaceConfig;

export interface AgentHubData {
	configuredEndpoint?: string;
	connected?: boolean;
	compatible?: boolean;
	error?: string;
	status?: { apiVersion?: string; version?: string; capabilities?: string[] };
	catalog?: {
		providers?: Array<{ id: string; name?: string }>;
		agents?: Array<{ name: string; providerId?: string; available?: boolean; unavailableReason?: string }>;
	};
	config?: {
		agentProfiles?: SettingsProfile[];
		resourceDefaults?: { workspace?: string; project?: string; task?: string };
	};
}

interface SettingsData {
	workspaces?: SettingsWorkspace[];
	activeId?: string;
	agents?: SettingsAgent[];
	agentProfiles?: SettingsProfile[];
	agentHub?: AgentHubData;
}

export interface SettingsControllerDependencies {
	config(): ForgeSettingsConfig;
	setConfig(config: ForgeSettingsConfig): void;
	activeWorkspaceId(): string;
	setActiveWorkspaceId(id: string): void;
	selectWorkspaceResource(): void;
	request<T>(path: string, init?: RequestInit): Promise<T>;
	publish(model: SettingsModel): void;
	agentOptions(): AgentOption[];
	workspaceIcons: SettingsModel["workspaceIcons"];
	userName(): string;
	saveUser(name: string): string;
	notificationPreferences(): NotificationPreferences;
	setBrowserNotifications(enabled: boolean): void;
	setCompletionSound(enabled: boolean): void;
	flushDraft(): void;
	resetAgentState(): void;
	reloadWorkspaceContext(): Promise<void>;
	clearWorkspaceContext(): void;
	renderWorkspace(): void;
	renderAgentViews(): void;
	toast(message: string): void;
	onIconsChanged(): void;
}

export function configWithAgentHubCatalog(base: ForgeSettingsConfig, agentHub: AgentHubData): ForgeSettingsConfig {
	const catalog = agentHub?.catalog || {};
	// AgentHub is the source of truth for Agent definitions. Forge's workspace
	// settings endpoint only contains workspaces and profile routes, so there
	// is no local agent list to merge against.
	const agents = (catalog.agents || []).map((agent) => ({
		...agent,
		id: agent.name
	}));
	return {
		...base,
		agents,
		agentHubProviders: catalog.providers || [],
		agentProfiles: agentHub.config?.agentProfiles || []
	};
}

export function createSettingsController(dependencies: SettingsControllerDependencies) {
	let identity = 0;
	const state: {
		open: boolean;
		identity: number;
		dataVersion: number;
		tab: SettingsDraft["tab"];
		data: SettingsData | null;
		agentDirty: boolean;
		workspacePath: string;
		createWorkspace: boolean;
		workspaceIconSavingId: string;
	} = {
		open: false,
		identity: 0,
		dataVersion: 0,
		tab: "workspace",
		data: null,
		agentDirty: false,
		workspacePath: "",
		createWorkspace: false,
		workspaceIconSavingId: ""
	};

	function render(): void {
		const config = dependencies.config();
		const data: SettingsData = state.data || {
			workspaces: config.workspaces,
			activeId: dependencies.activeWorkspaceId(),
			agents: config.agents,
			agentProfiles: config.agentProfiles
		};
		const hub = data.agentHub || {};
		const status = hub.status || {};
		const catalog = hub.catalog || {};
		dependencies.publish({
			open: state.open,
			identity: `${state.identity}`,
			dataVersion: state.dataVersion,
			initialTab: state.tab,
			workspaces: data.workspaces || [],
			activeWorkspaceId: data.activeId || dependencies.activeWorkspaceId(),
			workspaceIcons: dependencies.workspaceIcons,
			workspaceIconSavingId: state.workspaceIconSavingId,
			userName: dependencies.userName(),
			agentHub: {
				configuredEndpoint: hub.configuredEndpoint || "http://127.0.0.1:4646",
				connected: Boolean(hub.connected),
				compatible: Boolean(hub.compatible),
				error: hub.error || "",
				apiVersion: status.apiVersion || "",
				version: status.version || "",
				capabilities: status.capabilities || [],
				providers: catalog.providers || [],
				agents: catalog.agents || [],
				resourceDefaults: {
					workspace: hub.config?.resourceDefaults?.workspace || "default",
					project: hub.config?.resourceDefaults?.project || "default",
					task: hub.config?.resourceDefaults?.task || "default"
				}
			},
			profiles: (data.agentProfiles || []).map((profile) => ({ ...profile })),
			agents: dependencies.agentOptions(),
			notifications: dependencies.notificationPreferences(),
			onClose: close,
			onAddWorkspace: async (draft) => { syncDraft(draft); await addWorkspace(); },
			onRemoveWorkspace: async (id, draft) => { syncDraft(draft); await removeWorkspace(id); },
			onWorkspaceIcon: async (id, icon, draft) => { syncDraft(draft); await updateWorkspaceIcon(id, icon); },
			onSaveUser: async (name) => {
				const normalized = dependencies.saveUser(name);
				dependencies.toast(normalized === "User" ? "User name reset to User." : `User name saved as ${normalized}.`);
				return normalized;
			},
			onSaveAgentHub: async (draft) => { syncDraft(draft); await saveAgentSettings(); },
			onBrowserNotifications: dependencies.setBrowserNotifications,
			onCompletionSound: dependencies.setCompletionSound,
			onToast: dependencies.toast,
			onIconsChanged: dependencies.onIconsChanged
		});
	}

	async function open(tab: SettingsDraft["tab"] = "workspace"): Promise<void> {
		state.open = true;
		state.identity = ++identity;
		state.tab = tab;
		state.agentDirty = false;
		state.workspaceIconSavingId = "";
		render();
		await refresh();
		render();
	}

	function close(dirty = state.agentDirty): void {
		if (state.open && dirty && !window.confirm("Discard unsaved agent settings changes?")) return;
		state.open = false;
		state.identity = ++identity;
		state.agentDirty = false;
		render();
	}

	async function refresh(): Promise<void> {
		const [base, agentHub] = await Promise.all([
			dependencies.request<ForgeSettingsConfig>("/api/workspaces"),
			dependencies.request<AgentHubData>("/api/settings/agenthub")
		]);
		state.data = { ...base, agentHub };
		state.dataVersion++;
	}

	function syncDraft(draft: SettingsDraft): void {
		if (!draft || !state.open) return;
		state.tab = draft.tab || state.tab;
		state.workspacePath = String(draft.workspacePath || "");
		state.createWorkspace = Boolean(draft.createWorkspace);
		state.agentDirty = Boolean(draft.dirty);
		state.data = {
			...state.data,
			agentHub: {
				...state.data?.agentHub,
				configuredEndpoint: String(draft.endpoint || ""),
				config: { ...state.data?.agentHub?.config, resourceDefaults: { ...draft.resourceDefaults } }
			},
			agentProfiles: (draft.profiles || []).map((profile) => ({ ...profile }))
		};
	}

	function snapshotAgentDraft() {
		return { agents: state.data?.agents || [], agentProfiles: state.data?.agentProfiles || [] };
	}

	async function refreshPreservingAgentDraft(): Promise<void> {
		const draft = state.agentDirty ? snapshotAgentDraft() : null;
		await refresh();
		if (draft) state.data = { ...state.data, ...draft };
	}

	async function addWorkspace(): Promise<void> {
		const path = state.workspacePath.trim();
		if (!path) throw new Error("Workspace path is required.");
		const created = state.createWorkspace;
		const workspace = await dependencies.request<SettingsWorkspace>("/api/workspaces", {
			method: "POST", body: JSON.stringify({ path, create: created })
		});
		dependencies.flushDraft();
		state.workspacePath = "";
		state.createWorkspace = false;
		dependencies.setConfig(await dependencies.request("/api/workspaces"));
		dependencies.setActiveWorkspaceId(workspace.id);
		dependencies.resetAgentState();
		dependencies.renderWorkspace();
		await dependencies.reloadWorkspaceContext();
		await refreshPreservingAgentDraft();
		render();
		dependencies.toast(created ? "Workspace created." : "Workspace added.");
	}

	async function removeWorkspace(id: string): Promise<void> {
		if (!id) return;
		dependencies.flushDraft();
		await dependencies.request(`/api/workspaces/${encodeURIComponent(id)}`, { method: "DELETE" });
		const config = await dependencies.request<ForgeSettingsConfig>("/api/workspaces");
		dependencies.setConfig(config);
		if (dependencies.activeWorkspaceId() === id) {
			const nextId = config.activeId || config.workspaces[0]?.id || "";
			dependencies.setActiveWorkspaceId(nextId);
			dependencies.selectWorkspaceResource();
			dependencies.resetAgentState();
			if (nextId) await dependencies.reloadWorkspaceContext();
			else dependencies.clearWorkspaceContext();
		} else dependencies.renderWorkspace();
		await refreshPreservingAgentDraft();
		render();
		dependencies.toast("Workspace removed from Forge GUI.");
	}

	async function updateWorkspaceIcon(id: string, iconId: string): Promise<void> {
		if (!id || state.workspaceIconSavingId) return;
		state.workspaceIconSavingId = id;
		render();
		try {
			const workspace = await dependencies.request<SettingsWorkspace>(`/api/workspaces/${encodeURIComponent(id)}`, {
				method: "PUT", body: JSON.stringify({ icon: iconId || "" })
			});
			const replace = (items: SettingsWorkspace[] = []) => items.map((item) => item.id === workspace.id ? workspace : item);
			dependencies.setConfig({ ...dependencies.config(), workspaces: replace(dependencies.config().workspaces) });
			state.data = { ...state.data, workspaces: replace(state.data?.workspaces) };
			dependencies.renderWorkspace();
			dependencies.toast(iconId ? "Workspace icon saved." : "Workspace icon reset to the Forge default.");
		} finally {
			state.workspaceIconSavingId = "";
			render();
		}
	}

	async function saveAgentSettings(): Promise<void> {
		await dependencies.request("/api/settings/agenthub", {
			method: "PUT",
			body: JSON.stringify({
				endpoint: state.data?.agentHub?.configuredEndpoint || "http://127.0.0.1:4646",
				agentProfiles: (state.data?.agentProfiles || []).map((profile) => ({ ...profile })),
				resourceDefaults: state.data?.agentHub?.config?.resourceDefaults || { workspace: "default", project: "default", task: "default" }
			})
		});
		await refresh();
		dependencies.setConfig(configWithAgentHubCatalog(await dependencies.request("/api/workspaces"), state.data?.agentHub || {}));
		state.agentDirty = false;
		dependencies.renderAgentViews();
		render();
		dependencies.onIconsChanged();
		dependencies.toast("AgentHub settings saved.");
	}

	return {
		open,
		close,
		render,
		refresh,
		isOpenTab: (tab: SettingsDraft["tab"]) => state.open && state.tab === tab,
		providers: () => state.data?.agentHub?.catalog?.providers || [],
		profiles: () => state.data?.agentProfiles || [],
		withAgentHubCatalog: configWithAgentHubCatalog
	};
}
