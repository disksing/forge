package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"
)

func (m *agentManager) agentHubRuntimeConfig() (config, *agentHubClient, error) {
	cfg, err := m.server.loadConfig()
	if err != nil {
		return config{}, nil, err
	}
	if cfg.Version < agentHubConfigVersion {
		return config{}, nil, errors.New("Forge chat requires migrated AgentHub settings; save AgentHub settings before starting a new run")
	}
	if strings.TrimSpace(cfg.AgentHubInstanceID) == "" {
		return config{}, nil, errors.New("AgentHub instance id is not configured")
	}
	endpoint, err := effectiveAgentHubEndpoint(cfg.AgentHubEndpoint)
	if err != nil {
		return config{}, nil, err
	}
	client, err := newAgentHubClient(endpoint, nil)
	if err != nil {
		return config{}, nil, err
	}
	return cfg, client, nil
}

func resolveAgentHubRunAgent(cfg config, req startAgentRequest) (string, error) {
	name := strings.TrimSpace(req.AgentID)
	if profile := strings.ToLower(strings.TrimSpace(req.AgentProfile)); name == "" && profile != "" {
		for _, route := range cfg.AgentProfiles {
			if strings.EqualFold(strings.TrimSpace(route.Key), profile) {
				name = strings.TrimSpace(route.AgentName)
				break
			}
		}
	}
	if name == "" {
		name = strings.TrimSpace(cfg.DefaultAgentName)
	}
	if name == "" {
		return "", errors.New("no AgentHub agent is configured")
	}
	return name, nil
}

func (m *agentManager) startRun(w http.ResponseWriter, r *http.Request, workspaceID string) {
	workspace, err := m.server.workspace(workspaceID)
	if err != nil {
		writeError(w, err, http.StatusNotFound)
		return
	}
	var req startAgentRequest
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(&req); err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	cfg, client, err := m.agentHubRuntimeConfig()
	if err != nil {
		writeError(w, err, http.StatusServiceUnavailable)
		return
	}
	agentName, err := resolveAgentHubRunAgent(cfg, req)
	if err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	cwd, err := m.agentRunCwd(r.Context(), workspace, req.ResourceID, req.Cwd)
	if err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	now := time.Now().Format(time.RFC3339)
	run := agentRun{
		ID:                    newRunID(),
		WorkspaceID:           workspace.ID,
		ResourceID:            strings.TrimSpace(req.ResourceID),
		AgentID:               agentName,
		AgentProfile:          strings.TrimSpace(req.AgentProfile),
		AgentSelectionReason:  strings.TrimSpace(req.AgentSelectionReason),
		AgentHubAgentName:     agentName,
		Title:                 strings.TrimSpace(req.Title),
		Cwd:                   cwd,
		Status:                "starting",
		CreatedAt:             now,
		UpdatedAt:             now,
		SchedulerTurn:         req.SchedulerTurn,
		AutoRunGeneration:     req.AutoRunGeneration,
		PendingInitialMessage: strings.TrimSpace(req.Prompt),
	}
	if run.Title == "" {
		run.Title = agentName + " run"
	}
	run.SourceExternalID = workspace.ID + "/" + run.ID
	rt := newAgentHubRuntime(m, workspace, run, client, nil)

	forgeSessionID, err := m.createForgeSession(r.Context(), workspace, run, cfg)
	if err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	run.ForgeSessionID = forgeSessionID
	rt.setRun(run)
	m.registerRuntime(rt)
	cleanup := true
	defer func() {
		if cleanup {
			m.removeRuntime(run.ID)
			removeForgeSessionContextFile(run.ForgeSessionContextPath, run.ForgeSessionID)
			_ = m.endForgeSession(context.Background(), workspace, forgeSessionID)
		}
	}()
	if err := m.lockForgeSession(r.Context(), workspace, forgeSessionID, run.ResourceID); err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	if run.SchedulerTurn {
		if err := m.startAutoRun(r.Context(), workspace, run); err != nil {
			writeError(w, err, http.StatusBadRequest)
			return
		}
	}
	contextPath, err := m.writeForgeSessionContext(r.Context(), workspace, run)
	if err != nil {
		writeError(w, err, http.StatusInternalServerError)
		return
	}
	run.ForgeSessionContextPath = contextPath
	rt.setRun(run)
	if err := saveAgentRun(workspace.Path, run); err != nil {
		writeError(w, err, http.StatusInternalServerError)
		return
	}

	source := agentHubSource{
		App: agentHubSourceApp, InstanceID: cfg.AgentHubInstanceID, ExternalID: run.SourceExternalID,
	}
	session, err := m.findOrCreateAgentHubSession(r.Context(), client, source, agentHubCreateSessionRequest{
		Title: run.Title, Cwd: run.Cwd, AgentName: agentName,
		LaunchEnvironment: map[string]string{"FORGE_SESSION_ID": forgeSessionID},
		Source:            &source,
		InitialMessage:    agentHubInitialMessage(strings.TrimSpace(req.Prompt)),
	})
	if err != nil {
		cleanup = false
		rt.setRecoveryError(m, err)
		writeError(w, err, http.StatusBadGateway)
		return
	}
	run.AgentHubSessionID = session.ID
	run.PendingInitialMessage = ""
	run.AgentHubAgentName = session.AgentName
	if run.AgentHubAgentName == "" {
		run.AgentHubAgentName = agentName
	}
	rt.setRun(run)
	cleanup = false
	if err := m.bindForgeSessionAgentHub(r.Context(), workspace, forgeSessionID, session.ID); err != nil {
		rt.setRecoveryError(m, fmt.Errorf("persist AgentHub session binding: %w", err))
		writeError(w, err, http.StatusInternalServerError)
		return
	}
	if err := saveAgentRun(workspace.Path, run); err != nil {
		rt.setRecoveryError(m, err)
		writeError(w, err, http.StatusInternalServerError)
		return
	}
	if err := rt.catchUpAgentHub(r.Context(), m, session.LastEventID); err != nil {
		rt.setRecoveryError(m, err)
		writeError(w, err, http.StatusBadGateway)
		return
	}
	rt.startAgentHubStream(m)
	current, events, truncated := rt.snapshotDetail()
	writeJSON(w, agentRunDetail{Run: current, Events: events, EventsTruncated: truncated, EventsHasMore: truncated})
}

