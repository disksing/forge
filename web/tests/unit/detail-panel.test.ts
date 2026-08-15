import { mount, tick, unmount } from "svelte";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EditorView } from "@codemirror/view";

import DetailPanel from "../../src/components/DetailPanel.svelte";
import { createModelChannel } from "../../src/components/model-channel";
import type { DetailPanelModel } from "../../src/components/models";

const { confirmDialogMock } = vi.hoisted(() => ({ confirmDialogMock: vi.fn() }));
vi.mock("../../src/controllers/confirm-dialog-controller", () => ({ confirmDialog: confirmDialogMock }));

const mounted: Array<ReturnType<typeof mount>> = [];

function resourceModel(overrides: Partial<DetailPanelModel> = {}): DetailPanelModel {
  return {
    identity: "ws:project1.task1:task",
    workspaceId: "ws",
    workspaceName: "Test workspace",
    resourceId: "project1.task1",
    resourceType: "task",
    resourceTitle: "Stable detail",
    parent: { id: "project1", title: "Project" },
    loading: false,
    detail: {
      id: "project1.task1", type: "task", title: "Stable detail", path: "project1/task1",
      files: [{ name: "task.md", path: "project1/task1/task.md", content: "# Stable detail\n\nSelected text.", contentHash: "doc-a" }],
      artifacts: [{ name: "folder", path: "project1/task1/artifacts/folder", type: "directory", children: [{ name: "nested.txt", path: "project1/task1/artifacts/folder/nested.txt", type: "file", size: 4 }] }, { name: "a.txt", path: "project1/task1/artifacts/a.txt", type: "file", size: 3 }, { name: "b.txt", path: "project1/task1/artifacts/b.txt", type: "file", size: 3 }],
      repos: [{ name: "forge", worktreePath: "project1/task1/worktree/forge", branch: "topic", targetBranch: "master" }, { name: "docs", worktreePath: "project1/task1/worktree/docs", branch: "docs-topic", targetBranch: "master" }],
    },
    wiki: null,
    workspaceAgents: null,
    agentBinding: { kind: "profile", name: "default" },
    agentProfiles: [{ key: "default", description: "Default", agentName: "fake-agent" }],
    agents: [{ id: "fake-agent", label: "Fake Agent", summary: "fake" }],
    resolveResourceTitle: () => null,
    onNavigate: vi.fn(), onCreateTask: vi.fn(), onArchive: vi.fn(),
    onSaveWorkspaceAgents: vi.fn(async () => ({ path: "AGENTS.md", content: "", contentHash: "saved" })),
    onSaveMarkdownFile: vi.fn(async (path, content) => ({ path, content, contentHash: "saved" })),
    onDeleteArtifact: vi.fn(async () => undefined),
    onSaveAgentBinding: vi.fn(async () => undefined),
    onToast: vi.fn(), onIconsChanged: vi.fn(),
    ...overrides,
  };
}

function mountModel(model: DetailPanelModel) {
  const channel = createModelChannel(model);
  const target = document.createElement("section");
  target.id = "detailsPanel";
  document.body.append(target);
  const component = mount(DetailPanel, { target, props: { channel } });
  mounted.push(component);
  return { channel, target };
}

afterEach(async () => {
  while (mounted.length) await unmount(mounted.pop()!);
  document.body.replaceChildren();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  delete window.Diff2Html;
});

