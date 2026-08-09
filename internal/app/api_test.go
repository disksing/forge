package app_test

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/disksing/forge/internal/app"
)

func newSelfDrivingWorkspace(t *testing.T, enabled bool) (*app.Workspace, app.Task) {
	t.Helper()
	root := t.TempDir()
	workspace, err := app.Initialize(root, "en")
	if err != nil {
		t.Fatal(err)
	}
	project, err := workspace.CreateProject("Project", "")
	if err != nil {
		t.Fatal(err)
	}
	input := app.CreateTaskInput{ProjectID: project.ID, Title: "Task", SelfDriving: enabled}
	if enabled {
		input.AgentName = "codex"
	}
	task, err := workspace.CreateTask(input)
	if err != nil {
		t.Fatal(err)
	}
	return workspace, task
}

func TestSelfDrivingDesiredStateIsIdempotentAndRevisioned(t *testing.T) {
	workspace, task := newSelfDrivingWorkspace(t, false)
	enabled, err := workspace.EnableSelfDriving(app.SelfDrivingDesiredStateInput{TaskID: task.ID, AgentName: "codex", AgentNameSet: true})
	if err != nil {
		t.Fatal(err)
	}
	if !enabled.SelfDriving.Enabled || enabled.SelfDriving.Condition != "ready" || enabled.SelfDriving.Revision != 1 {
		t.Fatalf("enabled = %#v", enabled.SelfDriving)
	}
	duplicate, err := workspace.EnableSelfDriving(app.SelfDrivingDesiredStateInput{TaskID: task.ID})
	if err != nil || duplicate.SelfDriving.Revision != enabled.SelfDriving.Revision {
		t.Fatalf("duplicate enable = %#v, %v", duplicate.SelfDriving, err)
	}
	disabled, err := workspace.DisableSelfDriving(task.ID)
	if err != nil {
		t.Fatal(err)
	}
	if disabled.SelfDriving.Enabled || disabled.SelfDriving.Condition != "disabled" || disabled.SelfDriving.Revision != 2 {
		t.Fatalf("disabled = %#v", disabled.SelfDriving)
	}
	duplicate, err = workspace.DisableSelfDriving(task.ID)
	if err != nil || duplicate.SelfDriving.Revision != 2 {
		t.Fatalf("duplicate disable = %#v, %v", duplicate.SelfDriving, err)
	}
}

func TestSelfDrivingOutcomesUseRevisionGate(t *testing.T) {
	workspace, task := newSelfDrivingWorkspace(t, true)
	revision := task.SelfDriving.Revision
	waiting, err := workspace.SuspendSelfDriving(app.SelfDrivingActionInput{TaskID: task.ID, ExpectedRevision: revision, Summary: "waiting", WakeCondition: "signal"})
	if err != nil || !waiting.SelfDriving.Enabled || waiting.SelfDriving.Condition != "waiting" || waiting.SelfDriving.WakeContext.Condition != "signal" {
		t.Fatalf("waiting = %#v, %v", waiting.SelfDriving, err)
	}
	duplicate, err := workspace.SuspendSelfDriving(app.SelfDrivingActionInput{TaskID: task.ID, ExpectedRevision: revision, Summary: "different duplicate", WakeCondition: "different"})
	if err != nil || duplicate.SelfDriving.WakeContext.Summary != "waiting" {
		t.Fatalf("duplicate wait was not idempotent: %#v, %v", duplicate.SelfDriving, err)
	}
	signaled, err := workspace.SignalSelfDrivingUserMessage(task.ID)
	if err != nil || signaled.SelfDriving.Condition != "ready" || signaled.SelfDriving.WakeContext != nil || signaled.SelfDriving.Revision != revision+1 {
		t.Fatalf("signal = %#v, %v", signaled.SelfDriving, err)
	}
	if _, err := workspace.FailSelfDriving(app.SelfDrivingActionInput{TaskID: task.ID, ExpectedRevision: revision, Reason: "late"}); err == nil {
		t.Fatal("old Turn callback unexpectedly changed re-evaluated task")
	}
	completed, err := workspace.CompleteSelfDriving(app.SelfDrivingActionInput{TaskID: task.ID, ExpectedRevision: signaled.SelfDriving.Revision, Summary: "done"})
	if err != nil || completed.SelfDriving.Enabled || completed.SelfDriving.Revision != signaled.SelfDriving.Revision+1 || completed.SelfDriving.LastOutcome.Status != "completed" {
		t.Fatalf("completed = %#v, %v", completed.SelfDriving, err)
	}
	if _, err := workspace.FailSelfDriving(app.SelfDrivingActionInput{TaskID: task.ID, ExpectedRevision: signaled.SelfDriving.Revision, Reason: "late"}); err == nil {
		t.Fatal("stale callback unexpectedly changed completed task")
	}
	reenabled, err := workspace.EnableSelfDriving(app.SelfDrivingDesiredStateInput{TaskID: task.ID})
	if err != nil {
		t.Fatal(err)
	}
	if _, err := workspace.SuspendSelfDriving(app.SelfDrivingActionInput{TaskID: task.ID, ExpectedRevision: revision, Summary: "old"}); err == nil {
		t.Fatalf("old revision overwrote re-enabled revision %d", reenabled.SelfDriving.Revision)
	}
	blocked, err := workspace.PauseSelfDriving(app.SelfDrivingActionInput{TaskID: task.ID, ExpectedRevision: reenabled.SelfDriving.Revision, Reason: "decision"})
	if err != nil || !blocked.SelfDriving.Enabled || blocked.SelfDriving.Condition != "blocked" {
		t.Fatalf("blocked = %#v, %v", blocked.SelfDriving, err)
	}
}

