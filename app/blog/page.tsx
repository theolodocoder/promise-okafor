import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header";
import { BlogRuntimeVisual } from "@/components/blog-runtime-visual";
import { formatPostDate, getAllPosts } from "@/lib/blog";
import { StructuredData } from "@/components/structured-data";
import { BLOG_ID, OG_IMAGE, PERSON_ID, SITE_NAME, SITE_URL, WEBSITE_ID, absoluteUrl, breadcrumbSchema } from "@/lib/site";

export const metadata: Metadata = {
  title: "Field Notes",
  description: "Deep notes on frontend architecture, product engineering, performance and technical leadership by Promise Okafor.",
  alternates: { canonical: "/blog/", types: { "application/rss+xml": absoluteUrl("/blog/rss.xml") } },
  openGraph: {
    type: "website",
    url: "/blog/",
    siteName: SITE_NAME,
    title: "Field Notes — Promise Okafor",
    description: "Deep notes on frontend architecture, product engineering, performance and technical leadership.",
    images: [{ url: OG_IMAGE, width: 1732, height: 909, alt: "Field Notes by Promise Okafor" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Field Notes — Promise Okafor",
    description: "Deep notes on frontend architecture, product engineering, performance and technical leadership.",
    images: [OG_IMAGE],
  },
};

export default function BlogPage() {
  const posts = getAllPosts();
  const featured = posts.find((post) => post.featured) ?? posts[0];
  const remaining = posts.filter((post) => post.slug !== featured?.slug);
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Blog",
        "@id": BLOG_ID,
        url: absoluteUrl("/blog/"),
        name: "Field Notes",
        description: "Deep notes on frontend architecture, product engineering, performance and technical leadership by Promise Okafor.",
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
      breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Field Notes", path: "/blog/" }]),
    ],
  };

  return (
    <><StructuredData data={structuredData} /><Header /><main className="blog-index">
      <section className="blog-hero section-shell">
        <div className="blog-hero-top" data-hero-fade><span>FIELD NOTES / {String(posts.length).padStart(2, "0")}</span><p>Architecture, product craft, and the decisions behind the interface.</p></div>
        <h1><span className="line-mask"><span data-hero-line>Thinking in</span></span><span className="line-mask blog-hero-indent"><span data-hero-line><em>public.</em></span></span></h1>
        <div className="blog-hero-bottom" data-hero-fade><p>Long-form notes from the workbench—written for engineers who care about why a system works, not only what shipped.</p><a className="text-link" href="/blog/rss.xml">Follow via RSS <span aria-hidden="true">↗</span></a></div>
      </section>

      {featured && <section className="featured-post section-shell" aria-labelledby="featured-title">
        <div className="blog-section-label" data-reveal><span>01</span><p>LATEST NOTE</p><i /></div>
        <Link className="featured-post-visual" href={`/blog/${featured.slug}`} data-reveal><BlogRuntimeVisual /></Link>
        <article className="featured-post-copy" data-reveal>
          <div className="post-number">NO. 001</div>
          <div><p className="post-meta">{featured.category} · {formatPostDate(featured.publishedAt)} · {featured.readingTime} MIN</p><h2 id="featured-title"><Link href={`/blog/${featured.slug}`}>{featured.title}</Link></h2></div>
          <p>{featured.summary}</p>
          <Link className="round-link blog-read-link" href={`/blog/${featured.slug}`} aria-label={`Read ${featured.title}`}><span>Read note</span><b aria-hidden="true">↗</b></Link>
        </article>
      </section>}

      {remaining.length > 0 && <section className="blog-archive section-shell">
        <div className="blog-section-label" data-reveal><span>02</span><p>THE ARCHIVE</p><i /></div>
        {remaining.map((post, index) => <article key={post.slug} data-reveal><span>{String(index + 2).padStart(3, "0")}</span><div><p className="post-meta">{post.category} · {post.readingTime} MIN</p><h2><Link href={`/blog/${post.slug}`}>{post.title}</Link></h2></div><p>{post.summary}</p><Link href={`/blog/${post.slug}`} aria-label={`Read ${post.title}`}>↗</Link></article>)}
      </section>}

      <section className="blog-index-footer"><div className="section-shell" data-reveal><span>MORE SIGNAL. LESS NOISE.</span><h2>New notes when<br />there is something <em>worth saying.</em></h2><div><a className="text-link" href="/blog/rss.xml">Subscribe with RSS <span>↗</span></a><Link className="text-link" href="/#contact">Start a conversation <span>↗</span></Link></div></div></section>
    </main></>
  );
}
