import { mount, tick, unmount } from "svelte";
import { afterEach, describe, expect, it, vi } from "vitest";

import DetailPanel from "../../src/islands/DetailPanel.svelte";
import { createIslandChannel } from "../../src/islands/channel";
import type { DetailPanelModel } from "../../src/islands/models";

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
      logs: [{ id: "log-1", time: "2026-08-11T00:00:00Z", title: "First", details: "Initial details" }],
      logPage: { hasMore: true, nextCursor: "log-1" },
      artifacts: [{ name: "folder", path: "project1/task1/artifacts/folder", type: "directory", children: [{ name: "nested.txt", path: "project1/task1/artifacts/folder/nested.txt", type: "file", size: 4 }] }, { name: "a.txt", path: "project1/task1/artifacts/a.txt", type: "file", size: 3 }, { name: "b.txt", path: "project1/task1/artifacts/b.txt", type: "file", size: 3 }],
      repos: [{ name: "forge", worktreePath: "project1/task1/worktree/forge", branch: "topic", targetBranch: "master" }, { name: "docs", worktreePath: "project1/task1/worktree/docs", branch: "docs-topic", targetBranch: "master" }],
    },
    wiki: null,
    workspaceAgents: null,
    logs: { hasMore: true, loading: false, error: "" },
    onNavigate: vi.fn(), onCreateTask: vi.fn(), onArchive: vi.fn(), onLoadMoreLogs: vi.fn(async () => undefined),
    onSaveWorkspaceAgents: vi.fn(async () => ({ path: "AGENTS.md", content: "", contentHash: "saved" })),
    onToast: vi.fn(), onIconsChanged: vi.fn(),
    ...overrides,
  };
}

function mountModel(model: DetailPanelModel) {
  const channel = createIslandChannel(model);
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
});
