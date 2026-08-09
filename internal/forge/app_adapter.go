package forge

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/disksing/forge/internal/app"
)

// The CLI remains responsible for parsing flags and selecting the enclosing
// Workspace for compatibility. All filesystem mutations and reads below are
// delegated to the explicit-root application API so CLI and serve share the
// same typed implementation.
func openApplicationWorkspace() (*app.Workspace, error) {
	root, err := findWorkspaceRoot()
	if err != nil {
		return nil, err
	}
	return app.OpenWorkspace(root)
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
	project, err := workspace.CreateProject(description, slug)
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
	_, err = fmt.Fprintln(os.Stdout, archived.Path)
	return err
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

func appCreateTaskInput(parentID, title, detail, completeMarkdown string, completeMarkdownSet bool, slug string, selfDriving bool, agentName string, preferredAgentProfiles []string, prompt string, completionCriteria string) app.CreateTaskInput {
	return app.CreateTaskInput{
		ProjectID: parentID, Title: title, Detail: detail, CompleteMarkdown: completeMarkdown,
		CompleteMarkdownSet: completeMarkdownSet, Slug: slug, SelfDriving: selfDriving,
		AgentName: agentName, PreferredAgentProfiles: append([]string(nil), preferredAgentProfiles...), Prompt: prompt,
		CompletionCriteria: completionCriteria,
	}
}

func applicationTaskList(options taskListOptions) error {
	workspace, err := openApplicationWorkspace()
	if err != nil {
		return err
	}
	result, err := workspace.Tasks(app.TaskListOptions{
		ProjectID: options.ProjectID, IncludeArchived: options.IncludeArchived,
		Runnable: options.Runnable,
	})
	if err != nil {
		return err
	}
	if !options.Runnable {
		for _, entry := range result.Tasks {
			fmt.Printf("%s\t%s\n", taskDirectoryName(entry.Task.ID), entry.Task.Title)
		}
		return nil
	}
	runnable := make([]runnableTask, 0, len(result.Runnable))
	for _, entry := range result.Runnable {
		runnable = append(runnable, runnableTask{
			ID: entry.ID, Path: entry.Path, Title: entry.Title, Revision: entry.Revision,
			Condition: entry.Condition, Ready: entry.Ready, Reason: entry.Reason, AgentName: entry.AgentName, Prompt: entry.Prompt,
			PreferredAgentProfiles: append([]string(nil), entry.PreferredAgentProfiles...),
			CompletionCriteria:     entry.CompletionCriteria,
			WakeContext:            entry.WakeContext,
		})
	}
	if options.JSON {
		return printJSON(map[string]any{"tasks": runnable})
	}
	for _, entry := range runnable {
		fmt.Printf("%s\t%d\t%s\t%s\n", entry.ID, entry.Revision, entry.Reason, entry.Title)
	}
	return nil
}

func applicationLogAdd(kind, projectID, taskID, title, details string) error {
	workspace, err := openApplicationWorkspace()
	if err != nil {
		return err
	}
	resourceID, err := resolveLogResource(kind, projectID, taskID)
	if err != nil {
		return err
	}
	entry, err := workspace.AddLog(resourceID, title, details)
	if err != nil {
		return err
	}
	return printJSON(entry)
}

func applicationLogList(kind, projectID, taskID string, jsonOutput bool) error {
	workspace, err := openApplicationWorkspace()
	if err != nil {
		return err
	}
	resourceID, err := resolveLogResource(kind, projectID, taskID)
	if err != nil {
		return err
	}
	entries, err := workspace.Logs(resourceID)
	if err != nil {
		return err
	}
	if jsonOutput {
		return printJSON(entries)
	}
	for _, entry := range entries {
		fmt.Printf("%s\t%s", entry.Time, entry.Title)
		if entry.Details != "" {
			fmt.Printf("\t%s", entry.Details)
		}
		fmt.Println()
	}
	return nil
}

func applicationSelfDrivingEnable(opts selfDrivingCommandOptions) error {
	workspace, err := openApplicationWorkspace()
	if err != nil {
		return err
	}
	task, err := workspace.EnableSelfDriving(app.SelfDrivingDesiredStateInput{
		TaskID: opts.TaskID, AgentName: opts.AgentName, AgentNameSet: opts.AgentNameSet,
		PreferredAgentProfiles: opts.PreferredAgentProfiles, ProfilesSet: opts.ProfilesSet, Prompt: opts.Prompt, PromptSet: opts.PromptSet,
		CompletionCriteria: opts.CompletionCriteria, CompletionCriteriaSet: opts.CompletionCriteriaSet,
	})
	if err != nil {
		return err
	}
	return printJSON(task)
}

func applicationSelfDrivingDisable(opts selfDrivingCommandOptions) error {
	workspace, err := openApplicationWorkspace()
	if err != nil {
		return err
	}
	task, err := workspace.DisableSelfDriving(opts.TaskID)
	if err != nil {
		return err
	}
	return printJSON(task)
}

func applicationSelfDrivingAction(action string, opts selfDrivingCommandOptions) error {
	workspace, err := openApplicationWorkspace()
	if err != nil {
		return err
	}
	input := app.SelfDrivingActionInput{
		TaskID: opts.TaskID, Summary: opts.Summary, WakeCondition: opts.WakeCondition, Reason: opts.Reason,
		ExpectedRevision: opts.ExpectedRevision,
	}
	var task app.Task
	switch action {
	case "complete":
		task, err = workspace.CompleteSelfDriving(input)
	case "suspend":
		task, err = workspace.SuspendSelfDriving(input)
	case "pause":
		task, err = workspace.PauseSelfDriving(input)
	case "fail":
		task, err = workspace.FailSelfDriving(input)
	default:
		return fmt.Errorf("unknown Self-Driving action %q", action)
	}
	if err != nil {
		return err
	}
	return printJSON(task)
}

func applicationSessionNew(liveness app.SessionLiveness) error {
	workspace, err := openApplicationWorkspace()
	if err != nil {
		return err
	}
	session, err := workspace.CreateSession(liveness)
	if err != nil {
		return err
	}
	_, err = fmt.Fprintln(os.Stdout, session.ID)
	return err
}

func applicationSessionNewLocal(liveness SessionLiveness) error {
	return applicationSessionNew(app.SessionLiveness(liveness))
}

func applicationSessionBind(id, agentHubID string) error {
	workspace, err := openApplicationWorkspace()
	if err != nil {
		return err
	}
	session, err := workspace.BindAgentHubSession(id, agentHubID)
	if err != nil {
		return err
	}
	return printJSON(session)
}

func applicationSessionHeartbeat(id string) error {
	workspace, err := openApplicationWorkspace()
	if err != nil {
		return err
	}
	session, err := workspace.Heartbeat(id)
	if err != nil {
		return err
	}
	return printJSON(session)
}

func applicationSessionEnd(id string) error {
	workspace, err := openApplicationWorkspace()
	if err != nil {
		return err
	}
	session, err := workspace.EndSession(id)
	if err != nil {
		return err
	}
	return printJSON(session)
}

func applicationSessionList() error {
	workspace, err := openApplicationWorkspace()
	if err != nil {
		return err
	}
	sessions, err := workspace.Sessions()
	if err != nil {
		return err
	}
	for _, session := range sessions {
		controls := make([]SessionControl, 0, len(session.Controls))
		for _, control := range session.Controls {
			controls = append(controls, SessionControl(control))
		}
		fmt.Printf("%s\t%s\t%s\t%s\n", session.ID, formatSessionLiveness(SessionLiveness(session.Liveness)), formatSessionControls(controls), session.UpdatedAt)
	}
	return nil
}

func applicationSessionShow(id string) error {
	workspace, err := openApplicationWorkspace()
	if err != nil {
		return err
	}
	session, err := workspace.Session(id)
	if err != nil {
		return err
	}
	return printJSON(session)
}

func applicationSessionLock(id, resourceID string, lock bool) error {
	workspace, err := openApplicationWorkspace()
	if err != nil {
		return err
	}
	if strings.TrimSpace(resourceID) == "" {
		if _, err := workspace.Session(id); err != nil {
			return err
		}
		fmt.Println(workspaceNoLockMessage)
		return nil
	}
	var session app.Session
	if lock {
		session, err = workspace.LockSession(id, resourceID)
	} else {
		session, err = workspace.UnlockSession(id, resourceID)
	}
	if err != nil {
		return err
	}
	return printJSON(session)
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
		fmt.Printf("%s\t%s\t%s\t%s\t%s", repo.Name, taskRepoStoragePath(TaskRepo(repo)), repo.WorktreePath, repo.Branch, repo.TargetBranch)
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
	if _, err := app.Initialize(root, language); err != nil {
		return err
	}
	fmt.Printf("initialized AgentWorkspace at %s\n", root)
	return nil
}

func applicationMigrate(language string) error {
	workspace, err := openApplicationWorkspace()
	if err != nil {
		return err
	}
	if err := workspace.Migrate(language); err != nil {
		return err
	}
	fmt.Printf("migrated AgentWorkspace at %s\n", workspace.Root())
	return nil
}

func applicationResourceIDForTask(projectID, taskID string) (string, error) {
	projectID, err := normalizeProjectArg(projectID)
	if err != nil {
		return "", err
	}
	if strings.TrimSpace(taskID) == "" {
		return "", errors.New("task id is required")
	}
	return normalizeTaskArg(projectID, taskID)
}

func applicationAbsoluteOrWorkspaceRelative(root, value string) string {
	if filepath.IsAbs(value) {
		return filepath.Clean(value)
	}
	return filepath.Join(root, filepath.FromSlash(value))
}
