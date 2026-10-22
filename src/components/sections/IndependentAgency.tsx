"use client";
/**
 * Why an Independent Agency. Signature moment: your one lane splits into several carrier lanes
 * and merges back into a single "best rate for you" lane. Purely illustrative — no numbers.
 * Desktop: horizontal, pinned briefly and scrubbed. Mobile: vertical, drawn on scroll, no pin.
 */
import { useRef } from "react";
import { gsap, useGSAP, MQ } from "@/lib/gsap";
import { t, type Lang } from "@/lib/i18n";
import SectionHead from "@/components/ui/SectionHead";

function lanes(names: string[], vertical: boolean) {
  // Horizontal geometry in a 1000 × 520 box; vertical swaps axes (520 × 1000)
  const n = names.length;
  const mid = 260;
  const spread = 400;
  const paths = names.map((_, i) => {
    const y = mid - spread / 2 + (spread / (n - 1)) * i;
    const d = `M 180 ${mid} C 300 ${mid}, 300 ${y}, 420 ${y} L 580 ${y} C 700 ${y}, 700 ${mid}, 820 ${mid}`;
    return { d, y };
  });
  const tx = (d: string) => (vertical ? d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (_, a, b) => `${b} ${a}`) : d);
  return {
    vertical,
    viewBox: vertical ? "0 0 520 1000" : "0 0 1000 520",
    inLane: tx(`M 0 ${mid} L 180 ${mid}`),
    outLane: tx(`M 820 ${mid} L 1000 ${mid}`),
    carriers: paths.map((p, i) => ({ d: tx(p.d), label: names[i], lx: vertical ? p.y - 8 : 500, ly: vertical ? 500 : p.y - 12 })),
    you: vertical ? { x: mid + 18, y: 60 } : { x: 20, y: mid - 18 },
    best: vertical ? { x: mid + 18, y: 960 } : { x: 990, y: mid - 18 },
  };
}

export default function IndependentAgency({ lang, carriers }: { lang: Lang; carriers: string[] }) {
  const d = t(lang);
  const root = useRef<HTMLElement>(null);
  const h = lanes(carriers, false);
  const v = lanes(carriers, true);

  useGSAP(
    () => {
      if (window.matchMedia(MQ.reduce).matches) return;
      const mm = gsap.matchMedia();
      const build = (svgSel: string, pin: boolean) => {
        const svg = root.current!.querySelector<SVGSVGElement>(svgSel)!;
        const draw = (sel: string) =>
          Array.from(svg.querySelectorAll<SVGPathElement>(sel)).map((p) => {
            const len = p.getTotalLength();
            gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
            return p;
          });
        const inL = draw(".ln-in"), cars = draw(".ln-car"), outL = draw(".ln-out");
        gsap.set(svg.querySelectorAll(".ln-label"), { opacity: 0 });
        gsap.set(svg.querySelectorAll(".ln-best"), { opacity: 0, scale: 0.8, transformOrigin: "50% 50%" });
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: pin
            ? { trigger: svg.closest(".lane-stage"), start: "center center", end: "+=900", scrub: 0.8, pin: true }
            : { trigger: svg, start: "top 75%", end: "bottom 60%", scrub: 0.8 },
        });
        tl.to(inL, { strokeDashoffset: 0, duration: 0.2 })
          .to(cars, { strokeDashoffset: 0, duration: 0.5, stagger: 0.03 })
          .to(svg.querySelectorAll(".ln-label"), { opacity: 1, duration: 0.15, stagger: 0.03 }, "<0.15")
          .to(outL, { strokeDashoffset: 0, duration: 0.2 })
          .to(svg.querySelectorAll(".ln-best"), { opacity: 1, scale: 1, duration: 0.15 });
      };
      mm.add(MQ.desktop, () => build(".lanes-h", true));
      mm.add(MQ.tablet, () => build(".lanes-h", false));
      mm.add(MQ.mobile, () => build(".lanes-v", false));
      return () => mm.revert();
    },
    { scope: root },
  );

  const Svg = ({ g, className }: { g: ReturnType<typeof lanes>; className: string }) => (
    <svg viewBox={g.viewBox} className={className} role="img" aria-label={lang === "es" ? "Ilustración: su solicitud pasa por varias aseguradoras y regresa como una sola tarifa" : "Illustration: your request runs through several carriers and comes back as one rate"}>
      <path className="ln-in" d={g.inLane} fill="none" stroke="var(--paper)" strokeWidth="3" strokeLinecap="round" />
      {g.carriers.map((c) => (
        <g key={c.label}>
          <path d={c.d} fill="none" stroke="var(--paper)" strokeOpacity="0.14" strokeWidth="2" strokeDasharray="6 8" />
          <path className="ln-car" d={c.d} fill="none" stroke="var(--paper)" strokeOpacity="0.75" strokeWidth="2" strokeLinecap="round" />
          <text className="ln-label" x={c.lx} y={c.ly} transform={g.vertical ? `rotate(-90 ${c.lx} ${c.ly})` : undefined} textAnchor="middle" fill="var(--paper)" fontSize="15" fontFamily="var(--font-jetbrains)" letterSpacing="1.5">
            {c.label.toUpperCase()}
          </text>
        </g>
      ))}
      <path className="ln-out" d={g.outLane} fill="none" stroke="var(--red)" strokeWidth="5" strokeLinecap="round" />
      <text x={g.you.x} y={g.you.y} fill="var(--paper)" fontSize="16" fontFamily="var(--font-jetbrains)" letterSpacing="2">{d.laneYou.toUpperCase()}</text>
      <text className="ln-best" x={g.best.x} y={g.best.y} textAnchor="end" fill="var(--red)" fontSize="18" fontWeight="700" fontFamily="var(--font-jetbrains)" letterSpacing="2">
        {d.laneBest.toUpperCase()}
      </text>
    </svg>
  );

  return (
    <section ref={root} className="on-dark section relative overflow-hidden" aria-labelledby="agency-title">
      <div className="wrap">
        <div className="grid gap-10 xl:grid-cols-12">
          <SectionHead className="xl:col-span-7" mile={2} label={d.agencyLabel} title={d.agencyTitle} id="agency-title" dark />
          <div className="space-y-5 xl:col-span-4 xl:col-start-9 xl:self-end">
            <p className="lead text-paper/85">{d.agencyBody}</p>
            <p className="font-display text-2xl font-bold leading-tight [font-stretch:110%]">“{d.agencyBody2}”</p>
          </div>
        </div>
      </div>
      <div className="lane-stage wrap mt-12 flex min-h-[60svh] items-center xl:mt-4 xl:h-[100svh]">
        <Svg g={h} className="lanes-h hidden w-full md:block" />
        <Svg g={v} className="lanes-v mx-auto block h-[110svh] max-h-[900px] w-full md:hidden" />
      </div>
    </section>
  );
}
