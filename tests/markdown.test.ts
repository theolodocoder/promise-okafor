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
  assert.ok(renderMarkdown('![The Cosella website](/work/cosella.jpg "mist")').includes('<figure class="stage"><div class="frame bd-mist"><div class="win"><img src="/work/cosella.jpg" alt="" loading="lazy" /></div></div><figcaption>The Cosella website</figcaption></figure>'));
  assert.ok(renderMarkdown('![Copilot](/work/copilot.jpg "lavender phone")').includes('<div class="frame bd-lavender"><div class="phone"><img src="/work/copilot.jpg" alt="" loading="lazy" /></div></div>'));
  assert.ok(renderMarkdown("![Plain](/a.jpg)").includes('<div class="frame bd-sky"><div class="win">'));
  assert.ok(renderMarkdown('![Odd](/a.jpg "neon")').includes('<div class="frame bd-sky"><div class="win">'));
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
