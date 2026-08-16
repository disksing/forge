package serve

import (
	"context"
	"encoding/json"
	"net/http/httptest"
	"testing"
)

func TestGenerationCompletionMarkerUsesCanonicalDurableEventOnce(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	client, err := newAgentHubClient(hub.URL, hub.Client())
	if err != nil {
		t.Fatal(err)
	}

	const sessionID = "ses_completion"
	fake.mu.Lock()
	fake.sessions[sessionID] = agentHubSession{ID: sessionID, State: "ready"}
	fake.appendLocked(sessionID, "session.created", map[string]any{"id": sessionID})
	fake.appendLocked(sessionID, "turn.started", map[string]any{"turnId": "turn-1"})
	fake.appendLocked(sessionID, "provider.turn.completed", map[string]any{"turnId": "turn-1"})
	fake.appendLocked(sessionID, "turn.completed", map[string]any{"turnId": "turn-1"})
	session := fake.sessions[sessionID]
	fake.mu.Unlock()

	rt := newAgentHubRuntime(manager, workspace, generationRecord{
		ID:                  "gen-completion",
		WorkspaceID:         workspace.ID,
		AgentHubSessionID:   sessionID,
		CompletionSessionID: sessionID,
		CompletionCursor:    2,
		Status:              "running",
	}, client)
	rt.recordTurnCompletion(session)
	got := rt.snapshotGeneration()
	if got.CompletionCursor != 4 || got.CompletionEventID != 4 || got.CompletionMarker != sessionID+":4" || got.CompletionState != "completed" {
		t.Fatalf("unexpected completion projection: %#v", got)
	}

	fake.mu.Lock()
	eventsCalls := fake.eventsCalls
	fake.mu.Unlock()
	if eventsCalls != 1 {
		t.Fatalf("first completion should read one durable page, got %d calls", eventsCalls)
	}

	rt.recordTurnCompletion(session)
	got = rt.snapshotGeneration()
	fake.mu.Lock()
	duplicateCalls := fake.eventsCalls
	fake.mu.Unlock()
	if duplicateCalls != eventsCalls || got.CompletionMarker != sessionID+":4" {
		t.Fatalf("duplicate completion changed durable projection: calls %d -> %d, run=%#v", eventsCalls, duplicateCalls, got)
	}

	const baselineID = "ses_baseline"
	fake.mu.Lock()
	fake.sessions[baselineID] = agentHubSession{ID: baselineID, State: "ready"}
	fake.appendLocked(baselineID, "session.created", map[string]any{"id": baselineID})
	fake.appendLocked(baselineID, "turn.completed", map[string]any{"turnId": "old-turn"})
	baselineSession := fake.sessions[baselineID]
	fake.mu.Unlock()
	baselineRuntime := newAgentHubRuntime(manager, workspace, generationRecord{
		ID:                "gen-baseline",
		WorkspaceID:       workspace.ID,
		AgentHubSessionID: baselineID,
		Status:            "idle",
	}, client)
	baselineRuntime.recordTurnCompletion(baselineSession)
	baseline := baselineRuntime.snapshotGeneration()
	if baseline.CompletionCursor != baselineSession.LastEventID || baseline.CompletionMarker != "" {
		t.Fatalf("fresh session was not baselined without a historical marker: %#v", baseline)
	}
}

func TestAgentHubTurnTerminalKinds(t *testing.T) {
	for _, eventType := range []string{"turn.completed", "turn.failed", "turn.cancelled"} {
		if !isAgentHubTurnTerminal(eventType) {
			t.Fatalf("%s should be a canonical terminal", eventType)
		}
	}
	for _, eventType := range []string{"provider.turn.completed", "turn.started", "session.state"} {
		if isAgentHubTurnTerminal(eventType) {
			t.Fatalf("%s must not manufacture a completion marker", eventType)
		}
	}
}

