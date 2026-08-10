import type { FileTreeModel, ResourceLogModel } from "./models";

export function isMarkdownFile(path = ""): boolean {
  return /\.(md|markdown|mdown|mkdn)$/i.test(path);
}

export function markdownHTML(content: string): string {
  if (window.marked && window.DOMPurify) {
    window.marked.setOptions({ breaks: true, gfm: true });
    return window.DOMPurify.sanitize(window.marked.parse(String(content ?? "")));
  }
  return `<pre>${escapeHTML(content)}</pre>`;
}

export function stripForgeManagedBlocks(content: string): string {
  const startMarker = "<!-- managed by forge cli -->";
  const endMarker = "<!-- end of forge cli prompt -->";
  let result = "";
  let cursor = 0;
  while (cursor < content.length) {
    const start = content.indexOf(startMarker, cursor);
    if (start < 0) return (result + content.slice(cursor)).trim();
    const end = content.indexOf(endMarker, start + startMarker.length);
    if (end < 0) return (result + content.slice(cursor)).trim();
    result += content.slice(cursor, start);
    cursor = end + endMarker.length;
  }
  return result.trim();
}

export function compareLogTimeDesc(a: ResourceLogModel, b: ResourceLogModel): number {
  const left = Date.parse(a.time || "");
  const right = Date.parse(b.time || "");
  if (Number.isFinite(left) && Number.isFinite(right) && left !== right) return right - left;
  return String(b.time || "").localeCompare(String(a.time || ""));
}

export function relativeTime(value: string): string {
  const timestamp = Date.parse(value || "");
  if (!Number.isFinite(timestamp)) return "unknown";
  const diffSeconds = Math.round((Date.now() - timestamp) / 1000);
  const future = diffSeconds < 0;
  const seconds = Math.abs(diffSeconds);
  if (seconds < 45) return future ? "soon" : "just now";
  const units: Array<[string, number]> = [["year", 31536000], ["month", 2592000], ["week", 604800], ["day", 86400], ["hour", 3600], ["min", 60]];
  for (const [unit, size] of units) {
    if (seconds < size) continue;
    const amount = Math.floor(seconds / size);
    const label = unit === "min" ? "min" : `${unit}${amount === 1 ? "" : "s"}`;
    return future ? `in ${amount} ${label}` : `${amount} ${label} ago`;
  }
  return future ? "in 1 min" : "1 min ago";
}

export function formatBytes(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  const amount = value / 1024 ** index;
  return `${amount >= 10 || index === 0 ? amount.toFixed(0) : amount.toFixed(1)} ${units[index]}`;
}

export function flattenFiles(entries: FileTreeModel[], expanded: Set<string>, section: string, depth = 0): Array<{ entry: FileTreeModel; depth: number }> {
  const result: Array<{ entry: FileTreeModel; depth: number }> = [];
  for (const entry of entries || []) {
    result.push({ entry, depth });
    if (entry.type === "directory" && expanded.has(`${section}:${entry.path}`)) {
      result.push(...flattenFiles(entry.children || [], expanded, section, depth + 1));
    }
  }
  return result;
}

function escapeHTML(value: string): string {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
