package serve

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"sort"
	"strings"
	"time"

	"github.com/disksing/forge/internal/app"
)

func notificationMessageID(parts ...string) string {
	sum := sha256.Sum256([]byte(strings.Join(parts, "\x00")))
	return "msg-notify-" + hex.EncodeToString(sum[:16])
}

func workspaceInstanceID(workspacePath string) (string, error) {
	forgeWorkspace, err := app.OpenWorkspace(workspacePath)
	if err != nil {
		return "", err
	}
	runtime, err := forgeWorkspace.RuntimeConfig()
	if err != nil {
		return "", err
	}
	return strings.TrimSpace(runtime.InstanceID), nil
}

func (m *agentManager) managedWorkspaceByInstanceID(instanceID string) (guiWorkspace, bool, error) {
	instanceID = strings.TrimSpace(instanceID)
	if instanceID == "" {
		return guiWorkspace{}, false, nil
	}
	cfg, err := m.server.loadConfig()
	if err != nil {
		return guiWorkspace{}, false, err
	}
	for _, workspace := range cfg.Workspaces {
		if !m.server.ownsWorkspace(workspace.Path) {
			continue
		}
		current, readErr := workspaceInstanceID(workspace.Path)
		if readErr != nil {
			continue
		}
		if current == instanceID {
			return workspace, true, nil
		}
	}
	return guiWorkspace{}, false, nil
}

func notificationTrigger(mailbox resourceMailbox, message resourceMailboxMessage) bool {
	for _, candidate := range mailbox.Messages {
		if candidate.GenerationID == message.GenerationID && candidate.TurnID == message.TurnID &&
			candidate.Status == resourceMessageDelivered && candidate.Sequence < message.Sequence {
			return false
		}
	}
	return true
}

func lastAssistantText(turn agentHubTurn) string {
	for index := len(turn.Items) - 1; index >= 0; index-- {
		item := turn.Items[index]
		if item.Role == "assistant" && strings.TrimSpace(item.Text) != "" {
			return strings.TrimSpace(item.Text)
		}
	}
	return ""
}

func creatorCallbackMessage(resourceID string, turn agentHubTurn, reference string, historyUnavailable bool) string {
	status := strings.TrimSpace(turn.Status)
	if status == "" {
		status = "unknown"
	}
	var builder strings.Builder
	fmt.Fprintf(&builder, "Creator callback for `%s`: Turn `%s` ended with status `%s`.", resourceID, turn.TurnID, status)
	if reference != "" {
		fmt.Fprintf(&builder, "\n\nTurn reference: `%s`", reference)
	}
	if reply := lastAssistantText(turn); reply != "" {
		fmt.Fprintf(&builder, "\n\nFinal assistant response:\n\n%s", reply)
	} else if historyUnavailable {
		builder.WriteString("\n\nThe terminal result was recorded, but the canonical Turn history is unavailable; no Turn reference was manufactured.")
	} else {
		builder.WriteString("\n\nThe Turn produced no final assistant text.")
	}
	return builder.String()
}

func terminalDeliveryMessage(message resourceMailboxMessage) string {
	status := publicResourceMessageStatus(message.Status)
	code := strings.TrimSpace(message.LastErrorCode)
	if code == "" {
		code = "delivery_failed"
	}
	text := fmt.Sprintf("Delivery notice for message `%s` to `%s`: status `%s` (%s).", message.ID, message.ResourceID, status, code)
	if detail := strings.TrimSpace(message.LastError); detail != "" {
		text += "\n\n" + detail
	}
	return text
}

func ensureNotificationReceipt(workspacePath, messageID, notificationType, targetInstanceID, targetResourceID, receiptID string) (resourceMailboxMessage, error) {
	return updateMailboxMessage(workspacePath, messageID, func(message *resourceMailboxMessage) {
		if message.Notification != nil {
			return
		}
		now := time.Now().Format(time.RFC3339Nano)
		message.Notification = &resourceNotificationReceipt{
			ID: receiptID, Type: notificationType, Status: resourceNotificationWaiting,
			TargetWorkspaceInstanceID: targetInstanceID, TargetResourceID: targetResourceID,
			CreatedAt: now, UpdatedAt: now,
		}
	})
}

