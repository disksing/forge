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

func (m *agentManager) resourceHasActiveTurn(ctx context.Context, workspace guiWorkspace, resourceID string) (bool, error) {
	runs, err := loadAgentRunsCurrent(workspace.Path)
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
	if strings.TrimSpace(resourceID) == app.SchedulerResourceID {
		return app.SchedulerResourceID, nil
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
	case app.SchedulerResourceID:
		return "fast"
	default:
		return defaults.Project
	}
}

func resolvedAgentError(resolved resolvedResourceAgent, requested, fallback string) (resolvedResourceAgent, error) {
	resolved.ConfigError = fmt.Sprintf("Agent Profile %q cannot be resolved; type default %q and global Profile \"default\" are unavailable", requested, fallback)
	return resolved, errors.New(resolved.ConfigError + "; configure one of these Profiles before starting a new generation")
}

func nextResourceGeneration(workspacePath, resourceID string) (int, error) {
	store, err := openGenerationStore(workspacePath, "")
	if err != nil {
		return 0, err
	}
	return store.NextGeneration(resourceID)
}

func resourceGenerationTitle(workspace guiWorkspace, resourceID string, generation int) (string, error) {
	resourceID = normalizedResourceID(resourceID)
	title := strings.TrimSpace(workspace.Name)
	if resourceID == app.SchedulerResourceID {
		title = "Scheduler"
	} else if resourceID != "workspace" {
		forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
		if err != nil {
			return "", err
		}
		resource, err := forgeWorkspace.ResourceValue(resourceID)
		if err != nil {
			return "", err
		}
		switch {
		case resource.Project != nil:
			title = strings.TrimSpace(resource.Project.Title)
		case resource.Task != nil:
			title = strings.TrimSpace(resource.Task.Title)
		}
	}
	if title == "" {
		if resourceID == "workspace" {
			title = workspaceName(workspace.Path)
		} else {
			title = resourceID
		}
	}
	return fmt.Sprintf("%s (gen #%d)", title, generation), nil
}

func currentResourceGeneration(workspacePath, resourceID string) (agentRun, bool, error) {
	store, err := openGenerationStore(workspacePath, "")
	if err != nil {
		return agentRun{}, false, err
	}
	record, found, err := store.Current(resourceID)
	if err != nil || !found {
		return agentRun{}, found, err
	}
	run, err := generationRecordToAgentRun(record)
	if err != nil {
		return agentRun{}, false, err
	}
	if !agentRunMatchesResource(run, resourceID) || strings.TrimSpace(run.GenerationID) == "" {
		return agentRun{}, false, nil
	}
	return run, true, nil
}

// deliverPendingResourceMessages retries only messages carrying stable IDs.
// AgentHub's at-least-once capability makes an unknown response safe: Forge
// retains the same stable ID until AgentHub durably accepts retry ownership.
func (rt *agentRuntime) deliverPendingResourceMessages(ctx context.Context, m *agentManager) error {
	run := rt.snapshotRun()
	return m.withResourceController(ctx, rt.workspace, run.ResourceID, func() error {
		return m.reconcileResourceMailboxLocked(ctx, rt.workspace, run.ResourceID)
	})
}

