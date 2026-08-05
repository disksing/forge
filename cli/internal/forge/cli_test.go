package forge

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"testing"
	"time"
	"unicode"

	"github.com/disksing/forge/internal/buildinfo"
)

func TestVersion(t *testing.T) {
	oldBranch := buildinfo.Branch
	oldSHA := buildinfo.SHA
	buildinfo.Branch = "task-branch"
	buildinfo.SHA = "abc123"
	t.Cleanup(func() {
		buildinfo.Branch = oldBranch
		buildinfo.SHA = oldSHA
	})

	out := run(t, "--version")
	if out != "forge branch=task-branch sha=abc123\n" {
		t.Fatalf("unexpected version output: %q", out)
	}
}

func TestSortSessionsUsesStartedAtInstantNewestFirst(t *testing.T) {
	sessions := []Session{
		{ID: "older", StartedAt: "2026-07-27T16:19:55+08:00"},
		{ID: "newer", StartedAt: "2026-07-27T09:01:15Z"},
	}
	sortSessions(sessions)
	if sessions[0].ID != "newer" || sessions[1].ID != "older" {
		t.Fatalf("expected sessions newest first by parsed instant, got: %#v", sessions)
	}
}

func TestForgeStartAndServeSubcommands(t *testing.T) {
	if _, err := runErr(t, "start", "--bogus"); err == nil || !strings.Contains(err.Error(), "usage: forge start") {
		t.Fatalf("expected forge start usage error for unknown flag, got %v", err)
	}
	help := run(t, "start", "--help")
	if !strings.Contains(help, "usage: forge start [--project=<project>] [--task=<task>] [-- <agent command...>]") {
		t.Fatalf("expected forge start help usage, got:\n%s", help)
	}
	if !strings.Contains(help, "PID-liveness session") {
		t.Fatalf("expected forge start help to describe session behavior, got:\n%s", help)
	}
	serveHelp := run(t, "serve", "--help")
	for _, marker := range []string{
		"usage: forge serve [--addr=<address>] [--workspace=<path>] [--version]",
		"in-process application API",
		"FORGE_AGENTHUB_URL",
		"FORGE_GUI_CONFIG",
	} {
		if !strings.Contains(serveHelp, marker) {
			t.Fatalf("expected forge serve help to contain %q, got:\n%s", marker, serveHelp)
		}
	}
	if _, err := runErr(t, "serve", "--bogus"); err == nil {
		t.Fatal("expected forge serve to reject unknown flags")
	}
	if _, err := runErr(t, "serve", "extra"); err == nil || !strings.Contains(err.Error(), "unexpected positional argument") {
		t.Fatalf("expected forge serve to reject positional arguments, got %v", err)
	}
	version := run(t, "serve", "--version")
	if !strings.HasPrefix(version, "forge branch=") {
		t.Fatalf("expected forge serve --version to print forge build info, got %q", version)
	}
	startVersion := run(t, "start", "--version")
	if !strings.HasPrefix(startVersion, "forge branch=") {
		t.Fatalf("expected forge start --version to print forge build info, got %q", startVersion)
	}
}

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
	if os.Getenv("FORGE_START_COMPLETE") == "1" {
		if err := Run([]string{"task", "run", "complete", "--summary=helper complete"}); err != nil {
			t.Fatal(err)
		}
	}
	if os.Getenv("FORGE_START_RECORD_MODE") == "1" {
		output += "mode=" + os.Getenv("FORGE_INTERACTION_MODE") + "\n"
		output += "generation=" + os.Getenv("FORGE_TASK_RUN_GENERATION") + "\n"
		output += "prompt=" + os.Getenv("FORGE_TASK_RUN_PROMPT") + "\n"
		contextData, err := os.ReadFile(filepath.Join(cwd, ".forge", "codex-session.json"))
		if err != nil {
			t.Fatal(err)
		}
		output += "context=" + strings.ReplaceAll(strings.TrimSpace(string(contextData)), "\n", " ") + "\n"
	}
	if os.Getenv("FORGE_START_RECORD_SESSION") == "1" {
		sessionID := os.Getenv("FORGE_SESSION_ID")
		output += "session=" + sessionID + "\n"
		output += "pid=" + strconv.Itoa(os.Getpid()) + "\n"
		root, err := findWorkspaceRoot()
		if err != nil {
			t.Fatal(err)
		}
		store, err := readSessionStore(root)
		if err != nil {
			t.Fatal(err)
		}
		index := findSessionIndex(store.Sessions, sessionID)
		if index < 0 {
			t.Fatalf("expected session %q to exist while helper is running: %#v", sessionID, store.Sessions)
		}
		output += "session-liveness=" + formatSessionLiveness(store.Sessions[index].Liveness) + "\n"
		output += "session-controls=" + formatSessionControls(store.Sessions[index].Controls) + "\n"
	}
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

func TestInitDefaultsToEnglishAndPersistsLanguage(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		var config Config
		if err := readJSON(filepath.Join(root, configFile), &config); err != nil {
			t.Fatal(err)
		}
		if config.Language != defaultLanguage {
			t.Fatalf("expected default language %q, got %+v", defaultLanguage, config)
		}
		if !strings.Contains(readFile(t, filepath.Join(root, "AGENTS.md")), "This directory is an AgentWorkspace managed by forge.") {
			t.Fatal("default workspace prompt should remain English")
		}
	})
}

func TestSimplifiedChineseInitTemplatesAndLanguageMigration(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init", "--language", "zh-CN")

		var config Config
		if err := readJSON(filepath.Join(root, configFile), &config); err != nil {
			t.Fatal(err)
		}
		if config.Language != languageSimplifiedChinese {
			t.Fatalf("expected zh-CN workspace config, got %+v", config)
		}
		if got := readFile(t, filepath.Join(root, wikiDir, "index.md")); got != defaultWikiIndexZH {
			t.Fatalf("unexpected Chinese Wiki index:\n%s", got)
		}
		rootAgentsPath := filepath.Join(root, "AGENTS.md")
		if got := readFile(t, rootAgentsPath); !strings.Contains(got, "此目录是由 Forge 管理的 AgentWorkspace") {
			t.Fatalf("expected Chinese workspace prompt, got:\n%s", got)
		}

		run(t, "project", "create", "中文项目")
		projectPath := filepath.Join(root, "project1")
		projectMD := readFile(t, filepath.Join(projectPath, projectMDFile))
		if !strings.Contains(projectMD, "## 背景") || !strings.Contains(projectMD, "## 范围") || !strings.Contains(projectMD, "## 验收标准") {
			t.Fatalf("expected Chinese project template, got:\n%s", projectMD)
		}
		projectAgentsPath := filepath.Join(projectPath, "AGENTS.md")
		if got := readFile(t, projectAgentsPath); !strings.Contains(got, "# 项目 Agent 指引") || !strings.Contains(got, "项目任务模板位于 templates/*.md") || !strings.Contains(got, "workspace 根目录的 AGENTS.md（../AGENTS.md）") {
			t.Fatalf("expected Chinese project prompt with workspace AGENTS.md path, got:\n%s", got)
		}
		var projectLogs []LogEntry
		if err := json.Unmarshal([]byte(run(t, "project", "log", "list", "--project=project1", "--json")), &projectLogs); err != nil {
			t.Fatal(err)
		}
		if len(projectLogs) != 1 || projectLogs[0].Title != "项目已创建" {
			t.Fatalf("expected localized project creation log, got %+v", projectLogs)
		}

		run(t, "task", "create", "--project=project1", "中文任务")
		taskPath := filepath.Join(projectPath, "task1")
		taskMDPath := filepath.Join(taskPath, taskMDFile)
		workMDPath := filepath.Join(taskPath, "work.md")
		taskAgentsPath := filepath.Join(taskPath, "AGENTS.md")
		if got := readFile(t, taskMDPath); !strings.Contains(got, "## 背景") || !strings.Contains(got, "长期有效的任务约定") {
			t.Fatalf("expected Chinese task template, got:\n%s", got)
		}
		if got := readFile(t, workMDPath); !strings.Contains(got, "# 工作记录") || !strings.Contains(got, "## 当前重点") {
			t.Fatalf("expected Chinese work template, got:\n%s", got)
		}
		if got := readFile(t, taskAgentsPath); !strings.Contains(got, "# 任务 Agent 指引") || !strings.Contains(got, "此任务属于一个项目") || !strings.Contains(got, "父项目 AGENTS.md（../AGENTS.md）") || !strings.Contains(got, "workspace 根目录的 AGENTS.md（../../AGENTS.md）") {
			t.Fatalf("expected Chinese task prompt with project and workspace AGENTS.md paths, got:\n%s", got)
		}
		var taskLogs []LogEntry
		if err := json.Unmarshal([]byte(run(t, "task", "log", "list", "--project=project1", "--task=task1", "--json")), &taskLogs); err != nil {
			t.Fatal(err)
		}
		if len(taskLogs) != 1 || taskLogs[0].Title != "任务已创建" {
			t.Fatalf("expected localized task creation log, got %+v", taskLogs)
		}

		appendFile(t, projectAgentsPath, "\n# 团队说明\n\n保留这行。\n")
		chineseTaskMD := readFile(t, taskMDPath)
		if err := os.Chdir(taskPath); err != nil {
			t.Fatal(err)
		}
		run(t, "migrate", "--language=en")
		if err := readJSON(filepath.Join(root, configFile), &config); err != nil {
			t.Fatal(err)
		}
		if config.Language != defaultLanguage {
			t.Fatalf("expected migration to persist English, got %+v", config)
		}
		if got := readFile(t, rootAgentsPath); !strings.Contains(got, "This directory is an AgentWorkspace managed by forge.") || strings.Contains(got, "此目录是由 Forge 管理") {
			t.Fatalf("expected English workspace prompt after migration, got:\n%s", got)
		}
		if got := readFile(t, projectAgentsPath); !strings.Contains(got, "# Project Agent Instructions") || !strings.Contains(got, "保留这行。") {
			t.Fatalf("expected English project prompt with manual content preserved, got:\n%s", got)
		}
		if got := readFile(t, taskAgentsPath); !strings.Contains(got, "# Task Agent Instructions") {
			t.Fatalf("expected English task prompt after migration, got:\n%s", got)
		}
		if got := readFile(t, taskMDPath); got != chineseTaskMD {
			t.Fatalf("migration should not translate existing task.md\nbefore:\n%s\nafter:\n%s", chineseTaskMD, got)
		}

		run(t, "task", "create", "--project=project1", "English task")
		if got := readFile(t, filepath.Join(projectPath, "task2", taskMDFile)); !strings.Contains(got, "## Background") {
			t.Fatalf("expected new task to use migrated language, got:\n%s", got)
		}

		run(t, "migrate", "--language=zh-CN")
		if got := readFile(t, taskAgentsPath); !strings.Contains(got, "# 任务 Agent 指引") {
			t.Fatalf("expected migration to switch prompts back to Chinese, got:\n%s", got)
		}
	})
}

