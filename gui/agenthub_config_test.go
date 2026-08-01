package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestReadAgentHubConfigRejectsRemovedVersion(t *testing.T) {
	path := filepath.Join(t.TempDir(), "gui.json")
	if err := os.WriteFile(path, []byte(`{"version":1,"workspaces":[]}`), 0o600); err != nil {
		t.Fatal(err)
	}
	if _, err := readAgentHubConfigFile(path); err == nil || !strings.Contains(err.Error(), "unsupported Forge GUI configuration version") {
		t.Fatalf("expected removed config version to be rejected, got %v", err)
	}
}

func TestAgentHubConfigEnvironmentOverrideAndValidation(t *testing.T) {
	t.Setenv("FORGE_AGENTHUB_URL", "http://agenthub.test:9000/")
	endpoint, err := effectiveAgentHubEndpoint("http://configured.test:4646")
	if err != nil || endpoint != "http://agenthub.test:9000" {
		t.Fatalf("environment override: %q, %v", endpoint, err)
	}
	var catalog agentHubCatalog
	readJSONFixture(t, "agenthub-catalog.json", &catalog)
	cfg, err := normalizeAgentHubConfig(agentHubGUIConfig{
		AgentHubEndpoint:         defaultAgentHubEndpoint,
		AgentHubInstanceID:       "stable-id",
		DefaultAgentHubAgentName: "Gpt-5.6-Sol",
		AgentProfiles:            []agentHubProfileRoute{{Key: " DEEP ", AgentName: "gpt-5.6-sol"}},
	}, catalog)
	if err != nil {
		t.Fatal(err)
	}
	if cfg.AgentHubInstanceID != "stable-id" || cfg.DefaultAgentHubAgentName != "gpt-5.6-sol" || cfg.AgentProfiles[0].Key != "deep" {
		t.Fatalf("unexpected normalized config: %+v", cfg)
	}
	cfg.AgentProfiles[0].AgentName = "missing"
	if _, err := normalizeAgentHubConfig(cfg, catalog); err == nil || !strings.Contains(err.Error(), "unavailable") {
		t.Fatalf("expected missing route error, got %v", err)
	}
}

func readJSONFixture(t *testing.T, name string, output any) {
	t.Helper()
	data, err := os.ReadFile(filepath.Join("testdata", name))
	if err != nil {
		t.Fatal(err)
	}
	if err := json.Unmarshal(data, output); err != nil {
		t.Fatal(err)
	}
}
