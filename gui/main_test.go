package main

import (
	"bytes"
	"encoding/json"
	"encoding/xml"
	"io/fs"
	"net/http"
	"net/http/httptest"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
)

func TestFaviconIsLinkedAndEmbedded(t *testing.T) {
	indexData, err := staticFiles.ReadFile("static/index.html")
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(string(indexData), `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />`) {
		t.Fatal("SVG favicon link is missing from the page head")
	}

	staticRoot, err := fs.Sub(staticFiles, "static")
	if err != nil {
		t.Fatal(err)
	}
	req := httptest.NewRequest(http.MethodGet, "/favicon.svg", nil)
	rec := httptest.NewRecorder()
	serveStatic(staticRoot, rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("favicon request returned %d: %s", rec.Code, rec.Body.String())
	}
	if got := rec.Header().Get("Content-Type"); got != "image/svg+xml" {
		t.Fatalf("favicon content type is %q, want image/svg+xml", got)
	}

	var icon struct {
		XMLName xml.Name
	}
	if err := xml.Unmarshal(rec.Body.Bytes(), &icon); err != nil {
		t.Fatalf("favicon is not valid XML: %v", err)
	}
	if icon.XMLName.Local != "svg" {
		t.Fatalf("favicon root element is %q, want svg", icon.XMLName.Local)
	}
}

func TestWorkspaceNavigationDefaultsToWorkspaceDetails(t *testing.T) {
	data, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	source := string(data)

	if got := strings.Count(source, `state.selectedId = route.resourceId || "workspace";`); got != 2 {
		t.Fatalf("initial load and popstate should default routes to workspace details; got %d matches", got)
	}
	for _, want := range []string{
		`function ensureValidSelection() {
  if (state.selectedId === "workspace" || findResource(state.selectedId)) return false;
  state.selectedId = "workspace";
  return true;
}`,
		`state.activeWorkspaceId = id;
  state.selectedId = "workspace";`,
		`if (ensureValidSelection()) {
      syncURL({ replace: true });`,
		`ensureValidSelection();
    if (state.selectedId === "workspace") {
      await loadWorkspaceAgents();`,
	} {
		if !strings.Contains(source, want) {
			t.Fatalf("workspace navigation is missing %q", want)
		}
	}
	for _, oldFallback := range []string{
		`state.selectedId = state.tree.projects[0]?.id || "workspace";`,
		`state.selectedId = tree.projects[0]?.id || "workspace";`,
	} {
		if strings.Contains(source, oldFallback) {
			t.Fatalf("workspace navigation still selects the first project with %q", oldFallback)
		}
	}
}

func TestWorkspaceWikiPreviewIsScopedAndReadable(t *testing.T) {
	workspace := t.TempDir()
	wikiDir := filepath.Join(workspace, "wiki")
	if err := os.MkdirAll(filepath.Join(wikiDir, "guides"), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(wikiDir, "guides", "notes.md"), []byte("# Notes\n\nSafe content.\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	outside := filepath.Join(workspace, "outside.txt")
	if err := os.WriteFile(outside, []byte("secret"), 0o644); err != nil {
		t.Fatal(err)
	}

	s := &server{config: filepath.Join(t.TempDir(), "gui.json")}
	if err := s.saveConfig(config{Version: 1, Workspaces: []guiWorkspace{{ID: "workspace-one", Path: workspace}}}); err != nil {
		t.Fatal(err)
	}

	req := httptest.NewRequest(http.MethodGet, "/api/workspaces/workspace-one/wiki/files?path=guides%2Fnotes.md", nil)
	rec := httptest.NewRecorder()
	s.handleWorkspace(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected Wiki Markdown preview, got %d: %s", rec.Code, rec.Body.String())
	}
	var preview filePreview
	if err := json.Unmarshal(rec.Body.Bytes(), &preview); err != nil {
		t.Fatal(err)
	}
	if preview.Path != "guides/notes.md" || preview.Binary || !strings.Contains(preview.Content, "Safe content") {
		t.Fatalf("unexpected Wiki preview: %+v", preview)
	}

	for _, path := range []string{"../outside.txt", "guides/../../outside.txt", "/etc/passwd"} {
		req := httptest.NewRequest(http.MethodGet, "/api/workspaces/workspace-one/wiki/files?path="+path, nil)
		rec := httptest.NewRecorder()
		s.handleWorkspace(rec, req)
		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected Wiki traversal %q to be rejected, got %d: %s", path, rec.Code, rec.Body.String())
		}
	}

	if err := os.Symlink(outside, filepath.Join(wikiDir, "outside-link.txt")); err != nil {
		t.Fatal(err)
	}
	for _, suffix := range []string{"wiki/files?path=outside-link.txt", "wiki/files/raw?path=outside-link.txt"} {
		req := httptest.NewRequest(http.MethodGet, "/api/workspaces/workspace-one/"+suffix, nil)
		rec := httptest.NewRecorder()
		s.handleWorkspace(rec, req)
		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected external Wiki symlink to be rejected, got %d: %s", rec.Code, rec.Body.String())
		}
	}

	req = httptest.NewRequest(http.MethodGet, "/api/workspaces/workspace-one/wiki/files?path=missing.md", nil)
	rec = httptest.NewRecorder()
	s.handleWorkspace(rec, req)
	if rec.Code != http.StatusNotFound || !strings.Contains(rec.Body.String(), "no such file") {
		t.Fatalf("expected a clear missing Wiki file response, got %d: %s", rec.Code, rec.Body.String())
	}
}

func TestWorkspaceWikiUIReusesTreePreviewAndStates(t *testing.T) {
	appData, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	app := string(appData)
	for _, want := range []string{
		`${workspaceWikiSection()}`,
		`return artifactSection("Wiki", wiki.entries, "No Wiki files yet.");`,
		`<strong>Wiki not initialized</strong>`,
		`<strong>Wiki unavailable</strong>`,
		`section === "Wiki" ? "wiki/files" : "files"`,
		`section === "Wiki" ? "wiki/files/raw" : "files/raw"`,
		`changed && state.preview?.section === "Wiki"`,
	} {
		if !strings.Contains(app, want) {
			t.Fatalf("Workspace Wiki UI is missing %q", want)
		}
	}

	stylesData, err := staticFiles.ReadFile("static/styles.css")
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(string(stylesData), ".wiki-status {") {
		t.Fatal("Workspace Wiki status styling is missing")
	}
}

