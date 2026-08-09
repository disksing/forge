package forge

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"net/url"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"syscall"
	"time"
)

const (
	sessionStateFile       = "forge-sessions.json"
	sessionLockFile        = ".forge-sessions.lock"
	defaultSessionTimeout  = 5 * time.Minute
	defaultStartingGrace   = 30 * time.Second
	sessionNewUsage        = "usage: forge session new [--heartbeat [--timeout <duration>] | --pid <pid> | --agenthub --endpoint <url> --source-instance-id <id> --source-external-id <id> [--agenthub-session-id <id>] [--starting-grace <duration>] ]"
	sessionBindUsage       = "usage: forge session bind-agenthub --id=<id> --agenthub-session-id=<id>"
	sessionHeartbeatUsage  = "usage: forge session heartbeat --id=<id>"
	sessionLockUsage       = "usage: forge session lock --id=<id> [--project=<project>] [--task=<task>]"
	sessionUnlockUsage     = "usage: forge session unlock --id=<id> [--project=<project>] [--task=<task>]"
	sessionEndUsage        = "usage: forge session end --id=<id>"
	sessionShowUsage       = "usage: forge session show --id=<id>"
	workspaceNoLockMessage = "workspace root does not need a lock"
)

type SessionStore struct {
	Version  int       `json:"version"`
	Sessions []Session `json:"sessions"`
}

type Session struct {
	ID        string           `json:"id"`
	Liveness  SessionLiveness  `json:"liveness"`
	Primary   *SessionControl  `json:"primary,omitempty"`
	Controls  []SessionControl `json:"controls"`
	StartedAt string           `json:"startedAt"`
	UpdatedAt string           `json:"updatedAt"`
}

type SessionLiveness struct {
	Type               string `json:"type"`
	PID                int    `json:"pid,omitempty"`
	Timeout            string `json:"timeout,omitempty"`
	Endpoint           string `json:"endpoint,omitempty"`
	SourceApp          string `json:"sourceApp,omitempty"`
	SourceInstanceID   string `json:"sourceInstanceId,omitempty"`
	SourceExternalID   string `json:"sourceExternalId,omitempty"`
	AgentHubSessionID  string `json:"agentHubSessionId,omitempty"`
	StartingGrace      string `json:"startingGrace,omitempty"`
	LastKnownState     string `json:"lastKnownState,omitempty"`
	LastCheckedAt      string `json:"lastCheckedAt,omitempty"`
	LivenessDiagnostic string `json:"livenessDiagnostic,omitempty"`
}

type SessionControl struct {
	ResourceID string `json:"resourceId,omitempty"`
	Path       string `json:"path"`
}

type sessionTargetOptions struct {
	ID      string
	Project string
	Task    string
}

func runSession(args []string) error {
	if len(args) == 0 {
		return errors.New("session requires a subcommand")
	}
	switch args[0] {
	case "new":
		return sessionNew(args[1:])
	case "heartbeat":
		return sessionHeartbeat(args[1:])
	case "bind-agenthub":
		return sessionBindAgentHub(args[1:])
	case "lock":
		return sessionLock(args[1:])
	case "unlock":
		return sessionUnlock(args[1:])
	case "end":
		return sessionEnd(args[1:])
	case "list":
		if len(args) != 1 {
			return errors.New("usage: forge session list")
		}
		return sessionList()
	case "show":
		return sessionShow(args[1:])
	default:
		return fmt.Errorf("unknown session subcommand %q", args[0])
	}
}

func sessionBindAgentHub(args []string) error {
	var sessionID, agentHubSessionID string
	for i := 0; i < len(args); i++ {
		arg := args[i]
		switch {
		case strings.HasPrefix(arg, "--id="):
			sessionID = strings.TrimSpace(strings.TrimPrefix(arg, "--id="))
		case arg == "--id":
			value, ok := nextFlagValue(args, &i)
			if !ok {
				return errors.New(sessionBindUsage)
			}
			sessionID = strings.TrimSpace(value)
		case strings.HasPrefix(arg, "--agenthub-session-id="):
			agentHubSessionID = strings.TrimSpace(strings.TrimPrefix(arg, "--agenthub-session-id="))
		case arg == "--agenthub-session-id":
			value, ok := nextFlagValue(args, &i)
			if !ok {
				return errors.New(sessionBindUsage)
			}
			agentHubSessionID = strings.TrimSpace(value)
		default:
			return errors.New(sessionBindUsage)
		}
	}
	if sessionID == "" || agentHubSessionID == "" {
		return errors.New(sessionBindUsage)
	}
	return applicationSessionBind(sessionID, agentHubSessionID)
}

