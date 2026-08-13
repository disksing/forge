package serve

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"reflect"
	"sort"
	"strings"
	"time"

	"github.com/disksing/forge/internal/app"
)

const resourceMailboxVersion = 2

const (
	resourceMessageModeSteer     = "steer"
	resourceMessageModeEnqueue   = "enqueue"
	resourceMessageModeInterrupt = "interrupt"

	resourceMessageQueued          = "queued"
	resourceMessageDelivering      = "delivering"
	resourceMessageInterrupting    = "interrupting"
	resourceMessageDelivered       = "delivered"
	resourceMessageUndeliverable   = "undeliverable"
	resourceMessageDeliveryUnknown = "delivery_unknown"
)

const (
	resourceMessageTypeCreatorTurnResult = "creator_turn_result"
	resourceMessageTypeDeliveryTerminal  = "delivery_terminal_notice"
	resourceMessageTypeSchedulerTick     = "scheduler_tick"

	resourceNotificationWaiting   = "waiting"
	resourceNotificationAccepted  = "accepted"
	resourceNotificationDelivered = "delivered"
	resourceNotificationTerminal  = "terminal"
)

const (
	resourceMessageReasonNoActiveTurn        = "no_active_turn"
	resourceMessageReasonSteerUnsupported    = "steer_unsupported"
	resourceMessageReasonGenerationReplacing = "generation_replacing"
	resourceMessageReasonResourceArchived    = "resource_archived"
	resourceMessageReasonRecoveredCanonical  = "recovered_canonical_mode"
)

type resourceMailbox struct {
	Version      int                      `json:"version"`
	NextSequence uint64                   `json:"nextSequence"`
	Messages     []resourceMailboxMessage `json:"messages"`
}

// resourceMailboxMessage is the durable Forge-side ownership record for one
// accepted resource message. Delivery is complete when AgentHub has durably
// accepted the stable message id and assumed its at-least-once responsibility;
// it does not mean the resulting Turn has completed.
type resourceMailboxMessage struct {
	ID                        string                       `json:"id"`
	Sequence                  uint64                       `json:"sequence"`
	ResourceID                string                       `json:"resourceId"`
	Text                      string                       `json:"text"`
	Role                      string                       `json:"role"`
	Sender                    *agentHubMessageSender       `json:"sender,omitempty"`
	SenderWorkspaceInstanceID string                       `json:"senderWorkspaceInstanceId,omitempty"`
	Type                      string                       `json:"type,omitempty"`
	Causation                 *resourceMessageCausation    `json:"causation,omitempty"`
	Notification              *resourceNotificationReceipt `json:"notification,omitempty"`
	RequestedMode             string                       `json:"requestedMode"`
	ActualMode                string                       `json:"actualMode"`
	ModeFrozen                bool                         `json:"modeFrozen,omitempty"`
	DowngradeReason           string                       `json:"downgradeReason,omitempty"`
	Status                    string                       `json:"status"`
	AcceptedAt                string                       `json:"acceptedAt"`
	UpdatedAt                 string                       `json:"updatedAt"`
	DeliveredAt               string                       `json:"deliveredAt,omitempty"`
	TerminalAt                string                       `json:"terminalAt,omitempty"`
	GenerationID              string                       `json:"generationId,omitempty"`
	AgentHubSessionID         string                       `json:"agentHubSessionId,omitempty"`
	TurnID                    string                       `json:"turnId,omitempty"`
	TurnTerminalAt            string                       `json:"turnTerminalAt,omitempty"`
	InterruptTurnID           string                       `json:"interruptTurnId,omitempty"`
	InterruptAt               string                       `json:"interruptAt,omitempty"`
	PromotedAt                string                       `json:"promotedAt,omitempty"`
	AttemptCount              int                          `json:"attemptCount,omitempty"`
	LastAttemptAt             string                       `json:"lastAttemptAt,omitempty"`
	LastError                 string                       `json:"lastError,omitempty"`
	LastErrorCode             string                       `json:"lastErrorCode,omitempty"`
	receipt                   bool
}

type resourceMessageCausation struct {
	Type                      string `json:"type"`
	SourceWorkspaceInstanceID string `json:"sourceWorkspaceInstanceId"`
	SourceResourceID          string `json:"sourceResourceId"`
	MessageID                 string `json:"messageId,omitempty"`
	GenerationID              string `json:"generationId,omitempty"`
	TurnID                    string `json:"turnId,omitempty"`
	TurnReference             string `json:"turnReference,omitempty"`
	TurnStatus                string `json:"turnStatus,omitempty"`
	HistoryUnavailable        bool   `json:"historyUnavailable,omitempty"`
	TerminalCode              string `json:"terminalCode,omitempty"`
	Reason                    string `json:"reason,omitempty"`
	ScheduleDigest            string `json:"scheduleDigest,omitempty"`
}

type resourceNotificationReceipt struct {
	ID                        string `json:"id"`
	Type                      string `json:"type"`
	Status                    string `json:"status"`
	TargetWorkspaceInstanceID string `json:"targetWorkspaceInstanceId"`
	TargetResourceID          string `json:"targetResourceId"`
	CreatedAt                 string `json:"createdAt"`
	UpdatedAt                 string `json:"updatedAt"`
	AcceptedAt                string `json:"acceptedAt,omitempty"`
	DeliveryStatus            string `json:"deliveryStatus,omitempty"`
	DeliveredAt               string `json:"deliveredAt,omitempty"`
	TerminalAt                string `json:"terminalAt,omitempty"`
	LastError                 string `json:"lastError,omitempty"`
	LastErrorCode             string `json:"lastErrorCode,omitempty"`
}

type resourceMailboxCounts struct {
	Waiting         int `json:"waiting"`
	Delivering      int `json:"delivering"`
	Interrupting    int `json:"interrupting"`
	Delivered       int `json:"delivered"`
	Undeliverable   int `json:"undeliverable"`
	DeliveryUnknown int `json:"deliveryUnknown"`
}

type resourceGenerationStatus struct {
	Generation         int    `json:"generation"`
	GenerationID       string `json:"generationId"`
	Status             string `json:"status"`
	ReplacementPending bool   `json:"replacementPending"`
	IdleSinceAt        string `json:"idleSinceAt,omitempty"`
	IdleDeadlineAt     string `json:"idleDeadlineAt,omitempty"`
	IdleSleepRequested bool   `json:"idleSleepRequested,omitempty"`
	TurnNumber         int    `json:"turnNumber,omitempty"`
	AgentHubSessionID  string `json:"agentHubSessionId,omitempty"`
}

type resourceSessionStatus struct {
	ID                string                    `json:"id,omitempty"`
	State             string                    `json:"state,omitempty"`
	CurrentTurnID     string                    `json:"currentTurnId,omitempty"`
	InputCapabilities agentHubInputCapabilities `json:"inputCapabilities"`
}

type resourceStatusResponse struct {
	ResourceID      string                    `json:"resourceId"`
	State           string                    `json:"state"`
	Exists          bool                      `json:"exists"`
	Archived        bool                      `json:"archived"`
	AcceptsMessages bool                      `json:"acceptsMessages"`
	Binding         app.AgentBinding          `json:"binding"`
	Creator         *app.Creator              `json:"creator,omitempty"`
	ResolvedAgent   string                    `json:"resolvedAgent,omitempty"`
	ResolvedProfile string                    `json:"resolvedProfile,omitempty"`
	ConfigError     string                    `json:"configError,omitempty"`
	Generation      *resourceGenerationStatus `json:"generation,omitempty"`
	Session         *resourceSessionStatus    `json:"session,omitempty"`
	Messages        resourceMailboxCounts     `json:"messages"`
	WaitingMessages []resourceMessageResponse `json:"waitingMessages"`
	CanSteerWaiting bool                      `json:"canSteerWaiting"`
	LastError       string                    `json:"lastError,omitempty"`
	LastErrorCode   string                    `json:"lastErrorCode,omitempty"`
}

type resourceMessageRequest struct {
	Text                      string                 `json:"text"`
	Mode                      string                 `json:"mode,omitempty"`
	Role                      string                 `json:"role,omitempty"`
	Sender                    *agentHubMessageSender `json:"sender,omitempty"`
	SenderWorkspaceInstanceID string                 `json:"senderWorkspaceInstanceId,omitempty"`
}