func TestCreateTaskMapsAutoRunOptions(t *testing.T) {
	workspace := t.TempDir()
	outputPath := filepath.Join(t.TempDir(), "args")
	forgePath := filepath.Join(t.TempDir(), "forge-fake")
	script := "#!/bin/sh\nprintf '%s\\n' \"$@\" > \"$FORGE_TEST_ARGS\"\nprintf '{}\\n'\n"
	if err := os.WriteFile(forgePath, []byte(script), 0o755); err != nil {
		t.Fatal(err)
	}
	t.Setenv("FORGE_TEST_ARGS", outputPath)

	configPath := filepath.Join(t.TempDir(), "gui.json")
	s := &server{config: configPath, forgePath: forgePath}
	if err := s.saveConfig(config{Version: 1, Workspaces: []guiWorkspace{{ID: "workspace-one", Path: workspace}}}); err != nil {
		t.Fatal(err)
	}

	body := `{"project":"project1","title":"Automated task","detail":"Durable brief","slug":"automated","autorun":true,"preferredAgentProfiles":["kimi","codex"],"prompt":"Do the work"}`
	req := httptest.NewRequest(http.MethodPost, "/api/workspaces/workspace-one/tasks", bytes.NewBufferString(body))
	rec := httptest.NewRecorder()
	s.createTask(rec, req, "workspace-one")
	if rec.Code != http.StatusOK {
		t.Fatalf("expected OK, got %d: %s", rec.Code, rec.Body.String())
	}
	data, err := os.ReadFile(outputPath)
	if err != nil {
		t.Fatal(err)
	}
	args := strings.Split(strings.TrimSpace(string(data)), "\n")
	want := []string{"task", "create", "--project", "project1", "--autorun", "--agent-profile=kimi", "--agent-profile=codex", "--prompt=Do the work", "--slug", "automated", "--detail=Durable brief", "Automated task"}
	if strings.Join(args, "\x00") != strings.Join(want, "\x00") {
		t.Fatalf("unexpected forge args:\n got: %#v\nwant: %#v", args, want)
	}

	body = `{"project":"project1","title":"Legacy task","autorun":true,"agentId":"codex-one"}`
	req = httptest.NewRequest(http.MethodPost, "/api/workspaces/workspace-one/tasks", bytes.NewBufferString(body))
	rec = httptest.NewRecorder()
	s.createTask(rec, req, "workspace-one")
	if rec.Code != http.StatusOK {
		t.Fatalf("expected legacy Agent ID compatibility, got %d: %s", rec.Code, rec.Body.String())
	}
	data, err = os.ReadFile(outputPath)
	if err != nil {
		t.Fatal(err)
	}
	args = strings.Split(strings.TrimSpace(string(data)), "\n")
	want = []string{"task", "create", "--project", "project1", "--autorun", "--agent=codex-one", "Legacy task"}
	if strings.Join(args, "\x00") != strings.Join(want, "\x00") {
		t.Fatalf("unexpected legacy forge args:\n got: %#v\nwant: %#v", args, want)
	}
}

func TestCreateTaskMapsTemplateBodyAsCompleteMarkdown(t *testing.T) {
	workspace := t.TempDir()
	outputPath := filepath.Join(t.TempDir(), "args")
	forgePath := filepath.Join(t.TempDir(), "forge-fake")
	script := "#!/bin/sh\nprintf '%s\\n' \"$@\" > \"$FORGE_TEST_ARGS\"\nprintf '{}\\n'\n"
	if err := os.WriteFile(forgePath, []byte(script), 0o755); err != nil {
		t.Fatal(err)
	}
	t.Setenv("FORGE_TEST_ARGS", outputPath)

	s := &server{config: filepath.Join(t.TempDir(), "gui.json"), forgePath: forgePath}
	if err := s.saveConfig(config{Version: 1, Workspaces: []guiWorkspace{{ID: "workspace-one", Path: workspace}}}); err != nil {
		t.Fatal(err)
	}

	body := `{"project":"project1","title":"Template task","taskMarkdown":"# Template task"}`
	req := httptest.NewRequest(http.MethodPost, "/api/workspaces/workspace-one/tasks", bytes.NewBufferString(body))
	rec := httptest.NewRecorder()
	s.createTask(rec, req, "workspace-one")
	if rec.Code != http.StatusOK {
		t.Fatalf("expected OK, got %d: %s", rec.Code, rec.Body.String())
	}
	data, err := os.ReadFile(outputPath)
	if err != nil {
		t.Fatal(err)
	}
	args := strings.Split(strings.TrimSpace(string(data)), "\n")
	want := []string{"task", "create", "--project", "project1", "--task-markdown=# Template task", "Template task"}
	if strings.Join(args, "\x00") != strings.Join(want, "\x00") {
		t.Fatalf("unexpected forge args:\n got: %#v\nwant: %#v", args, want)
	}
}

func TestArchiveResourceUsesUnifiedResourceCommand(t *testing.T) {
	workspace := t.TempDir()
	outputPath := filepath.Join(t.TempDir(), "args")
	forgePath := filepath.Join(t.TempDir(), "forge-fake")
	script := "#!/bin/sh\nprintf '%s\\n' \"$@\" > \"$FORGE_TEST_ARGS\"\nprintf 'archived/path\\n'\n"
	if err := os.WriteFile(forgePath, []byte(script), 0o755); err != nil {
		t.Fatal(err)
	}
	t.Setenv("FORGE_TEST_ARGS", outputPath)
	s := &server{config: filepath.Join(t.TempDir(), "gui.json"), forgePath: forgePath}
	if err := s.saveConfig(config{Version: 1, Workspaces: []guiWorkspace{{ID: "workspace-one", Path: workspace}}}); err != nil {
		t.Fatal(err)
	}

	req := httptest.NewRequest(http.MethodPost, "/api/workspaces/workspace-one/archive", strings.NewReader(`{"resourceId":"project1.task1"}`))
	rec := httptest.NewRecorder()
	s.archiveResource(rec, req, "workspace-one")
	if rec.Code != http.StatusOK {
		t.Fatalf("expected OK, got %d: %s", rec.Code, rec.Body.String())
	}
	data, err := os.ReadFile(outputPath)
	if err != nil {
		t.Fatal(err)
	}
	if got, want := strings.TrimSpace(string(data)), "resource\narchive\n--id=project1.task1"; got != want {
		t.Fatalf("unexpected forge args:\n%s\nwant:\n%s", got, want)
	}
}