func TestSelfDrivingWakeAdvancesRevision(t *testing.T) {
	workspace, task := newSelfDrivingWorkspace(t, true)
	waiting, err := workspace.SuspendSelfDriving(app.SelfDrivingActionInput{TaskID: task.ID, ExpectedRevision: 1, Summary: "waiting", WakeCondition: "upstream changed"})
	if err != nil {
		t.Fatal(err)
	}
	woken, err := workspace.WakeSelfDriving(task.ID, waiting.SelfDriving.Revision)
	if err != nil || woken.SelfDriving.Revision != 2 || woken.SelfDriving.Condition != "ready" || woken.SelfDriving.WakeContext != nil {
		t.Fatalf("wake = %#v, %v", woken.SelfDriving, err)
	}
	if _, err := workspace.FailSelfDriving(app.SelfDrivingActionInput{TaskID: task.ID, ExpectedRevision: 1, Reason: "late"}); err == nil {
		t.Fatal("pre-wake callback was accepted")
	}
}

func TestArchiveAtomicallyDisablesSelfDriving(t *testing.T) {
	workspace, task := newSelfDrivingWorkspace(t, true)
	start := make(chan struct{})
	done := make(chan struct{})
	go func() {
		defer close(done)
		<-start
		_, _ = workspace.EnableSelfDriving(app.SelfDrivingDesiredStateInput{TaskID: task.ID, Prompt: "concurrent update", PromptSet: true})
	}()
	close(start)
	result, err := workspace.ArchiveResource(task.ID)
	if err != nil {
		t.Fatal(err)
	}
	select {
	case <-done:
	case <-time.After(2 * time.Second):
		t.Fatal("concurrent desired-state update did not finish")
	}
	resource, err := workspace.ResourceValue(task.ID)
	if err != nil || !resource.Archived || resource.Task == nil || resource.Task.SelfDriving == nil {
		t.Fatalf("archived resource %s = %#v, %v", result.Path, resource, err)
	}
	got := resource.Task.SelfDriving
	if got.Enabled || got.Condition != "disabled" || got.LastOutcome == nil || got.LastOutcome.Status != "archived" {
		t.Fatalf("archive left Self-Driving active: %#v", got)
	}
	if _, err := workspace.EnableSelfDriving(app.SelfDrivingDesiredStateInput{TaskID: task.ID}); err == nil {
		t.Fatal("archived task was enabled")
	}
}

func TestSelfDrivingControlIgnoresResourceSessionLockAndSerializes(t *testing.T) {
	workspace, task := newSelfDrivingWorkspace(t, false)
	session, err := workspace.CreateSession(app.SessionLiveness{Type: "pid", PID: os.Getpid()})
	if err != nil {
		t.Fatal(err)
	}
	if _, err := workspace.LockSession(session.ID, task.ID); err != nil {
		t.Fatal(err)
	}
	var wg sync.WaitGroup
	for i := 0; i < 12; i++ {
		wg.Add(1)
		go func(enabled bool) {
			defer wg.Done()
			if enabled {
				_, _ = workspace.EnableSelfDriving(app.SelfDrivingDesiredStateInput{TaskID: task.ID})
			} else {
				_, _ = workspace.DisableSelfDriving(task.ID)
			}
		}(i%2 == 0)
	}
	wg.Wait()
	resource, err := workspace.ResourceValue(task.ID)
	if err != nil || resource.Task.SelfDriving == nil || resource.Task.SelfDriving.Revision <= 0 {
		t.Fatalf("resource = %#v, %v", resource.Task, err)
	}
}

