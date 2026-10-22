import Link from "next/link";
import { href, t, type Lang } from "@/lib/i18n";
import { MAIN, QUOTE } from "@/lib/site";
import { Icon } from "@/components/ui/Icons";
import { CoverageFrame, Reveal } from "@/components/ui/Reveal";
import SectionHead from "@/components/ui/SectionHead";

/**
 * SR-22 & License Reinstatement. Calm, respectful, non-judgmental.
 * All factual copy comes from the old /about/, /sr_22/ and license-reinstatement pages.
 */
export default function SR22({ lang, sr22Intro }: { lang: Lang; sr22Intro: string }) {
  const d = t(lang);
  const es = lang === "es";
  return (
    <section className="section relative bg-paper-2" aria-labelledby="sr22-title">
      <div className="wrap grid gap-12 xl:grid-cols-12">
        <div className="xl:col-span-6">
          <SectionHead mile={4} label={d.sr22Label} title={d.sr22Title} id="sr22-title" />
          <p className="lead mt-8 max-w-xl">
            {es
              ? "Si tiene problemas con su licencia de conducir, podemos ayudarle a restablecer su licencia y proporcionarle un SR-22 al instante." /* [REVIEW TRANSLATION] */
              : "If you are having issues with your driver's license, we are able to get your license reinstated and provide you with an instant SR 22."}
          </p>
          <p className="mt-5 max-w-xl text-muted" lang={es ? "en" : undefined}>{sr22Intro}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href={`tel:${MAIN.tel}`} className="btn btn-red">
              <Icon name="phone" size={20} /> {d.call} {MAIN.phone}
            </a>
            <a href={QUOTE.auto} target="_blank" rel="noopener noreferrer" className="btn btn-line">{d.quote}</a>
          </div>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
            <Link href={href(lang, "/sr_22/")} className="lane-link font-semibold">{es ? "Información sobre SR-22" : "SR-22 Insurance Information"}</Link>
            <Link href={href(lang, "/content/tn-drivers-license-reinstatement/")} className="lane-link font-semibold">
              {es ? "Restablecimiento de licencia de TN" : "TN Drivers License Reinstatement"}
            </Link>
          </div>
        </div>

        <div className="xl:col-span-5 xl:col-start-8">
          <CoverageFrame radius={28} innerClassName="bg-ink text-paper p-7 md:p-10">
            <p className="mile text-red">{es ? "PARA RESIDENTES DE TENNESSEE" : "FOR RESIDENTS OF TENNESSEE!"}</p>
            <p className="mt-5 text-lg text-paper/90">
              {es
                ? "Podemos aceptar todos sus requisitos de restablecimiento en nuestra oficina y procesarlos con el DMV en tan solo 1 día hábil. Simplemente llame a nuestra oficina con 3 datos básicos:" /* [REVIEW TRANSLATION] */
                : "We have the ability to accept all your reinstatement requirements in our office and have them processed with the DMV in as little as 1 working day. Simply call our office with 3 basic pieces of information:"}
            </p>
            <Reveal as="ul" className="mt-6 space-y-3">
              {(es
                ? ["Nombre en su licencia de conducir", "Su número de licencia de conducir o ID de Tennessee", "Su fecha de nacimiento"]
                : ["Name on your driver’s license", "Your Tennessee driver’s license or ID number", "Your date of birth"]
              ).map((x, i) => (
                <li key={x} data-reveal-item className="flex items-center gap-4 rounded-2xl border border-[var(--line-light)] px-4 py-3">
                  <span className="font-mono text-red">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-semibold">{x}</span>
                </li>
              ))}
            </Reveal>
            <p className="mt-6 text-paper/80">
              {es
                ? "Averiguaremos lo que necesita y le ayudaremos a completar el proceso de restablecimiento rápidamente."
                : "We will find out what you need and help you through the license reinstatement process quickly."}
            </p>
          </CoverageFrame>
        </div>
      </div>
    </section>
  );
}
