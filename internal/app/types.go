package app

import (
	"encoding/json"
	"fmt"
)

type Config struct {
	Version      int          `json:"version"`
	Language     string       `json:"language"`
	AgentCommand AgentCommand `json:"agentCommand,omitempty"`
}

type AgentCommand []string

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
	Parent      string              `json:"parent"`
	Description string              `json:"description,omitempty"`
	Repos       []TaskRepo          `json:"repos,omitempty"`
	SelfDriving *SelfDriving        `json:"selfDriving,omitempty"`
	Template    *TaskTemplateSource `json:"template,omitempty"`
	// Path is populated on create responses but is not persisted in task.json.
	Path string `json:"path,omitempty"`
}

type TaskTemplateSource struct {
	Name          string `json:"name"`
	SchemaVersion int    `json:"schemaVersion"`
	Digest        string `json:"digest"`
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

type SelfDriving struct {
	Generation             int      `json:"generation"`
	State                  string   `json:"state"`
	AgentName              string   `json:"agentName,omitempty"`
	PreferredAgentProfiles []string `json:"preferredAgentProfiles,omitempty"`
	Prompt                 string   `json:"prompt,omitempty"`
	CompletionCriteria     string   `json:"completionCriteria,omitempty"`
	WakeCondition          string   `json:"wakeCondition,omitempty"`
	// SuspendedAt is the wall-clock time the current generation was last
	// suspended. The server driver uses it (not task.updatedAt) to decide when
	// a suspended Self-Driving should be re-queued.
	SuspendedAt string `json:"suspendedAt,omitempty"`
	// SuspensionSummary is the natural-language context recorded for the
	// current suspended generation. It is intentionally separate from the
	// condition that a future Scheduler Agent should evaluate.
	SuspensionSummary string `json:"suspensionSummary,omitempty"`
	// StatusReason is the current generation's state reason. Keeping this
	// projection in task metadata lets resource detail pages render the
	// current Self-Driving status without loading an arbitrary historical log page.
	StatusReason string `json:"statusReason,omitempty"`
	// WakeConditionFallback records that WakeCondition was filled from the
	// suspension summary for compatibility. The corresponding log entry is
	// historical and may not be present in a paged resource detail response.
	WakeConditionFallback bool `json:"wakeConditionFallback,omitempty"`
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
