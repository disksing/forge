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

export interface ResourceProfileDefaults {
  workspace: string;
  project: string;
  task: string;
}

export interface AgentHubSettings {
  configuredEndpoint: string;
  connected: boolean;
  compatible: boolean;
  error: string;
  apiVersion: string;
  version: string;
  capabilities: string[];
  providers: Array<{ id: string; name?: string }>;
  agents: Array<{ name: string; providerId?: string; available?: boolean; unavailableReason?: string }>;
  resourceDefaults?: ResourceProfileDefaults;
}

export interface SettingsDraft {
  tab: "workspace" | "user" | "agenthub" | "profiles" | "notifications";
  workspacePath: string;
  createWorkspace: boolean;
  userName: string;
  endpoint: string;
  profiles: ProfileDraft[];
  resourceDefaults: ResourceProfileDefaults;
  newProfile: ProfileDraft;
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
  agentHub: AgentHubSettings;
  profiles: ProfileDraft[];
  agents: AgentOption[];
  notifications: NotificationPreferences;
  onClose: (dirty: boolean) => void;
  onAddWorkspace: (draft: SettingsDraft) => Promise<void>;
  onRemoveWorkspace: (id: string, draft: SettingsDraft) => Promise<void>;
  onWorkspaceIcon: (id: string, icon: string, draft: SettingsDraft) => Promise<void>;
  onSaveUser: (name: string) => Promise<string>;
  onSaveAgentHub: (draft: SettingsDraft) => Promise<void>;
  onBrowserNotifications: (enabled: boolean) => void;
  onCompletionSound: (enabled: boolean) => void;
  onToast: (message: string) => void;
  onIconsChanged: () => void;
}
