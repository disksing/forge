package serve

import (
	"os/exec"
	"strings"
	"testing"
)

// autoRunBarTestExtractHelper is shared by the AutoRun top bar frontend tests.
const autoRunBarTestExtractHelper = `
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

func TestAutoRunTopBarStateMatrix(t *testing.T) {
	node, err := exec.LookPath("node")
	if err != nil {
		t.Skip("node is required for the AutoRun top bar state matrix test")
	}
	script := autoRunBarTestExtractHelper + `
const task = { id: "project1.task1", type: "task", title: "Task One" };
const state = {
  selectedId: task.id,
  details: { [task.id]: task },
  externalLock: false,
  agent: { runs: [], autoRunStarting: false, autoRunCancelling: false, autoRunExpanded: false },
};
function findResource(id) { return id === task.id ? task : id === "project1" ? { id, type: "project" } : null; }
function selectedResourceHasExternalLock() { return state.externalLock; }
function isLiveAgentRun(run) {
  return ["starting", "running", "waiting_approval", "idle", "stopping", "recovering"].includes(run?.status);
}
function currentAgentRun() { return state.agent.runs.find((run) => run.id === state.agent.activeRunId) || null; }
eval(extract("autoRunStatusReason"));
eval(extract("autoRunTopBar"));
eval(extract("autoRunBarSummary"));
eval(extract("autoRunBarDetails"));
eval(extract("autoRunPresentation"));
eval(extract("autoRunActionIcon"));
eval(extract("autoRunBarActions"));

function render(stateName, runs = [], externalLock = false) {
  state.externalLock = externalLock;
  state.agent.runs = runs;
  state.agent.autoRunStarting = false;
  state.agent.autoRunCancelling = false;
  state.agent.autoRunExpanded = false;
  state.details[task.id] = {
    ...task,
    ...(stateName === null ? {} : { autoRun: { generation: 7, state: stateName } }),
  };
  return autoRunTopBar(state.details[task.id]);
}
function assertLabeled(html, message) {
  assert(html.includes("<span>"), message + " must keep a visible label, not icon-only");
  assert(html.includes('title="'), message + " needs a tooltip");
  assert(html.includes('aria-label="'), message + " needs an accessible name");
}
function count(html, needle) { return html.split(needle).length - 1; }

// Tasks without AutoRun data always get the compact not-started bar.
let html = render(null);
assert(html.includes("autorun-bar autorun-bar-none"), "no AutoRun must render the not-started bar");
assert(html.includes(">Not started</span>"), "no AutoRun must label the Not started chip");
assert(html.includes("No AutoRun generation yet."), "no AutoRun must explain itself in the summary");
assert(html.includes('data-autorun-action="start"'), "no AutoRun must offer Start AutoRun");
assert(html.includes("<span>Start AutoRun</span>"), "no AutoRun Start must be labeled");
assert(!html.includes("autorun-bar-details"), "no AutoRun must not render a details region");
assert(!html.includes("data-autorun-toggle"), "no AutoRun must not render the details toggle");
assert(!html.includes('id="autoRunCancelButton"'), "no AutoRun must not offer Cancel");
assertLabeled(html, "Start AutoRun");

// Projects never render the bar.
state.selectedId = "project1";
assert(autoRunTopBar({ id: "project1", type: "project" }) === "", "projects must not render the AutoRun bar");
state.selectedId = task.id;

for (const stateName of ["completed", "failed", "cancelled"]) {
  html = render(stateName);
  assert(html.includes("<span>Start New AutoRun</span>"), stateName + " must offer Start New AutoRun");
  assert(!html.includes('id="autoRunCancelButton"'), stateName + " must not offer Cancel");
  assert(html.includes("data-autorun-toggle"), stateName + " must offer the details toggle");
  assert(html.includes("autorun-bar-details"), stateName + " must render its details region");
  assert(html.includes('id="autoRunBarDetails" hidden'), stateName + " must collapse details by default");
  assert(html.includes('aria-expanded="false"'), stateName + " toggle must report the collapsed state");
  assert(html.includes("Generation 7"), stateName + " must keep the generation in the summary");
  assertLabeled(html, stateName + " Start New AutoRun");
}

