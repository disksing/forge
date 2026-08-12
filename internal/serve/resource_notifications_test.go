package serve

import (
	"context"
	"encoding/json"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/disksing/forge/internal/app"
)

func newNotificationTestManager(t *testing.T, hubURL string, workspaces []guiWorkspace) *agentManager {
	t.Helper()
	configPath := filepath.Join(t.TempDir(), "gui.json")
	data, err := json.Marshal(agentHubGUIConfig{
		Version: agentHubConfigVersion, Workspaces: workspaces,
		AgentHubEndpoint: hubURL, AgentHubInstanceID: "forge-notification-test",
		AgentProfiles: []agentHubProfileRoute{{Key: "default", AgentName: "fake-agent"}},
	})
	if err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(configPath, data, 0o600); err != nil {
		t.Fatal(err)
	}
	server := &server{config: configPath, addr: "127.0.0.1:4936"}
	manager := newAgentManager(server)
	server.agents = manager
	return manager
}

func appendNotificationTestMessage(t *testing.T, workspacePath string, message resourceMailboxMessage) {
	t.Helper()
	_, err := mutateResourceMailbox(workspacePath, func(mailbox *resourceMailbox) error {
		mailbox.NextSequence++
		message.Sequence = mailbox.NextSequence
		mailbox.Messages = append(mailbox.Messages, message)
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
}

func TestCreatorTurnCallbackRoutesOnceWithStableCausation(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()

	sourceRoot := t.TempDir()
	sourceApp, err := app.Initialize(sourceRoot, "en")
	if err != nil {
		t.Fatal(err)
	}
	sourceProject, err := sourceApp.CreateProject("Source project", "source")
	if err != nil {
		t.Fatal(err)
	}
	sourceTask, err := sourceApp.CreateTask(app.CreateTaskInput{ProjectID: sourceProject.ID, Title: "Source task", Slug: "source"})
	if err != nil {
		t.Fatal(err)
	}
	sourceRuntime, err := sourceApp.RuntimeConfig()
	if err != nil {
		t.Fatal(err)
	}
	creator, err := app.ResourceCreator(sourceRuntime.InstanceID, sourceTask.ID)
	if err != nil {
		t.Fatal(err)
	}

	targetRoot := t.TempDir()
	targetApp, err := app.Initialize(targetRoot, "en")
	if err != nil {
		t.Fatal(err)
	}
	targetProject, err := targetApp.CreateProject("Target project", "target")
	if err != nil {
		t.Fatal(err)
	}
	targetTask, err := targetApp.CreateTask(app.CreateTaskInput{ProjectID: targetProject.ID, Title: "Target task", Slug: "target", Creator: creator})
	if err != nil {
		t.Fatal(err)
	}
	targetRuntime, err := targetApp.RuntimeConfig()
	if err != nil {
		t.Fatal(err)
	}

	sourceWorkspace := guiWorkspace{ID: "source", Name: "Source", Path: sourceRoot}
	targetWorkspace := guiWorkspace{ID: "target", Name: "Target", Path: targetRoot}
	manager := newNotificationTestManager(t, hub.URL, []guiWorkspace{sourceWorkspace, targetWorkspace})
	client, err := newAgentHubClient(hub.URL, nil)
	if err != nil {
		t.Fatal(err)
	}
	run := agentRun{
		ID: "run-target", WorkspaceID: targetWorkspace.ID, ResourceID: targetTask.ID,
		Generation: 1, GenerationID: "gen-target", AgentHubSessionID: "ses-target", Status: "ready",
		CreatedAt: time.Now().Format(time.RFC3339Nano), UpdatedAt: time.Now().Format(time.RFC3339Nano),
	}
	if err := saveAgentRun(targetRoot, run); err != nil {
		t.Fatal(err)
	}
	fake.mu.Lock()
	fake.turns[run.AgentHubSessionID] = map[string]agentHubTurn{
		"turn-target": {
			TurnID: "turn-target", Status: "completed", Closed: true,
			Items: []agentHubTurnItem{{Type: "message", Role: "assistant", Text: "Delegated work is complete."}},
		},
	}
	fake.mu.Unlock()
	now := time.Now().Format(time.RFC3339Nano)
	original := resourceMailboxMessage{
		ID: "msg-original", ResourceID: targetTask.ID, Text: "Please create it", Role: "agent",
		Sender: &agentHubMessageSender{ID: sourceTask.ID, Name: sourceTask.ID}, SenderWorkspaceInstanceID: sourceRuntime.InstanceID,
		RequestedMode: resourceMessageModeEnqueue, ActualMode: resourceMessageModeEnqueue, ModeFrozen: true,
		Status: resourceMessageDelivered, AcceptedAt: now, UpdatedAt: now, DeliveredAt: now, TerminalAt: now,
		GenerationID: run.GenerationID, AgentHubSessionID: run.AgentHubSessionID, TurnID: "turn-target",
	}
	appendNotificationTestMessage(t, targetRoot, original)

	for _, reconciler := range []*agentManager{manager, newNotificationTestManager(t, hub.URL, []guiWorkspace{sourceWorkspace, targetWorkspace})} {
		if err := reconciler.reconcileWorkspaceNotifications(context.Background(), targetWorkspace, client); err != nil {
			t.Fatal(err)
		}
	}
	updated, found, err := mailboxMessageByID(targetRoot, original.ID)
	if err != nil || !found || updated.Notification == nil || updated.Notification.Status != resourceNotificationDelivered || updated.Notification.DeliveryStatus != resourceMessageDelivered {
		t.Fatalf("callback receipt = %#v, found=%v err=%v", updated.Notification, found, err)
	}
	sourceMailbox, err := loadResourceMailbox(sourceRoot)
	if err != nil {
		t.Fatal(err)
	}
	if len(sourceMailbox.Messages) != 1 {
		t.Fatalf("callback was duplicated: %#v", sourceMailbox.Messages)
	}
	callback := sourceMailbox.Messages[0]
	if callback.ID != updated.Notification.ID || callback.Type != resourceMessageTypeCreatorTurnResult || callback.Causation == nil ||
		callback.Causation.MessageID != original.ID || callback.Causation.SourceWorkspaceInstanceID != targetRuntime.InstanceID ||
		!strings.Contains(callback.Text, "Delegated work is complete.") || callback.Causation.TurnReference == "" {
		t.Fatalf("callback message = %#v", callback)
	}
	fake.mu.Lock()
	fake.turns[run.AgentHubSessionID]["turn-other"] = agentHubTurn{TurnID: "turn-other", Status: "completed", Closed: true}
	fake.mu.Unlock()
	other := original
	other.ID = "msg-other-agent"
	other.Sender = &agentHubMessageSender{ID: "project99.task1"}
	other.TurnID = "turn-other"
	appendNotificationTestMessage(t, targetRoot, other)
	userTriggered := other
	userTriggered.ID = "msg-user"
	userTriggered.Role = "user"
	userTriggered.Sender = nil
	userTriggered.SenderWorkspaceInstanceID = ""
	userTriggered.TurnID = "turn-user"
	appendNotificationTestMessage(t, targetRoot, userTriggered)
	if err := manager.reconcileWorkspaceNotifications(context.Background(), targetWorkspace, client); err != nil {
		t.Fatal(err)
	}
	sourceMailbox, _ = loadResourceMailbox(sourceRoot)
	if len(sourceMailbox.Messages) != 1 {
		t.Fatalf("non-creator trigger produced a callback: %#v", sourceMailbox.Messages)
	}
	run.CompletionMarker = run.AgentHubSessionID + ":99"
	run.CompletionState = "failed"
	run.CompletionTurnID = "turn-crashed"
	run.CompletionAt = time.Now().Format(time.RFC3339Nano)
	if err := saveAgentRun(targetRoot, run); err != nil {
		t.Fatal(err)
	}
	crashed := original
	crashed.ID = "msg-crashed-turn"
	crashed.TurnID = "turn-crashed"
	appendNotificationTestMessage(t, targetRoot, crashed)
	if err := manager.reconcileWorkspaceNotifications(context.Background(), targetWorkspace, client); err != nil {
		t.Fatal(err)
	}
	sourceMailbox, _ = loadResourceMailbox(sourceRoot)
	if len(sourceMailbox.Messages) != 2 {
		t.Fatalf("crashed Turn callback missing: %#v", sourceMailbox.Messages)
	}
	crashCallback := sourceMailbox.Messages[1]
	if crashCallback.Causation == nil || crashCallback.Causation.TurnStatus != "failed" ||
		!crashCallback.Causation.HistoryUnavailable || crashCallback.Causation.TurnReference != "" ||
		!strings.Contains(crashCallback.Text, "no Turn reference was manufactured") {
		t.Fatalf("crashed Turn callback = %#v", crashCallback)
	}
}

func TestTerminalDeliveryNoticeRoutesToResourceSenderWithoutBounce(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()

	sourceRoot := t.TempDir()
	sourceApp, err := app.Initialize(sourceRoot, "en")
	if err != nil {
		t.Fatal(err)
	}
	sourceProject, _ := sourceApp.CreateProject("Source", "source")
	sourceTask, err := sourceApp.CreateTask(app.CreateTaskInput{ProjectID: sourceProject.ID, Title: "Source task"})
	if err != nil {
		t.Fatal(err)
	}
	sourceRuntime, _ := sourceApp.RuntimeConfig()
	targetRoot := t.TempDir()
	targetApp, err := app.Initialize(targetRoot, "en")
	if err != nil {
		t.Fatal(err)
	}
	targetProject, _ := targetApp.CreateProject("Target", "target")
	targetTask, err := targetApp.CreateTask(app.CreateTaskInput{ProjectID: targetProject.ID, Title: "Target task"})
	if err != nil {
		t.Fatal(err)
	}
	targetRuntime, _ := targetApp.RuntimeConfig()
	sourceWorkspace := guiWorkspace{ID: "source", Path: sourceRoot}
	targetWorkspace := guiWorkspace{ID: "target", Path: targetRoot}
	manager := newNotificationTestManager(t, hub.URL, []guiWorkspace{sourceWorkspace, targetWorkspace})
	client, _ := newAgentHubClient(hub.URL, nil)
	now := time.Now().Format(time.RFC3339Nano)
	original := resourceMailboxMessage{
		ID: "msg-failed", ResourceID: targetTask.ID, Text: "Never delivered", Role: "agent",
		Sender: &agentHubMessageSender{ID: sourceTask.ID}, SenderWorkspaceInstanceID: sourceRuntime.InstanceID,
		RequestedMode: resourceMessageModeEnqueue, ActualMode: resourceMessageModeEnqueue, Status: resourceMessageUndeliverable,
		AcceptedAt: now, UpdatedAt: now, TerminalAt: now, LastError: "target was archived", LastErrorCode: "resource_archived",
	}
	appendNotificationTestMessage(t, targetRoot, original)
	if err := manager.reconcileWorkspaceNotifications(context.Background(), targetWorkspace, client); err != nil {
		t.Fatal(err)
	}
	sourceMailbox, err := loadResourceMailbox(sourceRoot)
	if err != nil || len(sourceMailbox.Messages) != 1 {
		t.Fatalf("delivery notice mailbox = %#v, %v", sourceMailbox.Messages, err)
	}
	notice := sourceMailbox.Messages[0]
	if notice.Type != resourceMessageTypeDeliveryTerminal || notice.Role != "system" || notice.Causation == nil ||
		notice.Causation.TerminalCode != "resource_archived" || notice.SenderWorkspaceInstanceID != targetRuntime.InstanceID {
		t.Fatalf("delivery notice = %#v", notice)
	}
	unknown := original
	unknown.ID = "msg-unknown"
	unknown.Status = resourceMessageDeliveryUnknown
	unknown.LastError = "the upstream acceptance outcome could not be confirmed"
	unknown.LastErrorCode = "delivery_outcome_unknown"
	appendNotificationTestMessage(t, targetRoot, unknown)
	if err := manager.reconcileWorkspaceNotifications(context.Background(), targetWorkspace, client); err != nil {
		t.Fatal(err)
	}
	sourceMailbox, err = loadResourceMailbox(sourceRoot)
	if err != nil || len(sourceMailbox.Messages) != 2 {
		t.Fatalf("delivery_unknown notice mailbox = %#v, %v", sourceMailbox.Messages, err)
	}
	unknownNotice := sourceMailbox.Messages[1]
	if unknownNotice.Causation == nil || unknownNotice.Causation.MessageID != unknown.ID ||
		unknownNotice.Causation.TerminalCode != "delivery_outcome_unknown" || !strings.Contains(unknownNotice.Text, "delivery_unknown") ||
		strings.Contains(strings.ToLower(unknownNotice.Text), "not delivered") {
		t.Fatalf("delivery_unknown was misrepresented: %#v", unknownNotice)
	}
	if err := manager.reconcileWorkspaceNotifications(context.Background(), sourceWorkspace, client); err != nil {
		t.Fatal(err)
	}
	updatedMailbox, _ := loadResourceMailbox(sourceRoot)
	if len(updatedMailbox.Messages) != 2 {
		t.Fatalf("generated failure notice bounced: %#v", updatedMailbox.Messages)
	}
}

func TestCreatorCallbackTerminalVariantsDoNotInventContent(t *testing.T) {
	for _, status := range []string{"failed", "cancelled"} {
		turn := agentHubTurn{TurnID: "turn-" + status, Status: status, Closed: true}
		message := creatorCallbackMessage("project1.task1", turn, "", status == "failed")
		if !strings.Contains(message, "status `"+status+"`") {
			t.Fatalf("%s callback omitted terminal status: %q", status, message)
		}
		if status == "failed" && !strings.Contains(message, "no Turn reference was manufactured") {
			t.Fatalf("history failure diagnostic missing: %q", message)
		}
		if status == "cancelled" && !strings.Contains(message, "no final assistant text") {
			t.Fatalf("empty cancellation result was hidden: %q", message)
		}
	}
}

func TestNotificationReceiptTerminatesWhenTargetWorkspaceIsUnavailable(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	root := t.TempDir()
	if _, err := app.Initialize(root, "en"); err != nil {
		t.Fatal(err)
	}
	workspace := guiWorkspace{ID: "source", Path: root}
	manager := newNotificationTestManager(t, hub.URL, []guiWorkspace{workspace})
	now := time.Now().Format(time.RFC3339Nano)
	source := resourceMailboxMessage{
		ID: "msg-source", ResourceID: "workspace", Text: "source", Role: "agent",
		RequestedMode: resourceMessageModeEnqueue, ActualMode: resourceMessageModeEnqueue,
		Status: resourceMessageDelivered, AcceptedAt: now, UpdatedAt: now,
		Notification: &resourceNotificationReceipt{
			ID: "msg-notify-missing", Type: resourceMessageTypeCreatorTurnResult, Status: resourceNotificationWaiting,
			TargetWorkspaceInstanceID: "ws-missing", TargetResourceID: "project1.task1", CreatedAt: now, UpdatedAt: now,
		},
	}
	appendNotificationTestMessage(t, root, source)
	generated := resourceMailboxMessage{
		ID: source.Notification.ID, ResourceID: "project1.task1", Text: "result",
		Type:      resourceMessageTypeCreatorTurnResult,
		Causation: &resourceMessageCausation{Type: resourceMessageTypeCreatorTurnResult, SourceWorkspaceInstanceID: "ws-source", SourceResourceID: "workspace"},
	}
	if err := manager.routeNotification(context.Background(), workspace, source, generated); err != nil {
		t.Fatal(err)
	}
	updated, found, err := mailboxMessageByID(root, source.ID)
	if err != nil || !found || updated.Notification == nil || updated.Notification.Status != resourceNotificationTerminal ||
		updated.Notification.LastErrorCode != "target_workspace_unavailable" {
		t.Fatalf("unavailable target receipt = %#v, found=%v err=%v", updated.Notification, found, err)
	}
}
