import { mount, tick, unmount } from "svelte";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createModelChannel } from "../../src/components/model-channel";
import type { SettingsModel } from "../../src/components/models";
import SettingsModal from "../../src/components/SettingsModal.svelte";

const cleanups: Array<() => Promise<void>> = [];

afterEach(async () => {
  while (cleanups.length) await cleanups.pop()?.();
  document.body.replaceChildren();
});

function model(overrides: Partial<SettingsModel> = {}): SettingsModel {
  return {
    open: true,
    identity: "settings-1",
    dataVersion: 1,
    initialTab: "workspace",
    workspaces: [{ id: "workspace-a", name: "Workspace A", path: "/tmp/a" }],
    activeWorkspaceId: "workspace-a",
    workspaceIcons: [{ id: "", label: "PUA default", src: "/favicon.svg" }],
    workspaceIconSavingId: "",
    userName: "User",
    appearance: { layout: "auto", fontScales: { sidebar: 1, details: 1, chat: 1 } },
    agentHub: {
      configuredEndpoint: "http://127.0.0.1:4646",
      connected: true,
      compatible: true,
      error: "",
      apiVersion: "v1",
      version: "1.2.3",
      capabilities: [],
      providers: [],
      agents: [],
    },
    profiles: [{ key: "default", description: "Default", agentName: "codex" }],
    agents: [{ id: "codex", label: "Codex", summary: "Primary" }],
    notifications: { browser: false, sound: false, permission: "default", permissionError: "", soundError: "" },
    onClose: vi.fn(),
    onAddWorkspace: vi.fn(async () => undefined),
    onRemoveWorkspace: vi.fn(async () => undefined),
    onWorkspaceIcon: vi.fn(async () => undefined),
    onSaveWorkspaceName: vi.fn(async () => undefined),
    onSaveUser: vi.fn(async (name) => name.trim() || "User"),
    onLayoutPreference: vi.fn(),
    onFontScale: vi.fn(),
    onResetFontScales: vi.fn(),
    onSaveAgentHub: vi.fn(async () => undefined),
    onBrowserNotifications: vi.fn(),
    onCompletionSound: vi.fn(),
    onToast: vi.fn(),
    ...overrides,
  };
}

function input(element: HTMLInputElement, value: string): void {
  element.value = value;
  element.dispatchEvent(new InputEvent("input", { bubbles: true }));
}

