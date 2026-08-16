package serve

import (
	"context"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/disksing/pua/internal/app"
)

func TestGenerationUsageCountsCanonicalTerminalTurnsAndDuration(t *testing.T) {
	turns := []agentHubTurn{
		{TurnID: "turn-1", Status: "completed", Closed: true, DurationMS: 30_000},
		{TurnID: "turn-1", Status: "completed", Closed: true, DurationMS: 30_000},
		{TurnID: "turn-2", Status: "failed", Closed: true, StartedAt: "2026-08-01T00:00:00Z", EndedAt: "2026-08-01T00:02:00Z"},
		{TurnID: "turn-3", Status: "cancelled", Closed: true, DurationMS: 10_000},
		{TurnID: "turn-active", Status: "running", Closed: false, DurationMS: 99_000},
		{TurnID: "turn-unknown", Status: "interrupted", Closed: true, DurationMS: 99_000},
	}
	usage := generationUsageFromTurns(turns)
	if usage.CompletedTurns != 3 || usage.TurnDurationMS != 160_000 {
		t.Fatalf("generation usage = %#v", usage)
	}
}

func TestGenerationPolicyUsesIndependentOrBudgets(t *testing.T) {
	policy := app.GenerationPolicy{Enabled: true, MaxTurns: 20, MaxAccumulatedTurnMinutes: 120}
	tests := []struct {
		name  string
		usage generationUsage
		want  bool
	}{
		{name: "below both", usage: generationUsage{CompletedTurns: 19, TurnDurationMS: int64(119 * time.Minute / time.Millisecond)}},
		{name: "turn budget", usage: generationUsage{CompletedTurns: 20}, want: true},
		{name: "time budget", usage: generationUsage{CompletedTurns: 1, TurnDurationMS: int64(120 * time.Minute / time.Millisecond)}, want: true},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			if got := generationPolicyReached(policy, test.usage); got != test.want {
				t.Fatalf("generationPolicyReached() = %v, want %v", got, test.want)
			}
		})
	}
	policy.Enabled = false
	if generationPolicyReached(policy, generationUsage{CompletedTurns: 100, TurnDurationMS: int64(300 * time.Minute / time.Millisecond)}) {
		t.Fatal("disabled policy reached a budget")
	}
}

func TestGenerationPolicyRetiresReadyGenerationAtSafeBoundary(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	puaWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := puaWorkspace.SetGenerationPolicy(app.GenerationPolicy{Enabled: true, MaxTurns: 2, MaxAccumulatedTurnMinutes: 120}); err != nil {
		t.Fatal(err)
	}
	record := generationRecord{
		ID: "gen-policy", WorkspaceID: workspace.ID, ResourceID: "project1.task1", Generation: 1,
		GenerationID: "gen-policy", AgentHubSessionID: "ses-policy",
		SourceExternalID: workspace.ID + "/gen-policy", Status: "idle",
		CreatedAt: "2026-08-01T00:00:00Z", UpdatedAt: "2026-08-01T00:02:00Z",
	}
	session := agentHubSession{
		ID: "ses-policy", State: "ready", LastEventID: 4,
		CreatedAt: "2026-08-01T00:00:00Z", UpdatedAt: "2026-08-01T00:02:00Z",
	}
	seedPollerGeneration(t, fake, workspace, record, session)
	fake.mu.Lock()
	fake.turns[session.ID] = map[string]agentHubTurn{
		"turn-1": {ID: "turn-1", TurnID: "turn-1", Status: "completed", Closed: true, DurationMS: 60_000, FirstEventID: 1, LastEventID: 2},
		"turn-2": {ID: "turn-2", TurnID: "turn-2", Status: "failed", Closed: true, DurationMS: 60_000, FirstEventID: 3, LastEventID: 4},
	}
	fake.mu.Unlock()

	if err := manager.pollAgentHubSessions(context.Background()); err != nil {
		t.Fatal(err)
	}
	waitForRuntimeTest(t, func() bool {
		_, found, loadErr := currentResourceGeneration(workspace.Path, record.ResourceID)
		return loadErr == nil && !found
	})
	retired, found, err := generationRecordByID(workspace.Path, record.GenerationID)
	if err != nil || !found || !retired.Retired || retired.RetireReason != generationPolicyRetireReason {
		t.Fatalf("retired generation = %#v, found=%v err=%v", retired, found, err)
	}
	if retired.GenerationCompletedTurns != 2 || retired.GenerationTurnDurationMS != 120_000 {
		t.Fatalf("retired generation lost usage projection: %#v", retired)
	}
	fake.mu.Lock()
	archived := fake.sessions[session.ID]
	stopCalls := fake.stopCalls
	fake.mu.Unlock()
	if archived.State != "archived" || stopCalls != 1 {
		t.Fatalf("policy rotation did not Stop then Archive: state=%q stopCalls=%d", archived.State, stopCalls)
	}
	if _, found, err := currentResourceGeneration(workspace.Path, record.ResourceID); err != nil || found {
		t.Fatalf("policy rotation created an eager successor: found=%v err=%v", found, err)
	}
}

