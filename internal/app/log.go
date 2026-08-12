package app

import (
	"bufio"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"
)

const logJSONLFile = "log.jsonl"

const (
	// DefaultResourceLogPageLimit is the number of newest entries returned for
	// a GUI resource detail's first page.
	DefaultResourceLogPageLimit = 10
	// OlderResourceLogPageLimit is the number of older entries requested by a
	// GUI Load More action.
	OlderResourceLogPageLimit = 20
	// MaxResourceLogPageLimit bounds paged resource detail requests.
	MaxResourceLogPageLimit = 100
)

// ErrInvalidLogCursor identifies a cursor that cannot be resolved to a
// stable log entry in the selected resource.
var ErrInvalidLogCursor = errors.New("invalid log cursor")

type LogEntry struct {
	ID      string `json:"id"`
	Time    string `json:"time"`
	Title   string `json:"title"`
	Details string `json:"details,omitempty"`
}

// LogPage is the bounded, newest-first result used by GUI resource detail
// requests. Entries are kept in the log file's stable prepend order; the
// cursor is the ID of the last returned entry.
type LogPage struct {
	Entries    []LogEntry `json:"entries"`
	HasMore    bool       `json:"hasMore"`
	NextCursor string     `json:"nextCursor,omitempty"`
}

func defaultLogJSONL(title string) string {
	entry := newLogEntry(title, "")
	data, err := json.Marshal(entry)
	if err != nil {
		panic(err)
	}
	return string(data) + "\n"
}

func newLogEntry(title, details string) LogEntry {
	now := time.Now()
	return LogEntry{
		ID:      "log-" + now.Format("20060102T150405.000000000Z0700"),
		Time:    now.Format(time.RFC3339),
		Title:   strings.TrimSpace(title),
		Details: strings.TrimSpace(details),
	}
}

func prependLogEntry(dir string, entry LogEntry) error {
	return prependLogEntries(dir, entry)
}

func prependLogEntries(dir string, entries ...LogEntry) error {
	if len(entries) == 0 {
		return nil
	}
	for _, entry := range entries {
		if entry.Title == "" {
			return errors.New("log title cannot be empty")
		}
	}

	var next []byte
	for _, entry := range entries {
		data, err := json.Marshal(entry)
		if err != nil {
			return err
		}
		next = append(next, data...)
		next = append(next, '\n')
	}
	path := filepath.Join(dir, logJSONLFile)
	existing, err := os.ReadFile(path)
	if err != nil && !os.IsNotExist(err) {
		return err
	}
	next = append(next, existing...)
	return os.WriteFile(path, next, 0o644)
}

func readLogEntries(dir string) ([]LogEntry, error) {
	path := filepath.Join(dir, logJSONLFile)
	file, err := os.Open(path)
	if err != nil {
		if os.IsNotExist(err) {
			return nil, nil
		}
		return nil, err
	}
	defer file.Close()

	var entries []LogEntry
	scanner := bufio.NewScanner(file)
	for line := 1; scanner.Scan(); line++ {
		text := strings.TrimSpace(scanner.Text())
		if text == "" {
			continue
		}
		var entry LogEntry
		if err := json.Unmarshal([]byte(text), &entry); err != nil {
			return nil, fmt.Errorf("%s:%d: %w", path, line, err)
		}
		entries = append(entries, entry)
	}
	if err := scanner.Err(); err != nil {
		return nil, err
	}
	return entries, nil
}

func readLogPage(dir, cursor string, limit int) (LogPage, error) {
	page := LogPage{Entries: make([]LogEntry, 0)}
	if limit <= 0 || limit > MaxResourceLogPageLimit {
		return page, fmt.Errorf("log page limit must be between 1 and %d", MaxResourceLogPageLimit)
	}
	trimmedCursor := strings.TrimSpace(cursor)
	if cursor != "" && cursor != trimmedCursor {
		return page, fmt.Errorf("%w %q", ErrInvalidLogCursor, cursor)
	}
	cursor = trimmedCursor
	if strings.ContainsAny(cursor, "\r\n") || len(cursor) > 256 {
		return page, fmt.Errorf("%w %q", ErrInvalidLogCursor, cursor)
	}
	path := filepath.Join(dir, logJSONLFile)
	file, err := os.Open(path)
	if err != nil {
		if os.IsNotExist(err) {
			if cursor != "" {
				return page, fmt.Errorf("%w %q", ErrInvalidLogCursor, cursor)
			}
			return page, nil
		}
		return page, err
	}
	defer file.Close()

	afterCursor := cursor == ""
	seenIDs := make(map[string]struct{}, limit+1)
	scanner := bufio.NewScanner(file)
	for line := 1; scanner.Scan(); line++ {
		text := strings.TrimSpace(scanner.Text())
		if text == "" {
			continue
		}
		var entry LogEntry
		if err := json.Unmarshal([]byte(text), &entry); err != nil {
			return LogPage{}, fmt.Errorf("%s:%d: %w", path, line, err)
		}
		if strings.TrimSpace(entry.ID) == "" {
			return LogPage{}, fmt.Errorf("%s:%d: log entry id cannot be empty", path, line)
		}
		if _, exists := seenIDs[entry.ID]; exists {
			return LogPage{}, fmt.Errorf("%s:%d: duplicate log entry id %q", path, line, entry.ID)
		}
		seenIDs[entry.ID] = struct{}{}
		if !afterCursor {
			if entry.ID == cursor {
				afterCursor = true
			}
			continue
		}
		if len(page.Entries) < limit {
			page.Entries = append(page.Entries, entry)
			continue
		}
		page.HasMore = true
		break
	}
	if err := scanner.Err(); err != nil {
		return LogPage{}, err
	}
	if !afterCursor {
		return LogPage{}, fmt.Errorf("%w %q", ErrInvalidLogCursor, cursor)
	}
	if page.HasMore && len(page.Entries) > 0 {
		page.NextCursor = page.Entries[len(page.Entries)-1].ID
	}
	return page, nil
}

func sortLogEntries(entries []LogEntry) {
	sort.SliceStable(entries, func(i, j int) bool {
		left, leftErr := time.Parse(time.RFC3339, entries[i].Time)
		right, rightErr := time.Parse(time.RFC3339, entries[j].Time)
		if leftErr == nil && rightErr == nil && !left.Equal(right) {
			return left.After(right)
		}
		return entries[i].Time > entries[j].Time
	})
}
