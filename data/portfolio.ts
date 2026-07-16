export type Project = {
  slug: string;
  index: string;
  title: string;
  category: string;
  year: string;
  summary: string;
  thesis: string;
  role: string;
  tags: string[];
  metrics: { value: string; label: string }[];
  challenge: string;
  system: string;
  outcome: string;
  github?: string;
  tone: "ember" | "olive" | "plum" | "sand";
};

export const projects: Project[] = [
  {
    slug: "paje",
    index: "01",
    title: "Paje",
    category: "Framework Engineering",
    year: "2024",
    summary:
      "A tiny reactive JavaScript framework built to make the machinery behind modern UI libraries understandable.",
    thesis:
      "Rebuilding the primitives: virtual DOM rendering, reducer-driven state, event dispatch, lifecycle control and a hyperscript API in roughly 6.2KB.",
    role: "Creator & framework engineer",
    tags: ["JavaScript", "Virtual DOM", "Reactive State", "Custom Renderer"],
    metrics: [
      { value: "~6.2KB", label: "minified runtime" },
      { value: "0", label: "runtime dependencies" },
      { value: "8", label: "core primitives" },
    ],
    challenge:
      "Modern frontend abstractions are powerful, but their internals can feel opaque. The goal was to expose the full render-and-update loop without burying the learning in a large codebase.",
    system:
      "Paje composes a hyperscript layer, virtual node model, DOM mounting and teardown, attribute/event reconciliation, and a reducer dispatcher. State transitions re-run a pure view and keep application logic predictable.",
    outcome:
      "A readable framework runtime, packaged with examples, that demonstrates first-principles understanding of the browser, rendering systems and state architecture.",
    github: "https://github.com/theolodocoder/paje",
    tone: "ember",
  },
  {
    slug: "triggr-cloud",
    index: "02",
    title: "Triggr Cloud",
    category: "Realtime Developer Tooling",
    year: "2024",
    summary:
      "The operational console for a reactive Web3 backend—turning contract events, triggers and data into a legible control surface.",
    thesis:
      "A TypeScript console spanning contract ingestion, trigger authoring, execution visibility and database inspection for complex realtime workflows.",
    role: "Frontend engineer",
    tags: ["React", "TypeScript", "WebSockets", "Clerk", "SDK Integration"],
    metrics: [
      { value: "RT", label: "event feedback" },
      { value: "4", label: "core operator flows" },
      { value: "1", label: "unified console" },
    ],
    challenge:
      "Blockchain event infrastructure produces dense, technical state. Developers needed to configure triggers, inspect documents and understand execution status without losing context.",
    system:
      "Feature-based React architecture, typed service boundaries, protected routes, schema validation, query and mutation hooks, DSL generation and a dedicated code editor create a coherent operator workflow.",
    outcome:
      "A production-minded developer console that makes an event-driven backend observable and actionable from project creation through trigger execution.",
    github: "https://github.com/algorealmInc/Triggr",
    tone: "plum",
  },
  {
    slug: "flowscreen",
    index: "03",
    title: "Flowscreen",
    category: "Product Architecture",
    year: "2026",
    summary:
      "A multi-surface product ecosystem for browsing, organizing and operating a curated library of interface references.",
    thesis:
      "A Turborepo architecture connecting a Next.js product, React admin, documentation and a shared typed design system.",
    role: "Frontend architecture & product UI",
    tags: ["Next.js", "React 19", "Turborepo", "Design System", "TypeScript"],
    metrics: [
      { value: "3", label: "application surfaces" },
      { value: "19", label: "shared components" },
      { value: "1", label: "design language" },
    ],
    challenge:
      "A content-heavy product with public, authenticated and administrative experiences needed to scale without each surface inventing its own patterns.",
    system:
      "A monorepo shares UI, TypeScript, linting and Tailwind configuration across apps. Feature-oriented modules isolate auth, billing, discovery, settings and content-management concerns.",
    outcome:
      "A maintainable product foundation with consistent theming, reusable primitives and clear boundaries between platform-level and feature-level code.",
    tone: "olive",
  },
  {
    slug: "resume-parser",
    index: "04",
    title: "Resume Parser",
    category: "TypeScript Library",
    year: "2026",
    summary:
      "A modular parsing engine that turns unstructured PDF resumes into useful, typed candidate data.",
    thesis:
      "Pattern matching, feature scoring and section-specific extraction designed as an extensible TypeScript library rather than a one-off script.",
    role: "Library author",
    tags: ["TypeScript", "PDF.js", "Algorithms", "Testing", "API Design"],
    metrics: [
      { value: "6", label: "structured domains" },
      { value: "10+", label: "bullet formats" },
      { value: "100%", label: "typed public API" },
    ],
    challenge:
      "Resumes rarely share a dependable schema. Layout, typography, bullet formats and section names all vary, so naive line-based parsing breaks quickly.",
    system:
      "The parser separates PDF extraction, text grouping, feature scoring, pattern matching, domain extractors and quality checks. Configuration and strict types keep the system extensible.",
    outcome:
      "A reusable browser-ready parsing foundation with timeout protection, debug tooling, validation and focused tests for the heuristics most likely to regress.",
    github: "https://github.com/theolodocoder/resume-parser-lib",
    tone: "sand",
  },
];

export const experience = [
  {
    period: "2025 — NOW",
    company: "Lightforth",
    role: "Frontend Lead",
    detail:
      "Leading frontend delivery for a job-seeking and interview-prep platform; built the shared component system, mentored engineers and cut initial load time by 40% through code splitting and caching.",
  },
  {
    period: "2024 — 2025",
    company: "Lightforth",
    role: "Founding Frontend Engineer",
    detail:
      "Architected the first React and Next.js platform, built core product flows and established CI/CD, Git and Docker workflows for the team.",
  },
  {
    period: "2024 — NOW",
    company: "Solace Imaging",
    role: "Frontend Developer",
    detail:
      "Improving performance and UX for medical imaging workflows through lazy loading, image optimization, code splitting and reliable API integration.",
  },
  {
    period: "2023 — NOW",
    company: "Carbon Businesses / Vella",
    role: "Frontend Developer",
    detail:
      "Shipping savings products and financial analytics with D3.js and Chart.js, supported by usability testing and accessibility audits.",
  },
  {
    period: "2020 — 2024",
    company: "Odigital + MaiTech",
    role: "Frontend Lead / Developer",
    detail:
      "Progressed from intern to frontend lead, mentored junior engineers and delivered responsive commerce and logistics experiences across agencies and product teams.",
  },
] as const;

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}
