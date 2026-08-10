/// <reference types="vite/client" />

interface Window {
  marked?: { setOptions(options: Record<string, unknown>): void; parse(content: string): string };
  DOMPurify?: { sanitize(content: string): string };
  Diff2Html?: { html(diff: string, options: Record<string, unknown>): string };
}
