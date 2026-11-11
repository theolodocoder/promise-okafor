import "./home.css";
import { Hero } from "@/components/hero";
import { StructuredData } from "@/components/structured-data";
import { WorkTile } from "@/components/work-tile";
import { formatMonthYear, getAllPosts } from "@/lib/blog";
import { getAllWorks } from "@/lib/works";
import type { Metadata } from "next";
import { PERSON_ID, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL, SOCIAL_LINKS, WEBSITE_ID, absoluteUrl } from "@/lib/site";
import { lastModified, ogImage, shareMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  title: { absolute: SITE_TITLE },
  ...shareMetadata({ path: "/", title: SITE_TITLE, description: SITE_DESCRIPTION, alt: "Promise Okafor, Lead Frontend Engineer in Lagos: I build frontends teams do not have to undo." }),
};

export default function HomePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: `${SITE_URL}/`,
        name: SITE_NAME,
        alternateName: "Promise Okafor Portfolio",
        description: SITE_DESCRIPTION,
        inLanguage: "en",
        publisher: { "@id": PERSON_ID },
      },
      {
        "@type": "ProfilePage",
        "@id": `${SITE_URL}/#profile-page`,
        url: `${SITE_URL}/`,
        name: SITE_TITLE,
        description: SITE_DESCRIPTION,
        inLanguage: "en",
        dateModified: lastModified("app/page.tsx"),
        primaryImageOfPage: { "@type": "ImageObject", url: absoluteUrl(ogImage("/")), width: 1200, height: 630 },
        isPartOf: { "@id": WEBSITE_ID },
        mainEntity: { "@id": PERSON_ID },
      },
      {
        "@type": "Person",
        "@id": PERSON_ID,
        name: SITE_NAME,
        url: `${SITE_URL}/`,
        image: absoluteUrl("/portrait-220.jpg"),
        jobTitle: "Lead Frontend Engineer",
        description: SITE_DESCRIPTION,
        address: { "@type": "PostalAddress", addressLocality: "Lagos", addressCountry: "NG" },
        sameAs: SOCIAL_LINKS,
        knowsAbout: ["Frontend architecture", "Angular", "React", "Next.js", "TypeScript", "React Native", "Electron", "Web performance", "Accessibility", "Design systems"],
        worksFor: { "@type": "Organization", name: "Cosella" },
      },
    ],
  };

  const works = getAllWorks();
  const posts = getAllPosts();

  return (
    <>
      <StructuredData data={structuredData} />
      <Hero />
      <section className="band" id="works">
        <div className="head wrap"><h2><span className="up">Works</span></h2><p>Each one is the full story: what was broken, what I tried, what I chose and what it cost.</p></div>
        <div className="grid">{works.map((work, i) => <WorkTile key={work.slug} work={work} wide={i === 0} />)}</div>
      </section>
      <section className="band" id="writings">
        <div className="head wrap"><h2><span className="up">Writings</span></h2><p>Frontend decisions I have made, and what happened after.</p></div>
        <ul className="posts">
          {posts.map((post) => (
            <li key={post.slug}><a href={`/blog/${post.slug}/`}><h3>{post.title}</h3><span>{post.category}</span><span>{formatMonthYear(post.publishedAt)}</span></a></li>
          ))}
        </ul>
      </section>
    </>
  );
}
