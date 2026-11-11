import type { WorkMeta } from "@/lib/works";

// Every tile sits below the hero, so every screenshot waits until it is near the screen.
function Img({ image }: { image: { src: string; alt: string } }) {
  // static export: plain img, the screenshots are already sized for the stage
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={image.src} alt={image.alt} loading="lazy" decoding="async" />;
}

function Visual({ work }: { work: WorkMeta }) {
  const v = work.visual;
  switch (v.kind) {
    case "shot": return v.windows.map((w, i) => <div key={i} className={i ? "win b" : "win"}><Img image={w} /></div>);
    case "phones": return v.items.map((p, i) => <div key={i} className="phone"><Img image={p} /></div>);
    case "big": return <div className="win"><p className="big">{v.text} <i>{v.accent}</i></p></div>;
    case "bars": return <div className="win"><div className="vb"><span>{v.a}</span><i style={{ width: `${v.aPct}%` }} /><span>{v.b}</span><i className="on" style={{ width: `${v.bPct}%` }} /></div></div>;
    case "otp": return <div className="win"><div className="otp"><i /><i /><i /><i /><i /><i /></div></div>;
    case "title": return <div className="win"><p className="big">{work.title}</p></div>;
    case "cover": return null; // drawn by WorkTile
  }
}

export function WorkTile({ work, wide }: { work: WorkMeta; wide: boolean }) {
  const v = work.visual;
  const trio = v.kind === "shot" && v.windows.length === 2 && work.phone;
  return (
    // a plain anchor, not next/link, so the cross-document view transition fires
    <a className={wide ? "tile wide" : "tile"} href={`/work/${work.slug}/`}>
      {v.kind === "cover" ? (
        // a designed cover fills the whole frame: no backdrop, window or phone
        <div className="frame cover"><Img image={v} /></div>
      ) : (
        <div className={`frame bd-${work.backdrop}${trio ? " trio" : ""}`}>
          <Visual work={work} />
          {work.phone && <div className="phone"><Img image={work.phone} /></div>}
        </div>
      )}
      <div className="cap">
        <h3 style={{ viewTransitionName: `work-${work.slug}` }}>{work.title}</h3>
        <span>{work.year}{work.draft && " Draft"}</span>
        <p>{work.line}</p>
        <em>{work.field}</em>
      </div>
    </a>
  );
}