func TestCreateTaskRejectsRunOptionsWithoutAutoRun(t *testing.T) {
	s := &server{}
	req := httptest.NewRequest(http.MethodPost, "/api/workspaces/workspace-one/tasks", strings.NewReader(`{"project":"project1","title":"Task","prompt":"Do the work"}`))
	rec := httptest.NewRecorder()
	s.createTask(rec, req, "workspace-one")
	if rec.Code != http.StatusBadRequest || !strings.Contains(rec.Body.String(), "require autorun") {
		t.Fatalf("expected validation error, got %d: %s", rec.Code, rec.Body.String())
	}
}

func TestCreateTaskDialogIncludesAutomationFields(t *testing.T) {
	data, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	source := string(data)
	for _, want := range []string{`name="autorun"`, `name="prompt"`, `name="agentProfiles"`, `preferredAgentProfiles: dialog.autorun`} {
		if !strings.Contains(source, want) {
			t.Fatalf("create task dialog is missing %q", want)
		}
	}
}

func TestAgentProfileSettingsAndAutoRunStatusUI(t *testing.T) {
	data, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	source := string(data)
	for _, want := range []string{
		`AutoRun Agent Profiles`,
		`settings-profile-table`,
		`/api/settings/agent-profiles`,
		`preferredAgentProfiles`,
		`Actual Agent:`,
		`Legacy Agent:`,
	} {
		if !strings.Contains(source, want) {
			t.Fatalf("Agent Profile UI is missing %q", want)
		}
	}
}

func TestBackgroundRenderPreservesOpenSettingsModal(t *testing.T) {
	data, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	source := string(data)
	start := strings.Index(source, "function renderAll()")
	end := strings.Index(source, "function renderSelectionPanels()")
	if start < 0 || end <= start {
		t.Fatal("could not isolate renderAll")
	}
	renderAll := source[start:end]
	if !strings.Contains(renderAll, `if (!state.settings.open) renderSettingsModal();`) {
		t.Fatal("background renders should leave an open settings modal mounted")
	}
	if strings.Contains(renderAll, "\n  renderSettingsModal();") {
		t.Fatal("renderAll should not unconditionally rebuild the settings modal")
	}
}

func TestWorkspaceAgentsEditorFillsAvailableWidth(t *testing.T) {
	appData, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(string(appData), `id="workspaceAgentsForm" class="details-form workspace-agents-form"`) {
		t.Fatal("workspace AGENTS.md editor should have a layout-specific form class")
	}

	stylesData, err := staticFiles.ReadFile("static/styles.css")
	if err != nil {
		t.Fatal(err)
	}
	styles := string(stylesData)
	for _, want := range []string{
		`.workspace-agents-form {
  width: 100%;
  max-width: none;
  min-width: 0;`,
		`.workspace-agents-form textarea {
  min-width: 0;`,
	} {
		if !strings.Contains(styles, want) {
			t.Fatalf("responsive workspace AGENTS.md editor styles are missing %q", want)
		}
	}
}

func TestAgentUploadUIIncludesSelectionPasteProgressAndDraftBackfill(t *testing.T) {
	indexData, err := staticFiles.ReadFile("static/index.html")
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(string(indexData), `id="uploadDialogRoot"`) {
		t.Fatal("agent upload dialog root is missing")
	}

	appData, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	app := string(appData)
	for _, want := range []string{
		`id="agentUploadButton" class="tty-upload-button"`,
		`id="agentUploadInput" type="file" multiple`,
		`document.addEventListener("paste"`,
		`clipboardUploadFiles(event.clipboardData)`,
		`items.forEach(uploadAgentFile)`,
		`request.upload.addEventListener("progress"`,
		`item.status = "success"`,
		`item.status = "error"`,
		`.filter((item) => item.status === "success" && item.path)`,
		`function appendUploadedPaths(draft, paths)`,
		"return `${draft}${draft.endsWith(\"\\n\") ? \"\" : \"\\n\"}${block}`;",
	} {
		if !strings.Contains(app, want) {
			t.Fatalf("agent upload UI is missing %q", want)
		}
	}

	stylesData, err := staticFiles.ReadFile("static/styles.css")
	if err != nil {
		t.Fatal(err)
	}
	styles := string(stylesData)
	for _, want := range []string{".upload-dialog-layer", ".upload-drop-zone", ".upload-progress", ".upload-item-success", ".upload-item-error"} {
		if !strings.Contains(styles, want) {
			t.Fatalf("agent upload UI styles are missing %q", want)
		}
	}
}

func TestTreeTaskStatusCombinesAutoRunSessionsAndLocks(t *testing.T) {
	appData, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	app := string(appData)
	for _, want := range []string{
		`function taskOperationalState(item)`,
		`function deriveTaskPrimaryState(autoRun, sessions)`,
		`session.schedulerTurn && session.autoRunGeneration === autoRun.generation`,
		`function taskAgentSessions(resourceId)`,
		`session.resourceId === resourceId`,
		`function taskLocks(resourceId)`,
		`sessionControls(session).some((control) => control.resourceId === resourceId)`,
		`class="task-status-slot`,
		`task-lock-indicator`,
		`button.setAttribute("aria-label"`,
		`button.setAttribute("aria-describedby"`,
	} {
		if !strings.Contains(app, want) {
			t.Fatalf("combined task tree status is missing %q", want)
		}
	}
	if strings.Contains(app, `function taskSessionState(resourceId)`) {
		t.Fatal("tree status should not use the legacy session-only state derivation")
	}

	stylesData, err := staticFiles.ReadFile("static/styles.css")
	if err != nil {
		t.Fatal(err)
	}
	styles := string(stylesData)
	for _, want := range []string{
		`.task-status-auto-running .task-status-indicator`,
		`.task-status-session-running .task-status-indicator`,
		`.task-lock-external`,
		`.task-status-tooltip`,
		`@media (prefers-reduced-motion: reduce)`,
	} {
		if !strings.Contains(styles, want) {
			t.Fatalf("combined task tree status styles are missing %q", want)
		}
	}
}

