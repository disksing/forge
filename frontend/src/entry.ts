import { mount, unmount } from "svelte";

import BrandVersion from "./islands/BrandVersion.svelte";
import { replaceIsland, unmountAllIslands, unmountIsland } from "./islands/lifecycle";

const BRAND_VERSION_ISLAND = "brand-version";

async function mountBrandVersion(): Promise<void> {
  const target = document.getElementById("brandVersionIsland");
  if (!target) return;
  const fallback = target.dataset.version || "v0.1.0";
  try {
    await replaceIsland(BRAND_VERSION_ISLAND, target, (islandTarget) => {
      const component = mount(BrandVersion, {
        target: islandTarget,
        props: { version: fallback },
      });
      return () => unmount(component);
    });
  } catch (error) {
    target.textContent = fallback;
    throw error;
  }
}

const bridge = {
  mountBrandVersion,
  unmount: unmountIsland,
  unmountAll: unmountAllIslands,
};

declare global {
  interface Window {
    ForgeSvelteIslands?: typeof bridge;
    ForgeSveltePageLifecycleInstalled?: boolean;
  }
}

const previousBridge = window.ForgeSvelteIslands;
window.ForgeSvelteIslands = bridge;
if (!window.ForgeSveltePageLifecycleInstalled) {
  window.ForgeSveltePageLifecycleInstalled = true;
  window.addEventListener("pagehide", () => {
    void window.ForgeSvelteIslands?.unmountAll();
  });
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) void window.ForgeSvelteIslands?.mountBrandVersion();
  });
}

void (async () => {
  await previousBridge?.unmountAll();
  await mountBrandVersion();
})().catch((error) => console.error("Failed to mount the Forge Svelte island", error));
