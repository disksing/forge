package serve

import (
	"context"
	"fmt"
	"strings"
	"time"
)

// resourceGenerationLifecyclePending keeps a generation addressable while a
// replacement/archive Stop -> Archive operation is still in flight. Idle
// sleep is intentionally absent: its stopped Session remains the current
// generation and is the target of a later on-demand Resume.
func resourceGenerationLifecyclePending(record generationRecord) bool {
	return (record.Status == "stopping" || record.Status == "stopped") &&
		(record.ReplacementPending || record.ArchivedTaskStopRequested)
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

func (m *agentManager) initializeResourceIdleDeadline(record *generationRecord, session agentHubSession, boundary time.Time) bool {
	if record == nil || record.IdleSleepStopRequested || strings.TrimSpace(record.IdleDeadlineAt) != "" {
		return false
	}
	if boundary.IsZero() {
		boundary = generationTime(session.UpdatedAt)
	}
	if boundary.IsZero() {
		boundary = generationTime(session.CreatedAt)
	}
	if boundary.IsZero() {
		boundary = m.resourceNow()
	}
	record.IdleSinceAt = boundary.Format(time.RFC3339Nano)
	record.IdleDeadlineAt = boundary.Add(m.resourceIdleSleepAfter()).Format(time.RFC3339Nano)
	return true
}

// projectResourceIdleState records only stable ready boundaries. The session
// UpdatedAt field is used once for a generation's first ready observation;
// subsequent polling cannot move an existing deadline. A completed Turn uses
// its canonical terminal event time, populated by recordTurnCompletionHistory.
func (m *agentManager) projectResourceIdleState(record *generationRecord, session agentHubSession, previousState string, turnFinished bool) {
	if record == nil {
		return
	}
	resuming := record.LifecycleReceipt != nil && record.LifecycleReceipt.Operation == GenerationOperationResumeSession &&
		record.LifecycleReceipt.State != GenerationReceiptTerminal
	switch session.State {
	case "running", "waiting_approval":
		record.IdleSinceAt = ""
		record.IdleDeadlineAt = ""
		// A new active Turn wins a race with a previously requested sleep. It
		// is never interrupted by the automatic sleeper.
		record.IdleSleepStopRequested = false
	case "starting":
		record.IdleSinceAt = ""
		record.IdleDeadlineAt = ""
		// Keep the idle marker until Resume reaches a ready/active boundary. A
		// restart during starting must still describe this same sleeping
		// generation rather than making it eligible for archival.
		if !resuming {
			record.IdleSleepStopRequested = false
		}
	case "ready":
		if resuming && record.IdleSleepStopRequested {
			record.IdleSleepStopRequested = false
		}
		if record.IdleSleepStopRequested || turnFinished || previousState == "running" || previousState == "waiting_approval" {
			if record.IdleSleepStopRequested || record.ArchivedTaskStopRequested {
				record.Status = "stopping"
			}
			return
		}
		boundary := generationTime(record.CompletionAt)
		m.initializeResourceIdleDeadline(record, session, boundary)
		record.Status = "idle"
	case "stopping":
		// Keep the durable Stop receipt while the idle Session converges.
	case "stopped":
		if record.IdleSleepStopRequested && !record.ReplacementPending && !record.ArchivedTaskStopRequested {
			record.Status = "idle-suspended"
		}
	case "archived":
		// Archived is terminal; the lifecycle planner retires it and never
		// attempts to Resume the old Session.
	}
}

func (m *agentManager) idleDeadlineDue(record generationRecord) bool {
	deadline := generationTime(record.IdleDeadlineAt)
	return !deadline.IsZero() && !m.resourceNow().Before(deadline)
}

func (m *agentManager) reconcileIdleGeneration(ctx context.Context, workspace serveWorkspace, observed generationRecord, observedSession agentHubSession, client *agentHubClient) error {
	return m.withResourceController(ctx, workspace, observed.ResourceID, func() error {
		return m.reconcileIdleGenerationLocked(ctx, workspace, observed, observedSession, client)
	})
}

// reconcileIdleGenerationLocked is called after the normal AgentHub
// projection and under the resource controller. It re-reads the exact
// generation and Session before persisting the Stop guard, so an old poll
// response cannot stop a replacement generation.
func (m *agentManager) reconcileIdleGenerationLocked(ctx context.Context, workspace serveWorkspace, observed generationRecord, observedSession agentHubSession, client *agentHubClient) error {
	if strings.TrimSpace(observed.GenerationID) == "" || client == nil {
		return nil
	}
	record, found, err := currentGenerationRecordByID(workspace.Path, observed.GenerationID)
	if err != nil || !found || record.ID != observed.ID || record.AgentHubSessionID != observed.AgentHubSessionID {
		return err
	}
	rt := m.ensureRuntime(workspace, record, client)
	rt.mu.Lock()
	stopInFlight := rt.lifecycleStopInFlight
	rt.mu.Unlock()
	if stopInFlight {
		return nil
	}
	if !record.IdleSleepStopRequested && record.CompletionPending {
		// A ready projection immediately after a Turn is not yet a reliable idle
		// boundary. Wait for the canonical terminal event replay to persist its
		// timestamp before starting the 30-minute clock.
		return nil
	}

	// A durable request left by a previous poll/restart must resume the same
	// generation's stop/archive convergence, but never while it has an active
	// Turn or pending approval.
	if record.IdleSleepStopRequested {
		return m.startIdleRetirementLocked(ctx, workspace, record, rt, client)
	}
	if record.ReplacementPending || record.ArchivedTaskStopRequested || record.Status != "idle" || observedSession.State != "ready" {
		return nil
	}

	// A generation created before the idle fields existed gets one stable
	// first-ready boundary. It is persisted before comparing the deadline so
	// an overdue startup recovery converges immediately.
	if strings.TrimSpace(record.IdleDeadlineAt) == "" {
		_, err := rt.mutateGeneration(func(current *generationRecord) {
			m.initializeResourceIdleDeadline(current, observedSession, generationTime(current.CompletionAt))
		})
		if err != nil {
			return err
		}
		record = rt.snapshotGeneration()
	}
	if !m.idleDeadlineDue(record) {
		return nil
	}
	return m.startIdleRetirementLocked(ctx, workspace, record, rt, client)
}

func (m *agentManager) startIdleRetirementLocked(ctx context.Context, workspace serveWorkspace, record generationRecord, rt *agentRuntime, client *agentHubClient) error {
	if rt == nil || client == nil || strings.TrimSpace(record.AgentHubSessionID) == "" {
		return nil
	}
	rt.turnActionMu.Lock()
	defer rt.turnActionMu.Unlock()
	latest := rt.snapshotGeneration()
	if latest.ID != record.ID || latest.GenerationID != record.GenerationID || latest.AgentHubSessionID != record.AgentHubSessionID {
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
	if !agentHubSessionExactlyMatchesGeneration(cfg, latest, session) {
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
		Generation: latest, Session: &session, Mailbox: mailbox, Now: m.resourceNow(), Revision: latest.UpdatedAt,
	}))
	switch lifecyclePlan.Operation {
	case GenerationOperationNone, GenerationOperationWaitForSession,
		GenerationOperationWaitForMessageReceipt, GenerationOperationWaitForTurnTerminal,
		GenerationOperationDeliverMessage, GenerationOperationInterruptTurn,
		GenerationOperationResumeSession:
		return nil
	}

	started := false
	_, err = rt.mutateRuntime(func(runtime *agentRuntime) {
		if runtime.lifecycleStopInFlight {
			return
		}
		if lifecyclePlan.Operation == GenerationOperationStopSession {
			ApplyLegacyLifecyclePlan(&runtime.record, lifecyclePlan)
		}
		if !runtime.record.IdleSleepStopRequested && lifecyclePlan.Intent == GenerationIntentIdle {
			runtime.record.IdleSleepStopRequested = true
		}
		runtime.record.Status = "stopping"
		runtime.record.UpdatedAt = m.resourceNow().Format(time.RFC3339Nano)
		runtime.lifecycleStopInFlight = true
		started = true
	})
	if err != nil || !started {
		return err
	}
	_ = m.enqueueResourceController(workspace, record.ResourceID, func() error {
		m.retireResourceGenerationLocked(context.WithoutCancel(ctx), rt)
		return nil
	})
	return nil
}
