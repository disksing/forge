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
  const harness: Harness = { inputBodies: [], taskBodies: [], previewBodies: [], settingsBodies: [], selfDrivingBodies: [], uploadNames: [], streamRequests: [], treeRequests: 0, agentsBodies: [] };
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

test("keeps Svelte Detail documents, logs, previews, diffs, and edits stable during refresh", async ({ page }) => {
  const harness = await installMockApi(page, "project1.task1");
  await page.goto("/w/ws-test/r/project1.task1");
  const panel = page.locator("#detailsPanel");
  await expect(panel).toHaveAttribute("data-svelte-owned", "detail-panel");
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

test("keeps the Svelte template editor stable and ignores an older preview response", async ({ page }) => {
  const harness = await installMockApi(page, "project1");
  await page.goto("/w/ws-test/r/project1");
  await page.getByRole("button", { name: "New Task" }).click();

  const dialog = page.getByRole("dialog", { name: "Create task" });
  await dialog.getByLabel("Template").selectOption("feature-a");
  await dialog.getByLabel("Summary *").fill("older");
  await dialog.getByRole("tab", { name: "Preview" }).click();
  await expect.poll(() => harness.previewBodies.length).toBe(1);
  page.once("dialog", (confirmation) => confirmation.accept());
  await dialog.getByLabel("Template").selectOption("feature-b");
  await dialog.getByLabel("Summary *").fill("newer");
  await dialog.getByRole("tab", { name: "Preview" }).click();
  await expect.poll(() => harness.previewBodies.length).toBe(2);

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
  await settings.getByRole("button", { name: "Close" }).click();

  await page.locator("#selfDrivingSwitch").click();
  const selfDriving = page.getByRole("dialog", { name: "Configure Self-Driving" });
  await selfDriving.getByLabel("Run instructions (optional)").fill("Continue until verified");
  await selfDriving.getByRole("button", { name: "Save and Enable" }).click();
  await expect.poll(() => harness.selfDrivingBodies.length).toBe(1);
  expect(harness.selfDrivingBodies[0]).toMatchObject({ resourceId: "project1.task1", enabled: true, agentName: "test-agent", prompt: "Continue until verified" });
  await expect(input).toHaveValue("Keep this draft\nartifacts/upload/notes.txt");
});