type resourceMessageResponse struct {
	MessageID         string                       `json:"messageId"`
	ResourceID        string                       `json:"resourceId"`
	Text              string                       `json:"text,omitempty"`
	Receipt           bool                         `json:"receipt,omitempty"`
	RequestedMode     string                       `json:"requestedMode"`
	ActualMode        string                       `json:"actualMode"`
	DowngradeReason   string                       `json:"downgradeReason,omitempty"`
	Status            string                       `json:"status"`
	AcceptedAt        string                       `json:"acceptedAt"`
	PromotedAt        string                       `json:"promotedAt,omitempty"`
	Reference         string                       `json:"reference"`
	GenerationID      string                       `json:"generationId,omitempty"`
	AgentHubSessionID string                       `json:"agentHubSessionId,omitempty"`
	TurnID            string                       `json:"turnId,omitempty"`
	LastError         string                       `json:"lastError,omitempty"`
	LastErrorCode     string                       `json:"lastErrorCode,omitempty"`
	Type              string                       `json:"type,omitempty"`
	Causation         *resourceMessageCausation    `json:"causation,omitempty"`
	Notification      *resourceNotificationReceipt `json:"notification,omitempty"`
}

type resourceAPIError struct {
	Code    string
	Message string
}

func (e *resourceAPIError) Error() string { return e.Message }

func resourceMailboxPath(workspacePath string) string {
	return filepath.Join(agentRoot(workspacePath), "mailbox.json")
}

func normalizeResourceMessageMode(mode string) (string, error) {
	mode = strings.ToLower(strings.TrimSpace(mode))
	if mode == "" {
		return resourceMessageModeSteer, nil
	}
	switch mode {
	case resourceMessageModeSteer, resourceMessageModeEnqueue, resourceMessageModeInterrupt:
		return mode, nil
	default:
		return "", &resourceAPIError{Code: "invalid_request", Message: "mode must be steer, enqueue, or interrupt"}
	}
}

func normalizeResourceMessageRole(role string) (string, error) {
	role = strings.ToLower(strings.TrimSpace(role))
	if role == "" {
		return "user", nil
	}
	switch role {
	case "user", "agent", "system":
		return role, nil
	default:
		return "", &resourceAPIError{Code: "invalid_request", Message: "role must be user, agent, or system"}
	}
}

func cloneMailboxMessage(message resourceMailboxMessage) resourceMailboxMessage {
	cloned := message
	if message.Sender != nil {
		sender := *message.Sender
		cloned.Sender = &sender
	}
	if message.Causation != nil {
		causation := *message.Causation
		cloned.Causation = &causation
	}
	if message.Notification != nil {
		notification := *message.Notification
		cloned.Notification = &notification
	}
	return cloned
}

func loadLegacyResourceMailboxLocked(workspacePath string) (resourceMailbox, error) {
	data, err := os.ReadFile(resourceMailboxPath(workspacePath))
	if err != nil {
		if os.IsNotExist(err) {
			return resourceMailbox{Version: resourceMailboxVersion, Messages: []resourceMailboxMessage{}}, nil
		}
		return resourceMailbox{}, err
	}
	var mailbox resourceMailbox
	if err := json.Unmarshal(data, &mailbox); err != nil {
		return resourceMailbox{}, fmt.Errorf("read resource mailbox: %w", err)
	}
	if mailbox.Version != 1 && mailbox.Version != resourceMailboxVersion {
		return resourceMailbox{}, fmt.Errorf("unsupported resource mailbox version %d", mailbox.Version)
	}
	mailbox.Version = resourceMailboxVersion
	if mailbox.Messages == nil {
		mailbox.Messages = []resourceMailboxMessage{}
	}
	for _, message := range mailbox.Messages {
		if message.Sequence > mailbox.NextSequence {
			mailbox.NextSequence = message.Sequence
		}
	}
	return mailbox, nil
}

func loadLegacyResourceMailbox(workspacePath string) (resourceMailbox, error) {
	agentIndexMu.Lock()
	defer agentIndexMu.Unlock()
	return loadLegacyResourceMailboxLocked(workspacePath)
}

func writeLegacyResourceMailboxLocked(workspacePath string, mailbox resourceMailbox) error {
	if err := ensureAgentDirs(workspacePath); err != nil {
		return err
	}
	mailbox.Version = resourceMailboxVersion
	if mailbox.Messages == nil {
		mailbox.Messages = []resourceMailboxMessage{}
	}
	sort.SliceStable(mailbox.Messages, func(i, j int) bool {
		if mailbox.Messages[i].Sequence != mailbox.Messages[j].Sequence {
			return mailbox.Messages[i].Sequence < mailbox.Messages[j].Sequence
		}
		return mailbox.Messages[i].ID < mailbox.Messages[j].ID
	})
	data, err := json.MarshalIndent(mailbox, "", "  ")
	if err != nil {
		return err
	}
	data = append(data, '\n')
	path := resourceMailboxPath(workspacePath)
	tmp := path + "." + newRunID() + ".tmp"
	file, err := os.OpenFile(tmp, os.O_CREATE|os.O_EXCL|os.O_WRONLY, 0o600)
	if err != nil {
		return err
	}
	remove := true
	defer func() {
		if remove {
			_ = os.Remove(tmp)
		}
	}()
	if _, err := file.Write(data); err != nil {
		_ = file.Close()
		return err
	}
	if err := file.Sync(); err != nil {
		_ = file.Close()
		return err
	}
	if err := file.Close(); err != nil {
		return err
	}
	if err := os.Rename(tmp, path); err != nil {
		return err
	}
	remove = false
	directory, err := os.Open(filepath.Dir(path))
	if err != nil {
		return err
	}
	if err := directory.Sync(); err != nil {
		_ = directory.Close()
		return err
	}
	return directory.Close()
}

func mutateLegacyResourceMailbox(workspacePath string, mutate func(*resourceMailbox) error) (resourceMailbox, error) {
	agentIndexMu.Lock()
	defer agentIndexMu.Unlock()
	mailbox, err := loadLegacyResourceMailboxLocked(workspacePath)
	if err != nil {
		return resourceMailbox{}, err
	}
	if err := mutate(&mailbox); err != nil {
		return resourceMailbox{}, err
	}
	if err := writeLegacyResourceMailboxLocked(workspacePath, mailbox); err != nil {
		return resourceMailbox{}, err
	}
	return mailbox, nil
}

// migrateLegacyResourceMailbox moves stage-one generation-owned queues into
// the Workspace mailbox. It writes the mailbox first, then clears legacy
// queues. A crash between the two writes repeats the merge by stable id and
// cannot lose or duplicate a mailbox item.
func migrateLegacyResourceMailboxV2(workspacePath string) error {
	agentIndexMu.Lock()
	defer agentIndexMu.Unlock()
	mailbox, err := loadLegacyResourceMailboxLocked(workspacePath)
	if err != nil {
		return err
	}
	runs, err := loadAgentRunsLocked(workspacePath)
	if err != nil {
		return err
	}
	seen := make(map[string]bool, len(mailbox.Messages))
	for _, message := range mailbox.Messages {
		seen[message.ID] = true
	}
	mailboxChanged, runsChanged := false, false
	for runIndex := range runs {
		for _, legacy := range runs[runIndex].PendingMessages {
			if strings.TrimSpace(legacy.ID) == "" || seen[legacy.ID] {
				continue
			}
			mailbox.NextSequence++
			actual := resourceMessageModeSteer
			if legacy.Steer != nil && !*legacy.Steer {
				actual = resourceMessageModeEnqueue
			}
			acceptedAt := strings.TrimSpace(legacy.AcceptedAt)
			if acceptedAt == "" {
				acceptedAt = strings.TrimSpace(runs[runIndex].UpdatedAt)
			}
			if acceptedAt == "" {
				acceptedAt = time.Now().Format(time.RFC3339Nano)
			}
			mailbox.Messages = append(mailbox.Messages, resourceMailboxMessage{
				ID: legacy.ID, Sequence: mailbox.NextSequence,
				ResourceID: normalizedResourceID(runs[runIndex].ResourceID),
				Text:       legacy.Text, Role: legacy.Role, Sender: legacy.Sender,
				RequestedMode: resourceMessageModeSteer, ActualMode: actual,
				ModeFrozen: legacy.Steer != nil,
				Status:     resourceMessageQueued, AcceptedAt: acceptedAt, UpdatedAt: acceptedAt,
				GenerationID:      runs[runIndex].GenerationID,
				AgentHubSessionID: runs[runIndex].AgentHubSessionID,
			})
			seen[legacy.ID] = true
			mailboxChanged = true
		}
		if len(runs[runIndex].PendingMessages) > 0 {
			runs[runIndex].PendingMessages = nil
			runsChanged = true
		}
	}
	if mailboxChanged {
		if err := writeLegacyResourceMailboxLocked(workspacePath, mailbox); err != nil {
			return fmt.Errorf("persist migrated resource mailbox: %w", err)
		}
	}
	if runsChanged {
		if err := writeAgentRunsIndexLocked(workspacePath, runs); err != nil {
			return fmt.Errorf("clear migrated generation queues: %w", err)
		}
	}
	return nil
}

