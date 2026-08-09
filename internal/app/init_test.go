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
			for _, path := range paths {
				data, err := os.ReadFile(path)
				if err != nil {
					t.Fatalf("read generated %s: %v", path, err)
				}
				for _, want := range tc.anchors {
					if !strings.Contains(string(data), want) {
						t.Fatalf("generated %s is missing %q:\n%s", path, want, data)
					}
				}
			}
		})
	}
}
