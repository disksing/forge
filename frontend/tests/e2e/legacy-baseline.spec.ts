import { expect, test, type Page, type Route } from "@playwright/test";

const now = "2026-08-10T12:00:00Z";

interface Harness {
  inputBodies: Array<Record<string, unknown>>;
  taskBodies: Array<Record<string, unknown>>;
  streamRequests: string[];
  treeRequests: number;
}

const project = {
  id: "project1",
  type: "project",
  title: "Migration project",
  path: "project1-migration",
  archived: false,
  children: [
    {
      id: "project1.task1",
      type: "task",
      title: "Infrastructure task",
      path: "project1-migration/task1-infrastructure",
      archived: false,
    },
    {
      id: "project1.task2",
      type: "task",
      title: "Follow-up task",
      path: "project1-migration/task2-follow-up",
      archived: false,
    },
  ],
};

const runs = [
  {
    id: "run-1",
    workspaceId: "ws-test",
    resourceId: "project1.task1",
    agentHubSessionId: "session-1",
    agentHubAgentName: "test-agent",
    title: "Primary session",
    cwd: "/tmp/forge-e2e/worktree",
    status: "idle",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "run-2",
    workspaceId: "ws-test",
    resourceId: "project1.task1",
    agentHubSessionId: "session-2",
    agentHubAgentName: "test-agent",
    title: "Secondary session",
    cwd: "/tmp/forge-e2e/worktree",
    status: "idle",
    createdAt: "2026-08-10T11:00:00Z",
    updatedAt: "2026-08-10T11:00:00Z",
  },
];

function detail(id: string) {
  const resource = id === project.id ? project : project.children.find((item) => item.id === id);
  if (!resource) throw new Error(`unknown resource ${id}`);
  return {
    ...resource,
    files: [
      { name: "task.md", path: `${resource.path}/task.md`, content: `# ${resource.title}\n\nBaseline content.` },
    ],
    logs: [],
    logPage: { hasMore: false, nextCursor: "" },
    artifacts: [],
    repos: [],
    templates: [],
  };
}

function historyEvents(runId: string) {
  return Array.from({ length: 32 }, (_, index) => ({
    id: index + 1,
    time: `2026-08-10T12:${String(index).padStart(2, "0")}:00Z`,
    type: index % 2 === 0 ? "message.input" : "message.assistant.delta",
    sessionId: runId,
    turnId: `turn-${index}`,
    data: {
      text: `${runId} baseline message ${index + 1}`,
      ...(index % 2 === 0 ? { role: "user", sender: { name: "Test User" } } : {}),
    },
  }));
}

async function json(route: Route, body: unknown, status = 200) {
  await route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
}

async function installMockApi(page: Page, lastResourceId = "project1.task1"): Promise<Harness> {
  const harness: Harness = { inputBodies: [], taskBodies: [], streamRequests: [], treeRequests: 0 };
  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    const method = request.method();

    if (path === "/api/workspaces" && method === "GET") {
      return json(route, {
        version: 3,
        activeId: "ws-test",
        workspaces: [{ id: "ws-test", name: "Isolated E2E", path: "/tmp/forge-e2e" }],
        agentProfiles: [{ key: "default", agentName: "test-agent" }],
      });
    }
    if (path === "/api/settings/agenthub") {
      return json(route, {
        config: { agentProfiles: [{ key: "default", agentName: "test-agent" }] },
        connected: true,
        compatible: true,
        catalog: {
          providers: [{ id: "test", name: "Test Provider", enabled: true }],
          agents: [{ name: "test-agent", providerId: "test", available: true }],
          probes: [],
        },
      });
    }
    if (path === "/api/workspaces/ws-test/ui-state") {
      if (method === "PUT") return json(route, {});
      return json(route, {
        version: 1,
        expandedProjects: ["project1"],
        lastResourceId,
        projectOrder: [],
        taskOrder: {},
        sessionOrder: [],
      });
    }
    if (path === "/api/workspaces/ws-test/tree") {
      harness.treeRequests += 1;
      return json(route, {
        root: "/tmp/forge-e2e",
        projects: [project],
        sessions: runs.map((run) => ({
          id: `forge-${run.id}`,
          controls: [{ resourceId: run.resourceId, path: run.resourceId }],
          startedAt: run.createdAt,
          updatedAt: run.updatedAt,
          source: "internal",
          agentRunId: run.id,
          agentRunAgentName: run.agentHubAgentName,
          agentRunTitle: run.title,
          agentRunStatus: run.status,
          resourceId: run.resourceId,
        })),
        wiki: { exists: true, entries: [] },
      });
    }
    const resourceMatch = path.match(/^\/api\/workspaces\/ws-test\/resources\/(.+)$/);
    if (resourceMatch) return json(route, detail(decodeURIComponent(resourceMatch[1])));
    if (path === "/api/workspaces/ws-test/tasks" && method === "POST") {
      harness.taskBodies.push(request.postDataJSON());
      return json(route, { id: "project1.task3" }, 201);
    }
    if (path === "/api/workspaces/ws-test/agent/runs" && method === "GET") {
      const resourceId = url.searchParams.get("resourceId");
      return json(route, { runs: resourceId === "project1.task1" ? runs : [] });
    }
    const runMatch = path.match(/^\/api\/workspaces\/ws-test\/agent\/runs\/(run-[12])$/);
    if (runMatch && method === "GET") {
      return json(route, { run: runs.find((run) => run.id === runMatch[1]) });
    }
    const eventsMatch = path.match(/^\/api\/workspaces\/ws-test\/agent\/runs\/(run-[12])\/events$/);
    if (eventsMatch) {
      return json(route, { events: historyEvents(eventsMatch[1]), page: { hasMoreBefore: false } });
    }
    const streamMatch = path.match(/^\/api\/workspaces\/ws-test\/agent\/runs\/(run-[12])\/stream$/);
    if (streamMatch) {
      harness.streamRequests.push(streamMatch[1]);
      const event = {
        id: 100,
        time: now,
        type: "message.assistant.delta",
        sessionId: streamMatch[1],
        turnId: "turn-stream",
        data: { text: `SSE update for ${streamMatch[1]}` },
      };
      return route.fulfill({
        status: 200,
        contentType: "text/event-stream",
        headers: { "cache-control": "no-cache" },
        body: `id: 100\ndata: ${JSON.stringify(event)}\n\n`,
      });
    }
    const inputMatch = path.match(/^\/api\/workspaces\/ws-test\/agent\/runs\/(run-[12])\/input$/);
    if (inputMatch && method === "POST") {
      harness.inputBodies.push(request.postDataJSON());
      return json(route, { status: "accepted" });
    }
    if (/\/agent\/runs\/run-[12]\/stop$/.test(path) && method === "POST") return json(route, {});
    return json(route, { error: `Unhandled mock request: ${method} ${path}` }, 500);
  });
  return harness;
}

