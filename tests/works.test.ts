import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { getAllWorks, getChildWorks, getWork, parseVisual } from "../lib/works.ts";
const dir = path.join(import.meta.dirname, "fixtures", "work");

test("parseVisual reads each kind", () => {
  assert.deepEqual(parseVisual("big: One | system"), { kind: "big", text: "One", accent: "system" });
  assert.deepEqual(parseVisual("bars: 254 KB | 86 | 181 KB | 61"), { kind: "bars", a: "254 KB", aPct: 86, b: "181 KB", bPct: 61 });
  assert.deepEqual(parseVisual("otp"), { kind: "otp" });
  assert.deepEqual(parseVisual("shot: /work/morrow.jpg | Morrow"), { kind: "shot", windows: [{ src: "/work/morrow.jpg", alt: "Morrow" }] });
  assert.deepEqual(parseVisual("shot: /a.jpg | A | /b.jpg | B"), { kind: "shot", windows: [{ src: "/a.jpg", alt: "A" }, { src: "/b.jpg", alt: "B" }] });
  assert.deepEqual(parseVisual("phones: /work/jobs.jpg | Jobs | /work/tracker.jpg | Tracker"), { kind: "phones", items: [{ src: "/work/jobs.jpg", alt: "Jobs" }, { src: "/work/tracker.jpg", alt: "Tracker" }] });
  assert.deepEqual(parseVisual("phones: /work/copilot.jpg | Copilot"), { kind: "phones", items: [{ src: "/work/copilot.jpg", alt: "Copilot" }] });
  assert.deepEqual(parseVisual("cover: /work/covers/x.jpg | X cover"), { kind: "cover", src: "/work/covers/x.jpg", alt: "X cover" });
});
test("parseVisual falls back to title", () => {
  for (const raw of [undefined, "", "hologram: x", "bars: a | notanumber | b | 5", "phones: /a.jpg", "shot: | no source", "cover: /only-src.jpg"]) assert.deepEqual(parseVisual(raw), { kind: "title" });
});
test("a bare file still loads with safe defaults", () => {
  const bare = getWork("bare", dir)!;
  assert.equal(bare.title, "Bare"); assert.equal(bare.backdrop, "sky"); assert.deepEqual(bare.visual, { kind: "title" }); assert.equal(bare.year, "");
});
test("children are listed under their parent, not at the top level", () => {
  assert.deepEqual(getChildWorks("good", dir).map((w) => w.slug), ["child"]);
  assert.equal(getAllWorks(dir).some((w) => w.slug === "child"), false);
  assert.equal(getWork("child", dir)!.parent, "good");
  assert.deepEqual(getWork("child", dir)!.phone, { src: "/p.jpg", alt: "Phone" });
  assert.deepEqual(getChildWorks("nobody", dir), []);
});
test("works sort by order and drafts show outside production", () => {
  assert.deepEqual(getAllWorks(dir).map((w) => w.slug), ["draft", "good", "bare"]);
});
test("drafts are skipped in production", () => {
  const env = process.env as Record<string, string | undefined>;
  const prev = env.NODE_ENV; env.NODE_ENV = "production";
  try { assert.deepEqual(getAllWorks(dir).map((w) => w.slug), ["good", "bare"]); assert.equal(getWork("draft", dir), undefined); }
  finally { env.NODE_ENV = prev; }
});