func TestLanguageValidationAndLegacyWorkspaceMigration(t *testing.T) {
	withTempCwd(t, func(root string) {
		if _, err := runErr(t, "init", "--language=fr"); err == nil || !strings.Contains(err.Error(), "unsupported language") {
			t.Fatalf("expected unsupported init language error, got %v", err)
		}
		assertMissing(t, filepath.Join(root, configFile))

		run(t, "init", "--language=zh_CN")
		var config Config
		if err := readJSON(filepath.Join(root, configFile), &config); err != nil {
			t.Fatal(err)
		}
		if config.Language != languageSimplifiedChinese {
			t.Fatalf("expected language alias to normalize to zh-CN, got %+v", config)
		}
		if _, err := runErr(t, "migrate", "--language"); err == nil || !strings.Contains(err.Error(), "--language requires a value") {
			t.Fatalf("expected missing language value error, got %v", err)
		}
	})

	withTempCwd(t, func(root string) {
		if err := os.MkdirAll(filepath.Join(root, reposDir), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.MkdirAll(filepath.Join(root, archiveDir), 0o755); err != nil {
			t.Fatal(err)
		}
		writeFile(t, filepath.Join(root, configFile), `{"version":1}`+"\n")
		run(t, "migrate")
		var config Config
		if err := readJSON(filepath.Join(root, configFile), &config); err != nil {
			t.Fatal(err)
		}
		if config.Language != defaultLanguage {
			t.Fatalf("expected legacy workspace to migrate to explicit English, got %+v", config)
		}
	})
}

func TestTaskLifecycle(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		assertDir(t, filepath.Join(root, reposDir))
		assertDir(t, filepath.Join(root, archiveDir))
		assertFile(t, filepath.Join(root, configFile))
		assertFile(t, filepath.Join(root, "AGENTS.md"))
		assertDir(t, filepath.Join(root, wikiDir))
		assertFile(t, filepath.Join(root, wikiDir, "index.md"))

		created := run(t, "project", "create", "Implement the forge MVP")
		if !strings.Contains(created, `"id": "project1"`) {
			t.Fatalf("expected project1 JSON, got:\n%s", created)
		}
		if strings.Contains(created, `"workflow"`) {
			t.Fatalf("project JSON should not contain workflow, got:\n%s", created)
		}
		if strings.Contains(created, `"repos"`) {
			t.Fatalf("expected project JSON not to include repos, got:\n%s", created)
		}
		assertFile(t, filepath.Join(root, "project1", "project.json"))
		assertFile(t, filepath.Join(root, "project1", "project.md"))
		assertMissing(t, filepath.Join(root, "project1", "task.json"))
		assertMissing(t, filepath.Join(root, "project1", "task.md"))
		assertMissing(t, filepath.Join(root, "project1", "work.md"))
		assertFile(t, filepath.Join(root, "project1", "log.jsonl"))
		assertMissing(t, filepath.Join(root, "project1", "log.md"))
		projectLogJSON := run(t, "project", "log", "list", "--project=project1", "--json")
		var projectLogs []LogEntry
		if err := json.Unmarshal([]byte(projectLogJSON), &projectLogs); err != nil {
			t.Fatalf("project log list should print JSON, got error %v and output:\n%s", err, projectLogJSON)
		}
		if len(projectLogs) != 1 || projectLogs[0].Title != "Project created" {
			t.Fatalf("expected project creation log, got: %+v", projectLogs)
		}
		assertDir(t, filepath.Join(root, "project1", "artifacts"))
		assertDir(t, filepath.Join(root, "project1", "templates"))
		assertMissing(t, filepath.Join(root, "project1", "worktree"))
		projectAgents := readFile(t, filepath.Join(root, "project1", "AGENTS.md"))
		if !strings.Contains(projectAgents, "workspace root AGENTS.md") {
			t.Fatalf("expected project AGENTS.md to reference workspace AGENTS.md, got:\n%s", projectAgents)
		}
		if strings.Count(projectAgents, forgePromptStart) != 1 || strings.Count(projectAgents, forgePromptEnd) != 1 {
			t.Fatalf("expected project AGENTS.md to contain one managed block, got:\n%s", projectAgents)
		}
		if !strings.Contains(projectAgents, "Keep questions that can change project scope, acceptance criteria, or stable constraints in project.md") {
			t.Fatalf("expected project AGENTS.md to include project pending-item guidance, got:\n%s", projectAgents)
		}
		if !strings.Contains(projectAgents, "if `FORGE_SESSION_ID` is set in the environment or supplied in injected Forge session context, reuse it") || !strings.Contains(projectAgents, "the outer launcher already registered the session and locked this directory's resource") || !strings.Contains(projectAgents, "When accessing another project/task directory outside this locked resource") {
			t.Fatalf("expected project AGENTS.md to include managed session guidance, got:\n%s", projectAgents)
		}
		projectMDPath := filepath.Join(root, "project1", "project.md")
		projectMD := readFile(t, projectMDPath)
		if !strings.Contains(projectMD, "# Implement the forge MVP") || !strings.Contains(projectMD, "Implement the forge MVP") {
			t.Fatalf("expected project.md to contain project background, got:\n%s", projectMD)
		}
		if !strings.Contains(projectMD, "## Background") || !strings.Contains(projectMD, "## Scope") || !strings.Contains(projectMD, "## Acceptance Criteria") {
			t.Fatalf("expected project.md to include durable brief modules, got:\n%s", projectMD)
		}
		if strings.Contains(projectMD, "## Notes") {
			t.Fatalf("expected project.md to contain durable brief context only, got:\n%s", projectMD)
		}
		assertNoHan(t, projectMDPath)
		if strings.Contains(projectAgents, "Read project.json, project.md, work.md") || !strings.Contains(projectAgents, "projects do not have a work.md recovery snapshot") {
			t.Fatalf("expected project AGENTS.md to omit project work.md, got:\n%s", projectAgents)
		}
		if strings.Contains(projectAgents, "This is a subtask") {
			t.Fatalf("project AGENTS.md should not contain subtask-only guidance, got:\n%s", projectAgents)
		}
		if !strings.Contains(projectAgents, "Project task templates live in templates/*.md") || !strings.Contains(projectAgents, "autorun: true") {
			t.Fatalf("project AGENTS.md should document the task template format, got:\n%s", projectAgents)
		}
		if !strings.Contains(projectAgents, "workspace root AGENTS.md (../AGENTS.md)") {
			t.Fatalf("project AGENTS.md should reference workspace AGENTS.md by relative path, got:\n%s", projectAgents)
		}
		templateContent := "---\ntitle: Daily inspection\nautorun: true\nagent-profiles: [kimi, codex]\nprompt: |\n  Inspect the project.\n  Report findings.\n---\n# Daily inspection\n\nCheck current state.\n"
		if err := os.WriteFile(filepath.Join(root, "project1", "templates", "daily.md"), []byte(templateContent), 0o644); err != nil {
			t.Fatal(err)
		}
		if err := os.RemoveAll(filepath.Join(root, "project1", "artifacts")); err != nil {
			t.Fatal(err)
		}
		projectDetailJSON := run(t, "workspace", "resource", "--id", "project1", "--json")
		var projectDetail ResourceDetailView
		if err := json.Unmarshal([]byte(projectDetailJSON), &projectDetail); err != nil {
			t.Fatalf("workspace project resource should print JSON, got error %v and output:\n%s", err, projectDetailJSON)
		}
		if projectDetail.Artifacts == nil || len(projectDetail.Artifacts) != 0 {
			t.Fatalf("expected missing project artifacts directory to return an empty list, got: %+v", projectDetail.Artifacts)
		}
		if len(projectDetail.Templates) != 1 {
			t.Fatalf("expected one task template, got: %+v", projectDetail.Templates)
		}
		template := projectDetail.Templates[0]
		if template.Name != "daily" || template.Title != "Daily inspection" || !template.AutoRun || strings.Join(template.PreferredAgentProfiles, ",") != "kimi,codex" || template.Prompt != "Inspect the project.\nReport findings." || !strings.Contains(template.Detail, "Check current state.") {
			t.Fatalf("unexpected parsed task template: %+v", template)
		}

		listed := run(t, "project", "list")
		if !strings.Contains(listed, "project1\tImplement the forge MVP") {
			t.Fatalf("expected task list to include project1, got:\n%s", listed)
		}

		child := run(t, "task", "create", "--project=project1", "Add task commands")
		if !strings.Contains(child, `"id": "project1.task1"`) {
			t.Fatalf("expected project1.task1 JSON, got:\n%s", child)
		}
		assertFile(t, filepath.Join(root, "project1", "task1", "task.json"))
		assertFile(t, filepath.Join(root, "project1", "task1", "task.md"))
		taskMD := readFile(t, filepath.Join(root, "project1", "task1", "task.md"))
		workMD := readFile(t, filepath.Join(root, "project1", "task1", "work.md"))
		if !strings.Contains(taskMD, "Keep the durable contract here") || !strings.Contains(taskMD, "when they affect the task contract") {
			t.Fatalf("expected task.md template to define the durable contract, got:\n%s", taskMD)
		}
		if !strings.Contains(workMD, "current execution state and next action") || !strings.Contains(workMD, "Do not restate the task background, scope, acceptance criteria, or stable decisions") {
			t.Fatalf("expected work.md template to stay focused on recovery state, got:\n%s", workMD)
		}
		assertDir(t, filepath.Join(root, "project1", "task1", "worktree"))
		subtaskAgents := readFile(t, filepath.Join(root, "project1", "task1", "AGENTS.md"))
		if !strings.Contains(subtaskAgents, "parent project AGENTS.md (../AGENTS.md)") || !strings.Contains(subtaskAgents, "workspace root AGENTS.md (../../AGENTS.md)") {
			t.Fatalf("expected subtask AGENTS.md to reference project and workspace AGENTS.md by relative paths, got:\n%s", subtaskAgents)
		}
		if strings.Count(subtaskAgents, forgePromptStart) != 1 || strings.Count(subtaskAgents, forgePromptEnd) != 1 {
			t.Fatalf("expected subtask AGENTS.md to contain one managed block, got:\n%s", subtaskAgents)
		}
		if !strings.Contains(subtaskAgents, "Read the parent project directory's project.json, project.md, and log.jsonl") {
			t.Fatalf("expected subtask AGENTS.md to reference parent context files, got:\n%s", subtaskAgents)
		}
		if !strings.Contains(subtaskAgents, "forge task log add <title> --details <details>") {
			t.Fatalf("expected subtask AGENTS.md to mention structured log command, got:\n%s", subtaskAgents)
		}
		if !strings.Contains(subtaskAgents, "Keep questions that can change scope, acceptance criteria, or stable constraints in task.md") {
			t.Fatalf("expected subtask AGENTS.md to include generic pending-item guidance, got:\n%s", subtaskAgents)
		}
		if !strings.Contains(subtaskAgents, "Use task.md as the durable contract") || !strings.Contains(subtaskAgents, "Use work.md as a replaceable recovery checkpoint") || !strings.Contains(subtaskAgents, "promote it to task.md") {
			t.Fatalf("expected subtask AGENTS.md to distinguish task contract from recovery state, got:\n%s", subtaskAgents)
		}
		if !strings.Contains(subtaskAgents, "forge session new --pid <pid>") || !strings.Contains(subtaskAgents, "lock this directory's resource once") {
			t.Fatalf("expected subtask AGENTS.md to include direct-start session ownership guidance, got:\n%s", subtaskAgents)
		}
		if !strings.Contains(subtaskAgents, "forge task autorun complete") || !strings.Contains(subtaskAgents, "forge task create --autorun") {
			t.Fatalf("expected subtask AGENTS.md to teach AutoRun protocol, got:\n%s", subtaskAgents)
		}
		if !strings.Contains(subtaskAgents, "git worktree add") || !strings.Contains(subtaskAgents, "absolute destination path inside this task's worktree/") || !strings.Contains(subtaskAgents, "git -C") {
			t.Fatalf("expected subtask AGENTS.md to prevent relative worktree destination mistakes, got:\n%s", subtaskAgents)
		}
		if !strings.Contains(subtaskAgents, "Task boundaries are default safeguards against multi-agent conflicts, not absolute restrictions") || !strings.Contains(subtaskAgents, "Explicit user instructions may authorize work outside this task directory; Forge lock rules still apply") {
			t.Fatalf("expected subtask AGENTS.md to make task boundaries subordinate to explicit user instructions, got:\n%s", subtaskAgents)
		}
		if strings.Contains(projectAgents, "Explicit user instructions may authorize work outside this task directory") {
			t.Fatalf("project AGENTS.md should not contain task-only scope guidance, got:\n%s", projectAgents)
		}

		children := run(t, "task", "list", "--project=project1")
		if !strings.Contains(children, "task1\tAdd task commands") {
			t.Fatalf("expected subtask list to include task1, got:\n%s", children)
		}
		if strings.Contains(children, "project1.task1") {
			t.Fatalf("task list should display short task ids, got:\n%s", children)
		}
		if err := os.RemoveAll(filepath.Join(root, "project1", "task1", "artifacts")); err != nil {
			t.Fatal(err)
		}
		if err := os.RemoveAll(filepath.Join(root, "project1", "task1", "worktree")); err != nil {
			t.Fatal(err)
		}
		emptyDetailJSON := run(t, "workspace", "resource", "--id", "project1.task1", "--json")
		var emptyDetail ResourceDetailView
		if err := json.Unmarshal([]byte(emptyDetailJSON), &emptyDetail); err != nil {
			t.Fatalf("workspace task resource should print JSON, got error %v and output:\n%s", err, emptyDetailJSON)
		}
		if emptyDetail.Artifacts == nil || len(emptyDetail.Artifacts) != 0 {
			t.Fatalf("expected missing task artifacts directory to return an empty list, got: %+v", emptyDetail.Artifacts)
		}
		if emptyDetail.Worktrees == nil || len(emptyDetail.Worktrees) != 0 {
			t.Fatalf("expected missing task worktree directory to return an empty list, got: %+v", emptyDetail.Worktrees)
		}
		if err := os.MkdirAll(filepath.Join(root, "project1", "task1", "artifacts"), 0o755); err != nil {
			t.Fatal(err)
		}

		if err := os.WriteFile(filepath.Join(root, "project1", "task1", "artifacts", "result.txt"), []byte("ok"), 0o644); err != nil {
			t.Fatal(err)
		}
		treeJSON := run(t, "workspace", "tree", "--json")
		var tree WorkspaceTree
		if err := json.Unmarshal([]byte(treeJSON), &tree); err != nil {
			t.Fatalf("workspace tree should print JSON, got error %v and output:\n%s", err, treeJSON)
		}
		if tree.Root != slash(realPath(t, root)) || len(tree.Projects) != 1 {
			t.Fatalf("unexpected workspace tree root/projects: %+v", tree)
		}
		if tree.Projects[0].ID != "project1" || tree.Projects[0].Path != "project1" || len(tree.Projects[0].Children) != 1 {
			t.Fatalf("unexpected project tree item: %+v", tree.Projects[0])
		}
		taskItem := tree.Projects[0].Children[0]
		if taskItem.ID != "project1.task1" || taskItem.Path != "project1/task1" {
			t.Fatalf("unexpected task tree item: %+v", taskItem)
		}
		detailJSON := run(t, "workspace", "resource", "--id", "project1.task1", "--json")
		var detail ResourceDetailView
		if err := json.Unmarshal([]byte(detailJSON), &detail); err != nil {
			t.Fatalf("workspace resource should print JSON, got error %v and output:\n%s", err, detailJSON)
		}
		if detail.ID != "project1.task1" || detail.Path != "project1/task1" || len(detail.Files) == 0 {
			t.Fatalf("unexpected task detail: %+v", detail)
		}
		if detail.Files[0].Name != "task.md" || detail.Files[0].Path != "project1/task1/task.md" {
			t.Fatalf("expected task file path in detail, got: %+v", detail.Files[0])
		}
		if len(detail.Logs) != 1 || detail.Logs[0].Title != "Task created" {
			t.Fatalf("expected structured task creation log, got: %+v", detail.Logs)
		}
		if len(detail.Artifacts) != 1 || detail.Artifacts[0].Name != "result.txt" {
			t.Fatalf("expected artifact file in task detail, got: %+v", detail.Artifacts)
		}

		addedLog := run(t, "task", "log", "add", "--project=project1", "--task=task1", "--details", "go test ./... passed", "Ran checks")
		var addedEntry LogEntry
		if err := json.Unmarshal([]byte(addedLog), &addedEntry); err != nil {
			t.Fatalf("task log add should print JSON, got error %v and output:\n%s", err, addedLog)
		}
		if addedEntry.Title != "Ran checks" || addedEntry.Details != "go test ./... passed" {
			t.Fatalf("unexpected added log entry: %+v", addedEntry)
		}
		taskLogJSON := run(t, "task", "log", "list", "--project=project1", "--task=task1", "--json")
		var taskLogs []LogEntry
		if err := json.Unmarshal([]byte(taskLogJSON), &taskLogs); err != nil {
			t.Fatalf("task log list should print JSON, got error %v and output:\n%s", err, taskLogJSON)
		}
		if len(taskLogs) != 2 || taskLogs[0].Title != "Ran checks" || taskLogs[1].Title != "Task created" {
			t.Fatalf("expected newest task log first, got: %+v", taskLogs)
		}
		rawTaskLog := readFile(t, filepath.Join(root, "project1", "task1", "log.jsonl"))
		if !strings.Contains(strings.SplitN(rawTaskLog, "\n", 2)[0], `"title":"Ran checks"`) {
			t.Fatalf("expected log.jsonl to store newest entry first, got:\n%s", rawTaskLog)
		}

		shown := run(t, "task", "show", "--project=project1", "--task=task1")
		if !strings.Contains(shown, `"parent": "project1"`) {
			t.Fatalf("expected show to find subtask, got:\n%s", shown)
		}

		archivedTask := run(t, "task", "archive", "--project=project1", "--task=task1")
		if !strings.Contains(archivedTask, "project1/archive/task1") {
			t.Fatalf("expected task archive path before project archive, got:\n%s", archivedTask)
		}
		archived := run(t, "project", "archive", "--project=project1")
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

func TestAutoRunLifecycleAndSuspend(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "Automation")
		childJSON := run(t, "task", "create", "--project=project1", "--autorun", "--prompt=Investigate", "Child")
		if !strings.Contains(childJSON, `"autoRun"`) || !strings.Contains(childJSON, `"state": "queued"`) {
			t.Fatalf("expected AutoRun metadata, got:\n%s", childJSON)
		}
		secondJSON := run(t, "task", "create", "--project=project1", "--autorun", "--prompt=Review", "Second")
		if !strings.Contains(secondJSON, `"state": "queued"`) || !strings.Contains(secondJSON, `"generation": 1`) {
			t.Fatalf("expected queued second task metadata, got:\n%s", secondJSON)
		}
		detailJSON := run(t, "workspace", "resource", "--id=project1.task1", "--json")
		var detail ResourceDetailView
		if err := json.Unmarshal([]byte(detailJSON), &detail); err != nil {
			t.Fatal(err)
		}
		if detail.AutoRun == nil || detail.AutoRun.State != autoRunStateQueued {
			t.Fatalf("task detail should expose AutoRun state, got: %+v", detail.AutoRun)
		}
		treeJSON := run(t, "workspace", "tree", "--json")
		var tree WorkspaceTree
		if err := json.Unmarshal([]byte(treeJSON), &tree); err != nil {
			t.Fatal(err)
		}
		if got := tree.Projects[0].Children[0].AutoRun; got == nil || got.Generation != 1 || got.State != autoRunStateQueued {
			t.Fatalf("task tree should expose lightweight AutoRun state, got: %+v", got)
		}

		listed := run(t, "task", "list", "--project=project1", "--runnable", "--json")
		var ready struct {
			Tasks []runnableTask `json:"tasks"`
		}
		if err := json.Unmarshal([]byte(listed), &ready); err != nil {
			t.Fatal(err)
		}
		if len(ready.Tasks) != 2 || ready.Tasks[0].ID != "project1.task1" || !ready.Tasks[0].Ready {
			t.Fatalf("expected both queued tasks runnable, got: %+v", ready.Tasks)
		}

		run(t, "task", "autorun", "start", "--project=project1", "--task=task1")
		suspended := run(t, "task", "autorun", "suspend", "--project=project1", "--task=task1", "--summary=waiting for review")
		if !strings.Contains(suspended, `"state": "suspended"`) || !strings.Contains(suspended, `"suspendedAt"`) || !strings.Contains(suspended, `"suspensionSummary": "waiting for review"`) {
			t.Fatalf("expected suspended metadata, got:\n%s", suspended)
		}

		// Resume keeps the same generation and preserves the summary for the
		// woken agent.
		resumed := run(t, "task", "autorun", "resume", "--project=project1", "--task=task1")
		if !strings.Contains(resumed, `"state": "queued"`) || !strings.Contains(resumed, `"generation": 1`) {
			t.Fatalf("expected resume to requeue generation 1, got:\n%s", resumed)
		}

		run(t, "task", "autorun", "start", "--project=project1", "--task=task1")
		run(t, "task", "autorun", "complete", "--project=project1", "--task=task1", "--summary=done")

		queued := run(t, "task", "autorun", "queue", "--project=project1", "--task=task1")
		if !strings.Contains(queued, `"generation": 2`) || !strings.Contains(queued, `"state": "queued"`) {
			t.Fatalf("expected terminal AutoRun to queue generation 2, got:\n%s", queued)
		}
		logs := run(t, "task", "log", "list", "--project=project1", "--task=task1", "--json")
		if !strings.Contains(logs, `"autoRun": true`) || !strings.Contains(logs, `"autoRunGeneration": 1`) {
			t.Fatalf("expected marked AutoRun history, got:\n%s", logs)
		}
	})
}

