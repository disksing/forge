package app_test

import (
	"testing"

	"github.com/disksing/pua/internal/app"
)

func TestSetResourceDescriptionUpdatesProjectAndTask(t *testing.T) {
	workspace, err := app.Initialize(t.TempDir(), "en")
	if err != nil {
		t.Fatal(err)
	}
	project, err := workspace.CreateProject("Project", "project")
	if err != nil {
		t.Fatal(err)
	}
	task, err := workspace.CreateTask(app.CreateTaskInput{ProjectID: project.ID, Title: "Task", Slug: "task"})
	if err != nil {
		t.Fatal(err)
	}

	if got, err := workspace.SetResourceDescription(project.ID, "  New project description  "); err != nil || got != "New project description" {
		t.Fatalf("describe project: got=%q err=%v", got, err)
	}
	if got, err := workspace.SetResourceDescription(task.ID, "New task description"); err != nil || got != "New task description" {
		t.Fatalf("describe task: got=%q err=%v", got, err)
	}

	reloaded, err := app.OpenWorkspace(workspace.Root())
	if err != nil {
		t.Fatal(err)
	}
	projects, err := reloaded.Projects(false)
	if err != nil {
		t.Fatal(err)
	}
	if len(projects) != 1 || projects[0].Project.Description != "New project description" {
		t.Fatalf("project description not persisted: %#v", projects)
	}
	tasks, err := reloaded.Tasks(app.TaskListOptions{ProjectID: project.ID})
	if err != nil {
		t.Fatal(err)
	}
	if len(tasks.Tasks) != 1 || tasks.Tasks[0].Task.Description != "New task description" {
		t.Fatalf("task description not persisted: %#v", tasks)
	}

	// Empty description clears the field.
	if got, err := workspace.SetResourceDescription(task.ID, "   "); err != nil || got != "" {
		t.Fatalf("clear task description: got=%q err=%v", got, err)
	}
	reloaded, err = app.OpenWorkspace(workspace.Root())
	if err != nil {
		t.Fatal(err)
	}
	tasks, err = reloaded.Tasks(app.TaskListOptions{ProjectID: project.ID})
	if err != nil {
		t.Fatal(err)
	}
	if len(tasks.Tasks) != 1 || tasks.Tasks[0].Task.Description != "" {
		t.Fatalf("task description not cleared: %#v", tasks)
	}
}

func TestSetResourceDescriptionRejectsInvalidResource(t *testing.T) {
	workspace, err := app.Initialize(t.TempDir(), "en")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := workspace.SetResourceDescription("workspace", "nope"); err == nil {
		t.Fatal("expected error for workspace description")
	}
	if _, err := workspace.SetResourceDescription("project404", "nope"); err == nil {
		t.Fatal("expected error for unknown resource")
	}
}