func agentHubInitialMessage(text string) *struct {
	Text string `json:"text"`
} {
	if text == "" {
		return nil
	}
	return &struct {
		Text string `json:"text"`
	}{Text: text}
}

func (m *agentManager) findOrCreateAgentHubSession(ctx context.Context, client *agentHubClient, source agentHubSource, request agentHubCreateSessionRequest) (agentHubSession, error) {
	found, err := findAgentHubSourceSessions(ctx, client, source)
	if err != nil {
		return agentHubSession{}, fmt.Errorf("query AgentHub source before create: %w", err)
	}
	switch len(found) {
	case 1:
		return found[0], nil
	case 0:
	default:
		return agentHubSession{}, duplicateAgentHubSourceError(source, found)
	}
	created, createErr := client.CreateSession(ctx, request)
	if createErr == nil {
		return created, nil
	}
	// Create is non-idempotent. Any response or transport failure can be
	// ambiguous, so always query the complete source tuple before deciding.
	recovered, queryErr := findAgentHubSourceSessions(context.WithoutCancel(ctx), client, source)
	if queryErr != nil {
		return agentHubSession{}, fmt.Errorf("AgentHub create outcome is unknown (%v); source recovery failed: %w", createErr, queryErr)
	}
	switch len(recovered) {
	case 1:
		return recovered[0], nil
	case 0:
		return agentHubSession{}, fmt.Errorf("create AgentHub session: %w", createErr)
	default:
		return agentHubSession{}, duplicateAgentHubSourceError(source, recovered)
	}
}

func findAgentHubSourceSessions(ctx context.Context, client *agentHubClient, source agentHubSource) ([]agentHubSession, error) {
	sessions, err := client.ListSessions(ctx, agentHubSessionFilter{
		IncludeArchived: true, SourceApp: source.App, SourceInstanceID: source.InstanceID, SourceExternalID: source.ExternalID,
	})
	if err != nil {
		return nil, err
	}
	filtered := sessions[:0]
	for _, session := range sessions {
		if session.Source != nil && session.Source.App == source.App &&
			session.Source.InstanceID == source.InstanceID && session.Source.ExternalID == source.ExternalID {
			filtered = append(filtered, session)
		}
	}
	return filtered, nil
}

func duplicateAgentHubSourceError(source agentHubSource, sessions []agentHubSession) error {
	ids := make([]string, 0, len(sessions))
	for _, session := range sessions {
		ids = append(ids, session.ID)
	}
	return fmt.Errorf("multiple AgentHub sessions match source %s/%s/%s: %s; Forge will keep the resource lock until the conflict is resolved",
		source.App, source.InstanceID, source.ExternalID, strings.Join(ids, ", "))
}

func newAgentHubRuntime(m *agentManager, workspace guiWorkspace, run agentRun, client *agentHubClient, events []agentEvent) *agentRuntime {
	return &agentRuntime{
		workspace: workspace, manager: m, run: run, events: append([]agentEvent(nil), events...),
		nextEventID: nextAgentEventID(events), agentHub: client,
	}
}

