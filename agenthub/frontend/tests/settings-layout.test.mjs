import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const stylesPath = path.join(
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."),
  "src",
  "styles.css",
);

function rule(css, selector) {
  const start = css.indexOf(`${selector} {`);
  assert.notEqual(start, -1, `${selector} rule is missing`);
  const end = css.indexOf("}", start);
  assert.notEqual(end, -1, `${selector} rule is incomplete`);
  return css.slice(start, end);
}

test("settings close control keeps a mobile-sized touch target", async () => {
  const css = await readFile(stylesPath, "utf8");
  const titleTextRule = rule(css, ".settings-dialog-header > div");
  const closeRule = rule(css, ".settings-dialog-header > .icon-button");

  // The title and description must yield space before the close control is
  // compressed, allowing them to wrap without pushing the button off-screen.
  assert.match(titleTextRule, /flex: 1 1 auto;/);
  assert.match(titleTextRule, /min-width: 0;/);

  // Keep the visual X icon small while preserving a 44px touch surface.
  assert.match(closeRule, /flex: 0 0 44px;/);
  assert.match(closeRule, /min-width: 44px;/);
  assert.match(closeRule, /min-height: 44px;/);
  assert.match(closeRule, /width: 44px;/);
  assert.match(closeRule, /height: 44px;/);
});

test("agent reorder handle keeps a mobile-sized touch target", async () => {
  const css = await readFile(stylesPath, "utf8");
  const handleRule = rule(css, ".settings-drag-handle");

  // Keep the drag icon visually compact while making the entire draggable
  // surface reachable on narrow touch screens. The fixed flex basis also
  // prevents the handle from being compressed by long agent summaries.
  assert.match(handleRule, /flex: 0 0 44px;/);
  assert.match(handleRule, /min-width: 44px;/);
  assert.match(handleRule, /min-height: 44px;/);
  assert.match(handleRule, /width: 44px;/);
  assert.match(handleRule, /height: 44px;/);
});

test("settings footer actions keep a mobile-sized touch target", async () => {
  const css = await readFile(stylesPath, "utf8");
  const footerActionsRule = rule(css, ".settings-savebar-actions .settings-button");

  // Keep Cancel and Save all easy to tap in the narrowest supported viewport
  // without changing their save/close behavior or the footer layout.
  assert.match(footerActionsRule, /min-height: 44px;/);
});

test("agent delete controls keep a mobile-sized touch target", async () => {
  const css = await readFile(stylesPath, "utf8");
  const deleteRule = rule(css, ".settings-card-head > .icon-button");

  // Reserve the full touch target in the card head without changing the
  // compact trash icon or the size of unrelated settings icon buttons.
  assert.match(deleteRule, /flex: 0 0 44px;/);
  assert.match(deleteRule, /min-width: 44px;/);
  assert.match(deleteRule, /min-height: 44px;/);
  assert.match(deleteRule, /width: 44px;/);
  assert.match(deleteRule, /height: 44px;/);
});
