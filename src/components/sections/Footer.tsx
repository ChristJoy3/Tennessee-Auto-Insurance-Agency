import Link from "next/link";
import { href, t, type Lang } from "@/lib/i18n";
import { navGroups } from "@/lib/nav";
import { EMAIL, FAX, NAME, OFFICES, PAYMENT_PORTAL, SOCIALS, TAGLINE } from "@/lib/site";
import Logo from "@/components/ui/Logo";
import { SocialIcon } from "@/components/ui/Icons";
import LanguageToggle from "@/components/ui/LanguageToggle";

/** Footer: offices, hours, service links, socials, language toggle, slow marquee. */
export default function Footer({ lang }: { lang: Lang }) {
  const d = t(lang);
  const year = new Date().getFullYear();
  const marquee = `${NAME.toUpperCase()} · ${TAGLINE.toUpperCase()} · ${d.since} · `;
  const groups = navGroups(lang);
  return (
    <footer className="on-dark relative overflow-hidden pb-[calc(4.5rem+var(--safe-b))] md:pb-0">
      <div className="marquee border-b border-[var(--line-light)] py-6" aria-hidden="true" style={{ ["--marquee-speed" as string]: "60s" }}>
        <div className="marquee-track">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="display shrink-0 whitespace-nowrap pr-8 text-[clamp(2.5rem,7vw,6rem)] text-paper/90">
              {marquee}
            </span>
          ))}
        </div>
      </div>

      <div className="wrap grid gap-12 py-16 md:grid-cols-2 xl:grid-cols-12">
        <div className="xl:col-span-4">
          <Logo height={64} />
          <p className="mt-6 max-w-sm text-paper/75">
            {lang === "es"
              ? "Agencia de seguros independiente sirviendo a Tennessee desde 1998."
              : "Independent insurance agency serving Tennessee since 1998."}
          </p>
          <div className="mt-6 grid gap-5">
            {OFFICES.map((o) => (
              <div key={o.slug}>
                <p className="mile text-red">{o.name}</p>
                <p className="mt-1 text-paper/85">
                  {o.street}{o.suite ? ` ${o.suite}` : ""}, {o.city}, TN {o.zip}
                </p>
                <a href={`tel:${o.tel}`} className="lane-link font-mono">P: {o.phone}</a>
              </div>
            ))}
            <p className="text-paper/85">
              {d.fax}: <span className="font-mono">{FAX}</span>
              <br />
              {d.email}: <a className="lane-link" href={`mailto:${EMAIL}`}>{EMAIL}</a>
              <br />
              {d.hours}: {d.hoursValue}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 md:col-span-1 xl:col-span-8 xl:grid-cols-4">
          {groups.slice(1).map((g) => (
            <div key={g.title}>
              <p className="mile mb-3 text-red">{g.title}</p>
              <ul className="space-y-2 text-[0.95rem]">
                {g.links.map((l) => (
                  <li key={l.path}>
                    <Link className="lane-link" href={href(lang, l.path)}>{l.label}</Link>
                  </li>
                ))}
                {g.title === groups[2].title && (
                  <li>
                    <a className="lane-link" href={PAYMENT_PORTAL} target="_blank" rel="noopener noreferrer">
                      {lang === "es" ? "Portal de pagos en línea" : "Online payment portal"}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="wrap flex flex-col gap-6 border-t border-[var(--line-light)] py-8 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-1">
          {SOCIALS.map((s) => (
            <a key={s.key} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line-light)] hover:border-red hover:text-red">
              <SocialIcon name={s.key} />
            </a>
          ))}
        </div>
        <LanguageToggle lang={lang} className="inline-flex self-start md:self-auto" />
        <p className="text-sm text-paper/60">
          © {year} {NAME}. {d.rights}
        </p>
      </div>
    </footer>
  );
}
