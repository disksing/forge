package serve

import (
	"testing"

	"github.com/disksing/forge/internal/app"
)

func openTestForgeWorkspace(t *testing.T, path, language string) *app.Workspace {
	t.Helper()
	workspace, err := app.Initialize(path, language)
	if err != nil {
		t.Fatal(err)
	}
	return workspace
}

func seedTestForgeSession(t *testing.T, workspace guiWorkspace, externalID string) string {
	t.Helper()
	return "legacy-session-" + newRunID()
}

type testForgeSession struct {
	ID       string
	Liveness struct {
		AgentHubSessionID string
	}
}

func testForgeSessions(t *testing.T, workspacePath string) []testForgeSession {
	t.Helper()
	runs, err := loadAgentRuns(workspacePath)
	if err != nil {
		t.Fatal(err)
	}
	sessions := make([]testForgeSession, 0, len(runs))
	for _, run := range runs {
		if run.ForgeSessionID == "" || (run.Status == "stopped" && run.AgentHubStoppedObserved) {
			continue
		}
		sessions = append(sessions, testForgeSession{
			ID:       run.ForgeSessionID,
			Liveness: struct{ AgentHubSessionID string }{AgentHubSessionID: run.AgentHubSessionID},
		})
	}
	return sessions
}
