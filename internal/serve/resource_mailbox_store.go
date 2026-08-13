package serve

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"time"
)

const (
	resourceMailboxStoreVersion     = 1
	resourceMailboxMigrationVersion = 1
	resourceMailboxExpiredState     = "expired"
)

// These are variables so focused tests can shrink the retention window without
// changing the production contract.
var (
	resourceMailboxReceiptRetentionCount  = 2048
	resourceMailboxReceiptRetentionWindow = 7 * 24 * time.Hour
	resourceMailboxExpiredRetentionCount  = 2048
	resourceMailboxExpiredRetentionWindow = 30 * 24 * time.Hour
)

type resourceMailboxStore struct {
	ResourceID  string
	InstanceID  string
	ResourceKey string
	Directory   string
	Mailbox     resourceMailbox
	Receipts    resourceMailboxReceiptDocument
	Outbox      resourceMailboxOutboxDocument
	Scheduler   resourceSchedulerCheckpoint
}

type resourceMailboxHotDocument struct {
	Version      int                      `json:"version"`
	ResourceID   string                   `json:"resourceId"`
	NextSequence uint64                   `json:"nextSequence"`
	Messages     []resourceMailboxMessage `json:"messages"`
}

type resourceMailboxReceiptDocument struct {
	Version    int                           `json:"version"`
	ResourceID string                        `json:"resourceId"`
	Receipts   []resourceMailboxReceipt      `json:"receipts"`
	Expired    []resourceMailboxExpiredEntry `json:"expired,omitempty"`
}

type resourceMailboxReceipt struct {
	ID                        string                       `json:"id"`
	Sequence                  uint64                       `json:"sequence"`
	ResourceID                string                       `json:"resourceId"`
	Role                      string                       `json:"role,omitempty"`
	Sender                    *agentHubMessageSender       `json:"sender,omitempty"`
	SenderWorkspaceInstanceID string                       `json:"senderWorkspaceInstanceId,omitempty"`
	SubscribeResult           bool                         `json:"subscribeResult"`
	ResultSubscriptionStatus  string                       `json:"resultSubscriptionStatus,omitempty"`
	ResultOperationID         string                       `json:"resultOperationId,omitempty"`
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
	TurnTerminalAt            string                       `json:"turnTerminalAt,omitempty"`
	GenerationID              string                       `json:"generationId,omitempty"`
	AgentHubSessionID         string                       `json:"agentHubSessionId,omitempty"`
	TurnID                    string                       `json:"turnId,omitempty"`
	InterruptTurnID           string                       `json:"interruptTurnId,omitempty"`
	InterruptAt               string                       `json:"interruptAt,omitempty"`
	PromotedAt                string                       `json:"promotedAt,omitempty"`
	LastError                 string                       `json:"lastError,omitempty"`
	LastErrorCode             string                       `json:"lastErrorCode,omitempty"`
	subscribeResultPresent    bool
}

// UnmarshalJSON applies the pre-subscribeResult default to old receipt files
// while retaining an explicitly persisted false value.
func (receipt *resourceMailboxReceipt) UnmarshalJSON(data []byte) error {
	type mailboxReceiptAlias resourceMailboxReceipt
	var decoded mailboxReceiptAlias
	if err := json.Unmarshal(data, &decoded); err != nil {
		return err
	}
	var fields map[string]json.RawMessage
	if err := json.Unmarshal(data, &fields); err != nil {
		return err
	}
	_, present := fields["subscribeResult"]
	decoded.subscribeResultPresent = present
	if !present {
		decoded.SubscribeResult = true
	}
	if decoded.Role == "system" {
		decoded.SubscribeResult = false
		decoded.ResultSubscriptionStatus = resourceResultSubscriptionDisabled
	}
	message := mailboxMessageFromReceipt(resourceMailboxReceipt(decoded))
	normalizeLegacyMailboxMessage(&message)
	decoded.Type = message.Type
	decoded.Causation = cloneMailboxCausation(message.Causation)
	decoded.Notification = cloneNotificationReceipt(message.Notification)
	*receipt = resourceMailboxReceipt(decoded)
	return nil
}

type resourceMailboxExpiredEntry struct {
	ID        string `json:"id"`
	ExpiredAt string `json:"expiredAt"`
}

type resourceMailboxOutboxDocument struct {
	Version    int                             `json:"version"`
	ResourceID string                          `json:"resourceId"`
	Operations []resourceMailboxNotificationOp `json:"operations"`
}

// resourceMailboxNotificationOp intentionally keeps the generated body only
// while a notification is pending. Once the target accepts it, the source
// receipt retains only the diagnostic fields needed to inspect the outcome.
type resourceMailboxNotificationOp struct {
	ID                        string                    `json:"id"`
	Type                      string                    `json:"type"`
	SourceMessageID           string                    `json:"sourceMessageId"`
	SourceMessageIDs          []string                  `json:"sourceMessageIds,omitempty"`
	SourceResourceID          string                    `json:"sourceResourceId"`
	SourceWorkspaceInstanceID string                    `json:"sourceWorkspaceInstanceId"`
	TargetWorkspaceInstanceID string                    `json:"targetWorkspaceInstanceId"`
	TargetResourceID          string                    `json:"targetResourceId"`
	GeneratedMessageID        string                    `json:"generatedMessageId"`
	GeneratedText             string                    `json:"generatedText,omitempty"`
	GeneratedSender           *agentHubMessageSender    `json:"generatedSender,omitempty"`
	GeneratedCausation        *resourceMessageCausation `json:"generatedCausation,omitempty"`
	Status                    string                    `json:"status"`
	AcceptedAt                string                    `json:"acceptedAt,omitempty"`
	UpdatedAt                 string                    `json:"updatedAt"`
	DeliveredAt               string                    `json:"deliveredAt,omitempty"`
	TerminalAt                string                    `json:"terminalAt,omitempty"`
	DeliveryStatus            string                    `json:"deliveryStatus,omitempty"`
	LastError                 string                    `json:"lastError,omitempty"`
	LastErrorCode             string                    `json:"lastErrorCode,omitempty"`
	GenerationID              string                    `json:"generationId,omitempty"`
	TurnID                    string                    `json:"turnId,omitempty"`
	TurnReference             string                    `json:"turnReference,omitempty"`
	TurnStatus                string                    `json:"turnStatus,omitempty"`
	HistoryUnavailable        bool                      `json:"historyUnavailable,omitempty"`
}

type resourceSchedulerCheckpoint struct {
	Version            int    `json:"version"`
	ResourceID         string `json:"resourceId"`
	LastTickMessageID  string `json:"lastTickMessageId,omitempty"`
	GenerationID       string `json:"generationId,omitempty"`
	AgentHubSessionID  string `json:"agentHubSessionId,omitempty"`
	TurnID             string `json:"turnId,omitempty"`
	ConfigDigest       string `json:"configDigest,omitempty"`
	Reason             string `json:"reason,omitempty"`
	AcceptedAt         string `json:"acceptedAt,omitempty"`
	DeliveryTerminalAt string `json:"deliveryTerminalAt,omitempty"`
	TurnTerminalAt     string `json:"turnTerminalAt,omitempty"`
	TurnStatus         string `json:"turnStatus,omitempty"`
}

type resourceMailboxMeta struct {
	Version     int    `json:"version"`
	InstanceID  string `json:"instanceId"`
	ResourceID  string `json:"resourceId"`
	ResourceKey string `json:"resourceKey"`
}

type resourceMailboxMigrationMarker struct {
	Version        int    `json:"version"`
	Status         string `json:"status"`
	CommittedAt    string `json:"committedAt"`
	SourceVersions []int  `json:"sourceVersions,omitempty"`
}

type resourceMailboxLocator struct {
	Version     int    `json:"version"`
	MessageID   string `json:"messageId"`
	ResourceID  string `json:"resourceId"`
	ResourceKey string `json:"resourceKey"`
	State       string `json:"state"`
	UpdatedAt   string `json:"updatedAt"`
}

type resourceMailboxTxn struct {
	Version       int    `json:"version"`
	HotTemp       string `json:"hotTemp"`
	ReceiptTemp   string `json:"receiptTemp"`
	OutboxTemp    string `json:"outboxTemp"`
	SchedulerTemp string `json:"schedulerTemp"`
}

var (
	resourceMailboxLocks       sync.Map
	resourceMailboxMigrationMu sync.Mutex
	resourceMailboxAggregateMu sync.Mutex
)

func resourceMailboxResourcesRoot(workspacePath string) string {
	return filepath.Join(agentRoot(workspacePath), "resources")
}

func resourceMailboxMigrationPath(workspacePath string) string {
	return filepath.Join(resourceMailboxResourcesRoot(workspacePath), ".mailbox-migration.json")
}

func resourceMailboxLocatorRoot(workspacePath string) string {
	return filepath.Join(resourceMailboxResourcesRoot(workspacePath), ".message-locations")
}

func mailboxInstanceID(workspacePath string) string {
	if instanceID, err := workspaceInstanceID(workspacePath); err == nil && strings.TrimSpace(instanceID) != "" {
		return strings.TrimSpace(instanceID)
	}
	abs, err := filepath.Abs(workspacePath)
	if err != nil {
		abs = workspacePath
	}
	sum := sha256.Sum256([]byte("uninitialized:" + filepath.Clean(abs)))
	return "uninitialized-" + hex.EncodeToString(sum[:8])
}

func resourceMailboxKey(instanceID, resourceID string) string {
	sum := sha256.Sum256([]byte(strings.TrimSpace(instanceID) + "\x00" + normalizedResourceID(resourceID)))
	return hex.EncodeToString(sum[:])
}

func resourceMailboxDirectory(workspacePath, resourceID string) (string, string, string, error) {
	instanceID := mailboxInstanceID(workspacePath)
	resourceID = normalizedResourceID(resourceID)
	key := resourceMailboxKey(instanceID, resourceID)
	return filepath.Join(resourceMailboxResourcesRoot(workspacePath), key), instanceID, key, nil
}

