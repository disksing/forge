package app

import (
	"crypto/sha256"
	"encoding/hex"
	"os"
	"path/filepath"
	"time"
)

type WorkspaceTree struct {
	Root      string             `json:"root"`
	Creator   *Creator           `json:"creator,omitempty"`
	Scheduler ResourceTreeView   `json:"scheduler"`
	Projects  []ResourceTreeView `json:"projects"`
	Wiki      WorkspaceWikiView  `json:"wiki"`
}

type WorkspaceWikiView struct {
	Exists  bool            `json:"exists"`
	Entries []FileTreeEntry `json:"entries"`
	Error   string          `json:"error,omitempty"`
}

type ResourceTreeView struct {
	ID           string             `json:"id"`
	Type         string             `json:"type"`
	Title        string             `json:"title"`
	Path         string             `json:"path"`
	Archived     bool               `json:"archived"`
	Creator      *Creator           `json:"creator,omitempty"`
	AgentBinding AgentBinding       `json:"agentBinding"`
	Children     []ResourceTreeView `json:"children,omitempty"`
}

type ResourceDetailView struct {
	ID           string              `json:"id"`
	Type         string              `json:"type"`
	Title        string              `json:"title"`
	Description  string              `json:"description,omitempty"`
	CreatedAt    string              `json:"createdAt"`
	UpdatedAt    string              `json:"updatedAt"`
	Path         string              `json:"path"`
	Archived     bool                `json:"archived"`
	Creator      *Creator            `json:"creator,omitempty"`
	AgentBinding AgentBinding        `json:"agentBinding"`
	Repos        []TaskRepo          `json:"repos,omitempty"`
	Logs         []LogEntry          `json:"logs,omitempty"`
	LogPage      *LogPage            `json:"logPage,omitempty"`
	Files        []ResourceFile      `json:"files,omitempty"`
	Artifacts    []FileTreeEntry     `json:"artifacts"`
	Worktrees    []FileTreeEntry     `json:"worktrees"`
	Children     []ResourceTreeView  `json:"children,omitempty"`
	Templates    []TaskTemplate      `json:"templates,omitempty"`
	Template     *TaskTemplateSource `json:"template,omitempty"`
	Scheduler    *SchedulerConfig    `json:"scheduler,omitempty"`
}

type TaskTemplate struct {
	Name          string          `json:"name"`
	Path          string          `json:"path"`
	SchemaVersion int             `json:"schemaVersion"`
	Title         string          `json:"title"`
	Description   string          `json:"description,omitempty"`
	TaskTitle     string          `json:"taskTitle,omitempty"`
	Fields        []TemplateField `json:"fields"`
	Body          string          `json:"body,omitempty"`
	Detail        string          `json:"detail,omitempty"`
	Content       string          `json:"content,omitempty"`
	Digest        string          `json:"digest,omitempty"`
	Legacy        bool            `json:"legacy,omitempty"`
	Valid         bool            `json:"valid"`
	Errors        []TemplateIssue `json:"errors"`
	Warnings      []TemplateIssue `json:"warnings"`
}

type ResourceFile struct {
	Name        string `json:"name"`
	Path        string `json:"path,omitempty"`
	Content     string `json:"content"`
	ContentHash string `json:"contentHash"`
}

type FileTreeEntry struct {
	Name     string          `json:"name"`
	Path     string          `json:"path"`
	Type     string          `json:"type"`
	Size     int64           `json:"size,omitempty"`
	Modified string          `json:"modified,omitempty"`
	Children []FileTreeEntry `json:"children,omitempty"`
}

type resourceEntry struct {
	Resource Resource
	Path     string
}

const (
	maxFileTreeDepth   = 3
	maxFileTreeEntries = 200
)