func normalizedResourceID(resourceID string) string {
	resourceID = strings.TrimSpace(resourceID)
	if resourceID == "" {
		return "workspace"
	}
	return resourceID
}

func mailboxMessageResponse(message resourceMailboxMessage) resourceMessageResponse {
	return resourceMessageResponse{
		MessageID: message.ID, ResourceID: message.ResourceID,
		Text: message.Text, Receipt: message.receipt,
		RequestedMode: message.RequestedMode, ActualMode: message.ActualMode,
		DowngradeReason: message.DowngradeReason, Status: publicResourceMessageStatus(message.Status),
		AcceptedAt: message.AcceptedAt, PromotedAt: message.PromotedAt,
		Reference: "messages/" + message.ID, GenerationID: message.GenerationID,
		AgentHubSessionID: message.AgentHubSessionID, TurnID: message.TurnID,
		LastError: message.LastError, LastErrorCode: message.LastErrorCode,
		Type: message.Type, Causation: message.Causation, Notification: message.Notification,
	}
}

func publicResourceMessageStatus(status string) string {
	if status == resourceMessageQueued {
		return "waiting"
	}
	return status
}

func mailboxCounts(mailbox resourceMailbox, resourceID string) (resourceMailboxCounts, string, string) {
	resourceID = normalizedResourceID(resourceID)
	var counts resourceMailboxCounts
	lastError, lastErrorCode := "", ""
	for _, message := range mailbox.Messages {
		if normalizedResourceID(message.ResourceID) != resourceID {
			continue
		}
		switch message.Status {
		case resourceMessageQueued:
			counts.Waiting++
		case resourceMessageDelivering:
			counts.Delivering++
		case resourceMessageInterrupting:
			counts.Interrupting++
		case resourceMessageDelivered:
			counts.Delivered++
		case resourceMessageUndeliverable:
			counts.Undeliverable++
		case resourceMessageDeliveryUnknown:
			counts.DeliveryUnknown++
		}
		if strings.TrimSpace(message.LastError) != "" {
			lastError = message.LastError
			lastErrorCode = message.LastErrorCode
		}
	}
	return counts, lastError, lastErrorCode
}

func mailboxPendingForResource(workspacePath, resourceID string) (bool, error) {
	mailbox, err := loadHotResourceMailbox(workspacePath, resourceID)
	if err != nil {
		return false, err
	}
	for _, message := range mailbox.Messages {
		if message.Status == resourceMessageQueued || message.Status == resourceMessageDelivering || message.Status == resourceMessageInterrupting {
			return true, nil
		}
	}
	return false, nil
}

func legacyMailboxMessageByID(workspacePath, messageID string) (resourceMailboxMessage, bool, error) {
	mailbox, err := loadResourceMailbox(workspacePath)
	if err != nil {
		return resourceMailboxMessage{}, false, err
	}
	for _, message := range mailbox.Messages {
		if message.ID == strings.TrimSpace(messageID) {
			return cloneMailboxMessage(message), true, nil
		}
	}
	return resourceMailboxMessage{}, false, nil
}

func legacyUpdateMailboxMessage(workspacePath, messageID string, mutate func(*resourceMailboxMessage)) (resourceMailboxMessage, error) {
	var updated resourceMailboxMessage
	found := false
	_, err := mutateResourceMailbox(workspacePath, func(mailbox *resourceMailbox) error {
		for index := range mailbox.Messages {
			if mailbox.Messages[index].ID != messageID {
				continue
			}
			mutate(&mailbox.Messages[index])
			mailbox.Messages[index].UpdatedAt = time.Now().Format(time.RFC3339Nano)
			updated, found = cloneMailboxMessage(mailbox.Messages[index]), true
			return nil
		}
		return nil
	})
	if err != nil {
		return resourceMailboxMessage{}, err
	}
	if !found {
		return resourceMailboxMessage{}, fmt.Errorf("mailbox message not found: %s", messageID)
	}
	return updated, nil
}

func acceptMailboxMessage(workspacePath, resourceID string, request resourceMessageRequest) (resourceMailboxMessage, error) {
	mode, err := normalizeResourceMessageMode(request.Mode)
	if err != nil {
		return resourceMailboxMessage{}, err
	}
	role, err := normalizeResourceMessageRole(request.Role)
	if err != nil {
		return resourceMailboxMessage{}, err
	}
	text := strings.TrimSpace(request.Text)
	if text == "" {
		return resourceMailboxMessage{}, &resourceAPIError{Code: "invalid_request", Message: "text is required"}
	}
	resourceID = normalizedResourceID(resourceID)
	now := time.Now().Format(time.RFC3339Nano)
	message := resourceMailboxMessage{
		ID: "msg-" + newRunID(), ResourceID: resourceID, Text: text,
		Role: role, Sender: request.Sender, SenderWorkspaceInstanceID: strings.TrimSpace(request.SenderWorkspaceInstanceID), RequestedMode: mode, ActualMode: mode,
		Status: resourceMessageQueued, AcceptedAt: now, UpdatedAt: now,
	}
	_, err = mutateResourceMailboxForResource(workspacePath, resourceID, func(mailbox *resourceMailbox) error {
		mailbox.NextSequence++
		message.Sequence = mailbox.NextSequence
		mailbox.Messages = append(mailbox.Messages, cloneMailboxMessage(message))
		return nil
	})
	return message, err
}

// acceptGeneratedMailboxMessage persists a Server-generated system message
// using a deterministic id. Replays are accepted only when every immutable
// field matches, so a crash between target acceptance and source receipt
// update is both retryable and conflict-safe.
func acceptGeneratedMailboxMessage(workspacePath string, expected resourceMailboxMessage) (resourceMailboxMessage, error) {
	expected.ID = strings.TrimSpace(expected.ID)
	expected.ResourceID = normalizedResourceID(expected.ResourceID)
	expected.Text = strings.TrimSpace(expected.Text)
	expected.Role = "system"
	expected.RequestedMode = resourceMessageModeEnqueue
	expected.ActualMode = resourceMessageModeEnqueue
	expected.ModeFrozen = true
	expected.Status = resourceMessageQueued
	if expected.ID == "" || expected.Text == "" || expected.Type == "" || expected.Causation == nil {
		return resourceMailboxMessage{}, errors.New("generated mailbox message is incomplete")
	}
	now := time.Now().Format(time.RFC3339Nano)
	if expected.AcceptedAt == "" {
		expected.AcceptedAt = now
	}
	expected.UpdatedAt = now
	var result resourceMailboxMessage
	_, err := mutateResourceMailboxForResource(workspacePath, expected.ResourceID, func(mailbox *resourceMailbox) error {
		for _, current := range mailbox.Messages {
			if current.ID != expected.ID {
				continue
			}
			if current.ResourceID != expected.ResourceID || (current.Text != "" && current.Text != expected.Text) || current.Role != expected.Role ||
				current.Type != expected.Type || current.SenderWorkspaceInstanceID != expected.SenderWorkspaceInstanceID ||
				!reflect.DeepEqual(current.Sender, expected.Sender) || !reflect.DeepEqual(current.Causation, expected.Causation) {
				return &resourceAPIError{Code: "message_conflict", Message: "stable generated message id conflicts with a different mailbox message"}
			}
			result = cloneMailboxMessage(current)
			return nil
		}
		mailbox.NextSequence++
		expected.Sequence = mailbox.NextSequence
		mailbox.Messages = append(mailbox.Messages, cloneMailboxMessage(expected))
		result = cloneMailboxMessage(expected)
		return nil
	})
	return result, err
}

