import { mount, tick, unmount } from "svelte";
import { afterEach, describe, expect, it, vi } from "vitest";

import AppShell from "../../src/islands/AppShell.svelte";
import { createIslandChannel } from "../../src/islands/channel";
import type { AppShellModel, ShellResourceItem, ShellStatusPresentation } from "../../src/islands/models";

const cleanups: Array<() => Promise<void>> = [];
afterEach(async () => {
  while (cleanups.length) await cleanups.pop()?.();
  document.body.replaceChildren();
  document.body.className = "";
});

const emptyStatus: ShellStatusPresentation = {
  hasTaskState: false, className: "", layoutClassName: "", slotClassName: "", statuses: [], lock: null,
};

function resource(id: string, title: string, type: "project" | "task" = "project"): ShellResourceItem {
  return {
    id, type, title, ref: type === "project" ? "#1" : "#2", active: false, expanded: false,
    ariaLabel: title, statusLabel: "", status: emptyStatus, summary: null, children: [],
  };
}

function model(overrides: Partial<AppShellModel> = {}): AppShellModel {
  return {
    identity: "workspace-a", loading: false, error: "", version: "v0.1.0", activeWorkspaceId: "workspace-a",
    workspaces: [
      { id: "workspace-a", name: "Workspace A", path: "/tmp/a", iconSrc: "/favicon.svg" },
      { id: "workspace-b", name: "Workspace B", path: "/tmp/b", iconSrc: "/favicon.svg" },
    ],
    projects: [resource("project-a", "Project A"), resource("project-b", "Project B")],
    sessions: [{
      id: "session-a", source: "internal", title: "Task session", meta: "AgentHub · project-a.task-a", label: "Codex",
      statusLabel: "Session active", status: emptyStatus, unread: true, current: false, clickable: true,
      navigationResourceId: "project-a.task-a", menu: false, controls: [],
    }],
    paneSizes: { sidebarWidth: 280, chatWidth: 420, sidebarSessionHeight: 210 },
    mobile: { sidebarOpen: false, view: "details", immersive: false },
    route: { path: "", revision: 0, replace: true },
    onSwitchWorkspace: vi.fn(async () => undefined), onAddWorkspace: vi.fn(), onCreateProject: vi.fn(), onOpenSettings: vi.fn(),
    onToggleProject: vi.fn(async () => undefined), onSelectResource: vi.fn(async () => undefined), onReorder: vi.fn(async () => undefined),
    onDragState: vi.fn(), onPanePreview: vi.fn(), onPaneCommit: vi.fn(), onPaneViewport: vi.fn(), onMobileSidebar: vi.fn(),
    onMobileView: vi.fn(), onMobileImmersive: vi.fn(), onToast: vi.fn(), onIconsChanged: vi.fn(),
    onHistoryNavigation: vi.fn(async () => undefined),
    ...overrides,
  };
}

function dragEvent(type: string, clientY = 0): Event {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, "clientY", { value: clientY });
  Object.defineProperty(event, "dataTransfer", { value: { effectAllowed: "", dropEffect: "", setData: vi.fn() } });
  return event;
}

