import fs from "node:fs";
import path from "node:path";
import { parseFrontmatter, renderMarkdown } from "./blog.ts";

export type WorkVisual =
  | { kind: "big"; text: string; accent: string }
  | { kind: "bars"; a: string; aPct: number; b: string; bPct: number }
  | { kind: "otp" }
  | { kind: "shot"; windows: Array<{ src: string; alt: string }> }
  | { kind: "phones"; items: Array<{ src: string; alt: string }> }
  | { kind: "cover"; src: string; alt: string }
  | { kind: "title" };
export type Backdrop = "sky" | "cream" | "mist" | "lavender";
export type WorkMeta = { slug: string; title: string; subtitle: string; line: string; field: string; year: string; backdrop: Backdrop; visual: WorkVisual; phone?: { src: string; alt: string }; parent?: string; order: number; draft: boolean };
export type Work = WorkMeta & { html: string };

const workDirectory = path.join(process.cwd(), "content", "work");
const backdrops: Backdrop[] = ["sky", "cream", "mist", "lavender"];

// "src | alt | src | alt" into up to two images; undefined when malformed.
function parseImages(parts: string[]) {
  if (parts.length < 2 || parts.length > 4 || parts.length % 2 || parts.some((part) => !part)) return undefined;
  const images: Array<{ src: string; alt: string }> = [];
  for (let i = 0; i < parts.length; i += 2) images.push({ src: parts[i], alt: parts[i + 1] });
  return images;
}

export function parseVisual(raw: string | undefined): WorkVisual {
  const title: WorkVisual = { kind: "title" };
  if (!raw) return title;
  const colon = raw.indexOf(":");
  const kind = (colon === -1 ? raw : raw.slice(0, colon)).trim();
  const parts = colon === -1 ? [] : raw.slice(colon + 1).split("|").map((part) => part.trim());
  if (kind === "otp") return { kind: "otp" };
  if (kind === "big" && parts.length === 2 && parts[0] && parts[1]) return { kind: "big", text: parts[0], accent: parts[1] };
  if (kind === "bars" && parts.length === 4) {
    const [aPct, bPct] = [Number(parts[1]), Number(parts[3])];
    if (parts[0] && parts[2] && Number.isFinite(aPct) && Number.isFinite(bPct)) return { kind: "bars", a: parts[0], aPct, b: parts[2], bPct };
  }
  if (kind === "cover") {
    const cover = parts.length === 2 ? parseImages(parts)?.[0] : undefined;
    if (cover) return { kind, ...cover };
  }
  if (kind === "shot" || kind === "phones") {
    const images = parseImages(parts);
    if (images) return kind === "shot" ? { kind, windows: images } : { kind, items: images };
  }
  return title;
}

function parseWork(fileName: string, dir: string): Work {
  const slug = fileName.replace(/\.md$/, "");
  const { attributes, content } = parseFrontmatter(fs.readFileSync(path.join(dir, fileName), "utf8"));
  const backdrop = attributes.get("backdrop") as Backdrop;
  const phone = parseImages((attributes.get("phone") ?? "").split("|").map((part) => part.trim()))?.[0];
  const order = Number(attributes.get("order"));
  return {
    slug,
    title: attributes.get("title") ?? slug,
    subtitle: attributes.get("subtitle") ?? "",
    line: attributes.get("line") ?? "",
    field: attributes.get("field") ?? "",
    year: attributes.get("year") ?? "",
    backdrop: backdrops.includes(backdrop) ? backdrop : "sky",
    visual: parseVisual(attributes.get("visual")),
    phone,
    parent: attributes.get("parent") || undefined,
    order: attributes.get("order") && Number.isFinite(order) ? order : 999,
    draft: attributes.get("draft") === "true",
    html: renderMarkdown(content),
  };
}

function loadAll(dir: string) {
  if (!fs.existsSync(dir)) return [];
  const hideDrafts = process.env.NODE_ENV === "production";
  return fs.readdirSync(dir).filter((file) => file.endsWith(".md")).map((file) => parseWork(file, dir)).filter((work) => !(work.draft && hideDrafts)).sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));
}

const meta = ({ html, ...rest }: Work): WorkMeta => rest;

export function getAllWorks(dir = workDirectory): WorkMeta[] {
  return loadAll(dir).filter((work) => !work.parent).map(meta);
}

export function getChildWorks(parent: string, dir = workDirectory): WorkMeta[] {
  return loadAll(dir).filter((work) => work.parent === parent).map(meta);
}

export function getWork(slug: string, dir = workDirectory): Work | undefined {
  return loadAll(dir).find((work) => work.slug === slug);
}