func markResourceMailboxArchived(workspacePath, resourceID string) error {
	resourceID = normalizedResourceID(resourceID)
	_, err := mutateResourceMailboxForResource(workspacePath, resourceID, func(mailbox *resourceMailbox) error {
		now := time.Now().Format(time.RFC3339Nano)
		for index := range mailbox.Messages {
			message := &mailbox.Messages[index]
			if normalizedResourceID(message.ResourceID) != resourceID || message.receipt ||
				(message.Status != resourceMessageQueued && message.Status != resourceMessageDelivering && message.Status != resourceMessageInterrupting) {
				continue
			}
			if message.Status == resourceMessageDelivering {
				message.Status = resourceMessageDeliveryUnknown
				message.LastError = "target resource was archived before the delivery outcome could be confirmed"
			} else {
				message.Status = resourceMessageUndeliverable
				message.LastError = "target resource was archived before delivery began"
			}
			message.DowngradeReason = resourceMessageReasonResourceArchived
			message.LastErrorCode = "resource_archived"
			message.UpdatedAt = now
			message.TerminalAt = now
		}
		return nil
	})
	return err
}

func resourceExistsAndArchived(workspacePath, resourceID string) (bool, bool, app.AgentBinding, error) {
	resourceID = normalizedResourceID(resourceID)
	forgeWorkspace, err := app.OpenWorkspace(workspacePath)
	if err != nil {
		return false, false, app.AgentBinding{}, err
	}
	if resourceID == "workspace" {
		binding, err := forgeWorkspace.ResourceAgentBinding(resourceID)
		return err == nil, false, binding, err
	}
	if resourceID == app.SchedulerResourceID {
		binding, err := forgeWorkspace.ResourceAgentBinding(resourceID)
		return err == nil, false, binding, err
	}
	value, err := forgeWorkspace.ResourceValue(resourceID)
	if err != nil {
		return false, false, app.AgentBinding{}, err
	}
	var binding app.AgentBinding
	if value.Project != nil {
		binding = value.Project.AgentBinding
	} else if value.Task != nil {
		binding = value.Task.AgentBinding
	}
	return true, value.Archived, binding, nil
}

func resourceCreator(workspacePath, resourceID string) (*app.Creator, error) {
	resourceID = normalizedResourceID(resourceID)
	forgeWorkspace, err := app.OpenWorkspace(workspacePath)
	if err != nil {
		return nil, err
	}
	if resourceID == "workspace" {
		runtime, err := forgeWorkspace.RuntimeConfig()
		if err != nil {
			return nil, err
		}
		return runtime.Creator, nil
	}
	if resourceID == app.SchedulerResourceID {
		return nil, nil
	}
	value, err := forgeWorkspace.ResourceValue(resourceID)
	if err != nil {
		return nil, err
	}
	if value.Project != nil {
		return value.Project.Creator, nil
	}
	if value.Task != nil {
		return value.Task.Creator, nil
	}
	return nil, fmt.Errorf("resource creator is unavailable: %s", resourceID)
}

func waitingMailboxMessages(mailbox resourceMailbox, resourceID string) []resourceMessageResponse {
	resourceID = normalizedResourceID(resourceID)
	messages := make([]resourceMessageResponse, 0)
	for _, message := range mailbox.Messages {
		if normalizedResourceID(message.ResourceID) == resourceID && message.Status == resourceMessageQueued {
			messages = append(messages, mailboxMessageResponse(message))
		}
	}
	return messages
}

func publicResourceState(archived bool, unavailableReason string, generation *resourceGenerationStatus, session *resourceSessionStatus, runtimeError string) string {
	if archived {
		return "archived"
	}
	if strings.TrimSpace(unavailableReason) != "" || strings.TrimSpace(runtimeError) != "" {
		return "unavailable"
	}
	if session != nil {
		if session.State == "waiting_approval" {
			return "attention_required"
		}
		if session.State == "running" {
			return "working"
		}
	}
	if generation != nil {
		switch generation.Status {
		case "starting", "running", "stopping", "recovering":
			return "working"
		case "waiting_approval":
			return "attention_required"
		case "failed":
			return "unavailable"
		}
	}
	return "idle"
}

func (m *agentManager) resourceStatus(ctx context.Context, workspace guiWorkspace, resourceID string) (resourceStatusResponse, error) {
	if err := migrateLegacyResourceMailbox(workspace.Path); err != nil {
		return resourceStatusResponse{}, err
	}
	resourceID = normalizedResourceID(resourceID)
	exists, archived, binding, err := resourceExistsAndArchived(workspace.Path, resourceID)
	if err != nil {
		return resourceStatusResponse{}, &resourceAPIError{Code: "resource_not_found", Message: err.Error()}
	}
	status := resourceStatusResponse{ResourceID: resourceID, Exists: exists, Archived: archived, AcceptsMessages: exists && !archived, Binding: binding}
	status.Creator, err = resourceCreator(workspace.Path, resourceID)
	if err != nil {
		return resourceStatusResponse{}, err
	}
	mailbox, err := loadResourceMailboxForResource(workspace.Path, resourceID)
	if err != nil {
		return resourceStatusResponse{}, err
	}
	status.Messages, status.LastError, status.LastErrorCode = mailboxCounts(mailbox, resourceID)
	status.WaitingMessages = waitingMailboxMessages(mailbox, resourceID)
	cfg, client, cfgErr := m.agentHubRuntimeConfig()
	unavailableReason := ""
	if cfgErr == nil {
		resolved, resolveErr := m.resolveResourceAgent(workspace, resourceID, cfg)
		status.ResolvedAgent = resolved.AgentName
		status.ResolvedProfile = resolved.ResolvedProfile
		status.ConfigError = resolved.ConfigError
		if resolveErr != nil && status.ConfigError == "" {
			status.ConfigError = resolveErr.Error()
		}
		if resolveErr != nil {
			unavailableReason = resolveErr.Error()
		}
	} else {
		status.ConfigError = cfgErr.Error()
		unavailableReason = cfgErr.Error()
	}
	run, found, loadErr := currentResourceGeneration(workspace.Path, resourceID)
	if loadErr != nil {
		return resourceStatusResponse{}, loadErr
	}
	if !found {
		status.State = publicResourceState(archived, unavailableReason, nil, nil, "")
		return status, nil
	}
	status.Generation = &resourceGenerationStatus{
		Generation: run.Generation, GenerationID: run.GenerationID,
		Status: run.Status, ReplacementPending: run.ReplacementPending,
		IdleSinceAt: run.IdleSinceAt, IdleDeadlineAt: run.IdleDeadlineAt,
		IdleSleepRequested: run.IdleSleepStopRequested,
		TurnNumber:         run.TurnNumber,
		AgentHubSessionID:  run.AgentHubSessionID,
	}
	if strings.TrimSpace(run.AgentHubSessionID) == "" || cfgErr != nil {
		status.State = publicResourceState(archived, unavailableReason, status.Generation, nil, "")
		return status, nil
	}
	session, sessionErr := client.GetSession(ctx, run.AgentHubSessionID)
	if sessionErr != nil {
		if status.LastError == "" {
			status.LastError = sessionErr.Error()
		}
		status.State = publicResourceState(archived, unavailableReason, status.Generation, nil, sessionErr.Error())
		return status, nil
	}
	status.Session = &resourceSessionStatus{
		ID: session.ID, State: session.State, CurrentTurnID: session.CurrentTurnID,
		InputCapabilities: session.InputCapabilities,
	}
	status.CanSteerWaiting = !archived && !run.ReplacementPending && (session.State == "running" || session.State == "waiting_approval") && session.InputCapabilities.Steer
	status.State = publicResourceState(archived, unavailableReason, status.Generation, status.Session, "")
	return status, nil
}