func (rt *agentRuntime) loadAgentHubHistory(ctx context.Context, highWater int64) error {
	rt.mu.Lock()
	client, sessionID := rt.agentHub, rt.run.AgentHubSessionID
	rt.mu.Unlock()
	if client == nil || sessionID == "" {
		return errors.New("AgentHub runtime is not attached to a session")
	}
	cursor := int64(0)
	var history []agentEvent
	sawStopped := false
	for {
		page, err := client.Events(ctx, sessionID, cursor, agentHubEventsPageSize)
		if err != nil {
			return err
		}
		if highWater == 0 {
			highWater = page.LatestCursor
		}
		progressed := false
		for _, source := range page.Events {
			if source.ID <= cursor {
				continue
			}
			if source.ID != cursor+1 {
				return fmt.Errorf("AgentHub history cursor gap: expected %d, got %d", cursor+1, source.ID)
			}
			event, state, _ := translateAgentHubEvent(source)
			if state == "stopped" {
				sawStopped = true
			}
			history = append(history, event)
			if len(history) > agentEventMaxCount {
				history = history[len(history)-agentEventMaxCount:]
			}
			cursor = source.ID
			progressed = true
			if cursor >= highWater {
				break
			}
		}
		if cursor >= highWater {
			break
		}
		if !progressed {
			return fmt.Errorf("AgentHub history stopped at cursor %d before high-water %d", cursor, highWater)
		}
	}
	rt.mu.Lock()
	rt.events = append([]agentEvent(nil), history...)
	rt.nextEventID = nextAgentEventID(history)
	if sawStopped {
		rt.run.AgentHubStoppedObserved = true
		if rt.agentHubState == "archived" || rt.run.Status == "recovering" {
			rt.run.Status = "stopped"
		}
	}
	rt.mu.Unlock()
	return nil
}

func (rt *agentRuntime) agentHubEventsAfter(ctx context.Context, after int64) ([]agentEvent, error) {
	rt.mu.Lock()
	client, sessionID := rt.agentHub, rt.run.AgentHubSessionID
	rt.mu.Unlock()
	var result []agentEvent
	highWater := int64(0)
	cursor := after
	for {
		page, err := client.Events(ctx, sessionID, cursor, agentHubEventsPageSize)
		if err != nil {
			return nil, err
		}
		if highWater == 0 {
			highWater = page.LatestCursor
		}
		progressed := false
		for _, source := range page.Events {
			if source.ID <= cursor {
				continue
			}
			if source.ID != cursor+1 {
				return nil, fmt.Errorf("AgentHub event cursor gap: expected %d, got %d", cursor+1, source.ID)
			}
			event, _, _ := translateAgentHubEvent(source)
			result = append(result, event)
			cursor = source.ID
			progressed = true
			if cursor >= highWater {
				break
			}
		}
		if cursor >= highWater {
			return result, nil
		}
		if !progressed {
			return nil, fmt.Errorf("AgentHub event replay stopped at cursor %d before high-water %d", cursor, highWater)
		}
	}
}

func (rt *agentRuntime) agentHubEventsBefore(ctx context.Context, before int64, limit int) ([]agentEvent, bool, error) {
	if limit <= 0 || limit > agentEventMaxCount {
		limit = agentEventMaxCount
	}
	events, err := rt.agentHubEventsAfter(ctx, 0)
	if err != nil {
		return nil, false, err
	}
	filtered := events[:0]
	for _, event := range events {
		if event.ID < before {
			filtered = append(filtered, event)
		}
	}
	hasMore := len(filtered) > limit
	if len(filtered) > limit {
		filtered = filtered[len(filtered)-limit:]
	}
	return append([]agentEvent(nil), filtered...), hasMore, nil
}

func (rt *agentRuntime) catchUpAgentHub(ctx context.Context, m *agentManager, requestedHighWater int64) error {
	rt.agentHubSync.Lock()
	defer rt.agentHubSync.Unlock()
	rt.mu.Lock()
	client := rt.agentHub
	sessionID := rt.run.AgentHubSessionID
	cursor := rt.run.AgentHubEventCursor
	rt.mu.Unlock()
	if client == nil || strings.TrimSpace(sessionID) == "" {
		return errors.New("AgentHub runtime is not attached to a session")
	}
	highWater := requestedHighWater
	first := true
	for first || cursor < highWater {
		first = false
		page, err := client.Events(ctx, sessionID, cursor, agentHubEventsPageSize)
		if err != nil {
			return fmt.Errorf("catch up AgentHub events after %d: %w", cursor, err)
		}
		if highWater == 0 {
			highWater = page.LatestCursor
		}
		if page.LatestCursor < highWater {
			return fmt.Errorf("AgentHub durable cursor moved backwards from %d to %d", highWater, page.LatestCursor)
		}
		progressed := false
		for _, event := range page.Events {
			before := cursor
			if err := rt.applyAgentHubEvent(m, event); err != nil {
				return err
			}
			rt.mu.Lock()
			cursor = rt.run.AgentHubEventCursor
			rt.mu.Unlock()
			if cursor > before {
				progressed = true
			}
			if cursor >= highWater {
				break
			}
		}
		if cursor >= highWater {
			break
		}
		if !progressed {
			return fmt.Errorf("AgentHub event catch-up stopped at cursor %d before high-water %d", cursor, highWater)
		}
	}
	return nil
}

