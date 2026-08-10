package serve

import (
	"context"
	"net/http/httptest"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
)

func TestAgentRunCompletionMarkerUsesCanonicalDurableEventOnce(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	client, err := newAgentHubClient(hub.URL, hub.Client())
	if err != nil {
		t.Fatal(err)
	}

	const sessionID = "ses_completion"
	fake.mu.Lock()
	fake.sessions[sessionID] = agentHubSession{ID: sessionID, State: "ready"}
	fake.appendLocked(sessionID, "session.created", map[string]any{"id": sessionID})
	fake.appendLocked(sessionID, "turn.started", map[string]any{"turnId": "turn-1"})
	fake.appendLocked(sessionID, "provider.turn.completed", map[string]any{"turnId": "turn-1"})
	fake.appendLocked(sessionID, "turn.completed", map[string]any{"turnId": "turn-1"})
	session := fake.sessions[sessionID]
	fake.mu.Unlock()

	rt := newAgentHubRuntime(manager, workspace, agentRun{
		ID:                  "run-completion",
		WorkspaceID:         workspace.ID,
		AgentHubSessionID:   sessionID,
		CompletionSessionID: sessionID,
		CompletionCursor:    2,
		Status:              "running",
	}, client)
	rt.recordTurnCompletion(session)
	got := rt.snapshotRun()
	if got.CompletionCursor != 4 || got.CompletionEventID != 4 || got.CompletionMarker != sessionID+":4" || got.CompletionState != "completed" {
		t.Fatalf("unexpected completion projection: %#v", got)
	}

	fake.mu.Lock()
	eventsCalls := fake.eventsCalls
	fake.mu.Unlock()
	if eventsCalls != 1 {
		t.Fatalf("first completion should read one durable page, got %d calls", eventsCalls)
	}

	rt.recordTurnCompletion(session)
	got = rt.snapshotRun()
	fake.mu.Lock()
	duplicateCalls := fake.eventsCalls
	fake.mu.Unlock()
	if duplicateCalls != eventsCalls || got.CompletionMarker != sessionID+":4" {
		t.Fatalf("duplicate completion changed durable projection: calls %d -> %d, run=%#v", eventsCalls, duplicateCalls, got)
	}

	const baselineID = "ses_baseline"
	fake.mu.Lock()
	fake.sessions[baselineID] = agentHubSession{ID: baselineID, State: "ready"}
	fake.appendLocked(baselineID, "session.created", map[string]any{"id": baselineID})
	fake.appendLocked(baselineID, "turn.completed", map[string]any{"turnId": "old-turn"})
	baselineSession := fake.sessions[baselineID]
	fake.mu.Unlock()
	baselineRuntime := newAgentHubRuntime(manager, workspace, agentRun{
		ID:                "run-baseline",
		WorkspaceID:       workspace.ID,
		AgentHubSessionID: baselineID,
		Status:            "idle",
	}, client)
	baselineRuntime.recordTurnCompletion(baselineSession)
	baseline := baselineRuntime.snapshotRun()
	if baseline.CompletionCursor != baselineSession.LastEventID || baseline.CompletionMarker != "" {
		t.Fatalf("fresh session was not baselined without a historical marker: %#v", baseline)
	}
}

func TestAgentHubTurnTerminalKinds(t *testing.T) {
	for _, eventType := range []string{"turn.completed", "turn.failed", "turn.cancelled"} {
		if !isAgentHubTurnTerminal(eventType) {
			t.Fatalf("%s should be a canonical terminal", eventType)
		}
	}
	for _, eventType := range []string{"provider.turn.completed", "turn.started", "session.state"} {
		if isAgentHubTurnTerminal(eventType) {
			t.Fatalf("%s must not manufacture a completion marker", eventType)
		}
	}
}

func TestTreeSessionProjectsCompletionMarker(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	if err := saveAgentRun(workspace.Path, agentRun{
		ID:                "run-tree",
		WorkspaceID:       workspace.ID,
		ForgeSessionID:    "forge-tree",
		AgentHubSessionID: "ses-tree",
		ResourceID:        "project1.task1",
		Status:            "idle",
		CompletionMarker:  "ses-tree:17",
		CompletionState:   "failed",
		CompletionAt:      "2026-08-06T00:00:17Z",
	}); err != nil {
		t.Fatal(err)
	}
	tree := workspaceTree{Sessions: []guiSession{{ID: "forge-tree"}}}
	if err := manager.server.enrichTreeSessions(workspace.Path, &tree); err != nil {
		t.Fatal(err)
	}
	projected := tree.Sessions[0]
	if projected.AgentRunCompletionMarker != "ses-tree:17" || projected.AgentRunCompletionState != "failed" || projected.AgentRunCompletionAt != "2026-08-06T00:00:17Z" {
		t.Fatalf("completion marker was not projected to the tree session: %#v", projected)
	}
}

