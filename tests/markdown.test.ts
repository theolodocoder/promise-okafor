import test from "node:test";
import assert from "node:assert/strict";
import { renderMarkdown } from "../lib/blog.ts";

test("a figure block passes through untouched", () => {
  const fig = '<figure class="wide">\n<div class="flow"><div><b>Throttle</b>Upload capped</div></div>\n<figcaption>The test rig.</figcaption>\n</figure>';
  const html = renderMarkdown("Before.\n\n" + fig + "\n\nAfter.");
  assert.ok(html.includes(fig)); assert.ok(html.includes("<p>Before.</p>")); assert.ok(html.includes("<p>After.</p>"));
});
test("an unclosed figure stops at the first blank line", () => {
  const html = renderMarkdown('<figure class="wide">\n<div class="flow"></div>\n\nAfter **this**.\n\n## Next');
  assert.ok(html.includes("<p>After <strong>this</strong>.</p>")); assert.ok(html.includes('<h2 id="next">Next</h2>'));
});
test("a block image becomes a screenshot stage", () => {
  const sizes = "(max-width: 800px) 100vw, 840px";
  assert.ok(renderMarkdown('Intro.\n\n![The Cosella website](/work/cosella.jpg "mist")').includes(`<figure class="stage"><div class="frame bd-mist"><div class="win"><picture><source type="image/avif" srcset="/work/cosella.640.avif 640w, /work/cosella.960.avif 960w, /work/cosella.1100.avif 1100w" sizes="${sizes}" /><source type="image/webp" srcset="/work/cosella.640.webp 640w, /work/cosella.960.webp 960w, /work/cosella.1100.webp 1100w" sizes="${sizes}" /><img src="/work/cosella.960.jpg" alt="" width="1100" height="618" loading="lazy" decoding="async" /></picture></div></div><figcaption>The Cosella website</figcaption></figure>`));
  assert.ok(renderMarkdown('Intro.\n\n![Copilot](/work/copilot.jpg "lavender phone")').includes('<div class="frame bd-lavender"><div class="phone"><picture><source type="image/avif" srcset="/work/copilot.414.avif 414w" sizes="(max-width: 800px) 27vw, 190px" />'));
  assert.ok(renderMarkdown("![Plain](/a.jpg)").includes('<div class="frame bd-sky"><div class="win"><img src="/a.jpg" alt="" fetchpriority="high" /></div>'));
  assert.ok(renderMarkdown('![Odd](/a.jpg "neon")').includes('<div class="frame bd-sky"><div class="win">'));
});
test("only a stage that opens the document loads eagerly", () => {
  const first = renderMarkdown('![Lead](/work/cosella.jpg)\n\n![Later](/work/cosella.jpg)');
  assert.equal(first.match(/fetchpriority="high"/g)?.length, 1);
  assert.ok(first.indexOf('fetchpriority="high"') < first.indexOf('loading="lazy"'));
});
test("other raw html is still escaped", () => {
  assert.ok(renderMarkdown("<script>alert(1)</script>").includes("&lt;script&gt;"));
});
test("inline link and image URLs with a query string are escaped once", () => {
  const html = renderMarkdown("See [docs](https://example.com/a?x=1&y=2) and ![chart](/c.png?w=1&h=2) inline.");
  assert.ok(html.includes('<a href="https://example.com/a?x=1&amp;y=2" target="_blank" rel="noreferrer">docs</a>'));
  assert.ok(html.includes('<img src="/c.png?w=1&amp;h=2" alt="chart" loading="lazy" />'));
  assert.ok(!html.includes("&amp;amp;"));
});
