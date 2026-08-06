package app_test

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/disksing/forge/internal/app"
)

func writeTestLogEntries(t *testing.T, workspace *app.Workspace, resourceID string, entries []app.LogEntry, suffix string) string {
	t.Helper()
	resource, err := workspace.ResourceValue(resourceID)
	if err != nil {
		t.Fatal(err)
	}
	path := filepath.Join(workspace.Root(), filepath.FromSlash(resource.Path), "log.jsonl")
	var data strings.Builder
	for _, entry := range entries {
		encoded, err := json.Marshal(entry)
		if err != nil {
			t.Fatal(err)
		}
		data.Write(encoded)
		data.WriteByte('\n')
	}
	if suffix != "" {
		data.WriteString(suffix)
	}
	if err := os.WriteFile(path, []byte(data.String()), 0o644); err != nil {
		t.Fatal(err)
	}
	return path
}

func testLogEntries(count int, sameTime bool) []app.LogEntry {
	base := time.Date(2026, time.January, 1, 0, 0, 0, 0, time.UTC)
	entries := make([]app.LogEntry, 0, count)
	for index := 0; index < count; index++ {
		at := base
		if !sameTime {
			at = base.Add(time.Duration(count-index) * time.Second)
		}
		entries = append(entries, app.LogEntry{
			ID: fmt.Sprintf("log-test-%03d", index), Time: at.Format(time.RFC3339Nano),
			Title: fmt.Sprintf("entry %03d", index), Details: fmt.Sprintf("details %03d", index),
		})
	}
	return entries
}

func assertPageIDs(t *testing.T, entries []app.LogEntry, want []string) {
	t.Helper()
	if len(entries) != len(want) {
		t.Fatalf("page has %d entries, want %d: %+v", len(entries), len(want), entries)
	}
	for index, entry := range entries {
		if entry.ID != want[index] {
			t.Fatalf("entry %d has ID %q, want %q", index, entry.ID, want[index])
		}
	}
}

func TestResourcePageBoundariesAndFullLogsCompatibility(t *testing.T) {
	cases := []int{0, 1, 9, 10, 11, 30, 31, 50, 51}
	for _, count := range cases {
		t.Run(fmt.Sprintf("project-%d", count), func(t *testing.T) {
			workspace, err := app.Initialize(t.TempDir(), "en")
			if err != nil {
				t.Fatal(err)
			}
			project, err := workspace.CreateProject("Paged project", fmt.Sprintf("paged-%d", count))
			if err != nil {
				t.Fatal(err)
			}
			all := testLogEntries(count, count == 30)
			writeTestLogEntries(t, workspace, project.ID, all, "")

			first, err := workspace.ResourcePage(project.ID, "", app.DefaultResourceLogPageLimit)
			if err != nil {
				t.Fatal(err)
			}
			firstCount := count
			if firstCount > app.DefaultResourceLogPageLimit {
				firstCount = app.DefaultResourceLogPageLimit
			}
			wantFirst := make([]string, 0, firstCount)
			for _, entry := range all[:firstCount] {
				wantFirst = append(wantFirst, entry.ID)
			}
			assertPageIDs(t, first.Logs, wantFirst)
			assertPageIDs(t, first.LogPage.Entries, wantFirst)
			if first.LogPage.HasMore != (count > app.DefaultResourceLogPageLimit) {
				t.Fatalf("first page hasMore=%v for %d entries", first.LogPage.HasMore, count)
			}

			loaded := append([]app.LogEntry(nil), first.Logs...)
			cursor := first.LogPage.NextCursor
			for first.LogPage.HasMore {
				if cursor == "" {
					t.Fatal("page with more entries has no cursor")
				}
				first, err = workspace.ResourcePage(project.ID, cursor, app.OlderResourceLogPageLimit)
				if err != nil {
					t.Fatal(err)
				}
				loaded = append(loaded, first.Logs...)
				cursor = first.LogPage.NextCursor
			}
			if len(loaded) != count {
				t.Fatalf("paged traversal loaded %d entries, want %d", len(loaded), count)
			}
			seen := make(map[string]bool, len(loaded))
			for index, entry := range loaded {
				if seen[entry.ID] {
					t.Fatalf("paged traversal duplicated %q", entry.ID)
				}
				seen[entry.ID] = true
				if entry.ID != all[index].ID {
					t.Fatalf("paged traversal entry %d=%q, want %q", index, entry.ID, all[index].ID)
				}
			}

			full, err := workspace.Logs(project.ID)
			if err != nil {
				t.Fatal(err)
			}
			if len(full) != count {
				t.Fatalf("full Logs returned %d entries, want %d", len(full), count)
			}
		})
	}
}

