// Package app contains the in-process Forge application API.
//
// The API is deliberately rooted in a Workspace handle. Callers must open a
// Workspace explicitly and may then reuse the handle from concurrent
// goroutines. It never selects a Workspace from the process working directory
// and it never writes user-facing output.
package app

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"
)

// APIError describes a failed application operation without requiring callers
// to parse CLI output. The underlying error remains available through Unwrap.
type APIError struct {
	Operation  string
	Kind       string
	Workspace  string
	ResourceID string
	Path       string
	Err        error
}

func (e *APIError) Error() string {
	if e == nil {
		return "<nil>"
	}
	message := e.Operation
	if message == "" {
		message = "Forge application operation"
	}
	if e.Err != nil {
		message += ": " + e.Err.Error()
	}
	return message
}

func (e *APIError) Unwrap() error {
	if e == nil {
		return nil
	}
	return e.Err
}

// IsKind reports whether err, or one of its wrapped errors, is an API error of
// the requested kind.
func IsKind(err error, kind string) bool {
	var apiErr *APIError
	return errors.As(err, &apiErr) && apiErr.Kind == kind
}

// Workspace is a reusable, explicitly rooted Forge application handle.
// Workspace values are immutable and safe to share between goroutines. The
// underlying persistent locks are acquired for each operation, so a handle
// does not keep a process-global mutable store open.
type Workspace struct {
	root string
}

// OpenWorkspace validates and canonicalizes root without consulting cwd.
func OpenWorkspace(root string) (*Workspace, error) {
	root = strings.TrimSpace(root)
	if root == "" {
		return nil, &APIError{Operation: "open Workspace", Kind: "workspace", Err: errors.New("workspace root is required")}
	}
	abs, err := filepath.Abs(root)
	if err != nil {
		return nil, &APIError{Operation: "open Workspace", Kind: "workspace", Path: root, Err: err}
	}
	abs = filepath.Clean(abs)
	canonical, err := canonicalWorkspaceRoot(abs)
	if err != nil {
		return nil, &APIError{Operation: "open Workspace", Kind: "workspace", Path: abs, Err: err}
	}
	if !isDir(canonical) {
		return nil, &APIError{Operation: "open Workspace", Kind: "workspace", Workspace: canonical, Path: canonical, Err: errors.New("workspace root is not a directory")}
	}
	if !pathExists(filepath.Join(canonical, configFile)) && !isDir(filepath.Join(canonical, reposDir)) {
		return nil, &APIError{Operation: "open Workspace", Kind: "workspace", Workspace: canonical, Path: canonical, Err: errors.New("could not find AgentWorkspace root; run forge init first")}
	}
	return &Workspace{root: canonical}, nil
}

func canonicalWorkspaceRoot(root string) (string, error) {
	canonical, err := filepath.EvalSymlinks(root)
	if err == nil {
		return filepath.Clean(canonical), nil
	}
	if !os.IsNotExist(err) {
		return "", err
	}
	return filepath.Clean(root), nil
}

