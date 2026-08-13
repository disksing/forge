package serve

import (
	"context"
	"net/http/httptest"
	"sync"
	"testing"
	"time"

	"github.com/disksing/forge/internal/app"
)

func idleTestRun(workspace guiWorkspace, resourceID, runID, sessionID string, deadline time.Time) agentRun {
	boundary := deadline.Add(-30 * time.Minute)
	return agentRun{
		ID:                runID,
		WorkspaceID:       workspace.ID,
		ResourceID:        resourceID,
		Generation:        1,
		GenerationID:      "gen-" + runID,
		SourceInstanceID:  "forge-runtime-test",
		BindingKind:       "profile",
		BindingName:       "default",
		ProfileRevision:   "test-revision",
		AgentHubSessionID: sessionID,
		AgentHubAgentName: "fake-agent",
		SourceExternalID:  resourceID + "/" + runID,
		Status:            "idle",
		IdleSinceAt:       boundary.Format(time.RFC3339Nano),
		IdleDeadlineAt:    deadline.Format(time.RFC3339Nano),
		CreatedAt:         boundary.Add(-time.Second).Format(time.RFC3339Nano),
		UpdatedAt:         boundary.Format(time.RFC3339Nano),
		Cwd:               workspace.Path,
	}
}

func seedIdleTestRun(t *testing.T, fake *runtimeFakeAgentHub, workspace guiWorkspace, run agentRun, state string) {
	t.Helper()
	seedPollerRun(t, fake, workspace, run, agentHubSession{
		ID: run.AgentHubSessionID, State: state, AgentName: "fake-agent",
		UpdatedAt: run.IdleSinceAt,
	})
}

func waitForFakeSessionState(t *testing.T, fake *runtimeFakeAgentHub, sessionID, state string) {
	t.Helper()
	waitForRuntimeTest(t, func() bool {
		fake.mu.Lock()
		defer fake.mu.Unlock()
		return fake.sessions[sessionID].State == state
	})
}

func waitForIdleGenerationSuspended(t *testing.T, manager *agentManager, workspacePath, runID string) agentRun {
	t.Helper()
	var stored agentRun
	waitForRuntimeTest(t, func() bool {
		candidate, err := loadAgentRun(workspacePath, runID)
		if err != nil || candidate.Status != "idle-suspended" || candidate.AgentHubStoppedObserved ||
			!candidate.IdleSleepStopRequested || candidate.ReplacementPending {
			return false
		}
		rt := manager.runtimeByID(runID)
		if rt != nil {
			rt.mu.Lock()
			lifecycleStopInFlight := rt.lifecycleStopInFlight
			agentHubStopRequested := rt.agentHubStopRequested
			rt.mu.Unlock()
			if lifecycleStopInFlight || agentHubStopRequested {
				return false
			}
		}
		stored = candidate
		return true
	})
	return stored
}

func fakeStopCalls(fake *runtimeFakeAgentHub) int {
	fake.mu.Lock()
	defer fake.mu.Unlock()
	return fake.stopCalls
}

