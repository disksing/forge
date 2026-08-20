import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "../..");
const components = [
  "AgentPanelHeader",
  "ActivityGroup",
  "AppearanceSettingsPanel",
  "ActivityPanel",
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
  ActivityGroup: "event-timeline",
  AppearanceSettingsPanel: "appearance-settings-panel",
  ActivityPanel: "attention-list",
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
	    const cssName = component === "ActivityPanel" ? "AttentionList" : component;
	    const css = read(`src/components/${cssName}.css`);
	    expect(componentSource).toContain(`import "./${cssName}.css";`);
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

  it("keeps the System Settings close control at the mobile touch target size", () => {
    const css = read("src/components/SettingsModal.css");
    const selector = ':where([data-component-owner="settings"]) .settings-close';
    const start = css.indexOf(selector);
    expect(start, selector).toBeGreaterThanOrEqual(0);
    const rule = css.slice(css.indexOf("{", start), css.indexOf("}", start) + 1);
    expect(rule).toContain("width: 44px;");
    expect(rule).toContain("height: 44px;");
  });

  it("keeps the Workspace problems close control touch-sized without moving list scrolling", () => {
    const css = read("src/components/DoctorDialog.css");
    const body = (selector: string) => {
      const start = css.indexOf(selector);
      expect(start, selector).toBeGreaterThanOrEqual(0);
      return css.slice(css.indexOf("{", start), css.indexOf("}", start) + 1);
    };

    const close = body(':where([data-component-owner="doctor-dialog"]) .doctor-close {');
    expect(close).toContain("flex: 0 0 44px;");
    expect(close).toContain("width: 44px;");
    expect(close).toContain("height: 44px;");
    expect(close).toContain("margin: -5px;");

    const content = body(':where([data-component-owner="doctor-dialog"]) .doctor-content');
    expect(content).toContain("overflow-y: auto;");
  });

  it("keeps the mobile navigation trigger at a 44px touch size without growing the toolbar row", () => {
    const css = read("src/components/MobileToolbar.css");
    const body = (selector: string) => {
      const start = css.indexOf(selector);
      expect(start, selector).toBeGreaterThanOrEqual(0);
      return css.slice(css.indexOf("{", start), css.indexOf("}", start) + 1);
    };

    const toolbar = body(':where([data-component-owner="mobile-toolbar"]).mobile-toolbar {');
    expect(toolbar).toContain("grid-template-columns: 44px minmax(0, 1fr) 44px;");
    expect(toolbar).toContain("padding: 4px 10px;");
    expect(toolbar).toContain("padding-top: calc(4px + env(safe-area-inset-top, 0px));");

    const trigger = body(':where([data-component-owner="mobile-toolbar"]) .mobile-icon-button');
    expect(trigger).toContain("width: 44px;");
    expect(trigger).toContain("height: 44px;");
  });

  it("truncates overlong workspace names instead of overflowing the settings row", () => {
    const css = read("src/components/WorkspaceSettingsPanel.css");
    const body = (selector: string) => {
      const start = css.indexOf(selector);
      expect(start, selector).toBeGreaterThanOrEqual(0);
      return css.slice(css.indexOf("{", start), css.indexOf("}", start) + 1);
    };

    // The name itself ellipsizes like the path does.
    const name = body(':where([data-component-owner="workspace-settings-panel"]) .settings-row-main strong');
    expect(name).toContain("overflow: hidden;");
    expect(name).toContain("text-overflow: ellipsis;");
    expect(name).toContain("white-space: nowrap;");

    // The row is a grid item, so it also needs min-width: 0 to shrink below its
    // min-content instead of pushing the actions out of the viewport.
    const row = body(':where([data-component-owner="workspace-settings-panel"]) .settings-list-row');
    expect(row).toContain("min-width: 0;");
  });

  it("keeps the chat composer send button inside very narrow viewports", () => {
    const body = (path: string, selector: string) => {
      const css = read(path);
      const start = css.indexOf(selector);
      expect(start, selector).toBeGreaterThanOrEqual(0);
      return css.slice(css.indexOf("{", start), css.indexOf("}", start) + 1);
    };

    // At ~220px the agent binding label (e.g. "default (current: codex)") is
    // wider than the composer card; every flex box on the chain from the
    // composer bar to the label must allow shrinking so the label ellipsizes
    // instead of pushing the send button past the right edge.
    const options = body("src/components/ChatComposer.css", ':where([data-component-owner="chat-composer"]) .chat-composer-options');
    expect(options).toContain("min-width: 0;");

    const binding = body("src/components/ChatComposer.css", ':where([data-component-owner="chat-composer"]) .chat-agent-binding');
    expect(binding).toContain("flex: 0 1 auto;");
    expect(binding).toContain("min-width: 0;");

    const button = body("src/components/AgentBindingSelector.css", ':where([data-component-owner="agent-binding-selector"]) .agent-binding-button');
    expect(button).toContain("flex: 0 1 auto;");
    expect(button).toContain("min-width: 0;");
    expect(button).toContain("max-width: 100%;");

    const label = body("src/components/AgentBindingSelector.css", ':where([data-component-owner="agent-binding-selector"]) .agent-binding-label');
    expect(label).toContain("min-width: 0;");
    expect(label).toContain("overflow: hidden;");
    expect(label).toContain("text-overflow: ellipsis;");
    expect(label).toContain("white-space: nowrap;");
  });

  it("keeps composer actions at a mobile touch size without growing the bar", () => {
    const css = read("src/components/ChatComposer.css");
    const touchSelector = ':where([data-component-owner="chat-composer"]) .chat-send-button,';
    const touchStart = css.indexOf(touchSelector);
    expect(touchStart, touchSelector).toBeGreaterThanOrEqual(0);
    const touchRule = css.slice(css.indexOf("{", touchStart), css.indexOf("}", touchStart) + 1);
    expect(touchRule).toContain("width: 44px;");
    expect(touchRule).toContain("height: 44px;");
    expect(touchRule).toContain("min-width: 44px;");
    expect(touchRule).toContain("flex: 0 0 44px;");
    expect(touchRule).toContain("margin: -6px;");

    const adjacentSelector = ':where([data-component-owner="chat-composer"]) .chat-composer-action + .chat-send-button';
    const adjacentStart = css.indexOf(adjacentSelector);
    expect(adjacentStart, adjacentSelector).toBeGreaterThanOrEqual(0);
    const adjacentRule = css.slice(css.indexOf("{", adjacentStart), css.indexOf("}", adjacentStart) + 1);
    expect(adjacentRule).toContain("margin-left: 6px;");
  });

  it("keeps Project detail actions at a 44px touch size without narrow-layout overflow", () => {
    const detailCss = read("src/components/DetailPanel.css");
    const detailStart = detailCss.indexOf(':where([data-component-owner="detail-panel"]) .details-actions button {');
    expect(detailStart).toBeGreaterThanOrEqual(0);
    const detailRule = detailCss.slice(detailCss.indexOf("{", detailStart), detailCss.indexOf("}", detailStart) + 1);
    expect(detailRule).toContain("min-height: 44px;");

    const markdownCss = read("src/components/MarkdownDocument.css");
    const markdownSelector = ':where([data-component-owner="markdown-document"]) .markdown-document-actions .secondary-button';
    const markdownStart = markdownCss.indexOf(markdownSelector);
    expect(markdownStart).toBeGreaterThanOrEqual(0);
    const markdownRule = markdownCss.slice(markdownCss.indexOf("{", markdownStart), markdownCss.indexOf("}", markdownStart) + 1);
    expect(markdownRule).toContain("min-height: 44px;");

    const narrowRuleStart = markdownCss.lastIndexOf(`${markdownSelector} {`);
    expect(narrowRuleStart).toBeGreaterThanOrEqual(0);
    const narrowRule = markdownCss.slice(markdownCss.indexOf("{", narrowRuleStart), markdownCss.indexOf("}", narrowRuleStart) + 1);
    expect(narrowRule).toContain("width: auto;");
  });

  it("keeps the create dialog close control at a mobile touch size without changing the header footprint", () => {
    const css = read("src/components/CreateDialog.css");
    const body = (selector: string) => {
      const start = css.indexOf(selector);
      expect(start, selector).toBeGreaterThanOrEqual(0);
      return css.slice(css.indexOf("{", start), css.indexOf("}", start) + 1);
    };

    const title = body(':where([data-component-owner="create-dialog"]) .create-dialog-header > div');
    const close = body(':where([data-component-owner="create-dialog"]) .create-dialog-header > .icon-button');
    expect(title).toContain("min-width: 0;");
    expect(close).toContain("flex: 0 0 44px;");
    expect(close).toContain("width: 44px;");
    expect(close).toContain("height: 44px;");
    expect(close).toContain("margin: -7px;");
  });

  it("wraps overlong chat message tokens without stranding trailing characters", () => {
    // overflow-wrap:anywhere breaks a token at the exact overflow point and
    // can leave a single trailing character on its own line; break-word only
    // splits tokens that cannot fit on a line of their own.
    const body = (selector: string) => {
      const css = read("src/components/TimelineMessage.css");
      const start = css.indexOf(selector);
      expect(start, selector).toBeGreaterThanOrEqual(0);
      return css.slice(css.indexOf("{", start), css.indexOf("}", start) + 1);
    };
    expect(body('.agent-message-bubble>p')).toContain("overflow-wrap: break-word;");
    expect(body(':where([data-component-owner="event-timeline"]) .agent-message-content {')).toContain("overflow-wrap: break-word;");
  });

  it("marks nested component roots with the same owner used by their CSS", () => {
	    for (const component of ["AgentPanelHeader", "ActivityGroup", "AppearanceSettingsPanel", "ActivityPanel", "AgentHubSettingsPanel", "ApprovalCard", "DiffModal", "DoctorDialog", "FileBrowser", "FilePreviewModal", "HistoryTimeline", "LifecycleNotice", "MarkdownDocument", "MobileToolbar", "NotificationSettingsPanel", "PaneResizeHandle", "ProfilesSettingsPanel", "ProjectCreateForm", "ProjectTree", "SettingsNavigation", "StatusPresentation", "TaskWizard", "TemplateFieldGroup", "TemplatePicker", "ThinkingBlock", "TimelineMessage", "TimelineNotice", "ToolGroup", "ToolItem", "UnknownEvent", "UserSettingsPanel", "WorkspaceSettingsPanel", "WorkspaceSwitcher"] as const) {
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
