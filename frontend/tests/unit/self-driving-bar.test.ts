import { mount, unmount } from "svelte";
import { afterEach, describe, expect, it, vi } from "vitest";

import SelfDrivingBar from "../../src/components/SelfDrivingBar.svelte";
import { createModelChannel } from "../../src/components/model-channel";
import type { SelfDrivingBarModel } from "../../src/components/models";

const mounted: Array<Record<string, unknown>> = [];
afterEach(async () => {
  while (mounted.length) await unmount(mounted.pop()!);
  document.body.replaceChildren();
});

function model(overrides: Partial<SelfDrivingBarModel> = {}): SelfDrivingBarModel {
  return {
    identity: "task:1", visible: true, status: { key: "ready", label: "Ready", icon: "list-start" }, summary: "Revision 1",
    expanded: false, hasProjection: true, revision: 1, enabled: true, preferredProfiles: [], actualAgent: "", actualReason: "",
    waitingSummary: "", wakeCondition: "", wakeFallback: false, lastOutcome: null, statusReason: null, pending: false,
    onToggleEnabled: vi.fn(), onToggleDetails: vi.fn(), onIconsChanged: vi.fn(), ...overrides,
  };
}

describe("SelfDrivingBar", () => {
  it("keeps desired-state control available independently from session state", async () => {
    const current = model();
    const channel = createModelChannel(current);
    const target = document.createElement("div");
    document.body.append(target);
    mounted.push(mount(SelfDrivingBar, { target, props: { channel } }));

    const toggle = target.querySelector<HTMLButtonElement>("#selfDrivingSwitch")!;
    expect(toggle.disabled).toBe(false);
    expect(toggle.getAttribute("aria-checked")).toBe("true");
    toggle.click();
    expect(current.onToggleEnabled).toHaveBeenCalledOnce();

    channel.publish(model({ pending: true }));
    await Promise.resolve();
    expect(target.querySelector<HTMLButtonElement>("#selfDrivingSwitch")!.disabled).toBe(true);
  });
});