func (rt *agentRuntime) applyAgentHubEvent(m *agentManager, source agentHubEvent) error {
	rt.mu.Lock()
	if source.SessionID != "" && source.SessionID != rt.run.AgentHubSessionID {
		rt.mu.Unlock()
		return fmt.Errorf("AgentHub event %d belongs to unexpected session %s", source.ID, source.SessionID)
	}
	cursor := rt.run.AgentHubEventCursor
	if source.ID <= cursor {
		rt.mu.Unlock()
		return nil
	}
	if source.ID != cursor+1 {
		rt.mu.Unlock()
		return fmt.Errorf("AgentHub event cursor gap: expected %d, got %d", cursor+1, source.ID)
	}
	event, state, schedulerTerminal := translateAgentHubEvent(source)
	rt.run.AgentHubEventCursor = source.ID
	rt.agentHubState = stateOrCurrent(state, rt.agentHubState)
	if state != "" {
		rt.run.Status = forgeStatusForAgentHubState(state)
		if state == "stopped" {
			rt.run.AgentHubStoppedObserved = true
		}
	}
	if source.Type == "session.archived" && !rt.run.AgentHubStoppedObserved {
		rt.run.Status = "recovering"
	}
	if source.Type == "turn.started" {
		rt.run.Status = "running"
		rt.agentHubState = "busy"
	}
	if source.Type == "turn.completed" || source.Type == "turn.failed" || source.Type == "turn.cancelled" {
		if rt.run.Status != "stopping" && rt.run.Status != "stopped" {
			rt.run.Status = "idle"
		}
		rt.agentHubState = "ready"
	}
	if source.Type == "approval.requested" {
		rt.run.Status = "waiting_approval"
		rt.agentHubState = "waiting_approval"
	}
	if source.Type == "approval.resolved" && rt.run.Status == "waiting_approval" {
		rt.run.Status = "running"
		rt.agentHubState = "busy"
	}
	rt.run.UpdatedAt = event.Time
	if isAgentOutputEvent(event.Type, event.Method) {
		rt.run.LastOutputAt = event.Time
	}
	alreadyPresent := false
	for index := len(rt.events) - 1; index >= 0; index-- {
		if rt.events[index].ID == event.ID {
			alreadyPresent = true
			break
		}
		if rt.events[index].ID < event.ID {
			break
		}
	}
	if !alreadyPresent {
		rt.events = append(rt.events, event)
	}
	if len(rt.events) > agentEventMaxCount {
		rt.events = append([]agentEvent(nil), rt.events[len(rt.events)-agentEventMaxCount:]...)
	}
	run := rt.run
	rt.mu.Unlock()
	if err := saveAgentRun(rt.workspace.Path, run); err != nil {
		return err
	}
	m.publish(run.ID, event)
	if run.Status == "stopped" && run.AgentHubStoppedObserved {
		go rt.releaseForgeSessionAfterStopped(m)
	}
	if schedulerTerminal && run.SchedulerTurn {
		go rt.finishSchedulerTurn(m, event.Text)
	}
	return nil
}

func stateOrCurrent(value, current string) string {
	if value != "" {
		return value
	}
	return current
}

