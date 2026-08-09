package serve

import (
	"os/exec"
	"strings"
	"testing"
)

// selfDrivingBarTestExtractHelper is shared by the Self-Driving top bar frontend tests.
const selfDrivingBarTestExtractHelper = `
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
`

func TestSelfDrivingTopBarStateMatrix(t *testing.T) {
	node, err := exec.LookPath("node")
	if err != nil {
		t.Skip("node is required for the Self-Driving top bar state matrix test")
	}
	script := selfDrivingBarTestExtractHelper + `
const task = { id: "project1.task1", type: "task", title: "Task One" };
const state = {
  selectedId: task.id,
  details: { [task.id]: task },
  externalLock: false,
  agent: { runs: [], selfDrivingStarting: false, selfDrivingCancelling: false, selfDrivingExpanded: false },
};
function findResource(id) { return id === task.id ? task : id === "project1" ? { id, type: "project" } : null; }
function selectedResourceHasExternalLock() { return state.externalLock; }
function isLiveAgentRun(run) {
  return ["starting", "running", "waiting_approval", "idle", "stopping", "recovering"].includes(run?.status);
}
function currentAgentRun() { return state.agent.runs.find((run) => run.id === state.agent.activeRunId) || null; }
eval(extract("selfDrivingStatusReason"));
eval(extract("selfDrivingTopBar"));
eval(extract("selfDrivingBarSummary"));
eval(extract("selfDrivingBarDetails"));
eval(extract("selfDrivingPresentation"));
eval(extract("selfDrivingActionIcon"));
eval(extract("selfDrivingBarActions"));

function render(stateName, runs = [], externalLock = false) {
  state.externalLock = externalLock;
  state.agent.runs = runs;
  state.agent.selfDrivingStarting = false;
  state.agent.selfDrivingCancelling = false;
  state.agent.selfDrivingExpanded = false;
  state.details[task.id] = {
    ...task,
    ...(stateName === null ? {} : { selfDriving: { generation: 7, state: stateName } }),
  };
  return selfDrivingTopBar(state.details[task.id]);
}
function assertLabeled(html, message) {
  assert(html.includes("<span>"), message + " must keep a visible label, not icon-only");
  assert(html.includes('title="'), message + " needs a tooltip");
  assert(html.includes('aria-label="'), message + " needs an accessible name");
}
function count(html, needle) { return html.split(needle).length - 1; }

// Tasks without Self-Driving data always get the compact not-started bar.
let html = render(null);
assert(html.includes("self-driving-bar self-driving-bar-none"), "no Self-Driving must render the not-started bar");
assert(html.includes(">Not started</span>"), "no Self-Driving must label the Not started chip");
assert(html.includes("No Self-Driving generation yet."), "no Self-Driving must explain itself in the summary");
assert(html.includes('data-self-driving-action="start"'), "no Self-Driving must offer Start Self-Driving");
assert(html.includes("<span>Start Self-Driving</span>"), "no Self-Driving Start must be labeled");
assert(!html.includes("self-driving-bar-details"), "no Self-Driving must not render a details region");
assert(!html.includes("data-self-driving-toggle"), "no Self-Driving must not render the details toggle");
assert(!html.includes('id="selfDrivingCancelButton"'), "no Self-Driving must not offer Cancel");
assertLabeled(html, "Start Self-Driving");

// Projects never render the bar.
state.selectedId = "project1";
assert(selfDrivingTopBar({ id: "project1", type: "project" }) === "", "projects must not render the Self-Driving bar");
state.selectedId = task.id;

for (const stateName of ["completed", "failed", "cancelled"]) {
  html = render(stateName);
  assert(html.includes("<span>Start New Self-Driving</span>"), stateName + " must offer Start New Self-Driving");
  assert(!html.includes('id="selfDrivingCancelButton"'), stateName + " must not offer Cancel");
  assert(html.includes("data-self-driving-toggle"), stateName + " must offer the details toggle");
  assert(html.includes("self-driving-bar-details"), stateName + " must render its details region");
  assert(html.includes('id="selfDrivingBarDetails" hidden'), stateName + " must collapse details by default");
  assert(html.includes('aria-expanded="false"'), stateName + " toggle must report the collapsed state");
  assert(html.includes("Generation 7"), stateName + " must keep the generation in the summary");
  assertLabeled(html, stateName + " Start New Self-Driving");
}

for (const stateName of ["queued", "running"]) {
  html = render(stateName);
  assert(!html.includes('id="selfDrivingStartButton"'), stateName + " must not offer a duplicate start action");
  assert(html.includes('id="selfDrivingCancelButton"'), stateName + " must offer Cancel Self-Driving");
  assert(html.includes('aria-label="Cancel Self-Driving"'), stateName + " Cancel needs its accessible name");
  assert(html.includes('fill="#b91c1c"'), stateName + " Cancel must use the red workflow family badge");
  assertLabeled(html, stateName + " Cancel Self-Driving");
}

html = render("suspended");
assert(html.indexOf('id="selfDrivingStartButton"') < html.indexOf('id="selfDrivingCancelButton"'), "suspended actions must offer Resume before Cancel");
assert(html.includes('title="Resume Self-Driving now"'), "suspended must offer Resume Self-Driving now");
assert(html.includes('aria-label="Cancel Self-Driving"'), "suspended must keep Cancel alongside Resume");
assert(html.includes("self-driving-bar-suspended"), "suspended must use its tone class");

html = render("paused");
assert(html.includes('title="Resume Self-Driving"'), "paused must offer Resume Self-Driving");
assert(html.includes('id="selfDrivingCancelButton"'), "paused must keep Cancel alongside Resume");

html = render("mystery");
assert(html.includes("self-driving-bar-unknown"), "unknown states must use the unknown tone class");
assert(html.includes(">mystery</span>"), "unknown states must label the raw state");
assert(!html.includes('id="selfDrivingStartButton"') && !html.includes('id="selfDrivingCancelButton"'), "unknown states must not expose actions");
assert(html.includes("data-self-driving-toggle"), "unknown states must still allow inspecting details");

html = render("suspended", [], true);
assert(!html.includes('id="selfDrivingStartButton"') && !html.includes('id="selfDrivingCancelButton"'), "external locks must hide every Self-Driving action");
assert(html.includes("Locked by an external session"), "external locks must explain the missing actions");
assert(html.includes("self-driving-bar-suspended"), "external locks must keep the state visible");

html = render(null, [{ resourceId: task.id, status: "idle", schedulerTurn: false, agentHubSessionId: "session-1" }]);
assert(!html.includes(" disabled"), "an idle live Session must keep Start enabled");
assert(html.includes("reuse the current idle session"), "an idle live Session must explain reuse");

for (const status of ["starting", "running", "waiting_approval", "stopping", "recovering"]) {
  html = render(null, [{ resourceId: task.id, status, schedulerTurn: false }]);
  assert(html.includes('id="selfDrivingStartButton"') && html.includes(" disabled"), status + " must disable Start");
  assert(html.includes((status === "waiting_approval"
    ? "Resolve the pending approval before starting Self-Driving in this session."
    : "The current session is busy; wait until it is idle to start Self-Driving.")), status + " must explain its disabled reason");
}
html = render(null, [{ resourceId: "project1.task2", status: "running", schedulerTurn: false }]);
assert(!html.includes(" disabled"), "a busy Session for another task must not disable this task");

// Pending start/cancel feedback disables actions and exposes aria-busy.
render(null);
state.agent.selfDrivingStarting = true;
html = selfDrivingTopBar(state.details[task.id]);
assert(html.includes('id="selfDrivingStartButton"') && html.includes(" disabled") && html.includes('aria-busy="true"'), "starting must disable Start while pending");
assert(html.includes('data-icon="loader-circle"'), "starting must use the loading icon");
assert(html.includes("<span>Starting Self-Driving…</span>"), "starting must label the pending state");

state.agent.selfDrivingStarting = false;
render("queued");
state.agent.selfDrivingCancelling = true;
html = selfDrivingTopBar(state.details[task.id]);
assert(html.includes('id="selfDrivingCancelButton"') && html.includes(" disabled") && html.includes('aria-busy="true"'), "cancellation must disable Cancel while pending");
render("paused");
state.agent.selfDrivingCancelling = true;
html = selfDrivingTopBar(state.details[task.id]);
assert(html.includes('id="selfDrivingStartButton"') && html.includes('disabled') && html.includes('aria-busy="true"'), "cancellation must disable Resume while pending");

// Expanded details expose the full context and report aria-expanded.
state.agent.selfDrivingCancelling = false;
state.agent.selfDrivingExpanded = true;
state.details[task.id] = { ...task, selfDriving: { generation: 7, state: "running" }, logs: [] };
html = selfDrivingTopBar(state.details[task.id]);
assert(!html.includes('id="selfDrivingBarDetails" hidden'), "expanded bars must show the details region");
assert(html.includes('aria-expanded="true"'), "expanded bars must report the toggle state");
assert(html.includes('aria-controls="selfDrivingBarDetails"'), "the toggle must point at the details region");
assert(html.includes("Generation 7"), "expanded details must keep the generation");
assert(html.includes("Workspace default"), "expanded details must note the default Agent preference");

// The bar renders exactly one control entry per state.
html = render("suspended");
assert(count(html, 'id="selfDrivingStartButton"') === 1 && count(html, 'id="selfDrivingCancelButton"') === 1, "suspended must render exactly one Resume and one Cancel");
assert(count(html, '<section class="self-driving-bar ') === 1, "a single bar section must wrap the controls");
`
	appPath := frontendAssetPath("app.js")
	if output, err := exec.Command(node, "-e", script, appPath).CombinedOutput(); err != nil {
		t.Fatalf("Self-Driving top bar state matrix test failed: %v\n%s", err, output)
	}
}

