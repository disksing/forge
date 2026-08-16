package serve

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func TestAgentHubRecoveryProjectsSessionsWithoutEventsOrStreams(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	seedPollerGeneration(t, fake, workspace, generationRecord{
		ID: "gen-live", WorkspaceID: workspace.ID, ResourceID: "project1", AgentHubSessionID: "ses_live",
		SourceExternalID: workspace.ID + "/run-live",
		Status:           "running", CreatedAt: "2026-08-01T00:00:01Z", UpdatedAt: "2026-08-01T00:00:01Z",
	}, agentHubSession{ID: "ses_live", State: "ready", UpdatedAt: "2026-08-01T00:00:10Z"})
	seedPollerGeneration(t, fake, workspace, generationRecord{
		ID: "gen-stopped", WorkspaceID: workspace.ID, ResourceID: "project1.task1", AgentHubSessionID: "ses_stopped",
		SourceExternalID: workspace.ID + "/run-stopped", Status: "stopped",
		AgentHubStoppedObserved: true,
		CreatedAt:               "2026-08-01T00:00:01Z", UpdatedAt: "2026-08-01T00:00:01Z",
	}, agentHubSession{ID: "ses_stopped", State: "stopped", UpdatedAt: "2026-08-01T00:00:11Z"})

	if err := manager.recoverAgentHubGenerations(context.Background()); err != nil {
		t.Fatal(err)
	}
	fake.mu.Lock()
	listCalls, eventsCalls, streamCalls := fake.listCalls, fake.eventsCalls, fake.streamCalls
	fake.mu.Unlock()
	if listCalls != 1 {
		t.Fatalf("recovery must issue exactly one session list, got %d", listCalls)
	}
	if eventsCalls != 0 || streamCalls != 0 {
		t.Fatalf("recovery must not read event history or open streams: events=%d streams=%d", eventsCalls, streamCalls)
	}
	fake.mu.Lock()
	for _, action := range fake.actions {
		if action == "resume" {
			fake.mu.Unlock()
			t.Fatal("stopped Session without mailbox demand was resumed during startup")
		}
	}
	fake.mu.Unlock()
	live := manager.runtimeByID("gen-live")
	if live == nil {
		t.Fatal("live run was not recovered")
	}
	waitForRuntimeTest(t, func() bool {
		record := pollerGenerationState(live)
		return record.CompletionSessionID == "ses_live" && !record.CompletionPending
	})
	live.mu.Lock()
	liveGeneration, liveState := live.record, live.agentHubState
	live.mu.Unlock()
	if liveGeneration.Status != "idle" || liveState != "ready" {
		t.Fatalf("live run projection mismatch: %#v state=%q", liveGeneration, liveState)
	}
	stopped := manager.runtimeByID("gen-stopped")
	if stopped == nil {
		t.Fatal("stopped run was not recovered")
	}
	stoppedGeneration := pollerGenerationState(stopped)
	if stoppedGeneration.Status != "stopped" || !stoppedGeneration.AgentHubStoppedObserved {
		t.Fatalf("stopped run projection mismatch: %#v", stoppedGeneration)
	}
	if response := closeRuntimeTestGeneration(t, manager, workspace, "gen-live"); response.Code != http.StatusOK {
		t.Fatalf("test cleanup close failed: %d %s", response.Code, response.Body.String())
	}
}

func TestAgentHubRecoverySingleListForManyStoppedGenerations(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	now := "2026-08-01T00:00:01Z"
	const stoppedGenerations = 8
	records := make([]generationRecord, 0, stoppedGenerations)
	fake.mu.Lock()
	for index := 0; index < stoppedGenerations; index++ {
		id := fmt.Sprintf("gen-%03d", index)
		sessionID := "ses_" + id
		records = append(records, generationRecord{
			ID: id, WorkspaceID: workspace.ID, ResourceID: fmt.Sprintf("project1.task%d", index+1), AgentHubSessionID: sessionID,
			SourceExternalID: workspace.ID + "/" + id, Status: "stopped",
			AgentHubStoppedObserved: true, CreatedAt: now, UpdatedAt: now,
		})
		fake.sessions[sessionID] = agentHubSession{
			ID: sessionID, State: "stopped", UpdatedAt: now,
			Source: &agentHubSource{App: agentHubSourceApp, InstanceID: "pua-runtime-test", ExternalID: workspace.ID + "/" + id},
		}
	}
	fake.mu.Unlock()
	if err := rewriteTestGenerationRecords(workspace.Path, records); err != nil {
		t.Fatal(err)
	}

	if err := manager.recoverAgentHubGenerations(context.Background()); err != nil {
		t.Fatal(err)
	}
	fake.mu.Lock()
	listCalls, eventsCalls, streamCalls := fake.listCalls, fake.eventsCalls, fake.streamCalls
	fake.mu.Unlock()
	if listCalls != 1 {
		t.Fatalf("%d stopped runs must recover with exactly one session list, got %d", stoppedGenerations, listCalls)
	}
	if eventsCalls != 0 || streamCalls != 0 {
		t.Fatalf("stopped runs must not read events or open streams: events=%d streams=%d", eventsCalls, streamCalls)
	}
	if rt := manager.runtimeByID("gen-007"); rt == nil {
		t.Fatal("stopped runs were not registered as lightweight runtimes")
	}
}

