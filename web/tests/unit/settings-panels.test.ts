import { mount, tick, unmount } from "svelte";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createSettingsDraft } from "../../src/components/settings-draft";
import type { SettingsModel } from "../../src/components/models";
import SettingsPanelHarness from "../fixtures/SettingsPanelHarness.svelte";

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
    workspaces: [{ id: "workspace-a", name: "Workspace A", path: "/tmp/a", icon: "blue" }],
    activeWorkspaceId: "workspace-a",
    workspaceIcons: [
      { id: "blue", label: "Blue", src: "/blue.png" },
      { id: "green", label: "Green", src: "/green.png" },
    ],
    workspaceIconSavingId: "",
    userName: "User",
    agentHub: {
      configuredEndpoint: "http://127.0.0.1:4646",
      connected: true,
      compatible: true,
      error: "",
      apiVersion: "v1",
      version: "1.2.3",
      capabilities: ["sessions"],
      providers: [{ id: "codex" }],
      agents: [{ name: "Codex", providerId: "codex", available: true }],
    },
    profiles: [
      { key: "default", description: "Default", agentName: "codex" },
      { key: "custom", description: "Custom", agentName: "missing" },
    ],
    agents: [{ id: "codex", label: "Codex", summary: "Primary agent" }],
    notifications: { browser: false, sound: true, permission: "default", permissionError: "", soundError: "" },
    onClose: vi.fn(),
    onAddWorkspace: vi.fn(async () => undefined),
    onRemoveWorkspace: vi.fn(async () => undefined),
    onWorkspaceIcon: vi.fn(async () => undefined),
    onSaveUser: vi.fn(async (name) => name.trim() || "User"),
    onSaveAgentHub: vi.fn(async () => undefined),
    onBrowserNotifications: vi.fn(),
    onCompletionSound: vi.fn(),
    onToast: vi.fn(),
    onIconsChanged: vi.fn(),
    ...overrides,
  };
}

function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

function input(element: HTMLInputElement, value: string): void {
  element.value = value;
  element.dispatchEvent(new InputEvent("input", { bubbles: true }));
}

