package forge

import (
	"bytes"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"testing"
	"unicode"
)

const (
	defaultWorkflowSnippet = "Standard task workflow. Clarify the requirements and acceptance criteria first"
	projectWorkflowSnippet = "This is a project-management project."
)

func TestForgeStartHelper(t *testing.T) {
	if os.Getenv("FORGE_START_HELPER") != "1" {
		return
	}
	cwd, err := os.Getwd()
	if err != nil {
		t.Fatal(err)
	}
	args := os.Args
	for i, arg := range os.Args {
		if arg == "--" {
			args = os.Args[i+1:]
			break
		}
	}
	output := cwd + "\n" + strings.Join(args, "\n") + "\n"
	if err := os.WriteFile(os.Getenv("FORGE_START_OUTPUT"), []byte(output), 0o644); err != nil {
		t.Fatal(err)
	}
	if code := os.Getenv("FORGE_START_EXIT"); code != "" {
		n, err := strconv.Atoi(code)
		if err != nil {
			t.Fatal(err)
		}
		os.Exit(n)
	}
}

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

		created := run(t, "project", "create", "Implement the forge MVP")
		if !strings.Contains(created, `"id": "project1"`) {
			t.Fatalf("expected project1 JSON, got:\n%s", created)
		}
		if !strings.Contains(created, `"workflow": "default"`) {
			t.Fatalf("expected project JSON to record default workflow, got:\n%s", created)
		}
		if strings.Contains(created, `"repos"`) {
			t.Fatalf("expected project JSON not to include repos, got:\n%s", created)
		}
		assertFile(t, filepath.Join(root, "project1", "project.json"))
		assertFile(t, filepath.Join(root, "project1", "project.md"))
		assertMissing(t, filepath.Join(root, "project1", "task.json"))
		assertMissing(t, filepath.Join(root, "project1", "task.md"))
		assertFile(t, filepath.Join(root, "project1", "work.md"))
		assertFile(t, filepath.Join(root, "project1", "log.md"))
		assertDir(t, filepath.Join(root, "project1", "artifacts"))
		assertMissing(t, filepath.Join(root, "project1", "worktree"))
		projectAgents := readFile(t, filepath.Join(root, "project1", "AGENTS.md"))
		if !strings.Contains(projectAgents, "workspace root AGENTS.md") {
			t.Fatalf("expected project AGENTS.md to reference workspace AGENTS.md, got:\n%s", projectAgents)
		}
		if strings.Count(projectAgents, forgePromptStart) != 1 || strings.Count(projectAgents, forgePromptEnd) != 1 {
			t.Fatalf("expected project AGENTS.md to contain one managed block, got:\n%s", projectAgents)
		}
		if !strings.Contains(projectAgents, "Use work.md as a mutable recovery snapshot, not a chronological log.") {
			t.Fatalf("expected project AGENTS.md to describe work.md as a mutable snapshot, got:\n%s", projectAgents)
		}
		if !strings.Contains(projectAgents, "Do not append timeline history to work.md.") {
			t.Fatalf("expected project AGENTS.md to forbid timeline history in work.md, got:\n%s", projectAgents)
		}
		if !strings.Contains(projectAgents, "If project.md contains pending decisions or unresolved items") {
			t.Fatalf("expected project AGENTS.md to include project pending-item guidance, got:\n%s", projectAgents)
		}
		if !strings.Contains(projectAgents, defaultWorkflowSnippet) {
			t.Fatalf("expected project AGENTS.md to include default workflow guidance, got:\n%s", projectAgents)
		}
		projectMDPath := filepath.Join(root, "project1", "project.md")
		projectMD := readFile(t, projectMDPath)
		if !strings.Contains(projectMD, "# Implement the forge MVP") || !strings.Contains(projectMD, "Implement the forge MVP") {
			t.Fatalf("expected project.md to contain project background, got:\n%s", projectMD)
		}
		if strings.Contains(projectMD, "## Workflow") || strings.Contains(projectMD, defaultWorkflowSnippet) || strings.Contains(projectMD, "## Notes") {
			t.Fatalf("expected project.md to contain only project background, got:\n%s", projectMD)
		}
		assertNoHan(t, projectMDPath)
		taskWork := readFile(t, filepath.Join(root, "project1", "work.md"))
		if !strings.Contains(taskWork, "## Recovery Rule") {
			t.Fatalf("expected work.md to include recovery rule, got:\n%s", taskWork)
		}
		if !strings.Contains(taskWork, "Keep this file as a mutable recovery snapshot, not a chronological log.") || !strings.Contains(taskWork, "Put dated events, command results, completed-step history, and other timeline entries in log.md.") {
			t.Fatalf("expected work.md to distinguish snapshot from timeline history, got:\n%s", taskWork)
		}
		if strings.Contains(projectAgents, "This is a subtask") {
			t.Fatalf("project AGENTS.md should not contain subtask-only guidance, got:\n%s", projectAgents)
		}

		listed := run(t, "project", "list")
		if !strings.Contains(listed, "project1\tImplement the forge MVP") {
			t.Fatalf("expected task list to include project1, got:\n%s", listed)
		}

		child := run(t, "task", "create", "project1", "Add task commands")
		if !strings.Contains(child, `"id": "project1.task1"`) {
			t.Fatalf("expected project1.task1 JSON, got:\n%s", child)
		}
		assertFile(t, filepath.Join(root, "project1", "project1.task1", "task.json"))
		assertFile(t, filepath.Join(root, "project1", "project1.task1", "task.md"))
		assertDir(t, filepath.Join(root, "project1", "project1.task1", "worktree"))
		subtaskAgents := readFile(t, filepath.Join(root, "project1", "project1.task1", "AGENTS.md"))
		if !strings.Contains(subtaskAgents, "workspace root AGENTS.md") {
			t.Fatalf("expected subtask AGENTS.md to reference workspace AGENTS.md, got:\n%s", subtaskAgents)
		}
		if strings.Count(subtaskAgents, forgePromptStart) != 1 || strings.Count(subtaskAgents, forgePromptEnd) != 1 {
			t.Fatalf("expected subtask AGENTS.md to contain one managed block, got:\n%s", subtaskAgents)
		}
		if !strings.Contains(subtaskAgents, "Read the parent project directory's project.json, project.md, work.md, and log.md") {
			t.Fatalf("expected subtask AGENTS.md to reference parent context files, got:\n%s", subtaskAgents)
		}
		if !strings.Contains(subtaskAgents, "If task.md contains pending decisions or unresolved items") {
			t.Fatalf("expected subtask AGENTS.md to include generic pending-item guidance, got:\n%s", subtaskAgents)
		}
		if !strings.Contains(subtaskAgents, defaultWorkflowSnippet) {
			t.Fatalf("expected subtask AGENTS.md to include default workflow guidance, got:\n%s", subtaskAgents)
		}

		children := run(t, "task", "list", "project1")
		if !strings.Contains(children, "project1.task1\tAdd task commands") {
			t.Fatalf("expected subtask list to include project1.task1, got:\n%s", children)
		}

		shown := run(t, "task", "show", "project1.task1")
		if !strings.Contains(shown, `"parent": "project1"`) {
			t.Fatalf("expected show to find subtask, got:\n%s", shown)
		}

		archived := run(t, "task", "archive", "project1")
		if !strings.Contains(archived, "archive/project1") {
			t.Fatalf("expected archive path, got:\n%s", archived)
		}
		assertDir(t, filepath.Join(root, archiveDir, "project1"))
		if pathExists(filepath.Join(root, "project1")) {
			t.Fatal("project1 should have moved out of the open workspace")
		}
		openOnly := run(t, "project", "list")
		if strings.Contains(openOnly, "project1\tImplement the forge MVP") {
			t.Fatalf("archived task should not be listed by default, got:\n%s", openOnly)
		}
		allTasks := run(t, "project", "list", "--all")
		if !strings.Contains(allTasks, "project1\tImplement the forge MVP") {
			t.Fatalf("expected task list --all to include archived task, got:\n%s", allTasks)
		}

		next := run(t, "project", "create", "Second project")
		if !strings.Contains(next, `"id": "project2"`) {
			t.Fatalf("expected archived task ids not to be reused, got:\n%s", next)
		}
	})
}

