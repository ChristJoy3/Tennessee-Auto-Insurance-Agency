"use client";
/**
 * Fullscreen menu: every page, grouped. Staggered "lane" reveal; Esc closes;
 * focus is trapped; background scroll is locked. One-thumb friendly on mobile.
 */
import Link from "next/link";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { href, t, type Lang } from "@/lib/i18n";
import { navGroups } from "@/lib/nav";
import { OFFICES, QUOTE, EMAIL, SOCIALS } from "@/lib/site";
import { useDialogKeys, useScrollLock } from "@/hooks/useScrollLock";
import { Icon, SocialIcon } from "./Icons";
import LanguageToggle from "./LanguageToggle";
import Logo from "./Logo";

export default function MenuOverlay({ lang, open, onClose }: { lang: Lang; open: boolean; onClose: () => void }) {
  const d = t(lang);
  const ref = useRef<HTMLDivElement>(null);
  useScrollLock(open);
  useDialogKeys(open, ref, onClose);

  useGSAP(
    () => {
      if (!ref.current) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (open) {
        gsap.set(ref.current, { visibility: "visible" });
        if (reduce) {
          gsap.set(ref.current, { clipPath: "inset(0% 0% 0% 0%)" });
          return;
        }
        gsap.fromTo(ref.current, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.8, ease: "expo.inOut" });
        gsap.fromTo(".menu-item", { yPercent: 110 }, { yPercent: 0, duration: 0.9, stagger: 0.025, delay: 0.25, ease: "expo.out" });
        gsap.fromTo(".menu-lane", { scaleX: 0 }, { scaleX: 1, duration: 1.2, delay: 0.2, ease: "expo.out", transformOrigin: "0 50%" });
      } else {
        gsap.to(ref.current, {
          clipPath: "inset(0% 0% 100% 0%)",
          duration: reduce ? 0 : 0.6,
          ease: "expo.inOut",
          onComplete: () => {
            if (ref.current) gsap.set(ref.current, { visibility: "hidden" });
          },
        });
      }
    },
    { dependencies: [open], scope: ref },
  );

  return (
    <div
      ref={ref}
      id="site-menu"
      role="dialog"
      aria-modal="true"
      aria-label={d.menu}
      aria-hidden={!open}
      className="on-dark fixed inset-0 z-[70] overflow-y-auto"
      style={{ visibility: "hidden", clipPath: "inset(0% 0% 100% 0%)" }}
    >
      <div className="wrap flex min-h-[100dvh] flex-col pb-[calc(2rem+var(--safe-b))]">
        <div className="flex h-[var(--nav-h)] items-center justify-between">
          <Link href={href(lang, "/")} onClick={onClose}>
            <Logo height={40} />
          </Link>
          <div className="flex items-center gap-3">
            <LanguageToggle lang={lang} className="inline-flex" />
            <button type="button" onClick={onClose} className="inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-full border-[1.5px] border-current px-3 text-sm font-semibold">
              <Icon name="close" size={20} />
              <span className="hidden sm:inline">{d.close}</span>
            </button>
          </div>
        </div>
        <div className="menu-lane my-6 h-0 border-t-2 border-dashed border-red" />

        <div className="grid flex-1 gap-x-10 gap-y-8 sm:grid-cols-2 xl:grid-cols-5">
          {navGroups(lang).map((g) => (
            <div key={g.title}>
              <p className="mile mb-3 text-red">{g.title}</p>
              <ul className="space-y-1">
                {g.links.map((l) => (
                  <li key={l.path} className="overflow-clip">
                    <Link
                      href={href(lang, l.path)}
                      onClick={onClose}
                      className="menu-item block py-1.5 font-display text-[1.35rem] font-bold leading-tight [font-stretch:108%] hover:text-red xl:text-[1.2rem]"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-6 border-t border-[var(--line-light)] pt-6 md:grid-cols-3">
          {OFFICES.map((o) => (
            <div key={o.slug}>
              <p className="mile text-red">{o.city}</p>
              <a href={`tel:${o.tel}`} className="mt-2 block font-display text-2xl font-bold [font-stretch:110%]">{o.phone}</a>
              <p className="text-paper/70 text-sm">{o.street}{o.suite ? `, ${o.suite}` : ""}, {o.city}, TN {o.zip}</p>
            </div>
          ))}
          <div className="flex flex-col gap-3">
            <a href={QUOTE.auto} target="_blank" rel="noopener noreferrer" className="btn btn-red">{d.quote}</a>
            <a href={`mailto:${EMAIL}`} className="lane-link self-start text-sm">{EMAIL}</a>
            <div className="flex gap-1">
              {SOCIALS.map((s) => (
                <a key={s.key} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:text-red">
                  <SocialIcon name={s.key} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
