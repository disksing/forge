package serve

import (
	"os/exec"
	"strings"
	"testing"
)

func TestAgentInputFrontendProjectsRevisionWithoutImplicitResume(t *testing.T) {
	node, err := exec.LookPath("node")
	if err != nil {
		t.Skip("node is required for Agent input frontend tests")
	}
	data, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	source := string(data)
	start := strings.Index(source, "function agentInputSelfDrivingProjection(")
	end := -1
	if start >= 0 {
		if offset := strings.Index(source[start:], "function openAgentUploadDialog"); offset >= 0 {
			end = start + offset
		}
	}
	if start < 0 || end < 0 {
		t.Fatal("Agent input frontend helpers are missing")
	}
	script := `
const fs = require("node:fs");
const vm = require("node:vm");
const source = fs.readFileSync(process.argv[1], "utf8");
const start = source.indexOf("function agentInputSelfDrivingProjection(");
const end = source.indexOf("function openAgentUploadDialog", start);
if (start < 0 || end < 0) throw new Error("Agent input frontend helpers are missing");
const task = { id: "project1.task1", type: "task", selfDriving: { enabled: true, revision: 7, condition: "waiting" } };
const run = {
  id: "run-1", resourceId: task.id, status: "idle", schedulerTurn: false,
  agentHubSessionId: "session-1", selfDrivingRevision: 7,
};
const state = {
  activeWorkspaceId: "workspace-1", selectedId: task.id,
  tree: { projects: [{ id: "project1", children: [task] }] }, details: { [task.id]: task },
  agent: { activeRunId: run.id, runs: [run] },
};
const calls = [];
function findResource(id) { return id === task.id ? task : null; }
function currentAgentRun() { return state.agent.runs.find((item) => item.id === state.agent.activeRunId) || null; }
function isLiveAgentRun(item) { return ["starting", "running", "waiting_approval", "idle", "stopping", "recovering"].includes(item?.status); }
function selectedResourceHasExternalLock() { return false; }
function currentUserName() { return "Ada Lovelace"; }
const EXTERNAL_RESOURCE_LOCK_MESSAGE = "external lock";
async function api(path, options) { calls.push({ path, body: JSON.parse(options.body) }); return { status: "accepted" }; }
const context = { state, findResource, currentAgentRun, isLiveAgentRun, selectedResourceHasExternalLock, currentUserName, EXTERNAL_RESOURCE_LOCK_MESSAGE, api };
vm.createContext(context);
vm.runInContext(source.slice(start, end), context);
function assert(condition, message) { if (!condition) throw new Error(message); }
(async () => {
	await context.sendAgentInput("human instruction");
  const resumed = calls.pop().body;
  assert(resumed.resourceId === task.id && resumed.selfDrivingProjectionSet === true, "resume request lacks resource projection");
  assert(resumed.expectedSelfDrivingRevision === 7 && resumed.expectedSelfDrivingCondition === "waiting", "manual request lacks revision/condition projection");
  assert(!resumed.resumeSuspendedSelfDriving && !resumed.selfDrivingRevision, "manual input sent retired resume authority");
  assert(resumed.userName === "Ada Lovelace", "manual request lacks the browser-local user name");

  task.selfDriving.condition = "blocked";
	await context.sendAgentInput("ordinary paused chat");
	const ordinary = calls.pop().body;
	assert(ordinary.expectedSelfDrivingCondition === "blocked", "blocked projection was not sent");
  assert(!ordinary.resumeSuspendedSelfDriving, "paused chat must not request implicit resume");
  assert(ordinary.userName === "Ada Lovelace", "ordinary chat request lacks the browser-local user name");
})().catch((error) => { console.error(error); process.exitCode = 1; });
`
	appPath := frontendAssetPath("app.js")
	if output, err := exec.Command(node, "-e", script, appPath).CombinedOutput(); err != nil {
		t.Fatalf("Agent input frontend test failed: %v\n%s", err, output)
	}
}

