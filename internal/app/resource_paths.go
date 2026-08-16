package app

import (
	"fmt"
	"os/exec"
	"path/filepath"
	"strings"
)

// repairRepoWorktree fixes the two-way path references between a moved
// worktree and its source repository. The repository storage is derived from
// the worktree's Git metadata, so no recorded path is required.
func repairRepoWorktree(root string, repo TaskRepo) error {
	if repo.WorktreePath == "" {
		return nil
	}
	worktreePath := repo.WorktreePath
	if !filepath.IsAbs(worktreePath) {
		worktreePath = filepath.Join(root, worktreePath)
	}
	gitDir := worktreeGitDir(worktreePath)
	if gitDir == "" || gitDir == filepath.Join(worktreePath, ".git") {
		// Not a linked worktree; plain checkouts have nothing to repair.
		return nil
	}
	storage := taskRepoStoragePath(repo)
	if storage != "" {
		if !filepath.IsAbs(storage) {
			storage = filepath.Join(root, filepath.FromSlash(storage))
		}
	} else if derived, _ := worktreeRepoStorage(gitDir); derived != "" {
		storage = derived
	}
	if storage == "" || !isDir(storage) {
		return fmt.Errorf("repository storage path could not be determined for worktree %s", relPath(root, worktreePath))
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
