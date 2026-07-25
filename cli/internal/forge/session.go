package forge

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
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
	sessionNewUsage        = "usage: forge session new [--heartbeat [--timeout <duration>] | --pid <pid> | --gui-run --workspace-id <id> --run-id <id> --endpoint <url>]"
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
	Timeout   string           `json:"timeout,omitempty"`
	Primary   *SessionControl  `json:"primary,omitempty"`
	Controls  []SessionControl `json:"controls"`
	StartedAt string           `json:"startedAt"`
	UpdatedAt string           `json:"updatedAt"`
}

type SessionLiveness struct {
	Type        string `json:"type"`
	PID         int    `json:"pid,omitempty"`
	Timeout     string `json:"timeout,omitempty"`
	WorkspaceID string `json:"workspaceId,omitempty"`
	RunID       string `json:"runId,omitempty"`
	Endpoint    string `json:"endpoint,omitempty"`
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

func sessionNew(args []string) error {
	liveness, err := parseSessionNewArgs(args)
	if err != nil {
		return err
	}
	root, err := findWorkspaceRoot()
	if err != nil {
		return err
	}
	id, err := createSession(root, liveness)
	if err != nil {
		return err
	}
	fmt.Println(id)
	return nil
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
	root, err := findWorkspaceRoot()
	if err != nil {
		return err
	}
	var session Session
	if err := withLockedSessionStore(root, func(store *SessionStore) error {
		pruneStaleSessions(store)
		index := findSessionIndex(store.Sessions, id)
		if index < 0 {
			return fmt.Errorf("session not found: %s", id)
		}
		store.Sessions[index].UpdatedAt = time.Now().Format(time.RFC3339)
		session = store.Sessions[index]
		return nil
	}); err != nil {
		return err
	}
	return printSessionJSON(session)
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
	root, err := findWorkspaceRoot()
	if err != nil {
		return err
	}
	session, err := endSession(root, id)
	if err != nil {
		return err
	}
	return printSessionJSON(session)
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
	root, err := findWorkspaceRoot()
	if err != nil {
		return err
	}
	var sessions []Session
	if err := withLockedSessionStore(root, func(store *SessionStore) error {
		pruneStaleSessions(store)
		sessions = append([]Session(nil), store.Sessions...)
		sortSessions(sessions)
		return nil
	}); err != nil {
		return err
	}
	for _, session := range sessions {
		fmt.Printf("%s\t%s\t%s\t%s\n", session.ID, formatSessionLiveness(session.Liveness), formatSessionControls(session.Controls), session.UpdatedAt)
	}
	return nil
}

func sessionShow(args []string) error {
	id, err := parseSessionIDArg(args, sessionShowUsage)
	if err != nil {
		return err
	}
	root, err := findWorkspaceRoot()
	if err != nil {
		return err
	}
	var session Session
	if err := withLockedSessionStore(root, func(store *SessionStore) error {
		pruneStaleSessions(store)
		index := findSessionIndex(store.Sessions, id)
		if index < 0 {
			return fmt.Errorf("session not found: %s", id)
		}
		session = store.Sessions[index]
		return nil
	}); err != nil {
		return err
	}
	return printSessionJSON(session)
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
	var session Session
	if err := withLockedSessionStore(root, func(store *SessionStore) error {
		pruneStaleSessions(store)
		index := findSessionIndex(store.Sessions, options.ID)
		if index < 0 {
			return fmt.Errorf("session not found: %s", options.ID)
		}
		if !noLock && lock {
			if err := ensureNoSessionControlConflicts(store, options.ID, control); err != nil {
				return err
			}
			addSessionControl(&store.Sessions[index], control)
		}
		if !noLock && !lock {
			store.Sessions[index].Controls = removeSessionControl(store.Sessions[index].Controls, control)
			if store.Sessions[index].Primary != nil && store.Sessions[index].Primary.Path == control.Path {
				store.Sessions[index].Primary = nil
			}
		}
		store.Sessions[index].UpdatedAt = time.Now().Format(time.RFC3339)
		session = store.Sessions[index]
		return nil
	}); err != nil {
		return err
	}
	if noLock {
		fmt.Println(workspaceNoLockMessage)
		return nil
	}
	return printSessionJSON(session)
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
	guiRunSet := false
	for i := 0; i < len(args); i++ {
		arg := args[i]
		switch {
		case arg == "--heartbeat":
			if heartbeatSet || pidSet || guiRunSet {
				return SessionLiveness{}, errors.New(sessionNewUsage)
			}
			heartbeatSet = true
			liveness = SessionLiveness{Type: "heartbeat", Timeout: liveness.Timeout}
		case strings.HasPrefix(arg, "--pid="):
			if heartbeatSet || pidSet || guiRunSet {
				return SessionLiveness{}, errors.New(sessionNewUsage)
			}
			pid, err := parseSessionPID(strings.TrimPrefix(arg, "--pid="))
			if err != nil {
				return SessionLiveness{}, err
			}
			pidSet = true
			liveness = SessionLiveness{Type: "pid", PID: pid}
		case arg == "--pid":
			if heartbeatSet || pidSet || guiRunSet {
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
		case arg == "--gui-run":
			if heartbeatSet || pidSet || guiRunSet {
				return SessionLiveness{}, errors.New(sessionNewUsage)
			}
			guiRunSet = true
			liveness = SessionLiveness{Type: "forge-gui-run"}
		case strings.HasPrefix(arg, "--workspace-id="):
			if heartbeatSet || pidSet {
				return SessionLiveness{}, errors.New(sessionNewUsage)
			}
			guiRunSet = true
			liveness.Type = "forge-gui-run"
			liveness.WorkspaceID = strings.TrimSpace(strings.TrimPrefix(arg, "--workspace-id="))
		case arg == "--workspace-id":
			if heartbeatSet || pidSet {
				return SessionLiveness{}, errors.New(sessionNewUsage)
			}
			value, ok := nextFlagValue(args, &i)
			if !ok {
				return SessionLiveness{}, errors.New(sessionNewUsage)
			}
			guiRunSet = true
			liveness.Type = "forge-gui-run"
			liveness.WorkspaceID = strings.TrimSpace(value)
		case strings.HasPrefix(arg, "--run-id="):
			if heartbeatSet || pidSet {
				return SessionLiveness{}, errors.New(sessionNewUsage)
			}
			guiRunSet = true
			liveness.Type = "forge-gui-run"
			liveness.RunID = strings.TrimSpace(strings.TrimPrefix(arg, "--run-id="))
		case arg == "--run-id":
			if heartbeatSet || pidSet {
				return SessionLiveness{}, errors.New(sessionNewUsage)
			}
			value, ok := nextFlagValue(args, &i)
			if !ok {
				return SessionLiveness{}, errors.New(sessionNewUsage)
			}
			guiRunSet = true
			liveness.Type = "forge-gui-run"
			liveness.RunID = strings.TrimSpace(value)
		case strings.HasPrefix(arg, "--endpoint="):
			if heartbeatSet || pidSet {
				return SessionLiveness{}, errors.New(sessionNewUsage)
			}
			guiRunSet = true
			liveness.Type = "forge-gui-run"
			liveness.Endpoint = strings.TrimSpace(strings.TrimPrefix(arg, "--endpoint="))
		case arg == "--endpoint":
			if heartbeatSet || pidSet {
				return SessionLiveness{}, errors.New(sessionNewUsage)
			}
			value, ok := nextFlagValue(args, &i)
			if !ok {
				return SessionLiveness{}, errors.New(sessionNewUsage)
			}
			guiRunSet = true
			liveness.Type = "forge-gui-run"
			liveness.Endpoint = strings.TrimSpace(value)
		case strings.HasPrefix(arg, "--timeout="):
			if pidSet || guiRunSet {
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
			if pidSet || guiRunSet {
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
	if guiRunSet {
		liveness.Type = "forge-gui-run"
		liveness.PID = 0
		liveness.Timeout = ""
		if liveness.WorkspaceID == "" || liveness.RunID == "" || liveness.Endpoint == "" {
			return SessionLiveness{}, errors.New(sessionNewUsage)
		}
		if _, err := url.ParseRequestURI(liveness.Endpoint); err != nil {
			return SessionLiveness{}, fmt.Errorf("invalid endpoint %q: %w", liveness.Endpoint, err)
		}
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
		if sessionActive(session) {
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
		return sessionPathsOverlap(session.Primary.Path, targetRel)
	}
	// Sessions written before primary controls were recorded are ambiguous.
	// Preserve the historical fail-safe behavior instead of allowing an agent
	// whose working resource may have been archived to continue without a lock.
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

func sessionActive(session Session) bool {
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
	case "forge-gui-run":
		return sessionForgeGUIRunActive(session.ID, session.Liveness)
	default:
		return false
	}
}

func sessionForgeGUIRunActive(sessionID string, liveness SessionLiveness) bool {
	if strings.TrimSpace(sessionID) == "" || strings.TrimSpace(liveness.WorkspaceID) == "" || strings.TrimSpace(liveness.RunID) == "" || strings.TrimSpace(liveness.Endpoint) == "" {
		return false
	}
	endpoint, err := url.Parse(strings.TrimRight(liveness.Endpoint, "/") + "/api/internal/session-liveness")
	if err != nil {
		return false
	}
	query := endpoint.Query()
	query.Set("workspaceId", liveness.WorkspaceID)
	query.Set("runId", liveness.RunID)
	query.Set("forgeSessionId", sessionID)
	endpoint.RawQuery = query.Encode()

	client := &http.Client{Timeout: time.Second}
	resp, err := client.Get(endpoint.String())
	if err != nil {
		return false
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return false
	}
	var result struct {
		Active bool `json:"active"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return false
	}
	return result.Active
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
	prunedArchived := len(pruneArchivedResourceSessions(root, &store)) > 0
	if err := update(&store); err != nil {
		if prunedArchived {
			if writeErr := writeSessionStore(root, store); writeErr != nil {
				return writeErr
			}
		}
		return err
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
	if store.Version == 0 {
		store.Version = 1
	}
	if store.Sessions == nil {
		store.Sessions = []Session{}
	}
	for i := range store.Sessions {
		if store.Sessions[i].Liveness.Type == "" && store.Sessions[i].Timeout != "" {
			store.Sessions[i].Liveness = SessionLiveness{Type: "heartbeat", Timeout: store.Sessions[i].Timeout}
			store.Sessions[i].Timeout = ""
		}
		if store.Sessions[i].Primary == nil && len(store.Sessions[i].Controls) == 1 {
			primary := store.Sessions[i].Controls[0]
			store.Sessions[i].Primary = &primary
		}
	}
	return store, nil
}

func writeSessionStore(root string, store SessionStore) error {
	if store.Version == 0 {
		store.Version = 1
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
	sort.Slice(sessions, func(i, j int) bool {
		return sessions[i].ID < sessions[j].ID
	})
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
	case "forge-gui-run":
		return fmt.Sprintf("forge-gui-run:%s", liveness.RunID)
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