func TestSessionDisplayTitleUsesLockedResourceTitle(t *testing.T) {
	node, err := exec.LookPath("node")
	if err != nil {
		t.Skip("node is required for the session title behavior test")
	}
	appData, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	app := string(appData)
	start := strings.Index(app, "function sessionDisplayTitle(session, resourceId)")
	if start < 0 {
		t.Fatal("could not find session title function")
	}
	end := strings.Index(app[start:], "function sessionControls(session)")
	if end < 0 {
		t.Fatal("could not isolate session title function")
	}
	end += start

	script := `
const resources = new Map([
  ["project1", { id: "project1", title: "Forge" }],
  ["project1.task1", { id: "project1.task1", title: "Fix session title" }],
]);
function findResource(id) {
  return resources.get(id) || null;
}
function assertEqual(actual, expected, message) {
  if (actual !== expected) throw new Error(message + ": expected " + expected + ", got " + actual);
}
` + app[start:end] + `
assertEqual(
  sessionDisplayTitle({ source: "external", id: "session-internal-name" }, "project1.task1"),
  "Fix session title",
  "external session should use the locked task title",
);
assertEqual(
  sessionDisplayTitle({ source: "internal", id: "session-one", agentRunTitle: "Title captured at launch" }, "project1.task1"),
  "Title captured at launch",
  "internal session should keep its captured run title",
);
assertEqual(
  sessionDisplayTitle({ source: "external", id: "session-missing" }, "project1.task404"),
  "project1.task404",
  "missing resources should fall back to the resource id",
);
assertEqual(
  sessionDisplayTitle({ source: "external", id: "session-unlocked" }, ""),
  "session-unlocked",
  "unlocked sessions should fall back to the session id",
);
`

	testFile := filepath.Join(t.TempDir(), "session-display-title.js")
	if err := os.WriteFile(testFile, []byte(script), 0o600); err != nil {
		t.Fatal(err)
	}
	if output, err := exec.Command(node, testFile).CombinedOutput(); err != nil {
		t.Fatalf("session title behavior test failed: %v\n%s", err, output)
	}
}

func TestTreeProjectStatusCombinesSessionsAndLocks(t *testing.T) {
	appData, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	app := string(appData)
	for _, want := range []string{
		`const taskState = taskOperationalState(item);`,
		`if (taskState.label)`,
		`const sessions = taskAgentSessions(item.id);`,
		`const locks = taskLocks(item.id);`,
		`const primary = deriveTaskPrimaryState(item.autoRun, sessions);`,
		`const projectState = taskOperationalState(project);`,
		"parts.push(`${project.id}:${projectState.kind}:${projectState.iconName}:${projectState.recentOutput}:${projectState.lock?.kind || \"none\"}:${projectState.label}`);",
	} {
		if !strings.Contains(app, want) {
			t.Fatalf("project tree session and lock status is missing %q", want)
		}
	}
	if strings.Contains(app, `kind === "task" ? taskOperationalState(item) : noTaskOperationalState()`) {
		t.Fatal("project tree rows should not receive an unconditional empty operational state")
	}
	if strings.Contains(app, `kind === "task" && taskState.label`) {
		t.Fatal("project tree status should expose the same accessible label and tooltip as task status")
	}
}

func TestProjectTaskTemplatesAreVisibleAndSelectable(t *testing.T) {
	data, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	source := string(data)
	for _, want := range []string{`<span>Task Templates</span>`, `data-template-preview`, `name="templateName"`, `applyCreateDialogTemplate`, `{ taskMarkdown: dialog.detail }`, `{ detail: dialog.detail }`} {
		if !strings.Contains(source, want) {
			t.Fatalf("task template UI is missing %q", want)
		}
	}
}

func TestCreateTaskDialogIsLargeAndResponsive(t *testing.T) {
	appData, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(string(appData), `class="create-dialog${isTask ? " create-task-dialog" : ""}${entering ? " modal-enter" : ""}"`) {
		t.Fatal("create task dialog should have a task-specific class")
	}

	stylesData, err := staticFiles.ReadFile("static/styles.css")
	if err != nil {
		t.Fatal(err)
	}
	styles := string(stylesData)
	for _, want := range []string{
		`.create-task-dialog {
  display: flex;
  flex-direction: column;
  width: min(900px, calc(100vw - 48px));
  height: min(760px, calc(100vh - 48px));
  height: min(760px, calc(100dvh - 48px));`,
		`.create-task-dialog .create-dialog-form {
  flex: 1;
  min-height: 0;
  overflow-y: auto;`,
		`.create-task-dialog textarea[name="detail"] {
  min-height: clamp(180px, 32vh, 340px);`,
		`.create-task-dialog {
    height: calc(100vh - 24px);
    height: calc(100dvh - 24px);`,
	} {
		if !strings.Contains(styles, want) {
			t.Fatalf("responsive create task dialog styles are missing %q", want)
		}
	}
}

func TestArtifactPreviewPreservesScrollAndSupportsNewWindow(t *testing.T) {
	data, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	source := string(data)
	for _, want := range []string{
		`const previewScrollState = captureFilePreviewScrollState();`,
		`restoreFilePreviewScrollState(previewScrollState);`,
		`data-preview-scroll`,
		`scroller.scrollTop = snapshot.scrollTop;`,
		`scroller.scrollLeft = snapshot.scrollLeft;`,
		`class="secondary-button file-modal-open"`,
		`target="_blank" rel="noopener"`,
	} {
		if !strings.Contains(source, want) {
			t.Fatalf("artifact preview behavior is missing %q", want)
		}
	}
}

