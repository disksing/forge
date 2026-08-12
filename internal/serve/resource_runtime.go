package serve

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"reflect"
	"strings"
	"time"

	"github.com/disksing/forge/internal/app"
)

type resolvedResourceAgent struct {
	Binding         app.AgentBinding
	AgentName       string
	ProfileRevision string
	ResolvedProfile string
	ConfigError     string
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

func resourceAcceptsMessages(workspacePath, resourceID string) error {
	resourceID = strings.TrimSpace(resourceID)
	if resourceID == "" || resourceID == "workspace" {
		return nil
	}
	forgeWorkspace, err := app.OpenWorkspace(workspacePath)
	if err != nil {
		return err
	}
	value, err := forgeWorkspace.ResourceValue(resourceID)
	if err != nil {
		return err
	}
	if value.Archived {
		return fmt.Errorf("resource %s is archived and no longer accepts messages", resourceID)
	}
	return nil
}

func (m *agentManager) resourceHasActiveTurn(ctx context.Context, workspace guiWorkspace, resourceID string) (bool, error) {
	runs, err := loadAgentRuns(workspace.Path)
	if err != nil {
		return false, err
	}
	_, client, configErr := m.agentHubRuntimeConfig()
	for _, run := range runs {
		if !agentRunMatchesResource(run, resourceID) {
			continue
		}
		if run.Status == "running" || run.Status == "waiting_approval" {
			return true, nil
		}
		if !isAgentHubRun(run) || strings.TrimSpace(run.AgentHubSessionID) == "" {
			continue
		}
		if configErr != nil {
			return false, fmt.Errorf("verify resource Turn state: %w", configErr)
		}
		session, fetchErr := client.GetSession(ctx, run.AgentHubSessionID)
		if fetchErr != nil {
			return false, fmt.Errorf("verify resource generation %s Turn state: %w", run.GenerationID, fetchErr)
		}
		if session.State == "running" || session.State == "waiting_approval" {
			return true, nil
		}
	}
	return false, nil
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
		requested := strings.ToLower(strings.TrimSpace(binding.Name))
		resolved.ResolvedProfile = requested
		resolved.AgentName = configuredAgentProfileName(cfg.AgentProfiles, requested)
		if strings.TrimSpace(resolved.AgentName) == "" {
			kind, kindErr := resourceAgentKind(forgeWorkspace, resourceID)
			if kindErr != nil {
				return resolvedResourceAgent{}, kindErr
			}
			fallback := resourceDefaultProfile(cfg.ResourceDefaults, kind)
			fallbackAgent := configuredAgentProfileName(cfg.AgentProfiles, fallback)
			if fallbackAgent != "" {
				resolved.ResolvedProfile, resolved.AgentName = fallback, fallbackAgent
			} else if global := configuredAgentProfileName(cfg.AgentProfiles, "default"); global != "" {
				resolved.ResolvedProfile, resolved.AgentName = "default", global
			} else {
				return resolvedAgentError(resolved, requested, fallback)
			}
			resolved.ConfigError = fmt.Sprintf("Agent Profile %q cannot be resolved; using fallback Profile %q", requested, resolved.ResolvedProfile)
		}
		digest := sha256.Sum256([]byte(requested + "\x00" + resolved.ResolvedProfile + "\x00" + resolved.AgentName + "\x00" + resolved.ConfigError))
		resolved.ProfileRevision = hex.EncodeToString(digest[:8])
	default:
		return resolvedResourceAgent{}, fmt.Errorf("unsupported resource agent binding kind %q", binding.Kind)
	}
	return resolved, nil
}

func resourceAgentKind(workspace *app.Workspace, resourceID string) (string, error) {
	if strings.TrimSpace(resourceID) == "" || strings.TrimSpace(resourceID) == "workspace" {
		return "workspace", nil
	}
	value, err := workspace.ResourceValue(resourceID)
	if err != nil {
		return "", err
	}
	if value.Task != nil {
		return "task", nil
	}
	return "project", nil
}

