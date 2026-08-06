package serve

import (
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
)

func TestAgentInputFrontendMarksOnlyMatchingSuspendedRunForResume(t *testing.T) {
	node, err := exec.LookPath("node")
	if err != nil {
		t.Skip("node is required for Agent input frontend tests")
	}
	data, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	source := string(data)
	start := strings.Index(source, "function agentInputAutoRunProjection(")
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
const start = source.indexOf("function agentInputAutoRunProjection(");
const end = source.indexOf("function openAgentUploadDialog", start);
if (start < 0 || end < 0) throw new Error("Agent input frontend helpers are missing");
const task = { id: "project1.task1", type: "task", autoRun: { generation: 7, state: "suspended" } };
const run = {
  id: "run-1", resourceId: task.id, status: "idle", schedulerTurn: false,
  agentHubSessionId: "session-1", autoRunGeneration: 7,
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
const EXTERNAL_RESOURCE_LOCK_MESSAGE = "external lock";
async function api(path, options) { calls.push({ path, body: JSON.parse(options.body) }); return { status: "accepted" }; }
const context = { state, findResource, currentAgentRun, isLiveAgentRun, selectedResourceHasExternalLock, EXTERNAL_RESOURCE_LOCK_MESSAGE, api };
vm.createContext(context);
vm.runInContext(source.slice(start, end), context);
function assert(condition, message) { if (!condition) throw new Error(message); }
(async () => {
  assert(context.agentInputResumeIntent(run) === true, "matching suspended run should be resumable");
  await context.sendAgentInput("human instruction");
  const resumed = calls.pop().body;
  assert(resumed.resourceId === task.id && resumed.autoRunProjectionSet === true, "resume request lacks resource projection");
  assert(resumed.expectedAutoRunGeneration === 7 && resumed.expectedAutoRunState === "suspended", "resume request lacks generation/state CAS");
  assert(resumed.resumeSuspendedAutoRun === true && resumed.autoRunGeneration === 7, "resume intent was not sent");

  task.autoRun.state = "paused";
  await context.sendAgentInput("ordinary paused chat");
  const ordinary = calls.pop().body;
  assert(ordinary.expectedAutoRunState === "paused", "paused projection was not sent");
  assert(!ordinary.resumeSuspendedAutoRun, "paused chat must not request implicit resume");
})().catch((error) => { console.error(error); process.exitCode = 1; });
`
	appPath := filepath.Join("static", "app.js")
	if output, err := exec.Command(node, "-e", script, appPath).CombinedOutput(); err != nil {
		t.Fatalf("Agent input frontend test failed: %v\n%s", err, output)
	}
}
