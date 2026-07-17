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
		`id="agentProfileForm"`,
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
		`const AGENT_INITIAL_AUTO_PAGE_LIMIT = 2;`,
		`const AGENT_MANUAL_AUTO_PAGE_LIMIT = 4;`,
		`function latestAgentEventID()`,
		`const after = latestAgentEventID();`,
		`/stream${query}`,
		`if (!isLiveAgentRun(currentAgentRun()))`,
		`async function refreshAgentRunMetadata()`,
		`refreshAgentRunMetadata().then(renderAll)`,
	} {
		if !strings.Contains(app, want) {
			t.Fatalf("bounded agent history behavior is missing %q", want)
		}
	}
	if strings.Contains(app, `loadAgentRuns().then(renderAll)`) {
		t.Fatal("turn completion should refresh run metadata without reloading the full event tail")
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
    data: { sessionUpdate: update ? "tool_call_update" : "tool_call", toolCallId: id, status: update ? "completed" : "pending" },
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
]);
assert(displayed.every((event) => event.type !== "reasoning_delta"), "turn completion should remove stale reasoning");
`

	testFile := filepath.Join(t.TempDir(), "agent-chat-events.js")
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
