import Link from "next/link";
import { href, t, type Lang } from "@/lib/i18n";
import { CARRIERS } from "@/data/carriers";
import SectionHead from "@/components/ui/SectionHead";
import { Icon } from "@/components/ui/Icons";

/**
 * Carrier logos shown as-is (no recolor/distortion) on neutral white tiles,
 * normalised to a consistent optical size by fitting inside the same box.
 */
export function CarrierTile({ c, className = "" }: { c: (typeof CARRIERS)[number]; className?: string }) {
  return (
    <div className={`flex h-28 w-56 shrink-0 items-center justify-center rounded-2xl border border-[var(--line)] bg-white px-6 py-5 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={c.logo} alt={`${c.name} logo`} width={c.logoW} height={c.logoH} loading="lazy" className="max-h-full max-w-full object-contain" style={{ width: "auto", height: "auto", maxHeight: "4.25rem" }} />
    </div>
  );
}

export default function Carriers({ lang }: { lang: Lang }) {
  const d = t(lang);
  const list = CARRIERS;
  return (
    <section className="section overflow-hidden" aria-labelledby="carriers-title">
      <div className="wrap flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHead mile={3} label={d.carriersLabel} title={d.carriersTitle} id="carriers-title" />
        <Link href={href(lang, "/carriers/")} className="btn btn-line self-start md:self-auto">
          {d.allCarriers} <Icon name="arrow" size={18} />
        </Link>
      </div>
      <div className="marquee mt-12" style={{ ["--marquee-speed" as string]: "45s" }}>
        <ul className="marquee-track gap-4 pr-4" aria-label={d.carriersTitle}>
          {[...list, ...list].map((c, i) => (
            <li key={`${c.slug}-${i}`} aria-hidden={i >= list.length ? "true" : undefined}>
              <CarrierTile c={c} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
