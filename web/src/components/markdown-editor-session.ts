export interface ReviewAnnotation {
  id: string;
  from: number;
  to: number;
  quote: string;
  comment: string;
  stale: boolean;
}

export interface MarkdownEditorSession {
  baseline: string;
  baselineHash: string;
  draft: string;
  annotations: ReviewAnnotation[];
}

// Module memory intentionally survives editor component unmounts but is lost
// on page reload. That is the persistence boundary for review drafts.
export const markdownEditorSessions = new Map<string, MarkdownEditorSession>();

// A full-screen handoff carries the live editor state from the dialog window
// into the separate full-screen page (a new browsing context), where the
// module memory above does not exist yet. The target page reads and removes it.
export const FILE_PREVIEW_HANDOFF_KEY = "pua:file-preview-handoff";
const LEGACY_FILE_PREVIEW_HANDOFF_KEY = "forge:file-preview-handoff";

export interface FilePreviewHandoff {
  version: 1;
  workspaceId: string;
  resourceId: string;
  section: string;
  path: string;
  mode: "preview" | "edit" | "annotate";
  baseline?: string;
  baselineHash?: string;
  draft?: string;
  annotations?: ReviewAnnotation[];
  savedAt: number;
}

export function readFilePreviewHandoff(): FilePreviewHandoff | null {
  try {
    const legacy = localStorage.getItem(LEGACY_FILE_PREVIEW_HANDOFF_KEY);
    if (localStorage.getItem(FILE_PREVIEW_HANDOFF_KEY) === null && legacy !== null) localStorage.setItem(FILE_PREVIEW_HANDOFF_KEY, legacy);
    localStorage.removeItem(LEGACY_FILE_PREVIEW_HANDOFF_KEY);
    const raw = localStorage.getItem(FILE_PREVIEW_HANDOFF_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FilePreviewHandoff;
    if (!parsed || typeof parsed !== "object" || parsed.version !== 1 || typeof parsed.path !== "string") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearFilePreviewHandoff(): void {
  try {
    localStorage.removeItem(FILE_PREVIEW_HANDOFF_KEY);
  } catch {
    // Storage can be unavailable in private modes; nothing to clean up then.
  }
}
