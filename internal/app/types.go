package app

import (
	"encoding/json"
	"fmt"
)

type Config struct {
	Version  int    `json:"version"`
	Language string `json:"language"`
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
	Parent      string              `json:"parent"`
	Description string              `json:"description,omitempty"`
	Repos       []TaskRepo          `json:"repos,omitempty"`
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

type TaskRepo struct {
	Name         string `json:"name"`
	RepoPath     string `json:"repoPath,omitempty"`
	BarePath     string `json:"barePath,omitempty"`
	WorktreePath string `json:"worktreePath"`
	Branch       string `json:"branch"`
	TargetBranch string `json:"targetBranch"`
	BaseBranch   string `json:"baseBranch,omitempty"`
}
