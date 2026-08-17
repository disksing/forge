import { describe, expect, it } from "vitest";

import {
  createSidebarFolderId,
  foldersForProject,
  isSidebarFolderId,
  moveSidebarItem,
  orderIds,
  sanitizeSidebarFolderName,
  sidebarFolderTaskIds,
  sidebarProjectRootIds,
  sidebarTaskContainer,
  SIDEBAR_FOLDER_NAME_MAX_LENGTH,
  type SidebarFolder,
  type SidebarOrderState,
} from "../../src/controllers/sidebar-folders";
import type { ShellDragTarget } from "../../src/models/shell";

const folders: SidebarFolder[] = [
  { id: "vf-one", projectId: "project1", name: "One", expanded: true },
  { id: "vf-two", projectId: "project1", name: "Two", expanded: false },
  { id: "vf-other", projectId: "project2", name: "Other", expanded: true },
];

const projectTasks: Record<string, string[]> = {
  project1: ["project1.task1", "project1.task2", "project1.task3", "project1.task4"],
  project2: ["project2.task1"],
};

function state(taskOrder: Record<string, string[]> = {}, folderOrder: Record<string, string[]> = {}): SidebarOrderState {
  return { taskOrder, folderOrder };
}

function task(id: string, projectId = "project1", containerId = ""): ShellDragTarget {
  return { kind: "task", id, projectId, containerId };
}

function folder(id: string, projectId = "project1"): ShellDragTarget {
  return { kind: "folder", id, projectId };
}

describe("sidebar folder IDs and names", () => {
  it("creates prefixed unique folder IDs", () => {
    const first = createSidebarFolderId();
    const second = createSidebarFolderId();
    expect(isSidebarFolderId(first)).toBe(true);
    expect(isSidebarFolderId("project1.task1")).toBe(false);
    expect(first).not.toBe(second);
  });

  it("trims and caps folder names", () => {
    expect(sanitizeSidebarFolderName("  Grouped  ")).toBe("Grouped");
    expect(sanitizeSidebarFolderName("x".repeat(200))).toHaveLength(SIDEBAR_FOLDER_NAME_MAX_LENGTH);
    expect(sanitizeSidebarFolderName("   ")).toBe("");
  });
});

describe("orderIds", () => {
  it("applies the stored order and appends unknown IDs in tree order", () => {
    expect(orderIds(["a", "b", "c"], ["c", "a"])).toEqual(["c", "a", "b"]);
    expect(orderIds(["a", "b"], undefined)).toEqual(["a", "b"]);
  });
});

describe("sidebarProjectRootIds", () => {
  it("mixes ungrouped tasks with folders in the stored order", () => {
    const ids = sidebarProjectRootIds(
      state({ project1: ["vf-one", "project1.task1"] }, { "vf-one": ["project1.task2"] }),
      folders,
      "project1",
      projectTasks.project1,
    );
    expect(ids).toEqual(["vf-one", "project1.task1", "project1.task3", "project1.task4", "vf-two"]);
  });

  it("ignores folders and grouped tasks from other projects", () => {
    const ids = sidebarProjectRootIds(state({}, { "vf-other": ["project2.task1"] }), folders, "project2", projectTasks.project2);
    expect(ids).toEqual(["vf-other"]);
  });
});

describe("sidebarFolderTaskIds", () => {
  it("drops tasks that no longer exist and deduplicates", () => {
    const ids = sidebarFolderTaskIds(
      state({}, { "vf-one": ["project1.task2", "project1.task2", "project1.gone"] }),
      folders[0],
      projectTasks.project1,
    );
    expect(ids).toEqual(["project1.task2"]);
  });
});

