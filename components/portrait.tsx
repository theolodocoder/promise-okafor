"use client";

import { useEffect, useRef } from "react";
import { dotValue, findBackdrop } from "@/lib/halftone";

const SRC = "/portrait-220.jpg";
const CELL = 6;
const REACH = 110;
const DEVELOP_MS = 1500;

export function Portrait() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    const g = cv?.getContext("2d");
    if (!cv || !g) return;
    const ctx = g;
    const canvas = cv;
    const root = document.documentElement;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let lum: Float32Array | null = null;
    let back: Uint8Array | null = null;
    let iw = 0, ih = 0, prog = 1, px = -999, py = -999, queued = 0, develop = 0, alive = true;

    function draw() {
      if (!lum || !back) return;
      const d = Math.min(devicePixelRatio || 1, 2), w = canvas.clientWidth, h = canvas.clientHeight;
      canvas.width = w * d; canvas.height = h * d; ctx.setTransform(d, 0, 0, d, 0, 0);
      const dark = root.dataset.theme === "dark";
      const A = dark ? [157, 185, 255] : [61, 107, 255], B = dark ? [255, 255, 255] : [11, 18, 32];
      // "cover" fit, keeping the face (a little above centre) in view
      const sc = Math.max(w / iw, h / ih), ox = (w - iw * sc) * 0.5, oy = (h - ih * sc) * 0.32;
      for (let y = CELL / 2; y < h; y += CELL) for (let x = CELL / 2; x < w; x += CELL) {
        const sx = Math.floor((x - ox) / sc), sy = Math.floor((y - oy) / sc);
        if (sx < 0 || sy < 0 || sx >= iw || sy >= ih) continue;
        const id = sy * iw + sx;
        const v = dotValue(lum[id], back[id] === 1, dark) * Math.min(1, Math.max(0, (prog * 1.25 - y / h) * 5));
        if (v < 0.04) continue;
        const near = Math.max(0, 1 - Math.hypot(x - px, y - py) / REACH);
        ctx.fillStyle = `rgb(${[0, 1, 2].map((i) => Math.round(A[i] + (B[i] - A[i]) * near)).join(",")})`;
        ctx.beginPath();
        ctx.arc(x, y, CELL * (0.1 + 0.42 * Math.sqrt(v)) * (1 + near * 0.25), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const img = new Image();
    img.onload = () => {
      if (!alive) return;
      const o = document.createElement("canvas");
      iw = o.width = img.width; ih = o.height = img.height;
      const c = o.getContext("2d");
      if (!c) return;
      c.drawImage(img, 0, 0);
      const data = c.getImageData(0, 0, iw, ih).data;
      lum = new Float32Array(iw * ih);
      for (let i = 0; i < lum.length; i++) lum[i] = data[i * 4] / 255;
      back = findBackdrop(lum, iw, ih);
      if (still) { draw(); return; }
      const t0 = performance.now();
      const run = (t: number) => {
        prog = Math.min(1, (t - t0) / DEVELOP_MS);
        draw();
        if (prog < 1) develop = requestAnimationFrame(run);
      };
      prog = 0;
      develop = requestAnimationFrame(run);
    };
    img.src = SRC;

    const slot = canvas.parentElement;
    // at most one redraw per frame
    const redraw = () => { if (!queued) queued = requestAnimationFrame(() => { queued = 0; draw(); }); };
    const onMove = (e: PointerEvent) => {
      const b = canvas.getBoundingClientRect();
      px = e.clientX - b.left; py = e.clientY - b.top;
      redraw();
    };
    const onLeave = () => { px = py = -999; redraw(); };
    window.addEventListener("resize", redraw);
    window.addEventListener("themechange", draw);
    if (!still) {
      slot?.addEventListener("pointermove", onMove as EventListener, { passive: true });
      slot?.addEventListener("pointerleave", onLeave);
    }
    return () => {
      alive = false;
      cancelAnimationFrame(develop); cancelAnimationFrame(queued);
      window.removeEventListener("resize", redraw);
      window.removeEventListener("themechange", draw);
      slot?.removeEventListener("pointermove", onMove as EventListener);
      slot?.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={ref} role="img" aria-label="Portrait of Promise Okafor, drawn in dots" />;
}
