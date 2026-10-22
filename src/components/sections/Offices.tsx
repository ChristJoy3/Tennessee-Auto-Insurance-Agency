"use client";
/**
 * Two Offices: Murfreesboro + Smyrna cards, and a minimal map outline where a route line draws
 * between the two real office coordinates (projected from lat/lng) as you scroll.
 * Service-area cities as road-sign chips.
 */
import Link from "next/link";
import { useRef } from "react";
import { gsap, useGSAP, MQ } from "@/lib/gsap";
import { href, t, type Lang } from "@/lib/i18n";
import { OFFICES, SERVICE_AREA, directionsUrl } from "@/lib/site";
import type { Staff } from "@/data/content";
import SectionHead from "@/components/ui/SectionHead";
import { Icon } from "@/components/ui/Icons";

// Simple equirectangular projection of the two offices into a 600×420 box
const box = { w: 600, h: 420, pad: 90 };
const lat = OFFICES.map((o) => o.lat), lng = OFFICES.map((o) => o.lng);
const proj = (la: number, ln: number) => {
  const minLa = Math.min(...lat), maxLa = Math.max(...lat), minLn = Math.min(...lng), maxLn = Math.max(...lng);
  return {
    x: box.pad + ((ln - minLn) / (maxLn - minLn)) * (box.w - box.pad * 2),
    y: box.h - box.pad - ((la - minLa) / (maxLa - minLa)) * (box.h - box.pad * 2),
  };
};
const [M, S] = OFFICES.map((o) => proj(o.lat, o.lng));
// A gently curving road between Smyrna (NW) and Murfreesboro (SE), roughly the I-24 / Old Nashville Hwy corridor
const ROAD = `M ${S.x} ${S.y} C ${S.x + 120} ${S.y + 10}, ${M.x - 170} ${M.y - 120}, ${M.x} ${M.y}`;

export default function Offices({ lang, staff }: { lang: Lang; staff: Staff[] }) {
  const d = t(lang);
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      if (window.matchMedia(MQ.reduce).matches) return;
      const p = root.current!.querySelector<SVGPathElement>(".office-road")!;
      const len = p.getTotalLength();
      gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
      gsap.to(p, { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: ".office-map", start: "top 75%", end: "bottom 45%", scrub: 0.8 } });
      gsap.from(".office-pin", { scale: 0, transformOrigin: "50% 50%", stagger: 0.4, duration: 0.8, ease: "back.out(2)", scrollTrigger: { trigger: ".office-map", start: "top 70%", once: true } });
    },
    { scope: root },
  );
  return (
    <section ref={root} id="offices" className="section bg-paper-2" aria-labelledby="offices-title">
      <div className="wrap">
        <SectionHead mile={8} label={d.officesLabel} title={d.officesTitle} id="offices-title" />
        <div className="mt-14 grid gap-6 xl:grid-cols-12">
          <div className="grid gap-6 md:grid-cols-2 xl:col-span-7">
            {OFFICES.map((o) => (
              <article key={o.slug} className="flex flex-col rounded-[26px] border-[1.5px] border-ink bg-paper p-7">
                <p className="mile text-red">{o.slug === "murfreesboro" ? (lang === "es" ? "OFICINA PRINCIPAL" : "MAIN OFFICE") : (lang === "es" ? "OFICINA" : "OFFICE")}</p>
                <h3 className="display mt-4 text-[clamp(1.9rem,2.6vw,2.5rem)]">{o.city}</h3>
                <address className="mt-4 not-italic">
                  {o.street}{o.suite ? `, ${o.suite}` : ""}
                  <br />
                  {o.city}, TN {o.zip}
                </address>
                <a href={`tel:${o.tel}`} className="mt-4 font-display text-2xl font-bold [font-stretch:110%] lane-link self-start">{o.phone}</a>
                <p className="mt-4 text-sm"><span className="font-semibold">{d.hours}:</span> {d.hoursValue}</p>
                <p className="mt-3 text-sm">
                  <span className="font-semibold">{d.staff}:</span>{" "}
                  {staff.filter((s) => s.office === o.slug).map((s, i, a) => (
                    <span key={s.slug}>
                      <Link href={href(lang, `/employees/${s.slug}/`)} className="lane-link">{s.name}</Link>
                      {i < a.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </p>
                <div className="mt-auto flex flex-wrap gap-2 pt-6">
                  <a href={directionsUrl(o)} target="_blank" rel="noopener noreferrer" className="btn btn-ink min-h-11">
                    <Icon name="pin" size={18} /> {d.getDirections}
                  </a>
                  <Link href={href(lang, `/locations/${o.slug}/`)} className="btn btn-line min-h-11">{d.learnMore}</Link>
                </div>
              </article>
            ))}
          </div>

          <div className="office-map relative overflow-hidden rounded-[26px] border border-[var(--line)] bg-paper contours xl:col-span-5">
            <svg viewBox={`0 0 ${box.w} ${box.h}`} className="h-full min-h-[320px] w-full" role="img" aria-label={lang === "es" ? "Mapa simplificado: ruta entre las oficinas de Smyrna y Murfreesboro" : "Simplified map: route between the Smyrna and Murfreesboro offices"}>
              <path d={ROAD} fill="none" stroke="var(--ink)" strokeOpacity="0.12" strokeWidth="14" strokeLinecap="round" />
              <path d={ROAD} fill="none" stroke="var(--ink)" strokeOpacity="0.35" strokeWidth="2" strokeDasharray="8 10" />
              <path className="office-road" d={ROAD} fill="none" stroke="var(--red)" strokeWidth="4" strokeLinecap="round" />
              {[{ p: S, o: OFFICES[1] }, { p: M, o: OFFICES[0] }].map(({ p, o }) => (
                <g key={o.slug} className="office-pin">
                  <circle cx={p.x} cy={p.y} r="16" fill="var(--paper)" stroke="var(--red)" strokeWidth="3" />
                  <circle cx={p.x} cy={p.y} r="6" fill="var(--red)" />
                  <text x={p.x} y={p.y - 28} textAnchor="middle" fontFamily="var(--font-jetbrains)" fontSize="14" letterSpacing="1.5" fill="var(--ink)">
                    {o.city.toUpperCase()}
                  </text>
                </g>
              ))}
              <text x="24" y={box.h - 24} fontFamily="var(--font-jetbrains)" fontSize="12" letterSpacing="1.5" fill="var(--muted)">RUTHERFORD CO. · TN</text>
            </svg>
          </div>
        </div>

        <div className="mt-14">
          <p className="mile text-muted">{d.serviceArea}</p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {SERVICE_AREA.map((c) => (
              <li key={c} className="chip text-ink">{c}</li>
            ))}
            <li className="chip text-red">{lang === "es" ? "Todo Tennessee" : "All of Tennessee"}</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
