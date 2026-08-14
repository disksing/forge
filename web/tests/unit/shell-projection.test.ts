import { describe, expect, it } from "vitest";

import { createShellProjection } from "../../src/controllers/shell-projection";
import type { WorkspaceTree } from "../../src/models/workspace";

describe("shell projection", () => {
  const tree: WorkspaceTree = {
    projects: [{ id: "project1", type: "project", children: [
      { id: "task1", type: "task", runtime: { generationId: "gen-task1", status: "running", lastOutputAt: "2026-08-11T02:00:00Z" } },
      { id: "task2", type: "task" },
    ] }],
  };
  const projection = createShellProjection({ tree: () => tree, findResource: () => null, agentName: (id) => id || "agent", now: () => Date.parse("2026-08-11T02:00:30Z") });

  it("keeps custom order stable and moves only known targets", () => {
    expect(projection.applyCustomOrder([{ id: "a" }, { id: "b" }, { id: "c" }], ["c", "a"]).map((item) => item.id)).toEqual(["c", "a", "b"]);
    expect(projection.moveIdInList(["a", "b", "c"], "a", "b", true)).toEqual(["b", "a", "c"]);
    expect(projection.moveIdInList(["a", "b"], "a", "missing", false)).toEqual(["a", "b"]);
  });

  it("projects resource generation status without losing recent output", () => {
    const task = tree.projects[0].children![0];
    const state = projection.taskOperationalState(task);
    expect(state.session).toMatchObject({ kind: "resource-running", recentOutput: true });
    expect(state.statusPresentation.layoutClassName).toBe("has-task-status");
    expect(projection.projectTaskSummary(tree.projects[0])).toMatchObject({ taskCount: 2, runningCount: 1 });
  });

  it("keeps resumable stopped generations sleeping while using the ordinary task icon", () => {
    const task = tree.projects[0].children![0];
    for (const status of ["idle-suspended", "stopped"]) {
      task.runtime = { generationId: "gen-task1", status, resumable: true };
      const state = projection.taskOperationalState(task);
      expect(state.session).toMatchObject({
        kind: "resource-suspended",
        label: "Resource sleeping",
      });
      expect(state.label).toBe("Resource sleeping");
      expect(state.statusPresentation).toMatchObject({
        hasTaskState: false,
        statuses: [],
      });
    }
    expect(projection.projectTaskSummary(tree.projects[0])).toMatchObject({ runningCount: 0 });

    const project = tree.projects[0];
    project.runtime = { generationId: "gen-project1", status: "idle-suspended", resumable: true };
    expect(projection.taskOperationalState(project).statusPresentation).toMatchObject({
      hasTaskState: true,
      statuses: [{ iconName: "pause-circle" }],
    });
  });

  it("uses the ordinary task icon for an idle generation while preserving its ready label", () => {
    const task = tree.projects[0].children![0];
    task.runtime = { generationId: "gen-task1", status: "idle" };
    const state = projection.taskOperationalState(task);
    expect(state.session).toMatchObject({
      kind: "resource-idle",
      label: "Resource ready",
    });
    expect(state.label).toBe("Resource ready");
    expect(state.statusPresentation).toMatchObject({
      hasTaskState: false,
      statuses: [],
    });

    const project = tree.projects[0];
    project.runtime = { generationId: "gen-project1", status: "idle" };
    expect(projection.taskOperationalState(project).statusPresentation).toMatchObject({
      hasTaskState: true,
      statuses: [{ iconName: "message-square" }],
    });
  });
});