func TestStartRunsExplicitCommandInTaskDirectory(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "Launch agent")
		output := filepath.Join(root, "start.out")
		t.Setenv("FORGE_START_HELPER", "1")
		t.Setenv("FORGE_START_OUTPUT", output)

		run(t, "start", "project1", "--", os.Args[0], "-test.run=^TestForgeStartHelper$", "--", "explicit", "args")

		got := readFile(t, output)
		want := realPath(t, filepath.Join(root, "project1")) + "\nexplicit\nargs\n"
		if got != want {
			t.Fatalf("expected explicit command to run in task dir, got:\n%s", got)
		}
	})
}

func TestStartResolvesNestedTaskID(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "Parent project")
		run(t, "task", "create", "project1", "Child task")
		output := filepath.Join(root, "nested.out")
		t.Setenv("FORGE_START_HELPER", "1")
		t.Setenv("FORGE_START_OUTPUT", output)

		run(t, "start", "project1.task1", "--", os.Args[0], "-test.run=^TestForgeStartHelper$", "--", "nested")

		got := readFile(t, output)
		want := realPath(t, filepath.Join(root, "project1", "project1.task1")) + "\nnested\n"
		if got != want {
			t.Fatalf("expected nested command to run in subtask dir, got:\n%s", got)
		}
	})
}

func TestStartUsesConfiguredDefaultAgentCommand(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "Default launch")
		output := filepath.Join(root, "default.out")
		t.Setenv("FORGE_START_HELPER", "1")
		t.Setenv("FORGE_START_OUTPUT", output)
		writeFile(t, filepath.Join(root, configFile), `{"version":1,"agentCommand":[`+strconv.Quote(os.Args[0])+`,"-test.run=^TestForgeStartHelper$","--","configured"]}`+"\n")

		run(t, "start", "project1")

		got := readFile(t, output)
		want := realPath(t, filepath.Join(root, "project1")) + "\nconfigured\n"
		if got != want {
			t.Fatalf("expected configured default command, got:\n%s", got)
		}
	})
}

func TestStartUsesConfiguredDefaultAgentCommandWithArgs(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "Default launch with args")
		output := filepath.Join(root, "default-args.out")
		t.Setenv("FORGE_START_HELPER", "1")
		t.Setenv("FORGE_START_OUTPUT", output)
		command := os.Args[0] + ` -test.run=^TestForgeStartHelper$ -- "configured arg" second`
		writeFile(t, filepath.Join(root, configFile), `{"version":1,"agentCommand":`+strconv.Quote(command)+`}`+"\n")

		run(t, "start", "project1")

		got := readFile(t, output)
		want := realPath(t, filepath.Join(root, "project1")) + "\nconfigured arg\nsecond\n"
		if got != want {
			t.Fatalf("expected configured default command with args, got:\n%s", got)
		}
	})
}

func TestStartExplicitCommandOverridesConfiguredDefault(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "Explicit beats default")
		output := filepath.Join(root, "override.out")
		t.Setenv("FORGE_START_HELPER", "1")
		t.Setenv("FORGE_START_OUTPUT", output)
		writeFile(t, filepath.Join(root, configFile), `{"version":1,"agentCommand":["missing-default-command"]}`+"\n")

		run(t, "start", "project1", "--", os.Args[0], "-test.run=^TestForgeStartHelper$", "--", "explicit")

		got := readFile(t, output)
		want := realPath(t, filepath.Join(root, "project1")) + "\nexplicit\n"
		if got != want {
			t.Fatalf("expected explicit command to override default, got:\n%s", got)
		}
	})
}

