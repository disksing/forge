package main

import (
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
	"path"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"
	"unicode"
)

type agentRun struct {
	ID                      string `json:"id"`
	WorkspaceID             string `json:"workspaceId"`
	ResourceID              string `json:"resourceId,omitempty"`
	AgentID                 string `json:"agentId,omitempty"`
	AgentProfile            string `json:"agentProfile,omitempty"`
	AgentSelectionReason    string `json:"agentSelectionReason,omitempty"`
	ForgeSessionID          string `json:"forgeSessionId,omitempty"`
	ForgeSessionContextPath string `json:"forgeSessionContextPath,omitempty"`
	AgentHubSessionID       string `json:"agentHubSessionId,omitempty"`
	AgentHubEventCursor     int64  `json:"agentHubEventCursor,omitempty"`
	AgentHubAgentName       string `json:"agentHubAgentName,omitempty"`
	SourceExternalID        string `json:"sourceExternalId,omitempty"`
	AgentHubStoppedObserved bool   `json:"agentHubStoppedObserved,omitempty"`
	PendingInitialMessage   string `json:"pendingInitialMessage,omitempty"`
	Title                   string `json:"title"`
	Cwd                     string `json:"cwd"`
	Status                  string `json:"status"`
	CreatedAt               string `json:"createdAt"`
	UpdatedAt               string `json:"updatedAt"`
	LastOutputAt            string `json:"lastOutputAt,omitempty"`
	SchedulerTurn           bool   `json:"schedulerTurn,omitempty"`
	AutoRunGeneration       int    `json:"autoRunGeneration,omitempty"`
}

// agentRunDetail carries run metadata only. Event history is served by the
// AgentHub proxy endpoints and never embedded in detail responses.
type agentRunDetail struct {
	Run agentRun `json:"run"`
}

const (
	agentHubEventMaxCount = 500
	agentUploadMaxBytes   = 512 * 1024 * 1024
)

type forgeNotice struct {
	Source string          `json:"source"`
	Type   string          `json:"type"`
	Time   string          `json:"time"`
	Data   forgeNoticeData `json:"data"`
}

type forgeNoticeData struct {
	Level  string `json:"level"`
	Method string `json:"method"`
	Text   string `json:"text"`
}

type agentStreamMessage struct {
	Event  *agentHubEvent
	Notice *forgeNotice
}

type agentUploadResponse struct {
	Path string `json:"path"`
	Name string `json:"name"`
	Size int64  `json:"size"`
}

var agentIndexMu sync.Mutex

type startAgentRequest struct {
	AgentID              string `json:"agentId"`
	AgentProfile         string `json:"agentProfile,omitempty"`
	AgentSelectionReason string `json:"agentSelectionReason,omitempty"`
	ResourceID           string `json:"resourceId"`
	Title                string `json:"title"`
	Prompt               string `json:"prompt"`
	Cwd                  string `json:"cwd"`
	SchedulerTurn        bool   `json:"schedulerTurn,omitempty"`
	AutoRunGeneration    int    `json:"autoRunGeneration,omitempty"`
}

type agentInputRequest struct {
	Text              string `json:"text"`
	SchedulerTurn     bool   `json:"schedulerTurn,omitempty"`
	AutoRunGeneration int    `json:"autoRunGeneration,omitempty"`
}

type agentApprovalRequest struct {
	RequestID string `json:"requestId"`
	Decision  string `json:"decision"`
	OptionID  string `json:"optionId"`
	Text      string `json:"text"`
}

type forgeSessionContext struct {
	Version           int    `json:"version"`
	WorkspaceID       string `json:"workspaceId"`
	ResourceID        string `json:"resourceId,omitempty"`
	RunID             string `json:"runId"`
	ForgeSessionID    string `json:"forgeSessionId"`
	Cwd               string `json:"cwd"`
	CreatedAt         string `json:"createdAt"`
	AutoRunGeneration int    `json:"autoRunGeneration,omitempty"`
}

type resourceDetailPath struct {
	Path string `json:"path"`
}

type agentRuntime struct {
	mu                     sync.Mutex
	workspace              guiWorkspace
	manager                *agentManager
	run                    agentRun
	events                 []agentHubEvent
	agentHub               *agentHubClient
	agentHubState          string
	agentHubCancel         context.CancelFunc
	agentHubSync           sync.Mutex
	agentHubStreamDone     chan struct{}
	schedulerTurnFinishing bool
}

