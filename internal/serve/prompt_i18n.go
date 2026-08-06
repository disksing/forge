package serve

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
)

const (
	agentPromptLanguageEnglish = "en"
	agentPromptLanguageChinese = "zh-CN"
)

type autoRunPromptCatalog struct {
	defaultTask            string
	defaultCompletion      string
	recovery               string
	suspended              string
	suspendGuidance        string
	scheduler              string
	continueTask           string
	runInstructionsHeading string
	completionHeading      string
	suspensionHeading      string
	wakeConditionHeading   string
}

var englishAutoRunPrompts = autoRunPromptCatalog{
	defaultTask:            "Read task.md and complete the task.",
	defaultCompletion:      "Complete all requirements in task.md and perform appropriate verification before calling forge task autorun complete.",
	recovery:               "Recover and continue the current AutoRun generation. Read task.md, work.md, and the relevant AutoRun entries in log.jsonl before continuing.",
	suspended:              "This AutoRun generation was previously suspended. Check the wake condition first. If it is satisfied, continue working. If it is not satisfied, suspend again only when no other in-scope work can make progress and continuing would only poll that external condition; otherwise keep working.",
	suspendGuidance:        "Use suspend only when the task cannot make meaningful progress and the only remaining action would be repeated polling of a specific, observable external condition. If any in-scope implementation, testing, investigation, review, documentation, repair, or verification remains, continue this turn. Suspend is not for finishing a phase, saving progress, shortening a turn, or yielding early. Before suspending, exhaust work that does not depend on the external condition. In --summary=<context>, record completed work, current status, and blocking context; in --wake-condition=<condition>, name the separate, specific, observable, verifiable external signal. Use complete only after task requirements and appropriate verification are done, pause for a user decision, authorization, or manual handling, and fail only when no feasible safe path remains.",
	scheduler:              "This is an AutoRun scheduler turn. Before ending, call exactly one of forge task autorun complete, suspend, pause, or fail as your last side-effecting command. Apply the suspend rule above: use suspend only when no actionable in-scope work remains and only repeated polling of an observable external condition could continue the task. When suspending, provide both --summary=<context> and --wake-condition=<condition>.",
	continueTask:           "Continue the current AutoRun. Work on all actionable in-scope tasks during this turn; do not suspend merely because a phase ended, to save progress, shorten the turn, or yield early. Before ending this scheduler turn, update the result with forge task autorun complete, suspend, pause, or fail as your last side-effecting command. When suspending, first apply the suspend rule above and provide both --summary=<context> and --wake-condition=<condition>.",
	runInstructionsHeading: "Run instructions:",
	completionHeading:      "Completion criteria:",
	suspensionHeading:      "Suspension context:",
	wakeConditionHeading:   "Wake condition:",
}

var chineseAutoRunPrompts = autoRunPromptCatalog{
	defaultTask:            "读取 task.md 并完成任务。",
	defaultCompletion:      "完成 task.md 中的全部要求，并在使用 forge task autorun complete 前执行适当的验证。",
	recovery:               "恢复并继续当前 AutoRun generation。继续之前，先读取 task.md、work.md 以及 log.jsonl 中相关的 AutoRun 记录。",
	suspended:              "此 AutoRun generation 之前被挂起。请先检查唤醒条件。满足时继续工作；不满足时，只有在没有其他范围内工作可以推进、继续只会轮询该外部条件时才再次挂起，否则继续工作。",
	suspendGuidance:        "只有在任务无法继续推进、剩余唯一有意义的动作是反复轮询一个具体且可观察的外部条件时，才可以使用 suspend。只要还有任何范围内的实现、测试、调查、评审、文档、修复或验证工作可做，就必须在当前回合继续。suspend 不是阶段完成、保存进度、缩短回合或主动让出执行权的手段。挂起前先穷尽不依赖该外部条件的工作。在 --summary=<上下文> 中记录已完成工作、当前状态和阻塞上下文；在 --wake-condition=<条件> 中单独描述具体、可观察、可验证的外部唤醒信号。只有 task.md 要求和适当验证完成后才使用 complete；需要用户决定、授权或人工处理时使用 pause；当前约束下没有可行安全路径时才使用 fail。",
	scheduler:              "这是一个 AutoRun 调度器回合。结束前，最后一个有副作用的命令必须且只能是 forge task autorun complete、suspend、pause 或 fail 之一。应用上面的挂起规则：只有在没有可推进的范围内工作、继续只会轮询可观察的外部条件时才使用 suspend。挂起时必须同时填写 --summary=<上下文> 和 --wake-condition=<条件>。",
	continueTask:           "继续当前 AutoRun。本回合应完成所有可主动推进的范围内工作；不得因为阶段完成、保存进度、缩短回合或主动让出执行权而挂起。结束本调度器回合前，最后一个有副作用的命令必须使用 forge task autorun complete、suspend、pause 或 fail 之一更新结果。挂起时先应用上面的挂起规则，并同时填写 --summary=<上下文> 和 --wake-condition=<条件>。",
	runInstructionsHeading: "运行说明：",
	completionHeading:      "完成标准：",
	suspensionHeading:      "挂起上下文：",
	wakeConditionHeading:   "唤醒条件：",
}

