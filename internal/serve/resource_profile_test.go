package serve

import (
	"context"
	"encoding/json"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/disksing/forge/internal/app"
)

func TestResolveResourceAgentPreservesMissingBindingAndUsesTypedFallback(t *testing.T) {
	manager, workspace, _ := newRuntimeTestManager(t, "http://127.0.0.1:1")
	forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := forgeWorkspace.SetResourceAgentBinding("project1.task1", app.AgentBinding{Kind: "profile", Name: "deleted"}); err != nil {
		t.Fatal(err)
	}
	cfg := config{
		AgentProfiles:    []agentProfileRoute{{Key: "default", AgentName: "global-agent"}, {Key: "task-fast", AgentName: "task-agent"}},
		ResourceDefaults: resourceAgentDefaults{Workspace: "default", Project: "default", Task: "task-fast"},
	}
	resolved, err := manager.resolveResourceAgent(workspace, "project1.task1", cfg)
	if err != nil {
		t.Fatal(err)
	}
	if resolved.Binding.Name != "deleted" || resolved.ResolvedProfile != "task-fast" || resolved.AgentName != "task-agent" || !strings.Contains(resolved.ConfigError, "deleted") {
		t.Fatalf("typed fallback resolution = %#v", resolved)
	}
	binding, err := forgeWorkspace.ResourceAgentBinding("project1.task1")
	if err != nil || binding.Name != "deleted" {
		t.Fatalf("fallback rewrote explicit binding: %#v, %v", binding, err)
	}
}

func TestRestoredProfileWithSameAgentClearsErrorWithoutReplacement(t *testing.T) {
	manager, workspace, configPath := newRuntimeTestManager(t, "http://127.0.0.1:1")
	forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		t.Fatal(err)
	}
	binding := app.AgentBinding{Kind: "profile", Name: "restored"}
	if _, err := forgeWorkspace.SetResourceAgentBinding("project1.task1", binding); err != nil {
		t.Fatal(err)
	}
	now := time.Now().Format(time.RFC3339Nano)
	run := agentRun{
		ID: "run-restored-profile", WorkspaceID: workspace.ID, ResourceID: "project1.task1", Generation: 1, GenerationID: "gen-restored-profile",
		BindingKind: "profile", BindingName: "restored", ResolvedProfile: "default", AgentConfigError: "missing", AgentHubAgentName: "fake-agent",
		Status: "idle", CreatedAt: now, UpdatedAt: now,
	}
	if err := saveAgentRun(workspace.Path, run); err != nil {
		t.Fatal(err)
	}
	manager.registerRuntime(newAgentHubRuntime(manager, workspace, run, nil))
	data, err := json.Marshal(agentHubGUIConfig{
		Version: agentHubConfigVersion, Workspaces: []guiWorkspace{workspace}, AgentHubEndpoint: "http://127.0.0.1:1", AgentHubInstanceID: "forge-runtime-test",
		AgentProfiles:    []agentHubProfileRoute{{Key: "default", AgentName: "fake-agent"}, {Key: "restored", AgentName: "fake-agent"}},
		ResourceDefaults: defaultResourceAgentDefaults(),
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
	updated := manager.runtimeByID(run.ID).snapshotRun()
	if updated.ReplacementPending || updated.AgentConfigError != "" || updated.ResolvedProfile != "restored" || updated.AgentHubAgentName != "fake-agent" {
		t.Fatalf("same-Agent restoration replaced generation or retained error: %#v", updated)
	}
}

func TestResolveResourceAgentFallsBackGloballyThenFailsActionably(t *testing.T) {
	manager, workspace, _ := newRuntimeTestManager(t, "http://127.0.0.1:1")
	forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := forgeWorkspace.SetResourceAgentBinding("project1", app.AgentBinding{Kind: "profile", Name: "deleted"}); err != nil {
		t.Fatal(err)
	}
	cfg := config{AgentProfiles: []agentProfileRoute{{Key: "default", AgentName: "global-agent"}}, ResourceDefaults: resourceAgentDefaults{Project: "missing-default"}}
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
