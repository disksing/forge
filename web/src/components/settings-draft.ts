import type { ResourceDefaultBinding, SettingsDraft, SettingsModel } from "./models";

function defaultBinding(): ResourceDefaultBinding {
  return { kind: "profile", name: "default" };
}

export function createSettingsDraft(model: SettingsModel): SettingsDraft {
  return {
    tab: model.initialTab,
    workspacePath: "",
    createWorkspace: false,
    userName: model.userName,
    endpoint: model.agentHub.configuredEndpoint || "http://127.0.0.1:4646",
    profiles: model.profiles.map((profile) => ({ ...profile })),
    resourceDefaults: {
      workspace: model.agentHub.resourceDefaults?.workspace ? { ...model.agentHub.resourceDefaults.workspace } : defaultBinding(),
      project: model.agentHub.resourceDefaults?.project ? { ...model.agentHub.resourceDefaults.project } : defaultBinding(),
      task: model.agentHub.resourceDefaults?.task ? { ...model.agentHub.resourceDefaults.task } : defaultBinding(),
    },
    newProfile: { key: "", description: "", agentName: model.agents[0]?.id || "" },
    dirty: false,
  };
}

export function cloneSettingsDraft(draft: SettingsDraft): SettingsDraft {
  return {
    ...draft,
    profiles: draft.profiles.map((profile) => ({ ...profile })),
    resourceDefaults: {
      workspace: { ...draft.resourceDefaults.workspace },
      project: { ...draft.resourceDefaults.project },
      task: { ...draft.resourceDefaults.task },
    },
    newProfile: { ...draft.newProfile },
  };
}

export function settingsErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
