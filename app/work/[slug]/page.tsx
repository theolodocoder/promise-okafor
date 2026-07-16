import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { ProjectVisual } from "@/components/project-visual";
import { getProject, projects } from "@/data/portfolio";

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
  };
}

export default async function WorkPage({ params }: PageProps) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const currentIndex = projects.findIndex((item) => item.slug === project.slug);
  const nextProject = projects[(currentIndex + 1) % projects.length];

  return (
    <>
      <Header />
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
