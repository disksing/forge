package serve

import (
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
)

func TestPaneResizeUsesIndependentSidebarAndChatWidths(t *testing.T) {
	node, err := exec.LookPath("node")
	if err != nil {
		t.Skip("node is required for pane resize tests")
	}
	appData, err := staticFiles.ReadFile("static/app.js")
	if err != nil {
		t.Fatal(err)
	}
	app := string(appData)
	for _, want := range []string{
		`paneSizes: {`,
		`chatWidth: 420`,
		`function startChatResize(event)`,
		`setPaneSize("sidebarWidth", width)`,
		`setPaneSize("chatWidth", width)`,
		`savePaneSize("sidebarWidth")`,
		`savePaneSize("chatWidth")`,
		`delete saved.detailsWidth`,
		`function normalizePaneSizes(raw, availableWorkspaceWidth = 0)`,
	} {
		if !strings.Contains(app, want) {
			t.Fatalf("pane resize implementation is missing %q", want)
		}
	}
	if strings.Contains(app, "saveCurrentPaneSizes") || strings.Contains(app, `setCSSPixels("--details-width"`) {
		t.Fatal("pane resize persistence still derives a coupled details width")
	}

	stylesData, err := staticFiles.ReadFile("static/styles.css")
	if err != nil {
		t.Fatal(err)
	}
	styles := string(stylesData)
	for _, want := range []string{
		`--chat-width: 420px;`,
		`minmax(var(--details-min-width), 1fr)`,
		`min(var(--chat-width), calc(100% - var(--details-min-width) - var(--pane-handle-width)))`,
		`@media (max-width: 980px)`,
		`.resize-handle {
    display: none;`,
	} {
		if !strings.Contains(styles, want) {
			t.Fatalf("pane resize styles are missing %q", want)
		}
	}
	assertBalancedCSSDelimiters(t, styles)

	indexData, err := staticFiles.ReadFile("static/index.html")
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(string(indexData), `aria-label="Resize chat panel"`) {
		t.Fatal("the right separator should describe the chat panel it controls")
	}

	script := `
const fs = require("node:fs");
const vm = require("node:vm");
const source = fs.readFileSync(process.argv[2], "utf8");
function extract(name) {
  const marker = "function " + name + "(";
  const start = source.indexOf(marker);
  if (start < 0) throw new Error("missing " + name);
  const open = source.indexOf("{", start);
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
function classes() { return { add() {}, remove() {} }; }
const APP_WIDTH = 1440;
const listeners = new Map();
const styleValues = new Map();
const storage = new Map([["forge.gui.paneSizes", JSON.stringify({ sidebarWidth: 280, chatWidth: 420, sidebarSessionHeight: 210 })]]);
const geometry = () => {
  const cssNumber = (name, fallback) => Number.parseFloat(styleValues.get(name) || fallback);
  const sidebarMax = Math.max(220, APP_WIDTH - 8 - 360 - 8 - 320);
  const sidebar = Math.min(Math.max(cssNumber("--sidebar-width", 280), 220), sidebarMax);
  const panel = APP_WIDTH - sidebar - 8;
  const chatMax = Math.max(320, panel - 360 - 8);
  const chat = Math.min(Math.max(cssNumber("--chat-width", 420), 320), chatMax);
  return { sidebar, panel, chat, divider: APP_WIDTH - chat - 8 };
};
const sidebar = {
  getBoundingClientRect() { return { width: geometry().sidebar, height: 720 }; },
};
const app = {
  getBoundingClientRect() { return { width: APP_WIDTH }; },
  querySelector(selector) { return selector === ".sidebar" ? sidebar : null; },
};
const panel = {
  getBoundingClientRect() { return { width: geometry().panel }; },
};
const chat = {
  getBoundingClientRect() { return { width: geometry().chat }; },
};
const elements = { app, agentPanel: chat };
const document = {
  documentElement: { style: { setProperty(name, value) { styleValues.set(name, value); } } },
  body: { classList: classes() },
  querySelector(selector) {
    if (selector === ".workspace-panel") return panel;
    if (selector === ".sidebar") return sidebar;
    return null;
  },
};
const window = {
  addEventListener(type, handler) { listeners.set(type, handler); },
  removeEventListener(type, handler) { if (listeners.get(type) === handler) listeners.delete(type); },
};
const localStorage = {
  getItem(key) { return storage.get(key) || null; },
  setItem(key, value) { storage.set(key, value); },
};
const context = {
  document,
  window,
  localStorage,
  MOBILE_LAYOUT_QUERY: { matches: false },
  state: { paneSizes: { sidebarWidth: 280, chatWidth: 420, sidebarSessionHeight: 210 } },
  $: (id) => elements[id] || null,
};
vm.createContext(context);
vm.runInContext([
  'const PANE_SIZE_KEY = "forge.gui.paneSizes";',
  'const PANE_HANDLE_WIDTH = 8;',
  'const SIDEBAR_MIN_WIDTH = 220;',
  'const DETAILS_MIN_WIDTH = 360;',
  'const CHAT_MIN_WIDTH = 320;',
  'const PANE_MAX_SIZE = 10000;',
  'const PANE_DEFAULTS = Object.freeze({ sidebarWidth: 280, chatWidth: 420, sidebarSessionHeight: 210 });',
  'const PANE_CSS_VARIABLES = Object.freeze({ sidebarWidth: "--sidebar-width", chatWidth: "--chat-width", sidebarSessionHeight: "--sidebar-session-height" });',
  extract("clamp"),
  extract("isFinitePaneSize"),
  extract("readStoredPaneSizes"),
  extract("setCSSPixels"),
  extract("setPaneSize"),
  extract("savePaneSize"),
  extract("normalizePaneSizes"),
  extract("workspacePanelWidth"),
  extract("loadPaneSizes"),
  extract("isMobilePaneLayout"),
  extract("maxSidebarResizeWidth"),
  extract("startDrag"),
  extract("startSidebarResize"),
  extract("startChatResize"),
].join("\n"), context);
function dispatch(type, event = {}) {
  const handler = listeners.get(type);
  if (handler) handler(event);
}
function assert(condition, message) {
  if (!condition) throw new Error(message);
}
function stored() { return JSON.parse(localStorage.getItem("forge.gui.paneSizes")); }
function dragSidebar(startX, endX) {
  context.startSidebarResize({ clientX: startX, currentTarget: { classList: classes() }, preventDefault() {} });
  dispatch("pointermove", { clientX: endX });
  dispatch("pointerup");
}
function dragChat(startX, endX) {
  context.startChatResize({ clientX: startX, currentTarget: { classList: classes() }, preventDefault() {} });
  dispatch("pointermove", { clientX: endX });
  dispatch("pointerup");
}

const initialDivider = geometry().divider;
dragSidebar(geometry().sidebar, geometry().sidebar + 100);
assert(Math.round(geometry().sidebar) === 380, "left drag should update the sidebar width");
assert(Math.round(geometry().chat) === 420, "left drag should preserve the chat width");
assert(Math.round(geometry().divider) === Math.round(initialDivider), "left drag should preserve the right separator position");
assert(stored().sidebarWidth === 380 && stored().chatWidth === 420, "left drag should persist independent widths");
assert(stored().detailsWidth === undefined, "new persistence must not write detailsWidth");

const leftSeparator = geometry().sidebar;
const dividerBeforeChatDrag = geometry().divider;
dragChat(dividerBeforeChatDrag, dividerBeforeChatDrag - 80);
assert(Math.round(geometry().chat) === 500, "right drag should update the chat width");
assert(Math.round(geometry().sidebar) === Math.round(leftSeparator), "right drag should preserve the sidebar width");
assert(stored().sidebarWidth === 380 && stored().chatWidth === 500, "right drag should preserve the sidebar storage value");

dragSidebar(geometry().sidebar, geometry().sidebar + 5000);
assert(Math.round(geometry().sidebar) === 564, "left drag should clamp at the available desktop width");
assert(Math.round(geometry().chat) === 500, "left boundary clamping must not change the chat width");
dragChat(geometry().divider, geometry().divider + 5000);
assert(Math.round(geometry().chat) === 320, "right drag should clamp to the chat minimum");
assert(Math.round(geometry().sidebar) === 564, "chat minimum clamping must not change the sidebar width");
dragChat(geometry().divider, geometry().divider - 5000);
assert(Math.round(geometry().chat) === 500, "right drag should clamp to the details minimum");
assert(Math.round(geometry().sidebar) === 564, "details boundary clamping must not change the sidebar width");

context.setPaneSize("sidebarSessionHeight", 150);
context.savePaneSize("sidebarSessionHeight");
assert(stored().sidebarWidth === 564 && stored().chatWidth === 500, "session persistence must preserve both horizontal pane values");
const restored = context.loadPaneSizes();
assert(restored.sidebarWidth === 564 && restored.chatWidth === 500 && restored.sidebarSessionHeight === 150, "stored pane widths should restore as independent values");

const migrated = context.normalizePaneSizes({ sidebarWidth: 310, detailsWidth: 600, sidebarSessionHeight: 180 }, 1000);
assert(migrated.sidebarWidth === 310 && migrated.chatWidth === 392, "legacy details width should migrate to the visible chat width");
assert(migrated.detailsWidth === undefined, "migrated pane data should use semantic keys only");
const invalid = context.normalizePaneSizes({ sidebarWidth: -1, chatWidth: 0, sidebarSessionHeight: -5 }, 1000);
assert(invalid.sidebarWidth === 220 && invalid.chatWidth === 320 && invalid.sidebarSessionHeight === 84, "invalid pane data should fall back to minimum constraints");
const oversized = context.normalizePaneSizes({ sidebarWidth: 1e30, chatWidth: 1e30, sidebarSessionHeight: 1e30 }, 1000);
assert(oversized.sidebarWidth === 10000 && oversized.chatWidth === 10000 && oversized.sidebarSessionHeight === 10000, "oversized pane data should be bounded before reaching CSS");
`

	testFile := filepath.Join(t.TempDir(), "pane-resize.js")
	if err := os.WriteFile(testFile, []byte(script), 0o600); err != nil {
		t.Fatal(err)
	}
	appPath := filepath.Join("static", "app.js")
	if output, err := exec.Command(node, testFile, appPath).CombinedOutput(); err != nil {
		t.Fatalf("pane resize behavior test failed: %v\n%s", err, output)
	}
}