func resourceMailboxHotPath(directory string) string { return filepath.Join(directory, "hot.json") }
func resourceMailboxReceiptPath(directory string) string {
	return filepath.Join(directory, "receipts.json")
}
func resourceMailboxOutboxPath(directory string) string {
	return filepath.Join(directory, "outbox.json")
}
func resourceMailboxSchedulerPath(directory string) string {
	return filepath.Join(directory, "scheduler.json")
}
func resourceMailboxMetaPath(directory string) string { return filepath.Join(directory, "meta.json") }
func resourceMailboxTxnPath(directory string) string  { return filepath.Join(directory, "commit.json") }

func resourceMailboxLocatorPath(workspacePath, messageID string) string {
	sum := sha256.Sum256([]byte(strings.TrimSpace(messageID)))
	return filepath.Join(resourceMailboxLocatorRoot(workspacePath), hex.EncodeToString(sum[:])+".json")
}

func resourceMailboxLock(workspacePath, resourceID string) *sync.Mutex {
	key := workspacePath + "\x00" + normalizedResourceID(resourceID)
	value, _ := resourceMailboxLocks.LoadOrStore(key, &sync.Mutex{})
	return value.(*sync.Mutex)
}

func syncResourceMailboxDirectory(path string) error {
	directory, err := os.Open(path)
	if err != nil {
		return err
	}
	if err := directory.Sync(); err != nil {
		_ = directory.Close()
		return err
	}
	return directory.Close()
}

func writeResourceMailboxFile(path string, data []byte, mode os.FileMode) error {
	if err := os.MkdirAll(filepath.Dir(path), 0o700); err != nil {
		return err
	}
	tmp := path + "." + newRunID() + ".tmp"
	file, err := os.OpenFile(tmp, os.O_CREATE|os.O_EXCL|os.O_WRONLY, mode)
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
	return syncResourceMailboxDirectory(filepath.Dir(path))
}

func readResourceMailboxJSON(path string, target any) (bool, error) {
	data, err := os.ReadFile(path)
	if os.IsNotExist(err) {
		return false, nil
	}
	if err != nil {
		return false, err
	}
	if err := json.Unmarshal(data, target); err != nil {
		return false, fmt.Errorf("read %s: %w", path, err)
	}
	return true, nil
}

func writeResourceMailboxJSON(path string, value any) error {
	data, err := json.MarshalIndent(value, "", "  ")
	if err != nil {
		return err
	}
	data = append(data, '\n')
	return writeResourceMailboxFile(path, data, 0o600)
}

// Locator files are only an acceleration index. The resource documents and
// their commit marker are authoritative, and mailboxMessageByID can rebuild
// the index by scanning the bounded per-resource stores. Keep locator writes
// atomic, but do not add a directory fsync to every mailbox state transition.
func writeResourceMailboxIndexJSON(path string, value any) error {
	data, err := json.MarshalIndent(value, "", "  ")
	if err != nil {
		return err
	}
	data = append(data, '\n')
	if err := os.MkdirAll(filepath.Dir(path), 0o700); err != nil {
		return err
	}
	tmp := path + "." + newRunID() + ".tmp"
	if err := os.WriteFile(tmp, data, 0o600); err != nil {
		return err
	}
	if err := os.Rename(tmp, path); err != nil {
		_ = os.Remove(tmp)
		return err
	}
	return nil
}

func recoverResourceMailboxTransaction(directory string) error {
	var transaction resourceMailboxTxn
	found, err := readResourceMailboxJSON(resourceMailboxTxnPath(directory), &transaction)
	if err != nil || !found {
		return err
	}
	for _, item := range []struct{ temp, final string }{
		{transaction.HotTemp, resourceMailboxHotPath(directory)},
		{transaction.ReceiptTemp, resourceMailboxReceiptPath(directory)},
		{transaction.OutboxTemp, resourceMailboxOutboxPath(directory)},
		{transaction.SchedulerTemp, resourceMailboxSchedulerPath(directory)},
	} {
		if strings.TrimSpace(item.temp) == "" {
			continue
		}
		if _, statErr := os.Stat(item.temp); statErr == nil {
			if renameErr := os.Rename(item.temp, item.final); renameErr != nil {
				return renameErr
			}
		} else if !os.IsNotExist(statErr) {
			return statErr
		}
	}
	if err := os.Remove(resourceMailboxTxnPath(directory)); err != nil && !os.IsNotExist(err) {
		return err
	}
	return syncResourceMailboxDirectory(directory)
}

func cloneNotificationReceipt(receipt *resourceNotificationReceipt) *resourceNotificationReceipt {
	if receipt == nil {
		return nil
	}
	cloned := *receipt
	return &cloned
}

func cloneMailboxCausation(causation *resourceMessageCausation) *resourceMessageCausation {
	if causation == nil {
		return nil
	}
	cloned := *causation
	return &cloned
}

func receiptFromMailboxMessage(message resourceMailboxMessage) resourceMailboxReceipt {
	var sender *agentHubMessageSender
	if message.Sender != nil {
		value := *message.Sender
		sender = &value
	}
	return resourceMailboxReceipt{
		ID: message.ID, Sequence: message.Sequence, ResourceID: normalizedResourceID(message.ResourceID),
		Role: message.Role, Sender: sender, SenderWorkspaceInstanceID: message.SenderWorkspaceInstanceID,
		SubscribeResult: message.SubscribeResult, ResultSubscriptionStatus: message.ResultSubscriptionStatus, ResultOperationID: message.ResultOperationID,
		Type: message.Type, Causation: cloneMailboxCausation(message.Causation), Notification: cloneNotificationReceipt(message.Notification),
		RequestedMode: message.RequestedMode, ActualMode: message.ActualMode, ModeFrozen: message.ModeFrozen,
		DowngradeReason: message.DowngradeReason, Status: message.Status, AcceptedAt: message.AcceptedAt,
		UpdatedAt: message.UpdatedAt, DeliveredAt: message.DeliveredAt, TerminalAt: message.TerminalAt,
		TurnTerminalAt: message.TurnTerminalAt, GenerationID: message.GenerationID,
		AgentHubSessionID: message.AgentHubSessionID, TurnID: message.TurnID, InterruptTurnID: message.InterruptTurnID,
		InterruptAt: message.InterruptAt, PromotedAt: message.PromotedAt, LastError: message.LastError,
		LastErrorCode:          message.LastErrorCode,
		subscribeResultPresent: message.subscribeResultPresent,
	}
}

func mailboxMessageFromReceipt(receipt resourceMailboxReceipt) resourceMailboxMessage {
	var sender *agentHubMessageSender
	if receipt.Sender != nil {
		value := *receipt.Sender
		sender = &value
	}
	return resourceMailboxMessage{
		ID: receipt.ID, Sequence: receipt.Sequence, ResourceID: normalizedResourceID(receipt.ResourceID),
		Role: receipt.Role, Sender: sender, SenderWorkspaceInstanceID: receipt.SenderWorkspaceInstanceID,
		SubscribeResult: receipt.SubscribeResult, ResultSubscriptionStatus: receipt.ResultSubscriptionStatus, ResultOperationID: receipt.ResultOperationID,
		Type: receipt.Type, Causation: cloneMailboxCausation(receipt.Causation), Notification: cloneNotificationReceipt(receipt.Notification),
		RequestedMode: receipt.RequestedMode, ActualMode: receipt.ActualMode, ModeFrozen: receipt.ModeFrozen,
		DowngradeReason: receipt.DowngradeReason, Status: receipt.Status, AcceptedAt: receipt.AcceptedAt,
		UpdatedAt: receipt.UpdatedAt, DeliveredAt: receipt.DeliveredAt, TerminalAt: receipt.TerminalAt,
		TurnTerminalAt: receipt.TurnTerminalAt, GenerationID: receipt.GenerationID,
		AgentHubSessionID: receipt.AgentHubSessionID, TurnID: receipt.TurnID, InterruptTurnID: receipt.InterruptTurnID,
		InterruptAt: receipt.InterruptAt, PromotedAt: receipt.PromotedAt, LastError: receipt.LastError,
		LastErrorCode: receipt.LastErrorCode, receipt: true,
		subscribeResultPresent: receipt.subscribeResultPresent,
	}
}

func cloneMailboxOperation(operation resourceMailboxNotificationOp) resourceMailboxNotificationOp {
	cloned := operation
	cloned.SourceMessageIDs = append([]string(nil), operation.SourceMessageIDs...)
	if operation.GeneratedSender != nil {
		value := *operation.GeneratedSender
		cloned.GeneratedSender = &value
	}
	cloned.GeneratedCausation = cloneMailboxCausation(operation.GeneratedCausation)
	return cloned
}

func mailboxOperationSourceIDs(operation resourceMailboxNotificationOp) []string {
	ids := make([]string, 0, 1+len(operation.SourceMessageIDs))
	seen := make(map[string]bool, 1+len(operation.SourceMessageIDs))
	appendID := func(value string) {
		value = strings.TrimSpace(value)
		if value == "" || seen[value] {
			return
		}
		seen[value] = true
		ids = append(ids, value)
	}
	appendID(operation.SourceMessageID)
	for _, value := range operation.SourceMessageIDs {
		appendID(value)
	}
	return ids
}

func mailboxOperationHasSource(operation resourceMailboxNotificationOp, messageID string) bool {
	messageID = strings.TrimSpace(messageID)
	if messageID == "" {
		return false
	}
	for _, sourceID := range mailboxOperationSourceIDs(operation) {
		if sourceID == messageID {
			return true
		}
	}
	return false
}

func normalizeMailboxOperationSources(operation *resourceMailboxNotificationOp) {
	ids := mailboxOperationSourceIDs(*operation)
	operation.SourceMessageIDs = ids
	if len(ids) > 0 {
		operation.SourceMessageID = ids[0]
	}
}

