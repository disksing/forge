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
	Provider                string `json:"provider"`
	ProviderSessionID       string `json:"providerSessionId,omitempty"`
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
	SchedulerTurn           bool   `json:"schedulerTurn,omitempty"`
	AutoRunGeneration       int    `json:"autoRunGeneration,omitempty"`
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
	agentUploadMaxBytes = 512 * 1024 * 1024
)

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
	ResumeRunID          string `json:"resumeRunId,omitempty"`
}

type agentInputRequest struct {
	Text              string `json:"text"`
	SchedulerTurn     bool   `json:"schedulerTurn,omitempty"`
	AutoRunGeneration int    `json:"autoRunGeneration,omitempty"`
}

type agentApprovalRequest struct {
	RequestID string `json:"requestId"`
	Decision  string `json:"decision"`
}

type pendingApproval struct {
	id     json.RawMessage
	method string
	params json.RawMessage
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
	mu                sync.Mutex
	workspace         guiWorkspace
	manager           *agentManager
	run               agentRun
	events            []agentEvent
	nextEventID       int64
	provider          agentProvider
	pending           map[string]pendingApproval
	done              chan struct{}
	doneOnce          sync.Once
	stopRequested     bool
	opencodeTerminals map[string]*opencodeTerminal
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
		run, _, _, err = loadAgentRunDetail(workspace.Path, runID)
		if err != nil {
			writeError(w, err, http.StatusNotFound)
			return
		}
	}
	if run.WorkspaceID != workspaceID {
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
			if agentRunMatchesResource(run, resourceID) {
				filtered = append(filtered, run)
			}
		}
		runs = filtered
	}
	writeJSON(w, map[string]any{"runs": runs})
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
	agent, provider, err := m.resolveAgentConfig(req)
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
		ID:                   newRunID(),
		WorkspaceID:          workspace.ID,
		ResourceID:           strings.TrimSpace(req.ResourceID),
		AgentID:              agent.ID,
		AgentProfile:         strings.TrimSpace(req.AgentProfile),
		AgentSelectionReason: strings.TrimSpace(req.AgentSelectionReason),
		Provider:             provider.ID,
		Title:                strings.TrimSpace(req.Title),
		Cwd:                  cwd,
		Status:               "starting",
		CreatedAt:            now,
		UpdatedAt:            now,
		SchedulerTurn:        req.SchedulerTurn,
		AutoRunGeneration:    req.AutoRunGeneration,
	}
	applyAgentRunOptions(&run, agent, provider.Type)
	if resumeID := strings.TrimSpace(req.ResumeRunID); resumeID != "" {
		previous, _, _, loadErr := loadAgentRunDetail(workspace.Path, resumeID)
		if loadErr != nil {
			writeError(w, fmt.Errorf("load resume run: %w", loadErr), http.StatusBadRequest)
			return
		}
		previousProvider := strings.TrimSpace(previous.Provider)
		if previousProvider == "" {
			previousProvider = codexProviderID
		}
		if previousProvider == provider.ID {
			run.CodexThreadID = previous.CodexThreadID
			run.ProviderSessionID = previous.ProviderSessionID
		}
	}
	if run.Title == "" {
		run.Title = provider.Name + " run"
	}
	rt := &agentRuntime{
		workspace:   workspace,
		manager:     m,
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
	if run.SchedulerTurn {
		if err := m.startAutoRun(r.Context(), workspace, run); err != nil {
			cleanup()
			writeError(w, err, http.StatusBadRequest)
			return
		}
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
	rt.addEvent(m, "system", "", "Starting "+provider.Name+" provider.", nil, "")
	if forgeSessionID != "" {
		rt.addEvent(m, "system", "forge/session/new", fmt.Sprintf("Forge session created: %s", forgeSessionID), nil, "")
	}
	go rt.startProvider(m, req.Prompt)
	writeJSON(w, agentRunDetail{Run: run, Events: rt.snapshotEvents()})
}

func applyAgentRunOptions(run *agentRun, agent agentConfig, providerType string) {
	run.Model = agentOption(agent, agentOptionModel)
	if providerType == opencodeProviderID {
		if agentOption(agent, agentOptionMode) == "plan" {
			run.Sandbox = "read-only"
		} else {
			run.Sandbox = "workspace-write"
		}
	} else {
		run.Sandbox = normalizeSandbox(agentOption(agent, agentOptionSandbox))
		run.Approval = normalizeApproval(agentOption(agent, agentOptionApproval))
	}
}

func (m *agentManager) resolveAgentConfig(req startAgentRequest) (agentConfig, agentProviderConfig, error) {
	cfg, err := m.server.loadConfig()
	if err != nil {
		return agentConfig{}, agentProviderConfig{}, err
	}
	agentID := strings.TrimSpace(req.AgentID)
	if agentID == "" {
		agentID = cfg.DefaultChatAgentID
	}
	if agentID == "" {
		return agentConfig{}, agentProviderConfig{}, errors.New("no default agent is configured")
	}
	agent, ok := findAgentConfig(cfg.Agents, agentID)
	if !ok {
		return agentConfig{}, agentProviderConfig{}, fmt.Errorf("agent not found: %s", agentID)
	}
	provider, ok := findAgentProvider(cfg.AgentProviders, agent.ProviderID)
	if !ok {
		return agentConfig{}, agentProviderConfig{}, fmt.Errorf("agent provider not found: %s", agent.ProviderID)
	}
	if !provider.Enabled {
		return agentConfig{}, agentProviderConfig{}, fmt.Errorf("agent provider is disabled: %s", provider.Name)
	}
	if provider.Type != codexProviderID && provider.Type != opencodeProviderID {
		return agentConfig{}, agentProviderConfig{}, fmt.Errorf("unsupported agent provider: %s", provider.Name)
	}
	return agent, provider, nil
}

func findAgentConfig(agents []agentConfig, id string) (agentConfig, bool) {
	id = strings.TrimSpace(id)
	for _, agent := range agents {
		if agent.ID == id {
			return agent, true
		}
	}
	return agentConfig{}, false
}

func findAgentProvider(providers []agentProviderConfig, id string) (agentProviderConfig, bool) {
	id = strings.TrimSpace(id)
	for _, provider := range providers {
		if provider.ID == id {
			return provider, true
		}
	}
	return agentProviderConfig{}, false
}

func (m *agentManager) ensureRunProviderEnabled(run agentRun) error {
	cfg, err := m.server.loadConfig()
	if err != nil {
		return err
	}
	providerID := strings.TrimSpace(run.Provider)
	if providerID == "" {
		providerID = codexProviderID
	}
	provider, ok := findAgentProvider(cfg.AgentProviders, providerID)
	if !ok {
		return fmt.Errorf("agent provider not found: %s", providerID)
	}
	if !provider.Enabled {
		return fmt.Errorf("agent provider is disabled: %s", provider.Name)
	}
	if provider.Type != codexProviderID && provider.Type != opencodeProviderID {
		return fmt.Errorf("unsupported agent provider: %s", provider.Name)
	}
	return nil
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
		run, events, truncated := rt.snapshotDetail()
		detail := agentRunDetail{Run: run, Events: events, EventsTruncated: truncated, EventsHasMore: truncated}
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
		_, events, truncated := rt.snapshotDetail()
		writeJSON(w, map[string]any{"events": events, "eventsTruncated": truncated, "hasMore": truncated})
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
	if req.SchedulerTurn {
		rt.mu.Lock()
		run := rt.run
		if run.Status != "idle" {
			rt.mu.Unlock()
			writeError(w, errors.New("session is busy"), http.StatusConflict)
			return
		}
		run.Status = "starting"
		run.SchedulerTurn = true
		run.AutoRunGeneration = req.AutoRunGeneration
		rt.run = run
		rt.mu.Unlock()
		if err := m.startAutoRun(r.Context(), rt.workspace, run); err != nil {
			rt.mu.Lock()
			rt.run.Status = "idle"
			rt.run.SchedulerTurn = false
			rt.run.AutoRunGeneration = 0
			rt.mu.Unlock()
			writeError(w, err, http.StatusBadRequest)
			return
		}
		_ = saveAgentRun(rt.workspace.Path, run)
	}
	var sendErr error
	if req.SchedulerTurn {
		sendErr = rt.sendSchedulerPrompt(m, text)
	} else {
		sendErr = rt.sendInput(m, text)
	}
	if sendErr != nil {
		if req.SchedulerTurn {
			rt.recordSchedulerFailure(m, sendErr.Error())
			rt.markIdle(m)
		}
		writeError(w, sendErr, http.StatusBadRequest)
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
		run, events, truncated := rt.snapshotDetail()
		detail := agentRunDetail{Run: run, Events: events, EventsTruncated: truncated, EventsHasMore: truncated}
		writeJSON(w, detail)
		return
	}
	run, events, _, err := loadAgentRunDetail(workspace.Path, runID)
	if err != nil {
		writeError(w, err, http.StatusNotFound)
		return
	}
	if strings.TrimSpace(run.ProviderSessionID) == "" && strings.TrimSpace(run.CodexThreadID) == "" {
		writeError(w, errors.New("run cannot be resumed because it has no provider session id"), http.StatusBadRequest)
		return
	}
	if err := m.ensureRunProviderEnabled(run); err != nil {
		writeError(w, err, http.StatusBadRequest)
		return
	}
	if _, err := m.server.providerForRun(run); err != nil {
		writeError(w, err, http.StatusBadRequest)
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
	run.SchedulerTurn = false
	run.AutoRunGeneration = 0
	run.UpdatedAt = now
	rt = &agentRuntime{
		workspace:   workspace,
		manager:     m,
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
	rt.addEvent(m, "system", "session/resume", "Resuming "+providerNameForRun(run)+" session.", nil, "")
	if forgeSessionID != "" {
		rt.addEvent(m, "system", "forge/session/new", fmt.Sprintf("Forge session created: %s", forgeSessionID), nil, "")
	}
	go rt.startProvider(m, "")
	writeJSON(w, agentRunDetail{Run: run, Events: rt.snapshotEvents()})
}

func providerNameForRun(run agentRun) string {
	if run.Provider == "" {
		return codexProviderName
	}
	return run.Provider
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
	afterID := agentStreamAfterID(r)
	lastSentID := afterID
	ch := make(chan agentEvent, agentEventMaxCount)
	m.subscribe(runID, ch)
	defer m.unsubscribe(runID, ch)
	var events []agentEvent
	if rt != nil {
		if afterID > 0 {
			events = rt.snapshotEventsAfter(afterID)
		} else {
			_, events, _ = rt.snapshotDetail()
		}
	} else {
		_, events, _, _ = loadAgentRunDetail(workspace.Path, runID)
		events = agentEventsAfter(events, afterID)
	}
	for _, event := range events {
		if event.ID <= lastSentID {
			continue
		}
		writeSSE(w, event)
		lastSentID = event.ID
	}
	flusher.Flush()
	if rt == nil {
		return
	}
	// Catch events published while the initial snapshot was being written. The
	// subscriber may contain the same events, so the ID guard below deduplicates
	// them while preserving a gap-free handoff from history to live updates.
	for _, event := range rt.snapshotEventsAfter(lastSentID) {
		writeSSE(w, event)
		lastSentID = event.ID
	}
	flusher.Flush()
	for {
		select {
		case event := <-ch:
			if event.ID <= lastSentID {
				continue
			}
			writeSSE(w, event)
			lastSentID = event.ID
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

func (m *agentManager) providerForRun(run agentRun) (agentProvider, error) {
	return m.server.providerForRun(run)
}

func (m *agentManager) runtimeByID(runID string) *agentRuntime {
	m.mu.Lock()
	defer m.mu.Unlock()
	return m.runtimes[runID]
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

func (rt *agentRuntime) startProvider(m *agentManager, prompt string) {
	defer func() {
		rt.mu.Lock()
		provider := rt.provider
		rt.mu.Unlock()
		if provider != nil {
			_ = provider.CloseSession(rt)
		}
		rt.removeForgeSessionContext()
		if err := m.endForgeSession(context.Background(), rt.workspace, rt.run.ForgeSessionID); err != nil {
			rt.addEvent(m, "error", "forge/session/end", err.Error(), nil, "")
		} else if rt.run.ForgeSessionID != "" {
			rt.addEvent(m, "system", "forge/session/end", "Forge session ended.", nil, "")
		}
		m.removeRuntime(rt.run.ID)
	}()
	provider, err := m.providerForRun(rt.run)
	if err != nil {
		rt.addEvent(m, "error", "", err.Error(), nil, "")
		if rt.isSchedulerTurn() {
			rt.recordSchedulerFailure(m, err.Error())
		}
		rt.updateStatus(m, "failed")
		return
	}
	if err := provider.Start(m); err != nil {
		rt.addEvent(m, "error", "", err.Error(), nil, "")
		if rt.isSchedulerTurn() {
			rt.recordSchedulerFailure(m, err.Error())
		}
		rt.updateStatus(m, "failed")
		return
	}
	rt.mu.Lock()
	rt.provider = provider
	rt.mu.Unlock()
	existingSessionID := strings.TrimSpace(rt.run.ProviderSessionID)
	if existingSessionID == "" {
		existingSessionID = strings.TrimSpace(rt.run.CodexThreadID)
	}
	if existingSessionID != "" {
		err = provider.ResumeSession(rt)
	} else {
		err = provider.NewSession(rt)
	}
	if err != nil {
		rt.addEvent(m, "error", "", fmt.Sprintf("session start failed: %v", err), nil, "")
		if existingSessionID != "" {
			rt.mu.Lock()
			rt.run.ProviderSessionID = ""
			rt.run.CodexThreadID = ""
			failedRun := rt.run
			rt.mu.Unlock()
			_ = saveAgentRun(rt.workspace.Path, failedRun)
		}
		if rt.isSchedulerTurn() {
			rt.recordSchedulerFailure(m, err.Error())
		}
		rt.updateStatus(m, "failed")
		return
	}
	if strings.TrimSpace(prompt) == "" {
		rt.addEvent(m, "system", "session/ready", providerNameForRun(rt.run)+" session is ready and waiting for input.", nil, "")
		rt.markIdle(m)
	} else {
		if err := rt.sendPrompt(m, prompt); err != nil {
			rt.addEvent(m, "error", "prompt", err.Error(), nil, "")
			if rt.isSchedulerTurn() {
				rt.recordSchedulerFailure(m, err.Error())
			}
			rt.updateStatus(m, "failed")
			rt.signalDone()
		}
	}
	select {
	case <-rt.done:
	case <-provider.Done():
	}
	rt.mu.Lock()
	status := rt.run.Status
	rt.mu.Unlock()
	if status == "running" || status == "waiting_approval" || status == "starting" {
		if rt.isSchedulerTurn() {
			rt.recordSchedulerFailure(m, "Session closed before AutoRun result was submitted")
		}
		rt.updateStatus(m, "stopped")
	}
}

func closedProviderDone() <-chan struct{} {
	ch := make(chan struct{})
	close(ch)
	return ch
}

func (rt *agentRuntime) sendPrompt(m *agentManager, text string) error {
	rt.mu.Lock()
	provider := rt.provider
	rt.mu.Unlock()
	if provider == nil {
		return errors.New("agent provider is not ready")
	}
	return provider.SendPrompt(rt, text)
}

func (rt *agentRuntime) sendInput(m *agentManager, text string) error {
	rt.mu.Lock()
	provider := rt.provider
	status := rt.run.Status
	rt.mu.Unlock()
	if provider == nil {
		return errors.New("agent run is not ready")
	}
	if status == "waiting_approval" {
		return errors.New("approval is required before sending more input")
	}
	if status == "starting" {
		return errors.New("session is starting")
	}
	var err error
	if status == "running" {
		err = provider.SendInput(rt, text)
	} else {
		rt.updateStatus(m, "running")
		err = provider.SendPrompt(rt, text)
		if err != nil {
			rt.updateStatus(m, status)
		}
	}
	if err != nil {
		return err
	}
	rt.addEvent(m, "user", "", text, nil, "")
	return nil
}

func (rt *agentRuntime) sendSchedulerPrompt(m *agentManager, text string) error {
	rt.mu.Lock()
	provider := rt.provider
	if rt.run.Status != "starting" {
		rt.mu.Unlock()
		return errors.New("session is busy")
	}
	rt.run.Status = "running"
	rt.run.UpdatedAt = time.Now().Format(time.RFC3339)
	run := rt.run
	rt.mu.Unlock()
	if provider == nil {
		return errors.New("agent run is not ready")
	}
	_ = saveAgentRun(rt.workspace.Path, run)
	rt.addEvent(m, "user", "", text, nil, "")
	return provider.SendPrompt(rt, text)
}

func (rt *agentRuntime) stop(m *agentManager) bool {
	rt.mu.Lock()
	if rt.stopRequested {
		rt.mu.Unlock()
		return false
	}
	rt.stopRequested = true
	provider := rt.provider
	schedulerTurn := rt.run.SchedulerTurn
	rt.run.SchedulerTurn = false
	rt.run.Status = "stopped"
	rt.run.UpdatedAt = time.Now().Format(time.RFC3339)
	run := rt.run
	rt.mu.Unlock()
	_ = saveAgentRun(rt.workspace.Path, run)
	if schedulerTurn {
		rt.recordSchedulerFailure(m, "Session stopped before AutoRun result was submitted")
	}
	if provider != nil {
		_ = provider.Interrupt(rt)
	}
	rt.addEvent(m, "system", "interrupt", "Stop requested.", nil, "")
	rt.signalDone()
	return true
}

func (rt *agentRuntime) resolveApproval(m *agentManager, requestID, decision string) error {
	requestID = strings.TrimSpace(requestID)
	decision = strings.TrimSpace(decision)
	if requestID == "" {
		return errors.New("requestId is required")
	}
	rt.mu.Lock()
	pending, ok := rt.pending[requestID]
	provider := rt.provider
	rt.mu.Unlock()
	if !ok || provider == nil {
		return fmt.Errorf("approval request not found: %s", requestID)
	}
	response, err := provider.ResolveApproval(pending, decision)
	if err != nil {
		return err
	}
	rt.mu.Lock()
	delete(rt.pending, requestID)
	rt.mu.Unlock()
	rt.addEvent(m, "approval_resolved", pending.method, fmt.Sprintf("Approval %s: %s", requestID, decision), mustJSON(response), "")
	rt.updateStatus(m, "running")
	return nil
}

func (rt *agentRuntime) handleServerRequest(client *codexClient, id json.RawMessage, method string, params json.RawMessage) {
	if isApprovalMethod(method) {
		requestID := string(id)
		rt.mu.Lock()
		rt.pending[requestID] = pendingApproval{id: append(json.RawMessage(nil), id...), method: method}
		if !rt.stopRequested {
			rt.run.Status = "waiting_approval"
		}
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
		if !rt.stopRequested {
			rt.run.Status = "running"
		}
		rt.run.UpdatedAt = time.Now().Format(time.RFC3339)
		run := rt.run
		rt.mu.Unlock()
		_ = saveAgentRun(rt.workspace.Path, run)
		rt.addEvent(m, "system", method, "Turn started.", params, "")
	case "turn/completed":
		rt.addEvent(m, "system", method, "Turn completed.", params, "")
		if rt.isSchedulerTurn() {
			rt.finishSchedulerTurn(m, eventText(method, params))
		} else {
			rt.markIdle(m)
		}
	case "turn/failed", "error":
		rt.addEvent(m, "error", method, eventText(method, params), params, "")
		if rt.isSchedulerTurn() {
			rt.finishSchedulerTurn(m, eventText(method, params))
		} else {
			rt.markIdle(m)
		}
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
	if len(rt.events) > agentEventMaxCount {
		copy(rt.events, rt.events[len(rt.events)-agentEventMaxCount:])
		clear(rt.events[agentEventMaxCount:])
		rt.events = rt.events[:agentEventMaxCount]
	}
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
	if rt.stopRequested && status != "stopped" {
		rt.mu.Unlock()
		return
	}
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

func (rt *agentRuntime) finishSchedulerTurn(m *agentManager, summary string) {
	rt.mu.Lock()
	run := rt.run
	rt.mu.Unlock()
	selector, err := forgeTaskSelectorArgs(run.ResourceID)
	if err == nil {
		args := []string{"task", "autorun", "retry"}
		args = append(args, selector...)
		showArgs := []string{"task", "show"}
		showArgs = append(showArgs, selector...)
		var out []byte
		out, err = m.server.runForge(context.Background(), rt.workspace.Path, showArgs...)
		var task struct {
			AutoRun *struct {
				State string `json:"state"`
			} `json:"autoRun"`
		}
		if err == nil {
			err = json.Unmarshal(out, &task)
		}
		if err == nil && task.AutoRun != nil && task.AutoRun.State == "running" {
			args = append(args, "--reason="+strings.TrimSpace(summary))
			out, err = m.server.runForge(context.Background(), rt.workspace.Path, args...)
			if err == nil {
				_ = json.Unmarshal(out, &task)
			}
			if err == nil && task.AutoRun != nil && task.AutoRun.State == "running" {
				rt.markIdle(m)
				prompt := "Continue the current AutoRun. Before ending this scheduler turn, update the result with forge task autorun complete, wait, pause, or fail as your last side-effecting command."
				if sendErr := rt.sendInput(m, prompt); sendErr != nil {
					err = sendErr
					rt.signalDone()
				}
				return
			}
		}
	}
	if err != nil {
		rt.addEvent(m, "error", "forge/autorun/finish", err.Error(), nil, "")
		rt.updateStatus(m, "failed")
		rt.signalDone()
	} else {
		rt.addEvent(m, "system", "forge/autorun/finish", "AutoRun scheduler turn finished.", nil, "")
		rt.mu.Lock()
		rt.run.SchedulerTurn = false
		rt.mu.Unlock()
		rt.markIdle(m)
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
		rt.addEvent(m, "error", "forge/autorun/retry", err.Error(), nil, "")
	}
}

func (rt *agentRuntime) setRun(run agentRun) {
	rt.mu.Lock()
	defer rt.mu.Unlock()
	rt.run = run
}

func isAgentOutputEvent(eventType, method string) bool {
	return eventType == "assistant_delta" || eventType == "reasoning_delta" ||
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

func (rt *agentRuntime) markIdle(m *agentManager) {
	rt.mu.Lock()
	if !rt.stopRequested {
		rt.run.Status = "idle"
	}
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

func (rt *agentRuntime) snapshotDetail() (agentRun, []agentEvent, bool) {
	rt.mu.Lock()
	defer rt.mu.Unlock()
	events, truncated := tailAgentEvents(rt.events, agentEventMaxCount)
	return rt.run, events, truncated
}

func (rt *agentRuntime) snapshotEventsAfter(afterID int64) []agentEvent {
	rt.mu.Lock()
	defer rt.mu.Unlock()
	return agentEventsAfter(rt.events, afterID)
}

func tailAgentEvents(events []agentEvent, limit int) ([]agentEvent, bool) {
	if limit <= 0 || limit > agentEventMaxCount {
		limit = agentEventMaxCount
	}
	truncated := len(events) > limit
	if len(events) > limit {
		events = events[len(events)-limit:]
	}
	if len(events) > 0 && events[0].ID > 1 {
		truncated = true
	}
	return append([]agentEvent(nil), events...), truncated
}

func agentEventsAfter(events []agentEvent, afterID int64) []agentEvent {
	if afterID <= 0 {
		return append([]agentEvent(nil), events...)
	}
	start := sort.Search(len(events), func(i int) bool {
		return events[i].ID > afterID
	})
	return append([]agentEvent(nil), events[start:]...)
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