func TestSelfDrivingAndOrdinaryTaskWritesDoNotLoseMetadata(t *testing.T) {
	workspace, task := newSelfDrivingWorkspace(t, false)
	const writes = 24
	var wg sync.WaitGroup
	for i := 0; i < writes; i++ {
		wg.Add(2)
		go func(index int) {
			defer wg.Done()
			_, _ = workspace.EnableSelfDriving(app.SelfDrivingDesiredStateInput{
				TaskID: task.ID, Prompt: fmt.Sprintf("prompt-%d", index), PromptSet: true,
			})
		}(i)
		go func(index int) {
			defer wg.Done()
			_, _ = workspace.AddLog(task.ID, fmt.Sprintf("ordinary-%d", index), "concurrent metadata writer")
		}(i)
	}
	wg.Wait()
	resource, err := workspace.ResourceValue(task.ID)
	if err != nil || resource.Task == nil || resource.Task.SelfDriving == nil {
		t.Fatalf("reload concurrent task: resource=%#v err=%v", resource, err)
	}
	if !resource.Task.SelfDriving.Enabled || resource.Task.SelfDriving.Revision != writes {
		t.Fatalf("ordinary metadata write lost Self-Driving state: %#v", resource.Task.SelfDriving)
	}
	logs, err := workspace.Logs(task.ID)
	if err != nil {
		t.Fatal(err)
	}
	seen := make(map[string]bool, writes)
	for _, entry := range logs {
		if strings.HasPrefix(entry.Title, "ordinary-") {
			seen[entry.Title] = true
		}
	}
	if len(seen) != writes {
		t.Fatalf("Self-Driving write lost ordinary logs: got %d of %d", len(seen), writes)
	}
}

func TestLegacySevenStateMigrationMatrix(t *testing.T) {
	states := []struct {
		state     string
		enabled   bool
		condition string
		outcome   string
	}{{"queued", true, "ready", ""}, {"running", true, "reconciling", ""}, {"suspended", true, "waiting", ""}, {"paused", false, "disabled", "paused"}, {"completed", false, "disabled", "completed"}, {"failed", false, "disabled", "failed"}, {"cancelled", false, "disabled", "cancelled"}}
	for _, test := range states {
		t.Run(test.state, func(t *testing.T) {
			workspace, task := newSelfDrivingWorkspace(t, false)
			resource, err := workspace.ResourceValue(task.ID)
			if err != nil {
				t.Fatal(err)
			}
			path := filepath.Join(workspace.Root(), filepath.FromSlash(resource.Path), "task.json")
			var raw map[string]any
			data, _ := os.ReadFile(path)
			_ = json.Unmarshal(data, &raw)
			raw["selfDriving"] = map[string]any{"generation": 7, "state": test.state, "agentName": "codex", "suspensionSummary": "context", "wakeCondition": "signal", "suspendedAt": "2026-01-01T00:00:00Z", "statusReason": "reason"}
			encoded, _ := json.MarshalIndent(raw, "", "  ")
			if err := os.WriteFile(path, append(encoded, '\n'), 0o644); err != nil {
				t.Fatal(err)
			}
			logPath := filepath.Join(filepath.Dir(path), "log.jsonl")
			legacyLog := `{"id":"legacy","time":"2026-01-01T00:00:00Z","title":"Self-Driving started","selfDriving":true,"selfDrivingGeneration":7}` + "\n"
			if err := os.WriteFile(logPath, []byte(legacyLog), 0o644); err != nil {
				t.Fatal(err)
			}
			migrated, err := workspace.ResourceValue(task.ID)
			if err != nil {
				t.Fatal(err)
			}
			got := migrated.Task.SelfDriving
			if got.Revision != 7 || got.Enabled != test.enabled || got.Condition != test.condition {
				t.Fatalf("migrated = %#v", got)
			}
			if test.outcome != "" && (got.LastOutcome == nil || got.LastOutcome.Status != test.outcome) {
				t.Fatalf("outcome = %#v", got.LastOutcome)
			}
			migratedLog, _ := os.ReadFile(logPath)
			if strings.Contains(string(migratedLog), "selfDrivingGeneration") || !strings.Contains(string(migratedLog), `"selfDrivingRevision":7`) {
				t.Fatalf("legacy log was not migrated: %s", migratedLog)
			}
			first, _ := os.ReadFile(path)
			if _, err := workspace.ResourceValue(task.ID); err != nil {
				t.Fatal(err)
			}
			second, _ := os.ReadFile(path)
			if string(first) != string(second) {
				t.Fatal("migration was not idempotent")
			}
		})
	}
}

