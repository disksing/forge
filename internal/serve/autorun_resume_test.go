package serve

import (
	"os/exec"
	"testing"
)

func TestAutoRunResumeDialogRequiresExplicitAgentAcrossTasks(t *testing.T) {
	node, err := exec.LookPath("node")
	if err != nil {
		t.Skip("node is required for the AutoRun resume dialog test")
	}
	script := `
const fs = require("node:fs");
const source = fs.readFileSync(process.argv[1], "utf8");
function extract(name, isAsync = false) {
  const marker = (isAsync ? "async function " : "function ") + name + "(";
  const start = source.indexOf(marker);
  if (start < 0) throw new Error("missing " + name);
  const bodyStart = source.indexOf("{", source.indexOf(")", start) + 1);
  let depth = 0;
  for (let index = bodyStart; index < source.length; index++) {
    if (source[index] === "{") depth++;
    if (source[index] === "}") {
      depth--;
      if (depth === 0) return source.slice(start, index + 1);
    }
  }
  throw new Error("unterminated " + name);
}
function assert(condition, message) { if (!condition) throw new Error(message); }
class HTMLElement {}
const document = { activeElement: null, contains: () => false };
const RESOURCE_LOG_INITIAL_LIMIT = 10;
const task = {
  id: "project1.task1", type: "task", title: "Current Task",
  autoRun: {
    generation: 7, state: "suspended", agentName: "agent-a",
    prompt: "saved instructions", completionCriteria: "saved criteria",
  },
};
const state = {
  selectedId: task.id,
  details: { [task.id]: task },
  activeWorkspaceId: "workspace-one",
  modalEnter: "",
  agent: {
    runs: [], agentName: "agent-from-another-task",
    autoRunStarting: false, autoRunCancelling: false,
  },
  config: {
    agents: [
      { id: "agent-a", available: true },
      { id: "agent-b", available: true },
    ],
  },
};
let renderCount = 0;
const apiCalls = [];
function findResource(id) { return id === task.id ? task : null; }
function selectedResourceHasExternalLock() { return false; }
const EXTERNAL_RESOURCE_LOCK_MESSAGE = "locked";
function isLiveAgentRun(run) { return ["starting", "running", "waiting_approval", "idle", "stopping", "recovering"].includes(run?.status); }
function enabledAgentConfigs() { return state.config.agents.filter((agent) => agent.available !== false); }
function selectedAgentConfig() { return { id: state.agent.agentName }; }
function mutateAgentSession(action) { return action(); }
function renderAutoRunConfigDialog() { renderCount++; }
function renderAgent() {}
function renderTTYComposer() {}
function bindAgentEvents() {}
function refreshIcons() {}
async function loadAgentRuns() {}
async function refreshTreeAfterAgentSessionMutation() {}
async function fetchDetail() { return task; }
function applyResourceDetail(detail) { state.details[detail.id] = detail; return detail; }
function renderAll() {}
function toast() {}
async function api(path, options = {}) {
  apiCalls.push({ path, body: JSON.parse(options.body) });
  return { action: "started", reused: false, agentName: "agent-b", task, run: { id: "run-new" } };
}
eval(extract("autoRunIdleSessionForResource"));
eval(extract("autoRunNeedsConfiguration"));
eval(extract("autoRunDialogInitialState"));
eval(extract("openAutoRunConfigDialog"));
eval(extract("closeAutoRunConfigDialog"));
eval(extract("startChatAutoRun", true));

(async function run() {
  openAutoRunConfigDialog();
  assert(state.autoRunDialog.mode === "resume", "a suspended task without an idle Session must use resume mode");
  assert(state.autoRunDialog.agentName === "agent-a", "the dialog may preselect only this generation's saved Agent");
  assert(state.autoRunDialog.agentSource.includes("this AutoRun generation"), "the saved Agent preselection must be explained");
  assert(state.autoRunDialog.agentName !== state.agent.agentName, "the dialog must not use another Task's recent Agent");

  const beforeDialog = apiCalls.length;
  const beforeDialogRender = renderCount;
  const noConfiguration = await startChatAutoRun();
  assert(noConfiguration === null, "clicking Resume must stop at the dialog before confirmation");
  assert(renderCount === beforeDialogRender + 1, "the unconfigured Resume click must open the Agent dialog");
  assert(apiCalls.length === beforeDialog, "opening the Resume dialog must not call the start API");

  await startChatAutoRun({ configured: true, agentName: "agent-b", expectedGeneration: 7, expectedState: "suspended", runInstructions: "discarded", completionCriteria: "discarded" });
  assert(apiCalls.length === 1, "confirmation must issue exactly one start request");
  const body = apiCalls[0].body;
  assert(body.agentName === "agent-b", "confirmation must use the explicitly selected Agent");
  assert(body.expectedGeneration === 7 && body.expectedState === "suspended", "confirmation must carry the generation/state CAS");
  assert(!Object.prototype.hasOwnProperty.call(body, "runInstructions") && !Object.prototype.hasOwnProperty.call(body, "completionCriteria"), "resume confirmation must preserve saved parameters");

  state.autoRunDialog = { open: true, submitting: false, returnFocus: null };
  const beforeCancelRender = renderCount;
  closeAutoRunConfigDialog();
  assert(!state.autoRunDialog.open && renderCount === beforeCancelRender + 1, "cancel must close the dialog without submitting");
  assert(apiCalls.length === 1, "cancel must have zero additional side effects");
})().catch((error) => { console.error(error); process.exitCode = 1; });
`
	appPath := frontendAssetPath("app.js")
	if output, err := exec.Command(node, "-e", script, appPath).CombinedOutput(); err != nil {
		t.Fatalf("AutoRun resume dialog test failed: %v\n%s", err, output)
	}
}
