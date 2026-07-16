package main

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"testing"
)

type recordingAgentProvider struct {
	inputCalls  int
	inputText   string
	inputErr    error
	promptCalls int
}

func (p *recordingAgentProvider) ID() string                             { return "recording" }
func (p *recordingAgentProvider) Start(*agentManager) error              { return nil }
func (p *recordingAgentProvider) Stop() error                            { return nil }
func (p *recordingAgentProvider) IsRunning() bool                        { return true }
func (p *recordingAgentProvider) Done() <-chan struct{}                  { return closedProviderDone() }
func (p *recordingAgentProvider) NewSession(*agentRuntime) error         { return nil }
func (p *recordingAgentProvider) ResumeSession(*agentRuntime) error      { return nil }
func (p *recordingAgentProvider) SendPrompt(*agentRuntime, string) error { p.promptCalls++; return nil }
func (p *recordingAgentProvider) Interrupt(*agentRuntime) error          { return nil }
func (p *recordingAgentProvider) CloseSession(*agentRuntime) error       { return nil }
func (p *recordingAgentProvider) ResolveApproval(pendingApproval, string) (any, error) {
	return nil, nil
}

func (p *recordingAgentProvider) SendInput(_ *agentRuntime, text string) error {
	p.inputCalls++
	p.inputText = text
	return p.inputErr
}

func TestAgentMessageDeltaTextPreservesWhitespace(t *testing.T) {
	text, ok := agentMessageDeltaText(json.RawMessage(`{"delta":" \n"}`))
	if !ok {
		t.Fatal("expected delta to be found")
	}
	if text != " \n" {
		t.Fatalf("expected whitespace delta to be preserved, got %q", text)
	}
}

func TestForgeThreadConfigIncludesSession(t *testing.T) {
	config := forgeThreadConfig(agentRun{ForgeSessionID: "session-one", SchedulerTurn: true, AutoRunGeneration: 4})
	if config["shell_environment_policy.set.FORGE_SESSION_ID"] != "session-one" || len(config) != 1 {
		t.Fatalf("unexpected thread config: %#v", config)
	}
}

func TestAgentRuntimeStopIsIdempotent(t *testing.T) {
	workspace := t.TempDir()
	if err := ensureAgentDirs(workspace); err != nil {
		t.Fatal(err)
	}
	rt := &agentRuntime{
		workspace: guiWorkspace{ID: "workspace", Path: workspace},
		run: agentRun{
			ID:          "run-one",
			WorkspaceID: "workspace",
			Status:      "running",
		},
		nextEventID: 1,
		done:        make(chan struct{}),
	}
	m := &agentManager{
		runtimes:    make(map[string]*agentRuntime),
		subscribers: make(map[string]map[chan agentEvent]bool),
	}

	const requests = 20
	var wg sync.WaitGroup
	results := make(chan bool, requests)
	for range requests {
		wg.Add(1)
		go func() {
			defer wg.Done()
			results <- rt.stop(m)
		}()
	}
	wg.Wait()
	close(results)

	accepted := 0
	for result := range results {
		if result {
			accepted++
		}
	}
	if accepted != 1 {
		t.Fatalf("expected exactly one stop request to be accepted, got %d", accepted)
	}
	events := rt.snapshotEvents()
	if len(events) != 1 || events[0].Text != "Stop requested." {
		t.Fatalf("expected one stop event, got %#v", events)
	}
	rt.markIdle(m)
	rt.updateStatus(m, "failed")
	rt.mu.Lock()
	status := rt.run.Status
	rt.mu.Unlock()
	if status != "stopped" {
		t.Fatalf("expected stopped status, got %q", status)
	}
}

