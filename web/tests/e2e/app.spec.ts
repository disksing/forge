import { expect, test, type Page, type Route } from "@playwright/test";

const now = "2026-08-10T12:00:00Z";

interface Harness {
  inputBodies: Array<Record<string, unknown>>;
  taskBodies: Array<Record<string, unknown>>;
  previewBodies: Array<Record<string, unknown>>;
  settingsBodies: Array<Record<string, unknown>>;
  selfDrivingBodies: Array<Record<string, unknown>>;
  uploadNames: string[];
  streamRequests: string[];
  treeRequests: number;
  agentsBodies: Array<Record<string, unknown>>;
  uiStateBodies: Array<Record<string, unknown>>;
}

const templates = [
  {
    name: "feature-a", title: "Feature A", description: "First template", valid: true, taskTitle: "{{ summary }}",
    fields: [{ name: "summary", type: "text", label: "Summary", required: true, hasDefault: false }],
  },
  {
    name: "feature-b", title: "Feature B", description: "Second template", valid: true, taskTitle: "{{ summary }}",
    fields: [{ name: "summary", type: "text", label: "Summary", required: true, hasDefault: false }],
  },
];

const longDetailBody = Array.from({ length: 60 }, (_, index) => `Stable detail paragraph ${index + 1}.`).join("\n\n");

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
      { name: resource.type === "project" ? "project.md" : "task.md", path: `${resource.path}/${resource.type === "project" ? "project.md" : "task.md"}`, content: `# ${resource.title}\n\nBaseline content with a stable selection target.\n\n${longDetailBody}`, contentHash: `${id}-brief-v1` },
      ...(resource.type === "task" ? [{ name: "work.md", path: `${resource.path}/work.md`, content: "# Work\n\nCurrent checkpoint.", contentHash: `${id}-work-v1` }] : []),
    ],
    logs: [{ id: `${id}-log-1`, time: now, title: "Initial detail log", details: "Stable log details." }],
    logPage: { hasMore: true, nextCursor: `${id}-log-1` },
    artifacts: [{ name: "notes.md", path: `${resource.path}/artifacts/notes.md`, type: "file", size: 24 }],
    repos: resource.type === "task" ? [{ name: "forge", worktreePath: `${resource.path}/worktree/forge`, branch: "topic", targetBranch: "master" }] : [],
    templates: resource?.type === "project" ? templates : [],
    ...(resource?.type === "task" ? { selfDriving: { enabled: false, revision: 0, condition: "disabled", agentName: "" } } : {}),
  };
}

