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

func TestAgentListQueriesOwningServer(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.Method != http.MethodGet || r.URL.Path != "/api/settings/agenthub" {
				http.NotFound(w, r)
				return
			}
			_, _ = w.Write([]byte(`{"connected":true,"compatible":true,"catalog":{"providers":[{"id":"openai","name":"OpenAI","type":"openai","enabled":true}],"agents":[{"name":"gpt-5.6-sol","providerId":"openai","available":true},{"name":"claude-sonnet","providerId":"anthropic","available":false,"unavailableReason":"provider disabled"}],"probes":[{"providerId":"openai","type":"cli","command":"openai","available":true}]}}`))
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
		if !strings.Contains(out, "gpt-5.6-sol\topenai\tavailable") {
			t.Fatalf("agent list text = %q", out)
		}
		if !strings.Contains(out, "claude-sonnet\tanthropic\tunavailable: provider disabled") {
			t.Fatalf("agent list text = %q", out)
		}

		jsonOut := run(t, "agent", "list", "--json")
		var catalog agentHubCatalogJSON
		if err := json.Unmarshal([]byte(jsonOut), &catalog); err != nil {
			t.Fatalf("agent list --json = %q, err %v", jsonOut, err)
		}
		if len(catalog.Agents) != 2 || catalog.Agents[0].Name != "gpt-5.6-sol" {
			t.Fatalf("agent list --json catalog = %+v", catalog)
		}
		if len(catalog.Providers) != 1 || catalog.Providers[0].ID != "openai" {
			t.Fatalf("agent list --json providers = %+v", catalog.Providers)
		}
	})
}

func TestAgentListReportsServerError(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			_, _ = w.Write([]byte(`{"connected":false,"compatible":false,"error":"AgentHub unreachable","catalog":{"providers":[],"agents":[],"probes":[]}}`))
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
		"AgentHub agent catalog",
	} {
		if !strings.Contains(out, marker) {
			t.Fatalf("agent help missing %q:\n%s", marker, out)
		}
	}
}
