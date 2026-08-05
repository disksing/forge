package serve

import (
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

	"github.com/disksing/forge/internal/app"
)

type agentRun struct {
	ID                      string `json:"id"`
	WorkspaceID             string `json:"workspaceId"`
	ResourceID              string `json:"resourceId,omitempty"`
	AgentProfile            string `json:"agentProfile,omitempty"`
	AgentSelectionReason    string `json:"agentSelectionReason,omitempty"`
	ForgeSessionID          string `json:"forgeSessionId,omitempty"`
	ForgeSessionContextPath string `json:"forgeSessionContextPath,omitempty"`
	AgentHubSessionID       string `json:"agentHubSessionId,omitempty"`
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
	// CompletionCursor is the last durable AgentHub event cursor inspected for
	// a completed turn. CompletionMarker is only advanced from canonical
	// turn.* terminal events, so status projections cannot manufacture a
	// completion. Both fields live in the local run projection and are
	// rebuilt/reconciled from AgentHub's durable event log.
	CompletionCursor    int64  `json:"completionCursor,omitempty"`
	CompletionSessionID string `json:"completionSessionId,omitempty"`
	CompletionEventID   int64  `json:"completionEventId,omitempty"`
	CompletionMarker    string `json:"completionMarker,omitempty"`
	CompletionState     string `json:"completionState,omitempty"`
	CompletionTurnID    string `json:"completionTurnId,omitempty"`
	CompletionAt        string `json:"completionAt,omitempty"`
	CompletionPending   bool   `json:"completionPending,omitempty"`
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
	Notice *forgeNotice
}

type agentUploadResponse struct {
	Path string `json:"path"`
	Name string `json:"name"`
	Size int64  `json:"size"`
}

var agentIndexMu sync.Mutex

type startAgentRequest struct {
	AgentName                    string `json:"agentName"`
	AgentProfile                 string `json:"agentProfile,omitempty"`
	AgentSelectionReason         string `json:"agentSelectionReason,omitempty"`
	ResourceID                   string `json:"resourceId"`
	Title                        string `json:"title"`
	Prompt                       string `json:"prompt"`
	Cwd                          string `json:"cwd"`
	SchedulerTurn                bool   `json:"schedulerTurn,omitempty"`
	AutoRunGeneration            int    `json:"autoRunGeneration,omitempty"`
	QueueAutoRun                 bool   `json:"queueAutoRun,omitempty"`
	ExpectedAutoRunState         string `json:"expectedAutoRunState,omitempty"`
	AutoRunAgentName             string `json:"autoRunAgentName,omitempty"`
	AutoRunAgentNameSet          bool   `json:"autoRunAgentNameSet,omitempty"`
	AutoRunPrompt                string `json:"autoRunPrompt,omitempty"`
	AutoRunPromptSet             bool   `json:"autoRunPromptSet,omitempty"`
	AutoRunCompletionCriteria    string `json:"autoRunCompletionCriteria,omitempty"`
	AutoRunCompletionCriteriaSet bool   `json:"autoRunCompletionCriteriaSet,omitempty"`
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

type agentRuntime struct {
	mu                     sync.Mutex
	turnActionMu           sync.Mutex
	workspace              guiWorkspace
	manager                *agentManager
	run                    agentRun
	agentHub               *agentHubClient
	agentHubState          string
	agentHubStopRequested  bool
	schedulerTurnFinishing bool
	archivedProofFailed    bool
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
	if err := m.server.requireResourceNotExternallyLocked(workspace, run.ResourceID); err != nil {
		writeResourceOperationError(w, err, http.StatusBadRequest)
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
	_ = ctx
	endpoint, err := effectiveAgentHubEndpoint(cfg.AgentHubEndpoint)
	if err != nil {
		return "", err
	}
	sourceExternalID := strings.TrimSpace(run.SourceExternalID)
	if sourceExternalID == "" {
		sourceExternalID = workspace.ID + "/" + run.ID
	}
	forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		return "", err
	}
	session, err := forgeWorkspace.CreateSession(app.SessionLiveness{
		Type: "agenthub", Endpoint: endpoint, SourceApp: "forge",
		SourceInstanceID: cfg.AgentHubInstanceID, SourceExternalID: sourceExternalID,
		StartingGrace: "30s",
	})
	if err != nil {
		return "", err
	}
	sessionID := strings.TrimSpace(session.ID)
	if sessionID == "" {
		return "", errors.New("forge session new returned an empty id")
	}
	return sessionID, nil
}

func (m *agentManager) bindForgeSessionAgentHub(ctx context.Context, workspace guiWorkspace, forgeSessionID, agentHubSessionID string) error {
	_ = ctx
	if strings.TrimSpace(forgeSessionID) == "" || strings.TrimSpace(agentHubSessionID) == "" {
		return errors.New("Forge and AgentHub session ids are required")
	}
	forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		return err
	}
	_, err = forgeWorkspace.BindAgentHubSession(forgeSessionID, agentHubSessionID)
	return err
}

