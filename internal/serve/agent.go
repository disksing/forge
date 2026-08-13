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
	"reflect"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"
	"unicode"

	"github.com/disksing/forge/internal/app"
)

type agentRun struct {
	// agentRun is the internal persisted generation record. ID is an
	// implementation key only; resource APIs address records by GenerationID.
	ID                   string `json:"id"`
	WorkspaceID          string `json:"workspaceId"`
	ResourceID           string `json:"resourceId,omitempty"`
	Generation           int    `json:"generation,omitempty"`
	GenerationID         string `json:"generationId,omitempty"`
	SourceInstanceID     string `json:"sourceInstanceId,omitempty"`
	BindingKind          string `json:"bindingKind,omitempty"`
	BindingName          string `json:"bindingName,omitempty"`
	ProfileRevision      string `json:"profileRevision,omitempty"`
	ResolvedProfile      string `json:"resolvedProfile,omitempty"`
	AgentConfigError     string `json:"agentConfigError,omitempty"`
	ReplacementPending   bool   `json:"replacementPending,omitempty"`
	AgentProfile         string `json:"agentProfile,omitempty"`
	AgentSelectionReason string `json:"agentSelectionReason,omitempty"`
	// ForgeSessionID is retained only for the unexposed legacy agent-run
	// compatibility path. Resource generations leave it empty and therefore do
	// not serialize a Forge Session address.
	ForgeSessionID          string `json:"forgeSessionId,omitempty"`
	AgentHubSessionID       string `json:"agentHubSessionId,omitempty"`
	AgentHubAgentName       string `json:"agentHubAgentName,omitempty"`
	SourceExternalID        string `json:"sourceExternalId,omitempty"`
	AgentHubStoppedObserved bool   `json:"agentHubStoppedObserved,omitempty"`
	// IdleSinceAt and IdleDeadlineAt are the durable ready-boundary clock for
	// automatic resource Session sleep. They are never derived from the
	// generation projection's UpdatedAt, because ordinary polling must not
	// postpone the deadline.
	IdleSinceAt    string `json:"idleSinceAt,omitempty"`
	IdleDeadlineAt string `json:"idleDeadlineAt,omitempty"`
	// IdleSleepStopRequested is the durable Stop -> stopped -> Archive guard
	// for automatic sleep. It keeps mailbox messages waiting while the old
	// generation is still converging, including across a Forge restart.
	IdleSleepStopRequested bool `json:"idleSleepStopRequested,omitempty"`
	// ArchivedTaskStopRequested is the legacy-named durable progress marker for
	// any archived Project/Task generation stop. It records that reconciliation
	// has entered the Stop -> stopped -> Archive sequence; unknown outcomes are
	// retried until observed rather than treated as terminal.
	ArchivedTaskStopRequested bool                     `json:"archivedTaskStopRequested,omitempty"`
	PendingInitialMessage     string                   `json:"pendingInitialMessage,omitempty"`
	PendingMessages           []resourceInboundMessage `json:"pendingMessages,omitempty"`
	Title                     string                   `json:"title"`
	Cwd                       string                   `json:"cwd"`
	Status                    string                   `json:"status"`
	CreatedAt                 string                   `json:"createdAt"`
	UpdatedAt                 string                   `json:"updatedAt"`
	LastOutputAt              string                   `json:"lastOutputAt,omitempty"`
	// TurnNumber is the durable ordinal of the latest AgentHub turn observed
	// for this generation. LastTurnID survives an idle edge so a Forge restart
	// or repeated session projection cannot count the same turn twice.
	TurnNumber    int    `json:"turnNumber,omitempty"`
	CurrentTurnID string `json:"currentTurnId,omitempty"`
	LastTurnID    string `json:"lastTurnId,omitempty"`
	TurnStartedAt string `json:"turnStartedAt,omitempty"`
	// CompletionCursor is the last durable AgentHub event cursor inspected for
	// a completed turn. CompletionMarker is only advanced from canonical
	// turn.* terminal events, so status projections cannot manufacture a
	// completion. Both fields live in the local generation record and are
	// rebuilt/reconciled from AgentHub's durable event log.
	CompletionCursor    int64  `json:"completionCursor,omitempty"`
	CompletionSessionID string `json:"completionSessionId,omitempty"`
	CompletionEventID   int64  `json:"completionEventId,omitempty"`
	CompletionMarker    string `json:"completionMarker,omitempty"`
	CompletionState     string `json:"completionState,omitempty"`
	CompletionTurnID    string `json:"completionTurnId,omitempty"`
	CompletionAt        string `json:"completionAt,omitempty"`
	CompletionPending   bool   `json:"completionPending,omitempty"`
	// Retired and Legacy are storage projection flags, not public runtime
	// fields. Retired records are immutable history and must never enter the
	// lifecycle reconciler.
	Retired      bool   `json:"-"`
	Legacy       bool   `json:"-"`
	RetireReason string `json:"retireReason,omitempty"`
}

