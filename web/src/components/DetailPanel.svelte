<script lang="ts">
  import "./DetailPanel.css";

  import { onDestroy, onMount } from "svelte";

  import { ApiClient } from "../api/client";
  import type { ModelChannel } from "./model-channel";
  import DiffModal from "./DiffModal.svelte";
  import FileBrowser from "./FileBrowser.svelte";
  import FilePreviewModal from "./FilePreviewModal.svelte";
  import Icon from "./Icon.svelte";
  import LogTimeline from "./LogTimeline.svelte";
  import MarkdownDocument from "./MarkdownDocument.svelte";
  import WorkspaceAgentsEditor from "./WorkspaceAgentsEditor.svelte";
  import type { DetailPanelModel, ResourceFileModel, ResourceRepoModel } from "./models";

  let { channel }: { channel: ModelChannel<DetailPanelModel> } = $props();
  // svelte-ignore state_referenced_locally
  let model = $state(channel.current());
  let identity = $state("");
  let activeTab = $state("");
  let expanded = $state(new Set<string>());
  let preview = $state<{ section: string; path: string } | null>(null);
  let diffRepo = $state<ResourceRepoModel | null>(null);
  const tabMemory = new Map<string, string>();
  const client = new ApiClient();

  const files = $derived((model.detail?.files || []).filter((file) => file.name !== "AGENTS.md"));
  const fileNames = $derived(new Set(files.map((file) => file.name)));
  const tabs = $derived(resourceTabs());
  const activePreviewPath = $derived(preview ? `${preview.section}:${preview.path}` : "");

  onMount(() => channel.subscribe((next) => {
    model = next;
    if (next.identity !== identity) {
      if (identity && activeTab) tabMemory.set(identity, activeTab);
      identity = next.identity;
      preview = null;
      diffRepo = null;
      expanded = new Set();
      activeTab = tabMemory.get(identity) || initialTab(next);
      const content = document.getElementById("detailsContent");
      if (content) content.scrollTop = 0;
    } else if (tabs.length && !tabs.some((tab) => tab.id === activeTab)) {
      activeTab = tabs[0].id;
    }
    queueMicrotask(next.onIconsChanged);
  }));

  onMount(() => {
    const keydown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (diffRepo) { event.preventDefault(); diffRepo = null; }
      else if (preview) { event.preventDefault(); preview = null; }
    };
    document.addEventListener("keydown", keydown);
    return () => document.removeEventListener("keydown", keydown);
  });

  onDestroy(() => client.dispose());

  function initialTab(value: DetailPanelModel): string {
    const detailFiles = (value.detail?.files || []).filter((file) => file.name !== "AGENTS.md");
    if (value.resourceType === "project" && detailFiles.some((file) => file.name === "project.md")) return "project";
    if (detailFiles.some((file) => file.name === "task.md")) return "task";
    if (detailFiles.some((file) => file.name === "work.md")) return "work";
    if (value.resourceType === "project") return "project";
    if (value.resourceType === "task") return "task";
    return "logs";
  }

  function resourceTabs(): Array<{ id: string; label: string }> {
    if (!model.detail) return [];
    const result: Array<{ id: string; label: string }> = [];
    if (fileNames.has("project.md")) result.push({ id: "project", label: "Project" });
    if (fileNames.has("task.md")) result.push({ id: "task", label: "Task" });
    if (fileNames.has("work.md")) result.push({ id: "work", label: "Work" });
    if (model.resourceType === "project" || model.detail.template) result.push({ id: "template", label: "Template" });
    result.push({ id: "logs", label: "Logs" }, { id: "artifacts", label: "Artifacts" });
    if (model.resourceType === "task") result.push({ id: "worktrees", label: "Worktrees" });
    return result;
  }

  function documentTab(file: ResourceFileModel): string {
    if (file.name === "project.md") return "project";
    if (file.name === "task.md") return "task";
    if (file.name === "work.md") return "work";
    return tabs.find((tab) => ["project", "task", "work"].includes(tab.id))?.id || "";
  }

  function selectTab(tab: string): void {
    activeTab = tab;
    tabMemory.set(identity, tab);
  }

  function resourceReference(id: string): string {
    const segment = id.includes(".") ? id.slice(id.lastIndexOf(".") + 1) : id;
    const match = segment.match(/^(?:project|task)(\d+)$/);
    return `#${match ? match[1] : segment}`;
  }

  function toggleFile(key: string): void {
    const next = new Set(expanded);
    if (next.has(key)) next.delete(key); else next.add(key);
    expanded = next;
    queueMicrotask(model.onIconsChanged);
  }

  function rawURL(section: string, path: string, download = false): string {
    const base = section === "Wiki" ? "wiki/files/raw" : "files/raw";
    const suffix = download ? "&download=1" : "";
    return `/api/workspaces/${encodeURIComponent(model.workspaceId)}/${base}?path=${encodeURIComponent(path)}${suffix}`;
  }

  function openPreview(section: string, path: string): void {
    preview = { section, path };
  }

  function toastError(message: string): void {
    if (message) model.onToast(message);
  }
