package app

import (
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
var resourceSlugName = regexp.MustCompile(`^[A-Za-z0-9][A-Za-z0-9._-]*$`)

const (
	projectJSONFile = "project.json"
	projectMDFile   = "project.md"
	taskJSONFile    = "task.json"
	taskMDFile      = "task.md"
)

type taskListEntry struct {
	Task Task
	Path string
}

type projectListEntry struct {
	Project Project
	Path    string
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

func newProject(id, title, description string) Project {
	now := time.Now().Format(time.RFC3339)
	return Project{
		ResourceMeta: ResourceMeta{SchemaVersion: resourceSchemaVersion, ID: id, Type: resourceTypeProject, Title: strings.TrimSpace(title), CreatedAt: now, UpdatedAt: now, AgentBinding: defaultAgentBinding()},
		Description:  description,
	}
}

func newTask(id, parent, title, description string) Task {
	now := time.Now().Format(time.RFC3339)
	task := Task{
		ResourceMeta: ResourceMeta{
			SchemaVersion: resourceSchemaVersion,
			ID:            id,
			Type:          resourceTypeTask,
			Title:         strings.TrimSpace(title),
			CreatedAt:     now,
			UpdatedAt:     now,
			AgentBinding:  defaultAgentBinding(),
		},
		Parent:      parent,
		Description: description,
	}
	task.Repos = []TaskRepo{}
	return task
}

func createResourceFiles(dir string, resource Resource, languages ...string) error {
	language := defaultLanguage
	if len(languages) > 0 {
		language = languages[0]
	}
	return createResourceFilesWithMarkdown(dir, resource, defaultTaskMD(resource, language), language)
}

func createResourceFilesWithMarkdown(dir string, resource Resource, markdown, language string) error {
	if pathExists(dir) {
		return fmt.Errorf("task directory already exists: %s", dir)
	}
	subdirs := []string{"artifacts"}
	if isProject(resource) {
		subdirs = append(subdirs, "templates")
	} else {
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
	return os.WriteFile(filepath.Join(dir, "AGENTS.md"), []byte(taskAgentsBlock(resource, language)+"\n"), 0o644)
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

func updateOpenTaskAgentsMD(root, language string) error {
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
		return updateTaskAgentsMD(root, path, resource, language)
	})
}

func updateTaskAgentsMD(root, dir string, resource Resource, language string) error {
	path := filepath.Join(dir, "AGENTS.md")
	block := taskAgentsBlock(resource, language)

	content := ""
	if data, err := os.ReadFile(path); err == nil {
		content = string(data)
	} else if !os.IsNotExist(err) {
		return err
	}
	if strings.TrimSpace(content) == strings.TrimSpace(taskAgentsPrompt(resource, defaultLanguage)) ||
		strings.TrimSpace(content) == strings.TrimSpace(taskAgentsPrompt(resource, languageSimplifiedChinese)) {
		content = ""
	}

	updated, err := upsertManagedBlock(content, block)
	if err != nil {
		return err
	}
	return os.WriteFile(path, []byte(updated), 0o644)
}

func taskAgentsBlock(resource Resource, language string) string {
	return forgePromptStart + "\n" + taskAgentsPrompt(resource, language) + "\n" + forgePromptEnd
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

func defaultTaskMD(resource Resource, language string) string {
	meta := resource.resourceMeta()
	description := ""
	switch typed := resource.(type) {
	case *Project:
		description = typed.Description
	case *Task:
		description = typed.Description
	}
	if language == languageSimplifiedChinese && isProject(resource) {
		return projectMarkdownZH(meta.Title, description)
	}
	return taskMarkdown(meta.Title, description, language)
}

func taskMarkdown(title string, detail string, language string) string {
	if language == languageSimplifiedChinese {
		return taskMarkdownZH(title, detail)
	}
	detail = strings.TrimSpace(detail)
	if detail == "" {
		detail = "<!-- Why this work exists. Keep the durable task contract here. -->"
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

func markdownGuidance(resourceName string) string {
	return fmt.Sprintf("Use %s as the durable contract: record why the work exists, what is in or out of scope, what constraints and decisions remain valid, and how completion will be judged.", resourceName)
}

func jsonGuidance(resourceName string) string {
	return fmt.Sprintf("Keep %s focused on structured facts Forge already understands; use Markdown for arbitrary notes, links, IDs, and progress.", resourceName)
}

func taskAgentsPrompt(resource Resource, language string) string {
	if language == languageSimplifiedChinese {
		return taskAgentsPromptZH(resource)
	}
	extra := ""
	agentsLine := "Always read the parent project AGENTS.md (../AGENTS.md) and workspace root AGENTS.md (../../AGENTS.md) for project conventions and global Workspace file-role rules."
	title := "Task Agent Instructions"
	scope := "single AgentWorkspace task directory"
	boundary := "Treat this directory as the current task boundary."
	writeScope := "Task boundaries are default safeguards against multi-agent conflicts, not absolute restrictions. Explicit user instructions may authorize host-file work outside this task directory, but do not modify another agent's Workspace resource."
	repoGuidance := "For code changes, create Git worktrees under worktree/. When running `git worktree add`, pass an absolute destination path inside this task's worktree/ directory; a relative destination can be resolved from the shared repository when the command uses `git -C`, placing the worktree outside this task."
	if isProject(resource) {
		title = "Project Agent Instructions"
		scope = "single AgentWorkspace project directory"
		boundary = "Treat this directory as the current project boundary."
		writeScope = "Only update files inside this project directory unless a task directory has been explicitly selected."
		repoGuidance = "Projects do not manage repositories or worktrees. For code changes, create tasks and put task-specific Git worktrees under each task's worktree/ directory."
		agentsLine = "Always read the workspace root AGENTS.md (../AGENTS.md) for global Workspace file-role rules."
	} else if _, ok := resource.(*Task); ok {
		extra = `
- This task belongs to a project. Read the parent project directory's project.json and project.md when you need broader context; use project History for conversation context.
- Parent project files are reference context; keep your edits scoped to this task directory and its worktrees unless the user explicitly asks otherwise.
- When creating a task, prefer an existing suitable template from the current project's templates/ directory whenever one is available.
- When creating a task from a template, preserve all existing template rules by default. Do not delete, weaken, bypass, or accidentally override them; override a particular rule only when the user explicitly asks for that override.
`
	}
	readLine := "Read task.json, task.md, and work.md before acting; use resource History when conversation context is needed."
	updateLine := "If the task involves a new repository, update this task's task.json."
	structuredLine := jsonGuidance("task.json")
	backgroundLine := markdownGuidance("task.md")
	recoveryLine := "Recover transient execution context by querying `forge task history --project=<project> --task=<task> --limit=20`, skipping the input currently executing and expanding only relevant, failed, or non-converged Turns with `forge history turn show --ref=...`; then inspect task-owned worktree Git state and related artifacts. Report any history gap and do not create a second permanent progress file."
	pendingLine := "Keep questions that can change scope, acceptance criteria, or stable constraints in task.md; ask the user to resolve them before implementation when necessary. Record durable decisions in task.md."
	if isProject(resource) {
		readLine = "Read project.json and project.md before acting; use project History when conversation context is needed."
		updateLine = "Create or update tasks when repository or worktree state is needed; do not store repository metadata on the project."
		structuredLine = jsonGuidance("project.json")
		backgroundLine = markdownGuidance("project.md")
		recoveryLine = "Recover transient project execution context by querying `forge project history --project=<project> --limit=20`, skipping the input currently executing and expanding only relevant, failed, or non-converged Turns with `forge history turn show --ref=...`; then inspect selected tasks' Git state and artifacts. Report any history gap and keep durable decisions in project.md."
		pendingLine = "Keep questions that can change project scope, acceptance criteria, or stable constraints in project.md; ask the user to resolve them when necessary, then record the durable answer there."
		extra = `
- Project content templates live in templates/*.md. Use schema-version: 2 with title, optional description/task-title, fields, and a Markdown body. Supported field types are text, textarea, select, and boolean.
- Templates organize task content only; runtime Agent and Session settings remain outside templates.
- When creating a task, prefer an existing suitable template whenever one is available.
- When creating a task from a template, preserve all existing template rules by default. Do not delete, weaken, bypass, or accidentally override them; override a particular rule only when the user explicitly asks for that override.
- Template format:

  ` + "```markdown" + `
  ---
  schema-version: 2
  title: Daily inspection
  task-title: "{{ summary }}"
  fields:
    - name: summary
      type: text
      label: Summary
      required: true
  ---
  # {{ summary }}
  ` + "```" + `

- Use forge template list/show/validate/render/create/migrate for deterministic inspection and migration. You may also edit or remove files directly. Created tasks are independent copies and retain only source name, schema version, and digest.
`
	}
	return fmt.Sprintf(`# %s

You are working inside a %s.

- %s
- %s
- %s
`+crossResourceReadGuidanceEnglish+`- %s
- Treat workspace repos/ checkouts as shared source caches; make code changes in task worktrees.
- %s
- %s
- %s
- %s
- %s
- %s
- Read conversation and execution events through the resource History commands.
- Put generated reports, screenshots, patches, and other outputs under artifacts/.
%s
`, title, scope, agentsLine, readLine, boundary, writeScope, repoGuidance, updateLine, structuredLine, backgroundLine, recoveryLine, pendingLine, extra)
}
