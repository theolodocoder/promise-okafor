"use client";

import { useEffect, useState } from "react";

export function BlogArticleTools({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const blocks = Array.from(document.querySelectorAll<HTMLElement>(".article-prose pre"));
    const cleanups = blocks.map((block) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "code-copy";
      button.textContent = "Copy";
      button.setAttribute("aria-label", "Copy code to clipboard");
      const copy = async () => {
        await navigator.clipboard.writeText(block.querySelector("code")?.textContent ?? "");
        button.textContent = "Copied";
        window.setTimeout(() => { button.textContent = "Copy"; }, 1600);
      };
      button.addEventListener("click", copy);
      block.appendChild(button);
      return () => { button.removeEventListener("click", copy); button.remove(); };
    });

    const headings = Array.from(document.querySelectorAll<HTMLElement>(".article-prose h2, .article-prose h3"));
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.find((entry) => entry.isIntersecting);
      if (!visible) return;
      document.querySelectorAll(".article-toc a").forEach((link) => link.classList.remove("is-active"));
      document.querySelector(`.article-toc a[href="#${visible.target.id}"]`)?.classList.add("is-active");
    }, { rootMargin: "-18% 0px -68% 0px" });
    headings.forEach((heading) => observer.observe(heading));

    return () => { cleanups.forEach((cleanup) => cleanup()); observer.disconnect(); };
  }, []);

  const share = async () => {
    if (navigator.share) { await navigator.share({ title, url: window.location.href }); return; }
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return <div className="article-share"><span>PASS IT ON</span><button type="button" onClick={share}>{copied ? "Link copied" : "Share article"}<i aria-hidden="true">↗</i></button></div>;
}
