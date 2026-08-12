package serve

import (
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"encoding/xml"
	"errors"
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

func TestCanonicalFrontendAssetsAndHistoryFallback(t *testing.T) {
	indexData, err := staticFiles.ReadFile("static/index.html")
	if err != nil {
		t.Fatal(err)
	}
	index := string(indexData)
	if count := strings.Count(index, `type="module"`); count != 1 {
		t.Fatalf("index module entry count = %d, want 1", count)
	}
	for _, want := range []string{`src="/assets/forge-app.js"`, `href="/assets/forge-app.css"`} {
		if !strings.Contains(index, want) {
			t.Fatalf("canonical frontend asset is missing %s", want)
		}
	}
	if strings.Contains(index, `src="/app.js"`) {
		t.Fatal("removed application entry is still loaded")
	}
	if _, err := staticFiles.ReadFile("static/app.js"); !errors.Is(err, fs.ErrNotExist) {
		t.Fatalf("removed application entry is still embedded: %v", err)
	}

	staticRoot, err := fs.Sub(staticFiles, "static")
	if err != nil {
		t.Fatal(err)
	}
	for _, test := range []struct {
		path        string
		contentType string
	}{
		{path: "/assets/forge-app.js", contentType: "text/javascript; charset=utf-8"},
		{path: "/assets/forge-app.css", contentType: "text/css; charset=utf-8"},
	} {
		recorder := httptest.NewRecorder()
		serveStatic(staticRoot, recorder, httptest.NewRequest(http.MethodGet, test.path, nil))
		if recorder.Code != http.StatusOK || recorder.Header().Get("Content-Type") != test.contentType || recorder.Body.Len() == 0 {
			t.Fatalf("asset %s response = %d %q (%d bytes)", test.path, recorder.Code, recorder.Header().Get("Content-Type"), recorder.Body.Len())
		}
	}

	deepLink := httptest.NewRecorder()
	serveStatic(staticRoot, deepLink, httptest.NewRequest(http.MethodGet, "/w/workspace-one/r/project1.task1", nil))
	if deepLink.Code != http.StatusOK || !bytes.Equal(deepLink.Body.Bytes(), indexData) {
		t.Fatalf("History fallback response = %d (%d bytes), want index", deepLink.Code, deepLink.Body.Len())
	}
}

func TestWorkspaceIconCanBeUpdatedAndReset(t *testing.T) {
	configPath := filepath.Join(t.TempDir(), "gui.json")
	s := &server{config: configPath}
	if err := s.saveConfig(config{
		Version:    agentHubConfigVersion,
		Workspaces: []guiWorkspace{{ID: "workspace-one", Name: "One", Path: t.TempDir()}},
	}); err != nil {
		t.Fatal(err)
	}

	update := func(body string) *httptest.ResponseRecorder {
		req := httptest.NewRequest(http.MethodPut, "/api/workspaces/workspace-one", strings.NewReader(body))
		rec := httptest.NewRecorder()
		s.handleWorkspace(rec, req)
		return rec
	}

	rec := update(`{"icon":"software-engineering"}`)
	if rec.Code != http.StatusOK {
		t.Fatalf("workspace icon update returned %d: %s", rec.Code, rec.Body.String())
	}
	var workspace guiWorkspace
	if err := json.Unmarshal(rec.Body.Bytes(), &workspace); err != nil {
		t.Fatal(err)
	}
	if workspace.Icon != "software-engineering" {
		t.Fatalf("updated workspace icon is %q", workspace.Icon)
	}
	cfg, err := s.loadConfig()
	if err != nil {
		t.Fatal(err)
	}
	if got := cfg.Workspaces[0].Icon; got != "software-engineering" {
		t.Fatalf("persisted workspace icon is %q", got)
	}

	rec = update(`{"icon":"not-a-workspace-icon"}`)
	if rec.Code != http.StatusBadRequest {
		t.Fatalf("unknown workspace icon returned %d, want 400", rec.Code)
	}
	cfg, err = s.loadConfig()
	if err != nil {
		t.Fatal(err)
	}
	if got := cfg.Workspaces[0].Icon; got != "software-engineering" {
		t.Fatalf("invalid update changed workspace icon to %q", got)
	}

	rec = update(`{"icon":""}`)
	if rec.Code != http.StatusOK {
		t.Fatalf("workspace icon reset returned %d: %s", rec.Code, rec.Body.String())
	}
	cfg, err = s.loadConfig()
	if err != nil {
		t.Fatal(err)
	}
	if got := cfg.Workspaces[0].Icon; got != "" {
		t.Fatalf("reset workspace icon is %q, want empty", got)
	}
}

func TestAddingExistingWorkspacePreservesIcon(t *testing.T) {
	workspacePath := t.TempDir()
	if _, err := app.Initialize(workspacePath, "en"); err != nil {
		t.Fatal(err)
	}
	s := &server{config: filepath.Join(t.TempDir(), "gui.json")}
	workspace, err := s.addWorkspace(context.Background(), workspacePath)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := s.updateWorkspaceIcon(workspace.ID, "research-lab"); err != nil {
		t.Fatal(err)
	}
	readded, err := s.addWorkspace(context.Background(), workspacePath)
	if err != nil {
		t.Fatal(err)
	}
	if readded.Icon != "research-lab" {
		t.Fatalf("re-adding workspace changed icon to %q", readded.Icon)
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

func TestRemovedAutomationHTTPInputsAreRejected(t *testing.T) {
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

	recorder := httptest.NewRecorder()
	s.createTask(recorder, httptest.NewRequest(http.MethodPost, "/api/workspaces/workspace-one/tasks", strings.NewReader(`{"project":"project1","title":"Task","selfDriving":true}`)), "workspace-one")
	if recorder.Code != http.StatusBadRequest || !strings.Contains(recorder.Body.String(), "unknown field") {
		t.Fatalf("removed create field was accepted: %d %s", recorder.Code, recorder.Body.String())
	}

	recorder = httptest.NewRecorder()
	s.handleWorkspace(recorder, httptest.NewRequest(http.MethodPut, "/api/workspaces/workspace-one/self-driving", strings.NewReader(`{}`)))
	if recorder.Code != http.StatusNotFound {
		t.Fatalf("removed endpoint returned %d: %s", recorder.Code, recorder.Body.String())
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

func TestWorkspaceAgentsSaveRejectsChangedContentHash(t *testing.T) {
	workspace, err := app.Initialize(t.TempDir(), "en")
	if err != nil {
		t.Fatal(err)
	}
	configPath := filepath.Join(t.TempDir(), "gui.json")
	s := &server{config: configPath}
	if err := s.saveConfig(config{Version: agentHubConfigVersion, Workspaces: []guiWorkspace{{ID: "workspace-one", Name: "Test", Path: workspace.Root()}}}); err != nil {
		t.Fatal(err)
	}

	get := httptest.NewRecorder()
	s.handleWorkspace(get, httptest.NewRequest(http.MethodGet, "/api/workspaces/workspace-one/files?path=AGENTS.md", nil))
	if get.Code != http.StatusOK {
		t.Fatalf("initial AGENTS.md preview returned %d: %s", get.Code, get.Body.String())
	}
	var preview filePreview
	if err := json.Unmarshal(get.Body.Bytes(), &preview); err != nil {
		t.Fatal(err)
	}
	path := filepath.Join(workspace.Root(), "AGENTS.md")
	before, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	external := append(append([]byte(nil), before...), []byte("\nExternal change.\n")...)
	if err := os.WriteFile(path, external, 0o644); err != nil {
		t.Fatal(err)
	}
	body, _ := json.Marshal(map[string]string{"content": "Unsaved browser draft", "expectedContentHash": preview.ContentHash})
	put := httptest.NewRecorder()
	s.handleWorkspace(put, httptest.NewRequest(http.MethodPut, "/api/workspaces/workspace-one/files?path=AGENTS.md", bytes.NewReader(body)))
	if put.Code != http.StatusConflict || !strings.Contains(put.Body.String(), "changed on disk") {
		t.Fatalf("stale AGENTS.md save returned %d %q, want conflict", put.Code, put.Body.String())
	}
	after, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	if !bytes.Equal(after, external) {
		t.Fatal("stale AGENTS.md save overwrote the external change")
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

func TestVendoredAgentHubTimelineMatchesSharedFixtures(t *testing.T) {
	node, err := exec.LookPath("node")
	if err != nil {
		t.Skip("node is required for shared timeline conformance")
	}
	script := `
const fs = require("node:fs");
const { pathToFileURL } = require("node:url");
const [bundlePath, fixturePath, snapshotPath] = process.argv.slice(1);
(async () => {
const { buildTimeline } = await import(pathToFileURL(bundlePath).href);
const fixture = JSON.parse(fs.readFileSync(fixturePath, "utf8"));
const snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));
if (Array.isArray(fixture.scenarios)) {
  for (const scenario of fixture.scenarios) {
    const actual = buildTimeline(scenario.events);
    const expected = snapshot.scenarios[scenario.name];
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error("timeline snapshot mismatch: " + scenario.name);
    }
  }
} else {
  const events = [];
  fixture.pages.forEach((page, index) => {
    events.push(...page);
    const actual = buildTimeline(events);
    if (JSON.stringify(actual) !== JSON.stringify(snapshot.stages[index])) {
      throw new Error("pagination timeline snapshot mismatch at stage " + index);
    }
  });
  }
})().catch((error) => { console.error(error); process.exit(1); });
`
	for _, fixture := range []string{"canonical-events", "pagination-fragments"} {
		t.Run(fixture, func(t *testing.T) {
			args := []string{
				"-e", script,
				frontendSourcePath("vendor", "agenthub-event-timeline", "index.mjs"),
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
const { pathToFileURL } = require("node:url");
(async () => {
const { buildTimeline } = await import(pathToFileURL(process.argv[1]).href);
const timeline = buildTimeline([
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
const folded = buildTimeline([
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
})().catch((error) => { console.error(error); process.exit(1); });
`
	bundlePath := frontendSourcePath("vendor", "agenthub-event-timeline", "index.mjs")
	if output, err := exec.Command(node, "-e", script, bundlePath).CombinedOutput(); err != nil {
		t.Fatalf("shared timeline feature conformance failed: %v\n%s", err, output)
	}
}

func TestVendoredAgentHubTimelineSourceAndSHA256ArePinned(t *testing.T) {
	bundle, err := os.ReadFile(frontendSourcePath("vendor", "agenthub-event-timeline", "index.mjs"))
	if err != nil {
		t.Fatal(err)
	}
	sourceData, err := os.ReadFile(frontendSourcePath("vendor", "agenthub-event-timeline", "SOURCE.json"))
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
	if _, err := os.ReadFile(frontendSourcePath("vendor", "agenthub-event-timeline", "LICENSE")); err != nil {
		t.Fatal("vendored BSD-3-Clause license is missing")
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
