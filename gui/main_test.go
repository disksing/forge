package main

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

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

	body := `{"project":"project1","title":"Automated task","detail":"Durable brief","slug":"automated","autorun":true,"agentId":"codex-one","prompt":"Do the work"}`
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
	want := []string{"task", "create", "--project", "project1", "--autorun", "--agent=codex-one", "--prompt=Do the work", "--slug", "automated", "--detail=Durable brief", "Automated task"}
	if strings.Join(args, "\x00") != strings.Join(want, "\x00") {
		t.Fatalf("unexpected forge args:\n got: %#v\nwant: %#v", args, want)
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
	for _, want := range []string{`name="autorun"`, `name="prompt"`, `name="agentId"`, `autorun: dialog.autorun`} {
		if !strings.Contains(source, want) {
			t.Fatalf("create task dialog is missing %q", want)
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
	if !strings.Contains(string(appData), `class="create-dialog${isTask ? " create-task-dialog" : ""}"`) {
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

func TestTaskDetailsRenderStructuredRunState(t *testing.T) {
	data, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	source := string(data)
	if !strings.Contains(source, `item.run.state || item.run.mode`) {
		t.Fatal("task details should render structured run state")
	}
}

func TestResourceDetailsOmitRedundantTypeMetric(t *testing.T) {
	appData, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	app := string(appData)
	metricsStart := strings.Index(app, "function metrics(item)")
	metricsEnd := strings.Index(app, "function logSection(item)")
	if metricsStart < 0 || metricsEnd <= metricsStart {
		t.Fatal("resource detail metrics function is missing")
	}
	metricsSource := app[metricsStart:metricsEnd]
	if strings.Contains(metricsSource, `<span>Type</span>`) || strings.Contains(metricsSource, `escapeHTML(item.type)`) {
		t.Fatal("project and task details should not render their resource type")
	}
	for _, want := range []string{
		`class="meta-grid resource-meta-grid"`,
		`item.type === "project" ? "Tasks" : "Artifacts"`,
		`<span>Repos</span>`,
		`<span>Run</span>`,
	} {
		if !strings.Contains(metricsSource, want) {
			t.Fatalf("resource detail metrics should retain %q", want)
		}
	}

	stylesData, err := staticFiles.ReadFile("static/styles.css")
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(string(stylesData), `.resource-meta-grid {
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));`) {
		t.Fatal("resource detail metrics should fill the available columns without an empty type slot")
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
		`markTransientAgentStatus(markFinalAgentResponses(coalesceAgentEvents(events)))`,
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
