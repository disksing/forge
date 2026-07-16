package forge

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

type WorkspaceTree struct {
	Root     string             `json:"root"`
	Projects []ResourceTreeView `json:"projects"`
	Sessions []Session          `json:"sessions"`
}

type ResourceTreeView struct {
	ID       string             `json:"id"`
	Type     string             `json:"type"`
	Title    string             `json:"title"`
	Path     string             `json:"path"`
	Archived bool               `json:"archived"`
	Children []ResourceTreeView `json:"children,omitempty"`
}

type ResourceDetailView struct {
	ID                  string                  `json:"id"`
	Type                string                  `json:"type"`
	Title               string                  `json:"title"`
	Description         string                  `json:"description,omitempty"`
	CreatedAt           string                  `json:"createdAt"`
	UpdatedAt           string                  `json:"updatedAt"`
	Path                string                  `json:"path"`
	Archived            bool                    `json:"archived"`
	Repos               []TaskRepo              `json:"repos,omitempty"`
	AutoRun             *AutoRun                `json:"autoRun,omitempty"`
	AutoRunDependencies []AutoRunDependencyView `json:"autoRunDependencies,omitempty"`
	Logs                []LogEntry              `json:"logs,omitempty"`
	Files               []ResourceFile          `json:"files,omitempty"`
	Artifacts           []FileTreeEntry         `json:"artifacts"`
	Worktrees           []FileTreeEntry         `json:"worktrees"`
	Children            []ResourceTreeView      `json:"children,omitempty"`
	Templates           []TaskTemplate          `json:"templates,omitempty"`
}

type AutoRunDependencyView struct {
	TaskID     string `json:"taskId"`
	Generation int    `json:"generation"`
	State      string `json:"state"`
}

type TaskTemplate struct {
	Name    string `json:"name"`
	Path    string `json:"path"`
	Title   string `json:"title"`
	Detail  string `json:"detail"`
	AutoRun bool   `json:"autorun,omitempty"`
	AgentID string `json:"agentId,omitempty"`
	Prompt  string `json:"prompt,omitempty"`
	Content string `json:"content"`
}

type ResourceFile struct {
	Name    string `json:"name"`
	Path    string `json:"path,omitempty"`
	Content string `json:"content"`
}

type FileTreeEntry struct {
	Name     string          `json:"name"`
	Path     string          `json:"path"`
	Type     string          `json:"type"`
	Size     int64           `json:"size,omitempty"`
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
	}, nil
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
		if typed.AutoRun != nil {
			for _, dependency := range typed.AutoRun.After {
				detail.AutoRunDependencies = append(detail.AutoRunDependencies, AutoRunDependencyView{TaskID: dependency.TaskID, Generation: dependency.Generation, State: autoRunDependencyState(root, dependency)})
			}
		}
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
	dir := filepath.Join(projectDir, "templates")
	entries, err := os.ReadDir(dir)
	if err != nil {
		return []TaskTemplate{}
	}
	templates := make([]TaskTemplate, 0, len(entries))
	for _, entry := range entries {
		if entry.IsDir() || strings.ToLower(filepath.Ext(entry.Name())) != ".md" {
			continue
		}
		path := filepath.Join(dir, entry.Name())
		data, err := os.ReadFile(path)
		if err != nil {
			continue
		}
		template, err := parseTaskTemplate(strings.TrimSuffix(entry.Name(), filepath.Ext(entry.Name())), string(data))
		if err != nil {
			continue
		}
		template.Path = relPath(root, path)
		template.Content = string(data)
		templates = append(templates, template)
	}
	return templates
}

func parseTaskTemplate(name, content string) (TaskTemplate, error) {
	template := TaskTemplate{Name: name}
	normalized := strings.ReplaceAll(content, "\r\n", "\n")
	if !strings.HasPrefix(normalized, "---\n") {
		return template, fmt.Errorf("task template %s must start with YAML front matter", name)
	}
	end := strings.Index(normalized[4:], "\n---\n")
	if end < 0 {
		return template, fmt.Errorf("task template %s has unterminated YAML front matter", name)
	}
	frontMatter := normalized[4 : 4+end]
	template.Detail = strings.TrimLeft(normalized[4+end+5:], "\n")
	lines := strings.Split(frontMatter, "\n")
	for index := 0; index < len(lines); index++ {
		line := strings.TrimSpace(lines[index])
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		key, value, ok := strings.Cut(line, ":")
		if !ok {
			return template, fmt.Errorf("task template %s has invalid front matter line %q", name, line)
		}
		key = strings.TrimSpace(key)
		value = strings.TrimSpace(value)
		if value == "|" || value == ">" {
			var block []string
			for index+1 < len(lines) && (strings.HasPrefix(lines[index+1], "  ") || strings.TrimSpace(lines[index+1]) == "") {
				index++
				block = append(block, strings.TrimPrefix(lines[index], "  "))
			}
			value = strings.TrimRight(strings.Join(block, "\n"), "\n")
		}
		value = strings.Trim(value, `"'`)
		switch key {
		case "title":
			template.Title = value
		case "autorun":
			if value != "true" && value != "false" {
				return template, fmt.Errorf("task template %s has invalid autorun value", name)
			}
			template.AutoRun = value == "true"
		case "agent":
			template.AgentID = value
		case "prompt":
			template.Prompt = value
		default:
			return template, fmt.Errorf("task template %s has unknown field %q", name, key)
		}
	}
	if strings.TrimSpace(template.Title) == "" {
		return template, fmt.Errorf("task template %s requires title", name)
	}
	return template, nil
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
			Name:    name,
			Path:    relPath(root, filepath.Join(dir, name)),
			Content: string(data),
		})
	}
	return files
}

func readFileTree(root, dir string) []FileTreeEntry {
	count := 0
	entries := readFileTreeLimited(root, dir, 0, &count)
	if entries == nil {
		return []FileTreeEntry{}
	}
	return entries
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
