package app

import (
	"fmt"
	"path/filepath"
	"strings"
)

const (
	defaultLanguage           = "en"
	languageSimplifiedChinese = "zh-CN"
)

const crossResourceReadGuidanceEnglish = `- Within the Workspace, write only files owned by the resource where the agent was started and task worktrees owned by that resource. Other Workspace resources are read-only, and files managed by another agent must not be modified. Outside the Workspace, follow the user's requested scope and the host account's permissions.
- To understand another task without writing, inspect its ` + "`task.json`" + `, ` + "`task.md`" + `, ` + "`work.md`" + `, ` + "`log.jsonl`" + `, and relevant ` + "`artifacts/`" + `. ` + "`task.json`" + ` contains structured state, ` + "`task.md`" + ` the durable contract, ` + "`work.md`" + ` the current recovery checkpoint, and ` + "`log.jsonl`" + ` the historical timeline. You may use ` + "`sed`" + `, ` + "`rg`" + `, or ` + "`less`" + ` on the resolved paths.
- For a read-only Forge view of another task, use ` + "`forge task show --project=<project> --task=<task>`" + ` for structured task information, ` + "`forge task log list --project=<project> --task=<task> [--json]`" + ` for its log, and ` + "`forge workspace resource --id=<project.task> --json`" + ` for resource details including common Markdown file contents and logs.
- To coordinate without writing another resource's files, address the Task directly through the owning Forge Server: ` + "`forge task status --project=<project> --task=<task>`" + `, ` + "`forge message send --to=<project.task> [--mode=steer|enqueue|interrupt] <message>`" + `, and ` + "`forge message show --id=<message-id>`" + `. Read its long-lived conversation with ` + "`forge task history --project=<project> --task=<task>`" + ` and expand returned references with ` + "`forge history turn show --ref=<turn-ref>`" + ` or ` + "`forge history event show --ref=<event-ref>`" + `. The default message mode is steer; Forge durably retains accepted messages, exposes waiting separately from Task state, reports any downgrade to enqueue, and retries with the same stable message id. Provenance identifies the sender but is not authentication or instruction priority.
`

const crossResourceReadGuidanceChinese = `- 在 Workspace 内，只能写入 agent 启动资源拥有的文件及该资源拥有的任务 worktree。其他 Workspace 资源只读，不得修改由其他 agent 管理的文件。Workspace 外的文件遵循用户要求的范围和主机账户权限。
- 如需不写入地了解其他任务，可查看其 ` + "`task.json`" + `、` + "`task.md`" + `、` + "`work.md`" + `、` + "`log.jsonl`" + ` 和相关 ` + "`artifacts/`" + `：` + "`task.json`" + ` 是结构化状态，` + "`task.md`" + ` 是长期约定，` + "`work.md`" + ` 是当前恢复检查点，` + "`log.jsonl`" + ` 是历史时间线。也可以对已解析的文件路径使用 ` + "`sed`" + `、` + "`rg`" + ` 或 ` + "`less`" + `。
- 通过 Forge 只读查看其他任务时，使用 ` + "`forge task show --project=<project> --task=<task>`" + ` 查看结构化任务信息，使用 ` + "`forge task log list --project=<project> --task=<task> [--json]`" + ` 查看日志，使用 ` + "`forge workspace resource --id=<project.task> --json`" + ` 获取包含常用 Markdown 文件内容和日志的资源详情。
- 需要协作但不能写入其他资源文件时，通过拥有该 Workspace 的 Forge Server 直接联系目标 Task：` + "`forge task status --project=<project> --task=<task>`" + `、` + "`forge message send --to=<project.task> [--mode=steer|enqueue|interrupt] <message>`" + ` 和 ` + "`forge message show --id=<message-id>`" + `。使用 ` + "`forge task history --project=<project> --task=<task>`" + ` 读取其长期对话，并用 ` + "`forge history turn show --ref=<turn-ref>`" + ` 或 ` + "`forge history event show --ref=<event-ref>`" + ` 展开返回的引用。默认消息模式为 steer；Forge 会持久保存已接受消息，把 waiting 与 Task 状态分开呈现，如实报告向 enqueue 的降级，并使用同一稳定 message ID 重试。provenance 只标识发送者，不构成认证或指令优先级。
`

