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
      type: "task", projectId: "project1", templateName: "", templateFields: {}, title: "",
      description: "", detail: "", slug: "",
      startAfterCreate: false, startBinding: { kind: "profile", name: "" }, startPrompt: "Default prompt.",
    },
    templates: [], preview: null, previewKey: "", previewing: false,
    previewError: "", templateDigest: "", submitting: false,
    agents: [], agentProfiles: [], defaultTaskBinding: { kind: "profile", name: "default" },
    onClose: vi.fn(), onPreview: vi.fn(), onSubmit: vi.fn(),
    previewRequestKey: (draft) => JSON.stringify(draft), onConfirmTemplateSwitch: async () => true, onIconsChanged: vi.fn(),
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

function nextButton(target: HTMLElement): HTMLButtonElement {
  return target.querySelector<HTMLButtonElement>('.wizard-footer button[type="submit"]')!;
}

async function advance(target: HTMLElement): Promise<void> {
  nextButton(target).click();
  await tick();
}

describe("CreateDialog task wizard", () => {
  it("walks a blank task through the steps and submits the complete draft", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { target } = mountDialog(model({ onSubmit, templates: [featureTemplate] }));
    await tick();

    expect(target.querySelectorAll(".wizard-steps li")).toHaveLength(4);
    expect(target.querySelector(".wizard-steps li.active")?.textContent).toContain("Template");

    await advance(target); // template (blank) -> title & slug
    const title = target.querySelector<HTMLInputElement>('input[name="title"]')!;
    expect(nextButton(target).disabled).toBe(true);
    title.value = "Write launch notes";
    title.dispatchEvent(new InputEvent("input", { bubbles: true }));
    await tick();
    expect(nextButton(target).disabled).toBe(false);

    await advance(target); // title -> details
    const detail = target.querySelector<HTMLTextAreaElement>('textarea[name="detail"]')!;
    detail.value = "Draft the v1.2 notes";
    detail.dispatchEvent(new InputEvent("input", { bubbles: true }));

    await advance(target); // details -> start options
    expect(target.querySelector(".wizard-steps li.active")?.textContent).toContain("Start options");
    expect(target.querySelector<HTMLElement>("[data-summary]")?.textContent).toContain("Write launch notes");
    expect(nextButton(target).textContent).toContain("Create task");

    nextButton(target).click();
    await tick();
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      title: "Write launch notes",
      detail: "Draft the v1.2 notes",
      startAfterCreate: false,
    });
  });

  it("hides the manual title input when the template generates the title", async () => {
    const { target } = mountDialog(model({
      templates: [featureTemplate],
      preview: { title: "feature-a:Ship it", markdown: "# feature-a:Ship it\n" },
      previewKey: "key",
      previewRequestKey: () => "key",
    }));
    await tick();

    target.querySelectorAll<HTMLButtonElement>('.template-cards [role="option"]')[1].click();
    await tick();
    await advance(target); // -> title & slug

    expect(target.querySelector('input[name="title"]')).toBeNull();
    expect(target.querySelector("[data-generated-title]")?.textContent).toContain("feature-a:Ship it");
    expect(nextButton(target).disabled).toBe(false);
  });

  it("gates the fields step on required template fields", async () => {
    const { target } = mountDialog(model({ templates: [featureTemplate] }));
    await tick();

    target.querySelectorAll<HTMLButtonElement>('.template-cards [role="option"]')[1].click();
    await tick();
    await advance(target); // -> title & slug (generated)
    await advance(target); // -> template fields

    expect(target.querySelector('[aria-label="Required template fields"] input')).toBeTruthy();
    expect(target.querySelector('[aria-label="Optional template fields"] textarea')).toBeTruthy();
    expect(nextButton(target).disabled).toBe(true);
    expect(target.querySelector("[data-missing-required]")?.textContent).toContain("Summary");

    const summary = target.querySelector<HTMLInputElement>('[aria-label="Required template fields"] input')!;
    summary.value = "Ship it";
    summary.dispatchEvent(new InputEvent("input", { bubbles: true }));
    await tick();
    expect(nextButton(target).disabled).toBe(false);
    expect(target.querySelector("[data-missing-required]")).toBeNull();
  });

  it("preselects the default binding and requires a prompt for create-and-start", async () => {
    const { target } = mountDialog(model({
      defaultTaskBinding: { kind: "profile", name: "default" },
      agentProfiles: [{ key: "default", agentName: "agent-a" }],
      agents: [{ id: "agent-b", label: "Agent B", summary: "" }],
    }));
    await tick();

    await advance(target); // -> title
    const title = target.querySelector<HTMLInputElement>('input[name="title"]')!;
    title.value = "Auto start";
    title.dispatchEvent(new InputEvent("input", { bubbles: true }));
    await tick();
    await advance(target); // -> details
    await advance(target); // -> start options

    const cards = target.querySelectorAll<HTMLButtonElement>(".wizard-start-card");
    expect(cards[0].classList.contains("selected")).toBe(true);
    cards[1].click();
    await tick();

    const bindingButton = target.querySelector<HTMLButtonElement>(".agent-binding-button")!;
    expect(bindingButton.textContent).toContain("default");
    expect(target.querySelector("[data-binding-note]")).toBeNull();

    const prompt = target.querySelector<HTMLTextAreaElement>('textarea[name="startPrompt"]')!;
    prompt.value = "";
    prompt.dispatchEvent(new InputEvent("input", { bubbles: true }));
    await tick();
    expect(nextButton(target).disabled).toBe(true);
    prompt.value = "Run it.";
    prompt.dispatchEvent(new InputEvent("input", { bubbles: true }));
    await tick();
    expect(nextButton(target).textContent).toContain("Create & start");
    expect(nextButton(target).disabled).toBe(false);
  });

  it("keeps the same input node, focus, and selection across background publications", async () => {
    const first = model();
    const { channel, target } = mountDialog(first);
    await tick();
    await advance(target); // -> title & slug

    const input = target.querySelector<HTMLInputElement>('input[name="title"]')!;
    input.value = "Local task draft";
    input.dispatchEvent(new InputEvent("input", { bubbles: true }));
    input.focus();
    input.setSelectionRange(3, 8);

    channel.publish({ ...first, submitting: true });
    await tick();

    const current = target.querySelector<HTMLInputElement>('input[name="title"]')!;
    expect(current).toBe(input);
    expect(current.value).toBe("Local task draft");
    expect(document.activeElement).toBe(current);
    expect([current.selectionStart, current.selectionEnd]).toEqual([3, 8]);
  });

  it("resets the wizard only when the dialog identity changes", async () => {
    const first = model();
    const { channel, target } = mountDialog(first);
    await tick();
    await advance(target);
    const input = target.querySelector<HTMLInputElement>('input[name="title"]')!;
    input.value = "Unsaved local draft";
    input.dispatchEvent(new InputEvent("input", { bubbles: true }));
    await tick();
    expect(target.querySelector(".wizard-steps li.active")?.textContent).toContain("Title");

    channel.publish({ ...first, identity: "dialog-2:task:project1", draft: { ...first.draft, title: "New dialog" } });
    await tick();

    // A fresh dialog starts over on the template step with the new draft.
    expect(target.querySelector(".wizard-steps li.active")?.textContent).toContain("Template");
    await advance(target);
    expect(target.querySelector<HTMLInputElement>('input[name="title"]')?.value).toBe("New dialog");
  });

  it("navigates backwards without losing entered values", async () => {
    const { target } = mountDialog(model());
    await tick();
    await advance(target);
    const title = target.querySelector<HTMLInputElement>('input[name="title"]')!;
    title.value = "Remember me";
    title.dispatchEvent(new InputEvent("input", { bubbles: true }));
    await tick();
    await advance(target);

    target.querySelector<HTMLButtonElement>(".wizard-footer button.secondary")!.click();
    await tick();
    expect(target.querySelector<HTMLInputElement>('input[name="title"]')?.value).toBe("Remember me");
  });
});
