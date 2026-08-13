import { beforeEach, describe, expect, it } from "vitest";

import { createAgentDraftStore } from "../../src/controllers/agent-draft-store";
import { MemoryStorage } from "../fixtures/memory-storage";

describe("AgentDraftStore", () => {
	let storage: MemoryStorage;
	beforeEach(() => { storage = new MemoryStorage(); });

	it("isolates drafts by Workspace and Resource", () => {
		const store = createAgentDraftStore({ storage, now: () => 100 });
		const alpha = store.keyForResource("workspace-a", "task1");
		const beta = store.keyForResource("workspace-b", "task1");
		const otherResource = store.keyForResource("workspace-a", "task2");

		store.write(alpha, "alpha", { workspaceId: "workspace-a", resourceId: "task1", generationId: "gen-a" });
		store.write(beta, "beta", { workspaceId: "workspace-b", resourceId: "task1", generationId: "gen-b" });
		store.write(otherResource, "other", { workspaceId: "workspace-a", resourceId: "task2" });

		expect(store.read(alpha)).toBe("alpha");
		expect(store.read(beta)).toBe("beta");
		expect(store.read(otherResource)).toBe("other");
	});

	it("evicts only old or excess orphan drafts in the requested Resource scope", () => {
		let now = 1_000;
		const store = createAgentDraftStore({ storage, now: () => now, maxAgeMs: 50, maxOrphanCount: 1 });
		const first = store.keyForResource("workspace-a", "task1");
		store.write(first, "first", { workspaceId: "workspace-a", resourceId: "task1" });
		now += 100;
		const protectedKey = store.keyForResource("workspace-a", "task1");
		const otherResource = store.keyForResource("workspace-a", "task2");
		store.write(protectedKey, "protected", { workspaceId: "workspace-a", resourceId: "task1" });
		store.write(otherResource, "other", { workspaceId: "workspace-a", resourceId: "task2" });

		store.prune("workspace-a", "task1", new Set([protectedKey]));

		expect(store.read(first)).toBe("protected");
		expect(store.read(protectedKey)).toBe("protected");
		expect(store.read(otherResource)).toBe("other");
	});
});
