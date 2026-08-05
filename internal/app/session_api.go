package app

import (
	"errors"
	"fmt"
	"strings"
	"time"
)

// CreateSession persists a session with the supplied liveness projection.
func (w *Workspace) CreateSession(liveness SessionLiveness) (Session, error) {
	if err := w.require(); err != nil {
		return Session{}, err
	}
	id, err := createSession(w.root, liveness)
	if err != nil {
		return Session{}, &APIError{Operation: "create session", Kind: "session", Workspace: w.root, Err: err}
	}
	session, err := w.Session(id)
	if err != nil {
		return Session{}, err
	}
	return session, nil
}

// BindAgentHubSession records the immutable AgentHub binding for a Forge
// session. It intentionally does not contact AgentHub.
func (w *Workspace) BindAgentHubSession(sessionID, agentHubSessionID string) (Session, error) {
	if err := w.require(); err != nil {
		return Session{}, err
	}
	sessionID = strings.TrimSpace(sessionID)
	agentHubSessionID = strings.TrimSpace(agentHubSessionID)
	if sessionID == "" || agentHubSessionID == "" {
		return Session{}, &APIError{Operation: "bind AgentHub session", Kind: "session", Workspace: w.root, ResourceID: sessionID, Err: errors.New("Forge and AgentHub session ids are required")}
	}
	var session Session
	err := withLockedSessionStore(w.root, func(store *SessionStore) error {
		pruneStaleSessions(store)
		index := findSessionIndex(store.Sessions, sessionID)
		if index < 0 {
			return fmt.Errorf("session not found: %s", sessionID)
		}
		if store.Sessions[index].Liveness.Type != "agenthub" {
			return fmt.Errorf("session %s does not use AgentHub liveness", sessionID)
		}
		current := strings.TrimSpace(store.Sessions[index].Liveness.AgentHubSessionID)
		if current != "" && current != agentHubSessionID {
			return fmt.Errorf("session %s is already bound to AgentHub session %s", sessionID, current)
		}
		store.Sessions[index].Liveness.AgentHubSessionID = agentHubSessionID
		store.Sessions[index].UpdatedAt = time.Now().Format(time.RFC3339)
		session = store.Sessions[index]
		return nil
	})
	if err != nil {
		return Session{}, &APIError{Operation: "bind AgentHub session", Kind: "session", Workspace: w.root, ResourceID: sessionID, Err: err}
	}
	return session, nil
}

// Heartbeat refreshes a session timestamp.
func (w *Workspace) Heartbeat(sessionID string) (Session, error) {
	if err := w.require(); err != nil {
		return Session{}, err
	}
	sessionID = strings.TrimSpace(sessionID)
	var session Session
	err := withLockedSessionStore(w.root, func(store *SessionStore) error {
		pruneStaleSessions(store)
		index := findSessionIndex(store.Sessions, sessionID)
		if index < 0 {
			return fmt.Errorf("session not found: %s", sessionID)
		}
		store.Sessions[index].UpdatedAt = time.Now().Format(time.RFC3339)
		session = store.Sessions[index]
		return nil
	})
	if err != nil {
		return Session{}, &APIError{Operation: "heartbeat session", Kind: "session", Workspace: w.root, ResourceID: sessionID, Err: err}
	}
	return session, nil
}

// Session returns one active session after local stale pruning.
func (w *Workspace) Session(sessionID string) (Session, error) {
	if err := w.require(); err != nil {
		return Session{}, err
	}
	sessionID = strings.TrimSpace(sessionID)
	var session Session
	err := withLockedSessionStore(w.root, func(store *SessionStore) error {
		pruneStaleSessions(store)
		index := findSessionIndex(store.Sessions, sessionID)
		if index < 0 {
			return fmt.Errorf("session not found: %s", sessionID)
		}
		session = store.Sessions[index]
		return nil
	})
	if err != nil {
		return Session{}, &APIError{Operation: "show session", Kind: "session", Workspace: w.root, ResourceID: sessionID, Err: err}
	}
	return session, nil
}

// Sessions returns active sessions sorted by the existing CLI ordering.
func (w *Workspace) Sessions() ([]Session, error) {
	if err := w.require(); err != nil {
		return nil, err
	}
	var sessions []Session
	err := withLockedSessionStore(w.root, func(store *SessionStore) error {
		pruneStaleSessions(store)
		sessions = append([]Session(nil), store.Sessions...)
		sortSessions(sessions)
		return nil
	})
	if err != nil {
		return nil, &APIError{Operation: "list sessions", Kind: "session", Workspace: w.root, Err: err}
	}
	if sessions == nil {
		sessions = []Session{}
	}
	return sessions, nil
}

// EndSession explicitly removes exactly one session and releases its
// persistent controls. AgentHub is never queried here.
func (w *Workspace) EndSession(sessionID string) (Session, error) {
	if err := w.require(); err != nil {
		return Session{}, err
	}
	sessionID = strings.TrimSpace(sessionID)
	session, err := endSession(w.root, sessionID)
	if err != nil {
		return Session{}, &APIError{Operation: "end session", Kind: "session", Workspace: w.root, ResourceID: sessionID, Err: err}
	}
	return session, nil
}

// LockSession adds a resource control using an explicit resource id. An empty
// resource id is a typed no-op for the Workspace root, which never requires a
// session lock.
func (w *Workspace) LockSession(sessionID, resourceID string) (Session, error) {
	return w.updateSessionResourceLock(sessionID, resourceID, true)
}

// UnlockSession removes a resource control using an explicit resource id.
func (w *Workspace) UnlockSession(sessionID, resourceID string) (Session, error) {
	return w.updateSessionResourceLock(sessionID, resourceID, false)
}

func (w *Workspace) updateSessionResourceLock(sessionID, resourceID string, lock bool) (Session, error) {
	if err := w.require(); err != nil {
		return Session{}, err
	}
	sessionID = strings.TrimSpace(sessionID)
	resourceID = strings.TrimSpace(resourceID)
	if resourceID == "" {
		session, err := w.Session(sessionID)
		if err != nil {
			return Session{}, err
		}
		return session, nil
	}
	control, noLock, err := resolveResourceSessionControl(w.root, resourceID)
	if err != nil {
		return Session{}, &APIError{Operation: "resolve session resource", Kind: "session", Workspace: w.root, ResourceID: resourceID, Err: err}
	}
	if noLock {
		return w.Session(sessionID)
	}
	var session Session
	err = withLockedSessionStore(w.root, func(store *SessionStore) error {
		pruneStaleSessions(store)
		index := findSessionIndex(store.Sessions, sessionID)
		if index < 0 {
			return fmt.Errorf("session not found: %s", sessionID)
		}
		if lock {
			if err := ensureNoSessionControlConflicts(store, sessionID, control); err != nil {
				return err
			}
			addSessionControl(&store.Sessions[index], control)
		} else {
			store.Sessions[index].Controls = removeSessionControl(store.Sessions[index].Controls, control)
			if store.Sessions[index].Primary != nil && store.Sessions[index].Primary.Path == control.Path {
				store.Sessions[index].Primary = nil
			}
		}
		store.Sessions[index].UpdatedAt = time.Now().Format(time.RFC3339)
		session = store.Sessions[index]
		return nil
	})
	if err != nil {
		op := "lock session resource"
		if !lock {
			op = "unlock session resource"
		}
		return Session{}, &APIError{Operation: op, Kind: "session", Workspace: w.root, ResourceID: resourceID, Err: err}
	}
	return session, nil
}
