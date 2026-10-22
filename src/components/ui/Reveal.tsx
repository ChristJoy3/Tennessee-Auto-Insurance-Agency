"use client";
/**
 * Motion primitives (all respect prefers-reduced-motion, all clean up via useGSAP):
 * - RevealText: masked line reveal (SplitText lines); chars only for the biggest headlines on desktop.
 * - Reveal: fade/rise for any block, optional stagger over [data-reveal-item] children.
 * - CoverageFrame: a rounded "coverage" outline draws closed around content, then the content clears in.
 * - RouteLine: an SVG path that plots itself on scroll like a GPS route.
 */
import { useRef } from "react";
import { gsap, ScrollTrigger, SplitText, useGSAP, MQ } from "@/lib/gsap";

type Tag = "h1" | "h2" | "h3" | "p" | "div" | "span";

export function RevealText({
  as: As = "h2",
  children,
  className = "",
  chars = false,
  delay = 0,
  immediate = false,
  id,
}: {
  id?: string;
  as?: Tag;
  children: React.ReactNode;
  className?: string;
  chars?: boolean;
  delay?: number;
  immediate?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add({ desktop: MQ.desktop, reduce: MQ.reduce }, (ctx) => {
        const { desktop, reduce } = ctx.conditions as { desktop: boolean; reduce: boolean };
        if (reduce) return;
        const useChars = chars && desktop;
        const split = SplitText.create(el, { type: useChars ? "lines,chars" : "lines", mask: "lines", linesClass: "split-line" });
        const targets = useChars ? split.chars : split.lines;
        gsap.from(targets, {
          yPercent: 110,
          duration: useChars ? 1.1 : 1.2,
          stagger: useChars ? 0.018 : 0.09,
          delay,
          ease: "expo.out",
          scrollTrigger: immediate ? undefined : { trigger: el, start: "top 88%", once: true },
        });
        return () => split.revert();
      });
      return () => mm.revert();
    },
    { scope: ref },
  );
  return (
    <As ref={ref as never} className={className} id={id}>
      {children}
    </As>
  );
}

export function Reveal({ children, className = "", stagger = 0.08, y = 40, as: As = "div", id }: { children: React.ReactNode; className?: string; stagger?: number; y?: number; as?: "div" | "section" | "ul" | "article"; id?: string }) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const el = ref.current;
      if (!el || window.matchMedia(MQ.reduce).matches) return;
      const items = el.querySelectorAll("[data-reveal-item]");
      gsap.from(items.length ? items : el, {
        y,
        opacity: 0,
        duration: 1.1,
        stagger,
        ease: "expo.out",
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
      });
    },
    { scope: ref },
  );
  return (
    <As ref={ref as never} className={className} id={id}>
      {children}
    </As>
  );
}

/** Rounded coverage frame: dashed outline draws fully closed, turns solid, content clears in. */
export function CoverageFrame({ children, className = "", radius = 28, color = "var(--red)", innerClassName = "" }: { children: React.ReactNode; className?: string; radius?: number; color?: string; innerClassName?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.querySelector<SVGRectElement>(".cov-rect");
      const inner = el.querySelector<HTMLElement>(".cov-inner");
      if (!rect || !inner) return;
      const size = () => {
        rect.setAttribute("width", String(Math.max(0, el.offsetWidth - 2)));
        rect.setAttribute("height", String(Math.max(0, el.offsetHeight - 2)));
      };
      size();
      const ro = new ResizeObserver(size);
      ro.observe(el);
      if (window.matchMedia(MQ.reduce).matches) {
        gsap.set(rect, { opacity: 0 });
        return () => ro.disconnect();
      }
      const len = rect.getTotalLength();
      gsap.set(rect, { strokeDasharray: len, strokeDashoffset: len });
      gsap.set(inner, { clipPath: `inset(8% 8% 8% 8% round ${radius}px)`, opacity: 0 });
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 80%", once: true } });
      tl.to(rect, { strokeDashoffset: 0, duration: 1.4, ease: "power3.inOut" })
        .to(inner, { clipPath: `inset(0% 0% 0% 0% round ${radius}px)`, opacity: 1, duration: 1.1, ease: "expo.out" }, "-=0.35")
        .to(rect, { opacity: 0, duration: 0.6 }, "-=0.4");
      return () => ro.disconnect();
    },
    { scope: ref },
  );
  return (
    <div ref={ref} className={`relative ${className}`}>
      <svg className="pointer-events-none absolute inset-0 z-10 h-full w-full overflow-visible" aria-hidden="true">
        <rect className="cov-rect" x="1" y="1" width="0" height="0" rx={radius} fill="none" stroke={color} strokeWidth="2" />
      </svg>
      <div className={`cov-inner overflow-hidden ${innerClassName}`} style={{ borderRadius: radius }}>
        {children}
      </div>
    </div>
  );
}

/**
 * Route line: draws itself as you scroll (scrub). `d` is in a 0–1000 × 0–1000 viewBox
 * stretched to the container. Dashed overlay mimics lane markings.
 */
export function RouteLine({ d, className = "", stroke = "var(--red)", width = 2, scrub = true, start = "top 80%", end = "bottom 40%", dashed = true }: { d: string; className?: string; stroke?: string; width?: number; scrub?: boolean; start?: string; end?: string; dashed?: boolean }) {
  const ref = useRef<SVGSVGElement>(null);
  useGSAP(
    () => {
      const svg = ref.current;
      if (!svg) return;
      const p = svg.querySelector<SVGPathElement>(".route-draw");
      if (!p) return;
      if (window.matchMedia(MQ.reduce).matches) return;
      const len = p.getTotalLength();
      gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
      gsap.to(p, {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: scrub ? { trigger: svg, start, end, scrub: 0.8 } : { trigger: svg, start, once: true },
        duration: scrub ? undefined : 2,
      });
    },
    { scope: ref },
  );
  return (
    <svg ref={ref} className={`pointer-events-none ${className}`} viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">
      {dashed && <path d={d} fill="none" stroke={stroke} strokeOpacity="0.18" strokeWidth={width} strokeDasharray="8 10" vectorEffect="non-scaling-stroke" />}
      <path className="route-draw" d={d} fill="none" stroke={stroke} strokeWidth={width} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export { ScrollTrigger };
