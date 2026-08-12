import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "../..");
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

describe("application composition", () => {
  it("uses one Svelte application root and one lifecycle", () => {
    const html = read("static/index.html");
    const entry = read("src/entry.ts");
    expect(html.match(/id="app"/g)).toHaveLength(1);
    expect(html).not.toMatch(/id="(?:toast|settings|create-dialog|detail-panel)-root"/);
    expect(entry).toContain("mount(ForgeApp");
    expect(entry.match(/\bmount\(/g)).toHaveLength(1);
    expect(entry).not.toContain("component-registry");
  });

  it("composes every published channel under ForgeApp", () => {
    const source = read("src/ForgeApp.svelte");
    for (const component of ["AppShell", "DetailPanel", "SessionSwitcher", "EventTimeline", "ChatComposer", "Toast", "UploadDialog", "CreateDialog", "SettingsModal"]) {
      expect(source).toContain(`<${component}`);
    }
  });
});
