import { describe, expect, it } from "vitest";

import { configWithAgentHubCatalog } from "../../src/controllers/settings-controller";

describe("SettingsController", () => {
	it("joins AgentHub availability and profiles into the Forge configuration without mutating the base", () => {
		const base = {
			activeId: "alpha",
			workspaces: [],
			agents: [{ id: "codex", name: "Codex", available: true }],
			agentProfiles: []
		};
		const merged = configWithAgentHubCatalog(base, {
			catalog: {
				providers: [{ id: "openai", name: "OpenAI" }],
				agents: [{ name: "Codex", available: false, unavailableReason: "offline" }]
			},
			config: { agentProfiles: [{ key: "default", description: "", agentName: "Codex" }] }
		});

		expect(merged.agents[0]).toMatchObject({ id: "codex", name: "Codex", available: false, unavailableReason: "offline" });
		expect(merged.agentHubProviders).toEqual([{ id: "openai", name: "OpenAI" }]);
		expect(merged.agentProfiles).toEqual([{ key: "default", description: "", agentName: "Codex" }]);
		expect(base.agents[0]?.available).toBe(true);
	});
});
