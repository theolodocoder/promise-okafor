import "../home.css";
import type { Metadata } from "next";
import { formatMonthYear, getAllPosts } from "@/lib/blog";
import { StructuredData } from "@/components/structured-data";
import { BLOG_ID, OG_IMAGE, PERSON_ID, SITE_NAME, WEBSITE_ID, absoluteUrl, breadcrumbSchema } from "@/lib/site";

const DESC = "Frontend decisions I have made, and what happened after.";

export const metadata: Metadata = {
  title: "Writings",
  description: DESC,
  alternates: { canonical: "/blog/", types: { "application/rss+xml": absoluteUrl("/blog/rss.xml") } },
  openGraph: {
    type: "website",
    url: "/blog/",
    siteName: SITE_NAME,
    title: "Writings by Promise Okafor",
    description: DESC,
    images: [{ url: OG_IMAGE, width: 1732, height: 909, alt: "Writings by Promise Okafor" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Writings by Promise Okafor",
    description: DESC,
    images: [OG_IMAGE],
  },
};

export default function BlogPage() {
  const posts = getAllPosts();
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Blog",
        "@id": BLOG_ID,
        url: absoluteUrl("/blog/"),
        name: "Writings",
        description: DESC,
        inLanguage: "en",
        isPartOf: { "@id": WEBSITE_ID },
        author: { "@id": PERSON_ID },
        blogPost: posts.map((post) => ({
          "@type": "BlogPosting",
          "@id": `${absoluteUrl(`/blog/${post.slug}/`)}#article`,
          url: absoluteUrl(`/blog/${post.slug}/`),
          headline: post.title,
          description: post.summary,
          datePublished: post.publishedAt,
          dateModified: post.updatedAt ?? post.publishedAt,
          author: { "@id": PERSON_ID },
        })),
      },
      breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Writings", path: "/blog/" }]),
    ],
  };

  return (
    <>
      <StructuredData data={structuredData} />
      <section className="band">
        <div className="head wrap"><h1><span className="up">Writings</span></h1><p>{DESC}</p></div>
        <ul className="posts">
          {posts.map((post) => (
            <li key={post.slug}><a href={`/blog/${post.slug}/`}><h2>{post.title}</h2><span>{post.category}</span><span>{formatMonthYear(post.publishedAt)}</span></a></li>
          ))}
        </ul>
      </section>
    </>
  );
}