function historyEvents(runId: string) {
  return Array.from({ length: 32 }, (_, index) => ({
    id: index + 33,
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
  const harness: Harness = { inputBodies: [], taskBodies: [], previewBodies: [], settingsBodies: [], selfDrivingBodies: [], uploadNames: [], streamRequests: [], treeRequests: 0, agentsBodies: [], uiStateBodies: [] };
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
      if (method === "PUT") {
        harness.settingsBodies.push(request.postDataJSON());
        return json(route, {});
      }
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
    if (path === "/api/settings" && method === "GET") {
      return json(route, {
        version: 3,
        activeId: "ws-test",
        workspaces: [{ id: "ws-test", name: "Isolated E2E", path: "/tmp/forge-e2e" }],
      });
    }
    if (path === "/api/workspaces/ws-test/ui-state") {
      if (method === "PUT") {
        harness.uiStateBodies.push(request.postDataJSON());
        return json(route, {});
      }
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
        wiki: { exists: true, entries: [{ name: "index.md", path: "index.md", type: "file", size: 28 }] },
      });
    }
    const resourceMatch = path.match(/^\/api\/workspaces\/ws-test\/resources\/(.+)$/);
    if (resourceMatch) {
      const value = detail(decodeURIComponent(resourceMatch[1]));
      if (url.searchParams.get("logsCursor")) {
        value.logs = [{ id: `${value.id}-log-2`, time: "2026-08-09T12:00:00Z", title: "Older detail log", details: "Older page." }];
        value.logPage = { hasMore: false, nextCursor: `${value.id}-log-2` };
      }
      return json(route, value);
    }
    if (path === "/api/workspaces/ws-test/files") {
      const filePath = url.searchParams.get("path") || "";
      if (method === "PUT") {
        const body = request.postDataJSON();
        harness.agentsBodies.push(body);
        return json(route, { path: "AGENTS.md", name: "AGENTS.md", content: String(body.content || ""), contentHash: "agents-saved" });
      }
      if (filePath === "AGENTS.md") return json(route, { path: "AGENTS.md", name: "AGENTS.md", content: "Workspace guidance", contentHash: "agents-v1" });
      return json(route, { path: filePath, name: filePath.split("/").pop(), content: `# Preview\n\nContent for ${filePath}\n\n${longDetailBody}`, contentHash: `hash-${filePath}` });
    }
    if (path === "/api/workspaces/ws-test/wiki/files") {
      const filePath = url.searchParams.get("path") || "";
      return json(route, { path: filePath, name: filePath.split("/").pop(), content: "# Workspace Wiki\n\nStable wiki content.", contentHash: "wiki-v1" });
    }
    if (path === "/api/workspaces/ws-test/diff") return json(route, { path: url.searchParams.get("path"), branch: "topic", base: "master", diff: "diff --git a/a.txt b/a.txt\nnew file mode 100644\n--- /dev/null\n+++ b/a.txt\n@@ -0,0 +1 @@\n+detail diff\n", hasChanges: true });
    if (path === "/api/workspaces/ws-test/tasks" && method === "POST") {
      harness.taskBodies.push(request.postDataJSON());
      return json(route, { id: "project1.task3" }, 201);
    }
    if (path === "/api/workspaces/ws-test/tasks/preview" && method === "POST") {
      const body = request.postDataJSON();
      harness.previewBodies.push(body);
      const templateName = String(body.templateName || "");
      await new Promise((resolve) => setTimeout(resolve, templateName === "feature-a" ? 350 : 20));
      const summary = String((body.templateFields as Record<string, unknown>)?.summary || "Untitled");
      return json(route, { title: `${templateName}:${summary}`, markdown: `# ${templateName}:${summary}\n`, slug: "", selfDriving: null, template: { digest: `digest-${templateName}` } });
    }
    if (path === "/api/workspaces/ws-test/self-driving" && method === "PUT") {
      harness.selfDrivingBodies.push(request.postDataJSON());
      return json(route, {});
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
      if (url.searchParams.has("before")) {
        return json(route, {
          events: [
            { id: 1, time: "2026-08-10T10:00:00Z", type: "message.input", sessionId: eventsMatch[1], turnId: "turn-older", data: { text: `${eventsMatch[1]} older history`, role: "user", sender: { name: "Test User" } } },
            { id: 32, time: "2026-08-10T10:01:00Z", type: "message.assistant.delta", sessionId: eventsMatch[1], turnId: "turn-older", data: { text: `${eventsMatch[1]} older reply` } },
            { id: 33, time: "2026-08-10T10:02:00Z", type: "message.input", sessionId: eventsMatch[1], turnId: "turn-overlap", data: { text: `${eventsMatch[1]} baseline message 1`, role: "user", sender: { name: "Test User" } } },
          ],
          page: { hasMoreBefore: false },
        });
      }
      if (eventsMatch[1] === "run-2") await new Promise((resolve) => setTimeout(resolve, 300));
      return json(route, { events: historyEvents(eventsMatch[1]), page: { hasMoreBefore: true } });
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
    const uploadMatch = path.match(/^\/api\/workspaces\/ws-test\/agent\/runs\/(run-[12])\/uploads$/);
    if (uploadMatch && method === "POST") {
      const multipart = request.postData() || "";
      const name = multipart.match(/filename="([^"]+)"/)?.[1] || "upload.txt";
      harness.uploadNames.push(name);
      return json(route, { name, path: `artifacts/upload/${name}` }, 201);
    }
    if (/\/agent\/runs\/run-[12]\/stop$/.test(path) && method === "POST") return json(route, {});
    return json(route, { error: `Unhandled mock request: ${method} ${path}` }, 500);
  });
  return harness;
}

