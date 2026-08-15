import { beforeEach, describe, expect, it, vi } from "vitest";

import { createAgentDraftController, type AgentDraftRuntime } from "../../src/controllers/agent-draft-controller";
import { MemoryStorage } from "../fixtures/memory-storage";

describe("agent draft controller", () => {
	beforeEach(() => vi.stubGlobal("localStorage", new MemoryStorage()));

	it("restores a resource draft and clears only an unchanged accepted draft", () => {
		const runtime: AgentDraftRuntime = { chatDraft: "", chatMultiline: false, chatDraftKey: "", chatDraftWorkspaceId: "", chatDraftResourceId: "", chatDraftVersion: 0 };
		const controller = createAgentDraftController({ runtime, workspaceId: () => "workspace-a" });
		controller.restoreResource("task1");
		controller.update("first\nsecond");
		const accepted = { workspaceId: "workspace-a", resourceId: "task1", key: runtime.chatDraftKey, text: runtime.chatDraft, version: runtime.chatDraftVersion };
		expect(runtime.chatMultiline).toBe(true);
		expect(controller.clearResourceAfterAccepted({ ...accepted, version: accepted.version - 1 })).toBe(false);
		expect(controller.clearResourceAfterAccepted(accepted)).toBe(true);
		expect(runtime.chatDraft).toBe("");
	});
});
