package app_test

import (
	"crypto/sha256"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/disksing/pua/internal/app"
)

const legacyEnglishWorkTemplateComment = `<!--
Optional modules. Copy only useful modules below this comment, keep them current, and delete empty modules.
Do not restate the task background, scope, acceptance criteria, or stable decisions here; keep those in task.md.

## Todo
Use for short-term actions needed by the next agent. Put completed history in log.jsonl.
- [ ] Next concrete action.

## Blockers
Use only when work cannot continue without user input or an external change.
- Blocker: what is blocked, what is needed, and who or what can resolve it.

## Active Work
Use when there is an in-progress implementation, investigation, or review thread with local state worth preserving.
- Focus: current thread.
- Files: relevant paths.
- Notes: state needed to resume.

## Paused Work
Use when temporarily switching away from unfinished work.
- Paused thread: where to resume, why it paused, and what should happen next.

## Resume Plan
Use after interruption or handoff when order matters.
1. First recovery step.
2. Next recovery step.

## Context
Use for useful transient context that is not durable enough for task.md.
- Fact, assumption, or constraint relevant to resuming.

## Resources
Use for unpredictable links and external ids that do not belong in task.json.
- PR: URL or id.
- CI: run id or URL.
- Image: tag.
- Deployment: URL.
- Related task: id.

## Verification
Use for checks already run or still needed when that helps the next agent.
- [x] Command or check that passed.
- [ ] Command or check not run yet.

## Notes
Use sparingly for recovery notes that do not fit another module.
- Note.
-->`

const legacyChineseWorkTemplateComment = `<!--
以下模块均为可选项。只保留当前有用的模块，并随执行进展更新；删除空模块。
不要在此重复任务背景、范围、验收标准或稳定决策；这些内容应保存在 task.md 中。

## 待办
用于记录下一位 agent 需要执行的短期行动。已完成的历史应写入 log.jsonl。
- [ ] 下一项具体行动。

## 阻塞
仅在缺少用户输入或外部状态变化，导致工作无法继续时使用。
- 阻塞原因：说明卡点、所需条件，以及由谁或什么来解决。

## 进行中的工作
用于记录值得保留的实现、调查或评审现场。
- 重点：当前工作线索。
- 文件：相关路径。
- 说明：恢复工作所需的状态。

## 暂停的工作
用于临时切换到其他事项时记录未完成工作。
- 暂停事项：从哪里恢复、为何暂停、下一步应做什么。

## 恢复计划
用于中断或交接后需要按顺序恢复的情况。
1. 第一个恢复步骤。
2. 下一个恢复步骤。

## 上下文
记录有助于恢复、但不适合写入长期任务约定的信息。
- 与恢复相关的事实、假设或约束。

## 资源
记录不适合放入 task.json 的链接和外部 ID。
- PR：URL 或 ID。
- CI：运行 ID 或 URL。
- 图片：标签。
- 部署：URL。
- 相关任务：ID。

## 验证
记录已执行或仍需执行的检查。
- [x] 已通过的命令或检查。
- [ ] 尚未执行的命令或检查。

## 备注
谨慎使用，仅记录不适合上述模块的恢复信息。
- 备注。
-->`

