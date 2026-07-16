import type { Project } from "@/data/portfolio";

export function ProjectVisual({ project, compact = false }: { project: Project; compact?: boolean }) {
  return (
    <div
      className={`project-visual tone-${project.tone} ${compact ? "is-compact" : ""}`}
      data-project-visual
      aria-label={`Visual placeholder for the ${project.title} case study`}
      role="img"
    >
      <div className="visual-grain" />
      <div className="visual-topline">
        <span>{project.category}</span>
        <span>{project.year}</span>
      </div>

      {project.slug === "paje" && (
        <div className="paje-ui" data-drift>
          <div className="paje-mark">paje<span>.</span></div>
          <div className="paje-code">
            <span><b>const</b> app = createPaje(&#123;</span>
            <span>&nbsp;&nbsp;state, view, reducers</span>
            <span>&#125;);</span>
          </div>
          <div className="paje-orbit"><i /><i /><i /></div>
          <div className="visual-stamp">6.2<br /><small>KB</small></div>
        </div>
      )}

      {project.slug === "triggr-cloud" && (
        <div className="console-ui" data-drift>
          <aside>
            <div className="console-logo">TRIGGR<span>●</span></div>
            <i className="active" /><i /><i /><i />
          </aside>
          <div className="console-main">
            <div className="console-heading"><span>Event stream</span><b>LIVE</b></div>
            <div className="event-row"><i /><span>Transfer(address,address,uint256)</span><b>0x72…a1</b></div>
            <div className="event-row"><i /><span>Trigger executed</span><b>84ms</b></div>
            <div className="event-row muted"><i /><span>Document updated</span><b>200</b></div>
            <div className="console-chart"><i /><i /><i /><i /><i /><i /><i /></div>
          </div>
        </div>
      )}

      {project.slug === "cosella" && (
        <div className="cosella-ui" data-drift>
          <div className="cosella-window">
            <div className="cosella-titlebar">
              <span className="window-controls"><i /><i /><i /></span>
              <b>Cosella · Call copilot</b>
              <span className="live-pill"><i /> Live</span>
            </div>
            <div className="cosella-workspace">
              <aside className="call-transcript">
                <div className="cosella-section-label"><span>Conversation</span><b>00:18:42</b></div>
                <div className="transcript-turn"><i>R</i><p><b>Representative</b><span>Let me show you how the workflow fits your team.</span></p></div>
                <div className="transcript-turn prospect"><i>P</i><p><b>Prospect</b><span>We already have a process in place.</span></p></div>
                <div className="transcript-wave"><i /><i /><i /><i /><i /><i /><i /><i /></div>
              </aside>
              <section className="copilot-panel">
                <div className="cosella-section-label"><span>Live guidance</span><b>Playbook</b></div>
                <div className="guidance-card">
                  <span className="signal-label"><i /> Objection detected</span>
                  <h3>Meet them where they are.</h3>
                  <p>Acknowledge the current process, then explore what the team would improve first.</p>
                  <div className="suggestion-line"><span>Suggested response</span><i /></div>
                  <div className="suggestion-copy"><i /><i /><i /></div>
                </div>
                <div className="copilot-status"><span><i /> Listening</span><b>Guidance ready</b></div>
              </section>
            </div>
          </div>
          <div className="cosella-float"><i /> Realtime context, without breaking the conversation.</div>
        </div>
      )}

      {project.slug === "resume-parser" && (
        <div className="parser-ui" data-drift>
          <div className="paper-sheet">
            <div className="paper-head"><i /><span><b>PROMISE OKAFOR</b><small>Senior Frontend Engineer</small></span></div>
            <em />
            <em />
            <em className="short" />
            <div className="scan-line" />
          </div>
          <div className="parser-panel">
            <span>PROFILE</span><b>0.98</b>
            <span>EXPERIENCE</span><b>0.94</b>
            <span>SKILLS</span><b>0.97</b>
            <div className="parser-done">STRUCTURED</div>
          </div>
        </div>
      )}

      <div className="visual-caption">Image placeholder · replace with product capture</div>
    </div>
  );
}