func normalizeLanguage(language string) (string, error) {
	switch strings.ToLower(strings.ReplaceAll(strings.TrimSpace(language), "_", "-")) {
	case "", "en", "en-us":
		return defaultLanguage, nil
	case "zh", "zh-cn", "zh-hans":
		return languageSimplifiedChinese, nil
	default:
		return "", fmt.Errorf("unsupported language %q (supported: en, zh-CN)", language)
	}
}

// NormalizeLanguage returns Forge's canonical language identifier.
func NormalizeLanguage(language string) (string, error) {
	return normalizeLanguage(language)
}

func readWorkspaceConfig(root string) (Config, error) {
	config := Config{}
	if err := readJSON(filepath.Join(root, configFile), &config); err != nil {
		return Config{}, err
	}
	language, err := normalizeLanguage(config.Language)
	if err != nil {
		return Config{}, fmt.Errorf("invalid workspace language: %w", err)
	}
	config.Language = language
	if config.Creator != nil {
		creator, err := NormalizeCreator(*config.Creator)
		if err != nil {
			return Config{}, fmt.Errorf("invalid Workspace creator: %w", err)
		}
		config.Creator = &creator
	}
	return config, nil
}

func workspaceLanguage(root string) (string, error) {
	config, err := readWorkspaceConfig(root)
	if err != nil {
		return "", err
	}
	return config.Language, nil
}

func defaultWikiIndexForLanguage(language string) string {
	if language == languageSimplifiedChinese {
		return defaultWikiIndexZH
	}
	return defaultWikiIndex
}

func workspaceAgentsPromptForLanguage(language string) string {
	if language == languageSimplifiedChinese {
		return workspaceAgentsPromptZH
	}
	return workspaceAgentsPrompt
}

func localizedCreationLogTitle(resource Resource, language string) string {
	if language == languageSimplifiedChinese {
		if isProject(resource) {
			return "项目已创建"
		}
		return "任务已创建"
	}
	if isProject(resource) {
		return "Project created"
	}
	return "Task created"
}

func taskMarkdownZH(title, detail string) string {
	detail = strings.TrimSpace(detail)
	if detail == "" {
		detail = "<!-- 说明这项工作为何存在。只在此记录长期有效的任务约定；执行状态应放在 work.md 中。 -->"
	}
	return fmt.Sprintf(`# %s

## 背景

%s

## 范围

<!-- 定义包含的工作。若会影响任务约定，请补充不在范围内的事项、约束、决策或待确认问题。 -->

## 验收标准

<!-- 列出可观察、可验证的完成条件。 -->
- 待定
`, title, detail)
}

func projectMarkdownZH(title, detail string) string {
	detail = strings.TrimSpace(detail)
	if detail == "" {
		detail = "<!-- 说明此项目为何存在，并在这里维护长期有效的项目约定。 -->"
	}
	return fmt.Sprintf(`# %s

## 背景

%s

## 范围

<!-- 定义包含的工作。若会影响项目约定，请补充不在范围内的事项、约束、决策或待确认问题。 -->

## 验收标准

<!-- 列出可观察、可验证的完成条件。 -->
- 待定
`, title, detail)
}

func defaultWorkMDZH(resource Resource) string {
	meta := resource.resourceMeta()
	return fmt.Sprintf(`# 工作记录

## 当前重点

任务 %s 已创建。先在 task.md 中明确任务约定，再在此记录当前执行状态和下一步行动。

<!--
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
-->
`, meta.ID)
}

