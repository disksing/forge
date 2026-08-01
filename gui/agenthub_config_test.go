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
		"agentProfiles":[
			{"key":"default","agentName":"kimi-k3"},
			{"key":"reasoning","agentName":"gpt-5.6-sol"},
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

func TestAgentHubSettingsSaveAllowsUnavailableProfileTarget(t *testing.T) {
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
			catalog.Agents[0].Available = false
			catalog.Agents[0].UnavailableReason = "provider disabled"
			writeFakeAgentHubJSON(t, w, catalog)
		default:
			http.NotFound(w, r)
		}
	}))
	defer fake.Close()
	path := filepath.Join(t.TempDir(), "gui.json")
	server := &server{config: path}
	request := httptest.NewRequest(http.MethodPut, "/api/settings/agenthub", strings.NewReader(`{
		"endpoint":`+strconv.Quote(fake.URL)+`,
		"agentProfiles":[
			{"key":"default","agentName":"missing-default-agent"},
			{"key":"fast","agentName":"disabled-agent"},
			{"key":"reasoning","agentName":"missing-reasoning-agent"}
		]
	}`))
	recorder := httptest.NewRecorder()
	server.handleSettings(recorder, request)
	if recorder.Code != http.StatusOK {
		t.Fatalf("save rejected unavailable targets: %d: %s", recorder.Code, recorder.Body.String())
	}
	data, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	var saved agentHubGUIConfig
	if err := json.Unmarshal(data, &saved); err != nil {
		t.Fatal(err)
	}
	for _, profile := range []struct{ key, target string }{
		{key: "default", target: "missing-default-agent"},
		{key: "fast", target: "disabled-agent"},
		{key: "reasoning", target: "missing-reasoning-agent"},
	} {
		if got := configuredAgentHubProfileTarget(saved.AgentProfiles, profile.key); got != profile.target {
			t.Fatalf("saved target for %s = %q, want %q: %+v", profile.key, got, profile.target, saved.AgentProfiles)
		}
	}
}

