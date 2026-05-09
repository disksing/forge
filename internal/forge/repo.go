package forge

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"sort"
	"strings"
)

func repoAdd(name, url string) error {
	root, err := findWorkspaceRoot()
	if err != nil {
		return err
	}
	name = strings.TrimSuffix(strings.TrimSpace(name), ".git")
	if err := ensureInsideName(name); err != nil {
		return err
	}
	if strings.TrimSpace(url) == "" {
		return fmt.Errorf("url cannot be empty")
	}

	dest := filepath.Join(root, reposDir, filepath.FromSlash(name)+".git")
	if pathExists(dest) {
		return fmt.Errorf("repository already exists: %s", relPath(root, dest))
	}
	if err := os.MkdirAll(filepath.Dir(dest), 0o755); err != nil {
		return err
	}

	cmd := exec.Command("git", "clone", "--bare", url, dest)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	if err := cmd.Run(); err != nil {
		return err
	}

	fmt.Printf("%s\n", relPath(root, dest))
	return nil
}

func repoList() error {
	root, err := findWorkspaceRoot()
	if err != nil {
		return err
	}
	reposRoot := filepath.Join(root, reposDir)
	var repos []string
	if pathExists(reposRoot) {
		err = filepath.WalkDir(reposRoot, func(path string, entry os.DirEntry, walkErr error) error {
			if walkErr != nil {
				return walkErr
			}
			if !entry.IsDir() {
				return nil
			}
			if strings.HasSuffix(entry.Name(), ".git") && pathExists(filepath.Join(path, "HEAD")) {
				repos = append(repos, relPath(root, path))
				return filepath.SkipDir
			}
			return nil
		})
		if err != nil {
			return err
		}
	}

	sort.Strings(repos)
	for _, repo := range repos {
		name := strings.TrimPrefix(repo, reposDir+"/")
		name = strings.TrimSuffix(name, ".git")
		fmt.Printf("%s\t%s\n", name, repo)
	}
	return nil
}
