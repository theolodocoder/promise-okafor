"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function MotionLayer() {
  const pathname = usePathname();

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.1,
      anchors: { offset: -20 },
    });

    const onTick = (time: number) => lenis.raf(time * 1000);
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".scroll-progress",
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { start: 0, end: "max", scrub: 0.2 },
        },
      );

      gsap.from("[data-hero-line]", {
        yPercent: 115,
        rotate: 2,
        duration: 1.25,
        stagger: 0.12,
        ease: "power4.out",
        delay: 0.1,
      });

      gsap.from("[data-hero-fade]", {
        opacity: 0,
        y: 24,
        duration: 0.9,
        stagger: 0.08,
        ease: "power3.out",
        delay: 0.55,
      });

      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
        gsap.from(element, {
          opacity: 0,
          y: 55,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: element,
            start: "top 86%",
            once: true,
          },
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-project-card]").forEach((card) => {
        const visual = card.querySelector("[data-project-visual]");
        if (!visual) return;
        gsap.fromTo(
          visual,
          { clipPath: "inset(9% 0 9% 0 round 24px)", scale: 0.96 },
          {
            clipPath: "inset(0% 0 0% 0 round 24px)",
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: card,
              start: "top 88%",
              end: "center 56%",
              scrub: 0.8,
            },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-drift]").forEach((element) => {
        gsap.to(element, {
          yPercent: -14,
          ease: "none",
          scrollTrigger: {
            trigger: element.parentElement,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });
    });

    const onMove = (event: PointerEvent) => {
      const dot = document.querySelector<HTMLElement>(".cursor-dot");
      if (!dot) return;
      gsap.to(dot, { x: event.clientX, y: event.clientY, duration: 0.35, ease: "power3.out" });
    };
    window.addEventListener("pointermove", onMove);

    const id = window.setTimeout(() => ScrollTrigger.refresh(), 120);

    return () => {
      window.clearTimeout(id);
      window.removeEventListener("pointermove", onMove);
      ctx.revert();
      gsap.ticker.remove(onTick);
      lenis.destroy();
    };
  }, [pathname]);

  return (
    <>
      <div className="scroll-progress" aria-hidden="true" />
      <div className="cursor-dot" aria-hidden="true" />
    </>
  );
}