func TestResourceIdleSleepHonorsDeadlineAndSuspendsAllResourceKinds(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	deadline := time.Date(2026, 8, 1, 0, 30, 0, 0, time.UTC)
	manager.now = func() time.Time { return deadline.Add(-time.Second) }
	resources := []string{"workspace", "project1", "project1.task1", app.SchedulerResourceID}
	runs := make([]agentRun, 0, len(resources))
	for index, resourceID := range resources {
		run := idleTestRun(workspace, resourceID, "run-idle-"+string(rune('a'+index)), "ses-idle-"+string(rune('a'+index)), deadline)
		seedIdleTestRun(t, fake, workspace, run, "ready")
		runs = append(runs, run)
	}
	if err := manager.pollAgentHubSessions(context.Background()); err != nil {
		t.Fatal(err)
	}
	if fakeStopCalls(fake) != 0 {
		t.Fatalf("generation slept before its deadline: stop calls=%d", fakeStopCalls(fake))
	}
	for _, resourceID := range resources {
		run, found, err := currentResourceGeneration(workspace.Path, resourceID)
		if err != nil || !found || run.Status != "idle" || run.IdleDeadlineAt != deadline.Format(time.RFC3339Nano) {
			t.Fatalf("pre-deadline generation changed for %s: found=%v err=%v run=%#v", resourceID, found, err, run)
		}
	}

	manager.now = func() time.Time { return deadline }
	if err := manager.pollAgentHubSessions(context.Background()); err != nil {
		t.Fatal(err)
	}
	for _, run := range runs {
		waitForFakeSessionState(t, fake, run.AgentHubSessionID, "stopped")
		waitForIdleGenerationSuspended(t, manager, workspace.Path, run.ID)
	}
	if got := fakeStopCalls(fake); got != len(resources) {
		t.Fatalf("each resource kind must be stopped exactly once: got %d, want %d", got, len(resources))
	}
	for _, expected := range runs {
		resourceID := expected.ResourceID
		current, found, err := currentResourceGeneration(workspace.Path, resourceID)
		if err != nil || !found || current.GenerationID != expected.GenerationID {
			t.Fatalf("idle generation was not retained current for %s: current=%#v found=%v err=%v", resourceID, current, found, err)
		}
	}
}

func TestResourceIdleSleepDoesNotStopActiveApprovalOrMailboxWork(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	deadline := time.Date(2026, 8, 1, 0, 30, 0, 0, time.UTC)
	manager.now = func() time.Time { return deadline }
	active := idleTestRun(workspace, "project1", "run-active", "ses-active", deadline)
	approval := idleTestRun(workspace, "project1.task1", "run-approval", "ses-approval", deadline)
	seedIdleTestRun(t, fake, workspace, active, "running")
	seedIdleTestRun(t, fake, workspace, approval, "waiting_approval")
	fake.mu.Lock()
	session := fake.sessions[approval.AgentHubSessionID]
	session.PendingApprovalIDs = []string{"approval-1"}
	fake.sessions[session.ID] = session
	fake.mu.Unlock()
	queued := idleTestRun(workspace, "project1", "run-queued", "ses-queued", deadline)
	queued.Generation = 2
	queued.GenerationID = "gen-run-queued"
	queued.SourceExternalID = "project1/run-queued"
	// Give the queued case a distinct resource by using the Workspace mailbox
	// directly; the ready generation still has to remain untouched.
	queued.ResourceID = "workspace"
	seedIdleTestRun(t, fake, workspace, queued, "ready")
	if _, err := acceptMailboxMessage(workspace.Path, queued.ResourceID, resourceMessageRequest{Text: "waiting", Mode: resourceMessageModeEnqueue}); err != nil {
		t.Fatal(err)
	}
	if err := manager.pollAgentHubSessions(context.Background()); err != nil {
		t.Fatal(err)
	}
	if got := fakeStopCalls(fake); got != 0 {
		t.Fatalf("active/approval/pending work was stopped: stop calls=%d", got)
	}
	fake.mu.Lock()
	activeState := fake.sessions[active.AgentHubSessionID].State
	approvalState := fake.sessions[approval.AgentHubSessionID].State
	queuedState := fake.sessions[queued.AgentHubSessionID].State
	fake.mu.Unlock()
	if activeState != "running" || approvalState != "waiting_approval" || queuedState != "running" {
		t.Fatalf("work state was not preserved/delivered: active=%s approval=%s queued=%s", activeState, approvalState, queuedState)
	}
}

