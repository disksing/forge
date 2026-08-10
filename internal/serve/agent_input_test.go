package serve

import (
	"os"
	"os/exec"
	"path/filepath"
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
const run = { id: "run-1", resourceId: task.id, status: "idle", schedulerTurn: false, agentHubSessionId: "session-1", selfDrivingRevision: 7 };
const state = { activeWorkspaceId: "workspace-1", selectedId: task.id, tree: { projects: [{ id: "project1", children: [task] }] }, details: { [task.id]: task }, agent: { activeRunId: run.id, runs: [run], ttyDraftKey: "draft-1" } };
const calls = [];
function findResource(id) { return id === task.id ? task : null; }
function currentAgentRun() { return state.agent.runs.find((item) => item.id === state.agent.activeRunId) || null; }
function selectedResourceHasExternalLock() { return false; }
function currentUserName() { return "Ada Lovelace"; }
const EXTERNAL_RESOURCE_LOCK_MESSAGE = "external lock";
async function api(path, options) { calls.push({ path, body: JSON.parse(options.body) }); return { status: "accepted" }; }
const context = { state, findResource, currentAgentRun, selectedResourceHasExternalLock, currentUserName, EXTERNAL_RESOURCE_LOCK_MESSAGE, api };
vm.createContext(context);
vm.runInContext(source.slice(start, end), context);
function assert(condition, message) { if (!condition) throw new Error(message); }
(async () => {
	await context.sendAgentInput("human instruction");
	const resumed = calls.pop().body;
	assert(resumed.resourceId === task.id && resumed.selfDrivingProjectionSet === true, "request lacks resource projection");
	assert(resumed.expectedSelfDrivingRevision === 7 && resumed.expectedSelfDrivingCondition === "waiting", "request lacks revision/condition projection");
	assert(!resumed.resumeSuspendedSelfDriving && !resumed.selfDrivingRevision, "manual input sent retired resume authority");
	assert(resumed.userName === "Ada Lovelace", "manual request lacks the browser-local user name");
	task.selfDriving.condition = "blocked";
	await context.sendAgentInput("ordinary paused chat");
	const ordinary = calls.pop().body;
	assert(ordinary.expectedSelfDrivingCondition === "blocked", "blocked projection was not sent");
	assert(!ordinary.resumeSuspendedSelfDriving, "paused chat must not request implicit resume");
})().catch((error) => { console.error(error); process.exitCode = 1; });
`
	appPath := frontendAssetPath("app.js")
	if output, err := exec.Command(node, "-e", script, appPath).CombinedOutput(); err != nil {
		t.Fatalf("Agent input frontend test failed: %v\n%s", err, output)
	}
}

func TestChatComposerCoversAcceptedFailureRetryAndLateSessionResults(t *testing.T) {
	component, err := os.ReadFile(filepath.Join("..", "..", "frontend", "src", "islands", "ChatComposer.svelte"))
	if err != nil {
		t.Fatal(err)
	}
	testSource, err := os.ReadFile(filepath.Join("..", "..", "frontend", "tests", "unit", "chat-composer.test.ts"))
	if err != nil {
		t.Fatal(err)
	}
	for _, want := range []string{"result.accepted && result.clear && draft === text", "identity === requestIdentity", "Retry", "input?.focus({ preventScroll: true })"} {
		if !strings.Contains(string(component), want) {
			t.Fatalf("Svelte Chat Composer is missing %q", want)
		}
	}
	for _, want := range []string{"does not let a late accepted send clear a different session draft", "keeps failed text and offers an explicit retry"} {
		if !strings.Contains(string(testSource), want) {
			t.Fatalf("Chat Composer component coverage is missing %q", want)
		}
	}
}
