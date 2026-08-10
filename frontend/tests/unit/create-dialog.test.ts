import { mount, tick, unmount } from "svelte";
import { afterEach, describe, expect, it, vi } from "vitest";

import CreateDialog from "../../src/islands/CreateDialog.svelte";
import { createIslandChannel } from "../../src/islands/channel";
import type { CreateDialogModel } from "../../src/islands/models";

const cleanups: Array<() => Promise<void>> = [];
afterEach(async () => {
  while (cleanups.length) await cleanups.pop()?.();
  document.body.replaceChildren();
});

function model(overrides: Partial<CreateDialogModel> = {}): CreateDialogModel {
  return {
    open: true,
    identity: "dialog-1:task:project1",
    workspaceId: "workspace-a",
    draft: {
      type: "task", projectId: "project1", templateName: "", templateFields: {}, title: "", titleOverride: false,
      description: "", detail: "", slug: "", selfDriving: false, agentName: "", agentProfiles: "", prompt: "",
      completionCriteria: "", activeTab: "edit", editedMarkdown: null, showOptions: false,
    },
    templates: [], agents: [], profileKeys: [], preview: null, previewKey: "", previewing: false,
    previewError: "", templateDigest: "", submitting: false, onClose: vi.fn(), onPreview: vi.fn(), onSubmit: vi.fn(),
    previewRequestKey: (draft) => JSON.stringify(draft), onConfirmTemplateSwitch: () => true, onIconsChanged: vi.fn(),
    ...overrides,
  };
}

describe("CreateDialog", () => {
  it("keeps the same input node, focus, selection, and scroll across background publications", async () => {
    const first = model();
    const channel = createIslandChannel(first);
    const target = document.body.appendChild(document.createElement("div"));
    const component = mount(CreateDialog, { target, props: { channel } });
    cleanups.push(() => unmount(component));
    await tick();

    const dialog = target.querySelector<HTMLElement>(".create-dialog")!;
    const input = target.querySelector<HTMLInputElement>('input[name="title"]')!;
    input.value = "Local task draft";
    input.dispatchEvent(new InputEvent("input", { bubbles: true }));
    input.focus();
    input.setSelectionRange(3, 8);
    dialog.scrollTop = 37;

    channel.publish({ ...first, submitting: true });
    await tick();

    const current = target.querySelector<HTMLInputElement>('input[name="title"]')!;
    expect(current).toBe(input);
    expect(current.value).toBe("Local task draft");
    expect(document.activeElement).toBe(current);
    expect([current.selectionStart, current.selectionEnd]).toEqual([3, 8]);
    expect(dialog.scrollTop).toBe(37);
  });

  it("resets local state only when the dialog identity changes", async () => {
    const first = model();
    const channel = createIslandChannel(first);
    const target = document.body.appendChild(document.createElement("div"));
    const component = mount(CreateDialog, { target, props: { channel } });
    cleanups.push(() => unmount(component));
    await tick();
    const input = target.querySelector<HTMLInputElement>('input[name="title"]')!;
    input.value = "Unsaved local draft";
    input.dispatchEvent(new InputEvent("input", { bubbles: true }));

    channel.publish({ ...first, identity: "dialog-2:task:project1", draft: { ...first.draft, title: "New dialog" } });
    await tick();
    expect(target.querySelector<HTMLInputElement>('input[name="title"]')?.value).toBe("New dialog");
  });
});
