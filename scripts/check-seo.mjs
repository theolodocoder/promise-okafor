// Checks the built site in out/: every page has one canonical, one og:image that exists in out/,
// one twitter:card and parseable JSON-LD; the sitemap, RSS and JSON feeds parse and list no missing page.
// Run after `npm run build`: npm run check:seo
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const OUT = "out";
const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://promise-okafor.vercel.app").replace(/\/$/, "");
const problems = [];
const warn = [];
const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]));
const decode = (s) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const local = (url) => (url.startsWith(SITE) ? join(OUT, decodeURIComponent(url.slice(SITE.length).split(/[?#]/)[0])) : undefined);
const exists = (url) => { const f = local(url); return f && existsSync(f.endsWith("/") ? join(f, "index.html") : f); };
const metas = (html, attr, key) => [...html.matchAll(new RegExp(`<meta ${attr}="${key}" content="([^"]*)"`, "g"))].map((m) => decode(m[1]));

const pages = walk(OUT).filter((f) => f.endsWith(".html") && !/(^|\/)(404|_not-found)(\/|\.html|$)/.test(f.slice(OUT.length + 1)) && !/(^|\/)google[0-9a-f]+\.html$/.test(f));
for (const file of pages) {
  const html = readFileSync(file, "utf8");
  const say = (msg) => problems.push(`${file}: ${msg}`);
  const canon = [...html.matchAll(/<link rel="canonical" href="([^"]*)"/g)].map((m) => m[1]);
  if (canon.length !== 1) say(`${canon.length} canonical links`);
  else if (!canon[0].startsWith(`${SITE}/`) || !canon[0].endsWith("/")) say(`canonical ${canon[0]} is not an absolute ${SITE} URL with a trailing slash`);
  const ogUrl = metas(html, "property", "og:url");
  if (ogUrl.length !== 1 || ogUrl[0] !== canon[0]) say(`og:url ${ogUrl.join(", ")} does not match the canonical`);
  const images = metas(html, "property", "og:image");
  if (images.length !== 1) say(`${images.length} og:image tags`);
  else if (!exists(images[0])) say(`og:image ${images[0]} is not in out/`);
  if (metas(html, "property", "og:image:alt").length !== 1) say("no og:image:alt");
  if (metas(html, "name", "twitter:card").length !== 1) say("twitter:card is not exactly one tag");
  const twImage = metas(html, "name", "twitter:image");
  if (twImage.length !== 1 || !exists(twImage[0])) say(`twitter:image ${twImage.join(", ")} missing or not in out/`);
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (!blocks.length) say("no JSON-LD");
  for (const [, json] of blocks) { try { JSON.parse(json); } catch (e) { say(`JSON-LD does not parse: ${e.message}`); } }
  if (html.includes("\u2014")) say("em dash in the page");
  const title = decode(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "");
  const desc = metas(html, "name", "description")[0] ?? "";
  if (!title) say("no title");
  if (!desc) say("no meta description");
  if (title.length > 60) warn.push(`${file}: title is ${title.length} characters`);
  if (desc.length > 155) warn.push(`${file}: description is ${desc.length} characters`);
}

// titles and descriptions should be unique across pages
for (const tag of [/<title>([^<]*)<\/title>/, /<meta name="description" content="([^"]*)"/]) {
  const seen = new Map();
  for (const file of pages) { const v = readFileSync(file, "utf8").match(tag)?.[1]; if (v) seen.set(v, [...(seen.get(v) ?? []), file]); }
  for (const [v, files] of seen) if (files.length > 1) problems.push(`duplicate "${v}" on ${files.join(", ")}`);
}

// feeds and sitemap: well formed, and every URL in them is a built page
const xmlOk = (name) => {
  const xml = readFileSync(join(OUT, name), "utf8");
  // no XML parser without a dependency: check every tag closes in order
  const stack = [];
  for (const [, close, tag, self] of xml.replace(/<\?[\s\S]*?\?>|<!\[CDATA\[[\s\S]*?\]\]>/g, "").matchAll(/<(\/?)([\w:.-]+)(?:\s[^>]*?)?(\/?)>/g)) {
    if (self) continue;
    if (!close) stack.push(tag);
    else if (stack.pop() !== tag) { problems.push(`${name}: </${tag}> closes the wrong tag`); return xml; }
  }
  if (stack.length) problems.push(`${name}: unclosed <${stack.at(-1)}>`);
  return xml;
};
const sitemap = xmlOk("sitemap.xml");
const locs = [...sitemap.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]);
const imgs = [...sitemap.matchAll(/<image:loc>([^<]*)<\/image:loc>/g)].map((m) => m[1]);
for (const url of [...locs, ...imgs]) if (!exists(url)) problems.push(`sitemap.xml: ${url} is not in out/`);
if (locs.length !== pages.length) problems.push(`sitemap.xml lists ${locs.length} pages, out/ has ${pages.length}`);
if (imgs.length !== locs.length) problems.push(`sitemap.xml has ${imgs.length} images for ${locs.length} pages`);
if ((sitemap.match(/<lastmod>/g) ?? []).length !== locs.length) problems.push("sitemap.xml: a page has no lastmod");
const rss = xmlOk("blog/rss.xml");
for (const [, url] of rss.matchAll(/<link>([^<]*)<\/link>|<enclosure url="([^"]*)"/g)) if (url && !exists(url)) problems.push(`rss.xml: ${url} is not in out/`);
try {
  const feed = JSON.parse(readFileSync(join(OUT, "blog/feed.json"), "utf8"));
  for (const item of feed.items) for (const url of [item.url, item.image]) if (!exists(url)) problems.push(`feed.json: ${url} is not in out/`);
  const rssCount = (rss.match(/<item>/g) ?? []).length;
  if (feed.items.length !== rssCount) problems.push(`feed.json has ${feed.items.length} items, rss.xml has ${rssCount}`);
} catch (e) { problems.push(`feed.json: ${e.message}`); }
// a draft never reaches out/, the sitemap or the feeds
for (const [dir, route] of [["content/posts", "blog"], ["content/work", "work"]]) {
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".md"))) {
    if (!/^draft:\s*true\s*$/m.test(readFileSync(join(dir, f), "utf8").split("\n---\n")[0])) continue;
    const url = `${SITE}/${route}/${f.replace(/\.md$/, "")}/`;
    if (exists(url) || sitemap.includes(url) || rss.includes(url)) problems.push(`draft ${f} is published`);
  }
}
const robots = readFileSync(join(OUT, "robots.txt"), "utf8");
if (!robots.includes(`Sitemap: ${SITE}/sitemap.xml`) || !/Allow: \//.test(robots)) problems.push("robots.txt does not allow all and point at the sitemap");

warn.forEach((w) => console.warn(`warn ${w}`));
if (problems.length) { console.error(problems.join("\n")); process.exit(1); }
console.log(`SEO checks passed: ${pages.length} pages, ${locs.length} sitemap URLs, ${feedCount()} feed items`);
function feedCount() { return JSON.parse(readFileSync(join(OUT, "blog/feed.json"), "utf8")).items.length; }