func TestRawFileDownloadServesAttachment(t *testing.T) {
	workspace := t.TempDir()
	textContent := []byte("hello artifact\n")
	if err := os.WriteFile(filepath.Join(workspace, "notes.txt"), textContent, 0o644); err != nil {
		t.Fatal(err)
	}
	binaryContent := []byte{'P', 'K', 0x00, 0x01, 0xff, 0x02}
	if err := os.WriteFile(filepath.Join(workspace, "bundle.zip"), binaryContent, 0o644); err != nil {
		t.Fatal(err)
	}

	s := &server{config: filepath.Join(t.TempDir(), "gui.json")}
	if err := s.saveConfig(config{Version: 1, Workspaces: []guiWorkspace{{ID: "workspace-one", Path: workspace}}}); err != nil {
		t.Fatal(err)
	}

	// Binary files are rejected for inline raw preview.
	req := httptest.NewRequest(http.MethodGet, "/api/workspaces/workspace-one/files/raw?path=bundle.zip", nil)
	rec := httptest.NewRecorder()
	s.handleWorkspace(rec, req)
	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected binary inline preview to be rejected, got %d: %s", rec.Code, rec.Body.String())
	}

	// The same binary file downloads as an attachment.
	req = httptest.NewRequest(http.MethodGet, "/api/workspaces/workspace-one/files/raw?path=bundle.zip&download=1", nil)
	rec = httptest.NewRecorder()
	s.handleWorkspace(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected binary download to succeed, got %d: %s", rec.Code, rec.Body.String())
	}
	if disposition := rec.Header().Get("Content-Disposition"); !strings.HasPrefix(disposition, "attachment") || !strings.Contains(disposition, "bundle.zip") {
		t.Fatalf("unexpected Content-Disposition for download: %q", disposition)
	}
	if !bytes.Equal(rec.Body.Bytes(), binaryContent) {
		t.Fatalf("unexpected download body: %v", rec.Body.Bytes())
	}

	// Text files also download as attachments.
	req = httptest.NewRequest(http.MethodGet, "/api/workspaces/workspace-one/files/raw?path=notes.txt&download=1", nil)
	rec = httptest.NewRecorder()
	s.handleWorkspace(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected text download to succeed, got %d: %s", rec.Code, rec.Body.String())
	}
	if disposition := rec.Header().Get("Content-Disposition"); !strings.HasPrefix(disposition, "attachment") || !strings.Contains(disposition, "notes.txt") {
		t.Fatalf("unexpected Content-Disposition for text download: %q", disposition)
	}
	if !bytes.Equal(rec.Body.Bytes(), textContent) {
		t.Fatalf("unexpected text download body: %q", rec.Body.String())
	}
}

func TestArtifactRowShowsHoverDownloadButton(t *testing.T) {
	appData, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	app := string(appData)
	for _, want := range []string{
		`function artifactDownloadURL(path, section = "") {`,
		"`${rawFileURL(path, section)}&download=1`",
		`class="artifact-download"`,
		`data-artifact-download`,
		`event.target.closest("[data-artifact-download]")`,
	} {
		if !strings.Contains(app, want) {
			t.Fatalf("artifact download UI is missing %q", want)
		}
	}

	stylesData, err := staticFiles.ReadFile("static/styles.css")
	if err != nil {
		t.Fatal(err)
	}
	styles := string(stylesData)
	for _, want := range []string{
		".artifact-download {",
		".artifact-row:hover .artifact-download,",
		".artifact-row:focus-within .artifact-download {",
	} {
		if !strings.Contains(styles, want) {
			t.Fatalf("artifact download styling is missing %q", want)
		}
	}
}

func TestPageDetailsOmitSummaryStats(t *testing.T) {
	appData, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	app := string(appData)
	if strings.Contains(app, `class="meta-grid`) || strings.Contains(app, `class="metric`) || strings.Contains(app, "function metrics(") {
		t.Fatal("workspace, project, and task details should not render summary stats")
	}
	if strings.Contains(app, "function countFiles(") {
		t.Fatal("summary-only artifact counting should be removed")
	}
	for _, want := range []string{
		`<div class="title-row"><h1>${escapeHTML(workspaceName())}</h1></div>`,
		`${workspaceAgentsSection()}`,
		`<h1>${escapeHTML(detail.title)}</h1>`,
		`id="newTaskButton"`,
		`<button class="danger" id="archiveButton"`,
		`${fileSection(detail)}`,
		`${artifactSection("Artifacts", detail.artifacts)}`,
		`selected.type === "project" ? "" : worktreeSection(detail.repos)`,
	} {
		if !strings.Contains(app, want) {
			t.Fatalf("page details should retain %q after removing summary stats", want)
		}
	}

	stylesData, err := staticFiles.ReadFile("static/styles.css")
	if err != nil {
		t.Fatal(err)
	}
	styles := string(stylesData)
	for _, removed := range []string{".meta-grid", ".resource-meta-grid", ".metric"} {
		if strings.Contains(styles, removed) {
			t.Fatalf("summary-only style %q should be removed", removed)
		}
	}
}

func TestTTYComposerKeyboardSendModes(t *testing.T) {
	data, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	source := string(data)
	for _, want := range []string{
		`ttyMultiline: false`,
		`event.isComposing || event.keyCode === 229`,
		`if (event.metaKey || event.ctrlKey)`,
		`if (event.shiftKey)`,
		`if (state.agent.ttyMultiline) return`,
	} {
		if !strings.Contains(source, want) {
			t.Fatalf("TTY composer keyboard handling is missing %q", want)
		}
	}
}

func TestTTYComposerRestoresKeyboardFocusAfterSend(t *testing.T) {
	data, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	source := string(data)
	for _, want := range []string{
		`let restoreInputFocus = document.activeElement === input;`,
		`document.addEventListener("focusin", cancelInputFocusRestore, true);`,
		`restoreInputFocus = false;`,
		`document.removeEventListener("focusin", cancelInputFocusRestore, true);`,
		`$("ttyInput")?.focus({ preventScroll: true });`,
	} {
		if !strings.Contains(source, want) {
			t.Fatalf("TTY composer focus restoration is missing %q", want)
		}
	}

	removeListener := strings.Index(source, `document.removeEventListener("focusin", cancelInputFocusRestore, true);`)
	renderComposer := strings.Index(source[removeListener:], `renderTTYComposer();`)
	restoreFocus := strings.Index(source[removeListener:], `$("ttyInput")?.focus({ preventScroll: true });`)
	if removeListener < 0 || renderComposer < 0 || restoreFocus < 0 || renderComposer >= restoreFocus {
		t.Fatal("TTY composer should restore focus only after replacing the sending input")
	}
}

