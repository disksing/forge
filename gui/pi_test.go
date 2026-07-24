package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

func TestPiProviderUsesRPCCommand(t *testing.T) {
	provider := newPiRPCProvider()
	if provider.ID() != piProviderID {
		t.Fatalf("unexpected provider id: %q", provider.ID())
	}
	t.Setenv("PATH", "")
	t.Setenv("FORGE_PI_CLI", "")
	if _, err := provider.resolveCommand(); err == nil || !strings.Contains(err.Error(), "FORGE_PI_CLI") {
		t.Fatalf("expected actionable missing Pi error, got %v", err)
	}
}

func TestPiRPCProviderStartsSessionStreamsAndControlsPrompt(t *testing.T) {
	workspace := t.TempDir()
	if err := ensureAgentDirs(workspace); err != nil {
		t.Fatal(err)
	}
	command := filepath.Join(t.TempDir(), "pi-fake")
	script := `#!/bin/sh
if [ "$1" != "--mode" ] || [ "$2" != "rpc" ]; then
  exit 2
fi
IFS= read -r get_state
printf '%s\n' '{"id":1,"type":"response","command":"get_state","success":true,"data":{"sessionId":"pi-session"}}'
IFS= read -r prompt
printf '%s\n' '{"id":2,"type":"response","command":"prompt","success":true}'
printf '%s\n' '{"type":"agent_start"}'
printf '%s\n' '{"type":"turn_start"}'
printf '%s\n' '{"type":"message_start","message":{"role":"user","content":[]}}'
printf '%s\n' '{"type":"message_end","message":{"role":"user","content":[]}}'
printf '%s\n' '{"type":"message_start","message":{"role":"assistant","content":[]}}'
printf '%s\n' '{"type":"message_update","assistantMessageEvent":{"type":"thinking_delta","delta":"considering"}}'
printf '%s\n' '{"type":"message_update","assistantMessageEvent":{"type":"text_delta","delta":"hello from pi"}}'
printf '%s\n' '{"type":"message_end","message":{"role":"assistant","content":[]}}'
printf '%s\n' '{"type":"tool_execution_start","toolCallId":"tool-1","toolName":"read","args":{"path":"README.md"}}'
printf '%s\n' '{"type":"tool_execution_update","toolCallId":"tool-1","toolName":"read","partialResult":{}}'
printf '%s\n' '{"type":"tool_execution_end","toolCallId":"tool-1","toolName":"read","result":{"content":[{"type":"text","text":"done"}]}}'
printf '%s\n' '{"type":"tool_execution_start","toolCallId":"tool-2","toolName":"bash","args":{"command":"npm test"}}'
printf '%s\n' '{"type":"tool_execution_end","toolCallId":"tool-2","toolName":"bash","isError":true,"result":{"content":[{"type":"text","text":"boom"}]}}'
printf '%s\n' '{"type":"turn_end"}'
printf '%s\n' '{"type":"agent_end"}'
printf '%s\n' '{"type":"agent_settled"}'
IFS= read -r steer
printf '%s\n' '{"id":3,"type":"response","command":"steer","success":true}'
IFS= read -r abort
printf '%s\n' '{"id":4,"type":"response","command":"abort","success":true}'
while IFS= read -r line; do :; done
`
	if err := os.WriteFile(command, []byte(script), 0o755); err != nil {
		t.Fatal(err)
	}
	t.Setenv("FORGE_PI_CLI", command)

	manager := newAgentManager(&server{})
	provider := newPiRPCProvider()
	rt := &agentRuntime{
		workspace:   guiWorkspace{ID: "workspace", Path: workspace},
		manager:     manager,
		provider:    provider,
		run:         agentRun{ID: "run-pi", WorkspaceID: "workspace", Provider: piProviderID, Cwd: workspace, Status: "starting"},
		nextEventID: 1,
		pending:     make(map[string]pendingApproval),
		done:        make(chan struct{}),
	}
	if err := provider.Start(manager); err != nil {
		t.Fatal(err)
	}
	defer provider.Stop()
	if err := provider.NewSession(rt); err != nil {
		t.Fatal(err)
	}
	rt.mu.Lock()
	sessionID := rt.run.ProviderSessionID
	rt.mu.Unlock()
	if sessionID != "pi-session" {
		t.Fatalf("unexpected Pi session id: %q", sessionID)
	}
	if err := provider.SendPrompt(rt, "hello"); err != nil {
		t.Fatal(err)
	}
	deadline := time.Now().Add(2 * time.Second)
	status := ""
	for time.Now().Before(deadline) {
		rt.mu.Lock()
		status = rt.run.Status
		rt.mu.Unlock()
		if status == "idle" {
			break
		}
		time.Sleep(10 * time.Millisecond)
	}
	if status != "idle" {
		t.Fatalf("Pi prompt did not settle: status=%q events=%#v", status, rt.snapshotEvents())
	}
	events := rt.snapshotEvents()
	if !hasAgentEvent(events, "reasoning_delta", "considering") || !hasAgentEvent(events, "assistant_delta", "hello from pi") || !hasAgentEvent(events, "tool", "read README.md") {
		t.Fatalf("unexpected Pi events: %#v", events)
	}
	endCount := 0
	for _, event := range events {
		if event.Type == "tool" && event.Method == "tool_execution_end" && event.Text == "read README.md" {
			endCount++
		}
	}
	if endCount != 1 {
		t.Fatalf("expected Pi tool end event to reuse start args: %#v", events)
	}
	if !hasAgentEvent(events, "tool", "bash npm test failed") {
		t.Fatalf("expected failing Pi tool end event with start args: %#v", events)
	}
	for _, event := range events {
		if event.Method == "message_start" || event.Method == "message_end" || event.Method == "turn_start" || event.Method == "turn_end" || event.Method == "agent_start" || event.Method == "agent_end" || event.Method == "tool_execution_update" {
			t.Fatalf("Pi lifecycle noise should be dropped: %#v", events)
		}
	}
	settled := 0
	for _, event := range events {
		if event.Method == "session/prompt" && event.Text == "Pi Coding Agent turn finished." {
			settled++
		}
	}
	if settled != 1 {
		t.Fatalf("expected one Pi turn finished event: %#v", events)
	}
	if err := provider.SendInput(rt, "change direction"); err != nil {
		t.Fatal(err)
	}
	if err := provider.Interrupt(rt); err != nil {
		t.Fatal(err)
	}
}

