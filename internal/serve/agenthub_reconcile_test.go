package serve

import (
	"context"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
)

// seedArchivedSession registers an archived AgentHub session in the fake
// along with a continuous durable event history that passes through stopped.
func seedArchivedSession(fake *runtimeFakeAgentHub, session agentHubSession, withStopped bool) {
	fake.mu.Lock()
	fake.sessions[session.ID] = session
	fake.appendLocked(session.ID, "session.created", map[string]any{"id": session.ID})
	if withStopped {
		fake.appendLocked(session.ID, "session.state", map[string]any{"state": "stopped", "reason": "provider-exited"})
	}
	fake.appendLocked(session.ID, "session.archived", map[string]any{})
	fake.mu.Unlock()
}

func archivedTestGeneration(workspace serveWorkspace, id string) generationRecord {
	now := "2026-08-01T00:00:01Z"
	return generationRecord{
		ID: id, WorkspaceID: workspace.ID, ResourceID: "project1.task1",
		AgentHubSessionID: "ses_" + id, SourceExternalID: workspace.ID + "/" + id,
		Status:    "running",
		CreatedAt: now, UpdatedAt: now,
	}
}

func TestAgentHubPollerRetiresArchivedGenerationAfterStopped(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	record := archivedTestGeneration(workspace, "gen-archived")
	session := agentHubSession{
		ID: record.AgentHubSessionID, State: "archived", UpdatedAt: "2026-08-01T00:00:10Z",
		Source: &agentHubSource{App: agentHubSourceApp, InstanceID: "pua-runtime-test", ExternalID: record.SourceExternalID},
	}
	seedArchivedSession(fake, session, true)
	if err := saveGenerationRecord(workspace.Path, record); err != nil {
		t.Fatal(err)
	}

	// The service missed the stopped edge: the session stopped and was
	// archived between polls, so it no longer appears in the live list.
	if err := manager.pollAgentHubSessions(context.Background()); err != nil {
		t.Fatal(err)
	}
	rt := manager.runtimeByID(record.ID)
	waitForRuntimeTest(t, func() bool {
		updated := pollerGenerationState(rt)
		return updated.Status == "stopped" && updated.AgentHubStoppedObserved
	})

	// Repeated reconciliation is idempotent and must not replay the proof.
	if err := manager.pollAgentHubSessions(context.Background()); err != nil {
		t.Fatal(err)
	}
	time.Sleep(100 * time.Millisecond)
	// The proof must not be replayed once the stopped observation is recorded.
	fake.mu.Lock()
	eventsCalls := fake.eventsCalls
	fake.mu.Unlock()
	if eventsCalls != 1 {
		t.Fatalf("archived proof was replayed %d times, want 1", eventsCalls)
	}
}

func TestAgentHubPollerRetainsGenerationForArchivedWithCursorGap(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	record := archivedTestGeneration(workspace, "gen-gap")
	session := agentHubSession{
		ID: record.AgentHubSessionID, State: "archived", UpdatedAt: "2026-08-01T00:00:10Z",
		Source: &agentHubSource{App: agentHubSourceApp, InstanceID: "pua-runtime-test", ExternalID: record.SourceExternalID},
	}
	seedArchivedSession(fake, session, true)
	fake.mu.Lock()
	fake.gapAfter = 2
	fake.mu.Unlock()
	if err := saveGenerationRecord(workspace.Path, record); err != nil {
		t.Fatal(err)
	}

	if err := manager.pollAgentHubSessions(context.Background()); err != nil {
		t.Fatal(err)
	}
	updated := pollerGenerationState(manager.runtimeByID(record.ID))
	if updated.Status != "recovering" {
		t.Fatalf("cursor gap must keep the generation recovering: %#v", updated)
	}

	// Archived history is immutable: a permanent proof failure is not retried.
	if err := manager.pollAgentHubSessions(context.Background()); err != nil {
		t.Fatal(err)
	}
	fake.mu.Lock()
	eventsCalls := fake.eventsCalls
	fake.mu.Unlock()
	if eventsCalls != 1 {
		t.Fatalf("permanent proof failure was retried: events calls = %d, want 1", eventsCalls)
	}
	if updated := pollerGenerationState(manager.runtimeByID(record.ID)); updated.Status != "recovering" {
		t.Fatalf("repeated poll must keep failing closed: %#v", updated)
	}
}

