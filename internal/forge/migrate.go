package forge

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"sort"
	"strings"
	"time"
)

type migrationResource struct {
	OldID       string
	NewID       string
	OldPath     string
	NewPath     string
	OldRel      string
	NewRel      string
	Archived    bool
	ProjectID   string
	ProjectPath string
}

type projectFileMigrationResult struct {
	Projects   int
	SplitTasks int
}

func migrateProjectTasks() error {
	root, err := findWorkspaceRoot()
	if err != nil {
		return err
	}
	projects, err := legacyProjectDirs(root)
	if err != nil {
		return err
	}
	if len(projects) == 0 {
		fileResult, err := migrateProjectFiles(root)
		if err != nil {
			return err
		}
		updated, err := normalizeMigratedWorktreeReferences(root)
		if err != nil {
			return err
		}
		if updated == 0 && fileResult.Projects == 0 && fileResult.SplitTasks == 0 {
			fmt.Println("no legacy task directories found")
			return nil
		}
		if fileResult.Projects > 0 {
			fmt.Printf("migrated %d project metadata files", fileResult.Projects)
			if fileResult.SplitTasks > 0 {
				fmt.Printf(" and created %d task migration records", fileResult.SplitTasks)
			}
			fmt.Println()
		}
		fmt.Printf("updated %d migrated worktree references\n", updated)
		return nil
	}

	staging := filepath.Join(root, ".forge-migrate-project-tasks")
	if pathExists(staging) {
		return fmt.Errorf("migration staging directory already exists: %s", relPath(root, staging))
	}
	if err := os.MkdirAll(staging, 0o755); err != nil {
		return err
	}
	defer os.RemoveAll(staging)

	totalTasks := 0
	for _, projectPath := range projects {
		count, err := migrateLegacyProject(root, staging, projectPath)
		if err != nil {
			return err
		}
		totalTasks += count
	}
	fileResult, err := migrateProjectFiles(root)
	if err != nil {
		return err
	}
	updated, err := normalizeMigratedWorktreeReferences(root)
	if err != nil {
		return err
	}
	fmt.Printf("migrated %d projects and %d tasks\n", len(projects), totalTasks)
	if fileResult.Projects > 0 {
		fmt.Printf("migrated %d project metadata files", fileResult.Projects)
		if fileResult.SplitTasks > 0 {
			fmt.Printf(" and created %d task migration records", fileResult.SplitTasks)
		}
		fmt.Println()
	}
	if updated > 0 {
		fmt.Printf("updated %d migrated worktree references\n", updated)
	}
	return nil
}

func legacyProjectDirs(root string) ([]string, error) {
	var paths []string
	for _, dir := range []string{root, filepath.Join(root, archiveDir)} {
		entries, err := os.ReadDir(dir)
		if err != nil {
			if os.IsNotExist(err) {
				continue
			}
			return nil, err
		}
		for _, entry := range entries {
			if entry.IsDir() && legacyTopTaskName.MatchString(entry.Name()) {
				paths = append(paths, filepath.Join(dir, entry.Name()))
			}
		}
	}
	sort.Slice(paths, func(i, j int) bool {
		return taskSortKey(filepath.Base(paths[i])) < taskSortKey(filepath.Base(paths[j]))
	})
	return paths, nil
}

