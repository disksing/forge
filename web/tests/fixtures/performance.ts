import type { AgentEvent, AppShellModel, ResourceLogModel, ShellResourceItem, ShellStatusPresentation } from "../../src/components/models";

export const performanceBudgets = {
  treeRenderMs: 5_000,
  logRenderMs: 4_000,
  markdownRenderMs: 1_000,
  eventMergeMs: 1_000,
  continuousDeltaMs: 1_500,
  maximumTreeElements: 15_000,
  maximumLogElements: 10_000,
} as const;

const emptyStatus: ShellStatusPresentation = {
  hasTaskState: false, className: "", layoutClassName: "", slotClassName: "", statuses: [],
};

function resource(id: string, type: "project" | "task", children: ShellResourceItem[] = []): ShellResourceItem {
  return {
    id, type, title: `${type} ${id}`, ref: id, active: false, expanded: true, ariaLabel: id,
    statusLabel: "", status: emptyStatus, summary: null, children,
  };
}

export function largeTreeModel(): AppShellModel {
  const projects = Array.from({ length: 120 }, (_, projectIndex) => {
    const projectId = `project-${projectIndex}`;
    return resource(projectId, "project", Array.from({ length: 5 }, (_, taskIndex) => resource(`${projectId}.task-${taskIndex}`, "task")));
  });
  const noop = () => undefined;
  const noopAsync = async () => undefined;
  return {
    identity: "performance-workspace", loading: false, error: "", version: "test", activeWorkspaceId: "performance-workspace",
    workspaces: [{ id: "performance-workspace", name: "Performance Workspace", path: "/tmp/performance", iconSrc: "/favicon.svg" }],
    projects, sessions: [], paneSizes: { sidebarWidth: 280, chatWidth: 420, sidebarSessionHeight: 210 },
    mobile: { sidebarOpen: false, view: "details", immersive: false }, layout: { preference: "auto", effective: "three" }, route: { path: "", revision: 0, replace: true },
    onSwitchWorkspace: noopAsync, onAddWorkspace: noop, onCreateProject: noop, onOpenSettings: noop,
    onToggleProject: noopAsync, onSelectResource: noopAsync, onReorder: noopAsync, onDragState: noop,
    onPanePreview: noop, onPaneCommit: noop, onPaneViewport: noop, onMobileSidebar: noop, onMobileView: noop,
    onMobileImmersive: noop, onLayoutCycle: noop, onHistoryNavigation: noopAsync, onToast: noop, onIconsChanged: noop,
  };
}

export function longLogs(): ResourceLogModel[] {
  return Array.from({ length: 750 }, (_, index) => ({
    id: `log-${index}`,
    time: new Date(Date.UTC(2026, 0, 1, 0, 0, index)).toISOString(),
    title: `Deterministic log ${index}`,
    details: `## Log ${index}\n\n${"bounded detail ".repeat(20)}`,
  }));
}

export function largeMarkdown(): string {
  return Array.from({ length: 3_000 }, (_, index) => `## Section ${index}\n\n${"deterministic markdown ".repeat(8)}`).join("\n\n");
}

export function continuousEvents(count = 10_000): AgentEvent[] {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1, type: "message", sessionId: "performance-session", data: { text: `event ${index + 1}` },
  }));
}
