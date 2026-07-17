export function BlogRuntimeVisual({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "runtime-visual is-compact" : "runtime-visual"} aria-hidden="true">
      <div className="runtime-grid" />
      <div className="runtime-label">PAJE / RUNTIME STUDY</div>
      <div className="runtime-orbit runtime-orbit-one" />
      <div className="runtime-orbit runtime-orbit-two" />
      <div className="runtime-node runtime-state"><span>01</span><strong>STATE</strong></div>
      <div className="runtime-node runtime-action"><span>02</span><strong>DISPATCH</strong></div>
      <div className="runtime-node runtime-view"><span>03</span><strong>VIEW</strong></div>
      <div className="runtime-core"><i />PAJE</div>
      <div className="runtime-caption">A SMALL REACTIVE LOOP<br />WITH NOWHERE TO HIDE</div>
    </div>
  );
}