func TestGenerationCompletionProjectionPreservesCancellationAndReplyPresence(t *testing.T) {
	manager, workspace, _ := newRuntimeTestManager(t, "http://127.0.0.1:1")
	session := agentHubSession{ID: "ses-cancelled", State: "ready", LastEventID: 3}
	runtime := newAgentHubRuntime(manager, workspace, generationRecord{
		ID: "gen-cancelled", WorkspaceID: workspace.ID, AgentHubSessionID: session.ID,
		CompletionSessionID: session.ID, CompletionCursor: 1, Status: "running",
	}, nil)
	runtime.recordTurnCompletionHistory(session, []agentHubEvent{
		{ID: 2, Type: "tool.event", TurnID: "turn-cancelled"},
		{ID: 3, Type: "turn.cancelled", TurnID: "turn-cancelled", Time: "2026-08-15T01:00:03Z"},
	}, 3)
	got := runtime.snapshotGeneration()
	if got.CompletionState != "cancelled" || got.CompletionTurnID != "turn-cancelled" || got.CompletionHasFinalReply {
		t.Fatalf("cancelled completion projection = %#v", got)
	}

	runtime = newAgentHubRuntime(manager, workspace, generationRecord{
		ID: "gen-cancelled-with-reply", WorkspaceID: workspace.ID, AgentHubSessionID: session.ID,
		CompletionSessionID: session.ID, CompletionCursor: 1, Status: "running",
	}, nil)
	runtime.recordTurnCompletionHistory(session, []agentHubEvent{
		{ID: 2, Type: "message.assistant.delta", TurnID: "turn-cancelled", Data: json.RawMessage(`{"text":"answer"}`)},
		{ID: 3, Type: "turn.cancelled", TurnID: "turn-cancelled", Time: "2026-08-15T01:00:03Z"},
	}, 3)
	got = runtime.snapshotGeneration()
	if got.CompletionState != "cancelled" || !got.CompletionHasFinalReply {
		t.Fatalf("cancelled completion with reply = %#v", got)
	}
}

func TestResourceTreeProjectsCompletionMarker(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	if err := saveGenerationRecord(workspace.Path, generationRecord{
		ID: "gen-tree", Generation: 1, GenerationID: "gen-tree",
		WorkspaceID:       workspace.ID,
		AgentHubSessionID: "ses-tree",
		ResourceID:        "project1.task1",
		Status:            "idle",
		CompletionMarker:  "ses-tree:17",
		CompletionState:   "failed",
		CompletionAt:      "2026-08-06T00:00:17Z",
	}); err != nil {
		t.Fatal(err)
	}
	tree := workspaceTree{Projects: []resourceSnapshot{{ID: "project1", Children: []resourceSnapshot{{ID: "project1.task1"}}}}}
	if err := manager.server.enrichTreeResourceRuntime(workspace.Path, &tree); err != nil {
		t.Fatal(err)
	}
	projected := tree.Projects[0].Children[0].Runtime
	if projected == nil || projected.CompletionMarker != "ses-tree:17" || projected.CompletionState != "failed" || projected.CompletionAt != "2026-08-06T00:00:17Z" {
		t.Fatalf("completion marker was not projected to the resource runtime: %#v", projected)
	}
}

func TestAgentHubPollerRetriesCompletionHistoryAfterTransientFailure(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	const sessionID = "ses_retry_completion"
	source := &agentHubSource{App: agentHubSourceApp, InstanceID: "pua-runtime-test", ExternalID: workspace.ID + "/run-retry"}
	fake.mu.Lock()
	fake.sessions[sessionID] = agentHubSession{ID: sessionID, State: "ready", Source: source}
	fake.appendLocked(sessionID, "session.created", map[string]any{"id": sessionID})
	fake.appendLocked(sessionID, "turn.completed", map[string]any{"turnId": "turn-retry"})
	fake.sessions[sessionID] = agentHubSession{
		ID: sessionID, State: "ready", Source: source, LastEventID: 2,
	}
	fake.failEvents = true
	fake.mu.Unlock()
	if err := saveGenerationRecord(workspace.Path, generationRecord{
		ID: "gen-retry", WorkspaceID: workspace.ID, AgentHubSessionID: sessionID,
		SourceExternalID: source.ExternalID, Status: "running",
		CompletionSessionID: sessionID, CompletionCursor: 1,
	}); err != nil {
		t.Fatal(err)
	}

	if err := manager.pollAgentHubSessions(context.Background()); err != nil {
		t.Fatal(err)
	}
	rt := manager.runtimeByID("gen-retry")
	waitForRuntimeTest(t, func() bool {
		fake.mu.Lock()
		eventsAttempts := fake.eventsAttempts
		fake.mu.Unlock()
		return eventsAttempts >= 1 && rt.snapshotGeneration().CompletionMarker == ""
	})

	fake.mu.Lock()
	fake.failEvents = false
	fake.mu.Unlock()
	if err := manager.pollAgentHubSessions(context.Background()); err != nil {
		t.Fatal(err)
	}
	waitForRuntimeTest(t, func() bool {
		return rt.snapshotGeneration().CompletionMarker == sessionID+":2"
	})
}
