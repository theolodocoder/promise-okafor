export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://promise-okafor.vercel.app").replace(/\/$/, "");
export const SITE_NAME = "Promise Okafor";
export const SITE_TITLE = "Promise Okafor, frontend engineer";
export const SITE_DESCRIPTION = "Frontend engineer in Lagos. I set up frontends that scale and make decisions a team does not have to undo. Web, desktop and mobile.";
export const OG_IMAGE = "/og-blog.png";
export const PERSON_ID = `${SITE_URL}/#promise-okafor`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const BLOG_ID = `${SITE_URL}/blog/#blog`;

export const SOCIAL_LINKS = [
  "https://github.com/theolodocoder",
  "https://www.linkedin.com/in/promise-okafor-15a3851b5",
];

export const EMAIL = "goforprodev@gmail.com";
export const BOOKING_URL = `mailto:${EMAIL}?subject=Call`;
export const GITHUB_URL = SOCIAL_LINKS[0];
export const LINKEDIN_URL = SOCIAL_LINKS[1];
export const X_URL = "https://x.com/goforprodev";
export const RESUME_URL = "mailto:goforprodev@gmail.com?subject=Requesting%20Promise%20Okafor%27s%20current%20resume";

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
