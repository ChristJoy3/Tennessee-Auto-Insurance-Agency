"use client";
/**
 * Hero: "Insuring you for less." — the brand promise, huge. Mile-marker labels, two CTAs,
 * a route line that plots itself behind the headline once the preloader clears,
 * and a real photo revealed by a closing coverage frame.
 */
import { useRef } from "react";
import { gsap, SplitText, useGSAP, MQ } from "@/lib/gsap";
import { t, type Lang } from "@/lib/i18n";
import { MAIN, QUOTE, SERVICE_AREA } from "@/lib/site";
import { onIntroDone } from "@/components/ui/Preloader";
import { Icon } from "@/components/ui/Icons";
import MagneticButton from "@/components/ui/MagneticButton";

const ROUTE = "M -20 760 C 180 760, 230 520, 420 560 S 640 860, 820 640 S 980 300, 1040 260";

export default function Hero({ lang }: { lang: Lang }) {
  const d = t(lang);
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const route = el.querySelector<SVGPathElement>(".hero-route");
      const frame = el.querySelector<SVGRectElement>(".hero-frame");
      const reduce = window.matchMedia(MQ.reduce).matches;
      if (reduce) return;

      const mm = gsap.matchMedia();
      mm.add({ desktop: MQ.desktop, mobile: MQ.mobile }, (ctx) => {
        const { desktop } = ctx.conditions as { desktop: boolean };
        const split = SplitText.create(".hero-line", { type: desktop ? "chars" : "words", mask: desktop ? "chars" : "words" });
        const targets = desktop ? split.chars : split.words;
        gsap.set(targets, { yPercent: 115 });
        gsap.set([".hero-fade"], { opacity: 0, y: 24 });
        const len = route?.getTotalLength() ?? 0;
        if (route) gsap.set(route, { strokeDasharray: len, strokeDashoffset: len });
        const flen = frame?.getTotalLength() ?? 0;
        if (frame) gsap.set(frame, { strokeDasharray: flen, strokeDashoffset: flen });
        gsap.set(".hero-photo", { clipPath: "inset(12% 12% 12% 12% round 32px)", opacity: 0 });

        const play = () => {
          const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
          tl.to(targets, { yPercent: 0, duration: desktop ? 1.3 : 1.1, stagger: desktop ? 0.025 : 0.06 })
            .to(route, { strokeDashoffset: 0, duration: 2.2, ease: "power2.inOut" }, 0.1)
            .to(".hero-fade", { opacity: 1, y: 0, duration: 1, stagger: 0.08 }, 0.5)
            .to(frame, { strokeDashoffset: 0, duration: 1.3, ease: "power3.inOut" }, 0.4)
            .to(".hero-photo", { clipPath: "inset(0% 0% 0% 0% round 32px)", opacity: 1, duration: 1.2 }, 1.2)
            .to(frame, { opacity: 0, duration: 0.6 }, 1.9);
        };
        const off = onIntroDone(play);

        // Gentle parallax as the hero scrolls away
        gsap.to(".hero-photo img", { yPercent: 12, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true } });
        gsap.to(".hero-title", { yPercent: desktop ? -12 : -6, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true } });
        return () => {
          off();
          split.revert();
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="contours relative overflow-hidden pb-16 pt-[calc(var(--nav-h)+2.5rem)] md:pb-24 xl:min-h-[100svh]" aria-labelledby="hero-title">
      {/* route line behind the headline */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">
        <path d={ROUTE} fill="none" stroke="var(--red)" strokeOpacity="0.16" strokeWidth="2" strokeDasharray="10 12" vectorEffect="non-scaling-stroke" />
        <path className="hero-route" d={ROUTE} fill="none" stroke="var(--red)" strokeWidth="2.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>

      <div className="wrap relative">
        <div className="hero-fade flex flex-wrap items-center gap-x-6 gap-y-2">
          <span className="mile text-red">{d.since}</span>
          <span className="mile text-muted">{d.area}</span>
        </div>

        <h1 id="hero-title" className="hero-title display h-hero mt-6 xl:mt-10">
          <span className="hero-line block">{d.heroTitle[0]}</span>
          <span className="hero-line block">
            {d.heroTitle[1]} <span className="text-red">{d.heroTitle[2]}</span>
          </span>
        </h1>

        <div className="mt-10 grid items-end gap-10 xl:mt-14 xl:grid-cols-12">
          <div className="xl:col-span-5">
            <p className="hero-fade lead max-w-xl">{d.heroSub}</p>
            <div className="hero-fade mt-8 flex flex-col gap-3 sm:flex-row">
              <MagneticButton href={QUOTE.auto} target="_blank" rel="noopener noreferrer" className="btn btn-red text-lg">
                {d.quote} <Icon name="arrowUpRight" size={20} />
              </MagneticButton>
              <MagneticButton href={`tel:${MAIN.tel}`} className="btn btn-line text-lg">
                <Icon name="phone" size={20} /> {d.call} {MAIN.phone}
              </MagneticButton>
            </div>
            <ul className="hero-fade mt-8 flex flex-wrap gap-2" aria-label={d.serviceArea}>
              {SERVICE_AREA.slice(0, 5).map((c) => (
                <li key={c} className="chip text-ink">{c}</li>
              ))}
            </ul>
          </div>

          <div className="relative xl:col-span-6 xl:col-start-7">
            <svg className="pointer-events-none absolute -inset-[10px] z-10 h-[calc(100%+20px)] w-[calc(100%+20px)] overflow-visible" aria-hidden="true">
              <rect className="hero-frame" x="1" y="1" width="99.6%" height="99.4%" rx="38" fill="none" stroke="var(--red)" strokeWidth="2" />
            </svg>
            <div className="hero-photo relative aspect-[16/10] overflow-hidden rounded-[32px] bg-paper-2">
              <picture>
                <source type="image/webp" srcSet="/images/photos/hero-driver-640.webp 640w, /images/photos/hero-driver-1280.webp 1280w, /images/photos/hero-driver-1920.webp 1920w" sizes="(min-width:1280px) 50vw, 100vw" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/photos/hero-driver.jpg" alt={lang === "es" ? "Hombre manejando un auto al atardecer" : "Man driving a car at sunset"} width={1920} height={981} fetchPriority="high" className="h-[112%] w-full object-cover" />
              </picture>
              <span className="absolute bottom-4 left-4 rounded-full bg-paper px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.14em]">
                {lang === "es" ? "Milla 00 / Punto de partida" : "Mile 00 / Starting point"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