func TestSuspendedChatInputClearsDraftAfterAcceptedProjectionRefresh(t *testing.T) {
	node, err := exec.LookPath("node")
	if err != nil {
		t.Skip("node is required for suspended Chat draft tests")
	}
	data, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	source := string(data)
	draftStart := strings.Index(source, "const AGENT_DRAFT_STORAGE_PREFIX")
	submitStart := strings.Index(source, "async function submitTTYInput(event)")
	draftEnd := -1
	if draftStart >= 0 {
		if offset := strings.Index(source[draftStart:], "async function api(path, options = {})"); offset >= 0 {
			draftEnd = draftStart + offset
		}
	}
	submitEnd := -1
	if submitStart >= 0 {
		if offset := strings.Index(source[submitStart:], "function resizeTTYInput(input)"); offset >= 0 {
			submitEnd = submitStart + offset
		}
	}
	if draftStart < 0 || draftEnd < 0 || submitStart < 0 || submitEnd < 0 {
		t.Fatal("could not isolate Chat draft and submit helpers")
	}
	script := `
const fs = require("node:fs");
const vm = require("node:vm");
const source = fs.readFileSync(process.argv[1], "utf8");
const draftStart = source.indexOf("const AGENT_DRAFT_STORAGE_PREFIX");
const draftEnd = source.indexOf("async function api(path, options = {})", draftStart);
const submitStart = source.indexOf("async function submitTTYInput(event)");
const submitEnd = source.indexOf("function resizeTTYInput(input)", submitStart);
if (draftStart < 0 || draftEnd < 0 || submitStart < 0 || submitEnd < 0) {
  throw new Error("could not isolate Chat draft and submit helpers");
}

const data = new Map();
const storage = {
  get length() { return data.size; },
  key(index) { return Array.from(data.keys())[index] ?? null; },
  getItem(key) { return data.get(key) ?? null; },
  setItem(key, value) { data.set(key, String(value)); },
  removeItem(key) { data.delete(key); },
};
const run = {
  id: "run-suspended", resourceId: "project1.task1", status: "idle",
  schedulerTurn: false, agentHubSessionId: "session-suspended", selfDrivingRevision: 7,
};
const state = {
  activeWorkspaceId: "workspace-one",
  selectedId: run.resourceId,
  details: { [run.resourceId]: { id: run.resourceId, type: "task", selfDriving: { generation: 7, state: "suspended" } } },
  agent: {
    runs: [run], activeRunId: run.id, ttyDraft: "", ttyMultiline: false,
    ttyDraftKey: "", ttyDraftWorkspaceId: "", ttyDraftResourceId: "", ttyDraftRunId: "",
    ttyDraftVersion: 0, skipTTYDraftSync: false, sendingInput: false,
  },
};
let ttyInput = { value: "", dataset: {}, focus() {} };
function $(id) { return id === "ttyInput" ? ttyInput : null; }
function currentAgentRun() { return state.agent.runs.find((item) => item.id === state.agent.activeRunId) || null; }
function assert(condition, message) { if (!condition) throw new Error(message); }
const context = {
  state, window: { localStorage: storage }, $, currentAgentRun, console,
  document: {
    activeElement: ttyInput,
    addEventListener() {},
    removeEventListener() {},
  },
  refreshIcons() {},
  toast() {},
};
vm.createContext(context);
vm.runInContext(source.slice(draftStart, draftEnd), context);
vm.runInContext(
  "function agentInputResumeIntent() { return true; }\n" +
  "function renderTTYComposer(options = {}) {\n" +
  "  const skipDraftSync = options.skipDraftSync || state.agent.skipTTYDraftSync;\n" +
  "  state.agent.skipTTYDraftSync = false;\n" +
  "  if (!skipDraftSync) syncAgentDraftFromDOM();\n" +
  "}\n" +
  "function renderAll() { renderTTYComposer(); }\n" +
  "async function refreshAgentInputProjection() { return globalThis.__refreshAgentInputProjection(); }\n",
  context,
);
vm.runInContext("async function sendAgentInput(text) { return globalThis.__sendAgentInput(text); }\n" + source.slice(submitStart, submitEnd), context);

const key = context.agentDraftKeyForRun(run);
context.restoreAgentDraftForRun(run);
ttyInput.dataset.agentDraftKey = key;
context.resizeTTYInput = () => {};

(async () => {
  ttyInput.value = "resume message";
  context.__sendAgentInput = async () => ({ status: "accepted", selfDrivingResumed: true });
  let resolveProjection;
  let projectionStartedResolve;
  const projectionStarted = new Promise((resolve) => { projectionStartedResolve = resolve; });
  context.__refreshAgentInputProjection = async () => {
    projectionStartedResolve();
    await new Promise((resolve) => { resolveProjection = resolve; });
    renderAll();
  };
  const pendingResume = context.submitTTYInput({ preventDefault() {} });
  await projectionStarted;
  assert(state.agent.ttyDraft === "" && !data.has(key), "accepted suspended resume must clear memory and storage before projection refresh");
  assert(ttyInput.value === "", "accepted suspended resume must clear the visible input immediately");
  resolveProjection();
  await pendingResume;

  ttyInput.value = "failed resume";
  context.__refreshAgentInputProjection = async () => { renderAll(); };
  context.__sendAgentInput = async () => { throw new Error("request failed"); };
  await context.submitTTYInput({ preventDefault() {} });
  assert(state.agent.ttyDraft === "failed resume" && data.has(key), "failed suspended resume must retain the draft");

  ttyInput.value = "sent message";
  let resolveSend;
  context.__sendAgentInput = () => new Promise((resolve) => { resolveSend = resolve; });
  const pendingSend = context.submitTTYInput({ preventDefault() {} });
  await Promise.resolve();
  assert(resolveSend, "suspended send request did not start");
  context.updateAgentDraft("next message");
  ttyInput.value = "next message";
  resolveSend({ status: "accepted", selfDrivingResumed: true });
  await pendingSend;
  assert(state.agent.ttyDraft === "next message" && data.has(key), "accepted suspended send must not clear a newer draft");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
`

	appPath := frontendAssetPath("app.js")
	if output, err := exec.Command(node, "-e", script, appPath).CombinedOutput(); err != nil {
		t.Fatalf("suspended Chat draft test failed: %v\n%s", err, output)
	}
}
