import { mount, tick, unmount } from "svelte";
import { afterEach, describe, expect, it, vi } from "vitest";

import ProjectCreateForm from "../../src/components/ProjectCreateForm.svelte";
import TaskWizard from "../../src/components/TaskWizard.svelte";
import TemplateFieldGroup from "../../src/components/TemplateFieldGroup.svelte";
import TemplatePicker from "../../src/components/TemplatePicker.svelte";
import type { CreateDialogModel, CreateDraft, TaskTemplate, TemplateField } from "../../src/components/models";

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
    { name: "summary", label: "Summary", type: "text", required: true, hasDefault: true, default: "Default summary" },
    { name: "notes", label: "Notes", type: "textarea", required: false },
    { name: "priority", label: "Priority", type: "select", options: ["low", "high"], required: false },
    { name: "ready", label: "Ready", type: "boolean", required: false },
  ],
};

function draft(overrides: Partial<CreateDraft> = {}): CreateDraft {
  return {
    type: "task", projectId: "project1", templateName: "", templateFields: {}, title: "",
    description: "", detail: "", slug: "",
    startAfterCreate: false, startBinding: { kind: "profile", name: "" }, startPrompt: "Default prompt.",
    ...overrides,
  };
}

function model(currentDraft: CreateDraft, overrides: Partial<CreateDialogModel> = {}): CreateDialogModel {
  return {
    open: true, identity: "dialog-1:task:project1", workspaceId: "workspace-a", draft: currentDraft,
    templates: [featureTemplate], preview: null, previewKey: "", previewing: false,
    previewError: "", templateDigest: "", submitting: false,
    agents: [], agentProfiles: [], defaultTaskBinding: { kind: "profile", name: "default" },
    onClose: vi.fn(), onPreview: vi.fn(), onSubmit: vi.fn(),
    previewRequestKey: (next) => JSON.stringify(next), onConfirmTemplateSwitch: async () => true,
    ...overrides,
  };
}

function target(): HTMLElement {
  return document.body.appendChild(document.createElement("div"));
}

function mountWizard(current: CreateDraft, currentModel: CreateDialogModel) {
  const host = target();
  const component = mount(TaskWizard, { target: host, props: { draft: current, model: currentModel } });
  cleanups.push(() => unmount(component));
  return host;
}

async function advance(host: HTMLElement): Promise<void> {
  host.querySelector<HTMLButtonElement>('.wizard-footer button[type="submit"]')!.click();
  await tick();
}

