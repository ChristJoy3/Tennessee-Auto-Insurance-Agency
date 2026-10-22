import type { Metadata } from "next";
import Link from "next/link";
import { href, t, type Lang } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";
import { PAYMENT_PORTAL, QUOTE } from "@/lib/site";
import { CARRIERS, LEGACY_LOGOS, LINKS_PAGE_EXTRA } from "@/data/carriers";
import { PRODUCTS } from "@/data/products";
import InnerPage, { OfficeAside } from "@/components/layouts/InnerPage";
import { CarrierTile } from "@/components/sections/Carriers";
import { Icon } from "@/components/ui/Icons";
import { Reveal } from "@/components/ui/Reveal";

const es = (lang: Lang) => lang === "es";
const telHref = (p: string) => `tel:${p.replace(/[^\d]/g, "")}`;

/* ───────── Carriers (old /links.aspx "Helpful Links and Websites") ───────── */
export const carriersMetadata = (lang: Lang): Metadata =>
  pageMeta({ lang, path: "/carriers/", title: es(lang) ? "Nuestras aseguradoras" : "Our Carriers", description: `Helpful Links and Websites: ${CARRIERS.map((c) => c.name).join(", ")}.` });

export function CarriersView({ lang }: { lang: Lang }) {
  return (
    <InnerPage
      lang={lang}
      label={t(lang).carriersLabel}
      title={es(lang) ? "Enlaces y sitios web útiles" : "Helpful Links and Websites"}
      intro={es(lang) ? "Como agencia independiente, representamos a varias aseguradoras." : "As an independent insurance agency, we represent several insurance carriers."}
      crumbs={[{ name: es(lang) ? "Nuestras aseguradoras" : "Our Carriers", path: "/carriers/" }]}
    >
      <Reveal className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {CARRIERS.map((c) => (
          <article key={c.slug} data-reveal-item className="flex flex-col rounded-[24px] border-[1.5px] border-[var(--line)] bg-paper p-5">
            <CarrierTile c={c} className="w-full" />
            <h2 className="mt-5 font-display text-2xl font-bold [font-stretch:108%]">{c.name}</h2>
            <dl className="mt-3 grid gap-2 text-sm">
              {c.claimsPhone && (
                <div className="flex justify-between gap-3"><dt className="text-muted">{es(lang) ? "Reportar un reclamo" : "Report A Claim"}</dt><dd><a className="lane-link font-mono" href={telHref(c.claimsPhone)}>{c.claimsPhone}</a></dd></div>
              )}
              {c.payment?.phone && (
                <div className="flex justify-between gap-3"><dt className="text-muted">{es(lang) ? "Pagos" : "Payments"}</dt><dd className="font-mono">{c.payment.phone.length > 7 ? <a className="lane-link" href={telHref(c.payment.phone)}>{c.payment.phone}</a> : c.payment.phone}</dd></div>
              )}
            </dl>
            <div className="mt-auto flex flex-wrap gap-2 pt-5">
              {c.website && <a href={c.website.href} target="_blank" rel="noopener noreferrer" className="btn btn-line min-h-11 text-sm">{c.website.label} <Icon name="arrowUpRight" size={16} /></a>}
              {c.payment && <a href={c.payment.href} target="_blank" rel="noopener noreferrer" className="btn btn-ink min-h-11 text-sm">{t(lang).makePayment}</a>}
            </div>
          </article>
        ))}
      </Reveal>
      <p className="mt-10 text-sm text-muted">
        {es(lang) ? "Información adicional de First Acceptance:" : "More about First Acceptance:"}{" "}
        <a className="lane-link" href={LINKS_PAGE_EXTRA.firstAcceptanceInfo} target="_blank" rel="noopener noreferrer">{LINKS_PAGE_EXTRA.firstAcceptanceInfo}</a>
      </p>
      <details className="mt-10 rounded-[22px] border border-[var(--line)] p-5">
        <summary className="cursor-pointer font-semibold">{es(lang) ? "Del archivo: otras versiones de logotipos usadas en el sitio anterior" : "From the archive: other logo versions used on the old site"}</summary>
        <ul className="mt-5 flex flex-wrap gap-4">
          {LEGACY_LOGOS.map((l) => (
            <li key={l.src} className="flex h-24 w-48 items-center justify-center rounded-xl bg-white p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={l.src} alt={l.alt} loading="lazy" className="max-h-full max-w-full object-contain" />
            </li>
          ))}
        </ul>
      </details>
    </InnerPage>
  );
}

