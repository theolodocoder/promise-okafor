"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const home = pathname === "/";

  const href = (anchor: string) => (home ? anchor : `/${anchor}`);

  return (
    <header className="site-header">
      <Link className="wordmark" href="/" aria-label="Promise Okafor, home" onClick={() => setOpen(false)}>
        P/O<span>®</span>
      </Link>
      <button
        className="menu-toggle"
        type="button"
        aria-expanded={open}
        aria-controls="site-nav"
        onClick={() => setOpen((value) => !value)}
      >
        <span>{open ? "Close" : "Menu"}</span>
        <i aria-hidden="true" />
      </button>
      <nav id="site-nav" className={open ? "site-nav is-open" : "site-nav"} aria-label="Primary navigation">
        <a href={href("#work")} onClick={() => setOpen(false)}>Work</a>
        <a href={href("#about")} onClick={() => setOpen(false)}>About</a>
        <a href={href("#experience")} onClick={() => setOpen(false)}>Experience</a>
        <a href={href("#contact")} onClick={() => setOpen(false)}>Contact</a>
      </nav>
    </header>
  );
}
