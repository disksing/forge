import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "../..");
const components = [
  "AttentionList",
  "ApprovalCard",
  "AppShell",
  "AgentHubSettingsPanel",
  "ChatComposer",
  "CreateDialog",
  "ProjectCreateForm",
  "TaskCreateForm",
  "TaskPreview",
  "TemplateFieldGroup",
  "TemplatePicker",
  "DetailPanel",
  "DiffModal",
  "EventTimeline",
  "FileBrowser",
  "FilePreviewModal",
  "LayoutSwitcher",
  "LogTimeline",
  "LifecycleNotice",
  "MarkdownDocument",
  "MobileToolbar",
  "NotificationSettingsPanel",
  "PaneResizeHandle",
  "ProfilesSettingsPanel",
  "ProjectTree",
  "SettingsModal",
  "SettingsNavigation",
  "StatusPresentation",
  "ThinkingBlock",
  "TimelineMessage",
  "TimelineNotice",
  "Toast",
  "ToolGroup",
  "ToolItem",
  "UnknownEvent",
  "UploadDialog",
  "UserSettingsPanel",
  "WorkspaceSettingsPanel",
  "WorkspaceSwitcher",
  "WorkspaceAgentsEditor",
] as const;

const owners: Record<(typeof components)[number], string> = {
  AttentionList: "attention-list",
  ApprovalCard: "event-timeline",
  AppShell: "app-shell",
  AgentHubSettingsPanel: "agenthub-settings-panel",
  ChatComposer: "chat-composer",
  CreateDialog: "create-dialog",
  ProjectCreateForm: "project-create-form",
  TaskCreateForm: "task-create-form",
  TaskPreview: "task-preview",
  TemplateFieldGroup: "template-field-group",
  TemplatePicker: "template-picker",
  DetailPanel: "detail-panel",
  DiffModal: "diff-modal",
  EventTimeline: "event-timeline",
  FileBrowser: "file-browser",
  FilePreviewModal: "file-preview-modal",
  LayoutSwitcher: "layout-switcher",
  LogTimeline: "log-timeline",
  LifecycleNotice: "event-timeline",
  MarkdownDocument: "markdown-document",
  MobileToolbar: "mobile-toolbar",
  NotificationSettingsPanel: "notification-settings-panel",
  PaneResizeHandle: "pane-resize-handle",
  ProfilesSettingsPanel: "profiles-settings-panel",
  ProjectTree: "project-tree",
  SettingsModal: "settings",
  SettingsNavigation: "settings-navigation",
  StatusPresentation: "status-presentation",
  ThinkingBlock: "event-timeline",
  TimelineMessage: "event-timeline",
  TimelineNotice: "event-timeline",
  Toast: "toast",
  ToolGroup: "event-timeline",
  ToolItem: "event-timeline",
  UnknownEvent: "event-timeline",
  UploadDialog: "upload-dialog",
  UserSettingsPanel: "user-settings-panel",
  WorkspaceSettingsPanel: "workspace-settings-panel",
  WorkspaceSwitcher: "workspace-switcher",
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
        const paneBodyState = component === "PaneResizeHandle" && /^body\.resizing(?:-[xy])?$/.test(normalized);
        expect(paneBodyState || normalized.includes(`[data-component-owner="${owner}"]`), normalized).toBe(true);
      }
    }
  });

  it("limits generated rich HTML rules to the sanitized markdown wrapper", () => {
    for (const header of selectorHeaders(read("src/styles/rich-content.css"))) {
      for (const selector of header.split(",")) expect(selector.trim()).toMatch(/^\.markdown-rendered(?:\W|$)/);
    }
  });

  it("keeps shared settings panel rules inside explicit panel roots", () => {
    for (const header of selectorHeaders(read("src/components/SettingsPanel.css"))) {
      for (const selector of header.split(",")) expect(selector.trim()).toContain("[data-component-owner][data-settings-panel]");
    }
  });

  it("marks nested component roots with the same owner used by their CSS", () => {
    for (const component of ["AttentionList", "AgentHubSettingsPanel", "ApprovalCard", "DiffModal", "FileBrowser", "FilePreviewModal", "LayoutSwitcher", "LifecycleNotice", "LogTimeline", "MarkdownDocument", "MobileToolbar", "NotificationSettingsPanel", "PaneResizeHandle", "ProfilesSettingsPanel", "ProjectCreateForm", "ProjectTree", "SettingsNavigation", "StatusPresentation", "TaskCreateForm", "TaskPreview", "TemplateFieldGroup", "TemplatePicker", "ThinkingBlock", "TimelineMessage", "TimelineNotice", "ToolGroup", "ToolItem", "UnknownEvent", "UserSettingsPanel", "WorkspaceAgentsEditor", "WorkspaceSettingsPanel", "WorkspaceSwitcher"] as const) {
      expect(read(`src/components/${component}.svelte`)).toContain(`data-component-owner="${owners[component]}"`);
    }
  });

  it("keeps WorkspaceSwitcher controls below the component root boundary", () => {
    const css = read("src/components/WorkspaceSwitcher.css");
    expect(css).toContain(':where([data-component-owner="workspace-switcher"]) .workspace-switcher-button');
    expect(css).not.toContain(':where([data-component-owner="workspace-switcher"]).workspace-switcher-button');
  });
});
