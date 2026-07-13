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

func TestCreateTaskMapsNonInteractiveOptions(t *testing.T) {
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

	body := `{"project":"project1","title":"Automated task","detail":"Durable brief","slug":"automated","nonInteractive":true,"agentId":"codex-one","prompt":"Do the work"}`
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
	want := []string{"task", "create", "--project", "project1", "--non-interactive", "--agent=codex-one", "--prompt=Do the work", "--slug", "automated", "--detail=Durable brief", "Automated task"}
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

func TestCreateTaskRejectsRunOptionsWithoutNonInteractive(t *testing.T) {
	s := &server{}
	req := httptest.NewRequest(http.MethodPost, "/api/workspaces/workspace-one/tasks", strings.NewReader(`{"project":"project1","title":"Task","prompt":"Do the work"}`))
	rec := httptest.NewRecorder()
	s.createTask(rec, req, "workspace-one")
	if rec.Code != http.StatusBadRequest || !strings.Contains(rec.Body.String(), "require nonInteractive") {
		t.Fatalf("expected validation error, got %d: %s", rec.Code, rec.Body.String())
	}
}

func TestCreateTaskDialogIncludesAutomationFields(t *testing.T) {
	data, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	source := string(data)
	for _, want := range []string{`name="nonInteractive"`, `name="prompt"`, `name="agentId"`, `nonInteractive: dialog.nonInteractive`} {
		if !strings.Contains(source, want) {
			t.Fatalf("create task dialog is missing %q", want)
		}
	}
}

func TestProjectTaskTemplatesAreVisibleAndSelectable(t *testing.T) {
	data, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	source := string(data)
	for _, want := range []string{`<span>Task Templates</span>`, `data-template-preview`, `name="templateName"`, `applyCreateDialogTemplate`} {
		if !strings.Contains(source, want) {
			t.Fatalf("task template UI is missing %q", want)
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
		`composer.innerHTML = agentComposerActions({ includeClose: true })`,
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
