import { mount, unmount } from "svelte";
import { afterEach, describe, expect, it } from "vitest";

import LifecycleProbe from "../fixtures/LifecycleProbe.svelte";
import { mountedComponentCount, replaceComponent, unmountAllComponents, unmountComponent } from "../../src/components/component-registry";

afterEach(async () => {
  await unmountAllComponents();
  document.body.replaceChildren();
});

describe("Svelte component lifecycle", () => {
  it("replaces fallback content, remounts once, and releases its DOM", async () => {
    const target = document.createElement("span");
    target.textContent = "static fallback";
    document.body.append(target);
    let cleanupCount = 0;

    const mountVersion = async (version: string) => replaceComponent("brand", target, (componentTarget) => {
      const component = mount(LifecycleProbe, { target: componentTarget, props: { value: version } });
      return async () => {
        cleanupCount += 1;
        await unmount(component);
      };
    });

    await mountVersion("v1");
    expect(target.textContent).toBe("v1");
    expect(target.querySelectorAll("[data-component-owner]")).toHaveLength(1);
    await mountVersion("v2");
    expect(cleanupCount).toBe(1);
    expect(target.textContent).toBe("v2");
    expect(target.querySelectorAll("[data-component-owner]")).toHaveLength(1);
    expect(mountedComponentCount()).toBe(1);

    await unmountComponent("brand");
    expect(cleanupCount).toBe(2);
    expect(target.childElementCount).toBe(0);
    expect(mountedComponentCount()).toBe(0);
  });
});