func TestSelfDrivingTopBarSummaryAndDetailsContent(t *testing.T) {
	node, err := exec.LookPath("node")
	if err != nil {
		t.Skip("node is required for the Self-Driving top bar content test")
	}
	script := selfDrivingBarTestExtractHelper + `
const task = { id: "project1.task1", type: "task", title: "Task One" };
const state = {
  selectedId: task.id,
  details: {},
  agent: { runs: [], selfDrivingStarting: false, selfDrivingCancelling: false, selfDrivingExpanded: false, activeRunId: "" },
};
function findResource(id) { return id === task.id ? task : null; }
function selectedResourceHasExternalLock() { return false; }
function isLiveAgentRun(run) { return ["starting", "running", "waiting_approval", "idle", "stopping", "recovering"].includes(run?.status); }
function currentAgentRun() { return state.agent.runs.find((run) => run.id === state.agent.activeRunId) || null; }
eval(extract("selfDrivingStatusReason"));
eval(extract("selfDrivingTopBar"));
eval(extract("selfDrivingBarSummary"));
eval(extract("selfDrivingBarDetails"));
eval(extract("selfDrivingPresentation"));
eval(extract("selfDrivingActionIcon"));
eval(extract("selfDrivingBarActions"));

const logs = [
  { selfDriving: true, selfDrivingGeneration: 7, title: "Self-Driving failed", details: "failed now" },
  { selfDriving: true, selfDrivingGeneration: 7, title: "Self-Driving paused", details: "paused now" },
  { selfDriving: true, selfDrivingGeneration: 7, title: "Self-Driving retry", details: "retry now" },
  { selfDriving: true, selfDrivingGeneration: 7, title: "Self-Driving suspended", details: "wait for review" },
  { selfDriving: true, selfDrivingGeneration: 6, title: "Self-Driving failed", details: "old generation failure" },
];
function render(stateName, generation = 7, extra = {}) {
  state.details[task.id] = {
    ...task,
    selfDriving: { generation, state: stateName, suspensionSummary: "wait for review", ...extra },
    logs,
  };
  return selfDrivingTopBar(state.details[task.id]);
}
const suspended = render("suspended");
assert(suspended.includes("Suspend reason: wait for review"), "suspended state should show its current summary");
assert(!suspended.includes("paused now") && !suspended.includes("old generation failure"), "suspended state leaked an unrelated event");

const suspendedWake = render("suspended", 7, { suspensionSummary: "", wakeCondition: "CI green on main" });
assert(suspendedWake.includes("Wake condition: CI green on main"), "suspended without a summary must surface the wake condition");

const queued = render("queued");
assert(!queued.includes("wait for review") && !queued.includes("paused now") && !queued.includes("retry now"), "queued state leaked historical reasons");
assert(queued.includes("Generation 7"), "queued falls back to the generation summary");

const running = render("running");
assert(running.includes("Retry reason: retry now"), "running state should show the current-generation retry reason");
assert(!running.includes("wait for review") && !running.includes("paused now"), "running state leaked a non-matching reason");

const paused = render("paused");
assert(paused.includes("Pause reason: paused now"), "paused state should show the current pause event");
assert(!paused.includes("wait for review") && !paused.includes("retry now"), "paused state leaked a suspension or retry reason");

const failed = render("failed");
assert(failed.includes("Failure reason: failed now"), "failed state should show the current failure event");
assert(!failed.includes("wait for review") && !failed.includes("paused now") && !failed.includes("retry now"), "failed state leaked a historical reason");

const completed = render("completed");
assert(!completed.includes("wait for review") && !completed.includes("failed now") && !completed.includes("paused now"), "completed state leaked a historical reason");

const newGeneration = render("queued", 8);
assert(!newGeneration.includes("wait for review"), "new generation displayed a prior status reason");

// The summary exposes the full text via the title attribute for truncation.
assert(failed.includes('title="Failure reason: failed now"'), "collapsed summary must keep the full reason in its tooltip");

// The running scheduler Agent shows up in the summary and expanded details.
state.agent.runs = [{ id: "run-1", resourceId: task.id, schedulerTurn: true, status: "running", agentProfile: "kimi", agentHubAgentName: "Kimi Code" }];
state.agent.activeRunId = "run-1";
const withAgent = render("running", 7, { statusReason: "" });
assert(withAgent.includes("Actual Agent: kimi → Kimi Code"), "expanded details must name the actual Agent");
const scheduled = render("completed");
assert(scheduled.includes("Agent: kimi → Kimi Code"), "collapsed summary must name the actual Agent");
state.agent.runs = [];
state.agent.activeRunId = "";
`
	appPath := frontendAssetPath("app.js")
	if output, err := exec.Command(node, "-e", script, appPath).CombinedOutput(); err != nil {
		t.Fatalf("Self-Driving top bar content test failed: %v\n%s", err, output)
	}
}