func cloneResourceMailboxReceipt(receipt resourceMailboxReceipt) resourceMailboxReceipt {
	return receiptFromMailboxMessage(mailboxMessageFromReceipt(receipt))
}

func cloneResourceMailboxStore(store resourceMailboxStore) resourceMailboxStore {
	cloned := store
	cloned.Mailbox.Messages = make([]resourceMailboxMessage, 0, len(store.Mailbox.Messages))
	for _, message := range store.Mailbox.Messages {
		cloned.Mailbox.Messages = append(cloned.Mailbox.Messages, cloneMailboxMessage(message))
	}
	cloned.Receipts.Receipts = make([]resourceMailboxReceipt, 0, len(store.Receipts.Receipts))
	for _, receipt := range store.Receipts.Receipts {
		cloned.Receipts.Receipts = append(cloned.Receipts.Receipts, cloneResourceMailboxReceipt(receipt))
	}
	cloned.Receipts.Expired = append([]resourceMailboxExpiredEntry(nil), store.Receipts.Expired...)
	cloned.Outbox.Operations = make([]resourceMailboxNotificationOp, 0, len(store.Outbox.Operations))
	for _, operation := range store.Outbox.Operations {
		cloned.Outbox.Operations = append(cloned.Outbox.Operations, cloneMailboxOperation(operation))
	}
	return cloned
}

func defaultResourceMailboxStore(workspacePath, resourceID string) resourceMailboxStore {
	directory, instanceID, key, _ := resourceMailboxDirectory(workspacePath, resourceID)
	resourceID = normalizedResourceID(resourceID)
	return resourceMailboxStore{
		ResourceID: resourceID, InstanceID: instanceID, ResourceKey: key, Directory: directory,
		Mailbox:   resourceMailbox{Version: resourceMailboxVersion, Messages: []resourceMailboxMessage{}},
		Receipts:  resourceMailboxReceiptDocument{Version: resourceMailboxStoreVersion, ResourceID: resourceID, Receipts: []resourceMailboxReceipt{}, Expired: []resourceMailboxExpiredEntry{}},
		Outbox:    resourceMailboxOutboxDocument{Version: resourceMailboxStoreVersion, ResourceID: resourceID, Operations: []resourceMailboxNotificationOp{}},
		Scheduler: resourceSchedulerCheckpoint{Version: resourceMailboxStoreVersion, ResourceID: resourceID},
	}
}

func loadResourceMailboxStoreInternal(workspacePath, resourceID string) (resourceMailboxStore, error) {
	store := defaultResourceMailboxStore(workspacePath, resourceID)
	if _, err := os.Stat(store.Directory); os.IsNotExist(err) {
		return store, nil
	} else if err != nil {
		return store, err
	}
	if err := recoverResourceMailboxTransaction(store.Directory); err != nil {
		return store, fmt.Errorf("recover mailbox store %s: %w", store.ResourceID, err)
	}
	var meta resourceMailboxMeta
	if found, err := readResourceMailboxJSON(resourceMailboxMetaPath(store.Directory), &meta); err != nil {
		return store, err
	} else if found {
		if meta.Version != resourceMailboxStoreVersion || meta.ResourceID != store.ResourceID || meta.InstanceID != store.InstanceID {
			return store, fmt.Errorf("resource mailbox metadata mismatch for %s", store.ResourceID)
		}
	}
	var hot resourceMailboxHotDocument
	if found, err := readResourceMailboxJSON(resourceMailboxHotPath(store.Directory), &hot); err != nil {
		return store, err
	} else if found {
		if hot.Version != resourceMailboxStoreVersion {
			return store, fmt.Errorf("unsupported hot mailbox version %d", hot.Version)
		}
		store.Mailbox.NextSequence = hot.NextSequence
		for _, message := range hot.Messages {
			message.ResourceID = normalizedResourceID(message.ResourceID)
			message.receipt = false
			normalizeStoredMailboxMessage(&message)
			store.Mailbox.Messages = append(store.Mailbox.Messages, cloneMailboxMessage(message))
			if message.Sequence > store.Mailbox.NextSequence {
				store.Mailbox.NextSequence = message.Sequence
			}
		}
	}
	if found, err := readResourceMailboxJSON(resourceMailboxReceiptPath(store.Directory), &store.Receipts); err != nil {
		return store, err
	} else if found {
		if store.Receipts.Version != resourceMailboxStoreVersion {
			return store, fmt.Errorf("unsupported receipt store version %d", store.Receipts.Version)
		}
		if store.Receipts.Receipts == nil {
			store.Receipts.Receipts = []resourceMailboxReceipt{}
		}
		if store.Receipts.Expired == nil {
			store.Receipts.Expired = []resourceMailboxExpiredEntry{}
		}
		for index := range store.Receipts.Receipts {
			normalizeStoredMailboxReceipt(&store.Receipts.Receipts[index])
		}
	}
	if found, err := readResourceMailboxJSON(resourceMailboxOutboxPath(store.Directory), &store.Outbox); err != nil {
		return store, err
	} else if found {
		if store.Outbox.Version != resourceMailboxStoreVersion {
			return store, fmt.Errorf("unsupported outbox store version %d", store.Outbox.Version)
		}
		if store.Outbox.Operations == nil {
			store.Outbox.Operations = []resourceMailboxNotificationOp{}
		}
		for i := range store.Outbox.Operations {
			normalizeLegacyMailboxOperation(&store.Outbox.Operations[i])
			store.Outbox.Operations[i] = cloneMailboxOperation(store.Outbox.Operations[i])
		}
	}
	if found, err := readResourceMailboxJSON(resourceMailboxSchedulerPath(store.Directory), &store.Scheduler); err != nil {
		return store, err
	} else if found && store.Scheduler.Version != resourceMailboxStoreVersion {
		return store, fmt.Errorf("unsupported scheduler checkpoint version %d", store.Scheduler.Version)
	}

	// A crash after the receipt document was committed but before hot.json was
	// renamed can expose the same ID in both files. Hot wins because it is the
	// conservative, retryable state.
	byID := make(map[string]resourceMailboxMessage, len(store.Mailbox.Messages)+len(store.Receipts.Receipts))
	for _, message := range store.Mailbox.Messages {
		byID[message.ID] = cloneMailboxMessage(message)
	}
	for _, receipt := range store.Receipts.Receipts {
		if _, exists := byID[receipt.ID]; exists {
			continue
		}
		normalizeStoredMailboxReceipt(&receipt)
		byID[receipt.ID] = mailboxMessageFromReceipt(receipt)
		if receipt.Sequence > store.Mailbox.NextSequence {
			store.Mailbox.NextSequence = receipt.Sequence
		}
	}
	store.Mailbox.Messages = store.Mailbox.Messages[:0]
	for _, message := range byID {
		store.Mailbox.Messages = append(store.Mailbox.Messages, message)
	}
	sort.SliceStable(store.Mailbox.Messages, func(i, j int) bool {
		if store.Mailbox.Messages[i].Sequence != store.Mailbox.Messages[j].Sequence {
			return store.Mailbox.Messages[i].Sequence < store.Mailbox.Messages[j].Sequence
		}
		return store.Mailbox.Messages[i].ID < store.Mailbox.Messages[j].ID
	})
	return store, nil
}

func mailboxMessageNeedsHot(message resourceMailboxMessage) bool {
	switch message.Status {
	case resourceMessageQueued, resourceMessageDelivering, resourceMessageInterrupting:
		return true
	}
	if message.Notification != nil && message.Notification.Status != resourceNotificationDelivered && message.Notification.Status != resourceNotificationTerminal {
		return true
	}
	if message.ResultSubscriptionStatus == resourceResultSubscriptionPending && message.Notification == nil {
		return true
	}
	if message.Type == resourceMessageTypeSchedulerTick && message.Status == resourceMessageDelivered && strings.TrimSpace(message.TurnTerminalAt) == "" {
		return true
	}
	if message.Type == "" && (message.Status == resourceMessageDelivered || message.Status == resourceMessageUndeliverable || message.Status == resourceMessageDeliveryUnknown) &&
		message.Role == "agent" && message.Sender != nil && strings.TrimSpace(message.Sender.ID) != "" && strings.TrimSpace(message.SenderWorkspaceInstanceID) != "" && message.Notification == nil {
		return true
	}
	return false
}

// normalizeStoredMailboxMessage prevents a pre-subscribeResult delivered
// Agent input from becoming a new result subscription during recovery. Raw
// JSON decoding still follows the public omitted=>true default; this legacy
// exception is applied only when reading durable old mailbox state.
func normalizeStoredMailboxMessage(message *resourceMailboxMessage) {
	if message == nil {
		return
	}
	if !message.subscribeResultPresent && message.Status == resourceMessageDelivered && message.Notification == nil && message.Type == "" {
		message.SubscribeResult = false
		message.ResultSubscriptionStatus = resourceResultSubscriptionNone
	}
}

func normalizeStoredMailboxReceipt(receipt *resourceMailboxReceipt) {
	if receipt == nil {
		return
	}
	if !receipt.subscribeResultPresent && receipt.Status == resourceMessageDelivered && receipt.Notification == nil && receipt.Type == "" {
		receipt.SubscribeResult = false
		receipt.ResultSubscriptionStatus = resourceResultSubscriptionNone
	}
}

func mailboxMessageRetentionTime(message resourceMailboxMessage) time.Time {
	for _, value := range []string{message.TerminalAt, message.UpdatedAt, message.AcceptedAt} {
		if parsed, err := time.Parse(time.RFC3339Nano, strings.TrimSpace(value)); err == nil {
			return parsed
		}
	}
	return time.Time{}
}

func mailboxReceiptRetentionTime(receipt resourceMailboxReceipt) time.Time {
	return mailboxMessageRetentionTime(mailboxMessageFromReceipt(receipt))
}

