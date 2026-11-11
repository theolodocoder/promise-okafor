import Link from "next/link";
import { Footer } from "@/components/footer";
import { LagosClock } from "@/components/lagos-clock";
import { ThemeToggle } from "@/components/theme-toggle";
import { SITE_NAME } from "@/lib/site";

export function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="page">
      <nav className="nav wrap" aria-label="Primary">
        <Link href="/">{SITE_NAME}</Link>
        <div>
          <Link href="/#works">Works</Link>
          <Link href="/#writings">Writings</Link>
          <a className="contact" href="#contact">Contact</a>
          <span className="dim">Lagos <LagosClock /></span>
          <ThemeToggle />
        </div>
      </nav>
      <main id="main-content">{children}</main>
      <Footer />
    </div>
  );
}