func TestStartMissingCommandError(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "No command")

		out, err := runErr(t, "start", "project1")
		if err == nil {
			t.Fatalf("expected start to fail without command, got stdout:\n%s", out)
		}
		if !strings.Contains(err.Error(), "no agent command provided") || !strings.Contains(err.Error(), "agentCommand") {
			t.Fatalf("expected clear missing command error, got: %v\nstdout:\n%s", err, out)
		}
	})
}

func TestStartPropagatesChildExitStatus(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "Exit status")
		output := filepath.Join(root, "exit.out")
		t.Setenv("FORGE_START_HELPER", "1")
		t.Setenv("FORGE_START_OUTPUT", output)
		t.Setenv("FORGE_START_EXIT", "7")

		out, err := runErr(t, "start", "project1", "--", os.Args[0], "-test.run=^TestForgeStartHelper$", "--", "exit")
		if err == nil {
			t.Fatalf("expected child exit to fail, got stdout:\n%s", out)
		}
		exitErr, ok := err.(interface{ ExitCode() int })
		if !ok || exitErr.ExitCode() != 7 {
			t.Fatalf("expected exit code 7, got %T %v\nstdout:\n%s", err, err, out)
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

		defaultCreated := run(t, "project", "create", "Default project")
		if !strings.Contains(defaultCreated, `"workflow": "default"`) {
			t.Fatalf("expected default workflow in project JSON, got:\n%s", defaultCreated)
		}
		defaultProjectMD := readFile(t, filepath.Join(root, "project1", "project.md"))
		if !strings.Contains(defaultProjectMD, "# Default project") {
			t.Fatalf("expected project.md skeleton with project background, got:\n%s", defaultProjectMD)
		}
		if strings.Contains(defaultProjectMD, "Default body {{title}}") || strings.Contains(defaultProjectMD, "## Workflow") {
			t.Fatalf("expected workflow body to stay out of project.md, got:\n%s", defaultProjectMD)
		}
		defaultAgents := readFile(t, filepath.Join(root, "project1", "AGENTS.md"))
		if !strings.Contains(defaultAgents, "Default body {{title}}") {
			t.Fatalf("expected project AGENTS.md to include literal default workflow body, got:\n%s", defaultAgents)
		}

		projectCreated := run(t, "project", "create", "--workflow=project", "Project task")
		if !strings.Contains(projectCreated, `"workflow": "project"`) {
			t.Fatalf("expected project workflow in project JSON, got:\n%s", projectCreated)
		}
		projectProjectMD := readFile(t, filepath.Join(root, "project2", "project.md"))
		if !strings.Contains(projectProjectMD, "# Project task") {
			t.Fatalf("expected project.md skeleton with project background, got:\n%s", projectProjectMD)
		}
		if strings.Contains(projectProjectMD, "Project body {{description}}") || strings.Contains(projectProjectMD, "## Workflow") {
			t.Fatalf("expected project workflow body to stay out of project.md, got:\n%s", projectProjectMD)
		}
		projectAgents := readFile(t, filepath.Join(root, "project2", "AGENTS.md"))
		if !strings.Contains(projectAgents, "Project body {{description}}") {
			t.Fatalf("expected project AGENTS.md to include literal project workflow body, got:\n%s", projectAgents)
		}

		if err := os.Remove(defaultPath); err != nil {
			t.Fatal(err)
		}
		fallbackCreated := run(t, "project", "create", "Fallback project")
		if !strings.Contains(fallbackCreated, `"workflow": "default"`) {
			t.Fatalf("expected fallback project JSON to record default workflow, got:\n%s", fallbackCreated)
		}
		fallbackProjectMDPath := filepath.Join(root, "project3", "project.md")
		fallbackProjectMD := readFile(t, fallbackProjectMDPath)
		if strings.Contains(fallbackProjectMD, defaultWorkflowSnippet) || strings.Contains(fallbackProjectMD, "## Workflow") {
			t.Fatalf("expected fallback project.md to contain only project background, got:\n%s", fallbackProjectMD)
		}
		assertNoHan(t, fallbackProjectMDPath)
		fallbackAgents := readFile(t, filepath.Join(root, "project3", "AGENTS.md"))
		if !strings.Contains(fallbackAgents, defaultWorkflowSnippet) {
			t.Fatalf("expected missing default workflow to fallback to built-in AGENTS.md content, got:\n%s", fallbackAgents)
		}

		out, err := runErr(t, "project", "create", "--workflow=default", "Explicit default missing task")
		if err == nil {
			t.Fatalf("expected missing explicit default workflow to fail, got stdout:\n%s", out)
		}
		if !strings.Contains(err.Error(), "workflow not found: workflow/default.md") {
			t.Fatalf("expected missing explicit default workflow error, got: %v\nstdout:\n%s", err, out)
		}

		out, err = runErr(t, "project", "create", "--workflow=missing", "Missing workflow task")
		if err == nil {
			t.Fatalf("expected missing explicit workflow to fail, got stdout:\n%s", out)
		}
		if !strings.Contains(err.Error(), "workflow not found: workflow/missing.md") {
			t.Fatalf("expected missing workflow error, got: %v\nstdout:\n%s", err, out)
		}
		if pathExists(filepath.Join(root, "project4")) {
			t.Fatal("task should not be created when explicit workflow is missing")
		}
	})
}

