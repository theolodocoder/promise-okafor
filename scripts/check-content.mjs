import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const BANNED = ["leverage", "utilize", "seamless", "robust", "passionate", "thrilled", "delve", "game-changer", "cutting-edge", "synergy", "unlock", "elevate", "empower", "journey", "landscape", "ecosystem"];
const WORD = new RegExp(`(?<![\\w-])(${BANNED.join("|")})(?![\\w-])`, "gi");

export function findProblems(text) {
  const out = [];
  let fenced = false;
  text.split("\n").forEach((line, i) => {
    if (/^\s*(```|~~~)/.test(line)) { fenced = !fenced; return; }
    if (fenced) return;
    if (line.includes("—")) out.push({ line: i + 1, problem: "em dash" });
    for (const m of line.matchAll(WORD)) out.push({ line: i + 1, problem: `banned word "${m[1].toLowerCase()}"` });
  });
  return out;
}

// source files: an em dash anywhere outside a comment line (string literal or JSX text) reaches the page
export function findCodeProblems(text) {
  const out = [];
  let block = false;
  text.split("\n").forEach((line, i) => {
    const t = line.trim();
    if (block) { if (t.includes("*/")) block = false; return; }
    if (t.startsWith("/*")) { block = !t.includes("*/"); return; }
    if (t.startsWith("//")) return;
    if (line.includes("\u2014")) out.push({ line: i + 1, problem: "em dash" });
  });
  return out;
}

const walk = (dir, ext) => readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? walk(join(dir, e.name), ext) : ext.test(e.name) ? [join(dir, e.name)] : []);

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const report = (files, check) => files.flatMap((f) => check(readFileSync(f, "utf8")).map((p) => `${f}:${p.line} ${p.problem}`));
  const found = [
    ...report(walk("content", /\.md$/), findProblems),
    ...report(["app", "components", "lib"].flatMap((d) => walk(d, /\.tsx?$/)), findCodeProblems),
  ];
  if (found.length) { console.error(found.join("\n")); process.exit(1); }
}
