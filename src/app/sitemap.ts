import type { MetadataRoute } from "next";
import { SITE_URL, OFFICES } from "@/lib/site";
import { POSTS, STAFF, allTags, blogPageCount, genericPaths } from "@/data/content";

export const dynamic = "force-static";

/** Every static page, English + Spanish, with hreflang alternates. Generated at build. */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = new Set<string>([
    "/",
    ...genericPaths("en"),
    "/refer/", "/get_a_quote/", "/claims/", "/carriers/", "/payments/", "/contact/", "/testimonials/",
    "/employees/", ...STAFF.map((s) => `/employees/${s.slug}/`),
    "/locations/", ...OFFICES.map((o) => `/locations/${o.slug}/`),
    "/glossary/", ..."abcdefghijklmnopqrstuvwxyz".split("").map((l) => `/glossary/${l}/`),
    "/blog/", ...Array.from({ length: blogPageCount() - 1 }, (_, i) => `/blog/${i + 2}/`),
    ...POSTS.map((p) => `/blog/${p.slug}/`),
    ...allTags().map((t) => `/blog/tag/${t.slug}/`),
  ]);
  const lastModified = new Date();
  const post = new Map(POSTS.map((p) => [`/blog/${p.slug}/`, new Date(p.date)]));
  return [...paths].flatMap((p) => {
    const en = `${SITE_URL}${p}`;
    const es = `${SITE_URL}/es-us${p === "/" ? "/" : p}`;
    const alternates = { languages: { "en-US": en, "es-US": es } };
    const priority = p === "/" ? 1 : /^\/(automobile|sr_22|content\/tn-drivers|commercial_auto|motorcycle|homeowners|renters|boat|rv|locations|contact)\//.test(p) ? 0.8 : /^\/blog\/tag|^\/glossary\/[a-z]\//.test(p) ? 0.3 : 0.6;
    const lm = post.get(p) ?? lastModified;
    return [
      { url: en, lastModified: lm, priority, alternates },
      { url: es, lastModified: lm, priority: Math.max(0.1, priority - 0.1), alternates },
    ];
  });
}
