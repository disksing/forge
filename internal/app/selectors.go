package app

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// OpenWorkspaceFrom discovers and opens the AgentWorkspace containing start.
// It exists for adapters, such as the CLI, whose resource selection is based
// on a caller-supplied working directory. Application services should prefer
// OpenWorkspace when they already have an explicit Workspace root.
func OpenWorkspaceFrom(start string) (*Workspace, error) {
	root, err := findEnclosingWorkspaceRoot(start)
	if err != nil {
		return nil, &APIError{Operation: "discover Workspace", Kind: "workspace", Path: start, Err: err}
	}
	if root == "" {
		return nil, &APIError{Operation: "discover Workspace", Kind: "workspace", Path: start, Err: errors.New("could not find AgentWorkspace root; run pua init first")}
	}
	return OpenWorkspace(root)
}

// NormalizeProjectID accepts a canonical projectN id or its numeric suffix.
func NormalizeProjectID(project string) (string, error) {
	project = strings.TrimSpace(project)
	if project == "" {
		return "", nil
	}
	if topProjectName.MatchString(project) {
		return project, nil
	}
	if isASCIIInteger(project) {
		return "project" + project, nil
	}
	return "", fmt.Errorf("invalid project %q: use projectN or N", project)
}

// NormalizeTaskID combines an explicit project id with a short taskM id or
// numeric suffix. It never infers a project from process-global state.
func NormalizeTaskID(projectID, task string) (string, error) {
	task, err := NormalizeTaskName(task)
	if err != nil {
		return "", err
	}
	projectID, err = NormalizeProjectID(projectID)
	if err != nil {
		return "", err
	}
	if projectID == "" {
		return "", errors.New("project id is required")
	}
	return projectID + "." + task, nil
}

// NormalizeTaskName accepts a short taskM id or numeric suffix.
func NormalizeTaskName(task string) (string, error) {
	task = strings.TrimSpace(task)
	if task == "" {
		return "", errors.New("task cannot be empty")
	}
	if strings.Contains(task, ".") {
		return "", fmt.Errorf("invalid task %q: use taskM or M", task)
	}
	if taskDirName.MatchString(task) {
		return task, nil
	}
	if isASCIIInteger(task) {
		return "task" + task, nil
	}
	return "", fmt.Errorf("invalid task %q: use taskM or M", task)
}

// TaskShortID returns the taskM component of a canonical task resource id.
func TaskShortID(id string) string {
	if _, task, ok := strings.Cut(strings.TrimSpace(id), "."); ok {
		return task
	}
	return strings.TrimSpace(id)
}

// InferProjectID returns the nearest open project containing start.
func (w *Workspace) InferProjectID(start string) (string, bool, error) {
	path, err := w.selectionStart(start)
	if err != nil {
		return "", false, err
	}
	for {
		if pathExists(filepath.Join(path, projectJSONFile)) || pathExists(filepath.Join(path, taskJSONFile)) {
			resource, readErr := readResourceAtDir(path)
			if readErr != nil {
				return "", false, readErr
			}
			if resourceDirNameMatches(filepath.Base(path), resource) && !isArchivedPath(w.root, path) {
				switch typed := resource.(type) {
				case *Project:
					return typed.ID, true, nil
				case *Task:
					if typed.Parent != "" {
						return typed.Parent, true, nil
					}
				}
			}
		}
		if path == w.root {
			return "", false, nil
		}
		path = filepath.Dir(path)
	}
}

// InferTaskID returns the nearest open task containing start.
func (w *Workspace) InferTaskID(start string) (string, bool, error) {
	path, err := w.selectionStart(start)
	if err != nil {
		return "", false, err
	}
	for {
		if pathExists(filepath.Join(path, taskJSONFile)) {
			var task Task
			if readErr := readTaskAtDir(path, &task); readErr != nil {
				return "", false, readErr
			}
			if resourceDirNameMatches(filepath.Base(path), &task) && !isArchivedPath(w.root, path) {
				return task.ID, true, nil
			}
		}
		if path == w.root {
			return "", false, nil
		}
		path = filepath.Dir(path)
	}
}

func (w *Workspace) selectionStart(start string) (string, error) {
	if err := w.require(); err != nil {
		return "", err
	}
	if strings.TrimSpace(start) == "" {
		return "", errors.New("selection start path is required")
	}
	abs, err := filepath.Abs(start)
	if err != nil {
		return "", err
	}
	abs = filepath.Clean(abs)
	info, err := os.Stat(abs)
	if err != nil {
		return "", err
	}
	if !info.IsDir() {
		abs = filepath.Dir(abs)
	}
	canonical, err := filepath.EvalSymlinks(abs)
	if err != nil {
		return "", err
	}
	abs = filepath.Clean(canonical)
	rel, err := filepath.Rel(w.root, abs)
	if err != nil || rel == ".." || strings.HasPrefix(rel, ".."+string(filepath.Separator)) {
		return "", fmt.Errorf("selection path must be inside Workspace: %s", abs)
	}
	return abs, nil
}

func isASCIIInteger(value string) bool {
	if value == "" {
		return false
	}
	for _, r := range value {
		if r < '0' || r > '9' {
			return false
		}
	}
	return true
}
