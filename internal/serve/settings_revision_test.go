package serve

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"testing"
)

func settingsRevisionForTest(t *testing.T, s *server) string {
	t.Helper()
	recorder := httptest.NewRecorder()
	s.handleSettings(recorder, httptest.NewRequest(http.MethodGet, "/api/settings/revision", nil))
	if recorder.Code != http.StatusOK {
		t.Fatalf("settings revision returned %d: %s", recorder.Code, recorder.Body.String())
	}
	var response struct {
		Revision string `json:"revision"`
	}
	if err := json.Unmarshal(recorder.Body.Bytes(), &response); err != nil {
		t.Fatal(err)
	}
	if response.Revision == "" {
		t.Fatal("settings revision is empty")
	}
	return response.Revision
}

func TestSettingsRevisionStableAcrossReads(t *testing.T) {
	s := &server{config: filepath.Join(t.TempDir(), "serve.json")}
	first := settingsRevisionForTest(t, s)
	second := settingsRevisionForTest(t, s)
	if first != second {
		t.Fatalf("settings revision changed between reads: %q then %q", first, second)
	}
}

func TestSettingsRevisionReflectsConfigurationChanges(t *testing.T) {
	s := &server{config: filepath.Join(t.TempDir(), "serve.json")}
	initial := settingsRevisionForTest(t, s)

	cfg, err := s.loadConfig()
	if err != nil {
		t.Fatal(err)
	}
	cfg.AgentProfiles = append(cfg.AgentProfiles, agentProfileRoute{Key: "fast", AgentName: "gpt-5.3-codex-spark"})
	if err := s.saveConfig(cfg); err != nil {
		t.Fatal(err)
	}
	profileChanged := settingsRevisionForTest(t, s)
	if profileChanged == initial {
		t.Fatal("settings revision did not change after profile route change")
	}

	cfg, err = s.loadConfig()
	if err != nil {
		t.Fatal(err)
	}
	cfg.Workspaces = append(cfg.Workspaces, serveWorkspace{ID: "workspace-two", Name: "Two", Path: t.TempDir()})
	if err := s.saveConfig(cfg); err != nil {
		t.Fatal(err)
	}
	workspaceChanged := settingsRevisionForTest(t, s)
	if workspaceChanged == profileChanged {
		t.Fatal("settings revision did not change after workspace list change")
	}
}

func TestWorkspacesAndSettingsResponsesCarryMatchingRevision(t *testing.T) {
	s := &server{config: filepath.Join(t.TempDir(), "serve.json")}
	revision := settingsRevisionForTest(t, s)

	recorder := httptest.NewRecorder()
	s.handleWorkspaces(recorder, httptest.NewRequest(http.MethodGet, "/api/workspaces", nil))
	if recorder.Code != http.StatusOK {
		t.Fatalf("workspace list returned %d: %s", recorder.Code, recorder.Body.String())
	}
	var workspaces struct {
		Revision   string           `json:"revision"`
		Workspaces []serveWorkspace `json:"workspaces"`
	}
	if err := json.Unmarshal(recorder.Body.Bytes(), &workspaces); err != nil {
		t.Fatal(err)
	}
	if workspaces.Revision != revision {
		t.Fatalf("workspace list revision %q does not match revision endpoint %q", workspaces.Revision, revision)
	}

	recorder = httptest.NewRecorder()
	s.handleSettings(recorder, httptest.NewRequest(http.MethodGet, "/api/settings", nil))
	if recorder.Code != http.StatusOK {
		t.Fatalf("settings returned %d: %s", recorder.Code, recorder.Body.String())
	}
	var settings settingsResponse
	if err := json.Unmarshal(recorder.Body.Bytes(), &settings); err != nil {
		t.Fatal(err)
	}
	if settings.Revision != revision {
		t.Fatalf("settings revision %q does not match revision endpoint %q", settings.Revision, revision)
	}
}

func TestSettingsRevisionRejectsNonGet(t *testing.T) {
	s := &server{config: filepath.Join(t.TempDir(), "serve.json")}
	recorder := httptest.NewRecorder()
	s.handleSettings(recorder, httptest.NewRequest(http.MethodPost, "/api/settings/revision", nil))
	if recorder.Code != http.StatusMethodNotAllowed {
		t.Fatalf("POST /api/settings/revision returned %d, want %d", recorder.Code, http.StatusMethodNotAllowed)
	}
}
