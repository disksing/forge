package serve

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

	"github.com/disksing/forge/internal/app"
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
	expectedDigest := sha256.Sum256([]byte("# Notes\n\nSafe content.\n"))
	if preview.Path != "guides/notes.md" || preview.Binary || !strings.Contains(preview.Content, "Safe content") || preview.ContentHash != hex.EncodeToString(expectedDigest[:]) {
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
	forgeWorkspace, err := app.Initialize(workspace, "en")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := forgeWorkspace.CreateProject("API project", "api"); err != nil {
		t.Fatal(err)
	}

	configPath := filepath.Join(t.TempDir(), "gui.json")
	s := &server{config: configPath}
	if err := s.saveConfig(config{Version: agentHubConfigVersion, Workspaces: []guiWorkspace{{ID: "workspace-one", Path: workspace}}}); err != nil {
		t.Fatal(err)
	}

	body := `{"project":"project1","title":"Automated task","detail":"Durable brief","slug":"automated","autorun":true,"agentName":"codex-one","preferredAgentProfiles":["kimi","codex"],"prompt":"Do the work","completionCriteria":"The work is verified"}`
	req := httptest.NewRequest(http.MethodPost, "/api/workspaces/workspace-one/tasks", bytes.NewBufferString(body))
	rec := httptest.NewRecorder()
	s.createTask(rec, req, "workspace-one")
	if rec.Code != http.StatusOK {
		t.Fatalf("expected OK, got %d: %s", rec.Code, rec.Body.String())
	}
	resource, err := forgeWorkspace.Resource("project1.task1")
	if err != nil {
		t.Fatal(err)
	}
	if resource.AutoRun == nil || resource.AutoRun.AgentName != "codex-one" || strings.Join(resource.AutoRun.PreferredAgentProfiles, ",") != "kimi,codex" || resource.AutoRun.Prompt != "Do the work" || resource.AutoRun.CompletionCriteria != "The work is verified" {
		t.Fatalf("unexpected typed AutoRun result: %#v", resource.AutoRun)
	}
	markdown, err := os.ReadFile(filepath.Join(workspace, filepath.FromSlash(resource.Path), "task.md"))
	if err != nil || !strings.Contains(string(markdown), "Durable brief") {
		t.Fatalf("task detail was not persisted by the application API: err=%v content=%q", err, markdown)
	}

	body = `{"project":"project1","title":"Removed task","autorun":true,"agentId":"codex-one"}`
	req = httptest.NewRequest(http.MethodPost, "/api/workspaces/workspace-one/tasks", bytes.NewBufferString(body))
	rec = httptest.NewRecorder()
	s.createTask(rec, req, "workspace-one")
	if rec.Code != http.StatusBadRequest || !strings.Contains(rec.Body.String(), "agentId") {
		t.Fatalf("expected removed agentId to be rejected, got %d: %s", rec.Code, rec.Body.String())
	}
}

func TestCreateTaskMapsTemplateBodyAsCompleteMarkdown(t *testing.T) {
	workspace := t.TempDir()
	forgeWorkspace, err := app.Initialize(workspace, "en")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := forgeWorkspace.CreateProject("API project", "api"); err != nil {
		t.Fatal(err)
	}

	s := &server{config: filepath.Join(t.TempDir(), "gui.json")}
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
	resource, err := forgeWorkspace.Resource("project1.task1")
	if err != nil {
		t.Fatal(err)
	}
	markdown, err := os.ReadFile(filepath.Join(workspace, filepath.FromSlash(resource.Path), "task.md"))
	if err != nil || string(markdown) != "# Template task" {
		t.Fatalf("template body was not written as complete markdown: err=%v content=%q", err, markdown)
	}
}