// createResourceGeneration creates one durable generation. Callers that need
// resource ordering must invoke it from that resource's controller. Pending
// inputs remain owned by the Workspace mailbox; generation creation never
// transfers or rewrites them.
func (m *agentManager) createResourceGeneration(ctx context.Context, workspace guiWorkspace, resourceID, cwd string, cfg config, client *agentHubClient, resolved resolvedResourceAgent) (agentRun, error) {
	generation, err := nextResourceGeneration(workspace.Path, resourceID)
	if err != nil {
		return agentRun{}, err
	}
	title, err := resourceGenerationTitle(workspace, resourceID, generation)
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
		Title:             title,
		Cwd:               cwd,
		Status:            "starting",
		CreatedAt:         now,
		UpdatedAt:         now,
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
	launchEnvironment := map[string]string{
		"FORGE_WORKSPACE_ROOT":        workspace.Path,
		"FORGE_WORKSPACE_INSTANCE_ID": run.SourceInstanceID,
		"FORGE_RESOURCE_ID":           resourceKey,
	}
	session, err := m.findOrCreateAgentHubSession(ctx, client, source, agentHubCreateSessionRequest{
		Title: run.Title, Cwd: run.Cwd, AgentName: run.AgentHubAgentName,
		Source: &source, IdempotencyKey: run.GenerationID, LaunchEnvironment: launchEnvironment,
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
	return rt.snapshotRun(), nil
}

func (m *agentManager) resourceBindingChanged(ctx context.Context, workspace guiWorkspace, resourceID string, binding app.AgentBinding) error {
	return m.withResourceController(ctx, workspace, resourceID, func() error {
		return m.resourceBindingChangedLocked(ctx, workspace, resourceID, binding)
	})
}

func (m *agentManager) resourceBindingChangedLocked(ctx context.Context, workspace guiWorkspace, resourceID string, binding app.AgentBinding) error {
	_ = binding
	run, found, err := currentResourceGeneration(workspace.Path, resourceID)
	if err != nil || !found {
		return err
	}
	// A hand-written or pre-profile legacy projection has no binding to
	// reconcile. Keep it attached to its current generation until an explicit
	// profile binding is persisted; otherwise a startup poll could replace a
	// valid run merely because its old projection predates profile metadata.
	if strings.TrimSpace(run.BindingKind) == "" && strings.TrimSpace(run.BindingName) == "" &&
		strings.TrimSpace(run.AgentHubAgentName) == "" && strings.TrimSpace(run.ResolvedProfile) == "" {
		return nil
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
	_ = m.enqueueResourceController(rt.workspace, run.ResourceID, func() error {
		m.retireResourceGenerationLocked(context.WithoutCancel(ctx), rt)
		return nil
	})
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
		bindings = append(bindings, struct {
			id      string
			binding app.AgentBinding
		}{id: app.SchedulerResourceID, binding: tree.Scheduler.AgentBinding})
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
	if rt == nil {
		return
	}
	run := rt.snapshotRun()
	_ = m.withResourceController(ctx, rt.workspace, run.ResourceID, func() error {
		m.retireResourceGenerationLocked(ctx, rt)
		return nil
	})
}

// retireResourceGenerationLocked runs the Stop -> stopped -> Archive
// lifecycle while its resource controller owns the operation. The name is
// retained to make accidental calls from outside the controller obvious.
func (m *agentManager) retireResourceGenerationLocked(ctx context.Context, rt *agentRuntime) {
	rt.turnActionMu.Lock()
	defer rt.turnActionMu.Unlock()
	rt.mu.Lock()
	rt.lifecycleStopInFlight = true
	rt.mu.Unlock()
	defer func() {
		rt.mu.Lock()
		rt.lifecycleStopInFlight = false
		rt.agentHubStopRequested = false
		rt.mu.Unlock()
	}()
	rt.mu.Lock()
	run, client := rt.run, rt.agentHub
	rt.mu.Unlock()
	if run.Retired {
		return
	}
	automaticSleep := run.IdleSleepStopRequested
	if client == nil || strings.TrimSpace(run.AgentHubSessionID) == "" {
		return
	}
	cfg, _, cfgErr := m.agentHubRuntimeConfig()
	if cfgErr != nil {
		rt.setRecoveryError(m, fmt.Errorf("inspect retiring resource generation: %w", cfgErr))
		return
	}
	session, err := client.GetSession(ctx, run.AgentHubSessionID)
	if err != nil {
		rt.setRecoveryError(m, fmt.Errorf("inspect retiring resource generation: %w", err))
		return
	}
	if !agentHubSessionExactlyMatchesRun(cfg, run, session) {
		rt.setRecoveryError(m, fmt.Errorf("retiring AgentHub Session %s does not match generation %s", session.ID, run.GenerationID))
		return
	}
	mailbox, mailboxErr := loadHotResourceMailbox(rt.workspace.Path, run.ResourceID)
	if mailboxErr != nil {
		rt.setRecoveryError(m, fmt.Errorf("inspect retiring resource mailbox: %w", mailboxErr))
		return
	}
	lifecyclePlan := PlanGeneration(AdaptLegacyGenerationFacts(LegacyGenerationLifecycleInput{
		Run: run, Session: &session, Mailbox: mailbox, Revision: run.UpdatedAt,
	}))
	switch lifecyclePlan.Operation {
	case GenerationOperationFinalizeArchivedMailbox, GenerationOperationDeliverMessage,
		GenerationOperationInterruptTurn, GenerationOperationWaitForMessageReceipt:
		return
	}
	if session.State == "running" || session.State == "waiting_approval" || len(session.PendingApprovalIDs) > 0 {
		// A message or provider action won the race after the ready snapshot.
		// Never interrupt it for automatic sleep; the next ready boundary gets a
		// fresh deadline.
		_, _ = rt.mutateRun(func(run *agentRun) {
			run.Status = forgeStatusForAgentHubState(session.State)
			run.IdleSinceAt = ""
			run.IdleDeadlineAt = ""
			run.IdleSleepStopRequested = false
			run.UpdatedAt = time.Now().Format(time.RFC3339Nano)
		})
		return
	}
	if session.State == "starting" {
		_, _ = rt.mutateRun(func(run *agentRun) {
			run.Status = "starting"
			run.IdleSinceAt = ""
			run.IdleDeadlineAt = ""
			run.IdleSleepStopRequested = false
			run.UpdatedAt = time.Now().Format(time.RFC3339Nano)
		})
		return
	}
	if session.State == "archived" {
		// Archive may have happened after a successful Stop but before this
		// process observed it. Reuse the existing durable proof path rather than
		// treating an archived projection as proof by itself.
		_ = m.enqueueRuntimeOperation(rt, func() {
			rt.reconcileArchivedAgentHubSession(m, client, session)
		})
		return
	}
	if session.State == "ready" {
		pending, pendingErr := mailboxPendingForResource(rt.workspace.Path, run.ResourceID)
		if pendingErr != nil {
			rt.setRecoveryError(m, fmt.Errorf("inspect retiring resource mailbox: %w", pendingErr))
			return
		}
		if !run.IdleSleepStopRequested && !run.ReplacementPending && pending {
			// No automatic Stop guard was persisted for this attempt and a
			// mailbox item is already available; leave the Session ready so the
			// normal mailbox reconciler can deliver it.
			return
		}
		_, err = rt.mutateRuntime(func(runtime *agentRuntime) {
			runtime.run.Status = "stopping"
			runtime.run.UpdatedAt = time.Now().Format(time.RFC3339Nano)
			runtime.agentHubStopRequested = true
		})
		if err != nil {
			rt.setRecoveryError(m, fmt.Errorf("persist retiring resource generation: %w", err))
			return
		}
		session, err = client.Stop(ctx, run.AgentHubSessionID)
		if err != nil {
			rt.setRecoveryError(m, fmt.Errorf("retire resource generation: %w", err))
			return
		}
		if !agentHubSessionExactlyMatchesRun(cfg, run, session) {
			rt.setRecoveryError(m, fmt.Errorf("Stop response for generation %s did not match its AgentHub source", run.GenerationID))
			return
		}
	}
	if session.State == "stopping" {
		deadline := time.Now().Add(agentHubStopConfirmTimeout)
		for session.State != "stopped" && session.State != "archived" && time.Now().Before(deadline) {
			timer := time.NewTimer(agentHubStopConfirmInterval)
			select {
			case <-ctx.Done():
				timer.Stop()
				return
			case <-timer.C:
			}
			session, err = client.GetSession(ctx, run.AgentHubSessionID)
			if err != nil {
				rt.setRecoveryError(m, fmt.Errorf("confirm retiring resource generation: %w", err))
				return
			}
			if !agentHubSessionExactlyMatchesRun(cfg, run, session) {
				rt.setRecoveryError(m, fmt.Errorf("confirmation for generation %s did not match its AgentHub source", run.GenerationID))
				return
			}
		}
	}
	if session.State == "archived" {
		_ = m.enqueueRuntimeOperation(rt, func() {
			rt.reconcileArchivedAgentHubSession(m, client, session)
		})
		return
	}
	if session.State != "stopped" {
		rt.setRecoveryError(m, fmt.Errorf("retiring resource generation %s did not reach durable stopped", run.GenerationID))
		return
	}
	archived, err := client.Archive(ctx, run.AgentHubSessionID)
	if err != nil {
		rt.setRecoveryError(m, fmt.Errorf("archive retired resource generation: %w", err))
		return
	}
	if !agentHubSessionExactlyMatchesRun(cfg, run, archived) || archived.State != "archived" {
		rt.setRecoveryError(m, fmt.Errorf("Archive response for generation %s was not a matching archived Session", run.GenerationID))
		return
	}
	updated, err := rt.mutateRun(func(run *agentRun) {
		run.Status = "stopped"
		run.AgentHubStoppedObserved = true
		run.ReplacementPending = false
		run.IdleSleepStopRequested = false
		run.UpdatedAt = time.Now().Format(time.RFC3339Nano)
	})
	if err != nil {
		rt.setRecoveryError(m, fmt.Errorf("persist retired generation: %w", err))
		return
	}
	retireReason := "generation_replaced"
	if automaticSleep {
		retireReason = "idle_sleep"
	}
	if err := retireStoredAgentRun(rt, updated, retireReason); err != nil {
		rt.setRecoveryError(m, fmt.Errorf("persist retired generation manifest: %w", err))
		return
	}
	pending, pendingErr := mailboxPendingForResource(rt.workspace.Path, updated.ResourceID)
	if pendingErr != nil {
		rt.addForgeNotice(m, "warning", "resource/replacement", "Inspect Workspace mailbox: "+pendingErr.Error())
		return
	}
	if !pending {
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
	replacement, err := m.createResourceGeneration(ctx, rt.workspace, updated.ResourceID, updated.Cwd, cfg, replacementClient, resolved)
	if err != nil {
		rt.addForgeNotice(m, "warning", "resource/replacement", "Queued replacement generation failed: "+err.Error())
		return
	}
	replacementRuntime := m.runtimeByID(replacement.ID)
	if replacementRuntime == nil {
		rt.addForgeNotice(m, "warning", "resource/replacement", "Replacement runtime disappeared before mailbox delivery")
		return
	}
	if err := m.reconcileResourceMailboxLocked(ctx, rt.workspace, updated.ResourceID); err != nil {
		replacementRuntime.addForgeNotice(m, "warning", "resource/message", "Workspace mailbox delivery remains queued: "+err.Error())
	}
	rt.addForgeNotice(m, "info", "resource/replacement", "Started replacement resource generation "+replacement.GenerationID)
}
