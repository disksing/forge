import { mount, tick, unmount } from "svelte";
import { afterEach, describe, expect, it, vi } from "vitest";

import AppShell from "../../src/components/AppShell.svelte";
import { createModelChannel } from "../../src/components/model-channel";
import type { AppShellModel, ShellResourceItem, ShellStatusPresentation } from "../../src/components/models";

const cleanups: Array<() => Promise<void>> = [];
afterEach(async () => {
  while (cleanups.length) await cleanups.pop()?.();
  document.body.replaceChildren();
  document.body.className = "";
});

const emptyStatus: ShellStatusPresentation = {
  hasTaskState: false, className: "", layoutClassName: "", slotClassName: "", statuses: [],
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
    paneSizes: { sidebarWidth: 280, chatWidth: 420 },
    mobile: { sidebarOpen: false, view: "details", immersive: false },
    layout: { preference: "auto", effective: "three" },
    route: { path: "", revision: 0, replace: true },
    onSwitchWorkspace: vi.fn(async () => undefined), onAddWorkspace: vi.fn(), onCreateProject: vi.fn(), onOpenSettings: vi.fn(),
    onToggleProject: vi.fn(async () => undefined), onSelectResource: vi.fn(async () => undefined), onReorder: vi.fn(async () => undefined),
    onDragState: vi.fn(), onPanePreview: vi.fn(), onPaneCommit: vi.fn(), onPaneViewport: vi.fn(), onMobileSidebar: vi.fn(),
    onMobileView: vi.fn(), onMobileImmersive: vi.fn(), onLayoutCycle: vi.fn(), onToast: vi.fn(), onIconsChanged: vi.fn(),
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
    const channel = createModelChannel(initial);
    const target = document.body.appendChild(document.createElement("div"));
    target.id = "app";
    const component = mount(AppShell, { target, props: { channel } });
    cleanups.push(() => unmount(component));
    await tick();

    const projectA = target.querySelector<HTMLElement>('.tree-item[aria-label="Project A"]')!;
    projectA.dataset.identityProbe = "stable";
    target.querySelector<HTMLButtonElement>('.tree-item[aria-label="Project A"]')!.click();
    await vi.waitFor(() => expect(onSelectResource).toHaveBeenCalledWith("project-a"));

    channel.publish({
      ...initial,
      projects: initial.projects.map((project) => project.id === "project-a"
        ? { ...project, active: true, statusLabel: "Session running", status: { hasTaskState: true, className: "task-status-session-running", layoutClassName: "has-task-status", slotClassName: "task-status-single", statuses: [{ key: "session", className: "task-status-session-running", iconName: "loader-circle", recentOutput: true }] } }
        : project),
    });
    await tick();

    expect(target.querySelector('.tree-item[aria-label="Project A"]')).toBe(projectA);
    expect(projectA.dataset.identityProbe).toBe("stable");
    expect(projectA.classList.contains("active")).toBe(true);
  });

  it("keeps drag state local and sends one typed reorder transaction", async () => {
    const onReorder = vi.fn(async () => undefined);
    const onDragState = vi.fn();
    const channel = createModelChannel(model({ onReorder, onDragState }));
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
    const channel = createModelChannel(model({ onSwitchWorkspace, onToast }));
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
    const channel = createModelChannel(initial);
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

  it("preserves Escape priority between the mobile sidebar and local menus", async () => {
    const onMobileSidebar = vi.fn();
    const initial = model({ mobile: { sidebarOpen: true, view: "details", immersive: false }, onMobileSidebar });
    const channel = createModelChannel(initial);
    const target = document.body.appendChild(document.createElement("div"));
    const component = mount(AppShell, { target, props: { channel } });
    cleanups.push(() => unmount(component));
    await tick();

    target.querySelector<HTMLButtonElement>("#workspaceSwitcher")!.click();
    await tick();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(onMobileSidebar).toHaveBeenCalledWith(false);
    expect(target.querySelector("#workspaceMenu")).not.toBeNull();

    channel.publish({ ...initial, mobile: { ...initial.mobile, sidebarOpen: false } });
    await tick();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await tick();
    expect(target.querySelector("#workspaceMenu")).toBeNull();
  });

  it("switches the shared details/chat column through the workspace view tabs", async () => {
    const onMobileView = vi.fn();
    const initial = model({ onMobileView });
    const channel = createModelChannel(initial);
    const target = document.body.appendChild(document.createElement("div"));
    const component = mount(AppShell, { target, props: { channel } });
    cleanups.push(() => unmount(component));
    await tick();

    const detailsTab = target.querySelector<HTMLButtonElement>("#paneDetailsTab")!;
    const chatTab = target.querySelector<HTMLButtonElement>("#paneChatTab")!;
    expect(detailsTab.getAttribute("aria-selected")).toBe("true");
    expect(chatTab.getAttribute("aria-selected")).toBe("false");

    chatTab.click();
    expect(onMobileView).toHaveBeenCalledWith("chat");
    channel.publish({ ...initial, mobile: { ...initial.mobile, view: "chat" } });
    await tick();
    expect(detailsTab.getAttribute("aria-selected")).toBe("false");
    expect(chatTab.getAttribute("aria-selected")).toBe("true");
    expect(document.body.classList.contains("mobile-chat-active")).toBe(true);

    detailsTab.click();
    expect(onMobileView).toHaveBeenCalledWith("details");
  });

  it("cycles the manual layout preference through the layout switcher", async () => {
    const onLayoutCycle = vi.fn();
    const initial = model({ onLayoutCycle });
    const channel = createModelChannel(initial);
    const target = document.body.appendChild(document.createElement("div"));
    const component = mount(AppShell, { target, props: { channel } });
    cleanups.push(() => unmount(component));
    await tick();

    const switcher = target.querySelector<HTMLButtonElement>(".brand-band .layout-switcher")!;
    expect(switcher.getAttribute("aria-label")).toContain("Auto");
    expect(switcher.querySelector("[data-lucide]")?.getAttribute("data-lucide")).toBe("layout-grid");

    switcher.click();
    expect(onLayoutCycle).toHaveBeenCalledTimes(1);
    channel.publish({ ...initial, layout: { preference: "split", effective: "split" } });
    await tick();
    expect(switcher.getAttribute("aria-label")).toContain("sidebar collapsed");
    expect(switcher.querySelector("[data-lucide]")?.getAttribute("data-lucide")).toBe("panel-left-close");
  });
});
