package app

import (
	"bufio"
	"encoding/json"
	"errors"
	"fmt"
	"io"
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

type logAddOptions struct {
	projectID string
	task      string
	title     string
	details   string
}

type logListOptions struct {
	projectID string
	task      string
	json      bool
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

func runResourceLog(kind string, args []string) error {
	if len(args) == 0 {
		return fmt.Errorf("%s log requires a subcommand", kind)
	}
	switch args[0] {
	case "add":
		return resourceLogAdd(kind, args[1:])
	case "list":
		return resourceLogList(kind, args[1:])
	default:
		return fmt.Errorf("unknown %s log subcommand %q", kind, args[0])
	}
}

func resourceLogAdd(kind string, args []string) error {
	opts, err := parseLogAddArgs(kind, args)
	if err != nil {
		return err
	}
	root, err := findWorkspaceRoot()
	if err != nil {
		return err
	}
	resourceID, err := resolveLogResource(kind, opts.projectID, opts.task)
	if err != nil {
		return err
	}
	dir, resource, err := loadOpenResource(root, resourceID)
	if err != nil {
		return err
	}
	entry := newLogEntry(opts.title, opts.details)
	if err := prependLogEntry(dir, entry); err != nil {
		return err
	}
	resource.resourceMeta().UpdatedAt = time.Now().Format(time.RFC3339)
	if err := writeResourceMetadata(dir, resource); err != nil {
		return err
	}
	return printJSON(entry)
}

func resourceLogList(kind string, args []string) error {
	opts, err := parseLogListArgs(kind, args)
	if err != nil {
		return err
	}
	root, err := findWorkspaceRoot()
	if err != nil {
		return err
	}
	resourceID, err := resolveLogResource(kind, opts.projectID, opts.task)
	if err != nil {
		return err
	}
	dir, _, err := loadResource(root, resourceID)
	if err != nil {
		return err
	}
	entries, err := readLogEntries(dir)
	if err != nil {
		return err
	}
	sortLogEntries(entries)
	if opts.json {
		return printJSON(entries)
	}
	return nil
}

func parseLogAddArgs(kind string, args []string) (logAddOptions, error) {
	usage := logAddUsage(kind)
	var opts logAddOptions
	var title []string
	for i := 0; i < len(args); i++ {
		arg := args[i]
		switch {
		case strings.HasPrefix(arg, "--project="):
			value := strings.TrimPrefix(arg, "--project=")
			if value == "" {
				return logAddOptions{}, errors.New("project cannot be empty")
			}
			if opts.projectID != "" {
				return logAddOptions{}, errors.New(usage)
			}
			normalized, err := normalizeProjectArg(value)
			if err != nil {
				return logAddOptions{}, err
			}
			opts.projectID = normalized
		case arg == "--project":
			value, ok := nextLogArg(args, &i)
			if !ok || opts.projectID != "" {
				return logAddOptions{}, errors.New(usage)
			}
			normalized, err := normalizeProjectArg(value)
			if err != nil {
				return logAddOptions{}, err
			}
			opts.projectID = normalized
		case strings.HasPrefix(arg, "--task="):
			value := strings.TrimPrefix(arg, "--task=")
			if kind != "task" {
				return logAddOptions{}, fmt.Errorf("unknown project log add option %q", arg)
			}
			if value == "" {
				return logAddOptions{}, errors.New("task cannot be empty")
			}
			if opts.task != "" {
				return logAddOptions{}, errors.New(usage)
			}
			opts.task = value
		case arg == "--task":
			if kind != "task" {
				return logAddOptions{}, fmt.Errorf("unknown project log add option %q", arg)
			}
			value, ok := nextLogArg(args, &i)
			if !ok || opts.task != "" {
				return logAddOptions{}, errors.New(usage)
			}
			opts.task = value
		case strings.HasPrefix(arg, "--details="):
			value := strings.TrimPrefix(arg, "--details=")
			if opts.details != "" {
				return logAddOptions{}, errors.New(usage)
			}
			details, err := resolveLogDetails(value)
			if err != nil {
				return logAddOptions{}, err
			}
			opts.details = details
		case arg == "--details":
			value, ok := nextLogArg(args, &i)
			if !ok || opts.details != "" {
				return logAddOptions{}, errors.New(usage)
			}
			details, err := resolveLogDetails(value)
			if err != nil {
				return logAddOptions{}, err
			}
			opts.details = details
		case strings.HasPrefix(arg, "--"):
			return logAddOptions{}, fmt.Errorf("unknown %s log add option %q", kind, arg)
		default:
			title = append(title, arg)
		}
	}
	opts.title = strings.TrimSpace(strings.Join(title, " "))
	if opts.title == "" {
		return logAddOptions{}, errors.New(usage)
	}
	return opts, nil
}

func parseLogListArgs(kind string, args []string) (logListOptions, error) {
	usage := logListUsage(kind)
	var opts logListOptions
	for i := 0; i < len(args); i++ {
		arg := args[i]
		switch {
		case arg == "--json":
			if opts.json {
				return logListOptions{}, errors.New(usage)
			}
			opts.json = true
		case strings.HasPrefix(arg, "--project="):
			value := strings.TrimPrefix(arg, "--project=")
			if value == "" {
				return logListOptions{}, errors.New("project cannot be empty")
			}
			if opts.projectID != "" {
				return logListOptions{}, errors.New(usage)
			}
			normalized, err := normalizeProjectArg(value)
			if err != nil {
				return logListOptions{}, err
			}
			opts.projectID = normalized
		case arg == "--project":
			value, ok := nextLogArg(args, &i)
			if !ok || opts.projectID != "" {
				return logListOptions{}, errors.New(usage)
			}
			normalized, err := normalizeProjectArg(value)
			if err != nil {
				return logListOptions{}, err
			}
			opts.projectID = normalized
		case strings.HasPrefix(arg, "--task="):
			value := strings.TrimPrefix(arg, "--task=")
			if kind != "task" {
				return logListOptions{}, fmt.Errorf("unknown project log list option %q", arg)
			}
			if value == "" {
				return logListOptions{}, errors.New("task cannot be empty")
			}
			if opts.task != "" {
				return logListOptions{}, errors.New(usage)
			}
			opts.task = value
		case arg == "--task":
			if kind != "task" {
				return logListOptions{}, fmt.Errorf("unknown project log list option %q", arg)
			}
			value, ok := nextLogArg(args, &i)
			if !ok || opts.task != "" {
				return logListOptions{}, errors.New(usage)
			}
			opts.task = value
		default:
			return logListOptions{}, errors.New(usage)
		}
	}
	return opts, nil
}

func resolveLogDetails(value string) (string, error) {
	if value != "-" {
		return value, nil
	}
	data, err := io.ReadAll(os.Stdin)
	if err != nil {
		return "", err
	}
	return string(data), nil
}

func resolveLogResource(kind, projectID, task string) (string, error) {
	if kind == "project" {
		if task != "" {
			return "", errors.New("project log does not accept --task")
		}
		if projectID != "" {
			return projectID, nil
		}
		inferred, ok, err := inferCurrentProjectID()
		if err != nil {
			return "", err
		}
		if !ok {
			return "", errors.New("could not infer current project; use forge project log <subcommand> --project=<project>")
		}
		return inferred, nil
	}
	if task == "" {
		if projectID != "" {
			return "", errors.New("task log requires --task when --project is provided")
		}
		inferred, ok, err := inferCurrentTaskID()
		if err != nil {
			return "", err
		}
		if ok {
			return inferred, nil
		}
		return "", errors.New("could not infer current task; use forge task log <subcommand> --task=<task>")
	}
	return normalizeTaskArg(projectID, task)
}

func nextLogArg(args []string, index *int) (string, bool) {
	if *index+1 >= len(args) || strings.HasPrefix(args[*index+1], "--") {
		return "", false
	}
	*index = *index + 1
	return args[*index], true
}

func logAddUsage(kind string) string {
	if kind == "project" {
		return "usage: forge project log add [--project=<project>] [--details <text>|--details -] <title>"
	}
	return "usage: forge task log add [--project=<project>] [--task=<task>] [--details <text>|--details -] <title>"
}

func logListUsage(kind string) string {
	if kind == "project" {
		return "usage: forge project log list [--project=<project>] [--json]"
	}
	return "usage: forge task log list [--project=<project>] [--task=<task>] [--json]"
}

func prependLogEntry(dir string, entry LogEntry) error {
	return prependLogEntries(dir, entry)
}

// prependLogEntries writes a group of new entries in one file update. Callers
// use this when a durable state transition has more than one protocol log
// entry, so a partially written transition cannot expose only its first step.
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

// readLogPage reads only through the requested page (plus one entry to
// determine HasMore). Log entries are prepended, so a cursor remains stable
// when new entries are inserted at the head between requests.
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