func resourceDefaultProfile(defaults resourceAgentDefaults, kind string) string {
	defaults = normalizeResourceAgentDefaults(defaults)
	switch kind {
	case "workspace":
		return defaults.Workspace
	case "task":
		return defaults.Task
	default:
		return defaults.Project
	}
}

func resolvedAgentError(resolved resolvedResourceAgent, requested, fallback string) (resolvedResourceAgent, error) {
	resolved.ConfigError = fmt.Sprintf("Agent Profile %q cannot be resolved; type default %q and global Profile \"default\" are unavailable", requested, fallback)
	return resolved, errors.New(resolved.ConfigError + "; configure one of these Profiles before starting a new generation")
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
	_, err := rt.mutateRun(func(run *agentRun) {
		for _, pending := range run.PendingMessages {
			if pending.ID == message.ID {
				return
			}
		}
		run.PendingMessages = append(run.PendingMessages, message)
		run.UpdatedAt = time.Now().Format(time.RFC3339Nano)
	})
	return err
}

// deliverPendingResourceMessages retries only messages carrying stable IDs.
// AgentHub's at-least-once capability makes an unknown response safe: Forge
// retains the same stable ID until AgentHub durably accepts retry ownership.
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
		steer := false
		if message.Steer != nil {
			steer = *message.Steer
		} else {
			steer = state == "running" || state == "waiting_approval"
			if steer {
				session, err := client.GetSession(ctx, run.AgentHubSessionID)
				if err != nil {
					return err
				}
				if !session.InputCapabilities.Steer {
					return nil
				}
			}
			// Freeze the routing decision before the request. AgentHub includes
			// steer in the canonical input identified by MessageID, so a retry
			// after an unknown response must reuse the original value even when
			// the accepted message has since changed the Session to running.
			updated, err := rt.mutateRun(func(run *agentRun) {
				if len(run.PendingMessages) == 0 || run.PendingMessages[0].ID != message.ID || run.PendingMessages[0].Steer != nil {
					return
				}
				selected := steer
				run.PendingMessages[0].Steer = &selected
				run.UpdatedAt = time.Now().Format(time.RFC3339Nano)
			})
			if err != nil {
				return fmt.Errorf("persist queued message delivery mode: %w", err)
			}
			if len(updated.PendingMessages) == 0 || updated.PendingMessages[0].ID != message.ID || updated.PendingMessages[0].Steer == nil {
				return errors.New("queued message changed while selecting its delivery mode")
			}
			message = updated.PendingMessages[0]
			steer = *message.Steer
		}
		session, err := client.Message(ctx, run.AgentHubSessionID, agentHubInboundMessage{
			Text: message.Text, Role: message.Role, Sender: message.Sender,
			Steer: steer, MessageID: message.ID,
		})
		if err != nil {
			repaired, repairErr := rt.repairLegacyQueuedMessageSteer(ctx, client, run.AgentHubSessionID, message, err)
			if repairErr != nil {
				return repairErr
			}
			if repaired {
				continue
			}
			return err
		}
		updated, err := rt.mutateRun(func(run *agentRun) {
			if len(run.PendingMessages) > 0 && run.PendingMessages[0].ID == message.ID {
				run.PendingMessages = append([]resourceInboundMessage(nil), run.PendingMessages[1:]...)
			}
			run.Status = forgeStatusForAgentHubState(session.State)
			run.AgentHubSessionID = session.ID
			run.UpdatedAt = time.Now().Format(time.RFC3339Nano)
		})
		if err != nil {
			return err
		}
		rt.mu.Lock()
		rt.agentHubState = session.State
		rt.run = updated
		rt.mu.Unlock()
	}
}