func uniqueMailboxReceipts(receipts []resourceMailboxReceipt) []resourceMailboxReceipt {
	byID := make(map[string]resourceMailboxReceipt, len(receipts))
	for _, receipt := range receipts {
		if strings.TrimSpace(receipt.ID) == "" {
			continue
		}
		byID[receipt.ID] = receipt
	}
	result := make([]resourceMailboxReceipt, 0, len(byID))
	for _, receipt := range byID {
		result = append(result, receipt)
	}
	sort.SliceStable(result, func(i, j int) bool {
		left, right := mailboxReceiptRetentionTime(result[i]), mailboxReceiptRetentionTime(result[j])
		if !left.Equal(right) {
			return left.After(right)
		}
		if result[i].Sequence != result[j].Sequence {
			return result[i].Sequence > result[j].Sequence
		}
		return result[i].ID > result[j].ID
	})
	return result
}

func prepareResourceMailboxDocuments(store resourceMailboxStore) (resourceMailboxHotDocument, resourceMailboxReceiptDocument, resourceMailboxOutboxDocument, resourceSchedulerCheckpoint) {
	byID := make(map[string]resourceMailboxMessage, len(store.Mailbox.Messages))
	for _, message := range store.Mailbox.Messages {
		if strings.TrimSpace(message.ID) == "" {
			continue
		}
		message.ResourceID = normalizedResourceID(message.ResourceID)
		byID[message.ID] = cloneMailboxMessage(message)
	}
	hot := resourceMailboxHotDocument{Version: resourceMailboxStoreVersion, ResourceID: store.ResourceID, NextSequence: store.Mailbox.NextSequence, Messages: []resourceMailboxMessage{}}
	receipts := append([]resourceMailboxReceipt(nil), store.Receipts.Receipts...)
	hotIDs := make(map[string]bool)
	for _, message := range byID {
		if mailboxMessageNeedsHot(message) {
			message.receipt = false
			hot.Messages = append(hot.Messages, message)
			hotIDs[message.ID] = true
			continue
		}
		receipts = append(receipts, receiptFromMailboxMessage(message))
	}
	if len(hotIDs) > 0 {
		filtered := receipts[:0]
		for _, receipt := range receipts {
			if !hotIDs[receipt.ID] {
				filtered = append(filtered, receipt)
			}
		}
		receipts = filtered
	}
	for _, message := range hot.Messages {
		if message.Sequence > hot.NextSequence {
			hot.NextSequence = message.Sequence
		}
	}
	receipts = uniqueMailboxReceipts(receipts)
	now := time.Now()
	retained := make([]resourceMailboxReceipt, 0, len(receipts))
	dropped := make([]resourceMailboxExpiredEntry, 0)
	for index, receipt := range receipts {
		receiptTime := mailboxReceiptRetentionTime(receipt)
		keepByTime := receiptTime.IsZero() || resourceMailboxReceiptRetentionWindow <= 0 || now.Sub(receiptTime) <= resourceMailboxReceiptRetentionWindow
		keepByCount := resourceMailboxReceiptRetentionCount <= 0 || index < resourceMailboxReceiptRetentionCount
		if keepByTime && keepByCount {
			retained = append(retained, receipt)
		} else {
			dropped = append(dropped, resourceMailboxExpiredEntry{ID: receipt.ID, ExpiredAt: now.Format(time.RFC3339Nano)})
		}
	}
	expired := append([]resourceMailboxExpiredEntry(nil), store.Receipts.Expired...)
	expired = append(expired, dropped...)
	expiredByID := make(map[string]resourceMailboxExpiredEntry, len(expired))
	for _, entry := range expired {
		if strings.TrimSpace(entry.ID) == "" {
			continue
		}
		expiredByID[entry.ID] = entry
	}
	expired = expired[:0]
	for _, entry := range expiredByID {
		parsed, parseErr := time.Parse(time.RFC3339Nano, entry.ExpiredAt)
		if parseErr == nil && resourceMailboxExpiredRetentionWindow > 0 && now.Sub(parsed) > resourceMailboxExpiredRetentionWindow {
			continue
		}
		expired = append(expired, entry)
	}
	knownIDs := make(map[string]bool, len(hot.Messages)+len(retained))
	for _, message := range hot.Messages {
		knownIDs[message.ID] = true
	}
	for _, receipt := range retained {
		knownIDs[receipt.ID] = true
	}
	filteredExpired := expired[:0]
	for _, entry := range expired {
		if !knownIDs[entry.ID] {
			filteredExpired = append(filteredExpired, entry)
		}
	}
	expired = filteredExpired
	sort.SliceStable(expired, func(i, j int) bool { return expired[i].ExpiredAt > expired[j].ExpiredAt })
	if resourceMailboxExpiredRetentionCount > 0 && len(expired) > resourceMailboxExpiredRetentionCount {
		expired = expired[:resourceMailboxExpiredRetentionCount]
	}
	receiptDoc := resourceMailboxReceiptDocument{Version: resourceMailboxStoreVersion, ResourceID: store.ResourceID, Receipts: retained, Expired: expired}
	outbox := store.Outbox
	outbox.Version = resourceMailboxStoreVersion
	outbox.ResourceID = store.ResourceID
	pending := make([]resourceMailboxNotificationOp, 0, len(outbox.Operations))
	for _, operation := range outbox.Operations {
		if operation.Status == resourceNotificationDelivered || operation.Status == resourceNotificationTerminal {
			continue
		}
		pending = append(pending, cloneMailboxOperation(operation))
	}
	outbox.Operations = pending
	scheduler := store.Scheduler
	scheduler.Version = resourceMailboxStoreVersion
	scheduler.ResourceID = store.ResourceID
	sort.SliceStable(hot.Messages, func(i, j int) bool {
		if hot.Messages[i].Sequence != hot.Messages[j].Sequence {
			return hot.Messages[i].Sequence < hot.Messages[j].Sequence
		}
		return hot.Messages[i].ID < hot.Messages[j].ID
	})
	sort.SliceStable(receiptDoc.Receipts, func(i, j int) bool {
		return receiptDoc.Receipts[i].Sequence < receiptDoc.Receipts[j].Sequence
	})
	return hot, receiptDoc, outbox, scheduler
}

func writeResourceMailboxStoreDocuments(directory string, meta resourceMailboxMeta, hot resourceMailboxHotDocument, receipts resourceMailboxReceiptDocument, outbox resourceMailboxOutboxDocument, scheduler resourceSchedulerCheckpoint) error {
	if err := os.MkdirAll(directory, 0o700); err != nil {
		return err
	}
	if _, err := os.Stat(resourceMailboxMetaPath(directory)); os.IsNotExist(err) {
		if err := writeResourceMailboxMeta(directory, meta); err != nil {
			return err
		}
	} else if err != nil {
		return err
	}
	encode := func(value any) ([]byte, error) {
		data, err := json.MarshalIndent(value, "", "  ")
		if err != nil {
			return nil, err
		}
		return append(data, '\n'), nil
	}
	values := []struct {
		value any
		path  string
	}{
		{hot, resourceMailboxHotPath(directory)},
		{receipts, resourceMailboxReceiptPath(directory)},
		{outbox, resourceMailboxOutboxPath(directory)},
		{scheduler, resourceMailboxSchedulerPath(directory)},
	}
	temporary := make([]string, 0, len(values))
	removeTemporary := true
	defer func() {
		if removeTemporary {
			for _, path := range temporary {
				_ = os.Remove(path)
			}
		}
	}()
	for _, item := range values {
		data, err := encode(item.value)
		if err != nil {
			return err
		}
		tmp := item.path + "." + newRunID() + ".tmp"
		file, err := os.OpenFile(tmp, os.O_CREATE|os.O_EXCL|os.O_WRONLY, 0o600)
		if err != nil {
			return err
		}
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
		temporary = append(temporary, tmp)
	}
	txn := resourceMailboxTxn{Version: resourceMailboxStoreVersion, HotTemp: temporary[0], ReceiptTemp: temporary[1], OutboxTemp: temporary[2], SchedulerTemp: temporary[3]}
	if err := writeResourceMailboxJSON(resourceMailboxTxnPath(directory), txn); err != nil {
		return err
	}
	for index, item := range values {
		if err := os.Rename(temporary[index], item.path); err != nil {
			return err
		}
	}
	if err := os.Remove(resourceMailboxTxnPath(directory)); err != nil && !os.IsNotExist(err) {
		return err
	}
	removeTemporary = false
	return syncResourceMailboxDirectory(directory)
}

func writeResourceMailboxMeta(directory string, meta resourceMailboxMeta) error {
	return writeResourceMailboxJSON(resourceMailboxMetaPath(directory), meta)
}

func mailboxStoreMeta(store resourceMailboxStore) resourceMailboxMeta {
	return resourceMailboxMeta{Version: resourceMailboxStoreVersion, InstanceID: store.InstanceID, ResourceID: store.ResourceID, ResourceKey: store.ResourceKey}
}

func mailboxStoreMessageIDs(store resourceMailboxStore) map[string]bool {
	ids := make(map[string]bool, len(store.Mailbox.Messages)+len(store.Receipts.Receipts))
	for _, message := range store.Mailbox.Messages {
		ids[message.ID] = true
	}
	for _, receipt := range store.Receipts.Receipts {
		ids[receipt.ID] = true
	}
	for _, expired := range store.Receipts.Expired {
		ids[expired.ID] = true
	}
	return ids
}

