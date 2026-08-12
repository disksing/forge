import { describe, expect, it, vi } from "vitest";

import { createAgentOperationController } from "../../src/controllers/agent-operation-controller";
import { createAgentSessionController, type AgentRunRecord } from "../../src/controllers/agent-session-controller";

describe("AgentSessionController", () => {
	it("keeps Session start pending until the matching result settles and deduplicates a second start", async () => {
		const operations = createAgentOperationController(() => undefined);
		let activeRunId = "";
		let resolve!: (value: { run: AgentRunRecord }) => void;
		const request = vi.fn(() => new Promise<{ run: AgentRunRecord }>((done) => { resolve = done; }));
		const reloadRuns = vi.fn(async () => undefined);
		const refreshTree = vi.fn(async () => undefined);
		const toast = vi.fn();
		const controller = createAgentSessionController({
			operations,
			workspaceId: () => "alpha",
			selectedResource: () => ({ id: "task1", type: "task", title: "Task", path: "/tmp/task" }),
			taskDetail: () => null,
			currentRun: () => null,
			runs: () => [],
			activeRunId: () => activeRunId,
			selectedAgent: () => ({ id: "Codex" }),
			enabledAgents: () => [{ id: "Codex" }],
			setAgentName: () => undefined,
			setActiveRun: (id) => { activeRunId = id; },
			setHistoryOpen: () => undefined,
			closeAgentMenus: () => undefined,
			resetDraft: () => undefined,
			flushDraft: () => undefined,
			restoreDraft: () => undefined,
			currentDraft: () => ({ key: "draft", text: "", version: 0 }),
			updateDraft: () => undefined,
			clearDraftAfterAccepted: () => true,
			bumpDraftResetVersion: () => undefined,
			userName: () => "User",
			workspaceName: () => "Workspace",
			defaultCwd: () => "/tmp/task",
			isLive: () => true,
			isTurnInterruptible: () => true,
			mutate: (action) => action(),
			request: async <T>() => await request() as T,
			reloadRuns,
			refreshTree,
			fetchDetail: async () => ({ id: "task1", type: "task", title: "Task", path: "/tmp/task" }),
			applyDetail: () => undefined,
			refreshInputProjection: async () => undefined,
			publish: () => undefined,
			renderAgent: () => undefined,
			renderComposer: () => undefined,
			refreshIcons: () => undefined,
			toast
		});

		const first = controller.start();
		await controller.start();
		expect(request).toHaveBeenCalledOnce();
		expect(operations.active("session-start")).toBe(true);

		resolve({ run: { id: "run-1", status: "idle", resourceId: "task1" } });
		await first;

		expect(activeRunId).toBe("run-1");
		expect(reloadRuns).toHaveBeenCalledOnce();
		expect(refreshTree).toHaveBeenCalledOnce();
		expect(operations.active("session-start")).toBe(false);
		expect(toast).toHaveBeenCalledWith("Agent session started.");
	});
});