func TestLegacyTaskWorkMigrationIsDigestMarkedIdempotentAndScoped(t *testing.T) {
	root := t.TempDir()
	workspace, err := app.Initialize(root, "en")
	if err != nil {
		t.Fatal(err)
	}
	openProject, err := workspace.CreateProject("Open project", "open")
	if err != nil {
		t.Fatal(err)
	}
	openTask, err := workspace.CreateTask(app.CreateTaskInput{ProjectID: openProject.ID, Title: "Open task", Slug: "open"})
	if err != nil {
		t.Fatal(err)
	}
	defaultTask, err := workspace.CreateTask(app.CreateTaskInput{ProjectID: openProject.ID, Title: "Default task", Slug: "default"})
	if err != nil {
		t.Fatal(err)
	}
	archivedProject, err := workspace.CreateProject("Archived project", "archived")
	if err != nil {
		t.Fatal(err)
	}
	archivedTask, err := workspace.CreateTask(app.CreateTaskInput{ProjectID: archivedProject.ID, Title: "Archived task", Slug: "archived"})
	if err != nil {
		t.Fatal(err)
	}
	if _, err := workspace.ArchiveResource(archivedTask.ID); err != nil {
		t.Fatal(err)
	}
	if _, err := workspace.ArchiveResource(archivedProject.ID); err != nil {
		t.Fatal(err)
	}

	openPath := resourcePath(t, workspace, openTask.ID)
	defaultPath := resourcePath(t, workspace, defaultTask.ID)
	archivedPath := resourcePath(t, workspace, archivedTask.ID)
	openWork := "# Active work\n\nKeep this [decision](https://example.test/decision).\n\n" + legacyEnglishWorkTemplateComment + "\n\n```go\n<!-- preserve this code comment -->\n```\n"
	writeFile(t, filepath.Join(openPath, "work.md"), openWork)
	writeFile(t, filepath.Join(defaultPath, "work.md"), fmt.Sprintf("# Work\n\n## Focus\n\nTask %s has been created. Clarify the task contract in task.md, then record the current execution state and next action here.\n\n%s\n", defaultTask.ID, legacyEnglishWorkTemplateComment))
	archivedWork := "# 历史现场\n\n保留这条中文记录和 [链接](https://example.test/中文)。\n\n" + legacyChineseWorkTemplateComment + "\n"
	writeFile(t, filepath.Join(archivedPath, "work.md"), archivedWork)
	legacyDetail, err := workspace.Resource(openTask.ID)
	if err != nil {
		t.Fatal(err)
	}
	for _, file := range legacyDetail.Files {
		if file.Name == "work.md" {
			t.Fatal("legacy work.md must not be exposed as a task detail file")
		}
	}

	openSource := []byte(openWork)
	archivedSource := []byte(archivedWork)
	if err := workspace.Migrate("zh-CN"); err != nil {
		t.Fatal(err)
	}

	for _, path := range []string{filepath.Join(openPath, "work.md"), filepath.Join(defaultPath, "work.md"), filepath.Join(archivedPath, "work.md")} {
		if _, err := os.Stat(path); !os.IsNotExist(err) {
			t.Fatalf("legacy source should be removed: %s, err=%v", path, err)
		}
	}
	openTaskMD := readFile(t, filepath.Join(openPath, "task.md"))
	openDigest := digest(openSource)
	if !strings.Contains(openTaskMD, "source=work.md digest="+openDigest) || !strings.Contains(openTaskMD, "历史工作记录（由 work.md 迁移）") {
		t.Fatalf("open task.md lacks digest-marked migration chapter:\n%s", openTaskMD)
	}
	if !strings.Contains(openTaskMD, "Keep this [decision](https://example.test/decision).") || !strings.Contains(openTaskMD, "<!-- preserve this code comment -->") || strings.Contains(openTaskMD, "Optional modules. Copy only useful modules") {
		t.Fatalf("open migration did not preserve meaningful Markdown or strip only the known template:\n%s", openTaskMD)
	}
	defaultTaskMD := readFile(t, filepath.Join(defaultPath, "task.md"))
	if strings.Contains(defaultTaskMD, "Historical work record") || strings.Contains(defaultTaskMD, "forge:migration:work-md:v1") {
		t.Fatalf("default-only legacy content should not create a chapter:\n%s", defaultTaskMD)
	}
	archivedTaskMD := readFile(t, filepath.Join(archivedPath, "task.md"))
	if !strings.Contains(archivedTaskMD, "source=work.md digest="+digest(archivedSource)) || !strings.Contains(archivedTaskMD, "保留这条中文记录") || strings.Contains(archivedTaskMD, "以下模块均为可选项") {
		t.Fatalf("archived migration did not preserve Chinese content safely:\n%s", archivedTaskMD)
	}

	beforeOpen, beforeArchived := openTaskMD, archivedTaskMD
	if err := workspace.Migrate("zh-CN"); err != nil {
		t.Fatal(err)
	}
	if got := readFile(t, filepath.Join(openPath, "task.md")); got != beforeOpen || strings.Count(got, "forge:migration:work-md:v1") != 1 {
		t.Fatalf("repeated migration changed or duplicated open task chapter:\n%s", got)
	}
	if got := readFile(t, filepath.Join(archivedPath, "task.md")); got != beforeArchived || strings.Count(got, "forge:migration:work-md:v1") != 1 {
		t.Fatalf("repeated migration changed or duplicated archived task chapter:\n%s", got)
	}
}

