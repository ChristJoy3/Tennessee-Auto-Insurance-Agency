"use client";
/**
 * Minimal sticky navbar: hides on scroll down, returns on scroll up.
 * Logo · language toggle · Quote · Menu (fullscreen overlay with every page).
 */
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { href, t, type Lang } from "@/lib/i18n";
import { QUOTE, MAIN } from "@/lib/site";
import Logo from "./Logo";
import { Icon } from "./Icons";
import LanguageToggle from "./LanguageToggle";
import MenuOverlay from "./MenuOverlay";

export default function Navbar({ lang }: { lang: Lang }) {
  const d = t(lang);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const last = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      if (Math.abs(y - last.current) > 6) {
        setHidden(y > last.current && y > 160);
        last.current = y;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-transform duration-500 ease-[var(--ease-out)] ${hidden && !open ? "-translate-y-full" : "translate-y-0"}`}
      >
        <div
          className={`wrap flex h-[var(--nav-h)] items-center justify-between gap-3 transition-colors duration-300 ${
            scrolled ? "bg-paper/92 border-b border-[var(--line)]" : "bg-transparent"
          }`}
        >
          <Link href={href(lang, "/")} className="shrink-0" aria-label={lang === "es" ? "Inicio" : "Home"}>
            <Logo height={40} priority />
          </Link>

          <nav aria-label={lang === "es" ? "Principal" : "Primary"} className="hidden items-center gap-7 text-[0.95rem] font-semibold xl:flex">
            <Link className="lane-link" href={href(lang, "/#coverage")}>{lang === "es" ? "Coberturas" : "Coverage"}</Link>
            <Link className="lane-link" href={href(lang, "/sr_22/")}>SR-22</Link>
            <Link className="lane-link" href={href(lang, "/about/")}>{lang === "es" ? "Nosotros" : "About"}</Link>
            <Link className="lane-link" href={href(lang, "/locations/")}>{lang === "es" ? "Oficinas" : "Offices"}</Link>
            <Link className="lane-link" href={href(lang, "/blog/")}>Blog</Link>
          </nav>

          <div className="flex items-center gap-2 md:gap-3">
            <a href={`tel:${MAIN.tel}`} className="hidden items-center gap-2 font-mono text-sm md:flex lane-link">
              <Icon name="phone" size={16} /> {MAIN.phone}
            </a>
            <LanguageToggle lang={lang} className="hidden sm:inline-flex" />
            <a href={QUOTE.auto} className="btn btn-red hidden min-h-11 px-5 text-sm md:inline-flex" target="_blank" rel="noopener noreferrer">
              {d.quote}
            </a>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-controls="site-menu"
              className="inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-full border-[1.5px] border-current px-3 text-sm font-semibold"
            >
              <Icon name="menu" size={20} />
              <span className="hidden sm:inline">{d.menu}</span>
            </button>
          </div>
        </div>
      </header>
      <MenuOverlay lang={lang} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
