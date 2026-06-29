package forge

import (
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"
)

var topProjectName = regexp.MustCompile(`^project([0-9]+)$`)
var legacyTopTaskName = regexp.MustCompile(`^task([0-9]+)$`)
var workflowName = regexp.MustCompile(`^[A-Za-z0-9._-]+$`)

const (
	workflowDir         = "workflow"
	defaultWorkflowName = "default"
	projectWorkflowName = "project"
)

var builtinWorkflows = map[string]string{
	defaultWorkflowName: `Standard task workflow. Clarify the requirements and acceptance criteria first, then implement, test, and record the result.

### Steps

1. Read task.json, task.md, work.md, and log.md to confirm the task boundary and acceptance criteria.
2. If requirements, risks, or acceptance criteria are unclear, clarify them with the user and update task.md with the confirmed answers.
3. Make the required code or documentation changes in the task-owned worktree/.
4. Run relevant tests and checks, then record important results.
5. Summarize the changes, verification results, remaining risks, and recommended next steps.
`,
	projectWorkflowName: `This is a project-management project. Keep this project focused on clarifying requirements, splitting work into tasks, coordinating implementation, reviewing, merging, and closing out. Put implementation work in direct tasks, with each agent working in its own task-owned worktree/branch.

### Steps

1. When a new request arrives, discuss it with the user and clarify the task boundary, acceptance criteria, and risks.
2. After the requirement is clear, create a new task under the current project and write the requirement, acceptance criteria, and necessary context into that task's task.md.
3. Start an agent for the task. The agent should work inside that task directory, create an independent worktree/branch, then implement, test, and commit according to the task requirements.
4. After the agent finishes, review from the project: inspect the diff, confirm requirement coverage, and run necessary tests.
5. After review and tests pass, merge the task branch into the target branch.
6. Complete the confirmed closeout steps and archive the task.

### Pending Decisions

- Should any additional closeout steps run after a task is complete, such as updating the local environment, rerunning integration tests, or pushing to the remote?
`,
}

type taskListOptions struct {
	IncludeArchived bool
	Tree            bool
}

type taskListEntry struct {
	Task Task
	Path string
}

func projectCreate(description, workflow string, allowBuiltinFallback bool) error {
	root, err := findWorkspaceRoot()
	if err != nil {
		return err
	}
	description = strings.TrimSpace(description)
	if description == "" {
		return fmt.Errorf("description cannot be empty")
	}
	workflowContent, err := resolveWorkflow(root, workflow, allowBuiltinFallback && workflow == defaultWorkflowName)
	if err != nil {
		return err
	}

	id, err := nextProjectID(root)
	if err != nil {
		return err
	}
	taskPath := filepath.Join(root, id)
	task := newTask(id, "project", nil, description, workflow)
	if err := createTaskFiles(taskPath, task, workflowContent); err != nil {
		return err
	}
	return printTaskJSON(task)
}