func TestAutoRunPreferredAgentProfiles(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "Automation")
		created := run(t, "task", "create", "--project=project1", "--autorun", "--agent-profile=Kimi", "--agent-profile=codex", "--agent-profile=kimi", "Profile task")
		var task Task
		if err := json.Unmarshal([]byte(created), &task); err != nil {
			t.Fatal(err)
		}
		if task.AutoRun == nil || strings.Join(task.AutoRun.PreferredAgentProfiles, ",") != "kimi,codex" {
			t.Fatalf("unexpected preferred Agent Profiles: %+v", task.AutoRun)
		}
		runnable := run(t, "task", "list", "--project=project1", "--runnable", "--json")
		if !strings.Contains(runnable, `"preferredAgentProfiles": [`) || !strings.Contains(runnable, `"kimi"`) {
			t.Fatalf("runnable output is missing Agent Profiles:\n%s", runnable)
		}
		run(t, "task", "autorun", "start", "--project=project1", "--task=task1")
		run(t, "task", "autorun", "complete", "--project=project1", "--task=task1")
		requeued := run(t, "task", "autorun", "queue", "--project=project1", "--task=task1")
		if !strings.Contains(requeued, `"preferredAgentProfiles"`) || !strings.Contains(requeued, `"codex"`) {
			t.Fatalf("requeue did not inherit Agent Profiles:\n%s", requeued)
		}

		if _, err := runErr(t, "task", "create", "--project=project1", "--autorun", "--agent=local-agent", "Removed legacy task"); err == nil {
			t.Fatal("expected removed --agent task option to be rejected")
		}
		if _, err := runErr(t, "task", "create", "--project=project1", "--autorun", "--agent-profile=not valid", "Invalid"); err == nil || !strings.Contains(err.Error(), "invalid agent profile") {
			t.Fatalf("expected invalid Profile to fail, got %v", err)
		}
	})
}

func TestOldRunNamingIsRejected(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "Automation")
		if _, err := runErr(t, "task", "create", "--project=project1", "--non-interactive", "Task"); err == nil {
			t.Fatal("expected --non-interactive to be rejected")
		}
		if _, err := runErr(t, "task", "run", "queue", "--project=project1", "--task=task1"); err == nil {
			t.Fatal("expected task run command to be rejected")
		}
	})
}

func TestAutoRunRetryBudgetPauses(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "Automation")
		run(t, "task", "create", "--project=project1", "--autorun", "Task")
		run(t, "task", "autorun", "start", "--project=project1", "--task=task1")
		run(t, "task", "autorun", "retry", "--project=project1", "--task=task1")
		run(t, "task", "autorun", "retry", "--project=project1", "--task=task1")
		third := run(t, "task", "autorun", "retry", "--project=project1", "--task=task1")
		if !strings.Contains(third, `"state": "paused"`) {
			t.Fatalf("expected retry limit to pause, got:\n%s", third)
		}
	})
}

func TestAutoRunRejectsDependencyFlags(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "Automation")
		run(t, "task", "create", "--project=project1", "--autorun", "First")
		if _, err := runErr(t, "task", "create", "--project=project1", "--autorun", "--after=project1.task1@1", "Second"); err == nil || !strings.Contains(err.Error(), "task create") {
			t.Fatalf("expected --after to be rejected on task create, got %v", err)
		}
		if _, err := runErr(t, "task", "autorun", "wait", "--project=project1", "--task=task1"); err == nil || !strings.Contains(err.Error(), "unknown task autorun subcommand") {
			t.Fatalf("expected removed autorun wait subcommand to be rejected, got %v", err)
		}
		if _, err := runErr(t, "task", "autorun", "suspend", "--project=project1", "--task=task1", "--after=project1.task2@1"); err == nil || !strings.Contains(err.Error(), "usage: forge task autorun") {
			t.Fatalf("expected removed --after flag on suspend to be rejected, got %v", err)
		}
	})
}

func TestForgeStartDoesNotScheduleAutoRun(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "Automation")
		run(t, "task", "create", "--project=project1", "--autorun", "--prompt=Do work", "Task")
		output := filepath.Join(root, "automatic.out")
		t.Setenv("FORGE_START_HELPER", "1")
		t.Setenv("FORGE_START_OUTPUT", output)
		t.Setenv("FORGE_START_RECORD_MODE", "1")
		startRun(t, "--project=project1", "--task=task1", "--", os.Args[0], "-test.run=^TestForgeStartHelper$")
		got := readFile(t, output)
		if strings.Contains(got, "non_interactive") || strings.Contains(got, `"autoRunGeneration"`) {
			t.Fatalf("forge start should not inject AutoRun context, got:\n%s", got)
		}
		shown := run(t, "task", "show", "--project=project1", "--task=task1")
		if !strings.Contains(shown, `"state": "queued"`) {
			t.Fatalf("forge start should leave AutoRun queued, got:\n%s", shown)
		}
	})
}

func TestHelpGroupsCommandSections(t *testing.T) {
	help := run(t, "help")
	expected := []string{
		"How Forge works:",
		"All workspace data lives on the filesystem",
		"Agents coordinate\n  writes with sessions that lock the project or task they update",
		"Agents may read other projects and tasks\n  freely for context",
		"Agent\n  execution (forge start) and the web service (forge serve) are subcommands of\n  the same forge binary.",
		"The workspace root does not require a lock.",
		"Usage:",
		"  forge init [--language=<language>]\n  forge migrate [--language=<language>]",
		"  forge repo add [--bare] <name> <url>\n  forge repo list",
		"  forge project create [--slug <slug>] <description>",
		"  forge task create [--project=<project>] [--slug <slug>] [--detail <detail>|--task-markdown <markdown>] [--autorun]",
		"  forge session new [--heartbeat [--timeout <duration>] | --pid <pid> | --agenthub --endpoint <url>",
		"  forge start [--project=<project>] [--task=<task>] [-- <agent command...>]\n  forge serve [--addr=<address>] [--workspace=<path>] [--version]",
		"Commands:",
		"  forge init [--language=<language>]",
		"  forge migrate [--language=<language>]",
		"  forge repo add [--bare] <name> <url>",
		"  forge project create [--slug <slug>] <description>",
		"  forge task create [--project=<project>] [--slug <slug>] [--detail <detail>|--task-markdown <markdown>] [--autorun]",
		"  forge session new [--heartbeat [--timeout <duration>] | --pid <pid> | --agenthub --endpoint <url>",
		"  forge start [--project=<project>] [--task=<task>] [-- <agent command...>]",
		"  forge serve [--addr=<address>] [--workspace=<path>] [--version]",
	}
	offset := 0
	for _, marker := range expected {
		index := strings.Index(help[offset:], marker)
		if index < 0 {
			t.Fatalf("expected help marker %q after offset %d, got:\n%s", marker, offset, help)
		}
		offset += index + len(marker)
	}
}

func TestTaskCreateUsesTitleAndDetail(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "Parent project")

		created := run(t, "task", "create", "Task title", "--project=project1", "--slug=task-title", "--detail=Line one\n\nLine two")
		var task Task
		if err := json.Unmarshal([]byte(created), &task); err != nil {
			t.Fatalf("task create should print task JSON, got error %v and output:\n%s", err, created)
		}
		if task.Title != "Task title" {
			t.Fatalf("expected task title in JSON, got: %+v", task)
		}
		if strings.Contains(created, `"description"`) || task.Description != "" {
			t.Fatalf("new task JSON should not include description, got:\n%s", created)
		}

		taskMD := readFile(t, filepath.Join(root, "project1", "task1-task-title", "task.md"))
		expectedTaskMD := `# Task title

## Background

Line one

Line two

## Scope

<!-- Define what is included. Add Out of Scope, Constraints, Decisions, or Open Questions when they affect the task contract. -->

## Acceptance Criteria

<!-- List observable results that mean this is done. -->
- TBD
`
		if taskMD != expectedTaskMD {
			t.Fatalf("expected detail to initialize task.md, got:\n%s", taskMD)
		}

		listed := run(t, "task", "list", "--project=project1")
		if !strings.Contains(listed, "task1\tTask title") {
			t.Fatalf("expected task list to show title, got:\n%s", listed)
		}
	})
}

func TestTaskCreateUsesCompleteTaskMarkdown(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "Parent project")

		templateMarkdown := `# Template task

## Background

Template background.

## Scope

- Template scope.

## Acceptance Criteria

- Template result.
`
		run(t, "task", "create", "Template task", "--project=project1", "--slug=template-task", "--task-markdown", templateMarkdown)

		taskMD := readFile(t, filepath.Join(root, "project1", "task1-template-task", "task.md"))
		if taskMD != templateMarkdown {
			t.Fatalf("expected template markdown to be written exactly once, got:\n%s", taskMD)
		}
		for _, heading := range []string{"# Template task", "## Background", "## Scope", "## Acceptance Criteria"} {
			if count := strings.Count(taskMD, heading); count != 1 {
				t.Fatalf("expected %q exactly once, got %d in:\n%s", heading, count, taskMD)
			}
		}
		if strings.Contains(taskMD, "<!-- Define what is included.") || strings.Contains(taskMD, "- TBD") {
			t.Fatalf("complete template markdown should not include the default scaffold, got:\n%s", taskMD)
		}

		if _, err := runErr(t, "task", "create", "Ambiguous task", "--project=project1", "--detail=Background", "--task-markdown=# Full task"); err == nil || !strings.Contains(err.Error(), "mutually exclusive") {
			t.Fatalf("expected detail and complete markdown to be rejected together, got: %v", err)
		}
	})
}

