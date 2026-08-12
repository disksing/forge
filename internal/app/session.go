package app

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"syscall"
	"time"
)

const (
	sessionStateFile = "forge-sessions.json"
	sessionLockFile  = ".forge-sessions.lock"
)

type sessionStore struct {
	Version  int       `json:"version"`
	Sessions []Session `json:"sessions"`
}

// Session is Forge's transient projection for a Session created by forge
// serve. AgentHub remains the lifecycle source of truth.
type Session struct {
	ID        string          `json:"id"`
	Liveness  SessionLiveness `json:"liveness"`
	StartedAt string          `json:"startedAt"`
	UpdatedAt string          `json:"updatedAt"`
}

// SessionLiveness contains only the AgentHub correlation data needed by
// forge serve. Legacy pid and heartbeat records are ignored on reads and
// discarded the next time the store is mutated.
type SessionLiveness struct {
	Type              string `json:"type"`
	Endpoint          string `json:"endpoint,omitempty"`
	SourceApp         string `json:"sourceApp,omitempty"`
	SourceInstanceID  string `json:"sourceInstanceId,omitempty"`
	SourceExternalID  string `json:"sourceExternalId,omitempty"`
	AgentHubSessionID string `json:"agentHubSessionId,omitempty"`
}

func createSession(root string, liveness SessionLiveness) (string, error) {
	if liveness.Type != "agenthub" {
		return "", fmt.Errorf("unsupported Forge session type %q", liveness.Type)
	}
	id, err := newSessionID()
	if err != nil {
		return "", err
	}
	if err := withLockedSessionStore(root, func(store *sessionStore) error {
		discardLegacySessions(store)
		now := time.Now().Format(time.RFC3339)
		store.Sessions = append(store.Sessions, Session{
			ID:        id,
			Liveness:  liveness,
			StartedAt: now,
			UpdatedAt: now,
		})
		return nil
	}); err != nil {
		return "", err
	}
	return id, nil
}

func endSession(root, id string) (Session, error) {
	var session Session
	if err := withLockedSessionStore(root, func(store *sessionStore) error {
		discardLegacySessions(store)
		index := findSessionIndex(store.Sessions, id)
		if index < 0 {
			return fmt.Errorf("session not found: %s", id)
		}
		session = store.Sessions[index]
		store.Sessions = append(store.Sessions[:index], store.Sessions[index+1:]...)
		return nil
	}); err != nil {
		return Session{}, err
	}
	return session, nil
}

func findSessionIndex(sessions []Session, id string) int {
	for i, session := range sessions {
		if session.ID == id {
			return i
		}
	}
	return -1
}

func activeAgentHubSessions(sessions []Session) []Session {
	active := make([]Session, 0, len(sessions))
	for _, session := range sessions {
		if session.Liveness.Type == "agenthub" {
			active = append(active, session)
		}
	}
	return active
}

func discardLegacySessions(store *sessionStore) {
	store.Sessions = activeAgentHubSessions(store.Sessions)
}

func withLockedSessionStore(root string, update func(*sessionStore) error) error {
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
	original, err := json.Marshal(store)
	if err != nil {
		return err
	}
	if err := update(&store); err != nil {
		return err
	}
	updated, err := json.Marshal(store)
	if err != nil {
		return err
	}
	if string(updated) == string(original) {
		return nil
	}
	return writeSessionStore(root, store)
}

func readSessionStore(root string) (sessionStore, error) {
	var store sessionStore
	if err := readJSON(filepath.Join(root, sessionStateFile), &store); err != nil {
		if os.IsNotExist(err) {
			return sessionStore{Version: 1, Sessions: []Session{}}, nil
		}
		return sessionStore{}, err
	}
	if store.Version != 1 {
		return sessionStore{}, fmt.Errorf("unsupported session store version %d; expected 1", store.Version)
	}
	if store.Sessions == nil {
		store.Sessions = []Session{}
	}
	return store, nil
}

func writeSessionStore(root string, store sessionStore) error {
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
	if err := tmp.Sync(); err != nil {
		tmp.Close()
		return err
	}
	if err := tmp.Close(); err != nil {
		return err
	}
	return os.Rename(tmpName, filepath.Join(root, sessionStateFile))
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

func newSessionID() (string, error) {
	var random [4]byte
	if _, err := rand.Read(random[:]); err != nil {
		return "", err
	}
	return fmt.Sprintf("session-%d-%s", time.Now().UnixNano(), hex.EncodeToString(random[:])), nil
}
