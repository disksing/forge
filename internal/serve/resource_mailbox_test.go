package serve

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/disksing/forge/internal/app"
)

func acceptTestResourceMessage(t *testing.T, manager *agentManager, workspace guiWorkspace, resourceID, text, mode string, sender *agentHubMessageSender) resourceMailboxMessage {
	t.Helper()
	message, err := manager.acceptResourceMessage(context.Background(), workspace, resourceID, resourceMessageRequest{
		Text: text, Mode: mode, Role: "agent", Sender: sender,
	})
	if err != nil {
		t.Fatal(err)
	}
	return message
}

func TestPublicResourceStateKeepsWaitingOutOfTaskState(t *testing.T) {
	tests := []struct {
		name         string
		archived     bool
		unavailable  string
		generation   *resourceGenerationStatus
		session      *resourceSessionStatus
		runtimeError string
		want         string
	}{
		{name: "idle", want: "idle"},
		{name: "working generation", generation: &resourceGenerationStatus{Status: "starting"}, want: "working"},
		{name: "working turn", session: &resourceSessionStatus{State: "running"}, want: "working"},
		{name: "approval", session: &resourceSessionStatus{State: "waiting_approval"}, want: "attention_required"},
		{name: "configuration", unavailable: "missing route", want: "unavailable"},
		{name: "runtime", runtimeError: "unreachable", want: "unavailable"},
		{name: "archived wins", archived: true, unavailable: "missing route", want: "archived"},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			if got := publicResourceState(test.archived, test.unavailable, test.generation, test.session, test.runtimeError); got != test.want {
				t.Fatalf("public state = %q, want %q", got, test.want)
			}
		})
	}
}

func TestWorkspaceMailboxMigratesGenerationQueuesIdempotently(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	_, workspace, _ := newRuntimeTestManager(t, hub.URL)
	steer := false
	legacy := agentRun{
		ID: "run-legacy", WorkspaceID: workspace.ID, ResourceID: "project1.task1",
		Generation: 3, GenerationID: "gen-legacy", AgentHubSessionID: "ses-legacy",
		Title: "legacy", Cwd: workspace.Path, Status: "running",
		CreatedAt: "2026-08-12T10:00:00Z", UpdatedAt: "2026-08-12T10:01:00Z",
		PendingMessages: []resourceInboundMessage{{
			ID: "msg-legacy", Text: "preserve me", Role: "agent",
			Sender: &agentHubMessageSender{ID: "project1.task2", Name: "project1.task2"},
			Steer:  &steer, AcceptedAt: "2026-08-12T10:00:30Z",
		}},
	}
	if err := saveAgentRun(workspace.Path, legacy); err != nil {
		t.Fatal(err)
	}
	for attempt := 0; attempt < 2; attempt++ {
		if err := migrateLegacyResourceMailbox(workspace.Path); err != nil {
			t.Fatal(err)
		}
	}
	mailbox, err := loadResourceMailbox(workspace.Path)
	if err != nil {
		t.Fatal(err)
	}
	if len(mailbox.Messages) != 1 {
		t.Fatalf("migration duplicated or lost messages: %#v", mailbox.Messages)
	}
	message := mailbox.Messages[0]
	if message.ID != "msg-legacy" || message.ResourceID != "project1.task1" || message.Text != "preserve me" ||
		message.RequestedMode != resourceMessageModeSteer || message.ActualMode != resourceMessageModeEnqueue ||
		!message.ModeFrozen ||
		message.GenerationID != "gen-legacy" || message.AgentHubSessionID != "ses-legacy" ||
		message.AcceptedAt != "2026-08-12T10:00:30Z" || message.Sender == nil || message.Sender.ID != "project1.task2" {
		t.Fatalf("migrated message mismatch: %#v", message)
	}
	runs, err := loadAgentRuns(workspace.Path)
	if err != nil {
		t.Fatal(err)
	}
	if len(runs) != 1 || len(runs[0].PendingMessages) != 0 {
		t.Fatalf("legacy generation queue was not cleared: %#v", runs)
	}
}

