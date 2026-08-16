package serve

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/disksing/pua/internal/app"
)

func doctorAgentHub(t *testing.T) *httptest.Server {
	t.Helper()
	return httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
		case "/v1/status":
			writeJSON(w, agentHubStatus{APIVersion: agentHubAPIVersion, Capabilities: append([]string(nil), requiredAgentHubCapabilities...)})
		case "/v1/agents":
			writeJSON(w, agentHubCatalog{Agents: []agentHubAgent{{Name: "fake-agent", Available: true}}, Providers: []agentHubProvider{}, Probes: []agentHubProbe{}})
		default:
			http.NotFound(w, r)
		}
	}))
}

func TestDoctorMonitorScansConfiguredWorkspacesAndServesCache(t *testing.T) {
	workspacePath := t.TempDir()
	workspace, err := app.Initialize(workspacePath, "en")
	if err != nil {
		t.Fatal(err)
	}
	project, err := workspace.CreateProject("Doctor", "")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := workspace.CreateTask(app.CreateTaskInput{ProjectID: project.ID, Title: "Task"}); err != nil {
		t.Fatal(err)
	}
	hub := doctorAgentHub(t)
	defer hub.Close()
	configPath := filepath.Join(t.TempDir(), "serve.json")
	s := &server{config: configPath}
	cfg := config{
		Version: agentHubConfigVersion, Workspaces: []serveWorkspace{{ID: "workspace-one", Name: "One", Path: workspacePath}},
		AgentHubEndpoint: hub.URL, AgentHubInstanceID: "pua-doctor-test",
		AgentProfiles: []agentProfileRoute{
			{Key: "default", AgentName: "fake-agent"},
			{Key: "fast", AgentName: "fake-agent"},
			{Key: "reasoning", AgentName: "fake-agent"},
		},
	}
	if err := s.saveConfig(cfg); err != nil {
		t.Fatal(err)
	}
	s.doctor = newDoctorMonitor(s)
	s.doctor.scan(context.Background())
	snapshot := s.doctor.snapshot()
	if snapshot.Checking || !snapshot.Complete || snapshot.Summary.Errors != 0 || len(snapshot.Workspaces) != 1 {
		t.Fatalf("healthy snapshot = %#v", snapshot)
	}

	agentsPath := filepath.Join(workspacePath, "AGENTS.md")
	data, err := os.ReadFile(agentsPath)
	if err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(agentsPath, []byte(strings.Replace(string(data), "AgentWorkspace Agent Instructions", "Changed", 1)), 0o644); err != nil {
		t.Fatal(err)
	}
	s.doctor.scan(context.Background())
	if got := s.doctor.snapshot(); got.Summary.Errors != 1 || got.Workspaces[0].Report.Issues[0].Code != "agents_managed_section_modified" {
		t.Fatalf("changed snapshot = %#v", got)
	}

	recorder := httptest.NewRecorder()
	s.handleDoctor(recorder, httptest.NewRequest(http.MethodGet, "/api/doctor", nil))
	if recorder.Code != http.StatusOK {
		t.Fatalf("GET doctor = %d: %s", recorder.Code, recorder.Body.String())
	}
	var response doctorSnapshot
	if err := json.Unmarshal(recorder.Body.Bytes(), &response); err != nil || response.Summary.Errors != 1 {
		t.Fatalf("doctor response = %#v, %v", response, err)
	}
	postRecorder := httptest.NewRecorder()
	s.handleDoctor(postRecorder, httptest.NewRequest(http.MethodPost, "/api/doctor", nil))
	if postRecorder.Code != http.StatusAccepted {
		t.Fatalf("POST doctor = %d: %s", postRecorder.Code, postRecorder.Body.String())
	}
}

func TestDoctorMonitorMarksCatalogFailureIncompleteWithoutAgentFalsePositives(t *testing.T) {
	workspacePath := t.TempDir()
	if _, err := app.Initialize(workspacePath, "en"); err != nil {
		t.Fatal(err)
	}
	configPath := filepath.Join(t.TempDir(), "serve.json")
	s := &server{config: configPath}
	if err := s.saveConfig(config{
		Version: agentHubConfigVersion, Workspaces: []serveWorkspace{{ID: "workspace-one", Path: workspacePath}},
		AgentHubEndpoint: "http://127.0.0.1:1", AgentHubInstanceID: "pua-doctor-test",
		AgentProfiles: []agentProfileRoute{{Key: "default", AgentName: "missing-agent"}},
	}); err != nil {
		t.Fatal(err)
	}
	s.doctor = newDoctorMonitor(s)
	s.doctor.scan(context.Background())
	snapshot := s.doctor.snapshot()
	if snapshot.Complete || snapshot.Summary.Errors != 0 || snapshot.Summary.Warnings != 1 {
		t.Fatalf("catalog failure snapshot = %#v", snapshot)
	}
	if got := snapshot.Workspaces[0].Report.Issues[0].Code; got != "agent_catalog_unavailable" {
		t.Fatalf("catalog failure issue = %s", got)
	}
}
