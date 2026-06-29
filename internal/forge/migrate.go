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
		fmt.Println("no legacy task directories found")
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
	fmt.Printf("migrated %d projects and %d tasks\n", len(projects), totalTasks)
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
		taskJSON := filepath.Join(path, "task.json")
		if !pathExists(taskJSON) {
			return nil
		}
		var task Task
		if err := readJSON(taskJSON, &task); err != nil {
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
	taskJSON := filepath.Join(path, "task.json")
	if err := readJSON(taskJSON, &task); err != nil {
		return err
	}
	task.ID = newID
	task.Type = taskType
	task.Parent = parent
	task.UpdatedAt = time.Now().Format(time.RFC3339)
	for i := range task.Repos {
		task.Repos[i].WorktreePath = migratePathReference(root, task.Repos[i].WorktreePath, oldRel, newRel)
	}
	if err := writeJSON(taskJSON, task); err != nil {
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

func repairRepoWorktree(root string, repo TaskRepo) error {
	if repo.WorktreePath == "" {
		return nil
	}
	worktreePath := repo.WorktreePath
	if !filepath.IsAbs(worktreePath) {
		worktreePath = filepath.Join(root, worktreePath)
	}
	if !pathExists(filepath.Join(worktreePath, ".git")) {
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

func legacyTaskIDToProjectTaskID(id, oldProjectID, newProjectID string) string {
	suffix := strings.TrimPrefix(id, oldProjectID+".")
	return newProjectID + ".task" + suffix
}

func pathDepth(path string) int {
	return len(strings.Split(filepath.Clean(path), string(filepath.Separator)))
}
