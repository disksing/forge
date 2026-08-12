import type { SettingsDraft, SettingsModel } from "./models";

export function createSettingsDraft(model: SettingsModel): SettingsDraft {
  return {
    tab: model.initialTab,
    workspacePath: "",
    createWorkspace: false,
    userName: model.userName,
    endpoint: model.agentHub.configuredEndpoint || "http://127.0.0.1:4646",
    profiles: model.profiles.map((profile) => ({ ...profile })),
    resourceDefaults: {
      workspace: model.agentHub.resourceDefaults?.workspace || "default",
      project: model.agentHub.resourceDefaults?.project || "default",
      task: model.agentHub.resourceDefaults?.task || "default",
    },
    newProfile: { key: "", description: "", agentName: model.agents[0]?.id || "" },
    dirty: false,
  };
}

export function cloneSettingsDraft(draft: SettingsDraft): SettingsDraft {
  return {
    ...draft,
    profiles: draft.profiles.map((profile) => ({ ...profile })),
    resourceDefaults: { ...draft.resourceDefaults },
    newProfile: { ...draft.newProfile },
  };
}

export function settingsErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
