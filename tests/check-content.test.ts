import test from "node:test";
import assert from "node:assert/strict";
import { findCodeProblems, findProblems } from "../scripts/check-content.mjs";

test("flags em dashes with the line number", () => {
  assert.deepEqual(findProblems("fine\nnot fine — here"), [{ line: 2, problem: "em dash" }]);
});
test("flags banned words as whole words only", () => {
  assert.equal(findProblems("a robust plan")[0].problem, 'banned word "robust"');
  assert.deepEqual(findProblems("the Robustness score, a locksmith"), []);
});
test("clean text passes", () => { assert.deepEqual(findProblems("I built it. It works."), []); });
test("code fences are skipped", () => { assert.deepEqual(findProblems("```\nconst journey = 1;\n```"), []); });
test("source files: em dashes in strings and JSX text are flagged, comments are not", () => {
  const src = 'const a = "fine";\nconst name = "A \u2014 B";\n// a \u2014 note\n/* one\n \u2014 two */\n<p>x \u2014 y</p>';
  assert.deepEqual(findCodeProblems(src), [{ line: 2, problem: "em dash" }, { line: 6, problem: "em dash" }]);
});
