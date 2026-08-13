package serve

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/disksing/forge/internal/app"
)

func openTestForgeWorkspace(t *testing.T, path, language string) *app.Workspace {
	t.Helper()
	workspace, err := app.Initialize(path, language)
	if err != nil {
		t.Fatal(err)
	}
	return workspace
}

func rewriteTestAgentRuns(workspacePath string, runs []agentRun) error {
	agentIndexMu.Lock()
	defer agentIndexMu.Unlock()
	return writeAgentRunsIndexLocked(workspacePath, runs)
}

// newResourceMessage and enqueueResourceMessage reconstruct the retired
// runtime enqueue helper for tests that exercise mailbox mutation,
// serialization, and delivery retry without the removed run lifecycle.
func newResourceMessage(text, userName string) resourceInboundMessage {
	role, sender := agentHubMessageProvenance(userName)
	return resourceInboundMessage{
		ID: "msg-" + newRunID(), Text: strings.TrimSpace(text), Role: role,
		Sender: sender, AcceptedAt: time.Now().Format(time.RFC3339Nano),
	}
}

func (rt *agentRuntime) enqueueResourceMessage(message resourceInboundMessage) error {
	if err := migrateLegacyResourceMailbox(rt.workspace.Path); err != nil {
		return err
	}
	run := rt.snapshotRun()
	_, err := mutateResourceMailbox(rt.workspace.Path, func(mailbox *resourceMailbox) error {
		for _, existing := range mailbox.Messages {
			if existing.ID == message.ID {
				return nil
			}
		}
		mailbox.NextSequence++
		actual := resourceMessageModeSteer
		if message.Steer != nil && !*message.Steer {
			actual = resourceMessageModeEnqueue
		}
		acceptedAt := strings.TrimSpace(message.AcceptedAt)
		if acceptedAt == "" {
			acceptedAt = time.Now().Format(time.RFC3339Nano)
		}
		mailbox.Messages = append(mailbox.Messages, resourceMailboxMessage{
			ID: message.ID, Sequence: mailbox.NextSequence, ResourceID: normalizedResourceID(run.ResourceID),
			Text: message.Text, Role: message.Role, Sender: message.Sender,
			RequestedMode: resourceMessageModeSteer, ActualMode: actual, ModeFrozen: message.Steer != nil, Status: resourceMessageQueued,
			AcceptedAt: acceptedAt, UpdatedAt: acceptedAt,
		})
		return nil
	})
	return err
}

// closeRuntimeTestRun stops one generation's AgentHub session and marks the
// run stopped on disk so cleanup assertions can converge without the removed
// run lifecycle handlers.
func closeRuntimeTestRun(t *testing.T, manager *agentManager, workspace guiWorkspace, runID string) *httptest.ResponseRecorder {
	t.Helper()
	response := httptest.NewRecorder()
	run, err := loadAgentRun(workspace.Path, runID)
	if err != nil {
		writeError(response, err, http.StatusNotFound)
		return response
	}
	if sessionID := strings.TrimSpace(run.AgentHubSessionID); sessionID != "" {
		_, client, cfgErr := manager.agentHubRuntimeConfig()
		if cfgErr != nil {
			writeError(response, cfgErr, http.StatusServiceUnavailable)
			return response
		}
		if _, err := client.Stop(context.Background(), sessionID); err != nil {
			writeError(response, err, http.StatusBadGateway)
			return response
		}
	}
	run.Status = "stopped"
	run.AgentHubStoppedObserved = true
	run.ForgeSessionID = ""
	run.UpdatedAt = time.Now().Format(time.RFC3339)
	if err := saveAgentRun(workspace.Path, run); err != nil {
		writeError(response, err, http.StatusInternalServerError)
		return response
	}
	writeJSON(response, map[string]any{"status": "stopped"})
	return response
}

func seedTestForgeSession(t *testing.T, workspace guiWorkspace, externalID string) string {
	t.Helper()
	return "legacy-session-" + newRunID()
}

type testForgeSession struct {
	ID       string
	Liveness struct {
		AgentHubSessionID string
	}
}

func testForgeSessions(t *testing.T, workspacePath string) []testForgeSession {
	t.Helper()
	runs, err := loadAgentRuns(workspacePath)
	if err != nil {
		t.Fatal(err)
	}
	sessions := make([]testForgeSession, 0, len(runs))
	for _, run := range runs {
		if run.ForgeSessionID == "" || (run.Status == "stopped" && run.AgentHubStoppedObserved) {
			continue
		}
		sessions = append(sessions, testForgeSession{
			ID:       run.ForgeSessionID,
			Liveness: struct{ AgentHubSessionID string }{AgentHubSessionID: run.AgentHubSessionID},
		})
	}
	return sessions
}
