/**
 * Crawl every internal page of the old site, in English and Spanish (/es-us/),
 * saving raw HTML to migration/raw/<lang>/... and a log to migration/crawl-log.json.
 *
 * - Seeds: home pages, sitemap.xml (+ hreflang alternates), known key pages, glossary A–Z.
 * - BFS over same-host links; every EN page is also tried at /es-us/<path>.
 * - Spanish pages that don't exist under /es-us/ are retried with the
 *   language.aspx?language=2058 session cookie.
 * - Failures (5 retries) fall back to the Wayback Machine, marked "archive".
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import * as cheerio from "cheerio";
import {
  ORIGIN, MIG, Lang, sleep, toKey, langOf, basePath, rawFile, fetchRetry, fetchText, writeJson,
} from "./lib";

type PageLog = {
  lang: Lang;
  key: string; // requested path (with /es-us for Spanish)
  url: string;
  status: number | null;
  source: "live" | "live-session" | "archive" | "failed";
  finalUrl?: string;
  title?: string;
  htmlLang?: string;
  hash?: string;
  file?: string;
  note?: string;
};

const SKIP = [
  /\.axd/i, /^\/scripts\//i, /^\/style/i, /^\/img\//i, /^\/images\//i,
  /\.(css|js|png|jpe?g|gif|svg|webp|ico|pdf|docx?|xlsx?|zip|mp4|woff2?|ttf)(\?|$)/i,
  /language\.aspx/i, /logout|login|admin/i, /^\/search/i,
];
const MAX_PAGES = 3000;

const SEEDS = [
  "/", "/es-us/", "/about/", "/about.aspx", "/locations/", "/locations.aspx", "/employees/",
  "/contact/", "/contact.aspx", "/automobile", "/automobile/", "/commercial_auto", "/commercial_auto/",
  "/motorcycle", "/motorcycle/", "/homeowners", "/homeowners/", "/renters", "/renters/", "/boat", "/boat/",
  "/rv", "/rv/", "/atv/", "/sr_22/", "/category.aspx?id=MISC1", "/testimonials.aspx", "/testimonials/",
  "/claims.aspx", "/claims/", "/payments.aspx", "/payments/", "/links.aspx", "/links/", "/refer/",
  "/privacy/", "/resources/", "/blog/", "/auto-insurance-smyrna/", "/auto-insurance-la-vergne",
  "/auto-insurance-antioch", "/get_a_quote/", "/customer_service/", "/business/", "/content/smyrna",
  ...Array.from("abcdefghijklmnopqrstuvwxyz", (c) => `/glossary/${c}/`),
];

const log = new Map<string, PageLog>(); // key -> log
const LOG_FILE = path.join(MIG, "crawl-log.json");
const prevLog = new Map<string, PageLog>(
  fs.existsSync(LOG_FILE) ? (JSON.parse(fs.readFileSync(LOG_FILE, "utf8")) as PageLog[]).map((p) => [p.key, p]) : [],
);
const queue: string[] = [];
const seen = new Set<string>();
const externalLinks = new Map<string, Set<string>>(); // href -> pages
const assetRefs = new Map<string, Set<string>>(); // asset url -> pages

function enqueue(key: string | null) {
  if (!key) return;
  const lower = key.toLowerCase();
  if (seen.has(lower)) return;
  const p = key.split("?")[0];
  if (SKIP.some((r) => r.test(p))) return;
  seen.add(lower);
  queue.push(key);
}

function enqueueBoth(key: string | null) {
  if (!key) return;
  enqueue(key);
  if (langOf(key) === "en") enqueue("/es-us" + (key.startsWith("/") ? key : "/" + key));
}

async function sitemapSeeds() {
  const res = await fetchText(ORIGIN + "/sitemap.xml");
  if (res?.status !== 200) return [];
  const xml = res.text;
  fs.writeFileSync(path.join(MIG, "raw", "sitemap.xml"), xml);
  const urls = [...xml.matchAll(/(?:<loc>|href=")([^<"]+)/g)].map((m) => m[1].trim());
  return urls;
}

async function robots() {
  const res = await fetchText(ORIGIN + "/robots.txt");
  if (res?.status === 200) fs.writeFileSync(path.join(MIG, "raw", "robots.txt"), res.text);
}

/** Session cookie with Spanish selected (for pages without an /es-us/ variant). */
let esCookie = "";
async function initSpanishSession() {
  const res = await fetchRetry(ORIGIN + "/language.aspx?language=2058", { redirect: "manual" });
  const set = res?.headers.getSetCookie?.() ?? [];
  esCookie = set.map((c) => c.split(";")[0]).join("; ");
}

