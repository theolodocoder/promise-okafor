# SEO operations

The technical SEO layer is generated during every production build.

## Automatic

- Self-referencing canonical URLs for the home page, blog, articles, and case studies
- Unique titles, descriptions, Open Graph, and X card metadata
- `ProfilePage`, `Person`, `WebSite`, `Blog`, `BlogPosting`, `CreativeWork`, and breadcrumb JSON-LD
- XML sitemap, robots.txt, RSS discovery, web manifest, and branded application icons
- Article publication/update dates, reading metadata, topics, author identity, and word count

The production origin is defined in `lib/site.ts`. Set `NEXT_PUBLIC_SITE_URL` during the build when moving to a custom domain; otherwise the current Sites production URL is used.

## Required after the site is public

1. Add the final public origin as a domain or URL-prefix property in Google Search Console.
2. Submit `/sitemap.xml` in the Sitemaps report.
3. Inspect the home page, blog index, first article, and top case study, then request indexing.
4. Run the article through Google Rich Results Test and inspect all JSON-LD with Schema Markup Validator.
5. Add the property to Bing Webmaster Tools and submit the same sitemap.

When a custom domain is attached, keep one preferred HTTPS hostname, update `NEXT_PUBLIC_SITE_URL`, rebuild, and submit the new sitemap. Avoid running both origins as independently indexable versions.
