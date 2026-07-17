# Publishing a blog post

The blog is file-based, so it does not need a backend or CMS.

1. Duplicate `content/posts/building-paje.md`.
2. Rename the file with the URL you want, for example `designing-frontend-platforms.md`.
3. Replace the frontmatter and article body.
4. Commit and push. The post, metadata, reading time, RSS feed, and sitemap update automatically.

```text
---
title: Your article title
summary: A concise one or two sentence description.
publishedAt: 2026-07-17
category: Engineering notes
tags: [Architecture, React, Leadership]
featured: false
---
```

Supported Markdown includes headings (`##` and `###`), paragraphs, bold and italic text, links, inline code, fenced code blocks, quotes, numbered and unordered lists, horizontal rules, and images.