func TestResourceIdleSleepMessageAfterStopResumesSameGeneration(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	deadline := time.Date(2026, 8, 1, 0, 30, 0, 0, time.UTC)
	manager.now = func() time.Time { return deadline }
	run := idleTestRun(workspace, "project1.task1", "run-race", "ses-race", deadline)
	seedIdleTestRun(t, fake, workspace, run, "ready")
	stopStarted := make(chan struct{})
	releaseStop := make(chan struct{})
	var once sync.Once
	fake.stopHook = func(sessionID string) {
		if sessionID != run.AgentHubSessionID {
			return
		}
		once.Do(func() { close(stopStarted) })
		<-releaseStop
	}
	pollDone := make(chan error, 1)
	go func() { pollDone <- manager.pollAgentHubSessions(context.Background()) }()
	<-stopStarted

	accepted := make(chan resourceMailboxMessage, 1)
	go func() {
		message, err := manager.acceptResourceMessage(context.Background(), workspace, run.ResourceID, resourceMessageRequest{Text: "after sleep", Mode: resourceMessageModeEnqueue})
		if err != nil {
			accepted <- resourceMailboxMessage{LastError: err.Error()}
			return
		}
		accepted <- message
	}()
	select {
	case message := <-accepted:
		t.Fatalf("message bypassed the in-flight Stop barrier: %#v", message)
	case <-time.After(50 * time.Millisecond):
	}
	close(releaseStop)
	message := <-accepted
	if err := <-pollDone; err != nil {
		t.Fatal(err)
	}
	if message.LastError != "" {
		t.Fatal(message.LastError)
	}
	waitForRuntimeTest(t, func() bool {
		current, found, err := currentResourceGeneration(workspace.Path, run.ResourceID)
		if err != nil || !found || current.Generation != run.Generation || current.GenerationID != run.GenerationID {
			return false
		}
		stored, found, err := mailboxMessageByID(workspace.Path, message.ID)
		return err == nil && found && stored.Status == resourceMessageDelivered && stored.GenerationID == current.GenerationID
	})
	if message.GenerationID != run.GenerationID {
		t.Fatalf("message was not delivered to the retained generation: %#v", message)
	}
	if fakeStopCalls(fake) != 1 {
		t.Fatalf("Stop was duplicated during the message race: %d", fakeStopCalls(fake))
	}
	fake.mu.Lock()
	resumeSeen := false
	for _, action := range fake.actions {
		if action == "resume" {
			resumeSeen = true
		}
	}
	fake.mu.Unlock()
	if !resumeSeen {
		t.Fatal("message did not resume the retained Session")
	}
}

func TestResourceIdleSleepRecoversOverdueDeadlineAfterRestart(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	deadline := time.Date(2026, 8, 1, 0, 30, 0, 0, time.UTC)
	run := idleTestRun(workspace, "project1.task1", "run-restart-idle", "ses-restart-idle", deadline)
	seedIdleTestRun(t, fake, workspace, run, "ready")
	restarted := newAgentManager(manager.server)
	manager.server.agents = restarted
	restarted.now = func() time.Time { return deadline.Add(time.Minute) }
	if err := restarted.recoverAgentHubRuns(context.Background()); err != nil {
		t.Fatal(err)
	}
	waitForFakeSessionState(t, fake, run.AgentHubSessionID, "stopped")
	stored := waitForIdleGenerationSuspended(t, restarted, workspace.Path, run.ID)
	if got := fakeStopCalls(fake); got != 1 {
		t.Fatalf("overdue restart recovery issued %d Stop calls, want 1", got)
	}
	if stored.Status != "idle-suspended" || !stored.IdleSleepStopRequested {
		t.Fatalf("restart recovery did not complete the durable sleep lifecycle: %#v", stored)
	}
}