describe("moveSidebarItem", () => {
  it("reorders root tasks relative to each other", () => {
    const next = moveSidebarItem(state(), folders, projectTasks, task("project1.task1"), task("project1.task3"), true);
    expect(next?.taskOrder.project1).toEqual(["project1.task2", "project1.task3", "project1.task1", "project1.task4", "vf-one", "vf-two"]);
  });

  it("moves a task into a folder dropped on the folder row", () => {
    const next = moveSidebarItem(state(), folders, projectTasks, task("project1.task1"), folder("vf-one"), false);
    expect(next?.folderOrder["vf-one"]).toEqual(["project1.task1"]);
    expect(next?.taskOrder.project1).not.toContain("project1.task1");
    expect(next?.taskOrder.project1).toContain("vf-one");
  });

  it("moves a task out of a folder onto a root task", () => {
    const start = state({ project1: ["vf-one", "project1.task3"] }, { "vf-one": ["project1.task1", "project1.task2"] });
    const next = moveSidebarItem(start, folders, projectTasks, task("project1.task1"), task("project1.task3"), false);
    expect(next?.folderOrder["vf-one"]).toEqual(["project1.task2"]);
    expect(next?.taskOrder.project1).toEqual(["vf-one", "project1.task1", "project1.task3", "project1.task4", "vf-two"]);
  });

  it("reorders tasks inside a folder", () => {
    const start = state({}, { "vf-one": ["project1.task1", "project1.task2", "project1.task3"] });
    const next = moveSidebarItem(start, folders, projectTasks, task("project1.task1"), task("project1.task3"), true);
    expect(next?.folderOrder["vf-one"]).toEqual(["project1.task2", "project1.task3", "project1.task1"]);
  });

  it("moves a task to the project root dropped on the project row", () => {
    const start = state({}, { "vf-one": ["project1.task1"] });
    const next = moveSidebarItem(start, folders, projectTasks, task("project1.task1"), { kind: "project", id: "project1", projectId: "" }, false);
    expect(next?.folderOrder["vf-one"]).toEqual([]);
    expect(next?.taskOrder.project1?.at(-1)).toBe("project1.task1");
  });

  it("reorders folders relative to root tasks and other folders", () => {
    const next = moveSidebarItem(state(), folders, projectTasks, folder("vf-one"), task("project1.task2"), true);
    expect(next?.taskOrder.project1).toEqual(["project1.task1", "project1.task2", "vf-one", "project1.task3", "project1.task4", "vf-two"]);
  });

  it("rejects cross-project moves, folder nesting, and self drops", () => {
    expect(moveSidebarItem(state(), folders, projectTasks, task("project1.task1"), task("project2.task1", "project2"), false)).toBeNull();
    expect(moveSidebarItem(state(), folders, projectTasks, folder("vf-one"), folder("vf-two"), false)).not.toBeNull();
    const nested = state({}, { "vf-two": ["project1.task2"] });
    expect(moveSidebarItem(nested, folders, projectTasks, folder("vf-one"), task("project1.task2", "project1", "vf-two"), false)).toBeNull();
    expect(moveSidebarItem(state(), folders, projectTasks, task("project1.task1"), task("project1.task1"), false)).toBeNull();
    expect(moveSidebarItem(state(), folders, projectTasks, { kind: "project", id: "project1", projectId: "" }, task("project1.task1"), false)).toBeNull();
  });

  it("moves a task between folders through the target folder row", () => {
    const start = state({}, { "vf-one": ["project1.task1"], "vf-two": ["project1.task2"] });
    const next = moveSidebarItem(start, folders, projectTasks, task("project1.task1", "project1", "vf-one"), folder("vf-two"), false);
    expect(next?.folderOrder["vf-one"]).toEqual([]);
    expect(next?.folderOrder["vf-two"]).toEqual(["project1.task2", "project1.task1"]);
  });

  it("keeps other projects untouched", () => {
    const next = moveSidebarItem(state({ project2: ["project2.task1"] }), folders, projectTasks, task("project1.task1"), task("project1.task2"), true);
    expect(next?.taskOrder.project2).toEqual(["project2.task1"]);
  });
});

describe("sidebarTaskContainer", () => {
  it("resolves the folder grouping a task", () => {
    expect(sidebarTaskContainer(state({}, { "vf-one": ["project1.task1"] }), "project1.task1")).toBe("vf-one");
    expect(sidebarTaskContainer(state(), "project1.task1")).toBe("");
  });
});

describe("foldersForProject", () => {
  it("lists only folders of the given project", () => {
    expect(foldersForProject(folders, "project1").map((folder) => folder.id)).toEqual(["vf-one", "vf-two"]);
    expect(foldersForProject(folders, "project2").map((folder) => folder.id)).toEqual(["vf-other"]);
  });
});