func updateResourceMailboxLocators(workspacePath string, store resourceMailboxStore, hot resourceMailboxHotDocument, receipts resourceMailboxReceiptDocument, before resourceMailboxStore) error {
	if err := os.MkdirAll(resourceMailboxLocatorRoot(workspacePath), 0o700); err != nil {
		return err
	}
	current := make(map[string]resourceMailboxLocator, len(hot.Messages)+len(receipts.Receipts)+len(receipts.Expired))
	updatedAt := time.Now().Format(time.RFC3339Nano)
	for _, message := range hot.Messages {
		current[message.ID] = resourceMailboxLocator{Version: resourceMailboxStoreVersion, MessageID: message.ID, ResourceID: store.ResourceID, ResourceKey: store.ResourceKey, State: "hot", UpdatedAt: updatedAt}
	}
	for _, receipt := range receipts.Receipts {
		current[receipt.ID] = resourceMailboxLocator{Version: resourceMailboxStoreVersion, MessageID: receipt.ID, ResourceID: store.ResourceID, ResourceKey: store.ResourceKey, State: "receipt", UpdatedAt: updatedAt}
	}
	for _, expired := range receipts.Expired {
		current[expired.ID] = resourceMailboxLocator{Version: resourceMailboxStoreVersion, MessageID: expired.ID, ResourceID: store.ResourceID, ResourceKey: store.ResourceKey, State: resourceMailboxExpiredState, UpdatedAt: expired.ExpiredAt}
	}
	for id, locator := range current {
		if err := writeResourceMailboxIndexJSON(resourceMailboxLocatorPath(workspacePath, id), locator); err != nil {
			return err
		}
	}
	previous := mailboxStoreMessageIDs(before)
	for id := range previous {
		if _, stillKnown := current[id]; stillKnown {
			continue
		}
		path := resourceMailboxLocatorPath(workspacePath, id)
		var locator resourceMailboxLocator
		found, err := readResourceMailboxJSON(path, &locator)
		if err != nil {
			return err
		}
		if found && locator.ResourceKey == store.ResourceKey {
			if err := os.Remove(path); err != nil && !os.IsNotExist(err) {
				return err
			}
		}
	}
	return nil
}

func persistResourceMailboxStore(workspacePath string, store resourceMailboxStore, before resourceMailboxStore) error {
	hot, receipts, outbox, scheduler := prepareResourceMailboxDocuments(store)
	if err := writeResourceMailboxStoreDocuments(store.Directory, mailboxStoreMeta(store), hot, receipts, outbox, scheduler); err != nil {
		return err
	}
	store.Mailbox.NextSequence = hot.NextSequence
	// Locators are rebuildable and non-authoritative. A failed index update must
	// not turn a durable mailbox commit into a delivery failure; lookup falls
	// back to the bounded resource stores.
	_ = updateResourceMailboxLocators(workspacePath, store, hot, receipts, before)
	return nil
}

func loadResourceMailboxForResourceInternal(workspacePath, resourceID string) (resourceMailbox, error) {
	store, err := loadResourceMailboxStoreInternal(workspacePath, resourceID)
	if err != nil {
		return resourceMailbox{}, err
	}
	return store.Mailbox, nil
}

func loadResourceMailboxStoreForRead(workspacePath, resourceID string) (resourceMailboxStore, error) {
	lock := resourceMailboxLock(workspacePath, resourceID)
	lock.Lock()
	defer lock.Unlock()
	return loadResourceMailboxStoreInternal(workspacePath, resourceID)
}

func loadResourceMailboxForResource(workspacePath, resourceID string) (resourceMailbox, error) {
	if err := migrateLegacyResourceMailbox(workspacePath); err != nil {
		return resourceMailbox{}, err
	}
	store, err := loadResourceMailboxStoreForRead(workspacePath, resourceID)
	if err != nil {
		return resourceMailbox{}, err
	}
	return store.Mailbox, nil
}

func listResourceMailboxResourceIDs(workspacePath string) ([]string, error) {
	entries, err := os.ReadDir(resourceMailboxResourcesRoot(workspacePath))
	if os.IsNotExist(err) {
		return []string{}, nil
	}
	if err != nil {
		return nil, err
	}
	resourceIDs := make([]string, 0, len(entries))
	for _, entry := range entries {
		if !entry.IsDir() || strings.HasPrefix(entry.Name(), ".") {
			continue
		}
		var meta resourceMailboxMeta
		found, readErr := readResourceMailboxJSON(resourceMailboxMetaPath(filepath.Join(resourceMailboxResourcesRoot(workspacePath), entry.Name())), &meta)
		if readErr != nil {
			return nil, readErr
		}
		if found && meta.Version == resourceMailboxStoreVersion && strings.TrimSpace(meta.ResourceID) != "" {
			resourceIDs = append(resourceIDs, meta.ResourceID)
		}
	}
	sort.Strings(resourceIDs)
	return resourceIDs, nil
}

// loadResourceMailbox is retained as an in-memory compatibility projection for
// history and tests. Production reconciliation uses the resource-scoped and
// hot-only helpers below, so this bounded aggregate never drives delivery.
func loadResourceMailbox(workspacePath string) (resourceMailbox, error) {
	if err := migrateLegacyResourceMailbox(workspacePath); err != nil {
		return resourceMailbox{}, err
	}
	resourceIDs, err := listResourceMailboxResourceIDs(workspacePath)
	if err != nil {
		return resourceMailbox{}, err
	}
	aggregate := resourceMailbox{Version: resourceMailboxVersion, Messages: []resourceMailboxMessage{}}
	for _, resourceID := range resourceIDs {
		mailbox, loadErr := loadResourceMailboxForResource(workspacePath, resourceID)
		if loadErr != nil {
			return resourceMailbox{}, loadErr
		}
		if mailbox.NextSequence > aggregate.NextSequence {
			aggregate.NextSequence = mailbox.NextSequence
		}
		aggregate.Messages = append(aggregate.Messages, mailbox.Messages...)
	}
	sort.SliceStable(aggregate.Messages, func(i, j int) bool {
		if aggregate.Messages[i].Sequence != aggregate.Messages[j].Sequence {
			return aggregate.Messages[i].Sequence < aggregate.Messages[j].Sequence
		}
		if aggregate.Messages[i].ResourceID != aggregate.Messages[j].ResourceID {
			return aggregate.Messages[i].ResourceID < aggregate.Messages[j].ResourceID
		}
		return aggregate.Messages[i].ID < aggregate.Messages[j].ID
	})
	return aggregate, nil
}

func loadHotResourceMailbox(workspacePath, resourceID string) (resourceMailbox, error) {
	mailbox, err := loadResourceMailboxForResource(workspacePath, resourceID)
	if err != nil {
		return resourceMailbox{}, err
	}
	hot := resourceMailbox{Version: resourceMailboxVersion, NextSequence: mailbox.NextSequence, Messages: []resourceMailboxMessage{}}
	for _, message := range mailbox.Messages {
		if !message.receipt {
			hot.Messages = append(hot.Messages, message)
		}
	}
	return hot, nil
}

func loadAllHotResourceMailboxes(workspacePath string) ([]resourceMailbox, error) {
	resourceIDs, err := listResourceMailboxResourceIDs(workspacePath)
	if err != nil {
		return nil, err
	}
	result := make([]resourceMailbox, 0, len(resourceIDs))
	for _, resourceID := range resourceIDs {
		hot, loadErr := loadHotResourceMailbox(workspacePath, resourceID)
		if loadErr != nil {
			return nil, loadErr
		}
		if len(hot.Messages) > 0 {
			result = append(result, hot)
		}
	}
	return result, nil
}

func mutateResourceMailboxStoreForResource(workspacePath, resourceID string, mutate func(*resourceMailboxStore) error) (resourceMailboxStore, error) {
	if err := migrateLegacyResourceMailbox(workspacePath); err != nil {
		return resourceMailboxStore{}, err
	}
	resourceID = normalizedResourceID(resourceID)
	lock := resourceMailboxLock(workspacePath, resourceID)
	lock.Lock()
	defer lock.Unlock()
	store, err := loadResourceMailboxStoreInternal(workspacePath, resourceID)
	if err != nil {
		return resourceMailboxStore{}, err
	}
	before := cloneResourceMailboxStore(store)
	if err := mutate(&store); err != nil {
		return resourceMailboxStore{}, err
	}
	if store.Mailbox.NextSequence < before.Mailbox.NextSequence {
		store.Mailbox.NextSequence = before.Mailbox.NextSequence
	}
	if err := persistResourceMailboxStore(workspacePath, store, before); err != nil {
		return resourceMailboxStore{}, err
	}
	return store, nil
}

func mutateResourceMailboxForResource(workspacePath, resourceID string, mutate func(*resourceMailbox) error) (resourceMailbox, error) {
	store, err := mutateResourceMailboxStoreForResource(workspacePath, resourceID, func(store *resourceMailboxStore) error {
		return mutate(&store.Mailbox)
	})
	if err != nil {
		return resourceMailbox{}, err
	}
	return store.Mailbox, nil
}

// mutateResourceMailbox is a compatibility boundary for older in-process
// callers. New production paths use mutateResourceMailboxForResource so a
// mutation does not scan or rewrite unrelated resources.
func mutateResourceMailbox(workspacePath string, mutate func(*resourceMailbox) error) (resourceMailbox, error) {
	if err := migrateLegacyResourceMailbox(workspacePath); err != nil {
		return resourceMailbox{}, err
	}
	resourceMailboxAggregateMu.Lock()
	defer resourceMailboxAggregateMu.Unlock()
	before, err := loadResourceMailbox(workspacePath)
	if err != nil {
		return resourceMailbox{}, err
	}
	if err := mutate(&before); err != nil {
		return resourceMailbox{}, err
	}
	byResource := make(map[string][]resourceMailboxMessage)
	for _, message := range before.Messages {
		resourceID := normalizedResourceID(message.ResourceID)
		byResource[resourceID] = append(byResource[resourceID], message)
	}
	resourceIDs := make([]string, 0, len(byResource))
	for resourceID := range byResource {
		resourceIDs = append(resourceIDs, resourceID)
	}
	sort.Strings(resourceIDs)
	for _, resourceID := range resourceIDs {
		resourceID := resourceID
		messages := append([]resourceMailboxMessage(nil), byResource[resourceID]...)
		if _, err := mutateResourceMailboxForResource(workspacePath, resourceID, func(mailbox *resourceMailbox) error {
			mailbox.Messages = messages
			mailbox.NextSequence = before.NextSequence
			return nil
		}); err != nil {
			return resourceMailbox{}, err
		}
	}
	return before, nil
}