func TestAgentHubRunProjectionSchemaIgnoresUnknownOldFields(t *testing.T) {
	data, err := json.Marshal(agentRun{
		ID: "run-1", WorkspaceID: "workspace-1", AgentHubSessionID: "ses_1",
		AgentHubAgentName: "gpt-5.6-sol",
		SourceExternalID:  "workspace-1/run-1",
	})
	if err != nil {
		t.Fatal(err)
	}
	for _, field := range []string{
		`"agentHubSessionId":"ses_1"`,
		`"agentHubAgentName":"gpt-5.6-sol"`,
		`"sourceExternalId":"workspace-1/run-1"`,
	} {
		if !bytes.Contains(data, []byte(field)) {
			t.Fatalf("run projection is missing %s: %s", field, data)
		}
	}
	var legacy agentRun
	if err := json.Unmarshal([]byte(`{"id":"old","workspaceId":"workspace-1","providerSessionId":"thread-1","agentHubEventCursor":42,"status":"stopped"}`), &legacy); err != nil {
		t.Fatal(err)
	}
	if legacy.ID != "old" || legacy.AgentHubSessionID != "" {
		t.Fatalf("old run index record did not decode safely: %+v", legacy)
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
	if cfg.Version != 3 || cfg.AgentHubEndpoint != "http://192.168.2.150:4646" || cfg.AgentHubInstanceID != "forge-test-instance" {
		t.Fatalf("unexpected migrated config: %+v", cfg)
	}
	got := make(map[string]string)
	for _, route := range cfg.AgentProfiles {
		got[route.Key] = route.AgentName
	}
	want := map[string]string{
		"default": "kimi-k3", "fast": "kimi-k3", "reasoning": "kimi-k3",
		"codex": "gpt-5.6-sol", "deep": "gpt-5.6-sol", "kimi": "kimi-k3",
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
	if configuredAgentHubProfileTarget(cfg.AgentProfiles, "default") != "kimi-k3" || backup != path+agentHubBackupSuffix {
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

func TestCurrentAgentHubConfigMigrationReservesSystemProfiles(t *testing.T) {
	var catalog agentHubCatalog
	readJSONFixture(t, "agenthub-catalog.json", &catalog)
	cfg, err := migrateLegacyConfig(legacyGUIConfig{
		Version:                  2,
		ActiveID:                 "workspace-one",
		AgentHubEndpoint:         "http://old-agenthub:4646",
		AgentHubInstanceID:       "old-instance",
		DefaultAgentHubAgentName: "missing-default-agent",
		AgentProfiles: []legacyProfileRoute{
			{Key: "fast", Description: "old fast", AgentName: "old-fast-agent"},
			{Key: "custom", Description: "keep me", AgentName: "old-custom-agent"},
		},
	}, "http://new-agenthub:4646", "new-instance", catalog)
	if err != nil {
		t.Fatal(err)
	}
	if cfg.Version != agentHubConfigVersion || cfg.AgentHubEndpoint != "http://new-agenthub:4646" || cfg.AgentHubInstanceID != "old-instance" {
		t.Fatalf("unexpected current config migration: %+v", cfg)
	}
	for _, key := range []string{"default", "fast", "reasoning"} {
		if got := configuredAgentHubProfileTarget(cfg.AgentProfiles, key); got != "missing-default-agent" {
			t.Fatalf("system profile %s did not inherit the old default target: %q", key, got)
		}
	}
	if _, ok := findAgentHubProfileRoute(cfg.AgentProfiles, "fast"); !ok {
		t.Fatalf("system fast profile is missing: %+v", cfg.AgentProfiles)
	}
	custom, ok := findAgentHubProfileRoute(cfg.AgentProfiles, "custom")
	if !ok || custom.AgentName != "old-custom-agent" || custom.Description != "keep me" {
		t.Fatalf("custom profile was not preserved: %+v", cfg.AgentProfiles)
	}
}

func TestLegacyMigrationFailurePreservesOriginalBytes(t *testing.T) {
	original, err := os.ReadFile(filepath.Join("testdata", "legacy-gui-config.json"))
	if err != nil {
		t.Fatal(err)
	}
	var catalog agentHubCatalog
	readJSONFixture(t, "agenthub-catalog.json", &catalog)
	catalog.Agents = append(catalog.Agents, catalog.Agents[1])
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
		AgentHubEndpoint:   defaultAgentHubEndpoint,
		AgentHubInstanceID: "stable-id",
		AgentProfiles: []agentHubProfileRoute{
			{Key: " DEFAULT ", AgentName: "Gpt-5.6-Sol"},
			{Key: " DEEP ", AgentName: "gpt-5.6-sol"},
		},
	}, catalog)
	if err != nil {
		t.Fatal(err)
	}
	if cfg.AgentHubInstanceID != "stable-id" || configuredAgentHubProfileTarget(cfg.AgentProfiles, "default") != "gpt-5.6-sol" || cfg.AgentProfiles[3].Key != "deep" {
		t.Fatalf("unexpected normalized config: %+v", cfg)
	}
	for index := range cfg.AgentProfiles {
		if cfg.AgentProfiles[index].Key == "deep" {
			cfg.AgentProfiles[index].AgentName = "missing"
		}
	}
	cfg, err = normalizeAgentHubConfig(cfg, catalog)
	if err != nil || configuredAgentHubProfileTarget(cfg.AgentProfiles, "deep") != "missing" {
		t.Fatalf("expected unavailable route to be preserved, got cfg=%+v err=%v", cfg, err)
	}
}

func TestSystemAgentProfilesAreFixedAndReserved(t *testing.T) {
	var catalog agentHubCatalog
	readJSONFixture(t, "agenthub-catalog.json", &catalog)
	cfg, err := normalizeAgentHubConfig(agentHubGUIConfig{
		AgentHubEndpoint:   defaultAgentHubEndpoint,
		AgentHubInstanceID: "stable-id",
		AgentProfiles: []agentHubProfileRoute{
			{Key: "default", Description: "user override", AgentName: "gpt-5.6-sol"},
			{Key: "DEFAULT", Description: "conflicting user profile", AgentName: "kimi-k3"},
			{Key: "fast", Description: "user override", AgentName: "gpt-5.3-codex-spark"},
			{Key: "custom", Description: "custom route", AgentName: "missing-agent"},
		},
	}, catalog)
	if err != nil {
		t.Fatal(err)
	}
	if len(cfg.AgentProfiles) != len(systemAgentProfileDefinitions)+1 {
		t.Fatalf("unexpected profile count: %+v", cfg.AgentProfiles)
	}
	for _, definition := range systemAgentProfileDefinitions {
		route, ok := findAgentHubProfileRoute(cfg.AgentProfiles, definition.Key)
		if !ok || route.Description != definition.Description {
			t.Fatalf("system profile %s was not fixed: %+v", definition.Key, cfg.AgentProfiles)
		}
	}
	if _, ok := findAgentHubProfileRoute(cfg.AgentProfiles, "DEFAULT"); !ok {
		t.Fatalf("normalized default system profile is missing: %+v", cfg.AgentProfiles)
	}
	custom, ok := findAgentHubProfileRoute(cfg.AgentProfiles, "custom")
	if !ok || custom.AgentName != "missing-agent" {
		t.Fatalf("unavailable custom target was not preserved: %+v", cfg.AgentProfiles)
	}
}

func configuredAgentHubProfileTarget(routes []agentHubProfileRoute, key string) string {
	route, ok := findAgentHubProfileRoute(routes, key)
	if !ok {
		return ""
	}
	return route.AgentName
}

func findAgentHubProfileRoute(routes []agentHubProfileRoute, key string) (agentHubProfileRoute, bool) {
	key = strings.ToLower(strings.TrimSpace(key))
	for _, route := range routes {
		if strings.ToLower(strings.TrimSpace(route.Key)) == key {
			return route, true
		}
	}
	return agentHubProfileRoute{}, false
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
