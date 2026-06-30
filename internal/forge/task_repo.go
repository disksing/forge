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

type taskRepoAddOptions struct {
	taskID       string
	name         string
	worktreePath string
	branch       string
	targetBranch string
	baseBranch   string
}

func taskRepoAdd(args []string) error {
	opts, err := parseTaskRepoAdd(args)
	if err != nil {
		return err
	}

	root, err := findWorkspaceRoot()
	if err != nil {
		return err
	}
	taskPath, task, err := loadOpenTask(root, opts.taskID)
	if err != nil {
		return err
	}
	if isProject(task) {
		return fmt.Errorf("projects do not manage repositories or worktrees: %s", task.ID)
	}

	name := strings.TrimSuffix(strings.TrimSpace(opts.name), ".git")
	if err := ensureInsideName(name); err != nil {
		return err
	}
	storagePath, bare := resolveRepoStoragePath(root, name)
	if storagePath == "" {
		return fmt.Errorf("repository not found: %s or %s", relPath(root, repoPath(root, name, false)), relPath(root, repoPath(root, name, true)))
	}

	worktreeAbs := ""
	if opts.worktreePath == "" {
		worktreeAbs = filepath.Join(taskPath, "worktree", repoLeafName(name))
	} else if filepath.IsAbs(opts.worktreePath) {
		worktreeAbs = filepath.Clean(opts.worktreePath)
	} else {
		cwd, err := os.Getwd()
		if err != nil {
			return err
		}
		worktreeAbs = filepath.Join(cwd, opts.worktreePath)
	}
	worktreeRel, err := workspaceRelativePath(root, worktreeAbs)
	if err != nil {
		return err
	}

	branch := opts.branch
	if branch == "" {
		branch = currentGitBranch(worktreeAbs)
	}
	targetBranch := opts.targetBranch
	if targetBranch == "" {
		targetBranch = repoDefaultBranch(storagePath, bare)
	}

	repo := TaskRepo{
		Name:         name,
		RepoPath:     relPath(root, storagePath),
		WorktreePath: worktreeRel,
		Branch:       branch,
		TargetBranch: targetBranch,
		BaseBranch:   opts.baseBranch,
	}
	if bare {
		repo.BarePath = repo.RepoPath
		repo.RepoPath = ""
	}
	upsertTaskRepo(&task, repo)
	return saveAndPrintTask(taskPath, task)
}

func parseTaskRepoAdd(args []string) (taskRepoAddOptions, error) {
	const usage = "usage: forge task repo add [--project=<project>] [--task=<task>] <repo-name> [--worktree <path>] [--branch <branch>] [--target <branch>] [--base <branch>]"
	opts := taskRepoAddOptions{}
	projectID, task, err := parseTaskSelectorAndApply(args, usage, func(arg string, next func() (string, bool)) error {
		if !strings.HasPrefix(arg, "--") {
			if opts.name != "" {
				return fmt.Errorf("unexpected positional argument %q", arg)
			}
			opts.name = arg
			return nil
		}
		value, ok := next()
		if !ok {
			return fmt.Errorf("%s requires a value", arg)
		}
		switch arg {
		case "--worktree":
			opts.worktreePath = value
		case "--branch":
			opts.branch = value
		case "--target":
			opts.targetBranch = value
		case "--base":
			opts.baseBranch = value
		default:
			return fmt.Errorf("unknown task repo add option %q", arg)
		}
		return nil
	})
	if err != nil {
		return taskRepoAddOptions{}, err
	}
	if opts.name == "" {
		return taskRepoAddOptions{}, fmt.Errorf(usage)
	}
	opts.taskID, err = resolveTaskSelector(projectID, task, "repo add")
	if err != nil {
		return taskRepoAddOptions{}, err
	}
	return opts, nil
}

func taskRepoList(args []string) error {
	taskID, err := parseTaskRepoTarget(args, "list")
	if err != nil {
		return err
	}
	root, err := findWorkspaceRoot()
	if err != nil {
		return err
	}
	_, task, err := loadTask(root, taskID)
	if err != nil {
		return err
	}
	if isProject(task) {
		return fmt.Errorf("projects do not manage repositories or worktrees: %s", task.ID)
	}
	for _, repo := range task.Repos {
		fmt.Printf("%s\t%s\t%s\t%s\t%s", repo.Name, taskRepoStoragePath(repo), repo.WorktreePath, repo.Branch, repo.TargetBranch)
		if repo.BaseBranch != "" {
			fmt.Printf("\t%s", repo.BaseBranch)
		}
		fmt.Println()
	}
	return nil
}