</script>

{#if !model.workspaceId}
  <div id="detailsContent" class="details-content"><div class="empty-state"><Icon name="folder-search" className="empty-state-icon" /><strong>No workspace selected</strong><span>Add an AgentWorkspace path in the sidebar.</span></div></div>
{:else if model.resourceType === "workspace"}
  <div class="details-header"><nav class="breadcrumb" aria-label="Location"><button type="button" class="breadcrumb-link current" onclick={() => model.onNavigate("workspace")}>{model.workspaceName}</button></nav><div class="title-row"><h1>{model.workspaceName}</h1></div></div>
  <div id="detailsContent" class="details-content">
    <WorkspaceAgentsEditor identity={model.identity} file={model.workspaceAgents} onSave={model.onSaveWorkspaceAgents} onToast={model.onToast} onIconsChanged={model.onIconsChanged} />
    {#if model.wiki?.error}<div class="content-section"><h3><Icon name="book-open" /><span>Wiki</span></h3><div class="file-modal-empty error-preview wiki-status"><Icon name="triangle-alert" /><strong>Wiki unavailable</strong><span>{model.wiki.error}</span></div></div>
    {:else if !model.wiki?.exists}<div class="content-section"><h3><Icon name="book-open" /><span>Wiki</span></h3><div class="file-modal-empty wiki-status"><Icon name="book-open" /><strong>Wiki not initialized</strong><span>Run forge migrate to create wiki/index.md.</span></div></div>
    {:else}<FileBrowser title="Wiki" entries={model.wiki.entries || []} emptyMessage="No Wiki files yet." {expanded} activePath={activePreviewPath} onToggle={toggleFile} onPreview={openPreview} {rawURL} />{/if}
  </div>
{:else}
  <div class="details-header">
    <nav class="breadcrumb" aria-label="Location">
      <button type="button" class="breadcrumb-link" onclick={() => model.onNavigate("workspace")}>{model.workspaceName}</button>
      {#if model.parent}<span class="breadcrumb-separator">/</span><button type="button" class="breadcrumb-link" onclick={() => model.onNavigate(model.parent?.id || "workspace")}>{model.parent.title}</button>{/if}
      <span class="breadcrumb-separator">/</span><button type="button" class="breadcrumb-link current" onclick={() => model.onNavigate(model.resourceId)}>{model.resourceTitle}</button>
    </nav>
    <div class="title-row"><h1>{model.resourceTitle}<code class="resource-ref-badge">{resourceReference(model.resourceId)}</code></h1>{#if model.detail}<div class="details-actions">{#if model.resourceType === "project"}<button type="button" id="newTaskButton" onclick={() => model.onCreateTask(model.resourceId)}><Icon name="plus" /><span>New Task</span></button>{/if}<button type="button" class="danger" id="archiveButton" onclick={() => model.onArchive(model.resourceId)}><Icon name="archive" /><span>Archive</span></button></div>{/if}</div>
  </div>
  {#if model.loading || !model.detail}<div id="detailsContent" class="details-content"><div class="empty-state"><Icon name="loader-circle" className="empty-state-icon" /><strong>Loading details...</strong></div></div>
  {:else}
    <div class="details-tabs" role="tablist" aria-label="Resource details">
      {#each tabs as tab (tab.id)}<button type="button" class:active={activeTab === tab.id} class="details-tab" role="tab" aria-selected={activeTab === tab.id} onclick={() => selectTab(tab.id)}><span>{tab.label}</span>{#if tab.id === "logs" && model.detail.logs?.length}<span class="details-tab-count">{model.detail.logs.length}</span>{/if}</button>{/each}
    </div>
    <div id="detailsContent" class="details-content">
      {#each files as file (file.path || file.name)}<div hidden={activeTab !== documentTab(file)}><MarkdownDocument {file} workspaceId={model.workspaceId} /></div>{/each}
      <div hidden={activeTab !== "template"}>
        {#if model.resourceType === "project"}<div class="content-section"><h3><Icon name="layout-template" /><span>Task Templates</span></h3><div class="template-list">{#if model.detail.templates?.length}{#each model.detail.templates as template (template.name)}<button type="button" class:invalid={!template.valid} class="template-row" onclick={() => template.path && openPreview("Templates", template.path)}><Icon name="file-text" /><span><strong>{template.title || template.name}</strong><small>{template.name} · v{template.schemaVersion || "?"} · {template.valid ? `${(template.fields || []).length} fields` : `invalid${template.errors?.[0]?.message ? `: ${template.errors[0].message}` : ""}`}{template.legacy ? " · legacy" : ""}</small></span><Icon name="chevron-right" /></button>{/each}{:else}<div class="empty-list-row"><Icon name="layout-template" /><span>No task templates in templates/*.md.</span></div>{/if}</div></div>
        {:else if model.detail.template}<div class="content-section"><h3><Icon name="layout-template" /><span>Template</span></h3><div class="template-list"><div class="template-row"><Icon name="file-text" /><span><strong>{model.detail.template.name}</strong><small>Created from template · v{model.detail.template.schemaVersion || "?"} · {model.detail.template.digest || ""}</small></span></div></div></div>{/if}
      </div>
      <div hidden={activeTab !== "logs"}><LogTimeline resourceId={model.resourceId} logs={model.detail.logs || []} hasMore={model.logs.hasMore} loading={model.logs.loading} error={model.logs.error} onLoadMore={() => model.onLoadMoreLogs(model.resourceId)} onIconsChanged={model.onIconsChanged} /></div>
      <div hidden={activeTab !== "artifacts"}><FileBrowser title="Artifacts" entries={model.detail.artifacts || []} emptyMessage="No artifacts." {expanded} activePath={activePreviewPath} onToggle={toggleFile} onPreview={openPreview} {rawURL} /></div>
      <div hidden={activeTab !== "worktrees"}><div class="content-section"><h3><Icon name="folder-git-2" /><span>Worktrees</span></h3><div class="worktree-list">{#if model.detail.repos?.length}{#each model.detail.repos as repo (`${repo.name}:${repo.worktreePath}`)}<div class="worktree-row"><div class="worktree-main"><Icon name="git-branch" className="worktree-icon" /><div><strong>{repo.branch || "HEAD"}</strong><span>{repo.name || "repository"}{(repo.targetBranch || repo.baseBranch) ? ` · base ${repo.targetBranch || repo.baseBranch}` : ""}</span><small>{repo.worktreePath || ""}</small></div></div><button type="button" class="secondary-button" onclick={() => diffRepo = repo}><Icon name="git-compare-arrows" /><span>View Diff</span></button></div>{/each}{:else}<div class="empty-list-row"><Icon name="git-branch" /><span>No worktrees.</span></div>{/if}</div></div></div>
    </div>
  {/if}
{/if}

<FilePreviewModal {client} workspaceId={model.workspaceId} resourceId={model.resourceId} selection={preview} onClose={() => preview = null} onError={toastError} onIconsChanged={model.onIconsChanged} />
<DiffModal {client} workspaceId={model.workspaceId} resourceId={model.resourceId} repo={diffRepo} onClose={() => diffRepo = null} onError={toastError} onIconsChanged={model.onIconsChanged} />
