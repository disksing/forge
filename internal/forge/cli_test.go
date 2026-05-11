package forge

import (
	"bytes"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
)

func TestTaskLifecycle(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		assertDir(t, filepath.Join(root, reposDir))
		assertDir(t, filepath.Join(root, archiveDir))
		assertFile(t, filepath.Join(root, configFile))
		assertFile(t, filepath.Join(root, "AGENTS.md"))

		created := run(t, "task", "create", "Implement the forge MVP")
		if !strings.Contains(created, `"id": "task1"`) {
			t.Fatalf("expected task1 JSON, got:\n%s", created)
		}
		assertFile(t, filepath.Join(root, "task1", "task.json"))
		assertFile(t, filepath.Join(root, "task1", "task.md"))
		assertFile(t, filepath.Join(root, "task1", "work.md"))
		assertFile(t, filepath.Join(root, "task1", "log.md"))
		assertDir(t, filepath.Join(root, "task1", "artifacts"))
		assertDir(t, filepath.Join(root, "task1", "worktree"))
		taskAgents := readFile(t, filepath.Join(root, "task1", "AGENTS.md"))
		if !strings.Contains(taskAgents, "workspace root AGENTS.md") {
			t.Fatalf("expected task AGENTS.md to reference workspace AGENTS.md, got:\n%s", taskAgents)
		}
		if !strings.Contains(taskAgents, "Before starting any meaningful step, update work.md") {
			t.Fatalf("expected task AGENTS.md to require pre-step work.md updates, got:\n%s", taskAgents)
		}
		if !strings.Contains(taskAgents, "Immediately after completing any meaningful step, update work.md") {
			t.Fatalf("expected task AGENTS.md to require post-step work.md updates, got:\n%s", taskAgents)
		}
		taskWork := readFile(t, filepath.Join(root, "task1", "work.md"))
		if !strings.Contains(taskWork, "## Recovery Rule") {
			t.Fatalf("expected work.md to include recovery rule, got:\n%s", taskWork)
		}
		if !strings.Contains(taskWork, "Before starting any meaningful step") || !strings.Contains(taskWork, "Immediately after completing the step") {
			t.Fatalf("expected work.md to describe before/after step updates, got:\n%s", taskWork)
		}
		if strings.Contains(taskAgents, "This is a subtask") {
			t.Fatalf("top-level task AGENTS.md should not contain subtask-only guidance, got:\n%s", taskAgents)
		}

		listed := run(t, "task", "list")
		if !strings.Contains(listed, "task1\tImplement the forge MVP") {
			t.Fatalf("expected task list to include task1, got:\n%s", listed)
		}

		child := run(t, "subtask", "create", "task1", "Add task commands")
		if !strings.Contains(child, `"id": "task1.1"`) {
			t.Fatalf("expected task1.1 JSON, got:\n%s", child)
		}
		assertFile(t, filepath.Join(root, "task1", "task1.1", "task.json"))
		subtaskAgents := readFile(t, filepath.Join(root, "task1", "task1.1", "AGENTS.md"))
		if !strings.Contains(subtaskAgents, "workspace root AGENTS.md") {
			t.Fatalf("expected subtask AGENTS.md to reference workspace AGENTS.md, got:\n%s", subtaskAgents)
		}
		if !strings.Contains(subtaskAgents, "Read the parent task directory's task.json, task.md, work.md, and log.md") {
			t.Fatalf("expected subtask AGENTS.md to reference parent context files, got:\n%s", subtaskAgents)
		}

		children := run(t, "subtask", "list", "task1")
		if !strings.Contains(children, "task1.1\tAdd task commands") {
			t.Fatalf("expected subtask list to include task1.1, got:\n%s", children)
		}

		shown := run(t, "task", "show", "task1.1")
		if !strings.Contains(shown, `"parent": "task1"`) {
			t.Fatalf("expected show to find subtask, got:\n%s", shown)
		}

		archived := run(t, "task", "archive", "task1")
		if !strings.Contains(archived, "archive/task1") {
			t.Fatalf("expected archive path, got:\n%s", archived)
		}
		assertDir(t, filepath.Join(root, archiveDir, "task1"))
		if pathExists(filepath.Join(root, "task1")) {
			t.Fatal("task1 should have moved out of the open workspace")
		}

		next := run(t, "task", "create", "Second task")
		if !strings.Contains(next, `"id": "task2"`) {
			t.Fatalf("expected archived task ids not to be reused, got:\n%s", next)
		}
	})
}