func TestMigrateProjectTasksPromotesLegacySubtasks(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		workflowContent := builtinWorkflows[defaultWorkflowName]

		legacyProject := newTask("task1", "task", nil, "Legacy project", defaultWorkflowName)
		legacyProject.Repos = []TaskRepo{{
			Name:         "disksing/forge",
			RepoPath:     "repos/disksing/forge",
			WorktreePath: "task1/worktree/forge",
			Branch:       "agent/task1",
			TargetBranch: "master",
		}}
		if err := createLegacyTaskFiles(filepath.Join(root, "task1"), legacyProject, workflowContent); err != nil {
			t.Fatal(err)
		}

		parent := "task1"
		legacyChild := newTask("task1.1", "subtask", &parent, "Legacy child", defaultWorkflowName)
		legacyChild.Repos = []TaskRepo{{
			Name:         "disksing/forge",
			RepoPath:     "repos/disksing/forge",
			WorktreePath: "task1/task1.1/worktree/forge",
			Branch:       "agent/task1.1",
			TargetBranch: "master",
		}}
		if err := createTaskFiles(filepath.Join(root, "task1", "task1.1"), legacyChild, workflowContent); err != nil {
			t.Fatal(err)
		}

		childParent := "task1.1"
		legacyGrandchild := newTask("task1.1.1", "subtask", &childParent, "Legacy grandchild", defaultWorkflowName)
		if err := createTaskFiles(filepath.Join(root, "task1", "task1.1", "task1.1.1"), legacyGrandchild, workflowContent); err != nil {
			t.Fatal(err)
		}

		legacyArchivedChild := newTask("task1.2", "subtask", &parent, "Archived legacy child", defaultWorkflowName)
		legacyArchivedChild.Repos = []TaskRepo{{
			Name:         "disksing/forge",
			RepoPath:     "repos/disksing/forge",
			WorktreePath: "task1/task1.2/worktree/forge",
			Branch:       "agent/task1.2",
			TargetBranch: "master",
		}, {
			Name:         "disksing/archive-bare",
			BarePath:     "task1/archive/task1.2/worktree/archive-bare.git",
			WorktreePath: "",
			Branch:       "master",
			TargetBranch: "master",
		}}
		if err := createTaskFiles(filepath.Join(root, "task1", archiveDir, "task1.2"), legacyArchivedChild, workflowContent); err != nil {
			t.Fatal(err)
		}

		archivedLegacyProject := newTask("task2", "task", nil, "Archived legacy project", defaultWorkflowName)
		archivedLegacyProject.Repos = []TaskRepo{{
			Name:         "disksing/forge",
			RepoPath:     "task2/worktree/forge",
			WorktreePath: "task2/worktree/forge",
			Branch:       "agent/task2",
			TargetBranch: "master",
		}}
		if err := createLegacyTaskFiles(filepath.Join(root, archiveDir, "task2"), archivedLegacyProject, workflowContent); err != nil {
			t.Fatal(err)
		}

		migrated := run(t, "migrate", "project-tasks")
		if !strings.Contains(migrated, "migrated 2 projects and 3 tasks") {
			t.Fatalf("expected migration summary, got:\n%s", migrated)
		}

		if pathExists(filepath.Join(root, "task1")) {
			t.Fatal("legacy task1 directory should be renamed")
		}
		assertDir(t, filepath.Join(root, "project1"))
		assertDir(t, filepath.Join(root, "project1", "project1.task1"))
		assertDir(t, filepath.Join(root, "project1", "project1.task1.1"))
		assertDir(t, filepath.Join(root, "project1", archiveDir, "project1.task2"))
		assertDir(t, filepath.Join(root, "project1", "project1.task3"))
		assertDir(t, filepath.Join(root, archiveDir, "project2"))
		assertDir(t, filepath.Join(root, archiveDir, "project2", "project2.task1"))
		assertMissing(t, filepath.Join(root, "project1", "task.json"))
		assertMissing(t, filepath.Join(root, "project1", "task.md"))
		assertMissing(t, filepath.Join(root, "project1", "worktree"))
		assertFile(t, filepath.Join(root, "project1", "project.json"))
		assertFile(t, filepath.Join(root, "project1", "project.md"))
		if pathExists(filepath.Join(root, "project1", "project1.task1", "project1.task1.1")) {
			t.Fatal("legacy grandchild should have been promoted to a direct project task")
		}

		var project Task
		if err := readJSON(filepath.Join(root, "project1", "project.json"), &project); err != nil {
			t.Fatal(err)
		}
		if project.ID != "project1" || project.Type != "project" || project.Parent != nil {
			t.Fatalf("expected migrated project JSON, got: %+v", project)
		}
		if len(project.Repos) != 0 {
			t.Fatalf("expected migrated project to have no repo metadata, got: %+v", project.Repos)
		}
		projectMD := readFile(t, filepath.Join(root, "project1", "project.md"))
		if !strings.Contains(projectMD, "repository metadata, and worktree state were moved to `project1.task3`") {
			t.Fatalf("expected project.md to describe legacy split task, got:\n%s", projectMD)
		}

		var child Task
		if err := readJSON(filepath.Join(root, "project1", "project1.task1", "task.json"), &child); err != nil {
			t.Fatal(err)
		}
		if child.ID != "project1.task1" || child.Type != "task" || child.Parent == nil || *child.Parent != "project1" {
			t.Fatalf("expected promoted task JSON, got: %+v", child)
		}
		if got := child.Repos[0].WorktreePath; got != "project1/project1.task1/worktree/forge" {
			t.Fatalf("expected task repo worktree path to update, got %q", got)
		}
		childAgents := readFile(t, filepath.Join(root, "project1", "project1.task1", "AGENTS.md"))
		if !strings.Contains(childAgents, "This task belongs to a project.") || strings.Contains(childAgents, "This is a subtask.") {
			t.Fatalf("expected migrated task AGENTS.md to use project/task wording, got:\n%s", childAgents)
		}

		var grandchild Task
		if err := readJSON(filepath.Join(root, "project1", "project1.task1.1", "task.json"), &grandchild); err != nil {
			t.Fatal(err)
		}
		if grandchild.ID != "project1.task1.1" || grandchild.Type != "task" || grandchild.Parent == nil || *grandchild.Parent != "project1" {
			t.Fatalf("expected promoted grandchild JSON, got: %+v", grandchild)
		}
		var archivedChild Task
		if err := readJSON(filepath.Join(root, "project1", archiveDir, "project1.task2", "task.json"), &archivedChild); err != nil {
			t.Fatal(err)
		}
		if got := archivedChild.Repos[0].WorktreePath; got != "project1/archive/project1.task2/worktree/forge" {
			t.Fatalf("expected archived task worktree path to update, got %q", got)
		}
		if got := archivedChild.Repos[1].BarePath; got != "project1/archive/project1.task2/worktree/archive-bare.git" {
			t.Fatalf("expected archived task bare path to update, got %q", got)
		}

		var splitTask Task
		if err := readJSON(filepath.Join(root, "project1", "project1.task3", "task.json"), &splitTask); err != nil {
			t.Fatal(err)
		}
		if splitTask.ID != "project1.task3" || splitTask.Type != "task" || splitTask.Parent == nil || *splitTask.Parent != "project1" {
			t.Fatalf("expected split task JSON, got: %+v", splitTask)
		}
		if got := splitTask.Repos[0].WorktreePath; got != "project1/project1.task3/worktree/forge" {
			t.Fatalf("expected split task worktree path to update, got %q", got)
		}
		if got := splitTask.Repos[0].RepoPath; got != "repos/disksing/forge" {
			t.Fatalf("expected split task repo path to preserve shared repo cache, got %q", got)
		}
		splitMD := readFile(t, filepath.Join(root, "project1", "project1.task3", "task.md"))
		if !strings.Contains(splitMD, "This task was created during project/task migration") || !strings.Contains(splitMD, "Legacy project") {
			t.Fatalf("expected split task.md to keep legacy notes, got:\n%s", splitMD)
		}

		var archivedProject Task
		if err := readJSON(filepath.Join(root, archiveDir, "project2", "project.json"), &archivedProject); err != nil {
			t.Fatal(err)
		}
		if len(archivedProject.Repos) != 0 {
			t.Fatalf("expected archived project to have no repo metadata, got: %+v", archivedProject.Repos)
		}
		assertMissing(t, filepath.Join(root, archiveDir, "project2", "task.json"))
		assertMissing(t, filepath.Join(root, archiveDir, "project2", "task.md"))
		assertMissing(t, filepath.Join(root, archiveDir, "project2", "worktree"))

		var archivedSplit Task
		if err := readJSON(filepath.Join(root, archiveDir, "project2", "project2.task1", "task.json"), &archivedSplit); err != nil {
			t.Fatal(err)
		}
		if got := archivedSplit.Repos[0].WorktreePath; got != "archive/project2/project2.task1/worktree/forge" {
			t.Fatalf("expected archived split task worktree path to update, got %q", got)
		}
		if got := archivedSplit.Repos[0].RepoPath; got != "archive/project2/project2.task1/worktree/forge" {
			t.Fatalf("expected archived split task repo path to update, got %q", got)
		}

		tree := run(t, "project", "list", "--tree")
		if !strings.Contains(tree, "project1\tLegacy project") || !strings.Contains(tree, "- project1.task1\tLegacy child") || !strings.Contains(tree, "- project1.task1.1\tLegacy grandchild") {
			t.Fatalf("expected migrated open project tree, got:\n%s", tree)
		}
		allTasks := run(t, "task", "list", "project1", "--all")
		if !strings.Contains(allTasks, "project1.task2\tArchived legacy child") || !strings.Contains(allTasks, "project1.task3\tMigrated legacy work from project1") {
			t.Fatalf("expected migrated archived task in task list --all, got:\n%s", allTasks)
		}

		again := run(t, "migrate", "project-tasks")
		if !strings.Contains(again, "no legacy task directories found") {
			t.Fatalf("expected idempotent no-op on second migration, got:\n%s", again)
		}
	})
}

