/**
 * Typed access to content generated from the old site (migration/scripts/build-content.ts).
 * `html` is the verbatim original body; display-only fixes are applied with `fixTypos`.
 */
import pagesJson from "./generated/pages.json";
import blogJson from "./generated/blog.json";
import glossaryJson from "./generated/glossary.json";
import testimonialsJson from "./generated/testimonials.json";
import staffJson from "./generated/staff.json";
import type { Lang } from "@/lib/i18n";

export type ContentPage = {
  lang: "en" | "es-us";
  path: string;
  oldUrl: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  html: string;
  englishOnly?: boolean;
  spanishH1?: string;
};
export type Post = {
  slug: string;
  oldSlug: string;
  oldUrl: string;
  title: string;
  date: string;
  dateLabel: string;
  tags: string[];
  metaDescription: string;
  excerpt: string;
  image: string | null;
  html: string;
};
export type Testimonial = { id: string; original: string; name: string; location: string; date: string; rating: number };
export type Staff = {
  slug: string;
  name: string;
  title: string;
  office: "murfreesboro" | "smyrna";
  officeName: string;
  phone: string;
  email: string;
  vcard: string;
  photo: string | null;
};

export const PAGES = {
  ...(pagesJson as Record<string, ContentPage>),
  // No ATV page existed on the old site; ATV is only listed on /about/. Placeholder until the client supplies copy.
  "/atv/": {
    lang: "en", path: "/atv/", oldUrl: "", h1: "ATV Insurance", metaTitle: "ATV Insurance", metaDescription: "ATV insurance from Tennessee Auto Insurance Agency in Murfreesboro and Smyrna, TN.",
    html: "<p>We primarily offer auto insurance, but also are available for ATV Insurance.</p><p>[PLACEHOLDER – CONFIRM WITH CLIENT: ATV coverage details]</p><p>Call our office or request a quote and our staff will do the work for you.</p>",
  },
  "/es-us/atv/": {
    lang: "es-us", path: "/es-us/atv/", oldUrl: "", h1: "Seguro de ATV", metaTitle: "Seguro de ATV", metaDescription: "Seguro de ATV de Tennessee Auto Insurance Agency en Murfreesboro y Smyrna, TN.",
    html: "<p>Principalmente ofrecemos seguro de auto, pero también tenemos seguro de ATV. [REVIEW TRANSLATION]</p><p>[PLACEHOLDER – CONFIRM WITH CLIENT: detalles de la cobertura de ATV]</p><p>Llame a nuestra oficina o solicite una cotización y nuestro personal hará el trabajo por usted.</p>",
  },
} as Record<string, ContentPage>;
export const POSTS = (blogJson as Post[]).slice().sort((a, b) => b.date.localeCompare(a.date));
export const GLOSSARY = glossaryJson as { intro: string; letters: { letter: string; terms: { term: string; definition: string }[] }[] };
export const TESTIMONIALS = testimonialsJson as { overall: { heading: string; averageRating: string; reviewCount: string; leaveReviewUrl: string }; items: Testimonial[] };
export const STAFF = staffJson as Staff[];

/** Typos on the old site, fixed for display only (originals stay in the data). */
const TYPOS: [RegExp, string][] = [
  [/\bSymrna\b/g, "Smyrna"],
  [/\bLa Verge\b/g, "La Vergne"],
  [/\boffing\b/g, "offering"],
  [/\byou driver's license\b/g, "your driver's license"],
  [/\byou driver’s license\b/g, "your driver’s license"],
  [/\bAntioquía\b/g, "Antioch"],
];
export const fixTypos = (s: string) => TYPOS.reduce((acc, [re, to]) => acc.replace(re, to), s);

export function getPage(lang: Lang, path: string): ContentPage | undefined {
  return PAGES[(lang === "es" ? "/es-us" : "") + path];
}
/** All generic-page paths for a language, minus the ones with dedicated routes. */
export const DEDICATED_PATHS = ["/refer/", "/get_a_quote/", "/claims/"];
export function genericPaths(lang: Lang): string[] {
  return Object.keys(PAGES)
    .filter((k) => (lang === "es" ? k.startsWith("/es-us/") : !k.startsWith("/es-us/")))
    .map((k) => k.replace(/^\/es-us/, ""))
    .filter((k) => k !== "/" && !DEDICATED_PATHS.includes(k));
}

/** First paragraph of a page, as plain text (verbatim). */
export function firstParagraph(path: string, lang: Lang = "en"): string {
  const p = getPage(lang, path) ?? getPage("en", path);
  if (!p) return "";
  const m = p.html.match(/<p>([\s\S]*?)<\/p>/g) ?? [];
  const text = m.map((x) => x.replace(/<[^>]+>/g, "").trim()).find((x) => x.length > 60) ?? "";
  return fixTypos(text);
}

export const BLOG_PAGE_SIZE = 12;
export const blogPageCount = () => Math.ceil(POSTS.length / BLOG_PAGE_SIZE);
export function allTags() {
  const m = new Map<string, { tag: string; slug: string; count: number }>();
  for (const p of POSTS)
    for (const t of p.tags) {
      const slug = tagSlug(t);
      if (!slug) continue;
      const cur = m.get(slug) ?? { tag: t, slug, count: 0 };
      cur.count++;
      m.set(slug, cur);
    }
  return [...m.values()].sort((a, b) => b.count - a.count);
}
export const tagSlug = (t: string) =>
  t.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export const formatDate = (iso: string, lang: Lang) =>
  new Date(iso).toLocaleDateString(lang === "es" ? "es-US" : "en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
