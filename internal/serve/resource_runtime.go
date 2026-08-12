package serve

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/disksing/forge/internal/app"
)

type resolvedResourceAgent struct {
	Binding         app.AgentBinding
	AgentName       string
	ProfileRevision string
	InstanceID      string
}

func runSourceInstanceID(cfg config, run agentRun) string {
	if value := strings.TrimSpace(run.SourceInstanceID); value != "" {
		return value
	}
	return strings.TrimSpace(cfg.AgentHubInstanceID)
}

func sourceLookupKey(instanceID, externalID string) string {
	return strings.TrimSpace(instanceID) + "\x00" + strings.TrimSpace(externalID)
}

func (m *agentManager) resolveResourceAgent(workspace guiWorkspace, resourceID string, cfg config) (resolvedResourceAgent, error) {
	forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		return resolvedResourceAgent{}, err
	}
	runtimeConfig, err := forgeWorkspace.RuntimeConfig()
	if err != nil {
		return resolvedResourceAgent{}, err
	}
	binding, err := forgeWorkspace.ResourceAgentBinding(resourceID)
	if err != nil {
		return resolvedResourceAgent{}, err
	}
	resolved := resolvedResourceAgent{Binding: binding, InstanceID: runtimeConfig.InstanceID}
	switch binding.Kind {
	case "agent":
		resolved.AgentName = binding.Name
	case "profile":
		resolved.AgentName = configuredAgentProfileName(cfg.AgentProfiles, binding.Name)
		if strings.TrimSpace(resolved.AgentName) == "" {
			return resolvedResourceAgent{}, fmt.Errorf("Agent Profile %q has no AgentHub agent", binding.Name)
		}
		digest := sha256.Sum256([]byte(strings.ToLower(binding.Name) + "\x00" + resolved.AgentName))
		resolved.ProfileRevision = hex.EncodeToString(digest[:8])
	default:
		return resolvedResourceAgent{}, fmt.Errorf("unsupported resource agent binding kind %q", binding.Kind)
	}
	return resolved, nil
}

func nextResourceGeneration(workspacePath, resourceID string) (int, error) {
	runs, err := loadAgentRuns(workspacePath)
	if err != nil {
		return 0, err
	}
	next := 1
	for _, run := range runs {
		if agentRunMatchesResource(run, resourceID) && run.Generation >= next {
			next = run.Generation + 1
		}
	}
	return next, nil
}

func currentResourceGeneration(workspacePath, resourceID string) (agentRun, bool, error) {
	runs, err := loadAgentRuns(workspacePath)
	if err != nil {
		return agentRun{}, false, err
	}
	for _, run := range runs {
		if !agentRunMatchesResource(run, resourceID) || strings.TrimSpace(run.GenerationID) == "" {
			continue
		}
		if isLiveAgentStatus(run.Status) && run.Status != "stopping" {
			return run, true, nil
		}
	}
	return agentRun{}, false, nil
}

func newResourceMessage(text, userName string) resourceInboundMessage {
	role, sender := agentHubMessageProvenance(userName)
	return resourceInboundMessage{
		ID: "msg-" + newRunID(), Text: strings.TrimSpace(text), Role: role,
		Sender: sender, AcceptedAt: time.Now().Format(time.RFC3339Nano),
	}
}

func (rt *agentRuntime) enqueueResourceMessage(message resourceInboundMessage) error {
	rt.mu.Lock()
	for _, pending := range rt.run.PendingMessages {
		if pending.ID == message.ID {
			rt.mu.Unlock()
			return nil
		}
	}
	rt.run.PendingMessages = append(rt.run.PendingMessages, message)
	rt.run.UpdatedAt = time.Now().Format(time.RFC3339Nano)
	run := rt.run
	rt.mu.Unlock()
	return saveAgentRun(rt.workspace.Path, run)
}

