/// <reference types="vite/client" />

interface Window {
  marked?: {
    Marked?: new (...extensions: Record<string, unknown>[]) => { use(extension: Record<string, unknown>): void; parse(content: string, options?: Record<string, unknown>): string };
    setOptions(options: Record<string, unknown>): void;
    parse(content: string): string;
  };
  DOMPurify?: { sanitize(content: string): string };
  Diff2Html?: { html(diff: string, options: Record<string, unknown>): string };
  lucide?: { createIcons(options?: Record<string, unknown>): void };
  webkitAudioContext?: typeof AudioContext;
  puaAssetLoaded?: (asset: string) => void;
}
