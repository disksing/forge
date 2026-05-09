package forge

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"
)

var topTaskName = regexp.MustCompile(`^task([0-9]+)$`)

func taskCreate(description string) error {
	root, err := findWorkspaceRoot()
	if err != nil {
		return err
	}
	description = strings.TrimSpace(description)
	if description == "" {
		return fmt.Errorf("description cannot be empty")
	}

	id, err := nextTaskID(root)
	if err != nil {
		return err
	}
	taskPath := filepath.Join(root, id)
	task := newTask(id, nil, description)
	if err := createTaskFiles(taskPath, task); err != nil {
		return err
	}
	return printTaskJSON(task)
}

func taskList() error {
	root, err := findWorkspaceRoot()
	if err != nil {
		return err
	}
	tasks, err := readTasksInDir(root, topTaskName)
	if err != nil {
		return err
	}
	for _, task := range tasks {
		fmt.Printf("%s\t%s\n", task.ID, task.Title)
	}
	return nil
}

func taskShow(id string) error {
	root, err := findWorkspaceRoot()
	if err != nil {
		return err
	}
	taskPath, err := findTaskDir(root, cleanID(id))
	if err != nil {
		return err
	}
	var task Task
	if err := readJSON(filepath.Join(taskPath, "task.json"), &task); err != nil {
		return err
	}
	return printTaskJSON(task)
}

func taskArchive(id string) error {
	root, err := findWorkspaceRoot()
	if err != nil {
		return err
	}
	id = cleanID(id)
	if !topTaskName.MatchString(id) {
		return fmt.Errorf("only top-level task ids can be archived with forge task archive: %s", id)
	}

	src := filepath.Join(root, id)
	if !isDir(src) {
		return fmt.Errorf("open task not found: %s", id)
	}
	dst := filepath.Join(root, archiveDir, id)
	if pathExists(dst) {
		return fmt.Errorf("archive destination already exists: %s", relPath(root, dst))
	}
	if err := os.MkdirAll(filepath.Dir(dst), 0o755); err != nil {
		return err
	}
	if err := os.Rename(src, dst); err != nil {
		return err
	}
	fmt.Printf("%s\n", relPath(root, dst))
	return nil
}

func subtaskCreate(parentID, description string) error {
	root, err := findWorkspaceRoot()
	if err != nil {
		return err
	}
	parentID = cleanID(parentID)
	description = strings.TrimSpace(description)
	if description == "" {
		return fmt.Errorf("description cannot be empty")
	}

	parentPath, err := findTaskDir(root, parentID)
	if err != nil {
		return err
	}
	if isArchivedPath(root, parentPath) {
		return fmt.Errorf("cannot create subtask under archived task: %s", parentID)
	}
	id, err := nextSubtaskID(parentPath, parentID)
	if err != nil {
		return err
	}
	taskPath := filepath.Join(parentPath, id)
	task := newTask(id, &parentID, description)
	if err := createTaskFiles(taskPath, task); err != nil {
		return err
	}
	return printTaskJSON(task)
}

func subtaskList(parentID string) error {
	root, err := findWorkspaceRoot()
	if err != nil {
		return err
	}
	parentID = cleanID(parentID)
	parentPath, err := findTaskDir(root, parentID)
	if err != nil {
		return err
	}
	pattern := regexp.MustCompile(`^` + regexp.QuoteMeta(parentID) + `\.([0-9]+)$`)
	tasks, err := readTasksInDir(parentPath, pattern)
	if err != nil {
		return err
	}
	for _, task := range tasks {
		fmt.Printf("%s\t%s\n", task.ID, task.Title)
	}
	return nil
}

func newTask(id string, parent *string, description string) Task {
	now := time.Now().Format(time.RFC3339)
	taskType := "task"
	if parent != nil {
		taskType = "subtask"
	}
	return Task{
		ID:          id,
		Type:        taskType,
		Parent:      parent,
		Title:       titleFromDescription(description),
		Description: description,
		CreatedAt:   now,
		UpdatedAt:   now,
		Repos:       []TaskRepo{},
	}
}

func createTaskFiles(dir string, task Task) error {
	if pathExists(dir) {
		return fmt.Errorf("task directory already exists: %s", dir)
	}
	for _, subdir := range []string{"artifacts", "worktree"} {
		if err := os.MkdirAll(filepath.Join(dir, subdir), 0o755); err != nil {
			return err
		}
	}
	if err := writeJSON(filepath.Join(dir, "task.json"), task); err != nil {
		return err
	}
	if err := os.WriteFile(filepath.Join(dir, "task.md"), []byte(defaultTaskMD(task)), 0o644); err != nil {
		return err
	}
	if err := os.WriteFile(filepath.Join(dir, "work.md"), []byte(defaultWorkMD(task)), 0o644); err != nil {
		return err
	}
	if err := os.WriteFile(filepath.Join(dir, "log.md"), []byte(defaultLogMD()), 0o644); err != nil {
		return err
	}
	return os.WriteFile(filepath.Join(dir, "AGENTS.md"), []byte(taskAgentsMD(task)), 0o644)
}

func nextTaskID(root string) (string, error) {
	maxID := 0
	for _, dir := range []string{root, filepath.Join(root, archiveDir)} {
		entries, err := os.ReadDir(dir)
		if err != nil {
			if os.IsNotExist(err) {
				continue
			}
			return "", err
		}
		for _, entry := range entries {
			if !entry.IsDir() {
				continue
			}
			match := topTaskName.FindStringSubmatch(entry.Name())
			if match == nil {
				continue
			}
			n, _ := strconv.Atoi(match[1])
			if n > maxID {
				maxID = n
			}
		}
	}
	return fmt.Sprintf("task%d", maxID+1), nil
}