func TestAgentHubPollerRetriesCompletionHistoryAfterTransientFailure(t *testing.T) {
	fake := newRuntimeFakeAgentHub()
	hub := httptest.NewServer(fake)
	defer hub.Close()
	manager, workspace, _ := newRuntimeTestManager(t, hub.URL)
	const sessionID = "ses_retry_completion"
	source := &agentHubSource{App: agentHubSourceApp, InstanceID: "forge-runtime-test", ExternalID: workspace.ID + "/run-retry"}
	fake.mu.Lock()
	fake.sessions[sessionID] = agentHubSession{ID: sessionID, State: "ready", Source: source}
	fake.appendLocked(sessionID, "session.created", map[string]any{"id": sessionID})
	fake.appendLocked(sessionID, "turn.completed", map[string]any{"turnId": "turn-retry"})
	fake.sessions[sessionID] = agentHubSession{
		ID: sessionID, State: "ready", Source: source, LastEventID: 2,
	}
	fake.failEvents = true
	fake.mu.Unlock()
	if err := saveAgentRun(workspace.Path, agentRun{
		ID: "run-retry", WorkspaceID: workspace.ID, AgentHubSessionID: sessionID,
		SourceExternalID: source.ExternalID, Status: "running",
		CompletionSessionID: sessionID, CompletionCursor: 1,
	}); err != nil {
		t.Fatal(err)
	}

	if err := manager.pollAgentHubSessions(context.Background()); err != nil {
		t.Fatal(err)
	}
	rt := manager.runtimeByID("run-retry")
	waitForRuntimeTest(t, func() bool {
		fake.mu.Lock()
		eventsAttempts := fake.eventsAttempts
		fake.mu.Unlock()
		return eventsAttempts >= 1 && rt.snapshotRun().CompletionMarker == ""
	})

	fake.mu.Lock()
	fake.failEvents = false
	fake.mu.Unlock()
	if err := manager.pollAgentHubSessions(context.Background()); err != nil {
		t.Fatal(err)
	}
	waitForRuntimeTest(t, func() bool {
		return rt.snapshotRun().CompletionMarker == sessionID+":2"
	})
}

