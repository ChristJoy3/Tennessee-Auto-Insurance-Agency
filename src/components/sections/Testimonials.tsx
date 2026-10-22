"use client";
/**
 * What Clients Say: real reviews from the old testimonials page, quoted exactly, with the
 * name/initial and city shown there. Scroll-snap carousel (touch, trackpad, keyboard, buttons).
 */
import Link from "next/link";
import { useRef, useState } from "react";
import { href, t, type Lang } from "@/lib/i18n";
import { REVIEW_URL, SOCIALS } from "@/lib/site";
import type { Testimonial } from "@/data/content";
import { Icon } from "@/components/ui/Icons";
import SectionHead from "@/components/ui/SectionHead";

export function Stars({ n, size = 16 }: { n: number; size?: number }) {
  return (
    <span className="inline-flex text-red" aria-label={`${n} / 5`} role="img">
      {Array.from({ length: 5 }, (_, i) => (
        <Icon key={i} name="star" size={size} fill={i < n ? "currentColor" : "none"} />
      ))}
    </span>
  );
}

export default function Testimonials({ lang, items, average, count }: { lang: Lang; items: Testimonial[]; average: string; count: string }) {
  const d = t(lang);
  const row = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState<Set<string>>(new Set());
  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const scroll = (dir: number) => row.current?.scrollBy({ left: dir * row.current.clientWidth * 0.8, behavior: "smooth" });
  const google = SOCIALS.find((s) => s.key === "google")!.href;
  return (
    <section className="on-dark section overflow-hidden" aria-labelledby="reviews-title">
      <div className="wrap flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
        <SectionHead mile={7} label={d.testimonialsLabel} title={d.testimonialsTitle} id="reviews-title" dark />
        <div className="flex flex-col gap-4 xl:items-end">
          <div className="flex items-center gap-3">
            <span className="display text-5xl">{Number(average).toFixed(1)}</span>
            <span>
              <Stars n={Math.round(Number(average))} size={18} />
              <span className="block font-mono text-xs uppercase tracking-[0.14em] text-paper/70">
                {count} {d.reviews}
              </span>
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={href(lang, "/testimonials/")} className="btn btn-line min-h-11">{d.readAll}</Link>
            <a href={REVIEW_URL} target="_blank" rel="noopener noreferrer" className="btn btn-red min-h-11">{d.leaveReview}</a>
            <a href={google} target="_blank" rel="noopener noreferrer" className="btn btn-line min-h-11">Google</a>
          </div>
        </div>
      </div>

      <ul ref={row} className="snap-row mt-12 pb-2" tabIndex={0} aria-label={d.testimonialsTitle}>
        {items.map((r) => {
          // Long reviews are clamped to keep cards even; full text stays in the page and expands in place
          const long = r.original.length > 240;
          const expanded = open.has(r.id);
          return (
          <li key={r.id} className="flex min-h-[19rem] self-stretch flex-col justify-between rounded-[26px] border border-[var(--line-light)] bg-ink-2 p-7">
            <div>
              <Stars n={r.rating} />
              {lang === "es" && <p className="mt-3 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-paper/50">Reseña original en inglés</p>}
              <blockquote id={`review-${r.id}`} className={`mt-4 text-[1.05rem] leading-relaxed text-paper/90 ${long && !expanded ? "line-clamp-6" : ""}`} lang="en">
                “{r.original}”
              </blockquote>
              {long && (
                <button
                  type="button"
                  onClick={() => toggle(r.id)}
                  aria-expanded={expanded}
                  aria-controls={`review-${r.id}`}
                  className="lane-link mt-3 min-h-11 text-sm font-semibold text-red"
                >
                  {expanded ? (lang === "es" ? "Leer menos" : "Read less") : lang === "es" ? "Leer más" : "Read more"}
                </button>
              )}
            </div>
            <footer className="mt-6 border-t border-dashed border-[var(--line-light)] pt-4">
              <p className="font-semibold">{r.name}</p>
              <p className="text-sm text-paper/60">{r.location}</p>
            </footer>
          </li>
          );
        })}
      </ul>
      <div className="wrap mt-6 flex gap-2">
        <button type="button" onClick={() => scroll(-1)} className="inline-flex h-12 w-12 items-center justify-center rounded-full border-[1.5px] border-current" aria-label={lang === "es" ? "Anterior" : "Previous"}>
          <Icon name="arrow" size={20} className="rotate-180" />
        </button>
        <button type="button" onClick={() => scroll(1)} className="inline-flex h-12 w-12 items-center justify-center rounded-full border-[1.5px] border-current" aria-label={lang === "es" ? "Siguiente" : "Next"}>
          <Icon name="arrow" size={20} />
        </button>
      </div>
    </section>
  );
}
