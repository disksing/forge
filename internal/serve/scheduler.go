package serve

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/disksing/forge/internal/app"
)

const (
	schedulerTickReasonInterval = "interval"
	schedulerTickReasonChanged  = "schedule_changed"
	schedulerTickReasonRecovery = "server_recovery"
)

func schedulerConfigDigest(config app.SchedulerConfig) (string, error) {
	data, err := json.Marshal(config.Schedules)
	if err != nil {
		return "", err
	}
	sum := sha256.Sum256(data)
	return hex.EncodeToString(sum[:]), nil
}

func schedulerTickMessage(reason, messageID string) string {
	return fmt.Sprintf(`Forge Scheduler tick %s (%s).

Read ../AGENTS.md, AGENTS.md, scheduler.json, and scheduler.md. Evaluate every current schedule's natural-language condition using the current environment and durable context. For each condition you judge satisfied, send an ordinary Forge message to its target that includes the schedule id, description, and trigger reason. Messages may repeat. Re-read scheduler.json before acting when practical, and maintain scheduler.md only when durable judgment context is useful.`, messageID, reason)
}

func pendingSchedulerTick(mailbox resourceMailbox) bool {
	for _, message := range mailbox.Messages {
		if message.ResourceID == app.SchedulerResourceID && message.Type == resourceMessageTypeSchedulerTick &&
			(message.Status == resourceMessageQueued || message.Status == resourceMessageDelivering || message.Status == resourceMessageInterrupting) {
			return true
		}
	}
	return false
}

func latestSchedulerTick(mailbox resourceMailbox) (resourceMailboxMessage, bool) {
	var latest resourceMailboxMessage
	found := false
	for _, message := range mailbox.Messages {
		if message.ResourceID != app.SchedulerResourceID || message.Type != resourceMessageTypeSchedulerTick {
			continue
		}
		if !found || message.Sequence > latest.Sequence {
			latest, found = message, true
		}
	}
	return latest, found
}

func cancelPendingSchedulerTicks(workspacePath string) error {
	_, err := mutateResourceMailbox(workspacePath, func(mailbox *resourceMailbox) error {
		now := time.Now().Format(time.RFC3339Nano)
		for index := range mailbox.Messages {
			message := &mailbox.Messages[index]
			if message.ResourceID != app.SchedulerResourceID || message.Type != resourceMessageTypeSchedulerTick || message.Status != resourceMessageQueued {
				continue
			}
			message.Status = resourceMessageUndeliverable
			message.TerminalAt = now
			message.UpdatedAt = now
			message.LastErrorCode = "scheduler_empty"
			message.LastError = "Scheduler tick was cancelled because the schedule list is empty"
		}
		return nil
	})
	return err
}

func schedulerTickTerminal(ctx context.Context, workspacePath string, message resourceMailboxMessage, client *agentHubClient) (agentHubTurn, bool, error) {
	if message.Status == resourceMessageUndeliverable || message.Status == resourceMessageDeliveryUnknown {
		return agentHubTurn{Status: message.Status, Closed: true, EndedAt: message.TerminalAt}, true, nil
	}
	if message.Status != resourceMessageDelivered || strings.TrimSpace(message.GenerationID) == "" {
		return agentHubTurn{}, false, nil
	}
	run, found, err := runByGenerationID(workspacePath, message.GenerationID)
	if err != nil {
		return agentHubTurn{}, false, err
	}
	if !found {
		return agentHubTurn{}, true, nil
	}
	if strings.TrimSpace(message.TurnID) == "" {
		turn, turnFound, turnErr := findSchedulerTickTurn(ctx, client, run.AgentHubSessionID, message)
		if turnErr != nil {
			return agentHubTurn{}, false, turnErr
		}
		if turnFound {
			_, _ = updateMailboxMessage(workspacePath, message.ID, func(current *resourceMailboxMessage) {
				current.TurnID = turn.TurnID
			})
			return turn, turn.Closed, nil
		}
		if !isLiveAgentStatus(run.Status) {
			return agentHubTurn{Status: run.Status, Closed: true, EndedAt: run.UpdatedAt}, true, nil
		}
		return agentHubTurn{}, false, nil
	}
	turn, _, turnErr := client.SessionTurn(ctx, run.AgentHubSessionID, message.TurnID)
	if turnErr == nil {
		return turn, turn.Closed, nil
	}
	if run.CompletionMarker != "" && run.CompletionTurnID == message.TurnID {
		return agentHubTurn{TurnID: message.TurnID, Status: run.CompletionState, Closed: true, EndedAt: run.CompletionAt}, true, nil
	}
	if !isLiveAgentStatus(run.Status) {
		return agentHubTurn{TurnID: message.TurnID, Status: run.Status, Closed: true, EndedAt: run.UpdatedAt}, true, nil
	}
	return agentHubTurn{}, false, turnErr
}

