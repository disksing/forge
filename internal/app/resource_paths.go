package app

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

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
	gitPath := filepath.Join(worktreePath, ".git")
	info, err := os.Stat(gitPath)
	if err != nil || info.IsDir() {
		return nil
	}
	storage := taskRepoStoragePath(repo)
	if storage == "" {
		return fmt.Errorf("repository storage path is not recorded")
	}
	if !filepath.IsAbs(storage) {
		storage = filepath.Join(root, storage)
	}
	if !isDir(storage) {
		return fmt.Errorf("repository storage path does not exist: %s", relPath(root, storage))
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
