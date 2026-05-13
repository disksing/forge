package forge

import (
	"bytes"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
	"unicode"
)

const (
	defaultWorkflowSnippet = "Standard task workflow. Clarify the requirements and acceptance criteria first"
	projectWorkflowSnippet = "This is a project-management task."
)

func TestTaskLifecycle(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		assertDir(t, filepath.Join(root, reposDir))
		assertDir(t, filepath.Join(root, archiveDir))
		assertDir(t, filepath.Join(root, workflowDir))
		assertFile(t, filepath.Join(root, configFile))
		assertFile(t, filepath.Join(root, "AGENTS.md"))
		assertFile(t, filepath.Join(root, workflowDir, "default.md"))
		assertFile(t, filepath.Join(root, workflowDir, "project.md"))

		created := run(t, "task", "create", "Implement the forge MVP")
		if !strings.Contains(created, `"id": "task1"`) {
			t.Fatalf("expected task1 JSON, got:\n%s", created)
		}
		if !strings.Contains(created, `"workflow": "default"`) {
			t.Fatalf("expected task JSON to record default workflow, got:\n%s", created)
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
		if strings.Count(taskAgents, forgePromptStart) != 1 || strings.Count(taskAgents, forgePromptEnd) != 1 {
			t.Fatalf("expected task AGENTS.md to contain one managed block, got:\n%s", taskAgents)
		}
		if !strings.Contains(taskAgents, "Use work.md as a mutable recovery snapshot, not a chronological log.") {
			t.Fatalf("expected task AGENTS.md to describe work.md as a mutable snapshot, got:\n%s", taskAgents)
		}
		if !strings.Contains(taskAgents, "Do not append timeline history to work.md.") {
			t.Fatalf("expected task AGENTS.md to forbid timeline history in work.md, got:\n%s", taskAgents)
		}
		if !strings.Contains(taskAgents, "If task.md contains pending decisions or unresolved items") {
			t.Fatalf("expected task AGENTS.md to include generic pending-item guidance, got:\n%s", taskAgents)
		}
		if !strings.Contains(taskAgents, defaultWorkflowSnippet) {
			t.Fatalf("expected task AGENTS.md to include default workflow guidance, got:\n%s", taskAgents)
		}
		taskMDPath := filepath.Join(root, "task1", "task.md")
		taskMD := readFile(t, taskMDPath)
		if !strings.Contains(taskMD, "# Implement the forge MVP") || !strings.Contains(taskMD, "Implement the forge MVP") {
			t.Fatalf("expected task.md to contain task background, got:\n%s", taskMD)
		}
		if strings.Contains(taskMD, "## Workflow") || strings.Contains(taskMD, defaultWorkflowSnippet) || strings.Contains(taskMD, "## Notes") {
			t.Fatalf("expected task.md to contain only task background, got:\n%s", taskMD)
		}
		assertNoHan(t, taskMDPath)
		taskWork := readFile(t, filepath.Join(root, "task1", "work.md"))
		if !strings.Contains(taskWork, "## Recovery Rule") {
			t.Fatalf("expected work.md to include recovery rule, got:\n%s", taskWork)
		}
		if !strings.Contains(taskWork, "Keep this file as a mutable recovery snapshot, not a chronological log.") || !strings.Contains(taskWork, "Put dated events, command results, completed-step history, and other timeline entries in log.md.") {
			t.Fatalf("expected work.md to distinguish snapshot from timeline history, got:\n%s", taskWork)
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
		if strings.Count(subtaskAgents, forgePromptStart) != 1 || strings.Count(subtaskAgents, forgePromptEnd) != 1 {
			t.Fatalf("expected subtask AGENTS.md to contain one managed block, got:\n%s", subtaskAgents)
		}
		if !strings.Contains(subtaskAgents, "Read the parent task directory's task.json, task.md, work.md, and log.md") {
			t.Fatalf("expected subtask AGENTS.md to reference parent context files, got:\n%s", subtaskAgents)
		}
		if !strings.Contains(subtaskAgents, "If task.md contains pending decisions or unresolved items") {
			t.Fatalf("expected subtask AGENTS.md to include generic pending-item guidance, got:\n%s", subtaskAgents)
		}
		if !strings.Contains(subtaskAgents, defaultWorkflowSnippet) {
			t.Fatalf("expected subtask AGENTS.md to include default workflow guidance, got:\n%s", subtaskAgents)
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
		openOnly := run(t, "task", "list")
		if strings.Contains(openOnly, "task1\tImplement the forge MVP") {
			t.Fatalf("archived task should not be listed by default, got:\n%s", openOnly)
		}
		allTasks := run(t, "task", "list", "--all")
		if !strings.Contains(allTasks, "task1\tImplement the forge MVP") {
			t.Fatalf("expected task list --all to include archived task, got:\n%s", allTasks)
		}

		next := run(t, "task", "create", "Second task")
		if !strings.Contains(next, `"id": "task2"`) {
			t.Fatalf("expected archived task ids not to be reused, got:\n%s", next)
		}
	})
}

func TestInitWorkflowFilesCreatePreserveAndReset(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		defaultPath := filepath.Join(root, workflowDir, "default.md")
		projectPath := filepath.Join(root, workflowDir, "project.md")
		customPath := filepath.Join(root, workflowDir, "custom.md")

		defaultWorkflow := readFile(t, defaultPath)
		if !strings.Contains(defaultWorkflow, defaultWorkflowSnippet) {
			t.Fatalf("expected built-in default workflow, got:\n%s", defaultWorkflow)
		}
		assertNoHan(t, defaultPath)
		projectWorkflow := readFile(t, projectPath)
		if !strings.Contains(projectWorkflow, projectWorkflowSnippet) {
			t.Fatalf("expected built-in project workflow, got:\n%s", projectWorkflow)
		}
		assertNoHan(t, projectPath)

		if err := os.WriteFile(defaultPath, []byte("custom default\n"), 0o644); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(projectPath, []byte("custom project\n"), 0o644); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(customPath, []byte("custom workflow\n"), 0o644); err != nil {
			t.Fatal(err)
		}

		run(t, "init")
		if got := readFile(t, defaultPath); got != "custom default\n" {
			t.Fatalf("plain init should preserve existing default workflow, got:\n%s", got)
		}
		if got := readFile(t, projectPath); got != "custom project\n" {
			t.Fatalf("plain init should preserve existing project workflow, got:\n%s", got)
		}

		run(t, "init", "--reset-workflows")
		if got := readFile(t, defaultPath); !strings.Contains(got, defaultWorkflowSnippet) || strings.Contains(got, "custom default") {
			t.Fatalf("reset should rewrite built-in default workflow, got:\n%s", got)
		}
		assertNoHan(t, defaultPath)
		if got := readFile(t, projectPath); !strings.Contains(got, projectWorkflowSnippet) || strings.Contains(got, "custom project") {
			t.Fatalf("reset should rewrite built-in project workflow, got:\n%s", got)
		}
		assertNoHan(t, projectPath)
		if got := readFile(t, customPath); got != "custom workflow\n" {
			t.Fatalf("reset should preserve custom workflow files, got:\n%s", got)
		}
	})
}

