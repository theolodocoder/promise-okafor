import type { CSSProperties } from "react";
import { Portrait } from "@/components/portrait";
import { EMAIL, GITHUB_URL, LINKEDIN_URL, RESUME_URL } from "@/lib/site";

const HEADLINE = "Frontend engineer. I make decisions a team does not have to".split(" ");
const delay = (i: number) => ({ "--d": i }) as CSSProperties;

export function Hero() {
  return (
    <header className="hero band">
      <div className="txt wrap">
        <h1>
          {HEADLINE.map((word, i) => <span key={i}><span className="w" style={delay(i)}>{word}</span>{" "}</span>)}
          <span style={{ whiteSpace: "nowrap" }}><i className="w" style={delay(HEADLINE.length)}>undo</i><span className="w" style={delay(HEADLINE.length + 1)}>.</span></span>
        </h1>
        <div className="story">
          <p style={delay(0)}>I started as an intern in 2020. Six months later I was leading the frontend.</p>
          <p style={delay(1)}>Since then I have been the first frontend engineer at three companies. That means I set up the codebase, picked the tools, wrote the standards, and then lived with every one of those choices.</p>
          <p style={delay(2)}>It taught me what holds up and what a team ends up paying for later. Today I lead the frontend at Cosella, from Lagos, across web, desktop and mobile.</p>
        </div>
        <div className="links" style={delay(3)}><a href={`mailto:${EMAIL}`}>Email</a><a href={GITHUB_URL}>GitHub</a><a href={LINKEDIN_URL}>LinkedIn</a><a href={RESUME_URL}>Resume</a></div>
      </div>
      <div className="art"><Portrait /></div>
    </header>
  );
}