func sessionNew(args []string) error {
	liveness, err := parseSessionNewArgs(args)
	if err != nil {
		return err
	}
	return applicationSessionNewLocal(liveness)
}

func createSession(root string, liveness SessionLiveness) (string, error) {
	id, err := newSessionID()
	if err != nil {
		return "", err
	}
	if err := withLockedSessionStore(root, func(store *SessionStore) error {
		pruneStaleSessions(store)
		now := time.Now().Format(time.RFC3339)
		store.Sessions = append(store.Sessions, Session{
			ID:        id,
			Liveness:  liveness,
			Controls:  []SessionControl{},
			StartedAt: now,
			UpdatedAt: now,
		})
		return nil
	}); err != nil {
		return "", err
	}
	return id, nil
}

func sessionHeartbeat(args []string) error {
	id, err := parseSessionIDArg(args, sessionHeartbeatUsage)
	if err != nil {
		return err
	}
	return applicationSessionHeartbeat(id)
}

func sessionLock(args []string) error {
	options, err := parseSessionTargetArgs(args, sessionLockUsage)
	if err != nil {
		return err
	}
	return updateSessionLock(options, true)
}

func sessionUnlock(args []string) error {
	options, err := parseSessionTargetArgs(args, sessionUnlockUsage)
	if err != nil {
		return err
	}
	return updateSessionLock(options, false)
}

func sessionEnd(args []string) error {
	id, err := parseSessionIDArg(args, sessionEndUsage)
	if err != nil {
		return err
	}
	return applicationSessionEnd(id)
}

func endSession(root, id string) (Session, error) {
	var session Session
	if err := withLockedSessionStore(root, func(store *SessionStore) error {
		index := findSessionIndex(store.Sessions, id)
		if index < 0 {
			pruneStaleSessions(store)
			return fmt.Errorf("session not found: %s", id)
		}
		session = store.Sessions[index]
		store.Sessions = append(store.Sessions[:index], store.Sessions[index+1:]...)
		pruneStaleSessions(store)
		return nil
	}); err != nil {
		return Session{}, err
	}
	return session, nil
}

func sessionList() error {
	return applicationSessionList()
}

func sessionShow(args []string) error {
	id, err := parseSessionIDArg(args, sessionShowUsage)
	if err != nil {
		return err
	}
	return applicationSessionShow(id)
}

func updateSessionLock(options sessionTargetOptions, lock bool) error {
	root, err := findWorkspaceRoot()
	if err != nil {
		return err
	}
	control, noLock, err := resolveSessionTarget(root, options)
	if err != nil {
		return err
	}
	if noLock {
		return applicationSessionLock(options.ID, "", lock)
	}
	return applicationSessionLock(options.ID, control.ResourceID, lock)
}

func lockSessionResource(root, sessionID, resourceID string) (Session, error) {
	control, noLock, err := resolveResourceSessionControl(root, resourceID)
	if err != nil {
		return Session{}, err
	}
	if noLock {
		return Session{}, nil
	}
	var session Session
	if err := withLockedSessionStore(root, func(store *SessionStore) error {
		pruneStaleSessions(store)
		index := findSessionIndex(store.Sessions, sessionID)
		if index < 0 {
			return fmt.Errorf("session not found: %s", sessionID)
		}
		if err := ensureNoSessionControlConflicts(store, sessionID, control); err != nil {
			return err
		}
		addSessionControl(&store.Sessions[index], control)
		store.Sessions[index].UpdatedAt = time.Now().Format(time.RFC3339)
		session = store.Sessions[index]
		return nil
	}); err != nil {
		return Session{}, err
	}
	return session, nil
}