func TestResourceMailboxVersionOneMigratesToBoundedReceiptWithoutLosingMessage(t *testing.T) {
	root := t.TempDir()
	if err := os.MkdirAll(agentRoot(root), 0o700); err != nil {
		t.Fatal(err)
	}
	legacy := `{"version":1,"nextSequence":1,"messages":[{"id":"msg-v1","sequence":1,"resourceId":"workspace","text":"legacy","role":"user","requestedMode":"enqueue","actualMode":"enqueue","status":"delivered","acceptedAt":"2026-08-12T00:00:00Z","updatedAt":"2026-08-12T00:00:00Z"}]}`
	if err := os.WriteFile(resourceMailboxPath(root), []byte(legacy), 0o600); err != nil {
		t.Fatal(err)
	}
	mailbox, err := loadResourceMailbox(root)
	if err != nil || mailbox.Version != resourceMailboxVersion || len(mailbox.Messages) != 1 || mailbox.Messages[0].ID != "msg-v1" {
		t.Fatalf("v1 mailbox upgrade = %#v, %v", mailbox, err)
	}
	if err := migrateLegacyResourceMailbox(root); err != nil {
		t.Fatal(err)
	}
	data, err := os.ReadFile(resourceMailboxPath(root))
	if err != nil || string(data) != legacy {
		t.Fatalf("legacy mailbox was not retained as rollback evidence = %s, %v", data, err)
	}
	store, err := loadResourceMailboxStoreInternal(root, "workspace")
	if err != nil || len(store.Receipts.Receipts) != 1 || store.Receipts.Receipts[0].ID != "msg-v1" {
		t.Fatalf("migrated receipt store = %#v, %v", store.Receipts, err)
	}
	if message, found, lookupErr := mailboxMessageByID(root, "msg-v1"); lookupErr != nil || !found || !message.receipt || message.Text != "" {
		t.Fatalf("migrated cold receipt lookup = %#v, found=%v err=%v", message, found, lookupErr)
	}
	var marker resourceMailboxMigrationMarker
	if found, markerErr := readResourceMailboxJSON(resourceMailboxMigrationPath(root), &marker); markerErr != nil || !found || marker.Status != "committed" {
		t.Fatalf("migration marker = %#v, found=%v err=%v", marker, found, markerErr)
	}
}

