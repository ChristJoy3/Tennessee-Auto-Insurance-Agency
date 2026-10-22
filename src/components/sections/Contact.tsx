import { t, type Lang } from "@/lib/i18n";
import { EMAIL, FAX, MAIN, OFFICES } from "@/lib/site";
import { Icon } from "@/components/ui/Icons";
import MagneticButton from "@/components/ui/MagneticButton";
import MailtoForm from "@/components/ui/MailtoForm";
import { RevealText } from "@/components/ui/Reveal";

/** Closing statement + magnetic call button + mailto form + both offices. */
export default function Contact({ lang, mile = 11 }: { lang: Lang; mile?: number }) {
  const d = t(lang);
  return (
    <section id="contact" className="on-dark section relative overflow-hidden" aria-labelledby="contact-title">
      <div className="wrap">
        <p className="mile text-red">
          <span className="font-semibold">MILE {String(mile).padStart(2, "0")}</span> <span aria-hidden="true">/</span> {d.contactLabel}
        </p>
        <RevealText as="h2" id="contact-title" chars className="display h-xl mt-6 max-w-6xl">
          {d.contactTitle}
        </RevealText>

        <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center">
          <MagneticButton href={`tel:${MAIN.tel}`} strength={0.45} className="btn btn-red min-h-20 px-10 text-xl">
            <Icon name="phone" size={24} /> {MAIN.phone}
          </MagneticButton>
          <a href={`mailto:${EMAIL}`} className="lane-link self-start text-lg sm:self-auto">{EMAIL}</a>
        </div>

        <div className="mt-16 grid gap-12 xl:grid-cols-12">
          <div className="xl:col-span-7">
            <MailtoForm lang={lang} dark />
          </div>
          <div className="grid content-start gap-8 xl:col-span-4 xl:col-start-9">
            {OFFICES.map((o) => (
              <div key={o.slug} className="border-t border-dashed border-[var(--line-light)] pt-5">
                <p className="mile text-red">{o.name}</p>
                <p className="mt-2 text-paper/85">
                  {o.street}{o.suite ? `, ${o.suite}` : ""}, {o.city}, TN {o.zip}
                </p>
                <a href={`tel:${o.tel}`} className="lane-link mt-1 inline-block font-mono">{o.phone}</a>
              </div>
            ))}
            <div className="border-t border-dashed border-[var(--line-light)] pt-5 text-paper/85">
              <p>{d.fax}: <span className="font-mono">{FAX}</span></p>
              <p>{d.email}: <a href={`mailto:${EMAIL}`} className="lane-link">{EMAIL}</a></p>
              <p>{d.hours}: {d.hoursValue}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
