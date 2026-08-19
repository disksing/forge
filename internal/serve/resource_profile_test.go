package serve

import (
	"context"
	"encoding/json"
	"net/http/httptest"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/disksing/pua/internal/app"
)

func setRuntimeTestProfiles(t *testing.T, configPath string, profiles []agentHubProfileRoute) {
	t.Helper()
	cfg, err := readAgentHubConfigFile(configPath)
	if err != nil {
		t.Fatal(err)
	}
	cfg.AgentProfiles = profiles
	if err := writeAgentHubConfigFile(configPath, cfg); err != nil {
		t.Fatal(err)
	}
}

func TestResolveResourceAgentPreservesMissingBindingAndUsesTypedFallback(t *testing.T) {
	manager, workspace, _ := newRuntimeTestManager(t, "http://127.0.0.1:1")
	puaWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := puaWorkspace.SetResourceAgentBinding("project1.task1", app.AgentBinding{Kind: "profile", Name: "deleted"}); err != nil {
		t.Fatal(err)
	}
	if _, err := puaWorkspace.SetResourceAgentDefaults(app.ResourceAgentDefaults{
		Project: app.AgentBinding{Kind: "profile", Name: "default"},
		Task:    app.AgentBinding{Kind: "profile", Name: "task-fast"},
	}); err != nil {
		t.Fatal(err)
	}
	cfg := config{
		AgentProfiles: []agentProfileRoute{{Key: "default", AgentName: "global-agent"}, {Key: "task-fast", AgentName: "task-agent"}},
	}
	resolved, err := manager.resolveResourceAgent(workspace, "project1.task1", cfg)
	if err != nil {
		t.Fatal(err)
	}
	if resolved.Binding.Name != "deleted" || resolved.ResolvedProfile != "task-fast" || resolved.AgentName != "task-agent" || !strings.Contains(resolved.ConfigError, "deleted") {
		t.Fatalf("typed fallback resolution = %#v", resolved)
	}
	binding, err := puaWorkspace.ResourceAgentBinding("project1.task1")
	if err != nil || binding.Name != "deleted" {
		t.Fatalf("fallback rewrote explicit binding: %#v, %v", binding, err)
	}
}

func TestRestoredProfileWithSameAgentClearsErrorWithoutReplacement(t *testing.T) {
	manager, workspace, configPath := newRuntimeTestManager(t, "http://127.0.0.1:1")
	puaWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		t.Fatal(err)
	}
	binding := app.AgentBinding{Kind: "profile", Name: "restored"}
	if _, err := puaWorkspace.SetResourceAgentBinding("project1.task1", binding); err != nil {
		t.Fatal(err)
	}
	now := time.Now().Format(time.RFC3339Nano)
	record := generationRecord{
		ID: "gen-restored-profile", WorkspaceID: workspace.ID, ResourceID: "project1.task1", Generation: 1, GenerationID: "gen-restored-profile",
		BindingKind: "profile", BindingName: "restored", ResolvedProfile: "default", AgentConfigError: "missing", AgentHubAgentName: "fake-agent",
		Status: "idle", CreatedAt: now, UpdatedAt: now,
	}
	if err := saveGenerationRecord(workspace.Path, record); err != nil {
		t.Fatal(err)
	}
	manager.registerRuntime(newAgentHubRuntime(manager, workspace, record, nil))
	data, err := json.Marshal(agentHubServeConfig{
		Version: agentHubConfigVersion, Workspaces: []serveWorkspace{workspace}, AgentHubEndpoint: "http://127.0.0.1:1", AgentHubInstanceID: "pua-runtime-test",
		AgentProfiles: []agentHubProfileRoute{{Key: "default", AgentName: "fake-agent"}, {Key: "restored", AgentName: "fake-agent"}},
	})
	if err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(configPath, data, 0o600); err != nil {
		t.Fatal(err)
	}
	if err := manager.resourceBindingChanged(context.Background(), workspace, "project1.task1", binding); err != nil {
		t.Fatal(err)
	}
	updated := manager.runtimeByID(record.ID).snapshotGeneration()
	if updated.ReplacementPending || updated.AgentConfigError != "" || updated.ResolvedProfile != "restored" || updated.AgentHubAgentName != "fake-agent" {
		t.Fatalf("same-Agent restoration replaced generation or retained error: %#v", updated)
	}
}