func TestSessionCompletionNotificationBehavior(t *testing.T) {
	node, err := exec.LookPath("node")
	if err != nil {
		t.Skip("node is required for session completion notification tests")
	}
	appData, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	appSource := string(appData)
	start := strings.Index(appSource, "function notificationStorage()")
	end := strings.Index(appSource, "function agentDraftStorage()")
	if start < 0 || end <= start {
		t.Fatal("could not isolate notification helpers")
	}

	testDir := t.TempDir()
	bundlePath := filepath.Join(testDir, "app.js")
	if err := os.WriteFile(bundlePath, appData, 0o600); err != nil {
		t.Fatal(err)
	}
	testFile := filepath.Join(testDir, "notification.js")
	script := `
const fs = require("node:fs");
const vm = require("node:vm");
const source = fs.readFileSync(process.argv[2], "utf8");
const start = source.indexOf("function notificationStorage()");
const end = source.indexOf("function agentDraftStorage()");
const helperSource = source.slice(start, end);
const data = new Map();
const browserNotifications = [];
class FakeNotification {
  static permission = "granted";
  static permissionRequests = 0;
  constructor(title, options) { browserNotifications.push({ title, options }); }
  static requestPermission() {
    FakeNotification.permissionRequests += 1;
    return Promise.resolve(FakeNotification.permission);
  }
}
class FakeChannel { constructor() {} postMessage() {} close() {} }
class FakeAudioContext {
  constructor() { this.state = "running"; this.currentTime = 0; this.destination = {}; }
  resume() { return Promise.resolve(); }
  createOscillator() {
    return { frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {}, start() { context.soundStarts += 1; }, stop() {} };
  }
  createGain() { return { gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {} }; }
}
const storage = {
  getItem(key) { return data.has(key) ? data.get(key) : null; },
  setItem(key, value) { data.set(key, String(value)); },
  removeItem(key) { data.delete(key); },
};
const resources = {
  "task-one": { id: "task-one", type: "task", title: "Task One" },
  "task-two": { id: "task-two", type: "task", title: "Task Two" },
  "auto-one": { id: "auto-one", type: "task", title: "Auto One", selfDriving: { enabled: true, revision: 1, condition: "ready" } },
};
const context = {
	storage,
	resources,
	FakeNotification,
	browserNotifications,
	soundStarts: 0,
	state: {
    selectedId: "task-one", tree: { sessions: [] }, settings: { open: false, tab: "notifications" },
    agent: { runs: [], activeRunId: "" },
    notifications: { ready: false, workspaceId: "", store: null, settings: null, channel: null, tabId: "tab-one", audioContext: null, soundError: "", permissionError: "" },
  },
  window: { localStorage: storage, Notification: FakeNotification, BroadcastChannel: FakeChannel, AudioContext: FakeAudioContext, addEventListener() {}, focus() {} },
  document: { hidden: false, visibilityState: "visible", hasFocus: () => true, addEventListener() {} },
  findResource(id) { return resources[id] || null; },
  renderSessions() {}, refreshIcons() {}, renderSettingsModal() {}, flushAgentDraftOnPageLeave() {},
  selectResource: async (id) => { context.state.selectedId = id; },
  loadCanonicalAgentEvents: async () => {}, renderAgent() {}, renderTTY() {}, bindAgentEvents() {},
  console, setTimeout,
};
context.globalThis = context;
vm.createContext(context);
const behavior = ` + "`" + `
const NOTIFICATION_STORAGE_PREFIX = "forge.gui.notifications.v1";
const NOTIFICATION_SETTINGS_KEY = NOTIFICATION_STORAGE_PREFIX + ".settings";
const NOTIFICATION_STORE_VERSION = 1;
const NOTIFICATION_MAX_SEEN = 2000;
const NOTIFICATION_MAX_UNREAD = 200;
const NOTIFICATION_MAX_EFFECTS = 2000;
${helperSource}
function assert(condition, message) { if (!condition) throw new Error(message); }
function item(marker, resourceId, extra = {}) {
  return Object.assign({ id: "run-" + marker, forgeSessionId: "forge-" + marker, resourceId, completionMarker: marker }, extra);
}
initializeNotificationState("workspace-one");
state.notifications.settings = { browser: true, sound: false };
state.notifications.ready = true;
assert(!observeCompletion(item("ordinary-visible", "task-one"), "completed"), "visible selected completion was reported");
assert(notificationStore().unread.length === 0, "visible selected completion became unread");
assert(browserNotifications.length === 0, "visible selected completion produced a browser notification");
state.selectedId = "task-two";
assert(observeCompletion(item("ordinary-other", "task-one"), "completed"), "other-resource completion was not reported");
assert(notificationStore().unread.length === 1 && browserNotifications.length === 1, "other-resource completion did not produce one effect");
assert(!observeCompletion(item("ordinary-other", "task-one"), "completed"), "duplicate projection was reported twice");
assert(browserNotifications.length === 1, "duplicate projection produced a second browser notification");
state.selectedId = "task-one";
document.hidden = true; document.visibilityState = "hidden";
assert(observeCompletion(item("ordinary-hidden", "task-one"), "completed"), "hidden completion was not reported");
document.hidden = false; document.visibilityState = "visible";
clearUnreadForResource("task-one");
assert(!notificationStore().unread.some((record) => record.resourceId === "task-one"), "foreground resource did not clear unread state");
document.hasFocus = () => false;
assert(observeCompletion(item("ordinary-unfocused", "task-one"), "completed"), "unfocused completion was not reported");
document.hasFocus = () => true;
clearUnreadForResource("task-one");
const browserBeforeSound = browserNotifications.length;
state.notifications.settings = { browser: false, sound: false };
setCompletionSoundEnabled(true);
assert(JSON.parse(storage.getItem(NOTIFICATION_SETTINGS_KEY)).sound === true, "sound preference was not persisted locally");
state.selectedId = "task-two";
assert(observeCompletion(item("sound-only", "task-one"), "completed"), "sound-only completion was not reported");
assert(browserNotifications.length === browserBeforeSound, "sound-only completion called browser notification API");
assert(soundStarts === 1, "sound-only completion did not play one sound");
state.notifications.settings.sound = false;
const autoItem = item("self-driving-intermediate", "auto-one", { schedulerTurn: true, selfDrivingRevision: 1 });
assert(!observeCompletion(autoItem, "completed"), "Self-Driving intermediate turn was reported");
assert(notificationStore().pending.some((record) => record.marker === "self-driving-intermediate"), "Self-Driving intermediate turn was not deferred");
resources["auto-one"].selfDriving.condition = "waiting";
assert(!observeCompletion(autoItem, "completed"), "suspended Self-Driving turn was reported");
assert(!notificationStore().pending.some((record) => record.marker === "self-driving-intermediate"), "suspended Self-Driving turn remained pending");
resources["auto-one"].selfDriving = { enabled: false, revision: 2, condition: "disabled", lastOutcome: { status: "completed", revision: 1 } };
assert(observeCompletion(item("self-driving-final", "auto-one", { selfDrivingRevision: 1 }), "completed"), "terminal Self-Driving generation was not reported");
resources["auto-one"].selfDriving = { enabled: true, revision: 3, condition: "error", lastOutcome: { status: "error", revision: 3 } };
assert(observeCompletion(item("self-driving-failed", "auto-one", { selfDrivingRevision: 1 }), "failed"), "failed Self-Driving generation was not reported");
resources["auto-one"].selfDriving = { enabled: true, revision: 4, condition: "blocked", lastOutcome: { status: "blocked", revision: 4 } };
assert(observeCompletion(item("self-driving-paused", "auto-one", { selfDrivingRevision: 1 }), "completed"), "paused Self-Driving generation was not reported");
resources["auto-one"].selfDriving = { enabled: false, revision: 5, condition: "disabled" };
const cancelledBefore = { unread: notificationStore().unread.length, pending: notificationStore().pending.length, browser: browserNotifications.length, sound: soundStarts };
assert(!observeCompletion(item("self-driving-cancelled", "auto-one", { schedulerTurn: true, selfDrivingRevision: 1 }), "cancelled"), "cancelled Self-Driving turn was reported");
assert(!notificationStore().unread.some((record) => record.marker === "self-driving-cancelled"), "cancelled Self-Driving turn became unread");
assert(!notificationStore().pending.some((record) => record.marker === "self-driving-cancelled"), "cancelled Self-Driving turn remained pending");
assert(browserNotifications.length === cancelledBefore.browser && soundStarts === cancelledBefore.sound, "cancelled Self-Driving turn triggered completion effects");
const effectsBeforeRefresh = browserNotifications.length;
initializeNotificationState("workspace-one");
state.agent.runs = [item("self-driving-final", "auto-one", { selfDrivingRevision: 1 })];
establishNotificationBaseline();
assert(notificationStore().unread.some((record) => record.marker === "self-driving-final"), "refresh lost persisted unread state");
assert(browserNotifications.length === effectsBeforeRefresh, "refresh replayed a browser notification");
storage.setItem(notificationStateKey("workspace-one"), "{not-json");
const recoveredStore = readNotificationStore("workspace-one");
assert(recoveredStore.unread.length === 0, "corrupt notification storage was not reset");
state.notifications.settings = { browser: false, sound: false };
FakeNotification.permission = "denied";
setBrowserNotificationsEnabled(true);
assert(FakeNotification.permissionRequests === 0 && state.notifications.settings.browser === false, "denied permission was requested again");
state.notifications.store = notificationDefaultStore();
state.selectedId = "auto-one";
document.hidden = false; document.visibilityState = "visible";
handleNotificationBroadcast({ workspaceId: "workspace-one", sourceTabId: "tab-two", type: "record", record: { marker: "cross-tab", sessionId: "forge-cross", resourceId: "auto-one", title: "Auto One" } });
assert(!notificationStore().unread.some((record) => record.marker === "cross-tab"), "focused cross-tab resource stayed unread");
` + "`" + `;
vm.runInContext(behavior, context);
`
	if err := os.WriteFile(testFile, []byte(script), 0o600); err != nil {
		t.Fatal(err)
	}
	if output, err := exec.Command(node, testFile, bundlePath).CombinedOutput(); err != nil {
		t.Fatalf("session completion notification behavior failed: %v\n%s", err, output)
	}
}
