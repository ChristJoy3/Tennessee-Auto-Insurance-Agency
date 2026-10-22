import Link from "next/link";
import { href, t, type Lang } from "@/lib/i18n";
import { OFFICES } from "@/lib/site";
import type { Staff } from "@/data/content";
import SectionHead from "@/components/ui/SectionHead";
import { Reveal } from "@/components/ui/Reveal";

const initials = (n: string) => n.split(" ").map((p) => p[0]).join("").slice(0, 2);

/** Staff card. The old site had no staff photos (all photo URLs 404): monogram plate placeholder. */
export function StaffCard({ s, lang }: { s: Staff; lang: Lang }) {
  const d = t(lang);
  return (
    <article data-reveal-item className="group rounded-[24px] border-[1.5px] border-[var(--line)] bg-paper p-5 transition-colors hover:border-ink">
      <div className="relative flex aspect-[5/4] items-center justify-center overflow-hidden rounded-[18px] bg-paper-2 contours" aria-hidden="true">
        <span className="display text-[3.5rem] text-ink/85">{initials(s.name)}</span>
        <span className="absolute bottom-3 left-3 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted">
          {/* [PLACEHOLDER – staff photo] */}
          {lang === "es" ? "Foto pendiente" : "Photo coming soon"}
        </span>
      </div>
      <h3 className="mt-4 font-display text-xl font-bold [font-stretch:108%]">
        <Link href={href(lang, `/employees/${s.slug}/`)} className="lane-link">{s.name}</Link>
      </h3>
      <p className="text-sm text-muted">{s.title === "Agent" ? d.agent : lang === "es" ? "Gerente de la agencia" : s.title}</p>
      <div className="mt-3 grid gap-1 text-sm">
        <a href={`tel:${s.phone.replace(/\D/g, "")}`} className="lane-link self-start font-mono">{s.phone}</a>
        <a href={`mailto:${s.email}`} className="lane-link self-start break-all">{s.email}</a>
      </div>
    </article>
  );
}

export default function Team({ lang, staff }: { lang: Lang; staff: Staff[] }) {
  const d = t(lang);
  return (
    <section className="section" aria-labelledby="team-title">
      <div className="wrap">
        <SectionHead mile={6} label={d.teamLabel} title={d.teamTitle} id="team-title" />
        {OFFICES.map((o) => (
          <div key={o.slug} className="mt-14">
            <div className="flex items-center gap-4">
              <span className="chip text-ink">{o.city}</span>
              <span className="h-0 flex-1 border-t-[1.5px] border-dashed border-[var(--line)]" />
              <a href={`tel:${o.tel}`} className="font-mono text-sm lane-link">{o.phone}</a>
            </div>
            <Reveal className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {staff.filter((s) => s.office === o.slug).map((s) => (
                <StaffCard key={s.slug} s={s} lang={lang} />
              ))}
            </Reveal>
          </div>
        ))}
      </div>
    </section>
  );
}
