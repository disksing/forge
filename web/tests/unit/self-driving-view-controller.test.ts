import { describe, expect, it, vi } from "vitest";

import { createSelfDrivingViewController, selfDrivingPresentation } from "../../src/controllers/self-driving-view-controller";
import type { SelfDrivingDialogModel } from "../../src/models/chat";
import type { ResourceRecord } from "../../src/models/workspace";

describe("self-driving view controller", () => {
  it("projects bar state and submits a configuration dialog", async () => {
    const task: ResourceRecord = { id: "task1", type: "task", selfDriving: { enabled: false, revision: 2, prompt: "continue" } };
    let dialog!: SelfDrivingDialogModel;
    let expanded = false;
    const setDesired = vi.fn(async () => undefined);
    const controller = createSelfDrivingViewController({
      workspaceId: () => "workspace-a", selectedId: () => "task1", selectedResource: () => task, detail: () => task,
      currentRun: () => null, runs: () => [], agents: () => [{ id: "codex", name: "Codex" }], agentOptions: () => [{ id: "codex", label: "Codex", summary: "OpenAI" }],
      selectedAgent: () => ({ id: "codex" }), expanded: () => expanded, setExpanded: (value) => { expanded = value; }, operationActive: () => false,
      setDesired, disable: vi.fn(async () => undefined), publishDialog: (model) => { dialog = model; }, refreshBar: vi.fn(), refreshIcons: vi.fn(), toast: vi.fn(),
    });

    expect(controller.barModel(task)).toMatchObject({ visible: true, revision: 2, enabled: false, summary: "Revision 2" });
    controller.openDialog();
    expect(dialog).toMatchObject({ open: true, resourceId: "task1", draft: { agentName: "codex", runInstructions: "continue" } });
    await dialog.onSubmit({ agentName: "codex", runInstructions: "finish it" });
    expect(setDesired).toHaveBeenCalledWith({ configured: true, agentName: "codex", runInstructions: "finish it", completionCriteria: "" });
    expect(dialog.open).toBe(false);
    expect(selfDrivingPresentation("future-state", true)).toMatchObject({ key: "unknown", label: "future-state" });
  });
});
