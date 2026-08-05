package serve

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

const (
	agentPromptLanguageEnglish = "en"
	agentPromptLanguageChinese = "zh-CN"
)

type autoRunPromptCatalog struct {
	defaultTask  string
	recovery     string
	suspended    string
	scheduler    string
	continueTask string
}

var englishAutoRunPrompts = autoRunPromptCatalog{
	defaultTask:  "Read task.md and complete the task.",
	recovery:     "Recover and continue the current AutoRun generation. Read task.md, work.md, and the relevant AutoRun entries in log.jsonl before continuing.",
	suspended:    "This AutoRun was previously suspended with reason: %s. Re-check whether the condition is satisfied; continue working when it is, or suspend again with an updated reason if it is not.",
	scheduler:    "This is an AutoRun scheduler turn. Before ending, call exactly one of forge task autorun complete, suspend, pause, or fail as your last side-effecting command.",
	continueTask: "Continue the current AutoRun. Before ending this scheduler turn, update the result with forge task autorun complete, suspend, pause, or fail as your last side-effecting command.",
}

var chineseAutoRunPrompts = autoRunPromptCatalog{
	defaultTask:  "读取 task.md 并完成任务。",
	recovery:     "恢复并继续当前 AutoRun generation。继续之前，先读取 task.md、work.md 以及 log.jsonl 中相关的 AutoRun 记录。",
	suspended:    "此 AutoRun 之前被挂起，原因是：%s。请重新检查条件是否满足；满足则继续工作，不满足则使用更新后的原因再次挂起。",
	scheduler:    "这是一个 AutoRun 调度器回合。结束前，最后一个有副作用的命令必须且只能是 forge task autorun complete、suspend、pause 或 fail 之一。",
	continueTask: "继续当前 AutoRun。结束本调度器回合前，最后一个有副作用的命令必须使用 forge task autorun complete、suspend、pause 或 fail 之一更新结果。",
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
	if strings.TrimSpace(task.SuspensionSummary) != "" {
		prompt += "\n\n" + fmt.Sprintf(messages.suspended, strings.TrimSpace(task.SuspensionSummary))
	}
	return prompt + "\n\n" + messages.scheduler
}

func autoRunContinuePrompt(workspacePath string) string {
	return autoRunPromptsForWorkspace(workspacePath).continueTask
}
