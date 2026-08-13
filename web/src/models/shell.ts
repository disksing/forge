import type { WorkspaceOption } from "./common";

export interface ShellStatusItem {
  key: string;
  className: string;
  iconName: string;
  recentOutput: boolean;
}

export interface ShellStatusPresentation {
  hasTaskState: boolean;
  className: string;
  layoutClassName: string;
  slotClassName: string;
  statuses: ShellStatusItem[];
}

export interface ShellProjectSummary {
  taskLabel: string;
  runningLabel: string;
  ariaLabel: string;
}

export interface ShellResourceItem {
  id: string;
  type: "scheduler" | "project" | "task";
  title: string;
  ref: string;
  active: boolean;
  expanded: boolean;
  ariaLabel: string;
  statusLabel: string;
  status: ShellStatusPresentation;
  summary: ShellProjectSummary | null;
  children: ShellResourceItem[];
  projectId?: string;
  followed?: boolean;
}

export interface ShellAttentionItem {
  id: string;
  type: "workspace" | "scheduler" | "project" | "task";
  title: string;
  ref: string;
  selected: boolean;
  activeTurn: boolean;
  followed: boolean;
  turnNumber: number;
  agentName: string;
  statusLabel: string;
  status: ShellStatusPresentation;
}

export interface ShellWorkspaceItem extends WorkspaceOption {
  iconSrc: string;
}

export interface ShellDragTarget {
  kind: "project" | "task";
  id: string;
  projectId: string;
}

export interface AppShellModel {
  identity: string;
  loading: boolean;
  error: string;
  version: string;
  activeWorkspaceId: string;
  workspaces: ShellWorkspaceItem[];
  scheduler?: ShellResourceItem | null;
  projects: ShellResourceItem[];
  attentionList: ShellAttentionItem[];
  paneSizes: { sidebarWidth: number; chatWidth: number; sidebarAttentionHeight: number };
  mobile: { sidebarOpen: boolean; view: "details" | "chat"; immersive: boolean };
  layout: { preference: "auto" | "three" | "two" | "split"; effective: "three" | "two" | "split" | "single" };
  route: { path: string; revision: number; replace: boolean };
  onSwitchWorkspace: (id: string) => Promise<void>;
  onAddWorkspace: () => void;
  onCreateProject: () => void;
  onOpenSettings: () => void;
  onToggleProject: (id: string) => Promise<void>;
  onSelectResource: (id: string) => Promise<void>;
  onReorder: (drag: ShellDragTarget, target: ShellDragTarget, after: boolean) => Promise<void>;
  onDragState: (drag: ShellDragTarget | null) => void;
  onToggleAttention: (id: string, followed: boolean) => Promise<void>;
  onDismissAttention: (id: string) => Promise<void>;
  onPanePreview: (name: keyof AppShellModel["paneSizes"], value: number) => void;
  onPaneCommit: (name: keyof AppShellModel["paneSizes"]) => void;
  onPaneViewport: () => void;
  onMobileSidebar: (open: boolean) => void;
  onMobileView: (view: "details" | "chat") => void;
  onMobileImmersive: (immersive: boolean) => void;
  onHistoryNavigation: (pathname: string) => Promise<void>;
  onToast: (message: string) => void;
  onIconsChanged: () => void;
}