func updateNotificationReceipt(workspacePath, sourceMessageID string, mutate func(*resourceNotificationReceipt)) error {
	_, err := updateMailboxMessage(workspacePath, sourceMessageID, func(message *resourceMailboxMessage) {
		if message.Notification == nil {
			return
		}
		mutate(message.Notification)
		message.Notification.UpdatedAt = time.Now().Format(time.RFC3339Nano)
	})
	return err
}

func terminalNotificationReceipt(workspacePath, sourceMessageID, code, detail string) error {
	return updateNotificationReceipt(workspacePath, sourceMessageID, func(receipt *resourceNotificationReceipt) {
		receipt.Status = resourceNotificationTerminal
		receipt.LastErrorCode = code
		receipt.LastError = detail
	})
}

func mirrorNotificationDelivery(receipt *resourceNotificationReceipt, message resourceMailboxMessage) {
	receipt.DeliveryStatus = publicResourceMessageStatus(message.Status)
	receipt.DeliveredAt = message.DeliveredAt
	receipt.TerminalAt = message.TerminalAt
	receipt.LastError = message.LastError
	receipt.LastErrorCode = message.LastErrorCode
	switch message.Status {
	case resourceMessageDelivered:
		receipt.Status = resourceNotificationDelivered
	case resourceMessageUndeliverable, resourceMessageDeliveryUnknown:
		receipt.Status = resourceNotificationTerminal
	}
}

func (m *agentManager) routeNotification(ctx context.Context, source guiWorkspace, sourceMessage resourceMailboxMessage, generated resourceMailboxMessage) error {
	receipt := sourceMessage.Notification
	if receipt == nil || receipt.Status == resourceNotificationTerminal || receipt.Status == resourceNotificationDelivered {
		return nil
	}
	target, found, err := m.managedWorkspaceByInstanceID(receipt.TargetWorkspaceInstanceID)
	if err != nil {
		return err
	}
	if !found {
		if receipt.Status == resourceNotificationAccepted {
			return updateNotificationReceipt(source.Path, sourceMessage.ID, func(current *resourceNotificationReceipt) {
				current.LastErrorCode = "target_workspace_unavailable"
				current.LastError = "the target Workspace is no longer registered with and owned by this Forge Server; prior mailbox acceptance is retained"
			})
		}
		return terminalNotificationReceipt(source.Path, sourceMessage.ID, "target_workspace_unavailable", "the target Workspace is not registered with and owned by this Forge Server")
	}
	targetResourceID := normalizedResourceID(receipt.TargetResourceID)
	if receipt.Status == resourceNotificationAccepted {
		var latest resourceMailboxMessage
		var messageFound bool
		var targetTerminalCode, targetTerminalDetail string
		controllerErr := m.withResourceController(ctx, target, targetResourceID, func() error {
			var err error
			latest, messageFound, err = mailboxMessageByID(target.Path, receipt.ID)
			if err != nil {
				return err
			}
			if !messageFound {
				targetTerminalCode = "target_message_missing"
				targetTerminalDetail = "the previously accepted target mailbox message is missing"
			}
			return nil
		})
		if controllerErr != nil {
			return controllerErr
		}
		if targetTerminalCode != "" {
			return terminalNotificationReceipt(source.Path, sourceMessage.ID, targetTerminalCode, targetTerminalDetail)
		}
		return updateNotificationReceipt(source.Path, sourceMessage.ID, func(current *resourceNotificationReceipt) {
			mirrorNotificationDelivery(current, latest)
		})
	}
	var accepted, latest resourceMailboxMessage
	var targetTerminalCode, targetTerminalDetail string
	controllerErr := m.withResourceController(ctx, target, targetResourceID, func() error {
		exists, archived, _, inspectErr := resourceExistsAndArchived(target.Path, targetResourceID)
		if inspectErr != nil || !exists {
			targetTerminalCode = "target_resource_not_found"
			targetTerminalDetail = fmt.Sprintf("target resource not found: %s", receipt.TargetResourceID)
			if inspectErr != nil {
				targetTerminalDetail = inspectErr.Error()
			}
			return nil
		}
		if archived {
			targetTerminalCode = "target_resource_archived"
			targetTerminalDetail = fmt.Sprintf("target resource is archived: %s", receipt.TargetResourceID)
			return nil
		}
		var err error
		accepted, err = acceptGeneratedMailboxMessage(target.Path, generated)
		if err != nil {
			var apiErr *resourceAPIError
			if errors.As(err, &apiErr) && apiErr.Code == "message_conflict" {
				targetTerminalCode = apiErr.Code
				targetTerminalDetail = apiErr.Message
				return nil
			}
			return err
		}
		if accepted.Status == resourceMessageQueued || accepted.Status == resourceMessageDelivering || accepted.Status == resourceMessageInterrupting {
			if err := m.reconcileResourceMailboxLocked(ctx, target, accepted.ResourceID); err != nil {
				recordMailboxFailure(target.Path, accepted.ID, err)
			}
		}
		var found bool
		latest, found, err = mailboxMessageByID(target.Path, accepted.ID)
		if err != nil {
			return err
		}
		if !found {
			targetTerminalCode = "target_message_missing"
			targetTerminalDetail = "the accepted target mailbox message is missing"
		}
		return nil
	})
	if controllerErr != nil {
		return controllerErr
	}
	if targetTerminalCode != "" {
		return terminalNotificationReceipt(source.Path, sourceMessage.ID, targetTerminalCode, targetTerminalDetail)
	}
	if err := updateNotificationReceipt(source.Path, sourceMessage.ID, func(current *resourceNotificationReceipt) {
		current.Status = resourceNotificationAccepted
		current.AcceptedAt = accepted.AcceptedAt
		current.DeliveryStatus = publicResourceMessageStatus(accepted.Status)
		current.DeliveredAt = accepted.DeliveredAt
		current.TerminalAt = accepted.TerminalAt
		current.LastError = accepted.LastError
		current.LastErrorCode = accepted.LastErrorCode
	}); err != nil {
		return err
	}
	return updateNotificationReceipt(source.Path, sourceMessage.ID, func(current *resourceNotificationReceipt) {
		mirrorNotificationDelivery(current, latest)
	})
}