interface ShellHarness {
  uiStateBodies: Array<{ workspaceId: string; body: Record<string, unknown> }>;
  failNextUIStateSave(): void;
}

async function installShellMockApi(page: Page): Promise<ShellHarness> {
  let failNextSave = false;
  const uiStateBodies: ShellHarness["uiStateBodies"] = [];
  const uiStates: Record<string, Record<string, unknown>> = {
    "ws-a": { version: 1, expandedProjects: ["project1"], lastResourceId: "project1.task1", projectOrder: [], taskOrder: {}, sessionOrder: [] },
    "ws-b": { version: 1, expandedProjects: ["project2"], lastResourceId: "project2.task1", projectOrder: [], taskOrder: {}, sessionOrder: [] },
  };
  const trees = {
    "ws-a": { root: "/tmp/ws-a", projects: [project], sessions: [], wiki: { exists: false, entries: [] } },
    "ws-b": {
      root: "/tmp/ws-b",
      projects: [{ id: "project2", type: "project", title: "Second workspace project", path: "project2", archived: false, children: [{ id: "project2.task1", type: "task", title: "Second workspace task", path: "project2/task1", archived: false }] }],
      sessions: [], wiki: { exists: false, entries: [] },
    },
  };
  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    const method = request.method();
    if (path === "/api/workspaces") {
      return json(route, { version: 3, activeId: "ws-a", workspaces: [{ id: "ws-a", name: "Workspace A", path: "/tmp/ws-a" }, { id: "ws-b", name: "Workspace B", path: "/tmp/ws-b" }], agentProfiles: [] });
    }
    if (path === "/api/settings/agenthub") {
      return json(route, { config: { agentProfiles: [] }, connected: false, compatible: false, catalog: { providers: [], agents: [], probes: [] } });
    }
    const uiStateMatch = path.match(/^\/api\/workspaces\/(ws-[ab])\/ui-state$/);
    if (uiStateMatch) {
      const workspaceId = uiStateMatch[1];
      if (method === "PUT") {
        const body = request.postDataJSON() as Record<string, unknown>;
        uiStateBodies.push({ workspaceId, body });
        if (failNextSave) {
          failNextSave = false;
          return json(route, { error: "ui state save failed" }, 500);
        }
        uiStates[workspaceId] = body;
        return json(route, body);
      }
      return json(route, uiStates[workspaceId]);
    }
    const treeMatch = path.match(/^\/api\/workspaces\/(ws-[ab])\/tree$/);
    if (treeMatch) return json(route, trees[treeMatch[1] as keyof typeof trees]);
    const detailMatch = path.match(/^\/api\/workspaces\/(ws-[ab])\/resources\/(.+)$/);
    if (detailMatch) {
      const id = decodeURIComponent(detailMatch[2]);
      const all = Object.values(trees).flatMap((tree) => tree.projects.flatMap((item) => [item, ...(item.children || [])]));
      const resource = all.find((item) => item.id === id);
      if (!resource) return json(route, { error: "not found" }, 404);
      return json(route, {
        ...resource,
        files: [{ name: resource.type === "project" ? "project.md" : "task.md", path: `${resource.path}/${resource.type === "project" ? "project.md" : "task.md"}`, content: `# ${resource.title}`, contentHash: `${id}-v1` }],
        logs: [], logPage: { hasMore: false }, artifacts: [], repos: [], templates: [],
      });
    }
    if (/^\/api\/workspaces\/ws-[ab]\/files$/.test(path)) return json(route, { path: "AGENTS.md", name: "AGENTS.md", content: "Workspace guidance", contentHash: "agents-v1" });
    if (/^\/api\/workspaces\/ws-[ab]\/agent\/runs$/.test(path)) return json(route, { runs: [] });
    return json(route, { error: `Unhandled shell request: ${method} ${path}` }, 500);
  });
  return { uiStateBodies, failNextUIStateSave: () => { failNextSave = true; } };
}