func translateAgentHubEvent(source agentHubEvent) (agentEvent, string, bool) {
	event := agentEvent{ID: source.ID, Time: source.Time, Method: source.Type, Data: source.Data}
	if event.Time == "" {
		event.Time = time.Now().Format(time.RFC3339)
	}
	state := ""
	schedulerTerminal := false
	switch source.Type {
	case "message.user", "message.user.steer":
		event.Type, event.Text = "user", firstString(source.Data, "text")
	case "message.assistant.delta":
		event.Type, event.Text = "assistant_delta", firstString(source.Data, "text")
	case "message.reasoning.delta":
		event.Type, event.Text = "reasoning_delta", firstString(source.Data, "text")
	case "tool.event":
		event.Type = "tool"
		// AgentHub wraps provider tool events in a {method, raw} envelope; the
		// GUI renderer expects the original provider method and payload.
		var envelope struct {
			Method string          `json:"method"`
			Raw    json.RawMessage `json:"raw"`
		}
		if err := json.Unmarshal(source.Data, &envelope); err == nil {
			if envelope.Method != "" {
				event.Method = envelope.Method
			}
			if len(envelope.Raw) > 0 {
				event.Data = envelope.Raw
				// ACP payloads are session/update params; the legacy contract
				// carried the inner update object (with toolCallId) directly.
				if envelope.Method == "session/update" {
					if inner := nestedRawMessage(envelope.Raw, "update"); len(inner) > 0 {
						event.Data = inner
					}
				}
			}
		}
		event.Text = eventText(event.Method, event.Data)
	case "approval.requested":
		event.Type = "approval_requested"
		event.PendingRequestID = firstString(source.Data, "approvalId")
		event.Text = eventText(source.Type, source.Data)
	case "approval.resolved":
		event.Type, event.Text = "approval_resolved", eventText(source.Type, source.Data)
	case "provider.error":
		event.Type, event.Text = "error", eventText(source.Type, source.Data)
	case "turn.failed":
		event.Type, event.Text, schedulerTerminal = "error", eventText(source.Type, source.Data), true
	case "turn.completed", "turn.cancelled":
		event.Type, event.Text, schedulerTerminal = "system", eventText(source.Type, source.Data), true
	case "session.state":
		event.Type = "system"
		state = firstString(source.Data, "state")
		event.Text = "AgentHub session " + state
		if reason := firstString(source.Data, "reason"); reason != "" {
			event.Text += ": " + reason
		}
	case "session.created", "session.provider", "session.agent", "session.archived", "turn.started":
		event.Type, event.Text = "system", eventText(source.Type, source.Data)
	case "provider.stderr", "provider.warning", "provider.event", "provider.process.started":
		event.Type, event.Text = "event", eventText(source.Type, source.Data)
	default:
		event.Type = "event"
		event.Text = "Unknown AgentHub event: " + source.Type
	}
	return event, state, schedulerTerminal
}

func forgeStatusForAgentHubState(state string) string {
	switch state {
	case "starting":
		return "starting"
	case "ready":
		return "idle"
	case "busy":
		return "running"
	case "waiting_approval":
		return "waiting_approval"
	case "stopping":
		return "stopping"
	case "stopped":
		return "stopped"
	case "archived":
		return "recovering"
	case "failed":
		return "recovering"
	default:
		return "recovering"
	}
}

func (rt *agentRuntime) startAgentHubStream(m *agentManager) {
	rt.mu.Lock()
	if rt.agentHubCancel != nil {
		rt.mu.Unlock()
		return
	}
	ctx, cancel := context.WithCancel(context.Background())
	rt.agentHubCancel = cancel
	rt.agentHubStreamDone = make(chan struct{})
	rt.mu.Unlock()
	go rt.runAgentHubStream(ctx, m)
}

func (rt *agentRuntime) runAgentHubStream(ctx context.Context, m *agentManager) {
	rt.mu.Lock()
	done := rt.agentHubStreamDone
	rt.mu.Unlock()
	defer close(done)
	for {
		if err := rt.catchUpAgentHub(ctx, m, 0); err != nil {
			if ctx.Err() != nil {
				return
			}
			rt.setRecoveryError(m, err)
		} else {
			rt.restoreAgentHubSessionProjection(ctx)
		}
		rt.mu.Lock()
		client, sessionID, cursor := rt.agentHub, rt.run.AgentHubSessionID, rt.run.AgentHubEventCursor
		rt.mu.Unlock()
		err := client.StreamEvents(ctx, sessionID, cursor, func(event agentHubEvent) error {
			return rt.applyAgentHubEvent(m, event)
		})
		if ctx.Err() != nil {
			return
		}
		if err != nil {
			rt.setRecoveryError(m, err)
		}
		timer := time.NewTimer(100 * time.Millisecond)
		select {
		case <-ctx.Done():
			timer.Stop()
			return
		case <-timer.C:
		}
	}
}

func (rt *agentRuntime) restoreAgentHubSessionProjection(ctx context.Context) {
	rt.mu.Lock()
	client, sessionID, status := rt.agentHub, rt.run.AgentHubSessionID, rt.run.Status
	rt.mu.Unlock()
	if status != "recovering" || client == nil || sessionID == "" {
		return
	}
	session, err := client.GetSession(ctx, sessionID)
	if err != nil {
		return
	}
	rt.mu.Lock()
	if rt.run.Status == "recovering" {
		rt.agentHubState = session.State
		rt.run.Status = forgeStatusForAgentHubState(session.State)
		if session.State == "stopped" {
			rt.run.AgentHubStoppedObserved = true
		}
		rt.run.UpdatedAt = time.Now().Format(time.RFC3339)
	}
	run := rt.run
	rt.mu.Unlock()
	_ = saveAgentRun(rt.workspace.Path, run)
	if run.Status == "stopped" && run.AgentHubStoppedObserved {
		go rt.releaseForgeSessionAfterStopped(rt.manager)
	}
}

func (rt *agentRuntime) setRecoveryError(m *agentManager, err error) {
	rt.mu.Lock()
	if rt.run.Status != "stopped" {
		rt.run.Status = "recovering"
	}
	rt.run.UpdatedAt = time.Now().Format(time.RFC3339)
	run := rt.run
	rt.mu.Unlock()
	_ = saveAgentRun(rt.workspace.Path, run)
	if err != nil {
		rt.addAgentHubDiagnostic(m, "error", "agenthub/recovery", err.Error())
	}
}