func TestTaskArchiveAllowsMergedRepoWorktree(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "Archive after merge")
		run(t, "task", "create", "project1", "Code task")
		repoPath := filepath.Join(root, reposDir, "disksing", "forge")
		writeGitRepo(t, repoPath, "master")
		worktreePath := filepath.Join(root, "project1", "project1.task1", "worktree", "forge")
		runGit(t, repoPath, "worktree", "add", "-b", "agent/project1.task1", worktreePath, "master")
		run(t, "task", "repo", "add", "project1.task1", "disksing/forge", "--worktree", "project1/project1.task1/worktree/forge", "--branch", "agent/project1.task1", "--target", "master")

		archived := run(t, "task", "archive", "project1.task1")
		if !strings.Contains(archived, "project1/archive/project1.task1") {
			t.Fatalf("expected archive path, got:\n%s", archived)
		}
		assertDir(t, filepath.Join(root, "project1", archiveDir, "project1.task1"))
		var archivedTask Task
		if err := readJSON(filepath.Join(root, "project1", archiveDir, "project1.task1", "task.json"), &archivedTask); err != nil {
			t.Fatal(err)
		}
		if got := archivedTask.Repos[0].WorktreePath; got != "project1/archive/project1.task1/worktree/forge" {
			t.Fatalf("expected archived task worktree path to update, got %q", got)
		}
	})
}

