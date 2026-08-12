package forge

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
	"time"
	"unicode"

	"github.com/disksing/forge/internal/app"
	"github.com/disksing/forge/internal/buildinfo"
)

const (
	testConfigFile       = "forge.json"
	testReposDir         = "repos"
	testArchiveDir       = "archive"
	testWikiDir          = "wiki"
	testProjectJSONFile  = "project.json"
	testProjectMDFile    = "project.md"
	testTaskMDFile       = "task.md"
	testDefaultLanguage  = "en"
	testChineseLanguage  = "zh-CN"
	testDefaultWikiIndex = "# Workspace Wiki\n\n此索引是 workspace 长期知识的入口。随着 Wiki 内容增长，请在这里添加主题页面链接及简短摘要。\n"
	defaultWikiIndex     = "# Workspace Wiki\n\nThis index is the entry point for long-lived workspace knowledge. Add links to topic pages with short summaries as the Wiki grows.\n"
	forgePromptStart     = "<!-- managed by forge cli -->"
	forgePromptEnd       = "<!-- end of forge cli prompt -->"
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

func TestSchedulerCommandsManageNaturalLanguageSchedules(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		createdOutput := run(t, "scheduler", "add", "--description", "Review release", "--condition", "when the release branch is green", "--target", "workspace", "--creator=user")
		var created app.Schedule
		if err := json.Unmarshal([]byte(createdOutput), &created); err != nil {
			t.Fatal(err)
		}
		if created.ID == "" || created.Description != "Review release" || created.Target != "workspace" || created.CreatedBy.Kind != app.CreatorKindUser {
			t.Fatalf("created schedule = %#v", created)
		}
		listed := run(t, "scheduler", "list")
		if !strings.Contains(listed, created.ID+"\tReview release\twhen the release branch is green\tworkspace") {
			t.Fatalf("schedule list = %q", listed)
		}
		updatedOutput := run(t, "scheduler", "update", "--id="+created.ID, "--condition=after 10:00 when the release branch is green", "--target=scheduler")
		var updated app.Schedule
		if err := json.Unmarshal([]byte(updatedOutput), &updated); err != nil {
			t.Fatal(err)
		}
		if updated.Condition != "after 10:00 when the release branch is green" || updated.Target != app.SchedulerResourceID || updated.CreatedAt != created.CreatedAt {
			t.Fatalf("updated schedule = %#v", updated)
		}
		shown := run(t, "scheduler", "show", "--id", created.ID)
		if !strings.Contains(shown, `"target": "scheduler"`) {
			t.Fatalf("schedule show = %s", shown)
		}
		jsonList := run(t, "scheduler", "list", "--json")
		if !strings.Contains(jsonList, `"wakeIntervalMinutes": 30`) || !strings.Contains(jsonList, created.ID) {
			t.Fatalf("JSON schedule list = %s", jsonList)
		}
		removed := run(t, "scheduler", "remove", "--id="+created.ID)
		if !strings.Contains(removed, created.ID) || strings.TrimSpace(run(t, "scheduler", "list")) != "" {
			t.Fatalf("remove result = %s", removed)
		}
		if _, err := os.Stat(filepath.Join(root, "scheduler", "scheduler.json")); err != nil {
			t.Fatal(err)
		}
	})
}

func TestStatusAndMessageCommandsUseOwningServerAndProvenance(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "Mailbox project")
		if err := os.Chdir(filepath.Join(root, "project1")); err != nil {
			t.Fatal(err)
		}
		run(t, "task", "create", "Mailbox task")
		if err := os.Chdir(filepath.Join(root, "project1", "task1")); err != nil {
			t.Fatal(err)
		}
		var requestBody map[string]any
		turnRef := base64.RawURLEncoding.EncodeToString([]byte(`{"v":1,"k":"turn","w":"instance","r":"project1.task1","g":"gen-1","t":"turn-1"}`))
		eventRef := base64.RawURLEncoding.EncodeToString([]byte(`{"v":1,"k":"event","w":"instance","r":"project1.task1","g":"gen-1","e":1}`))
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			switch {
			case r.Method == http.MethodPost && strings.HasSuffix(r.URL.Path, "/resources/project1.task1/messages"):
				if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
					t.Error(err)
				}
				_, _ = io.WriteString(w, `{"messageId":"msg-test","resourceId":"project1.task1","requestedMode":"interrupt","actualMode":"interrupt","status":"delivered","reference":"messages/msg-test"}`)
			case r.Method == http.MethodGet && strings.Contains(r.URL.Path, "/resources/") && strings.HasSuffix(r.URL.Path, "/status"):
				_, _ = io.WriteString(w, `{"resourceId":"project1.task1","state":"idle","exists":true,"acceptsMessages":true}`)
			case r.Method == http.MethodGet && strings.HasSuffix(r.URL.Path, "/messages/msg-test"):
				_, _ = io.WriteString(w, `{"messageId":"msg-test","status":"delivered"}`)
			case r.Method == http.MethodGet && strings.HasSuffix(r.URL.Path, "/resources/project1.task1/history/turns"):
				if r.URL.Query().Get("cursor") != "cursor-test" || r.URL.Query().Get("limit") != "7" {
					t.Errorf("unexpected history query: %s", r.URL.RawQuery)
				}
				_, _ = io.WriteString(w, `{"resourceId":"project1.task1","segments":[],"page":{"limit":7,"hasMore":false}}`)
			case r.Method == http.MethodGet && strings.HasSuffix(r.URL.Path, "/resources/project1.task1/history/turns/"+turnRef):
				_, _ = io.WriteString(w, `{"turn":{"turnId":"turn-1"},"items":[]}`)
			case r.Method == http.MethodGet && strings.HasSuffix(r.URL.Path, "/resources/project1.task1/history/events/"+eventRef):
				_, _ = io.WriteString(w, `{"event":{"id":1}}`)
			default:
				http.NotFound(w, r)
			}
		}))
		defer server.Close()
		lock := map[string]any{"pid": os.Getpid(), "address": server.URL, "workspacePath": root}
		data, err := json.Marshal(lock)
		if err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(filepath.Join(root, ".forge", "serve.lock"), data, 0o600); err != nil {
			t.Fatal(err)
		}

		sent := run(t, "message", "send", "--to=project1.task1", "--mode=interrupt", "coordinate now")
		if !strings.Contains(sent, `"messageId": "msg-test"`) {
			t.Fatalf("unexpected send response: %s", sent)
		}
		if requestBody["text"] != "coordinate now" || requestBody["mode"] != "interrupt" || requestBody["role"] != "agent" {
			t.Fatalf("unexpected resource message request: %#v", requestBody)
		}
		sender, _ := requestBody["sender"].(map[string]any)
		if sender["id"] != "project1.task1" || sender["name"] != "project1.task1" {
			t.Fatalf("sender provenance did not use current resource: %#v", sender)
		}
		var config app.Config
		if err := readJSON(filepath.Join(root, testConfigFile), &config); err != nil {
			t.Fatal(err)
		}
		if requestBody["senderWorkspaceInstanceId"] != config.InstanceID {
			t.Fatalf("sender Workspace provenance = %#v, want %q", requestBody["senderWorkspaceInstanceId"], config.InstanceID)
		}
		if status := run(t, "task", "status"); !strings.Contains(status, `"acceptsMessages": true`) {
			t.Fatalf("unexpected inferred status response: %s", status)
		}
		if status := run(t, "project", "status", "--project=1"); !strings.Contains(status, `"state": "idle"`) {
			t.Fatalf("unexpected project status response: %s", status)
		}
		if status := run(t, "workspace", "status"); !strings.Contains(status, `"state": "idle"`) {
			t.Fatalf("unexpected workspace status response: %s", status)
		}
		if message := run(t, "message", "show", "--id=msg-test"); !strings.Contains(message, `"status": "delivered"`) {
			t.Fatalf("unexpected message response: %s", message)
		}
		if history := run(t, "task", "history", "--cursor=cursor-test", "--limit=7"); !strings.Contains(history, `"resourceId": "project1.task1"`) {
			t.Fatalf("unexpected history response: %s", history)
		}
		if turn := run(t, "history", "turn", "show", "--ref="+turnRef); !strings.Contains(turn, `"turnId": "turn-1"`) {
			t.Fatalf("unexpected Turn detail: %s", turn)
		}
		if event := run(t, "history", "event", "show", "--ref="+eventRef); !strings.Contains(event, `"id": 1`) {
			t.Fatalf("unexpected Event detail: %s", event)
		}
		for _, args := range [][]string{{"resource", "status"}, {"resource", "send", "--id=project1.task1", "legacy"}, {"resource", "message", "--id=msg-test"}} {
			if _, err := runErr(t, args...); err == nil || !strings.Contains(err.Error(), "unknown resource subcommand") {
				t.Fatalf("legacy resource command still exists: %v", args)
			}
		}
	})
}

