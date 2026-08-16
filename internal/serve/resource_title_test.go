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

func TestResourceTitleHTTPAPI(t *testing.T) {
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
	workspace := serveWorkspace{ID: "workspace-title", Name: "Title", Path: root}
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
		response := request(http.MethodPut, "/api/workspaces/workspace-title/resources/"+id+"/title", `{"title":"  Renamed `+id+`  "}`)
		var body struct {
			Title string `json:"title"`
		}
		unmarshalErr := json.Unmarshal(response.Body.Bytes(), &body)
		if response.Code != http.StatusOK || unmarshalErr != nil {
			t.Fatalf("rename %s = %d %s", id, response.Code, response.Body.String())
		}
		if body.Title != "Renamed "+id {
			t.Fatalf("rename %s title = %q", id, body.Title)
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
	if value.Task == nil || value.Task.Title != "Renamed "+task.ID {
		t.Fatalf("persisted task title = %#v", value.Task)
	}

	emptyTitle := request(http.MethodPut, "/api/workspaces/workspace-title/resources/"+project.ID+"/title", `{"title":"   "}`)
	if emptyTitle.Code != http.StatusBadRequest {
		t.Fatalf("empty title = %d %s", emptyTitle.Code, emptyTitle.Body.String())
	}
	unknownField := request(http.MethodPut, "/api/workspaces/workspace-title/resources/"+project.ID+"/title", `{"name":"Nope"}`)
	if unknownField.Code != http.StatusBadRequest {
		t.Fatalf("unknown field = %d %s", unknownField.Code, unknownField.Body.String())
	}
	wrongMethod := request(http.MethodGet, "/api/workspaces/workspace-title/resources/"+project.ID+"/title", "")
	if wrongMethod.Code != http.StatusMethodNotAllowed {
		t.Fatalf("GET title = %d", wrongMethod.Code)
	}
}
