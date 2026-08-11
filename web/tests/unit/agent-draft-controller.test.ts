import { beforeEach, describe, expect, it, vi } from "vitest";

import { createAgentDraftController, type AgentDraftRuntime } from "../../src/controllers/agent-draft-controller";
import type { AgentRunRecord } from "../../src/controllers/agent-session-controller";
import { MemoryStorage } from "../fixtures/memory-storage";

describe("agent draft controller", () => {
  beforeEach(() => vi.stubGlobal("localStorage", new MemoryStorage()));

  it("restores persisted Session drafts and clears only an unchanged accepted draft", () => {
    const run: AgentRunRecord = { id: "run-a", resourceId: "task1", status: "idle", agentHubSessionId: "session-a" };
    const runtime: AgentDraftRuntime = { ttyDraft: "", ttyMultiline: false, ttyDraftKey: "", ttyDraftWorkspaceId: "", ttyDraftResourceId: "", ttyDraftRunId: "", ttyDraftVersion: 0 };
    const controller = createAgentDraftController({ runtime, workspaceId: () => "workspace-a", runs: () => [run], currentRun: () => run });
    controller.restore(run);
    controller.update("first\nsecond");
    const accepted = { workspaceId: "workspace-a", runId: "run-a", key: runtime.ttyDraftKey, text: runtime.ttyDraft, version: runtime.ttyDraftVersion };
    expect(runtime.ttyMultiline).toBe(true);
    expect(controller.clearAfterAccepted({ ...accepted, version: accepted.version - 1 })).toBe(false);
    expect(controller.clearAfterAccepted(accepted)).toBe(true);
    expect(runtime.ttyDraft).toBe("");
  });
});
