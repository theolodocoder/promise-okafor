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
    slug: "cosella",
    index: "01",
    title: "Cosella",
    category: "Cross-platform AI Product",
    year: "2026",
    summary:
      "A realtime AI sales copilot that turns company playbooks into useful, in-call guidance for B2B sales teams.",
    thesis:
      "A multi-surface frontend platform spanning an Electron desktop companion, React operations tools, Astro marketing and documentation, and shared typed foundations.",
    role: "Frontend architecture & product engineering · Lightforth",
    tags: ["Electron", "React", "TypeScript", "Realtime UX", "Turborepo", "Design Systems"],
    metrics: [
      { value: "5", label: "frontend surfaces" },
      { value: "8+", label: "shared platform packages" },
      { value: "RT", label: "in-call guidance" },
    ],
    challenge:
      "Live sales conversations leave no room for slow, distracting software. The product needed to surface relevant guidance in the flow of a call while keeping public, operational and desktop experiences coherent as the platform grew.",
    system:
      "A modular monorepo gives each surface a focused role: Electron powers the live desktop companion, React supports operational products, and Astro serves public and documentation experiences. Shared design tokens, components, domain contracts and a typed realtime layer keep the system consistent without coupling the apps together.",
    outcome:
      "An evolving frontend foundation that supports a focused live-call experience across desktop and web, while giving the team clear boundaries, reusable systems and room to ship each surface independently.",
    tone: "olive",
  },
  {
    slug: "paje",
    index: "02",
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
    index: "03",
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
    period: "CURRENT",
    company: "Zabira",
    role: "Senior Frontend Engineer",
    summary:
      "Leading frontend delivery across the customer platform, operations back office and a ground-up Angular 21 product architecture.",
    impact: [
      "Structured the v3 application around domain modules, shared UI, centralized state and reusable platform services spanning wallet, crypto, KYC, rewards, virtual cards and transactions.",
      "Shipped secure withdrawal journeys with network and fee selection, OTP confirmation and receipts, plus multilevel back-office approval, device registration and operational exports.",
    ],
    stack: ["Angular 21", "RxJS", "Domain architecture", "Fintech workflows"],
  },
  {
    period: "2024 — NOW",
    company: "Lightforth",
    role: "Frontend Lead / Founding Frontend Engineer",
    summary:
      "Owning frontend architecture across the core career platform and its web, mobile, browser-extension, B2B and desktop surfaces—including Cosella.",
    impact: [
      "Designed fault-tolerant realtime interview and sales sessions with WebSocket prewarming, heartbeats, exponential backoff, reconnection UI and audio-stream recovery across Windows and macOS.",
      "Built product systems spanning resume editing, interview prep, admin, team, billing and knowledge tools, Electron copilots and shared typed foundations so multiple surfaces can evolve coherently.",
    ],
    stack: ["React", "Electron", "React Native", "Realtime systems", "Design systems"],
  },
  {
    period: "2024 — NOW",
    company: "Solace Imaging",
    role: "Frontend Developer",
    summary:
      "Improving the speed and usability of a production medical-imaging platform where dependable access to complex visual data matters.",
    impact: [
      "Implemented lazy loading, image optimization and code splitting to reduce the cost of media-heavy product experiences and improve perceived load time.",
      "Built REST-backed data workflows and translated cross-functional design reviews into responsive, production-ready interfaces.",
    ],
    stack: ["React", "REST APIs", "Performance", "Medical imaging"],
  },
  {
    period: "2023 — NOW",
    company: "Carbon Businesses / Vella Finance",
    role: "Frontend Developer",
    summary:
      "Shipping customer-facing savings products and financial analytics for a fintech platform with multiple investment journeys.",
    impact: [
      "Integrated the Flex, Fixed and Target Savings experiences with backend services, shaping complex financial state into understandable product flows.",
      "Built interactive D3.js and Chart.js dashboards, then used usability testing and WCAG audits to improve comprehension and reduce friction.",
    ],
    stack: ["React", "D3.js", "Chart.js", "Fintech", "Accessibility"],
  },
  {
    period: "2022 — 2024",
    company: "MaiTech Studios",
    role: "Frontend Developer",
    summary:
      "Architected and delivered a full-scale commerce frontend with responsive behavior across device classes and complex asynchronous journeys.",
    impact: [
      "Designed flexible grid and CSS architecture, keeping dense storefront interfaces maintainable across breakpoints and product states.",
      "Implemented Redux middleware and selectors for data fetching and form submission, integrating REST workflows backed by Prisma services.",
    ],
    stack: ["React", "Redux", "REST APIs", "Prisma", "Commerce"],
  },
  {
    period: "2020 — 2022",
    company: "Odigital Agency",
    role: "Frontend Lead · Promoted from intern",
    summary:
      "Progressed from intern to frontend lead, owning delivery across multiple client products while mentoring junior developers.",
    impact: [
      "Designed the Agofure logistics interface, contributing to a reported 25% improvement in customer satisfaction.",
      "Reduced the overall bug count by 20% through stronger QA and testing workflows, while improving the agency site’s accessibility and performance.",
    ],
    stack: ["Frontend leadership", "Logistics", "Testing", "Mentorship"],
  },
] as const;

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}
