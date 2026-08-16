package serve

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/disksing/pua/internal/app"
)

const (
	generationPolicyRetireReason = "turn_limit"
	generationUsagePageSize      = 500
)

type generationUsage struct {
	CompletedTurns int
	TurnDurationMS int64
	LatestEventID  int64
}

func generationPolicyReached(policy app.GenerationPolicy, usage generationUsage) bool {
	if !policy.Enabled {
		return false
	}
	if policy.MaxTurns > 0 && usage.CompletedTurns >= policy.MaxTurns {
		return true
	}
	return policy.MaxAccumulatedTurnMinutes > 0 &&
		usage.TurnDurationMS >= int64(policy.MaxAccumulatedTurnMinutes)*int64(time.Minute/time.Millisecond)
}

func generationUsageFromTurns(turns []agentHubTurn) generationUsage {
	usage := generationUsage{}
	seen := make(map[string]struct{}, len(turns))
	for _, turn := range turns {
		turnID := strings.TrimSpace(turn.TurnID)
		if turnID == "" {
			turnID = strings.TrimSpace(turn.ID)
		}
		if turnID == "" {
			continue
		}
		if _, exists := seen[turnID]; exists {
			continue
		}
		seen[turnID] = struct{}{}
		if !turn.Closed || !generationBudgetTerminalStatus(turn.Status) {
			continue
		}
		usage.CompletedTurns++
		duration := turn.DurationMS
		if duration <= 0 {
			started := generationTime(turn.StartedAt)
			ended := generationTime(firstNonEmpty(turn.EndedAt, turn.CompletedAt))
			if !started.IsZero() && ended.After(started) {
				duration = ended.Sub(started).Milliseconds()
			}
		}
		if duration > 0 {
			usage.TurnDurationMS += duration
		}
	}
	return usage
}

func generationBudgetTerminalStatus(status string) bool {
	switch strings.ToLower(strings.TrimSpace(status)) {
	case "completed", "failed", "cancelled", "canceled":
		return true
	default:
		return false
	}
}

func fetchGenerationUsage(ctx context.Context, client *agentHubClient, sessionID string) (generationUsage, error) {
	if client == nil || strings.TrimSpace(sessionID) == "" {
		return generationUsage{}, errors.New("generation usage requires an AgentHub Session")
	}
	before := int64(0)
	latest := true
	turns := make([]agentHubTurn, 0)
	latestEventID := int64(0)
	for {
		page, err := client.SessionTurns(ctx, sessionID, before, latest, generationUsagePageSize)
		if err != nil {
			return generationUsage{}, err
		}
		turns = append(turns, page.Turns...)
		if page.LatestEventID > latestEventID {
			latestEventID = page.LatestEventID
		}
		if !page.Page.HasMoreBefore {
			break
		}
		if page.Page.NextBefore <= 0 || page.Page.NextBefore == before {
			return generationUsage{}, errors.New("AgentHub Turn pagination did not advance")
		}
		before = page.Page.NextBefore
		latest = false
	}
	usage := generationUsageFromTurns(turns)
	usage.LatestEventID = latestEventID
	return usage, nil
}

