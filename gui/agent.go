package main

import (
	"bufio"
	"bytes"
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"sync"
	"syscall"
	"time"
)

type agentRun struct {
	ID                      string `json:"id"`
	WorkspaceID             string `json:"workspaceId"`
	ResourceID              string `json:"resourceId,omitempty"`
	ForgeSessionID          string `json:"forgeSessionId,omitempty"`
	ForgeSessionContextPath string `json:"forgeSessionContextPath,omitempty"`
	Provider                string `json:"provider"`
	CodexThreadID           string `json:"codexThreadId,omitempty"`
	CodexTurnID             string `json:"codexTurnId,omitempty"`
	Title                   string `json:"title"`
	Cwd                     string `json:"cwd"`
	Status                  string `json:"status"`
	Model                   string `json:"model,omitempty"`
	Sandbox                 string `json:"sandbox"`
	Approval                string `json:"approval"`
	CreatedAt               string `json:"createdAt"`
	UpdatedAt               string `json:"updatedAt"`
	LastOutputAt            string `json:"lastOutputAt,omitempty"`
}

type agentEvent struct {
	ID               int64           `json:"id"`
	Time             string          `json:"time"`
	Type             string          `json:"type"`
	Method           string          `json:"method,omitempty"`
	Text             string          `json:"text,omitempty"`
	Data             json.RawMessage `json:"data,omitempty"`
	PendingRequestID string          `json:"pendingRequestId,omitempty"`
}

type agentRunDetail struct {
	Run             agentRun     `json:"run"`
	Events          []agentEvent `json:"events"`
	EventsTruncated bool         `json:"eventsTruncated,omitempty"`
	EventsHasMore   bool         `json:"eventsHasMore,omitempty"`
}

const (
	agentEventTailBytes = 1024 * 1024
	agentEventMaxCount  = 500
)

var agentIndexMu sync.Mutex

type startAgentRequest struct {
	ResourceID string `json:"resourceId"`
	Title      string `json:"title"`
	Prompt     string `json:"prompt"`
	Model      string `json:"model"`
	Sandbox    string `json:"sandbox"`
	Approval   string `json:"approval"`
	Cwd        string `json:"cwd"`
}

type agentInputRequest struct {
	Text string `json:"text"`
}

type agentApprovalRequest struct {
	RequestID string `json:"requestId"`
	Decision  string `json:"decision"`
}

type pendingApproval struct {
	id     json.RawMessage
	method string
}

type forgeSessionContext struct {
	Version        int    `json:"version"`
	WorkspaceID    string `json:"workspaceId"`
	ResourceID     string `json:"resourceId,omitempty"`
	RunID          string `json:"runId"`
	ForgeSessionID string `json:"forgeSessionId"`
	Cwd            string `json:"cwd"`
	CreatedAt      string `json:"createdAt"`
}

type resourceDetailPath struct {
	Path string `json:"path"`
}

type agentRuntime struct {
	mu          sync.Mutex
	workspace   guiWorkspace
	run         agentRun
	events      []agentEvent
	nextEventID int64
	client      *codexClient
	pending     map[string]pendingApproval
	done        chan struct{}
	doneOnce    sync.Once
}

type agentManager struct {
	server      *server
	mu          sync.Mutex
	runtimes    map[string]*agentRuntime
	subscribers map[string]map[chan agentEvent]bool
}

func newAgentManager(s *server) *agentManager {
	return &agentManager{
		server:      s,
		runtimes:    make(map[string]*agentRuntime),
		subscribers: make(map[string]map[chan agentEvent]bool),
	}
}

