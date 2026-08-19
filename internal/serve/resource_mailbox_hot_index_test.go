package serve

import (
	"fmt"
	"os"
	"testing"
	"time"

	"github.com/disksing/pua/internal/app"
)

func TestHotMailboxIndexSkipsColdResourceStores(t *testing.T) {
	root := t.TempDir()
	if _, err := app.Initialize(root, "en"); err != nil {
		t.Fatal(err)
	}

	const coldCount = 96
	stamp := time.Now().UTC().Format(time.RFC3339Nano)
	for index := 0; index < coldCount; index++ {
		resourceID := fmt.Sprintf("cold-%03d", index)
		_, err := mutateResourceMailboxForResource(root, resourceID, func(mailbox *resourceMailbox) error {
			mailbox.NextSequence++
			mailbox.Messages = append(mailbox.Messages, resourceMailboxMessage{
				ID: fmt.Sprintf("cold-message-%03d", index), Sequence: mailbox.NextSequence, ResourceID: resourceID,
				Text: "completed", Role: "user", RequestedMode: resourceMessageModeEnqueue,
				ActualMode: resourceMessageModeEnqueue, Status: resourceMessageDelivered,
				AcceptedAt: stamp, UpdatedAt: stamp, DeliveredAt: stamp, TerminalAt: stamp,
			})
			return nil
		})
		if err != nil {
			t.Fatal(err)
		}
	}
	activeID := "project1.task-hot"
	if _, err := mutateResourceMailboxForResource(root, activeID, func(mailbox *resourceMailbox) error {
		mailbox.NextSequence++
		mailbox.Messages = append(mailbox.Messages, resourceMailboxMessage{
			ID: "active-message", Sequence: mailbox.NextSequence, ResourceID: activeID,
			Text: "retry me", Role: "user", RequestedMode: resourceMessageModeEnqueue,
			ActualMode: resourceMessageModeEnqueue, Status: resourceMessageQueued,
			AcceptedAt: stamp, UpdatedAt: stamp,
		})
		return nil
	}); err != nil {
		t.Fatal(err)
	}

	ids, err := rebuildResourceMailboxHotIndex(root)
	if err != nil {
		t.Fatal(err)
	}
	if len(ids) != 1 || ids[0] != activeID {
		t.Fatalf("rebuilt hot resources = %#v, want [%q]", ids, activeID)
	}

	// Once the ready marker exists, a malformed cold hot.json must not be read
	// by the periodic hot-only path. This also makes the scale property
	// observable without depending on OS-specific file-read instrumentation.
	coldDirectory, _, _, err := resourceMailboxDirectory(root, "cold-000")
	if err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(resourceMailboxHotPath(coldDirectory), []byte("not-json"), 0o600); err != nil {
		t.Fatal(err)
	}
	hot, err := loadAllHotResourceMailboxes(root)
	if err != nil {
		t.Fatalf("hot-only load read a cold store: %v", err)
	}
	if len(hot) != 1 || len(hot[0].Messages) != 1 || hot[0].Messages[0].ID != "active-message" {
		t.Fatalf("hot-only result = %#v", hot)
	}
}

func TestHotMailboxIndexRebuildsAfterMarkerLoss(t *testing.T) {
	root := t.TempDir()
	if _, err := app.Initialize(root, "en"); err != nil {
		t.Fatal(err)
	}
	resourceID := "workspace"
	if _, err := acceptMailboxMessage(root, resourceID, resourceMessageRequest{Text: "pending", Mode: resourceMessageModeEnqueue}); err != nil {
		t.Fatal(err)
	}
	if _, err := rebuildResourceMailboxHotIndex(root); err != nil {
		t.Fatal(err)
	}
	if err := os.RemoveAll(resourceMailboxHotIndexRoot(root)); err != nil {
		t.Fatal(err)
	}
	ids, err := listHotResourceMailboxResourceIDs(root)
	if err != nil {
		t.Fatal(err)
	}
	if len(ids) != 1 || ids[0] != resourceID {
		t.Fatalf("recovered hot resources = %#v, want [%q]", ids, resourceID)
	}
	if _, err := os.Stat(resourceMailboxHotIndexReadyPath(root)); err != nil {
		t.Fatalf("hot index was not rebuilt: %v", err)
	}
}

func TestHotMailboxMarkerLeavesActiveSetAfterRetryAndExitsAfterCompletion(t *testing.T) {
	root := t.TempDir()
	if _, err := app.Initialize(root, "en"); err != nil {
		t.Fatal(err)
	}
	message, err := acceptMailboxMessage(root, "workspace", resourceMessageRequest{Text: "retry", Mode: resourceMessageModeEnqueue})
	if err != nil {
		t.Fatal(err)
	}
	ids, err := listHotResourceMailboxResourceIDs(root)
	if err != nil || len(ids) != 1 || ids[0] != "workspace" {
		t.Fatalf("active marker after acceptance = %#v, err=%v", ids, err)
	}
	completedAt := time.Now().UTC().Format(time.RFC3339Nano)
	if _, err := updateMailboxMessage(root, message.ID, func(current *resourceMailboxMessage) {
		current.Status = resourceMessageDelivered
		current.DeliveredAt = completedAt
		current.TerminalAt = completedAt
	}); err != nil {
		t.Fatal(err)
	}
	ids, err = listHotResourceMailboxResourceIDs(root)
	if err != nil {
		t.Fatal(err)
	}
	if len(ids) != 0 {
		t.Fatalf("completed mailbox remained active: %#v", ids)
	}
}
