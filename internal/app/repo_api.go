package app

import (
	"errors"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"sort"
	"strings"
)

// Repository describes a repository discovered or cloned under Workspace
// repos/. Path is always Workspace-relative and Bare distinguishes a bare
// repository from a normal checkout.
type Repository struct {
	Name string
	Path string
	Bare bool
}

// Repositories lists repositories stored below the explicit Workspace root.
func (w *Workspace) Repositories() ([]Repository, error) {
	if err := w.require(); err != nil {
		return nil, err
	}
	reposRoot := filepath.Join(w.root, reposDir)
	result := make([]Repository, 0)
	if pathExists(reposRoot) {
		err := filepath.WalkDir(reposRoot, func(path string, entry os.DirEntry, walkErr error) error {
			if walkErr != nil {
				return walkErr
			}
			if !entry.IsDir() {
				return nil
			}
			if isGitCheckout(path) {
				result = append(result, Repository{Name: repositoryName(w.root, path, false), Path: relPath(w.root, path)})
				return filepath.SkipDir
			}
			if strings.HasSuffix(entry.Name(), ".git") && pathExists(filepath.Join(path, "HEAD")) {
				result = append(result, Repository{Name: repositoryName(w.root, path, true), Path: relPath(w.root, path), Bare: true})
				return filepath.SkipDir
			}
			return nil
		})
		if err != nil {
			return nil, &APIError{Operation: "list repositories", Kind: "repo", Workspace: w.root, Err: err}
		}
	}
	sort.Slice(result, func(i, j int) bool { return result[i].Name < result[j].Name })
	return result, nil
}

// CloneRepository clones a repository into the explicit Workspace repos/
// directory and returns the typed destination. Git output is kept in the
// returned error rather than written to process stdout or stderr.
func (w *Workspace) CloneRepository(name, url string, bare bool) (Repository, error) {
	if err := w.require(); err != nil {
		return Repository{}, err
	}
	name = strings.TrimSuffix(strings.TrimSpace(name), ".git")
	if err := ensureInsideName(name); err != nil {
		return Repository{}, &APIError{Operation: "clone repository", Kind: "repo", Workspace: w.root, Err: err}
	}
	if strings.TrimSpace(url) == "" {
		return Repository{}, &APIError{Operation: "clone repository", Kind: "repo", Workspace: w.root, Err: errors.New("url cannot be empty")}
	}
	dest := repoPath(w.root, name, bare)
	if pathExists(dest) {
		return Repository{}, &APIError{Operation: "clone repository", Kind: "repo", Workspace: w.root, Path: relPath(w.root, dest), Err: fmt.Errorf("repository already exists: %s", relPath(w.root, dest))}
	}
	otherDest := repoPath(w.root, name, !bare)
	if pathExists(otherDest) {
		return Repository{}, &APIError{Operation: "clone repository", Kind: "repo", Workspace: w.root, Path: relPath(w.root, otherDest), Err: fmt.Errorf("repository already exists: %s", relPath(w.root, otherDest))}
	}
	if err := os.MkdirAll(filepath.Dir(dest), 0o755); err != nil {
		return Repository{}, &APIError{Operation: "clone repository", Kind: "repo", Workspace: w.root, Path: relPath(w.root, dest), Err: err}
	}
	cloneArgs := []string{"clone"}
	if bare {
		cloneArgs = append(cloneArgs, "--bare")
	}
	cloneArgs = append(cloneArgs, strings.TrimSpace(url), dest)
	out, err := exec.Command("git", cloneArgs...).CombinedOutput()
	if err != nil {
		detail := strings.TrimSpace(string(out))
		if detail == "" {
			detail = err.Error()
		}
		return Repository{}, &APIError{Operation: "clone repository", Kind: "repo", Workspace: w.root, Path: relPath(w.root, dest), Err: errors.New(detail)}
	}
	return Repository{Name: name, Path: relPath(w.root, dest), Bare: bare}, nil
}

func repositoryName(root, path string, bare bool) string {
	name := strings.TrimPrefix(filepath.ToSlash(relPath(root, path)), reposDir+"/")
	if bare {
		name = strings.TrimSuffix(name, ".git")
	}
	return name
}
