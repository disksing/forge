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
      description: "", detail: "", slug: "", activeTab: "edit", editedMarkdown: null, showOptions: false,
    },
    templates: [], preview: null, previewKey: "", previewing: false,
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

    const scrollRoot = target.querySelector<HTMLElement>(".create-task-form-col")!;
    const input = target.querySelector<HTMLInputElement>('input[name="title"]')!;
    input.value = "Local task draft";
    input.dispatchEvent(new InputEvent("input", { bubbles: true }));
    input.focus();
    input.setSelectionRange(3, 8);
    scrollRoot.scrollTop = 37;

    channel.publish({ ...first, submitting: true });
    await tick();

    const current = target.querySelector<HTMLInputElement>('input[name="title"]')!;
    expect(current).toBe(input);
    expect(current.value).toBe("Local task draft");
    expect(document.activeElement).toBe(current);
    expect([current.selectionStart, current.selectionEnd]).toEqual([3, 8]);
    expect(scrollRoot.scrollTop).toBe(37);
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

  it("follows fresh rendered Markdown until the user edits, then protects the edit", async () => {
    const firstPreview = { title: "First", markdown: "# First\n" };
    const first = model({
      templates: [featureTemplate],
      draft: { ...model().draft, templateName: "feature-a", templateFields: { summary: "First" } },
      preview: firstPreview,
      previewKey: "first",
      previewRequestKey: () => "first",
    });
    const { channel, target } = mountDialog(first);
    await tick();
    const editor = target.querySelector<HTMLTextAreaElement>('textarea[name="previewMarkdown"]')!;
    expect(editor.value).toBe("# First\n");

    channel.publish({ ...first, preview: { title: "Second", markdown: "# Second\n" } });
    await tick();
    expect(editor.value).toBe("# Second\n");

    editor.value = "# Protected local edit\n";
    editor.dispatchEvent(new InputEvent("input", { bubbles: true }));
    channel.publish({ ...first, preview: { title: "Third", markdown: "# Third\n" } });
    await tick();
    expect(editor.value).toBe("# Protected local edit\n");
    expect(target.querySelector("[data-preview-edited-note]")).toBeTruthy();
  });

  it("submits one complete Task draft while a pending publication cannot replace local inputs", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const first = model({ onSubmit });
    const { channel, target } = mountDialog(first);
    await tick();

    const set = (selector: string, value: string) => {
      const input = target.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(selector)!;
      input.value = value;
      input.dispatchEvent(new InputEvent(input instanceof HTMLSelectElement ? "change" : "input", { bubbles: true }));
      return input;
    };
    const title = set('input[name="title"]', "Stable payload");
    set('textarea[name="detail"]', "Keep all fields");
    set('input[name="slug"]', "stable-payload");
    title.focus();

    channel.publish({ ...first, submitting: true });
    await tick();
    expect(target.querySelector('input[name="title"]')).toBe(title);
    channel.publish({ ...first, submitting: false });
    await tick();
    target.querySelector<HTMLFormElement>("#createDialogForm")!.dispatchEvent(new SubmitEvent("submit", { bubbles: true, cancelable: true }));
    await tick();

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      title: "Stable payload",
      detail: "Keep all fields",
      slug: "stable-payload",
    });
  });
});