func TestAgentHubPollerRetainsGenerationForArchivedWithoutStoppedHistory(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	record := archivedTestGeneration(workspace, "gen-nostop")
	session := agentHubSession{
		ID: record.AgentHubSessionID, State: "archived", UpdatedAt: "2026-08-01T00:00:10Z",
		Source: &agentHubSource{App: agentHubSourceApp, InstanceID: "pua-runtime-test", ExternalID: record.SourceExternalID},
	}
	seedArchivedSession(fake, session, false)
	if err := saveGenerationRecord(workspace.Path, record); err != nil {
		t.Fatal(err)
	}

	if err := manager.pollAgentHubSessions(context.Background()); err != nil {
		t.Fatal(err)
	}
	updated := pollerGenerationState(manager.runtimeByID(record.ID))
	if updated.Status != "recovering" || updated.AgentHubStoppedObserved {
		t.Fatalf("archived session without durable stopped must fail closed: %#v", updated)
	}
}

func TestAgentHubPollerRetriesArchivedProofAfterTransientFailure(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	record := archivedTestGeneration(workspace, "gen-flaky")
	session := agentHubSession{
		ID: record.AgentHubSessionID, State: "archived", UpdatedAt: "2026-08-01T00:00:10Z",
		Source: &agentHubSource{App: agentHubSourceApp, InstanceID: "pua-runtime-test", ExternalID: record.SourceExternalID},
	}
	seedArchivedSession(fake, session, true)
	fake.mu.Lock()
	fake.failEvents = true
	fake.mu.Unlock()
	if err := saveGenerationRecord(workspace.Path, record); err != nil {
		t.Fatal(err)
	}

	if err := manager.pollAgentHubSessions(context.Background()); err != nil {
		t.Fatal(err)
	}
	updated := pollerGenerationState(manager.runtimeByID(record.ID))
	if updated.Status != "recovering" {
		t.Fatalf("transient proof failure must fail closed: %#v", updated)
	}

	// 5xx failures are retryable: once AgentHub serves events again, the next
	// poll proves archived-after-stopped and retires the generation.
	fake.mu.Lock()
	fake.failEvents = false
	fake.mu.Unlock()
	if err := manager.pollAgentHubSessions(context.Background()); err != nil {
		t.Fatal(err)
	}
	rt := manager.runtimeByID(record.ID)
	waitForRuntimeTest(t, func() bool {
		updated := pollerGenerationState(rt)
		return updated.Status == "stopped"
	})
}

func TestAgentHubPollerRetiresArchivedSessionWithConflictingSource(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	record := archivedTestGeneration(workspace, "gen-conflict")
	session := agentHubSession{
		ID: record.AgentHubSessionID, State: "archived", UpdatedAt: "2026-08-01T00:00:10Z",
		Source: &agentHubSource{App: agentHubSourceApp, InstanceID: "pua-runtime-test", ExternalID: "other-workspace/other-run"},
	}
	seedArchivedSession(fake, session, true)
	if err := saveGenerationRecord(workspace.Path, record); err != nil {
		t.Fatal(err)
	}

	if err := manager.pollAgentHubSessions(context.Background()); err != nil {
		t.Fatal(err)
	}
	updated, err := loadGenerationRecord(workspace.Path, record.ID)
	if err != nil || !updated.Retired || updated.Status != "stopped" || !strings.Contains(updated.RetireReason, "source is incompatible") {
		t.Fatalf("conflicting archived Session did not retire: %#v err=%v", updated, err)
	}
	fake.mu.Lock()
	eventsCalls := fake.eventsCalls
	fake.mu.Unlock()
	if eventsCalls != 0 {
		t.Fatalf("already archived replacement must not replay event history, got %d event calls", eventsCalls)
	}
}