// repairLegacyQueuedMessageSteer migrates pending messages written before
// Forge persisted their first-delivery routing decision. Those records can
// already have a canonical AgentHub input with steer=false while a restart
// observes the resulting running Session and retries with steer=true. On the
// exact idempotency-conflict response, recover the original value from the
// durable event log only when every other canonical field still matches.
func (rt *agentRuntime) repairLegacyQueuedMessageSteer(ctx context.Context, client *agentHubClient, sessionID string, message resourceInboundMessage, deliveryErr error) (bool, error) {
	var apiErr *agentHubAPIError
	if !errors.As(deliveryErr, &apiErr) || apiErr.StatusCode != 409 ||
		apiErr.Code != "runtime_operation_failed" || !strings.Contains(apiErr.Message, "message id conflicts with an existing input") {
		return false, nil
	}
	cursor := int64(0)
	for {
		events, latest, err := client.SessionEvents(ctx, sessionID, cursor, agentHubEventMaxCount)
		if err != nil {
			return false, fmt.Errorf("recover canonical queued message after id conflict: %w", err)
		}
		for _, event := range events {
			if event.Type != "message.input" {
				continue
			}
			var canonical agentHubInboundMessage
			if json.Unmarshal(event.Data, &canonical) != nil || canonical.MessageID != message.ID {
				continue
			}
			if canonical.Role == "" {
				canonical.Role = "user"
			}
			if canonical.Text != message.Text || canonical.Role != message.Role || !reflect.DeepEqual(canonical.Sender, message.Sender) {
				return false, nil
			}
			if message.Steer != nil && *message.Steer == canonical.Steer {
				return false, nil
			}
			updated, err := rt.mutateRun(func(run *agentRun) {
				if len(run.PendingMessages) == 0 || run.PendingMessages[0].ID != message.ID {
					return
				}
				steer := canonical.Steer
				run.PendingMessages[0].Steer = &steer
				run.UpdatedAt = time.Now().Format(time.RFC3339Nano)
			})
			if err != nil {
				return false, fmt.Errorf("persist recovered queued message delivery mode: %w", err)
			}
			return len(updated.PendingMessages) > 0 && updated.PendingMessages[0].ID == message.ID &&
				updated.PendingMessages[0].Steer != nil && *updated.PendingMessages[0].Steer == canonical.Steer, nil
		}
		if len(events) == 0 || events[len(events)-1].ID <= cursor || events[len(events)-1].ID >= latest {
			return false, nil
		}
		cursor = events[len(events)-1].ID
	}
}

