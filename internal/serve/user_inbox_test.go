package serve

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/disksing/pua/internal/app"
)

func userInboxTestManager(t *testing.T) (*agentManager, serveWorkspace, string) {
	t.Helper()
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	t.Cleanup(hub.Close)
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	puaWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := puaWorkspace.RegisterUser("disksing"); err != nil {
		t.Fatal(err)
	}
	runtimeConfig, err := puaWorkspace.RuntimeConfig()
	if err != nil {
		t.Fatal(err)
	}
	return manager, workspace, runtimeConfig.InstanceID
}

func userInboxRequest(t *testing.T, server *server, method, path, body string) *httptest.ResponseRecorder {
	t.Helper()
	request := httptest.NewRequest(method, path, bytes.NewBufferString(body))
	recorder := httptest.NewRecorder()
	server.handleWorkspace(recorder, request)
	return recorder
}

func userInboxSendBody(instanceID, senderID, text string) string {
	return fmt.Sprintf(`{"text":%q,"sender":{"id":%q,"name":%q},"senderWorkspaceInstanceId":%q}`, text, senderID, senderID, instanceID)
}

func TestUserInboxSendListReadAndReply(t *testing.T) {
	manager, workspace, instanceID := userInboxTestManager(t)
	server := manager.server
	base := "/api/workspaces/" + workspace.ID + "/users/disksing/messages"

	recorder := userInboxRequest(t, server, http.MethodPost, base, userInboxSendBody(instanceID, "project1.task1", "hello user"))
	if recorder.Code != http.StatusAccepted {
		t.Fatalf("send returned %d: %s", recorder.Code, recorder.Body.String())
	}
	var sent userInboxMessageResponse
	if err := json.Unmarshal(recorder.Body.Bytes(), &sent); err != nil {
		t.Fatal(err)
	}
	if sent.MessageID == "" || sent.SourceResourceID != "project1.task1" || !sent.Unread || sent.User != "disksing" {
		t.Fatalf("unexpected send response: %#v", sent)
	}

	recorder = userInboxRequest(t, server, http.MethodGet, base, "")
	if recorder.Code != http.StatusOK {
		t.Fatalf("list returned %d: %s", recorder.Code, recorder.Body.String())
	}
	var listed struct {
		User     string                     `json:"user"`
		Messages []userInboxMessageResponse `json:"messages"`
	}
	if err := json.Unmarshal(recorder.Body.Bytes(), &listed); err != nil {
		t.Fatal(err)
	}
	if listed.User != "disksing" || len(listed.Messages) != 1 || listed.Messages[0].MessageID != sent.MessageID || !listed.Messages[0].Unread {
		t.Fatalf("unexpected list: %#v", listed)
	}

	recorder = userInboxRequest(t, server, http.MethodPut, base+"/"+sent.MessageID+"/read", "")
	if recorder.Code != http.StatusOK {
		t.Fatalf("read returned %d: %s", recorder.Code, recorder.Body.String())
	}
	var read userInboxMessageResponse
	if err := json.Unmarshal(recorder.Body.Bytes(), &read); err != nil {
		t.Fatal(err)
	}
	if read.Unread || read.ReadAt == "" {
		t.Fatalf("message still unread: %#v", read)
	}
	// Marking read twice is idempotent and keeps the first timestamp.
	recorder = userInboxRequest(t, server, http.MethodPut, base+"/"+sent.MessageID+"/read", "")
	var reread userInboxMessageResponse
	if err := json.Unmarshal(recorder.Body.Bytes(), &reread); err != nil {
		t.Fatal(err)
	}
	if reread.ReadAt != read.ReadAt {
		t.Fatalf("read timestamp moved: %q -> %q", read.ReadAt, reread.ReadAt)
	}

	recorder = userInboxRequest(t, server, http.MethodPost, base+"/"+sent.MessageID+"/reply", `{"text":"got it, thanks"}`)
	if recorder.Code != http.StatusAccepted {
		t.Fatalf("reply returned %d: %s", recorder.Code, recorder.Body.String())
	}
	var reply resourceMessageResponse
	if err := json.Unmarshal(recorder.Body.Bytes(), &reply); err != nil {
		t.Fatal(err)
	}
	if reply.ResourceID != "project1.task1" || reply.MessageID == "" {
		t.Fatalf("unexpected reply response: %#v", reply)
	}
	mailbox, err := loadResourceMailboxForResource(workspace.Path, "project1.task1")
	if err != nil {
		t.Fatal(err)
	}
	var delivered *resourceMailboxMessage
	for index := range mailbox.Messages {
		if mailbox.Messages[index].ID == reply.MessageID {
			delivered = &mailbox.Messages[index]
		}
	}
	if delivered == nil || delivered.Role != "user" ||
		delivered.Sender == nil || delivered.Sender.Name != "disksing" {
		t.Fatalf("reply mailbox message mismatch: %#v", delivered)
	}
	// A delivered message is compacted to a receipt without its text; the
	// delivered status proves the reply entered the ordinary mailbox pipeline.
	if delivered.Status != resourceMessageDelivered {
		t.Fatalf("reply status = %q, want delivered: %#v", delivered.Status, delivered)
	}

	recorder = userInboxRequest(t, server, http.MethodGet, base, "")
	if err := json.Unmarshal(recorder.Body.Bytes(), &listed); err != nil {
		t.Fatal(err)
	}
	if listed.Messages[0].RepliedAt == "" || listed.Messages[0].Unread {
		t.Fatalf("reply state not recorded: %#v", listed.Messages[0])
	}
}