func TestSluggedProjectAndTaskDirectories(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")

		created := run(t, "project", "create", "--slug", "forge-dev", "Develop forge")
		if !strings.Contains(created, `"id": "project1"`) {
			t.Fatalf("expected project id to remain project1, got:\n%s", created)
		}
		projectPath := filepath.Join(root, "project1-forge-dev")
		assertFile(t, filepath.Join(projectPath, "project.json"))
		assertMissing(t, filepath.Join(root, "project1", "project.json"))

		if err := os.Chdir(projectPath); err != nil {
			t.Fatal(err)
		}
		child := run(t, "task", "create", "develop forge", "--slug", "develop-forge")
		if err := os.Chdir(root); err != nil {
			t.Fatal(err)
		}
		if !strings.Contains(child, `"id": "project1.task1"`) {
			t.Fatalf("expected task id to remain project1.task1, got:\n%s", child)
		}
		taskPath := filepath.Join(projectPath, "task1-develop-forge")
		assertFile(t, filepath.Join(taskPath, "task.json"))
		assertMissing(t, filepath.Join(projectPath, "task1", "task.json"))

		listed := run(t, "project", "list")
		if !strings.Contains(listed, "project1\tDevelop forge") || strings.Contains(listed, "project1.task1") {
			t.Fatalf("expected project list to include only slugged project by stable id, got:\n%s", listed)
		}
		children := run(t, "task", "list", "--project=1")
		if !strings.Contains(children, "task1\tdevelop forge") {
			t.Fatalf("expected task list to include slugged task by short id, got:\n%s", children)
		}
		shown := run(t, "task", "show", "--project=project1", "--task=task1")
		if !strings.Contains(shown, `"parent": "project1"`) {
			t.Fatalf("expected show to resolve slugged task by id, got:\n%s", shown)
		}

		output := filepath.Join(root, "start.out")
		t.Setenv("FORGE_START_HELPER", "1")
		t.Setenv("FORGE_START_OUTPUT", output)
		startRun(t, "--project", "project1", "--task", "task1", "--", os.Args[0], "-test.run=^TestForgeStartHelper$", "--", "slugged")
		got := readFile(t, output)
		want := realPath(t, taskPath) + "\nslugged\n"
		if got != want {
			t.Fatalf("expected forge start to run in slugged task dir, got:\n%s", got)
		}

		archivedTask := run(t, "task", "archive", "--project=project1", "--task=task1")
		if !strings.Contains(archivedTask, "project1-forge-dev/archive/task1-develop-forge") {
			t.Fatalf("expected task archive to preserve slugged directory name, got:\n%s", archivedTask)
		}
		assertDir(t, filepath.Join(projectPath, archiveDir, "task1-develop-forge"))

		nextChild := run(t, "task", "create", "--project=project1", "Next task")
		if !strings.Contains(nextChild, `"id": "project1.task2"`) {
			t.Fatalf("expected next task id to account for archived slugged task, got:\n%s", nextChild)
		}

		nextProject := run(t, "project", "create", "Next project")
		if !strings.Contains(nextProject, `"id": "project2"`) {
			t.Fatalf("expected next project id to account for slugged project, got:\n%s", nextProject)
		}

		archivedNextTask := run(t, "task", "archive", "--project=project1", "--task=task2")
		if !strings.Contains(archivedNextTask, "project1-forge-dev/archive/task2") {
			t.Fatalf("expected second task archive path before project archive, got:\n%s", archivedNextTask)
		}
		archivedProject := run(t, "project", "archive", "--project=project1")
		if !strings.Contains(archivedProject, "archive/project1-forge-dev") {
			t.Fatalf("expected project archive to preserve slugged directory name, got:\n%s", archivedProject)
		}
		assertDir(t, filepath.Join(root, archiveDir, "project1-forge-dev"))
	})
}

func TestMalformedSluggedDirectoriesAreIgnored(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		malformedProject := newProject("project9", "Malformed project", "Malformed project")
		if err := createResourceFiles(filepath.Join(root, "project9--bad"), &malformedProject); err != nil {
			t.Fatal(err)
		}
		listed := run(t, "project", "list")
		if strings.Contains(listed, "project9") {
			t.Fatalf("malformed project directory should not be listed, got:\n%s", listed)
		}
		out, err := runErr(t, "project", "show", "--project=project9")
		if err == nil {
			t.Fatalf("malformed project directory should not resolve by id, got stdout:\n%s", out)
		}

		next := run(t, "project", "create", "First valid project")
		if !strings.Contains(next, `"id": "project1"`) {
			t.Fatalf("malformed project directory should not affect next id, got:\n%s", next)
		}

		parentPath := filepath.Join(root, "project1")
		parentID := "project1"
		malformedTask := newTask("project1.task8", parentID, "Malformed task", "Malformed task")
		if err := createResourceFiles(filepath.Join(parentPath, "task8--bad"), &malformedTask); err != nil {
			t.Fatal(err)
		}
		children := run(t, "task", "list", "--project=project1", "--all")
		if strings.Contains(children, "task8\tMalformed task") {
			t.Fatalf("malformed task directory should not be listed, got:\n%s", children)
		}

		child := run(t, "task", "create", "--project=project1", "First valid task")
		if !strings.Contains(child, `"id": "project1.task1"`) {
			t.Fatalf("malformed task directory should not affect next id, got:\n%s", child)
		}
	})
}

func TestResourceLocatorRejectsDuplicateIDs(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "Project")
		duplicate := filepath.Join(root, archiveDir, "project1-copy")
		if err := os.MkdirAll(duplicate, 0o755); err != nil {
			t.Fatal(err)
		}
		data := readFile(t, filepath.Join(root, "project1", projectJSONFile))
		if err := os.WriteFile(filepath.Join(duplicate, projectJSONFile), []byte(data), 0o644); err != nil {
			t.Fatal(err)
		}
		if _, err := findResourceDir(root, "project1"); err == nil || !strings.Contains(err.Error(), "multiple resource directories") {
			t.Fatalf("expected duplicate resource error, got %v", err)
		}
	})
}

func TestSessionNewLockShowListAndUnlock(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "Session project")
		run(t, "task", "create", "--project=project1", "Session task")
		id := strings.TrimSpace(run(t, "session", "new"))
		if id == "" || !strings.HasPrefix(id, "session-") {
			t.Fatalf("expected session new to print generated id, got %q", id)
		}
		if err := os.Chdir(filepath.Join(root, "project1", "task1")); err != nil {
			t.Fatal(err)
		}

		locked := run(t, "session", "lock", "--id", id)
		if !strings.Contains(locked, `"id": "`+id+`"`) || !strings.Contains(locked, `"resourceId": "project1.task1"`) {
			t.Fatalf("expected lock to infer current task, got:\n%s", locked)
		}

		listed := run(t, "session", "list")
		if !strings.Contains(listed, id+"\theartbeat:") || !strings.Contains(listed, "project1.task1:project1/task1") {
			t.Fatalf("expected session list to show active task control, got:\n%s", listed)
		}

		shown := run(t, "session", "show", "--id", id)
		if !strings.Contains(shown, `"id": "`+id+`"`) || !strings.Contains(shown, `"resourceId": "project1.task1"`) {
			t.Fatalf("expected show to print session JSON, got:\n%s", shown)
		}

		unlocked := run(t, "session", "unlock", "--id", id)
		if strings.Contains(unlocked, `"resourceId": "project1.task1"`) || !strings.Contains(unlocked, `"controls": []`) {
			t.Fatalf("expected unlock to remove current task control, got:\n%s", unlocked)
		}

		ended := run(t, "session", "end", "--id", id)
		if !strings.Contains(ended, `"id": "`+id+`"`) {
			t.Fatalf("expected end to print removed session JSON, got:\n%s", ended)
		}
		listed = run(t, "session", "list")
		if strings.Contains(listed, id) {
			t.Fatalf("expected ended session to be removed from active list, got:\n%s", listed)
		}
	})
}

func TestSessionCommandsPruneExpiredSessions(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "Session project")
		run(t, "task", "create", "--project=project1", "Session task")
		stale := SessionStore{
			Version: 1,
			Sessions: []Session{{
				ID:        "stale",
				Liveness:  SessionLiveness{Type: "heartbeat", Timeout: "1s"},
				Controls:  []SessionControl{{ResourceID: "project1", Path: "project1"}},
				StartedAt: "2026-01-01T00:00:00Z",
				UpdatedAt: "2026-01-01T00:00:00Z",
			}},
		}
		if err := writeJSON(filepath.Join(root, sessionStateFile), stale); err != nil {
			t.Fatal(err)
		}

		id := strings.TrimSpace(run(t, "session", "new"))
		locked := run(t, "session", "lock", "--id", id, "--project", "project1", "--task", "task1")
		if strings.Contains(locked, "stale") || !strings.Contains(locked, `"id": "`+id+`"`) {
			t.Fatalf("expected lock to prune stale conflicting session, got:\n%s", locked)
		}
		listed := run(t, "session", "list")
		if strings.Contains(listed, "stale") || !strings.Contains(listed, id) {
			t.Fatalf("expected stale session to be pruned and active session to remain, got:\n%s", listed)
		}
	})
}

func TestSessionNewSupportsPIDLiveness(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "Session project")
		id := strings.TrimSpace(run(t, "session", "new", "--pid", strconv.Itoa(os.Getpid())))
		run(t, "session", "lock", "--id", id, "--project", "project1")

		listed := run(t, "session", "list")
		if !strings.Contains(listed, id+"\tpid:") || !strings.Contains(listed, "project1:project1") {
			t.Fatalf("expected pid liveness session in list, got:\n%s", listed)
		}
		shown := run(t, "session", "show", "--id", id)
		if !strings.Contains(shown, `"type": "pid"`) || !strings.Contains(shown, `"pid": `+strconv.Itoa(os.Getpid())) {
			t.Fatalf("expected pid liveness in show JSON, got:\n%s", shown)
		}
	})
}

func TestAgentHubSessionsAreNeverProbedByCLI(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "AgentHub lock")
		var requests int64
		var requestPaths []string
		var mu sync.Mutex
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			mu.Lock()
			requests++
			requestPaths = append(requestPaths, r.URL.Path)
			mu.Unlock()
			w.WriteHeader(http.StatusInternalServerError)
		}))
		defer server.Close()
		// A deliberately blocked endpoint: any request hangs until the test
		// finishes, so a probing CLI would deadlock here.
		release := make(chan struct{})
		var blockedRequests int64
		blocking := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			blockedRequests++
			<-release
		}))
		defer func() {
			close(release)
			blocking.Close()
		}()

		newAgentHubSession := func() string {
			return strings.TrimSpace(run(t, "session", "new", "--agenthub", "--endpoint", server.URL,
				"--source-instance-id", "forge-test", "--source-external-id", "workspace/run"))
		}
		first := newAgentHubSession()
		second := newAgentHubSession()
		// Unreachable and deliberately blocked endpoints must not slow down or
		// release sessions either.
		unreachable := strings.TrimSpace(run(t, "session", "new", "--agenthub", "--endpoint", "http://127.0.0.1:1",
			"--source-instance-id", "forge-test", "--source-external-id", "workspace/gone"))
		blocked := strings.TrimSpace(run(t, "session", "new", "--agenthub", "--endpoint", blocking.URL,
			"--source-instance-id", "forge-test", "--source-external-id", "workspace/blocked"))
		run(t, "session", "bind-agenthub", "--id", first, "--agenthub-session-id", "ses_lock")
		run(t, "session", "lock", "--id", first, "--project", "project1")

		start := time.Now()
		run(t, "session", "list")
		run(t, "session", "show", "--id", first)
		run(t, "session", "show", "--id", second)
		run(t, "session", "heartbeat", "--id", second)
		run(t, "workspace", "tree", "--json")
		run(t, "session", "unlock", "--id", first, "--project", "project1")
		run(t, "session", "lock", "--id", first, "--project", "project1")
		if elapsed := time.Since(start); elapsed > 10*time.Second {
			t.Fatalf("session commands blocked on AgentHub for %s", elapsed)
		}

		mu.Lock()
		defer mu.Unlock()
		if requests != 0 {
			t.Fatalf("CLI made %d AgentHub requests (%v); plain CLI must never probe AgentHub", requests, requestPaths)
		}
		if blockedRequests != 0 {
			t.Fatalf("CLI probed the blocked AgentHub endpoint %d times", blockedRequests)
		}
		for _, id := range []string{first, second, unreachable, blocked} {
			if listed := run(t, "session", "list"); !strings.Contains(listed, id) {
				t.Fatalf("AgentHub session %s was pruned by the CLI: %s", id, listed)
			}
		}
	})
}

func TestAgentHubSessionsSurviveLocalStalePruning(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "Mixed store")
		managed := strings.TrimSpace(run(t, "session", "new", "--agenthub", "--endpoint", "http://127.0.0.1:1",
			"--source-instance-id", "forge-test", "--source-external-id", "workspace/run"))
		run(t, "session", "lock", "--id", managed, "--project", "project1")
		store, err := readSessionStore(root)
		if err != nil {
			t.Fatal(err)
		}
		store.Sessions = append(store.Sessions, Session{
			ID:        "dead-pid",
			Liveness:  SessionLiveness{Type: "pid", PID: 99999999},
			StartedAt: "2026-01-01T00:00:00Z",
			UpdatedAt: time.Now().Format(time.RFC3339),
		}, Session{
			ID:        "stale-heartbeat",
			Liveness:  SessionLiveness{Type: "heartbeat", Timeout: "1s"},
			StartedAt: "2026-01-01T00:00:00Z",
			UpdatedAt: "2026-01-01T00:00:00Z",
		})
		if err := writeJSON(filepath.Join(root, sessionStateFile), store); err != nil {
			t.Fatal(err)
		}

		listed := run(t, "session", "list")
		if strings.Contains(listed, "dead-pid") || strings.Contains(listed, "stale-heartbeat") {
			t.Fatalf("local stale sessions were not pruned: %s", listed)
		}
		if !strings.Contains(listed, managed) {
			t.Fatalf("AgentHub session must survive local stale pruning: %s", listed)
		}
		if !strings.Contains(listed, "project1:project1") {
			t.Fatalf("AgentHub session lock must be retained: %s", listed)
		}
	})
}

