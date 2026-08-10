import { beforeEach, describe, expect, it } from "vitest";

import { createAgentDraftStore } from "../../src/controllers/agent-draft-store";
import { MemoryStorage } from "../fixtures/memory-storage";

describe("AgentDraftStore", () => {
	let storage: MemoryStorage;
	beforeEach(() => { storage = new MemoryStorage(); });

	it("isolates drafts by Workspace and Session while retaining Resource metadata", () => {
		const store = createAgentDraftStore({ storage, now: () => 100 });
		const alpha = store.keyForRun({ id: "session-a" }, "workspace-a");
		const beta = store.keyForRun({ id: "session-a" }, "workspace-b");
		const otherSession = store.keyForRun({ id: "session-b" }, "workspace-a");

		store.write(alpha, "alpha", { workspaceId: "workspace-a", resourceId: "task1", runId: "run-a", sessionId: "session-a" });
		store.write(beta, "beta", { workspaceId: "workspace-b", resourceId: "task1", runId: "run-b", sessionId: "session-a" });
		store.write(otherSession, "other", { workspaceId: "workspace-a", resourceId: "task2", runId: "run-c", sessionId: "session-b" });

		expect(store.read(alpha)).toBe("alpha");
		expect(store.read(beta)).toBe("beta");
		expect(store.read(otherSession)).toBe("other");
	});

	it("evicts only old or excess orphan drafts in the requested Resource scope", () => {
		let now = 1_000;
		const store = createAgentDraftStore({ storage, now: () => now, maxAgeMs: 50, maxOrphanCount: 1 });
		const first = store.keyForRun({ id: "first" }, "workspace-a");
		const protectedKey = store.keyForRun({ id: "protected" }, "workspace-a");
		const otherResource = store.keyForRun({ id: "other" }, "workspace-a");
		store.write(first, "first", { workspaceId: "workspace-a", resourceId: "task1", runId: "first", sessionId: "first" });
		now += 100;
		store.write(protectedKey, "protected", { workspaceId: "workspace-a", resourceId: "task1", runId: "protected", sessionId: "protected" });
		store.write(otherResource, "other", { workspaceId: "workspace-a", resourceId: "task2", runId: "other", sessionId: "other" });

		store.prune("workspace-a", "task1", new Set([protectedKey]));

		expect(store.read(first)).toBe("");
		expect(store.read(protectedKey)).toBe("protected");
		expect(store.read(otherResource)).toBe("other");
	});
});
