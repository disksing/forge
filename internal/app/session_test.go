package app_test

import (
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/disksing/forge/internal/app"
)

func TestSessionAPIExposesOnlyAgentHubRecordsAndReadDoesNotRewrite(t *testing.T) {
	root := t.TempDir()
	workspace, err := app.Initialize(root, "en")
	if err != nil {
		t.Fatal(err)
	}
	path := filepath.Join(root, "forge-sessions.json")
	legacy := `{"version":1,"sessions":[` +
		`{"id":"legacy-pid","primary":"project1.task1","liveness":{"type":"pid","pid":123},"startedAt":"2026-01-01T00:00:00Z","updatedAt":"2026-01-01T00:00:00Z"},` +
		`{"id":"session-agenthub","controls":[{"resourceId":"project1.task1"}],"liveness":{"type":"agenthub","sourceApp":"forge","sourceInstanceId":"instance","sourceExternalId":"workspace/run"},"startedAt":"2026-01-02T00:00:00Z","updatedAt":"2026-01-02T00:00:00Z"}]}`
	if err := os.WriteFile(path, []byte(legacy), 0o644); err != nil {
		t.Fatal(err)
	}

	sessions, err := workspace.Sessions()
	if err != nil {
		t.Fatal(err)
	}
	if len(sessions) != 1 || sessions[0].ID != "session-agenthub" {
		t.Fatalf("unexpected sessions: %#v", sessions)
	}
	if _, err := workspace.Session("legacy-pid"); err == nil {
		t.Fatal("legacy PID session should not be exposed")
	}
	if data, err := os.ReadFile(path); err != nil {
		t.Fatal(err)
	} else if string(data) != legacy {
		t.Fatalf("read-only session API rewrote the store: %s", data)
	}
}

func TestSessionMutationRejectsLegacyTypeAndDropsLegacyRecords(t *testing.T) {
	root := t.TempDir()
	workspace, err := app.Initialize(root, "en")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := workspace.CreateSession(app.SessionLiveness{Type: "heartbeat"}); err == nil {
		t.Fatal("heartbeat session creation should be rejected")
	}
	path := filepath.Join(root, "forge-sessions.json")
	legacy := `{"version":1,"sessions":[{"id":"legacy-heartbeat","liveness":{"type":"heartbeat","timeout":"1h"},"startedAt":"2026-01-01T00:00:00Z","updatedAt":"2026-01-01T00:00:00Z"}]}`
	if err := os.WriteFile(path, []byte(legacy), 0o644); err != nil {
		t.Fatal(err)
	}
	created, err := workspace.CreateSession(app.SessionLiveness{
		Type: "agenthub", SourceApp: "forge", SourceInstanceID: "instance", SourceExternalID: "workspace/run",
	})
	if err != nil {
		t.Fatal(err)
	}
	if _, err := workspace.BindAgentHubSession(created.ID, "ses_one"); err != nil {
		t.Fatal(err)
	}
	data, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	if strings.Contains(string(data), "legacy-heartbeat") || strings.Contains(string(data), `"timeout"`) {
		t.Fatalf("legacy liveness survived a production mutation: %s", data)
	}
}