// createResourceGeneration creates one durable generation while resourceMu is
// held by the caller. Pending inputs already carry their stable message IDs,
// so a replacement can transfer them without changing retry identity.
func (m *agentManager) createResourceGeneration(ctx context.Context, workspace guiWorkspace, resourceID, title, cwd string, cfg config, client *agentHubClient, resolved resolvedResourceAgent, pending []resourceInboundMessage, deliverPending bool) (agentRun, error) {
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
		ResolvedProfile:   resolved.ResolvedProfile,
		AgentConfigError:  resolved.ConfigError,
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
	m.registerRuntime(rt)

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
	run, err = rt.mutateRun(func(run *agentRun) {
		run.AgentHubSessionID = session.ID
		if strings.TrimSpace(session.AgentName) != "" {
			run.AgentHubAgentName = session.AgentName
		}
		run.CompletionSessionID = session.ID
		run.CompletionCursor = session.LastEventID
	})
	if err != nil {
		rt.setRecoveryError(m, err)
		return rt.snapshotRun(), err
	}
	if err := m.bindForgeSessionAgentHub(ctx, workspace, forgeSessionID, session.ID); err != nil {
		rt.setRecoveryError(m, err)
		return rt.snapshotRun(), err
	}
	rt.applyAgentHubSessionState(m, session)
	if deliverPending {
		if err := rt.deliverPendingResourceMessages(ctx, m); err != nil {
			rt.addForgeNotice(m, "warning", "resource/message", "Message is durable and queued for retry: "+err.Error())
		}
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
		rt := m.runtimeByID(run.ID)
		if rt == nil {
			rt = newAgentHubRuntime(m, workspace, run, client)
			m.registerRuntime(rt)
		}
		_, persistErr := rt.mutateRun(func(run *agentRun) {
			run.AgentConfigError = resolved.ConfigError
			run.ResolvedProfile = ""
			run.UpdatedAt = time.Now().Format(time.RFC3339Nano)
		})
		return persistErr
	}
	rt := m.runtimeByID(run.ID)
	if rt == nil {
		rt = newAgentHubRuntime(m, workspace, run, client)
		m.registerRuntime(rt)
	}
	if strings.EqualFold(run.AgentHubAgentName, resolved.AgentName) {
		if run.BindingKind == resolved.Binding.Kind && run.BindingName == resolved.Binding.Name &&
			run.ProfileRevision == resolved.ProfileRevision && run.ResolvedProfile == resolved.ResolvedProfile &&
			run.AgentConfigError == resolved.ConfigError {
			return nil
		}
		_, err := rt.mutateRun(func(run *agentRun) {
			run.BindingKind = resolved.Binding.Kind
			run.BindingName = resolved.Binding.Name
			run.ProfileRevision = resolved.ProfileRevision
			run.ResolvedProfile = resolved.ResolvedProfile
			run.AgentConfigError = resolved.ConfigError
			run.UpdatedAt = time.Now().Format(time.RFC3339Nano)
		})
		return err
	}
	rt.mu.Lock()
	if rt.agentHubState == "running" || rt.agentHubState == "waiting_approval" || run.Status == "running" || run.Status == "waiting_approval" {
		rt.mu.Unlock()
		_, err := rt.mutateRun(func(run *agentRun) {
			run.ReplacementPending = true
			run.ResolvedProfile = resolved.ResolvedProfile
			run.AgentConfigError = resolved.ConfigError
		})
		return err
	}
	rt.mu.Unlock()
	if _, err := rt.mutateRun(func(run *agentRun) {
		run.ReplacementPending = true
		run.ResolvedProfile = resolved.ResolvedProfile
		run.AgentConfigError = resolved.ConfigError
	}); err != nil {
		return err
	}
	go m.retireResourceGeneration(context.WithoutCancel(ctx), rt)
	return nil
}

