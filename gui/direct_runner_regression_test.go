package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestProductionHasNoDirectProviderRunner(t *testing.T) {
	for _, name := range []string{"codex.go", "opencode.go", "pi.go"} {
		if _, err := os.Stat(name); !os.IsNotExist(err) {
			t.Fatalf("direct provider runner file must not exist: %s", name)
		}
	}

	forbidden := []string{
		"FORGE_CODEX_CLI",
		"FORGE_KIMI_CLI",
		"FORGE_OPENCODE_CLI",
		"FORGE_PI_CLI",
		"codexAppServer",
		"opencodeAppServer",
		"piRPCProvider",
		"providerForRun(",
		"startProvidersIfEnabled(",
		"agentConfigAvailable(",
		`"/api/settings/codex/`,
		`"/api/settings/opencode/`,
		`"/api/settings/kimi/`,
		`"/api/settings/pi/`,
	}
	entries, err := os.ReadDir(".")
	if err != nil {
		t.Fatal(err)
	}
	for _, entry := range entries {
		name := entry.Name()
		if entry.IsDir() || !strings.HasSuffix(name, ".go") || strings.HasSuffix(name, "_test.go") ||
			name == "agenthub_client.go" || name == "agenthub_config.go" {
			continue
		}
		data, err := os.ReadFile(name)
		if err != nil {
			t.Fatal(err)
		}
		source := string(data)
		for _, token := range forbidden {
			if strings.Contains(source, token) {
				t.Fatalf("production file %s reintroduced direct runner token %q", name, token)
			}
		}
	}
}

func TestCurrentRunSchemaDoesNotWriteLegacyProviderFields(t *testing.T) {
	data, err := os.ReadFile("agent.go")
	if err != nil {
		t.Fatal(err)
	}
	source := string(data)
	for _, tag := range []string{
		`json:"provider"`,
		`json:"providerSessionId`,
		`json:"codexThreadId`,
		`json:"codexTurnId`,
		`json:"model`,
		`json:"sandbox`,
		`json:"approval`,
	} {
		if strings.Contains(source, tag) {
			t.Fatalf("current run schema reintroduced legacy field tag %q", tag)
		}
	}
}

func TestFrontendHasNoDirectRunnerSettingsOrFallback(t *testing.T) {
	data, err := os.ReadFile(filepath.Join("static", "app.js"))
	if err != nil {
		t.Fatal(err)
	}
	source := string(data)
	for _, token := range []string{
		"/api/settings/codex/",
		"/api/settings/opencode/",
		"/api/settings/kimi/",
		"/api/settings/pi/",
		"toggleAgentProvider(",
		"settingsProvidersPanel(",
		"settingsAgentsPanel(",
		"normalizedProviderAgentOptions(",
		"run.provider ===",
		"codexTurnId",
	} {
		if strings.Contains(source, token) {
			t.Fatalf("frontend reintroduced direct runner setting or fallback %q", token)
		}
	}
}

func TestProductionHasNoLegacyEventPipeline(t *testing.T) {
	files := []string{"agent.go", "agenthub_runtime.go", filepath.Join("static", "app.js")}
	forbidden := []string{
		"translateAgentHub" + "Event",
		"displayAgent" + "Events",
		"coalesceAgent" + "Events",
		"shouldDisplayAgent" + "Event",
		"appendAgent" + "Event",
		"loadAgent" + "Events",
		"agentEvents" + "Path",
		"toolEvent" + "Summary",
	}
	for _, name := range files {
		data, err := os.ReadFile(name)
		if err != nil {
			t.Fatal(err)
		}
		for _, token := range forbidden {
			if strings.Contains(string(data), token) {
				t.Fatalf("production file %s reintroduced legacy event pipeline symbol %q", name, token)
			}
		}
	}
}