for (const stateName of ["queued", "running"]) {
  html = render(stateName);
  assert(!html.includes('id="autoRunStartButton"'), stateName + " must not offer a duplicate start action");
  assert(html.includes('id="autoRunCancelButton"'), stateName + " must offer Cancel AutoRun");
  assert(html.includes('aria-label="Cancel AutoRun"'), stateName + " Cancel needs its accessible name");
  assert(html.includes('fill="#b91c1c"'), stateName + " Cancel must use the red workflow family badge");
  assertLabeled(html, stateName + " Cancel AutoRun");
}

html = render("suspended");
assert(html.indexOf('id="autoRunStartButton"') < html.indexOf('id="autoRunCancelButton"'), "suspended actions must offer Resume before Cancel");
assert(html.includes('title="Resume AutoRun now"'), "suspended must offer Resume AutoRun now");
assert(html.includes('aria-label="Cancel AutoRun"'), "suspended must keep Cancel alongside Resume");
assert(html.includes("autorun-bar-suspended"), "suspended must use its tone class");

html = render("paused");
assert(html.includes('title="Resume AutoRun"'), "paused must offer Resume AutoRun");
assert(html.includes('id="autoRunCancelButton"'), "paused must keep Cancel alongside Resume");

html = render("mystery");
assert(html.includes("autorun-bar-unknown"), "unknown states must use the unknown tone class");
assert(html.includes(">mystery</span>"), "unknown states must label the raw state");
assert(!html.includes('id="autoRunStartButton"') && !html.includes('id="autoRunCancelButton"'), "unknown states must not expose actions");
assert(html.includes("data-autorun-toggle"), "unknown states must still allow inspecting details");

html = render("suspended", [], true);
assert(!html.includes('id="autoRunStartButton"') && !html.includes('id="autoRunCancelButton"'), "external locks must hide every AutoRun action");
assert(html.includes("Locked by an external session"), "external locks must explain the missing actions");
assert(html.includes("autorun-bar-suspended"), "external locks must keep the state visible");

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

// Pending start/cancel feedback disables actions and exposes aria-busy.
render(null);
state.agent.autoRunStarting = true;
html = autoRunTopBar(state.details[task.id]);
assert(html.includes('id="autoRunStartButton"') && html.includes(" disabled") && html.includes('aria-busy="true"'), "starting must disable Start while pending");
assert(html.includes('data-icon="loader-circle"'), "starting must use the loading icon");
assert(html.includes("<span>Starting AutoRun…</span>"), "starting must label the pending state");

state.agent.autoRunStarting = false;
render("queued");
state.agent.autoRunCancelling = true;
html = autoRunTopBar(state.details[task.id]);
assert(html.includes('id="autoRunCancelButton"') && html.includes(" disabled") && html.includes('aria-busy="true"'), "cancellation must disable Cancel while pending");
render("paused");
state.agent.autoRunCancelling = true;
html = autoRunTopBar(state.details[task.id]);
assert(html.includes('id="autoRunStartButton"') && html.includes('disabled') && html.includes('aria-busy="true"'), "cancellation must disable Resume while pending");

// Expanded details expose the full context and report aria-expanded.
state.agent.autoRunCancelling = false;
state.agent.autoRunExpanded = true;
state.details[task.id] = { ...task, autoRun: { generation: 7, state: "running" }, logs: [] };
html = autoRunTopBar(state.details[task.id]);
assert(!html.includes('id="autoRunBarDetails" hidden'), "expanded bars must show the details region");
assert(html.includes('aria-expanded="true"'), "expanded bars must report the toggle state");
assert(html.includes('aria-controls="autoRunBarDetails"'), "the toggle must point at the details region");
assert(html.includes("Generation 7"), "expanded details must keep the generation");
assert(html.includes("Workspace default"), "expanded details must note the default Agent preference");

// The bar renders exactly one control entry per state.
html = render("suspended");
assert(count(html, 'id="autoRunStartButton"') === 1 && count(html, 'id="autoRunCancelButton"') === 1, "suspended must render exactly one Resume and one Cancel");
assert(count(html, '<section class="autorun-bar ') === 1, "a single bar section must wrap the controls");
`
	appPath := frontendAssetPath("app.js")
	if output, err := exec.Command(node, "-e", script, appPath).CombinedOutput(); err != nil {
		t.Fatalf("AutoRun top bar state matrix test failed: %v\n%s", err, output)
	}
}

func TestAutoRunTopBarSummaryAndDetailsContent(t *testing.T) {
	node, err := exec.LookPath("node")
	if err != nil {
		t.Skip("node is required for the AutoRun top bar content test")
	}
	script := autoRunBarTestExtractHelper + `