func readLegacyMailboxForMigration(workspacePath string) (resourceMailbox, []int, error) {
	data, err := os.ReadFile(resourceMailboxPath(workspacePath))
	if os.IsNotExist(err) {
		return resourceMailbox{Version: resourceMailboxVersion, Messages: []resourceMailboxMessage{}}, []int{}, nil
	}
	if err != nil {
		return resourceMailbox{}, nil, err
	}
	var mailbox resourceMailbox
	if err := json.Unmarshal(data, &mailbox); err != nil {
		return resourceMailbox{}, nil, fmt.Errorf("read legacy resource mailbox: %w", err)
	}
	if mailbox.Version != 1 && mailbox.Version != resourceMailboxVersion {
		return resourceMailbox{}, nil, fmt.Errorf("unsupported legacy resource mailbox version %d", mailbox.Version)
	}
	if mailbox.Messages == nil {
		mailbox.Messages = []resourceMailboxMessage{}
	}
	return mailbox, []int{mailbox.Version}, nil
}

func mailboxNotificationOperationFromMessage(message resourceMailboxMessage) (resourceMailboxNotificationOp, bool) {
	receipt := message.Notification
	if receipt == nil || receipt.Status == resourceNotificationDelivered || receipt.Status == resourceNotificationTerminal {
		return resourceMailboxNotificationOp{}, false
	}
	return resourceMailboxNotificationOp{
		ID: receipt.ID, Type: receipt.Type, SourceMessageID: message.ID, SourceMessageIDs: []string{message.ID},
		SourceResourceID: message.ResourceID, SourceWorkspaceInstanceID: strings.TrimSpace(message.SenderWorkspaceInstanceID),
		TargetWorkspaceInstanceID: receipt.TargetWorkspaceInstanceID, TargetResourceID: receipt.TargetResourceID,
		GeneratedMessageID: receipt.ID, Status: receipt.Status, AcceptedAt: receipt.AcceptedAt,
		UpdatedAt: receipt.UpdatedAt, DeliveredAt: receipt.DeliveredAt, TerminalAt: receipt.TerminalAt,
		DeliveryStatus: receipt.DeliveryStatus, LastError: receipt.LastError, LastErrorCode: receipt.LastErrorCode,
	}, true
}

func mailboxNotificationOperationFromGenerated(source resourceMailboxMessage, generated resourceMailboxMessage) resourceMailboxNotificationOp {
	receipt := source.Notification
	operation := resourceMailboxNotificationOp{
		ID: generated.ID, Type: generated.Type, SourceMessageID: source.ID, SourceMessageIDs: []string{source.ID},
		SourceResourceID: normalizedResourceID(source.ResourceID), SourceWorkspaceInstanceID: strings.TrimSpace(generated.SenderWorkspaceInstanceID),
		GeneratedMessageID: generated.ID, GeneratedText: generated.Text, GeneratedSender: generated.Sender,
		GeneratedCausation: generated.Causation, Status: resourceNotificationWaiting, UpdatedAt: time.Now().Format(time.RFC3339Nano),
	}
	if receipt != nil {
		operation.TargetWorkspaceInstanceID = receipt.TargetWorkspaceInstanceID
		operation.TargetResourceID = receipt.TargetResourceID
		operation.Status = receipt.Status
		operation.AcceptedAt = receipt.AcceptedAt
		operation.DeliveryStatus = receipt.DeliveryStatus
		operation.DeliveredAt = receipt.DeliveredAt
		operation.TerminalAt = receipt.TerminalAt
		operation.LastError = receipt.LastError
		operation.LastErrorCode = receipt.LastErrorCode
	}
	if operation.SourceWorkspaceInstanceID == "" {
		operation.SourceWorkspaceInstanceID = strings.TrimSpace(source.SenderWorkspaceInstanceID)
	}
	return operation
}

func appendUniqueMailboxOperation(operations []resourceMailboxNotificationOp, operation resourceMailboxNotificationOp) []resourceMailboxNotificationOp {
	normalizeMailboxOperationSources(&operation)
	for index := range operations {
		if operations[index].ID != operation.ID {
			continue
		}
		current := operations[index]
		currentIDs := mailboxOperationSourceIDs(current)
		for _, sourceID := range mailboxOperationSourceIDs(operation) {
			seen := false
			for _, currentID := range currentIDs {
				if currentID == sourceID {
					seen = true
					break
				}
			}
			if !seen {
				currentIDs = append(currentIDs, sourceID)
			}
		}
		current.SourceMessageIDs = currentIDs
		if len(currentIDs) > 0 {
			current.SourceMessageID = currentIDs[0]
		}
		if operation.GeneratedText != "" {
			current.GeneratedText = operation.GeneratedText
		}
		if operation.GeneratedMessageID != "" {
			current.GeneratedMessageID = operation.GeneratedMessageID
		}
		if operation.GeneratedSender != nil {
			current.GeneratedSender = operation.GeneratedSender
		}
		if operation.GeneratedCausation != nil {
			current.GeneratedCausation = operation.GeneratedCausation
		}
		if operation.Status != "" {
			current.Status = operation.Status
		}
		if operation.TargetWorkspaceInstanceID != "" {
			current.TargetWorkspaceInstanceID = operation.TargetWorkspaceInstanceID
		}
		if operation.TargetResourceID != "" {
			current.TargetResourceID = operation.TargetResourceID
		}
		current.UpdatedAt = operation.UpdatedAt
		operations[index] = current
		return operations
	}
	return append(operations, cloneMailboxOperation(operation))
}

func mergeLegacyMailboxMessage(messages []resourceMailboxMessage, incoming resourceMailboxMessage) ([]resourceMailboxMessage, error) {
	incoming.ResourceID = normalizedResourceID(incoming.ResourceID)
	for index := range messages {
		if messages[index].ID != incoming.ID {
			continue
		}
		if normalizedResourceID(messages[index].ResourceID) != incoming.ResourceID {
			return messages, &resourceAPIError{Code: "message_conflict", Message: "stable message id belongs to multiple resources during mailbox migration"}
		}
		// The existing entry may have been advanced before a migration retry.
		// Never regress it to the older source file.
		return messages, nil
	}
	return append(messages, cloneMailboxMessage(incoming)), nil
}

func mailboxMigrationMarkerExists(workspacePath string) (bool, error) {
	var marker resourceMailboxMigrationMarker
	found, err := readResourceMailboxJSON(resourceMailboxMigrationPath(workspacePath), &marker)
	if err != nil || !found {
		return false, err
	}
	if marker.Version != resourceMailboxMigrationVersion || marker.Status != "committed" {
		return false, fmt.Errorf("unsupported mailbox migration marker version %d or status %q", marker.Version, marker.Status)
	}
	return true, nil
}

func migratedMailboxResourceIDs(mailbox resourceMailbox, runs []agentRun) []string {
	seen := make(map[string]bool)
	for _, message := range mailbox.Messages {
		seen[normalizedResourceID(message.ResourceID)] = true
	}
	for _, run := range runs {
		for _, pending := range run.PendingMessages {
			if strings.TrimSpace(pending.ID) != "" {
				seen[normalizedResourceID(run.ResourceID)] = true
			}
		}
	}
	ids := make([]string, 0, len(seen))
	for resourceID := range seen {
		ids = append(ids, resourceID)
	}
	sort.Strings(ids)
	return ids
}

func schedulerCheckpointFromMessages(resourceID string, messages []resourceMailboxMessage) resourceSchedulerCheckpoint {
	checkpoint := resourceSchedulerCheckpoint{Version: resourceMailboxStoreVersion, ResourceID: resourceID}
	var latest resourceMailboxMessage
	found := false
	for _, message := range messages {
		if message.Type == resourceMessageTypeSchedulerTick && (!found || message.Sequence > latest.Sequence) {
			latest, found = message, true
		}
	}
	if !found {
		return checkpoint
	}
	checkpoint.LastTickMessageID = latest.ID
	checkpoint.GenerationID = latest.GenerationID
	checkpoint.AgentHubSessionID = latest.AgentHubSessionID
	checkpoint.TurnID = latest.TurnID
	checkpoint.AcceptedAt = latest.AcceptedAt
	checkpoint.DeliveryTerminalAt = latest.TerminalAt
	checkpoint.TurnTerminalAt = latest.TurnTerminalAt
	if latest.Causation != nil {
		checkpoint.ConfigDigest = latest.Causation.ScheduleDigest
		checkpoint.Reason = latest.Causation.Reason
	}
	return checkpoint
}

