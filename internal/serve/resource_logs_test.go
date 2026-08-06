package serve

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/disksing/forge/internal/app"
)

func newPagedResourceServer(t *testing.T, count int) (*server, *app.Workspace, app.Project) {
	t.Helper()
	workspace, err := app.Initialize(t.TempDir(), "en")
	if err != nil {
		t.Fatal(err)
	}
	project, err := workspace.CreateProject("HTTP paged project", "http-paged")
	if err != nil {
		t.Fatal(err)
	}
	entries := testHTTPLogEntries(count)
	resource, err := workspace.ResourceValue(project.ID)
	if err != nil {
		t.Fatal(err)
	}
	path := filepath.Join(workspace.Root(), filepath.FromSlash(resource.Path), "log.jsonl")
	data := make([]byte, 0, count*100)
	for _, entry := range entries {
		encoded, err := json.Marshal(entry)
		if err != nil {
			t.Fatal(err)
		}
		data = append(data, encoded...)
		data = append(data, '\n')
	}
	if err := os.WriteFile(path, data, 0o644); err != nil {
		t.Fatal(err)
	}
	configPath := filepath.Join(t.TempDir(), "gui.json")
	s := &server{config: configPath}
	if err := s.saveConfig(config{Version: agentHubConfigVersion, Workspaces: []guiWorkspace{{ID: "workspace-one", Name: "Test", Path: workspace.Root()}}}); err != nil {
		t.Fatal(err)
	}
	return s, workspace, project
}

func testHTTPLogEntries(count int) []app.LogEntry {
	entries := make([]app.LogEntry, 0, count)
	for index := 0; index < count; index++ {
		entries = append(entries, app.LogEntry{
			ID: fmt.Sprintf("log-http-%03d", index), Time: fmt.Sprintf("2026-01-01T00:00:%02dZ", count-index),
			Title: fmt.Sprintf("http entry %03d", index),
		})
	}
	return entries
}

func decodeHTTPResourceDetail(t *testing.T, rec *httptest.ResponseRecorder) app.ResourceDetailView {
	t.Helper()
	if rec.Code != http.StatusOK {
		t.Fatalf("resource request returned %d: %s", rec.Code, rec.Body.String())
	}
	var detail app.ResourceDetailView
	if err := json.Unmarshal(rec.Body.Bytes(), &detail); err != nil {
		t.Fatalf("decode resource response: %v\n%s", err, rec.Body.String())
	}
	return detail
}

func TestResourceRouteUsesPagedLogsOnlyWhenRequestedAndKeepsDefaultFull(t *testing.T) {
	s, _, project := newPagedResourceServer(t, 31)
	path := "/api/workspaces/workspace-one/resources/" + project.ID + "?logsLimit=10"
	rec := httptest.NewRecorder()
	s.handleWorkspace(rec, httptest.NewRequest(http.MethodGet, path, nil))
	first := decodeHTTPResourceDetail(t, rec)
	if len(first.Logs) != 10 || first.LogPage == nil || !first.LogPage.HasMore || first.LogPage.NextCursor != "log-http-009" {
		t.Fatalf("unexpected initial HTTP log page: %+v", first)
	}

	rec = httptest.NewRecorder()
	olderPath := "/api/workspaces/workspace-one/resources/" + project.ID + "?logsCursor=" + first.LogPage.NextCursor + "&logsLimit=20"
	s.handleWorkspace(rec, httptest.NewRequest(http.MethodGet, olderPath, nil))
	older := decodeHTTPResourceDetail(t, rec)
	if len(older.Logs) != 20 || older.Logs[0].ID != "log-http-010" || older.Logs[19].ID != "log-http-029" || !older.LogPage.HasMore {
		t.Fatalf("unexpected older HTTP log page: %+v", older)
	}

	rec = httptest.NewRecorder()
	s.handleWorkspace(rec, httptest.NewRequest(http.MethodGet, "/api/workspaces/workspace-one/resources/"+project.ID, nil))
	full := decodeHTTPResourceDetail(t, rec)
	if len(full.Logs) != 31 || full.LogPage != nil {
		t.Fatalf("unpaged resource route lost full compatibility: logs=%d page=%+v", len(full.Logs), full.LogPage)
	}
}

func TestResourceRouteRejectsMalformedPagination(t *testing.T) {
	s, _, project := newPagedResourceServer(t, 2)
	for _, query := range []string{
		"?logsLimit=0",
		"?logsLimit=not-a-number",
		fmt.Sprintf("?logsLimit=%d", app.MaxResourceLogPageLimit+1),
		"?logsCursor=",
		"?logsCursor=missing&logsLimit=20",
	} {
		rec := httptest.NewRecorder()
		s.handleWorkspace(rec, httptest.NewRequest(http.MethodGet, "/api/workspaces/workspace-one/resources/"+project.ID+query, nil))
		if rec.Code != http.StatusBadRequest || strings.TrimSpace(rec.Body.String()) == "" {
			t.Fatalf("query %s returned %d %q, want structured 400", query, rec.Code, rec.Body.String())
		}
	}
}