func migrateLegacyProject(root, staging, oldProjectPath string) (int, error) {
	oldProjectID := filepath.Base(oldProjectPath)
	newProjectID := legacyProjectIDToProjectID(oldProjectID)
	newProjectPath := filepath.Join(filepath.Dir(oldProjectPath), newProjectID)
	if pathExists(newProjectPath) {
		return 0, fmt.Errorf("migration destination already exists: %s", relPath(root, newProjectPath))
	}

	resources, err := collectLegacyProjectTasks(root, oldProjectPath, oldProjectID, newProjectID, newProjectPath)
	if err != nil {
		return 0, err
	}

	sort.Slice(resources, func(i, j int) bool {
		return pathDepth(resources[i].OldPath) > pathDepth(resources[j].OldPath)
	})
	for _, resource := range resources {
		stagePath := filepath.Join(staging, resource.NewID)
		if err := os.MkdirAll(filepath.Dir(stagePath), 0o755); err != nil {
			return 0, err
		}
		if err := os.Rename(resource.OldPath, stagePath); err != nil {
			return 0, err
		}
		resource.NewPath = stagePath
	}

	if err := os.Rename(oldProjectPath, newProjectPath); err != nil {
		return 0, err
	}

	projectOldRel := relPath(root, oldProjectPath)
	projectNewRel := relPath(root, newProjectPath)
	if err := rewriteMigratedResource(root, newProjectPath, oldProjectID, newProjectID, "project", nil, projectOldRel, projectNewRel); err != nil {
		return 0, err
	}

	for _, resource := range resources {
		dstDir := newProjectPath
		if resource.Archived {
			dstDir = filepath.Join(newProjectPath, archiveDir)
		}
		dst := filepath.Join(dstDir, resource.NewID)
		if pathExists(dst) {
			return 0, fmt.Errorf("migration destination already exists: %s", relPath(root, dst))
		}
		if err := os.MkdirAll(dstDir, 0o755); err != nil {
			return 0, err
		}
		stagePath := filepath.Join(staging, resource.NewID)
		if err := os.Rename(stagePath, dst); err != nil {
			return 0, err
		}
		parent := newProjectID
		if err := rewriteMigratedResource(root, dst, resource.OldID, resource.NewID, "task", &parent, resource.OldRel, resource.NewRel); err != nil {
			return 0, err
		}
	}

	return len(resources), nil
}

func collectLegacyProjectTasks(root, oldProjectPath, oldProjectID, newProjectID, newProjectPath string) ([]migrationResource, error) {
	var resources []migrationResource
	err := filepath.WalkDir(oldProjectPath, func(path string, entry os.DirEntry, walkErr error) error {
		if walkErr != nil {
			return walkErr
		}
		if !entry.IsDir() {
			return nil
		}
		if path != oldProjectPath {
			switch entry.Name() {
			case ".git", reposDir, "worktree", "artifacts":
				return filepath.SkipDir
			}
		}
		if path == oldProjectPath {
			return nil
		}
		if !pathExists(filepath.Join(path, projectJSONFile)) && !pathExists(filepath.Join(path, taskJSONFile)) {
			return nil
		}
		var task Task
		if err := readResourceAtDir(path, &task); err != nil {
			return nil
		}
		if !strings.HasPrefix(task.ID, oldProjectID+".") {
			return nil
		}
		newID := legacyTaskIDToProjectTaskID(task.ID, oldProjectID, newProjectID)
		archived := isArchivedPath(root, path)
		newPath := filepath.Join(newProjectPath, newID)
		if archived {
			newPath = filepath.Join(newProjectPath, archiveDir, newID)
		}
		resources = append(resources, migrationResource{
			OldID:     task.ID,
			NewID:     newID,
			OldPath:   path,
			NewPath:   newPath,
			OldRel:    relPath(root, path),
			NewRel:    relPath(root, newPath),
			Archived:  archived,
			ProjectID: newProjectID,
		})
		return nil
	})
	return resources, err
}

func rewriteMigratedResource(root, path, oldID, newID, taskType string, parent *string, oldRel, newRel string) error {
	var task Task
	if err := readResourceAtDir(path, &task); err != nil {
		return err
	}
	task.ID = newID
	task.Type = taskType
	task.Parent = parent
	task.UpdatedAt = time.Now().Format(time.RFC3339)
	for i := range task.Repos {
		task.Repos[i].WorktreePath = migratePathReference(root, task.Repos[i].WorktreePath, oldRel, newRel)
	}
	if taskType == "project" {
		if err := writeJSON(filepath.Join(path, taskJSONFile), task); err != nil {
			return err
		}
	} else if err := writeResourceMetadata(path, task); err != nil {
		return err
	}
	if err := updateTaskAgentsMD(root, path, task); err != nil {
		return err
	}
	for _, repo := range task.Repos {
		if err := repairRepoWorktree(root, repo); err != nil {
			return fmt.Errorf("repair migrated worktree for %s repo %q: %w", newID, repo.Name, err)
		}
	}
	return nil
}

