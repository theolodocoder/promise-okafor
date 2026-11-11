import type { CSSProperties } from "react";
import Link from "next/link";
import { CopyEmail } from "@/components/copy-email";
import { LagosClock } from "@/components/lagos-clock";
import { BOOKING_URL, GITHUB_URL, LINKEDIN_URL, RESUME_URL, X_URL } from "@/lib/site";

// Always dark, in both themes.
export function Footer() {
  return (
    <footer className="foot" id="contact">
      <div className="ask wrap">
        <div>
          <h2><span className="up">Have a frontend problem that has been hard to <i>solve</i>?</span></h2>
          <p>Tell me about it. A short call is enough to start, and if I am not the right person I will say so.</p>
        </div>
        <div className="cta">
          {/* a plain anchor: the booking link is mailto or external, never a Next route */}
          <a className="btn" href={BOOKING_URL}>Book a call</a>
          <CopyEmail />
        </div>
      </div>
      <div className="cols">
        <div><b>On this site</b><Link href="/#works">Works</Link><Link href="/#writings">Writings</Link><a href={RESUME_URL}>Resume</a></div>
        <div><b>Elsewhere</b><a href={GITHUB_URL}>GitHub</a><a href={LINKEDIN_URL}>LinkedIn</a><a href={X_URL}>X</a></div>
        <div><b>Where I am</b>Lagos, Nigeria<br /><LagosClock /> right now, UTC+1</div>
      </div>
      <p className="mark" aria-hidden="true">{[..."Promise Okafor"].map((c, i) => (c === " " ? " " : <span key={i} className="ch" style={{ "--d": i } as CSSProperties}>{c}</span>))}</p>
      <div className="legal wrap"><span>2026, Promise Okafor</span><span>Uses the Astryx reset (MIT)</span></div>
    </footer>
  );
}
