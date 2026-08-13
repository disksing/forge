import { mount, tick, unmount } from "svelte";
import { afterEach, describe, expect, it, vi } from "vitest";

import ChatComposer from "../../src/components/ChatComposer.svelte";
import { createModelChannel } from "../../src/components/model-channel";
import type { ComposerModel } from "../../src/components/models";

const cleanups: Array<() => Promise<void>> = [];
afterEach(async () => {
  while (cleanups.length) await cleanups.pop()?.();
  document.body.replaceChildren();
});

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((done, fail) => { resolve = done; reject = fail; });
  return { promise, resolve, reject };
}

function model(overrides: Partial<ComposerModel> = {}): ComposerModel {
  return {
    identity: "workspace-a:task-a:draft-a", workspaceId: "workspace-a", resourceId: "task-a",
    draft: "", draftKey: "draft-a", draftResetVersion: 0,
    unavailableReason: "", sending: false, canEndTurn: false, endingTurn: false,
    waitingMessages: [], canSteerWaiting: false, steeringMessageId: "", onDraft: vi.fn(),
    onSend: vi.fn(async () => ({ accepted: true, clear: true })), onOpenUpload: vi.fn(), onEndTurn: vi.fn(),
    onSteerWaiting: vi.fn(async () => undefined), onIconsChanged: vi.fn(),
    agentBinding: { kind: "profile", name: "default" },
    agentProfiles: [{ key: "default", description: "Default", agentName: "fake-agent" }],
    agents: [{ id: "fake-agent", label: "Fake Agent", summary: "fake" }],
    bindingSaving: false, onSaveAgentBinding: vi.fn(async () => undefined),
    ...overrides,
  };
}

