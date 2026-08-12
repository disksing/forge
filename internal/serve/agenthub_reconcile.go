package serve

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"
)

// This file owns the forge serve side of AgentHub session reconciliation for
// the one case the session poller cannot see in a live list: archived
// sessions. The plain Forge CLI never probes AgentHub, so serve is the only
// owner that releases a transient Forge session for an AgentHub-managed run.
// Release requires either a locally observed durable
// stopped edge or a continuous durable event history proving the archived
// session passed through stopped. Every doubt stays fail closed.

// permanentArchivedProofError marks archived-after-stopped proof failures
// that cannot heal on their own because archived event history is immutable
// (cursor gaps, undecodable events, sessions rejected with a 4xx). Transport
// and 5xx failures stay retryable.
type permanentArchivedProofError struct{ err error }

func (e *permanentArchivedProofError) Error() string { return e.err.Error() }
func (e *permanentArchivedProofError) Unwrap() error { return e.err }

// proveAgentHubArchivedAfterStopped replays the complete durable event
// history of an AgentHub session and reports whether the session provably
// passed through a durable stopped state. Any cursor gap, undecodable event,
// or replay that cannot reach the latest cursor is a permanent failure:
// archived history is immutable, so retrying cannot change the outcome.
func proveAgentHubArchivedAfterStopped(ctx context.Context, client *agentHubClient, sessionID string) (bool, []agentHubEvent, int64, error) {
	cursor := int64(0)
	sawStopped := false
	history := make([]agentHubEvent, 0)
	for {
		events, latestCursor, err := client.SessionEvents(ctx, sessionID, cursor, 500)
		if err != nil {
			var apiErr *agentHubAPIError
			if errors.As(err, &apiErr) && apiErr.StatusCode >= 400 && apiErr.StatusCode < 500 {
				return false, nil, cursor, &permanentArchivedProofError{err}
			}
			return false, nil, cursor, err
		}
		progressed := false
		for _, event := range events {
			if event.ID <= cursor {
				continue
			}
			if event.ID != cursor+1 {
				return false, nil, cursor, &permanentArchivedProofError{
					fmt.Errorf("cursor gap: expected event %d, got %d", cursor+1, event.ID),
				}
			}
			cursor = event.ID
			progressed = true
			history = append(history, event)
			if event.Type != "session.state" {
				continue
			}
			var data struct {
				State string `json:"state"`
			}
			if err := json.Unmarshal(event.Data, &data); err != nil {
				return false, nil, cursor, &permanentArchivedProofError{
					fmt.Errorf("decode session.state event %d: %w", event.ID, err),
				}
			}
			if data.State == "stopped" {
				sawStopped = true
			}
		}
		if cursor >= latestCursor {
			return sawStopped, history, cursor, nil
		}
		if !progressed {
			return false, nil, cursor, &permanentArchivedProofError{
				fmt.Errorf("event replay stalled at cursor %d before latest cursor %d", cursor, latestCursor),
			}
		}
	}
}

// agentHubSourceConflicts reports whether a session fetched by id belongs to
// a different Forge source than the persisted run. A conflict means the
// AgentHub session id no longer identifies this run's session, so no state
// from it may drive terminal reconciliation.
func agentHubSourceConflicts(cfg config, run agentRun, session agentHubSession) bool {
	externalID := strings.TrimSpace(run.SourceExternalID)
	if externalID == "" || session.Source == nil {
		return false
	}
	return session.Source.App != agentHubSourceApp ||
		session.Source.InstanceID != runSourceInstanceID(cfg, run) ||
		session.Source.ExternalID != externalID
}

// reconcileArchivedAgentHubSession resolves a run whose AgentHub session is
// archived. The Forge session is released only when a durable stopped edge
// was already observed locally or the archived event history continuously
// proves the session passed through stopped; in both cases the release is
// idempotent. Every other outcome keeps the run in recovering, retains the
// transient Forge session record, and publishes a diagnostic notice.
func (rt *agentRuntime) reconcileArchivedAgentHubSession(m *agentManager, client *agentHubClient, session agentHubSession) {
	rt.mu.Lock()
	run := rt.run
	proofFailed := rt.archivedProofFailed
	rt.mu.Unlock()

	if run.AgentHubStoppedObserved {
		// The durable stopped edge was observed before the archive, so the
		// transient Forge session may be released without proving it again.
		// Completion history still needs to be reconciled because a transient
		// event read may have happened after the stopped projection was saved.
		_, _ = rt.mutateRun(func(run *agentRun) {
			if run.Status != "stopped" {
				run.Status = "stopped"
				run.UpdatedAt = time.Now().Format(time.RFC3339)
			}
		})
		if run.CompletionPending {
			rt.recordTurnCompletion(session)
		}
		rt.releaseForgeSessionAfterStopped(m)
		return
	}

	if proofFailed {
		// The archived history is immutable; a recorded permanent proof
		// failure must not be retried on every poll or recovery pass.
		return
	}
	proven, history, latestCursor, err := proveAgentHubArchivedAfterStopped(context.Background(), client, session.ID)
	if err != nil {
		var permanent *permanentArchivedProofError
		if errors.As(err, &permanent) {
			rt.mu.Lock()
			rt.archivedProofFailed = true
			rt.mu.Unlock()
		}
		rt.setRecoveryError(m, fmt.Errorf("cannot prove archived AgentHub session %s passed through durable stopped: %v; transient Forge session retained", session.ID, err))
		return
	}
	if !proven {
		rt.mu.Lock()
		rt.archivedProofFailed = true
		rt.mu.Unlock()
		rt.setRecoveryError(m, fmt.Errorf("archived AgentHub session %s has no continuous durable stopped history; transient Forge session retained", session.ID))
		return
	}

	_, _ = rt.mutateRuntime(func(runtime *agentRuntime) {
		runtime.run.AgentHubStoppedObserved = true
		runtime.run.Status = "stopped"
		runtime.run.UpdatedAt = time.Now().Format(time.RFC3339)
		runtime.agentHubState = session.State
	})
	// The archived projection is the recovery equivalent of the observed
	// ready/stopped edge. Inspect the durable terminal event before releasing
	// the Forge session.
	rt.prepareTurnCompletion(session)
	rt.recordTurnCompletionHistory(session, history, latestCursor)
	rt.releaseForgeSessionAfterStopped(m)
}