// Initialize creates a Workspace at an explicit path. It does not use or
// change the process working directory and returns an opened handle after the
// durable files have been written.
func Initialize(root, language string) (*Workspace, error) {
	root = strings.TrimSpace(root)
	if root == "" {
		return nil, &APIError{Operation: "initialize Workspace", Kind: "workspace", Err: errors.New("workspace root is required")}
	}
	abs, err := filepath.Abs(root)
	if err != nil {
		return nil, &APIError{Operation: "initialize Workspace", Kind: "workspace", Path: root, Err: err}
	}
	abs = filepath.Clean(abs)
	if existing, err := findEnclosingWorkspaceRoot(abs); err != nil {
		return nil, &APIError{Operation: "initialize Workspace", Kind: "workspace", Path: abs, Err: err}
	} else if existing != "" {
		return nil, &APIError{Operation: "initialize Workspace", Kind: "workspace", Workspace: existing, Path: abs, Err: fmt.Errorf("cannot initialize workspace inside existing workspace: %s", existing)}
	}
	language, err = normalizeLanguage(strings.TrimSpace(language))
	if err != nil {
		return nil, &APIError{Operation: "initialize Workspace", Kind: "workspace", Path: abs, Err: err}
	}
	if err := os.MkdirAll(filepath.Join(abs, reposDir), 0o755); err != nil {
		return nil, &APIError{Operation: "initialize Workspace", Kind: "workspace", Path: abs, Err: err}
	}
	if err := os.MkdirAll(filepath.Join(abs, archiveDir), 0o755); err != nil {
		return nil, &APIError{Operation: "initialize Workspace", Kind: "workspace", Path: abs, Err: err}
	}
	config := Config{Version: 1, Language: language}
	if err := readJSON(filepath.Join(abs, configFile), &config); err != nil && !os.IsNotExist(err) {
		return nil, &APIError{Operation: "initialize Workspace", Kind: "workspace", Path: abs, Err: err}
	}
	config.Version, config.Language = 1, language
	if err := writeJSON(filepath.Join(abs, configFile), config); err != nil {
		return nil, &APIError{Operation: "initialize Workspace", Kind: "workspace", Path: abs, Err: err}
	}
	if err := ensureWorkspaceWiki(abs, language); err != nil {
		return nil, &APIError{Operation: "initialize Workspace", Kind: "workspace", Path: abs, Err: err}
	}
	if err := updateAgentsMD(filepath.Join(abs, "AGENTS.md"), language); err != nil {
		return nil, &APIError{Operation: "initialize Workspace", Kind: "workspace", Path: abs, Err: err}
	}
	if err := updateOpenTaskAgentsMD(abs, language); err != nil {
		return nil, &APIError{Operation: "initialize Workspace", Kind: "workspace", Path: abs, Err: err}
	}
	return OpenWorkspace(abs)
}

// Migrate refreshes managed Workspace guidance using an explicit root.
func (w *Workspace) Migrate(language string) error {
	if err := w.require(); err != nil {
		return err
	}
	err := withWorkspaceMutationLock(w.root, func() error { return w.migrate(language) })
	if err != nil {
		var apiErr *APIError
		if errors.As(err, &apiErr) {
			return err
		}
		return &APIError{Operation: "migrate Workspace", Kind: "workspace", Workspace: w.root, Err: err}
	}
	return nil
}

func (w *Workspace) migrate(language string) error {
	if err := w.require(); err != nil {
		return err
	}
	config, err := readWorkspaceConfig(w.root)
	if err != nil {
		return &APIError{Operation: "migrate Workspace", Kind: "workspace", Workspace: w.root, Err: err}
	}
	if strings.TrimSpace(language) == "" {
		language = config.Language
	}
	language, err = normalizeLanguage(language)
	if err != nil {
		return &APIError{Operation: "migrate Workspace", Kind: "workspace", Workspace: w.root, Err: err}
	}
	if err := ensureWorkspaceWiki(w.root, language); err != nil {
		return &APIError{Operation: "migrate Workspace", Kind: "workspace", Workspace: w.root, Err: err}
	}
	if err := updateAgentsMD(filepath.Join(w.root, "AGENTS.md"), language); err != nil {
		return &APIError{Operation: "migrate Workspace", Kind: "workspace", Workspace: w.root, Err: err}
	}
	if err := updateOpenTaskAgentsMD(w.root, language); err != nil {
		return &APIError{Operation: "migrate Workspace", Kind: "workspace", Workspace: w.root, Err: err}
	}
	config.Version, config.Language = 1, language
	if err := writeJSON(filepath.Join(w.root, configFile), config); err != nil {
		return &APIError{Operation: "migrate Workspace", Kind: "workspace", Workspace: w.root, Err: err}
	}
	return nil
}

// Root returns the canonical absolute root selected when the handle was
// opened.
func (w *Workspace) Root() string {
	if w == nil {
		return ""
	}
	return w.root
}

func (w *Workspace) require() error {
	if w == nil || strings.TrimSpace(w.root) == "" {
		return &APIError{Operation: "use Workspace", Kind: "workspace", Err: errors.New("Workspace handle is nil")}
	}
	return nil
}

// ResourceResult contains the typed resource selected by an id and its
// Workspace-relative path. Exactly one of Project or Task is non-nil.
type ResourceResult struct {
	Project  *Project
	Task     *Task
	Path     string
	Archived bool
}

func (r ResourceResult) Resource() Resource {
	if r.Project != nil {
		return r.Project
	}
	if r.Task != nil {
		return r.Task
	}
	return nil
}