func buildWorkspaceTreeAt(root string) (WorkspaceTree, error) {
	config, err := readWorkspaceConfig(root)
	if err != nil {
		return WorkspaceTree{}, err
	}
	projectEntries, err := readProjectEntriesInDirs([]string{root})
	if err != nil {
		return WorkspaceTree{}, err
	}
	schedulerConfig, err := readSchedulerJSON(schedulerJSONPath(root))
	if err != nil {
		return WorkspaceTree{}, err
	}
	projects := make([]ResourceTreeView, 0, len(projectEntries))
	for _, entry := range projectEntries {
		project, err := buildResourceTreeItem(root, resourceEntry{Resource: &entry.Project, Path: entry.Path}, true)
		if err != nil {
			return WorkspaceTree{}, err
		}
		projects = append(projects, project)
	}
	return WorkspaceTree{
		Root:    slash(root),
		Creator: config.Creator,
		Scheduler: ResourceTreeView{
			ID: SchedulerResourceID, Type: SchedulerResourceID, Title: "Scheduler",
			Path: schedulerDir, AgentBinding: schedulerConfig.AgentBinding,
		},
		Projects: projects,
		Wiki:     readWorkspaceWiki(root),
	}, nil
}

func readWorkspaceWiki(root string) WorkspaceWikiView {
	dir := filepath.Join(root, wikiDir)
	info, err := os.Lstat(dir)
	if os.IsNotExist(err) {
		return WorkspaceWikiView{Entries: []FileTreeEntry{}}
	}
	if err != nil {
		return WorkspaceWikiView{Entries: []FileTreeEntry{}, Error: err.Error()}
	}
	if info.Mode()&os.ModeSymlink != 0 {
		return WorkspaceWikiView{Exists: true, Entries: []FileTreeEntry{}, Error: "workspace wiki directory must not be a symbolic link"}
	}
	if !info.IsDir() {
		return WorkspaceWikiView{Exists: true, Entries: []FileTreeEntry{}, Error: "workspace wiki path is not a directory"}
	}
	count := 0
	entries, err := readFileTreeLimited(dir, dir, 0, &count)
	if err != nil {
		return WorkspaceWikiView{Exists: true, Entries: []FileTreeEntry{}, Error: err.Error()}
	}
	if entries == nil {
		entries = []FileTreeEntry{}
	}
	return WorkspaceWikiView{Exists: true, Entries: entries}
}

func buildResourceTreeItem(root string, entry resourceEntry, includeChildren bool) (ResourceTreeView, error) {
	meta := entry.Resource.resourceMeta()
	item := ResourceTreeView{
		ID:           meta.ID,
		Type:         meta.Type,
		Title:        meta.Title,
		Path:         relPath(root, entry.Path),
		Archived:     isArchivedPath(root, entry.Path),
		Creator:      meta.Creator,
		AgentBinding: meta.AgentBinding,
	}
	if includeChildren && isProject(entry.Resource) {
		children, err := projectChildTreeItems(root, entry)
		if err != nil {
			return ResourceTreeView{}, err
		}
		item.Children = children
	}
	return item, nil
}

func buildResourceDetailAt(root string, entry resourceEntry) (ResourceDetailView, error) {
	logs, err := readLogEntries(entry.Path)
	if err != nil {
		return ResourceDetailView{}, err
	}
	sortLogEntries(logs)
	return buildResourceDetailAtWithLogs(root, entry, logs)
}