// deliverPendingResourceMessages retries only messages carrying stable IDs.
// AgentHub's messages.idempotent capability makes an unknown response safe:
// the same durable item stays queued and is retried after polling or restart.
func (rt *agentRuntime) deliverPendingResourceMessages(ctx context.Context, m *agentManager) error {
	rt.turnActionMu.Lock()
	defer rt.turnActionMu.Unlock()
	for {
		rt.mu.Lock()
		if len(rt.run.PendingMessages) == 0 {
			rt.mu.Unlock()
			return nil
		}
		run, client, state := rt.run, rt.agentHub, rt.agentHubState
		message := run.PendingMessages[0]
		rt.mu.Unlock()
		if client == nil || strings.TrimSpace(run.AgentHubSessionID) == "" {
			return errors.New("resource generation is not attached to AgentHub")
		}
		if run.ReplacementPending {
			return nil
		}
		if state == "starting" || state == "stopping" || state == "stopped" || state == "archived" {
			return nil
		}
		steer := state == "busy" || state == "waiting_approval"
		if steer {
			session, err := client.GetSession(ctx, run.AgentHubSessionID)
			if err != nil {
				return err
			}
			if !session.InputCapabilities.Steer {
				return nil
			}
		}
		session, err := client.Message(ctx, run.AgentHubSessionID, agentHubInboundMessage{
			Text: message.Text, Role: message.Role, Sender: message.Sender,
			Steer: steer, MessageID: message.ID,
		})
		if err != nil {
			return err
		}
		rt.mu.Lock()
		if len(rt.run.PendingMessages) > 0 && rt.run.PendingMessages[0].ID == message.ID {
			rt.run.PendingMessages = append([]resourceInboundMessage(nil), rt.run.PendingMessages[1:]...)
		}
		rt.agentHubState = session.State
		rt.run.Status = forgeStatusForAgentHubState(session.State)
		rt.run.AgentHubSessionID = session.ID
		rt.run.UpdatedAt = time.Now().Format(time.RFC3339Nano)
		updated := rt.run
		rt.mu.Unlock()
		if err := saveAgentRun(rt.workspace.Path, updated); err != nil {
			return err
		}
	}
}

// createResourceGeneration creates one durable generation while resourceMu is
// held by the caller. Pending inputs already carry their stable message IDs,
// so a replacement can transfer them without changing retry identity.
func (m *agentManager) createResourceGeneration(ctx context.Context, workspace guiWorkspace, resourceID, title, cwd string, cfg config, client *agentHubClient, resolved resolvedResourceAgent, pending []resourceInboundMessage) (agentRun, error) {
	generation, err := nextResourceGeneration(workspace.Path, resourceID)
	if err != nil {
		return agentRun{}, err
	}
	now := time.Now().Format(time.RFC3339Nano)
	run := agentRun{
		ID:                newRunID(),
		WorkspaceID:       workspace.ID,
		ResourceID:        strings.TrimSpace(resourceID),
		Generation:        generation,
		GenerationID:      "gen-" + newRunID(),
		SourceInstanceID:  resolved.InstanceID,
		BindingKind:       resolved.Binding.Kind,
		BindingName:       resolved.Binding.Name,
		ProfileRevision:   resolved.ProfileRevision,
		AgentHubAgentName: resolved.AgentName,
		Title:             strings.TrimSpace(title),
		Cwd:               cwd,
		Status:            "starting",
		CreatedAt:         now,
		UpdatedAt:         now,
		PendingMessages:   append([]resourceInboundMessage(nil), pending...),
	}
	if run.Title == "" {
		run.Title = resolved.AgentName + " resource generation"
	}
	resourceKey := run.ResourceID
	if resourceKey == "" {
		resourceKey = "workspace"
	}
	run.SourceExternalID = resourceKey + "/" + fmt.Sprint(run.Generation)

	forgeSessionID, err := m.createForgeSession(ctx, workspace, run, cfg)
	if err != nil {
		return agentRun{}, err
	}
	run.ForgeSessionID = forgeSessionID
	rt := newAgentHubRuntime(m, workspace, run, client)
	m.registerRuntime(rt)
	persisted := false
	defer func() {
		if !persisted {
			m.removeRuntime(run.ID)
			_ = m.endForgeSession(context.Background(), workspace, forgeSessionID)
		}
	}()
	if err := saveAgentRun(workspace.Path, run); err != nil {
		return agentRun{}, err
	}
	persisted = true

	source := agentHubSource{
		App: agentHubSourceApp, InstanceID: run.SourceInstanceID, ExternalID: run.SourceExternalID,
		Metadata: map[string]string{
			"workspaceInstanceId": run.SourceInstanceID, "resourceId": resourceKey,
			"generation": fmt.Sprint(run.Generation), "generationId": run.GenerationID,
			"bindingKind": run.BindingKind, "bindingName": run.BindingName,
			"profileRevision": run.ProfileRevision,
		},
	}
	session, err := m.findOrCreateAgentHubSession(ctx, client, source, agentHubCreateSessionRequest{
		Title: run.Title, Cwd: run.Cwd, AgentName: run.AgentHubAgentName,
		Source: &source, IdempotencyKey: run.GenerationID,
	})
	if err != nil {
		rt.setRecoveryError(m, err)
		return rt.snapshotRun(), err
	}
	run.AgentHubSessionID = session.ID
	if strings.TrimSpace(session.AgentName) != "" {
		run.AgentHubAgentName = session.AgentName
	}
	run.CompletionSessionID = session.ID
	run.CompletionCursor = session.LastEventID
	rt.setRun(run)
	if err := m.bindForgeSessionAgentHub(ctx, workspace, forgeSessionID, session.ID); err != nil {
		rt.setRecoveryError(m, err)
		return rt.snapshotRun(), err
	}
	if err := saveAgentRun(workspace.Path, run); err != nil {
		rt.setRecoveryError(m, err)
		return rt.snapshotRun(), err
	}
	rt.applyAgentHubSessionState(m, session)
	if err := rt.deliverPendingResourceMessages(ctx, m); err != nil {
		rt.addForgeNotice(m, "warning", "resource/message", "Message is durable and queued for retry: "+err.Error())
	}
	return rt.snapshotRun(), nil
}

