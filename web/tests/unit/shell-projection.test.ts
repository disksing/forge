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
});