describe("SettingsModal coordination", () => {
  it("preserves a user draft while settings data refreshes and saves it", async () => {
    const initial = model({ initialTab: "user", userName: "" });
    const channel = createModelChannel(initial);
    const target = document.body.appendChild(document.createElement("div"));
    const component = mount(SettingsModal, { target, props: { channel } });
    cleanups.push(() => unmount(component));
    await tick();

    const name = target.querySelector<HTMLInputElement>("#settingsUserName")!;
    input(name, "Probe");
    await tick();
    expect(name.value).toBe("Probe");
    channel.publish({ ...initial, dataVersion: 1, userName: "Remote User" });
    await tick();
    expect(name.value).toBe("Probe");
    channel.publish({ ...initial, dataVersion: 2, userName: "" });
    await tick();

    expect(target.querySelector("[data-component-owner=\"user-settings-panel\"]")).toBeTruthy();
    expect(name.value).toBe("Probe");
    name.form!.requestSubmit();
    await vi.waitFor(() => expect(initial.onSaveUser).toHaveBeenCalledWith("Probe"));
    expect(name.value).toBe("Probe");
  });

  it("composes all domain panels and preserves a dirty focused draft across data refreshes", async () => {
    const initial = model();
    const channel = createModelChannel(initial);
    const target = document.body.appendChild(document.createElement("div"));
    target.dataset.componentOwner = "settings";
    const component = mount(SettingsModal, { target, props: { channel } });
    cleanups.push(() => unmount(component));
    await tick();

    const tabs = [...target.querySelectorAll<HTMLButtonElement>(".settings-tab")];
    expect(tabs.map((tab) => tab.textContent?.trim())).toEqual(["Workspace", "User", "Appearance", "AgentHub", "Profiles", "Notifications"]);
    tabs.find((tab) => tab.textContent?.includes("AgentHub"))!.click();
    await tick();

    const endpoint = target.querySelector<HTMLInputElement>("#settingsAgentHubEndpoint")!;
    input(endpoint, "http://127.0.0.1:5656");
    endpoint.focus();
    await tick();
    expect(target.querySelectorAll(".settings-tab.dirty")).toHaveLength(2);

    channel.publish({
      ...initial,
      dataVersion: 2,
      userName: "Refreshed User",
      agentHub: { ...initial.agentHub, configuredEndpoint: "http://127.0.0.1:9999" },
    });
    await tick();

    const preserved = target.querySelector<HTMLInputElement>("#settingsAgentHubEndpoint")!;
    expect(preserved).toBe(endpoint);
    expect(preserved.value).toBe("http://127.0.0.1:5656");
    expect(document.activeElement).toBe(preserved);

    tabs.find((tab) => tab.textContent?.includes("Profiles"))!.click();
    await tick();
    expect(target.querySelector('[data-component-owner="profiles-settings-panel"]')).toBeTruthy();
    target.querySelector<HTMLButtonElement>(".settings-close")!.click();
    expect(initial.onClose).toHaveBeenCalledWith(true);
  });

  it("deduplicates shared save pending, refreshes clean drafts, and resets dirty state on identity changes", async () => {
    let resolveSave!: () => void;
    const save = new Promise<void>((resolve) => { resolveSave = resolve; });
    const onSaveAgentHub = vi.fn(() => save);
    const initial = model({ initialTab: "agenthub", onSaveAgentHub });
    const channel = createModelChannel(initial);
    const target = document.body.appendChild(document.createElement("div"));
    const component = mount(SettingsModal, { target, props: { channel } });
    cleanups.push(() => unmount(component));
    await tick();

    input(target.querySelector<HTMLInputElement>("#settingsAgentHubEndpoint")!, "http://127.0.0.1:5656");
    await tick();
    const saveButton = target.querySelector<HTMLButtonElement>("#settingsSaveButton")!;
    saveButton.click();
    saveButton.click();
    await tick();
    expect(onSaveAgentHub).toHaveBeenCalledTimes(1);
    expect(saveButton.disabled).toBe(true);

    resolveSave();
    await vi.waitFor(() => expect(target.querySelectorAll(".settings-tab.dirty")).toHaveLength(0));
    channel.publish({
      ...initial,
      dataVersion: 2,
      agentHub: { ...initial.agentHub, configuredEndpoint: "http://127.0.0.1:7777" },
    });
    await tick();
    expect(target.querySelector<HTMLInputElement>("#settingsAgentHubEndpoint")?.value).toBe("http://127.0.0.1:7777");

    input(target.querySelector<HTMLInputElement>("#settingsAgentHubEndpoint")!, "http://dirty");
    await tick();
    channel.publish({
      ...initial,
      identity: "settings-2",
      dataVersion: 3,
      agentHub: { ...initial.agentHub, configuredEndpoint: "http://identity-reset" },
    });
    await tick();
    expect(target.querySelector<HTMLInputElement>("#settingsAgentHubEndpoint")?.value).toBe("http://identity-reset");
    expect(target.querySelectorAll(".settings-tab.dirty")).toHaveLength(0);
  });

  it("routes overlay and Escape closes through the parent with current dirty state", async () => {
    const current = model();
    const channel = createModelChannel(current);
    const target = document.body.appendChild(document.createElement("div"));
    const component = mount(SettingsModal, { target, props: { channel } });
    cleanups.push(() => unmount(component));
    await tick();

    target.querySelector<HTMLButtonElement>('.settings-tab:nth-of-type(4)')!.click();
    await tick();
    input(target.querySelector<HTMLInputElement>("#settingsAgentHubEndpoint")!, "http://dirty");
    await tick();
    target.querySelector<HTMLButtonElement>(".settings-overlay")!.click();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    expect(current.onClose).toHaveBeenNthCalledWith(1, true);
    expect(current.onClose).toHaveBeenNthCalledWith(2, true);
  });
});