func parseSessionNewArgs(args []string) (SessionLiveness, error) {
	liveness := SessionLiveness{Type: "heartbeat", Timeout: defaultSessionTimeout.String()}
	heartbeatSet := false
	pidSet := false
	agentHubSet := false
	agentHubFlagSeen := false
	for _, arg := range args {
		if arg == "--agenthub" {
			if agentHubSet {
				return SessionLiveness{}, errors.New(sessionNewUsage)
			}
			agentHubSet = true
			liveness = SessionLiveness{Type: "agenthub", SourceApp: "forge", StartingGrace: defaultStartingGrace.String()}
		}
	}
	for i := 0; i < len(args); i++ {
		arg := args[i]
		switch {
		case arg == "--heartbeat":
			if heartbeatSet || pidSet || agentHubSet {
				return SessionLiveness{}, errors.New(sessionNewUsage)
			}
			heartbeatSet = true
			liveness = SessionLiveness{Type: "heartbeat", Timeout: liveness.Timeout}
		case strings.HasPrefix(arg, "--pid="):
			if heartbeatSet || pidSet || agentHubSet {
				return SessionLiveness{}, errors.New(sessionNewUsage)
			}
			pid, err := parseSessionPID(strings.TrimPrefix(arg, "--pid="))
			if err != nil {
				return SessionLiveness{}, err
			}
			pidSet = true
			liveness = SessionLiveness{Type: "pid", PID: pid}
		case arg == "--pid":
			if heartbeatSet || pidSet || agentHubSet {
				return SessionLiveness{}, errors.New(sessionNewUsage)
			}
			value, ok := nextFlagValue(args, &i)
			if !ok {
				return SessionLiveness{}, errors.New(sessionNewUsage)
			}
			pid, err := parseSessionPID(value)
			if err != nil {
				return SessionLiveness{}, err
			}
			pidSet = true
			liveness = SessionLiveness{Type: "pid", PID: pid}
		case arg == "--agenthub":
			if heartbeatSet || pidSet || agentHubFlagSeen {
				return SessionLiveness{}, errors.New(sessionNewUsage)
			}
			agentHubFlagSeen = true
		case strings.HasPrefix(arg, "--endpoint="):
			if heartbeatSet || pidSet || !agentHubSet {
				return SessionLiveness{}, errors.New(sessionNewUsage)
			}
			liveness.Endpoint = strings.TrimSpace(strings.TrimPrefix(arg, "--endpoint="))
		case arg == "--endpoint":
			if heartbeatSet || pidSet || !agentHubSet {
				return SessionLiveness{}, errors.New(sessionNewUsage)
			}
			value, ok := nextFlagValue(args, &i)
			if !ok {
				return SessionLiveness{}, errors.New(sessionNewUsage)
			}
			liveness.Endpoint = strings.TrimSpace(value)
		case strings.HasPrefix(arg, "--source-instance-id="):
			if !agentHubSet {
				return SessionLiveness{}, errors.New(sessionNewUsage)
			}
			liveness.SourceInstanceID = strings.TrimSpace(strings.TrimPrefix(arg, "--source-instance-id="))
		case arg == "--source-instance-id":
			if !agentHubSet {
				return SessionLiveness{}, errors.New(sessionNewUsage)
			}
			value, ok := nextFlagValue(args, &i)
			if !ok {
				return SessionLiveness{}, errors.New(sessionNewUsage)
			}
			liveness.SourceInstanceID = strings.TrimSpace(value)
		case strings.HasPrefix(arg, "--source-external-id="):
			if !agentHubSet {
				return SessionLiveness{}, errors.New(sessionNewUsage)
			}
			liveness.SourceExternalID = strings.TrimSpace(strings.TrimPrefix(arg, "--source-external-id="))
		case arg == "--source-external-id":
			if !agentHubSet {
				return SessionLiveness{}, errors.New(sessionNewUsage)
			}
			value, ok := nextFlagValue(args, &i)
			if !ok {
				return SessionLiveness{}, errors.New(sessionNewUsage)
			}
			liveness.SourceExternalID = strings.TrimSpace(value)
		case strings.HasPrefix(arg, "--agenthub-session-id="):
			if !agentHubSet {
				return SessionLiveness{}, errors.New(sessionNewUsage)
			}
			liveness.AgentHubSessionID = strings.TrimSpace(strings.TrimPrefix(arg, "--agenthub-session-id="))
		case arg == "--agenthub-session-id":
			if !agentHubSet {
				return SessionLiveness{}, errors.New(sessionNewUsage)
			}
			value, ok := nextFlagValue(args, &i)
			if !ok {
				return SessionLiveness{}, errors.New(sessionNewUsage)
			}
			liveness.AgentHubSessionID = strings.TrimSpace(value)
		case strings.HasPrefix(arg, "--starting-grace="):
			if !agentHubSet {
				return SessionLiveness{}, errors.New(sessionNewUsage)
			}
			value := strings.TrimSpace(strings.TrimPrefix(arg, "--starting-grace="))
			parsed, err := parseSessionTimeout(value)
			if err != nil {
				return SessionLiveness{}, err
			}
			liveness.StartingGrace = parsed.String()
		case arg == "--starting-grace":
			if !agentHubSet {
				return SessionLiveness{}, errors.New(sessionNewUsage)
			}
			value, ok := nextFlagValue(args, &i)
			if !ok {
				return SessionLiveness{}, errors.New(sessionNewUsage)
			}
			parsed, err := parseSessionTimeout(value)
			if err != nil {
				return SessionLiveness{}, err
			}
			liveness.StartingGrace = parsed.String()
		case strings.HasPrefix(arg, "--timeout="):
			if pidSet || agentHubSet {
				return SessionLiveness{}, errors.New("--timeout is only valid with heartbeat liveness")
			}
			value := strings.TrimSpace(strings.TrimPrefix(arg, "--timeout="))
			parsed, err := parseSessionTimeout(value)
			if err != nil {
				return SessionLiveness{}, err
			}
			liveness.Type = "heartbeat"
			liveness.Timeout = parsed.String()
		case arg == "--timeout":
			if pidSet || agentHubSet {
				return SessionLiveness{}, errors.New("--timeout is only valid with heartbeat liveness")
			}
			value, ok := nextFlagValue(args, &i)
			if !ok {
				return SessionLiveness{}, errors.New(sessionNewUsage)
			}
			parsed, err := parseSessionTimeout(value)
			if err != nil {
				return SessionLiveness{}, err
			}
			liveness.Type = "heartbeat"
			liveness.Timeout = parsed.String()
		default:
			return SessionLiveness{}, errors.New(sessionNewUsage)
		}
	}
	if agentHubSet {
		liveness.Type = "agenthub"
		liveness.PID = 0
		liveness.Timeout = ""
		if liveness.Endpoint == "" || liveness.SourceInstanceID == "" || liveness.SourceExternalID == "" {
			return SessionLiveness{}, errors.New(sessionNewUsage)
		}
		if parsed, err := url.ParseRequestURI(liveness.Endpoint); err != nil || (parsed.Scheme != "http" && parsed.Scheme != "https") || parsed.Host == "" {
			if err == nil {
				err = errors.New("endpoint must be an absolute http or https URL")
			}
			return SessionLiveness{}, fmt.Errorf("invalid endpoint %q: %w", liveness.Endpoint, err)
		}
		liveness.Endpoint = strings.TrimRight(liveness.Endpoint, "/")
	}
	return liveness, nil
}

