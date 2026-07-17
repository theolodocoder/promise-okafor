import { escapeXml, getAllPosts } from "@/lib/blog";
export const dynamic = "force-static";

export function GET() {
  const site = "https://promiseokafor.dev";
  const items = getAllPosts().map((post) => `<item><title>${escapeXml(post.title)}</title><link>${site}/blog/${post.slug}/</link><guid isPermaLink="true">${site}/blog/${post.slug}/</guid><description>${escapeXml(post.summary)}</description><pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>${post.tags.map((tag) => `<category>${escapeXml(tag)}</category>`).join("")}</item>`).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8" ?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>Field Notes — Promise Okafor</title><link>${site}/blog/</link><description>Notes on frontend architecture, product engineering and technical leadership.</description><language>en</language><atom:link href="${site}/blog/rss.xml" rel="self" type="application/rss+xml" />${items}</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