func TestResourceIdleSleepRetriesAmbiguousStopWithoutDuplicateAfterConvergence(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	fake.failNextStop = true
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	deadline := time.Date(2026, 8, 1, 0, 30, 0, 0, time.UTC)
	manager.now = func() time.Time { return deadline }
	run := idleTestRun(workspace, "project1.task1", "run-ambiguous-idle", "ses-ambiguous-idle", deadline)
	seedIdleTestRun(t, fake, workspace, run, "ready")
	if err := manager.pollAgentHubSessions(context.Background()); err != nil {
		t.Fatal(err)
	}
	waitForRuntimeTest(t, func() bool { return fakeStopCalls(fake) == 1 })
	stored, err := loadAgentRun(workspace.Path, run.ID)
	if err != nil {
		t.Fatal(err)
	}
	if !stored.IdleSleepStopRequested {
		t.Fatalf("ambiguous Stop did not retain the durable retry guard: %#v", stored)
	}
	if err := manager.pollAgentHubSessions(context.Background()); err != nil {
		t.Fatal(err)
	}
	waitForFakeSessionState(t, fake, run.AgentHubSessionID, "stopped")
	waitForIdleGenerationSuspended(t, manager, workspace.Path, run.ID)
	if got := fakeStopCalls(fake); got != 2 {
		t.Fatalf("ambiguous Stop did not retry exactly once: %d", got)
	}
	if err := manager.pollAgentHubSessions(context.Background()); err != nil {
		t.Fatal(err)
	}
	if got := fakeStopCalls(fake); got != 2 {
		t.Fatalf("converged automatic sleep repeated Stop after Archive: %d", got)
	}
}

func TestResourceIdleSleepSchedulerTickResumesCurrentGeneration(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := forgeWorkspace.AddSchedule(app.CreateScheduleInput{
		Description: "Inspect the workspace",
		Condition:   "when the workspace needs review",
		Target:      "workspace",
	}); err != nil {
		t.Fatal(err)
	}
	deadline := time.Date(2026, 8, 1, 0, 30, 0, 0, time.UTC)
	manager.now = func() time.Time { return deadline }
	run := idleTestRun(workspace, app.SchedulerResourceID, "run-idle-scheduler", "ses-idle-scheduler", deadline)
	seedIdleTestRun(t, fake, workspace, run, "ready")
	if err := manager.pollAgentHubSessions(context.Background()); err != nil {
		t.Fatal(err)
	}
	var tick resourceMailboxMessage
	waitForRuntimeTest(t, func() bool {
		mailbox, loadErr := loadResourceMailbox(workspace.Path)
		if loadErr != nil {
			return false
		}
		for _, message := range mailbox.Messages {
			if message.ResourceID == app.SchedulerResourceID && message.Type == resourceMessageTypeSchedulerTick &&
				message.Status == resourceMessageDelivered && message.GenerationID == run.GenerationID {
				tick = message
				return true
			}
		}
		return false
	})
	if tick.Role != "system" || tick.SubscribeResult || tick.RequestedMode != resourceMessageModeEnqueue ||
		tick.ActualMode != resourceMessageModeEnqueue || !tick.ModeFrozen {
		t.Fatalf("Scheduler tick mode mapping = %#v", tick)
	}
	current, found, err := currentResourceGeneration(workspace.Path, app.SchedulerResourceID)
	if err != nil || !found || current.Generation != run.Generation || current.GenerationID != tick.GenerationID {
		t.Fatalf("Scheduler did not resume the current generation: current=%#v found=%v tick=%#v err=%v", current, found, tick, err)
	}
	if got := fakeStopCalls(fake); got != 1 {
		t.Fatalf("Scheduler wake duplicated the old generation Stop: %d", got)
	}
}