func TestLegacyTaskWorkMigrationFailsClosedAndRecoversFromPreparedMarker(t *testing.T) {
	t.Run("digest conflict retains source", func(t *testing.T) {
		root := t.TempDir()
		workspace, taskPath := createMigrationFixture(t, root, "conflict")
		source := []byte("# User record\n")
		writeFile(t, filepath.Join(taskPath, "work.md"), string(source))
		marker := fmt.Sprintf("\n<!-- forge:migration:work-md:v1 source=work.md digest=%s -->\n## Historical work record (migrated from work.md)\n\nold\n", digest([]byte("different")))
		taskMDPath := filepath.Join(taskPath, "task.md")
		original := readFile(t, taskMDPath)
		writeFile(t, taskMDPath, original+marker)
		if err := workspace.Migrate("en"); err == nil || !strings.Contains(err.Error(), "project1.task1") || !strings.Contains(err.Error(), "work.md") {
			t.Fatalf("expected resource/path conflict, got %v", err)
		}
		if got := readFile(t, filepath.Join(taskPath, "work.md")); got != string(source) {
			t.Fatalf("conflict should retain source, got %q", got)
		}
		if got := readFile(t, taskMDPath); got != original+marker {
			t.Fatalf("conflict should retain task.md, got %q", got)
		}
	})

	t.Run("prepared marker is recoverable", func(t *testing.T) {
		root := t.TempDir()
		workspace, taskPath := createMigrationFixture(t, root, "prepared")
		source := []byte("# Prepared record\n\nKeep it.\n")
		writeFile(t, filepath.Join(taskPath, "work.md"), string(source))
		taskMDPath := filepath.Join(taskPath, "task.md")
		appendFile(t, taskMDPath, fmt.Sprintf("\n<!-- forge:migration:work-md:v1 source=work.md digest=%s -->\n## Historical work record (migrated from work.md)\n\nKeep it.\n", digest(source)))
		if err := workspace.Migrate("en"); err != nil {
			t.Fatal(err)
		}
		if _, err := os.Stat(filepath.Join(taskPath, "work.md")); !os.IsNotExist(err) {
			t.Fatalf("prepared marker should allow source cleanup, err=%v", err)
		}
		if got := strings.Count(readFile(t, taskMDPath), "forge:migration:work-md:v1"); got != 1 {
			t.Fatalf("prepared marker should remain singular, count=%d", got)
		}
	})

	t.Run("unsafe source retains symlink", func(t *testing.T) {
		root := t.TempDir()
		workspace, taskPath := createMigrationFixture(t, root, "symlink")
		outside := filepath.Join(root, "outside.md")
		writeFile(t, outside, "outside\n")
		if err := os.Symlink(outside, filepath.Join(taskPath, "work.md")); err != nil {
			t.Skipf("symlinks unavailable: %v", err)
		}
		if err := workspace.Migrate("en"); err == nil || !strings.Contains(err.Error(), "work.md") {
			t.Fatalf("expected symlink migration failure, got %v", err)
		}
		if _, err := os.Lstat(filepath.Join(taskPath, "work.md")); err != nil {
			t.Fatalf("symlink source should remain: %v", err)
		}
		if got := readFile(t, outside); got != "outside\n" {
			t.Fatalf("migration followed symlink: %q", got)
		}
	})

	t.Run("nonregular task markdown retains source", func(t *testing.T) {
		root := t.TempDir()
		workspace, taskPath := createMigrationFixture(t, root, "nonregular")
		writeFile(t, filepath.Join(taskPath, "work.md"), "# Keep source\n")
		taskMDPath := filepath.Join(taskPath, "task.md")
		if err := os.Remove(taskMDPath); err != nil {
			t.Fatal(err)
		}
		if err := os.Mkdir(taskMDPath, 0o755); err != nil {
			t.Fatal(err)
		}
		if err := workspace.Migrate("en"); err == nil || !strings.Contains(err.Error(), "task.md") {
			t.Fatalf("expected task.md write/read failure, got %v", err)
		}
		if _, err := os.Stat(filepath.Join(taskPath, "work.md")); err != nil {
			t.Fatalf("source should remain after task.md failure: %v", err)
		}
	})
}

func createMigrationFixture(t *testing.T, root, slug string) (*app.Workspace, string) {
	t.Helper()
	workspace, err := app.Initialize(root, "en")
	if err != nil {
		t.Fatal(err)
	}
	project, err := workspace.CreateProject("Migration project", slug)
	if err != nil {
		t.Fatal(err)
	}
	task, err := workspace.CreateTask(app.CreateTaskInput{ProjectID: project.ID, Title: "Migration task", Slug: "task"})
	if err != nil {
		t.Fatal(err)
	}
	return workspace, resourcePath(t, workspace, task.ID)
}

func resourcePath(t *testing.T, workspace *app.Workspace, id string) string {
	t.Helper()
	value, err := workspace.ResourceValue(id)
	if err != nil {
		t.Fatal(err)
	}
	return filepath.Join(workspace.Root(), filepath.FromSlash(value.Path))
}

func digest(data []byte) string {
	sum := sha256.Sum256(data)
	return fmt.Sprintf("sha256:%x", sum)
}

func writeFile(t *testing.T, path, content string) {
	t.Helper()
	if err := os.WriteFile(path, []byte(content), 0o644); err != nil {
		t.Fatal(err)
	}
}

func appendFile(t *testing.T, path, content string) {
	t.Helper()
	file, err := os.OpenFile(path, os.O_WRONLY|os.O_APPEND, 0o644)
	if err != nil {
		t.Fatal(err)
	}
	defer file.Close()
	if _, err := file.WriteString(content); err != nil {
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
