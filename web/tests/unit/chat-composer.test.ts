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
    identity: "workspace-a:task-a:run-a:draft-a", workspaceId: "workspace-a", resourceId: "task-a", runId: "run-a",
    runStatus: "idle", live: true, canResume: false, draft: "", draftKey: "draft-a", draftResetVersion: 0,
    unavailableReason: "", sending: false, agents: [], selectedAgentId: "",
    chooserOpen: false, sessionStarting: false, actionsOpen: false, canEndTurn: false, endingTurn: false,
    closingSession: false, waitingMessages: [], canSteerWaiting: false, steeringMessageId: "", onDraft: vi.fn(),
    onSend: vi.fn(async () => ({ accepted: true, clear: true })), onOpenUpload: vi.fn(), onToggleChooser: vi.fn(),
    onChooseAgent: vi.fn(), onToggleActions: vi.fn(), onResume: vi.fn(), onEndTurn: vi.fn(), onCloseSession: vi.fn(),
    onSteerWaiting: vi.fn(async () => undefined), onIconsChanged: vi.fn(), ...overrides,
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

  it("preserves a resource draft when the initial run projection arrives", async () => {
    const channel = createModelChannel(model({ identity: "workspace-a:task-a:none:", runId: "", draftKey: "" }));
    const target = document.body.appendChild(document.createElement("div"));
    const component = mount(ChatComposer, { target, props: { channel } });
    cleanups.push(() => unmount(component));
    await tick();

    const input = target.querySelector<HTMLTextAreaElement>("#ttyInput")!;
    input.value = "typed while runs load";
    input.dispatchEvent(new InputEvent("input", { bubbles: true }));
    const onDraft = vi.fn();
    channel.publish(model({ onDraft }));
    await tick();

    expect(input.value).toBe("typed while runs load");
    expect(onDraft).toHaveBeenCalledWith("typed while runs load", expect.objectContaining({ runId: "run-a", draftKey: "draft-a" }));
  });

  it("does not let a late accepted send clear a different session draft", async () => {
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

    channel.publish(model({ identity: "workspace-a:task-a:run-b:draft-b", runId: "run-b", draftKey: "draft-b", draft: "draft for run b" }));
    await tick();
    result.resolve({ accepted: true, clear: true });
    await result.promise;
    await tick();

    expect(target.querySelector<HTMLTextAreaElement>("#ttyInput")?.value).toBe("draft for run b");
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
});
