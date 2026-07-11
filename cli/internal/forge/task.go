package forge

import (
	"errors"
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
var topProjectDirName = regexp.MustCompile(`^project([0-9]+)(?:-[A-Za-z0-9][A-Za-z0-9._-]*)?$`)
var taskDirName = regexp.MustCompile(`^task([0-9]+)(?:-[A-Za-z0-9][A-Za-z0-9._-]*)?$`)
var workflowName = regexp.MustCompile(`^[A-Za-z0-9._-]+$`)
var resourceSlugName = regexp.MustCompile(`^[A-Za-z0-9][A-Za-z0-9._-]*$`)

const (
	workflowDir         = "workflow"
	defaultWorkflowName = "default"
	projectWorkflowName = "project"
	projectJSONFile     = "project.json"
	projectMDFile       = "project.md"
	taskJSONFile        = "task.json"
	taskMDFile          = "task.md"
)

var builtinWorkflows = map[string]string{
	defaultWorkflowName: `Standard task workflow. Clarify requirements and acceptance criteria first, then implement, test, and record the result.

### Steps

1. Confirm the task boundary, acceptance criteria, and relevant risks.
2. If anything important is unclear, clarify it with the user before changing code or documents.
3. Make the required code or documentation changes.
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
	ProjectID       string
	IncludeArchived bool
	Runnable        bool
	IncludeBlocked  bool
	JSON            bool
}

type taskListEntry struct {
	Task Task
	Path string
}

type projectListEntry struct {
	Project Project
	Path    string
}

func projectCreate(description, workflow string, allowBuiltinFallback bool, slug string) error {
	root, err := findWorkspaceRoot()
	if err != nil {
		return err
	}
	description = strings.TrimSpace(description)
	if description == "" {
		return fmt.Errorf("description cannot be empty")
	}
	slug, err = normalizeResourceSlug(slug)
	if err != nil {
		return err
	}
	workflowContent, err := resolveWorkflow(root, workflow, allowBuiltinFallback && workflow == defaultWorkflowName)
	if err != nil {
		return err
	}

	id, err := nextProjectID(root)
	if err != nil {
		return err
	}
	projectPath := filepath.Join(root, projectDirectoryName(id, slug))
	project := newProject(id, titleFromDescription(description), description, workflow)
	if err := createResourceFiles(projectPath, &project, workflowContent); err != nil {
		return err
	}
	return printJSON(project)
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
	entries, err := readProjectEntriesInDirs(dirs)
	if err != nil {
		return err
	}
	for _, entry := range entries {
		fmt.Printf("%s\t%s\n", entry.Project.ID, entry.Project.Title)
	}
	return nil
}

func showResource(id string) error {
	root, err := findWorkspaceRoot()
	if err != nil {
		return err
	}
	resourcePath, err := findResourceDir(root, cleanID(id))
	if err != nil {
		return err
	}
	resource, err := readResourceAtDir(resourcePath)
	if err != nil {
		return err
	}
	return printJSON(resource)
}

func archiveResource(id string) error {
	root, err := findWorkspaceRoot()
	if err != nil {
		return err
	}
	id = cleanID(id)

	src, task, err := loadOpenResource(root, id)
	if err != nil {
		return err
	}
	dst, err := resourceArchiveDestination(root, src, task)
	if err != nil {
		return err
	}
	if pathExists(dst) {
		return fmt.Errorf("archive destination already exists: %s", relPath(root, dst))
	}
	if isProject(task) {
		if err := ensureProjectTasksArchived(src, task.(*Project)); err != nil {
			return err
		}
	}
	if typed, ok := task.(*Task); ok {
		if err := ensureTaskRepoWorktreesMerged(root, *typed); err != nil {
			return err
		}
	}
	if err := endSessionsControllingPath(root, relPath(root, src)); err != nil {
		return err
	}
	if err := os.MkdirAll(filepath.Dir(dst), 0o755); err != nil {
		return err
	}
	if err := os.Rename(src, dst); err != nil {
		return err
	}
	if typed, ok := task.(*Task); ok {
		if err := rewriteArchivedTaskReferences(root, dst, *typed, relPath(root, src), relPath(root, dst)); err != nil {
			return err
		}
	}
	fmt.Printf("%s\n", relPath(root, dst))
	return nil
}

func rewriteArchivedTaskReferences(root, taskPath string, task Task, oldRel, newRel string) error {
	changed := false
	for i := range task.Repos {
		before := task.Repos[i]
		task.Repos[i].WorktreePath = migratePathReference(root, task.Repos[i].WorktreePath, oldRel, newRel)
		task.Repos[i].RepoPath = migratePathReference(root, task.Repos[i].RepoPath, oldRel, newRel)
		task.Repos[i].BarePath = migratePathReference(root, task.Repos[i].BarePath, oldRel, newRel)
		if task.Repos[i] != before {
			changed = true
		}
	}
	if changed {
		task.UpdatedAt = time.Now().Format(time.RFC3339)
		if err := writeResourceMetadata(taskPath, &task); err != nil {
			return err
		}
	}
	for _, repo := range task.Repos {
		if err := repairRepoWorktree(root, repo); err != nil {
			return fmt.Errorf("repair archived worktree for %s repo %q: %w", task.ID, repo.Name, err)
		}
	}
	return nil
}

func ensureProjectTasksArchived(projectPath string, project *Project) error {
	openTasks, err := readTaskEntriesInDir(projectPath, projectTaskName(project.ID))
	if err != nil {
		return err
	}
	if len(openTasks) == 0 {
		return nil
	}
	names := make([]string, 0, len(openTasks))
	for _, entry := range openTasks {
		names = append(names, taskDirectoryName(entry.Task.ID))
	}
	return fmt.Errorf("cannot archive %s: archive all project tasks first: %s", project.ID, strings.Join(names, ", "))
}

func resourceArchiveDestination(root, taskPath string, task Resource) (string, error) {
	meta := task.resourceMeta()
	if isProject(task) {
		return filepath.Join(root, archiveDir, filepath.Base(taskPath)), nil
	}
	if typed, ok := task.(*Task); ok && typed.Parent != "" {
		parentPath := filepath.Dir(taskPath)
		return filepath.Join(parentPath, archiveDir, filepath.Base(taskPath)), nil
	}
	return "", fmt.Errorf("unsupported task id for archive: %s", meta.ID)
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

func projectTaskCreate(parentID, title string, detail string, slug string, nonInteractive bool, agentID, prompt string, afterValues []string) error {
	root, err := findWorkspaceRoot()
	if err != nil {
		return err
	}
	parentID = cleanID(parentID)
	title = strings.TrimSpace(title)
	if title == "" {
		return fmt.Errorf("title cannot be empty")
	}
	detail = strings.TrimSpace(detail)
	slug, err = normalizeResourceSlug(slug)
	if err != nil {
		return err
	}

	parentPath, err := findResourceDir(root, parentID)
	if err != nil {
		return err
	}
	if isArchivedPath(root, parentPath) {
		return fmt.Errorf("cannot create task under archived project: %s", parentID)
	}
	var parent Project
	if err := readProjectAtDir(parentPath, &parent); err != nil {
		return err
	}
	id, err := nextProjectTaskID(parentPath, parentID)
	if err != nil {
		return err
	}
	taskPath := filepath.Join(parentPath, taskDirectoryName(id, slug))
	workflowContent, err := resolveWorkflow(root, defaultWorkflowName, true)
	if err != nil {
		return err
	}
	task := newTask(id, parentID, title, "", defaultWorkflowName)
	if nonInteractive {
		after, err := resolveTaskRunDependencies(root, &task, afterValues)
		if err != nil {
			return err
		}
		now := time.Now().Format(time.RFC3339)
		state := taskRunStateQueued
		if len(after) > 0 {
			state = taskRunStateWaiting
		}
		task.Run = &TaskRun{Mode: taskRunModeNonInteractive, AgentID: strings.TrimSpace(agentID), Prompt: strings.TrimSpace(prompt), Generation: 1, State: state, After: after, UpdatedAt: now}
	} else if len(afterValues) > 0 || strings.TrimSpace(agentID) != "" || strings.TrimSpace(prompt) != "" {
		return errors.New("--agent, --prompt, and --after require --non-interactive")
	}
	if err := createResourceFilesWithMarkdown(taskPath, &task, workflowContent, taskMarkdown(title, detail)); err != nil {
		return err
	}
	return printTaskJSON(task)
}

func projectTaskList(options taskListOptions) error {
	root, err := findWorkspaceRoot()
	if err != nil {
		return err
	}
	parentID := cleanID(options.ProjectID)
	parentPath, err := findResourceDir(root, parentID)
	if err != nil {
		return err
	}
	pattern := projectTaskName(parentID)
	dirs := []string{parentPath}
	if options.IncludeArchived {
		dirs = append(dirs, filepath.Join(parentPath, archiveDir))
	}
	entries, err := readTaskEntriesInDirs(dirs, pattern)
	if err != nil {
		return err
	}
	if !options.Runnable {
		for _, entry := range entries {
			fmt.Printf("%s\t%s\n", taskDirectoryName(entry.Task.ID), entry.Task.Title)
		}
		return nil
	}
	result := make([]runnableTask, 0)
	for _, entry := range entries {
		if entry.Task.Run == nil || entry.Task.Run.Mode != taskRunModeNonInteractive {
			continue
		}
		ready, reason := taskRunReady(root, entry.Task)
		if isArchivedPath(root, entry.Path) {
			ready = false
			reason = "archived"
		}
		if !ready && !options.IncludeBlocked {
			continue
		}
		item := runnableTask{ID: entry.Task.ID, Path: relPath(root, entry.Path), Title: entry.Task.Title, Ready: ready, Reason: reason}
		if entry.Task.Run != nil {
			item.Generation = entry.Task.Run.Generation
			item.State = entry.Task.Run.State
			item.Prompt = entry.Task.Run.Prompt
			item.AgentID = entry.Task.Run.AgentID
			item.After = entry.Task.Run.After
		}
		result = append(result, item)
	}
	if options.JSON {
		return printJSON(map[string]any{"tasks": result})
	}
	for _, task := range result {
		fmt.Printf("%s\t%d\t%s\t%s\n", task.ID, task.Generation, task.Reason, task.Title)
	}
	return nil
}

func newProject(id, title, description, workflow string) Project {
	now := time.Now().Format(time.RFC3339)
	return Project{
		ResourceMeta: ResourceMeta{SchemaVersion: resourceSchemaVersion, ID: id, Type: resourceTypeProject, Title: strings.TrimSpace(title), Workflow: workflow, CreatedAt: now, UpdatedAt: now},
		Description:  description,
	}
}

func newTask(id, parent, title, description, workflow string) Task {
	now := time.Now().Format(time.RFC3339)
	task := Task{
		ResourceMeta: ResourceMeta{
			SchemaVersion: resourceSchemaVersion,
			ID:            id,
			Type:          resourceTypeTask,
			Title:         strings.TrimSpace(title),
			Workflow:      workflow,
			CreatedAt:     now,
			UpdatedAt:     now,
		},
		Parent:      parent,
		Description: description,
	}
	task.Repos = []TaskRepo{}
	return task
}

func createResourceFiles(dir string, resource Resource, workflowContent string) error {
	return createResourceFilesWithMarkdown(dir, resource, workflowContent, defaultTaskMD(resource))
}

func createResourceFilesWithMarkdown(dir string, resource Resource, workflowContent string, markdown string) error {
	if pathExists(dir) {
		return fmt.Errorf("task directory already exists: %s", dir)
	}
	subdirs := []string{"artifacts"}
	if !isProject(resource) {
		subdirs = append(subdirs, "worktree")
	}
	for _, subdir := range subdirs {
		if err := os.MkdirAll(filepath.Join(dir, subdir), 0o755); err != nil {
			return err
		}
	}
	if err := writeResourceMetadata(dir, resource); err != nil {
		return err
	}
	if err := os.WriteFile(filepath.Join(dir, markdownFileName(resource)), []byte(markdown), 0o644); err != nil {
		return err
	}
	if !isProject(resource) {
		if err := os.WriteFile(filepath.Join(dir, "work.md"), []byte(defaultWorkMD(resource)), 0o644); err != nil {
			return err
		}
	}
	logTitle := "Task created"
	if isProject(resource) {
		logTitle = "Project created"
	}
	if err := os.WriteFile(filepath.Join(dir, logJSONLFile), []byte(defaultLogJSONL(logTitle)), 0o644); err != nil {
		return err
	}
	return os.WriteFile(filepath.Join(dir, "AGENTS.md"), []byte(taskAgentsBlock(resource, workflowContent)+"\n"), 0o644)
}

func metadataFileName(resource Resource) string {
	if isProject(resource) {
		return projectJSONFile
	}
	return taskJSONFile
}

func markdownFileName(resource Resource) string {
	if isProject(resource) {
		return projectMDFile
	}
	return taskMDFile
}

func writeResourceMetadata(dir string, resource Resource) error {
	if err := validateResource(resource); err != nil {
		return fmt.Errorf("invalid resource metadata for %s: %w", dir, err)
	}
	path := filepath.Join(dir, metadataFileName(resource))
	if err := writeJSON(path, resource); err != nil {
		return err
	}
	stale := taskJSONFile
	if !isProject(resource) {
		stale = projectJSONFile
	}
	if err := os.Remove(filepath.Join(dir, stale)); err != nil && !os.IsNotExist(err) {
		return err
	}
	return nil
}

func readResourceAtDir(dir string) (Resource, error) {
	projectPath := filepath.Join(dir, projectJSONFile)
	taskPath := filepath.Join(dir, taskJSONFile)
	if pathExists(projectPath) && pathExists(taskPath) {
		return nil, fmt.Errorf("resource directory contains both %s and %s: %s", projectJSONFile, taskJSONFile, dir)
	}
	path := taskPath
	expectedType := resourceTypeTask
	if pathExists(projectPath) {
		path = projectPath
		expectedType = resourceTypeProject
	}
	var resource Resource
	if expectedType == resourceTypeProject {
		resource = &Project{}
	} else {
		resource = &Task{}
	}
	if err := readJSON(path, resource); err != nil {
		return nil, err
	}
	meta := resource.resourceMeta()
	if meta.SchemaVersion == 0 {
		return nil, fmt.Errorf("resource metadata needs migration: %s; run forge migrate", path)
	}
	if meta.Type != expectedType {
		return nil, fmt.Errorf("invalid resource metadata %s: file requires type %q, got %q", path, expectedType, meta.Type)
	}
	if err := validateResource(resource); err != nil {
		return nil, fmt.Errorf("invalid resource metadata %s: %w", path, err)
	}
	return resource, nil
}

func readProjectAtDir(dir string, project *Project) error {
	resource, err := readResourceAtDir(dir)
	if err != nil {
		return err
	}
	typed, ok := resource.(*Project)
	if !ok {
		return fmt.Errorf("resource is not a project: %s", dir)
	}
	*project = *typed
	return nil
}

func readTaskAtDir(dir string, task *Task) error {
	resource, err := readResourceAtDir(dir)
	if err != nil {
		return err
	}
	typed, ok := resource.(*Task)
	if !ok {
		return fmt.Errorf("resource is not a task: %s", dir)
	}
	*task = *typed
	return nil
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
			if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
				return "", err
			}
			if err := os.WriteFile(path, []byte(content), 0o644); err != nil {
				return "", err
			}
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
			match := topProjectDirName.FindStringSubmatch(entry.Name())
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
	pattern := projectTaskName(parentID)
	maxID := 0
	entries, err := readTaskEntriesInDirs([]string{parentPath, filepath.Join(parentPath, archiveDir)}, pattern)
	if err != nil {
		return "", err
	}
	for _, entry := range entries {
		suffix := strings.TrimPrefix(entry.Task.ID, parentID+".task")
		parts := strings.Split(suffix, ".")
		n, err := strconv.Atoi(parts[0])
		if err != nil {
			continue
		}
		if n > maxID {
			maxID = n
		}
	}
	return fmt.Sprintf("%s.task%d", parentID, maxID+1), nil
}

func readTaskEntriesInDir(dir string, pattern *regexp.Regexp) ([]taskListEntry, error) {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return nil, err
	}
	var tasks []taskListEntry
	for _, entry := range entries {
		if !entry.IsDir() {
			continue
		}
		var task Task
		taskPath := filepath.Join(dir, entry.Name())
		if err := readTaskAtDir(taskPath, &task); err != nil {
			continue
		}
		if !pattern.MatchString(task.ID) || !resourceDirNameMatches(entry.Name(), &task) {
			continue
		}
		tasks = append(tasks, taskListEntry{Task: task, Path: taskPath})
	}
	sort.Slice(tasks, func(i, j int) bool {
		return taskSortKey(tasks[i].Task.ID) < taskSortKey(tasks[j].Task.ID)
	})
	return tasks, nil
}

func readProjectEntriesInDir(dir string) ([]projectListEntry, error) {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return nil, err
	}
	var projects []projectListEntry
	for _, entry := range entries {
		if !entry.IsDir() {
			continue
		}
		projectPath := filepath.Join(dir, entry.Name())
		var project Project
		if err := readProjectAtDir(projectPath, &project); err != nil {
			continue
		}
		if !resourceDirNameMatches(entry.Name(), &project) {
			continue
		}
		projects = append(projects, projectListEntry{Project: project, Path: projectPath})
	}
	sort.Slice(projects, func(i, j int) bool { return taskSortKey(projects[i].Project.ID) < taskSortKey(projects[j].Project.ID) })
	return projects, nil
}

func readProjectEntriesInDirs(dirs []string) ([]projectListEntry, error) {
	var projects []projectListEntry
	for _, dir := range dirs {
		entries, err := readProjectEntriesInDir(dir)
		if err != nil {
			if os.IsNotExist(err) {
				continue
			}
			return nil, err
		}
		projects = append(projects, entries...)
	}
	sort.Slice(projects, func(i, j int) bool { return taskSortKey(projects[i].Project.ID) < taskSortKey(projects[j].Project.ID) })
	return projects, nil
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

func findResourceDir(root, id string) (string, error) {
	if id == "" {
		return "", fmt.Errorf("resource id cannot be empty")
	}
	parents := []string{root, filepath.Join(root, archiveDir)}
	if projectID, _, ok := strings.Cut(id, ".task"); ok {
		projectPath, err := findResourceDir(root, projectID)
		if err != nil {
			return "", err
		}
		parents = []string{projectPath, filepath.Join(projectPath, archiveDir)}
	}
	var matches []string
	for _, parent := range parents {
		entries, err := os.ReadDir(parent)
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
			path := filepath.Join(parent, entry.Name())
			resource, err := readResourceAtDir(path)
			if err == nil && resource.resourceMeta().ID == id && resourceDirNameMatches(entry.Name(), resource) {
				matches = append(matches, path)
			}
		}
	}
	if len(matches) == 0 {
		return "", fmt.Errorf("resource not found: %s", id)
	}
	if len(matches) > 1 {
		return "", fmt.Errorf("multiple resource directories found for %s: %s", id, strings.Join(matches, ", "))
	}
	return matches[0], nil
}

func inferCurrentProjectID() (string, bool, error) {
	root, err := findWorkspaceRoot()
	if err != nil {
		return "", false, err
	}
	cwd, err := os.Getwd()
	if err != nil {
		return "", false, err
	}
	for {
		if pathExists(filepath.Join(cwd, projectJSONFile)) || pathExists(filepath.Join(cwd, taskJSONFile)) {
			resource, err := readResourceAtDir(cwd)
			if err != nil {
				return "", false, err
			}
			if resourceDirNameMatches(filepath.Base(cwd), resource) && !isArchivedPath(root, cwd) {
				if project, ok := resource.(*Project); ok {
					return project.ID, true, nil
				}
				if task, ok := resource.(*Task); ok && task.Parent != "" {
					return task.Parent, true, nil
				}
			}
		}
		if cwd == root {
			return "", false, nil
		}
		parent := filepath.Dir(cwd)
		if parent == cwd {
			return "", false, nil
		}
		cwd = parent
	}
}

func inferCurrentTaskID() (string, bool, error) {
	root, err := findWorkspaceRoot()
	if err != nil {
		return "", false, err
	}
	cwd, err := os.Getwd()
	if err != nil {
		return "", false, err
	}
	for {
		if pathExists(filepath.Join(cwd, taskJSONFile)) {
			var task Task
			if err := readTaskAtDir(cwd, &task); err != nil {
				return "", false, err
			}
			if resourceDirNameMatches(filepath.Base(cwd), &task) && !isArchivedPath(root, cwd) {
				return task.ID, true, nil
			}
		}
		if cwd == root {
			return "", false, nil
		}
		parent := filepath.Dir(cwd)
		if parent == cwd {
			return "", false, nil
		}
		cwd = parent
	}
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

		if !pathExists(filepath.Join(path, projectJSONFile)) && !pathExists(filepath.Join(path, taskJSONFile)) {
			return nil
		}
		resource, err := readResourceAtDir(path)
		if err != nil {
			return nil
		}
		return updateTaskAgentsMD(root, path, resource)
	})
}

func updateTaskAgentsMD(root, dir string, resource Resource) error {
	path := filepath.Join(dir, "AGENTS.md")
	workflow := resource.resourceMeta().Workflow
	if workflow == "" {
		workflow = defaultWorkflowName
	}
	workflowContent, err := resolveWorkflow(root, workflow, workflow == defaultWorkflowName)
	if err != nil {
		return err
	}
	block := taskAgentsBlock(resource, workflowContent)

	content := ""
	if data, err := os.ReadFile(path); err == nil {
		content = string(data)
	} else if !os.IsNotExist(err) {
		return err
	}
	if strings.TrimSpace(content) == strings.TrimSpace(taskAgentsPrompt(resource, workflowContent)) {
		content = ""
	}

	updated, err := upsertManagedBlock(content, block)
	if err != nil {
		return err
	}
	return os.WriteFile(path, []byte(updated), 0o644)
}

func taskAgentsBlock(resource Resource, workflowContent string) string {
	return forgePromptStart + "\n" + taskAgentsPrompt(resource, workflowContent) + "\n" + forgePromptEnd
}

func projectTaskName(projectID string) *regexp.Regexp {
	return regexp.MustCompile(`^` + regexp.QuoteMeta(projectID) + `\.task([0-9]+)$`)
}

func projectDirectoryName(id, slug string) string {
	return withResourceSlug(id, slug)
}

func taskDirectoryName(id string, slug ...string) string {
	projectID, suffix, ok := strings.Cut(id, ".task")
	name := id
	if ok && topProjectName.MatchString(projectID) && suffix != "" {
		name = "task" + suffix
	}
	if len(slug) > 0 {
		return withResourceSlug(name, slug[0])
	}
	return name
}

func withResourceSlug(name, slug string) string {
	if slug == "" {
		return name
	}
	return name + "-" + slug
}

func normalizeResourceSlug(slug string) (string, error) {
	slug = strings.TrimSpace(slug)
	if slug == "" {
		return "", nil
	}
	if !resourceSlugName.MatchString(slug) {
		return "", fmt.Errorf("invalid slug %q: use only letters, numbers, dot, underscore, or hyphen, and start with a letter or number", slug)
	}
	return slug, nil
}

func resourceDirNameMatches(name string, resource Resource) bool {
	meta := resource.resourceMeta()
	if isProject(resource) {
		return resourceDirNameID(name, topProjectDirName, "project") == meta.ID
	}
	if _, ok := resource.(*Task); ok {
		if name == meta.ID {
			return true
		}
		return resourceDirNameID(name, taskDirName, "task") == taskDirectoryName(meta.ID)
	}
	return false
}

func resourceDirNameID(name string, pattern *regexp.Regexp, prefix string) string {
	match := pattern.FindStringSubmatch(name)
	if match == nil {
		return ""
	}
	return prefix + match[1]
}

func isProject(resource Resource) bool {
	_, ok := resource.(*Project)
	return ok
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
	return printJSON(task)
}

func defaultTaskMD(resource Resource) string {
	meta := resource.resourceMeta()
	description := ""
	switch typed := resource.(type) {
	case *Project:
		description = typed.Description
	case *Task:
		description = typed.Description
	}
	return taskMarkdown(meta.Title, description)
}

func taskMarkdown(title string, detail string) string {
	detail = strings.TrimSpace(detail)
	if detail == "" {
		detail = "<!-- Why this work exists. Keep the durable contract here; task execution state belongs in work.md. -->"
	}
	return fmt.Sprintf(`# %s

## Background

%s

## Scope

<!-- Define what is included. Add Out of Scope, Constraints, Decisions, or Open Questions when they affect the task contract. -->

## Acceptance Criteria

<!-- List observable results that mean this is done. -->
- TBD
`, title, detail)
}

func defaultWorkMD(resource Resource) string {
	meta := resource.resourceMeta()
	label := "Task"
	focus := "Clarify the task contract in task.md, then record the current execution state and next action here."
	return fmt.Sprintf(`# Work

## Focus

%s %s has been created. %s

<!--
Optional modules. Copy only useful modules below this comment, keep them current, and delete empty modules.
Do not restate the task background, scope, acceptance criteria, or stable decisions here; keep those in task.md.

## Todo
Use for short-term actions needed by the next agent. Put completed history in log.jsonl.
- [ ] Next concrete action.

## Blockers
Use only when work cannot continue without user input or an external change.
- Blocker: what is blocked, what is needed, and who or what can resolve it.

## Active Work
Use when there is an in-progress implementation, investigation, or review thread with local state worth preserving.
- Focus: current thread.
- Files: relevant paths.
- Notes: state needed to resume.

## Paused Work
Use when temporarily switching away from unfinished work.
- Paused thread: where to resume, why it paused, and what should happen next.

## Resume Plan
Use after interruption or handoff when order matters.
1. First recovery step.
2. Next recovery step.

## Context
Use for useful transient context that is not durable enough for task.md.
- Fact, assumption, or constraint relevant to resuming.

## Resources
Use for unpredictable links and external ids that do not belong in task.json.
- PR: URL or id.
- CI: run id or URL.
- Image: tag.
- Deployment: URL.
- Related task: id.

## Verification
Use for checks already run or still needed when that helps the next agent.
- [x] Command or check that passed.
- [ ] Command or check not run yet.

## Notes
Use sparingly for recovery notes that do not fit another module.
- Note.
-->
`, label, meta.ID, focus)
}

func workMDGuidance(resourceName string) string {
	return fmt.Sprintf("Use %s as a replaceable recovery checkpoint: record only the current focus, next actions, blockers, and state needed to resume. Do not repeat the task contract or append completed-step history. Keep optional modules only when useful, delete empty modules, and put arbitrary resource links or IDs in Resources.", resourceName)
}

func markdownGuidance(resourceName string) string {
	return fmt.Sprintf("Use %s as the durable contract: record why the work exists, what is in or out of scope, what constraints and decisions remain valid, and how completion will be judged.", resourceName)
}

func jsonGuidance(resourceName string) string {
	return fmt.Sprintf("Keep %s focused on structured facts Forge already understands; use Markdown for arbitrary notes, links, IDs, and progress.", resourceName)
}

func taskAgentsPrompt(resource Resource, workflowContent string) string {
	extra := ""
	title := "Task Agent Instructions"
	scope := "single AgentWorkspace task directory"
	boundary := "Treat this directory as the current task boundary."
	writeScope := "Only update files inside this task directory and its worktrees."
	repoGuidance := "For code changes, create Git worktrees under worktree/."
	workflowPath := workflowRelativePath(resource)
	if isProject(resource) {
		title = "Project Agent Instructions"
		scope = "single AgentWorkspace project directory"
		boundary = "Treat this directory as the current project boundary."
		writeScope = "Only update files inside this project directory unless a task directory has been explicitly selected."
		repoGuidance = "Projects do not manage repositories or worktrees. For code changes, create tasks and put task-specific Git worktrees under each task's worktree/ directory."
	} else if _, ok := resource.(*Task); ok {
		extra = `
- This task belongs to a project. Read the parent project directory's project.json, project.md, and log.jsonl when you need broader context.
- Parent project files are reference context; keep your edits scoped to this task directory and its worktrees unless the user explicitly asks otherwise.
`
	}
	readLine := "Read task.json, task.md, work.md, and log.jsonl before acting."
	updateLine := "If the task involves a new repository, update this task's task.json."
	structuredLine := jsonGuidance("task.json")
	backgroundLine := markdownGuidance("task.md")
	recoveryLine := workMDGuidance("work.md")
	pendingLine := "Keep questions that can change scope, acceptance criteria, or stable constraints in task.md; ask the user to resolve them before implementation when necessary. Keep short-lived execution questions in work.md. When investigation produces a durable decision, promote it to task.md and remove the temporary work.md note."
	if isProject(resource) {
		readLine = "Read project.json, project.md, and log.jsonl before acting."
		updateLine = "Create or update tasks when repository or worktree state is needed; do not store repository metadata on the project."
		structuredLine = jsonGuidance("project.json")
		backgroundLine = markdownGuidance("project.md")
		recoveryLine = "Keep transient implementation state in task work.md files; projects do not have a work.md recovery snapshot."
		pendingLine = "Keep questions that can change project scope, acceptance criteria, or stable constraints in project.md; ask the user to resolve them when necessary, then record the durable answer there."
	}
	return fmt.Sprintf(`# %s

You are working inside a %s.

- Read the workspace root AGENTS.md file for global Forge workflow, session, lock, and file-role rules.
- %s
- %s
- Forge session ownership: if `+"`FORGE_SESSION_ID`"+` is set in the environment or supplied in injected Forge session context, reuse it; the outer launcher already registered the session and locked this directory's resource, so do not create another session, do not lock/unlock this directory's resource, and do not end the outer session.
- Determine whether this run is `+"`interactive`"+` or `+"`non_interactive`"+` from `+"`FORGE_INTERACTION_MODE`"+` or the injected session context. A non-interactive run is one turn: before finishing, call exactly one of `+"`forge task run complete`"+`, `+"`forge task run wait`"+`, `+"`forge task run pause`"+`, or `+"`forge task run fail`"+`, then end the response normally. Do not end the session yourself.
- In a non-interactive run, create delegated work with `+"`forge task create --non-interactive --prompt=<prompt> <title>`"+`; suspend the current run with `+"`forge task run wait --after=<task@generation> --summary=<text>`"+`; and record successful completion with `+"`forge task run complete --summary=<text>`"+`.
- If `+"`FORGE_SESSION_ID`"+` is not available from the environment or injected session context, detect your current agent PID, run `+"`forge session new --pid <pid>`"+`, export the printed id as `+"`FORGE_SESSION_ID`"+`, and lock this directory's resource once before updating project/task data.
- When accessing another project/task directory outside this locked resource, take a temporary lock with `+"`forge session lock --id=$FORGE_SESSION_ID`"+` using explicit `+"`--project`"+`/`+"`--task`"+` selectors, then release that temporary lock with `+"`forge session unlock --id=$FORGE_SESSION_ID`"+` when finished.
- You may read other task directories for reference.
- %s
- Treat workspace repos/ checkouts as shared source caches; make code changes in task worktrees.
- %s
- %s
- %s
- %s
- %s
- %s
- Follow the selected workflow in %s.
- Record important execution events with `+"`forge task log add <title> --details <details>`"+` when working in a task, or `+"`forge project log add <title> --details <details>`"+` when working in a project.
- Put generated reports, screenshots, patches, and other outputs under artifacts/.
%s
`, title, scope, readLine, boundary, writeScope, repoGuidance, updateLine, structuredLine, backgroundLine, recoveryLine, pendingLine, workflowPath, extra)
}

func workflowRelativePath(resource Resource) string {
	workflow := resource.resourceMeta().Workflow
	if workflow == "" {
		workflow = defaultWorkflowName
	}
	if _, ok := resource.(*Task); ok {
		return filepath.ToSlash(filepath.Join("..", "..", workflowDir, workflow+".md"))
	}
	return filepath.ToSlash(filepath.Join("..", workflowDir, workflow+".md"))
}