func TestStoppedCurrentGenerationAfterDaemonRestartResumesOnDemand(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	run := idleTestRun(workspace, "project1.task1", "run-daemon-recovery", "ses-daemon-recovery", time.Date(2026, 8, 1, 0, 30, 0, 0, time.UTC))
	run.Status = "stopped"
	run.IdleSinceAt = ""
	run.IdleDeadlineAt = ""
	run.AgentHubStoppedObserved = true
	seedIdleTestRun(t, fake, workspace, run, "stopped")
	accepted, err := acceptMailboxMessage(workspace.Path, run.ResourceID, resourceMessageRequest{Text: "after daemon recovery", Mode: resourceMessageModeEnqueue})
	if err != nil {
		t.Fatal(err)
	}

	restarted := newAgentManager(manager.server)
	manager.server.agents = restarted
	if err := restarted.reconcileWorkspaceMailboxes(context.Background(), workspace); err != nil {
		t.Fatal(err)
	}
	waitForRuntimeTest(t, func() bool {
		current, found, err := currentResourceGeneration(workspace.Path, run.ResourceID)
		if err != nil || !found || current.GenerationID != run.GenerationID {
			return false
		}
		message, found, loadErr := mailboxMessageByID(workspace.Path, accepted.ID)
		return loadErr == nil && found && message.Status == resourceMessageDelivered && message.GenerationID == run.GenerationID
	})
	fake.mu.Lock()
	resumeCount := len(fake.resumeEnvironments)
	fake.mu.Unlock()
	if resumeCount != 1 {
		t.Fatalf("daemon recovery did not resume exactly once: actions=%#v", fake.actions)
	}
}

func TestStoppedSessionResumeTemporaryFailureRetainsMailboxAndGeneration(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	deadline := time.Date(2026, 8, 1, 0, 30, 0, 0, time.UTC)
	manager.now = func() time.Time { return deadline }
	run := idleTestRun(workspace, "project1.task1", "run-resume-retry", "ses-resume-retry", deadline)
	seedIdleTestRun(t, fake, workspace, run, "ready")
	if err := manager.pollAgentHubSessions(context.Background()); err != nil {
		t.Fatal(err)
	}
	waitForFakeSessionState(t, fake, run.AgentHubSessionID, "stopped")
	waitForIdleGenerationSuspended(t, manager, workspace.Path, run.ID)
	fake.mu.Lock()
	fake.resumeUpdatesAt = true
	fake.failNextResume = true
	fake.resumeBeforeFailure = true
	fake.mu.Unlock()
	message, err := manager.acceptResourceMessage(context.Background(), workspace, run.ResourceID, resourceMessageRequest{Text: "retry me", Mode: resourceMessageModeEnqueue})
	if err != nil {
		t.Fatal(err)
	}
	stored, found, err := mailboxMessageByID(workspace.Path, message.ID)
	if err != nil || !found || stored.Status != resourceMessageQueued || stored.LastErrorCode != "temporarily_undeliverable" {
		t.Fatalf("temporary Resume failure did not retain queued mailbox: found=%v err=%v message=%#v", found, err, stored)
	}
	current, found, err := currentResourceGeneration(workspace.Path, run.ResourceID)
	if err != nil || !found || current.GenerationID != run.GenerationID {
		t.Fatalf("temporary Resume failure replaced current generation: current=%#v found=%v err=%v", current, found, err)
	}
	if err := manager.withResourceController(context.Background(), workspace, run.ResourceID, func() error {
		return manager.reconcileResourceMailboxLocked(context.Background(), workspace, run.ResourceID)
	}); err != nil {
		t.Fatal(err)
	}
	waitForRuntimeTest(t, func() bool {
		updated, found, loadErr := mailboxMessageByID(workspace.Path, message.ID)
		return loadErr == nil && found && updated.Status == resourceMessageDelivered && updated.GenerationID == run.GenerationID
	})
	fake.mu.Lock()
	resumeCount := len(fake.resumeEnvironments)
	fake.mu.Unlock()
	if resumeCount != 1 {
		t.Fatalf("ambiguous Resume was replayed after ready observation: %d attempts", resumeCount)
	}
}