func TestTaskArchiveRejectsUnmergedRepoWorktree(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "Archive before merge")
		run(t, "task", "create", "project1", "Code task")
		repoPath := filepath.Join(root, reposDir, "disksing", "forge")
		writeGitRepo(t, repoPath, "master")
		worktreePath := filepath.Join(root, "project1", "project1.task1", "worktree", "forge")
		runGit(t, repoPath, "worktree", "add", "-b", "agent/project1.task1", worktreePath, "master")
		if err := os.WriteFile(filepath.Join(worktreePath, "feature.txt"), []byte("feature\n"), 0o644); err != nil {
			t.Fatal(err)
		}
		runGit(t, worktreePath, "add", "feature.txt")
		runGit(t, worktreePath, "-c", "user.name=Forge Test", "-c", "user.email=forge@example.com", "commit", "-m", "feature work")
		run(t, "task", "repo", "add", "project1.task1", "disksing/forge", "--worktree", "project1/project1.task1/worktree/forge", "--branch", "agent/project1.task1", "--target", "master")

		out, err := runErr(t, "task", "archive", "project1.task1")
		if err == nil {
			t.Fatalf("expected archive to fail, got stdout:\n%s", out)
		}
		if !strings.Contains(err.Error(), `repo "disksing/forge"`) || !strings.Contains(err.Error(), `not merged into target branch "master"`) || !strings.Contains(err.Error(), "feature work") {
			t.Fatalf("expected clear unmerged commits error, got: %v\nstdout:\n%s", err, out)
		}
		assertDir(t, filepath.Join(root, "project1", "project1.task1"))
		if pathExists(filepath.Join(root, "project1", archiveDir, "project1.task1")) {
			t.Fatal("project1.task1 should not have been archived")
		}
	})
}

func TestTaskArchiveAllowsMissingRepoWorktree(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "Archive without a checkout")
		run(t, "task", "create", "project1", "Code task")
		writeFakeRepo(t, filepath.Join(root, reposDir, "disksing", "forge"))
		run(t, "task", "repo", "add", "project1.task1", "disksing/forge", "--worktree", "project1/project1.task1/worktree/forge", "--branch", "agent/project1.task1", "--target", "master")

		archived := run(t, "task", "archive", "project1.task1")
		if !strings.Contains(archived, "project1/archive/project1.task1") {
			t.Fatalf("expected archive path, got:\n%s", archived)
		}
		assertDir(t, filepath.Join(root, "project1", archiveDir, "project1.task1"))
	})
}

func TestTaskArchiveSubtaskMovesToParentArchive(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "Parent project")
		run(t, "task", "create", "project1", "Child task")

		archived := run(t, "task", "archive", "project1.task1")
		if !strings.Contains(archived, "project1/archive/project1.task1") {
			t.Fatalf("expected parent-local archive path, got:\n%s", archived)
		}
		assertDir(t, filepath.Join(root, "project1", archiveDir, "project1.task1"))
		if pathExists(filepath.Join(root, archiveDir, "project1.task1")) {
			t.Fatal("subtask should not have moved to the workspace archive")
		}
		if pathExists(filepath.Join(root, "project1", "project1.task1")) {
			t.Fatal("subtask should have moved out of the parent task's open subtasks")
		}

		children := run(t, "task", "list", "project1")
		if strings.Contains(children, "project1.task1") {
			t.Fatalf("archived subtask should not be listed as open, got:\n%s", children)
		}
		allChildren := run(t, "task", "list", "project1", "--all")
		if !strings.Contains(allChildren, "project1.task1\tChild task") {
			t.Fatalf("expected subtask list --all to include archived subtask, got:\n%s", allChildren)
		}

		next := run(t, "task", "create", "project1", "Next child")
		if !strings.Contains(next, `"id": "project1.task2"`) {
			t.Fatalf("expected archived subtask ids not to be reused, got:\n%s", next)
		}
	})
}

func TestTaskArchiveLegacySubtaskMovesToParentArchive(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		workflowContent := builtinWorkflows[defaultWorkflowName]
		legacyParent := newTask("task1", "task", nil, "Legacy parent", defaultWorkflowName)
		if err := createLegacyTaskFiles(filepath.Join(root, "task1"), legacyParent, workflowContent); err != nil {
			t.Fatal(err)
		}
		parentID := "task1"
		legacyChild := newTask("task1.1", "subtask", &parentID, "Legacy child", defaultWorkflowName)
		if err := createTaskFiles(filepath.Join(root, "task1", "task1.1"), legacyChild, workflowContent); err != nil {
			t.Fatal(err)
		}

		archived := run(t, "task", "archive", "task1.1")
		if !strings.Contains(archived, "task1/archive/task1.1") {
			t.Fatalf("expected parent-local archive path, got:\n%s", archived)
		}
		assertDir(t, filepath.Join(root, "task1", archiveDir, "task1.1"))
		if pathExists(filepath.Join(root, "task1", "task1.1")) {
			t.Fatal("legacy subtask should have moved out of the parent task's open children")
		}
	})
}

func TestProjectListTreeIncludesOpenTasks(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "Parent project")
		run(t, "task", "create", "project1", "First child")
		run(t, "task", "create", "project1", "Second child")
		run(t, "project", "create", "Other project")

		listed := run(t, "project", "list")
		if strings.Contains(listed, "project1.task1\tFirst child") {
			t.Fatalf("default project list should not include tasks, got:\n%s", listed)
		}

		tree := run(t, "project", "list", "--tree")
		want := strings.Join([]string{
			"project1\tParent project",
			"- project1.task1\tFirst child",
			"- project1.task2\tSecond child",
			"project2\tOther project",
			"",
		}, "\n")
		if tree != want {
			t.Fatalf("expected project task tree, got:\n%s", tree)
		}

		reversedFlags := run(t, "project", "list", "--tree", "--all")
		if reversedFlags != tree {
			t.Fatalf("expected --tree --all to match open tree when nothing is archived, got:\n%s", reversedFlags)
		}
	})
}

func TestTaskCreateRejectsNestedTasks(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "Parent project")
		run(t, "task", "create", "project1", "Child task")

		out, err := runErr(t, "task", "create", "project1.task1", "Nested task")
		if err == nil {
			t.Fatalf("expected nested task creation to fail, got stdout:\n%s", out)
		}
		if !strings.Contains(err.Error(), "cannot create task under non-project resource") {
			t.Fatalf("expected non-project parent error, got: %v\nstdout:\n%s", err, out)
		}
	})
}

