package serve

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestLegacySelfDrivingRunAndSessionContextMigrationIsIdempotent(t *testing.T) {
	workspace := t.TempDir()
	contextPath := filepath.Join(workspace, "project1", "task1", ".forge", "codex-session.json")
	if err := os.MkdirAll(filepath.Dir(contextPath), 0o755); err != nil {
		t.Fatal(err)
	}
	contextJSON := `{"version":2,"workspaceId":"workspace-one","resourceId":"project1.task1","runId":"run-one","forgeSessionId":"session-one","autoRunGeneration":9}`
	if err := os.WriteFile(contextPath, []byte(contextJSON), 0o600); err != nil {
		t.Fatal(err)
	}
	indexPath := agentIndexPath(workspace)
	if err := os.MkdirAll(filepath.Dir(indexPath), 0o755); err != nil {
		t.Fatal(err)
	}
	raw := []map[string]any{{
		"id": "run-one", "workspaceId": "workspace-one", "resourceId": "project1.task1",
		"forgeSessionId": "session-one", "forgeSessionContextPath": contextPath,
		"agentHubSessionId": "ses-one", "sourceExternalId": "workspace-one/run-one",
		"title": "Legacy running", "cwd": workspace, "status": "running",
		"schedulerTurn": true, "autoRunGeneration": 9, "schedulerTurnId": "turn-one", "schedulerTurnSequence": 4,
		"createdAt": "2026-08-01T00:00:00Z", "updatedAt": "2026-08-01T00:00:01Z",
	}}
	encoded, _ := json.MarshalIndent(raw, "", "  ")
	if err := os.WriteFile(indexPath, append(encoded, '\n'), 0o644); err != nil {
		t.Fatal(err)
	}

	runs, err := loadAgentRuns(workspace)
	if err != nil {
		t.Fatal(err)
	}
	if len(runs) != 1 || runs[0].SelfDrivingGeneration != 9 || !runs[0].SchedulerTurn || runs[0].SchedulerTurnID != "turn-one" || runs[0].SchedulerTurnSequence != 4 || runs[0].Status != "running" || runs[0].AgentHubSessionID != "ses-one" || runs[0].SourceExternalID != "workspace-one/run-one" {
		t.Fatalf("run migration lost recovery state: %+v", runs)
	}
	firstIndex := string(mustReadFile(t, indexPath))
	firstContext := string(mustReadFile(t, contextPath))
	if strings.Contains(firstIndex+firstContext, "autoRun") || !strings.Contains(firstIndex, `"selfDrivingGeneration": 9`) || !strings.Contains(firstContext, `"selfDrivingGeneration": 9`) {
		t.Fatalf("legacy run schema was not fully rewritten: index=%s context=%s", firstIndex, firstContext)
	}
	if _, err := loadAgentRuns(workspace); err != nil {
		t.Fatal(err)
	}
	if firstIndex != string(mustReadFile(t, indexPath)) || firstContext != string(mustReadFile(t, contextPath)) {
		t.Fatal("run migration was not idempotent")
	}
}

func TestLegacySelfDrivingRunMigrationRejectsConflictingSchemas(t *testing.T) {
	workspace := t.TempDir()
	indexPath := agentIndexPath(workspace)
	if err := os.MkdirAll(filepath.Dir(indexPath), 0o755); err != nil {
		t.Fatal(err)
	}
	data := `[{"id":"run-one","workspaceId":"workspace-one","title":"Conflict","cwd":"/tmp","status":"running","autoRunGeneration":1,"selfDrivingGeneration":2}]`
	if err := os.WriteFile(indexPath, []byte(data), 0o644); err != nil {
		t.Fatal(err)
	}
	if _, err := loadAgentRuns(workspace); err == nil || !strings.Contains(err.Error(), "conflicting legacy and selfDriving") {
		t.Fatalf("expected conflicting schema error, got %v", err)
	}
	if string(mustReadFile(t, indexPath)) != data {
		t.Fatal("conflicting run schema was modified")
	}
}
