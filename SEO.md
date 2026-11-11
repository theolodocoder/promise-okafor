# SEO operations

The technical SEO layer is generated during every production build.

## Automatic

- Self-referencing canonical URLs for the home page, blog, articles, and case studies
- Unique titles, descriptions, Open Graph, and X card metadata
- `ProfilePage`, `Person`, `WebSite`, `Blog`, `BlogPosting`, `CreativeWork`, and breadcrumb JSON-LD
- XML sitemap with a share image and `lastModified` per page (post dates; for works and pages the file's last git commit, or the build date when the build has no git history), robots.txt, web manifest, and branded application icons
- RSS (`/blog/rss.xml`, with each post's share image as an enclosure) and JSON Feed (`/blog/feed.json`), both advertised with `<link rel="alternate">` on every page
- Article publication/update dates, reading metadata, topics, author identity, and word count

Metadata for a page comes from `shareMetadata` in `lib/seo.ts`: canonical, Open Graph, X card and feed links all point at the same canonical URL and share image.

## Share images

Every page has its own 1200x630 PNG in `public/og/` (`home.png`, `blog.png`, `blog/<slug>.png`, `work/<slug>.png`). They are committed, not made during the Vercel build. After adding, retitling or re-covering a page, run `npm run og` (needs Google Chrome; set `CHROME` to use another binary), look at the new PNGs, and commit them.

## Checks

- `npm run check:content`: no em dashes or banned words in content and source (runs before every build).
- `npm run check:seo` (after `npm run build`): every page in `out/` has one canonical with a trailing slash, an `og:url` that matches it, one `og:image` and `twitter:image` that exist in `out/`, image alt text, one `twitter:card`, a title and description, and JSON-LD that parses; titles and descriptions are unique (over 60 or 155 characters is a warning); the sitemap and RSS are well formed and list only built pages and images; the JSON Feed parses and matches the RSS; no draft is published; robots.txt allows all and names the sitemap.

The production origin is defined in `lib/site.ts`. Set `NEXT_PUBLIC_SITE_URL` during the build when moving to a custom domain; otherwise the current Sites production URL is used.

## Required after the site is public

1. Add the final public origin as a domain or URL-prefix property in Google Search Console.
2. Submit `/sitemap.xml` in the Sitemaps report.
3. Inspect the home page, blog index, first article, and top case study, then request indexing.
4. Run the article through Google Rich Results Test and inspect all JSON-LD with Schema Markup Validator.
5. Add the property to Bing Webmaster Tools and submit the same sitemap.

When a custom domain is attached, keep one preferred HTTPS hostname, update `NEXT_PUBLIC_SITE_URL`, rebuild, and submit the new sitemap. Avoid running both origins as independently indexable versions.
