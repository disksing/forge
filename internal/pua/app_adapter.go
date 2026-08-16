package pua

import (
	"fmt"
	"os"

	"github.com/disksing/pua/internal/app"
)

// The CLI remains responsible for parsing flags and selecting the enclosing
// Workspace for compatibility. All filesystem mutations and reads below are
// delegated to the explicit-root application API so CLI and serve share the
// same typed implementation.
func openApplicationWorkspace() (*app.Workspace, error) {
	cwd, err := os.Getwd()
	if err != nil {
		return nil, err
	}
	return app.OpenWorkspaceFrom(cwd)
}

func applicationWorkspaceTreeJSON() error {
	workspace, err := openApplicationWorkspace()
	if err != nil {
		return err
	}
	tree, err := workspace.Tree()
	if err != nil {
		return err
	}
	return printJSON(tree)
}

func applicationWorkspaceResourceJSON(id string) error {
	workspace, err := openApplicationWorkspace()
	if err != nil {
		return err
	}
	detail, err := workspace.Resource(id)
	if err != nil {
		return err
	}
	return printJSON(detail)
}

func applicationProjectCreate(description, slug string) error {
	workspace, err := openApplicationWorkspace()
	if err != nil {
		return err
	}
	project, err := workspace.CreateProjectWithInput(app.CreateProjectInput{Description: description, Slug: slug})
	if err != nil {
		return err
	}
	return printJSON(project)
}

func applicationProjectList(includeArchived bool) error {
	workspace, err := openApplicationWorkspace()
	if err != nil {
		return err
	}
	projects, err := workspace.Projects(includeArchived)
	if err != nil {
		return err
	}
	for _, entry := range projects {
		fmt.Printf("%s\t%s\n", entry.Project.ID, entry.Project.Title)
	}
	return nil
}

func applicationShowResource(id string) error {
	workspace, err := openApplicationWorkspace()
	if err != nil {
		return err
	}
	resource, err := workspace.ResourceValue(id)
	if err != nil {
		return err
	}
	return printJSON(resource.Resource())
}

func applicationArchiveResource(id string) error {
	workspace, err := openApplicationWorkspace()
	if err != nil {
		return err
	}
	archived, err := workspace.ArchiveResource(id)
	if err != nil {
		return err
	}
	if _, err = fmt.Fprintln(os.Stdout, archived.Path); err != nil {
		return err
	}
	for _, warning := range archived.Warnings {
		if _, err = fmt.Fprintf(os.Stdout, "warning[%s]: %s\n", warning.Code, warning.Message); err != nil {
			return err
		}
	}
	return nil
}

func applicationTaskCreate(input app.CreateTaskInput) error {
	workspace, err := openApplicationWorkspace()
	if err != nil {
		return err
	}
	task, err := workspace.CreateTask(input)
	if err != nil {
		return err
	}
	return printJSON(task)
}

func appCreateTaskInput(parentID, title, detail, completeMarkdown string, completeMarkdownSet bool, slug string) app.CreateTaskInput {
	return app.CreateTaskInput{
		ProjectID: parentID, Title: title, Detail: detail, CompleteMarkdown: completeMarkdown,
		CompleteMarkdownSet: completeMarkdownSet, Slug: slug,
	}
}

func applicationTaskList(options taskListOptions) error {
	workspace, err := openApplicationWorkspace()
	if err != nil {
		return err
	}
	result, err := workspace.Tasks(app.TaskListOptions{
		ProjectID: options.ProjectID, IncludeArchived: options.IncludeArchived,
	})
	if err != nil {
		return err
	}
	for _, entry := range result.Tasks {
		fmt.Printf("%s\t%s\n", app.TaskShortID(entry.Task.ID), entry.Task.Title)
	}
	return nil
}

func applicationRepoList() error {
	workspace, err := openApplicationWorkspace()
	if err != nil {
		return err
	}
	repos, err := workspace.Repositories()
	if err != nil {
		return err
	}
	for _, repo := range repos {
		fmt.Printf("%s\t%s\n", repo.Name, repo.Path)
	}
	return nil
}

func applicationRepoAdd(name, url string, bare bool) error {
	workspace, err := openApplicationWorkspace()
	if err != nil {
		return err
	}
	repo, err := workspace.CloneRepository(name, url, bare)
	if err != nil {
		return err
	}
	_, err = fmt.Fprintln(os.Stdout, repo.Path)
	return err
}

func applicationTaskRepoAdd(input app.TaskRepoInput) error {
	workspace, err := openApplicationWorkspace()
	if err != nil {
		return err
	}
	task, err := workspace.AddTaskRepo(input)
	if err != nil {
		return err
	}
	return printJSON(task)
}

func appTaskRepoInput(options taskRepoAddOptions) app.TaskRepoInput {
	return app.TaskRepoInput{
		TaskID: options.taskID, Name: options.name, WorktreePath: options.worktreePath,
		Branch: options.branch, TargetBranch: options.targetBranch, BaseBranch: options.baseBranch,
	}
}

func applicationTaskRepoList(taskID string) error {
	workspace, err := openApplicationWorkspace()
	if err != nil {
		return err
	}
	entries, err := workspace.TaskRepos(taskID)
	if err != nil {
		return err
	}
	for _, repo := range entries {
		storagePath := repo.RepoPath
		if storagePath == "" {
			storagePath = repo.BarePath
		}
		fmt.Printf("%s\t%s\t%s\t%s\t%s", repo.Name, storagePath, repo.WorktreePath, repo.Branch, repo.TargetBranch)
		if repo.BaseBranch != "" {
			fmt.Printf("\t%s", repo.BaseBranch)
		}
		fmt.Println()
	}
	return nil
}

func applicationTaskRepoRemove(taskID, name string) error {
	workspace, err := openApplicationWorkspace()
	if err != nil {
		return err
	}
	task, err := workspace.RemoveTaskRepo(taskID, name)
	if err != nil {
		return err
	}
	return printJSON(task)
}

func applicationInit(language string) error {
	root, err := os.Getwd()
	if err != nil {
		return err
	}
	if _, err := app.InitializeWithOptions(root, app.InitializeOptions{Language: language}); err != nil {
		return err
	}
	fmt.Printf("initialized AgentWorkspace at %s\n", root)
	return nil
}

func applicationMigrate(language string, renameStorage bool) error {
	workspace, err := openApplicationWorkspace()
	if err != nil {
		return err
	}
	if err := workspace.Migrate(language); err != nil {
		return err
	}
	if renameStorage {
		if err := workspace.RenameControlDir(); err != nil {
			return err
		}
	}
	fmt.Printf("migrated AgentWorkspace at %s\n", workspace.Root())
	return nil
}
