/**
 * Build the site's generated content from the crawl (verbatim; nothing rewritten):
 *   src/data/generated/pages.json      every old content page → new path, sanitized HTML (EN + ES)
 *   src/data/generated/blog.json       every blog post (EN; ES flagged as English-only on the old site)
 *   src/data/generated/glossary.json   every glossary term (A–Z)
 * Internal links are rewritten to the new URLs, images to local /images/... files.
 */
import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";
import { MIG, ROOT, ORIGIN, readJson, basePath, toKey } from "./lib";
import { mapPath } from "./build-redirects";

type PageInfo = { lang: "en" | "es-us"; key: string; page: string; oldUrl: string; source: string; title?: string; aliasOf?: string; spanishStatus?: string };
type Log = { key: string; file?: string; lang: string };
type Img = { url: string; public?: string; duplicateOf?: string; alts?: string[]; shows?: string };

const OUT = path.join(ROOT, "src", "data", "generated");
const imgs = readJson<Img[]>("images.json");
const imgMap = new Map<string, string>();
for (const i of imgs) {
  const pub = i.public ?? imgs.find((x) => x.url === i.duplicateOf)?.public;
  if (pub) imgMap.set(i.url.toLowerCase(), pub);
}
const files = new Map(readJson<Log[]>("crawl-log.json").filter((l) => l.file).map((l) => [l.key, l.file!]));

/** Pages rendered by dedicated components (their content comes from structured data). */
const DEDICATED = /^\/($|blog\/|glossary\/|employees\/|profile\/|contact(\/|\.aspx)|locations(\/|\.aspx)|testimonials|links|payments|carriers|employee_vcf|language\.aspx|default\.aspx)/i;
/** Junk URLs the old server answered with 200 (template links, dropdown values). */
const JUNK = /\/(AK|AmericanStaffordshireTerrier)$|\/contact\/\d+|category\.aspx\?id=MISC2|_quote\.aspx|insurance_quote\.aspx|car_insurance_quote/i;