func TestPiRPCProviderResumesSessionWithConfiguredOptions(t *testing.T) {
	workspace := t.TempDir()
	if err := ensureAgentDirs(workspace); err != nil {
		t.Fatal(err)
	}
	argsPath := filepath.Join(t.TempDir(), "args")
	command := filepath.Join(t.TempDir(), "pi-fake")
	script := `#!/bin/sh
printf '%s\n' "$@" > "$FORGE_TEST_PI_ARGS"
IFS= read -r get_state
printf '%s\n' '{"id":1,"type":"response","command":"get_state","success":true,"data":{"sessionId":"existing-session"}}'
while IFS= read -r line; do :; done
`
	if err := os.WriteFile(command, []byte(script), 0o755); err != nil {
		t.Fatal(err)
	}
	t.Setenv("FORGE_PI_CLI", command)
	t.Setenv("FORGE_TEST_PI_ARGS", argsPath)
	manager := newAgentManager(&server{})
	provider := newPiRPCProvider()
	rt := &agentRuntime{
		workspace: workspaceForPiTest(workspace),
		manager:   manager,
		provider:  provider,
		run: agentRun{
			ID: "run-resume", WorkspaceID: "workspace", Provider: piProviderID, ProviderSessionID: "existing-session",
			Cwd: workspace, Status: "starting", Model: "openai/gpt-test", Sandbox: "read-only", Title: "Pi test",
		},
		nextEventID: 1,
		pending:     make(map[string]pendingApproval),
		done:        make(chan struct{}),
	}
	if err := provider.Start(manager); err != nil {
		t.Fatal(err)
	}
	defer provider.Stop()
	if err := provider.ResumeSession(rt); err != nil {
		t.Fatal(err)
	}
	args, err := os.ReadFile(argsPath)
	if err != nil {
		t.Fatal(err)
	}
	joined := strings.Join(strings.Fields(string(args)), " ")
	for _, want := range []string{"--mode rpc", "--model openai/gpt-test", "--tools read,grep,find,ls", "--session existing-session", "--name Pi test"} {
		if !strings.Contains(joined, want) {
			t.Fatalf("Pi arguments %q do not contain %q", joined, want)
		}
	}
	if events := rt.snapshotEvents(); len(events) != 1 || events[0].Method != "session/resume" {
		t.Fatalf("unexpected resume events: %#v", events)
	}
}

func TestPiProviderOptionsAndAvailability(t *testing.T) {
	providers := normalizeAgentProviders(nil)
	pi, ok := findAgentProvider(providers, piProviderID)
	if !ok || pi.Enabled || pi.Name != piProviderName || pi.Type != piProviderID {
		t.Fatalf("unexpected default Pi provider: %#v", pi)
	}
	agent := normalizeAgentOptions(agentConfig{Options: map[string]string{
		agentOptionMode: "plan", agentOptionModel: "openai/gpt-test", agentOptionApproval: "never",
	}}, piProviderID)
	if len(agent.Options) != 2 || agentOption(agent, agentOptionMode) != "plan" || agentOption(agent, agentOptionModel) != "openai/gpt-test" {
		t.Fatalf("unexpected Pi options: %#v", agent.Options)
	}
	run := agentRun{}
	applyAgentRunOptions(&run, agent, piProviderID)
	if run.Model != "openai/gpt-test" || run.Sandbox != "read-only" || run.Approval != "" {
		t.Fatalf("unexpected Pi run options: %#v", run)
	}
	cfg := config{
		AgentProviders: []agentProviderConfig{{ID: piProviderID, Type: piProviderID, Enabled: true}},
		Agents:         []agentConfig{{ID: "pi-agent", ProviderID: piProviderID}},
	}
	if !agentConfigAvailable(cfg, "pi-agent") {
		t.Fatal("enabled Pi provider should be available to AutoRun")
	}
}

func workspaceForPiTest(path string) guiWorkspace {
	return guiWorkspace{ID: "workspace", Path: path}
}

func hasAgentEvent(events []agentEvent, eventType, text string) bool {
	for _, event := range events {
		if event.Type == eventType && event.Text == text {
			return true
		}
	}
	return false
}