func projectList(options taskListOptions) error {
	root, err := findWorkspaceRoot()
	if err != nil {
		return err
	}
	dirs := []string{root}
	if options.IncludeArchived {
		dirs = append(dirs, filepath.Join(root, archiveDir))
	}
	entries, err := readTaskEntriesInDirs(dirs, topProjectName)
	if err != nil {
		return err
	}
	if options.Tree {
		return printProjectTree(entries, options.IncludeArchived)
	}
	for _, entry := range entries {
		fmt.Printf("%s\t%s\n", entry.Task.ID, entry.Task.Title)
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

	src, task, err := loadOpenTask(root, id)
	if err != nil {
		return err
	}
	dst, err := taskArchiveDestination(root, src, task)
	if err != nil {
		return err
	}
	if pathExists(dst) {
		return fmt.Errorf("archive destination already exists: %s", relPath(root, dst))
	}
	if err := ensureTaskRepoWorktreesMerged(root, task); err != nil {
		return err
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

func taskArchiveDestination(root, taskPath string, task Task) (string, error) {
	if isProject(task) {
		return filepath.Join(root, archiveDir, task.ID), nil
	}
	if isProjectTask(task) && task.Parent != nil && *task.Parent != "" {
		parentPath := filepath.Dir(taskPath)
		return filepath.Join(parentPath, archiveDir, task.ID), nil
	}
	return "", fmt.Errorf("unsupported task id for archive: %s", task.ID)
}

func ensureTaskRepoWorktreesMerged(root string, task Task) error {
	for _, repo := range task.Repos {
		if strings.TrimSpace(repo.WorktreePath) == "" {
			continue
		}
		worktreePath := repo.WorktreePath
		if !filepath.IsAbs(worktreePath) {
			worktreePath = filepath.Join(root, worktreePath)
		}
		if !isDir(worktreePath) {
			continue
		}

		target := strings.TrimSpace(repo.TargetBranch)
		if target == "" {
			return fmt.Errorf("cannot archive %s: repo %q worktree %s has no target branch recorded", task.ID, repo.Name, relPath(root, worktreePath))
		}
		cmd := exec.Command("git", "-C", worktreePath, "merge-base", "--is-ancestor", "HEAD", target)
		out, err := cmd.CombinedOutput()
		if err == nil {
			continue
		}
		if exitErr, ok := err.(*exec.ExitError); ok && exitErr.ExitCode() == 1 {
			commits := strings.TrimSpace(gitOutput(worktreePath, "log", "--oneline", "-n", "5", target+"..HEAD"))
			if commits != "" {
				return fmt.Errorf("cannot archive %s: repo %q worktree %s has commits not merged into target branch %q:\n%s", task.ID, repo.Name, relPath(root, worktreePath), target, commits)
			}
			return fmt.Errorf("cannot archive %s: repo %q worktree %s has commits not merged into target branch %q", task.ID, repo.Name, relPath(root, worktreePath), target)
		}
		detail := strings.TrimSpace(string(out))
		if detail == "" {
			detail = err.Error()
		}
		return fmt.Errorf("cannot archive %s: cannot verify repo %q worktree %s against target branch %q: %s", task.ID, repo.Name, relPath(root, worktreePath), target, detail)
	}
	return nil
}

func projectTaskCreate(parentID, description string) error {
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
		return fmt.Errorf("cannot create task under archived project: %s", parentID)
	}
	var parent Task
	if err := readJSON(filepath.Join(parentPath, "task.json"), &parent); err != nil {
		return err
	}
	if !isProject(parent) {
		return fmt.Errorf("cannot create task under non-project resource: %s", parentID)
	}
	id, err := nextProjectTaskID(parentPath, parentID)
	if err != nil {
		return err
	}
	taskPath := filepath.Join(parentPath, id)
	workflowContent, err := resolveWorkflow(root, defaultWorkflowName, true)
	if err != nil {
		return err
	}
	task := newTask(id, "task", &parentID, description, defaultWorkflowName)
	if err := createTaskFiles(taskPath, task, workflowContent); err != nil {
		return err
	}
	return printTaskJSON(task)
}

func projectTaskList(parentID string, includeArchived bool) error {
	root, err := findWorkspaceRoot()
	if err != nil {
		return err
	}
	parentID = cleanID(parentID)
	parentPath, err := findTaskDir(root, parentID)
	if err != nil {
		return err
	}
	pattern := projectTaskName(parentID)
	dirs := []string{parentPath}
	if includeArchived {
		dirs = append(dirs, filepath.Join(parentPath, archiveDir))
	}
	tasks, err := readTasksInDirs(dirs, pattern)
	if err != nil {
		return err
	}
	for _, task := range tasks {
		fmt.Printf("%s\t%s\n", task.ID, task.Title)
	}
	return nil
}

func newTask(id string, taskType string, parent *string, description string, workflow string) Task {
	now := time.Now().Format(time.RFC3339)
	return Task{
		ID:          id,
		Type:        taskType,
		Parent:      parent,
		Title:       titleFromDescription(description),
		Description: description,
		Workflow:    workflow,
		CreatedAt:   now,
		UpdatedAt:   now,
		Repos:       []TaskRepo{},
	}
}

func createTaskFiles(dir string, task Task, workflowContent string) error {
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
	return os.WriteFile(filepath.Join(dir, "AGENTS.md"), []byte(taskAgentsBlock(task, workflowContent)+"\n"), 0o644)
}

func resolveWorkflow(root, name string, fallbackToBuiltin bool) (string, error) {
	name = strings.TrimSpace(name)
	if name == "" {
		return "", fmt.Errorf("workflow cannot be empty")
	}
	if !workflowName.MatchString(name) {
		return "", fmt.Errorf("invalid workflow name %q: use only letters, numbers, dot, underscore, or hyphen", name)
	}
	path := filepath.Join(root, workflowDir, name+".md")
	data, err := os.ReadFile(path)
	if err == nil {
		return strings.TrimRight(string(data), " \t\r\n") + "\n", nil
	}
	if !os.IsNotExist(err) {
		return "", err
	}
	if fallbackToBuiltin {
		if content, ok := builtinWorkflows[name]; ok {
			return strings.TrimRight(content, " \t\r\n") + "\n", nil
		}
	}
	return "", fmt.Errorf("workflow not found: %s", filepath.ToSlash(filepath.Join(workflowDir, name+".md")))
}

func nextProjectID(root string) (string, error) {
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
			match := topProjectName.FindStringSubmatch(entry.Name())
			if match == nil {
				match = legacyTopTaskName.FindStringSubmatch(entry.Name())
			}
			if match == nil {
				continue
			}
			n, _ := strconv.Atoi(match[1])
			if n > maxID {
				maxID = n
			}
		}
	}
	return fmt.Sprintf("project%d", maxID+1), nil
}

