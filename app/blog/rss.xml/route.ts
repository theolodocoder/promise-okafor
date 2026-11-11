import fs from "node:fs";
import path from "node:path";
import { escapeXml, getAllPosts } from "@/lib/blog";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/site";
import { ogImage } from "@/lib/seo";
export const dynamic = "force-static";

// the share image as an enclosure; RSS needs its byte length, so it is skipped if the PNG is missing
function enclosure(slug: string) {
  const image = ogImage(`/blog/${slug}/`);
  const file = path.join(process.cwd(), "public", image);
  if (!fs.existsSync(file)) return "";
  return `<enclosure url="${absoluteUrl(image)}" length="${fs.statSync(file).size}" type="image/png" /><media:content url="${absoluteUrl(image)}" medium="image" type="image/png" width="1200" height="630" />`;
}

export function GET() {
  const site = SITE_URL;
  const posts = getAllPosts();
  const items = posts.map((post) => `<item><title>${escapeXml(post.title)}</title><link>${site}/blog/${post.slug}/</link><guid isPermaLink="true">${site}/blog/${post.slug}/</guid><description>${escapeXml(post.summary)}</description><dc:creator>${SITE_NAME}</dc:creator><pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>${post.tags.map((tag) => `<category>${escapeXml(tag)}</category>`).join("")}${enclosure(post.slug)}</item>`).join("");
  const latest = posts[0];
  const xml = `<?xml version="1.0" encoding="UTF-8" ?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:media="http://search.yahoo.com/mrss/"><channel><title>Writings by Promise Okafor</title><link>${site}/blog/</link><description>Frontend decisions I have made, and what happened after.</description><language>en</language><lastBuildDate>${latest ? new Date(latest.updatedAt ?? latest.publishedAt).toUTCString() : new Date(0).toUTCString()}</lastBuildDate><image><url>${absoluteUrl(ogImage("/blog/"))}</url><title>Writings by Promise Okafor</title><link>${site}/blog/</link></image><atom:link href="${site}/blog/rss.xml" rel="self" type="application/rss+xml" />${items}</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