func nextSubtaskID(parentPath, parentID string) (string, error) {
	pattern := regexp.MustCompile(`^` + regexp.QuoteMeta(parentID) + `\.([0-9]+)$`)
	maxID := 0
	entries, err := os.ReadDir(parentPath)
	if err != nil {
		return "", err
	}
	for _, entry := range entries {
		if !entry.IsDir() {
			continue
		}
		match := pattern.FindStringSubmatch(entry.Name())
		if match == nil {
			continue
		}
		n, _ := strconv.Atoi(match[1])
		if n > maxID {
			maxID = n
		}
	}
	return fmt.Sprintf("%s.%d", parentID, maxID+1), nil
}

func readTasksInDir(dir string, pattern *regexp.Regexp) ([]Task, error) {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return nil, err
	}
	var tasks []Task
	for _, entry := range entries {
		if !entry.IsDir() || !pattern.MatchString(entry.Name()) {
			continue
		}
		var task Task
		if err := readJSON(filepath.Join(dir, entry.Name(), "task.json"), &task); err != nil {
			continue
		}
		tasks = append(tasks, task)
	}
	sort.Slice(tasks, func(i, j int) bool {
		return taskSortKey(tasks[i].ID) < taskSortKey(tasks[j].ID)
	})
	return tasks, nil
}

func findTaskDir(root, id string) (string, error) {
	if id == "" {
		return "", fmt.Errorf("task id cannot be empty")
	}
	var found string
	err := filepath.WalkDir(root, func(path string, entry os.DirEntry, walkErr error) error {
		if walkErr != nil {
			return walkErr
		}
		if !entry.IsDir() {
			return nil
		}
		switch entry.Name() {
		case ".git", reposDir, "worktree", "artifacts":
			if path != root {
				return filepath.SkipDir
			}
		}
		taskJSON := filepath.Join(path, "task.json")
		if !pathExists(taskJSON) {
			return nil
		}
		var task Task
		if err := readJSON(taskJSON, &task); err != nil {
			return nil
		}
		if task.ID == id {
			found = path
			return filepath.SkipAll
		}
		return nil
	})
	if err != nil {
		return "", err
	}
	if found == "" {
		return "", fmt.Errorf("task not found: %s", id)
	}
	return found, nil
}

func isArchivedPath(root, path string) bool {
	rel := relPath(root, path)
	return rel == archiveDir || strings.HasPrefix(rel, archiveDir+"/")
}

func taskSortKey(id string) string {
	parts := strings.Split(strings.TrimPrefix(id, "task"), ".")
	var b strings.Builder
	for _, part := range parts {
		n, err := strconv.Atoi(part)
		if err != nil {
			b.WriteString(part)
			continue
		}
		b.WriteString(fmt.Sprintf("%08d.", n))
	}
	return b.String()
}

func titleFromDescription(description string) string {
	description = strings.TrimSpace(strings.Split(description, "\n")[0])
	runes := []rune(description)
	if len(runes) <= 80 {
		return description
	}
	return string(runes[:77]) + "..."
}

func printTaskJSON(task Task) error {
	encoder := json.NewEncoder(os.Stdout)
	encoder.SetIndent("", "  ")
	return encoder.Encode(task)
}

func defaultTaskMD(task Task) string {
	return fmt.Sprintf(`# %s

%s

## Notes

Use this file for task intent, requirements, plans, acceptance notes, and any other free-form context useful to the agent.
`, task.Title, task.Description)
}

func defaultWorkMD(task Task) string {
	return fmt.Sprintf(`# Work

## Current State

Task %s has been created. No work has started yet.

## Next Steps

- Read task.json, task.md, and log.md.
- Decide which repositories are involved.
- Update task.json if new repositories are discovered.
- Create any needed worktrees under worktree/.
`, task.ID)
}

func defaultLogMD() string {
	return fmt.Sprintf(`# Log

## %s

- Task created.
`, time.Now().Format("2006-01-02 15:04:05 -0700"))
}

func taskAgentsMD(task Task) string {
	extra := ""
	if task.Parent != nil {
		extra = `
- This is a subtask. Read the parent task directory's task.json, task.md, work.md, and log.md when you need broader context.
- Parent task files are reference context; keep your edits scoped to this subtask directory and its worktrees unless the user explicitly asks otherwise.
`
	}
	return `# Task Agent Instructions

You are working inside a single AgentWorkspace task directory.

- For the overall forge workflow and CLI usage, read the workspace root AGENTS.md file.
- Read task.json, task.md, work.md, and log.md before acting.
- Treat this directory as the current task boundary.
- You may read other task directories for reference.
- Only update files inside this task directory and its worktrees.
- Do not modify bare repositories under ../repos/ directly.
- If code changes are needed, create Git worktrees under worktree/.
- If the task involves a new repository, update this task's task.json.
- Keep task.json focused on structured facts.
- Use task.md for free-form task intent, notes, plans, and acceptance details.
- Use work.md for current state and interruption recovery.
- Append important execution events to log.md.
- Put generated reports, screenshots, patches, and other outputs under artifacts/.
` + extra
}
