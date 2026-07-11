package forge

import (
	"encoding/json"
	"fmt"
	"strings"
)

type Config struct {
	Version      int          `json:"version"`
	AgentCommand AgentCommand `json:"agentCommand,omitempty"`
}

type AgentCommand []string

func (cmd *AgentCommand) UnmarshalJSON(data []byte) error {
	var args []string
	if err := json.Unmarshal(data, &args); err == nil {
		*cmd = args
		return nil
	}

	var command string
	if err := json.Unmarshal(data, &command); err != nil {
		return err
	}
	parsed, err := splitAgentCommand(command)
	if err != nil {
		return err
	}
	*cmd = parsed
	return nil
}

func (cmd AgentCommand) MarshalJSON() ([]byte, error) {
	return json.Marshal([]string(cmd))
}

func splitAgentCommand(command string) ([]string, error) {
	var args []string
	var current strings.Builder
	var quote rune
	escaped := false
	for _, r := range command {
		if escaped {
			current.WriteRune(r)
			escaped = false
			continue
		}
		if r == '\\' {
			escaped = true
			continue
		}
		if quote != 0 {
			if r == quote {
				quote = 0
				continue
			}
			current.WriteRune(r)
			continue
		}
		if r == '\'' || r == '"' {
			quote = r
			continue
		}
		if r == ' ' || r == '\t' || r == '\n' || r == '\r' {
			if current.Len() > 0 {
				args = append(args, current.String())
				current.Reset()
			}
			continue
		}
		current.WriteRune(r)
	}
	if escaped {
		current.WriteRune('\\')
	}
	if quote != 0 {
		return nil, fmt.Errorf("unterminated quote in agentCommand")
	}
	if current.Len() > 0 {
		args = append(args, current.String())
	}
	return args, nil
}

type ResourceMeta struct {
	SchemaVersion int    `json:"schemaVersion"`
	ID            string `json:"id"`
	Type          string `json:"type"`
	Title         string `json:"title"`
	CreatedAt     string `json:"createdAt"`
	UpdatedAt     string `json:"updatedAt"`
}

type Project struct {
	ResourceMeta
	Description string `json:"description,omitempty"`
}

type Task struct {
	ResourceMeta
	Parent      string     `json:"parent"`
	Description string     `json:"description,omitempty"`
	Repos       []TaskRepo `json:"repos,omitempty"`
	Run         *TaskRun   `json:"run,omitempty"`
}

type Resource interface {
	resourceMeta() *ResourceMeta
}

func (project *Project) resourceMeta() *ResourceMeta { return &project.ResourceMeta }
func (task *Task) resourceMeta() *ResourceMeta       { return &task.ResourceMeta }

func (project Project) MarshalJSON() ([]byte, error) {
	type projectJSON struct {
		ResourceMeta
		Parent      *string `json:"parent"`
		Description string  `json:"description,omitempty"`
	}
	return json.Marshal(projectJSON{ResourceMeta: project.ResourceMeta, Description: project.Description})
}

func (project *Project) UnmarshalJSON(data []byte) error {
	type projectJSON struct {
		ResourceMeta
		Parent      *string `json:"parent"`
		Description string  `json:"description,omitempty"`
	}
	var decoded projectJSON
	if err := json.Unmarshal(data, &decoded); err != nil {
		return err
	}
	if decoded.Parent != nil {
		return fmt.Errorf("project parent must be null")
	}
	project.ResourceMeta = decoded.ResourceMeta
	project.Description = decoded.Description
	return nil
}

type TaskRun struct {
	Mode       string              `json:"mode"`
	AgentID    string              `json:"agentId,omitempty"`
	Prompt     string              `json:"prompt,omitempty"`
	Generation int                 `json:"generation"`
	State      string              `json:"state"`
	After      []TaskRunDependency `json:"after,omitempty"`
	Current    *TaskRunCurrent     `json:"current,omitempty"`
	NextAction *TaskRunNextAction  `json:"nextAction,omitempty"`
	LastResult *TaskRunResult      `json:"lastResult,omitempty"`
	History    []TaskRunResult     `json:"history,omitempty"`
	UpdatedAt  string              `json:"updatedAt"`
}

type TaskRunDependency struct {
	TaskID     string `json:"taskId"`
	Generation int    `json:"generation"`
}

type TaskRunCurrent struct {
	SessionID string `json:"sessionId"`
	Executor  string `json:"executor"`
	StartedAt string `json:"startedAt"`
}

type TaskRunNextAction struct {
	Type                 string              `json:"type"`
	After                []TaskRunDependency `json:"after,omitempty"`
	Summary              string              `json:"summary,omitempty"`
	RequestedBySessionID string              `json:"requestedBySessionId"`
}

type TaskRunResult struct {
	Generation int    `json:"generation"`
	Outcome    string `json:"outcome"`
	Summary    string `json:"summary,omitempty"`
	FinishedAt string `json:"finishedAt"`
}

type TaskRepo struct {
	Name         string `json:"name"`
	RepoPath     string `json:"repoPath,omitempty"`
	BarePath     string `json:"barePath,omitempty"`
	WorktreePath string `json:"worktreePath"`
	Branch       string `json:"branch"`
	TargetBranch string `json:"targetBranch"`
	BaseBranch   string `json:"baseBranch,omitempty"`
}
