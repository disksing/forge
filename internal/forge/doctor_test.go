package forge

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/disksing/forge/internal/app"
)

func doctorCatalogServer(t *testing.T) *httptest.Server {
	t.Helper()
	return httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/api/settings/agenthub" {
			http.NotFound(w, r)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"connected":true,"compatible":true,"config":{"agentProfiles":[{"key":"default","agentName":"test-agent"},{"key":"fast","agentName":"test-agent"},{"key":"reasoning","agentName":"test-agent"}]},"catalog":{"providers":[],"agents":[{"name":"test-agent","available":true}],"probes":[]}}`))
	}))
}

func TestDoctorCommandReportsJSONAndExitSemantics(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		server := doctorCatalogServer(t)
		defer server.Close()

		output := run(t, "doctor", "--json", "--server="+server.URL)
		var report app.DoctorReport
		if err := json.Unmarshal([]byte(output), &report); err != nil {
			t.Fatalf("doctor JSON = %q: %v", output, err)
		}
		if !report.Complete || report.Summary.Errors != 0 {
			t.Fatalf("healthy doctor report = %#v", report)
		}

		agentsPath := filepath.Join(root, "AGENTS.md")
		content, err := os.ReadFile(agentsPath)
		if err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(agentsPath, []byte(strings.Replace(string(content), "AgentWorkspace Agent Instructions", "Modified instructions", 1)), 0o644); err != nil {
			t.Fatal(err)
		}
		output, err = runErr(t, "doctor", "--json", "--server="+server.URL)
		var exitErr interface{ ExitCode() int }
		if err == nil || !strings.Contains(err.Error(), "found errors") || !errorsAsExit(err, &exitErr) || exitErr.ExitCode() != 1 {
			t.Fatalf("modified doctor exit = %v, output=%s", err, output)
		}
		if err := json.Unmarshal([]byte(output), &report); err != nil || report.Summary.Errors == 0 {
			t.Fatalf("error doctor JSON = %#v, %v", report, err)
		}
	})
}

func TestDoctorCommandReturnsIncompleteWithoutServer(t *testing.T) {
	withTempCwd(t, func(_ string) {
		run(t, "init")
		output, err := runErr(t, "doctor", "--json")
		var exitErr interface{ ExitCode() int }
		if err == nil || !errorsAsExit(err, &exitErr) || exitErr.ExitCode() != 2 {
			t.Fatalf("incomplete exit = %v, output=%s", err, output)
		}
		var report app.DoctorReport
		if decodeErr := json.Unmarshal([]byte(output), &report); decodeErr != nil || report.Complete {
			t.Fatalf("incomplete doctor report = %#v, %v", report, decodeErr)
		}
	})
}

func TestDoctorCommandAllowsWarnings(t *testing.T) {
	withTempCwd(t, func(root string) {
		run(t, "init")
		workspace, err := app.OpenWorkspace(root)
		if err != nil {
			t.Fatal(err)
		}
		if _, err := workspace.SetResourceAgentBinding("workspace", app.AgentBinding{Kind: "profile", Name: "missing-profile"}); err != nil {
			t.Fatal(err)
		}
		server := doctorCatalogServer(t)
		defer server.Close()

		output := run(t, "doctor", "--json", "--server="+server.URL)
		var report app.DoctorReport
		if err := json.Unmarshal([]byte(output), &report); err != nil {
			t.Fatal(err)
		}
		if !report.Complete || report.Summary.Errors != 0 || report.Summary.Warnings == 0 {
			t.Fatalf("warning-only report = %#v", report)
		}
	})
}

func errorsAsExit(err error, target *interface{ ExitCode() int }) bool {
	value, ok := err.(interface{ ExitCode() int })
	if ok {
		*target = value
	}
	return ok
}
