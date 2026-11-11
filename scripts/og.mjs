// Share images (1200x630 PNG) for every published page, rendered with headless Chrome.
// Run locally after adding or retitling a page: npm run og. Writes public/og/<path>.png.
import { execFile } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";

process.env.NODE_ENV = "production"; // drafts are hidden, as in the build
const { getAllPosts, formatPostDate } = await import("../lib/blog.ts");
const { getAllWorks, getChildWorks } = await import("../lib/works.ts");
const { findBackdrop, dotValue } = await import("../lib/halftone.ts");

const CHROME = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const ROOT = process.cwd();
const URL_LABEL = "promise-okafor.vercel.app";
const run = promisify(execFile);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const file = (p) => pathToFileURL(join(ROOT, p)).href;
const dataUrl = (p, type) => `data:${type};base64,${readFileSync(join(ROOT, p)).toString("base64")}`;

const CSS = `
@font-face { font-family: Figtree; src: url(${file("app/fonts/figtree-latin.woff2")}); font-weight: 400 600; }
@font-face { font-family: Serif; src: url(${file("app/fonts/instrument-serif-italic-latin.woff2")}); font-style: italic; }
* { box-sizing: border-box; margin: 0; }
html, body { width: 1200px; height: 630px; overflow: hidden; }
body { font-family: Figtree, sans-serif; color: #E9EDF3; background: #0B1220 repeating-linear-gradient(to bottom, rgba(233,237,243,.06) 0 1px, transparent 1px 7px); }
i { font-family: Serif, Georgia, serif; font-style: italic; font-weight: 400; color: #7AA7FF; letter-spacing: -.01em; }
.panel { position: absolute; inset: 36px 48px; background: #0B1220; border: 1px solid #243049; display: flex; flex-direction: column; }
.x { position: absolute; width: 15px; height: 15px; color: #93A0B5; font-size: 18px; line-height: 15px; text-align: center; transform: translate(-50%, -50%); }
.body { flex: 1; min-height: 0; display: flex; gap: 48px; padding: 52px 56px 36px; }
.text { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.eyebrow { font-size: 22px; color: #93A0B5; letter-spacing: .01em; }
.eyebrow b { color: #7AA7FF; font-weight: 600; }
h1 { flex: 1; min-height: 0; overflow: hidden; margin-top: 22px; font-weight: 600; letter-spacing: -.035em; line-height: 1.04; font-size: 76px; }
h1 i { font-size: 1.08em; }
.line { margin-top: 18px; font-size: 24px; line-height: 1.35; color: #93A0B5; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 3; overflow: hidden; }
/* a headline with nothing under it sits on the bottom rule */
.end h1 { display: flex; align-items: flex-end; }
.foot { position: relative; height: 86px; border-top: 1px solid #243049; display: flex; align-items: center; justify-content: space-between; padding: 0 56px; font-size: 23px; color: #93A0B5; }
.foot .name { color: #E9EDF3; font-weight: 600; }
.foot .name::after { content: "."; color: #7AA7FF; }
.foot i { font-size: 28px; }
.card { align-self: center; width: 470px; flex: none; padding: 10px; border: 1px solid #243049; border-radius: 14px; background: #111A2E; }
.card img { display: block; width: 100%; aspect-ratio: 16 / 10; object-fit: cover; border-radius: 8px; }
canvas { flex: none; align-self: center; }
`;

// a corner cross wherever a rule meets the frame
const crosses = (corners) => corners.map(([x, y]) => `<span class="x" style="left:${x}%;top:${y}%">+</span>`).join("");

function scene({ eyebrow, title, line, aside = "", label }) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>
<div class="panel">${crosses([[0, 0], [100, 0], [0, 100], [100, 100]])}
  <div class="body${line ? "" : " end"}"><div class="text"><p class="eyebrow">${eyebrow}</p><h1><span>${title}</span></h1>${line ? `<p class="line">${esc(line)}</p>` : ""}</div>${aside}</div>
  <div class="foot">${crosses([[0, 0], [100, 0]])}<span class="name">Promise Okafor</span><span>${label}</span></div>