describe("CreateDialog child components", () => {
  it("keeps Project description and slug in the shared draft", async () => {
    const current = draft({ type: "project" });
    const host = target();
    const component = mount(ProjectCreateForm, { target: host, props: { draft: current } });
    cleanups.push(() => unmount(component));

    const description = host.querySelector<HTMLTextAreaElement>('textarea[name="description"]')!;
    description.value = "A focused project";
    description.dispatchEvent(new InputEvent("input", { bubbles: true }));
    const slug = host.querySelector<HTMLInputElement>('input[name="slug"]')!;
    slug.value = "focused-project";
    slug.dispatchEvent(new InputEvent("input", { bubbles: true }));
    await tick();

    expect(current.description).toBe("A focused project");
    expect(current.slug).toBe("focused-project");
  });

  it("renders valid and invalid templates and reports selection", async () => {
    const onSelect = vi.fn();
    const host = target();
    const component = mount(TemplatePicker, { target: host, props: {
      templates: [featureTemplate, { name: "broken", valid: false }], selectedName: "", disabled: false, onSelect,
    } });
    cleanups.push(() => unmount(component));
    const cards = [...host.querySelectorAll<HTMLButtonElement>('[role="option"]')];

    expect(cards).toHaveLength(3);
    expect(cards[0].getAttribute("aria-selected")).toBe("true");
    expect(cards[2].disabled).toBe(true);
    cards[1].click();
    expect(onSelect).toHaveBeenCalledWith("feature-a");
  });

  it("renders each template field type and returns typed values", async () => {
    const values: Record<string, string | boolean> = { summary: "", notes: "", priority: "", ready: false };
    const onChange = vi.fn((field: TemplateField, value: string | boolean) => { values[field.name] = value; });
    const host = target();
    const component = mount(TemplateFieldGroup, { target: host, props: {
      fields: featureTemplate.fields!, values, label: "Template values", onChange,
    } });
    cleanups.push(() => unmount(component));

    const summary = host.querySelector<HTMLInputElement>('input:not([type="checkbox"])')!;
    summary.value = "Typed summary";
    summary.dispatchEvent(new InputEvent("input", { bubbles: true }));
    const priority = host.querySelector<HTMLSelectElement>("select")!;
    priority.value = "high";
    priority.dispatchEvent(new Event("change", { bubbles: true }));
    host.querySelector<HTMLInputElement>('input[type="checkbox"]')!.click();

    expect(values).toMatchObject({ summary: "Typed summary", priority: "high", ready: true });
    expect(host.querySelector("textarea")).toBeTruthy();
  });

  it("coordinates template defaults, switch confirmation, and debounced preview", async () => {
    vi.useFakeTimers();
    const current = draft({ templateName: "feature-a", templateFields: { summary: "Local value" } });
    const confirm = vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    const onPreview = vi.fn().mockResolvedValue(undefined);
    const alternate = { ...featureTemplate, name: "feature-b", title: "Feature B" };
    const host = mountWizard(current, model(current, { templates: [featureTemplate, alternate], onConfirmTemplateSwitch: confirm, onPreview }));
    const alternateCard = host.querySelectorAll<HTMLButtonElement>('[role="option"]')[2];

    alternateCard.click();
    await vi.advanceTimersByTimeAsync(0);
    expect(current.templateName).toBe("feature-a");
    alternateCard.click();
    await vi.advanceTimersByTimeAsync(0);
    expect(current.templateName).toBe("feature-b");
    expect(current.templateFields.summary).toBe("Default summary");
    await vi.advanceTimersByTimeAsync(200);
    expect(onPreview).toHaveBeenCalledTimes(1);

    // Walk to the fields step and edit the required field; the preview request
    // is debounced and carries the latest value.
    await advance(host); // -> title & slug (generated by template)
    await advance(host); // -> template fields
    const summary = host.querySelector<HTMLInputElement>('[aria-label="Required template fields"] input')!;
    summary.value = "Newest value";
    summary.dispatchEvent(new InputEvent("input", { bubbles: true }));
    await vi.advanceTimersByTimeAsync(500);
    expect(onPreview).toHaveBeenCalledTimes(2);
    expect(onPreview.mock.calls.at(-1)?.[0].templateFields.summary).toBe("Newest value");
  });

  it("switches templates without confirmation while only untouched defaults are present", async () => {
    const current = draft();
    const confirm = vi.fn().mockResolvedValue(true);
    const alternate = { ...featureTemplate, name: "feature-b", title: "Feature B" };
    const host = mountWizard(current, model(current, { templates: [featureTemplate, alternate], onConfirmTemplateSwitch: confirm }));
    const cards = host.querySelectorAll<HTMLButtonElement>('[role="option"]');

    cards[1].click(); // select feature-a; its defaults fill templateFields
    await tick();
    expect(current.templateName).toBe("feature-a");
    expect(current.templateFields.summary).toBe("Default summary");

    cards[2].click(); // switch away without editing — no confirmation prompt
    await tick();
    expect(confirm).not.toHaveBeenCalled();
    expect(current.templateName).toBe("feature-b");
  });

  it("hides the Back button on the first step and shows it afterwards", async () => {
    const current = draft();
    const host = mountWizard(current, model(current));
    await tick();

    const footerTexts = () => [...host.querySelectorAll<HTMLButtonElement>(".wizard-footer button")].map((button) => button.textContent?.trim());
    expect(footerTexts()).toEqual(["Cancel", "Next"]);

    await advance(host); // -> title & slug
    expect(footerTexts()).toEqual(["Back", "Cancel", "Next"]);
  });

  it("skips the template step when the project has no templates", async () => {
    const current = draft();
    const host = mountWizard(current, model(current, { templates: [] }));
    await tick();

    expect(host.querySelector('[aria-label="Template"]')).toBeNull();
    expect(host.querySelector('[aria-label="Basic information"]')).toBeTruthy();
    expect(host.querySelector(".wizard-step-pos")?.textContent?.trim()).toBe("Step 1 of 3");
    expect([...host.querySelectorAll(".wizard-step-label")].map((item) => item.textContent?.trim())).toEqual([
      "Title & slug", "Details", "Start options",
    ]);

    const nextButton = () => host.querySelector<HTMLButtonElement>('.wizard-footer button[type="submit"]')!;
    expect(nextButton().textContent?.trim()).toBe("Next");
    expect(nextButton().disabled).toBe(true);
    current.title = "Blank task";
    host.querySelector<HTMLFormElement>("form")!.dispatchEvent(new SubmitEvent("submit", { bubbles: true, cancelable: true }));
    await tick();
    expect(host.querySelector('[aria-label="Details"]')).toBeTruthy();
    expect(host.querySelector(".wizard-step-pos")?.textContent?.trim()).toBe("Step 2 of 3");
  });

  it("preselects the resolved default binding for the start step", async () => {
    const current = draft();
    mountWizard(current, model(current, {
      defaultTaskBinding: { kind: "agent", name: "agent-b" },
      agents: [{ id: "agent-b", label: "Agent B", summary: "" }],
    }));
    await tick();

    expect(current.startBinding).toEqual({ kind: "agent", name: "agent-b" });
  });
});