// ProjectListEntry is a typed project listing result.
type ProjectListEntry struct {
	Project  Project
	Path     string
	Archived bool
}

// TaskListEntry is a typed task listing result.
type TaskListEntry struct {
	Task     Task
	Path     string
	Archived bool
}

// RunnableTask is the typed AutoRun scheduler projection.
type RunnableTask struct {
	ID                     string
	Path                   string
	Title                  string
	Generation             int
	State                  string
	Ready                  bool
	Reason                 string
	Prompt                 string
	PreferredAgentProfiles []string
	SuspendedAt            string
	SuspensionSummary      string
}

// TaskListOptions controls project task listing.
type TaskListOptions struct {
	ProjectID       string
	IncludeArchived bool
	Runnable        bool
}

// TaskListResult preserves both the ordinary typed task list and the runnable
// AutoRun projection. Only the relevant slice is populated for a request.
type TaskListResult struct {
	Tasks    []TaskListEntry
	Runnable []RunnableTask
}

// CreateTaskInput contains all typed inputs needed to create a task.
type CreateTaskInput struct {
	ProjectID              string
	Title                  string
	Detail                 string
	CompleteMarkdown       string
	CompleteMarkdownSet    bool
	Slug                   string
	AutoRun                bool
	PreferredAgentProfiles []string
	Prompt                 string
}

// ArchiveResult describes an archive operation without relying on printed
// paths.
type ArchiveResult struct {
	ResourceID string
	Path       string
}

// Tree returns the complete Workspace tree using the persistent session lock
// and the same pruning semantics as the CLI.
func (w *Workspace) Tree() (WorkspaceTree, error) {
	if err := w.require(); err != nil {
		return WorkspaceTree{}, err
	}
	tree, err := buildWorkspaceTreeAt(w.root)
	if err != nil {
		return WorkspaceTree{}, &APIError{Operation: "read Workspace tree", Kind: "tree", Workspace: w.root, Err: err}
	}
	return tree, nil
}

// Resource returns detailed resource data for GUI and service consumers.
func (w *Workspace) Resource(id string) (ResourceDetailView, error) {
	if err := w.require(); err != nil {
		return ResourceDetailView{}, err
	}
	path, resource, err := loadResource(w.root, cleanID(id))
	if err != nil {
		return ResourceDetailView{}, &APIError{Operation: "read resource", Kind: "resource", Workspace: w.root, ResourceID: id, Err: err}
	}
	detail, err := buildResourceDetailAt(w.root, resourceEntry{Resource: resource, Path: path})
	if err != nil {
		return ResourceDetailView{}, &APIError{Operation: "read resource detail", Kind: "resource", Workspace: w.root, ResourceID: id, Path: relPath(w.root, path), Err: err}
	}
	return detail, nil
}

// ResourceValue returns the stored Project or Task value and its path.
func (w *Workspace) ResourceValue(id string) (ResourceResult, error) {
	if err := w.require(); err != nil {
		return ResourceResult{}, err
	}
	path, resource, err := loadResource(w.root, cleanID(id))
	if err != nil {
		return ResourceResult{}, &APIError{Operation: "read resource", Kind: "resource", Workspace: w.root, ResourceID: id, Err: err}
	}
	result := ResourceResult{Path: relPath(w.root, path), Archived: isArchivedPath(w.root, path)}
	switch typed := resource.(type) {
	case *Project:
		result.Project = typed
	case *Task:
		result.Task = typed
	default:
		return ResourceResult{}, &APIError{Operation: "read resource", Kind: "resource", Workspace: w.root, ResourceID: id, Err: fmt.Errorf("unsupported resource type %T", resource)}
	}
	return result, nil
}

// Projects lists open projects, optionally including archived projects.
func (w *Workspace) Projects(includeArchived bool) ([]ProjectListEntry, error) {
	if err := w.require(); err != nil {
		return nil, err
	}
	dirs := []string{w.root}
	if includeArchived {
		dirs = append(dirs, filepath.Join(w.root, archiveDir))
	}
	entries, err := readProjectEntriesInDirs(dirs)
	if err != nil {
		return nil, &APIError{Operation: "list projects", Kind: "project", Workspace: w.root, Err: err}
	}
	result := make([]ProjectListEntry, 0, len(entries))
	for _, entry := range entries {
		result = append(result, ProjectListEntry{Project: entry.Project, Path: relPath(w.root, entry.Path), Archived: isArchivedPath(w.root, entry.Path)})
	}
	return result, nil
}