func TestTaskArchiveAllowsMergedRepoWorktree(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "task", "create", "Archive after merge")
		repoPath := filepath.Join(root, reposDir, "disksing", "forge")
		writeGitRepo(t, repoPath, "master")
		worktreePath := filepath.Join(root, "task1", "worktree", "forge")
		runGit(t, repoPath, "worktree", "add", "-b", "agent/task1", worktreePath, "master")
		run(t, "task", "repo", "add", "task1", "disksing/forge", "--worktree", "task1/worktree/forge", "--branch", "agent/task1", "--target", "master")

		archived := run(t, "task", "archive", "task1")
		if !strings.Contains(archived, "archive/task1") {
			t.Fatalf("expected archive path, got:\n%s", archived)
		}
		assertDir(t, filepath.Join(root, archiveDir, "task1"))
	})
}

func TestTaskArchiveRejectsUnmergedRepoWorktree(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "task", "create", "Archive before merge")
		repoPath := filepath.Join(root, reposDir, "disksing", "forge")
		writeGitRepo(t, repoPath, "master")
		worktreePath := filepath.Join(root, "task1", "worktree", "forge")
		runGit(t, repoPath, "worktree", "add", "-b", "agent/task1", worktreePath, "master")
		if err := os.WriteFile(filepath.Join(worktreePath, "feature.txt"), []byte("feature\n"), 0o644); err != nil {
			t.Fatal(err)
		}
		runGit(t, worktreePath, "add", "feature.txt")
		runGit(t, worktreePath, "-c", "user.name=Forge Test", "-c", "user.email=forge@example.com", "commit", "-m", "feature work")
		run(t, "task", "repo", "add", "task1", "disksing/forge", "--worktree", "task1/worktree/forge", "--branch", "agent/task1", "--target", "master")

		out, err := runErr(t, "task", "archive", "task1")
		if err == nil {
			t.Fatalf("expected archive to fail, got stdout:\n%s", out)
		}
		if !strings.Contains(err.Error(), `repo "disksing/forge"`) || !strings.Contains(err.Error(), `not merged into target branch "master"`) || !strings.Contains(err.Error(), "feature work") {
			t.Fatalf("expected clear unmerged commits error, got: %v\nstdout:\n%s", err, out)
		}
		assertDir(t, filepath.Join(root, "task1"))
		if pathExists(filepath.Join(root, archiveDir, "task1")) {
			t.Fatal("task1 should not have been archived")
		}
	})
}

func TestTaskArchiveAllowsMissingRepoWorktree(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "task", "create", "Archive without a checkout")
		writeFakeRepo(t, filepath.Join(root, reposDir, "disksing", "forge"))
		run(t, "task", "repo", "add", "task1", "disksing/forge", "--worktree", "task1/worktree/forge", "--branch", "agent/task1", "--target", "master")

		archived := run(t, "task", "archive", "task1")
		if !strings.Contains(archived, "archive/task1") {
			t.Fatalf("expected archive path, got:\n%s", archived)
		}
		assertDir(t, filepath.Join(root, archiveDir, "task1"))
	})
}

func TestRepoAddClonesNormalCheckoutByDefaultAndBareWithFlag(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		source := filepath.Join(root, "source")
		if err := os.MkdirAll(source, 0o755); err != nil {
			t.Fatal(err)
		}
		runGit(t, source, "init", "-b", "main")
		if err := os.WriteFile(filepath.Join(source, "README.md"), []byte("# source\n"), 0o644); err != nil {
			t.Fatal(err)
		}
		runGit(t, source, "add", "README.md")
		runGit(t, source, "-c", "user.name=Forge Test", "-c", "user.email=forge@example.com", "commit", "-m", "initial")

		added := run(t, "repo", "add", "disksing/forge", source)
		if !strings.Contains(added, "repos/disksing/forge") {
			t.Fatalf("expected normal repo path, got:\n%s", added)
		}
		assertDir(t, filepath.Join(root, reposDir, "disksing", "forge", ".git"))
		assertFile(t, filepath.Join(root, reposDir, "disksing", "forge", "README.md"))
		if pathExists(filepath.Join(root, reposDir, "disksing", "forge.git")) {
			t.Fatal("default repo add should not create a bare .git repository")
		}

		bare := run(t, "repo", "add", "--bare", "disksing/forge-bare", source)
		if !strings.Contains(bare, "repos/disksing/forge-bare.git") {
			t.Fatalf("expected bare repo path, got:\n%s", bare)
		}
		assertFile(t, filepath.Join(root, reposDir, "disksing", "forge-bare.git", "HEAD"))
	})
}

