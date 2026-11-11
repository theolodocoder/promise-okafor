"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// [selector, modulo]: --d staggers neighbours, 0 means count straight through.
const RISE: [string, number][] = [[".head p", 0], [".cap", 2], [".posts li", 0], [".ask p, .cta", 0], [".cols div", 3]];

// .legal is not animated: at the very bottom it sits inside the excluded 6% and would never intersect.
// Marks what rises into place, then switches each thing on (class "in") the first time it is seen.
// The hidden start states live in motion.css under html.js:not(.shown), so nothing depends on this running to be visible.
export function Motion() {
  const pathname = usePathname(); // the layout persists across routes: look again for the new page's elements
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("m"); // tells the head script's 3s safety net that Motion took over
    try {
      for (const [sel, per] of RISE) {
        document.querySelectorAll<HTMLElement>(sel).forEach((el, i) => {
          el.classList.add("rv");
          el.style.setProperty("--d", String(per ? i % per : i));
        });
      }
      document.querySelectorAll<HTMLElement>(".tile").forEach((t, i) => t.style.setProperty("--d", t.classList.contains("wide") ? "0" : String((i + 1) % 2)));
      const reveal = (entries: IntersectionObserverEntry[], obs: IntersectionObserver) => entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        obs.unobserve(e.target);
      });
      const io = new IntersectionObserver(reveal, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
      // a band can be many screens tall (a case study, a long grid) and never show 12% of itself at once: its top arriving is enough
      const tall = new IntersectionObserver(reveal, { threshold: 0, rootMargin: "0px 0px -6% 0px" });
      document.querySelectorAll(".band, .rv, h1, h2, .tile, .mark").forEach((el) => {
        if (!el.classList.contains("in")) (el.classList.contains("band") ? tall : io).observe(el);
      });
      return () => { io.disconnect(); tall.disconnect(); };
    } catch {
      root.classList.add("shown"); // never leave anything hidden
    }
  }, [pathname]);
  return null;
}