// Tasks lists tasks for one explicit project. A project id is required so the
// service never needs to infer a resource from cwd.
func (w *Workspace) Tasks(options TaskListOptions) (TaskListResult, error) {
	if err := w.require(); err != nil {
		return TaskListResult{}, err
	}
	parentID := strings.TrimSpace(options.ProjectID)
	if parentID == "" {
		return TaskListResult{}, &APIError{Operation: "list tasks", Kind: "task", Workspace: w.root, Err: errors.New("project id is required")}
	}
	parentPath, err := findResourceDir(w.root, parentID)
	if err != nil {
		return TaskListResult{}, &APIError{Operation: "list tasks", Kind: "task", Workspace: w.root, ResourceID: parentID, Err: err}
	}
	dirs := []string{parentPath}
	if options.IncludeArchived {
		dirs = append(dirs, filepath.Join(parentPath, archiveDir))
	}
	entries, err := readTaskEntriesInDirs(dirs, projectTaskName(parentID))
	if err != nil {
		return TaskListResult{}, &APIError{Operation: "list tasks", Kind: "task", Workspace: w.root, ResourceID: parentID, Err: err}
	}
	if !options.Runnable {
		result := TaskListResult{Tasks: make([]TaskListEntry, 0, len(entries))}
		for _, entry := range entries {
			result.Tasks = append(result.Tasks, TaskListEntry{Task: entry.Task, Path: relPath(w.root, entry.Path), Archived: isArchivedPath(w.root, entry.Path)})
		}
		return result, nil
	}
	result := TaskListResult{Runnable: make([]RunnableTask, 0, len(entries))}
	for _, entry := range entries {
		if entry.Task.AutoRun == nil {
			continue
		}
		ready, reason := autoRunReady(entry.Task)
		if isArchivedPath(w.root, entry.Path) {
			ready, reason = false, "archived"
		}
		if !ready {
			continue
		}
		runnable := RunnableTask{
			ID: entry.Task.ID, Path: relPath(w.root, entry.Path), Title: entry.Task.Title,
			Ready: ready, Reason: reason, Generation: entry.Task.AutoRun.Generation,
			State: entry.Task.AutoRun.State, Prompt: entry.Task.AutoRun.Prompt,
			PreferredAgentProfiles: append([]string(nil), entry.Task.AutoRun.PreferredAgentProfiles...),
			SuspendedAt:            entry.Task.AutoRun.SuspendedAt,
			SuspensionSummary:      entry.Task.AutoRun.SuspensionSummary,
		}
		result.Runnable = append(result.Runnable, runnable)
	}
	return result, nil
}

// CreateProject creates and returns a typed Project.
func (w *Workspace) CreateProject(description, slug string) (Project, error) {
	if err := w.require(); err != nil {
		return Project{}, err
	}
	var project Project
	err := withWorkspaceMutationLock(w.root, func() error {
		var err error
		project, err = w.createProject(description, slug)
		return err
	})
	if err != nil {
		var apiErr *APIError
		if errors.As(err, &apiErr) {
			return Project{}, err
		}
		return Project{}, &APIError{Operation: "create project", Kind: "project", Workspace: w.root, Err: err}
	}
	return project, nil
}

func (w *Workspace) createProject(description, slug string) (Project, error) {
	if err := w.require(); err != nil {
		return Project{}, err
	}
	description = strings.TrimSpace(description)
	if description == "" {
		return Project{}, &APIError{Operation: "create project", Kind: "project", Workspace: w.root, Err: errors.New("description cannot be empty")}
	}
	slug, err := normalizeResourceSlug(slug)
	if err != nil {
		return Project{}, &APIError{Operation: "create project", Kind: "project", Workspace: w.root, Err: err}
	}
	id, err := nextProjectID(w.root)
	if err != nil {
		return Project{}, &APIError{Operation: "create project", Kind: "project", Workspace: w.root, Err: err}
	}
	project := newProject(id, titleFromDescription(description), description)
	language, err := workspaceLanguage(w.root)
	if err != nil {
		return Project{}, &APIError{Operation: "create project", Kind: "project", Workspace: w.root, Err: err}
	}
	path := filepath.Join(w.root, projectDirectoryName(id, slug))
	if err := createResourceFiles(path, &project, language); err != nil {
		return Project{}, &APIError{Operation: "create project", Kind: "project", Workspace: w.root, ResourceID: id, Path: relPath(w.root, path), Err: err}
	}
	return project, nil
}

