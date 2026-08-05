package app

import (
	"errors"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"sort"
	"strings"
	"time"
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

// TaskRepoInput contains the explicit task and repository metadata needed to
// attach a Workspace repository to a task. Relative worktree paths are
// resolved from the Workspace root, never from process cwd.
type TaskRepoInput struct {
	TaskID       string
	Name         string
	WorktreePath string
	Branch       string
	TargetBranch string
	BaseBranch   string
}

// TaskRepos returns the repository metadata recorded on one task.
func (w *Workspace) TaskRepos(taskID string) ([]TaskRepo, error) {
	if err := w.require(); err != nil {
		return nil, err
	}
	_, task, err := loadOpenTask(w.root, cleanID(taskID))
	if err != nil {
		return nil, &APIError{Operation: "list task repositories", Kind: "repo", Workspace: w.root, ResourceID: taskID, Err: err}
	}
	return append([]TaskRepo(nil), task.Repos...), nil
}

// AddTaskRepo records or replaces one repository entry on a task.
func (w *Workspace) AddTaskRepo(input TaskRepoInput) (Task, error) {
	if err := w.require(); err != nil {
		return Task{}, err
	}
	var task Task
	err := withWorkspaceMutationLock(w.root, func() error {
		var err error
		task, err = w.addTaskRepo(input)
		return err
	})
	if err != nil {
		var apiErr *APIError
		if errors.As(err, &apiErr) {
			return Task{}, err
		}
		return Task{}, &APIError{Operation: "add task repository", Kind: "repo", Workspace: w.root, ResourceID: input.TaskID, Err: err}
	}
	return task, nil
}

func (w *Workspace) addTaskRepo(input TaskRepoInput) (Task, error) {
	taskPath, task, err := loadOpenTask(w.root, cleanID(input.TaskID))
	if err != nil {
		return Task{}, &APIError{Operation: "add task repository", Kind: "repo", Workspace: w.root, ResourceID: input.TaskID, Err: err}
	}
	name := strings.TrimSuffix(strings.TrimSpace(input.Name), ".git")
	if err := ensureInsideName(name); err != nil {
		return Task{}, &APIError{Operation: "add task repository", Kind: "repo", Workspace: w.root, ResourceID: task.ID, Err: err}
	}
	storagePath, bare := resolveRepoStoragePath(w.root, name)
	if storagePath == "" {
		return Task{}, &APIError{Operation: "add task repository", Kind: "repo", Workspace: w.root, ResourceID: task.ID, Err: fmt.Errorf("repository not found: %s or %s", relPath(w.root, repoPath(w.root, name, false)), relPath(w.root, repoPath(w.root, name, true)))}
	}
	worktreePath := strings.TrimSpace(input.WorktreePath)
	if worktreePath == "" {
		worktreePath = filepath.Join(taskPath, "worktree", repoLeafName(name))
	} else if !filepath.IsAbs(worktreePath) {
		worktreePath = filepath.Join(w.root, filepath.FromSlash(worktreePath))
	} else {
		worktreePath = filepath.Clean(worktreePath)
	}
	worktreeRel, err := workspaceRelativePath(w.root, worktreePath)
	if err != nil {
		return Task{}, &APIError{Operation: "add task repository", Kind: "repo", Workspace: w.root, ResourceID: task.ID, Path: worktreePath, Err: err}
	}
	branch := strings.TrimSpace(input.Branch)
	if branch == "" {
		branch = currentGitBranch(worktreePath)
	}
	targetBranch := strings.TrimSpace(input.TargetBranch)
	if targetBranch == "" {
		targetBranch = repoDefaultBranch(storagePath, bare)
	}
	repo := TaskRepo{
		Name: name, RepoPath: relPath(w.root, storagePath), WorktreePath: worktreeRel,
		Branch: branch, TargetBranch: targetBranch, BaseBranch: strings.TrimSpace(input.BaseBranch),
	}
	if bare {
		repo.BarePath = repo.RepoPath
		repo.RepoPath = ""
	}
	upsertTaskRepo(&task, repo)
	task.UpdatedAt = time.Now().Format(time.RFC3339)
	if err := writeResourceMetadata(taskPath, &task); err != nil {
		return Task{}, &APIError{Operation: "add task repository", Kind: "repo", Workspace: w.root, ResourceID: task.ID, Err: err}
	}
	return task, nil
}

// RemoveTaskRepo removes one repository entry from a task.
func (w *Workspace) RemoveTaskRepo(taskID, name string) (Task, error) {
	if err := w.require(); err != nil {
		return Task{}, err
	}
	var task Task
	err := withWorkspaceMutationLock(w.root, func() error {
		var err error
		task, err = w.removeTaskRepo(taskID, name)
		return err
	})
	if err != nil {
		var apiErr *APIError
		if errors.As(err, &apiErr) {
			return Task{}, err
		}
		return Task{}, &APIError{Operation: "remove task repository", Kind: "repo", Workspace: w.root, ResourceID: taskID, Err: err}
	}
	return task, nil
}

func (w *Workspace) removeTaskRepo(taskID, name string) (Task, error) {
	taskPath, task, err := loadOpenTask(w.root, cleanID(taskID))
	if err != nil {
		return Task{}, &APIError{Operation: "remove task repository", Kind: "repo", Workspace: w.root, ResourceID: taskID, Err: err}
	}
	name = strings.TrimSuffix(strings.TrimSpace(name), ".git")
	if err := ensureInsideName(name); err != nil {
		return Task{}, &APIError{Operation: "remove task repository", Kind: "repo", Workspace: w.root, ResourceID: task.ID, Err: err}
	}
	repos := task.Repos[:0]
	removed := false
	for _, repo := range task.Repos {
		if repo.Name == name {
			removed = true
			continue
		}
		repos = append(repos, repo)
	}
	if !removed {
		return Task{}, &APIError{Operation: "remove task repository", Kind: "repo", Workspace: w.root, ResourceID: task.ID, Err: errors.New("task does not include repository " + name)}
	}
	task.Repos = repos
	task.UpdatedAt = time.Now().Format(time.RFC3339)
	if err := writeResourceMetadata(taskPath, &task); err != nil {
		return Task{}, &APIError{Operation: "remove task repository", Kind: "repo", Workspace: w.root, ResourceID: task.ID, Err: err}
	}
	return task, nil
}
