import "../../home.css";
import "../../case.css";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { preload } from "react-dom";
import { getAllWorks, getChildWorks, getWork } from "@/lib/works";
import { ReadProgress } from "@/components/read-progress";
import { StructuredData } from "@/components/structured-data";
import { WorkTile } from "@/components/work-tile";
import { OG_IMAGE, PERSON_ID, SITE_NAME, WEBSITE_ID, absoluteUrl, breadcrumbSchema } from "@/lib/site";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllWorks().flatMap((work) => [work, ...getChildWorks(work.slug)]).map((work) => ({ slug: work.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getWork(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.line,
    alternates: { canonical: `/work/${project.slug}/` },
    openGraph: {
      type: "website",
      url: `/work/${project.slug}/`,
      siteName: SITE_NAME,
      title: `${project.title}, frontend engineering case study`,
      description: project.line,
      images: [{ url: OG_IMAGE, width: 1732, height: 909, alt: `${project.title} frontend engineering case study by Promise Okafor` }],
    },
    twitter: { card: "summary_large_image", title: `${project.title}, frontend engineering case study`, description: project.line, images: [OG_IMAGE] },
  };
}

export default async function WorkPage({ params }: PageProps) {
  const { slug } = await params;
  const project = getWork(slug);
  if (!project) notFound();
  const parent = project.parent ? getWork(project.parent) : undefined;
  const children = getChildWorks(project.slug);
  // a study that opens on a screenshot stage: fetch its backdrop and screenshot with the page, not after the CSS and layout
  const lead = project.html.match(/^<figure class="stage"><div class="frame bd-(\w+)"><div class="\w+"><img src="([^"]+)"/);
  if (lead) { preload(`/stage/${lead[1]}.jpg`, { as: "image" }); preload(lead[2], { as: "image" }); }

  const projectUrl = absoluteUrl(`/work/${project.slug}/`);
  const crumbs = [{ name: "Home", path: "/" }, ...(parent ? [{ name: parent.title, path: `/work/${parent.slug}/` }] : []), { name: project.title, path: `/work/${project.slug}/` }];
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CreativeWork",
        "@id": `${projectUrl}#case-study`,
        url: projectUrl,
        name: `${project.title}, frontend engineering case study`,
        headline: project.title,
        description: project.line,
        abstract: project.subtitle || project.line,
        dateCreated: project.year.match(/\d{4}/)?.[0], // "2024 to 2026" → "2024"; omitted when there is no year
        inLanguage: "en",
        creator: { "@id": PERSON_ID },
        isPartOf: { "@id": WEBSITE_ID },
      },
      breadcrumbSchema(crumbs),
    ],
  };

  return (
    <>
      <StructuredData data={structuredData} />
      <ReadProgress />
      <div className="case wrap">
        {/* a plain anchor, not next/link, so the cross-document view transition fires */}
        <a className="back" href={parent ? `/work/${parent.slug}/` : "/#works"}>{parent ? `Back to ${parent.title}` : "Back to work"}</a>
        <h1 style={{ viewTransitionName: `work-${project.slug}` }}>{project.title}</h1>
        <p className="sub">{project.subtitle || project.line}</p>
        <article dangerouslySetInnerHTML={{ __html: project.html }} />
      </div>
      {children.length > 0 && (
        <section className="band">
          <div className="head wrap"><h2><span className="up">Inside {project.title}</span></h2></div>
          <div className="grid">{children.map((work) => <WorkTile key={work.slug} work={work} wide={false} />)}</div>
        </section>
      )}
    </>
  );
}
