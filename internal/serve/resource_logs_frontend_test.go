package serve

import (
	"os/exec"
	"path/filepath"
	"testing"
)

func TestResourceLogPaginationFrontendState(t *testing.T) {
	node, err := exec.LookPath("node")
	if err != nil {
		t.Skip("node is required for resource log pagination tests")
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
function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const state = {
  activeWorkspaceId: "workspace-one",
  navigationVersion: 1,
  selectedId: "project1",
  details: {},
  resourceLogPages: {},
};
const RESOURCE_LOG_MORE_LIMIT = 20;
let renderCount = 0;
let requests = [];
function isCurrentWorkspaceView(workspaceId, navigationVersion) {
  return workspaceId === state.activeWorkspaceId && navigationVersion === state.navigationVersion;
}
function renderDetails() { renderCount++; }
function bindLogEvents() {}
function refreshIcons() {}
function toast() {}
function fetchDetail(id, workspaceId, options) {
  return new Promise((resolve, reject) => requests.push({ id, workspaceId, options, resolve, reject }));
}
function latestRequest() { return requests[requests.length - 1]; }
function logEntry(index) {
  return {
    id: "log-" + index,
    time: "2026-01-01T00:00:" + String(59 - index).padStart(2, "0") + "Z",
    title: "entry " + index,
  };
}
function logEntries(start, count) {
  return Array.from({ length: count }, (_, offset) => logEntry(start + offset));
}

eval(extract("compareLogTimeDesc"));
eval(extract("resetResourceLogState"));
eval(extract("resourceLogPage"));
eval(extract("resourceLogEntries"));
eval(extract("mergeResourceLogs"));
eval(extract("applyResourceDetail"));
eval(extract("loadMoreLogs", true));
eval(extract("captureLogRegionState"));
eval(extract("restoreLogRegionState"));
eval(extract("autoRunStatusReason"));

(async function run() {
  applyResourceDetail({
    id: "project1",
    logs: logEntries(0, 10),
    logPage: { hasMore: true, nextCursor: "log-9" },
  }, "replace");
  assert(state.details.project1.logs.length === 10, "initial detail should keep only ten logs");
  assert(state.resourceLogPages.project1.nextCursor === "log-9", "initial cursor was not stored");

  const firstLoad = loadMoreLogs("project1");
  assert(requests.length === 1, "Load More should issue one request");
  assert(latestRequest().options.logsLimit === 20 && latestRequest().options.logsCursor === "log-9", "Load More must request twenty logs with the stable cursor");
  const duplicateLoad = loadMoreLogs("project1");
  assert(requests.length === 1, "duplicate clicks while loading must be ignored");
  latestRequest().resolve({
    id: "project1",
    logs: logEntries(10, 20),
    logPage: { hasMore: true, nextCursor: "log-29" },
  });
  await Promise.all([firstLoad, duplicateLoad]);
  assert(state.details.project1.logs.length === 30, "the first older page should append twenty logs");
  assert(state.resourceLogPages.project1.hasMore, "a remaining older page should keep Load More visible");

  const lastLoad = loadMoreLogs("project1");
  assert(requests.length === 2 && latestRequest().options.logsCursor === "log-29", "the second Load More must continue from the returned cursor");
  latestRequest().resolve({
    id: "project1",
    logs: logEntries(30, 1),
    logPage: { hasMore: false, nextCursor: "log-30" },
  });
  await lastLoad;
  const allIDs = state.details.project1.logs.map((entry) => entry.id);
  assert(allIDs.length === 31 && new Set(allIDs).size === 31, "multi-page loading must not duplicate log IDs");
  assert(!state.resourceLogPages.project1.hasMore, "the final page must hide Load More");
  const requestCountAfterLastPage = requests.length;
  await loadMoreLogs("project1");
  assert(requests.length === requestCountAfterLastPage, "Load More must be inert after the last page");

  const freshHead = { id: "log-new", time: "2026-01-01T00:01:00Z", title: "new head" };
  const refreshedFirst = { ...logEntry(0), title: "refreshed first entry" };
  applyResourceDetail({
    id: "project1",
    logs: [freshHead, refreshedFirst, ...logEntries(1, 9)],
    logPage: { hasMore: true, nextCursor: "log-9" },
  }, "head");
  const afterHead = state.details.project1.logs.map((entry) => entry.id);
  assert(afterHead[0] === "log-new" && afterHead.length === 32 && new Set(afterHead).size === 32, "head refresh must merge and deduplicate without dropping loaded older pages");
  assert(state.details.project1.logs.find((entry) => entry.id === "log-0").title === "refreshed first entry", "head refresh must prefer the fresh duplicate entry");
  assert(!state.resourceLogPages.project1.hasMore, "head refresh must retain the loaded older-page terminal state");

  resetResourceLogState("project1");
  applyResourceDetail({ id: "project1", autoRun: { state: "failed", statusReason: "fresh status" }, logs: logEntries(0, 10), logPage: { hasMore: true, nextCursor: "log-9" } }, "replace");
  const failingLoad = loadMoreLogs("project1");
  latestRequest().reject(new Error("temporary failure"));
  await failingLoad;
  assert(state.resourceLogPages.project1.error === "temporary failure", "a failed page request must expose a retry error");
  assert(state.details.project1.logs.length === 10, "a failed request must retain the loaded logs");
  const retryLoad = loadMoreLogs("project1");
  assert(latestRequest().options.logsCursor === "log-9", "retry must use the unchanged cursor");
  latestRequest().resolve({ id: "project1", autoRun: { state: "failed", statusReason: "stale status" }, logs: [logEntry(10)], logPage: { hasMore: false, nextCursor: "log-10" } });
  await retryLoad;
  assert(!state.resourceLogPages.project1.error && state.details.project1.logs.length === 11, "a retry must clear the error and merge the page");
  assert(state.details.project1.autoRun.statusReason === "fresh status", "older page response must not overwrite fresher detail metadata");

  resetResourceLogState("project1");
  applyResourceDetail({ id: "project1", logs: logEntries(0, 10), logPage: { hasMore: true, nextCursor: "log-9" } }, "replace");
  state.selectedId = "project1";
  state.navigationVersion = 1;
  const staleLoad = loadMoreLogs("project1");
  state.selectedId = "project2";
  state.navigationVersion = 2;
  latestRequest().resolve({ id: "project1", logs: logEntries(10, 20), logPage: { hasMore: false, nextCursor: "log-29" } });
  await staleLoad;
  assert(state.details.project1.logs.length === 10, "a response for a switched-away resource must not mutate the old detail");

  let scrollOffset = 0;
  const logNodes = [
    { dataset: { logId: "log-0" }, open: true, getBoundingClientRect: () => ({ top: 100 + scrollOffset, bottom: 140 + scrollOffset }) },
    { dataset: { logId: "log-1" }, open: false, getBoundingClientRect: () => ({ top: 150 + scrollOffset, bottom: 190 + scrollOffset }) },
    { dataset: { logId: "log-2" }, open: true, getBoundingClientRect: () => ({ top: 200 + scrollOffset, bottom: 240 + scrollOffset }) },
  ];
  const region = { querySelectorAll: (selector) => selector.includes("[open]") ? logNodes.filter((node) => node.open) : logNodes };
  const panel = { scrollTop: 73, getBoundingClientRect: () => ({ top: 0 }) };
  const saved = captureLogRegionState(panel, region);
  assert(saved.openIds.join(",") === "log-0,log-2", "expanded log IDs must be captured");
  logNodes.forEach((node) => { node.open = false; });
  scrollOffset = 24;
  restoreLogRegionState(panel, region, saved);
  assert(logNodes[0].open && logNodes[2].open, "expanded log IDs must be restored");
  assert(panel.scrollTop === 97, "log scroll position must follow the visible anchor after refresh");

  const structuredReason = autoRunStatusReason({ state: "failed", generation: 4, statusReason: "server-side failure" }, []);
  assert(structuredReason && structuredReason.text === "server-side failure", "AutoRun status reason must survive outside the first log page");
})().catch((error) => { console.error(error); process.exitCode = 1; });
`
	if output, err := exec.Command(node, "-e", script, filepath.Join("static", "app.js")).CombinedOutput(); err != nil {
		t.Fatalf("resource log pagination frontend test failed: %v\n%s", err, output)
	}
}