func TestAgentChooserSelectionUpdatesImmediately(t *testing.T) {
	data, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	source := string(data)
	start := strings.Index(source, `document.querySelectorAll("[data-agent-choice]").forEach((button) => {`)
	if start < 0 {
		t.Fatal("agent chooser click handler is missing")
	}
	end := strings.Index(source[start:], `const stopButton = $("agentStopButton");`)
	if end < 0 {
		t.Fatal("agent chooser click handler boundary is missing")
	}
	handler := source[start : start+end]
	wants := []string{
		`state.agent.agentId = button.dataset.agentChoice;`,
		`state.agent.agentChooserOpen = false;`,
		`renderTTYComposer();`,
		`bindAgentEvents();`,
	}
	previous := -1
	for _, want := range wants {
		index := strings.Index(handler, want)
		if index < 0 {
			t.Fatalf("agent chooser click handler is missing %q", want)
		}
		if index <= previous {
			t.Fatalf("agent chooser click handler runs %q out of order", want)
		}
		previous = index
	}
	if strings.Contains(handler, `applySelectedAgentOptions`) {
		t.Fatal("agent chooser click handler must not call the removed option synchronization helper")
	}
}

func TestAutoRunTTYComposerSupportsLiveIntervention(t *testing.T) {
	data, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	source := string(data)
	for _, want := range []string{
		`function preferredAgentRunID(runs)`,
		`run.schedulerTurn && isLiveAgentRun(run)`,
		`if (run.status !== "starting") return true;`,
		`function agentInputUnavailableReason(run, sessionReady = isAgentSessionReady(run))`,
		`placeholder="${escapeHTML(placeholder)}"${inputDisabled}`,
		`!previousRun.schedulerTurn`,
	} {
		if !strings.Contains(source, want) {
			t.Fatalf("AutoRun live intervention UI is missing %q", want)
		}
	}
}

func TestAutoRunStatusIsDistinctResponsiveAndMotionSafe(t *testing.T) {
	appData, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	app := string(appData)
	for _, want := range []string{
		`function autoRunPresentation(state)`,
		`queued: { label: "Queued", icon: "list-start" }`,
		`running: { label: "Running", icon: "activity" }`,
		`waiting: { label: "Waiting", icon: "clock-3" }`,
		`paused: { label: "Paused", icon: "pause" }`,
		`completed: { label: "Completed", icon: "circle-check" }`,
		`failed: { label: "Failed", icon: "circle-x" }`,
		`class="autorun-status autorun-status-${presentation.key}" role="status"`,
		`aria-label="AutoRun: ${escapeHTML(presentation.label)}"`,
		`class="autorun-title-icon" aria-hidden="true"`,
		`class="autorun-state autorun-state-${presentation.key}"`,
	} {
		if !strings.Contains(app, want) {
			t.Fatalf("accessible AutoRun status markup is missing %q", want)
		}
	}

	stylesData, err := staticFiles.ReadFile("static/styles.css")
	if err != nil {
		t.Fatal(err)
	}
	styles := string(stylesData)
	for _, want := range []string{
		`.autorun-status-queued`,
		`.autorun-status-running`,
		`.autorun-status-waiting`,
		`.autorun-status-paused`,
		`.autorun-status-completed`,
		`.autorun-status-failed`,
		`animation: autorun-running-border 3.6s linear infinite, autorun-running-pulse 2.6s ease-in-out infinite;`,
		`@media (prefers-reduced-motion: reduce)`,
		`.autorun-status-running .autorun-state-icon`,
		`animation: none;`,
		`@media (forced-colors: active)`,
		`@media (max-width: 420px)`,
		`--autorun-surface: color-mix(in srgb, var(--autorun-tone) 7%, var(--panel));`,
		`background: color-mix(in srgb, var(--autorun-tone) 12%, var(--bg));`,
		`flex-wrap: wrap;`,
		`overflow-wrap: anywhere;`,
	} {
		if !strings.Contains(styles, want) {
			t.Fatalf("responsive AutoRun status styles are missing %q", want)
		}
	}
}

func TestAgentChatRendersMarkdownFinalResponsesAndToolGroups(t *testing.T) {
	appData, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	app := string(appData)
	for _, want := range []string{
		`markTransientAgentReasoning(markTransientAgentStatus(markFinalAgentResponses(coalesceAgentEvents(events))))`,
		`<div class="agent-message-content markdown-rendered">${renderMarkdown(text)}</div>`,
		`function groupToolEvents(events)`,
		`previous.collapsed = true`,
		`const open = typeof userOpen === "boolean" ? userOpen : !group.collapsed`,
		`data-tool-group-key="${escapeHTML(key)}"${open ? " open" : ""}`,
		`function bindAgentToolGroupEvents()`,
		`state.agent.toolGroupOpen.set(details.dataset.toolGroupKey, !details.open)`,
		`function toolEventDetails(event)`,
		`function markTransientAgentStatus(events)`,
		`if (isTransientAgentStatus(event)) return Boolean(event.isActiveTransientStatus)`,
		`function markTransientAgentReasoning(events)`,
		`if (activeReasoning >= 0) result[activeReasoning].isActiveTransientReasoning = true`,
		`return event?.type !== "reasoning_delta" && event?.type !== "metadata"`,
		`if (event.type === "reasoning_delta") return Boolean(event.isActiveTransientReasoning)`,
		`function isAgentSessionReady(run)`,
		`function agentInputUnavailableReason(run, sessionReady = isAgentSessionReady(run))`,
	} {
		if !strings.Contains(app, want) {
			t.Fatalf("agent chat rendering is missing %q", want)
		}
	}

	stylesData, err := staticFiles.ReadFile("static/styles.css")
	if err != nil {
		t.Fatal(err)
	}
	styles := string(stylesData)
	for _, want := range []string{`.agent-message-row.assistant.final`, `.agent-message-content`, `.agent-tool-group[open]`, `.agent-tool-item pre`, `.tty-input:focus-within`} {
		if !strings.Contains(styles, want) {
			t.Fatalf("agent chat styles are missing %q", want)
		}
	}
	if strings.Contains(app, "Final response") || strings.Contains(app, "Progress update") {
		t.Fatal("agent message bubbles should rely on visual hierarchy without response labels")
	}
}