func TestSendInputIntervenesInSchedulerTurnWithoutChangingAutoRunState(t *testing.T) {
	workspace := t.TempDir()
	if err := ensureAgentDirs(workspace); err != nil {
		t.Fatal(err)
	}
	configPath := filepath.Join(t.TempDir(), "gui.json")
	configData, err := json.Marshal(config{Version: 1, Workspaces: []guiWorkspace{{ID: "workspace-one", Path: workspace}}})
	if err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(configPath, configData, 0o644); err != nil {
		t.Fatal(err)
	}

	provider := &recordingAgentProvider{}
	s := &server{config: configPath}
	m := newAgentManager(s)
	rt := &agentRuntime{
		workspace: guiWorkspace{ID: "workspace-one", Path: workspace},
		run: agentRun{
			ID:                "run-autorun",
			WorkspaceID:       "workspace-one",
			ResourceID:        "project1.task1",
			Status:            "running",
			SchedulerTurn:     true,
			AutoRunGeneration: 7,
		},
		provider:    provider,
		nextEventID: 1,
	}
	m.registerRuntime(rt)

	req := httptest.NewRequest(http.MethodPost, "/api/workspaces/workspace-one/agent/runs/run-autorun/input", strings.NewReader(`{"text":"Use the new constraint"}`))
	rec := httptest.NewRecorder()
	m.sendInput(rec, req, "workspace-one", "run-autorun")
	if rec.Code != http.StatusOK {
		t.Fatalf("expected intervention to be accepted, got %d: %s", rec.Code, rec.Body.String())
	}
	if provider.inputCalls != 1 || provider.inputText != "Use the new constraint" || provider.promptCalls != 0 {
		t.Fatalf("expected exactly one active-turn delivery, got calls=%d text=%q prompts=%d", provider.inputCalls, provider.inputText, provider.promptCalls)
	}
	rt.mu.Lock()
	run := rt.run
	rt.mu.Unlock()
	if !run.SchedulerTurn || run.AutoRunGeneration != 7 || run.Status != "running" {
		t.Fatalf("intervention changed AutoRun state: %#v", run)
	}
	events := rt.snapshotEvents()
	if len(events) != 1 || events[0].Type != "user" || events[0].Text != "Use the new constraint" {
		t.Fatalf("expected one accepted user event, got %#v", events)
	}
}

func TestSendInputReportsUndeliverableInterventionWithoutRecordingIt(t *testing.T) {
	workspace := t.TempDir()
	if err := ensureAgentDirs(workspace); err != nil {
		t.Fatal(err)
	}
	provider := &recordingAgentProvider{inputErr: errors.New("active turn cannot accept input")}
	m := &agentManager{subscribers: make(map[string]map[chan agentEvent]bool)}
	rt := &agentRuntime{
		workspace:   guiWorkspace{ID: "workspace-one", Path: workspace},
		run:         agentRun{ID: "run-autorun", WorkspaceID: "workspace-one", Status: "running", SchedulerTurn: true, AutoRunGeneration: 4},
		provider:    provider,
		nextEventID: 1,
	}

	err := rt.sendInput(m, "Try this instead")
	if err == nil || !strings.Contains(err.Error(), "cannot accept input") {
		t.Fatalf("expected an explicit delivery error, got %v", err)
	}
	if provider.inputCalls != 1 {
		t.Fatalf("expected one delivery attempt, got %d", provider.inputCalls)
	}
	if events := rt.snapshotEvents(); len(events) != 0 {
		t.Fatalf("undelivered input should not be recorded as accepted: %#v", events)
	}
	if !rt.run.SchedulerTurn || rt.run.AutoRunGeneration != 4 || rt.run.Status != "running" {
		t.Fatalf("failed intervention changed AutoRun state: %#v", rt.run)
	}
}

func TestReplaceAgentsUserContentPreservesManagedBlock(t *testing.T) {
	current := "# Old Notes\n\n" + agentsManagedStart + "\nsystem\n" + agentsManagedEnd + "\n\n# Tail\n"
	got, err := replaceAgentsUserContent(current, "# New Notes\n")
	if err != nil {
		t.Fatal(err)
	}
	want := "# New Notes\n\n" + agentsManagedStart + "\nsystem\n" + agentsManagedEnd + "\n"
	if got != want {
		t.Fatalf("unexpected AGENTS.md content\nwant:\n%s\ngot:\n%s", want, got)
	}
}

func TestReplaceAgentsUserContentCanClearUserContent(t *testing.T) {
	current := "# Notes\n\n" + agentsManagedStart + "\nsystem\n" + agentsManagedEnd + "\n"
	got, err := replaceAgentsUserContent(current, "")
	if err != nil {
		t.Fatal(err)
	}
	want := agentsManagedStart + "\nsystem\n" + agentsManagedEnd + "\n"
	if got != want {
		t.Fatalf("unexpected AGENTS.md content\nwant:\n%s\ngot:\n%s", want, got)
	}
}

