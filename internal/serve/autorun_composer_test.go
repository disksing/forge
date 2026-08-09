package serve

import (
	"os"
	"os/exec"
	"path/filepath"
	"testing"
)

func TestAutoRunComposerActionStateMatrix(t *testing.T) {
	node, err := exec.LookPath("node")
	if err != nil {
		t.Skip("node is required for the AutoRun composer state matrix test")
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
function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
function icon(name) { return '<svg data-icon="' + name + '"></svg>'; }
function assert(condition, message) { if (!condition) throw new Error(message); }
const task = { id: "project1.task1", type: "task", title: "Task One" };
const state = {
  selectedId: task.id,
  details: { [task.id]: task },
  externalLock: false,
  agent: { runs: [], autoRunStarting: false, autoRunCancelling: false },
};
function findResource(id) { return id === task.id ? task : null; }
function selectedResourceHasExternalLock() { return state.externalLock; }
function isLiveAgentRun(run) {
  return ["starting", "running", "waiting_approval", "idle", "stopping", "recovering"].includes(run?.status);
}
eval(extract("autoRunActionIcon"));
eval(extract("autoRunComposerAction"));
eval(extract("sessionControlComposerActions"));
eval(extract("agentComposerToolbarActions"));

function render(stateName, runs = [], externalLock = false) {
  state.externalLock = externalLock;
  state.agent.runs = runs;
  state.agent.autoRunStarting = false;
  state.agent.autoRunCancelling = false;
  state.details[task.id] = {
    ...task,
    ...(stateName === null ? {} : { autoRun: { generation: 7, state: stateName } }),
  };
  return autoRunComposerAction();
}
function assertIconOnly(html, message) {
  assert(!html.includes("<span>"), message + " must be icon-only");
  assert(html.includes('title="'), message + " needs a tooltip");
  assert(html.includes('aria-label="'), message + " needs an accessible name");
}

let html = render(null);
assert(html.includes('data-autorun-action="start"'), "no AutoRun must offer Start AutoRun");
assert(html.includes('title="Start AutoRun"'), "Start AutoRun needs its exact tooltip");
assert(html.includes('fill="#6d28d9"'), "Start AutoRun must use the violet workflow family badge");
assertIconOnly(html, "Start AutoRun");

for (const stateName of ["completed", "failed", "cancelled"]) {
  html = render(stateName);
  assert(html.includes('title="Start New AutoRun"'), stateName + " must offer Start New AutoRun");
  assert(!html.includes('id="autoRunCancelButton"'), stateName + " must not offer Cancel");
  assertIconOnly(html, "Start New AutoRun");
}

for (const stateName of ["queued", "running"]) {
  html = render(stateName);
  assert(!html.includes('id="autoRunStartButton"'), stateName + " must not offer a duplicate start action");
  assert(html.includes('id="autoRunCancelButton"'), stateName + " must offer Cancel AutoRun");
  assert(html.includes('aria-label="Cancel AutoRun"'), stateName + " Cancel needs its accessible name");
  assert(html.includes('fill="#b91c1c"'), stateName + " Cancel must use the red workflow family badge");
  assertIconOnly(html, "Cancel AutoRun");
}

html = render("suspended");
assert(html.indexOf('id="autoRunStartButton"') < html.indexOf('id="autoRunCancelButton"'), "suspended actions must offer Resume before Cancel");
assert(html.includes('title="Resume AutoRun now"'), "suspended must offer Resume AutoRun now");
assert(html.includes('aria-label="Cancel AutoRun"'), "suspended must keep Cancel alongside Resume");
assertIconOnly(html, "suspended AutoRun actions");

html = render("paused");
assert(html.includes('title="Resume AutoRun"'), "paused must offer Resume AutoRun");
assert(html.includes('id="autoRunCancelButton"'), "paused must keep Cancel alongside Resume");

assert(render("unknown") === "", "unknown AutoRun state must not expose an action");
assert(render("suspended", [], true) === "", "external locks must hide every AutoRun action");

html = render(null, [{ resourceId: task.id, status: "idle", schedulerTurn: false, agentHubSessionId: "session-1" }]);
assert(!html.includes(" disabled"), "an idle live Session must keep Start enabled");
assert(html.includes("reuse the current idle session"), "an idle live Session must explain reuse");

for (const status of ["starting", "running", "waiting_approval", "stopping", "recovering"]) {
  html = render(null, [{ resourceId: task.id, status, schedulerTurn: false }]);
  assert(html.includes('id="autoRunStartButton"') && html.includes(" disabled"), status + " must disable Start");
  assert(html.includes((status === "waiting_approval"
    ? "Resolve the pending approval before starting AutoRun in this session."
    : "The current session is busy; wait until it is idle to start AutoRun.")), status + " must explain its disabled reason");
}
html = render(null, [{ resourceId: "project1.task2", status: "running", schedulerTurn: false }]);
assert(!html.includes(" disabled"), "a busy Session for another task must not disable this task");

state.agent.autoRunCancelling = true;
html = render("queued");
state.agent.autoRunCancelling = true;
html = autoRunComposerAction();
assert(html.includes('id="autoRunCancelButton"') && html.includes('disabled') && html.includes('aria-busy="true"'), "cancellation must disable Cancel while pending");
assert(html.includes('data-icon="loader-circle"'), "cancellation must use the loading icon");
state.details[task.id] = { ...task, autoRun: { generation: 7, state: "paused" } };
html = autoRunComposerAction();
assert(html.includes('id="autoRunStartButton"') && html.includes('disabled') && html.includes('aria-busy="true"'), "cancellation must disable Resume while pending");

state.agent.autoRunCancelling = false;
state.details[task.id] = { ...task, autoRun: { generation: 7, state: "running" } };
const toolbar = agentComposerToolbarActions({ includeEndTurn: true, includeClose: true, includeAutoRun: true });
assert(toolbar.indexOf('id="agentEndTurnButton"') < toolbar.indexOf('id="agentCloseSessionButton"'), "End Turn must precede Close Session");
assert(toolbar.indexOf('id="agentCloseSessionButton"') < toolbar.indexOf('id="autoRunCancelButton"'), "AutoRun must follow Close Session");
assertIconOnly(toolbar, "live composer toolbar");
render(null);
const standalone = autoRunComposerAction({ variant: "labeled" });
assert(standalone.includes("<span>Start AutoRun</span>"), "standalone AutoRun action must include its visible label");
assert(standalone.includes("tty-primary-action"), "standalone AutoRun action must use a normal button style");
assert(!standalone.includes("tty-composer-action"), "standalone AutoRun action must not use the compact icon-only style");

const pendingToolbar = agentComposerToolbarActions({ includeEndTurn: true, includeClose: true, includeAutoRun: true, autoRunCancelling: true });
assert(pendingToolbar.includes('id="agentEndTurnButton"') && pendingToolbar.includes('disabled') && pendingToolbar.includes('aria-busy="true"'), "cancel pending must disable End Turn");
assert(pendingToolbar.includes('id="agentCloseSessionButton"') && pendingToolbar.includes('disabled') && pendingToolbar.includes('aria-busy="true"'), "cancel pending must disable Close Session");
`
	appPath := frontendAssetPath("app.js")
	if output, err := exec.Command(node, "-e", script, appPath).CombinedOutput(); err != nil {
		t.Fatalf("AutoRun composer state matrix test failed: %v\n%s", err, output)
	}
}

func TestStandaloneSessionAndAutoRunActionsShareLabeledRow(t *testing.T) {
	node, err := exec.LookPath("node")
	if err != nil {
		t.Skip("node is required for the standalone composer layout test")
	}
	script := `
const fs = require("node:fs");
const source = fs.readFileSync(process.argv[2], "utf8");
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
function escapeHTML(value) { return String(value ?? ""); }
function icon(name) { return '<svg data-icon="' + name + '"></svg>'; }
function assert(condition, message) { if (!condition) throw new Error(message); }
const task = { id: "project1.task1", type: "task", title: "Task One" };
const state = {
  selectedId: task.id,
  details: { [task.id]: task },
  externalLock: false,
  internalLock: false,
  config: { agents: [{ id: "agent-one", name: "Agent One", available: true }] },
  agent: {
    agentChooserOpen: false,
    newSessionStarting: false,
    sessionActionsOpen: false,
    runs: [],
    autoRunStarting: false,
    autoRunCancelling: false,
  },
};
function findResource(id) { return id === task.id ? task : null; }
function enabledAgentConfigs() { return state.config.agents; }
function selectedAgentConfig() { return state.config.agents[0] || null; }
function agentDisplayName(agent) { return agent?.name || agent?.id || "Agent"; }
function agentConfigSummary() { return "AgentHub"; }
function selectedResourceHasExternalLock() { return state.externalLock; }
function selectedResourceHasInternalLock() { return state.internalLock; }
function externalResourceLockNotice() { return '<div class="external-lock-notice">Resource locked</div>'; }
function autoRunActionIcon(kind) { return '<svg data-autorun-icon="' + kind + '"></svg>'; }
function isLiveAgentRun(run) { return ["starting", "running", "waiting_approval", "idle", "stopping", "recovering"].includes(run?.status); }
eval(extract("autoRunComposerAction"));
eval(extract("agentComposerActions"));
function render(autoRunState, includeResume = false) {
  state.externalLock = false;
  state.internalLock = false;
  state.agent.runs = [];
  state.details[task.id] = {
    ...task,
    ...(autoRunState === null ? {} : { autoRun: { generation: 7, state: autoRunState } }),
  };
  return agentComposerActions({ standalone: true, includeResume, includeAutoRun: true });
}
let html = render(null);
assert(html.includes('class="tty-session-actions tty-standalone-actions open"'), "no-history actions must use one standalone row");
assert(html.includes('role="toolbar" aria-label="Session and AutoRun actions"'), "standalone row must expose one combined action toolbar");
assert(html.includes('id="agentStartButton"') && html.includes('id="autoRunStartButton"'), "no-history row must offer New Session and Start AutoRun");
assert(html.indexOf('id="agentStartButton"') < html.indexOf('id="autoRunStartButton"'), "Session action must precede AutoRun in the shared row");
assert(html.includes('<span>Start AutoRun</span>'), "standalone Start AutoRun must be labeled");
assert(!html.includes('tty-composer-toolbar-standalone') && !html.includes('tty-composer-action'), "standalone row must not render the old icon-only toolbar");

html = render("suspended", true);
assert(html.includes('id="agentResumeButton"') && html.includes('id="agentStartButton"'), "resumable history must offer Resume and New Session together");
assert(html.includes('<span>Resume AutoRun now</span>') && html.includes('id="autoRunCancelButton"'), "resumable AutoRun controls must stay labeled in the shared row");

for (const [stateName, label] of [["completed", "Start New AutoRun"], ["failed", "Start New AutoRun"], ["cancelled", "Start New AutoRun"], ["paused", "Resume AutoRun"], ["queued", "Cancel AutoRun"], ["running", "Cancel AutoRun"]]) {
  html = render(stateName, true);
  assert(html.includes('<span>' + label + '</span>'), stateName + " standalone AutoRun action must be labeled");
}

state.internalLock = true;
html = agentComposerActions({ standalone: true, includeResume: true, includeAutoRun: true });
assert(!html.includes('id="agentStartButton"'), "a real internal lock must keep New Session unavailable");
assert(!html.includes('id="ttyAgentMenu"'), "a real internal lock must close the Agent chooser");
state.internalLock = false;
state.externalLock = true;
html = agentComposerActions({ standalone: true, includeResume: true, includeAutoRun: true });
assert(html.includes("external") || html.includes("locked"), "an external lock must retain its lock notice");
assert(!html.includes('id="agentStartButton"') && !html.includes('id="autoRunStartButton"'), "an external lock must hide standalone actions");
`
	appPath := frontendAssetPath("app.js")
	testFile := filepath.Join(t.TempDir(), "standalone-session-actions.js")
	if err := os.WriteFile(testFile, []byte(script), 0o600); err != nil {
		t.Fatal(err)
	}
	if output, err := exec.Command(node, testFile, appPath).CombinedOutput(); err != nil {
		t.Fatalf("standalone Session/AutoRun action row test failed: %v\n%s", err, output)
	}
}
