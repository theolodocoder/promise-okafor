import { getAllPosts } from "@/lib/blog";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/site";
import { ogImage } from "@/lib/seo";
export const dynamic = "force-static";

// JSON Feed 1.1 (https://jsonfeed.org/version/1.1), the same posts as rss.xml
export function GET() {
  const feed = {
    version: "https://jsonfeed.org/version/1.1",
    title: "Writings by Promise Okafor",
    home_page_url: absoluteUrl("/blog/"),
    feed_url: absoluteUrl("/blog/feed.json"),
    description: "Frontend decisions I have made, and what happened after.",
    icon: absoluteUrl("/icon-512.png"),
    favicon: absoluteUrl("/favicon-48.png"),
    language: "en",
    authors: [{ name: SITE_NAME, url: `${SITE_URL}/` }],
    items: getAllPosts().map((post) => ({
      id: absoluteUrl(`/blog/${post.slug}/`),
      url: absoluteUrl(`/blog/${post.slug}/`),
      title: post.title,
      summary: post.summary,
      content_html: post.html,
      image: absoluteUrl(ogImage(`/blog/${post.slug}/`)),
      date_published: new Date(post.publishedAt).toISOString(),
      date_modified: new Date(post.updatedAt ?? post.publishedAt).toISOString(),
      tags: post.tags,
    })),
  };
  return new Response(JSON.stringify(feed), { headers: { "Content-Type": "application/feed+json; charset=utf-8" } });
}
