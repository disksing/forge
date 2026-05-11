package forge

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"sort"
	"strings"
)

type repoAddOptions struct {
	name string
	url  string
	bare bool
}

func repoAdd(args []string) error {
	opts, err := parseRepoAdd(args)
	if err != nil {
		return err
	}

	root, err := findWorkspaceRoot()
	if err != nil {
		return err
	}
	name := strings.TrimSuffix(strings.TrimSpace(opts.name), ".git")
	if err := ensureInsideName(name); err != nil {
		return err
	}
	if strings.TrimSpace(opts.url) == "" {
		return fmt.Errorf("url cannot be empty")
	}

	dest := repoPath(root, name, opts.bare)
	if pathExists(dest) {
		return fmt.Errorf("repository already exists: %s", relPath(root, dest))
	}
	otherDest := repoPath(root, name, !opts.bare)
	if pathExists(otherDest) {
		return fmt.Errorf("repository already exists: %s", relPath(root, otherDest))
	}
	if err := os.MkdirAll(filepath.Dir(dest), 0o755); err != nil {
		return err
	}

	cloneArgs := []string{"clone"}
	if opts.bare {
		cloneArgs = append(cloneArgs, "--bare")
	}
	cloneArgs = append(cloneArgs, opts.url, dest)
	cmd := exec.Command("git", cloneArgs...)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	if err := cmd.Run(); err != nil {
		return err
	}

	fmt.Printf("%s\n", relPath(root, dest))
	return nil
}

func parseRepoAdd(args []string) (repoAddOptions, error) {
	opts := repoAddOptions{}
	for _, arg := range args {
		switch arg {
		case "--bare":
			opts.bare = true
		default:
			if strings.HasPrefix(arg, "--") {
				return repoAddOptions{}, fmt.Errorf("unknown repo add option %q", arg)
			}
			if opts.name == "" {
				opts.name = arg
			} else if opts.url == "" {
				opts.url = arg
			} else {
				return repoAddOptions{}, fmt.Errorf("unexpected positional argument %q", arg)
			}
		}
	}
	if opts.name == "" || opts.url == "" {
		return repoAddOptions{}, fmt.Errorf("usage: forge repo add [--bare] <name> <url>")
	}
	return opts, nil
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
			if isGitCheckout(path) {
				repos = append(repos, relPath(root, path))
				return filepath.SkipDir
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

func repoPath(root, name string, bare bool) string {
	suffix := ""
	if bare {
		suffix = ".git"
	}
	return filepath.Join(root, reposDir, filepath.FromSlash(name)+suffix)
}

func isGitCheckout(path string) bool {
	gitPath := filepath.Join(path, ".git")
	if pathExists(gitPath) {
		return true
	}
	return false
}