func TestStoppedSessionResumeTerminalFailureReplacesGeneration(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	deadline := time.Date(2026, 8, 1, 0, 30, 0, 0, time.UTC)
	manager.now = func() time.Time { return deadline }
	run := idleTestRun(workspace, "project1.task1", "run-resume-terminal", "ses-resume-terminal", deadline)
	seedIdleTestRun(t, fake, workspace, run, "ready")
	if err := manager.pollAgentHubSessions(context.Background()); err != nil {
		t.Fatal(err)
	}
	waitForFakeSessionState(t, fake, run.AgentHubSessionID, "stopped")
	waitForIdleGenerationSuspended(t, manager, workspace.Path, run.ID)
	fake.mu.Lock()
	fake.failNextResume = true
	fake.resumeErrorStatus = 422
	fake.resumeErrorCode = "provider_resume_unavailable"
	fake.resumeErrorMessage = "provider does not support session resume/load"
	fake.mu.Unlock()
	message, err := manager.acceptResourceMessage(context.Background(), workspace, run.ResourceID, resourceMessageRequest{Text: "replace me", Mode: resourceMessageModeEnqueue})
	if err != nil {
		t.Fatal(err)
	}
	waitForRuntimeTest(t, func() bool {
		current, found, loadErr := currentResourceGeneration(workspace.Path, run.ResourceID)
		if loadErr != nil || !found || current.Generation <= run.Generation {
			return false
		}
		updated, messageFound, messageErr := mailboxMessageByID(workspace.Path, message.ID)
		return messageErr == nil && messageFound && updated.Status == resourceMessageDelivered && updated.GenerationID == current.GenerationID
	})
	if message.GenerationID == run.GenerationID {
		t.Fatalf("terminal Resume failure delivered to the unrecoverable generation: %#v", message)
	}
	waitForFakeSessionState(t, fake, run.AgentHubSessionID, "archived")
}

func TestStoppedSessionMissingRetiresAndReplacesGeneration(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	run := idleTestRun(workspace, "project1.task1", "run-resume-missing", "ses-resume-missing", time.Date(2026, 8, 1, 0, 30, 0, 0, time.UTC))
	run.Status = "stopped"
	run.IdleSinceAt = ""
	run.IdleDeadlineAt = ""
	run.AgentHubStoppedObserved = true
	seedIdleTestRun(t, fake, workspace, run, "stopped")
	message, err := acceptMailboxMessage(workspace.Path, run.ResourceID, resourceMessageRequest{Text: "replace missing", Mode: resourceMessageModeEnqueue})
	if err != nil {
		t.Fatal(err)
	}
	fake.mu.Lock()
	delete(fake.sessions, run.AgentHubSessionID)
	fake.mu.Unlock()
	if err := manager.withResourceController(context.Background(), workspace, run.ResourceID, func() error {
		return manager.reconcileResourceMailboxLocked(context.Background(), workspace, run.ResourceID)
	}); err != nil {
		t.Fatal(err)
	}
	waitForRuntimeTest(t, func() bool {
		current, found, loadErr := currentResourceGeneration(workspace.Path, run.ResourceID)
		if loadErr != nil || !found || current.Generation <= run.Generation {
			return false
		}
		updated, messageFound, messageErr := mailboxMessageByID(workspace.Path, message.ID)
		return messageErr == nil && messageFound && updated.Status == resourceMessageDelivered && updated.GenerationID == current.GenerationID
	})
	fake.mu.Lock()
	resumeAttempts := len(fake.resumeEnvironments)
	fake.mu.Unlock()
	if resumeAttempts != 0 {
		t.Fatalf("missing Session was resumed before replacement: %d attempts", resumeAttempts)
	}
}

