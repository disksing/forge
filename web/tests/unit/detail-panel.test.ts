import { mount, tick, unmount } from "svelte";
import { afterEach, describe, expect, it, vi } from "vitest";

import DetailPanel from "../../src/components/DetailPanel.svelte";
import LogTimeline from "../../src/components/LogTimeline.svelte";
import { createModelChannel } from "../../src/components/model-channel";
import type { DetailPanelModel } from "../../src/components/models";

const mounted: Array<ReturnType<typeof mount>> = [];

function resourceModel(overrides: Partial<DetailPanelModel> = {}): DetailPanelModel {
  return {
    identity: "ws:project1.task1:task",
    workspaceId: "ws",
    workspaceName: "Test workspace",
    resourceId: "project1.task1",
    resourceType: "task",
    resourceTitle: "Stable detail",
    creator: { kind: "resource", workspaceInstanceId: "ws-source", resourceId: "project2.task3" },
    parent: { id: "project1", title: "Project" },
    loading: false,
    detail: {
      id: "project1.task1", type: "task", title: "Stable detail", path: "project1/task1",
      files: [{ name: "task.md", path: "project1/task1/task.md", content: "# Stable detail\n\nSelected text.", contentHash: "doc-a" }],
      logs: [{ id: "log-1", time: "2026-08-11T00:00:00Z", title: "First", details: "Initial details" }],
      logPage: { hasMore: true, nextCursor: "log-1" },
      artifacts: [{ name: "folder", path: "project1/task1/artifacts/folder", type: "directory", children: [{ name: "nested.txt", path: "project1/task1/artifacts/folder/nested.txt", type: "file", size: 4 }] }, { name: "a.txt", path: "project1/task1/artifacts/a.txt", type: "file", size: 3 }, { name: "b.txt", path: "project1/task1/artifacts/b.txt", type: "file", size: 3 }],
      repos: [{ name: "forge", worktreePath: "project1/task1/worktree/forge", branch: "topic", targetBranch: "master" }, { name: "docs", worktreePath: "project1/task1/worktree/docs", branch: "docs-topic", targetBranch: "master" }],
    },
    wiki: null,
    workspaceAgents: null,
    agentBinding: { kind: "profile", name: "default" },
    agentProfiles: [{ key: "default", description: "Default", agentName: "fake-agent" }],
    agents: [{ id: "fake-agent", label: "Fake Agent", summary: "fake" }],
    logs: { hasMore: true, loading: false, error: "" },
    onNavigate: vi.fn(), onCreateTask: vi.fn(), onArchive: vi.fn(), onLoadMoreLogs: vi.fn(async () => undefined),
    onSaveWorkspaceAgents: vi.fn(async () => ({ path: "AGENTS.md", content: "", contentHash: "saved" })),
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
  it("renders the compact resource number inside an independently scrollable body", async () => {
    const { target } = mountModel(resourceModel());
    await tick();

    const header = target.querySelector(".details-header")!;
    const tabs = target.querySelector(".details-tabs")!;
    const content = target.querySelector("#detailsContent")!;
    expect(target.querySelector(".resource-ref-badge")?.textContent).toBe("#1");
    expect(target.querySelector(".resource-creator-badge")?.textContent).toBe("Created by project2.task3");
    expect(target.querySelector(".resource-creator-badge")?.getAttribute("title")).toContain("ws-source / project2.task3");
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
    expect(documentSection.querySelector(".markdown-open-file")).toBeNull();

    const artifactsSection = target.querySelector('[data-component-owner="file-browser"]')!;
    expect(artifactsSection.querySelector("h3")).toBeNull();
    const worktreesSection = target.querySelector(".worktree-list")!.closest(".content-section")!;
    expect(worktreesSection.querySelector("h3")).toBeNull();
    const logsSection = target.querySelector('[data-component-owner="log-timeline"]')!;
    expect(logsSection.querySelector("h3")).toBeNull();
  });

  it("labels legacy resources without inventing creator provenance", async () => {
    const { target } = mountModel(resourceModel({ creator: undefined }));
    await tick();
    expect(target.querySelector(".resource-creator-badge")?.textContent).toBe("Creator unknown (legacy)");
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

  it("keeps document and log DOM identity across unrelated refreshes and appends", async () => {
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

    (Array.from(target.querySelectorAll(".details-tab")) as HTMLButtonElement[]).find((button) => button.textContent?.includes("Logs"))!.click();
    await tick();
    const logNode = target.querySelector('[data-log-id="log-1"]') as HTMLDetailsElement;
    logNode.open = true;
    const appended = { id: "log-2", time: "2026-08-10T23:00:00Z", title: "Older", details: "Older details" };
    channel.publish({ ...initial, detail: { ...initial.detail!, logs: [...initial.detail!.logs!, appended] }, logs: { hasMore: false, loading: false, error: "" } });
    await tick();
    expect(target.querySelector('[data-log-id="log-1"]')).toBe(logNode);
    expect(logNode.open).toBe(true);
    expect(target.querySelectorAll("[data-log-id]")).toHaveLength(2);
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

  it("preserves a dirty editor and its selection when the server content changes", async () => {
    const save = vi.fn(async () => { throw new Error("AGENTS.md changed on disk"); });
    const initial = resourceModel({
      identity: "ws:workspace", resourceId: "workspace", resourceType: "workspace", resourceTitle: "Test workspace", detail: null,
      workspaceAgents: { path: "AGENTS.md", content: "local baseline", contentHash: "hash-a" },
      onSaveWorkspaceAgents: save,
    });
    const { channel, target } = mountModel(initial);
    await tick();
    const textarea = target.querySelector("textarea")!;
    textarea.focus();
    textarea.value = "unsaved local draft";
    textarea.setSelectionRange(8, 13);
    textarea.scrollTop = 18;
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
    channel.publish({ ...initial, workspaceAgents: { path: "AGENTS.md", content: "server changed", contentHash: "hash-b" } });
    await tick();
    expect(textarea.value).toBe("unsaved local draft");
    expect(document.activeElement).toBe(textarea);
    expect([textarea.selectionStart, textarea.selectionEnd, textarea.scrollTop]).toEqual([8, 13, 18]);
    expect(target.textContent).toContain("changed on disk while you were editing");
    (target.querySelector('button[type="submit"]') as HTMLButtonElement).click();
    await tick(); await tick();
    expect(save).toHaveBeenCalledWith("unsaved local draft", "hash-a");
    expect(textarea.value).toBe("unsaved local draft");
    expect(target.textContent).toContain("AGENTS.md changed on disk");
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

  it("keeps the log load-more icon static and toggles busy through a class", async () => {
    const target = document.createElement("div");
    document.body.append(target);
    const component = mount(LogTimeline, { target, props: {
      resourceId: "project1.task1", logs: [], hasMore: true, loading: false, error: "",
      onLoadMore: vi.fn(async () => undefined), onIconsChanged: vi.fn(),
    } });
    mounted.push(component);
    await tick();

    const button = target.querySelector<HTMLButtonElement>(".log-load-more")!;
    expect(button.querySelector('.log-load-icon-idle i[data-lucide="chevron-down"]')).not.toBeNull();
    expect(button.querySelector('.log-load-icon-busy i[data-lucide="loader-circle"]')).not.toBeNull();
    expect(button.classList.contains("busy")).toBe(false);
  });
});
