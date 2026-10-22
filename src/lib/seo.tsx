import type { Metadata } from "next";
import { altPath, type Lang } from "./i18n";
import { EMAIL, FAX, FOUNDED, HOURS, NAME, OFFICES, SITE_URL, SOCIALS, MAIN } from "./site";

/** Per-page metadata with canonical + hreflang (en-US at /, es-US at /es-us/). */
export function pageMeta({ lang, path, title, description, image }: { lang: Lang; path: string; title?: string; description: string; image?: string }): Metadata {
  const alt = altPath(path);
  const url = lang === "es" ? alt.es : alt.en;
  return {
    // Omit `title` entirely when not given so the layout's default title applies (home page)
    ...(title ? { title } : {}),
    description,
    alternates: {
      canonical: url,
      languages: { "en-US": alt.en, "es-US": alt.es, "x-default": alt.en },
    },
    openGraph: {
      type: "website",
      url,
      siteName: NAME,
      locale: lang === "es" ? "es_US" : "en_US",
      title: title ?? NAME,
      description,
      images: [{ url: image ?? "/og-image.png", width: 1200, height: 630, alt: NAME }],
    },
    twitter: { card: "summary_large_image", site: "@TNAutoInsurance", title: title ?? NAME, description, images: [image ?? "/og-image.png"] },
  };
}

const officeLd = (o: (typeof OFFICES)[number]) => ({
  "@type": "InsuranceAgency",
  "@id": `${SITE_URL}/locations/${o.slug}/#office`,
  name: `${NAME} — ${o.city}`,
  url: `${SITE_URL}/locations/${o.slug}/`,
  telephone: `+1-${o.tel.slice(0, 3)}-${o.tel.slice(3, 6)}-${o.tel.slice(6)}`,
  faxNumber: "+1-615-893-6181",
  email: EMAIL,
  image: `${SITE_URL}/logo.png`,
  priceRange: "$$",
  address: { "@type": "PostalAddress", streetAddress: `${o.street}${o.suite ? `, ${o.suite}` : ""}`, addressLocality: o.city, addressRegion: "TN", postalCode: o.zip, addressCountry: "US" },
  geo: { "@type": "GeoCoordinates", latitude: o.lat, longitude: o.lng },
  openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: HOURS.days, opens: HOURS.opens, closes: HOURS.closes }],
  parentOrganization: { "@id": `${SITE_URL}/#org` },
});

export function orgJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "InsuranceAgency",
        "@id": `${SITE_URL}/#org`,
        name: NAME,
        alternateName: ["TNAIA", "Insuring You For Less"],
        url: `${SITE_URL}/`,
        logo: `${SITE_URL}/logo.png`,
        image: `${SITE_URL}/og-image.png`,
        foundingDate: String(FOUNDED),
        email: EMAIL,
        telephone: "+1-615-893-6177",
        faxNumber: FAX,
        address: { "@type": "PostalAddress", streetAddress: `${MAIN.street}, ${MAIN.suite}`, addressLocality: MAIN.city, addressRegion: "TN", postalCode: MAIN.zip, addressCountry: "US" },
        areaServed: { "@type": "State", name: "Tennessee" },
        knowsLanguage: ["en", "es"],
        sameAs: SOCIALS.map((s) => s.href),
        department: OFFICES.map(officeLd),
      },
    ],
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: `${SITE_URL}${it.path}` })),
  };
}

export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
