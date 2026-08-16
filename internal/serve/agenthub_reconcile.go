package serve

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"
)

// This file owns the pua serve side of AgentHub session reconciliation for
// the one case the session poller cannot see in a live list: archived
// sessions. Retirement requires either a locally observed durable stopped
// edge or a continuous durable event history proving the archived session
// passed through stopped. Every doubt stays fail closed.

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
// a different PUA source than the persisted generation. A conflict means the
// AgentHub session id no longer identifies this generation's session, so no
// state from it may drive terminal reconciliation.
func agentHubSourceConflicts(cfg config, record generationRecord, session agentHubSession) bool {
	externalID := strings.TrimSpace(record.SourceExternalID)
	if externalID == "" || session.Source == nil {
		return false
	}
	return session.Source.App != agentHubSourceApp ||
		session.Source.InstanceID != generationSourceInstanceID(cfg, record) ||
		session.Source.ExternalID != externalID
}

// reconcileArchivedAgentHubSession resolves a generation whose AgentHub
// session is archived. The generation is retired only when a durable stopped
// edge was already observed locally or archived event history continuously
// proves the session passed through stopped. Every other outcome keeps the
// generation in recovering and publishes a diagnostic notice.
func (rt *agentRuntime) reconcileArchivedAgentHubSession(m *agentManager, client *agentHubClient, session agentHubSession) {
	rt.mu.Lock()
	record := rt.record
	proofFailed := rt.archivedProofFailed
	rt.mu.Unlock()

	if record.AgentHubStoppedObserved {
		// The durable stopped edge was observed before the archive, so the
		// generation may be retired without proving it again.
		// Completion history still needs to be reconciled because a transient
		// event read may have happened after the stopped projection was saved.
		_, _ = rt.mutateGeneration(func(record *generationRecord) {
			if record.Status != "stopped" {
				record.Status = "stopped"
				record.UpdatedAt = time.Now().Format(time.RFC3339)
			}
			record.IdleSleepStopRequested = false
		})
		if record.CompletionPending {
			rt.recordTurnCompletion(session)
		}
		if err := retireStoredGeneration(rt, rt.snapshotGeneration(), "agenthub_archived"); err != nil {
			rt.addPUANotice(m, "warning", "generation/retire", "Persist archived generation manifest: "+err.Error())
		}
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
		rt.setRecoveryError(m, fmt.Errorf("cannot prove archived AgentHub session %s passed through durable stopped: %v; generation retained", session.ID, err))
		return
	}
	if !proven {
		rt.mu.Lock()
		rt.archivedProofFailed = true
		rt.mu.Unlock()
		rt.setRecoveryError(m, fmt.Errorf("archived AgentHub session %s has no continuous durable stopped history; generation retained", session.ID))
		return
	}

	_, _ = rt.mutateRuntime(func(runtime *agentRuntime) {
		runtime.record.AgentHubStoppedObserved = true
		runtime.record.Status = "stopped"
		runtime.record.IdleSleepStopRequested = false
		runtime.record.UpdatedAt = time.Now().Format(time.RFC3339)
		runtime.agentHubState = session.State
	})
	// The archived projection is the recovery equivalent of the observed
	// ready/stopped edge. Inspect the durable terminal event before retiring the
	// generation.
	rt.prepareTurnCompletion(session)
	rt.recordTurnCompletionHistory(session, history, latestCursor)
	if err := retireStoredGeneration(rt, rt.snapshotGeneration(), "agenthub_archived"); err != nil {
		rt.addPUANotice(m, "warning", "generation/retire", "Persist archived generation manifest: "+err.Error())
	}
}