func migrateProjectFiles(root string) (projectFileMigrationResult, error) {
	var result projectFileMigrationResult
	projectPaths, err := projectDirs(root)
	if err != nil {
		return result, err
	}
	for _, projectPath := range projectPaths {
		changed, split, err := migrateOneProjectFile(root, projectPath)
		if err != nil {
			return result, err
		}
		if changed {
			result.Projects++
		}
		if split {
			result.SplitTasks++
		}
	}
	return result, nil
}

func projectDirs(root string) ([]string, error) {
	var paths []string
	for _, dir := range []string{root, filepath.Join(root, archiveDir)} {
		entries, err := os.ReadDir(dir)
		if err != nil {
			if os.IsNotExist(err) {
				continue
			}
			return nil, err
		}
		for _, entry := range entries {
			if entry.IsDir() && topProjectName.MatchString(entry.Name()) {
				paths = append(paths, filepath.Join(dir, entry.Name()))
			}
		}
	}
	sort.Slice(paths, func(i, j int) bool {
		return taskSortKey(filepath.Base(paths[i])) < taskSortKey(filepath.Base(paths[j]))
	})
	return paths, nil
}

func migrateOneProjectFile(root, projectPath string) (bool, bool, error) {
	projectID := filepath.Base(projectPath)
	var project Task
	if err := readResourceAtDir(projectPath, &project); err != nil {
		return false, false, nil
	}
	if !isProject(project) {
		return false, false, nil
	}

	legacyTaskJSON := pathExists(filepath.Join(projectPath, taskJSONFile))
	legacyTaskMD := pathExists(filepath.Join(projectPath, taskMDFile))
	legacyWorktree := isDir(filepath.Join(projectPath, "worktree"))
	legacyRepos := append([]TaskRepo(nil), project.Repos...)
	if !legacyTaskJSON && !legacyTaskMD && !legacyWorktree && len(legacyRepos) == 0 {
		return false, false, nil
	}
	needsSplit := len(legacyRepos) > 0 || legacyWorktree
	legacyMarkdown := ""
	if data, err := os.ReadFile(filepath.Join(projectPath, taskMDFile)); err == nil {
		legacyMarkdown = string(data)
	}

	split := false
	splitID := ""
	if needsSplit {
		id, err := nextProjectTaskID(projectPath, projectID)
		if err != nil {
			return false, false, err
		}
		splitID = id
		taskPath := filepath.Join(projectPath, id)
		parent := projectID
		description := fmt.Sprintf("Migrated legacy work from %s", projectID)
		task := newTask(id, "task", &parent, description, defaultWorkflowName)
		legacyProjectID := legacyProjectIDForProject(projectID)
		task.Repos = migrateProjectReposToTask(root, legacyRepos, []string{
			relPath(root, projectPath),
			legacyProjectID,
			filepath.Join(archiveDir, legacyProjectID),
		}, relPath(root, taskPath))
		workflowContent, err := resolveWorkflow(root, defaultWorkflowName, true)
		if err != nil {
			return false, false, err
		}
		if err := createResourceFiles(taskPath, task, workflowContent); err != nil {
			return false, false, err
		}
		if legacyWorktree {
			dstWorktree := filepath.Join(taskPath, "worktree")
			if err := os.Remove(dstWorktree); err != nil && !os.IsNotExist(err) {
				return false, false, err
			}
			if err := os.Rename(filepath.Join(projectPath, "worktree"), dstWorktree); err != nil {
				return false, false, err
			}
		}
		if err := os.WriteFile(filepath.Join(taskPath, taskMDFile), []byte(migratedTaskMD(project, id, legacyMarkdown)), 0o644); err != nil {
			return false, false, err
		}
		for _, repo := range task.Repos {
			if err := repairRepoWorktree(root, repo); err != nil {
				return false, false, fmt.Errorf("repair migrated worktree for %s repo %q: %w", id, repo.Name, err)
			}
		}
		split = true
	}

	project.ID = projectID
	project.Type = "project"
	project.Parent = nil
	project.Repos = nil
	project.UpdatedAt = time.Now().Format(time.RFC3339)
	project.Description = fmt.Sprintf("Migrated from legacy task %s.", legacyProjectIDForProject(projectID))
	if splitID != "" {
		project.Description += fmt.Sprintf(" Legacy repository and worktree details were moved to %s.", splitID)
	}
	if err := writeResourceMetadata(projectPath, project); err != nil {
		return false, false, err
	}
	if err := os.WriteFile(filepath.Join(projectPath, projectMDFile), []byte(migratedProjectMD(project, splitID)), 0o644); err != nil {
		return false, false, err
	}
	if legacyTaskJSON {
		if err := os.Remove(filepath.Join(projectPath, taskJSONFile)); err != nil && !os.IsNotExist(err) {
			return false, false, err
		}
	}
	if legacyTaskMD {
		if err := os.Remove(filepath.Join(projectPath, taskMDFile)); err != nil && !os.IsNotExist(err) {
			return false, false, err
		}
	}
	if legacyWorktree && isDir(filepath.Join(projectPath, "worktree")) {
		if err := os.Remove(filepath.Join(projectPath, "worktree")); err != nil && !os.IsNotExist(err) {
			return false, false, err
		}
	}
	if err := updateTaskAgentsMD(root, projectPath, project); err != nil {
		return false, false, err
	}
	return legacyTaskJSON || legacyTaskMD || legacyWorktree || len(legacyRepos) > 0, split, nil
}