func (m *agentManager) reconcileCreatorCallback(ctx context.Context, workspace guiWorkspace, instanceID string, mailbox resourceMailbox, message resourceMailboxMessage, client *agentHubClient) error {
	if message.Type != "" || message.Status != resourceMessageDelivered || message.Role != "agent" ||
		strings.TrimSpace(message.GenerationID) == "" || strings.TrimSpace(message.TurnID) == "" || !notificationTrigger(mailbox, message) {
		return nil
	}
	creator, err := resourceCreator(workspace.Path, message.ResourceID)
	if err != nil || creator == nil || creator.Kind != app.CreatorKindResource || message.Sender == nil ||
		strings.TrimSpace(message.Sender.ID) != creator.ResourceID || strings.TrimSpace(message.SenderWorkspaceInstanceID) != creator.WorkspaceInstanceID {
		return err
	}
	run, found, err := runByGenerationID(workspace.Path, message.GenerationID)
	if err != nil {
		return err
	}
	historyUnavailable := false
	turn := agentHubTurn{}
	if !found {
		turn = agentHubTurn{TurnID: message.TurnID, Status: "unknown", Closed: true}
		historyUnavailable = true
	} else {
		var turnErr error
		turn, _, turnErr = client.SessionTurn(ctx, run.AgentHubSessionID, message.TurnID)
		if turnErr != nil {
			if run.CompletionMarker != "" && run.CompletionTurnID == message.TurnID {
				turn = agentHubTurn{TurnID: message.TurnID, Status: run.CompletionState, Closed: true, EndedAt: run.CompletionAt}
				historyUnavailable = true
			} else if !isLiveAgentStatus(run.Status) {
				turn = agentHubTurn{TurnID: message.TurnID, Status: run.Status, Closed: true, EndedAt: run.UpdatedAt}
				historyUnavailable = true
			} else {
				return nil
			}
		}
	}
	if !turn.Closed {
		return nil
	}
	if strings.TrimSpace(turn.Status) == "" {
		turn.Status = "unknown"
	}
	turnID := strings.TrimSpace(turn.TurnID)
	if turnID == "" {
		turnID = strings.TrimSpace(turn.ID)
		if turnID == "" {
			turnID = message.TurnID
		}
		turn.TurnID = turnID
	}
	reference := ""
	if !historyUnavailable {
		reference, err = encodeResourceHistoryReference(resourceHistoryReference{
			Kind: "turn", InstanceID: instanceID, ResourceID: message.ResourceID, GenerationID: message.GenerationID, TurnID: turnID,
		})
		if err != nil {
			return err
		}
	}
	receiptID := notificationMessageID(resourceMessageTypeCreatorTurnResult, instanceID, message.ResourceID, message.GenerationID, turnID)
	updated, err := ensureNotificationReceipt(workspace.Path, message.ID, resourceMessageTypeCreatorTurnResult, creator.WorkspaceInstanceID, creator.ResourceID, receiptID)
	if err != nil {
		return err
	}
	causation := &resourceMessageCausation{
		Type: resourceMessageTypeCreatorTurnResult, SourceWorkspaceInstanceID: instanceID, SourceResourceID: message.ResourceID,
		MessageID: message.ID, GenerationID: message.GenerationID, TurnID: turnID, TurnReference: reference,
		TurnStatus: strings.TrimSpace(turn.Status), HistoryUnavailable: historyUnavailable,
	}
	generated := resourceMailboxMessage{
		ID: receiptID, ResourceID: creator.ResourceID, Text: creatorCallbackMessage(message.ResourceID, turn, reference, historyUnavailable),
		Sender: &agentHubMessageSender{ID: message.ResourceID, Name: message.ResourceID}, SenderWorkspaceInstanceID: instanceID,
		Type: resourceMessageTypeCreatorTurnResult, Causation: causation,
	}
	return m.routeNotification(ctx, workspace, updated, generated)
}

