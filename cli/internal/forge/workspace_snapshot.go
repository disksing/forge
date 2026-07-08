package forge

import (
	"errors"
	"os"
	"path/filepath"
	"strings"
)

type WorkspaceTree struct {
	Root     string             `json:"root"`
	Projects []ResourceTreeItem `json:"projects"`
	Sessions []Session          `json:"sessions"`
}

type ResourceTreeItem struct {
	ID       string             `json:"id"`
	Type     string             `json:"type"`
	Title    string             `json:"title"`
	Path     string             `json:"path"`
	Archived bool               `json:"archived"`
	Children []ResourceTreeItem `json:"children,omitempty"`
}

type ResourceDetail struct {
	ID          string             `json:"id"`
	Type        string             `json:"type"`
	Title       string             `json:"title"`
	Description string             `json:"description,omitempty"`
	Workflow    string             `json:"workflow,omitempty"`
	CreatedAt   string             `json:"createdAt"`
	UpdatedAt   string             `json:"updatedAt"`
	Path        string             `json:"path"`
	Archived    bool               `json:"archived"`
	Repos       []TaskRepo         `json:"repos,omitempty"`
	Logs        []LogEntry         `json:"logs,omitempty"`
	Files       []ResourceFile     `json:"files,omitempty"`
	Artifacts   []FileTreeEntry    `json:"artifacts,omitempty"`
	Worktrees   []FileTreeEntry    `json:"worktrees,omitempty"`
	Children    []ResourceTreeItem `json:"children,omitempty"`
}

type ResourceFile struct {
	Name    string `json:"name"`
	Content string `json:"content"`
}

type FileTreeEntry struct {
	Name     string          `json:"name"`
	Path     string          `json:"path"`
	Type     string          `json:"type"`
	Size     int64           `json:"size,omitempty"`
	Children []FileTreeEntry `json:"children,omitempty"`
}

const (
	maxFileTreeDepth   = 3
	maxFileTreeEntries = 200
)

func workspaceTreeJSON() error {
	tree, err := buildWorkspaceTree()
	if err != nil {
		return err
	}
	return printJSON(tree)
}

func workspaceResourceJSON(id string) error {
	detail, err := buildResourceDetail(id)
	if err != nil {
		return err
	}
	return printJSON(detail)
}

func buildWorkspaceTree() (WorkspaceTree, error) {
	root, err := findWorkspaceRoot()
	if err != nil {
		return WorkspaceTree{}, err
	}
	projectEntries, err := readTaskEntriesInDirs([]string{root}, topProjectName)
	if err != nil {
		return WorkspaceTree{}, err
	}
	projects := make([]ResourceTreeItem, 0, len(projectEntries))
	for _, entry := range projectEntries {
		project, err := buildResourceTreeItem(root, entry, true)
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
	}, nil
}

func buildResourceDetail(id string) (ResourceDetail, error) {
	root, err := findWorkspaceRoot()
	if err != nil {
		return ResourceDetail{}, err
	}
	path, task, err := loadTask(root, cleanID(id))
	if err != nil {
		return ResourceDetail{}, err
	}
	return buildResourceDetailAt(root, taskListEntry{Task: task, Path: path})
}

func buildResourceTreeItem(root string, entry taskListEntry, includeChildren bool) (ResourceTreeItem, error) {
	task := entry.Task
	item := ResourceTreeItem{
		ID:       task.ID,
		Type:     task.Type,
		Title:    task.Title,
		Path:     relPath(root, entry.Path),
		Archived: isArchivedPath(root, entry.Path),
	}
	if includeChildren && isProject(task) {
		children, err := projectChildTreeItems(root, entry)
		if err != nil {
			return ResourceTreeItem{}, err
		}
		item.Children = children
	}
	return item, nil
}

func buildResourceDetailAt(root string, entry taskListEntry) (ResourceDetail, error) {
	task := entry.Task
	logs, err := readLogEntries(entry.Path)
	if err != nil {
		return ResourceDetail{}, err
	}
	sortLogEntries(logs)
	detail := ResourceDetail{
		ID:          task.ID,
		Type:        task.Type,
		Title:       task.Title,
		Description: task.Description,
		Workflow:    task.Workflow,
		CreatedAt:   task.CreatedAt,
		UpdatedAt:   task.UpdatedAt,
		Path:        relPath(root, entry.Path),
		Archived:    isArchivedPath(root, entry.Path),
		Repos:       append([]TaskRepo(nil), task.Repos...),
		Logs:        logs,
		Files:       readResourceFiles(entry.Path, task),
		Artifacts:   readFileTree(root, filepath.Join(entry.Path, "artifacts")),
	}
	if !isProject(task) {
		detail.Worktrees = readFileTree(root, filepath.Join(entry.Path, "worktree"))
	}
	if isProject(task) {
		children, err := projectChildTreeItems(root, entry)
		if err != nil {
			return ResourceDetail{}, err
		}
		detail.Children = children
	}
	return detail, nil
}

func projectChildTreeItems(root string, entry taskListEntry) ([]ResourceTreeItem, error) {
	pattern := projectTaskName(entry.Task.ID)
	dirs := []string{entry.Path}
	childEntries, err := readTaskEntriesInDirs(dirs, pattern)
	if err != nil {
		return nil, err
	}
	children := make([]ResourceTreeItem, 0, len(childEntries))
	for _, child := range childEntries {
		item, err := buildResourceTreeItem(root, child, false)
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

func readResourceFiles(dir string, task Task) []ResourceFile {
	names := []string{markdownFileName(task), "work.md", "AGENTS.md"}
	files := make([]ResourceFile, 0, len(names))
	for _, name := range names {
		data, err := os.ReadFile(filepath.Join(dir, name))
		if err != nil {
			continue
		}
		files = append(files, ResourceFile{Name: name, Content: string(data)})
	}
	return files
}

func readFileTree(root, dir string) []FileTreeEntry {
	count := 0
	return readFileTreeLimited(root, dir, 0, &count)
}

func readFileTreeLimited(root, dir string, depth int, count *int) []FileTreeEntry {
	if depth > maxFileTreeDepth || *count >= maxFileTreeEntries {
		return nil
	}
	entries, err := os.ReadDir(dir)
	if err != nil {
		return nil
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
			node.Children = readFileTreeLimited(root, path, depth+1, count)
		} else {
			node.Size = info.Size()
		}
		tree = append(tree, node)
	}
	return tree
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