func parseSessionPID(value string) (int, error) {
	pid, err := strconv.Atoi(strings.TrimSpace(value))
	if err != nil || pid <= 0 {
		return 0, fmt.Errorf("invalid pid %q: use a positive process id", value)
	}
	return pid, nil
}

func parseSessionTimeout(value string) (time.Duration, error) {
	duration, err := time.ParseDuration(strings.TrimSpace(value))
	if err != nil || duration <= 0 {
		return 0, fmt.Errorf("invalid timeout %q: use a positive duration such as 30s or 5m", value)
	}
	return duration, nil
}

func parseSessionIDArg(args []string, usage string) (string, error) {
	var id string
	for i := 0; i < len(args); i++ {
		arg := args[i]
		switch {
		case strings.HasPrefix(arg, "--id="):
			value := strings.TrimSpace(strings.TrimPrefix(arg, "--id="))
			if value == "" || id != "" {
				return "", errors.New(usage)
			}
			id = value
		case arg == "--id":
			value, ok := nextFlagValue(args, &i)
			if !ok || strings.TrimSpace(value) == "" || id != "" {
				return "", errors.New(usage)
			}
			id = strings.TrimSpace(value)
		default:
			return "", errors.New(usage)
		}
	}
	if id == "" {
		return "", errors.New(usage)
	}
	return id, nil
}

