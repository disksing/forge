package serve

import (
	"context"
	"fmt"
	"strings"
	"time"
)

// resourceGenerationLifecyclePending keeps a generation addressable while a
// durable Stop -> Archive operation is still in flight. In particular, a
// mailbox message accepted after Stop has become irreversible must wait for
// this generation to finish instead of creating a second live generation.
func resourceGenerationLifecyclePending(run agentRun) bool {
	return (run.Status == "stopping" || run.Status == "stopped") &&
		(run.IdleSleepStopRequested || run.ReplacementPending || run.ArchivedTaskStopRequested)
}

func (m *agentManager) resourceIdleSleepAfter() time.Duration {
	if m == nil || m.idleSleepAfter <= 0 {
		return defaultResourceIdleSleepAfter
	}
	return m.idleSleepAfter
}

func (m *agentManager) resourceNow() time.Time {
	if m != nil && m.now != nil {
		return m.now()
	}
	return time.Now()
}

func (m *agentManager) initializeResourceIdleDeadline(run *agentRun, session agentHubSession, boundary time.Time) bool {
	if run == nil || run.IdleSleepStopRequested || strings.TrimSpace(run.IdleDeadlineAt) != "" {
		return false
	}
	if boundary.IsZero() {
		boundary = agentRunTime(session.UpdatedAt)
	}
	if boundary.IsZero() {
		boundary = agentRunTime(session.CreatedAt)
	}
	if boundary.IsZero() {
		boundary = m.resourceNow()
	}
	run.IdleSinceAt = boundary.Format(time.RFC3339Nano)
	run.IdleDeadlineAt = boundary.Add(m.resourceIdleSleepAfter()).Format(time.RFC3339Nano)
	return true
}

// projectResourceIdleState records only stable ready boundaries. The session
// UpdatedAt field is used once for a generation's first ready observation;
// subsequent polling cannot move an existing deadline. A completed Turn uses
// its canonical terminal event time, populated by recordTurnCompletionHistory.
func (m *agentManager) projectResourceIdleState(run *agentRun, session agentHubSession, previousState string, turnFinished bool) {
	if run == nil {
		return
	}
	switch session.State {
	case "running", "waiting_approval", "starting":
		run.IdleSinceAt = ""
		run.IdleDeadlineAt = ""
		// A new active Turn wins a race with a previously requested sleep. It
		// is never interrupted by the automatic sleeper.
		run.IdleSleepStopRequested = false
	case "ready":
		if run.IdleSleepStopRequested || turnFinished || previousState == "running" || previousState == "waiting_approval" {
			if run.IdleSleepStopRequested || run.ArchivedTaskStopRequested {
				run.Status = "stopping"
			}
			return
		}
		boundary := agentRunTime(run.CompletionAt)
		m.initializeResourceIdleDeadline(run, session, boundary)
		run.Status = "idle"
	case "stopping", "stopped", "archived":
		// Keep the durable deadline and Stop guard until Archive has been
		// confirmed. Clearing it earlier would let a message create a new
		// generation while the old Session is still converging.
	}
}

func (m *agentManager) idleDeadlineDue(run agentRun) bool {
	deadline := agentRunTime(run.IdleDeadlineAt)
	return !deadline.IsZero() && !m.resourceNow().Before(deadline)
}

func (m *agentManager) reconcileIdleGeneration(ctx context.Context, workspace guiWorkspace, observed agentRun, observedSession agentHubSession, client *agentHubClient) error {
	return m.withResourceController(ctx, workspace, observed.ResourceID, func() error {
		return m.reconcileIdleGenerationLocked(ctx, workspace, observed, observedSession, client)
	})
}

