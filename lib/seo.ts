import { execFileSync } from "node:child_process";
import type { Metadata } from "next";
import { PERSON_ID, SITE_NAME, SITE_URL, SOCIAL_LINKS, absoluteUrl } from "./site.ts";

const BUILD_DATE = new Date().toISOString();

/** Last commit date of a repo file, or the build date when git or history is missing (Vercel may build without it). */
export function lastModified(file: string) {
  try {
    return execFileSync("git", ["log", "-1", "--format=%cI", "--", file], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim() || BUILD_DATE;
  } catch {
    return BUILD_DATE;
  }
}

/** The share image made by scripts/og.mjs for a page path: "/" is og/home.png, "/blog/x/" is og/blog/x.png. */
export function ogImage(pathname: string) {
  return pathname === "/" ? "/og/home.png" : `/og${pathname.replace(/\/$/, "")}.png`;
}

/** Plain text cut at a word to fit a meta description. */
export function clip(text: string, max = 155) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,.;:]$/, "")}…`;
}

export const FEEDS = {
  "application/rss+xml": [{ url: absoluteUrl("/blog/rss.xml"), title: "Writings by Promise Okafor (RSS)" }],
  "application/feed+json": [{ url: absoluteUrl("/blog/feed.json"), title: "Writings by Promise Okafor (JSON Feed)" }],
};

/** The author, as every page's JSON-LD names him; the full Person lives on the home page under the same @id. */
export const PERSON_REF = { "@type": "Person", "@id": PERSON_ID, name: SITE_NAME, url: `${SITE_URL}/`, sameAs: SOCIAL_LINKS };

type Share = {
  path: string;
  title: string;
  description: string;
  alt: string;
  type?: "website" | "article";
  article?: { publishedTime?: string; modifiedTime?: string; section?: string; tags?: string[] };
};

/** Canonical, Open Graph and X card for one page, all pointing at the same canonical URL and share image. */
export function shareMetadata({ path, title, description, alt, type = "website", article }: Share): Metadata {
  const url = absoluteUrl(path);
  const image = { url: absoluteUrl(ogImage(path)), width: 1200, height: 630, alt, type: "image/png" };
  const desc = clip(description);
  const base = { url, title, description: desc, siteName: SITE_NAME, locale: "en_NG", images: [image] };
  return {
    description: desc,
    alternates: { canonical: url, types: FEEDS },
    openGraph: type === "article"
      ? { ...base, type, authors: [SITE_NAME], ...article }
      : { ...base, type },
    twitter: { card: "summary_large_image", title, description: desc, images: [{ url: image.url, alt }] },
  };
}

/** A page title, with the site name added when the whole still fits in 60 characters. */
export function pageTitle(title: string): Metadata["title"] {
  return `${title} | ${SITE_NAME}`.length <= 60 ? title : { absolute: title };
}