func taskAgentsPromptZH(resource Resource) string {
	title := "任务 Agent 指引"
	scope := "AgentWorkspace 任务目录"
	readLine := "执行前读取 task.json、task.md、work.md 和 log.jsonl。"
	boundary := "将此目录视为当前任务边界。"
	writeScope := "任务边界是避免多 agent 冲突的默认保护措施，并非绝对限制。用户的明确指令可以授权操作此任务目录之外的主机文件；但不得修改其他 agent 管理的 Workspace 资源。"
	repoGuidance := "如需修改代码，请在 worktree/ 下创建 Git worktree。执行 `git worktree add` 时，目标必须使用此任务 worktree/ 目录内的绝对路径；当命令使用 `git -C` 时，相对目标会从共享仓库解析，可能把 worktree 错放到任务目录之外。"
	updateLine := "如果任务涉及新仓库，请更新此任务的 task.json。"
	structuredLine := "task.json 只记录 Forge 已理解的结构化事实；任意说明、链接、ID 和进度应使用 Markdown。"
	backgroundLine := "将 task.md 作为长期有效的任务约定：记录工作原因、范围和非范围、持续有效的约束与决策，以及完成判定方式。"
	recoveryLine := "将 work.md 作为可替换的恢复检查点：只记录当前重点、下一步行动、阻塞以及恢复所需状态；不要重复任务约定或追加已完成步骤的历史。仅在有用时保留可选模块，删除空模块，并将任意资源链接或 ID 放入“资源”。"
	pendingLine := "可能改变范围、验收标准或稳定约束的问题应保存在 task.md 中，并在实现前请用户确认。短期执行问题放在 work.md 中。调查形成长期决策后，将其提升到 task.md，并从 work.md 删除临时说明。"
	agentsLine := "总是读取父项目 AGENTS.md（../AGENTS.md）和 workspace 根目录的 AGENTS.md（../../AGENTS.md），了解项目约定和全局 Workspace 文件职责规则。"
	extra := `
- 此任务属于一个项目。需要更广泛的上下文时，读取父项目目录中的 project.json、project.md 和 log.jsonl。
- 父项目文件仅作参考；除非用户明确要求，否则修改应限定在此任务目录及其 worktree 中。
- 创建任务时，如果存在适用的现有模板，应优先使用该模板。
- 通过模板创建任务时，默认保留模板已有的全部规则；不得删除、弱化、绕过或无意覆盖，只有用户明确要求覆盖某一项规则时才可针对该项覆盖。
`
	if isProject(resource) {
		title = "项目 Agent 指引"
		scope = "AgentWorkspace 项目目录"
		readLine = "执行前读取 project.json、project.md 和 log.jsonl。"
		boundary = "将此目录视为当前项目边界。"
		writeScope = "除非已明确选择某个任务目录，否则只更新此项目目录内的文件。"
		repoGuidance = "项目不管理仓库或 worktree。如需修改代码，请创建任务，并把任务专用的 Git worktree 放在该任务的 worktree/ 目录下。"
		updateLine = "需要仓库或 worktree 状态时，创建或更新任务；不要在项目上保存仓库元数据。"
		structuredLine = "project.json 只记录 Forge 已理解的结构化事实；任意说明、链接、ID 和进度应使用 Markdown。"
		backgroundLine = "将 project.md 作为长期有效的项目约定：记录工作原因、范围和非范围、持续有效的约束与决策，以及完成判定方式。"
		recoveryLine = "短期实现状态应放在任务的 work.md 中；项目自身没有 work.md 恢复快照。"
		pendingLine = "可能改变项目范围、验收标准或稳定约束的问题应保存在 project.md 中；需要时请用户确认，并把长期有效的答案记录在那里。"
		agentsLine = "总是读取 workspace 根目录的 AGENTS.md（../AGENTS.md），了解全局 Workspace 文件职责规则。"
		extra = `
- 项目内容模板位于 templates/*.md。使用 schema-version: 2，并声明 title、可选 description/task-title、fields 和 Markdown 正文；字段类型支持 text、textarea、select、boolean。
- 模板只组织任务内容，不包含运行时 Agent 或 Session 设置。
- 创建任务时，如果存在适用的现有模板，应优先使用该模板。
- 通过模板创建任务时，默认保留模板已有的全部规则；不得删除、弱化、绕过或无意覆盖，只有用户明确要求覆盖某一项规则时才可针对该项覆盖。
- 模板格式：

  ` + "```markdown" + `
  ---
  schema-version: 2
  title: 每日检查
  task-title: "{{ summary }}"
  fields:
    - name: summary
      type: text
      label: 检查概述
      required: true
  ---
  # {{ summary }}
  ` + "```" + `

- 使用 forge template list/show/validate/render/create/migrate 确定性地检查和迁移模板，也可直接编辑或删除文件。创建后的任务是独立副本，只保留来源 name、schema version 和 digest。
`
	}
	return fmt.Sprintf(`# %s

你正在一个 %s中工作。

- %s
- %s
- %s
`+crossResourceReadGuidanceChinese+`- %s
- 将 workspace 的 repos/ checkout 视为共享源码缓存；代码修改应在任务 worktree 中进行。
- %s
- %s
- %s
- %s
- %s
- %s
- 在任务中工作时，使用 `+"`forge task log add <title> --details <details>`"+` 记录重要执行事件；在项目中工作时使用 `+"`forge project log add <title> --details <details>`"+`。
- 生成的报告、截图、补丁和其他输出应放在 artifacts/ 下。
%s
`, title, scope, agentsLine, readLine, boundary, writeScope, repoGuidance, updateLine, structuredLine, backgroundLine, recoveryLine, pendingLine, extra)
}

