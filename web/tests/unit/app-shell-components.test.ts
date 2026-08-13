import { mount, tick, unmount } from "svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import MobileToolbar from "../../src/components/MobileToolbar.svelte";
import AttentionList from "../../src/components/AttentionList.svelte";
import ProjectTree from "../../src/components/ProjectTree.svelte";
import PaneResizeHandle from "../../src/components/PaneResizeHandle.svelte";
import WorkspaceSwitcher from "../../src/components/WorkspaceSwitcher.svelte";
import type { ShellAttentionItem, ShellResourceItem, ShellStatusPresentation } from "../../src/components/models";

const cleanups: Array<() => Promise<void>> = [];

beforeEach(() => {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  });
});

afterEach(async () => {
  while (cleanups.length) await cleanups.pop()?.();
  document.body.replaceChildren();
  document.body.className = "";
});

const emptyStatus: ShellStatusPresentation = {
  hasTaskState: false, className: "", layoutClassName: "", slotClassName: "", statuses: [],
};

function resource(id: string, type: "project" | "task" = "project"): ShellResourceItem {
  return {
    id, type, title: id, ref: `#${id}`, active: false, expanded: false, ariaLabel: id, statusLabel: "",
    status: emptyStatus, summary: null, children: [],
  };
}

function dragEvent(type: string, clientY = 0): Event {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, "clientY", { value: clientY });
  Object.defineProperty(event, "dataTransfer", { value: { effectAllowed: "", dropEffect: "", setData: vi.fn() } });
  return event;
}

function pointerEvent(type: string, clientX: number, clientY: number): Event {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperties(event, { clientX: { value: clientX }, clientY: { value: clientY } });
  return event;
}