func taskRepoRemove(args []string) error {
	const usage = "usage: forge task repo remove [--project=<project>] [--task=<task>] <repo-name>"
	var name string
	projectID, task, err := parseTaskSelectorAndApply(args, usage, func(arg string, _ func() (string, bool)) error {
		if strings.HasPrefix(arg, "--") {
			return fmt.Errorf("unknown task repo remove option %q", arg)
		}
		if name != "" {
			return fmt.Errorf("unexpected positional argument %q", arg)
		}
		name = arg
		return nil
	})
	if err != nil {
		return err
	}
	if name == "" {
		return fmt.Errorf(usage)
	}
	taskID, err := resolveTaskSelector(projectID, task, "repo remove")
	if err != nil {
		return err
	}
	return removeTaskRepo(taskID, name)
}

func parseTaskRepoTarget(args []string, command string) (string, error) {
	usage := fmt.Sprintf("usage: forge task repo %s [--project=<project>] [--task=<task>]", command)
	projectID, task, err := parseTaskSelectorAndApply(args, usage, func(arg string, _ func() (string, bool)) error {
		return fmt.Errorf("unknown task repo %s option %q", command, arg)
	})
	if err != nil {
		return "", err
	}
	return resolveTaskSelector(projectID, task, "repo "+command)
}

func parseTaskSelectorAndApply(args []string, usage string, apply func(string, func() (string, bool)) error) (string, string, error) {
	var projectID string
	var task string
	for i := 0; i < len(args); i++ {
		arg := args[i]
		next := func() (string, bool) {
			if i+1 >= len(args) || strings.HasPrefix(args[i+1], "--") {
				return "", false
			}
			i++
			return args[i], true
		}
		switch {
		case strings.HasPrefix(arg, "--project="):
			value := strings.TrimPrefix(arg, "--project=")
			if value == "" {
				return "", "", fmt.Errorf("project cannot be empty")
			}
			if projectID != "" {
				return "", "", fmt.Errorf(usage)
			}
			normalized, err := normalizeProjectArg(value)
			if err != nil {
				return "", "", err
			}
			projectID = normalized
		case arg == "--project":
			value, ok := next()
			if !ok {
				return "", "", fmt.Errorf(usage)
			}
			if projectID != "" {
				return "", "", fmt.Errorf(usage)
			}
			normalized, err := normalizeProjectArg(value)
			if err != nil {
				return "", "", err
			}
			projectID = normalized
		case strings.HasPrefix(arg, "--task="):
			value := strings.TrimPrefix(arg, "--task=")
			if value == "" {
				return "", "", fmt.Errorf("task cannot be empty")
			}
			if task != "" {
				return "", "", fmt.Errorf(usage)
			}
			task = value
		case arg == "--task":
			value, ok := next()
			if !ok {
				return "", "", fmt.Errorf(usage)
			}
			if task != "" {
				return "", "", fmt.Errorf(usage)
			}
			task = value
		default:
			if err := apply(arg, next); err != nil {
				return "", "", err
			}
		}
	}
	return projectID, strings.TrimSpace(task), nil
}

func resolveTaskSelector(projectID, task, command string) (string, error) {
	if task == "" {
		inferred, ok, err := inferCurrentTaskID()
		if err != nil {
			return "", err
		}
		if !ok {
			return "", fmt.Errorf("could not infer current task; use forge task %s --task=<task>", command)
		}
		return inferred, nil
	}
	return normalizeTaskArg(projectID, task)
}

func removeTaskRepo(id, name string) error {
	root, err := findWorkspaceRoot()
	if err != nil {
		return err
	}
	taskPath, task, err := loadOpenTask(root, cleanID(id))
	if err != nil {
		return err
	}
	if isProject(task) {
		return fmt.Errorf("projects do not manage repositories or worktrees: %s", task.ID)
	}
	name = strings.TrimSuffix(strings.TrimSpace(name), ".git")
	if err := ensureInsideName(name); err != nil {
		return err
	}

	next := task.Repos[:0]
	removed := false
	for _, repo := range task.Repos {
		if repo.Name == name {
			removed = true
			continue
		}
		next = append(next, repo)
	}
	if !removed {
		return fmt.Errorf("task %s does not include repo %s", task.ID, name)
	}
	task.Repos = next
	return saveAndPrintTask(taskPath, task)
}

func loadTask(root, id string) (string, Task, error) {
	taskPath, err := findTaskDir(root, id)
	if err != nil {
		return "", Task{}, err
	}
	var task Task
	if err := readResourceAtDir(taskPath, &task); err != nil {
		return "", Task{}, err
	}
	return taskPath, task, nil
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

func saveAndPrintTask(taskPath string, task Task) error {
	task.UpdatedAt = time.Now().Format(time.RFC3339)
	if err := writeResourceMetadata(taskPath, task); err != nil {
		return err
	}
	return printTaskJSON(task)
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