func TestAgentHubPollerUnreachableLeavesGenerationUntouched(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	record := archivedTestGeneration(workspace, "gen-offline")
	session := agentHubSession{
		ID: record.AgentHubSessionID, State: "ready", UpdatedAt: "2026-08-01T00:00:10Z",
		Source: &agentHubSource{App: agentHubSourceApp, InstanceID: "pua-runtime-test", ExternalID: record.SourceExternalID},
	}
	fake.mu.Lock()
	fake.sessions[session.ID] = session
	fake.mu.Unlock()
	if err := saveGenerationRecord(workspace.Path, record); err != nil {
		t.Fatal(err)
	}
	hub.Close()

	if err := manager.pollAgentHubSessions(context.Background()); err == nil {
		t.Fatal("poll against an unreachable AgentHub must report an error")
	}
	// The poll aborts before touching any generation: no runtime is registered and
	// the persisted projection keeps its live status.
	updated, err := loadGenerationRecord(workspace.Path, record.ID)
	if err != nil {
		t.Fatal(err)
	}
	if updated.Status != "running" {
		t.Fatalf("unreachable AgentHub must leave the run untouched: %#v", updated)
	}
}

func TestAgentHubRecoveryReleasesArchivedAfterStoppedOnRestart(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	record := archivedTestGeneration(workspace, "gen-restart")
	session := agentHubSession{
		ID: record.AgentHubSessionID, State: "archived", UpdatedAt: "2026-08-01T00:00:10Z",
		Source: &agentHubSource{App: agentHubSourceApp, InstanceID: "pua-runtime-test", ExternalID: record.SourceExternalID},
	}
	seedArchivedSession(fake, session, true)
	if err := saveGenerationRecord(workspace.Path, record); err != nil {
		t.Fatal(err)
	}

	// The service stopped before observing the stopped edge and only sees the
	// archived session on restart recovery.
	if err := manager.recoverAgentHubGenerations(context.Background()); err != nil {
		t.Fatal(err)
	}
	rt := manager.runtimeByID(record.ID)
	waitForRuntimeTest(t, func() bool {
		updated := pollerGenerationState(rt)
		return updated.Status == "stopped" && updated.AgentHubStoppedObserved
	})
}

func TestAgentHubRecoveryRetainsArchivedWithoutProofOnRestart(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	record := archivedTestGeneration(workspace, "gen-restart-gap")
	session := agentHubSession{
		ID: record.AgentHubSessionID, State: "archived", UpdatedAt: "2026-08-01T00:00:10Z",
		Source: &agentHubSource{App: agentHubSourceApp, InstanceID: "pua-runtime-test", ExternalID: record.SourceExternalID},
	}
	seedArchivedSession(fake, session, true)
	fake.mu.Lock()
	fake.gapAfter = 2
	fake.mu.Unlock()
	if err := saveGenerationRecord(workspace.Path, record); err != nil {
		t.Fatal(err)
	}

	if err := manager.recoverAgentHubGenerations(context.Background()); err != nil {
		t.Fatal(err)
	}
	rt := manager.runtimeByID(record.ID)
	waitForRuntimeTest(t, func() bool {
		return pollerGenerationState(rt).Status == "recovering"
	})
	// Give the asynchronous proof a chance to complete before asserting the
	// generation remains unproven.
	time.Sleep(200 * time.Millisecond)
	updated := pollerGenerationState(rt)
	if updated.AgentHubStoppedObserved {
		t.Fatalf("unproven archived session must retain the generation after restart: %#v", updated)
	}
}
