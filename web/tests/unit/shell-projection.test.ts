import { describe, expect, it } from "vitest";

import { createShellProjection } from "../../src/controllers/shell-projection";
import type { WorkspaceTree } from "../../src/models/workspace";

describe("shell projection", () => {
  const tree: WorkspaceTree = {
    projects: [{ id: "project1", type: "project", children: [
      { id: "task1", type: "task", state: "in_progress", runtime: { generationId: "gen-task1", status: "running", lastOutputAt: "2026-08-11T02:00:00Z" } },
      { id: "task2", type: "task" },
    ] }],
  };
  const projection = createShellProjection({ tree: () => tree, findResource: () => null, agentName: (id) => id || "agent", now: () => Date.parse("2026-08-11T02:00:30Z") });

  it("keeps custom order stable and moves only known targets", () => {
    expect(projection.applyCustomOrder([{ id: "a" }, { id: "b" }, { id: "c" }], ["c", "a"]).map((item) => item.id)).toEqual(["c", "a", "b"]);
    expect(projection.moveIdInList(["a", "b", "c"], "a", "b", true)).toEqual(["b", "a", "c"]);
    expect(projection.moveIdInList(["a", "b"], "a", "missing", false)).toEqual(["a", "b"]);
  });

  it("projects Task workflow state independently from runtime state", () => {
    const task = { ...tree.projects[0].children![0], state: "blocked" as const, stateNote: "Need deployment approval", runtime: { generationId: "gen-task1", status: "idle" } };
    const state = projection.taskWorkflowState(task);
    expect(state.session).toMatchObject({ kind: "task-blocked", iconName: "circle-alert" });
    expect(state.label).toBe("Blocked: Need deployment approval");
  });

  it("projects resource generation status without losing recent output", () => {
    const task = tree.projects[0].children![0];
    task.runtime = { generationId: "gen-task1", status: "running", lastOutputAt: "2026-08-11T02:00:00Z" };
    task.state = "in_progress";
    const state = projection.taskOperationalState(task);
    expect(state.session).toMatchObject({ kind: "resource-running", recentOutput: true });
    expect(state.statusPresentation.layoutClassName).toBe("has-task-status");
    expect(projection.projectTaskSummary(tree.projects[0])).toMatchObject({ taskCount: 2, runningCount: 1 });
  });

  it("shows the approval icon for a resource waiting for approval", () => {
    const task = tree.projects[0].children![0];
    task.runtime = { generationId: "gen-task1", status: "waiting_approval" };
    const state = projection.taskOperationalState(task);
    expect(state.session).toMatchObject({ kind: "resource-approval", label: "Resource waiting for approval" });
    expect(state.statusPresentation).toMatchObject({
      hasTaskState: true,
      statuses: [{ iconName: "shield-question" }],
    });
  });

  it("shows no status icon for resting or transitional generations across resources", () => {
    const task = tree.projects[0].children![0];
    const project = tree.projects[0];
    for (const status of ["starting", "stopping", "recovering", "idle", "idle-suspended", "stopped"]) {
      task.runtime = { generationId: "gen-task1", status };
      const taskState = projection.taskOperationalState(task);
      expect(taskState.session).toBeNull();
      expect(taskState.label).toBe("");
      expect(taskState.statusPresentation).toMatchObject({ hasTaskState: false, statuses: [] });

      project.runtime = { generationId: "gen-project1", status };
      const projectState = projection.taskOperationalState(project);
      expect(projectState.session).toBeNull();
      expect(projectState.label).toBe("");
      expect(projectState.statusPresentation).toMatchObject({ hasTaskState: false, statuses: [] });
    }
  });

  it("keeps the neutral fallback icon for unknown generation statuses", () => {
    const task = tree.projects[0].children![0];
    task.runtime = { generationId: "gen-task1", status: "failed" };
    const state = projection.taskOperationalState(task);
    expect(state.session).toMatchObject({ kind: "resource-active", label: "Resource failed" });
    expect(state.statusPresentation).toMatchObject({
      hasTaskState: true,
      statuses: [{ iconName: "circle-dot" }],
    });
  });

  it("redirects task archives through the tree view order", () => {
    const redirectTree: WorkspaceTree = {
      projects: [
        { id: "project1", type: "project", children: [
          { id: "project1.task1", type: "task" },
          { id: "project1.task2", type: "task" },
          { id: "project1.task3", type: "task" },
        ] },
        { id: "project2", type: "project", children: [{ id: "project2.task1", type: "task" }] },
        { id: "project3", type: "project", children: [{ id: "project3.task1", type: "task" }] },
      ],
    };
    const redirectProjection = createShellProjection({ tree: () => redirectTree, findResource: () => null, agentName: (id) => id || "agent" });
    const order = { projectOrder: ["project3", "project1", "project2"], taskOrder: { project1: ["project1.task3", "project1.task1", "project1.task2"] } };

    // Next task wins when one exists in tree view order.
    expect(redirectProjection.archiveRedirectTarget("project1.task1", order.projectOrder, order.taskOrder)).toBe("project1.task2");
    // Last task falls back to the previous one; id order would have picked task3 instead.
    expect(redirectProjection.archiveRedirectTarget("project1.task2", order.projectOrder, order.taskOrder)).toBe("project1.task1");
    // A project with a single task falls back to its project.
    expect(redirectProjection.archiveRedirectTarget("project2.task1", order.projectOrder, order.taskOrder)).toBe("project2");
    // First project picks the next one; id order would have picked project2 instead.
    expect(redirectProjection.archiveRedirectTarget("project3", order.projectOrder, order.taskOrder)).toBe("project1");
    // Last project falls back to the previous one; id order would have picked project3 instead.
    expect(redirectProjection.archiveRedirectTarget("project2", order.projectOrder, order.taskOrder)).toBe("project1");
  });

  it("returns the workspace when archiving the only project or an unknown resource", () => {
    const singleTree: WorkspaceTree = {
      projects: [{ id: "project1", type: "project", children: [{ id: "project1.task1", type: "task" }] }],
    };
    const singleProjection = createShellProjection({ tree: () => singleTree, findResource: () => null, agentName: (id) => id || "agent" });
    expect(singleProjection.archiveRedirectTarget("project1", [], {})).toBe("workspace");
    expect(singleProjection.archiveRedirectTarget("missing", [], {})).toBe("workspace");
    expect(singleProjection.archiveRedirectTarget("scheduler", [], {})).toBe("workspace");
  });

  it("returns the workspace when no tree is available", () => {
    const emptyProjection = createShellProjection({ tree: () => null, findResource: () => null, agentName: (id) => id || "agent" });
    expect(emptyProjection.archiveRedirectTarget("project1", [], {})).toBe("workspace");
  });
});
