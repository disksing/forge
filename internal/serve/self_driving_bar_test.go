package serve

import (
	"fmt"
	"os/exec"
	"testing"
)

const selfDrivingBarTestExtractHelper = `
const fs = require("node:fs");
const source = fs.readFileSync(process.argv[1], "utf8");
function extract(name) {
  const marker = "function " + name + "(";
  const start = source.indexOf(marker);
  if (start < 0) throw new Error("missing " + name);
  const open = source.indexOf("{", source.indexOf(")", start));
  let depth = 0;
  for (let index = open; index < source.length; index++) {
    if (source[index] === "{") depth++;
    if (source[index] === "}" && --depth === 0) return source.slice(start, index + 1);
  }
  throw new Error("unterminated " + name);
}
function escapeHTML(value) { return String(value ?? ""); }
function icon(name) { return "<i>" + name + "</i>"; }
function assert(condition, message) { if (!condition) throw new Error(message); }
`

func runFrontendNode(t *testing.T, script string) {
	t.Helper()
	node, err := exec.LookPath("node")
	if err != nil {
		t.Skip("node is required")
	}
	if output, err := exec.Command(node, "-e", script, frontendAssetPath("app.js")).CombinedOutput(); err != nil {
		t.Fatal(fmt.Errorf("frontend Node test: %w\n%s", err, output))
	}
}

func TestSelfDrivingTopBarSwitchIsIndependentFromSessionMatrix(t *testing.T) {
	if _, err := exec.LookPath("node"); err != nil {
		t.Skip("node is required")
	}
	script := selfDrivingBarTestExtractHelper + `
const task = { id: "project1.task1", type: "task", title: "Task" };
const state = { selectedId: task.id, details: {}, agent: { runs: [], selfDrivingSaving: false, selfDrivingDisabling: false, selfDrivingExpanded: false } };
function findResource(id) { return id === task.id ? state.details[id] : null; }
function currentAgentRun() { return state.agent.runs[0] || null; }
eval(extract("selfDrivingStatusReason"));
eval(extract("selfDrivingPresentation"));
eval(extract("selfDrivingBarSummary"));
eval(extract("selfDrivingBarDetails"));
eval(extract("selfDrivingBarActions"));
eval(extract("selfDrivingTopBar"));

for (const status of ["none", "starting", "running", "waiting_approval", "idle", "stopped", "recovering"]) {
  state.agent.runs = status === "none" ? [] : [{ resourceId: task.id, status }];
  state.details[task.id] = { ...task, selfDriving: { enabled: true, revision: 7, condition: "ready" } };
  let html = selfDrivingTopBar(state.details[task.id]);
  assert(html.includes('role="switch"'), status + " lost the switch");
  assert(html.includes('aria-checked="true"'), status + " changed desired state");
  assert(!html.includes('id="selfDrivingSwitch"') || !html.match(/id="selfDrivingSwitch"[^>]* disabled/), status + " disabled the switch");
  assert(html.includes("Ready"), status + " changed the controller condition");
  assert(!html.includes("Session is busy") && !html.includes("scheduler recovery"), status + " leaked Session reconcile state");
}
state.details[task.id] = { ...task };
let html = selfDrivingTopBar(state.details[task.id]);
assert(html.includes('aria-checked="false"'), "task without metadata must show Off");
state.details[task.id] = { ...task, selfDriving: { enabled: false, revision: 8, condition: "disabled", notificationError: { message: "steer unsupported" } } };
html = selfDrivingTopBar(state.details[task.id]);
assert(html.includes("steer unsupported"), "notification failure must be visible");
`
	runFrontendNode(t, script)
}

func TestSelfDrivingSwitchOnlyDisablesDuringPersistence(t *testing.T) {
	if _, err := exec.LookPath("node"); err != nil {
		t.Skip("node is required")
	}
	script := selfDrivingBarTestExtractHelper + `
const state = { agent: { selfDrivingSaving: false, selfDrivingDisabling: false } };
eval(extract("selfDrivingBarActions"));
const detail = { type: "task", selfDriving: { enabled: true } };
let html = selfDrivingBarActions(detail);
assert(!html.includes(" disabled"), "normal switch is disabled");
state.agent.selfDrivingDisabling = true;
html = selfDrivingBarActions(detail);
assert(html.includes(" disabled") && html.includes('aria-busy="true"'), "pending persistence must disable switch");
`
	runFrontendNode(t, script)
}