func TestSessionEndOnlyEndsTargetSession(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "AgentHub end")
		run(t, "project", "create", "AgentHub other")
		var requests int64
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			requests++
			w.WriteHeader(http.StatusInternalServerError)
		}))
		defer server.Close()
		newAgentHubSession := func(externalID string) string {
			return strings.TrimSpace(run(t, "session", "new", "--agenthub", "--endpoint", server.URL,
				"--source-instance-id", "forge-test", "--source-external-id", externalID))
		}
		target := newAgentHubSession("workspace/target")
		other := newAgentHubSession("workspace/other")
		run(t, "session", "lock", "--id", target, "--project", "project1")
		run(t, "session", "lock", "--id", other, "--project", "project2")

		ended := run(t, "session", "end", "--id", target)
		if !strings.Contains(ended, `"id": "`+target+`"`) {
			t.Fatalf("expected end to print the removed session, got: %s", ended)
		}
		listed := run(t, "session", "list")
		if strings.Contains(listed, target) {
			t.Fatalf("ended session is still listed: %s", listed)
		}
		if !strings.Contains(listed, other) || !strings.Contains(listed, "project2:project2") {
			t.Fatalf("session end pruned another AgentHub session: %s", listed)
		}
		if requests != 0 {
			t.Fatalf("session end probed AgentHub %d times", requests)
		}
	})
}

func TestReadOnlySessionCommandsDoNotRewriteStore(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "AgentHub projection")
		id := strings.TrimSpace(run(t, "session", "new", "--agenthub", "--endpoint", "http://127.0.0.1:1",
			"--source-instance-id", "forge-test", "--source-external-id", "workspace/run",
			"--agenthub-session-id", "ses_lock"))
		run(t, "session", "lock", "--id", id, "--project", "project1")
		// Seed legacy diagnostic projection fields left behind by older Forge
		// versions; read-only commands must preserve them verbatim.
		store, err := readSessionStore(root)
		if err != nil {
			t.Fatal(err)
		}
		store.Sessions[0].Liveness.LastKnownState = "unknown"
		store.Sessions[0].Liveness.LastCheckedAt = "2026-01-01T00:00:00Z"
		store.Sessions[0].Liveness.LivenessDiagnostic = "legacy diagnostic"
		if err := writeJSON(filepath.Join(root, sessionStateFile), store); err != nil {
			t.Fatal(err)
		}
		before := readFile(t, filepath.Join(root, sessionStateFile))

		run(t, "session", "list")
		run(t, "session", "show", "--id", id)
		run(t, "workspace", "tree", "--json")

		after := readFile(t, filepath.Join(root, sessionStateFile))
		if before != after {
			t.Fatalf("read-only commands rewrote the session store:\nbefore:\n%s\nafter:\n%s", before, after)
		}
		shown := run(t, "session", "show", "--id", id)
		if !strings.Contains(shown, `"lastKnownState": "unknown"`) {
			t.Fatalf("legacy projection fields must remain readable: %s", shown)
		}
	})
}

func TestSessionListPrunesDeadPIDSession(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "Session project")
		store := SessionStore{
			Version: 1,
			Sessions: []Session{{
				ID:        "dead-pid",
				Liveness:  SessionLiveness{Type: "pid", PID: 99999999},
				Controls:  []SessionControl{{ResourceID: "project1", Path: "project1"}},
				StartedAt: "2026-01-01T00:00:00Z",
				UpdatedAt: time.Now().Format(time.RFC3339),
			}},
		}
		if err := writeJSON(filepath.Join(root, sessionStateFile), store); err != nil {
			t.Fatal(err)
		}

		listed := run(t, "session", "list")
		if strings.Contains(listed, "dead-pid") {
			t.Fatalf("expected dead pid session to be pruned, got:\n%s", listed)
		}
	})
}

func TestSessionCommandsPruneArchivedResourceSessions(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "Session project")
		run(t, "task", "create", "--project=project1", "Session task")
		run(t, "task", "archive", "--project=project1", "--task=task1")
		store := SessionStore{
			Version: 1,
			Sessions: []Session{{
				ID:        "archived-resource",
				Liveness:  SessionLiveness{Type: "heartbeat", Timeout: "1h"},
				Controls:  []SessionControl{{ResourceID: "project1.task1", Path: "project1/task1"}},
				StartedAt: "2026-01-01T00:00:00Z",
				UpdatedAt: time.Now().Format(time.RFC3339),
			}, {
				ID:        "archived-path",
				Liveness:  SessionLiveness{Type: "heartbeat", Timeout: "1h"},
				Controls:  []SessionControl{{ResourceID: "legacy", Path: "project1/archive/task1"}},
				StartedAt: "2026-01-01T00:00:00Z",
				UpdatedAt: time.Now().Format(time.RFC3339),
			}},
		}
		if err := writeJSON(filepath.Join(root, sessionStateFile), store); err != nil {
			t.Fatal(err)
		}

		listed := run(t, "session", "list")
		if strings.Contains(listed, "archived-resource") || strings.Contains(listed, "archived-path") {
			t.Fatalf("expected archived resource sessions to be pruned, got:\n%s", listed)
		}
		store, err := readSessionStore(root)
		if err != nil {
			t.Fatal(err)
		}
		if len(store.Sessions) != 0 {
			t.Fatalf("expected archived resource sessions to be removed, got: %#v", store.Sessions)
		}
	})
}

func TestSessionLocksOnlyConflictOnSameResource(t *testing.T) {
	tests := []struct {
		name         string
		first        []string
		second       []string
		wantConflict bool
	}{
		{
			name:   "project then task",
			first:  []string{"--project", "project1"},
			second: []string{"--project", "project1", "--task", "task1"},
		},
		{
			name:   "task then project",
			first:  []string{"--project", "project1", "--task", "task1"},
			second: []string{"--project", "project1"},
		},
		{
			name:         "same project",
			first:        []string{"--project", "project1"},
			second:       []string{"--project", "project1"},
			wantConflict: true,
		},
		{
			name:         "same task",
			first:        []string{"--project", "project1", "--task", "task1"},
			second:       []string{"--project", "project1", "--task", "task1"},
			wantConflict: true,
		},
		{
			name:   "different tasks",
			first:  []string{"--project", "project1", "--task", "task1"},
			second: []string{"--project", "project1", "--task", "task2"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			withTempCwd(t, func(root string) {
				run(t, "init")
				run(t, "project", "create", "Session project")
				run(t, "task", "create", "--project=project1", "First session task")
				run(t, "task", "create", "--project=project1", "Second session task")
				alpha := strings.TrimSpace(run(t, "session", "new"))
				beta := strings.TrimSpace(run(t, "session", "new"))
				run(t, append([]string{"session", "lock", "--id", alpha}, tt.first...)...)

				args := append([]string{"session", "lock", "--id", beta}, tt.second...)
				if !tt.wantConflict {
					run(t, args...)
					return
				}

				out, err := runErr(t, args...)
				if err == nil {
					t.Fatalf("expected same-resource session lock to fail, got stdout:\n%s", out)
				}
				if !strings.Contains(err.Error(), "control conflict") || !strings.Contains(err.Error(), alpha) {
					t.Fatalf("expected conflict error naming active session, got: %v\nstdout:\n%s", err, out)
				}
			})
		})
	}
}

func TestSessionHeartbeatExtendsSession(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "Session project")
		id := strings.TrimSpace(run(t, "session", "new", "--timeout", "1h"))
		run(t, "session", "lock", "--id", id, "--project", "project1")

		store, err := readSessionStore(root)
		if err != nil {
			t.Fatal(err)
		}
		oldTime := time.Now().Add(-time.Minute).Format(time.RFC3339)
		store.Sessions[0].UpdatedAt = oldTime
		if err := writeJSON(filepath.Join(root, sessionStateFile), store); err != nil {
			t.Fatal(err)
		}

		heartbeat := run(t, "session", "heartbeat", "--id", id)
		if !strings.Contains(heartbeat, `"id": "`+id+`"`) || strings.Contains(heartbeat, oldTime) {
			t.Fatalf("expected heartbeat to refresh timestamp, got:\n%s", heartbeat)
		}
	})
}

func TestSessionLockSelectorRulesAndWorkspaceRootNoop(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "Session project")
		run(t, "task", "create", "--project=project1", "Session task")
		id := strings.TrimSpace(run(t, "session", "new"))

		noLock := run(t, "session", "lock", "--id", id)
		if !strings.Contains(noLock, workspaceNoLockMessage) {
			t.Fatalf("expected workspace root lock to be a no-op, got:\n%s", noLock)
		}

		projectLocked := run(t, "session", "lock", "--id", id, "--project", "project1")
		if !strings.Contains(projectLocked, `"resourceId": "project1"`) {
			t.Fatalf("expected --project to lock project, got:\n%s", projectLocked)
		}
		projectUnlocked := run(t, "session", "unlock", "--id", id, "--project", "project1")
		if strings.Contains(projectUnlocked, `"resourceId": "project1"`) {
			t.Fatalf("expected --project unlock to release project, got:\n%s", projectUnlocked)
		}

		if err := os.Chdir(filepath.Join(root, "project1")); err != nil {
			t.Fatal(err)
		}
		taskLocked := run(t, "session", "lock", "--id", id, "--task", "task1")
		if !strings.Contains(taskLocked, `"resourceId": "project1.task1"`) {
			t.Fatalf("expected --task to infer current project, got:\n%s", taskLocked)
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

		startRun(t, "--project", "project1", "--", os.Args[0], "-test.run=^TestForgeStartHelper$", "--", "explicit", "args")

		got := readFile(t, output)
		want := realPath(t, filepath.Join(root, "project1")) + "\nexplicit\nargs\n"
		if got != want {
			t.Fatalf("expected explicit command to run in task dir, got:\n%s", got)
		}
	})
}

func TestStartRegistersLocksAndReleasesSession(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "Launch agent")
		output := filepath.Join(root, "session-start.out")
		t.Setenv("FORGE_START_HELPER", "1")
		t.Setenv("FORGE_START_OUTPUT", output)
		t.Setenv("FORGE_START_RECORD_SESSION", "1")
		t.Setenv("FORGE_SESSION_ID", "old-session")

		startRun(t, "--project", "project1", "--", os.Args[0], "-test.run=^TestForgeStartHelper$", "--", "session")

		got := readFile(t, output)
		if !strings.Contains(got, "session=") || strings.Contains(got, "session=old-session") {
			t.Fatalf("expected forge start helper to receive a new FORGE_SESSION_ID, got:\n%s", got)
		}
		var sessionID string
		for _, line := range strings.Split(got, "\n") {
			if strings.HasPrefix(line, "session=") {
				sessionID = strings.TrimPrefix(line, "session=")
			}
		}
		if !strings.HasPrefix(sessionID, "session-") {
			t.Fatalf("expected generated session id in helper output, got:\n%s", got)
		}
		if !strings.Contains(got, "session-liveness=pid:") {
			t.Fatalf("expected forge start session to use PID liveness while running, got:\n%s", got)
		}
		if !strings.Contains(got, "session-controls=project1:project1\n") {
			t.Fatalf("expected forge start session to lock selected project while running, got:\n%s", got)
		}

		store, err := readSessionStore(root)
		if err != nil {
			t.Fatal(err)
		}
		if findSessionIndex(store.Sessions, sessionID) >= 0 {
			t.Fatalf("expected forge start session to be released after command exits, got: %#v", store.Sessions)
		}
	})
}

func TestStartInjectsCodexShellEnvironmentPolicy(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "Codex launch")
		output := filepath.Join(root, "codex-start.out")
		binDir := filepath.Join(root, "bin")
		if err := os.MkdirAll(binDir, 0o755); err != nil {
			t.Fatal(err)
		}
		codexPath := filepath.Join(binDir, "codex")
		script := `#!/bin/sh
{
  printf 'env=%s\n' "$FORGE_SESSION_ID"
  i=0
  for arg in "$@"; do
    printf 'arg%d=%s\n' "$i" "$arg"
    i=$((i + 1))
  done
} > "$FORGE_START_OUTPUT"
`
		if err := os.WriteFile(codexPath, []byte(script), 0o755); err != nil {
			t.Fatal(err)
		}
		t.Setenv("FORGE_START_OUTPUT", output)

		startRun(t, "--project", "project1", "--", codexPath, "--dangerously-bypass-approvals-and-sandbox")

		got := readFile(t, output)
		var sessionID string
		for _, line := range strings.Split(got, "\n") {
			if strings.HasPrefix(line, "env=") {
				sessionID = strings.TrimPrefix(line, "env=")
			}
		}
		if !strings.HasPrefix(sessionID, "session-") {
			t.Fatalf("expected fake codex to receive FORGE_SESSION_ID, got:\n%s", got)
		}
		expectedConfig := "arg1=shell_environment_policy.set.FORGE_SESSION_ID=" + strconv.Quote(sessionID)
		for _, want := range []string{
			"arg0=-c",
			expectedConfig,
			"arg2=--dangerously-bypass-approvals-and-sandbox",
		} {
			if !strings.Contains(got, want+"\n") {
				t.Fatalf("expected fake codex args to contain %q, got:\n%s", want, got)
			}
		}
	})
}

func TestStartResolvesNestedTaskID(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "Parent project")
		run(t, "task", "create", "--project=project1", "Child task")
		output := filepath.Join(root, "nested.out")
		t.Setenv("FORGE_START_HELPER", "1")
		t.Setenv("FORGE_START_OUTPUT", output)

		startRun(t, "--project", "project1", "--task", "task1", "--", os.Args[0], "-test.run=^TestForgeStartHelper$", "--", "nested")

		got := readFile(t, output)
		want := realPath(t, filepath.Join(root, "project1", "task1")) + "\nnested\n"
		if got != want {
			t.Fatalf("expected nested command to run in subtask dir, got:\n%s", got)
		}
	})
}

