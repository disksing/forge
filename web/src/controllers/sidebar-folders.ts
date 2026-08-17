import type { ShellDragTarget } from "../models/shell";

// Sidebar folders are a pure UI-layer grouping device for the project tree.
// They nest Tasks visually inside their Project without touching the real
// resource directories, and persist through the per-user workspace UI state
// alongside projectOrder/taskOrder.

export interface SidebarFolder {
  id: string;
  projectId: string;
  name: string;
  expanded: boolean;
}

export interface SidebarOrderState {
  // Root-level children of each Project: ungrouped Task IDs mixed with
  // virtual folder IDs.
  taskOrder: Record<string, string[]>;
  // Task IDs grouped inside each virtual folder, in display order.
  folderOrder: Record<string, string[]>;
}

export const SIDEBAR_FOLDER_ID_PREFIX = "vf-";
export const SIDEBAR_FOLDER_NAME_MAX_LENGTH = 80;
export const SIDEBAR_FOLDER_DEFAULT_NAME = "New folder";

export function isSidebarFolderId(id: string): boolean {
  return id.startsWith(SIDEBAR_FOLDER_ID_PREFIX);
}

export function createSidebarFolderId(): string {
  const bytes = new Uint8Array(4);
  globalThis.crypto.getRandomValues(bytes);
  return SIDEBAR_FOLDER_ID_PREFIX + Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function sanitizeSidebarFolderName(value: unknown): string {
  return String(value || "").trim().slice(0, SIDEBAR_FOLDER_NAME_MAX_LENGTH);
}

export function foldersForProject(folders: SidebarFolder[], projectId: string): SidebarFolder[] {
  return folders.filter((folder) => folder.projectId === projectId);
}

export function sidebarFolderById(folders: SidebarFolder[], id: string): SidebarFolder | null {
  return folders.find((folder) => folder.id === id) || null;
}

// orderIds applies a stored custom order on top of an ID list. IDs missing
// from the stored order keep their relative position at the end, mirroring
// applyCustomOrder in shell-projection.
export function orderIds(ids: string[], stored: string[] | undefined): string[] {
  if (!stored?.length) return ids;
  const rank = new Map<string, number>();
  stored.forEach((id, index) => { if (!rank.has(id)) rank.set(id, index); });
  return ids.map((id, index) => ({ id, index })).sort((left, right) => {
    const leftRank = rank.get(left.id) ?? rank.size + left.index;
    const rightRank = rank.get(right.id) ?? rank.size + right.index;
    return leftRank === rightRank ? left.index - right.index : leftRank - rightRank;
  }).map((entry) => entry.id);
}

// sidebarTaskContainer resolves which folder currently groups a Task, or ""
// when the Task sits at the Project root.
export function sidebarTaskContainer(state: SidebarOrderState, taskId: string): string {
  for (const [folderId, ids] of Object.entries(state.folderOrder)) {
    if (ids.includes(taskId)) return folderId;
  }
  return "";
}

// sidebarProjectRootIds materializes the full ordered root list of a Project:
// ungrouped Tasks plus the Project's folders, with the stored custom order
// applied and never-before-seen items appended in tree order.
export function sidebarProjectRootIds(state: SidebarOrderState, folders: SidebarFolder[], projectId: string, projectTaskIds: string[]): string[] {
  const projectFolders = foldersForProject(folders, projectId);
  const grouped = new Set<string>();
  for (const folder of projectFolders) {
    for (const id of state.folderOrder[folder.id] || []) grouped.add(id);
  }
  const rootTasks = projectTaskIds.filter((id) => !grouped.has(id));
  return orderIds([...rootTasks, ...projectFolders.map((folder) => folder.id)], state.taskOrder[projectId]);
}

// sidebarFolderTaskIds materializes the ordered Task list of a folder,
// dropping Tasks that no longer exist in the Project.
export function sidebarFolderTaskIds(state: SidebarOrderState, folder: SidebarFolder, projectTaskIds: string[]): string[] {
  const valid = new Set(projectTaskIds);
  const seen = new Set<string>();
  const ids: string[] = [];
  for (const id of state.folderOrder[folder.id] || []) {
    if (!valid.has(id) || seen.has(id)) continue;
    seen.add(id);
    ids.push(id);
  }
  return ids;
}

function targetProjectId(folders: SidebarFolder[], target: ShellDragTarget): string {
  if (target.kind === "project") return target.id;
  if (target.kind === "folder") return sidebarFolderById(folders, target.id)?.projectId || "";
  return target.projectId;
}

// moveSidebarItem computes the order state after a drag/drop transaction
// inside one Project. It returns null for gestures that are not allowed:
// cross-Project moves, folders dropped into folders, or unknown items.
// Drop semantics:
//   Task -> folder row: append the Task to the folder.
//   Task/folder -> Project row: move to the end of the Project root.
//   Task/folder -> Task or folder row: insert before/after the target inside
//   the target's container (folders only at the Project root).
export function moveSidebarItem(
  state: SidebarOrderState,
  folders: SidebarFolder[],
  projectTasks: Record<string, string[]>,
  drag: ShellDragTarget,
  target: ShellDragTarget,
  after: boolean,
): SidebarOrderState | null {
  if (drag.kind === "project" || drag.id === target.id) return null;
  const projectId = drag.kind === "folder" ? sidebarFolderById(folders, drag.id)?.projectId || "" : drag.projectId;
  if (!projectId || targetProjectId(folders, target) !== projectId) return null;

  const allTasks = projectTasks[projectId] || [];
  const projectFolders = foldersForProject(folders, projectId);
  const rootIds = sidebarProjectRootIds(state, folders, projectId, allTasks);
  const folderLists = new Map<string, string[]>(projectFolders.map((folder) => [folder.id, sidebarFolderTaskIds(state, folder, allTasks)]));

  const removeDrag = (): void => {
    if (drag.kind === "folder") {
      const index = rootIds.indexOf(drag.id);
      if (index >= 0) rootIds.splice(index, 1);
      return;
    }
    const containerId = sidebarTaskContainer(state, drag.id);
    const list = containerId ? folderLists.get(containerId) : rootIds;
    if (!list) return;
    const index = list.indexOf(drag.id);
    if (index >= 0) list.splice(index, 1);
  };

  if (target.kind === "folder" && drag.kind === "task") {
    removeDrag();
    const list = folderLists.get(target.id);
    if (!list) return null;
    list.push(drag.id);
  } else if (target.kind === "project") {
    removeDrag();
    rootIds.push(drag.id);
  } else {
    const containerId = target.kind === "folder" ? "" : sidebarTaskContainer(state, target.id);
    if (drag.kind === "folder" && containerId) return null;
    const list = containerId ? folderLists.get(containerId) : rootIds;
    if (!list) return null;
    removeDrag();
    let index = list.indexOf(target.id);
    if (index < 0) return null;
    if (after) index += 1;
    list.splice(index, 0, drag.id);
  }

  const taskOrder = { ...state.taskOrder, [projectId]: rootIds };
  const folderOrder = { ...state.folderOrder };
  for (const [folderId, ids] of folderLists) folderOrder[folderId] = ids;
  return { taskOrder, folderOrder };
}
