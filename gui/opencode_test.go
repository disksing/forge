package main

import (
	"encoding/json"
	"io"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

func TestOpencodeApprovalResponseSelectsMatchingOption(t *testing.T) {
	params := json.RawMessage(`{
		"options":[
			{"optionId":"allow-once","kind":"allow_once"},
			{"optionId":"allow-always","kind":"allow_always"},
			{"optionId":"reject-once","kind":"reject_once"}
		]
	}`)

	tests := []struct {
		decision string
		want     string
	}{
		{decision: "accept", want: "allow-once"},
		{decision: "acceptForSession", want: "allow-always"},
		{decision: "decline", want: "reject-once"},
	}
	for _, test := range tests {
		response, err := opencodeApprovalResponse(params, test.decision)
		if err != nil {
			t.Fatalf("%s: %v", test.decision, err)
		}
		outcome := response["outcome"].(map[string]any)
		if outcome["outcome"] != "selected" || outcome["optionId"] != test.want {
			t.Fatalf("%s: unexpected response %#v", test.decision, response)
		}
	}

	cancelled, err := opencodeApprovalResponse(params, "cancel")
	if err != nil {
		t.Fatal(err)
	}
	if cancelled["outcome"].(map[string]any)["outcome"] != "cancelled" {
		t.Fatalf("unexpected cancelled response %#v", cancelled)
	}
}

func TestSafeACPWorkspacePathRejectsEscapes(t *testing.T) {
	root := t.TempDir()
	outside := t.TempDir()
	inside := filepath.Join(root, "nested", "new.txt")
	if got, err := safeACPWorkspacePath(root, inside, true); err != nil || got != inside {
		t.Fatalf("expected inside path, got %q, %v", got, err)
	}
	if _, err := safeACPWorkspacePath(root, filepath.Join(outside, "file.txt"), true); err == nil {
		t.Fatal("expected lexical workspace escape to fail")
	}
	if _, err := safeACPWorkspacePath(root, "relative.txt", true); err == nil {
		t.Fatal("expected relative ACP path to fail")
	}
	link := filepath.Join(root, "outside-link")
	if err := os.Symlink(outside, link); err != nil {
		t.Fatal(err)
	}
	if _, err := safeACPWorkspacePath(root, filepath.Join(link, "new.txt"), true); err == nil {
		t.Fatal("expected symlink parent escape to fail")
	}
	dangling := filepath.Join(root, "dangling")
	if err := os.Symlink(filepath.Join(outside, "missing.txt"), dangling); err != nil {
		t.Fatal(err)
	}
	if _, err := safeACPWorkspacePath(root, dangling, true); err == nil {
		t.Fatal("expected dangling symlink escape to fail")
	}
}

func TestOpencodeTerminalHonorsArgsEnvAndOutputLimit(t *testing.T) {
	workspace := t.TempDir()
	rt := &agentRuntime{
		workspace: guiWorkspace{ID: "workspace", Path: workspace},
		run: agentRun{
			ID:                "run-terminal",
			Cwd:               workspace,
			ForgeSessionID:    "session-terminal",
			SchedulerTurn:     true,
			AutoRunGeneration: 7,
		},
		opencodeTerminals: make(map[string]*opencodeTerminal),
	}
	limit := 64
	params := mustJSON(map[string]any{
		"sessionId":       "session",
		"command":         "/bin/sh",
		"args":            []string{"-c", "printf '%s:%s' \"$CUSTOM\" \"$FORGE_SESSION_ID\""},
		"env":             []map[string]string{{"name": "CUSTOM", "value": "value"}},
		"cwd":             workspace,
		"outputByteLimit": limit,
	})
	created, err := rt.handleOpencodeTerminalCreate(params)
	if err != nil {
		t.Fatal(err)
	}
	terminalID := created["terminalId"].(string)
	waited, err := rt.handleOpencodeTerminalWaitForExit(mustJSON(map[string]any{"terminalId": terminalID}))
	if err != nil {
		t.Fatal(err)
	}
	if code := jsonNumberValue(waited["exitCode"]); code != 0 {
		t.Fatalf("unexpected exit code: %#v", waited)
	}
	output, err := rt.handleOpencodeTerminalOutput(mustJSON(map[string]any{"terminalId": terminalID}))
	if err != nil {
		t.Fatal(err)
	}
	if output["output"] != "value:session-terminal" || output["truncated"] != false {
		t.Fatalf("unexpected output: %#v", output)
	}
	if _, ok := output["exitStatus"]; !ok {
		t.Fatalf("expected exit status: %#v", output)
	}
	if err := rt.handleOpencodeTerminalRelease(mustJSON(map[string]any{"terminalId": terminalID})); err != nil {
		t.Fatal(err)
	}

	shortLimit := 4
	created, err = rt.handleOpencodeTerminalCreate(mustJSON(map[string]any{
		"command":         "/usr/bin/printf",
		"args":            []string{"abcdef"},
		"cwd":             workspace,
		"outputByteLimit": shortLimit,
	}))
	if err != nil {
		t.Fatal(err)
	}
	terminalID = created["terminalId"].(string)
	if _, err := rt.handleOpencodeTerminalWaitForExit(mustJSON(map[string]any{"terminalId": terminalID})); err != nil {
		t.Fatal(err)
	}
	output, err = rt.handleOpencodeTerminalOutput(mustJSON(map[string]any{"terminalId": terminalID}))
	if err != nil {
		t.Fatal(err)
	}
	if output["output"] != "cdef" || output["truncated"] != true {
		t.Fatalf("unexpected truncated output: %#v", output)
	}
	if err := rt.handleOpencodeTerminalRelease(mustJSON(map[string]any{"terminalId": terminalID})); err != nil {
		t.Fatal(err)
	}
}

func TestOpencodeSessionUpdateUsesACPShape(t *testing.T) {
	workspace := t.TempDir()
	if err := ensureAgentDirs(workspace); err != nil {
		t.Fatal(err)
	}
	manager := &agentManager{subscribers: make(map[string]map[chan agentEvent]bool)}
	rt := &agentRuntime{
		workspace:   guiWorkspace{ID: "workspace", Path: workspace},
		run:         agentRun{ID: "run-update", WorkspaceID: "workspace", Status: "running"},
		nextEventID: 1,
	}
	rt.handleOpencodeNotification(manager, "session/update", json.RawMessage(`{
		"sessionId":"session",
		"update":{"sessionUpdate":"agent_message_chunk","messageId":"message-one","content":{"type":"text","text":"hello"}}
	}`))
	rt.handleOpencodeNotification(manager, "session/update", json.RawMessage(`{
		"sessionId":"session",
		"update":{"sessionUpdate":"agent_thought_chunk","messageId":"message-one","content":{"type":"text","text":"thinking"}}
	}`))
	rt.handleOpencodeNotification(manager, "session/update", json.RawMessage(`{
		"sessionId":"session",
		"update":{"sessionUpdate":"usage_update","used":10,"size":100}
	}`))
	events := rt.snapshotEvents()
	if len(events) != 3 {
		t.Fatalf("unexpected events: %#v", events)
	}
	if events[0].Type != "assistant_delta" || events[0].Text != "hello" {
		t.Fatalf("unexpected message event: %#v", events[0])
	}
	if events[1].Type != "reasoning_delta" || events[1].Text != "thinking" {
		t.Fatalf("unexpected thought event: %#v", events[1])
	}
	if events[2].Type != "metadata" || events[2].Text != "usage_update" {
		t.Fatalf("unexpected metadata event: %#v", events[2])
	}
}

func TestOpencodeSessionSettingsValidateModelAndMode(t *testing.T) {
	options := []opencodeConfigOption{
		{
			ID:           "model",
			Category:     "model",
			CurrentValue: "opencode/big-pickle",
			Options: []opencodeConfigOptionChoice{
				{Value: "opencode/big-pickle"},
				{Value: "kimi-for-coding/k2p7"},
			},
		},
		{
			ID:           "mode",
			Category:     "mode",
			CurrentValue: "build",
			Options: []opencodeConfigOptionChoice{
				{Value: "build"},
				{Value: "plan"},
			},
		},
	}
	settings, err := opencodeSessionSettings(options, "kimi-for-coding/k2p7", "read-only")
	if err != nil {
		t.Fatal(err)
	}
	if settings["model"] != "kimi-for-coding/k2p7" || settings["mode"] != "plan" {
		t.Fatalf("unexpected settings: %#v", settings)
	}

	_, err = opencodeSessionSettings(options, "moonshotai/kimi-k2.7-code", "workspace-write")
	if err == nil || !strings.Contains(err.Error(), "not available") || !strings.Contains(err.Error(), "kimi-for-coding/k2p7") {
		t.Fatalf("expected actionable model error, got %v", err)
	}

	settings, err = opencodeSessionSettings(nil, "kimi-for-coding/k2p7", "workspace-write")
	if err != nil || len(settings) != 0 {
		t.Fatalf("sessions without config options should be left unchanged: %#v, %v", settings, err)
	}
}

func TestOpencodePromptResultMarksInteractiveRunIdle(t *testing.T) {
	workspace := t.TempDir()
	if err := ensureAgentDirs(workspace); err != nil {
		t.Fatal(err)
	}
	manager := &agentManager{subscribers: make(map[string]map[chan agentEvent]bool)}
	rt := &agentRuntime{
		workspace:   guiWorkspace{ID: "workspace", Path: workspace},
		manager:     manager,
		run:         agentRun{ID: "run-prompt", WorkspaceID: "workspace", Status: "running"},
		nextEventID: 1,
	}
	rt.handleOpencodePromptResult(nil, json.RawMessage(`{"stopReason":"end_turn"}`))
	if rt.run.Status != "idle" {
		t.Fatalf("expected idle status, got %q", rt.run.Status)
	}
	if events := rt.snapshotEvents(); len(events) != 1 || !strings.Contains(events[0].Text, "end_turn") {
		t.Fatalf("unexpected events: %#v", events)
	}
}

func TestOpencodePromptResultFinishesSchedulerTurn(t *testing.T) {
	workspace := t.TempDir()
	argsPath := filepath.Join(workspace, "args.txt")
	forgePath := filepath.Join(workspace, "forge-fake")
	script := `#!/bin/sh
printf '%s\n' "$*" > "$FORGE_TEST_ARGS"
printf '{"autoRun":{"state":"completed"}}\n'
`
	if err := os.WriteFile(forgePath, []byte(script), 0o755); err != nil {
		t.Fatal(err)
	}
	t.Setenv("FORGE_TEST_ARGS", argsPath)
	manager := newAgentManager(&server{forgePath: forgePath})
	rt := &agentRuntime{
		workspace: guiWorkspace{ID: "workspace", Path: workspace},
		manager:   manager,
		run: agentRun{
			ID:                "run-non-interactive",
			WorkspaceID:       "workspace",
			ResourceID:        "project1.task1",
			ForgeSessionID:    "session-one",
			SchedulerTurn:     true,
			AutoRunGeneration: 3,
			Status:            "running",
		},
		nextEventID: 1,
		done:        make(chan struct{}),
	}
	rt.handleOpencodePromptResult(nil, json.RawMessage(`{"stopReason":"end_turn"}`))
	if rt.run.Status != "idle" {
		t.Fatalf("expected idle status, got %q", rt.run.Status)
	}
	args := string(mustReadFile(t, argsPath))
	for _, expected := range []string{"task show", "--project project1", "--task task1"} {
		if !strings.Contains(args, expected) {
			t.Fatalf("expected settle args to contain %q, got %q", expected, args)
		}
	}
}

func TestOpencodeClientRequestUsesJSONRPC(t *testing.T) {
	reader, writer := io.Pipe()
	client := newOpencodeClient(nil, nil, writer)
	resultCh := make(chan error, 1)
	go func() {
		_, err := client.request("session/new", map[string]any{"cwd": "/tmp", "mcpServers": []any{}})
		resultCh <- err
	}()

	scanner := json.NewDecoder(reader)
	var request map[string]json.RawMessage
	if err := scanner.Decode(&request); err != nil {
		t.Fatal(err)
	}
	if rawString(request["jsonrpc"]) != "2.0" || rawString(request["method"]) != "session/new" {
		t.Fatalf("unexpected request: %#v", request)
	}
	client.handleLine([]byte(`{"jsonrpc":"2.0","id":1,"result":{"sessionId":"session"}}`))
	select {
	case err := <-resultCh:
		if err != nil {
			t.Fatal(err)
		}
	case <-time.After(time.Second):
		t.Fatal("request did not finish")
	}
	_ = reader.Close()
	_ = writer.Close()
}

func TestOpencodeLivePrompt(t *testing.T) {
	if os.Getenv("FORGE_TEST_OPENCODE") != "1" {
		t.Skip("set FORGE_TEST_OPENCODE=1 to run the live OpenCode ACP smoke test")
	}
	workspace := t.TempDir()
	manager := &agentManager{
		runtimes:    make(map[string]*agentRuntime),
		subscribers: make(map[string]map[chan agentEvent]bool),
	}
	rt := &agentRuntime{
		workspace:   guiWorkspace{ID: "workspace", Path: workspace},
		manager:     manager,
		run:         agentRun{ID: "run-live", WorkspaceID: "workspace", Cwd: workspace, Status: "starting"},
		nextEventID: 1,
		pending:     make(map[string]pendingApproval),
		done:        make(chan struct{}),
	}
	provider := newOpencodeAppServer()
	if err := provider.Start(manager); err != nil {
		t.Fatal(err)
	}
	defer provider.Stop()
	rt.provider = provider
	if err := provider.NewSession(rt); err != nil {
		t.Fatal(err)
	}
	defer provider.CloseSession(rt)
	if err := provider.SendPrompt(rt, "Reply with exactly: forge-opencode-smoke"); err != nil {
		t.Fatal(err)
	}
	output := waitForLiveOpencodeTurn(t, rt, manager, 0)
	if !strings.Contains(output, "forge-opencode-smoke") {
		t.Fatalf("unexpected assistant output %q", output)
	}

	eventCount := len(rt.snapshotEvents())
	target := filepath.Join(workspace, "opencode-smoke.txt")
	rt.updateStatus(manager, "running")
	if err := provider.SendPrompt(rt, "Create the file "+target+" containing exactly: written-by-opencode"); err != nil {
		t.Fatal(err)
	}
	waitForLiveOpencodeTurn(t, rt, manager, eventCount)
	if content := strings.TrimSpace(string(mustReadFile(t, target))); content != "written-by-opencode" {
		t.Fatalf("unexpected file content %q", content)
	}
}

func waitForLiveOpencodeTurn(t *testing.T, rt *agentRuntime, manager *agentManager, eventStart int) string {
	t.Helper()
	deadline := time.Now().Add(2 * time.Minute)
	for time.Now().Before(deadline) {
		time.Sleep(100 * time.Millisecond)
		rt.mu.Lock()
		status := rt.run.Status
		events := append([]agentEvent(nil), rt.events...)
		pendingIDs := make([]string, 0, len(rt.pending))
		for requestID := range rt.pending {
			pendingIDs = append(pendingIDs, requestID)
		}
		rt.mu.Unlock()
		for _, requestID := range pendingIDs {
			if err := rt.resolveApproval(manager, requestID, "accept"); err != nil {
				t.Fatal(err)
			}
		}
		if status != "idle" || len(pendingIDs) > 0 {
			continue
		}
		var output strings.Builder
		for _, event := range events[eventStart:] {
			if event.Type == "error" {
				t.Fatalf("OpenCode prompt failed: %s", event.Text)
			}
			if event.Type == "assistant_delta" {
				output.WriteString(event.Text)
			}
		}
		return output.String()
	}
	t.Fatal("OpenCode prompt did not finish")
	return ""
}

func jsonNumberValue(value any) int {
	switch number := value.(type) {
	case *int:
		if number == nil {
			return -1
		}
		return *number
	case int:
		return number
	default:
		return -1
	}
}
