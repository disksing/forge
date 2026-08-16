package app_test

import (
	"strings"
	"testing"

	"github.com/disksing/pua/internal/app"
)

func TestSetResourceTitleRenamesProjectAndTask(t *testing.T) {
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

	if got, err := workspace.SetResourceTitle(project.ID, "  Renamed project  "); err != nil || got != "Renamed project" {
		t.Fatalf("rename project: got=%q err=%v", got, err)
	}
	if got, err := workspace.SetResourceTitle(task.ID, "Renamed task"); err != nil || got != "Renamed task" {
		t.Fatalf("rename task: got=%q err=%v", got, err)
	}

	reloaded, err := app.OpenWorkspace(workspace.Root())
	if err != nil {
		t.Fatal(err)
	}
	projects, err := reloaded.Projects(false)
	if err != nil {
		t.Fatal(err)
	}
	if len(projects) != 1 || projects[0].Project.Title != "Renamed project" {
		t.Fatalf("project title not persisted: %#v", projects)
	}
	tasks, err := reloaded.Tasks(app.TaskListOptions{ProjectID: project.ID})
	if err != nil {
		t.Fatal(err)
	}
	if len(tasks.Tasks) != 1 || tasks.Tasks[0].Task.Title != "Renamed task" {
		t.Fatalf("task title not persisted: %#v", tasks)
	}
}

func TestSetResourceTitleRejectsInvalidInput(t *testing.T) {
	workspace, err := app.Initialize(t.TempDir(), "en")
	if err != nil {
		t.Fatal(err)
	}
	project, err := workspace.CreateProject("Project", "project")
	if err != nil {
		t.Fatal(err)
	}

	if _, err := workspace.SetResourceTitle(project.ID, "   "); err == nil || !strings.Contains(err.Error(), "title is required") {
		t.Fatalf("empty title should fail, err=%v", err)
	}
	if _, err := workspace.SetResourceTitle("task404", "Nope"); err == nil {
		t.Fatalf("unknown resource should fail")
	}
}