func migrateLegacyResourceMailbox(workspacePath string) error {
	resourceMailboxMigrationMu.Lock()
	defer resourceMailboxMigrationMu.Unlock()
	if complete, err := mailboxMigrationMarkerExists(workspacePath); err != nil || complete {
		return err
	}
	legacyMailbox, sourceVersions, err := readLegacyMailboxForMigration(workspacePath)
	if err != nil {
		return err
	}

	// Read the old generation queue once. The queue is cleared only after all
	// staged resource stores have been durably written, so a crash can replay
	// this merge by stable message ID.
	agentIndexMu.Lock()
	runs, runsErr := loadAgentRunsLocked(workspacePath)
	agentIndexMu.Unlock()
	if runsErr != nil {
		return runsErr
	}
	seenIDs := make(map[string]bool)
	for _, message := range legacyMailbox.Messages {
		if strings.TrimSpace(message.ID) == "" {
			continue
		}
		seenIDs[message.ID] = true
	}
	byResource := make(map[string][]resourceMailboxMessage)
	for _, message := range legacyMailbox.Messages {
		if strings.TrimSpace(message.ID) == "" {
			continue
		}
		resourceID := normalizedResourceID(message.ResourceID)
		message.ResourceID = resourceID
		byResource[resourceID] = append(byResource[resourceID], cloneMailboxMessage(message))
	}
	nextSequenceByResource := make(map[string]uint64, len(byResource))
	for resourceID, messages := range byResource {
		nextSequenceByResource[resourceID] = legacyMailbox.NextSequence
		for _, message := range messages {
			if message.Sequence > nextSequenceByResource[resourceID] {
				nextSequenceByResource[resourceID] = message.Sequence
			}
		}
	}
	clearedRuns := cloneAgentRuns(runs)
	runsChanged := false
	for runIndex := range clearedRuns {
		for _, pending := range clearedRuns[runIndex].PendingMessages {
			if strings.TrimSpace(pending.ID) == "" || seenIDs[pending.ID] {
				continue
			}
			actual := resourceMessageModeSteer
			if pending.Steer != nil && !*pending.Steer {
				actual = resourceMessageModeEnqueue
			}
			acceptedAt := strings.TrimSpace(pending.AcceptedAt)
			if acceptedAt == "" {
				acceptedAt = strings.TrimSpace(clearedRuns[runIndex].UpdatedAt)
			}
			if acceptedAt == "" {
				acceptedAt = time.Now().Format(time.RFC3339Nano)
			}
			resourceID := normalizedResourceID(clearedRuns[runIndex].ResourceID)
			nextSequenceByResource[resourceID]++
			byResource[resourceID] = append(byResource[resourceID], resourceMailboxMessage{
				ID: pending.ID, Sequence: nextSequenceByResource[resourceID], ResourceID: resourceID, Text: pending.Text, Role: pending.Role, Sender: pending.Sender,
				RequestedMode: resourceMessageModeSteer, ActualMode: actual, ModeFrozen: pending.Steer != nil,
				Status: resourceMessageQueued, AcceptedAt: acceptedAt, UpdatedAt: acceptedAt,
				GenerationID: clearedRuns[runIndex].GenerationID, AgentHubSessionID: clearedRuns[runIndex].AgentHubSessionID,
			})
			seenIDs[pending.ID] = true
		}
		if len(clearedRuns[runIndex].PendingMessages) > 0 {
			clearedRuns[runIndex].PendingMessages = nil
			runsChanged = true
		}
	}

	resourceIDs := migratedMailboxResourceIDs(legacyMailbox, runs)
	for resourceID := range byResource {
		found := false
		for _, current := range resourceIDs {
			if current == resourceID {
				found = true
				break
			}
		}
		if !found {
			resourceIDs = append(resourceIDs, resourceID)
		}
	}
	sort.Strings(resourceIDs)
	if len(resourceIDs) == 0 {
		// An uninitialized workspace has nothing to migrate. Do not create an
		// otherwise empty resources directory from a background recovery read.
		if len(sourceVersions) == 0 {
			return nil
		}
		if err := os.MkdirAll(resourceMailboxResourcesRoot(workspacePath), 0o700); err != nil {
			return err
		}
		marker := resourceMailboxMigrationMarker{Version: resourceMailboxMigrationVersion, Status: "committed", CommittedAt: time.Now().Format(time.RFC3339Nano), SourceVersions: sourceVersions}
		return writeResourceMailboxJSON(resourceMailboxMigrationPath(workspacePath), marker)
	}
	if err := os.MkdirAll(resourceMailboxResourcesRoot(workspacePath), 0o700); err != nil {
		return err
	}
	stageRoot := filepath.Join(resourceMailboxResourcesRoot(workspacePath), ".mailbox-migration-"+newRunID())
	if err := os.MkdirAll(stageRoot, 0o700); err != nil {
		return err
	}
	defer os.RemoveAll(stageRoot)
	for _, resourceID := range resourceIDs {
		store := defaultResourceMailboxStore(workspacePath, resourceID)
		store.Mailbox.Messages = append(store.Mailbox.Messages, byResource[resourceID]...)
		store.Mailbox.NextSequence = legacyMailbox.NextSequence
		for _, message := range store.Mailbox.Messages {
			if message.Sequence > store.Mailbox.NextSequence {
				store.Mailbox.NextSequence = message.Sequence
			}
			if operation, ok := mailboxNotificationOperationFromMessage(message); ok {
				store.Outbox.Operations = appendUniqueMailboxOperation(store.Outbox.Operations, operation)
			}
		}
		store.Scheduler = schedulerCheckpointFromMessages(resourceID, store.Mailbox.Messages)
		hot, receipts, outbox, scheduler := prepareResourceMailboxDocuments(store)
		stageDirectory := filepath.Join(stageRoot, store.ResourceKey)
		if err := writeResourceMailboxStoreDocuments(stageDirectory, mailboxStoreMeta(store), hot, receipts, outbox, scheduler); err != nil {
			return fmt.Errorf("stage resource mailbox %s: %w", resourceID, err)
		}
	}
	if err := syncResourceMailboxDirectory(stageRoot); err != nil {
		return err
	}

	// Commit each resource directory with an atomic rename. The durable marker
	// is written only after every resource is visible; a retry merges any
	// already committed directory without changing its advanced state.
	for _, resourceID := range resourceIDs {
		store := defaultResourceMailboxStore(workspacePath, resourceID)
		stageDirectory := filepath.Join(stageRoot, store.ResourceKey)
		if _, statErr := os.Stat(store.Directory); os.IsNotExist(statErr) {
			if err := os.Rename(stageDirectory, store.Directory); err != nil {
				return err
			}
			committed, loadErr := loadResourceMailboxStoreInternal(workspacePath, resourceID)
			if loadErr != nil {
				return loadErr
			}
			hot, receipts, _, _ := prepareResourceMailboxDocuments(committed)
			_ = updateResourceMailboxLocators(workspacePath, committed, hot, receipts, resourceMailboxStore{})
			continue
		} else if statErr != nil {
			return statErr
		}
		lock := resourceMailboxLock(workspacePath, resourceID)
		lock.Lock()
		current, loadErr := loadResourceMailboxStoreInternal(workspacePath, resourceID)
		if loadErr != nil {
			lock.Unlock()
			return loadErr
		}
		before := cloneResourceMailboxStore(current)
		for _, message := range byResource[resourceID] {
			current.Mailbox.Messages, err = mergeLegacyMailboxMessage(current.Mailbox.Messages, message)
			if err != nil {
				lock.Unlock()
				return err
			}
			if operation, ok := mailboxNotificationOperationFromMessage(message); ok {
				current.Outbox.Operations = appendUniqueMailboxOperation(current.Outbox.Operations, operation)
			}
		}
		if err := persistResourceMailboxStore(workspacePath, current, before); err != nil {
			lock.Unlock()
			return err
		}
		lock.Unlock()
	}
	if runsChanged {
		agentIndexMu.Lock()
		writeErr := writeAgentRunsIndexLocked(workspacePath, clearedRuns)
		agentIndexMu.Unlock()
		if writeErr != nil {
			return fmt.Errorf("clear migrated generation queues: %w", writeErr)
		}
	}
	marker := resourceMailboxMigrationMarker{Version: resourceMailboxMigrationVersion, Status: "committed", CommittedAt: time.Now().Format(time.RFC3339Nano), SourceVersions: sourceVersions}
	if err := writeResourceMailboxJSON(resourceMailboxMigrationPath(workspacePath), marker); err != nil {
		return fmt.Errorf("commit mailbox migration marker: %w", err)
	}
	return nil
}

func cloneAgentRuns(runs []agentRun) []agentRun {
	cloned := make([]agentRun, len(runs))
	for index, run := range runs {
		cloned[index] = cloneAgentRun(run)
	}
	return cloned
}

func readResourceMailboxLocator(workspacePath, messageID string) (resourceMailboxLocator, bool, error) {
	messageID = strings.TrimSpace(messageID)
	if messageID == "" {
		return resourceMailboxLocator{}, false, nil
	}
	var locator resourceMailboxLocator
	found, err := readResourceMailboxJSON(resourceMailboxLocatorPath(workspacePath, messageID), &locator)
	if err != nil {
		// The index is rebuildable; a torn or stale index must not hide a
		// canonical message from the bounded resource-store fallback.
		return resourceMailboxLocator{}, false, nil
	}
	if !found {
		return resourceMailboxLocator{}, false, nil
	}
	if locator.Version != resourceMailboxStoreVersion || locator.MessageID != messageID {
		return resourceMailboxLocator{}, false, nil
	}
	return locator, true, nil
}

func mailboxMessageByID(workspacePath, messageID string) (resourceMailboxMessage, bool, error) {
	messageID = strings.TrimSpace(messageID)
	if err := migrateLegacyResourceMailbox(workspacePath); err != nil {
		return resourceMailboxMessage{}, false, err
	}
	if locator, found, err := readResourceMailboxLocator(workspacePath, messageID); err != nil {
		return resourceMailboxMessage{}, false, err
	} else if found {
		if locator.State == resourceMailboxExpiredState {
			return resourceMailboxMessage{}, false, &resourceAPIError{Code: "message_receipt_expired", Message: fmt.Sprintf("message receipt expired: %s", messageID)}
		}
		mailbox, loadErr := loadResourceMailboxForResource(workspacePath, locator.ResourceID)
		if loadErr != nil {
			return resourceMailboxMessage{}, false, loadErr
		}
		for _, message := range mailbox.Messages {
			if message.ID == messageID {
				return cloneMailboxMessage(message), true, nil
			}
		}
		// A locator can lag a just-committed resource document. Continue with
		// the bounded fallback so a concurrent compaction cannot look missing.
	}

	// Recovery fallback is bounded by the number of resource stores and each
	// store's fixed receipt window. It is not a scan of old delivered mailbox entries.
	resourceIDs, err := listResourceMailboxResourceIDs(workspacePath)
	if err != nil {
		return resourceMailboxMessage{}, false, err
	}
	for _, resourceID := range resourceIDs {
		store, loadErr := loadResourceMailboxStoreForRead(workspacePath, resourceID)
		if loadErr != nil {
			return resourceMailboxMessage{}, false, loadErr
		}
		for _, message := range store.Mailbox.Messages {
			if message.ID == messageID {
				locator := resourceMailboxLocator{Version: resourceMailboxStoreVersion, MessageID: message.ID, ResourceID: resourceID, ResourceKey: resourceMailboxKey(mailboxInstanceID(workspacePath), resourceID), State: "receipt", UpdatedAt: time.Now().Format(time.RFC3339Nano)}
				if !message.receipt {
					locator.State = "hot"
				}
				_ = writeResourceMailboxIndexJSON(resourceMailboxLocatorPath(workspacePath, message.ID), locator)
				return cloneMailboxMessage(message), true, nil
			}
		}
		for _, expired := range store.Receipts.Expired {
			if expired.ID == messageID {
				return resourceMailboxMessage{}, false, &resourceAPIError{Code: "message_receipt_expired", Message: fmt.Sprintf("message receipt expired: %s", messageID)}
			}
		}
	}
	return resourceMailboxMessage{}, false, nil
}

