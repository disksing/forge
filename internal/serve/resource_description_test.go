package serve

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"strings"
	"testing"

	"github.com/disksing/pua/internal/app"
)

func TestResourceDescriptionHTTPAPI(t *testing.T) {
	root := t.TempDir()
	puaWorkspace, err := app.Initialize(root, "en")
	if err != nil {
		t.Fatal(err)
	}
	project, err := puaWorkspace.CreateProject("Project", "project")
	if err != nil {
		t.Fatal(err)
	}
	task, err := puaWorkspace.CreateTask(app.CreateTaskInput{ProjectID: project.ID, Title: "Task", Slug: "task"})
	if err != nil {
		t.Fatal(err)
	}
	workspace := serveWorkspace{ID: "workspace-description", Name: "Description", Path: root}
	s := &server{config: filepath.Join(t.TempDir(), "serve.json")}
	if err := s.saveConfig(config{
		Version: agentHubConfigVersion, Workspaces: []serveWorkspace{workspace},
	}); err != nil {
		t.Fatal(err)
	}
	request := func(method, path, body string) *httptest.ResponseRecorder {
		recorder := httptest.NewRecorder()
		s.handleWorkspace(recorder, httptest.NewRequest(method, path, strings.NewReader(body)))
		return recorder
	}

	for _, id := range []string{project.ID, task.ID} {
		response := request(http.MethodPut, "/api/workspaces/workspace-description/resources/"+id+"/description", `{"description":"  About `+id+`  "}`)
		var body struct {
			Description string `json:"description"`
		}
		unmarshalErr := json.Unmarshal(response.Body.Bytes(), &body)
		if response.Code != http.StatusOK || unmarshalErr != nil {
			t.Fatalf("describe %s = %d %s", id, response.Code, response.Body.String())
		}
		if body.Description != "About "+id {
			t.Fatalf("describe %s description = %q", id, body.Description)
		}
	}

	reloaded, err := app.OpenWorkspace(root)
	if err != nil {
		t.Fatal(err)
	}
	value, err := reloaded.ResourceValue(task.ID)
	if err != nil {
		t.Fatal(err)
	}
	if value.Task == nil || value.Task.Description != "About "+task.ID {
		t.Fatalf("persisted task description = %#v", value.Task)
	}

	// Empty description clears the field.
	cleared := request(http.MethodPut, "/api/workspaces/workspace-description/resources/"+task.ID+"/description", `{"description":"  "}`)
	if cleared.Code != http.StatusOK {
		t.Fatalf("clear description = %d %s", cleared.Code, cleared.Body.String())
	}
	unknownField := request(http.MethodPut, "/api/workspaces/workspace-description/resources/"+project.ID+"/description", `{"text":"Nope"}`)
	if unknownField.Code != http.StatusBadRequest {
		t.Fatalf("unknown field = %d %s", unknownField.Code, unknownField.Body.String())
	}
	wrongMethod := request(http.MethodGet, "/api/workspaces/workspace-description/resources/"+project.ID+"/description", "")
	if wrongMethod.Code != http.StatusMethodNotAllowed {
		t.Fatalf("GET description = %d", wrongMethod.Code)
	}
}
