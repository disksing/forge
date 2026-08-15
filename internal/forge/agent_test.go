package forge

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

const agentListServerResponse = `{
  "connected": true,
  "compatible": true,
  "config": {
    "agentProfiles": [
      {"key": "default", "description": "Balanced, recommended agent", "agentName": "gpt-5.6-sol"},
      {"key": "fast", "description": "Faster responses for simple tasks", "agentName": "gpt-5.6-sol"},
      {"key": "reasoning", "description": "More thorough reasoning for complex tasks", "agentName": "claude-sonnet"}
    ]
  },
  "catalog": {
    "providers": [{"id": "openai", "name": "OpenAI", "type": "openai", "enabled": true}],
    "agents": [
      {"name": "gpt-5.6-sol", "providerId": "openai", "available": true},
      {"name": "claude-sonnet", "providerId": "anthropic", "available": false, "unavailableReason": "provider disabled"}
    ],
    "probes": [{"providerId": "openai", "type": "cli", "command": "openai", "available": true}]
  }
}`

func TestAgentListQueriesOwningServer(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.Method != http.MethodGet || r.URL.Path != "/api/settings/agenthub" {
				http.NotFound(w, r)
				return
			}
			_, _ = w.Write([]byte(agentListServerResponse))
		}))
		defer server.Close()
		lock := map[string]any{"pid": os.Getpid(), "address": server.URL, "workspacePath": root}
		data, err := json.Marshal(lock)
		if err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(filepath.Join(root, ".forge", "serve.lock"), data, 0o600); err != nil {
			t.Fatal(err)
		}

		out := run(t, "agent", "list")
		for _, marker := range []string{
			"Profiles",
			"default\tgpt-5.6-sol\tBalanced, recommended agent",
			"fast\tgpt-5.6-sol\tFaster responses for simple tasks",
			"reasoning\tclaude-sonnet\tMore thorough reasoning for complex tasks",
			"Agents",
			"gpt-5.6-sol\topenai\tavailable",
			"claude-sonnet\tanthropic\tunavailable: provider disabled",
		} {
			if !strings.Contains(out, marker) {
				t.Fatalf("agent list text missing %q:\n%s", marker, out)
			}
		}

		jsonOut := run(t, "agent", "list", "--json")
		var result agentListResult
		if err := json.Unmarshal([]byte(jsonOut), &result); err != nil {
			t.Fatalf("agent list --json = %q, err %v", jsonOut, err)
		}
		if len(result.Profiles) != 3 || result.Profiles[0].Key != "default" || result.Profiles[0].AgentName != "gpt-5.6-sol" {
			t.Fatalf("agent list --json profiles = %+v", result.Profiles)
		}
		if len(result.Catalog.Agents) != 2 || result.Catalog.Agents[0].Name != "gpt-5.6-sol" {
			t.Fatalf("agent list --json catalog = %+v", result.Catalog)
		}
		if len(result.Catalog.Providers) != 1 || result.Catalog.Providers[0].ID != "openai" {
			t.Fatalf("agent list --json providers = %+v", result.Catalog.Providers)
		}
	})
}

func TestAgentListReportsServerError(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			_, _ = w.Write([]byte(`{"connected":false,"compatible":false,"error":"AgentHub unreachable","config":{},"catalog":{"providers":[],"agents":[],"probes":[]}}`))
		}))
		defer server.Close()
		lock := map[string]any{"pid": os.Getpid(), "address": server.URL, "workspacePath": root}
		data, err := json.Marshal(lock)
		if err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(filepath.Join(root, ".forge", "serve.lock"), data, 0o600); err != nil {
			t.Fatal(err)
		}
		_, err = runErr(t, "agent", "list")
		if err == nil || !strings.Contains(err.Error(), "AgentHub unreachable") {
			t.Fatalf("expected agent list error, got %v", err)
		}
	})
}

func TestAgentHelp(t *testing.T) {
	out := run(t, "help", "agent")
	for _, marker := range []string{
		"forge agent list [--server=<url>] [--json]",
		"Agent Profiles",
	} {
		if !strings.Contains(out, marker) {
			t.Fatalf("agent help missing %q:\n%s", marker, out)
		}
	}
}