test("navigates resources and creates a task through the canonical application flow", async ({ page }) => {
  const harness = await installMockApi(page, "project1");
  await page.goto("/w/ws-test/r/project1");

  await expect(page.locator(".brand-copy span")).toHaveText("v0.1.0");
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

test("keeps Svelte Detail documents, logs, previews, diffs, and edits stable during refresh", async ({ page }) => {
  const harness = await installMockApi(page, "project1.task1");
  await page.goto("/w/ws-test/r/project1.task1");
  const panel = page.locator("#detailsPanel");
  await expect(panel).toHaveAttribute("data-component-owner", "detail-panel");
  await expect(panel.getByRole("tab", { name: "Task" })).toHaveAttribute("aria-selected", "true");
  const documentView = panel.locator('[data-doc-file="task.md"] .markdown-view');
  await documentView.evaluate((node) => {
    node.setAttribute("data-identity-probe", "stable-document");
    const text = node.querySelector("p")?.firstChild;
    if (text) {
      const range = document.createRange();
      range.setStart(text, 0);
      range.setEnd(text, Math.min(8, text.textContent?.length || 0));
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
    const panel = document.getElementById("detailsPanel");
    if (panel) panel.scrollTop = 180;
  });
  await page.waitForTimeout(5_200);
  await expect(documentView).toHaveAttribute("data-identity-probe", "stable-document");
  await expect.poll(() => page.evaluate(() => window.getSelection()?.toString())).toBe("Baseline");
  await expect.poll(() => panel.evaluate((node) => node.scrollTop)).toBe(180);

  await panel.getByRole("tab", { name: /Logs/ }).click();
  const firstLog = panel.locator('[data-log-id="project1.task1-log-1"]');
  await firstLog.evaluate((node) => { (node as HTMLDetailsElement).open = true; node.setAttribute("data-identity-probe", "stable-log"); });
  await panel.getByRole("button", { name: "Load More" }).click();
  await expect(panel.locator("[data-log-id]")).toHaveCount(2);
  await expect(firstLog).toHaveAttribute("open", "");
  await expect(firstLog).toHaveAttribute("data-identity-probe", "stable-log");
  await expect(documentView).toHaveAttribute("data-identity-probe", "stable-document");

  await panel.getByRole("tab", { name: "Artifacts" }).click();
  await panel.getByRole("button", { name: /notes\.md/ }).click();
  const preview = page.getByRole("dialog", { name: "File preview" });
  await expect(preview).toContainText("Content for project1-migration/task1-infrastructure/artifacts/notes.md");
  await preview.locator("[data-preview-scroll]").evaluate((node) => { node.setAttribute("data-identity-probe", "stable-preview"); node.scrollTop = 40; });
  await page.waitForTimeout(5_200);
  await expect(preview.locator("[data-preview-scroll]")).toHaveAttribute("data-identity-probe", "stable-preview");
  await expect.poll(() => preview.locator("[data-preview-scroll]").evaluate((node) => node.scrollTop)).toBe(40);
  await preview.getByRole("button", { name: "Close" }).click();

  await panel.getByRole("tab", { name: "Worktrees" }).click();
  await panel.getByRole("button", { name: "View Diff" }).click();
  await expect(page.getByRole("dialog", { name: "Worktree diff" })).toContainText("detail diff");
  await page.getByRole("dialog", { name: "Worktree diff" }).getByRole("button", { name: "Close" }).click();

  await panel.locator(".breadcrumb").getByRole("button", { name: "Isolated E2E", exact: true }).click();
  const editor = panel.locator("#workspaceAgentsContent");
  const editorDraft = Array.from({ length: 30 }, (_, index) => `Unsaved workspace guidance line ${index + 1}`).join("\n");
  await editor.fill(editorDraft);
  await editor.evaluate((node) => { const input = node as HTMLTextAreaElement; input.focus(); input.setSelectionRange(8, 17); input.scrollTop = 9; input.setAttribute("data-identity-probe", "stable-editor"); });
  await page.waitForTimeout(5_200);
  await expect(editor).toHaveValue(editorDraft);
  await expect(editor).toHaveAttribute("data-identity-probe", "stable-editor");
  await expect.poll(() => editor.evaluate((node) => [(node as HTMLTextAreaElement).selectionStart, (node as HTMLTextAreaElement).selectionEnd, (node as HTMLTextAreaElement).scrollTop])).toEqual([8, 17, 9]);
  await panel.getByRole("button", { name: "Save" }).click();
  await expect.poll(() => harness.agentsBodies.length).toBe(1);
  expect(harness.agentsBodies[0]).toMatchObject({ content: editorDraft, expectedContentHash: "agents-v1" });
  await panel.getByRole("button", { name: /index\.md/ }).click();
  await expect(page.getByRole("dialog", { name: "File preview" })).toContainText("Stable wiki content");
});

test("switches sessions, sends input, receives SSE, and preserves active reading state during refresh", async ({ page }) => {
  const harness = await installMockApi(page);
  await page.goto("/w/ws-test/r/project1.task1");

  await expect(page.locator(".agent-current-run strong")).toHaveText("Primary session");
  await expect(page.locator("#ttyLog")).toContainText("SSE update for run-1");
  const historyAnchor = page.locator('[data-timeline-key="message:33"]');
  await expect(historyAnchor).toBeVisible();
  await historyAnchor.evaluate((node) => node.setAttribute("data-history-anchor", "stable"));
  await page.locator("#loadOlderAgentEventsButton, .load-older-events").click();
  await expect(page.locator("#ttyLog")).toContainText("run-1 older history");
  await expect(historyAnchor).toHaveAttribute("data-history-anchor", "stable");
  await expect(page.locator('[data-timeline-key="message:33"]')).toHaveCount(1);
  const input = page.locator("#ttyInput");
  await input.fill("draft for run one");
  await page.locator(".agent-current-run").click();
  await page.locator('[data-agent-run="run-2"]').last().click();
  await expect(page.locator(".agent-current-run strong")).toHaveText("Secondary session");
  await expect(page.locator("#ttyLog")).not.toContainText("run-1 baseline message");
  await expect(page.locator("#ttyLog")).toContainText("run-2 baseline message");
  await expect(input).toHaveValue("");
  await input.fill("draft for run two");
  await page.locator(".agent-current-run").click();
  await page.locator('[data-agent-run="run-1"]').last().click();
  await expect(page.locator(".agent-current-run strong")).toHaveText("Primary session");
  await expect(input).toHaveValue("draft for run one");

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

test("keeps the Svelte template editor stable and ignores an older preview response", async ({ page }) => {
  const harness = await installMockApi(page, "project1");
  await page.goto("/w/ws-test/r/project1");
  await page.getByRole("button", { name: "New Task" }).click();

  const dialog = page.getByRole("dialog", { name: "Create task" });
  await dialog.getByRole("option", { name: /Feature A/ }).click();
  await dialog.getByLabel("Summary *").fill("older");
  await expect.poll(() => harness.previewBodies.filter((body) => body.templateName === "feature-a" && (body.templateFields as Record<string, unknown>)?.summary === "older").length).toBe(1);
  page.once("dialog", (confirmation) => confirmation.accept());
  await dialog.getByRole("option", { name: /Feature B/ }).click();
  await dialog.getByLabel("Summary *").fill("newer");
  await expect.poll(() => harness.previewBodies.filter((body) => body.templateName === "feature-b" && (body.templateFields as Record<string, unknown>)?.summary === "newer").length).toBe(1);

  await expect(dialog.getByRole("heading", { name: "feature-b:newer" })).toBeVisible();
  await page.waitForTimeout(450);
  await expect(dialog.getByRole("heading", { name: "feature-b:newer" })).toBeVisible();
  await dialog.getByLabel("Task markdown").fill("# Locally edited preview\n");
  await dialog.getByLabel("Task markdown").evaluate((node) => { node.dataset.identityProbe = "same-editor"; });
  await page.waitForTimeout(5_200);
  await expect(dialog.getByLabel("Task markdown")).toHaveAttribute("data-identity-probe", "same-editor");
  await expect(dialog.getByLabel("Task markdown")).toHaveValue("# Locally edited preview\n");

  await dialog.getByRole("button", { name: "Create", exact: true }).click();
  await expect.poll(() => harness.taskBodies.length).toBe(1);
  expect(harness.previewBodies.map((body) => body.templateName)).toEqual(expect.arrayContaining(["feature-a", "feature-b"]));
  expect(harness.taskBodies[0]).toMatchObject({ title: "feature-b:newer", taskMarkdown: "# Locally edited preview\n" });
});

test("preserves composer draft through upload and supports Settings and Self-Driving dialogs", async ({ page }) => {
  const harness = await installMockApi(page);
  await page.goto("/w/ws-test/r/project1.task1");

  const input = page.locator("#ttyInput");
  await input.fill("Keep this draft");
  await input.evaluate((node) => { node.dataset.identityProbe = "same-composer"; });
  await page.waitForTimeout(5_200);
  await expect(input).toHaveAttribute("data-identity-probe", "same-composer");
  await expect(input).toHaveValue("Keep this draft");

  await page.getByRole("button", { name: "Upload files" }).click();
  await page.locator("#agentUploadInput").setInputFiles({ name: "notes.txt", mimeType: "text/plain", buffer: Buffer.from("isolated upload") });
  await expect(page.getByText("artifacts/upload/notes.txt")).toBeVisible();
  await page.getByRole("dialog", { name: "Upload files" }).getByRole("button", { name: "Done" }).click();
  await expect(input).toHaveValue("Keep this draft\nartifacts/upload/notes.txt");
  expect(harness.uploadNames).toEqual(["notes.txt"]);

  await page.getByRole("button", { name: "Settings" }).click();
  const settings = page.getByRole("dialog", { name: "System Settings" });
  await settings.getByRole("button", { name: "User" }).click();
  await settings.getByLabel("Name").fill("Migration User");
  await settings.getByRole("button", { name: "Save" }).click();
  await settings.getByRole("button", { name: "AgentHub" }).click();
  await settings.getByLabel("Endpoint").fill("http://127.0.0.1:5656");
  await settings.getByRole("button", { name: "Profiles" }).click();
  await settings.getByRole("button", { name: "AgentHub" }).click();
  await expect(settings.getByLabel("Endpoint")).toHaveValue("http://127.0.0.1:5656");
  await settings.getByRole("button", { name: "Save All" }).click();
  await expect.poll(() => harness.settingsBodies.length).toBe(1);
  expect(harness.settingsBodies[0]).toMatchObject({ endpoint: "http://127.0.0.1:5656" });
  await expect(settings.locator(".settings-save-hint")).toBeHidden();
  await settings.getByRole("button", { name: "Close" }).click();

  await page.locator("#selfDrivingSwitch").click();
  const selfDriving = page.getByRole("dialog", { name: "Configure Self-Driving" });
  await selfDriving.getByLabel("Run instructions (optional)").fill("Continue until verified");
  await selfDriving.getByRole("button", { name: "Save and Enable" }).click();
  await expect.poll(() => harness.selfDrivingBodies.length).toBe(1);
  expect(harness.selfDrivingBodies[0]).toMatchObject({ resourceId: "project1.task1", enabled: true, agentName: "test-agent", prompt: "Continue until verified" });
  await expect(input).toHaveValue("Keep this draft\nartifacts/upload/notes.txt");
});

test("keeps canonical navigation synchronized across history, workspace restore, and reorder rollback", async ({ page }) => {
  const harness = await installShellMockApi(page);
  await page.goto("/w/ws-a/r/project1.task1");
  const app = page.locator("#app");
  const detailPanel = page.locator("#detailsPanel");
  await expect(app).toHaveAttribute("data-component-owner", "app-shell");
  await expect(detailPanel).toHaveAttribute("data-component-owner", "detail-panel");
  await detailPanel.evaluate((node) => { node.dataset.identityProbe = "persistent-detail"; });

  await page.getByRole("button", { name: /Follow-up task/ }).click();
  await expect(page).toHaveURL(/\/w\/ws-a\/r\/project1\.task2$/);
  await expect(page.locator('#projectTree .tree-item.active')).toContainText("Follow-up task");
  await page.goBack();
  await expect(page).toHaveURL(/\/w\/ws-a\/r\/project1\.task1$/);
  await expect(page.locator('#projectTree .tree-item.active')).toContainText("Infrastructure task");
  await page.goForward();
  await expect(page).toHaveURL(/\/w\/ws-a\/r\/project1\.task2$/);
  await expect(detailPanel).toHaveAttribute("data-identity-probe", "persistent-detail");

  await page.locator("#workspaceSwitcher").click();
  await page.getByRole("option", { name: /Workspace B/ }).click();
  await expect(page).toHaveURL(/\/w\/ws-b\/r\/project2\.task1$/);
  await expect(page.getByRole("heading", { name: "Second workspace task", exact: true })).toBeVisible();
  await page.locator("#workspaceSwitcher").click();
  await page.getByRole("option", { name: /Workspace A/ }).click();
  await expect(page).toHaveURL(/\/w\/ws-a\/r\/project1\.task2$/);
  await expect(page.locator('#projectTree .tree-item.active')).toContainText("Follow-up task");

  const tasks = page.locator("#projectTree .task-group .tree-item");
  await expect(tasks).toHaveCount(2);
  const before = await tasks.locator(".name-text").allTextContents();
  harness.failNextUIStateSave();
  await page.evaluate(() => {
    const rows = [...document.querySelectorAll<HTMLElement>("#projectTree .task-group .tree-item")];
    const handle = rows[0]?.querySelector<HTMLElement>(".drag-handle");
    if (!handle || !rows[1]) throw new Error("task drag targets missing");
    const transfer = new DataTransfer();
    handle.dispatchEvent(new DragEvent("dragstart", { bubbles: true, cancelable: true, dataTransfer: transfer }));
    const rect = rows[1].getBoundingClientRect();
    rows[1].dispatchEvent(new DragEvent("dragover", { bubbles: true, cancelable: true, dataTransfer: transfer, clientY: rect.bottom - 1 }));
    rows[1].dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: transfer, clientY: rect.bottom - 1 }));
  });
  await expect(page.locator("#toast")).toContainText("ui state save failed");
  await expect.poll(() => tasks.locator(".name-text").allTextContents()).toEqual(before);
  expect(harness.uiStateBodies.some((entry) => entry.workspaceId === "ws-a" && Object.keys((entry.body.taskOrder as Record<string, unknown>) || {}).length > 0)).toBe(true);
});

test("keeps mobile navigation, view selection, and immersive preference in the Svelte app shell", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await installShellMockApi(page);
  await page.goto("/w/ws-a/r/project1.task1");

  await page.locator("#mobileMenuButton").click();
  await expect(page.locator("body")).toHaveClass(/mobile-sidebar-open/);
  await page.locator("#mobileSidebarBackdrop").click({ position: { x: 380, y: 400 } });
  await expect(page.locator("body")).not.toHaveClass(/mobile-sidebar-open/);
  await page.locator("#mobileChatButton").click();
  await expect(page.locator("body")).toHaveClass(/mobile-chat-active/);
  await expect(page.locator("#agentPanel")).toBeVisible();
  await page.locator("#mobileImmersiveButton").click();
  await expect(page.locator("body")).toHaveClass(/chat-immersive/);
  await expect(page.locator("#mobileImmersiveButton")).toHaveAttribute("aria-pressed", "true");

  await page.reload();
  await expect(page.locator("body")).toHaveClass(/chat-immersive/);
  await expect(page.locator("#mobileImmersiveButton")).toHaveAttribute("aria-pressed", "true");
  await page.locator("#mobileDetailsButton").click();
  await expect(page.locator("body")).not.toHaveClass(/mobile-chat-active/);
  await expect(page.locator("#detailsPanel")).toBeVisible();
});
