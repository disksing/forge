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
	if len(runs) != 1 || runs[0].SelfDrivingRevision != 9 || !runs[0].SchedulerTurn || runs[0].SchedulerTurnID != "turn-one" || runs[0].SchedulerTurnSequence != 4 || runs[0].Status != "running" || runs[0].AgentHubSessionID != "ses-one" || runs[0].SourceExternalID != "workspace-one/run-one" {
		t.Fatalf("run migration lost recovery state: %+v", runs)
	}
	firstIndex := string(mustReadFile(t, indexPath))
	firstContext := string(mustReadFile(t, contextPath))
	if strings.Contains(firstIndex+firstContext, "autoRun") || !strings.Contains(firstIndex, `"selfDrivingRevision": 9`) || !strings.Contains(firstContext, `"selfDrivingRevision": 9`) {
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
	data := `[{"id":"run-one","workspaceId":"workspace-one","title":"Conflict","cwd":"/tmp","status":"running","autoRunGeneration":1,"selfDrivingRevision":2}]`
	if err := os.WriteFile(indexPath, []byte(data), 0o644); err != nil {
		t.Fatal(err)
	}
	if _, err := loadAgentRuns(workspace); err == nil || !strings.Contains(err.Error(), "conflicting legacy generation and Self-Driving revision") {
		t.Fatalf("expected conflicting schema error, got %v", err)
	}
	if string(mustReadFile(t, indexPath)) != data {
		t.Fatal("conflicting run schema was modified")
	}
}

func TestPreviousSelfDrivingGenerationFieldMigratesToRevision(t *testing.T) {
	for _, key := range []string{"autoRunGeneration", "selfDrivingGeneration"} {
		t.Run(key, func(t *testing.T) {
			raw := map[string]json.RawMessage{key: json.RawMessage(`11`)}
			changed, err := migrateRevisionField(raw, "fixture")
			if err != nil || !changed || string(raw["selfDrivingRevision"]) != "11" {
				t.Fatalf("migration = changed %v raw %#v err %v", changed, raw, err)
			}
			if _, exists := raw[key]; exists {
				t.Fatalf("legacy key %s remained", key)
			}
		})
	}
	for _, value := range []string{"0", `"bad"`} {
		raw := map[string]json.RawMessage{"selfDrivingGeneration": json.RawMessage(value)}
		if changed, err := migrateRevisionField(raw, "fixture"); err == nil || changed {
			t.Fatalf("invalid generation %s was accepted", value)
		}
	}
}

func TestRunMigrationPreflightsAllConflictsBeforeWritingContexts(t *testing.T) {
	workspace := t.TempDir()
	contextPath := filepath.Join(workspace, "context.json")
	originalContext := `{"selfDrivingGeneration":3}`
	if err := os.WriteFile(contextPath, []byte(originalContext), 0o600); err != nil {
		t.Fatal(err)
	}
	runs := []map[string]any{
		{"id": "valid", "workspaceId": "workspace", "cwd": workspace, "status": "idle", "forgeSessionContextPath": contextPath, "selfDrivingGeneration": 3},
		{"id": "conflict", "workspaceId": "workspace", "cwd": workspace, "status": "idle", "autoRunGeneration": 1, "selfDrivingRevision": 2},
	}
	data, _ := json.Marshal(runs)
	if _, err := decodeAndMigrateAgentRuns(workspace, data); err == nil {
		t.Fatal("conflicting index was accepted")
	}
	if got := string(mustReadFile(t, contextPath)); got != originalContext {
		t.Fatalf("context was partially migrated before conflict: %s", got)
	}
}
