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
  lock: { className: string } | null;
}

export interface ShellProjectSummary {
  taskLabel: string;
  runningLabel: string;
  ariaLabel: string;
}

export interface ShellResourceItem {
  id: string;
  type: "project" | "task";
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
}

export interface ShellSessionControl {
  resourceId: string;
  path: string;
  navigable: boolean;
}

export interface ShellSessionItem {
  id: string;
  source: "internal" | "external" | string;
  title: string;
  meta: string;
  label: string;
  statusLabel: string;
  status: ShellStatusPresentation;
  unread: boolean;
  current: boolean;
  clickable: boolean;
  navigationResourceId: string;
  menu: boolean;
  controls: ShellSessionControl[];
}

export interface ShellWorkspaceItem extends WorkspaceOption {
  iconSrc: string;
}

export interface ShellDragTarget {
  kind: "project" | "task" | "session";
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
  projects: ShellResourceItem[];
  sessions: ShellSessionItem[];
  paneSizes: { sidebarWidth: number; chatWidth: number; sidebarSessionHeight: number };
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
  onPanePreview: (name: keyof AppShellModel["paneSizes"], value: number) => void;
  onPaneCommit: (name: keyof AppShellModel["paneSizes"]) => void;
  onPaneViewport: () => void;
  onMobileSidebar: (open: boolean) => void;
  onMobileView: (view: "details" | "chat") => void;
  onMobileImmersive: (immersive: boolean) => void;
  onLayoutCycle: () => void;
  onHistoryNavigation: (pathname: string) => Promise<void>;
  onToast: (message: string) => void;
  onIconsChanged: () => void;
}
