import "../../home.css";
import "../../case.css";
import "../../blog.css";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { formatMonthYear, formatPostDate, getAllPosts, getPost } from "@/lib/blog";
import { ReadProgress } from "@/components/read-progress";
import { StructuredData } from "@/components/structured-data";
import { BLOG_ID, WEBSITE_ID, absoluteUrl, breadcrumbSchema } from "@/lib/site";
import { PERSON_REF, ogImage, pageTitle, shareMetadata } from "@/lib/seo";

type PageProps = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return getAllPosts().map((post) => ({ slug: post.slug })); }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  const path = `/blog/${post.slug}/`;
  return {
    title: pageTitle(post.title),
    authors: [{ name: "Promise Okafor" }],
    keywords: post.tags,
    ...shareMetadata({
      path,
      title: post.title,
      description: post.summary,
      alt: `${post.title}, a post by Promise Okafor in ${post.category}.`,
      type: "article",
      article: { publishedTime: post.publishedAt, modifiedTime: post.updatedAt ?? post.publishedAt, section: post.category, tags: post.tags },
    }),
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  const posts = getAllPosts();
  const next = posts[posts.findIndex((p) => p.slug === post.slug) + 1];
  const articleUrl = absoluteUrl(`/blog/${post.slug}/`);
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${articleUrl}#article`,
        url: articleUrl,
        headline: post.title,
        description: post.summary,
        datePublished: post.publishedAt,
        dateModified: post.updatedAt ?? post.publishedAt,
        inLanguage: "en",
        image: { "@type": "ImageObject", url: absoluteUrl(ogImage(`/blog/${post.slug}/`)), width: 1200, height: 630 },
        wordCount: post.wordCount,
        articleSection: post.category,
        keywords: post.tags.join(", "),
        about: post.tags.map((tag) => ({ "@type": "Thing", name: tag })),
        author: PERSON_REF,
        publisher: PERSON_REF,
        isPartOf: { "@id": BLOG_ID },
        mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl, isPartOf: { "@id": WEBSITE_ID } },
      },
      breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Writings", path: "/blog/" }, { name: post.title, path: `/blog/${post.slug}/` }]),
    ],
  };

  return (
    <>
      <StructuredData data={structuredData} />
      <ReadProgress />
      <div className="case post wrap">
        {/* a plain anchor, not next/link, so the cross-document view transition fires */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a className="back" href="/blog/">Back to writings</a>
        <h1 className="post-title">{post.title}</h1>
        <p className="meta"><time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>, {post.readingTime} min read</p>
        <article dangerouslySetInnerHTML={{ __html: post.html }} />
      </div>
      {next && (
        <ul className="posts post-next">
          <li><a href={`/blog/${next.slug}/`}><h3>{next.title}</h3><span>Next</span><span>{formatMonthYear(next.publishedAt)}</span></a></li>
        </ul>
      )}
    </>
  );
}