func TestAgentChatBoundsHistoryAndStreamsAfterLoadedCursor(t *testing.T) {
	appData, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	app := string(appData)
	for _, want := range []string{
		`const AGENT_INITIAL_VISIBLE_EVENT_COUNT = 40;`,
		`const AGENT_OLDER_RAW_PAGE_LIMIT = 250;`,
		`const AGENT_MANUAL_VISIBLE_EVENT_COUNT = 1;`,
		`const AGENT_MANUAL_RAW_PAGE_LIMIT = 500;`,
		`const AGENT_INITIAL_AUTO_PAGE_LIMIT = 2;`,
		`const AGENT_MANUAL_AUTO_PAGE_LIMIT = 8;`,
		`state.agent.historyBeforeId = oldestRawAgentEventID(events);`,
		`function latestAgentEventID()`,
		`const after = latestAgentEventID();`,
		`/stream${query}`,
		`if (!isLiveAgentRun(currentAgentRun()))`,
		`async function refreshAgentRunMetadata()`,
		`refreshAgentRunMetadata().then(renderAll)`,
		`scheduleAgentRender({ full: !mergedDelta })`,
		`function renderLatestAgentDelta()`,
		`content.innerHTML = renderMarkdown(agentDisplayText(event));`,
	} {
		if !strings.Contains(app, want) {
			t.Fatalf("bounded agent history behavior is missing %q", want)
		}
	}
	if strings.Contains(app, `loadAgentRuns().then(renderAll)`) {
		t.Fatal("turn completion should refresh run metadata without reloading the full event tail")
	}
}

func TestLoadOlderAgentEventsAdvancesRawCursorAcrossCoalescedDelta(t *testing.T) {
	node, err := exec.LookPath("node")
	if err != nil {
		t.Skip("node is required for the agent history behavior test")
	}
	appData, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	app := string(appData)
	start := strings.Index(app, "async function loadOlderAgentEvents()")
	end := strings.Index(app, "function fetchAgentRuns()")
	if start < 0 || end <= start {
		t.Fatal("could not isolate agent history loading functions")
	}

	script := `
const AGENT_OLDER_RAW_PAGE_LIMIT = 250;
const AGENT_MANUAL_VISIBLE_EVENT_COUNT = 1;
const AGENT_MANUAL_RAW_PAGE_LIMIT = 500;
const AGENT_INITIAL_AUTO_PAGE_LIMIT = 2;
const AGENT_MANUAL_AUTO_PAGE_LIMIT = 8;
const state = {
  activeWorkspaceId: "workspace",
  agent: {
    activeRunId: "run",
    loadingOlder: false,
    eventsHasMore: true,
    historyBeforeId: 3000,
    events: [{ id: 3000, type: "assistant_delta", text: "current", data: { messageId: "long-message" } }],
  },
};
const pages = new Map([
  [3000, [{ id: 2500, type: "assistant_delta", text: "earlier chunk", data: { messageId: "long-message" } }]],
  [2500, [{ id: 2000, type: "assistant_delta", text: "older reply", data: { messageId: "older-message" } }]],
]);
const requestedBefore = [];
const requestedLimits = [];
function assert(condition, message) {
  if (!condition) throw new Error(message);
}
function $(id) {
  return id === "ttyLog" ? { scrollHeight: 0, scrollTop: 0 } : null;
}
function renderTTY() {}
function refreshIcons() {}
function displayAgentEvents(events) {
  return events.filter((event) => event.type === "assistant_delta" || event.type === "user");
}
function coalesceAgentEvents(events) {
  const result = [];
  for (const event of events) {
    const last = result[result.length - 1];
    if (last?.type === event.type && last?.data?.messageId === event?.data?.messageId) {
      last.id = event.id;
      last.text += event.text;
    } else {
      result.push({ ...event, data: { ...event.data } });
    }
  }
  return result;
}
async function api(url) {
  const params = new URL(url, "http://forge.test").searchParams;
  const before = Number(params.get("before"));
  requestedBefore.push(before);
  requestedLimits.push(Number(params.get("limit")));
  return { events: pages.get(before) || [], hasMore: before > 2500 };
}
` + app[start:end] + `
(async () => {
  await loadOlderAgentEvents();
  assert(requestedBefore.join(",") === "3000,2500", "raw history cursor should advance even when display coalescing keeps a newer event id");
  assert(requestedLimits.join(",") === "500,500", "manual history should use bounded 500-event pages until a visible message is found");
  assert(visibleAgentEventCount() === 2, "older visible reply was not loaded through reasoning noise");
  assert(state.agent.events[0].text === "older reply", "older events should be prepended in chronological order");
  assert(state.agent.historyBeforeId === 2000, "raw history cursor should track the oldest server event id");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
`

	testFile := filepath.Join(t.TempDir(), "agent-load-older-events.js")
	if err := os.WriteFile(testFile, []byte(script), 0o600); err != nil {
		t.Fatal(err)
	}
	if output, err := exec.Command(node, testFile).CombinedOutput(); err != nil {
		t.Fatalf("agent history behavior test failed: %v\n%s", err, output)
	}
}