// CreateTask creates and returns a typed Task.
func (w *Workspace) CreateTask(input CreateTaskInput) (Task, error) {
	if err := w.require(); err != nil {
		return Task{}, err
	}
	var task Task
	err := withWorkspaceMutationLock(w.root, func() error {
		var err error
		task, err = w.createTask(input)
		return err
	})
	if err != nil {
		var apiErr *APIError
		if errors.As(err, &apiErr) {
			return Task{}, err
		}
		return Task{}, &APIError{Operation: "create task", Kind: "task", Workspace: w.root, Err: err}
	}
	return task, nil
}

func (w *Workspace) createTask(input CreateTaskInput) (Task, error) {
	if err := w.require(); err != nil {
		return Task{}, err
	}
	parentID := strings.TrimSpace(input.ProjectID)
	title := strings.TrimSpace(input.Title)
	if parentID == "" {
		return Task{}, &APIError{Operation: "create task", Kind: "task", Workspace: w.root, Err: errors.New("project id is required")}
	}
	if title == "" {
		return Task{}, &APIError{Operation: "create task", Kind: "task", Workspace: w.root, Err: errors.New("title cannot be empty")}
	}
	slug, err := normalizeResourceSlug(input.Slug)
	if err != nil {
		return Task{}, &APIError{Operation: "create task", Kind: "task", Workspace: w.root, Err: err}
	}
	parentPath, err := findResourceDir(w.root, parentID)
	if err != nil {
		return Task{}, &APIError{Operation: "create task", Kind: "task", Workspace: w.root, ResourceID: parentID, Err: err}
	}
	if isArchivedPath(w.root, parentPath) {
		return Task{}, &APIError{Operation: "create task", Kind: "task", Workspace: w.root, ResourceID: parentID, Err: fmt.Errorf("cannot create task under archived project: %s", parentID)}
	}
	var parent Project
	if err := readProjectAtDir(parentPath, &parent); err != nil {
		return Task{}, &APIError{Operation: "create task", Kind: "task", Workspace: w.root, ResourceID: parentID, Err: err}
	}
	id, err := nextProjectTaskID(parentPath, parentID)
	if err != nil {
		return Task{}, &APIError{Operation: "create task", Kind: "task", Workspace: w.root, ResourceID: parentID, Err: err}
	}
	path := filepath.Join(parentPath, taskDirectoryName(id, slug))
	staging := filepath.Join(parentPath, fmt.Sprintf(".forge-create-%s-%d", strings.ReplaceAll(id, ".", "-"), time.Now().UnixNano()))
	defer os.RemoveAll(staging)
	task := newTask(id, parentID, title, "")
	language, err := workspaceLanguage(w.root)
	if err != nil {
		return Task{}, &APIError{Operation: "create task", Kind: "task", Workspace: w.root, ResourceID: id, Err: err}
	}
	if input.AutoRun {
		profiles, err := normalizeAgentProfiles(input.PreferredAgentProfiles)
		if err != nil {
			return Task{}, &APIError{Operation: "create task", Kind: "task", Workspace: w.root, ResourceID: id, Err: err}
		}
		task.AutoRun = &AutoRun{Generation: 1, State: autoRunStateQueued, PreferredAgentProfiles: profiles, Prompt: strings.TrimSpace(input.Prompt)}
	} else if len(input.PreferredAgentProfiles) > 0 || strings.TrimSpace(input.Prompt) != "" {
		return Task{}, &APIError{Operation: "create task", Kind: "task", Workspace: w.root, ResourceID: id, Err: errors.New("--agent-profile and --prompt require --autorun")}
	}
	markdown := taskMarkdown(title, strings.TrimSpace(input.Detail), language)
	if input.CompleteMarkdownSet {
		markdown = input.CompleteMarkdown
	}
	if err := createResourceFilesWithMarkdown(staging, &task, markdown, language); err != nil {
		return Task{}, &APIError{Operation: "create task", Kind: "task", Workspace: w.root, ResourceID: id, Path: relPath(w.root, path), Err: err}
	}
	if task.AutoRun != nil {
		if err := prependLogEntry(staging, newAutoRunLogEntry("Auto Run queued", "", task.AutoRun.Generation)); err != nil {
			return Task{}, &APIError{Operation: "create task", Kind: "task", Workspace: w.root, ResourceID: id, Err: err}
		}
	}
	if err := os.Rename(staging, path); err != nil {
		return Task{}, &APIError{Operation: "create task", Kind: "task", Workspace: w.root, ResourceID: id, Path: relPath(w.root, path), Err: err}
	}
	return task, nil
}

