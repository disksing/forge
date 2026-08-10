package serve

import (
	"os/exec"
	"testing"
)

func TestAgentUploadBackfillsDraftAfterComposerRerender(t *testing.T) {
	if _, err := exec.LookPath("node"); err != nil {
		t.Skip("node is required for Agent upload frontend tests")
	}

	script := `
const fs = require("node:fs");
const vm = require("node:vm");
const source = fs.readFileSync(process.argv[1], "utf8");
const start = source.indexOf("function closeAgentUploadDialog()");
const end = source.indexOf("function renderAgentUploadDialog", start);
if (start < 0 || end < 0) throw new Error("Agent upload helpers are missing");

const ttyInput = {
  value: "draft before upload",
  dataset: { agentDraftKey: "draft-key" },
  focus() {},
};
const composer = { dataset: { composerKey: "stale" } };
const uploadRoot = { innerHTML: "mounted" };
const state = {
  agent: {
    activeRunId: "run-1",
    ttyDraft: "draft before upload",
    ttyDraftKey: "draft-key",
  },
  uploadDialog: {
    open: true,
    runId: "run-1",
    items: [{ status: "success", path: "/tmp/uploaded.txt" }],
  },
};
let renderOptions = null;
function $(id) {
  if (id === "ttyInput") return ttyInput;
  if (id === "ttyComposer") return composer;
  if (id === "uploadDialogRoot") return uploadRoot;
  return null;
}
function updateAgentDraft(text) {
  state.agent.ttyDraft = String(text ?? "");
}
function syncAgentDraftFromDOM() {
  const input = $("ttyInput");
  if (!input || !state.agent.ttyDraftKey || input.dataset.agentDraftKey !== state.agent.ttyDraftKey) return;
  updateAgentDraft(input.value);
}
function renderTTYComposer(options = {}) {
  renderOptions = options;
  if (!options.skipDraftSync) syncAgentDraftFromDOM();
  ttyInput.value = state.agent.ttyDraft;
}
function bindAgentEvents() {}
function refreshIcons() {}

const context = {
  state, $, updateAgentDraft, syncAgentDraftFromDOM, renderTTYComposer,
  bindAgentEvents, refreshIcons,
};
vm.createContext(context);
vm.runInContext(source.slice(start, end), context);
function assert(condition, message) {
  if (!condition) throw new Error(message);
}

context.closeAgentUploadDialog();
assert(state.agent.ttyDraft === ["draft before upload", "/tmp/uploaded.txt"].join(String.fromCharCode(10)), "successful upload path was not retained in the draft");
assert(ttyInput.value === state.agent.ttyDraft, "rendered composer does not show the updated draft");
assert(renderOptions && renderOptions.skipDraftSync === true, "composer rerender must skip stale DOM draft synchronization");
assert(!state.uploadDialog.open, "upload dialog should close after completed upload");
`

	appPath := frontendAssetPath("app.js")
	if output, err := exec.Command("node", "-e", script, appPath).CombinedOutput(); err != nil {
		t.Fatalf("Agent upload frontend test failed: %v\n%s", err, output)
	}
}
