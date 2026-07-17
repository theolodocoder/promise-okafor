import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { ProjectVisual } from "@/components/project-visual";
import { getProject, projects } from "@/data/portfolio";
import { StructuredData } from "@/components/structured-data";
import { OG_IMAGE, PERSON_ID, SITE_NAME, WEBSITE_ID, absoluteUrl, breadcrumbSchema } from "@/lib/site";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.summary,
    keywords: project.tags,
    alternates: { canonical: `/work/${project.slug}/` },
    openGraph: {
      type: "website",
      url: `/work/${project.slug}/`,
      siteName: SITE_NAME,
      title: `${project.title} — Frontend engineering case study`,
      description: project.summary,
      images: [{ url: OG_IMAGE, width: 1732, height: 909, alt: `${project.title} frontend engineering case study by Promise Okafor` }],
    },
    twitter: { card: "summary_large_image", title: `${project.title} — Frontend engineering case study`, description: project.summary, images: [OG_IMAGE] },
  };
}

export default async function WorkPage({ params }: PageProps) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const currentIndex = projects.findIndex((item) => item.slug === project.slug);
  const nextProject = projects[(currentIndex + 1) % projects.length];
  const projectUrl = absoluteUrl(`/work/${project.slug}/`);
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CreativeWork",
        "@id": `${projectUrl}#case-study`,
        url: projectUrl,
        name: `${project.title} — Frontend engineering case study`,
        headline: project.title,
        description: project.summary,
        abstract: project.thesis,
        dateCreated: project.year,
        inLanguage: "en",
        keywords: project.tags.join(", "),
        creator: { "@id": PERSON_ID },
        isPartOf: { "@id": WEBSITE_ID },
        about: project.tags.map((tag) => ({ "@type": "Thing", name: tag })),
        sameAs: project.github ? [project.github] : undefined,
      },
      breadcrumbSchema([{ name: "Home", path: "/" }, { name: project.title, path: `/work/${project.slug}/` }]),
    ],
  };

  return (
    <>
      <Header />
      <StructuredData data={structuredData} />
      <main className="case-page">
        <section className="case-hero section-shell">
          <div className="case-breadcrumb" data-hero-fade>
            <Link href="/#work">Selected work</Link>
            <span>/</span>
            <span>{project.index}</span>
          </div>
          <p className="case-category" data-hero-fade>{project.category} · {project.year}</p>
          <h1 className="case-title">
            <span className="line-mask"><span data-hero-line>{project.title}</span></span>
          </h1>
          <div className="case-lede" data-hero-fade>
            <p>{project.thesis}</p>
            <div>
              <span>ROLE</span>
              <b>{project.role}</b>
            </div>
          </div>
        </section>

        <section className="case-visual-wrap section-shell" data-project-card>
          <ProjectVisual project={project} compact />
        </section>

        <section className="case-metrics section-shell">
          {project.metrics.map((metric) => (
            <article key={metric.label} data-reveal>
              <strong>{metric.value}</strong>
              <span>{metric.label}</span>
            </article>
          ))}
        </section>

        <section className="case-story section-shell">
          <article data-reveal>
            <p className="eyebrow"><span>01</span> THE CHALLENGE</p>
            <h2>Making the complex feel inevitable.</h2>
            <p>{project.challenge}</p>
          </article>
          <article data-reveal>
            <p className="eyebrow"><span>02</span> THE SYSTEM</p>
            <h2>Architecture with a reason.</h2>
            <p>{project.system}</p>
          </article>
          <article data-reveal>
            <p className="eyebrow"><span>03</span> THE OUTCOME</p>
            <h2>Proof over decoration.</h2>
            <p>{project.outcome}</p>
          </article>
        </section>

        <section className="case-stack section-shell" data-reveal>
          <p className="eyebrow"><span>04</span> TECHNOLOGY</p>
          <div>{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
          {project.github && (
            <a className="text-link" href={project.github} target="_blank" rel="noreferrer">
              Explore repository <span aria-hidden="true">↗</span>
            </a>
          )}
        </section>

        <section className="next-project">
          <Link href={`/work/${nextProject.slug}`} className="section-shell">
            <span>NEXT CASE STUDY · {nextProject.index}</span>
            <strong>{nextProject.title}</strong>
            <i aria-hidden="true">↗</i>
          </Link>
        </section>
      </main>
    </>
  );
}