func TestArchiveResourceUsesUnifiedResourceCommand(t *testing.T) {
	workspace := t.TempDir()
	forgeWorkspace, err := app.Initialize(workspace, "en")
	if err != nil {
		t.Fatal(err)
	}
	project, err := forgeWorkspace.CreateProject("API project", "api")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := forgeWorkspace.CreateTask(app.CreateTaskInput{ProjectID: project.ID, Title: "Archive task", Slug: "archive"}); err != nil {
		t.Fatal(err)
	}
	s := &server{config: filepath.Join(t.TempDir(), "gui.json")}
	if err := s.saveConfig(config{Version: agentHubConfigVersion, Workspaces: []guiWorkspace{{ID: "workspace-one", Path: workspace}}}); err != nil {
		t.Fatal(err)
	}

	req := httptest.NewRequest(http.MethodPost, "/api/workspaces/workspace-one/archive", strings.NewReader(`{"resourceId":"project1.task1"}`))
	rec := httptest.NewRecorder()
	s.archiveResource(rec, req, "workspace-one")
	if rec.Code != http.StatusOK {
		t.Fatalf("expected OK, got %d: %s", rec.Code, rec.Body.String())
	}
	var archived map[string]string
	if err := json.Unmarshal(rec.Body.Bytes(), &archived); err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(archived["path"], "archive") || len(archived) != 1 {
		t.Fatalf("unexpected archive response: %#v", archived)
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
	for _, want := range []string{`name="autorun"`, `name="agentName"`, `name="prompt"`, `name="agentProfiles"`, `name="completionCriteria"`, `preferredAgentProfiles: dialog.autorun`} {
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
		`Agent Profiles`,
		`settings-profile-table`,
		`/api/settings/agenthub`,
		`agentName: profile.agentName`,
		`SYSTEM_AGENT_PROFILE_KEYS`,
		`"scheduler"`,
		`does not start a Scheduler Agent`,
		`settings-profile-system-label`,
		`data-profile-field="agentName"`,
		`System profiles cannot be deleted.`,
		`preferredAgentProfiles`,
		`Actual Agent:`,
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

func TestTreeTaskStatusSeparatesAutoRunSessionsAndLocks(t *testing.T) {
	appData, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	app := string(appData)
	for _, want := range []string{
		`function taskOperationalState(item)`,
		`function deriveTaskAutoRunState(autoRun, sessions)`,
		`function deriveTaskSessionState(sessions)`,
		`function sessionStatusPresentation(session)`,
		`session.schedulerTurn && session.autoRunGeneration === autoRun.generation`,
		`function taskAgentSessions(resourceId)`,
		`session.resourceId === resourceId`,
		`function resourceLocks(resourceId)`,
		`sessionControls(session).some((control) => control.resourceId === resourceId)`,
		`function operationalStatusPresentation(statuses, lock = null)`,
		`function operationalStatusMarkup(presentation, options = {})`,
		`const taskStatusMarkup = operationalStatusMarkup(taskState.statusPresentation);`,
		`class="task-status-slot`,
		`task-status-single`,
		`task-status-dual`,
		`${taskStatusMarkup}`,
		`operationalStatusPresentation([autoRun, session], lock)`,
		`presentation.statuses.map((status) =>`,
		`task-lock-indicator`,
		`button.setAttribute("aria-label"`,
		`button.setAttribute("aria-describedby"`,
	} {
		if !strings.Contains(app, want) {
			t.Fatalf("combined task tree status is missing %q", want)
		}
	}
	stylesData, err := staticFiles.ReadFile("static/styles.css")
	if err != nil {
		t.Fatal(err)
	}
	styles := string(stylesData)
	for _, want := range []string{
		`grid-template-columns: 16px 16px minmax(0, 1fr) auto;`,
		`.tree-item.has-task-status`,
		`grid-template-columns: 16px 16px 16px minmax(0, 1fr) auto;`,
		`.tree-item.has-task-status-dual`,
		`grid-template-columns: 16px 36px 16px minmax(0, 1fr) auto;`,
		`.task-status-slot.task-status-single .task-lock-indicator`,
		`.task-status-indicator.task-status-auto-running`,
		`.task-status-indicator.task-status-session-running`,
		`animation: task-status-spin 1.8s linear infinite;`,
		`.task-lock-external`,
		`.task-status-tooltip`,
		`@media (prefers-reduced-motion: reduce)`,
	} {
		if !strings.Contains(styles, want) {
			t.Fatalf("combined task tree status styles are missing %q", want)
		}
	}
	if strings.Contains(styles, `.task-status-indicator.task-status-auto-running {
	  color: var(--green);
  animation:`) {
		t.Fatal("AutoRun running indicator should remain static")
	}
}

func TestCollapsedProjectTaskSummaryCountsOpenUniqueRunningTasks(t *testing.T) {
	node, err := exec.LookPath("node")
	if err != nil {
		t.Skip("node is required for project task summary tests")
	}
	appData, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	app := string(appData)
	for _, want := range []string{
		`const TASK_RUNNING_SESSION_STATES = new Set(["starting", "running", "waiting_approval", "recovering"]);`,
		`function projectTaskSummary(project)`,
		`function taskSessionCountsAsRunning(session)`,
		`function projectTaskSummaryMarkup(summary)`,
		`const summaryMarkup = summary && !expanded ? projectTaskSummaryMarkup(summary) : "";`,
		`const accessibleLabel = [title, summary?.ariaLabel, taskState.label].filter(Boolean).join(". ");`,
		`const summary = projectTaskSummary(project);`,
		`:tasks=${summary.taskCount}:${summary.runningCount}`,
	} {
		if !strings.Contains(app, want) {
			t.Fatalf("collapsed project task summary is missing %q", want)
		}
	}
	stylesData, err := staticFiles.ReadFile("static/styles.css")
	if err != nil {
		t.Fatal(err)
	}
	styles := string(stylesData)
	for _, want := range []string{
		`.project-task-summary`,
		`.project-task-summary-separator`,
		`max-width: min(48%, 148px);`,
		`overflow: hidden;`,
		`@media (max-width: 420px)`,
		`.tree-item.active .project-task-summary`,
	} {
		if !strings.Contains(styles, want) {
			t.Fatalf("collapsed project task summary styles are missing %q", want)
		}
	}

	script := `
const fs = require("node:fs");
const vm = require("node:vm");
const source = fs.readFileSync(process.argv[2], "utf8");
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
const context = {
  state: {
    tree: {
      sessions: [
        { id: "starting", source: "internal", resourceId: "project1.task2", agentRunStatus: "starting" },
        { id: "running", source: "internal", controls: [{ resourceId: "project1.task3" }], agentRunStatus: "running" },
        { id: "approval", source: "internal", controls: [{ resourceId: "project1.task4" }], agentRunStatus: "waiting_approval" },
        { id: "recovering", source: "internal", controls: [{ resourceId: "project1.task5" }], agentRunStatus: "recovering" },
        { id: "duplicate-resource", source: "internal", resourceId: "project1.task6", agentRunStatus: "running" },
        { id: "duplicate-lock", source: "internal", controls: [{ resourceId: "project1.task6" }], agentRunStatus: "waiting_approval" },
        { id: "external-lock", source: "external", controls: [{ resourceId: "project1.task7" }], agentRunStatus: "running" },
        { id: "idle", source: "internal", resourceId: "project1.task8", agentRunStatus: "idle" },
        { id: "stopping", source: "internal", resourceId: "project1.task9", agentRunStatus: "stopping" },
        { id: "queued", source: "internal", resourceId: "project1.task10", agentRunStatus: "queued" },
      ],
    },
  },
};
vm.createContext(context);
vm.runInContext([
  "const TASK_RUNNING_SESSION_STATES = new Set([\"starting\", \"running\", \"waiting_approval\", \"recovering\"]);",
  extract("sessionControls"),
  extract("taskAgentSessions"),
  extract("taskSessionCountsAsRunning"),
  extract("escapeHTML"),
  extract("projectTaskSummary"),
  extract("projectTaskSummaryMarkup"),
].join("\n"), context);
function assert(condition, message) {
  if (!condition) throw new Error(message);
}
const project = {
  id: "project1",
  children: [
    { id: "project1.task1", autoRun: { state: "running" } },
    { id: "project1.task2" },
    { id: "project1.task3" },
    { id: "project1.task4" },
    { id: "project1.task5" },
    { id: "project1.task6" },
    { id: "project1.task7" },
    { id: "project1.task8" },
    { id: "project1.task9" },
    { id: "project1.task10" },
    { id: "project1.task11" },
    { id: "project1.task12", archived: true, autoRun: { state: "running" } },
  ],
};
const summary = context.projectTaskSummary(project);
assert(summary.taskCount === 11, "archived children must not contribute to the open task count");
assert(summary.runningCount === 6, "running tasks must include AutoRun/internal active sessions once each");
assert(summary.text === "11 tasks · 6 running", "summary text has the wrong pluralization or counts: " + summary.text);
assert(summary.ariaLabel === "Open tasks: 11 tasks; 6 running", "summary aria label has the wrong counts: " + summary.ariaLabel);
const markup = context.projectTaskSummaryMarkup(summary);
assert(markup.includes('class="project-task-summary" aria-hidden="true"'), "summary markup should be hidden from screen readers");
assert(markup.includes('class="project-task-summary-separator" aria-hidden="true">·</span>'), "summary separator should be decorative");
context.state.tree.sessions.find((session) => session.id === "running").agentRunStatus = "idle";
assert(context.projectTaskSummary(project).runningCount === 5, "session status changes must be reflected on the next summary calculation");
assert(context.projectTaskSummary({ id: "empty", children: [] }).text === "0 tasks · 0 running", "empty projects should show zero counts");
assert(context.projectTaskSummary({ id: "one", children: [{ id: "one.task1" }] }).text === "1 task · 0 running", "single-task projects should use the singular label");
`

	testFile := filepath.Join(t.TempDir(), "project-task-summary.js")
	if err := os.WriteFile(testFile, []byte(script), 0o600); err != nil {
		t.Fatal(err)
	}
	if output, err := exec.Command(node, testFile, "static/app.js").CombinedOutput(); err != nil {
		t.Fatalf("project task summary behavior test failed: %v\n%s", err, output)
	}
}

func TestTreeTaskStatusIncludesManuallyControlledSessions(t *testing.T) {
	node, err := exec.LookPath("node")
	if err != nil {
		t.Skip("node is required for manual session status tests")
	}
	appData, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	app := string(appData)
	for _, marker := range []string{"function sessionControls(session)", "function taskAgentSessions(resourceId)"} {
		if !strings.Contains(app, marker) {
			t.Fatalf("manual session status helper is missing %q", marker)
		}
	}

	script := `
const fs = require("node:fs");
const vm = require("node:vm");
const source = fs.readFileSync(process.argv[2], "utf8");
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
const context = {
  state: {
    tree: {
      sessions: [
        { id: "manual", controls: [{ resourceId: "project1.task1" }] },
        { id: "internal", resourceId: "project1.task1" },
        { id: "other", controls: [{ resourceId: "project1.task2" }] },
      ],
    },
  },
};
vm.createContext(context);
vm.runInContext(extract("sessionControls") + "\n" + extract("taskAgentSessions"), context);
const sessions = context.taskAgentSessions("project1.task1");
const ids = sessions.map((session) => session.id).sort();
if (JSON.stringify(ids) !== JSON.stringify(["internal", "manual"])) {
  throw new Error("manual and internal sessions should match the resource: " + JSON.stringify(ids));
}
`

	testFile := filepath.Join(t.TempDir(), "manual-session-status.js")
	if err := os.WriteFile(testFile, []byte(script), 0o600); err != nil {
		t.Fatal(err)
	}
	if output, err := exec.Command(node, testFile, "static/app.js").CombinedOutput(); err != nil {
		t.Fatalf("manual session status behavior test failed: %v\n%s", err, output)
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
	treeRefreshSource := extract("async function fetchCurrentTree", "async function loadCanonicalAgentEvents()")
	startRunSource := extract("async function startAgentRun(agentName = \"\")", "async function sendAgentInput(text)")
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
  navigationVersion: 0,
  detailRequestVersion: 0,
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
  state.navigationVersion = 0;
  state.detailRequestVersion = 0;
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
function isCurrentWorkspaceView(workspaceId, navigationVersion, requestVersion = null) {
  return scenario === "runs" || requestVersion == null || requestVersion === state.treeRequestVersion;
}
function isCurrentAutoRefresh(workspaceId, navigationVersion, refreshVersion) {
  return refreshVersion === state.autoRefreshVersion;
}
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
function renderTTYComposer() {}
function bindAgentEvents() {}
function refreshIcons() {}
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

func TestDetailMarkdownIncrementalRefreshBehavior(t *testing.T) {
	node, err := exec.LookPath("node")
	if err != nil {
		t.Skip("node is required for the Detail Markdown refresh behavior test")
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

	regionSource := extract("function updateDetailRegion", "function markdownRendererKey")
	documentKeySource := extract("function markdownRendererKey", "function detailLogsRenderKey")
	viewGuardSource := extract("function isCurrentWorkspaceView", "const WORKSPACE_AVATAR_PALETTE")
	detailSource := extract("async function loadDetail", "async function loadWorkspaceAgents")
	previewSource := extract("async function previewFile", "async function saveWorkspaceAgents")
	script := `
function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const state = {
  activeWorkspaceId: "workspace-a",
  selectedId: "project1",
  expandedMarkdownFiles: new Set(),
  details: {},
  navigationVersion: 1,
  detailRequestVersion: 0,
  previewRequestVersion: 0,
  preview: null,
  modalEnter: "",
};
const window = { marked: {}, DOMPurify: {} };
function visibleResourceFiles(item) { return (item.files || []).filter((file) => file.name !== "AGENTS.md"); }
function resourceFilePath(resourcePath, name) { return [resourcePath, name].filter(Boolean).join("/"); }
function isMarkdownFile(path) { return /\.(md|markdown|mdown|mkdn)$/i.test(path); }
function isLongMarkdownContent(content) { return String(content || "").length > 2200; }
function markdownFileKey(name) { return state.activeWorkspaceId + ":" + state.selectedId + ":" + name; }
function renderAll() {}
function filePreviewURL(section, path, workspaceId) { return workspaceId + "/" + section + "/" + path; }
` + regionSource + documentKeySource + viewGuardSource + detailSource + previewSource + `

const region = { dataset: { renderKey: "same-hash" }, innerHTML: "existing markdown" };
const panel = { querySelector() { return region; } };
const originalRegion = region;
assert(!updateDetailRegion(panel, "documents", "same-hash", () => { throw new Error("same key must not render"); }), "unchanged document key should skip rendering");
assert(panel.querySelector() === originalRegion && region.innerHTML === "existing markdown", "unchanged document key replaced the DOM region");
assert(updateDetailRegion(panel, "documents", "changed-hash", () => "new markdown"), "changed document key should render");
assert(panel.querySelector() === originalRegion && region.innerHTML === "new markdown", "changed document key did not update the existing region");

const baseDetail = {
  id: "project1",
  type: "project",
  path: "project1",
  files: [{ name: "project.md", path: "project1/project.md", content: "x".repeat(2301), contentHash: "hash-a" }],
};
const baseKey = resourceDocumentsRenderKey(baseDetail);
assert(baseKey === resourceDocumentsRenderKey({ ...baseDetail, logs: [{ title: "new log" }] }), "dynamic log changes must not change the Markdown render key");
assert(baseKey !== resourceDocumentsRenderKey({ ...baseDetail, files: [{ ...baseDetail.files[0], content: "# Changed", contentHash: "hash-b" }] }), "a changed backend content hash must change the Markdown render key");
assert(baseKey !== resourceDocumentsRenderKey({ ...baseDetail, id: "project1.task1" }), "the same Markdown text on another resource must not reuse the render key");
state.expandedMarkdownFiles.add(markdownFileKey("project.md"));
assert(baseKey !== resourceDocumentsRenderKey(baseDetail), "a Markdown display mode change must change the render key");
state.expandedMarkdownFiles.clear();

let requests = [];
function api(path) {
  return new Promise((resolve) => requests.push({ path, resolve }));
}
async function testDetailRace() {
  state.details = {};
  state.selectedId = "project1";
  state.navigationVersion = 10;
  state.detailRequestVersion = 0;
  const oldRequest = loadDetail("project1", { force: true });
  state.selectedId = "project1.task1";
  state.navigationVersion = 11;
  const currentRequest = loadDetail("project1.task1", { force: true });
  requests[0].resolve({ id: "project1", files: [] });
  await oldRequest;
  assert(!state.details.project1, "a stale resource response updated the detail cache");
  requests[1].resolve({ id: "project1.task1", files: [] });
  await currentRequest;
  assert(state.details["project1.task1"]?.id === "project1.task1", "the current resource response was discarded");

  requests = [];
  state.selectedId = "project1.task1";
  state.navigationVersion = 12;
  state.detailRequestVersion = 0;
  const firstSameResource = loadDetail("project1.task1", { force: true });
  const secondSameResource = loadDetail("project1.task1", { force: true });
  requests[1].resolve({ id: "project1.task1", marker: "new" });
  await secondSameResource;
  requests[0].resolve({ id: "project1.task1", marker: "old" });
  await firstSameResource;
  assert(state.details["project1.task1"]?.marker === "new", "an older same-resource response overwrote the latest detail");
}

async function testPreviewRace() {
  requests = [];
  state.preview = null;
  state.previewRequestVersion = 0;
  const oldPreview = previewFile("Wiki", "old.md");
  await Promise.resolve();
  const currentPreview = previewFile("Wiki", "new.md");
  await Promise.resolve();
  requests[0].resolve({ path: "old.md", content: "old", contentHash: "old-hash" });
  await oldPreview;
  assert(state.preview.path === "new.md", "a stale file preview response replaced the current tab");
  requests[1].resolve({ path: "new.md", content: "new", contentHash: "new-hash" });
  await currentPreview;
  assert(state.preview.path === "new.md" && state.preview.content === "new", "the current file preview did not win the race");
}
Promise.resolve().then(async () => {
  await testDetailRace();
  await testPreviewRace();
}).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
`

	testFile := filepath.Join(t.TempDir(), "detail-markdown-refresh.js")
	if err := os.WriteFile(testFile, []byte(script), 0o600); err != nil {
		t.Fatal(err)
	}
	if output, err := exec.Command(node, testFile).CombinedOutput(); err != nil {
		t.Fatalf("Detail Markdown refresh behavior test failed: %v\n%s", err, output)
	}
}

func TestAgentInitialEventsLoadDoesNotAutoPage(t *testing.T) {
	appData, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	app := string(appData)
	for _, removed := range []string{"AGENT_INITIAL_VISIBLE_EVENT_COUNT", "AGENT_INITIAL_AUTO_PAGE_LIMIT"} {
		if strings.Contains(app, removed) {
			t.Fatalf("app.js still references removed initial paging constant %q", removed)
		}
	}
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
	initialLoad := extract("async function loadCanonicalAgentEvents()", "async function loadOlderAgentEvents()")
	if strings.Contains(initialLoad, "ensureVisibleAgentEvents") {
		t.Fatal("initial event load must not page upward automatically")
	}
	if !strings.Contains(app, `const canResume = Boolean(activeRun.agentHubSessionId || activeRun.sourceExternalId);`) {
		t.Fatal("closed composer must offer Resume for any AgentHub-attached run")
	}

	node, err := exec.LookPath("node")
	if err != nil {
		t.Skip("node is required for the agent events paging behavior test")
	}
	constants := extract("const AGENT_OLDER_RAW_PAGE_LIMIT", "const MARKDOWN_PREVIEW_CHAR_LIMIT")
	paging := extract("async function loadCanonicalAgentEvents()", "function fetchAgentRuns()")
	script := `
const state = {
  activeWorkspaceId: "workspace-one",
  agent: {
    runs: [{ id: "run-one" }],
    activeRunId: "run-one",
    events: [],
    notices: [],
    eventsHasMore: false,
    historyBeforeId: 0,
    loadingOlder: false,
  },
};
const requests = [];
function assert(condition, message) {
  if (!condition) throw new Error(message);
}
async function api(path) {
  requests.push(path);
  if (path.endsWith("/agent/runs/run-one")) return { run: { id: "run-one", status: "idle" } };
  if (path.includes("latest=true")) {
    return {
      events: [
        { id: 3, type: "message.user" },
        { id: 4, type: "message.assistant" },
        { id: 5, type: "tool.event" },
      ],
      page: { hasMoreBefore: true },
    };
  }
  if (path.includes("before=")) {
    return {
      events: [
        { id: 1, type: "message.user" },
        { id: 2, type: "message.assistant" },
      ],
      page: { hasMoreBefore: false },
    };
  }
  throw new Error("unexpected API request " + path);
}
function mergeCanonicalAgentEvents(events) {
  const byId = new Map();
  for (const event of events) byId.set(event.id, event);
  return [...byId.values()].sort((left, right) => left.id - right.id);
}
function projectAgentTimeline() {
  return state.agent.events.map((event) => ({ kind: event.type.startsWith("message") ? "message" : "tool" }));
}
function $(id) { return null; }
function renderTTY() {}
function refreshIcons() {}
` + constants + paging + `
(async function run() {
  await loadCanonicalAgentEvents();
  const eventsRequests = requests.filter((path) => path.includes("/events"));
  assert(eventsRequests.length === 1, "initial load must issue exactly one events request, got " + JSON.stringify(eventsRequests));
  assert(eventsRequests[0].includes("latest=true"), "initial load must request the latest page");
  assert(!eventsRequests[0].includes("before="), "initial load must not page upward");
  assert(state.agent.eventsHasMore, "initial load must keep the older-page cursor");
  assert(state.agent.historyBeforeId === 3, "initial load recorded the wrong history cursor");

  await loadOlderAgentEvents();
  const olderRequests = requests.filter((path) => path.includes("before="));
  assert(olderRequests.length === 1, "manual Load older must page upward exactly once, got " + JSON.stringify(olderRequests));
  assert(olderRequests[0].includes("before=3"), "manual Load older used the wrong cursor");
  assert(state.agent.events.length === 5, "older page was not merged");
  assert(!state.agent.eventsHasMore, "older page must update the hasMore cursor");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
`

	testFile := filepath.Join(t.TempDir(), "agent-events-paging.js")
	if err := os.WriteFile(testFile, []byte(script), 0o600); err != nil {
		t.Fatal(err)
	}
	if output, err := exec.Command(node, testFile).CombinedOutput(); err != nil {
		t.Fatalf("agent events paging behavior test failed: %v\n%s", err, output)
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
		`const locks = resourceLocks(item.id);`,
		`const autoRun = deriveTaskAutoRunState(item.autoRun, sessions);`,
		`const session = deriveTaskSessionState(sessions);`,
		`const projectState = taskOperationalState(project);`,
		"parts.push(`${project.id}:auto=${taskStatusKey(projectState.autoRun)}:session=${taskStatusKey(projectState.session)}:${projectState.lock?.kind || \"none\"}:${projectState.label}:tasks=${summary.taskCount}:${summary.runningCount}`);",
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

func TestSessionListUsesCanonicalSessionStatusIcons(t *testing.T) {
	appData, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	app := string(appData)
	for _, want := range []string{
		`const status = isInternal`,
		`sessionStatusPresentation(session)`,
		`taskStatusState("session-external", "session-status-external", "message-square"`,
		`operationalStatusMarkup(statusPresentation, { slotClassName: "session-status-icon" })`,
		`const taskResource = sessionTaskResource(session);`,
		`const taskState = taskResource ? taskOperationalState(taskResource) : noTaskOperationalState();`,
		`isInternal && taskState.autoRun ? [taskState.autoRun, status] : [status]`,
		`row.title = accessibleStatusLabel;`,
		`bindTaskStatusTooltip(row, accessibleStatusLabel);`,
		`row.setAttribute("aria-label"`,
	} {
		if !strings.Contains(app, want) {
			t.Fatalf("session status icon rendering is missing %q", want)
		}
	}
	if strings.Contains(app, `icon(isInternal ? "bot" : "message-square")`) {
		t.Fatal("session list should not use source icons as its primary status icon")
	}

	stylesData, err := staticFiles.ReadFile("static/styles.css")
	if err != nil {
		t.Fatal(err)
	}
	styles := string(stylesData)
	for _, want := range []string{
		`.session-row .session-status-icon`,
		`.session-row.has-task-status-dual`,
		`.session-row .session-status-external`,
		`color: inherit;`,
		`.task-status-indicator.task-status-session-running`,
	} {
		if !strings.Contains(styles, want) {
			t.Fatalf("session status icon styling is missing %q", want)
		}
	}
}

func TestSessionListSharesTaskOperationalStatusAndTaskAssociation(t *testing.T) {
	node, err := exec.LookPath("node")
	if err != nil {
		t.Skip("node is required for the Session operational status test")
	}
	appData, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	app := string(appData)
	for _, marker := range []string{
		`function sessionTaskResource(session)`,
		`if (explicitResourceId) return taskResourceForAutoRun(explicitResourceId);`,
		`if (controls.length !== 1) return null;`,
		`resource.type === "task" && !resource.archived`,
		`if (!session || session.source !== "internal") return null;`,
		`function sessionOperationalLabel(session, taskResource, taskState, sessionStatus)`,
	} {
		if !strings.Contains(app, marker) {
			t.Fatalf("Session operational status behavior is missing %q", marker)
		}
	}

	script := `
const fs = require("node:fs");
const vm = require("node:vm");
const source = fs.readFileSync(process.argv[2], "utf8");
function extract(name) {
  const marker = "function " + name + "(";
  const start = source.indexOf(marker);
  if (start < 0) throw new Error("missing " + name);
  const signatureEnd = source.indexOf(")", start);
  const open = source.indexOf("{", signatureEnd);
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
function assert(condition, message) {
  if (!condition) throw new Error(message);
}
function assertEqual(actual, expected, message) {
  if (actual !== expected) throw new Error(message + ": expected " + expected + ", got " + actual);
}
const resources = new Map([
  ["project1", { id: "project1", type: "project", archived: false }],
  ["project1.task1", { id: "project1.task1", type: "task", archived: false, autoRun: { generation: 7, state: "queued" } }],
  ["project1.task2", { id: "project1.task2", type: "task", archived: false, autoRun: { generation: 3, state: "failed" } }],
  ["project1.archived", { id: "project1.archived", type: "task", archived: true, autoRun: { generation: 8, state: "completed" } }],
]);
const context = {
  findResource: (id) => resources.get(id) || null,
  hasRecentAgentOutput: () => false,
  icon: (name) => "<svg data-icon=\"" + name + "\"></svg>",
};
vm.createContext(context);
vm.runInContext([
  "function taskStatusState(kind, className, iconName, label, dimension, session = null) { return { kind, className, iconName, label, dimension, recentOutput: Boolean(session && hasRecentAgentOutput(session)) }; }",
  extract("operationalStatusPresentation"),
  extract("operationalStatusMarkup"),
  extract("sessionStatusPresentation"),
  extract("deriveTaskAutoRunState"),
  extract("sessionControls"),
  extract("taskResourceForAutoRun"),
  extract("sessionTaskResource"),
  extract("sessionOperationalLabel"),
].join("\n"), context);

const scheduler = { schedulerTurn: true, autoRunGeneration: 7, agentRunStatus: "running" };
const sessionStatus = context.sessionStatusPresentation({ agentRunStatus: "idle" });
const running = context.deriveTaskAutoRunState({ generation: 7, state: "running" }, [scheduler]);
const recovery = context.deriveTaskAutoRunState({ generation: 7, state: "running" }, []);
const expectedAutoRun = {
  running: ["auto-running", "workflow"],
  recovery: ["auto-recovering", "rotate-ccw"],
  queued: ["queued", "clock"],
  suspended: ["suspended", "pause"],
  paused: ["paused", "square"],
  completed: ["completed", "check-circle-2"],
  failed: ["failed", "triangle-alert"],
  cancelled: ["cancelled", "ban"],
};
for (const [state, [kind, iconName]] of Object.entries(expectedAutoRun)) {
  const sessions = state === "running" ? [scheduler] : [];
  const autoRunState = state === "recovery" ? "running" : state;
  const presentation = context.deriveTaskAutoRunState({ generation: 7, state: autoRunState }, sessions);
  assertEqual(presentation.kind, kind, "AutoRun " + state + " kind");
  assertEqual(presentation.iconName, iconName, "AutoRun " + state + " icon");
}
assertEqual(running.kind, "auto-running", "matching scheduler should make AutoRun running");
assertEqual(recovery.kind, "auto-recovering", "missing scheduler should make AutoRun recovering");

const dual = context.operationalStatusPresentation([running, sessionStatus]);
const treeMarkup = context.operationalStatusMarkup(dual);
const sessionMarkup = context.operationalStatusMarkup(dual, { slotClassName: "session-status-icon" });
assertEqual(dual.layoutClassName, "has-task-status-dual", "AutoRun plus Session should use dual layout");
assertEqual(dual.slotClassName, "task-status-dual", "AutoRun plus Session should use dual slot");
assert(treeMarkup.includes("data-icon=\"workflow\"") && treeMarkup.includes("data-icon=\"message-square\""), "TreeView markup should contain both canonical icons");
assert(sessionMarkup.includes("data-icon=\"workflow\"") && sessionMarkup.includes("data-icon=\"message-square\""), "Session markup should contain the same canonical icons");
assert(sessionMarkup.indexOf("data-icon=\"workflow\"") < sessionMarkup.indexOf("data-icon=\"message-square\""), "AutoRun icon should precede Session icon");
const single = context.operationalStatusPresentation([sessionStatus]);
assertEqual(single.layoutClassName, "has-task-status", "single Session status should use single layout");
assertEqual(single.slotClassName, "task-status-single", "single Session status should use single slot");

assertEqual(context.sessionTaskResource({ source: "internal", resourceId: "project1.task1", controls: [{ resourceId: "project1.task2" }] }).id, "project1.task1", "explicit Task resource should have priority");
assertEqual(context.sessionTaskResource({ source: "internal", controls: [{ resourceId: "project1.task1" }] }).id, "project1.task1", "one Task control should be a fallback association");
assertEqual(context.sessionTaskResource({ source: "internal", controls: [{ resourceId: "project1.task1" }, { resourceId: "project1.task2" }] }), null, "multiple Task controls must not guess AutoRun");
assertEqual(context.sessionTaskResource({ source: "internal", controls: [{ resourceId: "project1.task1" }, { resourceId: "project1" }] }), null, "multiple resources must not guess a Task AutoRun");
assertEqual(context.sessionTaskResource({ source: "internal", resourceId: "project1", controls: [{ resourceId: "project1.task1" }] }), null, "Project resource must not fall back to a Task control");
assertEqual(context.sessionTaskResource({ source: "internal", resourceId: "project1.missing", controls: [{ resourceId: "project1.task1" }] }), null, "unknown resource must not fall back to a Task control");
assertEqual(context.sessionTaskResource({ source: "internal", resourceId: "project1.archived" }), null, "archived Task must not provide AutoRun");
assertEqual(context.sessionTaskResource({ source: "external", resourceId: "project1.task1", controls: [{ resourceId: "project1.task1" }] }), null, "external Session must not borrow Task AutoRun");

const label = context.sessionOperationalLabel(
  { source: "internal" },
  resources.get("project1.task1"),
  { autoRun: context.deriveTaskAutoRunState(resources.get("project1.task1").autoRun, []) },
  sessionStatus,
);
assert(label.includes("AutoRun queued, generation 7"), "Session label should include AutoRun generation and state: " + label);
assert(label.includes("Session waiting for input"), "Session label should include its own Session state: " + label);
`

	testFile := filepath.Join(t.TempDir(), "session-operational-status.js")
	if err := os.WriteFile(testFile, []byte(script), 0o600); err != nil {
		t.Fatal(err)
	}
	if output, err := exec.Command(node, testFile, "static/app.js").CombinedOutput(); err != nil {
		t.Fatalf("Session operational status behavior test failed: %v\n%s", err, output)
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
	if !strings.Contains(string(appData), `<div class="create-task-dialog-body">`) {
		t.Fatal("create task dialog should wrap scrollable fields in a dedicated body so actions stay visible")
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
  max-height: calc(100vh - 48px);
  max-height: calc(100dvh - 48px);`,
		`.create-task-dialog .create-dialog-form {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  gap: 0;
  overflow: hidden;`,
		`.create-task-dialog-body {
  display: grid;
  gap: 10px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;`,
		`.create-task-dialog .form-actions {
  padding-top: 10px;`,
		`.create-task-dialog textarea[name="detail"] {
  min-height: clamp(180px, 32vh, 340px);`,
		`.create-task-dialog {
    max-height: calc(100vh - 24px);
    max-height: calc(100dvh - 24px);`,
	} {
		if !strings.Contains(styles, want) {
			t.Fatalf("responsive create task dialog styles are missing %q", want)
		}
	}
	if strings.Contains(styles, `width: min(900px, calc(100vw - 48px));
  height: min(760px`) {
		t.Fatal("create task dialog should size to its content instead of a fixed height")
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
		`<h1>${escapeHTML(detail.title)}${resourceRefBadge(selected.id)}</h1>`,
		`id="newTaskButton"`,
		`<button class="danger" id="archiveButton"`,
		`() => fileSection(detail)`,
		`() => artifactSection("Artifacts", detail.artifacts)`,
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

func TestTTYComposerOffersResumeForAgentHubAttachedRuns(t *testing.T) {
	data, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	source := string(data)
	for _, want := range []string{
		`const canResume = Boolean(activeRun.agentHubSessionId || activeRun.sourceExternalId);`,
		`agentComposerActions({ includeResume: canResume })`,
	} {
		if !strings.Contains(source, want) {
			t.Fatalf("TTY composer resume guard is missing %q", want)
		}
	}
	for _, removed := range []string{
		`const canResume = Boolean(activeRun.forgeSessionId)`,
	} {
		if strings.Contains(source, removed) {
			t.Fatalf("TTY composer resume must not require an active Forge session: %q", removed)
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

func TestTTYComposerDraftPersistence(t *testing.T) {
	data, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	source := string(data)
	for _, want := range []string{
		`const AGENT_DRAFT_STORAGE_PREFIX = "forge.gui.agentDraft.v1";`,
		`function agentDraftKeyForRun(run, workspaceId = state.activeWorkspaceId)`,
		`function pruneAgentDraftStorage(`,
		`function restoreAgentDraftForRun(run, workspaceId = state.activeWorkspaceId)`,
		`data-agent-draft-key=`,
		`updateAgentDraft(event.target.value);`,
		`window.addEventListener("pagehide", flushAgentDraftOnPageLeave);`,
		`window.addEventListener("beforeunload", flushAgentDraftOnPageLeave);`,
		`if (result?.status === "accepted")`,
		`clearAgentDraftAfterAccepted({`,
	} {
		if !strings.Contains(source, want) {
			t.Fatalf("TTY composer draft persistence is missing %q", want)
		}
	}

	submitStart := strings.Index(source, "async function submitTTYInput(event)")
	if submitStart < 0 {
		t.Fatal("could not isolate TTY submit handler")
	}
	submitEnd := strings.Index(source[submitStart:], "function resizeTTYInput(input)")
	if submitEnd < 0 {
		t.Fatal("could not isolate TTY submit handler boundary")
	}
	submit := source[submitStart : submitStart+submitEnd]
	if strings.Contains(submit, `state.agent.ttyDraft = ""`) || strings.Contains(submit, `state.agent.ttyMultiline = false`) {
		t.Fatal("TTY submit must only clear a draft after an accepted response and matching version")
	}

	node, err := exec.LookPath("node")
	if err != nil {
		t.Skip("node is required for TTY draft persistence tests")
	}
	script := `
const fs = require("node:fs");
const vm = require("node:vm");
const source = fs.readFileSync(process.argv[2], "utf8");
const start = source.indexOf("const AGENT_DRAFT_STORAGE_PREFIX");
const end = source.indexOf("async function api(path, options = {})", start);
if (start < 0 || end < 0) throw new Error("could not isolate draft helpers");

const data = new Map();
let storageBroken = false;
const storage = {
  get length() { return data.size; },
  key(index) { return Array.from(data.keys())[index] ?? null; },
  getItem(key) { if (storageBroken) throw new Error("storage unavailable"); return data.get(key) ?? null; },
  setItem(key, value) { if (storageBroken) throw new Error("quota exceeded"); data.set(key, String(value)); },
  removeItem(key) { if (storageBroken) throw new Error("storage unavailable"); data.delete(key); },
};
const runA = { id: "run-a", agentHubSessionId: "hub-a", resourceId: "project1.task1", status: "stopped" };
const runB = { id: "run-b", agentHubSessionId: "hub-b", resourceId: "project1.task1", status: "idle" };
const state = {
  activeWorkspaceId: "workspace-a",
  selectedId: "project1.task1",
  agent: {
    runs: [runA, runB],
    activeRunId: "run-a",
    ttyDraft: "",
    ttyMultiline: false,
    ttyDraftKey: "",
    ttyDraftWorkspaceId: "",
    ttyDraftResourceId: "",
    ttyDraftRunId: "",
    ttyDraftVersion: 0,
    sendingInput: false,
  },
};
function currentAgentRun() {
  return state.agent.runs.find((run) => run.id === state.agent.activeRunId) || null;
}
let ttyInput = null;
function $(id) { return id === "ttyInput" ? ttyInput : null; }
function assert(condition, message) { if (!condition) throw new Error(message); }
const context = { state, window: { localStorage: storage }, $, currentAgentRun, console };
vm.createContext(context);
vm.runInContext(source.slice(start, end), context);

const keyA = context.agentDraftKeyForRun(runA);
const keyB = context.agentDraftKeyForRun(runB);
const keyOtherWorkspace = context.agentDraftKeyForRun(runA, "workspace-b");
assert(keyA.startsWith("forge.gui.agentDraft.v1.session."), "draft keys need a stable versioned session prefix");
assert(keyA !== keyB, "different sessions in one task must use different keys");
assert(keyA !== keyOtherWorkspace, "different workspaces must use different keys");

context.restoreAgentDraftForRun(runA);
context.updateAgentDraft("line one\n/tmp/uploaded-path.txt");
assert(state.agent.ttyMultiline, "multiline drafts must restore multiline mode");
const storedA = JSON.parse(data.get(keyA));
assert(storedA.text === "line one\n/tmp/uploaded-path.txt", "input and uploaded path must be persisted as text");
assert(storedA.version === 1 && storedA.workspaceId === "workspace-a" && storedA.runId === "run-a", "draft metadata is incomplete");

state.agent.activeRunId = "run-b";
context.restoreAgentDraftForRun(runB);
assert(state.agent.ttyDraft === "", "a different session must not inherit the previous draft");
context.updateAgentDraft("session B");
state.agent.activeRunId = "run-a";
context.restoreAgentDraftForRun(runA);
assert(state.agent.ttyDraft === "line one\n/tmp/uploaded-path.txt", "returning to a session must restore its draft");
assert(context.agentDraftKeyForRun({ ...runA, status: "idle" }) === keyA, "stopped/resumed sessions must keep the same draft key");

const staleVersion = state.agent.ttyDraftVersion;
context.updateAgentDraft("next message");
assert(!context.clearAgentDraftAfterAccepted({ workspaceId: "workspace-a", runId: "run-a", key: keyA, text: "next message", version: staleVersion }), "a newer draft version must survive an old send completion");
assert(state.agent.ttyDraft === "next message", "stale send completion changed the current draft");
const acceptedVersion = state.agent.ttyDraftVersion;
assert(context.clearAgentDraftAfterAccepted({ workspaceId: "workspace-a", runId: "run-a", key: keyA, text: "next message", version: acceptedVersion }), "matching accepted send should clear the draft");
assert(state.agent.ttyDraft === "" && !data.has(keyA), "accepted send must clear memory and storage");

data.set(keyA, "not-json");
assert(context.readAgentDraft(keyA) === "" && !data.has(keyA), "corrupt storage must be ignored and removed");
storageBroken = true;
state.agent.activeRunId = "run-a";
context.restoreAgentDraftForRun(runA);
context.updateAgentDraft("memory fallback");
assert(state.agent.ttyDraft === "memory fallback", "storage failures must keep the in-memory draft usable");
storageBroken = false;
context.updateAgentDraft("");
assert(state.agent.ttyDraft === "", "empty drafts must clear in-memory state");

(async () => {
const submitStart = source.indexOf("async function submitTTYInput(event)");
const submitEnd = source.indexOf("function resizeTTYInput(input)", submitStart);
if (submitStart < 0 || submitEnd < 0) throw new Error("could not isolate submit handler");
context.document = {
  activeElement: null,
  addEventListener() {},
  removeEventListener() {},
};
context.renderTTYComposer = () => {};
context.refreshIcons = () => {};
context.toast = () => {};
context.__sendAgentInput = async () => ({ status: "accepted" });
vm.runInContext("async function sendAgentInput(text) { return globalThis.__sendAgentInput(text); }\n" + source.slice(submitStart, submitEnd), context);

state.agent.activeRunId = "run-a";
context.restoreAgentDraftForRun(runA);
ttyInput = { value: "failed message", dataset: { agentDraftKey: state.agent.ttyDraftKey }, focus() {} };
context.document.activeElement = ttyInput;
context.__sendAgentInput = async () => ({ status: "rejected" });
await context.submitTTYInput({ preventDefault() {} });
assert(state.agent.ttyDraft === "failed message" && data.has(keyA), "failed sends must retain the draft");

context.__sendAgentInput = async () => { throw new Error("network"); };
await context.submitTTYInput({ preventDefault() {} });
assert(state.agent.ttyDraft === "failed message" && data.has(keyA), "network errors must retain the draft");

context.__sendAgentInput = async () => ({ status: "accepted" });
ttyInput.value = "accepted message";
await context.submitTTYInput({ preventDefault() {} });
assert(state.agent.ttyDraft === "" && !data.has(keyA), "only an explicitly accepted send may clear the draft");

context.restoreAgentDraftForRun(runA);
ttyInput.value = "sent message";
let resolveSend;
context.__sendAgentInput = () => new Promise((resolve) => { resolveSend = resolve; });
const pendingSend = context.submitTTYInput({ preventDefault() {} });
await Promise.resolve();
assert(resolveSend, "send request did not start");
context.updateAgentDraft("typed while sending");
ttyInput.value = "typed while sending";
resolveSend({ status: "accepted" });
await pendingSend;
assert(state.agent.ttyDraft === "typed while sending" && data.has(keyA), "a stale accepted callback must not clear newer input");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
`
	testFile := filepath.Join(t.TempDir(), "tty-drafts.js")
	if err := os.WriteFile(testFile, []byte(script), 0o600); err != nil {
		t.Fatal(err)
	}
	if output, err := exec.Command(node, testFile, "static/app.js").CombinedOutput(); err != nil {
		t.Fatalf("TTY draft persistence test failed: %v\n%s", err, output)
	}
}

func TestTTYRenderDefersWhileTextSelected(t *testing.T) {
	data, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	source := string(data)
	for _, want := range []string{
		`function ttyLogHasActiveSelection(log) {`,
		`selection.getRangeAt(0).intersectsNode(log)`,
		`if (previousRunId === nextRunId && ttyLogHasActiveSelection(log)) {`,
		`state.agent.renderDeferredForSelection = true;`,
		`document.addEventListener("selectionchange", () => {`,
	} {
		if !strings.Contains(source, want) {
			t.Fatalf("TTY selection-safe render is missing %q", want)
		}
	}

	guard := strings.Index(source, `if (previousRunId === nextRunId && ttyLogHasActiveSelection(log)) {`)
	replace := strings.Index(source, `log.innerHTML =`)
	if guard < 0 || replace < 0 || guard > replace {
		t.Fatal("TTY render must defer before replacing the session log DOM")
	}

	listener := strings.Index(source, `document.addEventListener("selectionchange", () => {`)
	flush := strings.Index(source[listener:], `renderTTY();`)
	if listener < 0 || flush < 0 {
		t.Fatal("selectionchange listener must flush the deferred TTY render")
	}
}

func TestTTYLogActiveSelectionDetection(t *testing.T) {
	node, err := exec.LookPath("node")
	if err != nil {
		t.Skip("node is required for TTY selection detection tests")
	}
	script := `
const fs = require("node:fs");
const vm = require("node:vm");
const source = fs.readFileSync(process.argv[1], "utf8");
const marker = "function ttyLogHasActiveSelection(";
const start = source.indexOf(marker);
if (start < 0) throw new Error("missing ttyLogHasActiveSelection");
const open = source.indexOf("{", start);
let depth = 0;
let end = -1;
for (let index = open; index < source.length; index++) {
  if (source[index] === "{") depth++;
  if (source[index] === "}") {
    depth--;
    if (depth === 0) { end = index + 1; break; }
  }
}
if (end < 0) throw new Error("unterminated ttyLogHasActiveSelection");
const log = {};
function selectionFor(intersects) {
  return {
    isCollapsed: false,
    rangeCount: 1,
    getRangeAt: () => ({ intersectsNode: (node) => node === log && intersects }),
  };
}
const cases = [
  [undefined, false],
  [{ isCollapsed: true, rangeCount: 0, getRangeAt: () => { throw new Error("no range"); } }, false],
  [selectionFor(true), true],
  [selectionFor(false), false],
];
for (const [selection, want] of cases) {
  const context = { window: { getSelection: () => selection } };
  vm.createContext(context);
  vm.runInContext(source.slice(start, end), context);
  const got = context.ttyLogHasActiveSelection(log);
  if (got !== want) throw new Error("ttyLogHasActiveSelection(" + JSON.stringify(selection) + ") = " + got + ", want " + want);
}
`
	appPath := filepath.Join("static", "app.js")
	if output, err := exec.Command(node, "-e", script, appPath).CombinedOutput(); err != nil {
		t.Fatalf("TTY selection detection failed: %v\n%s", err, output)
	}
}

func TestNewSessionComposerUsesSingleAgentChooserFlow(t *testing.T) {
	data, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	source := string(data)
	composerStart := strings.Index(source, `function agentComposerActions(options = {}) {`)
	composerEnd := -1
	if composerStart >= 0 {
		composerEnd = strings.Index(source[composerStart:], `function agentDisplayName(agent) {`)
	}
	if composerStart < 0 || composerEnd < 0 {
		t.Fatal("New Session composer renderer is missing")
	}
	composer := source[composerStart : composerStart+composerEnd]
	for _, want := range []string{
		`id="agentStartButton" class="tty-new-session-button"`,
		`aria-haspopup="menu"`,
		`aria-controls="ttyAgentMenu"`,
		`id="ttyAgentMenu" class="tty-agent-menu" role="menu"`,
		`role="menuitem"`,
		`agentConfigSummary(agent)`,
		`Creating Session...`,
		`No enabled agents are available. Configure an AgentHub Agent in Settings.`,
	} {
		if !strings.Contains(composer, want) {
			t.Fatalf("New Session composer is missing %q", want)
		}
	}
	for _, removed := range []string{
		`id="agentChooserButton"`,
		`class="tty-new-session-main"`,
		`class="tty-new-session-agent"`,
		`with ${escapeHTML(agentLabel)}`,
	} {
		if strings.Contains(composer, removed) {
			t.Fatalf("split New Session control is still rendered: %q", removed)
		}
	}

	start := strings.Index(source, `const startButton = $("agentStartButton");`)
	end := -1
	if start >= 0 {
		end = strings.Index(source[start:], `const closeSessionButton = $("agentCloseSessionButton");`)
	}
	if start < 0 || end < 0 {
		t.Fatal("New Session event handler boundary is missing")
	}
	handler := source[start : start+end]
	for _, want := range []string{
		`state.agent.agentChooserOpen = !state.agent.agentChooserOpen;`,
		`focusAgentChoice();`,
		`const agentName = button.dataset.agentChoice || "";`,
		`startAgentRun(agentName).catch((err) => toast(err.message));`,
	} {
		if !strings.Contains(handler, want) {
			t.Fatalf("New Session event handler is missing %q", want)
		}
	}
	if strings.Contains(handler, `startAgentRun().catch`) {
		t.Fatal("clicking New Session must open the Agent chooser instead of starting immediately")
	}
	if strings.Contains(handler, `state.agent.agentName = button.dataset.agentChoice;`) {
		t.Fatal("Agent selection must use the single Session creation flow")
	}

	startRun := strings.Index(source, `async function startAgentRun(agentName = "") {`)
	endRun := -1
	if startRun >= 0 {
		endRun = strings.Index(source[startRun:], `async function sendAgentInput(text) {`)
	}
	if startRun < 0 || endRun < 0 {
		t.Fatal("New Session start function is missing")
	}
	startRunSource := source[startRun : startRun+endRun]
	for _, want := range []string{
		`if (state.agent.newSessionStarting) return;`,
		`state.agent.newSessionStarting = true;`,
		`state.agent.agentChooserOpen = false;`,
		`state.agent.newSessionStarting = false;`,
	} {
		if !strings.Contains(startRunSource, want) {
			t.Fatalf("New Session start flow is missing %q", want)
		}
	}

	styles, err := staticFiles.ReadFile("static/styles.css")
	if err != nil {
		t.Fatal(err)
	}
	styleSource := string(styles)
	if !strings.Contains(styleSource, ".tty-new-session-button {") {
		t.Fatal("single New Session button styling is missing")
	}
	for _, removed := range []string{".tty-new-session-main", ".tty-new-session-agent"} {
		if strings.Contains(styleSource, removed) {
			t.Fatalf("split New Session styling is still present: %q", removed)
		}
	}
	if !strings.Contains(source, `const outsideAgentChooser = state.agent.agentChooserOpen && target && !target.closest(".tty-new-session-control");`) {
		t.Fatal("clicking outside the Agent chooser must close it")
	}
	if !strings.Contains(source, `event.key === "Escape" && (state.agent.optionsOpen || state.agent.agentChooserOpen || state.agent.historyOpen)`) {
		t.Fatal("Escape must close the Agent chooser")
	}
}

func TestNewSessionAgentSelectionStartsExactlyOnce(t *testing.T) {
	node, err := exec.LookPath("node")
	if err != nil {
		t.Skip("node is required for the New Session interaction test")
	}
	data, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	source := string(data)
	start := strings.Index(source, `async function startAgentRun(agentName = "") {`)
	end := -1
	if start >= 0 {
		end = strings.Index(source[start:], `async function sendAgentInput(text) {`)
	}
	if start < 0 || end < 0 {
		t.Fatal("could not isolate the New Session start flow")
	}
	startRunSource := source[start : start+end]
	script := `
const state = {
  activeWorkspaceId: "workspace-one",
  selectedId: "project1",
  agent: {
    runs: [],
    activeRunId: "",
    agentName: "agent-one",
    agentChooserOpen: true,
    newSessionStarting: false,
    draftPrompt: "draft",
    ttyDraft: "draft",
    ttyMultiline: true,
    optionsOpen: false,
    historyOpen: false,
  },
  config: {
    agents: [
      { id: "agent-one", available: true },
      { id: "agent-two", available: true },
    ],
  },
};
let apiCalls = [];
let resolveAPI;
let apiMode = "success";
async function api(path, options = {}) {
  apiCalls.push(JSON.parse(options.body));
  if (apiMode === "failure") throw new Error("AgentHub unavailable");
  return await new Promise((resolve) => { resolveAPI = resolve; });
}
function enabledAgentConfigs() { return state.config.agents.filter((agent) => agent.available !== false); }
function selectedAgentConfig() { return enabledAgentConfigs().find((agent) => agent.id === state.agent.agentName) || enabledAgentConfigs()[0] || null; }
function findResource(id) { return id === "project1" ? { id, title: "Forge", path: "/tmp/project1" } : null; }
function agentDefaultCwd() { return "/tmp/project1"; }
function workspaceName() { return "Workspace"; }
function mutateAgentSession(action) { return action(); }
function renderTTYComposer() {}
function bindAgentEvents() {}
function refreshIcons() {}
async function loadAgentRuns() {}
async function refreshTreeAfterAgentSessionMutation() {}
function renderAll() {}
function toast() {}
function assert(condition, message) { if (!condition) throw new Error(message); }
` + startRunSource + `
(async function run() {
  const first = startAgentRun("agent-two");
  await Promise.resolve();
  assert(apiCalls.length === 1, "first Agent choice should issue one request");
  assert(apiCalls[0].agentName === "agent-two", "request must use the clicked Agent");
  assert(state.agent.newSessionStarting, "Session creation should expose a pending state");
  const duplicate = startAgentRun("agent-one");
  assert(await duplicate === undefined, "a second click must be ignored while creating");
  assert(apiCalls.length === 1, "duplicate click must not issue another request");
  resolveAPI({ run: { id: "run-two" } });
  await first;
  assert(state.agent.activeRunId === "run-two", "success should select the new Session");
  assert(state.agent.agentName === "agent-two", "success should retain the chosen Agent");
  assert(!state.agent.agentChooserOpen, "success should close the Agent chooser");
  assert(!state.agent.newSessionStarting, "success should clear the pending state");

  apiMode = "failure";
  state.agent.agentChooserOpen = true;
  state.agent.activeRunId = "run-existing";
  let failed = false;
  try {
    await startAgentRun("agent-one");
  } catch (error) {
    failed = error.message === "AgentHub unavailable";
  }
  assert(failed, "the AgentHub error should reach the composer handler");
  assert(state.agent.activeRunId === "run-existing", "failure must stay on the current Session");
  assert(state.agent.agentChooserOpen, "failure should keep the chooser open for retry");
  assert(!state.agent.newSessionStarting, "failure should clear the pending state");
  assert(apiCalls.length === 2, "failure should still represent only one additional request");
})().catch((error) => { console.error(error.stack || error); process.exitCode = 1; });
`
	testFile := filepath.Join(t.TempDir(), "new-session-agent-selection.js")
	if err := os.WriteFile(testFile, []byte(script), 0o600); err != nil {
		t.Fatal(err)
	}
	if output, err := exec.Command(node, testFile).CombinedOutput(); err != nil {
		t.Fatalf("New Session Agent selection behavior test failed: %v\n%s", err, output)
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

func TestEndTurnAndCloseSessionComposerUsesToolbar(t *testing.T) {
	data, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	source := string(data)
	for _, want := range []string{
		`function isAgentTurnInterruptible(run)`,
		`["running", "waiting_approval"].includes(run?.status)`,
		`includeEndTurn: stopTurnAvailable`,
		`function agentComposerToolbarActions(options = {})`,
		`id="agentEndTurnButton"`,
		`icon(endTurnPending ? "loader-circle" : "pause")`,
		`End current turn; keep the Session open.`,
		`id="agentCloseSessionButton"`,
		`Close session; end the entire AgentHub Session.`,
		`async function stopAgentTurn()`,
		`/interrupt`,
		`state.agent.turnStopping = true`,
		`Turn ended. The AgentHub Session remains open.`,
		`state.agent.sessionStopping = true`,
		`Closing session…`,
	} {
		if !strings.Contains(source, want) {
			t.Fatalf("End Turn/Close Session composer is missing %q", want)
		}
	}
	actionsStart := strings.Index(source, `function agentComposerActions(options = {}) {`)
	actionsEnd := -1
	if actionsStart >= 0 {
		actionsEnd = strings.Index(source[actionsStart:], `function agentComposerToolbarActions(options = {}) {`)
	}
	if actionsStart < 0 || actionsEnd < 0 {
		t.Fatal("Session actions composer boundary is missing")
	}
	actionsSource := source[actionsStart : actionsStart+actionsEnd]
	for _, removed := range []string{`id="agentEndTurnButton"`, `id="agentCloseSessionButton"`, `Stop Turn`} {
		if strings.Contains(actionsSource, removed) {
			t.Fatalf("bottom Session actions still render the moved control %q", removed)
		}
	}
	toolbarStart := strings.Index(source, `function agentComposerToolbarActions(options = {}) {`)
	toolbarEnd := strings.Index(source[toolbarStart:], `function agentDisplayName(agent) {`)
	if toolbarStart < 0 || toolbarEnd < 0 {
		t.Fatal("composer toolbar boundary is missing")
	}
	toolbarSource := source[toolbarStart : toolbarStart+toolbarEnd]
	if strings.Contains(toolbarSource, `<span>`) {
		t.Fatal("End Turn and Close Session toolbar buttons must remain icon-only")
	}
	if strings.Index(toolbarSource, `id="agentEndTurnButton"`) > strings.Index(toolbarSource, `id="agentCloseSessionButton"`) {
		t.Fatal("End Turn must precede Close Session in the composer toolbar")
	}
	stylesData, err := staticFiles.ReadFile("static/styles.css")
	if err != nil {
		t.Fatal(err)
	}
	styles := string(stylesData)
	for _, want := range []string{
		`.tty-composer-action`,
		`.tty-end-turn-button:hover:not(:disabled)`,
		`.tty-close-session-button:hover:not(:disabled)`,
		`.tty-composer-action:focus-visible`,
	} {
		if !strings.Contains(styles, want) {
			t.Fatalf("End Turn/Close Session composer styles are missing %q", want)
		}
	}
}

func TestComposerToolbarStateMatrix(t *testing.T) {
	node, err := exec.LookPath("node")
	if err != nil {
		t.Skip("node is required for the composer toolbar state test")
	}
	script := `
const fs = require("node:fs");
const source = fs.readFileSync(process.argv[1], "utf8");
function extract(name) {
  const marker = "function " + name + "(";
  const start = source.indexOf(marker);
  if (start < 0) throw new Error("missing " + name);
  const signatureEnd = source.indexOf(") {", start);
  const open = signatureEnd + 2;
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
function icon(name) { return '<svg data-icon="' + name + '"></svg>'; }
function escapeHTML(value) { return String(value ?? ""); }
function assert(condition, message) { if (!condition) throw new Error(message); }
const resources = new Map();
function findResource(id) { return resources.get(id) || null; }
eval(extract("isAgentTurnInterruptible"));
eval(extract("isAutoRunSessionCloseTarget"));
eval(extract("agentComposerToolbarActions"));
for (const status of ["running", "waiting_approval"]) {
  assert(isAgentTurnInterruptible({ status }), status + " must be interruptible");
}
for (const status of ["starting", "idle", "stopping", "recovering", "stopped"]) {
  assert(!isAgentTurnInterruptible({ status }), status + " must not be interruptible");
}
resources.set("project1.task1", { autoRun: { generation: 7, state: "running" } });
assert(isAutoRunSessionCloseTarget({ resourceId: "project1.task1", autoRunGeneration: 7, schedulerTurn: true }), "current running AutoRun must be a close cancellation target");
assert(!isAutoRunSessionCloseTarget({ resourceId: "project1.task1", autoRunGeneration: 6, schedulerTurn: true }), "historical AutoRun must not be a close cancellation target");
resources.get("project1.task1").autoRun.state = "completed";
assert(!isAutoRunSessionCloseTarget({ resourceId: "project1.task1", autoRunGeneration: 7, schedulerTurn: true }), "terminal AutoRun must not be a close cancellation target");
assert(!isAutoRunSessionCloseTarget({ resourceId: "project1.task1", autoRunGeneration: 0, schedulerTurn: false }), "ordinary Chat Session must not be a close cancellation target");
const idle = agentComposerToolbarActions({ includeClose: true });
assert(!idle.includes('id="agentEndTurnButton"'), "idle must not render End Turn");
assert(idle.includes('id="agentCloseSessionButton"'), "live idle must render Close Session");
assert(idle.includes('data-icon="square"'), "Close Session must use the square icon");
assert(!idle.includes("<span>"), "toolbar controls must be icon-only");
const running = agentComposerToolbarActions({ includeEndTurn: true, includeClose: true });
assert(running.indexOf('id="agentEndTurnButton"') < running.indexOf('id="agentCloseSessionButton"'), "End Turn must follow Upload and precede Close Session");
assert(running.includes('title="End current turn; keep the Session open."'), "End Turn tooltip must explain Session retention");
assert(running.includes('aria-label="Close session; end the entire AgentHub Session."'), "Close Session aria-label must explain full close");
const autoRunClose = agentComposerToolbarActions({ includeClose: true, cancelAutoRunOnClose: true });
assert(autoRunClose.includes('title="Cancel AutoRun and close the session."'), "AutoRun Close Session tooltip must explain the cancellation");
assert(autoRunClose.includes('aria-label="Cancel AutoRun and close the session."'), "AutoRun Close Session aria-label must explain the cancellation");
const ending = agentComposerToolbarActions({ includeEndTurn: true, endingTurn: true, includeClose: true });
assert(ending.includes('id="agentEndTurnButton"') && ending.includes('disabled aria-busy="true"'), "ending turn must disable End Turn");
assert(ending.includes('id="agentCloseSessionButton"') && ending.includes('disabled aria-busy="true"'), "ending turn must disable Close Session");
assert(ending.includes('title="Ending turn…"'), "ending turn must expose pending feedback");
assert(!ending.includes("<span>"), "pending toolbar controls must remain icon-only");
const closing = agentComposerToolbarActions({ includeEndTurn: true, closingSession: true, includeClose: true });
assert(closing.includes('title="Closing session…"'), "closing session must expose pending feedback");
assert(closing.includes('id="agentCloseSessionButton"') && closing.includes('disabled aria-busy="true"'), "closing session must disable duplicate close");
`
	appPath := filepath.Join("static", "app.js")
	if output, err := exec.Command(node, "-e", script, appPath).CombinedOutput(); err != nil {
		t.Fatalf("composer toolbar state test failed: %v\n%s", err, output)
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
		`suspended: { label: "Suspended", icon: "pause" }`,
		`paused: { label: "Paused", icon: "pause" }`,
		`completed: { label: "Completed", icon: "circle-check" }`,
		`failed: { label: "Failed", icon: "circle-x" }`,
		`cancelled: { label: "Cancelled", icon: "ban" }`,
		`const mode = ["completed", "failed", "cancelled"].includes(autoRun?.state) ? "new" : "configure";`,
		`class="autorun-status autorun-status-${presentation.key} autorun-collapsible${state.agent.autoRunExpanded ? " expanded" : ""}" role="status"`,
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
		`.autorun-status-suspended`,
		`.autorun-status-paused`,
		`.autorun-status-completed`,
		`.autorun-status-failed`,
		`.autorun-status-cancelled`,
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
		`const AGENT_HIDDEN_EVENT_TYPES = new Set(["session.launch-environment"]);`,
		`const visibleEvents = state.agent.events.filter((event) => !AGENT_HIDDEN_EVENT_TYPES.has(event?.type));`,
		`window.AgentHubEventTimeline.buildTimeline(visibleEvents)`,
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

func TestAgentLiveDeltaMergePreservesThinkingStartTime(t *testing.T) {
	node, err := exec.LookPath("node")
	if err != nil {
		t.Skip("node is required for live delta merge tests")
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
const context = {
  state: { agent: { events: [] } },
  isKnownCanonicalAgentEvent() { return false; },
  scheduleAgentRender() {},
};
vm.createContext(context);
vm.runInContext(extract("appendCanonicalAgentEvent"), context);
context.appendCanonicalAgentEvent({
  id: 7,
  time: "2026-01-01T00:00:00Z",
  type: "message.reasoning.delta",
  data: { text: "first" },
});
context.appendCanonicalAgentEvent({
  id: 7,
  time: "2026-01-01T00:01:02Z",
  startTime: "2026-01-01T00:00:00Z",
  type: "message.reasoning.delta",
  data: { text: " second", append: true },
});
const patched = context.state.agent.events[0];
if (patched.data.text !== "first second" || patched.time !== "2026-01-01T00:01:02Z" || patched.startTime !== "2026-01-01T00:00:00Z") {
  throw new Error("append patch lost thinking timestamps: " + JSON.stringify(patched));
}
context.appendCanonicalAgentEvent({
  id: 7,
  time: "2026-01-01T00:01:03Z",
  type: "message.reasoning.delta",
  data: { text: "first second" },
});
const healed = context.state.agent.events[0];
if (healed.startTime !== "2026-01-01T00:00:00Z" || healed.time !== "2026-01-01T00:01:03Z") {
  throw new Error("full replacement lost thinking start time: " + JSON.stringify(healed));
}
`
	appPath := filepath.Join("static", "app.js")
	if output, err := exec.Command(node, "-e", script, appPath).CombinedOutput(); err != nil {
		t.Fatalf("live delta merge behavior failed: %v\n%s", err, output)
	}
}

func TestAgentTimelineHidesLaunchEnvironmentEvents(t *testing.T) {
	node, err := exec.LookPath("node")
	if err != nil {
		t.Skip("node is required for timeline filtering tests")
	}
	script := `
const fs = require("node:fs");
const vm = require("node:vm");
const source = fs.readFileSync(process.argv[1], "utf8");
const start = source.indexOf("const AGENT_HIDDEN_EVENT_TYPES");
const end = source.indexOf("function renderAgent()", start);
if (start < 0 || end < 0) throw new Error("missing agent timeline projection source");
const context = {
  state: {
    agent: {
      events: [
        { id: 1, type: "session.launch-environment" },
        { id: 2, type: "session.state" },
      ],
    },
  },
  window: {
    AgentHubEventTimeline: {
      buildTimeline(events) {
        return events.map((event) => ({ type: event.type }));
      },
    },
  },
};
vm.createContext(context);
vm.runInContext(source.slice(start, end), context);
const actual = context.projectAgentTimeline();
if (JSON.stringify(actual) !== JSON.stringify([{ type: "session.state" }])) {
  throw new Error("launch environment event was not hidden: " + JSON.stringify(actual));
}
if (context.state.agent.events.length !== 2) {
  throw new Error("timeline filtering must preserve raw events");
}
`
	appPath := filepath.Join("static", "app.js")
	if output, err := exec.Command(node, "-e", script, appPath).CombinedOutput(); err != nil {
		t.Fatalf("launch environment timeline filtering failed: %v\n%s", err, output)
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
const folded = context.AgentHubEventTimeline.buildTimeline([
  { id: 10, time: "2026-01-01T00:02:03Z", startTime: "2026-01-01T00:02:00Z", type: "message.reasoning.delta", data: { text: "folded" } },
  { id: 11, time: "2026-01-01T00:02:04Z", type: "message.assistant.delta", data: { text: "answer" } },
]);
const foldedThinking = folded.find((item) => item.kind === "thinking");
if (foldedThinking.startTime !== "2026-01-01T00:02:00Z" || foldedThinking.time !== "2026-01-01T00:02:03Z") {
  throw new Error("folded thinking timestamps were not projected");
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
		source.Revision == "" || source.SHA256 != actual {
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

func TestMobileAppShellTracksVisualViewport(t *testing.T) {
	indexData, err := staticFiles.ReadFile("static/index.html")
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(string(indexData), `interactive-widget=resizes-content`) {
		t.Fatal("viewport meta should resize the layout viewport when the software keyboard opens")
	}

	appData, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	app := string(appData)
	for _, want := range []string{
		`const MOBILE_LAYOUT_QUERY = window.matchMedia("(max-width: 980px)");`,
		`function syncAppViewport()`,
		`window.visualViewport.addEventListener("resize", syncAppViewport)`,
		`window.visualViewport.addEventListener("scroll", syncAppViewport)`,
		`window.scrollTo(0, 0)`,
		`document.addEventListener("focusout"`,
	} {
		if !strings.Contains(app, want) {
			t.Fatalf("mobile viewport sync behavior is missing %q", want)
		}
	}

	stylesData, err := staticFiles.ReadFile("static/styles.css")
	if err != nil {
		t.Fatal(err)
	}
	styles := string(stylesData)
	for _, want := range []string{
		`top: var(--app-viewport-offset-top, 0px);`,
		`left: var(--app-viewport-offset-left, 0px);`,
		`height: var(--app-viewport-height, 100dvh);`,
	} {
		if !strings.Contains(styles, want) {
			t.Fatalf("mobile app shell styles are missing %q", want)
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

func TestUIStateRoundTripsCustomOrder(t *testing.T) {
	workspace := t.TempDir()
	s := &server{config: filepath.Join(t.TempDir(), "gui.json")}
	if err := s.saveConfig(config{Version: agentHubConfigVersion, Workspaces: []guiWorkspace{{ID: "workspace-one", Path: workspace}}}); err != nil {
		t.Fatal(err)
	}

	put := httptest.NewRequest(http.MethodPut, "/api/workspaces/workspace-one/ui-state", strings.NewReader(`{"version":1,"expandedProjects":[],"projectOrder":["project2","project1"],"taskOrder":{"project1":["project1.task3","project1.task1"]},"sessionOrder":["session-b","session-a"]}`))
	rec := httptest.NewRecorder()
	s.handleWorkspace(rec, put)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected ui-state PUT to succeed, got %d: %s", rec.Code, rec.Body.String())
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
	if len(loaded.ProjectOrder) != 2 || loaded.ProjectOrder[0] != "project2" || loaded.ProjectOrder[1] != "project1" {
		t.Fatalf("expected persisted project order, got %+v", loaded.ProjectOrder)
	}
	if len(loaded.TaskOrder["project1"]) != 2 || loaded.TaskOrder["project1"][0] != "project1.task3" {
		t.Fatalf("expected persisted task order, got %+v", loaded.TaskOrder)
	}
	if len(loaded.SessionOrder) != 2 || loaded.SessionOrder[0] != "session-b" {
		t.Fatalf("expected persisted session order, got %+v", loaded.SessionOrder)
	}

	data, err := os.ReadFile(filepath.Join(workspace, ".forge", "gui-state.json"))
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(string(data), `"projectOrder"`) || !strings.Contains(string(data), `"taskOrder"`) || !strings.Contains(string(data), `"sessionOrder"`) {
		t.Fatalf("expected gui-state.json to persist custom order fields, got %s", data)
	}
}

func TestListDragHandleStaysHiddenUntilHoverAndRightAligned(t *testing.T) {
	stylesData, err := staticFiles.ReadFile("static/styles.css")
	if err != nil {
		t.Fatal(err)
	}
	styles := string(stylesData)
	for _, want := range []string{
		// The handle occupies a dedicated trailing grid column so it stays on the same row.
		`grid-template-columns: 16px 16px minmax(0, 1fr) auto;`,
		`grid-template-columns: 16px 16px 16px minmax(0, 1fr) auto;`,
		`grid-template-columns: 16px 36px 16px minmax(0, 1fr) auto;`,
		`grid-template-columns: 16px minmax(0, 1fr) auto auto auto;`,
		// The hidden base rule must outrank `.session-row span { display: block; }`.
		".tree-item .drag-handle,\n.session-row .drag-handle {\n  display: none;",
		// Hover reveals the handle.
		".tree-item:hover .drag-handle,\n.session-row:hover .drag-handle {\n  display: grid;",
	} {
		if !strings.Contains(styles, want) {
			t.Fatalf("drag handle styles are missing %q", want)
		}
	}
}

func TestListCustomOrderHelpers(t *testing.T) {
	node, err := exec.LookPath("node")
	if err != nil {
		t.Skip("node is required for the custom order helper test")
	}
	appData, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	app := string(appData)
	start := strings.Index(app, "function applyCustomOrder(items, orderedIds)")
	if start < 0 {
		t.Fatal("could not find applyCustomOrder function")
	}
	end := strings.Index(app[start:], "function sortedSessionsForDisplay(sessions)")
	if end < 0 {
		t.Fatal("could not isolate custom order helpers")
	}
	end += start

	script := `
function ids(items) {
  return items.map((item) => item.id).join(",");
}
function assertEqual(actual, expected, message) {
  if (actual !== expected) throw new Error(message + ": expected " + expected + ", got " + actual);
}
const items = [{ id: "a" }, { id: "b" }, { id: "c" }];
` + app[start:end] + `
assertEqual(ids(applyCustomOrder(items, [])), "a,b,c", "empty custom order keeps the default order");
assertEqual(ids(applyCustomOrder(items, ["c", "a", "b"])), "c,a,b", "custom order reorders known items");
assertEqual(ids(applyCustomOrder(items, ["c"])), "c,a,b", "items missing from the custom order append in default order");
assertEqual(ids(applyCustomOrder(items, ["stale", "b", "a"])), "b,a,c", "stale ids are ignored");
assertEqual(ids(applyCustomOrder(items, null)), "a,b,c", "missing custom order keeps the default order");
assertEqual(ids(applyCustomOrder(null, ["a"])), "", "missing items produce an empty list");
assertEqual(moveIdInList(["a", "b", "c"], "a", "c", true).join(","), "b,c,a", "move after the target");
assertEqual(moveIdInList(["a", "b", "c"], "c", "a", false).join(","), "c,a,b", "move before the target");
assertEqual(moveIdInList(["a", "b", "c"], "b", "b", true).join(","), "a,b,c", "dropping on itself keeps the order");
assertEqual(moveIdInList(["a", "b", "c"], "a", "missing", true).join(","), "a,b,c", "missing target keeps the order");
assertEqual(moveIdInList(["a", "b", "c"], "missing", "b", false).join(","), "a,missing,b,c", "dragged id missing from the list inserts before the target");
`

	testFile := filepath.Join(t.TempDir(), "custom-order-helpers.js")
	if err := os.WriteFile(testFile, []byte(script), 0o600); err != nil {
		t.Fatal(err)
	}
	if output, err := exec.Command(node, testFile).CombinedOutput(); err != nil {
		t.Fatalf("custom order helper test failed: %v\n%s", err, output)
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
		`lastResourceId: selectedId,`,
		`await loadUIState();
    if (!route.resourceId && state.lastResourceId) {
      state.selectedId = state.lastResourceId;
    }
    await loadTree({ replaceURL: true });`,
		`if (!await loadUIState(id, navigationVersion)) return;
  state.selectedId = state.lastResourceId || "workspace";
  await loadTree();`,
		`if (!await loadUIState(route.workspaceId, navigationVersion)) return;
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

func TestResourceRefBadgeShownInTreeAndDetails(t *testing.T) {
	data, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	source := string(data)
	for _, want := range []string{
		// Tree rows render the muted "#id" badge right after the resource name,
		// inside the same grid cell so the drag handle stays on the same row.
		`<span class="name"><span class="name-text">${escapeHTML(title)}</span>${resourceRefBadge(item.id)}${summaryMarkup}</span>`,
		// Details header shows the badge while loading and after loading.
		`<div class="title-row"><h1>${escapeHTML(selected.title)}${resourceRefBadge(selected.id)}</h1></div>`,
		`<h1>${escapeHTML(detail.title)}${resourceRefBadge(selected.id)}</h1>`,
	} {
		if !strings.Contains(source, want) {
			t.Fatalf("resource ref badge is missing %q", want)
		}
	}

	stylesData, err := staticFiles.ReadFile("static/styles.css")
	if err != nil {
		t.Fatal(err)
	}
	styles := string(stylesData)
	for _, want := range []string{".resource-ref {", ".tree-item .resource-ref {", ".title-row h1 .resource-ref {"} {
		if !strings.Contains(styles, want) {
			t.Fatalf("resource ref badge styles are missing %q", want)
		}
	}
}

func TestTreeProjectMetadataUsesCompactInlineLayout(t *testing.T) {
	appData, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	source := string(appData)
	for _, want := range []string{
		`<span class="name"><span class="name-text">${escapeHTML(title)}</span>${resourceRefBadge(item.id)}${summaryMarkup}</span>`,
		`const summaryMarkup = summary && !expanded ? projectTaskSummaryMarkup(summary) : "";`,
	} {
		if !strings.Contains(source, want) {
			t.Fatalf("tree project metadata markup is missing %q", want)
		}
	}

	stylesData, err := staticFiles.ReadFile("static/styles.css")
	if err != nil {
		t.Fatal(err)
	}
	styles := string(stylesData)
	extractRule := func(selector string) string {
		start := strings.Index(styles, selector+" {")
		if start < 0 {
			t.Fatalf("styles are missing %q", selector)
		}
		end := strings.Index(styles[start:], "}")
		if end < 0 {
			t.Fatalf("styles rule %q is unterminated", selector)
		}
		return styles[start : start+end+1]
	}

	nameRule := extractRule(".tree-item .name")
	for _, want := range []string{"display: flex;", "overflow: hidden;", "white-space: nowrap;"} {
		if !strings.Contains(nameRule, want) {
			t.Fatalf("tree name layout is missing %q: %s", want, nameRule)
		}
	}

	nameTextRule := extractRule(".tree-item .name .name-text")
	for _, want := range []string{"flex: 0 1 auto;", "min-width: 0;", "overflow: hidden;", "text-overflow: ellipsis;"} {
		if !strings.Contains(nameTextRule, want) {
			t.Fatalf("tree title truncation layout is missing %q: %s", want, nameTextRule)
		}
	}
	if strings.Contains(nameTextRule, "flex: 1 1 auto;") {
		t.Fatal("tree title must not grow and push the resource ref or project summary away")
	}

	resourceRule := extractRule(".tree-item .resource-ref")
	if !strings.Contains(resourceRule, "flex-shrink: 0;") {
		t.Fatalf("tree resource refs must remain identifiable while the title shrinks: %s", resourceRule)
	}

	summaryRule := extractRule(".project-task-summary")
	for _, want := range []string{"flex: 0 1 auto;", "max-width: min(48%, 148px);", "overflow: hidden;"} {
		if !strings.Contains(summaryRule, want) {
			t.Fatalf("project summary compact layout is missing %q: %s", want, summaryRule)
		}
	}
	if !strings.Contains(styles, "grid-template-columns: 16px 16px minmax(0, 1fr) auto;") {
		t.Fatal("tree rows must keep the drag handle in a dedicated trailing column")
	}
	if !strings.Contains(styles, "@media (max-width: 420px)") || !strings.Contains(styles, ".tree-item .name {\n    gap: 4px;") {
		t.Fatal("compact tree metadata must retain the narrow-layout spacing rule")
	}
}

func TestResourceRefBadgeHelper(t *testing.T) {
	node, err := exec.LookPath("node")
	if err != nil {
		t.Skip("node is required for the resource ref badge test")
	}
	appData, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	app := string(appData)
	start := strings.Index(app, "function resourceRefBadge(id)")
	if start < 0 {
		t.Fatal("could not find resourceRefBadge function")
	}
	end := strings.Index(app[start:], "function treeButton(item, kind, projectId = \"\")")
	if end < 0 {
		t.Fatal("could not isolate resourceRefBadge helper")
	}
	end += start

	script := `
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
}
function assertEqual(actual, expected, message) {
  if (actual !== expected) throw new Error(message + ": expected " + expected + ", got " + actual);
}
` + app[start:end] + `
assertEqual(resourceRefBadge(""), "", "empty id renders no badge");
assertEqual(resourceRefBadge("project1"), '<span class="resource-ref">#1</span>', "project id renders numeric ref");
assertEqual(resourceRefBadge("project1.task193"), '<span class="resource-ref">#193</span>', "task id renders numeric ref");
assertEqual(resourceRefBadge("project2.task3"), '<span class="resource-ref">#3</span>', "task number drops the project prefix");
assertEqual(resourceRefBadge("custom-slug"), '<span class="resource-ref">#custom-slug</span>', "non numeric ids fall back to the last segment");
`

	testFile := filepath.Join(t.TempDir(), "resource-ref-badge.js")
	if err := os.WriteFile(testFile, []byte(script), 0o600); err != nil {
		t.Fatal(err)
	}
	if output, err := exec.Command(node, testFile).CombinedOutput(); err != nil {
		t.Fatalf("resource ref badge helper test failed: %v\n%s", err, output)
	}
}