func autoRunPromptsForWorkspace(root string) autoRunPromptCatalog {
	if workspaceAgentPromptLanguage(root) == agentPromptLanguageChinese {
		return chineseAutoRunPrompts
	}
	return englishAutoRunPrompts
}

func workspaceAgentPromptLanguage(root string) string {
	data, err := os.ReadFile(filepath.Join(root, "forge.json"))
	if err != nil {
		return agentPromptLanguageEnglish
	}
	var config struct {
		Language string `json:"language"`
	}
	if err := json.Unmarshal(data, &config); err != nil {
		return agentPromptLanguageEnglish
	}
	if strings.ToLower(strings.ReplaceAll(strings.TrimSpace(config.Language), "_", "-")) == "zh-cn" {
		return agentPromptLanguageChinese
	}
	return agentPromptLanguageEnglish
}

func buildAutoRunPrompt(workspacePath string, task runnableTaskCandidate) string {
	messages := autoRunPromptsForWorkspace(workspacePath)
	prompt := strings.TrimSpace(task.Prompt)
	if prompt == "" {
		prompt = messages.defaultTask
	}
	if task.State == "running" {
		prompt = messages.recovery + "\n\n" + prompt
	}
	if task.State == "suspended" || (strings.TrimSpace(task.SuspensionSummary) != "" || strings.TrimSpace(task.WakeCondition) != "") && (task.State == "queued" || task.State == "running" || task.State == "paused") {
		prompt += "\n\n" + messages.suspended
		context := strings.TrimSpace(task.SuspensionSummary)
		if context == "" {
			context = "Re-check whether the blocking condition has changed"
		}
		wakeCondition := strings.TrimSpace(task.WakeCondition)
		if wakeCondition == "" {
			wakeCondition = context
		}
		prompt += "\n\n" + messages.suspensionHeading + "\n" + context
		prompt += "\n\n" + messages.wakeConditionHeading + "\n" + wakeCondition
	}
	completion := strings.TrimSpace(task.CompletionCriteria)
	if completion == "" {
		completion = messages.defaultCompletion
	}
	return messages.runInstructionsHeading + "\n" + prompt + "\n\n" + messages.completionHeading + "\n" + completion + "\n\n" + messages.suspendGuidance + "\n\n" + messages.scheduler
}

func autoRunContinuePrompt(workspacePath string, task ...runnableTaskCandidate) string {
	messages := autoRunPromptsForWorkspace(workspacePath)
	prompt := messages.continueTask + "\n\n" + messages.suspendGuidance
	if len(task) == 0 {
		return prompt
	}
	runInstructions := strings.TrimSpace(task[0].Prompt)
	if runInstructions == "" {
		runInstructions = messages.defaultTask
	}
	completion := strings.TrimSpace(task[0].CompletionCriteria)
	if completion == "" {
		completion = messages.defaultCompletion
	}
	result := prompt + "\n\n" + messages.runInstructionsHeading + "\n" + runInstructions + "\n\n" + messages.completionHeading + "\n" + completion
	if task[0].State == "suspended" || (strings.TrimSpace(task[0].SuspensionSummary) != "" || strings.TrimSpace(task[0].WakeCondition) != "") && (task[0].State == "queued" || task[0].State == "running" || task[0].State == "paused") {
		context := strings.TrimSpace(task[0].SuspensionSummary)
		if context == "" {
			context = "Re-check whether the blocking condition has changed"
		}
		wakeCondition := strings.TrimSpace(task[0].WakeCondition)
		if wakeCondition == "" {
			wakeCondition = context
		}
		result += "\n\n" + messages.suspended + "\n\n" + messages.suspensionHeading + "\n" + context + "\n\n" + messages.wakeConditionHeading + "\n" + wakeCondition
	}
	return result
}
