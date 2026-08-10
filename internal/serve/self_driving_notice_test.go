package serve

import (
	"encoding/json"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
)

func TestBeginSchedulerTurnAssignsStableBoundaries(t *testing.T) {
	run := agentRun{ResourceID: "project1.task1", SelfDrivingRevision: 4}
	beginSchedulerTurn(&run)
	if !run.SchedulerTurn || run.SchedulerTurnSequence != 1 || run.SchedulerTurnID == "" {
		t.Fatalf("first SchedulerTurn boundary is incomplete: %+v", run)
	}
	firstID := run.SchedulerTurnID
	beginSchedulerTurn(&run)
	if run.SchedulerTurnSequence != 1 || run.SchedulerTurnID != firstID {
		t.Fatalf("repeated begin changed the active SchedulerTurn: %+v", run)
	}
	run.SchedulerTurn = false
	beginSchedulerTurn(&run)
	if run.SchedulerTurnSequence != 2 || run.SchedulerTurnID == firstID || run.SchedulerTurnID == "" {
		t.Fatalf("new SchedulerTurn boundary did not advance: %+v", run)
	}
}

func TestSelfDrivingFinishNoticeCarriesScopedLifecycle(t *testing.T) {
	runID := "run-notice"
	manager := &agentManager{subscribers: make(map[string]map[chan agentStreamMessage]bool)}
	channel := make(chan agentStreamMessage, 2)
	manager.subscribe(runID, channel)
	defer manager.unsubscribe(runID, channel)
	rt := &agentRuntime{run: agentRun{
		ID: runID, ResourceID: "project1.task1", SelfDrivingRevision: 7,
		SchedulerTurnID: "turn-2", SchedulerTurnSequence: 2,
	}}
	rt.addSelfDrivingFinishNotice(manager, "info", selfDrivingFinishNoticeWaitingLifecycle, "waiting")
	message := <-channel
	if message.Notice == nil {
		t.Fatal("finish notice was not published")
	}
	data := message.Notice.Data
	if data.Kind != selfDrivingFinishNoticeKind || data.Lifecycle != selfDrivingFinishNoticeWaitingLifecycle ||
		data.RunID != runID || data.ResourceID != "project1.task1" || data.SelfDrivingRevision != 7 ||
		data.SchedulerTurnID != "turn-2" || data.SchedulerTurnSequence != 2 {
		t.Fatalf("finish notice is missing lifecycle scope: %+v", data)
	}
}

