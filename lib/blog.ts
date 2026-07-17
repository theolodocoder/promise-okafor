import fs from "node:fs";
import path from "node:path";

export type BlogPostMeta = {
  slug: string;
  title: string;
  summary: string;
  publishedAt: string;
  updatedAt?: string;
  category: string;
  tags: string[];
  featured: boolean;
  readingTime: number;
};

export type BlogPost = BlogPostMeta & {
  content: string;
  html: string;
  toc: Array<{ id: string; title: string; level: 2 | 3 }>;
};

const postsDirectory = path.join(process.cwd(), "content", "posts");

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-");
}

function safeUrl(value: string) {
  return /^(https?:\/\/|mailto:|\/|#)/i.test(value) ? value : "#";
}

function renderInline(value: string) {
  const code: string[] = [];
  let rendered = escapeHtml(value).replace(/`([^`]+)`/g, (_, text: string) => {
    const index = code.push(`<code>${text}</code>`) - 1;
    return `%%INLINE_CODE_${index}%%`;
  });

  rendered = rendered
    .replace(/!\[([^\]]*)\]\(([^\s)]+)(?:\s+&quot;([^&]*)&quot;)?\)/g, (_, alt: string, source: string) => `<img src="${escapeHtml(safeUrl(source))}" alt="${alt}" loading="lazy" />`)
    .replace(/\[([^\]]+)\]\(([^\s)]+)\)/g, (_, label: string, source: string) => {
      const external = /^https?:\/\//i.test(source) ? ' target="_blank" rel="noreferrer"' : "";
      return `<a href="${escapeHtml(safeUrl(source))}"${external}>${label}</a>`;
    })
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|\s)\*([^*]+)\*/g, "$1<em>$2</em>")
    .replace(/%%INLINE_CODE_(\d+)%%/g, (_, index: string) => code[Number(index)] ?? "");

  return rendered;
}

function isBlockStart(line: string) {
  return /^(#{2,3})\s+|^```|^>\s?|^[-*]\s+|^\d+\.\s+|^---$|^!\[/.test(line);
}

export function renderMarkdown(markdown: string) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html: string[] = [];

  for (let index = 0; index < lines.length; ) {
    const line = lines[index].trimEnd();
    if (!line.trim()) { index += 1; continue; }

    if (line.startsWith("```")) {
      const language = line.slice(3).trim().replace(/[^a-z0-9-]/gi, "");
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].startsWith("```")) { code.push(lines[index]); index += 1; }
      index += 1;
      html.push(`<pre><code${language ? ` class="language-${language}"` : ""}>${escapeHtml(code.join("\n"))}</code></pre>`);
      continue;
    }

    const heading = line.match(/^(#{2,3})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      const title = heading[2].replace(/[*`]/g, "");
      html.push(`<h${level} id="${slugify(title)}">${renderInline(heading[2])}</h${level}>`);
      index += 1;
      continue;
    }

    if (line === "---") { html.push("<hr />"); index += 1; continue; }

    if (line.startsWith(">")) {
      const quote: string[] = [];
      while (index < lines.length && lines[index].trimStart().startsWith(">")) { quote.push(lines[index].trimStart().replace(/^>\s?/, "")); index += 1; }
      html.push(`<blockquote><p>${renderInline(quote.join(" "))}</p></blockquote>`);
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) { items.push(`<li>${renderInline(lines[index].trim().replace(/^[-*]\s+/, ""))}</li>`); index += 1; }
      html.push(`<ul>${items.join("")}</ul>`);
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) { items.push(`<li>${renderInline(lines[index].trim().replace(/^\d+\.\s+/, ""))}</li>`); index += 1; }
      html.push(`<ol>${items.join("")}</ol>`);
      continue;
    }

    if (/^!\[/.test(line)) { html.push(`<figure>${renderInline(line)}</figure>`); index += 1; continue; }

    const paragraph = [line.trim()];
    index += 1;
    while (index < lines.length && lines[index].trim() && !isBlockStart(lines[index].trim())) { paragraph.push(lines[index].trim()); index += 1; }
    html.push(`<p>${renderInline(paragraph.join(" "))}</p>`);
  }

  return html.join("\n");
}

function parseFrontmatter(source: string) {
  if (!source.startsWith("---\n")) return { attributes: new Map<string, string>(), content: source };
  const end = source.indexOf("\n---\n", 4);
  if (end === -1) return { attributes: new Map<string, string>(), content: source };
  const attributes = new Map<string, string>();
  source.slice(4, end).split("\n").forEach((line) => {
    const separator = line.indexOf(":");
    if (separator === -1) return;
    attributes.set(line.slice(0, separator).trim(), line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, ""));
  });
  return { attributes, content: source.slice(end + 5).trim() };
}

function getToc(markdown: string) {
  const toc: BlogPost["toc"] = [];
  let inFence = false;
  markdown.split("\n").forEach((line) => {
    if (line.startsWith("```")) { inFence = !inFence; return; }
    if (inFence) return;
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (!match) return;
    const title = match[2].replace(/[*`]/g, "");
    toc.push({ id: slugify(title), title, level: match[1].length as 2 | 3 });
  });
  return toc;
}

function parsePost(fileName: string): BlogPost {
  const slug = fileName.replace(/\.md$/, "");
  const source = fs.readFileSync(path.join(postsDirectory, fileName), "utf8");
  const { attributes, content } = parseFrontmatter(source);
  const words = content.replace(/```[\s\S]*?```/g, " ").replace(/[#>*_`\[\]()-]/g, " ").match(/\b[\w’'-]+\b/g)?.length ?? 0;
  return {
    slug,
    title: attributes.get("title") ?? slug,
    summary: attributes.get("summary") ?? "",
    publishedAt: attributes.get("publishedAt") ?? new Date().toISOString(),
    updatedAt: attributes.get("updatedAt") || undefined,
    category: attributes.get("category") ?? "Engineering",
    tags: (attributes.get("tags") ?? "").replace(/^\[|\]$/g, "").split(",").map((tag) => tag.trim()).filter(Boolean),
    featured: attributes.get("featured") === "true",
    readingTime: Math.max(1, Math.ceil(words / 210)),
    content,
    html: renderMarkdown(content),
    toc: getToc(content),
  };
}

export function getAllPosts() {
  if (!fs.existsSync(postsDirectory)) return [];
  return fs.readdirSync(postsDirectory).filter((file) => file.endsWith(".md")).map(parsePost).sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
}

export function getPost(slug: string) {
  const fileName = `${slug}.md`;
  return fs.existsSync(path.join(postsDirectory, fileName)) ? parsePost(fileName) : undefined;
}

export function formatPostDate(value: string) {
  return new Intl.DateTimeFormat("en", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(value));
}

export { escapeHtml as escapeXml };