func TestInitRejectsWorkflowFile(t *testing.T) {
	withTempCwd(t, func(root string) {
		if err := os.WriteFile(filepath.Join(root, workflowDir), []byte("not a directory\n"), 0o644); err != nil {
			t.Fatal(err)
		}
		out, err := runErr(t, "init")
		if err == nil {
			t.Fatalf("expected init to fail when workflow path is a file, got stdout:\n%s", out)
		}
	})
}

func TestTaskCreateUsesWorkflowSections(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		defaultPath := filepath.Join(root, workflowDir, "default.md")
		projectPath := filepath.Join(root, workflowDir, "project.md")
		if err := os.WriteFile(defaultPath, []byte("Default body {{title}}\n"), 0o644); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(projectPath, []byte("Project body {{description}}\n"), 0o644); err != nil {
			t.Fatal(err)
		}

		defaultCreated := run(t, "task", "create", "Default task")
		if !strings.Contains(defaultCreated, `"workflow": "default"`) {
			t.Fatalf("expected default workflow in task JSON, got:\n%s", defaultCreated)
		}
		defaultTaskMD := readFile(t, filepath.Join(root, "task1", "task.md"))
		if !strings.Contains(defaultTaskMD, "# Default task") {
			t.Fatalf("expected task.md skeleton with task background, got:\n%s", defaultTaskMD)
		}
		if strings.Contains(defaultTaskMD, "Default body {{title}}") || strings.Contains(defaultTaskMD, "## Workflow") {
			t.Fatalf("expected workflow body to stay out of task.md, got:\n%s", defaultTaskMD)
		}
		defaultAgents := readFile(t, filepath.Join(root, "task1", "AGENTS.md"))
		if !strings.Contains(defaultAgents, "Default body {{title}}") {
			t.Fatalf("expected task AGENTS.md to include literal default workflow body, got:\n%s", defaultAgents)
		}

		projectCreated := run(t, "task", "create", "--workflow=project", "Project task")
		if !strings.Contains(projectCreated, `"workflow": "project"`) {
			t.Fatalf("expected project workflow in task JSON, got:\n%s", projectCreated)
		}
		projectTaskMD := readFile(t, filepath.Join(root, "task2", "task.md"))
		if !strings.Contains(projectTaskMD, "# Project task") {
			t.Fatalf("expected task.md skeleton with task background, got:\n%s", projectTaskMD)
		}
		if strings.Contains(projectTaskMD, "Project body {{description}}") || strings.Contains(projectTaskMD, "## Workflow") {
			t.Fatalf("expected project workflow body to stay out of task.md, got:\n%s", projectTaskMD)
		}
		projectAgents := readFile(t, filepath.Join(root, "task2", "AGENTS.md"))
		if !strings.Contains(projectAgents, "Project body {{description}}") {
			t.Fatalf("expected task AGENTS.md to include literal project workflow body, got:\n%s", projectAgents)
		}

		if err := os.Remove(defaultPath); err != nil {
			t.Fatal(err)
		}
		fallbackCreated := run(t, "task", "create", "Fallback task")
		if !strings.Contains(fallbackCreated, `"workflow": "default"`) {
			t.Fatalf("expected fallback task JSON to record default workflow, got:\n%s", fallbackCreated)
		}
		fallbackTaskMDPath := filepath.Join(root, "task3", "task.md")
		fallbackTaskMD := readFile(t, fallbackTaskMDPath)
		if strings.Contains(fallbackTaskMD, defaultWorkflowSnippet) || strings.Contains(fallbackTaskMD, "## Workflow") {
			t.Fatalf("expected fallback task.md to contain only task background, got:\n%s", fallbackTaskMD)
		}
		assertNoHan(t, fallbackTaskMDPath)
		fallbackAgents := readFile(t, filepath.Join(root, "task3", "AGENTS.md"))
		if !strings.Contains(fallbackAgents, defaultWorkflowSnippet) {
			t.Fatalf("expected missing default workflow to fallback to built-in AGENTS.md content, got:\n%s", fallbackAgents)
		}

		out, err := runErr(t, "task", "create", "--workflow=default", "Explicit default missing task")
		if err == nil {
			t.Fatalf("expected missing explicit default workflow to fail, got stdout:\n%s", out)
		}
		if !strings.Contains(err.Error(), "workflow not found: workflow/default.md") {
			t.Fatalf("expected missing explicit default workflow error, got: %v\nstdout:\n%s", err, out)
		}

		out, err = runErr(t, "task", "create", "--workflow=missing", "Missing workflow task")
		if err == nil {
			t.Fatalf("expected missing explicit workflow to fail, got stdout:\n%s", out)
		}
		if !strings.Contains(err.Error(), "workflow not found: workflow/missing.md") {
			t.Fatalf("expected missing workflow error, got: %v\nstdout:\n%s", err, out)
		}
		if pathExists(filepath.Join(root, "task4")) {
			t.Fatal("task should not be created when explicit workflow is missing")
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

func TestTaskArchiveSubtaskMovesToParentArchive(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "task", "create", "Parent task")
		run(t, "subtask", "create", "task1", "Child task")

		archived := run(t, "task", "archive", "task1.1")
		if !strings.Contains(archived, "task1/archive/task1.1") {
			t.Fatalf("expected parent-local archive path, got:\n%s", archived)
		}
		assertDir(t, filepath.Join(root, "task1", archiveDir, "task1.1"))
		if pathExists(filepath.Join(root, archiveDir, "task1.1")) {
			t.Fatal("subtask should not have moved to the workspace archive")
		}
		if pathExists(filepath.Join(root, "task1", "task1.1")) {
			t.Fatal("subtask should have moved out of the parent task's open subtasks")
		}

		children := run(t, "subtask", "list", "task1")
		if strings.Contains(children, "task1.1") {
			t.Fatalf("archived subtask should not be listed as open, got:\n%s", children)
		}
		allChildren := run(t, "subtask", "list", "task1", "--all")
		if !strings.Contains(allChildren, "task1.1\tChild task") {
			t.Fatalf("expected subtask list --all to include archived subtask, got:\n%s", allChildren)
		}

		next := run(t, "subtask", "create", "task1", "Next child")
		if !strings.Contains(next, `"id": "task1.2"`) {
			t.Fatalf("expected archived subtask ids not to be reused, got:\n%s", next)
		}
	})
}

