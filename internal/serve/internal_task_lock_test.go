package serve

import (
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
)

func TestInternalResourceLockHidesNewSessionAcrossStatuses(t *testing.T) {
	node, err := exec.LookPath("node")
	if err != nil {
		t.Skip("node is required for the internal resource lock composer test")
	}
	data, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	app := string(data)
	extract := func(name string) string {
		t.Helper()
		marker := "function " + name + "("
		start := strings.Index(app, marker)
		if start < 0 {
			t.Fatalf("missing %s", name)
		}
		open := strings.Index(app[start:], ") {")
		if open < 0 {
			t.Fatalf("missing opening brace for %s", name)
		}
		open += start + len(") ")
		depth := 0
		for index := open; index < len(app); index++ {
			switch app[index] {
			case '{':
				depth++
			case '}':
				depth--
				if depth == 0 {
					return app[start : index+1]
				}
			}
		}
		t.Fatalf("unterminated %s", name)
		return ""
	}

	script := `
const state = {
  selectedId: "project1.task1",
  tree: { sessions: [] },
  details: { "project1.task1": { type: "task" }, project1: { type: "project" } },
  config: { agents: [{ id: "agent-one", name: "Agent One", available: true }] },
  agent: { agentChooserOpen: true, newSessionStarting: false, sessionActionsOpen: false, runs: [], activeRunId: "" },
};
function findResource(id) {
  if (id === "project1.task1") return { id, type: "task", title: "Task One" };
  if (id === "project1") return { id, type: "project", title: "Project One" };
  return null;
}
function enabledAgentConfigs() { return state.config.agents.filter((agent) => agent.available !== false); }
function selectedAgentConfig() { return enabledAgentConfigs()[0] || null; }
function agentDisplayName(agent) { return agent?.name || agent?.id || "Agent"; }
function agentConfigSummary() { return "AgentHub"; }
function autoRunComposerAction() { return state.selectedId === "project1.task1" && !selectedResourceHasExternalLock() ? '<button id="autoRunStartButton">Start AutoRun</button>' : ''; }
function externalResourceLockNotice() { return '<div id="externalLockNotice">This resource is locked by an external session.</div>'; }
function icon() { return ""; }
function escapeHTML(value) { return String(value ?? ""); }
function isLiveAgentRun() { return false; }
` + extract("sessionControls") + `
` + extract("resourceLocks") + `
` + extract("selectedLockableResource") + `
` + extract("selectedResourceHasExternalLock") + `
` + extract("selectedResourceHasInternalLock") + `
` + extract("selectedResourceHasNewSessionLock") + `
` + extract("agentComposerToolbarActions") + `
` + extract("closeNewSessionChooserForResourceLock") + `
` + extract("agentComposerActions") + `
` + extract("selectedResourceLockComposerKey") + `
` + extract("autoRunComposerKey") + `
function assert(condition, message) { if (!condition) throw new Error(message); }
function lockedSession(id, source, status, resourceId = "project1.task1") {
  return { id, source, agentRunStatus: status, controls: [{ resourceId }] };
}
function composer() {
  return agentComposerActions({ includeClose: true, collapsible: true });
}
function toolbar() {
  return agentComposerToolbarActions({ includeEndTurn: true, includeClose: true, includeAutoRun: true });
}
const statuses = ["starting", "running", "waiting_approval", "idle", "stopping", "recovering", "unknown"];
for (const [resourceId, hasAutoRun] of [["project1.task1", true], ["project1", false]]) {
  for (const status of statuses) {
    state.selectedId = resourceId;
    state.tree.sessions = [lockedSession(resourceId + "-internal-" + status, "internal", status, resourceId)];
    state.agent.agentChooserOpen = true;
    closeNewSessionChooserForResourceLock();
    const html = composer();
    assert(!html.includes('id="agentStartButton"'), resourceId + " " + status + " internal lock must hide New Session");
    assert(!html.includes("ttyAgentMenu"), resourceId + " " + status + " internal lock must hide the open Agent chooser");
    assert(!html.includes('id="autoRunStartButton"'), resourceId + " " + status + " bottom actions must not render AutoRun");
    assert(toolbar().includes('id="autoRunStartButton"') === hasAutoRun, resourceId + " " + status + " toolbar AutoRun rendering mismatch");
    assert(!html.includes('id="agentCloseSessionButton"'), resourceId + " " + status + " must not duplicate Close Session in bottom actions");
    assert(toolbar().includes('id="agentCloseSessionButton"'), resourceId + " " + status + " toolbar must preserve Close Session");
    assert(!state.agent.agentChooserOpen, resourceId + " " + status + " internal lock must close the chooser state");
  }
}

state.selectedId = "project1.task1";
state.tree.sessions = [{ id: "other-internal", source: "internal", controls: [{ resourceId: "project1.task1" }], agentRunStatus: "idle" }];
state.agent.activeRunId = "history-run";
state.agent.runs = [{ id: "history-run", status: "stopped" }];
state.agent.agentChooserOpen = true;
closeNewSessionChooserForResourceLock();
assert(!composer().includes('id="agentStartButton"'), "a different internal session must hide New Session while history is selected");

state.tree.sessions = [lockedSession("external", "external", "running")];
state.agent.agentChooserOpen = true;
closeNewSessionChooserForResourceLock();
const externalHTML = composer();
assert(!externalHTML.includes('id="agentStartButton"'), "external lock must keep New Session hidden");
assert(externalHTML.includes("externalLockNotice"), "external lock must keep its dedicated notice");
assert(!toolbar().includes('id="autoRunStartButton"'), "an external task lock must hide AutoRun from the toolbar");
assert(!state.agent.agentChooserOpen, "external lock must close the chooser state");

state.tree.sessions = [lockedSession("internal", "internal", "idle"), lockedSession("external", "external", "running")];
assert(composer().includes("externalLockNotice"), "an external owner must retain external lock presentation when locks are mixed");

state.tree.sessions = [];
state.agent.agentChooserOpen = true;
state.agent.activeRunId = "history-run";
state.agent.runs = [{ id: "history-run", status: "stopped" }];
const releasedHTML = composer();
assert(releasedHTML.includes('id="agentStartButton"'), "New Session must return after the internal lock is released");
assert(releasedHTML.includes("ttyAgentMenu"), "the Agent chooser must be available again after lock release");

state.tree.sessions = [lockedSession("internal", "internal", "running", "project1")];
state.selectedId = "project1";
state.agent.agentChooserOpen = true;
closeNewSessionChooserForResourceLock();
const projectInternalHTML = composer();
assert(!projectInternalHTML.includes('id="agentStartButton"'), "an internal project lock must hide New Session");
assert(!projectInternalHTML.includes("ttyAgentMenu"), "an internal project lock must hide the open Agent chooser");
assert(!projectInternalHTML.includes('id="autoRunStartButton"'), "Project resources must not render AutoRun");
assert(projectInternalHTML === "", "an internal project lock with no remaining actions must hide the bottom action container");
assert(toolbar().includes('id="agentCloseSessionButton"'), "an internal project lock must preserve Close Session in the toolbar");
assert(!state.agent.agentChooserOpen, "an internal project lock must close the chooser state");

state.tree.sessions = [lockedSession("external-project", "external", "running", "project1")];
state.agent.agentChooserOpen = true;
closeNewSessionChooserForResourceLock();
const projectExternalHTML = composer();
assert(!projectExternalHTML.includes('id="agentStartButton"'), "an external project lock must hide New Session");
assert(projectExternalHTML.includes("externalLockNotice"), "an external project lock must keep its dedicated notice");
assert(!projectExternalHTML.includes('id="agentCloseSessionButton"'), "an external project lock must not duplicate Close Session in bottom actions");
assert(toolbar().includes('id="agentCloseSessionButton"'), "an external project lock must preserve Close Session in the toolbar");
assert(!toolbar().includes('id="autoRunStartButton"'), "an external project lock must hide AutoRun from the toolbar");
assert(!projectExternalHTML.includes("This task"), "an external project lock must not call the resource a task");
assert(!state.agent.agentChooserOpen, "an external project lock must close the chooser state");

state.selectedId = "workspace";
assert(composer().includes('id="agentStartButton"'), "workspace resources must not inherit resource lock hiding");

state.selectedId = "project1.task1";
state.tree.sessions = [];
const unlockedKey = autoRunComposerKey();
state.tree.sessions = [lockedSession("internal-key", "internal", "idle")];
const lockedKey = autoRunComposerKey();
assert(unlockedKey !== lockedKey, "composer cache key must change when an internal lock appears");
state.tree.sessions = [];
assert(autoRunComposerKey() === unlockedKey, "composer cache key must recover after an internal lock is released");

state.selectedId = "project1";
state.tree.sessions = [];
const unlockedProjectKey = autoRunComposerKey();
state.tree.sessions = [lockedSession("internal-project-key", "internal", "idle", "project1")];
const lockedProjectKey = autoRunComposerKey();
assert(unlockedProjectKey !== lockedProjectKey, "composer cache key must include a Project internal lock");
state.tree.sessions = [];
assert(autoRunComposerKey() === unlockedProjectKey, "Project composer cache key must recover after lock release");
`

	testFile := filepath.Join(t.TempDir(), "internal-task-lock-composer.js")
	if err := os.WriteFile(testFile, []byte(script), 0o600); err != nil {
		t.Fatal(err)
	}
	if output, err := exec.Command(node, testFile).CombinedOutput(); err != nil {
		t.Fatalf("internal resource lock composer behavior test failed: %v\n%s", err, output)
	}
}
