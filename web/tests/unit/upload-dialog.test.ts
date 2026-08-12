import { mount, tick, unmount } from "svelte";
import { afterEach, describe, expect, it, vi } from "vitest";

import UploadDialog from "../../src/components/UploadDialog.svelte";
import { createModelChannel } from "../../src/components/model-channel";
import type { UploadDialogModel } from "../../src/components/models";

class FakeUploadTarget {
  listeners = new Map<string, EventListener>();
  addEventListener(name: string, listener: EventListener): void { this.listeners.set(name, listener); }
}

class FakeXHR {
  static instances: FakeXHR[] = [];
  upload = new FakeUploadTarget();
  listeners = new Map<string, EventListener>();
  response: Record<string, unknown> = {};
  status = 0;
  statusText = "";
  responseType: XMLHttpRequestResponseType = "";
  aborted = false;
  url = "";
  constructor() { FakeXHR.instances.push(this); }
  open(_method: string, url: string): void { this.url = url; }
  send(): void {}
  abort(): void { this.aborted = true; }
  addEventListener(name: string, listener: EventListener): void { this.listeners.set(name, listener); }
}

const originalXHR = globalThis.XMLHttpRequest;
const cleanups: Array<() => Promise<void>> = [];
afterEach(async () => {
  while (cleanups.length) await cleanups.pop()?.();
  globalThis.XMLHttpRequest = originalXHR;
  FakeXHR.instances = [];
  document.body.replaceChildren();
});

function model(overrides: Partial<UploadDialogModel> = {}): UploadDialogModel {
  return { open: true, identity: "upload-1:workspace-a:task-a", workspaceId: "workspace-a", resourceId: "task-a", onDone: vi.fn(), onIconsChanged: vi.fn(), ...overrides };
}

describe("UploadDialog", () => {
  it("uploads to the resource endpoint and aborts when the resource identity changes", async () => {
    globalThis.XMLHttpRequest = FakeXHR as unknown as typeof XMLHttpRequest;
    const first = model();
    const channel = createModelChannel(first);
    const target = document.body.appendChild(document.createElement("div"));
    const component = mount(UploadDialog, { target, props: { channel } });
    cleanups.push(() => unmount(component));
    await tick();

    const input = target.querySelector<HTMLInputElement>("#agentUploadInput")!;
    Object.defineProperty(input, "files", { configurable: true, value: [new File(["content"], "notes.txt", { type: "text/plain" })] });
    input.dispatchEvent(new Event("change", { bubbles: true }));
    await tick();
    expect(FakeXHR.instances).toHaveLength(1);
    expect(FakeXHR.instances[0].aborted).toBe(false);
    expect(FakeXHR.instances[0].url).toContain("/resources/task-a/uploads");

    channel.publish(model({ open: false, identity: "upload-2:workspace-b:task-b", workspaceId: "workspace-b", resourceId: "task-b" }));
    await tick();
    expect(FakeXHR.instances[0].aborted).toBe(true);
  });
});