func TestStartInfersCurrentProjectTaskAndTaskSelector(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "Parent project")
		run(t, "task", "create", "--project=project1", "Child task")

		projectOutput := filepath.Join(root, "project-infer.out")
		t.Setenv("FORGE_START_HELPER", "1")
		t.Setenv("FORGE_START_OUTPUT", projectOutput)
		if err := os.Chdir(filepath.Join(root, "project1")); err != nil {
			t.Fatal(err)
		}
		startRun(t, "--", os.Args[0], "-test.run=^TestForgeStartHelper$", "--", "project-infer")
		if got, want := readFile(t, projectOutput), realPath(t, filepath.Join(root, "project1"))+"\nproject-infer\n"; got != want {
			t.Fatalf("expected forge start to infer current project, got:\n%s", got)
		}

		taskSelectorOutput := filepath.Join(root, "task-selector.out")
		t.Setenv("FORGE_START_OUTPUT", taskSelectorOutput)
		startRun(t, "--task", "task1", "--", os.Args[0], "-test.run=^TestForgeStartHelper$", "--", "task-selector")
		if got, want := readFile(t, taskSelectorOutput), realPath(t, filepath.Join(root, "project1", "task1"))+"\ntask-selector\n"; got != want {
			t.Fatalf("expected --task to infer current project, got:\n%s", got)
		}

		taskOutput := filepath.Join(root, "task-infer.out")
		t.Setenv("FORGE_START_OUTPUT", taskOutput)
		if err := os.Chdir(filepath.Join(root, "project1", "task1")); err != nil {
			t.Fatal(err)
		}
		startRun(t, "--", os.Args[0], "-test.run=^TestForgeStartHelper$", "--", "task-infer")
		if got, want := readFile(t, taskOutput), realPath(t, filepath.Join(root, "project1", "task1"))+"\ntask-infer\n"; got != want {
			t.Fatalf("expected forge start to infer current task, got:\n%s", got)
		}
	})
}

func TestStartRequiresSelectorOutsideProjectOrTask(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "Parent project")

		out, err := startErr(t, "--", os.Args[0], "-test.run=^TestForgeStartHelper$", "--", "root")
		if err == nil {
			t.Fatalf("expected forge start without selector at workspace root to fail, got stdout:\n%s", out)
		}
		if !strings.Contains(err.Error(), "could not infer current project or task") || !strings.Contains(err.Error(), "--project=<project>") {
			t.Fatalf("expected clear selector inference error, got: %v\nstdout:\n%s", err, out)
		}

		out, err = startErr(t, "project1", "--", os.Args[0], "-test.run=^TestForgeStartHelper$", "--", "legacy")
		if err == nil {
			t.Fatalf("expected legacy positional start to fail, got stdout:\n%s", out)
		}
		if !strings.Contains(err.Error(), "usage: forge start [--project=<project>] [--task=<task>]") {
			t.Fatalf("expected selector usage for legacy positional start, got: %v\nstdout:\n%s", err, out)
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

		startRun(t, "--project", "project1")

		got := readFile(t, output)
		want := realPath(t, filepath.Join(root, "project1")) + "\nconfigured\n"
		if got != want {
			t.Fatalf("expected configured default command, got:\n%s", got)
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

		startRun(t, "--project", "project1", "--", os.Args[0], "-test.run=^TestForgeStartHelper$", "--", "explicit")

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

		out, err := startErr(t, "--project", "project1")
		if err == nil {
			t.Fatalf("expected forge start to fail without command, got stdout:\n%s", out)
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
		t.Setenv("FORGE_START_RECORD_SESSION", "1")
		t.Setenv("FORGE_START_EXIT", "7")

		out, err := startErr(t, "--project", "project1", "--", os.Args[0], "-test.run=^TestForgeStartHelper$", "--", "exit")
		if err == nil {
			t.Fatalf("expected child exit to fail, got stdout:\n%s", out)
		}
		exitErr, ok := err.(interface{ ExitCode() int })
		if !ok || exitErr.ExitCode() != 7 {
			t.Fatalf("expected exit code 7, got %T %v\nstdout:\n%s", err, err, out)
		}
		got := readFile(t, output)
		var sessionID string
		for _, line := range strings.Split(got, "\n") {
			if strings.HasPrefix(line, "session=") {
				sessionID = strings.TrimPrefix(line, "session=")
			}
		}
		if sessionID == "" {
			t.Fatalf("expected helper to record session id, got:\n%s", got)
		}
		store, err := readSessionStore(root)
		if err != nil {
			t.Fatal(err)
		}
		if findSessionIndex(store.Sessions, sessionID) >= 0 {
			t.Fatalf("expected forge start session to be released after child exit, got: %#v", store.Sessions)
		}
	})
}

func TestInitRejectsExistingWorkspaceChild(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		child := filepath.Join(root, "nested")
		if err := os.MkdirAll(child, 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.Chdir(child); err != nil {
			t.Fatal(err)
		}

		out, err := runErr(t, "init")
		if err == nil {
			t.Fatalf("expected init inside existing workspace to fail, got stdout:\n%s", out)
		}
		if !strings.Contains(err.Error(), "cannot initialize workspace inside existing workspace") {
			t.Fatalf("expected existing workspace init error, got: %v\nstdout:\n%s", err, out)
		}
	})
}

func TestTaskArchiveAllowsMergedRepoWorktree(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "Archive after merge")
		run(t, "task", "create", "--project=project1", "Code task")
		repoPath := filepath.Join(root, reposDir, "disksing", "forge")
		writeGitRepo(t, repoPath, "master")
		worktreePath := filepath.Join(root, "project1", "task1", "worktree", "forge")
		runGit(t, repoPath, "worktree", "add", "-b", "agent/project1.task1", worktreePath, "master")
		run(t, "task", "repo", "add", "--project=project1", "--task=task1", "disksing/forge", "--worktree", "project1/task1/worktree/forge", "--branch", "agent/project1.task1", "--target", "master")

		archived := run(t, "task", "archive", "--project=project1", "--task=task1")
		if !strings.Contains(archived, "project1/archive/task1") {
			t.Fatalf("expected archive path, got:\n%s", archived)
		}
		assertDir(t, filepath.Join(root, "project1", archiveDir, "task1"))
		var archivedTask Task
		if err := readJSON(filepath.Join(root, "project1", archiveDir, "task1", "task.json"), &archivedTask); err != nil {
			t.Fatal(err)
		}
		if got := archivedTask.Repos[0].WorktreePath; got != "project1/archive/task1/worktree/forge" {
			t.Fatalf("expected archived task worktree path to update, got %q", got)
		}
	})
}

func TestTaskArchiveRejectsUnmergedRepoWorktree(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "Archive before merge")
		run(t, "task", "create", "--project=project1", "Code task")
		repoPath := filepath.Join(root, reposDir, "disksing", "forge")
		writeGitRepo(t, repoPath, "master")
		worktreePath := filepath.Join(root, "project1", "task1", "worktree", "forge")
		runGit(t, repoPath, "worktree", "add", "-b", "agent/project1.task1", worktreePath, "master")
		if err := os.WriteFile(filepath.Join(worktreePath, "feature.txt"), []byte("feature\n"), 0o644); err != nil {
			t.Fatal(err)
		}
		runGit(t, worktreePath, "add", "feature.txt")
		runGit(t, worktreePath, "-c", "user.name=Forge Test", "-c", "user.email=forge@example.com", "commit", "-m", "feature work")
		run(t, "task", "repo", "add", "--project=project1", "--task=task1", "disksing/forge", "--worktree", "project1/task1/worktree/forge", "--branch", "agent/project1.task1", "--target", "master")

		out, err := runErr(t, "task", "archive", "--project=project1", "--task=task1")
		if err == nil {
			t.Fatalf("expected archive to fail, got stdout:\n%s", out)
		}
		if !strings.Contains(err.Error(), `repo "disksing/forge"`) || !strings.Contains(err.Error(), `not merged into target branch "master"`) || !strings.Contains(err.Error(), "feature work") {
			t.Fatalf("expected clear unmerged commits error, got: %v\nstdout:\n%s", err, out)
		}
		assertDir(t, filepath.Join(root, "project1", "task1"))
		if pathExists(filepath.Join(root, "project1", archiveDir, "task1")) {
			t.Fatal("project1.task1 should not have been archived")
		}
	})
}

func TestTaskArchiveAllowsMissingRepoWorktree(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "Archive without a checkout")
		run(t, "task", "create", "--project=project1", "Code task")
		writeFakeRepo(t, filepath.Join(root, reposDir, "disksing", "forge"))
		run(t, "task", "repo", "add", "--project=project1", "--task=task1", "disksing/forge", "--worktree", "project1/task1/worktree/forge", "--branch", "agent/project1.task1", "--target", "master")

		archived := run(t, "task", "archive", "--project=project1", "--task=task1")
		if !strings.Contains(archived, "project1/archive/task1") {
			t.Fatalf("expected archive path, got:\n%s", archived)
		}
		assertDir(t, filepath.Join(root, "project1", archiveDir, "task1"))
	})
}

func TestTaskArchiveEndsOpenTaskSessions(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "Session project")
		run(t, "task", "create", "--project=project1", "Session task")
		id := strings.TrimSpace(run(t, "session", "new"))
		run(t, "session", "lock", "--id", id, "--project=project1", "--task=task1")

		archived := run(t, "task", "archive", "--project=project1", "--task=task1")
		if !strings.Contains(archived, "project1/archive/task1") {
			t.Fatalf("expected archive path, got:\n%s", archived)
		}

		store, err := readSessionStore(root)
		if err != nil {
			t.Fatal(err)
		}
		if findSessionIndex(store.Sessions, id) >= 0 {
			t.Fatalf("expected archive to end task session, got: %#v", store.Sessions)
		}
	})
}

func TestTaskArchivePreservesSessionWhosePrimaryIsParentProject(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "Primary project")
		run(t, "task", "create", "--project=project1", "Archived child")
		id := strings.TrimSpace(run(t, "session", "new"))
		run(t, "session", "lock", "--id", id, "--project=project1")

		run(t, "task", "archive", "--project=project1", "--task=task1")

		store, err := readSessionStore(root)
		if err != nil {
			t.Fatal(err)
		}
		index := findSessionIndex(store.Sessions, id)
		if index < 0 {
			t.Fatal("archiving a child task should preserve its parent project session")
		}
		session := store.Sessions[index]
		if session.Primary == nil || session.Primary.ResourceID != "project1" {
			t.Fatalf("expected project1 to remain the primary control, got: %#v", session.Primary)
		}
		if got := formatSessionControls(session.Controls); got != "project1:project1" {
			t.Fatalf("expected the project control to remain, got: %s", got)
		}
	})
}

func TestTaskArchivePreservesSessionControllingAnotherPrimaryResource(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "Archive target")
		run(t, "task", "create", "--project=project1", "Temporary task")
		run(t, "project", "create", "Primary project")
		id := strings.TrimSpace(run(t, "session", "new"))
		run(t, "session", "lock", "--id", id, "--project=project2")
		run(t, "session", "lock", "--id", id, "--project=project1")
		run(t, "session", "lock", "--id", id, "--project=project1", "--task=task1")

		archived := run(t, "task", "archive", "--project=project1", "--task=task1")
		if !strings.Contains(archived, "project1/archive/task1") {
			t.Fatalf("expected archive path, got:\n%s", archived)
		}

		store, err := readSessionStore(root)
		if err != nil {
			t.Fatal(err)
		}
		index := findSessionIndex(store.Sessions, id)
		if index < 0 {
			t.Fatal("archiving a temporary task should preserve the session")
		}
		session := store.Sessions[index]
		if session.Primary == nil || session.Primary.ResourceID != "project2" {
			t.Fatalf("expected project2 to remain the primary control, got: %#v", session.Primary)
		}
		if got := formatSessionControls(session.Controls); got != "project1:project1,project2:project2" {
			t.Fatalf("expected only the archived task control to be removed, got: %s", got)
		}

		archived = run(t, "project", "archive", "--project=project1")
		if !strings.Contains(archived, "archive/project1") {
			t.Fatalf("expected project archive path, got:\n%s", archived)
		}
		store, err = readSessionStore(root)
		if err != nil {
			t.Fatal(err)
		}
		index = findSessionIndex(store.Sessions, id)
		if index < 0 {
			t.Fatal("archiving a temporary project should preserve the session")
		}
		session = store.Sessions[index]
		if got := formatSessionControls(session.Controls); got != "project2:project2" {
			t.Fatalf("expected the archived project control to be removed, got: %s", got)
		}
	})
}

func TestProjectArchiveEndsSessionWhosePrimaryResourceIsArchived(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "Primary project")
		run(t, "project", "create", "Temporary project")
		id := strings.TrimSpace(run(t, "session", "new"))
		run(t, "session", "lock", "--id", id, "--project=project1")
		run(t, "session", "lock", "--id", id, "--project=project2")

		run(t, "project", "archive", "--project=project1")
		store, err := readSessionStore(root)
		if err != nil {
			t.Fatal(err)
		}
		if findSessionIndex(store.Sessions, id) >= 0 {
			t.Fatalf("expected archive of the primary resource to end the session, got: %#v", store.Sessions)
		}
	})
}

func TestTaskArchiveEndsAmbiguousSessionWithoutPrimary(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "Archive target")
		run(t, "task", "create", "--project=project1", "Temporary task")
		run(t, "project", "create", "Other project")
		id := strings.TrimSpace(run(t, "session", "new"))
		run(t, "session", "lock", "--id", id, "--project=project2")
		run(t, "session", "lock", "--id", id, "--project=project1", "--task=task1")

		store, err := readSessionStore(root)
		if err != nil {
			t.Fatal(err)
		}
		index := findSessionIndex(store.Sessions, id)
		if index < 0 {
			t.Fatal("expected session to exist")
		}
		store.Sessions[index].Primary = nil
		if err := writeSessionStore(root, store); err != nil {
			t.Fatal(err)
		}

		run(t, "task", "archive", "--project=project1", "--task=task1")
		store, err = readSessionStore(root)
		if err != nil {
			t.Fatal(err)
		}
		if findSessionIndex(store.Sessions, id) >= 0 {
			t.Fatalf("expected archive to end an ambiguous session, got: %#v", store.Sessions)
		}
	})
}