func TestGenerationPolicyRetiresAlreadyStoppedIdleGenerationWithoutResume(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	puaWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := puaWorkspace.SetGenerationPolicy(app.GenerationPolicy{Enabled: true, MaxTurns: 2, MaxAccumulatedTurnMinutes: 120}); err != nil {
		t.Fatal(err)
	}
	record := generationRecord{
		ID: "gen-policy-stopped", WorkspaceID: workspace.ID, ResourceID: "project1.task1", Generation: 1,
		GenerationID: "gen-policy-stopped", AgentHubSessionID: "ses-policy-stopped",
		SourceExternalID: workspace.ID + "/gen-policy-stopped", Status: "idle-suspended",
		IdleSleepStopRequested: true, GenerationUsageReady: true, GenerationCompletedTurns: 2,
		CreatedAt: "2026-08-01T00:00:00Z", UpdatedAt: "2026-08-01T00:02:00Z",
	}
	session := agentHubSession{
		ID: "ses-policy-stopped", State: "stopped",
		CreatedAt: "2026-08-01T00:00:00Z", UpdatedAt: "2026-08-01T00:02:00Z",
	}
	seedPollerGeneration(t, fake, workspace, record, session)

	if err := manager.pollAgentHubSessions(context.Background()); err != nil {
		t.Fatal(err)
	}
	retired, found, err := generationRecordByID(workspace.Path, record.GenerationID)
	if err != nil || !found || !retired.Retired || retired.RetireReason != generationPolicyRetireReason {
		t.Fatalf("stopped idle generation = %#v, found=%v err=%v", retired, found, err)
	}
	fake.mu.Lock()
	archived := fake.sessions[session.ID]
	stopCalls := fake.stopCalls
	resumeCount := len(fake.resumeEnvironments)
	fake.mu.Unlock()
	if archived.State != "archived" || stopCalls != 0 || resumeCount != 0 {
		t.Fatalf("stopped policy rotation used the wrong lifecycle: state=%q stopCalls=%d resumes=%d", archived.State, stopCalls, resumeCount)
	}
}

func TestGenerationPolicyNeverInterruptsActiveTurn(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	puaWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := puaWorkspace.SetGenerationPolicy(app.GenerationPolicy{Enabled: true, MaxTurns: 1, MaxAccumulatedTurnMinutes: 120}); err != nil {
		t.Fatal(err)
	}
	record := generationRecord{
		ID: "gen-policy-active", WorkspaceID: workspace.ID, ResourceID: "project1.task1", Generation: 1,
		GenerationID: "gen-policy-active", AgentHubSessionID: "ses-policy-active",
		SourceExternalID: workspace.ID + "/gen-policy-active", Status: "running",
		GenerationUsageReady: true, GenerationCompletedTurns: 1,
		CreatedAt: "2026-08-01T00:00:00Z", UpdatedAt: "2026-08-01T00:02:00Z",
	}
	session := agentHubSession{
		ID: "ses-policy-active", State: "running", CurrentTurnID: "turn-active",
		CreatedAt: "2026-08-01T00:00:00Z", UpdatedAt: "2026-08-01T00:02:00Z",
	}
	seedPollerGeneration(t, fake, workspace, record, session)

	if err := manager.pollAgentHubSessions(context.Background()); err != nil {
		t.Fatal(err)
	}
	current, found, err := currentResourceGeneration(workspace.Path, record.ResourceID)
	if err != nil || !found || current.ReplacementPending || current.Retired {
		t.Fatalf("active generation was rotated: %#v, found=%v err=%v", current, found, err)
	}
	fake.mu.Lock()
	stopCalls := fake.stopCalls
	fake.mu.Unlock()
	if stopCalls != 0 {
		t.Fatalf("active generation received %d Stop requests", stopCalls)
	}
}