async function wayback(url: string): Promise<{ html: string; ts: string } | null> {
  const api = await fetchText(`https://archive.org/wayback/available?url=${encodeURIComponent(url)}`, {}, 3, 60000);
  if (api?.status !== 200) return null;
  let c: { timestamp: string; available: boolean } | undefined;
  try {
    c = (JSON.parse(api.text) as { archived_snapshots?: { closest?: { timestamp: string; available: boolean } } }).archived_snapshots?.closest;
  } catch {
    return null;
  }
  if (!c?.available) return null;
  const raw = await fetchText(`https://web.archive.org/web/${c.timestamp}id_/${url}`, {}, 3, 120000);
  if (raw?.status !== 200) return null;
  return { html: raw.text, ts: c.timestamp };
}

function textHash(html: string) {
  const $ = cheerio.load(html);
  $("script,style,noscript,input").remove();
  const t = $("#master_div, body").first().text().replace(/\s+/g, " ").trim();
  return crypto.createHash("sha1").update(t).digest("hex").slice(0, 12);
}

function harvest(html: string, pageUrl: string, key: string) {
  const $ = cheerio.load(html);
  $("a[href], area[href], option[value]").each((_, el) => {
    const raw = ($(el).attr("href") ?? $(el).attr("value") ?? "").trim();
    if (!raw || raw.startsWith("#") || raw.startsWith("javascript:")) return;
    if (/^(mailto|tel|sms):/i.test(raw)) {
      (externalLinks.get(raw) ?? externalLinks.set(raw, new Set()).get(raw)!).add(key);
      return;
    }
    const k = toKey(raw, pageUrl);
    if (k) enqueueBoth(k);
    else if (/^https?:/i.test(raw) || raw.startsWith("//")) {
      (externalLinks.get(raw) ?? externalLinks.set(raw, new Set()).get(raw)!).add(key);
    }
  });
  // Asset references (images, css, icons) for the image downloader
  const addAsset = (u?: string) => {
    if (!u || u.startsWith("data:")) return;
    try {
      const abs = new URL(u.trim(), pageUrl).href;
      (assetRefs.get(abs) ?? assetRefs.set(abs, new Set()).get(abs)!).add(key);
    } catch { /* ignore */ }
  };
  $("img").each((_, el) => {
    for (const a of ["src", "data-src", "data-lazy", "data-original"]) addAsset($(el).attr(a));
    for (const a of ["srcset", "data-srcset"]) {
      ($(el).attr(a) ?? "").split(",").forEach((s) => addAsset(s.trim().split(/\s+/)[0]));
    }
  });
  $("source[srcset]").each((_, el) => ($(el).attr("srcset") ?? "").split(",").forEach((s) => addAsset(s.trim().split(/\s+/)[0])));
  $("link[rel*=icon], link[rel=stylesheet], meta[property='og:image'], meta[name='twitter:image']").each((_, el) =>
    addAsset($(el).attr("href") ?? $(el).attr("content")),
  );
  $("[style*=url]").each((_, el) => {
    for (const m of ($(el).attr("style") ?? "").matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) addAsset(m[1]);
  });
  $("style").each((_, el) => {
    for (const m of $(el).text().matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) addAsset(m[1]);
  });
  $("script:not([src])").each((_, el) => {
    for (const m of $(el).text().matchAll(/["'](\/?[^"'\s]+\.(?:png|jpe?g|gif|webp|svg))["']/gi)) addAsset(m[1]);
  });
}