func TestRepoListFindsRepositories(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		writeFakeRepo(t, filepath.Join(root, reposDir, "disksing", "forge"))
		writeFakeBareRepo(t, filepath.Join(root, reposDir, "disksing", "legacy.git"), "master")

		listed := run(t, "repo", "list")
		if !strings.Contains(listed, "disksing/forge\trepos/disksing/forge") {
			t.Fatalf("expected repo list to include fake normal repo, got:\n%s", listed)
		}
		if !strings.Contains(listed, "disksing/legacy\trepos/disksing/legacy.git") {
			t.Fatalf("expected repo list to include fake bare repo, got:\n%s", listed)
		}
	})
}

func TestTaskRepoLifecycle(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "task", "create", "Wire repo metadata into task json")
		writeFakeRepo(t, filepath.Join(root, reposDir, "disksing", "forge"))

		added := run(t, "task", "repo", "add", "task1", "disksing/forge", "--branch", "agent/task1", "--target", "master", "--base", "master")
		if !strings.Contains(added, `"name": "disksing/forge"`) {
			t.Fatalf("expected task JSON to include repo, got:\n%s", added)
		}
		if !strings.Contains(added, `"repoPath": "repos/disksing/forge"`) {
			t.Fatalf("expected task JSON to include repo path, got:\n%s", added)
		}
		if !strings.Contains(added, `"worktreePath": "task1/worktree/forge"`) {
			t.Fatalf("expected default worktree path, got:\n%s", added)
		}

		listed := run(t, "task", "repo", "list", "task1")
		if !strings.Contains(listed, "disksing/forge\trepos/disksing/forge\ttask1/worktree/forge\tagent/task1\tmaster\tmaster") {
			t.Fatalf("expected repo list to include metadata, got:\n%s", listed)
		}

		updated := run(t, "task", "repo", "add", "task1", "disksing/forge", "--worktree", "task1/worktree/custom", "--branch", "agent/updated", "--target", "main")
		if strings.Count(updated, `"name": "disksing/forge"`) != 1 {
			t.Fatalf("expected repo add to update existing entry, got:\n%s", updated)
		}
		if !strings.Contains(updated, `"worktreePath": "task1/worktree/custom"`) {
			t.Fatalf("expected updated worktree path, got:\n%s", updated)
		}
		if !strings.Contains(updated, `"branch": "agent/updated"`) {
			t.Fatalf("expected updated branch, got:\n%s", updated)
		}

		removed := run(t, "task", "repo", "remove", "task1", "disksing/forge")
		if strings.Contains(removed, `"name": "disksing/forge"`) {
			t.Fatalf("expected repo to be removed, got:\n%s", removed)
		}
	})
}

func TestTaskRepoLifecycleSupportsLegacyBareRepos(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "task", "create", "Wire legacy bare repo metadata into task json")
		writeFakeBareRepo(t, filepath.Join(root, reposDir, "disksing", "forge.git"), "master")

		added := run(t, "task", "repo", "add", "task1", "disksing/forge", "--branch", "agent/task1")
		if !strings.Contains(added, `"barePath": "repos/disksing/forge.git"`) {
			t.Fatalf("expected task JSON to include legacy bare path, got:\n%s", added)
		}
		if strings.Contains(added, `"repoPath"`) {
			t.Fatalf("legacy bare repo should not also set repoPath, got:\n%s", added)
		}
		listed := run(t, "task", "repo", "list", "task1")
		if !strings.Contains(listed, "disksing/forge\trepos/disksing/forge.git\ttask1/worktree/forge\tagent/task1\tmaster") {
			t.Fatalf("expected legacy bare repo metadata, got:\n%s", listed)
		}
	})
}