// reconcileGenerationPolicyLocked runs at a stable ready/stopped boundary
// while the caller owns the resource controller. Keeping the one-time Turn
// projection and any resulting lifecycle intent in that serialized pass
// prevents a delayed background scan from racing Workspace shutdown.
func (m *agentManager) reconcileGenerationPolicyLocked(ctx context.Context, workspace serveWorkspace, generationID string, observedSession agentHubSession, rt *agentRuntime, client *agentHubClient, policy app.GenerationPolicy) error {
	if m == nil || client == nil || !policy.Enabled || (observedSession.State != "ready" && observedSession.State != "stopped") {
		return nil
	}
	record := rt.snapshotGeneration()
	if record.Retired || record.GenerationID != generationID || record.AgentHubSessionID != observedSession.ID ||
		record.ReplacementPending || record.ArchivedTaskStopRequested {
		return nil
	}
	usage := generationUsage{
		CompletedTurns: record.GenerationCompletedTurns,
		TurnDurationMS: record.GenerationTurnDurationMS,
		LatestEventID:  record.GenerationUsageEventID,
	}
	if !record.GenerationUsageReady || record.GenerationUsageEventID < observedSession.LastEventID {
		var err error
		usage, err = fetchGenerationUsage(ctx, client, record.AgentHubSessionID)
		if err != nil {
			return fmt.Errorf("inspect generation Turn usage: %w", err)
		}
		if usage.LatestEventID < observedSession.LastEventID {
			return fmt.Errorf("AgentHub Turn projection cursor %d trails Session cursor %d", usage.LatestEventID, observedSession.LastEventID)
		}
		updated, persistErr := rt.mutateGeneration(func(current *generationRecord) {
			if current.GenerationID != generationID || current.AgentHubSessionID != observedSession.ID || current.Retired {
				return
			}
			current.GenerationCompletedTurns = usage.CompletedTurns
			current.GenerationTurnDurationMS = usage.TurnDurationMS
			current.GenerationUsageEventID = usage.LatestEventID
			current.GenerationUsageReady = true
		})
		if persistErr != nil {
			return fmt.Errorf("persist generation Turn usage: %w", persistErr)
		}
		if updated.GenerationID != generationID || updated.AgentHubSessionID != observedSession.ID {
			return nil
		}
	}
	if !generationPolicyReached(policy, usage) {
		return nil
	}
	return m.startGenerationPolicyReplacementLocked(context.WithoutCancel(ctx), workspace, generationID, rt, client)
}

func (m *agentManager) startGenerationPolicyReplacementLocked(ctx context.Context, workspace serveWorkspace, generationID string, rt *agentRuntime, client *agentHubClient) error {
	puaWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		return err
	}
	runtimeConfig, err := puaWorkspace.RuntimeConfig()
	if err != nil || !runtimeConfig.GenerationPolicy.Enabled {
		return err
	}
	record, found, err := currentResourceGeneration(workspace.Path, rt.snapshotGeneration().ResourceID)
	if err != nil || !found || record.GenerationID != generationID || record.Retired || record.ReplacementPending || record.ArchivedTaskStopRequested {
		return err
	}
	usage := generationUsage{CompletedTurns: record.GenerationCompletedTurns, TurnDurationMS: record.GenerationTurnDurationMS}
	if !record.GenerationUsageReady || !generationPolicyReached(runtimeConfig.GenerationPolicy, usage) {
		return nil
	}
	session, err := client.GetSession(ctx, record.AgentHubSessionID)
	if err != nil {
		return fmt.Errorf("inspect generation before policy rotation: %w", err)
	}
	cfg, _, err := m.agentHubRuntimeConfig()
	if err != nil {
		return err
	}
	if !agentHubSessionExactlyMatchesGeneration(cfg, record, session) {
		return fmt.Errorf("AgentHub Session %s does not match generation %s", session.ID, generationID)
	}
	if session.State == "running" || session.State == "waiting_approval" || len(session.PendingApprovalIDs) > 0 {
		return nil
	}
	if session.State != "ready" && session.State != "stopped" && session.State != "stopping" && session.State != "archived" {
		return nil
	}
	updated, err := rt.mutateGeneration(func(current *generationRecord) {
		if current.GenerationID != generationID || current.AgentHubSessionID != record.AgentHubSessionID || current.Retired {
			return
		}
		current.ReplacementPending = true
		current.ManualStopRequested = false
		current.RetireReason = generationPolicyRetireReason
		current.IdleSleepStopRequested = false
		current.ResumeFailureCount = 0
		current.ResumeRetryAt = ""
		current.ResumeLastError = ""
		current.UpdatedAt = m.resourceNow().Format(time.RFC3339Nano)
	})
	if err != nil || updated.GenerationID != generationID || !updated.ReplacementPending {
		return err
	}
	m.retireResourceGenerationLocked(ctx, rt)
	return nil
}