func TestResolveResourceAgentFallsBackGloballyThenFailsActionably(t *testing.T) {
	manager, workspace, _ := newRuntimeTestManager(t, "http://127.0.0.1:1")
	puaWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := puaWorkspace.SetResourceAgentBinding("project1", app.AgentBinding{Kind: "profile", Name: "deleted"}); err != nil {
		t.Fatal(err)
	}
	if _, err := puaWorkspace.SetResourceAgentDefaults(app.ResourceAgentDefaults{
		Project: app.AgentBinding{Kind: "profile", Name: "missing-default"},
		Task:    app.AgentBinding{Kind: "profile", Name: "default"},
	}); err != nil {
		t.Fatal(err)
	}
	cfg := config{AgentProfiles: []agentProfileRoute{{Key: "default", AgentName: "global-agent"}}}
	resolved, err := manager.resolveResourceAgent(workspace, "project1", cfg)
	if err != nil || resolved.ResolvedProfile != "default" || resolved.AgentName != "global-agent" {
		t.Fatalf("global fallback = %#v, %v", resolved, err)
	}
	cfg.AgentProfiles = nil
	resolved, err = manager.resolveResourceAgent(workspace, "project1", cfg)
	if err == nil || !strings.Contains(err.Error(), "configure one of these Profiles") || !strings.Contains(resolved.ConfigError, "missing-default") {
		t.Fatalf("unresolved global default = %#v, %v", resolved, err)
	}
}

func TestResolveResourceAgentFallsBackToAgentDefault(t *testing.T) {
	manager, workspace, _ := newRuntimeTestManager(t, "http://127.0.0.1:1")
	puaWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := puaWorkspace.SetResourceAgentBinding("project1.task1", app.AgentBinding{Kind: "profile", Name: "deleted"}); err != nil {
		t.Fatal(err)
	}
	if _, err := puaWorkspace.SetResourceAgentDefaults(app.ResourceAgentDefaults{
		Project: app.AgentBinding{Kind: "profile", Name: "default"},
		Task:    app.AgentBinding{Kind: "agent", Name: "task-agent"},
	}); err != nil {
		t.Fatal(err)
	}
	cfg := config{
		AgentProfiles: []agentProfileRoute{{Key: "default", AgentName: "global-agent"}},
	}
	resolved, err := manager.resolveResourceAgent(workspace, "project1.task1", cfg)
	if err != nil {
		t.Fatal(err)
	}
	if resolved.AgentName != "task-agent" || resolved.ResolvedProfile != "" || !strings.Contains(resolved.ConfigError, "fallback Agent") {
		t.Fatalf("agent default fallback resolution = %#v", resolved)
	}
}

