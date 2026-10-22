"use client";
/**
 * Since 1998: years-in-business odometer (computed, never hardcoded), the agency's own words,
 * the three value points from the old home page, the real office photos and the agency video.
 */
import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, MQ } from "@/lib/gsap";
import { t, type Lang } from "@/lib/i18n";
import { FOUNDED, YOUTUBE_ID, NAME } from "@/lib/site";
import Odometer, { type OdometerHandle } from "@/components/ui/Odometer";
import SectionHead from "@/components/ui/SectionHead";
import { CoverageFrame } from "@/components/ui/Reveal";
import { VideoFacade } from "@/components/ui/Facades";
import { Icon } from "@/components/ui/Icons";

export default function Story({ lang }: { lang: Lang }) {
  const d = t(lang);
  const es = lang === "es";
  const root = useRef<HTMLElement>(null);
  const odo = useRef<OdometerHandle>(null);
  const years = new Date().getFullYear() - FOUNDED;

  useGSAP(
    () => {
      if (window.matchMedia(MQ.reduce).matches) {
        odo.current?.set(years);
        return;
      }
      odo.current?.set(0);
      ScrollTrigger.create({ trigger: ".story-odo", start: "top 85%", once: true, onEnter: () => odo.current?.roll(2.2) });
      gsap.from(".value-card", { y: 50, opacity: 0, stagger: 0.1, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: ".value-grid", start: "top 85%", once: true } });
    },
    { scope: root },
  );

  const values = es
    ? ["Permítanos ahorrarle tiempo para que pueda pasarlo haciendo lo que disfruta.", "Sirviendo Tennessee desde 1998.", "Podemos ahorrarle dinero para su futuro."]
    : ["Let us save you time so you can spend it doing what you enjoy.", "Serving Tennessee since 1998.", "We can save you money to put towards your future."];
  const valueIcons = ["clock", "pin", "card"] as const;

  return (
    <section ref={root} id="about" className="section contours" aria-labelledby="story-title">
      <div className="wrap">
        <div className="grid gap-12 xl:grid-cols-12">
          <div className="xl:col-span-7">
            <SectionHead mile={5} label={d.storyLabel} title={es ? "La misma agencia local de confianza." : "The same local agency you trust."} id="story-title" />
            <div className="story-odo mt-10 flex flex-wrap items-end gap-5">
              <Odometer ref={odo} from={0} to={years} className="text-[clamp(3.5rem,10vw,7rem)]" />
              <p className="mb-3 max-w-[12rem] font-mono text-sm uppercase tracking-[0.14em]">{d.storyYears}</p>
            </div>
          </div>
          <div className="space-y-5 xl:col-span-5 xl:self-end">
            <p className="lead">
              {es
                ? "Tennessee Auto Insurance Agency ha servido a Murfreesboro, Smyrna, La Vergne, Hendersonville, Shelbyville, Nashville, Franklin, Antioch, Mount Juliet, Manchester, Woodbury, Columbia y otras áreas del centro de Tennessee desde 1998." /* [REVIEW TRANSLATION] */
                : "Tennessee Auto Insurance Agency has been servicing Murfreesboro, Smyrna, La Vergne, Hendersonville, Shelbyville, Nashville, Franklin, Antioch, Mount Juliet, Manchester, Woodbury, Columbia, and other areas of middle Tennessee since 1998."}
            </p>
            <p className="text-muted">
              {es
                ? "Nuestro enfoque es brindar al asegurado un excelente servicio al cliente a tarifas muy accesibles. Hemos atendido con éxito a miles de clientes y estamos decididos a tratar a cada persona con respeto y compasión." /* [REVIEW TRANSLATION] */
                : "At Tennessee Auto Insurance Agency, our focus is to provide the insured with excellent customer service at very affordable rates. TNAIA has successfully served thousands of customers and are determined to treat each individual with respect and compassion."}
            </p>
          </div>
        </div>

        <ul className="value-grid mt-16 grid gap-4 md:grid-cols-3">
          {values.map((v, i) => (
            <li key={v} className="value-card rounded-[26px] border-[1.5px] border-ink bg-paper p-7">
              <div className="flex items-center justify-between">
                <Icon name={valueIcons[i]} size={36} className="text-red" />
                <span className="font-mono text-xs text-muted">0{i + 1}</span>
              </div>
              <p className="mt-10 font-display text-2xl font-bold leading-tight [font-stretch:108%]">{v}</p>
            </li>
          ))}
        </ul>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {[
            { src: "/images/photos/office-murfreesboro.png", alt: es ? "Oficina de Murfreesboro con el letrero de TAIA y un auto deportivo rojo en el estacionamiento" : "Murfreesboro office storefront with the TAIA sign and a red sports car in the parking lot", cap: "Murfreesboro" },
            { src: "/images/photos/office-smyrna.png", alt: es ? "Oficina de Smyrna con una camioneta de TAIA estacionada al frente" : "Smyrna office building with a TAIA-branded truck parked in front", cap: "Smyrna" },
          ].map((p) => (
            <figure key={p.src}>
              <CoverageFrame radius={26}>
                {/* Photos are only 300px wide on the old site: shown at a modest size, never upscaled */}
                <div className="flex aspect-[4/3] items-center justify-center bg-paper-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.src} alt={p.alt} width={300} height={230} loading="lazy" className="h-auto w-full max-w-[300px] rounded-xl" />
                </div>
              </CoverageFrame>
              <figcaption className="mile mt-3 text-muted">{p.cap}</figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-16">
          <VideoFacade id={YOUTUBE_ID} title={NAME} label={d.watchVideo} />
        </div>
      </div>
    </section>
  );
}