func mailboxPriority(message resourceMailboxMessage) int {
	if message.Status == resourceMessageDelivering {
		return -2
	}
	if message.Status == resourceMessageInterrupting {
		return -1
	}
	if message.PromotedAt != "" {
		return 1
	}
	switch message.RequestedMode {
	case resourceMessageModeInterrupt:
		return 0
	case resourceMessageModeSteer:
		return 2
	default:
		return 3
	}
}

func findCanonicalAgentHubMessage(ctx context.Context, client *agentHubClient, sessionID string, expected resourceMailboxMessage) (agentHubInboundMessage, bool, error) {
	cursor := int64(0)
	for {
		events, latest, err := client.SessionEvents(ctx, sessionID, cursor, agentHubEventMaxCount)
		if err != nil {
			return agentHubInboundMessage{}, false, err
		}
		for _, event := range events {
			if event.Type != "message.input" {
				continue
			}
			var canonical agentHubInboundMessage
			if json.Unmarshal(event.Data, &canonical) != nil || canonical.MessageID != expected.ID {
				continue
			}
			if canonical.Role == "" {
				canonical.Role = "user"
			}
			if canonical.Text != expected.Text || canonical.Role != expected.Role || !reflect.DeepEqual(canonical.Sender, expected.Sender) {
				return agentHubInboundMessage{}, false, &resourceAPIError{Code: "message_conflict", Message: "stable message id conflicts with a different canonical AgentHub input"}
			}
			return canonical, true, nil
		}
		if len(events) == 0 || events[len(events)-1].ID <= cursor || events[len(events)-1].ID >= latest {
			return agentHubInboundMessage{}, false, nil
		}
		cursor = events[len(events)-1].ID
	}
}

func selectPendingMailboxMessage(mailbox resourceMailbox, resourceID string) (resourceMailboxMessage, bool) {
	resourceID = normalizedResourceID(resourceID)
	var selected resourceMailboxMessage
	found := false
	for _, message := range mailbox.Messages {
		if normalizedResourceID(message.ResourceID) != resourceID ||
			(message.Status != resourceMessageQueued && message.Status != resourceMessageDelivering && message.Status != resourceMessageInterrupting) {
			continue
		}
		if !found || mailboxPriority(message) < mailboxPriority(selected) ||
			(mailboxPriority(message) == mailboxPriority(selected) && message.Sequence < selected.Sequence) {
			selected, found = cloneMailboxMessage(message), true
		}
	}
	return selected, found
}

func mailboxAttemptDue(message resourceMailboxMessage, interval time.Duration) bool {
	last := agentRunTime(message.LastAttemptAt)
	return last.IsZero() || time.Since(last) >= interval
}

func runByGenerationID(workspacePath, generationID string) (agentRun, bool, error) {
	runs, err := loadAgentRuns(workspacePath)
	if err != nil {
		return agentRun{}, false, err
	}
	for _, run := range runs {
		if run.GenerationID == strings.TrimSpace(generationID) {
			return run, true, nil
		}
	}
	return agentRun{}, false, nil
}

func (m *agentManager) ensureRuntime(workspace guiWorkspace, run agentRun, client *agentHubClient) *agentRuntime {
	rt := m.runtimeByID(run.ID)
	if rt != nil {
		return rt
	}
	rt = newAgentHubRuntime(m, workspace, run, client)
	rt.agentHubState = agentHubStateForForgeStatus(run.Status)
	m.registerRuntime(rt)
	return rt
}

func (m *agentManager) ensureMailboxGeneration(ctx context.Context, workspace guiWorkspace, resourceID string) (agentRun, *agentRuntime, *agentHubClient, error) {
	if run, found, err := currentResourceGeneration(workspace.Path, resourceID); err != nil {
		return agentRun{}, nil, nil, err
	} else if found {
		_, client, cfgErr := m.agentHubRuntimeConfig()
		if cfgErr != nil {
			return run, nil, nil, cfgErr
		}
		return run, m.ensureRuntime(workspace, run, client), client, nil
	}
	cfg, client, err := m.agentHubRuntimeConfig()
	if err != nil {
		return agentRun{}, nil, nil, err
	}
	resolved, err := m.resolveResourceAgent(workspace, resourceID, cfg)
	if err != nil {
		return agentRun{}, nil, client, &resourceAPIError{Code: "binding_unavailable", Message: err.Error()}
	}
	if err == nil {
		resolved.AgentName, err = validateAgentHubRunAgent(ctx, client, resolved.AgentName)
	}
	if err != nil {
		if strings.Contains(err.Error(), " is unavailable") || strings.Contains(err.Error(), "not present in the catalog") {
			err = &resourceAPIError{Code: "binding_unavailable", Message: err.Error()}
		}
		return agentRun{}, nil, client, err
	}
	cwd, err := m.agentRunCwd(ctx, workspace, resourceID, "")
	if err != nil {
		return agentRun{}, nil, client, err
	}
	created, err := m.createResourceGeneration(ctx, workspace, resourceID, cwd, cfg, client, resolved)
	if err != nil {
		return created, m.runtimeByID(created.ID), client, err
	}
	return created, m.runtimeByID(created.ID), client, nil
}

func resourceDeliveryErrorCode(err error) string {
	var apiErr *resourceAPIError
	if errors.As(err, &apiErr) && strings.TrimSpace(apiErr.Code) != "" {
		return apiErr.Code
	}
	return "temporarily_undeliverable"
}

func recordMailboxFailure(workspacePath, messageID string, err error) {
	if err == nil {
		return
	}
	code := resourceDeliveryErrorCode(err)
	if current, found, loadErr := mailboxMessageByID(workspacePath, messageID); loadErr == nil && found &&
		current.LastError == err.Error() && current.LastErrorCode == code {
		return
	}
	_, _ = updateMailboxMessage(workspacePath, messageID, func(message *resourceMailboxMessage) {
		message.LastError = err.Error()
		message.LastErrorCode = code
	})
}

func (m *agentManager) acceptResourceMessage(ctx context.Context, workspace guiWorkspace, resourceID string, request resourceMessageRequest) (resourceMailboxMessage, error) {
	resourceID = normalizedResourceID(resourceID)
	var message resourceMailboxMessage
	err := m.withResourceController(ctx, workspace, resourceID, func() error {
		var err error
		message, err = m.acceptResourceMessageDurable(ctx, workspace, resourceID, request)
		if err != nil {
			return err
		}
		if reconcileErr := m.reconcileResourceMailboxLocked(ctx, workspace, resourceID); reconcileErr != nil {
			recordMailboxFailure(workspace.Path, message.ID, reconcileErr)
		}
		if updated, found, loadErr := mailboxMessageByID(workspace.Path, message.ID); loadErr == nil && found {
			message = updated
		}
		return nil
	})
	return message, err
}

// acceptResourceMessageDurable validates the resource and persists the
// mailbox acceptance. It deliberately does not contact AgentHub; callers must
// wake the resource controller after this short durable boundary.
func (m *agentManager) acceptResourceMessageDurable(ctx context.Context, workspace guiWorkspace, resourceID string, request resourceMessageRequest) (resourceMailboxMessage, error) {
	resourceID = normalizedResourceID(resourceID)
	if err := m.server.requireWorkspaceOwnership(workspace.Path); err != nil {
		return resourceMailboxMessage{}, &resourceAPIError{Code: "workspace_not_owned", Message: err.Error()}
	}
	if err := migrateLegacyResourceMailbox(workspace.Path); err != nil {
		return resourceMailboxMessage{}, err
	}
	exists, archived, _, err := resourceExistsAndArchived(workspace.Path, resourceID)
	if err != nil || !exists {
		message := fmt.Sprintf("resource not found: %s", resourceID)
		if err != nil {
			message = err.Error()
		}
		return resourceMailboxMessage{}, &resourceAPIError{Code: "resource_not_found", Message: message}
	}
	if archived {
		return resourceMailboxMessage{}, &resourceAPIError{Code: "resource_archived", Message: fmt.Sprintf("resource %s is archived and no longer accepts messages", resourceID)}
	}
	if err := m.server.followResource(workspace.Path, resourceID); err != nil {
		return resourceMailboxMessage{}, fmt.Errorf("follow resource before accepting message: %w", err)
	}
	message, err := acceptMailboxMessage(workspace.Path, resourceID, request)
	if err != nil {
		return resourceMailboxMessage{}, err
	}
	_ = ctx
	return message, nil
}

