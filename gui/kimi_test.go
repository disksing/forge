package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

func TestKimiProviderUsesKimiACPCommand(t *testing.T) {
	provider := newKimiAppServer()
	if provider.ID() != kimiProviderID || provider.providerName != kimiProviderName {
		t.Fatalf("unexpected provider identity: %#v", provider)
	}
	if provider.commandEnv != "FORGE_KIMI_CLI" || provider.command != "kimi" || strings.Join(provider.args, " ") != "acp" {
		t.Fatalf("unexpected Kimi ACP command: env=%q command=%q args=%q", provider.commandEnv, provider.command, provider.args)
	}
}

func TestKimiACPProviderStartsSessionAndStreamsPrompt(t *testing.T) {
	workspace := t.TempDir()
	if err := ensureAgentDirs(workspace); err != nil {
		t.Fatal(err)
	}
	command := filepath.Join(t.TempDir(), "kimi-fake")
	script := `#!/bin/sh
if [ "$1" != "acp" ]; then
  exit 2
fi
IFS= read -r initialize
printf '%s\n' '{"jsonrpc":"2.0","id":1,"result":{"protocolVersion":1,"agentCapabilities":{"loadSession":true,"sessionCapabilities":{"resume":{}}}}}'
IFS= read -r new_session
printf '%s\n' '{"jsonrpc":"2.0","id":2,"result":{"sessionId":"kimi-session","configOptions":[]}}'
IFS= read -r prompt
printf '%s\n' '{"jsonrpc":"2.0","method":"session/update","params":{"sessionId":"kimi-session","update":{"sessionUpdate":"agent_message_chunk","content":{"type":"text","text":"hello from kimi"}}}}'
printf '%s\n' '{"jsonrpc":"2.0","id":3,"result":{"stopReason":"end_turn"}}'
IFS= read -r resume
printf '%s\n' '{"jsonrpc":"2.0","id":4,"result":{"sessionId":"kimi-session","configOptions":[]}}'
while IFS= read -r line; do :; done
`
	if err := os.WriteFile(command, []byte(script), 0o755); err != nil {
		t.Fatal(err)
	}
	t.Setenv("FORGE_KIMI_CLI", command)

	s := &server{}
	manager := newAgentManager(s)
	provider := newKimiAppServer()
	rt := &agentRuntime{
		workspace:   guiWorkspace{ID: "workspace", Path: workspace},
		manager:     manager,
		provider:    provider,
		run:         agentRun{ID: "run-kimi", WorkspaceID: "workspace", Provider: kimiProviderID, Cwd: workspace, Status: "starting"},
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
	if rt.run.ProviderSessionID != "kimi-session" {
		t.Fatalf("unexpected Kimi session id: %q", rt.run.ProviderSessionID)
	}
	if err := provider.SendPrompt(rt, "hello"); err != nil {
		t.Fatal(err)
	}
	deadline := time.Now().Add(2 * time.Second)
	for time.Now().Before(deadline) {
		if rt.run.Status == "idle" {
			break
		}
		time.Sleep(10 * time.Millisecond)
	}
	if rt.run.Status != "idle" {
		t.Fatalf("Kimi prompt did not finish: status=%q events=%#v", rt.run.Status, rt.snapshotEvents())
	}
	events := rt.snapshotEvents()
	if len(events) < 3 || events[0].Text != "Kimi Code session started." || events[1].Type != "assistant_delta" || events[1].Text != "hello from kimi" || !strings.Contains(events[2].Text, "Kimi Code turn finished") {
		t.Fatalf("unexpected Kimi events: %#v", events)
	}
	if err := provider.ResumeSession(rt); err != nil {
		t.Fatal(err)
	}
	events = rt.snapshotEvents()
	if last := events[len(events)-1]; last.Method != "session/resume" || last.Text != "Kimi Code session resumed." {
		t.Fatalf("unexpected Kimi resume event: %#v", last)
	}
}

func TestKimiProviderOptionsAndAvailability(t *testing.T) {
	providers := normalizeAgentProviders(nil)
	kimi, ok := findAgentProvider(providers, kimiProviderID)
	if !ok || kimi.Enabled || kimi.Name != kimiProviderName || kimi.Type != kimiProviderID {
		t.Fatalf("unexpected default Kimi provider: %#v", kimi)
	}
	agent := normalizeAgentOptions(agentConfig{Options: map[string]string{
		agentOptionMode:     "plan",
		agentOptionModel:    "kimi-code",
		agentOptionSandbox:  "danger-full-access",
		agentOptionApproval: "never",
	}}, kimiProviderID)
	if len(agent.Options) != 2 || agentOption(agent, agentOptionMode) != "plan" || agentOption(agent, agentOptionModel) != "kimi-code" {
		t.Fatalf("unexpected Kimi options: %#v", agent.Options)
	}
	run := agentRun{}
	applyAgentRunOptions(&run, agent, kimiProviderID)
	if run.Model != "kimi-code" || run.Sandbox != "read-only" || run.Approval != "" {
		t.Fatalf("unexpected Kimi run options: %#v", run)
	}
	cfg := config{
		AgentProviders: []agentProviderConfig{{ID: kimiProviderID, Type: kimiProviderID, Enabled: true}},
		Agents:         []agentConfig{{ID: "kimi-agent", ProviderID: kimiProviderID}},
	}
	if !agentConfigAvailable(cfg, "kimi-agent") {
		t.Fatal("enabled Kimi provider should be available to AutoRun")
	}
}

func TestKimiSessionSettingsUseProviderName(t *testing.T) {
	options := []opencodeConfigOption{{
		ID:           "model",
		Category:     "model",
		CurrentValue: "default",
		Options:      []opencodeConfigOptionChoice{{Value: "default"}},
	}}
	_, err := acpSessionSettings(options, "missing", "workspace-write", kimiProviderName)
	if err == nil || !strings.Contains(err.Error(), kimiProviderName) {
		t.Fatalf("expected a Kimi-specific configuration error, got %v", err)
	}
}
