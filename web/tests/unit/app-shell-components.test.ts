import { mount, tick, unmount } from "svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import MobileToolbar from "../../src/components/MobileToolbar.svelte";
import ProjectTree from "../../src/components/ProjectTree.svelte";
import WorkspaceSwitcher from "../../src/components/WorkspaceSwitcher.svelte";
import type { ShellResourceItem, ShellStatusPresentation } from "../../src/components/models";

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
    const projectA = { ...resource("project-a"), expanded: true, children: [resource("task-a", "task")] };
    const target = document.body.appendChild(document.createElement("div"));
    const component = mount(ProjectTree, { target, props: {
      identity: "workspace-a", loading: false, error: "", projects: [projectA, resource("project-b")],
      onCreate: vi.fn(), onToggle, onSelect, onReorder, onDragState, onToast: vi.fn(),
    } });
    cleanups.push(() => unmount(component));
    await tick();

    target.querySelector<HTMLElement>('[data-project-toggle="project-a"]')!.click();
    target.querySelector<HTMLButtonElement>('[aria-label="task-a"]')!.click();
    await vi.waitFor(() => expect(onToggle).toHaveBeenCalledWith("project-a"));
    await vi.waitFor(() => expect(onSelect).toHaveBeenCalledWith("task-a"));

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
});
