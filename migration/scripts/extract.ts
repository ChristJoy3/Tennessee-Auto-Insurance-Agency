/**
 * Extract ALL text, links, form fields and images, verbatim and in reading order,
 * from every crawled page (both languages) into migration/content-inventory.json.
 *
 * - Shared layout (header, menu, footer) is captured once per language as page "_layout".
 * - Blog sidebar (tag cloud, archive) is captured once per language as page "_blog-sidebar".
 * - Duplicate URLs (same canonical / same text) are recorded as aliases, not re-extracted.
 * - Spanish pages are classified: translated | partial | english-fallback | empty | missing.
 */
import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";
import type { AnyNode, Element } from "domhandler";
import { MIG, ORIGIN, Lang, readJson, writeJson, toKey, basePath } from "./lib";

type PageLog = {
  lang: Lang; key: string; url: string; status: number | null; source: string;
  finalUrl?: string; title?: string; hash?: string; file?: string; note?: string;
};

export type InventoryItem = {
  id: string;
  lang: Lang;
  page: string; // logical path without /es-us (e.g. "/sr_22/")
  oldUrl: string;
  order: number;
  type: string; // heading-1..6 | paragraph | list-item | text | table-cell | link | button | form-field | option | image | meta-* | data-*
  originalText: string;
  sourceSelector: string;
  href?: string;
  src?: string;
  alt?: string;
  region: "layout" | "main" | "meta" | "blog-sidebar" | "data";
};

const BLOCK = new Set([
  "h1", "h2", "h3", "h4", "h5", "h6", "p", "li", "dt", "dd", "blockquote", "td", "th", "caption",
  "figcaption", "label", "legend", "div", "section", "article", "header", "footer", "ul", "ol",
  "table", "tbody", "thead", "tr", "form", "nav", "aside", "main", "address", "pre", "hr", "fieldset",
  "select", "option", "button", "textarea", "iframe", "center",
]);
const SKIP_SEL = [
  "script", "style", "noscript", ".aspNetHidden", "input[type=hidden]", ".addthis_toolbox",
  ".RadRating", "[itemprop=itemReviewed]", "meta", "link", "#cph_main_pnlShareThis",
].join(",");

const clean = (s: string) =>
  s.replace(/ /g, " ").replace(/[ \t\r\f\v]+/g, " ").replace(/ *\n */g, "\n").replace(/\n{3,}/g, "\n\n").trim();

function selectorOf($: cheerio.CheerioAPI, el: Element, stop: Element): string {
  const parts: string[] = [];
  let cur: Element | null = el;
  while (cur && cur !== stop && parts.length < 6) {
    const id = $(cur).attr("id");
    const cls = ($(cur).attr("class") ?? "").trim().split(/\s+/).filter(Boolean)[0];
    let part = cur.tagName + (id ? `#${id}` : cls ? `.${cls}` : "");
    if (!id && cur.parent && (cur.parent as Element).children) {
      const sibs = (cur.parent as Element).children.filter((c) => (c as Element).tagName === cur!.tagName);
      if (sibs.length > 1) part += `:nth-of-type(${sibs.indexOf(cur) + 1})`;
    }
    parts.unshift(part);
    if (id) break;
    cur = cur.parent as Element | null;
    if (cur && cur.type !== "tag") break;
  }
  return parts.join(" > ");
}

/** Text that belongs to this block, excluding nested blocks (rendered separately). */
function ownText($: cheerio.CheerioAPI, el: Element): string {
  let out = "";
  const walk = (n: AnyNode) => {
    if (n.type === "text") out += (n as unknown as { data: string }).data;
    else if (n.type === "tag") {
      const t = (n as Element).tagName;
      if (t === "br") out += "\n";
      else if (BLOCK.has(t) || $(n).is(SKIP_SEL) || t === "img" || t === "input") return;
      else (n as Element).children.forEach(walk);
    }
  };
  el.children.forEach(walk);
  return clean(out);
}

const typeOf = (tag: string) =>
  /^h[1-6]$/.test(tag) ? `heading-${tag[1]}`
  : tag === "p" ? "paragraph"
  : tag === "li" ? "list-item"
  : tag === "td" || tag === "th" ? "table-cell"
  : tag === "option" ? "option"
  : tag === "button" ? "button"
  : tag === "label" || tag === "legend" ? "form-label"
  : tag === "blockquote" ? "quote"
  : "text";

function absHref(raw: string, base: string) {
  try {
    return new URL(raw.trim(), base).href;
  } catch {
    return raw;
  }
}