func TestProjectListTreeAllIncludesArchivedTasks(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "Parent project")
		run(t, "task", "create", "project1", "Archived child")
		run(t, "task", "create", "project1", "Open child")
		run(t, "task", "archive", "project1.task1")

		openTree := run(t, "project", "list", "--tree")
		if strings.Contains(openTree, "project1.task1\tArchived child") {
			t.Fatalf("open project tree should not include archived tasks, got:\n%s", openTree)
		}
		if !strings.Contains(openTree, "- project1.task2\tOpen child") {
			t.Fatalf("open project tree should include open tasks, got:\n%s", openTree)
		}

		allTree := run(t, "project", "list", "--all", "--tree")
		want := strings.Join([]string{
			"project1\tParent project",
			"- project1.task1\tArchived child",
			"- project1.task2\tOpen child",
			"",
		}, "\n")
		if allTree != want {
			t.Fatalf("expected archived tasks in project tree, got:\n%s", allTree)
		}
	})
}

func TestSubtaskCreateSkipsArchivedAndOpenSubtaskIDs(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "Parent project")
		for _, description := range []string{
			"Archived child one",
			"Archived child two",
			"Archived child three",
			"Open child four",
			"Open child five",
		} {
			run(t, "task", "create", "project1", description)
		}
		for _, id := range []string{"project1.task1", "project1.task2", "project1.task3"} {
			run(t, "task", "archive", id)
			assertDir(t, filepath.Join(root, "project1", archiveDir, id))
		}
		assertDir(t, filepath.Join(root, "project1", "project1.task4"))
		assertDir(t, filepath.Join(root, "project1", "project1.task5"))

		next := run(t, "task", "create", "project1", "Next child")
		if !strings.Contains(next, `"id": "project1.task6"`) {
			t.Fatalf("expected archived and open subtask ids not to be reused, got:\n%s", next)
		}
		assertDir(t, filepath.Join(root, "project1", "project1.task6"))
	})
}

func TestTaskArchiveRejectsUnmergedSubtaskRepoWorktree(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "Parent project")
		run(t, "task", "create", "project1", "Child task")
		repoPath := filepath.Join(root, reposDir, "disksing", "forge")
		writeGitRepo(t, repoPath, "master")
		worktreePath := filepath.Join(root, "project1", "project1.task1", "worktree", "forge")
		runGit(t, repoPath, "worktree", "add", "-b", "agent/project1.task1", worktreePath, "master")
		if err := os.WriteFile(filepath.Join(worktreePath, "feature.txt"), []byte("feature\n"), 0o644); err != nil {
			t.Fatal(err)
		}
		runGit(t, worktreePath, "add", "feature.txt")
		runGit(t, worktreePath, "-c", "user.name=Forge Test", "-c", "user.email=forge@example.com", "commit", "-m", "child feature work")
		run(t, "task", "repo", "add", "project1.task1", "disksing/forge", "--worktree", "project1/project1.task1/worktree/forge", "--branch", "agent/project1.task1", "--target", "master")

		out, err := runErr(t, "task", "archive", "project1.task1")
		if err == nil {
			t.Fatalf("expected archive to fail, got stdout:\n%s", out)
		}
		if !strings.Contains(err.Error(), `repo "disksing/forge"`) || !strings.Contains(err.Error(), `not merged into target branch "master"`) || !strings.Contains(err.Error(), "child feature work") {
			t.Fatalf("expected clear unmerged commits error, got: %v\nstdout:\n%s", err, out)
		}
		assertDir(t, filepath.Join(root, "project1", "project1.task1"))
		if pathExists(filepath.Join(root, "project1", archiveDir, "project1.task1")) {
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
		run(t, "project", "create", "Wire repo metadata into task json")
		run(t, "task", "create", "project1", "Code task")
		writeFakeRepo(t, filepath.Join(root, reposDir, "disksing", "forge"))

		out, err := runErr(t, "project", "repo", "add", "project1", "disksing/forge")
		if err == nil {
			t.Fatalf("expected project repo command to fail, got stdout:\n%s", out)
		}
		if !strings.Contains(err.Error(), "projects do not manage repositories or worktrees") {
			t.Fatalf("expected project repo rejection, got: %v\nstdout:\n%s", err, out)
		}

		out, err = runErr(t, "task", "repo", "add", "project1", "disksing/forge")
		if err == nil {
			t.Fatalf("expected task repo add on project to fail, got stdout:\n%s", out)
		}
		if !strings.Contains(err.Error(), "projects do not manage repositories or worktrees") {
			t.Fatalf("expected task repo project rejection, got: %v\nstdout:\n%s", err, out)
		}

		added := run(t, "task", "repo", "add", "project1.task1", "disksing/forge", "--branch", "agent/project1.task1", "--target", "master", "--base", "master")
		if !strings.Contains(added, `"name": "disksing/forge"`) {
			t.Fatalf("expected task JSON to include repo, got:\n%s", added)
		}
		if !strings.Contains(added, `"repoPath": "repos/disksing/forge"`) {
			t.Fatalf("expected task JSON to include repo path, got:\n%s", added)
		}
		if !strings.Contains(added, `"worktreePath": "project1/project1.task1/worktree/forge"`) {
			t.Fatalf("expected default worktree path, got:\n%s", added)
		}

		listed := run(t, "task", "repo", "list", "project1.task1")
		if !strings.Contains(listed, "disksing/forge\trepos/disksing/forge\tproject1/project1.task1/worktree/forge\tagent/project1.task1\tmaster\tmaster") {
			t.Fatalf("expected repo list to include metadata, got:\n%s", listed)
		}

		updated := run(t, "task", "repo", "add", "project1.task1", "disksing/forge", "--worktree", "project1/project1.task1/worktree/custom", "--branch", "agent/updated", "--target", "main")
		if strings.Count(updated, `"name": "disksing/forge"`) != 1 {
			t.Fatalf("expected repo add to update existing entry, got:\n%s", updated)
		}
		if !strings.Contains(updated, `"worktreePath": "project1/project1.task1/worktree/custom"`) {
			t.Fatalf("expected updated worktree path, got:\n%s", updated)
		}
		if !strings.Contains(updated, `"branch": "agent/updated"`) {
			t.Fatalf("expected updated branch, got:\n%s", updated)
		}

		removed := run(t, "task", "repo", "remove", "project1.task1", "disksing/forge")
		if strings.Contains(removed, `"name": "disksing/forge"`) {
			t.Fatalf("expected repo to be removed, got:\n%s", removed)
		}
	})
}

