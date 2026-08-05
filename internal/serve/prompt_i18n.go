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
	prerequisite string
	scheduler    string
	continueTask string
}

var englishAutoRunPrompts = autoRunPromptCatalog{
	defaultTask:  "Read task.md and complete the task.",
	recovery:     "Recover and continue the current AutoRun generation. Read task.md, work.md, and the relevant AutoRun entries in log.jsonl before continuing.",
	prerequisite: "The following prerequisite task runs completed: %s. Read their task files and results before continuing.",
	scheduler:    "This is an AutoRun scheduler turn. Before ending, call exactly one of forge task autorun complete, wait, pause, or fail as your last side-effecting command.",
	continueTask: "Continue the current AutoRun. Before ending this scheduler turn, update the result with forge task autorun complete, wait, pause, or fail as your last side-effecting command.",
}

var chineseAutoRunPrompts = autoRunPromptCatalog{
	defaultTask:  "读取 task.md 并完成任务。",
	recovery:     "恢复并继续当前 AutoRun generation。继续之前，先读取 task.md、work.md 以及 log.jsonl 中相关的 AutoRun 记录。",
	prerequisite: "以下前置任务运行已完成：%s。继续之前，先读取这些任务的文件和结果。",
	scheduler:    "这是一个 AutoRun 调度器回合。结束前，最后一个有副作用的命令必须且只能是 forge task autorun complete、wait、pause 或 fail 之一。",
	continueTask: "继续当前 AutoRun。结束本调度器回合前，最后一个有副作用的命令必须使用 forge task autorun complete、wait、pause 或 fail 之一更新结果。",
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
	if len(task.After) > 0 {
		completed := make([]string, 0, len(task.After))
		for _, dep := range task.After {
			completed = append(completed, fmt.Sprintf("%s@%d", dep.TaskID, dep.Generation))
		}
		prompt += "\n\n" + fmt.Sprintf(messages.prerequisite, strings.Join(completed, ", "))
	}
	return prompt + "\n\n" + messages.scheduler
}

func autoRunContinuePrompt(workspacePath string) string {
	return autoRunPromptsForWorkspace(workspacePath).continueTask
}
