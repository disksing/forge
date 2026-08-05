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

func parseLanguageOption(args []string, fallback string) (string, error) {
	language, err := normalizeLanguage(fallback)
	if err != nil {
		return "", err
	}
	seen := false
	for i := 0; i < len(args); i++ {
		arg := args[i]
		value := ""
		switch {
		case strings.HasPrefix(arg, "--language="):
			value = strings.TrimPrefix(arg, "--language=")
		case arg == "--language":
			i++
			if i >= len(args) {
				return "", fmt.Errorf("--language requires a value")
			}
			value = args[i]
		default:
			return "", fmt.Errorf("unexpected argument %q", arg)
		}
		if seen {
			return "", fmt.Errorf("--language may only be specified once")
		}
		seen = true
		language, err = normalizeLanguage(value)
		if err != nil {
			return "", err
		}
	}
	return language, nil
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
	writeScope := "任务边界是避免多 agent 冲突的默认保护措施，并非绝对限制。用户的明确指令可以授权操作此任务目录之外的内容；但仍须遵守 Forge 锁规则。"
	repoGuidance := "如需修改代码，请在 worktree/ 下创建 Git worktree。执行 `git worktree add` 时，目标必须使用此任务 worktree/ 目录内的绝对路径；当命令使用 `git -C` 时，相对目标会从共享仓库解析，可能把 worktree 错放到任务目录之外。"
	updateLine := "如果任务涉及新仓库，请更新此任务的 task.json。"
	structuredLine := "task.json 只记录 Forge 已理解的结构化事实；任意说明、链接、ID 和进度应使用 Markdown。"
	backgroundLine := "将 task.md 作为长期有效的任务约定：记录工作原因、范围和非范围、持续有效的约束与决策，以及完成判定方式。"
	recoveryLine := "将 work.md 作为可替换的恢复检查点：只记录当前重点、下一步行动、阻塞以及恢复所需状态；不要重复任务约定或追加已完成步骤的历史。仅在有用时保留可选模块，删除空模块，并将任意资源链接或 ID 放入“资源”。"
	pendingLine := "可能改变范围、验收标准或稳定约束的问题应保存在 task.md 中，并在实现前请用户确认。短期执行问题放在 work.md 中。调查形成长期决策后，将其提升到 task.md，并从 work.md 删除临时说明。"
	agentsLine := "总是读取父项目 AGENTS.md（../AGENTS.md）和 workspace 根目录的 AGENTS.md（../../AGENTS.md），了解项目约定、全局 Forge session、锁和文件职责规则。"
	extra := `
- 此任务属于一个项目。需要更广泛的上下文时，读取父项目目录中的 project.json、project.md 和 log.jsonl。
- 父项目文件仅作参考；除非用户明确要求，否则修改应限定在此任务目录及其 worktree 中。
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
		agentsLine = "总是读取 workspace 根目录的 AGENTS.md（../AGENTS.md），了解全局 Forge session、锁和文件职责规则。"
		extra = `
- 项目任务模板位于 templates/*.md。每个模板由 YAML front matter 和 Markdown 正文组成；正文会完整复制为新任务的 task.md。
- 模板必须包含非空 title。还可设置 autorun（true 或 false）、agent-profiles 和 prompt。Agent 设置与 prompt 仅在 autorun 为 true 时生效。不要添加其他 front matter 字段。
- 模板格式：

  ` + "```markdown" + `
  ---
  title: 每日检查
  autorun: true
  agent-profiles: [kimi, codex]
  prompt: 检查项目并报告发现。
  ---
  检查当前项目状态，并报告需要关注的问题。
  ` + "```" + `

- 直接创建、编辑或删除模板文件。由模板创建的任务是独立副本，不会继续引用模板。
`
	}
	return fmt.Sprintf(`# %s

你正在一个 %s中工作。

- %s
- %s
- %s
- Forge session 所有权：如果环境变量或注入的 Forge session 上下文中存在 `+"`FORGE_SESSION_ID`"+`，请复用它；外层启动器已注册 session 并锁定此目录对应的资源，因此不要创建新 session，不要锁定/解锁当前资源，也不要自行结束外层 session。
- GUI 调度器启动 AutoRun 回合后，最后一个有副作用的命令必须且只能是 `+"`forge task autorun complete`"+`、`+"`forge task autorun wait`"+`、`+"`forge task autorun pause`"+` 或 `+"`forge task autorun fail`"+` 之一。
- 如需委派 AutoRun 工作，使用 `+"`forge task create --autorun [--agent-profile=<profile>...] --prompt=<prompt> <title>`"+` 创建子任务；使用 GUI session 上下文提供的 Agent Profiles，不要使用 GUI 私有 Agent ID。暂停当前 AutoRun 时，使用返回的 generation 执行 `+"`forge task autorun wait --after=<task@generation> --summary=<text>`"+`。
- 如果环境变量和注入的 session 上下文都没有 `+"`FORGE_SESSION_ID`"+`，请检测当前 agent PID，运行 `+"`forge session new --pid <pid>`"+`，导出返回的 ID 为 `+"`FORGE_SESSION_ID`"+`，并在更新项目/任务数据前只锁定一次当前目录对应的资源。
- 访问此锁定资源之外的项目/任务目录时，使用带明确 `+"`--project`"+`/`+"`--task`"+` 选择器的 `+"`forge session lock --id=$FORGE_SESSION_ID`"+` 获取临时锁，完成后用 `+"`forge session unlock --id=$FORGE_SESSION_ID`"+` 释放。
- 可读取其他任务目录作为参考。
- %s
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
- Agent 通过 session 协调写入；session 会锁定其更新的项目或任务，过期锁根据 session 存活状态清理。
- Agent 可自由读取其他项目和任务作为上下文，但只应更新已锁定的资源及该资源拥有的任务 worktree。
- 通过 ` + "`forge start`" + ` 或 Forge Web 服务启动时，Forge 会创建 session、锁定所选资源、通过环境变量或显式 Forge session 上下文注入 ` + "`FORGE_SESSION_ID`" + `，并在 agent 退出后释放 session；agent 应复用该 ID，不应自行锁定/解锁起始资源。
- 直接启动且环境变量或注入上下文中没有 ` + "`FORGE_SESSION_ID`" + ` 时，agent 应检测自身 PID，运行 ` + "`forge session new --pid <pid>`" + `，导出 ` + "`FORGE_SESSION_ID`" + `，锁定当前项目/任务资源，并在退出时结束该 session。
- 只有临时访问起始资源之外的其他项目/任务资源时，才使用额外的 lock/unlock。
- workspace 根目录无需加锁。
- 开放项目直接位于 workspace 下的 ` + "`projectN/`" + ` 或 ` + "`projectN-slug/`" + ` 目录。
- 项目任务直接位于项目目录下简短的 ` + "`taskM/`" + ` 或 ` + "`taskM-slug/`" + ` 目录；资源 ID 仍是 ` + "`projectN.taskM`" + ` 形式的完整 ID。
- 已归档项目位于 ` + "`archive/`" + `。已归档项目任务位于其项目目录下的 ` + "`archive/`" + `。
- 项目任务模板位于各项目的 ` + "`templates/`" + ` 目录。
- Git 仓库默认以普通 checkout 形式位于 ` + "`repos/`" + `。
- 将 ` + "`repos/`" + ` 下的仓库视为共享源码缓存；代码修改应在任务 worktree 中进行。
- 项目拥有 ` + "`project.json`" + `、` + "`project.md`" + `、` + "`log.jsonl`" + `、` + "`AGENTS.md`" + ` 和 ` + "`artifacts/`" + `。
- 任务拥有 ` + "`task.json`" + `、` + "`task.md`" + `、` + "`work.md`" + `、` + "`log.jsonl`" + `、` + "`AGENTS.md`" + `、` + "`artifacts/`" + ` 和 ` + "`worktree/`" + `。
- 项目不保存仓库元数据，也不管理 worktree。代码修改应先创建任务，再把任务专用的 Git worktree 放入当前任务的 ` + "`worktree/`" + ` 目录。
- Agent 可读取其他任务目录作为参考。
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
- GUI 调度器启动 AutoRun 回合后，最后一个有副作用的命令必须且只能是 ` + "`forge task autorun complete`" + `、` + "`forge task autorun wait`" + `、` + "`forge task autorun pause`" + ` 或 ` + "`forge task autorun fail`" + ` 之一。
- 委派 AutoRun 工作时，使用 ` + "`forge task create --autorun [--agent-profile=<profile>...] --prompt=<prompt> <title>`" + ` 创建子任务。使用 GUI session 上下文提供的 Agent Profiles，不要使用 GUI 私有 Agent ID。暂停当前 AutoRun 时，使用返回的 generation 执行 ` + "`forge task autorun wait --after=<task@generation> --summary=<text>`" + `。
- 项目和任务的 ` + "`AGENTS.md`" + ` 是简短的启动卡片。全局操作规则放在这里，背景放在 ` + "`project.md`" + `/` + "`task.md`" + `，任务恢复状态放在任务 ` + "`work.md`" + `，时间线历史放在 ` + "`log.jsonl`" + `。

## forge CLI

使用 Forge 执行确定性的 workspace 操作：

` + "```bash" + `
forge init [--language=<language>]
forge migrate [--language=<language>]

forge repo add [--bare] <name> <url>
forge repo list

forge project create [--slug <slug>] <description>
forge project list [--all]
forge project show [--project=<project>]
forge project archive [--project=<project>]
forge project log add [--project=<project>] [--details <text>|--details -] <title>
forge project log list [--project=<project>] [--json]

forge task create [--project=<project>] [--slug <slug>] [--detail <detail>|--task-markdown <markdown>] [--autorun] [--agent-profile=<profile>...] [--prompt=<prompt>] [--after=<task@generation>...] <title>
forge task list [--project=<project>] [--all] [--runnable [--include-blocked] [--json]]
forge task show [--project=<project>] [--task=<task>]
forge task archive [--project=<project>] [--task=<task>]
forge task log add [--project=<project>] [--task=<task>] [--details <text>|--details -] <title>
forge task log list [--project=<project>] [--task=<task>] [--json]
forge task repo add [--project=<project>] [--task=<task>] <repo-name> [--worktree <path>] [--branch <branch>] [--target <branch>] [--base <branch>]
forge task repo list [--project=<project>] [--task=<task>]
forge task repo remove [--project=<project>] [--task=<task>] <repo-name>
forge task autorun queue|start|wait|pause|resume|complete|fail ...

forge session new [--heartbeat [--timeout <duration>] | --pid <pid> | --agenthub --endpoint <url> --source-instance-id <id> --source-external-id <id> [--agenthub-session-id <id>]]
forge session bind-agenthub --id=<id> --agenthub-session-id=<id>
forge session heartbeat --id=<id>
forge session lock --id=<id> [--project=<project>] [--task=<task>]
forge session unlock --id=<id> [--project=<project>] [--task=<task>]
forge session end --id=<id>
forge session list
forge session show --id=<id>

forge workspace tree --json
forge workspace resource --id=<resource> --json

forge start [--project=<project>] [--task=<task>] [-- <agent command...>]
forge serve [--addr=<address>] [--workspace=<path>] [--version]
` + "```" + `

说明：

- ` + "`forge init`" + ` 在当前目录创建新 workspace；在已有 workspace 内执行会失败。使用 ` + "`--language`" + ` 选择 ` + "`en`" + ` 或 ` + "`zh-CN`" + `。
- ` + "`forge migrate`" + ` 刷新 workspace 中由 Forge 管理的 ` + "`AGENTS.md`" + ` 提示词；使用 ` + "`--language`" + ` 可切换 workspace 语言。
- ` + "`forge repo add`" + ` 默认创建普通 checkout；需要使用 bare repository layout 时传入 ` + "`--bare`" + `。
- ` + "`forge project create`" + ` 创建新的开放项目目录。使用 ` + "`--slug <slug>`" + ` 可在不改变项目 ID 的情况下追加可读目录后缀。
- ` + "`forge project list`" + ` 列出开放项目，传入 ` + "`--all`" + ` 时同时列出归档项目。它不会包含任务；项目任务使用 ` + "`forge task list [--project=<project>]`" + `。
- ` + "`forge project show`" + ` 和 ` + "`forge project archive`" + ` 接受 ` + "`--project=<project>`" + `；project 可为 ` + "`project22`" + ` 形式的完整 ID 或 ` + "`22`" + ` 形式的数字。省略时使用当前目录所属项目。
- ` + "`forge task create`" + ` 在项目下创建新的开放任务目录。` + "`<title>`" + ` 写入 ` + "`task.json`" + `；` + "`--detail <detail>`" + ` 初始化默认 ` + "`task.md`" + `，` + "`--task-markdown <markdown>`" + ` 则写入完整文件。使用 ` + "`--project`" + ` 选择项目，省略时使用当前目录所属项目。` + "`--slug`" + ` 可追加可读目录后缀而不改变任务 ID。
- ` + "`forge task list`" + ` 列出项目下的开放任务，传入 ` + "`--all`" + ` 时同时列出归档任务。使用 ` + "`--project`" + ` 选择项目，省略时使用当前目录所属项目。
- ` + "`forge task show`" + ` 和 ` + "`forge task archive`" + ` 接受 ` + "`--project`" + ` 及 ` + "`--task`" + `。task 可为 ` + "`task4`" + ` 或 ` + "`4`" + `。省略时使用当前目录所属任务。
- ` + "`forge task archive`" + ` 将开放任务移入项目的 archive；` + "`forge project archive`" + ` 将开放项目移入 workspace 的 ` + "`archive/`" + `。
- ` + "`forge task log add/list`" + ` 和 ` + "`forge project log add/list`" + ` 读写结构化 ` + "`log.jsonl`" + `。日志按最新优先显示，` + "`--details -`" + ` 从标准输入读取多行详情。
- ` + "`forge task repo add/list/remove`" + ` 在任务的 ` + "`task.json`" + ` 中记录、列出或删除相关仓库。任务选择规则与 ` + "`forge task show`" + ` 相同。项目不保存仓库元数据。
- ` + "`forge session new`" + ` 创建 session 并打印唯一 ID。默认使用 heartbeat 存活方式；也可显式指定 ` + "`--heartbeat [--timeout <duration>]`" + `，或用 ` + "`--pid <pid>`" + ` 绑定进程。Forge GUI 使用持久化 endpoint 与完整 source 的 AgentHub 存活方式，并用 ` + "`forge session bind-agenthub`" + ` 保存最终 AgentHub session ID。普通 CLI 命令不会访问 AgentHub：AgentHub 管理的 session 始终保持活动，直到 ` + "`forge serve`" + ` 对账到 AgentHub 安全终态（durable stopped，或可证明先经过 stopped 的 archived）或用户显式结束它。服务停止或 AgentHub 不可达期间，这些 session 与其锁会被保守保留。` + "`heartbeat`" + ` 刷新时间戳；` + "`lock/unlock`" + ` 记录或释放项目/任务控制权；` + "`end`" + ` 立即结束 session 并释放其锁，也是 AgentHub 管理 session 的人工逃生通道；` + "`list/show`" + ` 用于查看 session。
- ` + "`forge workspace tree --json`" + ` 输出包含开放项目、开放任务和活动 session 的轻量 JSON 树，供 GUI 和工具集成使用。
- ` + "`forge workspace resource --id=<resource> --json`" + ` 输出单个项目或任务的详情 JSON。
- ` + "`forge start [--project=<project>] [--task=<task>] [-- <agent command...>]`" + ` 是普通 session 启动器：创建 session、锁定资源、运行 agent 并结束 session；它不负责调度或更新 AutoRun。
`