func parseSessionTargetArgs(args []string, usage string) (sessionTargetOptions, error) {
	var options sessionTargetOptions
	for i := 0; i < len(args); i++ {
		arg := args[i]
		switch {
		case strings.HasPrefix(arg, "--id="):
			value := strings.TrimSpace(strings.TrimPrefix(arg, "--id="))
			if value == "" || options.ID != "" {
				return sessionTargetOptions{}, errors.New(usage)
			}
			options.ID = value
		case arg == "--id":
			value, ok := nextFlagValue(args, &i)
			if !ok || strings.TrimSpace(value) == "" || options.ID != "" {
				return sessionTargetOptions{}, errors.New(usage)
			}
			options.ID = strings.TrimSpace(value)
		case strings.HasPrefix(arg, "--project="):
			value := strings.TrimSpace(strings.TrimPrefix(arg, "--project="))
			if value == "" || options.Project != "" {
				return sessionTargetOptions{}, errors.New(usage)
			}
			options.Project = value
		case arg == "--project":
			value, ok := nextFlagValue(args, &i)
			if !ok || strings.TrimSpace(value) == "" || options.Project != "" {
				return sessionTargetOptions{}, errors.New(usage)
			}
			options.Project = strings.TrimSpace(value)
		case strings.HasPrefix(arg, "--task="):
			value := strings.TrimSpace(strings.TrimPrefix(arg, "--task="))
			if value == "" || options.Task != "" {
				return sessionTargetOptions{}, errors.New(usage)
			}
			options.Task = value
		case arg == "--task":
			value, ok := nextFlagValue(args, &i)
			if !ok || strings.TrimSpace(value) == "" || options.Task != "" {
				return sessionTargetOptions{}, errors.New(usage)
			}
			options.Task = strings.TrimSpace(value)
		default:
			return sessionTargetOptions{}, errors.New(usage)
		}
	}
	if options.ID == "" {
		return sessionTargetOptions{}, errors.New(usage)
	}
	return options, nil
}

func nextFlagValue(args []string, i *int) (string, bool) {
	if *i+1 >= len(args) || strings.HasPrefix(args[*i+1], "--") {
		return "", false
	}
	*i = *i + 1
	return args[*i], true
}

func resolveSessionTarget(root string, options sessionTargetOptions) (SessionControl, bool, error) {
	if options.Project == "" && options.Task == "" {
		taskID, ok, err := inferCurrentTaskID()
		if err != nil {
			return SessionControl{}, false, err
		}
		if ok {
			return resolveResourceSessionControl(root, taskID)
		}
		projectID, ok, err := inferCurrentProjectID()
		if err != nil {
			return SessionControl{}, false, err
		}
		if ok {
			return resolveResourceSessionControl(root, projectID)
		}
		cwd, err := os.Getwd()
		if err != nil {
			return SessionControl{}, false, err
		}
		absRoot, err := filepath.Abs(root)
		if err != nil {
			return SessionControl{}, false, err
		}
		absCwd, err := filepath.Abs(cwd)
		if err != nil {
			return SessionControl{}, false, err
		}
		if absCwd == absRoot {
			return SessionControl{}, true, nil
		}
		return SessionControl{}, false, errors.New("could not infer current project or task; use --project=<project> or --task=<task>")
	}

	projectID := options.Project
	if projectID != "" {
		normalized, err := normalizeProjectArg(projectID)
		if err != nil {
			return SessionControl{}, false, err
		}
		projectID = normalized
	}
	if options.Task == "" {
		return resolveResourceSessionControl(root, projectID)
	}
	if projectID == "" {
		inferred, ok, err := inferCurrentProjectID()
		if err != nil {
			return SessionControl{}, false, err
		}
		if !ok {
			return SessionControl{}, false, errors.New("could not infer current project; use --project=<project> with --task=<task>")
		}
		projectID = inferred
	}
	taskID, err := normalizeTaskArg(projectID, options.Task)
	if err != nil {
		return SessionControl{}, false, err
	}
	return resolveResourceSessionControl(root, taskID)
}