func TestReplaceAgentsUserContentRejectsSingleManagedMarker(t *testing.T) {
	if _, err := replaceAgentsUserContent(agentsManagedStart+"\nsystem\n", "# Notes"); err == nil {
		t.Fatal("expected single marker to fail")
	}
}

func TestIsHiddenAgentsPathKeepsWorkspaceAgentsVisible(t *testing.T) {
	if isHiddenAgentsPath("AGENTS.md") {
		t.Fatal("workspace AGENTS.md should stay visible")
	}
	if !isHiddenAgentsPath("project1/task1/AGENTS.md") {
		t.Fatal("project/task AGENTS.md should be hidden")
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

func TestLoadConfigCreatesDefaultAgentProviderAndAgent(t *testing.T) {
	s := &server{config: filepath.Join(t.TempDir(), "gui.json")}
	cfg, err := s.loadConfig()
	if err != nil {
		t.Fatal(err)
	}
	provider, ok := findAgentProvider(cfg.AgentProviders, codexProviderID)
	if !ok {
		t.Fatalf("expected default Codex provider, got %#v", cfg.AgentProviders)
	}
	if !provider.Enabled || provider.Type != codexProviderID {
		t.Fatalf("unexpected default provider: %#v", provider)
	}
	if len(cfg.Agents) != 1 {
		t.Fatalf("expected one default agent, got %#v", cfg.Agents)
	}
	agent := cfg.Agents[0]
	if agent.ProviderID != codexProviderID || agentOption(agent, agentOptionSandbox) != "workspace-write" || agentOption(agent, agentOptionApproval) != "on-request" {
		t.Fatalf("unexpected default agent: %#v", agent)
	}
	if _, ok := agent.Options[agentOptionModel]; ok {
		t.Fatalf("default agent should omit an empty model: %#v", agent.Options)
	}
	if cfg.DefaultChatAgentID != agent.ID {
		t.Fatalf("expected default chat agent %q, got %q", agent.ID, cfg.DefaultChatAgentID)
	}
}

func TestLoadConfigNormalizesDefaultChatAgent(t *testing.T) {
	s := &server{config: filepath.Join(t.TempDir(), "gui.json")}
	if err := s.saveConfig(config{
		Version:            1,
		DefaultChatAgentID: "missing",
		AgentProviders: []agentProviderConfig{
			{ID: codexProviderID, Name: codexProviderName, Type: codexProviderID, Enabled: true},
		},
		Agents: []agentConfig{
			{ID: "codex-a", Name: "Codex A", ProviderID: codexProviderID, Options: map[string]string{agentOptionSandbox: "workspace-write", agentOptionApproval: "on-request"}},
			{ID: "codex-b", Name: "Codex B", ProviderID: codexProviderID, Options: map[string]string{agentOptionSandbox: "danger-full-access", agentOptionApproval: "never"}},
		},
	}); err != nil {
		t.Fatal(err)
	}
	cfg, err := s.loadConfig()
	if err != nil {
		t.Fatal(err)
	}
	if cfg.DefaultChatAgentID != "codex-a" {
		t.Fatalf("expected invalid default chat agent to fall back to first agent, got %q", cfg.DefaultChatAgentID)
	}
}

func TestUpdateDefaultChatAgentSetting(t *testing.T) {
	s := &server{config: filepath.Join(t.TempDir(), "gui.json")}
	if err := s.saveConfig(config{
		Version: 1,
		AgentProviders: []agentProviderConfig{
			{ID: codexProviderID, Name: codexProviderName, Type: codexProviderID, Enabled: true},
		},
		Agents: []agentConfig{
			{ID: "codex-a", Name: "Codex A", ProviderID: codexProviderID, Options: map[string]string{agentOptionSandbox: "workspace-write", agentOptionApproval: "on-request"}},
			{ID: "codex-b", Name: "Codex B", ProviderID: codexProviderID, Options: map[string]string{agentOptionSandbox: "danger-full-access", agentOptionApproval: "never"}},
		},
	}); err != nil {
		t.Fatal(err)
	}
	req := httptest.NewRequest(http.MethodPut, "/api/settings/agent/default-chat", strings.NewReader(`{"agentId":"codex-b"}`))
	rec := httptest.NewRecorder()
	s.handleSettings(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected OK, got %d: %s", rec.Code, rec.Body.String())
	}
	cfg, err := s.loadConfig()
	if err != nil {
		t.Fatal(err)
	}
	if cfg.DefaultChatAgentID != "codex-b" {
		t.Fatalf("expected default chat agent to be saved, got %q", cfg.DefaultChatAgentID)
	}
}

func TestResolveAgentConfigUsesNamedAgent(t *testing.T) {
	s := &server{config: filepath.Join(t.TempDir(), "gui.json")}
	if err := s.saveConfig(config{
		Version: 1,
		AgentProviders: []agentProviderConfig{
			{ID: codexProviderID, Name: codexProviderName, Type: codexProviderID, Enabled: true},
		},
		Agents: []agentConfig{
			{ID: "gpt-5-5", Name: "gpt-5.5", ProviderID: codexProviderID, Options: map[string]string{agentOptionSandbox: "danger-full-access", agentOptionApproval: "on-request", agentOptionModel: "gpt-5.5"}},
		},
	}); err != nil {
		t.Fatal(err)
	}
	m := newAgentManager(s)
	agent, provider, err := m.resolveAgentConfig(startAgentRequest{AgentID: "gpt-5-5"})
	if err != nil {
		t.Fatal(err)
	}
	if provider.ID != codexProviderID {
		t.Fatalf("unexpected provider: %#v", provider)
	}
	if agentOption(agent, agentOptionModel) != "gpt-5.5" || agentOption(agent, agentOptionSandbox) != "danger-full-access" || agentOption(agent, agentOptionApproval) != "on-request" {
		t.Fatalf("named agent options were not used: %#v", agent)
	}
}

func TestResolveAgentConfigUsesConfiguredDefaultWhenAgentIDIsEmpty(t *testing.T) {
	s := &server{config: filepath.Join(t.TempDir(), "gui.json")}
	if err := s.saveConfig(config{
		Version:            1,
		DefaultChatAgentID: "open",
		AgentProviders: []agentProviderConfig{
			{ID: opencodeProviderID, Name: opencodeProviderName, Type: opencodeProviderID, Enabled: true},
		},
		Agents: []agentConfig{
			{ID: "open", Name: "OpenCode", ProviderID: opencodeProviderID, Options: map[string]string{agentOptionMode: "plan"}},
		},
	}); err != nil {
		t.Fatal(err)
	}
	agent, provider, err := newAgentManager(s).resolveAgentConfig(startAgentRequest{})
	if err != nil {
		t.Fatal(err)
	}
	if agent.ID != "open" || provider.ID != opencodeProviderID {
		t.Fatalf("unexpected default resolution: agent=%#v provider=%#v", agent, provider)
	}
}

func TestApplyAgentRunOptionsUsesProviderSpecificFields(t *testing.T) {
	codexRun := agentRun{}
	applyAgentRunOptions(&codexRun, agentConfig{Options: map[string]string{
		agentOptionModel:    "gpt-5.5",
		agentOptionSandbox:  "danger-full-access",
		agentOptionApproval: "never",
	}}, codexProviderID)
	if codexRun.Model != "gpt-5.5" || codexRun.Sandbox != "danger-full-access" || codexRun.Approval != "never" {
		t.Fatalf("unexpected Codex run options: %#v", codexRun)
	}

	opencodeRun := agentRun{}
	applyAgentRunOptions(&opencodeRun, agentConfig{Options: map[string]string{
		agentOptionModel:    "openai/gpt-5",
		agentOptionMode:     "plan",
		agentOptionSandbox:  "danger-full-access",
		agentOptionApproval: "never",
	}}, opencodeProviderID)
	if opencodeRun.Model != "openai/gpt-5" || opencodeRun.Sandbox != "read-only" || opencodeRun.Approval != "" {
		t.Fatalf("unexpected OpenCode run options: %#v", opencodeRun)
	}
}

func TestNormalizeAgentOptionsKeepsOnlyProviderFields(t *testing.T) {
	agent := normalizeAgentOptions(agentConfig{
		ProviderID: opencodeProviderID,
		Options: map[string]string{
			agentOptionMode:     "plan",
			agentOptionModel:    "openai/gpt-5",
			agentOptionSandbox:  "danger-full-access",
			agentOptionApproval: "never",
		},
	}, opencodeProviderID)
	if len(agent.Options) != 2 || agentOption(agent, agentOptionMode) != "plan" || agentOption(agent, agentOptionModel) != "openai/gpt-5" {
		t.Fatalf("unexpected OpenCode options: %#v", agent.Options)
	}
}

func TestUpdateAgentsPersistsProviderSpecificOptions(t *testing.T) {
	s := &server{config: filepath.Join(t.TempDir(), "gui.json")}
	body := `[
  {"id":"open","name":"OpenCode","providerId":"opencode","options":{"mode":"plan","model":"openai/gpt-5"}},
  {"id":"code","name":"Codex","providerId":"codex","options":{"sandbox":"danger-full-access","approval":"never","model":"gpt-5.5"}}
]`
	req := httptest.NewRequest(http.MethodPut, "/api/settings/agents", strings.NewReader(body))
	rec := httptest.NewRecorder()
	s.handleSettings(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected OK, got %d: %s", rec.Code, rec.Body.String())
	}
	cfg, err := s.loadConfig()
	if err != nil {
		t.Fatal(err)
	}
	if got := cfg.Agents[0].Options; len(got) != 2 || got[agentOptionMode] != "plan" || got[agentOptionModel] != "openai/gpt-5" {
		t.Fatalf("unexpected saved OpenCode options: %#v", got)
	}
	if got := cfg.Agents[1].Options; len(got) != 3 || got[agentOptionSandbox] != "danger-full-access" || got[agentOptionApproval] != "never" || got[agentOptionModel] != "gpt-5.5" {
		t.Fatalf("unexpected saved Codex options: %#v", got)
	}
}

func TestResolveAgentConfigRejectsDisabledProvider(t *testing.T) {
	s := &server{config: filepath.Join(t.TempDir(), "gui.json")}
	if err := s.saveConfig(config{
		Version: 1,
		AgentProviders: []agentProviderConfig{
			{ID: codexProviderID, Name: codexProviderName, Type: codexProviderID, Enabled: false},
		},
		Agents: []agentConfig{
			{ID: "codex", Name: "Codex", ProviderID: codexProviderID, Options: map[string]string{agentOptionSandbox: "workspace-write", agentOptionApproval: "on-request"}},
		},
	}); err != nil {
		t.Fatal(err)
	}
	m := newAgentManager(s)
	_, _, err := m.resolveAgentConfig(startAgentRequest{AgentID: "codex"})
	if err == nil || !strings.Contains(err.Error(), "disabled") {
		t.Fatalf("expected disabled provider error, got %v", err)
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
			AgentID:        "codex-review",
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
	if internal.Source != "internal" || internal.AgentRunID != "run-one" || internal.AgentRunAgentID != "codex-review" || internal.AgentRunProvider != "codex" || internal.AgentRunStatus != "running" || internal.AgentRunUpdatedAt != updatedAt || internal.AgentRunLastOutputAt != lastOutputAt || internal.ResourceID != "project1.task1" {
		t.Fatalf("internal session was not enriched with agent run state: %#v", internal)
	}
	if tree.Sessions[1].Source != "external" || tree.Sessions[1].AgentRunUpdatedAt != "" || tree.Sessions[1].AgentRunLastOutputAt != "" {
		t.Fatalf("external session should only be marked external: %#v", tree.Sessions[1])
	}
}

func TestListRunsFiltersWorkspaceScope(t *testing.T) {
	workspace := t.TempDir()
	now := "2026-07-07T12:00:00+08:00"
	runs := []agentRun{
		{
			ID:          "run-workspace",
			WorkspaceID: "workspace-one",
			Provider:    "codex",
			Title:       "Workspace Run",
			Cwd:         workspace,
			Status:      "completed",
			Sandbox:     "workspace-write",
			Approval:    "on-request",
			CreatedAt:   now,
			UpdatedAt:   now,
		},
		{
			ID:          "run-task",
			WorkspaceID: "workspace-one",
			ResourceID:  "project1.task1",
			Provider:    "codex",
			Title:       "Task Run",
			Cwd:         filepath.Join(workspace, "project1", "task1"),
			Status:      "completed",
			Sandbox:     "workspace-write",
			Approval:    "on-request",
			CreatedAt:   now,
			UpdatedAt:   now,
		},
	}
	if err := rewriteAgentRuns(workspace, runs); err != nil {
		t.Fatal(err)
	}
	configPath := filepath.Join(t.TempDir(), "gui.json")
	s := &server{config: configPath}
	if err := s.saveConfig(config{
		Version:    1,
		Workspaces: []guiWorkspace{{ID: "workspace-one", Path: workspace}},
	}); err != nil {
		t.Fatal(err)
	}
	m := newAgentManager(s)

	req := httptest.NewRequest(http.MethodGet, "/api/workspaces/workspace-one/agent/runs?resourceId=workspace", nil)
	rec := httptest.NewRecorder()
	m.listRuns(rec, req, "workspace-one")
	if rec.Code != http.StatusOK {
		t.Fatalf("expected OK, got %d: %s", rec.Code, rec.Body.String())
	}
	var body struct {
		Runs []agentRun `json:"runs"`
	}
	if err := json.Unmarshal(rec.Body.Bytes(), &body); err != nil {
		t.Fatal(err)
	}
	if len(body.Runs) != 1 || body.Runs[0].ID != "run-workspace" {
		t.Fatalf("expected only workspace-scoped run, got %#v", body.Runs)
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

func TestCreateForgeSessionUsesGUIRunLiveness(t *testing.T) {
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

	m := newAgentManager(&server{forgePath: forgePath, addr: "127.0.0.1:4936"})
	id, err := m.createForgeSession(context.Background(), guiWorkspace{ID: "workspace-one", Path: workspace}, "run-one")
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
	expected := "session new --gui-run --workspace-id workspace-one --run-id run-one --endpoint http://127.0.0.1:4936\n"
	if string(args) != expected {
		t.Fatalf("expected session new args %q, got %q", expected, string(args))
	}
}

func TestAgentRunCwdDefaultsToResourceDirectory(t *testing.T) {
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

	got, err := m.agentRunCwd(context.Background(), guiWorkspace{Path: workspace}, "project1.task1", "")
	if err != nil {
		t.Fatal(err)
	}
	want, err := filepath.Abs(resourceDir)
	if err != nil {
		t.Fatal(err)
	}
	if got != want {
		t.Fatalf("expected empty cwd to default to resource dir %s, got %s", want, got)
	}

	got, err = m.agentRunCwd(context.Background(), guiWorkspace{Path: workspace}, "project1.task1", "project1")
	if err != nil {
		t.Fatal(err)
	}
	want, err = filepath.Abs(filepath.Join(workspace, "project1"))
	if err != nil {
		t.Fatal(err)
	}
	if got != want {
		t.Fatalf("expected requested cwd to override resource dir %s, got %s", want, got)
	}
}

func TestHandleSessionLivenessUsesActiveRuntime(t *testing.T) {
	workspace := t.TempDir()
	tmp := t.TempDir()
	configPath := filepath.Join(tmp, "config.json")
	cfg := config{
		Version:    1,
		Workspaces: []guiWorkspace{{ID: "workspace-one", Path: workspace}},
	}
	data, err := json.Marshal(cfg)
	if err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(configPath, data, 0o644); err != nil {
		t.Fatal(err)
	}

	s := &server{config: configPath}
	m := newAgentManager(s)
	s.agents = m
	rt := &agentRuntime{
		workspace: guiWorkspace{ID: "workspace-one", Path: workspace},
		run:       agentRun{ID: "run-one", WorkspaceID: "workspace-one", ForgeSessionID: "session-one", CodexThreadID: "thread-one", Status: "idle"},
	}
	m.registerRuntime(rt)

	req := httptest.NewRequest(http.MethodGet, "/api/internal/session-liveness?workspaceId=workspace-one&runId=run-one&forgeSessionId=session-one", nil)
	rec := httptest.NewRecorder()
	m.handleSessionLiveness(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected OK, got %d: %s", rec.Code, rec.Body.String())
	}
	var active struct {
		Active        bool   `json:"active"`
		Status        string `json:"status"`
		CodexThreadID string `json:"codexThreadId"`
	}
	if err := json.Unmarshal(rec.Body.Bytes(), &active); err != nil {
		t.Fatal(err)
	}
	if !active.Active || active.Status != "idle" || active.CodexThreadID != "thread-one" {
		t.Fatalf("unexpected active response: %#v", active)
	}

	req = httptest.NewRequest(http.MethodGet, "/api/internal/session-liveness?workspaceId=workspace-one&runId=run-one&forgeSessionId=different", nil)
	rec = httptest.NewRecorder()
	m.handleSessionLiveness(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected OK for inactive response, got %d: %s", rec.Code, rec.Body.String())
	}
	var inactive struct {
		Active bool `json:"active"`
	}
	if err := json.Unmarshal(rec.Body.Bytes(), &inactive); err != nil {
		t.Fatal(err)
	}
	if inactive.Active {
		t.Fatalf("expected mismatched session to be inactive: %s", rec.Body.String())
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
		ID:                "run-one",
		WorkspaceID:       "workspace",
		ResourceID:        "project1.task1",
		ForgeSessionID:    "session-one",
		Cwd:               resourceDir,
		SchedulerTurn:     true,
		AutoRunGeneration: 3,
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
	if sessionContext.Version != 2 || sessionContext.AutoRunGeneration != 3 {
		t.Fatalf("expected AutoRun generation in session context, got: %#v", sessionContext)
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
	if !strings.Contains(prompt, "Do not create another Forge session") || !strings.Contains(prompt, "do not lock/unlock the current resource") {
		t.Fatalf("prompt does not include managed session ownership guidance:\n%s", prompt)
	}
	if !strings.Contains(prompt, "AutoRun generation: 3") || !strings.Contains(prompt, "forge task autorun complete") {
		t.Fatalf("prompt does not include AutoRun protocol:\n%s", prompt)
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

func TestSchedulerTurnCompletionObservesSubmittedResult(t *testing.T) {
	workspace := t.TempDir()
	argsPath := filepath.Join(workspace, "args.txt")
	forgePath := filepath.Join(workspace, "forge-fake")
	script := `#!/bin/sh
printf '%s\n' "$*" > "$FORGE_TEST_ARGS"
printf '{"autoRun":{"state":"waiting"}}\n'
`
	if err := os.WriteFile(forgePath, []byte(script), 0o755); err != nil {
		t.Fatal(err)
	}
	t.Setenv("FORGE_TEST_ARGS", argsPath)
	s := &server{forgePath: forgePath}
	m := newAgentManager(s)
	rt := &agentRuntime{
		workspace: guiWorkspace{ID: "workspace", Path: workspace},
		run: agentRun{
			ID:                "run-one",
			WorkspaceID:       "workspace",
			ResourceID:        "project1.task1",
			ForgeSessionID:    "session-one",
			SchedulerTurn:     true,
			AutoRunGeneration: 2,
			Status:            "running",
		},
		nextEventID: 1,
		done:        make(chan struct{}),
		pending:     make(map[string]pendingApproval),
	}
	rt.handleNotification(m, "turn/completed", json.RawMessage(`{"turn":{"status":"completed"}}`))
	rt.mu.Lock()
	status := rt.run.Status
	rt.mu.Unlock()
	if status != "idle" {
		t.Fatalf("expected session to remain idle, got %q", status)
	}
	args := string(mustReadFile(t, argsPath))
	for _, expected := range []string{"task show", "--project project1", "--task task1"} {
		if !strings.Contains(args, expected) {
			t.Fatalf("expected settle args to contain %q, got %q", expected, args)
		}
	}
}

func mustReadFile(t *testing.T, path string) []byte {
	t.Helper()
	data, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	return data
}

func TestEndForgeSessionIgnoresAlreadyPrunedSession(t *testing.T) {
	workspace := t.TempDir()
	forgePath := filepath.Join(workspace, "forge-fake")
	script := `#!/bin/sh
echo "forge: session not found: $4" >&2
exit 1
`
	if err := os.WriteFile(forgePath, []byte(script), 0o755); err != nil {
		t.Fatal(err)
	}
	m := newAgentManager(&server{forgePath: forgePath})
	if err := m.endForgeSession(context.Background(), guiWorkspace{Path: workspace}, "session-pruned"); err != nil {
		t.Fatalf("already-pruned session should be treated as ended: %v", err)
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
