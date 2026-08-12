package app

import (
	"errors"
	"fmt"
	"strings"
	"time"
)

// CreateSession persists the transient Forge projection required by forge
// serve for one AgentHub Session. It is not exposed by the public CLI.
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
	err := withLockedSessionStore(w.root, func(store *sessionStore) error {
		discardLegacySessions(store)
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

// Session returns one AgentHub-backed projection without modifying the store.
func (w *Workspace) Session(sessionID string) (Session, error) {
	if err := w.require(); err != nil {
		return Session{}, err
	}
	sessionID = strings.TrimSpace(sessionID)
	var session Session
	err := withLockedSessionStore(w.root, func(store *sessionStore) error {
		index := findSessionIndex(store.Sessions, sessionID)
		if index < 0 || store.Sessions[index].Liveness.Type != "agenthub" {
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

// Sessions returns AgentHub-backed projections sorted for read-only CLI and
// workspace diagnostics. It does not prune or rewrite the store.
func (w *Workspace) Sessions() ([]Session, error) {
	if err := w.require(); err != nil {
		return nil, err
	}
	var sessions []Session
	err := withLockedSessionStore(w.root, func(store *sessionStore) error {
		sessions = activeAgentHubSessions(store.Sessions)
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

// EndSession removes one transient projection after forge serve has reconciled
// a durable AgentHub terminal state. It is not exposed by the public CLI.
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