const task = { id: "project1.task1", type: "task", title: "Task One" };
const state = {
  selectedId: task.id,
  details: {},
  agent: { runs: [], autoRunStarting: false, autoRunCancelling: false, autoRunExpanded: false, activeRunId: "" },
};
function findResource(id) { return id === task.id ? task : null; }
function selectedResourceHasExternalLock() { return false; }
function isLiveAgentRun(run) { return ["starting", "running", "waiting_approval", "idle", "stopping", "recovering"].includes(run?.status); }
function currentAgentRun() { return state.agent.runs.find((run) => run.id === state.agent.activeRunId) || null; }
eval(extract("autoRunStatusReason"));
eval(extract("autoRunTopBar"));
eval(extract("autoRunBarSummary"));
eval(extract("autoRunBarDetails"));
eval(extract("autoRunPresentation"));
eval(extract("autoRunActionIcon"));
eval(extract("autoRunBarActions"));

const logs = [
  { autoRun: true, autoRunGeneration: 7, title: "Auto Run failed", details: "failed now" },
  { autoRun: true, autoRunGeneration: 7, title: "Auto Run paused", details: "paused now" },
  { autoRun: true, autoRunGeneration: 7, title: "Auto Run retry", details: "retry now" },
  { autoRun: true, autoRunGeneration: 7, title: "Auto Run suspended", details: "wait for review" },
  { autoRun: true, autoRunGeneration: 6, title: "Auto Run failed", details: "old generation failure" },
];
function render(stateName, generation = 7, extra = {}) {
  state.details[task.id] = {
    ...task,
    autoRun: { generation, state: stateName, suspensionSummary: "wait for review", ...extra },
    logs,
  };
  return autoRunTopBar(state.details[task.id]);
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
		t.Fatalf("AutoRun top bar content test failed: %v\n%s", err, output)
	}
}

func TestAutoRunTopBarIsTheSingleControlEntry(t *testing.T) {
	appData, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	app := string(appData)

	// The bar markup lives in exactly one renderer mounted in its own container.
	for _, want := range []string{
		`function autoRunTopBar(detail) {`,
		`function autoRunBarActions(detail) {`,
		`barWrap.innerHTML = autoRunTopBar(detail);`,
		`$("autoRunBarWrap")`,
		`id="autoRunStartButton"`,
		`id="autoRunCancelButton"`,
		`data-autorun-action="`,
		`const autoRunButton = $("autoRunStartButton");`,
		`const autoRunCancelButton = $("autoRunCancelButton");`,
		`document.querySelectorAll("[data-autorun-toggle]").forEach((toggle) => {`,
		`openAutoRunConfigDialog();`,
		`startChatAutoRun().catch((err) => toast(err.message));`,
		`cancelSelectedAutoRun().catch((err) => toast(err.message));`,
	} {
		if !strings.Contains(app, want) {
			t.Fatalf("AutoRun top bar wiring is missing %q", want)
		}
	}

	// Removed composer/standalone entry points must not come back.
	for _, removed := range []string{
		`autoRunComposerAction`,
		`autoRunComposerKey`,
		`agentComposerToolbarActions`,
		`includeAutoRun`,
		`tty-autorun-action`,
		`tty-autorun-labeled-action`,
		`autorun-collapsible`,
		`autorun-status-heading`,
		`function autoRunStatus(`,
	} {
		if strings.Contains(app, removed) {
			t.Fatalf("removed AutoRun composer entry point is still present: %q", removed)
		}
	}

	// Neither the live composer nor the standalone action row may render
	// AutoRun controls anymore.
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
		for _, forbidden := range []string{`autoRunStartButton`, `autoRunCancelButton`, `autoRunBarActions`, `data-autorun-action`} {
			if strings.Contains(body, forbidden) {
				t.Fatalf("%s still renders the AutoRun control %q", fn, forbidden)
			}
		}
	}

	// Pending start/cancel transitions must re-render the bar, not only the
	// composer, so its disabled/aria-busy state stays accurate.
	startFn := strings.Index(app, `async function startChatAutoRun(options = {}) {`)
	endFn := strings.Index(app[startFn:], `function autoRunDialogInitialState()`)
	if startFn < 0 || endFn < 0 {
		t.Fatal("startChatAutoRun boundary is missing")
	}
	startBody := app[startFn : startFn+endFn]
	if strings.Count(startBody, "renderAgent();") < 2 {
		t.Fatal("startChatAutoRun must re-render the AutoRun bar when the pending state toggles")
	}

	// The container is mounted above the session switcher in the chat panel.
	indexData, err := staticFiles.ReadFile("static/index.html")
	if err != nil {
		t.Fatal(err)
	}
	index := string(indexData)
	bar := strings.Index(index, `id="autoRunBarWrap"`)
	sessions := strings.Index(index, `id="agentSessionsWrap"`)
	composer := strings.Index(index, `id="ttyComposer"`)
	if bar < 0 || sessions < 0 || composer < 0 || bar > sessions || sessions > composer {
		t.Fatal("the AutoRun bar container must sit above the session switcher and the composer")
	}
}

