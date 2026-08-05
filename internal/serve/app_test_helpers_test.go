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
	forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		t.Fatal(err)
	}
	session, err := forgeWorkspace.CreateSession(app.SessionLiveness{
		Type: "agenthub", SourceApp: "forge", SourceInstanceID: "forge-runtime-test",
		SourceExternalID: externalID, StartingGrace: "30s",
	})
	if err != nil {
		t.Fatal(err)
	}
	return session.ID
}

func testForgeSessions(t *testing.T, workspacePath string) []app.Session {
	t.Helper()
	forgeWorkspace, err := app.OpenWorkspace(workspacePath)
	if err != nil {
		t.Fatal(err)
	}
	sessions, err := forgeWorkspace.Sessions()
	if err != nil {
		t.Fatal(err)
	}
	return sessions
}