test("navigates resources and creates a task without changing the legacy flow", async ({ page }) => {
  const harness = await installMockApi(page, "project1");
  await page.goto("/w/ws-test/r/project1");

  await expect(page.locator('[data-svelte-owned="brand-version"]')).toHaveText("v0.1.0");
  await expect(page.getByRole("heading", { name: "Migration project", exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Infrastructure task/ }).click();
  await expect(page).toHaveURL(/project1\.task1/);
  await expect(page.getByRole("heading", { name: /Infrastructure task/ }).first()).toBeVisible();
  await page.getByRole("button", { name: "Migration project", exact: true }).click();
  await page.getByRole("button", { name: "New Task" }).click();
  await page.locator('#createDialogForm input[name="title"]').fill("Created from baseline");
  await page.locator('#createDialogForm textarea[name="detail"]').fill("Playwright isolated task body");
  await page.locator("#createDialogForm").getByRole("button", { name: "Create", exact: true }).click();

  await expect.poll(() => harness.taskBodies.length).toBe(1);
  expect(harness.taskBodies[0]).toMatchObject({
    project: "project1",
    title: "Created from baseline",
    detail: "Playwright isolated task body",
  });
  await expect(page.locator("#toast")).toContainText("Task created");
});

test("switches sessions, sends input, receives SSE, and preserves active reading state during refresh", async ({ page }) => {
  const harness = await installMockApi(page);
  await page.goto("/w/ws-test/r/project1.task1");

  await expect(page.locator(".agent-current-run strong")).toHaveText("Primary session");
  await expect(page.locator("#ttyLog")).toContainText("SSE update for run-1");
  await page.locator(".agent-current-run").click();
  await page.locator('[data-agent-run="run-2"]').last().click();
  await expect(page.locator(".agent-current-run strong")).toHaveText("Secondary session");
  await page.locator(".agent-current-run").click();
  await page.locator('[data-agent-run="run-1"]').last().click();
  await expect(page.locator(".agent-current-run strong")).toHaveText("Primary session");

  const input = page.locator("#ttyInput");
  await input.fill("Preserve this draft until accepted");
  await input.press("Enter");
  await expect.poll(() => harness.inputBodies.length).toBe(1);
  expect(harness.inputBodies[0]).toMatchObject({ text: "Preserve this draft until accepted" });
  await expect(input).toBeFocused();
  await expect(input).toHaveValue("");

  await input.fill("Draft survives refresh");
  const before = await page.locator("#ttyLog").evaluate((log) => {
    log.scrollTop = Math.max(1, Math.floor(log.scrollHeight / 3));
    const bubble = log.querySelector(".agent-message-bubble");
    const text = bubble?.firstChild;
    if (!text) throw new Error("message text is unavailable");
    const range = document.createRange();
    range.selectNodeContents(bubble);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    return { scrollTop: log.scrollTop, selection: selection?.toString() || "" };
  });
  await input.focus();
  await page.waitForTimeout(5_300);

  await expect(input).toBeFocused();
  await expect(input).toHaveValue("Draft survives refresh");
  const after = await page.locator("#ttyLog").evaluate((log) => ({
    scrollTop: log.scrollTop,
    selection: window.getSelection()?.toString() || "",
  }));
  expect(after.scrollTop).toBe(before.scrollTop);
  expect(after.selection).toBe(before.selection);
  expect(after.selection).not.toBe("");
  expect(harness.treeRequests).toBeGreaterThan(1);
  expect(harness.streamRequests).toContain("run-1");
});
