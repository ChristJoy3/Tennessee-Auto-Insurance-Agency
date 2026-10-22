import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { href, t, type Lang } from "@/lib/i18n";
import { JsonLd, pageMeta } from "@/lib/seo";
import { EMAIL, FAX, HOURS, NAME, OFFICES, REVIEW_URL, SITE_URL, directionsUrl, mapEmbedUrl } from "@/lib/site";
import { STAFF, TESTIMONIALS } from "@/data/content";
import InnerPage, { OfficeAside } from "@/components/layouts/InnerPage";
import { StaffCard } from "@/components/sections/Team";
import { Stars } from "@/components/sections/Testimonials";
import MailtoForm from "@/components/ui/MailtoForm";
import { MapFacade } from "@/components/ui/Facades";
import { Icon } from "@/components/ui/Icons";
import { Reveal } from "@/components/ui/Reveal";

const es = (lang: Lang) => lang === "es";

/* ───────── Staff ───────── */
export const staffParams = () => STAFF.map((s) => ({ slug: s.slug }));
export const staffIndexMetadata = (lang: Lang): Metadata =>
  pageMeta({ lang, path: "/employees/", title: es(lang) ? "Nuestro personal" : "Employee Directory", description: "Find e-mail addresses and telephone numbers of Tennessee Auto Insurance Agency employees." });

export function StaffIndexView({ lang }: { lang: Lang }) {
  return (
    <InnerPage
      lang={lang}
      label={t(lang).teamLabel}
      title={es(lang) ? "Directorio de empleados" : "Employee Directory"}
      intro={es(lang) ? "Encuentre los correos electrónicos y teléfonos del personal de Tennessee Auto Insurance Agency." : "Find e-mail addresses and telephone numbers of Tennessee Auto Insurance Agency employees."}
      crumbs={[{ name: es(lang) ? "Nuestro personal" : "Our Staff", path: "/employees/" }]}
    >
      {OFFICES.map((o) => (
        <section key={o.slug} className="mb-16">
          <div className="flex items-center gap-4">
            <span className="chip text-ink">{o.name}</span>
            <span className="h-0 flex-1 border-t-[1.5px] border-dashed border-[var(--line)]" />
          </div>
          <Reveal className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {STAFF.filter((s) => s.office === o.slug).map((s) => (
              <StaffCard key={s.slug} s={s} lang={lang} />
            ))}
          </Reveal>
        </section>
      ))}
    </InnerPage>
  );
}

export function staffMetadata(lang: Lang, slug: string): Metadata {
  const s = STAFF.find((x) => x.slug === slug);
  if (!s) return {};
  return pageMeta({ lang, path: `/employees/${slug}/`, title: `${s.name} – ${s.title}`, description: `${s.name}'s Profile and Contact Information - ${NAME}` });
}

export function StaffView({ lang, slug }: { lang: Lang; slug: string }) {
  const s = STAFF.find((x) => x.slug === slug);
  if (!s) notFound();
  const o = OFFICES.find((x) => x.slug === s.office)!;
  const ld = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: s.name,
    jobTitle: s.title,
    email: s.email,
    telephone: s.phone,
    worksFor: { "@type": "InsuranceAgency", name: NAME, url: SITE_URL },
    workLocation: { "@type": "Place", name: o.name, address: `${o.street}${o.suite ? ` ${o.suite}` : ""}, ${o.city}, TN ${o.zip}` },
  };
  return (
    <InnerPage
      lang={lang}
      label={`${s.title === "Agent" ? t(lang).agent : s.title} · ${o.city}`.toUpperCase()}
      title={s.name}
      intro={es(lang) ? `Para contactar a ${s.name} directamente, use la información a continuación o el formulario.` : `To contact ${s.name} directly please fill out the following form as completely as possible.`}
      crumbs={[{ name: es(lang) ? "Nuestro personal" : "Our Staff", path: "/employees/" }, { name: s.name, path: `/employees/${s.slug}/` }]}
      aside={<OfficeAside lang={lang} />}
    >
      <JsonLd data={ld} />
      <div className="grid gap-6 md:grid-cols-2">
        <StaffCard s={s} lang={lang} />
        <div className="rounded-[24px] border-[1.5px] border-[var(--line)] p-6">
          <p className="mile text-muted">{o.name}</p>
          <p className="mt-3">{o.street}{o.suite ? `, ${o.suite}` : ""}<br />{o.city}, TN {o.zip}</p>
          <p className="mt-3"><span className="font-semibold">{es(lang) ? "Número de oficina" : "Office Number"}:</span> <a href={`tel:${o.tel}`} className="lane-link font-mono">{o.phone}</a></p>
          <p className="mt-1"><span className="font-semibold">{t(lang).email}:</span> <a href={`mailto:${s.email}`} className="lane-link">{s.email}</a></p>
          <a href={s.vcard} download className="btn btn-line mt-5 min-h-11">{es(lang) ? "Descargar vCard" : "Download vCard"}</a>
        </div>
      </div>
      <div className="mt-14">
        <p className="mile text-red">{es(lang) ? `CONTACTAR A ${s.name.toUpperCase()}` : `CONTACT ${s.name.toUpperCase()}`}</p>
        <div className="mt-6"><MailtoForm lang={lang} /></div>
      </div>
    </InnerPage>
  );
}