describe("DetailPanel", () => {
  it("opens the Markdown editor dialog and saves through the resource callback", async () => {
    const save = vi.fn(async (path: string, content: string) => ({ path, name: "task.md", content, contentHash: "saved-hash" }));
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({
      path: "project1/task1/task.md", name: "task.md", content: "# Stable detail\n\nSelected text.", contentHash: "doc-a",
    }), { headers: { "content-type": "application/json" } })));
    const { target } = mountModel(resourceModel({ onSaveMarkdownFile: save }));
    await tick();
    const edit = Array.from(target.querySelectorAll<HTMLButtonElement>("button")).find((button) => button.textContent?.includes("Edit / Annotate"))!;
    edit.click();
    await vi.waitFor(() => expect(target.querySelector<HTMLElement>('[role="dialog"] .cm-editor')).not.toBeNull());
    const dialog = target.querySelector<HTMLElement>('[role="dialog"]')!;
    const view = EditorView.findFromDOM(dialog.querySelector<HTMLElement>(".cm-editor")!)!;
    view.dispatch({ changes: { from: view.state.doc.length, insert: "\nAdded in browser.\n" } });
    await tick();
    const saveButton = Array.from(dialog.querySelectorAll<HTMLButtonElement>("button")).find((button) => button.textContent?.trim() === "Save")!;
    saveButton.click();
    await vi.waitFor(() => expect(save).toHaveBeenCalledOnce());
    expect(save).toHaveBeenCalledWith("project1/task1/task.md", "# Stable detail\n\nSelected text.\nAdded in browser.\n", "doc-a");
  });

  it("renders the compact resource number inside an independently scrollable body", async () => {
    const { target } = mountModel(resourceModel());
    await tick();

    const header = target.querySelector(".details-header")!;
    const tabs = target.querySelector(".details-tabs")!;
    const content = target.querySelector("#detailsContent")!;
    expect(target.querySelector(".resource-ref-badge")?.textContent).toBe("#1");
    expect(header.contains(content)).toBe(false);
    expect(tabs.contains(content)).toBe(false);
    expect(content.querySelector('[data-doc-file="task.md"]')).not.toBeNull();
  });

  it("moves body headings into tab icons instead of repeating titles", async () => {
    const { target } = mountModel(resourceModel());
    await tick();

    const tabs = Array.from(target.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
    expect(tabs.length).toBeGreaterThan(0);
    for (const tab of tabs) expect(tab.querySelector("i[data-lucide]")).not.toBeNull();
    const taskTab = tabs.find((tab) => tab.textContent?.includes("Task"))!;
    expect(taskTab.querySelector('i[data-lucide="file-text"]')).not.toBeNull();

    const documentSection = target.querySelector('[data-doc-file="task.md"]')!;
    expect(documentSection.querySelector("h3")).toBeNull();
    expect(documentSection.querySelector(".markdown-document-actions button")).not.toBeNull();

    const artifactsSection = target.querySelector('[data-component-owner="file-browser"]')!;
    expect(artifactsSection.querySelector("h3")).toBeNull();
    const worktreesSection = target.querySelector(".worktree-list")!.closest(".content-section")!;
    expect(worktreesSection.querySelector("h3")).toBeNull();
  });

  it("uses the Project number for a Project detail reference", async () => {
    const initial = resourceModel();
    const projectFile = { ...initial.detail!.files![0], name: "project.md", path: "project12/project.md" };
    const { target } = mountModel(resourceModel({
      identity: "ws:project12:project",
      resourceId: "project12",
      resourceType: "project",
      parent: null,
      detail: { ...initial.detail!, id: "project12", type: "project", files: [projectFile] },
    }));
    await tick();
    expect(target.querySelector(".resource-ref-badge")?.textContent).toBe("#12");
  });

  it("resets the detail body, rather than the fixed panel chrome, after navigation", async () => {
    const initial = resourceModel();
    const { channel, target } = mountModel(initial);
    await tick();
    const content = target.querySelector<HTMLElement>("#detailsContent")!;
    content.scrollTop = 80;

    channel.publish({ ...initial, identity: "ws:project1.task2:task", resourceId: "project1.task2" });
    await tick();
    expect(content.scrollTop).toBe(0);
    expect(target.querySelector(".resource-ref-badge")?.textContent).toBe("#2");
  });

  it("keeps the resource document tab selected when detail data arrives after navigation", async () => {
    const loaded = resourceModel();
    const loading = resourceModel({ detail: null, loading: true });
    const { channel, target } = mountModel(loading);
    await tick();
    channel.publish(loaded);
    await tick();
    const selected = target.querySelector('[role="tab"][aria-selected="true"]');
    expect(selected?.textContent).toContain("Task");
  });

  it("does not expose a retired Work tab for legacy detail data", async () => {
    const initial = resourceModel();
    const legacyWork = { name: "work.md", path: "project1/task1/work.md", content: "# Legacy checkpoint", contentHash: "legacy-work" };
    const { channel, target } = mountModel(resourceModel({ detail: { ...initial.detail!, files: [...initial.detail!.files!, legacyWork] } }));
    await tick();

    const tabs = Array.from(target.querySelectorAll<HTMLButtonElement>("[role=tab]"));
    expect(tabs.find((tab) => tab.textContent?.trim() === "Work")).toBeUndefined();
    expect(target.querySelector('[role="tab"][aria-selected="true"]')?.textContent).toContain("Task");

    channel.publish({ ...initial, detail: { ...initial.detail!, files: initial.detail!.files } });
    await tick();
    expect(target.querySelector('[role="tab"][aria-selected="true"]')?.textContent).toContain("Task");
  });

  it("keeps the Task tab visible with a missing-file notice when task.md is deleted", async () => {
    const initial = resourceModel();
    const { target } = mountModel(resourceModel({ detail: { ...initial.detail!, files: [] } }));
    await tick();

    const tabs = Array.from(target.querySelectorAll<HTMLButtonElement>("[role=tab]"));
    const taskTab = tabs.find((tab) => tab.textContent?.includes("Task"));
    expect(taskTab).toBeDefined();
    expect(taskTab!.getAttribute("aria-selected")).toBe("true");
    expect(target.textContent).toContain("Task brief is missing");
    expect(target.querySelector('[data-doc-file="task.md"]')).toBeNull();
  });

  it("keeps the Project tab visible with a missing-file notice when project.md is deleted", async () => {
    const initial = resourceModel();
    const projectDetail = { ...initial.detail!, id: "project12", type: "project" as const, files: [] };
    const { target } = mountModel(resourceModel({
      identity: "ws:project12:project",
      resourceId: "project12",
      resourceType: "project",
      parent: null,
      detail: projectDetail,
    }));
    await tick();

    const tabs = Array.from(target.querySelectorAll<HTMLButtonElement>("[role=tab]"));
    const projectTab = tabs.find((tab) => tab.textContent?.includes("Project"));
    expect(projectTab).toBeDefined();
    expect(projectTab!.getAttribute("aria-selected")).toBe("true");
    expect(target.textContent).toContain("Project brief is missing");
  });

  it("keeps document and artifact DOM identity across unrelated refreshes", async () => {
    const initial = resourceModel();
    const { channel, target } = mountModel(initial);
    await tick();
    const documentNode = target.querySelector(".markdown-view") as HTMLElement;
    documentNode.dataset.identityProbe = "document";

    channel.publish({ ...initial, resourceTitle: "Metadata refreshed", detail: { ...initial.detail!, title: "Metadata refreshed" } });
    await tick();
    expect(target.querySelector(".markdown-view")).toBe(documentNode);
    expect(documentNode.dataset.identityProbe).toBe("document");
    const changedFile = { ...initial.detail!.files![0], content: "# Updated detail", contentHash: "doc-b" };
    channel.publish({ ...initial, detail: { ...initial.detail!, files: [changedFile] } });
    await tick();
    expect(target.querySelector(".markdown-view")).toBe(documentNode);
    expect(documentNode.textContent).toContain("Updated detail");
    expect(target.querySelector("[data-document-identity]")?.getAttribute("data-document-identity")).toContain("doc-b");

    (Array.from(target.querySelectorAll(".details-tab")) as HTMLButtonElement[]).find((button) => button.textContent?.includes("Artifacts"))!.click();
    await tick();
    (Array.from(target.querySelectorAll(".artifact-row")) as HTMLButtonElement[]).find((button) => button.textContent?.includes("folder"))!.click();
    await tick();
    const nestedNode = (Array.from(target.querySelectorAll(".artifact-row")) as HTMLButtonElement[]).find((button) => button.textContent?.includes("nested.txt"))!;
    nestedNode.dataset.identityProbe = "expanded";
    channel.publish({ ...initial, resourceTitle: "Another metadata refresh", detail: { ...initial.detail!, title: "Another metadata refresh" } });
    await tick();
    expect((Array.from(target.querySelectorAll(".artifact-row")) as HTMLButtonElement[]).find((button) => button.textContent?.includes("nested.txt"))).toBe(nestedNode);
    expect(nestedNode.dataset.identityProbe).toBe("expanded");

  });

  it("confirms before deleting an artifact", async () => {
    const onDeleteArtifact = vi.fn(async () => undefined);
    const { target } = mountModel(resourceModel({ onDeleteArtifact }));
    await tick();
    (Array.from(target.querySelectorAll(".details-tab")) as HTMLButtonElement[]).find((button) => button.textContent?.includes("Artifacts"))!.click();
    await tick();
    const row = (Array.from(target.querySelectorAll(".artifact-row")) as HTMLElement[]).find((button) => button.textContent?.includes("a.txt"))!;
    const deleteButton = row.querySelector<HTMLElement>(".artifact-delete")!;
    expect(deleteButton).not.toBeNull();

    const confirmSpy = confirmDialogMock.mockReset().mockResolvedValue(false);
    deleteButton.click();
    await vi.waitFor(() => expect(confirmSpy).toHaveBeenCalledOnce());
    expect(onDeleteArtifact).not.toHaveBeenCalled();

    confirmSpy.mockResolvedValue(true);
    deleteButton.click();
    await vi.waitFor(() => expect(onDeleteArtifact).toHaveBeenCalledWith("project1/task1/artifacts/a.txt"));
  });

  it("hides artifact delete controls for archived resources", async () => {
    const initial = resourceModel();
    const { target } = mountModel(resourceModel({ detail: { ...initial.detail!, archived: true } }));
    await tick();
    (Array.from(target.querySelectorAll(".details-tab")) as HTMLButtonElement[]).find((button) => button.textContent?.includes("Artifacts"))!.click();
    await tick();
    expect(target.querySelector(".artifact-delete")).toBeNull();
  });

  it("ignores a late preview response after selecting another file", async () => {
    const pending = new Map<string, (response: Response) => void>();
    vi.stubGlobal("fetch", vi.fn((input: RequestInfo | URL) => new Promise<Response>((resolve) => pending.set(String(input), resolve))));
    const { target } = mountModel(resourceModel());
    await tick();
    (Array.from(target.querySelectorAll(".details-tab")) as HTMLButtonElement[]).find((button) => button.textContent?.includes("Artifacts"))!.click();
    await tick();
    (Array.from(target.querySelectorAll(".artifact-row")) as HTMLButtonElement[]).find((button) => button.textContent?.includes("a.txt"))!.click();
    await tick();
    (Array.from(target.querySelectorAll(".artifact-row")) as HTMLButtonElement[]).find((button) => button.textContent?.includes("b.txt"))!.click();
    await tick();
    const urls = [...pending.keys()];
    pending.get(urls[0])!(new Response(JSON.stringify({ path: "a.txt", content: "old response", contentHash: "old" }), { headers: { "content-type": "application/json" } }));
    pending.get(urls[1])!(new Response(JSON.stringify({ path: "b.txt", content: "current response", contentHash: "current" }), { headers: { "content-type": "application/json" } }));
    await vi.waitFor(() => expect(target.querySelector('[role="dialog"]')?.textContent).toContain("current response"));
    expect(target.querySelector('[role="dialog"]')?.textContent).not.toContain("old response");
  });

  it("preserves an open artifact preview while the same file is refreshed", async () => {
    const fetch = vi.fn(async () => new Response(JSON.stringify({
      path: "a.txt",
      content: Array.from({ length: 40 }, (_, index) => `line ${index + 1}`).join("\n"),
      contentHash: "a-v1",
    }), { headers: { "content-type": "application/json" } }));
    vi.stubGlobal("fetch", fetch);
    const initial = resourceModel();
    const { channel, target } = mountModel(initial);
    await tick();
    (Array.from(target.querySelectorAll(".details-tab")) as HTMLButtonElement[]).find((button) => button.textContent?.includes("Artifacts"))!.click();
    await tick();
    const file = (Array.from(target.querySelectorAll(".artifact-row")) as HTMLButtonElement[]).find((button) => button.textContent?.includes("a.txt"))!;
    file.click();
    await vi.waitFor(() => expect(target.querySelector("[data-preview-scroll]")).not.toBeNull());

    const scroller = target.querySelector<HTMLElement>("[data-preview-scroll]")!;
    scroller.scrollTop = 40;
    scroller.scrollLeft = 7;
    channel.publish({ ...initial, resourceTitle: "Refreshed", detail: { ...initial.detail!, title: "Refreshed" } });
    await tick();
    expect(target.querySelector<HTMLElement>("[data-preview-scroll]")).toBe(scroller);
    file.click();
    await tick();

    expect(fetch).toHaveBeenCalledOnce();
    expect(scroller.scrollTop).toBe(40);
    expect(scroller.scrollLeft).toBe(7);
  });

  it("ignores a late Diff response after switching worktrees", async () => {
    const pending = new Map<string, (response: Response) => void>();
    vi.stubGlobal("fetch", vi.fn((input: RequestInfo | URL) => new Promise<Response>((resolve) => pending.set(String(input), resolve))));
    window.Diff2Html = { html: (diff) => `<div>${diff}</div>` };
    const { target } = mountModel(resourceModel());
    await tick();
    (Array.from(target.querySelectorAll(".details-tab")) as HTMLButtonElement[]).find((button) => button.textContent?.includes("Worktrees"))!.click();
    await tick();
    const viewButtons = Array.from(target.querySelectorAll(".worktree-row button")) as HTMLButtonElement[];
    viewButtons[0].click();
    await tick();
    (target.querySelector('[role="dialog"] button[aria-label="Close"]') as HTMLButtonElement).click();
    await tick();
    viewButtons[1].click();
    await tick();
    const urls = [...pending.keys()];
    pending.get(urls[0])!(new Response(JSON.stringify({ path: "forge", diff: "stale diff", hasChanges: true }), { headers: { "content-type": "application/json" } }));
    pending.get(urls[1])!(new Response(JSON.stringify({ path: "docs", diff: "current diff", hasChanges: true }), { headers: { "content-type": "application/json" } }));
    await vi.waitFor(() => expect(target.querySelector('[role="dialog"]')?.textContent).toContain("current diff"));
    expect(target.querySelector('[role="dialog"]')?.textContent).not.toContain("stale diff");
  });

  it("renders workspace AGENTS.md in full across AGENTS.md and Wiki tabs", async () => {
    const initial = resourceModel({
      identity: "ws:workspace", resourceId: "workspace", resourceType: "workspace", resourceTitle: "Test workspace", detail: null,
      workspaceAgents: { path: "AGENTS.md", content: "# Notes\n\n<!-- managed by forge cli -->\nGenerated guidance.\n<!-- end of forge cli prompt -->\n", contentHash: "hash-a" },
      wiki: { exists: true, entries: [{ name: "index.md", path: "wiki/index.md", type: "file", size: 10 }] },
    });
    const { target } = mountModel(initial);
    await tick();

    const tabs = Array.from(target.querySelectorAll<HTMLButtonElement>("[role=tab]"));
    expect(tabs.map((tab) => tab.textContent?.trim())).toEqual(["AGENTS.md", "Wiki"]);
    expect(target.querySelector('[role="tab"][aria-selected="true"]')?.textContent).toContain("AGENTS.md");
    // The managed block is no longer hidden from the rendered document.
    expect(target.querySelector('[data-doc-file="AGENTS.md"]')).not.toBeNull();
    expect(target.textContent).toContain("Generated guidance.");
    expect(target.querySelector(".markdown-document-actions button")).not.toBeNull();
  });

  it("edits workspace AGENTS.md through the Markdown editor dialog", async () => {
    const save = vi.fn(async (_content: string, _hash: string) => ({ path: "AGENTS.md", name: "AGENTS.md", content: "# Notes\n\nEdited.\n", contentHash: "saved-hash" }));
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({
      path: "AGENTS.md", name: "AGENTS.md", content: "# Notes\n\n<!-- managed by forge cli -->\nsystem\n<!-- end of forge cli prompt -->\n", contentHash: "hash-a",
    }), { headers: { "content-type": "application/json" } })));
    const initial = resourceModel({
      identity: "ws:workspace", resourceId: "workspace", resourceType: "workspace", resourceTitle: "Test workspace", detail: null,
      workspaceAgents: { path: "AGENTS.md", content: "# Notes\n\n<!-- managed by forge cli -->\nsystem\n<!-- end of forge cli prompt -->\n", contentHash: "hash-a" },
      onSaveWorkspaceAgents: save,
    });
    const { target } = mountModel(initial);
    await tick();
    const edit = Array.from(target.querySelectorAll<HTMLButtonElement>("button")).find((button) => button.textContent?.includes("Edit / Annotate"))!;
    edit.click();
    await vi.waitFor(() => expect(target.querySelector<HTMLElement>('[role="dialog"] .cm-editor')).not.toBeNull());
    const dialog = target.querySelector<HTMLElement>('[role="dialog"]')!;
    const view = EditorView.findFromDOM(dialog.querySelector<HTMLElement>(".cm-editor")!)!;
    view.dispatch({ changes: { from: view.state.doc.length, insert: "\nEdited.\n" } });
    await tick();
    const saveButton = Array.from(dialog.querySelectorAll<HTMLButtonElement>("button")).find((button) => button.textContent?.trim() === "Save")!;
    saveButton.click();
    await vi.waitFor(() => expect(save).toHaveBeenCalledOnce());
    expect(save).toHaveBeenCalledWith("# Notes\n\n<!-- managed by forge cli -->\nsystem\n<!-- end of forge cli prompt -->\n\nEdited.\n", "hash-a");
  });

  it("keeps file-browser directory icons stable and toggles expansion with a class", async () => {
    const { target } = mountModel(resourceModel());
    await tick();
    (Array.from(target.querySelectorAll(".details-tab")) as HTMLButtonElement[]).find((button) => button.textContent?.includes("Artifacts"))!.click();
    await tick();

    const directoryRow = target.querySelector<HTMLButtonElement>(".artifact-row.directory")!;
    expect(directoryRow).not.toBeNull();
    expect(directoryRow.classList.contains("open")).toBe(false);
    // The chevron stays a single stable icon; direction comes from the open class.
    expect(directoryRow.querySelector('.artifact-chevron i[data-lucide="chevron-right"]')).not.toBeNull();
    expect(directoryRow.querySelector('.artifact-chevron i[data-lucide="chevron-down"]')).toBeNull();
    // Folder and folder-open are both rendered and switched through the open class.
    expect(directoryRow.querySelector('.artifact-folder-icon i[data-lucide="folder"]')).not.toBeNull();
    expect(directoryRow.querySelector('.artifact-folder-icon i[data-lucide="folder-open"]')).not.toBeNull();

    directoryRow.click();
    await tick();
    const expandedRow = target.querySelector<HTMLButtonElement>(".artifact-row.directory")!;
    expect(expandedRow.classList.contains("open")).toBe(true);
  });

});