func TestCreateCreatorFlagAndInjectedAgentContext(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "Source project")
		if err := os.Chdir(filepath.Join(root, "project1")); err != nil {
			t.Fatal(err)
		}
		run(t, "task", "create", "Source task")
		if err := os.Chdir(filepath.Join(root, "project1", "task1")); err != nil {
			t.Fatal(err)
		}
		workspace, err := app.OpenWorkspace(root)
		if err != nil {
			t.Fatal(err)
		}
		runtime, err := workspace.RuntimeConfig()
		if err != nil {
			t.Fatal(err)
		}
		t.Setenv(forgeWorkspaceRootEnvironment, root)
		t.Setenv(forgeWorkspaceInstanceEnvironment, runtime.InstanceID)
		t.Setenv(forgeResourceIDEnvironment, "project1.task1")

		run(t, "project", "create", "Agent delegated project")
		delegated, err := workspace.ResourceValue("project2")
		if err != nil || delegated.Project == nil || delegated.Project.Creator == nil {
			t.Fatalf("delegated project = %#v, %v", delegated, err)
		}
		want, _ := app.ResourceCreator(runtime.InstanceID, "project1.task1")
		if *delegated.Project.Creator != want {
			t.Fatalf("delegated creator = %#v, want %#v", delegated.Project.Creator, want)
		}

		run(t, "project", "create", "--creator=user", "Explicit user project")
		explicitUser, err := workspace.ResourceValue("project3")
		if err != nil || explicitUser.Project.Creator == nil || explicitUser.Project.Creator.Kind != app.CreatorKindUser {
			t.Fatalf("explicit user creator = %#v, %v", explicitUser.Project, err)
		}

		t.Setenv(forgeWorkspaceInstanceEnvironment, "wrong-instance")
		if _, err := runErr(t, "project", "create", "Invalid Agent project"); err == nil || !strings.Contains(err.Error(), "does not match") {
			t.Fatalf("invalid injected Agent context was accepted: %v", err)
		}
		run(t, "project", "create", "--creator=user", "User ignores invalid Agent context")
	})
}

func TestRemovedStartAndServeSubcommands(t *testing.T) {
	if _, err := runErr(t, "start"); err == nil || !strings.Contains(err.Error(), `unknown command "start"`) {
		t.Fatalf("expected forge start to be unknown, got %v", err)
	}
	for _, subcommand := range []string{"lock", "unlock", "new", "bind-agenthub", "heartbeat", "end"} {
		if _, err := runErr(t, "session", subcommand, "--id=test"); err == nil || !strings.Contains(err.Error(), "unknown session subcommand") {
			t.Fatalf("expected forge session %s to be unknown, got %v", subcommand, err)
		}
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
}

func TestInitDefaultsToEnglishAndPersistsLanguage(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		var config app.Config
		if err := readJSON(filepath.Join(root, testConfigFile), &config); err != nil {
			t.Fatal(err)
		}
		if config.Language != testDefaultLanguage {
			t.Fatalf("expected default language %q, got %+v", testDefaultLanguage, config)
		}
		if !strings.Contains(readFile(t, filepath.Join(root, "AGENTS.md")), "This directory is an AgentWorkspace managed by forge.") {
			t.Fatal("default workspace prompt should remain English")
		}
	})
}