func TestSelfDrivingTopBarIsTheSingleControlEntry(t *testing.T) {
	appData, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	app := string(appData)

	// The bar markup lives in exactly one renderer mounted in its own container.
	for _, want := range []string{
		`function selfDrivingTopBar(detail) {`,
		`function selfDrivingBarActions(detail) {`,
		`barWrap.innerHTML = selfDrivingTopBar(detail);`,
		`$("selfDrivingBarWrap")`,
		`id="selfDrivingStartButton"`,
		`id="selfDrivingCancelButton"`,
		`data-self-driving-action="`,
		`const selfDrivingButton = $("selfDrivingStartButton");`,
		`const selfDrivingCancelButton = $("selfDrivingCancelButton");`,
		`document.querySelectorAll("[data-self-driving-toggle]").forEach((toggle) => {`,
		`openSelfDrivingConfigDialog();`,
		`startChatSelfDriving().catch((err) => toast(err.message));`,
		`cancelSelectedSelfDriving().catch((err) => toast(err.message));`,
	} {
		if !strings.Contains(app, want) {
			t.Fatalf("Self-Driving top bar wiring is missing %q", want)
		}
	}

	// Removed composer/standalone entry points must not come back.
	for _, removed := range []string{
		`selfDrivingComposerAction`,
		`selfDrivingComposerKey`,
		`agentComposerToolbarActions`,
		`includeSelfDriving`,
		`tty-self-driving-action`,
		`tty-self-driving-labeled-action`,
		`self-driving-collapsible`,
		`self-driving-status-heading`,
		`function selfDrivingStatus(`,
	} {
		if strings.Contains(app, removed) {
			t.Fatalf("removed Self-Driving composer entry point is still present: %q", removed)
		}
	}

	// Neither the live composer nor the standalone action row may render
	// Self-Driving controls anymore.
	for _, fn := range []string{"renderTTYComposer", "agentComposerActions"} {
		start := strings.Index(app, "function "+fn+"(")
		if start < 0 {
			t.Fatalf("missing %s", fn)
		}
		open := strings.Index(app[start:], ") {") + start + 2
		depth := 0
		end := -1
		for index := open; index < len(app); index++ {
			if app[index] == '{' {
				depth++
			}
			if app[index] == '}' {
				depth--
				if depth == 0 {
					end = index
					break
				}
			}
		}
		if end < 0 {
			t.Fatalf("unterminated %s", fn)
		}
		body := app[start:end]
		for _, forbidden := range []string{`selfDrivingStartButton`, `selfDrivingCancelButton`, `selfDrivingBarActions`, `data-self-driving-action`} {
			if strings.Contains(body, forbidden) {
				t.Fatalf("%s still renders the Self-Driving control %q", fn, forbidden)
			}
		}
	}

	// Pending start/cancel transitions must re-render the bar, not only the
	// composer, so its disabled/aria-busy state stays accurate.
	startFn := strings.Index(app, `async function startChatSelfDriving(options = {}) {`)
	endFn := strings.Index(app[startFn:], `function selfDrivingDialogInitialState()`)
	if startFn < 0 || endFn < 0 {
		t.Fatal("startChatSelfDriving boundary is missing")
	}
	startBody := app[startFn : startFn+endFn]
	if strings.Count(startBody, "renderAgent();") < 2 {
		t.Fatal("startChatSelfDriving must re-render the Self-Driving bar when the pending state toggles")
	}

	// The container is mounted above the session switcher in the chat panel.
	indexData, err := staticFiles.ReadFile("static/index.html")
	if err != nil {
		t.Fatal(err)
	}
	index := string(indexData)
	bar := strings.Index(index, `id="selfDrivingBarWrap"`)
	sessions := strings.Index(index, `id="agentSessionsWrap"`)
	composer := strings.Index(index, `id="ttyComposer"`)
	if bar < 0 || sessions < 0 || composer < 0 || bar > sessions || sessions > composer {
		t.Fatal("the Self-Driving bar container must sit above the session switcher and the composer")
	}
}

