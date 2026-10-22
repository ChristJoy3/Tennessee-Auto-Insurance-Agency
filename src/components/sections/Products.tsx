"use client";
/**
 * Choose Your Coverage: large numbered rows.
 * Desktop (hover + fine pointer): a card with the custom icon + description follows the cursor.
 * Touch: tap a row to expand its description and links.
 */
import Link from "next/link";
import { useRef, useState } from "react";
import { gsap, useGSAP, MQ } from "@/lib/gsap";
import { href, t, type Lang } from "@/lib/i18n";
import { PRODUCTS, type Product } from "@/data/products";
import { Icon } from "@/components/ui/Icons";
import SectionHead from "@/components/ui/SectionHead";

export type ProductRow = Product & { description: string };

export default function Products({ lang, rows }: { lang: Lang; rows: ProductRow[] }) {
  const d = t(lang);
  const root = useRef<HTMLElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const [open, setOpen] = useState<number | null>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const reduce = window.matchMedia(MQ.reduce).matches;
      if (!reduce) {
        gsap.from(".prod-row", { y: 40, opacity: 0, duration: 1, stagger: 0.06, ease: "expo.out", scrollTrigger: { trigger: ".prod-list", start: "top 85%", once: true } });
        gsap.from(".prod-rule", { scaleX: 0, transformOrigin: "0 50%", duration: 1.4, stagger: 0.06, ease: "expo.out", scrollTrigger: { trigger: ".prod-list", start: "top 85%", once: true } });
      }
      if (!window.matchMedia(MQ.finePointer).matches || !card.current) return;
      const xTo = gsap.quickTo(card.current, "x", { duration: 0.55, ease: "power3.out" });
      const yTo = gsap.quickTo(card.current, "y", { duration: 0.55, ease: "power3.out" });
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        xTo(e.clientX - r.left + 28);
        yTo(e.clientY - r.top - 120);
      };
      el.addEventListener("pointermove", move);
      return () => el.removeEventListener("pointermove", move);
    },
    { scope: root },
  );

  const current = active !== null ? rows[active] : null;
  return (
    <section ref={root} id="coverage" className="section relative" aria-labelledby="coverage-title">
      <div className="wrap">
        <div className="grid gap-6 xl:grid-cols-12 xl:items-end">
          <SectionHead className="xl:col-span-8" mile={1} label={d.productsLabel} title={d.productsTitle} titleClass="h-xl" id="coverage-title" />
          <p className="lead text-muted xl:col-span-4">{d.productsIntro}</p>
        </div>

        <ol className="prod-list mt-14" onPointerLeave={() => setActive(null)}>
          {rows.map((p, i) => {
            const isOpen = open === i;
            return (
              <li key={p.slug} className="prod-row relative">
                <div className="prod-rule h-0 border-t-[1.5px] border-dashed border-[var(--line)]" />
                <div
                  className="group grid grid-cols-[3rem_1fr_auto] items-center gap-3 py-5 md:grid-cols-[5rem_1fr_auto] md:py-7"
                  onPointerEnter={() => setActive(i)}
                >
                  <span className="font-mono text-sm text-muted">{String(i + 1).padStart(2, "0")}</span>
                  {/* Desktop: the name links to the product page. Touch: tap toggles details. */}
                  <Link
                    href={href(lang, p.path)}
                    className="display text-[clamp(1.55rem,6.4vw,5.2rem)] leading-[0.95] transition-colors duration-300 group-hover:text-red"
                    onClick={(e) => {
                      if (!window.matchMedia(MQ.finePointer).matches) {
                        e.preventDefault();
                        setOpen(isOpen ? null : i);
                      }
                    }}
                    aria-expanded={isOpen}
                    aria-controls={`prod-${p.slug}`}
                  >
                    {p.name[lang]}
                  </Link>
                  <span className="flex items-center gap-3">
                    <span className="hidden max-w-[16rem] text-right text-sm text-muted xl:block">{p.short[lang]}</span>
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border-[1.5px] border-current transition-all duration-300 group-hover:rotate-[-45deg] group-hover:border-red group-hover:bg-red group-hover:text-white">
                      <Icon name="arrow" size={20} />
                    </span>
                  </span>
                </div>
                <div id={`prod-${p.slug}`} hidden={!isOpen} className="pb-6 pl-[3rem] md:pl-[5rem]">
                  <div className="flex items-start gap-4">
                    <Icon name={p.icon} size={44} className="shrink-0 text-red" />
                    <p className="max-w-2xl">{p.description}</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link href={href(lang, p.path)} className="btn btn-line min-h-11">{d.learnMore}</Link>
                    <a href={p.quote ?? href(lang, `/contact/?type=${encodeURIComponent(p.inquiry)}`)} target={p.quote ? "_blank" : undefined} rel={p.quote ? "noopener noreferrer" : undefined} className="btn btn-red min-h-11">
                      {d.quote}
                    </a>
                  </div>
                </div>
              </li>
            );
          })}
          <li className="h-0 border-t-[1.5px] border-dashed border-[var(--line)]" aria-hidden="true" />
        </ol>
      </div>

      {/* Cursor-following preview card (desktop only, decorative: same info is on the product page) */}
      <div
        ref={card}
        aria-hidden="true"
        className={`pointer-events-none absolute left-0 top-0 z-20 hidden w-[22rem] rounded-[26px] bg-ink p-6 text-paper shadow-2xl transition-[opacity,scale] duration-300 [@media(hover:hover)_and_(pointer:fine)]:block ${
          current ? "scale-100 opacity-100" : "scale-90 opacity-0"
        }`}
      >
        {current && (
          <>
            <div className="flex items-center justify-between">
              <Icon name={current.icon} size={56} className="text-red" />
              <span className="font-mono text-xs text-paper/60">{String((active ?? 0) + 1).padStart(2, "0")} / {String(PRODUCTS.length).padStart(2, "0")}</span>
            </div>
            <p className="mt-5 font-display text-2xl font-bold [font-stretch:110%]">{current.name[lang]}</p>
            <p className="mt-2 line-clamp-5 text-sm text-paper/80">{current.description}</p>
            <div className="mt-5 h-0 border-t-2 border-dashed border-red" />
          </>
        )}
      </div>
    </section>
  );
}
