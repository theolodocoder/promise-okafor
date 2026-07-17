import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { BlogRuntimeVisual } from "@/components/blog-runtime-visual";
import { BlogArticleTools } from "@/components/blog-article-tools";
import { formatPostDate, getAllPosts, getPost } from "@/lib/blog";

type PageProps = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return getAllPosts().map((post) => ({ slug: post.slug })); }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  return {
    title: post.title, description: post.summary, alternates: { canonical: `/blog/${post.slug}/` }, authors: [{ name: "Promise Okafor" }],
    openGraph: { type: "article", title: post.title, description: post.summary, publishedTime: post.publishedAt, modifiedTime: post.updatedAt, tags: post.tags, images: [{ url: "/og-blog.png", alt: post.title }] },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  const posts = getAllPosts();
  const currentIndex = posts.findIndex((item) => item.slug === post.slug);
  const nextPost = posts[currentIndex + 1] ?? posts[currentIndex - 1];
  const structuredData = { "@context": "https://schema.org", "@type": "BlogPosting", headline: post.title, description: post.summary, datePublished: post.publishedAt, dateModified: post.updatedAt ?? post.publishedAt, author: { "@type": "Person", name: "Promise Okafor", url: "https://promiseokafor.dev" }, mainEntityOfPage: `https://promiseokafor.dev/blog/${post.slug}/`, keywords: post.tags.join(", ") };

  return <><Header /><main className="article-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    <section className="article-hero section-shell">
      <div className="article-breadcrumb" data-hero-fade><Link href="/blog">Field notes</Link><span>/</span><span>{post.category}</span></div>
      <div className="article-meta" data-hero-fade><span>{formatPostDate(post.publishedAt)}</span><span>{post.readingTime} MIN READ</span><span>NO. {String(currentIndex + 1).padStart(3, "0")}</span></div>
      <h1 className="article-title"><span className="line-mask"><span data-hero-line>{post.title}</span></span></h1>
      <p className="article-deck" data-hero-fade>{post.summary}</p>
      <div className="article-author" data-hero-fade><div>PO</div><p><strong>Promise Okafor</strong><span>Senior frontend engineer · Building across web, mobile and desktop</span></p></div>
    </section>
    <div className="article-cover section-shell" data-reveal><BlogRuntimeVisual compact /></div>
    <section className="article-layout section-shell">
      <aside className="article-toc" data-reveal><span>IN THIS NOTE</span><nav aria-label="Table of contents">{post.toc.map((item) => <a className={item.level === 3 ? "is-nested" : ""} href={`#${item.id}`} key={item.id}>{item.title}</a>)}</nav><BlogArticleTools title={post.title} /></aside>
      <article className="article-prose" dangerouslySetInnerHTML={{ __html: post.html }} />
      <aside className="article-rail" aria-label="Article details" data-reveal><span>TOPICS</span>{post.tags.map((tag) => <p key={tag}>{tag}</p>)}</aside>
    </section>
    <section className="article-author-card section-shell" data-reveal><div>PO</div><div><span>WRITTEN BY</span><h2>Promise Okafor</h2><p>I design and ship frontend systems, lead product engineering work, and write about the decisions that make interfaces dependable.</p></div><Link className="text-link" href="/#contact">Work with me <span>↗</span></Link></section>
    <section className="article-next">{nextPost ? <Link className="section-shell" href={`/blog/${nextPost.slug}`}><span>READ NEXT</span><strong>{nextPost.title}</strong><i aria-hidden="true">↗</i></Link> : <Link className="section-shell" href="/blog"><span>RETURN TO</span><strong>Field notes.</strong><i aria-hidden="true">↗</i></Link>}</section>
  </main></>;
}
