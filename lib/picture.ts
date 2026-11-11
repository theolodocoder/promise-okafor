import { images } from "./image-manifest.ts";

/** `sizes` for each place a screenshot or cover is drawn; phones (below 800px) get the full width. */
export const SIZES = {
  wideTile: "(max-width: 800px) 100vw, 1130px",
  halfTile: "(max-width: 800px) 100vw, 560px",
  tilePhone: "(max-width: 800px) 27vw, 150px",
  figure: "(max-width: 800px) 100vw, 840px",
  figurePhone: "(max-width: 800px) 27vw, 190px",
};

export type Picture = { avif: string; webp: string; src: string; width: number; height: number; sizes: string };

/** The AVIF and WebP srcsets and the JPEG fallback that scripts/images.mjs made for a source path, or undefined. */
export function picture(src: string, sizes: string): Picture | undefined {
  const entry = images[src];
  if (!entry) return undefined;
  const base = src.replace(/\.\w+$/, "");
  const set = (ext: string) => entry.widths.map((w) => `${base}.${w}.${ext} ${w}w`).join(", ");
  return { avif: set("avif"), webp: set("webp"), src: `${base}.${entry.fallback}.jpg`, width: entry.width, height: entry.height, sizes };
}

/** The same picture as HTML, for markdown. `lead` is the first image above the fold: eager and high priority. */
export function pictureHtml(src: string, alt: string, sizes: string, lead = false) {
  const p = picture(src, sizes);
  const load = lead ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"';
  if (!p) return `<img src="${src}" alt="${alt}" ${load} />`;
  return `<picture><source type="image/avif" srcset="${p.avif}" sizes="${sizes}" /><source type="image/webp" srcset="${p.webp}" sizes="${sizes}" /><img src="${p.src}" alt="${alt}" width="${p.width}" height="${p.height}" ${load} /></picture>`;
}