func TestResourceMailboxReceiptRetentionReturnsStableExpiredError(t *testing.T) {
	root := t.TempDir()
	if _, err := app.Initialize(root, "en"); err != nil {
		t.Fatal(err)
	}
	previousCount, previousWindow := resourceMailboxReceiptRetentionCount, resourceMailboxReceiptRetentionWindow
	previousExpiredCount, previousExpiredWindow := resourceMailboxExpiredRetentionCount, resourceMailboxExpiredRetentionWindow
	defer func() {
		resourceMailboxReceiptRetentionCount, resourceMailboxReceiptRetentionWindow = previousCount, previousWindow
		resourceMailboxExpiredRetentionCount, resourceMailboxExpiredRetentionWindow = previousExpiredCount, previousExpiredWindow
	}()
	resourceMailboxReceiptRetentionCount = 2
	resourceMailboxReceiptRetentionWindow = 0
	resourceMailboxExpiredRetentionCount = 8
	resourceMailboxExpiredRetentionWindow = 24 * time.Hour
	now := time.Now()
	_, err := mutateResourceMailboxForResource(root, "workspace", func(mailbox *resourceMailbox) error {
		for index := 0; index < 3; index++ {
			stamp := now.Add(time.Duration(index-3) * time.Minute).Format(time.RFC3339Nano)
			mailbox.NextSequence++
			mailbox.Messages = append(mailbox.Messages, resourceMailboxMessage{
				ID: fmt.Sprintf("msg-retention-%d", index), Sequence: mailbox.NextSequence, ResourceID: "workspace",
				Text: fmt.Sprintf("body-%d", index), Role: "user", RequestedMode: resourceMessageModeEnqueue,
				ActualMode: resourceMessageModeEnqueue, Status: resourceMessageDelivered, AcceptedAt: stamp,
				UpdatedAt: stamp, DeliveredAt: stamp, TerminalAt: stamp,
			})
		}
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
	store, err := loadResourceMailboxStoreForRead(root, "workspace")
	if err != nil {
		t.Fatal(err)
	}
	if len(store.Receipts.Receipts) != 2 || len(store.Receipts.Expired) != 1 {
		t.Fatalf("receipt retention counts = receipts=%d expired=%d", len(store.Receipts.Receipts), len(store.Receipts.Expired))
	}
	latest, found, err := mailboxMessageByID(root, "msg-retention-2")
	if err != nil || !found || !latest.receipt || latest.Text != "" {
		t.Fatalf("retained receipt = %#v, found=%v err=%v", latest, found, err)
	}
	_, found, err = mailboxMessageByID(root, "msg-retention-0")
	var apiErr *resourceAPIError
	if found || !errors.As(err, &apiErr) || apiErr.Code != "message_receipt_expired" || resourceErrorStatus(err) != http.StatusGone {
		t.Fatalf("expired receipt lookup = found=%v err=%v", found, err)
	}
	manager := newNotificationTestManager(t, "http://127.0.0.1:1", []guiWorkspace{{ID: "workspace", Path: root}})
	recorder := httptest.NewRecorder()
	manager.handleResourceMessage(recorder, httptest.NewRequest(http.MethodGet, "/messages/msg-retention-0", nil), "workspace", "msg-retention-0")
	if recorder.Code != http.StatusGone || !strings.Contains(recorder.Body.String(), `"code":"message_receipt_expired"`) {
		t.Fatalf("expired receipt HTTP response = %d %s", recorder.Code, recorder.Body.String())
	}
}

func TestResourceMailboxHotStoreIsBoundedIndependentlyOfReceiptHistory(t *testing.T) {
	root := t.TempDir()
	if _, err := app.Initialize(root, "en"); err != nil {
		t.Fatal(err)
	}
	previousCount, previousWindow := resourceMailboxReceiptRetentionCount, resourceMailboxReceiptRetentionWindow
	defer func() {
		resourceMailboxReceiptRetentionCount, resourceMailboxReceiptRetentionWindow = previousCount, previousWindow
	}()
	resourceMailboxReceiptRetentionCount = 32
	resourceMailboxReceiptRetentionWindow = 0
	const completed = 10000
	_, err := mutateResourceMailboxForResource(root, "workspace", func(mailbox *resourceMailbox) error {
		for index := 0; index < completed; index++ {
			stamp := "2026-08-13T00:00:00Z"
			mailbox.NextSequence++
			mailbox.Messages = append(mailbox.Messages, resourceMailboxMessage{
				ID: "msg-scale-" + fmt.Sprint(index), Sequence: mailbox.NextSequence, ResourceID: "workspace",
				Text: "completed body that must leave hot storage", Role: "user", RequestedMode: resourceMessageModeEnqueue,
				ActualMode: resourceMessageModeEnqueue, Status: resourceMessageDelivered, AcceptedAt: stamp,
				UpdatedAt: stamp, DeliveredAt: stamp, TerminalAt: stamp,
			})
		}
		mailbox.NextSequence++
		mailbox.Messages = append(mailbox.Messages, resourceMailboxMessage{
			ID: "msg-scale-pending", Sequence: mailbox.NextSequence, ResourceID: "workspace", Text: "pending body",
			Role: "user", RequestedMode: resourceMessageModeEnqueue, ActualMode: resourceMessageModeEnqueue,
			Status: resourceMessageQueued, AcceptedAt: time.Now().Format(time.RFC3339Nano), UpdatedAt: time.Now().Format(time.RFC3339Nano),
		})
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
	hot, err := loadHotResourceMailbox(root, "workspace")
	if err != nil {
		t.Fatal(err)
	}
	store, err := loadResourceMailboxStoreForRead(root, "workspace")
	if err != nil {
		t.Fatal(err)
	}
	if len(hot.Messages) != 1 || hot.Messages[0].ID != "msg-scale-pending" || len(store.Receipts.Receipts) != 32 {
		t.Fatalf("hot/receipt scale bounds = hot=%d %#v receipts=%d", len(hot.Messages), hot.Messages, len(store.Receipts.Receipts))
	}
}

func TestResourceMailboxModesAndPriority(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	fake.enforceMessageIDs = true
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	sender := &agentHubMessageSender{ID: "project1.task2", Name: "project1.task2"}

	first := acceptTestResourceMessage(t, manager, workspace, "project1.task1", "first", resourceMessageModeSteer, sender)
	if first.Status != resourceMessageDelivered || first.RequestedMode != resourceMessageModeSteer ||
		first.ActualMode != resourceMessageModeEnqueue || first.DowngradeReason != resourceMessageReasonNoActiveTurn {
		t.Fatalf("first message did not open a normal Turn: %#v", first)
	}
	run, found, err := currentResourceGeneration(workspace.Path, "project1.task1")
	if err != nil || !found {
		t.Fatalf("current generation missing: found=%v err=%v", found, err)
	}
	forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		t.Fatal(err)
	}
	runtimeConfig, err := forgeWorkspace.RuntimeConfig()
	if err != nil {
		t.Fatal(err)
	}
	fake.mu.Lock()
	session := fake.sessions[run.AgentHubSessionID]
	if session.LaunchEnvironment["FORGE_WORKSPACE_ROOT"] != workspace.Path ||
		session.LaunchEnvironment["FORGE_WORKSPACE_INSTANCE_ID"] != runtimeConfig.InstanceID ||
		session.LaunchEnvironment["FORGE_RESOURCE_ID"] != "project1.task1" {
		fake.mu.Unlock()
		t.Fatalf("resource generation creator environment = %#v", session.LaunchEnvironment)
	}
	session.InputCapabilities.Steer = true
	session.CurrentTurnID = "turn-first"
	fake.sessions[session.ID] = session
	fake.mu.Unlock()

	enqueued := acceptTestResourceMessage(t, manager, workspace, "project1.task1", "queued", resourceMessageModeEnqueue, sender)
	if enqueued.Status != resourceMessageQueued || enqueued.ActualMode != resourceMessageModeEnqueue {
		t.Fatalf("enqueue entered the active Turn: %#v", enqueued)
	}
	steered := acceptTestResourceMessage(t, manager, workspace, "project1.task1", "urgent steer", resourceMessageModeSteer, sender)
	if steered.Status != resourceMessageDelivered || steered.ActualMode != resourceMessageModeSteer {
		t.Fatalf("steer did not bypass the queued enqueue: %#v", steered)
	}
	promoted, err := manager.promoteWaitingMessage(context.Background(), workspace, enqueued.ID)
	if err != nil {
		t.Fatal(err)
	}
	if promoted.ID != enqueued.ID || promoted.Status != resourceMessageDelivered || promoted.ActualMode != resourceMessageModeSteer ||
		promoted.RequestedMode != resourceMessageModeEnqueue || promoted.PromotedAt == "" {
		t.Fatalf("waiting message was not promoted in place: %#v", promoted)
	}
	fake.mu.Lock()
	defer fake.mu.Unlock()
	if len(fake.messageSteers) != 3 || fake.messageSteers[0] || !fake.messageSteers[1] || !fake.messageSteers[2] {
		t.Fatalf("AgentHub delivery order/modes mismatch: %#v", fake.messageSteers)
	}
	if fake.messageSenders[0] == nil || fake.messageSenders[0].ID != "project1.task2" || fake.messageRoles[0] != "agent" {
		t.Fatalf("agent provenance was not preserved: roles=%#v senders=%#v", fake.messageRoles, fake.messageSenders)
	}
}

func TestResourceMailboxSteerDowngradeAndInterrupt(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	fake.enforceMessageIDs = true
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	sender := &agentHubMessageSender{ID: "project1.task2"}

	_ = acceptTestResourceMessage(t, manager, workspace, "project1.task1", "first", resourceMessageModeSteer, sender)
	run, found, err := currentResourceGeneration(workspace.Path, "project1.task1")
	if err != nil || !found {
		t.Fatal("generation missing")
	}
	fake.mu.Lock()
	session := fake.sessions[run.AgentHubSessionID]
	session.CurrentTurnID = "turn-current"
	fake.sessions[session.ID] = session
	fake.mu.Unlock()

	downgraded := acceptTestResourceMessage(t, manager, workspace, "project1.task1", "wait", resourceMessageModeSteer, sender)
	if downgraded.Status != resourceMessageQueued || downgraded.ActualMode != resourceMessageModeEnqueue ||
		downgraded.DowngradeReason != resourceMessageReasonSteerUnsupported {
		t.Fatalf("unsupported steer did not durably downgrade: %#v", downgraded)
	}
	interrupted := acceptTestResourceMessage(t, manager, workspace, "project1.task1", "replace current turn", resourceMessageModeInterrupt, sender)
	if interrupted.Status != resourceMessageDelivered || interrupted.RequestedMode != resourceMessageModeInterrupt ||
		interrupted.ActualMode != resourceMessageModeInterrupt || interrupted.InterruptTurnID != "turn-current" {
		t.Fatalf("interrupt did not wait for termination and open a new Turn: %#v", interrupted)
	}
	fake.mu.Lock()
	if len(fake.actions) == 0 || fake.actions[0] != "interrupt" {
		fake.mu.Unlock()
		t.Fatalf("interrupt action missing: %#v", fake.actions)
	}
	fake.mu.Unlock()
	fake.mu.Lock()
	session = fake.sessions[run.AgentHubSessionID]
	session.State = "ready"
	session.CurrentTurnID = ""
	fake.sessions[session.ID] = session
	fake.mu.Unlock()
	err = manager.withResourceController(context.Background(), workspace, "project1.task1", func() error {
		return manager.reconcileResourceMailboxLocked(context.Background(), workspace, "project1.task1")
	})
	if err != nil {
		t.Fatal(err)
	}
	downgraded, found, err = mailboxMessageByID(workspace.Path, downgraded.ID)
	if err != nil || !found || downgraded.Status != resourceMessageDelivered ||
		downgraded.ActualMode != resourceMessageModeEnqueue || downgraded.DowngradeReason != resourceMessageReasonSteerUnsupported {
		t.Fatalf("unsupported steer decision drifted during recovery: found=%v err=%v message=%#v", found, err, downgraded)
	}
}

func TestResourceMailboxInterruptRetiresReplacingGeneration(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	_ = acceptTestResourceMessage(t, manager, workspace, "project1.task1", "first", resourceMessageModeSteer, nil)
	oldRun, found, err := currentResourceGeneration(workspace.Path, "project1.task1")
	if err != nil || !found {
		t.Fatal("generation missing")
	}
	runtime := manager.runtimeByID(oldRun.ID)
	if runtime == nil {
		t.Fatal("runtime missing")
	}
	if _, err := runtime.mutateRun(func(run *agentRun) { run.ReplacementPending = true }); err != nil {
		t.Fatal(err)
	}
	fake.mu.Lock()
	session := fake.sessions[oldRun.AgentHubSessionID]
	session.State = "running"
	session.CurrentTurnID = "turn-before-replacement"
	fake.sessions[session.ID] = session
	fake.mu.Unlock()

	message := acceptTestResourceMessage(t, manager, workspace, "project1.task1", "interrupt and replace", resourceMessageModeInterrupt, nil)
	if message.Status != resourceMessageQueued || message.InterruptAt == "" {
		t.Fatalf("interrupt did not stop at the replacement boundary: %#v", message)
	}
	deadline := time.Now().Add(5 * time.Second)
	for time.Now().Before(deadline) {
		message, found, err = mailboxMessageByID(workspace.Path, message.ID)
		current, currentFound, currentErr := currentResourceGeneration(workspace.Path, "project1.task1")
		if err == nil && found && currentErr == nil && currentFound && current.Generation > oldRun.Generation && message.Status == resourceMessageDelivered {
			// The generation and mailbox files become observable before the
			// retirement goroutine publishes its final notice. Join that bounded
			// critical section so TempDir cleanup cannot race the last disk write.
			if err := manager.withResourceController(context.Background(), workspace, "project1.task1", func() error { return nil }); err != nil {
				t.Fatalf("join resource controller: %v", err)
			}
			if message.GenerationID == oldRun.GenerationID {
				t.Fatalf("interrupt message was delivered to the retired generation: %#v", message)
			}
			fake.mu.Lock()
			defer fake.mu.Unlock()
			if len(fake.actions) == 0 || fake.actions[0] != "interrupt" {
				t.Fatalf("old Turn was not interrupted first: %#v", fake.actions)
			}
			return
		}
		time.Sleep(10 * time.Millisecond)
	}
	t.Fatalf("replacement did not receive the interrupt message: found=%v err=%v message=%#v", found, err, message)
}

func TestResourceMailboxArchiveTerminatesPendingMessages(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	_ = acceptTestResourceMessage(t, manager, workspace, "project1.task1", "first", resourceMessageModeSteer, nil)
	pending := acceptTestResourceMessage(t, manager, workspace, "project1.task1", "later", resourceMessageModeEnqueue, nil)
	unknown := acceptTestResourceMessage(t, manager, workspace, "project1.task1", "outcome unknown", resourceMessageModeEnqueue, nil)
	unknown, err := updateMailboxMessage(workspace.Path, unknown.ID, func(message *resourceMailboxMessage) {
		message.Status = resourceMessageDelivering
		message.AttemptCount = 1
	})
	if err != nil {
		t.Fatal(err)
	}
	forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := forgeWorkspace.ArchiveResource("project1.task1"); err != nil {
		t.Fatal(err)
	}
	err = manager.withResourceController(context.Background(), workspace, "project1.task1", func() error {
		return manager.reconcileResourceMailboxLocked(context.Background(), workspace, "project1.task1")
	})
	if err != nil {
		t.Fatal(err)
	}
	pending, found, err := mailboxMessageByID(workspace.Path, pending.ID)
	if err != nil || !found || pending.Status != resourceMessageUndeliverable || pending.DowngradeReason != resourceMessageReasonResourceArchived || pending.LastErrorCode != "resource_archived" {
		t.Fatalf("archived mailbox item mismatch: found=%v err=%v message=%#v", found, err, pending)
	}
	unknown, found, err = mailboxMessageByID(workspace.Path, unknown.ID)
	if err != nil || !found || unknown.Status != resourceMessageDeliveryUnknown || unknown.LastErrorCode != "resource_archived" {
		t.Fatalf("archived unknown-outcome item mismatch: found=%v err=%v message=%#v", found, err, unknown)
	}
	_, err = acceptTestResourceMessageWithError(manager, workspace, "project1.task1")
	var apiErr *resourceAPIError
	if !errors.As(err, &apiErr) || apiErr.Code != "resource_archived" {
		t.Fatalf("archived resource accepted a new message: %v", err)
	}
}

func TestResourceMailboxArchiveRaceEitherRejectsOrTerminatesAcceptedMessage(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, configPath := newRuntimeTestManager(t, hub.URL)
	configData, _ := json.Marshal(agentHubGUIConfig{
		Version: agentHubConfigVersion, Workspaces: []guiWorkspace{workspace},
		AgentHubEndpoint: hub.URL, AgentHubInstanceID: "forge-runtime-test",
	})
	if err := os.WriteFile(configPath, configData, 0o600); err != nil {
		t.Fatal(err)
	}

	start := make(chan struct{})
	var sent resourceMailboxMessage
	var sendErr error
	var archiveCode int
	var wait sync.WaitGroup
	wait.Add(2)
	go func() {
		defer wait.Done()
		<-start
		sent, sendErr = manager.acceptResourceMessage(context.Background(), workspace, "project1.task1", resourceMessageRequest{Text: "race", Mode: resourceMessageModeEnqueue})
	}()
	go func() {
		defer wait.Done()
		<-start
		recorder := httptest.NewRecorder()
		request := httptest.NewRequest(http.MethodPost, "/api/workspaces/"+workspace.ID+"/archive", strings.NewReader(`{"resourceId":"project1.task1"}`))
		manager.server.archiveResource(recorder, request, workspace.ID)
		archiveCode = recorder.Code
	}()
	close(start)
	wait.Wait()
	if archiveCode != http.StatusOK {
		t.Fatalf("archive race did not converge: status=%d", archiveCode)
	}
	if sendErr != nil {
		var apiErr *resourceAPIError
		if !errors.As(sendErr, &apiErr) || apiErr.Code != "resource_archived" {
			t.Fatalf("race rejected send with the wrong error: %v", sendErr)
		}
		return
	}
	terminal, found, err := mailboxMessageByID(workspace.Path, sent.ID)
	if err != nil || !found || terminal.Status != resourceMessageUndeliverable || terminal.LastErrorCode != "resource_archived" {
		t.Fatalf("accepted race message lacked an archive terminal: found=%v err=%v message=%#v", found, err, terminal)
	}
}

func TestResourceMailboxPersistsBindingAndTemporaryDeliveryErrors(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	manager, workspace, configPath := newRuntimeTestManager(t, hub.URL)
	configData, _ := json.Marshal(agentHubGUIConfig{
		Version: agentHubConfigVersion, Workspaces: []guiWorkspace{workspace},
		AgentHubEndpoint: hub.URL, AgentHubInstanceID: "forge-runtime-test",
	})
	if err := os.WriteFile(configPath, configData, 0o600); err != nil {
		t.Fatal(err)
	}
	message := acceptTestResourceMessage(t, manager, workspace, "project1.task1", "wait for binding", resourceMessageModeSteer, nil)
	if message.Status != resourceMessageQueued || message.LastErrorCode != "binding_unavailable" {
		t.Fatalf("binding failure was not queryable: %#v", message)
	}

	// Restore a valid binding but make AgentHub unreachable. The same accepted
	// message remains queued and reports a distinct retryable delivery class.
	hub.Close()
	configData, _ = json.Marshal(agentHubGUIConfig{
		Version: agentHubConfigVersion, Workspaces: []guiWorkspace{workspace},
		AgentHubEndpoint: hub.URL, AgentHubInstanceID: "forge-runtime-test",
		AgentProfiles: []agentHubProfileRoute{{Key: "default", AgentName: "fake-agent"}},
	})
	if err := os.WriteFile(configPath, configData, 0o600); err != nil {
		t.Fatal(err)
	}
	err := manager.withResourceController(context.Background(), workspace, "project1.task1", func() error {
		return manager.reconcileResourceMailboxLocked(context.Background(), workspace, "project1.task1")
	})
	if err == nil {
		t.Fatal("unreachable AgentHub unexpectedly reconciled")
	}
	message, found, loadErr := mailboxMessageByID(workspace.Path, message.ID)
	if loadErr != nil || !found || message.Status != resourceMessageQueued || message.LastErrorCode != "temporarily_undeliverable" {
		t.Fatalf("temporary delivery failure was not retained: found=%v err=%v message=%#v", found, loadErr, message)
	}
}

func TestResourceMailboxSeparatesTargetsAndRejectsPersistenceFailure(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	projectMessage := acceptTestResourceMessage(t, manager, workspace, "project1", "project", resourceMessageModeSteer, nil)
	taskMessage := acceptTestResourceMessage(t, manager, workspace, "project1.task1", "task", resourceMessageModeSteer, nil)
	mailbox, err := loadResourceMailbox(workspace.Path)
	if err != nil {
		t.Fatal(err)
	}
	projectCounts, _, _ := mailboxCounts(mailbox, "project1")
	taskCounts, _, _ := mailboxCounts(mailbox, "project1.task1")
	if projectMessage.ID == taskMessage.ID || projectCounts.Delivered != 1 || taskCounts.Delivered != 1 {
		t.Fatalf("resource mailbox targets were not independent: project=%#v task=%#v", projectCounts, taskCounts)
	}

	brokenWorkspace := t.TempDir()
	if _, err := app.Initialize(brokenWorkspace, "en"); err != nil {
		t.Fatal(err)
	}
	if err := ensureAgentDirs(brokenWorkspace); err != nil {
		t.Fatal(err)
	}
	if err := os.Mkdir(resourceMailboxPath(brokenWorkspace), 0o700); err != nil {
		t.Fatal(err)
	}
	if _, err := acceptMailboxMessage(brokenWorkspace, "workspace", resourceMessageRequest{Text: "must not accept"}); err == nil {
		t.Fatal("mailbox persistence failure was reported as accepted")
	}
}

func TestResourceServerAPIStatusSendAndMessageQuery(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)

	sendRequest := httptest.NewRequest(http.MethodPost, "/api/workspaces/"+workspace.ID+"/resources/project1.task1/messages", strings.NewReader(`{"text":"coordinate","mode":"steer","role":"agent","sender":{"id":"project1.task2","name":"Task two"}}`))
	sendRecorder := httptest.NewRecorder()
	manager.server.handleWorkspace(sendRecorder, sendRequest)
	if sendRecorder.Code != http.StatusAccepted {
		t.Fatalf("resource send failed: %d %s", sendRecorder.Code, sendRecorder.Body.String())
	}
	var sent resourceMessageResponse
	if err := json.Unmarshal(sendRecorder.Body.Bytes(), &sent); err != nil {
		t.Fatal(err)
	}
	if sent.MessageID == "" || sent.ResourceID != "project1.task1" || sent.RequestedMode != resourceMessageModeSteer ||
		sent.ActualMode != resourceMessageModeSteer || sent.Status != "waiting" || !strings.Contains(sent.Reference, sent.MessageID) {
		t.Fatalf("send response mismatch: %#v", sent)
	}

	statusRequest := httptest.NewRequest(http.MethodGet, "/api/workspaces/"+workspace.ID+"/resources/project1.task1/status", nil)
	statusRecorder := httptest.NewRecorder()
	manager.server.handleWorkspace(statusRecorder, statusRequest)
	if statusRecorder.Code != http.StatusOK {
		t.Fatalf("resource status failed: %d %s", statusRecorder.Code, statusRecorder.Body.String())
	}
	var status resourceStatusResponse
	if err := json.Unmarshal(statusRecorder.Body.Bytes(), &status); err != nil {
		t.Fatal(err)
	}
	if !status.Exists || !status.AcceptsMessages || status.Archived || status.State != "working" || status.Generation == nil || status.Session == nil || status.Messages.Delivered != 1 ||
		status.Creator == nil || status.Creator.Kind != app.CreatorKindUser {
		t.Fatalf("resource status mismatch: %#v", status)
	}

	messageRequest := httptest.NewRequest(http.MethodGet, "/api/workspaces/"+workspace.ID+"/messages/"+sent.MessageID, nil)
	messageRecorder := httptest.NewRecorder()
	manager.server.handleWorkspace(messageRecorder, messageRequest)
	if messageRecorder.Code != http.StatusOK {
		t.Fatalf("message query failed: %d %s", messageRecorder.Code, messageRecorder.Body.String())
	}
	var queried resourceMessageResponse
	if err := json.Unmarshal(messageRecorder.Body.Bytes(), &queried); err != nil {
		t.Fatal(err)
	}
	if queried.MessageID != sent.MessageID || queried.Status != resourceMessageDelivered {
		t.Fatalf("message query mismatch: %#v", queried)
	}
}

func TestResourceServerAPIListsAndSteersWaitingMessageInPlace(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)

	_ = acceptTestResourceMessage(t, manager, workspace, "project1.task1", "start", resourceMessageModeSteer, nil)
	run, found, err := currentResourceGeneration(workspace.Path, "project1.task1")
	if err != nil || !found {
		t.Fatalf("generation missing: found=%v err=%v", found, err)
	}
	fake.mu.Lock()
	session := fake.sessions[run.AgentHubSessionID]
	session.State = "running"
	session.CurrentTurnID = "turn-active"
	session.InputCapabilities.Steer = true
	fake.sessions[session.ID] = session
	fake.mu.Unlock()

	waiting := acceptTestResourceMessage(t, manager, workspace, "project1.task1", "move this now", resourceMessageModeEnqueue, nil)
	statusRecorder := httptest.NewRecorder()
	manager.server.handleWorkspace(statusRecorder, httptest.NewRequest(http.MethodGet, "/api/workspaces/"+workspace.ID+"/resources/project1.task1/status", nil))
	if statusRecorder.Code != http.StatusOK {
		t.Fatalf("status failed: %d %s", statusRecorder.Code, statusRecorder.Body.String())
	}
	var status resourceStatusResponse
	if err := json.Unmarshal(statusRecorder.Body.Bytes(), &status); err != nil {
		t.Fatal(err)
	}
	if status.State != "working" || !status.CanSteerWaiting || status.Messages.Waiting != 1 || len(status.WaitingMessages) != 1 ||
		status.WaitingMessages[0].MessageID != waiting.ID || status.WaitingMessages[0].Text != "move this now" || status.WaitingMessages[0].Status != "waiting" {
		t.Fatalf("waiting projection mismatch: %#v", status)
	}

	steerRecorder := httptest.NewRecorder()
	manager.server.handleWorkspace(steerRecorder, httptest.NewRequest(http.MethodPost, "/api/workspaces/"+workspace.ID+"/messages/"+waiting.ID+"/steer", nil))
	if steerRecorder.Code != http.StatusOK {
		t.Fatalf("steer failed: %d %s", steerRecorder.Code, steerRecorder.Body.String())
	}
	var promoted resourceMessageResponse
	if err := json.Unmarshal(steerRecorder.Body.Bytes(), &promoted); err != nil {
		t.Fatal(err)
	}
	if promoted.MessageID != waiting.ID || promoted.RequestedMode != resourceMessageModeEnqueue || promoted.ActualMode != resourceMessageModeSteer ||
		promoted.Status != resourceMessageDelivered || promoted.PromotedAt == "" {
		t.Fatalf("promoted response mismatch: %#v", promoted)
	}
}

func TestResourceServerAPISteerUnavailableLeavesWaitingMessageUnchanged(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)

	_ = acceptTestResourceMessage(t, manager, workspace, "project1.task1", "start", resourceMessageModeSteer, nil)
	waiting := acceptTestResourceMessage(t, manager, workspace, "project1.task1", "keep waiting", resourceMessageModeEnqueue, nil)
	recorder := httptest.NewRecorder()
	manager.server.handleWorkspace(recorder, httptest.NewRequest(http.MethodPost, "/api/workspaces/"+workspace.ID+"/messages/"+waiting.ID+"/steer", nil))
	var response map[string]any
	if err := json.Unmarshal(recorder.Body.Bytes(), &response); err != nil {
		t.Fatal(err)
	}
	if recorder.Code != http.StatusConflict || response["code"] != "steer_unavailable" {
		t.Fatalf("unexpected unavailable response: status=%d body=%#v", recorder.Code, response)
	}
	unchanged, found, err := mailboxMessageByID(workspace.Path, waiting.ID)
	if err != nil || !found || unchanged.Status != resourceMessageQueued || unchanged.ActualMode != resourceMessageModeEnqueue || unchanged.PromotedAt != "" {
		t.Fatalf("failed steer mutated the waiting item: found=%v err=%v message=%#v", found, err, unchanged)
	}
}