func (m *agentManager) resourceBindingChanged(ctx context.Context, workspace guiWorkspace, resourceID string, binding app.AgentBinding) error {
	_ = binding
	run, found, err := currentResourceGeneration(workspace.Path, resourceID)
	if err != nil || !found {
		return err
	}
	cfg, client, err := m.agentHubRuntimeConfig()
	if err != nil {
		return err
	}
	resolved, err := m.resolveResourceAgent(workspace, resourceID, cfg)
	if err != nil {
		return err
	}
	if strings.EqualFold(run.AgentHubAgentName, resolved.AgentName) &&
		run.BindingKind == resolved.Binding.Kind && run.BindingName == resolved.Binding.Name &&
		run.ProfileRevision == resolved.ProfileRevision {
		return nil
	}
	rt := m.runtimeByID(run.ID)
	if rt == nil {
		rt = newAgentHubRuntime(m, workspace, run, client)
		m.registerRuntime(rt)
	}
	rt.mu.Lock()
	if rt.agentHubState == "busy" || rt.agentHubState == "waiting_approval" || run.Status == "running" || run.Status == "waiting_approval" {
		rt.run.ReplacementPending = true
		updated := rt.run
		rt.mu.Unlock()
		return saveAgentRun(workspace.Path, updated)
	}
	rt.run.ReplacementPending = true
	updated := rt.run
	rt.mu.Unlock()
	if err := saveAgentRun(workspace.Path, updated); err != nil {
		return err
	}
	go m.retireResourceGeneration(context.WithoutCancel(ctx), rt)
	return nil
}

