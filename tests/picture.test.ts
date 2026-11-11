import test from "node:test";
import assert from "node:assert/strict";
import { SIZES, picture, pictureHtml } from "../lib/picture.ts";

test("picture lists every made width per format, the 960 JPEG fallback and the source size", () => {
  assert.deepEqual(picture("/work/covers/jobwhisper.jpg", SIZES.halfTile), {
    avif: "/work/covers/jobwhisper.640.avif 640w, /work/covers/jobwhisper.960.avif 960w, /work/covers/jobwhisper.1600.avif 1600w",
    webp: "/work/covers/jobwhisper.640.webp 640w, /work/covers/jobwhisper.960.webp 960w, /work/covers/jobwhisper.1600.webp 1600w",
    src: "/work/covers/jobwhisper.960.jpg", width: 1600, height: 1000, sizes: SIZES.halfTile,
  });
  // a source narrower than every width is never upscaled
  assert.equal(picture("/work/jobs.jpg", SIZES.tilePhone)?.avif, "/work/jobs.414.avif 414w");
  assert.equal(picture("/nope.jpg", SIZES.figure), undefined);
});
test("pictureHtml is lazy by default and high priority for the lead", () => {
  const lazy = pictureHtml("/work/jobs.jpg", "", SIZES.figurePhone);
  assert.ok(lazy.startsWith('<picture><source type="image/avif" srcset="/work/jobs.414.avif 414w" sizes="(max-width: 800px) 27vw, 190px" />'));
  assert.ok(lazy.endsWith('<img src="/work/jobs.414.jpg" alt="" width="414" height="900" loading="lazy" decoding="async" /></picture>'));
  assert.ok(pictureHtml("/work/jobs.jpg", "", SIZES.figurePhone, true).includes('height="900" fetchpriority="high" />'));
});