func resolveResourceSessionControl(root, resourceID string) (SessionControl, bool, error) {
	path, err := findResourceDir(root, resourceID)
	if err != nil {
		return SessionControl{}, false, err
	}
	if isArchivedPath(root, path) {
		return SessionControl{}, false, fmt.Errorf("cannot lock archived resource: %s", resourceID)
	}
	return SessionControl{ResourceID: resourceID, Path: relPath(root, path)}, false, nil
}

func ensureNoSessionControlConflicts(store *SessionStore, sessionID string, control SessionControl) error {
	for _, session := range store.Sessions {
		if session.ID == sessionID {
			continue
		}
		for _, existing := range session.Controls {
			if existing.Path == control.Path {
				return fmt.Errorf("control conflict: %s is already controlled by session %q", formatSessionControl(control), session.ID)
			}
		}
	}
	return nil
}

func sessionPathsOverlap(a, b string) bool {
	a = strings.Trim(strings.TrimSpace(filepath.ToSlash(filepath.Clean(a))), "/")
	b = strings.Trim(strings.TrimSpace(filepath.ToSlash(filepath.Clean(b))), "/")
	if a == "." {
		a = ""
	}
	if b == "." {
		b = ""
	}
	return a == b || a == "" || b == "" || strings.HasPrefix(a, b+"/") || strings.HasPrefix(b, a+"/")
}

func addSessionControl(session *Session, control SessionControl) {
	for _, existing := range session.Controls {
		if existing.Path == control.Path {
			return
		}
	}
	if session.Primary == nil && len(session.Controls) == 0 {
		primary := control
		session.Primary = &primary
	}
	session.Controls = append(session.Controls, control)
	sortSessionControls(session.Controls)
}

func removeSessionControl(controls []SessionControl, control SessionControl) []SessionControl {
	remaining := []SessionControl{}
	for _, existing := range controls {
		if existing.Path != control.Path {
			remaining = append(remaining, existing)
		}
	}
	return remaining
}

func findSessionIndex(sessions []Session, id string) int {
	for i, session := range sessions {
		if session.ID == id {
			return i
		}
	}
	return -1
}

func pruneStaleSessions(store *SessionStore) []Session {
	var active []Session
	var removed []Session
	for _, session := range store.Sessions {
		if sessionActiveWithProjection(&session) {
			active = append(active, session)
		} else {
			removed = append(removed, session)
		}
	}
	store.Sessions = active
	return removed
}

func pruneArchivedResourceSessions(root string, store *SessionStore) []Session {
	var active []Session
	var removed []Session
	for _, session := range store.Sessions {
		if sessionControlsArchivedResource(root, session) {
			removed = append(removed, session)
		} else {
			active = append(active, session)
		}
	}
	store.Sessions = active
	return removed
}

func sessionControlsArchivedResource(root string, session Session) bool {
	for _, control := range session.Controls {
		if controlPathArchived(root, control.Path) {
			return true
		}
		if strings.TrimSpace(control.ResourceID) == "" {
			continue
		}
		path, err := findResourceDir(root, control.ResourceID)
		if err == nil && isArchivedPath(root, path) {
			return true
		}
	}
	return false
}

func controlPathArchived(root, path string) bool {
	path = strings.TrimSpace(path)
	if path == "" {
		return false
	}
	if filepath.IsAbs(path) {
		return isArchivedPath(root, path)
	}
	return isArchivedPath(root, filepath.Join(root, filepath.FromSlash(path)))
}

