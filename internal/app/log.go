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

type LogEntry struct {
	ID                string `json:"id"`
	Time              string `json:"time"`
	Title             string `json:"title"`
	Details           string `json:"details,omitempty"`
	AutoRun           bool   `json:"autoRun,omitempty"`
	AutoRunGeneration int    `json:"autoRunGeneration,omitempty"`
}

func newAutoRunLogEntry(title, details string, generation int) LogEntry {
	entry := newLogEntry(title, details)
	entry.AutoRun = true
	entry.AutoRunGeneration = generation
	return entry
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
	if entry.Title == "" {
		return errors.New("log title cannot be empty")
	}
	data, err := json.Marshal(entry)
	if err != nil {
		return err
	}
	path := filepath.Join(dir, logJSONLFile)
	existing, err := os.ReadFile(path)
	if err != nil && !os.IsNotExist(err) {
		return err
	}
	var next []byte
	next = append(next, data...)
	next = append(next, '\n')
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