func TestTaskRepoLifecycleSupportsLegacyBareRepos(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "Wire legacy bare repo metadata into task json")
		run(t, "task", "create", "project1", "Code task")
		writeFakeBareRepo(t, filepath.Join(root, reposDir, "disksing", "forge.git"), "master")

		added := run(t, "task", "repo", "add", "project1.task1", "disksing/forge", "--branch", "agent/project1.task1")
		if !strings.Contains(added, `"barePath": "repos/disksing/forge.git"`) {
			t.Fatalf("expected task JSON to include legacy bare path, got:\n%s", added)
		}
		if strings.Contains(added, `"repoPath"`) {
			t.Fatalf("legacy bare repo should not also set repoPath, got:\n%s", added)
		}
		listed := run(t, "task", "repo", "list", "project1.task1")
		if !strings.Contains(listed, "disksing/forge\trepos/disksing/forge.git\tproject1/project1.task1/worktree/forge\tagent/project1.task1\tmaster") {
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
		run(t, "project", "create", "Parent project")
		run(t, "task", "create", "project1", "Open child")
		run(t, "task", "create", "project1", "Archived child")
		run(t, "task", "archive", "project1.task2")

		rootAgents := filepath.Join(root, "AGENTS.md")
		taskAgents := filepath.Join(root, "project1", "AGENTS.md")
		subtaskAgents := filepath.Join(root, "project1", "project1.task1", "AGENTS.md")
		archivedAgents := filepath.Join(root, "project1", archiveDir, "project1.task2", "AGENTS.md")

		writeStaleManagedBlock(t, rootAgents, "This directory is an AgentWorkspace managed by forge.", "old workspace prompt")
		appendFile(t, taskAgents, "\n# Task Notes\n\nKeep task note.\n")
		writeStaleManagedBlock(t, taskAgents, "You are working inside a single AgentWorkspace project directory.", "old project prompt")
		appendFile(t, subtaskAgents, "\n# Child Notes\n\nKeep child note.\n")
		writeStaleManagedBlock(t, subtaskAgents, "Read the parent project directory's project.json, project.md, work.md, and log.md", "old child prompt")
		archivedBefore := readFile(t, archivedAgents)

		if err := os.Chdir(filepath.Join(root, "project1", "project1.task1")); err != nil {
			t.Fatal(err)
		}
		run(t, "init")

		if pathExists(filepath.Join(root, "project1", "project1.task1", configFile)) {
			t.Fatal("init from subtask should not create nested forge.json")
		}
		if pathExists(filepath.Join(root, "project1", "project1.task1", reposDir)) {
			t.Fatal("init from subtask should not create nested repos directory")
		}
		if pathExists(filepath.Join(root, "project1", "project1.task1", archiveDir)) {
			t.Fatal("init from subtask should not create nested archive directory")
		}

		rootAfter := readFile(t, rootAgents)
		if strings.Contains(rootAfter, "old workspace prompt") || !strings.Contains(rootAfter, "This directory is an AgentWorkspace managed by forge.") {
			t.Fatalf("expected workspace managed block to refresh, got:\n%s", rootAfter)
		}

		taskAfter := readFile(t, taskAgents)
		if strings.Contains(taskAfter, "old project prompt") {
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
		if !strings.Contains(subtaskAfter, "Read the parent project directory's project.json, project.md, work.md, and log.md") {
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

func assertMissing(t *testing.T, path string) {
	t.Helper()
	if _, err := os.Stat(path); err == nil {
		t.Fatalf("expected path to be absent: %s", path)
	} else if !os.IsNotExist(err) {
		t.Fatal(err)
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

func writeFile(t *testing.T, path, content string) {
	t.Helper()
	if err := os.WriteFile(path, []byte(content), 0o644); err != nil {
		t.Fatal(err)
	}
}

func realPath(t *testing.T, path string) string {
	t.Helper()
	real, err := filepath.EvalSymlinks(path)
	if err != nil {
		t.Fatal(err)
	}
	return real
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

func createLegacyTaskFiles(dir string, task Task, workflowContent string) error {
	subdirs := []string{"artifacts", "worktree"}
	for _, subdir := range subdirs {
		if err := os.MkdirAll(filepath.Join(dir, subdir), 0o755); err != nil {
			return err
		}
	}
	if err := writeJSON(filepath.Join(dir, "task.json"), task); err != nil {
		return err
	}
	if err := os.WriteFile(filepath.Join(dir, "task.md"), []byte(defaultTaskMD(task)), 0o644); err != nil {
		return err
	}
	if err := os.WriteFile(filepath.Join(dir, "work.md"), []byte(defaultWorkMD(task)), 0o644); err != nil {
		return err
	}
	if err := os.WriteFile(filepath.Join(dir, "log.md"), []byte(defaultLogMD()), 0o644); err != nil {
		return err
	}
	return os.WriteFile(filepath.Join(dir, "AGENTS.md"), []byte(taskAgentsBlock(task, workflowContent)), 0o644)
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