describe("AppShell responsibility components", () => {
  it("MobileToolbar owns mobile view, navigation, and immersive actions", async () => {
    const onSidebar = vi.fn();
    const onView = vi.fn();
    const onImmersive = vi.fn();
    const target = document.body.appendChild(document.createElement("div"));
    const component = mount(MobileToolbar, { target, props: { sidebarOpen: false, view: "details", immersive: false, onSidebar, onView, onImmersive } });
    cleanups.push(() => unmount(component));

    target.querySelector<HTMLButtonElement>("#mobileMenuButton")!.click();
    target.querySelector<HTMLButtonElement>("#mobileChatButton")!.click();
    target.querySelector<HTMLButtonElement>("#mobileImmersiveButton")!.click();
    target.querySelector<HTMLButtonElement>("#mobileSidebarBackdrop")!.click();

    expect(onSidebar.mock.calls).toEqual([[true], [false]]);
    expect(onView).toHaveBeenCalledWith("chat");
    expect(onImmersive).toHaveBeenCalledWith(true);
  });

  it("WorkspaceSwitcher owns menu dismissal, pending deduplication, and errors", async () => {
    let rejectSwitch!: (reason: unknown) => void;
    const pending = new Promise<void>((_resolve, reject) => { rejectSwitch = reject; });
    const onSwitch = vi.fn(() => pending);
    const onToast = vi.fn();
    const target = document.body.appendChild(document.createElement("div"));
    const component = mount(WorkspaceSwitcher, { target, props: {
      identity: "workspace-a", mobileSidebarOpen: false, activeWorkspaceId: "workspace-a",
      workspaces: [
        { id: "workspace-a", name: "Workspace A", path: "/tmp/a", iconSrc: "/favicon.svg" },
        { id: "workspace-b", name: "Workspace B", path: "/tmp/b", iconSrc: "/favicon.svg" },
      ],
      onSwitch, onAdd: vi.fn(), onToast,
    } });
    cleanups.push(() => unmount(component));
    await tick();

    target.querySelector<HTMLButtonElement>("#workspaceSwitcher")!.click();
    await tick();
    const workspaceB = target.querySelector<HTMLButtonElement>('[data-workspace-id="workspace-b"]')!;
    workspaceB.click();
    workspaceB.click();
    expect(onSwitch).toHaveBeenCalledTimes(1);
    rejectSwitch(new Error("workspace unavailable"));
    await vi.waitFor(() => expect(onToast).toHaveBeenCalledWith("workspace unavailable"));

    target.querySelector<HTMLButtonElement>("#workspaceSwitcher")!.click();
    await tick();
    document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    await tick();
    expect(target.querySelector("#workspaceMenu")).toBeNull();
  });

  it("ProjectTree owns keyed rows, project toggles, selection, and typed drag transactions", async () => {
    const onToggle = vi.fn(async () => undefined);
    const onSelect = vi.fn(async () => undefined);
    const onReorder = vi.fn(async () => undefined);
    const onDragState = vi.fn();
    const onToggleAttention = vi.fn(async () => undefined);
    const projectA = { ...resource("project-a"), expanded: true, children: [resource("task-a", "task")] };
    const target = document.body.appendChild(document.createElement("div"));
    const component = mount(ProjectTree, { target, props: {
      identity: "workspace-a", loading: false, error: "", projects: [projectA, resource("project-b")],
      onCreate: vi.fn(), onToggle, onSelect, onReorder, onDragState, onToggleAttention, onToast: vi.fn(),
    } });
    cleanups.push(() => unmount(component));
    await tick();

    target.querySelector<HTMLElement>('[data-project-toggle="project-a"]')!.click();
    target.querySelector<HTMLButtonElement>('[aria-label="task-a"]')!.click();
    await vi.waitFor(() => expect(onToggle).toHaveBeenCalledWith("project-a"));
    await vi.waitFor(() => expect(onSelect).toHaveBeenCalledWith("task-a"));
    target.querySelector<HTMLElement>('[aria-label="Follow project-a"]')!.click();
    await vi.waitFor(() => expect(onToggleAttention).toHaveBeenCalledWith("project-a", true));

    const rows = target.querySelectorAll<HTMLElement>(".project-tree > .tree-item");
    rows[0].querySelector<HTMLElement>(".drag-handle")!.dispatchEvent(dragEvent("dragstart"));
    rows[1].dispatchEvent(dragEvent("dragover", 1));
    rows[1].dispatchEvent(dragEvent("drop", 1));
    await vi.waitFor(() => expect(onReorder).toHaveBeenCalledWith(
      { kind: "project", id: "project-a", projectId: "" },
      { kind: "project", id: "project-b", projectId: "" },
      true,
    ));
    expect(onDragState).toHaveBeenLastCalledWith(null);
  });

  it("ProjectTree chevron keeps a stable icon and reflects expansion with its class", async () => {
    const expandedProject = { ...resource("project-a"), expanded: true, children: [resource("task-a", "task")] };
    const collapsedProject = { ...resource("project-b"), expanded: false, children: [resource("task-b", "task")] };
    const target = document.body.appendChild(document.createElement("div"));
    const component = mount(ProjectTree, { target, props: {
      identity: "workspace-a", loading: false, error: "", projects: [expandedProject, collapsedProject],
      onCreate: vi.fn(), onToggle: vi.fn(async () => undefined), onSelect: vi.fn(async () => undefined),
      onReorder: vi.fn(async () => undefined), onDragState: vi.fn(), onToggleAttention: vi.fn(async () => undefined), onToast: vi.fn(),
    } });
    cleanups.push(() => unmount(component));
    await tick();

    const expandedChevron = target.querySelector<HTMLElement>('[data-project-toggle="project-a"]')!;
    const collapsedChevron = target.querySelector<HTMLElement>('[data-project-toggle="project-b"]')!;
    expect(expandedChevron.classList.contains("expanded")).toBe(true);
    expect(collapsedChevron.classList.contains("expanded")).toBe(false);
    // The chevron uses a single icon and encodes direction through the
    // expanded class (CSS rotation) so the icon itself never changes.
    expect(expandedChevron.querySelector('i[data-lucide="chevron-right"]')).not.toBeNull();
    expect(collapsedChevron.querySelector('i[data-lucide="chevron-right"]')).not.toBeNull();
  });

  it("AttentionList exposes follow and dismiss controls without selecting the row", async () => {
    const onSelect = vi.fn(async () => undefined);
    const onToggleAttention = vi.fn(async () => undefined);
    const onDismiss = vi.fn(async () => undefined);
    const item: ShellAttentionItem = {
      id: "project-a", type: "project", title: "Project A", ref: "#1", selected: true, activeTurn: false, followed: true,
      turnNumber: 2, agentName: "Codex", statusLabel: "Focused resource", status: emptyStatus,
    };
    const activeItem: ShellAttentionItem = {
      id: "task-b", type: "task", title: "Task B", ref: "#2", selected: false, activeTurn: true, followed: false,
      turnNumber: 3, agentName: "Codex", statusLabel: "Resource working", status: emptyStatus,
    };
    const target = document.body.appendChild(document.createElement("div"));
    const component = mount(AttentionList, { target, props: { items: [item, activeItem], onSelect, onToggleAttention, onDismiss, onToast: vi.fn() } });
    cleanups.push(() => unmount(component));
    await tick();

    target.querySelector<HTMLElement>('[aria-label="Unfollow Project A"]')!.click();
    target.querySelector<HTMLElement>('[aria-label="Dismiss Project A"]')!.click();
    await vi.waitFor(() => expect(onToggleAttention).toHaveBeenCalledWith("project-a", false));
    await vi.waitFor(() => expect(onDismiss).toHaveBeenCalledWith("project-a"));
    expect(onSelect).not.toHaveBeenCalled();
    expect(target.querySelector(".section-title")?.textContent).toBe("Activity");
    expect(target.querySelector(".activity-title")?.textContent).toContain("#1 · Agent Codex · Turn 2 · Focused resource");
    expect(target.querySelector(".activity-badge")?.textContent).toBe("Project");
    const selectedRow = target.querySelector<HTMLElement>('[aria-label^="Project A."]')!;
    const activeRow = target.querySelector<HTMLElement>('[aria-label^="Task B."]')!;
    expect(selectedRow.classList.contains("selected")).toBe(true);
    expect(selectedRow.getAttribute("aria-current")).toBe("page");
    expect(selectedRow.hasAttribute("data-active-turn")).toBe(false);
    expect(activeRow.classList.contains("selected")).toBe(false);
    expect(activeRow.hasAttribute("aria-current")).toBe(false);
    expect(activeRow.getAttribute("data-active-turn")).toBe("true");
    expect(activeRow.querySelector('[aria-label="Dismiss Task B"]')).toBeNull();
    expect([...selectedRow.children].map((child) => child.className)).toEqual([
      "activity-status", "activity-title", "activity-badge", "activity-actions",
    ]);
    expect([...activeRow.children].map((child) => child.className)).toEqual([
      "activity-status", "activity-title", "activity-badge", "activity-actions",
    ]);
  });

  it("PaneResizeHandle resizes and commits the Activity panel height", async () => {
    const app = document.body.appendChild(document.createElement("div"));
    app.id = "app";
    const sidebar = app.appendChild(document.createElement("aside"));
    sidebar.id = "mobileSidebar";
    const activity = sidebar.appendChild(document.createElement("section"));
    activity.className = "attention-section";
    const workspace = app.appendChild(document.createElement("main"));
    workspace.className = "workspace-panel";
    const chat = workspace.appendChild(document.createElement("aside"));
    chat.id = "agentPanel";
    vi.spyOn(app, "getBoundingClientRect").mockReturnValue({ width: 1_200 } as DOMRect);
    vi.spyOn(sidebar, "getBoundingClientRect").mockReturnValue({ width: 280, height: 800 } as DOMRect);
    vi.spyOn(activity, "getBoundingClientRect").mockReturnValue({ height: 210 } as DOMRect);
    vi.spyOn(workspace, "getBoundingClientRect").mockReturnValue({ width: 912 } as DOMRect);
    vi.spyOn(chat, "getBoundingClientRect").mockReturnValue({ width: 420 } as DOMRect);
    const onPreview = vi.fn();
    const onCommit = vi.fn();
    const component = mount(PaneResizeHandle, { target: sidebar, props: {
      id: "activityResize", kind: "sidebarAttentionHeight", className: "horizontal-resize sidebar-activity-resize",
      label: "Resize activity panel", onPreview, onCommit,
    } });
    cleanups.push(() => unmount(component));

    sidebar.querySelector<HTMLElement>("#activityResize")!.dispatchEvent(pointerEvent("pointerdown", 10, 100));
    window.dispatchEvent(pointerEvent("pointermove", 10, 140));
    expect(onPreview).toHaveBeenCalledWith("sidebarAttentionHeight", 170);
    expect(document.body.classList.contains("resizing-y")).toBe(true);
    window.dispatchEvent(pointerEvent("pointerup", 10, 140));
    expect(onCommit).toHaveBeenCalledWith("sidebarAttentionHeight");
    expect(document.body.classList.contains("resizing-y")).toBe(false);
  });
});