func TestAutoRunTopBarIsResponsiveAndAccessible(t *testing.T) {
	stylesData, err := staticFiles.ReadFile("static/styles.css")
	if err != nil {
		t.Fatal(err)
	}
	styles := string(stylesData)
	for _, want := range []string{
		`.autorun-bar-wrap`,
		`.autorun-bar-wrap:empty`,
		`.autorun-bar {`,
		`.autorun-bar-none`,
		`.autorun-bar-queued`,
		`.autorun-bar-running`,
		`.autorun-bar-suspended`,
		`.autorun-bar-paused`,
		`.autorun-bar-completed`,
		`.autorun-bar-failed`,
		`.autorun-bar-cancelled`,
		`.autorun-bar-row`,
		`.autorun-bar-summary`,
		`text-overflow: ellipsis;`,
		`white-space: nowrap;`,
		`.autorun-bar-button`,
		`.autorun-bar-start-action`,
		`.autorun-bar-resume-action`,
		`.autorun-bar-cancel-action`,
		`.autorun-bar-button:disabled`,
		`.autorun-bar-button:focus-visible`,
		`.autorun-bar-toggle`,
		`.autorun-bar-details`,
		`.autorun-bar-lock`,
		`animation: autorun-running-border 3.6s linear infinite, autorun-running-pulse 2.6s ease-in-out infinite;`,
		`@media (prefers-reduced-motion: reduce)`,
		`.autorun-bar-running .autorun-state-icon`,
		`animation: none;`,
		`@media (forced-colors: active)`,
		`@media (max-width: 420px)`,
		`flex-wrap: wrap;`,
		`overflow-wrap: anywhere;`,
		`--autorun-surface: color-mix(in srgb, var(--autorun-tone) 7%, var(--panel));`,
		`background: color-mix(in srgb, var(--autorun-tone) 12%, var(--bg));`,
	} {
		if !strings.Contains(styles, want) {
			t.Fatalf("responsive AutoRun bar styles are missing %q", want)
		}
	}
	for _, removed := range []string{
		`.autorun-status`,
		`.tty-autorun-action`,
		`.tty-autorun-labeled-action`,
		`.autorun-collapsible`,
	} {
		if strings.Contains(styles, removed) {
			t.Fatalf("removed AutoRun card styles are still present: %q", removed)
		}
	}

	appData, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	app := string(appData)
	// The config dialog keeps its start/resume mode mapping.
	for _, want := range []string{
		`const mode = ["completed", "failed", "cancelled"].includes(autoRun?.state)`,
		`resumable && !reuseRun ? "resume" : "configure";`,
	} {
		if !strings.Contains(app, want) {
			t.Fatalf("AutoRun dialog mode mapping is missing %q", want)
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
		`class="autorun-state autorun-state-${presentation.key}"`,
		`<i data-lucide="${presentation.icon}" class="autorun-state-icon" aria-hidden="true"></i>`,
		`role="status" aria-label="AutoRun: ${escapeHTML(presentation.label)}"`,
		`title="${escapeHTML(summary)}"`,
	} {
		if !strings.Contains(app, want) {
			t.Fatalf("accessible AutoRun bar markup is missing %q", want)
		}
	}
}
