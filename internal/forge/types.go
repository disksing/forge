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

type Task struct {
	ID          string     `json:"id"`
	Type        string     `json:"type"`
	Parent      *string    `json:"parent"`
	Title       string     `json:"title"`
	Description string     `json:"description"`
	Workflow    string     `json:"workflow,omitempty"`
	CreatedAt   string     `json:"createdAt"`
	UpdatedAt   string     `json:"updatedAt"`
	Repos       []TaskRepo `json:"repos"`
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