func (m *agentManager) profileRoutesChanged(ctx context.Context, previous, next agentHubGUIConfig) error {
	previousTargets := make(map[string]string, len(previous.AgentProfiles))
	for _, route := range previous.AgentProfiles {
		previousTargets[strings.ToLower(strings.TrimSpace(route.Key))] = strings.TrimSpace(route.AgentName)
	}
	changed := make(map[string]bool)
	for _, route := range next.AgentProfiles {
		before := previousTargets[strings.ToLower(strings.TrimSpace(route.Key))]
		if !strings.EqualFold(strings.TrimSpace(before), strings.TrimSpace(route.AgentName)) {
			changed[strings.ToLower(strings.TrimSpace(route.Key))] = true
		}
	}
	if len(changed) == 0 {
		return nil
	}
	var failures []string
	for _, workspace := range next.Workspaces {
		if !m.server.ownsWorkspace(workspace.Path) {
			continue
		}
		forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
		if err != nil {
			failures = append(failures, fmt.Sprintf("%s: %v", workspace.ID, err))
			continue
		}
		runtimeConfig, err := forgeWorkspace.RuntimeConfig()
		if err != nil {
			failures = append(failures, fmt.Sprintf("%s: %v", workspace.ID, err))
			continue
		}
		bindings := []struct {
			id      string
			binding app.AgentBinding
		}{{id: "workspace", binding: runtimeConfig.AgentBinding}}
		tree, err := forgeWorkspace.Tree()
		if err != nil {
			failures = append(failures, fmt.Sprintf("%s: %v", workspace.ID, err))
			continue
		}
		for _, project := range tree.Projects {
			bindings = append(bindings, struct {
				id      string
				binding app.AgentBinding
			}{id: project.ID, binding: project.AgentBinding})
			for _, task := range project.Children {
				bindings = append(bindings, struct {
					id      string
					binding app.AgentBinding
				}{id: task.ID, binding: task.AgentBinding})
			}
		}
		for _, item := range bindings {
			if item.binding.Kind != "profile" || !changed[strings.ToLower(strings.TrimSpace(item.binding.Name))] {
				continue
			}
			if err := m.resourceBindingChanged(ctx, workspace, item.id, item.binding); err != nil {
				failures = append(failures, fmt.Sprintf("%s/%s: %v", workspace.ID, item.id, err))
			}
		}
	}
	if len(failures) > 0 {
		return fmt.Errorf("replace resource agent generations: %s", strings.Join(failures, "; "))
	}
	return nil
}

func (m *agentManager) retireResourceGeneration(ctx context.Context, rt *agentRuntime) {
	m.resourceMu.Lock()
	defer m.resourceMu.Unlock()
	rt.turnActionMu.Lock()
	defer rt.turnActionMu.Unlock()
	rt.mu.Lock()
	run, client := rt.run, rt.agentHub
	rt.mu.Unlock()
	if run.Status == "stopped" || run.AgentHubStoppedObserved {
		return
	}
	if client == nil || strings.TrimSpace(run.AgentHubSessionID) == "" {
		return
	}
	session, err := client.Stop(ctx, run.AgentHubSessionID)
	if err != nil {
		rt.setRecoveryError(m, fmt.Errorf("retire resource generation: %w", err))
		return
	}
	deadline := time.Now().Add(30 * time.Second)
	for session.State != "stopped" && time.Now().Before(deadline) {
		timer := time.NewTimer(200 * time.Millisecond)
		select {
		case <-ctx.Done():
			timer.Stop()
			return
		case <-timer.C:
		}
		session, err = client.GetSession(ctx, run.AgentHubSessionID)
		if err != nil {
			return
		}
	}
	if session.State != "stopped" {
		return
	}
	if _, err := client.Archive(ctx, run.AgentHubSessionID); err != nil {
		return
	}
	rt.mu.Lock()
	rt.run.Status = "stopped"
	rt.run.AgentHubStoppedObserved = true
	rt.run.UpdatedAt = time.Now().Format(time.RFC3339Nano)
	updated := rt.run
	rt.mu.Unlock()
	_ = saveAgentRun(rt.workspace.Path, updated)
	if len(updated.PendingMessages) == 0 {
		return
	}
	cfg, replacementClient, err := m.agentHubRuntimeConfig()
	if err != nil {
		rt.addForgeNotice(m, "warning", "resource/replacement", "Queued replacement could not read AgentHub config: "+err.Error())
		return
	}
	resolved, err := m.resolveResourceAgent(rt.workspace, updated.ResourceID, cfg)
	if err == nil {
		resolved.AgentName, err = validateAgentHubRunAgent(ctx, replacementClient, resolved.AgentName)
	}
	if err != nil {
		rt.addForgeNotice(m, "warning", "resource/replacement", "Queued replacement could not resolve its Agent: "+err.Error())
		return
	}
	replacement, err := m.createResourceGeneration(ctx, rt.workspace, updated.ResourceID, updated.Title, updated.Cwd, cfg, replacementClient, resolved, updated.PendingMessages)
	if err != nil {
		rt.addForgeNotice(m, "warning", "resource/replacement", "Queued replacement generation failed: "+err.Error())
		return
	}
	rt.mu.Lock()
	rt.run.PendingMessages = nil
	updated = rt.run
	rt.mu.Unlock()
	_ = saveAgentRun(rt.workspace.Path, updated)
	rt.addForgeNotice(m, "info", "resource/replacement", "Started replacement resource generation "+replacement.GenerationID)
}
