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
  assert.match(closeRule, /width: 44px;/);
  assert.match(closeRule, /height: 44px;/);
});