func migrateProjectReposToTask(root string, repos []TaskRepo, oldRels []string, newRel string) []TaskRepo {
	next := make([]TaskRepo, 0, len(repos))
	for _, repo := range repos {
		for _, oldRel := range oldRels {
			oldWorktreeRel := filepath.Join(oldRel, "worktree")
			newWorktreeRel := filepath.Join(newRel, "worktree")
			repo.WorktreePath = migrateProjectPathReference(root, repo.WorktreePath, oldRel, newRel, oldWorktreeRel, newWorktreeRel)
			repo.RepoPath = migrateProjectPathReference(root, repo.RepoPath, oldRel, newRel, oldWorktreeRel, newWorktreeRel)
			repo.BarePath = migrateProjectPathReference(root, repo.BarePath, oldRel, newRel, oldWorktreeRel, newWorktreeRel)
		}
		next = append(next, repo)
	}
	return next
}

func migrateProjectPathReference(root, value, oldRel, newRel, oldWorktreeRel, newWorktreeRel string) string {
	if migrated := migratePathReference(root, value, oldWorktreeRel, newWorktreeRel); migrated != value {
		return migrated
	}
	return migratePathReference(root, value, oldRel, newRel)
}

func migratedProjectMD(project Task, splitID string) string {
	detail := "Legacy task details were converted into project-level metadata."
	if splitID != "" {
		detail = fmt.Sprintf("Legacy task details, repository metadata, and worktree state were moved to `%s`.", splitID)
	}
	return fmt.Sprintf(`# %s

This project was migrated from legacy task %s.

%s
`, project.Title, legacyProjectIDForProject(project.ID), detail)
}