func buildResourceDetailAtWithLogs(root string, entry resourceEntry, logs []LogEntry) (ResourceDetailView, error) {
	meta := entry.Resource.resourceMeta()
	detail := ResourceDetailView{
		ID:           meta.ID,
		Type:         meta.Type,
		Title:        meta.Title,
		CreatedAt:    meta.CreatedAt,
		UpdatedAt:    meta.UpdatedAt,
		Path:         relPath(root, entry.Path),
		Archived:     isArchivedPath(root, entry.Path),
		Creator:      meta.Creator,
		AgentBinding: meta.AgentBinding,
		Logs:         logs,
		Files:        readResourceFiles(root, entry.Path, entry.Resource),
		Artifacts:    readFileTree(root, filepath.Join(entry.Path, "artifacts")),
		Worktrees:    []FileTreeEntry{},
	}
	switch typed := entry.Resource.(type) {
	case *Project:
		detail.Description = typed.Description
		workspace := &Workspace{root: root}
		templates, err := workspace.Templates(typed.ID)
		if err == nil {
			detail.Templates = templates
		}
	case *Task:
		detail.Description = typed.Description
		detail.Repos = append([]TaskRepo(nil), typed.Repos...)
		detail.Template = typed.Template
		detail.Worktrees = readFileTree(root, filepath.Join(entry.Path, "worktree"))
	}
	if isProject(entry.Resource) {
		children, err := projectChildTreeItems(root, entry)
		if err != nil {
			return ResourceDetailView{}, err
		}
		detail.Children = children
	}
	return detail, nil
}

func projectChildTreeItems(root string, entry resourceEntry) ([]ResourceTreeView, error) {
	pattern := projectTaskName(entry.Resource.resourceMeta().ID)
	dirs := []string{entry.Path}
	childEntries, err := readTaskEntriesInDirs(dirs, pattern)
	if err != nil {
		return nil, err
	}
	children := make([]ResourceTreeView, 0, len(childEntries))
	for _, child := range childEntries {
		item, err := buildResourceTreeItem(root, resourceEntry{Resource: &child.Task, Path: child.Path}, false)
		if err != nil {
			return nil, err
		}
		children = append(children, item)
	}
	return children, nil
}

func readResourceFiles(root, dir string, resource Resource) []ResourceFile {
	names := []string{markdownFileName(resource)}
	names = append(names, "AGENTS.md")
	files := make([]ResourceFile, 0, len(names))
	for _, name := range names {
		data, err := os.ReadFile(filepath.Join(dir, name))
		if err != nil {
			continue
		}
		files = append(files, ResourceFile{
			Name:        name,
			Path:        relPath(root, filepath.Join(dir, name)),
			Content:     string(data),
			ContentHash: markdownContentHash(data),
		})
	}
	return files
}

func markdownContentHash(data []byte) string {
	digest := sha256.Sum256(data)
	return hex.EncodeToString(digest[:])
}

func readFileTree(root, dir string) []FileTreeEntry {
	count := 0
	entries, _ := readFileTreeLimited(root, dir, 0, &count)
	if entries == nil {
		return []FileTreeEntry{}
	}
	return entries
}

func readFileTreeLimited(root, dir string, depth int, count *int) ([]FileTreeEntry, error) {
	if depth > maxFileTreeDepth || *count >= maxFileTreeEntries {
		return nil, nil
	}
	entries, err := os.ReadDir(dir)
	if err != nil {
		return nil, err
	}
	tree := make([]FileTreeEntry, 0, len(entries))
	for _, entry := range entries {
		if *count >= maxFileTreeEntries {
			break
		}
		if skipFileTreeDir(entry) {
			continue
		}
		path := filepath.Join(dir, entry.Name())
		info, err := entry.Info()
		if err != nil {
			continue
		}
		*count++
		node := FileTreeEntry{
			Name: entry.Name(),
			Path: relPath(root, path),
			Type: "file",
		}
		if entry.IsDir() {
			node.Type = "directory"
			node.Children, _ = readFileTreeLimited(root, path, depth+1, count)
		} else {
			node.Size = info.Size()
		}
		node.Modified = info.ModTime().UTC().Format(time.RFC3339Nano)
		tree = append(tree, node)
	}
	return tree, nil
}

func skipFileTreeDir(entry os.DirEntry) bool {
	if !entry.IsDir() {
		return false
	}
	switch entry.Name() {
	case ".git", ".cache", ".next", "build", "dist", "node_modules", "vendor":
		return true
	default:
		return false
	}
}