func TestSelfDrivingFinishNoticeFrontendLifecycle(t *testing.T) {
	node, err := exec.LookPath("node")
	if err != nil {
		t.Skip("node is required for the Self-Driving notice lifecycle test")
	}
	data, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	source := string(data)
	start := strings.Index(source, "function isSelfDrivingWaitingFinishNotice(")
	end := strings.Index(source, "async function loadAgentRuns()")
	appendStart := strings.Index(source, "function appendForgeNotice(")
	appendEnd := strings.Index(source, "function isKnownCanonicalAgentEvent(")
	streamStart := strings.Index(source, "function connectAgentStream()")
	streamEnd := strings.Index(source, "function closeAgentStream()")
	loadEnd := -1
	if end >= 0 {
		if relative := strings.Index(source[end:], "async function refreshAgentRunMetadata"); relative >= 0 {
			loadEnd = end + relative
		}
	}
	if start < 0 || end < 0 || appendStart < 0 || appendEnd < 0 || streamStart < 0 || streamEnd < 0 || loadEnd < 0 {
		t.Fatal("could not isolate Self-Driving notice lifecycle functions")
	}
	constants := source[strings.Index(source, "const SELF_DRIVING_FINISH_NOTICE_KIND ="):strings.Index(source, "const AGENT_DRAFT_STORAGE_PREFIX =")]
	noticeSource := source[start:end]
	appendSource := source[appendStart:appendEnd]
	streamSource := source[streamStart:streamEnd]
	loadSource := source[end:loadEnd]
	embeddedSource, err := json.Marshal(constants + noticeSource + appendSource + streamSource + loadSource)
	if err != nil {
		t.Fatal(err)
	}
	script := `
const vm = require("node:vm");
const fs = require("node:fs");
const source = fs.readFileSync(process.argv[1], "utf8");
function assert(condition, message) { if (!condition) throw new Error(message); }
const state = {
  activeWorkspaceId: "workspace-one",
  activeRunId: "run-a",
  tree: { projects: [{ id: "project1", children: [{ id: "task1", selfDriving: { enabled: true, revision: 7, condition: "waiting" } }] }] },
  details: {},
  agentRunProjectionVersion: 0,
  agent: {
    activeRunId: "run-a",
    runs: [{ id: "run-a", resourceId: "task1", selfDrivingRevision: 7, schedulerTurn: false, schedulerTurnId: "turn-1", schedulerTurnSequence: 1 }],
    notices: [],
    selfDrivingFinishNoticeWatermarks: new Map(),
    stream: null,
    streamRunId: "",
  },
};
let renders = 0;
function findResource(id) {
  return state.tree.projects.flatMap((project) => project.children || []).find((task) => task.id === id) || null;
}
function scheduleAgentRender() { renders++; }
function renderAll() { renders++; }
function refreshAgentRunMetadata() { return Promise.resolve(true); }
function latestAgentEventID() { return 0; }
function closeAgentStream() { state.agent.stream = null; state.agent.streamRunId = ""; }
function resetAgentState() {}
function observeCompletionProjections() {}
function reconcileActiveAgentRun() { return false; }
function loadCanonicalAgentEvents() { return Promise.resolve(true); }
function connectAgentStream() {}
const runResponses = [];
function fetchAgentRuns() { return runResponses.shift(); }
class FakeEventSource {
  constructor() { this.listeners = {}; this.onmessage = null; this.onerror = null; FakeEventSource.instances.push(this); }
  addEventListener(type, listener) { this.listeners[type] = listener; }
  close() { this.closed = true; }
  emitNotice(notice) { this.listeners["forge.notice"]?.({ data: JSON.stringify(notice) }); }
}
FakeEventSource.instances = [];
const context = { state, console, Map, Set, EventSource: FakeEventSource, URLSearchParams: class {}, setTimeout, clearTimeout, findResource, scheduleAgentRender, renderAll, refreshAgentRunMetadata, latestAgentEventID, closeAgentStream, resetAgentState, observeCompletionProjections, reconcileActiveAgentRun, loadCanonicalAgentEvents, connectAgentStream, fetchAgentRuns };
vm.createContext(context);
vm.runInContext(` + string(embeddedSource) + `, context);
const waiting = (sequence, turnId = "turn-" + sequence) => ({
  source: "forge", type: "forge.notice", data: {
    level: "info", method: "forge/self-driving/finish", kind: "self-driving-finish", lifecycle: "until-reconcile",
    runId: "run-a", resourceId: "task1", selfDrivingRevision: 7,
    schedulerTurnId: turnId, schedulerTurnSequence: sequence, text: "waiting",
  },
});
const unrelatedError = { source: "forge", type: "forge.notice", data: { level: "error", method: "agenthub/recovery", text: "keep me" } };
const finishError = { source: "forge", type: "forge.notice", data: {
  level: "error", method: "forge/self-driving/finish", kind: "self-driving-finish", lifecycle: "error",
  runId: "run-a", resourceId: "task1", selfDrivingRevision: 7, text: "finish failed",
} };
context.appendForgeNotice(waiting(1));
assert(state.agent.notices.length === 1, "the first waiting notice should be visible");
context.appendForgeNotice(waiting(1));
assert(state.agent.notices.length === 1, "duplicate finish notices should collapse");
context.appendForgeNotice(finishError);
assert(state.agent.notices.length === 2, "a finish error must not be treated as a waiting notice");
context.appendForgeNotice(unrelatedError);
assert(state.agent.notices.length === 3, "unrelated recovery errors must remain visible");

state.agent.runs[0] = { ...state.agent.runs[0], schedulerTurn: true, schedulerTurnId: "turn-2", schedulerTurnSequence: 2 };
state.tree.projects[0].children[0].selfDriving = { enabled: true, revision: 7, condition: "ready" };
context.reconcileAgentNotices(state.agent.runs);
assert(state.agent.notices.length === 2 && state.agent.notices.every((notice) => notice.data.lifecycle !== "until-reconcile"), "running projection must clear only the waiting notice");
context.appendForgeNotice(waiting(1));
assert(state.agent.notices.length === 2 && state.agent.notices.every((notice) => notice.data.lifecycle !== "until-reconcile"), "a late old notice must not return while running");

state.agent.runs[0] = { ...state.agent.runs[0], schedulerTurn: false, schedulerTurnId: "turn-2", schedulerTurnSequence: 2 };
state.tree.projects[0].children[0].selfDriving = { enabled: true, revision: 7, condition: "waiting" };
context.appendForgeNotice(waiting(2));
assert(state.agent.notices.length === 3, "the latest suspension should show one new waiting notice");
context.appendForgeNotice(waiting(1));
assert(state.agent.notices.length === 3 && state.agent.notices.some((notice) => notice.data.schedulerTurnSequence === 2), "the first suspension must not revive");

state.agent.runs[0] = { ...state.agent.runs[0], selfDrivingRevision: 8, schedulerTurn: false, schedulerTurnId: "turn-3", schedulerTurnSequence: 3 };
state.tree.projects[0].children[0].selfDriving = { enabled: true, revision: 8, condition: "ready" };
context.reconcileAgentNotices(state.agent.runs);
assert(state.agent.notices.length === 2 && state.agent.notices.every((notice) => notice.data.lifecycle !== "until-reconcile"), "a new revision must clear the old waiting notice");

// An event delivered by a replaced EventSource must be ignored after run switching.
context.connectAgentStream();
const oldStream = FakeEventSource.instances[0];
state.agent.activeRunId = "run-b";
state.agent.stream = null;
oldStream.emitNotice(waiting(3));
assert(state.agent.notices.length === 2, "a replaced SSE stream must not append to the new run");

(async () => {
  state.agent.activeRunId = "run-a";
  state.agent.notices = [];
  state.agentRunProjectionVersion = 0;
  const oldRun = { id: "run-a", resourceId: "task1", selfDrivingRevision: 7, schedulerTurn: false, schedulerTurnId: "turn-1", schedulerTurnSequence: 1 };
  const newRun = { ...oldRun, schedulerTurn: true, schedulerTurnId: "turn-2", schedulerTurnSequence: 2 };
  let resolveOldRuns;
  runResponses.push(new Promise((resolve) => { resolveOldRuns = resolve; }));
  const oldRefresh = context.loadAgentRuns();
  await Promise.resolve();
  runResponses.push(Promise.resolve([newRun]));
  await context.loadAgentRuns();
  assert(state.agent.runs[0].schedulerTurnSequence === 2, "the newest run projection should win");
  resolveOldRuns([oldRun]);
  await oldRefresh;
  assert(state.agent.runs[0].schedulerTurnSequence === 2, "a late metadata response must not overwrite the new projection");
})().catch((error) => { console.error(error); process.exitCode = 1; });
`

	testFile := filepath.Join(t.TempDir(), "self-driving-notice-lifecycle.js")
	if err := os.WriteFile(testFile, []byte(script), 0o600); err != nil {
		t.Fatal(err)
	}
	if output, err := exec.Command(node, testFile, frontendAssetPath("app.js")).CombinedOutput(); err != nil {
		t.Fatalf("Self-Driving notice lifecycle test failed: %v\n%s", err, output)
	}

	for _, want := range []string{
		"agentRunProjectionVersion",
		"refreshAgentRunMetadata({ refreshSelfDrivingProjection: true })",
		"state.agent.stream !== stream || state.agent.activeRunId !== runId",
		"async function resumeAgentRun()",
		"async function setChatSelfDrivingDesiredState(options = {})",
		"async function refreshAgentInputProjection(workspaceId, resourceId)",
	} {
		if !strings.Contains(source, want) {
			t.Fatalf("notice lifecycle integration is missing %q", want)
		}
	}
}
