import Link from "next/link";
import { href, t, type Lang } from "@/lib/i18n";
import { MAIN, QUOTE } from "@/lib/site";
import { Icon } from "@/components/ui/Icons";
import { Reveal } from "@/components/ui/Reveal";
import SectionHead from "@/components/ui/SectionHead";

/** Three Ways to Start: Quote Now · Call Us · Stop By (from the old home page). */
export default function ThreeWays({ lang }: { lang: Lang }) {
  const d = t(lang);
  const tiles = [
    { n: "01", icon: "quote" as const, title: d.quoteNow, sub: lang === "es" ? "Cotización de auto en línea" : "Online auto quote", href: QUOTE.auto, ext: true },
    { n: "02", icon: "phone" as const, title: d.callUs, sub: MAIN.phone, href: `tel:${MAIN.tel}`, ext: false },
    { n: "03", icon: "pin" as const, title: d.stopBy, sub: "Murfreesboro · Smyrna", href: href(lang, "/locations/"), ext: false },
  ];
  return (
    <section className="section" aria-labelledby="ways-title">
      <div className="wrap">
        <SectionHead mile={9} label={d.waysLabel} title={d.waysTitle} id="ways-title" titleClass="h-md max-w-4xl" />
        <Reveal className="mt-12 grid gap-4 md:grid-cols-3">
          {tiles.map((x) => {
            const inner = (
              <>
                <div className="flex items-start justify-between">
                  <span className="font-mono text-sm opacity-70">{x.n}</span>
                  <Icon name={x.icon} size={44} />
                </div>
                <div>
                  <p className="display text-[clamp(2.4rem,4.4vw,4rem)]">{x.title}</p>
                  <p className="mt-2 flex items-center gap-2 font-mono text-sm">
                    {x.sub} <Icon name="arrowUpRight" size={16} className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </p>
                </div>
              </>
            );
            const cls =
              "group flex min-h-[18rem] flex-col justify-between rounded-[28px] border-[1.5px] border-ink p-7 transition-colors duration-500 hover:bg-red hover:border-red hover:text-white md:min-h-[22rem]";
            return x.href.startsWith("/") ? (
              <Link key={x.n} data-reveal-item href={x.href} className={cls}>{inner}</Link>
            ) : (
              <a key={x.n} data-reveal-item href={x.href} className={cls} target={x.ext ? "_blank" : undefined} rel={x.ext ? "noopener noreferrer" : undefined}>
                {inner}
              </a>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