func (m *agentManager) promoteWaitingMessage(ctx context.Context, workspace guiWorkspace, messageID string) (resourceMailboxMessage, error) {
	resourceID, err := mailboxMessageResourceID(workspace.Path, messageID)
	if err != nil {
		return resourceMailboxMessage{}, err
	}
	var message resourceMailboxMessage
	err = m.withResourceController(ctx, workspace, resourceID, func() error {
		var err error
		message, err = m.promoteWaitingMessageLocked(ctx, workspace, messageID)
		if err != nil {
			return err
		}
		if reconcileErr := m.reconcileResourceMailboxLocked(ctx, workspace, message.ResourceID); reconcileErr != nil {
			recordMailboxFailure(workspace.Path, message.ID, reconcileErr)
		}
		if updated, found, loadErr := mailboxMessageByID(workspace.Path, message.ID); loadErr == nil && found {
			message = updated
		}
		return nil
	})
	return message, err
}

// mailboxMessageResourceID reads the stable resource address before a
// controller operation begins. The mailbox lookup is durable and does not
// contact AgentHub.
func mailboxMessageResourceID(workspacePath, messageID string) (string, error) {
	if err := migrateLegacyResourceMailbox(workspacePath); err != nil {
		return "", err
	}
	message, found, err := mailboxMessageByID(workspacePath, messageID)
	if err != nil {
		return "", err
	}
	if !found {
		return "", &resourceAPIError{Code: "message_not_found", Message: fmt.Sprintf("mailbox message not found: %s", messageID)}
	}
	return normalizedResourceID(message.ResourceID), nil
}

func (m *agentManager) promoteWaitingMessageLocked(ctx context.Context, workspace guiWorkspace, messageID string) (resourceMailboxMessage, error) {
	if err := m.server.requireWorkspaceOwnership(workspace.Path); err != nil {
		return resourceMailboxMessage{}, &resourceAPIError{Code: "workspace_not_owned", Message: err.Error()}
	}
	if err := migrateLegacyResourceMailbox(workspace.Path); err != nil {
		return resourceMailboxMessage{}, err
	}
	message, found, err := mailboxMessageByID(workspace.Path, messageID)
	if err != nil {
		return resourceMailboxMessage{}, err
	}
	if !found {
		return resourceMailboxMessage{}, &resourceAPIError{Code: "message_not_found", Message: fmt.Sprintf("mailbox message not found: %s", messageID)}
	}
	if message.Status != resourceMessageQueued {
		return resourceMailboxMessage{}, &resourceAPIError{Code: "message_not_waiting", Message: fmt.Sprintf("message %s is not waiting", messageID)}
	}
	_, archived, _, resourceErr := resourceExistsAndArchived(workspace.Path, message.ResourceID)
	if resourceErr != nil {
		return resourceMailboxMessage{}, &resourceAPIError{Code: "resource_not_found", Message: resourceErr.Error()}
	}
	if archived {
		return resourceMailboxMessage{}, &resourceAPIError{Code: "resource_archived", Message: fmt.Sprintf("resource %s is archived", message.ResourceID)}
	}
	run, runFound, err := currentResourceGeneration(workspace.Path, message.ResourceID)
	if err != nil {
		return resourceMailboxMessage{}, err
	}
	if !runFound || run.ReplacementPending || strings.TrimSpace(run.AgentHubSessionID) == "" {
		return resourceMailboxMessage{}, &resourceAPIError{Code: "steer_unavailable", Message: "the target task does not have an active steer-capable turn"}
	}
	_, client, err := m.agentHubRuntimeConfig()
	if err != nil {
		return resourceMailboxMessage{}, &resourceAPIError{Code: "steer_unavailable", Message: err.Error()}
	}
	session, err := client.GetSession(ctx, run.AgentHubSessionID)
	if err != nil {
		return resourceMailboxMessage{}, &resourceAPIError{Code: "steer_unavailable", Message: err.Error()}
	}
	active := session.State == "running" || session.State == "waiting_approval"
	if !active || !session.InputCapabilities.Steer {
		return resourceMailboxMessage{}, &resourceAPIError{Code: "steer_unavailable", Message: "the target task does not have an active steer-capable turn"}
	}
	now := time.Now().Format(time.RFC3339Nano)
	message, err = updateMailboxMessage(workspace.Path, message.ID, func(current *resourceMailboxMessage) {
		current.ActualMode = resourceMessageModeSteer
		current.ModeFrozen = true
		current.DowngradeReason = ""
		current.PromotedAt = now
		current.LastError = ""
		current.LastErrorCode = ""
	})
	if err != nil {
		return resourceMailboxMessage{}, err
	}
	return message, nil
}

