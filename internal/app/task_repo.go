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

// discoverTaskRepos derives the repositories used by a Task by scanning the
// Task's worktree/ directory. Every direct child with usable Git metadata is
// treated as a worktree; the source repository, branch, and target branch are
// read from Git metadata instead of task.json.
func discoverTaskRepos(root, taskPath string) []TaskRepo {
	entries, err := os.ReadDir(filepath.Join(taskPath, "worktree"))
	if err != nil {
		return nil
	}
	repos := make([]TaskRepo, 0, len(entries))
	for _, entry := range entries {
		if !entry.IsDir() {
			continue
		}
		worktreePath := filepath.Join(taskPath, "worktree", entry.Name())
		gitDir := worktreeGitDir(worktreePath)
		if gitDir == "" {
			continue
		}
		repo := TaskRepo{
			Name:         entry.Name(),
			WorktreePath: relPath(root, worktreePath),
			Branch:       worktreeBranch(gitDir),
		}
		if storage, bare := worktreeRepoStorage(gitDir); storage != "" {
			if _, err := workspaceRelativePath(root, storage); err == nil {
				repo.Name = repositoryName(root, storage, bare)
				if bare {
					repo.BarePath = relPath(root, storage)
				} else {
					repo.RepoPath = relPath(root, storage)
				}
			}
			repo.TargetBranch = repoDefaultBranch(storage, bare)
		}
		repos = append(repos, repo)
	}
	sort.Slice(repos, func(i, j int) bool { return repos[i].WorktreePath < repos[j].WorktreePath })
	return repos
}

// worktreeGitDir resolves the Git metadata directory of a worktree: the
// target of the .git file for linked worktrees, or the .git directory itself
// for plain checkouts. It returns "" when the directory has no usable Git
// metadata.
func worktreeGitDir(worktreePath string) string {
	gitPath := filepath.Join(worktreePath, ".git")
	info, err := os.Stat(gitPath)
	if err != nil {
		return ""
	}
	if info.IsDir() {
		return gitPath
	}
	data, err := os.ReadFile(gitPath)
	if err != nil {
		return ""
	}
	target, ok := strings.CutPrefix(strings.TrimSpace(string(data)), "gitdir:")
	if !ok {
		return ""
	}
	target = strings.TrimSpace(target)
	if target == "" {
		return ""
	}
	if !filepath.IsAbs(target) {
		target = filepath.Join(worktreePath, target)
	}
	return filepath.Clean(target)
}

// worktreeRepoStorage resolves the worktree's source repository from Git
// metadata files without invoking Git, so it keeps working after archive
// moved the worktree. It returns the repository directory (without the .git
// suffix for normal checkouts) and whether the repository is bare.
func worktreeRepoStorage(gitDir string) (string, bool) {
	common := gitDir
	if data, err := os.ReadFile(filepath.Join(gitDir, "commondir")); err == nil {
		common = strings.TrimSpace(string(data))
		if common == "" {
			return "", false
		}
		if !filepath.IsAbs(common) {
			common = filepath.Join(gitDir, common)
		}
		common = filepath.Clean(common)
	}
	if filepath.Base(common) == ".git" {
		return filepath.Dir(common), false
	}
	if pathExists(filepath.Join(common, "HEAD")) {
		return common, true
	}
	return "", false
}

// worktreeBranch reads the checked-out branch from the worktree HEAD file.
// A detached HEAD yields "".
func worktreeBranch(gitDir string) string {
	data, err := os.ReadFile(filepath.Join(gitDir, "HEAD"))
	if err != nil {
		return ""
	}
	branch, ok := strings.CutPrefix(strings.TrimSpace(string(data)), "ref: refs/heads/")
	if !ok {
		return ""
	}
	return branch
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

func bareDefaultBranch(barePath string) string {
	data, err := os.ReadFile(filepath.Join(barePath, "HEAD"))
	if err != nil {
		return ""
	}
	head := strings.TrimSpace(string(data))
	return strings.TrimPrefix(head, "ref: refs/heads/")
}