// assertBalancedCSSDelimiters rejects stylesheets with unbalanced (){}[] so a
// typo in a complex declaration cannot silently invalidate a whole rule again.
func assertBalancedCSSDelimiters(t *testing.T, styles string) {
	t.Helper()
	var stack []byte
	line := 1
	inComment := false
	var quote byte
	for i := 0; i < len(styles); i++ {
		c := styles[i]
		if c == '\n' {
			line++
		}
		if inComment {
			if c == '*' && i+1 < len(styles) && styles[i+1] == '/' {
				inComment = false
				i++
			}
			continue
		}
		if quote != 0 {
			if c == quote {
				quote = 0
			}
			continue
		}
		if c == '/' && i+1 < len(styles) && styles[i+1] == '*' {
			inComment = true
			i++
			continue
		}
		if c == '"' || c == '\'' {
			quote = c
			continue
		}
		switch c {
		case '(', '{', '[':
			stack = append(stack, c)
		case ')', '}', ']':
			if len(stack) == 0 {
				t.Fatalf("styles.css: unmatched %q at line %d", string(c), line)
			}
			open := stack[len(stack)-1]
			stack = stack[:len(stack)-1]
			matching := (open == '(' && c == ')') || (open == '{' && c == '}') || (open == '[' && c == ']')
			if !matching {
				t.Fatalf("styles.css: %q at line %d closes %q", string(c), line, string(open))
			}
		}
	}
	if len(stack) > 0 {
		t.Fatalf("styles.css: %d unclosed delimiter(s), last opened %q", len(stack), string(stack[len(stack)-1]))
	}
}
