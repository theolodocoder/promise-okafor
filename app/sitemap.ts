import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { getAllWorks, getChildWorks } from "@/lib/works";
import { SITE_URL } from "@/lib/site";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL;
  return [{ url: `${base}/`, changeFrequency: "monthly", priority: 1 }, { url: `${base}/blog/`, changeFrequency: "weekly", priority: .9 }, ...getAllPosts().map((post) => ({ url: `${base}/blog/${post.slug}/`, lastModified: post.updatedAt ?? post.publishedAt, changeFrequency: "monthly" as const, priority: .8 })), ...getAllWorks().flatMap((work) => [work, ...getChildWorks(work.slug)]).map((project) => ({ url: `${base}/work/${project.slug}/`, changeFrequency: "monthly" as const, priority: .7 }))];
}