func TestAgentChatReasoningIsTransientAndDoesNotSplitToolGroups(t *testing.T) {
	node, err := exec.LookPath("node")
	if err != nil {
		t.Skip("node is required for the agent chat behavior test")
	}
	appData, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	app := string(appData)
	start := strings.Index(app, "function coalesceAgentEvents(events)")
	end := strings.Index(app, "function renderAgent()")
	if start < 0 || end <= start {
		t.Fatal("could not isolate agent event transformation functions")
	}

	script := `
const state = { agent: { activeRunId: "run" } };
` + app[start:end] + `
function assert(condition, message) {
  if (!condition) throw new Error(message);
}
function tool(id, update = false) {
  return {
    id: id + (update ? 100 : 0),
    type: "tool",
    method: "session/update",
    data: { sessionUpdate: update ? "tool_call_update" : "tool_call", toolCallId: id, status: update ? "completed" : "pending", title: "tool-" + id },
  };
}
function reasoning(id, text) {
  return { id, type: "reasoning_delta", method: "session/update", text, data: { messageId: id } };
}

let displayed = displayAgentEvents([tool(1), reasoning(2, "working")]);
assert(displayed.length === 2, "the active reasoning phase should remain briefly visible");
assert(displayed[0].type === "tool_group" && displayed[1].type === "reasoning_delta", "active reasoning should follow the first tool group");

displayed = displayAgentEvents([
  tool(1),
  reasoning(2, "working"),
  tool(3),
  tool(3, true),
  tool(4),
  tool(4, true),
]);
assert(displayed.length === 1 && displayed[0].type === "tool_group", "completed reasoning should disappear without splitting tools");
assert(displayed[0].events.length === 3, "tool updates should replace their call while N and M calls merge");
assert(displayed[0].events.map(agentEventItemId).join(",") === "1,3,4", "the merged group should preserve tool order");

displayed = displayAgentEvents([
  tool(1),
  reasoning(2, "working"),
  { id: 3, type: "system", method: "session/prompt", text: "OpenCode turn finished: end_turn." },
  { id: 4, type: "system", method: "session/prompt", text: "Kimi Code turn finished: end_turn." },
]);
assert(displayed.every((event) => event.type !== "reasoning_delta"), "turn completion should remove stale reasoning");
assert(displayed.length === 1 && displayed[0].type === "tool_group", "turn completion notices should not render as chat messages");
`

	testFile := filepath.Join(t.TempDir(), "agent-chat-events.js")
	if err := os.WriteFile(testFile, []byte(script), 0o600); err != nil {
		t.Fatal(err)
	}
	if output, err := exec.Command(node, testFile).CombinedOutput(); err != nil {
		t.Fatalf("agent chat behavior test failed: %v\n%s", err, output)
	}
}

func TestAgentChatHidesUntitledToolCallUpdates(t *testing.T) {
	node, err := exec.LookPath("node")
	if err != nil {
		t.Skip("node is required for the agent chat behavior test")
	}
	appData, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	app := string(appData)
	start := strings.Index(app, "function coalesceAgentEvents(events)")
	end := strings.Index(app, "function renderAgent()")
	if start < 0 || end <= start {
		t.Fatal("could not isolate agent event transformation functions")
	}

	script := `
const state = { agent: { activeRunId: "run" } };
` + app[start:end] + `
function assert(condition, message) {
  if (!condition) throw new Error(message);
}
function titledCall(id) {
  return {
    id,
    type: "tool",
    method: "session/update",
    data: { sessionUpdate: "tool_call", toolCallId: id, title: "read", kind: "read", status: "pending" },
  };
}
function titledUpdate(id) {
  return {
    id: id + 100,
    type: "tool",
    method: "session/update",
    data: { sessionUpdate: "tool_call_update", toolCallId: id, status: "completed", title: "README.md" },
  };
}
function untitledProgress(id) {
  return {
    id: id + 200,
    type: "tool",
    method: "session/update",
    data: { sessionUpdate: "tool_call_update", toolCallId: id, status: "in_progress", content: [{ type: "content", content: { type: "text", text: "partial-json-chunk" } }] },
  };
}
function untitledCompleted(id) {
  return {
    id: id + 300,
    type: "tool",
    method: "session/update",
    data: { sessionUpdate: "tool_call_update", toolCallId: id, status: "completed" },
  };
}

let displayed = displayAgentEvents([titledCall(1), untitledProgress(1), untitledProgress(1), untitledCompleted(1)]);
assert(displayed.length === 1 && displayed[0].type === "tool_group", "untitled updates should not split or extend the tool group");
assert(displayed[0].events.length === 1, "untitled tool_call progress and completed updates should be hidden");
assert(displayed[0].events[0].data.title === "read", "the titled tool call should remain visible");

displayed = displayAgentEvents([titledCall(1), titledUpdate(1)]);
assert(displayed.length === 1 && displayed[0].events.length === 1, "a titled update should replace its call in the group");
assert(displayed[0].events[0].data.title === "README.md", "titled completed updates should stay visible");

displayed = displayAgentEvents([untitledProgress(9), untitledCompleted(9)]);
assert(displayed.length === 0, "a fully untitled tool call should disappear entirely");
`

	testFile := filepath.Join(t.TempDir(), "agent-chat-untitled-tools.js")
	if err := os.WriteFile(testFile, []byte(script), 0o600); err != nil {
		t.Fatal(err)
	}
	if output, err := exec.Command(node, testFile).CombinedOutput(); err != nil {
		t.Fatalf("agent chat behavior test failed: %v\n%s", err, output)
	}
}

func TestMobileLayoutProvidesNavigationAndViewSwitching(t *testing.T) {
	indexData, err := staticFiles.ReadFile("static/index.html")
	if err != nil {
		t.Fatal(err)
	}
	index := string(indexData)
	for _, want := range []string{`id="mobileMenuButton"`, `id="mobileSidebarBackdrop"`, `id="mobileDetailsButton"`, `id="mobileChatButton"`, `id="agentPanel"`} {
		if !strings.Contains(index, want) {
			t.Fatalf("mobile layout markup is missing %q", want)
		}
	}

	appData, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	app := string(appData)
	for _, want := range []string{`function setMobileSidebar(open)`, `function setMobileView(view)`, `setMobileSidebar(false);`} {
		if !strings.Contains(app, want) {
			t.Fatalf("mobile layout behavior is missing %q", want)
		}
	}

	stylesData, err := staticFiles.ReadFile("static/styles.css")
	if err != nil {
		t.Fatal(err)
	}
	styles := string(stylesData)
	for _, want := range []string{`.mobile-sidebar-open .sidebar`, `.mobile-chat-active .agent-panel`, `.mobile-chat-active .details-panel`} {
		if !strings.Contains(styles, want) {
			t.Fatalf("mobile layout styles are missing %q", want)
		}
	}
}

func TestProjectDetailsOmitsDescription(t *testing.T) {
	data, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	source := string(data)
	if strings.Contains(source, `<span>Description</span>`) || strings.Contains(source, `detail.description || "No description."`) {
		t.Fatal("project details should not render the description section")
	}
	if !strings.Contains(source, `<textarea name="description"`) {
		t.Fatal("project creation dialog should retain its description field")
	}
}

func TestFileMimeTypeMarkdown(t *testing.T) {
	for _, name := range []string{"task.md", "README.markdown", "notes.mdown", "brief.mkdn"} {
		if got := fileMimeType(name, []byte("# Title\n")); got != "text/markdown" {
			t.Fatalf("fileMimeType(%q) = %q, want text/markdown", name, got)
		}
	}
}
