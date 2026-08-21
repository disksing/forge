import type { AgentOption, WorkspaceOption } from "./common";

export interface ProfileDraft {
  key: string;
  description: string;
  agentName: string;
}

export interface NotificationPreferences {
  browser: boolean;
  sound: boolean;
  permission: string;
  permissionError: string;
  soundError: string;
}

export interface AgentHubSettings {
  mode?: string;
  configuredEndpoint: string;
  connected: boolean;
  compatible: boolean;
  error: string;
  apiVersion: string;
  version: string;
  capabilities: string[];
  providers: Array<{ id: string; name?: string }>;
  agents: Array<{ name: string; providerId?: string; available?: boolean; unavailableReason?: string }>;
}

export interface ThemeOption {
  id: string;
  label: string;
  description: string;
}

export interface AppearanceSettings {
  layout: "auto" | "three" | "two" | "split";
  fontScales: { sidebar: number; details: number; chat: number };
  theme: string;
  themeOptions: ThemeOption[];
}

export interface SettingsDraft {
  tab: "workspace" | "user" | "appearance" | "agenthub" | "profiles" | "notifications";
  workspacePath: string;
  createWorkspace: boolean;
  workspaceLanguage: "en" | "zh-CN";
  userName: string;
  endpoint: string;
  profiles: ProfileDraft[];
  dirty: boolean;
}

export interface SettingsModel {
  open: boolean;
  identity: string;
  dataVersion: number;
  initialTab: SettingsDraft["tab"];
  workspaces: WorkspaceOption[];
  activeWorkspaceId: string;
  workspaceIcons: Array<{ id: string; label: string; src: string }>;
  workspaceIconSavingId: string;
  userName: string;
  appearance: AppearanceSettings;
  agentHub: AgentHubSettings;
  profiles: ProfileDraft[];
  agents: AgentOption[];
  notifications: NotificationPreferences;
  onClose: (dirty: boolean) => void;
  onAddWorkspace: (draft: SettingsDraft) => Promise<void>;
  onRemoveWorkspace: (id: string, draft: SettingsDraft) => Promise<void>;
  onWorkspaceIcon: (id: string, icon: string, draft: SettingsDraft) => Promise<void>;
  onSaveWorkspaceName: (id: string, name: string, draft: SettingsDraft) => Promise<void>;
  onSaveUser: (name: string) => Promise<string>;
  onLayoutPreference: (preference: AppearanceSettings["layout"]) => void;
  onFontScale: (column: keyof AppearanceSettings["fontScales"], value: number) => void;
  onResetFontScales: () => void;
  onThemePreference: (theme: string) => void;
  onSaveAgentHub: (draft: SettingsDraft) => Promise<void>;
  onBrowserNotifications: (enabled: boolean) => void;
  onCompletionSound: (enabled: boolean) => void;
  onToast: (message: string) => void;
}
