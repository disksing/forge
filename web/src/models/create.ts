export interface TemplateField {
  name: string;
  type: "text" | "textarea" | "select" | "boolean";
  label: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  hasDefault?: boolean;
  default?: string | boolean;
}

export interface TaskTemplate {
  name: string;
  path?: string;
  title?: string;
  description?: string;
  valid: boolean;
  taskTitle?: string;
  schemaVersion?: number;
  digest?: string;
  legacy?: boolean;
  errors?: Array<{ message?: string }>;
  fields?: TemplateField[];
}

export interface TaskPreview {
  title: string;
  markdown: string;
  slug?: string;
  template?: { digest?: string };
}

export interface CreateDraft {
  type: "project" | "task";
  projectId: string;
  templateName: string;
  templateFields: Record<string, string | boolean>;
  title: string;
  titleOverride: boolean;
  description: string;
  detail: string;
  slug: string;
  activeTab: "edit" | "preview";
  editedMarkdown: string | null;
  showOptions: boolean;
}

export interface CreateDialogModel {
  open: boolean;
  identity: string;
  workspaceId: string;
  draft: CreateDraft;
  templates: TaskTemplate[];
  preview: TaskPreview | null;
  previewKey: string;
  previewing: boolean;
  previewError: string;
  templateDigest: string;
  submitting: boolean;
  onClose: () => void;
  onPreview: (draft: CreateDraft) => Promise<void>;
  onSubmit: (draft: CreateDraft) => Promise<void>;
  previewRequestKey: (draft: CreateDraft) => string;
  onConfirmTemplateSwitch: () => boolean;
  onIconsChanged: () => void;
}
