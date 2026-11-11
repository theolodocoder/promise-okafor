import test from "node:test";
import assert from "node:assert/strict";
import { lagosTime, copyEmail } from "../lib/contact.ts";

test("lagosTime is UTC+1, 24 hour", () => {
  assert.equal(lagosTime(new Date("2026-11-11T09:59:00Z")), "10:59");
  assert.equal(lagosTime(new Date("2026-11-11T23:05:00Z")), "00:05");
});
test("copyEmail copies when the clipboard works", async () => {
  let got = ""; const r = await copyEmail({ writeText: async (t) => { got = t; } }, "a@b.c");
  assert.equal(r, "copied"); assert.equal(got, "a@b.c");
});
test("copyEmail falls back when the clipboard is missing or refuses", async () => {
  assert.equal(await copyEmail(undefined, "a@b.c"), "mailto");
  assert.equal(await copyEmail({ writeText: async () => { throw new Error("denied"); } }, "a@b.c"), "mailto");
});