func TestStoppedSessionBindingChangeWinsBeforeResume(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	fake.extraAgents = []string{"replacement-agent"}
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	deadline := time.Date(2026, 8, 1, 0, 30, 0, 0, time.UTC)
	manager.now = func() time.Time { return deadline }
	run := idleTestRun(workspace, "project1.task1", "run-resume-binding", "ses-resume-binding", deadline)
	seedIdleTestRun(t, fake, workspace, run, "ready")
	if err := manager.pollAgentHubSessions(context.Background()); err != nil {
		t.Fatal(err)
	}
	waitForIdleGenerationSuspended(t, manager, workspace.Path, run.ID)

	forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		t.Fatal(err)
	}
	binding := app.AgentBinding{Kind: "agent", Name: "replacement-agent"}
	if _, err := forgeWorkspace.SetResourceAgentBinding(run.ResourceID, binding); err != nil {
		t.Fatal(err)
	}
	if err := manager.resourceBindingChanged(context.Background(), workspace, run.ResourceID, binding); err != nil {
		t.Fatal(err)
	}
	message, err := acceptMailboxMessage(workspace.Path, run.ResourceID, resourceMessageRequest{Text: "after binding change", Mode: resourceMessageModeEnqueue})
	if err != nil {
		t.Fatal(err)
	}
	waitForRuntimeTest(t, func() bool {
		current, found, loadErr := currentResourceGeneration(workspace.Path, run.ResourceID)
		if loadErr != nil || !found || current.Generation <= run.Generation {
			return false
		}
		updated, messageFound, messageErr := mailboxMessageByID(workspace.Path, message.ID)
		return messageErr == nil && messageFound && updated.Status == resourceMessageDelivered && updated.GenerationID == current.GenerationID
	})
	fake.mu.Lock()
	resumeAttempts := len(fake.resumeEnvironments)
	fake.mu.Unlock()
	if resumeAttempts != 0 {
		t.Fatalf("binding change resumed the old Session: %d attempts", resumeAttempts)
	}
}

func TestStoppedSessionArchivedRetiresAndReplacesGeneration(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	run := idleTestRun(workspace, "project1.task1", "run-resume-archived", "ses-resume-archived", time.Date(2026, 8, 1, 0, 30, 0, 0, time.UTC))
	run.Status = "idle-suspended"
	run.IdleSleepStopRequested = true
	seedIdleTestRun(t, fake, workspace, run, "archived")
	message, err := acceptMailboxMessage(workspace.Path, run.ResourceID, resourceMessageRequest{Text: "replace archived", Mode: resourceMessageModeEnqueue})
	if err != nil {
		t.Fatal(err)
	}
	if err := manager.withResourceController(context.Background(), workspace, run.ResourceID, func() error {
		return manager.reconcileResourceMailboxLocked(context.Background(), workspace, run.ResourceID)
	}); err != nil {
		t.Fatal(err)
	}
	deadline := time.Now().Add(2 * time.Second)
	for time.Now().Before(deadline) {
		current, found, loadErr := currentResourceGeneration(workspace.Path, run.ResourceID)
		if loadErr == nil && found && current.Generation > run.Generation {
			updated, messageFound, messageErr := mailboxMessageByID(workspace.Path, message.ID)
			if messageErr == nil && messageFound && updated.Status == resourceMessageDelivered && updated.GenerationID == current.GenerationID {
				break
			}
		}
		time.Sleep(10 * time.Millisecond)
	}
	current, currentFound, currentErr := currentResourceGeneration(workspace.Path, run.ResourceID)
	updated, messageFound, messageErr := mailboxMessageByID(workspace.Path, message.ID)
	if !currentFound || currentErr != nil || current.Generation <= run.Generation || !messageFound || messageErr != nil || updated.Status != resourceMessageDelivered || updated.GenerationID != current.GenerationID {
		fake.mu.Lock()
		actions := append([]string(nil), fake.actions...)
		fake.mu.Unlock()
		t.Fatalf("archived Session did not replace: current=%#v found=%v err=%v message=%#v found=%v err=%v actions=%#v", current, currentFound, currentErr, updated, messageFound, messageErr, actions)
	}
	fake.mu.Lock()
	resumeAttempts := len(fake.resumeEnvironments)
	fake.mu.Unlock()
	if resumeAttempts != 0 {
		t.Fatalf("archived Session was resumed before replacement: %d attempts", resumeAttempts)
	}
}