func releaseSessionsControllingPath(root, targetRel string) error {
	return withLockedSessionStore(root, func(store *SessionStore) error {
		pruneStaleSessions(store)
		pruneArchivedResourceSessions(root, store)
		active := store.Sessions[:0]
		now := time.Now().Format(time.RFC3339)
		for _, session := range store.Sessions {
			if sessionPrimaryControlsPath(session, targetRel) {
				continue
			}
			controls := removeSessionControlsWithinPath(session.Controls, targetRel)
			if len(controls) != len(session.Controls) {
				session.Controls = controls
				session.UpdatedAt = now
			}
			active = append(active, session)
		}
		store.Sessions = active
		return nil
	})
}

func sessionPrimaryControlsPath(session Session, targetRel string) bool {
	if session.Primary != nil {
		return sessionPathWithin(session.Primary.Path, targetRel)
	}
	// A session can have no primary after its primary control is explicitly
	// unlocked. Treat that state as ambiguous and keep the fail-safe behavior
	// instead of allowing an agent whose working resource may have been archived
	// to continue without a lock.
	return sessionControlsPath(session, targetRel)
}

func sessionControlsPath(session Session, targetRel string) bool {
	for _, control := range session.Controls {
		if sessionPathsOverlap(control.Path, targetRel) {
			return true
		}
	}
	return false
}

func removeSessionControlsWithinPath(controls []SessionControl, targetRel string) []SessionControl {
	remaining := make([]SessionControl, 0, len(controls))
	for _, control := range controls {
		if sessionPathWithin(control.Path, targetRel) {
			continue
		}
		remaining = append(remaining, control)
	}
	return remaining
}

func sessionPathWithin(path, parent string) bool {
	path = strings.Trim(strings.TrimSpace(filepath.ToSlash(filepath.Clean(path))), "/")
	parent = strings.Trim(strings.TrimSpace(filepath.ToSlash(filepath.Clean(parent))), "/")
	if path == "." {
		path = ""
	}
	if parent == "." {
		parent = ""
	}
	return path == parent || parent == "" || strings.HasPrefix(path, parent+"/")
}

func sessionActiveWithProjection(session *Session) bool {
	if session == nil {
		return false
	}
	switch session.Liveness.Type {
	case "pid":
		return sessionPIDActive(session.Liveness.PID)
	case "heartbeat":
		timeout, err := time.ParseDuration(session.Liveness.Timeout)
		if err != nil || timeout <= 0 {
			return false
		}
		updatedAt, err := time.Parse(time.RFC3339, session.UpdatedAt)
		if err != nil {
			return false
		}
		return time.Since(updatedAt) <= timeout
	case "agenthub":
		// AgentHub-managed sessions are never probed by the plain CLI: no
		// network request happens on any code path here. The session stays
		// active until forge serve reconciles a durable AgentHub terminal
		// state or the user explicitly runs `forge session end`.
		return true
	default:
		return false
	}
}

func sessionPIDActive(pid int) bool {
	if pid <= 0 {
		return false
	}
	err := syscall.Kill(pid, 0)
	if err == nil {
		return true
	}
	return errors.Is(err, syscall.EPERM)
}

func withLockedSessionStore(root string, update func(*SessionStore) error) error {
	lock, err := os.OpenFile(filepath.Join(root, sessionLockFile), os.O_CREATE|os.O_RDWR, 0o644)
	if err != nil {
		return err
	}
	defer lock.Close()
	if err := syscall.Flock(int(lock.Fd()), syscall.LOCK_EX); err != nil {
		return err
	}
	defer syscall.Flock(int(lock.Fd()), syscall.LOCK_UN)

	store, err := readSessionStore(root)
	if err != nil {
		return err
	}
	original, marshalErr := json.Marshal(store)
	if marshalErr != nil {
		return marshalErr
	}
	prunedArchived := len(pruneArchivedResourceSessions(root, &store)) > 0
	if err := update(&store); err != nil {
		if prunedArchived {
			if writeErr := writeSessionStore(root, store); writeErr != nil {
				return writeErr
			}
		}
		return err
	}
	// Read-only commands (list/show/tree) must not rewrite unchanged state.
	updated, marshalErr := json.Marshal(store)
	if marshalErr != nil {
		return marshalErr
	}
	if string(updated) == string(original) {
		return nil
	}
	return writeSessionStore(root, store)
}

