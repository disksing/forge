package main

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"reflect"
	"strconv"
	"strings"
	"testing"
)

func TestAgentHubSettingsSaveValidatesAndMigrates(t *testing.T) {
	var catalog agentHubCatalog
	readJSONFixture(t, "agenthub-catalog.json", &catalog)
	fake := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		switch r.URL.Path {
		case "/v1/status":
			writeFakeAgentHubJSON(t, w, map[string]any{
				"apiVersion": "1", "capabilities": requiredAgentHubCapabilities, "version": "test",
			})
		case "/v1/agents":
			writeFakeAgentHubJSON(t, w, catalog)
		default:
			http.NotFound(w, r)
		}
	}))
	defer fake.Close()
	t.Setenv("FORGE_AGENTHUB_URL", "")
	original, err := os.ReadFile(filepath.Join("testdata", "legacy-gui-config.json"))
	if err != nil {
		t.Fatal(err)
	}
	path := filepath.Join(t.TempDir(), "gui.json")
	if err := os.WriteFile(path, original, 0o600); err != nil {
		t.Fatal(err)
	}
	server := &server{config: path}
	request := httptest.NewRequest(http.MethodPut, "/api/settings/agenthub", strings.NewReader(`{
		"endpoint":`+strconv.Quote(fake.URL)+`,
		"defaultAgentName":"kimi-k3",
		"agentProfiles":[
			{"key":"codex","description":"deep","agentName":"gpt-5.6-sol"},
			{"key":"fast","agentName":"gpt-5.3-codex-spark"}
		]
	}`))
	recorder := httptest.NewRecorder()
	server.handleSettings(recorder, request)
	if recorder.Code != http.StatusOK {
		t.Fatalf("save returned %d: %s", recorder.Code, recorder.Body.String())
	}
	if _, err := os.Stat(path + agentHubBackupSuffix); err != nil {
		t.Fatalf("migration backup missing: %v", err)
	}
	saved, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	if bytes.Contains(saved, []byte(`"agentProviders"`)) || !bytes.Contains(saved, []byte(`"agentHubInstanceId"`)) {
		t.Fatalf("unexpected persisted config: %s", saved)
	}
	usesAgentHub, err := server.validatePersistedAgentHubConfig(context.Background())
	if err != nil || !usesAgentHub {
		t.Fatalf("startup validation: uses=%v err=%v", usesAgentHub, err)
	}
}

func TestAgentHubRunProjectionSchemaAndLegacyHistory(t *testing.T) {
	data, err := json.Marshal(agentRun{
		ID: "run-1", WorkspaceID: "workspace-1", AgentHubSessionID: "ses_1",
		AgentHubEventCursor: 42, AgentHubAgentName: "gpt-5.6-sol",
		SourceExternalID: "workspace-1/run-1",
	})
	if err != nil {
		t.Fatal(err)
	}
	for _, field := range []string{
		`"agentHubSessionId":"ses_1"`,
		`"agentHubEventCursor":42`,
		`"agentHubAgentName":"gpt-5.6-sol"`,
		`"sourceExternalId":"workspace-1/run-1"`,
	} {
		if !bytes.Contains(data, []byte(field)) {
			t.Fatalf("run projection is missing %s: %s", field, data)
		}
	}
	var legacy agentRun
	if err := json.Unmarshal([]byte(`{"id":"old","workspaceId":"workspace-1","providerSessionId":"thread-1","status":"stopped"}`), &legacy); err != nil {
		t.Fatal(err)
	}
	if legacy.ID != "old" || legacy.AgentHubSessionID != "" {
		t.Fatalf("legacy run history did not remain readable: %+v", legacy)
	}
}

