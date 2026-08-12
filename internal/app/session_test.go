package app_test

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/disksing/forge/internal/app"
)

func TestLegacySessionResourceFieldsAreIgnoredAndRemoved(t *testing.T) {
	root := t.TempDir()
	workspace, err := app.Initialize(root, "en")
	if err != nil {
		t.Fatal(err)
	}
	now := time.Now().Add(-time.Minute).Format(time.RFC3339)
	// Use this process so stale-session pruning retains the compatibility record.
	legacy := fmt.Sprintf(`{"version":1,"sessions":[{"id":"session-legacy","primary":"project1.task1","controls":[{"resourceId":"project1.task1","path":"project1/task1"}],"liveness":{"type":"pid","pid":%d},"startedAt":"%s","updatedAt":"%s"}]}`, os.Getpid(), now, now)
	path := filepath.Join(root, "forge-sessions.json")
	if err := os.WriteFile(path, []byte(legacy), 0o644); err != nil {
		t.Fatal(err)
	}

	sessions, err := workspace.Sessions()
	if err != nil {
		t.Fatal(err)
	}
	if len(sessions) != 1 || sessions[0].ID != "session-legacy" {
		t.Fatalf("legacy session was not retained: %#v", sessions)
	}
	if _, err := workspace.Heartbeat("session-legacy"); err != nil {
		t.Fatal(err)
	}
	data, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	if strings.Contains(string(data), `"primary"`) || strings.Contains(string(data), `"controls"`) {
		t.Fatalf("legacy resource ownership fields survived rewrite: %s", data)
	}
}