func TestSimplifiedChineseInitTemplatesAndLanguageMigration(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init", "--language", "zh-CN")

		var config app.Config
		if err := readJSON(filepath.Join(root, testConfigFile), &config); err != nil {
			t.Fatal(err)
		}
		if config.Language != testChineseLanguage {
			t.Fatalf("expected zh-CN workspace config, got %+v", config)
		}
		if got := readFile(t, filepath.Join(root, testWikiDir, "index.md")); got != testDefaultWikiIndex {
			t.Fatalf("unexpected Chinese Wiki index:\n%s", got)
		}
		rootAgentsPath := filepath.Join(root, "AGENTS.md")
		if got := readFile(t, rootAgentsPath); !strings.Contains(got, "此目录是由 Forge 管理的 AgentWorkspace") || !strings.Contains(got, "如果存在适用的现有模板，应优先使用该模板") || !strings.Contains(got, "默认保留模板已有的全部规则") {
			t.Fatalf("expected Chinese workspace prompt, got:\n%s", got)
		}

		run(t, "project", "create", "中文项目")
		projectPath := filepath.Join(root, "project1")
		projectMD := readFile(t, filepath.Join(projectPath, testProjectMDFile))
		if !strings.Contains(projectMD, "## 背景") || !strings.Contains(projectMD, "## 范围") || !strings.Contains(projectMD, "## 验收标准") {
			t.Fatalf("expected Chinese project template, got:\n%s", projectMD)
		}
		projectAgentsPath := filepath.Join(projectPath, "AGENTS.md")
		if got := readFile(t, projectAgentsPath); !strings.Contains(got, "# 项目 Agent 指引") || !strings.Contains(got, "项目内容模板位于 templates/*.md") || !strings.Contains(got, "schema-version: 2") || !strings.Contains(got, "workspace 根目录的 AGENTS.md（../AGENTS.md）") || !strings.Contains(got, "如果存在适用的现有模板，应优先使用该模板") || !strings.Contains(got, "默认保留模板已有的全部规则") || !strings.Contains(got, "只有用户明确要求覆盖某一项规则时才可针对该项覆盖") {
			t.Fatalf("expected Chinese project prompt with workspace AGENTS.md path, got:\n%s", got)
		}
		var projectLogs []app.LogEntry
		if err := json.Unmarshal([]byte(run(t, "project", "log", "list", "--project=project1", "--json")), &projectLogs); err != nil {
			t.Fatal(err)
		}
		if len(projectLogs) != 1 || projectLogs[0].Title != "项目已创建" {
			t.Fatalf("expected localized project creation log, got %+v", projectLogs)
		}

		run(t, "task", "create", "--project=project1", "中文任务")
		taskPath := filepath.Join(projectPath, "task1")
		taskMDPath := filepath.Join(taskPath, testTaskMDFile)
		workMDPath := filepath.Join(taskPath, "work.md")
		taskAgentsPath := filepath.Join(taskPath, "AGENTS.md")
		if got := readFile(t, taskMDPath); !strings.Contains(got, "## 背景") || !strings.Contains(got, "长期有效的任务约定") {
			t.Fatalf("expected Chinese task template, got:\n%s", got)
		}
		if got := readFile(t, workMDPath); !strings.Contains(got, "# 工作记录") || !strings.Contains(got, "## 当前重点") {
			t.Fatalf("expected Chinese work template, got:\n%s", got)
		}
		if got := readFile(t, taskAgentsPath); !strings.Contains(got, "# 任务 Agent 指引") || !strings.Contains(got, "此任务属于一个项目") || !strings.Contains(got, "父项目 AGENTS.md（../AGENTS.md）") || !strings.Contains(got, "workspace 根目录的 AGENTS.md（../../AGENTS.md）") || !strings.Contains(got, "如果存在适用的现有模板，应优先使用") || !strings.Contains(got, "默认保留模板已有的全部规则") || !strings.Contains(got, "只有用户明确要求覆盖某一项规则时才可针对该项覆盖") {
			t.Fatalf("expected Chinese task prompt with project and workspace AGENTS.md paths, got:\n%s", got)
		}
		var taskLogs []app.LogEntry
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
		if err := readJSON(filepath.Join(root, testConfigFile), &config); err != nil {
			t.Fatal(err)
		}
		if config.Language != testDefaultLanguage {
			t.Fatalf("expected migration to persist English, got %+v", config)
		}
		if got := readFile(t, rootAgentsPath); !strings.Contains(got, "This directory is an AgentWorkspace managed by forge.") || strings.Contains(got, "此目录是由 Forge 管理") || !strings.Contains(got, "prefer an existing suitable template") || !strings.Contains(got, "preserve all existing template rules by default") {
			t.Fatalf("expected English workspace prompt after migration, got:\n%s", got)
		}
		if got := readFile(t, projectAgentsPath); !strings.Contains(got, "# Project Agent Instructions") || !strings.Contains(got, "保留这行。") || !strings.Contains(got, "prefer an existing suitable template") || !strings.Contains(got, "preserve all existing template rules by default") || !strings.Contains(got, "override a particular rule only when the user explicitly asks for that override") {
			t.Fatalf("expected English project prompt with manual content preserved, got:\n%s", got)
		}
		if got := readFile(t, taskAgentsPath); !strings.Contains(got, "# Task Agent Instructions") || !strings.Contains(got, "prefer an existing suitable template") || !strings.Contains(got, "preserve all existing template rules by default") {
			t.Fatalf("expected English task prompt after migration, got:\n%s", got)
		}
		if got := readFile(t, taskMDPath); got != chineseTaskMD {
			t.Fatalf("migration should not translate existing task.md\nbefore:\n%s\nafter:\n%s", chineseTaskMD, got)
		}

		run(t, "task", "create", "--project=project1", "English task")
		if got := readFile(t, filepath.Join(projectPath, "task2", testTaskMDFile)); !strings.Contains(got, "## Background") {
			t.Fatalf("expected new task to use migrated language, got:\n%s", got)
		}

		run(t, "migrate", "--language=zh-CN")
		if got := readFile(t, taskAgentsPath); !strings.Contains(got, "# 任务 Agent 指引") || !strings.Contains(got, "如果存在适用的现有模板，应优先使用") || !strings.Contains(got, "默认保留模板已有的全部规则") {
			t.Fatalf("expected migration to switch prompts back to Chinese, got:\n%s", got)
		}
	})
}

