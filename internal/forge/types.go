package forge

type Config struct {
	Version int `json:"version"`
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