func TestProfileRouteChangeIsLazyUntilNextTurnAndSurvivesRestart(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	fake.extraAgents = []string{"replacement-agent"}
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, configPath := newRuntimeTestManager(t, hub.URL)

	started, original := startRuntimeTestGeneration(t, manager, workspace, `{"resourceId":"project1.task1","prompt":"first"}`)
	if started.Code != 200 || original.GenerationID == "" {
		t.Fatalf("initial Turn failed: code=%d body=%s generation=%#v", started.Code, started.Body.String(), original)
	}
	fake.mu.Lock()
	session := fake.sessions[original.AgentHubSessionID]
	session.State = "ready"
	session.CurrentTurnID = ""
	fake.sessions[session.ID] = session
	fake.mu.Unlock()
	setRuntimeTestProfiles(t, configPath, []agentHubProfileRoute{{Key: "default", AgentName: "replacement-agent"}})

	// Polling after the configuration write must not traverse bindings or mark
	// an otherwise idle generation for replacement.
	if err := manager.pollAgentHubSessions(context.Background()); err != nil {
		t.Fatal(err)
	}
	current, found, err := currentResourceGeneration(workspace.Path, original.ResourceID)
	if err != nil || !found || current.GenerationID != original.GenerationID || current.ReplacementPending {
		t.Fatalf("Profile write eagerly replaced generation: found=%v err=%v generation=%#v", found, err, current)
	}

	// Model a daemon restart before the next input. The durable generation still
	// carries the old route, so the new manager must resolve the latest Profile
	// at the mailbox Turn boundary.
	restarted := newAgentManager(manager.server)
	manager.server.agents = restarted
	message, err := restarted.acceptResourceMessage(context.Background(), workspace, original.ResourceID, resourceMessageRequest{
		Text: "after restart", Mode: resourceMessageModeEnqueue,
	})
	if err != nil {
		t.Fatal(err)
	}
	waitForRuntimeTest(t, func() bool {
		current, currentFound, loadErr := currentResourceGeneration(workspace.Path, original.ResourceID)
		updated, messageFound, messageErr := mailboxMessageByID(workspace.Path, message.ID)
		return loadErr == nil && currentFound && current.Generation > original.Generation &&
			current.AgentHubAgentName == "replacement-agent" && messageErr == nil && messageFound &&
			updated.Status == resourceMessageDelivered && updated.GenerationID == current.GenerationID
	})
}

func TestProfileBindingWithSameAgentKeepsGenerationAtNextTurn(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, configPath := newRuntimeTestManager(t, hub.URL)
	started, original := startRuntimeTestGeneration(t, manager, workspace, `{"resourceId":"project1.task1","prompt":"first"}`)
	if started.Code != 200 || original.GenerationID == "" {
		t.Fatalf("initial Turn failed: code=%d body=%s generation=%#v", started.Code, started.Body.String(), original)
	}
	fake.mu.Lock()
	session := fake.sessions[original.AgentHubSessionID]
	session.State = "ready"
	session.CurrentTurnID = ""
	fake.sessions[session.ID] = session
	fake.mu.Unlock()
	setRuntimeTestProfiles(t, configPath, []agentHubProfileRoute{
		{Key: "default", AgentName: "fake-agent"},
		{Key: "same-agent", AgentName: "fake-agent"},
	})
	puaWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := puaWorkspace.SetResourceAgentBinding(original.ResourceID, app.AgentBinding{Kind: "profile", Name: "same-agent"}); err != nil {
		t.Fatal(err)
	}

	message, err := manager.acceptResourceMessage(context.Background(), workspace, original.ResourceID, resourceMessageRequest{
		Text: "same Agent", Mode: resourceMessageModeEnqueue,
	})
	if err != nil {
		t.Fatal(err)
	}
	current, found, err := currentResourceGeneration(workspace.Path, original.ResourceID)
	updated, messageFound, messageErr := mailboxMessageByID(workspace.Path, message.ID)
	if err != nil || !found || current.GenerationID != original.GenerationID || current.ReplacementPending ||
		current.BindingName != "same-agent" || messageErr != nil || !messageFound || updated.Status != resourceMessageDelivered {
		t.Fatalf("same-Agent Profile change replaced or blocked generation: generation=%#v message=%#v errors=%v/%v", current, updated, err, messageErr)
	}
}