function extractRegion(
  $: cheerio.CheerioAPI, root: Element, push: (i: Omit<InventoryItem, "id" | "order" | "lang" | "page" | "oldUrl" | "region">) => void,
  baseUrl: string,
) {
  const visit = (el: Element) => {
    if ($(el).is(SKIP_SEL)) return;
    const tag = el.tagName;
    const sel = () => selectorOf($, el, root);
    if (tag === "img") {
      const src = $(el).attr("data-src") || $(el).attr("src") || "";
      if (src && !/spacer\.gif|rightArrow\.png/i.test(src))
        push({ type: "image", originalText: clean($(el).attr("alt") ?? ""), src: absHref(src, baseUrl), alt: $(el).attr("alt") ?? "", sourceSelector: sel() });
      return;
    }
    if (tag === "input" || tag === "textarea" || tag === "select") {
      const t = ($(el).attr("type") ?? "").toLowerCase();
      if (t === "hidden") return;
      const id = $(el).attr("id");
      const label = id ? clean($(`label[for="${id}"]`).text()) : "";
      const txt = t === "submit" || t === "button" ? $(el).attr("value") ?? "" : $(el).attr("placeholder") || label || $(el).attr("title") || $(el).attr("aria-label") || "";
      if (t === "submit" || t === "button") {
        if (clean(txt)) push({ type: "button", originalText: clean(txt), sourceSelector: sel() });
      } else push({ type: "form-field", originalText: clean(txt) || `[${t || tag}] ${$(el).attr("name") ?? id ?? ""}`, sourceSelector: sel() });
      if (tag !== "select") return;
    }
    if (tag === "iframe") {
      push({ type: "embed", originalText: $(el).attr("title") ?? "", href: absHref($(el).attr("src") ?? "", baseUrl), sourceSelector: sel() });
      return;
    }
    if (BLOCK.has(tag) || el === root) {
      const own = ownText($, el);
      if (own) {
        const item: Omit<InventoryItem, "id" | "order" | "lang" | "page" | "oldUrl" | "region"> = { type: typeOf(tag), originalText: own, sourceSelector: sel() };
        if (tag === "option" && $(el).attr("value")) item.href = absHref($(el).attr("value")!, baseUrl);
        push(item);
      }
    }
    // Links: every anchor gets its own item (label + URL) so no URL is lost
    if (tag === "a") {
      const href = ($(el).attr("href") ?? $(el).attr("data-src") ?? "").trim();
      if (href && href !== "#" && !href.startsWith("javascript:")) {
        push({ type: "link", originalText: clean($(el).text()) || clean($(el).attr("title") ?? "") || clean($(el).find("img").attr("alt") ?? ""), href: absHref(href, baseUrl), sourceSelector: sel() });
      }
    }
    // Inline background images
    const style = $(el).attr("style") ?? "";
    for (const m of style.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g))
      push({ type: "image", originalText: "", src: absHref(m[1], baseUrl), alt: "", sourceSelector: sel() + " (background)" });
    el.children.forEach((c) => c.type === "tag" && visit(c as Element));
  };
  visit(root);
}

function classifySpanish(esText: string, enText: string): string {
  if (!esText) return "empty";
  if (esText === enText) return "english-fallback";
  const es = (esText.match(/\b(el|la|los|las|de|para|usted|nuestro|nuestra|seguro|póliza|más|que|con|por)\b/gi) ?? []).length;
  const en = (esText.match(/\b(the|and|your|our|insurance|with|for|you|that|this)\b/gi) ?? []).length;
  if (es > en * 2) return "translated";
  if (es > 0) return "partial";
  return "english-fallback";
}