// reconcileIdleGenerationLocked is called after the normal AgentHub
// projection and under the resource controller. It re-reads the exact
// generation and Session before persisting the Stop guard, so an old poll
// response cannot stop a replacement generation.
func (m *agentManager) reconcileIdleGenerationLocked(ctx context.Context, workspace guiWorkspace, observed agentRun, observedSession agentHubSession, client *agentHubClient) error {
	if strings.TrimSpace(observed.GenerationID) == "" || client == nil {
		return nil
	}
	run, found, err := currentRunByGenerationID(workspace.Path, observed.GenerationID)
	if err != nil || !found || run.ID != observed.ID || run.AgentHubSessionID != observed.AgentHubSessionID {
		return err
	}
	rt := m.ensureRuntime(workspace, run, client)
	rt.mu.Lock()
	stopInFlight := rt.lifecycleStopInFlight
	rt.mu.Unlock()
	if stopInFlight {
		return nil
	}
	if !run.IdleSleepStopRequested && run.CompletionPending {
		// A ready projection immediately after a Turn is not yet a reliable idle
		// boundary. Wait for the canonical terminal event replay to persist its
		// timestamp before starting the 30-minute clock.
		return nil
	}

	// A durable request left by a previous poll/restart must resume the same
	// generation's stop/archive convergence, but never while it has an active
	// Turn or pending approval.
	if run.IdleSleepStopRequested {
		return m.startIdleRetirementLocked(ctx, workspace, run, rt, client)
	}
	if run.ReplacementPending || run.ArchivedTaskStopRequested || run.Status != "idle" || observedSession.State != "ready" {
		return nil
	}

	// A generation created before the idle fields existed gets one stable
	// first-ready boundary. It is persisted before comparing the deadline so
	// an overdue startup recovery converges immediately.
	if strings.TrimSpace(run.IdleDeadlineAt) == "" {
		_, err := rt.mutateRun(func(current *agentRun) {
			m.initializeResourceIdleDeadline(current, observedSession, agentRunTime(current.CompletionAt))
		})
		if err != nil {
			return err
		}
		run = rt.snapshotRun()
	}
	if !m.idleDeadlineDue(run) {
		return nil
	}
	return m.startIdleRetirementLocked(ctx, workspace, run, rt, client)
}

func (m *agentManager) startIdleRetirementLocked(ctx context.Context, workspace guiWorkspace, run agentRun, rt *agentRuntime, client *agentHubClient) error {
	if rt == nil || client == nil || strings.TrimSpace(run.AgentHubSessionID) == "" {
		return nil
	}
	rt.turnActionMu.Lock()
	defer rt.turnActionMu.Unlock()
	latest := rt.snapshotRun()
	if latest.ID != run.ID || latest.GenerationID != run.GenerationID || latest.AgentHubSessionID != run.AgentHubSessionID {
		return nil
	}
	rt.mu.Lock()
	if rt.lifecycleStopInFlight {
		rt.mu.Unlock()
		return nil
	}
	rt.mu.Unlock()

	cfg, _, err := m.agentHubRuntimeConfig()
	if err != nil {
		return err
	}
	session, err := client.GetSession(ctx, latest.AgentHubSessionID)
	if err != nil {
		return fmt.Errorf("inspect idle resource generation: %w", err)
	}
	if !agentHubSessionExactlyMatchesRun(cfg, latest, session) {
		return fmt.Errorf("AgentHub Session %s does not match generation %s", session.ID, latest.GenerationID)
	}
	if session.State == "running" || session.State == "waiting_approval" || len(session.PendingApprovalIDs) > 0 {
		// The exact Session is active again. Clear the sleep request and let the
		// normal projection establish a new ready boundary after this Turn.
		rt.applyAgentHubSessionState(m, session)
		return nil
	}
	if session.State != "ready" && session.State != "stopping" && session.State != "stopped" {
		return nil
	}
	mailbox, err := loadHotResourceMailbox(workspace.Path, latest.ResourceID)
	if err != nil {
		return err
	}
	_, archived, _, err := resourceExistsAndArchived(workspace.Path, latest.ResourceID)
	if err != nil {
		return err
	} else if archived {
		return nil
	}
	lifecyclePlan := PlanGeneration(AdaptLegacyGenerationFacts(LegacyGenerationLifecycleInput{
		Run: latest, Session: &session, Mailbox: mailbox, Now: m.resourceNow(), Revision: latest.UpdatedAt,
	}))
	switch lifecyclePlan.Operation {
	case GenerationOperationNone, GenerationOperationWaitForSession,
		GenerationOperationWaitForMessageReceipt, GenerationOperationWaitForTurnTerminal,
		GenerationOperationDeliverMessage, GenerationOperationInterruptTurn:
		return nil
	}

	started := false
	_, err = rt.mutateRuntime(func(runtime *agentRuntime) {
		if runtime.lifecycleStopInFlight {
			return
		}
		if lifecyclePlan.Operation == GenerationOperationStopSession {
			ApplyLegacyLifecyclePlan(&runtime.run, lifecyclePlan)
		}
		if !runtime.run.IdleSleepStopRequested && lifecyclePlan.Intent == GenerationIntentIdle {
			runtime.run.IdleSleepStopRequested = true
		}
		runtime.run.Status = "stopping"
		runtime.run.UpdatedAt = m.resourceNow().Format(time.RFC3339Nano)
		runtime.lifecycleStopInFlight = true
		started = true
	})
	if err != nil || !started {
		return err
	}
	_ = m.enqueueResourceController(workspace, run.ResourceID, func() error {
		m.retireResourceGenerationLocked(context.WithoutCancel(ctx), rt)
		return nil
	})
	return nil
}
