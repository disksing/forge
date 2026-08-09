package forge

import (
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/disksing/forge/internal/app"
)

type WorkspaceTree struct {
	Root     string             `json:"root"`
	Projects []ResourceTreeView `json:"projects"`
	Sessions []Session          `json:"sessions"`
	Wiki     WorkspaceWikiView  `json:"wiki"`
}

type WorkspaceWikiView struct {
	Exists  bool            `json:"exists"`
	Entries []FileTreeEntry `json:"entries"`
	Error   string          `json:"error,omitempty"`
}

type ResourceTreeView struct {
	ID       string             `json:"id"`
	Type     string             `json:"type"`
	Title    string             `json:"title"`
	Path     string             `json:"path"`
	Archived bool               `json:"archived"`
	AutoRun  *AutoRunTreeView   `json:"autoRun,omitempty"`
	Children []ResourceTreeView `json:"children,omitempty"`
}

type AutoRunTreeView struct {
	Generation int    `json:"generation"`
	State      string `json:"state"`
}

type ResourceDetailView struct {
	ID          string                  `json:"id"`
	Type        string                  `json:"type"`
	Title       string                  `json:"title"`
	Description string                  `json:"description,omitempty"`
	CreatedAt   string                  `json:"createdAt"`
	UpdatedAt   string                  `json:"updatedAt"`
	Path        string                  `json:"path"`
	Archived    bool                    `json:"archived"`
	Repos       []TaskRepo              `json:"repos,omitempty"`
	AutoRun     *AutoRun                `json:"autoRun,omitempty"`
	Logs        []LogEntry              `json:"logs,omitempty"`
	Files       []ResourceFile          `json:"files,omitempty"`
	Artifacts   []FileTreeEntry         `json:"artifacts"`
	Worktrees   []FileTreeEntry         `json:"worktrees"`
	Children    []ResourceTreeView      `json:"children,omitempty"`
	Templates   []TaskTemplate          `json:"templates,omitempty"`
	Template    *app.TaskTemplateSource `json:"template,omitempty"`
}

type TaskTemplate = app.TaskTemplate

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

func workspaceTreeJSON() error {
	return applicationWorkspaceTreeJSON()
}

func workspaceResourceJSON(id string) error {
	return applicationWorkspaceResourceJSON(id)
}

func buildWorkspaceTree() (WorkspaceTree, error) {
	root, err := findWorkspaceRoot()
	if err != nil {
		return WorkspaceTree{}, err
	}
	projectEntries, err := readProjectEntriesInDirs([]string{root})
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
	sessions, err := activeSessions(root)
	if err != nil {
		return WorkspaceTree{}, err
	}
	return WorkspaceTree{
		Root:     slash(root),
		Projects: projects,
		Sessions: sessions,
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

func buildResourceDetail(id string) (ResourceDetailView, error) {
	root, err := findWorkspaceRoot()
	if err != nil {
		return ResourceDetailView{}, err
	}
	path, resource, err := loadResource(root, cleanID(id))
	if err != nil {
		return ResourceDetailView{}, err
	}
	return buildResourceDetailAt(root, resourceEntry{Resource: resource, Path: path})
}

func buildResourceTreeItem(root string, entry resourceEntry, includeChildren bool) (ResourceTreeView, error) {
	meta := entry.Resource.resourceMeta()
	item := ResourceTreeView{
		ID:       meta.ID,
		Type:     meta.Type,
		Title:    meta.Title,
		Path:     relPath(root, entry.Path),
		Archived: isArchivedPath(root, entry.Path),
	}
	if task, ok := entry.Resource.(*Task); ok && task.AutoRun != nil {
		item.AutoRun = &AutoRunTreeView{Generation: task.AutoRun.Generation, State: task.AutoRun.State}
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
	meta := entry.Resource.resourceMeta()
	logs, err := readLogEntries(entry.Path)
	if err != nil {
		return ResourceDetailView{}, err
	}
	sortLogEntries(logs)
	detail := ResourceDetailView{
		ID:        meta.ID,
		Type:      meta.Type,
		Title:     meta.Title,
		CreatedAt: meta.CreatedAt,
		UpdatedAt: meta.UpdatedAt,
		Path:      relPath(root, entry.Path),
		Archived:  isArchivedPath(root, entry.Path),
		Logs:      logs,
		Files:     readResourceFiles(root, entry.Path, entry.Resource),
		Artifacts: readFileTree(root, filepath.Join(entry.Path, "artifacts")),
		Worktrees: []FileTreeEntry{},
	}
	switch typed := entry.Resource.(type) {
	case *Project:
		detail.Description = typed.Description
		detail.Templates = readTaskTemplates(root, entry.Path)
	case *Task:
		detail.Description = typed.Description
		detail.Repos = append([]TaskRepo(nil), typed.Repos...)
		detail.AutoRun = typed.AutoRun
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

func readTaskTemplates(root, projectDir string) []TaskTemplate {
	var project Project
	if err := readProjectAtDir(projectDir, &project); err != nil {
		return []TaskTemplate{}
	}
	workspace, err := app.OpenWorkspace(root)
	if err != nil {
		return []TaskTemplate{}
	}
	templates, err := workspace.Templates(project.ID)
	if err != nil {
		return []TaskTemplate{}
	}
	return templates
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

func parseWorkspaceResourceArgs(args []string) (string, error) {
	if len(args) < 2 || len(args) > 3 {
		return "", errors.New("usage: forge workspace resource --id=<resource> --json")
	}
	var id string
	for i := 0; i < len(args); i++ {
		arg := args[i]
		switch {
		case strings.HasPrefix(arg, "--id="):
			id = strings.TrimSpace(strings.TrimPrefix(arg, "--id="))
		case arg == "--id":
			value, ok := nextFlagValue(args, &i)
			if !ok {
				return "", errors.New("usage: forge workspace resource --id=<resource> --json")
			}
			id = strings.TrimSpace(value)
		case arg == "--json":
		default:
			return "", errors.New("usage: forge workspace resource --id=<resource> --json")
		}
	}
	if id == "" {
		return "", errors.New("usage: forge workspace resource --id=<resource> --json")
	}
	return id, nil
}

func readResourceFiles(root, dir string, resource Resource) []ResourceFile {
	names := []string{markdownFileName(resource)}
	if !isProject(resource) {
		names = append(names, "work.md")
	}
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

func activeSessions(root string) ([]Session, error) {
	var sessions []Session
	err := withLockedSessionStore(root, func(store *SessionStore) error {
		pruneStaleSessions(store)
		sessions = append([]Session(nil), store.Sessions...)
		sortSessions(sessions)
		return nil
	})
	if err != nil {
		if strings.Contains(err.Error(), "could not find AgentWorkspace root") {
			return nil, nil
		}
		return nil, err
	}
	if sessions == nil {
		sessions = []Session{}
	}
	return sessions, nil
}
