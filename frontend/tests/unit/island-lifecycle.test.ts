import { mount, unmount } from "svelte";
import { afterEach, describe, expect, it } from "vitest";

import BrandVersion from "../../src/islands/BrandVersion.svelte";
import { mountedIslandCount, replaceIsland, unmountAllIslands, unmountIsland } from "../../src/islands/lifecycle";

afterEach(async () => {
  await unmountAllIslands();
  document.body.replaceChildren();
});

describe("Svelte island lifecycle", () => {
  it("replaces fallback content, remounts once, and releases its DOM", async () => {
    const target = document.createElement("span");
    target.textContent = "legacy fallback";
    document.body.append(target);
    let cleanupCount = 0;

    const mountVersion = async (version: string) => replaceIsland("brand", target, (islandTarget) => {
      const component = mount(BrandVersion, { target: islandTarget, props: { version } });
      return async () => {
        cleanupCount += 1;
        await unmount(component);
      };
    });

    await mountVersion("v1");
    expect(target.textContent).toBe("v1");
    expect(target.querySelectorAll("[data-svelte-owned]")).toHaveLength(1);
    await mountVersion("v2");
    expect(cleanupCount).toBe(1);
    expect(target.textContent).toBe("v2");
    expect(target.querySelectorAll("[data-svelte-owned]")).toHaveLength(1);
    expect(mountedIslandCount()).toBe(1);

    await unmountIsland("brand");
    expect(cleanupCount).toBe(2);
    expect(target.childElementCount).toBe(0);
    expect(mountedIslandCount()).toBe(0);
  });
});
