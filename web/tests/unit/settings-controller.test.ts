import { describe, expect, it } from "vitest";

import { createSettingsController, configWithAgentHubCatalog } from "../../src/controllers/settings-controller";
import type { SettingsControllerDependencies } from "../../src/controllers/settings-controller";
import type { SettingsModel } from "../../src/components/models";
import { createSettingsDraft } from "../../src/components/settings-draft";
import type { PUASettingsConfig } from "../../src/controllers/settings-controller";

describe("SettingsController", () => {
	function settingsDependencies(activeWorkspaceId: string, base: PUASettingsConfig, publish: (model: SettingsModel) => void): SettingsControllerDependencies {
		return {
			config: () => base,
			setConfig: () => undefined,
			activeWorkspaceId: () => activeWorkspaceId,
			setActiveWorkspaceId: () => undefined,
			selectWorkspaceResource: () => undefined,
			request: async <T>(path: string): Promise<T> => {
				if (path === "/api/workspaces") return base as T;
				if (path === "/api/settings/agenthub") return {} as T;
				throw new Error(`Unexpected request: ${path}`);
			},
			publish,
			agentOptions: () => [],
			workspaceIcons: [],
			userName: () => "User",
			saveUser: (name: string) => name,
			appearance: () => ({ layout: "auto" as const, fontScales: { sidebar: 1, details: 1, chat: 1 } }),
			setLayoutPreference: () => undefined,
			setFontScale: () => undefined,
			resetFontScales: () => undefined,
			notificationPreferences: () => ({ browser: false, sound: false, permission: "default" as const, permissionError: "", soundError: "" }),
			setBrowserNotifications: () => undefined,
			setCompletionSound: () => undefined,
			flushDraft: () => undefined,
			resetAgentState: () => undefined,
			reloadWorkspaceContext: async () => undefined,
			clearWorkspaceContext: () => undefined,
			renderWorkspace: () => undefined,
			renderAgentViews: () => undefined,
			toast: () => undefined,
			onIconsChanged: () => undefined,
		};
	}

	it("marks the routed Workspace active even when the persisted fallback points elsewhere", async () => {
		const published: SettingsModel[] = [];
		const config: PUASettingsConfig = {
			activeId: "workspace-c",
			workspaces: [
				{ id: "workspace-a", name: "Workspace A", path: "/tmp/a" },
				{ id: "workspace-c", name: "Workspace C", path: "/tmp/c" },
			],
			agents: [],
			agentProfiles: [],
		};
		const controller = createSettingsController(settingsDependencies("workspace-a", config, (model) => published.push(model)));

		await controller.open();

		expect(published.at(-1)?.activeWorkspaceId).toBe("workspace-a");
	});

	it("keeps the routed Workspace marker aligned when route and persisted fallback match", async () => {
		const published: SettingsModel[] = [];
		const config: PUASettingsConfig = {
			activeId: "workspace-a",
			workspaces: [{ id: "workspace-a", name: "Workspace A", path: "/tmp/a" }],
			agents: [],
			agentProfiles: [],
		};
		const controller = createSettingsController(settingsDependencies("workspace-a", config, (model) => published.push(model)));

		await controller.open();

		expect(published.at(-1)?.activeWorkspaceId).toBe("workspace-a");
	});

	it("joins AgentHub availability and profiles into the PUA configuration without mutating the base", () => {
		const base = {
			activeId: "alpha",
			workspaces: [],
			agents: [],
			agentProfiles: []
		};
		const merged = configWithAgentHubCatalog(base, {
			catalog: {
				providers: [{ id: "openai", name: "OpenAI" }],
				agents: [
					{ name: "Codex", providerId: "openai", available: true },
					{ name: "Offline", providerId: "openai", available: false, unavailableReason: "offline" }
				]
			},
			config: { agentProfiles: [{ key: "default", description: "", agentName: "Codex" }] }
		});

		expect(merged.agents).toEqual([
			{ id: "Codex", name: "Codex", providerId: "openai", available: true },
			{ id: "Offline", name: "Offline", providerId: "openai", available: false, unavailableReason: "offline" }
		]);
		expect(merged.agentHubProviders).toEqual([{ id: "openai", name: "OpenAI" }]);
		expect(merged.agentProfiles).toEqual([{ key: "default", description: "", agentName: "Codex" }]);
		expect(base.agents).toEqual([]);
	});

	it("saves workspace names through the workspace endpoint and refreshes the published model", async () => {
		const published: SettingsModel[] = [];
		const requests: Array<{ path: string; body: unknown }> = [];
		const config: PUASettingsConfig = {
			activeId: "workspace-a",
			workspaces: [{ id: "workspace-a", name: "a", path: "/tmp/a" }],
			agents: [],
			agentProfiles: [],
		};
		let current = config;
		const dependencies = settingsDependencies("workspace-a", config, (model) => published.push(model));
		dependencies.config = () => current;
		dependencies.setConfig = (next) => { current = next; };
		const baseRequest = dependencies.request;
		dependencies.request = async <T>(path: string, init?: RequestInit): Promise<T> => {
			if (init?.method === "PUT" && path === "/api/workspaces/workspace-a") {
				requests.push({ path, body: JSON.parse(String(init.body)) });
				return { ...current.workspaces[0], name: "Named Workspace" } as T;
			}
			return baseRequest<T>(path);
		};
		let workspaceRenders = 0;
		dependencies.renderWorkspace = () => { workspaceRenders++; };
		const toasts: string[] = [];
		dependencies.toast = (message) => toasts.push(message);
		const controller = createSettingsController(dependencies);

		await controller.open();
		const model = published.at(-1)!;
		await model.onSaveWorkspaceName("workspace-a", "Named Workspace", createSettingsDraft(model));

		expect(requests).toEqual([{ path: "/api/workspaces/workspace-a", body: { name: "Named Workspace" } }]);
		expect(current.workspaces[0]?.name).toBe("Named Workspace");
		expect(published.at(-1)?.workspaces[0]?.name).toBe("Named Workspace");
		expect(workspaceRenders).toBeGreaterThan(0);
		expect(toasts).toContain("Workspace name saved.");
	});
});