func TestGeneratedAgentCardsIncludeReadOnlyCrossResourceGuidanceAcrossCLILifecycle(t *testing.T) {
	cases := []struct {
		name     string
		language string
		anchors  []string
		wrong    string
	}{
		{
			name:     "English",
			language: "en",
			anchors: []string{
				"Within the Workspace, write only files owned by the resource where the agent was started and task worktrees owned by that resource.",
				"Other Workspace resources are read-only, and files managed by another agent must not be modified.",
				"Outside the Workspace, follow the user's requested scope and the host account's permissions.",
				"relevant `artifacts/`",
				"task.json` contains structured state",
				"task.md` the durable contract",
				"work.md` the current recovery checkpoint",
				"log.jsonl` the historical timeline",
				"You may use `sed`, `rg`, or `less` on the resolved paths.",
				"forge task show --project=<project> --task=<task>",
				"forge task log list --project=<project> --task=<task> [--json]",
				"forge workspace resource --id=<project.task> --json",
			},
			wrong: "只读检查其他项目/任务资源",
		},
		{
			name:     "Simplified Chinese",
			language: "zh-CN",
			anchors: []string{
				"在 Workspace 内，只能写入 agent 启动资源拥有的文件及该资源拥有的任务 worktree。",
				"其他 Workspace 资源只读，不得修改由其他 agent 管理的文件。",
				"Workspace 外的文件遵循用户要求的范围和主机账户权限。",
				"相关 `artifacts/`",
				"`task.json` 是结构化状态",
				"`task.md` 是长期约定",
				"`work.md` 是当前恢复检查点",
				"`log.jsonl` 是历史时间线",
				"对已解析的文件路径使用 `sed`、`rg` 或 `less`",
				"forge task show --project=<project> --task=<task>",
				"forge task log list --project=<project> --task=<task> [--json]",
				"forge workspace resource --id=<project.task> --json",
			},
			wrong: "Read-only inspection of other project/task resources",
		},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			withTempCwd(t, func(root string) {
				run(t, "init", "--language", tc.language)
				run(t, "project", "create", "Guidance project")
				run(t, "task", "create", "--project=project1", "Guidance task")

				paths := []string{
					filepath.Join(root, "AGENTS.md"),
					filepath.Join(root, "project1", "AGENTS.md"),
					filepath.Join(root, "project1", "task1", "AGENTS.md"),
				}
				assertGuidance := func(stage string) {
					t.Helper()
					for _, path := range paths {
						content := readFile(t, path)
						for _, want := range tc.anchors {
							if !strings.Contains(content, want) {
								t.Fatalf("generated %s card after %s is missing %q:\n%s", path, stage, want, content)
							}
						}
						if strings.Contains(content, tc.wrong) || strings.Contains(content, "forge task work show") {
							t.Fatalf("generated %s card after %s contains wrong-language or nonexistent guidance:\n%s", path, stage, content)
						}
					}
				}

				assertGuidance("create")
				if err := os.Chdir(filepath.Join(root, "project1", "task1")); err != nil {
					t.Fatal(err)
				}
				run(t, "migrate", "--language", tc.language)
				assertGuidance("migrate")
			})
		})
	}
}

