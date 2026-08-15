import { EditorView } from "@codemirror/view";
import { mount, tick, unmount } from "svelte";
import { afterEach, describe, expect, it, vi } from "vitest";

import MarkdownEditor from "../../src/components/MarkdownEditor.svelte";

const mounted: Array<ReturnType<typeof mount>> = [];
let identityCounter = 0;

function mountEditor(overrides: Record<string, unknown> = {}) {
  const target = document.body.appendChild(document.createElement("div"));
  const onSave = vi.fn(async (content: string) => ({ path: "project1/task1/task.md", name: "task.md", content, contentHash: "saved-hash" }));
  const onToast = vi.fn();
  const component = mount(MarkdownEditor, {
    target,
    props: {
      identity: `ws:project1.task1:task-${++identityCounter}.md`,
      file: { path: "project1/task1/task.md", name: "task.md", content: "# Title\n\nSelected text here.\n", contentHash: "base-hash" },
      mode: "edit",
      onSave,
      onToast,
      onIconsChanged: vi.fn(),
      ...overrides,
    },
  });
  mounted.push(component);
  return { target, component, onSave, onToast };
}

function editorView(target: HTMLElement): EditorView {
  const view = EditorView.findFromDOM(target.querySelector<HTMLElement>(".cm-editor")!);
  if (!view) throw new Error("CodeMirror view was not mounted");
  return view;
}

afterEach(async () => {
  while (mounted.length) await unmount(mounted.pop()!);
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

describe("MarkdownEditor", () => {
  it("annotates read-only Markdown and copies agent-readable locations without an instruction preface", async () => {
    const writeText = vi.fn(async (_text: string) => undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    const { target, onToast } = mountEditor({ mode: "annotate" });
    await tick();
    const view = editorView(target);
    const start = view.state.doc.toString().indexOf("Selected text");
    view.dispatch({ selection: { anchor: start, head: start + "Selected text".length } });
    await tick();

    const add = Array.from(target.querySelectorAll<HTMLButtonElement>("button")).find((button) => button.textContent?.includes("Add annotation"))!;
    expect(add.disabled).toBe(false);
    add.click();
    await tick();
    const comment = target.querySelector<HTMLTextAreaElement>("[data-comment-for]")!;
    comment.value = "Make this requirement measurable.";
    comment.dispatchEvent(new InputEvent("input", { bubbles: true }));
    await tick();

    // Annotate mode is read-only.
    expect(view.state.readOnly).toBe(true);
    expect(view.contentDOM.getAttribute("contenteditable")).toBe("false");
    expect(target.querySelector(".annotation-location")?.textContent).toBe("L3:C1–L3:C14");
    expect(target.querySelector(".markdown-editor-save-actions")).toBeNull();

    const copy = Array.from(target.querySelectorAll<HTMLButtonElement>("button")).find((button) => button.textContent?.includes("Copy annotations"))!;
    copy.click();
    await vi.waitFor(() => expect(writeText).toHaveBeenCalledOnce());
    const exported = writeText.mock.calls[0][0];
    expect(exported).toContain("文件：project1/task1/task.md");
    expect(exported).toContain("位置：L3:C1–L3:C14");
    expect(exported).toContain("> Selected text");
    expect(exported).toContain("批注：Make this requirement measurable.");
    expect(exported).not.toContain("请处理");
    expect(exported).not.toContain("以下批注");
    await vi.waitFor(() => expect(onToast).toHaveBeenCalledWith("Annotations copied to the clipboard."));
  });

  it("saves the exact Markdown source against the loaded content hash", async () => {
    const { target, onSave } = mountEditor();
    await tick();
    const view = editorView(target);
    view.dispatch({ changes: { from: view.state.doc.length, insert: "\n**Bold addition**\n" } });
    await tick();

    const save = Array.from(target.querySelectorAll<HTMLButtonElement>("button")).find((button) => button.textContent?.trim() === "Save")!;
    expect(save.disabled).toBe(false);
    expect(target.querySelector(".markdown-editor-primary-actions")).toBeNull();
    save.click();
    await vi.waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(onSave).toHaveBeenCalledWith("# Title\n\nSelected text here.\n\n**Bold addition**\n", "base-hash");
    await tick();
    expect(save.disabled).toBe(true);
  });

  it("keeps an unsaved draft in the current page session when the editor closes and reopens", async () => {
    const identity = "ws:project1.task1:session-persistence.md";
    const first = mountEditor({ identity });
    await tick();
    const firstView = editorView(first.target);
    firstView.dispatch({ changes: { from: firstView.state.doc.length, insert: "Session draft\n" } });
    await tick();
    await unmount(first.component);
    mounted.pop();
    first.target.remove();

    const second = mountEditor({ identity });
    await tick();
    expect(editorView(second.target).state.doc.toString()).toContain("Session draft");
  });
});
