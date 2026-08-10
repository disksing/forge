import { mount, tick, unmount } from "svelte";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createIslandChannel } from "../../src/islands/channel";
import type { SessionSwitcherModel } from "../../src/islands/models";
import SessionSwitcher from "../../src/islands/SessionSwitcher.svelte";

const cleanups: Array<() => Promise<void>> = [];
afterEach(async () => {
  while (cleanups.length) await cleanups.pop()?.();
  document.body.replaceChildren();
});

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((done, fail) => { resolve = done; reject = fail; });
  return { promise, resolve, reject };
}

function model(onSelect: SessionSwitcherModel["onSelect"]): SessionSwitcherModel {
  return {
    identity: "workspace-a:task-a", workspaceId: "workspace-a", resourceId: "task-a", activeRunId: "run-a",
    runs: [{ id: "run-a", title: "Run A", status: "idle" }, { id: "run-b", title: "Run B", status: "idle" }],
    switchingRunId: "", onSelect, onToast: vi.fn(), onIconsChanged: vi.fn(),
  };
}

describe("SessionSwitcher", () => {
  it("deduplicates a pending selection and exposes failure without changing the projected session", async () => {
    const pending = deferred<void>();
    const onSelect = vi.fn(() => pending.promise);
    const channel = createIslandChannel(model(onSelect));
    const target = document.body.appendChild(document.createElement("div"));
    const component = mount(SessionSwitcher, { target, props: { channel } });
    cleanups.push(() => unmount(component));
    await tick();

    target.querySelector<HTMLButtonElement>(".agent-current-run")!.click();
    await tick();
    const runB = target.querySelector<HTMLButtonElement>('[data-agent-run="run-b"]')!;
    runB.click();
    runB.click();
    expect(onSelect).toHaveBeenCalledTimes(1);
    pending.reject(new Error("close failed"));
    await vi.waitFor(() => expect(target.querySelector("[role=alert]")?.textContent).toContain("close failed"));
    expect(target.querySelector(".agent-current-run strong")?.textContent).toBe("Run A");
  });
});