func TestLanguageValidationAndLegacyWorkspaceMigration(t *testing.T) {
	withTempCwd(t, func(root string) {
		if _, err := runErr(t, "init", "--language=fr"); err == nil || !strings.Contains(err.Error(), "unsupported language") {
			t.Fatalf("expected unsupported init language error, got %v", err)
		}
		assertMissing(t, filepath.Join(root, testConfigFile))

		run(t, "init", "--language=zh_CN")
		var config app.Config
		if err := readJSON(filepath.Join(root, testConfigFile), &config); err != nil {
			t.Fatal(err)
		}
		if config.Language != testChineseLanguage {
			t.Fatalf("expected language alias to normalize to zh-CN, got %+v", config)
		}
		if _, err := runErr(t, "migrate", "--language"); err == nil || !strings.Contains(err.Error(), "--language requires a value") {
			t.Fatalf("expected missing language value error, got %v", err)
		}
	})

	withTempCwd(t, func(root string) {
		if err := os.MkdirAll(filepath.Join(root, testReposDir), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.MkdirAll(filepath.Join(root, testArchiveDir), 0o755); err != nil {
			t.Fatal(err)
		}
		writeFile(t, filepath.Join(root, testConfigFile), `{"version":1}`+"\n")
		run(t, "migrate")
		var config app.Config
		if err := readJSON(filepath.Join(root, testConfigFile), &config); err != nil {
			t.Fatal(err)
		}
		if config.Language != testDefaultLanguage {
			t.Fatalf("expected legacy workspace to migrate to explicit English, got %+v", config)
		}
	})
}

func TestTaskLifecycle(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		assertDir(t, filepath.Join(root, testReposDir))
		assertDir(t, filepath.Join(root, testArchiveDir))
		assertFile(t, filepath.Join(root, testConfigFile))
		assertFile(t, filepath.Join(root, "AGENTS.md"))
		assertDir(t, filepath.Join(root, testWikiDir))
		assertFile(t, filepath.Join(root, testWikiDir, "index.md"))

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
		var projectLogs []app.LogEntry
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
		if !strings.Contains(projectAgents, "Within the Workspace, write only files owned by the resource where the agent was started") || !strings.Contains(projectAgents, "files managed by another agent must not be modified") {
			t.Fatalf("expected project AGENTS.md to include Workspace file-boundary guidance, got:\n%s", projectAgents)
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
		if !strings.Contains(projectAgents, "Project content templates live in templates/*.md") || !strings.Contains(projectAgents, "schema-version: 2") || !strings.Contains(projectAgents, "Templates organize task content only") || !strings.Contains(projectAgents, "prefer an existing suitable template") || !strings.Contains(projectAgents, "preserve all existing template rules by default") || !strings.Contains(projectAgents, "override a particular rule only when the user explicitly asks for that override") {
			t.Fatalf("project AGENTS.md should document the task template format, got:\n%s", projectAgents)
		}
		if !strings.Contains(projectAgents, "workspace root AGENTS.md (../AGENTS.md)") {
			t.Fatalf("project AGENTS.md should reference workspace AGENTS.md by relative path, got:\n%s", projectAgents)
		}
		templateContent := "---\nschema-version: 2\ntitle: Daily inspection\nfields: []\n---\n# Daily inspection\n\nCheck current state.\n"
		if err := os.WriteFile(filepath.Join(root, "project1", "templates", "daily.md"), []byte(templateContent), 0o644); err != nil {
			t.Fatal(err)
		}
		if err := os.RemoveAll(filepath.Join(root, "project1", "artifacts")); err != nil {
			t.Fatal(err)
		}
		projectDetailJSON := run(t, "workspace", "resource", "--id", "project1", "--json")
		var projectDetail app.ResourceDetailView
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
		if template.Name != "daily" || template.Title != "Daily inspection" || !strings.Contains(template.Detail, "Check current state.") {
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
		if !strings.Contains(subtaskAgents, "prefer an existing suitable template") || !strings.Contains(subtaskAgents, "preserve all existing template rules by default") || !strings.Contains(subtaskAgents, "override a particular rule only when the user explicitly asks for that override") {
			t.Fatalf("expected subtask AGENTS.md to preserve applicable template guidance, got:\n%s", subtaskAgents)
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
		if !strings.Contains(subtaskAgents, "Within the Workspace, write only files owned by the resource where the agent was started") || !strings.Contains(subtaskAgents, "Other Workspace resources are read-only") {
			t.Fatalf("expected subtask AGENTS.md to include non-recursive Workspace write guidance, got:\n%s", subtaskAgents)
		}
		if !strings.Contains(subtaskAgents, "git worktree add") || !strings.Contains(subtaskAgents, "absolute destination path inside this task's worktree/") || !strings.Contains(subtaskAgents, "git -C") {
			t.Fatalf("expected subtask AGENTS.md to prevent relative worktree destination mistakes, got:\n%s", subtaskAgents)
		}
		if !strings.Contains(subtaskAgents, "Task boundaries are default safeguards against multi-agent conflicts, not absolute restrictions") || !strings.Contains(subtaskAgents, "Explicit user instructions may authorize host-file work outside this task directory") {
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
		var emptyDetail app.ResourceDetailView
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
		var tree app.WorkspaceTree
		if err := json.Unmarshal([]byte(treeJSON), &tree); err != nil {
			t.Fatalf("workspace tree should print JSON, got error %v and output:\n%s", err, treeJSON)
		}
		if tree.Root != filepath.ToSlash(realPath(t, root)) || len(tree.Projects) != 1 {
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
		var detail app.ResourceDetailView
		if err := json.Unmarshal([]byte(detailJSON), &detail); err != nil {
			t.Fatalf("workspace resource should print JSON, got error %v and output:\n%s", err, detailJSON)
		}
		if detail.ID != "project1.task1" || detail.Path != "project1/task1" || len(detail.Files) == 0 {
			t.Fatalf("unexpected task detail: %+v", detail)
		}
		if detail.Files[0].Name != "task.md" || detail.Files[0].Path != "project1/task1/task.md" {
			t.Fatalf("expected task file path in detail, got: %+v", detail.Files[0])
		}
		if detail.Files[0].ContentHash == "" {
			t.Fatal("expected task Markdown detail to include a content hash")
		}
		if len(detail.Logs) != 1 || detail.Logs[0].Title != "Task created" {
			t.Fatalf("expected structured task creation log, got: %+v", detail.Logs)
		}
		if len(detail.Artifacts) != 1 || detail.Artifacts[0].Name != "result.txt" {
			t.Fatalf("expected artifact file in task detail, got: %+v", detail.Artifacts)
		}

		addedLog := run(t, "task", "log", "add", "--project=project1", "--task=task1", "--details", "go test ./... passed", "Ran checks")
		var addedEntry app.LogEntry
		if err := json.Unmarshal([]byte(addedLog), &addedEntry); err != nil {
			t.Fatalf("task log add should print JSON, got error %v and output:\n%s", err, addedLog)
		}
		if addedEntry.Title != "Ran checks" || addedEntry.Details != "go test ./... passed" {
			t.Fatalf("unexpected added log entry: %+v", addedEntry)
		}
		taskLogJSON := run(t, "task", "log", "list", "--project=project1", "--task=task1", "--json")
		var taskLogs []app.LogEntry
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
		assertDir(t, filepath.Join(root, testArchiveDir, "project1"))
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

func TestRemovedAutomationCommandsAreRejected(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "Automation")
		if _, err := runErr(t, "task", "create", "--project=project1", "--non-interactive", "Task"); err == nil {
			t.Fatal("expected --non-interactive to be rejected")
		}
		if _, err := runErr(t, "task", "run", "queue", "--project=project1", "--task=task1"); err == nil {
			t.Fatal("expected task run command to be rejected")
		}
		if _, err := runErr(t, "task", "create", "--project=project1", "--autorun", "Task"); err == nil {
			t.Fatal("expected the retired creation flag to be rejected")
		}
		if _, err := runErr(t, "task", "autorun", "queue", "--project=project1", "--task=task1"); err == nil {
			t.Fatal("expected the retired task subcommand to be rejected")
		}
		if _, err := runErr(t, "task", "create", "--project=project1", "--self-driving", "Task"); err == nil {
			t.Fatal("expected the removed creation flag to be rejected")
		}
		if _, err := runErr(t, "task", "self-driving", "enable", "--project=project1", "--task=task1"); err == nil {
			t.Fatal("expected the removed task subcommand to be rejected")
		}
		if _, err := runErr(t, "task", "list", "--project=project1", "--runnable"); err == nil {
			t.Fatal("expected the removed runnable filter to be rejected")
		}
	})
}

func TestHelpGroupsCommandSections(t *testing.T) {
	help := run(t, "help")
	expected := []string{
		"How Forge works:",
		"All workspace data lives on the filesystem",
		"Agents may inspect\n  other resources, but write only the Workspace files owned by their starting\n  resource and its task worktrees.",
		"The web service is provided by forge serve.",
		"Usage:",
		"  forge init [--language=<language>] [--creator=user|agent]\n  forge migrate [--language=<language>]",
		"  forge repo add [--bare] <name> <url>\n  forge repo list",
		"  forge project create [--slug <slug>] [--creator=user|agent] <description>",
		"  forge template list [--project=<project>] [--json]",
		"  forge task create [<title>] [--project=<project>] [--slug <slug>] [--creator=user|agent]",
		"  forge session list\n  forge session show --id=<id>",
		"  forge serve [--addr=<address>] [--workspace=<path>] [--version]",
		"Commands:",
		"  forge init [--language=<language>] [--creator=user|agent]",
		"  forge migrate [--language=<language>]",
		"  forge repo add [--bare] <name> <url>",
		"  forge project create [--slug <slug>] [--creator=user|agent] <description>",
		"  forge task create [<title>] [--project=<project>] [--slug <slug>] [--creator=user|agent]",
		"  forge template list|show|validate|render|create|migrate ...",
		"  forge session list\n    List the transient AgentHub Session projections managed by forge serve.",
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
		var task app.Task
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

		archivedTask := run(t, "task", "archive", "--project=project1", "--task=task1")
		if !strings.Contains(archivedTask, "project1-forge-dev/archive/task1-develop-forge") {
			t.Fatalf("expected task archive to preserve slugged directory name, got:\n%s", archivedTask)
		}
		assertDir(t, filepath.Join(projectPath, testArchiveDir, "task1-develop-forge"))

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
		assertDir(t, filepath.Join(root, testArchiveDir, "project1-forge-dev"))
	})
}

func TestMalformedSluggedDirectoriesAreIgnored(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		now := time.Now().Format(time.RFC3339)
		malformedProject := app.Project{ResourceMeta: app.ResourceMeta{SchemaVersion: 1, ID: "project9", Type: "project", Title: "Malformed project", CreatedAt: now, UpdatedAt: now}, Description: "Malformed project"}
		writeTestResourceJSON(t, filepath.Join(root, "project9--bad", testProjectJSONFile), malformedProject)
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
		malformedTask := app.Task{ResourceMeta: app.ResourceMeta{SchemaVersion: 1, ID: "project1.task8", Type: "task", Title: "Malformed task", CreatedAt: now, UpdatedAt: now}, Parent: parentID, Description: "Malformed task"}
		writeTestResourceJSON(t, filepath.Join(parentPath, "task8--bad", "task.json"), malformedTask)
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
		duplicate := filepath.Join(root, testArchiveDir, "project1-copy")
		if err := os.MkdirAll(duplicate, 0o755); err != nil {
			t.Fatal(err)
		}
		data := readFile(t, filepath.Join(root, "project1", testProjectJSONFile))
		if err := os.WriteFile(filepath.Join(duplicate, testProjectJSONFile), []byte(data), 0o644); err != nil {
			t.Fatal(err)
		}
		out, err := runErr(t, "project", "show", "--project=project1")
		if err == nil || !strings.Contains(err.Error(), "multiple resource directories") {
			t.Fatalf("expected duplicate resource error, got stdout %q and error %v", out, err)
		}
	})
}

func TestSessionListAndShowAreReadOnlyAgentHubDiagnostics(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		path := filepath.Join(root, "forge-sessions.json")
		store := `{"version":1,"sessions":[` +
			`{"id":"legacy-pid","liveness":{"type":"pid","pid":123},"startedAt":"2026-01-01T00:00:00Z","updatedAt":"2026-01-01T00:00:00Z"},` +
			`{"id":"legacy-heartbeat","liveness":{"type":"heartbeat","timeout":"1h"},"startedAt":"2026-01-01T00:00:00Z","updatedAt":"2026-01-01T00:00:00Z"},` +
			`{"id":"session-agenthub","liveness":{"type":"agenthub","sourceExternalId":"workspace/run","agentHubSessionId":"ses_one","lastKnownState":"legacy"},"startedAt":"2026-01-02T00:00:00Z","updatedAt":"2026-01-02T00:00:00Z"}]}`
		if err := os.WriteFile(path, []byte(store), 0o644); err != nil {
			t.Fatal(err)
		}
		before := readFile(t, path)

		listed := run(t, "session", "list")
		if !strings.Contains(listed, "session-agenthub\tagenthub:ses_one") ||
			strings.Contains(listed, "legacy-pid") || strings.Contains(listed, "legacy-heartbeat") {
			t.Fatalf("unexpected read-only session list:\n%s", listed)
		}
		shown := run(t, "session", "show", "--id", "session-agenthub")
		if !strings.Contains(shown, `"agentHubSessionId": "ses_one"`) {
			t.Fatalf("unexpected session JSON:\n%s", shown)
		}
		if _, err := runErr(t, "session", "show", "--id=session-agenthub", "--id", "session-agenthub"); err == nil || !strings.Contains(err.Error(), sessionShowUsage) {
			t.Fatalf("duplicate session ID flag should be rejected, got %v", err)
		}
		if _, err := runErr(t, "session", "show", "--id", "legacy-pid"); err == nil || !strings.Contains(err.Error(), "session not found") {
			t.Fatalf("legacy PID session should not be exposed, got %v", err)
		}
		run(t, "workspace", "tree", "--json")
		if after := readFile(t, path); after != before {
			t.Fatalf("read-only diagnostics rewrote the store:\nbefore:\n%s\nafter:\n%s", before, after)
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
		repoPath := filepath.Join(root, testReposDir, "disksing", "forge")
		writeGitRepo(t, repoPath, "master")
		worktreePath := filepath.Join(root, "project1", "task1", "worktree", "forge")
		runGit(t, repoPath, "worktree", "add", "-b", "agent/project1.task1", worktreePath, "master")
		run(t, "task", "repo", "add", "--project=project1", "--task=task1", "disksing/forge", "--worktree", "project1/task1/worktree/forge", "--branch", "agent/project1.task1", "--target", "master")

		archived := run(t, "task", "archive", "--project=project1", "--task=task1")
		if !strings.Contains(archived, "project1/archive/task1") {
			t.Fatalf("expected archive path, got:\n%s", archived)
		}
		assertDir(t, filepath.Join(root, "project1", testArchiveDir, "task1"))
		var archivedTask app.Task
		if err := readJSON(filepath.Join(root, "project1", testArchiveDir, "task1", "task.json"), &archivedTask); err != nil {
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
		repoPath := filepath.Join(root, testReposDir, "disksing", "forge")
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
		if pathExists(filepath.Join(root, "project1", testArchiveDir, "task1")) {
			t.Fatal("project1.task1 should not have been archived")
		}
	})
}

func TestTaskArchiveAllowsMissingRepoWorktree(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "Archive without a checkout")
		run(t, "task", "create", "--project=project1", "Code task")
		writeFakeRepo(t, filepath.Join(root, testReposDir, "disksing", "forge"))
		run(t, "task", "repo", "add", "--project=project1", "--task=task1", "disksing/forge", "--worktree", "project1/task1/worktree/forge", "--branch", "agent/project1.task1", "--target", "master")

		archived := run(t, "task", "archive", "--project=project1", "--task=task1")
		if !strings.Contains(archived, "project1/archive/task1") {
			t.Fatalf("expected archive path, got:\n%s", archived)
		}
		assertDir(t, filepath.Join(root, "project1", testArchiveDir, "task1"))
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
		assertDir(t, filepath.Join(root, "project1", testArchiveDir, "task1"))
		if pathExists(filepath.Join(root, testArchiveDir, "project1.task1")) {
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
		assertDir(t, filepath.Join(root, testArchiveDir, "project1"))
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
		assertDir(t, filepath.Join(root, "project1", testArchiveDir, "task1"))
		assertDir(t, filepath.Join(root, "project1", testArchiveDir, "task2"))
		assertDir(t, filepath.Join(root, "project1", testArchiveDir, "task3"))
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
		repoPath := filepath.Join(root, testReposDir, "disksing", "forge")
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
		if pathExists(filepath.Join(root, "project1", testArchiveDir, "task1")) {
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
		assertDir(t, filepath.Join(root, testReposDir, "disksing", "forge", ".git"))
		assertFile(t, filepath.Join(root, testReposDir, "disksing", "forge", "README.md"))
		if pathExists(filepath.Join(root, testReposDir, "disksing", "forge.git")) {
			t.Fatal("default repo add should not create a bare .git repository")
		}

		bare := run(t, "repo", "add", "--bare", "disksing/forge-bare", source)
		if !strings.Contains(bare, "repos/disksing/forge-bare.git") {
			t.Fatalf("expected bare repo path, got:\n%s", bare)
		}
		assertFile(t, filepath.Join(root, testReposDir, "disksing", "forge-bare.git", "HEAD"))
	})
}