func TestResourcePageSupportsTaskProjectArchiveAndHeadInsertion(t *testing.T) {
	workspace, err := app.Initialize(t.TempDir(), "en")
	if err != nil {
		t.Fatal(err)
	}
	project, err := workspace.CreateProject("Paged project", "paged")
	if err != nil {
		t.Fatal(err)
	}
	task, err := workspace.CreateTask(app.CreateTaskInput{ProjectID: project.ID, Title: "Paged task", Slug: "paged"})
	if err != nil {
		t.Fatal(err)
	}
	entries := testLogEntries(31, true)
	writeTestLogEntries(t, workspace, task.ID, entries, "")
	first, err := workspace.ResourcePage(task.ID, "", 10)
	if err != nil {
		t.Fatal(err)
	}
	cursor := first.LogPage.NextCursor
	if cursor != entries[9].ID {
		t.Fatalf("first cursor=%q, want %q", cursor, entries[9].ID)
	}
	newEntry, err := workspace.AddLog(task.ID, "new head", "inserted after first page")
	if err != nil {
		t.Fatal(err)
	}
	page, err := workspace.ResourcePage(task.ID, cursor, 20)
	if err != nil {
		t.Fatal(err)
	}
	if len(page.Logs) != 20 || page.Logs[0].ID != entries[10].ID || page.Logs[len(page.Logs)-1].ID != entries[29].ID {
		t.Fatalf("head insertion shifted cursor page: first=%q last=%q logs=%+v", page.Logs[0].ID, page.Logs[len(page.Logs)-1].ID, page.Logs)
	}
	if page.Logs[0].ID == newEntry.ID {
		t.Fatal("head insertion leaked into an older cursor page")
	}
	if page.LogPage.HasMore != true || page.LogPage.NextCursor != entries[29].ID {
		t.Fatalf("unexpected page continuation after head insertion: %+v", page.LogPage)
	}
	last, err := workspace.ResourcePage(task.ID, page.LogPage.NextCursor, 20)
	if err != nil {
		t.Fatal(err)
	}
	if len(last.Logs) != 1 || last.Logs[0].ID != entries[30].ID || last.LogPage.HasMore {
		t.Fatalf("last page after head insertion: %+v", last)
	}
	if _, err := workspace.ArchiveResource(task.ID); err != nil {
		t.Fatal(err)
	}
	archivedTaskPage, err := workspace.ResourcePage(task.ID, "", 10)
	if err != nil {
		t.Fatal(err)
	}
	if !archivedTaskPage.Archived || len(archivedTaskPage.Logs) != 10 || !archivedTaskPage.LogPage.HasMore {
		t.Fatalf("archived task page was not readable: %+v", archivedTaskPage)
	}

	archived, err := workspace.CreateProject("Archived project", "archived")
	if err != nil {
		t.Fatal(err)
	}
	archivedEntries := testLogEntries(11, false)
	writeTestLogEntries(t, workspace, archived.ID, archivedEntries, "")
	if _, err := workspace.ArchiveResource(archived.ID); err != nil {
		t.Fatal(err)
	}
	archivedPage, err := workspace.ResourcePage(archived.ID, "", 10)
	if err != nil {
		t.Fatal(err)
	}
	if !archivedPage.Archived || len(archivedPage.Logs) != 10 || !archivedPage.LogPage.HasMore {
		t.Fatalf("archived resource page was not readable: %+v", archivedPage)
	}
}