/* ───────── Payments ───────── */
export const paymentsMetadata = (lang: Lang): Metadata =>
  pageMeta({ lang, path: "/payments/", title: es(lang) ? "Realizar un pago en línea" : "Make a Payment Online", description: "Company Payment Links: the insurance carriers listed may accept credit card or electronic check payments." });

export function PaymentsView({ lang }: { lang: Lang }) {
  const list = CARRIERS.filter((c) => c.payment);
  return (
    <InnerPage
      lang={lang}
      label={es(lang) ? "ENLACES DE PAGO" : "COMPANY PAYMENT LINKS"}
      title={es(lang) ? "Realizar un pago en línea" : "Make a Payment Online"}
      intro={
        es(lang) ? (
          <>Las aseguradoras a continuación pueden aceptar pagos con tarjeta de crédito o cheque electrónico. Haga clic en su aseguradora. Si no encuentra el enlace de pago de su compañía, no dude en <Link className="lane-link text-ink" href={href(lang, "/contact/")}>contactarnos</Link> directamente.</>
        ) : (
          <>The insurance carriers listed below may accept credit card or electronic check payments. Please click on your appropriate carrier below. If you cannot find your appropriate company payment link below, please feel free to <Link className="lane-link text-ink" href={href(lang, "/contact/")}>contact us</Link> directly.</>
        )
      }
      crumbs={[{ name: t(lang).makePayment, path: "/payments/" }]}
      aside={<OfficeAside lang={lang} />}
      wide
    >
      <ul className="grid gap-3">
        {list.map((c) => (
          <li key={c.slug}>
            <a href={c.payment!.href} target="_blank" rel="noopener noreferrer" className="group grid grid-cols-[6rem_1fr_auto] items-center gap-4 rounded-[22px] border-[1.5px] border-[var(--line)] bg-white p-4 transition-colors hover:border-ink md:grid-cols-[9rem_1fr_auto]">
              <span className="flex h-14 items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.logo} alt={`${c.name} logo`} loading="lazy" className="max-h-full max-w-full object-contain" />
              </span>
              <span>
                <span className="block font-display text-lg font-bold [font-stretch:106%]">{c.payment!.label ?? c.name}</span>
                {c.payment!.phone && <span className="block font-mono text-sm text-muted">{es(lang) ? "Teléfono" : "Phone"}: {c.payment!.phone}</span>}
              </span>
              <span className="inline-flex items-center gap-2 text-sm font-semibold">
                <span className="hidden sm:inline">{es(lang) ? "Hacer un pago" : "Make A Payment"}</span>
                <Icon name="arrowUpRight" size={20} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
            </a>
          </li>
        ))}
      </ul>
      <div className="mt-10 rounded-[22px] bg-paper-2 p-6">
        <p className="font-semibold">{es(lang) ? "Portal de pagos en línea de la agencia" : "Agency online payment portal"}</p>
        <a href={PAYMENT_PORTAL} target="_blank" rel="noopener noreferrer" className="btn btn-red mt-4 min-h-11">{t(lang).makePayment} <Icon name="arrowUpRight" size={18} /></a>
      </div>
    </InnerPage>
  );
}

/* ───────── Claims ───────── */
export const claimsMetadata = (lang: Lang): Metadata =>
  pageMeta({ lang, path: "/claims/", title: es(lang) ? "Información de reclamos" : "Claim Information", description: "Carrier links and direct 24/7 claims reporting phone numbers for First Acceptance, Progressive, Haulers, Gainsco, Safeway, Trexis, The General and Preferred." });

