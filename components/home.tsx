import Link from "next/link";
import { Header } from "@/components/header";
import { ProjectVisual } from "@/components/project-visual";
import { experience, projects } from "@/data/portfolio";

export function Home() {
  return (
    <>
      <Header />
      <main>
        <section className="hero" aria-labelledby="hero-title">
          <h1 id="hero-title" className="hero-title">
            <span className="line-mask"><span data-hero-line>I build frontends</span></span>
            <span className="line-mask hero-indent"><span data-hero-line>that move</span></span>
            <span className="line-mask"><span data-hero-line><em>businesses</em> forward.</span></span>
          </h1>

          <div className="hero-bottom">
            <div className="hero-role-card" data-hero-fade>
              <span className="mini-label">CURRENTLY</span>
              <p>Senior Frontend Engineer at Zabira</p>
              <span>Angular product engineering, alongside frontend leadership at Lightforth.</span>
            </div>
            <p className="hero-intro" data-hero-fade>
              I’m Promise Okafor. I design and ship accessible, high-performance
              frontend systems across web, mobile and desktop.
            </p>
            <a className="round-link" href="#work" aria-label="Explore selected work" data-hero-fade>
              <span>Explore work</span>
              <b aria-hidden="true">↓</b>
            </a>
          </div>

          <div className="hero-marquee" aria-hidden="true">
            <div>
              ANGULAR · REACT · NEXT.JS · REACT NATIVE · TYPESCRIPT · WEB · MOBILE · DESKTOP ·
              ANGULAR · REACT · NEXT.JS · REACT NATIVE · TYPESCRIPT · WEB · MOBILE · DESKTOP ·
            </div>
          </div>
        </section>

        <section className="work-section section-shell" id="work">
          <div className="section-heading" data-reveal>
            <p><span>01</span> SELECTED WORK</p>
            <h2>Four systems.<br />One point of view.</h2>
            <span className="heading-note">Chosen for depth, not volume.</span>
          </div>

          <div className="project-list">
            {projects.map((project) => (
              <article className="project-card" data-project-card key={project.slug}>
                <Link href={`/work/${project.slug}`} className="project-visual-link" aria-label={`Read the ${project.title} case study`}>
                  <ProjectVisual project={project} />
                </Link>
                <div className="project-meta" data-reveal>
                  <div className="project-index">{project.index}</div>
                  <div>
                    <p className="project-category">{project.category} · {project.year}</p>
                    <h3><Link href={`/work/${project.slug}`}>{project.title}</Link></h3>
                  </div>
                  <p className="project-summary">{project.summary}</p>
                  <Link className="text-link" href={`/work/${project.slug}`}>
                    View case study <span aria-hidden="true">↗</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="manifesto" id="about">
          <div className="manifesto-orbit" aria-hidden="true" data-drift>
            <span>PRODUCT</span><span>PEOPLE</span><span>PLATFORM</span>
          </div>
          <div className="manifesto-copy section-shell">
            <p className="eyebrow" data-reveal><span>02</span> HOW I WORK</p>
            <h2 data-reveal>
              Product instinct.<br />
              <em>Systems thinking.</em><br />
              Craft without theatre.
            </h2>
            <div className="manifesto-detail" data-reveal>
              <p>
                The best frontend work is more than a polished surface. It is a clear
                architecture, an inclusive interaction model, a fast path to value and
                a team that can keep shipping after launch.
              </p>
              <p>
                I work at that intersection—translating ambiguity into composable
                systems, raising the quality bar and staying close enough to the code
                to make the hard decisions real.
              </p>
            </div>
          </div>
        </section>

        <section className="experience section-shell" id="experience">
          <div className="section-heading compact" data-reveal>
            <p><span>03</span> EXPERIENCE</p>
            <h2>Built in the work.</h2>
            <a className="text-link" href="mailto:goforprodev@gmail.com?subject=Requesting%20Promise%20Okafor%27s%20current%20resume">
              Request current résumé <span aria-hidden="true">↗</span>
            </a>
          </div>

          <div className="experience-list">
            {experience.map((item) => (
              <article className="experience-item" key={item.company + item.role} data-reveal>
                <span className="experience-period">{item.period}</span>
                <div>
                  <h3>{item.company}</h3>
                  <p className="experience-role">{item.role}</p>
                </div>
                <p className="experience-detail">{item.detail}</p>
                <span className="experience-plus" aria-hidden="true">+</span>
              </article>
            ))}
          </div>
        </section>

        <section className="capabilities section-shell">
          <p className="eyebrow" data-reveal><span>04</span> OPERATING RANGE</p>
          <div className="capability-grid">
            <article data-reveal>
              <span>01</span>
              <h3>Cross-platform</h3>
              <p>Angular and React web platforms, React Native mobile products, desktop experiences and the shared systems behind them.</p>
            </article>
            <article data-reveal>
              <span>02</span>
              <h3>Product craft</h3>
              <p>Interaction design, responsive systems, accessibility, motion and rigorous implementation detail.</p>
            </article>
            <article data-reveal>
              <span>03</span>
              <h3>Performance</h3>
              <p>Runtime profiling, rendering strategy, code splitting, caching and image delivery.</p>
            </article>
            <article data-reveal>
              <span>04</span>
              <h3>Technical leadership</h3>
              <p>Roadmaps, design systems, mentoring, code review standards and cross-functional alignment.</p>
            </article>
          </div>
        </section>

        <section className="contact" id="contact">
          <div className="contact-inner section-shell">
            <p className="eyebrow" data-reveal><span>05</span> LET’S BUILD SOMETHING THAT MATTERS</p>
            <h2 data-reveal>
              Need a frontend leader<br />
              who can <em>still ship?</em>
            </h2>
            <a className="contact-email" href="mailto:goforprodev@gmail.com" data-reveal>
              goforprodev@gmail.com <span aria-hidden="true">↗</span>
            </a>
            <div className="contact-footer">
              <div>
                <a href="https://github.com/theolodocoder" target="_blank" rel="noreferrer">GitHub</a>
                <a href="https://www.linkedin.com/in/promise-okafor-15a3851b5" target="_blank" rel="noreferrer">LinkedIn</a>
                <a href="mailto:goforprodev@gmail.com">Email</a>
              </div>
              <p>Promise Okafor © {new Date().getFullYear()}</p>
              <a href="#top" aria-label="Back to top">Back to top ↑</a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