func TestAgentHubRecoveryDoesNotReplayConfirmedActiveTurnAfterDaemonRestart(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	record := generationRecord{
		ID: "gen-active-restart", WorkspaceID: workspace.ID, ResourceID: "project1.task1",
		AgentHubSessionID: "ses-active-restart", SourceExternalID: workspace.ID + "/run-active-restart",
		Generation: 1, GenerationID: "gen-active-restart", AgentHubAgentName: "fake-agent",
		Status: "running", LastTurnID: "turn-active-restart", CurrentTurnID: "turn-active-restart",
		CreatedAt: "2026-08-01T00:00:01Z", UpdatedAt: "2026-08-01T00:00:01Z",
	}
	seedPollerGeneration(t, fake, workspace, record, agentHubSession{
		ID: record.AgentHubSessionID, State: "stopped", StopReason: "daemon_recovery",
		UpdatedAt: "2026-08-01T00:00:10Z",
	})
	fake.mu.Lock()
	fake.appendLocked(record.AgentHubSessionID, "message.input", map[string]any{
		"messageId": "msg-confirmed-restart", "text": "already delivered", "role": "user",
	})
	fake.appendLocked(record.AgentHubSessionID, "turn.started", map[string]any{"text": "already delivered"})
	terminal := fake.appendLocked(record.AgentHubSessionID, "turn.cancelled", map[string]any{"reason": "daemon_recovery"})
	terminal.TurnID = record.LastTurnID
	fake.events[record.AgentHubSessionID][len(fake.events[record.AgentHubSessionID])-1] = terminal
	session := fake.sessions[record.AgentHubSessionID]
	session.State = "stopped"
	session.StopReason = "daemon_recovery"
	session.CurrentTurnID = ""
	fake.sessions[session.ID] = session
	fake.mu.Unlock()

	restarted := newAgentManager(manager.server)
	manager.server.agents = restarted
	if err := restarted.recoverAgentHubGenerations(context.Background()); err != nil {
		t.Fatal(err)
	}
	waitForRuntimeTest(t, func() bool {
		rt := restarted.runtimeByID(record.ID)
		if rt == nil {
			return false
		}
		current := pollerGenerationState(rt)
		return current.Status == "stopped" && !current.CompletionPending
	})
	fake.mu.Lock()
	messageIDs := append([]string(nil), fake.messageIDs...)
	actions := append([]string(nil), fake.actions...)
	fake.mu.Unlock()
	if len(messageIDs) != 0 {
		t.Fatalf("restart replayed a confirmed prompt: message ids=%#v", messageIDs)
	}
	for _, action := range actions {
		if action == "resume" {
			t.Fatalf("daemon recovery resumed a terminal stopped Session without mailbox demand: actions=%#v", actions)
		}
	}
}

func TestAgentHubRecoveryDoesNotBlockStartup(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	gate := make(chan struct{})
	blocking := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/v1/sessions" && r.Method == http.MethodGet {
			<-gate
		}
		fake.ServeHTTP(w, r)
	})
	hub := httptest.NewServer(blocking)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	seedPollerGeneration(t, fake, workspace, generationRecord{
		ID: "gen-live", WorkspaceID: workspace.ID, AgentHubSessionID: "ses_live",
		SourceExternalID: workspace.ID + "/run-live",
		Status:           "running", CreatedAt: "2026-08-01T00:00:01Z", UpdatedAt: "2026-08-01T00:00:01Z",
	}, agentHubSession{ID: "ses_live", State: "ready", UpdatedAt: "2026-08-01T00:00:10Z"})

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	start := time.Now()
	manager.startAgentRecovery(ctx)
	if elapsed := time.Since(start); elapsed > time.Second {
		t.Fatalf("startup recovery blocked the caller for %s while AgentHub was unresponsive", elapsed)
	}
	close(gate)
	waitForRuntimeTest(t, func() bool {
		rt := manager.runtimeByID("gen-live")
		if rt == nil {
			return false
		}
		rt.mu.Lock()
		defer rt.mu.Unlock()
		return rt.record.Status == "idle"
	})
	// Let the background recovery pass finish projection saves before the
	// deferred cancel and TempDir cleanup race it.
	time.Sleep(100 * time.Millisecond)
}