func (m *agentManager) reconcileTerminalNotice(ctx context.Context, workspace guiWorkspace, instanceID string, message resourceMailboxMessage) error {
	if message.Type != "" || message.Role != "agent" || message.Sender == nil || strings.TrimSpace(message.Sender.ID) == "" ||
		strings.TrimSpace(message.SenderWorkspaceInstanceID) == "" ||
		(message.Status != resourceMessageUndeliverable && message.Status != resourceMessageDeliveryUnknown) {
		return nil
	}
	receiptID := notificationMessageID(resourceMessageTypeDeliveryTerminal, instanceID, message.ResourceID, message.ID, message.Status)
	updated, err := ensureNotificationReceipt(workspace.Path, message.ID, resourceMessageTypeDeliveryTerminal, message.SenderWorkspaceInstanceID, message.Sender.ID, receiptID)
	if err != nil {
		return err
	}
	generated := resourceMailboxMessage{
		ID: receiptID, ResourceID: message.Sender.ID, Text: terminalDeliveryMessage(message),
		Sender: &agentHubMessageSender{ID: message.ResourceID, Name: message.ResourceID}, SenderWorkspaceInstanceID: instanceID,
		Type: resourceMessageTypeDeliveryTerminal,
		Causation: &resourceMessageCausation{
			Type: resourceMessageTypeDeliveryTerminal, SourceWorkspaceInstanceID: instanceID, SourceResourceID: message.ResourceID,
			MessageID: message.ID, GenerationID: message.GenerationID, TurnID: message.TurnID, TerminalCode: message.LastErrorCode,
		},
	}
	return m.routeNotification(ctx, workspace, updated, generated)
}

func (m *agentManager) reconcileWorkspaceNotifications(ctx context.Context, workspace guiWorkspace, client *agentHubClient) error {
	instanceID, err := workspaceInstanceID(workspace.Path)
	if err != nil {
		return err
	}
	mailbox, err := loadResourceMailbox(workspace.Path)
	if err != nil {
		return err
	}
	messages := append([]resourceMailboxMessage(nil), mailbox.Messages...)
	sort.SliceStable(messages, func(i, j int) bool { return messages[i].Sequence < messages[j].Sequence })
	var failures []string
	for _, message := range messages {
		if message.Notification != nil && (message.Notification.Status == resourceNotificationAccepted || message.Notification.Status == resourceNotificationDelivered || message.Notification.Status == resourceNotificationTerminal) {
			if err := m.routeNotification(ctx, workspace, message, resourceMailboxMessage{}); err != nil {
				failures = append(failures, fmt.Sprintf("message %s notification receipt: %v", message.ID, err))
			}
			continue
		}
		if err := m.reconcileTerminalNotice(ctx, workspace, instanceID, message); err != nil {
			failures = append(failures, fmt.Sprintf("message %s terminal notice: %v", message.ID, err))
			continue
		}
		if err := m.reconcileCreatorCallback(ctx, workspace, instanceID, mailbox, message, client); err != nil {
			failures = append(failures, fmt.Sprintf("message %s creator callback: %v", message.ID, err))
		}
	}
	if len(failures) > 0 {
		return errors.New(strings.Join(failures, "; "))
	}
	return nil
}
