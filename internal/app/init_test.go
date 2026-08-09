package app_test

import (
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/disksing/forge/internal/app"
)

func TestGeneratedAgentCardsUseStrictAutoRunSuspendGuidance(t *testing.T) {
	cases := []struct {
		name     string
		language string
		anchors  []string
	}{
		{
			name:     "English",
			language: "en",
			anchors: []string{
				"AutoRun suspend is allowed only when the task cannot make meaningful progress",
				"repeated polling of a specific, observable external condition",
				"implementation, testing, investigation, review, documentation, repair, or verification remains",
				"do not use suspend for a finished phase, a checkpoint or save-progress step, shortening a turn, or yielding early",
				"--summary=<text>",
				"--wake-condition=<text>",
				"Use complete only after task requirements and appropriate verification",
				"pause for a user decision, authorization, or manual handling",
				"fail only when no feasible safe path remains",
				"prefer an existing suitable template",
				"preserve all existing template rules by default",
				"override a particular rule only when the user explicitly asks for that override",
				"Read-only inspection of other project/task resources does not change them and needs no additional Forge lock.",
				"Only when writing to a project/task outside the resource already locked for this session",
				"relevant `artifacts/`",
				"task.json` contains structured state",
				"task.md` the durable contract",
				"work.md` the current recovery checkpoint",
				"log.jsonl` the historical timeline",
				"You may use `sed`, `rg`, or `less` on the resolved paths.",
				"forge task show --project=<project> --task=<task>",
				"forge task log list --project=<project> --task=<task> [--json]",
				"forge workspace resource --id=<project.task> --json",
				"forge session lock --id=$FORGE_SESSION_ID",
				"forge session unlock --id=$FORGE_SESSION_ID",
			},
		},
		{
			name:     "Simplified Chinese",
			language: "zh-CN",
			anchors: []string{
				"AutoRun suspend 仅适用于任务无法继续推进、剩余唯一有意义的动作是反复轮询一个具体且可观察的外部条件",
				"实现、测试、调查、评审、文档、修复或验证工作可做",
				"不得把 suspend 用于阶段完成、checkpoint 或保存进度、缩短回合或主动让出执行权",
				"--summary=<text>",
				"--wake-condition=<text>",
				"只有需求和适当验证完成后才使用 complete",
				"需要用户决定、授权或人工处理时使用 pause",
				"当前约束下没有可行安全路径时才使用 fail",
				"如果存在适用的现有模板，应优先使用",
				"默认保留模板已有的全部规则",
				"只有用户明确要求覆盖某一项规则时才可针对该项覆盖",
				"只读检查其他项目/任务资源不会改变资源，因此不需要额外的 Forge 锁。",
				"只有准备写入当前 session 已锁定资源之外的项目/任务时",
				"相关 `artifacts/`",
				"`task.json` 是结构化状态",
				"`task.md` 是长期约定",
				"`work.md` 是当前恢复检查点",
				"`log.jsonl` 是历史时间线",
				"对已解析的文件路径使用 `sed`、`rg` 或 `less`",
				"forge task show --project=<project> --task=<task>",
				"forge task log list --project=<project> --task=<task> [--json]",
				"forge workspace resource --id=<project.task> --json",
				"forge session lock --id=$FORGE_SESSION_ID",
				"forge session unlock --id=$FORGE_SESSION_ID",
			},
		},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			workspace, err := app.Initialize(t.TempDir(), tc.language)
			if err != nil {
				t.Fatalf("initialize workspace: %v", err)
			}
			project, err := workspace.CreateProject("Guidance project", "guidance")
			if err != nil {
				t.Fatalf("create project: %v", err)
			}
			task, err := workspace.CreateTask(app.CreateTaskInput{ProjectID: project.ID, Title: "Guidance task", Slug: "guidance"})
			if err != nil {
				t.Fatalf("create task: %v", err)
			}
			projectResource, err := workspace.Resource(project.ID)
			if err != nil {
				t.Fatalf("read project resource: %v", err)
			}
			taskResource, err := workspace.Resource(task.ID)
			if err != nil {
				t.Fatalf("read task resource: %v", err)
			}
			paths := []string{
				filepath.Join(workspace.Root(), "AGENTS.md"),
				filepath.Join(workspace.Root(), projectResource.Path, "AGENTS.md"),
				filepath.Join(workspace.Root(), taskResource.Path, "AGENTS.md"),
			}
			assertGuidance := func(stage string) {
				t.Helper()
				for _, path := range paths {
					data, err := os.ReadFile(path)
					if err != nil {
						t.Fatalf("read generated %s card after %s: %v", path, stage, err)
					}
					for _, want := range tc.anchors {
						if !strings.Contains(string(data), want) {
							t.Fatalf("generated %s card after %s is missing %q:\n%s", path, stage, want, data)
						}
					}
					if strings.Contains(string(data), "forge task work show") {
						t.Fatalf("generated %s card after %s references nonexistent forge task work show command:\n%s", path, stage, data)
					}
				}
			}
			assertGuidance("create")
			if err := workspace.Migrate(tc.language); err != nil {
				t.Fatalf("migrate workspace: %v", err)
			}
			assertGuidance("migrate")
		})
	}
}
