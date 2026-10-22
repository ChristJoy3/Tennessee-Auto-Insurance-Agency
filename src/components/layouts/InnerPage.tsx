import Link from "next/link";
import { href, t, type Lang } from "@/lib/i18n";
import { MAIN, QUOTE } from "@/lib/site";
import { JsonLd, breadcrumbLd } from "@/lib/seo";
import { Icon } from "@/components/ui/Icons";
import { RevealText } from "@/components/ui/Reveal";

export type Crumb = { name: string; path: string };

/**
 * Inner page frame: breadcrumbs, mile-marker label, big title, optional intro/aside,
 * body, then the quote + call CTA band (every page ends with it). Lighter motion than home.
 */
export default function InnerPage({
  lang,
  label,
  title,
  intro,
  crumbs,
  children,
  aside,
  englishOnly = false,
  wide = false,
  quoteHref = QUOTE.auto,
}: {
  lang: Lang;
  label: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  crumbs: Crumb[];
  children: React.ReactNode;
  aside?: React.ReactNode;
  englishOnly?: boolean;
  wide?: boolean;
  quoteHref?: string;
}) {
  const d = t(lang);
  const all = [{ name: d.breadcrumbHome, path: "/" }, ...crumbs];
  return (
    <>
      <JsonLd data={breadcrumbLd(all.map((c) => ({ name: c.name, path: href(lang, c.path) })))} />
      <header className="contours relative pb-12 pt-[calc(var(--nav-h)+3rem)] md:pb-16 md:pt-[calc(var(--nav-h)+5rem)]">
        <div className="wrap">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] text-muted">
              {all.map((c, i) => (
                <li key={c.path + i} className="flex items-center gap-2">
                  {i > 0 && <span aria-hidden="true">/</span>}
                  {i < all.length - 1 ? (
                    <Link href={href(lang, c.path)} className="lane-link">{c.name}</Link>
                  ) : (
                    <span aria-current="page" className="text-ink">{c.name}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
          <p className="mile mt-10 text-red">{label}</p>
          <RevealText as="h1" immediate className="display h-lg mt-5 max-w-6xl">
            {title}
          </RevealText>
          {intro && <div className="lead mt-6 max-w-3xl text-muted">{intro}</div>}
          {englishOnly && lang === "es" && (
            <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-paper px-4 py-2 text-sm">
              <Icon name="globe" size={18} className="text-red" /> {d.englishOnly}
            </p>
          )}
        </div>
      </header>

      <div className="wrap pb-20">
        {aside ? (
          <div className="grid gap-12 xl:grid-cols-12">
            <div className={wide ? "xl:col-span-8" : "xl:col-span-7"} lang={englishOnly ? "en" : undefined}>{children}</div>
            <aside className="xl:col-span-4 xl:col-start-9">{aside}</aside>
          </div>
        ) : (
          <div lang={englishOnly ? "en" : undefined}>{children}</div>
        )}
      </div>

      <CtaBand lang={lang} quoteHref={quoteHref} />
    </>
  );
}

export function CtaBand({ lang, quoteHref = QUOTE.auto }: { lang: Lang; quoteHref?: string }) {
  const d = t(lang);
  const external = /^https?:/.test(quoteHref);
  return (
    <section className="on-dark" aria-label={d.ctaTitle}>
      <div className="wrap flex flex-col gap-8 py-16 md:flex-row md:items-end md:justify-between md:py-20">
        <div>
          <p className="mile text-red">{d.since}</p>
          <p className="display h-md mt-4">{d.ctaTitle}</p>
          <p className="mt-3 max-w-xl text-paper/75">{d.ctaBody}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <a href={quoteHref} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} className="btn btn-red">
            {d.quote} <Icon name="arrowUpRight" size={18} />
          </a>
          <a href={`tel:${MAIN.tel}`} className="btn btn-line">
            <Icon name="phone" size={18} /> {MAIN.phone}
          </a>
        </div>
      </div>
    </section>
  );
}

/** Sidebar card: offices + hours + quick actions (used on most inner pages). */
export function OfficeAside({ lang }: { lang: Lang }) {
  const d = t(lang);
  return (
    <div className="sticky top-[calc(var(--nav-h)+1.5rem)] grid gap-4">
      <div className="rounded-[24px] bg-ink p-6 text-paper">
        <p className="mile text-red">{d.callUs}</p>
        <a href={`tel:${MAIN.tel}`} className="mt-3 block font-display text-3xl font-bold [font-stretch:110%]">{MAIN.phone}</a>
        <p className="mt-1 text-sm text-paper/70">{d.hoursValue}</p>
        <a href={QUOTE.auto} target="_blank" rel="noopener noreferrer" className="btn btn-red mt-5 w-full">{d.quote}</a>
      </div>
      <div className="rounded-[24px] border-[1.5px] border-[var(--line)] p-6">
        <p className="mile text-muted">{d.officesLabel}</p>
        <ul className="mt-3 space-y-3 text-sm">
          <li><Link href={href(lang, "/locations/murfreesboro/")} className="lane-link font-semibold">Murfreesboro</Link> · <a className="font-mono" href="tel:6158936177">(615) 893-6177</a></li>
          <li><Link href={href(lang, "/locations/smyrna/")} className="lane-link font-semibold">Smyrna</Link> · <a className="font-mono" href="tel:6156248007">(615) 624-8007</a></li>
        </ul>
      </div>
    </div>
  );
}
