// Responsive variants for every screenshot and cover. Run locally after adding or replacing one: npm run images.
// Sources live in images/ (not published); images/work/x.jpg becomes public/work/x.<w>.avif|webp for each
// width in WIDTHS no larger than the source (plus the source width when it falls between), and one
// public/work/x.<w>.jpg fallback at 960 (or the source width when smaller). lib/image-manifest.ts records the
// size and widths of each so lib/picture.ts can write srcset, sizes, width and height.
// Uses macOS tools only: sips (resize, AVIF, JPEG) and cwebp (Homebrew).
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "images");
const WIDTHS = [640, 960, 1600];
const FALLBACK = 960;
// picked by eye at 100 percent: screenshot body text stays crisp at 960 wide
const Q = { avif: 40, webp: 70, jpg: 55 }; // the JPEG is only for browsers with neither AVIF nor WebP
const CWEBP = fs.existsSync("/opt/homebrew/bin/cwebp") ? "/opt/homebrew/bin/cwebp" : "cwebp";

const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(dir, e.name)) : /\.(jpe?g|png)$/i.test(e.name) ? [path.join(dir, e.name)] : []);
const size = (file) => {
  const out = execFileSync("sips", ["-g", "pixelWidth", "-g", "pixelHeight", file], { encoding: "utf8" });
  return { width: Number(out.match(/pixelWidth: (\d+)/)[1]), height: Number(out.match(/pixelHeight: (\d+)/)[1]) };
};
// skip work already done: the output exists and is newer than its source
const fresh = (out, src) => fs.existsSync(out) && fs.statSync(out).mtimeMs >= fs.statSync(src).mtimeMs;

const manifest = {};
for (const src of walk(SRC).sort()) {
  const rel = "/" + path.relative(SRC, src).split(path.sep).join("/");
  const base = path.join(ROOT, "public", rel.replace(/\.\w+$/, ""));
  fs.mkdirSync(path.dirname(base), { recursive: true });
  const { width, height } = size(src);
  const widths = [...new Set([...WIDTHS.filter((w) => w < width), Math.min(width, WIDTHS.at(-1))])];
  const fallback = Math.min(width, FALLBACK);
  for (const w of widths) {
    const avif = `${base}.${w}.avif`, webp = `${base}.${w}.webp`;
    // sips writes an AVIF with an odd height that Chrome decodes as fully transparent: round the height down to even
    const h = Math.round((height * w) / width) & ~1;
    if (!fresh(avif, src)) execFileSync("sips", ["-z", String(h), String(w), "-s", "format", "avif", "-s", "formatOptions", String(Q.avif), src, "--out", avif], { stdio: "ignore" });
    if (!fresh(webp, src)) execFileSync(CWEBP, ["-quiet", "-metadata", "none", "-q", String(Q.webp), "-resize", String(w), "0", src, "-o", webp]);
  }
  const jpg = `${base}.${fallback}.jpg`;
  if (!fresh(jpg, src)) execFileSync("sips", ["--resampleWidth", String(fallback), "-s", "format", "jpeg", "-s", "formatOptions", String(Q.jpg), src, "--out", jpg], { stdio: "ignore" });
  manifest[rel] = { width, height, widths, fallback };
  console.log(rel, widths.join(" "));
}

fs.writeFileSync(path.join(ROOT, "lib/image-manifest.ts"), `// Written by scripts/images.mjs (npm run images). Do not edit by hand.
export type ImageEntry = { width: number; height: number; widths: number[]; fallback: number };
export const images: Record<string, ImageEntry> = ${JSON.stringify(manifest, null, 2)};
`);
