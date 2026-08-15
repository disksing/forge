package serve

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"testing"
)

func TestReadAgentHubConfigRejectsRemovedVersion(t *testing.T) {
	path := filepath.Join(t.TempDir(), "gui.json")
	if err := os.WriteFile(path, []byte(`{"version":2,"workspaces":[]}`), 0o600); err != nil {
		t.Fatal(err)
	}
	if _, err := readAgentHubConfigFile(path); err == nil || !strings.Contains(err.Error(), "unsupported Forge GUI configuration version") {
		t.Fatalf("expected removed config version to be rejected, got %v", err)
	}
}

func TestReadAgentHubConfigUpgradesVersionThreeDefaults(t *testing.T) {
	path := filepath.Join(t.TempDir(), "gui.json")
	if err := os.WriteFile(path, []byte(`{"version":3,"workspaces":[],"agentHubEndpoint":"http://127.0.0.1:4646","agentHubInstanceId":"forge-old"}`), 0o600); err != nil {
		t.Fatal(err)
	}
	cfg, err := readAgentHubConfigFile(path)
	if err != nil {
		t.Fatal(err)
	}
	if cfg.Version != 5 || cfg.ResourceDefaults != defaultResourceAgentDefaults() {
		t.Fatalf("upgraded config = %#v", cfg)
	}
	data, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	if !bytes.Contains(data, []byte(`"version": 5`)) || !bytes.Contains(data, []byte(`"resourceDefaults"`)) || !bytes.Contains(data, []byte(`"kind": "profile"`)) {
		t.Fatalf("version three config was not written back: %s", data)
	}
}

func TestReadAgentHubConfigMigratesLegacyStringResourceDefaults(t *testing.T) {
	path := filepath.Join(t.TempDir(), "gui.json")
	legacy := `{"version":4,"workspaces":[],"agentHubEndpoint":"http://127.0.0.1:4646","agentHubInstanceId":"forge-old","resourceDefaults":{"workspace":"fast","project":"default","task":"reasoning"}}`
	if err := os.WriteFile(path, []byte(legacy), 0o600); err != nil {
		t.Fatal(err)
	}
	cfg, err := readAgentHubConfigFile(path)
	if err != nil {
		t.Fatal(err)
	}
	expected := resourceAgentDefaults{
		Workspace: resourceDefaultBinding{Kind: "profile", Name: "fast"},
		Project:   resourceDefaultBinding{Kind: "profile", Name: "default"},
		Task:      resourceDefaultBinding{Kind: "profile", Name: "reasoning"},
	}
	if cfg.Version != 5 || cfg.ResourceDefaults != expected {
		t.Fatalf("migrated config = %#v", cfg)
	}
	data, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	if !bytes.Contains(data, []byte(`"version": 5`)) || !bytes.Contains(data, []byte(`"kind": "profile"`)) || bytes.Contains(data, []byte(`"workspace": "fast"`)) {
		t.Fatalf("legacy defaults were not rewritten in structured form: %s", data)
	}
}