export function ClaimsView({ lang }: { lang: Lang }) {
  const list = CARRIERS.filter((c) => c.website);
  return (
    <InnerPage
      lang={lang}
      label={t(lang).reportClaim.toUpperCase()}
      title={es(lang) ? "Información de reclamos" : "Claim Information"}
      intro={es(lang) ? "ENLACES DE ASEGURADORAS Y REPORTE DIRECTO DE RECLAMOS 24/7" : "CARRIER LINKS AND DIRECT 24/7 CLAIMS REPORTING"}
      crumbs={[{ name: t(lang).reportClaim, path: "/claims/" }]}
      aside={<OfficeAside lang={lang} />}
      wide
    >
      <div className="prose-content max-w-none">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">{es(lang) ? "COMPAÑÍA Y CONTACTO #" : "COMPANY & CONTACT #"}</th>
                <th scope="col">{es(lang) ? "SITIO WEB" : "WEBSITE"}</th>
              </tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.slug}>
                  <td>
                    <strong>{c.name}</strong>
                    {c.claimsPhone && (<><br /><a href={telHref(c.claimsPhone)} className="font-mono">{c.claimsPhone}</a></>)}
                  </td>
                  <td><a href={c.website!.href} target="_blank" rel="noopener noreferrer">{c.website!.label}</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </InnerPage>
  );
}

/* ───────── Quote forms ───────── */
export const quoteMetadata = (lang: Lang): Metadata =>
  pageMeta({ lang, path: "/get_a_quote/", title: es(lang) ? "Formularios de cotización" : "Quote Forms", description: "Looking for coverage? Click any of the following links to submit a quote for quick, accurate and affordable rates." });

export function QuoteView({ lang }: { lang: Lang }) {
  return (
    <InnerPage
      lang={lang}
      label={es(lang) ? "FORMULARIOS DE COTIZACIÓN DISPONIBLES" : "AVAILABLE QUOTE FORMS"}
      title={es(lang) ? "Formularios de cotización" : "Quote Forms"}
      intro={es(lang) ? "¿Busca cobertura? Haga clic en cualquiera de los siguientes enlaces para solicitar una cotización rápida, precisa y accesible." : "Looking for coverage? Click any of the following links to submit a quote for quick, accurate and affordable rates."}
      crumbs={[{ name: t(lang).quote, path: "/get_a_quote/" }]}
    >
      <Reveal className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {PRODUCTS.map((p) => {
          const link = p.quote ?? href(lang, `/contact/?type=${encodeURIComponent(p.inquiry)}`);
          const ext = !!p.quote;
          return (
            <a key={p.slug} id={p.slug === "commercial-auto" ? "commercial_auto" : p.slug === "homeowners" ? "homeowners" : p.slug} data-reveal-item href={link} target={ext ? "_blank" : undefined} rel={ext ? "noopener noreferrer" : undefined} className="group flex min-h-48 scroll-mt-28 flex-col justify-between rounded-[24px] border-[1.5px] border-ink p-6 transition-colors hover:border-red hover:bg-red hover:text-white">
              <div className="flex items-start justify-between">
                <Icon name={p.icon} size={44} />
                <Icon name="arrowUpRight" size={22} />
              </div>
              <div>
                <p className="display text-3xl">{p.name[lang]}</p>
                <p className="mt-1 text-sm opacity-80">{ext ? (es(lang) ? "Cotización en línea" : "Online quote") : es(lang) ? "Solicitar por correo · o llámenos" : "Request by email · or call us"}</p>
              </div>
            </a>
          );
        })}
      </Reveal>
      <p className="mt-10 max-w-2xl text-sm text-muted">
        {es(lang)
          ? "Las cotizaciones en línea de auto y propiedad se completan en el formulario seguro de nuestro proveedor. Para otras coberturas, envíenos sus datos o llame al (615) 893-6177."
          : "Online auto and property quotes are completed on our quote provider's secure form. For other coverages, send us your details or call (615) 893-6177."}{" "}
        <a className="lane-link text-ink" href={QUOTE.auto} target="_blank" rel="noopener noreferrer">{es(lang) ? "Cotización de auto" : "Auto Insurance Quote"}</a>
      </p>
    </InnerPage>
  );
}
export { OfficeAside };
