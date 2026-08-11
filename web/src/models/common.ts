export interface AgentOption {
  id: string;
  label: string;
  summary: string;
}

export interface WorkspaceOption {
  id: string;
  name: string;
  path: string;
  icon?: string;
}

export interface ToastModel {
  message: string;
  revision: number;
}
