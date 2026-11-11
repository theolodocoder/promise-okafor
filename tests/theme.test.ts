import test from "node:test";
import assert from "node:assert/strict";
import { resolveTheme, THEME_INIT_SCRIPT } from "../lib/theme.ts";

test("stored choice wins", () => {
  assert.equal(resolveTheme("light", true), "light");
  assert.equal(resolveTheme("dark", false), "dark");
});
test("no stored choice follows the system", () => {
  assert.equal(resolveTheme(null, true), "dark");
  assert.equal(resolveTheme(null, false), "light");
});
test("a junk stored value follows the system", () => {
  assert.equal(resolveTheme("blue", true), "dark");
  assert.equal(resolveTheme("", false), "light");
});
test("the init script lifts motion start states if Motion never starts", () => {
  assert.match(THEME_INIT_SCRIPT, /setTimeout\(.*"m".*"shown".*3000\)/);
});