describe("ChatComposer", () => {
  it("does not overwrite input entered before the mount subscription settles", async () => {
    const channel = createModelChannel(model());
    const target = document.body.appendChild(document.createElement("div"));
    const component = mount(ChatComposer, { target, props: { channel } });
    cleanups.push(() => unmount(component));

    const input = target.querySelector<HTMLTextAreaElement>("#ttyInput")!;
    input.value = "typed immediately";
    input.dispatchEvent(new InputEvent("input", { bubbles: true }));
    await tick();
    expect(input.value).toBe("typed immediately");
  });

  it("keeps an in-progress resource draft when metadata is republished", async () => {
    const channel = createModelChannel(model());
    const target = document.body.appendChild(document.createElement("div"));
    const component = mount(ChatComposer, { target, props: { channel } });
    cleanups.push(() => unmount(component));
    await tick();

    const input = target.querySelector<HTMLTextAreaElement>("#ttyInput")!;
    input.value = "typed while runs load";
    input.dispatchEvent(new InputEvent("input", { bubbles: true }));
    channel.publish(model({ unavailableReason: "" }));
    await tick();

    expect(input.value).toBe("typed while runs load");
  });

  it("does not let a late accepted send clear a different resource draft", async () => {
    const result = deferred<{ accepted: boolean; clear: boolean }>();
    const first = model({ onSend: vi.fn(() => result.promise) });
    const channel = createModelChannel(first);
    const target = document.body.appendChild(document.createElement("div"));
    const component = mount(ChatComposer, { target, props: { channel } });
    cleanups.push(() => unmount(component));
    await tick();

    const input = target.querySelector<HTMLTextAreaElement>("#ttyInput")!;
    input.value = "message for run a";
    input.dispatchEvent(new InputEvent("input", { bubbles: true }));
    target.querySelector<HTMLFormElement>("#ttyForm")!.dispatchEvent(new SubmitEvent("submit", { bubbles: true, cancelable: true }));
    await tick();

    channel.publish(model({ identity: "workspace-a:task-b:draft-b", resourceId: "task-b", draftKey: "draft-b", draft: "draft for task b" }));
    await tick();
    result.resolve({ accepted: true, clear: true });
    await result.promise;
    await tick();

    expect(target.querySelector<HTMLTextAreaElement>("#ttyInput")?.value).toBe("draft for task b");
  });

  it("keeps failed text and offers an explicit retry", async () => {
    const onSend = vi.fn().mockRejectedValueOnce(new Error("temporary failure")).mockResolvedValueOnce({ accepted: true, clear: true });
    const channel = createModelChannel(model({ onSend }));
    const target = document.body.appendChild(document.createElement("div"));
    const component = mount(ChatComposer, { target, props: { channel } });
    cleanups.push(() => unmount(component));
    await tick();

    const input = target.querySelector<HTMLTextAreaElement>("#ttyInput")!;
    input.value = "retry me";
    input.dispatchEvent(new InputEvent("input", { bubbles: true }));
    target.querySelector<HTMLFormElement>("#ttyForm")!.dispatchEvent(new SubmitEvent("submit", { bubbles: true, cancelable: true }));
    await vi.waitFor(() => expect(target.querySelector("[role=alert]")?.textContent).toContain("temporary failure"));
    expect(input.value).toBe("retry me");

    target.querySelector<HTMLButtonElement>("[role=alert] button")!.click();
    await vi.waitFor(() => expect(onSend).toHaveBeenCalledTimes(2));
    await tick();
    expect(input.value).toBe("");
  });

  it("shows waiting messages above the input and steers the same message id", async () => {
    const onSteerWaiting = vi.fn(async () => undefined);
    const channel = createModelChannel(model({
      canSteerWaiting: true,
      waitingMessages: [{ messageId: "msg-waiting", text: "Please check the failing test", status: "waiting", acceptedAt: "2026-08-12T12:00:00Z", requestedMode: "enqueue", actualMode: "enqueue" }],
      onSteerWaiting,
    }));
    const target = document.body.appendChild(document.createElement("div"));
    const component = mount(ChatComposer, { target, props: { channel } });
    cleanups.push(() => unmount(component));
    await tick();

    const queue = target.querySelector<HTMLElement>(".tty-message-queue")!;
    expect(queue.textContent).toContain("Please check the failing test");
    expect(queue.compareDocumentPosition(target.querySelector("#ttyForm")!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    queue.querySelector<HTMLButtonElement>(".tty-message-steer")!.click();
    await vi.waitFor(() => expect(onSteerWaiting).toHaveBeenCalledWith("msg-waiting"));
  });

  it("keeps insert disabled when the current turn cannot steer", async () => {
    const channel = createModelChannel(model({
      waitingMessages: [{ messageId: "msg-waiting", text: "Wait here", status: "waiting", acceptedAt: "", requestedMode: "enqueue", actualMode: "enqueue" }],
    }));
    const target = document.body.appendChild(document.createElement("div"));
    const component = mount(ChatComposer, { target, props: { channel } });
    cleanups.push(() => unmount(component));
    await tick();

    expect(target.querySelector<HTMLButtonElement>(".tty-message-steer")?.disabled).toBe(true);
  });

  it("renders the current agent binding in the composer options bar", async () => {
    const channel = createModelChannel(model());
    const target = document.body.appendChild(document.createElement("div"));
    const component = mount(ChatComposer, { target, props: { channel } });
    cleanups.push(() => unmount(component));
    await tick();

    const bar = target.querySelector<HTMLElement>(".tty-composer-bar")!;
    const selector = bar.querySelector<HTMLButtonElement>('[aria-label="Binding target"]')!;
    expect(selector).not.toBeNull();
    expect(selector.textContent).toContain("default (current: Fake Agent)");
    expect(selector.disabled).toBe(false);
    expect(bar.querySelector("#agentUploadButton")).not.toBeNull();
  });

  it("saves a new agent binding as soon as the selection changes", async () => {
    const onSaveAgentBinding = vi.fn(async () => undefined);
    const channel = createModelChannel(model({
      agentProfiles: [
        { key: "default", description: "Default", agentName: "fake-agent" },
        { key: "fast", description: "Fast", agentName: "fake-agent" },
      ],
      agents: [{ id: "fake-agent", label: "Fake Agent", summary: "fake" }, { id: "other-agent", label: "Other Agent", summary: "other" }],
      onSaveAgentBinding,
    }));
    const target = document.body.appendChild(document.createElement("div"));
    const component = mount(ChatComposer, { target, props: { channel } });
    cleanups.push(() => unmount(component));
    await tick();

    const selector = target.querySelector<HTMLButtonElement>('[aria-label="Binding target"]')!;
    selector.click();
    await tick();
    target.querySelector<HTMLButtonElement>('[data-binding="agent:other-agent"]')!.click();
    await vi.waitFor(() => expect(onSaveAgentBinding).toHaveBeenCalledWith({ kind: "agent", name: "other-agent" }));
  });

  it("keeps the selector controlled until the saved binding is published", async () => {
    const channel = createModelChannel(model({
      agents: [{ id: "other-agent", label: "Other Agent", summary: "other" }],
      onSaveAgentBinding: vi.fn(async () => undefined),
    }));
    const target = document.body.appendChild(document.createElement("div"));
    const component = mount(ChatComposer, { target, props: { channel } });
    cleanups.push(() => unmount(component));
    await tick();

    const selector = target.querySelector<HTMLButtonElement>('[aria-label="Binding target"]')!;
    selector.click();
    await tick();
    target.querySelector<HTMLButtonElement>('[data-binding="agent:other-agent"]')!.click();
    await tick();
    expect(selector.textContent).toContain("default (current: fake-agent)");

    channel.publish(model({ agentBinding: { kind: "agent", name: "other-agent" }, agents: [{ id: "other-agent", label: "Other Agent", summary: "other" }] }));
    await tick();
    expect(selector.textContent).toContain("Other Agent");
  });

  it("disables the binding selector while a binding is being saved", async () => {
    const channel = createModelChannel(model({ bindingSaving: true }));
    const target = document.body.appendChild(document.createElement("div"));
    const component = mount(ChatComposer, { target, props: { channel } });
    cleanups.push(() => unmount(component));
    await tick();

    expect(target.querySelector<HTMLButtonElement>('[aria-label="Binding target"]')?.disabled).toBe(true);
  });

  it("keeps send and end-turn icons static and toggles busy state through classes", async () => {
    const channel = createModelChannel(model({ canEndTurn: true }));
    const target = document.body.appendChild(document.createElement("div"));
    const component = mount(ChatComposer, { target, props: { channel } });
    cleanups.push(() => unmount(component));
    await tick();

    const send = target.querySelector<HTMLButtonElement>(".tty-send-button")!;
    const endTurn = target.querySelector<HTMLButtonElement>("#agentEndTurnButton")!;
    // Idle and busy icons are both rendered statically so the lucide
    // createIcons replacement never needs a later name update.
    expect(send.querySelector('i[data-lucide="send"]')).not.toBeNull();
    expect(send.querySelector('i[data-lucide="loader-circle"]')).not.toBeNull();
    expect(endTurn.querySelector('i[data-lucide="pause"]')).not.toBeNull();
    expect(endTurn.querySelector('i[data-lucide="loader-circle"]')).not.toBeNull();
    expect(send.classList.contains("busy")).toBe(false);
    expect(endTurn.classList.contains("busy")).toBe(false);
  });

  it("switches the send button to its busy class while a send is in flight", async () => {
    const result = deferred<{ accepted: boolean; clear: boolean }>();
    const channel = createModelChannel(model({ onSend: vi.fn(() => result.promise) }));
    const target = document.body.appendChild(document.createElement("div"));
    const component = mount(ChatComposer, { target, props: { channel } });
    cleanups.push(() => unmount(component));
    await tick();

    const input = target.querySelector<HTMLTextAreaElement>("#ttyInput")!;
    input.value = "send me";
    input.dispatchEvent(new InputEvent("input", { bubbles: true }));
    target.querySelector<HTMLFormElement>("#ttyForm")!.dispatchEvent(new SubmitEvent("submit", { bubbles: true, cancelable: true }));
    await tick();

    const send = target.querySelector<HTMLButtonElement>(".tty-send-button")!;
    expect(send.classList.contains("busy")).toBe(true);
    expect(send.disabled).toBe(true);

    result.resolve({ accepted: true, clear: true });
    await result.promise;
    await tick();
    expect(send.classList.contains("busy")).toBe(false);
  });
});
