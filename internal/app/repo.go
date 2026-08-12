package app

import "path/filepath"

func repoPath(root, name string, bare bool) string {
	suffix := ""
	if bare {
		suffix = ".git"
	}
	return filepath.Join(root, reposDir, filepath.FromSlash(name)+suffix)
}

func isGitCheckout(path string) bool {
	return pathExists(filepath.Join(path, ".git"))
}
