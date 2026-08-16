import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "../..");
const components = [
  "AgentPanelHeader",
  "AppearanceSettingsPanel",
  "AttentionList",
  "ApprovalCard",
  "AppShell",
  "AgentHubSettingsPanel",
  "ChatComposer",
  "ConfirmDialog",
  "CreateDialog",
  "ProjectCreateForm",
  "TaskWizard",
  "TemplateFieldGroup",
  "TemplatePicker",
  "DetailPanel",
  "DiffModal",
  "DoctorDialog",
  "EventTimeline",
  "FileBrowser",
  "FilePreviewFullscreen",
  "FilePreviewModal",
  "HistoryTimeline",
  "LifecycleNotice",
  "MarkdownDocument",
  "MarkdownEditor",
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
] as const;

const owners: Record<(typeof components)[number], string> = {
  AgentPanelHeader: "agent-panel-header",
  AppearanceSettingsPanel: "appearance-settings-panel",
  AttentionList: "attention-list",
  ApprovalCard: "event-timeline",
  AppShell: "app-shell",
  AgentHubSettingsPanel: "agenthub-settings-panel",
  ChatComposer: "chat-composer",
  ConfirmDialog: "confirm-dialog",
  CreateDialog: "create-dialog",
  ProjectCreateForm: "project-create-form",
  TaskWizard: "task-wizard",
  TemplateFieldGroup: "template-field-group",
  TemplatePicker: "template-picker",
  DetailPanel: "detail-panel",
  DiffModal: "diff-modal",
  DoctorDialog: "doctor-dialog",
  EventTimeline: "event-timeline",
  FileBrowser: "file-browser",
  FilePreviewFullscreen: "file-preview-fullscreen",
  FilePreviewModal: "file-preview-modal",
  HistoryTimeline: "history-timeline",
  LifecycleNotice: "event-timeline",
  MarkdownDocument: "markdown-document",
  MarkdownEditor: "markdown-editor",
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
};

function read(relativePath: string): string {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function zIndexes(relativePath: string): number[] {
  return [...read(relativePath).matchAll(/z-index:\s*(\d+)/g)].map((match) => Number(match[1]));
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

  it("keeps file previews above application navigation and below higher-priority dialogs", () => {
    const filePreview = Math.max(...zIndexes("src/components/FilePreviewModal.css"));
    const navigation = Math.max(...zIndexes("src/components/AppShell.css"), ...zIndexes("src/components/MobileToolbar.css"));
    const higherPriorityDialogs = ["CreateDialog", "UploadDialog", "SettingsModal", "ConfirmDialog", "DoctorDialog"]
      .map((component) => Math.max(...zIndexes(`src/components/${component}.css`)));

    expect(filePreview).toBeGreaterThan(navigation);
    expect(filePreview).toBeLessThan(Math.min(...higherPriorityDialogs));
  });

  it("keeps file preview header actions at their intrinsic width on narrow layouts", () => {
    const css = read("src/components/FilePreviewModal.css");
    const selector = ':where([data-component-owner="file-preview-modal"]) .file-modal-actions > .secondary-button';
    const start = css.indexOf(selector);
    expect(start).toBeGreaterThanOrEqual(0);
    expect(css.slice(css.indexOf("{", start), css.indexOf("}", start) + 1)).toContain("width: auto;");
  });

  it("marks nested component roots with the same owner used by their CSS", () => {
    for (const component of ["AgentPanelHeader", "AppearanceSettingsPanel", "AttentionList", "AgentHubSettingsPanel", "ApprovalCard", "DiffModal", "DoctorDialog", "FileBrowser", "FilePreviewModal", "HistoryTimeline", "LifecycleNotice", "MarkdownDocument", "MobileToolbar", "NotificationSettingsPanel", "PaneResizeHandle", "ProfilesSettingsPanel", "ProjectCreateForm", "ProjectTree", "SettingsNavigation", "StatusPresentation", "TaskWizard", "TemplateFieldGroup", "TemplatePicker", "ThinkingBlock", "TimelineMessage", "TimelineNotice", "ToolGroup", "ToolItem", "UnknownEvent", "UserSettingsPanel", "WorkspaceSettingsPanel", "WorkspaceSwitcher"] as const) {
      expect(read(`src/components/${component}.svelte`)).toContain(`data-component-owner="${owners[component]}"`);
    }
  });

  it("keeps WorkspaceSwitcher controls below the component root boundary", () => {
    const css = read("src/components/WorkspaceSwitcher.css");
    expect(css).toContain(':where([data-component-owner="workspace-switcher"]) .workspace-switcher-menu-button');
    expect(css).not.toContain(':where([data-component-owner="workspace-switcher"]).workspace-switcher-menu-button');
    expect(css).toContain(':where([data-component-owner="workspace-switcher"]) .workspace-open');
    expect(css).not.toContain(':where([data-component-owner="workspace-switcher"]).workspace-open');
  });

  it("keeps the selected Activity row background while hovered", () => {
    const css = read("src/components/AttentionList.css");
    const body = (selector: string) => {
      const start = css.indexOf(selector);
      expect(start).toBeGreaterThanOrEqual(0);
      return css.slice(css.indexOf("{", start), css.indexOf("}", start) + 1);
    };
    const backgroundOf = (selector: string) => {
      const match = body(selector).match(/background:\s*([^;]+);/);
      expect(match, selector).not.toBeNull();
      return match![1].trim();
    };
    // Hovering the open resource must not wash out its selected state.
    expect(backgroundOf('.activity-row.selected:hover')).toBe(backgroundOf('.activity-row.selected'));
    // Non-selected rows keep the dedicated hover tint.
    expect(backgroundOf('.activity-row:hover')).toBe("var(--ink-row)");
  });
});