func (rt *agentRuntime) releaseForgeSessionAfterStopped(m *agentManager) {
	rt.mu.Lock()
	run := rt.run
	rt.mu.Unlock()
	if !run.AgentHubStoppedObserved || run.Status != "stopped" || strings.TrimSpace(run.ForgeSessionID) == "" {
		return
	}
	if err := m.endForgeSession(context.Background(), rt.workspace, run.ForgeSessionID); err != nil {
		rt.addAgentHubDiagnostic(m, "error", "forge/session/end", "durable stopped observed but Forge session release failed: "+err.Error())
		return
	}
	removeForgeSessionContextFile(run.ForgeSessionContextPath, run.ForgeSessionID)
	rt.mu.Lock()
	if rt.run.ForgeSessionID == run.ForgeSessionID && rt.run.AgentHubStoppedObserved {
		rt.run.ForgeSessionID = ""
		rt.run.ForgeSessionContextPath = ""
		rt.run.UpdatedAt = time.Now().Format(time.RFC3339)
		run = rt.run
	}
	rt.mu.Unlock()
	_ = saveAgentRun(rt.workspace.Path, run)
}

func (rt *agentRuntime) addAgentHubDiagnostic(m *agentManager, eventType, method, text string) {
	rt.mu.Lock()
	id := rt.run.AgentHubEventCursor
	event := agentEvent{ID: id, Time: time.Now().Format(time.RFC3339), Type: eventType, Method: method, Text: text}
	rt.mu.Unlock()
	// Diagnostics are intentionally ephemeral. AgentHub remains the durable
	// conversation fact source and the projection stores only its cursor.
	m.publish(rt.run.ID, event)
}

func (m *agentManager) sendAgentHubInput(w http.ResponseWriter, r *http.Request, rt *agentRuntime, req agentInputRequest, text string) {
	rt.mu.Lock()
	run, state, client := rt.run, rt.agentHubState, rt.agentHub
	rt.mu.Unlock()
	if req.SchedulerTurn {
		if run.Status != "idle" {
			writeError(w, errors.New("session is busy"), http.StatusConflict)
			return
		}
		run.SchedulerTurn = true
		run.AutoRunGeneration = req.AutoRunGeneration
		if err := m.startAutoRun(r.Context(), rt.workspace, run); err != nil {
			writeError(w, err, http.StatusBadRequest)
			return
		}
		rt.setRun(run)
		_ = saveAgentRun(rt.workspace.Path, run)
	}
	steer := state == "busy" || state == "waiting_approval"
	session, err := client.Message(r.Context(), run.AgentHubSessionID, text, steer)
	if err != nil {
		// Message/steer is non-idempotent. Never repeat it. Reconcile durable
		// events and report the ambiguous outcome to the caller.
		_ = rt.catchUpAgentHub(context.WithoutCancel(r.Context()), m, 0)
		writeError(w, fmt.Errorf("AgentHub message outcome may be unknown; it was not retried: %w", err), http.StatusBadGateway)
		return
	}
	rt.mu.Lock()
	rt.agentHubState = session.State
	rt.run.Status = forgeStatusForAgentHubState(session.State)
	rt.mu.Unlock()
	if err := rt.catchUpAgentHub(r.Context(), m, session.LastEventID); err != nil {
		rt.setRecoveryError(m, err)
		writeError(w, err, http.StatusBadGateway)
		return
	}
	writeJSON(w, map[string]string{"status": "accepted"})
}

func (m *agentManager) stopAgentHubRun(w http.ResponseWriter, r *http.Request, rt *agentRuntime) {
	rt.mu.Lock()
	rt.run.Status = "stopping"
	rt.run.UpdatedAt = time.Now().Format(time.RFC3339)
	run, client := rt.run, rt.agentHub
	rt.mu.Unlock()
	_ = saveAgentRun(rt.workspace.Path, run)
	session, err := client.Stop(r.Context(), run.AgentHubSessionID)
	if err != nil {
		rt.setRecoveryError(m, err)
		writeError(w, err, http.StatusBadGateway)
		return
	}
	if err := rt.catchUpAgentHub(r.Context(), m, session.LastEventID); err != nil {
		rt.setRecoveryError(m, err)
		writeError(w, err, http.StatusBadGateway)
		return
	}
	rt.mu.Lock()
	status := rt.run.Status
	rt.mu.Unlock()
	if status != "stopped" {
		err := errors.New("AgentHub stop returned without a durable stopped event")
		rt.setRecoveryError(m, err)
		writeError(w, err, http.StatusBadGateway)
		return
	}
	writeJSON(w, map[string]string{"status": "stopped"})
}

