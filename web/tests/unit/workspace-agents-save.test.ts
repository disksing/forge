import { mount, tick, unmount } from "svelte";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createForgeAppChannels } from "../../src/app-channels";
import DetailPanel from "../../src/components/DetailPanel.svelte";

const mounted: Array<ReturnType<typeof mount>> = [];

const managedBlock = [
  "<!-- managed by forge cli -->",
  "Generated guidance.",
  "<!-- end of forge cli prompt -->",
].join("\n");

function json(value: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Conflict",
    json: async () => value,
  } as Response;
}

describe("Workspace AGENTS save flow", () => {
  let stopForgeApp: (() => void) | null = null;

  afterEach(async () => {
    while (mounted.length) await unmount(mounted.pop()!);
    stopForgeApp?.();
    stopForgeApp = null;
    document.body.replaceChildren();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("immediately echoes added, updated, and cleared user content while hiding the managed block", async () => {
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

    let userContent = "";
    let hashVersion = 0;
    const saveBodies: Array<{ content: string; expectedContentHash: string }> = [];
    const fullAgentsContent = () => userContent ? `${userContent}\n\n${managedBlock}\n` : `${managedBlock}\n`;
    const contentHash = () => `agents-v${hashVersion}`;
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = new URL(String(input), window.location.origin);
      const method = init?.method || "GET";
      if (url.pathname === "/api/workspaces" && method === "GET") {
        return json({ activeId: "ws-test", workspaces: [{ id: "ws-test", name: "Test workspace", path: "/tmp/ws-test" }], agents: [], agentProfiles: [] });
      }
      if (url.pathname === "/api/settings/agenthub" && method === "GET") {
        return json({ connected: false, compatible: false, catalog: { providers: [], agents: [] }, config: { agentProfiles: [] } });
      }
      if (url.pathname === "/api/workspaces/ws-test/ui-state" && method === "GET") return json({});
      if (url.pathname === "/api/workspaces/ws-test/ui-state" && method === "PUT") return json({});
      if (url.pathname === "/api/workspaces/ws-test/tree" && method === "GET") {
        return json({ agentBinding: { kind: "profile", name: "default" }, projects: [], attentionList: [], wiki: { exists: false } });
      }
      if (url.pathname === "/api/workspaces/ws-test/files" && url.searchParams.get("path") === "AGENTS.md") {
        if (method === "PUT") {
          const body = JSON.parse(String(init?.body || "{}")) as { content?: string; expectedContentHash?: string };
          saveBodies.push({ content: String(body.content || ""), expectedContentHash: String(body.expectedContentHash || "") });
          if (body.expectedContentHash !== contentHash()) return json({ error: "stale AGENTS.md" }, 409);
          userContent = String(body.content || "");
          hashVersion++;
        }
        return json({ path: "AGENTS.md", name: "AGENTS.md", content: fullAgentsContent(), contentHash: contentHash() });
      }
      if (url.pathname === "/api/workspaces/ws-test/resources/workspace/status" && method === "GET") {
        return json({ acceptsMessages: true, waitingMessages: [], canSteerWaiting: false, session: { state: "idle" } });
      }
      throw new Error(`Unexpected ${method} ${url.pathname}${url.search}`);
    }));

    const channels = createForgeAppChannels();
    const publisher = {
      renderAppShell: vi.fn(),
      renderCreateDialog: vi.fn(),
      renderSettings: vi.fn(),
      renderUploadDialog: vi.fn(),
      renderComposer: vi.fn(),
      renderEventTimeline: vi.fn(),
      renderAgentPanelHeader: vi.fn(),
      renderDetailPanel: channels.detail.publish,
      renderToast: vi.fn(),
    };
    const controller = await import("../../src/app-controller");
    stopForgeApp = controller.stopForgeApp;
    controller.startForgeApp(publisher);

    await vi.waitFor(() => expect(channels.detail.current().workspaceAgents?.content).toContain("managed by forge cli"));
    const target = document.createElement("section");
    target.id = "detailsPanel";
    document.body.append(target);
    mounted.push(mount(DetailPanel, { target, props: { channel: channels.detail } }));
    await tick();

    const editor = () => target.querySelector<HTMLTextAreaElement>("#workspaceAgentsContent")!;
    const save = async (content: string): Promise<void> => {
      const expectedSaveCount = saveBodies.length + 1;
      editor().focus();
      editor().value = content;
      editor().dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: content }));
      await tick();
      await tick();
      const button = target.querySelector<HTMLButtonElement>("#workspaceAgentsForm button[type=submit]")!;
      expect(button.disabled).toBe(false);
      button.click();
      await vi.waitFor(() => expect(saveBodies).toHaveLength(expectedSaveCount));
      await vi.waitFor(() => expect(channels.detail.current().workspaceAgents?.contentHash).toBe(`agents-v${expectedSaveCount}`));
      await tick();
      expect(editor().value).toBe(content);
      expect(target.querySelector<HTMLButtonElement>("#workspaceAgentsForm button[type=submit]")?.disabled).toBe(true);
      expect(editor().value).not.toContain("managed by forge cli");
    };

    expect(editor().value).toBe("");
    await save("new user guidance");
    await save("updated user guidance");
    await save("");

    expect(saveBodies).toEqual([
      { content: "new user guidance", expectedContentHash: "agents-v0" },
      { content: "updated user guidance", expectedContentHash: "agents-v1" },
      { content: "", expectedContentHash: "agents-v2" },
    ]);
    expect(channels.detail.current().workspaceAgents?.content).toBe(`${managedBlock}\n`);
    expect(channels.detail.current().workspaceAgents?.contentHash).toBe("agents-v3");
  });
});
