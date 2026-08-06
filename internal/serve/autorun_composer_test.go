package serve

import (
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
eval(extract("standaloneComposerToolbar"));
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

html = render(null, [{ resourceId: task.id, status: "idle", schedulerTurn: false }]);
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
const standalone = standaloneComposerToolbar(render(null));
assert(standalone.includes('role="toolbar"') && standalone.includes('aria-label="AutoRun actions"'), "no-Session AutoRun toolbar must be discoverable");

const pendingToolbar = agentComposerToolbarActions({ includeEndTurn: true, includeClose: true, includeAutoRun: true, autoRunCancelling: true });
assert(pendingToolbar.includes('id="agentEndTurnButton"') && pendingToolbar.includes('disabled') && pendingToolbar.includes('aria-busy="true"'), "cancel pending must disable End Turn");
assert(pendingToolbar.includes('id="agentCloseSessionButton"') && pendingToolbar.includes('disabled') && pendingToolbar.includes('aria-busy="true"'), "cancel pending must disable Close Session");
`
	appPath := filepath.Join("static", "app.js")
	if output, err := exec.Command(node, "-e", script, appPath).CombinedOutput(); err != nil {
		t.Fatalf("AutoRun composer state matrix test failed: %v\n%s", err, output)
	}
}
