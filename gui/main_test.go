package main

import (
	"bytes"
	"crypto/sha256"
	"encoding/hex"
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
	if err := s.saveConfig(config{Version: agentHubConfigVersion, Workspaces: []guiWorkspace{{ID: "workspace-one", Path: workspace}}}); err != nil {
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
	if err := s.saveConfig(config{Version: agentHubConfigVersion, Workspaces: []guiWorkspace{{ID: "workspace-one", Path: workspace}}}); err != nil {
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
	if err := s.saveConfig(config{Version: agentHubConfigVersion, Workspaces: []guiWorkspace{{ID: "workspace-one", Path: workspace}}}); err != nil {
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
	if err := s.saveConfig(config{Version: agentHubConfigVersion, Workspaces: []guiWorkspace{{ID: "workspace-one", Path: workspace}}}); err != nil {
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
		`AutoRun Profiles`,
		`settings-profile-table`,
		`/api/settings/agenthub`,
		`agentName: profile.agentId`,
		`preferredAgentProfiles`,
		`Actual Agent:`,
		`Legacy Agent:`,
	} {
		if !strings.Contains(source, want) {
			t.Fatalf("Agent Profile UI is missing %q", want)
		}
	}
}

func TestAgentHubSettingsReplaceLocalProviderEditors(t *testing.T) {
	data, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	source := string(data)
	for _, want := range []string{
		`settingsTabButton("agenthub", "network", "AgentHub")`,
		`settingsTabButton("profiles", "route", "Profiles")`,
		`function settingsAgentHubPanel(data)`,
		`Provider and agent definitions are read-only here.`,
		`status.capabilities`,
		`data-settings-section="agenthub"`,
		`function settingsProfilesPanel(data)`,
		`data-settings-section="profiles"`,
	} {
		if !strings.Contains(source, want) {
			t.Fatalf("AgentHub settings UI is missing %q", want)
		}
	}
	for _, removed := range []string{
		`settingsTabButton("providers",`,
		`settingsTabButton("agents",`,
	} {
		if strings.Contains(source, removed) {
			t.Fatalf("local provider/agent editor tab remains: %q", removed)
		}
	}
	start := strings.Index(source, "function syncSettingsDraftFromDOM()")
	end := strings.Index(source, "function markAgentSettingsDirty()")
	if start < 0 || end <= start {
		t.Fatal("could not isolate syncSettingsDraftFromDOM")
	}
	sync := source[start:end]
	for _, want := range []string{`data-settings-section="agenthub"`, `data-settings-section="profiles"`} {
		if !strings.Contains(sync, want) {
			t.Fatalf("draft sync should only collect rendered sections, missing %q", want)
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

func TestProjectSessionStartRejectsStaleBackgroundSnapshots(t *testing.T) {
	node, err := exec.LookPath("node")
	if err != nil {
		t.Skip("node is required for the project session refresh behavior test")
	}
	appData, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	app := string(appData)
	extract := func(startMarker, endMarker string) string {
		t.Helper()
		start := strings.Index(app, startMarker)
		if start < 0 {
			t.Fatalf("could not find %q", startMarker)
		}
		end := strings.Index(app[start:], endMarker)
		if end < 0 {
			t.Fatalf("could not find %q after %q", endMarker, startMarker)
		}
		return app[start : start+end]
	}

	autoRefreshSource := extract("async function autoRefresh()", "function renderAll()")
	treeRefreshSource := extract("async function fetchCurrentTree()", "async function loadCanonicalAgentEvents()")
	startRunSource := extract("async function startAgentRun()", "async function sendAgentInput(text)")
	script := `
const oldTree = { projects: [{ id: "project1", title: "Forge" }], sessions: [] };
const newSession = { id: "session-new", resourceId: "project1" };
const newTree = { projects: oldTree.projects, sessions: [newSession] };
const state = {
  activeWorkspaceId: "workspace-one",
  selectedId: "project1",
  tree: oldTree,
  details: { project1: {} },
  workspaceAgents: null,
  expandedProjects: new Set(),
  preview: null,
  taskOperationalStateKey: "",
  autoRefreshInFlight: false,
  autoRefreshVersion: 0,
  treeRequestVersion: 0,
  agentSessionMutationCount: 0,
  agent: {
    runs: [],
    activeRunId: "",
    draftPrompt: "draft",
    ttyDraft: "draft",
    ttyMultiline: true,
    optionsOpen: true,
    agentChooserOpen: true,
    historyOpen: true,
  },
};
const document = { hidden: false };
let scenario = "";
let resolveOldTree;
let oldTreeResponse;
let resolveOldRuns;
let oldRunsResponse;
let treeRequests = 0;
let runRequests = 0;
let rendered = 0;
function assert(condition, message) {
  if (!condition) throw new Error(message);
}
function resetState(nextScenario) {
  scenario = nextScenario;
  state.tree = oldTree;
  state.details = { project1: {} };
  state.autoRefreshInFlight = false;
  state.autoRefreshVersion = 0;
  state.treeRequestVersion = 0;
  state.agentSessionMutationCount = 0;
  state.agent.runs = [];
  state.agent.activeRunId = "";
  treeRequests = 0;
  runRequests = 0;
  rendered = 0;
  oldTreeResponse = new Promise((resolve) => { resolveOldTree = resolve; });
  oldRunsResponse = new Promise((resolve) => { resolveOldRuns = resolve; });
}
async function waitFor(predicate, message) {
  for (let attempt = 0; attempt < 20; attempt++) {
    if (predicate()) return;
    await Promise.resolve();
  }
  throw new Error(message);
}
async function api(path, options = {}) {
  if (path.endsWith("/tree")) {
    treeRequests++;
    if (treeRequests === 1) return scenario === "tree" ? oldTreeResponse : oldTree;
    if (treeRequests === 2) return newTree;
    throw new Error("unexpected tree request " + treeRequests);
  }
  if (path.endsWith("/agent/runs") && options.method === "POST") {
    const request = JSON.parse(options.body);
    assert(request.resourceId === "project1", "project session used the wrong resource id");
    return { run: { id: "run-new" } };
  }
  throw new Error("unexpected API request " + path);
}
function sameJSON(left, right) { return JSON.stringify(left) === JSON.stringify(right); }
async function refreshFilePreview() {}
function ensureValidSelection() { return false; }
function syncURL() {}
function ensureSelectedProjectExpanded() {}
async function loadWorkspaceAgents() {}
async function fetchDetail() { return {}; }
async function fetchAgentRuns() {
  runRequests++;
  if (scenario === "runs" && runRequests === 1) return oldRunsResponse;
  return [{ id: "run-new" }];
}
function reconcileActiveAgentRun() { return false; }
async function loadCanonicalAgentEvents() {}
function connectAgentStream() {}
function taskOperationalStateKey() { return ""; }
function renderAll() { rendered++; }
function findResource(id) { return id === "project1" ? { id, title: "Forge", path: "project1-forge" } : null; }
function selectedAgentConfig() { return { id: "agent-one" }; }
function workspaceName() { return "Workspace"; }
function agentDefaultCwd() { return "project1-forge"; }
async function loadAgentRuns() { state.agent.runs = await fetchAgentRuns(); }
function toast() {}
` + autoRefreshSource + treeRefreshSource + startRunSource + `
(async function run() {
  resetState("tree");
  const backgroundRefresh = autoRefresh();
  await Promise.resolve();
  assert(treeRequests === 1, "background refresh did not start its tree request");

  await startAgentRun();
  assert(state.tree.sessions[0]?.id === "session-new", "new project session was not rendered after creation");
  assert(rendered === 1, "session creation should render exactly once before the stale response");

  resolveOldTree(oldTree);
  await backgroundRefresh;
  assert(state.tree.sessions[0]?.id === "session-new", "stale background tree removed the new project session");
  assert(rendered === 1, "discarded stale refresh should not re-render");

  resetState("runs");
  const backgroundRunRefresh = autoRefresh();
  await waitFor(() => runRequests === 1, "background refresh did not start its run request");

  await startAgentRun();
  assert(state.tree.sessions[0]?.id === "session-new", "new project session tree was not rendered");
  assert(state.agent.runs[0]?.id === "run-new", "new project run was not rendered");

  resolveOldRuns([]);
  await backgroundRunRefresh;
  assert(state.agent.runs[0]?.id === "run-new", "stale background runs removed the new project session");
  assert(rendered === 1, "discarded stale run refresh should not re-render");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
`

	testFile := filepath.Join(t.TempDir(), "project-session-refresh.js")
	if err := os.WriteFile(testFile, []byte(script), 0o600); err != nil {
		t.Fatal(err)
	}
	if output, err := exec.Command(node, testFile).CombinedOutput(); err != nil {
		t.Fatalf("project session refresh behavior test failed: %v\n%s", err, output)
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
	if err := s.saveConfig(config{Version: agentHubConfigVersion, Workspaces: []guiWorkspace{{ID: "workspace-one", Path: workspace}}}); err != nil {
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

func TestTTYComposerOnlyOffersResumeWithActiveForgeSession(t *testing.T) {
	data, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	source := string(data)
	for _, want := range []string{
		`const canResume = Boolean(activeRun.forgeSessionId) && !activeRun.agentHubStoppedObserved;`,
		`agentComposerActions({ includeResume: canResume })`,
	} {
		if !strings.Contains(source, want) {
			t.Fatalf("TTY composer resume guard is missing %q", want)
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

func TestAgentChatUsesOnlySharedCanonicalTimeline(t *testing.T) {
	indexData, err := staticFiles.ReadFile("static/index.html")
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(string(indexData), `/vendor/agenthub-event-timeline/event-timeline.iife.js`) {
		t.Fatal("shared AgentHub timeline bundle is not loaded")
	}
	appData, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	app := string(appData)
	for _, want := range []string{
		`window.AgentHubEventTimeline.buildTimeline(state.agent.events)`,
		`stream.addEventListener("forge.notice"`,
		`state.agent.toolGroupOpen.set(details.dataset.toolGroupKey, !details.open)`,
		`<div class="agent-message-content markdown-rendered">${renderMarkdown(item.text)}</div>`,
		`return window.DOMPurify.sanitize(window.marked.parse(String(content ?? "")))`,
		`item.kind === "message"`,
		`item.kind === "thinking"`,
		`item.kind === "tools"`,
		`item.kind === "approval"`,
		`escapeHTML(agentThinkingTitle(item))`,
		`return duration ? ` + "`Thought for ${duration}`" + ` : "Thought"`,
		`data-option-id="${escapeHTML(option.optionId)}"`,
		`data-agent-approval-reply-form="${escapeHTML(item.approvalId)}"`,
		`body: JSON.stringify({ requestId, ...reply })`,
		`item.kind === "lifecycle"`,
		`item.kind === "error"`,
		`item.kind === "unknown"`,
		`agentMessageSenderName(item)`,
		`agentClockTime(item.time)`,
		`<div class="agent-message-meta">`,
		`<span class="agent-note-time">`,
	} {
		if !strings.Contains(app, want) {
			t.Fatalf("canonical timeline integration is missing %q", want)
		}
	}
	for _, forbidden := range []string{
		"displayAgent" + "Events",
		"coalesceAgent" + "Events",
		"shouldDisplayAgent" + "Event",
		"groupTool" + "Events",
		"toolEvent" + "Summary",
		"assistant" + "_delta",
		"approval" + "_requested",
	} {
		if strings.Contains(app, forbidden) {
			t.Fatalf("legacy event compatibility remains in app.js: %q", forbidden)
		}
	}
}

func TestAgentTimelinePresentationHelpers(t *testing.T) {
	node, err := exec.LookPath("node")
	if err != nil {
		t.Skip("node is required for timeline presentation helper tests")
	}
	script := `
const fs = require("node:fs");
const vm = require("node:vm");
const source = fs.readFileSync(process.argv[1], "utf8");
function extract(name) {
  const marker = "function " + name + "(";
  const start = source.indexOf(marker);
  if (start < 0) throw new Error("missing " + name);
  const open = source.indexOf("{", start);
  let depth = 0;
  for (let index = open; index < source.length; index++) {
    if (source[index] === "{") depth++;
    if (source[index] === "}") {
      depth--;
      if (depth === 0) return source.slice(start, index + 1);
    }
  }
  throw new Error("unterminated " + name);
}
const context = {};
vm.createContext(context);
vm.runInContext(extract("agentThinkingDuration") + "\n" + extract("agentThinkingTitle"), context);
const cases = [
  [{ active: true }, "Thinking…"],
  [{ startTime: "2026-01-01T00:00:00Z", time: "2026-01-01T00:00:12Z" }, "Thought for 12 seconds"],
  [{ startTime: "2026-01-01T00:00:00Z", time: "2026-01-01T00:01:02Z" }, "Thought for 1m2s"],
  [{ startTime: "bad", time: "2026-01-01T00:01:02Z" }, "Thought"],
  [{ time: "2026-01-01T00:01:02Z" }, "Thought"],
];
for (const [item, want] of cases) {
  const got = context.agentThinkingTitle(item);
  if (got !== want) throw new Error("thinking title: got " + got + ", want " + want);
}
`
	appPath := filepath.Join("static", "app.js")
	if output, err := exec.Command(node, "-e", script, appPath).CombinedOutput(); err != nil {
		t.Fatalf("timeline presentation helpers failed: %v\n%s", err, output)
	}
}

func TestVendoredAgentHubTimelineMatchesSharedFixtures(t *testing.T) {
	node, err := exec.LookPath("node")
	if err != nil {
		t.Skip("node is required for shared timeline conformance")
	}
	script := `
const fs = require("node:fs");
const vm = require("node:vm");
const [bundlePath, fixturePath, snapshotPath] = process.argv.slice(1);
const context = {};
vm.createContext(context);
vm.runInContext(fs.readFileSync(bundlePath, "utf8"), context);
const fixture = JSON.parse(fs.readFileSync(fixturePath, "utf8"));
const snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));
if (Array.isArray(fixture.scenarios)) {
  for (const scenario of fixture.scenarios) {
    const actual = context.AgentHubEventTimeline.buildTimeline(scenario.events);
    const expected = snapshot.scenarios[scenario.name];
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error("timeline snapshot mismatch: " + scenario.name);
    }
  }
} else {
  const events = [];
  fixture.pages.forEach((page, index) => {
    events.push(...page);
    const actual = context.AgentHubEventTimeline.buildTimeline(events);
    if (JSON.stringify(actual) !== JSON.stringify(snapshot.stages[index])) {
      throw new Error("pagination timeline snapshot mismatch at stage " + index);
    }
  });
  }
`
	for _, fixture := range []string{"canonical-events", "pagination-fragments"} {
		t.Run(fixture, func(t *testing.T) {
			args := []string{
				"-e", script,
				filepath.Join("static", "vendor", "agenthub-event-timeline", "event-timeline.iife.js"),
				filepath.Join("testdata", "agenthub-event-timeline", fixture+".json"),
				filepath.Join("testdata", "agenthub-event-timeline", fixture+".timeline.json"),
			}
			if output, err := exec.Command(node, args...).CombinedOutput(); err != nil {
				t.Fatalf("shared timeline conformance failed: %v\n%s", err, output)
			}
		})
	}
}

func TestVendoredAgentHubTimelineProjectsQuestionsAndThinkingStart(t *testing.T) {
	node, err := exec.LookPath("node")
	if err != nil {
		t.Skip("node is required for shared timeline feature conformance")
	}
	script := `
const fs = require("node:fs");
const vm = require("node:vm");
const context = {};
vm.createContext(context);
vm.runInContext(fs.readFileSync(process.argv[1], "utf8"), context);
const timeline = context.AgentHubEventTimeline.buildTimeline([
  { id: 1, time: "2026-01-01T00:00:00Z", type: "message.reasoning.delta", data: { text: "first" } },
  { id: 2, time: "2026-01-01T00:01:02Z", type: "message.reasoning.delta", data: { text: " second" } },
  { id: 3, time: "2026-01-01T00:01:03Z", type: "approval.requested", data: {
    approvalId: "ask-1",
    method: "session/request_permission",
    params: {
      toolCall: { title: "AskUserQuestion", content: [{ type: "content", content: { type: "text", text: "Choose one" } }] },
      options: [{ optionId: "a", name: "Alpha", kind: "allow_once" }]
    }
  } }
]);
const thinking = timeline.find((item) => item.kind === "thinking");
const approval = timeline.find((item) => item.kind === "approval");
if (thinking.startTime !== "2026-01-01T00:00:00Z" || thinking.time !== "2026-01-01T00:01:02Z") {
  throw new Error("thinking timestamps were not projected");
}
if (approval.question !== "Choose one" || approval.options.length !== 1 || approval.options[0].optionId !== "a") {
  throw new Error("question approval was not projected");
}
`
	bundlePath := filepath.Join("static", "vendor", "agenthub-event-timeline", "event-timeline.iife.js")
	if output, err := exec.Command(node, "-e", script, bundlePath).CombinedOutput(); err != nil {
		t.Fatalf("shared timeline feature conformance failed: %v\n%s", err, output)
	}
}

func TestVendoredAgentHubTimelineSourceAndSHA256ArePinned(t *testing.T) {
	bundle, err := staticFiles.ReadFile("static/vendor/agenthub-event-timeline/event-timeline.iife.js")
	if err != nil {
		t.Fatal(err)
	}
	sourceData, err := staticFiles.ReadFile("static/vendor/agenthub-event-timeline/SOURCE.json")
	if err != nil {
		t.Fatal(err)
	}
	var source struct {
		Version                 string `json:"version"`
		APIEventContractVersion string `json:"apiEventContractVersion"`
		Revision                string `json:"revision"`
		SHA256                  string `json:"sha256"`
	}
	if err := json.Unmarshal(sourceData, &source); err != nil {
		t.Fatal(err)
	}
	sum := sha256.Sum256(bundle)
	actual := hex.EncodeToString(sum[:])
	if source.Version != "1.0.0" || source.APIEventContractVersion != "agenthub.api.v1" ||
		source.Revision != "ef426b68071449f1b869114e9a987e31fef8be3d" ||
		source.SHA256 != actual ||
		actual != "fca046328813c9e3d6b782083cafad0a00cd54868ddda565a9b4689c67e037c5" {
		t.Fatalf("unexpected vendored timeline source: source=%#v actualSHA=%s", source, actual)
	}
	if _, err := staticFiles.ReadFile("static/vendor/agenthub-event-timeline/LICENSE"); err != nil {
		t.Fatal("vendored BSD-3-Clause license is missing")
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

func TestContentTypeWithCharset(t *testing.T) {
	if got := contentTypeWithCharset("text/markdown"); got != "text/markdown; charset=utf-8" {
		t.Fatalf("contentTypeWithCharset(text/markdown) = %q", got)
	}
	if got := contentTypeWithCharset("text/plain; charset=utf-8"); got != "text/plain; charset=utf-8" {
		t.Fatalf("contentTypeWithCharset should keep an existing charset, got %q", got)
	}
	if got := contentTypeWithCharset("image/png"); got != "image/png" {
		t.Fatalf("contentTypeWithCharset should leave non-text types alone, got %q", got)
	}
}

func TestRawFileServesUTF8Charset(t *testing.T) {
	workspace := t.TempDir()
	content := []byte("# 标题\n\n中文内容。\n")
	if err := os.WriteFile(filepath.Join(workspace, "notes.md"), content, 0o644); err != nil {
		t.Fatal(err)
	}
	if err := os.MkdirAll(filepath.Join(workspace, "wiki"), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(workspace, "wiki", "notes.md"), content, 0o644); err != nil {
		t.Fatal(err)
	}

	s := &server{config: filepath.Join(t.TempDir(), "gui.json")}
	if err := s.saveConfig(config{Version: agentHubConfigVersion, Workspaces: []guiWorkspace{{ID: "workspace-one", Path: workspace}}}); err != nil {
		t.Fatal(err)
	}

	for _, suffix := range []string{"files/raw?path=notes.md", "wiki/files/raw?path=notes.md"} {
		req := httptest.NewRequest(http.MethodGet, "/api/workspaces/workspace-one/"+suffix, nil)
		rec := httptest.NewRecorder()
		s.handleWorkspace(rec, req)
		if rec.Code != http.StatusOK {
			t.Fatalf("expected raw preview for %q, got %d: %s", suffix, rec.Code, rec.Body.String())
		}
		if got := rec.Header().Get("Content-Type"); got != "text/markdown; charset=utf-8" {
			t.Fatalf("raw preview for %q should declare UTF-8, got Content-Type %q", suffix, got)
		}
		if !strings.Contains(rec.Body.String(), "中文内容") {
			t.Fatalf("raw preview for %q lost UTF-8 content: %q", suffix, rec.Body.String())
		}
	}
}

func TestFileSectionHeaderHostsOpenActionOnSameRow(t *testing.T) {
	appData, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	app := string(appData)
	for _, want := range []string{
		`<h3>${icon("file-text")}<span>${escapeHTML(file.name)}</span>${openFileAction(file.name, path)}</h3>`,
		`function openFileAction(name, path)`,
		`if (!path || !isMarkdownFile(name)) {`,
	} {
		if !strings.Contains(app, want) {
			t.Fatalf("file section header open action is missing %q", want)
		}
	}
	if strings.Contains(app, "markdown-preview-toolbar") {
		t.Fatal("markdown preview toolbar should be folded into the section header row")
	}

	stylesData, err := staticFiles.ReadFile("static/styles.css")
	if err != nil {
		t.Fatal(err)
	}
	styles := string(stylesData)
	if !strings.Contains(styles, `.content-section h3 .markdown-open-file {
  margin-left: auto;`) {
		t.Fatal("open action should be pushed to the right end of the section header row")
	}
	if strings.Contains(styles, ".markdown-preview-toolbar") {
		t.Fatal("markdown preview toolbar styles should be removed with the toolbar")
	}
}

func TestUIStateRoundTripsLastResource(t *testing.T) {
	workspace := t.TempDir()
	s := &server{config: filepath.Join(t.TempDir(), "gui.json")}
	if err := s.saveConfig(config{Version: agentHubConfigVersion, Workspaces: []guiWorkspace{{ID: "workspace-one", Path: workspace}}}); err != nil {
		t.Fatal(err)
	}

	put := httptest.NewRequest(http.MethodPut, "/api/workspaces/workspace-one/ui-state", strings.NewReader(`{"version":1,"expandedProjects":["project1"],"lastResourceId":"project1.task2"}`))
	rec := httptest.NewRecorder()
	s.handleWorkspace(rec, put)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected ui-state PUT to succeed, got %d: %s", rec.Code, rec.Body.String())
	}
	var saved guiState
	if err := json.Unmarshal(rec.Body.Bytes(), &saved); err != nil {
		t.Fatal(err)
	}
	if saved.LastResourceID != "project1.task2" {
		t.Fatalf("expected PUT response to echo lastResourceId, got %+v", saved)
	}

	get := httptest.NewRequest(http.MethodGet, "/api/workspaces/workspace-one/ui-state", nil)
	rec = httptest.NewRecorder()
	s.handleWorkspace(rec, get)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected ui-state GET to succeed, got %d: %s", rec.Code, rec.Body.String())
	}
	var loaded guiState
	if err := json.Unmarshal(rec.Body.Bytes(), &loaded); err != nil {
		t.Fatal(err)
	}
	if loaded.LastResourceID != "project1.task2" || len(loaded.ExpandedProjects) != 1 || loaded.ExpandedProjects[0] != "project1" {
		t.Fatalf("expected persisted ui-state, got %+v", loaded)
	}

	data, err := os.ReadFile(filepath.Join(workspace, ".forge", "gui-state.json"))
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(string(data), `"lastResourceId": "project1.task2"`) {
		t.Fatalf("expected gui-state.json to persist lastResourceId, got %s", data)
	}
}

func TestWorkspaceRestoresLastSelectedResource(t *testing.T) {
	data, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	source := string(data)

	for _, want := range []string{
		`state.lastResourceId = uiState.lastResourceId || "";`,
		`lastResourceId: state.selectedId,`,
		`await loadUIState();
    if (!route.resourceId && state.lastResourceId) {
      state.selectedId = state.lastResourceId;
    }
    await loadTree({ replaceURL: true });`,
		`await loadUIState();
  state.selectedId = state.lastResourceId || "workspace";
  await loadTree();`,
		`await loadUIState();
    if (!route.resourceId && state.lastResourceId) {
      state.selectedId = state.lastResourceId;
    }
    await loadTree({ updateURL: false });`,
	} {
		if !strings.Contains(source, want) {
			t.Fatalf("workspace last-page restore is missing %q", want)
		}
	}
	if got := strings.Count(source, "saveUIState().catch("); got < 2 {
		t.Fatalf("selection changes and workspace switches should persist UI state; got %d saveUIState().catch call sites", got)
	}
}
