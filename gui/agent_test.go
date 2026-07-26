package main

import (
	"bytes"
	"encoding/json"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestAgentUploadStoresFilesInSessionArtifactsAndAvoidsOverwrite(t *testing.T) {
	workspace := t.TempDir()
	cwd := filepath.Join(workspace, "project1", "task1")
	if err := os.MkdirAll(cwd, 0o755); err != nil {
		t.Fatal(err)
	}
	manager := testUploadAgentManager(t, workspace, cwd)

	first := performAgentUpload(t, manager, "../../report.txt", "first")
	second := performAgentUpload(t, manager, "report.txt", "second")
	if first.Path != "artifacts/upload/report.txt" || second.Path != "artifacts/upload/report (2).txt" {
		t.Fatalf("unexpected upload responses: first=%#v second=%#v", first, second)
	}
	for name, want := range map[string]string{"report.txt": "first", "report (2).txt": "second"} {
		data, err := os.ReadFile(filepath.Join(cwd, "artifacts", "upload", name))
		if err != nil {
			t.Fatal(err)
		}
		if string(data) != want {
			t.Fatalf("unexpected content for %s: %q", name, data)
		}
	}
	if _, err := os.Stat(filepath.Join(workspace, "report.txt")); !os.IsNotExist(err) {
		t.Fatalf("malicious filename escaped upload directory: %v", err)
	}
}

func TestAgentUploadRejectsEscapingUploadSymlink(t *testing.T) {
	workspace := t.TempDir()
	cwd := filepath.Join(workspace, "project1", "task1")
	outside := t.TempDir()
	if err := os.MkdirAll(filepath.Join(cwd, "artifacts"), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.Symlink(outside, filepath.Join(cwd, "artifacts", "upload")); err != nil {
		t.Skipf("symlinks unavailable: %v", err)
	}
	manager := testUploadAgentManager(t, workspace, cwd)
	recorder := httptest.NewRecorder()
	manager.handle(recorder, agentUploadRequest(t, "escape.txt", "blocked"), "workspace-one", []string{"runs", "run-one", "uploads"})
	if recorder.Code != http.StatusBadRequest || !strings.Contains(recorder.Body.String(), "escapes the agent session") {
		t.Fatalf("expected escaping symlink rejection, got %d: %s", recorder.Code, recorder.Body.String())
	}
}

func TestSafeUploadNameRemovesPathsAndUnsafeCharacters(t *testing.T) {
	for input, want := range map[string]string{
		"../../notes.md":      "notes.md",
		`..\\..\\windows.txt`: "windows.txt",
		"bad\x00name?.png":    "bad_name_.png",
		" . ":                 "upload",
		"截图 1.png":            "截图 1.png",
	} {
		if got := safeUploadName(input); got != want {
			t.Fatalf("safeUploadName(%q) = %q, want %q", input, got, want)
		}
	}
}

func testUploadAgentManager(t *testing.T, workspace, cwd string) *agentManager {
	t.Helper()
	configPath := filepath.Join(t.TempDir(), "gui.json")
	writeCurrentTestConfig(t, configPath, workspace)
	manager := newAgentManager(&server{config: configPath})
	manager.registerRuntime(&agentRuntime{
		workspace: guiWorkspace{ID: "workspace-one", Path: workspace},
		run:       agentRun{ID: "run-one", WorkspaceID: "workspace-one", Cwd: cwd, Status: "idle"},
	})
	return manager
}

func performAgentUpload(t *testing.T, manager *agentManager, name, content string) agentUploadResponse {
	t.Helper()
	recorder := httptest.NewRecorder()
	manager.handle(recorder, agentUploadRequest(t, name, content), "workspace-one", []string{"runs", "run-one", "uploads"})
	if recorder.Code != http.StatusOK {
		t.Fatalf("expected upload success, got %d: %s", recorder.Code, recorder.Body.String())
	}
	var response agentUploadResponse
	if err := json.Unmarshal(recorder.Body.Bytes(), &response); err != nil {
		t.Fatal(err)
	}
	return response
}

func agentUploadRequest(t *testing.T, name, content string) *http.Request {
	t.Helper()
	var body bytes.Buffer
	writer := multipart.NewWriter(&body)
	part, err := writer.CreateFormFile("file", name)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := part.Write([]byte(content)); err != nil {
		t.Fatal(err)
	}
	if err := writer.Close(); err != nil {
		t.Fatal(err)
	}
	request := httptest.NewRequest(http.MethodPost, "/api/workspaces/workspace-one/agent/runs/run-one/uploads", &body)
	request.Header.Set("Content-Type", writer.FormDataContentType())
	return request
}

func TestLegacyRunHistoryRemainsReadableButLegacyFieldsAreNeverRewritten(t *testing.T) {
	workspace := t.TempDir()
	indexPath := agentIndexPath(workspace)
	if err := os.MkdirAll(filepath.Dir(indexPath), 0o755); err != nil {
		t.Fatal(err)
	}
	legacy := `[{
	  "id":"legacy-run",
	  "workspaceId":"workspace-one",
	  "provider":"codex",
	  "providerSessionId":"thread-1",
	  "codexThreadId":"thread-1",
	  "codexTurnId":"turn-1",
	  "title":"Historical run",
	  "cwd":"` + filepath.ToSlash(workspace) + `",
	  "status":"idle",
	  "model":"gpt-old",
	  "sandbox":"workspace-write",
	  "approval":"on-request",
	  "createdAt":"2026-01-01T00:00:00Z",
	  "updatedAt":"2026-01-01T00:00:00Z"
	}]`
	if err := os.WriteFile(indexPath, []byte(legacy), 0o644); err != nil {
		t.Fatal(err)
	}
	eventsPath := agentEventsPath(workspace, "legacy-run")
	if err := os.MkdirAll(filepath.Dir(eventsPath), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(eventsPath, []byte(`{"id":1,"type":"assistant_delta","text":"historical output"}`+"\n"), 0o644); err != nil {
		t.Fatal(err)
	}

	run, events, _, err := loadAgentRunDetail(workspace, "legacy-run")
	if err != nil {
		t.Fatal(err)
	}
	if run.Title != "Historical run" || len(events) != 1 || events[0].Text != "historical output" {
		t.Fatalf("legacy history was not preserved: run=%#v events=%#v", run, events)
	}
	if err := saveAgentRun(workspace, run); err != nil {
		t.Fatal(err)
	}
	saved, err := os.ReadFile(indexPath)
	if err != nil {
		t.Fatal(err)
	}
	for _, forbidden := range []string{"providerSessionId", "codexThreadId", "codexTurnId", `"provider"`, `"model"`, `"sandbox"`, `"approval"`} {
		if bytes.Contains(saved, []byte(forbidden)) {
			t.Fatalf("legacy field %q was rewritten into the current run schema:\n%s", forbidden, saved)
		}
	}
}

func TestLegacyRunControlEndpointsRejectWithoutStartingAnything(t *testing.T) {
	workspace := t.TempDir()
	configPath := filepath.Join(t.TempDir(), "gui.json")
	writeCurrentTestConfig(t, configPath, workspace)
	manager := newAgentManager(&server{config: configPath})
	manager.registerRuntime(&agentRuntime{
		workspace: guiWorkspace{ID: "workspace-one", Path: workspace},
		run:       agentRun{ID: "legacy-run", WorkspaceID: "workspace-one", Status: "idle"},
	})
	for _, endpoint := range []struct {
		path string
		body string
		call func(http.ResponseWriter, *http.Request, string, string)
	}{
		{path: "input", body: `{"text":"continue"}`, call: manager.sendInput},
		{path: "stop", body: `{}`, call: manager.stopRun},
		{path: "resume", body: `{}`, call: manager.resumeRun},
		{path: "approval", body: `{"requestId":"old","decision":"accept"}`, call: manager.resolveApproval},
	} {
		request := httptest.NewRequest(http.MethodPost, "/"+endpoint.path, strings.NewReader(endpoint.body))
		recorder := httptest.NewRecorder()
		endpoint.call(recorder, request, "workspace-one", "legacy-run")
		if recorder.Code != http.StatusConflict {
			t.Fatalf("%s should reject legacy control, got %d: %s", endpoint.path, recorder.Code, recorder.Body.String())
		}
		if !strings.Contains(recorder.Body.String(), "read-only") {
			t.Fatalf("%s rejection should explain read-only history: %s", endpoint.path, recorder.Body.String())
		}
	}
}

func TestReplaceAgentsUserContentPreservesManagedBlock(t *testing.T) {
	current := "# Old Notes\n\n" + agentsManagedStart + "\nsystem\n" + agentsManagedEnd + "\n\n# Tail\n"
	got, err := replaceAgentsUserContent(current, "# New Notes\n")
	if err != nil {
		t.Fatal(err)
	}
	want := "# New Notes\n\n" + agentsManagedStart + "\nsystem\n" + agentsManagedEnd + "\n"
	if got != want {
		t.Fatalf("unexpected AGENTS.md content\nwant:\n%s\ngot:\n%s", want, got)
	}
}

func writeCurrentTestConfig(t *testing.T, path, workspace string) {
	t.Helper()
	data, err := json.Marshal(agentHubGUIConfig{
		Version:                  agentHubConfigVersion,
		Workspaces:               []guiWorkspace{{ID: "workspace-one", Path: workspace}},
		AgentHubEndpoint:         defaultAgentHubEndpoint,
		AgentHubInstanceID:       "forge-test",
		DefaultAgentHubAgentName: "test-agent",
	})
	if err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(path, data, 0o600); err != nil {
		t.Fatal(err)
	}
}

func mustReadFile(t *testing.T, path string) []byte {
	t.Helper()
	data, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	return data
}