func TestSubtaskCreateSkipsArchivedAndOpenSubtaskIDs(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "task", "create", "Parent task")
		for _, description := range []string{
			"Archived child one",
			"Archived child two",
			"Archived child three",
			"Open child four",
			"Open child five",
		} {
			run(t, "subtask", "create", "task1", description)
		}
		for _, id := range []string{"task1.1", "task1.2", "task1.3"} {
			run(t, "task", "archive", id)
			assertDir(t, filepath.Join(root, "task1", archiveDir, id))
		}
		assertDir(t, filepath.Join(root, "task1", "task1.4"))
		assertDir(t, filepath.Join(root, "task1", "task1.5"))

		next := run(t, "subtask", "create", "task1", "Next child")
		if !strings.Contains(next, `"id": "task1.6"`) {
			t.Fatalf("expected archived and open subtask ids not to be reused, got:\n%s", next)
		}
		assertDir(t, filepath.Join(root, "task1", "task1.6"))
	})
}

func TestTaskArchiveRejectsUnmergedSubtaskRepoWorktree(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "task", "create", "Parent task")
		run(t, "subtask", "create", "task1", "Child task")
		repoPath := filepath.Join(root, reposDir, "disksing", "forge")
		writeGitRepo(t, repoPath, "master")
		worktreePath := filepath.Join(root, "task1", "task1.1", "worktree", "forge")
		runGit(t, repoPath, "worktree", "add", "-b", "agent/task1.1", worktreePath, "master")
		if err := os.WriteFile(filepath.Join(worktreePath, "feature.txt"), []byte("feature\n"), 0o644); err != nil {
			t.Fatal(err)
		}
		runGit(t, worktreePath, "add", "feature.txt")
		runGit(t, worktreePath, "-c", "user.name=Forge Test", "-c", "user.email=forge@example.com", "commit", "-m", "child feature work")
		run(t, "task", "repo", "add", "task1.1", "disksing/forge", "--worktree", "task1/task1.1/worktree/forge", "--branch", "agent/task1.1", "--target", "master")

		out, err := runErr(t, "task", "archive", "task1.1")
		if err == nil {
			t.Fatalf("expected archive to fail, got stdout:\n%s", out)
		}
		if !strings.Contains(err.Error(), `repo "disksing/forge"`) || !strings.Contains(err.Error(), `not merged into target branch "master"`) || !strings.Contains(err.Error(), "child feature work") {
			t.Fatalf("expected clear unmerged commits error, got: %v\nstdout:\n%s", err, out)
		}
		assertDir(t, filepath.Join(root, "task1", "task1.1"))
		if pathExists(filepath.Join(root, "task1", archiveDir, "task1.1")) {
			t.Fatal("unmerged subtask should not have been archived")
		}
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
		if !strings.Contains(first, "`work.md` is a mutable recovery snapshot, not a chronological log.") {
			t.Fatalf("expected workspace AGENTS.md to describe work.md as a mutable snapshot, got:\n%s", first)
		}
		if !strings.Contains(first, "Do not append timeline history to `work.md`.") {
			t.Fatalf("expected workspace AGENTS.md to forbid timeline history in work.md, got:\n%s", first)
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

func TestInitRefreshesOpenTaskAgentsAndPreservesManualContent(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "task", "create", "Parent task")
		run(t, "subtask", "create", "task1", "Open child")
		run(t, "subtask", "create", "task1", "Archived child")
		run(t, "task", "archive", "task1.2")

		rootAgents := filepath.Join(root, "AGENTS.md")
		taskAgents := filepath.Join(root, "task1", "AGENTS.md")
		subtaskAgents := filepath.Join(root, "task1", "task1.1", "AGENTS.md")
		archivedAgents := filepath.Join(root, "task1", archiveDir, "task1.2", "AGENTS.md")

		writeStaleManagedBlock(t, rootAgents, "This directory is an AgentWorkspace managed by forge.", "old workspace prompt")
		appendFile(t, taskAgents, "\n# Task Notes\n\nKeep task note.\n")
		writeStaleManagedBlock(t, taskAgents, "You are working inside a single AgentWorkspace task directory.", "old task prompt")
		appendFile(t, subtaskAgents, "\n# Child Notes\n\nKeep child note.\n")
		writeStaleManagedBlock(t, subtaskAgents, "Read the parent task directory's task.json, task.md, work.md, and log.md", "old child prompt")
		archivedBefore := readFile(t, archivedAgents)

		if err := os.Chdir(filepath.Join(root, "task1", "task1.1")); err != nil {
			t.Fatal(err)
		}
		run(t, "init")

		if pathExists(filepath.Join(root, "task1", "task1.1", configFile)) {
			t.Fatal("init from subtask should not create nested forge.json")
		}
		if pathExists(filepath.Join(root, "task1", "task1.1", reposDir)) {
			t.Fatal("init from subtask should not create nested repos directory")
		}
		if pathExists(filepath.Join(root, "task1", "task1.1", archiveDir)) {
			t.Fatal("init from subtask should not create nested archive directory")
		}

		rootAfter := readFile(t, rootAgents)
		if strings.Contains(rootAfter, "old workspace prompt") || !strings.Contains(rootAfter, "This directory is an AgentWorkspace managed by forge.") {
			t.Fatalf("expected workspace managed block to refresh, got:\n%s", rootAfter)
		}

		taskAfter := readFile(t, taskAgents)
		if strings.Contains(taskAfter, "old task prompt") {
			t.Fatalf("expected task managed block to refresh, got:\n%s", taskAfter)
		}
		if !strings.Contains(taskAfter, "Keep task note.") {
			t.Fatalf("expected task manual content to survive refresh, got:\n%s", taskAfter)
		}
		if !strings.Contains(taskAfter, defaultWorkflowSnippet) {
			t.Fatalf("expected task workflow guidance to be restored, got:\n%s", taskAfter)
		}
		if strings.Count(taskAfter, forgePromptStart) != 1 || strings.Count(taskAfter, forgePromptEnd) != 1 {
			t.Fatalf("expected task refresh to keep one managed block, got:\n%s", taskAfter)
		}

		subtaskAfter := readFile(t, subtaskAgents)
		if strings.Contains(subtaskAfter, "old child prompt") {
			t.Fatalf("expected subtask managed block to refresh, got:\n%s", subtaskAfter)
		}
		if !strings.Contains(subtaskAfter, "Keep child note.") {
			t.Fatalf("expected subtask manual content to survive refresh, got:\n%s", subtaskAfter)
		}
		if !strings.Contains(subtaskAfter, "Read the parent task directory's task.json, task.md, work.md, and log.md") {
			t.Fatalf("expected subtask guidance to be restored, got:\n%s", subtaskAfter)
		}
		if !strings.Contains(subtaskAfter, defaultWorkflowSnippet) {
			t.Fatalf("expected subtask workflow guidance to be restored, got:\n%s", subtaskAfter)
		}
		if strings.Count(subtaskAfter, forgePromptStart) != 1 || strings.Count(subtaskAfter, forgePromptEnd) != 1 {
			t.Fatalf("expected subtask refresh to keep one managed block, got:\n%s", subtaskAfter)
		}

		archivedAfter := readFile(t, archivedAgents)
		if archivedAfter != archivedBefore {
			t.Fatalf("expected archived subtask AGENTS.md not to change\nbefore:\n%s\nafter:\n%s", archivedBefore, archivedAfter)
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

func assertNoHan(t *testing.T, path string) {
	t.Helper()
	content := readFile(t, path)
	for _, r := range content {
		if unicode.Is(unicode.Han, r) {
			t.Fatalf("expected %s to contain no Chinese characters, got:\n%s", path, content)
		}
	}
}

func appendFile(t *testing.T, path, content string) {
	t.Helper()
	file, err := os.OpenFile(path, os.O_APPEND|os.O_WRONLY, 0)
	if err != nil {
		t.Fatal(err)
	}
	defer file.Close()
	if _, err := file.WriteString(content); err != nil {
		t.Fatal(err)
	}
}

func writeStaleManagedBlock(t *testing.T, path, old, replacement string) {
	t.Helper()
	content := readFile(t, path)
	stale := strings.Replace(content, old, replacement, 1)
	if stale == content {
		t.Fatalf("could not make %s stale; missing %q in:\n%s", path, old, content)
	}
	if err := os.WriteFile(path, []byte(stale), 0o644); err != nil {
		t.Fatal(err)
	}
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
