import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { getAllWorks, getChildWorks } from "@/lib/works";
import { absoluteUrl } from "@/lib/site";
import { lastModified, ogImage } from "@/lib/seo";

export const dynamic = "force-static";

const entry = (path: string, date: string, changeFrequency: "weekly" | "monthly", priority: number) =>
  ({ url: absoluteUrl(path), lastModified: date, changeFrequency, priority, images: [absoluteUrl(ogImage(path))] });

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const works = getAllWorks().flatMap((work) => [work, ...getChildWorks(work.slug)]);
  const latestPost = posts[0] ? posts[0].updatedAt ?? posts[0].publishedAt : lastModified("app/blog/page.tsx");
  return [
    entry("/", lastModified("app/page.tsx"), "monthly", 1),
    entry("/blog/", latestPost, "weekly", 0.9),
    ...posts.map((post) => entry(`/blog/${post.slug}/`, post.updatedAt ?? post.publishedAt, "monthly", 0.8)),
    ...works.map((work) => entry(`/work/${work.slug}/`, lastModified(`content/work/${work.slug}.md`), "monthly", 0.7)),
  ];
}