func (m *agentManager) interruptRun(w http.ResponseWriter, r *http.Request, workspaceID, runID string) {
	_, rt, err := m.workspaceRuntime(workspaceID, runID)
	if err != nil || rt == nil {
		writeError(w, errors.New("run is not active"), http.StatusBadRequest)
		return
	}
	rt.mu.Lock()
	run, client := rt.run, rt.agentHub
	rt.mu.Unlock()
	if client == nil || run.AgentHubSessionID == "" {
		writeError(w, errors.New("legacy direct run is read-only and cannot be interrupted after the AgentHub migration"), http.StatusBadRequest)
		return
	}
	session, err := client.Interrupt(r.Context(), run.AgentHubSessionID)
	if err != nil {
		_ = rt.catchUpAgentHub(context.WithoutCancel(r.Context()), m, 0)
		writeError(w, fmt.Errorf("AgentHub interrupt outcome may be unknown; it was not retried: %w", err), http.StatusBadGateway)
		return
	}
	if err := rt.catchUpAgentHub(r.Context(), m, session.LastEventID); err != nil {
		writeError(w, err, http.StatusBadGateway)
		return
	}
	writeJSON(w, map[string]string{"status": "interrupted"})
}

func (m *agentManager) resolveAgentHubApproval(w http.ResponseWriter, r *http.Request, rt *agentRuntime, req agentApprovalRequest) {
	if strings.TrimSpace(req.RequestID) == "" {
		writeError(w, errors.New("requestId is required"), http.StatusBadRequest)
		return
	}
	rt.mu.Lock()
	run, client := rt.run, rt.agentHub
	rt.mu.Unlock()
	session, err := client.Approval(r.Context(), run.AgentHubSessionID, req.RequestID, req.Decision)
	if err != nil {
		_ = rt.catchUpAgentHub(context.WithoutCancel(r.Context()), m, 0)
		writeError(w, fmt.Errorf("AgentHub approval outcome may be unknown; it was not retried: %w", err), http.StatusBadGateway)
		return
	}
	if err := rt.catchUpAgentHub(r.Context(), m, session.LastEventID); err != nil {
		writeError(w, err, http.StatusBadGateway)
		return
	}
	writeJSON(w, map[string]string{"status": "resolved"})
}

func (m *agentManager) resumeAttachedAgentHubRun(w http.ResponseWriter, r *http.Request, rt *agentRuntime) {
	rt.mu.Lock()
	run, client := rt.run, rt.agentHub
	rt.mu.Unlock()
	session, err := client.Resume(r.Context(), run.AgentHubSessionID)
	if err != nil {
		rt.setRecoveryError(m, err)
		writeError(w, err, http.StatusBadGateway)
		return
	}
	if err := rt.catchUpAgentHub(r.Context(), m, session.LastEventID); err != nil {
		rt.setRecoveryError(m, err)
		writeError(w, err, http.StatusBadGateway)
		return
	}
	rt.startAgentHubStream(m)
	current, events, truncated := rt.snapshotDetail()
	writeJSON(w, agentRunDetail{Run: current, Events: events, EventsTruncated: truncated, EventsHasMore: truncated})
}

func (m *agentManager) resumeAgentHubRun(w http.ResponseWriter, r *http.Request, workspace guiWorkspace, run agentRun, historical []agentEvent) {
	cfg, client, err := m.agentHubRuntimeConfig()
	if err != nil {
		writeError(w, err, http.StatusServiceUnavailable)
		return
	}
	source := agentHubSource{App: agentHubSourceApp, InstanceID: cfg.AgentHubInstanceID, ExternalID: run.SourceExternalID}
	sessions, err := findAgentHubSourceSessions(r.Context(), client, source)
	if err != nil {
		writeError(w, err, http.StatusBadGateway)
		return
	}
	if len(sessions) != 1 {
		if len(sessions) > 1 {
			err = duplicateAgentHubSourceError(source, sessions)
		} else {
			err = errors.New("AgentHub session for this Forge run was not found by source")
		}
		writeError(w, err, http.StatusConflict)
		return
	}
	session := sessions[0]
	run.AgentHubSessionID = session.ID
	rt := newAgentHubRuntime(m, workspace, run, client, nil)
	m.registerRuntime(rt)
	if run.ForgeSessionID == "" {
		m.removeRuntime(run.ID)
		writeError(w, errors.New("cannot resume this AgentHub session because its original Forge session is no longer active; start a new Forge run so launchEnvironment receives a valid FORGE_SESSION_ID"), http.StatusConflict)
		return
	}
	session, err = client.Resume(r.Context(), session.ID)
	if err != nil {
		rt.setRecoveryError(m, err)
		writeError(w, err, http.StatusBadGateway)
		return
	}
	if err := rt.loadAgentHubHistory(r.Context(), session.LastEventID); err != nil {
		rt.setRecoveryError(m, err)
		writeError(w, err, http.StatusBadGateway)
		return
	}
	if err := rt.catchUpAgentHub(r.Context(), m, session.LastEventID); err != nil {
		rt.setRecoveryError(m, err)
		writeError(w, err, http.StatusBadGateway)
		return
	}
	rt.startAgentHubStream(m)
	current, events, truncated := rt.snapshotDetail()
	writeJSON(w, agentRunDetail{Run: current, Events: events, EventsTruncated: truncated, EventsHasMore: truncated})
	_ = historical // Legacy local events are deliberately not mixed into AgentHub history.
}