func (m *agentManager) reconcileResourceMailboxLocked(ctx context.Context, workspace guiWorkspace, resourceID string) error {
	resourceID = normalizedResourceID(resourceID)
	_, archived, _, resourceErr := resourceExistsAndArchived(workspace.Path, resourceID)
	if resourceErr != nil {
		return resourceErr
	}
	if archived {
		mailbox, mailboxErr := loadHotResourceMailbox(workspace.Path, resourceID)
		if mailboxErr != nil {
			return mailboxErr
		}
		pending, next := legacyMailboxFacts(mailbox, resourceID, nil)
		plan := PlanGeneration(GenerationLifecycleFacts{
			ResourceID: resourceID, ResourceArchived: true, MailboxPending: pending, NextMessage: next,
		})
		if plan.Operation == GenerationOperationFinalizeArchivedMailbox {
			return markResourceMailboxArchived(workspace.Path, resourceID)
		}
		return nil
	}
	for iteration := 0; iteration < 32; iteration++ {
		mailbox, err := loadHotResourceMailbox(workspace.Path, resourceID)
		if err != nil {
			return err
		}
		message, found := selectPendingMailboxMessage(mailbox, resourceID)
		if !found {
			return nil
		}
		var run agentRun
		var rt *agentRuntime
		var client *agentHubClient
		if message.GenerationID != "" && (message.Status == resourceMessageDelivering || message.Status == resourceMessageInterrupting) {
			associated, associatedFound, associatedErr := runByGenerationID(workspace.Path, message.GenerationID)
			if associatedErr != nil {
				return associatedErr
			}
			if associatedFound {
				run = associated
				_, client, err = m.agentHubRuntimeConfig()
				if err != nil {
					return err
				}
				rt = m.ensureRuntime(workspace, run, client)
			}
		}
		if rt == nil {
			run, rt, client, err = m.ensureMailboxGeneration(ctx, workspace, resourceID)
			if err != nil {
				recordMailboxFailure(workspace.Path, message.ID, err)
				return err
			}
		}
		// Automatic sleep owns the old generation until Stop has been
		// confirmed and Archive has completed. A message accepted after the
		// irreversible boundary remains in the Workspace mailbox; it must not
		// be sent to the stopping/stopped Session or create a second generation
		// beside it.
		if run.IdleSleepStopRequested || resourceGenerationLifecyclePending(run) {
			return nil
		}
		if run.ReplacementPending && message.Status == resourceMessageQueued {
			if message.RequestedMode == resourceMessageModeSteer {
				_, err = updateMailboxMessage(workspace.Path, message.ID, func(current *resourceMailboxMessage) {
					current.ActualMode = resourceMessageModeEnqueue
					current.ModeFrozen = true
					current.DowngradeReason = resourceMessageReasonGenerationReplacing
				})
				if err != nil {
					return err
				}
			}
			// A fresh interrupt must still stop the old active Turn. Once that
			// has happened, or for every other mode, mailbox ownership waits for
			// the replacement generation and never delivers into the old one.
			if message.RequestedMode != resourceMessageModeInterrupt || message.InterruptAt != "" {
				return nil
			}
		}
		session, err := client.GetSession(ctx, run.AgentHubSessionID)
		if err != nil {
			recordMailboxFailure(workspace.Path, message.ID, err)
			return err
		}
		rt.applyAgentHubSessionState(m, session)
		active := session.State == "running" || session.State == "waiting_approval"
		lifecyclePlan := PlanGeneration(AdaptLegacyGenerationFacts(LegacyGenerationLifecycleInput{
			Run: run, Session: &session, Mailbox: mailbox, Now: m.resourceNow(), Revision: run.UpdatedAt,
		}))
		switch lifecyclePlan.Operation {
		case GenerationOperationStopSession, GenerationOperationWaitForStopped, GenerationOperationArchiveSession,
			GenerationOperationRetireGeneration, GenerationOperationWaitForSession:
			return nil
		}

		if message.Status == resourceMessageInterrupting {
			if active && session.CurrentTurnID == message.InterruptTurnID {
				if !mailboxAttemptDue(message, 5*time.Second) {
					return nil
				}
				attempted, persistErr := updateMailboxMessage(workspace.Path, message.ID, func(current *resourceMailboxMessage) {
					current.AttemptCount++
					current.LastAttemptAt = time.Now().Format(time.RFC3339Nano)
					current.LastError = ""
					current.LastErrorCode = ""
				})
				if persistErr != nil {
					return persistErr
				}
				_ = attempted
				interrupted, interruptErr := client.Interrupt(ctx, session.ID)
				if interruptErr != nil {
					recordMailboxFailure(workspace.Path, message.ID, interruptErr)
					return interruptErr
				}
				stillCurrent, guardErr := legacyLifecyclePlanStillCurrent(workspace, lifecyclePlan, &interrupted)
				if guardErr != nil {
					return guardErr
				}
				if !stillCurrent {
					return nil
				}
				rt.applyAgentHubSessionState(m, interrupted)
				session = interrupted
				active = session.State == "running" || session.State == "waiting_approval"
			}
			if active {
				return nil
			}
			message, err = updateMailboxMessage(workspace.Path, message.ID, func(current *resourceMailboxMessage) {
				current.Status = resourceMessageQueued
				current.InterruptAt = time.Now().Format(time.RFC3339Nano)
				current.LastError = ""
				current.LastErrorCode = ""
			})
			if err != nil {
				return err
			}
			if run.ReplacementPending {
				return nil
			}
		}

		if message.Status == resourceMessageQueued && !message.ModeFrozen {
			switch message.RequestedMode {
			case resourceMessageModeInterrupt:
				if message.InterruptAt != "" {
					break
				}
				if run.ReplacementPending && !active {
					_, err = updateMailboxMessage(workspace.Path, message.ID, func(current *resourceMailboxMessage) {
						current.ActualMode = resourceMessageModeEnqueue
						current.ModeFrozen = true
						current.DowngradeReason = resourceMessageReasonGenerationReplacing
					})
					if err != nil {
						return err
					}
					return nil
				}
				if active {
					message, err = updateMailboxMessage(workspace.Path, message.ID, func(current *resourceMailboxMessage) {
						current.ActualMode = resourceMessageModeInterrupt
						current.ModeFrozen = true
						current.Status = resourceMessageInterrupting
						current.GenerationID = run.GenerationID
						current.AgentHubSessionID = session.ID
						current.InterruptTurnID = session.CurrentTurnID
						current.AttemptCount++
						current.LastAttemptAt = time.Now().Format(time.RFC3339Nano)
						current.LastError = ""
						current.LastErrorCode = ""
					})
					if err != nil {
						return err
					}
					interrupted, interruptErr := client.Interrupt(ctx, session.ID)
					if interruptErr != nil {
						recordMailboxFailure(workspace.Path, message.ID, interruptErr)
						return interruptErr
					}
					stillCurrent, guardErr := legacyLifecyclePlanStillCurrent(workspace, lifecyclePlan, &interrupted)
					if guardErr != nil {
						return guardErr
					}
					if !stillCurrent {
						return nil
					}
					rt.applyAgentHubSessionState(m, interrupted)
					continue
				}
				message, err = updateMailboxMessage(workspace.Path, message.ID, func(current *resourceMailboxMessage) {
					current.ActualMode = resourceMessageModeEnqueue
					current.ModeFrozen = true
					current.DowngradeReason = resourceMessageReasonNoActiveTurn
				})
			case resourceMessageModeSteer:
				if active && session.InputCapabilities.Steer {
					message, err = updateMailboxMessage(workspace.Path, message.ID, func(current *resourceMailboxMessage) {
						current.ActualMode = resourceMessageModeSteer
						current.ModeFrozen = true
						current.DowngradeReason = ""
					})
				} else {
					reason := resourceMessageReasonNoActiveTurn
					if active {
						reason = resourceMessageReasonSteerUnsupported
					}
					message, err = updateMailboxMessage(workspace.Path, message.ID, func(current *resourceMailboxMessage) {
						current.ActualMode = resourceMessageModeEnqueue
						current.ModeFrozen = true
						current.DowngradeReason = reason
					})
				}
			case resourceMessageModeEnqueue:
				message, err = updateMailboxMessage(workspace.Path, message.ID, func(current *resourceMailboxMessage) {
					current.ActualMode = resourceMessageModeEnqueue
					current.ModeFrozen = true
					current.DowngradeReason = ""
				})
			}
			if err != nil {
				return err
			}
		}

		if message.Status != resourceMessageDelivering && active && message.ActualMode != resourceMessageModeSteer {
			return nil
		}
		if message.Status != resourceMessageDelivering && session.State != "ready" && message.ActualMode != resourceMessageModeSteer {
			return nil
		}
		deliveryPlan := lifecyclePlan
		message, err = updateMailboxMessage(workspace.Path, message.ID, func(current *resourceMailboxMessage) {
			current.Status = resourceMessageDelivering
			current.GenerationID = run.GenerationID
			current.AgentHubSessionID = session.ID
			current.TurnID = session.CurrentTurnID
			current.AttemptCount++
			current.LastAttemptAt = time.Now().Format(time.RFC3339Nano)
			current.LastError = ""
			current.LastErrorCode = ""
		})
		if err != nil {
			return err
		}
		delivered, deliveryErr := client.Message(ctx, session.ID, agentHubInboundMessage{
			Text: message.Text, Role: message.Role, Sender: message.Sender,
			Steer: message.ActualMode == resourceMessageModeSteer, MessageID: message.ID,
		})
		if deliveryErr != nil {
			stillCurrent, guardErr := legacyLifecyclePlanStillCurrent(workspace, deliveryPlan, &session)
			if guardErr != nil {
				return guardErr
			}
			if !stillCurrent {
				return nil
			}
			var deliveryAPIError *agentHubAPIError
			conflict := errors.As(deliveryErr, &deliveryAPIError) && deliveryAPIError.StatusCode == http.StatusConflict &&
				strings.Contains(deliveryAPIError.Message, "message id conflicts with an existing input")
			var canonical agentHubInboundMessage
			var canonicalFound bool
			var canonicalErr error
			if conflict {
				canonical, canonicalFound, canonicalErr = findCanonicalAgentHubMessage(ctx, client, session.ID, message)
			}
			if canonicalErr == nil && canonicalFound {
				stillCurrent, guardErr := legacyLifecyclePlanStillCurrent(workspace, deliveryPlan, &session)
				if guardErr != nil {
					return guardErr
				}
				if !stillCurrent {
					return nil
				}
				_, persistErr := updateMailboxMessage(workspace.Path, message.ID, func(current *resourceMailboxMessage) {
					current.Status = resourceMessageDelivered
					current.DeliveredAt = time.Now().Format(time.RFC3339Nano)
					current.TerminalAt = current.DeliveredAt
					current.LastError = ""
					current.LastErrorCode = ""
					if canonical.Steer {
						current.ActualMode = resourceMessageModeSteer
					} else {
						current.ActualMode = resourceMessageModeEnqueue
						if current.RequestedMode == resourceMessageModeSteer && current.DowngradeReason == "" {
							current.DowngradeReason = resourceMessageReasonRecoveredCanonical
						}
					}
				})
				if persistErr != nil {
					return persistErr
				}
				continue
			}
			if canonicalErr != nil {
				deliveryErr = fmt.Errorf("%w; inspect canonical input: %v", deliveryErr, canonicalErr)
			}
			recordMailboxFailure(workspace.Path, message.ID, deliveryErr)
			return deliveryErr
		}
		stillCurrent, guardErr := legacyLifecyclePlanStillCurrent(workspace, deliveryPlan, &delivered)
		if guardErr != nil {
			return guardErr
		}
		if !stillCurrent {
			return nil
		}
		_, err = updateMailboxMessage(workspace.Path, message.ID, func(current *resourceMailboxMessage) {
			current.Status = resourceMessageDelivered
			current.DeliveredAt = time.Now().Format(time.RFC3339Nano)
			current.TerminalAt = current.DeliveredAt
			current.TurnID = delivered.CurrentTurnID
			current.LastError = ""
			current.LastErrorCode = ""
		})
		if err != nil {
			return err
		}
		rt.applyAgentHubSessionState(m, delivered)
		if delivered.State == "running" || delivered.State == "waiting_approval" {
			// More eligible steer inputs may enter this Turn; enqueue inputs wait.
			continue
		}
	}
	return errors.New("resource mailbox reconciliation exceeded its bounded iteration limit")
}

