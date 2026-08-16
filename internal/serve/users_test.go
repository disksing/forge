package serve

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"

	"github.com/disksing/pua/internal/app"
)

func userTestServer(t *testing.T) (*server, string) {
	t.Helper()
	workspace := t.TempDir()
	if _, err := app.Initialize(workspace, "en"); err != nil {
		t.Fatal(err)
	}
	server := &server{config: filepath.Join(t.TempDir(), "serve.json")}
	if err := server.saveConfig(config{Version: agentHubConfigVersion, Workspaces: []serveWorkspace{{ID: "workspace-one", Path: workspace}}}); err != nil {
		t.Fatal(err)
	}
	return server, workspace
}

func userRequest(t *testing.T, server *server, method, path, body, userName string) *httptest.ResponseRecorder {
	t.Helper()
	request := httptest.NewRequest(method, path, bytes.NewBufferString(body))
	if userName != "" {
		request.Header.Set(workspaceUserHeader, userName)
	}
	recorder := httptest.NewRecorder()
	server.handleWorkspace(recorder, request)
	return recorder
}

func TestWorkspaceUsersAPIRegistersUpdatesListsAndDeletes(t *testing.T) {
	server, _ := userTestServer(t)
	recorder := userRequest(t, server, http.MethodPost, "/api/workspaces/workspace-one/users", `{"name":"alice_2-test"}`, "")
	if recorder.Code != http.StatusOK {
		t.Fatalf("register returned %d: %s", recorder.Code, recorder.Body.String())
	}
	recorder = userRequest(t, server, http.MethodPost, "/api/workspaces/workspace-one/users", `{"name":"bad/name"}`, "")
	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("invalid register returned %d", recorder.Code)
	}
	recorder = userRequest(t, server, http.MethodPut, "/api/workspaces/workspace-one/users/alice_2-test", `{"preference":"Call me Alice"}`, "")
	if recorder.Code != http.StatusOK {
		t.Fatalf("update returned %d: %s", recorder.Code, recorder.Body.String())
	}
	var profile app.UserProfile
	if err := json.Unmarshal(recorder.Body.Bytes(), &profile); err != nil {
		t.Fatal(err)
	}
	if profile.Preference != "Call me Alice" {
		t.Fatalf("updated profile = %#v", profile)
	}
	recorder = userRequest(t, server, http.MethodGet, "/api/workspaces/workspace-one/users", "", "alice_2-test")
	var listed struct {
		Users []app.UserProfile `json:"users"`
	}
	if err := json.Unmarshal(recorder.Body.Bytes(), &listed); err != nil {
		t.Fatal(err)
	}
	if recorder.Code != http.StatusOK || len(listed.Users) != 2 {
		t.Fatalf("list returned %d: %s", recorder.Code, recorder.Body.String())
	}
	recorder = userRequest(t, server, http.MethodDelete, "/api/workspaces/workspace-one/users/alice_2-test", "", "")
	if recorder.Code != http.StatusNoContent {
		t.Fatalf("delete returned %d: %s", recorder.Code, recorder.Body.String())
	}
}

func TestUIAndAttentionStateAreIsolatedByUser(t *testing.T) {
	server, workspace := userTestServer(t)
	puaWorkspace, err := app.OpenWorkspace(workspace)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := puaWorkspace.RegisterUser("Alice"); err != nil {
		t.Fatal(err)
	}
	project, err := puaWorkspace.CreateProject("Shared project", "shared")
	if err != nil {
		t.Fatal(err)
	}

	recorder := userRequest(t, server, http.MethodPut, "/api/workspaces/workspace-one/ui-state", `{"version":1,"expandedProjects":["project1"]}`, "Alice")
	if recorder.Code != http.StatusOK {
		t.Fatalf("Alice UI update returned %d: %s", recorder.Code, recorder.Body.String())
	}
	recorder = userRequest(t, server, http.MethodPut, "/api/workspaces/workspace-one/resources/"+project.ID+"/attention", `{"followed":true}`, "Alice")
	if recorder.Code != http.StatusOK {
		t.Fatalf("Alice attention update returned %d: %s", recorder.Code, recorder.Body.String())
	}

	alice, err := server.loadUIState("workspace-one", "Alice")
	if err != nil {
		t.Fatal(err)
	}
	defaultUser, err := server.loadUIState("workspace-one", app.DefaultUserName)
	if err != nil {
		t.Fatal(err)
	}
	if len(alice.ExpandedProjects) != 1 || !alice.Attention[project.ID].Followed {
		t.Fatalf("Alice state = %#v", alice)
	}
	if len(defaultUser.ExpandedProjects) != 0 || defaultUser.Attention[project.ID].Followed {
		t.Fatalf("default User inherited Alice state: %#v", defaultUser)
	}
}

func TestLegacyUIStateMigratesToDefaultUserAndResourceState(t *testing.T) {
	server, workspace := userTestServer(t)
	read := 2
	legacy := uiState{
		Version: 1, ExpandedProjects: []string{"project1"},
		Attention: map[string]resourceAttentionState{"project1": {Followed: true, DismissedTurn: &read, TurnNumber: 4}},
	}
	if err := saveJSONStateFile(uiStatePath(workspace), ".legacy-ui-*.tmp", legacy); err != nil {
		t.Fatal(err)
	}
	if err := server.ensureWorkspaceUsersAndMigrateUIState(workspace); err != nil {
		t.Fatal(err)
	}
	migrated, err := loadUIStateFile(userUIStatePath(workspace, app.DefaultUserName))
	if err != nil {
		t.Fatal(err)
	}
	attention := migrated.Attention["project1"]
	if !attention.Followed || attention.ReadTurnNumber == nil || *attention.ReadTurnNumber != 2 || attention.TurnNumber != 0 {
		t.Fatalf("migrated attention = %#v", attention)
	}
	shared, err := loadResourceStateFile(resourceStatePath(workspace))
	if err != nil {
		t.Fatal(err)
	}
	if shared.TurnNumbers["project1"] != 4 {
		t.Fatalf("resource state = %#v", shared)
	}
	if _, err := os.Stat(uiStatePath(workspace)); !os.IsNotExist(err) {
		t.Fatalf("legacy UI state was not removed after migration: %v", err)
	}
	if err := server.ensureWorkspaceUsersAndMigrateUIState(workspace); err != nil {
		t.Fatalf("repeat migration: %v", err)
	}
	if _, err := os.Stat(filepath.Join(workspace, ".pua", "users", "User", "profile.json")); err != nil {
		t.Fatal(err)
	}
}