const defaultWikiIndexZH = `# Workspace Wiki

此索引是 workspace 长期知识的入口。随着 Wiki 内容增长，请在这里添加主题页面链接及简短摘要。
`

const workspaceAgentsPromptZH = `# AgentWorkspace

此目录是由 Forge 管理的 AgentWorkspace。

- 所有 workspace 数据都以文件系统形式保存，包括项目/任务目录、JSON/Markdown 文件、日志、产物和任务 worktree。
- 与 workspace 代码、项目和工作历史有关的长期知识保存在 ` + "`wiki/`" + ` 中。
- 开始此 workspace 中的工作前，请读取 ` + "`wiki/index.md`" + `。
- 根据索引只读取与当前任务相关的 Wiki 页面，不要无差别加载整个 Wiki。
- 当用户要求分析代码、项目或工作记录并更新 Wiki 时，请维护相关页面、交叉链接和 ` + "`wiki/index.md`" + ` 摘要。
` + crossResourceReadGuidanceChinese + `- Workspace 文件边界依靠提示词协调，不是主机文件系统沙箱。
- 开放项目直接位于 workspace 下的 ` + "`projectN/`" + ` 或 ` + "`projectN-slug/`" + ` 目录。
- 项目任务直接位于项目目录下简短的 ` + "`taskM/`" + ` 或 ` + "`taskM-slug/`" + ` 目录；资源 ID 仍是 ` + "`projectN.taskM`" + ` 形式的完整 ID。
- 已归档项目位于 ` + "`archive/`" + `。已归档项目任务位于其项目目录下的 ` + "`archive/`" + `。
- 项目内容模板位于各项目的 ` + "`templates/`" + ` 目录。
- 在项目中创建任务时，应检查该项目的 ` + "`templates/`" + ` 目录；如果存在适用的现有模板，应优先使用该模板。
- 通过模板创建任务时，默认保留模板已有的全部规则；不得删除、弱化、绕过或无意覆盖，只有用户明确要求覆盖某一项规则时才可针对该项覆盖。
- Git 仓库默认以普通 checkout 形式位于 ` + "`repos/`" + `。
- 将 ` + "`repos/`" + ` 下的仓库视为共享源码缓存；代码修改应在任务 worktree 中进行。
- 项目拥有 ` + "`project.json`" + `、` + "`project.md`" + `、` + "`log.jsonl`" + `、` + "`AGENTS.md`" + ` 和 ` + "`artifacts/`" + `。
- 任务拥有 ` + "`task.json`" + `、` + "`task.md`" + `、` + "`work.md`" + `、` + "`log.jsonl`" + `、` + "`AGENTS.md`" + `、` + "`artifacts/`" + ` 和 ` + "`worktree/`" + `。
- 项目不保存仓库元数据，也不管理 worktree。代码修改应先创建任务，再把任务专用的 Git worktree 放入当前任务的 ` + "`worktree/`" + ` 目录。
- 只读检查其他任务目录不需要额外加锁；按上述状态文件和 Forge 命令指引查看。
- 只更新当前处理的项目/任务目录及其拥有的任务 worktree。
- ` + "`project.json`" + ` 和 ` + "`task.json`" + ` 只记录结构化事实，不记录进度说明。
- 将 ` + "`project.md`" + ` 和 ` + "`task.md`" + ` 视为长期有效的约定。把工作原因、范围和非范围、验收标准、稳定约束、长期决策和会改变约定的待确认问题记录在那里。
- 将任务的 ` + "`work.md`" + ` 视为可替换的恢复检查点。只记录当前重点、下一步行动、阻塞和恢复所需状态；不要重复任务约定。
- 仅在有用时使用 ` + "`Todo`" + `、` + "`Blockers`" + `、` + "`Active Work`" + `、` + "`Paused Work`" + `、` + "`Resume Plan`" + `、` + "`Context`" + `、` + "`Resources`" + `、` + "`Verification`" + ` 和 ` + "`Notes`" + ` 等可选 ` + "`work.md`" + ` 模块。删除空模块，并把任意链接或外部 ID 放入 ` + "`Resources`" + `。
- 开始有风险、耗时或可能中断的任务前，更新任务的 ` + "`work.md`" + `，写明当前重点和有用的可选模块。
- 每完成一个连贯步骤后，立即更新任务的 ` + "`work.md`" + `，写明新的重点和有用模块；删除空模块。
- 将 ` + "`log.jsonl`" + ` 视为只追加的时间线。重要事件和已完成步骤的历史放在日志中；当前状态不要写进日志，历史不要堆在 ` + "`work.md`" + `。
- 可能改变范围、验收标准或稳定约束的问题应保存在相应 brief 中。短期执行问题放在 ` + "`work.md`" + `；形成长期答案后，将其提升到 brief 并删除临时说明。
- 使用 ` + "`forge task log add <title> --details <details>`" + ` 或 ` + "`forge project log add <title> --details <details>`" + ` 记录重要执行事件。
- 创建、列出和归档任务时优先使用 Forge 命令。
- 项目和任务的 ` + "`AGENTS.md`" + ` 是简短的启动卡片。全局操作规则放在这里，背景放在 ` + "`project.md`" + `/` + "`task.md`" + `，任务恢复状态放在任务 ` + "`work.md`" + `，时间线历史放在 ` + "`log.jsonl`" + `。

## forge CLI

使用 Forge 执行确定性的 workspace 操作：

` + "```bash" + `
forge init [--language=<language>] [--creator=user|agent]
forge migrate [--language=<language>]

forge repo add [--bare] <name> <url>
forge repo list

forge project create [--slug <slug>] [--creator=user|agent] <description>
forge project list [--all]
forge project show [--project=<project>]
forge project archive [--project=<project>]
forge project log add [--project=<project>] [--details <text>|--details -] <title>
forge project log list [--project=<project>] [--json]

forge template list|show|validate|render|create|migrate ...

forge task create [<title>] [--project=<project>] [--slug <slug>] [--creator=user|agent] [--detail <detail>|--task-markdown <markdown>|--template=<name>] [--field <name>=<value>...] [--fields <file>] [--dry-run]
forge task list [--project=<project>] [--all]
forge task show [--project=<project>] [--task=<task>]
forge task archive [--project=<project>] [--task=<task>]
forge task log add [--project=<project>] [--task=<task>] [--details <text>|--details -] <title>
forge task log list [--project=<project>] [--task=<task>] [--json]
forge task repo add [--project=<project>] [--task=<task>] <repo-name> [--worktree <path>] [--branch <branch>] [--target <branch>] [--base <branch>]
forge task repo list [--project=<project>] [--task=<task>]
forge task repo remove [--project=<project>] [--task=<task>] <repo-name>
forge session list
forge session show --id=<id>

forge workspace tree --json
forge workspace resource --id=<resource> --json

forge serve [--addr=<address>] [--workspace=<path>] [--version]
` + "```" + `

说明：

- ` + "`forge init`" + ` 在当前目录创建新 workspace；在已有 workspace 内执行会失败。使用 ` + "`--language`" + ` 选择 ` + "`en`" + ` 或 ` + "`zh-CN`" + `。
- ` + "`forge migrate`" + ` 刷新 workspace 中由 Forge 管理的 ` + "`AGENTS.md`" + ` 提示词；使用 ` + "`--language`" + ` 可切换 workspace 语言。
- ` + "`forge repo add`" + ` 默认创建普通 checkout；需要使用 bare repository layout 时传入 ` + "`--bare`" + `。
- ` + "`forge init`" + `、` + "`forge project create`" + ` 和 ` + "`forge task create`" + ` 接受 ` + "`--creator=user|agent`" + `。有效的 Forge 资源环境默认记录 Agent 来源，其他调用默认记录 user；creator 只表示来源，不代表权限。
- 资源创建仅在本地完成，不附带初始消息，也不创建 generation。创建成功后应单独使用 ` + "`forge message send --to=<resource> ...`" + ` 发送第一条消息；消息被接受后才按需创建 generation。若创建命令输出结果不明，应先查询资源，再决定是否再次创建。
- ` + "`forge project create`" + ` 创建新的开放项目目录。使用 ` + "`--slug <slug>`" + ` 可在不改变项目 ID 的情况下追加可读目录后缀。
- ` + "`forge project list`" + ` 列出开放项目，传入 ` + "`--all`" + ` 时同时列出归档项目。它不会包含任务；项目任务使用 ` + "`forge task list [--project=<project>]`" + `。
- ` + "`forge project show`" + ` 和 ` + "`forge project archive`" + ` 接受 ` + "`--project=<project>`" + `；project 可为 ` + "`project22`" + ` 形式的完整 ID 或 ` + "`22`" + ` 形式的数字。省略时使用当前目录所属项目。
- ` + "`forge template list/show/validate/render/create/migrate`" + ` 管理 schema V2 项目内容模板；模板只描述任务内容。
- ` + "`forge task create`" + ` 在项目下创建开放任务目录。使用 ` + "`--template`" + ` 和结构化字段渲染内容，` + "`--dry-run`" + ` 可无副作用预览；原有 ` + "`--detail`" + ` 与 ` + "`--task-markdown`" + ` 形式保持兼容。
- ` + "`forge task list`" + ` 列出项目下的开放任务，传入 ` + "`--all`" + ` 时同时列出归档任务。使用 ` + "`--project`" + ` 选择项目，省略时使用当前目录所属项目。
- ` + "`forge task show`" + ` 和 ` + "`forge task archive`" + ` 接受 ` + "`--project`" + ` 及 ` + "`--task`" + `。task 可为 ` + "`task4`" + ` 或 ` + "`4`" + `。省略时使用当前目录所属任务。
- ` + "`forge task archive`" + ` 将开放任务移入项目的 archive；` + "`forge project archive`" + ` 将开放项目移入 workspace 的 ` + "`archive/`" + `。
- ` + "`forge task log add/list`" + ` 和 ` + "`forge project log add/list`" + ` 读写结构化 ` + "`log.jsonl`" + `。日志按最新优先显示，` + "`--details -`" + ` 从标准输入读取多行详情。
- ` + "`forge task repo add/list/remove`" + ` 在任务的 ` + "`task.json`" + ` 中记录、列出或删除相关仓库。任务选择规则与 ` + "`forge task show`" + ` 相同。项目不保存仓库元数据。
- ` + "`forge session list`" + ` 和 ` + "`forge session show --id=<id>`" + ` 仅用于只读诊断 ` + "`forge serve`" + ` 管理的瞬态 AgentHub Session 投影；它们不会创建、修改、结束、接管或访问 AgentHub Session。
- ` + "`forge workspace tree --json`" + ` 输出包含开放项目、开放任务和活动 session 的轻量 JSON 树，供 GUI 和工具集成使用。
- ` + "`forge workspace resource --id=<resource> --json`" + ` 输出单个项目或任务的详情 JSON。
- creator Turn 结果和消息投递终态通知会作为持久、结构化的 system 消息进入资源 mailbox。诊断时使用 ` + "`forge message show`" + `，并用稳定引用调用 ` + "`forge history turn show`" + `。
`
