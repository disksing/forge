package app

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"sort"
	"strings"
)

func loadTask(root, id string) (string, Task, error) {
	taskPath, err := findResourceDir(root, id)
	if err != nil {
		return "", Task{}, err
	}
	var task Task
	if err := readTaskAtDir(taskPath, &task); err != nil {
		return "", Task{}, err
	}
	return taskPath, task, nil
}

func loadResource(root, id string) (string, Resource, error) {
	path, err := findResourceDir(root, id)
	if err != nil {
		return "", nil, err
	}
	resource, err := readResourceAtDir(path)
	if err != nil {
		return "", nil, err
	}
	return path, resource, nil
}

func loadOpenResource(root, id string) (string, Resource, error) {
	path, resource, err := loadResource(root, id)
	if err != nil {
		return "", nil, err
	}
	if isArchivedPath(root, path) {
		return "", nil, fmt.Errorf("cannot update archived resource: %s", resource.resourceMeta().ID)
	}
	return path, resource, nil
}

func loadOpenTask(root, id string) (string, Task, error) {
	taskPath, task, err := loadTask(root, id)
	if err != nil {
		return "", Task{}, err
	}
	if isArchivedPath(root, taskPath) {
		return "", Task{}, fmt.Errorf("cannot update archived task: %s", task.ID)
	}
	return taskPath, task, nil
}

func upsertTaskRepo(task *Task, repo TaskRepo) {
	for i := range task.Repos {
		if task.Repos[i].Name == repo.Name {
			task.Repos[i] = repo
			return
		}
	}
	task.Repos = append(task.Repos, repo)
	sort.Slice(task.Repos, func(i, j int) bool {
		return task.Repos[i].Name < task.Repos[j].Name
	})
}

func repoLeafName(name string) string {
	parts := strings.Split(filepath.ToSlash(strings.TrimSuffix(name, ".git")), "/")
	return parts[len(parts)-1]
}

func workspaceRelativePath(root, path string) (string, error) {
	rel, err := filepath.Rel(root, filepath.Clean(path))
	if err != nil {
		return "", err
	}
	if rel == "." || strings.HasPrefix(rel, ".."+string(filepath.Separator)) || rel == ".." {
		return "", fmt.Errorf("path must be inside workspace: %s", slash(path))
	}
	return slash(rel), nil
}

func currentGitBranch(worktreePath string) string {
	if !isDir(worktreePath) {
		return ""
	}
	cmd := exec.Command("git", "-C", worktreePath, "rev-parse", "--abbrev-ref", "HEAD")
	out, err := cmd.Output()
	if err != nil {
		return ""
	}
	branch := strings.TrimSpace(string(out))
	if branch == "HEAD" {
		return ""
	}
	return branch
}

func resolveRepoStoragePath(root, name string) (string, bool) {
	normalPath := repoPath(root, name, false)
	if isDir(normalPath) && isGitCheckout(normalPath) {
		return normalPath, false
	}
	barePath := repoPath(root, name, true)
	if isDir(barePath) && pathExists(filepath.Join(barePath, "HEAD")) {
		return barePath, true
	}
	return "", false
}

func taskRepoStoragePath(repo TaskRepo) string {
	if repo.RepoPath != "" {
		return repo.RepoPath
	}
	return repo.BarePath
}

func repoDefaultBranch(storagePath string, bare bool) string {
	if bare {
		return bareDefaultBranch(storagePath)
	}
	if branch := gitOutput(storagePath, "rev-parse", "--abbrev-ref", "origin/HEAD"); branch != "" {
		return strings.TrimPrefix(branch, "origin/")
	}
	return currentGitBranch(storagePath)
}

func gitOutput(path string, args ...string) string {
	if !isDir(path) {
		return ""
	}
	cmdArgs := append([]string{"-C", path}, args...)
	cmd := exec.Command("git", cmdArgs...)
	out, err := cmd.Output()
	if err != nil {
		return ""
	}
	return strings.TrimSpace(string(out))
}

func bareDefaultBranch(barePath string) string {
	data, err := os.ReadFile(filepath.Join(barePath, "HEAD"))
	if err != nil {
		return ""
	}
	head := strings.TrimSpace(string(data))
	return strings.TrimPrefix(head, "ref: refs/heads/")
}