func TestUserInboxSendValidation(t *testing.T) {
	manager, workspace, instanceID := userInboxTestManager(t)
	server := manager.server
	base := "/api/workspaces/" + workspace.ID + "/users/disksing/messages"

	cases := []struct {
		name string
		path string
		body string
		want int
	}{
		{"empty text", base, userInboxSendBody(instanceID, "project1.task1", "  "), http.StatusBadRequest},
		{"missing sender", base, `{"text":"hi","senderWorkspaceInstanceId":"` + instanceID + `"}`, http.StatusBadRequest},
		{"unstable sender", base, userInboxSendBody(instanceID, "ses-123", "hi"), http.StatusBadRequest},
		{"wrong instance", base, userInboxSendBody("ws-other", "project1.task1", "hi"), http.StatusBadRequest},
		{"unknown sender resource", base, userInboxSendBody(instanceID, "project9.task9", "hi"), http.StatusNotFound},
		{"unknown user", "/api/workspaces/" + workspace.ID + "/users/nobody/messages", userInboxSendBody(instanceID, "project1.task1", "hi"), http.StatusNotFound},
		{"reserved user name", "/api/workspaces/" + workspace.ID + "/users/project1/messages", userInboxSendBody(instanceID, "project1.task1", "hi"), http.StatusBadRequest},
	}
	for _, test := range cases {
		t.Run(test.name, func(t *testing.T) {
			recorder := userInboxRequest(t, server, http.MethodPost, test.path, test.body)
			if recorder.Code != test.want {
				t.Fatalf("returned %d, want %d: %s", recorder.Code, test.want, recorder.Body.String())
			}
		})
	}
}

func TestUserInboxReplyToArchivedResourceFails(t *testing.T) {
	manager, workspace, instanceID := userInboxTestManager(t)
	server := manager.server
	base := "/api/workspaces/" + workspace.ID + "/users/disksing/messages"

	recorder := userInboxRequest(t, server, http.MethodPost, base, userInboxSendBody(instanceID, "project1.task1", "ping"))
	if recorder.Code != http.StatusAccepted {
		t.Fatalf("send returned %d: %s", recorder.Code, recorder.Body.String())
	}
	var sent userInboxMessageResponse
	if err := json.Unmarshal(recorder.Body.Bytes(), &sent); err != nil {
		t.Fatal(err)
	}
	puaWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := puaWorkspace.ArchiveResource("project1.task1"); err != nil {
		t.Fatal(err)
	}
	recorder = userInboxRequest(t, server, http.MethodPost, base+"/"+sent.MessageID+"/reply", `{"text":"late reply"}`)
	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("reply to archived resource returned %d: %s", recorder.Code, recorder.Body.String())
	}
}

func TestUserInboxRetentionPrunesOldestReadFirst(t *testing.T) {
	workspacePath := t.TempDir()
	if _, err := app.Initialize(workspacePath, "en"); err != nil {
		t.Fatal(err)
	}
	total := maxUserInboxMessages + 10
	_, err := mutateUserInbox(workspacePath, "disksing", func(inbox *userInbox) error {
		for index := 0; index < total; index++ {
			inbox.NextSequence++
			message := userInboxMessage{
				ID: fmt.Sprintf("umsg-%d", inbox.NextSequence), Sequence: inbox.NextSequence,
				Text: "message", SourceResourceID: "project1.task1", CreatedAt: "2026-08-17T00:00:00Z",
			}
			// Keep the five newest messages unread; everything older is read.
			if index < total-5 {
				message.ReadAt = "2026-08-17T01:00:00Z"
			}
			inbox.Messages = append(inbox.Messages, message)
			pruneUserInboxLocked(inbox)
		}
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
	userInboxMu.Lock()
	inbox, err := loadUserInboxLocked(workspacePath, "disksing")
	userInboxMu.Unlock()
	if err != nil {
		t.Fatal(err)
	}
	if len(inbox.Messages) != maxUserInboxMessages {
		t.Fatalf("inbox size = %d, want %d", len(inbox.Messages), maxUserInboxMessages)
	}
	unread := 0
	for _, message := range inbox.Messages {
		if message.ReadAt == "" {
			unread++
		}
	}
	if unread != 5 {
		t.Fatalf("unread messages = %d, want 5", unread)
	}
}
