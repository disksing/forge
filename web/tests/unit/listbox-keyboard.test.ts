import { mount, tick, unmount } from "svelte";
import { afterEach, describe, expect, it, vi } from "vitest";

import AgentBindingSelector from "../../src/components/AgentBindingSelector.svelte";
import WorkspaceSwitcher from "../../src/components/WorkspaceSwitcher.svelte";

const cleanups: Array<() => Promise<void>> = [];

afterEach(async () => {
  while (cleanups.length) await cleanups.pop()?.();
  document.body.replaceChildren();
});

function press(element: HTMLElement, key: string): void {
  element.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));
}

function selectedStates(menu: HTMLElement): Array<string | null> {
  return Array.from(menu.querySelectorAll<HTMLElement>('[role="option"]')).map((el) => el.getAttribute("aria-selected"));
}

// Opening moves focus to the selected option through a deferred tick; wait
// until that lands so the subsequent keydown assertions see a settled focus.
async function settleFocus(): Promise<void> {
  await vi.waitFor(() => expect(document.activeElement?.getAttribute("role")).toBe("option"));
}

describe("AgentBindingSelector listbox keyboard navigation", () => {
  function mountSelector(onSelect = vi.fn(), overrides: Record<string, unknown> = {}) {
    const target = document.body.appendChild(document.createElement("div"));
    const component = mount(AgentBindingSelector, { target, props: {
      value: { kind: "profile", name: "default" },
      profiles: [
        { key: "default", agentName: "" },
        { key: "fast", agentName: "" },
        { key: "reasoning", agentName: "" },
      ],
      agents: [],
      onSelect,
      ...overrides,
    } });
    cleanups.push(() => unmount(component));
    return { target, component };
  }

  it("moves focus and selected state with ArrowDown/ArrowUp/Home/End", async () => {
    const { target } = mountSelector();
    await tick();

    const button = target.querySelector<HTMLButtonElement>(".agent-binding-button")!;
    button.click();
    await tick();
    const menu = target.querySelector<HTMLElement>(".agent-binding-menu")!;
    await settleFocus();

    expect(Array.from(menu.querySelectorAll<HTMLElement>('[role="option"]')).map((el) => el.dataset.binding))
      .toEqual(["profile:default", "profile:fast", "profile:reasoning"]);
    expect(selectedStates(menu)).toEqual(["true", "false", "false"]);

    press(menu, "ArrowDown");
    await tick();
    expect(selectedStates(menu)).toEqual(["false", "true", "false"]);
    expect(document.activeElement?.getAttribute("data-binding")).toBe("profile:fast");

    press(menu, "ArrowUp");
    await tick();
    expect(selectedStates(menu)).toEqual(["true", "false", "false"]);

    // ArrowUp before the first option wraps around to the last one.
    press(menu, "ArrowUp");
    await tick();
    expect(selectedStates(menu)).toEqual(["false", "false", "true"]);
    expect(document.activeElement?.getAttribute("data-binding")).toBe("profile:reasoning");

    press(menu, "Home");
    await tick();
    expect(selectedStates(menu)).toEqual(["true", "false", "false"]);
    expect(document.activeElement?.getAttribute("data-binding")).toBe("profile:default");

    press(menu, "End");
    await tick();
    expect(selectedStates(menu)).toEqual(["false", "false", "true"]);
  });

  it("commits the highlighted option on Enter and Space", async () => {
    const onSelect = vi.fn();
    const { target } = mountSelector(onSelect);
    await tick();

    const button = target.querySelector<HTMLButtonElement>(".agent-binding-button")!;
    button.click();
    await tick();
    const menu = target.querySelector<HTMLElement>(".agent-binding-menu")!;
    await settleFocus();

    press(menu, "ArrowDown");
    await tick();
    press(menu, "Enter");
    await tick();
    expect(onSelect).toHaveBeenCalledWith({ kind: "profile", name: "fast" });
    expect(target.querySelector(".agent-binding-menu")).toBeNull();

    // Space commits the same way after reopening.
    button.click();
    await tick();
    const reopened = target.querySelector<HTMLElement>(".agent-binding-menu")!;
    await settleFocus();
    press(reopened, "ArrowDown");
    await tick();
    press(reopened, " ");
    await tick();
    expect(onSelect).toHaveBeenCalledTimes(2);
    expect(onSelect).toHaveBeenLastCalledWith({ kind: "profile", name: "fast" });
    expect(target.querySelector(".agent-binding-menu")).toBeNull();
  });

  it("closes and returns focus to the trigger button on Escape", async () => {
    const onSelect = vi.fn();
    const { target } = mountSelector(onSelect);
    await tick();

    const button = target.querySelector<HTMLButtonElement>(".agent-binding-button")!;
    button.click();
    await tick();
    const menu = target.querySelector<HTMLElement>(".agent-binding-menu")!;
    await settleFocus();

    press(menu, "Escape");
    await tick();
    expect(target.querySelector(".agent-binding-menu")).toBeNull();
    expect(document.activeElement).toBe(button);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("includes the inherit pseudo option in keyboard navigation", async () => {
    const onSelect = vi.fn();
    const { target } = mountSelector(onSelect, { allowInherit: true, value: { kind: "profile", name: "default" } });
    await tick();

    const button = target.querySelector<HTMLButtonElement>(".agent-binding-button")!;
    button.click();
    await tick();
    const menu = target.querySelector<HTMLElement>(".agent-binding-menu")!;
    await settleFocus();

    expect(Array.from(menu.querySelectorAll<HTMLElement>('[role="option"]')).map((el) => el.dataset.binding))
      .toEqual(["inherit", "profile:default", "profile:fast", "profile:reasoning"]);
    expect(selectedStates(menu)).toEqual(["false", "true", "false", "false"]);

    press(menu, "Home");
    await tick();
    expect(selectedStates(menu)).toEqual(["true", "false", "false", "false"]);
    expect(document.activeElement?.getAttribute("data-binding")).toBe("inherit");

    press(menu, "Enter");
    await tick();
    expect(onSelect).toHaveBeenCalledWith({ kind: "profile", name: "" });
  });
});

describe("WorkspaceSwitcher listbox keyboard navigation", () => {
  function mountSwitcher(overrides: Record<string, unknown> = {}) {
    const target = document.body.appendChild(document.createElement("div"));
    const component = mount(WorkspaceSwitcher, { target, props: {
      identity: "workspace-a",
      mobileSidebarOpen: false,
      activeWorkspaceId: "workspace-a",
      workspaces: [
        { id: "workspace-a", name: "Workspace A", path: "/tmp/a", iconSrc: "/favicon.svg" },
        { id: "workspace-b", name: "Workspace B", path: "/tmp/b", iconSrc: "/favicon.svg" },
        { id: "workspace-c", name: "Workspace C", path: "/tmp/c", iconSrc: "/favicon.svg" },
      ],
      onSwitch: vi.fn(async () => undefined),
      onOpen: vi.fn(async () => undefined),
      onAdd: vi.fn(),
      onToast: vi.fn(),
      ...overrides,
    } });
    cleanups.push(() => unmount(component));
    return { target, component };
  }

  it("moves focus and selected state with ArrowDown/ArrowUp/Home/End", async () => {
    const { target } = mountSwitcher();
    await tick();

    const opener = target.querySelector<HTMLButtonElement>("#workspaceSwitcher")!;
    opener.click();
    await tick();
    const menu = target.querySelector<HTMLElement>("#workspaceMenu")!;
    await settleFocus();

    expect(Array.from(menu.querySelectorAll<HTMLElement>('[role="option"]')).map((el) => el.dataset.workspaceId))
      .toEqual(["workspace-a", "workspace-b", "workspace-c"]);
    expect(selectedStates(menu)).toEqual(["true", "false", "false"]);

    press(menu, "ArrowDown");
    await tick();
    expect(selectedStates(menu)).toEqual(["false", "true", "false"]);
    expect(document.activeElement?.getAttribute("data-workspace-id")).toBe("workspace-b");

    press(menu, "End");
    await tick();
    expect(selectedStates(menu)).toEqual(["false", "false", "true"]);
    expect(document.activeElement?.getAttribute("data-workspace-id")).toBe("workspace-c");

    press(menu, "ArrowUp");
    await tick();
    expect(selectedStates(menu)).toEqual(["false", "true", "false"]);

    press(menu, "Home");
    await tick();
    expect(selectedStates(menu)).toEqual(["true", "false", "false"]);
  });

  it("switches to the highlighted workspace on Enter and Space", async () => {
    const onSwitch = vi.fn(async () => undefined);
    const { target } = mountSwitcher({ onSwitch });
    await tick();

    const opener = target.querySelector<HTMLButtonElement>("#workspaceSwitcher")!;
    opener.click();
    await tick();
    const menu = target.querySelector<HTMLElement>("#workspaceMenu")!;
    await settleFocus();

    press(menu, "ArrowDown");
    await tick();
    press(menu, "Enter");
    await vi.waitFor(() => expect(onSwitch).toHaveBeenCalledWith("workspace-b"));
    expect(target.querySelector("#workspaceMenu")).toBeNull();

    opener.click();
    await tick();
    const reopened = target.querySelector<HTMLElement>("#workspaceMenu")!;
    await settleFocus();
    press(reopened, "ArrowDown");
    await tick();
    press(reopened, " ");
    await vi.waitFor(() => expect(onSwitch).toHaveBeenCalledTimes(2));
    expect(onSwitch).toHaveBeenLastCalledWith("workspace-b");
  });

  it("closes and returns focus to the opener on Escape", async () => {
    const { target } = mountSwitcher();
    await tick();

    const opener = target.querySelector<HTMLButtonElement>("#workspaceSwitcher")!;
    opener.click();
    await tick();
    const menu = target.querySelector<HTMLElement>("#workspaceMenu")!;
    await settleFocus();

    press(menu, "Escape");
    await tick();
    expect(target.querySelector("#workspaceMenu")).toBeNull();
    expect(document.activeElement).toBe(opener);
  });
});