func (m *agentManager) handle(w http.ResponseWriter, r *http.Request, workspaceID string, parts []string) {
	if len(parts) == 0 || parts[0] != "runs" {
		http.NotFound(w, r)
		return
	}
	if len(parts) == 1 {
		switch r.Method {
		case http.MethodGet:
			m.listRuns(w, r, workspaceID)
		case http.MethodPost:
			m.startRun(w, r, workspaceID)
		default:
			w.WriteHeader(http.StatusMethodNotAllowed)
		}
		return
	}
	runID := parts[1]
	if len(parts) == 2 {
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		m.getRun(w, r, workspaceID, runID)
		return
	}
	switch parts[2] {
	case "input":
		if r.Method != http.MethodPost {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		m.sendInput(w, r, workspaceID, runID)
	case "stop":
		if r.Method != http.MethodPost {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		m.stopRun(w, r, workspaceID, runID)
	case "resume":
		if r.Method != http.MethodPost {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		m.resumeRun(w, r, workspaceID, runID)
	case "approval":
		if r.Method != http.MethodPost {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		m.resolveApproval(w, r, workspaceID, runID)
	case "events":
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		m.getEvents(w, r, workspaceID, runID)
	case "stream":
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		m.stream(w, r, workspaceID, runID)
	default:
		http.NotFound(w, r)
	}
}

func (m *agentManager) listRuns(w http.ResponseWriter, r *http.Request, workspaceID string) {
	workspace, err := m.server.workspace(workspaceID)
	if err != nil {
		writeError(w, err, http.StatusNotFound)
		return
	}
	resourceID := strings.TrimSpace(r.URL.Query().Get("resourceId"))
	runs, err := loadAgentRuns(workspace.Path)
	if err != nil {
		writeError(w, err, http.StatusInternalServerError)
		return
	}
	m.mu.Lock()
	for i := range runs {
		if rt := m.runtimes[runs[i].ID]; rt != nil {
			rt.mu.Lock()
			runs[i] = rt.run
			rt.mu.Unlock()
		} else if isLiveAgentStatus(runs[i].Status) {
			runs[i].Status = "stopped"
		}
	}
	m.mu.Unlock()
	sort.SliceStable(runs, func(i, j int) bool {
		return runs[i].UpdatedAt > runs[j].UpdatedAt
	})
	if resourceID != "" {
		filtered := runs[:0]
		for _, run := range runs {
			if run.ResourceID == resourceID {
				filtered = append(filtered, run)
			}
		}
		runs = filtered
	}
	writeJSON(w, map[string]any{"runs": runs})
}

func (m *agentManager) startRun(w http.ResponseWriter, r *http.Request, workspaceID string) {
	workspace, err := m.server.workspace(workspaceID)
	if err != nil {
		writeError(w, err, http.StatusNotFound)
		return
	}
	var req startAgentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	req.Prompt = strings.TrimSpace(req.Prompt)
	cwd, err := m.agentRunCwd(r.Context(), workspace, req.ResourceID, req.Cwd)
	if err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	sandbox := normalizeSandbox(req.Sandbox)
	approval := normalizeApproval(req.Approval)
	now := time.Now().Format(time.RFC3339)
	run := agentRun{
		ID:          newRunID(),
		WorkspaceID: workspace.ID,
		ResourceID:  strings.TrimSpace(req.ResourceID),
		Provider:    "codex",
		Title:       strings.TrimSpace(req.Title),
		Cwd:         cwd,
		Status:      "starting",
		Model:       strings.TrimSpace(req.Model),
		Sandbox:     sandbox,
		Approval:    approval,
		CreatedAt:   now,
		UpdatedAt:   now,
	}
	if run.Title == "" {
		run.Title = "Codex run"
	}
	rt := &agentRuntime{
		workspace:   workspace,
		run:         run,
		nextEventID: 1,
		pending:     make(map[string]pendingApproval),
		done:        make(chan struct{}),
	}
	forgeSessionID, err := m.createForgeSession(r.Context(), workspace, run.ID)
	if err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	run.ForgeSessionID = forgeSessionID
	rt.setRun(run)
	m.registerRuntime(rt)
	registered := true
	cleanup := func() {
		if registered {
			m.removeRuntime(run.ID)
			registered = false
		}
		removeForgeSessionContextFile(run.ForgeSessionContextPath, run.ForgeSessionID)
		_ = m.endForgeSession(context.Background(), workspace, forgeSessionID)
	}
	if err := m.lockForgeSession(r.Context(), workspace, forgeSessionID, run.ResourceID); err != nil {
		cleanup()
		writeError(w, err, http.StatusBadRequest)
		return
	}
	contextPath, err := m.writeForgeSessionContext(r.Context(), workspace, run)
	if err != nil {
		cleanup()
		writeError(w, err, http.StatusInternalServerError)
		return
	}
	run.ForgeSessionContextPath = contextPath
	rt.setRun(run)
	if err := ensureAgentDirs(workspace.Path); err != nil {
		cleanup()
		writeError(w, err, http.StatusInternalServerError)
		return
	}
	if err := saveAgentRun(workspace.Path, run); err != nil {
		cleanup()
		writeError(w, err, http.StatusInternalServerError)
		return
	}
	registered = false
	rt.addEvent(m, "system", "", "Starting codex app-server.", nil, "")
	if forgeSessionID != "" {
		rt.addEvent(m, "system", "forge/session/new", fmt.Sprintf("Forge session created: %s", forgeSessionID), nil, "")
	}
	go rt.startCodex(m, req.Prompt)
	writeJSON(w, agentRunDetail{Run: run, Events: rt.snapshotEvents()})
}

func (m *agentManager) createForgeSession(ctx context.Context, workspace guiWorkspace, runID string) (string, error) {
	out, err := m.server.runForge(ctx, workspace.Path, "session", "new", "--gui-run", "--workspace-id", workspace.ID, "--run-id", runID, "--endpoint", m.server.internalEndpoint())
	if err != nil {
		return "", err
	}
	sessionID := strings.TrimSpace(string(out))
	if sessionID == "" {
		return "", errors.New("forge session new returned an empty id")
	}
	return sessionID, nil
}

func (m *agentManager) lockForgeSession(ctx context.Context, workspace guiWorkspace, sessionID, resourceID string) error {
	if resourceID == "" {
		return nil
	}
	args, err := forgeSessionLockArgs(sessionID, resourceID)
	if err != nil {
		return err
	}
	if _, err := m.server.runForge(ctx, workspace.Path, args...); err != nil {
		return err
	}
	return nil
}

func (m *agentManager) endForgeSession(ctx context.Context, workspace guiWorkspace, sessionID string) error {
	sessionID = strings.TrimSpace(sessionID)
	if sessionID == "" {
		return nil
	}
	_, err := m.server.runForge(ctx, workspace.Path, "session", "end", "--id", sessionID)
	return err
}

func (m *agentManager) writeForgeSessionContext(ctx context.Context, workspace guiWorkspace, run agentRun) (string, error) {
	sessionID := strings.TrimSpace(run.ForgeSessionID)
	if sessionID == "" {
		return "", nil
	}
	dir := run.Cwd
	resourceID := strings.TrimSpace(run.ResourceID)
	if resourceID != "" {
		resourceDir, err := m.resourceDir(ctx, workspace, resourceID)
		if err != nil {
			return "", err
		}
		dir = resourceDir
	}
	workspaceAbs, err := filepath.Abs(workspace.Path)
	if err != nil {
		return "", err
	}
	dirAbs, err := filepath.Abs(dir)
	if err != nil {
		return "", err
	}
	if err := ensurePathInside(workspaceAbs, dirAbs); err != nil {
		return "", err
	}
	contextPath := filepath.Join(dirAbs, ".forge", "codex-session.json")
	if err := os.MkdirAll(filepath.Dir(contextPath), 0o755); err != nil {
		return "", err
	}
	context := forgeSessionContext{
		Version:        1,
		WorkspaceID:    run.WorkspaceID,
		ResourceID:     resourceID,
		RunID:          run.ID,
		ForgeSessionID: sessionID,
		Cwd:            run.Cwd,
		CreatedAt:      time.Now().Format(time.RFC3339),
	}
	data, err := json.MarshalIndent(context, "", "  ")
	if err != nil {
		return "", err
	}
	data = append(data, '\n')
	if err := os.WriteFile(contextPath, data, 0o600); err != nil {
		return "", err
	}
	return contextPath, nil
}

func (m *agentManager) agentRunCwd(ctx context.Context, workspace guiWorkspace, resourceID, requested string) (string, error) {
	if strings.TrimSpace(requested) != "" {
		return agentCwd(workspace.Path, requested)
	}
	if strings.TrimSpace(resourceID) == "" {
		return agentCwd(workspace.Path, "")
	}
	return m.resourceDir(ctx, workspace, resourceID)
}

func (m *agentManager) resourceDir(ctx context.Context, workspace guiWorkspace, resourceID string) (string, error) {
	resourceID = strings.TrimSpace(resourceID)
	out, err := m.server.runForge(ctx, workspace.Path, "workspace", "resource", "--id", resourceID, "--json")
	if err != nil {
		return "", err
	}
	var detail resourceDetailPath
	if err := json.Unmarshal(out, &detail); err != nil {
		return "", fmt.Errorf("decode resource path: %w", err)
	}
	if strings.TrimSpace(detail.Path) == "" {
		return "", fmt.Errorf("resource %s returned an empty path", resourceID)
	}
	dirAbs, err := safeWorkspacePath(workspace.Path, filepath.FromSlash(detail.Path))
	if err != nil {
		return "", err
	}
	return dirAbs, nil
}

func (rt *agentRuntime) removeForgeSessionContext() {
	rt.mu.Lock()
	contextPath := rt.run.ForgeSessionContextPath
	sessionID := rt.run.ForgeSessionID
	rt.mu.Unlock()
	removeForgeSessionContextFile(contextPath, sessionID)
}

func removeForgeSessionContextFile(contextPath, sessionID string) {
	contextPath = strings.TrimSpace(contextPath)
	if contextPath == "" {
		return
	}
	data, err := os.ReadFile(contextPath)
	if err != nil {
		return
	}
	var context forgeSessionContext
	if err := json.Unmarshal(data, &context); err != nil {
		return
	}
	if strings.TrimSpace(context.ForgeSessionID) != strings.TrimSpace(sessionID) {
		return
	}
	_ = os.Remove(contextPath)
}

func forgeSessionLockArgs(sessionID, resourceID string) ([]string, error) {
	resourceID = strings.TrimSpace(resourceID)
	args := []string{"session", "lock", "--id", sessionID}
	if resourceID == "" {
		return args, nil
	}
	if projectID, taskSuffix, ok := strings.Cut(resourceID, ".task"); ok {
		if projectID == "" || taskSuffix == "" {
			return nil, fmt.Errorf("invalid task resource id: %s", resourceID)
		}
		return append(args, "--project", projectID, "--task", taskSuffix), nil
	}
	if strings.Contains(resourceID, ".") {
		return nil, fmt.Errorf("invalid project resource id: %s", resourceID)
	}
	return append(args, "--project", resourceID), nil
}

func (s *server) cleanupStaleInternalSessions(ctx context.Context) error {
	cfg, err := s.loadConfig()
	if err != nil {
		return err
	}
	var failures []string
	for _, workspace := range cfg.Workspaces {
		if err := s.cleanupStaleInternalSessionsForWorkspace(ctx, workspace); err != nil {
			failures = append(failures, fmt.Sprintf("%s: %v", workspace.Path, err))
		}
	}
	if len(failures) > 0 {
		return errors.New(strings.Join(failures, "; "))
	}
	return nil
}

func (s *server) cleanupStaleInternalSessionsForWorkspace(ctx context.Context, workspace guiWorkspace) error {
	agentIndexMu.Lock()
	runs, repaired, err := loadAgentRunsLocked(workspace.Path)
	agentIndexMu.Unlock()
	if err != nil {
		return err
	}
	sessionIDs := make(map[string]bool)
	for _, run := range runs {
		sessionID := strings.TrimSpace(run.ForgeSessionID)
		if sessionID != "" {
			sessionIDs[sessionID] = true
		}
	}
	if len(sessionIDs) == 0 {
		if repaired {
			return rewriteAgentRuns(workspace.Path, runs)
		}
		return nil
	}
	active, err := s.activeForgeSessionIDs(ctx, workspace.Path)
	if err != nil {
		return err
	}
	now := time.Now().Format(time.RFC3339)
	changed := repaired
	for i := range runs {
		sessionID := strings.TrimSpace(runs[i].ForgeSessionID)
		if sessionID == "" {
			continue
		}
		if active[sessionID] {
			if _, err := s.runForge(ctx, workspace.Path, "session", "end", "--id", sessionID); err != nil && !strings.Contains(err.Error(), "session not found") {
				return err
			}
		}
		removeForgeSessionContextFile(runs[i].ForgeSessionContextPath, sessionID)
		runs[i].ForgeSessionID = ""
		runs[i].ForgeSessionContextPath = ""
		runs[i].CodexTurnID = ""
		if isLiveAgentStatus(runs[i].Status) {
			runs[i].Status = "stopped"
			runs[i].UpdatedAt = now
		}
		changed = true
	}
	if !changed {
		return nil
	}
	return rewriteAgentRuns(workspace.Path, runs)
}

func (s *server) activeForgeSessionIDs(ctx context.Context, workspacePath string) (map[string]bool, error) {
	out, err := s.runForge(ctx, workspacePath, "session", "list")
	if err != nil {
		return nil, err
	}
	active := make(map[string]bool)
	scanner := bufio.NewScanner(bytes.NewReader(out))
	for scanner.Scan() {
		fields := strings.Fields(scanner.Text())
		if len(fields) > 0 {
			active[fields[0]] = true
		}
	}
	return active, scanner.Err()
}

func rewriteAgentRuns(workspacePath string, runs []agentRun) error {
	agentIndexMu.Lock()
	defer agentIndexMu.Unlock()
	return writeAgentRunsIndexLocked(workspacePath, runs)
}

func (m *agentManager) registerRuntime(rt *agentRuntime) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.runtimes[rt.run.ID] = rt
}

func (m *agentManager) removeRuntime(runID string) {
	m.mu.Lock()
	defer m.mu.Unlock()
	delete(m.runtimes, runID)
}

func (m *agentManager) handleSessionLiveness(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	workspaceID := strings.TrimSpace(r.URL.Query().Get("workspaceId"))
	runID := strings.TrimSpace(r.URL.Query().Get("runId"))
	sessionID := strings.TrimSpace(r.URL.Query().Get("forgeSessionId"))
	if workspaceID == "" || runID == "" || sessionID == "" {
		writeError(w, errors.New("workspaceId, runId, and forgeSessionId are required"), http.StatusBadRequest)
		return
	}
	_, rt, err := m.workspaceRuntime(workspaceID, runID)
	if err != nil || rt == nil {
		writeJSON(w, map[string]any{"active": false, "status": "stopped"})
		return
	}
	rt.mu.Lock()
	run := rt.run
	rt.mu.Unlock()
	active := strings.TrimSpace(run.ForgeSessionID) == sessionID && isLiveAgentStatus(run.Status)
	writeJSON(w, map[string]any{
		"active":        active,
		"status":        run.Status,
		"codexThreadId": run.CodexThreadID,
	})
}

func (m *agentManager) getRun(w http.ResponseWriter, r *http.Request, workspaceID, runID string) {
	workspace, rt, err := m.workspaceRuntime(workspaceID, runID)
	if err != nil {
		writeError(w, err, http.StatusNotFound)
		return
	}
	if rt != nil {
		rt.mu.Lock()
		detail := agentRunDetail{Run: rt.run, Events: append([]agentEvent(nil), rt.events...)}
		rt.mu.Unlock()
		writeJSON(w, detail)
		return
	}
	run, events, truncated, err := loadAgentRunDetail(workspace.Path, runID)
	if err != nil {
		writeError(w, err, http.StatusNotFound)
		return
	}
	if isLiveAgentStatus(run.Status) {
		run.Status = "stopped"
	}
	writeJSON(w, agentRunDetail{Run: run, Events: events, EventsTruncated: truncated, EventsHasMore: truncated})
}

func (m *agentManager) getEvents(w http.ResponseWriter, r *http.Request, workspaceID, runID string) {
	workspace, rt, err := m.workspaceRuntime(workspaceID, runID)
	if err != nil {
		writeError(w, err, http.StatusNotFound)
		return
	}
	beforeID, _ := strconv.ParseInt(strings.TrimSpace(r.URL.Query().Get("before")), 10, 64)
	if beforeID > 0 {
		limit, _ := strconv.Atoi(strings.TrimSpace(r.URL.Query().Get("limit")))
		events, hasMore, err := loadAgentEventsPage(workspace.Path, runID, beforeID, limit)
		if err != nil {
			writeError(w, err, http.StatusNotFound)
			return
		}
		writeJSON(w, map[string]any{"events": events, "hasMore": hasMore})
		return
	}
	if rt != nil {
		writeJSON(w, map[string]any{"events": rt.snapshotEvents(), "hasMore": false})
		return
	}
	_, events, truncated, err := loadAgentRunDetail(workspace.Path, runID)
	if err != nil {
		writeError(w, err, http.StatusNotFound)
		return
	}
	writeJSON(w, map[string]any{"events": events, "eventsTruncated": truncated, "hasMore": truncated})
}

func (m *agentManager) sendInput(w http.ResponseWriter, r *http.Request, workspaceID, runID string) {
	_, rt, err := m.workspaceRuntime(workspaceID, runID)
	if err != nil || rt == nil {
		writeError(w, errors.New("run is not active"), http.StatusBadRequest)
		return
	}
	var req agentInputRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	text := strings.TrimSpace(req.Text)
	if text == "" {
		writeError(w, errors.New("text is required"), http.StatusBadRequest)
		return
	}
	if err := rt.sendInput(m, text); err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	writeJSON(w, map[string]string{"status": "accepted"})
}

func (m *agentManager) stopRun(w http.ResponseWriter, r *http.Request, workspaceID, runID string) {
	_, rt, err := m.workspaceRuntime(workspaceID, runID)
	if err != nil || rt == nil {
		writeError(w, errors.New("run is not active"), http.StatusBadRequest)
		return
	}
	rt.stop(m)
	writeJSON(w, map[string]string{"status": "stopped"})
}

func (m *agentManager) resumeRun(w http.ResponseWriter, r *http.Request, workspaceID, runID string) {
	workspace, rt, err := m.workspaceRuntime(workspaceID, runID)
	if err != nil {
		writeError(w, err, http.StatusNotFound)
		return
	}
	if rt != nil {
		rt.mu.Lock()
		detail := agentRunDetail{Run: rt.run, Events: append([]agentEvent(nil), rt.events...)}
		rt.mu.Unlock()
		writeJSON(w, detail)
		return
	}
	run, events, _, err := loadAgentRunDetail(workspace.Path, runID)
	if err != nil {
		writeError(w, err, http.StatusNotFound)
		return
	}
	if strings.TrimSpace(run.CodexThreadID) == "" {
		writeError(w, errors.New("run cannot be resumed because it has no Codex thread id"), http.StatusBadRequest)
		return
	}
	forgeSessionID, err := m.createForgeSession(r.Context(), workspace, run.ID)
	if err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	now := time.Now().Format(time.RFC3339)
	run.ForgeSessionID = forgeSessionID
	run.CodexTurnID = ""
	run.Status = "starting"
	run.UpdatedAt = now
	rt = &agentRuntime{
		workspace:   workspace,
		run:         run,
		events:      append([]agentEvent(nil), events...),
		nextEventID: nextAgentEventID(events),
		pending:     make(map[string]pendingApproval),
		done:        make(chan struct{}),
	}
	m.registerRuntime(rt)
	registered := true
	cleanup := func() {
		if registered {
			m.removeRuntime(run.ID)
			registered = false
		}
		removeForgeSessionContextFile(run.ForgeSessionContextPath, run.ForgeSessionID)
		_ = m.endForgeSession(context.Background(), workspace, forgeSessionID)
	}
	if err := m.lockForgeSession(r.Context(), workspace, forgeSessionID, run.ResourceID); err != nil {
		cleanup()
		writeError(w, err, http.StatusBadRequest)
		return
	}
	contextPath, err := m.writeForgeSessionContext(r.Context(), workspace, run)
	if err != nil {
		cleanup()
		writeError(w, err, http.StatusInternalServerError)
		return
	}
	run.ForgeSessionContextPath = contextPath
	rt.setRun(run)
	if err := saveAgentRun(workspace.Path, run); err != nil {
		cleanup()
		writeError(w, err, http.StatusInternalServerError)
		return
	}
	registered = false
	rt.addEvent(m, "system", "session/resume", "Resuming Codex session.", nil, "")
	if forgeSessionID != "" {
		rt.addEvent(m, "system", "forge/session/new", fmt.Sprintf("Forge session created: %s", forgeSessionID), nil, "")
	}
	go rt.startCodex(m, "")
	writeJSON(w, agentRunDetail{Run: run, Events: rt.snapshotEvents()})
}

func (m *agentManager) resolveApproval(w http.ResponseWriter, r *http.Request, workspaceID, runID string) {
	_, rt, err := m.workspaceRuntime(workspaceID, runID)
	if err != nil || rt == nil {
		writeError(w, errors.New("run is not active"), http.StatusBadRequest)
		return
	}
	var req agentApprovalRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	if err := rt.resolveApproval(m, req.RequestID, req.Decision); err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	writeJSON(w, map[string]string{"status": "resolved"})
}

func (m *agentManager) stream(w http.ResponseWriter, r *http.Request, workspaceID, runID string) {
	workspace, rt, err := m.workspaceRuntime(workspaceID, runID)
	if err != nil {
		writeError(w, err, http.StatusNotFound)
		return
	}
	flusher, ok := w.(http.Flusher)
	if !ok {
		writeError(w, errors.New("streaming is not supported"), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	ch := make(chan agentEvent, 64)
	m.subscribe(runID, ch)
	defer m.unsubscribe(runID, ch)
	var events []agentEvent
	if rt != nil {
		events = rt.snapshotEvents()
	} else {
		_, events, _, _ = loadAgentRunDetail(workspace.Path, runID)
	}
	for _, event := range events {
		writeSSE(w, event)
	}
	flusher.Flush()
	if rt == nil {
		return
	}
	for {
		select {
		case event := <-ch:
			writeSSE(w, event)
			flusher.Flush()
		case <-r.Context().Done():
			return
		}
	}
}

func (m *agentManager) workspaceRuntime(workspaceID, runID string) (guiWorkspace, *agentRuntime, error) {
	workspace, err := m.server.workspace(workspaceID)
	if err != nil {
		return guiWorkspace{}, nil, err
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	rt := m.runtimes[runID]
	if rt != nil && rt.workspace.ID != workspaceID {
		return guiWorkspace{}, nil, errors.New("run belongs to another workspace")
	}
	return workspace, rt, nil
}

func (m *agentManager) subscribe(runID string, ch chan agentEvent) {
	m.mu.Lock()
	defer m.mu.Unlock()
	if m.subscribers[runID] == nil {
		m.subscribers[runID] = make(map[chan agentEvent]bool)
	}
	m.subscribers[runID][ch] = true
}

func (m *agentManager) unsubscribe(runID string, ch chan agentEvent) {
	m.mu.Lock()
	defer m.mu.Unlock()
	delete(m.subscribers[runID], ch)
	close(ch)
}

func (m *agentManager) publish(runID string, event agentEvent) {
	m.mu.Lock()
	defer m.mu.Unlock()
	for ch := range m.subscribers[runID] {
		select {
		case ch <- event:
		default:
		}
	}
}

func (m *agentManager) runtimeByThreadID(threadID string) *agentRuntime {
	m.mu.Lock()
	defer m.mu.Unlock()
	for _, rt := range m.runtimes {
		rt.mu.Lock()
		matches := rt.run.CodexThreadID == threadID
		rt.mu.Unlock()
		if matches {
			return rt
		}
	}
	return nil
}

func (rt *agentRuntime) startCodex(m *agentManager, prompt string) {
	defer func() {
		rt.removeForgeSessionContext()
		if err := m.endForgeSession(context.Background(), rt.workspace, rt.run.ForgeSessionID); err != nil {
			rt.addEvent(m, "error", "forge/session/end", err.Error(), nil, "")
		} else if rt.run.ForgeSessionID != "" {
			rt.addEvent(m, "system", "forge/session/end", "Forge session ended.", nil, "")
		}
		m.removeRuntime(rt.run.ID)
	}()
	client, err := startCodexClient(m, rt)
	if err != nil {
		rt.addEvent(m, "error", "", err.Error(), nil, "")
		rt.updateStatus(m, "failed")
		return
	}
	rt.mu.Lock()
	rt.client = client
	rt.mu.Unlock()
	threadParams := map[string]any{
		"cwd":               rt.run.Cwd,
		"sandbox":           rt.run.Sandbox,
		"approvalPolicy":    rt.run.Approval,
		"approvalsReviewer": "user",
		"threadSource":      "api",
	}
	if rt.run.Model != "" {
		threadParams["model"] = rt.run.Model
	}
	existingThreadID := strings.TrimSpace(rt.run.CodexThreadID)
	method := "thread/start"
	if existingThreadID != "" {
		method = "thread/resume"
		threadParams["threadId"] = existingThreadID
		delete(threadParams, "threadSource")
	}
	result, err := client.request(method, threadParams)
	if err != nil {
		rt.addEvent(m, "error", "", fmt.Sprintf("%s failed: %v", method, err), nil, "")
		rt.updateStatus(m, "failed")
		return
	}
	threadID := firstString(result, "threadId", "id")
	if threadID == "" {
		threadID = nestedString(result, "thread", "id")
	}
	if threadID == "" {
		threadID = existingThreadID
	}
	rt.mu.Lock()
	rt.run.CodexThreadID = threadID
	rt.run.Status = "running"
	rt.run.UpdatedAt = time.Now().Format(time.RFC3339)
	run := rt.run
	rt.mu.Unlock()
	_ = saveAgentRun(rt.workspace.Path, run)
	rt.addEvent(m, "system", method, codexThreadReadyText(method), result, "")

	if strings.TrimSpace(prompt) == "" {
		rt.addEvent(m, "system", "session/ready", "Codex session is ready and waiting for input.", nil, "")
		rt.markIdle(m)
	} else {
		if err := rt.startTurn(m, prompt); err != nil {
			rt.addEvent(m, "error", "turn/start", err.Error(), nil, "")
			rt.updateStatus(m, "failed")
		}
	}
	select {
	case <-rt.done:
	case <-client.done:
	}
	rt.mu.Lock()
	status := rt.run.Status
	rt.mu.Unlock()
	if status == "running" || status == "waiting_approval" || status == "starting" {
		rt.updateStatus(m, "stopped")
	}
}

func (rt *agentRuntime) withForgeSessionContext(text string) string {
	rt.mu.Lock()
	sessionID := strings.TrimSpace(rt.run.ForgeSessionID)
	contextPath := strings.TrimSpace(rt.run.ForgeSessionContextPath)
	rt.mu.Unlock()
	if sessionID == "" {
		return text
	}
	var b strings.Builder
	b.WriteString("Forge session context:\n")
	b.WriteString("- This Codex run is managed by Forge GUI.\n")
	b.WriteString("- FORGE_SESSION_ID=")
	b.WriteString(sessionID)
	b.WriteString("\n")
	if contextPath != "" {
		b.WriteString("- Session context file: ")
		b.WriteString(contextPath)
		b.WriteString("\n")
	}
	b.WriteString("- If the process environment does not contain FORGE_SESSION_ID, use this id explicitly for `forge session` commands instead of creating another Forge session.\n\n")
	b.WriteString("User request:\n")
	b.WriteString(text)
	return b.String()
}

func (rt *agentRuntime) startTurn(m *agentManager, text string) error {
	rt.mu.Lock()
	client := rt.client
	threadID := rt.run.CodexThreadID
	model := rt.run.Model
	approval := rt.run.Approval
	cwd := rt.run.Cwd
	rt.mu.Unlock()
	if client == nil || threadID == "" {
		return errors.New("codex thread is not ready")
	}
	text = rt.withForgeSessionContext(text)
	params := map[string]any{
		"threadId":       threadID,
		"cwd":            cwd,
		"approvalPolicy": approval,
		"input":          []map[string]string{{"type": "text", "text": text}},
	}
	if model != "" {
		params["model"] = model
	}
	_, err := client.request("turn/start", params)
	return err
}

func (rt *agentRuntime) sendInput(m *agentManager, text string) error {
	rt.addEvent(m, "user", "", text, nil, "")
	rt.mu.Lock()
	client := rt.client
	threadID := rt.run.CodexThreadID
	turnID := rt.run.CodexTurnID
	status := rt.run.Status
	rt.mu.Unlock()
	if client == nil || threadID == "" {
		return errors.New("codex run is not ready")
	}
	if status == "waiting_approval" {
		return errors.New("approval is required before sending more input")
	}
	if status == "running" && turnID != "" {
		_, err := client.request("turn/steer", map[string]any{
			"threadId":       threadID,
			"expectedTurnId": turnID,
			"input":          []map[string]string{{"type": "text", "text": rt.withForgeSessionContext(text)}},
		})
		return err
	}
	rt.updateStatus(m, "running")
	return rt.startTurn(m, text)
}

func (rt *agentRuntime) stop(m *agentManager) {
	rt.mu.Lock()
	client := rt.client
	threadID := rt.run.CodexThreadID
	turnID := rt.run.CodexTurnID
	rt.mu.Unlock()
	if client != nil && threadID != "" && turnID != "" {
		_, _ = client.request("turn/interrupt", map[string]any{"threadId": threadID, "turnId": turnID})
	}
	rt.addEvent(m, "system", "turn/interrupt", "Stop requested.", nil, "")
	rt.updateStatus(m, "stopped")
	rt.signalDone()
}

func (rt *agentRuntime) resolveApproval(m *agentManager, requestID, decision string) error {
	requestID = strings.TrimSpace(requestID)
	decision = strings.TrimSpace(decision)
	if requestID == "" {
		return errors.New("requestId is required")
	}
	rt.mu.Lock()
	pending, ok := rt.pending[requestID]
	client := rt.client
	delete(rt.pending, requestID)
	rt.mu.Unlock()
	if !ok || client == nil {
		return fmt.Errorf("approval request not found: %s", requestID)
	}
	response := approvalResponse(pending.method, decision)
	if err := client.respond(pending.id, response); err != nil {
		return err
	}
	rt.addEvent(m, "approval_resolved", pending.method, fmt.Sprintf("Approval %s: %s", requestID, decision), mustJSON(response), "")
	rt.updateStatus(m, "running")
	return nil
}

func (rt *agentRuntime) handleServerRequest(client *codexClient, id json.RawMessage, method string, params json.RawMessage) {
	if isApprovalMethod(method) {
		requestID := string(id)
		rt.mu.Lock()
		rt.pending[requestID] = pendingApproval{id: append(json.RawMessage(nil), id...), method: method}
		rt.run.Status = "waiting_approval"
		rt.run.UpdatedAt = time.Now().Format(time.RFC3339)
		run := rt.run
		rt.mu.Unlock()
		_ = saveAgentRun(rt.workspace.Path, run)
		rt.addEvent(client.manager, "approval_requested", method, approvalSummary(method, params), params, requestID)
		return
	}
	_ = client.respond(id, map[string]any{"error": "unsupported by Forge GUI"})
	rt.addEvent(client.manager, "server_request", method, fmt.Sprintf("Unsupported app-server request: %s", method), params, "")
}

func (rt *agentRuntime) handleNotification(m *agentManager, method string, params json.RawMessage) {
	switch method {
	case "turn/started":
		turnID := nestedString(params, "turn", "id")
		rt.mu.Lock()
		rt.run.CodexTurnID = turnID
		rt.run.Status = "running"
		rt.run.UpdatedAt = time.Now().Format(time.RFC3339)
		run := rt.run
		rt.mu.Unlock()
		_ = saveAgentRun(rt.workspace.Path, run)
		rt.addEvent(m, "system", method, "Turn started.", params, "")
	case "turn/completed":
		rt.addEvent(m, "system", method, "Turn completed.", params, "")
		rt.markIdle(m)
	case "turn/failed", "error":
		rt.addEvent(m, "error", method, eventText(method, params), params, "")
		rt.markIdle(m)
	case "item/agentMessage/delta":
		text, ok := agentMessageDeltaText(params)
		if !ok {
			text = eventText(method, params)
		}
		rt.addEvent(m, "assistant_delta", method, text, params, "")
	case "item/started", "item/completed", "item/updated", "item/commandExecution/outputDelta", "command/exec/outputDelta":
		rt.addEvent(m, "tool", method, eventText(method, params), params, "")
	default:
		rt.addEvent(m, "event", method, eventText(method, params), params, "")
	}
}

func (rt *agentRuntime) addEvent(m *agentManager, eventType, method, text string, data json.RawMessage, pendingRequestID string) {
	rt.mu.Lock()
	event := agentEvent{
		ID:               rt.nextEventID,
		Time:             time.Now().Format(time.RFC3339),
		Type:             eventType,
		Method:           method,
		Text:             text,
		Data:             data,
		PendingRequestID: pendingRequestID,
	}
	rt.nextEventID++
	rt.events = append(rt.events, event)
	rt.run.UpdatedAt = event.Time
	if isAgentOutputEvent(eventType, method) {
		rt.run.LastOutputAt = event.Time
	}
	run := rt.run
	rt.mu.Unlock()
	_ = appendAgentEvent(rt.workspace.Path, run.ID, event)
	_ = saveAgentRun(rt.workspace.Path, run)
	m.publish(run.ID, event)
}

func (rt *agentRuntime) updateStatus(m *agentManager, status string) {
	rt.mu.Lock()
	rt.run.Status = status
	rt.run.UpdatedAt = time.Now().Format(time.RFC3339)
	run := rt.run
	rt.mu.Unlock()
	_ = saveAgentRun(rt.workspace.Path, run)
}

func (rt *agentRuntime) setRun(run agentRun) {
	rt.mu.Lock()
	defer rt.mu.Unlock()
	rt.run = run
}

func isAgentOutputEvent(eventType, method string) bool {
	return eventType == "assistant_delta" ||
		method == "item/commandExecution/outputDelta" ||
		method == "command/exec/outputDelta"
}

func isLiveAgentStatus(status string) bool {
	return status == "starting" || status == "running" || status == "waiting_approval" || status == "idle"
}

func nextAgentEventID(events []agentEvent) int64 {
	var next int64 = 1
	for _, event := range events {
		if event.ID >= next {
			next = event.ID + 1
		}
	}
	return next
}

func codexThreadReadyText(method string) string {
	if method == "thread/resume" {
		return "Codex thread resumed."
	}
	return "Codex thread started."
}

func (rt *agentRuntime) markIdle(m *agentManager) {
	rt.mu.Lock()
	rt.run.Status = "idle"
	rt.run.CodexTurnID = ""
	rt.run.UpdatedAt = time.Now().Format(time.RFC3339)
	run := rt.run
	rt.mu.Unlock()
	_ = saveAgentRun(rt.workspace.Path, run)
}

func (rt *agentRuntime) signalDone() {
	rt.doneOnce.Do(func() {
		close(rt.done)
	})
}

func (rt *agentRuntime) snapshotEvents() []agentEvent {
	rt.mu.Lock()
	defer rt.mu.Unlock()
	return append([]agentEvent(nil), rt.events...)
}

type rpcResponse struct {
	result json.RawMessage
	err    error
}

type codexClient struct {
	manager *agentManager
	cmd     *exec.Cmd
	stdin   io.WriteCloser
	mu      sync.Mutex
	closeMu sync.Mutex
	closed  bool
	nextID  int64
	waiting map[int64]chan rpcResponse
	done    chan struct{}
}

func newCodexClient(m *agentManager, cmd *exec.Cmd, stdin io.WriteCloser) *codexClient {
	return &codexClient{
		manager: m,
		cmd:     cmd,
		stdin:   stdin,
		nextID:  1,
		waiting: make(map[int64]chan rpcResponse),
		done:    make(chan struct{}),
	}
}

func startCodexClient(m *agentManager, rt *agentRuntime) (*codexClient, error) {
	return m.server.codexClient(m)
}

func agentProcessEnv(forgeSessionID string) []string {
	env := os.Environ()
	if forgeSessionID == "" {
		return env
	}
	filtered := make([]string, 0, len(env)+1)
	for _, item := range env {
		if !strings.HasPrefix(item, "FORGE_SESSION_ID=") {
			filtered = append(filtered, item)
		}
	}
	return append(filtered, "FORGE_SESSION_ID="+forgeSessionID)
}

func (c *codexClient) request(method string, params any) (json.RawMessage, error) {
	id, ch := c.nextRequest()
	if err := c.write(map[string]any{"id": id, "method": method, "params": params}); err != nil {
		return nil, err
	}
	select {
	case response := <-ch:
		return response.result, response.err
	case <-time.After(15 * time.Minute):
		return nil, fmt.Errorf("%s timed out", method)
	case <-c.done:
		return nil, errors.New("codex app-server exited")
	}
}

func (c *codexClient) notify(method string, params any) {
	_ = c.write(map[string]any{"method": method, "params": params})
}

func (c *codexClient) respond(id json.RawMessage, result any) error {
	payload, err := json.Marshal(result)
	if err != nil {
		return err
	}
	line := fmt.Sprintf(`{"id":%s,"result":%s}`+"\n", string(id), string(payload))
	c.mu.Lock()
	defer c.mu.Unlock()
	_, err = c.stdin.Write([]byte(line))
	return err
}

func (c *codexClient) close() {
	c.closeMu.Lock()
	if c.closed {
		c.closeMu.Unlock()
		return
	}
	c.closed = true
	c.closeMu.Unlock()
	if c.stdin != nil {
		_ = c.stdin.Close()
	}
	if c.cmd != nil && c.cmd.Process != nil {
		if pgid, err := syscall.Getpgid(c.cmd.Process.Pid); err == nil {
			_ = syscall.Kill(-pgid, syscall.SIGKILL)
			return
		}
		_ = c.cmd.Process.Kill()
	}
}

func (c *codexClient) markClosed() {
	c.closeMu.Lock()
	c.closed = true
	c.closeMu.Unlock()
}

func (c *codexClient) isClosed() bool {
	c.closeMu.Lock()
	defer c.closeMu.Unlock()
	return c.closed
}

func (c *codexClient) nextRequest() (int64, chan rpcResponse) {
	c.mu.Lock()
	defer c.mu.Unlock()
	id := c.nextID
	c.nextID++
	ch := make(chan rpcResponse, 1)
	c.waiting[id] = ch
	return id, ch
}

func (c *codexClient) write(message any) error {
	data, err := json.Marshal(message)
	if err != nil {
		return err
	}
	data = append(data, '\n')
	c.mu.Lock()
	defer c.mu.Unlock()
	_, err = c.stdin.Write(data)
	return err
}

func (c *codexClient) readLoop(stdout io.Reader) {
	scanner := bufio.NewScanner(stdout)
	scanner.Buffer(make([]byte, 0, 64*1024), 8*1024*1024)
	for scanner.Scan() {
		c.handleLine(scanner.Bytes())
	}
	if err := scanner.Err(); err != nil {
		if c.isClosed() || isClosedPipeError(err) {
			return
		}
	}
}

func (c *codexClient) stderrLoop(stderr io.Reader) {
	scanner := bufio.NewScanner(stderr)
	scanner.Buffer(make([]byte, 0, 64*1024), 1024*1024)
	for scanner.Scan() {
		text := strings.TrimSpace(scanner.Text())
		_ = text
	}
}

func (c *codexClient) handleLine(line []byte) {
	var envelope map[string]json.RawMessage
	if err := json.Unmarshal(line, &envelope); err != nil {
		return
	}
	method := rawString(envelope["method"])
	if idRaw, ok := envelope["id"]; ok {
		if method != "" {
			rt := c.runtimeForParams(envelope["params"])
			if rt == nil {
				_ = c.respond(idRaw, map[string]any{"error": "thread is not managed by Forge GUI"})
				return
			}
			rt.handleServerRequest(c, idRaw, method, envelope["params"])
			return
		}
		id, _ := strconv.ParseInt(strings.Trim(string(idRaw), `"`), 10, 64)
		c.mu.Lock()
		ch := c.waiting[id]
		delete(c.waiting, id)
		c.mu.Unlock()
		if ch == nil {
			return
		}
		if errRaw, ok := envelope["error"]; ok && len(errRaw) > 0 {
			ch <- rpcResponse{err: fmt.Errorf("%s", compactJSON(errRaw))}
			return
		}
		ch <- rpcResponse{result: envelope["result"]}
		return
	}
	if method != "" {
		if rt := c.runtimeForParams(envelope["params"]); rt != nil {
			rt.handleNotification(c.manager, method, envelope["params"])
		}
	}
}

func (c *codexClient) runtimeForParams(params json.RawMessage) *agentRuntime {
	threadID := firstString(params, "threadId", "thread_id")
	if threadID == "" {
		threadID = nestedString(params, "thread", "id")
	}
	if threadID == "" || c.manager == nil {
		return nil
	}
	return c.manager.runtimeByThreadID(threadID)
}

func isClosedPipeError(err error) bool {
	if err == nil {
		return false
	}
	if errors.Is(err, os.ErrClosed) {
		return true
	}
	text := strings.ToLower(err.Error())
	return strings.Contains(text, "file already closed") || strings.Contains(text, "use of closed file")
}

func loadAgentRuns(workspacePath string) ([]agentRun, error) {
	agentIndexMu.Lock()
	defer agentIndexMu.Unlock()
	runs, repaired, err := loadAgentRunsLocked(workspacePath)
	if err != nil {
		return nil, err
	}
	if repaired {
		_ = writeAgentRunsIndexLocked(workspacePath, runs)
	}
	return runs, nil
}

func loadAgentRunsLocked(workspacePath string) ([]agentRun, bool, error) {
	data, err := os.ReadFile(agentIndexPath(workspacePath))
	if err != nil {
		if os.IsNotExist(err) {
			return []agentRun{}, false, nil
		}
		return nil, false, err
	}
	var runs []agentRun
	if err := json.Unmarshal(data, &runs); err != nil {
		decoder := json.NewDecoder(bytes.NewReader(data))
		if decodeErr := decoder.Decode(&runs); decodeErr == nil {
			return runs, true, nil
		}
		return nil, false, err
	}
	return runs, false, nil
}

func saveAgentRun(workspacePath string, run agentRun) error {
	agentIndexMu.Lock()
	defer agentIndexMu.Unlock()
	runs, _, err := loadAgentRunsLocked(workspacePath)
	if err != nil {
		return err
	}
	found := false
	for i := range runs {
		if runs[i].ID == run.ID {
			runs[i] = run
			found = true
			break
		}
	}
	if !found {
		runs = append(runs, run)
	}
	sort.SliceStable(runs, func(i, j int) bool {
		return runs[i].UpdatedAt > runs[j].UpdatedAt
	})
	if len(runs) > 50 {
		runs = runs[:50]
	}
	return writeAgentRunsIndexLocked(workspacePath, runs)
}

func writeAgentRunsIndexLocked(workspacePath string, runs []agentRun) error {
	if err := ensureAgentDirs(workspacePath); err != nil {
		return err
	}
	data, err := json.MarshalIndent(runs, "", "  ")
	if err != nil {
		return err
	}
	data = append(data, '\n')
	path := agentIndexPath(workspacePath)
	tmp := path + "." + newRunID() + ".tmp"
	if err := os.WriteFile(tmp, data, 0o644); err != nil {
		return err
	}
	if err := os.Rename(tmp, path); err != nil {
		_ = os.Remove(tmp)
		return err
	}
	return nil
}

func loadAgentRunDetail(workspacePath, runID string) (agentRun, []agentEvent, bool, error) {
	runs, err := loadAgentRuns(workspacePath)
	if err != nil {
		return agentRun{}, nil, false, err
	}
	var run agentRun
	found := false
	for _, item := range runs {
		if item.ID == runID {
			run = item
			found = true
			break
		}
	}
	if !found {
		return agentRun{}, nil, false, fmt.Errorf("run not found: %s", runID)
	}
	events, truncated, err := loadAgentEvents(workspacePath, runID)
	if err != nil {
		return agentRun{}, nil, false, err
	}
	return run, events, truncated, nil
}

func loadAgentEvents(workspacePath, runID string) ([]agentEvent, bool, error) {
	file, err := os.Open(agentEventsPath(workspacePath, runID))
	if err != nil {
		if os.IsNotExist(err) {
			return []agentEvent{}, false, nil
		}
		return nil, false, err
	}
	defer file.Close()
	truncated := false
	if info, err := file.Stat(); err == nil && info.Size() > agentEventTailBytes {
		if _, err := file.Seek(info.Size()-agentEventTailBytes, io.SeekStart); err == nil {
			truncated = true
		}
	}
	var events []agentEvent
	scanner := bufio.NewScanner(file)
	scanner.Buffer(make([]byte, 0, 64*1024), 8*1024*1024)
	if truncated {
		// Discard the first partial line after seeking into the tail window.
		scanner.Scan()
	}
	for scanner.Scan() {
		var event agentEvent
		if err := json.Unmarshal(scanner.Bytes(), &event); err == nil {
			events = append(events, event)
			if len(events) > agentEventMaxCount {
				truncated = true
				events = events[len(events)-agentEventMaxCount:]
			}
		}
	}
	return events, truncated, scanner.Err()
}

func loadAgentEventsPage(workspacePath, runID string, beforeID int64, limit int) ([]agentEvent, bool, error) {
	if limit <= 0 || limit > agentEventMaxCount {
		limit = agentEventMaxCount
	}
	file, err := os.Open(agentEventsPath(workspacePath, runID))
	if err != nil {
		if os.IsNotExist(err) {
			return []agentEvent{}, false, nil
		}
		return nil, false, err
	}
	defer file.Close()
	var events []agentEvent
	hasMore := false
	scanner := bufio.NewScanner(file)
	scanner.Buffer(make([]byte, 0, 64*1024), 8*1024*1024)
	for scanner.Scan() {
		var event agentEvent
		if err := json.Unmarshal(scanner.Bytes(), &event); err != nil {
			continue
		}
		if beforeID > 0 && event.ID >= beforeID {
			continue
		}
		events = append(events, event)
		if len(events) > limit {
			hasMore = true
			events = events[len(events)-limit:]
		}
	}
	return events, hasMore, scanner.Err()
}

func appendAgentEvent(workspacePath, runID string, event agentEvent) error {
	if err := ensureAgentDirs(workspacePath); err != nil {
		return err
	}
	file, err := os.OpenFile(agentEventsPath(workspacePath, runID), os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0o644)
	if err != nil {
		return err
	}
	defer file.Close()
	data, err := json.Marshal(event)
	if err != nil {
		return err
	}
	_, err = file.Write(append(data, '\n'))
	return err
}

func ensureAgentDirs(workspacePath string) error {
	return os.MkdirAll(filepath.Join(agentRoot(workspacePath), "runs"), 0o755)
}

func agentRoot(workspacePath string) string {
	return filepath.Join(workspacePath, ".forge", "gui-agent")
}

func agentIndexPath(workspacePath string) string {
	return filepath.Join(agentRoot(workspacePath), "runs.json")
}

func agentEventsPath(workspacePath, runID string) string {
	return filepath.Join(agentRoot(workspacePath), "runs", runID+".jsonl")
}

func agentCwd(workspacePath, requested string) (string, error) {
	requested = strings.TrimSpace(requested)
	if requested == "" {
		return filepath.Abs(workspacePath)
	}
	if filepath.IsAbs(requested) {
		abs, err := filepath.Abs(requested)
		if err != nil {
			return "", err
		}
		if err := ensurePathInside(filepath.Clean(workspacePath), abs); err != nil {
			return "", err
		}
		return abs, nil
	}
	return safeWorkspacePath(workspacePath, requested)
}

func normalizeSandbox(value string) string {
	switch strings.TrimSpace(value) {
	case "read-only", "danger-full-access":
		return strings.TrimSpace(value)
	default:
		return "workspace-write"
	}
}

func normalizeApproval(value string) string {
	switch strings.TrimSpace(value) {
	case "untrusted", "on-request", "never":
		return strings.TrimSpace(value)
	default:
		return "on-request"
	}
}

func newRunID() string {
	var b [8]byte
	if _, err := rand.Read(b[:]); err != nil {
		return fmt.Sprintf("run-%d", time.Now().UnixNano())
	}
	return "run-" + hex.EncodeToString(b[:])
}

func writeSSE(w http.ResponseWriter, event agentEvent) {
	data, _ := json.Marshal(event)
	_, _ = fmt.Fprintf(w, "id: %d\n", event.ID)
	_, _ = fmt.Fprintf(w, "data: %s\n\n", data)
}

func isApprovalMethod(method string) bool {
	return method == "item/commandExecution/requestApproval" ||
		method == "item/fileChange/requestApproval" ||
		method == "item/permissions/requestApproval"
}

func approvalResponse(method, decision string) any {
	decision = strings.TrimSpace(decision)
	if decision == "" {
		decision = "decline"
	}
	switch method {
	case "item/permissions/requestApproval":
		return map[string]any{
			"permissions": map[string]any{},
			"scope":       "turn",
		}
	default:
		if decision != "accept" && decision != "acceptForSession" && decision != "cancel" {
			decision = "decline"
		}
		return map[string]any{"decision": decision}
	}
}

func approvalSummary(method string, params json.RawMessage) string {
	switch method {
	case "item/commandExecution/requestApproval":
		if command := firstString(params, "command"); command != "" {
			return "Approve command: " + command
		}
	case "item/fileChange/requestApproval":
		return "Approve file changes."
	case "item/permissions/requestApproval":
		return "Approve additional permissions."
	}
	return "Codex is waiting for approval."
}

func eventText(method string, params json.RawMessage) string {
	for _, key := range []string{"delta", "text", "message", "summary", "status", "command", "path"} {
		if value := firstString(params, key); value != "" {
			return value
		}
	}
	if itemType := nestedString(params, "item", "type"); itemType != "" {
		if status := nestedString(params, "item", "status"); status != "" {
			return itemType + " " + status
		}
		return itemType
	}
	if method != "" {
		return method
	}
	return compactJSON(params)
}

func agentMessageDeltaText(params json.RawMessage) (string, bool) {
	var value struct {
		Delta *string `json:"delta"`
	}
	if err := json.Unmarshal(params, &value); err != nil || value.Delta == nil {
		return "", false
	}
	return *value.Delta, true
}

func firstString(data json.RawMessage, keys ...string) string {
	var value any
	if err := json.Unmarshal(data, &value); err != nil {
		return ""
	}
	return findString(value, keys...)
}

func nestedString(data json.RawMessage, path ...string) string {
	var value any
	if err := json.Unmarshal(data, &value); err != nil {
		return ""
	}
	current := value
	for _, key := range path {
		obj, ok := current.(map[string]any)
		if !ok {
			return ""
		}
		current = obj[key]
	}
	if text, ok := current.(string); ok {
		return text
	}
	return ""
}

func findString(value any, keys ...string) string {
	switch v := value.(type) {
	case map[string]any:
		for _, key := range keys {
			if text, ok := v[key].(string); ok && strings.TrimSpace(text) != "" {
				return text
			}
		}
		for _, child := range v {
			if text := findString(child, keys...); text != "" {
				return text
			}
		}
	case []any:
		for _, child := range v {
			if text := findString(child, keys...); text != "" {
				return text
			}
		}
	}
	return ""
}

func rawString(raw json.RawMessage) string {
	var value string
	_ = json.Unmarshal(raw, &value)
	return value
}

func compactJSON(raw json.RawMessage) string {
	if len(raw) == 0 {
		return ""
	}
	var value any
	if err := json.Unmarshal(raw, &value); err != nil {
		return string(raw)
	}
	data, err := json.Marshal(value)
	if err != nil {
		return string(raw)
	}
	return string(data)
}

func mustJSON(value any) json.RawMessage {
	data, _ := json.Marshal(value)
	return data
}