func TestAgentHubSettingsSaveValidatesCurrentConfig(t *testing.T) {
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
	path := filepath.Join(t.TempDir(), "gui.json")
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
	server.handleAgentHubSettings(recorder, request)
	if recorder.Code != http.StatusOK {
		t.Fatalf("save returned %d: %s", recorder.Code, recorder.Body.String())
	}
	saved, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	if !bytes.Contains(saved, []byte(`"version": 5`)) || !bytes.Contains(saved, []byte(`"agentHubInstanceId"`)) || !bytes.Contains(saved, []byte(`"resourceDefaults"`)) {
		t.Fatalf("unexpected persisted config: %s", saved)
	}
	if bytes.Contains(saved, []byte(`"agentProviders"`)) || bytes.Contains(saved, []byte(`"defaultChatAgentId"`)) {
		t.Fatalf("persisted config contains removed fields: %s", saved)
	}
	var savedConfig agentHubGUIConfig
	if err := json.Unmarshal(saved, &savedConfig); err != nil {
		t.Fatal(err)
	}
	if _, ok := findAgentHubProfileRoute(savedConfig.AgentProfiles, "scheduler"); ok {
		t.Fatalf("save synthesized a scheduler profile: %+v", savedConfig.AgentProfiles)
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
			{"key":"reasoning","agentName":"missing-reasoning-agent"},
			{"key":"scheduler","agentName":"missing-scheduler-agent"}
		]
	}`))
	recorder := httptest.NewRecorder()
	server.handleAgentHubSettings(recorder, request)
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
		{key: "scheduler", target: "missing-scheduler-agent"},
	} {
		if got := configuredAgentHubProfileTarget(saved.AgentProfiles, profile.key); got != profile.target {
			t.Fatalf("saved target for %s = %q, want %q: %+v", profile.key, got, profile.target, saved.AgentProfiles)
		}
	}
}

func TestAgentHubSettingsReadDoesNotSynthesizeScheduler(t *testing.T) {
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
	path := filepath.Join(t.TempDir(), "gui.json")
	legacy := agentHubGUIConfig{
		Version: agentHubConfigVersion, AgentHubEndpoint: fake.URL,
		AgentHubInstanceID: "stable-id",
		AgentProfiles: []agentHubProfileRoute{
			{Key: "default", AgentName: "kimi-k3"},
			{Key: "fast", AgentName: "gpt-5.3-codex-spark"},
			{Key: "reasoning", AgentName: "gpt-5.6-sol"},
		},
	}
	data, err := json.Marshal(legacy)
	if err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(path, data, 0o600); err != nil {
		t.Fatal(err)
	}
	server := &server{config: path}
	response, err := server.readAgentHubSettings(context.Background())
	if err != nil {
		t.Fatal(err)
	}
	if _, ok := findAgentHubProfileRoute(response.Config.AgentProfiles, "scheduler"); ok {
		t.Fatalf("settings response synthesized scheduler: %+v", response.Config.AgentProfiles)
	}
	persisted, err := readAgentHubConfigFile(path)
	if err != nil {
		t.Fatal(err)
	}
	if _, ok := findAgentHubProfileRoute(persisted.AgentProfiles, "scheduler"); ok {
		t.Fatalf("settings normalization persisted scheduler: %+v", persisted.AgentProfiles)
	}
	reloaded, err := server.readAgentHubSettings(context.Background())
	if err != nil {
		t.Fatal(err)
	}
	if _, ok := findAgentHubProfileRoute(reloaded.Config.AgentProfiles, "scheduler"); ok {
		t.Fatalf("settings reload synthesized scheduler: %+v", reloaded.Config.AgentProfiles)
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
	var current agentRun
	if err := json.Unmarshal([]byte(`{"id":"old","workspaceId":"workspace-1","providerSessionId":"thread-1","agentHubEventCursor":42,"status":"stopped"}`), &current); err != nil {
		t.Fatal(err)
	}
	if current.ID != "old" || current.AgentHubSessionID != "" {
		t.Fatalf("unknown old run fields changed current projection: %+v", current)
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
	if cfg.Version != agentHubConfigVersion || cfg.AgentHubInstanceID != "stable-id" || configuredAgentHubProfileTarget(cfg.AgentProfiles, "default") != "gpt-5.6-sol" {
		t.Fatalf("unexpected normalized config: %+v", cfg)
	}
	if len(cfg.AgentProfiles) != len(systemAgentProfileDefinitions)+1 || configuredAgentHubProfileTarget(cfg.AgentProfiles, "deep") != "gpt-5.6-sol" {
		t.Fatalf("unexpected normalized profile routes: %+v", cfg.AgentProfiles)
	}
	if _, ok := findAgentHubProfileRoute(cfg.AgentProfiles, "scheduler"); ok {
		t.Fatalf("normalization synthesized scheduler: %+v", cfg.AgentProfiles)
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
			{Key: "SCHEDULER", Description: "user override", AgentName: "grok-4.5"},
			{Key: "custom", Description: "custom route", AgentName: "missing-agent"},
		},
	}, catalog)
	if err != nil {
		t.Fatal(err)
	}
	if len(cfg.AgentProfiles) != len(systemAgentProfileDefinitions)+2 {
		t.Fatalf("unexpected profile count: %+v", cfg.AgentProfiles)
	}
	for _, definition := range systemAgentProfileDefinitions {
		route, ok := findAgentHubProfileRoute(cfg.AgentProfiles, definition.Key)
		if !ok || route.Description != definition.Description {
			t.Fatalf("system profile %s was not fixed: %+v", definition.Key, cfg.AgentProfiles)
		}
	}
	custom, ok := findAgentHubProfileRoute(cfg.AgentProfiles, "custom")
	if !ok || custom.AgentName != "missing-agent" {
		t.Fatalf("unavailable custom target was not preserved: %+v", cfg.AgentProfiles)
	}
	if got := configuredAgentHubProfileTarget(cfg.AgentProfiles, "scheduler"); got != "grok-4.5" {
		t.Fatalf("ordinary custom scheduler target was not preserved: %q (%+v)", got, cfg.AgentProfiles)
	}
	scheduler, ok := findAgentHubProfileRoute(cfg.AgentProfiles, "scheduler")
	if !ok || scheduler.Description != "user override" {
		t.Fatalf("scheduler should be normalized as an ordinary custom profile: %+v", cfg.AgentProfiles)
	}
}

func TestNoSchedulerProfileIsSynthesized(t *testing.T) {
	var catalog agentHubCatalog
	readJSONFixture(t, "agenthub-catalog.json", &catalog)
	cfg, err := normalizeAgentHubConfig(agentHubGUIConfig{
		AgentHubEndpoint: defaultAgentHubEndpoint, AgentHubInstanceID: "stable-id",
	}, catalog)
	if err != nil {
		t.Fatal(err)
	}
	if _, ok := findAgentHubProfileRoute(cfg.AgentProfiles, "scheduler"); ok {
		t.Fatalf("scheduler was synthesized: %+v", cfg.AgentProfiles)
	}
}

func TestMissingTypedResourceDefaultIsPersistedAndFallsBackGlobally(t *testing.T) {
	var catalog agentHubCatalog
	readJSONFixture(t, "agenthub-catalog.json", &catalog)
	cfg, err := normalizeAgentHubConfig(agentHubGUIConfig{
		AgentHubEndpoint: defaultAgentHubEndpoint, AgentHubInstanceID: "stable-id",
		AgentProfiles:    []agentHubProfileRoute{{Key: "default", AgentName: "gpt-5.6-sol"}},
		ResourceDefaults: resourceAgentDefaults{
			Workspace: resourceDefaultBinding{Kind: "profile", Name: "default"},
			Project:   resourceDefaultBinding{Kind: "profile", Name: "deleted-project-default"},
			Task:      resourceDefaultBinding{Kind: "profile", Name: "default"},
		},
	}, catalog)
	if err != nil {
		t.Fatal(err)
	}
	if cfg.ResourceDefaults.Project.Name != "deleted-project-default" {
		t.Fatalf("normalization rewrote unresolved configured default: %+v", cfg.ResourceDefaults)
	}
	effective := effectiveResourceAgentDefaults(cfg.ResourceDefaults, toConfigProfileRoutes(cfg.AgentProfiles))
	if effective.Project != (resourceDefaultBinding{Kind: "profile", Name: "default"}) {
		t.Fatalf("missing Project default did not fall back globally: %+v", effective)
	}
}

func TestLoadConfigDoesNotPersistSchedulerMigration(t *testing.T) {
	path := filepath.Join(t.TempDir(), "gui.json")
	legacy := agentHubGUIConfig{
		Version: agentHubConfigVersion, AgentHubEndpoint: defaultAgentHubEndpoint,
		AgentHubInstanceID: "stable-id",
		AgentProfiles: []agentHubProfileRoute{
			{Key: "default", AgentName: "default-agent"},
			{Key: "fast", AgentName: "fast-agent"},
			{Key: "reasoning", AgentName: "reasoning-agent"},
		},
	}
	data, err := json.Marshal(legacy)
	if err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(path, data, 0o600); err != nil {
		t.Fatal(err)
	}
	srv := &server{config: path}
	cfg, err := srv.loadConfig()
	if err != nil {
		t.Fatal(err)
	}
	if got := configuredAgentProfileName(cfg.AgentProfiles, "scheduler"); got != "" {
		t.Fatalf("load synthesized scheduler target %q: %+v", got, cfg.AgentProfiles)
	}
	persisted, err := readAgentHubConfigFile(path)
	if err != nil {
		t.Fatal(err)
	}
	if _, ok := findAgentHubProfileRoute(persisted.AgentProfiles, "scheduler"); ok {
		t.Fatalf("load persisted scheduler: %+v", persisted.AgentProfiles)
	}
	reloaded, err := (&server{config: path}).loadConfig()
	if err != nil {
		t.Fatal(err)
	}
	if got := configuredAgentProfileName(reloaded.AgentProfiles, "scheduler"); got != "" {
		t.Fatalf("reload synthesized scheduler target %q: %+v", got, reloaded.AgentProfiles)
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
