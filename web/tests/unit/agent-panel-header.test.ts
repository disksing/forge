import { mount, tick, unmount } from "svelte";
import { afterEach, describe, expect, it, vi } from "vitest";

import AgentPanelHeader from "../../src/components/AgentPanelHeader.svelte";
import { createModelChannel } from "../../src/components/model-channel";
import type { AgentPanelHeaderModel, ResourceMessageStatus } from "../../src/models/chat";

const cleanups: Array<() => Promise<void>> = [];
afterEach(async () => {
  while (cleanups.length) await cleanups.pop()?.();
  document.body.replaceChildren();
  vi.useRealTimers();
});

function status(overrides: Partial<ResourceMessageStatus> = {}): ResourceMessageStatus {
  return {
    resourceId: "task-a",
    state: "working",
    canSteerWaiting: false,
    waitingMessages: [],
    generation: { generation: 1, generationId: "gen-1", status: "active", turnNumber: 3 },
    session: { state: "running", currentTurnId: "turn-3" },
    ...overrides,
  };
}

function model(overrides: Partial<AgentPanelHeaderModel> = {}): AgentPanelHeaderModel {
  return {
    identity: "workspace-a:task-a",
    workspaceId: "workspace-a",
    resourceId: "task-a",
    status: status(),
    agentName: "kimi-k3",
    modelSummary: "Kimi · kimi-k2-0905",
    turnNumber: 3,
    turnStartedAt: new Date(Date.now() - 134_000).toISOString(),
    onIconsChanged: vi.fn(),
    ...overrides,
  };
}

function mountModel(value: AgentPanelHeaderModel) {
  const channel = createModelChannel(value);
  const target = document.body.appendChild(document.createElement("div"));
  const component = mount(AgentPanelHeader, { target, props: { channel } });
  cleanups.push(() => unmount(component));
  return { channel, target };
}

describe("AgentPanelHeader", () => {
  it("renders agent name, state, model summary and live turn timer while working", async () => {
    vi.useFakeTimers();
    const { target } = mountModel(model());
    await tick();

    const header = target.querySelector<HTMLElement>(".agent-panel-header")!;
    expect(header.dataset.state).toBe("working");
    expect(target.querySelector(".agent-header-name")?.textContent).toBe("kimi-k3");
    expect(target.querySelector(".agent-header-state")?.textContent).toBe("Working");
    expect(target.querySelector(".agent-header-model")?.textContent).toBe("Kimi · kimi-k2-0905");
    expect(target.querySelector(".agent-header-turn")?.textContent).toBe("Turn 3 · 02:14");

    await vi.advanceTimersByTimeAsync(1000);
    expect(target.querySelector(".agent-header-turn")?.textContent).toBe("Turn 3 · 02:15");
  });

  it("switches to the completed-turn label when idle", async () => {
    const { target } = mountModel(model({ status: status({ state: "idle", session: { state: "idle" } }) }));
    await tick();

    const header = target.querySelector<HTMLElement>(".agent-panel-header")!;
    expect(header.dataset.state).toBe("idle");
    expect(target.querySelector(".agent-header-state")?.textContent).toBe("Idle");
    expect(target.querySelector(".agent-header-turn")?.textContent).toBe("Idle · Turn 3 completed");
  });

  it("shows the attention state and the queued count", async () => {
    const { target } = mountModel(model({
      status: status({
        state: "attention_required",
        waitingMessages: [{ messageId: "m1", text: "hi", status: "waiting", acceptedAt: "", requestedMode: "enqueue", actualMode: "enqueue" }],
      }),
    }));
    await tick();

    const header = target.querySelector<HTMLElement>(".agent-panel-header")!;
    expect(header.dataset.state).toBe("attention_required");
    expect(target.querySelector(".agent-header-state")?.textContent).toBe("Attention required");
    expect(target.querySelector(".agent-header-queued")?.textContent).toBe("· 1 queued");
  });

  it("renders an empty-state header when no resource is selected", async () => {
    const { target } = mountModel(model({ resourceId: "", status: null, turnNumber: 0, turnStartedAt: "", modelSummary: "" }));
    await tick();

    const header = target.querySelector<HTMLElement>(".agent-panel-header")!;
    expect(header.dataset.state).toBe("empty");
    expect(target.querySelector(".agent-header-state")?.textContent).toBe("No resource selected");
    expect(target.querySelector(".agent-header-turn")).toBeNull();
  });

  it("formats elapsed turns longer than one hour as h:mm:ss", async () => {
    const { target } = mountModel(model({ turnStartedAt: new Date(Date.now() - 3_725_000).toISOString() }));
    await tick();

    expect(target.querySelector(".agent-header-turn")?.textContent).toBe("Turn 3 · 1:02:05");
  });
});
