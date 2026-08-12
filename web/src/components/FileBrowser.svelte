<script lang="ts">
  import "./FileBrowser.css";

  import Icon from "./Icon.svelte";
  import { flattenFiles, formatBytes } from "./detail";
  import type { FileTreeModel } from "./models";

  let { title, entries = [], emptyMessage = "No files.", expanded, activePath = "", onToggle, onPreview, rawURL, showHeading = true }: { title: string; entries?: FileTreeModel[]; emptyMessage?: string; expanded: Set<string>; activePath?: string; onToggle: (key: string) => void; onPreview: (section: string, path: string) => void; rawURL: (section: string, path: string, download?: boolean) => string; showHeading?: boolean } = $props();
  const rows = $derived(flattenFiles(entries, expanded, title));
  const headingIcon = $derived(title === "Wiki" ? "book-open" : "paperclip");

  function fileIcon(name: string): string {
    const ext = name.includes(".") ? name.split(".").pop()?.toLowerCase() || "" : "";
    if (["js", "jsx", "ts", "tsx", "go", "py", "rs", "html", "css", "svelte", "json", "yaml", "yml", "toml"].includes(ext)) return "file-code";
    if (["md", "markdown", "txt", "rst", "pdf", "log"].includes(ext)) return "file-text";
    if (["png", "jpg", "jpeg", "gif", "svg", "webp", "ico", "avif"].includes(ext)) return "image";
    if (["zip", "tar", "gz", "tgz", "7z"].includes(ext)) return "archive";
    return "file";
  }
</script>

<div class="content-section" data-component-owner="file-browser">
  {#if showHeading}<h3><Icon name={headingIcon} /><span>{title}</span></h3>{/if}
  <div class="artifact-browser"><div class="artifact-tree" role="tree">
    {#if rows.length}
      {#each rows as row (`${title}:${row.entry.path}`)}
        {@const directory = row.entry.type === "directory"}
        {@const open = expanded.has(`${title}:${row.entry.path}`)}
        <div class="artifact-node">
          <button type="button" class:directory class:file={!directory} class:active={activePath === `${title}:${row.entry.path}`} class="artifact-row" style={`--depth: ${row.depth}`} onclick={() => directory ? onToggle(`${title}:${row.entry.path}`) : onPreview(title, row.entry.path)}>
            <span class="artifact-main"><span class="artifact-chevron">{#if directory}<Icon name={open ? "chevron-down" : "chevron-right"} />{/if}</span><Icon name={directory ? open ? "folder-open" : "folder" : fileIcon(row.entry.name)} className={directory ? "artifact-icon artifact-icon-dir" : "artifact-icon"} /><span class="artifact-name" title={row.entry.path}>{row.entry.name}</span></span>
            <span class="artifact-side">{#if !directory}<a class="artifact-download" href={rawURL(title, row.entry.path, true)} download={row.entry.name} title={`Download ${row.entry.name}`} aria-label={`Download ${row.entry.name}`} onclick={(event) => event.stopPropagation()}><Icon name="download" className="artifact-download-icon" /></a>{/if}<small>{directory ? `${(row.entry.children || []).length} items` : formatBytes(row.entry.size || 0)}</small></span>
          </button>
        </div>
      {/each}
    {:else}<div class="empty-list-row"><Icon name={title === "Artifacts" ? "archive" : "inbox"} /><span>{emptyMessage}</span></div>{/if}
  </div></div>
</div>