type agentManager struct {
	server      *server
	mu          sync.Mutex
	runtimes    map[string]*agentRuntime
	subscribers map[string]map[chan agentStreamMessage]bool
}

func newAgentManager(s *server) *agentManager {
	return &agentManager{
		server:      s,
		runtimes:    make(map[string]*agentRuntime),
		subscribers: make(map[string]map[chan agentStreamMessage]bool),
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
	case "uploads":
		if r.Method != http.MethodPost {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		m.uploadFile(w, r, workspaceID, runID)
	case "stop":
		if r.Method != http.MethodPost {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		m.stopRun(w, r, workspaceID, runID)
	case "interrupt":
		if r.Method != http.MethodPost {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		m.interruptRun(w, r, workspaceID, runID)
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
		m.proxyAgentHubEvents(w, r, workspaceID, runID)
	case "stream":
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		m.proxyAgentHubStream(w, r, workspaceID, runID)
	default:
		http.NotFound(w, r)
	}
}

func (m *agentManager) uploadFile(w http.ResponseWriter, r *http.Request, workspaceID, runID string) {
	workspace, rt, err := m.workspaceRuntime(workspaceID, runID)
	if err != nil {
		writeError(w, err, http.StatusNotFound)
		return
	}
	var run agentRun
	if rt != nil {
		rt.mu.Lock()
		run = rt.run
		rt.mu.Unlock()
	} else {
		run, err = loadAgentRun(workspace.Path, runID)
		if err != nil {
			writeError(w, err, http.StatusNotFound)
			return
		}
	}
	if run.WorkspaceID != workspaceID || !isAgentHubRun(run) {
		writeError(w, errors.New("run belongs to another workspace"), http.StatusNotFound)
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, agentUploadMaxBytes)
	file, header, err := r.FormFile("file")
	if r.MultipartForm != nil {
		defer r.MultipartForm.RemoveAll()
	}
	if err != nil {
		var maxBytesErr *http.MaxBytesError
		if errors.As(err, &maxBytesErr) {
			writeError(w, fmt.Errorf("file exceeds the %d MiB upload limit", agentUploadMaxBytes/(1024*1024)), http.StatusRequestEntityTooLarge)
			return
		}
		writeError(w, errors.New("multipart field file is required"), http.StatusBadRequest)
		return
	}
	defer file.Close()

	uploadDir, err := secureAgentUploadDir(workspace.Path, run.Cwd)
	if err != nil {
		writeError(w, fmt.Errorf("prepare upload directory: %w", err), http.StatusBadRequest)
		return
	}
	name := safeUploadName(header.Filename)
	destination, storedName, output, err := createUniqueUpload(uploadDir, name)
	if err != nil {
		writeError(w, fmt.Errorf("create upload: %w", err), http.StatusInternalServerError)
		return
	}
	written, copyErr := io.Copy(output, file)
	closeErr := output.Close()
	if copyErr != nil || closeErr != nil {
		_ = os.Remove(destination)
		if copyErr != nil {
			writeError(w, fmt.Errorf("store upload: %w", copyErr), http.StatusInternalServerError)
		} else {
			writeError(w, fmt.Errorf("store upload: %w", closeErr), http.StatusInternalServerError)
		}
		return
	}
	writeJSON(w, agentUploadResponse{
		Path: path.Join("artifacts", "upload", storedName),
		Name: storedName,
		Size: written,
	})
}

func secureAgentUploadDir(workspacePath, cwd string) (string, error) {
	workspaceAbs, err := filepath.Abs(workspacePath)
	if err != nil {
		return "", err
	}
	cwdAbs, err := filepath.Abs(cwd)
	if err != nil {
		return "", err
	}
	if err := ensurePathInside(workspaceAbs, cwdAbs); err != nil {
		return "", err
	}
	workspaceEval, err := filepath.EvalSymlinks(workspaceAbs)
	if err != nil {
		return "", err
	}
	cwdEval, err := filepath.EvalSymlinks(cwdAbs)
	if err != nil {
		return "", err
	}
	if err := ensurePathInside(workspaceEval, cwdEval); err != nil {
		return "", err
	}
	uploadDir := filepath.Join(cwdAbs, "artifacts", "upload")
	if err := os.MkdirAll(uploadDir, 0o755); err != nil {
		return "", err
	}
	uploadEval, err := filepath.EvalSymlinks(uploadDir)
	if err != nil {
		return "", err
	}
	if err := ensurePathInside(cwdEval, uploadEval); err != nil {
		return "", errors.New("upload directory escapes the agent session")
	}
	return uploadEval, nil
}

func safeUploadName(name string) string {
	name = strings.ReplaceAll(name, "\\", "/")
	name = path.Base(name)
	name = strings.Map(func(r rune) rune {
		if unicode.IsControl(r) || strings.ContainsRune(`<>:"/\\|?*`, r) {
			return '_'
		}
		return r
	}, name)
	name = strings.Trim(name, " .")
	if name == "" || name == "." || name == ".." {
		return "upload"
	}
	return name
}

func createUniqueUpload(dir, name string) (string, string, *os.File, error) {
	ext := filepath.Ext(name)
	stem := strings.TrimSuffix(name, ext)
	if stem == "" {
		stem, ext = name, ""
	}
	for index := 1; ; index++ {
		candidate := name
		if index > 1 {
			candidate = fmt.Sprintf("%s (%d)%s", stem, index, ext)
		}
		destination := filepath.Join(dir, candidate)
		file, err := os.OpenFile(destination, os.O_CREATE|os.O_EXCL|os.O_WRONLY, 0o644)
		if err == nil {
			return destination, candidate, file, nil
		}
		if !os.IsExist(err) {
			return "", "", nil, err
		}
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
	filtered := runs[:0]
	m.mu.Lock()
	for _, run := range runs {
		if !isAgentHubRun(run) {
			continue
		}
		if rt := m.runtimes[run.ID]; rt != nil {
			rt.mu.Lock()
			run = rt.run
			rt.mu.Unlock()
		}
		filtered = append(filtered, run)
	}
	m.mu.Unlock()
	runs = filtered
	sortAgentRunsNewestFirst(runs)
	if resourceID != "" {
		filtered := runs[:0]
		for _, run := range runs {
			if agentRunMatchesResource(run, resourceID) {
				filtered = append(filtered, run)
			}
		}
		runs = filtered
	}
	writeJSON(w, map[string]any{"runs": runs})
}

func isAgentHubRun(run agentRun) bool {
	return strings.TrimSpace(run.AgentHubSessionID) != "" || strings.TrimSpace(run.SourceExternalID) != ""
}

func agentRunMatchesResource(run agentRun, resourceID string) bool {
	resourceID = strings.TrimSpace(resourceID)
	if resourceID == "" {
		return true
	}
	if resourceID == "workspace" {
		return strings.TrimSpace(run.ResourceID) == ""
	}
	return run.ResourceID == resourceID
}

func (m *agentManager) createForgeSession(ctx context.Context, workspace guiWorkspace, run agentRun, cfg config) (string, error) {
	endpoint, err := effectiveAgentHubEndpoint(cfg.AgentHubEndpoint)
	if err != nil {
		return "", err
	}
	sourceExternalID := strings.TrimSpace(run.SourceExternalID)
	if sourceExternalID == "" {
		sourceExternalID = workspace.ID + "/" + run.ID
	}
	out, err := m.server.runForge(ctx, workspace.Path,
		"session", "new", "--agenthub",
		"--endpoint", endpoint,
		"--source-instance-id", cfg.AgentHubInstanceID,
		"--source-external-id", sourceExternalID,
		"--starting-grace", "30s",
	)
	if err != nil {
		return "", err
	}
	sessionID := strings.TrimSpace(string(out))
	if sessionID == "" {
		return "", errors.New("forge session new returned an empty id")
	}
	return sessionID, nil
}

func (m *agentManager) bindForgeSessionAgentHub(ctx context.Context, workspace guiWorkspace, forgeSessionID, agentHubSessionID string) error {
	if strings.TrimSpace(forgeSessionID) == "" || strings.TrimSpace(agentHubSessionID) == "" {
		return errors.New("Forge and AgentHub session ids are required")
	}
	_, err := m.server.runForge(ctx, workspace.Path, "session", "bind-agenthub",
		"--id", forgeSessionID, "--agenthub-session-id", agentHubSessionID)
	return err
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

func (m *agentManager) startAutoRun(ctx context.Context, workspace guiWorkspace, run agentRun) error {
	selector, err := forgeTaskSelectorArgs(run.ResourceID)
	if err != nil {
		return err
	}
	args := []string{"task", "autorun", "start"}
	args = append(args, selector...)
	_, err = m.server.runForge(ctx, workspace.Path, args...)
	return err
}

func forgeTaskSelectorArgs(resourceID string) ([]string, error) {
	projectID, taskSuffix, ok := strings.Cut(strings.TrimSpace(resourceID), ".task")
	if !ok || projectID == "" || taskSuffix == "" {
		return nil, fmt.Errorf("AutoRun requires a task resource id: %s", resourceID)
	}
	return []string{"--project", projectID, "--task", "task" + taskSuffix}, nil
}

func (m *agentManager) endForgeSession(ctx context.Context, workspace guiWorkspace, sessionID string) error {
	sessionID = strings.TrimSpace(sessionID)
	if sessionID == "" {
		return nil
	}
	_, err := m.server.runForge(ctx, workspace.Path, "session", "end", "--id", sessionID)
	if err != nil && strings.Contains(err.Error(), "session not found") {
		return nil
	}
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
		Version:           2,
		WorkspaceID:       run.WorkspaceID,
		ResourceID:        resourceID,
		RunID:             run.ID,
		ForgeSessionID:    sessionID,
		Cwd:               run.Cwd,
		CreatedAt:         time.Now().Format(time.RFC3339),
		AutoRunGeneration: run.AutoRunGeneration,
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
		"active": active,
		"status": run.Status,
	})
}

func (m *agentManager) getRun(w http.ResponseWriter, r *http.Request, workspaceID, runID string) {
	workspace, rt, err := m.workspaceRuntime(workspaceID, runID)
	if err != nil {
		writeError(w, err, http.StatusNotFound)
		return
	}
	if rt != nil {
		writeJSON(w, agentRunDetail{Run: rt.snapshotRun()})
		return
	}
	run, err := loadAgentRun(workspace.Path, runID)
	if err != nil || !isAgentHubRun(run) {
		if err == nil {
			err = fmt.Errorf("run not found: %s", runID)
		}
		writeError(w, err, http.StatusNotFound)
		return
	}
	writeJSON(w, agentRunDetail{Run: run})
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
	rt.mu.Lock()
	sessionID := strings.TrimSpace(rt.run.AgentHubSessionID)
	rt.mu.Unlock()
	if sessionID == "" {
		writeError(w, errors.New("run is not attached to AgentHub"), http.StatusBadRequest)
		return
	}
	m.sendAgentHubInput(w, r, rt, req, text)
}

func (m *agentManager) stopRun(w http.ResponseWriter, r *http.Request, workspaceID, runID string) {
	_, rt, err := m.workspaceRuntime(workspaceID, runID)
	if err != nil || rt == nil {
		writeError(w, errors.New("run is not active"), http.StatusBadRequest)
		return
	}
	rt.mu.Lock()
	sessionID := strings.TrimSpace(rt.run.AgentHubSessionID)
	rt.mu.Unlock()
	if sessionID == "" {
		writeError(w, errors.New("run is not attached to AgentHub"), http.StatusBadRequest)
		return
	}
	m.stopAgentHubRun(w, r, rt)
}

func (m *agentManager) resumeRun(w http.ResponseWriter, r *http.Request, workspaceID, runID string) {
	workspace, rt, err := m.workspaceRuntime(workspaceID, runID)
	if err != nil {
		writeError(w, err, http.StatusNotFound)
		return
	}
	if rt != nil {
		run := rt.snapshotRun()
		if strings.TrimSpace(run.AgentHubSessionID) != "" {
			m.resumeAttachedAgentHubRun(w, r, rt)
			return
		}
		writeError(w, errors.New("run is not attached to AgentHub"), http.StatusBadRequest)
		return
	}
	run, err := loadAgentRun(workspace.Path, runID)
	if err != nil {
		writeError(w, err, http.StatusNotFound)
		return
	}
	if strings.TrimSpace(run.AgentHubSessionID) == "" {
		writeError(w, errors.New("run is not attached to AgentHub"), http.StatusBadRequest)
		return
	}
	m.resumeAgentHubRun(w, r, workspace, run)
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
	rt.mu.Lock()
	sessionID := strings.TrimSpace(rt.run.AgentHubSessionID)
	rt.mu.Unlock()
	if sessionID == "" {
		writeError(w, errors.New("run is not attached to AgentHub"), http.StatusBadRequest)
		return
	}
	m.resolveAgentHubApproval(w, r, rt, req)
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

func (m *agentManager) subscribe(runID string, ch chan agentStreamMessage) {
	m.mu.Lock()
	defer m.mu.Unlock()
	if m.subscribers[runID] == nil {
		m.subscribers[runID] = make(map[chan agentStreamMessage]bool)
	}
	m.subscribers[runID][ch] = true
}

func (m *agentManager) unsubscribe(runID string, ch chan agentStreamMessage) {
	m.mu.Lock()
	defer m.mu.Unlock()
	delete(m.subscribers[runID], ch)
	close(ch)
}

func (m *agentManager) publish(runID string, event agentHubEvent) {
	m.mu.Lock()
	defer m.mu.Unlock()
	for ch := range m.subscribers[runID] {
		eventCopy := event
		select {
		case ch <- agentStreamMessage{Event: &eventCopy}:
		default:
		}
	}
}

func (m *agentManager) publishNotice(runID string, notice forgeNotice) {
	m.mu.Lock()
	defer m.mu.Unlock()
	for ch := range m.subscribers[runID] {
		noticeCopy := notice
		select {
		case ch <- agentStreamMessage{Notice: &noticeCopy}:
		default:
		}
	}
}

func (m *agentManager) runtimeByID(runID string) *agentRuntime {
	m.mu.Lock()
	defer m.mu.Unlock()
	return m.runtimes[runID]
}

func (rt *agentRuntime) sendInput(m *agentManager, text string) error {
	rt.mu.Lock()
	client := rt.agentHub
	sessionID := rt.run.AgentHubSessionID
	hubState := rt.agentHubState
	rt.mu.Unlock()
	if client != nil && sessionID != "" {
		session, err := client.Message(context.Background(), sessionID, text, hubState == "busy" || hubState == "waiting_approval")
		if err != nil {
			_ = rt.catchUpAgentHub(context.Background(), m, 0)
			return fmt.Errorf("AgentHub message outcome may be unknown; it was not retried: %w", err)
		}
		return rt.catchUpAgentHub(context.Background(), m, session.LastEventID)
	}
	return errors.New("agent run is not attached to AgentHub")
}

func (rt *agentRuntime) updateStatus(m *agentManager, status string) {
	rt.mu.Lock()
	rt.run.Status = status
	rt.run.UpdatedAt = time.Now().Format(time.RFC3339)
	run := rt.run
	rt.mu.Unlock()
	_ = saveAgentRun(rt.workspace.Path, run)
}

func (rt *agentRuntime) isSchedulerTurn() bool {
	rt.mu.Lock()
	defer rt.mu.Unlock()
	return rt.run.SchedulerTurn
}

func (rt *agentRuntime) finishSchedulerTurn(m *agentManager) {
	rt.mu.Lock()
	if !rt.run.SchedulerTurn || rt.schedulerTurnFinishing {
		// Duplicate triggers from the session poller and the event pipeline are
		// expected; only one finish may run per turn.
		rt.mu.Unlock()
		return
	}
	rt.schedulerTurnFinishing = true
	run := rt.run
	rt.mu.Unlock()
	defer func() {
		rt.mu.Lock()
		rt.schedulerTurnFinishing = false
		rt.mu.Unlock()
	}()
	var task struct {
		AutoRun *struct {
			State string `json:"state"`
		} `json:"autoRun"`
	}
	selector, err := forgeTaskSelectorArgs(run.ResourceID)
	if err == nil {
		args := []string{"task", "autorun", "retry"}
		args = append(args, selector...)
		showArgs := []string{"task", "show"}
		showArgs = append(showArgs, selector...)
		var out []byte
		out, err = m.server.runForge(context.Background(), rt.workspace.Path, showArgs...)
		if err == nil {
			err = json.Unmarshal(out, &task)
		}
		if err == nil && task.AutoRun != nil && task.AutoRun.State == "running" {
			args = append(args, "--reason=agent did not set AutoRun state")
			out, err = m.server.runForge(context.Background(), rt.workspace.Path, args...)
			if err == nil {
				_ = json.Unmarshal(out, &task)
			}
			if err == nil && task.AutoRun != nil && task.AutoRun.State == "running" {
				rt.markIdleUnlessStopped(m)
				prompt := autoRunContinuePrompt(rt.workspace.Path)
				if sendErr := rt.sendInput(m, prompt); sendErr != nil {
					err = sendErr
				}
				return
			}
		}
	}
	if err != nil {
		rt.addForgeNotice(m, "error", "forge/autorun/finish", err.Error())
		rt.updateStatus(m, "failed")
	} else {
		rt.mu.Lock()
		rt.run.SchedulerTurn = false
		run = rt.run
		rt.mu.Unlock()
		_ = saveAgentRun(rt.workspace.Path, run)
		state := ""
		if task.AutoRun != nil {
			state = task.AutoRun.State
		}
		switch state {
		case "completed", "failed":
			rt.addForgeNotice(m, "info", "forge/autorun/finish", "AutoRun reached a terminal state; session retained until manually stopped.")
		default:
			// waiting and paused generations intentionally retain the same
			// AgentHub + Forge session, so a later resume keeps the original
			// launchEnvironment.FORGE_SESSION_ID valid.
			rt.addForgeNotice(m, "info", "forge/autorun/finish", "AutoRun scheduler turn finished; session retained for resume.")
		}
		rt.markIdleUnlessStopped(m)
	}
}

func (rt *agentRuntime) recordSchedulerFailure(m *agentManager, reason string) {
	rt.mu.Lock()
	run := rt.run
	rt.mu.Unlock()
	selector, err := forgeTaskSelectorArgs(run.ResourceID)
	if err == nil {
		args := []string{"task", "autorun", "retry"}
		args = append(args, selector...)
		args = append(args, "--reason="+strings.TrimSpace(reason))
		_, err = m.server.runForge(context.Background(), rt.workspace.Path, args...)
	}
	if err != nil {
		rt.addForgeNotice(m, "error", "forge/autorun/retry", err.Error())
	}
}

func (rt *agentRuntime) setRun(run agentRun) {
	rt.mu.Lock()
	defer rt.mu.Unlock()
	rt.run = run
}

func isLiveAgentStatus(status string) bool {
	return status == "starting" || status == "running" || status == "waiting_approval" ||
		status == "idle" || status == "stopping" || status == "recovering"
}

func (rt *agentRuntime) markIdle(m *agentManager) {
	rt.mu.Lock()
	rt.run.Status = "idle"
	rt.run.UpdatedAt = time.Now().Format(time.RFC3339)
	run := rt.run
	rt.mu.Unlock()
	_ = saveAgentRun(rt.workspace.Path, run)
}

// markIdleUnlessStopped is markIdle for scheduler turn completion: a run with
// a durable stopped observation must not be resurrected to idle, or the Forge
// session release keyed on the stopped status would never fire.
func (rt *agentRuntime) markIdleUnlessStopped(m *agentManager) {
	rt.mu.Lock()
	if rt.run.AgentHubStoppedObserved && rt.run.Status == "stopped" {
		rt.mu.Unlock()
		return
	}
	rt.mu.Unlock()
	rt.markIdle(m)
}

func (rt *agentRuntime) snapshotEvents() []agentHubEvent {
	rt.mu.Lock()
	defer rt.mu.Unlock()
	return append([]agentHubEvent(nil), rt.events...)
}

func (rt *agentRuntime) snapshotRun() agentRun {
	rt.mu.Lock()
	defer rt.mu.Unlock()
	return rt.run
}

func (rt *agentRuntime) snapshotDetail() (agentRun, []agentHubEvent, bool) {
	rt.mu.Lock()
	defer rt.mu.Unlock()
	events, truncated := tailAgentEvents(rt.events, agentHubEventMaxCount)
	return rt.run, events, truncated
}

func (rt *agentRuntime) snapshotEventsAfter(afterID int64) []agentHubEvent {
	rt.mu.Lock()
	defer rt.mu.Unlock()
	return agentHubEventsAfter(rt.events, afterID)
}

func tailAgentEvents(events []agentHubEvent, limit int) ([]agentHubEvent, bool) {
	if limit <= 0 || limit > agentHubEventMaxCount {
		limit = agentHubEventMaxCount
	}
	truncated := len(events) > limit
	if len(events) > limit {
		events = events[len(events)-limit:]
	}
	if len(events) > 0 && events[0].ID > 1 {
		truncated = true
	}
	return append([]agentHubEvent(nil), events...), truncated
}

func agentHubEventsAfter(events []agentHubEvent, afterID int64) []agentHubEvent {
	if afterID <= 0 {
		return append([]agentHubEvent(nil), events...)
	}
	start := sort.Search(len(events), func(i int) bool {
		return events[i].ID > afterID
	})
	return append([]agentHubEvent(nil), events[start:]...)
}

func agentStreamAfterID(r *http.Request) int64 {
	afterID, _ := strconv.ParseInt(strings.TrimSpace(r.URL.Query().Get("after")), 10, 64)
	lastEventID, _ := strconv.ParseInt(strings.TrimSpace(r.Header.Get("Last-Event-ID")), 10, 64)
	if lastEventID > afterID {
		return lastEventID
	}
	return afterID
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
	sortAgentRunsNewestFirst(runs)
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
	sortAgentRunsNewestFirst(runs)
	if len(runs) > 50 {
		runs = runs[:50]
	}
	return writeAgentRunsIndexLocked(workspacePath, runs)
}

func sortAgentRunsNewestFirst(runs []agentRun) {
	sort.SliceStable(runs, func(i, j int) bool {
		left := agentRunRecency(runs[i])
		right := agentRunRecency(runs[j])
		if !left.Equal(right) {
			return left.After(right)
		}
		leftCreated := agentRunTime(runs[i].CreatedAt)
		rightCreated := agentRunTime(runs[j].CreatedAt)
		if !leftCreated.Equal(rightCreated) {
			return leftCreated.After(rightCreated)
		}
		return runs[i].ID > runs[j].ID
	})
}

func agentRunRecency(run agentRun) time.Time {
	if parsed := agentRunTime(run.UpdatedAt); !parsed.IsZero() {
		return parsed
	}
	return agentRunTime(run.CreatedAt)
}

func agentRunTime(value string) time.Time {
	parsed, err := time.Parse(time.RFC3339Nano, strings.TrimSpace(value))
	if err != nil {
		return time.Time{}
	}
	return parsed
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

func loadAgentRun(workspacePath, runID string) (agentRun, error) {
	runs, err := loadAgentRuns(workspacePath)
	if err != nil {
		return agentRun{}, err
	}
	for _, item := range runs {
		if item.ID == runID {
			return item, nil
		}
	}
	return agentRun{}, fmt.Errorf("run not found: %s", runID)
}

func ensureAgentDirs(workspacePath string) error {
	return os.MkdirAll(agentRoot(workspacePath), 0o755)
}

func agentRoot(workspacePath string) string {
	return filepath.Join(workspacePath, ".forge", "gui-agent")
}

func agentIndexPath(workspacePath string) string {
	return filepath.Join(agentRoot(workspacePath), "runs.json")
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

func newRunID() string {
	var b [8]byte
	if _, err := rand.Read(b[:]); err != nil {
		return fmt.Sprintf("run-%d", time.Now().UnixNano())
	}
	return "run-" + hex.EncodeToString(b[:])
}

func writeSSE(w http.ResponseWriter, event agentHubEvent) {
	data, _ := json.Marshal(event)
	_, _ = fmt.Fprintf(w, "id: %d\n", event.ID)
	_, _ = fmt.Fprintf(w, "data: %s\n\n", data)
}

func writeForgeNoticeSSE(w http.ResponseWriter, notice forgeNotice) {
	data, _ := json.Marshal(notice)
	_, _ = fmt.Fprint(w, "event: forge.notice\n")
	_, _ = fmt.Fprintf(w, "data: %s\n\n", data)
}