func (m *agentManager) reconcileWorkspaceMailboxes(ctx context.Context, workspace guiWorkspace) error {
	if err := migrateLegacyResourceMailbox(workspace.Path); err != nil {
		return err
	}
	hotMailboxes, err := loadAllHotResourceMailboxes(workspace.Path)
	if err != nil {
		return err
	}
	resources := make(map[string]bool)
	for _, mailbox := range hotMailboxes {
		for _, message := range mailbox.Messages {
			if message.Status == resourceMessageQueued || message.Status == resourceMessageDelivering || message.Status == resourceMessageInterrupting {
				resources[normalizedResourceID(message.ResourceID)] = true
			}
		}
	}
	ids := make([]string, 0, len(resources))
	for id := range resources {
		ids = append(ids, id)
	}
	sort.Strings(ids)
	type result struct {
		resourceID string
		err        error
	}
	results := make(chan result, len(ids))
	for _, id := range ids {
		resourceID := id
		go func() {
			err := m.withResourceController(ctx, workspace, resourceID, func() error {
				return m.reconcileResourceMailboxLocked(ctx, workspace, resourceID)
			})
			results <- result{resourceID: resourceID, err: err}
		}()
	}
	var failures []string
	for range ids {
		outcome := <-results
		if outcome.err != nil {
			failures = append(failures, fmt.Sprintf("%s: %v", outcome.resourceID, outcome.err))
		}
	}
	sort.Strings(failures)
	if len(failures) > 0 {
		return errors.New(strings.Join(failures, "; "))
	}
	return nil
}

func resourceErrorStatus(err error) int {
	var apiErr *resourceAPIError
	if !errors.As(err, &apiErr) {
		return http.StatusInternalServerError
	}
	switch apiErr.Code {
	case "invalid_request", "invalid_history_cursor", "invalid_history_reference":
		return http.StatusBadRequest
	case "resource_not_found", "message_not_found", "history_reference_not_found", "history_turn_not_found", "history_event_not_found", "session_missing":
		return http.StatusNotFound
	case "message_receipt_expired":
		return http.StatusGone
	case "resource_archived", "message_not_waiting", "steer_unavailable", "generation_unavailable", "generation_changed", "active_turn":
		return http.StatusConflict
	case "workspace_not_owned":
		return http.StatusConflict
	case "binding_unavailable":
		return http.StatusUnprocessableEntity
	case "temporarily_undeliverable", "history_unavailable":
		return http.StatusServiceUnavailable
	case "message_conflict":
		return http.StatusConflict
	default:
		return http.StatusInternalServerError
	}
}

func (m *agentManager) handleResourceStatus(w http.ResponseWriter, r *http.Request, workspaceID, resourceID string) {
	workspace, err := m.server.workspace(workspaceID)
	if err != nil {
		writeError(w, &resourceAPIError{Code: "workspace_not_owned", Message: err.Error()}, http.StatusNotFound)
		return
	}
	resourceID = normalizedResourceID(resourceID)
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	var status resourceStatusResponse
	statusErr := m.withResourceController(r.Context(), workspace, resourceID, func() error {
		var err error
		status, err = m.resourceStatus(r.Context(), workspace, resourceID)
		return err
	})
	if statusErr != nil {
		writeError(w, statusErr, resourceErrorStatus(statusErr))
		return
	}
	writeJSON(w, status)
}

func (m *agentManager) handleResourceMessages(w http.ResponseWriter, r *http.Request, workspaceID, resourceID string) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	workspace, err := m.server.workspace(workspaceID)
	if err != nil {
		writeError(w, &resourceAPIError{Code: "workspace_not_owned", Message: err.Error()}, http.StatusNotFound)
		return
	}
	var request resourceMessageRequest
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(&request); err != nil {
		writeError(w, &resourceAPIError{Code: "invalid_request", Message: err.Error()}, http.StatusBadRequest)
		return
	}
	resourceID = normalizedResourceID(resourceID)
	var message resourceMailboxMessage
	sendErr := m.withResourceController(r.Context(), workspace, resourceID, func() error {
		var err error
		message, err = m.acceptResourceMessageDurable(r.Context(), workspace, resourceID, request)
		return err
	})
	if sendErr != nil {
		writeError(w, sendErr, resourceErrorStatus(sendErr))
		return
	}
	if wakeErr := m.enqueueResourceController(workspace, resourceID, func() error {
		if err := m.reconcileResourceMailboxLocked(context.Background(), workspace, resourceID); err != nil {
			recordMailboxFailure(workspace.Path, message.ID, err)
		}
		return nil
	}); wakeErr != nil {
		recordMailboxFailure(workspace.Path, message.ID, wakeErr)
	}
	response := mailboxMessageResponse(message)
	response.Reference = fmt.Sprintf("/api/workspaces/%s/messages/%s", workspaceID, message.ID)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusAccepted)
	_ = json.NewEncoder(w).Encode(response)
}

func (m *agentManager) handleResourceMessage(w http.ResponseWriter, r *http.Request, workspaceID, messageID string) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	workspace, err := m.server.workspace(workspaceID)
	if err != nil {
		writeError(w, &resourceAPIError{Code: "workspace_not_owned", Message: err.Error()}, http.StatusNotFound)
		return
	}
	if err := migrateLegacyResourceMailbox(workspace.Path); err != nil {
		writeError(w, err, http.StatusInternalServerError)
		return
	}
	message, found, err := mailboxMessageByID(workspace.Path, messageID)
	if err != nil {
		writeError(w, err, resourceErrorStatus(err))
		return
	}
	if !found {
		notFound := &resourceAPIError{Code: "message_not_found", Message: fmt.Sprintf("mailbox message not found: %s", messageID)}
		writeError(w, notFound, http.StatusNotFound)
		return
	}
	response := mailboxMessageResponse(message)
	response.Reference = fmt.Sprintf("/api/workspaces/%s/messages/%s", workspaceID, message.ID)
	writeJSON(w, response)
}

func (m *agentManager) handleResourceMessageSteer(w http.ResponseWriter, r *http.Request, workspaceID, messageID string) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	workspace, err := m.server.workspace(workspaceID)
	if err != nil {
		writeError(w, &resourceAPIError{Code: "workspace_not_owned", Message: err.Error()}, http.StatusNotFound)
		return
	}
	message, promoteErr := m.promoteWaitingMessage(r.Context(), workspace, messageID)
	if promoteErr != nil {
		writeError(w, promoteErr, resourceErrorStatus(promoteErr))
		return
	}
	response := mailboxMessageResponse(message)
	response.Reference = fmt.Sprintf("/api/workspaces/%s/messages/%s", workspaceID, message.ID)
	if message.Status != resourceMessageDelivered {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusAccepted)
		_ = json.NewEncoder(w).Encode(response)
		return
	}
	writeJSON(w, response)
}
