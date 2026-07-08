package main

import (
	"context"
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

func TestAgentMessageDeltaTextPreservesWhitespace(t *testing.T) {
	text, ok := agentMessageDeltaText(json.RawMessage(`{"delta":" \n"}`))
	if !ok {
		t.Fatal("expected delta to be found")
	}
	if text != " \n" {
		t.Fatalf("expected whitespace delta to be preserved, got %q", text)
	}
}

func TestEventTextStillFallsBackToMethodForBlankGenericText(t *testing.T) {
	text := eventText("item/started", json.RawMessage(`{"text":"  "}`))
	if text != "item/started" {
		t.Fatalf("expected generic blank text to fall back to method, got %q", text)
	}
}

func TestLoadAgentRunsRepairsTrailingGarbage(t *testing.T) {
	workspace := t.TempDir()
	indexPath := agentIndexPath(workspace)
	if err := os.MkdirAll(filepath.Dir(indexPath), 0o755); err != nil {
		t.Fatal(err)
	}
	corrupt := `[
  {
    "id": "run-one",
    "workspaceId": "workspace",
    "provider": "codex",
    "title": "Run One",
    "cwd": "` + workspace + `",
    "status": "completed",
    "sandbox": "read-only",
    "approval": "never",
    "createdAt": "2026-07-07T12:00:00+08:00",
    "updatedAt": "2026-07-07T12:00:01+08:00"
  }
]
+08:00",
    "updatedAt": "2026-07-03T09:49:41+08:00"
  }
]
`
	if err := os.WriteFile(indexPath, []byte(corrupt), 0o644); err != nil {
		t.Fatal(err)
	}
	runs, err := loadAgentRuns(workspace)
	if err != nil {
		t.Fatal(err)
	}
	if len(runs) != 1 || runs[0].ID != "run-one" {
		t.Fatalf("unexpected runs: %#v", runs)
	}
	repaired, err := os.ReadFile(indexPath)
	if err != nil {
		t.Fatal(err)
	}
	if strings.Contains(string(repaired), "+08:00\",\n    \"updatedAt\": \"2026-07-03") {
		t.Fatalf("trailing garbage was not repaired:\n%s", repaired)
	}
	var decoded []agentRun
	if err := json.Unmarshal(repaired, &decoded); err != nil {
		t.Fatalf("repaired index is not valid JSON: %v\n%s", err, repaired)
	}
}

func TestIsClosedPipeError(t *testing.T) {
	if !isClosedPipeError(os.ErrClosed) {
		t.Fatal("expected os.ErrClosed to be ignored")
	}
	if !isClosedPipeError(errors.New("read |0: file already closed")) {
		t.Fatal("expected closed file text to be ignored")
	}
	if isClosedPipeError(errors.New("unexpected app-server failure")) {
		t.Fatal("unexpected app-server failures should still be reported")
	}
}

func TestEnrichTreeSessionsIncludesAgentRunState(t *testing.T) {
	workspace := t.TempDir()
	updatedAt := "2026-07-07T12:00:01+08:00"
	lastOutputAt := "2026-07-07T12:00:02+08:00"
	runs := []agentRun{
		{
			ID:             "run-one",
			WorkspaceID:    "workspace",
			ResourceID:     "project1.task1",
			ForgeSessionID: "session-one",
			Provider:       "codex",
			Title:          "Run One",
			Cwd:            workspace,
			Status:         "running",
			Sandbox:        "workspace-write",
			Approval:       "on-request",
			CreatedAt:      "2026-07-07T12:00:00+08:00",
			UpdatedAt:      updatedAt,
			LastOutputAt:   lastOutputAt,
		},
	}
	if err := rewriteAgentRuns(workspace, runs); err != nil {
		t.Fatal(err)
	}
	tree := workspaceTree{
		Sessions: []guiSession{
			{ID: "session-one", Controls: []guiSessionControl{{ResourceID: "project1.task1", Path: "project1/task1"}}},
			{ID: "session-external", Controls: []guiSessionControl{{ResourceID: "project1.task2", Path: "project1/task2"}}},
		},
	}
	s := &server{}
	if err := s.enrichTreeSessions(workspace, &tree); err != nil {
		t.Fatal(err)
	}
	internal := tree.Sessions[0]
	if internal.Source != "internal" || internal.AgentRunID != "run-one" || internal.AgentRunStatus != "running" || internal.AgentRunUpdatedAt != updatedAt || internal.AgentRunLastOutputAt != lastOutputAt || internal.ResourceID != "project1.task1" {
		t.Fatalf("internal session was not enriched with agent run state: %#v", internal)
	}
	if tree.Sessions[1].Source != "external" || tree.Sessions[1].AgentRunUpdatedAt != "" || tree.Sessions[1].AgentRunLastOutputAt != "" {
		t.Fatalf("external session should only be marked external: %#v", tree.Sessions[1])
	}
}

func TestIsAgentOutputEvent(t *testing.T) {
	outputs := []struct {
		eventType string
		method    string
	}{
		{eventType: "assistant_delta", method: "item/agentMessage/delta"},
		{eventType: "tool", method: "item/commandExecution/outputDelta"},
		{eventType: "tool", method: "command/exec/outputDelta"},
	}
	for _, item := range outputs {
		if !isAgentOutputEvent(item.eventType, item.method) {
			t.Fatalf("expected output event for %#v", item)
		}
	}
	nonOutputs := []struct {
		eventType string
		method    string
	}{
		{eventType: "system", method: "turn/completed"},
		{eventType: "tool", method: "item/started"},
		{eventType: "user", method: ""},
	}
	for _, item := range nonOutputs {
		if isAgentOutputEvent(item.eventType, item.method) {
			t.Fatalf("did not expect output event for %#v", item)
		}
	}
}

func TestCreateForgeSessionUsesInternalHeartbeatTimeout(t *testing.T) {
	workspace := t.TempDir()
	tmp := t.TempDir()
	argsPath := filepath.Join(tmp, "args.txt")
	forgePath := filepath.Join(tmp, "forge-fake")
	script := `#!/bin/sh
if [ "$1" = "session" ] && [ "$2" = "new" ]; then
  printf '%s\n' "$*" > "$FORGE_FAKE_ARGS"
  printf 'session-created\n'
  exit 0
fi
echo "unexpected args: $*" >&2
exit 1
`
	if err := os.WriteFile(forgePath, []byte(script), 0o755); err != nil {
		t.Fatal(err)
	}
	t.Setenv("FORGE_FAKE_ARGS", argsPath)

	m := newAgentManager(&server{forgePath: forgePath})
	id, err := m.createForgeSession(context.Background(), guiWorkspace{Path: workspace}, "")
	if err != nil {
		t.Fatal(err)
	}
	if id != "session-created" {
		t.Fatalf("unexpected session id: %q", id)
	}
	args, err := os.ReadFile(argsPath)
	if err != nil {
		t.Fatal(err)
	}
	expected := "session new --heartbeat --timeout " + internalForgeSessionTimeout.String() + "\n"
	if string(args) != expected {
		t.Fatalf("expected session new args %q, got %q", expected, string(args))
	}
}

func TestKeepForgeSessionAliveHeartbeatsImmediately(t *testing.T) {
	workspace := t.TempDir()
	tmp := t.TempDir()
	heartbeatPath := filepath.Join(tmp, "heartbeats.txt")
	forgePath := filepath.Join(tmp, "forge-fake")
	script := `#!/bin/sh
if [ "$1" = "session" ] && [ "$2" = "heartbeat" ]; then
  printf '%s\n' "$*" >> "$FORGE_FAKE_HEARTBEATS"
  printf '{"id":"%s"}\n' "$4"
  exit 0
fi
echo "unexpected args: $*" >&2
exit 1
`
	if err := os.WriteFile(forgePath, []byte(script), 0o755); err != nil {
		t.Fatal(err)
	}
	t.Setenv("FORGE_FAKE_HEARTBEATS", heartbeatPath)

	m := newAgentManager(&server{forgePath: forgePath})
	rt := &agentRuntime{
		workspace: guiWorkspace{Path: workspace},
		run:       agentRun{ID: "run-one", ForgeSessionID: "session-one"},
	}
	stop := rt.keepForgeSessionAlive(m)
	defer stop()

	deadline := time.Now().Add(2 * time.Second)
	for {
		data, _ := os.ReadFile(heartbeatPath)
		if strings.Contains(string(data), "session heartbeat --id session-one") {
			return
		}
		if time.Now().After(deadline) {
			t.Fatalf("expected immediate heartbeat, got:\n%s", data)
		}
		time.Sleep(10 * time.Millisecond)
	}
}

func TestForgeSessionContextFileAndPrompt(t *testing.T) {
	workspace := t.TempDir()
	resourceDir := filepath.Join(workspace, "project1", "task1")
	if err := os.MkdirAll(resourceDir, 0o755); err != nil {
		t.Fatal(err)
	}
	tmp := t.TempDir()
	forgePath := filepath.Join(tmp, "forge-fake")
	script := `#!/bin/sh
if [ "$1" = "workspace" ] && [ "$2" = "resource" ]; then
  printf '{"path":"project1/task1"}\n'
  exit 0
fi
echo "unexpected args: $*" >&2
exit 1
`
	if err := os.WriteFile(forgePath, []byte(script), 0o755); err != nil {
		t.Fatal(err)
	}
	m := newAgentManager(&server{forgePath: forgePath})
	run := agentRun{
		ID:             "run-one",
		WorkspaceID:    "workspace",
		ResourceID:     "project1.task1",
		ForgeSessionID: "session-one",
		Cwd:            resourceDir,
	}

	contextPath, err := m.writeForgeSessionContext(context.Background(), guiWorkspace{Path: workspace}, run)
	if err != nil {
		t.Fatal(err)
	}
	expectedPath := filepath.Join(resourceDir, ".forge", "codex-session.json")
	if contextPath != expectedPath {
		t.Fatalf("expected context path %s, got %s", expectedPath, contextPath)
	}
	data, err := os.ReadFile(contextPath)
	if err != nil {
		t.Fatal(err)
	}
	var sessionContext forgeSessionContext
	if err := json.Unmarshal(data, &sessionContext); err != nil {
		t.Fatal(err)
	}
	if sessionContext.ForgeSessionID != "session-one" || sessionContext.RunID != "run-one" {
		t.Fatalf("unexpected session context: %#v", sessionContext)
	}

	run.ForgeSessionContextPath = contextPath
	rt := &agentRuntime{run: run}
	prompt := rt.withForgeSessionContext("continue the task")
	if !strings.Contains(prompt, "FORGE_SESSION_ID=session-one") {
		t.Fatalf("prompt does not include session id:\n%s", prompt)
	}
	if !strings.Contains(prompt, contextPath) {
		t.Fatalf("prompt does not include context path:\n%s", prompt)
	}
	if !strings.Contains(prompt, "User request:\ncontinue the task") {
		t.Fatalf("prompt does not include user request:\n%s", prompt)
	}

	removeForgeSessionContextFile(contextPath, "different-session")
	if _, err := os.Stat(contextPath); err != nil {
		t.Fatalf("context file should not be removed for another session: %v", err)
	}
	removeForgeSessionContextFile(contextPath, "session-one")
	if _, err := os.Stat(contextPath); !os.IsNotExist(err) {
		t.Fatalf("context file should be removed, stat err: %v", err)
	}
}

func TestCleanupStaleInternalSessionsEndsOnlyAgentRunSessions(t *testing.T) {
	workspace := t.TempDir()
	now := "2026-07-07T12:00:00+08:00"
	runs := []agentRun{
		{
			ID:                      "run-internal",
			WorkspaceID:             "workspace",
			ForgeSessionID:          "session-internal",
			ForgeSessionContextPath: filepath.Join(workspace, ".forge", "codex-session.json"),
			CodexTurnID:             "turn-internal",
			Provider:                "codex",
			Title:                   "Internal",
			Cwd:                     workspace,
			Status:                  "running",
			Sandbox:                 "workspace-write",
			Approval:                "on-request",
			CreatedAt:               now,
			UpdatedAt:               now,
		},
		{
			ID:             "run-missing",
			WorkspaceID:    "workspace",
			ForgeSessionID: "session-missing",
			CodexTurnID:    "turn-missing",
			Provider:       "codex",
			Title:          "Missing",
			Cwd:            workspace,
			Status:         "idle",
			Sandbox:        "workspace-write",
			Approval:       "on-request",
			CreatedAt:      now,
			UpdatedAt:      now,
		},
		{
			ID:             "run-stopped",
			WorkspaceID:    "workspace",
			ForgeSessionID: "session-stopped",
			Provider:       "codex",
			Title:          "Stopped",
			Cwd:            workspace,
			Status:         "stopped",
			Sandbox:        "workspace-write",
			Approval:       "on-request",
			CreatedAt:      now,
			UpdatedAt:      now,
		},
	}
	if err := rewriteAgentRuns(workspace, runs); err != nil {
		t.Fatal(err)
	}
	contextPath := runs[0].ForgeSessionContextPath
	if err := os.MkdirAll(filepath.Dir(contextPath), 0o755); err != nil {
		t.Fatal(err)
	}
	contextData, err := json.Marshal(forgeSessionContext{ForgeSessionID: "session-internal"})
	if err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(contextPath, contextData, 0o644); err != nil {
		t.Fatal(err)
	}

	tmp := t.TempDir()
	endedPath := filepath.Join(tmp, "ended.txt")
	forgePath := filepath.Join(tmp, "forge-fake")
	script := `#!/bin/sh
if [ "$1" = "session" ] && [ "$2" = "list" ]; then
  printf '%s\n' 'session-internal	heartbeat	project1	2026-07-07T12:00:00+08:00'
  printf '%s\n' 'session-external	heartbeat	project2	2026-07-07T12:00:00+08:00'
  printf '%s\n' 'session-stopped	heartbeat	project3	2026-07-07T12:00:00+08:00'
  exit 0
fi
if [ "$1" = "session" ] && [ "$2" = "end" ]; then
  printf '%s\n' "$4" >> "$FORGE_FAKE_ENDED"
  printf '{"id":"%s"}\n' "$4"
  exit 0
fi
echo "unexpected args: $*" >&2
exit 1
`
	if err := os.WriteFile(forgePath, []byte(script), 0o755); err != nil {
		t.Fatal(err)
	}
	t.Setenv("FORGE_FAKE_ENDED", endedPath)

	s := &server{forgePath: forgePath}
	if err := s.cleanupStaleInternalSessionsForWorkspace(context.Background(), guiWorkspace{Path: workspace}); err != nil {
		t.Fatal(err)
	}

	endedData, err := os.ReadFile(endedPath)
	if err != nil {
		t.Fatal(err)
	}
	ended := string(endedData)
	if !strings.Contains(ended, "session-internal\n") || !strings.Contains(ended, "session-stopped\n") {
		t.Fatalf("expected GUI sessions to be ended, got:\n%s", ended)
	}
	if strings.Contains(ended, "session-external") || strings.Contains(ended, "session-missing") {
		t.Fatalf("external or inactive sessions should not be ended, got:\n%s", ended)
	}

	updated, err := loadAgentRuns(workspace)
	if err != nil {
		t.Fatal(err)
	}
	byID := make(map[string]agentRun)
	for _, run := range updated {
		byID[run.ID] = run
	}
	for _, id := range []string{"run-internal", "run-missing", "run-stopped"} {
		if byID[id].ForgeSessionID != "" || byID[id].ForgeSessionContextPath != "" || byID[id].CodexTurnID != "" {
			t.Fatalf("expected stale session fields to be cleared for %s: %#v", id, byID[id])
		}
	}
	if _, err := os.Stat(contextPath); !os.IsNotExist(err) {
		t.Fatalf("expected stale session context file to be removed, stat err: %v", err)
	}
	if byID["run-internal"].Status != "stopped" || byID["run-missing"].Status != "stopped" {
		t.Fatalf("expected live runs to become stopped: %#v", byID)
	}
}