export function newHref(raw: string, base: string, lang: string): string {
  const href = raw.trim();
  if (/^(mailto:|tel:|#)/i.test(href)) return href;
  if (/^http:\/\/https\/\//i.test(href)) return href.replace(/^http:\/\/https\/\//i, "https://"); // typo on old site
  const k = toKey(href, base);
  if (!k) return href;
  const m = mapPath(basePath(k));
  if (!m) return href;
  if (/^https?:/.test(m.to) || m.to.endsWith(".vcf") || m.to.endsWith(".xml")) return m.to;
  return (lang === "es-us" ? "/es-us" : "") + m.to;
}

let inlineCount = 0;
const inlineSeen = new Map<string, string>();
/** Base64 images pasted into blog posts → real files in public/images/blog/. */
function saveInline(src: string, page: string): string | null {
  const m = src.match(/^data:image\/(png|jpe?g|gif|webp);base64,(.+)$/i);
  if (!m) return null;
  const key = m[2].slice(0, 200) + m[2].length;
  if (inlineSeen.has(key)) return inlineSeen.get(key)!;
  const slug = page.replace(/^.*\/blog\//, "").replace(/\.aspx.*$/, "").replace(/[^a-z0-9-]+/gi, "-").toLowerCase().slice(0, 60) || "page";
  const ext = m[1].toLowerCase().replace("jpeg", "jpg");
  const name = `blog-${slug}-inline-${String(++inlineCount).padStart(2, "0")}.${ext}`;
  const dir = path.join(ROOT, "public", "images", "blog");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, name), Buffer.from(m[2], "base64"));
  const pub = `/images/blog/${name}`;
  inlineSeen.set(key, pub);
  return pub;
}

function localImg(src: string, base: string): string | null {
  if (!src || src.startsWith("file:")) return null;
  if (src.startsWith("data:")) return saveInline(src, base);
  let abs: string;
  try {
    abs = new URL(src.trim(), base).href;
  } catch {
    return null;
  }
  return imgMap.get(abs.toLowerCase()) ?? null;
}

const dropped: { page: string; what: string }[] = [];

function sanitizeBody($: cheerio.CheerioAPI, root: cheerio.Cheerio<any>, base: string, lang: string, page: string) {
  root.find("script,style,noscript,meta,link,input,select,textarea,button,iframe,.RadRating,.addthis_toolbox,[id*=ClientState],.aspNetHidden,o\\:p,xml").remove();
  root.find("[id*=rfv],[id*=rev],[id*=cv_],.validator,[id*=Validator]").remove();
  root.find("img[alt='Secured by SSL'], img[src*=rapidssl], img[alt*='get a quote button' i]").each((_, el) => {
    // quote-button images become a plain text link (the parent <a> keeps its href)
    if (/quote/i.test($(el).attr("alt") ?? "")) $(el).replaceWith("Get a Quote");
    else $(el).remove();
  });
  root.find("h1").first().remove(); // rendered as the page title
  root.find("img").each((_, el) => {
    const src = $(el).attr("data-src") || $(el).attr("src") || "";
    const pub = localImg(src, base);
    if (!pub) {
      dropped.push({ page, what: `image ${src}` });
      $(el).remove();
      return;
    }
    const alt = $(el).attr("alt") ?? "";
    const info = imgs.find((i) => i.public === pub);
    $(el).replaceWith(`<img src="${pub}" data-orig="${pub.includes('-inline-') ? 'inline' : ''}" alt="${(alt && !/^(icon|image|logo|carrier|thumbnail)$/i.test(alt) ? alt : info?.shows ?? alt).replace(/"/g, "&quot;")}" loading="lazy">`);
  });
  root.find("a").each((_, el) => {
    const h = $(el).attr("href");
    if (h) $(el).attr("href", newHref(h, base, lang));
  });
  root.find("*").each((_, el) => {
    const e = el as unknown as { attribs: Record<string, string>; tagName: string };
    const keep: Record<string, string> = {};
    if (e.tagName === "a" && e.attribs.href) {
      keep.href = e.attribs.href;
      if (/^https?:/.test(keep.href) && !keep.href.includes("insuringyouforless.com")) {
        keep.target = "_blank";
        keep.rel = "noopener noreferrer";
      }
    }
    if (e.tagName === "img") Object.assign(keep, { src: e.attribs.src, alt: e.attribs.alt ?? "", loading: "lazy" });
    if (/^(td|th)$/.test(e.tagName)) {
      if (e.attribs.colspan) keep.colspan = e.attribs.colspan;
      if (e.attribs.rowspan) keep.rowspan = e.attribs.rowspan;
    }
    e.attribs = keep;
  });
  root.find("span,font,div,center,section,blockquote:not(:has(p))").each((_, el) => {
    $(el).replaceWith($(el).contents());
  });
  root.find("table").each((_, el) => {
    $(el).wrap('<div class="table-wrap"></div>');
  });
  let html = (root.html() ?? "")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .replace(/<(p|h[2-6]|li|strong|b|em)>\s*<\/\1>/g, "")
    .replace(/(<br\s*\/?>\s*){3,}/g, "<br><br>")
    .trim();
  // Text not wrapped in any block becomes a paragraph
  if (html && !/^</.test(html)) html = `<p>${html}`;
  return html;
}

function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const pages = readJson<PageInfo[]>("pages.json");
  const out: Record<string, Record<string, unknown>> = {};
  const skipped: string[] = [];

  for (const p of pages) {
    if (p.aliasOf || p.source === "failed") continue;
    const bp = basePath(p.key);
    if (DEDICATED.test(bp) || JUNK.test(bp) || /^\/blog\//.test(bp)) continue;
    const m = mapPath(bp);
    if (!m || /^https?:/.test(m.to) || m.to.includes("#") || m.to === "/" || m.to === "/contact/") {
      skipped.push(p.key);
      continue;
    }
    const file = files.get(p.key);
    if (!file) continue;
    const $ = cheerio.load(fs.readFileSync(path.join(MIG, file), "utf8"));
    const root = $("#ctl00_tdBodyCenter").first();
    const h1 = $("#ctl00_tdBodyCenter h1").first().text().replace(/\s+/g, " ").trim();
    const html = sanitizeBody($, root, p.oldUrl, p.lang, bp);
    const newPath = (p.lang === "es-us" ? "/es-us" : "") + m.to;
    if (out[newPath] && String(out[newPath].html).length >= html.length) continue; // keep the richest duplicate
    out[newPath] = {
      lang: p.lang,
      path: newPath,
      oldUrl: p.oldUrl,
      h1,
      metaTitle: $("title").text().replace(/\s+/g, " ").trim(),
      metaDescription: $("meta[name=description]").attr("content")?.trim() ?? "",
      html,
      spanishStatus: p.lang === "es-us" ? p.spanishStatus : undefined,
    };
  }

  // Spanish pages that are empty / English on the old site: use the English page, flagged
  for (const [k, v] of Object.entries(out)) {
    if (v.lang !== "es-us") continue;
    const en = out[k.replace(/^\/es-us/, "")];
    if (en && (v.spanishStatus === "empty" || v.spanishStatus === "english-fallback" || String(v.html).length < 200)) {
      out[k] = { ...en, lang: "es-us", path: k, h1: v.h1 || en.h1, html: String(en.html).replace(/href="\/(?!es-us)/g, 'href="/es-us/'), englishOnly: true, spanishH1: v.h1 };
    }
  }
  // Every EN page gets an ES twin
  for (const [k, v] of Object.entries(out)) {
    if (v.lang === "en" && !out["/es-us" + k]) out["/es-us" + k] = { ...v, lang: "es-us", path: "/es-us" + k, html: String(v.html).replace(/href="\/(?!es-us)/g, 'href="/es-us/'), englishOnly: true };
  }
  fs.writeFileSync(path.join(OUT, "pages.json"), JSON.stringify(out, null, 1));

  // Blog
  const blog = readJson<{ posts: Record<string, string | string[]>[]; teasers: Record<string, string>[] }>("structured/blog.json");
  const posts = blog.posts
    .filter((p) => p.lang === "en")
    .map((p) => {
      const $ = cheerio.load(`<div id="r">${p.bodyHtml}</div>`);
      const html = sanitizeBody($, $("#r"), String(p.oldUrl), "en", String(p.oldUrl));
      const teaser = blog.teasers.find((t) => t.slug === p.slug && t.lang === "en");
      const firstImg = html.match(/<img src="([^"]+)"/)?.[1] ?? null;
      return {
        slug: String(p.cleanSlug),
        oldSlug: p.slug,
        oldUrl: p.oldUrl,
        title: p.title,
        date: p.datePublished,
        dateLabel: p.dateLabel,
        tags: p.tags,
        metaDescription: p.metaDescription,
        excerpt: teaser?.excerpt ?? "",
        image: firstImg,
        html,
      };
    });
  fs.writeFileSync(path.join(OUT, "blog.json"), JSON.stringify(posts, null, 1));

  // Glossary
  const g = readJson<{ lang: string; letter: string; intro: string; terms: { term: string; definition: string }[] }[]>("structured/glossary.json").filter((x) => x.lang === "en");
  fs.writeFileSync(path.join(OUT, "glossary.json"), JSON.stringify({ intro: g[0]?.intro ?? "", letters: g.map((x) => ({ letter: x.letter, terms: x.terms })) }, null, 1));

  fs.writeFileSync(path.join(MIG, "content-dropped.json"), JSON.stringify({ dropped, skipped }, null, 2));
  const en = Object.values(out).filter((v) => v.lang === "en").length;
  console.log(`pages: ${en} EN + ${Object.keys(out).length - en} ES · blog ${posts.length} · glossary letters ${g.length} · dropped images ${dropped.length}`);
  void ORIGIN;
}
main();