func updateMailboxMessage(workspacePath, messageID string, mutate func(*resourceMailboxMessage)) (resourceMailboxMessage, error) {
	message, found, err := mailboxMessageByID(workspacePath, messageID)
	if err != nil {
		return resourceMailboxMessage{}, err
	}
	if !found {
		return resourceMailboxMessage{}, fmt.Errorf("mailbox message not found: %s", messageID)
	}
	resourceID := normalizedResourceID(message.ResourceID)
	var updated resourceMailboxMessage
	_, err = mutateResourceMailboxForResource(workspacePath, resourceID, func(mailbox *resourceMailbox) error {
		for index := range mailbox.Messages {
			if mailbox.Messages[index].ID != messageID {
				continue
			}
			mutate(&mailbox.Messages[index])
			mailbox.Messages[index].UpdatedAt = time.Now().Format(time.RFC3339Nano)
			updated = cloneMailboxMessage(mailbox.Messages[index])
			return nil
		}
		return fmt.Errorf("mailbox message not found: %s", messageID)
	})
	if err != nil {
		return resourceMailboxMessage{}, err
	}
	return updated, nil
}

func resourceMailboxOperationGeneratedMessage(operation resourceMailboxNotificationOp) resourceMailboxMessage {
	return resourceMailboxMessage{
		ID: operation.GeneratedMessageID, ResourceID: operation.TargetResourceID, Text: operation.GeneratedText,
		Role: "system", Sender: operation.GeneratedSender, SenderWorkspaceInstanceID: operation.SourceWorkspaceInstanceID,
		SubscribeResult: false, ResultSubscriptionStatus: resourceResultSubscriptionDisabled,
		Type: operation.Type, Causation: operation.GeneratedCausation,
		RequestedMode: resourceMessageModeEnqueue, ActualMode: resourceMessageModeEnqueue, ModeFrozen: true,
		Status: resourceMessageQueued, AcceptedAt: operation.AcceptedAt, UpdatedAt: operation.UpdatedAt,
	}
}

func mailboxNotificationOperation(workspacePath, sourceMessageID string) (resourceMailboxNotificationOp, bool, error) {
	message, found, err := mailboxMessageByID(workspacePath, sourceMessageID)
	if err != nil || !found {
		return resourceMailboxNotificationOp{}, found, err
	}
	resourceID := normalizedResourceID(message.ResourceID)
	store, err := loadResourceMailboxStoreForRead(workspacePath, resourceID)
	if err != nil {
		return resourceMailboxNotificationOp{}, false, err
	}
	for _, operation := range store.Outbox.Operations {
		if mailboxOperationHasSource(operation, sourceMessageID) {
			return cloneMailboxOperation(operation), true, nil
		}
	}
	return resourceMailboxNotificationOp{}, false, nil
}

func upsertMailboxNotificationOperation(workspacePath string, sourceMessageID string, operation resourceMailboxNotificationOp) error {
	return upsertMailboxNotificationOperationForSources(workspacePath, []string{sourceMessageID}, operation)
}

func upsertMailboxNotificationOperationForSources(workspacePath string, sourceMessageIDs []string, operation resourceMailboxNotificationOp) error {
	ids := make([]string, 0, len(sourceMessageIDs)+len(operation.SourceMessageIDs)+1)
	seen := make(map[string]bool)
	appendID := func(value string) {
		value = strings.TrimSpace(value)
		if value == "" || seen[value] {
			return
		}
		seen[value] = true
		ids = append(ids, value)
	}
	for _, sourceID := range sourceMessageIDs {
		appendID(sourceID)
	}
	for _, sourceID := range mailboxOperationSourceIDs(operation) {
		appendID(sourceID)
	}
	if len(ids) == 0 {
		return errors.New("source mailbox message is required")
	}
	sourceID := ids[0]
	source, found, err := mailboxMessageByID(workspacePath, sourceID)
	if err != nil {
		return err
	}
	if !found {
		return fmt.Errorf("source mailbox message not found: %s", sourceID)
	}
	operation.SourceMessageID = sourceID
	operation.SourceMessageIDs = ids
	operation.SourceResourceID = normalizedResourceID(source.ResourceID)
	if operation.ID == "" && source.Notification != nil {
		operation.ID = source.Notification.ID
	}
	if operation.Status == "" && source.Notification != nil {
		operation.Status = source.Notification.Status
	}
	if operation.UpdatedAt == "" {
		operation.UpdatedAt = time.Now().Format(time.RFC3339Nano)
	}
	_, err = mutateResourceMailboxStoreForResource(workspacePath, source.ResourceID, func(store *resourceMailboxStore) error {
		foundSources := make(map[string]bool, len(ids))
		for index := range store.Mailbox.Messages {
			message := &store.Mailbox.Messages[index]
			if !seen[message.ID] {
				continue
			}
			if normalizedResourceID(message.ResourceID) != operation.SourceResourceID {
				return fmt.Errorf("source mailbox message belongs to another resource: %s", message.ID)
			}
			foundSources[message.ID] = true
			if message.Notification == nil && operation.ID != "" {
				message.Notification = &resourceNotificationReceipt{ID: operation.ID, Type: operation.Type, Status: operation.Status, TargetWorkspaceInstanceID: operation.TargetWorkspaceInstanceID, TargetResourceID: operation.TargetResourceID, CreatedAt: operation.UpdatedAt, UpdatedAt: operation.UpdatedAt}
			}
			if operation.Type == resourceMessageTypeTurnResult && message.ResultSubscriptionStatus != resourceResultSubscriptionComplete {
				message.ResultSubscriptionStatus = resourceResultSubscriptionPending
				message.ResultOperationID = operation.ID
			}
		}
		for _, id := range ids {
			if !foundSources[id] {
				return fmt.Errorf("source mailbox message not found: %s", id)
			}
		}
		store.Outbox.Operations = appendUniqueMailboxOperation(store.Outbox.Operations, operation)
		return nil
	})
	return err
}

func updateMailboxNotificationOperation(workspacePath, sourceMessageID string, mutate func(*resourceMailboxNotificationOp)) error {
	source, found, err := mailboxMessageByID(workspacePath, sourceMessageID)
	if err != nil || !found {
		return err
	}
	lock := resourceMailboxLock(workspacePath, source.ResourceID)
	lock.Lock()
	defer lock.Unlock()
	store, err := loadResourceMailboxStoreInternal(workspacePath, source.ResourceID)
	if err != nil {
		return err
	}
	before := cloneResourceMailboxStore(store)
	for index := range store.Outbox.Operations {
		if mailboxOperationHasSource(store.Outbox.Operations[index], sourceMessageID) {
			mutate(&store.Outbox.Operations[index])
			store.Outbox.Operations[index].UpdatedAt = time.Now().Format(time.RFC3339Nano)
		}
	}
	return persistResourceMailboxStore(workspacePath, store, before)
}

func removeMailboxNotificationOperation(workspacePath, sourceMessageID string) error {
	source, found, err := mailboxMessageByID(workspacePath, sourceMessageID)
	if err != nil || !found {
		return err
	}
	lock := resourceMailboxLock(workspacePath, source.ResourceID)
	lock.Lock()
	defer lock.Unlock()
	store, err := loadResourceMailboxStoreInternal(workspacePath, source.ResourceID)
	if err != nil {
		return err
	}
	before := cloneResourceMailboxStore(store)
	kept := store.Outbox.Operations[:0]
	for _, operation := range store.Outbox.Operations {
		if !mailboxOperationHasSource(operation, sourceMessageID) {
			kept = append(kept, operation)
		}
	}
	store.Outbox.Operations = kept
	return persistResourceMailboxStore(workspacePath, store, before)
}

func pendingResourceMailboxNotificationOperations(workspacePath string) ([]resourceMailboxNotificationOp, error) {
	if err := migrateLegacyResourceMailbox(workspacePath); err != nil {
		return nil, err
	}
	resourceIDs, err := listResourceMailboxResourceIDs(workspacePath)
	if err != nil {
		return nil, err
	}
	operations := make([]resourceMailboxNotificationOp, 0)
	for _, resourceID := range resourceIDs {
		store, loadErr := loadResourceMailboxStoreForRead(workspacePath, resourceID)
		if loadErr != nil {
			return nil, loadErr
		}
		for _, operation := range store.Outbox.Operations {
			if operation.Status != resourceNotificationDelivered && operation.Status != resourceNotificationTerminal {
				operations = append(operations, cloneMailboxOperation(operation))
			}
		}
	}
	sort.SliceStable(operations, func(i, j int) bool {
		if operations[i].UpdatedAt != operations[j].UpdatedAt {
			return operations[i].UpdatedAt < operations[j].UpdatedAt
		}
		return operations[i].ID < operations[j].ID
	})
	return operations, nil
}