func TestRepoListFindsRepositories(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		writeFakeRepo(t, filepath.Join(root, testReposDir, "disksing", "forge"))
		writeFakeBareRepo(t, filepath.Join(root, testReposDir, "disksing", "legacy.git"), "master")

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
		writeFakeRepo(t, filepath.Join(root, testReposDir, "disksing", "forge"))

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
		writeFakeBareRepo(t, filepath.Join(root, testReposDir, "disksing", "forge.git"), "master")

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
		indexPath := filepath.Join(root, testWikiDir, "index.md")
		if got := readFile(t, indexPath); got != defaultWikiIndex {
			t.Fatalf("unexpected default Wiki index:\n%s", got)
		}

		customIndex := "# Team Wiki\n\n- [Architecture](architecture.md)\n"
		if err := os.WriteFile(indexPath, []byte(customIndex), 0o644); err != nil {
			t.Fatal(err)
		}
		guideDir := filepath.Join(root, testWikiDir, "guides", "operations")
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

		if err := os.RemoveAll(filepath.Join(root, testWikiDir)); err != nil {
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

		if err := os.Remove(filepath.Join(root, testWikiDir)); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(filepath.Join(root, testWikiDir), []byte("not a directory"), 0o644); err != nil {
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
		archivedAgents := filepath.Join(root, "project1", testArchiveDir, "task2", "AGENTS.md")

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

		if pathExists(filepath.Join(root, "project1", "task1", testConfigFile)) {
			t.Fatal("migrate from task should not create nested forge.json")
		}
		if pathExists(filepath.Join(root, "project1", "task1", testReposDir)) {
			t.Fatal("migrate from task should not create nested repos directory")
		}
		if pathExists(filepath.Join(root, "project1", "task1", testArchiveDir)) {
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

func TestStructuredTemplateCommandsAndTaskCreate(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "Template project")
		template := `---
schema-version: 2
title: Request
task-title: "{{ summary }}"
fields:
  - name: summary
    type: text
    label: Summary
    required: true
  - name: body
    type: textarea
    label: Body
    required: true
  - name: enabled
    type: boolean
    label: Enabled
    default: false
---
# {{ summary }}

{{ body }}

Enabled: {{ enabled }}
`
		templatePath := filepath.Join(root, "project1", "templates", "request.md")
		if err := os.WriteFile(templatePath, []byte(template), 0o644); err != nil {
			t.Fatal(err)
		}
		listed := run(t, "template", "list", "--project=project1")
		if !strings.Contains(listed, "request\tRequest\tv2\t3 fields\tvalid") {
			t.Fatalf("unexpected template list:\n%s", listed)
		}
		shown := run(t, "template", "show", "--project=project1", "--schema", "request")
		if !strings.Contains(shown, `"name": "summary"`) || !strings.Contains(shown, `"digest": "sha256:`) {
			t.Fatalf("unexpected template schema:\n%s", shown)
		}
		rendered := run(t, "template", "render", "--project=project1", "--field", "summary=CLI task", "--field", "body=Created from CLI", "--field", "enabled=true", "request")
		if !strings.Contains(rendered, "# CLI task") || !strings.Contains(rendered, "Enabled: true") {
			t.Fatalf("unexpected rendered template:\n%s", rendered)
		}
		preview := run(t, "task", "create", "--project=project1", "--template=request", "--field", "summary=CLI task", "--field", "body=Created from CLI", "--dry-run")
		if !strings.Contains(preview, `"title": "CLI task"`) || strings.Contains(preview, `"selfDriving"`) {
			t.Fatalf("unexpected dry-run preview:\n%s", preview)
		}
		if matches, _ := filepath.Glob(filepath.Join(root, "project1", "task*")); len(matches) != 0 {
			t.Fatalf("dry-run created task directories: %#v", matches)
		}
		created := run(t, "task", "create", "--project=project1", "--template=request", "--field", "summary=CLI task", "--field", "body=Created from CLI")
		if !strings.Contains(created, `"template"`) || strings.Contains(created, `"selfDriving"`) {
			t.Fatalf("content template exposed removed execution metadata: %s", created)
		}
		var createdTask app.Task
		if err := json.Unmarshal([]byte(created), &createdTask); err != nil {
			t.Fatal(err)
		}
		var detail app.ResourceDetailView
		if err := json.Unmarshal([]byte(run(t, "workspace", "resource", "--id=project1.task1", "--json")), &detail); err != nil {
			t.Fatal(err)
		}
		if detail.Template == nil || createdTask.Template == nil || detail.Template.Digest != createdTask.Template.Digest {
			t.Fatalf("workspace resource omitted template source: %#v", detail)
		}
		if _, err := runErr(t, "task", "create", "Bad", "--project=project1", "--template=request", "--detail=conflict"); err == nil || !strings.Contains(err.Error(), "mutually exclusive") {
			t.Fatalf("expected mutually exclusive template inputs, got %v", err)
		}
	})
}

func TestTemplateValidateAndMigrateCLI(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "Migration project")
		dir := filepath.Join(root, "project1", "templates")
		legacy := "---\ntitle: Legacy\n---\n# Legacy\n"
		if err := os.WriteFile(filepath.Join(dir, "legacy.md"), []byte(legacy), 0o644); err != nil {
			t.Fatal(err)
		}
		if output := run(t, "template", "validate", "--project=project1", "--all"); !strings.Contains(output, "legacy\tvalid") {
			t.Fatalf("legacy template should be visible with a warning: %s", output)
		}
		preview := run(t, "template", "migrate", "--project=project1", "legacy")
		if !strings.Contains(preview, "schema-version: 2") || strings.Contains(readFile(t, filepath.Join(dir, "legacy.md")), "schema-version") {
			t.Fatalf("migration preview changed file or omitted output: %s", preview)
		}
		run(t, "template", "migrate", "--project=project1", "--write", "legacy")
		migrated := readFile(t, filepath.Join(dir, "legacy.md"))
		if !strings.Contains(migrated, "schema-version: 2") {
			t.Fatalf("legacy template was not migrated:\n%s", migrated)
		}
		if err := os.WriteFile(filepath.Join(dir, "broken.md"), []byte("---\nschema-version: 2\ntitle: Broken\nautorun: true\nfields: []\n---\nBody\n"), 0o644); err != nil {
			t.Fatal(err)
		}
		output, err := runErr(t, "template", "validate", "--project=project1", "--all", "--json")
		if err == nil || !strings.Contains(output, "unknown_property") {
			t.Fatalf("expected invalid template and non-zero exit: err=%v output=%s", err, output)
		}
	})
}