describe("settings domain panels", () => {
  it("owns workspace add, icon, remove, pending deduplication, and failure reporting", async () => {
    const add = deferred<void>();
    const current = model({
      onAddWorkspace: vi.fn(() => add.promise),
      onRemoveWorkspace: vi.fn(async () => { throw new Error("remove failed"); }),
    });
    const draft = createSettingsDraft(current);
    const target = document.body.appendChild(document.createElement("div"));
    const component = mount(SettingsPanelHarness, { target, props: { panel: "workspace", model: current, initialDraft: draft } });
    cleanups.push(() => unmount(component));
    await tick();

    input(target.querySelector<HTMLInputElement>("#settingsWorkspacePath")!, " /tmp/new ");
    target.querySelector<HTMLButtonElement>('[type="submit"]')!.click();
    target.querySelector<HTMLButtonElement>('[type="submit"]')!.click();
    await tick();
    expect(current.onAddWorkspace).toHaveBeenCalledTimes(1);
    expect(target.querySelector<HTMLButtonElement>('[type="submit"]')?.disabled).toBe(true);
    expect(current.onAddWorkspace).toHaveBeenCalledWith(expect.objectContaining({ workspacePath: " /tmp/new " }));

    add.resolve();
    await vi.waitFor(() => expect(target.querySelector<HTMLButtonElement>('[type="submit"]')?.disabled).toBe(false));
    expect(target.querySelector<HTMLInputElement>("#settingsWorkspacePath")?.value).toBe("");

    target.querySelector<HTMLButtonElement>('[title="Change workspace icon"]')!.click();
    await tick();
    target.querySelector<HTMLButtonElement>('[title="Green"]')!.click();
    await vi.waitFor(() => expect(current.onWorkspaceIcon).toHaveBeenCalledWith("workspace-a", "green", expect.any(Object)));
    await vi.waitFor(() => expect(target.querySelector<HTMLButtonElement>('[title="Remove workspace"]')?.disabled).toBe(false));

    target.querySelector<HTMLButtonElement>('[title="Remove workspace"]')!.click();
    await vi.waitFor(() => expect(current.onToast).toHaveBeenCalledWith("remove failed"));
    expect(target.textContent).toContain("Active");
  });

  it("normalizes and persists browser-local user names while containing save failures", async () => {
    const save = deferred<string>();
    const onSaveUser = vi.fn()
      .mockImplementationOnce(() => save.promise)
      .mockRejectedValueOnce(new Error("user save failed"));
    const current = model({ onSaveUser });
    const draft = createSettingsDraft(current);
    const target = document.body.appendChild(document.createElement("div"));
    const component = mount(SettingsPanelHarness, { target, props: { panel: "user", model: current, initialDraft: draft } });
    cleanups.push(() => unmount(component));
    await tick();

    input(target.querySelector<HTMLInputElement>("#settingsUserName")!, "  Alice  ");
    const saveButton = target.querySelector<HTMLButtonElement>('[type="submit"]')!;
    saveButton.click();
    saveButton.click();
    await tick();
    expect(onSaveUser).toHaveBeenCalledTimes(1);
    expect(saveButton.disabled).toBe(true);

    save.resolve("Alice");
    await vi.waitFor(() => expect(saveButton.disabled).toBe(false));
    expect(target.querySelector<HTMLInputElement>("#settingsUserName")?.value).toBe("Alice");

    saveButton.click();
    await vi.waitFor(() => expect(current.onToast).toHaveBeenCalledWith("user save failed"));
  });

  it("owns AgentHub draft dirtiness, read-only catalog projection, save pending, and errors", async () => {
    const save = deferred<void>();
    const onSaveAgentHub = vi.fn()
      .mockImplementationOnce(() => save.promise)
      .mockRejectedValueOnce(new Error("hub save failed"));
    const current = model({ onSaveAgentHub });
    const draft = createSettingsDraft(current);
    const target = document.body.appendChild(document.createElement("div"));
    const component = mount(SettingsPanelHarness, { target, props: { panel: "agenthub", model: current, initialDraft: draft } });
    cleanups.push(() => unmount(component));
    await tick();

    expect(target.textContent).toContain("Compatible");
    expect(target.textContent).toContain("Codex");
    expect(target.textContent).toContain("1 agents · 1 providers");

    input(target.querySelector<HTMLInputElement>("#settingsAgentHubEndpoint")!, "http://127.0.0.1:5656");
    await tick();
    const saveButton = target.querySelector<HTMLButtonElement>("#settingsSaveButton")!;
    expect(target.querySelector(".settings-save-hint.visible")).toBeTruthy();
    saveButton.click();
    saveButton.click();
    await tick();
    expect(onSaveAgentHub).toHaveBeenCalledTimes(1);
    expect(onSaveAgentHub).toHaveBeenCalledWith(expect.objectContaining({ endpoint: "http://127.0.0.1:5656", dirty: true }));
    expect(saveButton.disabled).toBe(true);

    save.resolve();
    await vi.waitFor(() => expect(target.querySelector(".settings-save-hint.visible")).toBeNull());
    input(target.querySelector<HTMLInputElement>("#settingsAgentHubEndpoint")!, "http://bad");
    await tick();
    saveButton.click();
    await vi.waitFor(() => expect(current.onToast).toHaveBeenCalledWith("hub save failed"));
    expect(target.querySelector(".settings-save-hint.visible")).toBeTruthy();
  });

  it("enforces system/custom profile rules, unavailable routes, and shared save pending", async () => {
    const save = deferred<void>();
    const current = model({ onSaveAgentHub: vi.fn(() => save.promise) });
    const draft = createSettingsDraft(current);
    const target = document.body.appendChild(document.createElement("div"));
    const component = mount(SettingsPanelHarness, { target, props: { panel: "profiles", model: current, initialDraft: draft } });
    cleanups.push(() => unmount(component));
    await tick();

    const profileKeys = target.querySelectorAll<HTMLInputElement>('[aria-label="Profile key"]');
    expect(profileKeys[0].disabled).toBe(true);
    expect(target.textContent).toContain("System");
    expect(target.querySelectorAll<HTMLSelectElement>('[aria-label="AgentHub Agent"]')[1]?.textContent).toContain("missing (Unavailable)");

    target.querySelector<HTMLButtonElement>('[title="Delete Profile"]')!.click();
    await tick();
    expect([...target.querySelectorAll<HTMLInputElement>('[aria-label="Profile key"]')].map((field) => field.value)).toEqual(["default"]);
    expect(target.querySelector(".settings-save-hint.visible")).toBeTruthy();

    const newKey = target.querySelector<HTMLInputElement>("#settingsNewProfileKey")!;
    input(newKey, "FAST");
    target.querySelector<HTMLButtonElement>("#settingsAddProfileButton")!.click();
    expect(current.onToast).toHaveBeenCalledWith("fast is a reserved system profile.");

    input(newKey, " Review ");
    input(target.querySelector<HTMLInputElement>("#settingsNewProfileDescription")!, " Review work ");
    target.querySelector<HTMLButtonElement>("#settingsAddProfileButton")!.click();
    await tick();
    expect([...target.querySelectorAll<HTMLInputElement>('[aria-label="Profile key"]')].at(-1)?.value).toBe("review");
    expect([...target.querySelectorAll<HTMLInputElement>('[aria-label="Summary"]')].at(-1)?.value).toBe("Review work");

    const saveButton = [...target.querySelectorAll<HTMLButtonElement>("button")].find((button) => button.textContent?.includes("Save All"))!;
    saveButton.click();
    saveButton.click();
    await tick();
    expect(current.onSaveAgentHub).toHaveBeenCalledTimes(1);
    expect(saveButton.disabled).toBe(true);
    save.resolve();
    await vi.waitFor(() => expect(target.querySelector(".settings-save-hint.visible")).toBeNull());
  });

  it("projects notification permission and sound errors and forwards both toggles", async () => {
    const current = model({
      notifications: { browser: false, sound: true, permission: "denied", permissionError: "Notifications are blocked.", soundError: "Audio unavailable." },
    });
    const target = document.body.appendChild(document.createElement("div"));
    const component = mount(SettingsPanelHarness, { target, props: { panel: "notifications", model: current, initialDraft: createSettingsDraft(current) } });
    cleanups.push(() => unmount(component));
    await tick();

    expect(target.textContent).toContain("Notifications are blocked.");
    expect(target.textContent).toContain("Audio unavailable.");
    target.querySelector<HTMLInputElement>("#settingsBrowserNotifications")!.click();
    target.querySelector<HTMLInputElement>("#settingsCompletionSound")!.click();
    expect(current.onBrowserNotifications).toHaveBeenCalledWith(true);
    expect(current.onCompletionSound).toHaveBeenCalledWith(false);
  });
});