func (m *agentManager) lockForgeSession(ctx context.Context, workspace guiWorkspace, sessionID, resourceID string) error {
	_ = ctx
	if resourceID == "" {
		return nil
	}
	forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		return err
	}
	_, err = forgeWorkspace.LockSession(sessionID, resourceID)
	return err
}

func (m *agentManager) startAutoRun(ctx context.Context, workspace guiWorkspace, run agentRun) error {
	_ = ctx
	forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		return err
	}
	_, err = forgeWorkspace.StartAutoRun(run.ResourceID)
	return err
}

func (m *agentManager) endForgeSession(ctx context.Context, workspace guiWorkspace, sessionID string) error {
	_ = ctx
	sessionID = strings.TrimSpace(sessionID)
	if sessionID == "" {
		return nil
	}
	forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		return err
	}
	_, err = forgeWorkspace.EndSession(sessionID)
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
	_ = ctx
	resourceID = strings.TrimSpace(resourceID)
	forgeWorkspace, err := app.OpenWorkspace(workspace.Path)
	if err != nil {
		return "", err
	}
	detail, err := forgeWorkspace.Resource(resourceID)
	if err != nil {
		return "", err
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
	workspace, rt, err := m.workspaceRuntime(workspaceID, runID)
	if err != nil || rt == nil {
		writeError(w, errors.New("run is not active"), http.StatusBadRequest)
		return
	}
	run := rt.snapshotRun()
	if err := m.server.requireResourceNotExternallyLocked(workspace, run.ResourceID); err != nil {
		writeResourceOperationError(w, err, http.StatusBadRequest)
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
	workspace, rt, err := m.workspaceRuntime(workspaceID, runID)
	if err != nil {
		writeError(w, err, http.StatusNotFound)
		return
	}
	if rt != nil {
		m.stopAgentHubRuntime(w, r, rt)
		return
	}
	run, err := loadAgentRun(workspace.Path, runID)
	if err != nil || !isAgentHubRun(run) || strings.TrimSpace(run.AgentHubSessionID) != "" {
		// An attached run needs its live runtime to drive the AgentHub stop.
		writeError(w, errors.New("run is not active"), http.StatusBadRequest)
		return
	}
	m.stopUnattachedAgentHubRun(w, r, workspace, run, nil)
}

func (m *agentManager) resumeRun(w http.ResponseWriter, r *http.Request, workspaceID, runID string) {
	workspace, rt, err := m.workspaceRuntime(workspaceID, runID)
	if err != nil {
		writeError(w, err, http.StatusNotFound)
		return
	}
	if rt != nil {
		run := rt.snapshotRun()
		if err := m.server.requireResourceNotExternallyLocked(workspace, run.ResourceID); err != nil {
			writeResourceOperationError(w, err, http.StatusBadRequest)
			return
		}
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
	if err := m.server.requireResourceNotExternallyLocked(workspace, run.ResourceID); err != nil {
		writeResourceOperationError(w, err, http.StatusBadRequest)
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
			return fmt.Errorf("AgentHub message outcome may be unknown; it was not retried: %w", err)
		}
		rt.applyAgentHubSessionState(m, session)
		return nil
	}
	return errors.New("agent run is not attached to AgentHub")
}

// handleTurnFinished records the durable terminal event before allowing an
// AutoRun scheduler turn to decide whether it should continue. This ordering
// makes a completion observed by the poller, recovery, or an action response
// use one idempotent path.
func (rt *agentRuntime) handleTurnFinished(m *agentManager, session agentHubSession) {
	rt.prepareTurnCompletion(session)
	rt.markTurnCompletionPending()
	rt.recordTurnCompletion(session)
	if rt.isSchedulerTurn() {
		rt.finishSchedulerTurn(m)
	}
}

func (rt *agentRuntime) markTurnCompletionPending() {
	rt.mu.Lock()
	rt.run.CompletionPending = true
	run := rt.run
	rt.mu.Unlock()
	_ = saveAgentRun(rt.workspace.Path, run)
}

func (rt *agentRuntime) prepareTurnCompletion(session agentHubSession) {
	sessionID := strings.TrimSpace(session.ID)
	if sessionID == "" {
		return
	}
	rt.mu.Lock()
	if rt.run.CompletionSessionID != sessionID {
		// This path is entered only after an active -> ready/stopped edge, so
		// inspect the new session from its beginning instead of baselining away
		// the just-finished turn.
		rt.run.CompletionSessionID = sessionID
		rt.run.CompletionCursor = 0
		rt.run.CompletionEventID = 0
		rt.run.CompletionMarker = ""
		rt.run.CompletionState = ""
		rt.run.CompletionTurnID = ""
		rt.run.CompletionAt = ""
		rt.run.CompletionPending = false
		rt.run.AgentHubSessionID = sessionID
	}
	run := rt.run
	rt.mu.Unlock()
	_ = saveAgentRun(rt.workspace.Path, run)
}

func (rt *agentRuntime) recordTurnCompletion(session agentHubSession) {
	sessionID := strings.TrimSpace(session.ID)
	if sessionID == "" {
		return
	}
	rt.mu.Lock()
	client := rt.agentHub
	run := rt.run
	rt.mu.Unlock()
	if client == nil || strings.TrimSpace(run.AgentHubSessionID) != sessionID {
		return
	}

	// A resumed run may be attached to a fresh AgentHub session whose event
	// cursor starts at one again. The first observation is a baseline, never a
	// historical notification.
	if run.CompletionSessionID != sessionID {
		run.CompletionSessionID = sessionID
		run.CompletionCursor = session.LastEventID
		run.CompletionEventID = 0
		run.CompletionMarker = ""
		run.CompletionState = ""
		run.CompletionTurnID = ""
		run.CompletionAt = ""
		run.CompletionPending = false
		rt.setRun(run)
		_ = saveAgentRun(rt.workspace.Path, run)
		return
	}
	if session.LastEventID <= run.CompletionCursor {
		// The session projection already covers the durable event cursor. This
		// keeps terminal/stopped recovery lightweight while still retrying a
		// completion whose cursor advanced before a prior history read failed.
		if run.CompletionPending {
			run.CompletionPending = false
			rt.setRun(run)
			_ = saveAgentRun(rt.workspace.Path, run)
		}
		return
	}

	cursor := run.CompletionCursor
	history := make([]agentHubEvent, 0)
	latestCursor := cursor
	for {
		events, durableCursor, err := client.SessionEvents(context.Background(), sessionID, cursor, 500)
		if err != nil {
			// The next poll/reconcile retries from the same durable cursor. A
			// transient history failure must not invent a completion or advance
			// the marker past an unexamined event.
			return
		}
		if durableCursor > latestCursor {
			latestCursor = durableCursor
		}
		previousCursor := cursor
		for _, event := range events {
			if event.ID <= cursor {
				continue
			}
			if event.ID != cursor+1 {
				// Do not advance over a cursor gap. AgentHub promises lossless
				// replay; retaining the old cursor lets a later reconcile retry
				// instead of manufacturing a marker from incomplete history.
				return
			}
			cursor = event.ID
			history = append(history, event)
		}
		if cursor == previousCursor && cursor < durableCursor {
			// A lossless replay must make progress. Keep the durable cursor
			// unchanged when an upstream response violates that contract so a
			// later poll can retry instead of skipping an unexamined event.
			return
		}
		if len(events) < 500 || cursor >= durableCursor {
			break
		}
	}
	if latestCursor < cursor {
		latestCursor = cursor
	}
	// The history is applied from the current runtime snapshot so a duplicate
	// poll/reconcile cannot overwrite a newer marker discovered concurrently.
	rt.recordTurnCompletionHistory(session, history, latestCursor)
}

func (rt *agentRuntime) recordTurnCompletionHistory(session agentHubSession, history []agentHubEvent, latestCursor int64) {
	sessionID := strings.TrimSpace(session.ID)
	if sessionID == "" {
		return
	}
	rt.mu.Lock()
	run := rt.run
	if strings.TrimSpace(run.AgentHubSessionID) != sessionID {
		rt.mu.Unlock()
		return
	}
	if run.CompletionSessionID != sessionID {
		run.CompletionSessionID = sessionID
		run.CompletionCursor = 0
		run.CompletionEventID = 0
		run.CompletionMarker = ""
		run.CompletionState = ""
		run.CompletionTurnID = ""
		run.CompletionAt = ""
	}
	cursor := run.CompletionCursor
	latestTerminal := agentHubEvent{}
	for _, event := range history {
		if event.ID <= cursor {
			continue
		}
		cursor = event.ID
		if isAgentHubTurnTerminal(event.Type) && event.ID > latestTerminal.ID {
			latestTerminal = event
		}
	}
	if latestCursor > cursor {
		cursor = latestCursor
	}
	run.CompletionCursor = cursor
	if latestTerminal.ID > run.CompletionEventID {
		run.CompletionEventID = latestTerminal.ID
		run.CompletionMarker = sessionID + ":" + strconv.FormatInt(latestTerminal.ID, 10)
		run.CompletionState = strings.TrimPrefix(latestTerminal.Type, "turn.")
		run.CompletionTurnID = latestTerminal.TurnID
		run.CompletionAt = latestTerminal.Time
	}
	run.CompletionPending = false
	rt.run = run
	rt.mu.Unlock()
	_ = saveAgentRun(rt.workspace.Path, run)
}

func (rt *agentRuntime) completionHistoryPending(session agentHubSession) bool {
	sessionID := strings.TrimSpace(session.ID)
	if sessionID == "" || session.LastEventID <= 0 {
		return false
	}
	rt.mu.Lock()
	defer rt.mu.Unlock()
	return rt.run.CompletionPending && rt.run.CompletionSessionID == sessionID && session.LastEventID > rt.run.CompletionCursor
}

func isAgentHubTurnTerminal(eventType string) bool {
	switch eventType {
	case "turn.completed", "turn.failed", "turn.cancelled":
		return true
	default:
		return false
	}
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
	// Serialize the durable AutoRun decision with explicit cancel, Close
	// Session, timed wake, and manual start. The lock order matches the action
	// endpoints: dispatch boundary first, then the runtime turn mutex.
	m.server.autoRunDispatchMu.Lock()
	defer m.server.autoRunDispatchMu.Unlock()
	rt.turnActionMu.Lock()
	defer rt.turnActionMu.Unlock()
	rt.mu.Lock()
	if !rt.run.SchedulerTurn || rt.schedulerTurnFinishing {
		// Duplicate triggers from the session poller and startup recovery are
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
	var taskState string
	var continuation runnableTaskCandidate
	forgeWorkspace, err := app.OpenWorkspace(rt.workspace.Path)
	if err == nil {
		resource, resourceErr := forgeWorkspace.ResourceValue(run.ResourceID)
		err = resourceErr
		if err == nil && resource.Task != nil && resource.Task.AutoRun != nil {
			current := resource.Task.AutoRun
			if current.Generation != run.AutoRunGeneration {
				// A newer generation owns the task now. Never retry or continue it
				// from an older SchedulerTurn.
				taskState = "generation_changed"
			} else {
				taskState = current.State
				if current.State == "running" {
					continuation = runnableTaskCandidate{
						ID: run.ResourceID, Title: resource.Task.Title, Generation: current.Generation,
						State: current.State, AgentName: current.AgentName,
						Prompt:                 current.Prompt,
						PreferredAgentProfiles: append([]string(nil), current.PreferredAgentProfiles...),
						CompletionCriteria:     current.CompletionCriteria,
						WakeCondition:          current.WakeCondition,
						SuspensionSummary:      current.SuspensionSummary,
					}
					updated, retryErr := forgeWorkspace.RetryAutoRun(app.AutoRunActionInput{
						TaskID: run.ResourceID, Reason: "agent did not set AutoRun state",
						ExpectedGeneration: run.AutoRunGeneration, ExpectedState: "running",
					})
					err = retryErr
					if err == nil && updated.AutoRun != nil {
						taskState = updated.AutoRun.State
					}
					if err == nil && taskState == "running" {
						rt.markIdleUnlessStopped(m)
						prompt := autoRunContinuePrompt(rt.workspace.Path, continuation)
						if sendErr := rt.sendInput(m, prompt); sendErr != nil {
							err = sendErr
						}
						return
					}
				}
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
		switch taskState {
		case "completed", "failed":
			rt.addForgeNotice(m, "info", "forge/autorun/finish", "AutoRun reached a terminal state; session retained until manually stopped.")
		case "cancelled":
			// User cancellation is intentionally quiet; the durable task state
			// and the session projection are enough for the UI to converge.
		default:
			// suspended and paused generations intentionally retain the same
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
	forgeWorkspace, err := app.OpenWorkspace(rt.workspace.Path)
	if err == nil {
		resource, readErr := forgeWorkspace.ResourceValue(run.ResourceID)
		err = readErr
		if err == nil && resource.Task != nil && resource.Task.AutoRun != nil && resource.Task.AutoRun.Generation == run.AutoRunGeneration && resource.Task.AutoRun.State == "running" {
			_, err = forgeWorkspace.RetryAutoRun(app.AutoRunActionInput{
				TaskID: run.ResourceID, Reason: strings.TrimSpace(reason),
				ExpectedGeneration: run.AutoRunGeneration, ExpectedState: "running",
			})
		} else if err == nil {
			// Cancellation, a terminal result, or a newer generation owns the
			// task now. Do not append a retry or surface a misleading failure.
			return
		}
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

func (rt *agentRuntime) snapshotRun() agentRun {
	rt.mu.Lock()
	defer rt.mu.Unlock()
	return rt.run
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
	runs, err := loadAgentRunsLocked(workspacePath)
	if err != nil {
		return nil, err
	}
	sortAgentRunsNewestFirst(runs)
	return runs, nil
}

func loadAgentRunsLocked(workspacePath string) ([]agentRun, error) {
	data, err := os.ReadFile(agentIndexPath(workspacePath))
	if err != nil {
		if os.IsNotExist(err) {
			return []agentRun{}, nil
		}
		return nil, err
	}
	var runs []agentRun
	if err := json.Unmarshal(data, &runs); err != nil {
		return nil, err
	}
	return runs, nil
}

func saveAgentRun(workspacePath string, run agentRun) error {
	agentIndexMu.Lock()
	defer agentIndexMu.Unlock()
	runs, err := loadAgentRunsLocked(workspacePath)
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

func writeForgeNoticeSSE(w http.ResponseWriter, notice forgeNotice) {
	data, _ := json.Marshal(notice)
	_, _ = fmt.Fprint(w, "event: forge.notice\n")
	_, _ = fmt.Fprintf(w, "data: %s\n\n", data)
}
