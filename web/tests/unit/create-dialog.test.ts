import { mount, tick, unmount } from "svelte";
import { afterEach, describe, expect, it, vi } from "vitest";

import CreateDialog from "../../src/components/CreateDialog.svelte";
import { createModelChannel } from "../../src/components/model-channel";
import type { CreateDialogModel, TaskTemplate } from "../../src/components/models";

const cleanups: Array<() => Promise<void>> = [];
afterEach(async () => {
  while (cleanups.length) await cleanups.pop()?.();
  document.body.replaceChildren();
  vi.useRealTimers();
});

const featureTemplate: TaskTemplate = {
  name: "feature-a",
  title: "Feature A",
  description: "First template",
  valid: true,
  taskTitle: "{{ summary }}",
  fields: [
    { name: "summary", label: "Summary", type: "text", required: true },
    { name: "notes", label: "Notes", type: "textarea", required: false },
  ],
};

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

function mountDialog(current: CreateDialogModel) {
  const channel = createModelChannel(current);
  const target = document.body.appendChild(document.createElement("div"));
  const component = mount(CreateDialog, { target, props: { channel } });
  cleanups.push(() => unmount(component));
  return { channel, target };
}

describe("CreateDialog", () => {
  it("keeps the same input node, focus, selection, and scroll across background publications", async () => {
    const first = model();
    const { channel, target } = mountDialog(first);
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
    const { channel, target } = mountDialog(first);
    await tick();
    const input = target.querySelector<HTMLInputElement>('input[name="title"]')!;
    input.value = "Unsaved local draft";
    input.dispatchEvent(new InputEvent("input", { bubbles: true }));

    channel.publish({ ...first, identity: "dialog-2:task:project1", draft: { ...first.draft, title: "New dialog" } });
    await tick();
    expect(target.querySelector<HTMLInputElement>('input[name="title"]')?.value).toBe("New dialog");
  });

  it("selects templates through cards and shows fields without tabs or a More options disclosure", async () => {
    const { target } = mountDialog(model({ templates: [featureTemplate] }));
    await tick();

    expect(target.querySelector('[role="tab"]')).toBeNull();
    expect(target.querySelector("details")).toBeNull();

    const cards = [...target.querySelectorAll<HTMLButtonElement>('.template-cards [role="option"]')];
    expect(cards.map((card) => card.textContent)).toHaveLength(2);
    expect(cards[0].getAttribute("aria-selected")).toBe("true");

    cards[1].click();
    await tick();

    expect(cards[1].getAttribute("aria-selected")).toBe("true");
    expect(target.querySelector<HTMLInputElement>('input[name="title"]')).toBeTruthy();
    expect(target.querySelector('[aria-label="Required template fields"] input')).toBeTruthy();
    expect(target.querySelector('[aria-label="Optional template fields"] textarea')).toBeTruthy();
    expect(target.querySelector('textarea[name="detail"]')).toBeNull();
  });

  it("shows the Detail textarea and a local live preview for blank tasks", async () => {
    const { target } = mountDialog(model({ templates: [featureTemplate] }));
    await tick();

    const title = target.querySelector<HTMLInputElement>('input[name="title"]')!;
    title.value = "Write launch notes";
    title.dispatchEvent(new InputEvent("input", { bubbles: true }));
    const detail = target.querySelector<HTMLTextAreaElement>('textarea[name="detail"]')!;
    detail.value = "Draft the v1.2 notes";
    detail.dispatchEvent(new InputEvent("input", { bubbles: true }));
    await tick();

    const preview = target.querySelector<HTMLElement>('[aria-label="Task preview"]')!;
    expect(preview.textContent).toContain("Write launch notes");
    expect(preview.textContent).toContain("Draft the v1.2 notes");
  });

  it("requests a debounced live preview as template fields change", async () => {
    vi.useFakeTimers();
    const onPreview = vi.fn().mockResolvedValue(undefined);
    const { target } = mountDialog(model({ templates: [featureTemplate], onPreview }));
    await tick();

    target.querySelectorAll<HTMLButtonElement>('.template-cards [role="option"]')[1].click();
    await vi.advanceTimersByTimeAsync(200);
    expect(onPreview).toHaveBeenCalledTimes(1);

    const summary = target.querySelector<HTMLInputElement>('[aria-label="Required template fields"] input')!;
    summary.value = "Older";
    summary.dispatchEvent(new InputEvent("input", { bubbles: true }));
    await vi.advanceTimersByTimeAsync(200);
    summary.value = "Newer";
    summary.dispatchEvent(new InputEvent("input", { bubbles: true }));
    await vi.advanceTimersByTimeAsync(500);
    expect(onPreview).toHaveBeenCalledTimes(2);
    expect(onPreview.mock.calls.at(-1)?.[0].templateFields.summary).toBe("Newer");
  });

  it("expands Self-Driving fields from the Automation section without a disclosure", async () => {
    const { target } = mountDialog(model());
    await tick();

    expect(target.querySelector(".create-task-automation-fields")).toBeNull();
    const toggle = target.querySelector<HTMLInputElement>('input[name="selfDriving"]')!;
    toggle.click();
    await tick();

    expect(target.querySelector(".create-task-automation-fields")).toBeTruthy();
    expect(target.querySelector('select[name="agentName"]')).toBeTruthy();
    expect(target.querySelector('textarea[name="completionCriteria"]')).toBeTruthy();
  });
});