// ArchiveResource moves an open project or task into its archive and returns
// the resulting Workspace-relative path.
func (w *Workspace) ArchiveResource(id string) (ArchiveResult, error) {
	if err := w.require(); err != nil {
		return ArchiveResult{}, err
	}
	var result ArchiveResult
	err := withWorkspaceMutationLock(w.root, func() error {
		var err error
		result, err = w.archiveResource(id)
		return err
	})
	if err != nil {
		var apiErr *APIError
		if errors.As(err, &apiErr) {
			return ArchiveResult{}, err
		}
		return ArchiveResult{}, &APIError{Operation: "archive resource", Kind: "resource", Workspace: w.root, ResourceID: id, Err: err}
	}
	return result, nil
}

func (w *Workspace) archiveResource(id string) (ArchiveResult, error) {
	if err := w.require(); err != nil {
		return ArchiveResult{}, err
	}
	cleanID := cleanID(id)
	src, resource, err := loadOpenResource(w.root, cleanID)
	if err != nil {
		return ArchiveResult{}, &APIError{Operation: "archive resource", Kind: "resource", Workspace: w.root, ResourceID: cleanID, Err: err}
	}
	dst, err := resourceArchiveDestination(w.root, src, resource)
	if err != nil {
		return ArchiveResult{}, &APIError{Operation: "archive resource", Kind: "resource", Workspace: w.root, ResourceID: cleanID, Err: err}
	}
	if pathExists(dst) {
		return ArchiveResult{}, &APIError{Operation: "archive resource", Kind: "resource", Workspace: w.root, ResourceID: cleanID, Path: relPath(w.root, dst), Err: fmt.Errorf("archive destination already exists: %s", relPath(w.root, dst))}
	}
	if isProject(resource) {
		if err := ensureProjectTasksArchived(src, resource.(*Project)); err != nil {
			return ArchiveResult{}, &APIError{Operation: "archive resource", Kind: "resource", Workspace: w.root, ResourceID: cleanID, Err: err}
		}
	}
	if task, ok := resource.(*Task); ok {
		if err := ensureTaskRepoWorktreesMerged(w.root, *task); err != nil {
			return ArchiveResult{}, &APIError{Operation: "archive resource", Kind: "resource", Workspace: w.root, ResourceID: cleanID, Err: err}
		}
	}
	if err := releaseSessionsControllingPath(w.root, relPath(w.root, src)); err != nil {
		return ArchiveResult{}, &APIError{Operation: "archive resource", Kind: "resource", Workspace: w.root, ResourceID: cleanID, Err: err}
	}
	if err := os.MkdirAll(filepath.Dir(dst), 0o755); err != nil {
		return ArchiveResult{}, &APIError{Operation: "archive resource", Kind: "resource", Workspace: w.root, ResourceID: cleanID, Err: err}
	}
	if err := os.Rename(src, dst); err != nil {
		return ArchiveResult{}, &APIError{Operation: "archive resource", Kind: "resource", Workspace: w.root, ResourceID: cleanID, Err: err}
	}
	if task, ok := resource.(*Task); ok {
		if err := rewriteArchivedTaskReferences(w.root, dst, *task, relPath(w.root, src), relPath(w.root, dst)); err != nil {
			return ArchiveResult{}, &APIError{Operation: "archive resource", Kind: "resource", Workspace: w.root, ResourceID: cleanID, Err: err}
		}
	}
	return ArchiveResult{ResourceID: cleanID, Path: relPath(w.root, dst)}, nil
}