function main() {
  // Listing pages (blog pagination, tag archives) only repeat post excerpts: skip to save memory;
  // the excerpts are captured by structure.ts (teasers) and the URLs by the crawl log.
  const log = readJson<PageLog[]>("crawl-log.json").filter(
    (p) => p.file && !/^\/blog\/(tag\/|\d+\/?$)/i.test(basePath(p.key)) && !/employee_vcf/i.test(p.key),
  );
  const items: InventoryItem[] = [];
  const pages: Record<string, unknown>[] = [];
  const counters = new Map<string, number>();
  const seenCanon = new Map<string, string>(); // lang|canonical|hash -> key

  const mainText = new Map<string, string>(); // lang|basePath -> main text (for ES classification)

  const add = (lang: Lang, page: string, oldUrl: string, region: InventoryItem["region"]) =>
    (i: Omit<InventoryItem, "id" | "order" | "lang" | "page" | "oldUrl" | "region">) => {
      const k = `${lang}|${page}`;
      const order = (counters.get(k) ?? 0) + 1;
      counters.set(k, order);
      items.push({ id: `${lang}:${page}#${order}`, lang, page, oldUrl, order, region, ...i });
    };

  // Shared layout: once per language, from the home page
  for (const lang of ["en", "es-us"] as Lang[]) {
    const home = log.find((p) => p.lang === lang && basePath(p.key) === "/" && p.source.startsWith("live"));
    if (!home) continue;
    const $ = cheerio.load(fs.readFileSync(path.join(MIG, home.file!), "utf8"));
    const push = add(lang, "_layout", home.url, "layout");
    for (const sel of ["#preheader", "#ctl00_rm_upper", "#breadcrumb", "#footerTable"]) {
      const root = $(sel).get(0) as Element | undefined;
      if (root) extractRegion($, root, push, home.url);
    }
    // Blog sidebar (tag cloud + archive tree) once per language
    const blog = log.find((p) => p.lang === lang && basePath(p.key) === "/blog/" && p.file);
    if (blog) {
      const $b = cheerio.load(fs.readFileSync(path.join(MIG, blog.file!), "utf8"));
      const pushB = add(lang, "_blog-sidebar", blog.url, "blog-sidebar");
      $b("[id*=rtc_Blog], [id*=rtv_archive]").filter((_, e) => !/ClientState|_\d+_\d+$/.test($b(e).attr("id") ?? "")).each((_, e) => {
        extractRegion($b, e as Element, pushB, blog.url);
      });
    }
  }

  for (const p of log) {
    const html = fs.readFileSync(path.join(MIG, p.file!), "utf8");
    const $ = cheerio.load(html);
    const canonical = toKey($("link[rel=canonical]").attr("href") ?? "") ?? p.key;
    const page = basePath(p.key.split("?")[0].endsWith("/") || p.key.includes("?") ? p.key : p.key);
    const dedupeKey = `${p.lang}|${p.hash}`;
    const info: Record<string, unknown> = {
      lang: p.lang, key: p.key, page, oldUrl: p.url, source: p.source, status: p.status, finalUrl: p.finalUrl,
      title: p.title, canonical, note: p.note,
    };
    if (seenCanon.has(dedupeKey)) {
      info.aliasOf = seenCanon.get(dedupeKey);
      pages.push(info);
      continue;
    }
    seenCanon.set(dedupeKey, p.key);

    const pushMeta = add(p.lang, page, p.url, "meta");
    pushMeta({ type: "meta-title", originalText: clean($("title").text()), sourceSelector: "head > title" });
    for (const [n, attr] of [["description", "name"], ["keywords", "name"], ["og:title", "property"], ["og:description", "property"]] as const) {
      const v = $(`meta[${attr}="${n}"]`).attr("content");
      if (v && clean(v)) pushMeta({ type: `meta-${n.replace("og:", "og-")}`, originalText: clean(v), sourceSelector: `meta[${attr}=${n}]` });
    }
    const crumb = clean($("#lblBCPage").text());
    if (crumb) pushMeta({ type: "breadcrumb", originalText: crumb, sourceSelector: "#lblBCPage" });

    const push = add(p.lang, page, p.url, "main");
    // Home page keeps product rows + quote dropdown + hero slides in the header table
    if (page === "/") {
      for (const sel of ["#headerHome", "#dropWrapper", "#lobWrapper"]) {
        const r = $(sel).get(0) as Element | undefined;
        if (r) extractRegion($, r, push, p.url);
      }
    }
    // Strip the blog sidebar from post/index pages (captured once above)
    $("[id*=rtc_Blog], [id*=rtv_archive]").remove();
    const root = ($("#ctl00_tdBodyCenter").get(0) ?? $("#master_div").get(0) ?? $("body").get(0)) as Element | undefined;
    if (root) extractRegion($, root, push, p.url);

    const txt = clean($(root!).text()).replace(/\s+/g, " ");
    mainText.set(`${p.lang}|${page}`, txt.slice(0, 4000));
    info.textLength = txt.length;
    pages.push(info);
  }

  // Classify Spanish pages against their English counterparts
  for (const info of pages) {
    if (info.lang !== "es-us" || info.aliasOf) continue;
    const es = mainText.get(`es-us|${info.page}`) ?? "";
    const en = mainText.get(`en|${info.page}`) ?? "";
    info.spanishStatus = classifySpanish(es.replace(/^.{0,80}?\s/, ""), en.replace(/^.{0,80}?\s/, "")) ;
    if (es.length < 200 && en.length > 600) info.spanishStatus = "empty";
  }

  writeJson("content-inventory.json", items);
  writeJson("pages.json", pages);
  const by = (l: Lang) => items.filter((i) => i.lang === l).length;
  console.log(`inventory: ${items.length} items (en ${by("en")}, es ${by("es-us")}) across ${pages.length} URLs`);
  void ORIGIN;
}

main();