func TestProjectArchiveEndsOpenProjectSessions(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "Session project")
		id := strings.TrimSpace(run(t, "session", "new"))
		run(t, "session", "lock", "--id", id, "--project=project1")

		archived := run(t, "project", "archive", "--project=project1")
		if !strings.Contains(archived, "archive/project1") {
			t.Fatalf("expected archive path, got:\n%s", archived)
		}

		store, err := readSessionStore(root)
		if err != nil {
			t.Fatal(err)
		}
		if findSessionIndex(store.Sessions, id) >= 0 {
			t.Fatalf("expected archive to end project session, got: %#v", store.Sessions)
		}
	})
}

func TestTaskArchiveSubtaskMovesToParentArchive(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "Parent project")
		run(t, "task", "create", "--project=project1", "Child task")

		archived := run(t, "task", "archive", "--project=project1", "--task=task1")
		if !strings.Contains(archived, "project1/archive/task1") {
			t.Fatalf("expected parent-local archive path, got:\n%s", archived)
		}
		assertDir(t, filepath.Join(root, "project1", archiveDir, "task1"))
		if pathExists(filepath.Join(root, archiveDir, "project1.task1")) {
			t.Fatal("subtask should not have moved to the workspace archive")
		}
		if pathExists(filepath.Join(root, "project1", "task1")) {
			t.Fatal("subtask should have moved out of the parent task's open subtasks")
		}

		children := run(t, "task", "list", "--project=project1")
		if strings.Contains(children, "task1\tChild task") {
			t.Fatalf("archived subtask should not be listed as open, got:\n%s", children)
		}
		allChildren := run(t, "task", "list", "--project=project1", "--all")
		if !strings.Contains(allChildren, "task1\tChild task") {
			t.Fatalf("expected subtask list --all to include archived subtask, got:\n%s", allChildren)
		}

		next := run(t, "task", "create", "--project=project1", "Next child")
		if !strings.Contains(next, `"id": "project1.task2"`) {
			t.Fatalf("expected archived subtask ids not to be reused, got:\n%s", next)
		}
	})
}

func TestResourceArchiveDispatchesByStoredType(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "Project")
		run(t, "task", "create", "--project=project1", "Task")

		taskOut := run(t, "resource", "archive", "--id=project1.task1")
		if !strings.Contains(taskOut, "project1/archive/task1") {
			t.Fatalf("unexpected task archive path: %s", taskOut)
		}
		projectOut := run(t, "resource", "archive", "--id=project1")
		if !strings.Contains(projectOut, "archive/project1") {
			t.Fatalf("unexpected project archive path: %s", projectOut)
		}
		assertDir(t, filepath.Join(root, archiveDir, "project1"))
	})
}

func TestTaskArchiveRejectsLegacyPositionalID(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")

		out, err := runErr(t, "task", "archive", "task1.1")
		if err == nil {
			t.Fatalf("expected positional task id to be rejected, got stdout:\n%s", out)
		}
		if !strings.Contains(err.Error(), taskArchiveUsage) {
			t.Fatalf("expected task archive usage error, got: %v\nstdout:\n%s", err, out)
		}
	})
}

func TestProjectListOnlyIncludesProjects(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "Parent project")
		run(t, "task", "create", "--project=project1", "First child")
		run(t, "task", "create", "--project=project1", "Second child")
		run(t, "project", "create", "Other project")

		listed := run(t, "project", "list")
		if strings.Contains(listed, "project1.task1\tFirst child") {
			t.Fatalf("default project list should not include tasks, got:\n%s", listed)
		}
		if !strings.Contains(listed, "project1\tParent project") || !strings.Contains(listed, "project2\tOther project") {
			t.Fatalf("expected project list to include open projects, got:\n%s", listed)
		}

		children := run(t, "task", "list", "--project=project1")
		if !strings.Contains(children, "task1\tFirst child") || !strings.Contains(children, "task2\tSecond child") {
			t.Fatalf("expected task list to include project tasks, got:\n%s", children)
		}

		out, err := runErr(t, "project", "list", "--tree")
		if err == nil {
			t.Fatalf("expected --tree to be rejected, got stdout:\n%s", out)
		}
		if !strings.Contains(err.Error(), "usage: forge project list [--all]") {
			t.Fatalf("expected project list usage error, got: %v\nstdout:\n%s", err, out)
		}
	})
}

func TestTaskCreateRejectsNestedTasks(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "Parent project")
		run(t, "task", "create", "--project=project1", "Child task")

		out, err := runErr(t, "task", "create", "--project=project1.task1", "Nested task")
		if err == nil {
			t.Fatalf("expected nested task creation to fail, got stdout:\n%s", out)
		}
		if !strings.Contains(err.Error(), "invalid project") {
			t.Fatalf("expected invalid project error, got: %v\nstdout:\n%s", err, out)
		}
	})
}

func TestSubtaskCommandRemoved(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")

		out, err := runErr(t, "subtask", "list", "project1")
		if err == nil {
			t.Fatalf("expected subtask command to fail, got stdout:\n%s", out)
		}
		if !strings.Contains(err.Error(), `unknown command "subtask"`) {
			t.Fatalf("expected unknown command error, got: %v\nstdout:\n%s", err, out)
		}
	})
}

func TestMigrateRejectsProjectTasksArgument(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")

		out, err := runErr(t, "migrate", "project-tasks")
		if err == nil {
			t.Fatalf("expected migrate project-tasks to fail, got stdout:\n%s", out)
		}
		if !strings.Contains(err.Error(), "usage: forge migrate") {
			t.Fatalf("expected migrate usage error, got: %v\nstdout:\n%s", err, out)
		}
	})
}

func TestProjectListAllIncludesArchivedProjectsOnly(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "Parent project")
		run(t, "task", "create", "--project=project1", "Archived child")
		run(t, "task", "create", "--project=project1", "Open child")
		run(t, "task", "archive", "--project=project1", "--task=task1")

		openProjects := run(t, "project", "list")
		if strings.Contains(openProjects, "project1.task1") {
			t.Fatalf("project list should not include tasks, got:\n%s", openProjects)
		}

		allTasks := run(t, "task", "list", "--project=project1", "--all")
		if !strings.Contains(allTasks, "task1\tArchived child") || !strings.Contains(allTasks, "task2\tOpen child") {
			t.Fatalf("task list --all should include archived and open tasks, got:\n%s", allTasks)
		}

		out, err := runErr(t, "project", "archive", "--project=project1")
		if err == nil {
			t.Fatalf("expected project archive with open tasks to fail, got stdout:\n%s", out)
		}
		if !strings.Contains(err.Error(), "archive all project tasks first: task2") {
			t.Fatalf("expected open child task in archive error, got error %v and stdout:\n%s", err, out)
		}
		assertDir(t, filepath.Join(root, "project1"))

		run(t, "task", "archive", "--project=project1", "--task=task2")
		run(t, "project", "archive", "--project=project1")
		openProjects = run(t, "project", "list")
		if strings.Contains(openProjects, "project1\tParent project") {
			t.Fatalf("archived project should not be listed by default, got:\n%s", openProjects)
		}
		allProjects := run(t, "project", "list", "--all")
		if !strings.Contains(allProjects, "project1\tParent project") || strings.Contains(allProjects, "project1.task") {
			t.Fatalf("project list --all should include archived projects but not tasks, got:\n%s", allProjects)
		}
	})
}

func TestProjectAndTaskFlagSelection(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "Flag project")
		run(t, "task", "create", "--project=1", "First task")
		run(t, "task", "create", "--project=project1", "Second task")

		projectByNumber := run(t, "project", "show", "--project=1")
		if !strings.Contains(projectByNumber, `"id": "project1"`) {
			t.Fatalf("expected numeric project selector to show project1, got:\n%s", projectByNumber)
		}

		taskByNumber := run(t, "task", "show", "--project=1", "--task=2")
		if !strings.Contains(taskByNumber, `"id": "project1.task2"`) {
			t.Fatalf("expected numeric task selector to show project1.task2, got:\n%s", taskByNumber)
		}
		taskByShortID := run(t, "task", "show", "--project=project1", "--task=task1")
		if !strings.Contains(taskByShortID, `"id": "project1.task1"`) {
			t.Fatalf("expected short task selector to show project1.task1, got:\n%s", taskByShortID)
		}
		out, err := runErr(t, "task", "show", "--task=project1.task1")
		if err == nil {
			t.Fatalf("expected full task id to be rejected as --task value, got stdout:\n%s", out)
		}
		if !strings.Contains(err.Error(), "invalid task") {
			t.Fatalf("expected invalid task error, got: %v\nstdout:\n%s", err, out)
		}

		if err := os.Chdir(filepath.Join(root, "project1", "task1")); err != nil {
			t.Fatal(err)
		}
		projectFromCwd := run(t, "project", "show")
		if !strings.Contains(projectFromCwd, `"id": "project1"`) {
			t.Fatalf("expected project show to infer project from cwd, got:\n%s", projectFromCwd)
		}
		taskFromCwd := run(t, "task", "show")
		if !strings.Contains(taskFromCwd, `"id": "project1.task1"`) {
			t.Fatalf("expected task show to infer task from cwd, got:\n%s", taskFromCwd)
		}
		listFromCwd := run(t, "task", "list")
		if !strings.Contains(listFromCwd, "task1\tFirst task") || !strings.Contains(listFromCwd, "task2\tSecond task") {
			t.Fatalf("expected task list to infer project from cwd, got:\n%s", listFromCwd)
		}
		createdFromCwd := run(t, "task", "create", "Third task")
		if !strings.Contains(createdFromCwd, `"id": "project1.task3"`) {
			t.Fatalf("expected task create to infer project from cwd, got:\n%s", createdFromCwd)
		}
		if err := os.Chdir(root); err != nil {
			t.Fatal(err)
		}

		archived := run(t, "task", "archive", "--project=1", "--task=2")
		if !strings.Contains(archived, "project1/archive/task2") {
			t.Fatalf("expected task archive to accept numeric project/task selectors, got:\n%s", archived)
		}
		run(t, "task", "archive", "--project=1", "--task=1")
		run(t, "task", "archive", "--project=1", "--task=3")
		projectArchive := run(t, "project", "archive", "--project=1")
		if !strings.Contains(projectArchive, "archive/project1") {
			t.Fatalf("expected project archive to accept numeric project selector, got:\n%s", projectArchive)
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
			run(t, "task", "create", "--project=project1", description)
		}
		for _, id := range []string{"1", "2", "3"} {
			run(t, "task", "archive", "--project=project1", "--task="+id)
		}
		assertDir(t, filepath.Join(root, "project1", archiveDir, "task1"))
		assertDir(t, filepath.Join(root, "project1", archiveDir, "task2"))
		assertDir(t, filepath.Join(root, "project1", archiveDir, "task3"))
		assertDir(t, filepath.Join(root, "project1", "task4"))
		assertDir(t, filepath.Join(root, "project1", "task5"))

		next := run(t, "task", "create", "--project=project1", "Next child")
		if !strings.Contains(next, `"id": "project1.task6"`) {
			t.Fatalf("expected archived and open subtask ids not to be reused, got:\n%s", next)
		}
		assertDir(t, filepath.Join(root, "project1", "task6"))
	})
}

func TestTaskArchiveRejectsUnmergedSubtaskRepoWorktree(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "Parent project")
		run(t, "task", "create", "--project=project1", "Child task")
		repoPath := filepath.Join(root, reposDir, "disksing", "forge")
		writeGitRepo(t, repoPath, "master")
		worktreePath := filepath.Join(root, "project1", "task1", "worktree", "forge")
		runGit(t, repoPath, "worktree", "add", "-b", "agent/project1.task1", worktreePath, "master")
		if err := os.WriteFile(filepath.Join(worktreePath, "feature.txt"), []byte("feature\n"), 0o644); err != nil {
			t.Fatal(err)
		}
		runGit(t, worktreePath, "add", "feature.txt")
		runGit(t, worktreePath, "-c", "user.name=Forge Test", "-c", "user.email=forge@example.com", "commit", "-m", "child feature work")
		run(t, "task", "repo", "add", "--project=project1", "--task=task1", "disksing/forge", "--worktree", "project1/task1/worktree/forge", "--branch", "agent/project1.task1", "--target", "master")

		out, err := runErr(t, "task", "archive", "--project=project1", "--task=task1")
		if err == nil {
			t.Fatalf("expected archive to fail, got stdout:\n%s", out)
		}
		if !strings.Contains(err.Error(), `repo "disksing/forge"`) || !strings.Contains(err.Error(), `not merged into target branch "master"`) || !strings.Contains(err.Error(), "child feature work") {
			t.Fatalf("expected clear unmerged commits error, got: %v\nstdout:\n%s", err, out)
		}
		assertDir(t, filepath.Join(root, "project1", "task1"))
		if pathExists(filepath.Join(root, "project1", archiveDir, "task1")) {
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
		run(t, "task", "create", "--project=project1", "Code task")
		writeFakeRepo(t, filepath.Join(root, reposDir, "disksing", "forge"))

		out, err := runErr(t, "project", "repo", "add", "project1", "disksing/forge")
		if err == nil {
			t.Fatalf("expected project repo command to fail, got stdout:\n%s", out)
		}
		if !strings.Contains(err.Error(), "projects do not manage repositories or worktrees") {
			t.Fatalf("expected project repo rejection, got: %v\nstdout:\n%s", err, out)
		}

		out, err = runErr(t, "task", "repo", "add", "disksing/forge")
		if err == nil {
			t.Fatalf("expected task repo add without task context to fail, got stdout:\n%s", out)
		}
		if !strings.Contains(err.Error(), "could not infer current task") {
			t.Fatalf("expected missing task context error, got: %v\nstdout:\n%s", err, out)
		}

		added := run(t, "task", "repo", "add", "--project=project1", "--task=task1", "disksing/forge", "--branch", "agent/project1.task1", "--target", "master", "--base", "master")
		if !strings.Contains(added, `"name": "disksing/forge"`) {
			t.Fatalf("expected task JSON to include repo, got:\n%s", added)
		}
		if !strings.Contains(added, `"repoPath": "repos/disksing/forge"`) {
			t.Fatalf("expected task JSON to include repo path, got:\n%s", added)
		}
		if !strings.Contains(added, `"worktreePath": "project1/task1/worktree/forge"`) {
			t.Fatalf("expected default worktree path, got:\n%s", added)
		}

		listed := run(t, "task", "repo", "list", "--project=project1", "--task=task1")
		if !strings.Contains(listed, "disksing/forge\trepos/disksing/forge\tproject1/task1/worktree/forge\tagent/project1.task1\tmaster\tmaster") {
			t.Fatalf("expected repo list to include metadata, got:\n%s", listed)
		}

		if err := os.Chdir(filepath.Join(root, "project1", "task1")); err != nil {
			t.Fatal(err)
		}
		inferredList := run(t, "task", "repo", "list")
		if !strings.Contains(inferredList, "disksing/forge\trepos/disksing/forge\tproject1/task1/worktree/forge\tagent/project1.task1\tmaster\tmaster") {
			t.Fatalf("expected repo list to infer current task, got:\n%s", inferredList)
		}
		if err := os.Chdir(root); err != nil {
			t.Fatal(err)
		}

		updated := run(t, "task", "repo", "add", "--project=project1", "--task=task1", "disksing/forge", "--worktree", "project1/task1/worktree/custom", "--branch", "agent/updated", "--target", "main")
		if strings.Count(updated, `"name": "disksing/forge"`) != 1 {
			t.Fatalf("expected repo add to update existing entry, got:\n%s", updated)
		}
		if !strings.Contains(updated, `"worktreePath": "project1/task1/worktree/custom"`) {
			t.Fatalf("expected updated worktree path, got:\n%s", updated)
		}
		if !strings.Contains(updated, `"branch": "agent/updated"`) {
			t.Fatalf("expected updated branch, got:\n%s", updated)
		}

		removed := run(t, "task", "repo", "remove", "--project=project1", "--task=task1", "disksing/forge")
		if strings.Contains(removed, `"name": "disksing/forge"`) {
			t.Fatalf("expected repo to be removed, got:\n%s", removed)
		}
	})
}

