package app_test

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/disksing/forge/internal/app"
)

func TestResourceAgentBindingsAreExplicitAndStable(t *testing.T) {
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

	runtime, err := workspace.RuntimeConfig()
	if err != nil {
		t.Fatal(err)
	}
	if runtime.InstanceID == "" || runtime.AgentBinding != (app.AgentBinding{Kind: "profile", Name: "default"}) {
		t.Fatalf("unexpected Workspace runtime: %#v", runtime)
	}
	for _, id := range []string{project.ID, task.ID} {
		binding, err := workspace.ResourceAgentBinding(id)
		if err != nil || binding != (app.AgentBinding{Kind: "profile", Name: "default"}) {
			t.Fatalf("resource %s binding=%#v err=%v", id, binding, err)
		}
	}

	direct := app.AgentBinding{Kind: "agent", Name: "gpt-test"}
	if _, err := workspace.SetResourceAgentBinding(project.ID, direct); err != nil {
		t.Fatal(err)
	}
	after, err := workspace.EnsureResourceRuntime(app.ResourceAgentDefaults{Workspace: "fast", Project: "fast", Task: "reasoning"})
	if err != nil {
		t.Fatal(err)
	}
	if after.InstanceID != runtime.InstanceID || after.AgentBinding != runtime.AgentBinding {
		t.Fatalf("runtime migration overwrote stable Workspace identity or binding: before=%#v after=%#v", runtime, after)
	}
	if got, err := workspace.ResourceAgentBinding(project.ID); err != nil || got != direct {
		t.Fatalf("migration overwrote direct Agent binding: got=%#v err=%v", got, err)
	}
	newProject, err := workspace.CreateProject("Typed default project", "typed-default")
	if err != nil {
		t.Fatal(err)
	}
	newTask, err := workspace.CreateTask(app.CreateTaskInput{ProjectID: newProject.ID, Title: "Typed default task", Slug: "typed-default"})
	if err != nil {
		t.Fatal(err)
	}
	if newProject.AgentBinding != (app.AgentBinding{Kind: "profile", Name: "fast"}) {
		t.Fatalf("new Project did not use persisted Project default: %#v", newProject.AgentBinding)
	}
	if newTask.AgentBinding != (app.AgentBinding{Kind: "profile", Name: "reasoning"}) {
		t.Fatalf("new Task did not use persisted Task default: %#v", newTask.AgentBinding)
	}
	info, err := os.Stat(filepath.Join(workspace.Root(), ".forge", "runtime"))
	if err != nil || !info.IsDir() || info.Mode().Perm()&0o077 != 0 {
		t.Fatalf("runtime directory permissions mismatch: info=%v err=%v", info, err)
	}
}
