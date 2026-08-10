package serve

import (
	"context"
	"net/http/httptest"
	"testing"
)

func TestAgentRunCompletionMarkerUsesCanonicalDurableEventOnce(t *testing.T) {
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

	rt := newAgentHubRuntime(manager, workspace, agentRun{
		ID:                  "run-completion",
		WorkspaceID:         workspace.ID,
		AgentHubSessionID:   sessionID,
		CompletionSessionID: sessionID,
		CompletionCursor:    2,
		Status:              "running",
	}, client)
	rt.recordTurnCompletion(session)
	got := rt.snapshotRun()
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
	got = rt.snapshotRun()
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
	baselineRuntime := newAgentHubRuntime(manager, workspace, agentRun{
		ID:                "run-baseline",
		WorkspaceID:       workspace.ID,
		AgentHubSessionID: baselineID,
		Status:            "idle",
	}, client)
	baselineRuntime.recordTurnCompletion(baselineSession)
	baseline := baselineRuntime.snapshotRun()
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

func TestTreeSessionProjectsCompletionMarker(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	if err := saveAgentRun(workspace.Path, agentRun{
		ID:                "run-tree",
		WorkspaceID:       workspace.ID,
		ForgeSessionID:    "forge-tree",
		AgentHubSessionID: "ses-tree",
		ResourceID:        "project1.task1",
		Status:            "idle",
		CompletionMarker:  "ses-tree:17",
		CompletionState:   "failed",
		CompletionAt:      "2026-08-06T00:00:17Z",
	}); err != nil {
		t.Fatal(err)
	}
	tree := workspaceTree{Sessions: []guiSession{{ID: "forge-tree"}}}
	if err := manager.server.enrichTreeSessions(workspace.Path, &tree); err != nil {
		t.Fatal(err)
	}
	projected := tree.Sessions[0]
	if projected.AgentRunCompletionMarker != "ses-tree:17" || projected.AgentRunCompletionState != "failed" || projected.AgentRunCompletionAt != "2026-08-06T00:00:17Z" {
		t.Fatalf("completion marker was not projected to the tree session: %#v", projected)
	}
}

func TestAgentHubPollerRetriesCompletionHistoryAfterTransientFailure(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	const sessionID = "ses_retry_completion"
	source := &agentHubSource{App: agentHubSourceApp, InstanceID: "forge-runtime-test", ExternalID: workspace.ID + "/run-retry"}
	fake.mu.Lock()
	fake.sessions[sessionID] = agentHubSession{ID: sessionID, State: "ready", Source: source}
	fake.appendLocked(sessionID, "session.created", map[string]any{"id": sessionID})
	fake.appendLocked(sessionID, "turn.completed", map[string]any{"turnId": "turn-retry"})
	fake.sessions[sessionID] = agentHubSession{
		ID: sessionID, State: "ready", Source: source, LastEventID: 2,
	}
	fake.failEvents = true
	fake.mu.Unlock()
	if err := saveAgentRun(workspace.Path, agentRun{
		ID: "run-retry", WorkspaceID: workspace.ID, AgentHubSessionID: sessionID,
		SourceExternalID: source.ExternalID, Status: "running",
		CompletionSessionID: sessionID, CompletionCursor: 1,
	}); err != nil {
		t.Fatal(err)
	}

	if err := manager.pollAgentHubSessions(context.Background()); err != nil {
		t.Fatal(err)
	}
	rt := manager.runtimeByID("run-retry")
	waitForRuntimeTest(t, func() bool {
		fake.mu.Lock()
		eventsAttempts := fake.eventsAttempts
		fake.mu.Unlock()
		return eventsAttempts >= 1 && rt.snapshotRun().CompletionMarker == ""
	})

	fake.mu.Lock()
	fake.failEvents = false
	fake.mu.Unlock()
	if err := manager.pollAgentHubSessions(context.Background()); err != nil {
		t.Fatal(err)
	}
	waitForRuntimeTest(t, func() bool {
		return rt.snapshotRun().CompletionMarker == sessionID+":2"
	})
}