func (m *agentManager) profileRoutesChanged(ctx context.Context, previous, next agentHubGUIConfig) error {
	_ = previous
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
		effectiveDefaults := effectiveResourceAgentDefaults(next.ResourceDefaults, toConfigProfileRoutes(next.AgentProfiles))
		if _, err := forgeWorkspace.EnsureResourceRuntime(app.ResourceAgentDefaults{
			Workspace: effectiveDefaults.Workspace, Project: effectiveDefaults.Project, Task: effectiveDefaults.Task,
		}); err != nil {
			failures = append(failures, fmt.Sprintf("%s: persist resource defaults: %v", workspace.ID, err))
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
			if item.binding.Kind != "profile" {
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

func toConfigProfileRoutes(routes []agentHubProfileRoute) []agentProfileRoute {
	result := make([]agentProfileRoute, 0, len(routes))
	for _, route := range routes {
		result = append(result, agentProfileRoute{Key: route.Key, Description: route.Description, AgentName: route.AgentName})
	}
	return result
}

func (m *agentManager) retireResourceGeneration(ctx context.Context, rt *agentRuntime) {
	m.resourceMu.Lock()
	defer m.resourceMu.Unlock()
	rt.turnActionMu.Lock()
	defer rt.turnActionMu.Unlock()
	rt.mu.Lock()
	run, client := rt.run, rt.agentHub
	rt.mu.Unlock()
	if client == nil || strings.TrimSpace(run.AgentHubSessionID) == "" {
		return
	}
	session, err := client.GetSession(ctx, run.AgentHubSessionID)
	if err != nil {
		rt.setRecoveryError(m, fmt.Errorf("inspect retiring resource generation: %w", err))
		return
	}
	if session.State != "stopped" && session.State != "archived" {
		session, err = client.Stop(ctx, run.AgentHubSessionID)
		if err != nil {
			rt.setRecoveryError(m, fmt.Errorf("retire resource generation: %w", err))
			return
		}
		deadline := time.Now().Add(30 * time.Second)
		for session.State != "stopped" && session.State != "archived" && time.Now().Before(deadline) {
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
	}
	if session.State != "stopped" && session.State != "archived" {
		return
	}
	if session.State != "archived" {
		if _, err := client.Archive(ctx, run.AgentHubSessionID); err != nil {
			rt.setRecoveryError(m, fmt.Errorf("archive retired resource generation: %w", err))
			return
		}
	}
	updated, err := rt.mutateRun(func(run *agentRun) {
		run.Status = "stopped"
		run.AgentHubStoppedObserved = true
		run.ReplacementPending = false
		run.UpdatedAt = time.Now().Format(time.RFC3339Nano)
	})
	if err != nil {
		rt.setRecoveryError(m, fmt.Errorf("persist retired generation: %w", err))
		return
	}
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
	replacement, err := m.createResourceGeneration(ctx, rt.workspace, updated.ResourceID, updated.Title, updated.Cwd, cfg, replacementClient, resolved, nil, false)
	if err != nil {
		rt.addForgeNotice(m, "warning", "resource/replacement", "Queued replacement generation failed: "+err.Error())
		return
	}
	replacementRuntime := m.runtimeByID(replacement.ID)
	if replacementRuntime == nil {
		rt.addForgeNotice(m, "warning", "resource/replacement", "Replacement runtime disappeared before mailbox transfer")
		return
	}
	if err := transferGenerationMailbox(rt, replacementRuntime); err != nil {
		rt.addForgeNotice(m, "warning", "resource/replacement", "Replacement started but atomic mailbox transfer will be retried: "+err.Error())
		return
	}
	if err := replacementRuntime.deliverPendingResourceMessages(ctx, m); err != nil {
		replacementRuntime.addForgeNotice(m, "warning", "resource/message", "Transferred message is durable and queued for retry: "+err.Error())
	}
	rt.addForgeNotice(m, "info", "resource/replacement", "Started replacement resource generation "+replacement.GenerationID)
}

// transferGenerationMailbox publishes the old-empty/new-populated mailbox in
// one atomic generations.json replacement. A crash can observe either side of
// the transfer, never a state where accepted inputs exist in neither run.
func transferGenerationMailbox(from, to *agentRuntime) error {
	fromID, toID := from.snapshotRun().ID, to.snapshotRun().ID
	first, second := from, to
	if fromID > toID {
		first, second = second, first
	}
	first.mu.Lock()
	second.mu.Lock()
	defer second.mu.Unlock()
	defer first.mu.Unlock()

	agentIndexMu.Lock()
	defer agentIndexMu.Unlock()
	runs, err := loadAgentRunsLocked(from.workspace.Path)
	if err != nil {
		return err
	}
	fromIndex, toIndex := -1, -1
	for index := range runs {
		switch runs[index].ID {
		case fromID:
			fromIndex = index
		case toID:
			toIndex = index
		}
	}
	if fromIndex < 0 || toIndex < 0 {
		return errors.New("generation disappeared during mailbox transfer")
	}
	pending := append([]resourceInboundMessage(nil), runs[fromIndex].PendingMessages...)
	seen := make(map[string]bool, len(pending)+len(runs[toIndex].PendingMessages))
	for _, message := range runs[toIndex].PendingMessages {
		seen[message.ID] = true
	}
	for _, message := range pending {
		if !seen[message.ID] {
			runs[toIndex].PendingMessages = append(runs[toIndex].PendingMessages, message)
			seen[message.ID] = true
		}
	}
	runs[fromIndex].PendingMessages = nil
	runs[fromIndex].UpdatedAt = time.Now().Format(time.RFC3339Nano)
	runs[toIndex].UpdatedAt = runs[fromIndex].UpdatedAt
	if err := writeAgentRunsIndexLocked(from.workspace.Path, runs); err != nil {
		return err
	}
	from.run = cloneAgentRun(runs[fromIndex])
	to.run = cloneAgentRun(runs[toIndex])
	return nil
}