func TestResourcePageRejectsInvalidParametersAndMalformedJSON(t *testing.T) {
	workspace, err := app.Initialize(t.TempDir(), "en")
	if err != nil {
		t.Fatal(err)
	}
	project, err := workspace.CreateProject("Malformed project", "malformed")
	if err != nil {
		t.Fatal(err)
	}
	entries := testLogEntries(12, false)
	path := writeTestLogEntries(t, workspace, project.ID, entries, "")
	if _, err := workspace.ResourcePage(project.ID, "does-not-exist", 10); err == nil || !errors.Is(err, app.ErrInvalidLogCursor) {
		t.Fatalf("invalid cursor error=%v, want ErrInvalidLogCursor", err)
	}
	for _, cursor := range []string{" ", " log-test-000"} {
		if _, err := workspace.ResourcePage(project.ID, cursor, 10); err == nil || !errors.Is(err, app.ErrInvalidLogCursor) {
			t.Fatalf("malformed cursor %q error=%v, want ErrInvalidLogCursor", cursor, err)
		}
	}
	for _, limit := range []int{0, -1, app.MaxResourceLogPageLimit + 1} {
		if _, err := workspace.ResourcePage(project.ID, "", limit); err == nil || !strings.Contains(err.Error(), "log page limit") {
			t.Fatalf("limit %d error=%v, want page limit validation", limit, err)
		}
	}
	first, err := workspace.ResourcePage(project.ID, "", 10)
	if err != nil || len(first.Logs) != 10 {
		t.Fatalf("valid first page failed: %+v %v", first, err)
	}
	if _, err := workspace.ResourcePage(project.ID, first.LogPage.NextCursor, 20); err != nil {
		t.Fatalf("valid older page failed: %v", err)
	}
	if err := os.WriteFile(path, []byte("{not-json}\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	if _, err := workspace.ResourcePage(project.ID, "", 10); err == nil || !strings.Contains(err.Error(), "log.jsonl:1") {
		t.Fatalf("malformed JSON did not produce structured path error: %v", err)
	}

	// A malformed line after the extra look-ahead entry is not read by the
	// first page. This guards against accidentally restoring full-file reads in
	// the initial detail path.
	path = writeTestLogEntries(t, workspace, project.ID, append(testLogEntries(11, false), app.LogEntry{}), "")
	if err := os.WriteFile(path, []byte(strings.TrimRight(readTestLogFile(t, path), "\n")+"\n{not-json}\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	if page, err := workspace.ResourcePage(project.ID, "", 10); err != nil || len(page.Logs) != 10 || !page.LogPage.HasMore {
		t.Fatalf("initial page should stop before old malformed line: %+v %v", page, err)
	}
}

func readTestLogFile(t *testing.T, path string) string {
	t.Helper()
	data, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	return string(data)
}

func TestResourcePageCarriesCurrentAutoRunReasonOutsideLogPage(t *testing.T) {
	workspace, err := app.Initialize(t.TempDir(), "en")
	if err != nil {
		t.Fatal(err)
	}
	project, err := workspace.CreateProject("AutoRun project", "autorun")
	if err != nil {
		t.Fatal(err)
	}
	task, err := workspace.CreateTask(app.CreateTaskInput{ProjectID: project.ID, Title: "AutoRun task", Slug: "autorun", AutoRun: true})
	if err != nil {
		t.Fatal(err)
	}
	if _, err := workspace.FailAutoRun(app.AutoRunActionInput{TaskID: task.ID, Summary: "provider failed permanently"}); err != nil {
		t.Fatal(err)
	}
	for index := 0; index < 15; index++ {
		if _, err := workspace.AddLog(task.ID, fmt.Sprintf("noise %d", index), ""); err != nil {
			t.Fatal(err)
		}
	}
	detail, err := workspace.ResourcePage(task.ID, "", 10)
	if err != nil {
		t.Fatal(err)
	}
	if detail.AutoRun == nil || detail.AutoRun.State != "failed" || detail.AutoRun.StatusReason != "provider failed permanently" {
		t.Fatalf("current AutoRun reason was not projected in metadata: %+v", detail.AutoRun)
	}
	for _, entry := range detail.Logs {
		if entry.Title == "Auto Run failed" {
			t.Fatal("initial page unexpectedly needed the historical failure log")
		}
	}
}