func findSchedulerTickTurn(ctx context.Context, client *agentHubClient, sessionID string, message resourceMailboxMessage) (agentHubTurn, bool, error) {
	page, err := client.SessionTurns(ctx, sessionID, 0, true, 50)
	if err != nil {
		return agentHubTurn{}, false, err
	}
	var best agentHubTurn
	found := false
	for _, turn := range page.Turns {
		matches := false
		for _, item := range turn.Items {
			if item.Role == "system" && strings.TrimSpace(item.Text) == message.Text {
				matches = true
				break
			}
		}
		preview := strings.TrimSpace(turn.TriggerPreview)
		if !matches && turn.TriggerRole == "system" && preview != "" && strings.HasPrefix(message.Text, preview) {
			matches = true
		}
		if matches && (!found || turn.StartEventID > best.StartEventID) {
			best, found = turn, true
		}
	}
	if found && strings.TrimSpace(best.TurnID) == "" {
		best.TurnID = strings.TrimSpace(best.ID)
	}
	return best, found && best.TurnID != "", nil
}

// reconcileSchedulerLocked serializes Scheduler reconciliation with the
// Scheduler resource controller. It converts elapsed Server time and durable
// Scheduler configuration changes into ordinary enqueue-only mailbox
// messages. AgentHub remains the canonical Turn owner.
func (m *agentManager) reconcileSchedulerLocked(ctx context.Context, workspace guiWorkspace, client *agentHubClient) error {
	return m.withResourceController(ctx, workspace, app.SchedulerResourceID, func() error {
		return m.reconcileScheduler(ctx, workspace, client)
	})
}

func (m *agentManager) reconcileScheduler(ctx context.Context, workspace guiWorkspace, client *agentHubClient) error {
	forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		return err
	}
	config, err := forgeWorkspace.Scheduler()
	if err != nil {
		return err
	}
	digest, err := schedulerConfigDigest(config)
	if err != nil {
		return err
	}
	previousDigest, observedBefore := m.schedulerDigests[workspace.Path]
	m.schedulerDigests[workspace.Path] = digest
	if err := migrateLegacyResourceMailbox(workspace.Path); err != nil {
		return err
	}
	if len(config.Schedules) == 0 {
		return cancelPendingSchedulerTicks(workspace.Path)
	}
	mailbox, err := loadResourceMailbox(workspace.Path)
	if err != nil {
		return err
	}
	if pendingSchedulerTick(mailbox) {
		return nil
	}
	last, found := latestSchedulerTick(mailbox)
	reason, basis := "", ""
	if !found {
		if observedBefore && previousDigest != digest {
			reason = schedulerTickReasonChanged
		} else {
			reason = schedulerTickReasonRecovery
		}
		basis = digest
	} else if last.Causation == nil || last.Causation.ScheduleDigest != digest {
		reason, basis = schedulerTickReasonChanged, last.ID
	} else {
		turn, terminal, terminalErr := schedulerTickTerminal(ctx, workspace.Path, last, client)
		if terminalErr != nil {
			return terminalErr
		}
		if !terminal {
			return nil
		}
		basis = last.ID
		if strings.TrimSpace(turn.Status) != "completed" {
			reason = schedulerTickReasonRecovery
		} else {
			terminalAt := strings.TrimSpace(turn.EndedAt)
			if terminalAt == "" {
				terminalAt = strings.TrimSpace(turn.CompletedAt)
			}
			endedAt, parseErr := time.Parse(time.RFC3339Nano, terminalAt)
			if parseErr != nil {
				return fmt.Errorf("Scheduler tick %s has invalid terminal time: %w", last.ID, parseErr)
			}
			if m.now().Before(endedAt.Add(time.Duration(config.WakeIntervalMinutes) * time.Minute)) {
				return nil
			}
			reason = schedulerTickReasonInterval
		}
	}
	instanceID, err := workspaceInstanceID(workspace.Path)
	if err != nil {
		return err
	}
	messageID := notificationMessageID(resourceMessageTypeSchedulerTick, instanceID, reason, digest, basis)
	message := resourceMailboxMessage{
		ID:         messageID,
		ResourceID: app.SchedulerResourceID, Text: schedulerTickMessage(reason, messageID),
		Type: resourceMessageTypeSchedulerTick,
		Causation: &resourceMessageCausation{
			Type: resourceMessageTypeSchedulerTick, SourceWorkspaceInstanceID: instanceID,
			SourceResourceID: app.SchedulerResourceID, Reason: reason, ScheduleDigest: digest,
		},
	}
	accepted, err := acceptGeneratedMailboxMessage(workspace.Path, message)
	if err != nil {
		return err
	}
	if accepted.Status == resourceMessageQueued || accepted.Status == resourceMessageDelivering || accepted.Status == resourceMessageInterrupting {
		if err := m.reconcileResourceMailboxLocked(ctx, workspace, app.SchedulerResourceID); err != nil {
			recordMailboxFailure(workspace.Path, accepted.ID, err)
			return err
		}
	}
	return nil
}