func TestProfileRouteChangeKeepsActiveSteerAndReplacesQueuedTurn(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	fake.extraAgents = []string{"replacement-agent"}
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, configPath := newRuntimeTestManager(t, hub.URL)
	started, original := startRuntimeTestGeneration(t, manager, workspace, `{"resourceId":"project1.task1","prompt":"first"}`)
	if started.Code != 200 || original.GenerationID == "" {
		t.Fatalf("initial Turn failed: code=%d body=%s generation=%#v", started.Code, started.Body.String(), original)
	}
	setRuntimeTestProfiles(t, configPath, []agentHubProfileRoute{{Key: "default", AgentName: "replacement-agent"}})
	fake.mu.Lock()
	session := fake.sessions[original.AgentHubSessionID]
	session.InputCapabilities.Steer = true
	fake.sessions[session.ID] = session
	fake.mu.Unlock()

	steer, err := manager.acceptResourceMessage(context.Background(), workspace, original.ResourceID, resourceMessageRequest{
		Text: "steer current Turn", Mode: resourceMessageModeSteer,
	})
	if err != nil {
		t.Fatal(err)
	}
	current, found, err := currentResourceGeneration(workspace.Path, original.ResourceID)
	steered, steerFound, steerErr := mailboxMessageByID(workspace.Path, steer.ID)
	if err != nil || !found || current.GenerationID != original.GenerationID || current.ReplacementPending ||
		steerErr != nil || !steerFound || steered.Status != resourceMessageDelivered || steered.ActualMode != resourceMessageModeSteer {
		t.Fatalf("active steer crossed Profile boundary: generation=%#v message=%#v errors=%v/%v", current, steered, err, steerErr)
	}

	queued, err := manager.acceptResourceMessage(context.Background(), workspace, original.ResourceID, resourceMessageRequest{
		Text: "next Turn", Mode: resourceMessageModeEnqueue,
	})
	if err != nil {
		t.Fatal(err)
	}
	current, _, _ = currentResourceGeneration(workspace.Path, original.ResourceID)
	queuedBefore, _, _ := mailboxMessageByID(workspace.Path, queued.ID)
	if current.ReplacementPending || queuedBefore.Status != resourceMessageQueued {
		t.Fatalf("queued input triggered replacement before the active Turn ended: generation=%#v message=%#v", current, queuedBefore)
	}
	fake.mu.Lock()
	session = fake.sessions[original.AgentHubSessionID]
	session.State = "ready"
	session.CurrentTurnID = ""
	fake.sessions[session.ID] = session
	fake.mu.Unlock()
	if err := manager.withResourceController(context.Background(), workspace, original.ResourceID, func() error {
		return manager.reconcileResourceMailboxLocked(context.Background(), workspace, original.ResourceID)
	}); err != nil {
		t.Fatal(err)
	}
	waitForRuntimeTest(t, func() bool {
		current, currentFound, loadErr := currentResourceGeneration(workspace.Path, original.ResourceID)
		updated, messageFound, messageErr := mailboxMessageByID(workspace.Path, queued.ID)
		return loadErr == nil && currentFound && current.Generation > original.Generation &&
			current.AgentHubAgentName == "replacement-agent" && messageErr == nil && messageFound &&
			updated.Status == resourceMessageDelivered && updated.GenerationID == current.GenerationID
	})
}

func TestProfileRouteChangeRebindsInterruptReplacementTurn(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	fake.extraAgents = []string{"replacement-agent"}
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, configPath := newRuntimeTestManager(t, hub.URL)
	started, original := startRuntimeTestGeneration(t, manager, workspace, `{"resourceId":"project1.task1","prompt":"first"}`)
	if started.Code != 200 || original.GenerationID == "" {
		t.Fatalf("initial Turn failed: code=%d body=%s generation=%#v", started.Code, started.Body.String(), original)
	}
	setRuntimeTestProfiles(t, configPath, []agentHubProfileRoute{{Key: "default", AgentName: "replacement-agent"}})
	message, err := manager.acceptResourceMessage(context.Background(), workspace, original.ResourceID, resourceMessageRequest{
		Text: "interrupt into replacement", Mode: resourceMessageModeInterrupt,
	})
	if err != nil {
		t.Fatal(err)
	}
	waitForRuntimeTest(t, func() bool {
		current, currentFound, loadErr := currentResourceGeneration(workspace.Path, original.ResourceID)
		updated, messageFound, messageErr := mailboxMessageByID(workspace.Path, message.ID)
		return loadErr == nil && currentFound && current.Generation > original.Generation &&
			current.AgentHubAgentName == "replacement-agent" && messageErr == nil && messageFound &&
			updated.Status == resourceMessageDelivered && updated.GenerationID == current.GenerationID
	})
	fake.mu.Lock()
	actions := append([]string(nil), fake.actions...)
	fake.mu.Unlock()
	if len(actions) == 0 || actions[0] != "interrupt" {
		t.Fatalf("interrupt did not terminate the old Turn before replacement: %#v", actions)
	}
}
