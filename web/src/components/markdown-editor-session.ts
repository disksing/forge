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