func migratedTaskMD(project Task, taskID string, legacyMarkdown string) string {
	var b strings.Builder
	fmt.Fprintf(&b, "# Migrated legacy work from %s\n\n", project.ID)
	fmt.Fprintf(&b, "This task was created during project/task migration to hold repository metadata, worktree state, and detailed notes from legacy task `%s`.\n\n", legacyProjectIDForProject(project.ID))
	if strings.TrimSpace(legacyMarkdown) != "" {
		b.WriteString("## Legacy Notes\n\n")
		b.WriteString(strings.TrimRight(legacyMarkdown, " \t\r\n"))
		b.WriteString("\n")
	} else {
		fmt.Fprintf(&b, "Original title: %s\n", project.Title)
	}
	_ = taskID
	return b.String()
}

func migratePathReference(root, value, oldRel, newRel string) string {
	if value == "" {
		return value
	}
	oldRel = filepath.ToSlash(oldRel)
	newRel = filepath.ToSlash(newRel)
	valueSlash := filepath.ToSlash(value)
	if strings.HasPrefix(valueSlash, oldRel+"/") || valueSlash == oldRel {
		return newRel + strings.TrimPrefix(valueSlash, oldRel)
	}
	if filepath.IsAbs(value) {
		oldAbs := filepath.ToSlash(filepath.Join(root, oldRel))
		newAbs := filepath.ToSlash(filepath.Join(root, newRel))
		if strings.HasPrefix(valueSlash, oldAbs+"/") || valueSlash == oldAbs {
			return newAbs + strings.TrimPrefix(valueSlash, oldAbs)
		}
	}
	return value
}

func normalizeMigratedWorktreeReferences(root string) (int, error) {
	resources, err := collectProjectResources(root)
	if err != nil {
		return 0, err
	}
	relMap := map[string]string{}
	for _, resource := range resources {
		for _, oldRel := range legacyRelCandidatesForProjectResource(resource.NewID) {
			relMap[oldRel] = resource.NewRel
		}
	}
	if len(relMap) == 0 {
		return 0, nil
	}

	keys := make([]string, 0, len(relMap))
	for key := range relMap {
		keys = append(keys, key)
	}
	sort.Slice(keys, func(i, j int) bool {
		return len(keys[i]) > len(keys[j])
	})

	updated := 0
	for _, resource := range resources {
		resourcePath := filepath.Join(root, resource.NewRel)
		var task Task
		if err := readResourceAtDir(resourcePath, &task); err != nil {
			return updated, err
		}
		changed := false
		for i := range task.Repos {
			nextWorktree := migrateMappedPathReference(root, task.Repos[i].WorktreePath, relMap, keys)
			if nextWorktree != task.Repos[i].WorktreePath {
				task.Repos[i].WorktreePath = nextWorktree
				changed = true
			}
			nextRepo := migrateMappedPathReference(root, task.Repos[i].RepoPath, relMap, keys)
			if nextRepo != task.Repos[i].RepoPath {
				task.Repos[i].RepoPath = nextRepo
				changed = true
			}
			nextBare := migrateMappedPathReference(root, task.Repos[i].BarePath, relMap, keys)
			if nextBare != task.Repos[i].BarePath {
				task.Repos[i].BarePath = nextBare
				changed = true
			}
		}
		if !changed {
			continue
		}
		task.UpdatedAt = time.Now().Format(time.RFC3339)
		if err := writeResourceMetadata(resourcePath, task); err != nil {
			return updated, err
		}
		updated++
	}
	return updated, nil
}

func collectProjectResources(root string) ([]migrationResource, error) {
	var resources []migrationResource
	for _, dir := range []string{root, filepath.Join(root, archiveDir)} {
		entries, err := readTaskEntriesInDir(dir, topProjectName)
		if err != nil {
			if os.IsNotExist(err) {
				continue
			}
			return nil, err
		}
		for _, entry := range entries {
			resources = append(resources, migrationResource{
				NewID:  entry.Task.ID,
				NewRel: relPath(root, entry.Path),
			})
			taskEntries, err := readTaskEntriesInDirs([]string{entry.Path, filepath.Join(entry.Path, archiveDir)}, projectTaskName(entry.Task.ID))
			if err != nil {
				return nil, err
			}
			for _, taskEntry := range taskEntries {
				resources = append(resources, migrationResource{
					NewID:  taskEntry.Task.ID,
					NewRel: relPath(root, taskEntry.Path),
				})
			}
		}
	}
	return resources, nil
}