func TestMigrateCurrentGUIConfigFixture(t *testing.T) {
	var legacy legacyGUIConfig
	readJSONFixture(t, "legacy-gui-config.json", &legacy)
	var catalog agentHubCatalog
	readJSONFixture(t, "agenthub-catalog.json", &catalog)
	cfg, err := migrateLegacyConfig(legacy, "http://192.168.2.150:4646/", "forge-test-instance", catalog)
	if err != nil {
		t.Fatal(err)
	}
	if cfg.Version != 2 || cfg.AgentHubEndpoint != "http://192.168.2.150:4646" || cfg.AgentHubInstanceID != "forge-test-instance" {
		t.Fatalf("unexpected migrated config: %+v", cfg)
	}
	if cfg.DefaultAgentHubAgentName != "kimi-k3" {
		t.Fatalf("unexpected default: %q", cfg.DefaultAgentHubAgentName)
	}
	got := make(map[string]string)
	for _, route := range cfg.AgentProfiles {
		got[route.Key] = route.AgentName
	}
	want := map[string]string{
		"codex": "gpt-5.6-sol", "deep": "gpt-5.6-sol",
		"fast": "gpt-5.3-codex-spark", "kimi": "kimi-k3",
		"frontend": "kimi-k3", "grok": "grok-4.5",
	}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("unexpected profile migration:\ngot  %#v\nwant %#v", got, want)
	}
	data, err := json.Marshal(cfg)
	if err != nil {
		t.Fatal(err)
	}
	for _, removed := range []string{"defaultChatAgentId", "agentProviders", `"agents"`, `"agentId"`} {
		if bytes.Contains(data, []byte(removed)) {
			t.Errorf("migrated config still contains legacy field %s: %s", removed, data)
		}
	}
}

func TestLegacyConfigFileMigrationBacksUpAndWritesAtomically(t *testing.T) {
	original, err := os.ReadFile(filepath.Join("testdata", "legacy-gui-config.json"))
	if err != nil {
		t.Fatal(err)
	}
	var catalog agentHubCatalog
	readJSONFixture(t, "agenthub-catalog.json", &catalog)
	path := filepath.Join(t.TempDir(), "gui.json")
	if err := os.WriteFile(path, original, 0o644); err != nil {
		t.Fatal(err)
	}
	cfg, backup, err := migrateLegacyGUIConfigFile(path, defaultAgentHubEndpoint, "forge-test", catalog)
	if err != nil {
		t.Fatal(err)
	}
	if cfg.DefaultAgentHubAgentName != "kimi-k3" || backup != path+agentHubBackupSuffix {
		t.Fatalf("unexpected migration result: %+v, %q", cfg, backup)
	}
	backupData, err := os.ReadFile(backup)
	if err != nil {
		t.Fatal(err)
	}
	if !bytes.Equal(backupData, original) {
		t.Fatal("backup differs from the original config bytes")
	}
	var saved map[string]json.RawMessage
	savedData, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	if err := json.Unmarshal(savedData, &saved); err != nil {
		t.Fatal(err)
	}
	for _, field := range []string{"agentProviders", "agents", "defaultChatAgentId"} {
		if _, exists := saved[field]; exists {
			t.Fatalf("legacy field %q was persisted", field)
		}
	}
	if mode := fileMode(t, path); mode != 0o600 {
		t.Fatalf("migrated config mode is %o, want 600", mode)
	}
	if mode := fileMode(t, backup); mode != 0o600 {
		t.Fatalf("backup mode is %o, want 600", mode)
	}
}

func TestLegacyMigrationFailurePreservesOriginalBytes(t *testing.T) {
	original, err := os.ReadFile(filepath.Join("testdata", "legacy-gui-config.json"))
	if err != nil {
		t.Fatal(err)
	}
	var catalog agentHubCatalog
	readJSONFixture(t, "agenthub-catalog.json", &catalog)
	catalog.Agents = append(catalog.Agents, catalog.Agents[0])
	path := filepath.Join(t.TempDir(), "gui.json")
	if err := os.WriteFile(path, original, 0o644); err != nil {
		t.Fatal(err)
	}
	_, backup, err := migrateLegacyGUIConfigFile(path, defaultAgentHubEndpoint, "forge-test", catalog)
	if err == nil || !strings.Contains(err.Error(), "ambiguous") {
		t.Fatalf("expected actionable ambiguity error, got %v", err)
	}
	if backup != "" {
		t.Fatalf("failed preflight should not create a backup, got %q", backup)
	}
	after, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	if !bytes.Equal(after, original) {
		t.Fatal("failed migration changed the original config bytes")
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

func fileMode(t *testing.T, path string) os.FileMode {
	t.Helper()
	info, err := os.Stat(path)
	if err != nil {
		t.Fatal(err)
	}
	return info.Mode().Perm()
}