describe("AppShell", () => {
  it("keeps keyed navigation nodes stable while canonical selection and status projections update", async () => {
    const onSelectResource = vi.fn(async () => undefined);
    const initial = model({ onSelectResource });
    const channel = createIslandChannel(initial);
    const target = document.body.appendChild(document.createElement("div"));
    target.id = "app";
    const component = mount(AppShell, { target, props: { channel } });
    cleanups.push(() => unmount(component));
    await tick();

    const projectA = target.querySelector<HTMLElement>('.tree-item[aria-label="Project A"]')!;
    projectA.dataset.identityProbe = "stable";
    target.querySelector<HTMLButtonElement>('.session-row[aria-label^="Task session"]')!.click();
    await vi.waitFor(() => expect(onSelectResource).toHaveBeenCalledWith("project-a.task-a"));

    channel.publish({
      ...initial,
      projects: initial.projects.map((project) => project.id === "project-a"
        ? { ...project, active: true, statusLabel: "Session running", status: { hasTaskState: true, className: "task-status-session-running", layoutClassName: "has-task-status", slotClassName: "task-status-single", statuses: [{ key: "session", className: "task-status-session-running", iconName: "loader-circle", recentOutput: true }], lock: null } }
        : project),
      sessions: initial.sessions.map((session) => ({ ...session, current: true, unread: false })),
    });
    await tick();

    expect(target.querySelector('.tree-item[aria-label="Project A"]')).toBe(projectA);
    expect(projectA.dataset.identityProbe).toBe("stable");
    expect(projectA.classList.contains("active")).toBe(true);
    expect(target.querySelector(".session-row")?.classList.contains("current-session")).toBe(true);
    expect(target.querySelector(".session-unread-badge")).toBeNull();
  });

  it("keeps drag state local and sends one typed reorder transaction", async () => {
    const onReorder = vi.fn(async () => undefined);
    const onDragState = vi.fn();
    const channel = createIslandChannel(model({ onReorder, onDragState }));
    const target = document.body.appendChild(document.createElement("div"));
    const component = mount(AppShell, { target, props: { channel } });
    cleanups.push(() => unmount(component));
    await tick();

    const rows = target.querySelectorAll<HTMLElement>(".project-tree > .tree-item");
    rows[0].querySelector<HTMLElement>(".drag-handle")!.dispatchEvent(dragEvent("dragstart"));
    rows[1].dispatchEvent(dragEvent("dragover", 1));
    rows[1].dispatchEvent(dragEvent("drop", 1));
    await vi.waitFor(() => expect(onReorder).toHaveBeenCalledTimes(1));
    expect(onReorder).toHaveBeenCalledWith(
      { kind: "project", id: "project-a", projectId: "" },
      { kind: "project", id: "project-b", projectId: "" },
      true,
    );
    expect(onDragState).toHaveBeenNthCalledWith(1, { kind: "project", id: "project-a", projectId: "" });
    expect(onDragState).toHaveBeenLastCalledWith(null);
  });

  it("deduplicates workspace switching and reports a rejected switch", async () => {
    let rejectSwitch!: (reason: unknown) => void;
    const pending = new Promise<void>((_resolve, reject) => { rejectSwitch = reject; });
    const onSwitchWorkspace = vi.fn(() => pending);
    const onToast = vi.fn();
    const channel = createIslandChannel(model({ onSwitchWorkspace, onToast }));
    const target = document.body.appendChild(document.createElement("div"));
    const component = mount(AppShell, { target, props: { channel } });
    cleanups.push(() => unmount(component));
    await tick();

    target.querySelector<HTMLButtonElement>("#workspaceSwitcher")!.click();
    await tick();
    const workspaceB = target.querySelector<HTMLButtonElement>('[data-workspace-id="workspace-b"]')!;
    workspaceB.click();
    workspaceB.click();
    expect(onSwitchWorkspace).toHaveBeenCalledTimes(1);
    rejectSwitch(new Error("workspace unavailable"));
    await vi.waitFor(() => expect(onToast).toHaveBeenCalledWith("workspace unavailable"));
  });

  it("owns History API projection and forwards popstate paths to the navigation controller", async () => {
    window.history.replaceState({}, "", "/");
    const onHistoryNavigation = vi.fn(async () => undefined);
    const initial = model({ onHistoryNavigation });
    const channel = createIslandChannel(initial);
    const target = document.body.appendChild(document.createElement("div"));
    const component = mount(AppShell, { target, props: { channel } });
    cleanups.push(() => unmount(component));
    await tick();

    channel.publish({ ...initial, route: { path: "/w/workspace-a/r/project-a", revision: 1, replace: false } });
    await tick();
    expect(window.location.pathname).toBe("/w/workspace-a/r/project-a");

    window.history.replaceState({}, "", "/w/workspace-b/r/project-b");
    window.dispatchEvent(new PopStateEvent("popstate"));
    await vi.waitFor(() => expect(onHistoryNavigation).toHaveBeenCalledWith("/w/workspace-b/r/project-b"));
  });
});