func TestInitUpdatesOnlyManagedAgentsBlock(t *testing.T) {
	withTempCwd(t, func(root string) {
		agentsPath := filepath.Join(root, "AGENTS.md")
		original := "# Human Notes\n\nKeep this line.\n"
		if err := os.WriteFile(agentsPath, []byte(original), 0o644); err != nil {
			t.Fatal(err)
		}

		run(t, "init")
		first := readFile(t, agentsPath)
		if !strings.Contains(first, original) {
			t.Fatalf("expected human content to be preserved, got:\n%s", first)
		}
		if !strings.Contains(first, "Before starting any meaningful step, update the current task's `work.md`") {
			t.Fatalf("expected workspace AGENTS.md to require pre-step work.md updates, got:\n%s", first)
		}
		if !strings.Contains(first, "Immediately after completing any meaningful step, update `work.md`") {
			t.Fatalf("expected workspace AGENTS.md to require post-step work.md updates, got:\n%s", first)
		}
		if strings.Count(first, forgePromptStart) != 1 || strings.Count(first, forgePromptEnd) != 1 {
			t.Fatalf("expected one forge managed block, got:\n%s", first)
		}

		replaced := strings.Replace(first, "This directory is an AgentWorkspace managed by forge.", "old prompt text", 1)
		if err := os.WriteFile(agentsPath, []byte(replaced), 0o644); err != nil {
			t.Fatal(err)
		}
		run(t, "init")
		second := readFile(t, agentsPath)
		if strings.Contains(second, "old prompt text") {
			t.Fatalf("expected managed block to be replaced, got:\n%s", second)
		}
		if !strings.Contains(second, "Keep this line.") {
			t.Fatalf("expected human content to survive replacement, got:\n%s", second)
		}
		if strings.Count(second, forgePromptStart) != 1 || strings.Count(second, forgePromptEnd) != 1 {
			t.Fatalf("expected init to avoid duplicate managed blocks, got:\n%s", second)
		}
	})
}

func withTempCwd(t *testing.T, fn func(root string)) {
	t.Helper()
	root := t.TempDir()
	old, err := os.Getwd()
	if err != nil {
		t.Fatal(err)
	}
	if err := os.Chdir(root); err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() {
		if err := os.Chdir(old); err != nil {
			t.Fatal(err)
		}
	})
	fn(root)
}

func run(t *testing.T, args ...string) string {
	t.Helper()
	out, err := runErr(t, args...)
	if err != nil {
		t.Fatalf("Run(%q) failed: %v\nstdout:\n%s", args, err, out)
	}
	return out
}

func runErr(t *testing.T, args ...string) (string, error) {
	t.Helper()
	var buf bytes.Buffer
	stdout := os.Stdout
	reader, writer, err := os.Pipe()
	if err != nil {
		t.Fatal(err)
	}
	os.Stdout = writer
	err = Run(args)
	if closeErr := writer.Close(); closeErr != nil {
		t.Fatal(closeErr)
	}
	os.Stdout = stdout
	if _, copyErr := io.Copy(&buf, reader); copyErr != nil {
		t.Fatal(copyErr)
	}
	if closeErr := reader.Close(); closeErr != nil {
		t.Fatal(closeErr)
	}
	return buf.String(), err
}

func assertDir(t *testing.T, path string) {
	t.Helper()
	info, err := os.Stat(path)
	if err != nil {
		t.Fatal(err)
	}
	if !info.IsDir() {
		t.Fatalf("expected directory: %s", path)
	}
}

func assertFile(t *testing.T, path string) {
	t.Helper()
	info, err := os.Stat(path)
	if err != nil {
		t.Fatal(err)
	}
	if info.IsDir() {
		t.Fatalf("expected file: %s", path)
	}
}

func readFile(t *testing.T, path string) string {
	t.Helper()
	data, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	return string(data)
}

func writeFakeRepo(t *testing.T, path string) {
	t.Helper()
	if err := os.MkdirAll(filepath.Join(path, ".git"), 0o755); err != nil {
		t.Fatal(err)
	}
}

func writeFakeBareRepo(t *testing.T, path, branch string) {
	t.Helper()
	if err := os.MkdirAll(path, 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(path, "HEAD"), []byte("ref: refs/heads/"+branch+"\n"), 0o644); err != nil {
		t.Fatal(err)
	}
}

func writeGitRepo(t *testing.T, path, branch string) {
	t.Helper()
	if err := os.MkdirAll(path, 0o755); err != nil {
		t.Fatal(err)
	}
	runGit(t, path, "init", "-b", branch)
	if err := os.WriteFile(filepath.Join(path, "README.md"), []byte("# test repo\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	runGit(t, path, "add", "README.md")
	runGit(t, path, "-c", "user.name=Forge Test", "-c", "user.email=forge@example.com", "commit", "-m", "initial")
}

func runGit(t *testing.T, dir string, args ...string) {
	t.Helper()
	cmd := exec.Command("git", args...)
	cmd.Dir = dir
	out, err := cmd.CombinedOutput()
	if err != nil {
		t.Fatalf("git %s failed: %v\n%s", strings.Join(args, " "), err, string(out))
	}
}