func (m *agentManager) recoverAgentHubRuns(ctx context.Context) error {
	cfg, client, err := m.agentHubRuntimeConfig()
	if err != nil {
		return err
	}
	var failures []string
	for _, workspace := range cfg.Workspaces {
		runs, loadErr := loadAgentRuns(workspace.Path)
		if loadErr != nil {
			failures = append(failures, fmt.Sprintf("%s: %v", workspace.ID, loadErr))
			continue
		}
		for _, run := range runs {
			if run.AgentHubSessionID == "" && run.SourceExternalID == "" {
				continue
			}
			if recoverErr := m.recoverAgentHubRun(ctx, cfg, client, workspace, run); recoverErr != nil {
				failures = append(failures, fmt.Sprintf("%s/%s: %v", workspace.ID, run.ID, recoverErr))
			}
		}
	}
	if len(failures) > 0 {
		return errors.New(strings.Join(failures, "; "))
	}
	return nil
}

func (m *agentManager) recoverAgentHubRun(ctx context.Context, cfg config, client *agentHubClient, workspace guiWorkspace, run agentRun) error {
	source := agentHubSource{App: agentHubSourceApp, InstanceID: cfg.AgentHubInstanceID, ExternalID: run.SourceExternalID}
	sessions, err := findAgentHubSourceSessions(ctx, client, source)
	if err != nil {
		run.Status = "recovering"
		_ = saveAgentRun(workspace.Path, run)
		return err
	}
	if len(sessions) == 0 && strings.TrimSpace(run.ForgeSessionID) != "" {
		recovered, createErr := m.findOrCreateAgentHubSession(ctx, client, source, agentHubCreateSessionRequest{
			Title: run.Title, Cwd: run.Cwd, AgentName: run.AgentHubAgentName,
			LaunchEnvironment: map[string]string{"FORGE_SESSION_ID": run.ForgeSessionID},
			Source:            &source,
			InitialMessage:    agentHubInitialMessage(run.PendingInitialMessage),
		})
		if createErr != nil {
			run.Status = "recovering"
			_ = saveAgentRun(workspace.Path, run)
			return createErr
		}
		sessions = []agentHubSession{recovered}
	}
	if len(sessions) != 1 {
		run.Status = "recovering"
		_ = saveAgentRun(workspace.Path, run)
		if len(sessions) > 1 {
			return duplicateAgentHubSourceError(source, sessions)
		}
		return errors.New("session not found by complete source")
	}
	session := sessions[0]
	run.AgentHubSessionID = session.ID
	run.AgentHubAgentName = session.AgentName
	run.PendingInitialMessage = ""
	run.Status = forgeStatusForAgentHubState(session.State)
	if session.State == "stopped" {
		run.AgentHubStoppedObserved = true
	}
	if session.State == "archived" && !run.AgentHubStoppedObserved {
		run.Status = "recovering"
	}
	rt := newAgentHubRuntime(m, workspace, run, client, nil)
	rt.agentHubState = session.State
	m.registerRuntime(rt)
	if run.ForgeSessionID == "" && session.State != "stopped" && session.State != "archived" {
		rt.setRecoveryError(m, errors.New("active AgentHub session has no matching Forge session; refusing to create a replacement because launchEnvironment would retain the old FORGE_SESSION_ID"))
		return errors.New("active AgentHub session has no matching Forge session")
	}
	if run.ForgeSessionID != "" {
		if err := m.bindForgeSessionAgentHub(ctx, workspace, run.ForgeSessionID, session.ID); err != nil {
			rt.setRecoveryError(m, err)
			return err
		}
	}
	if err := rt.loadAgentHubHistory(ctx, session.LastEventID); err != nil {
		rt.setRecoveryError(m, err)
		return err
	}
	if err := rt.catchUpAgentHub(ctx, m, session.LastEventID); err != nil {
		rt.setRecoveryError(m, err)
		return err
	}
	if session.State != "archived" {
		rt.startAgentHubStream(m)
	}
	rt.mu.Lock()
	stopped := rt.run.Status == "stopped" && rt.run.AgentHubStoppedObserved
	rt.mu.Unlock()
	if stopped {
		go rt.releaseForgeSessionAfterStopped(m)
	}
	return nil
}
