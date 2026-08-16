import { afterEach, describe, expect, it, vi } from "vitest";

import type { AppShellModel } from "../../src/components/models";
import type { DetailPanelModel } from "../../src/models/detail";

function json(value: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    headers: new Headers({ "content-type": "application/json" }),
    json: async () => value,
  } as unknown as Response;
}

function taskTreeItem(id: string, title: string) {
  return { id, type: "task", title, path: `project1/${id.replace("project1.", "")}`, archived: false, agentBinding: { kind: "profile", name: "default" } };
}

function resourceDetail(id: string, title: string) {
  const isProject = !id.includes(".");
  return {
    id,
    type: isProject ? "project" : "task",
    title,
    path: isProject ? id : `project1/${id.replace("project1.", "")}`,
    archived: false,
    agentBinding: { kind: "profile", name: "default" },
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    artifacts: [],
    files: [],
  };
}

describe("Archive resource flow", () => {
  let stopPUAApp: (() => void) | null = null;

  afterEach(async () => {
    stopPUAApp?.();
    stopPUAApp = null;
    document.body.replaceChildren();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("updates only the affected tree nodes without reloading the whole tree", async () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: () => false,
    }));

    const tree = {
      agentBinding: { kind: "profile", name: "default" },
      projects: [
        {
          id: "project1",
          type: "project",
          title: "Project One",
          path: "project1",
          archived: false,
          agentBinding: { kind: "profile", name: "default" },
          children: [taskTreeItem("project1.task1", "Task One"), taskTreeItem("project1.task2", "Task Two")],
        },
        {
          id: "project2",
          type: "project",
          title: "Project Two",
          path: "project2",
          archived: false,
          agentBinding: { kind: "profile", name: "default" },
          children: [],
        },
      ],
      attentionList: [],
      wiki: { exists: false },
    };
    let treeFetchCount = 0;
    let archivedResourceId = "";
    const uiStateBodies: Array<{ expandedProjects?: string[] }> = [];
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = new URL(String(input), window.location.origin);
      const method = init?.method || "GET";
      if (url.pathname === "/api/workspaces" && method === "GET") {
        return json({ activeId: "ws-test", workspaces: [{ id: "ws-test", name: "Test workspace", path: "/tmp/ws-test" }], agents: [], agentProfiles: [] });
      }
      if (url.pathname === "/api/settings/agenthub" && method === "GET") {
        return json({ connected: false, compatible: false, catalog: { providers: [], agents: [] }, config: { agentProfiles: [] } });
      }
      if (url.pathname === "/api/workspaces/ws-test/ui-state" && method === "GET") return json({ expandedProjects: ["project1", "project2"] });
      if (url.pathname === "/api/workspaces/ws-test/ui-state" && method === "PUT") {
        uiStateBodies.push(JSON.parse(String(init?.body || "{}")) as { expandedProjects?: string[] });
        return json({});
      }
      if (url.pathname === "/api/workspaces/ws-test/tree" && method === "GET") {
        treeFetchCount++;
        return json(tree);
      }
      if (url.pathname === "/api/workspaces/ws-test/archive" && method === "POST") {
        archivedResourceId = String((JSON.parse(String(init?.body || "{}")) as { resourceId?: string }).resourceId || "");
        return json({ path: "archive/project1/task1", warnings: [] });
      }
      const detailMatch = url.pathname.match(/^\/api\/workspaces\/ws-test\/resources\/([^/]+)$/);
      if (detailMatch && method === "GET") {
        const id = decodeURIComponent(detailMatch[1]);
        return json(resourceDetail(id, id));
      }
      const statusMatch = url.pathname.match(/^\/api\/workspaces\/ws-test\/resources\/([^/]+)\/status$/);
      if (statusMatch && method === "GET") {
        return json({ acceptsMessages: true, waitingMessages: [], canSteerWaiting: false, session: { state: "idle" } });
      }
      throw new Error(`Unexpected ${method} ${url.pathname}${url.search}`);
    }));

    const appShellModels: AppShellModel[] = [];
    const detailModels: DetailPanelModel[] = [];
    const publisher = {
      renderAppShell: vi.fn((model: AppShellModel) => { appShellModels.push(model); }),
      renderCreateDialog: vi.fn(),
      renderSettings: vi.fn(),
      renderUploadDialog: vi.fn(),
      renderComposer: vi.fn(),
      renderEventTimeline: vi.fn(),
      renderAgentPanelHeader: vi.fn(),
      renderDetailPanel: vi.fn((model: DetailPanelModel) => { detailModels.push(model); }),
      renderToast: vi.fn(),
    };
    const controller = await import("../../src/app-controller");
    stopPUAApp = controller.stopPUAApp;
    controller.startPUAApp(publisher);

    // Wait for the initial tree load to finish and select the task to archive.
    await vi.waitFor(() => {
      const latest = appShellModels.at(-1);
      expect(latest?.loading).toBe(false);
      expect(latest?.projects.find((project) => project.id === "project1")?.children.map((task) => task.id)).toEqual(["project1.task1", "project1.task2"]);
    });
    await appShellModels.at(-1)!.onSelectResource("project1.task1");
    await vi.waitFor(() => {
      expect(detailModels.at(-1)?.resourceId).toBe("project1.task1");
      expect(detailModels.at(-1)?.detail?.id).toBe("project1.task1");
    });

    const treeFetchesBeforeArchive = treeFetchCount;
    const loadingModelsBeforeArchive = appShellModels.filter((model) => model.loading).length;

    await detailModels.at(-1)!.onArchive("project1.task1");

    await vi.waitFor(() => {
      const latest = appShellModels.at(-1);
      const project1 = latest?.projects.find((project) => project.id === "project1");
      expect(project1?.children.map((task) => task.id)).toEqual(["project1.task2"]);
      // The redirect target becomes the active selection.
      expect(project1?.children[0]?.active).toBe(true);
      // Unrelated nodes are untouched.
      expect(latest?.projects.map((project) => project.id)).toEqual(["project1", "project2"]);
    });

    expect(archivedResourceId).toBe("project1.task1");
    // The tree endpoint is not re-fetched: the archived node is removed locally.
    expect(treeFetchCount).toBe(treeFetchesBeforeArchive);
    // Archiving never puts the sidebar back into the whole-tree loading state.
    expect(appShellModels.filter((model) => model.loading).length).toBe(loadingModelsBeforeArchive);
    // The detail panel follows the redirect target.
    await vi.waitFor(() => {
      expect(detailModels.at(-1)?.resourceId).toBe("project1.task2");
      expect(detailModels.at(-1)?.detail?.id).toBe("project1.task2");
    });
    expect(treeFetchCount).toBe(treeFetchesBeforeArchive);

    // Archiving a whole project also removes it from the expanded set that is
    // persisted to ui-state, so the archived project cannot linger on disk.
    await appShellModels.at(-1)!.onSelectResource("project2");
    await vi.waitFor(() => {
      expect(detailModels.at(-1)?.resourceId).toBe("project2");
      expect(detailModels.at(-1)?.detail?.id).toBe("project2");
    });
    await detailModels.at(-1)!.onArchive("project2");
    await vi.waitFor(() => {
      const latest = appShellModels.at(-1);
      expect(latest?.projects.map((project) => project.id)).toEqual(["project1"]);
      expect(latest?.projects[0]?.active).toBe(true);
    });
    expect(treeFetchCount).toBe(treeFetchesBeforeArchive);
    expect(appShellModels.filter((model) => model.loading).length).toBe(loadingModelsBeforeArchive);
    expect(uiStateBodies.at(-1)?.expandedProjects).toEqual(["project1"]);
  });
});
