import { mount, tick, unmount } from "svelte";
import { afterEach, describe, expect, it, vi } from "vitest";

import ProjectCreateForm from "../../src/components/ProjectCreateForm.svelte";
import SelfDrivingOptions from "../../src/components/SelfDrivingOptions.svelte";
import TaskCreateForm from "../../src/components/TaskCreateForm.svelte";
import TaskPreview from "../../src/components/TaskPreview.svelte";
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
    type: "task", projectId: "project1", templateName: "", templateFields: {}, title: "", titleOverride: false,
    description: "", detail: "", slug: "", selfDriving: false, agentName: "", agentProfiles: "", prompt: "",
    completionCriteria: "", activeTab: "edit", editedMarkdown: null, showOptions: false,
    ...overrides,
  };
}

function model(currentDraft: CreateDraft, overrides: Partial<CreateDialogModel> = {}): CreateDialogModel {
  return {
    open: true, identity: "dialog-1:task:project1", workspaceId: "workspace-a", draft: currentDraft,
    templates: [featureTemplate], agents: [], profileKeys: [], preview: null, previewKey: "", previewing: false,
    previewError: "", templateDigest: "", submitting: false, onClose: vi.fn(), onPreview: vi.fn(), onSubmit: vi.fn(),
    previewRequestKey: (next) => JSON.stringify(next), onConfirmTemplateSwitch: () => true, onIconsChanged: vi.fn(),
    ...overrides,
  };
}

function target(): HTMLElement {
  return document.body.appendChild(document.createElement("div"));
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

  it("owns the Self-Driving disclosure and edits every option", async () => {
    const current = draft();
    const onChange = vi.fn();
    const host = target();
    const component = mount(SelfDrivingOptions, { target: host, props: {
      draft: current,
      agents: [{ id: "codex", label: "Codex", summary: "Reasoning" }],
      profileKeys: ["reasoning"],
      onChange,
    } });
    cleanups.push(() => unmount(component));

    host.querySelector<HTMLInputElement>('input[name="selfDriving"]')!.click();
    await tick();
    const agent = host.querySelector<HTMLSelectElement>('select[name="agentName"]')!;
    agent.value = "codex";
    agent.dispatchEvent(new Event("change", { bubbles: true }));
    const prompt = host.querySelector<HTMLTextAreaElement>('textarea[name="prompt"]')!;
    prompt.value = "Keep going";
    prompt.dispatchEvent(new InputEvent("input", { bubbles: true }));
    const profiles = host.querySelector<HTMLInputElement>('input[name="agentProfiles"]')!;
    profiles.value = "reasoning";
    profiles.dispatchEvent(new InputEvent("input", { bubbles: true }));

    expect(current).toMatchObject({ selfDriving: true, agentName: "codex", prompt: "Keep going", agentProfiles: "reasoning" });
    expect(host.textContent).toContain("Available: reasoning");
    expect(onChange).toHaveBeenCalledTimes(4);
  });

  it("protects preview edits and resets them to the latest rendered Markdown", async () => {
    const current = draft({ templateName: "feature-a" });
    const host = target();
    const component = mount(TaskPreview, { target: host, props: {
      draft: current,
      selectedTemplate: featureTemplate,
      preview: { title: "Rendered title", markdown: "# Rendered\n", slug: "rendered" },
      previewing: false,
      previewError: "",
      stale: false,
      templateDigest: "sha256:test",
      submitting: false,
      onRefresh: vi.fn(),
    } });
    cleanups.push(() => unmount(component));
    await tick();

    expect(current.editedMarkdown).toBe("# Rendered\n");
    const editor = host.querySelector<HTMLTextAreaElement>('textarea[name="previewMarkdown"]')!;
    editor.value = "# Local edit\n";
    editor.dispatchEvent(new InputEvent("input", { bubbles: true }));
    await tick();
    expect(host.querySelector("[data-preview-edited-note]")).toBeTruthy();
    host.querySelector<HTMLButtonElement>("[data-preview-edited-note] button")!.click();
    await tick();
    expect(current.editedMarkdown).toBe("# Rendered\n");
    expect(host.querySelector("[data-preview-edit-hint]")).toBeTruthy();
  });

  it("coordinates template defaults, switch confirmation, and debounced preview", async () => {
    vi.useFakeTimers();
    const current = draft({ templateName: "feature-a", templateFields: { summary: "Local value" } });
    const confirm = vi.fn().mockReturnValueOnce(false).mockReturnValueOnce(true);
    const onPreview = vi.fn().mockResolvedValue(undefined);
    const alternate = { ...featureTemplate, name: "feature-b", title: "Feature B" };
    const currentModel = model(current, { templates: [featureTemplate, alternate], onConfirmTemplateSwitch: confirm, onPreview });
    const host = target();
    const component = mount(TaskCreateForm, { target: host, props: { draft: current, model: currentModel } });
    cleanups.push(() => unmount(component));
    const alternateCard = host.querySelectorAll<HTMLButtonElement>('[role="option"]')[2];

    alternateCard.click();
    expect(current.templateName).toBe("feature-a");
    alternateCard.click();
    expect(current.templateName).toBe("feature-b");
    expect(current.templateFields.summary).toBe("Default summary");
    await vi.advanceTimersByTimeAsync(200);
    expect(onPreview).toHaveBeenCalledTimes(1);

    const summary = host.querySelector<HTMLInputElement>('[aria-label="Required template fields"] input')!;
    summary.value = "Newest value";
    summary.dispatchEvent(new InputEvent("input", { bubbles: true }));
    await vi.advanceTimersByTimeAsync(500);
    expect(onPreview).toHaveBeenCalledTimes(2);
    expect(onPreview.mock.calls.at(-1)?.[0].templateFields.summary).toBe("Newest value");
  });
});