/* ───────── Locations ───────── */
export const officeParams = () => OFFICES.map((o) => ({ office: o.slug }));
export const locationsMetadata = (lang: Lang): Metadata =>
  pageMeta({ lang, path: "/locations/", title: es(lang) ? "Nuestras ubicaciones" : "Our Locations", description: "Location Directory and Driving Directions: Murfreesboro Office, 925 S Church St. Suite A300, and Smyrna Office, 244 N Lowry St." });
export function officeMetadata(lang: Lang, slug: string): Metadata {
  const o = OFFICES.find((x) => x.slug === slug);
  if (!o) return {};
  return pageMeta({ lang, path: `/locations/${slug}/`, title: es(lang) ? `Oficina de ${o.city}` : `${o.name} – Driving Directions`, description: `Get Driving Directions to ${o.name} - ${NAME}. ${o.street}${o.suite ? ` ${o.suite}` : ""}, ${o.city}, TN ${o.zip}. ${o.phone}.` });
}

function OfficeBlock({ lang, o, n }: { lang: Lang; o: (typeof OFFICES)[number]; n: number }) {
  const d = t(lang);
  const days = es(lang) ? ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"] : HOURS.days;
  return (
    <section className="grid gap-8 border-t-[1.5px] border-dashed border-[var(--line)] py-12 xl:grid-cols-12" aria-labelledby={`office-${o.slug}`}>
      <div className="xl:col-span-5">
        <p className="font-mono text-sm text-muted">{String(n).padStart(2, "0")}</p>
        <h2 id={`office-${o.slug}`} className="display mt-2 text-5xl">{o.name}</h2>
        <address className="mt-5 not-italic text-lg">{o.street}{o.suite ? `, ${o.suite}` : ""}<br />{o.city}, TN {o.zip}</address>
        <p className="mt-3"><span className="font-semibold">{es(lang) ? "Teléfono" : "Phone Number"}:</span> <a href={`tel:${o.tel}`} className="lane-link font-mono">{o.phone}</a></p>
        <table className="mt-6 w-full max-w-sm text-sm">
          <caption className="mile mb-2 text-left text-muted">{es(lang) ? "Horario de oficina" : "Office Hours"}</caption>
          <tbody>
            {days.map((dd) => (
              <tr key={dd} className="border-b border-[var(--line)]">
                <th scope="row" className="py-2 text-left font-semibold">{dd}</th>
                <td className="py-2 text-right font-mono">{HOURS.label}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-6 text-sm"><span className="font-semibold">{d.staff}:</span>{" "}
          {STAFF.filter((s) => s.office === o.slug).map((s, i, a) => (
            <span key={s.slug}><Link className="lane-link" href={href(lang, `/employees/${s.slug}/`)}>{s.name}</Link>{i < a.length - 1 ? ", " : ""}</span>
          ))}
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <a href={directionsUrl(o)} target="_blank" rel="noopener noreferrer" className="btn btn-ink min-h-11"><Icon name="pin" size={18} /> {es(lang) ? "Cómo llegar" : "Driving Directions"}</a>
          <a href={`tel:${o.tel}`} className="btn btn-line min-h-11"><Icon name="phone" size={18} /> {o.phone}</a>
        </div>
      </div>
      <div className="xl:col-span-6 xl:col-start-7">
        <MapFacade src={mapEmbedUrl(o)} title={`${NAME} – ${o.name}`} label={d.loadMap} />
      </div>
    </section>
  );
}

export function LocationsView({ lang }: { lang: Lang }) {
  return (
    <InnerPage lang={lang} label={t(lang).officesLabel} title={es(lang) ? "Directorio de ubicaciones y cómo llegar" : "Location Directory and Driving Directions"} crumbs={[{ name: es(lang) ? "Ubicaciones" : "Locations", path: "/locations/" }]}>
      {OFFICES.map((o, i) => <OfficeBlock key={o.slug} lang={lang} o={o} n={i + 1} />)}
    </InnerPage>
  );
}

export function OfficeView({ lang, slug }: { lang: Lang; slug: string }) {
  const o = OFFICES.find((x) => x.slug === slug);
  if (!o) notFound();
  return (
    <InnerPage
      lang={lang}
      label={t(lang).officesLabel}
      title={es(lang) ? `Cómo llegar a la oficina de ${o.city}` : `Driving Directions to ${o.name}`}
      crumbs={[{ name: es(lang) ? "Ubicaciones" : "Locations", path: "/locations/" }, { name: o.city, path: `/locations/${o.slug}/` }]}
    >
      <OfficeBlock lang={lang} o={o} n={OFFICES.indexOf(o) + 1} />
    </InnerPage>
  );
}

/* ───────── Contact ───────── */
export const contactMetadata = (lang: Lang): Metadata =>
  pageMeta({ lang, path: "/contact/", title: es(lang) ? "Contáctenos" : "Contact Us", description: "Contact Tennessee Auto Insurance Agency via the web! Murfreesboro (615) 893-6177 · Smyrna (615) 624-8007 · auto@insuringyouforless.com" });

export function ContactView({ lang }: { lang: Lang }) {
  const d = t(lang);
  return (
    <InnerPage
      lang={lang}
      label={d.contactLabel}
      title={es(lang) ? "Contáctenos" : "Contact Us"}
      intro={
        es(lang) ? (
          <>¡Contacte a Tennessee Auto Insurance Agency vía esta página web! Para contactarnos directamente, por favor llene el siguiente formulario tan completamente como sea posible.</>
        ) : (
          <>Contact Tennessee Auto Insurance Agency via the web! To contact Tennessee Auto Insurance Agency directly, please fill out the following form as completely as possible. When finished, click the Submit button to send your contact request. You will receive a response from us shortly.</>
        )
      }
      crumbs={[{ name: es(lang) ? "Contáctenos" : "Contact Us", path: "/contact/" }]}
      aside={
        <div className="grid gap-4">
          <OfficeAside lang={lang} />
          <div className="rounded-[24px] border-[1.5px] border-[var(--line)] p-6 text-sm">
            <p>{d.fax}: <span className="font-mono">{FAX}</span></p>
            <p className="mt-1">{d.email}: <a className="lane-link" href={`mailto:${EMAIL}`}>{EMAIL}</a></p>
          </div>
        </div>
      }
    >
      <MailtoForm lang={lang} />
      <div className="mt-16">
        <p className="mile text-red">{es(lang) ? "UBICACIONES DE OFICINA" : "OFFICE LOCATIONS"}</p>
        <p className="mt-3 text-muted">{es(lang) ? "Llame o visite la oficina de Tennessee Auto Insurance Agency más cercana." : "Call or visit the nearest Tennessee Auto Insurance Agency location."}</p>
        {OFFICES.map((o, i) => <OfficeBlock key={o.slug} lang={lang} o={o} n={i + 1} />)}
      </div>
      <div className="mt-8">
        <p className="mile text-red">{es(lang) ? "DIRECTORIO DE EMPLEADOS" : "EMPLOYEE DIRECTORY"}</p>
        <Reveal className="mt-6 grid gap-4 sm:grid-cols-2">
          {STAFF.map((s) => <StaffCard key={s.slug} s={s} lang={lang} />)}
        </Reveal>
      </div>
    </InnerPage>
  );
}

/* ───────── Testimonials ───────── */
export const testimonialsMetadata = (lang: Lang): Metadata =>
  pageMeta({ lang, path: "/testimonials/", title: es(lang) ? "Reseñas de clientes" : "Customer Ratings & Reviews", description: `Customer Ratings & Reviews for ${NAME}: ${TESTIMONIALS.overall.reviewCount} reviews.` });

export function TestimonialsView({ lang }: { lang: Lang }) {
  const d = t(lang);
  const o = TESTIMONIALS.overall;
  const items = TESTIMONIALS.items.slice().sort((a, b) => b.date.localeCompare(a.date));
  return (
    <InnerPage
      lang={lang}
      label={d.testimonialsLabel}
      title={es(lang) ? "Calificaciones y reseñas de clientes de Tennessee Auto Insurance Agency" : o.heading || `Customer Ratings & Reviews for ${NAME}`}
      crumbs={[{ name: es(lang) ? "Testimonios" : "Testimonials", path: "/testimonials/" }]}
      englishOnly
      intro={
        <span className="flex flex-wrap items-center gap-4">
          <span className="display text-4xl text-ink">{Number(o.averageRating || 5).toFixed(1)}</span>
          <Stars n={Math.round(Number(o.averageRating || 5))} size={20} />
          <span className="font-mono text-sm">{o.reviewCount} {d.reviews}</span>
          <a href={REVIEW_URL} target="_blank" rel="noopener noreferrer" className="btn btn-red min-h-11">{d.leaveReview}</a>
        </span>
      }
    >
      <ul className="columns-1 gap-4 md:columns-2 xl:columns-3">
        {items.map((r) => (
          <li key={r.id} className="mb-4 break-inside-avoid rounded-[22px] border border-[var(--line)] bg-white p-6">
            <div className="flex items-center justify-between gap-3">
              <Stars n={r.rating} />
              <time dateTime={r.date} className="font-mono text-xs text-muted">{new Date(r.date).toLocaleDateString(es(lang) ? "es-US" : "en-US", { year: "numeric", month: "short", day: "numeric" })}</time>
            </div>
            <blockquote className="mt-4 leading-relaxed">“{r.original}”</blockquote>
            <p className="mt-4 text-sm"><span className="font-semibold">{r.name}</span>, <em className="text-muted">{r.location}</em></p>
          </li>
        ))}
      </ul>
    </InnerPage>
  );
}

/* ───────── Refer a Friend ───────── */
export const referMetadata = (lang: Lang): Metadata =>
  pageMeta({ lang, path: "/refer/", title: es(lang) ? "Recomendar a un amigo" : "Refer a Friend", description: "Refer a friend to Tennessee Auto Insurance Agency. We love referrals!" });

export function ReferView({ lang }: { lang: Lang }) {
  return (
    <InnerPage
      lang={lang}
      label={es(lang) ? "FORMULARIO DE RECOMENDACIÓN" : "REFERRAL FORM"}
      title={es(lang) ? "Recomiende a un amigo a Tennessee Auto Insurance Agency" : "Refer a friend to Tennessee Auto Insurance Agency"}
      intro={
        es(lang)
          ? "¡Nos encantan las recomendaciones! El mejor testimonio que nuestros clientes pueden dar es recomendar a sus amigos y familiares a Tennessee Auto Insurance Agency. Gracias por su recomendación y, aún más, por su preferencia continua."
          : "We love referrals! The greatest testament that our customers can provide is by referring their friends and family to Tennessee Auto Insurance Agency. Thank you for your referral, and we thank you even more for your continued business."
      }
      crumbs={[{ name: es(lang) ? "Recomendar a un amigo" : "Refer a Friend", path: "/refer/" }]}
      aside={<OfficeAside lang={lang} />}
    >
      <MailtoForm lang={lang} variant="refer" />
    </InnerPage>
  );
}