type resourceInboundMessage struct {
	ID     string                 `json:"id"`
	Text   string                 `json:"text"`
	Role   string                 `json:"role"`
	Sender *agentHubMessageSender `json:"sender,omitempty"`
	// Steer is selected and persisted immediately before the first delivery
	// attempt. A pointer distinguishes a legacy/unattempted queued message from
	// a message whose stable id was already sent with steer=false.
	Steer      *bool  `json:"steer,omitempty"`
	AcceptedAt string `json:"acceptedAt"`
}

const (
	agentHubEventMaxCount         = 500
	agentUploadMaxBytes           = 512 * 1024 * 1024
	defaultResourceIdleSleepAfter = 30 * time.Minute
)

type forgeNotice struct {
	Source string          `json:"source"`
	Type   string          `json:"type"`
	Time   string          `json:"time"`
	Data   forgeNoticeData `json:"data"`
}

type forgeNoticeData struct {
	Level      string `json:"level"`
	Method     string `json:"method"`
	Text       string `json:"text"`
	Kind       string `json:"kind,omitempty"`
	Lifecycle  string `json:"lifecycle,omitempty"`
	ResourceID string `json:"resourceId,omitempty"`
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

type agentApprovalRequest struct {
	RequestID string `json:"requestId"`
	Decision  string `json:"decision"`
	OptionID  string `json:"optionId"`
	Text      string `json:"text"`
}

type agentRuntime struct {
	mu                    sync.Mutex
	turnActionMu          sync.Mutex
	retirementMu          sync.Mutex
	forgeSessionReleaseMu sync.Mutex
	workspace             guiWorkspace
	manager               *agentManager
	run                   agentRun
	agentHub              *agentHubClient
	agentHubState         string
	agentHubStopRequested bool
	lifecycleStopInFlight bool
	archivedProofFailed   bool
}

type agentManager struct {
	server           *server
	mu               sync.Mutex
	resourceMu       sync.Mutex
	runtimes         map[string]*agentRuntime
	subscribers      map[string]map[chan agentStreamMessage]bool
	schedulerDigests map[string]string
	now              func() time.Time
	idleSleepAfter   time.Duration
}

func newAgentManager(s *server) *agentManager {
	return &agentManager{
		server:           s,
		runtimes:         make(map[string]*agentRuntime),
		subscribers:      make(map[string]map[chan agentStreamMessage]bool),
		schedulerDigests: make(map[string]string),
		now:              time.Now,
		idleSleepAfter:   defaultResourceIdleSleepAfter,
	}
}

func storeAgentUpload(w http.ResponseWriter, r *http.Request, workspacePath, cwd string) {
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

	uploadDir, err := secureAgentUploadDir(workspacePath, cwd)
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

func isAgentHubRun(run agentRun) bool {
	return strings.TrimSpace(run.AgentHubSessionID) != "" || strings.TrimSpace(run.SourceExternalID) != ""
}

func agentRunMatchesResource(run agentRun, resourceID string) bool {
	resourceID = strings.TrimSpace(resourceID)
	if resourceID == "" {
		return true
	}
	if resourceID == "workspace" {
		stored := strings.TrimSpace(run.ResourceID)
		return stored == "" || stored == "workspace"
	}
	return run.ResourceID == resourceID
}

func (m *agentManager) createForgeSession(ctx context.Context, workspace guiWorkspace, run agentRun, cfg config) (string, error) {
	// Resource generations are now the Forge-side lifecycle record. Legacy
	// agent-run compatibility code still carries a synthetic identifier so its
	// in-memory control flow can converge, but it never creates a Forge Session
	// projection.
	_ = ctx
	_ = workspace
	_ = cfg
	if strings.TrimSpace(run.GenerationID) == "" && strings.TrimSpace(run.ID) != "" {
		return "legacy-session-" + run.ID, nil
	}
	return "", nil
}

func (m *agentManager) bindForgeSessionAgentHub(ctx context.Context, workspace guiWorkspace, forgeSessionID, agentHubSessionID string) error {
	// AgentHubSessionID is persisted on the generation record itself. This
	// compatibility hook intentionally has no filesystem side effect.
	_ = ctx
	_ = workspace
	_ = forgeSessionID
	_ = agentHubSessionID
	return nil
}

func (m *agentManager) endForgeSession(ctx context.Context, workspace guiWorkspace, sessionID string) error {
	// Kept as a no-op for the unregistered legacy control path. There is no
	// Forge Session projection to release in the resource lifecycle.
	_ = ctx
	_ = workspace
	_ = sessionID
	return nil
}

func (m *agentManager) agentRunCwd(ctx context.Context, workspace guiWorkspace, resourceID, requested string) (string, error) {
	if strings.TrimSpace(requested) != "" {
		return agentCwd(workspace.Path, requested)
	}
	if strings.TrimSpace(resourceID) == "" || strings.TrimSpace(resourceID) == "workspace" {
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
	if resourceID == app.SchedulerResourceID {
		return safeWorkspacePath(workspace.Path, app.SchedulerResourceID)
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

// handleTurnFinished records the durable terminal event through one idempotent
// path shared by the poller, recovery, and direct action responses.
func (rt *agentRuntime) handleTurnFinished(m *agentManager, session agentHubSession) {
	rt.prepareTurnCompletion(session)
	rt.markTurnCompletionPending()
	rt.recordTurnCompletion(session)
}

func (rt *agentRuntime) markTurnCompletionPending() {
	_, _ = rt.mutateRun(func(run *agentRun) { run.CompletionPending = true })
}

func (rt *agentRuntime) prepareTurnCompletion(session agentHubSession) {
	sessionID := strings.TrimSpace(session.ID)
	if sessionID == "" {
		return
	}
	_, _ = rt.mutateRun(func(run *agentRun) {
		if run.CompletionSessionID == sessionID {
			return
		}
		// This path is entered only after an active -> ready/stopped edge, so
		// inspect the new session from its beginning instead of baselining away
		// the just-finished turn.
		run.CompletionSessionID = sessionID
		run.CompletionCursor = 0
		run.CompletionEventID = 0
		run.CompletionMarker = ""
		run.CompletionState = ""
		run.CompletionTurnID = ""
		run.CompletionAt = ""
		run.CompletionPending = false
		run.AgentHubSessionID = sessionID
	})
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
		_, _ = rt.mutateRun(func(run *agentRun) {
			run.CompletionSessionID = sessionID
			run.CompletionCursor = session.LastEventID
			run.CompletionEventID = 0
			run.CompletionMarker = ""
			run.CompletionState = ""
			run.CompletionTurnID = ""
			run.CompletionAt = ""
			run.CompletionPending = false
		})
		return
	}
	if session.LastEventID <= run.CompletionCursor {
		// The session projection already covers the durable event cursor. This
		// keeps terminal/stopped recovery lightweight while still retrying a
		// completion whose cursor advanced before a prior history read failed.
		if run.CompletionPending {
			_, _ = rt.mutateRun(func(run *agentRun) { run.CompletionPending = false })
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
	_, _ = rt.mutateRun(func(run *agentRun) {
		if strings.TrimSpace(run.AgentHubSessionID) != sessionID {
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
			if session.State == "ready" && !run.IdleSleepStopRequested {
				boundary := agentRunTime(latestTerminal.Time)
				if boundary.IsZero() {
					boundary = agentRunTime(run.CompletionAt)
				}
				if boundary.IsZero() {
					boundary = agentRunTime(session.UpdatedAt)
				}
				if !boundary.IsZero() {
					run.IdleSinceAt = boundary.Format(time.RFC3339Nano)
					run.IdleDeadlineAt = boundary.Add(rt.manager.resourceIdleSleepAfter()).Format(time.RFC3339Nano)
				}
			}
		}
		run.CompletionPending = false
	})
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

// mutateRun is the single serialized persistence boundary for an existing
// generation. The in-memory projection is published only after the complete
// generation (including its mailbox) has been atomically replaced on disk;
// a write failure restores the previous in-memory value so retry remains
// possible after the process continues.
func (rt *agentRuntime) mutateRun(mutate func(*agentRun)) (agentRun, error) {
	return rt.mutateRuntime(func(runtime *agentRuntime) { mutate(&runtime.run) })
}

func (rt *agentRuntime) mutateRuntime(mutate func(*agentRuntime)) (agentRun, error) {
	rt.mu.Lock()
	defer rt.mu.Unlock()
	previous := cloneAgentRun(rt.run)
	previousState := rt.agentHubState
	previousStopRequested := rt.agentHubStopRequested
	previousLifecycleStopInFlight := rt.lifecycleStopInFlight
	mutate(rt)
	updated := cloneAgentRun(rt.run)
	if reflect.DeepEqual(previous, updated) {
		return updated, nil
	}
	if err := saveAgentRun(rt.workspace.Path, updated); err != nil {
		rt.run = previous
		rt.agentHubState = previousState
		rt.agentHubStopRequested = previousStopRequested
		rt.lifecycleStopInFlight = previousLifecycleStopInFlight
		return previous, err
	}
	return updated, nil
}

func cloneAgentRun(run agentRun) agentRun {
	cloned := run
	cloned.PendingMessages = append([]resourceInboundMessage(nil), run.PendingMessages...)
	for index := range cloned.PendingMessages {
		if cloned.PendingMessages[index].Sender != nil {
			sender := *cloned.PendingMessages[index].Sender
			cloned.PendingMessages[index].Sender = &sender
		}
		if cloned.PendingMessages[index].Steer != nil {
			steer := *cloned.PendingMessages[index].Steer
			cloned.PendingMessages[index].Steer = &steer
		}
	}
	return cloned
}

func isLiveAgentStatus(status string) bool {
	return status == "starting" || status == "running" || status == "waiting_approval" ||
		status == "idle" || status == "stopping" || status == "recovering"
}

func resourceRunHasActiveTurn(run agentRun) bool {
	return run.Status == "running" || run.Status == "waiting_approval"
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
	store, err := openGenerationStore(workspacePath, "")
	if err != nil {
		return nil, err
	}
	records, err := store.List()
	if err != nil {
		return nil, err
	}
	runs, err := generationRecordsToAgentRuns(records)
	if err != nil {
		return nil, err
	}
	sortAgentRunsNewestFirst(runs)
	return runs, nil
}

func loadAgentRunsCurrent(workspacePath string) ([]agentRun, error) {
	store, err := openGenerationStore(workspacePath, "")
	if err != nil {
		return nil, err
	}
	records, err := store.ListCurrent()
	if err != nil {
		return nil, err
	}
	runs, err := generationRecordsToAgentRuns(records)
	if err != nil {
		return nil, err
	}
	sortAgentRunsNewestFirst(runs)
	return runs, nil
}

func saveAgentRun(workspacePath string, run agentRun) error {
	// New in-process callers always create generation-addressed records. Keep
	// hand-built test/compatibility projections usable without allowing records
	// loaded from an old file (which carry Legacy=true) to become a mutable
	// current generation during migration.
	if !run.Legacy && strings.TrimSpace(run.GenerationID) == "" && strings.TrimSpace(run.SourceExternalID) != "" && strings.TrimSpace(run.ID) != "" && isAgentHubRun(run) {
		// Compatibility callers may hand us a projection that predates explicit
		// generation IDs. Derive one from its stable run ID so a later projection
		// update addresses the same current file instead of creating a new owner.
		run.GenerationID = "gen-" + strings.TrimSpace(run.ID)
		if run.Generation == 0 {
			run.Generation = 1
		}
	}
	store, err := openGenerationStore(workspacePath, run.SourceInstanceID)
	if err != nil {
		return err
	}
	record, err := agentRunToGenerationRecord(run)
	if err != nil {
		return err
	}
	if run.Retired {
		return store.SaveRetired(record, run.RetireReason)
	}
	return store.SaveCurrent(record)
}

func sortAgentRunsNewestFirst(runs []agentRun) {
	sort.SliceStable(runs, func(i, j int) bool {
		if normalizedResourceID(runs[i].ResourceID) == normalizedResourceID(runs[j].ResourceID) &&
			runs[i].Generation > 0 && runs[j].Generation > 0 && runs[i].Generation != runs[j].Generation {
			return runs[i].Generation > runs[j].Generation
		}
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
	// Kept as a test/migration compatibility helper. Each record is now written
	// through the generation store; no legacy global array is regenerated.
	for _, run := range runs {
		if err := saveAgentRun(workspacePath, run); err != nil {
			return err
		}
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
	return os.MkdirAll(agentRoot(workspacePath), 0o700)
}

func agentRoot(workspacePath string) string {
	return filepath.Join(workspacePath, ".forge", "runtime")
}

func agentIndexPath(workspacePath string) string {
	return filepath.Join(agentRoot(workspacePath), "generations.json")
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