func TestArchivedLegacyEnabledStateMigratesDisabled(t *testing.T) {
	workspace, task := newSelfDrivingWorkspace(t, false)
	if _, err := workspace.ArchiveResource(task.ID); err != nil {
		t.Fatal(err)
	}
	archived, err := workspace.ResourceValue(task.ID)
	if err != nil || archived.Task == nil || !archived.Archived {
		t.Fatalf("load archived task: resource=%#v err=%v", archived, err)
	}
	path := filepath.Join(workspace.Root(), filepath.FromSlash(archived.Path), "task.json")
	data, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	var raw map[string]any
	if err := json.Unmarshal(data, &raw); err != nil {
		t.Fatal(err)
	}
	raw["selfDriving"] = map[string]any{"generation": 7, "state": "running", "agentName": "codex"}
	encoded, err := json.MarshalIndent(raw, "", "  ")
	if err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(path, append(encoded, '\n'), 0o644); err != nil {
		t.Fatal(err)
	}
	if err := workspace.MigrateSelfDrivingData(); err != nil {
		t.Fatal(err)
	}
	migrated, err := workspace.ResourceValue(task.ID)
	if err != nil || migrated.Task == nil || migrated.Task.SelfDriving == nil {
		t.Fatalf("reload migrated archive: resource=%#v err=%v", migrated, err)
	}
	got := migrated.Task.SelfDriving
	if got.Enabled || got.Revision != 8 || got.Condition != "disabled" || got.LastOutcome == nil || got.LastOutcome.Status != "archived" || got.LastOutcome.Revision != 7 {
		t.Fatalf("archived enabled migration = %#v", got)
	}
}

func TestConflictingSelfDrivingSchemaFailsWithoutRewrite(t *testing.T) {
	workspace, task := newSelfDrivingWorkspace(t, false)
	resource, err := workspace.ResourceValue(task.ID)
	if err != nil {
		t.Fatal(err)
	}
	path := filepath.Join(workspace.Root(), filepath.FromSlash(resource.Path), "task.json")
	data, _ := os.ReadFile(path)
	var raw map[string]any
	_ = json.Unmarshal(data, &raw)
	raw["selfDriving"] = map[string]any{"enabled": true, "revision": 2, "condition": "ready", "generation": 1, "state": "queued"}
	conflict, _ := json.MarshalIndent(raw, "", "  ")
	conflict = append(conflict, '\n')
	if err := os.WriteFile(path, conflict, 0o644); err != nil {
		t.Fatal(err)
	}
	if err := workspace.MigrateSelfDrivingData(); err == nil || !strings.Contains(err.Error(), "conflicting legacy and current") {
		t.Fatalf("expected conflict, got %v", err)
	}
	got, _ := os.ReadFile(path)
	if string(got) != string(conflict) {
		t.Fatal("conflicting task schema was partially rewritten")
	}
}

func TestLogConflictDoesNotPartiallyMigrateTask(t *testing.T) {
	workspace, task := newSelfDrivingWorkspace(t, false)
	resource, err := workspace.ResourceValue(task.ID)
	if err != nil {
		t.Fatal(err)
	}
	dir := filepath.Join(workspace.Root(), filepath.FromSlash(resource.Path))
	taskPath := filepath.Join(dir, "task.json")
	data, _ := os.ReadFile(taskPath)
	var raw map[string]any
	_ = json.Unmarshal(data, &raw)
	raw["selfDriving"] = map[string]any{"generation": 5, "state": "queued"}
	legacyTask, _ := json.MarshalIndent(raw, "", "  ")
	legacyTask = append(legacyTask, '\n')
	if err := os.WriteFile(taskPath, legacyTask, 0o644); err != nil {
		t.Fatal(err)
	}
	conflictingLog := `{"id":"conflict","time":"2026-01-01T00:00:00Z","title":"Self-Driving started","selfDrivingGeneration":5,"selfDrivingRevision":6}` + "\n"
	if err := os.WriteFile(filepath.Join(dir, "log.jsonl"), []byte(conflictingLog), 0o644); err != nil {
		t.Fatal(err)
	}
	if err := workspace.MigrateSelfDrivingData(); err == nil {
		t.Fatal("conflicting log was accepted")
	}
	got, _ := os.ReadFile(taskPath)
	if string(got) != string(legacyTask) {
		t.Fatal("task was migrated before log conflict validation")
	}
}
