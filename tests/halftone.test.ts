import test from "node:test";
import assert from "node:assert/strict";
import { findBackdrop, dotValue } from "../lib/halftone.ts";

// 5x5: dark border ring (0.0), bright ring (0.8), one dark pixel in the middle (0.0)
const lum = new Float32Array([0,0,0,0,0, 0,.8,.8,.8,0, 0,.8,0,.8,0, 0,.8,.8,.8,0, 0,0,0,0,0]);

test("edge-connected dark pixels are backdrop, enclosed dark pixels are not", () => {
  const b = findBackdrop(lum, 5, 5);
  assert.equal(b[0], 1); assert.equal(b[4], 1); assert.equal(b[24], 1);
  assert.equal(b[6], 0);   // bright
  assert.equal(b[12], 0);  // dark but enclosed, so it is part of the subject
});
test("an all-bright image has no backdrop", () => {
  assert.equal(findBackdrop(new Float32Array(9).fill(0.9), 3, 3).reduce((a, v) => a + v, 0), 0);
});
test("dotValue on a dark page follows brightness", () => {
  assert.equal(dotValue(0.05, false, true), 0);
  assert.ok(Math.abs(dotValue(0.5, false, true) - 0.559) < 0.001);
  assert.equal(dotValue(1, false, true), 1);
});
test("dotValue on a light page follows darkness and empties the backdrop", () => {
  assert.equal(dotValue(0, true, false), 0);
  assert.equal(dotValue(0, false, false), 1);
  assert.ok(Math.abs(dotValue(0.5, false, false) - 0.5) < 0.001);
  assert.equal(dotValue(0.95, false, false), 0);
});
