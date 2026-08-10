import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "../..");
const components = [
  "AppShell",
  "ChatComposer",
  "CreateDialog",
  "DetailPanel",
  "DiffModal",
  "EventTimeline",
  "FileBrowser",
  "FilePreviewModal",
  "LogTimeline",
  "MarkdownDocument",
  "SelfDrivingBar",
  "SelfDrivingDialog",
  "SessionSwitcher",
  "SettingsModal",
  "Toast",
  "UploadDialog",
  "WorkspaceAgentsEditor",
] as const;

const owners: Record<(typeof components)[number], string> = {
  AppShell: "app-shell",
  ChatComposer: "chat-composer",
  CreateDialog: "create-dialog",
  DetailPanel: "detail-panel",
  DiffModal: "diff-modal",
  EventTimeline: "event-timeline",
  FileBrowser: "file-browser",
  FilePreviewModal: "file-preview-modal",
  LogTimeline: "log-timeline",
  MarkdownDocument: "markdown-document",
  SelfDrivingBar: "self-driving-bar",
  SelfDrivingDialog: "self-driving-dialog",
  SessionSwitcher: "session-switcher",
  SettingsModal: "settings",
  Toast: "toast",
  UploadDialog: "upload-dialog",
  WorkspaceAgentsEditor: "workspace-agents-editor",
};

function read(relativePath: string): string {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function selectorHeaders(css: string): string[] {
  const source = css.replaceAll(/\/\*[\s\S]*?\*\//g, "");
  const headers: string[] = [];
  const stack: Array<"at" | "keyframes" | "rule" | "keyframe-step"> = [];
  let buffer = "";
  for (const character of source) {
    if (character === "{") {
      const header = buffer.trim().replaceAll(/\s+/g, " ");
      buffer = "";
      if (header.startsWith("@")) stack.push(header.includes("keyframes") ? "keyframes" : "at");
      else if (stack.at(-1) === "keyframes") stack.push("keyframe-step");
      else {
        headers.push(header);
        stack.push("rule");
      }
    } else if (character === "}") {
      stack.pop();
      buffer = "";
    } else if (character === ";") buffer = "";
    else buffer += character;
  }
  return headers.filter(Boolean);
}

describe("CSS ownership", () => {
  it("keeps the global entry limited to documented shared layers", () => {
    expect(read("src/app.css").trim()).toBe([
      "/* Global CSS entry: tokens, browser defaults, and deliberately shared primitives only. */",
      '@import "./styles/tokens.css";',
      '@import "./styles/base.css";',
      '@import "./styles/primitives.css";',
      '@import "./styles/rich-content.css";',
    ].join("\n"));
    expect(selectorHeaders(read("src/styles/base.css"))).not.toEqual(expect.arrayContaining([expect.stringMatching(/\.[a-z]/)]));
  });

  it.each(components)("keeps %s selectors inside its component boundary", (component) => {
    const owner = owners[component];
    const componentSource = read(`src/components/${component}.svelte`);
    const css = read(`src/components/${component}.css`);
    expect(componentSource).toContain(`import "./${component}.css";`);
    for (const header of selectorHeaders(css)) {
      for (const selector of header.split(",")) {
        const normalized = selector.trim();
        const appShellBodyState = component === "AppShell" && /^body\.resizing(?:-[xy])?$/.test(normalized);
        expect(appShellBodyState || normalized.includes(`[data-component-owner="${owner}"]`), normalized).toBe(true);
      }
    }
  });

  it("limits generated rich HTML rules to the sanitized markdown wrapper", () => {
    for (const header of selectorHeaders(read("src/styles/rich-content.css"))) {
      for (const selector of header.split(",")) expect(selector.trim()).toMatch(/^\.markdown-rendered(?:\W|$)/);
    }
  });

  it("marks nested component roots with the same owner used by their CSS", () => {
    for (const component of ["DiffModal", "FileBrowser", "FilePreviewModal", "LogTimeline", "MarkdownDocument", "WorkspaceAgentsEditor"] as const) {
      expect(read(`src/components/${component}.svelte`)).toContain(`data-component-owner="${owners[component]}"`);
    }
  });
});
