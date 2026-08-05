package app

import (
	"errors"
	"strings"
)

// AddLog prepends a structured log entry to an open project or task.
func (w *Workspace) AddLog(resourceID, title, details string) (LogEntry, error) {
	if err := w.require(); err != nil {
		return LogEntry{}, err
	}
	var entry LogEntry
	err := withWorkspaceMutationLock(w.root, func() error {
		var err error
		entry, err = w.addLog(resourceID, title, details)
		return err
	})
	if err != nil {
		var apiErr *APIError
		if errors.As(err, &apiErr) {
			return LogEntry{}, err
		}
		return LogEntry{}, &APIError{Operation: "add resource log", Kind: "log", Workspace: w.root, ResourceID: resourceID, Err: err}
	}
	return entry, nil
}

func (w *Workspace) addLog(resourceID, title, details string) (LogEntry, error) {
	path, _, err := loadOpenResource(w.root, strings.TrimSpace(resourceID))
	if err != nil {
		return LogEntry{}, &APIError{Operation: "add resource log", Kind: "log", Workspace: w.root, ResourceID: resourceID, Err: err}
	}
	title = strings.TrimSpace(title)
	if title == "" {
		return LogEntry{}, &APIError{Operation: "add resource log", Kind: "log", Workspace: w.root, ResourceID: resourceID, Err: errors.New("log title cannot be empty")}
	}
	entry := newLogEntry(title, details)
	if err := prependLogEntry(path, entry); err != nil {
		return LogEntry{}, &APIError{Operation: "add resource log", Kind: "log", Workspace: w.root, ResourceID: resourceID, Err: err}
	}
	resource, err := readResourceAtDir(path)
	if err != nil {
		return LogEntry{}, &APIError{Operation: "add resource log", Kind: "log", Workspace: w.root, ResourceID: resourceID, Err: err}
	}
	resource.resourceMeta().UpdatedAt = entry.Time
	if err := writeResourceMetadata(path, resource); err != nil {
		return LogEntry{}, &APIError{Operation: "add resource log", Kind: "log", Workspace: w.root, ResourceID: resourceID, Err: err}
	}
	return entry, nil
}

// Logs returns structured log entries in the same newest-first order as the
// CLI JSON adapter.
func (w *Workspace) Logs(resourceID string) ([]LogEntry, error) {
	if err := w.require(); err != nil {
		return nil, err
	}
	path, _, err := loadResource(w.root, strings.TrimSpace(resourceID))
	if err != nil {
		return nil, &APIError{Operation: "list resource logs", Kind: "log", Workspace: w.root, ResourceID: resourceID, Err: err}
	}
	entries, err := readLogEntries(path)
	if err != nil {
		return nil, &APIError{Operation: "list resource logs", Kind: "log", Workspace: w.root, ResourceID: resourceID, Err: err}
	}
	sortLogEntries(entries)
	return entries, nil
}