func TestTemplateShowIncludesBodyAndPreservesOutputModes(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		run(t, "project", "create", "Template project")
		body := "# {{ summary }}\n\nExecution rule: inspect every configured input.\n" + strings.Repeat("Long rule text must remain visible.\n", 128) + "\nAcceptance: preserve every line.\n"
		source := "---\nschema-version: 2\ntitle: Request\ndescription: Capture a concrete change.\ntask-title: \"{{ summary }}\"\nfields:\n  - name: summary\n    type: text\n    label: Summary\n    description: The short task summary.\n    placeholder: e.g. fix template output\n    required: true\n  - name: priority\n    type: select\n    label: Priority\n    default: medium\n    options: [low, medium, high]\n---\n" + body
		path := filepath.Join(root, "project1", "templates", "request.md")
		if err := os.WriteFile(path, []byte(source), 0o644); err != nil {
			t.Fatal(err)
		}

		shown := run(t, "template", "show", "--project=project1", "request")
		for _, marker := range []string{
			"Name: request",
			"Description: Capture a concrete change.",
			"Fields:\n",
			"  - summary (text, required): Summary",
			"    Description: The short task summary.",
			"    Placeholder: e.g. fix template output",
			"  - priority (select, optional): Priority",
			"    Default: medium",
			"    Options: low, medium, high",
			"Markdown body:\n" + body,
		} {
			if !strings.Contains(shown, marker) {
				t.Fatalf("default template show output is missing %q:\n%s", marker, shown)
			}
		}

		if raw := run(t, "template", "show", "--project=project1", "--raw", "request"); raw != source {
			t.Fatalf("--raw changed the original template source:\nwant:\n%s\ngot:\n%s", source, raw)
		}
		var structured map[string]any
		if err := json.Unmarshal([]byte(run(t, "template", "show", "--project=project1", "--json", "request")), &structured); err != nil {
			t.Fatal(err)
		}
		if structured["content"] != source || structured["body"] != body || structured["valid"] != true {
			t.Fatalf("--json lost template content: %#v", structured)
		}
		var schema map[string]any
		if err := json.Unmarshal([]byte(run(t, "template", "show", "--project=project1", "--schema", "request")), &schema); err != nil {
			t.Fatal(err)
		}
		if schema["name"] != "request" || schema["schemaVersion"] != float64(2) || schema["digest"] == "" || schema["fields"] == nil {
			t.Fatalf("--schema changed schema output contract: %#v", schema)
		}
		if _, err := runErr(t, "template", "show", "--project=project1", "--json", "--schema", "request"); err == nil || !strings.Contains(err.Error(), "usage: forge template show") {
			t.Fatalf("expected mutually exclusive template show modes to return usage, got %v", err)
		}

		brokenBody := "# Broken rules\n\nThis body must remain inspectable even when the schema is invalid.\n"
		broken := "---\nschema-version: 2\ntitle: Broken\nautorun: true\nfields: []\n---\n" + brokenBody
		if err := os.WriteFile(filepath.Join(root, "project1", "templates", "broken.md"), []byte(broken), 0o644); err != nil {
			t.Fatal(err)
		}
		invalid := run(t, "template", "show", "--project=project1", "broken")
		for _, marker := range []string{"Status: invalid", "unknown_property", "Markdown body:\n" + brokenBody} {
			if !strings.Contains(invalid, marker) {
				t.Fatalf("invalid template show output is missing %q:\n%s", marker, invalid)
			}
		}
	})

	help := strings.Join(strings.Fields(run(t, "help")), " ")
	for _, marker := range []string{
		"show defaults to metadata, field requirements, diagnostics, and the complete Markdown body",
		"--raw for the original file, --json for structured template data,",
		"or --schema for schema metadata and diagnostics",
	} {
		if !strings.Contains(help, marker) {
			t.Fatalf("template show help is missing %q:\n%s", marker, help)
		}
	}
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

func readJSON(path string, value any) error {
	data, err := os.ReadFile(path)
	if err != nil {
		return err
	}
	return json.Unmarshal(data, value)
}

func pathExists(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}

func buildWorkspaceTree() (app.WorkspaceTree, error) {
	cwd, err := os.Getwd()
	if err != nil {
		return app.WorkspaceTree{}, err
	}
	workspace, err := app.OpenWorkspaceFrom(cwd)
	if err != nil {
		return app.WorkspaceTree{}, err
	}
	return workspace.Tree()
}

func writeTestResourceJSON(t *testing.T, path string, value any) {
	t.Helper()
	data, err := json.MarshalIndent(value, "", "  ")
	if err != nil {
		t.Fatal(err)
	}
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(path, append(data, '\n'), 0o644); err != nil {
		t.Fatal(err)
	}
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