async function crawlOne(key: string) {
  const lang = langOf(key);
  const url = ORIGIN + encodeURI(key).replace(/%25/g, "%");
  const prev = prevLog.get(key);
  // Resume: reuse a snapshot saved by an earlier run instead of refetching
  const cached = rawFile(lang, key);
  if (prev?.file && fs.existsSync(cached)) {
    log.set(key, prev);
    harvest(fs.readFileSync(cached, "utf8"), prev.finalUrl ?? url, key);
    return;
  }
  if (!prev && fs.existsSync(cached)) {
    const html = fs.readFileSync(cached, "utf8");
    const $ = cheerio.load(html);
    log.set(key, {
      lang, key, url, status: 200, source: "live", finalUrl: url, file: path.relative(MIG, cached),
      title: $("title").first().text().replace(/\s+/g, " ").trim(), htmlLang: $("html").attr("lang"), hash: textHash(html),
    });
    harvest(html, url, key);
    return;
  }
  if (prev && prev.source === "failed" && prev.status !== null && prev.status < 500) {
    log.set(key, prev); // known 404/redirect-to-nothing; don't refetch
    return;
  }

  const entry: PageLog = { lang, key, url, status: null, source: "failed" };
  let html: string | null = null;

  const res = await fetchText(url, { redirect: "follow" });
  if (res) {
    entry.status = res.status;
    entry.finalUrl = res.url;
    if (res.status === 200 && res.type.includes("html")) {
      html = res.text;
      entry.source = "live";
    } else if (res.status === 200) {
      entry.note = "non-html: " + res.type;
      log.set(key, entry);
      return;
    }
  }

  // Spanish page missing under /es-us/: try same EN path with Spanish session cookie
  if (!html && lang === "es-us" && esCookie) {
    const r2 = await fetchText(ORIGIN + encodeURI(basePath(key)), { headers: { Cookie: esCookie } });
    if (r2?.status === 200) {
      html = r2.text;
      entry.source = "live-session";
      entry.status = r2.status;
      entry.finalUrl = r2.url;
    }
  }

  // Wayback fallback for EN pages that hard-failed (not plain 404s on guessed /es-us/ variants)
  if (!html && lang === "en" && (entry.status === null || entry.status >= 500)) {
    const wb = await wayback(url);
    if (wb) {
      html = wb.html;
      entry.source = "archive";
      entry.note = `[ARCHIVE – CONFIRM WITH CLIENT] wayback ${wb.ts}`;
    }
  }

  if (html) {
    const $ = cheerio.load(html);
    entry.title = $("title").first().text().replace(/\s+/g, " ").trim();
    entry.htmlLang = $("html").attr("lang");
    entry.hash = textHash(html);
    const file = rawFile(lang, key);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, html);
    entry.file = path.relative(MIG, file);
    harvest(html, entry.finalUrl ?? url, key);
  }
  log.set(key, entry);
}

async function main() {
  fs.mkdirSync(path.join(MIG, "raw"), { recursive: true });
  await robots();
  await initSpanishSession();
  SEEDS.forEach((s) => enqueueBoth(s));
  for (const u of await sitemapSeeds()) enqueueBoth(toKey(u));

  const CONCURRENCY = 4;
  let done = 0;
  async function worker() {
    while (queue.length && log.size < MAX_PAGES) {
      const key = queue.shift()!;
      const fresh = !prevLog.get(key)?.file;
      try {
        await crawlOne(key);
      } catch (e) {
        log.set(key, { lang: langOf(key), key, url: ORIGIN + key, status: null, source: "failed", note: String(e) });
      }
      done++;
      if (done % 25 === 0) {
        console.log(`[crawl] ${done} done, ${queue.length} queued`);
        writeJson("crawl-log.json", [...prevLog.values(), ...log.values()].filter((v, i, a) => a.findLastIndex((x) => x.key === v.key) === i));
      }
      if (fresh) await sleep(250);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  const pages = [...log.values()].sort((a, b) => a.key.localeCompare(b.key));
  writeJson("crawl-log.json", pages);
  writeJson(
    "links-external.json",
    [...externalLinks].map(([href, p]) => ({ href, pages: [...p].sort() })).sort((a, b) => a.href.localeCompare(b.href)),
  );
  writeJson(
    "assets-found.json",
    [...assetRefs].map(([url, p]) => ({ url, pages: [...p].sort() })).sort((a, b) => a.url.localeCompare(b.url)),
  );
  const by = (l: Lang, s: string) => pages.filter((p) => p.lang === l && p.source === s).length;
  for (const l of ["en", "es-us"] as Lang[]) {
    console.log(
      `${l}: live ${by(l, "live")} · session ${by(l, "live-session")} · archive ${by(l, "archive")} · failed ${by(l, "failed")}`,
    );
  }
}

main();