</div>
<script>
// shrink the headline until it fits its box, then let the screenshot happen
document.fonts.ready.then(() => {
  const h = document.querySelector("h1");
  let size = parseFloat(getComputedStyle(h).fontSize);
  while (h.firstChild.offsetHeight > h.clientHeight + 1 && size > 30) h.style.fontSize = (size -= 2) + "px";
  document.title = "ready";
});
</script></body></html>`;
}

// the home portrait: the same halftone as components/portrait.tsx (dark theme), drawn once
const portraitScript = (w, h) => `<canvas id="p" width="${w}" height="${h}" role="img"></canvas><script>
const findBackdrop = ${findBackdrop.toString()};
const dotValue = ${dotValue.toString()};
const img = new Image();
img.onload = () => {
  const o = document.createElement("canvas"); const iw = o.width = img.width, ih = o.height = img.height;
  const c = o.getContext("2d"); c.drawImage(img, 0, 0);
  const data = c.getImageData(0, 0, iw, ih).data, lum = new Float32Array(iw * ih);
  for (let i = 0; i < lum.length; i++) lum[i] = data[i * 4] / 255;
  const back = findBackdrop(lum, iw, ih), cv = document.getElementById("p"), ctx = cv.getContext("2d"), CELL = 7;
  const w = cv.width, h = cv.height, sc = Math.max(w / iw, h / ih), ox = (w - iw * sc) * .5, oy = (h - ih * sc) * .32;
  ctx.fillStyle = "rgb(157,185,255)";
  for (let y = CELL / 2; y < h; y += CELL) for (let x = CELL / 2; x < w; x += CELL) {
    const sx = Math.floor((x - ox) / sc), sy = Math.floor((y - oy) / sc);
    if (sx < 0 || sy < 0 || sx >= iw || sy >= ih) continue;
    const v = dotValue(lum[sy * iw + sx], back[sy * iw + sx] === 1, true);
    if (v < .04) continue;
    ctx.beginPath(); ctx.arc(x, y, CELL * (.1 + .42 * Math.sqrt(v)), 0, Math.PI * 2); ctx.fill();
  }
};
img.src = "${dataUrl("public/portrait-220.jpg", "image/jpeg")}";
</script>`;

const year = (iso) => formatPostDate(iso);
const pages = [
  {
    out: "home",
    html: scene({
      eyebrow: "Lead Frontend Engineer, <b>Lagos</b>",
      title: "I build frontends teams do not have to <i>undo</i>.",
      line: "Web, desktop and mobile.",
      aside: portraitScript(330, 380),
      label: URL_LABEL,
    }),
  },
  {
    out: "blog",
    html: scene({ eyebrow: "<b>Writings</b>", title: "Frontend decisions I have made, and what <i>happened</i> after.", label: URL_LABEL }),
  },
  ...getAllPosts().map((post) => ({
    out: `blog/${post.slug}`,
    html: scene({ eyebrow: `<b>${esc(post.category)}</b>, ${esc(year(post.publishedAt))}`, title: esc(post.title), label: "<i>Writings</i>" }),
  })),
  ...getAllWorks().flatMap((work) => [work, ...getChildWorks(work.slug)]).map((work) => {
    const cover = work.visual.kind === "cover" ? work.visual.src : undefined;
    return {
      out: `work/${work.slug}`,
      html: scene({
        eyebrow: `<b>${esc(work.field)}</b>${work.parent ? ", JobWhisper" : ""}`,
        title: esc(work.title),
        line: work.line,
        aside: cover ? `<div class="card"><img src="${file(`images${cover}`)}" alt=""></div>` : "",
        label: "<i>Case study</i>",
      }),
    };
  }),
];

const tmp = mkdtempSync(join(tmpdir(), "og-"));
async function render({ out, html }) {
  const page = join(tmp, `${out.replaceAll("/", "__")}.html`);
  const png = join(ROOT, "public/og", `${out}.png`);
  writeFileSync(page, html);
  mkdirSync(dirname(png), { recursive: true });
  await run(CHROME, [
    "--headless=new", "--hide-scrollbars", "--force-device-scale-factor=1", "--allow-file-access-from-files",
    "--window-size=1200,630", "--virtual-time-budget=4000", `--user-data-dir=${join(tmp, `profile-${out.replaceAll("/", "__")}`)}`,
    `--screenshot=${png}`, pathToFileURL(page).href,
  ], { timeout: 60_000 });
  console.log(`public/og/${out}.png`);
}

try {
  const queue = [...pages];
  await Promise.all(Array.from({ length: 4 }, async () => { while (queue.length) await render(queue.shift()); }));
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