func nextProjectTaskID(parentPath, parentID string) (string, error) {
	pattern := regexp.MustCompile(`^` + regexp.QuoteMeta(parentID) + `\.task([0-9]+)$`)
	maxID := 0
	for _, dir := range []string{parentPath, filepath.Join(parentPath, archiveDir)} {
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
			match := pattern.FindStringSubmatch(entry.Name())
			if match == nil {
				continue
			}
			n, _ := strconv.Atoi(match[1])
			if n > maxID {
				maxID = n
			}
		}
	}
	return fmt.Sprintf("%s.task%d", parentID, maxID+1), nil
}

func readTasksInDir(dir string, pattern *regexp.Regexp) ([]Task, error) {
	entries, err := readTaskEntriesInDir(dir, pattern)
	if err != nil {
		return nil, err
	}
	tasks := make([]Task, 0, len(entries))
	for _, entry := range entries {
		tasks = append(tasks, entry.Task)
	}
	return tasks, nil
}

func readTaskEntriesInDir(dir string, pattern *regexp.Regexp) ([]taskListEntry, error) {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return nil, err
	}
	var tasks []taskListEntry
	for _, entry := range entries {
		if !entry.IsDir() || !pattern.MatchString(entry.Name()) {
			continue
		}
		var task Task
		taskPath := filepath.Join(dir, entry.Name())
		if err := readJSON(filepath.Join(taskPath, "task.json"), &task); err != nil {
			continue
		}
		tasks = append(tasks, taskListEntry{Task: task, Path: taskPath})
	}
	sort.Slice(tasks, func(i, j int) bool {
		return taskSortKey(tasks[i].Task.ID) < taskSortKey(tasks[j].Task.ID)
	})
	return tasks, nil
}

func readTasksInDirs(dirs []string, pattern *regexp.Regexp) ([]Task, error) {
	entries, err := readTaskEntriesInDirs(dirs, pattern)
	if err != nil {
		return nil, err
	}
	tasks := make([]Task, 0, len(entries))
	for _, entry := range entries {
		tasks = append(tasks, entry.Task)
	}
	return tasks, nil
}

func readTaskEntriesInDirs(dirs []string, pattern *regexp.Regexp) ([]taskListEntry, error) {
	var tasks []taskListEntry
	for _, dir := range dirs {
		dirTasks, err := readTaskEntriesInDir(dir, pattern)
		if err != nil {
			if os.IsNotExist(err) {
				continue
			}
			return nil, err
		}
		tasks = append(tasks, dirTasks...)
	}
	sort.Slice(tasks, func(i, j int) bool {
		return taskSortKey(tasks[i].Task.ID) < taskSortKey(tasks[j].Task.ID)
	})
	return tasks, nil
}

func printProjectTree(entries []taskListEntry, includeArchived bool) error {
	for _, entry := range entries {
		fmt.Printf("%s\t%s\n", entry.Task.ID, entry.Task.Title)
		if err := printProjectTasks(entry.Path, entry.Task.ID, includeArchived); err != nil {
			return err
		}
	}
	return nil
}

func printProjectTasks(parentPath, parentID string, includeArchived bool) error {
	pattern := projectTaskName(parentID)
	dirs := []string{parentPath}
	if includeArchived {
		dirs = append(dirs, filepath.Join(parentPath, archiveDir))
	}
	children, err := readTaskEntriesInDirs(dirs, pattern)
	if err != nil {
		return err
	}
	for _, child := range children {
		fmt.Printf("- %s\t%s\n", child.Task.ID, child.Task.Title)
	}
	return nil
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
	if rel == archiveDir || strings.HasPrefix(rel, archiveDir+"/") {
		return true
	}
	for _, part := range strings.Split(rel, "/") {
		if part == archiveDir {
			return true
		}
	}
	return false
}

