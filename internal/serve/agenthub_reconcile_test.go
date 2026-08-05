package serve

import (
	"context"
	"net/http/httptest"
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

func archivedTestRun(workspace guiWorkspace, id string) agentRun {
	now := "2026-08-01T00:00:01Z"
	return agentRun{
		ID: id, WorkspaceID: workspace.ID, ResourceID: "project1.task1",
		AgentHubSessionID: "ses_" + id, SourceExternalID: workspace.ID + "/" + id,
		ForgeSessionID: "session-test", Status: "running",
		CreatedAt: now, UpdatedAt: now,
	}
}

func TestAgentHubPollerReleasesForgeSessionForArchivedAfterStopped(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	run := archivedTestRun(workspace, "run-archived")
	run.ForgeSessionID = seedTestForgeSession(t, workspace, run.SourceExternalID)
	session := agentHubSession{
		ID: run.AgentHubSessionID, State: "archived", UpdatedAt: "2026-08-01T00:00:10Z",
		Source: &agentHubSource{App: agentHubSourceApp, InstanceID: "forge-runtime-test", ExternalID: run.SourceExternalID},
	}
	seedArchivedSession(fake, session, true)
	if err := saveAgentRun(workspace.Path, run); err != nil {
		t.Fatal(err)
	}

	// The service missed the stopped edge: the session stopped and was
	// archived between polls, so it no longer appears in the live list.
	if err := manager.pollAgentHubSessions(context.Background()); err != nil {
		t.Fatal(err)
	}
	rt := manager.runtimeByID(run.ID)
	waitForRuntimeTest(t, func() bool {
		updated := pollerRunState(rt)
		return updated.Status == "stopped" && updated.AgentHubStoppedObserved && updated.ForgeSessionID == ""
	})
	if sessions := testForgeSessions(t, workspace.Path); len(sessions) != 0 {
		t.Fatalf("archived-after-stopped session did not release the Forge session")
	}

	// Repeated reconciliation is idempotent and must not repeat the release.
	if err := manager.pollAgentHubSessions(context.Background()); err != nil {
		t.Fatal(err)
	}
	time.Sleep(100 * time.Millisecond)
	if sessions := testForgeSessions(t, workspace.Path); len(sessions) != 0 {
		t.Fatalf("repeated reconciliation recreated or retained the Forge session: %#v", sessions)
	}
	// The proof must not be replayed once the stopped observation is recorded.
	fake.mu.Lock()
	eventsCalls := fake.eventsCalls
	fake.mu.Unlock()
	if eventsCalls != 1 {
		t.Fatalf("archived proof was replayed %d times, want 1", eventsCalls)
	}
}

func TestAgentHubPollerRetainsLockForArchivedWithCursorGap(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	run := archivedTestRun(workspace, "run-gap")
	run.ForgeSessionID = seedTestForgeSession(t, workspace, run.SourceExternalID)
	session := agentHubSession{
		ID: run.AgentHubSessionID, State: "archived", UpdatedAt: "2026-08-01T00:00:10Z",
		Source: &agentHubSource{App: agentHubSourceApp, InstanceID: "forge-runtime-test", ExternalID: run.SourceExternalID},
	}
	seedArchivedSession(fake, session, true)
	fake.mu.Lock()
	fake.gapAfter = 2
	fake.mu.Unlock()
	if err := saveAgentRun(workspace.Path, run); err != nil {
		t.Fatal(err)
	}

	if err := manager.pollAgentHubSessions(context.Background()); err != nil {
		t.Fatal(err)
	}
	updated := pollerRunState(manager.runtimeByID(run.ID))
	if updated.Status != "recovering" || updated.ForgeSessionID == "" {
		t.Fatalf("cursor gap must keep the run recovering with the lock retained: %#v", updated)
	}
	if sessions := testForgeSessions(t, workspace.Path); len(sessions) == 0 {
		t.Fatal("cursor gap released the Forge session")
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
	if updated := pollerRunState(manager.runtimeByID(run.ID)); updated.Status != "recovering" || updated.ForgeSessionID == "" {
		t.Fatalf("repeated poll must keep failing closed: %#v", updated)
	}
}

func TestAgentHubPollerRetainsLockForArchivedWithoutStoppedHistory(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	run := archivedTestRun(workspace, "run-nostop")
	run.ForgeSessionID = seedTestForgeSession(t, workspace, run.SourceExternalID)
	session := agentHubSession{
		ID: run.AgentHubSessionID, State: "archived", UpdatedAt: "2026-08-01T00:00:10Z",
		Source: &agentHubSource{App: agentHubSourceApp, InstanceID: "forge-runtime-test", ExternalID: run.SourceExternalID},
	}
	seedArchivedSession(fake, session, false)
	if err := saveAgentRun(workspace.Path, run); err != nil {
		t.Fatal(err)
	}

	if err := manager.pollAgentHubSessions(context.Background()); err != nil {
		t.Fatal(err)
	}
	updated := pollerRunState(manager.runtimeByID(run.ID))
	if updated.Status != "recovering" || updated.ForgeSessionID == "" || updated.AgentHubStoppedObserved {
		t.Fatalf("archived session without durable stopped must fail closed: %#v", updated)
	}
	if sessions := testForgeSessions(t, workspace.Path); len(sessions) == 0 {
		t.Fatal("archived session without stopped history released the Forge session")
	}
}

func TestAgentHubPollerRetriesArchivedProofAfterTransientFailure(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	run := archivedTestRun(workspace, "run-flaky")
	run.ForgeSessionID = seedTestForgeSession(t, workspace, run.SourceExternalID)
	session := agentHubSession{
		ID: run.AgentHubSessionID, State: "archived", UpdatedAt: "2026-08-01T00:00:10Z",
		Source: &agentHubSource{App: agentHubSourceApp, InstanceID: "forge-runtime-test", ExternalID: run.SourceExternalID},
	}
	seedArchivedSession(fake, session, true)
	fake.mu.Lock()
	fake.failEvents = true
	fake.mu.Unlock()
	if err := saveAgentRun(workspace.Path, run); err != nil {
		t.Fatal(err)
	}

	if err := manager.pollAgentHubSessions(context.Background()); err != nil {
		t.Fatal(err)
	}
	updated := pollerRunState(manager.runtimeByID(run.ID))
	if updated.Status != "recovering" || updated.ForgeSessionID == "" {
		t.Fatalf("transient proof failure must fail closed: %#v", updated)
	}
	if sessions := testForgeSessions(t, workspace.Path); len(sessions) == 0 {
		t.Fatal("transient proof failure released the Forge session")
	}

	// 5xx failures are retryable: once AgentHub serves events again, the next
	// poll proves archived-after-stopped and releases the lock.
	fake.mu.Lock()
	fake.failEvents = false
	fake.mu.Unlock()
	if err := manager.pollAgentHubSessions(context.Background()); err != nil {
		t.Fatal(err)
	}
	rt := manager.runtimeByID(run.ID)
	waitForRuntimeTest(t, func() bool {
		updated := pollerRunState(rt)
		return updated.Status == "stopped" && updated.ForgeSessionID == ""
	})
	if sessions := testForgeSessions(t, workspace.Path); len(sessions) != 0 {
		t.Fatal("recovered proof did not release the Forge session")
	}
}

func TestAgentHubPollerRejectsArchivedSessionWithConflictingSource(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	run := archivedTestRun(workspace, "run-conflict")
	run.ForgeSessionID = seedTestForgeSession(t, workspace, run.SourceExternalID)
	session := agentHubSession{
		ID: run.AgentHubSessionID, State: "archived", UpdatedAt: "2026-08-01T00:00:10Z",
		Source: &agentHubSource{App: agentHubSourceApp, InstanceID: "forge-runtime-test", ExternalID: "other-workspace/other-run"},
	}
	seedArchivedSession(fake, session, true)
	if err := saveAgentRun(workspace.Path, run); err != nil {
		t.Fatal(err)
	}

	if err := manager.pollAgentHubSessions(context.Background()); err != nil {
		t.Fatal(err)
	}
	updated := pollerRunState(manager.runtimeByID(run.ID))
	if updated.Status != "recovering" || updated.ForgeSessionID == "" {
		t.Fatalf("conflicting source must fail closed: %#v", updated)
	}
	if sessions := testForgeSessions(t, workspace.Path); len(sessions) == 0 {
		t.Fatal("conflicting source released the Forge session")
	}
	fake.mu.Lock()
	eventsCalls := fake.eventsCalls
	fake.mu.Unlock()
	if eventsCalls != 0 {
		t.Fatalf("conflicting source must not read event history, got %d event calls", eventsCalls)
	}
}

func TestAgentHubPollerUnreachableRetainsAllLocks(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	run := archivedTestRun(workspace, "run-offline")
	run.ForgeSessionID = seedTestForgeSession(t, workspace, run.SourceExternalID)
	session := agentHubSession{
		ID: run.AgentHubSessionID, State: "ready", UpdatedAt: "2026-08-01T00:00:10Z",
		Source: &agentHubSource{App: agentHubSourceApp, InstanceID: "forge-runtime-test", ExternalID: run.SourceExternalID},
	}
	fake.mu.Lock()
	fake.sessions[session.ID] = session
	fake.mu.Unlock()
	if err := saveAgentRun(workspace.Path, run); err != nil {
		t.Fatal(err)
	}
	hub.Close()

	if err := manager.pollAgentHubSessions(context.Background()); err == nil {
		t.Fatal("poll against an unreachable AgentHub must report an error")
	}
	// The poll aborts before touching any run: no runtime is registered and
	// the persisted projection keeps its live status and Forge session.
	updated, err := loadAgentRun(workspace.Path, run.ID)
	if err != nil {
		t.Fatal(err)
	}
	if updated.Status != "running" || updated.ForgeSessionID == "" {
		t.Fatalf("unreachable AgentHub must leave the run untouched: %#v", updated)
	}
	if sessions := testForgeSessions(t, workspace.Path); len(sessions) == 0 {
		t.Fatal("unreachable AgentHub released the Forge session")
	}
}

func TestAgentHubRecoveryReleasesArchivedAfterStoppedOnRestart(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	run := archivedTestRun(workspace, "run-restart")
	run.ForgeSessionID = seedTestForgeSession(t, workspace, run.SourceExternalID)
	session := agentHubSession{
		ID: run.AgentHubSessionID, State: "archived", UpdatedAt: "2026-08-01T00:00:10Z",
		Source: &agentHubSource{App: agentHubSourceApp, InstanceID: "forge-runtime-test", ExternalID: run.SourceExternalID},
	}
	seedArchivedSession(fake, session, true)
	if err := saveAgentRun(workspace.Path, run); err != nil {
		t.Fatal(err)
	}

	// The service stopped before observing the stopped edge and only sees the
	// archived session on restart recovery.
	if err := manager.recoverAgentHubRuns(context.Background()); err != nil {
		t.Fatal(err)
	}
	rt := manager.runtimeByID(run.ID)
	waitForRuntimeTest(t, func() bool {
		updated := pollerRunState(rt)
		return updated.Status == "stopped" && updated.AgentHubStoppedObserved && updated.ForgeSessionID == ""
	})
	if sessions := testForgeSessions(t, workspace.Path); len(sessions) != 0 {
		t.Fatal("restart recovery did not release the archived-after-stopped Forge session")
	}
}

func TestAgentHubRecoveryRetainsArchivedWithoutProofOnRestart(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	run := archivedTestRun(workspace, "run-restart-gap")
	run.ForgeSessionID = seedTestForgeSession(t, workspace, run.SourceExternalID)
	session := agentHubSession{
		ID: run.AgentHubSessionID, State: "archived", UpdatedAt: "2026-08-01T00:00:10Z",
		Source: &agentHubSource{App: agentHubSourceApp, InstanceID: "forge-runtime-test", ExternalID: run.SourceExternalID},
	}
	seedArchivedSession(fake, session, true)
	fake.mu.Lock()
	fake.gapAfter = 2
	fake.mu.Unlock()
	if err := saveAgentRun(workspace.Path, run); err != nil {
		t.Fatal(err)
	}

	if err := manager.recoverAgentHubRuns(context.Background()); err != nil {
		t.Fatal(err)
	}
	rt := manager.runtimeByID(run.ID)
	waitForRuntimeTest(t, func() bool {
		return pollerRunState(rt).Status == "recovering"
	})
	// Give the asynchronous proof a chance to complete before asserting the
	// lock is still held.
	time.Sleep(200 * time.Millisecond)
	updated := pollerRunState(rt)
	if updated.ForgeSessionID == "" || updated.AgentHubStoppedObserved {
		t.Fatalf("unproven archived session must retain the lock after restart: %#v", updated)
	}
	if sessions := testForgeSessions(t, workspace.Path); len(sessions) == 0 {
		t.Fatal("unproven archived session released the Forge session after restart")
	}
}

func TestAgentHubRecoveryReleasesStoppedRunLockHeldAcrossRestart(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	// The service observed durable stopped and persisted it, but exited before
	// releasing the Forge session. Recovery must finish the release.
	run := archivedTestRun(workspace, "run-crash")
	run.ForgeSessionID = seedTestForgeSession(t, workspace, run.SourceExternalID)
	run.Status = "stopped"
	run.AgentHubStoppedObserved = true
	now := "2026-08-01T00:00:10Z"
	session := agentHubSession{
		ID: run.AgentHubSessionID, State: "stopped", UpdatedAt: now,
		Source: &agentHubSource{App: agentHubSourceApp, InstanceID: "forge-runtime-test", ExternalID: run.SourceExternalID},
	}
	fake.mu.Lock()
	fake.sessions[session.ID] = session
	fake.mu.Unlock()
	if err := saveAgentRun(workspace.Path, run); err != nil {
		t.Fatal(err)
	}

	if err := manager.recoverAgentHubRuns(context.Background()); err != nil {
		t.Fatal(err)
	}
	rt := manager.runtimeByID(run.ID)
	waitForRuntimeTest(t, func() bool {
		return pollerRunState(rt).ForgeSessionID == ""
	})
	if sessions := testForgeSessions(t, workspace.Path); len(sessions) != 0 {
		t.Fatal("restart recovery did not release the stopped Forge session")
	}
	fake.mu.Lock()
	eventsCalls := fake.eventsCalls
	fake.mu.Unlock()
	if eventsCalls != 0 {
		t.Fatalf("stopped session release must not read event history, got %d event calls", eventsCalls)
	}
}
