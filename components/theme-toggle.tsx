"use client";

import { THEME_KEY, type Theme } from "@/lib/theme";

// The label and its accessible name ("Switch to Dark theme") come from CSS on <html data-theme>,
// so both are right from the first paint and the server markup never differs from the client.
export function ThemeToggle() {
  function toggle() {
    const next: Theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem(THEME_KEY, next); } catch {}
    window.dispatchEvent(new Event("themechange"));
  }

  return (
    <button type="button" className="theme-toggle" onClick={toggle}>
      <span className="when-light"><span className="sr-only">Switch to </span>Dark<span className="sr-only"> theme</span></span>
      <span className="when-dark"><span className="sr-only">Switch to </span>Light<span className="sr-only"> theme</span></span>
    </button>
  );
}
