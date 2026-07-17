export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://promise-okafor-portfolio.goforprodev.chatgpt.site").replace(/\/$/, "");
export const SITE_NAME = "Promise Okafor";
export const SITE_TITLE = "Promise Okafor — Senior Frontend Engineer";
export const SITE_DESCRIPTION = "Senior frontend engineer building accessible, high-performance product systems across web, mobile and desktop with Angular, React, Next.js and TypeScript.";
export const OG_IMAGE = "/og-blog.png";
export const PERSON_ID = `${SITE_URL}/#promise-okafor`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const BLOG_ID = `${SITE_URL}/blog/#blog`;

export const SOCIAL_LINKS = [
  "https://github.com/theolodocoder",
  "https://www.linkedin.com/in/promise-okafor-15a3851b5",
];

export function absoluteUrl(pathname = "/") {
  return `${SITE_URL}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

export function breadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