func TestTaskRepoLifecycleSupportsLegacyBareRepos(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "Wire legacy bare repo metadata into task json")
		run(t, "task", "create", "--project=project1", "Code task")
		writeFakeBareRepo(t, filepath.Join(root, reposDir, "disksing", "forge.git"), "master")

		added := run(t, "task", "repo", "add", "--project=project1", "--task=task1", "disksing/forge", "--branch", "agent/project1.task1")
		if !strings.Contains(added, `"barePath": "repos/disksing/forge.git"`) {
			t.Fatalf("expected task JSON to include legacy bare path, got:\n%s", added)
		}
		if strings.Contains(added, `"repoPath"`) {
			t.Fatalf("legacy bare repo should not also set repoPath, got:\n%s", added)
		}
		listed := run(t, "task", "repo", "list", "--project=project1", "--task=task1")
		if !strings.Contains(listed, "disksing/forge\trepos/disksing/forge.git\tproject1/task1/worktree/forge\tagent/project1.task1\tmaster") {
			t.Fatalf("expected legacy bare repo metadata, got:\n%s", listed)
		}
	})
}

func TestMigrateUpdatesOnlyManagedAgentsBlock(t *testing.T) {
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
		if !strings.Contains(first, "Treat task `work.md` as a replaceable recovery checkpoint.") {
			t.Fatalf("expected workspace AGENTS.md to describe work.md as a replaceable checkpoint, got:\n%s", first)
		}
		if !strings.Contains(first, "Treat `project.md` and `task.md` as durable contracts.") {
			t.Fatalf("expected workspace AGENTS.md to describe markdown contracts, got:\n%s", first)
		}
		if !strings.Contains(first, "optional `work.md` modules such as `Todo`, `Blockers`, `Active Work`, `Paused Work`, `Resume Plan`, `Context`, `Resources`, `Verification`, and `Notes`") {
			t.Fatalf("expected workspace AGENTS.md to describe optional work.md modules, got:\n%s", first)
		}
		if !strings.Contains(first, "keep arbitrary links or external ids in `Resources`") {
			t.Fatalf("expected workspace AGENTS.md to keep arbitrary resources in Markdown, got:\n%s", first)
		}
		if !strings.Contains(first, "Treat `log.jsonl` as the append-only timeline.") || !strings.Contains(first, "keep current state out of the log and history out of `work.md`") {
			t.Fatalf("expected workspace AGENTS.md to distinguish timeline from current state, got:\n%s", first)
		}
		if !strings.Contains(first, "forge task create --autorun") || !strings.Contains(first, "forge task autorun suspend") {
			t.Fatalf("expected workspace AGENTS.md to teach AutoRun delegation, got:\n%s", first)
		}
		for _, want := range []string{"read `wiki/index.md`", "read only the Wiki pages relevant to the current task", "maintain the relevant pages, cross-links, and `wiki/index.md` summaries"} {
			if !strings.Contains(first, want) {
				t.Fatalf("expected workspace AGENTS.md to include Wiki guidance %q, got:\n%s", want, first)
			}
		}
		if strings.Count(first, forgePromptStart) != 1 || strings.Count(first, forgePromptEnd) != 1 {
			t.Fatalf("expected one forge managed block, got:\n%s", first)
		}

		replaced := strings.Replace(first, "This directory is an AgentWorkspace managed by forge.", "old prompt text", 1)
		if err := os.WriteFile(agentsPath, []byte(replaced), 0o644); err != nil {
			t.Fatal(err)
		}
		run(t, "migrate")
		second := readFile(t, agentsPath)
		if strings.Contains(second, "old prompt text") {
			t.Fatalf("expected managed block to be replaced, got:\n%s", second)
		}
		if !strings.Contains(second, "Keep this line.") {
			t.Fatalf("expected human content to survive replacement, got:\n%s", second)
		}
		if strings.Count(second, forgePromptStart) != 1 || strings.Count(second, forgePromptEnd) != 1 {
			t.Fatalf("expected migrate to avoid duplicate managed blocks, got:\n%s", second)
		}
	})
}

func TestWorkspaceWikiInitMigrateAndSnapshot(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		indexPath := filepath.Join(root, wikiDir, "index.md")
		if got := readFile(t, indexPath); got != defaultWikiIndex {
			t.Fatalf("unexpected default Wiki index:\n%s", got)
		}

		customIndex := "# Team Wiki\n\n- [Architecture](architecture.md)\n"
		if err := os.WriteFile(indexPath, []byte(customIndex), 0o644); err != nil {
			t.Fatal(err)
		}
		guideDir := filepath.Join(root, wikiDir, "guides", "operations")
		if err := os.MkdirAll(guideDir, 0o755); err != nil {
			t.Fatal(err)
		}
		guidePath := filepath.Join(guideDir, "deploy.txt")
		if err := os.WriteFile(guidePath, []byte("deploy safely\n"), 0o644); err != nil {
			t.Fatal(err)
		}
		run(t, "migrate")
		if got := readFile(t, indexPath); got != customIndex {
			t.Fatalf("migrate rewrote the custom Wiki index:\n%s", got)
		}
		if got := readFile(t, guidePath); got != "deploy safely\n" {
			t.Fatalf("migrate rewrote a custom Wiki page: %q", got)
		}

		tree, err := buildWorkspaceTree()
		if err != nil {
			t.Fatal(err)
		}
		if !tree.Wiki.Exists || tree.Wiki.Error != "" || len(tree.Wiki.Entries) != 2 {
			t.Fatalf("unexpected Wiki snapshot: %+v", tree.Wiki)
		}
		if tree.Wiki.Entries[0].Name != "guides" || tree.Wiki.Entries[0].Path != "guides" || tree.Wiki.Entries[0].Type != "directory" {
			t.Fatalf("unexpected nested Wiki root entry: %+v", tree.Wiki.Entries[0])
		}
		operations := tree.Wiki.Entries[0].Children[0]
		if operations.Path != "guides/operations" || len(operations.Children) != 1 || operations.Children[0].Path != "guides/operations/deploy.txt" || operations.Children[0].Modified == "" {
			t.Fatalf("unexpected nested Wiki tree: %+v", tree.Wiki.Entries[0])
		}
		originalSize := operations.Children[0].Size
		if err := os.WriteFile(guidePath, []byte("deploy safely with a reviewed checklist\n"), 0o644); err != nil {
			t.Fatal(err)
		}
		refreshedTree, err := buildWorkspaceTree()
		if err != nil {
			t.Fatal(err)
		}
		refreshedPage := refreshedTree.Wiki.Entries[0].Children[0].Children[0]
		if refreshedPage.Size == originalSize {
			t.Fatalf("Wiki snapshot did not reflect a modified file: before=%d after=%d", originalSize, refreshedPage.Size)
		}

		if err := os.RemoveAll(filepath.Join(root, wikiDir)); err != nil {
			t.Fatal(err)
		}
		tree, err = buildWorkspaceTree()
		if err != nil {
			t.Fatal(err)
		}
		if tree.Wiki.Exists || tree.Wiki.Entries == nil || len(tree.Wiki.Entries) != 0 {
			t.Fatalf("missing Wiki should have an explicit empty snapshot: %+v", tree.Wiki)
		}
		run(t, "migrate")
		if got := readFile(t, indexPath); got != defaultWikiIndex {
			t.Fatalf("migrate did not restore the default Wiki index:\n%s", got)
		}

		if err := os.Remove(indexPath); err != nil {
			t.Fatal(err)
		}
		tree, err = buildWorkspaceTree()
		if err != nil {
			t.Fatal(err)
		}
		if !tree.Wiki.Exists || tree.Wiki.Entries == nil || len(tree.Wiki.Entries) != 0 {
			t.Fatalf("empty Wiki should remain distinguishable from a missing Wiki: %+v", tree.Wiki)
		}

		if err := os.Remove(filepath.Join(root, wikiDir)); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(filepath.Join(root, wikiDir), []byte("not a directory"), 0o644); err != nil {
			t.Fatal(err)
		}
		tree, err = buildWorkspaceTree()
		if err != nil {
			t.Fatal(err)
		}
		if !tree.Wiki.Exists || !strings.Contains(tree.Wiki.Error, "not a directory") {
			t.Fatalf("invalid Wiki path should report a clear snapshot error: %+v", tree.Wiki)
		}
		if _, err := runErr(t, "migrate"); err == nil || !strings.Contains(err.Error(), "not a directory") {
			t.Fatalf("migrate should reject an invalid Wiki path, got %v", err)
		}
	})
}

func TestMigrateRefreshesOpenTaskAgentsAndPreservesManualContent(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "Parent project")
		run(t, "task", "create", "--project=project1", "Open child")
		run(t, "task", "create", "--project=project1", "Archived child")
		run(t, "task", "archive", "--project=project1", "--task=task2")
		legacyProjectWork := filepath.Join(root, "project1", "work.md")
		if err := os.WriteFile(legacyProjectWork, []byte("# Legacy project work\n"), 0o644); err != nil {
			t.Fatal(err)
		}

		rootAgents := filepath.Join(root, "AGENTS.md")
		taskAgents := filepath.Join(root, "project1", "AGENTS.md")
		subtaskAgents := filepath.Join(root, "project1", "task1", "AGENTS.md")
		archivedAgents := filepath.Join(root, "project1", archiveDir, "task2", "AGENTS.md")

		writeStaleManagedBlock(t, rootAgents, "This directory is an AgentWorkspace managed by forge.", "old workspace prompt")
		appendFile(t, taskAgents, "\n# Task Notes\n\nKeep task note.\n")
		writeStaleManagedBlock(t, taskAgents, "You are working inside a single AgentWorkspace project directory.", "old project prompt")
		appendFile(t, subtaskAgents, "\n# Child Notes\n\nKeep child note.\n")
		writeStaleManagedBlock(t, subtaskAgents, "Read the parent project directory's project.json, project.md, and log.jsonl", "old child prompt")
		archivedBefore := readFile(t, archivedAgents)

		if err := os.Chdir(filepath.Join(root, "project1", "task1")); err != nil {
			t.Fatal(err)
		}
		run(t, "migrate")
		assertFile(t, legacyProjectWork)
		assertFile(t, filepath.Join(root, "project1", "task1", "work.md"))

		if pathExists(filepath.Join(root, "project1", "task1", configFile)) {
			t.Fatal("migrate from task should not create nested forge.json")
		}
		if pathExists(filepath.Join(root, "project1", "task1", reposDir)) {
			t.Fatal("migrate from task should not create nested repos directory")
		}
		if pathExists(filepath.Join(root, "project1", "task1", archiveDir)) {
			t.Fatal("migrate from task should not create nested archive directory")
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
		if !strings.Contains(subtaskAfter, "Read the parent project directory's project.json, project.md, and log.jsonl") {
			t.Fatalf("expected subtask guidance to be restored, got:\n%s", subtaskAfter)
		}
		if !strings.Contains(subtaskAfter, "absolute destination path inside this task's worktree/") {
			t.Fatalf("expected migrated subtask guidance to prevent relative worktree destination mistakes, got:\n%s", subtaskAfter)
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
	return captureRun(t, Run, args...)
}

func startRun(t *testing.T, args ...string) string {
	t.Helper()
	out, err := startErr(t, args...)
	if err != nil {
		t.Fatalf("forge start(%q) failed: %v\nstdout:\n%s", args, err, out)
	}
	return out
}

func startErr(t *testing.T, args ...string) (string, error) {
	return runErr(t, append([]string{"start"}, args...)...)
}

func captureRun(t *testing.T, fn func([]string) error, args ...string) (string, error) {
	t.Helper()
	var buf bytes.Buffer
	stdout := os.Stdout
	reader, writer, err := os.Pipe()
	if err != nil {
		t.Fatal(err)
	}
	os.Stdout = writer
	err = fn(args)
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

func stripHTMLComments(s string) string {
	for {
		start := strings.Index(s, "<!--")
		if start < 0 {
			return s
		}
		end := strings.Index(s[start+4:], "-->")
		if end < 0 {
			return s[:start]
		}
		end += start + 7
		s = s[:start] + s[end:]
	}
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