func migrateMappedPathReference(root, value string, relMap map[string]string, keys []string) string {
	if value == "" {
		return value
	}
	valueSlash := filepath.ToSlash(value)
	for _, oldRel := range keys {
		newRel := relMap[oldRel]
		if strings.HasPrefix(valueSlash, oldRel+"/") || valueSlash == oldRel {
			return newRel + strings.TrimPrefix(valueSlash, oldRel)
		}
		if filepath.IsAbs(value) {
			oldAbs := filepath.ToSlash(filepath.Join(root, oldRel))
			newAbs := filepath.ToSlash(filepath.Join(root, newRel))
			if strings.HasPrefix(valueSlash, oldAbs+"/") || valueSlash == oldAbs {
				return newAbs + strings.TrimPrefix(valueSlash, oldAbs)
			}
		}
	}
	return value
}

func repairRepoWorktree(root string, repo TaskRepo) error {
	if repo.WorktreePath == "" {
		return nil
	}
	worktreePath := repo.WorktreePath
	if !filepath.IsAbs(worktreePath) {
		worktreePath = filepath.Join(root, worktreePath)
	}
	gitPath := filepath.Join(worktreePath, ".git")
	info, err := os.Stat(gitPath)
	if err != nil || info.IsDir() {
		return nil
	}
	storage := taskRepoStoragePath(repo)
	if storage == "" {
		return nil
	}
	if !filepath.IsAbs(storage) {
		storage = filepath.Join(root, storage)
	}
	if !isDir(storage) {
		return nil
	}
	cmd := exec.Command("git", "-C", storage, "worktree", "repair", worktreePath)
	if out, err := cmd.CombinedOutput(); err != nil {
		detail := strings.TrimSpace(string(out))
		if detail == "" {
			detail = err.Error()
		}
		return fmt.Errorf("%s", detail)
	}
	return nil
}

func legacyProjectIDToProjectID(id string) string {
	return "project" + strings.TrimPrefix(id, "task")
}

func legacyProjectIDForProject(id string) string {
	return "task" + strings.TrimPrefix(id, "project")
}

func legacyTaskIDToProjectTaskID(id, oldProjectID, newProjectID string) string {
	suffix := strings.TrimPrefix(id, oldProjectID+".")
	return newProjectID + ".task" + suffix
}

func legacyRelCandidatesForProjectResource(id string) []string {
	seen := map[string]bool{}
	var candidates []string
	add := func(value string) {
		if value == "" || seen[value] {
			return
		}
		seen[value] = true
		candidates = append(candidates, value)
	}
	if !topProjectName.MatchString(id) {
		projectID, suffix, ok := strings.Cut(id, ".task")
		if !ok || !topProjectName.MatchString(projectID) || suffix == "" {
			return nil
		}
		legacyProjectID := "task" + strings.TrimPrefix(projectID, "project")
		parts := strings.Split(suffix, ".")
		relParts := []string{legacyProjectID}
		current := legacyProjectID
		for _, part := range parts {
			current += "." + part
			relParts = append(relParts, current)
		}
		add(strings.Join(relParts, "/"))
		for archiveAt := 1; archiveAt < len(relParts); archiveAt++ {
			withArchive := append([]string{}, relParts[:archiveAt]...)
			withArchive = append(withArchive, archiveDir)
			withArchive = append(withArchive, relParts[archiveAt:]...)
			add(strings.Join(withArchive, "/"))
		}
		return candidates
	}
	legacyProjectID := "task" + strings.TrimPrefix(id, "project")
	add(legacyProjectID)
	add(filepath.ToSlash(filepath.Join(archiveDir, legacyProjectID)))
	return candidates
}

func pathDepth(path string) int {
	return len(strings.Split(filepath.Clean(path), string(filepath.Separator)))
}