func updateOpenTaskAgentsMD(root string) error {
	return filepath.WalkDir(root, func(path string, entry os.DirEntry, walkErr error) error {
		if walkErr != nil {
			return walkErr
		}
		if !entry.IsDir() {
			return nil
		}
		if path != root {
			switch entry.Name() {
			case ".git", reposDir, archiveDir, "worktree", "artifacts":
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
		return updateTaskAgentsMD(root, path, task)
	})
}

func updateTaskAgentsMD(root, dir string, task Task) error {
	path := filepath.Join(dir, "AGENTS.md")
	workflow := task.Workflow
	if workflow == "" {
		workflow = defaultWorkflowName
	}
	workflowContent, err := resolveWorkflow(root, workflow, workflow == defaultWorkflowName)
	if err != nil {
		return err
	}
	block := taskAgentsBlock(task, workflowContent)

	content := ""
	if data, err := os.ReadFile(path); err == nil {
		content = string(data)
	} else if !os.IsNotExist(err) {
		return err
	}
	if strings.TrimSpace(content) == strings.TrimSpace(taskAgentsPrompt(task, workflowContent)) {
		content = ""
	}

	updated, err := upsertManagedBlock(content, block)
	if err != nil {
		return err
	}
	return os.WriteFile(path, []byte(updated), 0o644)
}

func taskAgentsBlock(task Task, workflowContent string) string {
	return forgePromptStart + "\n" + taskAgentsPrompt(task, workflowContent) + "\n" + forgePromptEnd
}

func projectTaskName(projectID string) *regexp.Regexp {
	return regexp.MustCompile(`^` + regexp.QuoteMeta(projectID) + `\.task([0-9]+(?:\.[0-9]+)*)$`)
}

func looksLikeProjectID(id string) bool {
	id = cleanID(id)
	return topProjectName.MatchString(id) || legacyTopTaskName.MatchString(id)
}

func isProject(task Task) bool {
	return task.Type == "project" || (task.Parent == nil && (topProjectName.MatchString(task.ID) || legacyTopTaskName.MatchString(task.ID)))
}

func isProjectTask(task Task) bool {
	return (task.Type == "task" || task.Type == "subtask") && task.Parent != nil && *task.Parent != ""
}

func taskSortKey(id string) string {
	parts := regexp.MustCompile(`[0-9]+`).FindAllString(id, -1)
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
`, task.Title, task.Description)
}

func defaultWorkMD(task Task) string {
	label := "Task"
	if isProject(task) {
		label = "Project"
	}
	return fmt.Sprintf(`# Work

## Current Step

No work has started yet.

## Current State

%s %s has been created. No blockers are known.

## Next Step

- Read task.json, task.md, and log.md.
- Decide which repositories are involved.
- Update task.json if new repositories are discovered.
- Create any needed worktrees under worktree/.

## Recovery Rule

Keep this file as a mutable recovery snapshot, not a chronological log. Replace stale content as the task progresses so it only shows the current step, current state, blockers, and next step. Put dated events, command results, completed-step history, and other timeline entries in log.md.
`, label, task.ID)
}

func defaultLogMD() string {
	return fmt.Sprintf(`# Log

## %s

- Task created.
`, time.Now().Format("2006-01-02 15:04:05 -0700"))
}

func taskAgentsPrompt(task Task, workflowContent string) string {
	extra := ""
	title := "Task Agent Instructions"
	scope := "single AgentWorkspace task directory"
	boundary := "Treat this directory as the current task boundary."
	repoGuidance := "For code changes, create Git worktrees under worktree/."
	if isProject(task) {
		title = "Project Agent Instructions"
		scope = "single AgentWorkspace project directory"
		boundary = "Treat this directory as the current project boundary."
		repoGuidance = "For code changes in this project, create tasks and put task-specific Git worktrees under each task's worktree/ directory."
	} else if task.Parent != nil {
		extra = `
- This task belongs to a project. Read the parent project directory's task.json, task.md, work.md, and log.md when you need broader context.
- Parent project files are reference context; keep your edits scoped to this task directory and its worktrees unless the user explicitly asks otherwise.
`
	}
	return fmt.Sprintf(`# %s

You are working inside a %s.

- For the overall forge workflow and CLI usage, read the workspace root AGENTS.md file.
- Read task.json, task.md, work.md, and log.md before acting.
- %s
- You may read other task directories for reference.
- Only update files inside this task directory and its worktrees.
- Treat repositories under ../repos/ as shared source caches; make code changes in task worktrees.
- %s
- If the task involves a new repository, update this task's task.json.
- Keep task.json focused on structured facts.
- Use task.md for task background context.
- If task.md contains pending decisions or unresolved items, ask the user to clarify them, then update task.md with the confirmed answers.
- Use work.md as a mutable recovery snapshot, not a chronological log. Keep only the current step, current state, blockers, and next step.
- Before starting any meaningful step, replace stale work.md content with the step you are about to take.
- Immediately after completing any meaningful step, replace stale work.md content with the updated current state and next step.
- Do not append timeline history to work.md. Put chronological events, command results, and completed-step history in log.md.
- Append important execution events to log.md.
- Put generated reports, screenshots, patches, and other outputs under artifacts/.
%s
## Workflow

%s`, title, scope, boundary, repoGuidance, extra, strings.TrimRight(workflowContent, " \t\r\n"))
}