func TestSelfDrivingTopBarIsResponsiveAndAccessible(t *testing.T) {
	stylesData, err := staticFiles.ReadFile("static/styles.css")
	if err != nil {
		t.Fatal(err)
	}
	styles := string(stylesData)
	for _, want := range []string{
		`.self-driving-bar-wrap`,
		`.self-driving-bar-wrap:empty`,
		`.self-driving-bar {`,
		`.self-driving-bar-none`,
		`.self-driving-bar-queued`,
		`.self-driving-bar-running`,
		`.self-driving-bar-suspended`,
		`.self-driving-bar-paused`,
		`.self-driving-bar-completed`,
		`.self-driving-bar-failed`,
		`.self-driving-bar-cancelled`,
		`.self-driving-bar-row`,
		`.self-driving-bar-summary`,
		`text-overflow: ellipsis;`,
		`white-space: nowrap;`,
		`.self-driving-bar-button`,
		`.self-driving-bar-start-action`,
		`.self-driving-bar-resume-action`,
		`.self-driving-bar-cancel-action`,
		`.self-driving-bar-button:disabled`,
		`.self-driving-bar-button:focus-visible`,
		`.self-driving-bar-toggle`,
		`.self-driving-bar-details`,
		`.self-driving-bar-lock`,
		`animation: self-driving-running-border 3.6s linear infinite, self-driving-running-pulse 2.6s ease-in-out infinite;`,
		`@media (prefers-reduced-motion: reduce)`,
		`.self-driving-bar-running .self-driving-state-icon`,
		`animation: none;`,
		`@media (forced-colors: active)`,
		`@media (max-width: 420px)`,
		`flex-wrap: wrap;`,
		`overflow-wrap: anywhere;`,
		`--self-driving-surface: color-mix(in srgb, var(--self-driving-tone) 7%, var(--panel));`,
		`background: color-mix(in srgb, var(--self-driving-tone) 12%, var(--bg));`,
	} {
		if !strings.Contains(styles, want) {
			t.Fatalf("responsive Self-Driving bar styles are missing %q", want)
		}
	}
	for _, removed := range []string{
		`.self-driving-status`,
		`.tty-self-driving-action`,
		`.tty-self-driving-labeled-action`,
		`.self-driving-collapsible`,
	} {
		if strings.Contains(styles, removed) {
			t.Fatalf("removed Self-Driving card styles are still present: %q", removed)
		}
	}

	appData, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	app := string(appData)
	// The config dialog keeps its start/resume mode mapping.
	for _, want := range []string{
		`const mode = ["completed", "failed", "cancelled"].includes(selfDriving?.state)`,
		`resumable && !reuseRun ? "resume" : "configure";`,
	} {
		if !strings.Contains(app, want) {
			t.Fatalf("Self-Driving dialog mode mapping is missing %q", want)
		}
	}
	// State is never color-only: the chip always carries an icon and text.
	for _, want := range []string{
		`none: { label: "Not started", icon: "circle-dashed" }`,
		`queued: { label: "Queued", icon: "list-start" }`,
		`running: { label: "Running", icon: "activity" }`,
		`suspended: { label: "Suspended", icon: "pause" }`,
		`paused: { label: "Paused", icon: "pause" }`,
		`completed: { label: "Completed", icon: "circle-check" }`,
		`failed: { label: "Failed", icon: "circle-x" }`,
		`cancelled: { label: "Cancelled", icon: "ban" }`,
		`class="self-driving-state self-driving-state-${presentation.key}"`,
		`<i data-lucide="${presentation.icon}" class="self-driving-state-icon" aria-hidden="true"></i>`,
		`role="status" aria-label="Self-Driving: ${escapeHTML(presentation.label)}"`,
		`title="${escapeHTML(summary)}"`,
	} {
		if !strings.Contains(app, want) {
			t.Fatalf("accessible Self-Driving bar markup is missing %q", want)
		}
	}
}