func readSessionStore(root string) (SessionStore, error) {
	var store SessionStore
	if err := readJSON(filepath.Join(root, sessionStateFile), &store); err != nil {
		if os.IsNotExist(err) {
			return SessionStore{Version: 1, Sessions: []Session{}}, nil
		}
		return SessionStore{}, err
	}
	if store.Version != 1 {
		return SessionStore{}, fmt.Errorf("unsupported session store version %d; expected 1", store.Version)
	}
	if store.Sessions == nil {
		store.Sessions = []Session{}
	}
	return store, nil
}

func writeSessionStore(root string, store SessionStore) error {
	if store.Version != 1 {
		return fmt.Errorf("unsupported session store version %d; expected 1", store.Version)
	}
	if store.Sessions == nil {
		store.Sessions = []Session{}
	}
	data, err := json.MarshalIndent(store, "", "  ")
	if err != nil {
		return err
	}
	data = append(data, '\n')
	tmp, err := os.CreateTemp(root, ".forge-sessions-*.tmp")
	if err != nil {
		return err
	}
	tmpName := tmp.Name()
	defer os.Remove(tmpName)
	if _, err := tmp.Write(data); err != nil {
		tmp.Close()
		return err
	}
	if err := tmp.Close(); err != nil {
		return err
	}
	return os.Rename(tmpName, filepath.Join(root, sessionStateFile))
}

func printSessionJSON(session Session) error {
	data, err := json.MarshalIndent(session, "", "  ")
	if err != nil {
		return err
	}
	fmt.Println(string(data))
	return nil
}

func sortSessions(sessions []Session) {
	sort.SliceStable(sessions, func(i, j int) bool {
		left, leftOK := parseSessionTime(sessions[i].StartedAt)
		right, rightOK := parseSessionTime(sessions[j].StartedAt)
		if leftOK && rightOK && !left.Equal(right) {
			return left.After(right)
		}
		if leftOK != rightOK {
			return leftOK
		}
		return sessions[i].ID > sessions[j].ID
	})
}

func parseSessionTime(value string) (time.Time, bool) {
	parsed, err := time.Parse(time.RFC3339Nano, strings.TrimSpace(value))
	return parsed, err == nil
}

func sortSessionControls(controls []SessionControl) {
	sort.Slice(controls, func(i, j int) bool {
		return controls[i].Path < controls[j].Path
	})
}

func formatSessionControls(controls []SessionControl) string {
	if len(controls) == 0 {
		return "-"
	}
	parts := make([]string, 0, len(controls))
	for _, control := range controls {
		parts = append(parts, formatSessionControl(control))
	}
	return strings.Join(parts, ",")
}

func formatSessionLiveness(liveness SessionLiveness) string {
	switch liveness.Type {
	case "pid":
		return fmt.Sprintf("pid:%d", liveness.PID)
	case "heartbeat":
		return fmt.Sprintf("heartbeat:%s", liveness.Timeout)
	case "agenthub":
		if liveness.AgentHubSessionID != "" {
			return fmt.Sprintf("agenthub:%s:%s", liveness.AgentHubSessionID, liveness.LastKnownState)
		}
		return fmt.Sprintf("agenthub:%s:%s", liveness.SourceExternalID, liveness.LastKnownState)
	default:
		return "unknown"
	}
}

func formatSessionControl(control SessionControl) string {
	if control.ResourceID != "" {
		return control.ResourceID + ":" + control.Path
	}
	return control.Path
}

func newSessionID() (string, error) {
	var random [4]byte
	if _, err := rand.Read(random[:]); err != nil {
		return "", err
	}
	return fmt.Sprintf("session-%d-%s", time.Now().UnixNano(), hex.EncodeToString(random[:])), nil
}