func TestResourceServerAPIStructuredErrors(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	tests := []struct {
		name, method, path, body, code string
		status                         int
	}{
		{name: "invalid request", method: http.MethodPost, path: "/api/workspaces/" + workspace.ID + "/resources/project1.task1/messages", body: `{"text":"hello","mode":"later"}`, code: "invalid_request", status: http.StatusBadRequest},
		{name: "missing resource", method: http.MethodPost, path: "/api/workspaces/" + workspace.ID + "/resources/project9.task9/messages", body: `{"text":"hello"}`, code: "resource_not_found", status: http.StatusNotFound},
		{name: "missing message", method: http.MethodGet, path: "/api/workspaces/" + workspace.ID + "/messages/msg-missing", code: "message_not_found", status: http.StatusNotFound},
		{name: "steer missing message", method: http.MethodPost, path: "/api/workspaces/" + workspace.ID + "/messages/msg-missing/steer", code: "message_not_found", status: http.StatusNotFound},
		{name: "workspace not owned", method: http.MethodGet, path: "/api/workspaces/not-owned/resources/workspace/status", code: "workspace_not_owned", status: http.StatusNotFound},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			request := httptest.NewRequest(test.method, test.path, strings.NewReader(test.body))
			recorder := httptest.NewRecorder()
			manager.server.handleWorkspace(recorder, request)
			var response map[string]any
			if err := json.Unmarshal(recorder.Body.Bytes(), &response); err != nil {
				t.Fatal(err)
			}
			if recorder.Code != test.status || response["code"] != test.code {
				t.Fatalf("structured error mismatch: status=%d response=%#v", recorder.Code, response)
			}
		})
	}
}

func acceptTestResourceMessageWithError(manager *agentManager, workspace guiWorkspace, resourceID string) (resourceMailboxMessage, error) {
	return manager.acceptResourceMessage(context.Background(), workspace, resourceID, resourceMessageRequest{Text: "no", Mode: resourceMessageModeSteer})
}
