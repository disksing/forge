import type { SettingsDraft, SettingsModel } from "./models";

export function createSettingsDraft(model: SettingsModel): SettingsDraft {
  return {
    tab: model.initialTab,
    workspacePath: "",
    createWorkspace: false,
    workspaceLanguage: "en",
    userName: model.userName,
    endpoint: model.agentHub.configuredEndpoint || "http://127.0.0.1:4646",
    profiles: model.profiles.map((profile) => ({ ...profile })),
    dirty: false,
  };
}

export function cloneSettingsDraft(draft: SettingsDraft): SettingsDraft {
  return {
    ...draft,
    profiles: draft.profiles.map((profile) => ({ ...profile })),
  };
}

export function settingsErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
