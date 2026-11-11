import "../home.css";
import type { Metadata } from "next";
import { formatMonthYear, getAllPosts } from "@/lib/blog";
import { StructuredData } from "@/components/structured-data";
import { BLOG_ID, PERSON_ID, WEBSITE_ID, absoluteUrl, breadcrumbSchema } from "@/lib/site";
import { PERSON_REF, ogImage, shareMetadata } from "@/lib/seo";

const DESC = "Frontend decisions I have made, and what happened after.";

export const metadata: Metadata = {
  title: "Writings",
  ...shareMetadata({ path: "/blog/", title: "Writings by Promise Okafor", description: DESC, alt: "Writings by Promise Okafor: frontend decisions I have made, and what happened after." }),
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
        image: absoluteUrl(ogImage("/blog/")),
        author: PERSON_REF,
        publisher: { "@id": PERSON_ID },
        blogPost: posts.map((post) => ({
          "@type": "BlogPosting",
          "@id": `${absoluteUrl(`/blog/${post.slug}/`)}#article`,
          url: absoluteUrl(`/blog/${post.slug}/`),
          headline: post.title,
          description: post.summary,
          datePublished: post.publishedAt,
          dateModified: post.updatedAt ?? post.publishedAt,
          image: absoluteUrl(ogImage(`/blog/${post.slug}/`)),
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
